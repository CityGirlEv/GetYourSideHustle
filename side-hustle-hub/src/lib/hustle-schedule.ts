/**
 * Member Hustle Schedule Suite — Pro & Above multi-schedule plans by family member + hustle.
 * Start date drives / shifts the weekly plan blocks.
 */
import { SCHEDULE_SUITE_FEATURE_IDS, tierHasFeature, type TierId } from "./membership";
import { normalizeTierId } from "./member-credits";
import type { BlueprintAgeGroup } from "./gysh-analytics";
import { blueprintMatchLabel } from "./blueprint-match-labels";
import {
  emptyPnLLedger,
  normalizePnLLedger,
  sumPnLExpenses,
  sumPnLSales,
  type SchedulePnLLedger,
} from "./hustle-schedule-pnl";
import {
  guideStepBlockId,
  isGuideStepBlockId,
  minutesForGuideStep,
  playbookStepsForSchedule,
  type ScheduleGuideStep,
  guideStepIndexFromBlockId,
  launchGuideStepProgressKey,
} from "./schedule-guide-plan";

export const HUSTLE_SCHEDULE_PROGRESS_KIND = "hustle_schedule" as const;

/** Logged-in member (“self”) or a family child profile id. */
export type ScheduleOwnerId = "self" | string;

/** Weekday ids (legacy weekly template) or `gs-1`… Launch Guide step ids. */
export type ScheduleBlockId = string;

/** Day-block workflow status in Schedule Suite tracker. */
export type ScheduleBlockStatus =
  | "not_started"
  | "in_progress"
  | "done"
  | "blocked";

