"use client";

import React, { type CSSProperties, useEffect, useRef, useState } from "react";
import { PageHeader, SectionCard } from "../../../components/ui/study-kit";

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
  | "membrane"
  | "chloroplast"
  | "cellWall";

type CellType = "animal" | "plant";

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
  chloroplast: {
    name: "Chloroplast",
    fill: "#22c55e",
    stroke: "#15803d",
    steps: ["Light capture", "Light reactions (ATP + NADPH)", "Calvin cycle (carbon fixation)", "Glucose output"],
  },
  cellWall: {
    name: "Cell wall",
    fill: "#ca8a04",
    stroke: "#854d0e",
    steps: ["Structural support", "Turgor pressure maintenance", "Protection from lysis", "Plasmodesmata connections"],
  },
};

function cardStyle(): CSSProperties {
  return {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 16,
    boxShadow: "var(--shadow-sm)",
  };
}

// Shared gradients + shadow filter for the organelle "mini sim" detail views. Each mini-sim
// renders in its own standalone <svg> (the DetailPanel unmounts the main cell map while a
// detail view is open), so these defs get repeated inline rather than shared across documents —
// but keeping them as one component means every mini-sim reaches for the same polished palette
// instead of the flat, shadowless fills those views used to have.
function MiniSimDefs() {
  return (
    <defs>
      <filter id="miniShadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.18" />
      </filter>
      <radialGradient id="miniBody" cx="32%" cy="26%" r="85%">
        <stop offset="0%" stopColor="#fef6e7" />
        <stop offset="60%" stopColor="#f4e2bf" />
        <stop offset="100%" stopColor="#d9b877" />
      </radialGradient>
      <radialGradient id="miniPink" cx="32%" cy="26%" r="85%">
        <stop offset="0%" stopColor="#fecdd3" />
        <stop offset="55%" stopColor="#fb9dae" />
        <stop offset="100%" stopColor="#be123c" />
      </radialGradient>
      <radialGradient id="miniOrange" cx="32%" cy="26%" r="85%">
        <stop offset="0%" stopColor="#ffd7cc" />
        <stop offset="55%" stopColor="#f6a583" />
        <stop offset="100%" stopColor="#9a3412" />
      </radialGradient>
      <radialGradient id="miniGreen" cx="32%" cy="26%" r="85%">
        <stop offset="0%" stopColor="#e4f9cf" />
        <stop offset="55%" stopColor="#8fce6a" />
        <stop offset="100%" stopColor="#3f6212" />
      </radialGradient>
      <radialGradient id="miniLeafBand" cx="32%" cy="26%" r="85%">
        <stop offset="0%" stopColor="#6bcf6b" />
        <stop offset="100%" stopColor="#1f7a3d" />
      </radialGradient>
      <radialGradient id="miniBlue" cx="35%" cy="30%" r="90%">
        <stop offset="0%" stopColor="#bcd9fb" />
        <stop offset="55%" stopColor="#7fa8e8" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </radialGradient>
      <radialGradient id="miniSkyBlue" cx="32%" cy="26%" r="85%">
        <stop offset="0%" stopColor="#e0f6ff" />
        <stop offset="55%" stopColor="#93d8f7" />
        <stop offset="100%" stopColor="#0369a1" />
      </radialGradient>
      <radialGradient id="miniPurple" cx="32%" cy="26%" r="85%">
        <stop offset="0%" stopColor="#f1e9fb" />
        <stop offset="60%" stopColor="#c9adf0" />
        <stop offset="100%" stopColor="#6d28d9" />
      </radialGradient>
      <radialGradient id="miniYellow" cx="32%" cy="26%" r="85%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="55%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#92400e" />
      </radialGradient>
      <radialGradient id="miniGray" cx="32%" cy="26%" r="85%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="55%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#64748b" />
      </radialGradient>
      <linearGradient id="miniRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
    </defs>
  );
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
            stroke="#5d6bff"
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
  cellType,
}: {
  selected: OrganelleKey | null;
  onSelect: (id: OrganelleKey) => void;
  dogmaRun: number;
  showDogma: boolean;
  ribosomeTarget: Point;
  matureOrangeLength: number;
  aminoAcidCount: number;
  dogmaMode: DogmaPresentationMode;
  cellType: CellType;
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
        <title>{cellType === "plant" ? "Interactive plant cell diagram" : "Interactive animal cell diagram"}</title>
        <desc>
          {cellType === "plant"
            ? "A simplified plant cell diagram with a cell wall, central vacuole, and chloroplasts alongside the shared organelles."
            : "A simplified animal cell diagram with clearly separated and more defined organelles."}
        </desc>

        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodOpacity="0.14" />
          </filter>
          <filter id="organelleShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.16" />
          </filter>
          <filter id="softBlur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          <radialGradient id="cytoplasmGlow" cx="38%" cy="30%" r="85%">
            <stop offset="0%" stopColor="#fbfdff" />
            <stop offset="55%" stopColor="#e6f0fb" />
            <stop offset="100%" stopColor="#c7d9ee" />
          </radialGradient>
          <radialGradient id="membraneGradient" cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#fdfefe" />
            <stop offset="60%" stopColor="#dbe4ee" />
            <stop offset="100%" stopColor="#a9b8c9" />
          </radialGradient>
          <radialGradient id="nucleusGradient" cx="32%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#f3ecff" />
            <stop offset="55%" stopColor="#c9b3f0" />
            <stop offset="100%" stopColor="#8f6cc9" />
          </radialGradient>
          <radialGradient id="nucleolusGradient" cx="32%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#a684e0" />
            <stop offset="100%" stopColor="#5b3a94" />
          </radialGradient>
          <radialGradient id="mitoGradient" cx="32%" cy="26%" r="85%">
            <stop offset="0%" stopColor="#ffd7cc" />
            <stop offset="55%" stopColor="#e8917e" />
            <stop offset="100%" stopColor="#a24a3f" />
          </radialGradient>
          <radialGradient id="golgiGrad1" cx="30%" cy="25%" r="90%">
            <stop offset="0%" stopColor="#ffe3da" />
            <stop offset="100%" stopColor="#e8a894" />
          </radialGradient>
          <radialGradient id="golgiGrad2" cx="30%" cy="25%" r="90%">
            <stop offset="0%" stopColor="#f6c3ae" />
            <stop offset="100%" stopColor="#d67e63" />
          </radialGradient>
          <radialGradient id="golgiGrad3" cx="30%" cy="25%" r="90%">
            <stop offset="0%" stopColor="#e39d84" />
            <stop offset="100%" stopColor="#b85b41" />
          </radialGradient>
          <radialGradient id="chloroplastGradient" cx="32%" cy="26%" r="85%">
            <stop offset="0%" stopColor="#d3ecb0" />
            <stop offset="55%" stopColor="#7fae5c" />
            <stop offset="100%" stopColor="#436b34" />
          </radialGradient>
          <radialGradient id="vacuoleGradient" cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#eef8fd" />
            <stop offset="60%" stopColor="#bfe1f2" />
            <stop offset="100%" stopColor="#82b3d1" />
          </radialGradient>
          <radialGradient id="ribosomeGradient" cx="35%" cy="30%" r="85%">
            <stop offset="0%" stopColor="#7fa8e8" />
            <stop offset="100%" stopColor="#2c4f8f" />
          </radialGradient>
          <radialGradient id="lysosomeGradient" cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="55%" stopColor="#f2879b" />
            <stop offset="100%" stopColor="#9f1239" />
          </radialGradient>
          <linearGradient id="centrioleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#a16207" />
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

        {/* cell wall (plant only): a second boundary just outside the membrane */}
        {cellType === "plant" ? (
          <g {...gClick("cellWall", "Cell wall")}>
            <path
              d="M150 500 C150 275, 325 128, 615 110 C840 96, 1110 122, 1275 235 C1378 306, 1432 396, 1430 500 C1426 632, 1361 752, 1233 834 C1070 940, 817 949, 567 918 C347 890, 205 791, 162 648 C150 607, 145 556, 150 500 Z"
              fill="none"
              stroke="#c2a366"
              strokeWidth="10"
              transform="translate(800 500) scale(1.055) translate(-800 -500)"
              opacity="0.85"
            />
          </g>
        ) : null}

        {/* membrane */}
        <g {...gClick("membrane", "Cell membrane")}>
          <path
            d="M150 500 C150 275, 325 128, 615 110 C840 96, 1110 122, 1275 235 C1378 306, 1432 396, 1430 500 C1426 632, 1361 752, 1233 834 C1070 940, 817 949, 567 918 C347 890, 205 791, 162 648 C150 607, 145 556, 150 500 Z"
            fill="url(#membraneGradient)"
            stroke="#5b6b80"
            strokeWidth="3.5"
            filter="url(#softShadow)"
          />
          <path
            d="M212 502 C212 317, 362 197, 624 180 C830 167, 1071 192, 1216 289 C1303 347, 1360 423, 1360 503 C1356 609, 1300 706, 1185 779 C1038 873, 810 882, 586 855 C390 831, 265 746, 228 625 C216 587, 208 548, 212 502 Z"
            fill="url(#cytoplasmGlow)"
            stroke="#a9bdd4"
            strokeWidth="1.5"
          />
        </g>

        {/* cytoskeleton: microtubules radiating out from near the nucleus (the microtubule-
            organizing center) toward the membrane, plus a thin cortical actin mesh just inside
            it — the texture a real cytosol has that empty space between organelles was missing */}
        <g {...gClick("cytoskeleton", "Cytoskeleton")} opacity="0.5">
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const reach = 0.82 + (i % 3) * 0.06;
            const ax = 540 * reach;
            const ay = 335 * reach;
            const sx = 790 + Math.cos(angle) * 134;
            const sy = 515 + Math.sin(angle) * 134;
            const mx = 790 + Math.cos(angle + 0.12) * ax * 0.55;
            const my = 515 + Math.sin(angle + 0.12) * ay * 0.55;
            const ex = 790 + Math.cos(angle) * ax;
            const ey = 515 + Math.sin(angle) * ay;
            return (
              <path
                key={i}
                d={`M ${sx.toFixed(0)} ${sy.toFixed(0)} Q ${mx.toFixed(0)} ${my.toFixed(0)} ${ex.toFixed(0)} ${ey.toFixed(0)}`}
                fill="none"
                stroke="#64748b"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            );
          })}
          {Array.from({ length: 22 }).map((_, i) => {
            const angle = (i / 22) * Math.PI * 2;
            const cx = 790 + Math.cos(angle) * 555;
            const cy = 515 + Math.sin(angle) * 345;
            const dx = Math.cos(angle + Math.PI / 2) * 16;
            const dy = Math.sin(angle + Math.PI / 2) * 16;
            return <line key={i} x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy} stroke="#94a3b8" strokeWidth="1.6" />;
          })}
        </g>

        {/* nucleus (double envelope, chromatin, pores, nucleolus) — its own clickable group,
            separate from the surrounding membrane it used to be nested inside */}
        <g {...gClick("nucleus", "Nucleus")}>
          <circle cx="790" cy="515" r="124" fill="url(#nucleusGradient)" stroke="#6d4fa8" strokeWidth="2.2" opacity="0.9" filter="url(#organelleShadow)" />
          <circle cx="790" cy="515" r="112" fill="none" stroke="#c5abed" strokeWidth="1.6" opacity="0.75" />
          {/* faint chromatin threads for texture */}
          {([
            "M726 460 C750 445, 780 470, 810 452 C830 440, 850 458, 858 470",
            "M718 500 C748 485, 776 512, 812 498 C838 488, 856 505, 862 512",
            "M724 548 C752 535, 782 558, 818 546 C842 538, 858 552, 866 560",
            "M732 580 C758 570, 786 590, 816 580",
          ] as const).map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#6d4fa8" strokeWidth="2.2" strokeLinecap="round" opacity="0.28" />
          ))}
          {([[790, 391], [860, 412], [906, 466], [912, 535], [878, 594], [816, 631], [747, 632], [690, 597], [666, 534], [673, 465], [718, 411]] as [number, number][]).map(([cx, cy], i) => (
            <circle key={`nuclear-pore-${i}`} cx={cx} cy={cy} r="4.4" fill="#ede4fb" stroke="#6d4fa8" strokeWidth="1.3" opacity="0.9" />
          ))}
          <circle cx="742" cy="574" r="10" fill="#4f7fd6" stroke="#2c4f8f" strokeWidth="1.6" opacity="0.95" />
          <circle cx="736" cy="568" r="3" fill="#cfe0f7" opacity="0.85" />
          <circle cx="790" cy="515" r="28" fill="url(#nucleolusGradient)" opacity="0.95" />
          <circle cx="780" cy="506" r="8" fill="#c9adf0" opacity="0.5" />
        </g>

        {/* central vacuole (plant only) — drawn semi-transparent behind the organelles rendered after it */}
        {cellType === "plant" ? (
          <g {...gClick("vacuole", "Central vacuole")}>
            <ellipse cx="960" cy="680" rx="260" ry="160" fill="url(#vacuoleGradient)" stroke="#4f7fa8" strokeWidth="1.6" opacity="0.5" />
            <ellipse cx="960" cy="680" rx="232" ry="134" fill="none" stroke="#8fbcd9" strokeWidth="1.2" opacity="0.5" />
          </g>
        ) : null}

        {/* chloroplasts (plant only) — a lopsided lens shape instead of a perfect ellipse */}
        {cellType === "plant" ? (
          <g {...gClick("chloroplast", "Chloroplast")}>
            {/* invisible hit-circles, one per scattered chloroplast: the three visible blobs
                sit far apart (corner to corner of the cell), so the group's overall bounding
                box has empty space at its center — clicking there (what a browser's default
                click-target math reaches for) would miss every chloroplast entirely */}
            {([
              { cx: 290, cy: 700, rx: 58, ry: 36, rotate: -18 },
              { cx: 700, cy: 200, rx: 54, ry: 34, rotate: 10 },
              { cx: 1290, cy: 430, rx: 52, ry: 33, rotate: -30 },
            ] as const).map((c, i) => (
              <circle key={`hit-${i}`} cx={c.cx} cy={c.cy} r={Math.max(c.rx, c.ry) + 14} fill="transparent" />
            ))}
            {([
              { cx: 290, cy: 700, rx: 58, ry: 36, rotate: -18 },
              { cx: 700, cy: 200, rx: 54, ry: 34, rotate: 10 },
              { cx: 1290, cy: 430, rx: 52, ry: 33, rotate: -30 },
            ] as const).map((c, i) => {
              const rx = c.rx;
              const ry = c.ry;
              const bean = `M ${-1.02 * rx} 0 C ${-0.92 * rx} ${-0.52 * ry}, ${-0.38 * rx} ${-0.88 * ry}, ${0.18 * rx} ${-0.7 * ry} C ${0.7 * rx} ${-0.5 * ry}, ${1.05 * rx} ${-0.18 * ry}, ${0.95 * rx} ${0.18 * ry} C ${0.82 * rx} ${0.55 * ry}, ${0.32 * rx} ${0.82 * ry}, ${-0.28 * rx} ${0.62 * ry} C ${-0.75 * rx} ${0.48 * ry}, ${-1.05 * rx} ${0.22 * ry}, ${-1.02 * rx} 0 Z`;
              return (
                <g key={i} transform={`translate(${c.cx} ${c.cy}) rotate(${c.rotate})`} filter="url(#organelleShadow)">
                  <path d={bean} fill="url(#chloroplastGradient)" stroke="#2f4a26" strokeWidth="1.4" />
                  {[-c.ry * 0.4, -c.ry * 0.12, c.ry * 0.16, c.ry * 0.42].map((dy, li) => (
                    <path key={li} d={`M ${-c.rx * 0.72} ${dy} Q 0 ${dy + (li % 2 === 0 ? -3 : 3)} ${c.rx * 0.6} ${dy}`} fill="none" stroke="#2f4a26" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
                  ))}
                  <ellipse cx={-c.rx * 0.3} cy={-c.ry * 0.35} rx={c.rx * 0.32} ry={c.ry * 0.28} fill="#eafbd7" opacity="0.35" />
                </g>
              );
            })}
          </g>
        ) : null}

        {/* smooth ER */}
        <g {...gClick("smoothER", "Smooth endoplasmic reticulum")}>
          {/* invisible hit-area: every visible stroke here is fill="none", which SVG only
              treats as clickable exactly on the painted line itself — the open space between
              the wavy strands (where a click naturally lands) would otherwise miss entirely */}
          <ellipse cx="497" cy="381" rx="140" ry="90" fill="transparent" />
          <path d="M385 330 C438 302, 494 298, 542 314 C571 324, 594 341, 608 360" fill="none" stroke="#c99552" strokeWidth="10" strokeLinecap="round" />
          <path d="M372 374 C432 349, 495 347, 550 365 C579 374, 603 390, 618 408" fill="none" stroke="#c99552" strokeWidth="10" strokeLinecap="round" />
          <path d="M396 416 C453 396, 511 397, 562 414 C589 423, 612 437, 625 453" fill="none" stroke="#c99552" strokeWidth="10" strokeLinecap="round" />
          <path d="M432 328 C484 306, 536 306, 581 320" fill="none" stroke="#e6c391" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <path d="M418 373 C477 351, 538 352, 590 368" fill="none" stroke="#e6c391" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <path d="M440 415 C493 399, 548 401, 594 416" fill="none" stroke="#e6c391" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <path d="M437 309 C457 327, 469 348, 473 368 C476 384, 472 400, 460 413" fill="none" stroke="#dba85f" strokeWidth="4" strokeLinecap="round" />
          <path d="M509 312 C529 330, 542 350, 546 370 C549 386, 545 402, 533 414" fill="none" stroke="#dba85f" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* rough ER */}
        <g {...gClick("roughER", "Rough endoplasmic reticulum")}>
          {/* invisible hit-area — same reasoning as smooth ER's, below */}
          <ellipse cx="558" cy="695" rx="180" ry="95" fill="transparent" />
          <path d="M400 640 C462 614, 526 610, 585 624 C630 634, 669 653, 699 676" fill="none" stroke="#3d7fad" strokeWidth="10.5" strokeLinecap="round" />
          <path d="M386 687 C456 663, 530 661, 598 676 C646 687, 686 706, 718 728" fill="none" stroke="#3d7fad" strokeWidth="10.5" strokeLinecap="round" />
          <path d="M414 733 C480 717, 549 717, 613 731 C657 740, 697 756, 728 775" fill="none" stroke="#3d7fad" strokeWidth="10.5" strokeLinecap="round" />
          <path d="M432 641 C486 620, 544 620, 598 633" fill="none" stroke="#a9d3ec" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <path d="M420 688 C480 667, 546 668, 610 682" fill="none" stroke="#a9d3ec" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <path d="M444 732 C500 718, 560 719, 620 734" fill="none" stroke="#a9d3ec" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <path d="M447 621 C466 639, 477 658, 476 676 C474 692, 466 707, 452 720" fill="none" stroke="#a9d3ec" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M520 617 C539 635, 550 655, 549 674 C547 690, 539 705, 525 719" fill="none" stroke="#a9d3ec" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M594 627 C612 645, 623 665, 622 684 C620 700, 612 715, 598 728" fill="none" stroke="#a9d3ec" strokeWidth="3.6" strokeLinecap="round" />
          {([[418, 634], [452, 625], [489, 620], [529, 620], [570, 626], [612, 637], [653, 655], [407, 679], [446, 670], [488, 666], [532, 666], [577, 673], [621, 686], [663, 705], [432, 724], [473, 717], [516, 714], [561, 717], [605, 724], [648, 737], [689, 754]] as [number, number][]).map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3.4" fill="url(#ribosomeGradient)" stroke="#1c2f52" strokeWidth="0.6" />
          ))}
        </g>

        {/* Golgi */}
        <g {...gClick("golgi", "Golgi apparatus")} filter="url(#organelleShadow)">
          <path d="M1050 345 C1094 332, 1144 337, 1178 357 C1169 365, 1156 370, 1138 373 C1110 377, 1079 370, 1050 345 Z" fill="url(#golgiGrad1)" stroke="#8a4a35" strokeWidth="1.6" />
          <path d="M1038 381 C1090 364, 1151 370, 1191 395 C1180 404, 1163 410, 1143 412 C1111 415, 1077 408, 1038 381 Z" fill="url(#golgiGrad1)" stroke="#8a4a35" strokeWidth="1.6" />
          <path d="M1034 422 C1090 407, 1156 414, 1201 442 C1188 451, 1168 458, 1144 459 C1111 462, 1074 454, 1034 422 Z" fill="url(#golgiGrad2)" stroke="#8a4a35" strokeWidth="1.6" />
          <path d="M1042 463 C1095 455, 1151 461, 1188 483 C1176 491, 1158 496, 1137 497 C1108 499, 1077 492, 1042 463 Z" fill="url(#golgiGrad3)" stroke="#7a3f2c" strokeWidth="1.6" />
          <path d="M1066 350 C1097 347, 1128 349, 1155 359" fill="none" stroke="#fce2d4" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M1052 388 C1088 384, 1127 387, 1165 399" fill="none" stroke="#fce2d4" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M1049 428 C1088 424, 1131 427, 1171 442" fill="none" stroke="#fce2d4" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <path d="M1058 468 C1091 466, 1126 468, 1157 480" fill="none" stroke="#fce2d4" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <circle cx="1210" cy="493" r="7" fill="#d97b62" stroke="#8a4a35" strokeWidth="1.4" />
          <circle cx="1190" cy="510" r="5.7" fill="#d97b62" stroke="#8a4a35" strokeWidth="1.4" />
          <circle cx="1168" cy="523" r="4.9" fill="#d97b62" stroke="#8a4a35" strokeWidth="1.4" />
          <circle cx="1194" cy="336" r="5" fill="#e8a894" stroke="#8a4a35" strokeWidth="1.2" />
          <circle cx="1215" cy="356" r="4.3" fill="#e8a894" stroke="#8a4a35" strokeWidth="1.2" />
        </g>

        {/* mitochondrion */}
        <g {...gClick("mitochondrion", "Mitochondrion")} filter="url(#organelleShadow)">
          <path
            d="M1048 655 C1067 624, 1105 606, 1148 610 C1188 614, 1220 638, 1229 672 C1238 705, 1223 739, 1191 756 C1154 775, 1107 773, 1074 752 C1041 732, 1030 693, 1048 655 Z"
            fill="url(#mitoGradient)"
            stroke="#7a3229"
            strokeWidth="2"
          />
          <path
            d="M1063 646 C1081 621, 1111 607, 1148 610 C1181 613, 1208 632, 1216 660 C1225 689, 1211 717, 1184 732 C1153 749, 1114 747, 1086 729 C1058 712, 1048 679, 1063 646 Z"
            fill="none"
            stroke="#7a3229"
            strokeWidth="1.4"
            opacity="0.5"
          />
          <path d="M1064 672 C1081 652, 1095 694, 1113 672 C1129 652, 1145 697, 1165 675 C1181 658, 1195 694, 1210 674" fill="none" stroke="#8a3a30" strokeWidth="3.6" strokeLinecap="round" opacity="0.85" />
          <path d="M1062 703 C1079 684, 1094 722, 1111 702 C1128 682, 1144 725, 1163 705 C1180 687, 1193 721, 1208 703" fill="none" stroke="#8a3a30" strokeWidth="3.6" strokeLinecap="round" opacity="0.85" />
          <path d="M1082 657 C1090 676, 1090 699, 1083 719" fill="none" stroke="#ffe3d8" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
          <path d="M1124 650 C1132 670, 1132 701, 1126 723" fill="none" stroke="#ffe3d8" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
          <path d="M1167 653 C1173 673, 1172 699, 1166 718" fill="none" stroke="#ffe3d8" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
        </g>

        {/* lysosomes (animal only): small acidic digestive vesicles, usually pictured near the
            Golgi that buds them off */}
        {cellType === "animal" ? (
          <g {...gClick("lysosome", "Lysosome")} filter="url(#organelleShadow)">
            {([[1004, 552, 21], [1064, 590, 15], [935, 558, 17]] as const).map(([cx, cy, r], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r={r} fill="url(#lysosomeGradient)" stroke="#881337" strokeWidth="1.8" />
                <circle cx={cx - r * 0.32} cy={cy - r * 0.32} r={r * 0.28} fill="#fecdd3" opacity="0.55" />
                <circle cx={cx + r * 0.2} cy={cy + r * 0.1} r={r * 0.16} fill="#7a0d2c" opacity="0.5" />
              </g>
            ))}
          </g>
        ) : null}

        {/* centrioles (animal only): a perpendicular pair near the nucleus — the microtubule-
            organizing center that builds the mitotic spindle during division */}
        {cellType === "animal" ? (
          <g {...gClick("centriole", "Centriole")} filter="url(#organelleShadow)">
            <g transform="translate(905 345) rotate(-10)">
              <rect x="-6.5" y="-27" width="13" height="54" rx="6.5" fill="url(#centrioleGradient)" stroke="#a16207" strokeWidth="1.6" />
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={i} x1={-5} y1={-22 + i * 8.5} x2={5} y2={-22 + i * 8.5} stroke="#78350f" strokeWidth="1" opacity="0.4" />
              ))}
            </g>
            <g transform="translate(905 345) rotate(80)">
              <rect x="-6.5" y="-27" width="13" height="54" rx="6.5" fill="url(#centrioleGradient)" stroke="#a16207" strokeWidth="1.6" />
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={i} x1={-5} y1={-22 + i * 8.5} x2={5} y2={-22 + i * 8.5} stroke="#78350f" strokeWidth="1" opacity="0.4" />
              ))}
            </g>
          </g>
        ) : null}

        {/* free ribosomes: large + small subunit, like a textbook particle */}
        <g {...gClick("ribosome", "Ribosomes")}>
          {/* invisible hit-circles, one per scattered ribosome: the 9 points span corner to
              corner of the cell, so the group's bounding-box center (where a click naturally
              lands if you're not pixel-precise on one of the tiny ~6px ellipses) is empty
              cytosol far from any actual ribosome */}
          {FREE_RIBOSOME_POINTS.map(({ x, y }, i) => (
            <circle key={`hit-${i}`} cx={x} cy={y} r="13" fill="transparent" />
          ))}
          {FREE_RIBOSOME_POINTS.map(({ x, y }, i) => (
            <g key={i}>
              <ellipse cx={x} cy={y + 1.5} rx="6.4" ry="5.2" fill="url(#ribosomeGradient)" stroke="#1c2f52" strokeWidth="0.8" />
              <ellipse cx={x + 0.5} cy={y - 4} rx="4.6" ry="3.4" fill="#5b82c4" stroke="#1c2f52" strokeWidth="0.7" />
            </g>
          ))}
        </g>

        {/* labels — pointer-events none so a label sitting near an organelle's center (e.g.
            "Central vacuole", anchored at its centroid) never steals the click meant for the
            clickable organelle shape underneath it */}
        <g fontFamily="Arial, sans-serif" fill="#0f172a" style={{ pointerEvents: "none" }}>
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
          <g>
            <text x="300" y="895" textAnchor="middle" fontWeight="700" fontSize="16" fill="#475569" opacity="0.85">Cytoskeleton</text>
          </g>
          {cellType === "animal" ? (
            <>
              <g>
                <text x="1004" y="618" textAnchor="middle" fontWeight="700" fontSize="18" fill="#9f1239">Lysosomes</text>
              </g>
              <g>
                <text x="905" y="288" textAnchor="middle" fontWeight="700" fontSize="18" fill="#a16207">Centrioles</text>
              </g>
            </>
          ) : null}
          {cellType === "plant" ? (
            <>
              <g>
                <text x="790" y="70" textAnchor="middle" fontWeight="700" fontSize="20" fill="#854d0e">Cell wall</text>
              </g>
              <g>
                <text x="960" y="680" textAnchor="middle" fontWeight="700" fontSize="20" fill="#1d4ed8">Central vacuole</text>
              </g>
              <g>
                <text x="290" y="758" textAnchor="middle" fontWeight="700" fontSize="16" fill="#166534">Chloroplast</text>
              </g>
            </>
          ) : null}
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
        <MiniSimDefs />
        <rect x="20" y="20" width="660" height="200" rx="24" fill="#eef4fb" stroke="#c7d5e6" strokeWidth="1.5" />
        <circle cx="350" cy="120" r="92" fill="url(#miniPurple)" stroke="#6d28d9" strokeWidth="3" filter="url(#miniShadow)" />
        <circle cx="350" cy="120" r="80" fill="none" stroke="#e6d9fa" strokeWidth="1.4" opacity="0.7" />
        <path d="M240 96 C290 70, 330 70, 380 96 C420 118, 460 118, 500 96" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
        <path d="M240 145 C290 119, 330 119, 380 145 C420 167, 460 167, 500 145" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx={state.x} cy="120" rx="22" ry="16" fill="url(#miniBlue)" stroke="#1d4ed8" strokeWidth="2" filter="url(#miniShadow)" style={{ transition: "all .25s ease" }} />
        <path d={`M260 182 C ${280 + state.w / 2} 198, ${320 + state.w / 1.3} 198, ${350 + state.w} 182`} fill="none" stroke="url(#miniPink)" strokeWidth="6" strokeLinecap="round" style={{ transition: "all .25s ease" }} />
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
        <MiniSimDefs />
        <rect x="20" y="20" width="660" height="200" rx="24" fill="#eef4fb" stroke="#c7d5e6" strokeWidth="1.5" />
        <rect x="130" y="150" width="460" height="12" rx="6" fill="url(#miniPink)" filter="url(#miniShadow)" />
        <ellipse cx="360" cy="112" rx="150" ry="46" fill="url(#miniSkyBlue)" stroke="#0369a1" strokeWidth="3" filter="url(#miniShadow)" />
        <ellipse cx="360" cy="88" rx="108" ry="24" fill="url(#miniBlue)" stroke="#1d4ed8" strokeWidth="2.4" opacity="0.92" />
        <g style={{ transform: `translateX(${state.x - 260}px)`, transition: "transform .25s ease" }}>
          <path d="M260 186 C255 169, 271 159, 281 172 C288 182, 284 193, 274 201" fill="none" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
          <circle cx="274" cy="166" r="10" fill="url(#miniBlue)" stroke="#1d4ed8" strokeWidth="2.5" filter="url(#miniShadow)" />
        </g>
        {new Array(state.aa).fill(0).map((_, i) => (
          <circle key={i} cx={425 + i * 24} cy={76 - i * 6} r="8.5" fill="url(#miniYellow)" stroke="#92400e" strokeWidth="1.8" filter="url(#miniShadow)" style={{ transition: "all .25s ease" }} />
        ))}
        <text x="360" y="222" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0369a1">mRNA feeds through the ribosome; amino acids join into a chain</text>
      </svg>
    </div>
  );
}

