"use client";

import React, { useMemo, useState } from "react";

type Category = { name: string; observed: number };
type HardyWeinbergMode = "p" | "q2";

type SampleSummary = {
  values: number[];
  n: number;
  mean: number;
  sd: number;
  sem: number;
  ciHalf: number;
  ciLow: number;
  ciHigh: number;
};

type SectionShellProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
};

const PAGE_BG = "#f3f5f4";
const CARD_BG = "#ffffff";
const MUTED_BG = "#eef1ef";
const BORDER = "#d6dde2";
const TEXT = "#334155";
const HEADING = "#0f172a";
const SUBTLE = "#64748b";
const SKY = "#5d6bff";
const SKY_DARK = "#5b46d8";
const AMBER = "#64748b";
const AMBER_DARK = "#334155";
const EMERALD = "#6d5efc";
const EMERALD_DARK = "#5b46d8";
const ROSE = "#94a3b8";
const ROSE_DARK = "#334155";
const MATH_FONT = '"Cambria Math", "Times New Roman", serif';

const CRITICAL_VALUES = [
  { df: 1, a10: 2.706, a05: 3.841, a01: 6.635 },
  { df: 2, a10: 4.605, a05: 5.991, a01: 9.21 },
  { df: 3, a10: 6.251, a05: 7.815, a01: 11.345 },
  { df: 4, a10: 7.779, a05: 9.488, a01: 13.277 },
  { df: 5, a10: 9.236, a05: 11.07, a01: 15.086 },
  { df: 6, a10: 10.645, a05: 12.592, a01: 16.812 },
  { df: 7, a10: 12.017, a05: 14.067, a01: 18.475 },
  { df: 8, a10: 13.362, a05: 15.507, a01: 20.09 },
];

function logGamma(z: number): number {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ];

  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }

  let shifted = z - 1;
  let total = 0.9999999999998099;
  for (let index = 0; index < coefficients.length; index += 1) {
    total += coefficients[index] / (shifted + index + 1);
  }

  const t = shifted + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(t) - t + Math.log(total);
}

function gammaP(s: number, x: number): number {
  const epsilon = 1e-12;
  const maxIterations = 200;

  if (x <= 0) return 0;

  if (x < s + 1) {
    let sum = 1 / s;
    let delta = sum;
    let ap = s;

    for (let n = 1; n <= maxIterations; n += 1) {
      ap += 1;
      delta *= x / ap;
      sum += delta;
      if (Math.abs(delta) < Math.abs(sum) * epsilon) break;
    }

    const result = sum * Math.exp(-x + s * Math.log(x) - logGamma(s));
    return Math.min(1, Math.max(0, result));
  }

  let b = x + 1 - s;
  let c = 1 / 1e-30;
  let d = 1 / b;
  let h = d;

  for (let index = 1; index <= maxIterations; index += 1) {
    const an = -index * (index - s);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < epsilon) break;
  }

  const q = Math.exp(-x + s * Math.log(x) - logGamma(s)) * h;
  return Math.min(1, Math.max(0, 1 - q));
}

function chiSquareCdf(x: number, degreesOfFreedom: number) {
  return gammaP(degreesOfFreedom / 2, x / 2);
}

function parseRatio(raw: string): number[] | null {
  const cleaned = raw.trim().replace(/,/g, ":");
  const pieces = cleaned
    .split(":")
    .map((piece) => piece.trim())
    .filter(Boolean)
    .map(Number);

  if (pieces.length < 2) return null;
  if (pieces.some((value) => !Number.isFinite(value) || value <= 0)) return null;
  return pieces;
}

function parseNumberList(raw: string) {
  return raw
    .split(/[\n,]+/)
    .map((piece) => Number(piece.trim()))
    .filter((value) => Number.isFinite(value));
}

function formatNumber(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "--";
  return value.toFixed(digits);
}

function summarizeSamples(values: number[]): SampleSummary | null {
  if (values.length === 0) return null;

  const n = values.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const variance =
    n > 1
      ? values.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) / (n - 1)
      : 0;
  const sd = Math.sqrt(Math.max(0, variance));
  const sem = n > 0 ? sd / Math.sqrt(n) : 0;
  const ciHalf = 1.96 * sem;

  return {
    values,
    n,
    mean,
    sd,
    sem,
    ciHalf,
    ciLow: mean - ciHalf,
    ciHigh: mean + ciHalf,
  };
}

function sectionStyle() {
  return {
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: 26,
    padding: 18,
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
    scrollMarginTop: 86,
  } as const;
}

function panelStyle(background = MUTED_BG) {
  return {
    background,
    border: `1px solid ${BORDER}`,
    borderRadius: 18,
    padding: 14,
  } as const;
}

function inputStyle() {
  return {
    width: "100%",
    padding: 10,
    borderRadius: 12,
    border: `1px solid ${BORDER}`,
    background: "white",
    color: HEADING,
  } as const;
}

function textareaStyle() {
  return {
    ...inputStyle(),
    minHeight: 104,
    resize: "vertical" as const,
    lineHeight: 1.45,
  };
}

function anchorPillStyle() {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    border: `1px solid ${BORDER}`,
    background: "rgba(255,255,255,0.86)",
    color: HEADING,
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  } as const;
}

function badgeStyle(background: string, color: string) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    flexWrap: "wrap",
    padding: "6px 10px",
    borderRadius: 999,
    background,
    color,
    fontWeight: 800,
    fontSize: 13,
    lineHeight: 1.2,
  } as const;
}

function metricValueStyle(fontSize: number) {
  return {
    marginTop: 8,
    fontSize: `clamp(0.95rem, 1.7vw, ${fontSize}px)`,
    fontWeight: 900,
    color: HEADING,
    lineHeight: 1.05,
    whiteSpace: "nowrap" as const,
    textAlign: "center" as const,
    width: "100%",
    minWidth: 0,
  } as const;
}

function metricLabelStyle() {
  return {
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: SUBTLE,
    whiteSpace: "nowrap" as const,
    textAlign: "center" as const,
    width: "100%",
    minWidth: 0,
  } as const;
}

function MathText({ children, color = "currentColor" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        fontFamily: MATH_FONT,
        fontWeight: 700,
        color,
      }}
    >
      {children}
    </span>
  );
}

function MathSup({ children }: { children: React.ReactNode }) {
  return <sup style={{ fontSize: "0.7em" }}>{children}</sup>;
}

function MathSub({ children }: { children: React.ReactNode }) {
  return <sub style={{ fontSize: "0.7em" }}>{children}</sub>;
}

function MathFraction({
  numerator,
  denominator,
  color = "currentColor",
  compact = false,
}: {
  numerator: React.ReactNode;
  denominator: React.ReactNode;
  color?: string;
  compact?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: compact ? 1.05 : 1.1,
        whiteSpace: "nowrap",
        fontFamily: MATH_FONT,
        fontWeight: 700,
        color,
        verticalAlign: "middle",
      }}
    >
      <span style={{ padding: compact ? "0 4px" : "0 6px" }}>{numerator}</span>
      <span style={{ width: "100%", borderTop: `${compact ? 1 : 2}px solid ${color}`, margin: compact ? "1px 0" : "2px 0" }} />
      <span style={{ padding: compact ? "0 4px" : "0 6px" }}>{denominator}</span>
    </span>
  );
}

