export type EmailLogSortKey =
  | "created_at"
  | "template_name"
  | "recipient_email"
  | "status"
  | "error_message";

export type SortDir = "asc" | "desc";

export interface EmailLogRow {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

/** Match log rows for a template id and its test/BCC label variants. */
export function emailLogMatchesTemplate(rowTemplateName: string, templateName: string): boolean {
  return (
    rowTemplateName === templateName ||
    rowTemplateName === `${templateName} (test)` ||
    rowTemplateName === `${templateName} (bcc)` ||
    rowTemplateName === `${templateName}-test` ||
    rowTemplateName === `${templateName}-bcc`
  );
}

/** Prefer final delivery status over stale pending rows for the same message. */
export function dedupeEmailLogRows<T extends EmailLogRow>(rows: T[]): T[] {
  const STATUS_RANK: Record<string, number> = {
    sent: 6,
    failed: 5,
    dlq: 4,
    suppressed: 3,
    bounced: 3,
    complained: 3,
    pending: 1,
  };

  const bestByMessage = new Map<string, T>();
  for (const row of rows) {
    const key = row.message_id ?? `__no_id__${row.id}`;
    const existing = bestByMessage.get(key);
    if (!existing) {
      bestByMessage.set(key, row);
      continue;
    }
    const existingRank = STATUS_RANK[existing.status] ?? 0;
    const rowRank = STATUS_RANK[row.status] ?? 0;
    if (rowRank > existingRank) {
      bestByMessage.set(key, row);
      continue;
    }
    if (
      rowRank === existingRank &&
      new Date(row.created_at).getTime() > new Date(existing.created_at).getTime()
    ) {
      bestByMessage.set(key, row);
    }
  }

  return [...bestByMessage.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function sortEmailLog(
  rows: EmailLogRow[],
  key: EmailLogSortKey,
  dir: SortDir,
): EmailLogRow[] {
  const cmp = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (key === "created_at") {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return (da - db) * cmp;
    }
    const av = (a[key] ?? "").toString().toLowerCase();
    const bv = (b[key] ?? "").toString().toLowerCase();
    if (av < bv) return -1 * cmp;
    if (av > bv) return 1 * cmp;
    return 0;
  });
}
