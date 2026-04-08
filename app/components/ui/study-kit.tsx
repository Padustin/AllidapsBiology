import Link from "next/link";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Tone = "blue" | "teal" | "amber" | "slate" | "rose";

const toneMap: Record<Tone, string> = {
  blue: "border-slate-300 bg-slate-100/95 hover:border-slate-400 hover:bg-slate-200/85",
  teal: "border-slate-300 bg-slate-100/95 hover:border-slate-400 hover:bg-slate-200/85",
  amber: "border-slate-300 bg-slate-100/95 hover:border-slate-400 hover:bg-slate-200/85",
  slate: "border-slate-300 bg-slate-100/85 hover:border-slate-400 hover:bg-slate-200/75",
  rose: "border-slate-300 bg-slate-100 hover:border-slate-400 hover:bg-slate-200/70",
};

const badgeMap: Record<Tone | "neutral", string> = {
  blue: "bg-[#1f5a32] text-white",
  teal: "bg-[#1f5a32] text-white",
  amber: "bg-[#1f5a32] text-white",
  rose: "border border-slate-300 bg-slate-100 text-slate-800",
  slate: "border border-slate-300 bg-slate-100 text-slate-700",
  neutral: "border border-slate-300 bg-slate-100 text-slate-700",
};

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  aside?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions, aside }: PageHeroProps) {
  return (
    <section className="hero-card overflow-hidden border border-slate-200 p-6 sm:p-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] xl:items-end">
        <div>
          {eyebrow ? (
            <p className="mb-4 inline-flex rounded-full bg-[#1f5a32] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-balance text-[clamp(2rem,4.6vw,3.75rem)] font-semibold leading-[0.98] tracking-tight text-slate-950" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h1>
          {description ? <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p> : null}
          {actions ? <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
        </div>
        {aside ? <div className="grid gap-3">{aside}</div> : null}
      </div>
    </section>
  );
}

export const PageHero = PageHeader;

type SectionCardProps = {
  title?: string;
  description?: string;
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ title, description, tone = "slate", children, className }: SectionCardProps) {
  return (
    <section className={cx("rounded-[1.35rem] border p-5 shadow-sm sm:p-6", toneMap[tone], className)}>
      {title ? <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2> : null}
      {description ? <p className={cx(title ? "mt-2" : "mb-4", "text-sm leading-6 text-slate-600 sm:text-base")}>{description}</p> : null}
      <div className={cx(title || description ? "mt-5" : "", "grid gap-4")}>{children}</div>
    </section>
  );
}

type ToolCardProps = {
  title: string;
  description: string;
  href: string;
  eyebrow?: string;
  cta?: string;
  detail?: string;
  tone?: Tone;
};

export function FeatureCard({ title, description, href, eyebrow, cta = "Open", detail, tone = "slate" }: ToolCardProps) {
  return (
    <Link
      href={href}
      className={cx(
        "group rounded-[1.35rem] border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6",
        toneMap[tone],
      )}
    >
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p> : null}
      <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      {detail ? <p className="mt-3 text-sm font-medium text-slate-500">{detail}</p> : null}
      <p className="mt-5 text-sm font-semibold text-slate-950 transition group-hover:text-[#1f5a32]">{cta}</p>
    </Link>
  );
}

export function ToolCard(props: ToolCardProps) {
  return <FeatureCard {...props} cta={props.cta || "Open tool"} />;
}

type StatCardProps = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: Tone | "neutral";
};

export function StatCard({ label, value, detail, tone = "neutral" }: StatCardProps) {
  const isGreenTone = tone === "blue" || tone === "teal" || tone === "amber";
  const toneClass = tone === "neutral" ? "border border-slate-300 bg-slate-100" : badgeMap[tone];
  const labelClass = isGreenTone ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75" : "text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500";
  const valueClass = isGreenTone ? "mt-2 text-2xl font-semibold tracking-tight text-white" : "mt-2 text-2xl font-semibold tracking-tight text-slate-950";
  const detailClass = isGreenTone ? "mt-1 text-sm text-white/80" : "mt-1 text-sm text-slate-600";

  return (
    <div className={cx("rounded-3xl px-4 py-4 shadow-sm", toneClass)}>
      <div className={labelClass}>{label}</div>
      <div className={valueClass}>{value}</div>
      {detail ? <div className={detailClass}>{detail}</div> : null}
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  preview?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, secondaryAction, preview, className }: EmptyStateProps) {
  return (
    <div className={cx("rounded-[1.35rem] border border-slate-300 bg-slate-50 p-6 shadow-sm", className)}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)] lg:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
          {(action || secondaryAction) ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {action}
              {secondaryAction}
            </div>
          ) : null}
        </div>
        {preview ? <div className="rounded-[1.2rem] border border-slate-300 bg-slate-100 p-4">{preview}</div> : null}
      </div>
    </div>
  );
}

type LoadingSkeletonProps = {
  title?: string;
  lines?: number;
  className?: string;
};

export function LoadingSkeleton({ title = "Loading", lines = 4, className }: LoadingSkeletonProps) {
  return (
    <div className={cx("rounded-[1.35rem] border border-slate-300 bg-slate-50 p-6 shadow-sm", className)}>
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</div>
      <div className="mt-4 grid gap-3">
        <div className="skeleton-line h-6 w-2/5" />
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className={cx("skeleton-line h-4", index === lines - 1 ? "w-3/4" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

type TipCardProps = {
  label?: string;
  children: ReactNode;
};

export function TipCard({ label = "Tip", children }: TipCardProps) {
  return (
    <div className="rounded-2xl bg-[#1f5a32] px-4 py-3 text-sm text-white shadow-sm">
      <span className="font-bold text-white">{label}</span>
      <span className="ml-2">{children}</span>
    </div>
  );
}

type BadgeProps = {
  label: string;
  tone?: Exclude<Tone, "slate"> | "neutral";
};

export function ModeBadge({ label, tone = "neutral" }: BadgeProps) {
  return <span className={cx("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]", badgeMap[tone])}>{label}</span>;
}

export function VerbBadge({ label }: { label: string }) {
  return <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">{label}</span>;
}

type LinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function PrimaryLink({ href, children, className }: LinkProps) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center justify-center rounded-xl bg-[#1f5a32] px-4 py-2.5 text-sm font-semibold !text-white visited:!text-white shadow-sm transition hover:opacity-90",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children, className }: LinkProps) {
  return (
    <Link href={href} className={cx("inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100", className)}>
      {children}
    </Link>
  );
}

export function PrimaryButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex w-full items-center justify-center rounded-xl bg-[#1f5a32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto disabled:cursor-not-allowed disabled:opacity-50",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx("inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 sm:w-auto disabled:cursor-not-allowed disabled:opacity-50", props.className)}
    >
      {children}
    </button>
  );
}

export function SurfaceList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("grid gap-3", className)}>{children}</div>;
}

export function SurfaceItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", className)}>{children}</div>;
}
