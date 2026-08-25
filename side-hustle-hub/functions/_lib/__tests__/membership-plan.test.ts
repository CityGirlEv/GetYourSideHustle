import { describe, expect, it } from "vitest";
import { parseMembershipPlanUpdate } from "../auth";

describe("parseMembershipPlanUpdate", () => {
  it("accepts valid tier + audience", () => {
    expect(parseMembershipPlanUpdate({ membershipTier: "Starter", audience: "Adult" })).toEqual({
      ok: true,
      membershipTier: "starter",
      audience: "adult",
    });
  });

  it("rejects invalid tier", () => {
    expect(parseMembershipPlanUpdate({ membershipTier: "gold", audience: "adult" })).toEqual({
      ok: false,
      error: "Choose Free, Starter, Pro, or Elite.",
    });
  });

  it("rejects invalid audience", () => {
    expect(parseMembershipPlanUpdate({ membershipTier: "pro", audience: "teens" })).toEqual({
      ok: false,
      error: "Choose Kids, Teens, Adults, or Seniors.",
    });
  });
});
