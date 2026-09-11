import { ALA_CARTE_PRICE_LIST, CREDIT_PACKS, MEMBERSHIP_TIERS, creditPackById, isCreditPackId, type CreditPack } from "./membership";

export type CreditPackLineDetail = {
  id: string;
  name: string;
  quantity: number;
  credits: number;
  priceUsd: number;
  detail: string;
};

/** Hide Stripe Checkout ids from member-facing copy (they overflow the ledger). */
export function stripStripeSessionId(text: string | null | undefined): string {
  return String(text || "")
    .replace(/\bpack:cs_[A-Za-z0-9]+\b/gi, "")
    .replace(/\bcs_[A-Za-z0-9]+\b/g, "")
    .replace(/\s*·\s*(?:·\s*)+/g, " · ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[·\s]+|[·\s]+$/g, "")
    .trim();
}

export function parseCartItemLines(
  itemMeta: string | null | undefined,
): Array<{ itemId: string; quantity: number }> {
  return String(itemMeta || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const m = /^([a-z0-9-]+)x(\d+)$/i.exec(part);
      if (m) {
        return { itemId: m[1]!.toLowerCase(), quantity: Math.max(1, Number(m[2]) || 1) };
      }
      return { itemId: part.toLowerCase(), quantity: 1 };
    });
}

/** Pull `boostx1` (etc.) out of a Financials payment label. */
export function itemMetaFromPaymentLabel(label: string | null | undefined): string {
  const raw = String(label || "").trim();
  const pack = /^credit pack · (.+)$/i.exec(raw);
  if (pack) return pack[1]!.trim();
  const ala = /^a-la-carte · (.+)$/i.exec(raw);
  if (ala) return ala[1]!.trim();
  return raw;
}

export function kidCreditsFromCartItemMeta(itemMeta: string | null | undefined): number {
  let total = 0;
  for (const line of parseCartItemLines(itemMeta)) {
    const pack = creditPackFromToken(line.itemId) ?? creditPackById(line.itemId);
    if (pack) total += pack.credits * line.quantity;
  }
  return total;
}

function creditPackFromToken(raw: string | null | undefined) {
  const token = String(raw || "")
    .trim()
    .toLowerCase();
  if (!token) return undefined;
  return (
    creditPackById(token) ||
    CREDIT_PACKS.find(
      (p) =>
        p.name.toLowerCase() === token ||
        token.startsWith(`${p.id}x`) ||
        token.startsWith(p.name.toLowerCase()),
    )
  );
}

function toPackLine(pack: CreditPack, quantity: number): CreditPackLineDetail {
  const q = Math.max(1, Math.floor(quantity) || 1);
  return {
    id: pack.id,
    name: pack.name,
    quantity: q,
    credits: pack.credits * q,
    priceUsd: pack.priceUsd * q,
    detail: pack.detail,
  };
}

function packFromCreditCount(credits: number): { pack: CreditPack; quantity: number } | undefined {
  const n = Math.round(credits);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  const exact = CREDIT_PACKS.find((p) => p.credits === n);
  if (exact) return { pack: exact, quantity: 1 };
  for (const pack of [...CREDIT_PACKS].sort((a, b) => b.credits - a.credits)) {
    if (n % pack.credits === 0) return { pack, quantity: n / pack.credits };
  }
  return undefined;
}

function creditsFromLabel(text: string | null | undefined): number {
  const m = /(\d+)\s*(?:Kid\s+)?Credits?/i.exec(String(text || ""));
  return m ? Number(m[1]) : 0;
}

