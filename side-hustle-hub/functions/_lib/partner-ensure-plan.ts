/**
 * Existing partner rows are owned by Users Area.
 * Ensure may only backfill a missing password — never roles/status.
 */
export function partnerEnsurePlan(existing: {
  password_hash?: string | null;
} | null): { action: "insert" } | { action: "backfill-password" } | { action: "noop" } {
  if (!existing) return { action: "insert" };
  if (!existing.password_hash) return { action: "backfill-password" };
  return { action: "noop" };
}
