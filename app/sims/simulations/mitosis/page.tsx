"use client";

import { useState } from "react";
import { PageHeader, SectionCard, TipCard } from "../../../components/ui/study-kit";

type Phase = {
  key: string;
  label: string;
  group: "Interphase" | "Mitosis" | "Cytokinesis";
  description: string;
  checkpoint?: string;
};

const PHASES: Phase[] = [
  {
    key: "g1",
    label: "G1",
    group: "Interphase",
    description: "The cell grows, carries out its normal jobs, and produces the proteins and organelles it will need before committing to divide.",
    checkpoint: "G1 checkpoint — checks cell size, nutrients, and DNA integrity before allowing entry into S phase.",
  },
  {
    key: "s",
    label: "S",
    group: "Interphase",
    description: "DNA replication: every chromosome is copied, so each one now consists of two identical sister chromatids joined at the centromere.",
  },
  {
    key: "g2",
    label: "G2",
    group: "Interphase",
    description: "The cell keeps growing and makes the proteins needed for mitosis, including the components of the mitotic spindle.",
    checkpoint: "G2 checkpoint — verifies DNA replicated correctly and completely before mitosis begins.",
  },
  {
    key: "prophase",
    label: "Prophase",
    group: "Mitosis",
    description: "Chromatin condenses into visible chromosomes, the mitotic spindle starts forming, and the nuclear envelope begins to break down.",
  },
  {
    key: "metaphase",
    label: "Metaphase",
    group: "Mitosis",
    description: "Chromosomes line up single-file along the metaphase plate, attached to spindle fibers from opposite poles.",
    checkpoint: "Spindle assembly checkpoint — makes sure every chromosome is properly attached before anaphase can start.",
  },
  {
    key: "anaphase",
    label: "Anaphase",
    group: "Mitosis",
    description: "Sister chromatids split apart and are pulled to opposite poles of the cell as the spindle fibers shorten.",
  },
  {
    key: "telophase",
    label: "Telophase",
    group: "Mitosis",
    description: "Chromosomes arrive at the poles and decondense, and a new nuclear envelope re-forms around each set.",
  },
  {
    key: "cytokinesis",
    label: "Cytokinesis",
    group: "Cytokinesis",
    description: "The cytoplasm divides, producing two separate, genetically identical daughter cells.",
  },
];

const GROUP_TONE: Record<Phase["group"], string> = {
  Interphase: "var(--info)",
  Mitosis: "var(--brand)",
  Cytokinesis: "var(--statistics)",
};

const CHROMOSOME_PALETTE = {
  "#b5233f": { dark: "#7a1329", gradient: "chrom-red" },
  "#2f5ba8": { dark: "#1e3a6e", gradient: "chrom-blue" },
} as const;

function ChromatinBands({ arm }: { arm: 1 | -1 }) {
  const bandOffsets = [-24, -16, -8, 2, 10, 18];
  return (
    <>
      {bandOffsets.map((dy) => (
        <line key={dy} x1={arm * -5.5} y1={dy} x2={arm * 5.5} y2={dy} stroke="#000" strokeWidth="1.3" opacity="0.16" />
      ))}
    </>
  );
}

function DuplicatedChromosome({ x, y, rotate = 0, color }: { x: number; y: number; rotate?: number; color: string }) {
  const meta = CHROMOSOME_PALETTE[color as keyof typeof CHROMOSOME_PALETTE];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} filter="url(#mit-shadow)">
      <path d="M-9 -29 Q-9 0 -3 0 Q-9 0 -9 29" fill="none" stroke={`url(#${meta.gradient})`} strokeWidth="11" strokeLinecap="round" />
      <path d="M9 -29 Q9 0 3 0 Q9 0 9 29" fill="none" stroke={`url(#${meta.gradient})`} strokeWidth="11" strokeLinecap="round" />
      <g transform="translate(-6 0)">
        <ChromatinBands arm={-1} />
      </g>
      <g transform="translate(6 0)">
        <ChromatinBands arm={1} />
      </g>
      <circle r="4" fill={meta.dark} stroke="#000" strokeWidth="0.6" opacity="0.85" />
    </g>
  );
}

