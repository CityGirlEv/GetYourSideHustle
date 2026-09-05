import { describe, expect, it } from "vitest";
import { suggestedSprintForTest } from "../gysh-sprint-board";
import { currentSprintIndex } from "../gysh-sprints";
import { TEST_CASES } from "../gysh-test-plan";
import {
  BETA_CREDITS_REVIEW_CASES,
  BETA_CREDITS_REVIEW_LOGICAL_ID,
  BETA_CREDITS_REVIEW_REVIEWERS,
  BETA_CREDITS_REVIEW_TITLE,
  isBetaCreditsReviewCaseId,
  needsBetaCreditsReviewPlacementHeal,
} from "../gysh-beta-credits-review-cases";

describe("beta credits review cases", () => {
  it("creates one case per reviewer with the payment-model opinion step", () => {
    expect(BETA_CREDITS_REVIEW_CASES).toHaveLength(BETA_CREDITS_REVIEW_REVIEWERS.length);
    expect(BETA_CREDITS_REVIEW_REVIEWERS).toEqual([
      "milford",
      "tina",
      "brenda",
      "lyriq",
      "evelyn",
    ]);
    for (const owner of BETA_CREDITS_REVIEW_REVIEWERS) {
      const id = `${BETA_CREDITS_REVIEW_LOGICAL_ID}-${owner.toUpperCase()}`;
      const c = BETA_CREDITS_REVIEW_CASES.find((x) => x.id === id);
      expect(c).toBeTruthy();
      expect(c!.assignees).toEqual([owner]);
      expect(c!.title).toBe(BETA_CREDITS_REVIEW_TITLE);
      expect(c!.steps.some((s) => /overall opinion on the payment models/i.test(s))).toBe(true);
      expect(c!.steps.some((s) => /no Starter\+ or Pro\+/i.test(s))).toBe(true);
      expect(isBetaCreditsReviewCaseId(id)).toBe(true);
      expect(suggestedSprintForTest(c!)).toBe(currentSprintIndex());
    }
  });

  it("wires into TEST_CASES", () => {
    const ids = new Set(TEST_CASES.map((t) => t.id));
    for (const c of BETA_CREDITS_REVIEW_CASES) {
      expect(ids.has(c.id)).toBe(true);
    }
  });

  it("does not heal graded work or wipe a matching assignee on correct placement", () => {
    expect(
      needsBetaCreditsReviewPlacementHeal({
        status: "pass",
        sprint: 3,
        due: "08/01/26",
        assignee: "tina",
        wantSprint: 4,
        wantDue: "08/25/26",
        wantAssignee: "tina",
      }),
    ).toBe(false);
    expect(
      needsBetaCreditsReviewPlacementHeal({
        status: "not_run",
        sprint: 4,
        due: "08/25/26",
        assignee: "milford",
        wantSprint: 4,
        wantDue: "08/25/26",
        wantAssignee: "milford",
      }),
    ).toBe(false);
    expect(
      needsBetaCreditsReviewPlacementHeal({
        status: "not_run",
        sprint: 3,
        due: "08/01/26",
        assignee: "",
        wantSprint: 4,
        wantDue: "08/25/26",
        wantAssignee: "brenda",
      }),
    ).toBe(true);
  });
});
