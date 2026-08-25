/** GYSH Admin Task List — types + D1 API only (no localStorage / client seed). */

import { api } from "./api";
import {
  LAUNCH_GUIDES,
  guideReviewDescription,
  guideReviewNotes,
  guideReviewTaskId,
} from "./launch-guides";
import { MEMBERSHIP_TIERS, type TierId } from "./membership";
import { currentSprintIndex, dueDateForSprint } from "./gysh-sprints";
import { ensureTaskNotesPageLink } from "./qa-page-links";
import { suggestedSprintForTask } from "./gysh-sprint-board";

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "failed"
  | "fixed_retest"
  | "failed_retest"
  | "done";
export type TaskPriority = "P0" | "P1" | "P2" | "P3";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked: "Blocked",
  failed: "Failed",
  fixed_retest: "Fixed/Re-Test",
  failed_retest: "Failed/Re-Test",
  done: "Done",
};

/** Lead Dev (Evelyn) marks these after reviewing a Failed task — send back to original assignee. */
export const TASK_DEV_FIX_STATUSES: TaskStatus[] = ["fixed_retest", "failed_retest"];

/** Statuses that require a short written note (same idea as Testing Portal). */
export const TASK_NOTE_REQUIRED_STATUSES: TaskStatus[] = [
  "failed",
  "fixed_retest",
  "failed_retest",
];

export function isTaskDevFixStatus(status: TaskStatus): boolean {
  return TASK_DEV_FIX_STATUSES.includes(status);
}

export function taskStatusRequiresNote(status: TaskStatus): boolean {
  return TASK_NOTE_REQUIRED_STATUSES.includes(status);
}

const TASK_STATUS_SET = new Set<string>(Object.keys(TASK_STATUS_LABELS));

export function normalizeTaskStatus(raw: unknown): TaskStatus {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (v === "fail") return "failed";
  if (TASK_STATUS_SET.has(v)) return v as TaskStatus;
  return "not_started";
}

/** Attachment metadata. File bytes live in D1 (`content_base64`); IndexedDB is a local cache. */
export type GyshTaskAttachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  storedId: string;
  r2Key?: string | null;
  addedAt: string;
  /** True when D1 has downloadable file bytes. */
  hasContent?: boolean;
};

/** Tina & Evelyn operational taxonomy for GYSH task backlog. */
export type TaskCategory =
  | "website"
  | "facebook_social"
  | "youtube_kevina"
  | "assets_brand"
  | "kids_corner"
  | "senior_side_hustles"
  | "workshops"
  | "admin_ops"
  | "email_resend"
  | "content"
  | "launch_marketing"
  | "other";

export const TASK_CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: "website", label: "Website" },
  { id: "facebook_social", label: "Facebook / Social" },
  { id: "youtube_kevina", label: "YouTube / Kevina" },
  { id: "assets_brand", label: "Assets / Brand" },
  { id: "kids_corner", label: "Kids Corner" },
  { id: "senior_side_hustles", label: "Senior Side Hustles" },
  { id: "workshops", label: "Workshops" },
  { id: "admin_ops", label: "Admin / Ops" },
  { id: "email_resend", label: "Email / Resend" },
  { id: "content", label: "Content" },
  { id: "launch_marketing", label: "Launch / Marketing" },
  { id: "other", label: "Other" },
];

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = Object.fromEntries(
  TASK_CATEGORIES.map((c) => [c.id, c.label]),
) as Record<TaskCategory, string>;

const TASK_CATEGORY_SET = new Set<string>(TASK_CATEGORIES.map((c) => c.id));

const LEGACY_CATEGORY_MAP: Record<string, TaskCategory> = {
  brand: "assets_brand",
  product: "website",
  ops: "admin_ops",
  qa: "admin_ops",
  content: "content",
};

export function normalizeCategory(raw: unknown): TaskCategory {
  const key = String(raw || "").trim();
  if (TASK_CATEGORY_SET.has(key)) return key as TaskCategory;
  return LEGACY_CATEGORY_MAP[key] ?? "other";
}

export function categoryLabel(category: TaskCategory | string): string {
  const id = normalizeCategory(category);
  return TASK_CATEGORY_LABELS[id];
}

/** Named people who can be assigned to tasks / plan items. */
export type PartnerAssignee = "Tina" | "Evelyn" | "Lyriq" | "Candace";

/**
 * Stored assignee value.
 * - Singles: Tina | Evelyn | Lyriq | Candace | Unassigned
 * - Tina+Evelyn (legacy): Both
 * - Other multi: Tina+Lyriq | Evelyn+Candace | … (sorted join with +)
 */
export type TaskAssignee = string;

export const PARTNER_ASSIGNEES: PartnerAssignee[] = ["Tina", "Evelyn", "Lyriq", "Candace"];

const PARTNER_SET = new Set<string>(PARTNER_ASSIGNEES);

/** Parse stored assignee into partner list (Both → Tina+Evelyn). */
export function parseAssigneePeople(assignedTo: string | null | undefined): PartnerAssignee[] {
  const raw = String(assignedTo ?? "").trim();
  if (!raw || raw === "Unassigned") return [];
  if (raw === "Both") return ["Tina", "Evelyn"];
  const parts = raw
    .split(/[+,&|/]/)
    .map((p) => p.trim())
    .filter(Boolean);
  const people: PartnerAssignee[] = [];
  for (const p of parts) {
    if (p === "Both") {
      if (!people.includes("Tina")) people.push("Tina");
      if (!people.includes("Evelyn")) people.push("Evelyn");
      continue;
    }
    const canon =
      p === "Candace" || /^candace\b/i.test(p)
        ? "Candace"
        : p === "Tina" || /^tina\b/i.test(p)
          ? "Tina"
          : p === "Evelyn" || /^evelyn\b/i.test(p)
            ? "Evelyn"
            : p === "Lyriq" || /^lyriq\b/i.test(p)
              ? "Lyriq"
              : p;
    if (PARTNER_SET.has(canon) && !people.includes(canon as PartnerAssignee)) {
      people.push(canon as PartnerAssignee);
    }
  }
  return people;
}

