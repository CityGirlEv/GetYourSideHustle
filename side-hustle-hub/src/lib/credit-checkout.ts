/**
 * Kid Credit checkout — memberships, workshops, consulting, a-la-carte.
 * Credit packs are cash-only (credits cannot buy more credits).
 */
import {
  ALA_CARTE_PRICE_LIST,
  CREDIT_PACKS,
  MEMBERSHIP_TIERS,
  formatUsd,
  isCreditPackId,
  type AudienceGroup,
  type CreditPack,
  type TierId,
} from "./membership";
import { roundCreditAmount } from "./member-credits";

export type CreditQuote = {
  label: string;
  costCredits: number;
  balance: number;
  remainingAfter: number;
  shortfall: number;
  canAfford: boolean;
  suggestedPack: CreditPack | null;
};

export type CreditSpendMembership = {
  kind: "membership";
  tier: TierId;
  audience: AudienceGroup;
};

export type CreditSpendAlaCarte = {
  kind: "alacarte";
  itemId: string;
  quantity: number;
};

export type CreditSpendCart = {
  kind: "cart";
  items: Array<{ itemId: string; quantity: number }>;
};

export type CreditSpendRequest = CreditSpendMembership | CreditSpendAlaCarte | CreditSpendCart;

const TIERS = new Set<string>(["free", "starter", "pro", "elite"]);
const AUDIENCES = new Set<string>(["kids", "junior", "adult", "senior"]);

export function audiencePaysMembershipWithCredits(
  audience: string | null | undefined,
): boolean {
  const a = String(audience || "").toLowerCase();
  return a === "kids" || a === "junior" || a === "parent" || a === "teen" || a === "teens";
}

export function membershipPlanRequiresCreditCheckout(
  audience: string | null | undefined,
  tier: string | null | undefined,
): boolean {
  const t = String(tier || "free").toLowerCase();
  return audiencePaysMembershipWithCredits(audience) && t !== "free";
}

export function membershipCreditPrice(
  tierId: string | null | undefined,
  audience: string | null | undefined,
): number {
  if (!audiencePaysMembershipWithCredits(audience)) return 0;
  const id = String(tierId || "free").toLowerCase();
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === id);
  return Math.max(0, Math.round(Number(tier?.priceMonthlyUsd) || 0));
}

/** Charge the difference so upgrades aren't free and downgrades don't refund. */
export function membershipUpgradeCreditCost(
  fromTier: string | null | undefined,
  toTier: string | null | undefined,
  audience: string | null | undefined,
): number {
  const next = String(toTier || "free").toLowerCase();
  if (next === "free") return 0;
  return Math.max(
    0,
    membershipCreditPrice(next, audience) - membershipCreditPrice(fromTier, audience),
  );
}

export function alacarteCreditPrice(
  itemId: string | null | undefined,
  quantity = 1,
): number | null {
  const id = String(itemId || "").trim().toLowerCase();
  if (!id || isCreditPackId(id)) return null;
  const item = ALA_CARTE_PRICE_LIST.find((row) => row.id === id);
  if (!item || item.credits == null || item.credits <= 0) return null;
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  return item.credits * qty;
}

export function suggestedCreditPack(shortfall: number): CreditPack | null {
  const need = Math.max(0, Math.floor(shortfall));
  if (need <= 0) return null;
  const sorted = [...CREDIT_PACKS].sort((a, b) => a.credits - b.credits);
  return sorted.find((p) => p.credits >= need) ?? sorted[sorted.length - 1] ?? null;
}

export function quoteCreditPurchase(input: {
  label: string;
  costCredits: number;
  balance: number;
}): CreditQuote {
  const cost = Math.max(0, Math.floor(Number(input.costCredits) || 0));
  const balance = Math.max(0, Math.floor(Number(input.balance) || 0));
  const remainingAfter = balance - cost;
  const shortfall = Math.max(0, -remainingAfter);
  return {
    label: String(input.label || "Purchase").trim() || "Purchase",
    costCredits: cost,
    balance,
    remainingAfter: Math.max(0, remainingAfter),
    shortfall,
    canAfford: shortfall === 0 && cost >= 0,
    suggestedPack: suggestedCreditPack(shortfall),
  };
}

export function creditSpendableAlaCarte(audience?: string | null) {
  const lane = String(audience || "").toLowerCase();
  return ALA_CARTE_PRICE_LIST.filter((item) => {
    if (item.credits == null || item.credits <= 0) return false;
    if (!lane) return true;
    if (lane === "parent") return item.audiences.includes("kids");
    if (lane === "teen" || lane === "teens") return item.audiences.includes("junior");
    return item.audiences.includes(lane as AudienceGroup);
  });
}

