import Image from "next/image";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Tone = "blue" | "teal" | "amber" | "slate" | "rose" | "green" | "accent";

// Each tone maps to one flat, muted color used consistently for that meaning
// across the app (amber = Foundation, blue = AP-Style, teal = Experiment,
// rose = Statistics, green = brand emphasis, slate = neutral). No gradients,
// no per-component reinvention of the palette.
const TONE_COLOR: Record<Tone, { text: string; soft: string; solid: string; border: string; cssVar: string }> = {
  amber: { text: "text-[color:var(--foundation)]", soft: "bg-[color:var(--foundation-soft)]", solid: "bg-[color:var(--foundation)]", border: "border-[color:var(--foundation)]/25", cssVar: "var(--foundation)" },
  blue: { text: "text-[color:var(--info)]", soft: "bg-[color:var(--info-soft)]", solid: "bg-[color:var(--info)]", border: "border-[color:var(--info)]/25", cssVar: "var(--info)" },
  teal: { text: "text-[color:var(--experiment)]", soft: "bg-[color:var(--experiment-soft)]", solid: "bg-[color:var(--experiment)]", border: "border-[color:var(--experiment)]/25", cssVar: "var(--experiment)" },
  rose: { text: "text-[color:var(--statistics)]", soft: "bg-[color:var(--statistics-soft)]", solid: "bg-[color:var(--statistics)]", border: "border-[color:var(--statistics)]/25", cssVar: "var(--statistics)" },
  green: { text: "text-[color:var(--success)]", soft: "bg-[color:var(--success-soft)]", solid: "bg-[color:var(--success)]", border: "border-[color:var(--success)]/25", cssVar: "var(--success)" },
  accent: { text: "text-[color:var(--brand-dark)]", soft: "bg-[color:var(--brand-soft)]", solid: "bg-[color:var(--brand)]", border: "border-[color:var(--brand)]/25", cssVar: "var(--brand)" },
  slate: { text: "text-[color:var(--ink-muted)]", soft: "bg-[color:var(--surface-muted)]", solid: "bg-[color:var(--ink-muted)]", border: "border-[color:var(--border-strong)]", cssVar: "var(--border-strong)" },
};

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  aside?: ReactNode;
  align?: "start" | "end";
};

