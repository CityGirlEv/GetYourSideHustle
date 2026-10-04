/**
 * Member self-serve cancel / downgrade / deactivate in Billing/Access.
 * Paid → Free (cancel Stripe). Deactivate → soft-delete (frees email; linked kids too).
 */

import {
  MEMBERSHIP_TIERS,
  TIER_LADDER,
  formatUsd,
  tierPriceMonthlyUsd,
  tierPriceYearlyUsd,
  type AudienceGroup,
  type TierId,
} from "./membership";
import {
  membershipBillingCadenceLabel,
  membershipJoinDueUsd,
} from "./membership-commitment-billing";

export type MembershipCancelAction = "cancel_to_free" | "deactivate_account";

/** @deprecated Prefer deactivate_account — kept for older clients. */
export type LegacyMembershipCancelAction = "unsubscribe_disable";

export function normalizeMembershipTierId(tier: string | null | undefined): TierId {
  const t = String(tier || "free").toLowerCase();
  if (t === "starter" || t === "pro" || t === "elite") return t;
  return "free";
}

export function isPaidMembershipTier(tier: string | null | undefined): boolean {
  const t = normalizeMembershipTierId(tier);
  return t === "starter" || t === "pro" || t === "elite";
}

export function membershipCancelActionForTier(
  tier: string | null | undefined,
): MembershipCancelAction {
  return isPaidMembershipTier(tier) ? "cancel_to_free" : "deactivate_account";
}

export function membershipCancelButtonLabel(action: MembershipCancelAction): string {
  return action === "cancel_to_free" ? "Downgrade account" : "Deactivate account";
}

export function membershipCancelConfirmCopy(
  action: MembershipCancelAction,
  opts?: { linkedKidCount?: number },
): string {
  if (action === "cancel_to_free") {
    return membershipDowngradeNotice({
      currentName: "your paid plan",
      nextName: "Free",
      nextTier: "free",
      chargeLabel: "no further charge",
    });
  }
  const kids = Math.max(0, Math.floor(Number(opts?.linkedKidCount) || 0));
  if (kids > 0) {
    return `Deactivate your account? It will be soft-deleted (kept on file; that email can sign up again). ${kids} linked kid account${kids === 1 ? "" : "s"} will also be soft-deleted. You will be signed out.`;
  }
  return "Deactivate your account? It will be soft-deleted (kept on file; that email can sign up again). You will be signed out.";
}

/** Lower plans a member can move to (paid tiers below current, plus Free). */
export function membershipDowngradeOptions(tier: string | null | undefined): {
  id: TierId;
  name: string;
  tagline: string;
  priceMonthlyUsd: number;
}[] {
  const current = normalizeMembershipTierId(tier);
  const idx = TIER_LADDER.indexOf(current);
  if (idx <= 0) return [];
  return TIER_LADDER.slice(0, idx)
    .map((id) => {
      const def = MEMBERSHIP_TIERS.find((t) => t.id === id);
      return {
        id,
        name: def?.name ?? id,
        tagline: def?.tagline ?? "",
        priceMonthlyUsd: def?.priceMonthlyUsd ?? 0,
      };
    })
    .reverse(); // nearest lower plan first (e.g. Elite → Pro, Starter, Free)
}

/** Higher plans a member can move to (tiers above current). */
export function membershipUpgradeOptions(tier: string | null | undefined): {
  id: TierId;
  name: string;
  tagline: string;
  priceMonthlyUsd: number;
}[] {
  const current = normalizeMembershipTierId(tier);
  const idx = TIER_LADDER.indexOf(current);
  if (idx < 0 || idx >= TIER_LADDER.length - 1) return [];
  return TIER_LADDER.slice(idx + 1).map((id) => {
    const def = MEMBERSHIP_TIERS.find((t) => t.id === id);
    return {
      id,
      name: def?.name ?? id,
      tagline: def?.tagline ?? "",
      priceMonthlyUsd: def?.priceMonthlyUsd ?? 0,
    };
  });
}

/** Dollar amount Stripe will bill on the next cycle after a downgrade. */
export function membershipDowngradeChargeLabel(input: {
  nextTier: TierId;
  audience?: string | null;
  interval?: "month" | "year";
}): string {
  if (input.nextTier === "free") return "no further charge";
  const lane = String(input.audience || "adult").toLowerCase();
  if (lane === "kids" || lane === "junior") return "the new Kid Credit plan rate";
  const tier = MEMBERSHIP_TIERS.find((row) => row.id === input.nextTier);
  if (!tier) return "the new plan rate";
  const audience: AudienceGroup = input.audience === "senior" ? "senior" : "adult";
  const interval = input.interval === "year" ? "year" : "month";
  const due = membershipJoinDueUsd(
    interval,
    tierPriceMonthlyUsd(tier, audience),
    tierPriceYearlyUsd(tier, audience) ?? null,
  );
  return `${formatUsd(due)} ${membershipBillingCadenceLabel(interval)}`;
}

export function formatMembershipBillingDay(isoDay: string | null | undefined): string | null {
  const day = String(isoDay || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, date ?? 1)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** What the member sees before a downgrade is scheduled. */
export function membershipDowngradeNotice(input: {
  currentName: string;
  nextName: string;
  nextTier: TierId;
  chargeLabel: string;
  effectiveOn?: string | null;
}): string {
  const when = input.effectiveOn?.trim() || "your upcoming billing cycle";
  if (input.nextTier === "free") {
    return `You keep ${input.currentName} until ${when}. Stripe will not charge you again after that. Your membership becomes Free on that date. Nothing changes today.`;
  }
  const chargeLine = /kid credit/i.test(input.chargeLabel)
    ? `On that date your membership changes to ${input.nextName} at ${input.chargeLabel}.`
    : `On that billing cycle Stripe will charge ${input.chargeLabel} for ${input.nextName}. Your membership level changes to ${input.nextName} that day.`;
  return `You keep ${input.currentName} until ${when}. ${chargeLine} Nothing is charged today.`;
}

/** Billing history rows that can show Cancel (active paid membership purchase). */
export function purchaseRowShowsCancel(
  kind: string,
  membershipTier: string | null | undefined,
): boolean {
  return String(kind || "").toLowerCase() === "membership" && isPaidMembershipTier(membershipTier);
}
