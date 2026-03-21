"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function SimsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pageBg = "#f1f5f9";
  const cardBg = "#f8fafc";
  const border = "#e2e8f0";
  const text = "#334155";
  const heading = "#0f172a";
  const activeBg = "#ede9fe";
  const activeBorder = "#c4b5fd";
  const activeText = "#5b21b6";

  const navItemStyle: React.CSSProperties = {
    display: "block",
    padding: "12px 14px",
    borderRadius: 0,
    borderTop: `1px solid ${border}`,
    borderBottom: `1px solid ${border}`,
    borderLeft: "none",
    borderRight: "none",
    background: "white",
    color: heading,
    textDecoration: "none",
    fontWeight: 700,
    width: "100%",
  };

  function getNavItemStyle(href: string): React.CSSProperties {
    const isActive = pathname === href;
    return {
      ...navItemStyle,
      background: isActive ? activeBg : navItemStyle.background,
      borderTop: isActive ? `1px solid ${activeBorder}` : navItemStyle.borderTop,
      borderBottom: isActive ? `1px solid ${activeBorder}` : navItemStyle.borderBottom,
      color: isActive ? activeText : navItemStyle.color,
    };
  }

  function getSectionSummaryStyle(isActive: boolean): React.CSSProperties {
    return {
      fontWeight: 800,
      marginBottom: 8,
      color: isActive ? activeText : heading,
    };
  }

  return (
    <div style={{ background: pageBg, height: "100dvh", overflow: "hidden" }}>
      <div
        style={{
          width: "100%",
          padding: 0,
          fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif",
          color: text,
        }}
      >
          <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: 0, height: "100dvh", width: "100%", alignItems: "stretch" }}>
          {/* Sidebar */}
          <aside
            style={{
              borderRight: `1px solid ${border}`,
              padding: 0,
              background: cardBg,
              height: "100dvh",
              alignSelf: "stretch",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
            }}
          >
            <div style={{ fontWeight: 900, color: heading, fontSize: 20, marginBottom: 12, lineHeight: 1.1, padding: "14px 14px 0" }}>
              Allidaps Biology
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <div style={{ ...getSectionSummaryStyle(pathname.startsWith("/sims/simulations")), padding: "0 14px" }}>Simulations</div>
                <div style={{ display: "grid", gap: 0, marginTop: 6 }}>
                  <Link href="/sims/simulations" style={getNavItemStyle("/sims/simulations")}>Complete Cell Simulation</Link>
                </div>
              </div>

              <div>
                <div style={{ ...getSectionSummaryStyle(pathname.startsWith("/sims/active-recall")), padding: "0 14px" }}>Study!!</div>
                <div style={{ display: "grid", gap: 0, marginTop: 6 }}>
                  <Link href="/sims/active-recall/ap" style={getNavItemStyle("/sims/active-recall/ap")}>AP test studying</Link>
                  <Link href="/sims/active-recall/unit" style={getNavItemStyle("/sims/active-recall/unit")}>Unit specific studying</Link>
                </div>
              </div>

              <div>
                <div style={{ ...getSectionSummaryStyle(pathname.startsWith("/sims/chi-square")), padding: "0 14px" }}>Chi-Squares</div>
                <div style={{ display: "grid", gap: 0, marginTop: 6 }}>
                  <Link href="/sims/chi-square" style={getNavItemStyle("/sims/chi-square")}>
                    Visual Lab
                  </Link>
                  <Link href="/sims/chi-square/explanation" style={getNavItemStyle("/sims/chi-square/explanation")}>
                    Explanation
                  </Link>
                </div>
              </div>

              <div>
                <div style={{ ...getSectionSummaryStyle(pathname.startsWith("/sims/feedback")), padding: "0 14px" }}>Feedback</div>
                <div style={{ display: "grid", gap: 0, marginTop: 6 }}>
                  <Link href="/sims/feedback" style={getNavItemStyle("/sims/feedback")}>Share feedback</Link>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "auto", padding: "12px 14px 14px", fontSize: 12, color: text, lineHeight: 1.35 }}>
              Made by Justin A Padilla
            </div>
          </aside>

          {/* Main content */}
          <main style={{ padding: 0, minWidth: 0, height: "100dvh", alignSelf: "stretch", overflow: "auto" }}>{children}</main>
        </div>
      </div>
    </div>
  );
}