import Link from "next/link";
import type { JSX } from "react";

function CellModelPreview() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full">
      <defs>
        <radialGradient id="gal-cyto" cx="35%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#fbfeff" />
          <stop offset="60%" stopColor="#e6f0fb" />
          <stop offset="100%" stopColor="#bcd0e6" />
        </radialGradient>
        <radialGradient id="gal-nuc" cx="32%" cy="26%" r="85%">
          <stop offset="0%" stopColor="#f0e6fb" />
          <stop offset="60%" stopColor="#c3aae8" />
          <stop offset="100%" stopColor="#7c5bb0" />
        </radialGradient>
        <radialGradient id="gal-mito" cx="32%" cy="26%" r="85%">
          <stop offset="0%" stopColor="#ffd7cc" />
          <stop offset="100%" stopColor="#a24a3f" />
        </radialGradient>
      </defs>
      <path d="M45 150 C45 75, 130 25, 220 30 C300 34, 360 90, 358 155 C356 220, 300 268, 215 272 C130 276, 55 235, 45 150 Z" fill="url(#gal-cyto)" stroke="#5b6b80" strokeWidth="2" />
      <circle cx="150" cy="130" r="52" fill="url(#gal-nuc)" stroke="#6d4fa8" strokeWidth="1.6" />
      <circle cx="150" cy="130" r="18" fill="#5b3a94" opacity="0.85" />
      <path d="M245 95 q34 -14 58 8 q12 22 -10 40 q-32 14 -58 -8 q-12 -22 10 -40 Z" fill="url(#gal-mito)" stroke="#7a3229" strokeWidth="1.4" />
      <path d="M235 190 C260 178, 290 180, 310 195 C298 202, 280 205, 262 203 C285 210, 300 220, 300 232 C280 236, 258 228, 245 212" fill="#d99b83" stroke="#8a4a35" strokeWidth="1.2" />
      <path d="M75 195 C100 178, 128 178, 148 195" fill="none" stroke="#c99552" strokeWidth="6" strokeLinecap="round" />
      <path d="M68 220 C96 202, 128 202, 152 220" fill="none" stroke="#c99552" strokeWidth="6" strokeLinecap="round" />
      {([[90, 90], [108, 70], [280, 150], [300, 130], [95, 235]] as const).map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="4" ry="3.2" fill="#3a5589" />
      ))}
    </svg>
  );
}

function OsmosisPreview() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full">
      <defs>
        <radialGradient id="gal-osm-cell" cx="35%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#fbfeff" />
          <stop offset="55%" stopColor="#d7ecfa" />
          <stop offset="100%" stopColor="#7fb2d6" />
        </radialGradient>
      </defs>
      <path d="M110 60 L110 40 L290 40 L290 60 L305 260 Q305 275 288 275 L112 275 Q95 275 95 260 Z" fill="#ede1c4" stroke="#a3874f" strokeWidth="1.6" opacity="0.65" />
      <line x1="100" y1="60" x2="300" y2="60" stroke="#a3874f" strokeWidth="2" />
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={120 + (i % 7) * 24} cy={200 + Math.floor(i / 7) * 22} r="3.5" fill="#5a9dc7" opacity="0.6" />
      ))}
      <circle cx="200" cy="150" r="70" fill="url(#gal-osm-cell)" stroke="#2f6690" strokeWidth="1.8" />
      <circle cx="200" cy="150" r="22" fill="#a9d6ee" stroke="#4f7fa8" strokeWidth="1.2" opacity="0.85" />
      <g stroke="#2f6690" strokeWidth="2.4" strokeLinecap="round" markerEnd="url(#gal-water-arrow)">
        <line x1="200" y1="62" x2="200" y2="86" />
        <line x1="130" y1="105" x2="150" y2="120" />
        <line x1="270" y1="105" x2="250" y2="120" />
      </g>
      <defs>
        <marker id="gal-water-arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 Z" fill="#2f6690" />
        </marker>
      </defs>
    </svg>
  );
}

function EnzymePreview() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full">
      <defs>
        <radialGradient id="gal-enz" cx="32%" cy="26%" r="85%">
          <stop offset="0%" stopColor="#c9d8d4" />
          <stop offset="55%" stopColor="#7fa398" />
          <stop offset="100%" stopColor="#3f5a52" />
        </radialGradient>
        <radialGradient id="gal-enz-sub" cx="32%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#a9c8f0" />
          <stop offset="100%" stopColor="#2c4f8f" />
        </radialGradient>
      </defs>
      <path
        d="M60 150 C60 95, 110 55, 175 60 C215 63, 235 90, 225 120 C218 142, 195 145, 175 150 C195 155, 218 158, 225 180 C235 210, 215 237, 175 240 C110 245, 60 205, 60 150 Z"
        fill="url(#gal-enz)"
        stroke="#2c3f38"
        strokeWidth="1.6"
      />
      <circle cx="290" cy="150" r="26" fill="url(#gal-enz-sub)" stroke="#1c2f52" strokeWidth="1.2" />
      <circle cx="330" cy="115" r="14" fill="url(#gal-enz-sub)" stroke="#1c2f52" strokeWidth="1.1" />
      <path d="M255 150 L262 150" stroke="#2c3f38" strokeWidth="3" strokeLinecap="round" markerEnd="url(#gal-enz-arrow)" />
      <defs>
        <marker id="gal-enz-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill="#2c3f38" />
        </marker>
      </defs>
      <text x="150" y="155" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1f2e2a" opacity="0.75">active site</text>
    </svg>
  );
}

