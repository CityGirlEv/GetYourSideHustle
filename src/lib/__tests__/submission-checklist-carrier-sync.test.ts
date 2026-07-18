import { describe, expect, it } from "vitest";
import { parseCarrierChecklistText } from "@/lib/submission-checklist-carrier";
import {
  buildCarrierMainChecklistItem,
  buildCarrierMainChecklistItems,
  carrierMainChecklistItemId,
  syncCarrierReviewToMainChecklist,
} from "@/lib/submission-checklist-carrier-sync";
import {
  carrierCuratedTasksForUpload,
  carrierOriginalTasksForUpload,
  renameCarrierUpload,
  saveCuratedCarrierChecklist,
  stageCarrierChecklistUpload,
} from "@/lib/submission-checklist-storage";
import { checklistItemMatchesAssigneeFilter } from "@/lib/submission-checklist-data";
import { emptySubmissionChecklistTestState } from "@/lib/__tests__/submission-checklist-test-helpers";

describe("submission-checklist-carrier-sync", () => {
  it("builds dual-assignee main checklist items for all curated tasks", () => {
    const tasks = parseCarrierChecklistText("Front-facing disclaimer review\nInternal SMID log", {
      carrierName: "Humana",
      uploadId: "upload-1",
    });

    const items = buildCarrierMainChecklistItems(tasks);
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.requiresCatriaApproval)).toBe(true);
    expect(buildCarrierMainChecklistItem(tasks[0]!).id).toBe(
      carrierMainChecklistItemId(tasks[0]!.id),
    );
  });

  it("syncs both assignee and prunes removed carrier items", () => {
    const tasks = parseCarrierChecklistText("Catria review item", {
      carrierName: "UHC",
      uploadId: "upload-sync",
    });
    const mainId = carrierMainChecklistItemId(tasks[0]!.id);

    const withSync = syncCarrierReviewToMainChecklist({
      ...emptySubmissionChecklistTestState(),
      carrierTasks: tasks,
      itemAssignees: {},
      completed: { [mainId]: true },
    });

    expect(withSync.itemAssignees[mainId]).toBe("both");
    expect(withSync.completed[mainId]).toBe(true);

    const cleared = syncCarrierReviewToMainChecklist({
      ...withSync,
      carrierTasks: [],
    });
    expect(cleared.itemAssignees[mainId]).toBeUndefined();
    expect(cleared.completed[mainId]).toBeUndefined();
  });

  it("dual-assignee synced items appear in both owner tabs", () => {
    const tasks = parseCarrierChecklistText("Review landing page", {
      carrierName: "Aetna",
      uploadId: "upload-tabs",
    });
    const item = buildCarrierMainChecklistItem(tasks[0]!);
    const state = syncCarrierReviewToMainChecklist({
      ...emptySubmissionChecklistTestState(),
      carrierTasks: tasks,
    });

    expect(checklistItemMatchesAssigneeFilter(item, "prep", state.itemAssignees)).toBe(true);
    expect(checklistItemMatchesAssigneeFilter(item, "review", state.itemAssignees)).toBe(true);
  });
});

describe("carrier checklist curation storage", () => {
  it("stages original dump without adding curated tasks until save", () => {
    const tasks = parseCarrierChecklistText("One\nTwo\nThree", {
      carrierName: "Humana",
      uploadId: "upload-stage",
    });
    const upload = {
      id: "upload-stage",
      carrierName: "Humana",
      uploadedAt: "2026-07-04T12:00:00.000Z",
      originalTaskCount: tasks.length,
    };

    const staged = stageCarrierChecklistUpload(emptySubmissionChecklistTestState(), tasks, upload);
    expect(staged.carrierOriginalTasks).toHaveLength(3);
    expect(staged.carrierTasks).toHaveLength(0);
    expect(carrierOriginalTasksForUpload(staged, "upload-stage")).toHaveLength(3);
    expect(carrierCuratedTasksForUpload(staged, "upload-stage")).toHaveLength(0);
  });

  it("saveCuratedCarrierChecklist persists subset, assigns both, and syncs main checklist", () => {
    const tasks = parseCarrierChecklistText("Keep me\nDrop me\nReview item", {
      carrierName: "Humana",
      uploadId: "upload-curate",
    });
    const upload = {
      id: "upload-curate",
      carrierName: "Humana",
      uploadedAt: "2026-07-04T12:00:00.000Z",
      originalTaskCount: tasks.length,
    };

    const staged = stageCarrierChecklistUpload(emptySubmissionChecklistTestState(), tasks, upload);
    const saved = saveCuratedCarrierChecklist(
      staged,
      "upload-curate",
      [
        { taskId: tasks[0]!.id, included: true },
        { taskId: tasks[1]!.id, included: false },
        { taskId: tasks[2]!.id, included: true },
      ],
      "admin@test.com",
    );

    expect(carrierOriginalTasksForUpload(saved, "upload-curate")).toHaveLength(3);
    expect(carrierCuratedTasksForUpload(saved, "upload-curate")).toHaveLength(2);
    expect(saved.carrierUploads[0]?.curatedTaskCount).toBe(2);
    expect(saved.carrierUploads[0]?.curatedBy).toBe("admin@test.com");
    expect(saved.carrierTasks.every((task) => task.assignee === "both")).toBe(true);
    expect(saved.itemAssignees[carrierMainChecklistItemId(tasks[0]!.id)]).toBe("both");
    expect(saved.itemAssignees[carrierMainChecklistItemId(tasks[2]!.id)]).toBe("both");
    expect(saved.carrierTaskDone[tasks[1]!.id]).toBeUndefined();
  });

  it("renameCarrierUpload updates upload meta, tasks, and synced main checklist titles", () => {
    const tasks = parseCarrierChecklistText("Review item", {
      carrierName: "Humana",
      uploadId: "upload-rename",
    });
    const upload = {
      id: "upload-rename",
      carrierName: "Humana",
      uploadedAt: "2026-07-04T12:00:00.000Z",
      originalTaskCount: tasks.length,
    };

    const staged = stageCarrierChecklistUpload(emptySubmissionChecklistTestState(), tasks, upload);
    const saved = saveCuratedCarrierChecklist(
      staged,
      "upload-rename",
      [{ taskId: tasks[0]!.id, included: true }],
      "admin@test.com",
    );
    const renamed = renameCarrierUpload(saved, "upload-rename", "UnitedHealthcare");

    expect(renamed.carrierUploads[0]?.carrierName).toBe("UnitedHealthcare");
    expect(renamed.carrierTasks[0]?.carrierName).toBe("UnitedHealthcare");
    expect(renamed.carrierOriginalTasks[0]?.carrierName).toBe("UnitedHealthcare");
    expect(buildCarrierMainChecklistItem(renamed.carrierTasks[0]!).title).toBe(
      "UnitedHealthcare: Review item",
    );
  });
});
