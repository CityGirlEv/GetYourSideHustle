/**
 * Sprint Board placement for tasks + tests.
 * Maps backlog → committed sprints per SPRINT_THEMES implementation plan.
 */

import {
  BACKLOG_SPRINT,
  buildDefaultPlanItems,
  dayOffset,
  dueDateForSprint,
  formatDisplayDate,
  getSprintWindow,
  isBacklogSprint,
  KIND_LABELS,
  toISODate,
  UNASSIGNED_OWNER,
  type PlanItem,
} from "./gysh-sprints";
import type { GyshTask, TaskStatus } from "./gysh-tasks";
import type { TestCase, TestStatus } from "./gysh-test-plan";
import { testOwnerLabel, type TestOwnerId } from "./gysh-roles";

/** Incomplete tasks get sprint due heals; Done keeps its stored due until sprint moves. */
export function taskStatusNeedsSprintDue(status: TaskStatus | string | undefined): boolean {
  return status !== "done";
}

/** Incomplete tests get sprint due heals; Pass / Conditional Approval keep stored due until sprint moves. */
export function testStatusNeedsSprintDue(status: TestStatus | string | undefined): boolean {
  return status !== "pass" && status !== "conditional_approval";
}

/** Explicit task → sprint (everything else → heuristic / backlog). */
export const TASK_SPRINT_MAP: Record<string, number> = {
  // Sprint 0 — Infrastructure (toward soft launch)
  "T-001": 0,
  "T-002": 0,
  "T-003": 0, // Facebook Page
  "T-004": 0, // About
  "T-007": 0, // Content Factory cadence
  "T-011": 0, // Brand layout colors
  "T-012": 0,
  "T-013": 0,
  "T-019": 0, // Recurring sync
  "T-020": 0, // Gmail
  "T-021": 0, // info@ email
  "T-030": 0, // Group text
  "T-031": 0, // FB follow link
  // Sprint 1 — Brand & Content
  "T-005": 1, // Contact
  "T-008": 1, // Kevina episodes
  "T-014": 1, // Video review
  "T-017": 1, // Public hustle copy
  "T-028": 1, // Merch mockups
  "T-029": 1, // About content
  "T-032": 1, // Integrate About
  // Sprint 2 — Soft Launch (~Aug 3)
  "T-026": 2, // First FB post
  "T-027": 2, // Kevina TikTok populate
  // Sprint 3 — Polish (SEO, Senior page, workshops, first guides, ops polish)
  "T-006": 3, // Testing Portal (internal — after public launch)
  "T-009": 3, // SEO landings
  "T-010": 3, // Parent safety PDF
  "T-018": 3, // Workshops / conference dates
  "T-022": 3, // Financials page
  "T-023": 3, // Expense line items
  "T-024": 3, // Legalities / LLC
  "T-025": 3, // Delegation of responsibilities
  "T-SENIOR-PAGE": 3,
  "T-LG-airbnb": 3,
  "T-LG-pod": 3,
  "T-LG-dropshipping": 3,
  "T-LG-ai-agents": 3,
  "T-LG-amazon": 3,
  "T-LG-affiliate": 3,
  "T-LG-social": 3,
  "T-LG-property-mgmt": 3,
  // Sprint 4 — Kids GMSH sign-off + Growth
  "T-015": 4,
  "T-016": 4,
  "T-LG-rideshare": 4,
  "T-LG-food-delivery": 4,
  "T-LG-handyman": 4,
  "T-LG-book-publishing": 4,
  "T-LG-web-leads": 4,
  "T-LG-ai-assets": 4,
  "T-LG-ai-timing": 4,
  // Intentionally parked (not part of soft-launch path)
  "T-033": BACKLOG_SPRINT, // KevinaStarr FB Page (separate)
  "T-034": BACKLOG_SPRINT, // ETSY store
  "T-035": BACKLOG_SPRINT, // Veterans section
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
 * True when a backlog task has an explicit rollout placement (map / guide id / notes).
 * User-created backlog tasks without this stay in Backlog (preserve mode must not yank them).
 */
export function taskHasExplicitSprintPlacement(
  task: Pick<GyshTask, "id" | "notes">,
): boolean {
  if (Object.prototype.hasOwnProperty.call(TASK_SPRINT_MAP, task.id)) return true;
  if (task.id.startsWith("T-LG-")) return true;
  return /Sprint\s*\d/i.test(String(task.notes || ""));
}

/**
 * Catalog tests that may default to Sprint 0 (same feature/area as an S0 task).
 * Empty after Sprint 0 close — former pins (EMAIL/BRAND/ABOUT/KIDS/ADMIN-003)
 * use their normal Sprint 1+ bands so the board heal cannot yank them back to S0.
 */
export const TEST_SPRINT_0_TASK_MATCH: Record<string, string> = {};

export function testMatchesSprint0Task(
  test: Pick<TestCase, "id"> | { id: string },
): boolean {
  return Object.prototype.hasOwnProperty.call(TEST_SPRINT_0_TASK_MATCH, test.id.toUpperCase());
}

/**
 * Test areas mapped to sprints. Wizard FMSH matrices are automated (Vitest)
 * but owned for sign-off in later sprints so the board stays balanced.
 *
 * Default band is Sprint 1+ (not Sprint 0). TEST_SPRINT_0_TASK_MATCH is empty
 * after Sprint 0 closed — keep the hook for rare explicit S0 defaults only.
 */
export function suggestedSprintForTest(
  test: Pick<TestCase, "id" | "area" | "priority"> & { suite?: TestCase["suite"] },
): number {
  const id = test.id.toUpperCase();
  const area = test.area.toLowerCase();

  // Generated failure cases — Backlog until claimed (create path may override Kids/Youth)
  if (id.startsWith("VT-FAIL-") || id.startsWith("PW-FAIL-")) {
    return BACKLOG_SPRINT;
  }

  // Explicit Sprint 0 task linkage (unused while TEST_SPRINT_0_TASK_MATCH is empty)
  if (Object.prototype.hasOwnProperty.call(TEST_SPRINT_0_TASK_MATCH, id)) {
    return 0;
  }

  // External proofread (Tina/Lyriq pairs) — Sprint 1 public pages / launch content
  if (id.startsWith("PROOF-") || area === "proofread") {
    return 1;
  }

  if (
    area === "kids Get Your Side Hustle" ||
    id.includes("KIDS-FMSH") ||
    id.includes("KIDS_FMSH") ||
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

  // Soft-launch public smoke → Sprint 2 (includes login security smoke)
  if (
    id.startsWith("PW-SMOKE") ||
    id.startsWith("PW-FIND") ||
    id.startsWith("PW-FREE") ||
    id.startsWith("PW-MEMBER") ||
    id.startsWith("PW-JOIN") ||
    id.startsWith("PW-AUTH") ||
    id.startsWith("KIDS-") ||
    id.startsWith("CHECK-") ||
    id.startsWith("VT-MEMBER") ||
    id.startsWith("VT-FIND")
  ) {
    return 2;
  }

  // Launch-prep auth + brand/content/registration/contact/nav/email product → Sprint 1
  // (Former empty-S0 parking: VT-AUTH / VT-ROLE also land here — no S0 task match.)
  if (
    id.startsWith("AUTH-") ||
    id.startsWith("JOIN-") ||
    id.startsWith("FACTORY-") ||
    id.startsWith("CONTENT-") ||
    id.startsWith("VT-WORK") ||
    id.startsWith("VT-JOIN") ||
    id.startsWith("VT-AUTH") ||
    id.startsWith("VT-ROLE") ||
    id.startsWith("TASK-") ||
    id.startsWith("USERS-") ||
    id.startsWith("NAV-") ||
    id.startsWith("HOME-") ||
    id.startsWith("CONTACT-") ||
    id.startsWith("COMM-") ||
    id.startsWith("FB-") ||
    id.startsWith("BRAND-") ||
    id.startsWith("ABOUT-") ||
    id.startsWith("REG-") ||
    id.startsWith("BP-") ||
    id.startsWith("EMAIL-") ||
    id.startsWith("UX-") ||
    id.startsWith("FAMILY-") ||
    id.startsWith("MEMBER-") ||
    id.startsWith("FREE-")
  ) {
    return 1;
  }

  if (id.startsWith("VT-WIZARD")) return 4;
  if (id.startsWith("WORK-")) return 3; // workshops — post soft launch
  if (id.startsWith("ADULT-") || id.startsWith("SENIOR-")) return 3;
  // Content Factory cadence — Sprint 1 (rest of Admin stays with T-006 band)
  if (id === "ADMIN-003") return 1;
  // Admin product / Testing Portal ops — with T-006 band (ADMIN-001/008 included)
  if (id.startsWith("ADMIN-") || id.startsWith("VT-PLAN")) return 3;

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
  updatedAt?: string;
  updatedBy?: string;
};

export function taskStatusToBoard(status: GyshTask["status"]): string {
  if (status === "done") return "done";
  if (status === "in_progress") return "in_progress";
  if (status === "blocked") return "blocked";
  return "todo";
}

export function testStatusToBoard(status: TestStatus | undefined): string {
  // Match Testing Portal “passed” for done counts — Conditional Pass stays open for rework.
  if (status === "pass") return "done";
  if (status === "in_progress") return "in_progress";
  if (status === "rolled_over") return "rolled_over";
  if (status === "fail" || status === "blocked") return "blocked";
  if (status === "conditional_approval") return "conditional_approval";
  if (status === "fixed_retest" || status === "failed_retest" || status === "fixed_cursor") {
    return status;
  }
  return "todo";
}

/** End Sprint appends this note while keeping the work status (Fail, Fixed/Cursor, …). */
export const ROLLOVER_NOTE_RE = /Rolling over from Sprint\s*\d+/i;

export function noteIndicatesRollover(note: string | null | undefined): boolean {
  return ROLLOVER_NOTE_RE.test(String(note ?? ""));
}

/** True when the note says this item was rolled out of `fromSprint`. */
export function noteRolledFromSprint(
  note: string | null | undefined,
  fromSprint: number,
): boolean {
  return new RegExp(`Rolling over from Sprint\\s*${fromSprint}\\b`, "i").test(
    String(note ?? ""),
  );
}

/** Rolled via status OR via End Sprint note (status kept as Fail / Fixed/Cursor / etc.). */
export function testIsRolledOver(
  status: TestStatus | string | undefined,
  note?: string | null,
): boolean {
  return status === "rolled_over" || noteIndicatesRollover(note);
}

/**
 * Relative to a focused sprint on the Schedule board:
 * - note says “Rolling over from Sprint {focus}” (may now live on the next sprint), or
 * - currently on that sprint with rolled_over status / any rollover note.
 */
export function itemRolledRelativeToSprint(
  currentSprint: number | undefined,
  note: string | null | undefined,
  focusSprint: number,
  status?: TestStatus | string | null,
): boolean {
  if (noteRolledFromSprint(note, focusSprint)) return true;
  if (Number(currentSprint) === focusSprint && testIsRolledOver(status ?? undefined, note)) {
    return true;
  }
  return false;
}

export function rolloverNoteText(fromSprint: number): string {
  return `Rolling over from Sprint ${fromSprint}`;
}

/**
 * Tests currently on `sprintIndex` that were rolled in from the prior sprint.
 * Counts `rolled_over` status OR End Sprint notes (“Rolling over from Sprint N”).
 * Pass `knownCaseIds` (board/catalog) so orphan D1 rows from renamed IDs are ignored.
 */
export function countRolledIntoSprint(
  statuses: Record<string, TestStatus | string | undefined>,
  sprints: Record<string, number | undefined>,
  sprintIndex: number,
  knownCaseIds?: ReadonlySet<string>,
  notes?: Record<string, string | undefined>,
): number {
  let n = 0;
  for (const [id, sprint] of Object.entries(sprints)) {
    if (knownCaseIds && !knownCaseIds.has(id)) continue;
    if (Number(sprint) !== sprintIndex) continue;
    if (testIsRolledOver(statuses[id], notes?.[id])) n += 1;
  }
  return n;
}

export type SprintRolloverTask = {
  sprint: number;
  notes?: string | null;
};

/** Tasks on `sprintIndex` tagged with an End Sprint rollover note. */
export function countTasksRolledIntoSprint(
  tasks: readonly SprintRolloverTask[] | undefined,
  sprintIndex: number,
): number {
  if (!tasks?.length) return 0;
  let n = 0;
  for (const t of tasks) {
    if (Number(t.sprint) !== sprintIndex) continue;
    if (noteIndicatesRollover(t.notes)) n += 1;
  }
  return n;
}

function formatRolloverBreakdown(tests: number, tasks: number): string {
  return `${tests} test${tests === 1 ? "" : "s"} · ${tasks} task${tasks === 1 ? "" : "s"}`;
}

/** Short chip / banner copy for rollover relative to a focused sprint.
 * Always includes the count (including 0) so sprint bubbles never hide the number.
 * When `tasks` is passed, chip shows Tests + Tasks breakdown.
 */
export function sprintRolloverSummary(
  statuses: Record<string, TestStatus | string | undefined>,
  sprints: Record<string, number | undefined>,
  sprintIndex: number,
  knownCaseIds?: ReadonlySet<string>,
  notes?: Record<string, string | undefined>,
  tasks?: readonly SprintRolloverTask[],
  /** Last sprint index in the schedule (default 6). Used to omit “→ S7”. */
  lastSprintIndex = 6,
): {
  toNext: number;
  fromPrev: number;
  toNextTests: number;
  toNextTasks: number;
  fromPrevTests: number;
  fromPrevTasks: number;
  chipHint: string;
  banner: string;
} {
  const toNextTests = countRolledIntoSprint(
    statuses,
    sprints,
    sprintIndex + 1,
    knownCaseIds,
    notes,
  );
  const fromPrevTests = countRolledIntoSprint(
    statuses,
    sprints,
    sprintIndex,
    knownCaseIds,
    notes,
  );
  const toNextTasks = countTasksRolledIntoSprint(tasks, sprintIndex + 1);
  const fromPrevTasks = countTasksRolledIntoSprint(tasks, sprintIndex);
  const toNext = toNextTests + toNextTasks;
  const fromPrev = fromPrevTests + fromPrevTasks;
  const parts: string[] = [];
  if (sprintIndex < lastSprintIndex) {
    parts.push(`→ S${sprintIndex + 1}: ${formatRolloverBreakdown(toNextTests, toNextTasks)}`);
  }
  if (sprintIndex > 1) {
    parts.push(
      `from S${sprintIndex - 1}: ${formatRolloverBreakdown(fromPrevTests, fromPrevTasks)}`,
    );
  }
  const chipHint = parts.join(" · ");
  const bannerParts: string[] = [];
  if (sprintIndex < lastSprintIndex) {
    bannerParts.push(
      `${formatRolloverBreakdown(toNextTests, toNextTasks)} rolled over to Sprint ${sprintIndex + 1}`,
    );
  }
  if (sprintIndex > 1) {
    bannerParts.push(
      `${formatRolloverBreakdown(fromPrevTests, fromPrevTasks)} rolled over from Sprint ${sprintIndex - 1}`,
    );
  }
  return {
    toNext,
    fromPrev,
    toNextTests,
    toNextTasks,
    fromPrevTests,
    fromPrevTasks,
    chipHint,
    banner: bannerParts.join(" · "),
  };
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
    owner: isBacklogSprint(item.sprint) ? UNASSIGNED_OWNER : item.owner,
    sprint: item.sprint,
    status: item.status === "done" ? "done" : item.status,
    kindLabel: KIND_LABELS[item.kind] ?? item.kind,
    kindColor: PLAN_KIND_COLORS[item.kind] || "#947D64",
  };
}

export function taskToBoardCard(task: GyshTask): BoardCard {
  const sprint = typeof task.sprint === "number" ? task.sprint : suggestedSprintForTask(task);
  return {
    key: `task:${task.id}`,
    source: "task",
    sourceId: task.id,
    title: `${task.id} · ${task.description}`,
    notes: task.notes || `Category: ${task.category}`,
    owner: isBacklogSprint(sprint) ? UNASSIGNED_OWNER : task.assignedTo,
    sprint,
    status: taskStatusToBoard(task.status),
    kindLabel: "Task",
    kindColor: "#5c4033",
    updatedAt: task.updatedAt,
    updatedBy: task.updatedBy,
  };
}

export function testToBoardCard(
  test: TestCase & { suite?: string },
  status: TestStatus | undefined,
  sprintOverride: number | undefined,
  assigneeOverride?: string,
  audit?: { updatedAt?: string; updatedBy?: string },
): BoardCard {
  const sprint =
    typeof sprintOverride === "number" ? sprintOverride : suggestedSprintForTest(test);
  // Backlog never shows a person (catalog defaults would otherwise look assigned).
  const owner = isBacklogSprint(sprint)
    ? UNASSIGNED_OWNER
    : assigneeOverride
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
    updatedAt: audit?.updatedAt,
    updatedBy: audit?.updatedBy,
  };
}

