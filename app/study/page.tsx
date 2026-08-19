"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import reviewData from "./all-units-review-notes.json";
import { PageHeader, SectionCard } from "../components/ui/study-kit";

function unitButtonClass(isActive: boolean) {
  if (isActive) {
    return "rounded-[var(--radius-md)] bg-[color:var(--brand)] px-4 py-3 text-left text-sm font-semibold text-white";
  }

  return "rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-left text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-muted)]";
}

function getUnitFromParam(param: string | null) {
  if (!param) return null;
  const match = reviewData.units.find((unit) => unit.unit === `Unit ${param}` || unit.unit.replace(/\D/g, "") === param.replace(/\D/g, ""));
  return match ?? null;
}

function StudyPageContent() {
  const searchParams = useSearchParams();
  const [selectedUnitNumber, setSelectedUnitNumber] = useState(
    () => getUnitFromParam(searchParams.get("unit"))?.unit ?? reviewData.units[0]?.unit ?? "Unit 1",
  );

  useEffect(() => {
    const fromParam = getUnitFromParam(searchParams.get("unit"));
    if (fromParam && fromParam.unit !== selectedUnitNumber) {
      setSelectedUnitNumber(fromParam.unit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectedUnit = reviewData.units.find((unit) => unit.unit === selectedUnitNumber) ?? reviewData.units[0];

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Study guides"
        align="start"
        title="AP Biology study guides"
        description={`Select a unit to load its review notes, common mix-ups, and must-know terms. ${reviewData.source}`}
      />

      <section>
        <h2 className="sr-only">Choose a unit</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {reviewData.units.map((unit) => {
            const isActive = unit.unit === selectedUnit.unit;
            return (
              <button
                key={unit.unit}
                type="button"
                className={unitButtonClass(isActive)}
                onClick={() => setSelectedUnitNumber(unit.unit)}
                aria-pressed={isActive}
              >
                <div className={`text-xs uppercase tracking-[0.12em] ${isActive ? "text-white/80" : "text-[color:var(--ink-faint)]"}`}>{unit.unit}</div>
                <div className="mt-1 text-[15px] leading-5">{unit.title}</div>
              </button>
            );
          })}
        </div>
      </section>

      <SectionCard title={`${selectedUnit.unit}: ${selectedUnit.title}`} description="Core review notes for this unit.">
        <ul className="grid gap-2.5 pl-5 text-[15px] leading-7 text-[color:var(--ink)] marker:text-[color:var(--brand)]" style={{ listStyleType: "disc" }}>
          {selectedUnit.review_notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Don't mix these up" description="High-probability confusions for this unit.">
          <ul className="grid gap-2.5">
            {selectedUnit.dont_mix_these_up.map((item) => (
              <li key={item} className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-2.5 text-sm leading-6 text-[color:var(--ink)]">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Must-know terms" description="Quick vocabulary scan before you start practicing.">
          <div className="flex flex-wrap gap-2">
            {selectedUnit.must_know_terms.map((term) => (
              <span key={term} className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-sm font-medium text-[color:var(--ink)]">
                {term}
              </span>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="grid gap-8"><PageHeader eyebrow="Study guides" align="start" title="AP Biology study guides" /></div>}>
      <StudyPageContent />
    </Suspense>
  );
}
