import {
  formatUsd,
  LEAD_SUBSCRIPTION_PRICING,
} from "@/lib/lead-pricing";

export type AgentTierId = "bronze" | "silver" | "gold" | "platinum";

export type AgentAddOnId =
  | "all-plans-catalog"
  | "county-report-zip3"
  | "county-report-zip5"
  | "ma-catalog"
  | "i-snp-catalog"
  | "part-d-only"
  | "saved-reports-pack"
  | "compliance-checklist"
  | "lead-tools";

export type AgentTierFeature = {
  id: string;
  label: string;
};

export type AgentTierLeadAllocation = {
  /** Short lead headline on tier cards — e.g. "8 leads/mo included". */
  summary: string;
  /** Extra detail for tier cards and checkout copy. */
  detail: string;
  /** Qualified Medicare leads included each month at this tier. */
  includedLeads: number;
  /** Price per lead beyond the monthly included count. */
  overagePerLead: number;
};

export type AgentTierDefinition = {
  id: AgentTierId;
  name: string;
  monthlyPrice: number;
  /** Minimum subscription commitment in months. */
  minimumTermMonths: number;
  tagline: string;
  features: AgentTierFeature[];
  /** Feature ids included at this tier (add-ons at lower tiers may be redundant). */
  includedFeatureIds: string[];
  /** Platform access + lead volume bundled at this subscription tier. */
  leadAllocation: AgentTierLeadAllocation;
};

export type AgentAddOnDefinition = {
  id: AgentAddOnId;
  name: string;
  monthlyPrice: number;
  description: string;
  /** Minimum tier that already includes this add-on (cannot be purchased separately). */
  includedFromTier?: AgentTierId;
};

export const AGENT_SUBSCRIPTION_LABEL = "Agent Subscription Levels & Al La Carte";

/** Minimum commitment for Bronze–Platinum agent subscriptions. */
export const AGENT_SUBSCRIPTION_MINIMUM_TERM_MONTHS = 2;

export const AGENT_TIER_ORDER: AgentTierId[] = ["bronze", "silver", "gold", "platinum"];

export function formatAgentUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Secondary tab label — e.g. "$59/mo" on agent subscription tier tabs. */
export function formatAgentTierTabMeta(tierId: AgentTierId): string {
  return `${formatAgentUsd(AGENT_TIERS[tierId].monthlyPrice)}/mo`;
}

export function formatAgentMinimumTerm(tierId: AgentTierId): string {
  const months = AGENT_TIERS[tierId].minimumTermMonths;
  return `${months}-month minimum`;
}

export type AgentTierComparisonAttributeRow = {
  id: string;
  label: string;
  kind: "text" | "feature";
  getTextValue?: (tierId: AgentTierId) => string;
  featureId?: string;
};

/** Key platform features shown as rows in the side-by-side tier comparison table. */
export const AGENT_TIER_COMPARISON_FEATURES: { id: string; label: string }[] = [
  { id: "medigap-part-d-catalog", label: "Medigap + Part D catalog" },
  { id: "ma-catalog", label: "Medicare Advantage catalog" },
  { id: "all-plans-catalog", label: "All Plans national CMS catalog" },
  { id: "county-report-zip3", label: "County report — ZIP prefix (3 digits)" },
  { id: "county-report-zip5", label: "County report — full ZIP (5 digits)" },
  { id: "lead-tools", label: "Lead capture & follow-up tools" },
  { id: "compliance-checklist", label: "Compliance checklist & audit trail" },
  { id: "priority-leads", label: "Priority lead routing" },
  { id: "white-label-pdf", label: "White-label PDF & co-branded exports" },
];

