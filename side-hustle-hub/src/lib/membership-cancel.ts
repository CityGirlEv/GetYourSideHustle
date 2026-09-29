/**
 * Member self-serve cancel / downgrade / deactivate in Billing/Access.
 * Paid → Free (cancel Stripe). Deactivate → soft-delete (frees email; linked kids too).
 */

import {
  MEMBERSHIP_TIERS,
  TIER_LADDER,
  type TierId,
} from "./membership";

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
    return "Downgrade your paid membership? Stripe billing stops and your account becomes a Free account. You keep access to free guides.";
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

/** Billing history rows that can show Cancel (active paid membership purchase). */
export function purchaseRowShowsCancel(
  kind: string,
  membershipTier: string | null | undefined,
): boolean {
  return String(kind || "").toLowerCase() === "membership" && isPaidMembershipTier(membershipTier);
}
