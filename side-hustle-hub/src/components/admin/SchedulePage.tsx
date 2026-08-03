import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  ListPlus,
  Mail,
  MessageSquare,
  Paperclip,
  Plus,
  RotateCcw,
  Save,
  Search,
  Square,
  Trash2,
  Users,
} from "lucide-react";
import { ApiError } from "../../lib/api";
import type { AuthUser } from "../../lib/auth";
import { fetchAgilePlan, persistAgilePlan } from "../../lib/gysh-agile-plan";
import {
  createPartnerAgenda,
  sendPartnerAgendaInvite,
} from "../../lib/gysh-partner-agenda";
import { ShowHideChevron, ShowHideToggle } from "../ShowHideToggle";
import {
  closeSprint,
  fetchClosedSprints,
  isSprintLocked,
  reopenSprint,
  sprintLockedMessage,
} from "../../lib/gysh-closed-sprints";
import { SprintLockedBanner } from "./SprintLockedBanner";
import {
  completeWorkTimer,
  ensureWorkTimerStarted,
  stopTimerOnStatusChange,
} from "../../lib/gysh-time-entries";
import { useActiveTimers } from "../../lib/use-active-timers";
import { WorkTimer } from "./WorkTimer";
import { BusyOverlay, WaitIndicator, WaitLabel } from "../WaitFeedback";
import { MarkdownLinkText } from "./MarkdownLinkText";
import {
  applyRolloutSprintSchedule,
  itemRolledRelativeToSprint,
  noteIndicatesRollover,
  planToBoardCard,
  ROLLOUT_SCHEDULE_VERSION,
  rolloverNoteText,
  sprintRolloverSummary,
  taskToBoardCard,
  testIsRolledOver,
  testToBoardCard,
  type BoardCard,
} from "../../lib/gysh-sprint-board";
import { SprintStatusBars } from "./SprintStatusBars";
import {
  EndSprintModal,
  listIncompletePlanItems,
  listIncompleteSprintWork,
  type EndSprintAction,
} from "./EndSprintModal";
import {
  ACCEPT_ATTACHMENTS,
  applyPartnerDone,
  assigneeDisplayLabel,
  assigneeIncludes,
  base64ToBlob,
  deletePlanAttachmentRemote,
  fetchPlanAttachmentContent,
  fetchTasks,
  fileToBase64,
  formatFileSize,
  isAcceptedAttachment,
  isoToMmddyy,
  mmddyyToIso,
  parseAssigneePeople,
  parseMMDDYY,
  persistTasks,
  requiresPartnerDone,
  TASK_STATUS_LABELS,
  todayMMDDYY,
  uploadPlanAttachment,
  type GyshTask,
  type TaskStatus,
} from "../../lib/gysh-tasks";
import { AssigneeMultiSelect } from "./AssigneeMultiSelect";
import { formatAuditTrail } from "../../lib/gysh-audit";
import {
  SYSTEM_ASSIGNED_BY,
  assignedBySelectOptions,
  auditActorLabel,
  canonicalizePartnerLabel,
  canSetTestBlocked,
  todayMMDDYY as assignmentToday,
  userHasAdminRole,
} from "../../lib/gysh-assignment";
import { queryLooksLikeTaskId } from "../../lib/gysh-task-search";
import { normalizeProgressAssignee } from "../../lib/daily-progress-report";
import {
  appendActorNote,
  applyNoteDrafts,
  notesHaveUnsavedDraft,
  type PriorNoteAttribution,
} from "../../lib/gysh-note-entries";
import {
  TEST_CASES,
  fetchTestStatuses,
  saveTestStatus,
  saveTestStatusesBatch,
  withDefaultSuite,
  STATUS_LABELS as TEST_STATUS_LABELS,
  statusRequiresNote,
  noteMeetsRequirement,
  type TestStatusesPayload,
  type TestStatus,
} from "../../lib/gysh-test-plan";
import { NotesThread } from "./NotesThread";
import {
  AUTOMATED_PLAYWRIGHT_CASES,
  AUTOMATED_VITEST_CASES,
  isAutomatedTestId,
  isWizardMatrixCaseId,
} from "../../lib/gysh-automated-tests";
import {
  AUTOMATED_SUITE_OWNERS,
  QA_TESTERS,
  type QaTesterId,
} from "../../lib/gysh-roles";
import {
  BACKLOG_SPRINT,
  CEREMONY_LABELS,
  RETRO_COLUMNS,
  STATUS_LABELS,
  UNASSIGNED_OWNER,
  applyPlanPartnerDone,
  assigneeForBacklogSprint,
  buildDefaultPlanItems,
  ceremoniesForSprint,
  dueDateForSprint,
  formatDisplayDate,
  formatNumericDateRange,
  getSprintWindow,
  isBacklogSprint,
  currentSprintIndex,
  listUpcomingSprints,
  newPlanItemId,
  newRetroCardId,
  sprintLabel,
  themeForSprint,
  sanitizeBacklogPlanOwners,
  sanitizeBacklogTaskAssignees,
  sanitizeBacklogTestAssignees,
  withBacklogPlanUnassigned,
  withBacklogTaskUnassigned,
  withSprintDueDate,
  type PlanItem,
  type PlanItemAttachment,
  type PlanItemStatus,
  type PlanOwner,
  type RetroCard,
  type RetroColumn,
  type SprintCeremony,
} from "../../lib/gysh-sprints";
import {
  deleteTaskFile,
  getTaskFile,
  newFileId,
  putTaskFile,
} from "../../lib/gysh-task-files";

type ScheduleTab = "board" | "ceremonies" | "retro";
/** Sprint bubble selection: a sprint index, Backlog, or All Sprints (non-backlog combined). */
type SprintBoardSelection = number | "backlog" | "all";

function isSprintIndex(selection: SprintBoardSelection): selection is number {
  return typeof selection === "number";
}

const ALL_TESTS = [
  ...withDefaultSuite(TEST_CASES),
  ...AUTOMATED_VITEST_CASES,
  ...AUTOMATED_PLAYWRIGHT_CASES,
].filter((t) => !isWizardMatrixCaseId(t.id));

/** Board/catalog IDs only — ignore orphan D1 rows from renamed case IDs. */
const KNOWN_CASE_IDS = new Set(ALL_TESTS.map((t) => t.id));

/** Includes FMSH wizard rows so one-shot rollout heal can place Kids/Jr/Adult/Senior bands. */
const ROLLOUT_HEAL_TESTS = [
  ...withDefaultSuite(TEST_CASES),
  ...AUTOMATED_VITEST_CASES,
  ...AUTOMATED_PLAYWRIGHT_CASES,
];

const ROLLOUT_HEAL_STORAGE_KEY = "gysh-rollout-schedule-version";

const TEST_DEFAULT_ASSIGNEES = Object.fromEntries(
  ALL_TESTS.map((test) => [test.id, test.assignees[0] ?? ""]),
) as Record<string, QaTesterId | "">;

const STATUS_COLORS: Record<string, string> = {
  todo: "#9ca3af",
  not_run: "#9ca3af",
  not_started: "#9ca3af",
  in_progress: "#ca8a04",
  rolled_over: "#0e7490",
  done: "#16a34a",
  pass: "#16a34a",
  conditional_approval: "#0f766e",
  fail: "#dc2626",
  carried: "#dc2626",
  blocked: "#ea580c",
  fixed_retest: "#2563eb",
  failed_retest: "#f97316",
  fixed_cursor: "#7c3aed",
  fixed_lighthouse: "#0891b2",
  fixed_foresight: "#b45309",
};

const CEREMONY_COLORS: Record<SprintCeremony["type"], string> = {
  standup: "#3b6ea5",
  planning: "#8a7348",
  retrospective: "#9B2F28",
};

type BoardOwnerFilter = "all" | "Tina" | "Evelyn" | "Lyriq" | "Both" | "Unassigned";

type CardDraft = {
  assignee?: string;
  status?: string;
  sprint?: number;
  note?: string;
  /** MM/DD/YY — tasks/tests dueDate; plan items map to `date` / `dateLabel`. */
  dueDate?: string;
  /** Tasks: assignBy · Tests: assignedBy. Ignored for plan cards. */
  assignBy?: string;
};

const BULK_STATUS_OPTIONS: { id: string; label: string }[] = [
  { id: "todo", label: "To do / Not run" },
  { id: "in_progress", label: "In progress" },
  { id: "rolled_over", label: "Rolled Over" },
  { id: "done", label: "Done / Pass" },
  { id: "conditional_approval", label: "Conditional Pass (tests)" },
  { id: "blocked", label: "Blocked" },
  { id: "fail", label: "Fail (tests)" },
  { id: "carried", label: "Carry over (plan)" },
];

function mapBulkStatusToSource(
  source: BoardCard["source"],
  bulkStatus: string,
): string | null {
  if (source === "test") {
    if (bulkStatus === "todo") return "not_run";
    if (bulkStatus === "done") return "pass";
    if (bulkStatus === "carried") return null;
    return bulkStatus;
  }
  if (source === "task") {
    if (bulkStatus === "todo") return "not_started";
    if (bulkStatus === "done" || bulkStatus === "pass") return "done";
    if (
      bulkStatus === "fail" ||
      bulkStatus === "carried" ||
      bulkStatus === "not_run" ||
      bulkStatus === "conditional_approval"
    ) {
      return null;
    }
    return bulkStatus;
  }
  if (bulkStatus === "todo" || bulkStatus === "not_started" || bulkStatus === "not_run") return "todo";
  if (bulkStatus === "done" || bulkStatus === "pass") return "done";
  if (bulkStatus === "fail" || bulkStatus === "blocked" || bulkStatus === "conditional_approval") {
    return null;
  }
  return bulkStatus;
}

function bulkAssigneeForSource(source: BoardCard["source"], value: string): string | null {
  if (!value) return null;
  if (value === UNASSIGNED_OWNER || value === "unassigned") {
    return source === "test" ? "" : UNASSIGNED_OWNER;
  }
  // Tasks/plans store multi-assignee strings (Both, Tina+Lyriq, …).
  if (source !== "test") {
    if (value === "tina" || value === "evelyn" || value === "lyriq") {
      return QA_TESTERS.find((t) => t.id === value)?.shortName ?? null;
    }
    return value;
  }
  // Tests use a single QA tester id — only apply when exactly one person is staged.
  const people = parseAssigneePeople(value);
  if (people.length === 1) {
    return QA_TESTERS.find((t) => t.shortName === people[0])?.id ?? null;
  }
  const id = QA_TESTERS.find((t) => t.id === value || t.shortName === value)?.id;
  return id ?? null;
}

const OWNER_BUBBLES: { id: BoardOwnerFilter; label: string; accent?: string }[] = [
  { id: "all", label: "All assignees" },
  { id: "Tina", label: "Tina", accent: "#9B2F28" },
  { id: "Evelyn", label: "Evelyn", accent: "#947D64" },
  { id: "Lyriq", label: "Lyriq", accent: "#2e7d32" },
  { id: "Both", label: "Both", accent: "#181718" },
  { id: "Unassigned", label: "Unassigned", accent: "#7a7064" },
];

/** Assigned By filter sentinel for cards with no assignor set. */
const ASSIGN_BY_UNSET = "__unset__";

/** Columns so chips fill exactly 2 rows (row-major). */
function chipColsForTwoRows(count: number): number {
  return Math.max(1, Math.ceil(count / 2));
}

/** Assignee filter: Tina/Evelyn match any card that includes them (incl. Both / multi).
 *  Tests store lowercase ids (`evelyn`); tasks use display names (`Evelyn`) — normalize first. */
function matchesAssigneeFilter(ownerValue: string, owner: BoardOwnerFilter): boolean {
  if (owner === "all") return true;
  const v = normalizeProgressAssignee(ownerValue);
  if (owner === "Unassigned") {
    return v === "Unassigned";
  }
  if (owner === "Both") {
    return requiresPartnerDone(v) || v === "Both";
  }
  if (owner === "Tina" || owner === "Evelyn" || owner === "Lyriq") {
    return v === owner || assigneeIncludes(v, owner);
  }
  return v === owner;
}

/** Assignor (Assigned By) filter. */
function matchesAssignByFilter(assignByValue: string, filter: string): boolean {
  if (filter === "all") return true;
  const v = String(assignByValue || "").trim();
  if (filter === ASSIGN_BY_UNSET) return !v;
  const canon = canonicalizePartnerLabel(v) || v;
  return canon === filter || v === filter;
}

/** Sprint Board search — id, title, notes, assignee, assignor, status. */
function boardCardMatchesSearch(
  card: BoardCard,
  rawQuery: string,
  extras: { assignee: string; assignBy: string; status: string },
): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const id = String(card.sourceId || "").toLowerCase();
  const qBare = q.replace(/^#/, "");
  if (queryLooksLikeTaskId(rawQuery) || /^[a-z]{1,8}-[\w-]+$/i.test(qBare)) {
    if (id === qBare || id === `t-${qBare}` || id.includes(qBare)) return true;
    if (queryLooksLikeTaskId(rawQuery) && !id.includes(qBare)) {
      // Pure id query should not match on title/date haystack.
      return false;
    }
  }
  if (id.includes(qBare)) return true;
  const haystack = [
    card.title,
    card.notes,
    card.sourceId,
    card.kindLabel,
    card.source,
    extras.assignee,
    extras.assignBy,
    extras.status,
  ]
    .join("\n")
    .toLowerCase();
  return haystack.includes(q);
}

function isDone(card: BoardCard): boolean {
  return card.status === "done";
}

/** Tasks / Tests / Plan counts with done (status === done; tests pass → done). */
function countBySource(cards: BoardCard[]) {
  let tasks = 0;
  let tests = 0;
  let plan = 0;
  let tasksDone = 0;
  let testsDone = 0;
  let planDone = 0;
  for (const c of cards) {
    const done = isDone(c);
    if (c.source === "task") {
      tasks += 1;
      if (done) tasksDone += 1;
    } else if (c.source === "test") {
      tests += 1;
      if (done) testsDone += 1;
    } else if (c.source === "plan") {
      plan += 1;
      if (done) planDone += 1;
    }
  }
  // Face totals = Tasks + Tests only (Plan stays in tooltips via formatTQTitle).
  const workDone = tasksDone + testsDone;
  const workTotal = tasks + tests;
  return {
    tasks,
    tests,
    plan,
    tasksDone,
    testsDone,
    planDone,
    workDone,
    workTotal,
    /** All board cards including Plan (not used for face totals). */
    total: cards.length,
  };
}

type TQCounts = {
  tasks: number;
  tests: number;
  tasksDone: number;
  testsDone: number;
  plan?: number;
  planDone?: number;
  workDone?: number;
  workTotal?: number;
};

/** Compact readable label: Tests then Tasks (tooltips / inline). */
function formatTQ(c: Pick<TQCounts, "tasks" | "tests" | "tasksDone" | "testsDone">): string {
  return `Tests: ${c.testsDone}/${c.tests} · Tasks: ${c.tasksDone}/${c.tasks}`;
}

/** Face headline: Tasks+Tests done/total (excludes Plan). */
function formatWorkDoneTotal(c: Pick<TQCounts, "tasks" | "tests" | "tasksDone" | "testsDone">): string {
  const done = c.tasksDone + c.testsDone;
  const total = c.tasks + c.tests;
  return `${done}/${total}`;
}

/** Plain-language breakdown for tooltips (Plan only when plan > 0). */
function formatTQTitle(c: TQCounts): string {
  const base = formatTQ(c);
  const plan = c.plan ?? 0;
  const planDone = c.planDone ?? 0;
  return plan > 0 ? `${base} · Plan: ${planDone}/${plan}` : base;
}

/** Sprint bubble face: Tests then Tasks; optional rolled-over counts under each. */
function TQBubbleLines({
  c,
  rolledTests,
  rolledTasks,
}: {
  c: Pick<TQCounts, "tasks" | "tests" | "tasksDone" | "testsDone">;
  /** Tests on this sprint that were rolled in from the prior sprint. */
  rolledTests?: number;
  /** Tasks on this sprint that were rolled in from the prior sprint. */
  rolledTasks?: number;
}) {
  const showRoll = rolledTests !== undefined || rolledTasks !== undefined;
  const testsRolled = rolledTests ?? 0;
  const tasksRolled = rolledTasks ?? 0;
  return (
    <span
      className="qa-tester-meta schedule-sprint-tq"
      title={
        showRoll
          ? `${formatTQ(c)} · Rolled over — Tests: ${testsRolled} · Tasks: ${tasksRolled}`
          : formatTQ(c)
      }
    >
      <span>
        Tests: {c.testsDone}/{c.tests}
        {showRoll && testsRolled > 0 ? (
          <span className="schedule-sprint-tq__rolled" data-testid="sprint-tq-rolled-tests">
            Rolled over: {testsRolled}
          </span>
        ) : null}
      </span>
      <span>
        Tasks: {c.tasksDone}/{c.tasks}
        {showRoll && tasksRolled > 0 ? (
          <span className="schedule-sprint-tq__rolled" data-testid="sprint-tq-rolled-tasks">
            Rolled over: {tasksRolled}
          </span>
        ) : null}
      </span>
    </span>
  );
}

/** Wine-band heading + chevron; chips/body hide when collapsed.
 * Chevron toggles collapse; optional title click applies a filter (does not collapse). */
