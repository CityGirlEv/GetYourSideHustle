import { describe, expect, it } from "vitest";
import { partnerEnsurePlan } from "../../../functions/_lib/partner-ensure-plan";

describe("partnerEnsurePlan", () => {
  it("inserts when the partner row is missing", () => {
    expect(partnerEnsurePlan(null)).toEqual({ action: "insert" });
  });

  it("backfills password when the row exists without a hash", () => {
    expect(partnerEnsurePlan({ password_hash: null })).toEqual({
      action: "backfill-password",
    });
    expect(partnerEnsurePlan({ password_hash: "" })).toEqual({
      action: "backfill-password",
    });
  });

  it("never overwrites roles for an existing partner with a password", () => {
    expect(partnerEnsurePlan({ password_hash: "abc" })).toEqual({ action: "noop" });
  });
});
