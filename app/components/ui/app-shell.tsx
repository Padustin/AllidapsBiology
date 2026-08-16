"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  matches: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    matches: (pathname) => pathname === "/",
  },
  {
    href: "/study",
    label: "Study",
    matches: (pathname) => pathname.startsWith("/study"),
  },
  {
    href: "/sims/active-recall",
    label: "Practice",
    matches: (pathname) => pathname.startsWith("/sims/active-recall") && !pathname.startsWith("/sims/active-recall/frq"),
  },
  {
    href: "/sims/mcq",
    label: "MCQ",
    matches: (pathname) => pathname.startsWith("/sims/mcq"),
  },
  {
    href: "/sims/frq",
    label: "FRQ",
    matches: (pathname) => pathname.startsWith("/sims/frq") || pathname.startsWith("/sims/active-recall/frq"),
  },
  {
    href: "/sims/chi-square",
    label: "Statistics",
    matches: (pathname) => pathname.startsWith("/sims/chi-square"),
  },
  {
    href: "/sims/simulations",
    label: "Simulations",
    matches: (pathname) => pathname.startsWith("/sims/simulations"),
  },
  {
    href: "/sims/feedback",
    label: "Feedback",
    matches: (pathname) => pathname.startsWith("/sims/feedback"),
  },
];

function navLinkClass(isActive: boolean) {
  if (isActive) {
    return "accent-gradient rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm";
  }

  return "rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-200 hover:bg-white hover:text-slate-900";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface)]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Link href="/" className="block">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Padilla Biology</div>
              <div className="mt-1 text-lg font-semibold tracking-tight text-slate-950">AP Biology study platform</div>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass(item.matches(pathname))}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            <div className="accent-gradient rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Built for AP Bio students
            </div>
            <div className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              Updated content and explanations
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[1400px] gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:hidden lg:px-8" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={`${navLinkClass(item.matches(pathname))} shrink-0`}>
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>

      <footer className="border-t border-[color:var(--border)] bg-white/80">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-5 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            Built by Justin A Padilla. Designed for fast AP Biology review, targeted practice, and clearer explanations.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/sims/feedback" className="font-medium text-slate-700 transition hover:text-[color:var(--accent-text)]">
              Share feedback
            </Link>
            <span>Updated 2026</span>
            <span>Practice only; always verify class-specific expectations with your teacher</span>
          </div>
        </div>
      </footer>
    </div>
  );
}