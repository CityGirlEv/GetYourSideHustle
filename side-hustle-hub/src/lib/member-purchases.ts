/**
 * Member purchase history + access summary for My Dashboard.
 */
import { api } from "./api";
import { canAccessScheduleSuite } from "./hustle-schedule";
import {
  AUDIENCE_LABELS,
  MEMBERSHIP_TIERS,
  featuresForTier,
  numberedTierPerks,
  type AudienceGroup,
  type TierId,
} from "./membership";
import { normalizeAudience, normalizeTierId } from "./member-credits";

export type MemberPurchase = {
  id: string;
  sessionId: string;
  kind: string;
  tier: string;
  audience: string;
  interval: string;
  label: string;
  amountCents: number;
  amountUsd: number;
  currency: string;
  paidAt: string;
  source: string;
};

export type MemberPurchasesPayload = {
  ok?: boolean;
  membershipTier: string;
  audience: string;
  purchases: MemberPurchase[];
};

export type MemberBillingTotals = {
  count: number;
  amountUsd: number;
  byKind: Record<string, { count: number; amountUsd: number }>;
};

export type MemberAccessSummary = {
  membershipTier: TierId;
  audience: AudienceGroup;
  planLabel: string;
  audienceLabel: string;
  enrolledLabel: string;
  scheduleSuite: boolean;
  perks: Array<{ title: string; detail?: string }>;
  features: Array<{ id: string; label: string; detail: string }>;
  purchasedSessions: string[];
  creditPacks: string[];
};

export function purchaseKindLabel(kind: string): string {
  const k = String(kind || "").toLowerCase();
  if (k === "membership") return "Membership";
  if (k === "alacarte") return "A-la-carte";
  if (k === "credit_pack") return "Credit pack";
  return kind || "Purchase";
}

export function formatPurchasePaidAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || "—";
  try {
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return d.toISOString();
  }
}

export function formatPurchaseAmount(p: Pick<MemberPurchase, "amountUsd" | "currency">): string {
  const usd = Number(p.amountUsd);
  if (!Number.isFinite(usd)) return "—";
  if (String(p.currency || "usd").toLowerCase() === "usd") {
    return formatBillingUsd(usd);
  }
  return `${usd.toFixed(2)} ${String(p.currency || "").toUpperCase()}`;
}

/** USD for billing (keeps $0 instead of membership "Free"). */
export function formatBillingUsd(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  if (Number.isInteger(v)) return `$${v.toLocaleString()}`;
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function summarizeMemberBilling(purchases: MemberPurchase[]): MemberBillingTotals {
  const byKind: Record<string, { count: number; amountUsd: number }> = {};
  let amountUsd = 0;
  for (const p of purchases) {
    const kind = String(p.kind || "other").toLowerCase();
    const amt = Number.isFinite(p.amountUsd) ? p.amountUsd : Math.round(p.amountCents || 0) / 100;
    amountUsd += amt;
    if (!byKind[kind]) byKind[kind] = { count: 0, amountUsd: 0 };
    byKind[kind]!.count += 1;
    byKind[kind]!.amountUsd += amt;
  }
  return {
    count: purchases.length,
    amountUsd: Math.round(amountUsd * 100) / 100,
    byKind: Object.fromEntries(
      Object.entries(byKind).map(([k, v]) => [
        k,
        { count: v.count, amountUsd: Math.round(v.amountUsd * 100) / 100 },
      ]),
    ),
  };
}

export function buildMemberAccessSummary(input: {
  membershipTier: string | null | undefined;
  audience: string | null | undefined;
  purchases?: MemberPurchase[];
}): MemberAccessSummary {
  const membershipTier = normalizeTierId(input.membershipTier);
  const audience = normalizeAudience(input.audience);
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === membershipTier);
  const planLabel = tier?.name ?? "Free";
  const audienceLabel = AUDIENCE_LABELS[audience];
  const purchases = Array.isArray(input.purchases) ? input.purchases : [];
  const purchasedSessions = [
    ...new Set(
      purchases
        .filter((p) => String(p.kind).toLowerCase() === "alacarte")
        .map((p) => p.label || "A-la-carte item")
        .filter(Boolean),
    ),
  ];
  const creditPacks = [
    ...new Set(
      purchases
        .filter((p) => String(p.kind).toLowerCase() === "credit_pack")
        .map((p) => p.label || "Credit pack")
        .filter(Boolean),
    ),
  ];
  return {
    membershipTier,
    audience,
    planLabel,
    audienceLabel,
    enrolledLabel: `${planLabel} · ${audienceLabel}`,
    scheduleSuite: canAccessScheduleSuite(membershipTier, { isAdmin: false }),
    perks: numberedTierPerks(membershipTier, audience).map((p) => ({
      title: p.numberedTitle,
      detail: p.detail,
    })),
    features: featuresForTier(membershipTier).map((f) => ({
      id: f.id,
      label: f.label,
      detail: f.detail,
    })),
    purchasedSessions,
    creditPacks,
  };
}

export async function fetchMemberPurchases(): Promise<MemberPurchasesPayload> {
  return api<MemberPurchasesPayload>("member-purchases");
}
