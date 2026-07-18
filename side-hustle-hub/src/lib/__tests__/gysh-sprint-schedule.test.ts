import { describe, expect, it } from "vitest";
import {
  TASK_SPRINT_MAP,
  commitPlanSprintPlan,
  commitTaskSprintPlan,
  suggestedSprintForTask,
  suggestedSprintForTest,
} from "../gysh-sprint-board";
import { BACKLOG_SPRINT, buildDefaultPlanItems } from "../gysh-sprints";
import { WIZARD_SCENARIO_CASES } from "../gysh-wizard-scenarios";

describe("sprint schedule assignments", () => {
  it("places every launch-guide review task into post-launch sprints 3–4", () => {
    const lg = Object.entries(TASK_SPRINT_MAP).filter(([id]) => id.startsWith("T-LG-"));
    expect(lg.length).toBe(15);
    for (const [, sprint] of lg) {
      expect(sprint).toBeGreaterThanOrEqual(3);
      expect(sprint).toBeLessThanOrEqual(4);
    }
  });

  it("keeps public launch path in sprints 0–2 and defers workshops/senior/SEO", () => {
    expect(suggestedSprintForTask({ id: "T-003", category: "facebook_social", notes: "" })).toBe(0);
    expect(suggestedSprintForTask({ id: "T-005", category: "website", notes: "" })).toBe(1);
    expect(suggestedSprintForTask({ id: "T-017", category: "content", notes: "" })).toBe(1);
    expect(suggestedSprintForTask({ id: "T-018", category: "workshops", notes: "" })).toBe(3);
    expect(suggestedSprintForTask({ id: "T-SENIOR-PAGE", category: "senior_side_hustles", notes: "" })).toBe(3);
    expect(suggestedSprintForTask({ id: "T-006", category: "admin_ops", notes: "" })).toBe(3);
    expect(suggestedSprintForTask({ id: "T-009", category: "website", notes: "" })).toBe(3);
  });

  it("maps growth tasks T-015/T-016 to Sprint 4", () => {
    expect(suggestedSprintForTask({ id: "T-015", category: "admin_ops", notes: "" })).toBe(4);
    expect(suggestedSprintForTask({ id: "T-016", category: "content", notes: "" })).toBe(4);
  });

  it("spreads wizard FMSH matrices across sprints 4–6", () => {
    const kids = WIZARD_SCENARIO_CASES.find(
      (c) => c.area === "Kids Get Your Side Hustle",
    )!;
    const jr = WIZARD_SCENARIO_CASES.find(
      (c) => c.area === "Junior Get Your Side Hustle",
    )!;
    const adult = WIZARD_SCENARIO_CASES.find((c) => c.area === "Adult Get Your Side Hustle")!;
    const senior = WIZARD_SCENARIO_CASES.find((c) => c.area === "Senior Get Your Side Hustle")!;
    expect(suggestedSprintForTest(kids)).toBe(4);
    expect(suggestedSprintForTest(jr)).toBe(5);
    expect(suggestedSprintForTest(adult)).toBe(5);
    expect(suggestedSprintForTest(senior)).toBe(6);
  });

  it("commitPlanSprintPlan moves workshops post-launch and upserts soft-launch milestones", () => {
    const backlogish = buildDefaultPlanItems().map((i) =>
      i.id === "s0-workshops"
        ? { ...i, sprint: 0, date: "2026-07-17", dateLabel: "Jul 17, 2026" }
        : i,
    ).filter((i) => i.id !== "s2-world-launch");
    const { items, changed } = commitPlanSprintPlan(backlogish, new Date(2026, 6, 16));
    expect(changed).toBe(true);
    expect(items.find((i) => i.id === "s0-workshops")?.sprint).toBe(3);
    expect(items.some((i) => i.id === "s2-world-launch" && i.sprint === 2)).toBe(true);
  });

  it("commitTaskSprintPlan assigns backlog tasks", () => {
    const tasks = [
      {
        id: "T-LG-airbnb",
        description: "x",
        category: "content" as const,
        priority: "P2" as const,
        status: "not_started" as const,
        assignBy: "Tina",
        assignedTo: "Both" as const,
        dateAssigned: "",
        dueDate: "",
        dateCompleted: "",
        notes: "",
        sprint: BACKLOG_SPRINT,
        tinaDone: false,
        evelynDone: false,
        attachments: [],
      },
    ];
    const { tasks: next, changed } = commitTaskSprintPlan(tasks);
    expect(changed).toBe(true);
    expect(next[0]!.sprint).toBe(3);
  });
});
