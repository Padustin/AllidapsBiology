"use client";

import { FormEvent, useState } from "react";
import {
  PageHeader,
  PrimaryButton,
  SectionCard,
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

// The "Share feedback" link lives in the footer on every page with no query param, so by the
// time someone is filling out this form, the page they actually want to talk about is already
// gone from the URL. document.referrer can't recover it either — Next's <Link> does a
// client-side route swap, not a full page load, so the browser never updates it after the
// very first load. AppShell tracks real route changes into sessionStorage instead.
//
// Effects fire child-before-parent, so at the moment this component's initializer runs,
// AppShell's own effect for *this* navigation hasn't written "/sims/feedback" over
// apbio:currentPath yet — it still holds whatever page we just came from. The apbio:prevPath
// fallback only matters if this page gets reloaded directly, since currentPath would then
// already say "/sims/feedback" from before the reload.
function getReferringPage() {
  if (typeof window === "undefined") return "";
  try {
    const current = sessionStorage.getItem("apbio:currentPath");
    if (current && current !== "/sims/feedback") return current;
    const prev = sessionStorage.getItem("apbio:prevPath");
    if (prev && prev !== "/sims/feedback") return prev;
    return "";
  } catch {
    return "";
  }
}

export default function FeedbackPage() {
  const [category, setCategory] = useState<FeedbackCategory>("content");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [referringPage] = useState(getReferringPage);

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
          page: referringPage,
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
      setEmail("");
      setMessage("");
      setCategory("content");
    } catch {
      setStatus("error");
      setStatusMessage("Could not send feedback. Please try again.");
    }
  }

  return (
    <main className="grid gap-8">
      <PageHeader eyebrow="Feedback" align="start" title="Send feedback" description="Short, specific notes are the most useful. If something felt unclear, mention the page and what you expected to happen instead." />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.85fr)]">
        <SectionCard>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {referringPage ? (
              <p className="text-xs text-[color:var(--ink-faint)]">
                We&apos;ll attach the page you came from: <span className="font-semibold text-[color:var(--ink-muted)]">{referringPage}</span>
              </p>
            ) : null}

            <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
              Feedback type
              <div className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2">
                <select value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)} className="w-full bg-transparent text-sm font-medium text-[color:var(--ink)] outline-none">
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
              Optional reply email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Leave blank if you do not want a reply"
                className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--ink)] outline-none transition focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[color:var(--ink)]">
              What happened, what felt weak, or what should change?
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                minLength={10}
                rows={8}
                placeholder="Examples: The explanation after question 3 never clarified why choice B was wrong. The FRQ page needs a clearer way to switch between Foundation and FRQ mode."
                className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-3 text-sm text-[color:var(--ink)] outline-none transition focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color:var(--brand-soft)]"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryButton type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending..." : "Send feedback"}
              </PrimaryButton>
              {statusMessage ? (
                <div role="status" className={`text-sm font-semibold ${status === "success" ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
                  {statusMessage}
                </div>
              ) : null}
            </div>
          </form>
        </SectionCard>

        <SectionCard title="What makes feedback useful" description="You do not need to write a lot — just make it concrete enough that the problem is reproducible or the request is clear.">
          <SurfaceList>
            {CATEGORY_OPTIONS.map((option) => (
              <SurfaceItem key={option.value}>
                <h2 className="text-sm font-semibold tracking-tight text-[color:var(--ink)]">{option.label}</h2>
                <p className="mt-1.5 text-sm leading-6 text-[color:var(--ink-muted)]">{option.description}</p>
              </SurfaceItem>
            ))}
          </SurfaceList>
        </SectionCard>
      </section>
    </main>
  );
}
