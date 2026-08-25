import { describe, expect, it } from "vitest";
import {
  alaCarteStripePrice,
  creditPackStripePrice,
  membershipStripePrice,
  stripeCatalogMode,
} from "../stripe-catalog";
import { supportsMembershipStripeCheckout } from "../stripe-checkout";

describe("stripe catalog", () => {
  it("is in test mode with membership price ids", () => {
    expect(stripeCatalogMode()).toBe("test");
    const starterMonthly = membershipStripePrice("starter", "adult", "month");
    expect(starterMonthly?.priceId).toMatch(/^price_/);
    expect(starterMonthly?.amountUsd).toBe(39);
    expect(membershipStripePrice("free", "adult", "month")).toBeNull();
    expect(membershipStripePrice("pro", "kids", "month")).toBeNull();
  });

  it("maps a-la-carte and credit packs", () => {
    expect(alaCarteStripePrice("consult-60")?.amountUsd).toBe(120);
    expect(alaCarteStripePrice("consult-60")?.priceId).toMatch(/^price_/);
    expect(creditPackStripePrice("launcher")?.amountUsd).toBe(20);
    expect(alaCarteStripePrice("missing")).toBeNull();
  });

  it("supports Stripe membership checkout only for adult/senior paid tiers", () => {
    expect(supportsMembershipStripeCheckout("starter", "adult")).toBe(true);
    expect(supportsMembershipStripeCheckout("elite", "senior")).toBe(true);
    expect(supportsMembershipStripeCheckout("starter", "kids")).toBe(false);
    expect(supportsMembershipStripeCheckout("free", "adult")).toBe(false);
  });
});
