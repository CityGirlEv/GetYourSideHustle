import { describe, expect, it } from "vitest";
import {
  TEST_CASES,
  TEST_CATEGORIES,
  categoryForCase,
  facingForCase,
  testerCaseCount,
} from "../gysh-test-plan";

describe("gysh-test-plan", () => {
  const manualCases = TEST_CASES.filter((t) => (t.suite ?? "manual") === "manual");

  it("splits former Content into ProofRead / Website / Facebook / Contact (Workshops stays separate)", () => {
    expect(TEST_CATEGORIES).toContain("workshops");
    expect(TEST_CATEGORIES).toContain("proofread");
    expect(TEST_CATEGORIES).toContain("website");
    expect(TEST_CATEGORIES).toContain("facebook");
    expect(TEST_CATEGORIES).toContain("contact");
    expect(TEST_CATEGORIES).not.toContain("content_workshops");

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

  it("assigns every manual case to a human QA tester", () => {
    for (const t of manualCases) {
      expect(t.assignees.length).toBeGreaterThan(0);
      expect(t.suite).toBe("manual");
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
    expect(tplCases.length).toBe(18);
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
    expect(grade?.steps.join(" ")).toMatch(/only one Grade me|stats-bar Grade me hidden/i);
    expect(roundup?.steps.join(" ")).toMatch(/only one Grade me/i);
    expect(reminder?.steps.join(" ")).toMatch(/Email Me/i);
  });
});
