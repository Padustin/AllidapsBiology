"use client";

import React, { type CSSProperties, useEffect, useRef, useState } from "react";

type OrganelleKey =
  | "nucleolus"
  | "nucleus"
  | "ribosomes"
  | "vesicle"
  | "roughER"
  | "golgi"
  | "cytoskeleton"
  | "smoothER"
  | "mitochondrion"
  | "vacuole"
  | "cytosol"
  | "lysosome"
  | "centriole"
  | "membrane";

type OrganelleInfo = {
  name: string;
  fill: string;
  stroke: string;
  steps: string[];
};

type Point = {
  x: number;
  y: number;
};

type DogmaPresentationMode = "guided" | "plain";

const FREE_RIBOSOME_POINTS: readonly Point[] = [
  { x: 320, y: 500 },
  { x: 345, y: 540 },
  { x: 356, y: 462 },
  { x: 960, y: 265 },
  { x: 1260, y: 560 },
  { x: 936, y: 785 },
  { x: 875, y: 820 },
  { x: 690, y: 815 },
  { x: 520, y: 255 },
] as const;

const ORGANELLES: Record<OrganelleKey, OrganelleInfo> = {
  nucleolus: {
    name: "Nucleolus",
    fill: "#d946ef",
    stroke: "#86198f",
    steps: ["rRNA synthesis", "Subunit assembly", "Ribosome export", "Cycle reset"],
  },
  nucleus: {
    name: "Nucleus",
    fill: "#a855f7",
    stroke: "#6b21a8",
    steps: ["DNA access", "Transcription", "mRNA processing", "Nuclear export"],
  },
  ribosomes: {
    name: "Ribosomes",
    fill: "#38bdf8",
    stroke: "#0369a1",
    steps: ["mRNA bind", "tRNA match", "Peptide bond", "Release"],
  },
  vesicle: {
    name: "Vesicle",
    fill: "#84cc16",
    stroke: "#3f6212",
    steps: ["Cargo load", "Budding", "Transport", "Fusion"],
  },
  roughER: {
    name: "Rough endoplasmic reticulum",
    fill: "#0ea5e9",
    stroke: "#075985",
    steps: ["Protein entry", "Folding", "Quality check", "Vesicle exit"],
  },
  golgi: {
    name: "Golgi apparatus",
    fill: "#ec4899",
    stroke: "#9d174d",
    steps: ["Receive", "Modify", "Sort", "Ship"],
  },
  cytoskeleton: {
    name: "Cytoskeleton",
    fill: "#64748b",
    stroke: "#334155",
    steps: ["Anchor", "Track setup", "Transport", "Reorganize"],
  },
  smoothER: {
    name: "Smooth endoplasmic reticulum",
    fill: "#06b6d4",
    stroke: "#155e75",
    steps: ["Lipid synthesis", "Detox", "Storage", "Membrane supply"],
  },
  mitochondrion: {
    name: "Mitochondrion",
    fill: "#f97316",
    stroke: "#9a3412",
    steps: ["Fuel input", "ETC run", "ATP synthase", "ATP output"],
  },
  vacuole: {
    name: "Vacuole",
    fill: "#3b82f6",
    stroke: "#1d4ed8",
    steps: ["Fill", "Store", "Balance", "Release"],
  },
  cytosol: {
    name: "Cytosol",
    fill: "#94a3b8",
    stroke: "#475569",
    steps: ["Molecule mix", "Diffusion", "Reactions", "Redistribute"],
  },
  lysosome: {
    name: "Lysosome",
    fill: "#e11d48",
    stroke: "#881337",
    steps: ["Cargo intake", "Acidify", "Digest", "Recycle"],
  },
  centriole: {
    name: "Centriole",
    fill: "#facc15",
    stroke: "#a16207",
    steps: ["Pairing", "Microtubule nucleation", "Spindle setup", "Division assist"],
  },
  membrane: {
    name: "Cell membrane",
    fill: "#64748b",
    stroke: "#334155",
    steps: ["Signal receive", "Selective transport", "Gradient control", "Homeostasis"],
  },
};

function cardStyle(): CSSProperties {
  return {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
  };
}

