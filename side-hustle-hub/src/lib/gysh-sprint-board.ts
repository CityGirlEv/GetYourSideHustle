/**
 * Sprint Board placement for tasks + tests.
 * Maps backlog → committed sprints per SPRINT_THEMES implementation plan.
 */

import {
  BACKLOG_SPRINT,
  buildDefaultPlanItems,
  dayOffset,
  formatDisplayDate,
  getSprintWindow,
  KIND_LABELS,
  toISODate,
  type PlanItem,
} from "./gysh-sprints";
import type { GyshTask } from "./gysh-tasks";
import type { TestCase, TestStatus } from "./gysh-test-plan";
import { testOwnerLabel, type TestOwnerId } from "./gysh-roles";

/** Explicit task → sprint (everything else → heuristic / backlog). */
export const TASK_SPRINT_MAP: Record<string, number> = {
  // Sprint 0 — brand & public foundation (toward soft launch)
  "T-001": 0,
  "T-002": 0,
  "T-003": 0, // Facebook Page
  "T-004": 0, // About
  "T-007": 0, // Content Factory cadence
  "T-011": 0, // Brand layout colors
  "T-012": 0,
  "T-013": 0,
  "T-019": 0, // Recurring sync
  // Sprint 1 — public pages & launch content
  "T-005": 1, // Contact
  "T-008": 1, // Kevina episodes
  "T-014": 1, // Video review
  "T-017": 1, // Public hustle copy
  // Sprint 2 — go public (soft launch week)
  // (tasks mostly done earlier; launch is plan milestone + public QA)
  // Sprint 3 — post-launch polish (conference dates, niche pages, deep content)
  "T-006": 3, // Testing Portal (internal — after public launch)
  "T-009": 3, // SEO landings
  "T-010": 3, // Parent safety PDF
  "T-018": 3, // Workshops / conference dates
  "T-SENIOR-PAGE": 3,
  "T-LG-airbnb": 3,
  "T-LG-pod": 3,
  "T-LG-dropshipping": 3,
  "T-LG-ai-agents": 3,
  "T-LG-amazon": 3,
  "T-LG-affiliate": 3,
  "T-LG-social": 3,
  "T-LG-property-mgmt": 3,
  // Sprint 4 — growth + remaining guides
  "T-015": 4,
  "T-016": 4,
  "T-LG-rideshare": 4,
  "T-LG-food-delivery": 4,
  "T-LG-handyman": 4,
  "T-LG-book-publishing": 4,
  "T-LG-web-leads": 4,
  "T-LG-ai-assets": 4,
  "T-LG-ai-timing": 4,
};

/**
 * Plan item → sprint day remaps (including moving post-launch work out of S0–S2).
 * Soft-launch milestones are upserted by reconcileLaunchPlanItems.
 */
export const PLAN_ITEM_SPRINT_MAP: Record<string, { sprint: number; day: number }> = {
  "s0-workshops": { sprint: 3, day: 1 },
  "s2-seo": { sprint: 3, day: 2 },
  "s2-safety-pdf": { sprint: 3, day: 3 },
  "s0-kevina": { sprint: 1, day: 3 },
  "bl-newsletter": { sprint: 1, day: 2 },
  "bl-training-waitlists": { sprint: 3, day: 2 },
  "bl-qa-cycle": { sprint: 3, day: 4 },
  "bl-ai-brainstorm": { sprint: 4, day: 1 },
  "bl-mentor-listings": { sprint: 4, day: 3 },
  "s2-world-launch": { sprint: 2, day: 5 },
  "s2-public-qa": { sprint: 2, day: 3 },
};

export function suggestedSprintForTask(task: Pick<GyshTask, "id" | "category" | "notes">): number {
  if (Object.prototype.hasOwnProperty.call(TASK_SPRINT_MAP, task.id)) {
    return TASK_SPRINT_MAP[task.id]!;
  }
  if (task.id.startsWith("T-LG-")) return 3;
  if (task.notes.includes("Sprint 0")) return 0;
  if (task.notes.includes("Sprint 1")) return 1;
  if (task.notes.includes("Sprint 2")) return 2;
  if (task.notes.includes("Sprint 3")) return 3;
  if (task.notes.includes("Sprint 4")) return 4;
  if (task.category === "admin_ops" || task.category === "assets_brand") return 0;
  if (task.category === "workshops" || task.category === "senior_side_hustles") return 3;
  return BACKLOG_SPRINT;
}

/**
 * Test areas mapped to sprints. Wizard FMSH matrices are automated (Vitest)
 * but owned for sign-off in later sprints so the board stays balanced.
 */
