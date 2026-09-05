export type EmailSendLogStatus = 'sent' | 'skipped' | 'failed';

export interface EmailSendLogEntry {
  id: string;
  templateId: string;
  templateName: string;
  to: string;
  subject: string;
  status: EmailSendLogStatus;
  detail: string;
  createdAt: string;
  test: boolean;
  html?: string;
}

export const EMAIL_SEND_LOG_STORAGE_KEY = 'myplan_email_send_log_v1';
export const EMAIL_SEND_LOG_LIMIT = 200;
export const EMAIL_SEND_LOG_API_PATH = '/api/email/log';

export function emailSendLogStatusFromResult(result: {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}): EmailSendLogStatus {
  if (!result.ok) return 'failed';
  if (result.skipped) return 'skipped';
  return 'sent';
}

export function emailSendLogDetailFromResult(result: {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}): string {
  if (result.error?.trim()) return result.error.trim();
  if (result.skipped) return 'Email service not configured';
  if (!result.ok) return 'Send failed';
  return 'Accepted';
}

export function emailSendLogStatusFromResendEvent(lastEvent: string): EmailSendLogStatus {
  const event = lastEvent.trim().toLowerCase();
  if (!event) return 'sent';
  if (event === 'bounced' || event === 'failed' || event === 'complained') return 'failed';
  if (event === 'scheduled') return 'skipped';
  return 'sent';
}

export function guessEmailTemplateId(subject: string): string {
  const normalized = subject.replace(/^\[TEST\]\s*/i, '').toLowerCase();
  if (normalized.includes('new signup pending approval')) return 'admin-new-signup';
  if (normalized.includes('got your signup')) return 'signup-confirmation';
  if (normalized.includes('signup received') || normalized.includes('pending approval')) {
    return 'signup-pending';
  }
  if (normalized.includes('approved')) return 'user-approved';
  if (normalized.includes('reset')) return 'password-reset';
  return '';
}