function CentralDogmaOverlay({
  runId,
  ribosomeTarget,
  matureOrangeLength,
  aminoAcidCount,
  mode,
}: {
  runId: number;
  ribosomeTarget: Point;
  matureOrangeLength: number;
  aminoAcidCount: number;
  mode: DogmaPresentationMode;
}) {
  if (runId === 0) {
    return null;
  }

  const polypeptideColors = [
    { fill: "#fbbf24", stroke: "#b45309" },
    { fill: "#34d399", stroke: "#047857" },
    { fill: "#60a5fa", stroke: "#1d4ed8" },
    { fill: "#f472b6", stroke: "#be185d" },
    { fill: "#a78bfa", stroke: "#6d28d9" },
    { fill: "#fb7185", stroke: "#be123c" },
    { fill: "#22d3ee", stroke: "#0e7490" },
  ] as const;
  const polypeptideAminoAcids = ["MET", "ALA", "GLY", "SER", "LEU", "LYS", "VAL"] as const;
  const peptideDirection = ribosomeTarget.x < 790 ? 1 : -1;
  const nucleusCenter = { x: 790, y: 515 };
  const targetDx = ribosomeTarget.x - nucleusCenter.x;
  const targetDy = ribosomeTarget.y - nucleusCenter.y;
  const targetDistance = Math.max(1, Math.hypot(targetDx, targetDy));
  const unitDx = targetDx / targetDistance;
  const unitDy = targetDy / targetDistance;
  const nuclearExitInner = {
    x: Math.round(nucleusCenter.x + unitDx * 108),
    y: Math.round(nucleusCenter.y + unitDy * 108),
  };
  const nuclearExitOuter = {
    x: Math.round(nucleusCenter.x + unitDx * 130),
    y: Math.round(nucleusCenter.y + unitDy * 130),
  };
  const exitApproachControl = {
    x: Math.round((742 + nuclearExitInner.x) / 2 - unitDy * 28),
    y: Math.round((574 + nuclearExitInner.y) / 2 + unitDx * 28),
  };
  const exportControlA = {
    x: Math.round((nuclearExitOuter.x + ribosomeTarget.x) / 2 + unitDy * 30),
    y: Math.round((nuclearExitOuter.y + ribosomeTarget.y) / 2 - unitDx * 30),
  };
  const exportControlB = {
    x: Math.round(ribosomeTarget.x + peptideDirection * 36),
    y: Math.round(ribosomeTarget.y - 12),
  };
  const matureMrnaStart = { x: 780, y: 574 };
  const mrnaToExitPath = `M 0 0 Q ${exitApproachControl.x - matureMrnaStart.x} ${exitApproachControl.y - matureMrnaStart.y} ${nuclearExitInner.x - matureMrnaStart.x} ${nuclearExitInner.y - matureMrnaStart.y}`;
  const mrnaCrossMembranePath = `M ${nuclearExitInner.x - matureMrnaStart.x} ${nuclearExitInner.y - matureMrnaStart.y} Q ${Math.round((nuclearExitInner.x + nuclearExitOuter.x) / 2) - matureMrnaStart.x} ${Math.round(
    (nuclearExitInner.y + nuclearExitOuter.y) / 2,
  ) - matureMrnaStart.y} ${nuclearExitOuter.x - matureMrnaStart.x} ${nuclearExitOuter.y - matureMrnaStart.y}`;
  const matureMrnaPath = `M ${nuclearExitOuter.x - matureMrnaStart.x} ${nuclearExitOuter.y - matureMrnaStart.y} Q ${exportControlA.x - matureMrnaStart.x} ${exportControlA.y - matureMrnaStart.y} ${Math.round(
    (nuclearExitOuter.x + ribosomeTarget.x) / 2,
  ) - matureMrnaStart.x} ${Math.round((nuclearExitOuter.y + ribosomeTarget.y) / 2) - matureMrnaStart.y} Q ${exportControlB.x - matureMrnaStart.x} ${exportControlB.y - matureMrnaStart.y} ${ribosomeTarget.x - matureMrnaStart.x} ${ribosomeTarget.y - matureMrnaStart.y}`;
  const orangeSpan = Math.max(28, Math.min(56, matureOrangeLength));
  const orangeStartX = -24;
  const orangeEndX = orangeStartX + orangeSpan;
  const orangeKnot1 = Math.round(orangeStartX + orangeSpan / 3);
  const orangeKnot2 = Math.round(orangeStartX + (orangeSpan * 2) / 3);
  const orangeControl1 = Math.round((orangeStartX + orangeKnot1) / 2);
  const orangeControl2 = Math.round((orangeKnot1 + orangeKnot2) / 2);
  const orangeControl3 = Math.round((orangeKnot2 + orangeEndX) / 2);
  const matureLeftCapPath = "M -38 0 Q -33 -5 -28 0 Q -26 2 -24 0";
  const matureOrangePath = `M ${orangeStartX} 0 Q ${orangeControl1} 7 ${orangeKnot1} 0 Q ${orangeControl2} -7 ${orangeKnot2} 0 Q ${orangeControl3} 7 ${orangeEndX} 0`;
  const matureRightCapPath = `M ${orangeEndX} 0 Q ${orangeEndX + 6} -6 ${orangeEndX + 12} 0 Q ${orangeEndX + 17} 6 ${orangeEndX + 22} 0 Q ${orangeEndX + 23} -1 ${orangeEndX + 24} 0`;
  const polypeptidePlan = [
    { x: 0, y: 0, foldX: 48, foldY: -34, aminoAcid: "MET" },
    { x: 17, y: -5, foldX: 62, foldY: -20, aminoAcid: "ALA" },
    { x: 35, y: -10, foldX: 54, foldY: -6, aminoAcid: "GLY" },
    { x: 54, y: -14, foldX: 70, foldY: -26, aminoAcid: "SER" },
    { x: 74, y: -16, foldX: 58, foldY: -12, aminoAcid: "LEU" },
    { x: 95, y: -16, foldX: 74, foldY: 4, aminoAcid: "LYS" },
    { x: 116, y: -14, foldX: 64, foldY: -16, aminoAcid: "VAL" },
    { x: 138, y: -10, foldX: 82, foldY: -24, aminoAcid: "THR" },
    { x: 160, y: -6, foldX: 92, foldY: -8, aminoAcid: "ASN" },
    { x: 182, y: -2, foldX: 86, foldY: 10, aminoAcid: "PRO" },
  ] as const;
  const clampedAminoAcidCount = Math.max(4, Math.min(polypeptidePlan.length, aminoAcidCount));
  const visiblePolypeptide = polypeptidePlan.slice(0, clampedAminoAcidCount);
  const isGuided = mode === "guided";
  const preMrnaNodeBegins = isGuided ? [8.4, 8.95, 9.5, 10.05, 10.6] : [5.6, 5.95, 6.3, 6.65, 7.0];
  const preMrnaMoveBegin = isGuided ? 15.2 : 7.2;
  const preMrnaFadeBegin = isGuided ? 16.05 : 8.05;
  const matureAppearBegin = isGuided ? 20 : 10.3;
  const matureMove1Begin = isGuided ? 24 : 10.65;
  const matureMove2Begin = matureMove1Begin + 1.35;
  const matureMove3Begin = matureMove2Begin + 1.15;
  const chainStart = isGuided ? 29.3 : matureMove3Begin + 1.55 + 0.08;
  const chainStep = 0.3;
  const chainExtendDuration = 1.65;
  const chainPauseDuration = isGuided ? 6 : 0;
  const lastChainExtendEnd = chainStart + (visiblePolypeptide.length - 1) * chainStep + chainExtendDuration;
  const chainZoomStart = lastChainExtendEnd;
  const fourthTextBegin = `${(chainZoomStart + 1.7).toFixed(2)}s`;
  const foldStart = lastChainExtendEnd + chainPauseDuration;
  const fifthTextBegin = `${(foldStart + 2.9).toFixed(2)}s`;
  const fourthBoxWidth = 430;
  const fifthBoxWidth = 470;
  const fourthBoxX = Math.max(30, Math.min(1600 - fourthBoxWidth - 30, ribosomeTarget.x - fourthBoxWidth / 2));
  const fifthBoxX = Math.max(30, Math.min(1600 - fifthBoxWidth - 30, ribosomeTarget.x - fifthBoxWidth / 2));
  const fourthBoxY = Math.max(40, ribosomeTarget.y - 190);
  const fifthBoxY = Math.max(40, ribosomeTarget.y - 124);
  const fourthTextTransform = `translate(${fourthBoxX} ${fourthBoxY})`;
  const fifthTextTransform = `translate(${fifthBoxX} ${fifthBoxY})`;
  const foldCenterX = Math.round(visiblePolypeptide.reduce((sum, node) => sum + node.foldX, 0) / visiblePolypeptide.length);
  const foldMaxY = Math.max(...visiblePolypeptide.map((node) => node.foldY));
  const proteinLabelY = foldMaxY + 24;
  const proteinLabelBegin = `${(foldStart + 1.2).toFixed(2)}s`;
  const matureVisibleDuration = isGuided ? 9.25 : Math.max(3.9, chainStart - matureAppearBegin + 0.2);
  const showExplanationBoxes = isGuided;
  const ligandStart = isGuided ? 2 : 0.5;
  const ligandSeg2 = isGuided ? 7.1 : 1.2;
  const ligandSeg3 = isGuided ? 7.9 : 2.0;
  const ligandSeg4 = isGuided ? 9.5 : 3.6;
  const ligandSeg5 = isGuided ? 10.05 : 4.15;
  const ligandDuration = isGuided ? 8.75 : 4.35;

  return (
    <g key={`central-dogma-${runId}`} pointerEvents="none">
      <circle cx="0" cy="0" r="16" fill="#f59e0b" stroke="#b45309" strokeWidth="4" opacity="0">
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.03;0.96;1" begin={`${ligandStart.toFixed(2)}s`} dur={`${ligandDuration.toFixed(2)}s`} fill="freeze" />
        <animateMotion begin={`${ligandStart.toFixed(2)}s`} dur="0.7s" fill="freeze" path="M 1810 500 C 1700 500, 1540 500, 1435 500" />
        <animateMotion begin={`${ligandSeg2.toFixed(2)}s`} dur="0.8s" fill="freeze" path="M 1435 500 C 1420 500, 1390 503, 1362 505" />
        <animateMotion begin={`${ligandSeg3.toFixed(2)}s`} dur="1.6s" fill="freeze" path="M 1362 505 C 1220 508, 1060 512, 920 515" />
        <animateMotion begin={`${ligandSeg4.toFixed(2)}s`} dur="0.55s" fill="freeze" path="M 920 515 C 916 515, 910 515, 902 515" />
        <animateMotion begin={`${ligandSeg5.toFixed(2)}s`} dur="0.7s" fill="freeze" path="M 902 515 C 872 515, 830 515, 790 515" />
      </circle>

      {showExplanationBoxes ? (
        <>
          <g opacity="0">
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.88;1" begin="4.8s" dur="3.5s" fill="freeze" />
            <rect x="1050" y="404" width="520" height="90" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <text x="1070" y="440" fontSize="20" fontWeight="800" fill="#0f172a">
              <tspan x="1070" dy="0">Transcription signaling ligand enters cell</tspan>
              <tspan x="1070" dy="28">to start the transcription of a gene</tspan>
            </text>
          </g>

          <g opacity="0">
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.92;1" begin="16s" dur="2.8s" fill="freeze" />
            <rect x="440" y="325" width="420" height="86" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <text x="460" y="360" fontSize="20" fontWeight="800" fill="#0f172a">
              <tspan x="460" dy="0">-RNA polymerase transcribes gene</tspan>
              <tspan x="460" dy="28">-pre-mRNA is made</tspan>
            </text>
          </g>

          <g opacity="0">
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.92;1" begin="21.7s" dur="3.5s" fill="freeze" />
            <rect x="430" y="340" width="710" height="86" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <text x="452" y="374" fontSize="20" fontWeight="800" fill="#0f172a">
              <tspan x="452" dy="0">-introns(non-coding sequences) cut out and only exon remain</tspan>
              <tspan x="452" dy="30">-5' GTP cap and 3' poly-A tail attached</tspan>
            </text>
          </g>

          <g opacity="0" transform={fourthTextTransform}>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.92;1" begin={fourthTextBegin} dur="2.8s" fill="freeze" />
            <rect x="0" y="0" width="430" height="86" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <text x="22" y="34" fontSize="20" fontWeight="800" fill="#0f172a">
              <tspan x="22" dy="0">ribosome translates mRNA</tspan>
              <tspan x="22" dy="28">to an amino-acid chain</tspan>
            </text>
          </g>

          <g opacity="0" transform={fifthTextTransform}>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.92;1" begin={fifthTextBegin} dur="2.8s" fill="freeze" />
            <rect x="0" y="0" width="470" height="86" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <text x="22" y="34" fontSize="20" fontWeight="800" fill="#0f172a">
              <tspan x="22" dy="0">amino-acid chain folds to create</tspan>
              <tspan x="22" dy="28">final protein form</tspan>
            </text>
          </g>
        </>
      ) : null}

      {/* pre-mRNA (inside nucleus): built, then moves into the spliceosome */}
      <g opacity="1">
        {([
          { d: "M 790 515 Q 782 504 774 512", stroke: "#f97316" },
          { d: "M 774 512 Q 766 520 758 512", stroke: "#991b1b" },
          { d: "M 758 512 Q 750 504 742 513", stroke: "#f97316" },
          { d: "M 742 513 Q 734 522 726 514", stroke: "#991b1b" },
          { d: "M 726 514 Q 718 506 710 516", stroke: "#f97316" },
        ] as const).map((node, i) => (
          <path key={`nucleus-mrna-${i}`} d={node.d} fill="none" stroke={node.stroke} strokeWidth="6" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" values="0;1;1" keyTimes="0;0.15;1" begin={`${preMrnaNodeBegins[i].toFixed(2)}s`} dur="3.2s" fill="freeze" />
          </path>
        ))}
        <animateMotion begin={`${preMrnaMoveBegin.toFixed(2)}s`} dur="0.85s" fill="freeze" path="M 0 0 Q -8 24 -16 58" />
        <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.9;1" begin={`${preMrnaFadeBegin.toFixed(2)}s`} dur="0.2s" fill="freeze" />
      </g>

      {/* mature mRNA (post-spliceosome): exits nucleus to ribosome */}
      <g opacity="0" transform={`translate(${matureMrnaStart.x} ${matureMrnaStart.y})`}>
        <animate
          attributeName="opacity"
          values="0;0.95;0.95;0"
          keyTimes="0;0.01;0.98;1"
          begin={`${matureAppearBegin.toFixed(2)}s`}
          dur={`${matureVisibleDuration.toFixed(2)}s`}
          fill="freeze"
        />
        <animateMotion begin={`${matureMove1Begin.toFixed(2)}s`} dur="1.35s" fill="freeze" path={mrnaToExitPath} />
        <animateMotion begin={`${matureMove2Begin.toFixed(2)}s`} dur="1.15s" fill="freeze" path={mrnaCrossMembranePath} />
        <animateMotion begin={`${matureMove3Begin.toFixed(2)}s`} dur="1.55s" fill="freeze" path={matureMrnaPath} />
        <g>
          <path
            d={matureLeftCapPath}
            fill="none"
            stroke="#22c55e"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset="100"
          >
            <animate attributeName="stroke-dashoffset" begin={`${matureAppearBegin.toFixed(2)}s`} dur="0.28s" from="100" to="0" fill="freeze" />
          </path>
          <path
            d={matureOrangePath}
            fill="none"
            stroke="#f97316"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset="100"
          >
            <animate attributeName="stroke-dashoffset" begin={`${(matureAppearBegin + 0.2).toFixed(2)}s`} dur="0.45s" from="100" to="0" fill="freeze" />
          </path>
          <path
            d={matureRightCapPath}
            fill="none"
            stroke="#eab308"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset="100"
          >
            <animate attributeName="stroke-dashoffset" begin={`${(matureAppearBegin + 0.55).toFixed(2)}s`} dur="0.3s" from="100" to="0" fill="freeze" />
          </path>
        </g>
      </g>

      {visiblePolypeptide.map((dot, index) => {
        const appearSeconds = chainStart + index * chainStep;
        const moveSeconds = chainStart + index * chainStep;
        const appearBegin = `${appearSeconds.toFixed(2)}s`;
        const moveBegin = `${moveSeconds.toFixed(2)}s`;
        return (
        <g key={index} transform={`translate(${ribosomeTarget.x} ${ribosomeTarget.y})`} opacity="0">
          <animate attributeName="opacity" values="0;1" begin={appearBegin} dur="0.28s" fill="freeze" />
          <animateTransform
            attributeName="transform"
            type="translate"
            from={`${ribosomeTarget.x} ${ribosomeTarget.y}`}
            to={`${ribosomeTarget.x + peptideDirection * dot.x} ${ribosomeTarget.y + dot.y}`}
            begin={moveBegin}
            dur="1.65s"
            fill="freeze"
          />
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to={`${peptideDirection * (dot.foldX - dot.x)} ${dot.foldY - dot.y}`}
              begin={`${foldStart.toFixed(2)}s`}
              dur="1.2s"
              fill="freeze"
            />
            <circle
              cx="0"
              cy="0"
              r="11.5"
              fill={polypeptideColors[index % polypeptideColors.length].fill}
              stroke={polypeptideColors[index % polypeptideColors.length].stroke}
              strokeWidth="2.5"
            />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fontSize="5.2" fontWeight="800" fill="#0f172a">
              {dot.aminoAcid}
            </text>
          </g>
        </g>
        );
      })}

      <g transform={`translate(${ribosomeTarget.x} ${ribosomeTarget.y})`} opacity="0">
        <animate attributeName="opacity" values="0;1" begin={proteinLabelBegin} dur="0.35s" fill="freeze" />
        <text x={peptideDirection * foldCenterX} y={proteinLabelY} textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f172a">
          Protein
        </text>
      </g>
    </g>
  );
}

