import { describe, expect, it } from "vitest";
import {
  attachLedgerRunningBalances,
  creditRatioLabel,
  creditsBalanceHeadline,
  portalWelcomeCreditLabel,
  emptyMemberCreditsSummary,
  formatKidCreditBalance,
  formatCreditCount,
  formatLedgerDelta,
  formatLedgerWhen,
  friendlyCreditsLoadError,
  ledgerNetBalance,
  ledgerOccurredAt,
  monthlyKidCreditAllowance,
  normalizeAudience,
  normalizeTierId,
  higherMembershipTier,
  roundCreditAmount,
  spendableCreditBalance,
  summarizeMemberCredits,
  CREDITS_DASHBOARD_HREF,
  isCreditsDashboardHash,
} from "../member-credits";

describe("member-credits helpers", () => {
  it("formats credit balance with singular/plural", () => {
    expect(formatKidCreditBalance(0)).toBe("0 credits");
    expect(formatKidCreditBalance(1)).toBe("1 credit");
    expect(formatKidCreditBalance(40)).toBe("40 credits");
    expect(formatKidCreditBalance(-3)).toBe("0 credits");
  });

  it("shows a friendly balance headline including zero", () => {
    expect(creditsBalanceHeadline(0)).toBe("Your credit balance is 0");
    expect(creditsBalanceHeadline(5)).toBe("Your credit balance is 5");
    expect(creditsBalanceHeadline(2.5)).toBe("Your credit balance is 2.5");
  });

  it("labels the welcome-card credit balance for every member", () => {
    expect(portalWelcomeCreditLabel(0, true)).toBe("Loading credits…");
    expect(portalWelcomeCreditLabel(null, false)).toBe("0 credits");
    expect(portalWelcomeCreditLabel(1, false)).toBe("1 credit");
    expect(portalWelcomeCreditLabel(40, false)).toBe("40 credits");
  });

  it("hides Not authenticated behind a zero-balance fallback", () => {
    expect(friendlyCreditsLoadError(new Error("Not authenticated."))).toBeNull();
    expect(friendlyCreditsLoadError(new Error("Session expired."))).toBeNull();
    expect(friendlyCreditsLoadError(new Error("D1 timeout"))).toMatch(/credit balance is shown as 0/i);
    expect(emptyMemberCreditsSummary().balance).toBe(0);
    expect(emptyMemberCreditsSummary().totals.balance).toBe(0);
  });

  it("rounds credit amounts to one decimal so 2.5 stays 2.5", () => {
    expect(roundCreditAmount(2.5)).toBe(2.5);
    expect(roundCreditAmount(2.54)).toBe(2.5);
    expect(roundCreditAmount(2.56)).toBe(2.6);
    expect(roundCreditAmount(Number.NaN)).toBe(0);
  });

  it("points Credits at My Dashboard with a credits hash", () => {
    expect(CREDITS_DASHBOARD_HREF).toBe("/my-dashboard#credits");
    expect(isCreditsDashboardHash("#credits")).toBe(true);
    expect(isCreditsDashboardHash("credits")).toBe(true);
    expect(isCreditsDashboardHash("#billing")).toBe(false);
  });

  it("picks the highest membership when the Credits API lags an upgrade", () => {
    expect(higherMembershipTier("starter", "elite")).toBe("elite");
    expect(higherMembershipTier("elite", "starter")).toBe("elite");
    expect(higherMembershipTier("free", "starter", "pro")).toBe("pro");
    expect(higherMembershipTier(null, "starter")).toBe("starter");
  });

  it("keeps credits 1:1 with no adult conversion", () => {
    expect(creditRatioLabel()).toBe("1 credit = $1 — same for every age");
  });

  it("formats ledger deltas with a leading plus for credits", () => {
    expect(formatLedgerDelta(40)).toBe("+40");
    expect(formatLedgerDelta(-10)).toBe("-10");
    expect(formatLedgerDelta(0)).toBe("0");
  });

  it("formats ledger dates for the credits page", () => {
    expect(formatLedgerWhen("")).toBe("—");
    expect(formatLedgerWhen("not-a-date")).toBe("—");
    const labeled = formatLedgerWhen("2026-07-01T12:00:00.000Z");
    expect(labeled).not.toBe("2026-07-01T12:00:00.000Z");
    expect(labeled).toMatch(/2026/);
  });

  it("exposes the 1:1 cash-or-credits label", () => {
    expect(creditRatioLabel()).toBe("1 credit = $1 — same for every age");
  });

  it("normalizes unknown tier/audience to safe defaults", () => {
    expect(normalizeTierId("PRO")).toBe("pro");
    expect(normalizeTierId("mystery")).toBe("free");
    expect(normalizeAudience("Junior")).toBe("junior");
    expect(normalizeAudience("Teens")).toBe("junior");
    expect(normalizeAudience("teen")).toBe("junior");
    expect(normalizeAudience("")).toBe("adult");
  });

  it("computes monthly credit allowance the same for every age", () => {
    expect(monthlyKidCreditAllowance("pro", "kids")).toBe(5);
    expect(monthlyKidCreditAllowance("pro", "junior")).toBe(5);
    expect(monthlyKidCreditAllowance("pro", "adult")).toBe(5);
    expect(monthlyKidCreditAllowance("pro", "senior")).toBe(5);
    expect(monthlyKidCreditAllowance("starter", "adult")).toBe(2.5);
    expect(monthlyKidCreditAllowance("elite", "kids")).toBe(10);
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
    expect(summary.adultEquivalent).toBe(41);
    expect(summary.membershipTier).toBe("elite");
    expect(summary.audience).toBe("kids");
    expect(summary.monthlyAllowance).toBe(280);
    expect(summary.enrolledLabel).toMatch(/Elite/);
    expect(summary.totals).toEqual({ earned: 280, spent: 239, balance: 41 });
    expect(summary.recent).toHaveLength(1);
    expect(summary.creditPacks).toEqual([]);
    expect(summary.ratioLabel).toMatch(/1 credit = \$1/i);
  });

  it("maps parent audience to Kids credit pool", () => {
    const summary = summarizeMemberCredits({
      balance: 60,
      membershipTier: "starter",
      audience: "parent",
      recent: [],
    });
    expect(summary.audience).toBe("kids");
    expect(summary.monthlyAllowance).toBe(2.5);
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

  it("overlays ledger dates from the matching purchase paidAt", () => {
    const sessionId = "cs_live_b1AEAQydYierg5rRPiF1LEmIYrIUkadp7sWWGogTEqsdOr5oNoP3bwIcqo";
    const paidAt = "2026-07-15T10:00:00.000Z";
    const grantedAt = "2026-09-07T18:00:00.000Z";
    expect(
      ledgerOccurredAt(
        {
          createdAt: grantedAt,
          occurredAt: grantedAt,
          reason: `${sessionId} · Boost Pack · 25 Kid Credits`,
        },
        [{ sessionId, paidAt }],
      ),
    ).toBe(paidAt);

    const summary = summarizeMemberCredits({
      balance: 65,
      membershipTier: "starter",
      audience: "kids",
      recent: [
        {
          id: "mcl-grant",
          delta: 25,
          reason: `${sessionId} · Boost Pack · 25 Kid Credits`,
          balanceAfter: 65,
          createdAt: grantedAt,
        },
        {
          id: "mcl-plan",
          delta: 40,
          reason: "Membership plan credits: starter",
          balanceAfter: 40,
          createdAt: "2026-08-01T12:00:00.000Z",
        },
      ],
      creditPacks: [
        {
          sessionId,
          label: "Credit pack · Boost Pack",
          credits: 25,
          amountCents: 500,
          paidAt,
        },
      ],
    });
    expect(summary.recent.map((row) => row.id)).toEqual(["mcl-plan", "mcl-grant"]);
    expect(summary.recent[0]?.occurredAt).toBe("2026-08-01T12:00:00.000Z");
    expect(summary.recent[1]?.occurredAt).toBe(paidAt);
    expect(summary.recent[0]?.balanceAfter).toBe(65);
    expect(summary.recent[1]?.balanceAfter).toBe(25);
  });

  it("rebuilds running balances from credit line items even when the wallet is behind", () => {
    const rebuilt = attachLedgerRunningBalances(
      [
        {
          id: "mcl-pack",
          delta: 25,
          reason: "Boost Pack",
          balanceAfter: 90,
          createdAt: "2026-09-07T18:00:00.000Z",
          occurredAt: "2026-07-01T12:00:00.000Z",
        },
        {
          id: "mcl-plan",
          delta: 65,
          reason: "Membership plan credits: starter",
          balanceAfter: 65,
          createdAt: "2026-08-01T12:00:00.000Z",
          occurredAt: "2026-08-01T12:00:00.000Z",
        },
      ],
      90,
    );
    expect(rebuilt.map((row) => row.id)).toEqual(["mcl-plan", "mcl-pack"]);
    expect(rebuilt[0]?.balanceAfter).toBe(90);
    expect(rebuilt[1]?.delta).toBe(25);
    expect(rebuilt[1]?.balanceAfter).toBe(25);
    expect(rebuilt[0]?.balanceAfter).toBe(rebuilt[1]!.balanceAfter + rebuilt[0]!.delta);

    const odd = attachLedgerRunningBalances(
      [
        {
          id: "mcl-a",
          delta: 1,
          reason: "earn",
          balanceAfter: 1,
          createdAt: "2026-07-01T12:00:00.000Z",
        },
        {
          id: "mcl-b",
          delta: 1,
          reason: "earn",
          balanceAfter: 2,
          createdAt: "2026-07-02T12:00:00.000Z",
        },
      ],
      2,
    );
    expect(odd[0]?.id).toBe("mcl-b");
    expect(odd[0]?.balanceAfter).toBe(2);
    expect(odd[1]?.balanceAfter).toBe(1);
  });

  it("lets each credit grant add to the running total instead of clamping early rows to 0", () => {
    const rebuilt = attachLedgerRunningBalances(
      [
        { id: "b1", delta: 25, reason: "Boost Pack ×5 - 25 credits", balanceAfter: 0, createdAt: "2026-09-07T02:34:00.000Z" },
        { id: "b2", delta: 25, reason: "Boost Pack ×5 - 25 credits", balanceAfter: 0, createdAt: "2026-09-07T02:54:00.000Z" },
        { id: "b3", delta: 25, reason: "Boost Pack ×5 - 25 credits", balanceAfter: 20, createdAt: "2026-09-07T02:54:01.000Z" },
        { id: "m1", delta: 30, reason: "Membership plan credits: starter", balanceAfter: 50, createdAt: "2026-09-07T03:21:00.000Z" },
        { id: "m2", delta: 30, reason: "Membership plan credits: starter", balanceAfter: 80, createdAt: "2026-09-07T03:21:01.000Z" },
        { id: "m3", delta: 30, reason: "Membership plan credits: starter", balanceAfter: 110, createdAt: "2026-09-07T03:21:02.000Z" },
        { id: "s1", delta: -20, reason: "Launcher Pack - 20 credits", balanceAfter: 90, createdAt: "2026-09-07T04:43:00.000Z" },
      ],
      90,
    );
    expect(rebuilt.map((row) => row.id)).toEqual(["s1", "m3", "m2", "m1", "b3", "b2", "b1"]);
    expect(rebuilt.map((row) => row.balanceAfter)).toEqual([145, 165, 135, 105, 75, 50, 25]);
    expect(formatCreditCount(rebuilt[0]!.balanceAfter)).toBe("145 credits");
  });

  it("uses earned minus spent as current balance when the wallet cache is behind", () => {
    expect(ledgerNetBalance(165, 20)).toBe(145);
    const summary = summarizeMemberCredits({
      balance: 90,
      membershipTier: "starter",
      audience: "adult",
      monthlyAllowance: 5,
      totals: { earned: 165, spent: 20, balance: 90 },
      recent: [
        { id: "s1", delta: -20, reason: "Launcher Pack - 20 credits", balanceAfter: 90, createdAt: "2026-09-07T04:43:00.000Z" },
        { id: "m3", delta: 30, reason: "Starter membership credits", balanceAfter: 110, createdAt: "2026-09-07T03:21:02.000Z" },
        { id: "m2", delta: 30, reason: "Starter membership credits", balanceAfter: 80, createdAt: "2026-09-07T03:21:01.000Z" },
        { id: "m1", delta: 30, reason: "Starter membership credits", balanceAfter: 50, createdAt: "2026-09-07T03:21:00.000Z" },
        { id: "b3", delta: 25, reason: "Boost Pack", balanceAfter: 20, createdAt: "2026-09-07T02:54:01.000Z" },
        { id: "b2", delta: 25, reason: "Boost Pack", balanceAfter: 0, createdAt: "2026-09-07T02:54:00.000Z" },
        { id: "b1", delta: 25, reason: "Boost Pack", balanceAfter: 0, createdAt: "2026-09-07T02:34:00.000Z" },
      ],
    });
    expect(summary.balance).toBe(145);
    expect(summary.totals.balance).toBe(145);
    expect(summary.recent[0]?.balanceAfter).toBe(145);
    expect(summary.recent[0]?.id).toBe("s1");
    expect(
      spendableCreditBalance({
        balance: 0,
        membershipTier: "starter",
        audience: "adult",
        totals: { earned: 165, spent: 20, balance: 0 },
        recent: [],
      }),
    ).toBe(145);
  });

  it("lists the credit ledger newest first", () => {
    const summary = summarizeMemberCredits({
      balance: 50,
      membershipTier: "starter",
      audience: "kids",
      recent: [
        {
          id: "mcl-old",
          delta: 40,
          reason: "Referral bonus",
          balanceAfter: 40,
          createdAt: "2026-07-01T12:00:00.000Z",
        },
        {
          id: "mcl-new",
          delta: 10,
          reason: "Referral bonus",
          balanceAfter: 50,
          createdAt: "2026-09-01T12:00:00.000Z",
        },
      ],
    });
    expect(summary.recent.map((row) => row.id)).toEqual(["mcl-new", "mcl-old"]);
    expect(summary.recent[0]?.balanceAfter).toBe(50);
    expect(summary.recent[1]?.balanceAfter).toBe(40);
  });

  it("keeps the ledger timestamp when the purchase is missing or the paidAt is invalid", () => {
    const grantedAt = "2026-09-07T18:00:00.000Z";
    expect(
      ledgerOccurredAt(
        {
          createdAt: grantedAt,
          reason:
            "cs_live_b1AEAQydYierg5rRPiF1LEmIYrIUkadp7sWWGogTEqsdOr5oNoP3bwIcqo · Boost Pack",
        },
        [],
      ),
    ).toBe(grantedAt);
    expect(
      ledgerOccurredAt(
        { createdAt: grantedAt, reason: "Referral bonus" },
        [{ sessionId: "cs_live_other", paidAt: "2026-07-01T12:00:00.000Z" }],
      ),
    ).toBe(grantedAt);
    expect(
      ledgerOccurredAt(
        {
          createdAt: grantedAt,
          reason:
            "cs_live_b1AEAQydYierg5rRPiF1LEmIYrIUkadp7sWWGogTEqsdOr5oNoP3bwIcqo · Boost Pack",
        },
        [
          {
            sessionId: "cs_live_b1AEAQydYierg5rRPiF1LEmIYrIUkadp7sWWGogTEqsdOr5oNoP3bwIcqo",
            paidAt: "not-a-date",
          },
        ],
      ),
    ).toBe(grantedAt);
  });
});
