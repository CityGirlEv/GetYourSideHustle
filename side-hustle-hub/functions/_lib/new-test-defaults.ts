/**
 * Defaults for newly created test cases (mirrors src/lib/gysh-new-test-defaults.ts).
 * General → Backlog + Unassigned.
 * KevinaStarr Kids / Youth → Tina, current (or next) sprint, due = creation + 1 day.
 * Sprint 0 task-matched catalog ids → Sprint 0 (rare on create; never otherwise).
 */

import {
  BACKLOG_SPRINT,
  DEFAULT_SPRINT_COUNT,
  currentSprintIndex,
  dueDateForSprint,
  getSprintWindow,
} from "./sprints";

/** Keep in sync with src/lib/gysh-sprint-board.ts TEST_SPRINT_0_TASK_MATCH. */
const TEST_SPRINT_0_TASK_MATCH = new Set([
  "EMAIL-001",
  "EMAIL-005",
  "BRAND-001",
  "ABOUT-001",
  "ADMIN-003",
  "KIDS-001",
]);

export type NewTestDefaultInput = {
  id?: string;
  title?: string;
  area?: string;
  path?: string;
  category?: string;
  suite?: string;
  tags?: string;
};

export type NewTestDefaults = {
  sprint: number;
  assignee: string;
  dueDate: string;
};

const KEVINA_RE = /kevina\s*starr|kevinastarr|kevina-starr|kevina_starr|\bkevina\b/i;
const KIDS_YOUTH_RE =
  /\bkids?\b|\byouth\b|\bteens?\b|\bjunior\b|\bjr\b|\bkids\s*corner\b|\bkids\s*&\s*teens\b/i;

export function isKevinaKidsYouthTest(input: NewTestDefaultInput): boolean {
  const id = String(input.id ?? "").toUpperCase();
  if (
    id.startsWith("KIDS-") ||
    id.startsWith("JR-") ||
    id.startsWith("K-FMSH") ||
    id.startsWith("J-FMSH") ||
    id.includes("KIDS-FMSH") ||
    id.includes("JR-FMSH") ||
    id.includes("KEVINA")
  ) {
    return true;
  }

  const path = String(input.path ?? "").toLowerCase().trim();
  if (path === "kids" || path.startsWith("kids/") || path.includes("kevina")) {
    return true;
  }

  const category = String(input.category ?? "").toLowerCase();
  if (
    category === "kids_junior" ||
    category === "wizard_kids" ||
    category === "wizard_junior" ||
    category.includes("kids") ||
    category.includes("youth") ||
    category.includes("teen") ||
    category.includes("junior") ||
    category.includes("kevina")
  ) {
    return true;
  }

  const blob = [input.title, input.area, input.suite, input.tags, input.id]
    .filter(Boolean)
    .join(" ");
  if (KEVINA_RE.test(blob)) return true;
  if (KIDS_YOUTH_RE.test(blob)) return true;
  return false;
}

function daysUntilSprintEnd(ref: Date = new Date()): number {
  const sw = getSprintWindow(currentSprintIndex(ref));
  const today = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const endDay = new Date(sw.end.getFullYear(), sw.end.getMonth(), sw.end.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((endDay.getTime() - today.getTime()) / msPerDay));
}

function dueDatePlusDays(days: number, ref: Date = new Date()): string {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  d.setDate(d.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

/**
 * Never Sprint 0 for generic Kids/Youth creates — S0 task-matched ids are handled
 * in defaultsForNewTest first.
 */
export function sprintForNewKidsYouthTest(ref: Date = new Date()): number {
  let sprint = currentSprintIndex(ref);
  if (daysUntilSprintEnd(ref) <= 1) {
    sprint = Math.min(DEFAULT_SPRINT_COUNT - 1, sprint + 1);
  }
  if (sprint === 0) sprint = 1;
  return sprint;
}

export function defaultsForNewTest(
  input: NewTestDefaultInput,
  ref: Date = new Date(),
): NewTestDefaults {
  const id = String(input.id ?? "").toUpperCase();
  if (id && TEST_SPRINT_0_TASK_MATCH.has(id)) {
    return {
      sprint: 0,
      assignee: isKevinaKidsYouthTest(input) ? "tina" : "",
      dueDate: dueDateForSprint(0),
    };
  }
  if (isKevinaKidsYouthTest(input)) {
    return {
      sprint: sprintForNewKidsYouthTest(ref),
      assignee: "tina",
      dueDate: dueDatePlusDays(1, ref),
    };
  }
  return {
    sprint: BACKLOG_SPRINT,
    assignee: "",
    dueDate: "",
  };
}