function MitosisPreview() {
  const chromatid = (x: number, y: number, rotate: number, color: string) => (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x="-6" y="-28" width="12" height="56" rx="6" fill={color} />
      <rect x="8" y="-28" width="12" height="56" rx="6" fill={color} />
      <circle cx="7" cy="0" r="3.5" fill="#000" opacity="0.75" />
    </g>
  );

  return (
    <svg viewBox="0 0 400 300" className="h-full w-full">
      <defs>
        <radialGradient id="gal-mit-cyto" cx="35%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#fbfeff" />
          <stop offset="60%" stopColor="#dcedf8" />
          <stop offset="100%" stopColor="#a9c8dd" />
        </radialGradient>
        <linearGradient id="gal-chrom-red" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e0576e" />
          <stop offset="100%" stopColor="#7a1329" />
        </linearGradient>
        <linearGradient id="gal-chrom-blue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5a83c9" />
          <stop offset="100%" stopColor="#1e3a6e" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="150" r="120" fill="url(#gal-mit-cyto)" stroke="#4a6d85" strokeWidth="1.8" />
      <line x1="90" y1="150" x2="310" y2="150" stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="5 5" opacity="0.6" />
      {chromatid(160, 150, -6, "url(#gal-chrom-red)")}
      {chromatid(200, 150, 4, "url(#gal-chrom-blue)")}
      {chromatid(240, 150, -8, "url(#gal-chrom-red)")}
      {[80, 320].map((x) => (
        <g key={x}>
          <circle cx={x} cy="150" r="9" fill="#e0be6f" stroke="#8a6a2f" strokeWidth="1.4" />
          {[-1, 0, 1].map((offset) => (
            <line key={offset} x1={x} y1="150" x2={200 + offset * 20} y2={140 + offset * 10} stroke="#8a6a2f" strokeWidth="1.1" opacity="0.4" />
          ))}
        </g>
      ))}
    </svg>
  );
}

function NaturalSelectionPreview() {
  const moth = (x: number, y: number, light: boolean, scale = 1) => (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="-9" cy="0" rx="11" ry="7" fill={light ? "#d9c99a" : "#33210f"} stroke={light ? "#8a7550" : "#140d06"} strokeWidth="1.2" transform="rotate(-18 -9 0)" />
      <ellipse cx="9" cy="0" rx="11" ry="7" fill={light ? "#d9c99a" : "#33210f"} stroke={light ? "#8a7550" : "#140d06"} strokeWidth="1.2" transform="rotate(18 9 0)" />
      <ellipse cx="0" cy="0" rx="3.4" ry="9" fill={light ? "#a68f5c" : "#1a0f08"} />
    </g>
  );

  const positions: Array<[number, number, boolean]> = [
    [70, 60, false], [130, 50, false], [190, 65, true], [250, 55, false], [310, 60, false],
    [60, 130, true], [125, 120, false], [190, 135, false], [255, 125, false], [320, 130, true],
    [80, 200, false], [145, 210, false], [205, 195, false], [270, 205, true], [330, 200, false],
    [95, 260, false], [165, 250, false], [230, 260, false], [295, 250, false],
  ];

  return (
    <svg viewBox="0 0 400 300" className="h-full w-full">
      <defs>
        <linearGradient id="gal-bark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8a715a" />
          <stop offset="100%" stopColor="#6b5541" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="300" fill="url(#gal-bark)" />
      {positions.map(([x, y, light], i) => (
        <g key={i}>{moth(x, y, light, 1.15)}</g>
      ))}
    </svg>
  );
}

const SIMULATIONS: Array<{
  href: string;
  title: string;
  tag: string;
  Preview: () => JSX.Element;
}> = [
  { href: "/sims/simulations/cell-model", title: "Interactive cell model", tag: "Unit 2", Preview: CellModelPreview },
  { href: "/sims/simulations/osmosis", title: "Osmosis & diffusion", tag: "Unit 2", Preview: OsmosisPreview },
  { href: "/sims/simulations/enzyme-kinetics", title: "Enzyme kinetics", tag: "Unit 3", Preview: EnzymePreview },
  { href: "/sims/simulations/mitosis", title: "Mitosis & the cell cycle", tag: "Unit 4", Preview: MitosisPreview },
  { href: "/sims/simulations/natural-selection", title: "Natural selection", tag: "Unit 7", Preview: NaturalSelectionPreview },
];

export default function SimulationsGalleryPage() {
  return (
    <main className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {SIMULATIONS.map(({ href, title, tag, Preview }) => (
        <Link
          key={href}
          href={href}
          className="pop-hover group block overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--shadow-sm)] hover:border-[color:var(--border-strong)]"
        >
          <div className="aspect-[4/3] w-full overflow-hidden bg-[color:var(--surface-muted)]">
            <Preview />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3.5">
            <span className="text-base font-semibold text-[color:var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>
              {title}
            </span>
            <span className="shrink-0 rounded-full bg-[color:var(--brand-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--brand-dark)]">
              {tag}
            </span>
          </div>
        </Link>
      ))}
    </main>
  );
}
