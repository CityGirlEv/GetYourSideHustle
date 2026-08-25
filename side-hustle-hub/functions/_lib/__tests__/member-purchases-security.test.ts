import { describe, expect, it } from "vitest";
import { filterPaymentsForMember, paymentBelongsToMember } from "../stripe-payments";
import { planKidCreditAllowance } from "../member-credits";

describe("member purchase security scope", () => {
  const me = { userId: "u-me", email: "me@example.com" };

  it("matches by user id", () => {
    expect(paymentBelongsToMember({ userId: "u-me", email: "other@x.com" }, me)).toBe(true);
  });

  it("matches by canonical email when user id missing", () => {
    expect(paymentBelongsToMember({ userId: null, email: "ME@Example.com" }, me)).toBe(true);
  });

  it("rejects other members' payments", () => {
    expect(
      paymentBelongsToMember({ userId: "u-other", email: "other@example.com" }, me),
    ).toBe(false);
  });

  it("filters mixed ledgers down to the signed-in member only", () => {
    const rows = [
      { id: "1", userId: "u-me", email: "me@example.com" },
      { id: "2", userId: "u-hacker", email: "hacker@evil.com" },
      { id: "3", userId: null, email: "me@example.com" },
      { id: "4", userId: null, email: "someoneelse@example.com" },
    ];
    const mine = filterPaymentsForMember(rows, me);
    expect(mine.map((r) => r.id)).toEqual(["1", "3"]);
  });
});

describe("plan credit enrollment grants", () => {
  it("does not invent credits for Free", () => {
    expect(planKidCreditAllowance("free", "kids")).toBe(0);
    expect(planKidCreditAllowance("free", "adult")).toBe(0);
  });

  it("seeds youth vs adult pool amounts by lane", () => {
    expect(planKidCreditAllowance("starter", "parent")).toBe(60);
    expect(planKidCreditAllowance("starter", "adult")).toBe(30);
    expect(planKidCreditAllowance("pro", "senior")).toBe(60);
  });
});
