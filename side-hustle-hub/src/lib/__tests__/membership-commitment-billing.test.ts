import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MEMBERSHIP_COMMITMENT_MONTHS,
  membershipAdvanceBillingNoteCopy,
  membershipBillingCadenceLabel,
  membershipCheckoutDueLabel,
  membershipCommitmentLineItemName,
  membershipDueNowUsd,
  membershipJoinDueUsd,
  membershipJoinIntervalRadioLabel,
  membershipQuarterlyUsd,
} from "../membership-commitment-billing";

describe("membership commitment billing", () => {
  it("bills every 3 months from the monthly sticker price", () => {
    expect(MEMBERSHIP_COMMITMENT_MONTHS).toBe(3);
    expect(membershipQuarterlyUsd(39)).toBe(117);
    expect(membershipQuarterlyUsd(34)).toBe(102);
    expect(membershipDueNowUsd("month", 117)).toBe(117);
    expect(membershipDueNowUsd("year", 390)).toBe(390);
    expect(membershipJoinDueUsd("month", 39, 390)).toBe(117);
    expect(membershipJoinDueUsd("year", 39, 390)).toBe(390);
    expect(membershipBillingCadenceLabel("month")).toBe("every 3 months");
    expect(membershipBillingCadenceLabel("year")).toBe("yearly");
  });

  it("labels checkout and advance-billing copy for quarterly Stripe charges", () => {
    expect(membershipCommitmentLineItemName("Starter Adults")).toMatch(/every 3 months/i);
    expect(membershipAdvanceBillingNoteCopy()).toMatch(/every 3 months/i);
    expect(membershipAdvanceBillingNoteCopy()).not.toMatch(/month 4/i);
    expect(
      membershipCheckoutDueLabel({
        interval: "month",
        monthlyUsd: 39,
        yearlyUsd: 390,
        formatUsd: (n) => `$${n}`,
      }),
    ).toBe("$117 every 3 months");
    expect(
      membershipCheckoutDueLabel({
        interval: "year",
        monthlyUsd: 39,
        yearlyUsd: 390,
        formatUsd: (n) => `$${n}`,
      }),
    ).toBe("$390 / yr");
    expect(
      membershipJoinIntervalRadioLabel({
        interval: "month",
        monthlyUsd: 39,
        yearlyUsd: 390,
        formatUsd: (n) => `$${n}`,
      }),
    ).toBe("Every 3 months — $117");
    expect(
      membershipJoinIntervalRadioLabel({
        interval: "year",
        monthlyUsd: 39,
        yearlyUsd: 390,
        yearlySaveUsd: 78,
        formatUsd: (n) => `$${n}`,
      }),
    ).toBe("Yearly — $390 / yr (save $78)");
  });

  it("syncs Stripe membership prices as every 3 months, not monthly", () => {
    const script = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../../scripts/sync-stripe-catalog.mjs"),
      "utf8",
    );
    expect(script).toMatch(/interval_count:\s*3/);
    expect(script).toMatch(/monthly \* 3/);
    expect(script).toMatch(/gysh_interval: interval === "month" \? "quarter"/);
  });
});
