import { describe, expect, it } from "vitest";
import {
  BILLING_DASHBOARD_HREF,
  billingCategoryLabel,
  buildMemberAccessSummary,
  formatPurchaseAmount,
  formatPurchaseDescription,
  formatPurchasePaidAt,
  formatPurchasePaidOn,
  isBillingDashboardHash,
  purchaseKindLabel,
  summarizeMemberBilling,
} from "../member-purchases";

describe("member-purchases", () => {
  it("points Billing at My Dashboard with a billing hash", () => {
    expect(BILLING_DASHBOARD_HREF).toBe("/my-dashboard#billing");
    expect(isBillingDashboardHash("#billing")).toBe(true);
    expect(isBillingDashboardHash("purchases")).toBe(true);
    expect(isBillingDashboardHash("#credits")).toBe(false);
  });

  it("labels purchase kinds", () => {
    expect(purchaseKindLabel("membership")).toBe("Membership");
    expect(purchaseKindLabel("alacarte")).toBe("A-la-carte");
    expect(purchaseKindLabel("credit_pack")).toBe("Credit pack");
  });

  it("builds access summary from tier and purchase history", () => {
    const summary = buildMemberAccessSummary({
      membershipTier: "pro",
      audience: "adult",
      purchases: [
        {
          id: "1",
          sessionId: "cs_1",
          kind: "alacarte",
          tier: "",
          audience: "adult",
          interval: "",
          label: "A-la-carte · consult-30x1",
          amountCents: 7500,
          amountUsd: 75,
          currency: "usd",
          paidAt: "2026-08-01T12:00:00.000Z",
          source: "stripe",
        },
        {
          id: "2",
          sessionId: "cs_2",
          kind: "credit_pack",
          tier: "",
          audience: "kids",
          interval: "",
          label: "Credit pack · launcher",
          amountCents: 2000,
          amountUsd: 20,
          currency: "usd",
          paidAt: "2026-08-02T12:00:00.000Z",
          source: "stripe",
        },
      ],
    });
    expect(summary.planLabel).toBe("Pro");
    expect(summary.enrolledLabel).toMatch(/Pro/);
    expect(summary.audienceLabel).toMatch(/Adult/i);
    expect(summary.scheduleSuite).toBe(true);
    expect(summary.perks.length).toBeGreaterThan(0);
    expect(summary.purchasedSessions).toEqual([
      expect.objectContaining({
        label: "1-on-1 consulting (30 min)",
        paidAt: "2026-08-01T12:00:00.000Z",
      }),
    ]);
    expect(summary.creditPacks).toEqual([
      expect.objectContaining({
        label: "Launcher Pack - 20 credits",
        paidAt: "2026-08-02T12:00:00.000Z",
      }),
    ]);
  });

  it("summarizes billing totals", () => {
    const totals = summarizeMemberBilling([
      {
        id: "1",
        sessionId: "cs_1",
        kind: "membership",
        tier: "starter",
        audience: "adult",
        interval: "month",
        label: "Starter",
        amountCents: 3900,
        amountUsd: 39,
        currency: "usd",
        paidAt: "2026-08-01T12:00:00.000Z",
        source: "stripe",
      },
      {
        id: "2",
        sessionId: "cs_2",
        kind: "alacarte",
        tier: "",
        audience: "adult",
        interval: "",
        label: "Consult",
        amountCents: 7500,
        amountUsd: 75,
        currency: "usd",
        paidAt: "2026-08-02T12:00:00.000Z",
        source: "stripe",
      },
    ]);
    expect(totals.count).toBe(2);
    expect(totals.amountUsd).toBe(114);
    expect(totals.byKind["membership:starter"]?.count).toBe(1);
    expect(billingCategoryLabel("membership:starter")).toBe("Membership · Starter");
    expect(totals.byKind.alacarte?.amountUsd).toBe(75);
  });

  it("formats paid-at dates and amounts", () => {
    const s = formatPurchasePaidAt("2026-08-22T18:00:00.000Z");
    expect(s).not.toBe("—");
    expect(s.length).toBeGreaterThan(4);
    expect(formatPurchaseAmount({ amountUsd: 39, currency: "usd" })).toMatch(/\$39/);
    expect(formatPurchasePaidOn("2026-08-22T18:00:00.000Z")).toMatch(/2026/);
    expect(formatPurchasePaidOn("not-a-date")).toBe("not-a-date");
    expect(
      formatPurchaseDescription({
        kind: "credit_pack",
        label: "Credit pack · boostx1",
        amountCents: 500,
      }),
    ).toBe("Boost Pack - 5 credits");
    expect(
      formatPurchaseDescription({
        kind: "alacarte",
        label: "A-la-carte · consult-30x1",
        amountCents: 7500,
      }),
    ).toBe("1-on-1 consulting (30 min)");
    expect(
      formatPurchaseDescription({
        kind: "alacarte",
        label: "A-la-carte",
        amountCents: 1200,
      }),
    ).toBe("Progress report PDF (one-off)");
  });

  it("uses paid Starter checkout when the account row is still Free", () => {
    const summary = buildMemberAccessSummary({
      membershipTier: "free",
      audience: "adult",
      purchases: [
        {
          id: "1",
          sessionId: "cs_starter",
          kind: "membership",
          tier: "starter",
          audience: "adult",
          interval: "month",
          label: "Starter · adult · monthly",
          amountCents: 3900,
          amountUsd: 39,
          currency: "usd",
          paidAt: "2026-09-01T12:00:00.000Z",
          source: "stripe",
        },
      ],
    });
    expect(summary.membershipTier).toBe("starter");
    expect(summary.planLabel).toBe("Starter");
    expect(summary.enrolledLabel).toMatch(/Starter/);
    expect(summary.membershipPaidAt).toBe("2026-09-01T12:00:00.000Z");
    expect(summary.scheduleSuite).toBe(false);
  });

  it("does not let a cheaper membership purchase downgrade Pro", () => {
    const summary = buildMemberAccessSummary({
      membershipTier: "pro",
      audience: "adult",
      purchases: [
        {
          id: "1",
          sessionId: "cs_old",
          kind: "membership",
          tier: "starter",
          audience: "adult",
          interval: "month",
          label: "Starter · adult · monthly",
          amountCents: 3900,
          amountUsd: 39,
          currency: "usd",
          paidAt: "2026-08-01T12:00:00.000Z",
          source: "stripe",
        },
      ],
    });
    expect(summary.membershipTier).toBe("pro");
  });
});