/**
 * Apply suggested sprints when a task is still on the migration default (Sprint 0)
 * or still in Backlog with an explicit placement, and the suggestion is a committed sprint.
 */
export function applySuggestedTaskSprints(tasks: GyshTask[]): { tasks: GyshTask[]; changed: boolean } {
  let changed = false;
  const next = tasks.map((t) => {
    const current = typeof t.sprint === "number" ? t.sprint : 0;
    const suggested = suggestedSprintForTask(t);
    const fromSprint0 = current === 0 && suggested !== current;
    const fromBacklog =
      current === BACKLOG_SPRINT &&
      taskHasExplicitSprintPlacement(t) &&
      suggested !== current &&
      !isBacklogSprint(suggested);
    if (fromSprint0 || fromBacklog) {
      changed = true;
      return { ...t, sprint: suggested };
    }
    return t;
  });
  return { tasks: next, changed };
}

export type SprintPlanMode = "force" | "preserve";

/**
 * Align tasks to the rollout map.
 * - force: overwrite every sprint (opt-in scripts only).
 * - preserve (default): never move Sprint 0+ placements; only pull Backlog → sprint when
 *   the task has an explicit placement (TASK_SPRINT_MAP / T-LG-* / notes). User-created
 *   Backlog tasks stay in Backlog. Also heal due dates for incomplete items.
 * Sprint moves always reset due (including Done). Backlog clears due.
 */
