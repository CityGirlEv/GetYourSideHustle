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
  adminFormNotifyCtaUrl,
  normalizeAudience,
  normalizeTier,
  perkBulletsHtml,
  tierLabel,
  upgradesHtml,
  type PerkAudience,
} from "./email-brand";
import { PARTNER_ADMINS } from "./partners";
import { ensureEmailLegalDisclaimer } from "../../src/lib/legal-disclaimer";
import { STRIPE_CATALOG } from "./stripe-catalog.generated";
import { formatPurchasePaymentDetail } from "../../src/lib/purchase-payment";
import { merchItemCount } from "../../src/lib/membership";
import { merchEmailVars } from "../../src/lib/membership-email-copy";

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

function membershipCatalogEmailVars(
  tier: ReturnType<typeof normalizeTier>,
  audience: PerkAudience,
  extra: Record<string, string> = {},
): Record<string, string> {
  return {
    tier: tierLabel(tier),
    perksHtml: perkBulletsHtml(tier, audience),
    upgradesHtml: upgradesHtml(tier, audience),
    ...(merchItemCount(tier) > 0 ? merchEmailVars(tier) : {}),
    ...extra,
  };
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
  const bccList = outgoingAdminCopy(toList, env);

  const withLegal = ensureEmailLegalDisclaimer({
    html: payload.html,
    text: payload.text,
  });

  if (!apiKey || !apiKey.startsWith("re_")) {
    await logEmailToAll(env, toList, {
      templateSlug: payload.templateSlug,
      userId: payload.userId,
      subject: payload.subject,
      status: "skipped",
      error: "RESEND_API_KEY is not configured",
      meta: { ...payload.meta, adminBcc: bccList },
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
        ...(bccList.length ? { bcc: bccList } : {}),
        subject: payload.subject,
        html: withLegal.html,
        text: withLegal.text,
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
        meta: { ...payload.meta, adminBcc: bccList },
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
      meta: { ...payload.meta, adminBcc: bccList },
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
      meta: { ...payload.meta, adminBcc: bccList },
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

/** BCC on every member-facing send so admin sees outgoing mail (skip addresses already in To). */
export function outgoingAdminCopy(
  to: string | string[],
  env?: { CONTACT_TO?: string },
): string[] {
  const toSet = new Set(
    (Array.isArray(to) ? to : [to]).map((e) => String(e || "").trim().toLowerCase()).filter(Boolean),
  );
  const copies = [
    (env?.CONTACT_TO?.trim() || ADMIN_EMAIL).toLowerCase(),
    ADMIN_EMAIL.toLowerCase(),
    "evelyn3@cox.net",
    ...ADMIN_NOTIFY_CC.map((e) => e.trim().toLowerCase()),
  ];
  return [...new Set(copies)].filter((e) => e && !toSet.has(e));
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
        filename: `Get-Your-Side-Hustle-Certificate-${safe}.pdf`,
        content: cert.pdfBase64,
        contentType: "application/pdf",
      });
    }
    // SVG as second attachment for crisp viewing
    const svgB64 = btoa(unescape(encodeURIComponent(cert.svgMarkup)));
    attachments.push({
      filename: `Get-Your-Side-Hustle-Certificate-${safe}.svg`,
      content: svgB64,
      contentType: "image/svg+xml",
    });
    await markCertificateEmailed(env, user.id);
    const certHtml = `<div style="margin:18px 0;padding:16px;border-radius:14px;border:1px solid #e2d5bc;background:#fff8e8;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#9B2F28;">Your Get Your Side Hustle Family Certificate</p>
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
    /** Sets Resend reply_to so Reply opens the sender — not the CTA button. */
    replyTo?: string;
    /** Optional Admin deep link; defaults to Users Area (never mailto). */
    ctaUrl?: string;
    meta?: Record<string, unknown>;
  },
): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const recipients = adminRecipients(env);
  const ctaUrl = adminFormNotifyCtaUrl(input.ctaUrl);
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "admin_form_notify", {
    name: input.formName,
    message: input.detailsHtml,
    email: input.replyTo || "",
    ctaUrl,
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
    replyTo: input.replyTo,
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
  opts?: {
    /**
     * Pending signups skip the PDF/SVG cert (issued on activation).
     * Keeps register + Resend fast.
     */
    includeCertificate?: boolean;
    heardAbout?: string | null;
  },
): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const tier = normalizeTier(user.membership_tier);
  const audience = normalizeAudience(user.audience) as PerkAudience;
  const joinUrl = membershipDeepLink();
  const includeCertificate = opts?.includeCertificate === true;
  const cert = includeCertificate
    ? await certificateAttachment(env, {
        id: user.id,
        email: user.email,
        name: user.name,
        membership_tier: tier,
        audience,
      })
    : null;
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "registration_confirmation", {
    name: user.name || "Side Hustler",
    audience: audiencePretty(audience),
    certHtml: cert?.certHtml || "",
    ctaUrl: joinUrl,
    ...membershipCatalogEmailVars(tier, audience),
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

  const heardAbout = String(opts?.heardAbout || "").trim();
  const heardLine = heardAbout
    ? `<p style="margin:0 0 8px;"><strong>How they heard about us:</strong> ${escapeHtml(heardAbout)}</p>`
    : "";
  const summaryHeard = heardAbout ? ` · heard: ${heardAbout}` : "";

  // Admin: new member signup
  try {
    await sendAdminFormNotify(env, {
      formName: "New member signup",
      summary: `${user.name} · ${user.email} · ${tierLabel(tier)} / ${audiencePretty(audience)}${summaryHeard}`,
      detailsHtml: `<p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(user.name)}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(user.email)}" style="color:#9B2F28;">${escapeHtml(user.email)}</a></p>
        <p style="margin:0 0 8px;"><strong>Plan:</strong> ${escapeHtml(tierLabel(tier))} (pending activation)</p>
        <p style="margin:0 0 8px;"><strong>Lane:</strong> ${escapeHtml(audiencePretty(audience))}</p>
        ${heardLine}
        <p style="margin:12px 0 0;padding:12px;background:#fff4e8;border-radius:10px;"><strong>Action needed:</strong> Open Admin → Users Area and set status to <strong>active</strong> to let them sign in. Activation sends their welcome email + certificate.</p>`,
      replyTo: user.email,
      meta: { userId: user.id, tier, audience, heardAbout: heardAbout || null },
    });
  } catch {
    /* non-fatal */
  }
  return true;
}

/** True when Adult/Senior paid plans finish email after Stripe (not on profile-only save). */
export function defersMembershipEmailUntilStripe(tier: string, audience: string): boolean {
  const t = normalizeTier(tier);
  const a = normalizeAudience(audience);
  return t !== "free" && (a === "adult" || a === "senior");
}

/** Subscribe vs upgrade copy for paid membership emails. */
export function membershipEmailKind(
  previousTier: string | null | undefined,
  nextTier: string,
): "subscribe" | "upgrade" {
  const prev = normalizeTier(previousTier);
  const next = normalizeTier(nextTier);
  if (next === "free") return "subscribe";
  // Plan changed (including Free → paid) → upgrade email; same tier confirm → subscribe.
  if (prev !== next) return "upgrade";
  return "subscribe";
}

/**
 * Member confirmation + admin alert after a paid subscribe / upgrade.
 * Call after Stripe payment confirm, or after profile plan update when Stripe is not used.
 */
export async function sendMembershipSubscriptionEmails(
  env: Env,
  input: {
    user: Pick<DbUser, "id" | "email" | "name"> & {
      audience?: string | null;
      membership_tier?: string | null;
    };
    previousTier?: string | null;
    source: "stripe" | "profile" | "credits" | "admin";
    amountLabel?: string;
    amountCents?: number;
    creditsApplied?: number;
    sessionId?: string | null;
  },
): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const tier = normalizeTier(input.user.membership_tier);
  if (tier === "free") return false;
  const audience = normalizeAudience(input.user.audience) as PerkAudience;
  const previousTier = normalizeTier(input.previousTier);
  const kind = membershipEmailKind(previousTier, tier);
  const slug = kind === "upgrade" ? "membership_upgraded" : "membership_subscribed";
  const joinUrl = membershipDeepLink();
  const cert = await certificateAttachment(env, {
    id: input.user.id,
    email: input.user.email,
    name: input.user.name,
    membership_tier: tier,
    audience,
  });
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, slug, {
    name: input.user.name || "Side Hustler",
    previousTier: tierLabel(previousTier),
    audience: audiencePretty(audience),
    certHtml: cert?.certHtml || "",
    ctaUrl: joinUrl,
    ...membershipCatalogEmailVars(tier, audience),
  });
  if (rendered) {
    await sendResendEmail(env, {
      to: input.user.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      templateSlug: slug,
      userId: input.user.id,
      attachments: cert?.attachments,
      meta: {
        tier,
        previousTier,
        audience,
        source: input.source,
        kind,
        certificateAttached: Boolean(cert),
      },
    });
  }

  try {
    await sendMembershipMerchReadyEmail(env, {
      id: input.user.id,
      email: input.user.email,
      name: input.user.name,
      membership_tier: tier,
    });
  } catch {
    /* merch follow-up is non-fatal */
  }

  const formName = kind === "upgrade" ? "Membership upgrade" : "Membership subscription";
  const payment = formatPurchasePaymentDetail({
    source: input.source,
    amountCents: input.amountCents,
    creditsApplied: input.creditsApplied,
    sessionId: input.sessionId,
  });
  const amountLine = input.amountLabel
    ? `<p style="margin:0 0 8px;"><strong>Amount:</strong> ${escapeHtml(input.amountLabel)}</p>`
    : `<p style="margin:0 0 8px;"><strong>Amount:</strong> ${escapeHtml(payment.amountLabel)}</p>`;

  try {
    await sendAdminFormNotify(env, {
      formName,
      summary: `${input.user.name} · ${input.user.email} · ${tierLabel(previousTier)} → ${tierLabel(tier)} / ${audiencePretty(audience)}`,
      detailsHtml: `<p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(input.user.name || "")}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(input.user.email)}" style="color:#9B2F28;">${escapeHtml(input.user.email)}</a></p>
        <p style="margin:0 0 8px;"><strong>Plan:</strong> ${escapeHtml(tierLabel(previousTier))} → <strong>${escapeHtml(tierLabel(tier))}</strong></p>
        <p style="margin:0 0 8px;"><strong>Lane:</strong> ${escapeHtml(audiencePretty(audience))}</p>
        ${amountLine}${payment.html}
        <p style="margin:12px 0 0;padding:12px;background:#fff4e8;border-radius:10px;">Open Admin → Users / Memberships if activation or follow-up is needed.</p>`,
      replyTo: input.user.email,
      meta: {
        userId: input.user.id,
        tier,
        previousTier,
        audience,
        source: input.source,
        kind,
      },
    });
  } catch {
    /* non-fatal */
  }
  return Boolean(rendered);
}

function formatUsdFromCents(amountCents: number): string {
  const n = Math.max(0, Number(amountCents) || 0) / 100;
  if (Number.isInteger(n)) return `$${n.toLocaleString("en-US")}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Parse Stripe session `gysh_item` metadata (`consult-30x2,boostx1`) into receipt copy. */
