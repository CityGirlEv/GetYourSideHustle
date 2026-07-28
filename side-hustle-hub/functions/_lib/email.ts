/**
 * Resend transactional email for GYSH Pages Functions.
 * Every send is logged to email_log with status.
 */

import type { DbUser, Env } from "./auth";
import {
  ADMIN_EMAIL,
  ADMIN_NOTIFY_CC,
  EMAIL_SENDER_DOMAIN,
  SITE_NAME,
  SITE_URL,
  escapeHtml,
  membershipDeepLink,
  normalizeAudience,
  normalizeTier,
  perkBulletsHtml,
  tierLabel,
  upgradesHtml,
  wrapBrandedEmail,
  type PerkAudience,
  type TierId,
} from "./email-brand";
import { PARTNER_ADMINS } from "./partners";

export { ROOT_DOMAIN, SITE_NAME, EMAIL_SENDER_DOMAIN, ADMIN_EMAIL } from "./email-brand";
export { SITE_URL };

export type EmailAttachment = {
  filename: string;
  content: string; // base64
  contentType?: string;
};

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  templateSlug: string;
  userId?: string | null;
  meta?: Record<string, unknown>;
  attachments?: EmailAttachment[];
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

async function ensureEmailLog(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS email_log (
      id TEXT PRIMARY KEY,
      template_slug TEXT NOT NULL,
      to_email TEXT NOT NULL,
      user_id TEXT,
      subject TEXT NOT NULL,
      status TEXT NOT NULL,
      provider_id TEXT,
      error TEXT NOT NULL DEFAULT '',
      meta_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    )`,
  ).run();
}

export async function logEmail(
  env: Env,
  row: {
    templateSlug: string;
    toEmail: string;
    userId?: string | null;
    subject: string;
    status: "sent" | "failed" | "skipped";
    providerId?: string | null;
    error?: string;
    meta?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await ensureEmailLog(env);
    await env.DB.prepare(
      `INSERT INTO email_log (id, template_slug, to_email, user_id, subject, status, provider_id, error, meta_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        row.templateSlug,
        row.toEmail,
        row.userId ?? null,
        row.subject,
        row.status,
        row.providerId ?? null,
        row.error ?? "",
        JSON.stringify(row.meta ?? {}),
        new Date().toISOString(),
      )
      .run();
  } catch {
    /* never break the product path on log failure */
  }
}

async function logEmailToAll(
  env: Env,
  toList: string[],
  row: Omit<Parameters<typeof logEmail>[1], "toEmail">,
): Promise<void> {
  const targets = toList.length ? toList : [""];
  await Promise.all(targets.map((toEmail) => logEmail(env, { ...row, toEmail })));
}

export async function sendResendEmail(
  env: Env,
  payload: SendEmailInput,
): Promise<{ id: string | null }> {
  const apiKey = env.RESEND_API_KEY?.trim();
  const toList = (Array.isArray(payload.to) ? payload.to : [payload.to])
    .map((e) => String(e || "").trim().toLowerCase())
    .filter(Boolean);

  if (!apiKey || !apiKey.startsWith("re_")) {
    await logEmailToAll(env, toList, {
      templateSlug: payload.templateSlug,
      userId: payload.userId,
      subject: payload.subject,
      status: "skipped",
      error: "RESEND_API_KEY is not configured",
      meta: payload.meta,
    });
    throw new EmailSendError("RESEND_API_KEY is not configured", 500);
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: payload.from || defaultFromAddress(env),
        to: toList,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        ...(payload.attachments?.length
          ? {
              attachments: payload.attachments.map((a) => ({
                filename: a.filename,
                content: a.content,
                content_type: a.contentType || "application/octet-stream",
              })),
            }
          : {}),
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
        (typeof body.message === "string" && body.message) || `Resend API error (${res.status})`;
      await logEmailToAll(env, toList, {
        templateSlug: payload.templateSlug,
        userId: payload.userId,
        subject: payload.subject,
        status: "failed",
        error: message,
        meta: payload.meta,
      });
      throw new EmailSendError(message, res.status);
    }

    const providerId = typeof body.id === "string" ? body.id : null;
    await logEmailToAll(env, toList, {
      templateSlug: payload.templateSlug,
      userId: payload.userId,
      subject: payload.subject,
      status: "sent",
      providerId,
      meta: payload.meta,
    });
    return { id: providerId };
  } catch (e) {
    if (e instanceof EmailSendError) throw e;
    const message = e instanceof Error ? e.message : String(e);
    await logEmailToAll(env, toList, {
      templateSlug: payload.templateSlug,
      userId: payload.userId,
      subject: payload.subject,
      status: "failed",
      error: message,
      meta: payload.meta,
    });
    throw new EmailSendError(message, 500);
  }
}

