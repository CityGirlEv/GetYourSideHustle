import { describe, expect, it } from "vitest";
import {
  INTERNAL_CREDITS_MAX,
  INTERNAL_CREDITS_REASON,
  internalCreditUserOptionLabel,
  parseInternalCreditGrant,
  sortUsersForInternalCreditGrant,
} from "../internal-credits";
import { formatLedgerReason } from "../credit-pack-purchase";

describe("parseInternalCreditGrant", () => {
  it("accepts a parent email and whole credits", () => {
    expect(
      parseInternalCreditGrant({ email: "nonnegotiation@gmail.com", credits: 100 }),
    ).toEqual({
      ok: true,
      email: "nonnegotiation@gmail.com",
      credits: 100,
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
    });
  });

  it("rejects missing or invalid email", () => {
    expect(parseInternalCreditGrant(null).ok).toBe(false);
    expect(parseInternalCreditGrant({ credits: 10 }).ok).toBe(false);
    expect(parseInternalCreditGrant({ email: "not-an-email", credits: 10 }).ok).toBe(false);
    expect(parseInternalCreditGrant({ email: "", credits: 10 }).ok).toBe(false);
  });

  it("rejects zero, negative, fractional, and oversized amounts", () => {
    expect(parseInternalCreditGrant({ email: "a@b.com", credits: 0 }).ok).toBe(false);
    expect(parseInternalCreditGrant({ email: "a@b.com", credits: -5 }).ok).toBe(false);
    expect(parseInternalCreditGrant({ email: "a@b.com", credits: 1.5 }).ok).toBe(false);
    expect(
      parseInternalCreditGrant({ email: "a@b.com", credits: INTERNAL_CREDITS_MAX + 1 }).ok,
    ).toBe(false);
  });
});

describe("Internal Credits Added ledger copy", () => {
  it("shows Internal Credits Added on the member ledger", () => {
    expect(INTERNAL_CREDITS_REASON).toBe("Internal Credits Added");
    expect(formatLedgerReason(INTERNAL_CREDITS_REASON)).toBe("Internal Credits Added");
  });
});

describe("internal credit user dropdown", () => {
  it("labels members with name and email", () => {
    expect(
      internalCreditUserOptionLabel({ name: "Jordan Lee", email: "jordan@example.com" }),
    ).toBe("Jordan Lee — jordan@example.com");
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
