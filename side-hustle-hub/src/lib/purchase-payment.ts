/** How a GYSH purchase was paid — used on admin/member receipts. */

export type PurchasePaymentSource = "stripe" | "credits" | "mixed" | "profile";

function formatUsdFromCents(amountCents: number): string {
  const n = Math.max(0, Number(amountCents) || 0) / 100;
  if (Number.isInteger(n)) return `$${n.toLocaleString("en-US")}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function resolvePurchasePaymentSource(input: {
  source?: string | null;
  amountCents?: number;
  creditsApplied?: number;
}): PurchasePaymentSource {
  const credits = Math.max(0, Math.floor(Number(input.creditsApplied) || 0));
  const cash = Math.max(0, Math.floor(Number(input.amountCents) || 0));
  const raw = String(input.source || "").toLowerCase();
  if (raw === "profile") return "profile";
  if (credits > 0 && cash > 0) return "mixed";
  if (raw === "credits" || (credits > 0 && cash === 0)) return "credits";
  if (raw === "mixed") return "mixed";
  return "stripe";
}

export function purchasePaymentMethodLabel(source: PurchasePaymentSource): string {
  if (source === "credits") return "GYSH credits (Stripe was not used)";
  if (source === "mixed") return "Mixed — Stripe Checkout + GYSH credits";
  if (source === "profile") return "Profile plan update (no card charge)";
  return "Stripe Checkout";
}

export function formatPurchasePaymentAmountLabel(input: {
  amountCents?: number;
  creditsApplied?: number;
}): string {
  const credits = Math.max(0, Math.floor(Number(input.creditsApplied) || 0));
  const cash = Math.max(0, Math.floor(Number(input.amountCents) || 0));
  const creditLabel = `${credits} credit${credits === 1 ? "" : "s"}`;
  if (credits > 0 && cash === 0) return creditLabel;
  if (credits > 0 && cash > 0) return `${formatUsdFromCents(cash)} + ${creditLabel}`;
  return formatUsdFromCents(cash);
}

export function formatPurchasePaymentDetail(input: {
  source?: string | null;
  amountCents?: number;
  creditsApplied?: number;
  sessionId?: string | null;
}): {
  source: PurchasePaymentSource;
  methodLabel: string;
  amountLabel: string;
  cashLabel: string;
  html: string;
} {
  const source = resolvePurchasePaymentSource(input);
  const methodLabel = purchasePaymentMethodLabel(source);
  const amountLabel = formatPurchasePaymentAmountLabel(input);
  const credits = Math.max(0, Math.floor(Number(input.creditsApplied) || 0));
  const cash = Math.max(0, Math.floor(Number(input.amountCents) || 0));
  const cashLabel = source === "credits" || source === "profile" ? "$0" : formatUsdFromCents(cash);
  const sessionId = String(input.sessionId || "").trim();
  const showStripeSession =
    (source === "stripe" || source === "mixed") &&
    sessionId.length > 0 &&
    !sessionId.startsWith("cred-");
  const lines = [
    `<p style="margin:0 0 8px;"><strong>Payment method:</strong> ${escapeHtml(methodLabel)}</p>`,
    credits > 0
      ? `<p style="margin:0 0 8px;"><strong>Credits applied:</strong> ${escapeHtml(
          `${credits} credit${credits === 1 ? "" : "s"}`,
        )} (1 credit = $1)</p>`
      : "",
    `<p style="margin:0 0 8px;"><strong>Cash charged:</strong> ${escapeHtml(cashLabel)}</p>`,
    showStripeSession
      ? `<p style="margin:0 0 8px;"><strong>Stripe session:</strong> ${escapeHtml(sessionId)}</p>`
      : "",
  ].filter(Boolean);
  return { source, methodLabel, amountLabel, cashLabel, html: lines.join("\n") };
}