export function formatJoinCartReceipt(
  itemMeta: string,
  amountCents = 0,
): { itemsHtml: string; itemLabel: string; amountUsd: string } {
  const parts = String(itemMeta || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const lines: string[] = [];
  const labels: string[] = [];
  let packCount = 0;
  let knownCount = 0;
  for (const part of parts) {
    const match = part.match(/^(.*?)(?:x(\d+))?$/i);
    const itemId = String(match?.[1] || part).trim();
    const quantity = Math.max(1, Math.min(99, Math.floor(Number(match?.[2] || 1))));
    if (!itemId) continue;
    const pack = STRIPE_CATALOG.creditPacks[itemId];
    const row = STRIPE_CATALOG.alaCarte[itemId] ?? pack;
    if (pack) packCount += 1;
    if (row) knownCount += 1;
    const name = row?.label || itemId;
    const qtyBit = quantity > 1 ? ` × ${quantity}` : "";
    const priceBit =
      row?.amountUsd != null ? ` — ${formatUsdFromCents(Math.round(row.amountUsd * quantity * 100))}` : "";
    lines.push(
      `<li style="margin:0 0 6px;"><strong>${escapeHtml(name)}</strong>${qtyBit}${priceBit}</li>`,
    );
    labels.push(`${name}${qtyBit}`);
  }
  const itemsHtml = lines.length
    ? `<ul style="margin:0;padding-left:18px;">${lines.join("")}</ul>`
    : `<p style="margin:0;">Your purchase is confirmed.</p>`;
  const itemLabel =
    labels.length === 1
      ? labels[0]!
      : labels.length > 1
        ? knownCount > 0 && packCount === knownCount
          ? `Kid Credit packs (${labels.length})`
          : `A-la-carte cart (${labels.length} items)`
        : "A la carte";
  return { itemsHtml, itemLabel, amountUsd: formatUsdFromCents(amountCents) };
}

export function joinCartPurchaseTemplateSlug(
  kind: string,
): "alacarte_purchased" | "credit_pack_purchased" {
  return String(kind || "").toLowerCase() === "credit_pack"
    ? "credit_pack_purchased"
    : "alacarte_purchased";
}

/**
 * Member confirmation + admin alert after a-la-carte / credit-pack checkout
 * (Stripe, GYSH credits, or mixed).
 */
export async function sendAlaCartePurchaseEmails(
  env: Env,
  input: {
    email: string;
    name?: string | null;
    userId?: string | null;
    itemMeta: string;
    amountCents: number;
    sessionId?: string;
    kind?: string;
    source?: string | null;
    creditsApplied?: number;
  },
): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const email = String(input.email || "").trim().toLowerCase();
  if (!email.includes("@")) return false;
  const name = String(input.name || "").trim() || "Side Hustler";
  const slug = joinCartPurchaseTemplateSlug(input.kind || "");
  const receipt = formatJoinCartReceipt(input.itemMeta, input.amountCents);
  const payment = formatPurchasePaymentDetail({
    source: input.source,
    amountCents: input.amountCents,
    creditsApplied: input.creditsApplied,
    sessionId: input.sessionId,
  });
  const joinUrl = `${SITE_URL}/join`;
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, slug, {
    name,
    itemsHtml: receipt.itemsHtml,
    itemLabel: receipt.itemLabel,
    amountUsd: payment.amountLabel,
    paymentHtml: payment.html,
    ctaUrl: joinUrl,
  });
  if (rendered) {
    await sendResendEmail(env, {
      to: email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      templateSlug: slug,
      userId: input.userId || undefined,
      meta: {
        itemMeta: input.itemMeta,
        amountCents: input.amountCents,
        sessionId: input.sessionId || "",
        itemLabel: receipt.itemLabel,
        kind: input.kind || "",
        source: payment.source,
        creditsApplied: Math.max(0, Math.floor(Number(input.creditsApplied) || 0)),
      },
    });
  }

  try {
    await sendAdminFormNotify(env, {
      formName: slug === "credit_pack_purchased" ? "Kid Credit pack purchase" : "A la carte purchase",
      summary: `${name} · ${email} · ${receipt.itemLabel} · ${payment.amountLabel}`,
      detailsHtml: `<p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#9B2F28;">${escapeHtml(email)}</a></p>
        <p style="margin:0 0 8px;"><strong>Items:</strong></p>
        ${receipt.itemsHtml}
        <p style="margin:12px 0 8px;"><strong>Total:</strong> ${escapeHtml(payment.amountLabel)}</p>
        ${payment.html}
        <p style="margin:12px 0 0;padding:12px;background:#fff4e8;border-radius:10px;">Open Admin → Financials if follow-up is needed.</p>`,
      replyTo: email,
      meta: {
        userId: input.userId || "",
        itemMeta: input.itemMeta,
        amountCents: input.amountCents,
        sessionId: input.sessionId || "",
        source: payment.source,
        creditsApplied: Math.max(0, Math.floor(Number(input.creditsApplied) || 0)),
      },
    });
  } catch {
    /* non-fatal */
  }
  return Boolean(rendered);
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
    certHtml: cert?.certHtml || "",
    ctaUrl: joinUrl,
    ...membershipCatalogEmailVars(tier, audience),
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

