"use client";

import { useMemo, useState } from "react";
import { PageHeader, SectionCard, StatCard, TipCard } from "../../../components/ui/study-kit";

type InhibitorType = "none" | "competitive" | "noncompetitive";

const VMAX_BASE = 100;
const KM_BASE = 28;

function gaussian(x: number, center: number, sigmaLow: number, sigmaHigh: number) {
  const sigma = x < center ? sigmaLow : sigmaHigh;
  return Math.exp(-((x - center) ** 2) / (2 * sigma * sigma));
}

// Structural stability is a different thing from reaction rate: cold slows an enzyme down
// without unfolding it, but heat above ~55°C and extreme pH break the bonds holding its shape
// together. (Real denaturation is usually permanent — this simulator lets it re-fold when
// conditions return to normal so you can keep exploring, which the copy below calls out.)
function foldStability(temperature: number, ph: number) {
  // Tuned so the "denatured" state (foldedness < 0.15, see isDenatured below) actually kicks
  // in right around 70°C at neutral pH, matching the copy on the temperature slider.
  const tempStability = temperature <= 55 ? 1 : gaussian(temperature, 55, 1, 7.7);
  const phStability = gaussian(ph, 7, 2.5, 2.5);
  return tempStability * phStability;
}

type Point = readonly [number, number];

// Smooth closed loop through a set of points, via Catmull-Rom splines converted to cubic beziers.
function smoothClosedPath(points: readonly Point[]): string {
  const n = points.length;
  const at = (i: number) => points[((i % n) + n) % n];
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return `${d}Z`;
}

// The enzyme's folded outline: a kidney-bean shape with a deep, obvious pocket (the active
// site) carved into its right side, between two lobes — point 5 is the base of that pocket.
const ACTIVE_SITE = [146, 98] as const;
const ENZYME_FOLDED_POINTS: readonly Point[] = [
  [56, 100],
  [80, 38],
  [138, 6],
  [196, 22],
  [224, 63],
  ACTIVE_SITE,
  [224, 137],
  [196, 178],
  [138, 194],
  [80, 162],
];

// Where each point flies apart toward as the protein unravels — pulls the active-site pocket
// shut and spreads the whole outline into a loose, irregular tangle.
const ENZYME_DENATURE_OFFSET: readonly Point[] = [
  [-32, 10],
  [-16, -36],
  [8, -50],
  [42, -32],
  [72, -8],
  [78, 50],
  [72, 20],
  [44, 54],
  [-6, 46],
  [-36, 32],
];

function enzymeOutline(foldedness: number): string {
  const t = 1 - Math.max(0, Math.min(1, foldedness));
  const points = ENZYME_FOLDED_POINTS.map(([x, y], i) => {
    const [ox, oy] = ENZYME_DENATURE_OFFSET[i];
    return [x + ox * t, y + oy * t] as Point;
  });
  return smoothClosedPath(points);
}

// A rounded wedge that tapers to a point — shaped so it visually plugs into the pocket's
// V-notch, the way a puzzle piece (or a real substrate's complementary shape) fits a socket.
// Drawn pointing left (toward negative x) so it can dock nose-first into the active site.
const WEDGE_PATH = "M -15 0 Q -9 -11 4 -10 Q 15 -8 15 0 Q 15 8 4 10 Q -9 11 -15 0 Z";

function useKineticsModel(substrate: number, temperature: number, ph: number, inhibitor: InhibitorType) {
  return useMemo(() => {
    const tempFactor = gaussian(temperature, 37, 22, 9);
    const phFactor = gaussian(ph, 7, 1.6, 1.6);
    const activityFactor = tempFactor * phFactor;

    let km = KM_BASE;
    let vmax = VMAX_BASE * activityFactor;

    if (inhibitor === "competitive") km = KM_BASE * 2.3;
    if (inhibitor === "noncompetitive") vmax = vmax * 0.5;

    const rateAt = (s: number) => (vmax * s) / (km + s);
    const currentRate = rateAt(substrate);
    const foldedness = foldStability(temperature, ph);

    return { km, vmax, activityFactor, tempFactor, phFactor, currentRate, foldedness };
  }, [substrate, temperature, ph, inhibitor]);
}

