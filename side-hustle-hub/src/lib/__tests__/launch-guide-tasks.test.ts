import { describe, expect, it } from "vitest";
import {
  ensureGuideReviewTasks,
  ensureSeniorPageReviewTask,
  SENIOR_PAGE_REVIEW_DESC,
  SENIOR_PAGE_REVIEW_TASK_ID,
  type GyshTask,
} from "../gysh-tasks";
import { LAUNCH_GUIDES, guideReviewTaskId } from "../launch-guides";

describe("ensureGuideReviewTasks", () => {
  it("creates one review task per launch guide when empty", () => {
    const { tasks, created } = ensureGuideReviewTasks([]);
    expect(created).toHaveLength(LAUNCH_GUIDES.length);
    expect(tasks).toHaveLength(LAUNCH_GUIDES.length);
    for (const g of LAUNCH_GUIDES) {
      const t = created.find((x) => x.id === guideReviewTaskId(g.id));
      expect(t).toBeTruthy();
      expect(t!.assignedTo).toBe("Both");
      expect(t!.status).toBe("not_started");
      expect(t!.category).toBe("content");
      expect(t!.priority).toBe("P1");
      expect(t!.description).toContain(g.name);
    }
  });

  it("is idempotent on re-run", () => {
    const first = ensureGuideReviewTasks([]);
    const second = ensureGuideReviewTasks(first.tasks);
    expect(second.created).toHaveLength(0);
    expect(second.tasks).toHaveLength(LAUNCH_GUIDES.length);
  });

  it("skips guides that already have a matching description", () => {
    const existing: GyshTask[] = [
      {
        id: "T-999",
        description: "Review Launch Guide: Airbnb Hosting — verify steps, costs, and verbiage",
        category: "content",
        priority: "P1",
        status: "not_started",
        assignBy: "Evelyn",
        assignedTo: "Both",
        dateAssigned: "07/16/26",
        dueDate: "",
        dateCompleted: "",
        notes: "",
        attachments: [],
      },
    ];
    const { created } = ensureGuideReviewTasks(existing);
    expect(created.find((t) => t.id === guideReviewTaskId("airbnb"))).toBeUndefined();
    expect(created).toHaveLength(LAUNCH_GUIDES.length - 1);
  });
});

describe("ensureSeniorPageReviewTask", () => {
  it("creates a Both-assigned Senior Side Hustles review task", () => {
    const { created } = ensureSeniorPageReviewTask([]);
    expect(created).toHaveLength(1);
    expect(created[0].id).toBe(SENIOR_PAGE_REVIEW_TASK_ID);
    expect(created[0].description).toBe(SENIOR_PAGE_REVIEW_DESC);
    expect(created[0].assignedTo).toBe("Both");
    expect(created[0].category).toBe("senior_side_hustles");
  });

  it("is idempotent", () => {
    const first = ensureSeniorPageReviewTask([]);
    const second = ensureSeniorPageReviewTask(first.tasks);
    expect(second.created).toHaveLength(0);
  });
});
