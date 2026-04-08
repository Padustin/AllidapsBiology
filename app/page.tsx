import {
  FeatureCard,
  ModeBadge,
  PageHeader,
  PrimaryLink,
  SecondaryLink,
  SectionCard,
  SurfaceItem,
  SurfaceList,
} from "./components/ui/study-kit";

const STUDY_PATH = [
  {
    step: "01",
    title: "Repair one unit first",
    description: "Use unit MCQs when one chapter is weak, a quiz is close, or you need to rebuild confidence fast.",
  },
  {
    step: "02",
    title: "Switch into mixed AP pressure",
    description: "Move to all-unit review once single-unit work feels steady and you want harder exam-style decisions.",
  },
  {
    step: "03",
    title: "Finish with writing and math",
    description: "Use FRQs and the statistics center when you want transfer, justification, and data interpretation instead of recognition.",
  },
];

const START_POINTS = [
  {
    eyebrow: "Best first move",
    title: "Unit MCQ review",
    description: "Target one unit, choose the mode that fits your day, and close gaps without bouncing around the course.",
    detail: "Includes Foundation, AP-Style, and Experiment sets.",
    href: "/sims/active-recall/unit",
    tone: "amber" as const,
    cta: "Start focused review",
  },
  {
    eyebrow: "Mixed course review",
    title: "All-unit MCQ review",
    description: "Train switching speed, elimination, and endurance with mixed AP-style questions across all eight units.",
    detail: "Best after single-unit practice stops feeling shaky.",
    href: "/sims/active-recall/ap",
    tone: "blue" as const,
    cta: "Open mixed review",
  },
  {
    eyebrow: "Written reasoning",
    title: "FRQ practice",
    description: "Turn recall into biological explanation with structured prompts, scoring notes, and image-backed free response sets.",
    detail: "Use unit or all-unit FRQs depending on what is breaking down.",
    href: "/sims/active-recall/frq-all",
    tone: "teal" as const,
    cta: "Start FRQ work",
  },
  {
    eyebrow: "Quantitative review",
    title: "Math and statistics center",
    description: "Practice chi-square, Hardy-Weinberg, water potential, graph slope, error bars, and other common AP Bio calculations in one place.",
    detail: "Built for the quantitative questions that slow students down.",
    href: "/sims/chi-square",
    tone: "slate" as const,
    cta: "Open statistics tools",
  },
];

const MODE_ITEMS = [
  {
    label: "Foundation",
    tone: "amber" as const,
    description: "Use this when you need clean definitions, core concepts, and faster recall before harder AP-style work.",
  },
  {
    label: "AP-Style",
    tone: "blue" as const,
    description: "Use this for conceptual multiple-choice with realistic distractors and the kind of elimination pressure that shows up on tests.",
  },
  {
    label: "Experiment",
    tone: "teal" as const,
    description: "Use this for data interpretation, setups, figures, and the reading load that trips students up on exam day.",
  },
];

export default function Home() {
  return (
    <main className="grid gap-8 lg:gap-10">
      <PageHeader
        eyebrow="AP Biology Study Platform"
        title="Study AP Biology with a plan that tells you what to do next."
        description="Move from targeted unit repair to mixed AP pressure, FRQ writing, and quantitative review without guessing where to start or what to practice after that."
        actions={
          <>
            <PrimaryLink href="/sims/active-recall">Open study dashboard</PrimaryLink>
            <SecondaryLink href="/sims/chi-square">Open statistics center</SecondaryLink>
          </>
        }
      />

      <SectionCard
        title="Choose your starting point"
        description="Each route is designed for a different kind of study day, so you can start where your preparation is actually breaking down."
        tone="blue"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {START_POINTS.map((item) => (
            <FeatureCard key={item.href} {...item} />
          ))}
        </div>
      </SectionCard>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SectionCard
          title="How the study system works"
          description="The strongest results come from using the tools in sequence instead of treating them like disconnected tabs."
          tone="slate"
        >
          <SurfaceList className="md:grid-cols-3">
            {STUDY_PATH.map((item) => (
              <SurfaceItem key={item.step}>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step {item.step}</div>
                <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </SurfaceItem>
            ))}
          </SurfaceList>
        </SectionCard>

        <SectionCard
          title="What each MCQ mode is for"
          description="The labels stay consistent across the site so students know what kind of thinking a session is asking for."
          tone="amber"
        >
          <SurfaceList>
            {MODE_ITEMS.map((item) => (
              <SurfaceItem key={item.label}>
                <ModeBadge label={item.label} tone={item.tone} />
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </SurfaceItem>
            ))}
          </SurfaceList>
        </SectionCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <FeatureCard
          eyebrow="Interactive model"
          title="Explore the cell simulation"
          description="Walk through organelles, pathways, and central dogma interactions inside a full-cell simulation when you need structure, not just flashcard-style reps."
          detail="Useful when visual organization helps content stick."
          href="/sims/simulations"
          tone="slate"
          cta="Open simulation"
        />
        <FeatureCard
          eyebrow="Help improve the platform"
          title="Send feedback or request a change"
          description="If a page is unclear, a question feels weak, or a tool is missing, use the feedback route so the platform can keep improving around real study pain points."
          detail="Short notes, bug reports, and feature ideas are all useful."
          href="/sims/feedback"
          tone="rose"
          cta="Share feedback"
        />
      </section>
    </main>
  );
}
