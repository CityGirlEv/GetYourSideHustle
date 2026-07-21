import { describe, expect, it } from "vitest";
import {
  TEST_CASES,
  TEST_CATEGORIES,
  categoryForCase,
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
      categoryForCase({ area: "Proofread", suite: "manual", id: "PROOF-PAGE-WORKSHOPS-TINA" }),
    ).toBe("proofread");

    // Residual Content bucket should stay empty once content areas are retagged.
    const residualContent = TEST_CASES.filter((t) => categoryForCase(t) === "content");
    expect(residualContent).toHaveLength(0);
  });

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
    expect(testerCaseCount("lyriq", manualCases)).toBeGreaterThan(0);
    expect(manualCases.length).toBeGreaterThanOrEqual(50);
  });

  it("includes a sample pool for automation blind spots (UX, a11y, tone, inbox)", () => {
    const ids = new Set(manualCases.map((t) => t.id));
    for (const id of [
      "UX-001",
      "UX-003",
      "A11Y-001",
      "FAMILY-001",
      "WIZ-UX-001",
      "WIZ-UX-002",
      "WIZ-UX-003",
      "CONTACT-003",
      "AUTH-006",
      "ADMIN-008",
      "EMAIL-001",
      "EMAIL-002",
      "EMAIL-004",
      "REG-001",
      "REG-002",
      "BP-001",
    ]) {
      expect(ids.has(id)).toBe(true);
    }
  });

  it("assigns email, registration, and Blueprint cases to Lyriq", () => {
    const owned = TEST_CASES.filter(
      (t) =>
        (t.suite ?? "manual") === "manual" &&
        (t.id.startsWith("EMAIL-") ||
          t.id.startsWith("REG-") ||
          t.id.startsWith("BP-") ||
          t.id.startsWith("CONTACT-")),
    );
    expect(owned.length).toBeGreaterThanOrEqual(12);
    for (const t of owned) {
      expect(t.assignees).toContain("lyriq");
    }
  });

  it("has unique test IDs", () => {
    const ids = TEST_CASES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
