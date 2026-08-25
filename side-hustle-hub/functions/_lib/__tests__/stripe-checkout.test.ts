import { describe, expect, it } from "vitest";
import {
  resolveAlaCarteCheckoutLines,
  resolveCheckoutPrice,
  supportsMembershipStripeCheckout,
} from "../stripe-checkout";
import {
  checkoutReturnOrigin,
  encodeStripeForm,
  normalizeCheckoutOrigin,
} from "../stripe";

describe("stripe checkout resolution", () => {
  it("resolves adult/senior membership subscriptions", () => {
    const monthly = resolveCheckoutPrice({
      kind: "membership",
      tierId: "starter",
      audience: "adult",
      interval: "month",
    });
    expect(monthly.ok).toBe(true);
    if (monthly.ok) {
      expect(monthly.mode).toBe("subscription");
      expect(monthly.priceId).toMatch(/^price_/);
      expect(monthly.amountUsd).toBe(39);
    }

    const seniorYear = resolveCheckoutPrice({
      kind: "membership",
      tierId: "pro",
      audience: "senior",
      interval: "year",
    });
    expect(seniorYear.ok).toBe(true);
    if (seniorYear.ok) expect(seniorYear.amountUsd).toBe(570);
  });

  it("rejects kids/junior USD membership checkout", () => {
    const kids = resolveCheckoutPrice({
      kind: "membership",
      tierId: "starter",
      audience: "kids",
      interval: "month",
    });
    expect(kids.ok).toBe(false);
    expect(supportsMembershipStripeCheckout("starter", "kids")).toBe(false);
    expect(supportsMembershipStripeCheckout("starter", "adult")).toBe(true);
    expect(supportsMembershipStripeCheckout("free", "adult")).toBe(false);
  });

  it("resolves a-la-carte and credit packs as one-time payments", () => {
    const consult = resolveCheckoutPrice({ kind: "alacarte", itemId: "consult-60" });
    expect(consult.ok).toBe(true);
    if (consult.ok) {
      expect(consult.mode).toBe("payment");
      expect(consult.amountUsd).toBe(120);
    }
    const pack = resolveCheckoutPrice({ kind: "credit_pack", packId: "launcher" });
    expect(pack.ok).toBe(true);
    if (pack.ok) expect(pack.amountUsd).toBe(20);
  });

  it("resolves multi-item a-la-carte cart lines", () => {
    const cart = resolveAlaCarteCheckoutLines([
      { itemId: "consult-30", quantity: 2 },
      { itemId: "workshop-general", quantity: 1 },
    ]);
    expect(cart.ok).toBe(true);
    if (cart.ok) {
      expect(cart.mode).toBe("payment");
      expect(cart.lines).toHaveLength(2);
      expect(cart.amountUsd).toBe(75 * 2 + 35);
      expect(cart.label).toMatch(/cart/i);
    }
    const single = resolveAlaCarteCheckoutLines(undefined, "progress-pdf");
    expect(single.ok).toBe(true);
    if (single.ok) {
      expect(single.lines).toHaveLength(1);
      expect(single.amountUsd).toBe(12);
    }
  });

  it("encodes Stripe form fields", () => {
    const body = encodeStripeForm({
      mode: "subscription",
      "line_items[0][price]": "price_abc",
      "line_items[0][quantity]": 1,
      skip: undefined,
    });
    expect(body).toContain("mode=subscription");
    expect(body).toContain(encodeURIComponent("line_items[0][price]"));
    expect(body).not.toContain("skip=");
  });

  it("maps local API :8788 return URLs to Vite :5173", () => {
    expect(normalizeCheckoutOrigin("http://127.0.0.1:8788")).toBe("http://127.0.0.1:5173");
    expect(normalizeCheckoutOrigin("http://localhost:8788/api/x")).toBe("http://localhost:5173");
    expect(normalizeCheckoutOrigin("https://getyoursidehustle.com")).toBe(
      "https://getyoursidehustle.com",
    );
  });

  it("prefers client returnOrigin / Origin header for Stripe redirects", () => {
    const req = new Request("http://127.0.0.1:8788/api/stripe/checkout", {
      method: "POST",
      headers: { origin: "http://localhost:5173" },
    });
    expect(checkoutReturnOrigin(req)).toBe("http://localhost:5173");
    expect(
      checkoutReturnOrigin(req, { preferredOrigin: "http://127.0.0.1:5173" }),
    ).toBe("http://127.0.0.1:5173");
  });
});
