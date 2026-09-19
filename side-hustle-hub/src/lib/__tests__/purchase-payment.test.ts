import { describe, expect, it } from "vitest";
import {
  formatPurchasePaymentAmountLabel,
  formatPurchasePaymentDetail,
  purchasePaymentMethodLabel,
  resolvePurchasePaymentSource,
} from "../purchase-payment";

describe("purchase payment receipts", () => {
  it("treats a credit-only checkout as credits, not Stripe", () => {
    expect(
      resolvePurchasePaymentSource({ source: "credits", amountCents: 0, creditsApplied: 40 }),
    ).toBe("credits");
    expect(purchasePaymentMethodLabel("credits")).toBe("GYSH credits (Stripe was not used)");
    expect(formatPurchasePaymentAmountLabel({ amountCents: 0, creditsApplied: 40 })).toBe(
      "40 credits",
    );
    const detail = formatPurchasePaymentDetail({
      source: "credits",
      amountCents: 0,
      creditsApplied: 40,
      sessionId: "cred-user-abc",
    });
    expect(detail.html).toContain("GYSH credits (Stripe was not used)");
    expect(detail.html).toContain("Credits applied:");
    expect(detail.html).toContain("40 credits");
    expect(detail.html).toContain("Cash charged:");
    expect(detail.html).toContain("$0");
    expect(detail.html).not.toMatch(/Stripe Checkout confirmed/i);
    expect(detail.html).not.toContain("Stripe session");
  });

  it("labels Stripe cash and mixed Stripe + credits", () => {
    expect(
      resolvePurchasePaymentSource({ source: "stripe", amountCents: 500, creditsApplied: 0 }),
    ).toBe("stripe");
    expect(purchasePaymentMethodLabel("stripe")).toBe("Stripe Checkout");
    const stripe = formatPurchasePaymentDetail({
      source: "stripe",
      amountCents: 500,
      creditsApplied: 0,
      sessionId: "cs_test_123",
    });
    expect(stripe.html).toContain("Stripe Checkout");
    expect(stripe.html).toContain("Cash charged:");
    expect(stripe.html).toContain("$5");
    expect(stripe.html).toContain("cs_test_123");
    expect(stripe.html).not.toContain("Credits applied");

    const mixed = formatPurchasePaymentDetail({
      source: "stripe",
      amountCents: 500,
      creditsApplied: 40,
    });
    expect(mixed.source).toBe("mixed");
    expect(mixed.methodLabel).toBe("Mixed — Stripe Checkout + GYSH credits");
    expect(mixed.amountLabel).toBe("$5 + 40 credits");
    expect(mixed.html).toContain("Credits applied:");
    expect(mixed.html).toContain("Cash charged:");
  });

  it("labels admin complimentary grants as $0 with no Stripe session", () => {
    expect(resolvePurchasePaymentSource({ source: "admin" })).toBe("admin");
    expect(purchasePaymentMethodLabel("admin")).toBe("Admin complimentary grant (no card charge)");
    const detail = formatPurchasePaymentDetail({
      source: "admin",
      amountCents: 0,
    });
    expect(detail.cashLabel).toBe("$0");
    expect(detail.html).toContain("Admin complimentary grant (no card charge)");
    expect(detail.html).not.toContain("Stripe session");
  });
});
