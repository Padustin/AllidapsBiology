"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LoadingSkeleton,
  ModeBadge,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SecondaryLink,
  SectionCard,
  StatCard,
  TipCard,
} from "../../../components/ui/study-kit";
import { getRedoQuestionIds, readStudyProgressSnapshot, recordMcqAttempt, STUDY_PROGRESS_EVENT } from "../progress";
import { buildSimilarityAvoidIds } from "../question-rotation";
import { DIFFICULTY_OPTIONS, getDifficultyDescription, getDifficultyTone } from "../shared";

type SessionTone = "blue" | "teal" | "amber" | "slate" | "rose";

function normalizeTone(value: string): SessionTone {
  const tone = getDifficultyTone(value);
  if (tone === "blue" || tone === "teal" || tone === "amber" || tone === "slate" || tone === "rose") {
    return tone;
  }
  return "slate";
}

function PageContent() {
  const searchParams = useSearchParams();
  const [difficulty, setDifficulty] = useState("easy");
  const [question, setQuestion] = useState<any | null>(null);
  const [previousQuestions, setPreviousQuestions] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [crossedOut, setCrossedOut] = useState<Record<number, boolean>>({});
  const [visibleExplanations, setVisibleExplanations] = useState<Record<number, boolean>>({});
  const [seen, setSeen] = useState<Record<string, Record<string, true>>>({});
  const [poolIds, setPoolIds] = useState<string[]>([]);
  const [redoMissedOnly, setRedoMissedOnly] = useState(() => searchParams.get("redo") === "1");
  const [redoCount, setRedoCount] = useState(0);
  const [progressSnapshot, setProgressSnapshot] = useState<any | null>(null);
  const STORAGE_KEY = "ar-seen";

  const difficultyLabel = DIFFICULTY_OPTIONS.find((option) => option.value === difficulty)?.label ?? difficulty;
  const difficultyDescription = getDifficultyDescription(difficulty);
  const difficultyTone = normalizeTone(difficulty);

  function refreshProgress() {
    setProgressSnapshot(readStudyProgressSnapshot());
    setRedoCount(getRedoQuestionIds({ difficulty }).length);
  }

  async function refreshPool(nextDifficulty = difficulty) {
    try {
      const res = await fetch(`/api/ar-pool?mode=ap&difficulty=${encodeURIComponent(nextDifficulty)}`);
      const data = await res.json();
      const ids = Array.isArray(data?.ids) ? data.ids.map((id: unknown) => String(id)) : [];
      setPoolIds(ids);
      return ids;
    } catch {
      setPoolIds([]);
      return [];
    }
  }

  useEffect(() => {
    setProgressSnapshot(readStudyProgressSnapshot());
  }, []);

  async function next(poolIdsOverride?: string[]) {
    const currentQuestion = question;
    setQuestion(null);
    setSelected(null);
    setCrossedOut({});
    setVisibleExplanations({});
    setLoadError(null);
    const scopeKey = `AP::${difficulty}`;
    const scopeSeen = (seen && seen[scopeKey]) || {};
    const currentQuestionId = currentQuestion?.id ? String(currentQuestion.id) : null;
    const historyIds = new Set(previousQuestions.map((prev) => String(prev?.id || "")));
    const activePoolIds = poolIdsOverride || poolIds;
    const liveRedoIds = redoMissedOnly ? getRedoQuestionIds({ difficulty }) : [];
    if (redoMissedOnly && liveRedoIds.length === 0) {
      setLoadError("No missed questions are queued for this mode yet.");
      return;
    }
    const filteredRedoIds = liveRedoIds.filter(
      (questionId) => questionId !== currentQuestion?.id && !previousQuestions.some((prev) => prev?.id === questionId),
    );
    if (redoMissedOnly && liveRedoIds.length > 0 && filteredRedoIds.length === 0) {
      setRedoMissedOnly(false);
      setTimeout(() => {
        void next();
      }, 0);
      return;
    }

    const unseenPoolIds = !redoMissedOnly
      ? activePoolIds.filter((questionId) => questionId !== currentQuestionId && !historyIds.has(questionId) && !scopeSeen[questionId])
      : [];
    const shouldRestartFreshRound = !redoMissedOnly && activePoolIds.length > 0 && unseenPoolIds.length === 0 && Object.keys(scopeSeen).length > 0;
    const freshRoundIds = shouldRestartFreshRound ? activePoolIds.filter((questionId) => questionId !== currentQuestionId) : [];
    const requestQuestionIds = redoMissedOnly
      ? filteredRedoIds.length > 0
        ? filteredRedoIds
        : liveRedoIds
      : unseenPoolIds.length > 0
        ? unseenPoolIds
        : freshRoundIds.length > 0
          ? freshRoundIds
          : undefined;
    const { recentQuestionIds, avoidSimilarToQuestionIds } = buildSimilarityAvoidIds({
      currentQuestion,
      previousQuestions,
      seenQuestionIds: Object.keys(scopeSeen),
      shouldRestartFreshRound,
    });

    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ap",
          difficulty,
          questionIds: requestQuestionIds,
          recentQuestionIds,
          avoidSimilarToQuestionIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setLoadError("Questions are loading too quickly right now. Please wait a moment and try again.");
          return;
        }
        throw new Error(typeof data?.error === "string" ? data.error : "Failed to load question.");
      }
      if (data?.question) {
        const nextQuestion = data.question;
        if (!redoMissedOnly && nextQuestion.id) {
          const nextQuestionId = String(nextQuestion.id);
          setSeen((current) => ({
            ...current,
            [scopeKey]: shouldRestartFreshRound
              ? { [nextQuestionId]: true }
              : { ...(current[scopeKey] || {}), [nextQuestionId]: true },
          }));
        }
        if (currentQuestion) {
          if (shouldRestartFreshRound) {
            setPreviousQuestions([currentQuestion]);
          } else {
            setPreviousQuestions((prev) => [...prev, currentQuestion]);
          }
        }
        try {
          const { ensureChoiceExplanations } = await import("../shared");
          setQuestion(ensureChoiceExplanations(nextQuestion));
        } catch {
          setQuestion(nextQuestion);
        }
        return;
      }
    } catch {
      setLoadError("Unable to load questions right now. Please try again.");
      return;
    }

    if (activePoolIds.length > 0) {
      setLoadError("Unable to load a new question right now. Please try again.");
      return;
    }

    setLoadError("No fixed questions are available for this mode yet.");
  }

  function previous() {
    setLoadError(null);
    setSelected(null);
    setCrossedOut({});
    setVisibleExplanations({});
    setPreviousQuestions((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setQuestion(last);
      return prev.slice(0, -1);
    });
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const scopeKey = `AP::${difficulty}`;
        const isFlat = Object.values(parsed).every((value: any) => value === true || value === false);
        if (isFlat) {
          setSeen({ [scopeKey]: parsed });
        } else {
          setSeen(parsed);
        }
      }
    } catch {
      // ignore storage read issues
    }
    void (async () => {
      const ids = await refreshPool();
      await next(ids);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void (async () => {
      setPreviousQuestions([]);
      const ids = await refreshPool();
      await next(ids);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
    } catch {
      // ignore storage write issues
    }
  }, [seen]);

  useEffect(() => {
    refreshProgress();
    const handleRefresh = () => refreshProgress();
    window.addEventListener(STUDY_PROGRESS_EVENT, handleRefresh as EventListener);
    window.addEventListener("storage", handleRefresh);
    return () => {
      window.removeEventListener(STUDY_PROGRESS_EVENT, handleRefresh as EventListener);
      window.removeEventListener("storage", handleRefresh);
    };
  }, [difficulty]);

  function choiceExplain(index: number) {
    if (!question) return null;
    if (question.choice_explanations && question.choice_explanations[index]) return question.choice_explanations[index];
    if (index === question.correct) return question.explain || "Correct option.";
    return "Incorrect. This option is not the best choice.";
  }

  if (progressSnapshot === null) {
    return (
      <main className="grid gap-4">
        <PageHeader
          eyebrow="All-Unit MCQ Review"
          title="Mixed AP Biology multiple-choice across the full course."
          description="Choose a mode, then work through one question at a time with per-choice explanations and a redo queue for misses."
          actions={<SecondaryLink href="/sims/active-recall">Back to dashboard</SecondaryLink>}
        />
        <LoadingSkeleton title="Loading review" lines={5} />
      </main>
    );
  }

  return (
    <main className="grid gap-6 lg:gap-8">
      <PageHeader
        eyebrow="All-Unit MCQ Review"
        title="Mixed AP Biology multiple-choice across the full course."
        description="Use Foundation for core cleanup, AP-Style for harder conceptual pressure, and Experiment for data interpretation and setup reading."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <SecondaryLink href="/sims/active-recall">Back to dashboard</SecondaryLink>
            <SecondaryLink href="/sims/active-recall/unit">Switch to unit review</SecondaryLink>
          </div>
        }
        aside={
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Current mode" value={difficultyLabel} detail={difficultyDescription} tone={difficultyTone === "slate" ? "neutral" : difficultyTone} />
            <StatCard label="Redo queue" value={redoCount} detail={redoMissedOnly ? "Redo missed questions is on" : "Toggle redo mode to revisit misses"} tone="amber" />
            <StatCard label="Current streak" value={progressSnapshot.currentStreak ?? 0} detail="Consecutive correct answers" tone="teal" />
          </div>
        }
      />

      <SectionCard
        title="Session setup"
        description="Pick the level of pressure you want, then work through one question at a time. Questions are rotated to avoid near-duplicates showing up back-to-back."
        tone={difficultyTone}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="text-sm font-semibold text-slate-900">Mode</label>
              <p className="mt-1 text-sm text-slate-500">Switch between fast recall, harder multiple-choice, and experiment interpretation.</p>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3">
                <ModeBadge label={difficultyLabel} tone={difficultyTone === "slate" ? "neutral" : difficultyTone} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="text-sm font-semibold text-slate-900">Redo queue</label>
              <p className="mt-1 text-sm text-slate-500">Use this when you want the session to prioritize questions you missed before.</p>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <input type="checkbox" checked={redoMissedOnly} onChange={(event) => setRedoMissedOnly(event.target.checked)} className="mt-1 h-4 w-4" />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">Redo missed questions only</span>
                  <span className="mt-1 block text-sm text-slate-500">{redoCount} questions currently queued for this mode.</span>
                </span>
              </label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Questions completed" value={progressSnapshot.totalAttempts ?? 0} detail="All recorded MCQ attempts" />
            <StatCard label="Accuracy" value={progressSnapshot.totalAccuracy === null ? "No data" : `${Math.round(progressSnapshot.totalAccuracy * 100)}%`} detail="Overall across the dashboard" tone="blue" />
            <StatCard label="Missed queue" value={redoCount} detail="Available for this mode right now" tone="amber" />
          </div>
        </div>
      </SectionCard>

      {!question && loadError ? (
        <SectionCard title="Question unavailable" description={loadError} tone="rose">
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={() => void next()}>Try again</PrimaryButton>
            <SecondaryButton onClick={() => setRedoMissedOnly(false)} disabled={!redoMissedOnly}>
              Turn off redo mode
            </SecondaryButton>
          </div>
        </SectionCard>
      ) : null}

      {!question && !loadError ? <LoadingSkeleton title="Loading question" lines={4} /> : null}

      {question ? (
        <SectionCard
          title="Question"
          description="Cross out distractors if you need to narrow the field, then use the explanation toggle to inspect why each option worked or failed."
          tone={difficultyTone}
        >
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <ModeBadge label={difficultyLabel} tone={difficultyTone === "slate" ? "neutral" : difficultyTone} />
              {question.topic ? (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                  {question.topic}
                </span>
              ) : null}
            </div>

            {question.experiment ? (
              <div className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Experiment</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{question.experiment}</p>
              </div>
            ) : null}

            {question.image ? (
              <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white p-3 shadow-sm">
                <img
                  src={question.image.startsWith("/") ? question.image : `/${question.image}`}
                  alt={question.image_alt || "Question image"}
                  className="max-h-[320px] w-full rounded-xl object-contain"
                />
                {question.image_alt ? <p className="mt-3 text-sm text-slate-500">{question.image_alt}</p> : null}
              </div>
            ) : null}

            <div className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">{question.text}</h2>

              <div className="mt-5 grid gap-3">
                {question.choices?.map((choice: string, index: number) => {
                  const isDisabled = selected !== null;
                  const isCorrectChoice = index === question.correct;
                  const isWrongSelected = selected === index && !isCorrectChoice;
                  const choiceClass = selected !== null
                    ? isCorrectChoice
                      ? "border-slate-300 bg-slate-100 text-[#1f5a32]"
                      : isWrongSelected
                        ? "border-slate-300 bg-slate-100"
                        : "border-slate-200 bg-white"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50";

                  return (
                    <div key={index} className="grid gap-2">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          onClick={() => {
                            setSelected(index);
                            setVisibleExplanations({ [index]: true });
                            recordMcqAttempt(question, { selectedIndex: index, mode: "ap" });
                            refreshProgress();
                          }}
                          disabled={isDisabled}
                          className={`flex-1 rounded-2xl border px-4 py-3 text-left text-sm text-slate-800 shadow-sm transition ${choiceClass} ${crossedOut[index] ? "opacity-55 line-through" : ""}`}
                        >
                          <span className="font-semibold text-slate-950">{String.fromCharCode(65 + index)}.</span> {choice}
                        </button>

                        <button
                          onClick={() => setCrossedOut((current) => ({ ...current, [index]: !current[index] }))}
                          aria-label={crossedOut[index] ? "Uncross option" : "Cross out option"}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition ${crossedOut[index] ? "border-slate-300 bg-slate-100 text-slate-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                        >
                          {crossedOut[index] ? "Undo" : "Cross out"}
                        </button>

                        {selected !== null ? (
                          <button
                            onClick={() => setVisibleExplanations((current) => ({ ...current, [index]: !current[index] }))}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition ${visibleExplanations[index] ? "border-slate-300 bg-slate-100 text-[#1f5a32]" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                          >
                            {visibleExplanations[index] ? "Hide explanation" : "Show explanation"}
                          </button>
                        ) : null}
                      </div>

                      {visibleExplanations[index] && selected !== null ? (
                        <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${isCorrectChoice ? "border-slate-300 bg-slate-100 text-[#1f5a32]" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                          {choiceExplain(index)}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {selected !== null ? (
                <div className={`mt-5 rounded-2xl border px-4 py-4 ${selected === question.correct ? "border-slate-300 bg-slate-100" : "border-slate-300 bg-slate-100"}`}>
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Result</div>
                  <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{selected === question.correct ? "Correct" : "Incorrect"}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Per-choice explanations are shown above so you can compare the correct reasoning against the distractors, not just the final answer.</p>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <SecondaryButton onClick={previous} disabled={previousQuestions.length === 0}>
                  Previous question
                </SecondaryButton>
                <PrimaryButton onClick={() => void next()} disabled={selected === null}>
                  Next question
                </PrimaryButton>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <TipCard label="Study tip">Say why the correct option is right and why one distractor is wrong before moving on. That is usually where AP-style gains show up.</TipCard>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="grid gap-4">
          <LoadingSkeleton title="Loading review" lines={5} />
        </main>
      }
    >
      <PageContent />
    </Suspense>
  );
}