function CellImageMap({
  selected,
  onSelect,
  dogmaRun,
  showDogma,
  ribosomeTarget,
  matureOrangeLength,
  aminoAcidCount,
  dogmaMode,
}: {
  selected: OrganelleKey | null;
  onSelect: (id: OrganelleKey) => void;
  dogmaRun: number;
  showDogma: boolean;
  ribosomeTarget: Point;
  matureOrangeLength: number;
  aminoAcidCount: number;
  dogmaMode: DogmaPresentationMode;
}) {
  const [svgViewBox, setSvgViewBox] = useState("0 0 1600 1000");
  const currentVBRef = useRef<number[]>([0, 0, 1600, 1000]);
  const vbRafRef = useRef<number | null>(null);
  const vbScheduleRef = useRef<number[]>([]);

  useEffect(() => {
    if (dogmaRun === 0 || !showDogma) return;
    vbScheduleRef.current.forEach(clearTimeout);
    vbScheduleRef.current = [];
    if (vbRafRef.current !== null) {
      cancelAnimationFrame(vbRafRef.current);
      vbRafRef.current = null;
    }
    currentVBRef.current = [0, 0, 1600, 1000];
    setSvgViewBox("0 0 1600 1000");

    if (dogmaMode === "plain") {
      return () => {
        vbScheduleRef.current.forEach(clearTimeout);
        vbScheduleRef.current = [];
        if (vbRafRef.current !== null) {
          cancelAnimationFrame(vbRafRef.current);
          vbRafRef.current = null;
        }
        currentVBRef.current = [0, 0, 1600, 1000];
      };
    }

    function zoom(cx: number, cy: number, scale: number): number[] {
      const w = 1600 / scale;
      const h = 1000 / scale;
      return [cx - w / 2, cy - h / 2, w, h];
    }

    function animateVB(target: number[], durationMs: number) {
      if (vbRafRef.current !== null) cancelAnimationFrame(vbRafRef.current);
      const from = [...currentVBRef.current];
      currentVBRef.current = [...target];
      const start = performance.now();
      function step(now: number) {
        const t = Math.min((now - start) / durationMs, 1);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const next = from.map((f, i) => f + (target[i] - f) * ease);
        setSvgViewBox(`${next[0].toFixed(1)} ${next[1].toFixed(1)} ${next[2].toFixed(1)} ${next[3].toFixed(1)}`);
        if (t < 1) {
          vbRafRef.current = requestAnimationFrame(step);
        } else {
          vbRafRef.current = null;
        }
      }
      vbRafRef.current = requestAnimationFrame(step);
    }

    function schedule(delayMs: number, target: number[], dur: number) {
      const id = window.setTimeout(() => animateVB(target, dur), delayMs);
      vbScheduleRef.current.push(id);
    }

    const DEFAULT = [0, 0, 1600, 1000];
    const clampedCount = Math.max(4, Math.min(10, aminoAcidCount));
    const chainStart = 29.3;
    const chainStep = 0.3;
    const chainExtendDuration = 1.65;
    const chainZoomStart = chainStart + (clampedCount - 1) * chainStep + chainExtendDuration;
    const chainZoomEnd = chainZoomStart + 6;
    const foldStart = chainZoomEnd;
    const foldZoomMs = Math.round((foldStart + 1.2) * 1000);
    const rt = ribosomeTarget;

    // Pause and zoom checkpoints requested by user.
    schedule(3100, zoom(1300, 500, 1.8), 1700);
    schedule(7100, DEFAULT, 700);
    schedule(14300, zoom(760, 512, 2.2), 1700);
    schedule(20000, zoom(760, 574, 2.0), 1700);
    schedule(26000, DEFAULT, 700);
    schedule(Math.round(chainZoomStart * 1000), zoom(rt.x, rt.y, 2.0), 1700);
    schedule(foldZoomMs, zoom(rt.x, rt.y, 2.5), 1700);
    schedule(foldZoomMs + 6000, DEFAULT, 700);

    return () => {
      vbScheduleRef.current.forEach(clearTimeout);
      vbScheduleRef.current = [];
      if (vbRafRef.current !== null) {
        cancelAnimationFrame(vbRafRef.current);
        vbRafRef.current = null;
      }
      currentVBRef.current = [0, 0, 1600, 1000];
    };
  }, [dogmaRun, showDogma, ribosomeTarget, aminoAcidCount, dogmaMode]);

  const handleClick = (rawId: string) => {
    const mapped: OrganelleKey = rawId === "ribosome" ? "ribosomes" : (rawId as OrganelleKey);
    onSelect(mapped);
  };

  const gClick = (rawId: string, label: string) => {
    const mapped: OrganelleKey = rawId === "ribosome" ? "ribosomes" : (rawId as OrganelleKey);
    return {
      role: "button" as const,
      tabIndex: 0,
      onClick: () => handleClick(rawId),
      onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(rawId);
        }
      },
      "aria-label": label,
      className: `cursor-pointer transition-opacity duration-200 hover:opacity-80 focus:outline-none${
        selected === mapped ? " opacity-60" : ""
      }`,
    };
  };

  return (
    <div style={{ width: "100%", maxWidth: 1320, margin: "0 auto" }}>
      <svg viewBox={svgViewBox} style={{ width: "100%", height: "auto", display: "block" }} xmlns="http://www.w3.org/2000/svg">
        <title>Interactive animal cell diagram</title>
        <desc>A simplified animal cell diagram with clearly separated and more defined organelles.</desc>

        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodOpacity="0.14" />
          </filter>
          <radialGradient id="cytoplasmGlow" cx="50%" cy="45%" r="72%">
            <stop offset="0%" stopColor="#f8fbff" />
            <stop offset="100%" stopColor="#dbeafe" />
          </radialGradient>
          <linearGradient id="membraneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="nucleusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eee5ff" />
            <stop offset="100%" stopColor="#b08df5" />
          </linearGradient>
          <linearGradient id="nucleolusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id="mitoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
          <linearGradient id="golgiGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fee2e2" />
            <stop offset="100%" stopColor="#fca5a5" />
          </linearGradient>
          <linearGradient id="golgiGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fecaca" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
          <linearGradient id="golgiGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="mrnaTravelGradient" gradientUnits="userSpaceOnUse" x1="-30" y1="0" x2="30" y2="0">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="20%" stopColor="#f97316" />
            <stop offset="20%" stopColor="#991b1b" />
            <stop offset="40%" stopColor="#991b1b" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#991b1b" />
            <stop offset="80%" stopColor="#991b1b" />
            <stop offset="80%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* membrane */}
        <g {...gClick("membrane", "Cell membrane")}>
          <path
            d="M150 500 C150 275, 325 128, 615 110 C840 96, 1110 122, 1275 235 C1378 306, 1432 396, 1430 500 C1426 632, 1361 752, 1233 834 C1070 940, 817 949, 567 918 C347 890, 205 791, 162 648 C150 607, 145 556, 150 500 Z"
            fill="url(#membraneGradient)"
            stroke="#334155"
            strokeWidth="12"
            filter="url(#softShadow)"
          />
          <path
            d="M212 502 C212 317, 362 197, 624 180 C830 167, 1071 192, 1216 289 C1303 347, 1360 423, 1360 503 C1356 609, 1300 706, 1185 779 C1038 873, 810 882, 586 855 C390 831, 265 746, 228 625 C216 587, 208 548, 212 502 Z"
            fill="url(#cytoplasmGlow)"
            stroke="#94a3b8"
            strokeWidth="4"
          />
          {/* nuclear membrane (double envelope) */}
          <circle cx="790" cy="515" r="124" fill="url(#nucleusGradient)" stroke="#7c3aed" strokeWidth="5" opacity="0.44" />
          <circle cx="790" cy="515" r="112" fill="none" stroke="#a78bfa" strokeWidth="3.2" opacity="0.9" />
          {([[790, 391], [860, 412], [906, 466], [912, 535], [878, 594], [816, 631], [747, 632], [690, 597], [666, 534], [673, 465], [718, 411]] as [number, number][]).map(([cx, cy], i) => (
            <circle key={`nuclear-pore-${i}`} cx={cx} cy={cy} r="4.8" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.8" opacity="0.95" />
          ))}
          {([[727, 446], [770, 414], [834, 417], [883, 458], [900, 522], [868, 582], [806, 617], [742, 610], [688, 565], [675, 500]] as [number, number][]).map(([cx, cy], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx="7" ry="4" fill="#6d28d9" opacity="0.55" />
          ))}
          <circle cx="742" cy="574" r="10" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2.4" opacity="0.95" />
          <circle cx="738" cy="570" r="3.2" fill="#bfdbfe" opacity="0.9" />
          <circle cx="790" cy="515" r="28" fill="url(#nucleolusGradient)" opacity="0.95" />
          <circle cx="780" cy="506" r="8" fill="#c4b5fd" opacity="0.6" />
        </g>

        {/* smooth ER */}
        <g {...gClick("smoothER", "Smooth endoplasmic reticulum")}>
          <path d="M385 330 C438 302, 494 298, 542 314 C571 324, 594 341, 608 360" fill="none" stroke="#d97706" strokeWidth="11" strokeLinecap="round" />
          <path d="M372 374 C432 349, 495 347, 550 365 C579 374, 603 390, 618 408" fill="none" stroke="#d97706" strokeWidth="11" strokeLinecap="round" />
          <path d="M396 416 C453 396, 511 397, 562 414 C589 423, 612 437, 625 453" fill="none" stroke="#d97706" strokeWidth="11" strokeLinecap="round" />
          <path d="M432 328 C484 306, 536 306, 581 320" fill="none" stroke="#fdba74" strokeWidth="4.5" strokeLinecap="round" opacity="0.95" />
          <path d="M418 373 C477 351, 538 352, 590 368" fill="none" stroke="#fdba74" strokeWidth="4.5" strokeLinecap="round" opacity="0.95" />
          <path d="M440 415 C493 399, 548 401, 594 416" fill="none" stroke="#fdba74" strokeWidth="4.5" strokeLinecap="round" opacity="0.95" />
          <path d="M437 309 C457 327, 469 348, 473 368 C476 384, 472 400, 460 413" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
          <path d="M509 312 C529 330, 542 350, 546 370 C549 386, 545 402, 533 414" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* rough ER */}
        <g {...gClick("roughER", "Rough endoplasmic reticulum")}>
          <path d="M400 640 C462 614, 526 610, 585 624 C630 634, 669 653, 699 676" fill="none" stroke="#0284c7" strokeWidth="11.5" strokeLinecap="round" />
          <path d="M386 687 C456 663, 530 661, 598 676 C646 687, 686 706, 718 728" fill="none" stroke="#0284c7" strokeWidth="11.5" strokeLinecap="round" />
          <path d="M414 733 C480 717, 549 717, 613 731 C657 740, 697 756, 728 775" fill="none" stroke="#0284c7" strokeWidth="11.5" strokeLinecap="round" />
          <path d="M432 641 C486 620, 544 620, 598 633" fill="none" stroke="#7dd3fc" strokeWidth="4.5" strokeLinecap="round" opacity="0.95" />
          <path d="M420 688 C480 667, 546 668, 610 682" fill="none" stroke="#7dd3fc" strokeWidth="4.5" strokeLinecap="round" opacity="0.95" />
          <path d="M444 732 C500 718, 560 719, 620 734" fill="none" stroke="#7dd3fc" strokeWidth="4.5" strokeLinecap="round" opacity="0.95" />
          <path d="M447 621 C466 639, 477 658, 476 676 C474 692, 466 707, 452 720" fill="none" stroke="#7dd3fc" strokeWidth="4.8" strokeLinecap="round" />
          <path d="M520 617 C539 635, 550 655, 549 674 C547 690, 539 705, 525 719" fill="none" stroke="#7dd3fc" strokeWidth="4.8" strokeLinecap="round" />
          <path d="M594 627 C612 645, 623 665, 622 684 C620 700, 612 715, 598 728" fill="none" stroke="#7dd3fc" strokeWidth="4.8" strokeLinecap="round" />
          {([[418, 634], [452, 625], [489, 620], [529, 620], [570, 626], [612, 637], [653, 655], [407, 679], [446, 670], [488, 666], [532, 666], [577, 673], [621, 686], [663, 705], [432, 724], [473, 717], [516, 714], [561, 717], [605, 724], [648, 737], [689, 754]] as [number, number][]).map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="4.2" fill="#0f172a" />
              <circle cx={cx - 1.1} cy={cy - 1.1} r="1.2" fill="#60a5fa" opacity="0.9" />
            </g>
          ))}
        </g>

        {/* Golgi */}
        <g {...gClick("golgi", "Golgi apparatus")}>
          <path d="M1050 345 C1094 332, 1144 337, 1178 357 C1169 365, 1156 370, 1138 373 C1110 377, 1079 370, 1050 345 Z" fill="url(#golgiGrad1)" stroke="#dc2626" strokeWidth="3.8" />
          <path d="M1038 381 C1090 364, 1151 370, 1191 395 C1180 404, 1163 410, 1143 412 C1111 415, 1077 408, 1038 381 Z" fill="url(#golgiGrad1)" stroke="#dc2626" strokeWidth="3.8" />
          <path d="M1034 422 C1090 407, 1156 414, 1201 442 C1188 451, 1168 458, 1144 459 C1111 462, 1074 454, 1034 422 Z" fill="url(#golgiGrad2)" stroke="#dc2626" strokeWidth="3.8" />
          <path d="M1042 463 C1095 455, 1151 461, 1188 483 C1176 491, 1158 496, 1137 497 C1108 499, 1077 492, 1042 463 Z" fill="url(#golgiGrad3)" stroke="#b91c1c" strokeWidth="3.8" />
          <path d="M1066 350 C1097 347, 1128 349, 1155 359" fill="none" stroke="#fecaca" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          <path d="M1052 388 C1088 384, 1127 387, 1165 399" fill="none" stroke="#fee2e2" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          <path d="M1049 428 C1088 424, 1131 427, 1171 442" fill="none" stroke="#fee2e2" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          <path d="M1058 468 C1091 466, 1126 468, 1157 480" fill="none" stroke="#fecaca" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          <circle cx="1210" cy="493" r="7.5" fill="#fb7185" stroke="#be123c" strokeWidth="2.2" />
          <circle cx="1190" cy="510" r="6.1" fill="#fb7185" stroke="#be123c" strokeWidth="2.2" />
          <circle cx="1168" cy="523" r="5.2" fill="#fb7185" stroke="#be123c" strokeWidth="2.2" />
          <circle cx="1194" cy="336" r="5.4" fill="#fda4af" stroke="#b91c1c" strokeWidth="2" />
          <circle cx="1215" cy="356" r="4.6" fill="#fda4af" stroke="#b91c1c" strokeWidth="2" />
        </g>

        {/* mitochondrion */}
        <g {...gClick("mitochondrion", "Mitochondrion")}>
          <path
            d="M1048 655 C1067 624, 1105 606, 1148 610 C1188 614, 1220 638, 1229 672 C1238 705, 1223 739, 1191 756 C1154 775, 1107 773, 1074 752 C1041 732, 1030 693, 1048 655 Z"
            fill="url(#mitoGradient)"
            stroke="#be123c"
            strokeWidth="6.5"
          />
          <path
            d="M1063 646 C1081 621, 1111 607, 1148 610 C1181 613, 1208 632, 1216 660 C1225 689, 1211 717, 1184 732 C1153 749, 1114 747, 1086 729 C1058 712, 1048 679, 1063 646 Z"
            fill="none"
            stroke="#881337"
            strokeWidth="2.7"
            opacity="0.65"
          />
          <path d="M1064 672 C1081 652, 1095 694, 1113 672 C1129 652, 1145 697, 1165 675 C1181 658, 1195 694, 1210 674" fill="none" stroke="#9f1239" strokeWidth="4.7" strokeLinecap="round" />
          <path d="M1062 703 C1079 684, 1094 722, 1111 702 C1128 682, 1144 725, 1163 705 C1180 687, 1193 721, 1208 703" fill="none" stroke="#9f1239" strokeWidth="4.7" strokeLinecap="round" />
          <path d="M1082 657 C1090 676, 1090 699, 1083 719" fill="none" stroke="#fecdd3" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
          <path d="M1124 650 C1132 670, 1132 701, 1126 723" fill="none" stroke="#fecdd3" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
          <path d="M1167 653 C1173 673, 1172 699, 1166 718" fill="none" stroke="#fecdd3" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
        </g>

        {/* free ribosomes */}
        <g {...gClick("ribosome", "Ribosomes")}>
          {FREE_RIBOSOME_POINTS.map(({ x, y }, i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="5.5" fill="#2563eb" />
              <circle cx={x - 1.7} cy={y - 1.7} r="1.6" fill="#93c5fd" opacity="0.9" />
            </g>
          ))}
        </g>

        {/* labels */}
        <g fontFamily="Arial, sans-serif" fill="#0f172a">
          <g>
            <text x="790" y="372" textAnchor="middle" fontWeight="700" fontSize="24">Nucleus</text>
          </g>
          <g>
            <text x="712" y="585" textAnchor="end" fontWeight="700" fontSize="18">Spliceosome</text>
          </g>
          <g>
            <text x="420" y="276" textAnchor="middle" fontWeight="700" fontSize="22">Smooth ER</text>
          </g>
          <g>
            <text x="500" y="806" textAnchor="middle" fontWeight="700" fontSize="22">Rough ER</text>
          </g>
          <g>
            <text x="1118" y="332" textAnchor="middle" fontWeight="700" fontSize="22">Golgi</text>
          </g>
          <g>
            <text x="1148" y="776" textAnchor="middle" fontWeight="700" fontSize="22">Mitochondrion</text>
          </g>
          <g>
            <text x="284" y="508" textAnchor="end" fontWeight="700" fontSize="22">Ribosomes</text>
          </g>
          <g>
            <text x="790" y="130" textAnchor="middle" fontWeight="700" fontSize="22">Cell membrane</text>
          </g>
        </g>

        {showDogma ? (
          <CentralDogmaOverlay
            key={dogmaRun}
            runId={dogmaRun}
            ribosomeTarget={ribosomeTarget}
            matureOrangeLength={matureOrangeLength}
            aminoAcidCount={aminoAcidCount}
            mode={dogmaMode}
          />
        ) : null}
      </svg>
    </div>
  );
}

