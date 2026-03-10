import { Resend } from "resend";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[send-email] RESEND_API_KEY is not set");
    return Response.json(
      { error: "Email service not configured" },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  let body: { to: string; subject: string; html: string; replyTo?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { to, subject, html, replyTo } = body;

  if (!to || !subject || !html) {
    return Response.json(
      { error: "Missing required fields: to, subject, html" },
      { status: 400 },
    );
  }

  try {
    const data = await resend.emails.send({
      from: "Afroditi's Delicacies <noreply@afroditisdelicacies.com>",
      to,
      subject,
      html,
      replyTo: replyTo || "iliaskladakis@outlook.com",
    });

    console.log("[send-email] Sent successfully:", data);
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("[send-email] Resend error:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
