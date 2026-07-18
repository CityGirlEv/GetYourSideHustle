import { describe, expect, it } from "vitest";
import { TEST_CASES, testerCaseCount, categoryForCase } from "../gysh-test-plan";
import {
  WIZARD_SCENARIO_CASES,
  wizardScenarioStats,
  balanceWizardAssignees,
} from "../gysh-wizard-scenarios";
import { isAutomatedTestId } from "../gysh-automated-tests";

describe("gysh-test-plan", () => {
  const manualCases = TEST_CASES.filter((t) => (t.suite ?? "manual") === "manual");

  it("assigns every manual case to at least one of T / E / Lyriq", () => {
    for (const t of manualCases) {
      expect(t.assignees.length).toBeGreaterThan(0);
      for (const a of t.assignees) {
        expect(["tina", "evelyn", "lyriq"]).toContain(a);
      }
    }
  });

  it("splits manual cases across all three testers", () => {
    expect(testerCaseCount("tina", manualCases)).toBeGreaterThan(0);
    expect(testerCaseCount("evelyn", manualCases)).toBeGreaterThan(0);
    expect(testerCaseCount("lyriq", manualCases)).toBeGreaterThan(0);
  });

  it("has unique test IDs", () => {
    const ids = TEST_CASES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("maps every case to a known category", () => {
    for (const t of TEST_CASES) {
      expect(categoryForCase(t)).toBeTruthy();
    }
  });
});

describe("gysh-wizard-scenarios", () => {
  const stats = wizardScenarioStats();

  it("covers every kids and junior full path (108 each)", () => {
    expect(stats.byWizard["Kids Get Your Side Hustle"]).toBe(108);
    expect(stats.byWizard["Junior Get Your Side Hustle"]).toBe(108);
  });

  it("covers adult budget×time×skill×goal paths (378)", () => {
    expect(stats.adult).toBe(3 * 3 * 6 * 7);
  });

  it("covers senior lifestyle×availability×skill×goal paths (378)", () => {
    expect(stats.senior).toBe(3 * 3 * 7 * 6);
  });

  it("marks all wizard scenarios as automated vitest suite", () => {
    for (const c of WIZARD_SCENARIO_CASES) {
      expect(c.suite).toBe("vitest");
      expect(isAutomatedTestId(c.id)).toBe(true);
    }
  });

  it("assigns 100% of wizard scenarios to the Vitest QA Runner", () => {
    expect(stats.vitest).toBe(stats.total);
    for (const c of WIZARD_SCENARIO_CASES) {
      expect(c.assignees).toEqual(["vitest"]);
    }
  });

  it("balanceWizardAssignees keeps suite as vitest with Vitest owner", () => {
    const kids = WIZARD_SCENARIO_CASES.filter(
      (c) => c.area === "Kids Get Your Side Hustle",
    ).slice(0, 10);
    const fewAdult = WIZARD_SCENARIO_CASES.filter((c) => c.area === "Adult Get Your Side Hustle").slice(
      0,
      6,
    );
    const balanced = balanceWizardAssignees(kids, fewAdult);
    expect(balanced.every((c) => c.assignees[0] === "vitest")).toBe(true);
    expect(balanced.every((c) => c.suite === "vitest")).toBe(true);
  });
});
