import { describe, expect, it } from "vitest";
import { isNewQaRetestTransition, isQaRetestStatus } from "../qa-test-assignment.server";

describe("qa-test-assignment.server", () => {
  it("identifies QA retest statuses", () => {
    expect(isQaRetestStatus("fixed_retest")).toBe(true);
    expect(isQaRetestStatus("failed_retest")).toBe(true);
    expect(isQaRetestStatus("fail")).toBe(false);
    expect(isQaRetestStatus("pass")).toBe(false);
  });

  it("fires only on transition into fixed_retest or failed_retest", () => {
    expect(isNewQaRetestTransition("fail", "fixed_retest")).toBe(true);
    expect(isNewQaRetestTransition("in_progress", "failed_retest")).toBe(true);
    expect(isNewQaRetestTransition("fixed_retest", "fixed_retest")).toBe(false);
    expect(isNewQaRetestTransition("fixed_retest", "failed_retest")).toBe(true);
    expect(isNewQaRetestTransition("pass", "pass")).toBe(false);
  });
});