export function cartCreditCost(
  items: readonly { itemId: string; quantity: number }[],
): { costCredits: number; spendable: Array<{ itemId: string; quantity: number; credits: number; label: string }>; skipped: string[] } {
  const spendable: Array<{ itemId: string; quantity: number; credits: number; label: string }> = [];
  const skipped: string[] = [];
  for (const raw of items) {
    const itemId = String(raw.itemId || "").trim().toLowerCase();
    const quantity = Math.max(1, Math.floor(Number(raw.quantity) || 1));
    if (!itemId) continue;
    if (isCreditPackId(itemId)) {
      skipped.push(itemId);
      continue;
    }
    const credits = alacarteCreditPrice(itemId, quantity);
    const catalog = ALA_CARTE_PRICE_LIST.find((row) => row.id === itemId);
    if (credits == null || !catalog) {
      skipped.push(itemId);
      continue;
    }
    spendable.push({ itemId, quantity, credits, label: catalog.name });
  }
  return {
    costCredits: spendable.reduce((sum, row) => sum + row.credits, 0),
    spendable,
    skipped,
  };
}

export function parseCreditSpendRequest(
  raw: unknown,
): { ok: true; request: CreditSpendRequest } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Checkout details are required." };
  const body = raw as Record<string, unknown>;
  const kind = String(body.kind || "").toLowerCase();

  if (kind === "membership") {
    const tier = String(body.tier || body.membershipTier || "").toLowerCase();
    const audience = String(body.audience || "").toLowerCase();
    if (!TIERS.has(tier)) return { ok: false, error: "Choose Free, Starter, Pro, or Elite." };
    if (!AUDIENCES.has(audience)) return { ok: false, error: "Choose Kids, Teens, Adults, or Seniors." };
    if (!membershipPlanRequiresCreditCheckout(audience, tier) && tier !== "free") {
      return { ok: false, error: "Adult and Senior paid plans use Stripe Checkout, not Kid Credits." };
    }
    return { ok: true, request: { kind: "membership", tier: tier as TierId, audience: audience as AudienceGroup } };
  }

  if (kind === "alacarte") {
    const itemId = String(body.itemId || "").trim().toLowerCase();
    const quantity = Math.max(1, Math.floor(Number(body.quantity) || 1));
    if (!itemId) return { ok: false, error: "Choose an a-la-carte item." };
    if (alacarteCreditPrice(itemId, quantity) == null) {
      return { ok: false, error: "That item cannot be purchased with Kid Credits." };
    }
    return { ok: true, request: { kind: "alacarte", itemId, quantity } };
  }

  if (kind === "cart") {
    const items = Array.isArray(body.items) ? body.items : [];
    const parsed = items
      .map((row) => {
        const rec = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        return {
          itemId: String(rec.itemId || "").trim().toLowerCase(),
          quantity: Math.max(1, Math.floor(Number(rec.quantity) || 1)),
        };
      })
      .filter((row) => row.itemId);
    const priced = cartCreditCost(parsed);
    if (!priced.spendable.length) {
      return { ok: false, error: "No cart items can be paid with Kid Credits. Buy credit packs with the card checkout." };
    }
    return { ok: true, request: { kind: "cart", items: priced.spendable.map((r) => ({ itemId: r.itemId, quantity: r.quantity })) } };
  }

  return { ok: false, error: "Choose a membership, a-la-carte item, or cart to pay with credits." };
}

/** 1 Kid Credit = $1 when paying for items or applying credits to a cash total. */
export const KID_CREDIT_USD_CENTS = 100;

export type MixedCartLine = {
  itemId: string;
  name: string;
  quantity: number;
  priceUsd: number;
  kind: "alacarte" | "credit_pack" | "membership";
  /** Kid Credits that fully cover this line. Credit packs are cash-only. */
  credits?: number | null;
};

export type MixedPayQuote = {
  subtotalUsd: number;
  packUsd: number;
  eligibleUsd: number;
  creditsAvailable: number;
  creditsMax: number;
  creditsApplied: number;
  creditValueUsd: number;
  cashDueUsd: number;
  cashDueCents: number;
  fullyCoveredByCredits: boolean;
};

export function usdToCents(amountUsd: number): number {
  return Math.max(0, Math.round(Number(amountUsd) * 100) || 0);
}

export function centsToUsd(cents: number): number {
  return Math.round(Math.max(0, Math.floor(Number(cents) || 0))) / 100;
}

export function clampCreditsToApply(requested: unknown, max: number): number {
  const maxN = Math.max(0, roundCreditAmount(Number(max) || 0));
  const n = roundCreditAmount(Number(requested) || 0);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(n, maxN);
}

