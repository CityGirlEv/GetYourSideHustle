/**
 * Admin APIs: email templates catalog, preview, test send, email_log.
 */
import { error, json, type DbUser, type Env } from "./auth";
import {
  EMAIL_TEMPLATE_CATALOG,
  EmailSendError,
  emailConfigured,
  sendResendEmail,
} from "./email";
import {
  ADMIN_EMAIL,
  membershipDeepLink,
  normalizeAudience,
  normalizeTier,
  perkBulletsHtml,
  tierLabel,
  upgradesHtml,
  wrapBrandedEmail,
  SITE_NAME,
  SITE_URL,
} from "./email-brand";

async function ensureEmailTables(env: Env): Promise<void> {
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
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS email_templates (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL DEFAULT ''
    )`,
  ).run();
}

/** Build branded HTML/text for a catalog slug (always includes GYSH logo shell). */
export function buildTemplatePreview(slug: string): {
  subject: string;
  html: string;
  text: string;
} | null {
  const catalog = EMAIL_TEMPLATE_CATALOG.find((t) => t.slug === slug);
  if (!catalog) return null;

  const tier = slug.startsWith("welcome_")
    ? normalizeTier(slug.replace("welcome_", ""))
    : ("free" as const);
  const audience = normalizeAudience("adult");
  const joinUrl = membershipDeepLink();

  let branded;
  if (slug === "registration_confirmation") {
    branded = wrapBrandedEmail({
      preheader: "We got your GYSH signup — activation is next!",
      eyebrow: "You're on the list",
      headline: "Boom — your GYSH account request is in!",
      subhead: "Hi Side Hustler, thanks for joining the Get Your Side Hustle family.",
      bodyHtml: `<p style="margin:0 0 12px;">We've got your registration. A GYSH admin will <strong>activate your account</strong> soon.</p>
        <p style="margin:0;">You'll get a second email the moment you're cleared to log in.</p>`,
      ctaLabel: "Visit Get Your Side Hustle",
      ctaUrl: SITE_URL,
      footerNote: "Pending accounts can't sign in until an admin activates them.",
    });
  } else if (slug.startsWith("welcome_")) {
    branded = wrapBrandedEmail({
      preheader: `You're activated on ${tierLabel(tier)} — see your perks!`,
      eyebrow: "You're in · Account activated",
      headline: "Welcome to the hustle family!",
      subhead: `Your account is LIVE on the ${tierLabel(tier)} plan.`,
      bodyHtml: `<p style="margin:0 0 14px;">This is your official green light. Log in and use every perk that comes with <strong>${tierLabel(tier)}</strong>.</p>
        <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#947d64;">Your ${tierLabel(tier)} perks</p>
        ${perkBulletsHtml(tier, audience)}${upgradesHtml(tier)}`,
      ctaLabel: "See membership & upgrade",
      ctaUrl: joinUrl,
    });
  } else if (slug === "parent_consent") {
    branded = wrapBrandedEmail({
      preheader: "Approve a young Side Hustler's team request",
      eyebrow: "Kids Corner · Parent consent",
      headline: "A young Side Hustler needs your yes!",
      subhead: "Approve as GYSH Coach to activate their team request.",
      bodyHtml: `<p style="margin:0 0 12px;">Cheer, set boundaries, and help turn ideas into safe first wins.</p>
        <p style="margin:0;">Tap below to grant permission. Until you approve, the account stays pending.</p>`,
      ctaLabel: "Approve as parent / guardian",
      ctaUrl: `${SITE_URL}/?consent=preview-token`,
    });
  } else if (slug === "password_reset") {
    branded = wrapBrandedEmail({
      preheader: "Reset your Get Your Side Hustle password.",
      eyebrow: "Account security",
      headline: "Reset your password",
      subhead: "Hi Side Hustler, we got a request to reset your GYSH password.",
      bodyHtml: `<p style="margin:0 0 12px;">Tap the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
        <p style="margin:0;">If you didn’t ask for this, ignore this email.</p>`,
      ctaLabel: "Reset my password",
      ctaUrl: `${SITE_URL}/?reset=preview-token`,
      footerNote: "Never share this link.",
    });
  } else if (slug === "password_changed") {
    branded = wrapBrandedEmail({
      preheader: "Your GYSH password was updated",
      eyebrow: "Account security",
      headline: "Password updated — you're locked in.",
      subhead: "Your Get Your Side Hustle password changed successfully.",
      bodyHtml: `<p style="margin:0;">If you didn't make this change, contact <a href="mailto:${ADMIN_EMAIL}" style="color:#9B2F28;">${ADMIN_EMAIL}</a>.</p>`,
      ctaLabel: "Open GYSH",
      ctaUrl: SITE_URL,
    });
  } else if (slug === "contact_inbox") {
    branded = wrapBrandedEmail({
      preheader: "New contact from Sample Member",
      eyebrow: "Inbox · Contact Us",
      headline: "New message just landed!",
      subhead: "Sample Member wrote in from the GYSH Contact form.",
      bodyHtml: `<p style="margin:0 0 8px;"><strong>From:</strong> Sample Member &lt;<a href="mailto:sample@example.com" style="color:#9B2F28;">sample@example.com</a>&gt;</p>
        <div style="margin:16px 0;padding:16px;border-radius:12px;background:#f7f0df;border:1px solid #e2d5bc;">This is a preview of a Contact Us message.</div>`,
      ctaLabel: "Reply to sender",
      ctaUrl: "mailto:sample@example.com",
    });
  } else {
    branded = wrapBrandedEmail({
      preheader: catalog.sampleSubject,
      eyebrow: catalog.name,
      headline: catalog.name,
      subhead: catalog.description,
      bodyHtml: `<p style="margin:0;">Preview for <strong>${SITE_NAME}</strong> template <code>${slug}</code>.</p>`,
      ctaLabel: "Open GYSH",
      ctaUrl: SITE_URL,
    });
  }

  return {
    subject: catalog.sampleSubject,
    html: branded.html,
    text: branded.text,
  };
}