export function commitTaskSprintPlan(
  tasks: GyshTask[],
  mode: SprintPlanMode = "preserve",
): { tasks: GyshTask[]; changed: boolean } {
  let changed = false;
  const next = tasks.map((t) => {
    const suggested = suggestedSprintForTask(t);
    const current = typeof t.sprint === "number" ? t.sprint : 0;
    const nextSprint =
      mode === "force"
        ? suggested
        : current === BACKLOG_SPRINT &&
            taskHasExplicitSprintPlacement(t) &&
            !isBacklogSprint(suggested)
          ? suggested
          : current;
    const sprintChanged = t.sprint !== nextSprint;
    const due = dueDateForSprint(nextSprint);
    let nextDue = t.dueDate;
    if (isBacklogSprint(nextSprint)) {
      nextDue = "";
    } else if (sprintChanged) {
      nextDue = due || t.dueDate;
    } else if (taskStatusNeedsSprintDue(t.status) && due && t.dueDate !== due) {
      nextDue = due;
    }
    if (sprintChanged || t.dueDate !== nextDue) {
      changed = true;
      return {
        ...t,
        sprint: nextSprint,
        dueDate: nextDue,
        ...(isBacklogSprint(nextSprint)
          ? { assignedTo: UNASSIGNED_OWNER as GyshTask["assignedTo"] }
          : {}),
      };
    }
    return t;
  });
  return { tasks: next, changed };
}

