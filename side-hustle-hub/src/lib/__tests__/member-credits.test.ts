import { describe, expect, it } from "vitest";
import {
  creditRatioLabel,
  formatAdultCreditEquivalent,
  formatKidCreditBalance,
  formatLedgerDelta,
  monthlyKidCreditAllowance,
  normalizeAudience,
  normalizeTierId,
  summarizeMemberCredits,
} from "../member-credits";

describe("member-credits helpers", () => {
  it("formats Kid Credit balance with singular/plural", () => {
    expect(formatKidCreditBalance(0)).toBe("0 Kid Credits");
    expect(formatKidCreditBalance(1)).toBe("1 Kid Credit");
    expect(formatKidCreditBalance(40)).toBe("40 Kid Credits");
    expect(formatKidCreditBalance(-3)).toBe("0 Kid Credits");
  });

  it("maps Kid Credits to adult equivalents at 2:1", () => {
    expect(formatAdultCreditEquivalent(0)).toBe("0 adult credits");
    expect(formatAdultCreditEquivalent(1)).toBe("0 adult credits");
    expect(formatAdultCreditEquivalent(2)).toBe("1 adult credit");
    expect(formatAdultCreditEquivalent(41)).toBe("20 adult credits");
  });

  it("formats ledger deltas with a leading plus for credits", () => {
    expect(formatLedgerDelta(40)).toBe("+40");
    expect(formatLedgerDelta(-10)).toBe("-10");
    expect(formatLedgerDelta(0)).toBe("0");
  });

  it("exposes the standard credit ratio label", () => {
    expect(creditRatioLabel()).toBe("2 Kid Credits = 1 adult credit");
  });

  it("normalizes unknown tier/audience to safe defaults", () => {
    expect(normalizeTierId("PRO")).toBe("pro");
    expect(normalizeTierId("mystery")).toBe("free");
    expect(normalizeAudience("Junior")).toBe("junior");
    expect(normalizeAudience("Teens")).toBe("junior");
    expect(normalizeAudience("teen")).toBe("junior");
    expect(normalizeAudience("")).toBe("adult");
  });

  it("computes monthly Kid Credit allowance by audience", () => {
    expect(monthlyKidCreditAllowance("pro", "kids")).toBe(140);
    expect(monthlyKidCreditAllowance("pro", "junior")).toBe(140);
    expect(monthlyKidCreditAllowance("pro", "adult")).toBe(60);
    expect(monthlyKidCreditAllowance("pro", "senior")).toBe(60);
    expect(monthlyKidCreditAllowance("free", "adult")).toBe(0);
  });

  it("summarizes API payload for the member dashboard", () => {
    const summary = summarizeMemberCredits({
      balance: 41,
      membershipTier: "elite",
      audience: "kids",
      monthlyAllowance: 280,
      totals: { earned: 280, spent: 239, balance: 41 },
      recent: [
        {
          id: "mcl-1",
          delta: 40,
          reason: "Referral bonus",
          balanceAfter: 41,
          createdAt: "2026-07-01T12:00:00.000Z",
        },
      ],
    });

    expect(summary.balance).toBe(41);
    expect(summary.adultEquivalent).toBe(20);
    expect(summary.membershipTier).toBe("elite");
    expect(summary.audience).toBe("kids");
    expect(summary.monthlyAllowance).toBe(280);
    expect(summary.enrolledLabel).toMatch(/Elite/);
    expect(summary.totals).toEqual({ earned: 280, spent: 239, balance: 41 });
    expect(summary.recent).toHaveLength(1);
    expect(summary.ratioLabel).toContain("Kid Credits");
  });

  it("maps parent audience to Kids credit pool", () => {
    const summary = summarizeMemberCredits({
      balance: 60,
      membershipTier: "starter",
      audience: "parent",
      recent: [],
    });
    expect(summary.audience).toBe("kids");
    expect(summary.monthlyAllowance).toBe(60);
    expect(summary.enrolledLabel).toMatch(/Starter/);
  });

  it("clamps invalid balances and empty recent lists", () => {
    const summary = summarizeMemberCredits({
      balance: Number.NaN,
      membershipTier: "free",
      audience: "adult",
      recent: undefined as unknown as [],
    });
    expect(summary.balance).toBe(0);
    expect(summary.recent).toEqual([]);
    expect(summary.monthlyAllowance).toBe(0);
  });
});
