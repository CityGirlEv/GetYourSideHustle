/**
 * Daily Progress Report export/send audit — D1 snapshots + shareable HTML links.
 */
import { error, json, type DbUser, type Env } from "./auth";
import { randomToken } from "./crypto";

export type ProgressReportFormat = "pdf" | "excel" | "word" | "email";

export type DailyProgressAuditRow = {
  id: string;
  created_at: string;
  created_by_email: string;
  created_by_name: string;
  format: string;
  period_from: string;
  period_to: string;
  period_label: string;
  users_filter: string;
};

export type DailyProgressAuditDto = {
  id: string;
  createdAt: string;
  createdByEmail: string;
  createdByName: string;
  format: ProgressReportFormat;
  periodFrom: string;
  periodTo: string;
  periodLabel: string;
  usersFilter: string;
  /** Admin API path to open the exact snapshot that was exported/sent */
  reportUrl: string;
};

async function ensureDailyProgressAuditTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS daily_progress_reports (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      created_by_email TEXT NOT NULL DEFAULT '',
      created_by_name TEXT NOT NULL DEFAULT '',
      format TEXT NOT NULL,
      period_from TEXT NOT NULL,
      period_to TEXT NOT NULL,
      period_label TEXT NOT NULL DEFAULT '',
      users_filter TEXT NOT NULL DEFAULT 'All users',
      snapshot_json TEXT NOT NULL DEFAULT '{}',
      snapshot_html TEXT NOT NULL DEFAULT ''
    )`,
  ).run();
  try {
    await env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS idx_daily_progress_reports_created
       ON daily_progress_reports(created_at DESC)`,
    ).run();
  } catch {
    /* exists */
  }
}

function mapRow(row: DailyProgressAuditRow): DailyProgressAuditDto {
  return {
    id: row.id,
    createdAt: row.created_at,
    createdByEmail: row.created_by_email,
    createdByName: row.created_by_name,
    format: row.format as ProgressReportFormat,
    periodFrom: row.period_from,
    periodTo: row.period_to,
    periodLabel: row.period_label,
    usersFilter: row.users_filter,
    reportUrl: `/api/daily-progress-reports/${row.id}`,
  };
}

/**
 * Recover prior daily-digest email sends into the progress audit log.
 * Stores an honest send-record HTML page (not a reconstructed task/test snapshot).
 * Idempotent: ids are derived from email_log / digest_sends rows.
 */
