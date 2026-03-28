import Link from "next/link";
import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHero({ eyebrow, title, description, actions }: PageHeroProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
      {eyebrow ? (
        <p className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
      {description ? <p className="mt-3 max-w-3xl text-pretty text-slate-600 sm:text-lg">{description}</p> : null}
      {actions ? <div className="mt-5 flex flex-wrap items-center gap-3">{actions}</div> : null}
    </section>
  );
}

type ToolCardProps = {
  title: string;
  description: string;
  href: string;
  tone?: "blue" | "teal" | "amber" | "slate";
};

const toneMap: Record<NonNullable<ToolCardProps["tone"]>, string> = {
  blue: "border-sky-200 bg-sky-50/70 hover:border-sky-300 hover:bg-sky-50",
  teal: "border-teal-200 bg-teal-50/70 hover:border-teal-300 hover:bg-teal-50",
  amber: "border-amber-200 bg-amber-50/70 hover:border-amber-300 hover:bg-amber-50",
  slate: "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
};

export function ToolCard({ title, description, href, tone = "slate" }: ToolCardProps) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${toneMap[tone]}`}
    >
      <p className="text-lg font-bold tracking-tight text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <p className="mt-4 text-sm font-semibold text-slate-900 transition group-hover:text-sky-700">Open tool</p>
    </Link>
  );
}

type TipCardProps = {
  label?: string;
  children: ReactNode;
};

export function TipCard({ label = "Padilla tip", children }: TipCardProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
      <span className="font-bold">{label}</span>
      <span className="ml-2">{children}</span>
    </div>
  );
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-xl border border-sky-700 bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-sky-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ""}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ""}`}
    >
      {children}
    </button>
  );
}
