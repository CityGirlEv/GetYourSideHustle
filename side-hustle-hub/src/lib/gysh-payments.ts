/** Client helpers for Financials → Payments reports. */
import { api } from "./api";
import {
  billingCategoryKey,
  billingCategoryLabel,
} from "./member-purchases";
import type { PaymentPeriodPreset, PaymentPeriodRange } from "./payment-periods";

export type GyshPayment = {
  id: string;
  sessionId: string;
  paymentIntentId: string;
  email: string;
  memberName?: string;
  userId: string | null;
  kind: string;
  tier: string;
  audience: string;
  interval: string;
  label: string;
  amountCents: number;
  currency: string;
  paidAt: string;
  source: string;
  refundCents?: number;
  refundedAt?: string | null;
  refundSource?: "stripe" | "manual" | "";
  refundNote?: string;
  adminEdited?: boolean;
};

export const PAYMENT_KIND_OPTIONS = [
  { id: "membership", label: "Memberships" },
  { id: "alacarte", label: "A-la-carte" },
  { id: "credit_pack", label: "Credit packs" },
] as const;

export type PaymentRowPatchInput = {
  memberName?: string;
  email?: string;
  label?: string;
  kind?: string;
  amountUsd?: string | number;
  refundUsd?: string | number;
  paidAt?: string;
  refundNote?: string;
};

export type ParsedPaymentRow = {
  memberName: string;
  email: string;
  label: string;
  kind: string;
  amountCents: number;
  refundCents: number;
  paidAt: string;
  refundNote: string;
};

export type PaymentsReport = {
  ok: boolean;
  period: PaymentPeriodRange;
  totals: {
    count: number;
    amountCents: number;
    amountUsd: number;
    refundCents: number;
    refundUsd: number;
    netCents: number;
    netUsd: number;
    byKind: Record<string, { count: number; amountCents: number; amountUsd: number }>;
  };
  payments: GyshPayment[];
  stripeError?: string | null;
  mode?: "test" | "live";
};

export const PAYMENT_KIND_FILTERS = [
  { id: "all", label: "All kinds" },
  { id: "membership", label: "Memberships" },
  { id: "alacarte", label: "A-la-carte" },
  { id: "credit_pack", label: "Credit packs" },
] as const;

export type PaymentKindFilterId = (typeof PAYMENT_KIND_FILTERS)[number]["id"];

export const PAYMENT_REFUND_FILTERS = [
  { id: "all", label: "All payments" },
  { id: "refunded", label: "Refunded" },
  { id: "not_refunded", label: "Not refunded" },
] as const;

export type PaymentRefundFilterId = (typeof PAYMENT_REFUND_FILTERS)[number]["id"];

export function refundStatusFromCents(
  amountCents: number,
  refundCents: number,
): "none" | "partial" | "full" {
  const paid = Math.max(0, Math.round(Number(amountCents) || 0));
  const refunded = Math.max(0, Math.round(Number(refundCents) || 0));
  if (refunded <= 0) return "none";
  if (refunded >= paid) return "full";
  return "partial";
}

export function netPaymentCents(amountCents: number, refundCents: number): number {
  return Math.max(0, Math.round(Number(amountCents) || 0) - Math.max(0, Math.round(Number(refundCents) || 0)));
}

export function parseRefundUsdInput(
  raw: string,
  amountCents: number,
  alreadyRefundedCents = 0,
): { ok: true; cents: number } | { ok: false; error: string } {
  const paid = Math.max(0, Math.round(Number(amountCents) || 0));
  const already = Math.max(0, Math.round(Number(alreadyRefundedCents) || 0));
  const remaining = Math.max(0, paid - already);
  if (remaining <= 0) return { ok: false, error: "This payment is already fully refunded." };
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return { ok: true, cents: remaining };
  const dollars = Number(trimmed.replace(/[$,]/g, ""));
  if (!Number.isFinite(dollars) || dollars <= 0) {
    return { ok: false, error: "Enter a refund amount greater than 0." };
  }
  const cents = Math.round(dollars * 100);
  if (cents > remaining) {
    return { ok: false, error: "Refund cannot exceed the remaining paid amount." };
  }
  return { ok: true, cents };
}

export function refundCentsByPaymentIntent(
  refunds: readonly { payment_intent?: string | null; amount?: number; status?: string }[],
): Record<string, number> {
  const byPi: Record<string, number> = {};
  for (const r of refunds) {
    const status = String(r.status || "succeeded").toLowerCase();
    if (status && status !== "succeeded") continue;
    const pi = String(r.payment_intent || "").trim();
    if (!pi) continue;
    byPi[pi] = (byPi[pi] || 0) + Math.max(0, Math.round(Number(r.amount) || 0));
  }
  return byPi;
}

