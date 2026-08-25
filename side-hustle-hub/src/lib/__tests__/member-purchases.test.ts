import { describe, expect, it } from "vitest";
import {
  buildMemberAccessSummary,
  formatPurchaseAmount,
  formatPurchasePaidAt,
  purchaseKindLabel,
  summarizeMemberBilling,
} from "../member-purchases";

describe("member-purchases", () => {
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
    expect(summary.purchasedSessions).toContain("A-la-carte · consult-30x1");
    expect(summary.creditPacks).toContain("Credit pack · launcher");
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
    expect(totals.byKind.membership?.count).toBe(1);
    expect(totals.byKind.alacarte?.amountUsd).toBe(75);
  });

  it("formats paid-at dates and amounts", () => {
    const s = formatPurchasePaidAt("2026-08-22T18:00:00.000Z");
    expect(s).not.toBe("—");
    expect(s.length).toBeGreaterThan(4);
    expect(formatPurchaseAmount({ amountUsd: 39, currency: "usd" })).toMatch(/\$39/);
  });
});
