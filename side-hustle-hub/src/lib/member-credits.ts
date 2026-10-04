/**
 * Member Kid Credit helpers — display math + API client for My Dashboard.
 */
import { api } from "./api";
import { ledgerOccurredAt } from "./d1-sql";
import {
  AUDIENCE_LABELS,
  MEMBERSHIP_TIERS,
  type AudienceGroup,
  type TierId,
} from "./membership";

export { ledgerOccurredAt } from "./d1-sql";

export type MemberCreditLedgerEntry = {
  id: string;
  delta: number;
  reason: string;
  balanceAfter: number;
  createdAt: string;
  /** Purchase/payment time when the row is tied to a checkout; else createdAt. */
  occurredAt?: string;
};

export type MemberCreditTotals = {
  earned: number;
  spent: number;
  balance: number;
};

export type MemberCreditPackPurchase = {
  sessionId: string;
  label: string;
  credits: number;
  amountCents: number;
  paidAt: string;
};

export type MemberCreditsPayload = {
  balance: number;
  membershipTier: string;
  audience: string;
  monthlyAllowance?: number;
  totals?: MemberCreditTotals;
  creditPacks?: MemberCreditPackPurchase[];
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
  creditPacks: MemberCreditPackPurchase[];
  recent: MemberCreditLedgerEntry[];
  ratioLabel: string;
};

const TIER_IDS = new Set<string>(["free", "starter", "pro", "elite"]);
const AUDIENCES = new Set<string>(["kids", "junior", "adult", "senior"]);
const TIER_RANK: Record<TierId, number> = { free: 0, starter: 1, pro: 2, elite: 3 };

export function normalizeTierId(raw: string | null | undefined): TierId {
  const t = String(raw || "free").toLowerCase();
  return (TIER_IDS.has(t) ? t : "free") as TierId;
}

/** Highest paid plan among account / session / purchase sources. */
export function higherMembershipTier(
  ...rawTiers: Array<string | null | undefined>
): TierId {
  let best: TierId = "free";
  for (const raw of rawTiers) {
    const t = normalizeTierId(raw);
    if (TIER_RANK[t] > TIER_RANK[best]) best = t;
  }
  return best;
}

export function normalizeAudience(raw: string | null | undefined): AudienceGroup {
  const a = String(raw || "adult").toLowerCase();
  // Parent family accounts use the Kids credit pool.
  if (a === "parent") return "kids";
  // User-facing label is Teens; stored audience id remains "junior".
  if (a === "teen" || a === "teens") return "junior";
  return (AUDIENCES.has(a) ? a : "adult") as AudienceGroup;
}

/** Monthly credits included with a plan — same amount for every age. */
export function monthlyKidCreditAllowance(tierId: TierId, _audience?: AudienceGroup): number {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  return roundCreditAmount(tier?.creditsPerMonth ?? 0);
}

/** One decimal place so Starter can include 2.5 credits / month. */
export function roundCreditAmount(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}