export function applyRefundCents<T extends { paymentIntentId?: string | null; refundCents?: number }>(
  payments: T[],
  byPaymentIntent: Record<string, number>,
): T[] {
  return payments.map((p) => {
    const pi = String(p.paymentIntentId || "").trim();
    const fromStripe = pi ? byPaymentIntent[pi] || 0 : 0;
    const current = Math.max(0, Math.round(Number(p.refundCents) || 0));
    return { ...p, refundCents: Math.max(current, fromStripe) };
  });
}

export function centsToUsdInput(cents: number): string {
  return (Math.max(0, Math.round(Number(cents) || 0)) / 100).toFixed(2);
}

export function parseUsdToCents(
  raw: string | number | null | undefined,
): { ok: true; cents: number } | { ok: false; error: string } {
  if (raw === "" || raw == null) return { ok: true, cents: 0 };
  const dollars = typeof raw === "number" ? raw : Number(String(raw).replace(/[$,]/g, "").trim());
  if (!Number.isFinite(dollars) || dollars < 0) {
    return { ok: false, error: "Enter a dollar amount of 0 or more." };
  }
  return { ok: true, cents: Math.round(dollars * 100) };
}

export function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function datetimeLocalToIso(value: string, fallbackIso: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return fallbackIso;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return fallbackIso;
  return d.toISOString();
}

const KIND_IDS = new Set<string>(PAYMENT_KIND_OPTIONS.map((k) => k.id));

export function parsePaymentRowPatch(
  raw: PaymentRowPatchInput,
  current: { amountCents: number; refundCents?: number; paidAt: string },
): { ok: true; values: ParsedPaymentRow } | { ok: false; error: string } {
  const memberName = String(raw.memberName ?? "").trim().slice(0, 120);
  const email = String(raw.email ?? "").trim().toLowerCase();
  if (email && !email.includes("@")) {
    return { ok: false, error: "Enter a valid email, or leave it blank." };
  }
  const label = String(raw.label ?? "").trim().slice(0, 200) || "Payment";
  const kind = String(raw.kind ?? "").trim().toLowerCase();
  if (!KIND_IDS.has(kind)) {
    return { ok: false, error: "Kind must be membership, a-la-carte, or credit pack." };
  }
  const amount = parseUsdToCents(raw.amountUsd);
  if (!amount.ok) return amount;
  const refund = parseUsdToCents(raw.refundUsd);
  if (!refund.ok) return refund;
  if (refund.cents > amount.cents) {
    return { ok: false, error: "Refund cannot exceed the paid amount." };
  }
  const paidAt = datetimeLocalToIso(String(raw.paidAt ?? ""), current.paidAt);
  return {
    ok: true,
    values: {
      memberName,
      email,
      label,
      kind,
      amountCents: amount.cents,
      refundCents: refund.cents,
      paidAt,
      refundNote: String(raw.refundNote ?? "").trim().slice(0, 200),
    },
  };
}

export function mergeListedPayment<
  T extends {
    paymentIntentId?: string;
    memberName?: string;
    email?: string;
    refundCents?: number;
    refundNote?: string;
    refundSource?: string;
    adminEdited?: boolean;
  },
>(d1: T | undefined, stripe: T | undefined): T | undefined {
  if (!d1) return stripe;
  if (!stripe) return d1;
  const stripeRefund = Math.max(0, Math.round(Number(stripe.refundCents) || 0));
  const d1Refund = Math.max(0, Math.round(Number(d1.refundCents) || 0));
  if (d1.adminEdited) {
    return {
      ...d1,
      paymentIntentId: stripe.paymentIntentId || d1.paymentIntentId,
      refundCents: Math.max(d1Refund, stripeRefund),
      refundSource: stripeRefund > d1Refund ? "stripe" : d1.refundSource,
    };
  }
  return {
    ...stripe,
    memberName: stripe.memberName || d1.memberName,
    email: stripe.email || d1.email,
    refundCents: Math.max(d1Refund, stripeRefund),
    refundNote: d1.refundNote || stripe.refundNote,
    refundSource: stripeRefund > 0 ? "stripe" : d1.refundSource,
  };
}

export function paymentKindLabel(kind: string): string {
  const k = String(kind || "").toLowerCase();
  if (k.startsWith("membership:")) return billingCategoryLabel(k);
  if (k === "membership") return "Memberships";
  if (k === "alacarte") return "A-la-carte";
  if (k === "credit_pack") return "Credit packs";
  return kind || "Other";
}

