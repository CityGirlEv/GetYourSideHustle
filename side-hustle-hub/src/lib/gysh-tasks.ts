/** GYSH Admin Task List — types + D1 API only (no localStorage / client seed). */

import { api } from "./api";
import {
  LAUNCH_GUIDES,
  guideReviewDescription,
  guideReviewNotes,
  guideReviewTaskId,
} from "./launch-guides";

export type TaskStatus = "not_started" | "in_progress" | "blocked" | "done";
export type TaskPriority = "P0" | "P1" | "P2" | "P3";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

/** Lightweight attachment metadata (blobs still local IndexedDB until R2 phase 2). */
export type GyshTaskAttachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  storedId: string;
  r2Key?: string | null;
  addedAt: string;
};

/** T/E operational taxonomy for GYSH task backlog. */
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

export type GyshTask = {
  id: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assignBy: string;
  assignedTo: "Tina" | "Evelyn" | "Lyriq" | "Both";
  dateAssigned: string;
  dueDate: string;
  dateCompleted: string;
  notes: string;
  /** Sprint index (0+ or -1 backlog). Default Sprint 0. */
  sprint: number;
  /** Partner completion — Both tasks need both true before status can be Done. */
  tinaDone: boolean;
  evelynDone: boolean;
  attachments: GyshTaskAttachment[];
};

export const ACCEPT_ATTACHMENTS =
  "image/*,application/pdf,.doc,.docx,video/mp4,video/webm,video/quicktime,.txt,.csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv";

const DOC_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
  if (/\.(pdf|doc|docx|txt|csv)$/i.test(name)) return true;
  return false;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mapTask(t: GyshTask): GyshTask {
  return {
    ...t,
    category: normalizeCategory(t.category),
    sprint: typeof t.sprint === "number" ? t.sprint : Number((t as { sprint?: unknown }).sprint ?? 0) || 0,
    tinaDone: Boolean(t.tinaDone),
    evelynDone: Boolean(t.evelynDone),
    attachments: Array.isArray(t.attachments) ? t.attachments : [],
  };
}

/**
 * For Both-assigned tasks: overall Done only when T + E have each marked done.
 * Single-assignee tasks: that partner's flag mirrors overall status.
 */
