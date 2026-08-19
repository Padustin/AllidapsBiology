"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  matches: (pathname: string) => boolean;
};

// Grouped by what a student is trying to do, not by every route that exists.
// MCQ / FRQ / statistics modes all live one click inside "Practice" already.
const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    matches: (pathname) => pathname === "/",
  },
  {
    href: "/study",
    label: "Units",
    matches: (pathname) => pathname.startsWith("/study"),
  },
  {
    href: "/sims/active-recall",
    label: "Practice",
    matches: (pathname) =>
      pathname.startsWith("/sims/active-recall") ||
      pathname.startsWith("/sims/mcq") ||
      pathname.startsWith("/sims/frq") ||
      pathname.startsWith("/sims/chi-square"),
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
    return "accent-gradient rounded-full px-3.5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)]";
  }

  return "rounded-full px-3.5 py-2 text-sm font-medium text-[color:var(--ink-muted)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--ink)]";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-[var(--radius-sm)] focus:bg-[color:var(--brand)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={`sticky top-0 z-50 border-b bg-[color:var(--bg)]/90 backdrop-blur transition-shadow duration-200 ${
          scrolled ? "border-[color:var(--border-strong)] shadow-[var(--shadow-card)]" : "border-[color:var(--border)]"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-70"
          style={{ background: "radial-gradient(420px 60px at 12% 0%, rgba(255, 183, 3, 0.14), transparent 70%), radial-gradient(360px 60px at 88% 100%, rgba(14, 155, 115, 0.12), transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex w-full max-w-[1200px] items-center justify-between gap-6 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="pop-hover flex items-center gap-2.5">
            <span
              className="accent-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-base shadow-[var(--shadow-sm)]"
              aria-hidden="true"
            >
              🧬
            </span>
            <div className="text-base font-semibold tracking-tight text-[color:var(--ink)]" style={{ fontFamily: "var(--font-serif)" }}>
              Padilla Biology
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass(item.matches(pathname))}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="relative border-t border-[color:var(--border)] md:hidden">
          <nav className="flex w-full gap-1.5 overflow-x-auto px-4 py-2 sm:px-6" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={`${navLinkClass(item.matches(pathname))} shrink-0`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8"
            style={{ background: "linear-gradient(to left, var(--bg), transparent)" }}
            aria-hidden="true"
          />
        </div>
      </header>

      <div id="main-content" className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {children}
      </div>

      <footer className="border-t border-[color:var(--border)]">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-6 text-sm text-[color:var(--ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Built by Justin A Padilla for AP Biology review and practice.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/sims/feedback" className="font-medium text-[color:var(--brand-dark)] hover:underline">
              Share feedback
            </Link>
            <span>Practice only — confirm class-specific expectations with your teacher.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