export async function listEmailTemplates(env: Env): Promise<Response> {
  await ensureEmailTables(env);
  const now = new Date().toISOString();
  for (const t of EMAIL_TEMPLATE_CATALOG) {
    await env.DB.prepare(
      `INSERT INTO email_templates (slug, name, description, subject, enabled, updated_at, updated_by)
       VALUES (?, ?, ?, ?, 1, ?, '')
       ON CONFLICT(slug) DO NOTHING`,
    )
      .bind(t.slug, t.name, t.description, t.sampleSubject, now)
      .run();
  }
  const { results } = await env.DB.prepare(
    `SELECT slug, name, description, subject, enabled, updated_at, updated_by FROM email_templates ORDER BY name`,
  ).all<{
    slug: string;
    name: string;
    description: string;
    subject: string;
    enabled: number;
    updated_at: string;
    updated_by: string;
  }>();

  const counts = await env.DB.prepare(
    `SELECT template_slug as slug, COUNT(*) as n FROM email_log GROUP BY template_slug`,
  ).all<{ slug: string; n: number }>();
  const countMap = new Map((counts.results ?? []).map((r) => [r.slug, r.n]));

  return json({
    emailConfigured: emailConfigured(env),
    logoUrl: `${SITE_URL}/brand/gysh-logo-rocket.png`,
    templates: (results ?? []).map((t) => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
      subject: t.subject,
      enabled: Boolean(t.enabled),
      updatedAt: t.updated_at,
      updatedBy: t.updated_by,
      sendCount: countMap.get(t.slug) ?? 0,
    })),
  });
}