export async function sendPasswordResetEmail(
  env: Env,
  input: { to: string; name: string; resetUrl: string; userId?: string },
): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const branded = wrapBrandedEmail({
    preheader: "Reset your Get Your Side Hustle password.",
    eyebrow: "Account security",
    headline: "Reset your password",
    subhead: `Hi ${input.name || "Side Hustler"}, we received a request to reset a GYSH password for this email.`,
    bodyHtml: `<p style="margin:0 0 12px;">If an account exists for this email address, tap the button below to choose a new password. This link expires in <strong>1 hour</strong> and can only be used once.</p>
      <p style="margin:0 0 12px;">If you didn’t ask for this, you can ignore this email — your password stays the same.</p>`,
    ctaLabel: "Reset my password",
    ctaUrl: input.resetUrl,
    footerNote: "Never share this link. GYSH will never ask for your password by email.",
  });
  await sendResendEmail(env, {
    to: input.to,
    subject: `${SITE_NAME} — reset your password`,
    html: branded.html,
    text: branded.text,
    templateSlug: "password_reset",
    userId: input.userId,
    meta: { resetUrl: input.resetUrl },
  });
  return true;
}

export async function sendPasswordChangedNotice(
  env: Env,
  to: string,
  name: string,
  userId?: string,
): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const safeName = escapeHtml(name || "there");
  const branded = wrapBrandedEmail({
    preheader: "Your GYSH password was just updated.",
    eyebrow: "Account security",
    headline: "Password updated — you're locked in.",
    subhead: `Hi ${name || "there"}, your Get Your Side Hustle password changed successfully.`,
    bodyHtml: `<p style="margin:0 0 12px;">If <strong>you</strong> made this change, you're all set — keep building that Side Hustle momentum.</p>
      <p style="margin:0 0 12px;">If you <em>didn't</em> change it, contact us immediately at <a href="mailto:${ADMIN_EMAIL}" style="color:#9B2F28;">${ADMIN_EMAIL}</a>.</p>`,
    ctaLabel: "Open GYSH",
    ctaUrl: SITE_URL,
    footerNote: "Security tip: use a unique password you don't reuse elsewhere.",
  });
  await sendResendEmail(env, {
    to,
    subject: `${SITE_NAME} — password updated`,
    html: branded.html,
    text: branded.text,
    templateSlug: "password_changed",
    userId,
    meta: { name: safeName },
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
  const recipients = adminRecipients(env);
  const branded = wrapBrandedEmail({
    preheader: `New contact from ${input.name}`,
    eyebrow: "Inbox · Contact Us",
    headline: "New message just landed!",
    subhead: `${input.name} wrote in from the GYSH Contact form.`,
    bodyHtml: `<p style="margin:0 0 8px;"><strong>From:</strong> ${name} &lt;<a href="mailto:${email}" style="color:#9B2F28;">${email}</a>&gt;</p>
      <div style="margin:16px 0;padding:16px;border-radius:12px;background:#f7f0df;border:1px solid #e2d5bc;">${message}</div>`,
    ctaLabel: "Reply to sender",
    ctaUrl: `mailto:${input.email}`,
  });
  return sendResendEmail(env, {
    to: recipients,
    subject: `[GYSH contact] ${input.name.slice(0, 60)}`,
    html: branded.html,
    text: branded.text,
    templateSlug: "contact_inbox",
    meta: { from: input.email, name: input.name, recipients },
  });
}

/** Ops inbox + partner admins (Tina, Evelyn, Lyriq) + ADMIN_NOTIFY_CC. */
export function adminRecipients(env: Env): string[] {
  const primary = (env.CONTACT_TO?.trim() || ADMIN_EMAIL).toLowerCase();
  const partners = PARTNER_ADMINS.map((p) => p.email.trim().toLowerCase());
  const cc = ADMIN_NOTIFY_CC.map((e) => e.trim().toLowerCase());
  return [...new Set([primary, ...partners, ...cc].filter(Boolean))];
}

function audiencePretty(raw: string | null | undefined): string {
  const a = normalizeAudience(raw);
  if (a === "kids") return "Kids";
  if (a === "junior") return "Teens";
  if (a === "senior") return "Seniors";
  return "Adults";
}

async function certificateAttachment(
  env: Env,
  user: {
    id: string;
    email: string;
    name: string;
    membership_tier?: string | null;
    audience?: string | null;
  },
): Promise<{ attachments: EmailAttachment[]; certHtml: string } | null> {
  try {
    const { issueMemberCertificate, markCertificateEmailed } = await import("./certificates");
    const cert = await issueMemberCertificate(env, {
      userId: user.id,
      name: user.name,
      email: user.email,
      membershipTier: user.membership_tier,
      audience: user.audience,
    });
    const safe = (user.name || "member").replace(/[^\w.-]+/g, "_");
    const attachments: EmailAttachment[] = [];
    if (cert.pdfBase64) {
      attachments.push({
        filename: `GYSH-Family-Certificate-${safe}.pdf`,
        content: cert.pdfBase64,
        contentType: "application/pdf",
      });
    }
    // SVG as second attachment for crisp viewing
    const svgB64 = btoa(unescape(encodeURIComponent(cert.svgMarkup)));
    attachments.push({
      filename: `GYSH-Family-Certificate-${safe}.svg`,
      content: svgB64,
      contentType: "image/svg+xml",
    });
    await markCertificateEmailed(env, user.id);
    const certHtml = `<div style="margin:18px 0;padding:16px;border-radius:14px;border:1px solid #e2d5bc;background:#fff8e8;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#9B2F28;">Your GYSH Family Certificate</p>
      <p style="margin:0 0 8px;font-size:18px;font-weight:800;color:#2d2a26;">${escapeHtml(cert.title)}</p>
      <p style="margin:0;font-size:14px;line-height:1.5;color:#3a342e;">${escapeHtml(cert.bodyText)}</p>
      <p style="margin:10px 0 0;font-size:12px;color:#8a7a68;">Attached as PDF + SVG — open the attachment to print or share.</p>
    </div>`;
    return { attachments, certHtml };
  } catch {
    return null;
  }
}

/** Notify admins whenever a public form is completed. */
export async function sendAdminFormNotify(
  env: Env,
  input: {
    formName: string;
    summary: string;
    detailsHtml: string;
    replyTo?: string;
    meta?: Record<string, unknown>;
  },
): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const recipients = adminRecipients(env);
  const branded = wrapBrandedEmail({
    preheader: `GYSH form: ${input.formName}`,
    eyebrow: "Admin inbox · Form alert",
    headline: `New ${input.formName}`,
    subhead: input.summary,
    bodyHtml: input.detailsHtml,
    ctaLabel: input.replyTo ? "Reply to sender" : "Open GYSH Admin",
    ctaUrl: input.replyTo ? `mailto:${input.replyTo}` : `${SITE_URL}/?next=admin`,
    footerNote: "This alert was sent because a GYSH public form was completed.",
  });
  await sendResendEmail(env, {
    to: recipients,
    subject: `[GYSH ${input.formName}] ${input.summary.slice(0, 80)}`,
    html: branded.html,
    text: branded.text,
    templateSlug: "admin_form_notify",
    meta: { formName: input.formName, recipients, ...(input.meta || {}) },
  });
  return true;
}