function formatCreditNumber(n: number): string {
  const v = roundCreditAmount(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/** Spendable balance from the credit trail (earned − spent). Never negative. */
export function ledgerNetBalance(earned: number, spent: number): number {
  const got = Math.max(0, roundCreditAmount(Number(earned) || 0));
  const used = Math.max(0, roundCreditAmount(Number(spent) || 0));
  return Math.max(0, roundCreditAmount(got - used));
}

/** Checkout must use earned − spent, not a stale wallet cache that can read 0. */
export function spendableCreditBalance(payload: MemberCreditsPayload): number {
  return summarizeMemberCredits(payload).balance;
}

/** My Dashboard → Credits tab. */
export const CREDITS_DASHBOARD_HREF = "/my-dashboard#credits";

export function isCreditsDashboardHash(hash: string): boolean {
  return String(hash || "").replace(/^#/, "").toLowerCase() === "credits";
}

export function formatKidCreditBalance(balance: number): string {
  const n = Math.max(0, roundCreditAmount(Number.isFinite(balance) ? balance : 0));
  return `${formatCreditNumber(n)} credit${n === 1 ? "" : "s"}`;
}

/** Welcome-card copy for every member — loading, then the live wallet total. */
export function portalWelcomeCreditLabel(
  balance: number | null | undefined,
  loading: boolean,
): string {
  if (loading) return "Loading credits…";
  return formatKidCreditBalance(balance ?? 0);
}

/** Friendly Credits tab headline — always includes a number, including 0. */
export function creditsBalanceHeadline(balance: number): string {
  const n = Math.max(0, roundCreditAmount(Number.isFinite(balance) ? balance : 0));
  return `Your credit balance is ${formatCreditNumber(n)}`;
}

/** Zeroed summary when the wallet is empty or credits cannot load. */
export function emptyMemberCreditsSummary(opts?: {
  membershipTier?: string | null;
  audience?: string | null;
}): MemberCreditsSummary {
  const membershipTier = normalizeTierId(opts?.membershipTier);
  const audience = normalizeAudience(opts?.audience);
  return summarizeMemberCredits({
    balance: 0,
    membershipTier,
    audience,
    monthlyAllowance: monthlyKidCreditAllowance(membershipTier, audience),
    totals: { earned: 0, spent: 0, balance: 0 },
    creditPacks: [],
    recent: [],
  });
}

/**
 * Map API failures to Credits UI copy.
 * Auth/session errors return null so we show balance 0 instead of "Not authenticated."
 */
export function friendlyCreditsLoadError(err: unknown): string | null {
  const msg = err instanceof Error ? err.message : String(err || "");
  if (/not authenticated|session (invalid|expired)|unauthorized|401/i.test(msg)) {
    return null;
  }
  if (!msg.trim()) return "Could not load credits right now. Your credit balance is shown as 0.";
  return "Could not refresh credits right now. Your credit balance is shown as 0 until this reloads.";
}

export function formatCreditCount(balance: number): string {
  const n = roundCreditAmount(Number.isFinite(balance) ? balance : 0);
  const abs = Math.abs(n);
  return `${formatCreditNumber(n)} credit${abs === 1 ? "" : "s"}`;
}

export function formatAdultCreditBalance(balance: number): string {
  const n = Number.isFinite(balance) ? Math.max(0, Math.floor(balance)) : 0;
  return `${n} Adult Credit${n === 1 ? "" : "s"}`;
}

export function creditRatioLabel(): string {
  return "1 credit = $1 — same for every age";
}

export function formatLedgerDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export function ledgerWhenIso(entry: Pick<MemberCreditLedgerEntry, "occurredAt" | "createdAt">): string {
  return String(entry.occurredAt || entry.createdAt || "");
}

export function compareLedgerNewestFirst(
  a: Pick<MemberCreditLedgerEntry, "id" | "occurredAt" | "createdAt">,
  b: Pick<MemberCreditLedgerEntry, "id" | "occurredAt" | "createdAt">,
): number {
  const byWhen = ledgerWhenIso(b).localeCompare(ledgerWhenIso(a));
  if (byWhen !== 0) return byWhen;
  return String(b.id).localeCompare(String(a.id));
}

/**
 * Rebuild running totals from credit line items (oldest → newest).
 * `currentBalance` must be the spendable total the card shows (earned − spent).
 * When that is behind the visible lines, start at 0 so every grant still adds.
 */
export function attachLedgerRunningBalances(
  entries: readonly MemberCreditLedgerEntry[],
  currentBalance: number,
): MemberCreditLedgerEntry[] {
  const newestFirst = [...entries].sort(compareLedgerNewestFirst);
  const chronological = [...newestFirst].reverse();
  const deltaSum = chronological.reduce((n, e) => n + Math.trunc(Number(e.delta) || 0), 0);
  const live = Math.max(0, Math.floor(Number(currentBalance) || 0));
  const impliedOpening = live - deltaSum;
  let running = impliedOpening > 0 ? impliedOpening : 0;
  const stamped = chronological.map((entry) => {
    const delta = Math.trunc(Number(entry.delta) || 0);
    running += delta;
    return {
      ...entry,
      delta,
      balanceAfter: running,
    };
  });
  return stamped.reverse();
}

/** Ledger timestamp — date first so rows scan chronologically. */
export function formatLedgerWhen(iso: string | null | undefined): string {
  const raw = String(iso || "").trim();
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return raw;
  }
}

export function enrolledPlanLabel(tierId: TierId, audience: AudienceGroup): string {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  const plan = tier?.name ?? "Free";
  const lane = AUDIENCE_LABELS[audience] ?? audience;
  return `${plan} · ${lane}`;
}

export function summarizeMemberCredits(payload: MemberCreditsPayload): MemberCreditsSummary {
  const walletBalance = Number.isFinite(payload.balance)
    ? Math.max(0, roundCreditAmount(payload.balance))
    : 0;
  const membershipTier = normalizeTierId(payload.membershipTier);
  const audience = normalizeAudience(payload.audience);
  const monthlyAllowance =
    typeof payload.monthlyAllowance === "number"
      ? Math.max(0, roundCreditAmount(payload.monthlyAllowance))
      : monthlyKidCreditAllowance(membershipTier, audience);
  const totalsRaw = payload.totals;
  const earned = Math.max(0, roundCreditAmount(Number(totalsRaw?.earned) || 0));
  const spent = Math.max(0, roundCreditAmount(Number(totalsRaw?.spent) || 0));
  // Wallet and ledger can drift. Show whichever is higher so a grant on the
  // user list is the same number on the member Credits page.
  const fromLedger = totalsRaw ? ledgerNetBalance(earned, spent) : 0;
  const balance = Math.max(walletBalance, fromLedger);
  const totals: MemberCreditTotals = {
    earned,
    spent,
    balance,
  };
  const planLabel = MEMBERSHIP_TIERS.find((t) => t.id === membershipTier)?.name ?? "Free";
  const creditPacks = Array.isArray(payload.creditPacks) ? payload.creditPacks : [];
  const dated = (Array.isArray(payload.recent) ? payload.recent : []).map((entry) => {
    const occurredAt = ledgerOccurredAt(entry, creditPacks);
    return { ...entry, occurredAt };
  });
  const recent = attachLedgerRunningBalances(dated, balance);
  return {
    balance,
    adultEquivalent: balance,
    membershipTier,
    audience,
    audienceLabel: AUDIENCE_LABELS[audience],
    planLabel,
    enrolledLabel: enrolledPlanLabel(membershipTier, audience),
    monthlyAllowance,
    totals,
    creditPacks,
    recent,
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
