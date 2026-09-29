import type { D1Like } from './usersDb';
import {
  createEmailSendLogEntry,
  emailSendLogFromResend,
  emailSendLogStatusFromResult,
  mergeEmailSendLogs,
  parseEmailSendLog,
  type EmailSendLogEntry,
} from '../../src/lib/email/sendLog';

export type EmailLogEnv = {
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
  ADMIN_NOTIFY_EMAIL?: string;
  APP_URL?: string;
  DB?: D1Like;
};

type LogRow = {
  id: string;
  template_id: string;
  template_name: string;
  recipient: string;
  subject: string;
  status: string;
  detail: string;
  html: string;
  created_at: string;
  is_test: number;
};

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS email_send_log (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL DEFAULT '',
  template_name TEXT NOT NULL DEFAULT '',
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  html TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  is_test INTEGER NOT NULL DEFAULT 0
)`;

export async function ensureEmailSendLogTable(db: D1Like): Promise<void> {
  await db.prepare(CREATE_TABLE_SQL).run();
  await db
    .prepare('CREATE INDEX IF NOT EXISTS idx_email_send_log_created ON email_send_log(created_at)')
    .run();
}

function rowToEntry(row: LogRow): EmailSendLogEntry | null {
  return (
    parseEmailSendLog([
      {
        id: row.id,
        templateId: row.template_id,
        templateName: row.template_name,
        to: row.recipient,
        subject: row.subject,
        status: row.status,
        detail: row.detail,
        html: row.html,
        createdAt: row.created_at,
        test: Number(row.is_test) === 1,
      },
    ])[0] || null
  );
}

export async function persistEmailSendLog(
  env: EmailLogEnv,
  input: {
    id?: string;
    templateId?: string;
    templateName?: string;
    to: string;
    subject: string;
    status?: EmailSendLogEntry['status'];
    detail?: string;
    test?: boolean;
    html?: string;
    ok?: boolean;
    skipped?: boolean;
    error?: string;
  },
): Promise<EmailSendLogEntry> {
  const status =
    input.status ||
    emailSendLogStatusFromResult({
      ok: input.ok !== false,
      skipped: input.skipped,
      error: input.error,
    });
  const entry = createEmailSendLogEntry({
    id: input.id,
    templateId: input.templateId,
    templateName: input.templateName,
    to: input.to,
    subject: input.subject,
    status,
    detail: input.detail || input.error,
    test: input.test,
    html: input.html,
  });

  if (!env.DB) return entry;
  try {
    await ensureEmailSendLogTable(env.DB);
    await env.DB.prepare(
      `INSERT OR REPLACE INTO email_send_log
        (id, template_id, template_name, recipient, subject, status, detail, html, created_at, is_test)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        entry.id,
        entry.templateId,
        entry.templateName,
        entry.to,
        entry.subject,
        entry.status,
        entry.detail,
        entry.html || '',
        entry.createdAt,
        entry.test ? 1 : 0,
      )
      .run();
  } catch {
    // Never fail the actual send because logging failed.
  }
  return entry;
}

export async function listEmailSendLog(env: EmailLogEnv): Promise<EmailSendLogEntry[]> {
  const stored: EmailSendLogEntry[] = [];
  if (env.DB) {
    try {
      await ensureEmailSendLogTable(env.DB);
      const result = await env.DB.prepare(
        `SELECT id, template_id, template_name, recipient, subject, status, detail, html, created_at, is_test
         FROM email_send_log
         ORDER BY created_at DESC
         LIMIT 200`,
      ).all<LogRow>();
      for (const row of result.results || []) {
        const entry = rowToEntry(row);
        if (entry) stored.push(entry);
      }
    } catch {
      // Fall through to Resend list.
    }
  }

  const fromResend: EmailSendLogEntry[] = [];
  if (env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails?limit=100', {
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
      });
      if (response.ok) {
        const data = (await response.json()) as { data?: Array<Parameters<typeof emailSendLogFromResend>[0]> };
        for (const row of data.data || []) {
          const entry = emailSendLogFromResend(row);
          if (entry) fromResend.push(entry);
        }
      }
    } catch {
      // Resend list is optional.
    }
  }

  return mergeEmailSendLogs(stored, fromResend);
}

async function fetchResendEmail(
  apiKey: string,
  id: string,
): Promise<Parameters<typeof emailSendLogFromResend>[0] | null> {
  const response = await fetch(`https://api.resend.com/emails/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) return null;
  return (await response.json()) as Parameters<typeof emailSendLogFromResend>[0];
}

export async function getEmailSendLogEntry(
  env: EmailLogEnv,
  id: string,
): Promise<EmailSendLogEntry | null> {
  const trimmed = id.trim();
  if (!trimmed) return null;

  let stored: EmailSendLogEntry | null = null;
  if (env.DB) {
    try {
      await ensureEmailSendLogTable(env.DB);
      const row = await env.DB.prepare(
        `SELECT id, template_id, template_name, recipient, subject, status, detail, html, created_at, is_test
         FROM email_send_log
         WHERE id = ?`,
      )
        .bind(trimmed)
        .first<LogRow>();
      stored = row ? rowToEntry(row) : null;
    } catch {
      stored = null;
    }
  }

  if (stored?.html) return stored;

  if (env.RESEND_API_KEY) {
    try {
      const remote = await fetchResendEmail(env.RESEND_API_KEY, trimmed);
      const fromResend = remote ? emailSendLogFromResend(remote) : null;
      if (fromResend) {
        return stored ? { ...stored, html: fromResend.html || stored.html, detail: stored.detail || fromResend.detail } : fromResend;
      }
    } catch {
      return stored;
    }
  }

  return stored;
}
