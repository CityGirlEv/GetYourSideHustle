import { describe, expect, it } from "vitest";
import {
  SUBMISSION_TASK_ITEMS,
  PREP_OWNER_LABEL,
  PREP_OWNER_FILTER_LABEL,
  PREP_OWNER_TAB_LABEL,
  REVIEW_OWNER_FILTER_LABEL,
  REVIEW_OWNER_TAB_LABEL,
  siteVerifiedChecklistIds,
  submissionTaskDueStatus,
  allSubmissionChecklistItems,
  checklistItemsByCmsRequirementId,
  checklistItemMatchesAssigneeFilter,
  defaultChecklistItemAssignee,
  getChecklistItemAssignee,
  filterTasksByAssignee,
  isChecklistItemComplete,
  resolveChecklistItemStatus,
  statusFromCheckboxChecked,
  checklistItemStatusLabel,
  checklistItemMatchesStatusFilter,
  filterByChecklistItemStatus,
  isChecklistStatusFilterActive,
  ALL_CHECKLIST_ITEM_STATUSES,
} from "@/lib/submission-checklist-data";

describe("submission-checklist-data", () => {
  it("uses Evelyn as prep owner label", () => {
    expect(PREP_OWNER_LABEL).toBe("Evelyn");
  });

  it("each item defaults to both assignees and requires prep + review + approve", () => {
    const item = allSubmissionChecklistItems().find((i) => i.id === "fb-business-manager");
    expect(item?.owner).toBe("prep");
    expect(defaultChecklistItemAssignee(item!)).toBe("both");
    expect(
      isChecklistItemComplete(
        item!,
        { "fb-business-manager": true },
        {},
        { "fb-business-manager": true },
      ),
    ).toBe(false);
    expect(
      isChecklistItemComplete(
        item!,
        { "fb-business-manager": true },
        { "fb-business-manager": true },
        { "fb-business-manager": true },
      ),
    ).toBe(true);
    expect(
      isChecklistItemComplete(
        item!,
        { "fb-business-manager": true },
        {},
        {},
        { "fb-business-manager": { review: false, approve: false } },
      ),
    ).toBe(true);
  });

  it("review items require prep, review, and approve", () => {
    const item = allSubmissionChecklistItems().find((i) => i.id === "fb-copy-review");
    expect(item?.owner).toBe("review");
    expect(
      isChecklistItemComplete(
        item!,
        { "fb-copy-review": true },
        { "fb-copy-review": true },
        { "fb-copy-review": true },
      ),
    ).toBe(true);
  });

  it("Meta submission and targeting are Evelyn prep tasks", () => {
    const ids = allSubmissionChecklistItems().map((i) => i.id);
    const metaSubmission = allSubmissionChecklistItems().find((i) => i.id === "fb-meta-submission");
    const targeting = allSubmissionChecklistItems().find((i) => i.id === "fb-targeting-review");
    expect(ids).toContain("fb-meta-submission");
    expect(metaSubmission?.owner).toBe("prep");
    expect(targeting?.owner).toBe("prep");
  });
  it("lists site-verified checklist ids from production review", () => {
    const verified = siteVerifiedChecklistIds();
    expect(verified).toContain("fb-landing-url");
    expect(verified).toContain("cms-privacy-legal");
    expect(verified).not.toContain("gap-meta-pixel-live");
  });

  it("includes gap items in all checklist items", () => {
    const ids = allSubmissionChecklistItems().map((i) => i.id);
    expect(ids).toContain("gap-meta-pixel-live");
    expect(ids).toContain("gap-smid-registry");
    expect(ids).toContain("launch-guidde-walkthrough");
  });

  it("assigns Guidde walkthrough to Evelyn prep on website channel", () => {
    const item = allSubmissionChecklistItems().find((i) => i.id === "launch-guidde-walkthrough");
    expect(item?.owner).toBe("prep");
    expect(item?.channel).toBe("website");
  });

  it("maps checklist items to CMS requirement ids", () => {
    const byReq = checklistItemsByCmsRequirementId();
    const tpmoItems = byReq.get("tpmo-disclaimer") ?? [];
    expect(tpmoItems.map((i) => i.id)).toContain("cms-tpmo-disclaimer");
    expect(tpmoItems.map((i) => i.id)).toContain("fb-ad-copy-draft");
    expect(byReq.get("soa")?.map((i) => i.id)).toContain("cms-soa");
  });

  it("submission tasks are assigned to both with review + approve subtasks", () => {
    expect(SUBMISSION_TASK_ITEMS.length).toBeGreaterThanOrEqual(5);
    for (const task of SUBMISSION_TASK_ITEMS) {
      expect(task.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(task.assignee).toBe("both");
      expect(task.requiresCatriaApproval).toBe(true);
      expect(task.submissionTarget.length).toBeGreaterThan(0);
    }
  });

  it("submissionTaskDueStatus classifies dates", () => {
    expect(submissionTaskDueStatus("2020-01-01")).toBe("overdue");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const iso = tomorrow.toISOString().slice(0, 10);
    expect(submissionTaskDueStatus(iso)).toBe("due-soon");
  });

  it("My Name / Her Name filters include both-assignee submission tasks", () => {
    const task = SUBMISSION_TASK_ITEMS[0];
    expect(task).toBeDefined();
    expect(filterTasksByAssignee(SUBMISSION_TASK_ITEMS, "prep")).toContainEqual(task);
    expect(filterTasksByAssignee(SUBMISSION_TASK_ITEMS, "review")).toContainEqual(task);
  });

  it("defaults checklist item assignee to both", () => {
    const prepItem = allSubmissionChecklistItems().find((i) => i.owner === "prep");
    const reviewItem = allSubmissionChecklistItems().find((i) => i.owner === "review");
    expect(prepItem).toBeDefined();
    expect(reviewItem).toBeDefined();
    expect(defaultChecklistItemAssignee(prepItem!)).toBe("both");
    expect(defaultChecklistItemAssignee(reviewItem!)).toBe("both");
    expect(getChecklistItemAssignee(prepItem!)).toBe("both");
    expect(getChecklistItemAssignee(reviewItem!)).toBe("both");
  });

  it("prep items requiring Catria sign-off appear in Catria's List filter", () => {
    const item = allSubmissionChecklistItems().find((i) => i.id === "fb-meta-submission");
    expect(item?.owner).toBe("prep");
    expect(item?.requiresCatriaApproval).toBe(true);
    expect(checklistItemMatchesAssigneeFilter(item!, "review")).toBe(true);
    expect(checklistItemMatchesAssigneeFilter(item!, "prep")).toBe(true);
  });

  it("assignee override moves item between owner tabs", () => {
    const prepItem = allSubmissionChecklistItems().find((i) => i.owner === "prep");
    expect(prepItem).toBeDefined();
    const reassigned = { [prepItem!.id]: "review" as const };
    expect(checklistItemMatchesAssigneeFilter(prepItem!, "review", reassigned)).toBe(true);
    expect(getChecklistItemAssignee(prepItem!, reassigned)).toBe("review");
  });

  it("both assignee appears in Evelyn and Catria owner tabs", () => {
    const item = allSubmissionChecklistItems().find((i) => i.id === "fb-meta-submission");
    expect(item).toBeDefined();
    const bothAssignee = { [item!.id]: "both" as const };
    expect(checklistItemMatchesAssigneeFilter(item!, "prep", bothAssignee)).toBe(true);
    expect(checklistItemMatchesAssigneeFilter(item!, "review", bothAssignee)).toBe(true);
  });

  it("status helpers label and derive workflow status", () => {
    expect(statusFromCheckboxChecked(true)).toBe("done");
    expect(statusFromCheckboxChecked(false)).toBe("not_started");
    expect(resolveChecklistItemStatus("x", {})).toBe("not_started");
    expect(resolveChecklistItemStatus("x", { x: "in_progress" })).toBe("in_progress");
    expect(checklistItemStatusLabel("done")).toBe("Done");
  });

  describe("checklist status filter", () => {
    const itemStatuses = {
      a: "not_started" as const,
      b: "in_progress" as const,
      c: "done" as const,
    };
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

    it("empty selection shows all items", () => {
      expect(checklistItemMatchesStatusFilter("a", itemStatuses, new Set())).toBe(true);
      expect(filterByChecklistItemStatus(items, itemStatuses, [])).toEqual(items);
      expect(isChecklistStatusFilterActive(new Set())).toBe(false);
    });

    it("all statuses selected shows all items", () => {
      const all = new Set(ALL_CHECKLIST_ITEM_STATUSES);
      expect(checklistItemMatchesStatusFilter("a", itemStatuses, all)).toBe(true);
      expect(filterByChecklistItemStatus(items, itemStatuses, all)).toEqual(items);
      expect(isChecklistStatusFilterActive(all)).toBe(false);
    });

    it("single status filters to matching items only", () => {
      const doneOnly = new Set<"done">(["done"]);
      expect(filterByChecklistItemStatus(items, itemStatuses, doneOnly)).toEqual([{ id: "c" }]);
      expect(isChecklistStatusFilterActive(doneOnly)).toBe(true);
    });

    it("multiselect matches ANY selected status", () => {
      const notStartedAndDone = new Set(["not_started", "done"] as const);
      expect(filterByChecklistItemStatus(items, itemStatuses, notStartedAndDone)).toEqual([
        { id: "a" },
        { id: "c" },
      ]);
      expect(checklistItemMatchesStatusFilter("b", itemStatuses, notStartedAndDone)).toBe(false);
      expect(checklistItemMatchesStatusFilter("a", itemStatuses, notStartedAndDone)).toBe(true);
    });

    it("uses resolveChecklistItemStatus for missing keys", () => {
      expect(checklistItemMatchesStatusFilter("missing", itemStatuses, new Set(["not_started"]))).toBe(
        true,
      );
      expect(checklistItemMatchesStatusFilter("missing", itemStatuses, new Set(["done"]))).toBe(false);
    });
  });
});
