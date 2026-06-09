import type { TaskRow, TaskRowStatus } from "@/lib/tasks-sheet";
import type { Priority } from "@/lib/test-plan";

/**
 * Pure helpers powering the Task Sheet's row-selection + bulk-edit toolbar.
 * Extracted so they can be unit-tested without rendering the React tree.
 */

export interface BulkEdit {
  status?: TaskRowStatus | "";
  sprintId?: string;
  assignedTo?: string;
  priority?: Priority | "";
  notes?: string;
  notesMode?: "append" | "replace";
  assignBy?: string;
  dateAssigned?: string;
  dueDate?: string;
  dateCompleted?: string;
  cost?: string;
  /** Stable "today" stamp so tests don't depend on the wall clock. */
  today?: string;
}

export function toggleInSet<T>(set: Set<T>, value: T, checked: boolean): Set<T> {
  const next = new Set(set);
  if (checked) next.add(value); else next.delete(value);
  return next;
}

export function toggleAllInSet<T>(allValues: readonly T[], checked: boolean): Set<T> {
  return checked ? new Set(allValues) : new Set<T>();
}

export function isAllSelected<T>(visible: readonly T[], selected: ReadonlySet<T>): boolean {
  return visible.length > 0 && visible.every((v) => selected.has(v));
}

/**
 * Apply a bulk-edit patch to every row whose id is in `selectedIds`.
 * Empty / blank fields in the patch are NO-OPs (the existing value is kept),
 * matching the Task Sheet UI semantics.
 */
export function applyBulkEdit(
  rows: TaskRow[],
  selectedIds: ReadonlySet<string>,
  edit: BulkEdit,
): TaskRow[] {
  if (selectedIds.size === 0) return rows;
  const today = edit.today ?? "";
  return rows.map((r) => {
    if (!selectedIds.has(r.id)) return r;
    const u: TaskRow = { ...r };
    if (edit.status) {
      u.status = edit.status;
      if (edit.status === "done" && !u.dateCompleted) u.dateCompleted = today;
    }
    if (edit.sprintId) u.sprintId = edit.sprintId;
    if (edit.assignedTo?.trim()) u.assignedTo = edit.assignedTo.trim();
    if (edit.priority) u.priority = edit.priority;
    if (edit.notes?.trim()) {
      const line = today ? `[${today}] ${edit.notes.trim()}` : edit.notes.trim();
      u.notes = edit.notesMode === "replace" || !u.notes ? line : `${u.notes}\n${line}`;
    }
    if (edit.assignBy?.trim()) u.assignBy = edit.assignBy.trim();
    if (edit.dateAssigned?.trim()) u.dateAssigned = edit.dateAssigned.trim();
    if (edit.dueDate?.trim()) u.dueDate = edit.dueDate.trim();
    if (edit.dateCompleted?.trim()) u.dateCompleted = edit.dateCompleted.trim();
    if (edit.cost !== undefined && edit.cost.trim() !== "") {
      const n = Number(edit.cost);
      if (!Number.isNaN(n)) u.cost = n;
    }
    return u;
  });
}

/** Remove every row whose id is in `selectedIds`. */
export function bulkDelete(rows: TaskRow[], selectedIds: ReadonlySet<string>): TaskRow[] {
  if (selectedIds.size === 0) return rows;
  return rows.filter((r) => !selectedIds.has(r.id));
}