function CollapsibleFilterSection({
  title,
  hint,
  defaultOpen = false,
  testId,
  onFilterClick,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  testId?: string;
  /** When set, the title label filters; Show/Hide controls visibility. */
  onFilterClick?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const filterable = Boolean(onFilterClick);
  return (
    <div className="schedule-board-filters__row" data-testid={testId}>
      <div className="schedule-board-filters__label schedule-board-filters__label--bar">
        <ShowHideChevron
          open={open}
          onOpenChange={setOpen}
          label={title}
          testId={testId ? `${testId}-chevron` : undefined}
        />
        {filterable ? (
          <button
            type="button"
            className="schedule-board-filters__filter-title"
            onClick={onFilterClick}
            title="Click to filter"
            aria-label={`${title}. Click to filter`}
            data-testid={testId ? `${testId}-filter` : undefined}
          >
            <span>{title}</span>
            <span className="schedule-board-filters__click-hint">Click to filter</span>
            {!open && hint ? (
              <span className="schedule-board-filters__label-hint">{hint}</span>
            ) : null}
          </button>
        ) : (
          <button
            type="button"
            className="schedule-board-filters__filter-title schedule-board-filters__filter-title--collapse"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${title}. ${open ? "Collapse" : "Expand"}`}
            data-testid={testId ? `${testId}-heading` : undefined}
          >
            <span>{title}</span>
            {!open && hint ? (
              <span className="schedule-board-filters__label-hint">{hint}</span>
            ) : null}
          </button>
        )}
        <ShowHideToggle
          open={open}
          onOpenChange={setOpen}
          label={title}
          testId={testId ? `${testId}-toggle` : undefined}
        />
      </div>
      {open ? children : null}
    </div>
  );
}

function percent(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function ProgressMeter({
  label,
  done,
  total,
  accent,
  tasks,
  tests,
  tasksDone,
  testsDone,
  onFilterClick,
  selected,
}: {
  label: string;
  done: number;
  total: number;
  accent: string;
  tasks?: number;
  tests?: number;
  tasksDone?: number;
  testsDone?: number;
  onFilterClick?: () => void;
  selected?: boolean;
}) {
  const value = percent(done, total);
  const showTQ =
    tasks !== undefined &&
    tests !== undefined &&
    tasksDone !== undefined &&
    testsDone !== undefined;
  const tq = showTQ ? { tasks, tests, tasksDone, testsDone } : null;
  const filterable = Boolean(onFilterClick);
  return (
    <div
      className={`schedule-progress-meter${filterable ? " schedule-progress-meter--filterable" : ""}${selected ? " schedule-progress-meter--selected" : ""}`}
      style={{ minWidth: 0 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 5,
          fontSize: "0.9375rem",
        }}
      >
        {filterable ? (
          <button
            type="button"
            className="schedule-progress-meter__filter-btn"
            onClick={onFilterClick}
            title="Click to filter"
            aria-label={`${label}. Click to filter`}
          >
            <strong style={{ color: "var(--charcoal)" }}>{label}</strong>
            <span className="schedule-board-filters__click-hint">Click to filter</span>
          </button>
        ) : (
          <strong style={{ color: "var(--charcoal)" }}>{label}</strong>
        )}
        <span style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
          {done}/{total} · {value}%
          {tq && (
            <span
              className="schedule-sprint-tq"
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: "0.85rem", marginTop: 1 }}
              title={formatTQTitle(tq)}
            >
              <span>Tests: {tq.testsDone}/{tq.tests}</span>
              <span>Tasks: {tq.tasksDone}/{tq.tasks}</span>
            </span>
          )}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} sprint progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        style={{
          height: 10,
          borderRadius: 999,
          background: "rgba(148,125,100,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            borderRadius: 999,
            background: accent,
            transition: "width 180ms ease",
          }}
        />
      </div>
    </div>
  );
}

/** Card type filter — Tasks vs Tests (QA). Plan milestones stay in DB but are hidden from the board. */
type BoardSourceFilter = "all" | "task" | "test";

const SOURCE_BUBBLES: { id: BoardSourceFilter; label: string; accent?: string }[] = [
  { id: "all", label: "All types" },
  { id: "test", label: "Tests (QA)", accent: "#3b6ea5" },
  { id: "task", label: "Tasks", accent: "#5c4033" },
];

/** Board face shows Tasks + Tests only (Plan excluded from All types). */
function matchesSourceFilter(source: BoardCard["source"], filter: BoardSourceFilter): boolean {
  if (filter === "all") return source === "task" || source === "test";
  return source === filter;
}

/** Sprint placement status (carry-over vs still in this sprint). Not work progress. */
type SprintPlacementStatus = "active" | "carried";

const SPRINT_STATUS_BUBBLES: { id: SprintPlacementStatus; label: string }[] = [
  { id: "active", label: "In sprint" },
  { id: "carried", label: "Carry over" },
];

/** Work progress for tasks (excludes carry-over). Tests use TEST_STATUS_BUBBLES. */
const WORK_STATUS_BUBBLES: { id: string; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "rolled_over", label: "Rolled Over" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

/** Test progress — same statuses as Testing Portal. */
const TEST_STATUS_BUBBLES: { id: TestStatus; label: string }[] = (
  [
    "not_run",
    "in_progress",
    "rolled_over",
    "pass",
    "conditional_approval",
    "fail",
    "blocked",
    "fixed_retest",
    "failed_retest",
    "fixed_cursor",
  ] as const
).map((id) => ({ id, label: TEST_STATUS_LABELS[id] }));

function cardSprintPlacement(card: BoardCard): SprintPlacementStatus {
  return card.status === "carried" ? "carried" : "active";
}

/** Task work status for filtering; carry-over is sprint status only. */
function cardWorkStatus(card: BoardCard): string | null {
  if (card.status === "carried") return null;
  return card.status;
}

/** Task IDs referenced in plan notes (e.g. T-003, T-LG-airbnb). */
function taskIdsInText(text: string): string[] {
  const matches = text.match(/\bT-(?:LG-[\w-]+|SENIOR-PAGE|\d{3})\b/g) ?? [];
  return [...new Set(matches)];
}

function planFileKey(planItemId: string): string {
  return `plan:${planItemId}`;
}

function PlanItemAttachments({
  item,
  onChange,
  readOnly = false,
}: {
  item: PlanItem;
  onChange: (attachments: PlanItemAttachment[]) => void;
  readOnly?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (readOnly || !files?.length) return;
    setError("");
    setUploading(true);
    try {
      const next = [...(item.attachments ?? [])];
      for (const file of Array.from(files)) {
        if (!isAcceptedAttachment(file)) {
          setError(`Skipped unsupported file: ${file.name}`);
          continue;
        }
        const id = newFileId();
        const addedAt = todayMMDDYY();
        const mimeType = file.type || "application/octet-stream";
        const contentBase64 = await fileToBase64(file);
        const saved = await uploadPlanAttachment({
          planItemId: item.id,
          id,
          name: file.name,
          mimeType,
          contentBase64,
          addedAt,
        });
        await putTaskFile({
          taskId: planFileKey(item.id),
          fileId: saved.storedId || saved.id,
          name: saved.name,
          mimeType: saved.mimeType,
          size: saved.size,
          blob: file,
          addedAt: saved.addedAt,
        });
        next.push({
          id: saved.id,
          name: saved.name,
          mimeType: saved.mimeType,
          size: saved.size,
          storedId: saved.storedId || saved.id,
          addedAt: saved.addedAt,
          hasContent: true,
        });
      }
      onChange(next);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const openOrDownload = async (att: PlanItemAttachment) => {
    let blob: Blob | null = null;
    const rec = await getTaskFile(planFileKey(item.id), att.storedId);
    if (rec) blob = rec.blob;
    else {
      try {
        const remote = await fetchPlanAttachmentContent(att.id);
        blob = base64ToBlob(remote.contentBase64, remote.mimeType || att.mimeType);
        void putTaskFile({
          taskId: planFileKey(item.id),
          fileId: att.storedId,
          name: att.name,
          mimeType: att.mimeType,
          size: att.size,
          blob,
          addedAt: att.addedAt,
        });
      } catch (e) {
        alert(
          e instanceof ApiError
            ? e.message
            : "File not found. If this was uploaded before server storage, please re-upload it.",
        );
        return;
      }
    }
    if (!blob) {
      alert("File not found. Please re-upload the attachment.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = att.name;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const remove = async (att: PlanItemAttachment) => {
    if (readOnly) return;
    try {
      await deletePlanAttachmentRemote(att.id);
    } catch {
      /* still remove from plan metadata */
    }
    await deleteTaskFile(planFileKey(item.id), att.storedId);
    onChange((item.attachments ?? []).filter((a) => a.id !== att.id));
  };

  return (
    <div
      style={{
        marginTop: 10,
        paddingTop: 10,
        borderTop: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: "5px 10px", fontSize: "0.9375rem" }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading || readOnly}
          title={readOnly ? "Sprint is closed and locked" : undefined}
        >
          {uploading ? <WaitLabel>Uploading…</WaitLabel> : <><Paperclip size={13} /> Attach document</>}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTACHMENTS}
          style={{ display: "none" }}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <span style={{ fontSize: "1rem", color: "var(--text-primary)" }}>
          PDF, Word, Excel, images, video, txt, csv
        </span>
      </div>
      {error && <div style={{ fontSize: "0.9375rem", color: "#9B2F28" }}>{error}</div>}
      {(item.attachments ?? []).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(item.attachments ?? []).map((att) => (
            <div
              key={att.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 9px",
                borderRadius: 8,
                background: "rgba(148,125,100,0.08)",
                border: "1px solid rgba(148,125,100,0.2)",
              }}
            >
              <FileText size={18} style={{ color: "var(--bronze)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  title={att.name}
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--charcoal)",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {att.name}
                </div>
                <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                  {formatFileSize(att.size)} · {att.mimeType || "file"} · {att.addedAt}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "4px 8px", fontSize: "0.9375rem" }}
                onClick={() => void openOrDownload(att)}
                title="Download / open"
              >
                <Download size={13} />
              </button>
              {!readOnly && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "4px 8px", fontSize: "0.9375rem", color: "#9B2F28" }}
                onClick={() => void remove(att)}
                title="Remove"
              >
                <Trash2 size={13} />
              </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type SchedulePageProps = {
  onOpenTask?: (taskId: string) => void;
  onOpenTest?: (testId: string) => void;
  /** Open Admin Agenda tab after creating / when navigating. */
  onOpenAgenda?: () => void;
  authUser?: AuthUser | null;
};

export function SchedulePage({
  onOpenTask,
  onOpenTest,
  onOpenAgenda,
  authUser = null,
}: SchedulePageProps = {}) {
  const [agendaBusy, setAgendaBusy] = useState(false);
  const [agendaMsg, setAgendaMsg] = useState("");
  const actingAssignBy = auditActorLabel(authUser);
  const isAdmin = userHasAdminRole(authUser);
  const canBlockTests = canSetTestBlocked(authUser);
  const [tab, setTab] = useState<ScheduleTab>("board");
  const [activeSprint, setActiveSprint] = useState<SprintBoardSelection>(() =>
    currentSprintIndex(),
  );
  const [items, setItems] = useState<PlanItem[]>([]);
  const [tasks, setTasks] = useState<GyshTask[]>([]);
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({});
  const [testNotes, setTestNotes] = useState<Record<string, string>>({});
  const [testAssignees, setTestAssignees] = useState<Record<string, string>>({});
  const [testSprints, setTestSprints] = useState<Record<string, number>>({});
  const [testDueDates, setTestDueDates] = useState<Record<string, string>>({});
  const [testAssignedBy, setTestAssignedBy] = useState<Record<string, string>>({});
  const [testUpdatedAt, setTestUpdatedAt] = useState<Record<string, string>>({});
  const [testUpdatedBy, setTestUpdatedBy] = useState<Record<string, string>>({});
  const [retro, setRetro] = useState<RetroCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newOwner, setNewOwner] = useState<PlanOwner>("Unassigned");
  const [sourceFilter, setSourceFilter] = useState<BoardSourceFilter>("all");
  const [ownerFilter, setOwnerFilter] = useState<BoardOwnerFilter>("all");
  /** Assignor (Assigned By) — "all" | ASSIGN_BY_UNSET | partner label. */
  const [assignByFilter, setAssignByFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  /** Sprint placement: empty = all (in sprint + carry over). */
  const [sprintStatusFilters, setSprintStatusFilters] = useState<Set<SprintPlacementStatus>>(
    () => new Set(),
  );
  /** Task work progress: empty = all. Applies to task cards only. */
  const [workStatusFilters, setWorkStatusFilters] = useState<Set<string>>(() => new Set());
  /** Test progress: empty = all. Applies to test cards only. */
  const [testStatusFilters, setTestStatusFilters] = useState<Set<TestStatus>>(() => new Set());
  const [drafts, setDrafts] = useState<Record<string, CardDraft>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [bulkAssignBy, setBulkAssignBy] = useState("");
  const [bulkSprint, setBulkSprint] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [bulkDescription, setBulkDescription] = useState("");
  /** Structured notes drafts keyed by board card key (task:/test:…). */
  const [editNoteDrafts, setEditNoteDrafts] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [newNoteDrafts, setNewNoteDrafts] = useState<Record<string, string>>({});
  const assignByOptions = useMemo(
    () =>
      assignedBySelectOptions(
        actingAssignBy,
        ...tasks.map((t) => t.assignBy),
        ...Object.values(testAssignedBy),
      ),
    [actingAssignBy, tasks, testAssignedBy],
  );
  const [saveFlash, setSaveFlash] = useState("");
  const [endSprintOpen, setEndSprintOpen] = useState(false);
  /** Sprint index for EndSprintModal — set when opening Close from a bubble. */
  const [endSprintTarget, setEndSprintTarget] = useState<number | null>(null);
  const [closedSprints, setClosedSprints] = useState<Set<number>>(() => new Set());
  const [retroDraft, setRetroDraft] = useState<Record<RetroColumn, string>>({
    went_well: "",
    improve: "",
    action: "",
  });
  const timers = useActiveTimers(Boolean(authUser));
  const startingTimersRef = useRef(new Set<string>());

  const applyTestAudit = (data: Pick<TestStatusesPayload, "updatedAt" | "updatedBy">) => {
    setTestUpdatedAt(data.updatedAt ?? {});
    setTestUpdatedBy(data.updatedBy ?? {});
  };

  const sprints = useMemo(() => listUpcomingSprints(), []);
  const sprint0 = useMemo(() => getSprintWindow(0), []);
  const allSprintsNumericRange = useMemo(() => {
    if (sprints.length === 0) return "—";
    return formatNumericDateRange(sprints[0].start, sprints[sprints.length - 1].end);
  }, [sprints]);
  const selectedSprintIndex = isSprintIndex(activeSprint) ? activeSprint : 0;
  const ceremonies = useMemo(
    () => ceremoniesForSprint(getSprintWindow(selectedSprintIndex)),
    [selectedSprintIndex],
  );

  const boardCards = useMemo(() => {
    const planCards = items.map(planToBoardCard);
    const taskCards = tasks.filter((t) => !String(t.parentId || "").trim()).map(taskToBoardCard);
    const testCards = ALL_TESTS.map((t) =>
      testToBoardCard(t, testStatuses[t.id], testSprints[t.id], testAssignees[t.id], {
        updatedAt: testUpdatedAt[t.id],
        updatedBy: testUpdatedBy[t.id],
      }),
    );
    // Tests first in columns; tasks underneath (plan stays off the board face).
    return [...planCards, ...testCards, ...taskCards];
  }, [items, tasks, testStatuses, testSprints, testAssignees, testUpdatedAt, testUpdatedBy]);

  const cardsInSprint = (sprint: number) =>
    boardCards.filter((c) => c.sprint === sprint);

  /** Cards in the selected sprint/backlog/all-sprints (before type/owner/status filters). */
  const sprintOnlyCards = boardCards.filter((c) => {
    if (activeSprint === "backlog") return c.sprint === BACKLOG_SPRINT;
    if (activeSprint === "all") return !isBacklogSprint(c.sprint);
    return c.sprint === activeSprint;
  });

  const sprintScopedCards = sprintOnlyCards.filter((c) =>
    matchesSourceFilter(c.source, sourceFilter),
  );

  const toggleSprintStatusFilter = (status: SprintPlacementStatus) => {
    setSprintStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const toggleWorkStatusFilter = (status: string) => {
    setWorkStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const toggleTestStatusFilter = (status: TestStatus) => {
    setTestStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const [planData, taskList, testData, closedList] = await Promise.all([
        fetchAgilePlan(),
        fetchTasks(),
        fetchTestStatuses(),
        fetchClosedSprints().catch(() => [] as number[]),
      ]);
      setClosedSprints(new Set(closedList));

      let planItems = planData.items;
      let planRetro = planData.retro;
      if (planItems.length === 0) {
        planItems = buildDefaultPlanItems();
      }

      // Versioned soft fill only — never force-overwrite stored sprints on Schedule load.
      // Manual sprint edits persist; opt-in scripts may still force via mode: "force".
      let workingPlan = planItems;
      let workingTasks = taskList;
      let workingTestSprints = { ...testData.sprints };
      let workingTestDueDates = { ...(testData.dueDates ?? {}) };
      let needsRolloutPersist = false;
      let rolledPlanChanged = false;
      let rolledTasksChanged = false;
      let rolledTestBatch: Array<{
        caseId: string;
        status: TestStatus;
        note: string;
        assignee: string;
        sprint: number;
        dueDate: string;
      }> = [];
      const seen =
        typeof localStorage !== "undefined"
          ? localStorage.getItem(ROLLOUT_HEAL_STORAGE_KEY)
          : null;
      if (seen !== ROLLOUT_SCHEDULE_VERSION) {
        try {
          const rolled = applyRolloutSprintSchedule({
            planItems: workingPlan,
            tasks: workingTasks,
            tests: ROLLOUT_HEAL_TESTS,
            testSprints: workingTestSprints,
            testDueDates: workingTestDueDates,
            testStatuses: testData.statuses,
            mode: "preserve",
          });
          if (rolled.planChanged || rolled.tasksChanged || rolled.testChangedIds.length > 0) {
            workingPlan = rolled.planItems;
            workingTasks = rolled.tasks;
            workingTestSprints = rolled.testSprints;
            workingTestDueDates = rolled.testDueDates;
            rolledPlanChanged = rolled.planChanged;
            rolledTasksChanged = rolled.tasksChanged;
            if (rolled.testChangedIds.length > 0) {
              rolledTestBatch = rolled.testChangedIds.map((caseId) => ({
                caseId,
                status: (testData.statuses[caseId] ?? "not_run") as TestStatus,
                note: (testData.notes[caseId] ?? "").trim(),
                assignee: testData.assignees?.[caseId] ?? "",
                sprint: rolled.testSprints[caseId] ?? BACKLOG_SPRINT,
                dueDate: rolled.testDueDates[caseId] ?? "",
              }));
            }
            needsRolloutPersist = true;
          }
        } catch {
          /* keep loaded state */
        } finally {
          // Gate even when persist fails (e.g. locked Sprint 0 → 403) so login
          // does not re-run a thousand-row heal and hang on "Loading sprint board…".
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(ROLLOUT_HEAL_STORAGE_KEY, ROLLOUT_SCHEDULE_VERSION);
          }
        }
      }

      // Heal stale backlog task/plan owners (tests may keep a person assignee).
      const healedPlan = sanitizeBacklogPlanOwners(workingPlan);
      const healedTasks = sanitizeBacklogTaskAssignees(workingTasks);
      const healedTests = sanitizeBacklogTestAssignees(
        workingTestSprints,
        testData.assignees ?? {},
      );
      const nextSprints: Record<string, number> = { ...workingTestSprints };
      for (const t of ALL_TESTS) {
        if (nextSprints[t.id] === undefined) {
          nextSprints[t.id] = testToBoardCard(t, testData.statuses[t.id], undefined).sprint;
        }
      }

      setRetro(planRetro);
      setItems(healedPlan.items);
      setTasks(healedTasks.tasks);
      setTestStatuses(testData.statuses);
      setTestNotes(testData.notes);
      setTestAssignedBy(testData.assignedBy ?? {});
      applyTestAudit(testData);
      setTestAssignees(healedTests.assignees);
      setTestDueDates(workingTestDueDates);
      setTestSprints(nextSprints);
      // Fresh load is the new baseline — discard any staged card edits.
      setDrafts({});
      // Show the board immediately; background heals must not block login.
      setLoading(false);

      const persistSeedPlan = planData.items.length === 0;
      void (async () => {
        try {
          if (persistSeedPlan) {
            try {
              const saved = await persistAgilePlan(healedPlan.items, planRetro);
              setItems(saved.items);
              setRetro(saved.retro);
              planRetro = saved.retro;
            } catch {
              /* keep local seed */
            }
          }
          if (needsRolloutPersist) {
            if (rolledPlanChanged) {
              try {
                const saved = await persistAgilePlan(healedPlan.items, planRetro);
                setItems(saved.items);
                setRetro(saved.retro);
                planRetro = saved.retro;
              } catch {
                /* locked / forbidden — UI already has in-memory heal */
              }
            }
            if (rolledTasksChanged) {
              try {
                setTasks(await persistTasks(healedTasks.tasks));
              } catch {
                /* keep healed local state */
              }
            }
            if (rolledTestBatch.length > 0) {
              try {
                const data = await saveTestStatusesBatch(rolledTestBatch);
                setTestAssignees({ ...healedTests.assignees, ...data.assignees });
                setTestStatuses(data.statuses);
                setTestNotes(data.notes);
                setTestSprints({ ...nextSprints, ...data.sprints });
                setTestDueDates({ ...workingTestDueDates, ...data.dueDates });
                setTestAssignedBy((prev) => ({ ...prev, ...(data.assignedBy ?? {}) }));
                applyTestAudit(data);
              } catch {
                /* locked sprint rows often 403 — do not block the board */
              }
            }
          }
          if (healedPlan.changed && !rolledPlanChanged && !persistSeedPlan) {
            try {
              const saved = await persistAgilePlan(healedPlan.items, planRetro);
              setItems(saved.items);
              setRetro(saved.retro);
            } catch {
              /* keep healed local state */
            }
          }
          if (healedTasks.changed && !rolledTasksChanged) {
            try {
              setTasks(await persistTasks(healedTasks.tasks));
            } catch {
              /* keep healed local state */
            }
          }
          if (healedTests.changedIds.length > 0 && rolledTestBatch.length === 0) {
            try {
              const batch = healedTests.changedIds.map((caseId) => ({
                caseId,
                status: (testData.statuses[caseId] ?? "not_run") as TestStatus,
                note: (testData.notes[caseId] ?? "").trim(),
                assignee: "",
                sprint: workingTestSprints[caseId] ?? BACKLOG_SPRINT,
                dueDate: workingTestDueDates[caseId] ?? "",
              }));
              const data = await saveTestStatusesBatch(batch);
              setTestStatuses(data.statuses);
              setTestNotes(data.notes);
              setTestAssignees({ ...healedTests.assignees, ...data.assignees });
              setTestSprints({ ...nextSprints, ...data.sprints });
              setTestDueDates({ ...workingTestDueDates, ...data.dueDates });
              setTestAssignedBy((prev) => ({ ...prev, ...(data.assignedBy ?? {}) }));
              applyTestAudit(data);
            } catch {
              /* keep healed local state */
            }
          }
        } catch {
          /* never leave the board blocked on background sync */
        }
      })();
    } catch (e) {
      setItems(buildDefaultPlanItems());
      setTasks([]);
      setRetro([]);
      setError(
        e instanceof ApiError
          ? e.message
          : "Failed to load sprint board. Showing local seed where possible.",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const persistPlan = async (nextItems: PlanItem[], nextRetro: RetroCard[]) => {
    setBusy(true);
    setError("");
    try {
      const saved = await persistAgilePlan(nextItems, nextRetro);
      setItems(saved.items);
      setRetro(saved.retro);
    } catch (e) {
      // Keep prior D1-backed state — do not pretend a failed save succeeded.
      setError(e instanceof ApiError ? e.message : "Could not save plan items.");
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const patchPlanAttachments = async (
    id: string,
    attachments: PlanItemAttachment[],
  ) => {
    const item = items.find((i) => i.id === id);
    if (item && isSprintLocked(closedSprints, item.sprint)) {
      setError(sprintLockedMessage(item.sprint));
      return;
    }
    const next = items.map((i) => (i.id === id ? { ...i, attachments } : i));
    await persistPlan(next, retro);
  };

  const togglePartnerDone = async (
    card: BoardCard,
    partner: "tina" | "evelyn",
  ) => {
    if (isSprintLocked(closedSprints, card.sprint)) {
      setError(sprintLockedMessage(card.sprint));
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (card.source === "plan") {
        const item = items.find((i) => i.id === card.sourceId);
        if (!item) return;
        const patch =
          partner === "tina"
            ? { tinaDone: !item.tinaDone }
            : { evelynDone: !item.evelynDone };
        const next = items.map((i) =>
          i.id === card.sourceId ? applyPlanPartnerDone(i, patch) : i,
        );
        await persistPlan(next, retro);
      } else if (card.source === "task") {
        const task = tasks.find((t) => t.id === card.sourceId);
        if (!task) return;
        const patch =
          partner === "tina"
            ? { tinaDone: !task.tinaDone }
            : { evelynDone: !task.evelynDone };
        const next = tasks.map((t) =>
          t.id === card.sourceId ? applyPartnerDone(t, patch) : t,
        );
        setTasks(await persistTasks(next));
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update partner done.");
    } finally {
      setBusy(false);
    }
  };

  /** Raw control value (tasks: display name; tests: lowercase QA id). */
  const cardAssigneeValue = (card: BoardCard): string => {
    const sprint = cardSprintValue(card);
    const draft = drafts[card.key]?.assignee;
    if (draft !== undefined) return draft;
    // Tasks/plan on backlog are always Unassigned. Tests may keep a person.
    if (isBacklogSprint(sprint) && card.source !== "test") {
      return UNASSIGNED_OWNER;
    }
    if (card.source === "test") {
      return testAssignees[card.sourceId] || TEST_DEFAULT_ASSIGNEES[card.sourceId] || "";
    }
    return card.owner;
  };

  /** Display/filter assignee — uses board owner (Both/multi) when no draft override. */
  const cardAssigneeFilterValue = (card: BoardCard): string => {
    const sprint = cardSprintValue(card);
    const draft = drafts[card.key]?.assignee;
    if (draft !== undefined) return normalizeProgressAssignee(draft);
    if (isBacklogSprint(sprint) && card.source !== "test") {
      return UNASSIGNED_OWNER;
    }
    if (isBacklogSprint(sprint) && card.source === "test") {
      const raw = testAssignees[card.sourceId] || "";
      return raw ? normalizeProgressAssignee(raw) : UNASSIGNED_OWNER;
    }
    return card.owner;
  };

  /** Tasks: assignBy · Tests: assignedBy. Empty for plan cards. */
  const cardAssignByValue = (card: BoardCard): string => {
    if (card.source === "plan") return "";
    const draft = drafts[card.key]?.assignBy;
    if (draft !== undefined) return draft;
    if (card.source === "task") {
      return tasks.find((t) => t.id === card.sourceId)?.assignBy?.trim() || "";
    }
    return testAssignedBy[card.sourceId]?.trim() || SYSTEM_ASSIGNED_BY;
  };

  const cardStatusValue = (card: BoardCard): string => {
    const draft = drafts[card.key]?.status;
    if (draft !== undefined) return draft;
    if (card.source === "test") return testStatuses[card.sourceId] ?? "not_run";
    if (card.source === "task") {
      if (card.status === "todo") return "not_started";
      if (card.status === "blocked") return "blocked";
      if (card.status === "done") return "done";
      return "in_progress";
    }
    return card.status;
  };

  const cardSprintValue = (card: BoardCard): number => {
    const draft = drafts[card.key]?.sprint;
    if (draft !== undefined) return draft;
    return card.sprint;
  };

  /** Stored notes string (JSON thread for tasks/tests; plain for plan). */
  const cardStoredNotes = (card: BoardCard): string => {
    if (card.source === "test") return testNotes[card.sourceId] ?? "";
    if (card.source === "task") {
      return tasks.find((t) => t.id === card.sourceId)?.notes ?? "";
    }
    if (card.source === "plan") {
      return items.find((i) => i.id === card.sourceId)?.notes ?? "";
    }
    return "";
  };

  /** Plan-only plain note draft (tasks/tests use NotesThread drafts). */
  const cardNoteValue = (card: BoardCard): string => {
    const draft = drafts[card.key]?.note;
    if (draft !== undefined) return draft;
    return cardStoredNotes(card);
  };

  const priorNoteAttributionForCard = (card: BoardCard): PriorNoteAttribution => {
    if (card.source === "task") {
      const task = tasks.find((t) => t.id === card.sourceId);
      return {
        author: (task?.updatedBy || task?.assignBy || "").trim() || undefined,
        at: (task?.updatedAt || "").trim() || undefined,
      };
    }
    if (card.source === "test") {
      return {
        author: (testUpdatedBy[card.sourceId] || testAssignedBy[card.sourceId] || "").trim() || undefined,
        at: (testUpdatedAt[card.sourceId] || "").trim() || undefined,
      };
    }
    return {};
  };

  /** Compose task/test notes from stored + UI drafts (+ optional bulk draft.note base). */
  const composedNotesForCard = (card: BoardCard, draftNote?: string): string => {
    if (card.source === "plan") {
      return draftNote !== undefined ? draftNote : cardNoteValue(card);
    }
    const base = draftNote !== undefined ? draftNote : cardStoredNotes(card);
    return applyNoteDrafts(
      base,
      actingAssignBy,
      editNoteDrafts[card.key],
      newNoteDrafts[card.key],
      undefined,
      priorNoteAttributionForCard(card),
    );
  };

  const cardNotesDirty = (key: string, storedRaw: string): boolean =>
    notesHaveUnsavedDraft(
      storedRaw,
      actingAssignBy,
      editNoteDrafts[key],
      newNoteDrafts[key],
    );

  const setBoardNewNoteDraft = (key: string, text: string) => {
    setNewNoteDrafts((prev) => ({ ...prev, [key]: text }));
  };

  const setBoardEditNoteDraft = (key: string, noteId: string, text: string) => {
    setEditNoteDrafts((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), [noteId]: text },
    }));
  };

  const clearBoardNoteDrafts = (key: string) => {
    setNewNoteDrafts((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setEditNoteDrafts((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  /** Due date as MM/DD/YY for drafts; empty when unset. */
  const cardDueDateValue = (card: BoardCard): string => {
    const draft = drafts[card.key]?.dueDate;
    if (draft !== undefined) return draft;
    if (card.source === "task") {
      return tasks.find((t) => t.id === card.sourceId)?.dueDate ?? "";
    }
    if (card.source === "test") {
      return testDueDates[card.sourceId] ?? "";
    }
    if (card.source === "plan") {
      const item = items.find((i) => i.id === card.sourceId);
      if (!item?.date) return "";
      return isoToMmddyy(item.date) || "";
    }
    return "";
  };

  /**
   * Status chip tallies follow the selected assignee (and type/sprint).
   * Do not apply status filters here — otherwise other status chips would go to zero.
   */
  const statusCountCards = sprintScopedCards.filter((c) => {
    if (activeSprint === "backlog") return true;
    return matchesAssigneeFilter(cardAssigneeFilterValue(c), ownerFilter);
  });

  /** Tests/tasks that rolled out of the focused sprint (may now sit on the next sprint). */
  const rolledRelativeToActiveSprint = (c: BoardCard): boolean => {
    if (typeof activeSprint !== "number") return false;
    if (c.source === "test") {
      return itemRolledRelativeToSprint(
        testSprints[c.sourceId] ?? c.sprint,
        testNotes[c.sourceId],
        activeSprint,
        testStatuses[c.sourceId],
      );
    }
    if (c.source === "task") {
      const task = tasks.find((t) => t.id === c.sourceId);
      return itemRolledRelativeToSprint(
        task?.sprint ?? c.sprint,
        task?.notes,
        activeSprint,
      );
    }
    return false;
  };

  /** Any End Sprint / rolled_over marker on a board card (orthogonal to work status). */
  const cardIsRolledOver = (c: BoardCard): boolean => {
    if (c.source === "test") {
      return testIsRolledOver(testStatuses[c.sourceId], testNotes[c.sourceId]);
    }
    if (c.source === "task") {
      const task = tasks.find((t) => t.id === c.sourceId);
      return noteIndicatesRollover(task?.notes);
    }
    return false;
  };

  const rolledBreakdown = (cards: BoardCard[]) => {
    let tasksRolled = 0;
    let testsRolled = 0;
    for (const c of cards) {
      if (!cardIsRolledOver(c)) continue;
      if (c.source === "task") tasksRolled += 1;
      else if (c.source === "test") testsRolled += 1;
    }
    return { tasksRolled, testsRolled, total: tasksRolled + testsRolled };
  };

  /** When filtering Rolled Over on a sprint, include outbound items that already moved forward. */
  const boardCardsForView = (() => {
    const wantTestRoll =
      typeof activeSprint === "number" &&
      testStatusFilters.has("rolled_over") &&
      matchesSourceFilter("test", sourceFilter);
    const wantTaskRoll =
      typeof activeSprint === "number" &&
      workStatusFilters.has("rolled_over") &&
      matchesSourceFilter("task", sourceFilter);
    if (!wantTestRoll && !wantTaskRoll) return sprintScopedCards;
    const seen = new Set(sprintScopedCards.map((c) => c.key));
    const extras = boardCards.filter((c) => {
      if (seen.has(c.key)) return false;
      if (!matchesSourceFilter(c.source, sourceFilter)) return false;
      if (c.source === "test" && !wantTestRoll) return false;
      if (c.source === "task" && !wantTaskRoll) return false;
      if (c.source !== "test" && c.source !== "task") return false;
      return rolledRelativeToActiveSprint(c);
    });
    return extras.length ? [...sprintScopedCards, ...extras] : sprintScopedCards;
  })();

  const visibleCards = boardCardsForView.filter((c) => {
    const assignee = cardAssigneeFilterValue(c);
    const assignBy = cardAssignByValue(c);
    const status = cardStatusValue(c);
    // Backlog never has person assignees — skip assignee facet there.
    if (activeSprint !== "backlog" && !matchesAssigneeFilter(assignee, ownerFilter)) return false;
    if (!matchesAssignByFilter(assignBy, assignByFilter)) return false;
    if (sprintStatusFilters.size > 0 && !sprintStatusFilters.has(cardSprintPlacement(c))) {
      return false;
    }
    if (c.source === "task" && workStatusFilters.size > 0) {
      const work = cardWorkStatus(c);
      // Carry-over has no work status — use Sprint status filter for those cards.
      // Rolled Over is orthogonal via End Sprint note (same as tests).
      const matchesRolled =
        workStatusFilters.has("rolled_over") && rolledRelativeToActiveSprint(c);
      if (work === null) {
        if (!matchesRolled) return false;
      } else if (!workStatusFilters.has(work) && !matchesRolled) {
        return false;
      }
    }
    if (c.source === "test" && testStatusFilters.size > 0) {
      const st = (testStatuses[c.sourceId] ?? "not_run") as TestStatus;
      const matchesStatus = testStatusFilters.has(st);
      // Work status may still be Fail / Fixed/Cursor — Rolled Over is orthogonal via note.
      const matchesRolled =
        testStatusFilters.has("rolled_over") && rolledRelativeToActiveSprint(c);
      if (!matchesStatus && !matchesRolled) return false;
    }
    if (
      !boardCardMatchesSearch(c, searchQuery, {
        assignee: assignee || UNASSIGNED_OWNER,
        assignBy,
        status,
      })
    ) {
      return false;
    }
    return true;
  });

  const isCardDirty = (key: string) => {
    const d = drafts[key];
    const fieldDirty = Boolean(
      d &&
        (d.assignee !== undefined ||
          d.status !== undefined ||
          d.sprint !== undefined ||
          d.note !== undefined ||
          d.dueDate !== undefined ||
          d.assignBy !== undefined),
    );
    if (fieldDirty) return true;
    const card = boardCards.find((c) => c.key === key);
    if (!card || card.source === "plan") return false;
    return cardNotesDirty(key, cardStoredNotes(card));
  };

  /** Stage a field change as a dirty draft — persists only on Save / Save all. */
  const stageCardDraft = (card: BoardCard, patch: CardDraft) => {
    const nextPatch: CardDraft = { ...patch };
    // Tasks/plan on backlog are always Unassigned. Tests may keep a person assignee.
    if (
      nextPatch.sprint !== undefined &&
      isBacklogSprint(nextPatch.sprint) &&
      nextPatch.assignee === undefined &&
      card.source !== "test"
    ) {
      nextPatch.assignee = UNASSIGNED_OWNER;
    }
    setDrafts((prev) => ({
      ...prev,
      [card.key]: { ...prev[card.key], ...nextPatch },
    }));
  };

  const clearDraft = (key: string) => {
    setDrafts((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    clearBoardNoteDrafts(key);
  };

  const dirtyCount = boardCards.filter((c) => isCardDirty(c.key)).length;

  const filtersAreAll =
    sourceFilter === "all" &&
    ownerFilter === "all" &&
    assignByFilter === "all" &&
    !searchQuery.trim() &&
    sprintStatusFilters.size === 0 &&
    workStatusFilters.size === 0 &&
    testStatusFilters.size === 0;

  const bulkStagingActive = Boolean(
    bulkAssignee ||
      bulkAssignBy ||
      bulkSprint !== "" ||
      bulkStatus ||
      bulkDueDate ||
      bulkDescription.trim(),
  );

  /** Discard unsaved card edits / bulk staging and set all filters to All — no server fetch. */
  const resetDrafts = () => {
    const hadDrafts = dirtyCount > 0 || Boolean(newTitle.trim()) || bulkStagingActive;
    if (!hadDrafts && filtersAreAll) return;
    if (hadDrafts) {
      setDrafts({});
      setNewTitle("");
      setBulkAssignee("");
      setBulkAssignBy("");
      setBulkSprint("");
      setBulkStatus("");
      setBulkDueDate("");
      setBulkDescription("");
      setEditNoteDrafts({});
      setNewNoteDrafts({});
    }
    setSourceFilter("all");
    setOwnerFilter("all");
    setAssignByFilter("all");
    setSearchQuery("");
    setSprintStatusFilters(new Set());
    setWorkStatusFilters(new Set());
    setTestStatusFilters(new Set());
    setSaveFlash(
      hadDrafts
        ? "Reset — unsaved edits discarded; filters set to All"
        : "Reset — filters set to All",
    );
    window.setTimeout(() => setSaveFlash(""), 2000);
  };

  const maybeStartCardTimer = async (card: BoardCard) => {
    if (card.source !== "test" && card.source !== "task") return;
    if (!authUser) return;
    const terminal =
      card.source === "test"
        ? ["pass", "conditional_approval", "fail", "blocked"].includes(cardStatusValue(card))
        : cardStatusValue(card) === "done";
    if (terminal) return;
    const source = card.source;
    const existing = timers.entryFor(source, card.sourceId);
    if (existing?.status === "running" || existing?.status === "paused") return;
    const lockKey = `${source}:${card.sourceId}`;
    if (startingTimersRef.current.has(lockKey)) return;
    startingTimersRef.current.add(lockKey);
    try {
      await ensureWorkTimerStarted({
        source,
        sourceId: card.sourceId,
        sourceLabel: card.title,
      });
      void timers.refresh();
    } finally {
      startingTimersRef.current.delete(lockKey);
    }
  };

  const toggleSelectCard = (key: string) => {
    const selecting = !selectedKeys.has(key);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (selecting) next.add(key);
      else next.delete(key);
      return next;
    });
    if (selecting) {
      const card = visibleCards.find((c) => c.key === key);
      if (card) void maybeStartCardTimer(card);
    }
  };

  const toggleSelectAllVisible = () => {
    setSelectedKeys((prev) => {
      const allSelected =
        visibleCards.length > 0 && visibleCards.every((c) => prev.has(c.key));
      if (allSelected) return new Set();
      return new Set(visibleCards.map((c) => c.key));
    });
  };

  const saveCard = async (card: BoardCard, draftOverride?: CardDraft): Promise<boolean> => {
    const draft = { ...(drafts[card.key] ?? {}), ...(draftOverride ?? {}) };
    const status = draft.status !== undefined ? draft.status : cardStatusValue(card);
    const sprint = draft.sprint !== undefined ? draft.sprint : cardSprintValue(card);
    if (isSprintLocked(closedSprints, card.sprint) || isSprintLocked(closedSprints, sprint)) {
      setError(
        sprintLockedMessage(
          isSprintLocked(closedSprints, card.sprint) ? card.sprint : sprint,
        ),
      );
      return false;
    }
    const note =
      card.source === "plan"
        ? draft.note !== undefined
          ? draft.note
          : cardNoteValue(card)
        : composedNotesForCard(card, draft.note);
    const notesChanged =
      card.source === "plan"
        ? draft.note !== undefined
        : draft.note !== undefined ||
          cardNotesDirty(card.key, cardStoredNotes(card));
    const requestedAssignee =
      draft.assignee !== undefined ? draft.assignee : cardAssigneeValue(card);
    // Automated suite owners stay locked in committed sprints.
    let assignee =
      card.source === "test" &&
      isAutomatedTestId(card.sourceId) &&
      !isBacklogSprint(sprint)
        ? TEST_DEFAULT_ASSIGNEES[card.sourceId] ||
          (card.sourceId.startsWith("PW-") ? "playwright" : "vitest")
        : requestedAssignee;
    if (isBacklogSprint(sprint)) {
      assignee = assigneeForBacklogSprint(
        sprint,
        card.source === "test" ? "test" : card.source === "plan" ? "plan" : "task",
        assignee,
      );
    }

    setBusy(true);
    setError("");
    try {
      if (card.source === "plan") {
        const item = items.find((i) => i.id === card.sourceId);
        if (!item) return false;
        if (requiresPartnerDone(assignee) || requiresPartnerDone(item.owner)) {
          const tinaDone = item.tinaDone;
          const evelynDone = item.evelynDone;
          if (status === "done" && !(tinaDone && evelynDone) && requiresPartnerDone(item.owner)) {
            setError("Both T + E must mark Done before this plan item can be Done.");
            return false;
          }
        }
        const dueFromDraft =
          draft.dueDate !== undefined ? parseMMDDYY(draft.dueDate) : null;
        const sw = sprint === BACKLOG_SPRINT ? null : getSprintWindow(sprint);
        const next = items.map((i) =>
          i.id === card.sourceId
            ? applyPlanPartnerDone(
                {
                  ...i,
                  ...withBacklogPlanUnassigned(
                    {
                      owner: assignee as PlanOwner,
                      sprint,
                    },
                    item.sprint,
                  ),
                  ...(dueFromDraft
                    ? {
                        date: mmddyyToIso(draft.dueDate!),
                        dateLabel: formatDisplayDate(dueFromDraft),
                      }
                    : {
                        dateLabel: sw ? sw.label : "Backlog",
                        date: sw ? sw.start.toISOString().slice(0, 10) : "",
                      }),
                  ...(draft.note !== undefined ? { notes: draft.note } : {}),
                },
                { status: status as PlanItemStatus },
              )
            : i,
        );
        await persistPlan(next, retro);
      } else if (card.source === "task") {
        const task = tasks.find((t) => t.id === card.sourceId);
        if (!task) return false;
        if (
          (requiresPartnerDone(assignee) || requiresPartnerDone(task.assignedTo)) &&
          status === "done" &&
          !(task.tinaDone && task.evelynDone) &&
          requiresPartnerDone(task.assignedTo)
        ) {
          setError("Both T + E must mark Done before this task can be Done.");
          return false;
        }
        const sprintChanged = draft.sprint !== undefined && draft.sprint !== card.sprint;
        const resolvedAssignee = assigneeForBacklogSprint(
          sprint,
          "task",
          assignee,
        ) as GyshTask["assignedTo"];
        const assigneeChanged = task.assignedTo !== resolvedAssignee;
        const taskPatch = withBacklogTaskUnassigned(
          withSprintDueDate({
            assignedTo: resolvedAssignee,
            sprint,
            ...(draft.assignBy !== undefined
              ? { assignBy: draft.assignBy }
              : assigneeChanged
                ? { assignBy: actingAssignBy }
                : {}),
          }),
          task.sprint,
        );
        const nextDue =
          draft.dueDate !== undefined
            ? draft.dueDate
            : sprintChanged
              ? dueDateForSprint(sprint) || task.dueDate
              : task.dueDate;
        const next = tasks.map((t) =>
          t.id === card.sourceId
            ? applyPartnerDone(
                {
                  ...t,
                  ...taskPatch,
                  dueDate: nextDue,
                  ...(notesChanged ? { notes: note } : {}),
                },
                { status: status as TaskStatus },
              )
            : t,
        );
        setTasks(await persistTasks(next));
      } else {
        const st = status as TestStatus;
        if (st === "blocked" && !canBlockTests && (testStatuses[card.sourceId] ?? "not_run") !== "blocked") {
          setError("Only Evelyn may set a test to Blocked.");
          return false;
        }
        if (statusRequiresNote(st) && !noteMeetsRequirement(note)) {
          setError(
            `Add a short note on the card (or in Testing Portal) before marking ${TEST_STATUS_LABELS[st]}.`,
          );
          return false;
        }
        const sprintChanged = draft.sprint !== undefined && draft.sprint !== card.sprint;
        const dueDate =
          draft.dueDate !== undefined
            ? draft.dueDate
            : sprintChanged
              ? dueDateForSprint(sprint)
              : (testDueDates[card.sourceId] ?? dueDateForSprint(sprint));
        const resolvedAssignee = assigneeForBacklogSprint(sprint, "test", assignee);
        const prevAssignee = testAssignees[card.sourceId] || "";
        const assigneeChanged =
          String(resolvedAssignee || "").trim() !== String(prevAssignee || "").trim();
        const stepCount = Array.isArray(
          ALL_TESTS.find((t) => t.id === card.sourceId)?.steps,
        )
          ? (ALL_TESTS.find((t) => t.id === card.sourceId)?.steps.length ?? 0)
          : 0;
        const clearChecklist = st === "fixed_retest" || st === "failed_retest";
        const data = await saveTestStatus(card.sourceId, st, note.trim(), resolvedAssignee, sprint, {
          dueDate,
          ...(clearChecklist && stepCount > 0
            ? {
                stepCount,
                checkedSteps: Array.from({ length: stepCount }, () => false),
                failedStepIndex: null,
              }
            : {}),
          ...(draft.assignBy !== undefined
            ? { assignedBy: draft.assignBy }
            : assigneeChanged
              ? { assignedBy: actingAssignBy, dateAssigned: assignmentToday() }
              : {}),
        });
        setTestStatuses(data.statuses);
        setTestNotes(data.notes);
        setTestAssignees({ ...testAssignees, ...data.assignees, [card.sourceId]: resolvedAssignee });
        setTestSprints({ ...testSprints, ...data.sprints, [card.sourceId]: sprint });
        setTestDueDates({ ...testDueDates, ...data.dueDates, [card.sourceId]: dueDate });
        setTestAssignedBy((prev) => ({ ...prev, ...(data.assignedBy ?? {}) }));
        applyTestAudit(data);
      }
      clearDraft(card.key);
      if (
        (card.source === "test" || card.source === "task") &&
        draft.status !== undefined &&
        draft.status !== card.status
      ) {
        const nextStatus = String(draft.status);
        const testDone =
          card.source === "test" &&
          ["pass", "conditional_approval", "fail", "blocked"].includes(nextStatus);
        const taskDone = card.source === "task" && nextStatus === "done";
        if (testDone || taskDone) {
          await completeWorkTimer({
            source: card.source,
            sourceId: card.sourceId,
            sourceLabel: card.title,
          });
        } else if (nextStatus !== "not_run" && nextStatus !== "todo" && nextStatus !== "not_started") {
          await ensureWorkTimerStarted({
            source: card.source,
            sourceId: card.sourceId,
            sourceLabel: card.title,
          });
        } else {
          await stopTimerOnStatusChange(card.source, card.sourceId);
        }
        void timers.refresh();
      }
      setSaveFlash(`Saved ${card.sourceId}`);
      window.setTimeout(() => setSaveFlash(""), 2000);
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save card.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const persistDraftMap = async (draftMap: Record<string, CardDraft>) => {
    const dirtyCards = boardCards.filter((c) => {
      const d = draftMap[c.key];
      const fieldDirty = Boolean(
        d &&
          (d.assignee !== undefined ||
            d.status !== undefined ||
            d.sprint !== undefined ||
            d.note !== undefined ||
            d.dueDate !== undefined ||
            d.assignBy !== undefined),
      );
      if (fieldDirty) return true;
      if (c.source === "plan") return false;
      return cardNotesDirty(c.key, cardStoredNotes(c));
    });
    if (dirtyCards.length === 0) {
      setSaveFlash("Nothing to save");
      window.setTimeout(() => setSaveFlash(""), 2000);
      return;
    }

    setBusy(true);
    setError("");
    try {
      let nextItems = items;
      let nextTasks = tasks;
      let planChanged = false;
      let tasksChanged = false;
      let nextAssignees = { ...testAssignees };
      let nextSprints = { ...testSprints };
      const testBatch: Array<{
        caseId: string;
        status: TestStatus;
        note?: string;
        assignee?: string;
        sprint?: number;
        dueDate?: string;
        assignedBy?: string;
        dateAssigned?: string;
      }> = [];
      let nextDueDates = { ...testDueDates };
      let nextAssignedBy = { ...testAssignedBy };

      for (const card of dirtyCards) {
        const draft = draftMap[card.key] ?? {};
        const sprint = draft.sprint !== undefined ? draft.sprint : card.sprint;
        if (isSprintLocked(closedSprints, card.sprint) || isSprintLocked(closedSprints, sprint)) {
          throw new ApiError(
            sprintLockedMessage(
              isSprintLocked(closedSprints, card.sprint) ? card.sprint : sprint,
            ),
            403,
          );
        }
        let assignee =
          draft.assignee !== undefined
            ? draft.assignee
            : card.source === "test"
              ? testAssignees[card.sourceId] || TEST_DEFAULT_ASSIGNEES[card.sourceId] || ""
              : card.owner;
        if (isBacklogSprint(sprint)) {
          assignee = assigneeForBacklogSprint(
            sprint,
            card.source === "test" ? "test" : card.source === "plan" ? "plan" : "task",
            assignee,
          );
        }
        const status =
          draft.status !== undefined
            ? draft.status
            : card.source === "test"
              ? (testStatuses[card.sourceId] ?? "not_run")
              : card.source === "task"
                ? card.status === "todo"
                  ? "not_started"
                  : card.status === "blocked"
                    ? "blocked"
                    : card.status === "done"
                      ? "done"
                      : "in_progress"
                : card.status;
        const note =
          card.source === "plan"
            ? draft.note !== undefined
              ? draft.note
              : cardNoteValue(card)
            : composedNotesForCard(card, draft.note);
        const notesChanged =
          card.source === "plan"
            ? draft.note !== undefined
            : draft.note !== undefined ||
              cardNotesDirty(card.key, cardStoredNotes(card));
        const sprintChanged = draft.sprint !== undefined && draft.sprint !== card.sprint;

        if (card.source === "plan") {
          const dueFromDraft =
            draft.dueDate !== undefined ? parseMMDDYY(draft.dueDate) : null;
          const sw = sprint === BACKLOG_SPRINT ? null : getSprintWindow(sprint);
          nextItems = nextItems.map((i) =>
            i.id === card.sourceId
              ? applyPlanPartnerDone(
                  {
                    ...i,
                    ...withBacklogPlanUnassigned(
                      {
                        owner: assignee as PlanOwner,
                        sprint,
                      },
                      items.find((x) => x.id === card.sourceId)?.sprint,
                    ),
                    ...(dueFromDraft
                      ? {
                          date: mmddyyToIso(draft.dueDate!),
                          dateLabel: formatDisplayDate(dueFromDraft),
                        }
                      : {
                          dateLabel: sw ? sw.label : "Backlog",
                          date: sw ? sw.start.toISOString().slice(0, 10) : "",
                        }),
                    ...(notesChanged ? { notes: note } : {}),
                  },
                  { status: status as PlanItemStatus },
                )
              : i,
          );
          planChanged = true;
        } else if (card.source === "task") {
          const prevTask = nextTasks.find((t) => t.id === card.sourceId);
          const resolvedAssignee = assigneeForBacklogSprint(
            sprint,
            "task",
            assignee,
          ) as GyshTask["assignedTo"];
          const assigneeChanged = prevTask ? prevTask.assignedTo !== resolvedAssignee : true;
          nextTasks = nextTasks.map((t) =>
            t.id === card.sourceId
              ? applyPartnerDone(
                  {
                    ...t,
                    ...withBacklogTaskUnassigned(
                      {
                        assignedTo: resolvedAssignee,
                        sprint,
                        ...(draft.assignBy !== undefined
                          ? { assignBy: draft.assignBy }
                          : assigneeChanged
                            ? { assignBy: actingAssignBy }
                            : {}),
                      },
                      prevTask?.sprint,
                    ),
                    dueDate:
                      draft.dueDate !== undefined
                        ? draft.dueDate
                        : sprintChanged
                          ? dueDateForSprint(sprint) || t.dueDate
                          : t.dueDate,
                    ...(notesChanged ? { notes: note } : {}),
                  },
                  { status: status as TaskStatus },
                )
              : t,
          );
          tasksChanged = true;
        } else {
          const st = status as TestStatus;
          if (statusRequiresNote(st) && !noteMeetsRequirement(note)) {
            setError(
              `${card.sourceId}: add a note before marking ${TEST_STATUS_LABELS[st]}.`,
            );
            setBusy(false);
            return;
          }
          const dueDate =
            draft.dueDate !== undefined
              ? draft.dueDate
              : sprintChanged
                ? dueDateForSprint(sprint)
                : (testDueDates[card.sourceId] ?? dueDateForSprint(sprint));
          const resolvedAssignee = assigneeForBacklogSprint(sprint, "test", assignee);
          const prevAssignee = testAssignees[card.sourceId] || nextAssignees[card.sourceId] || "";
          const assigneeChanged =
            String(resolvedAssignee || "").trim() !== String(prevAssignee || "").trim();
          const assignorPatch =
            draft.assignBy !== undefined
              ? { assignedBy: draft.assignBy }
              : assigneeChanged
                ? { assignedBy: actingAssignBy, dateAssigned: assignmentToday() }
                : {};
          testBatch.push({
            caseId: card.sourceId,
            status: st,
            note: note.trim(),
            assignee: resolvedAssignee,
            sprint,
            dueDate,
            ...assignorPatch,
          });
          nextAssignees[card.sourceId] = resolvedAssignee;
          nextSprints[card.sourceId] = sprint;
          nextDueDates[card.sourceId] = dueDate;
          if (assignorPatch.assignedBy !== undefined) {
            nextAssignedBy[card.sourceId] = assignorPatch.assignedBy;
          }
        }
      }

      if (planChanged) await persistPlan(nextItems, retro);
      if (tasksChanged) setTasks(await persistTasks(nextTasks));
      if (testBatch.length > 0) {
        const data = await saveTestStatusesBatch(testBatch);
        setTestStatuses(data.statuses);
        setTestNotes(data.notes);
        setTestAssignees({ ...nextAssignees, ...data.assignees });
        setTestSprints({ ...nextSprints, ...data.sprints });
        setTestDueDates({ ...nextDueDates, ...data.dueDates });
        setTestAssignedBy({ ...nextAssignedBy, ...(data.assignedBy ?? {}) });
        applyTestAudit(data);
      }

      setDrafts((prev) => {
        const next = { ...prev };
        for (const card of dirtyCards) delete next[card.key];
        return next;
      });
      for (const card of dirtyCards) clearBoardNoteDrafts(card.key);
      setSaveFlash(`Saved ${dirtyCards.length} card${dirtyCards.length === 1 ? "" : "s"}`);
      window.setTimeout(() => setSaveFlash(""), 2500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save all changes.");
    } finally {
      setBusy(false);
    }
  };

  const saveAllDirty = async () => {
    const map: Record<string, CardDraft> = { ...drafts };
    for (const card of boardCards) {
      if (isCardDirty(card.key) && map[card.key] === undefined) {
        map[card.key] = {};
      }
    }
    await persistDraftMap(map);
  };

  const applyBulkToSelected = (andSave: boolean) => {
    if (selectedKeys.size === 0) {
      setError("Select one or more cards first.");
      return;
    }
    const desc = bulkDescription.trim();
    const dueNormalized = bulkDueDate ? isoToMmddyy(bulkDueDate) : "";
    if (bulkDueDate && (dueNormalized === null || dueNormalized === "")) {
      setError("Pick a valid due date from the calendar.");
      return;
    }
    if (
      !bulkAssignee &&
      !bulkAssignBy &&
      bulkSprint === "" &&
      !bulkStatus &&
      !desc &&
      !dueNormalized
    ) {
      setError("Choose a bulk Assignee, Assigned By, Sprint, Status, Due, and/or Description.");
      return;
    }
    if (bulkSprint !== "" && isSprintLocked(closedSprints, Number(bulkSprint))) {
      setError(sprintLockedMessage(Number(bulkSprint)));
      return;
    }

    const nextDrafts: Record<string, CardDraft> = { ...drafts };
    let changed = 0;
    let skippedLocked = 0;
    for (const card of boardCards) {
      if (!selectedKeys.has(card.key)) continue;
      if (isSprintLocked(closedSprints, card.sprint)) {
        skippedLocked += 1;
        continue;
      }
      const mapped: CardDraft = { ...nextDrafts[card.key] };
      if (bulkSprint !== "") {
        mapped.sprint = Number(bulkSprint);
      }
      const resultingSprint =
        mapped.sprint !== undefined ? mapped.sprint : card.sprint;
      if (bulkAssignee) {
        // Tasks/plan on backlog stay Unassigned; tests may be assigned in backlog.
        if (!isBacklogSprint(resultingSprint) || card.source === "test") {
          const a = bulkAssigneeForSource(card.source, bulkAssignee);
          // Empty string is valid for clearing test assignees (Unassigned).
          if (a !== null) mapped.assignee = a;
        }
      }
      // Backlog tasks/plan always Unassigned. Tests keep the staged/bulk assignee.
      if (isBacklogSprint(resultingSprint) && card.source !== "test") {
        mapped.assignee = UNASSIGNED_OWNER;
      }
      if (bulkAssignBy && (card.source === "task" || card.source === "test")) {
        mapped.assignBy = bulkAssignBy;
      }
      if (bulkStatus) {
        const blockTestsDenied =
          bulkStatus === "blocked" &&
          card.source === "test" &&
          !canBlockTests &&
          (testStatuses[card.sourceId] ?? "not_run") !== "blocked";
        if (blockTestsDenied) {
          setError("Only Evelyn may set a test to Blocked. Task Blocked still applies.");
        } else {
          const s = mapBulkStatusToSource(card.source, bulkStatus);
          if (s) mapped.status = s;
        }
      }
      if (dueNormalized) {
        mapped.dueDate = dueNormalized;
      }
      if (desc) {
        if (card.source === "plan") {
          mapped.note = desc;
        } else if (card.source === "task" || card.source === "test") {
          // Append as a new authored note — never overwrite the JSON thread with plain text.
          mapped.note = appendActorNote(
            cardStoredNotes(card),
            actingAssignBy,
            desc,
            undefined,
            priorNoteAttributionForCard(card),
          );
        }
      }
      nextDrafts[card.key] = mapped;
      changed += 1;
    }
    setDrafts(nextDrafts);
    if (changed === 0 && skippedLocked > 0) {
      setError(
        `Selected cards are in a closed/locked sprint — no bulk edits applied (${skippedLocked} locked).`,
      );
      return;
    }
    setError(
      skippedLocked > 0
        ? `Skipped ${skippedLocked} locked-sprint card(s). Staged ${changed}.`
        : "",
    );

    if (andSave) {
      void persistDraftMap(nextDrafts).then(() => {
        setBulkDescription("");
        setBulkDueDate("");
      });
    } else {
      setSaveFlash(`Bulk edits staged on ${changed} card(s) — click Save or Save all`);
      window.setTimeout(() => setSaveFlash(""), 2500);
    }
  };

  const addBacklogItem = async () => {
    if (!newTitle.trim() || activeSprint === "all") return;
    const sprint = activeSprint === "backlog" ? BACKLOG_SPRINT : activeSprint;
    if (isSprintLocked(closedSprints, sprint)) {
      setError(sprintLockedMessage(Number(sprint)));
      return;
    }
    const item: PlanItem = {
      id: newPlanItemId(),
      title: newTitle.trim(),
      notes: "",
      owner: (isBacklogSprint(sprint)
        ? UNASSIGNED_OWNER
        : newOwner) as PlanOwner,
      kind: "rollout",
      sprint,
      status: "todo",
      date: "",
      dateLabel: activeSprint === "backlog" ? "Backlog" : sprintLabel(activeSprint),
    };
    setNewTitle("");
    await persistPlan([item, ...items], retro);
  };

  const endingSprintIndex =
    endSprintTarget !== null
      ? endSprintTarget
      : isSprintIndex(activeSprint)
        ? activeSprint
        : null;
  const incompleteEndSprintWork = useMemo(() => {
    if (endingSprintIndex === null) return { tasks: [], tests: [] };
    return listIncompleteSprintWork({
      sprintIndex: endingSprintIndex,
      tasks,
      tests: ALL_TESTS,
      testStatuses,
      testSprints,
      testAssignees,
    });
  }, [endingSprintIndex, tasks, testStatuses, testSprints, testAssignees]);

  const openEndSprint = (sprintIndex: number) => {
    if (isSprintLocked(closedSprints, sprintIndex)) {
      setError(sprintLockedMessage(sprintIndex));
      return;
    }
    setActiveSprint(sprintIndex);
    setEndSprintTarget(sprintIndex);
    setEndSprintOpen(true);
  };

  const confirmReopenSprint = async (sprintIndex: number) => {
    if (!isSprintLocked(closedSprints, sprintIndex)) return;
    setBusy(true);
    setError("");
    try {
      const closedList = await reopenSprint(sprintIndex);
      setClosedSprints(new Set(closedList));
      setSaveFlash(`${sprintLabel(sprintIndex)} re-opened.`);
      window.setTimeout(() => setSaveFlash(""), 3500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Re-open sprint failed.");
    } finally {
      setBusy(false);
    }
  };

  /** Apply End Sprint choices: rollover → next sprint, complete → done/pass. Also carries open plan items. */
  const confirmEndSprint = async (actions: Record<string, EndSprintAction>) => {
    if (endingSprintIndex === null) return;
    if (isSprintLocked(closedSprints, endingSprintIndex)) {
      setError(sprintLockedMessage(endingSprintIndex));
      setEndSprintOpen(false);
      setEndSprintTarget(null);
      return;
    }
    const sprint = endingSprintIndex;
    const nextSprint = sprint + 1;
    const nextDue = dueDateForSprint(nextSprint);

    setBusy(true);
    setError("");
    try {
      // Plan milestones: always roll incomplete forward (not in the task/test modal).
      const incompletePlan = listIncompletePlanItems(items, sprint);
      let nextPlan = items;
      if (incompletePlan.length > 0) {
        nextPlan = items.map((i) => {
          if (i.sprint !== sprint || i.status === "done") return i;
          return {
            ...i,
            sprint: nextSprint,
            status: "carried" as PlanItemStatus,
            dateLabel: sprintLabel(nextSprint),
          };
        });
        await persistPlan(nextPlan, retro);
      }

      let tasksChanged = false;
      const nextTasks = tasks.map((t) => {
        if (Number(t.sprint) !== sprint || t.status === "done") return t;
        tasksChanged = true;
        const action = actions[`task:${t.id}`] ?? "rollover";
        if (action === "complete") {
          return applyPartnerDone(t, {
            status: "done",
            ...(requiresPartnerDone(t.assignedTo)
              ? { tinaDone: true, evelynDone: true }
              : {}),
          });
        }
        return {
          ...t,
          ...withSprintDueDate({ sprint: nextSprint }),
          status: t.status === "not_started" ? "in_progress" : t.status,
          notes: appendActorNote(t.notes, actingAssignBy, rolloverNoteText(sprint)),
        };
      });
      if (tasksChanged) {
        setTasks(await persistTasks(nextTasks));
      }

      const testBatch: Array<{
        caseId: string;
        status: TestStatus;
        note?: string;
        assignee?: string;
        sprint?: number;
        dueDate?: string;
        checkedSteps?: boolean[];
        stepCount?: number;
      }> = [];
      for (const t of ALL_TESTS) {
        const rowSprint = Number(testSprints[t.id]);
        if (rowSprint !== sprint) continue;
        const st = testStatuses[t.id] ?? "not_run";
        // Match End Sprint modal: Pass + Conditional Pass stay on the closed sprint.
        if (st === "pass" || st === "conditional_approval") continue;
        const action = actions[`test:${t.id}`] ?? "rollover";
        const assignee = testAssignees[t.id] || TEST_DEFAULT_ASSIGNEES[t.id] || "";
        const note = testNotes[t.id] ?? "";
        if (action === "complete") {
          const stepCount = Array.isArray(t.steps) ? t.steps.length : 0;
          testBatch.push({
            caseId: t.id,
            status: "pass",
            note: note.trim() || "Completed at sprint end",
            assignee,
            sprint,
            dueDate: testDueDates[t.id],
            ...(stepCount > 0
              ? { stepCount, checkedSteps: Array.from({ length: stepCount }, () => true) }
              : {}),
          });
        } else {
          // Keep work status (Fail / Fixed/Cursor / …); mark rollover via note for chips/filters.
          const workStatus = st === "rolled_over" ? "not_run" : st;
          testBatch.push({
            caseId: t.id,
            status: workStatus,
            note: appendActorNote(note, actingAssignBy, rolloverNoteText(sprint)),
            assignee,
            sprint: nextSprint,
            dueDate: nextDue || testDueDates[t.id],
          });
        }
      }
      if (testBatch.length > 0) {
        const data = await saveTestStatusesBatch(testBatch);
        setTestStatuses(data.statuses);
        setTestNotes(data.notes);
        setTestAssignees(data.assignees);
        setTestSprints(data.sprints);
        setTestDueDates(data.dueDates);
        setTestAssignedBy(data.assignedBy);
        applyTestAudit(data);
      }

      // Persist closed/locked state after unfinished work has been moved or completed.
      const closedList = await closeSprint(sprint);
      setClosedSprints(new Set(closedList));

      setDrafts({});
      setSelectedKeys(new Set());
      setEndSprintOpen(false);
      setEndSprintTarget(null);
      setActiveSprint(nextSprint);
      setSaveFlash(
        `${sprintLabel(sprint)} closed & locked → ${sprintLabel(nextSprint)}. Open items rolled or completed.`,
      );
      window.setTimeout(() => setSaveFlash(""), 3500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "End sprint failed.");
    } finally {
      setBusy(false);
    }
  };

  const addRetroCard = async (column: RetroColumn) => {
    const text = retroDraft[column].trim();
    if (!text || !isSprintIndex(activeSprint)) return;
    if (isSprintLocked(closedSprints, activeSprint)) {
      setError(sprintLockedMessage(activeSprint));
      return;
    }
    const card: RetroCard = {
      id: newRetroCardId(),
      sprint: activeSprint,
      column,
      text,
      owner: "Both",
    };
    setRetroDraft((d) => ({ ...d, [column]: "" }));
    await persistPlan(items, [...retro, card]);
  };

  const removeRetroCard = async (id: string) => {
    const existing = retro.find((c) => c.id === id);
    if (existing && isSprintLocked(closedSprints, existing.sprint)) {
      setError(sprintLockedMessage(existing.sprint));
      return;
    }
    await persistPlan(
      items,
      retro.filter((c) => c.id !== id),
    );
  };

  const retroForSprint = isSprintIndex(activeSprint)
    ? retro.filter((c) => c.sprint === activeSprint)
    : [];

  const backlogCards = cardsInSprint(BACKLOG_SPRINT);
  const backlogBySource = countBySource(backlogCards);
  const allSprintCards = boardCards.filter((c) => !isBacklogSprint(c.sprint));
  const allSprintBySource = countBySource(allSprintCards);
  const backlogFilterCards = boardCards.filter(
    (c) => matchesSourceFilter(c.source, sourceFilter) && c.sprint === BACKLOG_SPRINT,
  );
  const backlogFilterBySource = countBySource(backlogFilterCards);
  const activeTheme = isSprintIndex(activeSprint)
    ? themeForSprint(activeSprint)
    : undefined;
  const activeSprintCards =
    activeSprint === "backlog"
      ? []
      : activeSprint === "all"
        ? allSprintCards
        : cardsInSprint(activeSprint);
  const activeSprintBySource = countBySource(activeSprintCards);
  const overallDone = activeSprintBySource.workDone;
  const scopeCards =
    activeSprint === "backlog" ? backlogFilterCards : sprintScopedCards;
  const scopeBySource = countBySource(scopeCards);
  const assigneeProgress = [
    { label: "Tina", accent: "#9B2F28" },
    { label: "Evelyn", accent: "#947D64" },
    { label: "Lyriq", accent: "#2e7d32" },
    { label: "Both", accent: "#181718" },
    { label: "Unassigned", accent: "#7a7064" },
  ].map(({ label, accent }) => {
    const cards = activeSprintCards.filter((card) => {
      if (label === "Unassigned") {
        return card.owner === "Unassigned" || !String(card.owner || "").trim();
      }
      if (label === "Both") return requiresPartnerDone(card.owner);
      if (label === "Tina" || label === "Evelyn" || label === "Lyriq") {
        return assigneeIncludes(card.owner, label);
      }
      return card.owner === label;
    });
    const bySource = countBySource(cards);
    return {
      label,
      accent,
      done: bySource.workDone,
      total: bySource.workTotal,
      tasks: bySource.tasks,
      tests: bySource.tests,
      tasksDone: bySource.tasksDone,
      testsDone: bySource.testsDone,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BusyOverlay
        active={busy || loading}
        message={loading ? "Loading sprint board…" : "Saving schedule…"}
      />
      {endingSprintIndex !== null && (
        <EndSprintModal
          open={endSprintOpen}
          sprintIndex={endingSprintIndex}
          tasks={incompleteEndSprintWork.tasks}
          tests={incompleteEndSprintWork.tests}
          busy={busy}
          onClose={() => {
            setEndSprintOpen(false);
            setEndSprintTarget(null);
          }}
          onConfirm={(actions) => void confirmEndSprint(actions)}
        />
      )}
      <div
        className="glass"
        style={{
          padding: 24,
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(215,198,151,0.55), #fff)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              color: "var(--charcoal)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CalendarDays size={22} style={{ color: "var(--bronze)" }} /> Schedule &amp;
            Implementation Plan
          </h2>
          <p className="admin-page-lede">
            Sprint board shows <strong>tasks</strong> and <strong>tests</strong> only. Backlog is
            scheduled into themed sprints (Tue–Mon) via the implementation plan.
          </p>
          <p className="admin-page-lede" style={{ marginTop: 4, fontSize: "0.92rem" }}>
            {sprint0.label}: {sprint0.rangeLabel} · Board cards:{" "}
            {tasks.length + ALL_TESTS.length} (tests {ALL_TESTS.length} · tasks {tasks.length})
          </p>
          {activeTheme && (
            <p style={{ color: "var(--charcoal)", fontSize: "1rem", marginTop: 10, fontWeight: 600 }}>
              {sprintLabel(activeTheme.index)} · Sprint Goal: {activeTheme.goal}
              <span style={{ display: "block", fontWeight: 400, color: "var(--text-primary)", fontSize: "0.95rem", marginTop: 2 }}>
                {activeTheme.theme}
              </span>
            </p>
          )}
        </div>

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(155,47,40,0.1)",
              border: "1px solid rgba(155,47,40,0.35)",
              color: "#9B2F28",
              fontSize: "0.95rem",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {(
            [
              ["board", "Sprint board", <ClipboardList key="b" size={14} />],
              ["ceremonies", "Ceremonies", <Users key="c" size={14} />],
              ["retro", "Retrospective board", <MessageSquare key="r" size={14} />],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              className={`nav-link-btn ${tab === id ? "active" : ""}`}
              style={{ borderRadius: 10 }}
              onClick={() => setTab(id)}
            >
              {icon}
              {label}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-primary"
            style={{ gap: 6 }}
            disabled={agendaBusy}
            data-testid="schedule-create-agenda"
            onClick={() => {
              void (async () => {
                setAgendaBusy(true);
                setAgendaMsg("");
                try {
                  await createPartnerAgenda();
                  setAgendaMsg("Interactive agenda ready.");
                  onOpenAgenda?.();
                } catch (e) {
                  setAgendaMsg(e instanceof ApiError ? e.message : "Could not create agenda.");
                } finally {
                  setAgendaBusy(false);
                }
              })();
            }}
          >
            <ListPlus size={14} /> Create interactive agenda
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ gap: 6 }}
            disabled={agendaBusy}
            data-testid="schedule-email-agenda"
            onClick={() => {
              void (async () => {
                setAgendaBusy(true);
                setAgendaMsg("");
                try {
                  const res = await sendPartnerAgendaInvite();
                  const fails = (res.results || []).filter((r) => !r.ok);
                  setAgendaMsg(
                    fails.length
                      ? `Invite errors: ${fails.map((f) => f.email).join(", ")}`
                      : "Email sent to Tina & Lyriq with the agenda link.",
                  );
                } catch (e) {
                  setAgendaMsg(e instanceof ApiError ? e.message : "Could not send agenda email.");
                } finally {
                  setAgendaBusy(false);
                }
              })();
            }}
          >
            <Mail size={14} /> Email Admins Agenda
          </button>
        </div>
        {agendaMsg && (
          <p style={{ margin: "10px 0 0", color: "var(--charcoal)", fontSize: "0.95rem" }}>
            {agendaMsg}
          </p>
        )}
      </div>

      <SprintStatusBars
        boardCards={boardCards}
        selectedSprint={activeSprint}
        onSelectSprint={(selection) => {
          if (selection === "all") {
            setActiveSprint("all");
            return;
          }
          setActiveSprint(selection);
        }}
      />

      <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
        <div
          style={{
            fontSize: "0.9375rem",
            color: "var(--text-primary)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 8,
          }}
        >
          Sprints &amp; backlog
        </div>
        <div className="schedule-sprint-bubble-grid">
          <button
            type="button"
            className="qa-tester-bubble"
            data-active={activeSprint === "all" ? "true" : "false"}
            onClick={() => setActiveSprint("all")}
            title={`All Sprints · ${allSprintsNumericRange} · every non-backlog sprint · ${formatWorkDoneTotal(allSprintBySource)} · ${formatTQTitle(allSprintBySource)}`}
          >
            <span style={{ display: "flex", gap: 6, alignItems: "baseline", flexWrap: "wrap" }}>
              <strong>All Sprints</strong>
              <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                · {formatWorkDoneTotal(allSprintBySource)}
              </span>
            </span>
            <TQBubbleLines c={allSprintBySource} />
            <span
              className="qa-tester-meta"
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1.2,
                opacity: 0.9,
              }}
            >
              {allSprintsNumericRange}
            </span>
          </button>
          <button
            type="button"
            className="qa-tester-bubble"
            data-active={activeSprint === "backlog" ? "true" : "false"}
            onClick={() => {
              setOwnerFilter("all");
              setActiveSprint("backlog");
            }}
            title={`Backlog · — · ${formatWorkDoneTotal(backlogBySource)} · ${formatTQTitle(backlogBySource)}`}
          >
            <span style={{ display: "flex", gap: 6, alignItems: "baseline", flexWrap: "wrap" }}>
              <strong>Backlog</strong>
              <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                · {formatWorkDoneTotal(backlogBySource)}
              </span>
            </span>
            <TQBubbleLines c={backlogBySource} />
            <span
              className="qa-tester-meta"
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1.2,
                opacity: 0.9,
              }}
            >
              —
            </span>
          </button>
          {sprints.map((s) => {
            const cards = cardsInSprint(s.index);
            const bySource = countBySource(cards);
            const workFace = formatWorkDoneTotal(bySource);
            const theme = themeForSprint(s.index);
            const goal = theme?.goal;
            const locked = isSprintLocked(closedSprints, s.index);
            const showDone = !locked;
            const showReopen = locked;
            const rollover = sprintRolloverSummary(
              testStatuses,
              testSprints,
              s.index,
              KNOWN_CASE_IDS,
              testNotes,
              tasks,
            );
            return (
              <div
                key={s.index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  alignItems: "stretch",
                }}
              >
                <button
                  type="button"
                  className="qa-tester-bubble"
                  data-active={activeSprint === s.index ? "true" : "false"}
                  data-locked={locked ? "true" : "false"}
                  onClick={() => setActiveSprint(s.index)}
                  title={
                    locked
                      ? `${s.label} · Closed & locked · ${s.numericRangeLabel}`
                      : theme
                        ? `${s.label} · Sprint Goal: ${theme.goal} · ${s.numericRangeLabel} — ${theme.theme} · ${workFace} · ${formatTQTitle(bySource)}${rollover.banner ? ` · ${rollover.banner}` : ""}`
                        : `${s.label} · ${s.numericRangeLabel} · ${workFace} · ${formatTQTitle(bySource)}${rollover.banner ? ` · ${rollover.banner}` : ""}`
                  }
                >
                  <span style={{ display: "flex", gap: 6, alignItems: "baseline", flexWrap: "wrap" }}>
                    <strong>{s.label}</strong>
                    {locked ? <SprintLockedBanner /> : null}
                    <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                      · {workFace}
                    </span>
                  </span>
                  {goal ? (
                    <span
                      className="qa-tester-meta"
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        lineHeight: 1.25,
                        color: "inherit",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {goal}
                    </span>
                  ) : null}
                  <TQBubbleLines
                    c={bySource}
                    rolledTests={rollover.fromPrevTests}
                    rolledTasks={rollover.fromPrevTasks}
                  />
                  <span
                    className="qa-tester-meta"
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1.2,
                      opacity: 0.9,
                    }}
                  >
                    {s.numericRangeLabel}
                  </span>
                </button>
                {showDone ? (
                  <button
                    type="button"
                    className="inline-text-link schedule-sprint-bubble-link"
                    data-testid={`sprint-bubble-done-${s.index}`}
                    onClick={() => openEndSprint(s.index)}
                    disabled={busy}
                    title={`Done ${s.label} — rollover or complete open work`}
                  >
                    Done
                  </button>
                ) : null}
                {showReopen ? (
                  <button
                    type="button"
                    className="inline-text-link schedule-sprint-bubble-link"
                    data-testid={`sprint-bubble-reopen-${s.index}`}
                    onClick={() => void confirmReopenSprint(s.index)}
                    disabled={busy}
                    title={`Re-open ${s.label} — unlock so items can be edited again`}
                  >
                    Re-open
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
        {isSprintIndex(activeSprint) && activeTheme && (
          <p style={{ marginTop: 12, fontSize: "0.95rem", color: "var(--text-primary)" }}>
            <strong style={{ color: "var(--charcoal)" }}>
              {sprintLabel(activeSprint)} · Sprint Goal: {activeTheme.goal}
            </strong>
            {" — "}
            {getSprintWindow(activeSprint).rangeLabel}. {activeTheme.theme}
            {isSprintLocked(closedSprints, activeSprint) ? (
              <span style={{ marginLeft: 8, color: "#475569", fontWeight: 700 }}>
                · Closed & locked — no further modifications
              </span>
            ) : null}
          </p>
        )}
        {isSprintIndex(activeSprint) &&
          (() => {
            const roll = sprintRolloverSummary(
              testStatuses,
              testSprints,
              activeSprint,
              KNOWN_CASE_IDS,
              testNotes,
              tasks,
            );
            if (!roll.banner) return null;
            return (
              <p
                data-testid="schedule-sprint-rollover-banner"
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(14, 116, 144, 0.1)",
                  border: "1px solid rgba(14, 116, 144, 0.35)",
                  color: "#0e7490",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                }}
              >
                {roll.banner}
              </p>
            );
          })()}
        {activeSprint === "all" && (
          <p style={{ marginTop: 12, fontSize: "0.95rem", color: "var(--text-primary)" }}>
            <strong style={{ color: "var(--charcoal)" }}>All Sprints</strong>
            {" — "}
            Combined view of every sprint-assigned item (Backlog excluded).
          </p>
        )}
      </div>

      {activeSprint !== "backlog" && (
        <div className="glass schedule-board-filters" style={{ padding: "10px 12px", borderRadius: 12 }}>
          <CollapsibleFilterSection
            title={
              isSprintIndex(activeSprint)
                ? `${sprintLabel(activeSprint)} progress`
                : "All Sprints progress"
            }
            hint={`${formatWorkDoneTotal(activeSprintBySource)} · ${
              isSprintIndex(activeSprint)
                ? getSprintWindow(activeSprint).rangeLabel
                : "Every sprint"
            }`}
            testId="schedule-assignee-progress"
            onFilterClick={() => setOwnerFilter("all")}
          >
            <p
              style={{
                margin: "0 0 6px",
                color: "var(--text-primary)",
                fontSize: "0.8125rem",
              }}
            >
              {formatTQTitle(activeSprintBySource)}
              {" · "}Shared “Both” items count toward Tina + Evelyn
              {" · "}
              <span style={{ color: "#7a241f", fontWeight: 650 }}>Click a name to filter</span>
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 8,
              }}
            >
              <ProgressMeter
                label={activeSprint === "all" ? "All sprints" : "Overall sprint"}
                done={overallDone}
                total={activeSprintBySource.workTotal}
                accent="#5f7a45"
                tasks={activeSprintBySource.tasks}
                tests={activeSprintBySource.tests}
                tasksDone={activeSprintBySource.tasksDone}
                testsDone={activeSprintBySource.testsDone}
                selected={ownerFilter === "all"}
                onFilterClick={() => setOwnerFilter("all")}
              />
              {assigneeProgress.map((row) => {
                const ownerId = row.label as BoardOwnerFilter;
                return (
                  <ProgressMeter
                    key={row.label}
                    {...row}
                    selected={ownerFilter === ownerId}
                    onFilterClick={() => setOwnerFilter(ownerId)}
                  />
                );
              })}
            </div>
          </CollapsibleFilterSection>
        </div>
      )}

      {tab === "board" && (
        <>
          <div className="glass schedule-board-filters" data-testid="schedule-board-filters">
            <div className="schedule-board-filters__scope">
              <strong>
                {activeSprint === "backlog"
                  ? "Backlog"
                  : activeSprint === "all"
                    ? "All Sprints"
                    : sprintLabel(activeSprint)}
              </strong>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatTQTitle(scopeBySource)}
                {" · "}
                {formatWorkDoneTotal(scopeBySource)}
              </span>
              {activeSprint !== "backlog" && (
                <span
                  style={{
                    color: "var(--text-primary)",
                    fontSize: "0.8125rem",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  Backlog also {formatTQTitle(backlogBySource)}
                </span>
              )}
            </div>

            <CollapsibleFilterSection
              title="Type — tasks vs tests"
              hint={SOURCE_BUBBLES.find((b) => b.id === sourceFilter)?.label}
              testId="schedule-filter-type"
              onFilterClick={() => setSourceFilter("all")}
            >
              <div
                className="schedule-board-filters__chips schedule-board-filters__chips--type"
                style={{ "--chip-cols": chipColsForTwoRows(SOURCE_BUBBLES.length) } as CSSProperties}
              >
                {SOURCE_BUBBLES.map((b) => {
                  const active = sourceFilter === b.id;
                  const matched = sprintOnlyCards.filter((c) =>
                    matchesSourceFilter(c.source, b.id),
                  );
                  const bySource = countBySource(matched);
                  const face =
                    b.id === "test"
                      ? `${bySource.testsDone}/${bySource.tests}`
                      : b.id === "task"
                        ? `${bySource.tasksDone}/${bySource.tasks}`
                        : formatWorkDoneTotal(bySource);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className="qa-tester-bubble"
                      data-active={active ? "true" : "false"}
                      data-testid={`sprint-board-type-${b.id}`}
                      onClick={() => setSourceFilter(b.id)}
                      title={
                        b.id === "all"
                          ? `Show tasks and tests · ${face} · ${formatTQTitle(bySource)}`
                          : b.id === "test"
                            ? `QA tests only · ${face} passed`
                            : `Implementation tasks only · ${face} done`
                      }
                      style={{
                        borderColor: active && b.accent ? b.accent : undefined,
                        boxShadow: active && b.accent ? `0 0 0 1px ${b.accent}` : undefined,
                      }}
                    >
                      {b.accent && (
                        <span className="qa-tester-dot" style={{ background: b.accent }} />
                      )}
                      {b.label}
                      <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                        · {face}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleFilterSection>

            {/* Backlog never has person assignees — hide assignee bubbles there. */}
            {activeSprint !== "backlog" && (
              <>
              <hr className="schedule-board-filters__divider" />
              <CollapsibleFilterSection
                title="Assignee"
                hint={
                  ownerFilter === "all"
                    ? "All assignees"
                    : OWNER_BUBBLES.find((b) => b.id === ownerFilter)?.label
                }
                testId="schedule-filter-assignee"
                defaultOpen
                onFilterClick={() => setOwnerFilter("all")}
              >
                <div
                  className="schedule-board-filters__chips"
                  style={
                    { "--chip-cols": chipColsForTwoRows(1 + OWNER_BUBBLES.length) } as CSSProperties
                  }
                >
                  <button
                    type="button"
                    className="qa-tester-bubble"
                    data-active="false"
                    onClick={() => {
                      setOwnerFilter("all");
                      setActiveSprint("backlog");
                    }}
                    title={`Backlog (sprint ${BACKLOG_SPRINT}) · ${formatWorkDoneTotal(backlogFilterBySource)} · ${formatTQTitle(backlogFilterBySource)}`}
                  >
                    <span className="qa-tester-dot" style={{ background: "#6B5344" }} />
                    Backlog
                    <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatTQ(backlogFilterBySource)}
                      {" · "}
                      {formatWorkDoneTotal(backlogFilterBySource)}
                    </span>
                  </button>
                  {OWNER_BUBBLES.map((b) => {
                    const active = ownerFilter === b.id;
                    const matched = sprintScopedCards.filter((c) =>
                      matchesAssigneeFilter(cardAssigneeFilterValue(c), b.id),
                    );
                    const bySource = countBySource(matched);
                    const workFace = formatWorkDoneTotal(bySource);
                    const rolled = rolledBreakdown(matched);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        className="qa-tester-bubble"
                        data-active={active ? "true" : "false"}
                        data-testid={`sprint-board-assignee-${b.id}`}
                        onClick={() => setOwnerFilter(b.id)}
                        title={
                          b.id === "all"
                            ? `${workFace} · ${formatTQTitle(bySource)} · Rolled over — Tests: ${rolled.testsRolled} · Tasks: ${rolled.tasksRolled}`
                            : `${b.label}: ${formatTQTitle(bySource)} · ${workFace} · Rolled over — Tests: ${rolled.testsRolled} · Tasks: ${rolled.tasksRolled}`
                        }
                        style={{
                          borderColor: active && b.accent ? b.accent : undefined,
                          boxShadow: active && b.accent ? `0 0 0 1px ${b.accent}` : undefined,
                        }}
                      >
                        {b.accent && (
                          <span className="qa-tester-dot" style={{ background: b.accent }} />
                        )}
                        {b.label}
                        <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {formatTQ(bySource)}
                          {" · "}
                          {workFace}
                          {rolled.total > 0 ? (
                            <span className="status-bubble__rolled">
                              Rolled over: Tests {rolled.testsRolled} · Tasks {rolled.tasksRolled}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleFilterSection>
              </>
            )}

            <hr className="schedule-board-filters__divider" />

            <CollapsibleFilterSection
              title="Assignor (Assigned By)"
              hint={
                assignByFilter === "all"
                  ? "All assignors"
                  : assignByFilter === ASSIGN_BY_UNSET
                    ? "Unset"
                    : assignByFilter
              }
              testId="schedule-filter-assignor"
              defaultOpen
              onFilterClick={() => setAssignByFilter("all")}
            >
              <div
                className="schedule-board-filters__chips"
                style={
                  {
                    "--chip-cols": chipColsForTwoRows(2 + assignByOptions.length),
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className="qa-tester-bubble"
                  data-active={assignByFilter === "all" ? "true" : "false"}
                  data-testid="sprint-board-assignor-all"
                  onClick={() => setAssignByFilter("all")}
                  title="Show every assignor"
                >
                  All assignors
                  <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                    · {sprintScopedCards.length}
                  </span>
                </button>
                <button
                  type="button"
                  className="qa-tester-bubble"
                  data-active={assignByFilter === ASSIGN_BY_UNSET ? "true" : "false"}
                  data-testid="sprint-board-assignor-unset"
                  onClick={() => setAssignByFilter(ASSIGN_BY_UNSET)}
                  title="No Assigned By set"
                >
                  <span className="qa-tester-dot" style={{ background: "#7a7064" }} />
                  Unset
                  <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                    ·{" "}
                    {
                      sprintScopedCards.filter((c) =>
                        matchesAssignByFilter(cardAssignByValue(c), ASSIGN_BY_UNSET),
                      ).length
                    }
                  </span>
                </button>
                {assignByOptions.map((name) => {
                  const active = assignByFilter === name;
                  const count = sprintScopedCards.filter((c) =>
                    matchesAssignByFilter(cardAssignByValue(c), name),
                  ).length;
                  const accent =
                    name === "Tina"
                      ? "#9B2F28"
                      : name === "Evelyn"
                        ? "#947D64"
                        : name === "Lyriq"
                          ? "#2e7d32"
                          : "#6B5344";
                  return (
                    <button
                      key={name}
                      type="button"
                      className="qa-tester-bubble"
                      data-active={active ? "true" : "false"}
                      data-testid={`sprint-board-assignor-${name.toLowerCase()}`}
                      onClick={() => setAssignByFilter(name)}
                      style={{
                        borderColor: active ? accent : undefined,
                        boxShadow: active ? `0 0 0 1px ${accent}` : undefined,
                      }}
                    >
                      <span className="qa-tester-dot" style={{ background: accent }} />
                      {name}
                      <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                        · {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleFilterSection>

            <hr className="schedule-board-filters__divider" />

            <CollapsibleFilterSection
              title="Sprint status — placement (multi)"
              hint={
                sprintStatusFilters.size === 0
                  ? "All in sprint"
                  : `${sprintStatusFilters.size} selected`
              }
              testId="schedule-filter-sprint-status"
              onFilterClick={() => setSprintStatusFilters(new Set())}
            >
              <div
                className="schedule-board-filters__chips schedule-board-filters__chips--status"
                style={
                  {
                    "--chip-cols": chipColsForTwoRows(1 + SPRINT_STATUS_BUBBLES.length),
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className="qa-tester-bubble"
                  data-active={sprintStatusFilters.size === 0 ? "true" : "false"}
                  data-testid="sprint-board-sprint-status-all"
                  onClick={() => setSprintStatusFilters(new Set())}
                  title="Show every item in this sprint, including carry-over"
                >
                  All in sprint
                </button>
                {SPRINT_STATUS_BUBBLES.map((s) => {
                  const active = sprintStatusFilters.has(s.id);
                  const count = sprintScopedCards.filter(
                    (c) => cardSprintPlacement(c) === s.id,
                  ).length;
                  const accent = s.id === "carried" ? STATUS_COLORS.carried : "#5f7a45";
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className="qa-tester-bubble"
                      data-active={active ? "true" : "false"}
                      data-testid={`sprint-board-sprint-status-${s.id}`}
                      onClick={() => toggleSprintStatusFilter(s.id)}
                      style={{
                        borderColor: active ? accent : undefined,
                        boxShadow: active ? `0 0 0 1px ${accent}` : undefined,
                      }}
                    >
                      <span className="qa-tester-dot" style={{ background: accent }} />
                      {s.label}
                      <span className="qa-tester-meta">· {count}</span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleFilterSection>

            <hr className="schedule-board-filters__divider" />

            <CollapsibleFilterSection
              title="Tests status — QA progress (multi)"
              hint={
                testStatusFilters.size === 0
                  ? "All statuses"
                  : `${testStatusFilters.size} selected`
              }
              testId="schedule-filter-test-status"
              onFilterClick={() => setTestStatusFilters(new Set())}
            >
              <div
                className="schedule-board-filters__chips schedule-board-filters__chips--status"
                style={
                  {
                    "--chip-cols": chipColsForTwoRows(1 + TEST_STATUS_BUBBLES.length),
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className="qa-tester-bubble"
                  data-active={testStatusFilters.size === 0 ? "true" : "false"}
                  data-testid="sprint-board-test-status-all"
                  onClick={() => setTestStatusFilters(new Set())}
                  title={
                    ownerFilter === "all"
                      ? `All test statuses · ${statusCountCards.filter((c) => c.source === "test").length} · ${statusCountCards.filter((c) => c.source === "test" && cardIsRolledOver(c)).length} rolled over`
                      : `All test statuses for ${ownerFilter} · ${statusCountCards.filter((c) => c.source === "test" && cardIsRolledOver(c)).length} rolled over`
                  }
                >
                  All statuses
                  <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                    · {statusCountCards.filter((c) => c.source === "test").length}
                    {statusCountCards.filter((c) => c.source === "test" && cardIsRolledOver(c))
                      .length > 0 ? (
                      <span className="status-bubble__rolled">
                        Rolled over:{" "}
                        {
                          statusCountCards.filter((c) => c.source === "test" && cardIsRolledOver(c))
                            .length
                        }
                      </span>
                    ) : null}
                  </span>
                </button>
                {TEST_STATUS_BUBBLES.map((s) => {
                  const active = testStatusFilters.has(s.id);
                  const inStatus =
                    s.id === "rolled_over" && typeof activeSprint === "number"
                      ? boardCards.filter((c) => {
                          if (c.source !== "test") return false;
                          if (!matchesSourceFilter("test", sourceFilter)) return false;
                          if (!matchesAssigneeFilter(cardAssigneeFilterValue(c), ownerFilter)) {
                            return false;
                          }
                          return rolledRelativeToActiveSprint(c);
                        })
                      : statusCountCards.filter(
                          (c) =>
                            c.source === "test" &&
                            (testStatuses[c.sourceId] ?? "not_run") === s.id,
                        );
                  const count = inStatus.length;
                  const rolledWithin =
                    s.id === "rolled_over"
                      ? count
                      : inStatus.filter((c) =>
                          testIsRolledOver(
                            testStatuses[c.sourceId],
                            testNotes[c.sourceId],
                          ),
                        ).length;
                  const accent = STATUS_COLORS[s.id] || "#947D64";
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className="qa-tester-bubble"
                      data-active={active ? "true" : "false"}
                      data-testid={`sprint-board-test-status-${s.id}`}
                      onClick={() => toggleTestStatusFilter(s.id)}
                      title={
                        s.id === "rolled_over" && typeof activeSprint === "number"
                          ? ownerFilter === "all"
                            ? `${s.label} · ${count} rolled from ${sprintLabel(activeSprint)} (incl. moved to next sprint)`
                            : `${s.label} · ${count} for ${ownerFilter}`
                          : ownerFilter === "all"
                            ? `${s.label} · ${count} · ${rolledWithin} rolled over`
                            : `${s.label} · ${count} for ${ownerFilter} · ${rolledWithin} rolled over`
                      }
                      style={{
                        borderColor: active ? accent : undefined,
                        boxShadow: active ? `0 0 0 1px ${accent}` : undefined,
                      }}
                    >
                      <span className="qa-tester-dot" style={{ background: accent }} />
                      {s.label}
                      <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                        · {count}
                        {s.id !== "rolled_over" && rolledWithin > 0 ? (
                          <span className="status-bubble__rolled">Rolled over: {rolledWithin}</span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleFilterSection>

            <hr className="schedule-board-filters__divider" />

            <CollapsibleFilterSection
              title="Task status — work progress (multi)"
              hint={
                workStatusFilters.size === 0
                  ? "All statuses"
                  : `${workStatusFilters.size} selected`
              }
              testId="schedule-filter-task-status"
              onFilterClick={() => setWorkStatusFilters(new Set())}
            >
              <div
                className="schedule-board-filters__chips schedule-board-filters__chips--status"
                style={
                  {
                    "--chip-cols": chipColsForTwoRows(1 + WORK_STATUS_BUBBLES.length),
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className="qa-tester-bubble"
                  data-active={workStatusFilters.size === 0 ? "true" : "false"}
                  data-testid="sprint-board-work-status-all"
                  onClick={() => setWorkStatusFilters(new Set())}
                  title={
                    ownerFilter === "all"
                      ? `All task statuses · ${statusCountCards.filter((c) => c.source === "task").length} · ${statusCountCards.filter((c) => c.source === "task" && cardIsRolledOver(c)).length} rolled over`
                      : `All task statuses for ${ownerFilter} · ${statusCountCards.filter((c) => c.source === "task" && cardIsRolledOver(c)).length} rolled over`
                  }
                >
                  All statuses
                  <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                    · {statusCountCards.filter((c) => c.source === "task").length}
                    {statusCountCards.filter((c) => c.source === "task" && cardIsRolledOver(c))
                      .length > 0 ? (
                      <span className="status-bubble__rolled">
                        Rolled over:{" "}
                        {
                          statusCountCards.filter((c) => c.source === "task" && cardIsRolledOver(c))
                            .length
                        }
                      </span>
                    ) : null}
                  </span>
                </button>
                {WORK_STATUS_BUBBLES.map((s) => {
                  const active = workStatusFilters.has(s.id);
                  const inStatus =
                    s.id === "rolled_over" && typeof activeSprint === "number"
                      ? boardCards.filter((c) => {
                          if (c.source !== "task") return false;
                          if (!matchesSourceFilter("task", sourceFilter)) return false;
                          if (!matchesAssigneeFilter(cardAssigneeFilterValue(c), ownerFilter)) {
                            return false;
                          }
                          return rolledRelativeToActiveSprint(c);
                        })
                      : statusCountCards.filter(
                          (c) => c.source === "task" && cardWorkStatus(c) === s.id,
                        );
                  const count = inStatus.length;
                  const rolledWithin =
                    s.id === "rolled_over"
                      ? count
                      : inStatus.filter((c) => {
                          const task = tasks.find((t) => t.id === c.sourceId);
                          return noteIndicatesRollover(task?.notes);
                        }).length;
                  const accent = STATUS_COLORS[s.id] || "#947D64";
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className="qa-tester-bubble"
                      data-active={active ? "true" : "false"}
                      data-testid={`sprint-board-work-status-${s.id}`}
                      onClick={() => toggleWorkStatusFilter(s.id)}
                      title={
                        s.id === "rolled_over" && typeof activeSprint === "number"
                          ? ownerFilter === "all"
                            ? `${s.label} · ${count} rolled from ${sprintLabel(activeSprint)} (incl. moved to next sprint)`
                            : `${s.label} · ${count} for ${ownerFilter}`
                          : ownerFilter === "all"
                            ? `${s.label} · ${count} · ${rolledWithin} rolled over`
                            : `${s.label} · ${count} for ${ownerFilter} · ${rolledWithin} rolled over`
                      }
                      style={{
                        borderColor: active ? accent : undefined,
                        boxShadow: active ? `0 0 0 1px ${accent}` : undefined,
                      }}
                    >
                      <span className="qa-tester-dot" style={{ background: accent }} />
                      {s.label}
                      <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                        · {count}
                        {s.id !== "rolled_over" && rolledWithin > 0 ? (
                          <span className="status-bubble__rolled">Rolled over: {rolledWithin}</span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleFilterSection>
          </div>

          <div className="glass" style={{ padding: 16, borderRadius: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end", marginBottom: 12 }}>
              <div style={{ position: "relative", flex: "1 1 260px", minWidth: 220, maxWidth: 420 }}>
                <label className="form-label" htmlFor="sprint-board-search">
                  Search board
                </label>
                <div style={{ position: "relative" }}>
                  <Search
                    size={14}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-primary)",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    id="sprint-board-search"
                    className="text-input"
                    style={{ paddingLeft: 34, height: 40, width: "100%" }}
                    placeholder="Search id, title, notes, assignee, assignor…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search sprint board by id, title, notes, assignee, or assignor"
                    data-testid="sprint-board-search"
                  />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
              <div className="form-group" style={{ margin: 0, flex: "1 1 240px" }}>
                <label className="form-label">
                  Add plan item to{" "}
                  {activeSprint === "backlog"
                    ? "Backlog"
                    : activeSprint === "all"
                      ? "a sprint (pick one above)"
                      : sprintLabel(activeSprint)}
                </label>
                <input
                  className="text-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Implementation milestone…"
                  disabled={activeSprint === "all"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void addBacklogItem();
                  }}
                />
              </div>
              <div className="form-group" style={{ margin: 0, width: 130 }}>
                <label className="form-label">Assignee</label>
                <select
                  className="select-input"
                  value={activeSprint === "backlog" ? "Unassigned" : newOwner}
                  onChange={(e) => setNewOwner(e.target.value as PlanOwner)}
                  disabled={activeSprint === "all" || activeSprint === "backlog"}
                  title={
                    activeSprint === "backlog"
                      ? "Pick a sprint first — Backlog items stay Unassigned until moved into a sprint"
                      : activeSprint === "all"
                        ? "Pick a sprint above before adding"
                        : undefined
                  }
                >
                  <option value="Unassigned">Unassigned</option>
                  <option value="Tina">Tina</option>
                  <option value="Evelyn">Evelyn</option>
                  <option value="Lyriq">Lyriq</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void addBacklogItem()}
                disabled={busy || !newTitle.trim() || activeSprint === "all"}
              >
                <Plus size={14} /> Add
              </button>
              {isSprintIndex(activeSprint) &&
                !isSprintLocked(closedSprints, activeSprint) && (
                <button
                  type="button"
                  className="inline-text-link schedule-sprint-bubble-link"
                  data-testid="end-sprint-btn"
                  onClick={() => openEndSprint(activeSprint)}
                  disabled={busy}
                  title={`Done ${sprintLabel(activeSprint)} — review open tasks/tests to rollover or complete`}
                >
                  Done {sprintLabel(activeSprint)}
                  {incompleteEndSprintWork.tasks.length + incompleteEndSprintWork.tests.length > 0
                    ? ` (${incompleteEndSprintWork.tasks.length + incompleteEndSprintWork.tests.length} open)`
                    : ""}
                </button>
              )}
              {isSprintIndex(activeSprint) && isSprintLocked(closedSprints, activeSprint) && (
                <button
                  type="button"
                  className="inline-text-link schedule-sprint-bubble-link"
                  data-testid="reopen-sprint-btn"
                  onClick={() => void confirmReopenSprint(activeSprint)}
                  disabled={busy}
                  title={`Re-open ${sprintLabel(activeSprint)} — unlock so items can be edited again`}
                >
                  Re-open {sprintLabel(activeSprint)}
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary qa-save-btn--ready"
                onClick={() => void saveAllDirty()}
                disabled={busy || dirtyCount === 0}
                data-testid="sprint-board-save-all"
                title={
                  dirtyCount > 0
                    ? "Save all unsaved card edits"
                    : "No unsaved changes"
                }
              >
                <Save size={14} /> Save all{dirtyCount > 0 ? ` (${dirtyCount})` : ""}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetDrafts}
                disabled={
                  busy ||
                  loading ||
                  (dirtyCount === 0 && !newTitle.trim() && !bulkStagingActive && filtersAreAll)
                }
                data-testid="sprint-board-reset"
                title={
                  dirtyCount > 0 || newTitle.trim() || bulkStagingActive || !filtersAreAll
                    ? "Discard unsaved edits / bulk staging and set all filters to All"
                    : "Nothing to reset — filters already All, no unsaved changes"
                }
                aria-label={
                  dirtyCount > 0 || newTitle.trim() || bulkStagingActive || !filtersAreAll
                    ? "Reset unsaved card edits and set all filters to All"
                    : "Reset unavailable — nothing to clear"
                }
              >
                <RotateCcw size={14} /> Re-Set
              </button>
            </div>
            {saveFlash && (
              <p style={{ marginTop: 10, color: "#2e7d32", fontSize: "0.95rem", fontWeight: 600 }}>
                {saveFlash}
              </p>
            )}
            {loading && <WaitIndicator message="Loading sprint board…" />}
          </div>

          <div
            className="glass sprint-board-bulk"
            data-testid="sprint-board-bulk"
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(155,47,40,0.2)",
              background: "linear-gradient(135deg, rgba(215,198,151,0.35), #fff)",
            }}
          >
            <CollapsibleFilterSection
              title="Bulk Edit"
              hint={`${selectedKeys.size} selected · Apply stages; Save / Save all persists`}
              testId="schedule-filter-bulk-edit"
              defaultOpen
            >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "end",
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "8px 12px" }}
                onClick={toggleSelectAllVisible}
                disabled={busy || visibleCards.length === 0}
              >
                {visibleCards.length > 0 && visibleCards.every((c) => selectedKeys.has(c.key)) ? (
                  <>
                    <CheckSquare size={14} /> Clear selection
                  </>
                ) : (
                  <>
                    <Square size={14} /> Select visible
                  </>
                )}
              </button>
              <div className="form-group" style={{ margin: 0, minWidth: 220 }}>
                <label className="form-label" id="schedule-bulk-assigned-to-label">
                  Assigned To
                </label>
                <AssigneeMultiSelect
                  aria-label="Bulk Assigned To"
                  value={bulkAssignee || "Unassigned"}
                  onChange={(next) =>
                    setBulkAssignee(next === "Unassigned" && !bulkAssignee ? "" : next)
                  }
                  disabled={busy}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ marginTop: 6, padding: "2px 8px", fontSize: "0.8125rem" }}
                  disabled={busy}
                  onClick={() => setBulkAssignee("")}
                >
                  — keep current —
                </button>
              </div>
              {isAdmin && (
                <div className="form-group" style={{ margin: 0, minWidth: 150 }}>
                  <label className="form-label" htmlFor="schedule-bulk-assign-by">
                    Assigned By
                  </label>
                  <select
                    id="schedule-bulk-assign-by"
                    className="select-input"
                    value={bulkAssignBy}
                    onChange={(e) => setBulkAssignBy(e.target.value)}
                    disabled={busy}
                    aria-label="Bulk Assigned By for selected cards"
                  >
                    <option value="">— keep —</option>
                    {assignByOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group" style={{ margin: 0, minWidth: 150 }}>
                <label className="form-label">Sprint</label>
                <select
                  className="select-input"
                  value={bulkSprint}
                  onChange={(e) => setBulkSprint(e.target.value)}
                  disabled={busy}
                >
                  <option value="">— keep —</option>
                  <option value={BACKLOG_SPRINT}>Backlog</option>
                  {sprints.map((s) => (
                    <option
                      key={s.index}
                      value={s.index}
                      disabled={isSprintLocked(closedSprints, s.index)}
                    >
                      {s.label}
                      {isSprintLocked(closedSprints, s.index) ? " · Locked" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, minWidth: 160 }}>
                <label className="form-label">Status</label>
                <select
                  className="select-input"
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  disabled={busy}
                >
                  <option value="">— keep —</option>
                  {BULK_STATUS_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, minWidth: 150 }}>
                <label className="form-label" htmlFor="schedule-bulk-due">
                  Due
                </label>
                <input
                  id="schedule-bulk-due"
                  className="text-input"
                  type="date"
                  value={bulkDueDate}
                  onChange={(e) => setBulkDueDate(e.target.value)}
                  disabled={busy}
                  aria-label="Bulk due date for selected cards"
                />
              </div>
              <div className="form-group" style={{ margin: 0, minWidth: 220, flex: "1 1 200px" }}>
                <label className="form-label" htmlFor="schedule-bulk-desc">
                  Description / note
                </label>
                <input
                  id="schedule-bulk-desc"
                  className="text-input"
                  value={bulkDescription}
                  onChange={(e) => setBulkDescription(e.target.value)}
                  disabled={busy}
                  placeholder="Apply to selected cards…"
                  aria-label="Bulk description or note for selected cards"
                />
              </div>
              <button
                type="button"
                className="btn btn-outline"
                disabled={busy || selectedKeys.size === 0}
                onClick={() => applyBulkToSelected(false)}
              >
                Apply to selected
              </button>
              <button
                type="button"
                className="btn btn-primary qa-save-btn--ready"
                disabled={busy || selectedKeys.size === 0}
                onClick={() => applyBulkToSelected(true)}
                title={
                  selectedKeys.size > 0
                    ? "Apply bulk edits and save selected cards"
                    : "Select cards first"
                }
              >
                <Save size={14} /> Apply &amp; save selected
              </button>
            </div>
            </CollapsibleFilterSection>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visibleCards.map((card) => {
              const linkedTaskIds =
                card.source === "task"
                  ? [card.sourceId]
                  : card.source === "plan"
                    ? taskIdsInText(`${card.title} ${card.notes}`)
                    : [];
              const linkedTestId = card.source === "test" ? card.sourceId : null;
              const dirty = isCardDirty(card.key);
              const selected = selectedKeys.has(card.key);
              const statusVal = cardStatusValue(card);
              const sprintVal = cardSprintValue(card);
              const assigneeVal = cardAssigneeValue(card);
              const assigneeFilterVal = cardAssigneeFilterValue(card);
              const assignByVal = cardAssignByValue(card);
              const noteVal = cardNoteValue(card);
              const dueVal = cardDueDateValue(card);
              const showAssignBy = card.source === "task" || card.source === "test";
              const noteRequired =
                card.source === "test" && statusRequiresNote(statusVal as TestStatus);
              const cardLocked =
                isSprintLocked(closedSprints, card.sprint) ||
                isSprintLocked(closedSprints, sprintVal);
              const controlsDisabled = busy || cardLocked;

              const statusAccent = STATUS_COLORS[statusVal] || STATUS_COLORS[card.status] || "#9ca3af";
              const statusFill =
                statusVal === "done" || statusVal === "pass"
                  ? "#dcfce7"
                  : statusVal === "fail" || statusVal === "carried"
                    ? "#fee2e2"
                    : statusVal === "in_progress"
                      ? "#fef9c3"
                      : statusVal === "blocked" || statusVal === "failed_retest"
                        ? "#ffedd5"
                        : statusVal === "fixed_retest"
                          ? "#dbeafe"
                          : statusVal === "not_run" || statusVal === "not_started" || statusVal === "todo"
                            ? "#f3f4f6"
                            : "#fff";

              return (
              <div
                key={card.key}
                className="glass"
                data-dirty={dirty ? "true" : "false"}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  borderLeft: `4px solid ${statusAccent}`,
                  background: dirty ? "rgba(215,198,151,0.28)" : statusFill,
                  outline: selected ? "2px solid var(--bronze)" : undefined,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 12,
                    alignItems: "start",
                  }}
                >
                  <label
                    style={{ display: "flex", alignItems: "center", paddingTop: 4, cursor: "pointer" }}
                    title="Select for bulk edit"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelectCard(card.key)}
                      aria-label={`Select ${card.title}`}
                    />
                  </label>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          color: "#fff",
                          background: card.kindColor,
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {card.kindLabel}
                      </span>
                      {cardLocked && <SprintLockedBanner size={12} />}
                      {dirty && (
                        <span
                          className="glow-badge amber"
                          style={{ fontSize: "0.9375rem" }}
                        >
                          Unsaved
                        </span>
                      )}
                      <strong style={{ color: "var(--charcoal)" }}>{card.title}</strong>
                      <span
                        style={{
                          fontSize: "0.9375rem",
                          color:
                            assigneeFilterVal === "Unassigned" || !assigneeFilterVal
                              ? "#9B2F28"
                              : "var(--text-muted)",
                          fontWeight:
                            assigneeFilterVal === "Unassigned" || !assigneeFilterVal
                              ? 700
                              : 500,
                        }}
                      >
                        Assignee:{" "}
                        {isBacklogSprint(sprintVal)
                          ? "Unassigned"
                          : assigneeDisplayLabel(assigneeFilterVal || "Unassigned")}
                      </span>
                      {showAssignBy && (
                        <span
                          style={{
                            fontSize: "0.9375rem",
                            color: "var(--text-muted)",
                            fontWeight: 500,
                          }}
                          data-testid={`board-assign-by-${card.key}`}
                        >
                          Assigned By: {assignByVal || "—"}
                        </span>
                      )}
                      {formatAuditTrail(card.updatedAt, card.updatedBy) && (
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            opacity: 0.85,
                          }}
                        >
                          {formatAuditTrail(card.updatedAt, card.updatedBy)}
                        </span>
                      )}
                    </div>
                    {card.source === "plan" && card.notes && (
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: "0.9375rem",
                          color: "var(--text-primary)",
                          lineHeight: 1.45,
                        }}
                      >
                        <MarkdownLinkText text={card.notes} />
                      </p>
                    )}
                    {(linkedTaskIds.length > 0 || linkedTestId) && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          marginTop: 8,
                          alignItems: "center",
                        }}
                      >
                        {linkedTestId && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "4px 10px", fontSize: "0.9375rem" }}
                            onClick={() => onOpenTest?.(linkedTestId)}
                            disabled={!onOpenTest}
                            title={`Open ${linkedTestId} in Testing Portal`}
                          >
                            <ExternalLink size={12} /> Test {linkedTestId}
                          </button>
                        )}
                        {linkedTaskIds.map((tid) => (
                          <button
                            key={tid}
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "4px 10px", fontSize: "0.9375rem" }}
                            onClick={() => onOpenTask?.(tid)}
                            disabled={!onOpenTask}
                            title={`Open ${tid} in Task List`}
                          >
                            <ExternalLink size={12} /> Task {tid}
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className="sprint-card-controls"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr)",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      <label
                        style={{
                          display: "grid",
                          gridTemplateColumns: "88px minmax(0, 1fr)",
                          gap: 10,
                          alignItems: "center",
                          fontSize: "0.9375rem",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                        }}
                      >
                        Assignee
                        {(card.source === "plan" || card.source === "task") && (
                          <AssigneeMultiSelect
                            aria-label={`Assignees for ${card.title}`}
                            value={
                              isBacklogSprint(sprintVal) ? "Unassigned" : assigneeVal
                            }
                            onChange={(next) =>
                              stageCardDraft(card, { assignee: next })
                            }
                            disabled={controlsDisabled || isBacklogSprint(sprintVal)}
                          />
                        )}
                        {card.source === "test" &&
                          (isAutomatedTestId(card.sourceId) && !isBacklogSprint(sprintVal) ? (
                            <select
                              className="select-input"
                              aria-label={`Assignee for ${card.title}`}
                              style={{ width: "100%", minWidth: 0 }}
                              value={assigneeVal || TEST_DEFAULT_ASSIGNEES[card.sourceId] || "vitest"}
                              disabled
                              title="Automated suite owner — locked"
                            >
                              {AUTOMATED_SUITE_OWNERS.map((owner) => (
                                <option key={owner.id} value={owner.id}>
                                  {owner.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              className="select-input"
                              aria-label={`Assignee for ${card.title}`}
                              style={{ width: "100%", minWidth: 0 }}
                              value={assigneeVal}
                              onChange={(e) =>
                                stageCardDraft(card, { assignee: e.target.value })
                              }
                              disabled={controlsDisabled}
                              title={
                                cardLocked
                                  ? sprintLockedMessage(card.sprint)
                                  : undefined
                              }
                            >
                              <option value="">Unassigned</option>
                              {QA_TESTERS.map((tester) => (
                                <option key={tester.id} value={tester.id}>
                                  {tester.shortName}
                                </option>
                              ))}
                            </select>
                          ))}
                      </label>

                      {showAssignBy && (
                          <label
                            style={{
                              display: "grid",
                              gridTemplateColumns: "88px minmax(0, 1fr)",
                              gap: 10,
                              alignItems: "center",
                              fontSize: "0.9375rem",
                              color: "var(--text-primary)",
                              fontWeight: 600,
                            }}
                          >
                            Assigned By
                            <select
                              className="select-input"
                              aria-label={`Assigned By for ${card.title}`}
                              style={{ width: "100%", minWidth: 0 }}
                              value={assignByVal}
                              onChange={(e) =>
                                stageCardDraft(card, { assignBy: e.target.value })
                              }
                              disabled={controlsDisabled}
                            >
                              {card.source === "task" && !assignByVal && (
                                <option value="" disabled>
                                  —
                                </option>
                              )}
                              {assignByOptions.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}

                      <label
                        style={{
                          display: "grid",
                          gridTemplateColumns: "88px minmax(0, 1fr)",
                          gap: 10,
                          alignItems: "center",
                          fontSize: "0.9375rem",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                        }}
                      >
                        Status
                        {card.source === "plan" && (
                          <select
                            className="select-input"
                            aria-label={`Status for ${card.title}`}
                            style={{ width: "100%", minWidth: 0 }}
                            value={statusVal}
                            onChange={(e) =>
                              stageCardDraft(card, { status: e.target.value })
                            }
                            disabled={controlsDisabled}
                          >
                            {(Object.keys(STATUS_LABELS) as PlanItemStatus[]).map((s) => {
                              const plan = items.find((i) => i.id === card.sourceId);
                              const bothBlocked =
                                !!plan &&
                                requiresPartnerDone(plan.owner) &&
                                s === "done" &&
                                !(plan.tinaDone && plan.evelynDone);
                              return (
                                <option key={s} value={s} disabled={bothBlocked}>
                                  {STATUS_LABELS[s]}
                                </option>
                              );
                            })}
                          </select>
                        )}
                        {card.source === "task" && (
                          <select
                            className="select-input"
                            aria-label={`Status for ${card.title}`}
                            style={{ width: "100%", minWidth: 0 }}
                            value={statusVal}
                            onChange={(e) =>
                              stageCardDraft(card, { status: e.target.value })
                            }
                            disabled={controlsDisabled}
                          >
                            {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => {
                              const task = tasks.find((t) => t.id === card.sourceId);
                              const bothBlocked =
                                !!task &&
                                requiresPartnerDone(task.assignedTo) &&
                                s === "done" &&
                                !(task.tinaDone && task.evelynDone);
                              return (
                                <option key={s} value={s} disabled={bothBlocked}>
                                  {TASK_STATUS_LABELS[s]}
                                </option>
                              );
                            })}
                          </select>
                        )}
                        {card.source === "test" && (
                          <select
                            className="select-input"
                            aria-label={`Status for ${card.title}`}
                            style={{ width: "100%", minWidth: 0 }}
                            value={statusVal}
                            onChange={(e) =>
                              stageCardDraft(card, { status: e.target.value })
                            }
                            disabled={controlsDisabled}
                          >
                            {(Object.keys(TEST_STATUS_LABELS) as TestStatus[])
                              .filter((s) => {
                                if (
                                  isAutomatedTestId(card.sourceId) &&
                                  s === "in_progress" &&
                                  String(statusVal) !== "in_progress"
                                ) {
                                  return false;
                                }
                                return (
                                  s !== "blocked" ||
                                  canBlockTests ||
                                  String(statusVal) === "blocked"
                                );
                              })
                              .map((s) => (
                                <option
                                  key={s}
                                  value={s}
                                  disabled={s === "blocked" && !canBlockTests}
                                >
                                  {TEST_STATUS_LABELS[s]}
                                  {s === "blocked" && !canBlockTests ? " (Evelyn only)" : ""}
                                </option>
                              ))}
                          </select>
                        )}
                      </label>

                      <label
                        style={{
                          display: "grid",
                          gridTemplateColumns: "88px minmax(0, 1fr) auto",
                          gap: 10,
                          alignItems: "center",
                          fontSize: "0.9375rem",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                        }}
                      >
                        Sprint
                        <select
                          className="select-input"
                          style={{ width: "100%", minWidth: 0 }}
                          value={sprintVal}
                          onChange={(e) =>
                            stageCardDraft(card, { sprint: Number(e.target.value) })
                          }
                          disabled={controlsDisabled}
                          aria-label={`Sprint for ${card.title}`}
                        >
                          <option value={BACKLOG_SPRINT}>Backlog</option>
                          {sprints.map((s) => (
                            <option
                              key={s.index}
                              value={s.index}
                              disabled={isSprintLocked(closedSprints, s.index)}
                            >
                              {s.label} ({s.startLabel}–{s.endLabel.replace(/, \d{4}$/, "")})
                              {isSprintLocked(closedSprints, s.index) ? " · Locked" : ""}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn-primary qa-save-btn--ready"
                          style={{ padding: "8px 14px", whiteSpace: "nowrap" }}
                          disabled={controlsDisabled || !dirty}
                          onClick={() => {
                            if (cardLocked) {
                              setError(sprintLockedMessage(card.sprint));
                              return;
                            }
                            void saveCard(card);
                          }}
                          data-testid={`sprint-card-save-${card.sourceId}`}
                          title={
                            cardLocked
                              ? sprintLockedMessage(card.sprint)
                              : dirty
                                ? "Save this card"
                                : "No unsaved changes"
                          }
                        >
                          <Save size={14} /> Save
                        </button>
                      </label>

                      <label
                        style={{
                          display: "grid",
                          gridTemplateColumns: "88px minmax(0, 1fr)",
                          gap: 10,
                          alignItems: "center",
                          fontSize: "0.9375rem",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                        }}
                      >
                        Due
                        <input
                          className="text-input"
                          type="date"
                          style={{ width: "100%", minWidth: 0 }}
                          value={mmddyyToIso(dueVal)}
                          onChange={(e) => {
                            const next = e.target.value
                              ? isoToMmddyy(e.target.value) || ""
                              : "";
                            stageCardDraft(card, { dueDate: next });
                          }}
                          disabled={controlsDisabled || isBacklogSprint(sprintVal)}
                          aria-label={`Due date for ${card.title}`}
                          title={
                            isBacklogSprint(sprintVal)
                              ? "Backlog items have no due date until moved into a sprint"
                              : undefined
                          }
                          data-testid={`sprint-card-due-${card.sourceId}`}
                        />
                      </label>

                      {(card.source === "task" || card.source === "test") && (
                        <div
                          style={{ marginTop: 4 }}
                          data-testid={`sprint-card-notes-${card.sourceId}`}
                        >
                          <NotesThread
                            rawNotes={
                              drafts[card.key]?.note !== undefined
                                ? String(drafts[card.key]?.note ?? "")
                                : cardStoredNotes(card)
                            }
                            actor={actingAssignBy}
                            priorAttribution={priorNoteAttributionForCard(card)}
                            editDrafts={editNoteDrafts[card.key]}
                            newDraft={newNoteDrafts[card.key] ?? ""}
                            onEditDraft={(noteId, text) =>
                              setBoardEditNoteDraft(card.key, noteId, text)
                            }
                            onNewDraft={(text) => setBoardNewNoteDraft(card.key, text)}
                            onDeleteNote={(noteId) =>
                              setBoardEditNoteDraft(card.key, noteId, "")
                            }
                            disabled={controlsDisabled}
                            label={
                              cardNotesDirty(card.key, cardStoredNotes(card)) ||
                              drafts[card.key]?.note !== undefined
                                ? "Notes (unsaved)"
                                : "Notes"
                            }
                            requiredHint={
                              noteRequired
                                ? "(required for Fail / Blocked)"
                                : undefined
                            }
                            newPlaceholder={
                              noteRequired
                                ? "Required: what failed or what is blocking…"
                                : "Add your note… (only you can edit or delete it)"
                            }
                            invalid={
                              noteRequired &&
                              !noteMeetsRequirement(composedNotesForCard(card))
                            }
                          />
                        </div>
                      )}
                      {card.source === "plan" && (
                        <label
                          style={{
                            display: "grid",
                            gridTemplateColumns: "88px minmax(0, 1fr)",
                            gap: 10,
                            alignItems: "start",
                            fontSize: "0.9375rem",
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          Notes
                          <textarea
                            className="text-input"
                            rows={2}
                            style={{ width: "100%", minWidth: 0, resize: "vertical" }}
                            value={noteVal}
                            onChange={(e) =>
                              stageCardDraft(card, { note: e.target.value })
                            }
                            placeholder="Notes / description…"
                            disabled={controlsDisabled}
                            aria-label={`Notes for ${card.title}`}
                            data-testid={`sprint-card-notes-${card.sourceId}`}
                          />
                        </label>
                      )}

                      {(card.source === "test" || card.source === "task") && (
                        <div className="task-card-control task-card-control--timer" style={{ marginTop: 4 }}>
                          <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Time</span>
                          <WorkTimer
                            source={card.source}
                            sourceId={card.sourceId}
                            sourceLabel={card.title}
                            entry={timers.entryFor(card.source, card.sourceId)}
                            onChanged={timers.onChanged}
                            compact
                            disabled={
                              card.source === "test"
                                ? ["pass", "conditional_approval", "fail", "blocked"].includes(
                                    String(statusVal),
                                  )
                                : statusVal === "done"
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {card.source === "plan" &&
                  (() => {
                    const item = items.find((i) => i.id === card.sourceId);
                    if (!item) return null;
                    return (
                      <PlanItemAttachments
                        item={item}
                        readOnly={cardLocked}
                        onChange={(attachments) =>
                          void patchPlanAttachments(item.id, attachments)
                        }
                      />
                    );
                  })()}
                {((card.source === "plan" &&
                  requiresPartnerDone(
                    items.find((i) => i.id === card.sourceId)?.owner,
                  )) ||
                  (card.source === "task" &&
                    requiresPartnerDone(
                      tasks.find((t) => t.id === card.sourceId)?.assignedTo,
                    ))) && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    <span style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                      Partner done (both required):
                    </span>
                    {(() => {
                      const plan = items.find((i) => i.id === card.sourceId);
                      const task = tasks.find((t) => t.id === card.sourceId);
                      const tinaDone =
                        card.source === "plan" ? !!plan?.tinaDone : !!task?.tinaDone;
                      const evelynDone =
                        card.source === "plan" ? !!plan?.evelynDone : !!task?.evelynDone;
                      return (
                        <>
                          <button
                            type="button"
                            className={`btn ${tinaDone ? "btn-partner-done" : "btn-outline"}`}
                            style={{
                              padding: "4px 10px",
                              fontSize: "0.9375rem",
                              borderColor: "#9B2F28",
                              background: tinaDone ? "#9B2F28" : undefined,
                              color: tinaDone ? "#fff" : "#9B2F28",
                            }}
                            onClick={() => void togglePartnerDone(card, "tina")}
                            disabled={controlsDisabled}
                          >
                            Tina {tinaDone ? "✓ Done" : "○ Mark done"}
                          </button>
                          <button
                            type="button"
                            className={`btn ${evelynDone ? "btn-partner-done" : "btn-outline"}`}
                            style={{
                              padding: "4px 10px",
                              fontSize: "0.9375rem",
                              borderColor: "#947D64",
                              background: evelynDone ? "#947D64" : undefined,
                              color: evelynDone ? "#fff" : "#947D64",
                            }}
                            onClick={() => void togglePartnerDone(card, "evelyn")}
                            disabled={controlsDisabled}
                          >
                            Evelyn {evelynDone ? "✓ Done" : "○ Mark done"}
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              );
            })}
            {!loading && visibleCards.length === 0 && (
              <div
                className="glass"
                style={{ padding: 24, textAlign: "center", color: "var(--text-primary)" }}
              >
                {searchQuery.trim()
                  ? `No cards match “${searchQuery.trim()}” with the current filters.`
                  : activeSprint === "backlog"
                    ? "Backlog is empty for this filter."
                    : activeSprint === "all"
                      ? "No sprint-assigned items for this filter."
                      : "No items in this sprint for this filter — pull from the Backlog."}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "ceremonies" && (
        <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
          <h3 style={{ fontSize: "1.15rem", color: "var(--charcoal)", marginBottom: 6 }}>
            Ceremonies —{" "}
            {isSprintIndex(activeSprint)
              ? `${sprintLabel(activeSprint)} (${getSprintWindow(activeSprint).rangeLabel})`
              : "pick a sprint"}
          </h3>
          <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: 14 }}>
            Standup 3× per week (Tue / Thu / Sat). Planning/Review on Sunday (day before the
            sprint ends) to close Done work and carry incomplete items. Retrospective on Monday
            sprint-end — capture notes on the Retrospective board.
          </p>
          {!isSprintIndex(activeSprint) ? (
            <p style={{ color: "var(--text-primary)" }}>Select a sprint above to see its ceremonies.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ceremonies.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border-color)",
                    background: "#fff",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--charcoal)" }}>
                      {c.dateLabel}
                    </div>
                    <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>{c.time}</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          color: "#fff",
                          background: CEREMONY_COLORS[c.type],
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {CEREMONY_LABELS[c.type]}
                      </span>
                      <strong style={{ color: "var(--charcoal)" }}>{c.title}</strong>
                    </div>
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "0.95rem",
                        color: "var(--text-primary)",
                        lineHeight: 1.45,
                      }}
                    >
                      {c.agenda}
                    </p>
                    {c.type === "planning" && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ marginTop: 10, padding: "6px 12px", fontSize: "0.9375rem" }}
                        onClick={() => setTab("board")}
                      >
                        Open sprint board to review / carry over
                      </button>
                    )}
                    {c.type === "retrospective" && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ marginTop: 10, padding: "6px 12px", fontSize: "0.9375rem" }}
                        onClick={() => setTab("retro")}
                      >
                        Open Retrospective board
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "retro" && (
        <div className="glass" style={{ padding: 20, borderRadius: 14 }}>
          <h3
            style={{
              fontSize: "1.15rem",
              color: "var(--charcoal)",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MessageSquare size={18} style={{ color: "var(--bronze)" }} /> Retrospective board
          </h3>
          <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: 14 }}>
            {isSprintIndex(activeSprint)
              ? `${sprintLabel(activeSprint)} — Went well · Needs improvement · Action items`
              : "Select a sprint to run its retrospective."}
          </p>
          {!isSprintIndex(activeSprint) ? (
            <p style={{ color: "var(--text-primary)" }}>Pick a sprint first.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {RETRO_COLUMNS.map((col) => {
                const cards = retroForSprint.filter((c) => c.column === col.id);
                return (
                  <div
                    key={col.id}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid var(--border-color)",
                      background: "rgba(215,198,151,0.15)",
                      minHeight: 220,
                    }}
                  >
                    <strong style={{ color: "var(--charcoal)", fontSize: "0.95rem" }}>
                      {col.label}
                    </strong>
                    <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", margin: "4px 0 10px" }}>
                      {col.hint}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            background: "#fff",
                            border: "1px solid var(--border-color)",
                            fontSize: "0.95rem",
                            color: "var(--charcoal)",
                          }}
                        >
                          <div>{card.text}</div>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              marginTop: 6,
                              padding: "2px 8px",
                              fontSize: "1rem",
                              color: "#9B2F28",
                            }}
                            onClick={() => void removeRetroCard(card.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {cards.length === 0 && (
                        <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>No cards yet</p>
                      )}
                    </div>
                    <textarea
                      className="text-input"
                      rows={2}
                      value={retroDraft[col.id]}
                      onChange={(e) =>
                        setRetroDraft((d) => ({ ...d, [col.id]: e.target.value }))
                      }
                      placeholder={`Add to ${col.label}…`}
                      style={{ resize: "vertical", width: "100%", fontSize: "0.95rem" }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ marginTop: 8, padding: "6px 12px", fontSize: "0.9375rem" }}
                      disabled={busy || !retroDraft[col.id].trim()}
                      onClick={() => void addRetroCard(col.id)}
                    >
                      <Plus size={14} /> Add card
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
