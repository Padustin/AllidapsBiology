import Image from "next/image";
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
    href: "/sims/mcq",
    tone: "accent" as const,
    preview: (
      <div className="rounded-[1.1rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="inline-flex items-center rounded-full border border-[color:var(--accent-text)]/20 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-text)]">
          Unit 2 Preview
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-950">
          Which cell structure is most directly responsible for modifying, sorting, and packaging proteins for secretion?
        </p>
        <div className="mt-3 grid gap-2">
          {[
            "A. Ribosome",
            "B. Golgi apparatus",
            "C. Lysosome",
            "D. Cytoskeleton",
          ].map((choice) => (
            <div key={choice} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {choice}
            </div>
          ))}
        </div>
      </div>
    ),
    cta: "Start focused review",
  },
  {
    eyebrow: "Mixed course review",
    title: "All-unit MCQ review",
    href: "/sims/mcq?unit=all",
    tone: "accent" as const,
    preview: (
      <div className="rounded-[1.1rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="inline-flex items-center rounded-full border border-[color:var(--accent-text)]/20 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-text)]">
          Mixed AP Preview
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-950">
          A population shows logistic growth and then levels near carrying capacity. Which factor most likely explains the plateau?
        </p>
        <div className="mt-3 grid gap-2">
          {[
            "A. Unlimited resources",
            "B. Increased mutation rate",
            "C. Density-dependent limits",
            "D. Elimination of competition",
          ].map((choice) => (
            <div key={choice} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {choice}
            </div>
          ))}
        </div>
      </div>
    ),
    cta: "Open mixed review",
  },
  {
    eyebrow: "Written reasoning",
    title: "FRQ practice",
    href: "/sims/frq",
    tone: "accent" as const,
    preview: (
      <div className="overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 inline-flex items-center rounded-full border border-[color:var(--accent-text)]/20 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-text)]">
            Image stimulus
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Image
              src="/images/unit5_pedigree_autosomal_dominant.png"
              alt="Preview image for free-response practice"
              width={960}
              height={640}
              className="h-40 w-full object-contain bg-white"
            />
          </div>
        </div>
        <div className="grid gap-3 p-4">
          <div className="inline-flex items-center rounded-full border border-[color:var(--accent-text)]/20 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-text)]">
            FRQ Preview
          </div>
          <p className="text-sm font-semibold leading-6 text-slate-950">
            A pedigree tracks an inherited trait across multiple generations.
          </p>
          <div className="grid gap-2 text-sm leading-6 text-slate-700">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">A. Identify the most likely inheritance pattern shown in the pedigree.</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">B. Justify your conclusion using evidence from the individuals shown.</div>
          </div>
        </div>
      </div>
    ),
    cta: "Start FRQ work",
  },
  {
    eyebrow: "Quantitative review",
    title: "Math and statistics center",
    href: "/sims/chi-square",
    tone: "accent" as const,
    previewImageSrc: "/images/unit7_hardy_weinberg_bars.png",
    previewImageAlt: "Preview image for the math and statistics center",
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
        title="The Complete AP Bio Study Tool"
        align="start"
        actions={
          <>
            <PrimaryLink href="/sims/active-recall">Open study dashboard</PrimaryLink>
            <SecondaryLink href="/sims/chi-square">Open statistics center</SecondaryLink>
          </>
        }
        background={
          <Image
            src="/icon.png"
            alt="A logo background"
            width={800}
            height={800}
            className="pointer-events-none opacity-10 h-[20rem] w-[20rem] sm:h-[24rem] sm:w-[24rem] md:h-[28rem] md:w-[28rem] object-contain translate-x-12 -translate-y-6"
          />
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
