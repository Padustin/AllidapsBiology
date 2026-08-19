
import Link from "next/link";

const MATH_FONT = '"Cambria Math", "Times New Roman", serif';

function Fraction({ numerator, denominator, borderColor, compact = false }: { numerator: React.ReactNode; denominator: React.ReactNode; borderColor: string; compact?: boolean }) {
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
        verticalAlign: "middle",
      }}
    >
      <span style={{ padding: compact ? "0 4px" : "0 6px" }}>{numerator}</span>
      <span style={{ width: "100%", borderTop: `${compact ? 1 : 2}px solid ${borderColor}`, margin: compact ? "1px 0" : "2px 0" }} />
      <span style={{ padding: compact ? "0 4px" : "0 6px" }}>{denominator}</span>
    </span>
  );
}

export default function Page() {
  const border = "var(--border)";
  const cardBg = "var(--surface-muted)";
  const text = "var(--ink-muted)";
  const heading = "var(--ink)";

  // Simple coin toss example (more intuitive than genetic ratios)
  const O = [60, 40]; // Heads, Tails
  const labels = ["Heads", "Tails"];
  const total = O[0] + O[1];
  const E = [0.5 * total, 0.5 * total];
  const contrib = O.map((o, i) => ((o - E[i]) ** 2) / E[i]);
  const chi2 = contrib.reduce((a, b) => a + b, 0);
  const df = labels.length - 1;

  return (
    <div className="study-screen" style={{ display: "grid", gap: 16, color: text }}>
      <div style={{ border: `1px solid ${border}`, borderRadius: 12, padding: 14, background: cardBg }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: heading, fontFamily: "var(--font-serif)" }} className="text-[clamp(1.5rem,3.4vw,1.75rem)]">
          Chi-square concept guide
        </h1>
        <p style={{ marginTop: 10, lineHeight: 1.45 }}>
          Use this as the chi-square-specific companion to the AP Bio Math &amp; Stats Center. Chi-square (χ²) tests whether observed counts differ from expected counts more than you'd expect by chance.
        </p>
        <Link
          href="/sims/chi-square"
          style={{ display: "inline-flex", marginTop: 10, color: "var(--brand-dark)", fontWeight: 600, textDecoration: "none" }}
        >
          ← Back to the quantitative center
        </Link>
      </div>

      <div style={{ border: `1px solid ${border}`, borderRadius: 12, padding: 14, background: cardBg }}>
        <h2 style={{ marginTop: 0, color: heading }}>Important definitions to understand</h2>
        <ul style={{ lineHeight: 1.55 }}>
          <li><b>Null hypothesis (H₀):</b> a hypothesis that states that the variables (or things being changed in an experiment) will not result in a real difference; deviations are due to random chance.</li>
          <li><b>Observed (O):</b> what you actually counted.</li>
          <li><b>Expected (E):</b> the counts you'd expect if H₀ were true.</li>
          <li>
            <b>χ² statistic:</b> sum of{" "}
            <Fraction numerator="(O−E)²" denominator="E" borderColor={heading} compact />
            {" "}across categories; larger values mean observed counts are farther from expectations.
          </li>
          <li><b>Degrees of freedom (df):</b> number of categories − 1.</li>
          <li><b>p-value:</b> probability of seeing data as extreme as yours if H₀ is true.</li>
        </ul>
      </div>

      <div style={{ border: `1px solid ${border}`, borderRadius: 12, padding: 14, background: cardBg }}>
        <h2 style={{ marginTop: 0, color: heading }}>The formula</h2>
        <div
          style={{
            border: `1px solid ${border}`,
            borderRadius: 10,
            padding: 12,
            background: "var(--surface)",
            fontFamily: MATH_FONT,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span>χ² = Σ</span>
          <Fraction numerator="(O − E)²" denominator="E" borderColor={heading} />
        </div>
        <p style={{ marginTop: 10 }}>Compute each category's contribution using the fraction above, then add them.</p>
      </div>

      <div style={{ border: `1px solid ${border}`, borderRadius: 12, padding: 14, background: cardBg }}>
        <h2 style={{ marginTop: 0, color: heading }}>Simple example — coin toss</h2>
        <p>Suppose you expect a fair coin (50/50) but observe 60 heads and 40 tails (N = 100).</p>

        <div className="grid gap-3 md:grid-cols-2" style={{ display: "grid", gap: 12 }}>
          <div style={{ border: `1px solid ${border}`, borderRadius: 10, padding: 12, background: "var(--surface)" }}>
            <div style={{ fontWeight: 700, color: heading, marginBottom: 6 }}>Observed</div>
            {O.map((v, i) => (
              <div key={i}>{labels[i]}: <b>{v}</b></div>
            ))}
            <div style={{ marginTop: 6 }}>Total N: <b>{total}</b></div>
          </div>

          <div style={{ border: `1px solid ${border}`, borderRadius: 10, padding: 12, background: "var(--surface)" }}>
            <div style={{ fontWeight: 700, color: heading, marginBottom: 6 }}>Expected (50:50)</div>
            {E.map((v, i) => (
              <div key={i}>{labels[i]}: <b>{v.toFixed(0)}</b></div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12, border: `1px solid ${border}`, borderRadius: 10, padding: 12, background: "var(--surface)" }}>
          <div style={{ fontWeight: 700, color: heading, marginBottom: 8 }}>Compute χ² contributions</div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>Category</th>
                  <th style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>O</th>
                  <th style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>E</th>
                  <th style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>
                    <Fraction numerator="(O−E)²" denominator="E" borderColor={heading} compact />
                  </th>
                </tr>
              </thead>
              <tbody>
                {O.map((o, i) => (
                  <tr key={i}>
                    <td style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>{labels[i]}</td>
                    <td style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>{o}</td>
                    <td style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>{E[i].toFixed(0)}</td>
                    <td style={{ borderBottom: `1px solid ${border}`, padding: 8 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <Fraction numerator={`(${o}−${E[i].toFixed(0)})²`} denominator={E[i].toFixed(0)} borderColor={heading} compact />
                        <span>= {contrib[i].toFixed(3)}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 10, fontSize: 16 }}>
            <b style={{ color: heading }}>χ² ≈ {chi2.toFixed(3)}</b> — with df = <b>{df}</b>
          </div>
          <div style={{ marginTop: 6, fontSize: 14 }}>
            A larger χ² means observed counts are farther from expected; compare to a table or compute a p-value to decide.
          </div>
        </div>
        
        <div style={{ border: `1px solid ${border}`, borderRadius: 12, padding: 14, background: "var(--surface)" }}>
          <h3 style={{ marginTop: 0, color: heading }}>Relating these definitions to the coin toss example</h3>
          <ul style={{ lineHeight: 1.5 }}>
            <li><b>Null hypothesis (H₀):</b> a hypothesis that states that the variables (or things being changed in an experiment) will not result in a real difference; deviations are due to random chance. For the coin toss example H₀ is: the coin is fair (50/50).</li>
            <li><b>Observed (O):</b> 60 heads, 40 tails — these are the counts you actually recorded.</li>
            <li><b>Expected (E):</b> 50 heads, 50 tails if the coin is fair.</li>
            <li><b>χ²:</b> computes how far 60/40 is from 50/50 by summing <Fraction numerator="(O−E)²" denominator="E" borderColor={heading} compact /> for heads and tails.</li>
            <li><b>df:</b> categories − 1 = 1 for a two-outcome coin toss.</li>
            <li><b>p-value:</b> the probability of seeing a 60/40 (or more extreme) result if the coin is fair; a small p suggests the coin may not be fair.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}