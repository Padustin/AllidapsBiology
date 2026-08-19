"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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
import { DIFFICULTY_OPTIONS, STATISTICS_UNIT_OPTIONS, UNITS, getDifficultyDescription, getDifficultyTone, isPlaceholderDifficulty } from "../shared";
import { getRedoQuestionIds, readStudyProgressSnapshot, recordMcqAttempt, STUDY_PROGRESS_EVENT } from "../progress";
import { buildSimilarityAvoidIds } from "../question-rotation";

type SessionTone = "blue" | "teal" | "amber" | "slate" | "rose";
const ALL_UNITS_VALUE = "__all_units__";
const ALL_STATISTICS_TOPICS_VALUE = "__all_statistics_topics__";

function normalizeTone(value: string): SessionTone {
  const tone = getDifficultyTone(value);
  if (tone === "blue" || tone === "teal" || tone === "amber" || tone === "slate" || tone === "rose") {
    return tone;
  }
  return "slate";
}

function inferQuestionUnitLabel(questionId?: string) {
  if (!questionId) return "All units";
  const match = String(questionId).match(/^u(\d+)-/i);
  if (!match) return "All units";
  const index = Number(match[1]) - 1;
  return UNITS[index] ?? `Unit ${match[1]}`;
}

function getAvailableUnitOptions(difficulty: string) {
  return isPlaceholderDifficulty(difficulty) ? STATISTICS_UNIT_OPTIONS : UNITS;
}

function getRequestedUnit(value: string | null, difficulty: string) {
  const availableUnitOptions = getAvailableUnitOptions(difficulty);
  if (!value) {
    return isPlaceholderDifficulty(difficulty) ? ALL_STATISTICS_TOPICS_VALUE : (UNITS[0] ?? ALL_UNITS_VALUE);
  }
  if (isPlaceholderDifficulty(difficulty) && (value === "all" || value === ALL_STATISTICS_TOPICS_VALUE)) {
    return ALL_STATISTICS_TOPICS_VALUE;
  }
  if (!isPlaceholderDifficulty(difficulty) && (value === "all" || value === ALL_UNITS_VALUE)) {
    return ALL_UNITS_VALUE;
  }
  return availableUnitOptions.find((unitOption) => unitOption === value) ?? (isPlaceholderDifficulty(difficulty) ? ALL_STATISTICS_TOPICS_VALUE : (UNITS[0] ?? ALL_UNITS_VALUE));
}

function getRequestedDifficulty(value: string | null) {
  if (!value) return DIFFICULTY_OPTIONS[0]?.value ?? "";
  return DIFFICULTY_OPTIONS.find((option) => option.value === value)?.value ?? (DIFFICULTY_OPTIONS[0]?.value ?? "");
}

function PageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCompactMcq = pathname.startsWith("/sims/mcq");
  const [difficulty, setDifficulty] = useState<string>(() => getRequestedDifficulty(searchParams.get("difficulty")));
  const [unit, setUnit] = useState(() => getRequestedUnit(searchParams.get("unit"), getRequestedDifficulty(searchParams.get("difficulty"))));
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
  const isPlaceholderMode = isPlaceholderDifficulty(difficulty);
  const availableUnitOptions = getAvailableUnitOptions(difficulty);
  const isAllUnits = unit === ALL_UNITS_VALUE;
  const isAllStatisticsTopics = isPlaceholderMode && unit === ALL_STATISTICS_TOPICS_VALUE;
  const isMixedSelection = isAllUnits || isAllStatisticsTopics;
  const selectedUnitLabel = isAllUnits ? "All units" : isAllStatisticsTopics ? "All statistics topics" : unit;
  const questionUnitLabel = isAllUnits ? inferQuestionUnitLabel(question?.id) : isAllStatisticsTopics ? String(question?.topic || "All statistics topics") : selectedUnitLabel;

  useEffect(() => {
    const rawDifficulty = searchParams.get("difficulty");
    if (rawDifficulty) {
      const requestedDifficulty = getRequestedDifficulty(rawDifficulty);
      if (requestedDifficulty !== difficulty) {
        setDifficulty(requestedDifficulty);
      }
    }

    const rawUnit = searchParams.get("unit");
    if (rawUnit) {
      const requestedUnit = getRequestedUnit(rawUnit, rawDifficulty ? getRequestedDifficulty(rawDifficulty) : difficulty);
      if (requestedUnit !== unit) {
        setUnit(requestedUnit);
      }
    }
  }, [difficulty, searchParams, unit]);

  useEffect(() => {
    const normalizedUnit = getRequestedUnit(unit, difficulty);
    if (normalizedUnit !== unit) {
      setUnit(normalizedUnit);
    }
  }, [difficulty, unit]);

  function refreshProgress() {
    setProgressSnapshot(readStudyProgressSnapshot());
    setRedoCount(difficulty ? getRedoQuestionIds(isMixedSelection ? { difficulty } : { unit, difficulty }).length : 0);
  }

  async function refreshPool(nextUnit = unit, nextDifficulty = difficulty) {
    if (!nextDifficulty) {
      setPoolIds([]);
      return [];
    }
    try {
      const isAllUnitsSelection = nextUnit === ALL_UNITS_VALUE || (isPlaceholderDifficulty(nextDifficulty) && nextUnit === ALL_STATISTICS_TOPICS_VALUE);
      const params = new URLSearchParams({
        mode: isAllUnitsSelection ? "ap" : "unit",
        difficulty: nextDifficulty,
      });
      if (!isAllUnitsSelection) {
        params.set("unit", nextUnit);
      }
      const res = await fetch(`/api/ar-pool?${params.toString()}`);
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
    if (!difficulty) {
      setQuestion(null);
      setSelected(null);
      setCrossedOut({});
      setVisibleExplanations({});
      setLoadError("Choose a mode to begin.");
      return;
    }
    setQuestion(null);
    setSelected(null);
    setCrossedOut({});
    setVisibleExplanations({});
    setLoadError(null);
    const scopeKey = `${selectedUnitLabel}::${difficulty}`;
    const scopeSeen = (seen && seen[scopeKey]) || {};
    const currentQuestionId = currentQuestion?.id ? String(currentQuestion.id) : null;
    const historyIds = new Set(previousQuestions.map((prev) => String(prev?.id || "")));
    const activePoolIds = poolIdsOverride || poolIds;
    const liveRedoIds = redoMissedOnly ? getRedoQuestionIds(isMixedSelection ? { difficulty } : { unit, difficulty }) : [];
    if (redoMissedOnly && liveRedoIds.length === 0) {
      setLoadError(isMixedSelection ? "No missed questions are queued for this mode yet." : "No missed questions are queued for this unit and mode yet.");
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
          mode: isMixedSelection ? "ap" : "unit",
          unit: isMixedSelection ? null : unit,
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

    setLoadError(isMixedSelection ? "No fixed questions are available for this mode yet." : "No fixed questions are available for this unit and mode yet.");
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
        const scopeKey = `${selectedUnitLabel}::${difficulty}`;
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
    if (!difficulty) {
      setPoolIds([]);
      setPreviousQuestions([]);
      setQuestion(null);
      setSelected(null);
      setCrossedOut({});
      setVisibleExplanations({});
      setLoadError("Choose a mode to begin.");
      return;
    }
    void (async () => {
      setPreviousQuestions([]);
      const ids = await refreshPool();
      await next(ids);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, difficulty]);

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
  }, [unit, difficulty]);

  function choiceExplain(index: number) {
    if (!question) return null;
    if (question.choice_explanations && question.choice_explanations[index]) return question.choice_explanations[index];
    if (index === question.correct) return question.explain || "Correct option.";
    return "Incorrect. This option is not the best choice.";
  }

  if (progressSnapshot === null) {
    if (isCompactMcq) {
      return (
        <main className="grid gap-4">
          <LoadingSkeleton title="Loading question" lines={5} />
        </main>
      );
    }

    return (
      <main className="grid gap-6">
        <PageHeader
          eyebrow="Unit MCQ review"
          align="start"
          title="Target one AP Biology unit at a time."
          description="Choose a unit, choose a mode, and use explanations plus the redo queue to close specific content gaps fast."
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
    <main className={isCompactMcq ? "grid gap-4" : "grid gap-6"}>
      {!isCompactMcq ? (
      <PageHeader
        eyebrow="Unit MCQ review"
        align="start"
        title="Target one AP Biology unit at a time."
        description="Use this route for reteaching, quiz prep, or focused repair when you know which chapter is costing you points."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <SecondaryLink href="/sims/active-recall">Back to practice</SecondaryLink>
            <SecondaryLink href="/sims/active-recall/ap">Switch to mixed review</SecondaryLink>
            <SecondaryLink href="/sims/mcq?difficulty=statistics">Statistics MCQs</SecondaryLink>
          </div>
        }
      />
      ) : null}

      {!isCompactMcq ? (
      <SectionCard title="Session setup" description="Pick one unit or all units, choose the level of pressure, and work one question at a time.">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <label className="text-sm font-semibold text-[color:var(--ink)]">Unit</label>
              <div className="mt-2.5 rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2">
                <select value={unit} onChange={(event) => setUnit(event.target.value)} className="w-full bg-transparent text-sm font-medium text-[color:var(--ink)] outline-none">
                  {isPlaceholderMode ? <option value={ALL_STATISTICS_TOPICS_VALUE}>All statistics topics</option> : null}
                  {!isPlaceholderMode ? <option value={ALL_UNITS_VALUE}>All units</option> : null}
                  {availableUnitOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <label className="text-sm font-semibold text-[color:var(--ink)]">Mode</label>
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
              <label className="mt-2.5 flex cursor-pointer items-start gap-2.5 rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3">
                <input type="checkbox" checked={redoMissedOnly} onChange={(event) => setRedoMissedOnly(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[color:var(--brand)]" />
                <span>
                  <span className="block text-sm font-semibold text-[color:var(--ink)]">Redo missed only</span>
                  <span className="mt-0.5 block text-xs text-[color:var(--ink-faint)]">{redoCount} queued</span>
                </span>
              </label>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Questions completed" value={progressSnapshot.totalAttempts ?? 0} detail="All recorded MCQ attempts" />
            <StatCard label="Current streak" value={progressSnapshot.currentStreak ?? 0} detail="Consecutive correct answers" tone="teal" />
            <StatCard label="Missed queue" value={redoCount} detail="Available right now" tone="amber" />
          </div>
        </div>
      </SectionCard>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
          <div className="grid gap-2.5 md:grid-cols-3">
            <div className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-faint)]">Unit</label>
              <select value={unit} onChange={(event) => setUnit(event.target.value)} className="w-full bg-transparent text-sm font-medium text-[color:var(--ink)] outline-none">
                {isPlaceholderMode ? <option value={ALL_STATISTICS_TOPICS_VALUE}>All statistics topics</option> : null}
                {!isPlaceholderMode ? <option value={ALL_UNITS_VALUE}>All units</option> : null}
                {availableUnitOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-faint)]">Mode</label>
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="w-full bg-transparent text-sm font-medium text-[color:var(--ink)] outline-none">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2.5">
              <input type="checkbox" checked={redoMissedOnly} onChange={(event) => setRedoMissedOnly(event.target.checked)} className="h-4 w-4 accent-[color:var(--brand)]" />
              <span>
                <span className="block text-sm font-semibold text-[color:var(--ink)]">Redo missed</span>
                <span className="block text-xs text-[color:var(--ink-faint)]">{redoCount} queued</span>
              </span>
            </label>
          </div>
        </div>
      )}

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
              <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-muted)]">
                {questionUnitLabel}
              </span>
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
                          recordMcqAttempt(question, { selectedIndex: index, mode: "unit", unit: isPlaceholderMode ? String(question?.topic || selectedUnitLabel) : isAllUnits ? undefined : unit });
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

      {!isCompactMcq ? <TipCard label="Study tip">If a term or process is slowing you down, define it out loud in one sentence before moving to the next question.</TipCard> : null}
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