async function backfillDigestHistory(env: Env): Promise<void> {
  try {
    const { results: emailRows } = await env.DB.prepare(
      `SELECT id, created_at, to_email, subject, meta_json, status
       FROM email_log
       WHERE template_slug = 'daily_admin_digest'
          OR template_slug = 'test_daily_admin_digest'
       ORDER BY created_at DESC
       LIMIT 200`,
    ).all<{
      id: string;
      created_at: string;
      to_email: string;
      subject: string;
      meta_json: string;
      status: string;
    }>();

    for (const row of emailRows ?? []) {
      let chicagoDate = "";
      try {
        const meta = JSON.parse(row.meta_json || "{}") as { chicagoDate?: string };
        chicagoDate = String(meta.chicagoDate ?? "").trim();
      } catch {
        chicagoDate = "";
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(chicagoDate)) continue;

      const id = `dpr_email_${row.id}`;
      const existing = await env.DB.prepare(
        `SELECT id FROM daily_progress_reports WHERE id = ?`,
      )
        .bind(id)
        .first<{ id: string }>();
      if (existing) continue;

      const periodLabel = chicagoDate.replace(
        /^(\d{4})-(\d{2})-(\d{2})$/,
        (_, y, m, d) => `${Number(m)}/${Number(d)}/${String(y).slice(-2)}`,
      );
      const snapshotHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>GYSH digest send · ${chicagoDate}</title></head>
<body style="font-family:Calibri,Arial,sans-serif;color:#181718;margin:36px 40px;">
  <h1 style="color:#9B2F28;">Daily digest send record</h1>
  <p>A GYSH daily admin digest was emailed for <strong>${chicagoDate}</strong>.</p>
  <p><strong>To:</strong> ${escapeForHtml(row.to_email)}</p>
  <p><strong>Subject:</strong> ${escapeForHtml(row.subject || "(none)")}</p>
  <p><strong>Status:</strong> ${escapeForHtml(row.status || "sent")}</p>
  <p><strong>Sent:</strong> ${escapeForHtml(row.created_at)}</p>
  <p style="color:#6B5344;font-size:13px;">This is a historical send record from the email log — not a reconstructed task/test export. Open Daily Progress Report and pick this date to view live data for that day.</p>
</body></html>`;

      await env.DB.prepare(
        `INSERT INTO daily_progress_reports
          (id, created_at, created_by_email, created_by_name, format,
           period_from, period_to, period_label, users_filter, snapshot_json, snapshot_html)
         VALUES (?, ?, ?, ?, 'email', ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          id,
          row.created_at,
          row.to_email || "",
          "",
          chicagoDate,
          chicagoDate,
          periodLabel,
          `Digest → ${row.to_email || "recipient"}`,
          JSON.stringify({ source: "email_log", emailLogId: row.id, chicagoDate }),
          snapshotHtml,
        )
        .run();
    }
  } catch {
    /* email_log may be missing on older envs — skip */
  }

  try {
    const { results: digestRows } = await env.DB.prepare(
      `SELECT id, chicago_date, to_email, status, created_at
       FROM digest_sends
       ORDER BY created_at DESC
       LIMIT 200`,
    ).all<{
      id: string;
      chicago_date: string;
      to_email: string;
      status: string;
      created_at: string;
    }>();

    for (const row of digestRows ?? []) {
      const chicagoDate = String(row.chicago_date ?? "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(chicagoDate)) continue;

      const id = `dpr_digest_${row.id}`;
      const existing = await env.DB.prepare(
        `SELECT id FROM daily_progress_reports WHERE id = ?`,
      )
        .bind(id)
        .first<{ id: string }>();
      if (existing) continue;

      const periodLabel = chicagoDate.replace(
        /^(\d{4})-(\d{2})-(\d{2})$/,
        (_, y, m, d) => `${Number(m)}/${Number(d)}/${String(y).slice(-2)}`,
      );
      const snapshotHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>GYSH digest send · ${chicagoDate}</title></head>
<body style="font-family:Calibri,Arial,sans-serif;color:#181718;margin:36px 40px;">
  <h1 style="color:#9B2F28;">Daily digest send record</h1>
  <p>A GYSH daily admin digest was recorded for <strong>${chicagoDate}</strong>.</p>
  <p><strong>To:</strong> ${escapeForHtml(row.to_email)}</p>
  <p><strong>Status:</strong> ${escapeForHtml(row.status || "sent")}</p>
  <p><strong>Recorded:</strong> ${escapeForHtml(row.created_at)}</p>
  <p style="color:#6B5344;font-size:13px;">Historical digest_sends record. Open Daily Progress Report for this date to view live task/test activity.</p>
</body></html>`;

      await env.DB.prepare(
        `INSERT INTO daily_progress_reports
          (id, created_at, created_by_email, created_by_name, format,
           period_from, period_to, period_label, users_filter, snapshot_json, snapshot_html)
         VALUES (?, ?, ?, ?, 'email', ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          id,
          row.created_at,
          row.to_email || "",
          "",
          chicagoDate,
          chicagoDate,
          periodLabel,
          `Digest → ${row.to_email || "recipient"}`,
          JSON.stringify({ source: "digest_sends", digestSendId: row.id, chicagoDate }),
          snapshotHtml,
        )
        .run();
    }
  } catch {
    /* digest_sends may be missing — skip */
  }
}

function escapeForHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function listDailyProgressReports(env: Env): Promise<Response> {
  await ensureDailyProgressAuditTable(env);
  await backfillDigestHistory(env);
  const { results } = await env.DB.prepare(
    `SELECT id, created_at, created_by_email, created_by_name, format,
            period_from, period_to, period_label, users_filter
     FROM daily_progress_reports
     ORDER BY created_at DESC
     LIMIT 500`,
  ).all<DailyProgressAuditRow>();
  return json({ reports: (results ?? []).map(mapRow) });
}

export async function createDailyProgressReport(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureDailyProgressAuditTable(env);
  let body: {
    format?: string;
    periodFrom?: string;
    periodTo?: string;
    periodLabel?: string;
    usersFilter?: string;
    snapshotJson?: unknown;
    snapshotHtml?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return error("Invalid JSON body.", 400);
  }

  const format = String(body.format ?? "").toLowerCase();
  if (!["pdf", "excel", "word", "email"].includes(format)) {
    return error("format must be pdf, excel, word, or email.", 400);
  }
  const periodFrom = String(body.periodFrom ?? "").trim();
  const periodTo = String(body.periodTo ?? "").trim();
  if (!periodFrom || !periodTo) {
    return error("periodFrom and periodTo are required.", 400);
  }

  const snapshotHtml = String(body.snapshotHtml ?? "").trim();
  if (!snapshotHtml) {
    return error("snapshotHtml is required so the report link can open the exact export.", 400);
  }

  let snapshotJson = "{}";
  try {
    snapshotJson = JSON.stringify(body.snapshotJson ?? {});
  } catch {
    return error("snapshotJson must be JSON-serializable.", 400);
  }

  // Keep D1 rows practical (~750KB soft cap for HTML+JSON)
  if (snapshotHtml.length + snapshotJson.length > 750_000) {
    return error("Report snapshot is too large to store.", 413);
  }

  const id = `dpr_${randomToken().slice(0, 24)}`;
  const createdAt = new Date().toISOString();
  const periodLabel = String(body.periodLabel ?? "").trim() || `${periodFrom} – ${periodTo}`;
  const usersFilter = String(body.usersFilter ?? "").trim() || "All users";

  await env.DB.prepare(
    `INSERT INTO daily_progress_reports
      (id, created_at, created_by_email, created_by_name, format,
       period_from, period_to, period_label, users_filter, snapshot_json, snapshot_html)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      createdAt,
      actor.email || "",
      actor.name || "",
      format,
      periodFrom,
      periodTo,
      periodLabel,
      usersFilter,
      snapshotJson,
      snapshotHtml,
    )
    .run();

  return json(
    {
      report: mapRow({
        id,
        created_at: createdAt,
        created_by_email: actor.email || "",
        created_by_name: actor.name || "",
        format,
        period_from: periodFrom,
        period_to: periodTo,
        period_label: periodLabel,
        users_filter: usersFilter,
      }),
    },
    201,
  );
}

export async function getDailyProgressReportHtml(
  env: Env,
  id: string,
): Promise<Response> {
  await ensureDailyProgressAuditTable(env);
  const row = await env.DB.prepare(
    `SELECT snapshot_html, period_label, format FROM daily_progress_reports WHERE id = ?`,
  )
    .bind(id)
    .first<{ snapshot_html: string; period_label: string; format: string }>();

  if (!row?.snapshot_html) {
    return error("Daily Progress report snapshot not found.", 404);
  }

  const safeLabel = (row.period_label || "report").replace(/[^\w.-]+/g, "_").slice(0, 60);
  return new Response(row.snapshot_html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-disposition": `inline; filename="GYSH_Daily_Progress_${safeLabel}_${row.format}.html"`,
      "cache-control": "private, max-age=60",
    },
  });
}
