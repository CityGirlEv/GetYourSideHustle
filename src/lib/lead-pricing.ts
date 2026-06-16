/** Option 2 — Subscription + Leads (internal admin pricing reference). */

export const LEAD_PRICING_OPTION_ID = "subscription-leads-v1";

export const LEAD_PRICING_FEATURES = [
  "Exclusive territory (if available)",
  "AI-qualified Medicare prospects",
  "CRM access",
  "Automated follow-up tools",
  "Priority lead routing",
  "Up to 8 exclusive leads per month, based on availability",
] as const;

export const LEAD_SUBSCRIPTION_PRICING = {
  label: "Subscription + Leads",
  rating: 5,
  includedLeadsPerMonth: 8,
  minimumTermMonths: 3,
  additionalLeadPrice: 15,
  regular: {
    monthlyFee: 100,
    effectivePerLead: 12.5,
  },
  introductory: {
    discountPercent: 40,
    monthlyFee: 60,
    effectivePerLead: 7.5,
  },
} as const;

export const LEAD_PAY_AS_YOU_GO = [
  { leads: 1, price: 40 },
  { leads: 2, price: 75 },
  { leads: 3, price: 100 },
] as const;

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
