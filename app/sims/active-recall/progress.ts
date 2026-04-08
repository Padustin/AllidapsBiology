import { DIFFICULTY_LABELS, DIFFICULTY_ORDER, UNITS } from "./shared";

export const STUDY_PROGRESS_STORAGE_KEY = "apbio-study-progress-v2";
export const STUDY_PROGRESS_EVENT = "apbio-study-progress-updated";

export type StudyAttempt = {
  questionId: string;
  prompt: string;
  topic: string;
  unit: string;
  difficulty: string;
  mode: "ap" | "unit";
  selectedIndex: number;
  correctIndex: number;
  correct: boolean;
  timestamp: number;
};

type StudyProgressStore = {
  version: 2;
  attempts: StudyAttempt[];
};

export type AccuracyRow = {
  label: string;
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number | null;
};

export type WeakTopicRow = {
  topic: string;
  unit: string;
  misses: number;
  total: number;
  accuracy: number | null;
  lastMissAt: number;
};

export type StudyProgressSnapshot = {
  totalAttempts: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalAccuracy: number | null;
  currentStreak: number;
  redoMissedCount: number;
  accuracyByUnit: AccuracyRow[];
  accuracyByUnitDifficulty: Record<string, AccuracyRow[]>;
  weakTopics: WeakTopicRow[];
};

function getEmptyStore(): StudyProgressStore {
  return { version: 2, attempts: [] };
}

function readStore(): StudyProgressStore {
  if (typeof window === "undefined") return getEmptyStore();
  try {
    const raw = window.localStorage.getItem(STUDY_PROGRESS_STORAGE_KEY);
    if (!raw) return getEmptyStore();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.attempts)) return getEmptyStore();
    return {
      version: 2,
      attempts: parsed.attempts.filter((attempt: StudyAttempt) => attempt && typeof attempt.questionId === "string"),
    };
  } catch {
    return getEmptyStore();
  }
}

function writeStore(store: StudyProgressStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STUDY_PROGRESS_STORAGE_KEY, JSON.stringify(store));
}

function inferUnitLabel(questionId?: string, fallbackUnit?: string) {
  if (fallbackUnit) return fallbackUnit;
  if (!questionId) return "Unknown unit";
  const match = questionId.match(/^u(\d+)-/i);
  if (!match) return "Unknown unit";
  const index = Number(match[1]) - 1;
  return UNITS[index] || `Unit ${match[1]}`;
}

function normalizeDifficultyLabel(difficulty?: string) {
  if (!difficulty) return "Unknown";
  return DIFFICULTY_LABELS[difficulty] || difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

function groupAccuracy(labels: string[], attempts: StudyAttempt[], keyGetter: (attempt: StudyAttempt) => string): AccuracyRow[] {
  return labels.map((label) => {
    const matching = attempts.filter((attempt) => keyGetter(attempt) === label);
    const correct = matching.filter((attempt) => attempt.correct).length;
    const total = matching.length;
    return {
      label,
      total,
      correct,
      incorrect: total - correct,
      accuracy: total > 0 ? correct / total : null,
    };
  });
}

function getLatestAttemptByQuestion(attempts: StudyAttempt[]) {
  const latest = new Map<string, StudyAttempt>();
  for (const attempt of attempts) {
    latest.set(attempt.questionId, attempt);
  }
  return latest;
}

export function recordMcqAttempt(
  question: any,
  options: { selectedIndex: number; mode: "ap" | "unit"; unit?: string }
) {
  if (typeof window === "undefined") return;
  if (!question?.id || typeof question.correct !== "number") return;

  const store = readStore();
  const attempt: StudyAttempt = {
    questionId: String(question.id),
    prompt: String(question.text || "Question"),
    topic: String(question.topic || "Uncategorized"),
    unit: inferUnitLabel(question.id, options.unit),
    difficulty: String(question.difficulty || "unknown"),
    mode: options.mode,
    selectedIndex: options.selectedIndex,
    correctIndex: Number(question.correct),
    correct: options.selectedIndex === Number(question.correct),
    timestamp: Date.now(),
  };

  const nextAttempts = [...store.attempts, attempt].slice(-4000);
  writeStore({ version: 2, attempts: nextAttempts });
  window.dispatchEvent(new CustomEvent(STUDY_PROGRESS_EVENT));
}

export function getRedoQuestionIds(filters?: { difficulty?: string; unit?: string }) {
  const store = readStore();
  const latest = getLatestAttemptByQuestion(store.attempts);
  return Array.from(latest.values())
    .filter((attempt) => !attempt.correct)
    .filter((attempt) => !filters?.difficulty || attempt.difficulty === filters.difficulty)
    .filter((attempt) => !filters?.unit || attempt.unit === filters.unit)
    .sort((left, right) => right.timestamp - left.timestamp)
    .map((attempt) => attempt.questionId);
}

export function readStudyProgressSnapshot(): StudyProgressSnapshot {
  const attempts = readStore().attempts;
  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter((attempt) => attempt.correct).length;
  const totalIncorrect = totalAttempts - totalCorrect;
  const latestByQuestion = getLatestAttemptByQuestion(attempts);
  const redoMissedCount = Array.from(latestByQuestion.values()).filter((attempt) => !attempt.correct).length;

  let currentStreak = 0;
  for (let index = attempts.length - 1; index >= 0; index -= 1) {
    if (!attempts[index].correct) break;
    currentStreak += 1;
  }

  const accuracyByUnit = groupAccuracy(UNITS, attempts, (attempt) => attempt.unit);
  const accuracyByUnitDifficulty = Object.fromEntries(
    UNITS.map((unit) => {
      const rows = groupAccuracy(
        [...DIFFICULTY_ORDER],
        attempts.filter((attempt) => attempt.unit === unit),
        (attempt) => attempt.difficulty
      ).map((row) => ({ ...row, label: normalizeDifficultyLabel(row.label) }));
      return [unit, rows];
    })
  ) as Record<string, AccuracyRow[]>;

  const weakTopicMap = new Map<string, WeakTopicRow>();
  for (const attempt of attempts) {
    const key = `${attempt.unit}::${attempt.topic}`;
    const current = weakTopicMap.get(key) || {
      topic: attempt.topic,
      unit: attempt.unit,
      misses: 0,
      total: 0,
      accuracy: null,
      lastMissAt: 0,
    };
    current.total += 1;
    if (!attempt.correct) {
      current.misses += 1;
      current.lastMissAt = Math.max(current.lastMissAt, attempt.timestamp);
    }
    weakTopicMap.set(key, current);
  }

  const weakTopics = Array.from(weakTopicMap.values())
    .filter((row) => row.misses > 0)
    .map((row) => ({ ...row, accuracy: row.total > 0 ? (row.total - row.misses) / row.total : null }))
    .sort((left, right) => {
      if (right.misses !== left.misses) return right.misses - left.misses;
      const leftAccuracy = left.accuracy ?? 1;
      const rightAccuracy = right.accuracy ?? 1;
      if (leftAccuracy !== rightAccuracy) return leftAccuracy - rightAccuracy;
      return right.lastMissAt - left.lastMissAt;
    })
    .slice(0, 8);

  return {
    totalAttempts,
    totalCorrect,
    totalIncorrect,
    totalAccuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : null,
    currentStreak,
    redoMissedCount,
    accuracyByUnit,
    accuracyByUnitDifficulty,
    weakTopics,
  };
}