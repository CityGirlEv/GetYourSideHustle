/**
 * Filter-chip click rules shared by Testing Portal, Task List, and Schedule.
 *
 * Plain click filters the list to that bubble. Shift+click adds a range.
 * Ctrl/Cmd+click toggles the bubble into a multi-select set.
 */

export type FilterChipClickOpts<T> = {
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  ordered?: readonly T[];
  lastIndex?: number | null;
};

export function toggleFilterValue<T>(prev: Set<T>, value: T): Set<T> {
  const next = new Set(prev);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

/**
 * Testing Portal sprint chips: empty set = All sprints.
 * Open with this so Pass / Conditional Pass from prior sprints stay visible.
 */
export function defaultTestingPortalSprintFilters<T = never>(): Set<T> {
  return new Set();
}

export function isAllSprintsFilter(selected: Set<unknown>): boolean {
  return selected.size === 0;
}

/**
 * Apply a filter-bubble click.
 * - Plain click: select only this value (or clear if it was the only selection).
 * - Ctrl/Cmd+click: add/remove this value (multi-select).
 * - Shift+click: add every value between the last click and this one.
 * - `multiToggle`: plain click also toggles (assignee / tester chips).
 */
export function applyFilterChipClick<T>(
  prev: Set<T>,
  value: T,
  opts: FilterChipClickOpts<T> & { multiToggle?: boolean } = {},
): { next: Set<T>; lastIndex: number | null } {
  const ordered = opts.ordered ?? [];
  const idx = ordered.indexOf(value);
  const lastIndex = idx >= 0 ? idx : (opts.lastIndex ?? null);

  if (opts.shiftKey && opts.lastIndex != null && idx >= 0 && ordered.length > 0) {
    const lo = Math.min(opts.lastIndex, idx);
    const hi = Math.max(opts.lastIndex, idx);
    const next = new Set(prev);
    for (let i = lo; i <= hi; i++) next.add(ordered[i]!);
    return { next, lastIndex: idx };
  }

  if (opts.ctrlKey || opts.metaKey || opts.multiToggle) {
    return { next: toggleFilterValue(prev, value), lastIndex };
  }

  if (prev.size === 1 && prev.has(value)) {
    return { next: new Set<T>(), lastIndex };
  }
  return { next: new Set<T>([value]), lastIndex };
}

/**
 * When only Tests-status or only Tasks-status bubbles are on, hide the other
 * source so the board actually filters instead of leaving the other list full.
 */
export function boardSourceAllowedByStatusFacets(
  source: "test" | "task" | "plan",
  testStatusCount: number,
  taskStatusCount: number,
): boolean {
  if (source === "plan") return true;
  if (testStatusCount > 0 && taskStatusCount === 0) return source === "test";
  if (taskStatusCount > 0 && testStatusCount === 0) return source === "task";
  return true;
}
