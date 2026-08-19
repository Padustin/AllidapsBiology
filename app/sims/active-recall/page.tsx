"use client";

import {
  FeatureCard,
  ModeBadge,
  PageHeader,
  SectionCard,
  SurfaceItem,
  SurfaceList,
} from "../../components/ui/study-kit";
import { ProgressDashboard } from "./progress-dashboard";
import { DIFFICULTY_META, FRQ_VARIANT_META } from "./shared";

const PRACTICE_MODES = [
  {
    eyebrow: "Unit-focused",
    title: "Unit MCQs",
    description: "Practice one AP Biology unit at a time.",
    href: "/sims/mcq",
    tone: "accent" as const,
  },
  {
    eyebrow: "Unit-focused",
    title: "Unit FRQs",
    description: "Free-response practice scoped to one unit.",
    href: "/sims/active-recall/frq-unit",
    tone: "accent" as const,
  },
  {
    eyebrow: "Mixed review",
    title: "All-unit MCQs",
    description: "Exam-style multiple-choice across the full course.",
    href: "/sims/mcq?unit=all",
    tone: "blue" as const,
  },
  {
    eyebrow: "Mixed review",
    title: "All-unit FRQs",
    description: "Free-response practice across the full course.",
    href: "/sims/frq?unit=all&variant=ap",
    tone: "blue" as const,
  },
  {
    eyebrow: "Quantitative",
    title: "Statistics MCQs",
    description: "Chi-square, Hardy-Weinberg, and other quantitative topics.",
    href: "/sims/mcq?difficulty=statistics",
    tone: "rose" as const,
  },
];

const mcqModes = [DIFFICULTY_META.easy, DIFFICULTY_META.hard, DIFFICULTY_META.analysis];
const frqModes = [FRQ_VARIANT_META["active-recall"], FRQ_VARIANT_META.ap];

export default function ActiveRecallPage() {
  return (
    <main className="grid gap-10">
      <PageHeader eyebrow="Practice" align="start" title="Choose a practice mode" />

      <section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PRACTICE_MODES.map((mode) => (
            <FeatureCard key={mode.href} {...mode} cta="Start" />
          ))}
        </div>
      </section>

      <ProgressDashboard />

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="MCQ modes" description="These labels stay consistent across unit and mixed practice.">
          <SurfaceList className="sm:grid-cols-3">
            {mcqModes.map((mode) => (
              <SurfaceItem key={mode.label}>
                <ModeBadge label={mode.label} tone={mode.tone} />
                <p className="mt-2.5 text-sm leading-6 text-[color:var(--ink-muted)]">{mode.description}.</p>
              </SurfaceItem>
            ))}
          </SurfaceList>
        </SectionCard>

        <SectionCard title="FRQ modes" description="Shorter retrieval checks, or full AP-style written reasoning.">
          <SurfaceList>
            {frqModes.map((mode) => (
              <SurfaceItem key={mode.label}>
                <ModeBadge label={mode.label} tone={mode.tone} />
                <p className="mt-2.5 text-sm leading-6 text-[color:var(--ink-muted)]">{mode.description}.</p>
              </SurfaceItem>
            ))}
          </SurfaceList>
        </SectionCard>
      </section>
    </main>
  );
}
