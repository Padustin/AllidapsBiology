"use client";

import { useMemo, useState } from "react";
import { PageHeader, SectionCard, StatCard, TipCard } from "../../../components/ui/study-kit";

type CellType = "animal" | "plant";
type Point = readonly [number, number];

const INTERNAL_CONCENTRATION = 50;
const WALL_RADIUS = 175;
const BASE_RADIUS = 140;
const OUTLINE_POINT_COUNT = 18;

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

// A membrane outline: normally a gentle, slightly irregular round shape. As an animal cell
// loses water (crenation) it grows the small scalloped bumps real shriveled red blood cells
// (echinocytes) show — this is generated from the same point count so it stays smooth.
function membraneOutline(radius: number, crenationAmount: number): string {
  const points: Point[] = Array.from({ length: OUTLINE_POINT_COUNT }, (_, i) => {
    const angle = (i / OUTLINE_POINT_COUNT) * Math.PI * 2;
    const gentleWobble = 1 + 0.035 * Math.sin(angle * 3 + 1.2) + 0.025 * Math.sin(angle * 5);
    const scallop = i % 2 === 0 ? 1 : 0.8;
    const rMultiplier = gentleWobble * (1 + (scallop - 1) * crenationAmount);
    const r = radius * rMultiplier;
    return [Math.cos(angle) * r, Math.sin(angle) * r];
  });
  return smoothClosedPath(points);
}

function useOsmosisState(externalConcentration: number, cellType: CellType) {
  return useMemo(() => {
    const diff = externalConcentration - INTERNAL_CONCENTRATION;

    let tonicity: "Hypertonic" | "Hypotonic" | "Isotonic";
    if (diff > 8) tonicity = "Hypertonic";
    else if (diff < -8) tonicity = "Hypotonic";
    else tonicity = "Isotonic";

    const isLysis = cellType === "animal" && diff < -42;
    const isPlasmolysis = cellType === "plant" && diff > 30;

    let membraneRadius = BASE_RADIUS - diff * 1.3;
    const maxRadius = cellType === "plant" ? WALL_RADIUS - 6 : 205;
    membraneRadius = Math.max(45, Math.min(maxRadius, membraneRadius));

    let outcome: string;
    if (cellType === "animal") {
      if (isLysis) outcome = "Lysis — the cell has taken on too much water and bursts.";
      else if (tonicity === "Hypertonic") outcome = "Crenation — the cell loses water and shrivels.";
      else if (tonicity === "Hypotonic") outcome = "The cell swells as water moves in.";
      else outcome = "No net water movement — the cell stays its normal shape.";
    } else {
      if (isPlasmolysis) outcome = "Plasmolysis — the membrane pulls away from the rigid cell wall.";
      else if (tonicity === "Hypertonic") outcome = "The cell loses some water; the membrane sags slightly from the wall.";
      else if (tonicity === "Hypotonic") outcome = "Turgid — water enters and pushes the membrane firmly against the wall (this is healthy for a plant cell).";
      else outcome = "Flaccid — no net water movement, the cell is neither firm nor shrunken.";
    }

    const waterDirection = (diff > 8 ? "out" : diff < -8 ? "in" : "none") as "in" | "out" | "none";

    // Crenation (the scalloped shrinking of a water-starved animal cell) only shows up for
    // animal cells losing water — plant cells plasmolyze (the membrane pulls off the wall)
    // instead, which is rendered separately.
    const crenationAmount = cellType === "animal" ? Math.max(0, Math.min(1, (BASE_RADIUS - membraneRadius) / 55)) : 0;

    return { diff, tonicity, isLysis, isPlasmolysis, membraneRadius, outcome, waterDirection, crenationAmount };
  }, [externalConcentration, cellType]);
}

function WaterArrows({ direction, wallRadius }: { direction: "in" | "out" | "none"; wallRadius: number }) {
  if (direction === "none") return null;
  const angles = [20, 100, 180, 260, 340];
  return (
    <>
      {angles.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const outerR = wallRadius + 32;
        const innerR = wallRadius - 6;
        const x1 = 350 + Math.cos(rad) * (direction === "in" ? outerR : innerR);
        const y1 = 220 + Math.sin(rad) * (direction === "in" ? outerR : innerR);
        const x2 = 350 + Math.cos(rad) * (direction === "in" ? innerR : outerR);
        const y2 = 220 + Math.sin(rad) * (direction === "in" ? innerR : outerR);
        return (
          <g key={deg}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2f6690" strokeWidth="3" strokeLinecap="round" markerEnd="url(#waterArrowHead)" opacity="0.85" />
          </g>
        );
      })}
    </>
  );
}

