import { describe, expect, it } from "vitest";
import {
  DEFAULT_GUIDE_ASSIGNEE,
  effectiveGuideAssignee,
  formatGuideAssigneeIds,
  guideAssigneeClickSelection,
  guideAssigneeFilterRoster,
  guideAssigneeRoster,
  guideIdFromLinkedReviewCase,
  guideLibraryAssigneeSelection,
  linkedGuideReviewCaseId,
  nextSingleGuideAssignee,
  normalizeGuideAssigneeId,
} from "../guide-assignee";
import { sanitizeGuideCatalogPatch } from "../guide-catalog-state";

describe("guide assignee helpers", () => {
  it("normalizes human testers and clears unassigned / suite runners", () => {
    expect(normalizeGuideAssigneeId(" Tina ")).toBe("tina");
    expect(normalizeGuideAssigneeId("unassigned")).toBe("");
    expect(normalizeGuideAssigneeId("")).toBe("");
    expect(normalizeGuideAssigneeId("vitest")).toBe("");
    expect(normalizeGuideAssigneeId("playwright")).toBe("");
  });

  it("falls back to linked-test assignee then catalog default", () => {
    expect(effectiveGuideAssignee("evelyn")).toBe("evelyn");
    expect(effectiveGuideAssignee("", "tina")).toBe("tina");
    expect(effectiveGuideAssignee(undefined, "")).toBe(DEFAULT_GUIDE_ASSIGNEE);
  });

  it("replaces the assignee on single-select (does not append)", () => {
    expect(nextSingleGuideAssignee(["lyriq"], "tina")).toEqual(["tina"]);
    expect(nextSingleGuideAssignee(["tina"], "tina")).toBeNull();
    expect(formatGuideAssigneeIds(["lyriq", "tina"])).toBe("lyriq");
    expect(formatGuideAssigneeIds(["tina"])).toBe("tina");
  });

  it("Library chips treat empty patch as Unassigned, not the Lyriq catalog default", () => {
    expect(guideLibraryAssigneeSelection(undefined)).toEqual([]);
    expect(guideLibraryAssigneeSelection("")).toEqual([]);
    expect(guideLibraryAssigneeSelection("unassigned")).toEqual([]);
    expect(guideLibraryAssigneeSelection("evelyn")).toEqual(["evelyn"]);
  });

  it("clicking a displayed-but-unsaved assignee still persists it", () => {
    expect(guideAssigneeClickSelection("", ["lyriq"], "lyriq")).toEqual(["lyriq"]);
    expect(guideAssigneeClickSelection("lyriq", ["lyriq"], "lyriq")).toBeNull();
    expect(guideAssigneeClickSelection("", [], "evelyn")).toEqual(["evelyn"]);
    expect(guideAssigneeClickSelection("tina", ["tina"], "evelyn")).toEqual(["evelyn"]);
  });

  it("filter roster only includes QAs who already have guide assignments", () => {
    const roster = guideAssigneeFilterRoster({
      guidePatchAssignees: ["tina", "", "evelyn+lyriq", "unassigned"],
    });
    expect(roster.map((t) => t.id).sort()).toEqual(["evelyn", "lyriq", "tina"]);
    expect(roster.some((t) => t.id === "candace")).toBe(false);
    expect(roster.some((t) => t.id === "teejay")).toBe(false);
  });

  it("nav/assign roster always lists catalog QAs even with no assignments yet", () => {
    const roster = guideAssigneeRoster({ guidePatchAssignees: [] });
    expect(roster.map((t) => t.id)).toEqual(
      expect.arrayContaining(["candace", "evelyn", "lyriq", "teejay", "tina"]),
    );
  });

  it("links guide id ↔ primary GUIDE-REV case", () => {
    const caseId = linkedGuideReviewCaseId("handyman");
    expect(caseId).toMatch(/^GUIDE-REV-(launch|kids|junior|senior)-handyman$/);
    expect(guideIdFromLinkedReviewCase(caseId!)).toBe("handyman");
    expect(guideIdFromLinkedReviewCase("QA-OTHER-1")).toBeNull();
  });
});

describe("sanitizeGuideCatalogPatch assignee", () => {
  it("keeps assignee on content patches", () => {
    const patch = sanitizeGuideCatalogPatch({
      name: "Mobile Handyman",
      assignee: "  Tina ",
    });
    expect(patch?.assignee).toBe("tina");
  });

  it("keeps only the first assignee when given a legacy multi value", () => {
    const patch = sanitizeGuideCatalogPatch({ assignee: "lyriq+tina" });
    expect(patch?.assignee).toBe("lyriq");
  });

  it("allows clearing assignee to empty string", () => {
    const patch = sanitizeGuideCatalogPatch({ assignee: "unassigned" });
    expect(patch?.assignee).toBe("");
  });

  it("drops automated suite owners from assignee", () => {
    const patch = sanitizeGuideCatalogPatch({ assignee: "vitest" });
    expect(patch?.assignee).toBe("");
  });
});