function SingleChromatid({ x, y, rotate = 0, color }: { x: number; y: number; rotate?: number; color: string }) {
  const meta = CHROMOSOME_PALETTE[color as keyof typeof CHROMOSOME_PALETTE];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} filter="url(#mit-shadow)">
      <path d="M0 -26 L0 26" stroke={`url(#${meta.gradient})`} strokeWidth="11" strokeLinecap="round" />
      <ChromatinBands arm={1} />
    </g>
  );
}

function Centrosome({
  x,
  y,
  targetX,
  targetY,
  targets,
}: {
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  // Exact kinetochore points to attach to — used once the spindle has actually captured
  // chromosomes (metaphase, anaphase), so each fiber visibly ends at a real chromosome
  // instead of fanning out to a generic patch of the cell.
  targets?: readonly (readonly [number, number])[];
}) {
  const rays = targets ?? [-28, -14, 0, 14, 28].map((offset) => [(targetX ?? x) + offset, targetY ?? y] as const);
  return (
    <g>
      {rays.map(([tx, ty], i) => (
        <line key={i} x1={x} y1={y} x2={tx} y2={ty} stroke="#8a6a2f" strokeWidth="1.3" opacity="0.5" />
      ))}
      <circle cx={x} cy={y} r="7" fill="url(#mit-centrosome)" stroke="#6b5220" strokeWidth="1.2" />
    </g>
  );
}

const CHROMOSOME_COLORS = ["#b5233f", "#2f5ba8"] as const;

// A deterministic pseudo-random generator (not Math.random) so speck positions stay fixed
// across re-renders and don't cause a server/client hydration mismatch.
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Small mitochondria + vesicle flecks scattered through the cytosol so the cell reads as a
// living, textured space rather than an empty gradient circle with a nucleus floating in it —
// every other simulation in this app has this kind of depth, mitosis was the one that didn't.
// Points landing inside any "avoid" circle (nucleus, chromosomes, spindle) are skipped.
function CytoplasmTexture({
  cx,
  cy,
  r,
  seedOffset,
  avoid = [],
}: {
  cx: number;
  cy: number;
  r: number;
  seedOffset: number;
  avoid?: { cx: number; cy: number; r: number }[];
}) {
  const isAvoided = (x: number, y: number) =>
    avoid.some((zone) => Math.hypot(x - zone.cx, y - zone.cy) < zone.r);

  const specks: { x: number; y: number; kind: "mito" | "dot"; rotate: number }[] = [];
  for (let i = 0; i < 26 && specks.length < 9; i++) {
    const seed = seedOffset + i * 5.37;
    const angle = pseudoRandom(seed) * Math.PI * 2;
    const radial = Math.sqrt(pseudoRandom(seed + 1.9)) * (r - 14);
    const x = cx + Math.cos(angle) * radial;
    const y = cy + Math.sin(angle) * radial;
    if (isAvoided(x, y)) continue;
    specks.push({ x, y, kind: i % 4 === 0 ? "mito" : "dot", rotate: pseudoRandom(seed + 3.3) * 360 });
  }

  return (
    <g opacity="0.75">
      {specks.map((speck, i) =>
        speck.kind === "mito" ? (
          <ellipse
            key={i}
            cx={speck.x}
            cy={speck.y}
            rx="9"
            ry="5"
            fill="url(#mit-mito)"
            stroke="#7a3229"
            strokeWidth="1"
            transform={`rotate(${speck.rotate.toFixed(0)} ${speck.x.toFixed(1)} ${speck.y.toFixed(1)})`}
          />
        ) : (
          <circle key={i} cx={speck.x} cy={speck.y} r="2.6" fill="#7fa8d8" opacity="0.6" />
        ),
      )}
    </g>
  );
}

