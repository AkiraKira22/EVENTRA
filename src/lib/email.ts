import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { formatEventDate } from "@/lib/utils";

// ============================================================
// Transactional email via SMTP (nodemailer).
//
// Configured through SMTP_* env vars. When SMTP is not configured the helpers
// become a logged no-op, so the app runs fine in dev/CI without a mail server.
// ============================================================

const FROM = process.env.SMTP_FROM ?? "Eventra <no-reply@eventra.dev>";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

let transporter: Transporter | null = null;
let warned = false;

function getTransporter(): Transporter | null {
  if (!process.env.SMTP_HOST) {
    if (!warned) {
      console.info(
        "[email] SMTP_HOST not set — transactional emails are disabled (no-op)."
      );
      warned = true;
    }
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.info(`[email:skip] would send "${opts.subject}" → ${opts.to}`);
    return false;
  }
  try {
    await t.sendMail({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text ?? stripTags(opts.html),
    });
    return true;
  } catch (error) {
    // Never let a mail failure break the API request.
    console.error("[email:error]", error);
    return false;
  }
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\n{2,}/g, "\n").trim();
}

function layout(heading: string, body: string, cta?: { label: string; url: string }): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
    <h1 style="font-size:20px;margin:0 0 16px">${heading}</h1>
    <div style="font-size:14px;line-height:1.6;color:#334155">${body}</div>
    ${
      cta
        ? `<p style="margin:24px 0"><a href="${cta.url}" style="background:#0d9488;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;display:inline-block">${cta.label}</a></p>`
        : ""
    }
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
    <p style="font-size:12px;color:#94a3b8;margin:0">Eventra · Event Registration System</p>
  </div>`;
}

type EventInfo = { id: string; title: string; date: string | Date };

function eventUrl(eventId: string) {
  return `${APP_URL}/events/${eventId}`;
}

/** Email sent right after a registration is created, tailored to its status. */
export async function sendRegistrationEmail(args: {
  to: string;
  name: string;
  event: EventInfo;
  status: "CONFIRMED" | "PENDING" | "WAITLISTED";
}): Promise<void> {
  const { to, name, event, status } = args;
  const when = formatEventDate(event.date);
  const map = {
    CONFIRMED: {
      subject: `You're registered for ${event.title}`,
      heading: "Registration confirmed 🎉",
      body: `Hi ${name},<br/><br/>You're confirmed for <strong>${event.title}</strong> on ${when}. We'll see you there!`,
    },
    PENDING: {
      subject: `Registration received — ${event.title}`,
      heading: "Awaiting approval",
      body: `Hi ${name},<br/><br/>Your registration for <strong>${event.title}</strong> (${when}) was received and is awaiting organizer approval. We'll email you once it's reviewed.`,
    },
    WAITLISTED: {
      subject: `You're on the waitlist — ${event.title}`,
      heading: "You're on the waitlist",
      body: `Hi ${name},<br/><br/><strong>${event.title}</strong> (${when}) is currently full, so you've been added to the waitlist. We'll notify you automatically if a spot opens up.`,
    },
  }[status];

  await sendEmail({
    to,
    subject: map.subject,
    html: layout(map.heading, map.body, { label: "View event", url: eventUrl(event.id) }),
  });
}

/** Email sent when an organizer approves or rejects a pending registration. */
export async function sendApprovalDecisionEmail(args: {
  to: string;
  name: string;
  event: EventInfo;
  approved: boolean;
}): Promise<void> {
  const { to, name, event, approved } = args;
  const when = formatEventDate(event.date);
  await sendEmail({
    to,
    subject: approved
      ? `Approved: ${event.title}`
      : `Update on your registration — ${event.title}`,
    html: layout(
      approved ? "You're in! ✅" : "Registration not approved",
      approved
        ? `Hi ${name},<br/><br/>Your registration for <strong>${event.title}</strong> on ${when} has been <strong>approved</strong>. See you there!`
        : `Hi ${name},<br/><br/>Unfortunately your registration for <strong>${event.title}</strong> (${when}) was not approved by the organizer.`,
      { label: "View event", url: eventUrl(event.id) }
    ),
  });
}

/** Email sent when a waitlisted attendee is promoted into a freed-up slot. */
export async function sendWaitlistPromotionEmail(args: {
  to: string;
  name: string;
  event: EventInfo;
}): Promise<void> {
  const { to, name, event } = args;
  const when = formatEventDate(event.date);
  await sendEmail({
    to,
    subject: `A spot opened up — you're in for ${event.title}`,
    html: layout(
      "A spot opened up 🎉",
      `Hi ${name},<br/><br/>Good news — a place opened up for <strong>${event.title}</strong> on ${when}, and you've been moved off the waitlist. Your spot is confirmed!`,
      { label: "View event", url: eventUrl(event.id) }
    ),
  });
}
