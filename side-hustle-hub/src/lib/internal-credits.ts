/**
 * Admin-only internal credit add/remove on any member wallet.
 * Ledger line is "Internal Credits Added" or "Internal Credits Removed".
 */

import { canonicalizeEmail } from "./auth";
import { formatKidCreditBalance } from "./member-credits";

export const INTERNAL_CREDITS_REASON = "Internal Credits Added";
export const INTERNAL_CREDITS_REMOVED_REASON = "Internal Credits Removed";
export const INTERNAL_CREDITS_MAX = 10_000;

export type InternalCreditAction = "add" | "remove";

export type InternalCreditGrant =
  | { ok: true; email: string; credits: number; action: InternalCreditAction }
  | { ok: false; error: string };

export function parseInternalCreditAction(raw: unknown): InternalCreditAction | null {
  const action = String(raw ?? "add").trim().toLowerCase();
  if (action === "add" || action === "") return "add";
  if (action === "remove") return "remove";
  return null;
}

export function internalCreditDelta(credits: number, action: InternalCreditAction): number {
  const n = Math.abs(credits);
  return action === "remove" ? -n : n;
}

export function internalCreditReason(action: InternalCreditAction): string {
  return action === "remove" ? INTERNAL_CREDITS_REMOVED_REASON : INTERNAL_CREDITS_REASON;
}

/** Validate an admin grant payload. Rejects every bad path before D1 writes. */
export function parseInternalCreditGrant(body: unknown): InternalCreditGrant {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Email and credit amount are required." };
  }
  const raw = body as Record<string, unknown>;
  const email = canonicalizeEmail(String(raw.email || ""));
  if (!email || !email.includes("@") || !email.includes(".")) {
    return { ok: false, error: "Enter the member account email." };
  }

  const action = parseInternalCreditAction(raw.action);
  if (!action) {
    return { ok: false, error: "Choose add or remove." };
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
  return { ok: true, email, credits: n, action };
}

export function internalCreditUserOptionLabel(user: {
  name?: string | null;
  email?: string | null;
  creditBalance?: number | null;
}): string {
  const name = String(user.name || "").trim();
  const email = String(user.email || "").trim();
  let base = "Member";
  if (name && email && name.toLowerCase() !== email.toLowerCase()) {
    base = `${name} — ${email}`;
  } else {
    base = name || email || "Member";
  }
  if (user.creditBalance == null || !Number.isFinite(Number(user.creditBalance))) return base;
  return `${base} · ${formatKidCreditBalance(Number(user.creditBalance))}`;
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
