"use client";

import React, { useEffect, useState } from "react";

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

export default function AllUnitFrqPage() {
  const [difficulty, setDifficulty] = useState("AP Style");
  const [question, setQuestion] = useState<FrqQuestion | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revealedParts, setRevealedParts] = useState<Record<string, boolean>>({});

  async function nextFrq() {
    setLoadError(null);
    setRevealedParts({});
    try {
      const diffParam = difficulty === "AP Style" ? "ap" : "active-recall";
      const res = await fetch(`/api/frq-question?mode=all&difficulty=${encodeURIComponent(diffParam)}`);
      const data = await res.json();
      if (data?.question) {
        setQuestion(data.question);
        return;
      }
      setQuestion(null);
      setLoadError("No FRQs are available yet.");
    } catch {
      setQuestion(null);
      setLoadError("Unable to load FRQs right now. Please try again.");
    }
  }

  useEffect(() => {
    void nextFrq();
  }, [difficulty]);

  return (
    <div style={{ padding: 18, width: "100%", fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>All Unit FRQ's</h1>

      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 700 }}>Difficulty</label>
          <div style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 12, background: "white" }}>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ padding: 6, border: "none", background: "transparent" }}>
              <option value="AP Style">AP Style</option>
              <option value="Active Recall">Active Recall</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {!question && <div style={{ color: "#475569" }}>{loadError || "Loading FRQ..."}</div>}
        {question && (
          <div style={{ border: "1px solid #e2e8f0", padding: 12, width: "100%" }}>
            {question.topic && <div style={{ marginBottom: 8, color: "#334155", fontWeight: 700 }}>Topic: {question.topic}</div>}
            <div style={{ fontWeight: 800 }}>{question.text}</div>
            
            {/* Handle FRQ with parts */}
            {question.parts && question.parts.length > 0 && (
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {question.parts.map((part) => {
                  const partKey = part.label?.toLowerCase?.() || "";
                  const key = question.answer_key?.[partKey];
                  const partExplain = question.part_explanations?.[partKey];
                  const isRevealed = revealedParts[partKey];
                  return (
                    <div key={part.label} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#ffffff" }}>
                      <div style={{ fontWeight: 800 }}>
                        {part.label}) {part.prompt}
                      </div>
                      {isRevealed && (
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
                      <div style={{ marginTop: 8, paddingTop: 8 }}>
                        <button
                          onClick={() => setRevealedParts((prev) => ({ ...prev, [partKey]: !prev[partKey] }))}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            background: isRevealed ? "#fee2e2" : "#f1f5f9",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            color: isRevealed ? "#7f1d1d" : "#334155"
                          }}
                        >
                          {isRevealed ? "Hide" : "Show answer and explanation"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Handle simple Active Recall Q&A */}
            {(!question.parts || question.parts.length === 0) && (
              <div style={{ marginTop: 12 }}>
                {revealedParts["answer"] && (
                  <div style={{ marginTop: 8, padding: 10, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}>
                    <span style={{ fontWeight: 800 }}>Answer:</span> {question.explain}
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => setRevealedParts((prev) => ({ ...prev, answer: !prev["answer"] }))}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      background: revealedParts["answer"] ? "#fee2e2" : "#f1f5f9",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: revealedParts["answer"] ? "#7f1d1d" : "#334155"
                    }}
                  >
                    {revealedParts["answer"] ? "Hide answer" : "Show answer"}
                  </button>
                </div>
              </div>
            )}

            {Object.values(revealedParts).some((v) => v) && question.explain && question.parts && question.parts.length > 0 && (
              <div style={{ marginTop: 12, padding: 10, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}>
                <span style={{ fontWeight: 800 }}>Teacher note:</span> {question.explain}
              </div>
            )}
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <div style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 12, background: "white" }}>
                <button onClick={() => void nextFrq()} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontWeight: 600 }}>
                  Next question
                </button>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: "#fefce8", border: "1px solid #fde047", borderRadius: 10, color: "#713f12", fontSize: 14 }}>
              <span style={{ fontWeight: 800 }}>Padilla tip</span> — When you practice the FRQ questions, try to either write your answers down or say them out loud rather than just answering them in your head.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