/** Heal incomplete task dues to sprintStart+2 (Sprint 0 → planning Sunday). No sprint moves. */
export function healIncompleteTaskDueDates(tasks: GyshTask[]): {
  tasks: GyshTask[];
  changed: boolean;
  updatedCount: number;
} {
  let changed = false;
  let updatedCount = 0;
  const next = tasks.map((t) => {
    if (!taskStatusNeedsSprintDue(t.status)) return t;
    const sprint = typeof t.sprint === "number" ? t.sprint : 0;
    const due = isBacklogSprint(sprint) ? "" : dueDateForSprint(sprint);
    if (String(t.dueDate ?? "").trim() === due) return t;
    changed = true;
    updatedCount += 1;
    return { ...t, dueDate: due };
  });
  return { tasks: next, changed, updatedCount };
}

/** Heal incomplete test dues to sprintStart+2. No sprint moves. Pass is left alone. */
export function healIncompleteTestDueDates(
  sprints: Record<string, number>,
  dueDates: Record<string, string>,
  statuses: Record<string, TestStatus | string>,
  caseIds: string[],
): { dueDates: Record<string, string>; changedIds: string[] } {
  const next = { ...dueDates };
  const changedIds: string[] = [];
  for (const id of caseIds) {
    if (!testStatusNeedsSprintDue(statuses[id])) continue;
    const sprint = sprints[id];
    if (typeof sprint !== "number" || !Number.isFinite(sprint)) continue;
    const due = isBacklogSprint(sprint) ? "" : dueDateForSprint(sprint);
    if (String(next[id] ?? "").trim() === due) continue;
    next[id] = due;
    changedIds.push(id);
  }
  return { dueDates: next, changedIds };
}

