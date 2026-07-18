import { describe, expect, it } from "vitest";
import { TEST_CASES, testerCaseCount, categoryForCase } from "../gysh-test-plan";
import {
  WIZARD_SCENARIO_CASES,
  wizardScenarioStats,
  balanceWizardAssignees,
} from "../gysh-wizard-scenarios";
import { isAutomatedTestId } from "../gysh-automated-tests";

describe("gysh-test-plan", () => {
  it("assigns every case to at least one of T / E / Lyriq", () => {
    for (const t of TEST_CASES) {
      expect(t.assignees.length).toBeGreaterThan(0);
      for (const a of t.assignees) {
        expect(["tina", "evelyn", "lyriq"]).toContain(a);
      }
    }
  });

  it("splits cases across all three testers", () => {
    expect(testerCaseCount("tina", TEST_CASES)).toBeGreaterThan(0);
    expect(testerCaseCount("evelyn", TEST_CASES)).toBeGreaterThan(0);
    expect(testerCaseCount("lyriq", TEST_CASES)).toBeGreaterThan(0);
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

  it("assigns 100% of Kids + Junior scenarios to Lyriq", () => {
    const kidsJunior = WIZARD_SCENARIO_CASES.filter(
      (c) =>
        c.area === "Kids Get Your Side Hustle" ||
        c.area === "Junior Get Your Side Hustle",
    );
    expect(kidsJunior.length).toBe(216);
    for (const c of kidsJunior) {
      expect(c.assignees).toEqual(["lyriq"]);
    }
  });

  it("splits adult/senior ownership across Tina, Evelyn, and Lyriq", () => {
    expect(stats.tina).toBeGreaterThan(0);
    expect(stats.evelyn).toBeGreaterThan(0);
    expect(stats.lyriq).toBeGreaterThanOrEqual(216);
    expect(stats.tina + stats.evelyn + stats.lyriq).toBe(stats.total);
  });

  it("balanceWizardAssignees keeps kids/junior on Lyriq and suites as vitest", () => {
    const kids = WIZARD_SCENARIO_CASES.filter(
      (c) => c.area === "Kids Get Your Side Hustle",
    ).slice(0, 10);
    const fewAdult = WIZARD_SCENARIO_CASES.filter((c) => c.area === "Adult Get Your Side Hustle").slice(
      0,
      6,
    );
    const balanced = balanceWizardAssignees(kids, fewAdult);
    expect(balanced.filter((c) => c.area === "Kids Get Your Side Hustle").every((c) => c.assignees[0] === "lyriq")).toBe(
      true,
    );
    expect(balanced.every((c) => c.suite === "vitest")).toBe(true);
  });
});