export async function sendRegistrationConfirmation(
  env: Env,
  user: Pick<DbUser, "id" | "email" | "name"> & {
    audience?: string | null;
    membership_tier?: string | null;
  },
): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const tier = normalizeTier(user.membership_tier);
  const audience = normalizeAudience(user.audience) as PerkAudience;
  const joinUrl = membershipDeepLink();
  const cert = await certificateAttachment(env, {
    id: user.id,
    email: user.email,
    name: user.name,
    membership_tier: tier,
    audience,
  });
  const branded = wrapBrandedEmail({
    preheader: "Welcome to the GYSH family — your membership details inside!",
    eyebrow: "Membership · Pending activation",
    headline: `${user.name || "Side Hustler"}, welcome to the GYSH family!`,
    subhead: `You're on the ${tierLabel(tier)} plan (${audiencePretty(audience)} lane). An admin will activate your login soon.`,
    bodyHtml: `<p style="margin:0 0 12px;">We've saved your membership request. Here's what you unlocked on <strong>${escapeHtml(tierLabel(tier))}</strong>:</p>
      ${perkBulletsHtml(tier, audience)}
      ${cert?.certHtml || ""}
      ${upgradesHtml(tier, audience)}
      <p style="margin:16px 0 0;padding:12px 14px;background:#fff4e8;border-radius:12px;border-left:4px solid #9B2F28;">
        <strong>Next:</strong> A GYSH admin activates your account. You'll get a second email the moment you can sign in.
      </p>`,
    ctaLabel: "Explore membership upgrades",
    ctaUrl: joinUrl,
    footerNote: "Pending accounts can't sign in until an admin activates them.",
  });
  await sendResendEmail(env, {
    to: user.email,
    subject: `${SITE_NAME} — welcome to the GYSH family!`,
    html: branded.html,
    text: branded.text,
    templateSlug: "registration_confirmation",
    userId: user.id,
    attachments: cert?.attachments,
    meta: { tier, audience, certificateAttached: Boolean(cert) },
  });

  // Admin: new member signup
  try {
    await sendAdminFormNotify(env, {
      formName: "New member signup",
      summary: `${user.name} · ${user.email} · ${tierLabel(tier)} / ${audiencePretty(audience)}`,
      detailsHtml: `<p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(user.name)}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(user.email)}" style="color:#9B2F28;">${escapeHtml(user.email)}</a></p>
        <p style="margin:0 0 8px;"><strong>Plan:</strong> ${escapeHtml(tierLabel(tier))} (pending activation)</p>
        <p style="margin:0 0 8px;"><strong>Lane:</strong> ${escapeHtml(audiencePretty(audience))}</p>
        <p style="margin:12px 0 0;padding:12px;background:#fff4e8;border-radius:10px;"><strong>Action needed:</strong> Open Admin → Users Area and set status to <strong>active</strong> to let them sign in. Activation sends their welcome email + certificate.</p>`,
      replyTo: user.email,
      meta: { userId: user.id, tier, audience },
    });
  } catch {
    /* non-fatal */
  }
  return true;
}

