// ============================================================================
// THE MEDICARE OPTIMIZER — TASK SHEET
// ----------------------------------------------------------------------------
// Spreadsheet-style task tracker modeled after the Rassavong Realty Master
// Task Tracker. Tasks are persisted to localStorage (key TASKS_STORAGE_KEY)
// so edits survive reloads without a backend round-trip. Seeded from
// SEED_TASK_ROWS below — add new ones as the project grows.
// ============================================================================

import { TASKS, SPRINTS, ACTIVE_SPRINT_ID, type Priority } from "@/lib/test-plan";

export const TASK_STATUS_VALUES = ["not_started", "in_progress", "blocked", "done"] as const;
export type TaskRowStatus = (typeof TASK_STATUS_VALUES)[number];
export const TASK_STATUS_LABELS: Record<TaskRowStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

export const TASK_CATEGORY_VALUES = ["general", "qa", "engineering", "design", "ops", "compliance"] as const;
export type TaskRowCategory = (typeof TASK_CATEGORY_VALUES)[number];
export const TASK_CATEGORY_LABELS: Record<TaskRowCategory, string> = {
  general: "General",
  qa: "QA",
  engineering: "Engineering",
  design: "Design",
  ops: "Ops",
  compliance: "Compliance",
};

export interface TaskRow {
  id: string;
  description: string;
  sprintId: string;
  category: TaskRowCategory;
  priority: Priority;
  status: TaskRowStatus;
  assignBy: string;
  assignedTo: string;
  dateAssigned: string;   // MM/DD/YY
  dueDate: string;        // MM/DD/YY
  dateCompleted: string;  // MM/DD/YY or ""
  cost: number;
  notes: string;
  /** Optional link target for the page/item this task relates to. Route ("/admin") or external URL. */
  path?: string;
}

// Sprint 1 (active) bookends used to seed dates.
const ACTIVE = SPRINTS.find((s) => s.id === ACTIVE_SPRINT_ID) ?? SPRINTS[0];
const fmt = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
};
const START = fmt(ACTIVE.start);
const END = fmt(ACTIVE.end);

function statusFromTask(s: string): TaskRowStatus {
  if (s === "done") return "done";
  if (s === "in_progress") return "in_progress";
  if (s === "blocked") return "blocked";
  return "not_started";
}

function categoryFromArea(area: string): TaskRowCategory {
  const a = area.toLowerCase();
  if (a.includes("qa") || a.includes("test")) return "qa";
  if (a.includes("cms") || a.includes("compliance")) return "compliance";
  if (a.includes("agent") || a.includes("soa") || a.includes("admin")) return "ops";
  if (a.includes("scorecard") || a.includes("design")) return "design";
  return "engineering";
}

// Seed: bring in every TASK from test-plan, augmented with sprint, owner, cost.
// NOTE: New functionality should be added as a TEST CASE in src/lib/test-plan.ts
// (TEST_CASES / SPRINTS items, type "test"), NOT as a task here. The Task Sheet
// is reserved for non-test operational work (ops, design, compliance, etc.).
// QA / test items are filtered out below so they live only on /testing.
const OWNERS = ["Catria", "Evelyn", "Dev", "Dev", "Catria"]; // Catria-heavy
export const SEED_TASK_ROWS: TaskRow[] = TASKS
  .map((t, i) => ({
  id: t.id,
  description: t.title,
  sprintId: ACTIVE_SPRINT_ID,
  category: categoryFromArea(t.area),
  priority: t.priority,
  status: statusFromTask(t.status),
  assignBy: "Evelyn",
  assignedTo: OWNERS[i % OWNERS.length],
  dateAssigned: START,
  dueDate: END,
  dateCompleted: t.status === "done" ? START : "",
  cost: 0,
  notes: t.notes ?? "",
  path: "",
}))
  // Test / QA work belongs on /testing — keep the Task Sheet for ops/design/etc.
  .filter((r) => r.category !== "qa");

// Sprint 1 beta-go-live recruiting + onboarding tasks (richer than TASKS).
SEED_TASK_ROWS.push(
  {
    id: "T-100",
    description: "Catria recruits 10 beta agents (hand-picked) and collects NDA + Agent Agreement signatures",
    sprintId: ACTIVE_SPRINT_ID,
    category: "ops",
    priority: "P0",
    status: "in_progress",
    assignBy: "Evelyn",
    assignedTo: "Catria",
    dateAssigned: START,
    dueDate: END,
    dateCompleted: "",
    cost: 0,
    notes: "Each agent must sign NDA + contract before being granted /agent access. Tracks in admin → users.",
    path: "/admin",
  },
  {
    id: "T-101",
    description: "Execute Sprint 1 test plan — Catria 70%, Me 30%",
    sprintId: ACTIVE_SPRINT_ID,
    category: "qa",
    priority: "P0",
    status: "in_progress",
    assignBy: "Evelyn",
    assignedTo: "Catria",
    dateAssigned: START,
    dueDate: END,
    dateCompleted: "",
    cost: 0,
    notes: "Status persisted on /testing — mirror Pass/Fail/Blocked here in notes for the daily standup.",
    path: "/testing",
  },
  {
    id: "T-102",
    description: "Triage P0/P1 beta defects and re-run failed tests within 24h",
    sprintId: ACTIVE_SPRINT_ID,
    category: "engineering",
    priority: "P1",
    status: "not_started",
    assignBy: "Catria",
    assignedTo: "Evelyn",
    dateAssigned: START,
    dueDate: END,
    dateCompleted: "",
    cost: 0,
    notes: "",
    path: "/testing",
  },
  {
    id: "T-103",
    description: "Set up Google Search Console",
    sprintId: ACTIVE_SPRINT_ID,
    category: "ops",
    priority: "P1",
    status: "in_progress",
    assignBy: "Evelyn",
    assignedTo: "Evelyn",
    dateAssigned: START,
    dueDate: END,
    dateCompleted: "",
    cost: 0,
    notes: "Verify site ownership via META tag, submit sitemap.xml and sitemap-internal.xml, and monitor indexing coverage.",
    path: "",
  },
);

export const TASKS_STORAGE_KEY = "tasks-sheet:v1";

export function loadTaskRows(): TaskRow[] {
  if (typeof window === "undefined") return SEED_TASK_ROWS;
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return SEED_TASK_ROWS;
    const parsed = JSON.parse(raw) as TaskRow[];
    if (!Array.isArray(parsed)) return SEED_TASK_ROWS;
    return parsed;
  } catch {
    return SEED_TASK_ROWS;
  }
}

export function saveTaskRows(rows: TaskRow[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(rows));
}

export function resetTaskRows(): TaskRow[] {
  if (typeof window !== "undefined") localStorage.removeItem(TASKS_STORAGE_KEY);
  return SEED_TASK_ROWS;
}

export function nextTaskId(rows: TaskRow[]): string {
  const nums = rows
    .map((r) => Number(r.id.replace(/[^0-9]/g, "")))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `T-${String(next).padStart(3, "0")}`;
}

export function todayMMDDYY(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}