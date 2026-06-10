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

export const SAMPLE_TOPICS: Record<string, string[]> = {
  [UNITS[0]]: ["Water properties", "pH and buffers"],
  [UNITS[1]]: ["Membrane structure", "Organelles"],
  [UNITS[2]]: ["ATP production", "Photosynthesis basics"],
  [UNITS[3]]: ["Cell signaling", "Cell cycle checkpoints"],
  [UNITS[4]]: ["Mendelian ratios", "Chromosome behavior"],
  [UNITS[5]]: ["Transcription", "Regulation of expression"],
  [UNITS[6]]: ["Selection pressures", "Genetic drift"],
  [UNITS[7]]: ["Energy flow", "Population dynamics"],
};

export function makeQuestion(topic: string, difficulty: string) {
  function pick(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (difficulty === "easy") {
    const correct = `${topic} — basic definition`;
    const close = `A close but incorrect definition of ${topic}`;
    const related = `A related concept: ${pick(["related mechanism", "related structure", "related process"])}.`;
    const unrelated = `An unrelated term (distractor)`;
    const choices = [correct, close, related, unrelated];
    const q = {
      id: `${topic}-easy-${Math.random().toString(36).slice(2, 7)}`,
      text: `Which choice best matches the definition of "${topic}"?`,
      choices,
      correct: 0,
      explain: `Correct: ${correct}. The second option is a subtle but incorrect phrasing; the third is related but not the definition; the fourth is unrelated.`,
      experiment: null,
      choice_explanations: [] as string[],
    };
    q.choice_explanations = choices.map((ch, idx) => idx === q.correct ? q.explain : `Incorrect. ${ch} is not the best definition.`);
    return q;
  }

  if (difficulty === "hard") {
    const scenario = `A short scenario where ${topic} is relevant.`;
    const correct = `The most likely outcome given ${topic}`;
    const plausible = `A plausible but less likely outcome`;
    const tempting = `A tempting distractor that reflects a common misconception`;
    const wrong = `An outcome inconsistent with ${topic}`;
    const choices = [correct, plausible, tempting, wrong];
    const q = {
      id: `${topic}-hard-${Math.random().toString(36).slice(2, 7)}`,
      text: `${scenario} Which outcome is best supported by biological principles?`,
      choices,
      correct: 0,
      explain: `Correct: ${correct}. ${topic} leads to this result because of underlying mechanism; the other options are either less consistent or reflect common misreadings.`,
      experiment: null,
      choice_explanations: [] as string[],
    };
    q.choice_explanations = choices.map((ch, idx) => idx === q.correct ? q.explain : `Incorrect. ${ch} is less consistent with ${topic}.`);
    return q;
  }

  // analysis: include a short experiment description and data summary
  const iv = pick(["temperature", "concentration of solute", "enzyme concentration", "light intensity"]);
  const dv = pick(["reaction rate", "membrane potential", "growth rate", "photosynthetic output"]);
  const exp = `Researchers manipulated ${iv} and measured ${dv} across two groups; the treatment group showed a 30% higher ${dv} compared to control.`;
  const correct = `The statement that correctly interprets the experimental data`;
  const distractor1 = `A misinterpretation that confuses correlation with causation`;
  const distractor2 = `A plausible but unsupported alternative explanation`;
  const distractor3 = `An unrelated conclusion not supported by the data`;
  const choices = [correct, distractor1, distractor2, distractor3];
  return {
    id: `${topic}-analysis-${Math.random().toString(36).slice(2, 7)}`,
    text: `Read the experiment summary and choose the best interpretation about "${topic}".`,
    choices,
    correct: 0,
    explain: `Correct: ${correct}. The experimental result (treatment increased ${dv}) supports this interpretation because ...`,
    experiment: exp,
  };
}

// If a generated question lacks per-choice explanations, this helper creates them.
export function ensureChoiceExplanations(q: any) {
  if (!q) return q;
  if (!q.choice_explanations || q.choice_explanations.length !== (q.choices || []).length) {
    // For fixed dataset questions that provide one canonical explanation,
    // show that same explanation regardless of which option was selected.
    q.choice_explanations = (q.choices || []).map(() => q.explain || "No explanation provided.");
  }
  return q;
}
