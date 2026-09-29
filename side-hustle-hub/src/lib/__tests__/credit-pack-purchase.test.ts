import { describe, expect, it } from "vitest";
import {
  auditEventsFromPayments,
  formatAlaCartePurchaseLabel,
  formatCreditPackPurchaseLabel,
  formatLedgerReason,
  itemMetaFromPaymentLabel,
  kidCreditsFromCartItemMeta,
  kidCreditsFromPurchase,
  mergeAuditEventsWithPurchases,
  parseCartItemLines,
  purchaseAuditAction,
  purchaseAuditDetail,
  stripStripeSessionId,
} from "../credit-pack-purchase";

describe("credit-pack-purchase", () => {
  it("parses Join cart item meta and Boost Pack credits ($5 = 5)", () => {
    expect(parseCartItemLines("boostx1")).toEqual([{ itemId: "boost", quantity: 1 }]);
    expect(kidCreditsFromCartItemMeta("boostx1")).toBe(5);
    expect(kidCreditsFromCartItemMeta("boostx2,familyx1")).toBe(5 * 2 + 40);
    expect(itemMetaFromPaymentLabel("Credit pack · boostx1")).toBe("boostx1");
  });

  it("grants pack credits from label or $5 Boost Pack price when cart meta is missing", () => {
    expect(kidCreditsFromPurchase({ label: "Credit pack · Boost Pack", kind: "credit_pack" })).toBe(5);
    expect(kidCreditsFromPurchase({ kind: "credit_pack", amountCents: 500 })).toBe(5);
    expect(kidCreditsFromPurchase({ kind: "membership", amountCents: 500 })).toBe(0);
  });

  it("formats credit pack details and strips Stripe session ids from ledger copy", () => {
    expect(formatCreditPackPurchaseLabel({ label: "Credit pack · boostx1" })).toBe(
      "Boost Pack - 5 credits",
    );
    expect(
      formatLedgerReason(
        "Credit pack · 5 Kid Credits · cs_live_b1AEAQydYierg5rRPiF1LEmIYrIUkadp7sWWGogTEqsdOr5oNoP3bwIcqo",
      ),
    ).toBe("Boost Pack - 5 credits");
    expect(formatLedgerReason("Membership plan credits: starter")).toBe(
      "Starter membership credits",
    );
    expect(stripStripeSessionId("Membership plan credits: starter")).toBe(
      "Membership plan credits: starter",
    );
    expect(formatAlaCartePurchaseLabel({ label: "A-la-carte · consult-30x2" })).toBe(
      "1-on-1 consulting (30 min) ×2",
    );
    expect(formatAlaCartePurchaseLabel({ label: "A-la-carte", amountCents: 1200 })).toBe(
      "Progress report PDF (one-off)",
    );
  });

  it("builds purchase audit rows for the user log", () => {
    expect(purchaseAuditAction("credit_pack")).toBe("purchase_credit_pack");
    expect(purchaseAuditDetail({
      kind: "credit_pack",
      label: "Credit pack · boostx1",
      amountCents: 500,
      sessionId: "cs_test123",
    })).toBe("Credit pack · boostx1 · $5.00 · 5 Kid Credits · cs_test123");

    const events = auditEventsFromPayments([
      {
        paidAt: "2026-09-07T07:00:00.000Z",
        email: "Parent@Example.com",
        kind: "credit_pack",
        label: "Credit pack · boostx1",
        amountCents: 500,
        sessionId: "cs_abc",
      },
    ]);
    expect(events[0]?.action).toBe("purchase_credit_pack");
    expect(events[0]?.email).toBe("parent@example.com");
    expect(events[0]?.detail).toMatch(/5 Kid Credits/);
  });

  it("prefers payment ledger rows over raw stripe_checkout_paid for the same session", () => {
    const merged = mergeAuditEventsWithPurchases(
      [
        {
          at: "2026-09-07T07:00:00.000Z",
          action: "stripe_checkout_paid",
          email: "a@b.com",
          detail: "credit_pack:cs_abc::",
        },
        {
          at: "2026-09-07T06:00:00.000Z",
          action: "login_ok",
          email: "a@b.com",
          detail: "ok",
        },
      ],
      [
        {
          at: "2026-09-07T07:00:00.000Z",
          action: "purchase_credit_pack",
          email: "a@b.com",
          detail: "Credit pack · boostx1 · $5.00 · 5 Kid Credits · cs_abc",
        },
      ],
    );
    expect(merged.map((e) => e.action)).toEqual(["purchase_credit_pack", "login_ok"]);
  });
});