/** Attribute rows for the agent tier comparison grid (price, leads, features). */
export function agentTierComparisonAttributeRows(): AgentTierComparisonAttributeRow[] {
  const textRows: AgentTierComparisonAttributeRow[] = [
    {
      id: "monthly-price",
      label: "Monthly price",
      kind: "text",
      getTextValue: (tierId) => formatAgentUsd(AGENT_TIERS[tierId].monthlyPrice),
    },
    {
      id: "included-leads",
      label: "Included leads",
      kind: "text",
      getTextValue: (tierId) => `${AGENT_TIERS[tierId].leadAllocation.includedLeads}/mo`,
    },
    {
      id: "minimum-term",
      label: "Minimum term",
      kind: "text",
      getTextValue: (tierId) => `${AGENT_TIERS[tierId].minimumTermMonths} months`,
    },
    {
      id: "overage",
      label: "Overage per lead",
      kind: "text",
      getTextValue: (tierId) => formatAgentUsd(AGENT_TIERS[tierId].leadAllocation.overagePerLead),
    },
    {
      id: "lead-allocation",
      label: "Lead allocation",
      kind: "text",
      getTextValue: (tierId) => AGENT_TIERS[tierId].leadAllocation.summary,
    },
  ];

  const featureRows: AgentTierComparisonAttributeRow[] = AGENT_TIER_COMPARISON_FEATURES.map(
    (feature) => ({
      id: feature.id,
      label: feature.label,
      kind: "feature" as const,
      featureId: feature.id,
    }),
  );

  return [...textRows, ...featureRows];
}

const SUBSCRIPTION_OVERAGE = LEAD_SUBSCRIPTION_PRICING.additionalLeadPrice;
const BRONZE_INCLUDED_LEADS = 2;
const SILVER_INCLUDED_LEADS = 4;
const GOLD_INCLUDED_LEADS = 6;
const PLATINUM_INCLUDED_LEADS = 8;
const BRONZE_EFFECTIVE_PER_LEAD = 29.5;
const SILVER_EFFECTIVE_PER_LEAD = 24.75;
const GOLD_EFFECTIVE_PER_LEAD = 149 / 6;
const PLATINUM_EFFECTIVE_PER_LEAD = 249 / 8;