function GenericMiniSim({ organelle, stepIndex }: { organelle: OrganelleInfo; stepIndex: number }) {
  return (
    <div style={cardStyle()}>
      <svg viewBox="0 0 700 220" style={{ width: "100%", height: "auto" }}>
        <MiniSimDefs />
        <rect x="70" y="35" width="560" height="150" rx="26" fill="url(#miniGray)" opacity="0.25" stroke={organelle.stroke} strokeWidth="3" />
        <line x1="120" y1="110" x2="580" y2="110" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
        {Array.from({ length: 4 }).map((_, i) => (
          <circle key={i} cx={160 + i * 120} cy="110" r={i === stepIndex ? 8 : 5} fill="#fff" stroke="#94a3b8" strokeWidth="2" opacity={i <= stepIndex ? 1 : 0.4} />
        ))}
        <circle
          cx={160 + stepIndex * 120}
          cy="110"
          r="20"
          fill={organelle.fill}
          stroke={organelle.stroke}
          strokeWidth="3.5"
          filter="url(#miniShadow)"
          style={{ transition: "all .3s ease" }}
        />
        <circle
          cx={160 + stepIndex * 120 - 6}
          cy="104"
          r="6"
          fill="#ffffff"
          opacity="0.4"
          style={{ transition: "all .3s ease" }}
        />
      </svg>
    </div>
  );
}