function NucleusMiniSim({ stepIndex }: { stepIndex: number }) {
  const state = [
    { x: 255, w: 20 },
    { x: 315, w: 70 },
    { x: 375, w: 130 },
    { x: 440, w: 180 },
  ][Math.min(stepIndex, 3)];

  return (
    <div style={cardStyle()}>
      <svg viewBox="0 0 700 240" style={{ width: "100%", height: "auto" }}>
        <circle cx="350" cy="120" r="92" fill="#f3e8ff" stroke="#9333ea" strokeWidth="4" />
        <path d="M240 96 C290 70, 330 70, 380 96 C420 118, 460 118, 500 96" fill="none" stroke="#1e293b" strokeWidth="5" />
        <path d="M240 145 C290 119, 330 119, 380 145 C420 167, 460 167, 500 145" fill="none" stroke="#1e293b" strokeWidth="5" />
        <ellipse cx={state.x} cy="120" rx="22" ry="16" fill="#2563eb" style={{ transition: "all .25s ease" }} />
        <path d={`M260 182 C ${280 + state.w / 2} 198, ${320 + state.w / 1.3} 198, ${350 + state.w} 182`} fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" style={{ transition: "all .25s ease" }} />
      </svg>
    </div>
  );
}

function RibosomeMiniSim({ stepIndex }: { stepIndex: number }) {
  const state = [
    { x: 260, aa: 0 },
    { x: 320, aa: 1 },
    { x: 380, aa: 2 },
    { x: 440, aa: 3 },
  ][Math.min(stepIndex, 3)];

  return (
    <div style={cardStyle()}>
      <svg viewBox="0 0 700 240" style={{ width: "100%", height: "auto" }}>
        <rect x="130" y="150" width="460" height="12" rx="6" fill="#fca5a5" />
        <ellipse cx="360" cy="112" rx="145" ry="52" fill="#bae6fd" stroke="#0369a1" strokeWidth="4" />
        <g style={{ transform: `translateX(${state.x - 260}px)`, transition: "transform .25s ease" }}>
          <path d="M260 186 C255 169, 271 159, 281 172 C288 182, 284 193, 274 201" fill="none" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
          <circle cx="274" cy="166" r="10" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="3" />
        </g>
        {new Array(state.aa).fill(0).map((_, i) => (
          <circle key={i} cx={425 + i * 24} cy={76 - i * 6} r="8" fill="#fbbf24" stroke="#b45309" strokeWidth="2" style={{ transition: "all .25s ease" }} />
        ))}
      </svg>
    </div>
  );
}

