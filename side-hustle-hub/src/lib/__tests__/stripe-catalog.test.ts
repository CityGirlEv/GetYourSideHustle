import { describe, expect, it } from "vitest";
import {
  alaCarteStripePrice,
  creditPackStripePrice,
  joinCartStripePrice,
  membershipStripePrice,
  stripeCatalogMode,
} from "../stripe-catalog";
import { CREDIT_PACKS } from "../membership";
import { supportsMembershipStripeCheckout } from "../stripe-checkout";

describe("stripe catalog", () => {
  it("is in live mode with membership price ids", () => {
    expect(stripeCatalogMode()).toBe("live");
    const starterMonthly = membershipStripePrice("starter", "adult", "month");
    expect(starterMonthly?.priceId).toMatch(/^price_/);
    expect(starterMonthly?.amountUsd).toBe(39);
    expect(starterMonthly?.label).toMatch(/Monthly/i);
    expect(membershipStripePrice("free", "adult", "month")).toBeNull();
    expect(membershipStripePrice("pro", "kids", "month")).toBeNull();
  });

  it("maps a-la-carte and credit packs", () => {
    expect(alaCarteStripePrice("workshop-general")?.amountUsd).toBe(40);
    expect(alaCarteStripePrice("workshop-general")?.label).toBe(
      "Workshops (Starter & Above Workshops Free)",
    );
    expect(alaCarteStripePrice("consult-60")?.amountUsd).toBe(65);
    expect(alaCarteStripePrice("consult-30")?.amountUsd).toBe(45);
    expect(alaCarteStripePrice("consult-90")?.amountUsd).toBe(75);
    expect(alaCarteStripePrice("consult-120")?.amountUsd).toBe(145);
    expect(alaCarteStripePrice("consult-60")?.priceId).toMatch(/^price_/);
    expect(creditPackStripePrice("launcher")?.amountUsd).toBe(20);
    expect(joinCartStripePrice("boost")?.amountUsd).toBe(5);
    expect(joinCartStripePrice("family")?.amountUsd).toBe(40);
    expect(alaCarteStripePrice("missing")).toBeNull();
  });

  it("keeps credit pack Stripe amounts aligned with Join pack prices", () => {
    for (const pack of CREDIT_PACKS) {
      expect(creditPackStripePrice(pack.id)?.amountUsd).toBe(pack.priceUsd);
      expect(joinCartStripePrice(pack.id)?.priceId).toMatch(/^price_/);
    }
  });

  it("supports Stripe membership checkout only for adult/senior paid tiers", () => {
    expect(supportsMembershipStripeCheckout("starter", "adult")).toBe(true);
    expect(supportsMembershipStripeCheckout("elite", "senior")).toBe(true);
    expect(supportsMembershipStripeCheckout("starter", "kids")).toBe(false);
    expect(supportsMembershipStripeCheckout("free", "adult")).toBe(false);
  });
});
