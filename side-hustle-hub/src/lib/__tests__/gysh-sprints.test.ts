import { describe, expect, it } from "vitest";
import {
  BACKLOG_SPRINT,
  SPRINT_THEMES,
  UNASSIGNED_OWNER,
  assigneeForBacklogSprint,
  buildDefaultPlanItems,
  buildRolloutCalendar,
  ceremoniesForSprint,
  currentSprintIndex,
  daysUntilSprintEnd,
  isSprintEndDay,
  dueDateForSprint,
  dueDateIsoForSprint,
  formatNumericDateRange,
  getSprintWindow,
  isBacklogSprint,
  sprintStartTuesday,
  themeForSprint,
  weeklySyncForSprint,
  sanitizeBacklogPlanOwners,
  sanitizeBacklogTaskAssignees,
  sanitizeBacklogTestAssignees,
  withBacklogPlanUnassigned,
  withBacklogTaskUnassigned,
} from "../gysh-sprints";

describe("gysh-sprints", () => {
  const ref = new Date(2026, 6, 16);

  it("computes Sprint 0 as Tue Jul 14 – Mon Jul 20, 2026", () => {
    const s0 = getSprintWindow(0, ref);
    expect(s0.label).toBe("Sprint 0");
    expect(s0.startLabel).toBe("Jul 14, 2026");
    expect(s0.endLabel).toBe("Jul 20, 2026");
    expect(s0.numericRangeLabel).toBe("7/14/26–7/20/26");
    expect(formatNumericDateRange(s0.start, s0.end)).toBe("7/14/26–7/20/26");
    expect(sprintStartTuesday(ref).getDay()).toBe(2);
  });

  it("counts whole days until the current sprint ends Monday", () => {
    expect(currentSprintIndex(new Date(2026, 6, 16))).toBe(0);
    expect(daysUntilSprintEnd(new Date(2026, 6, 16))).toBe(4); // Thu → Mon
    expect(daysUntilSprintEnd(new Date(2026, 6, 20))).toBe(0); // Mon end
    expect(daysUntilSprintEnd(new Date(2026, 6, 21))).toBe(6); // Sprint 1 Tue → next Mon
  });

  it("isSprintEndDay is true only on that sprint's Monday", () => {
    expect(isSprintEndDay(0, new Date(2026, 6, 20))).toBe(true);
    expect(isSprintEndDay(0, new Date(2026, 6, 19))).toBe(false);
    expect(isSprintEndDay(1, new Date(2026, 6, 27))).toBe(true); // Sprint 1 ends Mon Jul 27
    expect(isSprintEndDay(1, new Date(2026, 6, 20))).toBe(false);
  });

  it("includes weekly T + E sync on sprint Tuesday", () => {
    const s0 = getSprintWindow(0, ref);
    const meet = weeklySyncForSprint(s0);
    expect(meet.title).toMatch(/T \+ E/);
    expect(meet.owner).toBe("Both");
    expect(meet.kind).toBe("meeting");
    expect(meet.date).toBe("2026-07-14");
  });

  it("builds rollout calendar with FB, brand, Kevina, workshops", () => {
    const items = buildRolloutCalendar(ref);
    const titles = items.map((i) => i.title).join(" | ");
    expect(titles).toMatch(/Facebook/i);
    expect(titles).toMatch(/Brand/i);
    expect(titles).toMatch(/Kevina/i);
    expect(titles).toMatch(/workshops/i);
    expect(titles).toMatch(/weekly sync/i);
    expect(items.some((i) => i.sprint === 0)).toBe(true);
  });

  it("commits former backlog items into themed sprints", () => {
    const items = buildDefaultPlanItems(ref);
    expect(items.every((i) => i.sprint !== BACKLOG_SPRINT)).toBe(true);
    expect(items.some((i) => i.id === "bl-newsletter" && i.sprint === 1)).toBe(true);
    expect(items.some((i) => i.id === "bl-ai-brainstorm" && i.sprint === 4)).toBe(true);
    expect(items.some((i) => i.sprint === 0)).toBe(true);
  });

  it("exposes Sprint Goals for the schedule UI", () => {
    expect(SPRINT_THEMES.length).toBeGreaterThanOrEqual(8);
    expect(themeForSprint(0)?.goal).toBe("Infrastructure");
    expect(themeForSprint(1)?.goal).toMatch(/Brand|Content/i);
    expect(themeForSprint(2)?.goal).toMatch(/Soft Launch|Launch/i);
    expect(themeForSprint(4)?.goal).toMatch(/Kids|Growth/i);
    expect(themeForSprint(5)?.goal).toMatch(/Teen|Adult|GMSH/i);
  });

  it("lists a compact rollout schedule summary with soft launch + GMSH bands", async () => {
    const { listRolloutScheduleSummary } = await import("../gysh-sprints");
    const rows = listRolloutScheduleSummary(new Date(2026, 6, 16));
    expect(rows).toHaveLength(8);
    expect(rows[2]!.focus).toMatch(/Soft launch/i);
    expect(rows[4]!.focus).toMatch(/Kids/i);
    expect(rows[5]!.focus).toMatch(/Teen|Adult/i);
    expect(rows[6]!.focus).toMatch(/Senior/i);
  });

  it("schedules standup 3x, planning day-before-end, and retrospective", () => {
    const s0 = getSprintWindow(0, ref);
    const ceremonies = ceremoniesForSprint(s0);
    const standups = ceremonies.filter((c) => c.type === "standup");
    expect(standups).toHaveLength(3);
    expect(standups.map((c) => c.date)).toEqual(["2026-07-14", "2026-07-16", "2026-07-18"]);
    const planning = ceremonies.find((c) => c.type === "planning");
    expect(planning?.date).toBe("2026-07-19"); // Sunday — day before Mon end
    const retro = ceremonies.find((c) => c.type === "retrospective");
    expect(retro?.date).toBe("2026-07-20");
  });

  it("maps sprint due dates (Sprint 0 → planning Sunday; Sprint N≥1 → 2 days after start)", () => {
    expect(dueDateForSprint(0)).toBe("07/19/26");
    expect(dueDateIsoForSprint(0)).toBe("2026-07-19");
    expect(dueDateForSprint(1)).toBe("07/23/26");
    expect(dueDateIsoForSprint(1)).toBe("2026-07-23");
    expect(dueDateForSprint(2)).toBe("07/30/26");
    expect(dueDateIsoForSprint(2)).toBe("2026-07-30");
    expect(dueDateForSprint(BACKLOG_SPRINT)).toBe("");
  });

  it("clears person assignment when moving into backlog (not when leaving)", () => {
    expect(isBacklogSprint(BACKLOG_SPRINT)).toBe(true);
    expect(isBacklogSprint(0)).toBe(false);
    expect(assigneeForBacklogSprint(BACKLOG_SPRINT, "task", "Evelyn")).toBe(UNASSIGNED_OWNER);
    expect(assigneeForBacklogSprint(BACKLOG_SPRINT, "plan", "Both")).toBe(UNASSIGNED_OWNER);
    expect(assigneeForBacklogSprint(BACKLOG_SPRINT, "test", "evelyn")).toBe("");
    expect(assigneeForBacklogSprint(2, "task", "Evelyn")).toBe("Evelyn");
    expect(assigneeForBacklogSprint(2, "test", "evelyn")).toBe("evelyn");
    expect(withBacklogTaskUnassigned({ sprint: BACKLOG_SPRINT, assignedTo: "Tina" })).toEqual({
      sprint: BACKLOG_SPRINT,
      assignedTo: UNASSIGNED_OWNER,
    });
    expect(withBacklogTaskUnassigned({ sprint: 1, assignedTo: "Tina" })).toEqual({
      sprint: 1,
      assignedTo: "Tina",
    });
    expect(withBacklogPlanUnassigned({ sprint: BACKLOG_SPRINT, owner: "Lyriq" })).toEqual({
      sprint: BACKLOG_SPRINT,
      owner: UNASSIGNED_OWNER,
    });
    // Assignee-only edit while already in backlog still clears.
    expect(withBacklogTaskUnassigned({ assignedTo: "Evelyn" }, BACKLOG_SPRINT)).toEqual({
      assignedTo: UNASSIGNED_OWNER,
    });
    expect(withBacklogPlanUnassigned({ owner: "Tina" }, BACKLOG_SPRINT)).toEqual({
      owner: UNASSIGNED_OWNER,
    });
  });

  it("sanitizes persisted backlog assignees", () => {
    const tasks = sanitizeBacklogTaskAssignees([
      { sprint: BACKLOG_SPRINT, assignedTo: "Tina" },
      { sprint: 0, assignedTo: "Evelyn" },
      { sprint: BACKLOG_SPRINT, assignedTo: UNASSIGNED_OWNER },
    ]);
    expect(tasks.changed).toBe(true);
    expect(tasks.tasks[0]!.assignedTo).toBe(UNASSIGNED_OWNER);
    expect(tasks.tasks[1]!.assignedTo).toBe("Evelyn");

    const plan = sanitizeBacklogPlanOwners([
      { sprint: BACKLOG_SPRINT, owner: "Both" },
      { sprint: 1, owner: "Lyriq" },
    ]);
    expect(plan.changed).toBe(true);
    expect(plan.items[0]!.owner).toBe(UNASSIGNED_OWNER);

    const tests = sanitizeBacklogTestAssignees(
      { a: BACKLOG_SPRINT, b: 2, c: BACKLOG_SPRINT },
      { a: "evelyn", b: "tina", c: "" },
    );
    expect(tests.changedIds).toEqual(["a"]);
    expect(tests.assignees.a).toBe("");
    expect(tests.assignees.b).toBe("tina");
  });
});
