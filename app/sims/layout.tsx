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
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${border}`,
    background: "white",
    color: heading,
    textDecoration: "none",
    fontWeight: 700,
  };

  function getNavItemStyle(href: string): React.CSSProperties {
    const isActive = pathname === href;
    return {
      ...navItemStyle,
      background: isActive ? activeBg : navItemStyle.background,
      border: isActive ? `1px solid ${activeBorder}` : navItemStyle.border,
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
    <div style={{ background: pageBg, minHeight: "100vh" }}>
      <div
        style={{
          width: "100%",
          padding: 0,
          fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif",
          color: text,
        }}
      >
          <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: 0, minHeight: "100vh", width: "100%" }}>
          {/* Sidebar */}
          <aside
            style={{
              borderRight: `1px solid ${border}`,
              padding: 14,
              background: cardBg,
              height: "100vh",
              position: "sticky",
              top: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
            }}
          >
            <div style={{ fontWeight: 900, color: heading, fontSize: 20, marginBottom: 12, lineHeight: 1.1 }}>
              Allidaps Biology
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ padding: 6, borderRadius: 8 }}>
                <div style={getSectionSummaryStyle(pathname.startsWith("/sims/simulations"))}>Simulations</div>
                <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                  <Link href="/sims/simulations" style={getNavItemStyle("/sims/simulations")}>Complete Cell Simulation</Link>
                </div>
              </div>

              <div style={{ padding: 6, borderRadius: 8 }}>
                <div style={getSectionSummaryStyle(pathname.startsWith("/sims/active-recall"))}>Active recall questions</div>
                <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                  <Link href="/sims/active-recall/ap" style={getNavItemStyle("/sims/active-recall/ap")}>AP test studying</Link>
                  <Link href="/sims/active-recall/unit" style={getNavItemStyle("/sims/active-recall/unit")}>Unit specific studying</Link>
                </div>
              </div>

              <div style={{ padding: 6, borderRadius: 8 }}>
                <div style={getSectionSummaryStyle(pathname.startsWith("/sims/chi-square"))}>Chi-Squares</div>
                <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                  <Link href="/sims/chi-square" style={getNavItemStyle("/sims/chi-square")}>
                    Visual Lab
                  </Link>
                  <Link href="/sims/chi-square/explanation" style={getNavItemStyle("/sims/chi-square/explanation")}>
                    Explanation
                  </Link>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "auto", paddingTop: 12, fontSize: 12, color: text, lineHeight: 1.35 }}>
              Made by Justin A Padilla
            </div>
          </aside>

          {/* Main content */}
          <main style={{ padding: 18, minWidth: 0 }}>{children}</main>
        </div>
      </div>
    </div>
  );
}