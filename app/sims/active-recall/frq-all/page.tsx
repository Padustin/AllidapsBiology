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
  VerbBadge,
} from "../../../components/ui/study-kit";
import { buildSimilarityAvoidIds } from "../question-rotation";
import { FRQ_VARIANT_OPTIONS, UNITS, getFrqVariantDescription, getFrqVariantTone } from "../shared";

type VariantValue = "ap" | "active-recall";
type SessionTone = "blue" | "teal" | "amber" | "slate" | "rose";
const ALL_UNITS_VALUE = "__all_units__";
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

function getRequestedFrqUnit(value: string | null) {
  if (!value || value === "all" || value === ALL_UNITS_VALUE) {
    return ALL_UNITS_VALUE;
  }
  return UNITS.find((unitOption) => unitOption === value) ?? ALL_UNITS_VALUE;
}

function AllUnitFrqPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCompactFrq = pathname.startsWith("/sims/frq");
  const [selectedUnit, setSelectedUnit] = useState(() => getRequestedFrqUnit(searchParams.get("unit")));
  const [variant, setVariant] = useState<VariantValue>(() => (searchParams.get("variant") === "active-recall" ? "active-recall" : "ap"));
  const [question, setQuestion] = useState<FrqQuestion | null>(null);
  const [previousQuestions, setPreviousQuestions] = useState<FrqQuestion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revealedParts, setRevealedParts] = useState<Record<string, boolean>>({});

  const variantLabel = FRQ_VARIANT_OPTIONS.find((option) => option.value === variant)?.label ?? variant;
  const variantDescription = getFrqVariantDescription(variant);
  const variantTone = normalizeTone(variant);
  const hasReveal = Object.values(revealedParts).some(Boolean);
  const isUnitScoped = isCompactFrq && selectedUnit !== ALL_UNITS_VALUE;

  useEffect(() => {
    const requestedVariant = searchParams.get("variant");
    if (!requestedVariant || requestedVariant === variant) {
      return;
    }
    if (requestedVariant === "ap" || requestedVariant === "active-recall") {
      setVariant(requestedVariant);
    }
  }, [searchParams, variant]);

  useEffect(() => {
    const requestedUnitParam = searchParams.get("unit");
    if (!requestedUnitParam) {
      return;
    }
    const requestedUnit = getRequestedFrqUnit(requestedUnitParam);
    if (requestedUnit !== selectedUnit) {
      setSelectedUnit(requestedUnit);
    }
  }, [searchParams, selectedUnit]);

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
          mode: isUnitScoped ? "unit" : "all",
          unit: isUnitScoped ? selectedUnit : null,
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
      setLoadError(isUnitScoped ? "No free-response prompts are available for this unit yet." : "No free-response prompts are available yet.");
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
  }, [selectedUnit, variant]);

  return (
    <main className={isCompactFrq ? "grid gap-4" : "grid gap-6"}>
      {!isCompactFrq ? (
      <PageHeader
        eyebrow="All-unit FRQ practice"
        align="start"
        title="Write across the full AP Biology course."
        description="Choose the writing difficulty you want, from shorter Foundation prompts to full FRQ practice with structured reasoning and scoring guidance."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <SecondaryLink href="/sims/active-recall">Back to practice</SecondaryLink>
            <SecondaryLink href="/sims/active-recall/frq-unit">Switch to unit FRQs</SecondaryLink>
          </div>
        }
      />
      ) : null}

      {!isCompactFrq ? (
      <SectionCard title="Session setup" description="Choose the difficulty of writing practice you want, then move prompt by prompt without repeating near-duplicate questions.">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
          <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <label className="text-sm font-semibold text-[color:var(--ink)]">Difficulty</label>
            <p className="mt-1 text-sm text-[color:var(--ink-faint)]">{variantDescription}</p>
            <div className="mt-2.5 rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2">
              <select value={variant} onChange={(event) => setVariant(event.target.value as VariantValue)} className="w-full bg-transparent text-sm font-medium text-[color:var(--ink)] outline-none">
                {FRQ_VARIANT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2.5">
              <ModeBadge label={variantLabel} tone={variantTone === "slate" ? "neutral" : variantTone} />
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Prompt focus" value={variant === "ap" ? "Structured FRQ" : "Fast retrieval"} detail={variant === "ap" ? "Higher writing load with scoring notes" : "Lower writing load with rapid concept checks"} />
            <StatCard label="Current history" value={previousQuestions.length} detail="Previous prompts available" tone="blue" />
            <StatCard label="Reveal pattern" value="On demand" detail="Keep answers hidden until ready" tone="amber" />
          </div>
        </div>
      </SectionCard>
      ) : (
        <div className="grid gap-2.5 rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-faint)]">Unit</label>
            <div className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2">
              <select value={selectedUnit} onChange={(event) => setSelectedUnit(event.target.value)} className="w-full bg-transparent text-sm font-medium text-[color:var(--ink)] outline-none">
                <option value={ALL_UNITS_VALUE}>All units</option>
                {UNITS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-faint)]">Difficulty</label>
            <div className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2">
              <select value={variant} onChange={(event) => setVariant(event.target.value as VariantValue)} className="w-full bg-transparent text-sm font-medium text-[color:var(--ink)] outline-none">
                {FRQ_VARIANT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {!question && loadError ? (
        <SectionCard title="Prompt unavailable" description={loadError} tone="rose">
          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={() => void nextFrq()}>Try again</PrimaryButton>
          </div>
        </SectionCard>
      ) : null}

      {!question && !loadError ? <LoadingSkeleton title="Loading prompt" lines={4} /> : null}

      {question ? (
        <SectionCard title="Prompt" description="Outline or say your response before you reveal anything. The value is in producing the reasoning first.">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {isUnitScoped ? (
                <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-muted)]">
                  {selectedUnit}
                </span>
              ) : null}
              <ModeBadge label={variantLabel} tone={variantTone === "slate" ? "neutral" : variantTone} />
              {question.topic ? (
                <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-muted)]">
                  {question.topic}
                </span>
              ) : null}
            </div>

            {question.image ? (
              <div className="overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--border)] bg-white p-3">
                <img
                  src={question.image.startsWith("/") ? question.image : `/${question.image}`}
                  alt={question.image_alt || "FRQ image"}
                  className="max-h-[420px] w-full rounded-[var(--radius-sm)] object-contain"
                  loading="lazy"
                />
              </div>
            ) : null}

            <h2 className="text-lg font-semibold leading-7 tracking-tight text-[color:var(--ink)]">{question.text}</h2>

            {question.parts && question.parts.length > 0 ? (
              <div className="grid gap-3">
                {question.parts.map((part) => {
                  const partKey = part.label?.toLowerCase?.() || "";
                  const answer = question.answer_key?.[partKey];
                  const partExplain = question.part_explanations?.[partKey];
                  const isRevealed = revealedParts[partKey];

                  return (
                    <div key={part.label} className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-muted)]">
                          Part {part.label}
                        </span>
                        {part.verb ? <VerbBadge label={part.verb} /> : null}
                      </div>

                      <p className="mt-2.5 text-sm leading-6 text-[color:var(--ink)]">{part.prompt}</p>

                      {isRevealed ? (
                        <div className="mt-3 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                          {answer?.answer ? <p className="text-sm leading-6 text-[color:var(--ink)]">{answer.answer}</p> : null}
                          {answer?.bullet_points?.length ? (
                            <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[color:var(--ink-muted)]">
                              {answer.bullet_points.map((bullet, index) => (
                                <li key={index}>{bullet}</li>
                              ))}
                            </ul>
                          ) : null}
                          {partExplain ? <p className="mt-2.5 text-sm leading-6 text-[color:var(--ink-faint)]">Scoring note: {partExplain}</p> : null}
                        </div>
                      ) : null}

                      <div className="mt-3">
                        <SecondaryButton onClick={() => setRevealedParts((prev) => ({ ...prev, [partKey]: !prev[partKey] }))}>
                          {isRevealed ? "Hide scoring notes" : "Reveal scoring notes"}
                        </SecondaryButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                {revealedParts.answer ? (
                  <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                    <p className="text-sm leading-6 text-[color:var(--ink)]">{question.explain}</p>
                  </div>
                ) : null}
                <div className="mt-3">
                  <SecondaryButton onClick={() => setRevealedParts((prev) => ({ ...prev, answer: !prev.answer }))}>
                    {revealedParts.answer ? "Hide answer" : "Reveal answer"}
                  </SecondaryButton>
                </div>
              </div>
            )}

            {hasReveal && question.explain && question.parts && question.parts.length > 0 ? (
              <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] border-l-[3px] border-l-[color:var(--brand)] bg-[color:var(--brand-soft)] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--brand-dark)]">Teacher note</div>
                <p className="mt-1.5 text-sm leading-6 text-[color:var(--ink)]">{question.explain}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 border-t border-[color:var(--border)] pt-4">
              <SecondaryButton onClick={previousFrq} disabled={previousQuestions.length === 0}>
                Previous question
              </SecondaryButton>
              <PrimaryButton onClick={() => void nextFrq()}>Next question</PrimaryButton>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {!isCompactFrq ? <TipCard label="Study tip">Write or say your answer before revealing the scoring notes. FRQ practice only helps if you force the reasoning out first.</TipCard> : null}
    </main>
  );
}

export default function AllUnitFrqPage() {
  return (
    <Suspense
      fallback={
        <main className="grid gap-4">
          <LoadingSkeleton title="Loading prompt" lines={4} />
        </main>
      }
    >
      <AllUnitFrqPageContent />
    </Suspense>
  );
}
