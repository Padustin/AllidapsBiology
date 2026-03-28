"use client";

import React, { useEffect, useState } from "react";
import { UNITS } from "../shared";

export default function Page() {
  const [difficulty, setDifficulty] = useState("");
  const [unit, setUnit] = useState("");
  const [question, setQuestion] = useState<any | null>(null);
  const [previousQuestions, setPreviousQuestions] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [crossedOut, setCrossedOut] = useState<Record<number, boolean>>({});
  const [visibleExplanations, setVisibleExplanations] = useState<Record<number, boolean>>({});
  const [seen, setSeen] = useState<Record<string, Record<string, true>>>({});
  const [poolSize, setPoolSize] = useState<number>(0);
  const STORAGE_KEY = "ar-seen";

  async function next(attempt = 0) {
    const currentQuestion = question;
    if (!unit || !difficulty) {
      setQuestion(null);
      setSelected(null);
      setCrossedOut({});
      setVisibleExplanations({});
      setLoadError("Select a unit and difficulty first to begin.");
      return;
    }
    setQuestion(null);
    setSelected(null);
    setCrossedOut({});
    setVisibleExplanations({});
    setLoadError(null);
    const MAX_ATTEMPTS = 6;
    const scopeKey = `${unit}::${difficulty}`;
    const scopeSeen = (seen && seen[scopeKey]) || {};
    const scopeSeenCount = Object.keys(scopeSeen).length;
    const mustAvoidSeen = poolSize > 0 && scopeSeenCount < poolSize;
    try {
      const res = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'unit', unit, difficulty }),
      });
      const data = await res.json();
      if (data?.question) {
        const q = data.question;
        if (q.id && scopeSeen[q.id] && mustAvoidSeen) {
          if (attempt < MAX_ATTEMPTS) return next(attempt + 1);
          setSeen((s) => ({ ...s, [scopeKey]: {} }));
        }
        if (q.id) setSeen((s) => ({ ...s, [scopeKey]: { ...(s[scopeKey] || {}), [q.id]: true } }));
        if (currentQuestion) setPreviousQuestions((prev) => [...prev, currentQuestion]);
        // ensure per-choice explanations
        try { const mod = (await import("../shared")).ensureChoiceExplanations; setQuestion(mod(q)); } catch (e) { setQuestion(q); }
        return;
      }
    } catch (e) {
      setLoadError("Unable to load questions right now. Please try again.");
      return;
    }

    if (poolSize > 0) {
      if (attempt < MAX_ATTEMPTS) return next(attempt + 1);
      setSeen((s) => ({ ...s, [scopeKey]: {} }));
      setLoadError("You have completed this set for now. A fresh round will start automatically.");
      return;
    }

    setLoadError("No fixed questions are available for this unit and difficulty yet.");
  }

  function previous() {
    setLoadError(null);
    setSelected(null);
    setCrossedOut({});
    setVisibleExplanations({});
    setPreviousQuestions((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setQuestion(last);
      return prev.slice(0, -1);
    });
  }

  useEffect(() => {
    // load seen map from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // migrate older flat format (id: true) into scoped format under current scope
        const scopeKey = `${unit}::${difficulty}`;
        const isFlat = Object.values(parsed).every((v: any) => v === true || v === false);
        if (isFlat) {
          setSeen({ [scopeKey]: parsed });
        } else {
          setSeen(parsed);
        }
      }
    } catch (e) {}
    // fetch pool for current scope, then request first question
    (async () => {
      try {
        const res = await fetch(`/api/ar-pool?mode=unit&unit=${encodeURIComponent(unit)}&difficulty=${encodeURIComponent(difficulty)}`);
        const data = await res.json();
        setPoolSize(data?.size || 0);
      } catch (e) {
        setPoolSize(0);
      }
      next();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!unit || !difficulty) {
      setPoolSize(0);
      setPreviousQuestions([]);
      setQuestion(null);
      setSelected(null);
      setCrossedOut({});
      setVisibleExplanations({});
      setLoadError("Select a unit and difficulty first to begin.");
      return;
    }
    // when unit or difficulty changes, refresh pool and load a fresh question
    (async () => {
      setPreviousQuestions([]);
      try {
        const res = await fetch(`/api/ar-pool?mode=unit&unit=${encodeURIComponent(unit)}&difficulty=${encodeURIComponent(difficulty)}`);
        const data = await res.json();
        setPoolSize(data?.size || 0);
      } catch (e) {
        setPoolSize(0);
      }
      next();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, difficulty]);

  // persist seen into localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seen)); } catch (e) {}
  }, [seen]);

  return (
    <div className="study-screen" style={{ padding: 18, width: "100%", fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Unit MCQ Review</h1>
      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 700 }}>Difficulty</label>
          <div style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 12, background: "white" }}>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ padding: 6, border: "none", background: "transparent" }}>
              <option value="" disabled>Select difficulty...</option>
              <option value="easy">Easy (definitions)</option>
              <option value="hard">Hard (application)</option>
              <option value="analysis">Analysis (experiment/system)</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 700 }}>Unit</label>
          <div style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 12, background: "white" }}>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ padding: 6, border: "none", background: "transparent" }}>
              <option value="" disabled>Select a unit...</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 12, background: "white" }}>
            <button onClick={previous} disabled={previousQuestions.length === 0} style={{ padding: "8px 12px", borderRadius: 8, background: "transparent", border: "none", opacity: previousQuestions.length > 0 ? 1 : 0.45, cursor: previousQuestions.length > 0 ? "pointer" : "not-allowed" }}>Previous question</button>
          </div>
          <div style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 12, background: "white" }}>
            <button onClick={() => { void next(); }} disabled={!unit || !difficulty} style={{ padding: "8px 12px", borderRadius: 8, background: "transparent", border: "none", opacity: unit && difficulty ? 1 : 0.45, cursor: unit && difficulty ? "pointer" : "not-allowed" }}>Load new question</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {!question && <div style={{ color: "#475569" }}>{loadError || "Click \"New question\" to begin."}</div>}
        {question && (
          <div className="soft-card" style={{ border: "1px solid #e2e8f0", padding: 12, borderRadius: 16, width: "100%" }}>
              {question.experiment && (
                <div style={{ marginBottom: 10, background: '#fff', padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700 }}>Experiment</div>
                  <div style={{ marginTop: 6 }}>{question.experiment}</div>
                </div>
              )}
              <div style={{ fontWeight: 800 }}>{question.text}</div>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {question.choices.map((c: string, i: number) => {
                  const isSelected = selected === i;
                  const isDisabled = selected !== null;
                  const isCorrectChoice = i === question.correct;
                  const isWrongSelected = selected === i && i !== question.correct;
                  const bg = selected !== null
                    ? isCorrectChoice
                      ? "#dcfce7"
                      : isWrongSelected
                        ? "#fee2e2"
                        : "#fff"
                    : "#fff";
                  const choiceBorder = selected !== null
                    ? isCorrectChoice
                      ? "1px solid #16a34a"
                      : isWrongSelected
                        ? "1px solid #ef4444"
                        : "1px solid #e2e8f0"
                    : "1px solid #e2e8f0";

                  function choiceExplain(idx: number) {
                    if (question.choice_explanations && question.choice_explanations[idx]) return question.choice_explanations[idx];
                    if (idx === question.correct) return question.explain || "Correct option.";
                    return "Incorrect. This option is not the best choice.";
                  }

                  return (
                    <div key={i}>
                      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                        <button
                          onClick={() => {
                            setSelected(i);
                            setVisibleExplanations({ [i]: true });
                          }}
                          disabled={isDisabled}
                          style={{ textAlign: "left", padding: 8, borderRadius: 8, border: choiceBorder, background: bg, flex: 1, textDecoration: crossedOut[i] ? "line-through" : "none", opacity: crossedOut[i] ? 0.55 : 1 }}
                        >
                          {String.fromCharCode(65 + i)}. {c}
                        </button>
                        <button
                          onClick={() => setCrossedOut((s) => ({ ...s, [i]: !s[i] }))}
                          aria-label={crossedOut[i] ? "Uncross option" : "Cross out option"}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 999,
                            border: `1px solid ${crossedOut[i] ? "#fca5a5" : "#e2e8f0"}`,
                            background: crossedOut[i] ? "#fee2e2" : "white",
                            color: "#0f172a",
                            fontWeight: 800,
                            lineHeight: 1,
                          }}
                        >
                          X
                        </button>
                        {selected !== null && (
                          <button
                            onClick={() => setVisibleExplanations((s) => ({ ...s, [i]: !s[i] }))}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: `1px solid ${visibleExplanations[i] ? "#93c5fd" : "#e2e8f0"}`,
                              background: visibleExplanations[i] ? "#dbeafe" : "white",
                              color: "#0f172a",
                            }}
                          >
                            Explanation
                          </button>
                        )}
                      </div>

                      {visibleExplanations[i] && selected !== null && (
                        <div style={{ marginTop: 6, padding: 8, background: "#f8fafc", borderRadius: 6, border: "1px solid #e6eef6", color: i === question.correct ? "#064e3b" : "#334155" }}>
                          {choiceExplain(i)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selected !== null && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 800 }}>{selected === question.correct ? "Correct" : "Incorrect"}</div>
                  <div style={{ marginTop: 6 }}>{/* summary explanation shown above per-choice when available */}</div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 12, background: "white", display: "inline-block" }}>
                      <button onClick={() => { void next(); }} style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent" }}>Next</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
        )}
        <div className="tip-card" style={{ marginTop: 16, padding: 12, background: "#fefce8", border: "1px solid #fde047", borderRadius: 10, color: "#713f12", fontSize: 14 }}>
          <span style={{ fontWeight: 800 }}>Padilla tip</span> — If there are any vocabulary words that you are unfamiliar with, Google them! It will help you understand the biological system better and makes sure it doesn&#39;t come back to haunt you on the exam.
        </div>
      </div>
    </div>
  );
}
