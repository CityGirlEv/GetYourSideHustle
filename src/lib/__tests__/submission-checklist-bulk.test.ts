import { describe, expect, it } from "vitest";
import { emptySubmissionChecklistTestState } from "@/lib/__tests__/submission-checklist-test-helpers";
import {
  applyBulkChecklistEdit,
  clearChecklistItemsProgress,
  setChecklistItemStatus,
  syncItemProgressFromCheckboxes,
  withCheckboxStatusSync,
} from "@/lib/submission-checklist-bulk";
import {
  deriveItemStatusFromProgress,
  resolveChecklistItemStatus,
  statusFromCheckboxChecked,
} from "@/lib/submission-checklist-data";
import type { SubmissionChecklistState } from "@/lib/submission-checklist-storage";

const baseState = (): SubmissionChecklistState => ({
  completed: { "fb-copy-review": true },
  catriaReviewed: { "fb-creative-review": true },
  catriaApproved: {},
  catriaTaskFlags: {},
  itemAssignees: { "cms-smid": "review" },
  submissionTaskAssignees: {},
  itemStatuses: { "fb-copy-review": "done" },
  personStatuses: {},
  itemNotes: { "fb-copy-review": "note" },
  sectionNotes: {},
  submissionTasks: { "meta-business-verify": true },
  submissionTaskReviewed: {},
  submissionTaskApproved: {},
  submissionCatriaTaskFlags: {},
  submissionTaskNotes: {},
  carrierTasks: [
    {
      id: "carrier-1",
      uploadId: "upload-1",
      title: "SOA on file",
      description: "desc",
      carrierName: "Humana",
      assignee: "both",
      dueDate: "2026-07-10",
      reviewDueDate: "2026-07-12",
      lineNumber: 1,
    },
  ],
  carrierOriginalTasks: [],
  carrierTaskDone: { "carrier-1": true },
  carrierTaskReviewed: {},
  carrierTaskApproved: {},
  carrierCatriaTaskFlags: {},
  carrierTaskNotes: {},
  carrierUploads: [],
  metaAdConformanceRecords: [],
  updatedAt: "2026-07-01T00:00:00.000Z",
});

describe("submission-checklist-bulk", () => {
  it("statusFromCheckboxChecked maps checked to done and unchecked to not_started", () => {
    expect(statusFromCheckboxChecked(true)).toBe("done");
    expect(statusFromCheckboxChecked(false)).toBe("not_started");
  });

  it("resolveChecklistItemStatus defaults missing keys to not_started", () => {
    expect(resolveChecklistItemStatus("missing", {})).toBe("not_started");
    expect(resolveChecklistItemStatus("x", { x: "in_progress" })).toBe("in_progress");
  });

  it("withCheckboxStatusSync updates itemStatuses from checkbox toggle", () => {
    const next = withCheckboxStatusSync(baseState(), "new-item", true);
    expect(next.itemStatuses["new-item"]).toBe("done");
    const cleared = withCheckboxStatusSync(next, "new-item", false);
    expect(cleared.itemStatuses["new-item"]).toBe("not_started");
  });

  it("syncItemProgressFromCheckboxes marks item done when Catria approves", () => {
    const flags = { review: true, approve: true };
    const next = syncItemProgressFromCheckboxes(emptySubmissionChecklistTestState(), "fb-copy-review", {
      flags,
      showPrep: true,
      showCatria: true,
      prepDone: true,
      catriaReviewed: true,
      catriaApproved: true,
    });
    expect(next.itemStatuses["fb-copy-review"]).toBe("done");
    expect(next.personStatuses["fb-copy-review"]?.prep).toBe("done");
    expect(next.personStatuses["fb-copy-review"]?.review).toBe("done");
  });

  it("syncItemProgressFromCheckboxes keeps item in_progress after prep only", () => {
    const flags = { review: true, approve: true };
    const next = syncItemProgressFromCheckboxes(emptySubmissionChecklistTestState(), "fb-copy-review", {
      flags,
      showPrep: true,
      showCatria: true,
      prepDone: true,
      catriaReviewed: false,
      catriaApproved: false,
    });
    expect(next.itemStatuses["fb-copy-review"]).toBe("in_progress");
    expect(next.personStatuses["fb-copy-review"]?.review).toBe("not_started");
  });

  it("deriveItemStatusFromProgress returns done only when approve is checked", () => {
    const flags = { review: true, approve: true };
    expect(
      deriveItemStatusFromProgress(true, true, true, flags, true),
    ).toBe("done");
    expect(
      deriveItemStatusFromProgress(true, true, false, flags, true),
    ).toBe("in_progress");
  });

  it("setChecklistItemStatus writes explicit workflow status", () => {
    const next = setChecklistItemStatus(baseState(), "cms-smid", "in_progress");
    expect(next.itemStatuses["cms-smid"]).toBe("in_progress");
  });

  it("applyBulkChecklistEdit assigns Evelyn, Catria, or Both across item kinds", () => {
    const state = baseState();
    const next = applyBulkChecklistEdit(state, ["cms-smid", "meta-business-verify", "carrier-1"], {
      assignee: "prep",
    });
    expect(next.itemAssignees["cms-smid"]).toBe("prep");
    expect(next.submissionTaskAssignees["meta-business-verify"]).toBe("prep");
    expect(next.carrierTasks.find((t) => t.id === "carrier-1")?.assignee).toBe("prep");
  });

  it("applyBulkChecklistEdit sets status for selected rows", () => {
    const next = applyBulkChecklistEdit(baseState(), ["fb-copy-review", "carrier-1"], {
      status: "in_progress",
    });
    expect(next.itemStatuses["fb-copy-review"]).toBe("in_progress");
    expect(next.itemStatuses["carrier-1"]).toBe("in_progress");
  });

  it("clearChecklistItemsProgress wipes checkbox maps, notes, and statuses", () => {
    const cleared = clearChecklistItemsProgress(baseState(), [
      "fb-copy-review",
      "meta-business-verify",
      "carrier-1",
    ]);
    expect(cleared.completed["fb-copy-review"]).toBeUndefined();
    expect(cleared.itemNotes["fb-copy-review"]).toBeUndefined();
    expect(cleared.itemStatuses["fb-copy-review"]).toBeUndefined();
    expect(cleared.submissionTasks["meta-business-verify"]).toBeUndefined();
    expect(cleared.carrierTaskDone["carrier-1"]).toBeUndefined();
  });

  it("applyBulkChecklistEdit remove clears selected items", () => {
    const next = applyBulkChecklistEdit(baseState(), ["fb-copy-review"], { remove: true });
    expect(next.completed["fb-copy-review"]).toBeUndefined();
    expect(next.itemStatuses["fb-copy-review"]).toBeUndefined();
  });
});
