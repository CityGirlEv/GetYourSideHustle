/**
 * Admin APIs: email templates catalog, edit/save, preview, test send, email_log.
 */
import { error, json, type DbUser, type Env } from "./auth";
import { EmailSendError, emailConfigured, sendResendEmail } from "./email";
import { SITE_URL } from "./email-brand";
import { buildSampleDigestPreview, DIGEST_TEMPLATE_SLUG } from "./daily-digest";
import {
  applyContentVars,
  defaultContentForSlug,
  EMAIL_TEMPLATE_CATALOG,
  PREVIEW_SAMPLE_VARS,
  renderContent,
  type EmailTemplateContent,
  type EmailTemplateVars,
} from "./email-template-content";

type TemplateRow = {
  slug: string;
  name: string;
  description: string;
  subject: string;
  enabled: number;
  updated_at: string;
  updated_by: string;
  preheader: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  body_html: string;
  cta_label: string;
  cta_url: string;
  footer_note: string;
  content_seeded: number;
};

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
      updated_by TEXT NOT NULL DEFAULT '',
      preheader TEXT NOT NULL DEFAULT '',
      eyebrow TEXT NOT NULL DEFAULT '',
      headline TEXT NOT NULL DEFAULT '',
      subhead TEXT NOT NULL DEFAULT '',
      body_html TEXT NOT NULL DEFAULT '',
      cta_label TEXT NOT NULL DEFAULT '',
      cta_url TEXT NOT NULL DEFAULT '',
      footer_note TEXT NOT NULL DEFAULT '',
      content_seeded INTEGER NOT NULL DEFAULT 0
    )`,
  ).run();

  // Older DBs created before content columns — add them if missing.
  const alters = [
    "ALTER TABLE email_templates ADD COLUMN preheader TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE email_templates ADD COLUMN eyebrow TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE email_templates ADD COLUMN headline TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE email_templates ADD COLUMN subhead TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE email_templates ADD COLUMN body_html TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE email_templates ADD COLUMN cta_label TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE email_templates ADD COLUMN cta_url TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE email_templates ADD COLUMN footer_note TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE email_templates ADD COLUMN content_seeded INTEGER NOT NULL DEFAULT 0",
  ];
  for (const sql of alters) {
    try {
      await env.DB.prepare(sql).run();
    } catch {
      /* column already exists */
    }
  }
}

function rowToContent(row: TemplateRow): EmailTemplateContent {
  const defaults = defaultContentForSlug(row.slug);
  return {
    subject: row.subject || defaults?.subject || "",
    preheader: row.preheader || defaults?.preheader || "",
    eyebrow: row.eyebrow || defaults?.eyebrow || "",
    headline: row.headline || defaults?.headline || "",
    subhead: row.subhead || defaults?.subhead || "",
    bodyHtml: row.body_html || defaults?.bodyHtml || "",
    ctaLabel: row.cta_label || defaults?.ctaLabel || "",
    ctaUrl: row.cta_url || defaults?.ctaUrl || "",
    footerNote: row.footer_note || defaults?.footerNote || "",
    dynamicBody: defaults?.dynamicBody,
  };
}

async function seedCatalogRows(env: Env): Promise<void> {
  const now = new Date().toISOString();
  for (const t of EMAIL_TEMPLATE_CATALOG) {
    const defaults = defaultContentForSlug(t.slug);
    await env.DB.prepare(
      `INSERT INTO email_templates (
         slug, name, description, subject, enabled, updated_at, updated_by,
         preheader, eyebrow, headline, subhead, body_html, cta_label, cta_url, footer_note, content_seeded
       ) VALUES (?, ?, ?, ?, 1, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON CONFLICT(slug) DO NOTHING`,
    )
      .bind(
        t.slug,
        t.name,
        t.description,
        defaults?.subject || t.sampleSubject,
        now,
        defaults?.preheader || "",
        defaults?.eyebrow || "",
        defaults?.headline || "",
        defaults?.subhead || "",
        defaults?.bodyHtml || "",
        defaults?.ctaLabel || "",
        defaults?.ctaUrl || "",
        defaults?.footerNote || "",
      )
      .run();

    // Backfill content for rows inserted before editable fields existed.
    const row = await env.DB.prepare(
      `SELECT content_seeded, body_html FROM email_templates WHERE slug = ?`,
    )
      .bind(t.slug)
      .first<{ content_seeded: number; body_html: string }>();
    if (!row || !defaults) continue;
    if (Number(row.content_seeded) === 0) {
      await env.DB.prepare(
        `UPDATE email_templates SET
           subject = ?, preheader = ?, eyebrow = ?, headline = ?, subhead = ?,
           body_html = ?, cta_label = ?, cta_url = ?, footer_note = ?,
           content_seeded = 1, name = ?, description = ?
         WHERE slug = ?`,
      )
        .bind(
          defaults.subject,
          defaults.preheader,
          defaults.eyebrow,
          defaults.headline,
          defaults.subhead,
          defaults.bodyHtml,
          defaults.ctaLabel,
          defaults.ctaUrl,
          defaults.footerNote,
          t.name,
          t.description,
          t.slug,
        )
        .run();
      continue;
    }
    // Upgrade bare {{message}} bodies (look empty in the WYSIWYG) without wiping other fields.
    const body = String(row.body_html || "").trim();
    const thinMessageBody =
      body === "{{message}}" || /^<p>\{\{\s*message\s*\}\}<\/p>$/i.test(body);
    if (thinMessageBody && defaults.bodyHtml.includes("{{message}}")) {
      await env.DB.prepare(`UPDATE email_templates SET body_html = ? WHERE slug = ?`)
        .bind(defaults.bodyHtml, t.slug)
        .run();
    }
  }
}

export async function getTemplateContent(
  env: Env,
  slug: string,
): Promise<EmailTemplateContent | null> {
  await ensureEmailTables(env);
  await seedCatalogRows(env);
  const row = await env.DB.prepare(
    `SELECT slug, name, description, subject, enabled, updated_at, updated_by,
            preheader, eyebrow, headline, subhead, body_html, cta_label, cta_url, footer_note, content_seeded
     FROM email_templates WHERE slug = ?`,
  )
    .bind(slug)
    .first<TemplateRow>();
  if (!row) {
    return defaultContentForSlug(slug);
  }
  return rowToContent(row);
}

/** Render a catalog email from saved (or default) content + vars. */
export async function renderCatalogEmail(
  env: Env,
  slug: string,
  vars: EmailTemplateVars = {},
): Promise<{ subject: string; html: string; text: string } | null> {
  if (slug === DIGEST_TEMPLATE_SLUG || slug === "daily_admin_digest") {
    const content = await getTemplateContent(env, "daily_admin_digest");
    if (!content) return buildSampleDigestPreview();
    // Live digests pass digestBodyHtml; admin preview fills {{digestBodyHtml}} from sample vars.
    return renderContent(content, { ...PREVIEW_SAMPLE_VARS, ...vars });
  }

  const content = await getTemplateContent(env, slug);
  if (!content) return null;
  return renderContent(content, vars);
}

/** @deprecated Prefer renderCatalogEmail — kept for callers expecting sync preview. */
export function buildTemplatePreview(slug: string): {
  subject: string;
  html: string;
  text: string;
} | null {
  const content = defaultContentForSlug(slug);
  if (!content) return null;
  if (slug === DIGEST_TEMPLATE_SLUG || slug === "daily_admin_digest") {
    return buildSampleDigestPreview();
  }
  return renderContent(content, PREVIEW_SAMPLE_VARS);
}

export async function listEmailTemplates(env: Env): Promise<Response> {
  await ensureEmailTables(env);
  await seedCatalogRows(env);

  const { results } = await env.DB.prepare(
    `SELECT slug, name, description, subject, enabled, updated_at, updated_by,
            preheader, eyebrow, headline, subhead, body_html, cta_label, cta_url, footer_note, content_seeded
     FROM email_templates ORDER BY name`,
  ).all<TemplateRow>();

  const counts = await env.DB.prepare(
    `SELECT template_slug as slug, COUNT(*) as n FROM email_log GROUP BY template_slug`,
  ).all<{ slug: string; n: number }>();
  const countMap = new Map((counts.results ?? []).map((r) => [r.slug, r.n]));

  return json({
    emailConfigured: emailConfigured(env),
    logoUrl: `${SITE_URL}/brand/gysh-logo-rocket.png`,
    placeholders: [
      "{{name}}",
      "{{email}}",
      "{{message}}",
      "{{ctaUrl}}",
      "{{resetUrl}}",
      "{{consentUrl}}",
      "{{tier}}",
      "{{perksHtml}}",
      "{{upgradesHtml}}",
      "{{childName}}",
      "{{periodKey}}",
      "{{digestBodyHtml}}",
    ],
    templates: (results ?? []).map((t) => {
      const content = rowToContent(t);
      const defaults = defaultContentForSlug(t.slug);
      return {
        slug: t.slug,
        name: t.name,
        description: t.description,
        subject: content.subject,
        enabled: Boolean(t.enabled),
        updatedAt: t.updated_at,
        updatedBy: t.updated_by,
        preheader: content.preheader,
        eyebrow: content.eyebrow,
        headline: content.headline,
        subhead: content.subhead,
        bodyHtml: content.bodyHtml,
        ctaLabel: content.ctaLabel,
        ctaUrl: content.ctaUrl,
        footerNote: content.footerNote,
        dynamicBody: Boolean(defaults?.dynamicBody),
        sendCount: (countMap.get(t.slug) ?? 0) + (countMap.get(`test_${t.slug}`) ?? 0),
      };
    }),
  });
}

export async function updateEmailTemplate(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureEmailTables(env);
  await seedCatalogRows(env);

  let body: {
    slug?: string;
    subject?: string;
    preheader?: string;
    eyebrow?: string;
    headline?: string;
    subhead?: string;
    bodyHtml?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    footerNote?: string;
    enabled?: boolean;
    resetToDefault?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }

  const slug = String(body.slug || "").trim();
  if (!slug) return error("slug is required.");
  if (!EMAIL_TEMPLATE_CATALOG.some((t) => t.slug === slug)) {
    return error("Unknown template.", 404);
  }

  const defaults = defaultContentForSlug(slug);
  if (!defaults) return error("Unknown template.", 404);

  const now = new Date().toISOString();
  const next = body.resetToDefault
    ? defaults
    : {
        subject: String(body.subject ?? "").trim() || defaults.subject,
        preheader: String(body.preheader ?? ""),
        eyebrow: String(body.eyebrow ?? ""),
        headline: String(body.headline ?? "").trim() || defaults.headline,
        subhead: String(body.subhead ?? ""),
        bodyHtml: String(body.bodyHtml ?? ""),
        ctaLabel: String(body.ctaLabel ?? ""),
        ctaUrl: String(body.ctaUrl ?? ""),
        footerNote: String(body.footerNote ?? ""),
      };

  const enabled =
    typeof body.enabled === "boolean" ? (body.enabled ? 1 : 0) : undefined;

  if (enabled === undefined) {
    await env.DB.prepare(
      `UPDATE email_templates SET
         subject = ?, preheader = ?, eyebrow = ?, headline = ?, subhead = ?,
         body_html = ?, cta_label = ?, cta_url = ?, footer_note = ?,
         content_seeded = 1, updated_at = ?, updated_by = ?
       WHERE slug = ?`,
    )
      .bind(
        next.subject,
        next.preheader,
        next.eyebrow,
        next.headline,
        next.subhead,
        next.bodyHtml,
        next.ctaLabel,
        next.ctaUrl,
        next.footerNote,
        now,
        actor.email,
        slug,
      )
      .run();
  } else {
    await env.DB.prepare(
      `UPDATE email_templates SET
         subject = ?, preheader = ?, eyebrow = ?, headline = ?, subhead = ?,
         body_html = ?, cta_label = ?, cta_url = ?, footer_note = ?,
         enabled = ?, content_seeded = 1, updated_at = ?, updated_by = ?
       WHERE slug = ?`,
    )
      .bind(
        next.subject,
        next.preheader,
        next.eyebrow,
        next.headline,
        next.subhead,
        next.bodyHtml,
        next.ctaLabel,
        next.ctaUrl,
        next.footerNote,
        enabled,
        now,
        actor.email,
        slug,
      )
      .run();
  }

  const preview = renderContent(next as EmailTemplateContent, PREVIEW_SAMPLE_VARS);
  return json({
    ok: true,
    slug,
    updatedAt: now,
    updatedBy: actor.email,
    preview,
    content: next,
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
    sql += ` WHERE template_slug = ? OR template_slug = ?`;
    binds.push(template, `test_${template}`);
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

export async function previewEmailTemplate(env: Env, request: Request): Promise<Response> {
  let body: { slug?: string; draft?: Partial<EmailTemplateContent> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }
  const slug = String(body.slug || "").trim();
  if (!slug) return error("slug is required.");

  // Live draft preview (unsaved edits in the admin form).
  // Empty strings mean "use saved" so a brief empty client draft can't blank the body.
  if (body.draft) {
    const saved = (await getTemplateContent(env, slug)) || defaultContentForSlug(slug);
    if (!saved) return error("Unknown template.", 404);
    const pick = (draftVal: string | undefined, fallback: string) => {
      const v = typeof draftVal === "string" ? draftVal : undefined;
      if (v == null) return fallback;
      if (v.trim() === "" && fallback.trim() !== "") return fallback;
      return v;
    };
    const merged: EmailTemplateContent = {
      ...saved,
      subject: pick(body.draft.subject, saved.subject),
      preheader: pick(body.draft.preheader, saved.preheader),
      eyebrow: pick(body.draft.eyebrow, saved.eyebrow),
      headline: pick(body.draft.headline, saved.headline),
      subhead: pick(body.draft.subhead, saved.subhead),
      bodyHtml: pick(body.draft.bodyHtml, saved.bodyHtml),
      ctaLabel: pick(body.draft.ctaLabel, saved.ctaLabel),
      ctaUrl: pick(body.draft.ctaUrl, saved.ctaUrl),
      footerNote: pick(body.draft.footerNote, saved.footerNote),
    };
    if (slug === "daily_admin_digest" && !/\{\{\s*digestBodyHtml\s*\}\}/.test(merged.bodyHtml)) {
      // Keep digest tables when the draft shell omits the placeholder.
      const sample = buildSampleDigestPreview();
      const subject = applyContentVars(merged, PREVIEW_SAMPLE_VARS).subject;
      return json({
        slug,
        subject: subject || sample.subject,
        html: sample.html,
        text: sample.text,
      });
    }
    const preview = renderContent(merged, PREVIEW_SAMPLE_VARS);
    return json({ slug, ...preview });
  }

  const preview = await renderCatalogEmail(env, slug, PREVIEW_SAMPLE_VARS);
  if (!preview) return error("Unknown template.", 404);
  return json({ slug, ...preview });
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

  const preview = await renderCatalogEmail(env, slug, PREVIEW_SAMPLE_VARS);
  if (!preview) return error("Unknown template.", 404);

  try {
    const result = await sendResendEmail(env, {
      to,
      subject: `[TEST] ${preview.subject}`,
      html: preview.html,
      text: preview.text,
      templateSlug: slug,
      userId: actor.id,
      meta: { test: true, slug, sentBy: actor.email },
    });
    return json({
      ok: true,
      id: result.id,
      to,
      slug,
      subject: `[TEST] ${preview.subject}`,
      logged: true,
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
