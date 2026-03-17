import { NextResponse } from "next/server";

type FeedbackPayload = {
  message?: string;
};

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

  const subject = "New Allidaps Feedback";
  const text = [
    `Submitted: ${new Date().toISOString()}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">New Allidaps Feedback</h2>
      <p style="margin: 0 0 8px;"><strong>Submitted:</strong> ${new Date().toISOString()}</p>
      <p style="margin: 12px 0 6px;"><strong>Message:</strong></p>
      <div style="white-space: pre-wrap;">${message.replace(/</g, "&lt;")}</div>
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
