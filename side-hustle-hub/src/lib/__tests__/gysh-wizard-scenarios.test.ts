import { describe, expect, it } from "vitest";
import {
  TEST_CASES,
  testerCaseCount,
  categoryForCase,
  facingForCase,
  TEST_FACINGS,
} from "../gysh-test-plan";
import {
  WIZARD_SCENARIO_CASES,
  wizardScenarioStats,
  balanceWizardAssignees,
} from "../gysh-wizard-scenarios";
import { isAutomatedTestId } from "../gysh-automated-tests";

describe("gysh-test-plan", () => {
  const manualCases = TEST_CASES.filter((t) => (t.suite ?? "manual") === "manual");

  it("assigns every manual case to T / E / Lyriq, or leaves Unassigned (empty)", () => {
    for (const t of manualCases) {
      for (const a of t.assignees) {
        expect(["tina", "evelyn", "lyriq"]).toContain(a);
      }
    }
  });

  it("keeps proofread cases as Tina/Lyriq pairs in Sprint 1", async () => {
    const { suggestedSprintForTest } = await import("../gysh-sprint-board");
    const { proofreadLogicalId } = await import("../gysh-proofread-cases");
    const proof = TEST_CASES.filter((t) => t.id.startsWith("PROOF-"));
    expect(proof.length).toBeGreaterThan(20);
    expect(proof.length % 2).toBe(0);
    for (const t of proof) {
      expect(t.id).toMatch(/^PROOF-\d{3}-(TINA|LYRIQ)$/);
      expect(t.assignees).toHaveLength(1);
      expect(["tina", "lyriq"]).toContain(t.assignees[0]);
      expect(t.area).toBe("Proofread");
      expect(suggestedSprintForTest(t)).toBe(1);
      expect(facingForCase(t)).toBe("external");
    }
    const logical = new Set(proof.map((t) => proofreadLogicalId(t.id)));
    expect(logical.size).toBe(proof.length / 2);
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

  it("maps every case to External or Internal", () => {
    for (const t of TEST_CASES) {
      expect(TEST_FACINGS).toContain(facingForCase(t));
    }
  });

  it("classifies Admin / Schedule / suite runners as Internal", () => {
    expect(facingForCase({ id: "ADMIN-001", area: "Admin", suite: "manual" })).toBe("internal");
    expect(facingForCase({ id: "ADMIN-005", area: "Schedule", suite: "manual" })).toBe("internal");
    expect(facingForCase({ id: "AUTH-001", area: "Auth", suite: "manual" })).toBe("internal");
  });

  it("classifies public pages and wizards as External", () => {
    expect(facingForCase({ id: "ABOUT-001", area: "About", suite: "manual" })).toBe("external");
    expect(facingForCase({ id: "GUIDE-001", area: "Free Guides", suite: "manual" })).toBe("external");
    expect(facingForCase({ id: "NAV-001", area: "Navigation", suite: "manual" })).toBe("external");
    expect(facingForCase({ id: "AUTH-002", area: "Auth", suite: "manual" })).toBe("external");
  });
});

describe("gysh-wizard-scenarios", () => {
  const stats = wizardScenarioStats();

  it("covers every kids and junior full path (108 each)", () => {
    expect(stats.byWizard["Kids Get Your Side Hustle"]).toBe(108);
    expect(stats.byWizard["Teens Get Your Side Hustle"]).toBe(108);
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