export const AGENT_TIERS: Record<AgentTierId, AgentTierDefinition> = {
  bronze: {
    id: "bronze",
    name: "Bronze",
    monthlyPrice: 59,
    minimumTermMonths: AGENT_SUBSCRIPTION_MINIMUM_TERM_MONTHS,
    tagline: "Medigap + Part D catalog with starter lead volume",
    leadAllocation: {
      summary: `${BRONZE_INCLUDED_LEADS} leads/mo included`,
      detail: `${BRONZE_INCLUDED_LEADS} qualified Medicare leads each month (~${formatUsd(BRONZE_EFFECTIVE_PER_LEAD)}/lead effective) — overage ${formatAgentUsd(SUBSCRIPTION_OVERAGE)}/lead.`,
      includedLeads: BRONZE_INCLUDED_LEADS,
      overagePerLead: SUBSCRIPTION_OVERAGE,
    },
    includedFeatureIds: ["medigap-part-d-catalog", "basic-scenarios", "saved-reports-5"],
    features: [
      { id: "medigap-part-d-catalog", label: "Medigap + Part D plan catalog (regional)" },
      { id: "basic-scenarios", label: "Benchmark scenario builder & PDF export" },
      { id: "saved-reports-5", label: "Up to 5 saved reports per month" },
    ],
  },
  silver: {
    id: "silver",
    name: "Silver",
    monthlyPrice: 99,
    minimumTermMonths: AGENT_SUBSCRIPTION_MINIMUM_TERM_MONTHS,
    tagline: "Medicare Advantage access, lead tools, and starter lead volume",
    leadAllocation: {
      summary: `${SILVER_INCLUDED_LEADS} leads/mo included`,
      detail: `Lead capture & follow-up tools plus ${SILVER_INCLUDED_LEADS} qualified leads each month (~${formatUsd(SILVER_EFFECTIVE_PER_LEAD)}/lead effective) — overage ${formatAgentUsd(SUBSCRIPTION_OVERAGE)}/lead.`,
      includedLeads: SILVER_INCLUDED_LEADS,
      overagePerLead: SUBSCRIPTION_OVERAGE,
    },
    includedFeatureIds: [
      "medigap-part-d-catalog",
      "ma-catalog",
      "basic-scenarios",
      "lead-tools",
      "saved-reports-25",
    ],
    features: [
      { id: "ma-catalog", label: "Medicare Advantage catalog access" },
      { id: "lead-tools", label: "Lead capture & follow-up tools" },
      { id: "saved-reports-25", label: "Up to 25 saved reports per month" },
      { id: "medigap-part-d-catalog", label: "Everything in Bronze" },
    ],
  },
  gold: {
    id: "gold",
    name: "Gold",
    monthlyPrice: 149,
    minimumTermMonths: AGENT_SUBSCRIPTION_MINIMUM_TERM_MONTHS,
    tagline: "National All Plans catalog, county reports, and 6 leads/mo",
    leadAllocation: {
      summary: `${GOLD_INCLUDED_LEADS} leads/mo included`,
      detail: `Full platform access with ${GOLD_INCLUDED_LEADS} qualified leads monthly (~${formatUsd(GOLD_EFFECTIVE_PER_LEAD)}/lead effective) — overage ${formatAgentUsd(SUBSCRIPTION_OVERAGE)}/lead.`,
      includedLeads: GOLD_INCLUDED_LEADS,
      overagePerLead: SUBSCRIPTION_OVERAGE,
    },
    includedFeatureIds: [
      "medigap-part-d-catalog",
      "ma-catalog",
      "all-plans-catalog",
      "county-report-zip3",
      "county-report-zip5",
      "compliance-checklist",
      "lead-tools",
      "saved-reports-unlimited",
    ],
    features: [
      { id: "all-plans-catalog", label: "All Plans national CMS catalog" },
      { id: "county-report-zip3", label: "County report by ZIP prefix (first 3 digits)" },
      { id: "county-report-zip5", label: "County report by full 5-digit ZIP" },
      { id: "compliance-checklist", label: "Compliance checklist & audit trail" },
      { id: "saved-reports-unlimited", label: "Unlimited saved reports" },
      { id: "ma-catalog", label: "Everything in Silver" },
    ],
  },
  platinum: {
    id: "platinum",
    name: "Platinum",
    monthlyPrice: 249,
    minimumTermMonths: AGENT_SUBSCRIPTION_MINIMUM_TERM_MONTHS,
    tagline: "Full platform, priority support, and 8 leads/mo",
    leadAllocation: {
      summary: `${PLATINUM_INCLUDED_LEADS} leads/mo + priority routing`,
      detail: `Everything in Gold plus priority lead routing and white-label exports (~${formatUsd(PLATINUM_EFFECTIVE_PER_LEAD)}/lead effective) — overage ${formatAgentUsd(SUBSCRIPTION_OVERAGE)}/lead.`,
      includedLeads: PLATINUM_INCLUDED_LEADS,
      overagePerLead: SUBSCRIPTION_OVERAGE,
    },
    includedFeatureIds: [
      "medigap-part-d-catalog",
      "ma-catalog",
      "all-plans-catalog",
      "county-report-zip3",
      "county-report-zip5",
      "compliance-checklist",
      "lead-tools",
      "saved-reports-unlimited",
      "priority-leads",
      "white-label-pdf",
    ],
    features: [
      { id: "priority-leads", label: "Priority lead routing" },
      { id: "white-label-pdf", label: "White-label PDF & co-branded exports" },
      { id: "all-plans-catalog", label: "Everything in Gold" },
    ],
  },
};

