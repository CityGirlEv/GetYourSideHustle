import { describe, expect, it } from "vitest";
import {
  formatUsd,
  LEAD_PAY_AS_YOU_GO,
  LEAD_SUBSCRIPTION_PRICING,
} from "@/lib/lead-pricing";

describe("lead-pricing", () => {
  it("formats USD for whole and fractional amounts", () => {
    expect(formatUsd(100)).toBe("$100");
    expect(formatUsd(7.5)).toBe("$7.50");
  });

  it("defines subscription intro and regular tiers", () => {
    expect(LEAD_SUBSCRIPTION_PRICING.regular.monthlyFee).toBe(100);
    expect(LEAD_SUBSCRIPTION_PRICING.introductory.monthlyFee).toBe(60);
    expect(LEAD_SUBSCRIPTION_PRICING.includedLeadsPerMonth).toBe(8);
    expect(LEAD_SUBSCRIPTION_PRICING.minimumTermMonths).toBe(3);
  });

  it("defines pay-as-you-go bundles", () => {
    expect(LEAD_PAY_AS_YOU_GO).toEqual([
      { leads: 1, price: 40 },
      { leads: 2, price: 75 },
      { leads: 3, price: 100 },
    ]);
  });
});
