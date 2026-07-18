/**
 * Resend transactional email for GYSH Pages Functions.
 * API key must come from env (Cloudflare secret / .dev.vars) — never VITE_*.
 */

import type { Env } from "./auth";

export const ROOT_DOMAIN = "getyoursidehustle.com";
export const SITE_NAME = "Get Your Side Hustle";
/** Verified sending subdomain in Resend (add DNS for this host). */
export const EMAIL_SENDER_DOMAIN = `notify.${ROOT_DOMAIN}`;
export const EMAIL_FROM_DOMAIN = ROOT_DOMAIN;
export const ADMIN_EMAIL = `info@${ROOT_DOMAIN}`;

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  /** Override default From */
  from?: string;
};

export class EmailSendError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "EmailSendError";
    this.status = status;
  }
}

export function emailConfigured(env: Env): boolean {
  const key = env.RESEND_API_KEY?.trim() ?? "";
  return key.startsWith("re_") && key.length > 12;
}

export function defaultFromAddress(env: Env): string {
  const override = env.EMAIL_FROM?.trim();
  if (override) return override;
  return `${SITE_NAME} <noreply@${EMAIL_SENDER_DOMAIN}>`;
}

export async function sendResendEmail(
  env: Env,
  payload: SendEmailInput,
): Promise<{ id: string | null }> {
  const apiKey = env.RESEND_API_KEY?.trim();
  if (!apiKey || !apiKey.startsWith("re_")) {
    throw new EmailSendError("RESEND_API_KEY is not configured", 500);
  }

  const to = Array.isArray(payload.to) ? payload.to : [payload.to];
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: payload.from || defaultFromAddress(env),
      to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  const bodyText = await res.text();
  let body: Record<string, unknown> = {};
  try {
    body = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : {};
  } catch {
    body = { raw: bodyText };
  }

  if (!res.ok) {
    const message =
      (typeof body.message === "string" && body.message) ||
      `Resend API error (${res.status})`;
    throw new EmailSendError(message, res.status);
  }

  return { id: typeof body.id === "string" ? body.id : null };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordChangedNotice(
  env: Env,
  to: string,
  name: string,
): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const safeName = escapeHtml(name || "there");
  await sendResendEmail(env, {
    to,
    subject: `${SITE_NAME} — password updated`,
    html: `<p>Hi ${safeName},</p>
<p>Your ${escapeHtml(SITE_NAME)} admin password was just updated.</p>
<p>If you did not make this change, contact <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a> immediately.</p>
<p>— ${escapeHtml(SITE_NAME)}</p>`,
    text: `Hi ${name || "there"},\n\nYour ${SITE_NAME} admin password was just updated.\nIf you did not make this change, contact ${ADMIN_EMAIL} immediately.\n`,
  });
  return true;
}

export async function sendContactMessage(
  env: Env,
  input: { name: string; email: string; message: string },
): Promise<{ id: string | null }> {
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const message = escapeHtml(input.message).replace(/\n/g, "<br/>");
  const inbox = env.CONTACT_TO?.trim() || ADMIN_EMAIL;

  return sendResendEmail(env, {
    to: inbox,
    subject: `[GYSH contact] ${input.name.slice(0, 60)}`,
    html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
<p><strong>Message:</strong></p>
<p>${message}</p>`,
    text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
    // Reply-to is not in minimal Resend payload here; include email in body.
  });
}