/** Credits that can cover one cart line. Credit packs are 0 (cash only). */
export function lineCreditNeed(line: MixedCartLine): number {
  if (line.kind === "credit_pack") return 0;
  const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
  const creditCost = Number(line.credits);
  if (Number.isFinite(creditCost) && creditCost > 0) return creditCost * qty;
  const lineCents = usdToCents(line.priceUsd * qty);
  return Math.ceil(lineCents / KID_CREDIT_USD_CENTS);
}

/** Credits that actually reduce cash due (packs stay cash). */
export function creditsNeededForMixedCart(lines: readonly MixedCartLine[]): number {
  return (Array.isArray(lines) ? lines : []).reduce((sum, line) => sum + lineCreditNeed(line), 0);
}

export function sumCreditsByItem(byItem: Record<string, number> | null | undefined): number {
  if (!byItem) return 0;
  return Object.values(byItem).reduce((sum, n) => sum + Math.max(0, Math.floor(Number(n) || 0)), 0);
}

/** Clamp per-line apply qty so later lines cannot spend more than remaining balance. */
export function clampCreditsByItem(
  lines: readonly MixedCartLine[],
  balance: number,
  requested: Record<string, number> | null | undefined,
): Record<string, number> {
  let left = Math.max(0, roundCreditAmount(Number(balance) || 0));
  const next: Record<string, number> = {};
  for (const line of Array.isArray(lines) ? lines : []) {
    const need = lineCreditNeed(line);
    if (need <= 0 || !line.itemId) continue;
    const want = clampCreditsToApply(requested?.[line.itemId], Math.min(need, left));
    next[line.itemId] = want;
    left = roundCreditAmount(left - want);
  }
  return next;
}

export function maxCreditsForLine(
  lines: readonly MixedCartLine[],
  balance: number,
  requested: Record<string, number> | null | undefined,
  itemId: string,
): number {
  const id = String(itemId || "").trim();
  const line = (Array.isArray(lines) ? lines : []).find((row) => row.itemId === id);
  if (!line) return 0;
  const need = lineCreditNeed(line);
  const others = sumCreditsByItem(
    Object.fromEntries(Object.entries(requested || {}).filter(([key]) => key !== id)),
  );
  const left = Math.max(0, roundCreditAmount(Number(balance) || 0) - others);
  return Math.min(need, left);
}

/** Fill cart lines in order until `total` credits (or the balance) are used. */
export function creditsByItemFromTotal(
  lines: readonly MixedCartLine[],
  balance: number,
  total: unknown,
): Record<string, number> {
  const max = Math.min(
    Math.max(0, roundCreditAmount(Number(balance) || 0)),
    creditsNeededForMixedCart(lines),
  );
  let left = clampCreditsToApply(total, max);
  const next: Record<string, number> = {};
  for (const line of Array.isArray(lines) ? lines : []) {
    const need = lineCreditNeed(line);
    if (need <= 0 || !line.itemId) continue;
    const use = Math.min(need, left);
    next[line.itemId] = use;
    left = roundCreditAmount(left - use);
  }
  return next;
}

export function quoteMixedCartPayment(input: {
  lines: readonly MixedCartLine[];
  balance: number;
  creditsToApply?: unknown;
}): MixedPayQuote {
  const lines = Array.isArray(input.lines) ? input.lines : [];
  let subtotalCents = 0;
  let packCents = 0;
  for (const line of lines) {
    const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
    const lineCents = usdToCents(line.priceUsd * qty);
    subtotalCents += lineCents;
    if (line.kind === "credit_pack") packCents += lineCents;
  }
  const eligibleCents = Math.max(0, subtotalCents - packCents);
  const balance = Math.max(0, roundCreditAmount(Number(input.balance) || 0));
  const creditsMax = Math.min(balance, creditsNeededForMixedCart(lines));
  const creditsApplied = clampCreditsToApply(input.creditsToApply, creditsMax);

  let remainingCredits = creditsApplied;
  let discountCents = 0;
  for (const line of lines) {
    if (remainingCredits <= 0) break;
    if (line.kind === "credit_pack") continue;
    const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
    const lineCents = usdToCents(line.priceUsd * qty);
    const creditCost = Number(line.credits);
    if (Number.isFinite(creditCost) && creditCost > 0) {
      const maxC = creditCost * qty;
      const use = Math.min(remainingCredits, maxC);
      discountCents += Math.round((use / maxC) * lineCents);
      remainingCredits = roundCreditAmount(remainingCredits - use);
      continue;
    }
    const maxC = Math.ceil(lineCents / KID_CREDIT_USD_CENTS);
    const use = Math.min(remainingCredits, maxC);
    discountCents += Math.round(use * KID_CREDIT_USD_CENTS);
    remainingCredits = roundCreditAmount(remainingCredits - use);
  }
  discountCents = Math.min(discountCents, eligibleCents);
  const cashDueCents = Math.max(0, subtotalCents - discountCents);
  return {
    subtotalUsd: centsToUsd(subtotalCents),
    packUsd: centsToUsd(packCents),
    eligibleUsd: centsToUsd(eligibleCents),
    creditsAvailable: balance,
    creditsMax,
    creditsApplied,
    creditValueUsd: centsToUsd(discountCents),
    cashDueUsd: centsToUsd(cashDueCents),
    cashDueCents,
    fullyCoveredByCredits: cashDueCents === 0 && subtotalCents > 0,
  };
}

