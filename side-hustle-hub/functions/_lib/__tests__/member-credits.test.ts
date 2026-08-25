import { describe, expect, it } from "vitest";
import { planKidCreditAllowance } from "../member-credits";

describe("planKidCreditAllowance", () => {
  it("uses youth monthly for Kids / Teens / parent accounts", () => {
    expect(planKidCreditAllowance("starter", "kids")).toBe(60);
    expect(planKidCreditAllowance("pro", "junior")).toBe(140);
    expect(planKidCreditAllowance("elite", "parent")).toBe(280);
  });

  it("uses Adult/Senior family pool amounts", () => {
    expect(planKidCreditAllowance("starter", "adult")).toBe(30);
    expect(planKidCreditAllowance("pro", "senior")).toBe(60);
    expect(planKidCreditAllowance("free", "adult")).toBe(0);
  });
});
