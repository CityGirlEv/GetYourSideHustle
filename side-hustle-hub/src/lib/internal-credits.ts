/**
 * Admin-only internal credit grants (parent / family wallets).
 * Ledger line item is always "Internal Credits Added".
 */

import { canonicalizeEmail } from "./auth";

export const INTERNAL_CREDITS_REASON = "Internal Credits Added";
export const INTERNAL_CREDITS_MAX = 10_000;

export type InternalCreditGrant =
  | { ok: true; email: string; credits: number }
  | { ok: false; error: string };

/** Validate an admin grant payload. Rejects every bad path before D1 writes. */
export function parseInternalCreditGrant(body: unknown): InternalCreditGrant {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Email and credit amount are required." };
  }
  const raw = body as Record<string, unknown>;
  const email = canonicalizeEmail(String(raw.email || ""));
  if (!email || !email.includes("@") || !email.includes(".")) {
    return { ok: false, error: "Enter the parent account email." };
  }

  const n = Number(raw.credits);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, error: "Credits must be a whole number." };
  }
  if (n <= 0) {
    return { ok: false, error: "Credits must be greater than zero." };
  }
  if (n > INTERNAL_CREDITS_MAX) {
    return { ok: false, error: `Credits cannot exceed ${INTERNAL_CREDITS_MAX}.` };
  }
  return { ok: true, email, credits: n };
}

export function internalCreditUserOptionLabel(user: {
  name?: string | null;
  email?: string | null;
}): string {
  const name = String(user.name || "").trim();
  const email = String(user.email || "").trim();
  if (name && email && name.toLowerCase() !== email.toLowerCase()) {
    return `${name} — ${email}`;
  }
  return name || email || "Member";
}

export function sortUsersForInternalCreditGrant<T extends { name?: string | null; email?: string | null }>(
  users: readonly T[],
): T[] {
  return [...users].sort((a, b) => {
    const an = String(a.name || "").trim() || String(a.email || "");
    const bn = String(b.name || "").trim() || String(b.email || "");
    const byName = an.localeCompare(bn, undefined, { sensitivity: "base" });
    if (byName !== 0) return byName;
    return String(a.email || "").localeCompare(String(b.email || ""), undefined, {
      sensitivity: "base",
    });
  });
}
