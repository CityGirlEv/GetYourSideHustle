import { describe, expect, it } from "vitest";
import { TEST_CASES, testerCaseCount } from "../gysh-test-plan";

describe("gysh-test-plan", () => {
  const manualCases = TEST_CASES.filter((t) => (t.suite ?? "manual") === "manual");

  it("assigns every manual case to Tina, Evelyn, and/or Lyriq", () => {
    for (const t of manualCases) {
      expect(t.assignees.length).toBeGreaterThan(0);
      expect(t.suite).toBe("manual");
      for (const a of t.assignees) {
        expect(["tina", "evelyn", "lyriq"]).toContain(a);
      }
    }
  });

  it("splits manual cases across testers", () => {
    expect(testerCaseCount("tina", manualCases)).toBeGreaterThan(0);
    expect(testerCaseCount("evelyn", manualCases)).toBeGreaterThan(0);
    expect(manualCases.length).toBeGreaterThan(0);
  });

  it("has unique test IDs", () => {
    const ids = TEST_CASES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