export function suggestedSprintForTest(
  test: Pick<TestCase, "id" | "area" | "priority"> & { suite?: TestCase["suite"] },
): number {
  const id = test.id.toUpperCase();
  const area = test.area.toLowerCase();

  // External proofread pool — stay in Backlog until claimed into a sprint
  if (id.startsWith("PROOF-") || area === "proofread") {
    return BACKLOG_SPRINT;
  }

  if (
    area === "kids Get Your Side Hustle" ||
    id.includes("KIDS-FMSH") ||
    id.startsWith("K-FMSH")
  ) {
    return 4;
  }
  if (
    area === "junior Get Your Side Hustle" ||
    id.includes("JR-FMSH") ||
    id.includes("JUNIOR-FMSH") ||
    id.startsWith("J-FMSH")
  ) {
    return 5;
  }
  if (area === "adult Get Your Side Hustle" || id.includes("ADULT-FMSH") || id.startsWith("A-FMSH")) {
    return 5;
  }
  if (area === "senior Get Your Side Hustle" || id.includes("SENIOR-FMSH") || id.startsWith("S-FMSH")) {
    return 6;
  }
  if (area.includes("wizard") || id.startsWith("WIZ-") || id.includes("SCENARIO")) {
    return 4;
  }

  if (
    id.startsWith("AUTH-") ||
    id.startsWith("EMAIL-") ||
    id.startsWith("REG-") ||
    id.startsWith("BP-") ||
    id.startsWith("CONTACT-") ||
    id.startsWith("BRAND-") ||
    id.startsWith("ADMIN-") ||
    id.startsWith("NAV-") ||
    id.startsWith("HOME-") ||
    id.startsWith("PW-SMOKE") ||
    id.startsWith("VT-AUTH") ||
    id.startsWith("VT-ROLE") ||
    id.startsWith("VT-PLAN") ||
    id.startsWith("VT-WIZARD")
  ) {
    return 0;
  }
  if (
    id.startsWith("JOIN-") ||
    id.startsWith("FACTORY-") ||
    id.startsWith("CONTENT-") ||
    id.startsWith("VT-WORK") ||
    id.startsWith("VT-JOIN") ||
    id.startsWith("TASK-") ||
    id.startsWith("USERS-")
  ) {
    return 1;
  }
  if (id.startsWith("WORK-")) {
    return 3; // workshop/conference dates — post soft launch
  }
  if (id.startsWith("KIDS-") || id.startsWith("CHECK-")) {
    return 2; // light public kids smoke before go-live
  }
  if (id.startsWith("ADULT-") || id.startsWith("SENIOR-")) {
    return 3;
  }
  if (test.priority === "P0") return 0;
  return 7;
}

export type BoardSource = "plan" | "task" | "test";

export type BoardCard = {
  key: string;
  source: BoardSource;
  sourceId: string;
  title: string;
  notes: string;
  owner: string;
  sprint: number;
  status: string;
  kindLabel: string;
  kindColor: string;
};

export function taskStatusToBoard(status: GyshTask["status"]): string {
  if (status === "done") return "done";
  if (status === "in_progress") return "in_progress";
  if (status === "blocked") return "blocked";
  return "todo";
}

export function testStatusToBoard(status: TestStatus | undefined): string {
  if (status === "pass") return "done";
  if (status === "in_progress") return "in_progress";
  if (status === "fail" || status === "blocked") return "blocked";
  return "todo";
}

export function ownerFromAssignees(assignees: TestOwnerId[] | string[]): string {
  const names = assignees
    .map((id) => testOwnerLabel(String(id)))
    .filter(Boolean);
  if (names.length === 0) return "Unassigned";
  if (names.length > 1) {
    // Multiple human owners → Both; suite owners stay as their label.
    if (names.every((n) => n === "Vitest" || n === "Playwright")) return names[0]!;
    return "Both";
  }
  return names[0]!;
}

const PLAN_KIND_COLORS: Record<string, string> = {
  meeting: "#9B2F28",
  sprint: "#947D64",
  rollout: "#5c4033",
  content: "#6b4f3a",
  brand: "#8a7348",
  launch: "#2e7d32",
  ceremony: "#3b6ea5",
};

export function planToBoardCard(item: PlanItem): BoardCard {
  return {
    key: `plan:${item.id}`,
    source: "plan",
    sourceId: item.id,
    title: item.title,
    notes: item.notes,
    owner: item.owner,
    sprint: item.sprint,
    status: item.status === "done" ? "done" : item.status,
    kindLabel: KIND_LABELS[item.kind] ?? item.kind,
    kindColor: PLAN_KIND_COLORS[item.kind] || "#947D64",
  };
}

