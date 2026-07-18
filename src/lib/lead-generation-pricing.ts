/** Per-lead add-on pricing — subscription tiers bundle platform access + leads. */

import {
  LEAD_PAY_AS_YOU_GO,
  LEAD_SUBSCRIPTION_PRICING,
  formatUsd,
} from "@/lib/lead-pricing";

export const LEAD_GENERATION_PRICING_ID = "subscription-leads-v1";

export const LEAD_GENERATION_PER_LEAD = {
  /** Single qualified Medicare lead — no monthly commitment. */
  singleLead: LEAD_PAY_AS_YOU_GO[0].price,
  /** Effective per-lead floor on Gold/Platinum subscription tiers (8 leads/mo). */
  volumeFloor: LEAD_SUBSCRIPTION_PRICING.regular.effectivePerLead,
} as const;

export const LEAD_GENERATION_FEATURES = [
  "Medicare-intent leads from benchmark tool opt-ins",
  "AI-assisted qualification (ZIP, eligibility, priorities)",
  "CRM export and webhook delivery",
  "TrustedForm / consent audit trail",
  "Monthly performance reporting",
] as const;

export { formatUsd };
