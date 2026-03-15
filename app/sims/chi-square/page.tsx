"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * Minimal chi-square p-value approximation using regularized gamma.
 * Good enough for AP-level feedback; you can swap in a stats library later.
 */

// Lanczos approximation for log-gamma
function logGamma(z: number): number {
  const p = [
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
    return (
      Math.log(Math.PI) -
      Math.log(Math.sin(Math.PI * z)) -
      logGamma(1 - z)
    );
  }
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) x += p[i] / (z + i + 1);
  const t = z + p.length - 0.5;
  return (
    0.5 * Math.log(2 * Math.PI) +
    (z + 0.5) * Math.log(t) -
    t +
    Math.log(x)
  );
}

// Regularized lower incomplete gamma P(s, x)
function gammaP(s: number, x: number): number {
  const EPS = 1e-12;
  const ITMAX = 200;

  if (x <= 0) return 0;

  // Series representation when x < s+1
  if (x < s + 1) {
    let sum = 1 / s;
    let del = sum;
    let ap = s;

    for (let n = 1; n <= ITMAX; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * EPS) break;
    }
    const result = sum * Math.exp(-x + s * Math.log(x) - logGamma(s));
    return Math.min(1, Math.max(0, result));
  }

  // Continued fraction for Q(s, x), then P = 1 - Q
  let b = x + 1 - s;
  let c = 1 / 1e-30;
  let d = 1 / b;
  let h = d;

  for (let i = 1; i <= ITMAX; i++) {
    const an = -i * (i - s);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }

  const q = Math.exp(-x + s * Math.log(x) - logGamma(s)) * h;
  return Math.min(1, Math.max(0, 1 - q));
}

// Chi-square CDF: CDF = P(df/2, x/2)
function chiSquareCDF(x: number, df: number): number {
  return gammaP(df / 2, x / 2);
}

type Category = { name: string; observed: number };

function parseRatio(ratioStr: string): number[] | null {
  const cleaned = ratioStr.trim().replace(/,/g, ":");
  const parts = cleaned.split(":").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n) || n <= 0)) return null;
  return nums;
}