function CellStage({ phase }: { phase: Phase }) {
  return (
    <svg viewBox="0 0 500 320" style={{ width: "100%", maxWidth: 460, margin: "0 auto", display: "block" }}>
      <style>{`
        @keyframes mit-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.012); }
        }
        .mit-cell-body { animation: mit-breathe 5s ease-in-out infinite; transform-origin: 250px 160px; }
        @media (prefers-reduced-motion: reduce) {
          .mit-cell-body { animation: none; }
        }
      `}</style>
      <defs>
        <filter id="mit-shadow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>
        <radialGradient id="mit-cyto" cx="35%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#fbfeff" />
          <stop offset="60%" stopColor="#dcedf8" />
          <stop offset="100%" stopColor="#a9c8dd" />
        </radialGradient>
        <radialGradient id="mit-nucleus" cx="32%" cy="26%" r="85%">
          <stop offset="0%" stopColor="#f1e9fb" />
          <stop offset="60%" stopColor="#d3c2ee" />
          <stop offset="100%" stopColor="#a087cf" />
        </radialGradient>
        <radialGradient id="mit-centrosome" cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#f6dc8f" />
          <stop offset="100%" stopColor="#b8912f" />
        </radialGradient>
        <radialGradient id="mit-mito" cx="32%" cy="26%" r="85%">
          <stop offset="0%" stopColor="#ffd7cc" />
          <stop offset="100%" stopColor="#c47461" />
        </radialGradient>
        {/* userSpaceOnUse (not the default objectBoundingBox) so this still renders on a
            perfectly vertical chromatid path, whose bounding box would otherwise be zero
            pixels wide and make an objectBoundingBox gradient degenerate/invisible */}
        <linearGradient id="chrom-red" gradientUnits="userSpaceOnUse" x1="-6" y1="0" x2="6" y2="0">
          <stop offset="0%" stopColor="#e0576e" />
          <stop offset="50%" stopColor="#b5233f" />
          <stop offset="100%" stopColor="#7a1329" />
        </linearGradient>
        <linearGradient id="chrom-blue" gradientUnits="userSpaceOnUse" x1="-6" y1="0" x2="6" y2="0">
          <stop offset="0%" stopColor="#5a83c9" />
          <stop offset="50%" stopColor="#2f5ba8" />
          <stop offset="100%" stopColor="#1e3a6e" />
        </linearGradient>
      </defs>

      {phase.key !== "cytokinesis" ? (
        <g className="mit-cell-body">
          <circle cx="250" cy="160" r="140" fill="url(#mit-cyto)" stroke="#4a6d85" strokeWidth="1.8" />
          <CytoplasmTexture
            cx={250}
            cy={160}
            r={140}
            seedOffset={phase.key === "prophase" || phase.key === "metaphase" || phase.key === "anaphase" ? 30 : phase.key === "telophase" ? 50 : 10}
            avoid={
              phase.key === "telophase"
                ? [{ cx: 165, cy: 160, r: 62 }, { cx: 335, cy: 160, r: 62 }]
                : phase.key === "prophase" || phase.key === "metaphase" || phase.key === "anaphase"
                  ? [{ cx: 250, cy: 160, r: 90 }]
                  : [{ cx: 250, cy: 160, r: 74 }]
            }
          />
        </g>
      ) : null}

      {phase.key === "g1" ? (
        <>
          <circle cx="250" cy="160" r="70" fill="url(#mit-nucleus)" stroke="#6d4fa8" strokeWidth="1.6" />
          <circle cx="238" cy="146" r="10" fill="#5c3d8a" opacity="0.65" />
          {CHROMOSOME_COLORS.map((c, i) => (
            <SingleChromatid key={c} x={230 + i * 40} y={168} rotate={i === 0 ? -20 : 18} color={c} />
          ))}
          <text x="250" y="290" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0369a1">Growing — DNA not yet copied</text>
        </>
      ) : null}

      {phase.key === "s" ? (
        <>
          <circle cx="250" cy="160" r="70" fill="url(#mit-nucleus)" stroke="#6d4fa8" strokeWidth="1.6" />
          <circle cx="238" cy="146" r="10" fill="#5c3d8a" opacity="0.65" />
          {CHROMOSOME_COLORS.map((c, i) => (
            <g key={c} opacity={0.65}>
              <DuplicatedChromosome x={225 + i * 45} y={165} rotate={i === 0 ? -14 : 14} color={c} />
            </g>
          ))}
          <text x="250" y="290" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0369a1">DNA replicating — chromatids forming</text>
        </>
      ) : null}

      {phase.key === "g2" ? (
        <>
          <circle cx="250" cy="160" r="70" fill="url(#mit-nucleus)" stroke="#6d4fa8" strokeWidth="1.6" />
          <circle cx="238" cy="146" r="10" fill="#5c3d8a" opacity="0.65" />
          {CHROMOSOME_COLORS.map((c, i) => (
            <DuplicatedChromosome key={c} x={225 + i * 45} y={165} rotate={i === 0 ? -14 : 14} color={c} />
          ))}
          <text x="250" y="290" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0369a1">Ready — chromosomes fully duplicated</text>
        </>
      ) : null}

      {phase.key === "prophase" ? (
        <>
          <Centrosome x={60} y={90} targetX={180} targetY={150} />
          <Centrosome x={440} y={230} targetX={320} targetY={170} />
          {CHROMOSOME_COLORS.map((c, i) => (
            <DuplicatedChromosome key={c} x={220 + i * 60} y={140 + i * 30} rotate={i === 0 ? -25 : 30} color={c} />
          ))}
          <text x="250" y="290" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0369a1">Chromosomes condense, spindle forms</text>
        </>
      ) : null}

      {phase.key === "metaphase" ? (
        <>
          {/* both poles send a fiber to each chromosome's kinetochore — the two sister
              chromatids inside one duplicated chromosome are already committed to opposite
              poles here, even though they won't visibly separate until anaphase */}
          <Centrosome x={60} y={160} targets={[[230, 160], [270, 160]]} />
          <Centrosome x={440} y={160} targets={[[230, 160], [270, 160]]} />
          <line x1="130" y1="160" x2="370" y2="160" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 5" />
          {CHROMOSOME_COLORS.map((c, i) => (
            <DuplicatedChromosome key={c} x={230 + i * 40} y={160} rotate={0} color={c} />
          ))}
          <text x="250" y="290" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0369a1">Chromosomes line up at the plate</text>
        </>
      ) : null}

      {phase.key === "anaphase" ? (
        <>
          {/* fibers now terminate exactly on the chromatids they're pulling, tracking the
              same x positions the chromatids themselves use below */}
          <Centrosome x={60} y={160} targets={[[165, 160], [147, 160]]} />
          <Centrosome x={440} y={160} targets={[[335, 160], [353, 160]]} />
          {CHROMOSOME_COLORS.map((c, i) => (
            <SingleChromatid key={`left-${c}`} x={165 - i * 18} y={160} rotate={0} color={c} />
          ))}
          {CHROMOSOME_COLORS.map((c, i) => (
            <SingleChromatid key={`right-${c}`} x={335 + i * 18} y={160} rotate={0} color={c} />
          ))}
          <text x="250" y="290" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0369a1">Sister chromatids pulled apart</text>
        </>
      ) : null}

      {phase.key === "telophase" ? (
        <>
          <ellipse cx="165" cy="160" rx="55" ry="65" fill="url(#mit-nucleus)" stroke="#6d4fa8" strokeWidth="1.6" />
          <ellipse cx="335" cy="160" rx="55" ry="65" fill="url(#mit-nucleus)" stroke="#6d4fa8" strokeWidth="1.6" />
          {CHROMOSOME_COLORS.map((c, i) => (
            <SingleChromatid key={`l-${c}`} x={155 + i * 20} y={160} rotate={0} color={c} />
          ))}
          {CHROMOSOME_COLORS.map((c, i) => (
            <SingleChromatid key={`r-${c}`} x={325 + i * 20} y={160} rotate={0} color={c} />
          ))}
          <text x="250" y="290" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0369a1">Two nuclei re-form</text>
        </>
      ) : null}

      {phase.key === "cytokinesis" ? (
        <>
          {/* a narrowing neck of shared cytoplasm — cytokinesis is the cell actively pinching
              in two, not already-finished separate cells */}
          <path d="M195 108 C225 96, 275 96, 305 108 C295 140, 295 180, 305 212 C275 224, 225 224, 195 212 C205 180, 205 140, 195 108 Z" fill="url(#mit-cyto)" stroke="#4a6d85" strokeWidth="1.4" opacity="0.9" />
          <circle cx="165" cy="160" r="75" fill="url(#mit-cyto)" stroke="#4a6d85" strokeWidth="1.8" />
          <circle cx="335" cy="160" r="75" fill="url(#mit-cyto)" stroke="#4a6d85" strokeWidth="1.8" />
          <CytoplasmTexture cx={165} cy={160} r={75} seedOffset={70} avoid={[{ cx: 165, cy: 160, r: 38 }]} />
          <CytoplasmTexture cx={335} cy={160} r={75} seedOffset={90} avoid={[{ cx: 335, cy: 160, r: 38 }]} />
          <path d="M250 92 C238 130, 238 190, 250 228" fill="none" stroke="#2f5170" strokeWidth="2.5" strokeDasharray="5 4" opacity="0.6" />
          <circle cx="165" cy="160" r="35" fill="url(#mit-nucleus)" stroke="#6d4fa8" strokeWidth="1.4" />
          <circle cx="335" cy="160" r="35" fill="url(#mit-nucleus)" stroke="#6d4fa8" strokeWidth="1.4" />
          <text x="250" y="290" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0369a1">Cleavage furrow pinches the cytoplasm in two</text>
        </>
      ) : null}
    </svg>
  );
}

