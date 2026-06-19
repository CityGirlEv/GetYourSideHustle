import { describe, it, expect } from "vitest";
import {
  CLOUD_RELOAD_GUARD_MS,
  checkedStepsEqual,
  clearRecentLocalWrites,
  disengageTestIds,
  mergeStatusesRespectingRecentWrites,
  omitMatchingCheckedStepDrafts,
  omitMatchingStatusDrafts,
  omitMatchingStringDrafts,
  omitTestDraft,
  resolveSavedStatusBaseline,
  isMetadataOnlyPendingChanges,
  shouldForceInProgressStatus,
  shouldSkipCloudReload,
  statusFilterMatchesOrEngaged,
  testIdsFromPendingKeys,
  touchCloudReloadCooldown,
  unionDiscardTestIds,
} from "../testing-drafts";

describe("testing-drafts", () => {
  it("resolveSavedStatusBaseline inherits unsuffixed source status", () => {
    const saved = { "AUTH-001": "fail" as const };
    expect(resolveSavedStatusBaseline(saved, "AUTH-001-PHONE")).toBe("fail");
    expect(resolveSavedStatusBaseline(saved, "AUTH-001")).toBe("fail");
  });

  it("shouldSkipCloudReload blocks while drafts, save, or cooldown active", () => {
    const now = 1_000_000;
    expect(
      shouldSkipCloudReload({ pendingCount: 1, saveInFlight: false, cooldownUntil: 0, now }),
    ).toBe(true);
    expect(
      shouldSkipCloudReload({ pendingCount: 0, saveInFlight: true, cooldownUntil: 0, now }),
    ).toBe(true);
    expect(
      shouldSkipCloudReload({ pendingCount: 0, saveInFlight: false, cooldownUntil: now + 1, now }),
    ).toBe(true);
    expect(
      shouldSkipCloudReload({ pendingCount: 0, saveInFlight: false, cooldownUntil: now - 1, now }),
    ).toBe(false);
  });

  it("mergeStatusesRespectingRecentWrites keeps fresh React statuses over stale local", () => {
    const recent = new Map([["T-1", 2_000]]);
    const merged = mergeStatusesRespectingRecentWrites(
      { "T-1": "not_run", "T-2": "pass" },
      { "T-1": "fail", "T-2": "pass" },
      recent,
      2_000 + CLOUD_RELOAD_GUARD_MS - 1,
    );
    expect(merged["T-1"]).toBe("fail");
    expect(merged["T-2"]).toBe("pass");
  });

  it("mergeStatusesRespectingRecentWrites uses loaded data after guard expires", () => {
    const recent = new Map([["T-1", 0]]);
    const merged = mergeStatusesRespectingRecentWrites(
      { "T-1": "not_run" },
      { "T-1": "fail" },
      recent,
      CLOUD_RELOAD_GUARD_MS + 1,
    );
    expect(merged["T-1"]).toBe("not_run");
  });

  it("touchCloudReloadCooldown extends the guard window", () => {
    const ref = { current: 0 };
    touchCloudReloadCooldown(ref, 3000, 100);
    expect(ref.current).toBe(3100);
  });

  it("omitTestDraft removes one test without cloning when absent", () => {
    const draft = { A: "pass" as const };
    expect(omitTestDraft(draft, "B")).toBe(draft);
    expect(omitTestDraft(draft, "A")).toEqual({});
  });

  it("testIdsFromPendingKeys dedupes ids from change keys", () => {
    expect(testIdsFromPendingKeys(["A:status", "A:qaNote", "B:checkedSteps"])).toEqual(["A", "B"]);
  });

  it("disengageTestIds returns the same set when no ids match", () => {
    const engaged = new Set(["A"]);
    expect(disengageTestIds(engaged, ["B"])).toBe(engaged);
    expect(disengageTestIds(engaged, ["A"])).toEqual(new Set());
  });

  it("statusFilterMatchesOrEngaged keeps engaged tests visible after auto-start", () => {
    const engaged = new Set(["T-1"]);
    expect(statusFilterMatchesOrEngaged(["not_run"], "not_run", "T-1", engaged)).toBe(true);
    expect(statusFilterMatchesOrEngaged(["not_run"], "in_progress", "T-1", engaged)).toBe(true);
    expect(statusFilterMatchesOrEngaged(["not_run"], "in_progress", "T-2", engaged)).toBe(false);
    expect(statusFilterMatchesOrEngaged([], "in_progress", "T-2", engaged)).toBe(true);
  });

  it("isMetadataOnlyPendingChanges is true only for owner/sprint drafts", () => {
    expect(
      isMetadataOnlyPendingChanges("T-1", [
        { testId: "T-1", field: "assignee" },
        { testId: "T-1", field: "devAssignee" },
      ]),
    ).toBe(true);
    expect(isMetadataOnlyPendingChanges("T-1", [{ testId: "T-1", field: "assignee" }])).toBe(
      true,
    );
    expect(
      isMetadataOnlyPendingChanges("T-1", [
        { testId: "T-1", field: "assignee" },
        { testId: "T-1", field: "status" },
      ]),
    ).toBe(false);
    expect(isMetadataOnlyPendingChanges("T-1", [])).toBe(false);
  });

  it("shouldForceInProgressStatus starts not_run tests when a step is checked", () => {
    expect(shouldForceInProgressStatus(false, "not_run", true)).toBe(true);
    expect(shouldForceInProgressStatus(false, "not_run", false)).toBe(false);
    expect(shouldForceInProgressStatus(true, "not_run", true)).toBe(false);
    expect(shouldForceInProgressStatus(false, "in_progress", true)).toBe(false);
    expect(shouldForceInProgressStatus(false, "pass", true)).toBe(true);
    expect(shouldForceInProgressStatus(false, "fail", true)).toBe(false);
  });

  it("unionDiscardTestIds merges pending and engaged ids", () => {
    expect(
      unionDiscardTestIds([{ key: "A:status" }, { key: "B:qaNote" }], new Set(["B", "C"])).sort(),
    ).toEqual(["A", "B", "C"]);
  });

  it("clearRecentLocalWrites removes selected ids or clears all", () => {
    const recent = new Map([
      ["A", 1],
      ["B", 2],
    ]);
    clearRecentLocalWrites(recent, ["A"]);
    expect(recent.has("A")).toBe(false);
    expect(recent.get("B")).toBe(2);
    clearRecentLocalWrites(recent);
    expect(recent.size).toBe(0);
  });

  it("checkedStepsEqual ignores step/substep order", () => {
    expect(
      checkedStepsEqual(
        { steps: [2, 0, 1], substeps: ["1-b", "1-a"] },
        { steps: [1, 2, 0], substeps: ["1-a", "1-b"] },
      ),
    ).toBe(true);
  });

  it("omitMatchingCheckedStepDrafts removes rows that match saved baseline", () => {
    const draft = {
      A: { steps: [0], substeps: [] as string[] },
      B: { steps: [1], substeps: [] as string[] },
    };
    const saved = { A: { steps: [0], substeps: [] as string[] } };
    expect(omitMatchingCheckedStepDrafts(draft, saved)).toEqual({
      B: { steps: [1], substeps: [] },
    });
  });

  it("omitMatchingStatusDrafts removes rows that match saved baseline", () => {
    const draft = { A: "pass" as const, B: "fail" as const };
    const saved = { A: "pass" as const };
    expect(omitMatchingStatusDrafts(draft, saved)).toEqual({ B: "fail" });
  });

  it("omitMatchingStringDrafts uses resolver when provided", () => {
    const draft = { A: "note", B: "other" };
    const saved = { A: "old" };
    expect(omitMatchingStringDrafts(draft, saved, (id) => (id === "A" ? "note" : ""))).toEqual({
      B: "other",
    });
  });
});
