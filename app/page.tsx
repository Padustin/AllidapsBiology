export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 12% 18%, #ddd6fe 0%, #f7f8fc 34%, #eef2ff 62%, #e0f2fe 100%)",
        padding: "40px 24px",
      }}
    >
      <main
        style={{
          maxWidth: 1060,
          margin: "0 auto",
          border: "1px solid #dbe3ef",
          borderRadius: 20,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 18px 50px rgba(15, 23, 42, 0.12)",
          overflow: "hidden",
        }}
      >
        <section
          style={{
            padding: "38px 34px 28px",
            borderBottom: "1px solid #e7edf6",
            background: "linear-gradient(120deg, #faf5ff 0%, #f8fafc 52%, #f0f9ff 100%)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: "#ede9fe",
              color: "#5b21b6",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 0.3,
              textTransform: "uppercase",
            }}
          >
            Allidaps Biology(Beta)
          </div>
          <h1
            style={{
              margin: "14px 0 10px",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.08,
              fontWeight: 900,
              color: "#0f172a",
              maxWidth: 780,
            }}
          >
            Allidaps Biology(Beta)
          </h1>
          <p style={{ margin: 0, fontSize: 18, color: "#334155", maxWidth: 720, lineHeight: 1.45 }}>
            Study with interactive AP Bio tools: active recall question sets, chi-square visual practice, and a complete cell simulation section.
          </p>
          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href="/sims/active-recall/unit"
              style={{
                textDecoration: "none",
                borderRadius: 12,
                padding: "10px 14px",
                background: "#7c3aed",
                color: "#ffffff",
                fontWeight: 700,
                border: "1px solid #6d28d9",
              }}
            >
              Start Studying
            </a>

          </div>
        </section>

        <section
          style={{
            padding: "26px 24px 30px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {[
            {
              title: "Active Recall",
              text: "Fixed AP Bio question sets with immediate feedback and explanation controls.",
              href: "/sims/active-recall/unit",
            },
            {
              title: "AP Review Mode",
              text: "Practice across AP-style prompts by difficulty to strengthen exam readiness.",
              href: "/sims/active-recall/ap",
            },
            {
              title: "Chi-Square Visual Lab",
              text: "Manipulate observed and expected values and see chi-square reasoning visually.",
              href: "/sims/chi-square",
            },
            {
              title: "Cell Simulation",
              text: "Placeholder for the complete interactive cell simulation module.",
              href: "/sims/simulations",
            },
          ].map((item) => (
            <a
              key={item.title}
              href={item.href}
              style={{
                textDecoration: "none",
                border: "1px solid #dbe3ef",
                borderRadius: 14,
                padding: "16px 14px",
                background: "#ffffff",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ color: "#0f172a", fontWeight: 800, fontSize: 18 }}>{item.title}</div>
              <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.45 }}>{item.text}</div>
            </a>
          ))}
        </section>
      </main>
    </div>
  );
}