export async function listEmailLog(env: Env, request: Request): Promise<Response> {
  await ensureEmailTables(env);
  const url = new URL(request.url);
  const template = (url.searchParams.get("template") || "").trim();
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") || 80)));

  let sql = `SELECT id, template_slug, to_email, user_id, subject, status, provider_id, error, meta_json, created_at
             FROM email_log`;
  const binds: (string | number)[] = [];
  if (template) {
    sql += ` WHERE template_slug = ?`;
    binds.push(template);
  }
  sql += ` ORDER BY created_at DESC LIMIT ?`;
  binds.push(limit);

  const { results } = await env.DB.prepare(sql)
    .bind(...binds)
    .all<{
      id: string;
      template_slug: string;
      to_email: string;
      user_id: string | null;
      subject: string;
      status: string;
      provider_id: string | null;
      error: string;
      meta_json: string;
      created_at: string;
    }>();

  return json({
    entries: (results ?? []).map((r) => ({
      id: r.id,
      templateSlug: r.template_slug,
      toEmail: r.to_email,
      userId: r.user_id,
      subject: r.subject,
      status: r.status,
      providerId: r.provider_id,
      error: r.error,
      meta: (() => {
        try {
          return JSON.parse(r.meta_json || "{}");
        } catch {
          return {};
        }
      })(),
      createdAt: r.created_at,
    })),
  });
}

export async function previewEmailTemplate(_env: Env, request: Request): Promise<Response> {
  let body: { slug?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }
  const slug = String(body.slug || "").trim();
  const preview = buildTemplatePreview(slug);
  if (!preview) return error("Unknown template.", 404);

  return json({
    slug,
    subject: preview.subject,
    html: preview.html,
    text: preview.text,
  });
}

export async function sendTestEmail(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  if (!emailConfigured(env)) {
    return error("RESEND_API_KEY is not configured.", 500);
  }

  let body: { slug?: string; to?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }

  const slug = String(body.slug || "").trim();
  const to = String(body.to || actor.email || "").trim().toLowerCase();
  if (!slug) return error("slug is required.");
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return error("A valid to email is required.");
  }

  const preview = buildTemplatePreview(slug);
  if (!preview) return error("Unknown template.", 404);

  try {
    const result = await sendResendEmail(env, {
      to,
      subject: `[TEST] ${preview.subject}`,
      html: preview.html,
      text: preview.text,
      templateSlug: `test_${slug}`,
      userId: actor.id,
      meta: { test: true, slug, sentBy: actor.email },
    });
    return json({
      ok: true,
      id: result.id,
      to,
      slug,
      subject: `[TEST] ${preview.subject}`,
    });
  } catch (e) {
    if (e instanceof EmailSendError) return error(e.message, e.status);
    const message = e instanceof Error ? e.message : String(e);
    return error(message, 500);
  }
}

export async function deactivateChildProfile(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  let body: { childProfileId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }
  const childProfileId = String(body.childProfileId || "").trim();
  if (!childProfileId) return error("childProfileId is required.");

  const row = await env.DB.prepare(
    `SELECT id, parent_user_id, display_name, status FROM child_profiles WHERE id = ?`,
  )
    .bind(childProfileId)
    .first<{ id: string; parent_user_id: string; display_name: string; status: string }>();

  if (!row) return error("Child profile not found.", 404);

  const roles = String(actor.roles || actor.role || "");
  const isAdmin = roles.includes("admin");
  if (!isAdmin && row.parent_user_id !== actor.id) {
    return error("Only the parent/guardian can deactivate this kids account.", 403);
  }

  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      `UPDATE child_profiles
       SET status = 'disabled', deactivated_at = ?, deactivated_by = ?, updated_at = ?
       WHERE id = ?`,
    )
      .bind(now, actor.email, now, childProfileId)
      .run();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such column")) {
      await env.DB.prepare(`UPDATE child_profiles SET updated_at = ? WHERE id = ?`)
        .bind(now, childProfileId)
        .run();
      return error("Run migration 0019 to enable child deactivation columns.", 500);
    }
    throw e;
  }

  try {
    await env.DB.prepare(
      `UPDATE users SET status = 'disabled', deactivated_at = ?, deactivated_by = ?, updated_at = ?
       WHERE parent_user_id = ? AND (audience = 'kids' OR role = 'kid')`,
    )
      .bind(now, actor.email, now, actor.id)
      .run();
  } catch {
    /* column may not exist on older DBs */
  }

  return json({ ok: true, childProfileId, status: "disabled" });
}