/**
 * Move mapped plan items onto their sprint days; upsert soft-launch milestones if missing.
 * - force: remap every PLAN_ITEM_SPRINT_MAP entry.
 * - preserve: only upsert missing soft-launch milestones (never move existing rows).
 */
export function commitPlanSprintPlan(
  items: PlanItem[],
  ref: Date = new Date(),
  mode: SprintPlanMode = "preserve",
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

  if (mode !== "force") {
    return { items: Array.from(byId.values()), changed };
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

/**
 * Align tests to the rollout map.
 * - force: overwrite every sprint to suggested.
 * - preserve (default): keep committed Sprint 1+ placements; fill missing ids;
 *   always sync Sprint 0 task-matched tests onto Sprint 0; heal unmatched Sprint 0
 *   rows out; re-home catalog rows parked on Backlog by the prior empty-S0 heal
 *   (VT-FAIL / PW-FAIL stay Backlog via suggested).
 *   Also heal due dates for incomplete (not Pass) items.
 * Sprint moves always reset due (including Pass). Backlog clears due.
 */
export function commitTestSprintPlan(
  tests: Array<TestCase & { suite?: string }>,
  current: Record<string, number>,
  currentDueDates: Record<string, string> = {},
  mode: SprintPlanMode = "preserve",
  currentStatuses: Record<string, TestStatus | string> = {},
): {
  sprints: Record<string, number>;
  dueDates: Record<string, string>;
  changedIds: string[];
} {
  const sprints: Record<string, number> = { ...current };
  const dueDates: Record<string, string> = { ...currentDueDates };
  const changedIds: string[] = [];
  for (const t of tests) {
    const suggested = suggestedSprintForTest(t);
    const stored = sprints[t.id];
    const hasStored = typeof stored === "number" && Number.isFinite(stored);
    let nextSprint: number;
    if (mode === "force" || !hasStored) {
      nextSprint = suggested;
    } else if (suggested === 0) {
      // S0 task-matched defaults: pin only when unset, still on S0, or parked on Backlog.
      // Never yank a committed Sprint 1+ placement back to S0 (End Sprint / manual move wins).
      if (stored === 0 || stored === BACKLOG_SPRINT) {
        nextSprint = 0;
      } else {
        nextSprint = stored;
      }
    } else if (stored === 0) {
      // Unmatched tests never remain on Sprint 0
      nextSprint = suggested;
    } else if (stored === BACKLOG_SPRINT && suggested !== BACKLOG_SPRINT) {
      // Re-home catalog tests parked on Backlog by 2026-07-20-no-tests-in-s0
      nextSprint = suggested;
    } else {
      nextSprint = stored;
    }
    const due = dueDateForSprint(nextSprint);
    const sprintChanged = sprints[t.id] !== nextSprint;
    const status = currentStatuses[t.id];
    const mayHealDue = sprintChanged || testStatusNeedsSprintDue(status);
    const dueChanged =
      mayHealDue && Boolean(due) && String(dueDates[t.id] ?? "").trim() !== due;
    const clearDue =
      isBacklogSprint(nextSprint) && Boolean(String(dueDates[t.id] ?? "").trim());
    if (!sprintChanged && !dueChanged && !clearDue) continue;
    sprints[t.id] = nextSprint;
    if (due && (sprintChanged || testStatusNeedsSprintDue(status))) dueDates[t.id] = due;
    else if (clearDue) dueDates[t.id] = "";
    changedIds.push(t.id);
  }
  return { sprints, dueDates, changedIds };
}

/**
 * Bump to re-run Schedule soft heal (S0 task matches + re-home Backlog parking).
 */
export const ROLLOUT_SCHEDULE_VERSION = "2026-07-25-no-tests-pinned-to-s0";

export type RolloutScheduleApplyResult = {
  planItems: PlanItem[];
  tasks: GyshTask[];
  testSprints: Record<string, number>;
  testDueDates: Record<string, string>;
  planChanged: boolean;
  tasksChanged: boolean;
  testChangedIds: string[];
};

/**
 * Apply rollout schedule. Default mode is preserve (safe for Schedule load).
 * Pass mode: "force" only from opt-in scripts — never on every page open.
 */
export function applyRolloutSprintSchedule(input: {
  planItems: PlanItem[];
  tasks: GyshTask[];
  tests: Array<TestCase & { suite?: string }>;
  testSprints: Record<string, number>;
  testDueDates?: Record<string, string>;
  testStatuses?: Record<string, TestStatus | string>;
  ref?: Date;
  mode?: SprintPlanMode;
}): RolloutScheduleApplyResult {
  const mode = input.mode ?? "preserve";
  const plan = commitPlanSprintPlan(input.planItems, input.ref ?? new Date(), mode);
  const taskResult = commitTaskSprintPlan(input.tasks, mode);
  const testResult = commitTestSprintPlan(
    input.tests,
    input.testSprints,
    input.testDueDates ?? {},
    mode,
    input.testStatuses ?? {},
  );
  return {
    planItems: plan.items,
    tasks: taskResult.tasks,
    testSprints: testResult.sprints,
    testDueDates: testResult.dueDates,
    planChanged: plan.changed,
    tasksChanged: taskResult.changed,
    testChangedIds: testResult.changedIds,
  };
}
