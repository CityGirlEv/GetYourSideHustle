/**
 * Member Kid Credit helpers — display math + API client for My Dashboard.
 */
import { api } from "./api";
import {
  adultCreditsFromKidCredits,
  AUDIENCE_LABELS,
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

export type MemberCreditTotals = {
  earned: number;
  spent: number;
  balance: number;
};

export type MemberCreditsPayload = {
  balance: number;
  membershipTier: string;
  audience: string;
  monthlyAllowance?: number;
  totals?: MemberCreditTotals;
  recent: MemberCreditLedgerEntry[];
};

export type MemberCreditsSummary = {
  balance: number;
  adultEquivalent: number;
  membershipTier: TierId;
  audience: AudienceGroup;
  audienceLabel: string;
  planLabel: string;
  enrolledLabel: string;
  monthlyAllowance: number;
  totals: MemberCreditTotals;
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
  // Parent family accounts use the Kids credit pool.
  if (a === "parent") return "kids";
  // User-facing label is Teens; stored audience id remains "junior".
  if (a === "teen" || a === "teens") return "junior";
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

export function enrolledPlanLabel(tierId: TierId, audience: AudienceGroup): string {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  const plan = tier?.name ?? "Free";
  const lane = AUDIENCE_LABELS[audience] ?? audience;
  return `${plan} · ${lane}`;
}

export function summarizeMemberCredits(payload: MemberCreditsPayload): MemberCreditsSummary {
  const balance = Number.isFinite(payload.balance) ? Math.max(0, Math.floor(payload.balance)) : 0;
  const membershipTier = normalizeTierId(payload.membershipTier);
  const audience = normalizeAudience(payload.audience);
  const monthlyAllowance =
    typeof payload.monthlyAllowance === "number"
      ? Math.max(0, Math.floor(payload.monthlyAllowance))
      : monthlyKidCreditAllowance(membershipTier, audience);
  const totalsRaw = payload.totals;
  const totals: MemberCreditTotals = {
    earned: Math.max(0, Math.floor(Number(totalsRaw?.earned) || 0)),
    spent: Math.max(0, Math.floor(Number(totalsRaw?.spent) || 0)),
    balance: Math.max(0, Math.floor(Number(totalsRaw?.balance ?? balance) || 0)),
  };
  const planLabel = MEMBERSHIP_TIERS.find((t) => t.id === membershipTier)?.name ?? "Free";
  return {
    balance,
    adultEquivalent: adultCreditsFromKidCredits(balance),
    membershipTier,
    audience,
    audienceLabel: AUDIENCE_LABELS[audience],
    planLabel,
    enrolledLabel: enrolledPlanLabel(membershipTier, audience),
    monthlyAllowance,
    totals,
    recent: Array.isArray(payload.recent) ? payload.recent : [],
    ratioLabel: creditRatioLabel(),
  };
}

export async function fetchMemberCredits(): Promise<MemberCreditsPayload> {
  return api<MemberCreditsPayload>("member-credits");
}

export type InternalCreditsGrantResult = {
  ok: true;
  email: string;
  name: string;
  granted: number;
  removed: number;
  action: "add" | "remove";
  balance: number;
  reason: string;
};

/** Admin only — add or remove credits on any member wallet. */
export async function grantInternalCredits(input: {
  email: string;
  credits: number;
  action?: "add" | "remove";
}): Promise<InternalCreditsGrantResult> {
  return api<InternalCreditsGrantResult>("admin/internal-credits", {
    method: "POST",
    body: input,
  });
}
