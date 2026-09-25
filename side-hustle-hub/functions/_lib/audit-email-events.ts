/** Map GYSH email_log rows into Users Area audit events. */

export type AuditEvent = {
  at: string;
  action: string;
  email: string;
  detail: string;
};

export type EmailLogAuditRow = {
  toEmail: string;
  subject: string;
  templateSlug: string;
  status: string;
  error?: string | null;
  createdAt: string;
};

export function emailStatusToAuditAction(status: string): "email_sent" | "email_failed" | "email_skipped" {
  const s = String(status || "").trim().toLowerCase();
  if (s === "failed") return "email_failed";
  if (s === "skipped") return "email_skipped";
  return "email_sent";
}

export function emailLogRowToAuditEvent(row: EmailLogAuditRow): AuditEvent {
  const action = emailStatusToAuditAction(row.status);
  const subject = String(row.subject || "").trim() || "(no subject)";
  const slug = String(row.templateSlug || "").trim();
  const err = String(row.error || "").trim();
  const parts = [subject];
  if (slug) parts.push(slug);
  if (err && action !== "email_sent") parts.push(err);
  return {
    at: String(row.createdAt || "").trim(),
    action,
    email: String(row.toEmail || "").trim().toLowerCase(),
    detail: parts.join(" · "),
  };
}

export function mergeAuditEventsWithEmails(
  events: readonly AuditEvent[],
  emailRows: readonly EmailLogAuditRow[],
  limit: number,
): AuditEvent[] {
  const cap = Number.isFinite(limit) ? Math.min(Math.max(Math.floor(limit), 1), 2000) : 500;
  const merged = [...events, ...emailRows.map(emailLogRowToAuditEvent)];
  merged.sort((a, b) => {
    const ta = Date.parse(a.at) || 0;
    const tb = Date.parse(b.at) || 0;
    return tb - ta;
  });
  return merged.slice(0, cap);
}
