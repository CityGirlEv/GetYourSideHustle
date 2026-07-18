import {
  AGENT_ADD_ONS,
  AGENT_SUBSCRIPTION_LABEL,
  AGENT_TIERS,
  computeAgentPackagePrice,
  formatAgentPackageLabel,
  formatAgentUsd,
  type AgentAddOnId,
  type AgentTierId,
} from "@/lib/agent-pricing-tiers";
import { LEAD_GENERATION_PER_LEAD } from "@/lib/lead-generation-pricing";
import { formatUsd } from "@/lib/lead-pricing";
import { getStripePlanDefinition, type StripePlanKey } from "@/lib/stripe-products";

export type AuditCreditsPackageId = "starter" | "growth" | "unlimited";

export const AUDIT_CREDIT_PACKAGES = [
  { id: "starter" as const, name: "Starter audit credits", price: 29, credits: 10 },
  { id: "growth" as const, name: "Growth audit credits", price: 99, credits: 50 },
  { id: "unlimited" as const, name: "Unlimited audit credits", price: 199, credits: 999 },
];

export type CartProductKind =
  | "agent-tier"
  | "agent-addon"
  | "agent-package"
  | "lead-generation-per-lead"
  | "stripe-plan"
  | "audit-credits";

export type CartItemPayload =
  | { kind: "agent-tier"; tierId: AgentTierId }
  | { kind: "agent-addon"; addOnId: AgentAddOnId }
  | { kind: "agent-package"; tierId: AgentTierId; addOnIds: AgentAddOnId[] }
  | { kind: "lead-generation-per-lead"; quantity?: number }
  | { kind: "stripe-plan"; planKey: StripePlanKey }
  | { kind: "audit-credits"; packageId: AuditCreditsPackageId };

export type CartBillingCadence = "monthly" | "one-time" | "per-lead";

export type CartItem = {
  cartKey: string;
  kind: CartProductKind;
  label: string;
  subtitle?: string;
  unitPrice: number;
  quantity: number;
  billingCadence: CartBillingCadence;
  payload: CartItemPayload;
  stripePlanKey?: StripePlanKey;
  checkoutViaStripe: boolean;
};

function sortedAddOnIds(addOnIds: AgentAddOnId[]): AgentAddOnId[] {
  return [...addOnIds].sort();
}

function tierLeadSubtitle(tierId: AgentTierId): string {
  const { leadAllocation, tagline, minimumTermMonths } = AGENT_TIERS[tierId];
  return `${leadAllocation.summary} · ${minimumTermMonths}-month minimum · ${tagline}`;
}

export function cartItemKey(payload: CartItemPayload): string {
  switch (payload.kind) {
    case "agent-tier":
      return `agent-tier:${payload.tierId}`;
    case "agent-addon":
      return `agent-addon:${payload.addOnId}`;
    case "agent-package":
      return `agent-package:${payload.tierId}:${sortedAddOnIds(payload.addOnIds).join(",")}`;
    case "lead-generation-per-lead":
      return "lead-generation:per-lead";
    case "stripe-plan":
      return `stripe:${payload.planKey}`;
    case "audit-credits":
      return `audit-credits:${payload.packageId}`;
    default:
      return JSON.stringify(payload);
  }
}

