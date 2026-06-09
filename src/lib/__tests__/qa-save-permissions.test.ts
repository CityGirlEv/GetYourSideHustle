import { describe, expect, it } from "vitest";
import { canSaveTestResults, getTestResultSaveBlockReason } from "@/lib/qa-save-permissions";

describe("qa-save-permissions", () => {
  it("allows QA and admin users to save test results", () => {
    expect(canSaveTestResults({ role: "qa" })).toBe(true);
    expect(canSaveTestResults({ role: "admin" })).toBe(true);
    expect(getTestResultSaveBlockReason({ role: "qa" })).toBeNull();
  });

  it("blocks anonymous and non-QA users from saving test results", () => {
    expect(canSaveTestResults(null)).toBe(false);
    expect(canSaveTestResults({ role: "viewer" })).toBe(false);
    expect(getTestResultSaveBlockReason(null)).toMatch(/Sign in/);
    expect(getTestResultSaveBlockReason({ role: "viewer" })).toMatch(/Only QA or admin/);
  });
});