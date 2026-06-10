"use client";

import { FormEvent, useState } from "react";
import {
  PageHeader,
  PrimaryButton,
  SectionCard,
  StatCard,
  SurfaceItem,
  SurfaceList,
} from "../../components/ui/study-kit";

type FeedbackCategory = "bug" | "content" | "design" | "feature" | "other";

const CATEGORY_OPTIONS: Array<{ value: FeedbackCategory; label: string; description: string }> = [
  { value: "bug", label: "Bug report", description: "Something is broken, missing, or behaving unexpectedly." },
  { value: "content", label: "Content issue", description: "A question, explanation, or prompt feels weak, unclear, or inaccurate." },
  { value: "design", label: "Design or UX", description: "Navigation, layout, labels, or flow felt confusing or clunky." },
  { value: "feature", label: "Feature request", description: "You want a new tool, mode, page, or workflow." },
  { value: "other", label: "Other", description: "Anything else worth passing along." },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState<FeedbackCategory>("content");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setStatusMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          email,
          message,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setStatusMessage(data.error || "Could not send feedback. Please try again.");
        return;
      }

      setStatus("success");
      setStatusMessage("Thanks, your feedback was sent.");
      // ...existing code...
      setEmail("");
      setMessage("");
      setCategory("content");
    } catch {
      setStatus("error");
      setStatusMessage("Could not send feedback. Please try again.");
    }
  }

  return (
    <main className="grid gap-6 lg:gap-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <SectionCard
          title="Send feedback"
          description="Short, specific notes are the most useful. If something felt unclear, mention the page and what you expected to happen instead."
          tone="rose"
        >
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-900">
                Feedback type
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <select value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)} className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none">
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-slate-900">
              Optional reply email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Leave blank if you do not want a reply"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#5d6bff] focus:ring-2 focus:ring-[#5d6bff]/20"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-900">
              What happened, what felt weak, or what should change?
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                minLength={10}
                rows={8}
                placeholder="Examples: The explanation after question 3 never clarified why choice B was wrong. The FRQ page needs a clearer way to switch between Foundation and FRQ mode. The graph-slope tool should show one worked example before the calculator."
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-[#5d6bff] focus:ring-2 focus:ring-[#5d6bff]/20"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryButton type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending..." : "Send feedback"}
              </PrimaryButton>
              {statusMessage ? (
                <div className={`text-sm font-semibold ${status === "success" ? "text-[#5b46d8]" : "text-slate-700"}`}>{statusMessage}</div>
              ) : null}
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="What makes feedback useful"
          description="You do not need to write a lot. Just make it concrete enough that the problem is reproducible or the request is clear."
          tone="amber"
        >
          <SurfaceList>
            {CATEGORY_OPTIONS.map((option) => (
              <SurfaceItem key={option.value}>
                <h2 className="text-base font-semibold tracking-tight text-slate-950">{option.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>
              </SurfaceItem>
            ))}
            <SurfaceItem>
              <h2 className="text-base font-semibold tracking-tight text-slate-950">Good examples</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">"The all-unit MCQ page still felt too bare on mobile." "This FRQ scoring note did not explain why the evidence mattered." "The statistics center needs a starter example before the formula board."</p>
            </SurfaceItem>
          </SurfaceList>
        </SectionCard>
      </section>
    </main>
  );
}
