import { describe, expect, it } from "vitest";
import { planKidCreditAllowance } from "../member-credits";

describe("planKidCreditAllowance", () => {
  it("uses the same monthly credits for every age", () => {
    expect(planKidCreditAllowance("starter", "kids")).toBe(2.5);
    expect(planKidCreditAllowance("pro", "junior")).toBe(5);
    expect(planKidCreditAllowance("elite", "parent")).toBe(10);
  });

  it("uses Adult/Senior family pool amounts", () => {
    expect(planKidCreditAllowance("starter", "adult")).toBe(2.5);
    expect(planKidCreditAllowance("pro", "senior")).toBe(5);
    expect(planKidCreditAllowance("free", "adult")).toBe(0);
  });
});
