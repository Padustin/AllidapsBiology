"use client";

import { FormEvent, useState } from "react";

export default function FeedbackPage() {
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
        body: JSON.stringify({ message }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setStatusMessage(data.error || "Could not send feedback. Please try again.");
        return;
      }

      setStatus("success");
      setStatusMessage("Thanks, your feedback was sent.");
      setMessage("");
    } catch {
      setStatus("error");
      setStatusMessage("Could not send feedback. Please try again.");
    }
  }

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        borderRadius: 14,
        padding: 20,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.1, color: "#0f172a" }}>Feedback</h1>
      <p style={{ marginTop: 12, color: "#334155", lineHeight: 1.5 }}>
        I appreciate every single person who is using my website to better their understanding of biology. This website is still in beta, so I encourage you to send me feedback on anything I should add or change. All feedback is meaningful and completely anonymous.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6, color: "#0f172a", fontWeight: 700 }}>
          Feedback
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
            rows={6}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 15, resize: "vertical" }}
          />
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              border: "1px solid #1d4ed8",
              background: "#2563eb",
              color: "#ffffff",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 800,
              cursor: status === "sending" ? "default" : "pointer",
              opacity: status === "sending" ? 0.75 : 1,
            }}
          >
            {status === "sending" ? "Sending..." : "Send feedback"}
          </button>

          {statusMessage ? (
            <div style={{ color: status === "success" ? "#166534" : "#991b1b", fontWeight: 700 }}>{statusMessage}</div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
