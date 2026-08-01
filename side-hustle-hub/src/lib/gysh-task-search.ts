/** Task List search — Task # matching must stay exact (avoid date false positives). */

import {
  TASK_STATUS_LABELS,
  categoryLabel,
  type GyshTask,
} from "./gysh-tasks";
import { noteEntriesPlainText } from "./gysh-note-entries";
import {
  BACKLOG_SPRINT,
  UNASSIGNED_OWNER,
  isBacklogSprint,
  sprintLabel,
} from "./gysh-sprints";

/** True when the query is clearly aiming at a Task # (T-029 / 029 / #29). */
export function queryLooksLikeTaskId(rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return false;
  if (/^#?t-[\w-]+$/i.test(q)) return true;
  if (/^#?\d{1,4}$/.test(q)) return true;
  return false;
}

/**
 * Match by Task # only — exact number match.
 * "29" / "029" / "#29" / "T-029" → T-029 only (not T-024 via dates like 07/29/26).
 */
export function taskMatchesIdQuery(task: GyshTask, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase().replace(/^#/, "");
  if (!q) return false;
  const id = task.id.toLowerCase();

  if (id === q || id === `t-${q}`) return true;

  const qWithoutPrefix = q.replace(/^t-/, "");
  // Letter-suffix subtasks (t-041t / t-041e): exact id only — not siblings.
  const subMatch = /^(\d+)([a-z]+)$/i.exec(qWithoutPrefix);
  if (subMatch) {
    const want = `t-${Number(subMatch[1])}${subMatch[2]}`.toLowerCase();
    const wantPadded = `t-${subMatch[1]}${subMatch[2]}`.toLowerCase();
    return id === want || id === wantPadded;
  }

  // Slug ids (t-lg-airbnb): require full id match (not bare digits).
  if (/[a-z]/i.test(qWithoutPrefix.replace(/\d/g, ""))) {
    return id === q || id === `t-${qWithoutPrefix}`;
  }

  const qDigits = qWithoutPrefix.replace(/\D/g, "").replace(/^0+/, "") || "";
  if (!qDigits) return false;

  // T-041 / 41 matches T-041 and letter children T-041T / T-041E.
  const idNum = /^t-(\d+)([a-z]*)$/i.exec(task.id);
  if (!idNum) return false;
  const idDigits = idNum[1]!.replace(/^0+/, "") || "0";
  return idDigits === qDigits;
}

/** Match Task # plus description, notes, assignee, category, dates, sprint, files. */
export function taskMatchesSearch(task: GyshTask, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  // Pure task-# queries never fall through to description/date haystack.
  if (queryLooksLikeTaskId(rawQuery)) {
    return taskMatchesIdQuery(task, rawQuery);
  }
  if (taskMatchesIdQuery(task, rawQuery)) return true;
  const sprint = task.sprint ?? 0;
  const sprintText = sprint === BACKLOG_SPRINT ? "backlog" : sprintLabel(sprint).toLowerCase();
  const haystack = [
    task.id,
    task.description,
    noteEntriesPlainText(task.notes),
    categoryLabel(task.category),
    isBacklogSprint(sprint) ? UNASSIGNED_OWNER : task.assignedTo,
    task.assignBy,
    TASK_STATUS_LABELS[task.status],
    task.priority,
    task.dueDate,
    task.dateAssigned,
    task.dateCompleted,
    sprintText,
    ...(task.attachments ?? []).map((a) => a.name),
  ]
    .join("\n")
    .toLowerCase();
  return haystack.includes(q);
}
