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

function livePoint(index: number, t: number): Point {
  const [x, y] = ENZYME_FOLDED_POINTS[index];
  const [ox, oy] = ENZYME_DENATURE_OFFSET[index];
  return [x + ox * t, y + oy * t];
}

function enzymeOutline(t: number): string {
  const points = ENZYME_FOLDED_POINTS.map((_, i) => livePoint(i, t));
  return smoothClosedPath(points);
}

// A rounded wedge that tapers to a point — shaped so it visually plugs into the pocket's
// V-notch, the way a puzzle piece (or a real substrate's complementary shape) fits a socket.
// Drawn pointing left (toward negative x) so it can dock nose-first into the active site.
const WEDGE_PATH = "M -15 0 Q -9 -11 4 -10 Q 15 -8 15 0 Q 15 8 4 10 Q -9 11 -15 0 Z";

// Loose arc of "waiting" molecule positions around the pocket's mouth — how many of these are
// actually drawn is what makes substrate CONCENTRATION visible, not just reaction speed.
const AMBIENT_ANCHORS: readonly Point[] = [[300, 25], [332, 58], [338, 104], [330, 150], [296, 182], [258, 22]];

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

function EnzymeAnimation({
  inhibitor,
  pulseDuration,
  foldedness,
  substrate,
  runId,
  onRunEnd,
}: {
  inhibitor: InhibitorType;
  pulseDuration: number;
  foldedness: number;
  substrate: number;
  runId: number;
  onRunEnd: () => void;
}) {
  const isDenatured = foldedness < 0.15;
  const t = 1 - Math.max(0, Math.min(1, foldedness));
  const outlineD = enzymeOutline(t);
  const bandOpacity = Math.max(0, foldedness - 0.2) * 0.3;

  // The active site isn't a fixed point — it's wherever ENZYME_FOLDED_POINTS[5] (the pocket
  // vertex) actually is right now, which drifts as the outline unravels. Tracking it live keeps
  // the substrate, socket outline, inhibitor markers, and labels all honest about where the
  // pocket really is, even mid-unfold, instead of quietly detaching from the real shape.
  const [siteX, siteY] = livePoint(5, t);
  // The noncompetitive inhibitor sits on the enzyme's back — nowhere near the active site — so
  // it's anchored to a different point on the same live outline (the top lobe), nudged inward
  // so it visibly rests on the body instead of hanging off the edge.
  const [backX, backY] = livePoint(2, t);

  const substrateAnimationName = inhibitor === "competitive" ? "enz-substrate-competitive" : "enz-substrate";
  const ambientCount = Math.round((substrate / 100) * AMBIENT_ANCHORS.length);

  return (
    <div>
      <style>{`
        @keyframes enz-substrate {
          0% { transform: translate(0px, 0px) rotate(0deg); opacity: 1; }
          38% { transform: translate(-108px, 0px) rotate(0deg); opacity: 1; }
          46% { transform: translate(-134px, 0px) rotate(0deg); opacity: 1; }
          58% { transform: translate(-134px, 0px) rotate(0deg); opacity: 0; }
          100% { transform: translate(-134px, 0px) rotate(0deg); opacity: 0; }
        }
        @keyframes enz-substrate-competitive {
          0% { transform: translate(0px, 0px) rotate(0deg); opacity: 1; }
          22% { transform: translate(-64px, 0px) rotate(0deg); opacity: 1; }
          32% { transform: translate(-86px, 18px) rotate(-18deg); opacity: 1; }
          40% { transform: translate(-108px, 6px) rotate(6deg); opacity: 1; }
          46% { transform: translate(-134px, 0px) rotate(0deg); opacity: 1; }
          58% { transform: translate(-134px, 0px) rotate(0deg); opacity: 0; }
          100% { transform: translate(-134px, 0px) rotate(0deg); opacity: 0; }
        }
        @keyframes enz-idle-bounce {
          0% { transform: translate(0px, 0px); opacity: 1; }
          42% { transform: translate(-70px, 0px); opacity: 1; }
          55% { transform: translate(-46px, 6px); opacity: 1; }
          100% { transform: translate(0px, 0px); opacity: 1; }
        }
        @keyframes enz-idle-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes enz-flash {
          0%, 44% { opacity: 0; }
          50% { opacity: 0.9; }
          62% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes enz-product-a {
          0%, 58% { transform: translate(0px, 0px); opacity: 0; }
          66% { opacity: 1; transform: translate(14px, -10px); }
          100% { transform: translate(150px, -70px); opacity: 0; }
        }
        @keyframes enz-product-b {
          0%, 58% { transform: translate(0px, 0px); opacity: 0; }
          66% { opacity: 1; transform: translate(14px, 10px); }
          100% { transform: translate(150px, 70px); opacity: 0; }
        }
        .enz-play-substrate { animation: ${substrateAnimationName} ${pulseDuration}s ease-in-out 1 both; }
        .enz-play-flash { animation: enz-flash ${pulseDuration}s ease-in-out 1 both; }
        .enz-play-product-a { animation: enz-product-a ${pulseDuration}s ease-in-out 1 both; }
        .enz-play-product-b { animation: enz-product-b ${pulseDuration}s ease-in-out 1 both; }
        .enz-idle-bounce { animation: enz-idle-bounce ${Math.max(pulseDuration, 1.6)}s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .enz-play-substrate, .enz-play-flash, .enz-play-product-a, .enz-play-product-b, .enz-idle-bounce { animation: none; }
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

        {/* substrate molecules waiting nearby — how many are visible IS the concentration */}
        {!isDenatured
          ? AMBIENT_ANCHORS.slice(0, ambientCount).map(([ax, ay], i) => (
              <circle
                key={i}
                cx={ax}
                cy={ay}
                r="6"
                fill="url(#enz-substrate-grad)"
                stroke="#1c2f52"
                strokeWidth="1"
                opacity="0.85"
                style={{ animation: `enz-idle-bob ${2.4 + (i % 3) * 0.4}s ease-in-out ${(i * 0.3).toFixed(1)}s infinite` }}
              />
            ))
          : null}

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
            <text x="0" y="-22" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7a2a1f">inhibitor</text>
          </g>
        ) : null}

        {!isDenatured && inhibitor === "noncompetitive" ? (
          <g transform={`translate(${backX} ${backY + 34})`}>
            <polygon points="0,-16 15,-5 9,14 -9,14 -15,-5" fill="url(#enz-inhibitor-grad)" stroke="#5c1a12" strokeWidth="1.4" />
            <text x="0" y="32" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7a2a1f">inhibitor</text>
          </g>
        ) : null}

        {/* the reacting substrate: sits at rest until "Run reaction" is clicked, then docks
            nose-first into the pocket, reacts, and splits into two products */}
        {isDenatured ? (
          <g transform={`translate(${siteX + 134} ${siteY})`}>
            <path className="enz-idle-bounce" d={WEDGE_PATH} fill="url(#enz-substrate-grad)" stroke="#1c2f52" strokeWidth="1.2" />
          </g>
        ) : (
          <g key={`${inhibitor}-${runId}`} transform={`translate(${siteX + 134} ${siteY})`}>
            <path
              className={runId > 0 ? "enz-play-substrate" : ""}
              d={WEDGE_PATH}
              fill="url(#enz-substrate-grad)"
              stroke="#1c2f52"
              strokeWidth="1.2"
              onAnimationEnd={runId > 0 ? onRunEnd : undefined}
            />
          </g>
        )}

        {!isDenatured && runId > 0 ? (
          <g key={`flash-${inhibitor}-${runId}`}>
            <circle className="enz-play-flash" cx={siteX} cy={siteY} r="20" fill="#f0c869" opacity="0" />
            <g transform={`translate(${siteX} ${siteY})`}>
              <circle className="enz-play-product-a" r="8.5" fill="url(#enz-product-a-grad)" stroke="#5c0d2e" strokeWidth="1.1" />
            </g>
            <g transform={`translate(${siteX} ${siteY})`}>
              <circle className="enz-play-product-b" r="8.5" fill="url(#enz-product-b-grad)" stroke="#4a2306" strokeWidth="1.1" />
            </g>
          </g>
        ) : null}

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

// The Michaelis-Menten curve itself — the thing the page copy promises ("watch how each
// one reshapes the reaction-rate curve") but that was never actually drawn anywhere.
// Plots v = Vmax·[S] / (Km + [S]) for the live trial, with a faint reference curve for how
// the enzyme would behave with no inhibitor at the same temperature and pH, so competitive
// (curve shifts right, same ceiling) and noncompetitive (same Km, lower ceiling) read as
// visibly different shapes instead of three numbers on cards.
const CHART_W = 460;
const CHART_H = 260;
const CHART_MARGIN = { top: 16, right: 18, bottom: 40, left: 46 };
const PLOT_W = CHART_W - CHART_MARGIN.left - CHART_MARGIN.right;
const PLOT_H = CHART_H - CHART_MARGIN.top - CHART_MARGIN.bottom;
const S_MAX = 100;
const V_MAX_SCALE = 110;

function curvePath(vmax: number, km: number, xScale: (s: number) => number, yScale: (v: number) => number) {
  const points: string[] = [];
  for (let s = 0; s <= S_MAX; s += 2) {
    const v = (vmax * s) / (km + s);
    points.push(`${xScale(s).toFixed(1)} ${yScale(v).toFixed(1)}`);
  }
  return `M ${points.join(" L ")}`;
}

function RateCurveChart({
  vmax,
  km,
  baselineVmax,
  baselineKm,
  substrate,
  currentRate,
  inhibitor,
  isDenatured,
}: {
  vmax: number;
  km: number;
  baselineVmax: number;
  baselineKm: number;
  substrate: number;
  currentRate: number;
  inhibitor: InhibitorType;
  isDenatured: boolean;
}) {
  const xScale = (s: number) => CHART_MARGIN.left + (s / S_MAX) * PLOT_W;
  const yScale = (v: number) => CHART_MARGIN.top + PLOT_H - (Math.max(0, v) / V_MAX_SCALE) * PLOT_H;

  const xTicks = [0, 25, 50, 75, 100];
  const yTicks = [0, 25, 50, 75, 100];

  const showBaseline = inhibitor !== "none" && !isDenatured;
  // Km is only a meaningful "half-Vmax" landmark while the enzyme actually has some activity
  // to be half of — a denatured (or otherwise ~inactive) enzyme has no active site left, so
  // marking a precise Km point on a flat-zero curve would imply a precision that isn't there.
  const showKm = !isDenatured && vmax > 0.5;
  const currentX = xScale(substrate);
  const currentY = yScale(currentRate);
  const kmX = xScale(km);
  const kmY = yScale(vmax / 2);

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="rate-curve-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f6b5e" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2f6b5e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* gridlines */}
      {yTicks.map((t) => (
        <line key={`y-${t}`} x1={CHART_MARGIN.left} x2={CHART_W - CHART_MARGIN.right} y1={yScale(t)} y2={yScale(t)} stroke="#e5e0d3" strokeWidth="1" />
      ))}
      {xTicks.map((t) => (
        <line key={`x-${t}`} x1={xScale(t)} x2={xScale(t)} y1={CHART_MARGIN.top} y2={CHART_MARGIN.top + PLOT_H} stroke="#e5e0d3" strokeWidth="1" />
      ))}

      {/* axes */}
      <line x1={CHART_MARGIN.left} x2={CHART_MARGIN.left} y1={CHART_MARGIN.top} y2={CHART_MARGIN.top + PLOT_H} stroke="#6b7280" strokeWidth="1.4" />
      <line x1={CHART_MARGIN.left} x2={CHART_W - CHART_MARGIN.right} y1={CHART_MARGIN.top + PLOT_H} y2={CHART_MARGIN.top + PLOT_H} stroke="#6b7280" strokeWidth="1.4" />
      {xTicks.map((t) => (
        <text key={t} x={xScale(t)} y={CHART_MARGIN.top + PLOT_H + 16} textAnchor="middle" fontSize="10" fill="#6b7280">{t}</text>
      ))}
      {yTicks.map((t) => (
        <text key={t} x={CHART_MARGIN.left - 8} y={yScale(t) + 3} textAnchor="end" fontSize="10" fill="#6b7280">{t}</text>
      ))}
      <text x={CHART_MARGIN.left + PLOT_W / 2} y={CHART_H - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1f2e2a">Substrate concentration [S]</text>
      <text
        x="0"
        y="0"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#1f2e2a"
        transform={`translate(14, ${CHART_MARGIN.top + PLOT_H / 2}) rotate(-90)`}
      >
        Reaction rate (v)
      </text>

      {/* Km guide: dashed lines to where the curve crosses Vmax/2 */}
      {showKm && km <= S_MAX ? (
        <>
          <line x1={kmX} x2={kmX} y1={kmY} y2={CHART_MARGIN.top + PLOT_H} stroke="#7c5bb0" strokeWidth="1.3" strokeDasharray="4 3" />
          <line x1={CHART_MARGIN.left} x2={kmX} y1={kmY} y2={kmY} stroke="#7c5bb0" strokeWidth="1.3" strokeDasharray="4 3" />
          <circle cx={kmX} cy={kmY} r="3.5" fill="#7c5bb0" />
          <text x={kmX} y={CHART_MARGIN.top + PLOT_H + 28} textAnchor="middle" fontSize="10" fontWeight="700" fill="#7c5bb0">Km</text>
        </>
      ) : null}

      {/* Vmax asymptote */}
      {!isDenatured ? (
        <>
          <line x1={CHART_MARGIN.left} x2={CHART_W - CHART_MARGIN.right} y1={yScale(vmax)} y2={yScale(vmax)} stroke="#b45309" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.7" />
          <text x={CHART_W - CHART_MARGIN.right} y={yScale(vmax) - 5} textAnchor="end" fontSize="10" fontWeight="700" fill="#b45309">Vmax</text>
        </>
      ) : (
        <text x={CHART_MARGIN.left + PLOT_W / 2} y={CHART_MARGIN.top + PLOT_H / 2} textAnchor="middle" fontSize="12" fontWeight="700" fill="#8a8270">
          Enzyme denatured — no activity to plot
        </text>
      )}

      {/* reference curve: same temperature/pH, no inhibitor */}
      {showBaseline ? (
        <path d={curvePath(baselineVmax, baselineKm, xScale, yScale)} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 4" />
      ) : null}

      {/* the live curve for this trial */}
      <path d={`${curvePath(vmax, km, xScale, yScale)} L ${xScale(S_MAX).toFixed(1)} ${(CHART_MARGIN.top + PLOT_H).toFixed(1)} L ${CHART_MARGIN.left} ${(CHART_MARGIN.top + PLOT_H).toFixed(1)} Z`} fill="url(#rate-curve-fill)" stroke="none" />
      <path d={curvePath(vmax, km, xScale, yScale)} fill="none" stroke="#2f6b5e" strokeWidth="2.6" strokeLinecap="round" />

      {/* current [S], rate marker */}
      <line x1={currentX} x2={currentX} y1={currentY} y2={CHART_MARGIN.top + PLOT_H} stroke="#1f2e2a" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.55" />
      <circle cx={currentX} cy={currentY} r="5.5" fill="#f0c869" stroke="#1f2e2a" strokeWidth="1.6" />

      {showBaseline ? (
        <text x={CHART_MARGIN.left + 4} y={CHART_MARGIN.top + 12} fontSize="10" fontWeight="600" fill="#64748b">- - - no inhibitor (same temp/pH)</text>
      ) : null}
    </svg>
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
  const [runId, setRunId] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { km, vmax, currentRate, foldedness } = useKineticsModel(substrate, temperature, ph, inhibitor);
  // Same temperature/pH, no inhibitor — the reference curve the chart overlays so a
  // competitive shift (Km up, same ceiling) and a noncompetitive drop (ceiling down, same Km)
  // are visibly different shapes rather than three numbers that changed on their own.
  const baseline = useKineticsModel(substrate, temperature, ph, "none");
  const pulseDuration = Math.max(0.4, 3.2 - currentRate / 30);
  const isDenatured = foldedness < 0.15;
  const canPlay = !isDenatured && substrate > 0 && !isPlaying;

  const runReaction = () => {
    if (!canPlay) return;
    setIsPlaying(true);
    setRunId((id) => id + 1);
  };

  // The animated substrate lives inside a <g key={inhibitor + runId}>, so each new run remounts
  // it cleanly. Switching inhibitor (or temperature/pH, which can cross the denatured threshold)
  // also changes that key — without resetting runId back to 0 here, a leftover runId > 0 would
  // make the fresh mount immediately apply the "playing" class and auto-replay with no click.
  const resetReaction = () => {
    setRunId(0);
    setIsPlaying(false);
  };

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
              <span className="text-xs font-normal text-[color:var(--ink-faint)]">More substrate means more molecules waiting near the enzyme — watch their number change in the diagram.</span>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
              Temperature: {temperature}°C
              <input type="range" min={0} max={80} step={1} value={temperature} onChange={(e) => { setTemperature(Number(e.target.value)); resetReaction(); }} style={{ accentColor: "var(--foundation)" }} />
              <span className="text-xs font-normal text-[color:var(--ink-faint)]">Optimum ≈ 37°C. Above ~70°C the enzyme&apos;s shape breaks down (denatures).</span>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
              pH: {ph.toFixed(1)}
              <input type="range" min={2} max={12} step={0.5} value={ph} onChange={(e) => { setPh(Number(e.target.value)); resetReaction(); }} style={{ accentColor: "var(--statistics)" }} />
              <span className="text-xs font-normal text-[color:var(--ink-faint)]">Optimum ≈ pH 7. Too far from it — either direction — also denatures the enzyme.</span>
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Inhibitor</span>
              <div className="inline-flex w-fit flex-wrap rounded-full border-2 border-[color:var(--border)] bg-[color:var(--surface)] p-1">
                {INHIBITOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => { setInhibitor(option.value); resetReaction(); }}
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
                : substrate === 0
                  ? "There's no substrate available — bring the [S] slider above 0 to have something to react."
                  : foldedness < 0.55
                    ? "Starting to unfold — conditions are stressing the enzyme's shape, so the substrate's fit into the active site is getting less reliable."
                    : "Click “Run reaction” to watch one substrate molecule dock into the active site and undergo a catabolic reaction — breaking down into two smaller products."}
            </p>

            <button
              type="button"
              onClick={runReaction}
              disabled={!canPlay}
              className="accent-gradient mb-4 w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              ▶ Run reaction
            </button>

            <EnzymeAnimation
              inhibitor={inhibitor}
              pulseDuration={pulseDuration}
              foldedness={foldedness}
              substrate={substrate}
              runId={runId}
              onRunEnd={() => setIsPlaying(false)}
            />

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

      <SectionCard
        title="Reaction rate vs. substrate concentration"
        description="This is the curve every setting above is reshaping — the amber dot marks the current [S] and rate."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.7fr)] lg:items-center">
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <RateCurveChart
              vmax={vmax}
              km={km}
              baselineVmax={baseline.vmax}
              baselineKm={baseline.km}
              substrate={substrate}
              currentRate={currentRate}
              inhibitor={inhibitor}
              isDenatured={isDenatured}
            />
          </div>
          <div className="grid gap-3 text-sm leading-6 text-[color:var(--ink-muted)]">
            <p>
              The curve rises steeply at low [S], then bends toward a ceiling (<strong className="text-[color:var(--ink)]">Vmax</strong>) as the
              enzyme&apos;s active sites become saturated — adding more substrate stops helping once nearly every enzyme is already busy.
            </p>
            <p>
              <strong className="text-[color:var(--ink)]">Km</strong> is where the curve crosses half of Vmax. A competitive inhibitor drags the whole
              curve rightward (same ceiling, more substrate needed to get there); a noncompetitive inhibitor pulls the ceiling down without moving Km.
            </p>
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
