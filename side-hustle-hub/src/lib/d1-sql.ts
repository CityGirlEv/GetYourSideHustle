/**
 * SQLite LIKE / GLOB treat `_` as “any single character”.
 * Stripe Checkout ids (`cs_live_…`, `cs_test_…`) contain underscores; wrapping
 * them in `%…%` can throw D1_ERROR: LIKE or GLOB pattern too complex.
 *
 * Use instr() for literal substring matches instead of LIKE.
 */

/** True when a LIKE pattern can explode (leading/trailing % plus `_` wildcards). */
export function sqliteLikePatternIsUnsafe(pattern: string): boolean {
  const p = String(pattern || "");
  if (!p.includes("%")) return false;
  return p.replace(/%/g, "").includes("_");
}

/** LIKE wrap used by the old credit-ledger lookups — unsafe for Stripe ids. */
export function likeContainsPattern(needle: string): string {
  return `%${String(needle || "")}%`;
}

/**
 * Idempotency token from a ledger reason or a bare session id.
 * Captures the full Stripe id (underscores after live/test) or a GYSH `cred-` id.
 */
export function checkoutIdempotencyToken(reasonOrSessionId: string): string | null {
  const raw = String(reasonOrSessionId || "").trim();
  if (!raw) return null;
  const m = /\b(cs_(?:live|test)_[A-Za-z0-9]+|cred-[A-Za-z0-9-]+)\b/i.exec(raw);
  return m?.[1] ?? null;
}

function isValidIsoTimestamp(iso: string | null | undefined): boolean {
  const raw = String(iso || "").trim();
  if (!raw) return false;
  return !Number.isNaN(new Date(raw).getTime());
}

/**
 * Ledger display time: checkout payment `paidAt` when the reason includes a
 * Stripe/cred session id, otherwise the ledger row timestamp.
 */
export function ledgerOccurredAt(
  entry: { createdAt?: string | null; occurredAt?: string | null; reason?: string | null },
  purchases: readonly { sessionId?: string | null; paidAt?: string | null }[] = [],
): string {
  const token = checkoutIdempotencyToken(String(entry.reason || ""));
  if (token) {
    const paid = purchases.find((p) => String(p.sessionId || "").trim() === token)?.paidAt;
    const paidRaw = String(paid || "").trim();
    if (isValidIsoTimestamp(paidRaw)) return paidRaw;
  }
  const stamped = String(entry.occurredAt || "").trim();
  if (isValidIsoTimestamp(stamped)) return stamped;
  return String(entry.createdAt || "").trim();
}

/** Literal contains — bind the needle as the next `?`. */
export const SQL_TEXT_CONTAINS = "instr(reason, ?) > 0";

/** Literal prefix — bind the prefix as the next `?`. */
export const SQL_TEXT_STARTS_WITH = "instr(reason, ?) = 1";