function CellDiagram({
  cellType,
  membraneRadius,
  isLysis,
  isPlasmolysis,
  waterDirection,
  crenationAmount,
}: {
  cellType: CellType;
  membraneRadius: number;
  isLysis: boolean;
  isPlasmolysis: boolean;
  waterDirection: "in" | "out" | "none";
  crenationAmount: number;
}) {
  const shrinkRatio = Math.min(1, membraneRadius / BASE_RADIUS);
  const nucleusR = Math.max(16, membraneRadius * 0.22);

  return (
    <svg viewBox="0 0 700 440" style={{ width: "100%", maxWidth: 560, margin: "0 auto", display: "block" }}>
      <defs>
        <marker id="waterArrowHead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill="#2f6690" />
        </marker>
        <filter id="osm-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.15" />
        </filter>
        <radialGradient id="osm-cytoplasm" cx="35%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#fbfeff" />
          <stop offset="55%" stopColor={isLysis ? "#f6c9c2" : "#d7ecfa"} />
          <stop offset="100%" stopColor={isLysis ? "#c96354" : "#7fb2d6"} />
        </radialGradient>
        <radialGradient id="osm-nucleus" cx="32%" cy="26%" r="85%">
          <stop offset="0%" stopColor="#f0e6fb" />
          <stop offset="55%" stopColor="#c3aae8" />
          <stop offset="100%" stopColor="#7c5bb0" />
        </radialGradient>
        <radialGradient id="osm-mito" cx="32%" cy="26%" r="85%">
          <stop offset="0%" stopColor="#ffd7cc" />
          <stop offset="100%" stopColor="#a24a3f" />
        </radialGradient>
      </defs>

      {cellType === "plant" ? (
        <>
          <rect x={350 - WALL_RADIUS - 7} y={220 - WALL_RADIUS - 7} width={(WALL_RADIUS + 7) * 2} height={(WALL_RADIUS + 7) * 2} rx="26" fill="#ede1c4" stroke="#a3874f" strokeWidth="1.4" />
          <rect x={350 - WALL_RADIUS} y={220 - WALL_RADIUS} width={WALL_RADIUS * 2} height={WALL_RADIUS * 2} rx="22" fill="none" stroke="#c2a366" strokeWidth="6" />
          {Array.from({ length: 14 }).map((_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            const x = 350 + Math.cos(angle) * (WALL_RADIUS - 4);
            const y = 220 + Math.sin(angle) * (WALL_RADIUS - 4);
            return <line key={i} x1={x} y1={y} x2={x + Math.cos(angle) * 10} y2={y + Math.sin(angle) * 10} stroke="#a3874f" strokeWidth="1.4" opacity="0.4" />;
          })}
        </>
      ) : null}

      {/* cell membrane: an irregular, slightly organic outline rather than a perfect circle —
          and one that grows small scalloped bumps (crenation) as the cell loses water */}
      <path
        transform="translate(350 220)"
        d={membraneOutline(membraneRadius, crenationAmount)}
        fill="url(#osm-cytoplasm)"
        stroke={isLysis ? "#8a3226" : "#2f6690"}
        strokeWidth="2.2"
        strokeDasharray={isLysis ? "10 8" : undefined}
        filter="url(#osm-shadow)"
        style={{ transition: "d 0.4s ease, fill 0.4s ease" }}
      />
      <path
        transform="translate(350 220)"
        d={membraneOutline(Math.max(0, membraneRadius - 9), crenationAmount)}
        fill="none"
        stroke="#5a9dc7"
        strokeWidth="1.2"
        opacity="0.45"
        style={{ transition: "d 0.4s ease" }}
      />

      {/* central vacuole (plant) or a couple of small vesicles (animal), scaled with the cell */}
      <circle cx="350" cy="220" r={Math.max(14, membraneRadius * 0.32)} fill="#a9d6ee" stroke="#4f7fa8" strokeWidth="1.4" opacity="0.7" style={{ transition: "r 0.4s ease" }} />

      {/* nucleus, tucked to one side like a textbook diagram */}
      <g style={{ transition: "transform 0.4s ease" }} transform={`translate(${350 - membraneRadius * 0.42} ${220 - membraneRadius * 0.3})`}>
        <circle r={nucleusR} fill="url(#osm-nucleus)" stroke="#5c3d8a" strokeWidth="1.4" />
        <circle r={Math.max(4, nucleusR * 0.35)} cx={nucleusR * 0.15} cy={-nucleusR * 0.1} fill="#5c3d8a" opacity="0.7" />
      </g>

      {/* a couple of small mitochondria for texture, scaled and repositioned with the cell */}
      {shrinkRatio > 0.35
        ? ([
            [0.48, -0.55, -18],
            [0.4, 0.5, 24],
          ] as const).map(([dxRatio, dyRatio, rotate], i) => (
            <g key={i} transform={`translate(${350 + membraneRadius * dxRatio} ${220 + membraneRadius * dyRatio}) rotate(${rotate}) scale(${Math.max(0.35, shrinkRatio)})`} style={{ transition: "transform 0.4s ease" }}>
              <ellipse rx="22" ry="12" fill="url(#osm-mito)" stroke="#7a3229" strokeWidth="1.2" />
            </g>
          ))
        : null}

      {isPlasmolysis ? (
        <text x="350" y="220" textAnchor="middle" fontSize="13" fontWeight="700" fill="#854d0e">
          membrane pulled from wall
        </text>
      ) : null}
      {isLysis ? (
        <text x="350" y="220" textAnchor="middle" fontSize="16" fontWeight="800" fill="#7f1d1d">
          burst!
        </text>
      ) : null}

      <WaterArrows direction={waterDirection} wallRadius={cellType === "plant" ? WALL_RADIUS : membraneRadius} />

      <text x="350" y="415" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--ink-muted)">
        {cellType === "plant" ? "Plant cell — rigid wall stays fixed size" : "Animal cell — no wall, membrane alone sets the shape"}
      </text>
    </svg>
  );
}

