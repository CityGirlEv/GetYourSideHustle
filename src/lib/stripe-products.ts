import { getRuntimeConfig } from "@/lib/env";
import { LEAD_PAY_AS_YOU_GO, LEAD_SUBSCRIPTION_PRICING } from "@/lib/lead-pricing";

/** Internal plan keys — map to Stripe Price IDs via environment variables. */
export type StripePlanKey =
  | "subscription_intro"
  | "subscription_regular"
  | "payg_1"
  | "payg_2"
  | "payg_3";

export type StripePlanMode = "subscription" | "payment";

export type StripePlanDefinition = {
  key: StripePlanKey;
  mode: StripePlanMode;
  label: string;
  description: string;
  monthlyFee?: number;
  leadCount?: number;
  priceEnvVar: string;
  featured?: boolean;
};

const PLAN_DEFINITIONS: StripePlanDefinition[] = [
  {
    key: "subscription_intro",
    mode: "subscription",
    label: `${LEAD_SUBSCRIPTION_PRICING.label} (Intro)`,
    description: `${LEAD_SUBSCRIPTION_PRICING.introductory.discountPercent}% off for new partners — up to ${LEAD_SUBSCRIPTION_PRICING.introductory.includedLeadsPerMonth} leads/month`,
    monthlyFee: LEAD_SUBSCRIPTION_PRICING.introductory.monthlyFee,
    leadCount: LEAD_SUBSCRIPTION_PRICING.introductory.includedLeadsPerMonth,
    priceEnvVar: "STRIPE_PRICE_SUBSCRIPTION_INTRO",
    featured: true,
  },
  {
    key: "subscription_regular",
    mode: "subscription",
    label: `${LEAD_SUBSCRIPTION_PRICING.label}`,
    description: `Up to ${LEAD_SUBSCRIPTION_PRICING.regular.includedLeadsPerMonth} exclusive leads per month`,
    monthlyFee: LEAD_SUBSCRIPTION_PRICING.regular.monthlyFee,
    leadCount: LEAD_SUBSCRIPTION_PRICING.regular.includedLeadsPerMonth,
    priceEnvVar: "STRIPE_PRICE_SUBSCRIPTION_REGULAR",
  },
  ...LEAD_PAY_AS_YOU_GO.map((tier, index) => ({
    key: `payg_${tier.leads}` as StripePlanKey,
    mode: "payment" as const,
    label: `${tier.leads} lead${tier.leads === 1 ? "" : "s"} bundle`,
    description: "One-time purchase — no monthly commitment",
    leadCount: tier.leads,
    monthlyFee: tier.price,
    priceEnvVar: `STRIPE_PRICE_PAYG_${tier.leads}`,
  })),
];

export function listStripePlanDefinitions(): StripePlanDefinition[] {
  return PLAN_DEFINITIONS;
}

export function getStripePlanDefinition(planKey: string): StripePlanDefinition | undefined {
  return PLAN_DEFINITIONS.find((p) => p.key === planKey);
}

export function resolveStripePriceId(planKey: string): string | undefined {
  const plan = getStripePlanDefinition(planKey);
  if (!plan) return undefined;
  return getRuntimeConfig(plan.priceEnvVar);
}

export function planLeadAllowance(planKey: string): number {
  const plan = getStripePlanDefinition(planKey);
  return plan?.leadCount ?? 0;
}

export function isSubscriptionPlanKey(planKey: string): boolean {
  return getStripePlanDefinition(planKey)?.mode === "subscription";
}
