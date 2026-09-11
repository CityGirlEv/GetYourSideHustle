/**
 * Adult/Senior paid memberships: 3-month minimum commitment.
 * Stripe charges 3 months upfront; monthly recurring begins in month 4.
 */

export const MEMBERSHIP_COMMITMENT_MONTHS = 3;

/** Due at checkout for monthly plans (3× catalog monthly). Yearly is unchanged. */
export function membershipDueNowUsd(
  interval: "month" | "year",
  catalogAmountUsd: number,
): number {
  const amount = Math.max(0, Number(catalogAmountUsd) || 0);
  if (interval === "year") return Math.round(amount * 100) / 100;
  return Math.round(amount * MEMBERSHIP_COMMITMENT_MONTHS * 100) / 100;
}

/** Unix seconds when monthly recurring should first bill (start of month 4). */
export function membershipRecurringTrialEndUnix(nowMs: number = Date.now()): number {
  const d = new Date(nowMs);
  d.setUTCMonth(d.getUTCMonth() + MEMBERSHIP_COMMITMENT_MONTHS);
  return Math.floor(d.getTime() / 1000);
}

export function membershipAdvanceBillingNoteCopy(): string {
  return "Paid Adult and Senior plans require a 3-month commitment: Stripe charges 3 months upfront, then monthly billing starts in month 4. Yearly plans are billed in advance for the year.";
}

export function membershipCommitmentLineItemName(planLabel: string): string {
  const base = String(planLabel || "GYSH membership").trim() || "GYSH membership";
  return `${base} — ${MEMBERSHIP_COMMITMENT_MONTHS}-month commitment (prepaid)`;
}

/** Checkout CTA / summary for the amount due now. */
export function membershipCheckoutDueLabel(input: {
  interval: "month" | "year";
  monthlyUsd: number;
  yearlyUsd: number | null;
  formatUsd: (n: number) => string;
}): string {
  if (input.interval === "year" && input.yearlyUsd != null) {
    return `${input.formatUsd(input.yearlyUsd)} / yr`;
  }
  const due = membershipDueNowUsd("month", input.monthlyUsd);
  return `${input.formatUsd(due)} for ${MEMBERSHIP_COMMITMENT_MONTHS} months, then ${input.formatUsd(input.monthlyUsd)} / mo`;
}
