import type { AgentTierId } from "@/lib/agent-pricing-tiers";
import { AGENT_TIER_ORDER } from "@/lib/agent-pricing-tiers";

export const FEATURES_MAIN_TABS = ["consumer", "agents"] as const;

export const FEATURES_AGENT_TIER_TABS = AGENT_TIER_ORDER;

export type FeaturesMainTab = (typeof FEATURES_MAIN_TABS)[number];

/** @deprecated Agent sub-tabs removed — unified Agents view. Kept for legacy URL parsing. */
export const FEATURES_AGENT_TABS = ["platform-access", "lead-pricing"] as const;

/** @deprecated */
export type FeaturesAgentTab = (typeof FEATURES_AGENT_TABS)[number];

/** Legacy combined-page tab query values — still accepted in URLs. */
export const LEGACY_FEATURES_PRICING_TABS = ["feature-pricing", "subscription"] as const;

export type LegacyFeaturesPricingTab = (typeof LEGACY_FEATURES_PRICING_TABS)[number];

/** @deprecated Use {@link FeaturesMainTab} */
export type FeaturesPricingTab = FeaturesAgentTab;

export function parseFeaturesMainTab(value: string | undefined): FeaturesMainTab {
  if (
    value === "agents" ||
    value === "feature-pricing" ||
    value === "subscription" ||
    value === "platform-access" ||
    value === "lead-pricing"
  ) {
    return "agents";
  }
  return "consumer";
}

/** @deprecated Agent sub-tabs removed. Legacy values are accepted but ignored for layout. */
export function parseFeaturesAgentTab(
  tab: string | undefined,
  agentTab: string | undefined,
): FeaturesAgentTab | undefined {
  if (agentTab === "platform-access" || agentTab === "lead-pricing") {
    return agentTab;
  }
  if (tab === "subscription" || tab === "lead-pricing") {
    return "lead-pricing";
  }
  if (tab === "feature-pricing" || tab === "platform-access") {
    return "platform-access";
  }
  return undefined;
}

export function parseFeaturesAgentTierTab(value: string | undefined): AgentTierId {
  if (value && (FEATURES_AGENT_TIER_TABS as readonly string[]).includes(value)) {
    return value as AgentTierId;
  }
  return "silver";
}

/** @deprecated Use {@link parseFeaturesAgentTab} */
export function parseFeaturesPricingTab(
  value: string | undefined,
): FeaturesAgentTab | undefined {
  return parseFeaturesAgentTab(value, undefined);
}

export type FeaturesPageTabSearch = {
  tab: FeaturesMainTab;
};

/** Legacy /pricing tab values mapped onto the combined features page. */
export function pricingRedirectSearch(
  _legacyTab: string | undefined,
): FeaturesPageTabSearch {
  return { tab: "agents" };
}

/** @deprecated Use {@link pricingRedirectSearch} */
export function pricingRedirectTab(
  legacyTab: string | undefined,
): FeaturesAgentTab {
  return parseFeaturesAgentTab(undefined, legacyTab === "platform" ? "platform-access" : "lead-pricing") ?? "lead-pricing";
}