function EnzymeAnimation({ inhibitor, pulseDuration, foldedness }: { inhibitor: InhibitorType; pulseDuration: number; foldedness: number }) {
  const isDenatured = foldedness < 0.15;
  const outlineD = enzymeOutline(foldedness);
  const bandOpacity = Math.max(0, foldedness - 0.2) * 0.3;

  // The active site isn't a fixed point — it's wherever ENZYME_FOLDED_POINTS[5] (the pocket
  // vertex) actually is right now, which drifts as the outline unravels. Tracking it live keeps
  // the substrate, socket outline, inhibitor markers, and labels all honest about where the
  // pocket really is, even mid-unfold, instead of quietly detaching from the real shape.
  const t = 1 - Math.max(0, Math.min(1, foldedness));
  const [siteX, siteY] = [ACTIVE_SITE[0] + ENZYME_DENATURE_OFFSET[5][0] * t, ACTIVE_SITE[1] + ENZYME_DENATURE_OFFSET[5][1] * t];

  const substrateAnimation = isDenatured ? "enz-substrate-bounce" : inhibitor === "competitive" ? "enz-substrate-competitive" : "enz-substrate";

  return (
    <div key={`${inhibitor}-${isDenatured}`}>
      <style>{`
        @keyframes enz-substrate {
          0% { transform: translate(0px, 0px) rotate(0deg); opacity: 1; }
          38% { transform: translate(-108px, 0px) rotate(0deg); opacity: 1; }
          46% { transform: translate(-134px, 0px) rotate(0deg); opacity: 1; }
          54% { transform: translate(-134px, 0px) rotate(0deg); opacity: 0; }
          100% { transform: translate(-134px, 0px) rotate(0deg); opacity: 0; }
        }
        @keyframes enz-substrate-competitive {
          0% { transform: translate(0px, 0px) rotate(0deg); opacity: 1; }
          22% { transform: translate(-64px, 0px) rotate(0deg); opacity: 1; }
          32% { transform: translate(-86px, 18px) rotate(-18deg); opacity: 1; }
          40% { transform: translate(-108px, 6px) rotate(6deg); opacity: 1; }
          46% { transform: translate(-134px, 0px) rotate(0deg); opacity: 1; }
          54% { transform: translate(-134px, 0px) rotate(0deg); opacity: 0; }
          100% { transform: translate(-134px, 0px) rotate(0deg); opacity: 0; }
        }
        @keyframes enz-substrate-bounce {
          0% { transform: translate(0px, 0px); opacity: 1; }
          42% { transform: translate(-70px, 0px); opacity: 1; }
          55% { transform: translate(-46px, 6px); opacity: 1; }
          100% { transform: translate(0px, 0px); opacity: 1; }
        }
        @keyframes enz-flash {
          0%, 44% { opacity: 0; }
          50% { opacity: 0.9; }
          62% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes enz-product-a {
          0%, 54% { transform: translate(0px, 0px); opacity: 0; }
          62% { opacity: 1; transform: translate(14px, -10px); }
          100% { transform: translate(150px, -70px); opacity: 0; }
        }
        @keyframes enz-product-b {
          0%, 54% { transform: translate(0px, 0px); opacity: 0; }
          62% { opacity: 1; transform: translate(14px, 10px); }
          100% { transform: translate(150px, 70px); opacity: 0; }
        }
        .enz-substrate { animation: ${substrateAnimation} ${isDenatured ? Math.max(pulseDuration, 1.6) : pulseDuration}s ease-in-out infinite; }
        .enz-flash { animation: enz-flash ${pulseDuration}s ease-in-out infinite; ${isDenatured ? "display: none;" : ""} }
        .enz-product-a { animation: enz-product-a ${pulseDuration}s ease-in-out infinite; ${isDenatured ? "display: none;" : ""} }
        .enz-product-b { animation: enz-product-b ${pulseDuration}s ease-in-out infinite; ${isDenatured ? "display: none;" : ""} }
        @media (prefers-reduced-motion: reduce) {
          .enz-substrate, .enz-flash, .enz-product-a, .enz-product-b { animation: none; }
        }
      `}</style>
      <svg viewBox="0 0 360 210" style={{ width: "100%", maxWidth: 420, margin: "0 auto", display: "block" }}>
        <defs>
          <filter id="enz-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
          <radialGradient id="enz-body" cx="32%" cy="26%" r="85%">
            <stop offset="0%" stopColor="#c9d8d4" />
            <stop offset="55%" stopColor="#7fa398" />
            <stop offset="100%" stopColor="#3f5a52" />
          </radialGradient>
          <radialGradient id="enz-body-denatured" cx="32%" cy="26%" r="85%">
            <stop offset="0%" stopColor="#f3f0e9" />
            <stop offset="55%" stopColor="#d8d2c4" />
            <stop offset="100%" stopColor="#a9a08c" />
          </radialGradient>
          <radialGradient id="enz-substrate-grad" cx="35%" cy="30%" r="90%">
            <stop offset="0%" stopColor="#a9c8f0" />
            <stop offset="100%" stopColor="#2c4f8f" />
          </radialGradient>
          <radialGradient id="enz-product-a-grad" cx="32%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#f2b8d6" />
            <stop offset="100%" stopColor="#9d174d" />
          </radialGradient>
          <radialGradient id="enz-product-b-grad" cx="32%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#f7dfa0" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>
          <radialGradient id="enz-inhibitor-grad" cx="32%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#f0a89e" />
            <stop offset="100%" stopColor="#8a2e22" />
          </radialGradient>
        </defs>

        {/* enzyme body with a deep active-site pocket carved into its right side, plus a few
            ribbon bands to suggest secondary structure */}
        <path
          d={outlineD}
          fill={isDenatured ? "url(#enz-body-denatured)" : "url(#enz-body)"}
          stroke={isDenatured ? "#8a8270" : "#2c3f38"}
          strokeWidth="1.6"
          filter="url(#enz-shadow)"
          style={{ transition: "fill 0.3s ease" }}
        />
        <path d="M76 52 C108 36, 142 38, 168 55" fill="none" stroke="#2c3f38" strokeWidth="2" opacity={bandOpacity} strokeLinecap="round" />
        <path d="M68 100 C100 87, 138 87, 172 100" fill="none" stroke="#2c3f38" strokeWidth="2" opacity={bandOpacity} strokeLinecap="round" />
        <path d="M76 149 C108 163, 142 161, 168 146" fill="none" stroke="#2c3f38" strokeWidth="2" opacity={bandOpacity} strokeLinecap="round" />

        {/* a faint, permanent outline of the substrate's own shape sitting in the pocket —
            the "socket" a matching substrate fits, visible even before one arrives */}
        {!isDenatured ? (
          <path
            d={WEDGE_PATH}
            transform={`translate(${siteX} ${siteY})`}
            fill="none"
            stroke="#1c2f52"
            strokeWidth="1.3"
            strokeDasharray="3 2.5"
            opacity="0.35"
          />
        ) : null}

        {!isDenatured && inhibitor === "competitive" ? (
          <g transform={`translate(${siteX + 46} ${siteY})`}>
            <polygon points="0,-16 15,-5 9,14 -9,14 -15,-5" fill="url(#enz-inhibitor-grad)" stroke="#5c1a12" strokeWidth="1.4" />
            <text x="0" y="34" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7a2a1f">inhibitor</text>
          </g>
        ) : null}

        {!isDenatured && inhibitor === "noncompetitive" ? (
          <g transform="translate(95 165)">
            <polygon points="0,-16 15,-5 9,14 -9,14 -15,-5" fill="url(#enz-inhibitor-grad)" stroke="#5c1a12" strokeWidth="1.4" />
            <text x="0" y="32" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7a2a1f">inhibitor</text>
          </g>
        ) : null}

        {/* substrate: approaches from outside the pocket's mouth and docks nose-first into it */}
        <g transform={`translate(${siteX + 134} ${siteY})`}>
          <path className="enz-substrate" d={WEDGE_PATH} fill="url(#enz-substrate-grad)" stroke="#1c2f52" strokeWidth="1.2" />
        </g>

        {/* catalysis flash, right at the pocket */}
        <circle className="enz-flash" cx={siteX} cy={siteY} r="20" fill="#f0c869" opacity="0" />

        {/* products released from the pocket */}
        <g transform={`translate(${siteX} ${siteY})`}>
          <circle className="enz-product-a" r="8.5" fill="url(#enz-product-a-grad)" stroke="#5c0d2e" strokeWidth="1.1" />
        </g>
        <g transform={`translate(${siteX} ${siteY})`}>
          <circle className="enz-product-b" r="8.5" fill="url(#enz-product-b-grad)" stroke="#4a2306" strokeWidth="1.1" />
        </g>

        <text x={siteX} y={siteY + 34} textAnchor="middle" fontSize="9" fontWeight="700" fill="#1f2e2a" opacity={isDenatured ? 0 : 0.75}>
          active site
        </text>
        {isDenatured ? (
          <text x={siteX + 20} y={siteY + 5} textAnchor="middle" fontSize="11" fontWeight="700" fill="#6b6350">
            denatured
          </text>
        ) : null}
      </svg>
    </div>
  );
}

