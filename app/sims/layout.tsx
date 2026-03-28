"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function SimsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  function navClass(href: string) {
    const isActive = pathname === href;
    if (isActive) {
      return "block rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm font-semibold text-sky-900 shadow-sm";
    }
    return "block rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-200 hover:bg-white hover:text-slate-900";
  }

  function sectionTitleClass(isActive: boolean) {
    return isActive ? "mb-2 text-xs font-bold uppercase tracking-wide text-sky-700" : "mb-2 text-xs font-bold uppercase tracking-wide text-slate-500";
  }

  return (
    <div className="h-dvh overflow-hidden bg-slate-50">
      <div className="grid h-dvh w-full grid-cols-[290px_minmax(0,1fr)]">
        <aside className="hidden h-dvh flex-col border-r border-slate-200 bg-slate-100/70 p-4 md:flex">
          <div className="dna-title-card relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <svg
              aria-hidden="true"
              className="dna-flow"
              viewBox="0 0 520 120"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="dnaA" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="dnaB" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <symbol id="dna-segment" viewBox="0 0 240 120">
                  <path
                    d="M0 20 C30 20, 30 100, 60 100 C90 100, 90 20, 120 20 C150 20, 150 100, 180 100 C210 100, 210 20, 240 20"
                    fill="none"
                    stroke="url(#dnaA)"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 100 C30 100, 30 20, 60 20 C90 20, 90 100, 120 100 C150 100, 150 20, 180 20 C210 20, 210 100, 240 100"
                    fill="none"
                    stroke="url(#dnaB)"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                  />

                  <line x1="15" y1="28" x2="15" y2="92" className="dna-rung-front" />
                  <line x1="45" y1="48" x2="45" y2="72" className="dna-rung-back" />
                  <line x1="75" y1="76" x2="75" y2="44" className="dna-rung-back" />
                  <line x1="105" y1="94" x2="105" y2="26" className="dna-rung-front" />
                  <line x1="135" y1="76" x2="135" y2="44" className="dna-rung-back" />
                  <line x1="165" y1="48" x2="165" y2="72" className="dna-rung-back" />
                  <line x1="195" y1="28" x2="195" y2="92" className="dna-rung-front" />
                  <line x1="225" y1="22" x2="225" y2="98" className="dna-rung-front" />

                  <circle cx="15" cy="28" r="2.3" className="dna-node" />
                  <circle cx="15" cy="92" r="2.3" className="dna-node" />
                  <circle cx="105" cy="94" r="2.3" className="dna-node" />
                  <circle cx="105" cy="26" r="2.3" className="dna-node" />
                  <circle cx="195" cy="28" r="2.3" className="dna-node" />
                  <circle cx="195" cy="92" r="2.3" className="dna-node" />
                  <circle cx="225" cy="22" r="2.3" className="dna-node" />
                  <circle cx="225" cy="98" r="2.3" className="dna-node" />
                </symbol>
              </defs>
              <use href="#dna-segment" x="-220" y="0" />
              <use href="#dna-segment" x="0" y="0" />
              <use href="#dna-segment" x="220" y="0" />
              <use href="#dna-segment" x="440" y="0" />
              <use href="#dna-segment" x="660" y="0" />
            </svg>
            <p className="relative z-20 text-2xl font-extrabold leading-tight text-slate-900">Allidaps Biology</p>
          </div>

          <nav className="mt-4 space-y-4 overflow-auto pr-1">
            <section>
              <p className={sectionTitleClass(pathname.startsWith("/sims/active-recall"))}>Active Recall</p>
              <div className="space-y-1.5">
                <Link href="/sims/active-recall/ap" className={navClass("/sims/active-recall/ap")}>All-Unit MCQ Practice</Link>
                <Link href="/sims/active-recall/unit" className={navClass("/sims/active-recall/unit")}>Unit MCQ Practice</Link>
                <Link href="/sims/active-recall/frq-all" className={navClass("/sims/active-recall/frq-all")}>All-Unit FRQ Practice</Link>
                <Link href="/sims/active-recall/frq-unit" className={navClass("/sims/active-recall/frq-unit")}>Unit FRQ Practice</Link>
              </div>
            </section>

            <section>
              <p className={sectionTitleClass(pathname.startsWith("/sims/chi-square"))}>Labs</p>
              <div className="space-y-1.5">
                <Link href="/sims/chi-square" className={navClass("/sims/chi-square")}>Chi-Square Visual Lab</Link>
                <Link href="/sims/chi-square/explanation" className={navClass("/sims/chi-square/explanation")}>Chi-Square Concept Guide</Link>
              </div>
            </section>

            <section>
              <p className={sectionTitleClass(pathname.startsWith("/sims/simulations"))}>Simulation</p>
              <div className="space-y-1.5">
                <Link href="/sims/simulations" className={navClass("/sims/simulations")}>Cell Systems Simulation</Link>
              </div>
            </section>

            <section>
              <p className={sectionTitleClass(pathname.startsWith("/sims/feedback"))}>Support</p>
              <div className="space-y-1.5">
                <Link href="/sims/feedback" className={navClass("/sims/feedback")}>Share Feedback</Link>
              </div>
            </section>
          </nav>

          <p className="mt-auto px-2 pt-3 text-xs text-slate-500">Built by Justin A Padilla</p>
        </aside>

        <main className="h-dvh min-w-0 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-bold text-slate-900">Allidaps Biology</p>
              <Link href="/sims/active-recall" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700">
                Study Menu
              </Link>
            </div>
          </header>
          <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}