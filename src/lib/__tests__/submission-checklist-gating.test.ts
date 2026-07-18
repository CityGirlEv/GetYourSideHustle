import { describe, expect, it } from "vitest";
import {
  PREP_OWNER_LABEL,
  REVIEW_OWNER_LABEL,
  allSubmissionChecklistItems,
  assigneeAfterRemovingPerson,
  buildRemoveChecklistPersonPatch,
  canCatriaApprove,
  catriaApproveBlockedReason,
  resolveCatriaPersonStatus,
  resolvePrepPersonStatus,
} from "@/lib/submission-checklist-data";
import {
  removePersonFromMainChecklistItem,
  removePersonFromSubmissionTask,
  syncItemProgressFromCheckboxes,
} from "@/lib/submission-checklist-bulk";
import { emptySubmissionChecklistTestState } from "@/lib/__tests__/submission-checklist-test-helpers";

describe("submission-checklist gating", () => {
  const defaultFlags = { review: true, approve: true };

  it("blocks Catria approve until Evelyn prep and Catria review are done", () => {
    expect(
      canCatriaApprove({
        prepDone: false,
        showPrep: true,
        catriaReviewed: false,
        flags: defaultFlags,
      }),
    ).toBe(false);
    expect(
      canCatriaApprove({
        prepDone: true,
        showPrep: true,
        catriaReviewed: false,
        flags: defaultFlags,
      }),
    ).toBe(false);
    expect(
      canCatriaApprove({
        prepDone: true,
        showPrep: true,
        catriaReviewed: true,
        flags: defaultFlags,
      }),
    ).toBe(true);
  });

  it("allows approve when review step is opted out via catriaTaskFlags", () => {
    expect(
      canCatriaApprove({
        prepDone: true,
        showPrep: true,
        catriaReviewed: false,
        flags: { review: false, approve: true },
      }),
    ).toBe(true);
  });

  it("allows approve when prep is not required for the item", () => {
    expect(
      canCatriaApprove({
        prepDone: false,
        showPrep: false,
        catriaReviewed: true,
        flags: defaultFlags,
      }),
    ).toBe(true);
  });

  it("returns tooltip reasons for blocked approve", () => {
    expect(
      catriaApproveBlockedReason({
        prepDone: false,
        showPrep: true,
        catriaReviewed: false,
        flags: defaultFlags,
      }),
    ).toBe(`Complete ${PREP_OWNER_LABEL} prep and ${REVIEW_OWNER_LABEL} review first`);

    expect(
      catriaApproveBlockedReason({
        prepDone: true,
        showPrep: true,
        catriaReviewed: false,
        flags: defaultFlags,
      }),
    ).toBe(`Complete ${REVIEW_OWNER_LABEL} review first`);
  });

  it("derives per-person status from checkboxes", () => {
    expect(resolvePrepPersonStatus(false, true)).toBe("not_started");
    expect(resolvePrepPersonStatus(true, true)).toBe("done");
    expect(resolvePrepPersonStatus(false, false)).toBe("done");

    expect(resolveCatriaPersonStatus(defaultFlags, false, false)).toBe("not_started");
    expect(resolveCatriaPersonStatus(defaultFlags, true, false)).toBe("in_progress");
    expect(resolveCatriaPersonStatus(defaultFlags, true, true)).toBe("done");
    expect(resolveCatriaPersonStatus({ review: false, approve: false }, false, false)).toBe(
      "done",
    );
    expect(resolveCatriaPersonStatus({ review: false, approve: true }, false, true)).toBe("done");
  });

  it("buildRemoveChecklistPersonPatch drops Catria sub-tasks", () => {
    expect(buildRemoveChecklistPersonPatch("both", "review")).toEqual({
      assignee: "prep",
      catriaTaskFlags: { review: false, approve: false },
      clearReview: true,
      clearApprove: true,
    });
    expect(buildRemoveChecklistPersonPatch("both", "prep")).toEqual({
      assignee: "review",
      clearPrep: true,
    });
    expect(assigneeAfterRemovingPerson("review", "review")).toBe("prep");
  });

  it("Catria approve sync marks overall item status done", () => {
    const item = allSubmissionChecklistItems().find((i) => i.id === "fb-copy-review");
    expect(item).toBeDefined();
    const base = emptySubmissionChecklistTestState();
    const next = syncItemProgressFromCheckboxes(base, item!.id, {
      flags: { review: true, approve: true },
      showPrep: true,
      showCatria: true,
      prepDone: true,
      catriaReviewed: true,
      catriaApproved: true,
    });
    expect(next.itemStatuses[item!.id]).toBe("done");
    expect(next.personStatuses[item!.id]?.review).toBe("done");
  });

  it("removePersonFromMainChecklistItem clears Catria progress and flags", () => {
    const item = allSubmissionChecklistItems().find((i) => i.id === "fb-copy-review");
    expect(item).toBeDefined();
    const base = {
      ...emptySubmissionChecklistTestState(),
      itemAssignees: { [item!.id]: "both" as const },
      completed: { [item!.id]: true },
      catriaReviewed: { [item!.id]: true },
      catriaApproved: { [item!.id]: true },
      catriaTaskFlags: { [item!.id]: { review: true, approve: true } },
    };
    const next = removePersonFromMainChecklistItem(base, item!.id, "review", "both");
    expect(next.itemAssignees[item!.id]).toBe("prep");
    expect(next.catriaTaskFlags[item!.id]).toEqual({ review: false, approve: false });
    expect(next.catriaReviewed[item!.id]).toBeFalsy();
    expect(next.catriaApproved[item!.id]).toBeFalsy();
    expect(next.completed[item!.id]).toBe(true);
  });

  it("removePersonFromSubmissionTask clears Evelyn prep when removed", () => {
    const base = {
      ...emptySubmissionChecklistTestState(),
      submissionTasks: { "task-1": true },
      submissionTaskAssignees: { "task-1": "both" as const },
    };
    const next = removePersonFromSubmissionTask(base, "task-1", "prep", "both", "submission");
    expect(next.submissionTaskAssignees["task-1"]).toBe("review");
    expect(next.submissionTasks["task-1"]).toBeFalsy();
  });
});
