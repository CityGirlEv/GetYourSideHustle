import { describe, expect, it } from "vitest";
import {
  resolveAlaCarteCheckoutLines,
  resolveCheckoutPrice,
  stripeCatalogLookupKey,
  supportsMembershipStripeCheckout,
} from "../stripe-checkout";
import {
  checkoutReturnOrigin,
  encodeStripeForm,
  normalizeCheckoutOrigin,
  pickChargeablePriceId,
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
      expect(consult.amountUsd).toBe(65);
    }
    const pack = resolveCheckoutPrice({ kind: "credit_pack", packId: "launcher" });
    expect(pack.ok).toBe(true);
    if (pack.ok) expect(pack.amountUsd).toBe(20);
  });

  it("resolves credit packs in the Join cart using pack Stripe prices", () => {
    const packs = resolveAlaCarteCheckoutLines([
      { itemId: "boost", quantity: 2 },
      { itemId: "launcher", quantity: 1 },
    ]);
    expect(packs.ok).toBe(true);
    if (packs.ok) {
      expect(packs.checkoutKind).toBe("credit_pack");
      expect(packs.amountUsd).toBe(5 * 2 + 20);
      expect(packs.lines.map((l) => l.skuKind)).toEqual(["credit_pack", "credit_pack"]);
    }
    const mixed = resolveAlaCarteCheckoutLines([
      { itemId: "boost", quantity: 1 },
      { itemId: "consult-30", quantity: 1 },
    ]);
    expect(mixed.ok).toBe(true);
    if (mixed.ok) {
      expect(mixed.checkoutKind).toBe("alacarte");
      expect(mixed.amountUsd).toBe(5 + 45);
    }
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
      expect(cart.amountUsd).toBe(45 * 2 + 40);
      expect(cart.label).toMatch(/cart/i);
    }
    const single = resolveAlaCarteCheckoutLines(undefined, "progress-pdf");
    expect(single.ok).toBe(true);
    if (single.ok) {
      expect(single.lines).toHaveLength(1);
      expect(single.amountUsd).toBe(12);
    }
  });

  it("keeps an active catalog price and replaces an inactive one", () => {
    expect(
      pickChargeablePriceId({
        catalogPriceId: "price_old",
        catalogPrice: { id: "price_old", active: true },
        lookupPrices: [{ id: "price_new", active: true }],
      }),
    ).toEqual({ ok: true, priceId: "price_old", replacedInactive: false });

    expect(
      pickChargeablePriceId({
        catalogPriceId: "price_inactive_quarter",
        catalogPrice: { id: "price_inactive_quarter", active: false },
        lookupPrices: [{ id: "price_active_month", active: true }],
      }),
    ).toEqual({ ok: true, priceId: "price_active_month", replacedInactive: true });

    const missing = pickChargeablePriceId({
      catalogPriceId: "price_inactive_quarter",
      catalogPrice: { id: "price_inactive_quarter", active: false },
      lookupPrices: [],
    });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.error).toMatch(/inactive/i);

    expect(
      pickChargeablePriceId({
        catalogPriceId: "price_catalog",
        catalogPrice: null,
        lookupPrices: [],
        confirmed: false,
      }),
    ).toEqual({ ok: true, priceId: "price_catalog", replacedInactive: false });
  });

  it("builds the Stripe lookup key checkout uses when a catalog price is inactive", () => {
    expect(
      stripeCatalogLookupKey({
        kind: "membership",
        tierId: "starter",
        audience: "senior",
        interval: "month",
      }),
    ).toBe("gysh_membership_starter_senior_month");
    expect(stripeCatalogLookupKey({ kind: "alacarte", itemId: "consult-60" })).toBe(
      "gysh_alacarte_consult-60_once",
    );
    expect(stripeCatalogLookupKey({ kind: "credit_pack", itemId: "boost" })).toBe(
      "gysh_credits_boost_once",
    );
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