export function createEmailSendLogEntry(input: {
  id?: string;
  templateId?: string;
  templateName?: string;
  to: string;
  subject: string;
  status: EmailSendLogStatus;
  detail?: string;
  test?: boolean;
  html?: string;
  now?: Date;
}): EmailSendLogEntry {
  const createdAt = (input.now ?? new Date()).toISOString();
  const subject = String(input.subject || '').trim();
  const test = input.test ?? /^\[TEST\]/i.test(subject);
  return {
    id: String(input.id || '').trim() || `elog-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
    templateId: String(input.templateId || guessEmailTemplateId(subject)).trim(),
    templateName: String(input.templateName || '').trim(),
    to: String(input.to || '').trim().toLowerCase(),
    subject,
    status: input.status,
    detail: String(input.detail || '').trim(),
    createdAt,
    test,
    html: String(input.html || ''),
  };
}

function normalizeCreatedAt(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.trim();
  return parsed.toISOString();
}

export function parseEmailSendLog(value: unknown): EmailSendLogEntry[] {
  if (!Array.isArray(value)) return [];
  const out: EmailSendLogEntry[] = [];
  for (const row of value) {
    if (!row || typeof row !== 'object') continue;
    const rec = row as Record<string, unknown>;
    const status = rec.status;
    if (status !== 'sent' && status !== 'skipped' && status !== 'failed') continue;
    const id = String(rec.id ?? '').trim();
    const createdAt = String(rec.createdAt ?? '').trim();
    if (!id || !createdAt) continue;
    const subject = String(rec.subject ?? '').trim();
    out.push({
      id,
      templateId: String(rec.templateId ?? guessEmailTemplateId(subject)).trim(),
      templateName: String(rec.templateName ?? ''),
      to: String(rec.to ?? ''),
      subject,
      status,
      detail: String(rec.detail ?? ''),
      createdAt: normalizeCreatedAt(createdAt),
      test: rec.test === true || (rec.test !== false && /^\[TEST\]/i.test(subject)),
      html: String(rec.html ?? ''),
    });
  }
  return out;
}

export function emailSendLogFromResend(row: {
  id?: string;
  to?: string | string[] | null;
  subject?: string | null;
  created_at?: string | null;
  last_event?: string | null;
  html?: string | null;
}): EmailSendLogEntry | null {
  const id = String(row.id || '').trim();
  const createdAt = String(row.created_at || '').trim();
  if (!id || !createdAt) return null;
  const to = Array.isArray(row.to) ? row.to.filter(Boolean).join(', ') : String(row.to || '');
  const subject = String(row.subject || '').trim();
  const lastEvent = String(row.last_event || '').trim();
  return createEmailSendLogEntry({
    id,
    to,
    subject,
    status: emailSendLogStatusFromResendEvent(lastEvent),
    detail: lastEvent ? lastEvent.replace(/_/g, ' ') : 'Sent via Resend',
    test: /^\[TEST\]/i.test(subject),
    html: row.html || '',
    now: new Date(normalizeCreatedAt(createdAt)),
  });
}

export function emailSendLogForTemplate(
  entries: readonly EmailSendLogEntry[],
  templateId: string,
): EmailSendLogEntry[] {
  const id = String(templateId || '').trim();
  if (!id) return [];
  return entries
    .filter((entry) => entry.templateId === id)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function mergeEmailSendLogs(
  ...lists: Array<readonly EmailSendLogEntry[] | undefined>
): EmailSendLogEntry[] {
  const byId = new Map<string, EmailSendLogEntry>();
  for (const list of lists) {
    for (const entry of list || []) {
      const existing = byId.get(entry.id);
      if (!existing) {
        byId.set(entry.id, entry);
        continue;
      }
      byId.set(entry.id, {
        ...existing,
        ...entry,
        templateId: entry.templateId || existing.templateId,
        templateName: entry.templateName || existing.templateName,
        html: entry.html || existing.html,
        detail: entry.detail || existing.detail,
      });
    }
  }
  return [...byId.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, EMAIL_SEND_LOG_LIMIT);
}

export function prependEmailSendLog(
  entries: readonly EmailSendLogEntry[],
  entry: EmailSendLogEntry,
): EmailSendLogEntry[] {
  return mergeEmailSendLogs([entry], entries);
}

export function readEmailSendLog(): EmailSendLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return parseEmailSendLog(JSON.parse(localStorage.getItem(EMAIL_SEND_LOG_STORAGE_KEY) || '[]'));
  } catch {
    return [];
  }
}

export function writeEmailSendLog(entries: readonly EmailSendLogEntry[]): EmailSendLogEntry[] {
  const next = mergeEmailSendLogs(entries);
  if (typeof window !== 'undefined') {
    localStorage.setItem(EMAIL_SEND_LOG_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function recordEmailSendLog(input: Parameters<typeof createEmailSendLogEntry>[0]): EmailSendLogEntry {
  const entry = createEmailSendLogEntry(input);
  writeEmailSendLog(prependEmailSendLog(readEmailSendLog(), entry));
  return entry;
}

export async function fetchEmailSendLog(): Promise<EmailSendLogEntry[]> {
  const local = readEmailSendLog();
  try {
    const response = await fetch(EMAIL_SEND_LOG_API_PATH, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return local;
    const data = (await response.json()) as { entries?: unknown };
    const remote = parseEmailSendLog(data.entries);
    const merged = mergeEmailSendLogs(remote, local);
    writeEmailSendLog(merged);
    return merged;
  } catch {
    return local;
  }
}

export async function fetchEmailSendLogHtml(id: string): Promise<string> {
  const trimmed = String(id || '').trim();
  if (!trimmed) return '';
  try {
    const response = await fetch(`${EMAIL_SEND_LOG_API_PATH}?id=${encodeURIComponent(trimmed)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return '';
    const data = (await response.json()) as { entry?: { html?: string } };
    return String(data.entry?.html || '');
  } catch {
    return '';
  }
}

export function formatEmailSendLogWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export function emailSendLogStatusLabel(status: EmailSendLogStatus): string {
  if (status === 'sent') return 'Sent';
  if (status === 'skipped') return 'Not sent';
  return 'Failed';
}
