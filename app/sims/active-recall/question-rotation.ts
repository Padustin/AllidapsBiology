type QuestionWithId = {
  id?: string | null;
};

type BuildSimilarityAvoidIdsOptions = {
  currentQuestion: QuestionWithId | null;
  previousQuestions: QuestionWithId[];
  seenQuestionIds?: string[];
  shouldRestartFreshRound?: boolean;
  maxRecentIds?: number;
};

function pushQuestionId(target: string[], question: QuestionWithId | null | undefined) {
  if (!question?.id) return;
  target.push(String(question.id));
}

export function buildSimilarityAvoidIds({
  currentQuestion,
  previousQuestions,
  seenQuestionIds = [],
  shouldRestartFreshRound = false,
  maxRecentIds = 6,
}: BuildSimilarityAvoidIdsOptions) {
  const recentQuestionIds: string[] = [];
  pushQuestionId(recentQuestionIds, currentQuestion);

  for (let index = previousQuestions.length - 1; index >= 0 && recentQuestionIds.length < maxRecentIds; index -= 1) {
    pushQuestionId(recentQuestionIds, previousQuestions[index]);
  }

  const uniqueRecentQuestionIds = Array.from(new Set(recentQuestionIds));
  const avoidSimilarToQuestionIds = Array.from(
    new Set([
      ...(shouldRestartFreshRound ? [] : seenQuestionIds),
      ...uniqueRecentQuestionIds,
    ])
  );

  return {
    recentQuestionIds: uniqueRecentQuestionIds,
    avoidSimilarToQuestionIds,
  };
}