/** Totals Category label — Membership includes level (Membership · Pro). */
export function paymentTotalsCategoryLabel(key: string): string {
  return billingCategoryLabel(key);
}

export function paymentMemberDisplayName(payment: {
  memberName?: string | null;
  email?: string | null;
}): string {
  const name = String(payment.memberName || "").trim();
  if (name) return name;
  return "—";
}

export function filterGyshPayments<
  T extends {
    kind: string;
    email?: string | null;
    label?: string | null;
    sessionId?: string | null;
    memberName?: string | null;
    amountCents?: number;
    refundCents?: number;
  },
>(payments: readonly T[], opts: { kind?: string; query?: string; refund?: string }): T[] {
  const kind = String(opts.kind || "all").toLowerCase();
  const refund = String(opts.refund || "all").toLowerCase();
  const q = String(opts.query || "")
    .trim()
    .toLowerCase();
  return payments.filter((p) => {
    if (kind !== "all" && String(p.kind || "").toLowerCase() !== kind) return false;
    const status = refundStatusFromCents(Number(p.amountCents) || 0, Number(p.refundCents) || 0);
    if (refund === "refunded" && status === "none") return false;
    if (refund === "not_refunded" && status !== "none") return false;
    if (!q) return true;
    const hay = [p.memberName, p.email, p.label, p.kind, p.sessionId]
      .map((v) => String(v || "").toLowerCase())
      .join(" ");
    return hay.includes(q);
  });
}

export function summarizeGyshPayments(
  payments: readonly {
    kind: string;
    amountCents: number;
    refundCents?: number;
    tier?: string | null;
    label?: string | null;
  }[],
): PaymentsReport["totals"] {
  const byKind: Record<string, { count: number; amountCents: number }> = {};
  let amountCents = 0;
  let refundCents = 0;
  for (const p of payments) {
    const paid = Number(p.amountCents) || 0;
    const refunded = Number(p.refundCents) || 0;
    amountCents += paid;
    refundCents += refunded;
    const key = billingCategoryKey(p);
    const bucket = byKind[key] || { count: 0, amountCents: 0 };
    bucket.count += 1;
    bucket.amountCents += paid;
    byKind[key] = bucket;
  }
  const netCents = netPaymentCents(amountCents, refundCents);
  return {
    count: payments.length,
    amountCents,
    amountUsd: Math.round(amountCents) / 100,
    refundCents,
    refundUsd: Math.round(refundCents) / 100,
    netCents,
    netUsd: Math.round(netCents) / 100,
    byKind: Object.fromEntries(
      Object.entries(byKind).map(([k, v]) => [
        k,
        { count: v.count, amountCents: v.amountCents, amountUsd: Math.round(v.amountCents) / 100 },
      ]),
    ),
  };
}

export async function fetchPaymentsReport(input: {
  period: PaymentPeriodPreset;
  from?: string;
  to?: string;
}): Promise<PaymentsReport> {
  const params = new URLSearchParams();
  params.set("period", input.period);
  if (input.from) params.set("from", input.from);
  if (input.to) params.set("to", input.to);
  return api<PaymentsReport>(`financials/payments?${params.toString()}`, {
    method: "GET",
    timeoutMs: 60_000,
  });
}

export async function deletePayment(id: string): Promise<void> {
  const key = String(id || "").trim();
  if (!key) throw new Error("Payment id is required.");
  await api(`financials/payments/${encodeURIComponent(key)}`, { method: "DELETE" });
}

export async function deletePayments(ids: string[]): Promise<{ deleted: number }> {
  const list = ids.map((id) => String(id || "").trim()).filter(Boolean);
  if (!list.length) throw new Error("Select at least one payment to delete.");
  return api<{ ok: boolean; deleted: number }>("financials/payments/delete", {
    method: "POST",
    body: { ids: list },
  });
}

export async function recordPaymentRefund(input: {
  id?: string;
  sessionId?: string;
  amountUsd?: string;
  note?: string;
}): Promise<{ ok: boolean; payment: GyshPayment }> {
  return api<{ ok: boolean; payment: GyshPayment }>("financials/payments/refund", {
    method: "POST",
    body: input,
  });
}

export async function updatePayment(id: string, patch: PaymentRowPatchInput): Promise<GyshPayment> {
  const key = String(id || "").trim();
  if (!key) throw new Error("Payment id is required.");
  const res = await api<{ ok: boolean; payment: GyshPayment }>(
    `financials/payments/${encodeURIComponent(key)}`,
    { method: "PUT", body: patch },
  );
  return res.payment;
}
