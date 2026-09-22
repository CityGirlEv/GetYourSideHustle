/**
 * Admin APIs: email templates catalog, edit/save, preview, test send, email_log.
 */
import { error, json, type DbUser, type Env } from "./auth";
import { EmailSendError, emailConfigured, sendResendEmail } from "./email";
import { SITE_URL } from "./email-brand";
import { buildSampleDigestPreview, DIGEST_TEMPLATE_SLUG } from "./daily-digest";
import { PARTNER_ADMINS } from "./partners";
import { parseRoles } from "./roles";
import { withD1Retry } from "./d1-retry";
import {
  applyContentVars,
  defaultContentForSlug,
  EMAIL_TEMPLATE_CATALOG,
  isLegacyHustleFamilyHeadline,
  isLegacyLowercaseGyshWelcomeHeadline,
  isLegacyMerchDashboardClaimUrl,
  isLegacyMerchReadyBody,
  previewSampleVarsForSlug,
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

let emailTablesEnsured = false;

async function ensureEmailTables(env: Env): Promise<void> {
  if (emailTablesEnsured) return;
  await withD1Retry(() =>
    env.DB.prepare(
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
    ).run(),
  );
  await withD1Retry(() =>
    env.DB.prepare(
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
    ).run(),
  );

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
  emailTablesEnsured = true;
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
  // One read of existing rows — avoid per-slug INSERT+SELECT on every list (remote D1 is ~2–4s each).
  const existing = await withD1Retry(() =>
    env.DB.prepare(
      `SELECT slug, name, description, content_seeded, body_html, headline, cta_url FROM email_templates`,
    ).all<{
      slug: string;
      name: string;
      description: string;
      content_seeded: number;
      body_html: string;
      headline: string;
      cta_url: string;
    }>(),
  );
  const bySlug = new Map((existing.results ?? []).map((r) => [r.slug, r]));

  for (const t of EMAIL_TEMPLATE_CATALOG) {
    const defaults = defaultContentForSlug(t.slug);
    const row = bySlug.get(t.slug);
    if (!row) {
      await withD1Retry(() =>
        env.DB.prepare(
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
          .run(),
      );
      continue;
    }
    if (!defaults) continue;
    if (row.name !== t.name || row.description !== t.description) {
      await withD1Retry(() =>
        env.DB.prepare(`UPDATE email_templates SET name = ?, description = ? WHERE slug = ?`)
          .bind(t.name, t.description, t.slug)
          .run(),
      );
    }
    if (Number(row.content_seeded) === 0) {
      await withD1Retry(() =>
        env.DB.prepare(
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
          .run(),
      );
      continue;
    }
    // Upgrade bare {{message}} bodies (look empty in the WYSIWYG) without wiping other fields.
    const body = String(row.body_html || "").trim();
    const thinMessageBody =
      body === "{{message}}" || /^<p>\{\{\s*message\s*\}\}<\/p>$/i.test(body);
    if (thinMessageBody && defaults.bodyHtml.includes("{{message}}")) {
      await withD1Retry(() =>
        env.DB.prepare(`UPDATE email_templates SET body_html = ? WHERE slug = ?`)
          .bind(defaults.bodyHtml, t.slug)
          .run(),
      );
    }
    if (isLegacyHustleFamilyHeadline(row.headline) && defaults.headline === "Welcome to the GYSH family!") {
      await withD1Retry(() =>
        env.DB.prepare(`UPDATE email_templates SET headline = ? WHERE slug = ?`)
          .bind(defaults.headline, t.slug)
          .run(),
      );
    }
    if (
      isLegacyLowercaseGyshWelcomeHeadline(row.headline) &&
      defaults.headline === "{{name}}, Welcome to the GYSH family!"
    ) {
      await withD1Retry(() =>
        env.DB.prepare(`UPDATE email_templates SET headline = ? WHERE slug = ?`)
          .bind(defaults.headline, t.slug)
          .run(),
      );
    }
    if (
      t.slug === "membership_merch_ready" &&
      isLegacyMerchReadyBody(row.body_html)
    ) {
      await withD1Retry(() =>
        env.DB.prepare(
          `UPDATE email_templates SET
             subject = ?, preheader = ?, eyebrow = ?, headline = ?, subhead = ?,
             body_html = ?, cta_label = ?, cta_url = ?, footer_note = ?,
             name = ?, description = ?
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
          .run(),
      );
    } else if (
      t.slug === "membership_merch_ready" &&
      isLegacyMerchDashboardClaimUrl(row.cta_url)
    ) {
      await withD1Retry(() =>
        env.DB.prepare(`UPDATE email_templates SET cta_url = ?, cta_label = ? WHERE slug = ?`)
          .bind(defaults.ctaUrl, defaults.ctaLabel, t.slug)
          .run(),
      );
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
    return renderContent(content, { ...previewSampleVarsForSlug("daily_admin_digest"), ...vars });
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
  return renderContent(content, previewSampleVarsForSlug(slug));
}

export async function listEmailTemplates(env: Env): Promise<Response> {
  await ensureEmailTables(env);
  await seedCatalogRows(env);

  const { results } = await withD1Retry(() =>
    env.DB.prepare(
      `SELECT slug, name, description, subject, enabled, updated_at, updated_by,
            preheader, eyebrow, headline, subhead, body_html, cta_label, cta_url, footer_note, content_seeded
     FROM email_templates ORDER BY name`,
    ).all<TemplateRow>(),
  );

  const counts = await withD1Retry(() =>
    env.DB.prepare(
      `SELECT template_slug as slug, COUNT(*) as n FROM email_log GROUP BY template_slug`,
    ).all<{ slug: string; n: number }>(),
  );
  const countMap = new Map((counts.results ?? []).map((r) => [r.slug, r.n]));

  const bySlug = new Map((results ?? []).map((t) => [t.slug, t]));
  const templates = EMAIL_TEMPLATE_CATALOG.map((catalog) => {
    const t = bySlug.get(catalog.slug);
    if (!t) return null;
    const content = rowToContent(t);
    const defaults = defaultContentForSlug(t.slug);
    return {
      slug: t.slug,
      name: catalog.name,
      description: catalog.description,
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
  }).filter((t): t is NonNullable<typeof t> => Boolean(t));

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
      "{{merchPerkTitle}}",
      "{{merchItemPhrase}}",
      "{{merchCheckoutCode}}",
      "{{perksHtml}}",
      "{{upgradesHtml}}",
      "{{childName}}",
      "{{periodKey}}",
      "{{digestBodyHtml}}",
    ],
    templates,
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
    await withD1Retry(() =>
      env.DB.prepare(
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
        .run(),
    );
  } else {
    await withD1Retry(() =>
      env.DB.prepare(
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
        .run(),
    );
  }

  const preview = renderContent(next as EmailTemplateContent, previewSampleVarsForSlug(slug));
  return json({
    ok: true,
    slug,
    updatedAt: now,
    updatedBy: actor.email,
    preview,
    content: next,
  });
}

async function qaRecipientEmails(env: Env): Promise<Set<string>> {
  const emails = new Set<string>([
    ...PARTNER_ADMINS.map((p) => p.email.toLowerCase()),
    "evvelyn3@cox.net",
  ]);
  try {
    const { results } = await env.DB.prepare(
      `SELECT email, role, roles, status FROM users WHERE status IN ('active', 'pending')`,
    ).all<{ email: string; role: string; roles: string | null; status: string }>();
    for (const row of results ?? []) {
      const roles = parseRoles(row.role, row.roles);
      if (!roles.includes("qa") && !roles.includes("admin")) continue;
      const email = String(row.email || "").trim().toLowerCase();
      if (email) emails.add(email);
    }
  } catch {
    /* users table may be missing columns on older envs */
  }
  return emails;
}

export async function listEmailLog(env: Env, request: Request): Promise<Response> {
  await ensureEmailTables(env);
  const url = new URL(request.url);
  const template = (url.searchParams.get("template") || "").trim();
  const qaOnly = url.searchParams.get("qa") === "1";
  const limit = Math.min(400, Math.max(1, Number(url.searchParams.get("limit") || 80)));

  let sql = `SELECT id, template_slug, to_email, user_id, subject, status, provider_id, error, meta_json, created_at
             FROM email_log`;
  const binds: (string | number)[] = [];
  if (template) {
    sql += ` WHERE template_slug = ? OR template_slug = ?`;
    binds.push(template, `test_${template}`);
  }
  sql += ` ORDER BY created_at DESC LIMIT ?`;
  binds.push(qaOnly ? Math.max(limit, 200) : limit);

  const { results } = await withD1Retry(() =>
    env.DB.prepare(sql)
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
      }>(),
  );

  const qaEmails = qaOnly ? await qaRecipientEmails(env) : null;
  const rows = (results ?? []).filter((r) => {
    if (!qaEmails) return true;
    return qaEmails.has(String(r.to_email || "").trim().toLowerCase());
  });

  return json({
    entries: rows.map((r) => ({
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
      const subject = applyContentVars(merged, previewSampleVarsForSlug(slug)).subject;
      return json({
        slug,
        subject: subject || sample.subject,
        html: sample.html,
        text: sample.text,
      });
    }
    const preview = renderContent(merged, previewSampleVarsForSlug(slug));
    return json({ slug, ...preview });
  }

  const preview = await renderCatalogEmail(env, slug, previewSampleVarsForSlug(slug));
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

  const preview = await renderCatalogEmail(env, slug, previewSampleVarsForSlug(slug));
  if (!preview) return error("Unknown template.", 404);

  let attachments: Array<{ filename: string; content: string; contentType: string }> | undefined;
  if (slug === "workshop_date_confirmed") {
    try {
      const { workshopGuidePdfAttachment } = await import("../../src/lib/workshop-sneak-peek-pdf");
      const { AI_SCENE_PACKS_WORKSHOP_ID } = await import("../../src/lib/workshop-playbooks");
      const attachment = await workshopGuidePdfAttachment(AI_SCENE_PACKS_WORKSHOP_ID);
      if (attachment) attachments = [attachment];
    } catch {
      /* test send still goes out without the PDF */
    }
  }

  try {
    const result = await sendResendEmail(env, {
      to,
      subject: `[TEST] ${preview.subject}`,
      html: preview.html,
      text: preview.text,
      templateSlug: slug,
      userId: actor.id,
      meta: { test: true, slug, sentBy: actor.email, guideAttached: Boolean(attachments?.length) },
      attachments,
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