export default function OsmosisPage() {
  const [cellType, setCellType] = useState<CellType>("animal");
  const [externalConcentration, setExternalConcentration] = useState(50);
  const { tonicity, isLysis, isPlasmolysis, membraneRadius, outcome, waterDirection, crenationAmount } = useOsmosisState(externalConcentration, cellType);

  return (
    <main className="grid gap-8">
      <PageHeader
        eyebrow="Unit 2 · Cell transport"
        align="start"
        title="Osmosis & diffusion lab"
        description="Set the solute concentration outside the cell and watch water move down its concentration gradient, from where it's more concentrated to where it's less concentrated."
      />

      <SectionCard title="Solution setup" description="The cell's internal solute concentration is fixed at 50% — drag the slider to change what's outside it.">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.85fr)] lg:items-start">
          <div className="grid gap-5">
            <div
              className="inline-flex w-fit rounded-full border-2 border-[color:var(--border)] bg-[color:var(--surface)] p-1"
              role="group"
              aria-label="Cell type"
            >
              {([
                { type: "animal" as const, label: "🐾 Animal cell" },
                { type: "plant" as const, label: "🌿 Plant cell" },
              ]).map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setCellType(option.type)}
                  aria-pressed={cellType === option.type}
                  className={
                    cellType === option.type
                      ? "accent-gradient rounded-full px-4 py-2 text-sm font-semibold text-white transition"
                      : "rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--ink-muted)] transition hover:text-[color:var(--ink)]"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
              External solute concentration: {externalConcentration}%
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={externalConcentration}
                onChange={(event) => setExternalConcentration(Number(event.target.value))}
                style={{ accentColor: "var(--brand)" }}
              />
              <span className="flex justify-between text-xs font-normal text-[color:var(--ink-faint)]">
                <span>0% (pure water)</span>
                <span>50% (matches inside)</span>
                <span>100% (very concentrated)</span>
              </span>
            </label>

            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Outside" value={`${externalConcentration}%`} tone="blue" />
              <StatCard label="Inside (fixed)" value={`${INTERNAL_CONCENTRATION}%`} tone="neutral" />
              <StatCard label="Environment is" value={tonicity} tone={tonicity === "Isotonic" ? "green" : tonicity === "Hypertonic" ? "amber" : "rose"} />
            </div>

            <TipCard label={isLysis || isPlasmolysis ? "What's happening" : "Outcome"}>{outcome}</TipCard>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
            <CellDiagram cellType={cellType} membraneRadius={membraneRadius} isLysis={isLysis} isPlasmolysis={isPlasmolysis} waterDirection={waterDirection} crenationAmount={crenationAmount} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Why plants and animals respond differently" description="The rigid cell wall is the whole story.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <p className="font-semibold text-[color:var(--ink)]">Animal cells (no wall)</p>
            <p className="mt-1.5 text-sm leading-6 text-[color:var(--ink-muted)]">
              With nothing to push against, an animal cell in a strongly hypotonic solution keeps swelling until the membrane fails — lysis. In a hypertonic solution it just shrivels — crenation.
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <p className="font-semibold text-[color:var(--ink)]">Plant cells (rigid wall)</p>
            <p className="mt-1.5 text-sm leading-6 text-[color:var(--ink-muted)]">
              The wall caps how far the membrane can expand, so a hypotonic solution just makes the cell turgid — firm, not burst. That turgor pressure is what holds a healthy plant upright. In a hypertonic solution, the membrane can still pull away from the wall — plasmolysis — which wilts the plant.
            </p>
          </div>
        </div>
      </SectionCard>
    </main>
  );
}
