"use client";

import Link from "next/link";

export default function ActiveRecallPage() {
  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 12, fontSize: 30, fontWeight: 900, color: "#0f172a" }}>Active Recall</h1>
      <p style={{ marginBottom: 16, color: "#334155" }}>Choose how you want to practice.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          href="/sims/active-recall/ap"
          style={{
            border: "1px solid #1d4ed8",
            background: "#2563eb",
            color: "#ffffff",
            borderRadius: 10,
            padding: "10px 14px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          All Unit MCQ's
        </Link>
        <Link
          href="/sims/active-recall/unit"
          style={{
            border: "1px solid #94a3b8",
            background: "#ffffff",
            color: "#0f172a",
            borderRadius: 10,
            padding: "10px 14px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Unit Specific MCQ's
        </Link>
        <Link
          href="/sims/active-recall/frq-all"
          style={{
            border: "1px solid #0f766e",
            background: "#0d9488",
            color: "#ffffff",
            borderRadius: 10,
            padding: "10px 14px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          All Unit FRQ's
        </Link>
        <Link
          href="/sims/active-recall/frq-unit"
          style={{
            border: "1px solid #a16207",
            background: "#fef3c7",
            color: "#78350f",
            borderRadius: 10,
            padding: "10px 14px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Unit Specific FRQ's(BEST)
        </Link>
      </div>
    </main>
  );
}