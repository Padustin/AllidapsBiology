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
