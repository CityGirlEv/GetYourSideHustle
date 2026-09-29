import { describe, expect, it } from "vitest";
import {
  checkoutIdempotencyToken,
  likeContainsPattern,
  sqliteLikePatternIsUnsafe,
  SQL_TEXT_CONTAINS,
  SQL_TEXT_STARTS_WITH,
} from "../d1-sql";

describe("d1 SQL LIKE vs instr", () => {
  const stripeLive =
    "cs_live_b1AEAQydYierg5rRPiF1LEmIYrIUkadp7sWWGogTEqsdOr5oNoP3bwIcqo";
  const stripeTest = "cs_test_a1B2c3D4e5F6g7H8";

  it("flags Stripe session LIKE %id% patterns as unsafe", () => {
    expect(sqliteLikePatternIsUnsafe(likeContainsPattern(stripeLive))).toBe(true);
    expect(sqliteLikePatternIsUnsafe(likeContainsPattern(stripeTest))).toBe(true);
    expect(sqliteLikePatternIsUnsafe(likeContainsPattern("cs_live"))).toBe(true);
  });

  it("allows a simple prefix LIKE without underscores", () => {
    expect(sqliteLikePatternIsUnsafe("Membership plan credits%")).toBe(false);
    expect(sqliteLikePatternIsUnsafe(likeContainsPattern("cred-u-ev-abc"))).toBe(false);
  });

  it("extracts full Stripe and cred- tokens from ledger reasons", () => {
    expect(
      checkoutIdempotencyToken(`Boost Pack · 25 Kid Credits · ${stripeLive}`),
    ).toBe(stripeLive);
    expect(checkoutIdempotencyToken(`Checkout · 20 Kid Credits · ${stripeTest}`)).toBe(
      stripeTest,
    );
    expect(
      checkoutIdempotencyToken(
        "Story Time · 20 Kid Credits · cred-u-550e8400-e29b-41d4-a716-446655440000-mabc",
      ),
    ).toBe("cred-u-550e8400-e29b-41d4-a716-446655440000-mabc");
    expect(checkoutIdempotencyToken("")).toBeNull();
  });

  it("uses instr for ledger lookups instead of LIKE", () => {
    expect(SQL_TEXT_CONTAINS).toMatch(/instr\(reason, \?\) > 0/);
    expect(SQL_TEXT_STARTS_WITH).toMatch(/instr\(reason, \?\) = 1/);
    expect(SQL_TEXT_CONTAINS).not.toMatch(/LIKE/i);
    expect(SQL_TEXT_STARTS_WITH).not.toMatch(/LIKE/i);
  });
});
