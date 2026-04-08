"use client";

import { useEffect, useState } from "react";
import {
  EmptyState,
  FeatureCard,
  ModeBadge,
  PageHeader,
  PrimaryLink,
  SecondaryLink,
  SectionCard,
  SurfaceItem,
  SurfaceList,
} from "../../components/ui/study-kit";
import { ProgressDashboard } from "./progress-dashboard";
import { readStudyProgressSnapshot, STUDY_PROGRESS_EVENT } from "./progress";
import { DIFFICULTY_META, FRQ_VARIANT_META } from "./shared";

const onboardingSteps = [
  {
    step: "01",
    title: "Start with one unit",
    description: "Use unit MCQ review when you are relearning content, preparing for a quiz, or trying to stabilize one chapter fast.",
  },
  {
    step: "02",
    title: "Add mixed AP pressure",
    description: "Switch to all-unit MCQ review once single-unit practice feels steadier and you want harder exam-style decisions.",
  },
  {
    step: "03",
    title: "Finish with FRQs",
    description: "Use written response practice to convert recall into explanation, justification, and stimulus interpretation.",
  },
];

const mcqModes = [
  DIFFICULTY_META.easy,
  DIFFICULTY_META.hard,
  DIFFICULTY_META.analysis,
];

const frqModes = [FRQ_VARIANT_META["active-recall"], FRQ_VARIANT_META.ap];

export default function ActiveRecallPage() {
  const [hasAttempts, setHasAttempts] = useState(false);

  useEffect(() => {
    const refresh = () => setHasAttempts(readStudyProgressSnapshot().totalAttempts > 0);
    refresh();
    window.addEventListener(STUDY_PROGRESS_EVENT, refresh as EventListener);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STUDY_PROGRESS_EVENT, refresh as EventListener);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <main className="grid gap-6 lg:gap-8">
      <PageHeader
        eyebrow="Practice Dashboard"
        title="Choose the next kind of AP Biology practice you actually need."
        description="Use focused unit repair when content is shaky, mixed review when you want pressure, and FRQs when you need biological reasoning to hold up in writing."
        actions={
          <>
            <PrimaryLink href="/sims/mcq">Start with unit MCQs</PrimaryLink>
            <SecondaryLink href="/sims/mcq">Open mixed AP review</SecondaryLink>
          </>
        }
        aside={
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.35rem] border border-slate-300 bg-slate-100/95 p-4 shadow-sm">
              <ModeBadge label={DIFFICULTY_META.easy.label} tone="amber" />
              <p className="mt-3 text-sm leading-6 text-[#1f5a32]">{DIFFICULTY_META.easy.description}. Best for rebuilding certainty before you add pressure.</p>
            </div>
            <div className="rounded-[1.35rem] border border-slate-300 bg-slate-100/95 p-4 shadow-sm">
              <ModeBadge label={DIFFICULTY_META.hard.label} tone="blue" />
              <p className="mt-3 text-sm leading-6 text-[#1f5a32]">{DIFFICULTY_META.hard.description}. Best when you want realistic distractors and faster exam decisions.</p>
            </div>
            <div className="rounded-[1.35rem] border border-slate-300 bg-slate-100/95 p-4 shadow-sm">
              <ModeBadge label={DIFFICULTY_META.analysis.label} tone="teal" />
              <p className="mt-3 text-sm leading-6 text-[#1f5a32]">{DIFFICULTY_META.analysis.description}. Best for figures, setups, graphs, and data interpretation.</p>
            </div>
          </div>
        }
      />

      {!hasAttempts ? (
        <EmptyState
          title="Your first study loop should feel obvious."
          description="Start with one unit, let the dashboard expose the weak spots, then move into mixed AP review and FRQs once recall starts to stabilize."
          action={<PrimaryLink href="/sims/mcq">Start with unit MCQs</PrimaryLink>}
          secondaryAction={<SecondaryLink href="/sims/mcq">Jump to mixed AP review</SecondaryLink>}
          preview={
            <div className="grid gap-3">
              {onboardingSteps.map((item) => (
                <div key={item.step} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step {item.step}</p>
                  <p className="mt-2 text-base font-semibold tracking-tight text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          }
        />
      ) : null}

      <ProgressDashboard />

      <SectionCard
        title="Choose the next session"
        description="Unit MCQs are the best first move. Mixed review adds pressure. FRQs are where recall has to hold up as written biological reasoning."
        tone="slate"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard
            eyebrow="Focused repair"
            title="Unit MCQ review"
            description="Best for reteaching, next-day quizzes, or fixing one content area before you add more pressure."
            detail="Choose a unit, then run Foundation, AP-Style, or Experiment sets inside the page."
            href="/sims/mcq"
            tone="amber"
            cta="Open unit review"
          />
          <FeatureCard
            eyebrow="Full-course pressure"
            title="All-unit MCQ review"
            description="Best once one-unit work feels steadier and you want harder mixed AP-style decisions across the course."
            detail="Useful for elimination practice, switching speed, and broader exam stamina."
            href="/sims/mcq"
            tone="blue"
            cta="Open mixed review"
          />
          <FeatureCard
            eyebrow="Written repair"
            title="Unit FRQ practice"
            description="Best when one unit keeps breaking your explanations and you need direct written-response repair on that content."
            detail="Use shorter Foundation prompts or fuller FRQ-style responses inside the route."
            href="/sims/active-recall/frq-unit"
            tone="amber"
            cta="Open unit FRQs"
          />
          <FeatureCard
            eyebrow="Synthesis and stimulus"
            title="All-unit FRQ practice"
            description="Best once you want broad AP-style writing, stimulus interpretation, and explanation practice across units."
            detail="Includes longer prompts and image-backed FRQ sets for mixed transfer work."
            href="/sims/active-recall/frq-all"
            tone="teal"
            cta="Open mixed FRQs"
          />
        </div>
      </SectionCard>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SectionCard
          title="MCQ modes"
          description="These labels stay consistent across unit and mixed practice, so students know what a session is demanding before they start."
          tone="amber"
        >
          <SurfaceList className="md:grid-cols-3">
            {mcqModes.map((mode) => (
              <SurfaceItem key={mode.label}>
                <ModeBadge label={mode.label} tone={mode.tone} />
                <p className="mt-3 text-sm leading-6 text-slate-600">{mode.description}.</p>
              </SurfaceItem>
            ))}
          </SurfaceList>
        </SectionCard>

        <SectionCard
          title="FRQ modes"
          description="Use shorter response checks for rapid retrieval, then move into fuller FRQ work when you want written AP-style reasoning."
          tone="teal"
        >
          <SurfaceList>
            {frqModes.map((mode) => (
              <SurfaceItem key={mode.label}>
                <ModeBadge label={mode.label} tone={mode.tone} />
                <p className="mt-3 text-sm leading-6 text-slate-600">{mode.description}.</p>
              </SurfaceItem>
            ))}
          </SurfaceList>
        </SectionCard>
      </section>
    </main>
  );
}