function SectionShell({ id, eyebrow, title, description, children }: SectionShellProps) {
  return (
    <section id={id} style={sectionStyle()}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: SKY_DARK }}>{eyebrow}</p>
      <h2 style={{ marginTop: 8, marginBottom: 6, fontSize: 28, fontWeight: 900, color: HEADING }}>{title}</h2>
      <p style={{ margin: 0, maxWidth: 780, color: TEXT, lineHeight: 1.55 }}>{description}</p>
      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}

function ChiSquareBarRow({
  label,
  observed,
  expected,
  maxValue,
}: {
  label: string;
  observed: number;
  expected: number;
  maxValue: number;
}) {
  const observedWidth = `${Math.max(6, (observed / maxValue) * 100)}%`;
  const expectedWidth = `${Math.max(6, (expected / maxValue) * 100)}%`;

  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: HEADING, fontWeight: 800 }}>
        <span>{label}</span>
        <span>Observed {observed} vs Expected {formatNumber(expected, 2)}</span>
      </div>
      <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4, color: SUBTLE, fontSize: 13 }}>
            <span>Observed</span>
            <span>{observed}</span>
          </div>
          <div style={{ height: 12, borderRadius: 999, overflow: "hidden", background: "#e2e8f0" }}>
            <div style={{ width: observedWidth, height: "100%", borderRadius: 999, background: "#475569" }} />
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4, color: SUBTLE, fontSize: 13 }}>
            <span>Expected</span>
            <span>{formatNumber(expected, 2)}</span>
          </div>
          <div style={{ height: 12, borderRadius: 999, overflow: "hidden", background: "#e5e7eb" }}>
            <div style={{ width: expectedWidth, height: "100%", borderRadius: 999, background: EMERALD }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfidenceBarRow({
  label,
  color,
  summary,
  scaleMin,
  scaleSpan,
}: {
  label: string;
  color: string;
  summary: SampleSummary;
  scaleMin: number;
  scaleSpan: number;
}) {
  const left = ((summary.ciLow - scaleMin) / scaleSpan) * 100;
  const right = ((summary.ciHigh - scaleMin) / scaleSpan) * 100;
  const mean = ((summary.mean - scaleMin) / scaleSpan) * 100;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: HEADING, fontWeight: 800 }}>
        <span>{label}</span>
        <span>
          mean {formatNumber(summary.mean, 2)}; 95% CI {formatNumber(summary.ciLow, 2)} to {formatNumber(summary.ciHigh, 2)}
        </span>
      </div>
      <div style={{ position: "relative", height: 18, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: `${left}%`,
            width: `${Math.max(2, right - left)}%`,
            top: 8,
            height: 2,
            background: color,
          }}
        />
        <div style={{ position: "absolute", left: `${left}%`, top: 4, width: 2, height: 10, transform: "translateX(-50%)", background: color }} />
        <div style={{ position: "absolute", left: `${right}%`, top: 4, width: 2, height: 10, transform: "translateX(-50%)", background: color }} />
        <div
          style={{
            position: "absolute",
            left: `${mean}%`,
            top: 3,
            width: 12,
            height: 12,
            borderRadius: 999,
            transform: "translateX(-50%)",
            background: color,
            boxShadow: "0 0 0 3px rgba(255,255,255,0.92)",
          }}
        />
      </div>
    </div>
  );
}