export function buildCartItem(payload: CartItemPayload, quantity = 1): CartItem {
  const cartKey = cartItemKey(payload);

  switch (payload.kind) {
    case "agent-tier": {
      const tier = AGENT_TIERS[payload.tierId];
      return {
        cartKey,
        kind: payload.kind,
        label: `${tier.name} — ${AGENT_SUBSCRIPTION_LABEL}`,
        subtitle: tierLeadSubtitle(payload.tierId),
        unitPrice: tier.monthlyPrice,
        quantity,
        billingCadence: "monthly",
        payload,
        checkoutViaStripe: false,
      };
    }
    case "agent-addon": {
      const addOn = AGENT_ADD_ONS.find((entry) => entry.id === payload.addOnId);
      if (!addOn) throw new Error(`Unknown add-on: ${payload.addOnId}`);
      return {
        cartKey,
        kind: payload.kind,
        label: addOn.name,
        subtitle: addOn.description,
        unitPrice: addOn.monthlyPrice,
        quantity,
        billingCadence: "monthly",
        payload,
        checkoutViaStripe: false,
      };
    }
    case "agent-package": {
      const addOnIds = sortedAddOnIds(payload.addOnIds);
      const label = formatAgentPackageLabel(payload.tierId, addOnIds);
      const unitPrice = computeAgentPackagePrice(payload.tierId, addOnIds);
      const tier = AGENT_TIERS[payload.tierId];
      return {
        cartKey,
        kind: payload.kind,
        label: `${label} — ${AGENT_SUBSCRIPTION_LABEL}`,
        subtitle:
          addOnIds.length > 0
            ? `${tier.name} + ${addOnIds.length} add-on${addOnIds.length === 1 ? "" : "s"} · ${tier.leadAllocation.summary}`
            : tierLeadSubtitle(payload.tierId),
        unitPrice,
        quantity,
        billingCadence: "monthly",
        payload: { ...payload, addOnIds },
        checkoutViaStripe: false,
      };
    }
    case "lead-generation-per-lead":
      return {
        cartKey,
        kind: payload.kind,
        label: "Qualified Medicare lead",
        subtitle: "Pay-as-you-go outbound lead — no monthly minimum",
        unitPrice: LEAD_GENERATION_PER_LEAD.singleLead,
        quantity: Math.max(1, payload.quantity ?? quantity),
        billingCadence: "per-lead",
        payload: { ...payload, quantity: Math.max(1, payload.quantity ?? quantity) },
        checkoutViaStripe: false,
      };
    case "stripe-plan": {
      const plan = getStripePlanDefinition(payload.planKey);
      if (!plan) throw new Error(`Unknown Stripe plan: ${payload.planKey}`);
      return {
        cartKey,
        kind: payload.kind,
        label: plan.label,
        subtitle: plan.description,
        unitPrice: plan.monthlyFee ?? 0,
        quantity,
        billingCadence: plan.mode === "subscription" ? "monthly" : "one-time",
        payload,
        stripePlanKey: payload.planKey,
        checkoutViaStripe: true,
      };
    }
    case "audit-credits": {
      const pkg = AUDIT_CREDIT_PACKAGES.find((entry) => entry.id === payload.packageId);
      if (!pkg) throw new Error(`Unknown audit credits package: ${payload.packageId}`);
      return {
        cartKey,
        kind: payload.kind,
        label: pkg.name,
        subtitle: `${pkg.credits} audit credits`,
        unitPrice: pkg.price,
        quantity,
        billingCadence: "one-time",
        payload,
        checkoutViaStripe: false,
      };
    }
    default:
      throw new Error("Unsupported cart payload");
  }
}

export function formatCartItemPrice(item: CartItem): string {
  const total = item.unitPrice * item.quantity;
  switch (item.billingCadence) {
    case "monthly":
      return `${formatAgentUsd(total)}/mo`;
    case "per-lead":
      return `${formatUsd(total)}${item.quantity > 1 ? ` (${item.quantity} leads)` : ""}`;
    case "one-time":
      return formatUsd(total);
    default:
      return formatUsd(total);
  }
}

export function summarizeCartTotals(items: CartItem[]): {
  monthlySubtotal: number;
  oneTimeSubtotal: number;
  perLeadSubtotal: number;
} {
  let monthlySubtotal = 0;
  let oneTimeSubtotal = 0;
  let perLeadSubtotal = 0;
  for (const item of items) {
    const lineTotal = item.unitPrice * item.quantity;
    if (item.billingCadence === "monthly") monthlySubtotal += lineTotal;
    else if (item.billingCadence === "per-lead") perLeadSubtotal += lineTotal;
    else oneTimeSubtotal += lineTotal;
  }
  return { monthlySubtotal, oneTimeSubtotal, perLeadSubtotal };
}

export function listPurchasableProductKinds(): CartProductKind[] {
  return [
    "agent-tier",
    "agent-addon",
    "agent-package",
    "lead-generation-per-lead",
    "stripe-plan",
    "audit-credits",
  ];
}
