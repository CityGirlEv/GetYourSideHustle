import { describe, expect, it } from "vitest";
import {
  TEST_CASES,
  TEST_CATEGORIES,
  categoryForCase,
  facingForCase,
  healNotStartedTouchedTests,
  nextKeyedMap,
  notStartedTestAlreadyTouched,
  shouldAutoStartTestOnFirstTouch,
  testerCaseCount,
} from "../gysh-test-plan";

describe("gysh-test-plan", () => {
  const manualCases = TEST_CASES.filter((t) => (t.suite ?? "manual") === "manual");

  it("splits former Content into ProofRead / Website / Facebook / Contact (Workshops stays separate)", () => {
    expect(TEST_CATEGORIES).toContain("guides");
    expect(TEST_CATEGORIES).toContain("workshops");
    expect(TEST_CATEGORIES).toContain("proofread");
    expect(TEST_CATEGORIES).toContain("website");
    expect(TEST_CATEGORIES).toContain("facebook");
    expect(TEST_CATEGORIES).toContain("personal_amplify");
    expect(TEST_CATEGORIES).toContain("contact");
    expect(TEST_CATEGORIES).not.toContain("content_workshops");

    expect(
      categoryForCase({
        id: "GEN-AMPLIFY-TINA",
        area: "Facebook",
        suite: "manual",
        title: "Personal amplify — Why GYSH (Tina)",
      }),
    ).toBe("personal_amplify");
    expect(
      categoryForCase({
        id: "SL-PERSONAL-AMPLIFY-001",
        area: "Content",
        suite: "manual",
        title: "Confirm personal share URL",
      }),
    ).toBe("personal_amplify");

    const workshopCases = TEST_CASES.filter((t) => t.area === "Workshops");
    expect(workshopCases.length).toBeGreaterThan(0);
    for (const t of workshopCases) {
      expect(categoryForCase(t)).toBe("workshops");
    }

    const proofreadCases = TEST_CASES.filter((t) => t.area === "Proofread");
    expect(proofreadCases.length).toBeGreaterThan(0);
    for (const t of proofreadCases) {
      expect(categoryForCase(t)).toBe("proofread");
    }

    expect(categoryForCase({ area: "Contact", suite: "manual", id: "CONTACT-001" })).toBe("contact");
    expect(categoryForCase({ area: "Guides", suite: "manual", id: "GUIDE-001" })).toBe("guides");
    expect(
      categoryForCase({
        area: "Guides",
        suite: "manual",
        id: "GUIDE-REV-launch-handyman",
      }),
    ).toBe("guides");
    expect(
      categoryForCase({
        area: "Guides",
        suite: "vitest",
        id: "VT-GUIDES-REVIEW",
      }),
    ).toBe("guides");
    expect(categoryForCase({ area: "About", suite: "manual", id: "ABOUT-001" })).toBe("website");
    expect(categoryForCase({ area: "Community", suite: "manual", id: "COMM-001" })).toBe("website");
    expect(categoryForCase({ area: "Family Coach", suite: "manual", id: "FAMILY-001" })).toBe(
      "website",
    );
    expect(categoryForCase({ area: "Facebook", suite: "manual", id: "FB-001" })).toBe("facebook");
    expect(
      categoryForCase({ area: "Proofread", suite: "manual", id: "PROOF-005-TINA" }),
    ).toBe("proofread");

    // Residual Content bucket should stay empty once content areas are retagged.
    const residualContent = TEST_CASES.filter((t) => categoryForCase(t) === "content");
    expect(residualContent).toHaveLength(0);
  });

  it("assigns every manual case to a human QA tester or leaves Unassigned", () => {
    for (const t of manualCases) {
      expect(t.suite).toBe("manual");
      if (t.assignees.length === 0) {
        expect(t.id.startsWith("STRIPE-")).toBe(true);
        continue;
      }
      expect(t.assignees.length).toBeGreaterThan(0);
      for (const a of t.assignees) {
        expect(["tina", "evelyn", "lyriq", "candace"]).toContain(a);
      }
    }
  });

  it("splits manual cases across testers", () => {
    expect(testerCaseCount("tina", manualCases)).toBeGreaterThan(0);
    expect(testerCaseCount("evelyn", manualCases)).toBeGreaterThan(0);
    expect(testerCaseCount("lyriq", manualCases)).toBeGreaterThan(0);
    expect(testerCaseCount("candace", manualCases)).toBeGreaterThan(0);
    expect(manualCases.length).toBeGreaterThanOrEqual(50);
  });

  it("includes a sample pool for automation blind spots (UX, a11y, tone, inbox)", () => {
    const ids = new Set(manualCases.map((t) => t.id));
    for (const id of [
      "UX-001",
      "UX-003",
      "UX-005",
      "A11Y-001",
      "FAMILY-001",
      "WIZ-UX-001",
      "WIZ-UX-002",
      "WIZ-UX-003",
      "CONTACT-003",
      "AUTH-006",
      "ADMIN-008",
      "ADMIN-009-EVELYN",
      "ADMIN-009-TINA",
      "ADMIN-010-EVELYN",
      "ADMIN-010-LYRIQ",
      "AUTH-007-EVELYN",
      "AUTH-007-LYRIQ",
      "AUTH-007-TINA",
      "EMAIL-001",
      "EMAIL-002",
      "EMAIL-004",
      "EMAIL-TPL-password_reset",
      "EMAIL-TPL-welcome_free",
      "REG-001",
      "REG-002",
      "BP-001",
    ]) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("assigns delivery/ops email + registration + Blueprint + contact cases to Lyriq", () => {
    const owned = TEST_CASES.filter(
      (t) =>
        (t.suite ?? "manual") === "manual" &&
        (t.id.startsWith("EMAIL-") ||
          t.id.startsWith("REG-") ||
          t.id.startsWith("BP-") ||
          t.id.startsWith("CONTACT-")) &&
        !t.id.startsWith("EMAIL-TPL-"),
    );
    expect(owned.length).toBeGreaterThanOrEqual(12);
    for (const t of owned) {
      expect(t.assignees).toContain("lyriq");
    }
  });

  it("assigns legal disclaimer, NDA, and signup-email review to Candace", () => {
    for (const id of ["LEGAL-DISC-001", "LEGAL-NDA-001", "LEGAL-SIGNUP-001"]) {
      const t = TEST_CASES.find((c) => c.id === id);
      expect(t?.assignees).toEqual(["candace"]);
    }
  });

  it("assigns one review case per email template to Candace", () => {
    const tplCases = TEST_CASES.filter(
      (t) => (t.suite ?? "manual") === "manual" && t.id.startsWith("EMAIL-TPL-"),
    );
    expect(tplCases.length).toBe(22);
    for (const t of tplCases) {
      expect(t.assignees).toEqual(["candace"]);
      expect(t.area).toBe("Email");
      expect(t.path).toMatch(/^\/admin\?tab=email&template=/);
      expect(t.steps[0]).toMatch(/\[Email Templates · .+\]\(\/admin\?tab=email&template=/);
      expect(facingForCase(t)).toBe("internal");
    }
  });

  it("has unique test IDs", () => {
    const ids = TEST_CASES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("documents Grade me → Roundup and Email Me for Schedule Suite cases", () => {
    const grade = TEST_CASES.find((t) => t.id === "SCHED-GRADE-001");
    const roundup = TEST_CASES.find((t) => t.id === "SCHED-ROUNDUP-001");
    const reminder = TEST_CASES.find((t) => t.id === "SCHED-REMINDER-001");
    expect(grade?.steps.join(" ")).toMatch(/Weekly Roundup/i);
    expect(grade?.steps.join(" ")).toMatch(/Current Grade plus the letter/i);
    expect(roundup?.steps.join(" ")).toMatch(/Current Grade|updates live/i);
    expect(reminder?.steps.join(" ")).toMatch(/Email Me/i);
  });

  it("merges partial PUT maps and replaces full GET maps", () => {
    const prev = { A: "not_run", B: "pass" };
    expect(nextKeyedMap(prev, { A: "fail" }, true)).toEqual({ A: "fail", B: "pass" });
    expect(nextKeyedMap(prev, { A: "fail" }, false)).toEqual({ A: "fail" });
  });

  it("auto-starts Not Started tests only on checklist or notes (not status/assignee)", () => {
    expect(
      shouldAutoStartTestOnFirstTouch({
        prevStatus: "not_run",
        nextStatus: "not_run",
        stepsChanged: true,
      }),
    ).toBe(true);
    expect(
      shouldAutoStartTestOnFirstTouch({
        prevStatus: "not_run",
        nextStatus: "not_run",
        notesChanged: true,
      }),
    ).toBe(true);
    expect(
      shouldAutoStartTestOnFirstTouch({
        prevStatus: "not_run",
        nextStatus: "pass",
        stepsChanged: true,
      }),
    ).toBe(false);
    expect(
      shouldAutoStartTestOnFirstTouch({
        prevStatus: "in_progress",
        nextStatus: "in_progress",
        stepsChanged: true,
      }),
    ).toBe(false);
    expect(
      shouldAutoStartTestOnFirstTouch({
        prevStatus: "not_run",
        nextStatus: "not_run",
        lockedSuiteOwner: "vitest",
        stepsChanged: true,
      }),
    ).toBe(false);
    expect(
      shouldAutoStartTestOnFirstTouch({
        prevStatus: "not_run",
        nextStatus: "not_run",
      }),
    ).toBe(false);
  });

  it("detects and heals Not Started tests already touched", () => {
    expect(
      notStartedTestAlreadyTouched({
        status: "not_run",
        note: "started looking",
        checkedSteps: [],
      }),
    ).toBe(true);
    expect(
      notStartedTestAlreadyTouched({
        status: "not_run",
        note: "",
        checkedSteps: [false, true],
      }),
    ).toBe(true);
    expect(
      notStartedTestAlreadyTouched({
        status: "not_run",
        note: "",
        checkedSteps: [false, false],
      }),
    ).toBe(false);
    expect(
      notStartedTestAlreadyTouched({
        status: "in_progress",
        note: "x",
        checkedSteps: [true],
      }),
    ).toBe(false);

    const healed = healNotStartedTouchedTests({
      statuses: { A: "not_run", B: "not_run", C: "pass" },
      notes: { A: "touched", B: "", C: "done" },
      checkedSteps: { A: [], B: [true], C: [] },
    });
    expect(healed.changedIds.sort()).toEqual(["A", "B"]);
    expect(healed.statuses.A).toBe("in_progress");
    expect(healed.statuses.B).toBe("in_progress");
    expect(healed.statuses.C).toBe("pass");
  });
});