export function taskToBoardCard(task: GyshTask): BoardCard {
  return {
    key: `task:${task.id}`,
    source: "task",
    sourceId: task.id,
    title: `${task.id} · ${task.description}`,
    notes: task.notes || `Category: ${task.category}`,
    owner: task.assignedTo,
    sprint: typeof task.sprint === "number" ? task.sprint : suggestedSprintForTask(task),
    status: taskStatusToBoard(task.status),
    kindLabel: "Task",
    kindColor: "#5c4033",
  };
}

export function testToBoardCard(
  test: TestCase & { suite?: string },
  status: TestStatus | undefined,
  sprintOverride: number | undefined,
  assigneeOverride?: string,
): BoardCard {
  const sprint =
    typeof sprintOverride === "number" ? sprintOverride : suggestedSprintForTest(test);
  const owner = assigneeOverride
    ? ownerFromAssignees([assigneeOverride])
    : ownerFromAssignees(test.assignees);
  return {
    key: `test:${test.id}`,
    source: "test",
    sourceId: test.id,
    title: `${test.id} · ${test.title}`,
    notes: `${test.area} · ${test.suite ?? "manual"} · ${test.priority}`,
    owner,
    sprint,
    status: testStatusToBoard(status),
    kindLabel: "Test",
    kindColor: "#3b6ea5",
  };
}

/**
 * Apply suggested sprints when a task is still on the migration default (Sprint 0)
 * or still in Backlog, and the suggestion is a committed sprint.
 */
export function applySuggestedTaskSprints(tasks: GyshTask[]): { tasks: GyshTask[]; changed: boolean } {
  let changed = false;
  const next = tasks.map((t) => {
    const current = typeof t.sprint === "number" ? t.sprint : 0;
    const suggested = suggestedSprintForTask(t);
    const uncommitted = current === 0 || current === BACKLOG_SPRINT;
    if (uncommitted && suggested !== current) {
      changed = true;
      return { ...t, sprint: suggested };
    }
    return t;
  });
  return { tasks: next, changed };
}

/** Force every task onto its schedule sprint (used by Apply sprint schedule). */
export function commitTaskSprintPlan(tasks: GyshTask[]): { tasks: GyshTask[]; changed: boolean } {
  let changed = false;
  const next = tasks.map((t) => {
    const suggested = suggestedSprintForTask(t);
    if (t.sprint !== suggested) {
      changed = true;
      return { ...t, sprint: suggested };
    }
    return t;
  });
  return { tasks: next, changed };
}

/** Move mapped plan items onto their sprint days; upsert soft-launch milestones if missing. */
export function commitPlanSprintPlan(
  items: PlanItem[],
  ref: Date = new Date(),
): { items: PlanItem[]; changed: boolean } {
  let changed = false;
  const byId = new Map(items.map((i) => [i.id, i]));

  // Ensure soft-launch milestones exist on live boards that predate this plan.
  const ensureIds = ["s2-world-launch", "s2-public-qa"] as const;
  const seed = buildDefaultPlanItems(ref);
  for (const id of ensureIds) {
    if (!byId.has(id)) {
      const seeded = seed.find((i) => i.id === id);
      if (seeded) {
        byId.set(id, seeded);
        changed = true;
      }
    }
  }

  const next = Array.from(byId.values()).map((item) => {
    const mapped = PLAN_ITEM_SPRINT_MAP[item.id];
    if (!mapped) return item;
    const sw = getSprintWindow(mapped.sprint, ref);
    const d = dayOffset(sw, mapped.day);
    const date = toISODate(d);
    const dateLabel = formatDisplayDate(d);
    if (item.sprint === mapped.sprint && item.date === date) return item;
    changed = true;
    return {
      ...item,
      sprint: mapped.sprint,
      date,
      dateLabel,
      notes:
        item.id === "s0-workshops"
          ? "Post-launch — dates TBD until confirmed (T-018). Edit in Content Factory → Workshops."
          : item.notes,
      title:
        item.id === "s0-workshops" ? "Review workshops and conference dates" : item.title,
    };
  });
  return { items: next, changed };
}

/** Suggested sprint for every known test id (for board + bulk apply). */
export function commitTestSprintPlan(
  tests: Array<TestCase & { suite?: string }>,
  current: Record<string, number>,
): { sprints: Record<string, number>; changedIds: string[] } {
  const sprints: Record<string, number> = { ...current };
  const changedIds: string[] = [];
  for (const t of tests) {
    const suggested = suggestedSprintForTest(t);
    if (sprints[t.id] !== suggested) {
      sprints[t.id] = suggested;
      changedIds.push(t.id);
    }
  }
  return { sprints, changedIds };
}