export function creditPackLinesFromPurchase(input: {
  itemMeta?: string | null;
  label?: string | null;
  kind?: string | null;
  amountCents?: number | null;
  credits?: number | null;
}): CreditPackLineDetail[] {
  const cleanedLabel = stripStripeSessionId(input.label);
  const itemMeta = String(input.itemMeta || "").trim() || itemMetaFromPaymentLabel(cleanedLabel);
  const lines: CreditPackLineDetail[] = [];
  for (const line of parseCartItemLines(itemMeta)) {
    const pack = creditPackFromToken(line.itemId) ?? creditPackById(line.itemId);
    if (pack) lines.push(toPackLine(pack, line.quantity));
  }
  if (lines.length) return lines;

  const named = creditPackFromToken(cleanedLabel);
  if (named) return [toPackLine(named, 1)];

  const cents = Math.round(Number(input.amountCents) || 0);
  if (cents > 0) {
    const pack = CREDIT_PACKS.find((p) => Math.round(p.priceUsd * 100) === cents);
    if (pack) return [toPackLine(pack, 1)];
  }

  const credits =
    Number(input.credits) > 0 ? Math.round(Number(input.credits)) : creditsFromLabel(cleanedLabel);
  const inferred = packFromCreditCount(credits);
  if (inferred) return [toPackLine(inferred.pack, inferred.quantity)];
  return [];
}

export function formatCreditPackPurchaseLabel(input: {
  itemMeta?: string | null;
  label?: string | null;
  kind?: string | null;
  amountCents?: number | null;
  credits?: number | null;
}): string {
  const lines = creditPackLinesFromPurchase(input);
  if (!lines.length) {
    const cleaned = stripStripeSessionId(input.label);
    if (cleaned && !/^credit pack$/i.test(cleaned)) return cleaned;
    return "Credit pack";
  }
  return lines
    .map((line) => {
      const qty = line.quantity > 1 ? ` ×${line.quantity}` : "";
      return `${line.name}${qty} - ${line.credits} credits`;
    })
    .join("; ");
}

function alacarteItemFromToken(raw: string | null | undefined) {
  const token = String(raw || "")
    .trim()
    .toLowerCase();
  if (!token || isCreditPackId(token)) return undefined;
  return (
    ALA_CARTE_PRICE_LIST.find((row) => row.id === token) ||
    ALA_CARTE_PRICE_LIST.find(
      (row) =>
        row.name.toLowerCase() === token ||
        token.startsWith(row.id) ||
        row.name.toLowerCase().startsWith(token),
    )
  );
}

/** Human name for an a-la-carte checkout (not SKU like progress-pdfx1). */
export function formatAlaCartePurchaseLabel(input: {
  itemMeta?: string | null;
  label?: string | null;
  amountCents?: number | null;
}): string {
  const cleaned = stripStripeSessionId(input.label);
  const itemMeta = String(input.itemMeta || "").trim() || itemMetaFromPaymentLabel(cleaned);
  const names: string[] = [];
  for (const line of parseCartItemLines(itemMeta)) {
    const item = alacarteItemFromToken(line.itemId);
    if (!item) continue;
    const qty = line.quantity > 1 ? ` ×${line.quantity}` : "";
    names.push(`${item.name}${qty}`);
  }
  if (names.length) return names.join("; ");
  const cents = Math.round(Number(input.amountCents) || 0);
  if (cents > 0) {
    const byPrice = ALA_CARTE_PRICE_LIST.find((row) => Math.round(row.priceUsd * 100) === cents);
    if (byPrice) return byPrice.name;
  }
  if (cleaned && !/^a-la-carte$/i.test(cleaned)) {
    const withoutKind = cleaned.replace(/^a-la-carte\s*·\s*/i, "").trim();
    return withoutKind || cleaned;
  }
  return "A-la-carte";
}

/** Member-facing ledger copy: pack or membership credit line, no Stripe session ids. */
export function formatLedgerReason(reason: string | null | undefined): string {
  const raw = String(reason || "").trim();
  if (!raw) return "—";
  const cleaned = stripStripeSessionId(raw);
  const planGrant = /^Membership plan credits:\s*(.+)$/i.exec(cleaned);
  if (planGrant) {
    const token = planGrant[1]!.trim();
    const tier = MEMBERSHIP_TIERS.find(
      (t) => t.id === token.toLowerCase() || t.name.toLowerCase() === token.toLowerCase(),
    );
    const plan = tier?.name ?? token.charAt(0).toUpperCase() + token.slice(1);
    return `${plan} membership credits`;
  }
  const looksLikePack =
    /credit pack/i.test(raw) ||
    creditPackLinesFromPurchase({ label: cleaned, kind: "credit_pack" }).length > 0;
  if (looksLikePack) {
    return formatCreditPackPurchaseLabel({
      label: cleaned,
      kind: "credit_pack",
      credits: creditsFromLabel(cleaned),
    });
  }
  return cleaned || "—";
}

