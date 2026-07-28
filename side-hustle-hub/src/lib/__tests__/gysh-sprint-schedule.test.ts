import { describe, expect, it } from "vitest";
import {
  TASK_SPRINT_MAP,
  commitPlanSprintPlan,
  commitTaskSprintPlan,
  commitTestSprintPlan,
  suggestedSprintForTask,
  suggestedSprintForTest,
} from "../gysh-sprint-board";
import { BACKLOG_SPRINT, buildDefaultPlanItems, dueDateForSprint } from "../gysh-sprints";
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
    expect(suggestedSprintForTask({ id: "T-026", category: "facebook_social", notes: "" })).toBe(2);
    expect(suggestedSprintForTask({ id: "T-018", category: "workshops", notes: "" })).toBe(3);
    expect(suggestedSprintForTask({ id: "T-SENIOR-PAGE", category: "senior_side_hustles", notes: "" })).toBe(3);
    expect(suggestedSprintForTask({ id: "T-006", category: "admin_ops", notes: "" })).toBe(3);
    expect(suggestedSprintForTask({ id: "T-009", category: "website", notes: "" })).toBe(3);
    expect(suggestedSprintForTask({ id: "T-033", category: "admin_ops", notes: "" })).toBe(BACKLOG_SPRINT);
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
      (c) => c.area === "Teens Get Your Side Hustle",
    )!;
    const adult = WIZARD_SCENARIO_CASES.find((c) => c.area === "Adult Get Your Side Hustle")!;
    const senior = WIZARD_SCENARIO_CASES.find((c) => c.area === "Senior Get Your Side Hustle")!;
    expect(suggestedSprintForTest(kids)).toBe(4);
    expect(suggestedSprintForTest(jr)).toBe(5);
    expect(suggestedSprintForTest(adult)).toBe(5);
    expect(suggestedSprintForTest(senior)).toBe(6);
  });

  it("places former S0-pinned tests on Sprint 1+ bands (no Sprint 0 pins)", () => {
    // Launch-prep product band → Sprint 1
    expect(suggestedSprintForTest({ id: "EMAIL-001", area: "Email", priority: "P0" })).toBe(1);
    expect(suggestedSprintForTest({ id: "EMAIL-005", area: "Email", priority: "P0" })).toBe(1);
    expect(suggestedSprintForTest({ id: "BRAND-001", area: "Brand", priority: "P2" })).toBe(1);
    expect(suggestedSprintForTest({ id: "ABOUT-001", area: "About", priority: "P2" })).toBe(1);
    // Kids Corner product → Sprint 2
    expect(suggestedSprintForTest({ id: "KIDS-001", area: "Kids Corner", priority: "P0" })).toBe(2);
    // Content Factory — Sprint 1
    expect(suggestedSprintForTest({ id: "ADMIN-003", area: "Admin", priority: "P1" })).toBe(1);
    // Former empty-S0 parking → Sprint 1 (or later band), not Backlog / not S0
    expect(suggestedSprintForTest({ id: "VT-AUTH-001", area: "Vitest", priority: "P0" })).toBe(1);
    expect(suggestedSprintForTest({ id: "VT-ROLE-001", area: "Vitest", priority: "P0" })).toBe(1);
    expect(suggestedSprintForTest({ id: "ADMIN-001", area: "Admin", priority: "P0" })).toBe(3);
    expect(suggestedSprintForTest({ id: "ADMIN-008", area: "Admin", priority: "P1" })).toBe(3);
    // Launch-prep auth → Sprint 1
    expect(suggestedSprintForTest({ id: "AUTH-001", area: "Auth", priority: "P0" })).toBe(1);
    expect(suggestedSprintForTest({ id: "AUTH-007", area: "Auth", priority: "P0" })).toBe(1);
    // Smoke / product bands
    expect(suggestedSprintForTest({ id: "PW-SMOKE-004", area: "Playwright", priority: "P0" })).toBe(
      2,
    );
    expect(suggestedSprintForTest({ id: "PW-AUTH-001", area: "Playwright", priority: "P1" })).toBe(
      2,
    );
    expect(suggestedSprintForTest({ id: "NAV-001", area: "Navigation", priority: "P0" })).toBe(1);
    expect(suggestedSprintForTest({ id: "ADMIN-002", area: "Admin", priority: "P1" })).toBe(3);
    expect(suggestedSprintForTest({ id: "KIDS-002", area: "Kids Corner", priority: "P1" })).toBe(2);
    expect(suggestedSprintForTest({ id: "VT-WIZARD-001", area: "Vitest", priority: "P0" })).toBe(4);
  });

  it("commitPlanSprintPlan force moves workshops and upserts soft-launch milestones", () => {
    const backlogish = buildDefaultPlanItems().map((i) =>
      i.id === "s0-workshops"
        ? { ...i, sprint: 0, date: "2026-07-17", dateLabel: "Jul 17, 2026" }
        : i,
    ).filter((i) => i.id !== "s2-world-launch");
    const { items, changed } = commitPlanSprintPlan(
      backlogish,
      new Date(2026, 6, 16),
      "force",
    );
    expect(changed).toBe(true);
    expect(items.find((i) => i.id === "s0-workshops")?.sprint).toBe(3);
    expect(items.some((i) => i.id === "s2-world-launch" && i.sprint === 2)).toBe(true);
  });

  it("commitPlanSprintPlan preserve does not remap existing plan sprints", () => {
    const items = buildDefaultPlanItems().map((i) =>
      i.id === "s0-workshops" ? { ...i, sprint: 0 } : i,
    );
    const { items: next, changed } = commitPlanSprintPlan(
      items,
      new Date(2026, 6, 16),
      "preserve",
    );
    expect(changed).toBe(false);
    expect(next.find((i) => i.id === "s0-workshops")?.sprint).toBe(0);
  });

  it("commitTaskSprintPlan assigns backlog tasks with explicit placement", () => {
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
    expect(next[0]!.dueDate).toBe(dueDateForSprint(3));
  });

  it("commitTaskSprintPlan preserve keeps user-created backlog tasks in Backlog", () => {
    const tasks = [
      {
        id: "T-250",
        description: "Brand-new ops task",
        category: "admin_ops" as const,
        priority: "P2" as const,
        status: "not_started" as const,
        assignBy: "Evelyn",
        assignedTo: "Unassigned" as const,
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
    const { tasks: next, changed } = commitTaskSprintPlan(tasks, "preserve");
    expect(changed).toBe(false);
    expect(next[0]!.sprint).toBe(BACKLOG_SPRINT);
  });

  it("commitTaskSprintPlan preserve does not overwrite Sprint 0 placements", () => {
    const tasks = [
      {
        id: "T-005",
        description: "Contact page",
        category: "website" as const,
        priority: "P1" as const,
        status: "not_started" as const,
        assignBy: "Evelyn",
        assignedTo: "Evelyn" as const,
        dateAssigned: "",
        dueDate: dueDateForSprint(0) || "07/19/26",
        dateCompleted: "",
        notes: "",
        sprint: 0, // user kept on Sprint 0; suggested is 1
        tinaDone: false,
        evelynDone: false,
        attachments: [],
      },
    ];
    const { tasks: next, changed } = commitTaskSprintPlan(tasks, "preserve");
    expect(next[0]!.sprint).toBe(0);
    expect(changed).toBe(false);
  });

  it("commitTaskSprintPlan heals stale sprint due dates without moving sprint", () => {
    const tasks = [
      {
        id: "T-005",
        description: "Contact page",
        category: "website" as const,
        priority: "P1" as const,
        status: "in_progress" as const,
        assignBy: "Evelyn",
        assignedTo: "Evelyn" as const,
        dateAssigned: "",
        dueDate: "07/22/26", // old day-after-start / +3 rule
        dateCompleted: "",
        notes: "",
        sprint: 1,
        tinaDone: false,
        evelynDone: false,
        attachments: [],
      },
    ];
    const { tasks: next, changed } = commitTaskSprintPlan(tasks);
    expect(changed).toBe(true);
    expect(next[0]!.sprint).toBe(1);
    expect(next[0]!.dueDate).toBe("07/23/26");
  });

  it("commitTaskSprintPlan does not heal Done task dues when sprint unchanged", () => {
    const tasks = [
      {
        id: "T-005",
        description: "Contact page",
        category: "website" as const,
        priority: "P1" as const,
        status: "done" as const,
        assignBy: "Evelyn",
        assignedTo: "Evelyn" as const,
        dateAssigned: "",
        dueDate: "07/22/26",
        dateCompleted: "07/22/26",
        notes: "",
        sprint: 1,
        tinaDone: true,
        evelynDone: true,
        attachments: [],
      },
    ];
    const { tasks: next, changed } = commitTaskSprintPlan(tasks);
    expect(changed).toBe(false);
    expect(next[0]!.dueDate).toBe("07/22/26");
  });

  it("commitTestSprintPlan heals stale due dates for unchanged sprints", () => {
    const kids = WIZARD_SCENARIO_CASES.find(
      (c) => c.area === "Kids Get Your Side Hustle",
    )!;
    const { sprints, dueDates, changedIds } = commitTestSprintPlan(
      [kids],
      { [kids.id]: 4 },
      { [kids.id]: "08/12/26" }, // wrong offset vs Tue+2
      "preserve",
      { [kids.id]: "fail" },
    );
    expect(changedIds).toEqual([kids.id]);
    expect(sprints[kids.id]).toBe(4);
    expect(dueDates[kids.id]).toBe(dueDateForSprint(4));
  });

  it("commitTestSprintPlan does not heal Pass dues when sprint unchanged", () => {
    const kids = WIZARD_SCENARIO_CASES.find(
      (c) => c.area === "Kids Get Your Side Hustle",
    )!;
    const { dueDates, changedIds } = commitTestSprintPlan(
      [kids],
      { [kids.id]: 4 },
      { [kids.id]: "08/12/26" },
      "preserve",
      { [kids.id]: "pass" },
    );
    expect(changedIds).toEqual([]);
    expect(dueDates[kids.id]).toBe("08/12/26");
  });

  it("commitTestSprintPlan preserve heals unmatched Sprint 0 tests to suggested band", () => {
    const kids = WIZARD_SCENARIO_CASES.find(
      (c) => c.area === "Kids Get Your Side Hustle",
    )!;
    const { sprints, dueDates, changedIds } = commitTestSprintPlan(
      [kids],
      { [kids.id]: 0 },
      { [kids.id]: dueDateForSprint(0) || "" },
      "preserve",
      { [kids.id]: "not_run" },
    );
    expect(sprints[kids.id]).toBe(4);
    expect(dueDates[kids.id]).toBe(dueDateForSprint(4));
    expect(changedIds).toEqual([kids.id]);
  });

  it("commitTestSprintPlan preserve heals stuck Sprint 0 / Backlog parking to bands", () => {
    const email = { id: "EMAIL-001", area: "Email", priority: "P0" as const };
    const auth = { id: "AUTH-001", area: "Auth", priority: "P0" as const };
    const vtAuth = { id: "VT-AUTH-001", area: "Vitest", priority: "P0" as const };
    const brand = { id: "BRAND-001", area: "Brand", priority: "P2" as const };
    const about = { id: "ABOUT-001", area: "About", priority: "P2" as const };
    const { sprints, dueDates, changedIds } = commitTestSprintPlan(
      [email, auth, vtAuth, brand, about],
      {
        [email.id]: BACKLOG_SPRINT,
        [auth.id]: 0,
        [vtAuth.id]: BACKLOG_SPRINT,
        [brand.id]: 0,
        [about.id]: 0,
      },
      {
        [email.id]: "",
        [auth.id]: dueDateForSprint(0) || "07/19/26",
        [vtAuth.id]: "",
        [brand.id]: dueDateForSprint(0) || "",
        [about.id]: dueDateForSprint(0) || "",
      },
      "preserve",
      {
        [email.id]: "not_run",
        [auth.id]: "not_run",
        [vtAuth.id]: "not_run",
        [brand.id]: "pass",
        [about.id]: "not_run",
      },
    );
    expect(sprints[email.id]).toBe(1);
    expect(dueDates[email.id]).toBe(dueDateForSprint(1));
    expect(sprints[auth.id]).toBe(1);
    expect(dueDates[auth.id]).toBe(dueDateForSprint(1));
    expect(sprints[vtAuth.id]).toBe(1);
    expect(dueDates[vtAuth.id]).toBe(dueDateForSprint(1));
    expect(sprints[brand.id]).toBe(1);
    expect(dueDates[brand.id]).toBe(dueDateForSprint(1));
    expect(sprints[about.id]).toBe(1);
    expect(dueDates[about.id]).toBe(dueDateForSprint(1));
    expect(changedIds).toEqual(
      expect.arrayContaining([email.id, auth.id, vtAuth.id, brand.id, about.id]),
    );
  });

  it("commitTestSprintPlan preserve moves KIDS-001 off Sprint 0 to Kids band", () => {
    const kids = { id: "KIDS-001", area: "Kids Corner", priority: "P0" as const };
    const { sprints, dueDates, changedIds } = commitTestSprintPlan(
      [kids],
      { [kids.id]: 0 },
      { [kids.id]: dueDateForSprint(0) || "" },
      "preserve",
      { [kids.id]: "pass" },
    );
    expect(sprints[kids.id]).toBe(2);
    expect(dueDates[kids.id]).toBe(dueDateForSprint(2));
    expect(changedIds).toEqual([kids.id]);
  });

  it("commitTestSprintPlan preserve keeps Sprint 1+ manual placements", () => {
    const kids = WIZARD_SCENARIO_CASES.find(
      (c) => c.area === "Kids Get Your Side Hustle",
    )!;
    const { sprints, changedIds } = commitTestSprintPlan(
      [kids],
      { [kids.id]: 3 }, // manual override away from suggested 4
      { [kids.id]: dueDateForSprint(3) },
      "preserve",
      { [kids.id]: "not_run" },
    );
    expect(sprints[kids.id]).toBe(3);
    expect(changedIds).toEqual([]);
  });
});
