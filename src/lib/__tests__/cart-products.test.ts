import { describe, expect, it } from "vitest";
import {
  AGENT_TIERS,
  AGENT_ADD_ONS,
  computeAgentPackagePrice,
  type AgentAddOnId,
} from "@/lib/agent-pricing-tiers";
import {
  buildCartItem,
  cartItemKey,
  formatCartItemPrice,
  summarizeCartTotals,
} from "@/lib/cart-products";
import { LEAD_GENERATION_PER_LEAD } from "@/lib/lead-generation-pricing";
import { LEAD_PAY_AS_YOU_GO, LEAD_SUBSCRIPTION_PRICING } from "@/lib/lead-pricing";

describe("cart-products", () => {
  it("builds stable keys for agent packages regardless of add-on order", () => {
    const addOnsA: AgentAddOnId[] = ["ma-catalog", "part-d-only"];
    const addOnsB: AgentAddOnId[] = ["part-d-only", "ma-catalog"];
    expect(cartItemKey({ kind: "agent-package", tierId: "silver", addOnIds: addOnsA })).toBe(
      cartItemKey({ kind: "agent-package", tierId: "silver", addOnIds: addOnsB }),
    );
  });

  it("prices agent tiers and add-ons from internal catalog", () => {
    const tierItem = buildCartItem({ kind: "agent-tier", tierId: "gold" });
    expect(tierItem.unitPrice).toBe(AGENT_TIERS.gold.monthlyPrice);
    expect(tierItem.label).toContain("Gold");
    expect(tierItem.label).toContain("Agent Subscription Levels & Al La Carte");

    const addOnItem = buildCartItem({ kind: "agent-addon", addOnId: "county-report-zip5" });
    expect(addOnItem.unitPrice).toBe(
      AGENT_ADD_ONS.find((a) => a.id === "county-report-zip5")!.monthlyPrice,
    );
    expect(addOnItem.billingCadence).toBe("monthly");
  });

  it("computes agent package totals from tier + add-ons", () => {
    const addOnIds: AgentAddOnId[] = ["part-d-only"];
    const item = buildCartItem({ kind: "agent-package", tierId: "bronze", addOnIds });
    expect(item.unitPrice).toBe(computeAgentPackagePrice("bronze", addOnIds));
    expect(formatCartItemPrice(item)).toMatch(/\$67\/mo/);
  });

  it("maps per-lead add-ons and Stripe plan products", () => {
    const perLead = buildCartItem({ kind: "lead-generation-per-lead", quantity: 2 });
    expect(perLead.unitPrice).toBe(LEAD_GENERATION_PER_LEAD.singleLead);
    expect(perLead.quantity).toBe(2);

    const intro = buildCartItem({ kind: "stripe-plan", planKey: "subscription_intro" });
    expect(intro.checkoutViaStripe).toBe(true);
    expect(intro.stripePlanKey).toBe("subscription_intro");
    expect(intro.unitPrice).toBe(LEAD_SUBSCRIPTION_PRICING.introductory.monthlyFee);

    const payg = buildCartItem({ kind: "stripe-plan", planKey: "payg_2" });
    expect(payg.billingCadence).toBe("one-time");
    expect(payg.unitPrice).toBe(LEAD_PAY_AS_YOU_GO[1].price);
  });

  it("summarizes mixed cart totals by billing cadence", () => {
    const items = [
      buildCartItem({ kind: "agent-tier", tierId: "silver" }),
      buildCartItem({ kind: "stripe-plan", planKey: "payg_1" }),
      buildCartItem({ kind: "lead-generation-per-lead", quantity: 1 }),
    ];
    const totals = summarizeCartTotals(items);
    expect(totals.monthlySubtotal).toBe(AGENT_TIERS.silver.monthlyPrice);
    expect(totals.oneTimeSubtotal).toBe(LEAD_PAY_AS_YOU_GO[0].price);
    expect(totals.perLeadSubtotal).toBe(LEAD_GENERATION_PER_LEAD.singleLead);
  });
});
