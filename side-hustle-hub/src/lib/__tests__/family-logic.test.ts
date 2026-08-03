import { describe, expect, it } from "vitest";
import {
  dailyPeriodKey,
  derivedKidLoginEmail,
  isFamilyAgeBand,
  isProgressReportCadence,
  normalizeChildDisplayName,
  parentConsentRequiresPassword,
  periodKeyForCadence,
  resolveBlueprintAssignee,
  validateRegisterKidInput,
  weeklyPeriodKey,
} from "../family-logic";
import { TEST_CASES } from "../gysh-test-plan";
import { suggestedSprintForTest } from "../gysh-sprint-board";
import { BACKLOG_SPRINT } from "../gysh-sprints";

describe("family-logic", () => {
  it("normalizes kid display names", () => {
    expect(normalizeChildDisplayName("  Ava   Rose ")).toBe("Ava Rose");
    expect(normalizeChildDisplayName("")).toBe("");
  });

  it("derives a unique kid login email from the parent email + child name", () => {
    expect(
      derivedKidLoginEmail("Parent.Name@Gmail.com", "Ava Rose", "child-ab12cd34-ffff"),
    ).toBe("parent.name+avarose-ab12cd34@gmail.com");
    expect(
      derivedKidLoginEmail("parent+tag@example.com", "Jo", "child-99"),
    ).toBe("parent+jo-99@example.com");
  });

  it("validates register-kid input", () => {
    expect(
      validateRegisterKidInput({
        displayName: "Ava",
        ageBand: "kids",
        loginEmail: "ava@example.com",
        loginPassword: "SecureKid1!",
      }),
    ).toBeNull();
    expect(validateRegisterKidInput({ displayName: "", ageBand: "kids" })).toMatch(/first name/i);
    expect(
      validateRegisterKidInput({ displayName: "Ava", ageBand: "kids" }),
    ).toMatch(/valid email/i);
    expect(
      validateRegisterKidInput({
        displayName: "Ava",
        ageBand: "kids",
        loginEmail: "ava@example.com",
        loginPassword: "short",
      }),
    ).toMatch(/8 characters/i);
    expect(isFamilyAgeBand("kids")).toBe(true);
    expect(isFamilyAgeBand("adult")).toBe(false);
  });

  it("resolves blueprint assignee targets", () => {
    expect(resolveBlueprintAssignee(null)).toEqual({ kind: "self" });
    expect(resolveBlueprintAssignee("self")).toEqual({ kind: "self" });
    expect(resolveBlueprintAssignee("child-123")).toEqual({
      kind: "child",
      childProfileId: "child-123",
    });
  });

  it("requires parent password only when no parent account exists", () => {
    expect(parentConsentRequiresPassword(false)).toBe(true);
    expect(parentConsentRequiresPassword(true)).toBe(false);
  });

  it("builds daily/weekly period keys", () => {
    expect(isProgressReportCadence("daily")).toBe(true);
    expect(dailyPeriodKey("2026-07-29T15:00:00.000Z")).toBe("2026-07-29");
    expect(weeklyPeriodKey("2026-07-29T15:00:00.000Z")).toMatch(/^2026-W\d{2}$/);
    expect(periodKeyForCadence("daily", "2026-07-29T00:00:00.000Z")).toBe("2026-07-29");
  });
});

describe("Family Coach backlog tests", () => {
  const familyNew = TEST_CASES.filter((t) =>
    [
      "FAMILY-003",
      "FAMILY-004",
      "FAMILY-005",
      "FAMILY-006",
      "FAMILY-007",
      "FAMILY-008",
      "FAMILY-009",
      "FAMILY-010",
      "FAMILY-011",
      "FAMILY-012",
    ].includes(t.id),
  );

  it("includes FAMILY-003…012 covering register, assign, consent, login notify, reports, family UI", () => {
    expect(familyNew.map((t) => t.id).sort()).toEqual([
      "FAMILY-003",
      "FAMILY-004",
      "FAMILY-005",
      "FAMILY-006",
      "FAMILY-007",
      "FAMILY-008",
      "FAMILY-009",
      "FAMILY-010",
      "FAMILY-011",
      "FAMILY-012",
    ]);
    for (const t of familyNew) {
      expect(t.area).toBe("Family Coach");
      expect(t.suite).toBe("manual");
      expect(t.assignees).toContain("lyriq");
      expect(suggestedSprintForTest(t)).toBe(BACKLOG_SPRINT);
    }
  });

  it("keeps legacy FAMILY-001/002 out of the new backlog park", () => {
    const legacy = TEST_CASES.filter((t) => t.id === "FAMILY-001" || t.id === "FAMILY-002");
    expect(legacy).toHaveLength(2);
    for (const t of legacy) {
      expect(suggestedSprintForTest(t)).not.toBe(BACKLOG_SPRINT);
    }
  });
});
