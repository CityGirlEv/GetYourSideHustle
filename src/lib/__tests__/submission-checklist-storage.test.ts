import { describe, expect, it } from "vitest";
import {
  applyBoolRecordPatch,
  checklistItemChecked,
  cloneSubmissionChecklistState,
  getDirtySubmissionChecklistItemIds,
  isSubmissionChecklistDbSetupError,
  isSubmissionChecklistItemDirty,
  isSubmissionChecklistStateDirty,
  mergeSubmissionChecklistStates,
  parseSubmissionChecklistStatePayload,
  prepareSubmissionChecklistStateForServer,
  prepareSubmissionChecklistStateForServerMerge,
  materializeBoolRecordDeletionsForMerge,
  restoreLocalMetaAdAssets,
  restoreLocalMetaAdChecklistProgress,
  stripMetaAdAssetsForServerSync,
  compactMetaAdChecklistProgressForServerSync,
  estimateSubmissionChecklistPayloadBytes,
  submissionChecklistErrorMessage,
  clearedSubmissionChecklistState,
  coalesceSubmissionChecklistStatesOnLoad,
  emptySubmissionChecklistState,
  isSubmissionChecklistProgressCleared,
  type SubmissionChecklistState,
} from "@/lib/submission-checklist-storage";
import { siteVerifiedChecklistIds } from "@/lib/submission-checklist-data";
import { applyMainChecklistItemPatch } from "@/lib/submission-checklist-meta-ad-sync";
import { createMetaAdConformanceRecord } from "@/lib/submission-checklist-meta-ads";

import { emptySubmissionChecklistTestState } from "@/lib/__tests__/submission-checklist-test-helpers";

const baseState = emptySubmissionChecklistTestState;

