export const UNITS = [
  "Unit 1. Chemistry of Life",
  "Unit 2. Cells",
  "Unit 3. Cellular Energetics",
  "Unit 4. Cell Communication and Cell Cycle",
  "Unit 5. Heredity",
  "Unit 6. Gene Expression and Regulation",
  "Unit 7. Natural Selection",
  "Unit 8. Ecology",
];

export const STATISTICS_UNIT_OPTIONS = [
  "Hardy-Weinberg",
  "Water potential",
  "Surface area : volume",
  "Rate and slope",
  "Chi-square",
  "P-value",
  "95% confidence interval",
  "Standard deviation",
];

export const STATISTICS_TOPIC_TO_DATASET_FILE = {
  "hardy-weinberg": "hardy_weinberg_mcqs.json",
  "water potential": "water_potential_mcqs.json",
  "surface area : volume": "surface_area_volume_mcqs.json",
  "rate and slope": "rate_and_slope_mcqs.json",
  "chi-square": "chisquare_mcqs.json",
  "p-value": "pvalue_mcqs.json",
  "95% confidence interval": "95_confidence_interval_mcqs.json",
  "standard deviation": "standard_deviation_mcqs.json",
} as const;

export function normalizeStatisticsTopic(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

export const DIFFICULTY_ORDER = ["easy", "hard", "analysis", "statistics"] as const;

export const DIFFICULTY_META = {
  easy: {
    label: "Foundation",
    description: "Key vocabulary and core concepts",
    tone: "amber",
  },
  hard: {
    label: "AP-Style",
    description: "Conceptual multiple-choice with realistic distractors",
    tone: "blue",
  },
  analysis: {
    label: "Experiment",
    description: "Graphs, setups, and data interpretation",
    tone: "teal",
  },
  statistics: {
    label: "Statistics",
    description: "Quantitative AP Biology MCQs across Hardy-Weinberg, chi-square, p-values, confidence intervals, and more",
    tone: "rose",
  },
} as const;

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: DIFFICULTY_META.easy.label,
  hard: DIFFICULTY_META.hard.label,
  analysis: DIFFICULTY_META.analysis.label,
  statistics: DIFFICULTY_META.statistics.label,
};

export function isPlaceholderDifficulty(value: string) {
  return value === "statistics";
}

export const DIFFICULTY_OPTIONS = DIFFICULTY_ORDER.map((value) => ({
  value,
  label: DIFFICULTY_LABELS[value],
}));

export function getDifficultyDescription(value: string) {
  if (value in DIFFICULTY_META) {
    return DIFFICULTY_META[value as keyof typeof DIFFICULTY_META].description;
  }

  return "Focused AP Biology practice.";
}

export function getDifficultyTone(value: string) {
  if (value in DIFFICULTY_META) {
    return DIFFICULTY_META[value as keyof typeof DIFFICULTY_META].tone;
  }

  return "slate";
}

export const FRQ_VARIANT_META = {
  ap: {
    label: "AP-Style",
    description: "Free-response practice with structured prompts and scoring notes",
    tone: "blue",
  },
  "active-recall": {
    label: "Foundation",
    description: "Shorter response checks for rapid concept recall",
    tone: "amber",
  },
} as const;

export const FRQ_VARIANT_OPTIONS = Object.entries(FRQ_VARIANT_META).map(([value, meta]) => ({
  value,
  label: meta.label,
  description: meta.description,
}));

export function getFrqVariantDescription(value: string) {
  if (value in FRQ_VARIANT_META) {
    return FRQ_VARIANT_META[value as keyof typeof FRQ_VARIANT_META].description;
  }

  return "Free-response practice for AP Biology.";
}

export function getFrqVariantTone(value: string) {
  if (value in FRQ_VARIANT_META) {
    return FRQ_VARIANT_META[value as keyof typeof FRQ_VARIANT_META].tone;
  }

  return "slate";
}

// If a question lacks per-choice explanations, this helper creates them.
export function ensureChoiceExplanations(q: any) {
  if (!q) return q;
  if (!q.choice_explanations || q.choice_explanations.length !== (q.choices || []).length) {
    // For fixed dataset questions that provide one canonical explanation,
    // show that same explanation regardless of which option was selected.
    q.choice_explanations = (q.choices || []).map(() => q.explain || "No explanation provided.");
  }
  return q;
}
