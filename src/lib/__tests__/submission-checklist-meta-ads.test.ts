import { describe, expect, it } from "vitest";
import {
  countMetaAdConformanceProgress,
  createMetaAdConformanceRecord,
  deriveMetaAdStatus,
  filterMetaAdRecordsByAssignee,
  getMetaAdRecordAssignee,
  isMetaAdRecordComplete,
  mergeMetaAdConformanceRecords,
  metaAdRecordMatchesAssigneeFilter,
  parseMetaAdConformanceRecords,
  withDerivedMetaAdStatus,
} from "@/lib/submission-checklist-meta-ads";

describe("submission-checklist-meta-ads", () => {
  it("derives status from dates, Catria sign-off, and ready flag", () => {
    const draft = createMetaAdConformanceRecord("Test");
    expect(deriveMetaAdStatus(draft)).toBe("draft");

    const submitted = withDerivedMetaAdStatus({
      ...draft,
      dateSubmitted: "2026-07-01",
    });
    expect(deriveMetaAdStatus(submitted)).toBe("submitted");

    const approvedDateOnly = withDerivedMetaAdStatus({
      ...submitted,
      dateApproved: "2026-07-02",
    });
    expect(deriveMetaAdStatus(approvedDateOnly)).toBe("submitted");

    const approved = withDerivedMetaAdStatus({
      ...approvedDateOnly,
      catriaApproved: true,
      catriaReviewedAt: "2026-07-02",
    });
    expect(deriveMetaAdStatus(approved)).toBe("approved");

    const ready = withDerivedMetaAdStatus({
      ...approved,
      readyToGo: true,
    });
    expect(deriveMetaAdStatus(ready)).toBe("ready");
    expect(isMetaAdRecordComplete(ready)).toBe(true);
  });

  it("counts ready records for progress", () => {
    const a = withDerivedMetaAdStatus({
      ...createMetaAdConformanceRecord("A"),
      dateSubmitted: "2026-07-01",
      dateApproved: "2026-07-02",
      catriaApproved: true,
      readyToGo: true,
    });
    const b = createMetaAdConformanceRecord("B");
    expect(countMetaAdConformanceProgress([a, b])).toEqual({ done: 1, total: 2, percent: 50 });
  });

  it("merges records by id preferring newer updatedAt", () => {
    const id = "meta-ad-1";
    const server = withDerivedMetaAdStatus({
      ...createMetaAdConformanceRecord("Server label"),
      id,
      label: "Server label",
      updatedAt: "2026-07-01T00:00:00.000Z",
    });
    const local = withDerivedMetaAdStatus({
      ...createMetaAdConformanceRecord("Local label"),
      id,
      label: "Local label",
      dateSubmitted: "2026-07-03",
      catriaApproved: true,
      updatedAt: "2026-07-03T00:00:00.000Z",
    });
    const merged = mergeMetaAdConformanceRecords([server], [local]);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.label).toBe("Local label");
    expect(merged[0]?.dateSubmitted).toBe("2026-07-03");
    expect(merged[0]?.catriaApproved).toBe(true);
  });

  it("defaults new records to prep assignee", () => {
    const record = createMetaAdConformanceRecord("New ad");
    expect(getMetaAdRecordAssignee(record)).toBe("prep");
  });

  it("filters records by owner tab like checklist assignee rules", () => {
    const pending = createMetaAdConformanceRecord("Pending");
    const evDone = withDerivedMetaAdStatus({
      ...createMetaAdConformanceRecord("Ev done"),
      catriaApproved: true,
      dateApproved: "2026-07-02",
      dateSubmitted: "2026-07-01",
      assignee: "prep",
    });
    const catAssigned = withDerivedMetaAdStatus({
      ...createMetaAdConformanceRecord("Cat track"),
      assignee: "review",
      catriaApproved: true,
      dateApproved: "2026-07-02",
      readyToGo: true,
    });
    const records = [pending, evDone, catAssigned];

    expect(metaAdRecordMatchesAssigneeFilter(pending, "all")).toBe(true);
    expect(metaAdRecordMatchesAssigneeFilter(pending, "prep")).toBe(true);
    expect(metaAdRecordMatchesAssigneeFilter(pending, "review")).toBe(true);

    expect(metaAdRecordMatchesAssigneeFilter(evDone, "prep")).toBe(true);
    expect(metaAdRecordMatchesAssigneeFilter(evDone, "review")).toBe(false);

    expect(metaAdRecordMatchesAssigneeFilter(catAssigned, "prep")).toBe(false);
    expect(metaAdRecordMatchesAssigneeFilter(catAssigned, "review")).toBe(true);

    expect(filterMetaAdRecordsByAssignee(records, "prep")).toHaveLength(2);
    expect(filterMetaAdRecordsByAssignee(records, "review")).toHaveLength(2);
  });

  it("counts progress per owner tab on filtered records", () => {
    const ready = withDerivedMetaAdStatus({
      ...createMetaAdConformanceRecord("Ready"),
      dateSubmitted: "2026-07-01",
      dateApproved: "2026-07-02",
      catriaApproved: true,
      readyToGo: true,
      assignee: "prep",
    });
    const pending = createMetaAdConformanceRecord("Pending");
    const prepPool = filterMetaAdRecordsByAssignee([ready, pending], "prep");
    expect(countMetaAdConformanceProgress(prepPool)).toEqual({ done: 1, total: 2, percent: 50 });
  });

  it("merges assignee from newer record", () => {
    const id = "meta-ad-assignee";
    const server = withDerivedMetaAdStatus({
      ...createMetaAdConformanceRecord("Server"),
      id,
      assignee: "prep",
      updatedAt: "2026-07-01T00:00:00.000Z",
    });
    const local = withDerivedMetaAdStatus({
      ...createMetaAdConformanceRecord("Local"),
      id,
      assignee: "review",
      updatedAt: "2026-07-03T00:00:00.000Z",
    });
    const merged = mergeMetaAdConformanceRecords([server], [local]);
    expect(merged[0]?.assignee).toBe("review");
  });

  it("parses assignee from persisted payloads", () => {
    const parsed = parseMetaAdConformanceRecords([
      {
        id: "meta-ad-y",
        label: "Video",
        status: "draft",
        assignee: "review",
        catriaApproved: false,
        readyToGo: false,
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
      {
        id: "meta-ad-z",
        label: "Bad assignee",
        status: "draft",
        assignee: "invalid",
        catriaApproved: false,
        readyToGo: false,
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
    ]);
    expect(parsed[0]?.assignee).toBe("review");
    expect(parsed[1]?.assignee).toBeUndefined();
    expect(getMetaAdRecordAssignee(parsed[1]!)).toBe("prep");
  });

  it("parses persisted record payloads safely", () => {
    const parsed = parseMetaAdConformanceRecords([
      {
        id: "meta-ad-x",
        label: "Carousel",
        status: "submitted",
        dateSubmitted: "2026-07-01",
        dateApproved: "2026-07-02",
        catriaApproved: true,
        catriaReviewedAt: "2026-07-02",
        readyToGo: false,
        checklistProgress: {
          "fb-creative-assets": { prepDone: true, note: "Verified" },
          "fb-copy-review": { catriaApproved: true },
        },
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
      null,
      { id: "bad" },
    ]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.status).toBe("approved");
    expect(parsed[0]?.catriaApproved).toBe(true);
    expect(parsed[0]?.checklistProgress?.["fb-creative-assets"]).toEqual({
      prepDone: true,
      note: "Verified",
    });
    expect(parsed[0]?.checklistProgress?.["fb-copy-review"]).toEqual({
      catriaApproved: true,
    });
  });

  it("merges checklistProgress unioning checked flags", () => {
    const id = "meta-ad-checklist";
    const server = withDerivedMetaAdStatus({
      ...createMetaAdConformanceRecord("Server"),
      id,
      checklistProgress: { "fb-creative-assets": { prepDone: true } },
      updatedAt: "2026-07-01T00:00:00.000Z",
    });
    const local = withDerivedMetaAdStatus({
      ...createMetaAdConformanceRecord("Local"),
      id,
      checklistProgress: { "fb-copy-review": { catriaApproved: true } },
      updatedAt: "2026-07-03T00:00:00.000Z",
    });
    const merged = mergeMetaAdConformanceRecords([server], [local]);
    expect(merged[0]?.checklistProgress).toEqual({
      "fb-creative-assets": { prepDone: true },
      "fb-copy-review": { catriaApproved: true },
    });
  });
});