function MitochondrionMiniSim({ stepIndex }: { stepIndex: number }) {
  const step = Math.min(stepIndex, 3);
  const fuelOpacity = step === 0 ? 1 : 0;
  const electronOpacity = step >= 1 ? 1 : 0;
  const electronX = step === 1 ? 470 : 320;
  const turbineOn = step >= 2;
  const atpOpacity = step === 3 ? 1 : 0;

  return (
    <div style={cardStyle()}>
      <svg viewBox="0 0 700 240" style={{ width: "100%", height: "auto" }}>
        <MiniSimDefs />
        <rect x="20" y="20" width="660" height="200" rx="24" fill="#fff6f0" stroke="#f0ddd0" strokeWidth="1.5" />
        <path d="M80 60 C50 90, 50 150, 80 180 C160 210, 480 210, 590 180 C625 150, 625 90, 590 60 C480 30, 160 30, 80 60 Z" fill="url(#miniOrange)" stroke="#7a3229" strokeWidth="2.5" filter="url(#miniShadow)" />
        <path d="M96 62 C70 90, 70 150, 96 178 C170 204, 470 204, 574 178 C606 150, 606 90, 574 62 C470 36, 170 36, 96 62 Z" fill="none" stroke="#7a3229" strokeWidth="1.2" opacity="0.5" />
        <path d="M150 70 C170 110, 170 130, 150 170" fill="none" stroke="#ffe3d8" strokeWidth="9" strokeLinecap="round" opacity="0.9" />
        <path d="M230 60 C250 110, 250 130, 230 180" fill="none" stroke="#ffe3d8" strokeWidth="9" strokeLinecap="round" opacity="0.9" />
        {[330, 390, 450].map((x, i) => (
          <rect
            key={i}
            x={x}
            y="102"
            width="26"
            height="36"
            rx="6"
            fill={step >= 1 ? "url(#miniYellow)" : "#fda4af"}
            stroke="#9a3412"
            strokeWidth="2"
            filter="url(#miniShadow)"
            style={{ transition: "fill .3s ease" }}
          />
        ))}
        <g style={{ opacity: fuelOpacity, transition: "opacity .25s ease" }}>
          <circle cx="220" cy="120" r="16" fill="url(#miniYellow)" stroke="#92400e" strokeWidth="2.5" filter="url(#miniShadow)" />
          <text x="220" y="124" fontSize="10" fontWeight="700" textAnchor="middle" fill="#78350f">NADH</text>
        </g>
        <g style={{ opacity: electronOpacity, transition: "opacity .25s ease" }}>
          <circle cx={electronX} cy="108" r="6.5" fill="#fde047" stroke="#a16207" strokeWidth="1.2" style={{ transition: "cx .6s ease" }} />
        </g>
        <g transform="translate(545 120)">
          <circle r="30" fill="url(#miniPink)" stroke="#be123c" strokeWidth="2.5" filter="url(#miniShadow)" />
          <g
            style={{
              transformOrigin: "0px 0px",
              transform: turbineOn ? "rotate(140deg)" : "rotate(0deg)",
              transition: "transform .7s ease",
            }}
          >
            <line x1="0" y1="-21" x2="0" y2="21" stroke="#9a3412" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="-21" y1="0" x2="21" y2="0" stroke="#9a3412" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        </g>
        <g style={{ opacity: atpOpacity, transition: "opacity .3s ease" }}>
          <circle cx="630" cy="120" r="18" fill="url(#miniGreen)" stroke="#166534" strokeWidth="2.5" filter="url(#miniShadow)" />
          <text x="630" y="124" fontSize="9" fontWeight="700" textAnchor="middle" fill="#052e16">ATP</text>
        </g>
      </svg>
    </div>
  );
}