export default function Page() {
  const [cats, setCats] = useState<Category[]>([
    { name: "Purple", observed: 72 },
    { name: "White", observed: 28 },
  ]);
  const [ratio, setRatio] = useState("3:1");
  const [alpha, setAlpha] = useState(0.05);

  const totalObserved = useMemo(
    () =>
      cats.reduce(
        (acc, c) => acc + (Number.isFinite(c.observed) ? c.observed : 0),
        0
      ),
    [cats]
  );

  const expectedCounts = useMemo(() => {
    const r = parseRatio(ratio);
    if (!r) return null;
    if (r.length !== cats.length) return null;
    const sum = r.reduce((a, b) => a + b, 0);
    return r.map((part) => (part / sum) * totalObserved);
  }, [ratio, cats.length, totalObserved]);

  const stats = useMemo(() => {
    if (!expectedCounts) return null;

    const contributions = cats.map((c, i) => {
      const O = c.observed;
      const E = expectedCounts[i];
      const contrib = E > 0 ? ((O - E) * (O - E)) / E : NaN;
      return { name: c.name, O, E, contrib };
    });

    const chi2 = contributions.reduce(
      (acc, row) => acc + (Number.isFinite(row.contrib) ? row.contrib : 0),
      0
    );

    const df = Math.max(1, cats.length - 1);
    const p = 1 - chiSquareCDF(chi2, df);

    return { contributions, chi2, df, p };
  }, [cats, expectedCounts]);

  const chartData = useMemo(() => {
    if (!expectedCounts) {
      return cats.map((c) => ({
        name: c.name,
        Observed: c.observed,
        Expected: 0,
      }));
    }
    return cats.map((c, i) => ({
      name: c.name,
      Observed: c.observed,
      Expected: Number(expectedCounts[i].toFixed(2)),
    }));
  }, [cats, expectedCounts]);

  const decision = useMemo(() => {
    if (!stats) return null;
    const pStr = stats.p.toFixed(3);
    if (stats.p < alpha) {
      return `There is evidence the result is unlikely due to random chance (p = ${pStr} < α = ${alpha}).`;
    }
    return `Not enough evidence to conclude the result is different from chance (p = ${pStr} ≥ α = ${alpha}).`;
  }, [stats, alpha]);

  const expectedWarning = useMemo(() => {
    if (!expectedCounts) return null;
    const low = expectedCounts.some((e) => e < 5);
    return low
      ? "Note: Some expected counts are < 5. χ² is less reliable; consider combining categories if appropriate."
      : null;
  }, [expectedCounts]);

  function updateCat(index: number, patch: Partial<Category>) {
    setCats((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  }

  function addCategory() {
    setCats((prev) => [
      ...prev,
      { name: `Category ${prev.length + 1}`, observed: 0 },
    ]);
    setRatio((prev) => {
      const r = parseRatio(prev);
      if (!r) return prev;
      return [...r, 1].join(":");
    });
  }

  function removeCategory(index: number) {
    if (cats.length <= 2) return;
    setCats((prev) => prev.filter((_, i) => i !== index));
    setRatio((prev) => {
      const r = parseRatio(prev);
      if (!r || r.length !== cats.length) return prev;
      r.splice(index, 1);
      return r.join(":");
    });
  }

  const pageBg = "#f1f5f9"; // softer than pure white
  const cardBg = "#f8fafc"; // subtle off-white
  const border = "#e2e8f0";
  const text = "#334155";
  const heading = "#0f172a";

  const critical = [
    { df: 1, a10: 2.706, a05: 3.841, a01: 6.635 },
    { df: 2, a10: 4.605, a05: 5.991, a01: 9.210 },
    { df: 3, a10: 6.251, a05: 7.815, a01: 11.345 },
    { df: 4, a10: 7.779, a05: 9.488, a01: 13.277 },
    { df: 5, a10: 9.236, a05: 11.070, a01: 15.086 },
    { df: 6, a10: 10.645, a05: 12.592, a01: 16.812 },
  ];

  return (
    <div style={{ background: pageBg, minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: 18,
          fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif",
          color: text,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: heading }}>
          Chi-Square Visual Lab (AP Bio)
        </h1>
        <p style={{ marginTop: 0, color: text }}>
          Enter observed counts and an expected ratio. The chart and table show{" "}
          <b>where χ² comes from</b>.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "360px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Controls */}
          <div
            style={{
              border: `1px solid ${border}`,
              borderRadius: 14,
              padding: 14,
              background: cardBg,
            }}
          >
            <h2 style={{ fontSize: 18, marginTop: 0, color: heading }}>Inputs</h2>

            <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
              Expected ratio
            </label>
            <input
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              placeholder="e.g., 3:1 or 9:3:3:1"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 12,
                border: `1px solid ${border}`,
                background: "white",
              }}
            />

            <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
              <label style={{ fontWeight: 700 }}>α</label>
              <select
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  border: `1px solid ${border}`,
                  background: "white",
                }}
              >
                <option value={0.10}>0.10</option>
                <option value={0.05}>0.05</option>
                <option value={0.01}>0.01</option>
              </select>
              <div style={{ marginLeft: "auto", fontSize: 13, color: text }}>
                Total N = <b style={{ color: heading }}>{totalObserved}</b>
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, color: heading }}>Categories</h3>
              <button
                onClick={addCategory}
                style={{
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: `1px solid ${border}`,
                  cursor: "pointer",
                  background: "white",
                  fontWeight: 700,
                }}
              >
                + Add
              </button>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {cats.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 34px", gap: 8 }}>
                  <input
                    value={c.name}
                    onChange={(e) => updateCat(i, { name: e.target.value })}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: `1px solid ${border}`,
                      background: "white",
                    }}
                  />
                  <input
                    type="number"
                    value={c.observed}
                    onChange={(e) => updateCat(i, { observed: Math.max(0, Number(e.target.value)) })}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      border: `1px solid ${border}`,
                      background: "white",
                    }}
                  />
                  <button
                    onClick={() => removeCategory(i)}
                    title="Remove"
                    style={{
                      padding: "8px 0",
                      borderRadius: 12,
                      border: `1px solid ${border}`,
                      cursor: cats.length <= 2 ? "not-allowed" : "pointer",
                      opacity: cats.length <= 2 ? 0.4 : 1,
                      background: "white",
                      fontWeight: 900,
                      color: "#ef4444",
                    }}
                    disabled={cats.length <= 2}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

      
          {/* Chi-square critical values (moved here) */}
              <div
                style={{
                  border: `1px solid ${border}`,
                  padding: 12,
                  background: cardBg,
                  marginTop: 12,
                  borderRadius: 8,
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 8, color: heading }}>Chi-square critical values (right-tail)</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ textAlign: "left" }}>
                        <th style={{ borderBottom: `1px solid ${border}`, padding: 6 }}>df</th>
                        <th style={{ borderBottom: `1px solid ${border}`, padding: 6 }}>α = 0.10</th>
                        <th style={{ borderBottom: `1px solid ${border}`, padding: 6 }}>α = 0.05</th>
                        <th style={{ borderBottom: `1px solid ${border}`, padding: 6 }}>α = 0.01</th>
                      </tr>
                    </thead>
                    <tbody>
                      {critical.map((r) => (
                        <tr key={r.df}>
                          <td style={{ borderBottom: `1px solid ${border}`, padding: 6 }}>{r.df}</td>
                          <td style={{ borderBottom: `1px solid ${border}`, padding: 6 }}>{r.a10.toFixed(3)}</td>
                          <td style={{ borderBottom: `1px solid ${border}`, padding: 6 }}>{r.a05.toFixed(3)}</td>
                          <td style={{ borderBottom: `1px solid ${border}`, padding: 6 }}>{r.a01.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            <div style={{ marginTop: 14, fontSize: 13, color: text, lineHeight: 1.35 }}>
              <b>AP tip:</b> df = (# categories − 1). A small χ² means observed is close to expected.
            </div>
          </div>

          {/* Visualization + results */}
          <div style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: 14,
                background: cardBg,
              }}
            >
              <h2 style={{ fontSize: 18, marginTop: 0, color: heading }}>Observed vs Expected</h2>
              {!expectedCounts ? (
                <div style={{ color: "#b91c1c", fontWeight: 700 }}>
                  Ratio is invalid or does not match number of categories.
                </div>
              ) : (
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend wrapperStyle={{ color: text }} />
                      <Bar dataKey="Observed" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Expected" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {expectedWarning && (
                <div style={{ marginTop: 8, color: "#92400e", fontWeight: 600 }}>
                  {expectedWarning}
                </div>
              )}
            </div>

            <div
              style={{
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: 14,
                background: cardBg,
              }}
            >
              <h2 style={{ fontSize: 18, marginTop: 0, color: heading }}>χ² Breakdown</h2>
              {!stats ? (
                <div style={{ color: "#b91c1c", fontWeight: 700 }}>
                  Enter a valid ratio to see calculations.
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                    <div>
                      <b style={{ color: heading }}>χ²</b> = {stats.chi2.toFixed(3)}
                    </div>
                    <div>
                      <b style={{ color: heading }}>df</b> = {stats.df}
                    </div>
                    <div>
                      <b style={{ color: heading }}>p</b> ≈ {stats.p.toFixed(3)}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: stats.p < alpha ? "#fee2e2" : "#dcfce7",
                      border: `1px solid ${border}`,
                      marginBottom: 12,
                      color: heading,
                    }}
                  >
                    <b>Decision:</b> {decision}
                  </div>

                  {/* Simple reader-friendly explanation */}
                  <div style={{ marginBottom: 12, fontSize: 14, color: text }}>
                    {stats.p != null && (
                      stats.p < alpha ? (
                        <div>
                          Because the p-value ({stats.p.toFixed(3)}) is less than α ({alpha}), we <b>reject the null hypothesis</b> — the result is unlikely due to chance.
                        </div>
                      ) : (
                        <div>
                          Because the p-value ({stats.p.toFixed(3)}) is greater than or equal to α ({alpha}), we <b>cannot reject the null hypothesis</b> — the result is consistent with chance.
                        </div>
                      )
                    )}
                  </div>

                  {/* (critical table moved to controls) */}

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ textAlign: "left" }}>
                          <th style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>Category</th>
                          <th style={{ borderBottom: `1px solid ${border}`, padding: 8, color: "#7c3aed" }}>Observed (O)</th>
                          <th style={{ borderBottom: `1px solid ${border}`, padding: 8, color: "#2563eb" }}>Expected (E)</th>
                          <th style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>(O−E)²/E</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.contributions.map((row) => (
                          <tr key={row.name}>
                            <td style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>{row.name}</td>
                            <td style={{ borderBottom: `1px solid ${border}`, padding: 8, color: "#7c3aed", fontWeight: 700 }}>{row.O}</td>
                            <td style={{ borderBottom: `1px solid ${border}`, padding: 8, color: "#2563eb", fontWeight: 700 }}>
                              {row.E.toFixed(2)}
                            </td>
                            <td style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>
                              {row.contrib.toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: 10, fontSize: 13, color: text, lineHeight: 1.35 }}>
                    <b>Interpretation:</b> Each category contributes a piece of χ². Big contributions show where your
                    deviation is coming from.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}