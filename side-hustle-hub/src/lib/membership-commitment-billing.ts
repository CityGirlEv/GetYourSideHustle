/**
 * Adult/Senior paid memberships bill every 3 months in Stripe (not monthly).
 * Yearly plans stay billed once per year.
 */

export const MEMBERSHIP_COMMITMENT_MONTHS = 3;

/** 3-month Stripe invoice from the displayed monthly sticker price. */
export function membershipQuarterlyUsd(monthlyUsd: number): number {
  const amount = Math.max(0, Number(monthlyUsd) || 0);
  return Math.round(amount * MEMBERSHIP_COMMITMENT_MONTHS * 100) / 100;
}

/** Amount charged now: catalog price is already the invoice (quarterly or yearly). */
export function membershipDueNowUsd(
  interval: "month" | "year",
  catalogAmountUsd: number,
): number {
  void interval;
  return Math.round(Math.max(0, Number(catalogAmountUsd) || 0) * 100) / 100;
}

/** Join / pricing-page due from the monthly sticker (3×) or yearly list price. */
export function membershipJoinDueUsd(
  interval: "month" | "year",
  monthlyUsd: number,
  yearlyUsd: number | null,
): number {
  if (interval === "year" && yearlyUsd != null) {
    return Math.round(Math.max(0, Number(yearlyUsd) || 0) * 100) / 100;
  }
  return membershipQuarterlyUsd(monthlyUsd);
}

export function membershipBillingCadenceLabel(interval: "month" | "year" | string): string {
  return String(interval).toLowerCase() === "year" ? "yearly" : "every 3 months";
}

export function membershipJoinIntervalRadioLabel(input: {
  interval: "month" | "year";
  monthlyUsd: number;
  yearlyUsd: number | null;
  yearlySaveUsd?: number;
  formatUsd: (n: number) => string;
}): string {
  if (input.interval === "year" && input.yearlyUsd != null) {
    const save =
      input.yearlySaveUsd && input.yearlySaveUsd > 0
        ? ` (save ${input.formatUsd(input.yearlySaveUsd)})`
        : "";
    return `Yearly — ${input.formatUsd(input.yearlyUsd)} / yr${save}`;
  }
  return `Every ${MEMBERSHIP_COMMITMENT_MONTHS} months — ${input.formatUsd(
    membershipQuarterlyUsd(input.monthlyUsd),
  )}`;
}

export function membershipAdvanceBillingNoteCopy(): string {
  return "Paid Adult and Senior plans bill every 3 months in Stripe (not monthly). Yearly plans are billed once for the year.";
}

export function membershipCommitmentLineItemName(planLabel: string): string {
  const base = String(planLabel || "GYSH membership").trim() || "GYSH membership";
  return `${base} — every ${MEMBERSHIP_COMMITMENT_MONTHS} months`;
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
  const due = membershipQuarterlyUsd(input.monthlyUsd);
  return `${input.formatUsd(due)} every ${MEMBERSHIP_COMMITMENT_MONTHS} months`;
}
