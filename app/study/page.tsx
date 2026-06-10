"use client";

import { useState } from "react";
import reviewData from "./all-units-review-notes.json";
import {
	PageHeader,
	SectionCard,
} from "../components/ui/study-kit";

function buttonClass(isActive: boolean) {
	if (isActive) {
		return "accent-gradient rounded-2xl px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition hover:opacity-95";
	}

	return "rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100";
}

export default function StudyPage() {
	const [selectedUnitNumber, setSelectedUnitNumber] = useState(reviewData.units[0]?.unit ?? "Unit 1");

	const selectedUnit = reviewData.units.find((unit) => unit.unit === selectedUnitNumber) ?? reviewData.units[0];

	return (
		<div className="grid gap-6">
			<PageHeader
				eyebrow="Study"
				title="AP Biology Study Guides"
				description={`Select a unit to load the matching study guide from the course review set. ${reviewData.source}`}
			/>

			<SectionCard
				title="Choose a unit"
				description="Use the buttons below to switch the study guide instantly."
				tone="accent"
			>
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
					{reviewData.units.map((unit) => {
						const isActive = unit.unit === selectedUnit.unit;

						return (
							<button
								key={unit.unit}
								type="button"
								className={buttonClass(isActive)}
								onClick={() => setSelectedUnitNumber(unit.unit)}
							>
								<div className="text-xs uppercase tracking-[0.16em] opacity-80">{unit.unit}</div>
								<div className="mt-1 text-base leading-5">{unit.title}</div>
								<div className="mt-2 text-xs font-medium opacity-80">MCQ weight: {unit.exam_weight_mcq}</div>
							</button>
						);
					})}
				</div>
			</SectionCard>

			<SectionCard
				title={`${selectedUnit.unit}: ${selectedUnit.title}`}
				description="Core review notes pulled directly from the selected unit guide."
				tone="slate"
			>
				<ol className="grid gap-5">
					<li className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
						<strong className="text-base tracking-tight text-slate-950">
							{selectedUnit.unit}. {selectedUnit.title}
						</strong>
						<ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 marker:text-amber-600 sm:text-base">
							{selectedUnit.review_notes.map((note) => (
								<li key={note}>{note}</li>
							))}
						</ul>
					</li>
				</ol>
			</SectionCard>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
				<SectionCard
					title="Don't Mix These Up"
					description="High-probability confusions for the selected unit."
					tone="slate"
				>
					<ul className="grid gap-3 text-sm leading-7 text-slate-700 sm:text-base">
						{selectedUnit.dont_mix_these_up.map((item) => (
							<li key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
								{item}
							</li>
						))}
					</ul>
				</SectionCard>

				<SectionCard
					title="Must-Know Terms"
					description="Quick vocabulary scan before you jump into questions."
					tone="slate"
				>
					<div className="flex flex-wrap gap-2">
						{selectedUnit.must_know_terms.map((term) => (
							<span
								key={term}
								className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
							>
								{term}
							</span>
						))}
					</div>
				</SectionCard>
			</div>
		</div>
	);
}