export const SCHEDULE_BLOCK_STATUS_OPTIONS: {
  id: ScheduleBlockStatus;
  label: string;
}[] = [
  { id: "not_started", label: "Not Started" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
  { id: "blocked", label: "Blocked" },
];

export function scheduleBlockStatusLabel(status: ScheduleBlockStatus): string {
  return (
    SCHEDULE_BLOCK_STATUS_OPTIONS.find((o) => o.id === status)?.label ?? "Not Started"
  );
}

/** Checkbox checked → Done; unchecked → Not Started. */
export function scheduleStatusFromCheckboxChecked(
  checked: boolean,
): ScheduleBlockStatus {
  return checked ? "done" : "not_started";
}

export function isScheduleBlockComplete(
  block: Pick<ScheduleBlock, "status" | "done">,
): boolean {
  return block.status === "done" || (block.status == null && Boolean(block.done));
}

/** Normalize stored/legacy status; `done: true` migrates to Done. */
export function normalizeScheduleBlockStatus(
  raw: unknown,
  doneFallback?: boolean,
): ScheduleBlockStatus {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (v === "not_started" || v === "in_progress" || v === "done" || v === "blocked") {
    return v;
  }
  if (doneFallback) return "done";
  return "not_started";
}

export type ScheduleBlock = {
  id: ScheduleBlockId;
  dayLabel: string;
  focus: string;
  minutes: number;
  status: ScheduleBlockStatus;
  /** Derived from status === "done"; kept for remotes / email payload compat. */
  done: boolean;
  hoursLogged: number;
  /** Per-block due date (YYYY-MM-DD), derived from plan due date. */
  dueDate: string;
  /** Optional day notes on Plan tracker (dropdown textarea). */
  notes?: string;
};

export type ScheduleReminderCadence =
  | "none"
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly";

export const SCHEDULE_REMINDER_CADENCE_OPTIONS: {
  id: ScheduleReminderCadence;
  label: string;
}[] = [
  { id: "none", label: "No email reminders" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Bi-weekly" },
  { id: "monthly", label: "Monthly" },
];

export type ScheduleBlueprintGoals = {
  /** Marketing plan for this hustle / blueprint week. */
  marketingPlan: string;
  /** Target sales for the current week (USD). */
  targetSalesUsd: number;
  /** Actual sales logged for the current week (USD) — also P&L Sales. */
  actualSalesUsd: number;
  /** Expenses for P&L (USD). */
  expensesUsd: number;
};

export type ScheduleGradeLetter = "A" | "B" | "C" | "D" | "F";

/** Display mark with pluses (B+ / A+ thresholds for celebrations). */
export type ScheduleGradeMark =
  | "A+"
  | "A"
  | "B+"
  | "B"
  | "C+"
  | "C"
  | "D"
  | "F";

export type ScheduleGradeCelebration = "none" | "congrats" | "a_pop";

export type ScheduleWeekGrade = {
  letter: ScheduleGradeLetter;
  /** Letter with +/- (e.g. B+, A). */
  mark: ScheduleGradeMark;
  score: number;
  summary: string;
  /** Funny + motivating one-liner for the grade. */
  pepTalk: string;
  /** Congrats stream for B+; bigger pop for A / A+. */
  celebration: ScheduleGradeCelebration;
  breakdown: {
    completionPct: number;
    hoursPct: number;
    salesPct: number;
    roundupPct: number;
  };
};

export type ScheduleActionItem = {
  id: string;
  text: string;
  /** ISO timestamp when the item was added. */
  createdAt: string;
};

export type ScheduleWeekRoundup = {
  weekStart: string;
  killedIt: string;
  needsImprovement: string;
  /**
   * Legacy free-text blob (newline-separated). Kept in sync with {@link actionItemEntries}
   * for older saves and grade fill checks.
   */
  actionItems: string;
  /** Dated action-item list for the upcoming week. */
  actionItemEntries: ScheduleActionItem[];
  grade: ScheduleWeekGrade | null;
  gradedAt: string | null;
};

export type HustleSchedulePlan = {
  id: string;
  ownerId: ScheduleOwnerId;
  ownerLabel: string;
  hustleId: string;
  hustleLabel: string;
  ageGroup: BlueprintAgeGroup;
  blueprintId: string | null;
  /** Target completion date — derived from start date + last block. */
  dueDate: string;
  /** First day of the weekly plan. Editing this shifts every block due date. */
  weekStart: string;
  blocks: ScheduleBlock[];
  /** Blueprint execution plan: marketing + sales targets. */
  blueprintGoals: ScheduleBlueprintGoals;
  /** Profit & Loss ledger (dated sales/expense lines) — Elite. */
  pnl: SchedulePnLLedger;
  /** Weekly roundups keyed by weekStart (Monday). */
  roundups: ScheduleWeekRoundup[];
  /** @deprecated Prefer reminderCadence */
  emailReminders?: boolean;
  /** Task reminder emails: daily / weekly / bi-weekly / monthly. */
  reminderCadence: ScheduleReminderCadence;
  updatedAt: string;
};

export type HustleScheduleStore = {
  version: 3;
  schedules: HustleSchedulePlan[];
  /** Soft-deleted plans — can be restored. */
  deleted: DeletedHustleSchedule[];
  activeScheduleId: string | null;
  updatedAt: string;
};

export type DeletedHustleSchedule = HustleSchedulePlan & {
  deletedAt: string;
};

export const SCHEDULE_DELETE_WARNING =
  "Delete this Schedule Suite? It will be moved to Deleted schedules where you can restore it later.";


export type HustleOption = {
  hustleId: string;
  hustleLabel: string;
  ageGroup: BlueprintAgeGroup;
  blueprintId: string;
};

export type FamilyMemberOption = {
  id: ScheduleOwnerId;
  label: string;
  ageBand?: "kids" | "junior";
};

const DAY_ORDER: { id: ScheduleBlockId; dayLabel: string }[] = [
  { id: "mon", dayLabel: "Mon" },
  { id: "tue", dayLabel: "Tue" },
  { id: "wed", dayLabel: "Wed" },
  { id: "thu", dayLabel: "Thu" },
  { id: "fri", dayLabel: "Fri" },
  { id: "sat", dayLabel: "Sat" },
  { id: "sun", dayLabel: "Sun" },
];

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const DEFAULT_FOCI = [
  "Research & niche check",
  "Setup / tooling",
  "Build or list",
  "Outreach / marketing",
  "Deliver or fulfill",
  "Review numbers",
  "Rest & plan next week",
];

/** My Dashboard → Schedule Suite (hash opens the Schedule Suite tab). */
export const SCHEDULE_SUITE_DASHBOARD_HREF = "/my-dashboard#schedule";

export function isScheduleSuiteDashboardHash(hash: string): boolean {
  return String(hash || "").replace(/^#/, "").toLowerCase() === "schedule";
}

/** True when membership unlocks the schedule suite (Pro/Elite), or caller is an admin. */
export function canAccessScheduleSuite(
  tier: string | null | undefined,
  opts?: { isAdmin?: boolean },
): boolean {
  if (opts?.isAdmin) return true;
  const id = normalizeTierId(tier);
  return SCHEDULE_SUITE_FEATURE_IDS.some((fid) => tierHasFeature(id, fid));
}

/** P&L calculator is an Elite Schedule Suite feature — not Free, Starter, or Pro. */
export function canAccessPnl(
  tier: string | null | undefined,
  opts?: { isAdmin?: boolean },
): boolean {
  if (opts?.isAdmin) return true;
  return tierHasFeature(normalizeTierId(tier), "pnl");
}

export function normalizeReminderCadence(raw: unknown): ScheduleReminderCadence {
  const v = String(raw || "").toLowerCase();
  if (v === "daily" || v === "weekly" || v === "biweekly" || v === "monthly") return v;
  if (v === "bi-weekly" || v === "bi_weekly") return "biweekly";
  return "none";
}

export function cadenceFromLegacyEmailFlag(emailReminders: unknown): ScheduleReminderCadence {
  return emailReminders ? "weekly" : "none";
}

/** ISO week number (UTC) for period keys. */
export function isoWeekKey(ref: Date = new Date()): string {
  const dailyKey = ref.toISOString().slice(0, 10);
  const d = new Date(`${dailyKey}T12:00:00Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function reminderPeriodKey(
  cadence: ScheduleReminderCadence,
  ref: Date = new Date(),
): string | null {
  if (cadence === "none") return null;
  const dailyKey = ref.toISOString().slice(0, 10);
  if (cadence === "daily") return dailyKey;
  if (cadence === "monthly") return dailyKey.slice(0, 7);
  const weekKey = isoWeekKey(ref);
  if (cadence === "weekly") return weekKey;
  const m = /^(\d{4})-W(\d{2})$/.exec(weekKey);
  if (!m) return weekKey;
  const year = m[1]!;
  const week = Number(m[2]);
  const fort = Math.ceil(week / 2);
  return `${year}-F${String(fort).padStart(2, "0")}`;
}

/** Whether today's cron run should send for this cadence. */
export function shouldSendReminderToday(
  cadence: ScheduleReminderCadence,
  ref: Date = new Date(),
): boolean {
  if (cadence === "none") return false;
  if (cadence === "daily") return true;
  const utcDay = new Date(`${ref.toISOString().slice(0, 10)}T12:00:00Z`).getUTCDay();
  if (cadence === "weekly") return utcDay === 1;
  if (cadence === "biweekly") {
    if (utcDay !== 1) return false;
    const weekKey = isoWeekKey(ref);
    const m = /^(\d{4})-W(\d{2})$/.exec(weekKey);
    const week = m ? Number(m[2]) : 0;
    return week % 2 === 1;
  }
  if (cadence === "monthly") {
    return ref.toISOString().slice(8, 10) === "01";
  }
  return false;
}

/** Schedule Suite sub-views (Blueprint, Plan tracker, Roundup, P&L, Progress). */
export type ScheduleSuiteView =
  | "tracker"
  | "blueprint"
  | "pnl"
  | "roundup"
  | "progress";

export const SCHEDULE_SUITE_VIEW_TABS: { id: ScheduleSuiteView; label: string }[] = [
  { id: "blueprint", label: "Blueprint plan" },
  { id: "tracker", label: "Plan tracker" },
  { id: "roundup", label: "Weekly roundup" },
  { id: "pnl", label: "P&L calculator" },
  { id: "progress", label: "Progress" },
];

/** Tabs a member may open. P&L stays hidden unless the Elite pnl feature is on. */
export function scheduleSuiteTabsForAccess(opts: {
  pnlUnlocked: boolean;
}): { id: ScheduleSuiteView; label: string }[] {
  return SCHEDULE_SUITE_VIEW_TABS.filter((tab) => {
    if (tab.id === "pnl") return opts.pnlUnlocked;
    return true;
  });
}

/** Opening a schedule lands on the first tab (Blueprint plan). */
export const SCHEDULE_SUITE_DEFAULT_VIEW: ScheduleSuiteView = "blueprint";

/** DOM id / anchor for the Email reminders block (Email Me link target). */
export const SCHEDULE_EMAIL_SECTION_ID = "schedule-email-section";

/**
 * Grade me lives in the stats bar on every Schedule Suite tab, including
 * Weekly Roundup, so the letter can show in that same button everywhere.
 */
export function scheduleStatsBarShowsGradeMe(_suiteView: ScheduleSuiteView): boolean {
  return true;
}

/** Grade me stays on the tab you clicked from; the button shows the letter. */
export function suiteViewAfterGradeMe(current: ScheduleSuiteView): ScheduleSuiteView {
  return current;
}

export function scheduleGradeMeButtonLabel(
  grade:
    | {
        mark?: ScheduleGradeMark | null;
        letter: ScheduleGradeLetter;
        score: number;
      }
    | null
    | undefined,
): string {
  if (!grade) return "Grade me";
  const mark = grade.mark ?? grade.letter;
  return `Current Grade: ${mark} (${grade.score}%)`;
}

/**
 * After Grade me has run once, show a live grade from current day blocks so
 * Plan tracker clicks update Current Grade without clicking Grade me again.
 */
export function liveScheduleWeekGrade(
  plan: HustleSchedulePlan,
  storedGrade: ScheduleWeekGrade | null | undefined,
): ScheduleWeekGrade | null {
  if (!storedGrade) return null;
  return gradeScheduleWeek(plan);
}

/** Keep a stored week grade in sync after Plan tracker Done / status clicks. */
export function withRefreshedWeekGrade(plan: HustleSchedulePlan): HustleSchedulePlan {
  if (!getWeekRoundup(plan).grade) return plan;
  return applyScheduleWeekGrade(plan, plan.weekStart);
}

export function scheduleSuiteLockedReason(tier: TierId): string {
  if (tier === "free" || tier === "starter") {
    return "Schedule Suite unlocks on Pro or higher (Pro and Elite). Upgrade to plan weekly work for each family member’s hustle.";
  }
  return "Schedule Suite is included with Pro or higher.";
}

export function schedulePlanId(ownerId: ScheduleOwnerId, hustleId: string): string {
  return `${ownerId}::${hustleId}`;
}

/** Unique id so the same member + hustle can have more than one schedule (e.g. a new week). */
export function distinctSchedulePlanId(
  ownerId: ScheduleOwnerId,
  hustleId: string,
  ref: Date = new Date(),
): string {
  return `${schedulePlanId(ownerId, hustleId)}::${ref.getTime().toString(36)}`;
}

export function schedulesForOwnerHustle(
  store: Pick<HustleScheduleStore, "schedules">,
  ownerId: ScheduleOwnerId,
  hustleId: string,
): HustleSchedulePlan[] {
  return store.schedules.filter((s) => s.ownerId === ownerId && s.hustleId === hustleId);
}

export function weekStartMonday(ref: Date = new Date()): string {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatYmd(d);
}

export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function parseYmd(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y!, m! - 1, d!);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

export function addDaysYmd(ymd: string, days: number): string {
  const d = parseYmd(ymd);
  if (!d) return ymd;
  d.setDate(d.getDate() + days);
  return formatYmd(d);
}

export function daysBetweenYmd(fromYmd: string, toYmd: string): number {
  const a = parseYmd(fromYmd);
  const b = parseYmd(toYmd);
  if (!a || !b) return 0;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86_400_000);
}

export function weekdayShortLabel(ymd: string): string {
  const d = parseYmd(ymd);
  if (!d) return "";
  return WEEKDAY_SHORT[d.getDay()] ?? "";
}

/** Default start date: Monday of the current week. */
export function defaultStartDate(ref: Date = new Date()): string {
  return weekStartMonday(ref);
}

/** Default due date: Sunday of the current week (end of week). */
export function defaultDueDate(ref: Date = new Date()): string {
  return addDaysYmd(defaultStartDate(ref), 6);
}

function isWeekendYmd(ymd: string): boolean {
  const d = parseYmd(ymd);
  if (!d) return false;
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Next Mon–Fri on or after ymd (Launch Guide steps skip weekends). */
export function nextScheduleWorkday(ymd: string): string {
  let cur = ymd;
  for (let i = 0; i < 14; i++) {
    if (!isWeekendYmd(cur)) return cur;
    cur = addDaysYmd(cur, 1);
  }
  return ymd;
}

function hydrateBlockFromPrev(
  def: ScheduleBlock,
  prev?: ScheduleBlock,
): ScheduleBlock {
  const status = normalizeScheduleBlockStatus(prev?.status, prev?.done);
  const minutes = prev?.minutes ?? def.minutes;
  const defaultHours = Math.round((minutes / 60) * 10) / 10;
  return {
    ...def,
    focus: isGuideStepBlockId(def.id) ? def.focus : prev?.focus?.trim() ? prev.focus : def.focus,
    minutes,
    status,
    done: status === "done",
    hoursLogged:
      prev?.hoursLogged != null && prev.hoursLogged > 0 ? prev.hoursLogged : defaultHours,
    notes: typeof prev?.notes === "string" ? prev.notes : def.notes ?? "",
  };
}

/**
 * One Plan tracker row per Launch Guide step, one step per weekday (skip Sat/Sun).
 */
export function promoteGuideStepBlocks(
  steps: ScheduleGuideStep[],
  startDateYmd: string,
  prevBlocks?: ScheduleBlock[],
): { weekStart: string; blocks: ScheduleBlock[]; dueDate: string } {
  const start = parseYmd(startDateYmd) ?? parseYmd(defaultStartDate())!;
  const startYmd = formatYmd(start);
  const prevById = new Map((prevBlocks ?? []).map((b) => [b.id, b]));
  let cursor = nextScheduleWorkday(startYmd);
  const blocks = steps.map((step, i) => {
    const dueDate = cursor;
    cursor = nextScheduleWorkday(addDaysYmd(cursor, 1));
    const n = i + 1;
    const id = guideStepBlockId(n);
    const isLast = i === steps.length - 1;
    const minutes = minutesForGuideStep(step.title, isLast);
    const def: ScheduleBlock = {
      id,
      dayLabel: `Step ${n} · ${weekdayShortLabel(dueDate) || "Day"}`,
      focus: step.title,
      minutes,
      status: "not_started",
      done: false,
      hoursLogged: Math.round((minutes / 60) * 10) / 10,
      dueDate,
      notes: "",
    };
    return hydrateBlockFromPrev(def, prevById.get(id));
  });
  const weekStart = blocks[0]?.dueDate ?? startYmd;
  const dueDate = blocks[blocks.length - 1]?.dueDate ?? weekStart;
  return { weekStart, blocks, dueDate };
}

/** Map saved weekday / stale rows onto current Launch Guide Steps-tab order. */
export function previousBlocksForGuideAlign(
  stored: ScheduleBlock[] | undefined,
  steps: ScheduleGuideStep[],
): ScheduleBlock[] {
  if (!stored?.length || !steps.length) return [];
  const byId = new Map(stored.map((b) => [b.id, b]));
  const byTitle = new Map<string, ScheduleBlock>();
  for (const b of stored) {
    const k = b.focus.trim().toLowerCase();
    if (k && !byTitle.has(k)) byTitle.set(k, b);
  }
  return steps.map((step, i) => {
    const id = guideStepBlockId(i + 1);
    const prev =
      byId.get(id) ?? byTitle.get(step.title.trim().toLowerCase()) ?? stored[i];
    return prev ? { ...prev, id } : undefined;
  }).filter((b): b is ScheduleBlock => Boolean(b));
}

/**
 * Keep Plan tracker rows in lockstep with the Launch Guide Steps tab
 * (count, order, titles). Status, hours, and notes carry over.
 */
export function alignSchedulePlanWithGuideSteps(
  plan: HustleSchedulePlan,
  steps: ScheduleGuideStep[] = playbookStepsForSchedule(plan.hustleId),
): HustleSchedulePlan {
  if (!steps.length) return plan;
  const ids = steps.map((_, i) => guideStepBlockId(i + 1));
  const sameShape =
    plan.blocks.length === steps.length && plan.blocks.every((b, i) => b.id === ids[i]);
  if (sameShape) {
    let changed = false;
    const blocks = plan.blocks.map((b, i) => {
      const title = steps[i]!.title;
      const dayLabel = `Step ${i + 1} · ${weekdayShortLabel(b.dueDate) || "Day"}`;
      if (b.focus === title && b.dayLabel === dayLabel) return b;
      changed = true;
      return { ...b, focus: title, dayLabel };
    });
    return changed ? { ...plan, blocks } : plan;
  }
  const start = plan.weekStart || plan.blocks[0]?.dueDate || defaultStartDate();
  const promoted = promoteGuideStepBlocks(
    steps,
    start,
    previousBlocksForGuideAlign(plan.blocks, steps),
  );
  return {
    ...plan,
    weekStart: promoted.weekStart,
    dueDate: promoted.dueDate,
    blocks: promoted.blocks,
  };
}

/** Apply Launch Guide Steps-tab checks onto matching `gs-N` Plan tracker rows. */
export function applyLaunchGuideChecksToPlan(
  plan: HustleSchedulePlan,
  completed: Record<string, boolean> | null | undefined,
): HustleSchedulePlan {
  if (!completed || typeof completed !== "object") return plan;
  let changed = false;
  const blocks = plan.blocks.map((b) => {
    const idx = guideStepIndexFromBlockId(b.id);
    if (idx == null) return b;
    const key = launchGuideStepProgressKey(plan.hustleId, idx);
    if (!Object.prototype.hasOwnProperty.call(completed, key)) return b;
    const checked = Boolean(completed[key]);
    const isDone = isScheduleBlockComplete(b);
    if (checked === isDone) return b;
    changed = true;
    if (checked) return { ...b, status: "done" as const, done: true };
    if (b.status === "blocked" || b.status === "in_progress") return b;
    return { ...b, status: "not_started" as const, done: false };
  });
  return changed ? { ...plan, blocks } : plan;
}

export function applyLaunchGuideChecksToStore(
  store: HustleScheduleStore,
  completed: Record<string, boolean> | null | undefined,
): HustleScheduleStore {
  if (!completed || typeof completed !== "object") return store;
  let changed = false;
  const schedules = store.schedules.map((plan) => {
    const next = applyLaunchGuideChecksToPlan(plan, completed);
    if (next !== plan) changed = true;
    return next;
  });
  return changed ? { ...store, schedules } : store;
}

/** Write a Plan tracker check back onto the Launch Guide Steps-tab progress map. */
export function mergePlanCheckIntoLaunchGuideProgress(
  completed: Record<string, boolean>,
  hustleId: string,
  blockId: string,
  checked: boolean,
): Record<string, boolean> {
  const idx = guideStepIndexFromBlockId(blockId);
  if (idx == null) return completed;
  const key = launchGuideStepProgressKey(hustleId, idx);
  if (Boolean(completed[key]) === checked) return completed;
  return { ...completed, [key]: checked };
}

function buildWeekBlocks(
  hustleLabel: string,
  startYmd: string,
  prevBlocks?: ScheduleBlock[],
): ScheduleBlock[] {
  const start = parseYmd(startYmd) ?? parseYmd(defaultStartDate())!;
  const prevById = new Map((prevBlocks ?? []).map((b) => [b.id, b]));
  return DAY_ORDER.map((d, i) => {
    const blockDue = formatYmd(
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
    );
    const prev = prevById.get(d.id);
    const status = normalizeScheduleBlockStatus(prev?.status, prev?.done);
    const minutes = prev?.minutes ?? (i === 6 ? 30 : 60);
    const defaultHours = Math.round((minutes / 60) * 10) / 10;
    return {
      id: d.id,
      dayLabel: weekdayShortLabel(blockDue) || d.dayLabel,
      focus: prev?.focus?.trim()
        ? prev.focus
        : `${DEFAULT_FOCI[i] ?? "Hustle work"} · ${hustleLabel}`,
      minutes,
      status,
      done: status === "done",
      hoursLogged: prev?.hoursLogged != null && prev.hoursLogged > 0 ? prev.hoursLogged : defaultHours,
      dueDate: blockDue,
      notes: typeof prev?.notes === "string" ? prev.notes : "",
    };
  });
}

/**
 * Promote a plan from a start date: day 1 is that date, then six more days.
 * Block ids stay positional (mon = first day) so Done / hours carry over.
 */
export function promoteBlocksFromStartDate(
  hustleLabel: string,
  startDateYmd: string,
  prevBlocks?: ScheduleBlock[],
): { weekStart: string; blocks: ScheduleBlock[]; dueDate: string } {
  const start = parseYmd(startDateYmd) ?? parseYmd(defaultStartDate())!;
  const weekStart = formatYmd(start);
  const blocks = buildWeekBlocks(hustleLabel, weekStart, prevBlocks);
  return { weekStart, blocks, dueDate: blocks[blocks.length - 1]?.dueDate ?? addDaysYmd(weekStart, 6) };
}

/**
 * Promote a plan from a due date: week ends on (or contains) the due date,
 * and each weekday block gets its own due date Mon→Sun.
 */
export function promoteBlocksFromDueDate(
  hustleLabel: string,
  dueDateYmd: string,
  prevBlocks?: ScheduleBlock[],
): { weekStart: string; blocks: ScheduleBlock[]; dueDate: string } {
  const due = parseYmd(dueDateYmd) ?? parseYmd(defaultDueDate())!;
  const dueYmd = formatYmd(due);
  const promoted = promoteBlocksFromStartDate(hustleLabel, weekStartMonday(due), prevBlocks);
  return { ...promoted, dueDate: dueYmd };
}

export function emptyBlueprintGoals(hustleLabel = "this hustle"): ScheduleBlueprintGoals {
  return {
    marketingPlan: [
      `Audience: who buys ${hustleLabel}?`,
      "Channels: social, referrals, local boards, email",
      "Offer: one clear offer + price point",
      "This week: 3 outreach actions + 1 content post",
    ].join("\n"),
    targetSalesUsd: 0,
    actualSalesUsd: 0,
    expensesUsd: 0,
  };
}

export function emptyWeekRoundup(weekStart: string): ScheduleWeekRoundup {
  return {
    weekStart,
    killedIt: "",
    needsImprovement: "",
    actionItems: "",
    actionItemEntries: [],
    grade: null,
    gradedAt: null,
  };
}

export function newScheduleActionItemId(ref: Date = new Date()): string {
  return `ai-${ref.getTime().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Display stamp for action items (local, readable). */
export function formatScheduleActionItemStamp(iso: string): string {
  const raw = String(iso || "").trim();
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function syncActionItemsText(entries: ScheduleActionItem[]): string {
  return entries
    .map((e) => e.text.trim())
    .filter(Boolean)
    .join("\n");
}

export function normalizeActionItemEntries(
  raw: unknown,
  legacyText: string,
): ScheduleActionItem[] {
  if (Array.isArray(raw)) {
    const fromArray: ScheduleActionItem[] = [];
    for (const row of raw) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const text = typeof o.text === "string" ? o.text.trim() : "";
      if (!text) continue;
      const id =
        typeof o.id === "string" && o.id.trim()
          ? o.id.trim()
          : newScheduleActionItemId();
      const createdAt =
        typeof o.createdAt === "string" && o.createdAt.trim() ? o.createdAt.trim() : "";
      fromArray.push({ id, text, createdAt });
    }
    return fromArray;
  }
  const lines = String(legacyText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((text, i) => ({
    id: `legacy-${i}-${text.slice(0, 12).replace(/\W+/g, "").toLowerCase() || "item"}`,
    text,
    createdAt: "",
  }));
}

export function addScheduleActionItem(
  roundup: ScheduleWeekRoundup,
  text: string,
  ref: Date = new Date(),
): ScheduleWeekRoundup {
  const trimmed = String(text || "").trim();
  if (!trimmed) return roundup;
  const entry: ScheduleActionItem = {
    id: newScheduleActionItemId(ref),
    text: trimmed,
    createdAt: ref.toISOString(),
  };
  const actionItemEntries = [...(roundup.actionItemEntries ?? []), entry];
  return {
    ...roundup,
    actionItemEntries,
    actionItems: syncActionItemsText(actionItemEntries),
  };
}

export function removeScheduleActionItem(
  roundup: ScheduleWeekRoundup,
  id: string,
): ScheduleWeekRoundup {
  const actionItemEntries = (roundup.actionItemEntries ?? []).filter((e) => e.id !== id);
  return {
    ...roundup,
    actionItemEntries,
    actionItems: syncActionItemsText(actionItemEntries),
  };
}

export function roundupHasActionItems(roundup: ScheduleWeekRoundup): boolean {
  if ((roundup.actionItemEntries ?? []).some((e) => e.text.trim())) return true;
  return Boolean(String(roundup.actionItems || "").trim());
}

export function normalizeBlueprintGoals(raw: unknown, hustleLabel?: string): ScheduleBlueprintGoals {
  const base = emptyBlueprintGoals(hustleLabel);
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const target =
    typeof o.targetSalesUsd === "number" && Number.isFinite(o.targetSalesUsd)
      ? Math.max(0, Math.round(o.targetSalesUsd * 100) / 100)
      : base.targetSalesUsd;
  const actual =
    typeof o.actualSalesUsd === "number" && Number.isFinite(o.actualSalesUsd)
      ? Math.max(0, Math.round(o.actualSalesUsd * 100) / 100)
      : base.actualSalesUsd;
  const expenses =
    typeof o.expensesUsd === "number" && Number.isFinite(o.expensesUsd)
      ? Math.max(0, Math.round(o.expensesUsd * 100) / 100)
      : base.expensesUsd;
  return {
    marketingPlan:
      typeof o.marketingPlan === "string" && o.marketingPlan.trim()
        ? o.marketingPlan
        : base.marketingPlan,
    targetSalesUsd: target,
    actualSalesUsd: actual,
    expensesUsd: expenses,
  };
}

export function normalizeWeekRoundup(raw: unknown, fallbackWeekStart: string): ScheduleWeekRoundup | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const weekStart =
    typeof o.weekStart === "string" && parseYmd(o.weekStart) ? o.weekStart : fallbackWeekStart;
  const gradeRaw = o.grade;
  let grade: ScheduleWeekGrade | null = null;
  if (gradeRaw && typeof gradeRaw === "object") {
    const g = gradeRaw as Record<string, unknown>;
    const letter = String(g.letter || "").toUpperCase();
    if (letter === "A" || letter === "B" || letter === "C" || letter === "D" || letter === "F") {
      const score = typeof g.score === "number" && Number.isFinite(g.score) ? g.score : 0;
      const clamped = Math.max(0, Math.min(100, Math.round(score)));
      const breakdown =
        g.breakdown && typeof g.breakdown === "object"
          ? (g.breakdown as ScheduleWeekGrade["breakdown"])
          : { completionPct: 0, hoursPct: 0, salesPct: 0, roundupPct: 0 };
      const mark = (() => {
        const rawMark = String(g.mark || "").toUpperCase();
        if (
          rawMark === "A+" ||
          rawMark === "A" ||
          rawMark === "B+" ||
          rawMark === "B" ||
          rawMark === "C+" ||
          rawMark === "C" ||
          rawMark === "D" ||
          rawMark === "F"
        ) {
          return rawMark as ScheduleGradeMark;
        }
        return gradeMarkFromScore(clamped);
      })();
      grade = {
        letter,
        mark,
        score: clamped,
        summary: typeof g.summary === "string" ? g.summary : "",
        pepTalk:
          typeof g.pepTalk === "string" && g.pepTalk.trim()
            ? g.pepTalk
            : pepTalkForMark(mark, clamped),
        celebration: (() => {
          const c = String(g.celebration || "");
          if (c === "congrats" || c === "a_pop" || c === "none") return c;
          return celebrationFromMark(mark);
        })(),
        breakdown: {
          completionPct: Number(breakdown.completionPct) || 0,
          hoursPct: Number(breakdown.hoursPct) || 0,
          salesPct: Number(breakdown.salesPct) || 0,
          roundupPct: Number(breakdown.roundupPct) || 0,
        },
      };
    }
  }
  const actionItemEntries = normalizeActionItemEntries(
    o.actionItemEntries ?? o.action_items_entries,
    typeof o.actionItems === "string" ? o.actionItems : "",
  );
  return {
    weekStart,
    killedIt: typeof o.killedIt === "string" ? o.killedIt : "",
    needsImprovement: typeof o.needsImprovement === "string" ? o.needsImprovement : "",
    actionItems: syncActionItemsText(actionItemEntries),
    actionItemEntries,
    grade,
    gradedAt: typeof o.gradedAt === "string" && o.gradedAt ? o.gradedAt : null,
  };
}

export function getWeekRoundup(
  plan: HustleSchedulePlan,
  weekStart: string = plan.weekStart,
): ScheduleWeekRoundup {
  const found = plan.roundups.find((r) => r.weekStart === weekStart);
  return found ?? emptyWeekRoundup(weekStart);
}

export function upsertWeekRoundup(
  plan: HustleSchedulePlan,
  roundup: ScheduleWeekRoundup,
): HustleSchedulePlan {
  const actionItemEntries = normalizeActionItemEntries(
    roundup.actionItemEntries,
    roundup.actionItems,
  );
  const synced: ScheduleWeekRoundup = {
    ...roundup,
    actionItemEntries,
    actionItems: syncActionItemsText(actionItemEntries),
  };
  const others = plan.roundups.filter((r) => r.weekStart !== synced.weekStart);
  return {
    ...plan,
    roundups: [...others, synced],
    updatedAt: new Date().toISOString(),
  };
}

export function patchBlueprintGoals(
  plan: HustleSchedulePlan,
  patch: Partial<ScheduleBlueprintGoals>,
): HustleSchedulePlan {
  const money = (v: unknown, fallback: number) =>
    v != null && Number.isFinite(Number(v))
      ? Math.max(0, Math.round(Number(v) * 100) / 100)
      : fallback;
  return {
    ...plan,
    blueprintGoals: {
      ...plan.blueprintGoals,
      ...patch,
      targetSalesUsd: money(patch.targetSalesUsd, plan.blueprintGoals.targetSalesUsd),
      actualSalesUsd: money(patch.actualSalesUsd, plan.blueprintGoals.actualSalesUsd),
      expensesUsd: money(patch.expensesUsd, plan.blueprintGoals.expensesUsd),
    },
    updatedAt: new Date().toISOString(),
  };
}

/** Sales − expenses for Blueprint P&L. */
export function blueprintProfitUsd(goals: ScheduleBlueprintGoals): number {
  const sales = Number(goals.actualSalesUsd) || 0;
  const expenses = Number(goals.expensesUsd) || 0;
  return Math.round((sales - expenses) * 100) / 100;
}

export function formatEstimateMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(Number(minutes) || 0));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h ${rem}m` : `${h}h`;
}

/**
 * D floor for Grade me (% of day blocks Done).
 * A 7-day week only hits 0, 14, 29, 43, 57, 71, 86, 100 — so a classic 60–69%
 * D band can never occur (4/7 ≈ 57% would skip from F to C). Floor at 50% so
 * 4 Done is D, 3 Done stays F.
 */
export const SCHEDULE_GRADE_D_MIN = 50;

function letterFromScore(score: number): ScheduleGradeLetter {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= SCHEDULE_GRADE_D_MIN) return "D";
  return "F";
}

export function gradeMarkFromScore(score: number): ScheduleGradeMark {
  if (score >= 97) return "A+";
  if (score >= 90) return "A";
  if (score >= 87) return "B+";
  if (score >= 80) return "B";
  if (score >= 77) return "C+";
  if (score >= 70) return "C";
  if (score >= SCHEDULE_GRADE_D_MIN) return "D";
  return "F";
}

export function celebrationFromMark(mark: ScheduleGradeMark): ScheduleGradeCelebration {
  if (mark === "A" || mark === "A+") return "a_pop";
  if (mark === "B+") return "congrats";
  return "none";
}

const PEP_TALKS: Record<ScheduleGradeMark, string[]> = {
  "A+": [
    "A+?! Did you invent a side hustle AND a time machine? Absolute legend energy.",
    "Chef’s kiss. The hustle gods just high-fived you. Don’t trip on your cape.",
    "A+: you’re not grinding — you’re gliding. Keep that magic illegal-in-most-states.",
  ],
  A: [
    "A game. Your future self just sent a thank-you note and a pizza.",
    "That’s an A, baby. Plot twist: you were the main character all week.",
    "A means Almost-unstoppable. (Fully-unstoppable is next week’s problem.)",
  ],
  "B+": [
    "B+! You’re so close to the VIP lounge the bouncer already knows your name.",
    "Solid B+ — not mid, not mythical, just deliciously competent. Flex gently.",
    "B+: the grade of champions who still do laundry. Congrats, you beautiful adult.",
  ],
  B: [
    "B for Boss-in-progress. One more push and you’re stealing A’s lunch money.",
    "Respectable B. Your hustle didn’t ghost you — it just left on read a little.",
    "B means Building. Rome wasn’t side-hustled in a day either.",
  ],
  "C+": [
    "C+: participation trophy… but make it fashion. Next week, more reps, less shrugs.",
    "You’re in the C+ club — mid-tier, high potential. Time to annoy your goals.",
    "C+: the universe whispered “try harder” and you heard “try later.” Flip that.",
  ],
  C: [
    "C for Could-be. Plot a comeback arc; villains hate a second-act glow-up.",
    "Average? Nah — this is your “training montage starts now” soundtrack cue.",
    "C means Continue. The hustle isn’t mad — it’s just waiting for you to text back.",
  ],
  D: [
    "D for Drama… and also Do-better. Shake it off; Monday doesn’t know your secrets.",
    "Rough week grade. Good news: D stands for “Definitely still in the game.”",
    "Oof. Your calendar called — it wants a rematch. You’ve got this.",
  ],
  F: [
    "F for Fresh start. Burn the week (figuratively), keep the lessons (literally).",
    "Nobody’s grading your soul. Reset, hydrate, and bully one tiny task into Done.",
    "This F is temporary. Your next Grade Me is a redemption arc waiting to drop.",
  ],
};

export function pepTalkForMark(mark: ScheduleGradeMark, score: number): string {
  const list = PEP_TALKS[mark];
  const idx = Math.abs(score) % list.length;
  return list[idx]!;
}

/**
 * Grade the week from day-block % complete (primary scale).
 * Hours / sales / roundup stay in the breakdown as context only.
 */
export function gradeScheduleWeek(
  plan: HustleSchedulePlan,
  weekStart: string = plan.weekStart,
): ScheduleWeekGrade {
  const blocks = plan.blocks;
  const doneCount = blocks.filter((b) => isScheduleBlockComplete(b)).length;
  const completionPct = blocks.length
    ? Math.round((doneCount / blocks.length) * 100)
    : 0;

  const hoursLogged = totalHoursLogged(blocks);
  const hoursPlanned = blocks.reduce((sum, b) => sum + (Number(b.minutes) || 0) / 60, 0);
  const hoursPct =
    hoursPlanned <= 0
      ? hoursLogged > 0
        ? 100
        : 0
      : Math.min(100, Math.round((hoursLogged / hoursPlanned) * 100));

  const { targetSalesUsd, actualSalesUsd } = plan.blueprintGoals;
  const salesPct =
    targetSalesUsd <= 0
      ? actualSalesUsd > 0
        ? 100
        : 0
      : Math.min(100, Math.round((actualSalesUsd / targetSalesUsd) * 100));

  const roundup = getWeekRoundup(plan, weekStart);
  const filled =
    (roundup.killedIt.trim() ? 1 : 0) +
    (roundup.needsImprovement.trim() ? 1 : 0) +
    (roundupHasActionItems(roundup) ? 1 : 0);
  const roundupPct = Math.round((filled / 3) * 100);

  /** Letter grade = % of day blocks marked Done. */
  const score = completionPct;
  const letter = letterFromScore(score);
  const mark = gradeMarkFromScore(score);
  const celebration = celebrationFromMark(mark);
  const pepTalk = pepTalkForMark(mark, score);
  const summary = [
    `${mark} (${score}%) — ${doneCount}/${blocks.length} day blocks complete.`,
    `Hours logged ${hoursLogged}h of ~${Math.round(hoursPlanned * 10) / 10}h estimated.`,
    `Sales ${formatMoneyShort(actualSalesUsd)} / ${formatMoneyShort(targetSalesUsd)} target.`,
    filled === 3
      ? "Weekly Roundup complete."
      : `Weekly Roundup ${filled}/3 sections filled.`,
  ].join(" ");

  return {
    letter,
    mark,
    score,
    summary,
    pepTalk,
    celebration,
    breakdown: { completionPct, hoursPct, salesPct, roundupPct },
  };
}

function formatMoneyShort(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  return `$${Math.round(n)}`;
}

/** Compute grade and store it on this week's roundup. */
export function applyScheduleWeekGrade(
  plan: HustleSchedulePlan,
  weekStart: string = plan.weekStart,
  gradedAt: string = new Date().toISOString(),
): HustleSchedulePlan {
  const grade = gradeScheduleWeek(plan, weekStart);
  const prev = getWeekRoundup(plan, weekStart);
  return upsertWeekRoundup(plan, {
    ...prev,
    weekStart,
    grade,
    gradedAt,
  });
}

/** Replace P&L ledger and sync Blueprint actual sales / expenses totals. */
export function patchPlanPnL(
  plan: HustleSchedulePlan,
  ledger: SchedulePnLLedger,
): HustleSchedulePlan {
  return {
    ...plan,
    pnl: ledger,
    blueprintGoals: {
      ...plan.blueprintGoals,
      actualSalesUsd: sumPnLSales(ledger.lines),
      expensesUsd: sumPnLExpenses(ledger.lines),
    },
    updatedAt: new Date().toISOString(),
  };
}

export function createSchedulePlan(input: {
  ownerId: ScheduleOwnerId;
  ownerLabel: string;
  hustleId: string;
  hustleLabel: string;
  ageGroup: BlueprintAgeGroup;
  blueprintId: string | null;
  startDate?: string;
  dueDate?: string;
  ref?: Date;
  /**
   * Always allocate a new schedule id (even if this owner+hustle already has one).
   * Use for “Make new schedule” so a second week of the same hustle can sit beside the first.
   */
  distinct?: boolean;
  /**
   * Launch Guide steps to place on Plan tracker. Omit to load the hustle’s playbook.
   * Pass `[]` to keep the legacy 7-day weekly template.
   */
  guideSteps?: ScheduleGuideStep[];
}): HustleSchedulePlan {
  const startParsed = input.startDate ? parseYmd(input.startDate) : null;
  const dueFallback = input.dueDate ?? defaultDueDate(input.ref);
  const startYmd = startParsed
    ? formatYmd(startParsed)
    : weekStartMonday(parseYmd(dueFallback) ?? new Date());
  const steps =
    input.guideSteps !== undefined
      ? input.guideSteps
      : playbookStepsForSchedule(input.hustleId);
  const promoted = steps.length
    ? promoteGuideStepBlocks(steps, startYmd)
    : startParsed
      ? promoteBlocksFromStartDate(input.hustleLabel, startYmd)
      : promoteBlocksFromDueDate(input.hustleLabel, dueFallback);
  const ref = input.ref ?? new Date();
  const id = input.distinct
    ? distinctSchedulePlanId(input.ownerId, input.hustleId, ref)
    : schedulePlanId(input.ownerId, input.hustleId);
  return {
    id,
    ownerId: input.ownerId,
    ownerLabel: input.ownerLabel,
    hustleId: input.hustleId,
    hustleLabel: input.hustleLabel,
    ageGroup: input.ageGroup,
    blueprintId: input.blueprintId,
    dueDate: promoted.dueDate,
    weekStart: promoted.weekStart,
    blocks: promoted.blocks,
    blueprintGoals: emptyBlueprintGoals(input.hustleLabel),
    pnl: emptyPnLLedger(),
    roundups: [],
    reminderCadence: "none",
    updatedAt: ref.toISOString(),
  };
}

/** Editing the start date shifts every block due date by the same number of days. */
export function updatePlanStartDate(
  plan: HustleSchedulePlan,
  startDateYmd: string,
): HustleSchedulePlan {
  const nextStart = parseYmd(startDateYmd);
  if (!nextStart) return plan;
  const newStart = formatYmd(nextStart);
  const oldStart =
    parseYmd(plan.weekStart) ? plan.weekStart : plan.blocks[0]?.dueDate || newStart;
  if (oldStart === newStart) {
    return { ...plan, weekStart: newStart, updatedAt: new Date().toISOString() };
  }
  const delta = daysBetweenYmd(oldStart, newStart);
  const blocks = plan.blocks.map((b) => {
    const dueDate = addDaysYmd(b.dueDate || oldStart, delta);
    return {
      ...b,
      dueDate,
      dayLabel: weekdayShortLabel(dueDate) || b.dayLabel,
    };
  });
  const latest = blocks.reduce(
    (max, b) => (b.dueDate > max ? b.dueDate : max),
    blocks[0]?.dueDate ?? addDaysYmd(newStart, 6),
  );
  return {
    ...plan,
    weekStart: newStart,
    dueDate: latest,
    blocks,
    updatedAt: new Date().toISOString(),
  };
}

/** Editing the plan due date rebuilds week start + per-day due dates (keeps done/hours). */
export function updatePlanDueDate(
  plan: HustleSchedulePlan,
  dueDateYmd: string,
): HustleSchedulePlan {
  const due = parseYmd(dueDateYmd);
  if (!due) return plan;
  return updatePlanStartDate(plan, weekStartMonday(due));
}

export function updateBlockDueDate(
  plan: HustleSchedulePlan,
  blockId: ScheduleBlockId,
  dueDateYmd: string,
): HustleSchedulePlan {
  const parsed = parseYmd(dueDateYmd);
  if (!parsed) return plan;
  const ymd = formatYmd(parsed);
  const blocks = plan.blocks.map((b) =>
    b.id === blockId ? { ...b, dueDate: ymd, dayLabel: weekdayShortLabel(ymd) || b.dayLabel } : b,
  );
  const latest = blocks.reduce((max, b) => (b.dueDate > max ? b.dueDate : max), blocks[0]!.dueDate);
  const earliest = blocks.reduce(
    (min, b) => (b.dueDate < min ? b.dueDate : min),
    blocks[0]!.dueDate,
  );
  return {
    ...plan,
    blocks,
    dueDate: latest,
    weekStart: earliest,
    updatedAt: new Date().toISOString(),
  };
}

export function emptyScheduleStore(ref: Date = new Date()): HustleScheduleStore {
  return {
    version: 3,
    schedules: [],
    deleted: [],
    activeScheduleId: null,
    updatedAt: ref.toISOString(),
  };
}

type BlueprintLike = {
  id: string;
  ageGroup: BlueprintAgeGroup;
  resultIds: string[];
  topResultId?: string | null;
  childProfileId?: string | null;
  completedAt?: string;
};

export function familyMemberOptions(
  memberName: string | null | undefined,
  children: { id: string; displayName: string; ageBand: "kids" | "junior" }[],
): FamilyMemberOption[] {
  const selfLabel = (memberName || "").trim() || "Me (account owner)";
  return [
    { id: "self", label: selfLabel },
    ...children.map((c) => ({
      id: c.id,
      label: c.displayName,
      ageBand: c.ageBand,
    })),
  ];
}

type ScheduleFamilyChildLike = {
  displayName?: string;
  needsRegistration?: boolean;
  source?: string;
};

/**
 * Kids still waiting on Register My Kid (Join signup rows) do not belong in Schedule Suite.
 * They look like a mystery “Register” chip and cannot keep a saved plan yet.
 */
export function scheduleEligibleFamilyChildren<T extends ScheduleFamilyChildLike>(
  children: T[],
): T[] {
  return children.filter((c) => {
    if (!String(c.displayName ?? "").trim()) return false;
    if (c.needsRegistration) return false;
    if (c.source === "signup") return false;
    return true;
  });
}

/** Save is clickable only after a real edit — not after opening a saved schedule. */
export function scheduleSaveEnabled(dirty: boolean, saving = false): boolean {
  return dirty && !saving;
}

/** Switch the open tab without treating it as an unsaved edit. */
export function activateSchedule(
  store: HustleScheduleStore,
  scheduleId: string | null,
): HustleScheduleStore {
  if (store.activeScheduleId === scheduleId) return store;
  return { ...store, activeScheduleId: scheduleId };
}

/**
 * Clicking a family-member name shows that person’s saved list.
 * Do not auto-open someone else’s leftover schedule.
 */
export function activeScheduleAfterOwnerFilter(
  schedules: HustleSchedulePlan[],
  ownerFilter: ScheduleOwnerFilter,
  activeScheduleId: string | null,
): string | null {
  const visible = filterSchedulesByOwner(schedules, ownerFilter);
  if (activeScheduleId && visible.some((s) => s.id === activeScheduleId)) {
    return activeScheduleId;
  }
  return null;
}

/** Hustles available for an owner from Blueprints assigned to them (self = unassigned). */
export function hustleOptionsForOwner(
  ownerId: ScheduleOwnerId,
  blueprints: BlueprintLike[],
): HustleOption[] {
  const relevant = blueprints.filter((bp) =>
    ownerId === "self" ? !bp.childProfileId : bp.childProfileId === ownerId,
  );
  const out: HustleOption[] = [];
  const seen = new Set<string>();
  for (const bp of relevant) {
    const ids =
      bp.resultIds.length > 0
        ? bp.resultIds
        : bp.topResultId
          ? [bp.topResultId]
          : [];
    for (const hustleId of ids) {
      const key = `${ownerId}::${hustleId}`;
      if (seen.has(key) || !hustleId) continue;
      seen.add(key);
      out.push({
        hustleId,
        hustleLabel: blueprintMatchLabel(bp.ageGroup, hustleId),
        ageGroup: bp.ageGroup,
        blueprintId: bp.id,
      });
    }
  }
  return out;
}

export function scheduleProgressPercent(blocks: ScheduleBlock[]): number {
  if (!blocks.length) return 0;
  return Math.round(
    (blocks.filter((b) => isScheduleBlockComplete(b)).length / blocks.length) * 100,
  );
}

export type ScheduleTaskCounts = {
  complete: number;
  remaining: number;
  total: number;
};

/** Day-block tasks: Done counts as complete; everything else is remaining. */
export function scheduleTaskCounts(blocks: ScheduleBlock[]): ScheduleTaskCounts {
  const total = blocks.length;
  const complete = blocks.filter((b) => isScheduleBlockComplete(b)).length;
  return { complete, remaining: Math.max(0, total - complete), total };
}

export function scheduleTaskCountLabel(counts: ScheduleTaskCounts): string {
  const taskWord = counts.complete === 1 ? "task" : "tasks";
  const remainWord = counts.remaining === 1 ? "task" : "tasks";
  return `${counts.complete} ${taskWord} complete · ${counts.remaining} ${remainWord} remaining`;
}

export function totalHoursLogged(blocks: ScheduleBlock[]): number {
  return blocks.reduce((sum, b) => sum + (Number(b.hoursLogged) || 0), 0);
}

export function scheduleTabLabel(plan: HustleSchedulePlan): string {
  const owner = plan.ownerId === "self" ? "Me" : plan.ownerLabel.split(" ")[0] || plan.ownerLabel;
  const hustle =
    plan.hustleLabel.length > 22 ? `${plan.hustleLabel.slice(0, 20)}…` : plan.hustleLabel;
  const week = parseYmd(plan.weekStart);
  const weekBit = week
    ? ` · ${week.getMonth() + 1}/${week.getDate()}`
    : plan.weekStart
      ? ` · ${plan.weekStart}`
      : "";
  return `${owner} · ${hustle}${weekBit}`;
}

/** Local calendar YYYY-MM-DD (not UTC). */
export function todayYmdLocal(ref: Date = new Date()): string {
  return formatYmd(ref);
}

export function isDatePastDue(dueYmd: string, todayYmd: string = todayYmdLocal()): boolean {
  return Boolean(parseYmd(dueYmd) && dueYmd < todayYmd);
}

export type OverdueScheduleItem = {
  scheduleId: string;
  scheduleLabel: string;
  ownerLabel: string;
  hustleLabel: string;
  kind: "plan" | "block";
  blockId?: ScheduleBlockId;
  dayLabel?: string;
  focus?: string;
  dueDate: string;
};

export type ScheduleSuiteSummary = {
  id: string;
  label: string;
  ownerLabel: string;
  hustleLabel: string;
  dueDate: string;
  overdueCount: number;
  planOverdue: boolean;
};

/** Past-due plan due date and incomplete day blocks. */
export function collectOverdueScheduleItems(
  store: HustleScheduleStore,
  todayYmd: string = todayYmdLocal(),
): OverdueScheduleItem[] {
  const out: OverdueScheduleItem[] = [];
  for (const plan of store.schedules) {
    const label = scheduleTabLabel(plan);
    if (isDatePastDue(plan.dueDate, todayYmd)) {
      out.push({
        scheduleId: plan.id,
        scheduleLabel: label,
        ownerLabel: plan.ownerLabel,
        hustleLabel: plan.hustleLabel,
        kind: "plan",
        dueDate: plan.dueDate,
      });
    }
    for (const block of plan.blocks) {
      if (isScheduleBlockComplete(block)) continue;
      if (!isDatePastDue(block.dueDate, todayYmd)) continue;
      out.push({
        scheduleId: plan.id,
        scheduleLabel: label,
        ownerLabel: plan.ownerLabel,
        hustleLabel: plan.hustleLabel,
        kind: "block",
        blockId: block.id,
        dayLabel: block.dayLabel,
        focus: block.focus,
        dueDate: block.dueDate,
      });
    }
  }
  return out.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function summarizeScheduleSuites(
  store: HustleScheduleStore,
  todayYmd: string = todayYmdLocal(),
): ScheduleSuiteSummary[] {
  return store.schedules.map((plan) => {
    const overdue = collectOverdueScheduleItems(
      { ...store, schedules: [plan], deleted: [], activeScheduleId: plan.id },
      todayYmd,
    );
    return {
      id: plan.id,
      label: scheduleTabLabel(plan),
      ownerLabel: plan.ownerLabel,
      hustleLabel: plan.hustleLabel,
      dueDate: plan.dueDate,
      overdueCount: overdue.length,
      planOverdue: isDatePastDue(plan.dueDate, todayYmd),
    };
  });
}

function isBlockId(v: unknown): v is ScheduleBlockId {
  if (typeof v !== "string" || !v.trim()) return false;
  if (DAY_ORDER.some((d) => d.id === v)) return true;
  return isGuideStepBlockId(v);
}

function normalizeStoredBlock(
  raw: Record<string, unknown>,
  fallbackDue: string,
): ScheduleBlock | null {
  const id = raw.id;
  if (!isBlockId(id)) return null;
  const dueDate =
    typeof raw.dueDate === "string" && parseYmd(raw.dueDate) ? raw.dueDate : fallbackDue;
  const status = normalizeScheduleBlockStatus(raw.status, Boolean(raw.done));
  const minutes =
    typeof raw.minutes === "number" && Number.isFinite(raw.minutes)
      ? Math.max(0, Math.round(raw.minutes))
      : typeof raw.minutes === "string" && Number.isFinite(Number(raw.minutes))
        ? Math.max(0, Math.round(Number(raw.minutes)))
        : 45;
  const hoursLogged = (() => {
    const coerced = coerceHoursLogged(raw.hoursLogged);
    if (coerced > 0) return coerced;
    return Math.round((minutes / 60) * 10) / 10;
  })();
  return {
    id,
    dayLabel:
      typeof raw.dayLabel === "string" && raw.dayLabel.trim()
        ? raw.dayLabel
        : weekdayShortLabel(dueDate) || id,
    focus: typeof raw.focus === "string" && raw.focus.trim() ? raw.focus : "Hustle work",
    minutes,
    status,
    done: status === "done",
    hoursLogged,
    dueDate,
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

function normalizePlan(raw: unknown): HustleSchedulePlan | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const ownerId = String(o.ownerId ?? "").trim() || "self";
  const hustleId = String(o.hustleId ?? "").trim();
  if (!hustleId) return null;
  const hustleLabel = String(o.hustleLabel ?? hustleId);
  const ageGroup = (["kids", "junior", "adult", "senior"].includes(String(o.ageGroup))
    ? o.ageGroup
    : "adult") as BlueprintAgeGroup;
  const dueDate =
    typeof o.dueDate === "string" && parseYmd(o.dueDate)
      ? o.dueDate
      : defaultDueDate();
  const base = createSchedulePlan({
    ownerId,
    ownerLabel: String(o.ownerLabel ?? (ownerId === "self" ? "Me" : ownerId)),
    hustleId,
    hustleLabel,
    ageGroup,
    blueprintId: o.blueprintId == null ? null : String(o.blueprintId),
    dueDate,
  });
  const rawBlocks = Array.isArray(o.blocks) ? o.blocks : [];
  const storedBlocks = rawBlocks
    .map((b) =>
      b && typeof b === "object"
        ? normalizeStoredBlock(b as Record<string, unknown>, base.dueDate)
        : null,
    )
    .filter((b): b is ScheduleBlock => Boolean(b));
  const blocks = storedBlocks.length > 0 ? storedBlocks : base.blocks;
  const assembled: HustleSchedulePlan = {
    ...base,
    id: typeof o.id === "string" && o.id ? o.id : schedulePlanId(ownerId, hustleId),
    weekStart:
      typeof o.weekStart === "string" && parseYmd(o.weekStart) ? o.weekStart : base.weekStart,
    blocks,
    blueprintGoals: normalizeBlueprintGoals(o.blueprintGoals, hustleLabel),
    pnl: normalizePnLLedger(o.pnl),
    roundups: Array.isArray(o.roundups)
      ? o.roundups
          .map((r) =>
            normalizeWeekRoundup(
              r,
              typeof o.weekStart === "string" && parseYmd(o.weekStart)
                ? o.weekStart
                : base.weekStart,
            ),
          )
          .filter((r): r is ScheduleWeekRoundup => Boolean(r))
      : [],
    reminderCadence:
      o.reminderCadence != null
        ? normalizeReminderCadence(o.reminderCadence)
        : cadenceFromLegacyEmailFlag(o.emailReminders),
    emailReminders: Boolean(
      o.reminderCadence
        ? normalizeReminderCadence(o.reminderCadence) !== "none"
        : o.emailReminders,
    ),
    updatedAt: typeof o.updatedAt === "string" && o.updatedAt ? o.updatedAt : base.updatedAt,
  };
  return alignSchedulePlanWithGuideSteps(assembled);
}

/**
 * Normalize D1 payload. Migrates legacy single-plan shape (v1) and v2 stores.
 */
export function normalizeHustleScheduleStore(raw: unknown): HustleScheduleStore {
  const empty = emptyScheduleStore();
  if (!raw || typeof raw !== "object") return empty;
  const o = raw as Record<string, unknown>;

  if (Array.isArray(o.schedules)) {
    const schedules = o.schedules
      .map((s) => normalizePlan(s))
      .filter((s): s is HustleSchedulePlan => Boolean(s));
    const deletedRaw = Array.isArray(o.deleted) ? o.deleted : [];
    const deleted: DeletedHustleSchedule[] = [];
    const activeIds = new Set(schedules.map((s) => s.id));
    for (const item of deletedRaw) {
      const plan = normalizePlan(item);
      if (!plan || activeIds.has(plan.id)) continue;
      const deletedAt =
        item &&
        typeof item === "object" &&
        typeof (item as { deletedAt?: unknown }).deletedAt === "string"
          ? (item as { deletedAt: string }).deletedAt
          : new Date().toISOString();
      deleted.push({ ...plan, deletedAt });
    }
    const activeScheduleId =
      typeof o.activeScheduleId === "string" &&
      schedules.some((s) => s.id === o.activeScheduleId)
        ? o.activeScheduleId
        : schedules[0]?.id ?? null;
    return {
      version: 3,
      schedules,
      deleted,
      activeScheduleId,
      updatedAt:
        typeof o.updatedAt === "string" && o.updatedAt ? o.updatedAt : empty.updatedAt,
    };
  }

  // Legacy v1: single hustle schedule object
  if (typeof o.hustleId === "string" && o.hustleId) {
    const plan = normalizePlan({
      ...o,
      ownerId: "self",
      ownerLabel: "Me",
      id: schedulePlanId("self", o.hustleId),
    });
    if (!plan) return empty;
    return {
      version: 3,
      schedules: [plan],
      deleted: [],
      activeScheduleId: plan.id,
      updatedAt: plan.updatedAt,
    };
  }

  return empty;
}

export function upsertSchedule(
  store: HustleScheduleStore,
  plan: HustleSchedulePlan,
): HustleScheduleStore {
  const idx = store.schedules.findIndex((s) => s.id === plan.id);
  const schedules =
    idx >= 0
      ? store.schedules.map((s, i) => (i === idx ? plan : s))
      : [...store.schedules, plan];
  // Creating/updating removes the same id from the trash
  const deleted = store.deleted.filter((d) => d.id !== plan.id);
  return {
    version: 3,
    schedules,
    deleted,
    activeScheduleId: plan.id,
    updatedAt: new Date().toISOString(),
  };
}

/** Soft-delete: move into deleted[] so it can be restored. */
export function softDeleteSchedule(
  store: HustleScheduleStore,
  scheduleId: string,
  deletedAt: string = new Date().toISOString(),
): HustleScheduleStore {
  const plan = store.schedules.find((s) => s.id === scheduleId);
  if (!plan) return store;
  const schedules = store.schedules.filter((s) => s.id !== scheduleId);
  const deletedEntry: DeletedHustleSchedule = { ...plan, deletedAt };
  const deleted = [
    deletedEntry,
    ...store.deleted.filter((d) => d.id !== scheduleId),
  ];
  return {
    version: 3,
    schedules,
    deleted,
    activeScheduleId:
      store.activeScheduleId === scheduleId
        ? schedules[0]?.id ?? null
        : store.activeScheduleId,
    updatedAt: deletedAt,
  };
}

/** Restore a soft-deleted schedule back into active tabs. */
export function restoreDeletedSchedule(
  store: HustleScheduleStore,
  scheduleId: string,
): HustleScheduleStore {
  const found = store.deleted.find((d) => d.id === scheduleId);
  if (!found) return store;
  const { deletedAt: _removed, ...plan } = found;
  void _removed;
  const deleted = store.deleted.filter((d) => d.id !== scheduleId);
  const withoutDup = store.schedules.filter((s) => s.id !== plan.id);
  const schedules = [...withoutDup, plan];
  return {
    version: 3,
    schedules,
    deleted,
    activeScheduleId: plan.id,
    updatedAt: new Date().toISOString(),
  };
}

/** @deprecated Use softDeleteSchedule — hard remove without trash. */
export function removeSchedule(
  store: HustleScheduleStore,
  scheduleId: string,
): HustleScheduleStore {
  return softDeleteSchedule(store, scheduleId);
}

export function patchActivePlan(
  store: HustleScheduleStore,
  scheduleId: string,
  patch: (plan: HustleSchedulePlan) => HustleSchedulePlan,
): HustleScheduleStore {
  const schedules = store.schedules.map((s) => (s.id === scheduleId ? patch(s) : s));
  return {
    ...store,
    version: 3,
    schedules,
    updatedAt: new Date().toISOString(),
  };
}

export function setScheduleBlockStatus(
  plan: HustleSchedulePlan,
  blockId: ScheduleBlockId,
  status: ScheduleBlockStatus,
): HustleSchedulePlan {
  const next = normalizeScheduleBlockStatus(status);
  return {
    ...plan,
    blocks: plan.blocks.map((b) =>
      b.id === blockId ? { ...b, status: next, done: next === "done" } : b,
    ),
    updatedAt: new Date().toISOString(),
  };
}

/** Apply checkbox: checked → Done, unchecked → Not Started. */
export function applyScheduleBlockCheckbox(
  plan: HustleSchedulePlan,
  blockId: ScheduleBlockId,
  checked: boolean,
): HustleSchedulePlan {
  return setScheduleBlockStatus(
    plan,
    blockId,
    scheduleStatusFromCheckboxChecked(checked),
  );
}

/** Toggle Done ↔ Not Started (checkbox shortcut when only flipping). */
export function toggleScheduleBlockDone(
  plan: HustleSchedulePlan,
  blockId: ScheduleBlockId,
): HustleSchedulePlan {
  const block = plan.blocks.find((b) => b.id === blockId);
  if (!block) return plan;
  return applyScheduleBlockCheckbox(plan, blockId, !isScheduleBlockComplete(block));
}

export function setScheduleBlockHours(
  plan: HustleSchedulePlan,
  blockId: ScheduleBlockId,
  hours: number,
): HustleSchedulePlan {
  const hoursLogged = Math.max(0, Math.round(hours * 10) / 10);
  return {
    ...plan,
    blocks: plan.blocks.map((b) =>
      b.id === blockId ? { ...b, hoursLogged } : b,
    ),
    updatedAt: new Date().toISOString(),
  };
}

/** Coerce stored hours (number or numeric string) to a finite non-negative number. */
export function coerceHoursLogged(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 10) / 10;
}

/** Hours are mandatory (> 0) on every Plan Tracker day block. */
export function scheduleBlockRequiresHours(
  _block?: Pick<ScheduleBlock, "status" | "done">,
): boolean {
  return true;
}

export function isScheduleBlockHoursValid(hours: unknown): boolean {
  return coerceHoursLogged(hours) > 0;
}

export function scheduleBlockHoursOk(
  block: Pick<ScheduleBlock, "status" | "done" | "hoursLogged" | "minutes">,
): boolean {
  void block.status;
  void block.done;
  if (isScheduleBlockHoursValid(block.hoursLogged)) return true;
  // Estimate minutes count as planned time if hrs logged were never set.
  const mins = typeof block.minutes === "number" ? block.minutes : Number(block.minutes);
  return Number.isFinite(mins) && mins > 0;
}

/**
 * Fill missing hoursLogged from Est. minutes (minutes ÷ 60) so Save/Grade
 * don’t fail when estimates are set but Hrs was left blank.
 */
export function ensureHoursFromEstimates(plan: HustleSchedulePlan): HustleSchedulePlan {
  let changed = false;
  const blocks = plan.blocks.map((b) => {
    if (coerceHoursLogged(b.hoursLogged) > 0) return b;
    const mins = typeof b.minutes === "number" ? b.minutes : Number(b.minutes);
    if (!Number.isFinite(mins) || mins <= 0) return b;
    changed = true;
    return {
      ...b,
      hoursLogged: Math.max(0.1, Math.round((mins / 60) * 10) / 10),
    };
  });
  if (!changed) return plan;
  return { ...plan, blocks, updatedAt: new Date().toISOString() };
}

export function ensureStoreHoursFromEstimates(
  store: HustleScheduleStore,
): HustleScheduleStore {
  let changed = false;
  const schedules = store.schedules.map((p) => {
    const next = ensureHoursFromEstimates(p);
    if (next !== p) changed = true;
    return next;
  });
  if (!changed) return store;
  return { ...store, schedules, updatedAt: new Date().toISOString() };
}

/** Day ids missing required hours (hours ≤ 0 and no estimate minutes). */
export function planBlocksMissingHours(plan: HustleSchedulePlan): ScheduleBlockId[] {
  return plan.blocks
    .filter((b) => !scheduleBlockHoursOk(b))
    .map((b) => b.id);
}

export function planHasRequiredHours(plan: HustleSchedulePlan): boolean {
  return planBlocksMissingHours(plan).length === 0;
}

/** Human-readable validation errors for save / error dialog. */
export function collectScheduleValidationErrors(
  store: Pick<HustleScheduleStore, "schedules">,
  opts?: { onlyScheduleId?: string | null },
): string[] {
  const errors: string[] = [];
  const plans = opts?.onlyScheduleId
    ? store.schedules.filter((p) => p.id === opts.onlyScheduleId)
    : store.schedules;
  for (const plan of plans) {
    const missing = planBlocksMissingHours(plan);
    if (missing.length === 0) continue;
    const days = missing
      .map((id) => plan.blocks.find((b) => b.id === id)?.dayLabel ?? id)
      .join(", ");
    errors.push(
      `${scheduleTabLabel(plan)}: enter Hrs logged (or Est. minutes) for ${days}.`,
    );
  }
  return errors;
}

export function setBlockEstimatedMinutes(
  plan: HustleSchedulePlan,
  blockId: ScheduleBlockId,
  minutes: number,
): HustleSchedulePlan {
  const m = Math.max(0, Math.min(24 * 60, Math.round(Number(minutes) || 0)));
  return {
    ...plan,
    blocks: plan.blocks.map((b) => (b.id === blockId ? { ...b, minutes: m } : b)),
    updatedAt: new Date().toISOString(),
  };
}

export type ScheduleOwnerFilter = "all" | ScheduleOwnerId;

export function filterSchedulesByOwner(
  schedules: HustleSchedulePlan[],
  ownerFilter: ScheduleOwnerFilter,
): HustleSchedulePlan[] {
  if (ownerFilter === "all") return schedules;
  return schedules.filter((s) => s.ownerId === ownerFilter);
}

export function setBlockFocus(
  plan: HustleSchedulePlan,
  blockId: ScheduleBlockId,
  focus: string,
): HustleSchedulePlan {
  if (isGuideStepBlockId(blockId)) return plan;
  return {
    ...plan,
    blocks: plan.blocks.map((b) =>
      b.id === blockId ? { ...b, focus } : b,
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function setBlockNotes(
  plan: HustleSchedulePlan,
  blockId: ScheduleBlockId,
  notes: string,
): HustleSchedulePlan {
  return {
    ...plan,
    blocks: plan.blocks.map((b) => (b.id === blockId ? { ...b, notes } : b)),
    updatedAt: new Date().toISOString(),
  };
}

/** One-line preview for collapsed roundup / notes fields. */
export function scheduleCollapsePreview(text: string, emptyLabel = "Tap to add"): string {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return emptyLabel;
  return t.length > 80 ? `${t.slice(0, 79)}…` : t;
}