export function PageHeader({ eyebrow, title, description, actions, aside, align = "end" }: PageHeroProps) {
  const hasIntro = Boolean(title || description);
  return (
    <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
      <div className="blob-decoration" aria-hidden="true" />
      <div className={`relative z-[1] grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] ${align === "start" ? "xl:items-start" : "xl:items-end"}`}>
        <div>
          {eyebrow ? (
            <p className="mb-3 inline-flex items-center rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-dark)]">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h1
              className="text-balance max-w-2xl whitespace-normal text-[clamp(1.85rem,3.6vw,2.6rem)] font-semibold leading-[1.1] tracking-tight text-[color:var(--ink)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {title}
            </h1>
          ) : null}
          {description ? <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--ink-muted)]">{description}</p> : null}
          {actions ? <div className={`${hasIntro ? "mt-5" : "mt-0"} flex flex-col gap-3 sm:flex-row sm:flex-wrap`}>{actions}</div> : null}
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

export function SectionCard({ title, description, tone, children, className }: SectionCardProps) {
  const accent = tone ? TONE_COLOR[tone] : null;
  return (
    <section
      className={cx(
        "rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6",
        accent ? "border-l-[3px]" : null,
        className,
      )}
      style={accent ? { borderLeftColor: accent.cssVar } : undefined}
    >
      {title ? <h2 className="text-lg font-semibold tracking-tight text-[color:var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>{title}</h2> : null}
      {description ? <p className={cx(title ? "mt-1.5" : "mb-4", "text-sm leading-6 text-[color:var(--ink-muted)]")}>{description}</p> : null}
      <div className={cx(title || description ? "mt-4" : "", "grid gap-4")}>{children}</div>
    </section>
  );
}

type ToolCardProps = {
  title: string;
  description?: string;
  href: string;
  eyebrow?: string;
  cta?: string;
  detail?: string;
  tone?: Tone;
  preview?: ReactNode;
  previewImageSrc?: string;
  previewImageAlt?: string;
};

export function FeatureCard({ title, description, href, eyebrow, cta = "Open", detail, tone, preview, previewImageSrc, previewImageAlt }: ToolCardProps) {
  const accent = tone ? TONE_COLOR[tone] : null;
  return (
    <Link
      href={href}
      className="pop-hover group relative overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 pt-6 shadow-[var(--shadow-sm)] hover:border-[color:var(--border-strong)] sm:p-6 sm:pt-7"
    >
      <span
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: accent ? accent.cssVar : "var(--brand)" }}
        aria-hidden="true"
      />
      {eyebrow ? <p className={cx("text-xs font-semibold uppercase tracking-[0.14em]", accent ? accent.text : "text-[color:var(--ink-faint)]")}>{eyebrow}</p> : null}
      <p className="mt-2 text-lg font-semibold tracking-tight text-[color:var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>{title}</p>
      {description ? <p className="mt-2 text-sm leading-6 text-[color:var(--ink-muted)]">{description}</p> : null}
      {detail ? <p className="mt-2 text-sm font-medium text-[color:var(--ink-faint)]">{detail}</p> : null}
      {preview ? <div className="mt-4">{preview}</div> : null}
      {previewImageSrc && !preview ? (
        <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface-muted)]">
          <Image src={previewImageSrc} alt={previewImageAlt || title} width={960} height={640} className="h-36 w-full object-cover" />
        </div>
      ) : null}
      <p className="mt-4 text-sm font-semibold text-[color:var(--brand-dark)] transition group-hover:text-[color:var(--brand)]">{cta} &rarr;</p>
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
  const accent = tone !== "neutral" ? TONE_COLOR[tone as Tone] : null;
  return (
    <div className={cx("rounded-[var(--radius-md)] border px-4 py-3.5", accent ? `${accent.soft} ${accent.border}` : "border-[color:var(--border)] bg-[color:var(--surface-muted)]")}>
      <div className={cx("text-[11px] font-semibold uppercase tracking-[0.12em]", accent ? accent.text : "text-[color:var(--ink-faint)]")}>{label}</div>
      <div className="mt-1.5 text-xl font-semibold tracking-tight text-[color:var(--ink)]">{value}</div>
      {detail ? <div className="mt-0.5 text-sm text-[color:var(--ink-muted)]">{detail}</div> : null}
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
    <div className={cx("rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-6", className)}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)] lg:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[color:var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--ink-muted)]">{description}</p>
          {(action || secondaryAction) ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {action}
              {secondaryAction}
            </div>
          ) : null}
        </div>
        {preview ? <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">{preview}</div> : null}
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
    <div className={cx("rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--surface)] p-6", className)} role="status" aria-live="polite">
      <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-faint)]">{title}</div>
      <div className="mt-4 grid gap-3">
        <div className="skeleton-line h-6 w-2/5" />
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className={cx("skeleton-line h-4", index === lines - 1 ? "w-3/4" : "w-full")} />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

type TipCardProps = {
  label?: string;
  children: ReactNode;
};

export function TipCard({ label = "Tip", children }: TipCardProps) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] border-l-[3px] border-l-[color:var(--brand)] bg-[color:var(--brand-soft)] px-4 py-3 text-sm leading-6 text-[color:var(--ink)]">
      <span className="font-semibold text-[color:var(--brand-dark)]">💡 {label}:</span> <span>{children}</span>
    </div>
  );
}

type BadgeProps = {
  label: string;
  tone?: Exclude<Tone, "slate"> | "neutral";
};

export function ModeBadge({ label, tone = "neutral" }: BadgeProps) {
  const accent = tone !== "neutral" ? TONE_COLOR[tone as Tone] : TONE_COLOR.slate;
  return (
    <span className={cx("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em]", accent.soft, accent.text)}>
      {label}
    </span>
  );
}

export function VerbBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--ink-muted)]">
      {label}
    </span>
  );
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
        "accent-gradient inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold !text-white visited:!text-white shadow-[var(--shadow-pop)] transition hover:brightness-110 active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children, className }: LinkProps) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center justify-center rounded-full border-2 border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-2.5 text-sm font-semibold text-[color:var(--ink)] shadow-[var(--shadow-sm)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand-dark)] active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function PrimaryButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "accent-gradient inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-pop)] transition hover:brightness-110 active:scale-[0.98] sm:w-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100",
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
      className={cx(
        "inline-flex w-full items-center justify-center rounded-full border-2 border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-2.5 text-sm font-semibold text-[color:var(--ink)] shadow-[var(--shadow-sm)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand-dark)] active:scale-[0.98] sm:w-auto disabled:cursor-not-allowed disabled:opacity-50",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function SurfaceList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("grid gap-3", className)}>{children}</div>;
}

export function SurfaceItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-4", className)}>{children}</div>;
}
