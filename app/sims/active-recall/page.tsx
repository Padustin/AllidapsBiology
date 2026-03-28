"use client";

import Link from "next/link";
import { PageHero, ToolCard } from "../../components/ui/study-kit";

export default function ActiveRecallPage() {
  return (
    <main className="grid gap-5">
      <PageHero
        eyebrow="Active Recall"
        title="Choose your practice mode"
        description="Pick an AP Biology practice path based on your goal: broad review, unit focus, or FRQ training."
        actions={
          <Link href="/sims/active-recall/ap" className="rounded-xl border border-sky-700 bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700">
            Start all-unit MCQ review
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ToolCard
          title="All-Unit MCQ Review"
          description="Rotate through AP-style multiple-choice questions from every unit. Great for mixed practice."
          href="/sims/active-recall/ap"
          tone="blue"
        />
        <ToolCard
          title="Unit MCQ Review"
          description="Target one unit and difficulty level to close specific content gaps quickly."
          href="/sims/active-recall/unit"
          tone="slate"
        />
        <ToolCard
          title="All-Unit FRQ Practice"
          description="Build free-response confidence with broad AP-style and active recall FRQ prompts."
          href="/sims/active-recall/frq-all"
          tone="teal"
        />
        <ToolCard
          title="Unit FRQ Practice"
          description="Focus FRQ practice on one unit so your writing and reasoning improve faster."
          href="/sims/active-recall/frq-unit"
          tone="amber"
        />
      </div>
    </main>
  );
}