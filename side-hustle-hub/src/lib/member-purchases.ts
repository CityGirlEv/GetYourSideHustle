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
import {
  formatAlaCartePurchaseLabel,
  formatCreditPackPurchaseLabel,
  kidCreditsFromPurchase,
  stripStripeSessionId,
} from "./credit-pack-purchase";

/** My Dashboard → Billing/Access tab. */
export const BILLING_DASHBOARD_HREF = "/my-dashboard#billing";

export function isBillingDashboardHash(hash: string): boolean {
  const h = String(hash || "").replace(/^#/, "").toLowerCase();
  return h === "billing" || h === "purchases";
}

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

export type MemberPurchaseWithCredits = MemberPurchase & {
  kidCreditsGranted: number;
  adultCreditsGranted: number;
  kidCreditsRunning: number;
  adultCreditsRunning: number;
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

export type MemberAccessPurchaseLine = {
  id: string;
  label: string;
  paidAt: string;
};

export type MemberAccessSummary = {
  membershipTier: TierId;
  audience: AudienceGroup;
  planLabel: string;
  audienceLabel: string;
  enrolledLabel: string;
  membershipPaidAt: string | null;
  scheduleSuite: boolean;
  perks: Array<{ title: string; detail?: string }>;
  features: Array<{ id: string; label: string; detail: string }>;
  purchasedSessions: MemberAccessPurchaseLine[];
  creditPacks: MemberAccessPurchaseLine[];
};

export function purchaseKindLabel(kind: string): string {
  const k = String(kind || "").toLowerCase();
  if (k === "membership") return "Membership";
  if (k === "alacarte") return "A-la-carte";
  if (k === "credit_pack") return "Credit pack";
  return kind || "Purchase";
}

function membershipLevelDisplayName(tier: string | null | undefined): string {
  const id = normalizeTierId(tier);
  if (id !== "free") {
    return MEMBERSHIP_TIERS.find((t) => t.id === id)?.name ?? id;
  }
  const raw = String(tier || "").trim();
  if (!raw) return "Unknown";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

/**
 * Billing Totals category key — Membership rows include level (`membership:pro`).
 * Other kinds stay as the bare kind id.
 */
export function billingCategoryKey(p: {
  kind?: string | null;
  tier?: string | null;
  label?: string | null;
}): string {
  const kind = String(p.kind || "other").toLowerCase();
  if (kind !== "membership") return kind;
  const level =
    membershipTierFromPurchase(p) ??
    (normalizeTierId(p.tier) !== "free" ? normalizeTierId(p.tier) : null);
  return level ? `membership:${level}` : "membership:unknown";
}

/** Label for Billing Totals Category column (e.g. "Membership · Pro"). */
export function billingCategoryLabel(key: string): string {
  const k = String(key || "");
  if (k.startsWith("membership:")) {
    const level = k.slice("membership:".length);
    return `Membership · ${membershipLevelDisplayName(level === "unknown" ? "" : level)}`;
  }
  return purchaseKindLabel(k);
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

/** Date only — for Billing/Access lists. */
export function formatPurchasePaidOn(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || "—";
  try {
    return d.toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function formatPurchaseDescription(
  p: Pick<MemberPurchase, "kind" | "label" | "amountCents">,
): string {
  const kind = String(p.kind || "").toLowerCase();
  if (kind === "credit_pack") {
    return formatCreditPackPurchaseLabel({
      label: p.label,
      kind: p.kind,
      amountCents: p.amountCents,
    });
  }
  if (kind === "alacarte") {
    return formatAlaCartePurchaseLabel({
      label: p.label,
      amountCents: p.amountCents,
    });
  }
  return stripStripeSessionId(p.label) || "—";
}

/** Kid Credits this checkout granted (packs / cart lines). 0 when the purchase did not buy credits. */
export function kidCreditsGrantedFromPurchase(
  p: Pick<MemberPurchase, "kind" | "label" | "amountCents">,
): number {
  return Math.max(
    0,
    Math.floor(
      kidCreditsFromPurchase({
        label: p.label,
        kind: p.kind,
        amountCents: p.amountCents,
      }),
    ),
  );
}

export function formatCreditsGranted(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  return `+${Math.floor(n)}`;
}

/**
 * Newest-first billing rows with Kid/adult credits granted and a running total of
 * credits given across purchases (oldest → newest, then reversed for display).
 */
export function attachPurchaseCreditRunningTotals(
  purchases: readonly MemberPurchase[],
): MemberPurchaseWithCredits[] {
  const chronological = [...purchases].sort((a, b) => {
    const byWhen = String(a.paidAt || "").localeCompare(String(b.paidAt || ""));
    if (byWhen !== 0) return byWhen;
    return String(a.id).localeCompare(String(b.id));
  });
  let kid = 0;
  const stamped = chronological.map((p) => {
    const kidCreditsGranted = kidCreditsGrantedFromPurchase(p);
    kid += kidCreditsGranted;
    return {
      ...p,
      kidCreditsGranted,
      adultCreditsGranted: 0,
      kidCreditsRunning: kid,
      adultCreditsRunning: 0,
    };
  });
  return stamped.reverse();
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
    const key = billingCategoryKey(p);
    const amt = Number.isFinite(p.amountUsd) ? p.amountUsd : Math.round(p.amountCents || 0) / 100;
    amountUsd += amt;
    if (!byKind[key]) byKind[key] = { count: 0, amountUsd: 0 };
    byKind[key]!.count += 1;
    byKind[key]!.amountUsd += amt;
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

export function membershipTierFromPurchase(p: {
  kind?: string | null;
  tier?: string | null;
  label?: string | null;
}): TierId | null {
  const kind = String(p.kind || "").toLowerCase();
  const fromTier = normalizeTierId(p.tier);
  if (kind === "membership" && fromTier !== "free") return fromTier;
  if (fromTier !== "free" && kind !== "alacarte" && kind !== "credit_pack") return fromTier;
  const label = String(p.label || "").toLowerCase();
  if (!label) return kind === "membership" && fromTier !== "free" ? fromTier : null;
  if (kind === "credit_pack" || kind === "alacarte") return null;
  if (/\belite\b/.test(label)) return "elite";
  if (/\bpro\b/.test(label)) return "pro";
  if (/\bstarter\b/.test(label)) return "starter";
  return null;
}

const TIER_RANK: Record<TierId, number> = { free: 0, starter: 1, pro: 2, elite: 3 };

export function highestPaidMembershipTier(
  purchases: readonly { kind?: string | null; tier?: string | null; label?: string | null }[],
): TierId {
  let best: TierId = "free";
  for (const p of purchases) {
    const t = membershipTierFromPurchase(p);
    if (t && TIER_RANK[t] > TIER_RANK[best]) best = t;
  }
  return best;
}

/** Account row wins if it is already higher; otherwise paid membership checkout wins. */
export function effectiveMembershipTier(
  accountTier: string | null | undefined,
  purchases: readonly { kind?: string | null; tier?: string | null; label?: string | null }[] = [],
): TierId {
  const account = normalizeTierId(accountTier);
  const paid = highestPaidMembershipTier(purchases);
  return TIER_RANK[paid] > TIER_RANK[account] ? paid : account;
}

export function buildMemberAccessSummary(input: {
  membershipTier: string | null | undefined;
  audience: string | null | undefined;
  purchases?: MemberPurchase[];
}): MemberAccessSummary {
  const purchases = Array.isArray(input.purchases) ? input.purchases : [];
  const membershipTier = effectiveMembershipTier(input.membershipTier, purchases);
  const audience = normalizeAudience(input.audience);
  const planLabel = MEMBERSHIP_TIERS.find((t) => t.id === membershipTier)?.name ?? "Free";
  const audienceLabel = AUDIENCE_LABELS[audience];
  const purchasedSessions = purchases
    .filter((p) => String(p.kind).toLowerCase() === "alacarte")
    .map((p) => ({
      id: p.id,
      label: formatPurchaseDescription(p),
      paidAt: p.paidAt,
    }));
  const creditPacks = purchases
    .filter((p) => String(p.kind).toLowerCase() === "credit_pack")
    .map((p) => ({
      id: p.id,
      label: formatPurchaseDescription(p),
      paidAt: p.paidAt,
    }));
  const membershipPaidAt =
    purchases
      .filter((p) => String(p.kind).toLowerCase() === "membership" && p.paidAt)
      .sort((a, b) => String(a.paidAt).localeCompare(String(b.paidAt)))[0]?.paidAt ?? null;
  return {
    membershipTier,
    audience,
    planLabel,
    audienceLabel,
    enrolledLabel: `${planLabel} · ${audienceLabel}`,
    membershipPaidAt,
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