describe("submission-checklist-storage", () => {
  it("parses itemAssignees from persisted payload", () => {
    const parsed = parseSubmissionChecklistStatePayload({
      ...baseState(),
      itemAssignees: { "fb-copy-review": "prep" },
    });
    expect(parsed?.itemAssignees).toEqual({ "fb-copy-review": "prep" });
  });

  it("parses itemStatuses from persisted payload", () => {
    const parsed = parseSubmissionChecklistStatePayload({
      ...baseState(),
      itemStatuses: { "fb-copy-review": "in_progress", "cms-smid": "done" },
    });
    expect(parsed?.itemStatuses).toEqual({
      "fb-copy-review": "in_progress",
      "cms-smid": "done",
    });
  });

  it("merges itemStatuses with local winning on conflict", () => {
    const server = {
      ...baseState(),
      itemStatuses: { "fb-copy-review": "not_started", "cms-smid": "done" },
      updatedAt: "2026-07-01T00:00:00.000Z",
    };
    const local = {
      ...baseState(),
      itemStatuses: { "fb-copy-review": "in_progress" },
      updatedAt: "2026-07-02T00:00:00.000Z",
    };
    const merged = mergeSubmissionChecklistStates(server, local);
    expect(merged.itemStatuses).toEqual({
      "fb-copy-review": "in_progress",
      "cms-smid": "done",
    });
  });

  it("merges itemAssignees with local winning on conflict", () => {
    const server = {
      ...baseState(),
      itemAssignees: { "fb-copy-review": "review", "cms-soa": "prep" },
      updatedAt: "2026-07-01T00:00:00.000Z",
    };
    const local = {
      ...baseState(),
      itemAssignees: { "fb-copy-review": "prep" },
      updatedAt: "2026-07-02T00:00:00.000Z",
    };
    const merged = mergeSubmissionChecklistStates(server, local);
    expect(merged.itemAssignees).toEqual({
      "fb-copy-review": "prep",
      "cms-soa": "prep",
    });
  });

  it("parses metaAdConformanceRecords from persisted payload", () => {
    const parsed = parseSubmissionChecklistStatePayload({
      ...baseState(),
      metaAdConformanceRecords: [
        {
          id: "meta-ad-1",
          label: "Lead form ad",
          status: "draft",
          readyToGo: false,
          createdAt: "2026-07-01T00:00:00.000Z",
          updatedAt: "2026-07-01T00:00:00.000Z",
        },
      ],
    });
    expect(parsed?.metaAdConformanceRecords).toHaveLength(1);
    expect(parsed?.metaAdConformanceRecords[0]?.label).toBe("Lead form ad");
  });

  it("merges metaAdConformanceRecords unioning by id", () => {
    const shared = {
      id: "meta-ad-shared",
      label: "Shared",
      status: "draft" as const,
      catriaApproved: false,
      readyToGo: false,
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    };
    const server = {
      ...baseState(),
      metaAdConformanceRecords: [shared],
    };
    const local = {
      ...baseState(),
      metaAdConformanceRecords: [
        {
          ...shared,
          label: "Shared updated",
          dateSubmitted: "2026-07-02",
          updatedAt: "2026-07-02T00:00:00.000Z",
        },
        {
          id: "meta-ad-local-only",
          label: "Local only",
          status: "draft" as const,
          catriaApproved: false,
          readyToGo: false,
          createdAt: "2026-07-02T00:00:00.000Z",
          updatedAt: "2026-07-02T00:00:00.000Z",
        },
      ],
    };
    const merged = mergeSubmissionChecklistStates(server, local);
    expect(merged.metaAdConformanceRecords).toHaveLength(2);
    expect(merged.metaAdConformanceRecords.find((r) => r.id === "meta-ad-shared")?.dateSubmitted).toBe(
      "2026-07-02",
    );
  });

  it("strips Meta ad asset bytes for server sync and restores from local", () => {
    const local: SubmissionChecklistState = {
      ...baseState(),
      metaAdConformanceRecords: [
        {
          id: "meta-ad-asset",
          label: "Video ad",
          status: "draft",
          catriaApproved: false,
          readyToGo: false,
          asset: {
            fileName: "ad.mp4",
            mimeType: "video/mp4",
            sizeBytes: 1024,
            uploadedAt: "2026-07-01T00:00:00.000Z",
            dataUrl: "data:video/mp4;base64,AAAA",
          },
          createdAt: "2026-07-01T00:00:00.000Z",
          updatedAt: "2026-07-01T00:00:00.000Z",
        },
      ],
    };
    const stripped = stripMetaAdAssetsForServerSync(local);
    expect(stripped.metaAdConformanceRecords[0]?.asset?.dataUrl).toBeUndefined();
    expect(prepareSubmissionChecklistStateForServer(local).metaAdConformanceRecords[0]?.asset?.fileName).toBe(
      "ad.mp4",
    );

    const server = stripped;
    const restored = restoreLocalMetaAdAssets(server, local);
    expect(restored.metaAdConformanceRecords[0]?.asset?.dataUrl).toBe("data:video/mp4;base64,AAAA");
  });

  it("compacts inherited meta ad checklist progress for server sync", () => {
    const records = [createMetaAdConformanceRecord("Ad A"), createMetaAdConformanceRecord("Ad B")];
    const synced = applyMainChecklistItemPatch(
      { ...baseState(), metaAdConformanceRecords: records },
      "fb-creative-assets",
      { completed: { "fb-creative-assets": true }, itemNotes: { "fb-creative-assets": "Global note" } },
    );
    expect(synced.metaAdConformanceRecords[0]?.checklistProgress?.["fb-creative-assets"]).toBeDefined();

    const prepared = prepareSubmissionChecklistStateForServer(synced);
    expect(prepared.metaAdConformanceRecords[0]?.checklistProgress).toBeUndefined();
    expect(prepared.completed["fb-creative-assets"]).toBe(true);

    const withOverride = {
      ...synced,
      metaAdConformanceRecords: synced.metaAdConformanceRecords.map((record, index) =>
        index === 0
          ? {
              ...record,
              checklistProgress: {
                ...record.checklistProgress,
                "cms-smid": { prepDone: true, note: "Ad-only SMID" },
              },
            }
          : record,
      ),
    };
    const compact = compactMetaAdChecklistProgressForServerSync(
      withOverride.metaAdConformanceRecords[0]!,
      withOverride,
    );
    expect(compact?.["cms-smid"]).toEqual({ prepDone: true, note: "Ad-only SMID" });

    const preparedOverride = prepareSubmissionChecklistStateForServer(withOverride);
    const restored = restoreLocalMetaAdChecklistProgress(preparedOverride, withOverride);
    expect(restored.metaAdConformanceRecords[0]?.checklistProgress?.["cms-smid"]?.note).toBe(
      "Ad-only SMID",
    );
  });

  it("shrinks server payload when global checklist sync duplicated per-ad progress", () => {
    const records = Array.from({ length: 5 }, (_, i) => createMetaAdConformanceRecord(`Ad ${i + 1}`));
    let state: SubmissionChecklistState = { ...baseState(), metaAdConformanceRecords: records };
    for (const itemId of ["fb-creative-assets", "fb-copy-review", "cms-smid", "gap-smid-registry"]) {
      state = applyMainChecklistItemPatch(state, itemId, {
        completed: { [itemId]: true },
        itemNotes: { [itemId]: `Note for ${itemId}` },
      });
    }
    const rawBytes = estimateSubmissionChecklistPayloadBytes(state);
    const preparedBytes = estimateSubmissionChecklistPayloadBytes(
      prepareSubmissionChecklistStateForServer(state),
    );
    expect(preparedBytes).toBeLessThan(rawBytes / 2);
  });

  it("detects dirty checklist items and global state vs server baseline", () => {
    const baseline = baseState();
    const local = {
      ...baseState(),
      completed: { "fb-copy-review": true },
      itemNotes: { "cms-smid": "Updated note" },
    };
    expect(isSubmissionChecklistItemDirty("fb-copy-review", local, baseline)).toBe(true);
    expect(isSubmissionChecklistItemDirty("cms-smid", local, baseline)).toBe(true);
    expect(isSubmissionChecklistItemDirty("fb-creative-assets", local, baseline)).toBe(false);
    expect(getDirtySubmissionChecklistItemIds(local, baseline, ["fb-copy-review", "cms-smid", "fb-creative-assets"])).toEqual([
      "fb-copy-review",
      "cms-smid",
    ]);
    expect(isSubmissionChecklistStateDirty(local, baseline)).toBe(true);
    expect(isSubmissionChecklistStateDirty(baseline, baseline)).toBe(false);
  });

  it("applyBoolRecordPatch removes keys on false and keeps true", () => {
    const record = { a: true, b: true, c: false };
    const patched = applyBoolRecordPatch(record, { a: false, b: true, d: true });
    expect(patched).toEqual({ b: true, d: true });
    expect(patched).not.toHaveProperty("a");
    expect(patched).not.toHaveProperty("c");
  });

  it("checklistItemChecked treats only explicit true as checked", () => {
    expect(checklistItemChecked({ a: true }, "a")).toBe(true);
    expect(checklistItemChecked({ a: false }, "a")).toBe(false);
    expect(checklistItemChecked({}, "a")).toBe(false);
  });

  it("marks unchecked items dirty when baseline was saved as checked", () => {
    const baseline = {
      ...baseState(),
      completed: { "fb-copy-review": true },
      catriaApproved: { "fb-creative-review": true },
    };
    const unchecked = applyMainChecklistItemPatch(baseline, "fb-copy-review", {
      completed: { "fb-copy-review": false },
    });
    expect(unchecked.completed["fb-copy-review"]).toBeUndefined();
    expect(isSubmissionChecklistItemDirty("fb-copy-review", unchecked, baseline)).toBe(true);

    const catriaUnchecked = applyMainChecklistItemPatch(baseline, "fb-creative-review", {
      catriaApproved: { "fb-creative-review": false },
    });
    expect(catriaUnchecked.catriaApproved["fb-creative-review"]).toBeUndefined();
    expect(isSubmissionChecklistItemDirty("fb-creative-review", catriaUnchecked, baseline)).toBe(
      true,
    );
    expect(isSubmissionChecklistStateDirty(unchecked, baseline)).toBe(true);
    expect(
      getDirtySubmissionChecklistItemIds(unchecked, baseline, [
        "fb-copy-review",
        "fb-creative-review",
      ]),
    ).toEqual(["fb-copy-review"]);
  });

  it("detects dirty state for assignee and note changes", () => {
    const baseline = {
      ...baseState(),
      itemAssignees: { "fb-copy-review": "review" },
      itemNotes: { "cms-smid": "Baseline note" },
    };
    const local = {
      ...baseState(),
      itemAssignees: { "fb-copy-review": "prep" },
      itemNotes: { "cms-smid": "Edited note" },
    };
    expect(isSubmissionChecklistItemDirty("fb-copy-review", local, baseline)).toBe(true);
    expect(isSubmissionChecklistItemDirty("cms-smid", local, baseline)).toBe(true);
  });

  it("does not mark reverted draft dirty after clone back to baseline", () => {
    const baseline = {
      ...baseState(),
      completed: { "fb-copy-review": true },
      itemNotes: { "cms-smid": "Saved note" },
    };
    const draft = applyMainChecklistItemPatch(
      { ...baseline, itemNotes: { "cms-smid": "Unsaved edit" } },
      "fb-copy-review",
      { completed: { "fb-copy-review": false } },
    );
    expect(isSubmissionChecklistStateDirty(draft, baseline)).toBe(true);
    const reverted = cloneSubmissionChecklistState(baseline);
    expect(isSubmissionChecklistStateDirty(reverted, baseline)).toBe(false);
    expect(reverted).toEqual(baseline);
    expect(reverted).not.toBe(baseline);
  });

  it("merge respects explicit false from local over server true", () => {
    const server = {
      ...baseState(),
      completed: { "fb-copy-review": true, "fb-business-manager": true },
    };
    const local = {
      ...baseState(),
      completed: { "fb-copy-review": false, "cms-smid": true },
      updatedAt: "2026-07-02T00:00:00.000Z",
    };
    const merged = mergeSubmissionChecklistStates(server, local);
    expect(merged.completed["fb-copy-review"]).toBe(false);
    expect(merged.completed["fb-business-manager"]).toBe(true);
    expect(merged.completed["cms-smid"]).toBe(true);
  });

  it("uncheck-save round-trip keeps item unchecked after server merge", () => {
    const baseline = {
      ...baseState(),
      completed: { "fb-copy-review": true, "fb-business-manager": true },
      catriaApproved: { "fb-creative-review": true },
    };
    const unchecked = applyMainChecklistItemPatch(baseline, "fb-copy-review", {
      completed: { "fb-copy-review": false },
    });
    expect(unchecked.completed["fb-copy-review"]).toBeUndefined();

    const payload = prepareSubmissionChecklistStateForServerMerge(unchecked, baseline);
    expect(payload.completed["fb-copy-review"]).toBe(false);
    expect(payload.completed["fb-business-manager"]).toBe(true);

    const serverRow = baseline;
    const saved = mergeSubmissionChecklistStates(serverRow, payload);
    expect(saved.completed["fb-copy-review"]).toBe(false);
    expect(checklistItemChecked(saved.completed, "fb-copy-review")).toBe(false);
    expect(saved.completed["fb-business-manager"]).toBe(true);
  });

  it("materializeBoolRecordDeletionsForMerge only encodes baseline trues", () => {
    const baseline = { a: true, b: true };
    const current = { b: true, c: true };
    expect(materializeBoolRecordDeletionsForMerge(current, baseline)).toEqual({
      a: false,
      b: true,
      c: true,
    });
    expect(materializeBoolRecordDeletionsForMerge({}, {})).toEqual({});
  });

  it("persists explicit false for unchecked site-verified items through merge", () => {
    const verifiedId = siteVerifiedChecklistIds()[0];
    expect(verifiedId).toBeDefined();

    const server = {
      ...baseState(),
      completed: { [verifiedId!]: true },
    };
    const local = applyMainChecklistItemPatch(server, verifiedId!, {
      completed: { [verifiedId!]: false },
    });
    const payload = prepareSubmissionChecklistStateForServerMerge(local, server);
    const saved = mergeSubmissionChecklistStates(server, payload);

    expect(saved.completed[verifiedId!]).toBe(false);
    expect(checklistItemChecked(saved.completed, verifiedId!)).toBe(false);
  });

  it("maps missing-table errors to admin setup message", () => {
    const raw =
      "Could not find the table 'public.submission_checklist_progress' in the schema cache";
    expect(isSubmissionChecklistDbSetupError(raw)).toBe(true);
    expect(submissionChecklistErrorMessage(new Error(raw))).toMatch(/contact an admin/i);
    expect(
      submissionChecklistErrorMessage({
        message: raw,
        code: "PGRST205",
        details: null,
        hint: null,
      }),
    ).toMatch(/contact an admin/i);
    expect(isSubmissionChecklistDbSetupError("permission denied for table foo")).toBe(false);
  });

  it("extracts readable messages from plain error objects", () => {
    expect(
      submissionChecklistErrorMessage({
        message: "Admin access required",
      }),
    ).toBe("Admin access required");
    expect(
      submissionChecklistErrorMessage({
        issues: [{ path: ["state", "completed"], message: "Required" }],
      }),
    ).toBe("state.completed: Required");
    expect(
      submissionChecklistErrorMessage({
        error: { message: "Nested failure" },
      }),
    ).toBe("Nested failure");
  });

  it("marks clear-all draft dirty against saved baseline and reset restores baseline", () => {
    const baseline = {
      ...baseState(),
      completed: { "fb-copy-review": true, "cms-smid": true },
      catriaApproved: { "fb-creative-review": true },
      itemNotes: { "cms-smid": "Saved note" },
      submissionTasks: { "meta-business-verification": true },
      metaAdConformanceRecords: [
        {
          id: "meta-ad-1",
          label: "Lead form ad",
          status: "draft" as const,
          catriaApproved: false,
          readyToGo: false,
          createdAt: "2026-07-01T00:00:00.000Z",
          updatedAt: "2026-07-01T00:00:00.000Z",
        },
      ],
    };
    const cleared = clearedSubmissionChecklistState();

    expect(isSubmissionChecklistStateDirty(cleared, baseline)).toBe(true);

    const reverted = cloneSubmissionChecklistState(baseline);
    expect(isSubmissionChecklistStateDirty(reverted, baseline)).toBe(false);
    expect(reverted).toEqual(baseline);
  });

  it("clearedSubmissionChecklistState wipes all progress including site-verified defaults", () => {
    const cleared = clearedSubmissionChecklistState();
    const defaultEmpty = emptySubmissionChecklistState();
    const verifiedIds = siteVerifiedChecklistIds();

    expect(verifiedIds.length).toBeGreaterThan(0);
    for (const id of verifiedIds) {
      expect(defaultEmpty.completed[id]).toBe(true);
      expect(cleared.completed[id]).toBeUndefined();
    }

    expect(cleared.catriaReviewed).toEqual({});
    expect(cleared.catriaApproved).toEqual({});
    expect(cleared.catriaTaskFlags).toEqual({});
    expect(cleared.itemNotes).toEqual({});
    expect(cleared.itemAssignees).toEqual({});
    expect(cleared.sectionNotes).toEqual({});
    expect(cleared.submissionTasks).toEqual({});
    expect(cleared.submissionTaskReviewed).toEqual({});
    expect(cleared.submissionTaskApproved).toEqual({});
    expect(cleared.submissionCatriaTaskFlags).toEqual({});
    expect(cleared.submissionTaskNotes).toEqual({});
    expect(cleared.carrierTasks).toEqual([]);
    expect(cleared.carrierOriginalTasks).toEqual([]);
    expect(cleared.carrierTaskDone).toEqual({});
    expect(cleared.carrierTaskReviewed).toEqual({});
    expect(cleared.carrierTaskApproved).toEqual({});
    expect(cleared.carrierCatriaTaskFlags).toEqual({});
    expect(cleared.carrierTaskNotes).toEqual({});
    expect(cleared.carrierUploads).toEqual([]);
    expect(cleared.metaAdConformanceRecords).toEqual([]);
  });

  it("isSubmissionChecklistProgressCleared distinguishes cleared vs seeded defaults", () => {
    expect(isSubmissionChecklistProgressCleared(clearedSubmissionChecklistState())).toBe(true);
    expect(isSubmissionChecklistProgressCleared(emptySubmissionChecklistState())).toBe(false);
  });

  it("coalesceSubmissionChecklistStatesOnLoad keeps cleared local over stale server checkboxes", () => {
    const local = clearedSubmissionChecklistState();
    const server = {
      ...baseState(),
      completed: { "fb-copy-review": true },
      catriaApproved: { "fb-creative-review": true },
    };

    const merged = coalesceSubmissionChecklistStatesOnLoad(server, local);
    expect(merged.completed).toEqual({});
    expect(merged.catriaApproved).toEqual({});
  });
});
