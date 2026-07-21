/** Format last-updated audit lines for Task List / Testing Portal / Schedule cards. */

export function formatAuditUpdatedAt(iso: string | null | undefined): string {
  if (!iso?.trim()) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    // Already a date-only string like YYYY-MM-DD
    return iso.trim();
  }
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

/** e.g. "Last updated by Tina · Mar 18, 2026, 2:40 PM" */
export function formatAuditTrail(
  updatedAt: string | null | undefined,
  updatedBy: string | null | undefined,
): string | null {
  const when = formatAuditUpdatedAt(updatedAt);
  const who = (updatedBy || "").trim();
  if (!when && !who) return null;
  if (who && when) return `Last updated by ${who} · ${when}`;
  if (who) return `Last updated by ${who}`;
  return `Last updated · ${when}`;
}
