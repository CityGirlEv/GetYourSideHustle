/** Parent / subtask helpers — one parent counts as 1 task; notes sync across the family. */

import type { GyshTask } from "./gysh-tasks";

export function normalizeParentId(raw: unknown): string {
  return String(raw ?? "").trim();
}

/** Root tasks (no parent). Subtasks are excluded from sprint / chip counts. */
export function isTaskCountHead(task: Pick<GyshTask, "parentId">): boolean {
  return !normalizeParentId(task.parentId);
}

/**
 * Personal work rows: skip umbrella parents that have children
 * (Tina works T-041T; Evelyn works T-041E; T-041 is the container).
 */
export function isPersonalWorkTask(task: GyshTask, allTasks: readonly GyshTask[]): boolean {
  const parentId = normalizeParentId(task.parentId);
  if (parentId) return true;
  return !allTasks.some((t) => normalizeParentId(t.parentId) === task.id);
}

export function taskChildren(tasks: readonly GyshTask[], parentId: string): GyshTask[] {
  const pid = normalizeParentId(parentId);
  if (!pid) return [];
  return tasks
    .filter((t) => normalizeParentId(t.parentId) === pid)
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

/** Parent id + all sibling / child ids that share notes. */
export function taskFamilyIds(tasks: readonly GyshTask[], taskId: string): string[] {
  const self = tasks.find((t) => t.id === taskId);
  if (!self) return [taskId];
  const rootId = normalizeParentId(self.parentId) || self.id;
  const ids = new Set<string>([rootId]);
  for (const t of tasks) {
    if (t.id === rootId || normalizeParentId(t.parentId) === rootId) ids.add(t.id);
  }
  return [...ids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** Nest children under their parent; orphans (parent filtered out) stay visible. */
export function orderTasksWithSubtasks(tasks: readonly GyshTask[]): GyshTask[] {
  const byParent = new Map<string, GyshTask[]>();
  const roots: GyshTask[] = [];
  const inSet = new Set(tasks.map((t) => t.id));

  for (const t of tasks) {
    const pid = normalizeParentId(t.parentId);
    if (pid && inSet.has(pid)) {
      const list = byParent.get(pid) ?? [];
      list.push(t);
      byParent.set(pid, list);
    } else {
      roots.push(t);
    }
  }

  const out: GyshTask[] = [];
  for (const r of roots) {
    out.push(r);
    const kids = (byParent.get(r.id) ?? []).sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true }),
    );
    out.push(...kids);
    byParent.delete(r.id);
  }
  for (const kids of byParent.values()) {
    out.push(...kids.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })));
  }
  return out;
}

/** Copy notes onto every member of the family (same shared thread). */
export function syncNotesAcrossFamily(
  tasks: readonly GyshTask[],
  sourceId: string,
  notes: string,
): GyshTask[] {
  const family = new Set(taskFamilyIds(tasks, sourceId));
  return tasks.map((t) => (family.has(t.id) ? { ...t, notes } : t));
}

/**
 * Parent Done only when every subtask is Done; otherwise in_progress if any child moved.
 * Leaves parents with no children unchanged.
 */
export function rollupParentFromChildren(tasks: readonly GyshTask[], parentId: string): GyshTask[] {
  const pid = normalizeParentId(parentId);
  if (!pid) return [...tasks];
  const children = taskChildren(tasks, pid);
  if (children.length === 0) return [...tasks];
  const allDone = children.every((c) => c.status === "done");
  const anyActive = children.some((c) => c.status === "in_progress" || c.status === "blocked");
  return tasks.map((t) => {
    if (t.id !== pid) return t;
    if (allDone) {
      return {
        ...t,
        status: "done" as const,
        tinaDone: t.assignedTo === "Tina" || t.assignedTo === "Both" ? true : t.tinaDone,
        evelynDone: t.assignedTo === "Evelyn" || t.assignedTo === "Both" ? true : t.evelynDone,
        dateCompleted: t.dateCompleted || children.find((c) => c.dateCompleted)?.dateCompleted || "",
      };
    }
    if (t.status === "done" || anyActive || children.some((c) => c.status !== "not_started")) {
      return {
        ...t,
        status: anyActive || children.some((c) => c.status === "in_progress")
          ? ("in_progress" as const)
          : t.status === "done"
            ? ("in_progress" as const)
            : t.status,
        dateCompleted: "",
      };
    }
    return t;
  });
}

/** After any family member changes, re-rollup its parent (if any). */
export function rollupFamilyParents(tasks: readonly GyshTask[], touchedId: string): GyshTask[] {
  const self = tasks.find((t) => t.id === touchedId);
  if (!self) return [...tasks];
  const rootId = normalizeParentId(self.parentId) || self.id;
  return rollupParentFromChildren(tasks, rootId);
}
