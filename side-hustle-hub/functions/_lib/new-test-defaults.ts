/**
 * Defaults for newly created test cases (mirrors src/lib/gysh-new-test-defaults.ts).
 * Always land in the current sprint (never Backlog) unless a rare Sprint 0 task match applies.
 * KevinaStarr Kids / Youth → Tina, current (or next) sprint, due = creation + 1 day.
 * General → current sprint, Unassigned, due = today.
 */

import {
  DEFAULT_SPRINT_COUNT,
  currentSprintIndex,
  getSprintWindow,
} from "./sprints";

/** Keep in sync with src/lib/gysh-sprint-board.ts TEST_SPRINT_0_TASK_MATCH (empty). */
const TEST_SPRINT_0_TASK_MATCH = new Set<string>([]);

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

function isClosedSprint(closed: Iterable<number> | null | undefined, sprint: number): boolean {
  if (!closed) return false;
  if (closed instanceof Set) return closed.has(sprint);
  for (const n of closed) {
    if (Number(n) === sprint) return true;
  }
  return false;
}

/** Current sprint if open; otherwise the next open sprint. Never a closed sprint. */
export function sprintForNewTest(
  ref: Date = new Date(),
  closed?: Iterable<number> | null,
): number {
  const current = currentSprintIndex(ref);
  for (let i = current; i < DEFAULT_SPRINT_COUNT; i++) {
    if (!isClosedSprint(closed, i)) return Math.max(1, i);
  }
  for (let i = 0; i < current; i++) {
    if (!isClosedSprint(closed, i)) return Math.max(1, i);
  }
  return Math.max(1, current);
}

/** Never a closed sprint for Kids/Youth creates. */
export function sprintForNewKidsYouthTest(
  ref: Date = new Date(),
  closed?: Iterable<number> | null,
): number {
  let sprint = currentSprintIndex(ref);
  if (daysUntilSprintEnd(ref) <= 1) {
    sprint = Math.min(DEFAULT_SPRINT_COUNT - 1, sprint + 1);
  }
  if (sprint === 0) sprint = 1;
  if (isClosedSprint(closed, sprint) || sprint < currentSprintIndex(ref)) {
    return sprintForNewTest(ref, closed);
  }
  return sprint;
}

export function defaultsForNewTest(
  input: NewTestDefaultInput,
  ref: Date = new Date(),
  closed?: Iterable<number> | null,
): NewTestDefaults {
  const id = String(input.id ?? "").toUpperCase();
  // Reserved: only if TEST_SPRINT_0_TASK_MATCH is re-populated (currently empty).
  if (id && TEST_SPRINT_0_TASK_MATCH.has(id)) {
    return {
      sprint: sprintForNewTest(ref, closed),
      assignee: isKevinaKidsYouthTest(input) ? "tina" : "",
      dueDate: "",
    };
  }
  if (isKevinaKidsYouthTest(input)) {
    return {
      sprint: sprintForNewKidsYouthTest(ref, closed),
      assignee: "tina",
      dueDate: dueDatePlusDays(1, ref),
    };
  }
  return {
    sprint: sprintForNewTest(ref, closed),
    assignee: "",
    dueDate: dueDatePlusDays(0, ref),
  };
}
