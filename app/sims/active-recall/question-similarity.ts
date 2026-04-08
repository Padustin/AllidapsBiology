export type QuestionSimilarityLike = {
  id?: string;
  topic?: string;
  text?: string;
  image?: string;
  image_alt?: string;
  experiment?: string;
  choices?: string[];
  parts?: Array<{
    label?: string;
    verb?: string;
    prompt?: string;
  }>;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "because",
  "best",
  "by",
  "can",
  "could",
  "define",
  "describe",
  "does",
  "during",
  "each",
  "explain",
  "following",
  "for",
  "from",
  "has",
  "have",
  "how",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "least",
  "likely",
  "most",
  "not",
  "of",
  "on",
  "or",
  "predict",
  "should",
  "shows",
  "shown",
  "statement",
  "that",
  "the",
  "their",
  "there",
  "this",
  "through",
  "to",
  "what",
  "when",
  "which",
  "why",
  "with",
  "would",
]);

function normalizeText(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: unknown) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function buildTokenSet(values: unknown[]) {
  const tokens = new Set<string>();
  for (const value of values) {
    for (const token of tokenize(value)) {
      tokens.add(token);
    }
  }
  return tokens;
}

function getPromptTokenSet(question: QuestionSimilarityLike) {
  const values: unknown[] = [question.text, question.experiment, question.image_alt];
  if (Array.isArray(question.parts)) {
    for (const part of question.parts) {
      values.push(part.label, part.verb, part.prompt);
    }
  }
  return buildTokenSet(values);
}

function getChoiceTokenSet(question: QuestionSimilarityLike) {
  return buildTokenSet(Array.isArray(question.choices) ? question.choices : []);
}

function getIntersectionSize(left: Set<string>, right: Set<string>) {
  let count = 0;
  for (const token of left) {
    if (right.has(token)) count += 1;
  }
  return count;
}

function getJaccardSimilarity(left: Set<string>, right: Set<string>) {
  if (left.size === 0 && right.size === 0) return 0;
  const intersection = getIntersectionSize(left, right);
  const union = left.size + right.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export function getQuestionTopicKey(question: QuestionSimilarityLike) {
  return normalizeText(question.topic);
}

export function areQuestionsTooSimilar(left: QuestionSimilarityLike, right: QuestionSimilarityLike) {
  if (!left || !right) return false;

  const leftId = String(left.id || "");
  const rightId = String(right.id || "");
  if (leftId && rightId && leftId === rightId) return true;

  const leftImage = normalizeText(left.image);
  const rightImage = normalizeText(right.image);
  if (leftImage && rightImage && leftImage === rightImage) return true;

  const leftExperiment = normalizeText(left.experiment);
  const rightExperiment = normalizeText(right.experiment);
  if (leftExperiment && rightExperiment && leftExperiment.length >= 20 && leftExperiment === rightExperiment) {
    return true;
  }

  const leftPromptTokens = getPromptTokenSet(left);
  const rightPromptTokens = getPromptTokenSet(right);
  const promptOverlap = getJaccardSimilarity(leftPromptTokens, rightPromptTokens);
  const sharedPromptTokens = getIntersectionSize(leftPromptTokens, rightPromptTokens);

  const leftChoiceTokens = getChoiceTokenSet(left);
  const rightChoiceTokens = getChoiceTokenSet(right);
  const choiceOverlap = getJaccardSimilarity(leftChoiceTokens, rightChoiceTokens);
  const sharedChoiceTokens = getIntersectionSize(leftChoiceTokens, rightChoiceTokens);

  const leftTopic = getQuestionTopicKey(left);
  const rightTopic = getQuestionTopicKey(right);
  const sameTopic = leftTopic.length > 0 && leftTopic === rightTopic;

  if (sameTopic && sharedPromptTokens >= 4 && promptOverlap >= 0.42) {
    return true;
  }

  if (sharedPromptTokens >= 6 && promptOverlap >= 0.62) {
    return true;
  }

  if (sameTopic && sharedPromptTokens >= 3 && sharedChoiceTokens >= 4 && choiceOverlap >= 0.5) {
    return true;
  }

  return false;
}