/** À la carte add-on monthly prices (halved from prior catalog; odd halves rounded to nearest dollar). */
export const AGENT_ADD_ONS: AgentAddOnDefinition[] = [
  {
    id: "ma-catalog",
    name: "Medicare Advantage access",
    monthlyPrice: 10,
    description: "Browse and compare MA plans in member scenarios.",
    includedFromTier: "silver",
  },
  {
    id: "i-snp-catalog",
    name: "I-SNP institutional SNP access",
    monthlyPrice: 10,
    description:
      "Institutional Special Needs (I-SNP) filter on All Plans and county reports — nursing home / LTC eligibility.",
  },
  {
    id: "part-d-only",
    name: "Part D only catalog",
    monthlyPrice: 8,
    description: "Standalone Part D plan filters without full Medigap bundle.",
  },
  {
    id: "all-plans-catalog",
    name: "All Plans national catalog",
    monthlyPrice: 15,
    description: "Full nationwide CMS catalog row on Potential Options.",
    includedFromTier: "gold",
  },
  {
    id: "county-report-zip3",
    name: "County report — ZIP prefix (3 digits)",
    monthlyPrice: 8,
    description:
      "Multi-county plan inventory for a 3-digit ZIP prefix — pick counties and export PDF.",
    includedFromTier: "gold",
  },
  {
    id: "county-report-zip5",
    name: "County report — full ZIP (5 digits)",
    monthlyPrice: 8,
    description: "Single-county plan inventory for a specific 5-digit ZIP with PDF export.",
    includedFromTier: "gold",
  },
  {
    id: "saved-reports-pack",
    name: "Saved reports pack (+50/mo)",
    monthlyPrice: 5,
    description: "Extra saved benchmark reports beyond tier limit.",
  },
  {
    id: "compliance-checklist",
    name: "Compliance checklist",
    monthlyPrice: 8,
    description: "SOA tracking, disclaimers, and submission checklist.",
    includedFromTier: "gold",
  },
  {
    id: "lead-tools",
    name: "Lead tools",
    monthlyPrice: 13,
    description: "CRM-lite lead queue and automated follow-up.",
    includedFromTier: "silver",
  },
];

const TIER_RANK: Record<AgentTierId, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
};

/** Add-ons the user can still purchase on top of the selected tier. */
export function availableAddOnsForTier(tierId: AgentTierId): AgentAddOnDefinition[] {
  const tierRank = TIER_RANK[tierId];
  return AGENT_ADD_ONS.filter((addOn) => {
    if (!addOn.includedFromTier) return true;
    return TIER_RANK[addOn.includedFromTier] > tierRank;
  });
}

/** Display label — e.g. "Bronze ++" when one or more add-ons are selected. */
export function formatAgentPackageLabel(tierId: AgentTierId, addOnIds: AgentAddOnId[]): string {
  const tier = AGENT_TIERS[tierId];
  if (addOnIds.length === 0) return tier.name;
  const plusSigns = "+".repeat(Math.min(addOnIds.length, 3));
  return `${tier.name} ${plusSigns}`;
}

/** Monthly total for tier + selected add-ons (skips add-ons already included in tier). */
export function computeAgentPackagePrice(tierId: AgentTierId, addOnIds: AgentAddOnId[]): number {
  const tier = AGENT_TIERS[tierId];
  const purchasable = new Set(availableAddOnsForTier(tierId).map((a) => a.id));
  let total = tier.monthlyPrice;
  for (const id of addOnIds) {
    if (!purchasable.has(id)) continue;
    const addOn = AGENT_ADD_ONS.find((a) => a.id === id);
    if (addOn) total += addOn.monthlyPrice;
  }
  return total;
}

/** Whether a platform feature is unlocked by tier alone (ignoring à la carte add-ons). */
export function tierIncludesFeature(tierId: AgentTierId, featureId: string): boolean {
  return AGENT_TIERS[tierId].includedFeatureIds.includes(featureId);
}

/** Whether tier + add-ons unlock a feature (maps add-on ids to feature ids). */
export function packageIncludesFeature(
  tierId: AgentTierId,
  addOnIds: AgentAddOnId[],
  featureId: string,
): boolean {
  if (tierIncludesFeature(tierId, featureId)) return true;
  const addOnFeatureMap: Partial<Record<AgentAddOnId, string>> = {
    "all-plans-catalog": "all-plans-catalog",
    "county-report-zip3": "county-report-zip3",
    "county-report-zip5": "county-report-zip5",
    "ma-catalog": "ma-catalog",
    "i-snp-catalog": "i-snp-catalog",
    "compliance-checklist": "compliance-checklist",
    "lead-tools": "lead-tools",
  };
  return addOnIds.some((id) => addOnFeatureMap[id] === featureId);
}
