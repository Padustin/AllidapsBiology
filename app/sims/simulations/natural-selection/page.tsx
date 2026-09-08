"use client";

import { useState } from "react";
import { PageHeader, SectionCard, StatCard, TipCard } from "../../../components/ui/study-kit";

const POPULATION_SIZE = 48;
const GRID_COLS = 8;

function nextQ(q: number, s: number) {
  // q' = q(1 - s*q) / (1 - s*q^2) — selection acting against the recessive (aa) phenotype.
  const numerator = q * (1 - s * q);
  const denominator = 1 - s * q * q;
  if (denominator <= 0) return 0;
  return Math.min(1, Math.max(0, numerator / denominator));
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let state = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    state = (state * 9301 + 49297) % 233280;
    const j = Math.floor((state / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function Moth({ light }: { light: boolean }) {
  const gradId = light ? "moth-light" : "moth-dark";
  const wingStroke = light ? "#8a7550" : "#140d06";
  return (
    <svg viewBox="0 0 40 28" style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <radialGradient id={gradId} cx="35%" cy="28%" r="90%">
          {light ? (
            <>
              <stop offset="0%" stopColor="#f6f0dd" />
              <stop offset="60%" stopColor="#d9c99a" />
              <stop offset="100%" stopColor="#a68f5c" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#5c4128" />
              <stop offset="60%" stopColor="#33210f" />
              <stop offset="100%" stopColor="#160d05" />
            </>
          )}
        </radialGradient>
      </defs>

      {/* hindwings, peeking out from behind the forewings */}
      <path d="M14 17 C11 22, 3 23, 3 17 C3 14, 9 13, 14 15 Z" fill={`url(#${gradId})`} stroke={wingStroke} strokeWidth="0.7" opacity="0.9" transform="rotate(-6 14 17)" />
      <path d="M26 17 C29 22, 37 23, 37 17 C37 14, 31 13, 26 15 Z" fill={`url(#${gradId})`} stroke={wingStroke} strokeWidth="0.7" opacity="0.9" transform="rotate(6 26 17)" />

      {/* forewings, pointed and slightly scalloped */}
      <path d="M13 14 C11 4, 1 2, 1 10 C1 15, 3 19, 8 20 C11 21, 13 18, 13 14 Z" fill={`url(#${gradId})`} stroke={wingStroke} strokeWidth="0.9" transform="rotate(-4 13 14)" />
      <path d="M27 14 C29 4, 39 2, 39 10 C39 15, 37 19, 32 20 C29 21, 27 18, 27 14 Z" fill={`url(#${gradId})`} stroke={wingStroke} strokeWidth="0.9" transform="rotate(4 27 14)" />

      {light ? (
        <>
          {([[5, 9], [9, 13], [4, 15], [8, 6], [32, 9], [30, 14], [35, 16], [31, 6]] as const).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={0.7 + (i % 3) * 0.25} fill="#7a6640" opacity="0.55" />
          ))}
        </>
      ) : (
        <>
          <path d="M4 9 Q9 12 12 8" fill="none" stroke="#0d0800" strokeWidth="0.9" opacity="0.55" />
          <path d="M36 9 Q31 12 28 8" fill="none" stroke="#0d0800" strokeWidth="0.9" opacity="0.55" />
        </>
      )}

      {/* body with a soft highlight down the spine */}
      <ellipse cx="20" cy="14" rx="3.1" ry="9.5" fill={light ? "#c9b378" : "#241608"} stroke={wingStroke} strokeWidth="0.9" />
      <ellipse cx="19.3" cy="10" rx="1" ry="4" fill={light ? "#f2e9cc" : "#5c4128"} opacity="0.55" />

      {/* antennae */}
      <path d="M18.5 6 Q16 2 13.5 2.5" fill="none" stroke={wingStroke} strokeWidth="0.7" strokeLinecap="round" />
      <path d="M21.5 6 Q24 2 26.5 2.5" fill="none" stroke={wingStroke} strokeWidth="0.7" strokeLinecap="round" />
    </svg>
  );
}

function BarkBackdrop() {
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
      <defs>
        <linearGradient id="ns-bark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8a715a" />
          <stop offset="100%" stopColor="#6b5541" />
        </linearGradient>
      </defs>
      <rect width="400" height="40" fill="url(#ns-bark)" />
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} d={`M${i * 42} 0 q${8} 20 -${4} 40`} stroke="#4d3c2b" strokeWidth="2" fill="none" opacity="0.4" />
      ))}
    </svg>
  );
}

