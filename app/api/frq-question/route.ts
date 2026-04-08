import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { areQuestionsTooSimilar, getQuestionTopicKey } from "../../sims/active-recall/question-similarity";

function parseUnitNumber(unitLabel: string | null) {
  if (!unitLabel) return null;
  const m = unitLabel.match(/Unit\s*(\d+)/i);
  if (!m) return null;
  return Number(m[1]);
}

function parseFrqData(raw: string) {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
  return [];
}

type FrqPart = {
  label: string;
  verb: string;
  prompt: string;
};

type FrqAnswer = {
  answer?: string;
  bullet_points?: string[];
};

type NormalizedFrqQuestion = {
  id?: string;
  unit?: number;
  difficulty?: string;
  topic?: string;
  image?: string;
  image_alt?: string;
  text?: string;
  parts?: FrqPart[];
  answer_key?: Record<string, FrqAnswer>;
  explain?: string;
  part_explanations?: Record<string, string>;
};

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function normalizeUnit(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeImagePath(value: unknown) {
  const imagePath = String(value || "").trim();
  if (!imagePath) return undefined;
  return imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
}

function splitIntoSentences(value: unknown) {
  const text = String(value || "").trim();
  if (!text) return [];

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.length > 0 ? sentences : [text];
}

function groupSentences(sentences: string[], groupCount: number) {
  if (groupCount <= 0) return [];
  if (sentences.length === 0) return Array.from({ length: groupCount }, () => "");
  if (sentences.length < groupCount) {
    return Array.from({ length: groupCount }, () => sentences.join(" "));
  }

  return Array.from({ length: groupCount }, (_, index) => {
    const start = Math.floor((index * sentences.length) / groupCount);
    const end = Math.floor(((index + 1) * sentences.length) / groupCount);
    return sentences.slice(start, Math.max(start + 1, end)).join(" ");
  });
}

function buildPromptIntro(topic: string | undefined, partCount: number) {
  const partLabel = `${partCount} part${partCount === 1 ? "" : "s"}`;
  if (topic) {
    return `Use the image and answer the ${partLabel} about ${topic}.`;
  }
  return `Use the image and answer the ${partLabel}.`;
}

function normalizePromptArrayFrq(question: Record<string, unknown>): NormalizedFrqQuestion | null {
  const prompts = toStringArray(question.prompt);
  if (prompts.length === 0) return null;

  const verbs = toStringArray(question.verbs);
  const scoringGuidelines = toStringArray(question.scoring_guidelines);
  const commonMistakes = toStringArray(question.common_mistakes);
  const sampleAnswer = String(question.sample_answer || "").trim();
  const sentences = splitIntoSentences(sampleAnswer);
  const answerSegments = groupSentences(sentences, prompts.length);

  const parts = prompts.map((prompt, index) => ({
    label: String.fromCharCode(97 + index),
    verb: (verbs[index] || "respond").toLowerCase(),
    prompt,
  }));

  const answerKeyEntries = parts.map((part, index) => {
    const answer: FrqAnswer = {};
    if (answerSegments[index]) {
      answer.answer = answerSegments[index];
    }
    if (scoringGuidelines[index]) {
      answer.bullet_points = [scoringGuidelines[index]];
    }
    return [part.label, answer] as const;
  });

  const partExplanationEntries = parts
    .map((part, index) => [part.label, scoringGuidelines[index]] as const)
    .filter((entry) => Boolean(entry[1]));

  const explainSegments = [String(question.explanation || "").trim()];
  if (commonMistakes.length > 0) {
    explainSegments.push(`Common mistakes: ${commonMistakes.join(" ")}`);
  }

  const topic = question.topic ? String(question.topic) : undefined;

  return {
    id: question.id ? String(question.id) : undefined,
    unit: normalizeUnit(question.unit),
    difficulty: "hard",
    topic,
    image: normalizeImagePath(question.image),
    image_alt: question.image_alt ? String(question.image_alt) : undefined,
    text: buildPromptIntro(topic, parts.length),
    parts,
    answer_key: answerKeyEntries.length > 0 ? Object.fromEntries(answerKeyEntries) : undefined,
    explain: explainSegments.filter(Boolean).join(" "),
    part_explanations: partExplanationEntries.length > 0 ? Object.fromEntries(partExplanationEntries) : undefined,
  };
}

function normalizeFrqQuestion(question: unknown): NormalizedFrqQuestion | null {
  if (!question || typeof question !== "object") return null;

  const record = question as Record<string, unknown>;

  if (Array.isArray(record.parts)) {
    return {
      ...(record as NormalizedFrqQuestion),
      image: normalizeImagePath(record.image),
    };
  }

  if (Array.isArray(record.prompt)) {
    return normalizePromptArrayFrq(record);
  }

  return {
    ...(record as NormalizedFrqQuestion),
    image: normalizeImagePath(record.image),
  };
}

type FrqRequestOptions = {
  mode?: string;
  unit?: string | null;
  difficulty?: string;
  recentQuestionIds?: string[];
  avoidSimilarToQuestionIds?: string[];
};

function buildFrqResponse(options: FrqRequestOptions) {
  const mode = options.mode || "all";
  const unit = options.unit || null;
  const difficulty = options.difficulty || "ap";
  const unitNum = parseUnitNumber(unit);

  const datasetsDir = path.join(process.cwd(), "app", "sims", "active-recall", "datasets");
  const files = fs
    .readdirSync(datasetsDir)
    .filter((fileName) => {
      if (difficulty === "active-recall") {
        return fileName.endsWith(".json") && /active_recall_frq/i.test(fileName);
      }
      return fileName.endsWith(".json") && /frq/i.test(fileName) && !/active_recall/i.test(fileName);
    });

  let candidates: NormalizedFrqQuestion[] = [];
  const questionsById = new Map<string, NormalizedFrqQuestion>();

  for (const fileName of files) {
    try {
      const raw = fs.readFileSync(path.join(datasetsDir, fileName), "utf8");
      const questions = parseFrqData(raw);
      for (const rawQuestion of questions) {
        const question = normalizeFrqQuestion(rawQuestion);
        if (!question) continue;
        if (difficulty !== "active-recall" && !Array.isArray(question.parts)) continue;

        if (question.id) {
          questionsById.set(String(question.id), question);
        }

        if (mode === "unit" && unitNum !== null) {
          if (typeof question.id === "string" && question.id.startsWith(`u${unitNum}-`)) {
            candidates.push(question);
          }
        } else {
          candidates.push(question);
        }
      }
    } catch {
      // ignore malformed files
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json({ error: "No FRQs found.", size: 0 }, { status: 404 });
  }

  const recentQuestions = (options.recentQuestionIds || [])
    .map((id: string) => questionsById.get(String(id)))
    .filter((question): question is NormalizedFrqQuestion => Boolean(question));

  const avoidSimilarQuestions = Array.from(
    new Map(
      (options.avoidSimilarToQuestionIds || [])
        .map((id: string) => {
          const question = questionsById.get(String(id));
          return question ? [String(id), question] : null;
        })
        .filter((entry): entry is [string, NormalizedFrqQuestion] => Boolean(entry))
    ).values()
  );

  const dissimilarCandidates = avoidSimilarQuestions.length > 0
    ? candidates.filter((candidate) => !avoidSimilarQuestions.some((previousQuestion) => areQuestionsTooSimilar(candidate, previousQuestion)))
    : candidates;

  const recentTopicKeys = new Set(
    recentQuestions
      .map((question) => getQuestionTopicKey(question))
      .filter((topicKey): topicKey is string => Boolean(topicKey))
  );

  const topicSpacedCandidates = recentTopicKeys.size > 0
    ? dissimilarCandidates.filter((candidate) => {
        const topicKey = getQuestionTopicKey(candidate);
        return !topicKey || !recentTopicKeys.has(topicKey);
      })
    : dissimilarCandidates;

  if (topicSpacedCandidates.length > 0) {
    candidates = topicSpacedCandidates;
  } else if (dissimilarCandidates.length > 0) {
    candidates = dissimilarCandidates;
  }

  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return NextResponse.json({ question: picked, size: candidates.length });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    return buildFrqResponse({
      mode: url.searchParams.get("mode") || "all",
      unit: url.searchParams.get("unit"),
      difficulty: url.searchParams.get("difficulty") || "ap",
    });
  } catch {
    return NextResponse.json({ error: "Failed to load FRQs.", size: 0 }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    return buildFrqResponse({
      mode: body.mode || "all",
      unit: body.unit || null,
      difficulty: body.difficulty || "ap",
      recentQuestionIds: Array.isArray(body.recentQuestionIds) ? body.recentQuestionIds.map((id: unknown) => String(id)) : [],
      avoidSimilarToQuestionIds: Array.isArray(body.avoidSimilarToQuestionIds)
        ? body.avoidSimilarToQuestionIds.map((id: unknown) => String(id))
        : [],
    });
  } catch {
    return NextResponse.json({ error: "Failed to load FRQs.", size: 0 }, { status: 500 });
  }
}
