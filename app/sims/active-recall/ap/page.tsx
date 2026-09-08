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
  const [difficulty, setDifficulty] = useState(() => {
    const requestedDifficulty = searchParams.get("difficulty") || "easy";
    return DIFFICULTY_OPTIONS.some((option) => option.value === requestedDifficulty) ? requestedDifficulty : "easy";
  });
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

  useEffect(() => {
    const requestedDifficulty = searchParams.get("difficulty");
    if (!requestedDifficulty || requestedDifficulty === difficulty) {
      return;
    }
    if (DIFFICULTY_OPTIONS.some((option) => option.value === requestedDifficulty)) {
      setDifficulty(requestedDifficulty);
    }
  }, [difficulty, searchParams]);

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
    // Local override, not just the redoMissedOnly state: if the redo queue turns out to be
    // exhausted below, we fall back to regular pooled practice within this same call. An
    // earlier version called setRedoMissedOnly(false) and then re-invoked next() via
    // setTimeout — but that recursive call was the *same render's* closure, which had
    // already captured redoMissedOnly as true, so it re-hit this exact branch forever
    // (a silent, permanent "Loading question" freeze with the checkbox flipping off but
    // no question ever loading). Resolving it in-line avoids stale closures entirely.
    let effectiveRedoMissedOnly = redoMissedOnly;
    const liveRedoIds = effectiveRedoMissedOnly ? getRedoQuestionIds({ difficulty }) : [];
    if (effectiveRedoMissedOnly && liveRedoIds.length === 0) {
      setLoadError("No missed questions are queued for this mode yet.");
      return;
    }
    const filteredRedoIds = liveRedoIds.filter(
      (questionId) => questionId !== currentQuestion?.id && !previousQuestions.some((prev) => prev?.id === questionId),
    );
    if (effectiveRedoMissedOnly && liveRedoIds.length > 0 && filteredRedoIds.length === 0) {
      setRedoMissedOnly(false);
      effectiveRedoMissedOnly = false;
    }

    const unseenPoolIds = !effectiveRedoMissedOnly
      ? activePoolIds.filter((questionId) => questionId !== currentQuestionId && !historyIds.has(questionId) && !scopeSeen[questionId])
      : [];
    const shouldRestartFreshRound = !effectiveRedoMissedOnly && activePoolIds.length > 0 && unseenPoolIds.length === 0 && Object.keys(scopeSeen).length > 0;
    const freshRoundIds = shouldRestartFreshRound ? activePoolIds.filter((questionId) => questionId !== currentQuestionId) : [];
    const requestQuestionIds = effectiveRedoMissedOnly
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
        if (!effectiveRedoMissedOnly && nextQuestion.id) {
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
          eyebrow="All-unit MCQ review"
          align="start"
          title="Mixed AP Biology multiple-choice across the full course."
          description="Choose a mode, then work through one question at a time with per-choice explanations and a redo queue for misses."
          actions={
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <SecondaryLink href="/sims/active-recall">Back to practice</SecondaryLink>
              <SecondaryLink href="/sims/mcq?difficulty=statistics">Statistics MCQs</SecondaryLink>
            </div>
          }
        />
        <LoadingSkeleton title="Loading review" lines={5} />
      </main>
    );
  }

  return (
    <main className="grid gap-6">
      <PageHeader
        eyebrow="All-unit MCQ review"
        align="start"
        title="Mixed AP Biology multiple-choice across the full course."
        description="Use Foundation for core cleanup, AP-Style for harder conceptual pressure, and Experiment for data interpretation."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <SecondaryLink href="/sims/active-recall">Back to practice</SecondaryLink>
            <SecondaryLink href="/sims/active-recall/unit">Switch to unit review</SecondaryLink>
            <SecondaryLink href="/sims/mcq?difficulty=statistics">Statistics MCQs</SecondaryLink>
          </div>
        }
      />

      <SectionCard title="Session setup" description="Pick the level of pressure you want, then work through one question at a time.">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <label className="text-sm font-semibold text-[color:var(--ink)]">Mode</label>
              <p className="mt-1 text-sm text-[color:var(--ink-faint)]">{difficultyDescription}</p>
              <div className="mt-2.5 rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2">
                <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="w-full bg-transparent text-sm font-medium text-[color:var(--ink)] outline-none">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2.5">
                <ModeBadge label={difficultyLabel} tone={difficultyTone === "slate" ? "neutral" : difficultyTone} />
              </div>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <label className="text-sm font-semibold text-[color:var(--ink)]">Redo queue</label>
              <p className="mt-1 text-sm text-[color:var(--ink-faint)]">Prioritize questions you missed before.</p>
              <label className="mt-2.5 flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3">
                <input type="checkbox" checked={redoMissedOnly} onChange={(event) => setRedoMissedOnly(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[color:var(--brand)]" />
                <span>
                  <span className="block text-sm font-semibold text-[color:var(--ink)]">Redo missed questions only</span>
                  <span className="mt-0.5 block text-xs text-[color:var(--ink-faint)]">{`${redoCount} questions currently queued.`}</span>
                </span>
              </label>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Questions completed" value={progressSnapshot.totalAttempts ?? 0} detail="All recorded MCQ attempts" />
            <StatCard label="Accuracy" value={progressSnapshot.totalAccuracy === null ? "No data" : `${Math.round(progressSnapshot.totalAccuracy * 100)}%`} detail="Overall across the dashboard" tone="blue" />
            <StatCard label="Missed queue" value={redoCount} detail="Available for this mode" tone="amber" />
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
        <SectionCard title="Question">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <ModeBadge label={difficultyLabel} tone={difficultyTone === "slate" ? "neutral" : difficultyTone} />
              {question.topic ? (
                <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-muted)]">
                  {question.topic}
                </span>
              ) : null}
            </div>

            {question.experiment ? (
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-faint)]">Experiment</div>
                <p className="mt-1.5 text-sm leading-6 text-[color:var(--ink)]">{question.experiment}</p>
              </div>
            ) : null}

            {question.image ? (
              <div className="overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--border)] bg-white p-3">
                <img
                  src={question.image.startsWith("/") ? question.image : `/${question.image}`}
                  alt={question.image_alt || "Question image"}
                  className="max-h-[320px] w-full rounded-[var(--radius-sm)] object-contain"
                  loading="lazy"
                />
                {question.image_alt ? <p className="mt-2.5 text-sm text-[color:var(--ink-faint)]">{question.image_alt}</p> : null}
              </div>
            ) : null}

            <h2 className="text-lg font-semibold leading-7 tracking-tight text-[color:var(--ink)]">{question.text}</h2>

            <div className="grid gap-2.5" role="radiogroup" aria-label="Answer choices">
              {question.choices?.map((choice: string, index: number) => {
                const isDisabled = selected !== null;
                const isCorrectChoice = index === question.correct;
                const isWrongSelected = selected === index && !isCorrectChoice;
                const choiceClass = selected !== null
                  ? isCorrectChoice
                    ? "border-[color:var(--success)]/40 bg-[color:var(--success-soft)] text-[color:var(--ink)]"
                    : isWrongSelected
                      ? "border-[color:var(--danger)]/40 bg-[color:var(--danger-soft)] text-[color:var(--ink)]"
                      : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink-muted)]"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-muted)]";

                return (
                  <div key={index} className="grid gap-1.5">
                    <div className="flex items-stretch gap-2">
                      <button
                        onClick={() => {
                          setSelected(index);
                          setVisibleExplanations({ [index]: true });
                          recordMcqAttempt(question, { selectedIndex: index, mode: "ap", unit: difficulty === "statistics" ? String(question.topic || "Statistics") : undefined });
                          refreshProgress();
                        }}
                        disabled={isDisabled}
                        aria-pressed={selected === index}
                        className={`min-h-[44px] flex-1 rounded-[var(--radius-md)] border px-4 py-3 text-left text-sm leading-6 shadow-[var(--shadow-sm)] transition disabled:cursor-default ${choiceClass} ${crossedOut[index] ? "opacity-50 line-through" : ""}`}
                      >
                        <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {choice}
                      </button>

                      {!isDisabled ? (
                        <button
                          onClick={() => setCrossedOut((current) => ({ ...current, [index]: !current[index] }))}
                          aria-label={crossedOut[index] ? `Uncross option ${String.fromCharCode(65 + index)}` : `Cross out option ${String.fromCharCode(65 + index)}`}
                          className={`min-h-[44px] w-11 shrink-0 rounded-[var(--radius-md)] border text-sm font-semibold transition ${crossedOut[index] ? "border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] text-[color:var(--ink)]" : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--ink-faint)] hover:bg-[color:var(--surface-muted)]"}`}
                        >
                          {crossedOut[index] ? "↩" : "✕"}
                        </button>
                      ) : (
                        <button
                          onClick={() => setVisibleExplanations((current) => ({ ...current, [index]: !current[index] }))}
                          className="shrink-0 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-xs font-semibold text-[color:var(--ink-muted)] transition hover:bg-[color:var(--surface-muted)]"
                        >
                          {visibleExplanations[index] ? "Hide why" : "Why?"}
                        </button>
                      )}
                    </div>

                    {visibleExplanations[index] && selected !== null ? (
                      <div className={`rounded-[var(--radius-md)] border px-4 py-2.5 text-sm leading-6 ${isCorrectChoice ? "border-[color:var(--success)]/30 bg-[color:var(--success-soft)] text-[color:var(--ink)]" : isWrongSelected ? "border-[color:var(--danger)]/30 bg-[color:var(--danger-soft)] text-[color:var(--ink)]" : "border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--ink-muted)]"}`}>
                        {choiceExplain(index)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 border-t border-[color:var(--border)] pt-4">
              <SecondaryButton onClick={previous} disabled={previousQuestions.length === 0}>
                Previous question
              </SecondaryButton>
              <PrimaryButton onClick={() => void next()} disabled={selected === null}>
                Next question
              </PrimaryButton>
            </div>
          </div>
        </SectionCard>
      ) : null}
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