/** Adult/Senior membership first invoice: 1 Kid Credit = $1 off, capped at the charge. */
export function quoteMixedUsdPayment(input: {
  amountUsd: number;
  balance: number;
  creditsToApply?: unknown;
}): MixedPayQuote {
  const amountCents = usdToCents(input.amountUsd);
  const balance = Math.max(0, roundCreditAmount(Number(input.balance) || 0));
  const creditsMax = Math.min(balance, Math.ceil(amountCents / KID_CREDIT_USD_CENTS));
  const creditsApplied = clampCreditsToApply(input.creditsToApply, creditsMax);
  const discountCents = Math.min(amountCents, Math.round(creditsApplied * KID_CREDIT_USD_CENTS));
  const cashDueCents = Math.max(0, amountCents - discountCents);
  return {
    subtotalUsd: centsToUsd(amountCents),
    packUsd: 0,
    eligibleUsd: centsToUsd(amountCents),
    creditsAvailable: balance,
    creditsMax,
    creditsApplied,
    creditValueUsd: centsToUsd(discountCents),
    cashDueUsd: centsToUsd(cashDueCents),
    cashDueCents,
    fullyCoveredByCredits: cashDueCents === 0 && amountCents > 0,
  };
}

/** “Apply all” only when the slider is below the cart max — Pay is the checkout CTA. */
export function shouldShowApplyAllCredits(
  quote: Pick<MixedPayQuote, "creditsApplied" | "creditsMax">,
): boolean {
  const max = Math.max(0, Math.floor(Number(quote.creditsMax) || 0));
  const applied = Math.max(0, Math.floor(Number(quote.creditsApplied) || 0));
  return max > 0 && applied < max;
}

export function mixedCheckoutButtonLabel(quote: MixedPayQuote): string {
  if (quote.cashDueCents <= 0 && quote.creditsApplied > 0) {
    return `Pay ${quote.creditsApplied} credit${quote.creditsApplied === 1 ? "" : "s"}`;
  }
  if (quote.creditsApplied > 0) {
    return `Pay ${formatUsd(quote.cashDueUsd)} + ${quote.creditsApplied} credits`;
  }
  if (quote.cashDueCents <= 0) return "Checkout";
  return `Checkout ${formatUsd(quote.cashDueUsd)}`;
}

/** True when this charge can be paid with credits and the member should still see Stripe. */
export function offerStripeBesideCredits(
  quote: Pick<MixedPayQuote, "creditsMax" | "subtotalUsd">,
): boolean {
  return Math.floor(Number(quote.creditsMax) || 0) > 0 && Number(quote.subtotalUsd) > 0;
}

/** Full card price. Credits are not applied. */
export function payWithStripeButtonLabel(amountLabel: string): string {
  const label = String(amountLabel || "").trim();
  return label ? `Pay ${label} with Stripe` : "Pay with Stripe";
}

/** True when credits cover the whole charge — no Stripe redirect (credit packs never qualify). */
export function checkoutFullyPaidWithCredits(quote: Pick<MixedPayQuote, "cashDueCents" | "creditsApplied">): boolean {
  return Number(quote.cashDueCents) <= 0 && Number(quote.creditsApplied) > 0;
}

export type CreditApplyView =
  | "guest"
  | "loading"
  | "empty-cart"
  | "empty-balance"
  | "ineligible"
  | "ready";

/** Which credit-apply panel checkout should show — never treat “still loading” as 0 credits. */
export function creditApplyView(input: {
  signedIn: boolean;
  loading?: boolean;
  creditsAvailable: number;
  creditsMax: number;
  cartItemCount: number;
}): CreditApplyView {
  if (!input.signedIn) return "guest";
  if (input.loading) return "loading";
  const available = Math.max(0, Math.floor(Number(input.creditsAvailable) || 0));
  const max = Math.max(0, Math.floor(Number(input.creditsMax) || 0));
  const items = Math.max(0, Math.floor(Number(input.cartItemCount) || 0));
  if (items <= 0) return "empty-cart";
  if (available <= 0 && max <= 0) return "empty-balance";
  if (max <= 0) return "ineligible";
  return "ready";
}
