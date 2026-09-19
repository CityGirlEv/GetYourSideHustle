/**
 * Email copy derived from the membership page catalog.
 * Do not duplicate plan names, prices, perk titles, or merch counts in templates.
 */
import {
  MEMBERSHIP_COMPARE_ROWS,
  MEMBERSHIP_TIERS,
  MERCH_PRO_PERK,
  MERCH_STARTER_PERK,
  merchItemCount,
  numberedTierPerks,
  type MemberPerkAudience,
  type TierId,
  type TierMemberPerk,
} from "./membership";
import {
  GYSH_FAMILY_DISCOUNT_CODE,
  GYSH_FAMILY_DISCOUNT_PERCENT,
} from "./gysh-gear-store";

export function membershipTierDisplayName(tier: TierId): string {
  return MEMBERSHIP_TIERS.find((row) => row.id === tier)?.name ?? "Free";
}

export function membershipTierPriceLabel(tier: TierId): string {
  const usd = MEMBERSHIP_TIERS.find((row) => row.id === tier)?.priceMonthlyUsd ?? 0;
  return usd > 0 ? `$${usd}/mo` : "$0";
}

export function membershipPerkTitles(tier: TierId, audience: MemberPerkAudience): string[] {
  return numberedTierPerks(tier, audience).map((perk) => perk.title);
}

export function merchCompareCell(tier: TierId): string {
  const row = MEMBERSHIP_COMPARE_ROWS.find((entry) => entry.id === "merch");
  return row?.cells[tier] ?? "—";
}

export function merchPerkForTier(tier: TierId): TierMemberPerk | null {
  const count = merchItemCount(tier);
  if (count === 1) return MERCH_STARTER_PERK;
  if (count === 2) return MERCH_PRO_PERK;
  return null;
}

export function merchItemPhrase(count: number): string {
  if (count === 1) return "1 hat or 1 tee";
  if (count === 2) return "2 hats and/or tees (mix and match)";
  return "no complimentary GYSH gear";
}

/** Send-time vars so merch emails match the member's plan on the membership page. */
export function merchEmailVars(tier: TierId): Record<string, string> {
  const count = merchItemCount(tier);
  const perk = merchPerkForTier(tier);
  return {
    tier: membershipTierDisplayName(tier),
    merchCount: String(count),
    merchCell: merchCompareCell(tier),
    merchPerkTitle: perk?.title ?? "",
    merchPerkDetail: perk?.detail ?? "",
    merchItemPhrase: merchItemPhrase(count),
    merchCheckoutCode: GYSH_FAMILY_DISCOUNT_CODE,
    merchCheckoutPercent: String(GYSH_FAMILY_DISCOUNT_PERCENT),
  };
}