const INHIBITOR_OPTIONS: { value: InhibitorType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "competitive", label: "Competitive" },
  { value: "noncompetitive", label: "Noncompetitive" },
];

export default function EnzymeKineticsPage() {
  const [substrate, setSubstrate] = useState(40);
  const [temperature, setTemperature] = useState(37);
  const [ph, setPh] = useState(7);
  const [inhibitor, setInhibitor] = useState<InhibitorType>("none");

  const { km, vmax, currentRate, foldedness } = useKineticsModel(substrate, temperature, ph, inhibitor);
  const pulseDuration = Math.max(0.4, 3.2 - currentRate / 30);
  const isDenatured = foldedness < 0.15;

  return (
    <main className="grid gap-8">
      <PageHeader
        eyebrow="Unit 3 · Cellular energetics"
        align="start"
        title="Enzyme kinetics lab"
        description="Adjust substrate concentration, temperature, pH, and inhibitors, and watch how each one reshapes the reaction-rate curve."
      />

      <SectionCard title="Reaction conditions" description="Change one variable at a time to see what it actually controls.">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(280px,1.05fr)] lg:items-start">
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
              Substrate concentration [S]: {substrate}
              <input type="range" min={0} max={100} step={1} value={substrate} onChange={(e) => setSubstrate(Number(e.target.value))} style={{ accentColor: "var(--brand)" }} />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
              Temperature: {temperature}°C
              <input type="range" min={0} max={80} step={1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} style={{ accentColor: "var(--foundation)" }} />
              <span className="text-xs font-normal text-[color:var(--ink-faint)]">Optimum ≈ 37°C. Above ~70°C the enzyme&apos;s shape breaks down (denatures).</span>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
              pH: {ph.toFixed(1)}
              <input type="range" min={2} max={12} step={0.5} value={ph} onChange={(e) => setPh(Number(e.target.value))} style={{ accentColor: "var(--statistics)" }} />
              <span className="text-xs font-normal text-[color:var(--ink-faint)]">Optimum ≈ pH 7. Too far from it — either direction — also denatures the enzyme.</span>
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Inhibitor</span>
              <div className="inline-flex w-fit flex-wrap rounded-full border-2 border-[color:var(--border)] bg-[color:var(--surface)] p-1">
                {INHIBITOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setInhibitor(option.value)}
                    aria-pressed={inhibitor === option.value}
                    className={
                      inhibitor === option.value
                        ? "accent-gradient rounded-full px-4 py-2 text-sm font-semibold text-white transition"
                        : "rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--ink-muted)] transition hover:text-[color:var(--ink)]"
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Rate at this [S]" value={currentRate.toFixed(1)} tone="accent" />
              <StatCard label="Vmax (this trial)" value={vmax.toFixed(1)} tone="amber" />
              <StatCard label="Km (this trial)" value={km.toFixed(1)} tone="rose" />
            </div>

            <TipCard label="Reading Km">
              Km is the substrate concentration where the rate hits half of Vmax — a lower Km means the enzyme reaches full speed with less substrate around.
            </TipCard>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:p-6">
            <p className="mb-1 text-sm font-semibold text-[color:var(--ink)]">Substrate binding, in action</p>
            <p className="mb-4 text-xs text-[color:var(--ink-faint)]">
              {isDenatured
                ? "Denatured: the heat or pH broke the bonds holding the enzyme's shape, so the pocket the substrate used to fit into is gone. (In a real cell this is usually permanent — here, bring temperature and pH back near normal and it will re-fold, so you can keep exploring.)"
                : foldedness < 0.55
                  ? "Starting to unfold — conditions are stressing the enzyme's shape, so the substrate's fit into the active site is getting less reliable."
                  : "The substrate's shape matches the active site's pocket exactly — that's why only this molecule binds. Watch it dock, react, and split into two products."}
            </p>

            <EnzymeAnimation inhibitor={inhibitor} pulseDuration={pulseDuration} foldedness={foldedness} />

            <div className="mt-4 flex flex-wrap justify-center gap-4 border-t border-[color:var(--border)] pt-4 text-xs font-semibold text-[color:var(--ink-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: "#2c4f8f" }} aria-hidden="true" />
                Substrate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: "#9d174d" }} aria-hidden="true" />
                Product
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: "#4d6b64" }} aria-hidden="true" />
                Enzyme
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="What each variable is actually doing" description="Same equation, four different knobs.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <p className="font-semibold text-[color:var(--ink)]">Competitive inhibitor</p>
            <p className="mt-1.5 text-sm leading-6 text-[color:var(--ink-muted)]">
              Blocks the entrance to the active site, so it takes more substrate to reach the same rate — Km goes up. Enough substrate can still out-compete the inhibitor, so Vmax is unchanged.
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <p className="font-semibold text-[color:var(--ink)]">Noncompetitive inhibitor</p>
            <p className="mt-1.5 text-sm leading-6 text-[color:var(--ink-muted)]">
              Binds somewhere other than the active site and disables the enzyme regardless of substrate — Vmax drops. Adding more substrate can&apos;t fix it, so Km stays the same.
            </p>
          </div>
        </div>
      </SectionCard>
    </main>
  );
}
