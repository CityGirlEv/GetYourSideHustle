/**
 * Defaults for newly created test cases (generated failures, first D1 rows).
 * General → Backlog + Unassigned.
 * KevinaStarr Kids / Youth → Tina, current (or next) sprint, due = creation + 1 day.
 * Sprint 0 task-matched catalog ids → Sprint 0 (rare on create; never otherwise).
 */

import { suggestedSprintForTest, testMatchesSprint0Task } from "./gysh-sprint-board";
import {
  BACKLOG_SPRINT,
  DEFAULT_SPRINT_COUNT,
  currentSprintIndex,
  daysUntilSprintEnd,
  dueDateForSprint,
  dueDatePlusDays,
} from "./gysh-sprints";

export type NewTestDefaultInput = {
  id?: string;
  title?: string;
  area?: string;
  path?: string;
  category?: string;
  suite?: string;
  /** Extra free-text (steps, notes, tags) for matching. */
  tags?: string;
};

export type NewTestDefaults = {
  sprint: number;
  /** Empty string = Unassigned in D1 / Testing Portal. */
  assignee: string;
  dueDate: string;
};

const KEVINA_RE = /kevina\s*starr|kevinastarr|kevina-starr|kevina_starr|\bkevina\b/i;
const KIDS_YOUTH_RE =
  /\bkids?\b|\byouth\b|\bteens?\b|\bjunior\b|\bjr\b|\bkids\s*corner\b|\bkids\s*&\s*teens\b/i;

/** True when the case is KevinaStarr Kids / Youth / Teens related. */
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

/**
 * Sprint for new Kids/Youth tests: current sprint, or next sprint when today
 * is in the last 2 calendar days of the current sprint (Sun–Mon end).
 * Never Sprint 0 unless the case matches a Sprint 0 task (handled in defaultsForNewTest).
 */
export function sprintForNewKidsYouthTest(ref: Date = new Date()): number {
  let sprint = currentSprintIndex(ref);
  if (daysUntilSprintEnd(ref) <= 1) {
    sprint = Math.min(DEFAULT_SPRINT_COUNT - 1, sprint + 1);
  }
  if (sprint === 0) sprint = 1;
  return sprint;
}

/** Assignment defaults for a newly created test case. */
export function defaultsForNewTest(
  input: NewTestDefaultInput,
  ref: Date = new Date(),
): NewTestDefaults {
  // Catalog-style ids that verify a Sprint 0 task may land on Sprint 0 at create.
  if (input.id && testMatchesSprint0Task({ id: input.id })) {
    const sprint = suggestedSprintForTest({
      id: input.id,
      area: input.area ?? "",
      priority: "P2",
    });
    return {
      sprint,
      assignee: isKevinaKidsYouthTest(input) ? "tina" : "",
      dueDate: dueDateForSprint(sprint),
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
