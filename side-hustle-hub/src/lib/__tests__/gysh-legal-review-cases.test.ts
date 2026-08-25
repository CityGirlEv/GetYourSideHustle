import { describe, expect, it } from "vitest";
import {
  LEGAL_REVIEW_CASES,
  LEGAL_REVIEW_CASE_IDS,
  isLegalReviewCaseId,
  legalReviewDueDate,
  legalReviewSprint,
} from "../gysh-legal-review-cases";
import { TEST_CASES, categoryForCase, facingForCase } from "../gysh-test-plan";
import { currentSprintIndex, dueDatePlusDays } from "../gysh-sprints";
import { suggestedSprintForTest } from "../gysh-sprint-board";

describe("legal review cases for Candace", () => {
  it("adds disclaimer, NDA, and signup-email cases assigned to Candace", () => {
    expect(LEGAL_REVIEW_CASES.map((c) => c.id)).toEqual([...LEGAL_REVIEW_CASE_IDS]);
    for (const c of LEGAL_REVIEW_CASES) {
      expect(c.assignees).toEqual(["candace"]);
      expect(c.suite).toBe("manual");
      expect(isLegalReviewCaseId(c.id)).toBe(true);
    }
    const disc = LEGAL_REVIEW_CASES.find((c) => c.id === "LEGAL-DISC-001");
    const nda = LEGAL_REVIEW_CASES.find((c) => c.id === "LEGAL-NDA-001");
    const signup = LEGAL_REVIEW_CASES.find((c) => c.id === "LEGAL-SIGNUP-001");
    expect(disc?.title).toMatch(/disclaimer/i);
    expect(nda?.title).toMatch(/NDA/i);
    expect(signup?.title).toMatch(/confirmation email/i);
    expect(signup?.steps.join(" ")).toMatch(/Registration confirmation/i);
  });

  it("is on the current sprint with a today due date", () => {
    const now = new Date(2026, 7, 24);
    expect(legalReviewSprint(now)).toBe(currentSprintIndex(now));
    expect(legalReviewDueDate("LEGAL-DISC-001", now)).toBe(dueDatePlusDays(0, now));
    for (const c of LEGAL_REVIEW_CASES) {
      expect(suggestedSprintForTest(c)).toBe(currentSprintIndex());
    }
  });

  it("is included in the Testing Portal catalog", () => {
    for (const id of LEGAL_REVIEW_CASE_IDS) {
      const t = TEST_CASES.find((c) => c.id === id);
      expect(t).toBeTruthy();
      expect(t!.assignees).toEqual(["candace"]);
      expect(facingForCase(t!)).toBe("external");
    }
    expect(categoryForCase(TEST_CASES.find((c) => c.id === "LEGAL-DISC-001")!)).toBe(
      "navigation_brand",
    );
    expect(categoryForCase(TEST_CASES.find((c) => c.id === "LEGAL-NDA-001")!)).toBe("auth_access");
    expect(categoryForCase(TEST_CASES.find((c) => c.id === "LEGAL-SIGNUP-001")!)).toBe("auth_access");
  });
});