function GenericMiniSim({ organelle, stepIndex }: { organelle: OrganelleInfo; stepIndex: number }) {
  return (
    <div style={cardStyle()}>
      <svg viewBox="0 0 700 220" style={{ width: "100%", height: "auto" }}>
        <rect x="70" y="35" width="560" height="150" rx="20" fill="#f8fafc" stroke={organelle.stroke} strokeWidth="4" />
        <line x1="120" y1="110" x2="580" y2="110" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
        <circle cx={160 + stepIndex * 120} cy="110" r="18" fill={organelle.fill} stroke={organelle.stroke} strokeWidth="4" style={{ transition: "all .25s ease" }} />
      </svg>
    </div>
  );
}

function DetailPanel({ selected, onBack }: { selected: OrganelleKey; onBack: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const info = ORGANELLES[selected];
  const max = info.steps.length - 1;

  return (
    <div style={{ display: "grid", gap: 14 }} className="fade-in-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#0f172a" }}>
          {info.name}
        </h2>
        <button onClick={onBack} style={{ border: "1px solid #94a3b8", background: "white", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}>
          Back to cell
        </button>
      </div>

      {selected === "nucleus" ? (
        <NucleusMiniSim stepIndex={stepIndex} />
      ) : selected === "ribosomes" ? (
        <RibosomeMiniSim stepIndex={stepIndex} />
      ) : (
        <GenericMiniSim organelle={info} stepIndex={Math.min(stepIndex, 3)} />
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {info.steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setStepIndex(index)}
            style={{
              borderRadius: 999,
              width: 34,
              height: 34,
              border: stepIndex === index ? "1px solid #0f172a" : "1px solid #cbd5e1",
              background: stepIndex === index ? "#0f172a" : "#ffffff",
              color: stepIndex === index ? "#ffffff" : "#0f172a",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {index + 1}
          </button>
        ))}

        <button onClick={() => setStepIndex((s) => Math.min(s + 1, max))} style={{ border: "1px solid #1d4ed8", background: "#2563eb", color: "#ffffff", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}>
          Next
        </button>
        <button onClick={() => setStepIndex(0)} style={{ border: "1px solid #94a3b8", background: "#ffffff", color: "#0f172a", borderRadius: 10, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default function CompleteCellSimulationPage() {
  const [selected, setSelected] = useState<OrganelleKey | null>(null);
  const [dogmaRun, setDogmaRun] = useState(0);
  const [showDogma, setShowDogma] = useState(false);
  const [dogmaMode, setDogmaMode] = useState<DogmaPresentationMode>("plain");
  const [dogmaRibosomeTarget, setDogmaRibosomeTarget] = useState<Point>(FREE_RIBOSOME_POINTS[0]);
  const [matureOrangeLength, setMatureOrangeLength] = useState(42);
  const [aminoAcidCount, setAminoAcidCount] = useState(7);
  const replayTimerRef = useRef<number | null>(null);
  const replayFrameRef = useRef<number | null>(null);
  const [cellRenderKey, setCellRenderKey] = useState(0);

  const stopCentralDogma = () => {
    if (replayTimerRef.current !== null) {
      window.clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }
    if (replayFrameRef.current !== null) {
      window.cancelAnimationFrame(replayFrameRef.current);
      replayFrameRef.current = null;
    }
    setShowDogma(false);
  };

  useEffect(() => {
    return () => {
      if (replayTimerRef.current !== null) {
        window.clearTimeout(replayTimerRef.current);
      }
      if (replayFrameRef.current !== null) {
        window.cancelAnimationFrame(replayFrameRef.current);
      }
    };
  }, []);

  const handleSelect = (key: OrganelleKey) => {
    stopCentralDogma();
    setSelected(key);
  };

  const handleBackToCell = () => {
    stopCentralDogma();
    setSelected(null);
  };

  const replayCentralDogma = () => {
    stopCentralDogma();
    setSelected(null);
    setDogmaRibosomeTarget(FREE_RIBOSOME_POINTS[Math.floor(Math.random() * FREE_RIBOSOME_POINTS.length)]);
    setMatureOrangeLength(34 + Math.floor(Math.random() * 19));
    setAminoAcidCount(5 + Math.floor(Math.random() * 6));
    setCellRenderKey((value) => value + 1);

    replayTimerRef.current = window.setTimeout(() => {
      setDogmaRun((value) => value + 1);
      replayFrameRef.current = window.requestAnimationFrame(() => {
        setShowDogma(true);
        replayFrameRef.current = null;
      });
      replayTimerRef.current = null;
    }, 80);
  };

  return (
    <div className="study-screen" style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)", padding: 20, color: "#0f172a" }}>
      <style>{`
        .fade-in-up {
          animation: fadeInUp 240ms ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="hero-card" style={{ width: "100%", margin: 0, display: "grid", gap: 14, padding: 18 }}>
        <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.06, fontWeight: 900, letterSpacing: -0.3 }}>Complete Cell Simulation</h1>
        <p style={{ margin: 0, color: "#475569", maxWidth: 820, lineHeight: 1.5 }}>
          Explore organelles, pathway dynamics, and central dogma flow with interactive controls designed for focused AP Biology review.
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <button
            type="button"
            onClick={replayCentralDogma}
            style={{
              border: "1px solid #0369a1",
              background: "#2563eb",
              color: "#ffffff",
              borderRadius: 12,
              padding: "10px 14px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Central Dogma simulation
          </button>
          <label style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={dogmaMode === "guided"}
              onChange={(event) => setDogmaMode(event.target.checked ? "guided" : "plain")}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <span>Show guided explanation overlays</span>
          </label>
        </div>

        {!selected ? (
          <CellImageMap
            key={cellRenderKey}
            selected={selected}
            onSelect={handleSelect}
            dogmaRun={dogmaRun}
            showDogma={showDogma}
            ribosomeTarget={dogmaRibosomeTarget}
            matureOrangeLength={matureOrangeLength}
            aminoAcidCount={aminoAcidCount}
            dogmaMode={dogmaMode}
          />
        ) : (
          <DetailPanel selected={selected} onBack={handleBackToCell} />
        )}
      </div>
    </div>
  );
}
