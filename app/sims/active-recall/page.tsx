"use client";

import { useEffect, useState } from "react";
import {
  EmptyState,
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
        title=""
        align="start"
        actions={
          <div className="grid w-full gap-4 md:grid-cols-2 xl:max-w-5xl">
            <PrimaryLink href="/sims/mcq" className="min-h-20 w-full rounded-[1.35rem] px-8 py-5 text-lg">
              Unit specific MCQs
            </PrimaryLink>
            <PrimaryLink href="/sims/mcq" className="min-h-20 w-full rounded-[1.35rem] px-8 py-5 text-lg">
              Unit specific FRQs
            </PrimaryLink>
            <PrimaryLink href="/sims/mcq?unit=all" className="min-h-20 w-full rounded-[1.35rem] px-8 py-5 text-lg">
              All unit MCQ
            </PrimaryLink>
            <PrimaryLink href="/sims/frq?unit=all&variant=ap" className="min-h-20 w-full rounded-[1.35rem] px-8 py-5 text-lg">
              All unit FRQ
            </PrimaryLink>
            <PrimaryLink href="/sims/mcq?difficulty=statistics" className="min-h-20 w-full rounded-[1.35rem] px-8 py-5 text-lg md:col-span-2 md:mx-auto md:max-w-[28rem]">
              Statistic MCQs
            </PrimaryLink>
          </div>
        }
        aside={
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.35rem] border border-slate-300 bg-slate-100/95 p-4 shadow-sm">
              <ModeBadge label={DIFFICULTY_META.easy.label} tone="amber" />
              <p className="mt-3 text-sm leading-6 text-slate-950">{DIFFICULTY_META.easy.description}. Best for rebuilding certainty before you add pressure.</p>
            </div>
            <div className="rounded-[1.35rem] border border-slate-300 bg-slate-100/95 p-4 shadow-sm">
              <ModeBadge label={DIFFICULTY_META.hard.label} tone="blue" />
              <p className="mt-3 text-sm leading-6 text-slate-950">{DIFFICULTY_META.hard.description}. Best when you want realistic distractors and faster exam decisions.</p>
            </div>
            <div className="rounded-[1.35rem] border border-slate-300 bg-slate-100/95 p-4 shadow-sm">
              <ModeBadge label={DIFFICULTY_META.analysis.label} tone="teal" />
              <p className="mt-3 text-sm leading-6 text-slate-950">{DIFFICULTY_META.analysis.description}. Best for figures, setups, graphs, and data interpretation.</p>
            </div>
          </div>
        }
      />

      {!hasAttempts ? (
        <EmptyState
          title="Your first study loop should feel obvious."
          description="Start with one unit, let the dashboard expose the weak spots, then move into mixed AP review and FRQs once recall starts to stabilize."
          action={
            <PrimaryLink href="/sims/mcq" className="min-h-14 rounded-2xl px-6 py-3.5 text-base">
              Start with unit MCQs
            </PrimaryLink>
          }
          secondaryAction={
            <SecondaryLink href="/sims/mcq" className="min-h-14 rounded-2xl px-6 py-3.5 text-base">
              Jump to mixed AP review
            </SecondaryLink>
          }
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