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
  type PerkAudience,
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
  /** Resend reply_to — used for contact form so admins can reply to the sender. */
  replyTo?: string | string[];
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
  // Match contact / ops mail — same From used across GYSH transactional email.
  return `${SITE_NAME} <${ADMIN_EMAIL}>`;
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
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
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
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "password_reset", {
    name: input.name || "Side Hustler",
    resetUrl: input.resetUrl,
    ctaUrl: input.resetUrl,
  });
  if (!rendered) return false;
  await sendResendEmail(env, {
    to: input.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
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
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "password_changed", {
    name: name || "there",
  });
  if (!rendered) return false;
  await sendResendEmail(env, {
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
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
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "contact_inbox", {
    name: input.name.slice(0, 60),
    email: input.email,
    message,
  });
  if (!rendered) {
    return sendResendEmail(env, {
      to: recipients,
      replyTo: input.email,
      subject: `[GYSH contact] ${input.name.slice(0, 60)}`,
      html: `<p>${name} &lt;${email}&gt;</p><p>${message}</p>`,
      text: `${input.name} <${input.email}>\n\n${input.message}`,
      templateSlug: "contact_inbox",
      meta: { from: input.email, name: input.name, recipients },
    });
  }
  return sendResendEmail(env, {
    to: recipients,
    replyTo: input.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
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
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "admin_form_notify", {
    name: input.formName,
    message: input.detailsHtml,
    email: input.replyTo || "",
    ctaUrl: input.replyTo ? `mailto:${input.replyTo}` : `${SITE_URL}/?next=admin`,
  });
  const subject = rendered
    ? `${rendered.subject} ${input.summary.slice(0, 80)}`.trim()
    : `[GYSH ${input.formName}] ${input.summary.slice(0, 80)}`;
  await sendResendEmail(env, {
    to: recipients,
    subject,
    html: rendered?.html || input.detailsHtml,
    text: rendered?.text || input.summary,
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
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "registration_confirmation", {
    name: user.name || "Side Hustler",
    tier: tierLabel(tier),
    audience: audiencePretty(audience),
    perksHtml: perkBulletsHtml(tier, audience),
    upgradesHtml: upgradesHtml(tier, audience),
    certHtml: cert?.certHtml || "",
    ctaUrl: joinUrl,
  });
  if (!rendered) return false;
  await sendResendEmail(env, {
    to: user.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
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
  const slug = `welcome_${tier}`;
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, slug, {
    name: user.name || "Side Hustler",
    tier: tierLabel(tier),
    perksHtml: perkBulletsHtml(tier, audience),
    upgradesHtml: upgradesHtml(tier, audience),
    certHtml: cert?.certHtml || "",
    ctaUrl: joinUrl,
  });
  if (!rendered) return false;
  await sendResendEmail(env, {
    to: user.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    templateSlug: slug,
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
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "parent_consent", {
    childName: input.childName,
    audienceLabel: label,
    consentUrl: input.consentUrl,
    ctaUrl: input.consentUrl,
  });
  if (!rendered) {
    return { id: null };
  }
  return sendResendEmail(env, {
    to: input.parentEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    templateSlug: "parent_consent",
    meta: {
      childName: input.childName,
      audience: input.audience,
      consentUrl: input.consentUrl,
    },
  });
}

export async function sendParentAccountReadyEmail(
  env: Env,
  input: { parentEmail: string; parentName: string; childName: string },
): Promise<{ id: string | null }> {
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "parent_account_ready", {
    name: input.parentName || "there",
    email: input.parentEmail,
    childName: input.childName,
  });
  if (!rendered) return { id: null };
  return sendResendEmail(env, {
    to: input.parentEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    templateSlug: "parent_account_ready",
    meta: { childName: input.childName },
  });
}

/** Tell the kid (and parent) that the kid login is ready to use. */
export async function sendKidLoginReadyEmails(
  env: Env,
  input: {
    childName: string;
    childEmail: string;
    parentEmail: string;
    parentName?: string;
  },
): Promise<void> {
  const childEmail = String(input.childEmail || "").trim();
  const parentEmail = String(input.parentEmail || "").trim();
  if (!childEmail.includes("@") || !parentEmail.includes("@")) return;

  const { renderCatalogEmail } = await import("./email-admin");
  const kidRendered = await renderCatalogEmail(env, "kid_login_ready", {
    name: input.childName,
    email: childEmail,
    childName: input.childName,
  });
  if (kidRendered) {
    await sendResendEmail(env, {
      to: childEmail,
      subject: kidRendered.subject,
      html: kidRendered.html,
      text: kidRendered.text,
      templateSlug: "kid_login_ready",
      meta: { childName: input.childName, role: "kid" },
    });
  }

  const parentRendered = await renderCatalogEmail(env, "kid_login_ready_parent", {
    name: input.parentName || "there",
    email: childEmail,
    childName: input.childName,
  });
  if (parentRendered) {
    await sendResendEmail(env, {
      to: parentEmail,
      subject: parentRendered.subject,
      html: parentRendered.html,
      text: parentRendered.text,
      templateSlug: "kid_login_ready_parent",
      meta: { childName: input.childName, childEmail, role: "parent" },
    });
  }
}

export async function sendKidLoginNotifyEmail(
  env: Env,
  input: { parentEmail: string; parentName: string; childName: string; loggedInAt: string },
): Promise<{ id: string | null }> {
  const when = new Date(input.loggedInAt);
  const whenLabel = Number.isNaN(when.getTime())
    ? input.loggedInAt
    : when.toLocaleString("en-US", { timeZone: "America/Chicago" });
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "kid_login_notify", {
    name: input.parentName || "there",
    childName: input.childName,
    message: `Signed in around ${whenLabel} (Central).`,
  });
  if (!rendered) return { id: null };
  return sendResendEmail(env, {
    to: input.parentEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    templateSlug: "kid_login_notify",
    meta: { childName: input.childName, loggedInAt: input.loggedInAt },
  });
}

export async function sendParentKidProgressReportEmail(
  env: Env,
  input: {
    parentEmail: string;
    parentName: string;
    cadence: "daily" | "weekly";
    periodKey: string;
    children: Array<{ name: string; ageBand: string; blueprintTop: string | null }>;
    recentLogins: Array<{ childName: string; at: string }>;
  },
): Promise<{ id: string | null }> {
  const cadenceLabel = input.cadence === "daily" ? "Daily" : "Weekly";
  const kidsHtml = input.children
    .map(
      (c) =>
        `<li style="margin:0 0 6px;"><strong>${escapeHtml(c.name)}</strong> (${escapeHtml(c.ageBand === "junior" ? "Teens" : "Kids")})${
          c.blueprintTop ? ` · Blueprint top match: ${escapeHtml(c.blueprintTop)}` : " · No Blueprint assigned yet"
        }</li>`,
    )
    .join("");
  const loginsHtml =
    input.recentLogins.length === 0
      ? `<p style="margin:0;">No kid logins in this period.</p>`
      : `<ul style="margin:0;padding-left:18px;">${input.recentLogins
          .slice(0, 20)
          .map(
            (l) =>
              `<li style="margin:0 0 4px;">${escapeHtml(l.childName)} · ${escapeHtml(
                new Date(l.at).toLocaleString("en-US", { timeZone: "America/Chicago" }),
              )}</li>`,
          )
          .join("")}</ul>`;
  const digestBodyHtml = `<p style="margin:0 0 8px;"><strong>Linked kids</strong></p>
      <ul style="margin:0 0 14px;padding-left:18px;">${kidsHtml}</ul>
      <p style="margin:0 0 8px;"><strong>Recent logins</strong></p>
      ${loginsHtml}`;
  const slug = `parent_kid_progress_${input.cadence}`;
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, slug, {
    name: input.parentName || "there",
    periodKey: input.periodKey,
    cadence: cadenceLabel,
    digestBodyHtml,
  });
  if (!rendered) return { id: null };
  return sendResendEmail(env, {
    to: input.parentEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    templateSlug: slug,
    meta: { cadence: input.cadence, periodKey: input.periodKey, childCount: input.children.length },
  });
}

export { EMAIL_TEMPLATE_CATALOG } from "./email-template-content";
