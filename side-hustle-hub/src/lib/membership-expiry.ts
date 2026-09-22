/**
 * Membership expiration, founding complimentary window, and renewal-reminder timing.
 * Paid Adult/Senior plans bill every 3 months in Stripe — not monthly.
 */

import { hasFoundingStarterGrant, parseFoundingStarterSlot } from "./admin-membership";
import { MEMBERSHIP_COMMITMENT_MONTHS } from "./membership-commitment-billing";

const DAY_MS = 24 * 60 * 60 * 1000;

export function isoDay(raw: string | Date | number | null | undefined): string | null {
  if (raw instanceof Date) {
    if (!Number.isFinite(raw.getTime())) return null;
    return raw.toISOString().slice(0, 10);
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return new Date(raw > 1e12 ? raw : raw * 1000).toISOString().slice(0, 10);
  }
  const text = String(raw || "").trim();
  const m = text.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

export function parseMembershipExpiryInput(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (raw == null || raw === "") return { ok: true, value: "" };
  const day = isoDay(String(raw));
  if (!day) return { ok: false, error: "Expiration must be a calendar date (YYYY-MM-DD)." };
  return { ok: true, value: day };
}

/** Add calendar months to an ISO day (UTC), keeping the day-of-month when possible. */
export function addCalendarMonths(iso: string, months: number): string {
  const day = isoDay(iso);
  if (!day) return "";
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + months, d));
  return dt.toISOString().slice(0, 10);
}

export function addMembershipTerm(iso: string, interval: "month" | "year"): string {
  return addCalendarMonths(iso, interval === "year" ? 12 : MEMBERSHIP_COMMITMENT_MONTHS);
}

export function calendarDaysUntil(expiresOn: string, today: string): number | null {
  const end = isoDay(expiresOn);
  const now = isoDay(today);
  if (!end || !now) return null;
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${now}T00:00:00Z`)) / DAY_MS);
}

export function parseFoundingStarterGrantedOn(notes: string | null | undefined): string | null {
  const m = String(notes || "").match(
    /FOUNDING-STARTER\s+\d+\s*\/\s*5\s+complimentary\s+Starter\s+granted\s+(\d{4}-\d{2}-\d{2})/i,
  );
  return m?.[1] ?? null;
}

export function foundingComplimentaryExpiresOn(
  notes: string | null | undefined,
  fallbackDay?: string | null,
): string | null {
  if (parseFoundingStarterSlot(notes) == null && !hasFoundingStarterGrant(notes)) return null;
  const granted = parseFoundingStarterGrantedOn(notes) ?? isoDay(fallbackDay);
  if (!granted) return null;
  return addCalendarMonths(granted, MEMBERSHIP_COMMITMENT_MONTHS);
}

export function isFoundingComplimentaryMember(notes: string | null | undefined): boolean {
  return hasFoundingStarterGrant(notes);
}

/** 7 days out, or any remaining day in that week if cron missed the exact day. */
export function shouldSendMembershipRenewalReminder(opts: {
  expiresOn: string | null | undefined;
  today: string;
  alreadyRemindedFor?: string | null;
  membershipTier?: string | null;
}): boolean {
  const tier = String(opts.membershipTier || "free").toLowerCase();
  if (tier === "free") return false;
  const expires = isoDay(opts.expiresOn);
  if (!expires) return false;
  if (isoDay(opts.alreadyRemindedFor) === expires) return false;
  const days = calendarDaysUntil(expires, opts.today);
  return days != null && days >= 1 && days <= 7;
}

export function shouldRevertExpiredMembership(opts: {
  membershipTier?: string | null;
  expiresOn: string | null | undefined;
  today: string;
}): boolean {
  const tier = String(opts.membershipTier || "free").toLowerCase();
  if (tier === "free") return false;
  const expires = isoDay(opts.expiresOn);
  if (!expires) return false;
  const days = calendarDaysUntil(expires, opts.today);
  return days != null && days <= 0;
}

export type MembershipChargeKind = "free" | "complimentary" | "paid" | "unpaid";

export function membershipChargeStatus(input: {
  membershipTier?: string | null;
  notes?: string | null;
  lastPaidAt?: string | null;
}): { kind: MembershipChargeKind; label: string } {
  const tier = String(input.membershipTier || "free").toLowerCase();
  if (tier === "free") return { kind: "free", label: "No membership charge" };
  if (isFoundingComplimentaryMember(input.notes)) {
    return { kind: "complimentary", label: "Complimentary — no Stripe charge" };
  }
  const paid = isoDay(input.lastPaidAt);
  if (paid) return { kind: "paid", label: `Last charge recorded ${paid}` };
  return { kind: "unpaid", label: "Recurring charge not recorded yet" };
}

export function stripeSubscriptionLooksPaid(status: string | null | undefined): boolean {
  const s = String(status || "").toLowerCase();
  return s === "active" || s === "trialing";
}

export function stripeSubscriptionShouldDrop(status: string | null | undefined): boolean {
  const s = String(status || "").toLowerCase();
  return s === "canceled" || s === "unpaid" || s === "incomplete_expired" || s === "incomplete";
}
