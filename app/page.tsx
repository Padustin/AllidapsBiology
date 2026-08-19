import Link from "next/link";
import {
  PageHeader,
  PrimaryLink,
  SecondaryLink,
} from "./components/ui/study-kit";

type UnitTone = "accent" | "blue" | "teal" | "amber" | "rose" | "green";

const UNITS: { n: number; title: string; weight: string; icon: string; tone: UnitTone }[] = [
  { n: 1, title: "Chemistry of Life", weight: "8–11%", icon: "🧪", tone: "accent" },
  { n: 2, title: "Cells", weight: "10–13%", icon: "🔬", tone: "blue" },
  { n: 3, title: "Cellular Energetics", weight: "12–16%", icon: "⚡", tone: "amber" },
  { n: 4, title: "Cell Communication and Cell Cycle", weight: "10–15%", icon: "🔄", tone: "teal" },
  { n: 5, title: "Heredity", weight: "8–11%", icon: "🧬", tone: "rose" },
  { n: 6, title: "Gene Expression and Regulation", weight: "12–16%", icon: "📖", tone: "green" },
  { n: 7, title: "Natural Selection", weight: "13–20%", icon: "🦎", tone: "accent" },
  { n: 8, title: "Ecology", weight: "10–15%", icon: "🌎", tone: "blue" },
];

const TONE_ACCENT: Record<UnitTone, string> = {
  accent: "var(--brand)",
  blue: "var(--info)",
  teal: "var(--experiment)",
  amber: "var(--foundation)",
  rose: "var(--statistics)",
  green: "var(--success)",
};

const TONE_SOFT: Record<UnitTone, string> = {
  accent: "var(--brand-soft)",
  blue: "var(--info-soft)",
  teal: "var(--experiment-soft)",
  amber: "var(--foundation-soft)",
  rose: "var(--statistics-soft)",
  green: "var(--success-soft)",
};

const STUDY_PATH = [
  {
    step: "1",
    title: "Review a unit",
    description: "Read the unit's key concepts and terms before you practice, or jump straight in if you're already comfortable with the content.",
  },
  {
    step: "2",
    title: "Practice with explanations",
    description: "Work through multiple-choice and free-response questions. Every choice has an explanation, not just the correct one.",
  },
  {
    step: "3",
    title: "Track what's weak",
    description: "Your dashboard shows accuracy by unit and flags the topics you keep missing, so you know what to review next.",
  },
];

export default function Home() {
  return (
    <main className="grid gap-14">
      <PageHeader
        eyebrow="AP Biology"
        align="start"
        title="Study AP Biology unit by unit, then practice until it sticks."
        description="Pick a unit, get real explanations on every question, and watch your weak spots turn into strengths."
        actions={
          <>
            <PrimaryLink href="/sims/active-recall">Start practicing</PrimaryLink>
            <SecondaryLink href="/study">Browse the units</SecondaryLink>
          </>
        }
      />

      <section>
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-[color:var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>
            Course units
          </h2>
          <Link href="/study" className="text-sm font-semibold text-[color:var(--brand-dark)] hover:underline">
            View study guides &rarr;
          </Link>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {UNITS.map((unit) => (
            <Link
              key={unit.n}
              href={`/study?unit=${unit.n}`}
              className="pop-hover group flex items-center gap-3.5 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3.5 shadow-[var(--shadow-sm)] hover:border-[color:var(--border-strong)]"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                style={{ background: TONE_SOFT[unit.tone] }}
                aria-hidden="true"
              >
                {unit.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: TONE_ACCENT[unit.tone] }}>
                  Unit {unit.n}
                </span>
                <span className="block truncate text-[15px] font-semibold text-[color:var(--ink)]">{unit.title}</span>
              </span>
              <span className="shrink-0 text-xs font-medium text-[color:var(--ink-faint)]">{unit.weight}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="mb-5 text-xl font-semibold tracking-tight text-[color:var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>
            How to use this site
          </h2>
          <ol className="grid gap-5">
            {STUDY_PATH.map((item) => (
              <li key={item.step} className="flex gap-4">
                <span
                  className="accent-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-[var(--shadow-sm)]"
                  aria-hidden="true"
                >
                  {item.step}
                </span>
                <div>
                  <div className="font-semibold text-[color:var(--ink)]">{item.title}</div>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--ink-muted)]">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Link
          href="/sims/simulations"
          className="pop-hover group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-sm)] hover:border-[color:var(--border-strong)]"
        >
          <div className="blob-decoration" aria-hidden="true" />
          <div className="relative z-[1]">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--experiment)]">
              🧫 Interactive model
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-[color:var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>
              Explore a full cell simulation
            </p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--ink-muted)]">
              Walk through organelles, the secretory pathway, and central dogma interactions when a diagram alone isn&apos;t enough.
            </p>
          </div>
          <p className="relative z-[1] mt-6 text-sm font-semibold text-[color:var(--brand-dark)] transition group-hover:text-[color:var(--brand)]">
            Open the simulation &rarr;
          </p>
        </Link>
      </section>
    </main>
  );
}
