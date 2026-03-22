"use client";

import React, { useEffect, useState } from "react";
import { UNITS } from "../shared";

type FrqPart = { label: string; verb: string; prompt: string };
type FrqAnswer = { answer?: string; bullet_points?: string[] };
type FrqQuestion = {
  id?: string;
  topic?: string;
  text?: string;
  parts?: FrqPart[];
  answer_key?: Record<string, FrqAnswer>;
  part_explanations?: Record<string, string>;
  explain?: string;
};

export default function UnitFrqPage() {
  const [unit, setUnit] = useState(UNITS[0]);
  const [question, setQuestion] = useState<FrqQuestion | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  async function nextFrq() {
    setLoadError(null);
    setShowAnswers(false);
    try {
      const res = await fetch(`/api/frq-question?mode=unit&unit=${encodeURIComponent(unit)}`);
      const data = await res.json();
      if (data?.question) {
        setQuestion(data.question);
        return;
      }
      setQuestion(null);
      setLoadError("No FRQs are available for this unit yet.");
    } catch {
      setQuestion(null);
      setLoadError("Unable to load FRQs right now. Please try again.");
    }
  }

  useEffect(() => {
    void nextFrq();
  }, [unit]);

  return (
    <div style={{ padding: 18, width: "100%", fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Unit Specific FRQ's(BEST)</h1>
      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 700 }}>Unit</label>
          <div style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 12, background: "white" }}>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ padding: 6, border: "none", background: "transparent" }}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 12, background: "white" }}>
          <button onClick={() => { void nextFrq(); }} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent" }}>
            New FRQ
          </button>
        </div>

        {question && (
          <div style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 12, background: "white" }}>
            <button onClick={() => setShowAnswers((s) => !s)} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent" }}>
              {showAnswers ? "Hide Rubric" : "Show Rubric"}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        {!question && <div style={{ color: "#475569" }}>{loadError || "Loading FRQ..."}</div>}
        {question && (
          <div style={{ border: "1px solid #e2e8f0", padding: 12, width: "100%" }}>
            {question.topic && <div style={{ marginBottom: 8, color: "#334155", fontWeight: 700 }}>Topic: {question.topic}</div>}
            <div style={{ fontWeight: 800 }}>{question.text}</div>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {(question.parts || []).map((part) => {
                const partKey = part.label?.toLowerCase?.() || "";
                const key = question.answer_key?.[partKey];
                const partExplain = question.part_explanations?.[partKey];
                return (
                  <div key={part.label} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#ffffff" }}>
                    <div style={{ fontWeight: 800 }}>
                      {part.label}) {part.verb}: {part.prompt}
                    </div>
                    {showAnswers && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #cbd5e1" }}>
                        {key?.answer && <div style={{ color: "#0f172a" }}>{key.answer}</div>}
                        {!!key?.bullet_points?.length && (
                          <ul style={{ margin: "8px 0 0 18px", color: "#334155" }}>
                            {key.bullet_points.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}
                        {partExplain && <div style={{ marginTop: 8, color: "#475569" }}>Scoring note: {partExplain}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {showAnswers && question.explain && (
              <div style={{ marginTop: 12, padding: 10, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}>
                <span style={{ fontWeight: 800 }}>Teacher note:</span> {question.explain}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
