"use client";

import React, { useEffect, useState } from "react";

export default function Page() {
  const [difficulty, setDifficulty] = useState("easy");
  const [question, setQuestion] = useState<any | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [crossedOut, setCrossedOut] = useState<Record<number, boolean>>({});
  const [visibleExplanations, setVisibleExplanations] = useState<Record<number, boolean>>({});
  const [seen, setSeen] = useState<Record<string, Record<string, true>>>({});
  const [poolSize, setPoolSize] = useState<number>(0);
  const STORAGE_KEY = "ar-seen";

  const pageBg = "#f1f5f9";
  const cardBg = "#f8fafc";
  const border = "#e2e8f0";
  const text = "#334155";
  const heading = "#0f172a";
  const frqPlaceholder = "FRQ mode is coming soon. This is a placeholder for now.";

  async function next(attempt = 0) {
    setQuestion(null);
    setSelected(null);
    setCrossedOut({});
    setVisibleExplanations({});
    setLoadError(null);
    if (difficulty === "frq") {
      setPoolSize(0);
      setLoadError(frqPlaceholder);
      return;
    }
    const MAX_ATTEMPTS = 6;
    const scopeKey = `AP::${difficulty}`;
    const scopeSeen = (seen && seen[scopeKey]) || {};
    const scopeSeenCount = Object.keys(scopeSeen).length;
    const mustAvoidSeen = poolSize > 0 && scopeSeenCount < poolSize;
    try {
      const res = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'ap', difficulty }),
      });
      const data = await res.json();
      if (data?.question) {
        const q = data.question;
        if (q.id && scopeSeen[q.id] && mustAvoidSeen) {
          if (attempt < MAX_ATTEMPTS) return next(attempt + 1);
          setSeen((s) => ({ ...s, [scopeKey]: {} }));
        }
        if (q.id) setSeen((s) => ({ ...s, [scopeKey]: { ...(s[scopeKey] || {}), [q.id]: true } }));
        try { const { ensureChoiceExplanations } = await import("../shared"); setQuestion(ensureChoiceExplanations(q)); } catch (e) { setQuestion(q); }
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

    setLoadError("No fixed questions are available for this difficulty yet.");
  }

  useEffect(() => {
    // generate first question on load
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const scopeKey = `AP::${difficulty}`;
        const isFlat = Object.values(parsed).every((v: any) => v === true || v === false);
        if (isFlat) {
          setSeen({ [scopeKey]: parsed });
        } else {
          setSeen(parsed);
        }
      }
    } catch (e) {}
    (async () => {
      if (difficulty === "frq") {
        setPoolSize(0);
        setLoadError(frqPlaceholder);
        return;
      }
      try {
        const res = await fetch(`/api/ar-pool?mode=ap&difficulty=${encodeURIComponent(difficulty)}`);
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
    (async () => {
      if (difficulty === "frq") {
        setPoolSize(0);
        setQuestion(null);
        setSelected(null);
        setCrossedOut({});
        setVisibleExplanations({});
        setLoadError(frqPlaceholder);
        return;
      }
      try {
        const res = await fetch(`/api/ar-pool?mode=ap&difficulty=${encodeURIComponent(difficulty)}`);
        const data = await res.json();
        setPoolSize(data?.size || 0);
      } catch (e) {
        setPoolSize(0);
      }
      next();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seen)); } catch (e) {}
  }, [seen]);

  return (
    <div style={{ padding: 18, width: "100%", fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif", color: text }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: heading }}>All Unit MCQ's</h1>

      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontWeight: 700 }}>Difficulty</label>
          <div style={{ padding: 6, border: `1px solid ${border}`, borderRadius: 12, background: "white" }}>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ padding: 6, border: "none", background: "transparent" }}>
              <option value="easy">Easy (definitions)</option>
              <option value="hard">Hard (application)</option>
              <option value="analysis">Analysis (experiment/system)</option>
              <option value="frq">FRQ (placeholder)</option>
            </select>
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ padding: 6, border: `1px solid ${border}`, borderRadius: 12, background: "white" }}>
            <button onClick={() => { void next(); }} style={{ padding: "8px 12px", borderRadius: 12, border: `none`, background: "transparent", fontWeight: 700 }}>New question</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {!question && <div style={{ color: "#475569" }}>{loadError || "Loading question..."}</div>}
        {question && (
          <div style={{ border: `1px solid ${border}`, padding: 14, borderRadius: 0, background: cardBg, width: "100%" }}>
              {question.experiment && (
                <div style={{ marginBottom: 10, background: '#ffffff', padding: 10, borderRadius: 8, border: `1px solid ${border}` }}>
                  <div style={{ fontWeight: 700 }}>Experiment</div>
                  <div style={{ marginTop: 6 }}>{question.experiment}</div>
                </div>
              )}
              <div style={{ fontWeight: 800, color: heading }}>{question.text}</div>
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
                        : "white"
                    : "white";
                  const bdr = selected !== null
                    ? isCorrectChoice
                      ? `1px solid #16a34a`
                      : isWrongSelected
                        ? `1px solid #ef4444`
                        : `1px solid ${border}`
                    : `1px solid ${border}`;

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
                          style={{ textAlign: "left", padding: 10, borderRadius: 12, border: bdr, background: bg, flex: 1, textDecoration: crossedOut[i] ? "line-through" : "none", opacity: crossedOut[i] ? 0.55 : 1 }}
                        >
                          {String.fromCharCode(65 + i)}. {c}
                        </button>
                        <button
                          onClick={() => setCrossedOut((s) => ({ ...s, [i]: !s[i] }))}
                          aria-label={crossedOut[i] ? "Uncross option" : "Cross out option"}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            border: `1px solid ${crossedOut[i] ? "#fca5a5" : border}`,
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
                              padding: "10px 12px",
                              borderRadius: 12,
                              border: `1px solid ${visibleExplanations[i] ? "#93c5fd" : border}`,
                              background: visibleExplanations[i] ? "#dbeafe" : "white",
                              color: "#0f172a",
                            }}
                          >
                            Explanation
                          </button>
                        )}
                      </div>

                      {visibleExplanations[i] && selected !== null && (
                        <div style={{ marginTop: 6, padding: 8, background: "#f8fafc", borderRadius: 6, border: `1px solid ${border}`, color: i === question.correct ? "#064e3b" : "#334155" }}>
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
                  <div style={{ marginTop: 6 }}>{/* individual choice explanations shown above */}</div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ padding: 6, border: `1px solid ${border}`, borderRadius: 12, background: "white", display: "inline-block" }}>
                      <button onClick={() => { void next(); }} style={{ padding: 10, borderRadius: 12, border: `none`, background: "transparent" }}>Next</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
        )}
        <div style={{ marginTop: 16, padding: 12, background: "#fefce8", border: "1px solid #fde047", borderRadius: 10, color: "#713f12", fontSize: 14 }}>
          <span style={{ fontWeight: 800 }}>Padilla tip</span> — If there are any vocabulary words that you are unfamiliar with, Google them! It will help you understand the biological system better and makes sure it doesn&#39;t come back to haunt you on the exam.
        </div>
      </div>
    </div>
  );
}