/** Encode partner list for storage (Tina+Evelyn alone → Both for partner-done rules). */
export function formatAssigneePeople(people: readonly PartnerAssignee[]): TaskAssignee {
  const uniq = PARTNER_ASSIGNEES.filter((p) => people.includes(p));
  if (uniq.length === 0) return "Unassigned";
  if (uniq.length === 1) return uniq[0]!;
  if (uniq.length === 2 && uniq[0] === "Tina" && uniq[1] === "Evelyn") return "Both";
  return uniq.join("+");
}

/** Human label: "Tina + Evelyn", "Tina + Lyriq", etc. */
export function assigneeDisplayLabel(assignedTo: string | null | undefined): string {
  const people = parseAssigneePeople(assignedTo);
  if (people.length === 0) return "Unassigned";
  return people.join(" + ");
}

/** Tina+Evelyn pair (Both or Both+Lyriq) — partner Done checkboxes apply. */
export function requiresPartnerDone(assignedTo: string | null | undefined): boolean {
  const people = parseAssigneePeople(assignedTo);
  return people.includes("Tina") && people.includes("Evelyn");
}

export function assigneeIncludes(
  assignedTo: string | null | undefined,
  person: PartnerAssignee,
): boolean {
  return parseAssigneePeople(assignedTo).includes(person);
}

export type GyshTask = {
  id: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assignBy: string;
  assignedTo: TaskAssignee;
  dateAssigned: string;
  dueDate: string;
  dateCompleted: string;
  notes: string;
  /** Sprint index (0+ or -1 backlog). Default Sprint 0. */
  sprint: number;
  /** Partner completion — Both tasks need both true before status can be Done. */
  tinaDone: boolean;
  evelynDone: boolean;
  /**
   * Human assignee to restore after Lead Dev marks Fixed/Re-Test or Failed/Re-Test
   * (set when status becomes Failed and task is reassigned to Evelyn).
   */
  originalAssignee?: string;
  /** Parent task id when this row is a subtask (e.g. T-041T → T-041). Empty = root. */
  parentId?: string;
  /** ISO timestamp of last content change (server). */
  updatedAt?: string;
  /** Display name or email of last editor (server). */
  updatedBy?: string;
  attachments: GyshTaskAttachment[];
};

export const ACCEPT_ATTACHMENTS =
  "image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,video/mp4,video/webm,video/quicktime,.txt,.csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv";

const DOC_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
]);

const VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export function isAcceptedAttachment(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  if (type.startsWith("image/")) return true;
  if (VIDEO_MIME.has(type)) return true;
  if (DOC_MIME.has(type)) return true;
  if (/\.(png|jpe?g|gif|webp|svg|bmp|heic)$/i.test(name)) return true;
  if (/\.(mp4|webm|mov)$/i.test(name)) return true;
  if (/\.(pdf|doc|docx|xls|xlsx|txt|csv)$/i.test(name)) return true;
  return false;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function coerceSprint(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapTask(t: GyshTask): GyshTask {
  const parentId = String((t as { parentId?: unknown }).parentId ?? "").trim();
  const originalAssignee = String(
    (t as { originalAssignee?: unknown }).originalAssignee ?? "",
  ).trim();
  return {
    ...t,
    category: normalizeCategory(t.category),
    status: normalizeTaskStatus(t.status),
    // Do not use `|| 0` — BACKLOG_SPRINT is -1 and must stay -1.
    sprint: coerceSprint((t as { sprint?: unknown }).sprint, 0),
    tinaDone: Boolean(t.tinaDone),
    evelynDone: Boolean(t.evelynDone),
    originalAssignee: originalAssignee || undefined,
    parentId: parentId || undefined,
    attachments: Array.isArray(t.attachments) ? t.attachments : [],
  };
}

/**
 * Fail → Lead Dev (Evelyn) → Fixed/Re-Test or Failed/Re-Test → original assignee.
 * Mirrors Testing Portal’s fail / Fixed/Re-Test cycle.
 */
export function applyTaskFailDevCycle(
  task: GyshTask,
  patch: Partial<GyshTask>,
  opts?: { actor?: string | null; hasNote?: boolean },
): { task: GyshTask; error?: string } {
  const nextStatus =
    patch.status !== undefined ? normalizeTaskStatus(patch.status) : task.status;
  const actor = String(opts?.actor ?? "").trim();
  const isLeadDev = actor === "Evelyn" || actor.toLowerCase().includes("evelyn");

  if (isTaskDevFixStatus(nextStatus) && !isLeadDev) {
    return {
      task,
      error: "Only Lead Dev (Evelyn) may set Fixed/Re-Test or Failed/Re-Test.",
    };
  }

  if (
    patch.status !== undefined &&
    taskStatusRequiresNote(nextStatus) &&
    opts?.hasNote === false
  ) {
    return {
      task,
      error: `${TASK_STATUS_LABELS[nextStatus]} requires a short note explaining why.`,
    };
  }

  let next: GyshTask = {
    ...task,
    ...patch,
    status: nextStatus,
    attachments: patch.attachments ?? task.attachments,
  };

  if (patch.status === "failed") {
    const current = String(task.assignedTo || "").trim();
    if (current && current !== "Evelyn" && current !== "Unassigned") {
      next.originalAssignee = task.originalAssignee || current;
    } else if (!next.originalAssignee && task.originalAssignee) {
      next.originalAssignee = task.originalAssignee;
    }
    next.assignedTo = "Evelyn";
    next.tinaDone = false;
    next.evelynDone = false;
    next.dateCompleted = "";
  }

  if (isTaskDevFixStatus(nextStatus)) {
    const restore = String(next.originalAssignee || task.originalAssignee || "").trim();
    if (restore) {
      next.assignedTo = restore;
    }
    next.tinaDone = false;
    next.evelynDone = false;
    next.dateCompleted = "";
  }

  if (nextStatus === "done" || nextStatus === "not_started" || nextStatus === "in_progress") {
    // Keep originalAssignee while in retest until Done, so Fail again still works.
    if (nextStatus === "done") {
      next.originalAssignee = undefined;
    }
  }

  return { task: next };
}

/**
 * For Tina+Evelyn (Both) tasks: overall Done only when T + E have each marked done.
 * Single-assignee / other multi (e.g. Tina+Lyriq): overall status is enough.
 */
export function applyPartnerDone(task: GyshTask, patch: Partial<GyshTask> = {}): GyshTask {
  const statusIn =
    patch.status !== undefined ? normalizeTaskStatus(patch.status) : undefined;
  const patchNorm: Partial<GyshTask> =
    statusIn !== undefined ? { ...patch, status: statusIn } : { ...patch };

  // Fail / Fixed/Re-Test / Failed/Re-Test are not partner-done states.
  if (
    statusIn &&
    (statusIn === "failed" ||
      statusIn === "fixed_retest" ||
      statusIn === "failed_retest" ||
      statusIn === "blocked")
  ) {
    const next: GyshTask = {
      ...task,
      ...patchNorm,
      status: statusIn,
      attachments: patchNorm.attachments ?? task.attachments,
      tinaDone: false,
      evelynDone: false,
      dateCompleted: "",
    };
    return next;
  }

  const next: GyshTask = {
    ...task,
    ...patchNorm,
    attachments: patchNorm.attachments ?? task.attachments,
  };
  const people = parseAssigneePeople(next.assignedTo);

  if (requiresPartnerDone(next.assignedTo)) {
    // Tina+Evelyn (optionally +Lyriq) — cannot force Done via status alone until both partners are done.
    if (patchNorm.status === "done" && !(next.tinaDone && next.evelynDone)) {
      next.status = "in_progress";
    }
    if (patchNorm.status && patchNorm.status !== "done") {
      if (
        patchNorm.tinaDone === undefined &&
        patchNorm.evelynDone === undefined &&
        patchNorm.status !== "in_progress"
      ) {
        if (patchNorm.status === "not_started" || patchNorm.status === "blocked") {
          next.tinaDone = false;
          next.evelynDone = false;
        }
      }
    }
    if (next.tinaDone && next.evelynDone) {
      next.status = "done";
    } else if (next.status === "done") {
      next.status = "in_progress";
    } else if ((next.tinaDone || next.evelynDone) && next.status === "not_started") {
      next.status = "in_progress";
    }
  } else if (people.length === 1 && people[0] === "Tina") {
    if (patchNorm.status === "done") next.tinaDone = true;
    if (patchNorm.status && patchNorm.status !== "done") next.tinaDone = false;
    if (patchNorm.tinaDone === true) next.status = "done";
    if (patchNorm.tinaDone === false && next.status === "done") next.status = "in_progress";
    next.evelynDone = false;
  } else if (people.length === 1 && people[0] === "Evelyn") {
    if (patchNorm.status === "done") next.evelynDone = true;
    if (patchNorm.status && patchNorm.status !== "done") next.evelynDone = false;
    if (patchNorm.evelynDone === true) next.status = "done";
    if (patchNorm.evelynDone === false && next.status === "done") next.status = "in_progress";
    next.tinaDone = false;
  } else {
    // Lyriq, Unassigned, or Tina+Lyriq / Evelyn+Lyriq — overall status is enough.
    next.tinaDone = false;
    next.evelynDone = false;
  }

  if (next.status === "done") {
    if (!next.dateCompleted) next.dateCompleted = todayMMDDYY();
    next.originalAssignee = undefined;
  } else if (next.status !== "failed" && next.status !== "fixed_retest" && next.status !== "failed_retest") {
    next.dateCompleted = "";
  }
  return next;
}

export function partnerDoneSummary(task: Pick<GyshTask, "assignedTo" | "tinaDone" | "evelynDone" | "status">): string {
  const people = parseAssigneePeople(task.assignedTo);
  if (requiresPartnerDone(task.assignedTo)) {
    const t = task.tinaDone ? "Tina✓" : "Tina○";
    const e = task.evelynDone ? "Evelyn✓" : "Evelyn○";
    const extra = people.includes("Lyriq") ? " Lyriq·" : "";
    return `${t} ${e}${extra}`;
  }
  if (people.length === 0) return task.status === "done" ? "Unassigned✓" : "Unassigned○";
  if (people.length === 1) {
    const p = people[0]!;
    if (p === "Tina") return task.tinaDone || task.status === "done" ? "Tina✓" : "Tina○";
    if (p === "Evelyn") return task.evelynDone || task.status === "done" ? "Evelyn✓" : "Evelyn○";
    return task.status === "done" ? "Lyriq✓" : "Lyriq○";
  }
  return `${assigneeDisplayLabel(task.assignedTo)}${task.status === "done" ? "✓" : "○"}`;
}

export async function fetchTasks(): Promise<GyshTask[]> {
  const data = await api<{ tasks: GyshTask[] }>("tasks");
  return (data.tasks ?? []).map(mapTask);
}

export async function persistTasks(
  tasks: GyshTask[],
  opts?: { removeIds?: string[] },
): Promise<GyshTask[]> {
  // Last-write wins per id — avoids UNIQUE constraint if duplicates slipped into client state.
  // Schedule Suite QA belongs in Testing Portal (SCHED-*) — never re-upsert T-SCHED-* Task rows.
  const byId = new Map<string, GyshTask>();
  const scrubbedSched: string[] = [];
  for (const t of tasks) {
    if (t.id.startsWith("T-SCHED-")) {
      scrubbedSched.push(t.id);
      continue;
    }
    byId.set(t.id, mapTask(t));
  }
  const unique = Array.from(byId.values());
  const removeIds = [
    ...new Set([...(opts?.removeIds ?? []), ...scrubbedSched].filter(Boolean)),
  ].filter((id) => !byId.has(id));
  const data = await api<{ tasks: GyshTask[] }>("tasks", {
    method: "PUT",
    body: {
      tasks: unique.map((t) => ({ ...t, category: normalizeCategory(t.category) })),
      ...(removeIds.length ? { removeIds } : {}),
    },
  });
  return (data.tasks ?? []).map(mapTask);
}

export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const i = result.indexOf(",");
      resolve(i >= 0 ? result.slice(i + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(contentBase64: string, mimeType: string): Blob {
  const cleaned = contentBase64.replace(/^data:[^;]+;base64,/, "").replace(/\s+/g, "");
  const bin = atob(cleaned);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mimeType || "application/octet-stream" });
}

export async function uploadTaskAttachment(input: {
  taskId: string;
  id?: string;
  name: string;
  mimeType: string;
  contentBase64: string;
  addedAt?: string;
}): Promise<GyshTaskAttachment> {
  const data = await api<{ attachment: GyshTaskAttachment }>("task-attachments", {
    method: "POST",
    body: input,
    timeoutMs: 180_000,
  });
  return data.attachment;
}

export async function fetchTaskAttachmentContent(id: string): Promise<{
  name: string;
  mimeType: string;
  contentBase64: string;
}> {
  // Office / PDF payloads can be large — match test evidence timeout.
  return api(`task-attachments?id=${encodeURIComponent(id)}`, { timeoutMs: 180_000 });
}

export async function deleteTaskAttachmentRemote(id: string): Promise<void> {
  await api("task-attachments", { method: "DELETE", body: { id } });
}

export async function uploadPlanAttachment(input: {
  planItemId: string;
  id?: string;
  name: string;
  mimeType: string;
  contentBase64: string;
  addedAt?: string;
}): Promise<GyshTaskAttachment> {
  const data = await api<{ attachment: GyshTaskAttachment }>("plan-attachments", {
    method: "POST",
    body: input,
    timeoutMs: 180_000,
  });
  return data.attachment;
}

export async function fetchPlanAttachmentContent(id: string): Promise<{
  name: string;
  mimeType: string;
  contentBase64: string;
}> {
  return api(`plan-attachments?id=${encodeURIComponent(id)}`, { timeoutMs: 180_000 });
}

export async function deletePlanAttachmentRemote(id: string): Promise<void> {
  await api("plan-attachments", { method: "DELETE", body: { id } });
}

export function nextTaskId(tasks: GyshTask[]): string {
  // Only root-style T-### ids advance the counter (ignore T-041T / T-LG-* suffixes).
  const nums = tasks.map((t) => {
    const m = /^T-(\d+)$/i.exec(t.id);
    return m ? Number(m[1]) : 0;
  });
  const n = Math.max(0, ...nums) + 1;
  return `T-${String(n).padStart(3, "0")}`;
}

export function todayMMDDYY(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

/** Calendar day offset from today as MM/DD/YY (local). */
export function offsetMMDDYY(days: number, ref: Date = new Date()): string {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

export function tomorrowMMDDYY(ref: Date = new Date()): string {
  return offsetMMDDYY(1, ref);
}

/** Parse MM/DD/YY (or M/D/YY) to local midnight; null if invalid. */
export function parseMMDDYY(raw: string): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/.exec(String(raw || "").trim());
  if (!m) return null;
  const month = Number(m[1]) - 1;
  const day = Number(m[2]);
  const year = 2000 + Number(m[3]);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Normalize typed due date; returns trimmed string or null if empty/invalid. */
export function normalizeDueDateInput(raw: string): string | null {
  const v = String(raw || "").trim();
  if (!v) return "";
  if (!parseMMDDYY(v)) return null;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/.exec(v)!;
  const mm = String(Number(m[1])).padStart(2, "0");
  const dd = String(Number(m[2])).padStart(2, "0");
  return `${mm}/${dd}/${m[3]}`;
}

/** Convert MM/DD/YY → YYYY-MM-DD for `<input type="date">`. Empty if invalid/blank. */
export function mmddyyToIso(raw: string): string {
  const d = parseMMDDYY(raw);
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Convert YYYY-MM-DD from a date picker → MM/DD/YY. Empty string if blank; null if invalid. */
export function isoToMmddyy(iso: string): string | null {
  const v = String(iso || "").trim();
  if (!v) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  const yy = String(year).slice(-2);
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${mm}/${dd}/${yy}`;
}

export function todayIsoDate(): string {
  return mmddyyToIso(todayMMDDYY());
}

export function isTaskOverdue(task: Pick<GyshTask, "dueDate" | "status">, today = startOfToday()): boolean {
  if (task.status === "done") return false;
  const due = parseMMDDYY(task.dueDate);
  if (!due) return false;
  return due.getTime() < today.getTime();
}

export function isTaskDueToday(task: Pick<GyshTask, "dueDate" | "status">, today = startOfToday()): boolean {
  if (task.status === "done") return false;
  const due = parseMMDDYY(task.dueDate);
  if (!due) return false;
  return due.getTime() === today.getTime();
}

export function assigneeForAuthUser(user: { email?: string; name?: string } | null | undefined): PartnerAssignee | null {
  const email = String(user?.email || "").toLowerCase();
  if (email.includes("tina")) return "Tina";
  if (email.includes("evelyn") || email.includes("evvelyn")) return "Evelyn";
  if (email.includes("lyriq") || email.includes("leegaulden")) return "Lyriq";
  const name = String(user?.name || "").toLowerCase();
  if (name.includes("tina")) return "Tina";
  if (name.includes("evelyn")) return "Evelyn";
  if (name.includes("lyriq")) return "Lyriq";
  return null;
}

export function taskMatchesAssignee(task: Pick<GyshTask, "assignedTo">, me: PartnerAssignee): boolean {
  return assigneeIncludes(task.assignedTo, me);
}

export function dueAttentionTasks(
  tasks: GyshTask[],
  me: PartnerAssignee,
): { overdue: GyshTask[]; dueToday: GyshTask[] } {
  const today = startOfToday();
  const parentIdsWithChildren = new Set(
    tasks.map((t) => String(t.parentId || "").trim()).filter(Boolean),
  );
  const mine = tasks.filter((t) => {
    if (!taskMatchesAssignee(t, me) || t.status === "done") return false;
    // Umbrella parents are containers — due work lives on subtasks.
    if (!String(t.parentId || "").trim() && parentIdsWithChildren.has(t.id)) return false;
    return true;
  });
  const overdue = mine.filter((t) => isTaskOverdue(t, today)).sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
  const dueToday = mine
    .filter((t) => isTaskDueToday(t, today))
    .sort((a, b) => a.id.localeCompare(b.id));
  return { overdue, dueToday };
}

function hasGuideReviewTask(tasks: GyshTask[], guideId: string, name: string): boolean {
  const id = guideReviewTaskId(guideId);
  const desc = guideReviewDescription(name);
  const marker = `guide-review:${guideId}`;
  return tasks.some(
    (t) =>
      t.id === id ||
      t.description === desc ||
      t.notes.includes(marker) ||
      (t.description.startsWith("Review Launch Guide:") && t.description.includes(name)),
  );
}

/**
 * Ensures one Task List review item exists per launch guide in LAUNCH_GUIDES.
 * Idempotent — safe to call on every Admin / Task List mount.
 * Returns the merged task list and any newly created tasks (not yet persisted).
 */
export function ensureGuideReviewTasks(existing: GyshTask[]): {
  tasks: GyshTask[];
  created: GyshTask[];
} {
  const created: GyshTask[] = [];
  const today = todayMMDDYY();

  for (const guide of LAUNCH_GUIDES) {
    if (hasGuideReviewTask(existing, guide.id, guide.name) || hasGuideReviewTask(created, guide.id, guide.name)) {
      continue;
    }
    const draft = {
      id: guideReviewTaskId(guide.id),
      description: guideReviewDescription(guide.name),
      category: "content" as const,
      priority: "P1" as const,
      status: "not_started" as const,
      assignBy: "Auto-sync",
      assignedTo: "Both",
      dateAssigned: today,
      dueDate: "",
      dateCompleted: "",
      notes: guideReviewNotes(guide.id),
      sprint: 0,
      tinaDone: false,
      evelynDone: false,
      attachments: [] as GyshTaskAttachment[],
    };
    draft.sprint = suggestedSprintForTask(draft);
    created.push(draft);
  }

  if (created.length === 0) {
    return { tasks: existing, created };
  }
  return { tasks: [...existing, ...created], created };
}

export const SENIOR_PAGE_REVIEW_TASK_ID = "T-SENIOR-PAGE";
export const SENIOR_PAGE_REVIEW_DESC = "Review Senior Side Hustles page & verbiage";
export const SENIOR_PAGE_REVIEW_NOTES = "Open [Seniors Corner](/seniors)\npage-review:senior-side-hustles";

function hasSeniorPageReviewTask(tasks: GyshTask[]): boolean {
  return tasks.some(
    (t) =>
      t.id === SENIOR_PAGE_REVIEW_TASK_ID ||
      t.description === SENIOR_PAGE_REVIEW_DESC ||
      t.notes.includes("page-review:senior-side-hustles"),
  );
}

/** Ensures a Both-assigned review task for the Senior Side Hustles page. Idempotent. */
export function ensureSeniorPageReviewTask(existing: GyshTask[]): {
  tasks: GyshTask[];
  created: GyshTask[];
} {
  if (hasSeniorPageReviewTask(existing)) {
    return { tasks: existing, created: [] };
  }
  const draft: GyshTask = {
    id: SENIOR_PAGE_REVIEW_TASK_ID,
    description: SENIOR_PAGE_REVIEW_DESC,
    category: "senior_side_hustles",
    priority: "P1",
    status: "not_started",
    assignBy: "Auto-sync",
    assignedTo: "Both",
    dateAssigned: todayMMDDYY(),
    dueDate: "",
    dateCompleted: "",
    notes: SENIOR_PAGE_REVIEW_NOTES,
    sprint: 0,
    tinaDone: false,
    evelynDone: false,
    attachments: [],
  };
  draft.sprint = suggestedSprintForTask(draft);
  const created: GyshTask[] = [draft];
  return { tasks: [...existing, ...created], created };
}

/** Stable Task List id for Tina’s membership-tier review (Free / Starter / Pro / Elite). */
export function membershipTierReviewTaskId(tierId: TierId): string {
  return `T-MEM-${tierId.toUpperCase()}`;
}

export function membershipTierReviewDescription(name: string): string {
  return `Review Membership level: ${name} — pricing, perks, audience lanes; note issues or Fail & send for revisions`;
}

export function membershipTierReviewNotes(tierId: TierId, name: string): string {
  return [
    "Open [Join / Membership plans](/join)",
    `membership-tier-review:${tierId}`,
    "",
    `Tina review checklist for **${name}**:`,
    "1. Open Join → Membership plans; check Adults, Kids, Teens, and Seniors audience lanes.",
    `2. Read the ${name} card: tagline, monthly/yearly price, commitment, Kid Credits, consulting.`,
    "3. Verify the perk list / “Everything in …” ladder is accurate and clear for each lane.",
    "4. If OK: add notes (what you checked) and mark Done.",
    "5. If not OK: set status Blocked, write revision notes (what’s wrong / what to change), and assign/notify Evelyn for revisions.",
  ].join("\n");
}

function hasMembershipTierReviewTask(tasks: GyshTask[], tierId: TierId, name: string): boolean {
  const id = membershipTierReviewTaskId(tierId);
  const desc = membershipTierReviewDescription(name);
  const marker = `membership-tier-review:${tierId}`;
  return tasks.some(
    (t) =>
      t.id === id ||
      t.description === desc ||
      t.notes.includes(marker) ||
      (t.description.startsWith("Review Membership level:") && t.description.includes(name)),
  );
}

/**
 * Ensures one Tina-assigned Task List review item per membership tier (Free→Elite).
 * Idempotent — safe on every Task List mount / sync.
 */
export function ensureMembershipTierReviewTasks(existing: GyshTask[]): {
  tasks: GyshTask[];
  created: GyshTask[];
} {
  const created: GyshTask[] = [];
  const today = todayMMDDYY();
  const sprint = currentSprintIndex();
  const dueDate = dueDateForSprint(sprint);

  for (const tier of MEMBERSHIP_TIERS) {
    if (
      hasMembershipTierReviewTask(existing, tier.id, tier.name) ||
      hasMembershipTierReviewTask(created, tier.id, tier.name)
    ) {
      continue;
    }
    created.push({
      id: membershipTierReviewTaskId(tier.id),
      description: membershipTierReviewDescription(tier.name),
      category: "website",
      priority: "P1",
      status: "not_started",
      assignBy: "Evelyn",
      assignedTo: "Tina",
      dateAssigned: today,
      dueDate,
      dateCompleted: "",
      notes: membershipTierReviewNotes(tier.id, tier.name),
      sprint,
      tinaDone: false,
      evelynDone: false,
      attachments: [],
    });
  }

  if (created.length === 0) {
    return { tasks: existing, created };
  }
  return { tasks: [...existing, ...created], created };
}

/** Stable id for Military & Veterans membership discount + Join callout. */
export const MILITARY_VETERAN_CALLOUT_TASK_ID = "T-MEM-MILITARY";

/** Sprint that ships Military membership discount + Join callout re-enable. */
export const MILITARY_MEMBERSHIP_DISCOUNT_SPRINT = 6;

/**
 * @deprecated Prefer {@link MILITARY_MEMBERSHIP_DISCOUNT_SPRINT} (fixed Sprint 6).
 * Kept so older tests that reference offset still compile.
 */
export const MILITARY_VETERAN_CALLOUT_SPRINT_OFFSET = 3;

export function militaryVeteranCalloutTaskNotes(): string {
  return [
    "Open [Join / Membership plans](/join)",
    "membership-military-callout:discount-sprint-6",
    "",
    "Sprint 6 — Military Membership discount (Adults/Seniors).",
    "Callout is currently hidden (SHOW_MILITARY_VETERAN_CALLOUT = false).",
    "",
    "1. Confirm Military/Veteran discount amounts with Tina & Evelyn (do not invent $ in copy).",
    "2. Wire veteran/military checkout pricing on Join for Adults & Seniors (and Senior stack when 55+).",
    "3. Update MILITARY_VETERAN_CALLOUT copy in membership.ts to match the approved discount.",
    "4. Set SHOW_MILITARY_VETERAN_CALLOUT = true; restore MEMBER-001 + e2e military assertions.",
    "5. Confirm Adults & Seniors show the callout + discounted path; Kids & Teens stay hidden.",
  ].join("\n");
}

/**
 * Ensures Task List row for Military Membership discount + Join callout (Sprint 6).
 * Heals sprint/due/description when the row already exists.
 */
export function ensureMilitaryVeteranCalloutTask(existing: GyshTask[]): {
  tasks: GyshTask[];
  created: GyshTask[];
} {
  const id = MILITARY_VETERAN_CALLOUT_TASK_ID;
  const sprint = MILITARY_MEMBERSHIP_DISCOUNT_SPRINT;
  const dueDate = dueDateForSprint(sprint);
  const description =
    "Add Military Membership discount (Adults/Seniors) + re-enable Join callout";
  const notes = militaryVeteranCalloutTaskNotes();
  const today = todayMMDDYY();

  const idx = existing.findIndex(
    (t) => t.id === id || t.notes.includes("membership-military-callout:"),
  );
  if (idx >= 0) {
    const prev = existing[idx]!;
    const needsHeal =
      prev.sprint !== sprint ||
      prev.dueDate !== dueDate ||
      prev.description !== description ||
      !prev.notes.includes("discount-sprint-6");
    if (!needsHeal) {
      return { tasks: existing, created: [] };
    }
    const healed: GyshTask = {
      ...prev,
      id,
      description,
      notes,
      sprint,
      dueDate,
      assignedTo: prev.assignedTo || "Both",
    };
    const next = [...existing];
    next[idx] = healed;
    return { tasks: next, created: [healed] };
  }

  const created: GyshTask[] = [
    {
      id,
      description,
      category: "website",
      priority: "P1",
      status: "not_started",
      assignBy: "Evelyn",
      assignedTo: "Both",
      dateAssigned: today,
      dueDate,
      dateCompleted: "",
      notes,
      sprint,
      tinaDone: false,
      evelynDone: false,
      attachments: [],
    },
  ];
  return { tasks: [...existing, ...created], created };
}

/**
 * Schedule Suite QA lives in Testing Portal (SCHED-*), not Task List.
 * Kept as case-id seeds for status/due assignment scripts only.
 */
export const SCHEDULE_SUITE_QA_CASE_IDS = [
  "SCHED-STATUS-001",
  "SCHED-STATUS-002",
  "SCHED-STATUS-003",
  "SCHED-REMINDER-001",
  "SCHED-ROUNDUP-001",
  "SCHED-GRADE-001",
  "SCHED-PNL-001",
] as const;

/** @deprecated Prefer SCHEDULE_SUITE_QA_CASE_IDS — Schedule QA is tests, not tasks. */
export const SCHEDULE_BLOCK_STATUS_QA_TASKS = [
  { id: "T-SCHED-STATUS-01", description: "deprecated", relatedCaseId: "SCHED-STATUS-001", assignedTo: "Lyriq" as const },
  { id: "T-SCHED-STATUS-02", description: "deprecated", relatedCaseId: "SCHED-STATUS-002", assignedTo: "Lyriq" as const },
  { id: "T-SCHED-STATUS-03", description: "deprecated", relatedCaseId: "SCHED-STATUS-003", assignedTo: "Lyriq" as const },
  { id: "T-SCHED-REMINDER-01", description: "deprecated", relatedCaseId: "SCHED-REMINDER-001", assignedTo: "Lyriq" as const },
  { id: "T-SCHED-ROUNDUP-01", description: "deprecated", relatedCaseId: "SCHED-ROUNDUP-001", assignedTo: "Lyriq" as const },
  { id: "T-SCHED-GRADE-01", description: "deprecated", relatedCaseId: "SCHED-GRADE-001", assignedTo: "Lyriq" as const },
  { id: "T-SCHED-PNL-01", description: "deprecated", relatedCaseId: "SCHED-PNL-001", assignedTo: "Lyriq" as const },
] as const;

export function scheduleBlockStatusQaNotes(relatedCaseId: string): string {
  const logical =
    relatedCaseId === "SCHED-PNL-001-EVELYN" || relatedCaseId === "SCHED-PNL-001-TINA"
      ? "SCHED-PNL-001"
      : relatedCaseId;
  if (logical === "SCHED-REMINDER-001") {
    return [
      "Open [My Dashboard → Schedule Suite](/dashboard)",
      `schedule-suite-qa:${relatedCaseId}`,
      "",
      "Pro+ (or admin) account required.",
      "1. Open a schedule tab → use Email Me on the view row to jump to Email reminders.",
      "2. Set Daily / Weekly / Bi-weekly / Monthly and Save; reload to confirm cadence stuck.",
      "3. Confirm reminder email (when sent) includes weekly plan table + Kid Credits.",
      "4. Set cadence to None and Save — no further reminders expected for that suite.",
      `Testing Portal case: ${relatedCaseId}`,
    ].join("\n");
  }
  if (logical === "SCHED-ROUNDUP-001") {
    return [
      "Open [My Dashboard → Schedule Suite](/dashboard)",
      `schedule-suite-qa:${relatedCaseId}`,
      "",
      "Pro+ (or admin) account required.",
      "1. Blueprint plan → Marketing + Target sales → Save.",
      "2. Weekly roundup → I killed it / Need improvement / Action items.",
      "3. From Plan tracker → Grade me → lands on Weekly Roundup; only one Grade me button on that view.",
      "4. Mark some days Done → Grade me → % score updates.",
      "5. Full scale + each letter: see SCHED-GRADE-001.",
      `Testing Portal case: ${relatedCaseId}`,
    ].join("\n");
  }
  if (logical === "SCHED-GRADE-001") {
    return [
      "Open [My Dashboard → Schedule Suite](/dashboard)",
      `schedule-suite-qa:${relatedCaseId}`,
      "",
      "Pro+ (or admin) account required.",
      "",
      "GRADING SCALE (how score is calculated):",
      "• Score = % of the 7 day blocks marked Done.",
      "• Not Started / In Progress / Blocked do NOT count.",
      "• Hours, sales, and roundup are context only (do not change the letter).",
      "• Marks: A+ 97–100% | A 90–96% | B+ 87–89% | B 80–86% | C+ 77–79% | C 70–76% | D 60–69% | F 0–59%.",
      "• With 7 days: 7 Done≈100% A+; 6≈86% B; 5≈71% C; 4≈57% F; 0=0% F.",
      "",
      "1. F: 0 Done → Grade me → F on Weekly Roundup.",
      "2. Walk Done counts to hit D, C/C+, B/B+, then A/A+ (7/7).",
      "3. Confirm Grade me switches to Roundup and does not show Grade me twice; re-grade updates after Done changes.",
      "4. A/A+ should show celebration.",
      `Testing Portal case: ${relatedCaseId}`,
    ].join("\n");
  }
  if (logical === "SCHED-PNL-001") {
    return [
      "Open [My Dashboard → Schedule Suite](/dashboard)",
      `schedule-suite-qa:${relatedCaseId}`,
      "",
      "Pro+ (or admin) account required. P&L is a Pro/Elite Schedule Suite feature.",
      "1. Confirm Membership/Join lists Profit & Loss calculator on Pro+.",
      "2. Schedule Suite → P&L calculator tab.",
      "3. Check Blueprint window: days (≤10 target), weeks, tracker % complete.",
      "4. Add Sale line (date, description, amount) → Sales + Net update.",
      "5. Add Expense line with category → Expenses + Net update.",
      "6. Confirm Weekly outcomes row (Sales / Exp / Net).",
      "7. Save, reload, confirm lines persist.",
      `Testing Portal case: ${relatedCaseId}`,
    ].join("\n");
  }
  return [
    "Open [My Dashboard → Schedule Suite](/dashboard)",
    `schedule-suite-qa:${relatedCaseId}`,
    "",
    "Pro+ (or admin) account required.",
    "1. Open Tracker for a schedule tab.",
    "2. Set each status: Not Started, In Progress, Done, Blocked.",
    "3. Confirm Done crosses out the day focus and uses green styling.",
    "4. Confirm In Progress (blue) and Blocked (red) color coding.",
    "5. Save, reload dashboard, confirm statuses persist.",
    `Testing Portal case: ${relatedCaseId}`,
  ].join("\n");
}

/**
 * No-op create: Schedule Suite QA is Testing Portal cases (SCHED-*), not Task List rows.
 * Returns removeIds for any leftover T-SCHED-* so sync can delete them.
 */
export function ensureScheduleBlockStatusQaTasks(existing: GyshTask[]): {
  tasks: GyshTask[];
  created: GyshTask[];
  removeIds: string[];
} {
  const removeIds = existing.filter((t) => t.id.startsWith("T-SCHED-")).map((t) => t.id);
  if (removeIds.length === 0) {
    return { tasks: existing, created: [], removeIds: [] };
  }
  const drop = new Set(removeIds);
  return {
    tasks: existing.filter((t) => !drop.has(t.id)),
    created: [],
    removeIds,
  };
}

/** Prepend Open [Page](/path) to notes when a task clearly targets a site page. */
export function ensureTaskPageLinks(tasks: GyshTask[]): {
  tasks: GyshTask[];
  updated: GyshTask[];
} {
  const updated: GyshTask[] = [];
  const next = tasks.map((t) => {
    const notes = ensureTaskNotesPageLink(t.notes, t);
    if (notes === t.notes) return t;
    const patched = { ...t, notes };
    updated.push(patched);
    return patched;
  });
  return { tasks: next, updated };
}

/**
 * Fetch tasks, ensure guide-review + senior page + membership-tier review items exist, persist if created.
 * Prefer calling from Task List after a fast fetch+paint (pass `existing` to skip a second GET).
 * Soft-launch CF tasks are synced separately (heavy) — see syncSoftLaunchTasks.
 */
export async function syncGuideReviewTasks(existing?: GyshTask[]): Promise<{
  tasks: GyshTask[];
  createdCount: number;
}> {
  const base = existing ?? (await fetchTasks());
  const guide = ensureGuideReviewTasks(base);
  const senior = ensureSeniorPageReviewTask(guide.tasks);
  const membership = ensureMembershipTierReviewTasks(senior.tasks);
  const military = ensureMilitaryVeteranCalloutTask(membership.tasks);
  const scheduleStatus = ensureScheduleBlockStatusQaTasks(military.tasks);
  const linked = ensureTaskPageLinks(scheduleStatus.tasks);
  const created = [
    ...guide.created,
    ...senior.created,
    ...membership.created,
    ...military.created,
    ...scheduleStatus.created,
  ];
  if (
    created.length === 0 &&
    linked.updated.length === 0 &&
    scheduleStatus.removeIds.length === 0
  ) {
    return { tasks: linked.tasks, createdCount: 0 };
  }
  // Delta PUT only — full-board saves are extremely slow on remote D1.
  const delta = [...created, ...linked.updated];
  const saved = await persistTasks(delta, { removeIds: scheduleStatus.removeIds });
  return { tasks: saved, createdCount: created.length };
}

const SOFT_LAUNCH_SYNC_FLAG = "gysh_soft_launch_tasks_synced";

/**
 * Ensures Content Factory soft-launch Task List rows exist.
 * Dynamic-imports the rollout catalog so the home/admin shell stays light.
 * Skips repeat work in the same browser tab after a successful sync.
 */
export async function syncSoftLaunchTasks(
  existing?: GyshTask[],
  opts?: { force?: boolean },
): Promise<{ tasks: GyshTask[]; createdCount: number }> {
  if (
    !opts?.force &&
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem(SOFT_LAUNCH_SYNC_FLAG) === "1"
  ) {
    const tasks = existing ?? (await fetchTasks());
    return { tasks, createdCount: 0 };
  }

  const { softLaunchTaskSeeds } = await import("./gysh-soft-launch-rollout");
  const base = existing ?? (await fetchTasks());
  const have = new Set(base.map((t) => t.id));
  const missingIds = softLaunchTaskSeeds({ idsOnly: true }).filter((id) => !have.has(id));
  if (missingIds.length === 0) {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(SOFT_LAUNCH_SYNC_FLAG, "1");
    }
    return { tasks: base, createdCount: 0 };
  }

  const today = todayMMDDYY();
  const seeds = softLaunchTaskSeeds({ onlyIds: missingIds, lightNotes: true });
  const created: GyshTask[] = seeds.map((seed) => ({
    id: seed.id,
    description: seed.description,
    category: normalizeCategory(seed.category),
    priority: (["P0", "P1", "P2", "P3"].includes(seed.priority)
      ? seed.priority
      : "P1") as TaskPriority,
    status: "not_started" as const,
    assignBy: seed.assignBy || "Auto-sync",
    assignedTo: seed.assignedTo || "Both",
    dateAssigned: today,
    dueDate: seed.dueDate || "",
    dateCompleted: "",
    notes: seed.notes,
    sprint: seed.sprint,
    tinaDone: false,
    evelynDone: false,
    attachments: [],
  }));

  // Upsert only the new CF rows — never re-PUT the whole Task List on seed.
  const saved = await persistTasks(created);
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(SOFT_LAUNCH_SYNC_FLAG, "1");
  }
  return { tasks: saved, createdCount: created.length };
}
