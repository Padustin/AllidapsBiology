import { NextResponse } from "next/server";

type FeedbackPayload = {
  message?: string;
  category?: string;
  page?: string;
  email?: string;
};

const ALLOWED_CATEGORIES = new Set(["bug", "content", "design", "feature", "other"]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FEEDBACK_FROM_EMAIL;
  const toEmail = "justinpadilla948@gmail.com";

  if (!resendApiKey || !fromEmail) {
    return NextResponse.json(
      { error: "Email service is not configured on the server." },
      { status: 500 }
    );
  }

  let body: FeedbackPayload;
  try {
    body = (await request.json()) as FeedbackPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const category = ALLOWED_CATEGORIES.has((body.category || "").trim()) ? (body.category || "other").trim() : "other";
  const page = (body.page || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();

  if (!message) {
    return NextResponse.json(
      { error: "Please enter feedback before sending." },
      { status: 400 }
    );
  }

  if (message.length < 10) {
    return NextResponse.json(
      { error: "Feedback message must be at least 10 characters." },
      { status: 400 }
    );
  }

  if (page.length > 160) {
    return NextResponse.json(
      { error: "Page or route should stay under 160 characters." },
      { status: 400 }
    );
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid reply email or leave it blank." },
      { status: 400 }
    );
  }

  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const subject = `New Allidaps Feedback: ${categoryLabel}`;
  const submittedAt = new Date().toISOString();
  const text = [
    `Submitted: ${submittedAt}`,
    `Category: ${categoryLabel}`,
    page ? `Page: ${page}` : null,
    email ? `Reply email: ${email}` : null,
    "",
    "Message:",
    message,
  ].filter(Boolean).join("\n");

  const safePage = escapeHtml(page);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">New Allidaps Feedback</h2>
      <p style="margin: 0 0 8px;"><strong>Submitted:</strong> ${submittedAt}</p>
      <p style="margin: 0 0 8px;"><strong>Category:</strong> ${categoryLabel}</p>
      ${page ? `<p style="margin: 0 0 8px;"><strong>Page:</strong> ${safePage}</p>` : ""}
      ${email ? `<p style="margin: 0 0 8px;"><strong>Reply email:</strong> ${safeEmail}</p>` : ""}
      <p style="margin: 12px 0 6px;"><strong>Message:</strong></p>
      <div style="white-space: pre-wrap;">${safeMessage}</div>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      text,
      html,
      reply_to: email || undefined,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: "Failed to send feedback email.", details },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