export default function QuantitativeCenter() {
  const [categories, setCategories] = useState<Category[]>([
    { name: "Purple", observed: 72 },
    { name: "White", observed: 28 },
  ]);
  const [ratio, setRatio] = useState("3:1");
  const [alpha, setAlpha] = useState(0.05);

  const [hardyMode, setHardyMode] = useState<HardyWeinbergMode>("q2");
  const [hardyPopulation, setHardyPopulation] = useState(200);
  const [hardyP, setHardyP] = useState(0.7);
  const [hardyQSquared, setHardyQSquared] = useState(0.16);

  const [waterI, setWaterI] = useState(1);
  const [waterC, setWaterC] = useState(0.3);
  const [waterTempC, setWaterTempC] = useState(25);
  const [waterPressure, setWaterPressure] = useState(0.7);
  const [outsideWaterPotential, setOutsideWaterPotential] = useState(-4.8);

  const [surfaceSizes, setSurfaceSizes] = useState("1, 2, 4, 8");

  const [x1, setX1] = useState(0);
  const [y1, setY1] = useState(2);
  const [x2, setX2] = useState(8);
  const [y2, setY2] = useState(10);
  const [xUnits, setXUnits] = useState("minutes");
  const [yUnits, setYUnits] = useState("mL oxygen");

  const [standardDeviationInput, setStandardDeviationInput] = useState("12, 15, 13, 17, 14");

  const [sampleAInput, setSampleAInput] = useState("8.1, 8.4, 7.9, 8.3, 8.2");
  const [sampleBInput, setSampleBInput] = useState("7.2, 7.5, 7.4, 7.6, 7.3");

  const [plainPValue, setPlainPValue] = useState(0.032);
  const [plainAlpha, setPlainAlpha] = useState(0.05);

  const totalObserved = useMemo(
    () => categories.reduce((sum, category) => sum + (Number.isFinite(category.observed) ? category.observed : 0), 0),
    [categories],
  );

  const expectedCounts = useMemo(() => {
    const parsedRatio = parseRatio(ratio);
    if (!parsedRatio) return null;
    if (parsedRatio.length !== categories.length) return null;
    const totalRatio = parsedRatio.reduce((sum, value) => sum + value, 0);
    return parsedRatio.map((value) => (value / totalRatio) * totalObserved);
  }, [categories.length, ratio, totalObserved]);

  const chiSquareStats = useMemo(() => {
    if (!expectedCounts) return null;

    const contributions = categories.map((category, index) => {
      const observed = category.observed;
      const expected = expectedCounts[index];
      const contribution = expected > 0 ? ((observed - expected) * (observed - expected)) / expected : 0;
      return {
        name: category.name,
        observed,
        expected,
        contribution,
      };
    });

    const chiSquare = contributions.reduce((sum, row) => sum + row.contribution, 0);
    const degreesOfFreedom = Math.max(1, categories.length - 1);
    const pValue = 1 - chiSquareCdf(chiSquare, degreesOfFreedom);

    return { contributions, chiSquare, degreesOfFreedom, pValue };
  }, [categories, expectedCounts]);

  const expectedWarning = useMemo(() => {
    if (!expectedCounts) return null;
    if (!expectedCounts.some((value) => value < 5)) return null;
    return "Some expected counts are below 5, so chi-square becomes less reliable. On the AP exam, that usually means you should be cautious about the conclusion or combine categories when appropriate.";
  }, [expectedCounts]);

  const chiSquareDecision = useMemo(() => {
    if (!chiSquareStats) return null;
    if (chiSquareStats.pValue < alpha) {
      return `Reject the null hypothesis: the gap between observed and expected counts is unlikely to be due to random chance alone at alpha = ${alpha}.`;
    }
    return `Do not reject the null hypothesis: the data are still consistent with random chance at alpha = ${alpha}.`;
  }, [alpha, chiSquareStats]);

  const chiSquareMax = useMemo(() => {
    const values = [1, ...categories.map((category) => category.observed)];
    if (expectedCounts) values.push(...expectedCounts);
    return Math.max(...values);
  }, [categories, expectedCounts]);

  const hardySummary = useMemo(() => {
    const baseSummary = {
      error: null as string | null,
      p: 0,
      q: 0,
      pSquared: 0,
      twoPQ: 0,
      qSquared: 0,
      dominantPhenotype: 0,
      recessivePhenotype: 0,
      homozygousDominantCount: 0,
      heterozygousCount: 0,
      homozygousRecessiveCount: 0,
      modeText: "",
    };

    if (!Number.isFinite(hardyPopulation) || hardyPopulation <= 0) {
      return { ...baseSummary, error: "Population size must be greater than 0." };
    }

    let p = 0;
    let q = 0;
    let modeText = "";

    if (hardyMode === "p") {
      if (!Number.isFinite(hardyP) || hardyP < 0 || hardyP > 1) {
        return { ...baseSummary, error: "Allele frequency p must stay between 0 and 1." };
      }
      p = hardyP;
      q = 1 - hardyP;
      modeText = "Starting from a known dominant-allele frequency p.";
    } else {
      if (!Number.isFinite(hardyQSquared) || hardyQSquared < 0 || hardyQSquared > 1) {
        return { ...baseSummary, error: "Recessive phenotype frequency q² must stay between 0 and 1." };
      }
      q = Math.sqrt(hardyQSquared);
      p = 1 - q;
      modeText = "Starting from a known recessive phenotype frequency q².";
    }

    const pSquared = p * p;
    const twoPQ = 2 * p * q;
    const qSquared = q * q;

    return {
      ...baseSummary,
      error: null,
      p,
      q,
      pSquared,
      twoPQ,
      qSquared,
      dominantPhenotype: pSquared + twoPQ,
      recessivePhenotype: qSquared,
      homozygousDominantCount: pSquared * hardyPopulation,
      heterozygousCount: twoPQ * hardyPopulation,
      homozygousRecessiveCount: qSquared * hardyPopulation,
      modeText,
    };
  }, [hardyMode, hardyP, hardyPopulation, hardyQSquared]);

  const waterSummary = useMemo(() => {
    const temperatureK = waterTempC + 273;
    const solutePotential = -1 * waterI * waterC * 0.0831 * temperatureK;
    const totalWaterPotential = solutePotential + waterPressure;

    let direction = "No strong net movement is predicted because the inside and outside water potentials are almost equal.";
    if (outsideWaterPotential > totalWaterPotential + 0.05) {
      direction = "Water will tend to move into the cell because water moves from higher water potential to lower water potential.";
    } else if (outsideWaterPotential < totalWaterPotential - 0.05) {
      direction = "Water will tend to move out of the cell because the cell has the higher water potential.";
    }

    return {
      temperatureK,
      solutePotential,
      totalWaterPotential,
      direction,
    };
  }, [outsideWaterPotential, waterC, waterI, waterPressure, waterTempC]);

  const surfaceRows = useMemo(() => {
    const uniqueSizes = Array.from(
      new Set(
        parseNumberList(surfaceSizes)
          .filter((value) => value > 0)
          .map((value) => Number(value.toFixed(4))),
      ),
    ).sort((left, right) => left - right);

    return uniqueSizes.map((side) => {
      const surfaceArea = 6 * side * side;
      const volume = side * side * side;
      const ratioValue = surfaceArea / volume;
      return {
        side,
        surfaceArea,
        volume,
        ratioValue,
      };
    });
  }, [surfaceSizes]);

  const surfaceTakeaway = useMemo(() => {
    if (surfaceRows.length === 0) return "Enter one or more cube side lengths to compare their surface-area-to-volume ratios.";
    const bestRow = surfaceRows.reduce((best, row) => (row.ratioValue > best.ratioValue ? row : best), surfaceRows[0]);
    return `The highest SA:V ratio belongs to the smallest cube here (side length ${formatNumber(bestRow.side, 2)}). That is why smaller cells exchange materials faster relative to their volume.`;
  }, [surfaceRows]);

  const slopeSummary = useMemo(() => {
    const unitsLabel = yUnits && xUnits ? `${yUnits} per ${xUnits}` : "units per unit";
    const baseSummary = {
      error: null as string | null,
      deltaX: 0,
      deltaY: 0,
      slope: 0,
      interpretation: "",
      unitsLabel,
    };

    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    if (deltaX === 0) {
      return {
        ...baseSummary,
        error: "x2 cannot equal x1 because slope would be undefined. Use two points with different x-values.",
      };
    }

    const slope = deltaY / deltaX;
    let interpretation = "The line is flat, so there is no net change over time.";
    if (slope > 0) {
      interpretation = "The slope is positive, so the quantity is increasing over the interval you chose.";
    } else if (slope < 0) {
      interpretation = "The slope is negative, so the quantity is decreasing over the interval you chose.";
    }

    return {
      ...baseSummary,
      error: null,
      deltaX,
      deltaY,
      slope,
      interpretation,
      unitsLabel,
    };
  }, [x1, x2, xUnits, y1, y2, yUnits]);

  const standardDeviationSummary = useMemo(() => summarizeSamples(parseNumberList(standardDeviationInput)), [standardDeviationInput]);

  const standardDeviationExplanation = useMemo(() => {
    if (!standardDeviationSummary) {
      return "Enter replicate values to calculate the mean, variance, and sample standard deviation.";
    }

    if (standardDeviationSummary.n === 1) {
      return "With only one value, the spread is treated as zero. Add more replicates to measure variability.";
    }

    return `These values average ${formatNumber(standardDeviationSummary.mean, 2)} with a sample standard deviation of ${formatNumber(standardDeviationSummary.sd, 2)}. Larger SD means the replicates are more spread out around the mean.`;
  }, [standardDeviationSummary]);

  const sampleASummary = useMemo(() => summarizeSamples(parseNumberList(sampleAInput)), [sampleAInput]);
  const sampleBSummary = useMemo(() => summarizeSamples(parseNumberList(sampleBInput)), [sampleBInput]);

  const ciScale = useMemo(() => {
    const summaries: SampleSummary[] = [];
    if (sampleASummary) summaries.push(sampleASummary);
    if (sampleBSummary) summaries.push(sampleBSummary);

    if (summaries.length === 0) {
      return { min: 0, span: 1 };
    }

    const min = Math.min(...summaries.map((summary) => summary.ciLow));
    const max = Math.max(...summaries.map((summary) => summary.ciHigh));
    return { min, span: Math.max(1e-6, max - min) };
  }, [sampleASummary, sampleBSummary]);

  const ciComparisonText = useMemo(() => {
    if (!sampleASummary || !sampleBSummary) {
      return "Enter values for both datasets if you want to compare error bars side by side.";
    }

    const overlap = Math.min(sampleASummary.ciHigh, sampleBSummary.ciHigh) - Math.max(sampleASummary.ciLow, sampleBSummary.ciLow);
    if (overlap > 0) {
      return `These 95% confidence intervals overlap by about ${formatNumber(overlap, 2)} units. That overlap is a warning not to overclaim a clear difference from the bars alone.`;
    }
    return "These 95% confidence intervals do not overlap. That usually supports a clearer difference between the group means, though the full experiment design still matters.";
  }, [sampleASummary, sampleBSummary]);

  const pValueSummary = useMemo(() => {
    const baseSummary = {
      error: null as string | null,
      frequency: "",
      decision: "",
      plainEnglish: "",
      misconception: "",
    };

    if (!Number.isFinite(plainPValue) || plainPValue < 0 || plainPValue > 1) {
      return {
        ...baseSummary,
        error: "A p-value must stay between 0 and 1.",
      };
    }

    let frequency = `about ${formatNumber(plainPValue * 100, 1)} times out of 100`;
    if (plainPValue < 0.01 && plainPValue >= 0.001) {
      frequency = `about ${formatNumber(plainPValue * 1000, 1)} times out of 1,000`;
    } else if (plainPValue < 0.001) {
      frequency = "less than 1 time out of 1,000";
    }

    const decision =
      plainPValue < plainAlpha
        ? `Because p = ${formatNumber(plainPValue, 3)} is below alpha = ${plainAlpha}, you would reject the null hypothesis.`
        : `Because p = ${formatNumber(plainPValue, 3)} is at or above alpha = ${plainAlpha}, you would not reject the null hypothesis.`;

    return {
      ...baseSummary,
      error: null,
      frequency,
      decision,
      plainEnglish: `If the null hypothesis were actually true, a result this extreme would show up ${frequency}.`,
      misconception: "A p-value is not the probability that the null hypothesis is true. It is about how surprising your data would be if the null were true.",
    };
  }, [plainAlpha, plainPValue]);

  function updateCategory(index: number, patch: Partial<Category>) {
    setCategories((current) => current.map((category, currentIndex) => (currentIndex === index ? { ...category, ...patch } : category)));
  }

  function addCategory() {
    setCategories((current) => [...current, { name: `Category ${current.length + 1}`, observed: 0 }]);
    setRatio((current) => {
      const parsedRatio = parseRatio(current);
      if (!parsedRatio) return current;
      return [...parsedRatio, 1].join(":");
    });
  }

  function removeCategory(index: number) {
    if (categories.length <= 2) return;
    setCategories((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setRatio((current) => {
      const parsedRatio = parseRatio(current);
      if (!parsedRatio || parsedRatio.length !== categories.length) return current;
      parsedRatio.splice(index, 1);
      return parsedRatio.join(":");
    });
  }

  return (
    <div className="study-screen" style={{ background: PAGE_BG, color: TEXT, borderRadius: 28 }}>
      <div style={{ width: "100%", padding: 12 }} className="sm:p-[18px]">
        <div style={{ display: "grid", gap: 16 }}>
          <section
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 30,
              padding: 20,
              background:
                "linear-gradient(135deg, rgba(14,165,233,0.18) 0%, rgba(255,255,255,0.98) 36%, rgba(249,115,22,0.14) 70%, rgba(16,185,129,0.12) 100%)",
              boxShadow: "0 14px 36px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_360px]" style={{ display: "grid", gap: 16 }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: SKY_DARK }}>
                  Statistics Center
                </p>
                <h1 style={{ marginTop: 10, marginBottom: 10, fontSize: 38, lineHeight: 1.03, fontWeight: 950, color: HEADING }} className="text-[clamp(2rem,5vw,3rem)]">
                  AP Biology Math and Statistics Center
                </h1>
                <p style={{ margin: 0, maxWidth: 860, fontSize: 16, lineHeight: 1.6, color: TEXT }}>
                  Use this page when AP Biology numbers are slowing you down. It pulls chi-square, allele frequencies,
                  water movement, scaling, graph rates, standard deviation, confidence intervals, and p-values into one guided review space.
                </p>

                <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href="/sims/mcq?difficulty=statistics"
                    style={{
                      ...anchorPillStyle(),
                      background: SKY,
                      border: `1px solid ${SKY}`,
                      color: "#ffffff",
                    }}
                  >
                    Practice AP Bio Statistic MCQs
                  </a>
                  <a href="#chi-square" style={anchorPillStyle()}>Chi-square</a>
                  <a href="#hardy-weinberg" style={anchorPillStyle()}>Hardy-Weinberg</a>
                  <a href="#water-potential" style={anchorPillStyle()}>Water potential</a>
                  <a href="#surface-area" style={anchorPillStyle()}>Surface area : volume</a>
                  <a href="#graph-slope" style={anchorPillStyle()}>Rate and slope</a>
                  <a href="#standard-deviation" style={anchorPillStyle()}>Standard deviation</a>
                  <a href="#confidence-intervals" style={anchorPillStyle()}>Confidence intervals</a>
                  <a href="#p-values" style={anchorPillStyle()}>P-values in plain English</a>
                </div>

              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div style={panelStyle("rgba(255,255,255,0.86)")}>
                  <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: SKY_DARK }}>Formula board</div>
                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    <div style={badgeStyle("#e5e7eb", SKY_DARK)}>
                      <MathText>
                        χ<MathSup>2</MathSup> = Σ{" "}
                        <MathFraction
                          numerator={
                            <>
                              (O − E)<MathSup>2</MathSup>
                            </>
                          }
                          denominator="E"
                          compact
                        />
                      </MathText>
                    </div>
                    <div style={badgeStyle("#e5e7eb", EMERALD_DARK)}>
                      <MathText>
                        p<MathSup>2</MathSup> + 2pq + q<MathSup>2</MathSup> = 1
                      </MathText>
                    </div>
                    <div style={badgeStyle("#e2e8f0", AMBER_DARK)}>
                      <MathText>
                        ψ = ψ<MathSub>s</MathSub> + ψ<MathSub>p</MathSub>
                      </MathText>
                    </div>
                    <div style={badgeStyle("#e2e8f0", ROSE_DARK)}>
                      <MathText>
                        rate ={" "}
                        <MathFraction numerator="Δy" denominator="Δx" compact />
                      </MathText>
                    </div>
                    <div style={badgeStyle("#e2e8f0", HEADING)}>
                      <MathText>SD = √</MathText>
                      <MathFraction
                        numerator={
                          <>
                            Σ(x − mean)<MathSup>2</MathSup>
                          </>
                        }
                        denominator={<>n − 1</>}
                        compact
                      />
                    </div>
                    <div style={badgeStyle("#e2e8f0", HEADING)}>
                      <MathText>95% CI ≈ mean ± 1.96 × SEM</MathText>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, ...panelStyle("rgba(255,255,255,0.86)") }}>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: SKY_DARK }}>Why it matters</div>
              <ul
                className="grid gap-x-8 gap-y-2 md:grid-cols-2 xl:grid-cols-3"
                style={{ margin: "10px 0 0 18px", paddingLeft: 18, color: TEXT, lineHeight: 1.6, listStyleType: "disc", listStylePosition: "outside" }}
              >
                <li>Chi-square tells you whether a deviation is bigger than chance.</li>
                <li>Hardy-Weinberg turns phenotype clues into allele-frequency answers.</li>
                <li>Water potential lets you predict direction of water movement instead of guessing.</li>
                <li>Surface-area-to-volume explains why cell size limits matter.</li>
                <li>Slope is the rate on AP Bio graphs.</li>
                <li>Standard deviation shows how spread out replicate measurements are around the mean.</li>
                <li>Confidence intervals and p-values help you talk about uncertainty correctly.</li>
              </ul>
            </div>
          </section>

          <SectionShell
            id="chi-square"
            eyebrow="Observed vs expected"
            title="Chi-square Lab"
            description="Keep the genetics-strength tool you already had, but anchor it inside a bigger quantitative workflow. Enter observed counts, test an expected ratio, inspect each contribution, and read the p-value in plain AP Bio language."
          >
            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" style={{ display: "grid", gap: 16, alignItems: "start" }}>
              <div style={panelStyle()}>
                <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 20, color: HEADING }}>Inputs</h3>

                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>Expected ratio</label>
                    <input value={ratio} onChange={(event) => setRatio(event.target.value)} style={inputStyle()} placeholder="3:1 or 9:3:3:1" />
                  </div>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>alpha</label>
                      <select value={alpha} onChange={(event) => setAlpha(Number(event.target.value))} style={inputStyle()}>
                        <option value={0.1}>0.10</option>
                        <option value={0.05}>0.05</option>
                        <option value={0.01}>0.01</option>
                      </select>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <div style={{ fontSize: 13, color: SUBTLE, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total N</div>
                      <div style={{ marginTop: 6, fontSize: 28, fontWeight: 900, color: HEADING }}>{totalObserved}</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <h4 style={{ margin: 0, fontSize: 16, color: HEADING }}>Categories</h4>
                  <button
                    onClick={addCategory}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: `1px solid ${BORDER}`,
                      background: "white",
                      fontWeight: 800,
                      color: HEADING,
                      cursor: "pointer",
                    }}
                  >
                    + Add category
                  </button>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {categories.map((category, index) => (
                    <div key={`${category.name}-${index}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_42px]" style={{ display: "grid", gap: 8 }}>
                      <input
                        value={category.name}
                        onChange={(event) => updateCategory(index, { name: event.target.value })}
                        style={inputStyle()}
                      />
                      <input
                        type="number"
                        min={0}
                        value={category.observed}
                        onChange={(event) => updateCategory(index, { observed: Math.max(0, Number(event.target.value)) })}
                        style={inputStyle()}
                      />
                      <button
                        onClick={() => removeCategory(index)}
                        disabled={categories.length <= 2}
                        style={{
                          ...inputStyle(),
                          padding: "0",
                          cursor: categories.length <= 2 ? "not-allowed" : "pointer",
                          opacity: categories.length <= 2 ? 0.45 : 1,
                          color: ROSE_DARK,
                          fontWeight: 900,
                        }}
                        title="Remove category"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, ...panelStyle("white") }}>
                  <div style={{ fontWeight: 900, color: HEADING, marginBottom: 8 }}>Right-tail critical values</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ textAlign: "left" }}>
                          <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 6 }}>df</th>
                          <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 6 }}>alpha = 0.10</th>
                          <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 6 }}>alpha = 0.05</th>
                          <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 6 }}>alpha = 0.01</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CRITICAL_VALUES.map((row) => (
                          <tr key={row.df}>
                            <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 6 }}>{row.df}</td>
                            <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 6 }}>{formatNumber(row.a10, 3)}</td>
                            <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 6 }}>{formatNumber(row.a05, 3)}</td>
                            <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 6 }}>{formatNumber(row.a01, 3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ margin: "10px 0 0", color: TEXT, fontSize: 14, lineHeight: 1.5 }}>
                    AP shortcut: degrees of freedom = number of categories - 1. A small chi-square means observed counts sit close to expectation.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <div style={panelStyle()}>
                  <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 20, color: HEADING }}>Observed vs expected</h3>
                  {!expectedCounts ? (
                    <div style={{ ...panelStyle("#f1f5f9"), color: ROSE_DARK, fontWeight: 800 }}>
                      Your ratio is either invalid or the number of ratio pieces does not match the number of categories.
                    </div>
                  ) : (
                    <div>
                      {categories.map((category, index) => (
                        <ChiSquareBarRow
                          key={`${category.name}-${index}-bars`}
                          label={category.name}
                          observed={category.observed}
                          expected={expectedCounts[index]}
                          maxValue={chiSquareMax}
                        />
                      ))}
                    </div>
                  )}
                  {expectedWarning && (
                    <div style={{ marginTop: 12, ...panelStyle("#f1f5f9"), color: AMBER_DARK, fontWeight: 700 }}>
                      {expectedWarning}
                    </div>
                  )}
                </div>

                <div style={panelStyle()}>
                  <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 20, color: HEADING }}>χ² breakdown</h3>
                  {!chiSquareStats ? (
                    <div style={{ ...panelStyle("#f1f5f9"), color: ROSE_DARK, fontWeight: 800 }}>
                      Enter a valid ratio first so the expected counts and contributions can be calculated.
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-3" style={{ display: "grid", gap: 12 }}>
                        <div style={panelStyle("white")}>
                          <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: SUBTLE }}>χ²</div>
                          <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: HEADING }}>{formatNumber(chiSquareStats.chiSquare, 3)}</div>
                        </div>
                        <div style={panelStyle("white")}>
                          <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: SUBTLE }}>degrees of freedom</div>
                          <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: HEADING }}>{chiSquareStats.degreesOfFreedom}</div>
                        </div>
                        <div style={panelStyle("white")}>
                          <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: SUBTLE }}>p-value</div>
                          <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: HEADING }}>{formatNumber(chiSquareStats.pValue, 3)}</div>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                          ...panelStyle(chiSquareStats.pValue < alpha ? "#f1f5f9" : MUTED_BG),
                          color: HEADING,
                        }}
                      >
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>Decision</div>
                        <div style={{ lineHeight: 1.6 }}>{chiSquareDecision}</div>
                        <div style={{ marginTop: 10, color: TEXT, fontSize: 14 }}>
                          Plain English: if the null hypothesis were true, a result this extreme would show up about {formatNumber(chiSquareStats.pValue * 100, 1)} times out of 100 similar trials.
                        </div>
                      </div>

                      <div style={{ marginTop: 14, overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ textAlign: "left" }}>
                              <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>Category</th>
                              <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>Observed</th>
                              <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>Expected</th>
                              <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>
                                <MathFraction
                                  numerator={
                                    <MathText color={HEADING}>
                                      (O − E)<MathSup>2</MathSup>
                                    </MathText>
                                  }
                                  denominator={<MathText color={HEADING}>E</MathText>}
                                  color={HEADING}
                                  compact
                                />
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {chiSquareStats.contributions.map((row) => (
                              <tr key={`${row.name}-table`}>
                                <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>{row.name}</td>
                                <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8, color: "#475569", fontWeight: 800 }}>{row.observed}</td>
                                <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8, color: "#5b46d8", fontWeight: 800 }}>{formatNumber(row.expected, 2)}</td>
                                <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>{formatNumber(row.contribution, 3)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <p style={{ margin: "12px 0 0", color: TEXT, fontSize: 14, lineHeight: 1.55 }}>
                        The biggest contribution tells you where most of the mismatch lives. That is often the category you should look at first when you explain the result.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SectionShell>

          <div className="grid gap-4 xl:grid-cols-2" style={{ display: "grid", gap: 16 }}>
            <SectionShell
              id="hardy-weinberg"
              eyebrow="Population genetics"
              title="Hardy-Weinberg coach"
              description="Switch between a known allele frequency p and a known recessive phenotype frequency q². The tool translates those values into genotype frequencies and expected counts so you can move from one AP Bio prompt style to another quickly."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" style={{ display: "grid", gap: 16 }}>
                <div style={panelStyle()}>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>Starting point</label>
                      <select value={hardyMode} onChange={(event) => setHardyMode(event.target.value as HardyWeinbergMode)} style={inputStyle()}>
                        <option value="q2">Known recessive phenotype frequency q²</option>
                        <option value="p">Known dominant-allele frequency p</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>Population size</label>
                      <input type="number" min={1} value={hardyPopulation} onChange={(event) => setHardyPopulation(Number(event.target.value))} style={inputStyle()} />
                    </div>

                    {hardyMode === "p" ? (
                      <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>Allele frequency p</label>
                        <input type="number" step="0.01" min={0} max={1} value={hardyP} onChange={(event) => setHardyP(Number(event.target.value))} style={inputStyle()} />
                      </div>
                    ) : (
                      <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>Recessive phenotype frequency q²</label>
                        <input type="number" step="0.01" min={0} max={1} value={hardyQSquared} onChange={(event) => setHardyQSquared(Number(event.target.value))} style={inputStyle()} />
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 14, ...panelStyle("white") }}>
                    <div style={{ fontWeight: 900, color: HEADING }}>AP shortcut</div>
                    <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.55 }}>
                      If the prompt gives you the recessive phenotype frequency, that is usually q². Take the square root to get q, then use p = 1 − q.
                    </p>
                  </div>
                </div>

                <div style={panelStyle()}>
                  {hardySummary.error ? (
                    <div style={{ ...panelStyle("#f1f5f9"), color: ROSE_DARK, fontWeight: 800 }}>{hardySummary.error}</div>
                  ) : (
                    <>
                      <div style={{ ...panelStyle("white") }}>
                        <div style={{ fontWeight: 900, color: HEADING }}>Setup</div>
                        <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.55 }}>{hardySummary.modeText}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" style={{ display: "grid", gap: 12, marginTop: 14 }}>
                        <div style={panelStyle("white")}>
                          <div style={metricLabelStyle()}>p</div>
                          <div style={metricValueStyle(28)}>{formatNumber(hardySummary.p, 3)}</div>
                        </div>
                        <div style={panelStyle("white")}>
                          <div style={metricLabelStyle()}>q</div>
                          <div style={metricValueStyle(28)}>{formatNumber(hardySummary.q, 3)}</div>
                        </div>
                        <div style={panelStyle("white")}>
                          <div style={metricLabelStyle()}>carriers (2pq)</div>
                          <div style={metricValueStyle(28)}>{formatNumber(hardySummary.twoPQ, 3)}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 14, overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ textAlign: "left" }}>
                              <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>Genotype</th>
                              <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>Frequency</th>
                              <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>Expected count</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>
                                <MathText>
                                  p<MathSup>2</MathSup> (AA)
                                </MathText>
                              </td>
                              <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>{formatNumber(hardySummary.pSquared, 3)}</td>
                              <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>{formatNumber(hardySummary.homozygousDominantCount, 1)}</td>
                            </tr>
                            <tr>
                              <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>
                                <MathText>2pq (Aa)</MathText>
                              </td>
                              <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>{formatNumber(hardySummary.twoPQ, 3)}</td>
                              <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>{formatNumber(hardySummary.heterozygousCount, 1)}</td>
                            </tr>
                            <tr>
                              <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>
                                <MathText>
                                  q<MathSup>2</MathSup> (aa)
                                </MathText>
                              </td>
                              <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>{formatNumber(hardySummary.qSquared, 3)}</td>
                              <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>{formatNumber(hardySummary.homozygousRecessiveCount, 1)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginTop: 12, color: TEXT, lineHeight: 1.6 }}>
                        Dominant phenotype frequency = {formatNumber(hardySummary.dominantPhenotype, 3)}. Recessive phenotype frequency = {formatNumber(hardySummary.recessivePhenotype, 3)}.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="water-potential"
              eyebrow="Osmosis and transport"
              title="Water potential tracker"
              description={
                <>
                  Use <MathText>ψ = ψ<MathSub>s</MathSub> + ψ<MathSub>p</MathSub></MathText> with AP Bio conventions. The tool computes solute potential, total water potential, and the direction water will move once you compare the cell to its surroundings.
                </>
              }
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" style={{ display: "grid", gap: 16 }}>
                <div style={panelStyle()}>
                  <div className="grid gap-3 sm:grid-cols-2" style={{ display: "grid", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>i (ionization constant)</label>
                      <input type="number" step="0.1" value={waterI} onChange={(event) => setWaterI(Number(event.target.value))} style={inputStyle()} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>C (molarity)</label>
                      <input type="number" step="0.01" value={waterC} onChange={(event) => setWaterC(Number(event.target.value))} style={inputStyle()} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>Temperature (C)</label>
                      <input type="number" step="1" value={waterTempC} onChange={(event) => setWaterTempC(Number(event.target.value))} style={inputStyle()} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>
                        Pressure potential <MathText color={HEADING}>ψ<MathSub>p</MathSub></MathText>
                      </label>
                      <input type="number" step="0.1" value={waterPressure} onChange={(event) => setWaterPressure(Number(event.target.value))} style={inputStyle()} />
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>Outside water potential</label>
                    <input type="number" step="0.1" value={outsideWaterPotential} onChange={(event) => setOutsideWaterPotential(Number(event.target.value))} style={inputStyle()} />
                  </div>

                  <div style={{ marginTop: 14, ...panelStyle("white") }}>
                    <div style={{ fontWeight: 900, color: HEADING }}>Formula cue</div>
                    <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.55 }}>
                      <MathText>ψ<MathSub>s</MathSub> = −iCRT</MathText>, using <MathText>R = 0.0831 L·bar·mol⁻¹·K⁻¹</MathText>. Then add pressure potential to get total water potential.
                    </p>
                  </div>
                </div>

                <div style={panelStyle()}>
                  <div className="grid gap-3 sm:grid-cols-2" style={{ display: "grid", gap: 12 }}>
                    <div style={panelStyle("white")}>
                      <div style={metricLabelStyle()}>Temperature (K)</div>
                      <div style={metricValueStyle(24)}>{formatNumber(waterSummary.temperatureK, 1)}</div>
                    </div>
                    <div style={panelStyle("white")}>
                      <div style={metricLabelStyle()}>ψₛ</div>
                      <div style={metricValueStyle(24)}>{formatNumber(waterSummary.solutePotential, 2)}</div>
                    </div>
                    <div style={panelStyle("white")}>
                      <div style={metricLabelStyle()}>ψₚ</div>
                      <div style={metricValueStyle(24)}>{formatNumber(waterPressure, 2)}</div>
                    </div>
                    <div style={panelStyle("white")}>
                      <div style={metricLabelStyle()}>Cell ψ total</div>
                      <div style={metricValueStyle(24)}>{formatNumber(waterSummary.totalWaterPotential, 2)}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, ...panelStyle(MUTED_BG) }}>
                    <div style={{ fontWeight: 900, color: HEADING }}>Direction prediction</div>
                    <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.6 }}>{waterSummary.direction}</p>
                    <p style={{ margin: "8px 0 0", color: SUBTLE, fontSize: 14 }}>
                      Outside ψ = {formatNumber(outsideWaterPotential, 2)} and cell ψ = {formatNumber(waterSummary.totalWaterPotential, 2)}.
                    </p>
                  </div>
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="surface-area"
              eyebrow="Scaling limits"
              title="Surface area to volume checker"
              description="AP Bio loves asking why smaller cells exchange materials faster. Enter cube side lengths and compare how surface area, volume, and the SA:V ratio shift as size increases."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" style={{ display: "grid", gap: 16 }}>
                <div style={panelStyle()}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>Cube side lengths</label>
                  <input value={surfaceSizes} onChange={(event) => setSurfaceSizes(event.target.value)} style={inputStyle()} placeholder="1, 2, 4, 8" />
                  <div style={{ marginTop: 12, ...panelStyle("white") }}>
                    <div style={{ fontWeight: 900, color: HEADING }}>Fast AP shortcut</div>
                    <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.55 }}>
                      For a cube, <MathText>SA:V = <MathFraction numerator="6" denominator="side length" compact /></MathText>. As side length goes up, the ratio must go down.
                    </p>
                  </div>
                </div>

                <div style={panelStyle()}>
                  {surfaceRows.length === 0 ? (
                    <div style={{ ...panelStyle("#f1f5f9"), color: ROSE_DARK, fontWeight: 800 }}>Enter at least one positive side length.</div>
                  ) : (
                    <>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ textAlign: "left" }}>
                              <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>Side</th>
                              <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>Surface area</th>
                              <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>Volume</th>
                              <th style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>SA:V</th>
                            </tr>
                          </thead>
                          <tbody>
                            {surfaceRows.map((row) => (
                              <tr key={`surface-${row.side}`}>
                                <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>{formatNumber(row.side, 2)}</td>
                                <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>{formatNumber(row.surfaceArea, 2)}</td>
                                <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8 }}>{formatNumber(row.volume, 2)}</td>
                                <td style={{ borderBottom: `1px solid ${BORDER}`, padding: 8, fontWeight: 800, color: HEADING }}>{formatNumber(row.ratioValue, 2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: 12, ...panelStyle(MUTED_BG) }}>
                        <div style={{ fontWeight: 900, color: HEADING }}>Takeaway</div>
                        <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.55 }}>{surfaceTakeaway}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="graph-slope"
              eyebrow="Rates and graphs"
              title="Rate and graph slope helper"
              description={
                <>
                  Slope is the AP Bio rate move. Use any two points from a graph, calculate <MathFraction numerator="Δy" denominator="Δx" compact />, and translate the number into a plain-language rate statement.
                </>
              }
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]" style={{ display: "grid", gap: 16 }}>
                <div style={panelStyle()}>
                  <div className="grid gap-3 sm:grid-cols-2" style={{ display: "grid", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>x1</label>
                      <input type="number" value={x1} onChange={(event) => setX1(Number(event.target.value))} style={inputStyle()} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>y1</label>
                      <input type="number" value={y1} onChange={(event) => setY1(Number(event.target.value))} style={inputStyle()} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>x2</label>
                      <input type="number" value={x2} onChange={(event) => setX2(Number(event.target.value))} style={inputStyle()} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>y2</label>
                      <input type="number" value={y2} onChange={(event) => setY2(Number(event.target.value))} style={inputStyle()} />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2" style={{ display: "grid", gap: 12, marginTop: 12 }}>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>x units</label>
                      <input value={xUnits} onChange={(event) => setXUnits(event.target.value)} style={inputStyle()} placeholder="minutes" />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>y units</label>
                      <input value={yUnits} onChange={(event) => setYUnits(event.target.value)} style={inputStyle()} placeholder="mL oxygen" />
                    </div>
                  </div>
                </div>

                <div style={panelStyle()}>
                  {slopeSummary.error ? (
                    <div style={{ ...panelStyle("#f1f5f9"), color: ROSE_DARK, fontWeight: 800 }}>{slopeSummary.error}</div>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-3" style={{ display: "grid", gap: 12 }}>
                        <div style={panelStyle("white")}>
                          <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: SUBTLE }}>Δx</div>
                          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 900, color: HEADING }}>{formatNumber(slopeSummary.deltaX, 2)}</div>
                        </div>
                        <div style={panelStyle("white")}>
                          <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: SUBTLE }}>Δy</div>
                          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 900, color: HEADING }}>{formatNumber(slopeSummary.deltaY, 2)}</div>
                        </div>
                        <div style={panelStyle("white")}>
                          <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: SUBTLE }}>Slope</div>
                          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 900, color: HEADING }}>{formatNumber(slopeSummary.slope, 3)}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 14, ...panelStyle(MUTED_BG) }}>
                        <div style={{ fontWeight: 900, color: HEADING }}>Rate statement</div>
                        <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.6 }}>
                          The slope is {formatNumber(slopeSummary.slope, 3)} {slopeSummary.unitsLabel}. {slopeSummary.interpretation}
                        </p>
                      </div>

                      <p style={{ margin: "12px 0 0", color: TEXT, lineHeight: 1.55 }}>
                        AP shortcut: when the graph is roughly linear over a segment, slope is the rate over that interval. Always include units.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="standard-deviation"
              eyebrow="Spread and variation"
              title="Standard deviation calculator"
              description="Paste one set of replicate values to measure how tightly the data cluster around the mean. Use this when AP Bio asks you to describe variation instead of just reporting an average."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]" style={{ display: "grid", gap: 16 }}>
                <div style={panelStyle()}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>Replicate values</label>
                    <textarea value={standardDeviationInput} onChange={(event) => setStandardDeviationInput(event.target.value)} style={textareaStyle()} />
                  </div>

                  <div style={{ marginTop: 14, ...panelStyle("white") }}>
                    <div style={{ fontWeight: 900, color: HEADING }}>Formula cue</div>
                    <div style={{ marginTop: 10 }}>
                      <div style={badgeStyle("#e2e8f0", HEADING)}>
                        <MathText>SD = √</MathText>
                        <MathFraction
                          numerator={
                            <>
                              Σ(x − mean)<MathSup>2</MathSup>
                            </>
                          }
                          denominator={<>n − 1</>}
                          compact
                        />
                      </div>
                    </div>
                    <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.55 }}>
                      Use the sample standard deviation formula so the spread is based on <MathText>n − 1</MathText> in the denominator. That is the version most often used for experimental replicates.
                    </p>
                  </div>
                </div>

                <div style={panelStyle()}>
                  {!standardDeviationSummary ? (
                    <div style={{ ...panelStyle("#f1f5f9"), color: ROSE_DARK, fontWeight: 800 }}>Enter at least one valid number.</div>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2" style={{ display: "grid", gap: 12 }}>
                        <div style={panelStyle("white")}>
                          <div style={metricLabelStyle()}>n</div>
                          <div style={metricValueStyle(26)}>{standardDeviationSummary.n}</div>
                        </div>
                        <div style={panelStyle("white")}>
                          <div style={metricLabelStyle()}>Mean</div>
                          <div style={metricValueStyle(26)}>{formatNumber(standardDeviationSummary.mean, 2)}</div>
                        </div>
                        <div style={panelStyle("white")}>
                          <div style={metricLabelStyle()}>Variance</div>
                          <div style={metricValueStyle(26)}>{formatNumber(standardDeviationSummary.sd * standardDeviationSummary.sd, 2)}</div>
                        </div>
                        <div style={panelStyle("white")}>
                          <div style={metricLabelStyle()}>SD</div>
                          <div style={metricValueStyle(26)}>{formatNumber(standardDeviationSummary.sd, 2)}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 14, ...panelStyle(MUTED_BG) }}>
                        <div style={{ fontWeight: 900, color: HEADING }}>Interpretation</div>
                        <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.6 }}>{standardDeviationExplanation}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="confidence-intervals"
              eyebrow="Uncertainty"
              title="Confidence intervals and error bars"
              description="Paste replicate values for one or two groups. The hub calculates mean, standard deviation, standard error, and an approximate 95% confidence interval so you can talk about uncertainty instead of hand-waving it."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" style={{ display: "grid", gap: 16 }}>
                <div style={panelStyle()}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>Dataset A replicates</label>
                    <textarea value={sampleAInput} onChange={(event) => setSampleAInput(event.target.value)} style={textareaStyle()} />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>Dataset B replicates</label>
                    <textarea value={sampleBInput} onChange={(event) => setSampleBInput(event.target.value)} style={textareaStyle()} />
                  </div>
                  <div style={{ marginTop: 14, ...panelStyle("white") }}>
                    <div style={{ fontWeight: 900, color: HEADING }}>Error-bar note</div>
                    <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.55 }}>
                      This tool uses an approximate 95% confidence interval: <MathText>mean ± 1.96 × SEM</MathText>. Bigger bars mean more uncertainty around the mean estimate.
                    </p>
                  </div>
                </div>

                <div style={panelStyle()}>
                  {!sampleASummary && !sampleBSummary ? (
                    <div style={{ ...panelStyle("#f1f5f9"), color: ROSE_DARK, fontWeight: 800 }}>Enter at least one valid dataset.</div>
                  ) : (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2" style={{ display: "grid", gap: 12 }}>
                        {sampleASummary && (
                          <div style={panelStyle("white")}>
                            <div style={{ fontWeight: 900, color: HEADING }}>Dataset A</div>
                            <div style={{ marginTop: 8, display: "grid", gap: 4, color: TEXT }}>
                              <div>n = {sampleASummary.n}</div>
                              <div>mean = {formatNumber(sampleASummary.mean, 2)}</div>
                              <div>SD = {formatNumber(sampleASummary.sd, 2)}</div>
                              <div>SEM = {formatNumber(sampleASummary.sem, 2)}</div>
                            </div>
                          </div>
                        )}
                        {sampleBSummary && (
                          <div style={panelStyle("white")}>
                            <div style={{ fontWeight: 900, color: HEADING }}>Dataset B</div>
                            <div style={{ marginTop: 8, display: "grid", gap: 4, color: TEXT }}>
                              <div>n = {sampleBSummary.n}</div>
                              <div>mean = {formatNumber(sampleBSummary.mean, 2)}</div>
                              <div>SD = {formatNumber(sampleBSummary.sd, 2)}</div>
                              <div>SEM = {formatNumber(sampleBSummary.sem, 2)}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
                        {sampleASummary && (
                          <ConfidenceBarRow label="Dataset A" color={SKY} summary={sampleASummary} scaleMin={ciScale.min} scaleSpan={ciScale.span} />
                        )}
                        {sampleBSummary && (
                          <ConfidenceBarRow label="Dataset B" color={AMBER} summary={sampleBSummary} scaleMin={ciScale.min} scaleSpan={ciScale.span} />
                        )}
                      </div>

                      <div style={{ marginTop: 14, ...panelStyle(MUTED_BG) }}>
                        <div style={{ fontWeight: 900, color: HEADING }}>Plain-language comparison</div>
                        <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.6 }}>{ciComparisonText}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SectionShell>

            <SectionShell
              id="p-values"
              eyebrow="Evidence vs chance"
              title="P-values in plain English"
              description="A p-value should help you explain evidence, not intimidate you. Enter any p-value or import the one from the chi-square lab, and the center rewrites it into language you can actually use in an AP Bio response."
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]" style={{ display: "grid", gap: 16 }}>
                <div style={panelStyle()}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>p-value</label>
                    <input type="number" min={0} max={1} step="0.001" value={plainPValue} onChange={(event) => setPlainPValue(Number(event.target.value))} style={inputStyle()} />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: 800, color: HEADING }}>alpha cutoff</label>
                    <select value={plainAlpha} onChange={(event) => setPlainAlpha(Number(event.target.value))} style={inputStyle()}>
                      <option value={0.1}>0.10</option>
                      <option value={0.05}>0.05</option>
                      <option value={0.01}>0.01</option>
                    </select>
                  </div>

                  {chiSquareStats && (
                    <button
                      onClick={() => setPlainPValue(chiSquareStats.pValue)}
                      style={{
                        marginTop: 12,
                        padding: "10px 12px",
                        width: "100%",
                        borderRadius: 12,
                        border: `1px solid ${BORDER}`,
                        background: "white",
                        color: HEADING,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Use the p-value from the chi-square lab
                    </button>
                  )}
                </div>

                <div style={panelStyle()}>
                  {pValueSummary.error ? (
                    <div style={{ ...panelStyle("#f1f5f9"), color: ROSE_DARK, fontWeight: 800 }}>{pValueSummary.error}</div>
                  ) : (
                    <>
                      <div style={{ ...panelStyle(MUTED_BG) }}>
                        <div style={{ fontWeight: 900, color: HEADING }}>Plain-English translation</div>
                        <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.6 }}>{pValueSummary.plainEnglish}</p>
                      </div>

                      <div style={{ marginTop: 14, ...panelStyle("white") }}>
                        <div style={{ fontWeight: 900, color: HEADING }}>Decision rule</div>
                        <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.6 }}>{pValueSummary.decision}</p>
                      </div>

                      <div style={{ marginTop: 14, ...panelStyle("#f1f5f9") }}>
                        <div style={{ fontWeight: 900, color: HEADING }}>Common mistake</div>
                        <p style={{ margin: "8px 0 0", color: TEXT, lineHeight: 1.6 }}>{pValueSummary.misconception}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SectionShell>
          </div>
        </div>
      </div>
    </div>
  );
}