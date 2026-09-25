import { describe, expect, it } from "vitest";
import {
  INTERNAL_CREDITS_MAX,
  INTERNAL_CREDITS_REASON,
  INTERNAL_CREDITS_REMOVED_REASON,
  internalCreditDelta,
  internalCreditReason,
  internalCreditUserOptionLabel,
  parseInternalCreditAction,
  parseInternalCreditGrant,
  sortUsersForInternalCreditGrant,
} from "../internal-credits";

describe("parseInternalCreditGrant", () => {
  it("accepts a member email and whole credits", () => {
    expect(
      parseInternalCreditGrant({ email: "nonnegotiation@gmail.com", credits: 100 }),
    ).toEqual({
      ok: true,
      email: "nonnegotiation@gmail.com",
      credits: 100,
      action: "add",
    });
  });

  it("canonicalizes email casing", () => {
    const parsed = parseInternalCreditGrant({
      email: "  NonNegotiation@Gmail.com ",
      credits: 5,
    });
    expect(parsed).toEqual({
      ok: true,
      email: "nonnegotiation@gmail.com",
      credits: 5,
      action: "add",
    });
  });

  it("accepts an explicit remove action with a positive amount", () => {
    expect(
      parseInternalCreditGrant({
        email: "member@example.com",
        credits: 25,
        action: "remove",
      }),
    ).toEqual({
      ok: true,
      email: "member@example.com",
      credits: 25,
      action: "remove",
    });
    expect(internalCreditDelta(25, "remove")).toBe(-25);
    expect(internalCreditReason("remove")).toBe(INTERNAL_CREDITS_REMOVED_REASON);
    expect(parseInternalCreditAction("remove")).toBe("remove");
  });

  it("rejects missing or invalid email", () => {
    expect(parseInternalCreditGrant(null).ok).toBe(false);
    expect(parseInternalCreditGrant({ credits: 10 }).ok).toBe(false);
    expect(parseInternalCreditGrant({ email: "not-an-email", credits: 10 }).ok).toBe(false);
    expect(parseInternalCreditGrant({ email: "", credits: 10 }).ok).toBe(false);
  });

  it("rejects zero, negative, fractional, oversized amounts, and bad actions", () => {
    expect(parseInternalCreditGrant({ email: "a@b.com", credits: 0 }).ok).toBe(false);
    expect(parseInternalCreditGrant({ email: "a@b.com", credits: -5 }).ok).toBe(false);
    expect(parseInternalCreditGrant({ email: "a@b.com", credits: 1.5 }).ok).toBe(false);
    expect(
      parseInternalCreditGrant({ email: "a@b.com", credits: INTERNAL_CREDITS_MAX + 1 }).ok,
    ).toBe(false);
    expect(parseInternalCreditGrant({ email: "a@b.com", credits: 5, action: "gift" }).ok).toBe(
      false,
    );
  });
});

describe("Internal Credits ledger copy", () => {
  it("shows add and remove reasons on the member ledger", () => {
    expect(INTERNAL_CREDITS_REASON).toBe("Internal Credits Added");
    expect(INTERNAL_CREDITS_REMOVED_REASON).toBe("Internal Credits Removed");
  });
});

describe("internal credit user dropdown", () => {
  it("labels members with name, email, and wallet balance", () => {
    expect(
      internalCreditUserOptionLabel({ name: "Jordan Lee", email: "jordan@example.com" }),
    ).toBe("Jordan Lee — jordan@example.com");
    expect(
      internalCreditUserOptionLabel({
        name: "Jordan Lee",
        email: "jordan@example.com",
        creditBalance: 40,
      }),
    ).toBe("Jordan Lee — jordan@example.com · 40 Kid Credits");
    expect(internalCreditUserOptionLabel({ name: "", email: "solo@example.com" })).toBe(
      "solo@example.com",
    );
  });

  it("sorts members by name then email", () => {
    const sorted = sortUsersForInternalCreditGrant([
      { name: "Zed", email: "zed@example.com" },
      { name: "Ann", email: "b@example.com" },
      { name: "Ann", email: "a@example.com" },
    ]);
    expect(sorted.map((u) => u.email)).toEqual([
      "a@example.com",
      "b@example.com",
      "zed@example.com",
    ]);
  });
});
