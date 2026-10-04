/** How a GYSH purchase was paid — used on admin/member receipts. */

export type PurchasePaymentSource = "stripe" | "credits" | "mixed" | "profile" | "admin";

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
  if (raw === "admin") return "admin";
  if (credits > 0 && cash > 0) return "mixed";
  if (raw === "credits" || (credits > 0 && cash === 0)) return "credits";
  if (raw === "mixed") return "mixed";
  return "stripe";
}

export function purchasePaymentMethodLabel(source: PurchasePaymentSource): string {
  if (source === "credits") return "GYSH credits (Stripe was not used)";
  if (source === "mixed") return "Mixed — Stripe Checkout + GYSH credits";
  if (source === "profile") return "Profile plan update (no card charge)";
  if (source === "admin") return "Admin complimentary grant (no card charge)";
  return "Stripe Checkout";
}

/** Match a credit spend in the ledger to the checkout that used it. */
export function matchCreditsSpentToSessions(
  spends: ReadonlyArray<{ delta?: number | null; reason?: string | null }>,
  sessionIds: ReadonlyArray<string>,
): Map<string, number> {
  const map = new Map<string, number>();
  const used = new Set<number>();
  for (const rawId of sessionIds) {
    const id = String(rawId || "").trim();
    if (!id || map.has(id)) continue;
    const needle = id.length > 16 ? id.slice(-16) : id;
    const idx = spends.findIndex((row, i) => {
      if (used.has(i)) return false;
      const reason = String(row.reason || "");
      return reason.includes(id) || (needle.length >= 8 && reason.includes(needle));
    });
    if (idx < 0) continue;
    used.add(idx);
    const spent = Math.abs(Math.trunc(Number(spends[idx]?.delta) || 0));
    if (spent > 0) map.set(id, spent);
  }
  return map;
}

export function creditsAppliedFromPaymentMeta(metaJson: string | null | undefined): number {
  try {
    const parsed = JSON.parse(String(metaJson || "{}")) as { creditsApplied?: unknown };
    return Math.max(0, Math.floor(Number(parsed.creditsApplied) || 0));
  } catch {
    return 0;
  }
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
  const cashLabel =
    source === "credits" || source === "profile" || source === "admin"
      ? "$0"
      : formatUsdFromCents(cash);
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