export default function MitosisPage() {
  const [index, setIndex] = useState(0);
  const [showCheckpointFailure, setShowCheckpointFailure] = useState(false);
  const phase = PHASES[index];

  return (
    <main className="grid gap-8">
      <style>{`
        @keyframes mitosis-stage-in {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .mitosis-stage {
          animation: mitosis-stage-in 360ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .mitosis-stage { animation: none; }
        }
      `}</style>

      <PageHeader
        eyebrow="Unit 4 · Cell communication and the cell cycle"
        align="start"
        title="Mitosis & the cell cycle"
        description="Step through interphase, mitosis, and cytokinesis one stage at a time, and see why the checkpoints in between matter."
      />

      <SectionCard title={`${phase.group} — ${phase.label}`} description={phase.description}>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)] lg:items-start">
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
            <div key={phase.key} className="mitosis-stage">
              <CellStage phase={phase} />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-wrap gap-1.5">
              {PHASES.map((p, i) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={i === index}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
                  style={
                    i === index
                      ? { background: GROUP_TONE[p.group], color: "#fff" }
                      : { background: "var(--surface)", color: "var(--ink-muted)", border: "1px solid var(--border)" }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="rounded-full border-2 border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(PHASES.length - 1, i + 1))}
                disabled={index === PHASES.length - 1}
                className="accent-gradient flex-1 rounded-full px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>

            {phase.checkpoint ? <TipCard label="Checkpoint">{phase.checkpoint}</TipCard> : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="What if a checkpoint fails?"
        description="Checkpoints exist to stop a damaged or incomplete cell from dividing. Toggle this to see what happens when one doesn't catch a mistake."
      >
        <label className="inline-flex w-fit items-center gap-2.5 text-sm font-semibold text-[color:var(--ink)]">
          <input
            type="checkbox"
            checked={showCheckpointFailure}
            onChange={(e) => setShowCheckpointFailure(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: "var(--danger)" }}
          />
          A checkpoint fails to catch a DNA error
        </label>

        {showCheckpointFailure ? (
          <div className="mt-4 rounded-[var(--radius-md)] border border-[color:var(--danger)]/30 bg-[color:var(--danger-soft)] p-4 text-sm leading-6 text-[color:var(--ink)]">
            <p className="font-semibold text-[color:var(--danger)]">Uncontrolled division</p>
            <p className="mt-1.5">
              If a checkpoint misses damaged DNA, that damage gets copied into every daughter cell. If the mutation also disables the checkpoint proteins themselves (like p53) or a tumor-suppressor gene, the cell can keep dividing without any of the normal brakes — this is how many cancers get started. That&apos;s why checkpoint genes are among the most commonly mutated genes in tumors.
            </p>
          </div>
        ) : null}
      </SectionCard>
    </main>
  );
}