export async function sendAccountActivatedWelcome(
  env: Env,
  user: {
    id: string;
    email: string;
    name: string;
    membership_tier?: string | null;
    audience?: string | null;
  },
): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const tier = normalizeTier(user.membership_tier);
  const audience = normalizeAudience(user.audience) as PerkAudience;
  const joinUrl = membershipDeepLink();
  const cert = await certificateAttachment(env, user);
  const branded = wrapBrandedEmail({
    preheader: `You're activated on ${tierLabel(tier)} — certificate attached!`,
    eyebrow: "You're in · Account activated",
    headline: `${user.name || "Side Hustler"}, your GYSH account is LIVE!`,
    subhead: `Welcome to the hustle family on the ${tierLabel(tier)} plan. Your Welcome Certificate is attached.`,
    bodyHtml: `<p style="margin:0 0 14px;">This is your official green light. Log in, claim your Blueprint, and use every perk that comes with <strong>${tierLabel(tier)}</strong>.</p>
      <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#947d64;">Your ${escapeHtml(tierLabel(tier))} perks</p>
      ${perkBulletsHtml(tier, audience)}
      ${cert?.certHtml || ""}
      ${upgradesHtml(tier, audience)}
      <p style="margin:18px 0 0;">Ready for more guides, coaching, and the schedule suite? Tap below to review plans and upgrade.</p>`,
    ctaLabel: "See membership & upgrade",
    ctaUrl: joinUrl,
    footerNote: "Sign in anytime at getyoursidehustle.com — your certificate is attached to this email.",
  });
  await sendResendEmail(env, {
    to: user.email,
    subject: `${SITE_NAME} — you're activated! Welcome aboard 🚀`,
    html: branded.html,
    text: branded.text,
    templateSlug: `welcome_${tier}`,
    userId: user.id,
    attachments: cert?.attachments,
    meta: { tier, audience, joinUrl, certificateAttached: Boolean(cert) },
  });
  return true;
}

