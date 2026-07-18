import { describe, expect, it } from "vitest";
import { BENCHMARK_WIZARD_TESTS } from "@/lib/benchmark-wizard-tests";

describe("benchmark-wizard-tests", () => {
  it("assigns all benchmark wizard QA cases to Lyriq", () => {
    expect(BENCHMARK_WIZARD_TESTS.length).toBeGreaterThan(0);
    for (const test of BENCHMARK_WIZARD_TESTS) {
      expect(test.assignee).toBe("Lyriq");
      expect(test.id).toMatch(/^BM-/);
    }
  });

  it("includes referral and admin competitor-scouting coverage", () => {
    const ids = BENCHMARK_WIZARD_TESTS.map((t) => t.id);
    expect(ids).toContain("BM-005");
    expect(ids).toContain("BM-008");
    expect(ids).toContain("BM-009");
  });
});
