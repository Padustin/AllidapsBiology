"use client";

import { useEffect, useState } from "react";
import {
  EmptyState,
  ModeBadge,
  PrimaryLink,
  SectionCard,
  SecondaryLink,
  StatCard,
  SurfaceItem,
  SurfaceList,
} from "../../components/ui/study-kit";
import { readStudyProgressSnapshot, STUDY_PROGRESS_EVENT, type AccuracyRow, type StudyProgressSnapshot } from "./progress";

function formatPercent(value: number | null) {
  if (value === null) return "No data";
  return `${Math.round(value * 100)}%`;
}

function formatBreakdownLabel(label: string) {
  return label.replace(/\s*\([^)]*\)$/, "");
}

function getBreakdownTone(label: string) {
  const formatted = formatBreakdownLabel(label);
  if (formatted === "Foundation") return "amber" as const;
  if (formatted === "AP-Style") return "blue" as const;
  if (formatted === "Experiment") return "teal" as const;
  return "neutral" as const;
}

function getUnitExtremes(rows: AccuracyRow[]) {
  const attemptedRows = rows.filter((row) => row.total > 0 && row.accuracy !== null);
  if (attemptedRows.length === 0) {
    return { bestUnit: null, worstUnit: null } as const;
  }

  const bestUnit = [...attemptedRows].sort((left, right) => {
    const accuracyDiff = (right.accuracy ?? -1) - (left.accuracy ?? -1);
    if (accuracyDiff !== 0) return accuracyDiff;
    if (right.total !== left.total) return right.total - left.total;
    return left.label.localeCompare(right.label);
  })[0];

  const worstUnit = [...attemptedRows].sort((left, right) => {
    const accuracyDiff = (left.accuracy ?? 2) - (right.accuracy ?? 2);
    if (accuracyDiff !== 0) return accuracyDiff;
    if (right.total !== left.total) return right.total - left.total;
    return left.label.localeCompare(right.label);
  })[0];

  return { bestUnit, worstUnit };
}

function UnitAccuracyList({ rows, breakdownByUnit }: { rows: AccuracyRow[]; breakdownByUnit: Record<string, AccuracyRow[]> }) {
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <div key={row.label} className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-slate-900">{row.label}</p>
              <p className="text-xs text-slate-500">{row.total > 0 ? `${row.correct}/${row.total} correct` : "No attempts yet"}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-sm font-bold text-slate-900">{formatPercent(row.accuracy)}</p>
              <button
                onClick={() => setExpandedUnits((current) => ({ ...current, [row.label]: !current[row.label] }))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {expandedUnits[row.label] ? "Hide Breakdown" : "Show Breakdown"}
              </button>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div
              className="accent-gradient h-2 rounded-full transition-all"
              style={{ width: `${Math.max(6, Math.round((row.accuracy || 0) * 100))}%`, opacity: row.total > 0 ? 1 : 0.25 }}
            />
          </div>
          {expandedUnits[row.label] && (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {(breakdownByUnit[row.label] || []).map((difficultyRow) => (
                <div key={`${row.label}-${difficultyRow.label}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-sm">
                  <ModeBadge label={formatBreakdownLabel(difficultyRow.label)} tone={getBreakdownTone(difficultyRow.label)} />
                  <p className="mt-3 text-xl font-extrabold text-slate-900">{formatPercent(difficultyRow.accuracy)}</p>
                  <p className="mt-1 text-xs text-slate-500">{difficultyRow.total > 0 ? `${difficultyRow.correct}/${difficultyRow.total} correct` : "No attempts yet"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ProgressDashboard() {
  const [snapshot, setSnapshot] = useState<StudyProgressSnapshot>(() => readStudyProgressSnapshot());
  const { bestUnit, worstUnit } = getUnitExtremes(snapshot.accuracyByUnit);

  useEffect(() => {
    const refresh = () => setSnapshot(readStudyProgressSnapshot());
    refresh();
    window.addEventListener(STUDY_PROGRESS_EVENT, refresh as EventListener);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STUDY_PROGRESS_EVENT, refresh as EventListener);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (snapshot.totalAttempts === 0) {
    return (
      <EmptyState
        title="Your dashboard fills in as soon as you start answering questions."
        description="Use the progress view to see which units keep slipping, which topics you are repeatedly missing, and whether your work is staying in Foundation mode for too long."
        action={<PrimaryLink href="/sims/active-recall/unit">Start with unit review</PrimaryLink>}
        secondaryAction={<SecondaryLink href="/sims/active-recall/ap">Try mixed AP review</SecondaryLink>}
        preview={
          <div className="grid gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">What will appear here</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Overall accuracy, current streak, redo queue, unit-by-unit accuracy, and the topics you keep missing.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Best workflow</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Use unit MCQs for repair, mixed review for pressure, then FRQs when recall needs to survive in writing.</p>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="grid gap-4">
        <SectionCard tone="blue">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-300 bg-slate-100 px-4 py-4 shadow-sm">
              <span className="accent-gradient inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                Best unit
              </span>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{bestUnit ? bestUnit.label : "No data yet"}</div>
              <div className="mt-1 text-sm text-slate-600">{bestUnit ? `${formatPercent(bestUnit.accuracy)} accuracy` : "Answer questions to rank units."}</div>
            </div>
            <div className="rounded-3xl border border-slate-300 bg-slate-100 px-4 py-4 shadow-sm">
              <span className="accent-gradient inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                Weakest unit
              </span>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{worstUnit ? worstUnit.label : "No data yet"}</div>
              <div className="mt-1 text-sm text-slate-600">{worstUnit ? `${formatPercent(worstUnit.accuracy)} accuracy` : "Answer questions to rank units."}</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Accuracy by unit"
          description="Use each unit's breakdown to see whether misses are happening in Foundation, AP-Style, or Experiment questions."
          tone="slate"
        >
          <UnitAccuracyList rows={snapshot.accuracyByUnit} breakdownByUnit={snapshot.accuracyByUnitDifficulty} />
        </SectionCard>
      </div>

      <div className="grid gap-4">
        <SectionCard
          title="Topics you keep missing"
          description="These are the content areas where misses are stacking up fastest so you know what to repair next."
          tone="amber"
        >
          {snapshot.weakTopics.length === 0 ? (
            <SurfaceItem>
              <p className="text-sm leading-6 text-slate-600">No weak topics yet. As soon as misses cluster around a concept, it will show up here.</p>
            </SurfaceItem>
          ) : (
            <SurfaceList>
              {snapshot.weakTopics.map((topic) => (
                <SurfaceItem key={`${topic.unit}-${topic.topic}`} className="border-slate-300 bg-slate-100/95">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--accent-text)]">{topic.topic}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--accent-text)]/80">{topic.unit}</p>
                    </div>
                    <div className="text-right text-sm font-semibold text-[color:var(--accent-text)]">
                      <div>{topic.misses} misses</div>
                      <div className="text-xs text-[color:var(--accent-text)]/80">{formatPercent(topic.accuracy)} accuracy</div>
                    </div>
                  </div>
                </SurfaceItem>
              ))}
            </SurfaceList>
          )}
        </SectionCard>

        {/* Removed missed queue box */}
      </div>
    </section>
  );
}