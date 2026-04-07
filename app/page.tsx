import Link from "next/link";
import { ToolCard } from "./components/ui/study-kit";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_18%,#dff4ea_0%,#f7f8fc_36%,#eef5ff_66%,#e8f5f8_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto grid w-full max-w-6xl gap-5">
        <section className="grid gap-4 py-2 sm:py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Allidaps Biology</p>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Study AP Biology with confidence</h1>
          <p className="max-w-3xl text-pretty text-slate-600 sm:text-lg">
            Use focused active-recall practice, AP-style review sets, visual chi-square labs, and an immersive cell simulation to prep smarter every day.
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Link href="/sims/active-recall" className="rounded-xl border border-sky-700 bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700">
              Start studying
            </Link>
            <Link href="/sims/simulations" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Open cell simulation
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ToolCard
            title="Practice!"
            description="Practice fixed AP Biology question sets with instant feedback and clear explanations."
            href="/sims/active-recall/unit"
            tone="blue"
          />
          <ToolCard
            title="AP Review"
            description="Train with all-unit AP-style MCQs by difficulty to sharpen exam decision-making."
            href="/sims/active-recall/ap"
            tone="teal"
          />
          <ToolCard
            title="Chi-Square Lab"
            description="Visualize observed vs expected counts and interpret chi-square outcomes clearly."
            href="/sims/chi-square"
            tone="amber"
          />
          <ToolCard
            title="Cell Simulation"
            description="Explore organelles and central dogma interactions in a complete interactive cell model."
            href="/sims/simulations"
            tone="slate"
          />
        </section>
      </main>
    </div>
  );
}
