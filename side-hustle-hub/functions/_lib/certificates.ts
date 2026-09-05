/**
 * Welcome-to-the-GYSH-Family certificates — SVG + simple PDF, D1 storage, admin CRUD.
 */
import { error, json, type DbUser, type Env } from "./auth";
import { SITE_URL } from "./email-brand";
import {
  buildCertificatePdfBase64,
  buildCertificateSvg,
  resolveCertificateHeadings,
} from "./certificate-art";

export {
  CERT_LOGO_SIZE,
  buildCertificatePdfBase64,
  buildCertificateSvg,
  certAudienceKey,
  certificateThemeFor,
  resolveCertificateHeadings,
} from "./certificate-art";

export type CertificateTemplate = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  signoff: string;
  footerLine: string;
  updatedAt: string;
  updatedBy: string;
};

export type MemberCertificate = {
  id: string;
  userId: string;
  memberName: string;
  memberEmail: string;
  membershipTier: string;
  audience: string;
  issuedAt: string;
  title: string;
  subtitle: string;
  bodyText: string;
  signoff: string;
  svgMarkup: string;
  pdfBase64: string;
  emailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_TEMPLATE: Omit<CertificateTemplate, "updatedAt" | "updatedBy"> = {
  id: "welcome_family",
  title: "Welcome to the GYSH Family",
  subtitle: "Certificate of Membership",
  body:
    "This certifies that {{name}} is a valued member of the Get Your Side Hustle family, welcomed on {{date}} as a {{tier}} member in the {{audience}} lane.",
  signoff: "T + E · Get Your Side Hustle",
  footerLine: `Four wizards. One family adventure. · ${SITE_URL}`,
};

/** Celebratory Glow Getter line for Kids / Teens (junior) certificates only. */
export const GLOW_GETTER_CERT_LINE =
  "You're a proud Glow Getter — keep shining with kindness, courage, and hustle!";

export function isGlowGetterAudience(raw: string | null | undefined): boolean {
  const a = String(raw || "adult").toLowerCase();
  return a === "kids" || a === "kid" || a === "junior" || a === "teen" || a === "teens";
}

export function audienceLabel(raw: string): string {
  const a = String(raw || "adult").toLowerCase();
  if (a === "kids" || a === "kid") return "Kids";
  if (a === "junior" || a === "teen" || a === "teens") return "Teens";
  if (a === "senior") return "Seniors";
  return "Adults";
}

/** Fill placeholders, then append Glow Getter copy for kids/teens audiences. */
export function resolveCertificateBody(
  templateBody: string,
  vars: { name: string; date: string; tier: string; audience: string },
  audienceRaw: string | null | undefined,
): string {
  const filled = fillTemplate(templateBody, vars).trim();
  if (!isGlowGetterAudience(audienceRaw)) return filled;
  if (filled.toLowerCase().includes("glow getter")) return filled;
  return `${filled} ${GLOW_GETTER_CERT_LINE}`;
}

function tierLabel(raw: string): string {
  const t = String(raw || "free").toLowerCase();
  if (t === "starter") return "Starter";
  if (t === "pro") return "Pro";
  if (t === "elite") return "Elite";
  return "Free";
}

function formatIssuedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

export async function ensureCertificateTables(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS certificate_template (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      body TEXT NOT NULL,
      signoff TEXT NOT NULL,
      footer_line TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL DEFAULT ''
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS member_certificates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      member_email TEXT NOT NULL,
      membership_tier TEXT NOT NULL DEFAULT 'free',
      audience TEXT NOT NULL DEFAULT 'adult',
      issued_at TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      body_text TEXT NOT NULL,
      signoff TEXT NOT NULL,
      svg_markup TEXT NOT NULL,
      pdf_base64 TEXT NOT NULL DEFAULT '',
      email_sent_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ).run();
  try {
    await env.DB.prepare(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_member_certificates_user ON member_certificates(user_id)`,
    ).run();
  } catch {
    /* index may already exist */
  }
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT OR IGNORE INTO certificate_template
     (id, title, subtitle, body, signoff, footer_line, updated_at, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'system')`,
  )
    .bind(
      DEFAULT_TEMPLATE.id,
      DEFAULT_TEMPLATE.title,
      DEFAULT_TEMPLATE.subtitle,
      DEFAULT_TEMPLATE.body,
      DEFAULT_TEMPLATE.signoff,
      DEFAULT_TEMPLATE.footerLine,
      now,
    )
    .run();
}

export async function getCertificateTemplate(env: Env): Promise<CertificateTemplate> {
  await ensureCertificateTables(env);
  const row = await env.DB.prepare(
    `SELECT id, title, subtitle, body, signoff, footer_line, updated_at, updated_by
     FROM certificate_template WHERE id = 'welcome_family'`,
  ).first<{
    id: string;
    title: string;
    subtitle: string;
    body: string;
    signoff: string;
    footer_line: string;
    updated_at: string;
    updated_by: string;
  }>();
  if (!row) {
    return { ...DEFAULT_TEMPLATE, updatedAt: new Date().toISOString(), updatedBy: "system" };
  }
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    body: row.body,
    signoff: row.signoff,
    footerLine: row.footer_line,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

function fillTemplate(
  body: string,
  vars: { name: string; date: string; tier: string; audience: string },
): string {
  return body
    .replace(/\{\{name\}\}/gi, vars.name)
    .replace(/\{\{date\}\}/gi, vars.date)
    .replace(/\{\{tier\}\}/gi, vars.tier)
    .replace(/\{\{audience\}\}/gi, vars.audience);
}

export async function issueMemberCertificate(
  env: Env,
  input: {
    userId: string;
    name: string;
    email: string;
    membershipTier?: string | null;
    audience?: string | null;
  },
): Promise<MemberCertificate> {
  await ensureCertificateTables(env);
  const template = await getCertificateTemplate(env);
  const now = new Date().toISOString();
  const tier = tierLabel(input.membershipTier || "free");
  const audienceRaw = input.audience || "adult";
  const audience = audienceLabel(audienceRaw);
  const headings = resolveCertificateHeadings(audienceRaw, template);
  const bodyText = resolveCertificateBody(
    template.body,
    {
      name: input.name || "Side Hustler",
      date: formatIssuedDate(now),
      tier,
      audience,
    },
    audienceRaw,
  );

  const artInput = {
    title: headings.title,
    subtitle: headings.subtitle,
    memberName: input.name || "Side Hustler",
    bodyText,
    signoff: template.signoff,
    footerLine: template.footerLine,
    tierLabel: tier,
    audienceLabel: audience,
    issuedAt: now,
    audienceRaw,
  };
  const svgMarkup = buildCertificateSvg(artInput);
  const pdfBase64 = buildCertificatePdfBase64(artInput);

  const existing = await env.DB.prepare(
    `SELECT id, created_at, email_sent_at FROM member_certificates WHERE user_id = ?`,
  )
    .bind(input.userId)
    .first<{ id: string; created_at: string; email_sent_at: string | null }>();

  const id = existing?.id || `cert-${crypto.randomUUID()}`;
  const createdAt = existing?.created_at || now;
  const emailSentAt = existing?.email_sent_at ?? null;

  await env.DB.prepare(`DELETE FROM member_certificates WHERE user_id = ?`)
    .bind(input.userId)
    .run();
  await env.DB.prepare(
    `INSERT INTO member_certificates (
      id, user_id, member_name, member_email, membership_tier, audience, issued_at,
      title, subtitle, body_text, signoff, svg_markup, pdf_base64, email_sent_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      input.userId,
      input.name || "Side Hustler",
      input.email,
      (input.membershipTier || "free").toLowerCase(),
      (input.audience || "adult").toLowerCase(),
      now,
      headings.title,
      headings.subtitle,
      bodyText,
      template.signoff,
      svgMarkup,
      pdfBase64,
      emailSentAt,
      createdAt,
      now,
    )
    .run();

  return mapCert(
    (await env.DB.prepare(`SELECT * FROM member_certificates WHERE user_id = ?`)
      .bind(input.userId)
      .first()) as Record<string, string>,
  );
}

function mapCert(row: Record<string, string | null>): MemberCertificate {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    memberName: String(row.member_name),
    memberEmail: String(row.member_email),
    membershipTier: String(row.membership_tier || "free"),
    audience: String(row.audience || "adult"),
    issuedAt: String(row.issued_at),
    title: String(row.title),
    subtitle: String(row.subtitle),
    bodyText: String(row.body_text),
    signoff: String(row.signoff),
    svgMarkup: String(row.svg_markup),
    pdfBase64: String(row.pdf_base64 || ""),
    emailSentAt: row.email_sent_at ? String(row.email_sent_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function markCertificateEmailed(env: Env, userId: string): Promise<void> {
  await env.DB.prepare(
    `UPDATE member_certificates SET email_sent_at = ?, updated_at = ? WHERE user_id = ?`,
  )
    .bind(new Date().toISOString(), new Date().toISOString(), userId)
    .run();
}

export async function listMemberCertificates(env: Env): Promise<Response> {
  await ensureCertificateTables(env);
  const template = await getCertificateTemplate(env);
  const { results } = await env.DB.prepare(
    `SELECT id, user_id, member_name, member_email, membership_tier, audience, issued_at,
            title, subtitle, body_text, signoff, email_sent_at, created_at, updated_at
     FROM member_certificates ORDER BY issued_at DESC LIMIT 500`,
  ).all<Record<string, string | null>>();

  return json({
    template,
    certificates: (results ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      memberName: r.member_name,
      memberEmail: r.member_email,
      membershipTier: r.membership_tier,
      audience: r.audience,
      issuedAt: r.issued_at,
      title: r.title,
      subtitle: r.subtitle,
      bodyText: r.body_text,
      signoff: r.signoff,
      emailSentAt: r.email_sent_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      previewUrl: `/api/certificates/${r.id}/svg`,
      downloadUrl: `/api/certificates/${r.id}/pdf`,
    })),
  });
}

export async function getCertificateSvg(env: Env, id: string): Promise<Response> {
  await ensureCertificateTables(env);
  const row = await env.DB.prepare(`SELECT svg_markup FROM member_certificates WHERE id = ?`)
    .bind(id)
    .first<{ svg_markup: string }>();
  if (!row) return error("Certificate not found.", 404);
  return new Response(row.svg_markup, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "private, max-age=60",
    },
  });
}

export async function getCertificatePdf(env: Env, id: string): Promise<Response> {
  await ensureCertificateTables(env);
  const row = await env.DB.prepare(
    `SELECT pdf_base64, member_name FROM member_certificates WHERE id = ?`,
  )
    .bind(id)
    .first<{ pdf_base64: string; member_name: string }>();
  if (!row?.pdf_base64) return error("Certificate PDF not found.", 404);
  const binary = Uint8Array.from(atob(row.pdf_base64), (c) => c.charCodeAt(0));
  const safe = (row.member_name || "member").replace(/[^\w.-]+/g, "_");
  return new Response(binary, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="GYSH-Family-Certificate-${safe}.pdf"`,
      "cache-control": "private, max-age=60",
    },
  });
}

export async function updateCertificateTemplate(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureCertificateTables(env);
  let body: {
    title?: string;
    subtitle?: string;
    body?: string;
    signoff?: string;
    footerLine?: string;
    regenerateAll?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.");
  }

  const title = String(body.title || "").trim() || DEFAULT_TEMPLATE.title;
  const subtitle = String(body.subtitle || "").trim() || DEFAULT_TEMPLATE.subtitle;
  const bodyText = String(body.body || "").trim() || DEFAULT_TEMPLATE.body;
  const signoff = String(body.signoff || "").trim() || DEFAULT_TEMPLATE.signoff;
  const footerLine = String(body.footerLine ?? DEFAULT_TEMPLATE.footerLine).trim();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `UPDATE certificate_template
     SET title = ?, subtitle = ?, body = ?, signoff = ?, footer_line = ?, updated_at = ?, updated_by = ?
     WHERE id = 'welcome_family'`,
  )
    .bind(title, subtitle, bodyText, signoff, footerLine, now, actor.email)
    .run();

  let regenerated = 0;
  if (body.regenerateAll) {
    const { results } = await env.DB.prepare(
      `SELECT user_id, member_name, member_email, membership_tier, audience FROM member_certificates`,
    ).all<{
      user_id: string;
      member_name: string;
      member_email: string;
      membership_tier: string;
      audience: string;
    }>();
    for (const r of results ?? []) {
      await issueMemberCertificate(env, {
        userId: r.user_id,
        name: r.member_name,
        email: r.member_email,
        membershipTier: r.membership_tier,
        audience: r.audience,
      });
      regenerated += 1;
    }
  }

  const template = await getCertificateTemplate(env);
  return json({
    ok: true,
    template,
    regenerated,
    message: regenerated
      ? `Template saved. Regenerated ${regenerated} certificate(s).`
      : "Template saved.",
  });
}

export async function regenerateOneCertificate(
  env: Env,
  id: string,
): Promise<Response> {
  await ensureCertificateTables(env);
  const row = await env.DB.prepare(
    `SELECT user_id, member_name, member_email, membership_tier, audience FROM member_certificates WHERE id = ?`,
  )
    .bind(id)
    .first<{
      user_id: string;
      member_name: string;
      member_email: string;
      membership_tier: string;
      audience: string;
    }>();
  if (!row) return error("Certificate not found.", 404);
  const cert = await issueMemberCertificate(env, {
    userId: row.user_id,
    name: row.member_name,
    email: row.member_email,
    membershipTier: row.membership_tier,
    audience: row.audience,
  });
  return json({ ok: true, certificate: { id: cert.id, memberName: cert.memberName } });
}

export { SITE_URL };