/** Credits to grant for a paid row — cart meta, label, or credit-pack price fallback. */
export function kidCreditsFromPurchase(input: {
  itemMeta?: string | null;
  label?: string | null;
  kind?: string | null;
  amountCents?: number | null;
}): number {
  const fromMeta = kidCreditsFromCartItemMeta(
    String(input.itemMeta || "").trim() || itemMetaFromPaymentLabel(input.label),
  );
  if (fromMeta > 0) return fromMeta;
  const fromLabel = creditPackFromToken(itemMetaFromPaymentLabel(input.label));
  if (fromLabel) return fromLabel.credits;
  if (String(input.kind || "").toLowerCase() !== "credit_pack") return 0;
  const cents = Math.round(Number(input.amountCents) || 0);
  const pack = CREDIT_PACKS.find((p) => Math.round(p.priceUsd * 100) === cents);
  return pack?.credits ?? 0;
}

export function purchaseAuditAction(kind: string | null | undefined): string {
  const k = String(kind || "").toLowerCase();
  if (k === "credit_pack") return "purchase_credit_pack";
  if (k === "alacarte") return "purchase_alacarte";
  if (k === "membership") return "purchase_membership";
  return "purchase";
}

export function formatUsdFromCents(amountCents: number): string {
  const n = Number(amountCents) || 0;
  return `$${(n / 100).toFixed(2)}`;
}

export function purchaseAuditDetail(input: {
  kind?: string | null;
  label?: string | null;
  itemMeta?: string | null;
  amountCents?: number;
  sessionId?: string | null;
}): string {
  const itemMeta = String(input.itemMeta || "").trim() || itemMetaFromPaymentLabel(input.label);
  const credits = kidCreditsFromCartItemMeta(itemMeta);
  const amount =
    input.amountCents != null && Number.isFinite(Number(input.amountCents))
      ? formatUsdFromCents(Number(input.amountCents))
      : "";
  const label = String(input.label || "").trim() || itemMeta || "Purchase";
  const parts = [label, amount];
  if (credits > 0) parts.push(`${credits} Kid Credits`);
  const sessionId = String(input.sessionId || "").trim();
  if (sessionId) parts.push(sessionId);
  return parts.filter(Boolean).join(" · ");
}

export type PurchaseAuditSeed = {
  paidAt: string;
  email: string;
  kind: string;
  label?: string;
  amountCents?: number;
  sessionId?: string;
};

export function auditEventsFromPayments(
  payments: readonly PurchaseAuditSeed[],
): Array<{ at: string; action: string; email: string; detail: string }> {
  return payments.map((p) => ({
    at: p.paidAt,
    action: purchaseAuditAction(p.kind),
    email: String(p.email || "").trim().toLowerCase(),
    detail: purchaseAuditDetail(p),
  }));
}

export function stripeSessionIdFromDetail(detail: string | null | undefined): string | null {
  const m = /\b(cs_[A-Za-z0-9]+)\b/.exec(String(detail || ""));
  return m?.[1] ?? null;
}

export function mergeAuditEventsWithPurchases<
  T extends { at: string; action: string; email: string; detail: string },
>(events: readonly T[], purchaseEvents: readonly T[]): T[] {
  const coveredSessions = new Set<string>();
  for (const p of purchaseEvents) {
    const sid = stripeSessionIdFromDetail(p.detail);
    if (sid) coveredSessions.add(sid);
  }
  const kept = events.filter((e) => {
    if (e.action !== "stripe_checkout_paid") return true;
    const sid = stripeSessionIdFromDetail(e.detail);
    return !sid || !coveredSessions.has(sid);
  });
  const seen = new Set<string>();
  const out: T[] = [];
  for (const e of [...kept, ...purchaseEvents]) {
    const key = `${e.at}|${e.action}|${e.email}|${e.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
}