export async function sendMembershipMerchReadyEmail(
  env: Env,
  user: {
    id: string;
    email: string;
    name: string;
    membership_tier?: string | null;
  },
): Promise<boolean> {
  if (!emailConfigured(env)) return false;
  const tier = normalizeTier(user.membership_tier);
  if (merchItemCount(tier) === 0) return false;
  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "membership_merch_ready", {
    name: user.name || "Side Hustler",
    ...merchEmailVars(tier),
  });
  if (!rendered) return false;
  await sendResendEmail(env, {
    to: user.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    templateSlug: "membership_merch_ready",
    userId: user.id,
    meta: { tier, merchClaim: true },
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

export async function sendScheduleReminderEmail(
  env: Env,
  input: {
    to: string;
    memberName: string;
    cadence: "daily" | "weekly" | "biweekly" | "monthly";
    periodKey: string;
    plan: {
      id: string;
      ownerLabel: string;
      hustleLabel: string;
      dueDate: string;
      weekStart: string;
      blocks: Array<{
        dayLabel: string;
        focus: string;
        done: boolean;
        status?: string;
        hoursLogged: number;
        dueDate: string;
      }>;
    };
    kidCredits: number;
    membershipTier: string;
  },
): Promise<{ id: string | null }> {
  const cadenceLabel =
    input.cadence === "daily"
      ? "Daily"
      : input.cadence === "weekly"
        ? "Weekly"
        : input.cadence === "biweekly"
          ? "Bi-weekly"
          : "Monthly";
  const doneCount = input.plan.blocks.filter(
    (b) => b.done || String(b.status ?? "").toLowerCase() === "done",
  ).length;
  const pct = input.plan.blocks.length
    ? Math.round((doneCount / input.plan.blocks.length) * 100)
    : 0;
  const hours = input.plan.blocks.reduce((s, b) => s + (b.hoursLogged || 0), 0);
  const statusLabel = (b: { done: boolean; status?: string }) => {
    const s = String(b.status ?? "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    if (s === "done" || b.done) return "✓ Done";
    if (s === "in_progress") return "In Progress";
    if (s === "blocked") return "Blocked";
    return "Not Started";
  };
  const rows = input.plan.blocks
    .map(
      (b) =>
        `<tr>
          <td style="padding:8px 10px;border-bottom:1px solid #e8dfd0;font-weight:700;">${escapeHtml(b.dayLabel)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e8dfd0;">${escapeHtml(b.focus)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e8dfd0;">${escapeHtml(b.dueDate || "—")}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #e8dfd0;">${statusLabel(b)}${
            b.hoursLogged > 0 ? ` · ${b.hoursLogged}h` : ""
          }</td>
        </tr>`,
    )
    .join("");
  const digestBodyHtml = `
    <p style="margin:0 0 12px;"><strong>${escapeHtml(input.plan.ownerLabel)}</strong> · ${escapeHtml(
      input.plan.hustleLabel,
    )}</p>
    <p style="margin:0 0 12px;">Week of <strong>${escapeHtml(input.plan.weekStart || "—")}</strong> · Schedule due <strong>${escapeHtml(
      input.plan.dueDate || "—",
    )}</strong> · Progress <strong>${pct}%</strong> (${doneCount}/${input.plan.blocks.length}) · Hours logged <strong>${hours}</strong></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 16px;background:#fffaf3;border:1px solid #e2d5bc;border-radius:12px;overflow:hidden;">
      <thead>
        <tr style="background:#f0e6d4;">
          <th align="left" style="padding:8px 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Day</th>
          <th align="left" style="padding:8px 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Focus</th>
          <th align="left" style="padding:8px 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Due</th>
          <th align="left" style="padding:8px 10px;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Status</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="4" style="padding:12px;">No plan blocks yet.</td></tr>`}</tbody>
    </table>
    <div style="margin:0 0 8px;padding:14px 16px;border-radius:12px;background:#f7f0df;border:1px solid #e2d5bc;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:#947d64;">Kid Credits</p>
      <p style="margin:0;font-size:1.15rem;font-weight:800;color:#5c4033;">${input.kidCredits} Kid Credit${
        input.kidCredits === 1 ? "" : "s"
      }</p>
      <p style="margin:6px 0 0;font-size:0.9rem;color:#6b635a;">Plan: ${escapeHtml(
        String(input.membershipTier || "pro").toUpperCase(),
      )} · Redeem toward workshops &amp; 1-on-1s from My Dashboard.</p>
    </div>`;

  const { renderCatalogEmail } = await import("./email-admin");
  const rendered = await renderCatalogEmail(env, "schedule_suite_reminder", {
    name: input.memberName || "there",
    periodKey: input.periodKey,
    cadence: cadenceLabel,
    hustleLabel: input.plan.hustleLabel,
    digestBodyHtml,
  });
  if (!rendered) {
    // Fallback branded shell if catalog missing
    const { wrapBrandedEmail } = await import("./email-brand");
    const wrapped = wrapBrandedEmail({
      preheader: `${cadenceLabel} schedule reminder for ${input.plan.hustleLabel}`,
      eyebrow: `Schedule Suite · ${cadenceLabel}`,
      headline: `Your ${cadenceLabel.toLowerCase()} hustle plan`,
      subhead: `Hi ${input.memberName || "there"}.`,
      bodyHtml: `<p style="margin:0 0 12px;">Here's your Schedule Suite for ${input.periodKey}.</p>${digestBodyHtml}`,
      ctaLabel: "Open Schedule Suite",
      ctaUrl: `${SITE_URL}/my-dashboard`,
      footerNote: "Change reminder cadence anytime under My Dashboard → Schedule Suite.",
    });
    return sendResendEmail(env, {
      to: input.to,
      subject: `${SITE_NAME} — ${cadenceLabel.toLowerCase()} schedule: ${input.plan.hustleLabel}`,
      html: wrapped.html,
      text: wrapped.text,
      templateSlug: "schedule_suite_reminder",
      meta: {
        cadence: input.cadence,
        periodKey: input.periodKey,
        scheduleId: input.plan.id,
        kidCredits: input.kidCredits,
      },
    });
  }
  return sendResendEmail(env, {
    to: input.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    templateSlug: "schedule_suite_reminder",
    meta: {
      cadence: input.cadence,
      periodKey: input.periodKey,
      scheduleId: input.plan.id,
      kidCredits: input.kidCredits,
    },
  });
}

export { EMAIL_TEMPLATE_CATALOG } from "./email-template-content";
