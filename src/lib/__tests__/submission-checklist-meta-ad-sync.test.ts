import { describe, expect, it } from "vitest";
import { createMetaAdConformanceRecord } from "@/lib/submission-checklist-meta-ads";
import {
  applyMainChecklistItemPatch,
  buildMetaAdChecklistProgressFromGlobal,
  groupMetaAdConformanceChecklistByCategory,
  isMetaAdConformanceChecklistItem,
  metaAdConformanceChecklistItems,
  propagateGlobalChecklistItemToMetaAds,
  resolveMetaAdChecklistItemProgress,
  seedMetaAdRecordFromGlobalChecklist,
  updateMetaAdRecordChecklistProgress,
} from "@/lib/submission-checklist-meta-ad-sync";
import type { SubmissionChecklistState } from "@/lib/submission-checklist-storage";

import { emptySubmissionChecklistTestState } from "@/lib/__tests__/submission-checklist-test-helpers";

const baseState = (): SubmissionChecklistState =>
  emptySubmissionChecklistTestState({
    metaAdConformanceRecords: [
      createMetaAdConformanceRecord("Ad A"),
      createMetaAdConformanceRecord("Ad B"),
    ],
  });

describe("submission-checklist-meta-ad-sync", () => {
  it("includes CMS section, creative/copy Facebook items, and meta-ad gaps", () => {
    expect(isMetaAdConformanceChecklistItem("fb-creative-assets")).toBe(true);
    expect(isMetaAdConformanceChecklistItem("cms-mpd-disclaimer")).toBe(true);
    expect(isMetaAdConformanceChecklistItem("gap-smid-registry")).toBe(true);
    expect(isMetaAdConformanceChecklistItem("fb-business-manager")).toBe(false);
    expect(isMetaAdConformanceChecklistItem("launch-readiness")).toBe(false);

    const ids = metaAdConformanceChecklistItems().map((item) => item.id);
    expect(ids).toContain("fb-creative-assets");
    expect(ids).toContain("cms-compliance-signoff");
    expect(ids).toContain("gap-mobile-disclaimer-placement");
  });

  it("groups linked items by checklist section with channel labels", () => {
    const groups = groupMetaAdConformanceChecklistByCategory();
    const sectionIds = groups.map((group) => group.sectionId);
    expect(sectionIds).toContain("facebook");
    expect(sectionIds).toContain("cms");
    expect(sectionIds).toContain("gaps");

    const facebook = groups.find((group) => group.sectionId === "facebook");
    expect(facebook?.channelLabel).toBe("Meta");
    expect(facebook?.items.some((item) => item.id === "fb-creative-assets")).toBe(true);
  });

  it("inherits global checklist checks on each ad record", () => {
    const state = baseState();
    const item = metaAdConformanceChecklistItems().find((i) => i.id === "fb-creative-assets")!;

    const synced = applyMainChecklistItemPatch(state, "fb-creative-assets", {
      completed: { "fb-creative-assets": true },
      catriaReviewed: { "fb-creative-assets": true },
      catriaApproved: { "fb-creative-assets": true },
    });

    for (const record of synced.metaAdConformanceRecords) {
      expect(record.checklistProgress?.["fb-creative-assets"]?.prepDone).toBe(true);
      const resolved = resolveMetaAdChecklistItemProgress(item, synced, record.checklistProgress);
      expect(resolved.prepDone).toBe(true);
      expect(resolved.inheritedFromGlobal.prepDone).toBe(true);
      expect(resolved.complete).toBe(true);
    }
  });

  it("propagates Catria approval from main checklist to all ads", () => {
    const state = baseState();
    const synced = applyMainChecklistItemPatch(state, "fb-copy-review", {
      catriaApproved: { "fb-copy-review": true },
    });

    for (const record of synced.metaAdConformanceRecords) {
      expect(record.checklistProgress?.["fb-copy-review"]?.catriaApproved).toBe(true);
    }
  });

  it("allows per-ad progress when global is unchecked", () => {
    const state = baseState();
    const recordId = state.metaAdConformanceRecords[0]!.id;

    const updated = updateMetaAdRecordChecklistProgress(state, recordId, "cms-mpd-disclaimer", {
      prepDone: true,
    });

    const record = updated.metaAdConformanceRecords.find((r) => r.id === recordId)!;
    expect(record.checklistProgress?.["cms-mpd-disclaimer"]?.prepDone).toBe(true);
    expect(updated.metaAdConformanceRecords[1]?.checklistProgress?.["cms-mpd-disclaimer"]).toBeUndefined();
  });

  it("blocks unchecking on ad when global checklist is checked", () => {
    const state = applyMainChecklistItemPatch(baseState(), "fb-creative-assets", {
      completed: { "fb-creative-assets": true },
    });
    const recordId = state.metaAdConformanceRecords[0]!.id;

    const updated = updateMetaAdRecordChecklistProgress(state, recordId, "fb-creative-assets", {
      prepDone: false,
    });

    const record = updated.metaAdConformanceRecords.find((r) => r.id === recordId)!;
    expect(record.checklistProgress?.["fb-creative-assets"]?.prepDone).toBe(true);
  });

  it("seeds new ad records from global checklist state", () => {
    const state = applyMainChecklistItemPatch(baseState(), "cms-smid", {
      completed: { "cms-smid": true },
      itemNotes: { "cms-smid": "SMID-123" },
    });

    const seeded = seedMetaAdRecordFromGlobalChecklist(createMetaAdConformanceRecord("New"), state);
    expect(seeded.checklistProgress?.["cms-smid"]).toEqual({
      prepDone: true,
      catriaApproved: false,
      note: "SMID-123",
    });
  });

  it("builds global progress map for all linked items", () => {
    const progress = buildMetaAdChecklistProgressFromGlobal({
      completed: { "fb-ad-copy-draft": true },
      catriaApproved: { "fb-copy-review": true },
      itemNotes: {},
    });
    expect(progress["fb-ad-copy-draft"]?.prepDone).toBe(true);
    expect(progress["fb-copy-review"]?.catriaApproved).toBe(true);
    expect(progress["fb-creative-assets"]).toBeUndefined();
  });

  it("no-ops propagate for non-linked checklist items", () => {
    const state = baseState();
    const input = { ...state, completed: { "fb-business-manager": true } };
    const next = propagateGlobalChecklistItemToMetaAds(input, "fb-business-manager");
    expect(next).toBe(input);
    expect(next.metaAdConformanceRecords[0]?.checklistProgress).toBeUndefined();
  });
});