// Every earlier panel only ever shows the current generation's snapshot — this is the one
// place a student can actually see allele frequency changing over time instead of inferring
// it from re-reading a single number after each click.
const TREND_W = 460;
const TREND_H = 220;
const TREND_MARGIN = { top: 14, right: 16, bottom: 30, left: 34 };
const TREND_PLOT_W = TREND_W - TREND_MARGIN.left - TREND_MARGIN.right;
const TREND_PLOT_H = TREND_H - TREND_MARGIN.top - TREND_MARGIN.bottom;

function GenerationTrendChart({ history }: { history: { gen: number; q: number }[] }) {
  const maxGen = Math.max(10, history[history.length - 1].gen);
  const xScale = (g: number) => TREND_MARGIN.left + (g / maxGen) * TREND_PLOT_W;
  const yScale = (v: number) => TREND_MARGIN.top + TREND_PLOT_H - v * TREND_PLOT_H;

  const qPath = `M ${history.map((pt) => `${xScale(pt.gen).toFixed(1)} ${yScale(pt.q).toFixed(1)}`).join(" L ")}`;
  const pPath = `M ${history.map((pt) => `${xScale(pt.gen).toFixed(1)} ${yScale(1 - pt.q).toFixed(1)}`).join(" L ")}`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const last = history[history.length - 1];

  return (
    <svg viewBox={`0 0 ${TREND_W} ${TREND_H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {yTicks.map((t) => (
        <line key={t} x1={TREND_MARGIN.left} x2={TREND_W - TREND_MARGIN.right} y1={yScale(t)} y2={yScale(t)} stroke="#e5e0d3" strokeWidth="1" />
      ))}
      <line x1={TREND_MARGIN.left} x2={TREND_MARGIN.left} y1={TREND_MARGIN.top} y2={TREND_MARGIN.top + TREND_PLOT_H} stroke="#6b7280" strokeWidth="1.2" />
      <line x1={TREND_MARGIN.left} x2={TREND_W - TREND_MARGIN.right} y1={TREND_MARGIN.top + TREND_PLOT_H} y2={TREND_MARGIN.top + TREND_PLOT_H} stroke="#6b7280" strokeWidth="1.2" />
      {yTicks.map((t) => (
        <text key={t} x={TREND_MARGIN.left - 6} y={yScale(t) + 3} textAnchor="end" fontSize="9" fill="#6b7280">{t.toFixed(2)}</text>
      ))}
      <text x={TREND_MARGIN.left + TREND_PLOT_W / 2} y={TREND_H - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="#1f2e2a">Generation</text>

      <path d={pPath} fill="none" stroke="#3b2617" strokeWidth="2.4" strokeLinecap="round" />
      <path d={qPath} fill="none" stroke="#c8933f" strokeWidth="2.4" strokeLinecap="round" />

      <circle cx={xScale(last.gen)} cy={yScale(1 - last.q)} r="4" fill="#3b2617" />
      <circle cx={xScale(last.gen)} cy={yScale(last.q)} r="4" fill="#c8933f" />

      <g transform={`translate(${TREND_MARGIN.left + 6} ${TREND_MARGIN.top + 4})`}>
        <circle r="4" fill="#3b2617" />
        <text x="9" y="3.5" fontSize="10" fontWeight="700" fill="#3b2617">p (A)</text>
        <circle cx="52" r="4" fill="#c8933f" />
        <text x="61" y="3.5" fontSize="10" fontWeight="700" fill="#c8933f">q (a)</text>
      </g>
    </svg>
  );
}

export default function NaturalSelectionPage() {
  const [startP, setStartP] = useState(0.6);
  const [selection, setSelection] = useState(0.3);
  // The full run, not just the current snapshot — this is what lets the trend chart show
  // allele frequency actually changing across generations instead of just its latest value.
  const [history, setHistory] = useState<{ gen: number; q: number }[]>([{ gen: 0, q: 0.4 }]);

  const resetWith = (newStartP: number, newSelection: number) => {
    setStartP(newStartP);
    setSelection(newSelection);
    setHistory([{ gen: 0, q: 1 - newStartP }]);
  };

  const advance = (steps: number) => {
    setHistory((h) => {
      const last = h[h.length - 1];
      let curQ = last.q;
      let curGen = last.gen;
      const newPoints: { gen: number; q: number }[] = [];
      for (let i = 0; i < steps; i++) {
        curQ = nextQ(curQ, selection);
        curGen += 1;
        newPoints.push({ gen: curGen, q: curQ });
      }
      return [...h, ...newPoints];
    });
  };

  const { gen: generation, q } = history[history.length - 1];
  const p = 1 - q;
  const countAA = Math.round(p * p * POPULATION_SIZE);
  const countAa = Math.round(2 * p * q * POPULATION_SIZE);
  const countAaHomo = Math.max(0, POPULATION_SIZE - countAA - countAa);

  const population = seededShuffle(
    [
      ...Array.from({ length: countAA + countAa }, () => false),
      ...Array.from({ length: countAaHomo }, () => true),
    ],
    generation * 7 + 3,
  );

  const isInEquilibrium = selection === 0;

  return (
    <main className="grid gap-8">
      <PageHeader
        eyebrow="Unit 7 · Natural selection"
        align="start"
        title="Natural selection & Hardy-Weinberg"
        description="A population of peppered moths: dark moths carry at least one dominant allele (A), light moths are homozygous recessive (aa). Set the starting frequencies, apply selection pressure, and advance generations to watch the population's coloring shift."
      />

      <SectionCard title="Population setup" description="p = frequency of allele A (dark), q = frequency of allele a (light). p + q always equals 1.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
            Starting frequency of A (p₀): {startP.toFixed(2)}
            <input type="range" min={0.05} max={0.95} step={0.01} value={startP} onChange={(e) => resetWith(Number(e.target.value), selection)} style={{ accentColor: "var(--brand)" }} />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
            Selection against aa (s): {selection.toFixed(2)}
            <input type="range" min={0} max={1} step={0.01} value={selection} onChange={(e) => resetWith(startP, Number(e.target.value))} style={{ accentColor: "var(--statistics)" }} />
          </label>

          <div className="grid gap-2">
            <span className="text-sm font-semibold text-[color:var(--ink)]">Run the population forward</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => advance(1)} className="accent-gradient rounded-full px-4 py-2 text-sm font-semibold text-white transition">
                +1 generation
              </button>
              <button type="button" onClick={() => advance(5)} className="rounded-full border-2 border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)]">
                +5 generations
              </button>
              <button type="button" onClick={() => resetWith(startP, selection)} className="rounded-full border-2 border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)]">
                Reset
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={`Generation ${generation}`} description="Every icon below is one moth in the population, sized to match the actual genotype frequencies.">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.75fr)] lg:items-start">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
            <BarkBackdrop />
            <div className="relative z-[1] grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}>
              {population.map((light, i) => (
                <div key={i} className="p-0.5" title={light ? "aa — light phenotype" : "A_ — dark phenotype"}>
                  <Moth light={light} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="p — dominant allele" value={p.toFixed(3)} tone="accent" />
              <StatCard label="q — recessive allele" value={q.toFixed(3)} tone="rose" />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-xs font-semibold text-[color:var(--ink-muted)]">
                <span>Gene pool</span>
                <span>{(p * 100).toFixed(0)}% A · {(q * 100).toFixed(0)}% a</span>
              </div>
              <div className="flex h-4 overflow-hidden rounded-full border border-[color:var(--border)]">
                <div style={{ width: `${p * 100}%`, background: "#3b2617" }} />
                <div style={{ width: `${q * 100}%`, background: "#e9dfc7" }} />
              </div>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2">
                <span className="font-medium text-[color:var(--ink)]">AA + Aa (dark)</span>
                <span className="font-semibold text-[color:var(--ink)]">{countAA + countAa} moths</span>
              </div>
              <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2">
                <span className="font-medium text-[color:var(--ink)]">aa (light)</span>
                <span className="font-semibold text-[color:var(--ink)]">{countAaHomo} moths</span>
              </div>
            </div>

            <TipCard label={isInEquilibrium ? "Equilibrium" : "Selection is acting"}>
              {isInEquilibrium
                ? "With s = 0, allele frequencies don't change from generation to generation — this population is in Hardy-Weinberg equilibrium."
                : "Light (aa) moths are more visible to predators against dark bark, so q falls each generation — fast at first, then slower as aa moths become rare and harder to select against further."}
            </TipCard>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Allele frequency across generations" description="Every earlier panel only shows the current generation — this is the trend that produced it.">
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
          <GenerationTrendChart history={history} />
        </div>
      </SectionCard>

      <SectionCard title="The five conditions for Hardy-Weinberg equilibrium" description="A population only stays in equilibrium if all five hold. This simulation only breaks one of them on purpose.">
        <ul className="grid gap-2.5 pl-5 text-[15px] leading-7 text-[color:var(--ink)] marker:text-[color:var(--brand)]" style={{ listStyleType: "disc" }}>
          <li>No mutation — allele forms aren&apos;t being created or lost.</li>
          <li>Random mating — no preference for particular genotypes.</li>
          <li>No gene flow — no individuals migrating in or out.</li>
          <li>Very large population — no random drift from small sample sizes.</li>
          <li>No natural selection — every genotype survives and reproduces equally (this is the one the slider above breaks).</li>
        </ul>
      </SectionCard>
    </main>
  );
}
