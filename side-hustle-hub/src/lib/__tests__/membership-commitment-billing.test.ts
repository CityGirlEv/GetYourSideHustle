import { describe, expect, it } from "vitest";
import {
  MEMBERSHIP_COMMITMENT_MONTHS,
  membershipAdvanceBillingNoteCopy,
  membershipCheckoutDueLabel,
  membershipCommitmentLineItemName,
  membershipDueNowUsd,
  membershipRecurringTrialEndUnix,
} from "../membership-commitment-billing";

describe("membership commitment billing", () => {
  it("charges 3 months upfront for monthly plans", () => {
    expect(MEMBERSHIP_COMMITMENT_MONTHS).toBe(3);
    expect(membershipDueNowUsd("month", 39)).toBe(117);
    expect(membershipDueNowUsd("month", 34)).toBe(102);
    expect(membershipDueNowUsd("year", 390)).toBe(390);
  });

  it("sets recurring trial end about 3 months out", () => {
    const now = Date.UTC(2026, 0, 15, 12, 0, 0); // Jan 15 2026
    const trialEnd = membershipRecurringTrialEndUnix(now);
    const end = new Date(trialEnd * 1000);
    expect(end.getUTCFullYear()).toBe(2026);
    expect(end.getUTCMonth()).toBe(3); // April = month 4
    expect(end.getUTCDate()).toBe(15);
  });

  it("labels checkout and advance-billing copy for the commitment", () => {
    expect(membershipCommitmentLineItemName("Starter Adults Monthly")).toMatch(
      /3-month commitment \(prepaid\)/i,
    );
    expect(membershipAdvanceBillingNoteCopy()).toMatch(/3-month commitment/i);
    expect(membershipAdvanceBillingNoteCopy()).toMatch(/month 4/i);
    expect(
      membershipCheckoutDueLabel({
        interval: "month",
        monthlyUsd: 39,
        yearlyUsd: 390,
        formatUsd: (n) => `$${n}`,
      }),
    ).toBe("$117 for 3 months, then $39 / mo");
    expect(
      membershipCheckoutDueLabel({
        interval: "year",
        monthlyUsd: 39,
        yearlyUsd: 390,
        formatUsd: (n) => `$${n}`,
      }),
    ).toBe("$390 / yr");
  });
});