export function applyPartnerDone(task: GyshTask, patch: Partial<GyshTask> = {}): GyshTask {
  const next: GyshTask = { ...task, ...patch, attachments: patch.attachments ?? task.attachments };

  if (next.assignedTo === "Tina") {
    if (patch.status === "done") next.tinaDone = true;
    if (patch.status && patch.status !== "done") next.tinaDone = false;
    if (patch.tinaDone === true) next.status = "done";
    if (patch.tinaDone === false && next.status === "done") next.status = "in_progress";
    next.evelynDone = false;
  } else if (next.assignedTo === "Evelyn") {
    if (patch.status === "done") next.evelynDone = true;
    if (patch.status && patch.status !== "done") next.evelynDone = false;
    if (patch.evelynDone === true) next.status = "done";
    if (patch.evelynDone === false && next.status === "done") next.status = "in_progress";
    next.tinaDone = false;
  } else if (next.assignedTo === "Lyriq") {
    // Single QA assignee — overall status is enough; clear partner flags.
    next.tinaDone = false;
    next.evelynDone = false;
  } else {
    // Both — cannot force Done via status alone until both partners are done.
    if (patch.status === "done" && !(next.tinaDone && next.evelynDone)) {
      next.status = next.tinaDone || next.evelynDone ? "in_progress" : "in_progress";
    }
    if (patch.status && patch.status !== "done") {
      // leaving done / choosing blocked etc. clears partner checks unless explicitly set
      if (patch.tinaDone === undefined && patch.evelynDone === undefined && patch.status !== "in_progress") {
        if (patch.status === "not_started" || patch.status === "blocked") {
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
  }

  if (next.status === "done") {
    if (!next.dateCompleted) next.dateCompleted = todayMMDDYY();
  } else {
    next.dateCompleted = "";
  }
  return next;
}

export function partnerDoneSummary(task: Pick<GyshTask, "assignedTo" | "tinaDone" | "evelynDone" | "status">): string {
  if (task.assignedTo === "Both") {
    const t = task.tinaDone ? "Tina✓" : "Tina○";
    const e = task.evelynDone ? "Evelyn✓" : "Evelyn○";
    return `${t} ${e}`;
  }
  if (task.assignedTo === "Tina") return task.tinaDone || task.status === "done" ? "Tina✓" : "Tina○";
  if (task.assignedTo === "Lyriq") return task.status === "done" ? "Lyriq✓" : "Lyriq○";
  return task.evelynDone || task.status === "done" ? "Evelyn✓" : "Evelyn○";
}

export async function fetchTasks(): Promise<GyshTask[]> {
  const data = await api<{ tasks: GyshTask[] }>("tasks");
  return (data.tasks ?? []).map(mapTask);
}

export async function persistTasks(tasks: GyshTask[]): Promise<GyshTask[]> {
  // Last-write wins per id — avoids UNIQUE constraint if duplicates slipped into client state.
  const byId = new Map<string, GyshTask>();
  for (const t of tasks) byId.set(t.id, mapTask(t));
  const unique = Array.from(byId.values());
  const data = await api<{ tasks: GyshTask[] }>("tasks", {
    method: "PUT",
    body: {
      tasks: unique.map((t) => ({ ...t, category: normalizeCategory(t.category) })),
    },
  });
  return (data.tasks ?? []).map(mapTask);
}

export function nextTaskId(tasks: GyshTask[]): string {
  const nums = tasks.map((t) => Number(t.id.replace(/\D/g, "")) || 0);
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

export type PartnerAssignee = "Tina" | "Evelyn" | "Lyriq";

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
  if (task.assignedTo === me) return true;
  if (me === "Lyriq") return false;
  return task.assignedTo === "Both";
}

export function dueAttentionTasks(
  tasks: GyshTask[],
  me: PartnerAssignee,
): { overdue: GyshTask[]; dueToday: GyshTask[] } {
  const today = startOfToday();
  const mine = tasks.filter((t) => taskMatchesAssignee(t, me) && t.status !== "done");
  const overdue = mine.filter((t) => isTaskOverdue(t, today)).sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
  const dueToday = mine
    .filter((t) => isTaskDueToday(t, today))
    .sort((a, b) => a.id.localeCompare(b.id));
  return { overdue, dueToday };
}

function hasGuideReviewTask(tasks: GyshTask[], guideId: string, name: string): boolean {
  const id = guideReviewTaskId(guideId);
  const desc = guideReviewDescription(name);
  const marker = guideReviewNotes(guideId);
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
    created.push({
      id: guideReviewTaskId(guide.id),
      description: guideReviewDescription(guide.name),
      category: "content",
      priority: "P1",
      status: "not_started",
      assignBy: "Auto-sync",
      assignedTo: "Both",
      dateAssigned: today,
      dueDate: "",
      dateCompleted: "",
      notes: guideReviewNotes(guide.id),
      sprint: 0,
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

export const SENIOR_PAGE_REVIEW_TASK_ID = "T-SENIOR-PAGE";
export const SENIOR_PAGE_REVIEW_DESC = "Review Senior Side Hustles page & verbiage";
export const SENIOR_PAGE_REVIEW_NOTES = "page-review:senior-side-hustles";

function hasSeniorPageReviewTask(tasks: GyshTask[]): boolean {
  return tasks.some(
    (t) =>
      t.id === SENIOR_PAGE_REVIEW_TASK_ID ||
      t.description === SENIOR_PAGE_REVIEW_DESC ||
      t.notes.includes(SENIOR_PAGE_REVIEW_NOTES),
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
  const created: GyshTask[] = [
    {
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
    },
  ];
  return { tasks: [...existing, ...created], created };
}

/**
 * Fetch tasks, ensure guide-review + senior page review items exist, persist if any were created.
 * Prefer calling from AdminPortal and TaskList mount.
 */
export async function syncGuideReviewTasks(): Promise<{
  tasks: GyshTask[];
  createdCount: number;
}> {
  const existing = await fetchTasks();
  const guide = ensureGuideReviewTasks(existing);
  const senior = ensureSeniorPageReviewTask(guide.tasks);
  const created = [...guide.created, ...senior.created];
  if (created.length === 0) {
    return { tasks: senior.tasks, createdCount: 0 };
  }
  const saved = await persistTasks(senior.tasks);
  return { tasks: saved, createdCount: created.length };
}
