"use client";

import { useEffect, useState } from "react";
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
  VerbBadge,
} from "../../../components/ui/study-kit";
import { buildSimilarityAvoidIds } from "../question-rotation";
import { FRQ_VARIANT_OPTIONS, UNITS, getFrqVariantDescription, getFrqVariantTone } from "../shared";

type VariantValue = "ap" | "active-recall";
type SessionTone = "blue" | "teal" | "amber" | "slate" | "rose";
type FrqPart = { label: string; verb: string; prompt: string };
type FrqAnswer = { answer?: string; bullet_points?: string[] };
type FrqQuestion = {
  id?: string;
  topic?: string;
  text?: string;
  image?: string;
  image_alt?: string;
  parts?: FrqPart[];
  answer_key?: Record<string, FrqAnswer>;
  part_explanations?: Record<string, string>;
  explain?: string;
};

function normalizeTone(value: string): SessionTone {
  const tone = getFrqVariantTone(value);
  if (tone === "blue" || tone === "amber" || tone === "slate") {
    return tone;
  }
  return "slate";
}

export default function UnitFrqPage() {
  const [unit, setUnit] = useState(UNITS[0]);
  const [variant, setVariant] = useState<VariantValue>("ap");
  const [question, setQuestion] = useState<FrqQuestion | null>(null);
  const [previousQuestions, setPreviousQuestions] = useState<FrqQuestion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revealedParts, setRevealedParts] = useState<Record<string, boolean>>({});

  const variantLabel = FRQ_VARIANT_OPTIONS.find((option) => option.value === variant)?.label ?? variant;
  const variantDescription = getFrqVariantDescription(variant);
  const variantTone = normalizeTone(variant);
  const hasReveal = Object.values(revealedParts).some(Boolean);

  async function nextFrq() {
    const currentQuestion = question;
    setQuestion(null);
    setLoadError(null);
    setRevealedParts({});
    const { recentQuestionIds, avoidSimilarToQuestionIds } = buildSimilarityAvoidIds({
      currentQuestion,
      previousQuestions,
    });
    try {
      const res = await fetch("/api/frq-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "unit",
          unit,
          difficulty: variant,
          recentQuestionIds,
          avoidSimilarToQuestionIds,
        }),
      });
      const data = await res.json();
      if (data?.question) {
        if (currentQuestion) setPreviousQuestions((prev) => [...prev, currentQuestion]);
        setQuestion(data.question);
        return;
      }
      setLoadError("No free-response prompts are available for this unit yet.");
    } catch {
      setLoadError("Unable to load free-response prompts right now. Please try again.");
    }
  }

  function previousFrq() {
    setLoadError(null);
    setRevealedParts({});
    setPreviousQuestions((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setQuestion(last);
      return prev.slice(0, -1);
    });
  }

  useEffect(() => {
    setPreviousQuestions([]);
    void nextFrq();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, variant]);

  return (
    <main className="grid gap-6 lg:gap-8">
      <PageHeader
        eyebrow="Unit FRQ Practice"
        title="Repair written reasoning one unit at a time."
        description="Use this route when one unit keeps breaking your explanations and you want the writing practice to stay tightly focused on that content."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <SecondaryLink href="/sims/active-recall">Back to dashboard</SecondaryLink>
            <SecondaryLink href="/sims/active-recall/frq-all">Switch to mixed FRQs</SecondaryLink>
          </div>
        }
        aside={
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Selected unit" value={unit} detail="Stay focused on one chapter" tone="blue" />
            <StatCard label="Current mode" value={variantLabel} detail={variantDescription} tone={variantTone === "slate" ? "neutral" : variantTone} />
            <StatCard label="Question history" value={previousQuestions.length} detail="Prompts you can still step back to" tone="amber" />
          </div>
        }
      />

      <SectionCard
        title="Session setup"
        description="Choose a unit, choose the kind of written response you want, and then move prompt by prompt without recycling near-duplicates back-to-back."
        tone={variantTone}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="text-sm font-semibold text-slate-900">Unit</label>
              <p className="mt-1 text-sm text-slate-500">Keep the written practice anchored to one content area when you need direct repair.</p>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <select value={unit} onChange={(event) => setUnit(event.target.value)} className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none">
                  {UNITS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="text-sm font-semibold text-slate-900">Prompt type</label>
              <p className="mt-1 text-sm text-slate-500">Switch between shorter Foundation prompts and fuller FRQ-style writing with structured scoring guidance.</p>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <select value={variant} onChange={(event) => setVariant(event.target.value as VariantValue)} className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none">
                  {FRQ_VARIANT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3">
                <ModeBadge label={variantLabel} tone={variantTone === "slate" ? "neutral" : variantTone} />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Prompt focus" value={variant === "ap" ? "Structured FRQ" : "Fast retrieval"} detail={variant === "ap" ? "Longer responses with scoring notes" : "Shorter concept checks"} />
            <StatCard label="Current history" value={previousQuestions.length} detail="Previous prompts available in this session" tone="blue" />
            <StatCard label="Reveal pattern" value="On demand" detail="Keep answers hidden until you choose to reveal them" tone="amber" />
          </div>
        </div>
      </SectionCard>

      {!question && loadError ? (
        <SectionCard title="Prompt unavailable" description={loadError} tone="rose">
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={() => void nextFrq()}>Try again</PrimaryButton>
          </div>
        </SectionCard>
      ) : null}

      {!question && !loadError ? <LoadingSkeleton title="Loading prompt" lines={4} /> : null}

      {question ? (
        <SectionCard
          title="Prompt"
          description="Outline or say your answer first, then reveal the scoring guidance only after you have committed to the reasoning."
          tone={variantTone}
        >
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                {unit}
              </span>
              <ModeBadge label={variantLabel} tone={variantTone === "slate" ? "neutral" : variantTone} />
              {question.topic ? (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                  {question.topic}
                </span>
              ) : null}
            </div>

            {question.image ? (
              <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white p-3 shadow-sm">
                <img
                  src={question.image.startsWith("/") ? question.image : `/${question.image}`}
                  alt={question.image_alt || "FRQ image"}
                  className="max-h-[420px] w-full rounded-xl object-contain"
                />
                {question.image_alt ? <p className="mt-3 text-sm text-slate-500">{question.image_alt}</p> : null}
              </div>
            ) : null}

            <div className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">{question.text}</h2>

              {question.parts && question.parts.length > 0 ? (
                <div className="mt-5 grid gap-4">
                  {question.parts.map((part) => {
                    const partKey = part.label?.toLowerCase?.() || "";
                    const answer = question.answer_key?.[partKey];
                    const partExplain = question.part_explanations?.[partKey];
                    const isRevealed = revealedParts[partKey];

                    return (
                      <div key={part.label} className="rounded-[1.2rem] border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                            Part {part.label}
                          </span>
                          {part.verb ? <VerbBadge label={part.verb} /> : null}
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-800">{part.prompt}</p>

                        {isRevealed ? (
                          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                            {answer?.answer ? <p className="text-sm leading-6 text-slate-800">{answer.answer}</p> : null}
                            {answer?.bullet_points?.length ? (
                              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                                {answer.bullet_points.map((bullet, index) => (
                                  <li key={index}>{bullet}</li>
                                ))}
                              </ul>
                            ) : null}
                            {partExplain ? <p className="mt-3 text-sm leading-6 text-slate-500">Scoring note: {partExplain}</p> : null}
                          </div>
                        ) : null}

                        <div className="mt-4 flex flex-wrap gap-3">
                          <SecondaryButton onClick={() => setRevealedParts((prev) => ({ ...prev, [partKey]: !prev[partKey] }))}>
                            {isRevealed ? "Hide scoring notes" : "Reveal scoring notes"}
                          </SecondaryButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.2rem] border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
                  {revealedParts.answer ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-sm leading-6 text-slate-800">{question.explain}</p>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <SecondaryButton onClick={() => setRevealedParts((prev) => ({ ...prev, answer: !prev.answer }))}>
                      {revealedParts.answer ? "Hide answer" : "Reveal answer"}
                    </SecondaryButton>
                  </div>
                </div>
              )}

              {hasReveal && question.explain && question.parts && question.parts.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-slate-300 bg-slate-100 p-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f5a32]">Teacher note</div>
                  <p className="mt-2 text-sm leading-6 text-[#1f5a32]">{question.explain}</p>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <SecondaryButton onClick={previousFrq} disabled={previousQuestions.length === 0}>
                  Previous question
                </SecondaryButton>
                <PrimaryButton onClick={() => void nextFrq()}>Next question</PrimaryButton>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}

      <TipCard label="Study tip">Write or say your answer before revealing the scoring notes. FRQ practice only helps if you force the reasoning out first.</TipCard>
    </main>
  );
}