export async function sendParentConsentEmail(
  env: Env,
  input: { parentEmail: string; childName: string; consentUrl: string; audience: "kids" | "junior" },
): Promise<{ id: string | null }> {
  const label = input.audience === "junior" ? "Teens" : "Kids";
  const branded = wrapBrandedEmail({
    preheader: `Approve ${input.childName}'s GYSH ${label} team request`,
    eyebrow: `${label} Corner · Parent consent`,
    headline: "A young Side Hustler needs your yes!",
    subhead: `${input.childName} asked to join the GYSH ${label} team — with you as GYSH Coach.`,
    bodyHtml: `<p style="margin:0 0 12px;">You're the coach. Cheer, set boundaries, and help turn ideas into safe first wins.</p>
      <p style="margin:0 0 12px;">Parental consent is required through age 12. Tap below to grant permission. Until you approve, the account stays pending.</p>`,
    ctaLabel: "Approve as parent / guardian",
    ctaUrl: input.consentUrl,
    footerNote: "If you didn't expect this, you can ignore this email.",
  });
  return sendResendEmail(env, {
    to: input.parentEmail,
    subject: `${SITE_NAME} — approve ${input.childName}'s ${label} team request`,
    html: branded.html,
    text: branded.text,
    templateSlug: "parent_consent",
    meta: {
      childName: input.childName,
      audience: input.audience,
      consentUrl: input.consentUrl,
    },
  });
}

/** Catalog of template slugs for the admin Email Templates page. */
export const EMAIL_TEMPLATE_CATALOG: Array<{
  slug: string;
  name: string;
  description: string;
  sampleSubject: string;
}> = [
  {
    slug: "registration_confirmation",
    name: "Registration confirmation",
    description: "Sent when someone registers — pending admin activation.",
    sampleSubject: `${SITE_NAME} — we got your signup!`,
  },
  {
    slug: "welcome_free",
    name: "Welcome · Free",
    description: "Sent when an admin activates a Free member.",
    sampleSubject: `${SITE_NAME} — you're activated! Welcome aboard`,
  },
  {
    slug: "welcome_starter",
    name: "Welcome · Starter",
    description: "Activation welcome framed for Starter perks + upgrades.",
    sampleSubject: `${SITE_NAME} — you're activated! Welcome aboard`,
  },
  {
    slug: "welcome_pro",
    name: "Welcome · Pro",
    description: "Activation welcome framed for Pro perks + Elite upgrade.",
    sampleSubject: `${SITE_NAME} — you're activated! Welcome aboard`,
  },
  {
    slug: "welcome_elite",
    name: "Welcome · Elite",
    description: "Activation welcome for Elite members.",
    sampleSubject: `${SITE_NAME} — you're activated! Welcome aboard`,
  },
  {
    slug: "parent_consent",
    name: "Parent consent",
    description: "Kids/Teens team signup — parent must approve.",
    sampleSubject: `${SITE_NAME} — approve a team request`,
  },
  {
    slug: "contact_inbox",
    name: "Contact form → admin",
    description: "Internal alert when Contact Us is submitted.",
    sampleSubject: `[GYSH contact] …`,
  },
  {
    slug: "admin_form_notify",
    name: "Admin form notify",
    description: "Alert to admins whenever a public form is completed.",
    sampleSubject: `[GYSH …] …`,
  },
  {
    slug: "password_reset",
    name: "Password reset link",
    description: "Forgot-password email with one-time reset link.",
    sampleSubject: `${SITE_NAME} — reset your password`,
  },
  {
    slug: "password_changed",
    name: "Password changed",
    description: "Security notice after password update.",
    sampleSubject: `${SITE_NAME} — password updated`,
  },
  {
    slug: "daily_admin_digest",
    name: "Daily Admin/QA digest",
    description:
      "Personal sprint summary for each Admin/QA at ~12:01 America/Chicago — outstanding, recently updated, new, and reassigned-away items.",
    sampleSubject: `${SITE_NAME} — daily digest for Evelyn (…)`,
  },
];
