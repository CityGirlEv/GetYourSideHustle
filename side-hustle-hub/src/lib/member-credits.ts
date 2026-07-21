/**
 * Member Kid Credit helpers — display math + API client for My Dashboard.
 */
import { api } from "./api";
import {
  adultCreditsFromKidCredits,
  KID_TO_ADULT_CREDIT_RATIO,
  MEMBERSHIP_TIERS,
  type AudienceGroup,
  type TierId,
} from "./membership";

export type MemberCreditLedgerEntry = {
  id: string;
  delta: number;
  reason: string;
  balanceAfter: number;
  createdAt: string;
};

export type MemberCreditsPayload = {
  balance: number;
  membershipTier: string;
  audience: string;
  recent: MemberCreditLedgerEntry[];
};

export type MemberCreditsSummary = {
  balance: number;
  adultEquivalent: number;
  membershipTier: TierId;
  audience: AudienceGroup;
  monthlyAllowance: number;
  recent: MemberCreditLedgerEntry[];
  ratioLabel: string;
};

const TIER_IDS = new Set<string>(["free", "starter", "pro", "elite"]);
const AUDIENCES = new Set<string>(["kids", "junior", "adult", "senior"]);

export function normalizeTierId(raw: string | null | undefined): TierId {
  const t = String(raw || "free").toLowerCase();
  return (TIER_IDS.has(t) ? t : "free") as TierId;
}

export function normalizeAudience(raw: string | null | undefined): AudienceGroup {
  const a = String(raw || "adult").toLowerCase();
  return (AUDIENCES.has(a) ? a : "adult") as AudienceGroup;
}

/** Monthly Kid Credits from plan — Kids/Teens use creditsPerMonth; Adult/Senior use kidCreditsMonthly. */
export function monthlyKidCreditAllowance(tierId: TierId, audience: AudienceGroup): number {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  if (!tier) return 0;
  if (audience === "kids" || audience === "junior") {
    return tier.creditsPerMonth ?? 0;
  }
  return tier.kidCreditsMonthly ?? 0;
}

export function formatKidCreditBalance(balance: number): string {
  const n = Number.isFinite(balance) ? Math.max(0, Math.floor(balance)) : 0;
  return `${n} Kid Credit${n === 1 ? "" : "s"}`;
}

export function formatAdultCreditEquivalent(kidCredits: number): string {
  const adult = adultCreditsFromKidCredits(kidCredits);
  return `${adult} adult credit${adult === 1 ? "" : "s"}`;
}

export function creditRatioLabel(ratio = KID_TO_ADULT_CREDIT_RATIO): string {
  return `${ratio} Kid Credits = 1 adult credit`;
}

export function formatLedgerDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export function summarizeMemberCredits(payload: MemberCreditsPayload): MemberCreditsSummary {
  const balance = Number.isFinite(payload.balance) ? Math.max(0, Math.floor(payload.balance)) : 0;
  const membershipTier = normalizeTierId(payload.membershipTier);
  const audience = normalizeAudience(payload.audience);
  return {
    balance,
    adultEquivalent: adultCreditsFromKidCredits(balance),
    membershipTier,
    audience,
    monthlyAllowance: monthlyKidCreditAllowance(membershipTier, audience),
    recent: Array.isArray(payload.recent) ? payload.recent : [],
    ratioLabel: creditRatioLabel(),
  };
}

export async function fetchMemberCredits(): Promise<MemberCreditsPayload> {
  return api<MemberCreditsPayload>("member-credits");
}
