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
    <div className="grid gap-2.5">
      {rows.map((row) => (
        <div key={row.label} className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[color:var(--ink)]">{row.label}</p>
              <p className="text-xs text-[color:var(--ink-faint)]">{row.total > 0 ? `${row.correct}/${row.total} correct` : "No attempts yet"}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <p className="text-sm font-bold text-[color:var(--ink)]">{formatPercent(row.accuracy)}</p>
              <button
                onClick={() => setExpandedUnits((current) => ({ ...current, [row.label]: !current[row.label] }))}
                className="text-xs font-semibold text-[color:var(--brand-dark)] hover:underline"
              >
                {expandedUnits[row.label] ? "Hide breakdown" : "Show breakdown"}
              </button>
            </div>
          </div>
          <div className="mt-2.5 h-1.5 rounded-full bg-[color:var(--surface-muted)]">
            <div
              className="h-1.5 rounded-full bg-[color:var(--brand)] transition-all"
              style={{ width: `${Math.max(6, Math.round((row.accuracy || 0) * 100))}%`, opacity: row.total > 0 ? 1 : 0.25 }}
            />
          </div>
          {expandedUnits[row.label] && (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {(breakdownByUnit[row.label] || []).map((difficultyRow) => (
                <div key={`${row.label}-${difficultyRow.label}`} className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2.5">
                  <ModeBadge label={formatBreakdownLabel(difficultyRow.label)} tone={getBreakdownTone(difficultyRow.label)} />
                  <p className="mt-2 text-lg font-semibold text-[color:var(--ink)]">{formatPercent(difficultyRow.accuracy)}</p>
                  <p className="mt-0.5 text-xs text-[color:var(--ink-faint)]">{difficultyRow.total > 0 ? `${difficultyRow.correct}/${difficultyRow.total} correct` : "No attempts yet"}</p>
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
      />
    );
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard label="Best unit" value={bestUnit ? bestUnit.label : "No data yet"} detail={bestUnit ? `${formatPercent(bestUnit.accuracy)} accuracy` : "Answer questions to rank units."} tone="green" />
          <StatCard label="Weakest unit" value={worstUnit ? worstUnit.label : "No data yet"} detail={worstUnit ? `${formatPercent(worstUnit.accuracy)} accuracy` : "Answer questions to rank units."} tone="rose" />
        </div>

        <SectionCard title="Accuracy by unit" description="Use each unit's breakdown to see whether misses are happening in Foundation, AP-Style, or Experiment questions.">
          <UnitAccuracyList rows={snapshot.accuracyByUnit} breakdownByUnit={snapshot.accuracyByUnitDifficulty} />
        </SectionCard>
      </div>

      <SectionCard title="Topics you keep missing" description="Content areas where misses are stacking up fastest.">
        {snapshot.weakTopics.length === 0 ? (
          <SurfaceItem>
            <p className="text-sm leading-6 text-[color:var(--ink-muted)]">No weak topics yet. As soon as misses cluster around a concept, it will show up here.</p>
          </SurfaceItem>
        ) : (
          <SurfaceList>
            {snapshot.weakTopics.map((topic) => (
              <SurfaceItem key={`${topic.unit}-${topic.topic}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{topic.topic}</p>
                    <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-[color:var(--ink-faint)]">{topic.unit}</p>
                  </div>
                  <div className="text-right text-sm font-semibold text-[color:var(--statistics)]">
                    <div>{topic.misses} misses</div>
                    <div className="text-xs font-normal text-[color:var(--ink-faint)]">{formatPercent(topic.accuracy)} accuracy</div>
                  </div>
                </div>
              </SurfaceItem>
            ))}
          </SurfaceList>
        )}
      </SectionCard>
    </section>
  );
}