function ChloroplastMiniSim({ stepIndex }: { stepIndex: number }) {
  const step = Math.min(stepIndex, 3);
  const photonOpacity = step === 0 ? 1 : 0;
  const productsOpacity = step >= 1 ? 1 : 0;
  const calvinOpacity = step >= 2 ? 1 : 0;
  const glucoseOpacity = step === 3 ? 1 : 0;

  return (
    <div style={cardStyle()}>
      <svg viewBox="0 0 700 240" style={{ width: "100%", height: "auto" }}>
        <MiniSimDefs />
        <path d="M90 46 C50 76, 50 164, 90 194 C180 224, 520 224, 610 194 C650 164, 650 76, 610 46 C520 16, 180 16, 90 46 Z" fill="url(#miniGreen)" stroke="#2f4a26" strokeWidth="2.5" filter="url(#miniShadow)" />
        <path d="M104 52 C68 80, 68 160, 104 188 C186 214, 514 214, 596 188 C630 160, 630 80, 596 52 C514 26, 186 26, 104 52 Z" fill="none" stroke="#2f4a26" strokeWidth="1.2" opacity="0.4" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <ellipse cx="160" cy={84 + i * 26} rx="55" ry="14" fill="url(#miniLeafBand)" stroke="#166534" strokeWidth="2" filter="url(#miniShadow)" />
            <ellipse cx="148" cy={80 + i * 26} rx="20" ry="5" fill="#eafbd7" opacity="0.4" />
          </g>
        ))}
        <text x="160" y="205" fontSize="12" fontWeight="700" textAnchor="middle" fill="#14532d">Thylakoid</text>
        <text x="470" y="205" fontSize="12" fontWeight="700" textAnchor="middle" fill="#14532d">Stroma</text>

        <g style={{ opacity: photonOpacity, transition: "opacity .25s ease" }}>
          <line x1="55" y1="45" x2="90" y2="70" stroke="#fde047" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="95" cy="72" r="8" fill="#fef3c7" stroke="#a16207" strokeWidth="2" />
        </g>

        <g style={{ opacity: productsOpacity, transition: "opacity .3s ease" }}>
          <circle cx="270" cy="70" r="15" fill="url(#miniGreen)" stroke="#166534" strokeWidth="2" filter="url(#miniShadow)" />
          <text x="270" y="74" fontSize="9" fontWeight="700" textAnchor="middle" fill="#052e16">ATP</text>
          <circle cx="270" cy="135" r="17" fill="url(#miniBlue)" stroke="#1d4ed8" strokeWidth="2" filter="url(#miniShadow)" />
          <text x="270" y="139" fontSize="7.5" fontWeight="700" textAnchor="middle" fill="#eff6ff">NADPH</text>
        </g>

        <g style={{ opacity: calvinOpacity, transition: "opacity .3s ease" }}>
          <circle cx="420" cy="175" r="15" fill="url(#miniGray)" stroke="#475569" strokeWidth="2" filter="url(#miniShadow)" />
          <text x="420" y="179" fontSize="8" fontWeight="700" textAnchor="middle" fill="#0f172a">CO2</text>
          <path d="M470 95 a38 38 0 1 1 -1 0" fill="none" stroke="#166534" strokeWidth="4" strokeDasharray="6 5" />
        </g>

        <g style={{ opacity: glucoseOpacity, transition: "opacity .3s ease" }}>
          <circle cx="620" cy="120" r="19" fill="url(#miniLeafBand)" stroke="#3f6212" strokeWidth="2.5" filter="url(#miniShadow)" />
          <text x="620" y="124" fontSize="7.5" fontWeight="700" textAnchor="middle" fill="#1a2e05">C6H12O6</text>
        </g>
      </svg>
    </div>
  );
}

function GolgiMiniSim({ stepIndex }: { stepIndex: number }) {
  const step = Math.min(stepIndex, 3);
  const cargoX = [110, 260, 400, 570][step];
  const cargoY = 70 + step * 30;
  const cargoColor = step === 0 ? "#93c5fd" : step === 1 ? "#f9a8d4" : "#fb7185";

  return (
    <div style={cardStyle()}>
      <svg viewBox="0 0 700 240" style={{ width: "100%", height: "auto" }}>
        <MiniSimDefs />
        <rect x="20" y="20" width="660" height="200" rx="24" fill="#fff5f0" stroke="#f0d9cc" strokeWidth="1.5" />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M150 ${70 + i * 30} C300 ${50 + i * 30}, 450 ${50 + i * 30}, 560 ${70 + i * 30}`}
            fill="none"
            stroke="url(#miniOrange)"
            strokeWidth="11"
            strokeLinecap="round"
            opacity={0.95 - i * 0.08}
            filter="url(#miniShadow)"
          />
        ))}
        <circle cx={cargoX} cy={cargoY} r="15" fill={cargoColor} stroke="#9d174d" strokeWidth="2.5" filter="url(#miniShadow)" style={{ transition: "cx .35s ease, cy .35s ease, fill .3s ease" }} />
        <circle cx={cargoX - 4} cy={cargoY - 4} r="4.5" fill="#fff" opacity="0.5" style={{ transition: "cx .35s ease, cy .35s ease" }} />
        <text x="120" y="225" fontSize="13" fontWeight="700" fill="#9d174d">cis face</text>
        <text x="580" y="225" fontSize="13" fontWeight="700" textAnchor="end" fill="#9d174d">trans face</text>
      </svg>
    </div>
  );
}

function RoughERMiniSim({ stepIndex }: { stepIndex: number }) {
  const step = Math.min(stepIndex, 3);
  const proteinRadius = step >= 1 ? 20 : 8;
  const proteinY = step >= 1 ? 205 : 188;
  const vesicleOpacity = step === 3 ? 1 : 0;

  return (
    <div style={cardStyle()}>
      <svg viewBox="0 0 700 240" style={{ width: "100%", height: "auto" }}>
        <MiniSimDefs />
        <rect x="20" y="20" width="660" height="200" rx="24" fill="#eef7fc" stroke="#c9e1ef" strokeWidth="1.5" />
        <path d="M100 150 C160 120, 220 120, 280 150 C340 120, 400 120, 460 150 C520 120, 560 120, 600 150" fill="none" stroke="url(#miniSkyBlue)" strokeWidth="11" strokeLinecap="round" filter="url(#miniShadow)" />
        {[130, 170, 250, 310, 390, 430, 510, 550].map((x, i) => (
          <circle key={i} cx={x} cy={i % 2 === 0 ? 134 : 128} r="4" fill="url(#miniBlue)" stroke="#1c2f52" strokeWidth="0.7" opacity={0.85} />
        ))}
        <circle cx="220" cy="118" r="10" fill="url(#miniBlue)" stroke="#1c2f52" strokeWidth="1.4" filter="url(#miniShadow)" />
        <line x1="220" y1="128" x2="220" y2="188" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
        <circle cx="220" cy={proteinY} r={proteinRadius} fill="url(#miniSkyBlue)" stroke="#075985" strokeWidth="2.5" filter="url(#miniShadow)" style={{ transition: "all .3s ease" }} />
        {step >= 2 ? <path d="M206 205 l9 9 l18 -18" fill="none" stroke="#166534" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /> : null}
        <g style={{ opacity: vesicleOpacity, transition: "opacity .3s ease" }}>
          <circle cx="480" cy="190" r="20" fill="url(#miniSkyBlue)" stroke="#0369a1" strokeWidth="2.5" filter="url(#miniShadow)" />
          <circle cx="474" cy="184" r="6" fill="#e0f2fe" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}

function LysosomeMiniSim({ stepIndex }: { stepIndex: number }) {
  const step = Math.min(stepIndex, 3);
  const cargoScale = [1, 1, 0.55, 0.2][step];
  const fragmentsOpacity = step === 3 ? 1 : 0;

  return (
    <div style={cardStyle()}>
      <svg viewBox="0 0 700 240" style={{ width: "100%", height: "auto" }}>
        <MiniSimDefs />
        <rect x="20" y="20" width="660" height="200" rx="24" fill="#fff5f6" stroke="#f3d6dc" strokeWidth="1.5" />
        <circle cx="330" cy="120" r="100" fill={step >= 1 ? "url(#miniPink)" : "#fecdd3"} stroke="#881337" strokeWidth="3" filter="url(#miniShadow)" style={{ transition: "fill .3s ease" }} />
        <circle cx="330" cy="120" r="86" fill="none" stroke="#fecdd3" strokeWidth="1.4" opacity="0.6" />
        {step === 0 ? <circle cx="150" cy="120" r="22" fill="url(#miniGray)" stroke="#475569" strokeWidth="2.5" filter="url(#miniShadow)" /> : null}
        <g style={{ transform: `scale(${cargoScale})`, transformOrigin: "330px 120px", transition: "transform .3s ease" }}>
          <circle cx="330" cy="120" r="40" fill="url(#miniGray)" stroke="#475569" strokeWidth="2.5" filter="url(#miniShadow)" />
        </g>
        <g style={{ opacity: fragmentsOpacity, transition: "opacity .3s ease" }}>
          {([[280, 90], [300, 150], [360, 95], [375, 145]] as const).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="7" fill="url(#miniGray)" stroke="#475569" strokeWidth="1.6" />
          ))}
        </g>
      </svg>
    </div>
  );
}

const CUSTOM_MINI_SIMS: Partial<Record<OrganelleKey, (props: { stepIndex: number }) => React.JSX.Element>> = {
  nucleus: NucleusMiniSim,
  ribosomes: RibosomeMiniSim,
  mitochondrion: MitochondrionMiniSim,
  chloroplast: ChloroplastMiniSim,
  golgi: GolgiMiniSim,
  roughER: RoughERMiniSim,
  lysosome: LysosomeMiniSim,
};

function DetailPanel({ selected, onBack }: { selected: OrganelleKey; onBack: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const info = ORGANELLES[selected];
  const max = info.steps.length - 1;
  const CustomMiniSim = CUSTOM_MINI_SIMS[selected];

  return (
    <div style={{ display: "grid", gap: 14 }} className="fade-in-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-serif)" }}>
          {info.name}
        </h2>
        <button onClick={onBack} style={{ border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 14, color: "var(--ink)", cursor: "pointer" }}>
          ← Back to cell
        </button>
      </div>

      {CustomMiniSim ? <CustomMiniSim stepIndex={stepIndex} /> : <GenericMiniSim organelle={info} stepIndex={Math.min(stepIndex, 3)} />}

      <p
        className="fade-in-up"
        key={stepIndex}
        style={{
          margin: 0,
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid var(--border)",
          borderLeft: `4px solid ${info.stroke}`,
          background: "var(--surface-muted)",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--ink)",
        }}
      >
        Step {stepIndex + 1} of {info.steps.length}: {info.steps[stepIndex]}
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {info.steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setStepIndex(index)}
            style={{
              borderRadius: 999,
              width: 34,
              height: 34,
              border: stepIndex === index ? "1px solid var(--brand)" : "1px solid var(--border)",
              background: stepIndex === index ? "var(--brand-soft)" : "var(--surface)",
              color: stepIndex === index ? "var(--brand-dark)" : "var(--ink)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {index + 1}
          </button>
        ))}

        <button onClick={() => setStepIndex((s) => Math.min(s + 1, max))} style={{ border: "1px solid var(--brand)", background: "var(--brand-soft)", color: "var(--brand-dark)", borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Next
        </button>
        <button onClick={() => setStepIndex(0)} style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default function CompleteCellSimulationPage() {
  const [cellType, setCellType] = useState<CellType>("animal");
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

  const handleCellTypeChange = (type: CellType) => {
    if (type === cellType) return;
    stopCentralDogma();
    setSelected(null);
    setCellType(type);
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
    <main className="grid gap-6" style={{ color: "var(--ink)" }}>
      <style>{`
        .fade-in-up {
          animation: fadeInUp 240ms ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <PageHeader
        eyebrow="Unit 2 · Cells"
        align="start"
        title="Interactive cell model"
        description="Toggle between an animal and plant cell, click any organelle to see what it actually does, or run the central dogma overlay end to end."
      />

      <SectionCard
        title={selected ? ORGANELLES[selected].name : "Interactive cell model"}
        description={
          selected
            ? "Use the back button below to return to the full cell map."
            : "Switch between animal and plant cells, click any organelle to inspect its role, or run the central dogma overlay to watch transcription through translation happen in sequence."
        }
      >
        <div className="grid gap-4">
          <div
            className="flex flex-col items-start gap-3 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
            aria-label="Simulation controls"
          >
            <div
              className="inline-flex shrink-0 rounded-full border-2 border-[color:var(--border)] bg-[color:var(--surface)] p-1"
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
                  onClick={() => handleCellTypeChange(option.type)}
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

            <button
              type="button"
              onClick={replayCentralDogma}
              style={{
                border: "1px solid var(--brand)",
                background: "var(--brand)",
                color: "#ffffff",
                borderRadius: 8,
                padding: "10px 16px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Run central dogma overlay
            </button>

            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 500, fontSize: 14, color: "var(--ink-muted)", cursor: "pointer", flexWrap: "wrap" }}>
              <input
                type="checkbox"
                checked={dogmaMode === "guided"}
                onChange={(event) => setDogmaMode(event.target.checked ? "guided" : "plain")}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--brand)" }}
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
              cellType={cellType}
            />
          ) : (
            <DetailPanel selected={selected} onBack={handleBackToCell} />
          )}
        </div>
      </SectionCard>
    </main>
  );
}
