import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import {
  Camera,
  ExternalLink,
  FlaskConical,
  Paperclip,
  Search,
  ChevronDown,
  ChevronRight,
  Play,
  Trash2,
} from "lucide-react";
import { BusyOverlay, WaitIndicator, WaitLabel } from "../WaitFeedback";
import { MarkdownLinkText } from "./MarkdownLinkText";
import {
  TEST_CASES,
  DEFAULT_TEST_STATUS,
  TEST_STATUSES,
  isTestStatusResolved,
  STATUS_LABELS,
  PRIORITY_LABELS,
  SUITE_LABELS,
  TEST_CATEGORIES,
  TEST_CATEGORY_LABELS,
  TEST_FACINGS,
  TEST_FACING_LABELS,
  categoryForCase,
  facingForCase,
  fetchTestStatuses,
  saveTestStatus,
  saveTestStatusesBatch,
  runAutomatedSuite,
  withDefaultSuite,
  statusRequiresNote,
  noteMeetsRequirement,
  isDevFixStatus,
  allStepsChecked,
  NOTE_MIN_LENGTH,
  TEST_EVIDENCE_ACCEPT,
  uploadTestEvidence,
  deleteTestEvidence,
  fetchTestEvidenceContent,
  fileToBase64,
  type TestStatus,
  type TestSuite,
  type TestCategory,
  type TestFacing,
  type AutomatedSuite,
  type AutomatedRunMode,
  type GeneratedTestCase,
  type TestCase,
  type TestAttachmentMeta,
  type TestStatusesPayload,
} from "../../lib/gysh-test-plan";
import {
  AUTOMATED_VITEST_CASES,
  AUTOMATED_PLAYWRIGHT_CASES,
  isAutomatedTestId,
  isWizardMatrixCaseId,
} from "../../lib/gysh-automated-tests";
import vitestLastRun from "../../lib/vitest-last-run.json";
import {
  AUTOMATED_SUITE_OWNERS,
  FAILED_TEST_ASSIGNEE,
  normalizeQaAssigneeId,
  LEAD_DEVELOPER_LABEL,
  QA_TESTERS,
  devAssigneesFromUsers,
  fetchUsers,
  isHumanQaTester,
  testOwnerLabel,
  type QaTester,
  type QaTesterId,
  type TestOwnerId,
} from "../../lib/gysh-roles";
import { proofreadOwnerFromId } from "../../lib/gysh-proofread-cases";
import { manualQaOwnerForStats } from "../../lib/gysh-tester-ownership";
import {
  listUpcomingSprints,
  sprintLabel,
  BACKLOG_SPRINT,
  currentSprintIndex,
  dueDateForSprint,
  assigneeForBacklogSprint,
  isBacklogSprint,
} from "../../lib/gysh-sprints";
import {
  fetchClosedSprints,
  isSprintEditLocked,
  isSprintLocked,
  sprintLockedMessage,
} from "../../lib/gysh-closed-sprints";
import { SprintLockedBanner } from "./SprintLockedBanner";
import {
  healIncompleteTestDueDates,
  sprintRolloverSummary,
  testIsRolledOver,
} from "../../lib/gysh-sprint-board";
import { formatAuditTrail } from "../../lib/gysh-audit";
import {
  appendActorNote,
  applyNoteDrafts,
  noteEntriesPlainText,
  notesHaveUnsavedDraft,
} from "../../lib/gysh-note-entries";
import {
  SYSTEM_ASSIGNED_BY,
  assignedBySelectOptions,
  auditActorLabel,
  canSetDevFixStatus,
  canSetTestBlocked,
  todayMMDDYY as assignmentToday,
  userCanChangeTestStatus,
  userHasAdminRole,
} from "../../lib/gysh-assignment";
import {
  base64ToBlob,
  fetchTasks,
  isoToMmddyy,
  mmddyyToIso,
  type GyshTask,
} from "../../lib/gysh-tasks";
import {
  canViewAttachmentInline,
  openAttachmentBlob,
  type AttachmentOpenMode,
} from "../../lib/gysh-attachments";
import { ApiError } from "../../lib/api";
import type { AuthUser } from "../../lib/auth";
import { suggestedSprintForTest } from "../../lib/gysh-sprint-board";
import {
  completeWorkTimer,
  ensureWorkTimerStarted,
} from "../../lib/gysh-time-entries";
import { useActiveTimers } from "../../lib/use-active-timers";
import { ShowHideChevron, ShowHideToggle } from "../ShowHideToggle";
import { SprintStatusBars } from "./SprintStatusBars";
import {
  QaProgressBars,
  TesterStatusRow,
  emptyTally,
  tallyStatuses,
  type StatusTally,
} from "./QaProgressBars";
import { WorkTimer } from "./WorkTimer";
import { NotesThread } from "./NotesThread";

/** Status tiles / filters / set-buttons — audit Fixed/* are counts under Test Suites, not statuses. */
const STATUSES: TestStatus[] = TEST_STATUSES.filter(
  (s) => s !== "fixed_lighthouse" && s !== "fixed_foresight",
);

function pctComplete(done: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((done / total) * 100)}%`;
}

function countWithPct(done: number, total: number, suffix = ""): string {
  const base = `${done}/${total}${suffix}`;
  return `${base} · ${pctComplete(done, total)}`;
}

type SprintFilterKey = number | "backlog";
/** Human QA chips + Unassigned (no Tina/Evelyn/Lyriq owner). */
type TesterFilterKey = QaTesterId | "unassigned";

const UNASSIGNED_TESTER_ACCENT = "#7a7064";

function toggleSetValue<T>(prev: Set<T>, value: T): Set<T> {
  const next = new Set(prev);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

/** Multi-select toggle with Shift+click range select (like Categories). */
function applyMultiSelectClick<T>(
  prev: Set<T>,
  value: T,
  ordered: readonly T[],
  lastIndex: number | null,
  shiftKey: boolean,
): { next: Set<T>; lastIndex: number | null } {
  const idx = ordered.indexOf(value);
  if (shiftKey && lastIndex != null && idx >= 0) {
    const lo = Math.min(lastIndex, idx);
    const hi = Math.max(lastIndex, idx);
    const next = new Set(prev);
    for (let i = lo; i <= hi; i++) next.add(ordered[i]!);
    return { next, lastIndex: idx };
  }
  return { next: toggleSetValue(prev, value), lastIndex: idx >= 0 ? idx : lastIndex };
}

function FilterChip({
  active,
  onToggle,
  children,
  title,
  accent,
  testId,
  locked,
}: {
  active: boolean;
  onToggle: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  title?: string;
  accent?: string;
  testId?: string;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      className="qa-tester-bubble qa-filter-chip"
      data-active={active ? "true" : "false"}
      data-locked={locked ? "true" : "false"}
      data-testid={testId}
      title={title}
      onClick={onToggle}
      style={
        active && accent
          ? { borderColor: accent, boxShadow: `0 0 0 1px ${accent}` }
          : undefined
      }
    >
      <input
        type="checkbox"
        className="qa-filter-chip__check"
        checked={active}
        readOnly
        tabIndex={-1}
        aria-hidden
      />
      {children}
    </button>
  );
}

/** List order: rolled over / in progress → retest → not started → fail/blocked → done. */
const STATUS_LIST_ORDER: Record<TestStatus, number> = {
  rolled_over: 0,
  in_progress: 1,
  fixed_retest: 2,
  failed_retest: 3,
  fixed_cursor: 4,
  fixed_lighthouse: 5,
  fixed_foresight: 6,
  not_run: 7,
  fail: 8,
  blocked: 9,
  conditional_approval: 10,
  pass: 11,
};

const STATUS_COLOR: Record<TestStatus, string> = {
  not_run: "#9ca3af",
  in_progress: "#ca8a04",
  rolled_over: "#0e7490",
  pass: "#16a34a",
  conditional_approval: "#0f766e",
  fail: "#dc2626",
  blocked: "#ea580c",
  fixed_retest: "#2563eb",
  failed_retest: "#f97316",
  fixed_cursor: "#7c3aed",
  fixed_lighthouse: "#0891b2",
  fixed_foresight: "#b45309",
};

const BASE_CASES: TestCase[] = [
  ...withDefaultSuite(TEST_CASES),
  ...AUTOMATED_VITEST_CASES,
  ...AUTOMATED_PLAYWRIGHT_CASES,
];

function generatedToCase(g: GeneratedTestCase): TestCase {
  return {
    id: g.id,
    area: g.area,
    title: g.title,
    priority: g.priority,
    roles: ["qa", "admin"],
    // New failure cases default to Evelyn (human owner), not the suite runner.
    assignees: ["evelyn"],
    suite: g.suite,
    steps: [
      ...g.steps,
      ...(g.fixSteps.length ? ["— Steps to fix —", ...g.fixSteps] : []),
      ...(g.failureDetail ? ["— Failure detail —", g.failureDetail] : []),
      ...(g.severity ? [`Severity: ${g.severity}`] : []),
    ],
    expected: g.expected,
  };
}

export function TestingPortal({
  focusTestId = null,
  onFocusConsumed,
  authUser = null,
  onOpenManual,
}: {
  focusTestId?: string | null;
  onFocusConsumed?: () => void;
  authUser?: AuthUser | null;
  onOpenManual?: () => void;
} = {}) {
  const [statuses, setStatuses] = useState<Record<string, TestStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [newNoteDrafts, setNewNoteDrafts] = useState<Record<string, string>>({});
  const [editNoteDrafts, setEditNoteDrafts] = useState<Record<string, Record<string, string>>>({});
  const [assigneeOverrides, setAssigneeOverrides] = useState<Record<string, string>>({});
  const [sprintByCase, setSprintByCase] = useState<Record<string, number>>({});
  const [updatedAtByCase, setUpdatedAtByCase] = useState<Record<string, string>>({});
  const [updatedByByCase, setUpdatedByByCase] = useState<Record<string, string>>({});
  const [assignedByByCase, setAssignedByByCase] = useState<Record<string, string>>({});
  const [dateAssignedByCase, setDateAssignedByCase] = useState<Record<string, string>>({});
  const [originalAssigneesByCase, setOriginalAssigneesByCase] = useState<Record<string, string>>({});
  const [dueDatesByCase, setDueDatesByCase] = useState<Record<string, string>>({});
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [bulkDescription, setBulkDescription] = useState("");
  const [checkedStepsByCase, setCheckedStepsByCase] = useState<Record<string, boolean[]>>({});
  const [failedStepByCase, setFailedStepByCase] = useState<Record<string, number | null>>({});
  const [attachmentsByCase, setAttachmentsByCase] = useState<Record<string, TestAttachmentMeta[]>>({});
  const [attachBusyId, setAttachBusyId] = useState<string | null>(null);
  const [openingAttachmentId, setOpeningAttachmentId] = useState<string | null>(null);
  const [generatedCases, setGeneratedCases] = useState<GeneratedTestCase[]>([]);
  /** Task List rows — used for sprint chip Task counts + rollover hints. */
  const [tasks, setTasks] = useState<GyshTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [closedSprints, setClosedSprints] = useState<Set<number>>(() => new Set());
  const timers = useActiveTimers(Boolean(authUser));
  const actingAssignBy = auditActorLabel(authUser);
  const isAdmin = userHasAdminRole(authUser);
  /** Tina / Lyriq / Evelyn (qa|admin|dev) — Pass/Fail/etc.; Blocked + Fixed/Failed ReTest are Evelyn-only. */
  const canChangeStatus = userCanChangeTestStatus(authUser);
  const canBlock = canSetTestBlocked(authUser);
  const canDevFix = canSetDevFixStatus(authUser);
  /** Users with Dev role — Fail cards assign among these only. */
  const [devAssignees, setDevAssignees] = useState<QaTester[]>(() =>
    QA_TESTERS.filter((t) => t.id === FAILED_TEST_ASSIGNEE),
  );
  const devAssigneeIds = useMemo(
    () => new Set(devAssignees.map((d) => d.id)),
    [devAssignees],
  );
  const assignByOptions = useMemo(
    () => assignedBySelectOptions(actingAssignBy, ...Object.values(assignedByByCase)),
    [actingAssignBy, assignedByByCase],
  );
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  /** Empty = both. Top-level: External (user-facing) vs Internal (admin / QA). */
  const [facingFilters, setFacingFilters] = useState<Set<TestFacing>>(() => new Set());
  const [facingOpen, setFacingOpen] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState<Set<TestCategory>>(() => new Set());
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<Set<TestStatus>>(() => new Set());
  /** Status filter chips — expanded on load (with QA Testors). */
  const [statusOpen, setStatusOpen] = useState(true);
  /** QA Testor name/status bars — collapsed on load. */
  const [testerBarsOpen, setTesterBarsOpen] = useState(false);
  const [testerFilters, setTesterFilters] = useState<Set<TesterFilterKey>>(() => new Set());
  /** Empty = all suites. Default manual to match prior portal focus. */
  const [suiteFilters, setSuiteFilters] = useState<Set<TestSuite>>(() => new Set(["manual"]));
  /** Test Suites run controls — collapsed by default. */
  const [automatedOpen, setAutomatedOpen] = useState(false);
  /** Default to the sprint containing today. */
  const [sprintFilters, setSprintFilters] = useState<Set<SprintFilterKey>>(
    () => new Set([currentSprintIndex()]),
  );
  const [sprintOpen, setSprintOpen] = useState(false);
  const lastFacingIdx = useRef<number | null>(null);
  const lastCategoryIdx = useRef<number | null>(null);
  const lastStatusIdx = useRef<number | null>(null);
  const lastTesterIdx = useRef<number | null>(null);
  const lastSuiteIdx = useRef<number | null>(null);
  const lastSprintIdx = useRef<number | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  /** When true (default), visible cards stay expanded as filters change. */
  const [preferExpanded, setPreferExpanded] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  /**
   * Cases kept visible after a status change even if they no longer match filters
   * (e.g. Pass while filtered to In Progress) so the list doesn't jump away.
   * statusPinSort freezes prior list-order so Pass doesn't yank the card to the bottom.
   */
  const [statusPinIds, setStatusPinIds] = useState<Set<string>>(() => new Set());
  const [statusPinSort, setStatusPinSort] = useState<Record<string, number>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(() => new Set());
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [suiteRunning, setSuiteRunning] = useState<AutomatedSuite | null>(null);
  const [runLog, setRunLog] = useState<string>("");
  const [saveFlash, setSaveFlash] = useState("");
  const sprints = useMemo(() => listUpcomingSprints(), []);
  const activeSprintIndex = useMemo(() => currentSprintIndex(), []);

  const sprintFilterSummary = useMemo(() => {
    if (sprintFilters.size === 0) return "All sprints";
    return [...sprintFilters]
      .map((k) => (k === "backlog" ? "Backlog" : sprintLabel(k)))
      .join(", ");
  }, [sprintFilters]);

  const statusFilterSummary = useMemo(() => {
    if (statusFilters.size === 0) return "All statuses";
    return [...statusFilters].map((s) => STATUS_LABELS[s]).join(", ");
  }, [statusFilters]);

  const categoryFilterSummary = useMemo(() => {
    if (categoryFilters.size === 0) return "All categories";
    return [...categoryFilters].map((c) => TEST_CATEGORY_LABELS[c]).join(", ");
  }, [categoryFilters]);
  /** Per-case save generation — concurrent note/status saves must not lock controls. */
  const saveGenByIdRef = useRef<Record<string, number>>({});
  const statusesRef = useRef(statuses);
  statusesRef.current = statuses;
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const newNoteDraftsRef = useRef(newNoteDrafts);
  newNoteDraftsRef.current = newNoteDrafts;
  const editNoteDraftsRef = useRef(editNoteDrafts);
  editNoteDraftsRef.current = editNoteDrafts;
  const checkedStepsRef = useRef(checkedStepsByCase);
  checkedStepsRef.current = checkedStepsByCase;
  const failedStepRef = useRef(failedStepByCase);
  failedStepRef.current = failedStepByCase;
  /** Unsaved note edits — never clobber these when another row's save returns. */
  const dirtyNotesRef = useRef(new Set<string>());
  /** Unsaved step checklist toggles (persist via Save everything / status save). */
  const dirtyStepsRef = useRef(new Set<string>());
  const [dirtySaveCount, setDirtySaveCount] = useState(0);
  const [savingAll, setSavingAll] = useState(false);
  const startingTimersRef = useRef(new Set<string>());

  const syncDirtySaveCount = () => {
    setDirtySaveCount(dirtyNotesRef.current.size + dirtyStepsRef.current.size);
  };

  const beginSave = (id: string): number => {
    const gen = (saveGenByIdRef.current[id] ?? 0) + 1;
    saveGenByIdRef.current[id] = gen;
    setSavingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    return gen;
  };

  const endSave = (id: string, gen: number) => {
    if (saveGenByIdRef.current[id] !== gen) return false;
    setSavingIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    return true;
  };

  const isSaving = (id: string) => savingIds.has(id);

  const ALL_CASES = useMemo(() => {
    const seen = new Set(BASE_CASES.map((c) => c.id));
    const extras = generatedCases
      .filter((g) => !seen.has(g.id))
      .map(generatedToCase);
    return [...BASE_CASES, ...extras];
  }, [generatedCases]);

  /** Portal totals never include FMSH wizard inventory (~972 rows). */
  const COUNTABLE_CASES = useMemo(
    () => ALL_CASES.filter((t) => !isWizardMatrixCaseId(t.id)),
    [ALL_CASES],
  );

  /** Board/catalog IDs only — ignore orphan D1 rows from renamed case IDs. */
  const knownCaseIds = useMemo(
    () => new Set(COUNTABLE_CASES.map((t) => t.id)),
    [COUNTABLE_CASES],
  );

  const stepsFor = (id: string): string[] =>
    ALL_CASES.find((c) => c.id === id)?.steps ?? [];

  const checkedFor = (id: string): boolean[] => {
    const steps = stepsFor(id);
    const raw = checkedStepsByCase[id];
    if (!raw || raw.length !== steps.length) {
      return Array.from({ length: steps.length }, (_, i) => Boolean(raw?.[i]));
    }
    return raw;
  };

  const testTimerLabel = (id: string) => ALL_CASES.find((c) => c.id === id)?.title ?? id;

  /** Start a work timer for a test. Use force when about to mark Pass/Fail from Not Started. */
  const maybeStartTestTimer = async (id: string, opts?: { force?: boolean }) => {
    const st = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
    if (!opts?.force && isTestStatusResolved(st)) return;
    if (!authUser) return;
    const existing = timers.entryFor("test", id);
    if (existing?.status === "running" || existing?.status === "paused") return;
    if (startingTimersRef.current.has(id)) return;
    startingTimersRef.current.add(id);
    try {
      await ensureWorkTimerStarted({
        source: "test",
        sourceId: id,
        sourceLabel: testTimerLabel(id),
      });
      void timers.refresh();
    } finally {
      startingTimersRef.current.delete(id);
    }
  };

  /** Credit hours when a test is completed (Pass / Cond. Pass / Fail / Blocked). */
  const creditCompletedTestWork = async (id: string) => {
    if (!authUser) return;
    await completeWorkTimer({
      source: "test",
      sourceId: id,
      sourceLabel: testTimerLabel(id),
    });
    void timers.refresh();
  };

  const isCaseDirty = (id: string) =>
    dirtyNotesRef.current.has(id) || dirtyStepsRef.current.has(id);

  const assertCaseUnlocked = (id: string, nextSprint?: number): boolean => {
    const current = persistedSprint(id);
    if (isSprintEditLocked(closedSprints, current, authUser)) {
      const msg = sprintLockedMessage(current);
      setError(msg);
      setRowErrors((prev) => ({ ...prev, [id]: msg }));
      return false;
    }
    if (nextSprint !== undefined && isSprintEditLocked(closedSprints, nextSprint, authUser)) {
      const msg = sprintLockedMessage(nextSprint);
      setError(msg);
      setRowErrors((prev) => ({ ...prev, [id]: msg }));
      return false;
    }
    return true;
  };

  const priorNoteAttribution = (id: string) => ({
    author: (updatedByByCase[id] || assignedByByCase[id] || "").trim() || undefined,
    at: (updatedAtByCase[id] || "").trim() || undefined,
  });

  const composedNote = (id: string) =>
    applyNoteDrafts(
      notesRef.current[id] ?? "",
      actingAssignBy,
      editNoteDraftsRef.current[id],
      newNoteDraftsRef.current[id],
      undefined,
      priorNoteAttribution(id),
    );

  const saveOneCase = async (id: string) => {
    if (!assertCaseUnlocked(id)) return;
    const currentStatus = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
    const note = composedNote(id);
    if (statusRequiresNote(currentStatus) && !noteMeetsRequirement(note)) {
      const msg = `A note is required for ${STATUS_LABELS[currentStatus]} (at least ${NOTE_MIN_LENGTH} characters).`;
      setRowErrors((prev) => ({ ...prev, [id]: msg }));
      setError(msg);
      setOpenIds((prev) => new Set(prev).add(id));
      return;
    }
    setError("");
    setSaveFlash("");
    if (!isTestStatusResolved(currentStatus) && currentStatus !== "not_run") {
      await maybeStartTestTimer(id, { force: true });
    } else if (currentStatus === "not_run" && (dirtyNotesRef.current.has(id) || dirtyStepsRef.current.has(id))) {
      // Saving notes/steps on a Not Started case — start the clock.
      await maybeStartTestTimer(id, { force: true });
    }
    const gen = beginSave(id);
    try {
      const data = await saveTestStatus(
        id,
        currentStatus,
        note,
        persistedAssignee(id),
        persistedSprint(id),
        evidenceOpts(id, currentStatus),
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
      setSaveFlash(`${id} saved`);
    } catch (e) {
      endSave(id, gen);
      const msg = e instanceof ApiError ? e.message : `Failed to save ${id}.`;
      setRowErrors((prev) => ({ ...prev, [id]: msg }));
      setError(msg);
    }
  };

  const toggleStep = (id: string, index: number) => {
    const steps = stepsFor(id);
    const cur = checkedFor(id);
    const nextVal = !cur[index];
    const next = cur.length === steps.length ? [...cur] : Array.from({ length: steps.length }, (_, i) => Boolean(cur[i]));
    next[index] = nextVal;
    setCheckedStepsByCase((prev) => ({ ...prev, [id]: next }));
    dirtyStepsRef.current.add(id);
    syncDirtySaveCount();
    if (nextVal) void maybeStartTestTimer(id);
  };

  const effectiveSprint = (t: TestCase) =>
    sprintByCase[t.id] ?? suggestedSprintForTest(t);

  const applyServerData = (data: TestStatusesPayload, savedId?: string) => {
    if (savedId) {
      clearDirtyNote(savedId);
      clearDirtySteps(savedId);
    }
    // Full test-statuses payloads are absolute from D1 — replace maps so cleared
    // assignees / status changes cannot leave stale client overrides.
    setStatuses(data.statuses ?? {});
    // Server notes are source of truth; unsaved drafts live in new/edit draft maps.
    setNotes((prev) => ({ ...prev, ...data.notes }));
    setAssigneeOverrides(
      Object.fromEntries(
        Object.entries(data.assignees ?? {}).map(([caseId, assignee]) => [
          caseId,
          normalizeQaAssigneeId(assignee),
        ]),
      ),
    );
    setSprintByCase((prev) => ({ ...prev, ...data.sprints }));
    setDueDatesByCase((prev) => ({ ...prev, ...(data.dueDates ?? {}) }));
    setAssignedByByCase(data.assignedBy ?? {});
    setDateAssignedByCase(data.dateAssigned ?? {});
    setOriginalAssigneesByCase(data.originalAssignees ?? {});
    setUpdatedAtByCase(data.updatedAt ?? {});
    setUpdatedByByCase(data.updatedBy ?? {});
    if (data.checkedSteps) {
      setCheckedStepsByCase((prev) => {
        const next = { ...data.checkedSteps };
        for (const id of dirtyStepsRef.current) {
          if (prev[id]) next[id] = prev[id];
        }
        return next;
      });
    }
    if (data.failedStepIndex) {
      setFailedStepByCase((prev) => ({ ...prev, ...data.failedStepIndex }));
    }
    if (data.attachments) setAttachmentsByCase(data.attachments);
    if (data.generatedCases) setGeneratedCases(data.generatedCases);
    if (savedId) {
      setRowErrors((prev) => {
        if (!prev[savedId]) return prev;
        const next = { ...prev };
        delete next[savedId];
        return next;
      });
    }
  };

  const markTestNotesDirty = (id: string) => {
    dirtyNotesRef.current.add(id);
    syncDirtySaveCount();
  };

  const setNewNoteDraft = (id: string, value: string) => {
    setNewNoteDrafts((prev) => ({ ...prev, [id]: value }));
    markTestNotesDirty(id);
  };

  const setEditNoteDraft = (caseId: string, noteId: string, value: string) => {
    setEditNoteDrafts((prev) => ({
      ...prev,
      [caseId]: { ...(prev[caseId] ?? {}), [noteId]: value },
    }));
    markTestNotesDirty(caseId);
  };

  const clearDirtyNote = (id: string) => {
    dirtyNotesRef.current.delete(id);
    setNewNoteDrafts((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setEditNoteDrafts((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    syncDirtySaveCount();
  };

  const clearDirtySteps = (id: string) => {
    dirtyStepsRef.current.delete(id);
    syncDirtySaveCount();
  };

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const [closedList, fetched, users, fetchedTasks] = await Promise.all([
        fetchClosedSprints().catch(() => [] as number[]),
        fetchTestStatuses(),
        fetchUsers().catch(() => [] as Awaited<ReturnType<typeof fetchUsers>>),
        fetchTasks().catch(() => [] as GyshTask[]),
      ]);
      setDevAssignees(devAssigneesFromUsers(users));
      setClosedSprints(new Set(closedList));
      setTasks(fetchedTasks);
      let data = fetched;
      // Due-only heal for incomplete cases (not Pass). Uses freshly fetched rows so we
      // do not race stale notes/status from a prior session. Skip locked sprints.
      const healIds = Object.keys(data.sprints).filter(
        (id) => !isSprintLocked(closedList, data.sprints[id]),
      );
      const healed = healIncompleteTestDueDates(
        data.sprints,
        data.dueDates ?? {},
        data.statuses,
        healIds,
      );
      if (healed.changedIds.length > 0) {
        try {
          data = await saveTestStatusesBatch(
            healed.changedIds.map((caseId) => ({
              caseId,
              status: (data.statuses[caseId] ?? DEFAULT_TEST_STATUS) as TestStatus,
              note: (data.notes[caseId] ?? "").trim(),
              assignee: data.assignees?.[caseId] ?? "",
              sprint: data.sprints[caseId] ?? BACKLOG_SPRINT,
              dueDate: healed.dueDates[caseId] ?? "",
            })),
          );
        } catch {
          data = {
            ...data,
            dueDates: healed.dueDates,
          };
        }
      }
      setStatuses(data.statuses);
      setNotes(data.notes);
      setAssigneeOverrides(data.assignees);
      setSprintByCase(data.sprints);
      setDueDatesByCase(data.dueDates ?? {});
      setAssignedByByCase(data.assignedBy ?? {});
      setDateAssignedByCase(data.dateAssigned ?? {});
      setUpdatedAtByCase(data.updatedAt ?? {});
      setUpdatedByByCase(data.updatedBy ?? {});
      setCheckedStepsByCase(data.checkedSteps);
      setFailedStepByCase(data.failedStepIndex);
      setAttachmentsByCase(data.attachments);
      setGeneratedCases(data.generatedCases);
    } catch (e) {
      setStatuses({});
      setNotes({});
      setAssigneeOverrides({});
      setSprintByCase({});
      setDueDatesByCase({});
      setAssignedByByCase({});
      setDateAssignedByCase({});
      setUpdatedAtByCase({});
      setUpdatedByByCase({});
      setCheckedStepsByCase({});
      setFailedStepByCase({});
      setAttachmentsByCase({});
      setTasks([]);
      setError(e instanceof ApiError ? e.message : "Failed to load test statuses from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  useEffect(() => {
    if (!focusTestId || loading) return;
    const caseDef = ALL_CASES.find((t) => t.id === focusTestId);
    if (!caseDef) {
      onFocusConsumed?.();
      return;
    }
    const sprint =
      sprintByCase[focusTestId] ?? suggestedSprintForTest(caseDef);
    const sprintKey: SprintFilterKey = sprint === BACKLOG_SPRINT ? "backlog" : sprint;
    setQuery(focusTestId);
    setAreaFilter("all");
    setCategoryFilters(new Set());
    setStatusFilters(new Set());
    setTesterFilters(new Set());
    setSuiteFilters(new Set());
    // Keep the focused test visible under its sprint (not "All sprints").
    setSprintFilters(new Set([sprintKey]));
    lastCategoryIdx.current = null;
    lastStatusIdx.current = null;
    lastTesterIdx.current = null;
    lastSuiteIdx.current = null;
    lastSprintIdx.current = null;
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.add(focusTestId);
      return next;
    });
    setHighlightId(focusTestId);
    onFocusConsumed?.();
    requestAnimationFrame(() => {
      document.getElementById(`test-row-${focusTestId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [focusTestId, loading, onFocusConsumed, sprintByCase]);

  const areas = useMemo(
    () => ["all", ...Array.from(new Set(COUNTABLE_CASES.map((t) => t.area))).sort((a, b) => a.localeCompare(b))],
    [COUNTABLE_CASES],
  );

  const areaCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of COUNTABLE_CASES) {
      map.set(t.area, (map.get(t.area) ?? 0) + 1);
    }
    return map;
  }, [COUNTABLE_CASES]);

  /** Lighthouse / Foresight: Pass = fixed; everything else = outstanding. */
  const AUDIT_AREAS = ["Lighthouse", "Foresight"] as const;
  const auditAreaStats = useMemo(() => {
    return AUDIT_AREAS.map((area) => {
      const cases = COUNTABLE_CASES.filter((t) => t.area === area);
      let fixed = 0;
      for (const t of cases) {
        if ((statuses[t.id] ?? DEFAULT_TEST_STATUS) === "pass") fixed += 1;
      }
      const total = cases.length;
      return { area, fixed, outstanding: total - fixed, total };
    });
  }, [COUNTABLE_CASES, statuses]);

  const isFailureGeneratedId = (id: string) => /^(VT|PW)-FAIL-/i.test(id);

  /** D1 assignee only (lowercase id). Empty when not persisted / unassigned. */
  const dbAssigneeOf = (id: string): string => normalizeQaAssigneeId(assigneeOverrides[id]);

  /**
   * Owner for tester progress bars AND the QA Testors filter (must stay in sync):
   * 1) D1 assignee when set (incl. Fail→Evelyn reassignment)
   * 2) else PROOF-*-TINA / PROOF-*-LYRIQ from the case id
   * 3) else catalog primary human assignee
   * Only manual + generated failure cases count toward human tester chips/bars.
   */
  const ownerForTesterStats = (t: TestCase): QaTesterId | "" =>
    manualQaOwnerForStats(t, dbAssigneeOf(t.id));

  /** Effective assignees: humans for manual + failure cases; suite owners for other automated. */
  const effectiveAssignees = (t: TestCase): TestOwnerId[] => {
    if (isFailureGeneratedId(t.id)) {
      const override = dbAssigneeOf(t.id);
      if (override && isHumanQaTester(override)) return [override];
      return t.assignees.length ? t.assignees : ["evelyn"];
    }
    if (isAutomatedTestId(t.id) || t.suite === "vitest" || t.suite === "playwright") {
      return t.assignees;
    }
    const override = dbAssigneeOf(t.id);
    if (override && isHumanQaTester(override)) {
      return [override];
    }
    return t.assignees;
  };

  /** Persist primary owner — suite owner for automated; Evelyn for new failure cases; human for manual. */
  const persistedAssignee = (id: string): string => {
    const t = ALL_CASES.find((c) => c.id === id);
    if (isFailureGeneratedId(id)) {
      const override = dbAssigneeOf(id);
      if (override && isHumanQaTester(override)) return override;
      return t?.assignees[0] ?? "evelyn";
    }
    if (t && (isAutomatedTestId(id) || t.suite === "vitest" || t.suite === "playwright")) {
      return t.assignees[0] ?? "";
    }
    const override = dbAssigneeOf(id);
    if (override && isHumanQaTester(override)) return override;
    return t?.assignees[0] ?? "";
  };

  const persistedSprint = (id: string): number => {
    const t = ALL_CASES.find((c) => c.id === id);
    return (
      sprintByCase[id] ??
      suggestedSprintForTest(t ?? { id, area: "", priority: "P2", suite: "manual" })
    );
  };

  const persistedDueDate = (id: string, sprint?: number): string => {
    const existing = (dueDatesByCase[id] ?? "").trim();
    if (existing) return existing;
    return dueDateForSprint(sprint ?? persistedSprint(id));
  };

  const evidenceOpts = (
    id: string,
    status?: TestStatus,
    dueOverride?: string,
    checkedOverride?: boolean[],
  ) => {
    const st = status ?? statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
    const stepCount = stepsFor(id).length;
    const unchecked = Array.from({ length: stepCount }, () => false);
    return {
      // Fixed/Failed Re-Test: QA re-runs from a clean checklist.
      checkedSteps: isDevFixStatus(st) ? unchecked : (checkedOverride ?? checkedFor(id)),
      failedStepIndex: st === "fail" ? failedStepRef.current[id] ?? null : null,
      stepCount,
      dueDate: dueOverride ?? persistedDueDate(id),
    };
  };

  const isCaseComplete = (id: string) => {
    const st = statuses[id] ?? DEFAULT_TEST_STATUS;
    return isTestStatusResolved(st);
  };

  /**
   * Faceted filter match: apply all active filters except `exclude` (inner-join style).
   * Counts for a chip dimension exclude that dimension so options stay visible in context.
   */
  type FilterDim =
    | "facing"
    | "category"
    | "area"
    | "status"
    | "tester"
    | "suite"
    | "sprint"
    | "query";

  const caseMatchesFilters = (t: TestCase, exclude?: FilterDim): boolean => {
    const st = statuses[t.id] ?? DEFAULT_TEST_STATUS;
    const facing = facingForCase(t);
    const cat = categoryForCase(t);
    if (exclude !== "facing" && facingFilters.size > 0 && !facingFilters.has(facing)) return false;
    if (exclude !== "category" && categoryFilters.size > 0 && !categoryFilters.has(cat)) return false;
    if (exclude !== "area" && areaFilter !== "all" && t.area !== areaFilter) return false;
    if (exclude !== "status" && statusFilters.size > 0) {
      const rolled = testIsRolledOver(st, notes[t.id]);
      const matchesStatus =
        statusFilters.has(st) || (statusFilters.has("rolled_over") && rolled);
      if (!matchesStatus) return false;
    }
    // Same ownership rules as Evelyn/Tina/Lyriq progress bars (D1 → PROOF id → catalog).
    if (exclude !== "tester" && testerFilters.size > 0) {
      const owner = ownerForTesterStats(t);
      const key: TesterFilterKey | null = owner
        ? owner
        : (t.suite ?? "manual") === "manual" || isFailureGeneratedId(t.id)
          ? "unassigned"
          : null;
      if (!key || !testerFilters.has(key)) return false;
    }
    if (exclude !== "suite" && suiteFilters.size > 0) {
      const suite = t.suite ?? "manual";
      // Human-owned generated failures (VT-FAIL-*/PW-FAIL-*) live under vitest/playwright
      // suite but belong with Manual QA work when a tester chip is active.
      const failureInManualBucket =
        suiteFilters.has("manual") && isFailureGeneratedId(t.id);
      if (!suiteFilters.has(suite) && !failureInManualBucket) return false;
    }
    if (exclude !== "sprint" && sprintFilters.size > 0) {
      const sprint = effectiveSprint(t);
      const key: SprintFilterKey = sprint === BACKLOG_SPRINT ? "backlog" : sprint;
      if (!sprintFilters.has(key)) return false;
    }
    if (exclude !== "query" && query.trim()) {
      const q = query.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.area.toLowerCase().includes(q) ||
        TEST_FACING_LABELS[facing].toLowerCase().includes(q) ||
        TEST_CATEGORY_LABELS[cat].toLowerCase().includes(q) ||
        noteEntriesPlainText(notes[t.id]).toLowerCase().includes(q)
      );
    }
    return true;
  };

  const filterDeps = [
    COUNTABLE_CASES,
    statuses,
    facingFilters,
    categoryFilters,
    areaFilter,
    statusFilters,
    testerFilters,
    suiteFilters,
    sprintFilters,
    query,
    notes,
    sprintByCase,
    assigneeOverrides,
  ] as const;

  /** Real Vitest `it()` counts from last `npm test` / report-vitest-to-d1 run (not FMSH inventory). */
  const vitestReal = useMemo(() => {
    const total = Number(vitestLastRun.total) || 0;
    const passed = Number(vitestLastRun.passed) || 0;
    const failed = Number(vitestLastRun.failed) || 0;
    const tally: StatusTally = {
      ...emptyTally(),
      pass: passed,
      fail: failed,
      total,
    };
    return {
      total,
      passed,
      failed,
      done: passed + failed,
      tally,
      at: String(vitestLastRun.at || ""),
      ok: Boolean(vitestLastRun.ok),
    };
  }, []);

  /** Global suite totals (progress bars + suite runners — not filter-chip facets). */
  const suiteStats = useMemo(() => {
    const counts: Record<TestSuite, { done: number; total: number; passed: number; tally: StatusTally }> = {
      manual: { done: 0, total: 0, passed: 0, tally: emptyTally() },
      vitest: {
        done: vitestReal.done,
        total: vitestReal.total,
        passed: vitestReal.passed,
        tally: vitestReal.tally,
      },
      playwright: { done: 0, total: 0, passed: 0, tally: emptyTally() },
    };
    for (const suite of ["manual", "playwright"] as TestSuite[]) {
      const ids = COUNTABLE_CASES.filter((t) => t.suite === suite).map((t) => t.id);
      const tally = tallyStatuses(ids, statuses);
      counts[suite] = {
        done: tally.pass + tally.conditional_approval + tally.fail + tally.blocked,
        total: tally.total,
        passed: tally.pass,
        tally,
      };
    }
    return counts;
  }, [statuses, vitestReal, COUNTABLE_CASES]);

  const qaProgress = useMemo(() => {
    const overallTally: StatusTally = {
      ...emptyTally(),
      pass: suiteStats.manual.tally.pass + suiteStats.vitest.tally.pass + suiteStats.playwright.tally.pass,
      conditional_approval:
        suiteStats.manual.tally.conditional_approval +
        suiteStats.vitest.tally.conditional_approval +
        suiteStats.playwright.tally.conditional_approval,
      fail: suiteStats.manual.tally.fail + suiteStats.vitest.tally.fail + suiteStats.playwright.tally.fail,
      blocked:
        suiteStats.manual.tally.blocked +
        suiteStats.vitest.tally.blocked +
        suiteStats.playwright.tally.blocked,
      fixed_retest:
        suiteStats.manual.tally.fixed_retest +
        suiteStats.vitest.tally.fixed_retest +
        suiteStats.playwright.tally.fixed_retest,
      failed_retest:
        suiteStats.manual.tally.failed_retest +
        suiteStats.vitest.tally.failed_retest +
        suiteStats.playwright.tally.failed_retest,
      fixed_cursor:
        suiteStats.manual.tally.fixed_cursor +
        suiteStats.vitest.tally.fixed_cursor +
        suiteStats.playwright.tally.fixed_cursor,
      fixed_lighthouse:
        suiteStats.manual.tally.fixed_lighthouse +
        suiteStats.vitest.tally.fixed_lighthouse +
        suiteStats.playwright.tally.fixed_lighthouse,
      fixed_foresight:
        suiteStats.manual.tally.fixed_foresight +
        suiteStats.vitest.tally.fixed_foresight +
        suiteStats.playwright.tally.fixed_foresight,
      rolled_over:
        suiteStats.manual.tally.rolled_over +
        suiteStats.vitest.tally.rolled_over +
        suiteStats.playwright.tally.rolled_over,
      in_progress:
        suiteStats.manual.tally.in_progress +
        suiteStats.vitest.tally.in_progress +
        suiteStats.playwright.tally.in_progress,
      not_run:
        suiteStats.manual.tally.not_run +
        suiteStats.vitest.tally.not_run +
        suiteStats.playwright.tally.not_run,
      total: suiteStats.manual.total + suiteStats.vitest.total + suiteStats.playwright.total,
    };
    const suites = (["vitest", "playwright", "manual"] as TestSuite[]).map((suite) => ({
      id: suite,
      label: SUITE_LABELS[suite],
      detail:
        suite === "vitest"
          ? `Real Vitest suite (${vitestReal.total} tests)`
          : suite === "playwright"
            ? "Automated suite"
            : "Human QA",
      accent: suite === "vitest" ? "#2563eb" : suite === "playwright" ? "#7c3aed" : "#6B5344",
      tally: suiteStats[suite].tally,
    }));

    const sprintRows = [
      {
        id: "backlog",
        label: "Backlog",
        detail: "Uncommitted cases",
        tally: tallyStatuses(
          COUNTABLE_CASES.filter((t) => effectiveSprint(t) === BACKLOG_SPRINT).map((t) => t.id),
          statuses,
        ),
      },
      ...sprints.map((s) => ({
        id: `sprint-${s.index}`,
        label: s.label,
        detail: s.rangeLabel,
        tally: tallyStatuses(
          COUNTABLE_CASES.filter((t) => effectiveSprint(t) === s.index).map((t) => t.id),
          statuses,
        ),
      })),
    ].filter((row) => row.tally.total > 0);

    const resources = [
      ...QA_TESTERS.map((tester) => {
        const ids = COUNTABLE_CASES.filter((t) => {
          if (t.suite !== "manual" && !isFailureGeneratedId(t.id)) return false;
          return ownerForTesterStats(t) === tester.id;
        }).map((t) => t.id);
        return {
          id: tester.id,
          label: tester.name,
          detail: "Manual QA (DB + proofread owners)",
          accent: tester.id === "tina" ? "#9B2F28" : tester.id === "evelyn" ? "#947D64" : "#3f6b2e",
          tally: tallyStatuses(ids, statuses),
        };
      }),
      ...AUTOMATED_SUITE_OWNERS.map((owner) => ({
        id: owner.id,
        label: owner.name,
        detail: "Automated suite owner",
        accent: owner.accent,
        tally: suiteStats[owner.id].tally,
      })),
    ];

    return {
      overall: {
        id: "overall",
        label: "Overall progress",
        detail: "Manual + Vitest + Playwright",
        tally: overallTally,
      },
      suites,
      sprints: sprintRows,
      resources,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- effectiveAssignees / effectiveSprint derive from state above
  }, [statuses, sprintByCase, suiteStats, sprints, assigneeOverrides, vitestReal.total, COUNTABLE_CASES]);

  /**
   * QA Testor bars/chips — same filter context as status tiles (sprint, suite, etc.),
   * excluding the tester chip itself so each name’s In Progress / Not Started matches
   * the top status counts when that name is selected.
   * Owner = D1 assignee → PROOF-*-TINA/LYRIQ → catalog human. Pass-only for “passed”.
   */
  const testerStats = useMemo(() => {
    const inFilterContext = COUNTABLE_CASES.filter((t) => caseMatchesFilters(t, "tester"));
    // Manual / failure cases only (ownerForTesterStats is "" for automated suites).
    const humanCases = inFilterContext.filter(
      (t) => (t.suite ?? "manual") === "manual" || isFailureGeneratedId(t.id),
    );
    const ownedCases = humanCases.filter((t) => Boolean(ownerForTesterStats(t)));
    const unassignedCases = humanCases.filter((t) => !ownerForTesterStats(t));
    const allTally = tallyStatuses(
      humanCases.map((t) => t.id),
      statuses,
    );
    const countRolled = (cases: typeof humanCases) =>
      cases.filter((t) => testIsRolledOver(statuses[t.id], notes[t.id])).length;
    const testers = QA_TESTERS.map((tester) => {
      const cases = ownedCases.filter((t) => ownerForTesterStats(t) === tester.id);
      const tally = tallyStatuses(
        cases.map((t) => t.id),
        statuses,
      );
      return {
        ...tester,
        total: tally.total,
        passed: tally.pass,
        rolled: countRolled(cases),
        tally,
      };
    });
    const unassignedTally = tallyStatuses(
      unassignedCases.map((t) => t.id),
      statuses,
    );
    return {
      testers,
      unassigned: {
        total: unassignedTally.total,
        passed: unassignedTally.pass,
        rolled: countRolled(unassignedCases),
        tally: unassignedTally,
      },
      allPassed: allTally.pass,
      allTotal: allTally.total,
      allRolled: countRolled(humanCases),
      allTally,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caseMatchesFilters closes over filter state
  }, filterDeps);

  /**
   * Vitest / Playwright counts for QA Testors chips — always the full catalog suite
   * (not Sprint/Manual-filtered). Clicking the chip still filters the list; the badge
   * stays the suite ownership total so numbers don't disappear under Manual/Sprint defaults.
   */
  const autoAssigneeStats = useMemo(() => {
    const out: Record<
      "vitest" | "playwright",
      { passed: number; total: number; rolled: number; tally: StatusTally }
    > = {
      vitest: { passed: 0, total: 0, rolled: 0, tally: emptyTally() },
      playwright: { passed: 0, total: 0, rolled: 0, tally: emptyTally() },
    };
    for (const suite of ["vitest", "playwright"] as const) {
      const ids = COUNTABLE_CASES.filter((t) => {
        if (isFailureGeneratedId(t.id)) return false;
        return (t.suite ?? "manual") === suite;
      }).map((t) => t.id);
      const tally = tallyStatuses(ids, statuses);
      out[suite] = {
        passed: tally.pass,
        total: tally.total,
        rolled: ids.filter((id) => testIsRolledOver(statuses[id], notes[id])).length,
        tally,
      };
    }
    return out;
  }, [COUNTABLE_CASES, statuses, notes]);

  const facetSuiteStats = useMemo(() => {
    const base = COUNTABLE_CASES.filter((t) => caseMatchesFilters(t, "suite"));
    const counts: Record<TestSuite, { done: number; total: number; passed: number }> = {
      manual: { done: 0, total: 0, passed: 0 },
      vitest: { done: 0, total: 0, passed: 0 },
      playwright: { done: 0, total: 0, passed: 0 },
    };
    for (const suite of ["manual", "vitest", "playwright"] as TestSuite[]) {
      const ids = base
        .filter((t) => {
          const s = t.suite ?? "manual";
          // VT-FAIL-*/PW-FAIL-* are human-owned follow-ups — count with Manual, not Automated.
          if (isFailureGeneratedId(t.id)) return suite === "manual";
          return s === suite;
        })
        .map((t) => t.id);
      const tally = tallyStatuses(ids, statuses);
      counts[suite] = {
        done: tally.pass + tally.conditional_approval + tally.fail + tally.blocked,
        total: tally.total,
        passed: tally.pass,
      };
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caseMatchesFilters closes over filter state
  }, filterDeps);

  const facingStats = useMemo(() => {
    const counts: Record<TestFacing, { done: number; total: number }> = {
      external: { done: 0, total: 0 },
      internal: { done: 0, total: 0 },
    };
    for (const t of COUNTABLE_CASES) {
      if (!caseMatchesFilters(t, "facing")) continue;
      const facing = facingForCase(t);
      counts[facing].total += 1;
      if (isCaseComplete(t.id)) counts[facing].done += 1;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caseMatchesFilters closes over filter state
  }, filterDeps);

  const categoryStats = useMemo(() => {
    const counts: Partial<Record<TestCategory, { done: number; total: number }>> = {};
    for (const t of COUNTABLE_CASES) {
      if (!caseMatchesFilters(t, "category")) continue;
      const cat = categoryForCase(t);
      const cur = counts[cat] ?? { done: 0, total: 0 };
      cur.total += 1;
      if (isCaseComplete(t.id)) cur.done += 1;
      counts[cat] = cur;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caseMatchesFilters closes over filter state
  }, filterDeps);

  /**
   * Sprint chip Test counts — global catalog by sprint (not suite/tester/status filtered).
   * Done = Pass only, same as Schedule sprint bubbles (testStatusToBoard → done).
   */
  const sprintStats = useMemo(() => {
    const bySprint = new Map<number, { done: number; total: number }>();
    let backlog = { done: 0, total: 0 };
    for (const t of COUNTABLE_CASES) {
      const sprint = effectiveSprint(t);
      const st = statuses[t.id] ?? DEFAULT_TEST_STATUS;
      const done = st === "pass" ? 1 : 0;
      if (sprint === BACKLOG_SPRINT) {
        backlog.total += 1;
        backlog.done += done;
        continue;
      }
      const cur = bySprint.get(sprint) ?? { done: 0, total: 0 };
      cur.total += 1;
      cur.done += done;
      bySprint.set(sprint, cur);
    }
    return { bySprint, backlog };
  }, [COUNTABLE_CASES, statuses, sprintByCase]);

  /** Task List counts by sprint (matches Schedule / Sprint Progress — not suite-filtered). */
  const taskSprintStats = useMemo(() => {
    const bySprint = new Map<number, { done: number; total: number }>();
    let backlog = { done: 0, total: 0 };
    for (const t of tasks) {
      // Subtasks nest under a parent — count the parent once.
      if (String(t.parentId || "").trim()) continue;
      const sprint = Number(t.sprint);
      const done = t.status === "done" ? 1 : 0;
      if (!Number.isFinite(sprint) || sprint === BACKLOG_SPRINT) {
        backlog.total += 1;
        backlog.done += done;
        continue;
      }
      const cur = bySprint.get(sprint) ?? { done: 0, total: 0 };
      cur.total += 1;
      cur.done += done;
      bySprint.set(sprint, cur);
    }
    return { bySprint, backlog };
  }, [tasks]);

  const lastSprintIndex = sprints.length > 0 ? sprints[sprints.length - 1]!.index : 7;

  /** Global rollover counts (not narrowed by other filters) for sprint chips / banners. */
  const sprintRolloverByIndex = useMemo(() => {
    const map = new Map<number, ReturnType<typeof sprintRolloverSummary>>();
    for (const s of sprints) {
      map.set(
        s.index,
        sprintRolloverSummary(
          statuses,
          sprintByCase,
          s.index,
          knownCaseIds,
          notes,
          tasks,
          lastSprintIndex,
        ),
      );
    }
    return map;
  }, [statuses, sprintByCase, sprints, knownCaseIds, notes, tasks, lastSprintIndex]);

  const selectedSprintRollover = useMemo(() => {
    if (sprintFilters.size !== 1) return null;
    const key = [...sprintFilters][0];
    if (typeof key !== "number") return null;
    return (
      sprintRolloverByIndex.get(key) ??
      sprintRolloverSummary(
        statuses,
        sprintByCase,
        key,
        knownCaseIds,
        notes,
        tasks,
        lastSprintIndex,
      )
    );
  }, [
    sprintFilters,
    sprintRolloverByIndex,
    statuses,
    sprintByCase,
    knownCaseIds,
    notes,
    tasks,
    lastSprintIndex,
  ]);

  const { counts, rolledWithinStatus } = useMemo(() => {
    const acc = { total: 0 } as Record<string, number>;
    /** Within each work status, how many also have a rollover note / rolled_over status. */
    const rolledWithin = {} as Record<string, number>;
    for (const t of COUNTABLE_CASES) {
      if (!caseMatchesFilters(t, "status")) continue;
      const st = statuses[t.id] ?? DEFAULT_TEST_STATUS;
      const rolled = testIsRolledOver(st, notes[t.id]);
      // Work status stays primary; Rolled Over is also counted when noted (may overlap).
      if (st === "rolled_over") {
        acc.rolled_over = (acc.rolled_over ?? 0) + 1;
      } else {
        acc[st] = (acc[st] ?? 0) + 1;
        if (rolled) {
          acc.rolled_over = (acc.rolled_over ?? 0) + 1;
          rolledWithin[st] = (rolledWithin[st] ?? 0) + 1;
        }
      }
      acc.total += 1;
    }
    return { counts: acc, rolledWithinStatus: rolledWithin };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caseMatchesFilters closes over filter state
  }, filterDeps);

  const completedCases = useMemo(() => {
    let n = 0;
    for (const t of COUNTABLE_CASES) {
      if (!caseMatchesFilters(t, "status")) continue;
      if (isCaseComplete(t.id)) n += 1;
    }
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caseMatchesFilters closes over filter state
  }, filterDeps);

  const sprintFilterOrder = useMemo<SprintFilterKey[]>(
    () => ["backlog", ...sprints.map((s) => s.index)],
    [sprints],
  );
  const suiteFilterOrder = useMemo<TestSuite[]>(() => ["manual", "vitest", "playwright"], []);
  const testerFilterOrder = useMemo<TesterFilterKey[]>(
    () => [...QA_TESTERS.map((t) => t.id), "unassigned"],
    [],
  );

  // Drop status pins when the user changes filters (not when statuses update).
  useEffect(() => {
    setStatusPinIds(new Set());
    setStatusPinSort({});
  }, [
    facingFilters,
    categoryFilters,
    areaFilter,
    statusFilters,
    testerFilters,
    suiteFilters,
    sprintFilters,
    query,
  ]);

  const listOrderFor = (id: string): number => {
    if (statusPinIds.has(id) && statusPinSort[id] !== undefined) return statusPinSort[id]!;
    const st = statuses[id] ?? DEFAULT_TEST_STATUS;
    return STATUS_LIST_ORDER[st];
  };

  const filtered = useMemo(() => {
    const list = COUNTABLE_CASES.filter(
      (t) => caseMatchesFilters(t) || statusPinIds.has(t.id),
    );
    list.sort((a, b) => {
      const byStatus = listOrderFor(a.id) - listOrderFor(b.id);
      if (byStatus !== 0) return byStatus;
      return a.id.localeCompare(b.id);
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caseMatchesFilters closes over filter state
  }, [...filterDeps, statusPinIds, statusPinSort]);

  const filteredIds = useMemo(() => filtered.map((t) => t.id), [filtered]);

  useEffect(() => {
    if (loading || !preferExpanded) return;
    setOpenIds(new Set(filteredIds));
  }, [loading, preferExpanded, filteredIds]);

  const toggleFacingFilter = (facing: TestFacing, e?: MouseEvent) => {
    const { next, lastIndex } = applyMultiSelectClick(
      facingFilters,
      facing,
      TEST_FACINGS,
      lastFacingIdx.current,
      Boolean(e?.shiftKey),
    );
    lastFacingIdx.current = lastIndex;
    setFacingFilters(next);
  };

  const toggleCategoryFilter = (cat: TestCategory, e?: MouseEvent) => {
    const { next, lastIndex } = applyMultiSelectClick(
      categoryFilters,
      cat,
      TEST_CATEGORIES,
      lastCategoryIdx.current,
      Boolean(e?.shiftKey),
    );
    lastCategoryIdx.current = lastIndex;
    setCategoryFilters(next);
  };

  /** Keep the same card under the viewport after status saves reflow the list. */
  const captureScrollAnchor = (anchorId: string) => {
    const el = document.getElementById(`test-row-${anchorId}`);
    return {
      anchorId,
      top: el?.getBoundingClientRect().top ?? null,
      scrollY: window.scrollY,
      scrollX: window.scrollX,
    };
  };

  const restoreScrollAnchor = (anchor: {
    anchorId: string;
    top: number | null;
    scrollY: number;
    scrollX: number;
  }) => {
    const apply = () => {
      const el = document.getElementById(`test-row-${anchor.anchorId}`);
      if (el && anchor.top !== null) {
        const delta = el.getBoundingClientRect().top - anchor.top;
        if (Math.abs(delta) > 1) window.scrollBy(0, delta);
        return;
      }
      window.scrollTo({ top: anchor.scrollY, left: anchor.scrollX, behavior: "auto" });
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(apply);
    });
    window.setTimeout(apply, 50);
  };

  const setStatus = async (id: string, status: TestStatus) => {
    if (!canChangeStatus) {
      setError("QA or Admin access is required to change test status.");
      return;
    }
    if (!assertCaseUnlocked(id)) return;
    if (status === "blocked" && !canBlock) {
      setError("Only Evelyn may set a test to Blocked.");
      return;
    }
    const prev = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
    if (isDevFixStatus(status) && !canDevFix && prev !== status) {
      setError(`Only ${LEAD_DEVELOPER_LABEL} may set Fixed/Re-Test or Failed/Re-Test.`);
      return;
    }
    const note = composedNote(id);
    const steps = stepsFor(id);
    let checked = checkedFor(id);
    const failedIdx = failedStepRef.current[id];

    // Pass attests the checklist was completed — fill any unchecked steps so the
    // click actually saves instead of failing silently when the banner is off-screen.
    if (status === "pass" && steps.length > 0 && !allStepsChecked(checked, steps.length)) {
      checked = Array.from({ length: steps.length }, () => true);
      setCheckedStepsByCase((prev) => ({ ...prev, [id]: checked }));
    }
    if (status === "fail" && steps.length > 0 && (failedIdx === null || failedIdx === undefined || failedIdx < 0)) {
      const msg = "Select which step failed before marking Fail.";
      setRowErrors((prev) => ({ ...prev, [id]: msg }));
      setError(msg);
      setOpenIds((prev) => new Set(prev).add(id));
      return;
    }
    if (statusRequiresNote(status) && !noteMeetsRequirement(note)) {
      const msg =
        status === "conditional_approval"
          ? `A note is required for Conditional Pass (at least ${NOTE_MIN_LENGTH} characters). Describe the conditions.`
          : status === "fixed_retest"
            ? `A note is required for Fixed/Re-Test (at least ${NOTE_MIN_LENGTH} characters). Describe what was fixed.`
            : status === "failed_retest"
              ? `A note is required for Failed/Re-Test (at least ${NOTE_MIN_LENGTH} characters). Describe why this was not a real failure (misunderstood/unclear test).`
              : status === "fixed_cursor"
                ? `A note is required for Fixed/Cursor (at least ${NOTE_MIN_LENGTH} characters). Describe what Cursor fixed.`
              : status === "fixed_lighthouse"
                ? `A note is required for Fixed/Lighthouse (at least ${NOTE_MIN_LENGTH} characters). Describe which Lighthouse audit was fixed.`
              : status === "fixed_foresight"
                ? `A note is required for Fixed/Foresight (at least ${NOTE_MIN_LENGTH} characters). Describe which Foresight audit was fixed.`
              : `A note is required for ${STATUS_LABELS[status]} (at least ${NOTE_MIN_LENGTH} characters). Describe what failed or what is blocking.`;
      setRowErrors((prev) => ({ ...prev, [id]: msg }));
      setError(msg);
      setOpenIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      requestAnimationFrame(() => {
        document.getElementById(`test-note-${id}`)?.focus();
      });
      return;
    }
    const scrollAnchor = captureScrollAnchor(id);
    setError("");
    setSaveFlash("");
    setRowErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    // Always start a timer when leaving Not Started (incl. direct Pass/Fail).
    if (status !== prev && status !== "not_run") {
      await maybeStartTestTimer(id, { force: true });
    }
    const gen = beginSave(id);
    const currentAssignee = persistedAssignee(id);
    let assignee = currentAssignee;
    if (status === "fail") {
      const keepDev =
        isHumanQaTester(currentAssignee) && devAssigneeIds.has(currentAssignee as QaTesterId)
          ? (currentAssignee as QaTesterId)
          : FAILED_TEST_ASSIGNEE;
      assignee = keepDev;
      if (
        isHumanQaTester(currentAssignee) &&
        !devAssigneeIds.has(currentAssignee as QaTesterId)
      ) {
        setOriginalAssigneesByCase((prevOrig) => ({ ...prevOrig, [id]: currentAssignee }));
      } else if (!originalAssigneesByCase[id]) {
        const fromProof = proofreadOwnerFromId(id);
        if (fromProof) {
          setOriginalAssigneesByCase((prevOrig) => ({ ...prevOrig, [id]: fromProof }));
        }
      }
    } else if (isDevFixStatus(status) && prev !== status) {
      // Only hand back when entering Fixed/Failed Re-Test — not on later status re-saves.
      const fromProof = proofreadOwnerFromId(id);
      assignee = originalAssigneesByCase[id] || fromProof || currentAssignee;
    }
    // Keep this row on screen / in place even if filters or sort would move it.
    setStatusPinIds((prevPins) => {
      const next = new Set(prevPins);
      next.add(id);
      return next;
    });
    setStatusPinSort((prevSort) => ({
      ...prevSort,
      [id]: prevSort[id] ?? STATUS_LIST_ORDER[prev],
    }));
    setStatuses((s) => ({ ...s, [id]: status }));
    if (status === "fail") {
      setAssigneeOverrides((prevAssignees) => ({ ...prevAssignees, [id]: assignee }));
    } else if (isDevFixStatus(status) && assignee) {
      setAssigneeOverrides((prevAssignees) => ({ ...prevAssignees, [id]: assignee }));
    }
    if (isDevFixStatus(status)) {
      const stepCount = stepsFor(id).length;
      const unchecked = Array.from({ length: stepCount }, () => false);
      setCheckedStepsByCase((prev) => ({ ...prev, [id]: unchecked }));
      setFailedStepByCase((prev) => ({ ...prev, [id]: null }));
      failedStepRef.current[id] = null;
    }
    try {
      const data = await saveTestStatus(
        id,
        status,
        note,
        assignee,
        persistedSprint(id),
        evidenceOpts(id, status, undefined, checked),
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
      setSaveFlash(`${id} → ${STATUS_LABELS[status]} saved`);
      if (status !== prev && isTestStatusResolved(status)) {
        await creditCompletedTestWork(id);
      }
      restoreScrollAnchor(scrollAnchor);
    } catch (e) {
      if (!endSave(id, gen)) return;
      setStatuses((s) => ({ ...s, [id]: prev }));
      const msg = e instanceof ApiError ? e.message : "Failed to save test status.";
      setRowErrors((prevErr) => ({ ...prevErr, [id]: msg }));
      setError(msg);
      setOpenIds((prevOpen) => new Set(prevOpen).add(id));
      restoreScrollAnchor(scrollAnchor);
    }
  };

  const uploadEvidenceFile = async (caseId: string, file: File) => {
    const contentBase64 = await fileToBase64(file);
    const meta = await uploadTestEvidence({
      caseId,
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      contentBase64,
    });
    setAttachmentsByCase((prev) => ({
      ...prev,
      [caseId]: [meta, ...(prev[caseId] ?? [])],
    }));
    setSaveFlash(`Attached ${file.name} (scanned clean)`);
    return meta;
  };

  const attachEvidenceFile = async (caseId: string, file: File) => {
    if (!assertCaseUnlocked(caseId)) return;
    setAttachBusyId(caseId);
    setError("");
    try {
      await uploadEvidenceFile(caseId, file);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Attachment rejected or upload failed.";
      setError(msg);
      setRowErrors((prev) => ({ ...prev, [caseId]: msg }));
    } finally {
      setAttachBusyId(null);
    }
  };

  const captureScreenshot = async (caseId: string) => {
    if (!assertCaseUnlocked(caseId)) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getDisplayMedia) {
      const msg =
        "Screenshot capture needs a secure browser (HTTPS). Attach an image file instead.";
      setError(msg);
      setRowErrors((prev) => ({ ...prev, [caseId]: msg }));
      return;
    }
    setAttachBusyId(caseId);
    setError("");
    setSaveFlash("Choose a tab or window in the browser picker…");
    setRowErrors((prev) => {
      if (!prev[caseId]) return prev;
      const next = { ...prev };
      delete next[caseId];
      return next;
    });
    let stream: MediaStream | null = null;
    try {
      // Keep constraints minimal — over-constrained options can block the picker.
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
        // Prefer this tab when supported (Chrome); ignored elsewhere.
        preferCurrentTab: true,
        selfBrowserSurface: "include",
      } as DisplayMediaStreamOptions);
      const track = stream.getVideoTracks()[0];
      if (!track) throw new Error("No video track from screen share.");

      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(
          () => reject(new Error("Screenshot timed out waiting for the shared screen.")),
          10000,
        );
        const done = () => {
          window.clearTimeout(timer);
          resolve();
        };
        video.onloadedmetadata = () => {
          void video.play().then(done).catch(reject);
        };
        video.onerror = () => {
          window.clearTimeout(timer);
          reject(new Error("Could not load screen capture."));
        };
        // Some browsers fire metadata before the handler is attached.
        if (video.readyState >= 1) {
          void video.play().then(done).catch(reject);
        }
      });

      // Wait two frames so the first painted image is available.
      await new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      );

      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) {
        throw new Error("Screen capture had no image — pick a tab/window and try again.");
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not capture frame.");
      ctx.drawImage(video, 0, 0);

      stream.getTracks().forEach((t) => t.stop());
      stream = null;
      video.srcObject = null;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob || blob.size < 32) throw new Error("Could not build PNG screenshot.");
      const file = new File([blob], `screenshot-${caseId}-${Date.now()}.png`, {
        type: "image/png",
      });
      setSaveFlash("Uploading screenshot…");
      await uploadEvidenceFile(caseId, file);
    } catch (e) {
      stream?.getTracks().forEach((t) => t.stop());
      let msg = "Screenshot failed.";
      if (e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "AbortError")) {
        msg = "Screenshot cancelled — allow screen sharing, or attach an image file instead.";
      } else if (e instanceof ApiError) {
        msg = e.message;
      } else if (e instanceof Error && e.message) {
        msg = e.message;
      }
      setError(msg);
      setRowErrors((prev) => ({ ...prev, [caseId]: msg }));
      setSaveFlash("");
    } finally {
      setAttachBusyId(null);
    }
  };

  const removeEvidence = async (caseId: string, attachmentId: string) => {
    try {
      await deleteTestEvidence(attachmentId);
      setAttachmentsByCase((prev) => ({
        ...prev,
        [caseId]: (prev[caseId] ?? []).filter((a) => a.id !== attachmentId),
      }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not remove attachment.");
    }
  };

  const openEvidence = async (
    caseId: string,
    att: TestAttachmentMeta,
    mode: AttachmentOpenMode = "view",
  ) => {
    setError("");
    setOpeningAttachmentId(att.id);
    try {
      const remote = await fetchTestEvidenceContent(att.id);
      if (!remote.contentBase64?.trim()) {
        throw new Error("Attachment file bytes are missing from the database.");
      }
      const mime = remote.mimeType || att.mimeType || "application/octet-stream";
      const blob = base64ToBlob(remote.contentBase64, mime);
      const fileName = remote.name || att.name || "evidence";
      const resolvedMode =
        mode === "view" && !canViewAttachmentInline(mime, fileName) ? "download" : mode;
      openAttachmentBlob(blob, { name: fileName, mimeType: mime, mode: resolvedMode });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Could not open attachment.";
      setError(msg);
      setRowErrors((prev) => ({ ...prev, [caseId]: msg }));
    } finally {
      setOpeningAttachmentId(null);
    }
  };

  const reassign = async (id: string, assignee: string) => {
    setError("");
    const assignedBy = actingAssignBy;
    const dateAssigned = assignmentToday();
    setAssigneeOverrides((prev) => {
      const next = { ...prev };
      if (assignee) next[id] = assignee;
      else delete next[id];
      return next;
    });
    setAssignedByByCase((prev) => ({ ...prev, [id]: assignedBy }));
    setDateAssignedByCase((prev) => ({ ...prev, [id]: dateAssigned }));
    const gen = beginSave(id);
    try {
      const status = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
      const data = await saveTestStatus(
        id,
        status,
        composedNote(id),
        assignee,
        persistedSprint(id),
        {
          ...evidenceOpts(id, status),
          assignedBy,
          dateAssigned,
        },
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
    } catch (e) {
      endSave(id, gen);
      setError(e instanceof ApiError ? e.message : "Failed to save assignee.");
    }
  };

  /** Admin-only: change Assigned By without touching assignee or Assigned Date. */
  const setAssignedBy = async (id: string, assignedBy: string) => {
    if (!isAdmin) return;
    const nextBy = assignedBy.trim() || SYSTEM_ASSIGNED_BY;
    setError("");
    setAssignedByByCase((prev) => ({ ...prev, [id]: nextBy }));
    const gen = beginSave(id);
    try {
      const status = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
      const data = await saveTestStatus(
        id,
        status,
        composedNote(id),
        persistedAssignee(id),
        persistedSprint(id),
        {
          ...evidenceOpts(id, status),
          assignedBy: nextBy,
        },
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
    } catch (e) {
      endSave(id, gen);
      setError(e instanceof ApiError ? e.message : "Failed to save Assigned By.");
    }
  };

  const bulkSetAssignedBy = async (assignedBy: string) => {
    if (!isAdmin || selectedIds.size === 0) return;
    const ids = [...selectedIds];
    const nextBy = assignedBy.trim() || SYSTEM_ASSIGNED_BY;
    setBulkBusy(true);
    setError("");
    try {
      const items = ids.map((id) => {
        const status = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
        const caseDef = ALL_CASES.find((c) => c.id === id);
        const sprint = sprintByCase[id] ?? (caseDef ? suggestedSprintForTest(caseDef) : BACKLOG_SPRINT);
        return {
          caseId: id,
          status,
          note: composedNote(id),
          assignee: persistedAssignee(id),
          sprint,
          dueDate: persistedDueDate(id, sprint),
          assignedBy: nextBy,
          checkedSteps: checkedFor(id),
          failedStepIndex: failedStepRef.current[id] ?? null,
          stepCount: stepsFor(id).length,
        };
      });
      setAssignedByByCase((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = nextBy;
        return next;
      });
      const data = await saveTestStatusesBatch(items);
      applyServerData(data);
      setSaveFlash(`${ids.length} test(s) Assigned By → ${nextBy}`);
      window.setTimeout(() => setSaveFlash(""), 3500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bulk Assigned By failed.");
    } finally {
      setBulkBusy(false);
    }
  };

  const setSprint = async (id: string, sprint: number) => {
    if (!assertCaseUnlocked(id, sprint)) return;
    setError("");
    const due = dueDateForSprint(sprint);
    const nextAssignee = isBacklogSprint(sprint)
      ? assigneeForBacklogSprint(sprint, "test", persistedAssignee(id))
      : persistedAssignee(id);
    setSprintByCase((prev) => ({ ...prev, [id]: sprint }));
    setDueDatesByCase((prev) => ({ ...prev, [id]: due }));
    if (isBacklogSprint(sprint)) {
      setAssigneeOverrides((prev) => ({ ...prev, [id]: nextAssignee }));
    }
    const gen = beginSave(id);
    try {
      const status = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
      const data = await saveTestStatus(
        id,
        status,
        composedNote(id),
        nextAssignee,
        sprint,
        evidenceOpts(id, status, due),
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
    } catch (e) {
      endSave(id, gen);
      setError(e instanceof ApiError ? e.message : "Failed to save sprint.");
    }
  };

  const setDueDate = async (id: string, iso: string) => {
    if (!assertCaseUnlocked(id)) return;
    const normalized = isoToMmddyy(iso);
    if (normalized === null) {
      setError("Pick a valid due date.");
      return;
    }
    setError("");
    setDueDatesByCase((prev) => ({ ...prev, [id]: normalized }));
    const gen = beginSave(id);
    try {
      const status = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
      const data = await saveTestStatus(
        id,
        status,
        composedNote(id),
        persistedAssignee(id),
        persistedSprint(id),
        evidenceOpts(id, status, normalized),
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
    } catch (e) {
      endSave(id, gen);
      setError(e instanceof ApiError ? e.message : "Failed to save due date.");
    }
  };

  /** Persist all dirty notes/steps (and current status/assignee/sprint) — does not auto-start Not Started cases. */
  const saveEverything = async () => {
    const ids = [...new Set([...dirtyNotesRef.current, ...dirtyStepsRef.current])];
    if (ids.length === 0) {
      setSaveFlash("Nothing to save — no unsaved notes or step checklists.");
      return;
    }
    setError("");
    setSaveFlash("");
    setSavingAll(true);
    let saved = 0;
    const errors: string[] = [];
    try {
      for (const id of ids) {
        const currentStatus = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
        const note = composedNote(id);
        if (statusRequiresNote(currentStatus) && !noteMeetsRequirement(note)) {
          const msg = `A note is required for ${STATUS_LABELS[currentStatus]} on ${id} (at least ${NOTE_MIN_LENGTH} characters).`;
          setRowErrors((prev) => ({ ...prev, [id]: msg }));
          errors.push(msg);
          continue;
        }
        const hasDirtySteps = dirtyStepsRef.current.has(id);
        if (
          currentStatus === "not_run" &&
          !noteEntriesPlainText(note) &&
          !hasDirtySteps &&
          !persistedAssignee(id) &&
          !(persistedSprint(id) > 0)
        ) {
          clearDirtyNote(id);
          clearDirtySteps(id);
          continue;
        }
        const gen = beginSave(id);
        try {
          const data = await saveTestStatus(
            id,
            currentStatus,
            note,
            persistedAssignee(id),
            persistedSprint(id),
            evidenceOpts(id, currentStatus),
          );
          if (!endSave(id, gen)) continue;
          applyServerData(data, id);
          saved += 1;
        } catch (e) {
          endSave(id, gen);
          const msg = e instanceof ApiError ? e.message : `Failed to save ${id}.`;
          setRowErrors((prev) => ({ ...prev, [id]: msg }));
          errors.push(msg);
        }
      }
      if (errors.length > 0) {
        setError(errors[0]!);
        setSaveFlash(
          saved > 0
            ? `Saved ${saved} case${saved === 1 ? "" : "s"}; ${errors.length} need attention.`
            : "Save failed — fix notes on Fail/Blocked cases.",
        );
      } else {
        setSaveFlash(`Saved everything — ${saved} case${saved === 1 ? "" : "s"} updated.`);
      }
    } finally {
      setSavingAll(false);
    }
  };

  const toggleStatusFilter = (status: TestStatus, e?: MouseEvent) => {
    const { next, lastIndex } = applyMultiSelectClick(
      statusFilters,
      status,
      STATUSES,
      lastStatusIdx.current,
      Boolean(e?.shiftKey),
    );
    lastStatusIdx.current = lastIndex;
    setStatusFilters(next);
  };

  const toggleTesterFilter = (id: TesterFilterKey, e?: MouseEvent) => {
    const { next, lastIndex } = applyMultiSelectClick(
      testerFilters,
      id,
      testerFilterOrder,
      lastTesterIdx.current,
      Boolean(e?.shiftKey),
    );
    lastTesterIdx.current = lastIndex;
    setTesterFilters(next);
    if (next.size > 0) {
      // Narrow to that tester within the current sprint filter (portal defaults to
      // today's sprint). Clear other facets so Status chips stay useful.
      setSuiteFilters(new Set(["manual"]));
      setStatusFilters(new Set());
      setCategoryFilters(new Set());
      setFacingFilters(new Set());
      setAreaFilter("all");
      setQuery("");
      lastStatusIdx.current = null;
      lastCategoryIdx.current = null;
      lastFacingIdx.current = null;
    }
  };

  const toggleSuiteFilter = (suite: TestSuite, e?: MouseEvent) => {
    const { next, lastIndex } = applyMultiSelectClick(
      suiteFilters,
      suite,
      suiteFilterOrder,
      lastSuiteIdx.current,
      Boolean(e?.shiftKey),
    );
    lastSuiteIdx.current = lastIndex;
    setSuiteFilters(next);
  };

  /** Top filter: Vitest + Playwright as one "Automated" chip. */
  const automatedSuiteActive =
    suiteFilters.has("vitest") || suiteFilters.has("playwright");

  const toggleAutomatedSuiteFilter = () => {
    setSuiteFilters((prev) => {
      const next = new Set(prev);
      const active = next.has("vitest") || next.has("playwright");
      if (active) {
        next.delete("vitest");
        next.delete("playwright");
      } else {
        next.add("vitest");
        next.add("playwright");
      }
      return next;
    });
    lastSuiteIdx.current = null;
  };

  const toggleSprintFilter = (key: SprintFilterKey, e?: MouseEvent) => {
    const { next, lastIndex } = applyMultiSelectClick(
      sprintFilters,
      key,
      sprintFilterOrder,
      lastSprintIdx.current,
      Boolean(e?.shiftKey),
    );
    lastSprintIdx.current = lastIndex;
    setSprintFilters(next);
  };

  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const toggleSelect = (id: string) => {
    const selecting = !selectedIds.has(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selecting) next.add(id);
      else next.delete(id);
      return next;
    });
    if (selecting) void maybeStartTestTimer(id);
  };

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev);
        for (const id of filteredIds) next.delete(id);
        return next;
      }
      const next = new Set(prev);
      for (const id of filteredIds) next.add(id);
      return next;
    });
  };

  const bulkAssign = async (assignee: QaTesterId) => {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds].filter((id) => !isAutomatedTestId(id));
    if (ids.length === 0) {
      setError("Automated Vitest/Playwright cases keep their suite owners — select manual cases to assign.");
      return;
    }
    setBulkBusy(true);
    setError("");
    const assignedBy = actingAssignBy;
    const dateAssigned = assignmentToday();
    try {
      const items = ids.map((id) => {
        const status = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
        const caseDef = ALL_CASES.find((c) => c.id === id);
        const sprint = sprintByCase[id] ?? (caseDef ? suggestedSprintForTest(caseDef) : BACKLOG_SPRINT);
        return {
          caseId: id,
          status,
          note: composedNote(id),
          assignee,
          sprint,
          dueDate: persistedDueDate(id, sprint),
          assignedBy,
          dateAssigned,
          checkedSteps: checkedFor(id),
          failedStepIndex: failedStepRef.current[id] ?? null,
          stepCount: stepsFor(id).length,
        };
      });
      setAssigneeOverrides((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = assignee;
        return next;
      });
      setAssignedByByCase((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = assignedBy;
        return next;
      });
      setDateAssignedByCase((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = dateAssigned;
        return next;
      });
      const data = await saveTestStatusesBatch(items);
      applyServerData(data);
      setSaveFlash(`${ids.length} test(s) assigned to ${testOwnerLabel(assignee)}`);
      window.setTimeout(() => setSaveFlash(""), 3500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bulk assign failed.");
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkSetStatus = async (status: TestStatus) => {
    if (selectedIds.size === 0) return;
    if (!canChangeStatus) {
      setError("QA or Admin access is required to change test status.");
      return;
    }
    if (status === "blocked" && !canBlock) {
      setError("Only Evelyn may set a test to Blocked.");
      return;
    }
    if (isDevFixStatus(status) && !canDevFix) {
      setError(`Only ${LEAD_DEVELOPER_LABEL} may set Fixed/Re-Test or Failed/Re-Test.`);
      return;
    }
    const ids = [...selectedIds];
    if (statusRequiresNote(status)) {
      const missing = ids.filter((id) => !noteMeetsRequirement(composedNote(id)));
      if (missing.length > 0) {
        setError(
          `A note is required for ${STATUS_LABELS[status]} on ${missing.length} selected case(s) (at least ${NOTE_MIN_LENGTH} characters). Add notes first, or choose Pass / In Progress / Not Started.`,
        );
        return;
      }
    }
    if (status === "fail") {
      const missingStep = ids.filter((id) => {
        const n = stepsFor(id).length;
        const idx = failedStepRef.current[id];
        return n > 0 && (idx === null || idx === undefined || idx < 0);
      });
      if (missingStep.length > 0) {
        setError(
          `Select the failed step on ${missingStep.length} selected case(s) before bulk Fail.`,
        );
        return;
      }
    }
    setBulkBusy(true);
    setError("");
    setSaveFlash("");
    const prevStatuses = { ...statusesRef.current };
    const scrollAnchor = captureScrollAnchor(ids[0]!);
    try {
      const items = ids.map((id) => {
        const currentAssignee = persistedAssignee(id);
        let assignee = currentAssignee;
        if (status === "fail") {
          assignee =
            isHumanQaTester(currentAssignee) && devAssigneeIds.has(currentAssignee as QaTesterId)
              ? currentAssignee
              : FAILED_TEST_ASSIGNEE;
        } else if (isDevFixStatus(status)) {
          const prevSt = prevStatuses[id] ?? DEFAULT_TEST_STATUS;
          if (prevSt !== status) {
            assignee =
              originalAssigneesByCase[id] || proofreadOwnerFromId(id) || currentAssignee;
          }
        }
        const stepCount = stepsFor(id).length;
        const checked =
          status === "pass" && stepCount > 0
            ? Array.from({ length: stepCount }, () => true)
            : isDevFixStatus(status)
              ? Array.from({ length: stepCount }, () => false)
              : checkedFor(id);
        return {
          caseId: id,
          status,
          note: composedNote(id),
          assignee,
          sprint: persistedSprint(id),
          dueDate: persistedDueDate(id),
          checkedSteps: checked,
          failedStepIndex: status === "fail" ? failedStepRef.current[id] ?? null : null,
          stepCount,
        };
      });
      // Optimistic UI — pin so bulk status changes don't yank the list away.
      setStatusPinIds((prevPins) => {
        const next = new Set(prevPins);
        for (const id of ids) next.add(id);
        return next;
      });
      setStatusPinSort((prevSort) => {
        const next = { ...prevSort };
        for (const id of ids) {
          const prevSt = prevStatuses[id] ?? DEFAULT_TEST_STATUS;
          next[id] = next[id] ?? STATUS_LIST_ORDER[prevSt];
        }
        return next;
      });
      setStatuses((s) => {
        const next = { ...s };
        for (const id of ids) next[id] = status;
        return next;
      });
      if (status === "pass") {
        setCheckedStepsByCase((prev) => {
          const next = { ...prev };
          for (const id of ids) {
            const n = stepsFor(id).length;
            if (n > 0) next[id] = Array.from({ length: n }, () => true);
          }
          return next;
        });
      }
      if (status === "fail") {
        setAssigneeOverrides((prev) => {
          const next = { ...prev };
          for (const id of ids) {
            const cur = persistedAssignee(id);
            if (isHumanQaTester(cur) && !devAssigneeIds.has(cur as QaTesterId)) {
              setOriginalAssigneesByCase((prevOrig) => ({ ...prevOrig, [id]: cur }));
            }
            next[id] =
              isHumanQaTester(cur) && devAssigneeIds.has(cur as QaTesterId)
                ? cur
                : FAILED_TEST_ASSIGNEE;
          }
          return next;
        });
      } else if (isDevFixStatus(status)) {
        setAssigneeOverrides((prev) => {
          const next = { ...prev };
          for (const id of ids) {
            const prevSt = prevStatuses[id] ?? DEFAULT_TEST_STATUS;
            if (prevSt === status) continue;
            const restore =
              originalAssigneesByCase[id] || proofreadOwnerFromId(id) || persistedAssignee(id);
            if (restore) next[id] = restore;
          }
          return next;
        });
        setCheckedStepsByCase((prev) => {
          const next = { ...prev };
          for (const id of ids) {
            next[id] = Array.from({ length: stepsFor(id).length }, () => false);
          }
          return next;
        });
        setFailedStepByCase((prev) => {
          const next = { ...prev };
          for (const id of ids) {
            next[id] = null;
            failedStepRef.current[id] = null;
          }
          return next;
        });
      }
      const data = await saveTestStatusesBatch(items);
      applyServerData(data);
      for (const id of ids) {
        const prevSt = prevStatuses[id] ?? DEFAULT_TEST_STATUS;
        if (prevSt === status) continue;
        if (isTestStatusResolved(status)) {
          await creditCompletedTestWork(id);
        } else if (status !== "not_run") {
          await maybeStartTestTimer(id, { force: true });
        }
      }
      void timers.refresh();
      setSaveFlash(`${ids.length} test(s) → ${STATUS_LABELS[status]}`);
      window.setTimeout(() => setSaveFlash(""), 3500);
      restoreScrollAnchor(scrollAnchor);
    } catch (e) {
      setStatuses(prevStatuses);
      setError(e instanceof ApiError ? e.message : "Bulk status update failed.");
      restoreScrollAnchor(scrollAnchor);
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkSetSprint = async (sprint: number) => {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    const due = dueDateForSprint(sprint);
    setBulkBusy(true);
    setError("");
    setSaveFlash("");
    const prevSprints = { ...sprintByCase };
    const prevDues = { ...dueDatesByCase };
    try {
      const items = ids.map((id) => {
        const status = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
        const assignee = isBacklogSprint(sprint)
          ? assigneeForBacklogSprint(sprint, "test", persistedAssignee(id))
          : persistedAssignee(id);
        return {
          caseId: id,
          status,
          note: composedNote(id),
          assignee,
          sprint,
          dueDate: due,
          checkedSteps: checkedFor(id),
          failedStepIndex: failedStepRef.current[id] ?? null,
          stepCount: stepsFor(id).length,
        };
      });
      setSprintByCase((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = sprint;
        return next;
      });
      setDueDatesByCase((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = due;
        return next;
      });
      const data = await saveTestStatusesBatch(items);
      applyServerData(data);
      const label = sprint === BACKLOG_SPRINT ? "Backlog" : sprintLabel(sprint);
      setSaveFlash(`${ids.length} test(s) → ${label}${due ? ` · due ${due}` : ""}`);
      window.setTimeout(() => setSaveFlash(""), 3500);
    } catch (e) {
      setSprintByCase(prevSprints);
      setDueDatesByCase(prevDues);
      setError(e instanceof ApiError ? e.message : "Bulk sprint update failed.");
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkSetDueDate = async (iso: string) => {
    if (selectedIds.size === 0) return;
    const normalized = isoToMmddyy(iso);
    if (normalized === null || normalized === "") {
      setError("Pick a due date from the calendar.");
      return;
    }
    const ids = [...selectedIds];
    setBulkBusy(true);
    setError("");
    try {
      const items = ids.map((id) => {
        const status = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
        return {
          caseId: id,
          status,
          note: composedNote(id),
          assignee: persistedAssignee(id),
          sprint: persistedSprint(id),
          dueDate: normalized,
          checkedSteps: checkedFor(id),
          failedStepIndex: failedStepRef.current[id] ?? null,
          stepCount: stepsFor(id).length,
        };
      });
      setDueDatesByCase((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = normalized;
        return next;
      });
      const data = await saveTestStatusesBatch(items);
      applyServerData(data);
      setBulkDueDate("");
      setSaveFlash(`${ids.length} test(s) due → ${normalized}`);
      window.setTimeout(() => setSaveFlash(""), 3500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bulk due date update failed.");
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkSetDescription = async (raw: string) => {
    if (selectedIds.size === 0) return;
    const text = raw.trim();
    if (!text) {
      setError("Enter a description/note to apply.");
      return;
    }
    const ids = [...selectedIds];
    setBulkBusy(true);
    setError("");
    try {
      const items = ids.map((id) => {
        const status = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
        const note = appendActorNote(notesRef.current[id] ?? "", actingAssignBy, text);
        return {
          caseId: id,
          status,
          note,
          assignee: persistedAssignee(id),
          sprint: persistedSprint(id),
          dueDate: persistedDueDate(id),
          checkedSteps: checkedFor(id),
          failedStepIndex: failedStepRef.current[id] ?? null,
          stepCount: stepsFor(id).length,
        };
      });
      setNotes((prev) => {
        const next = { ...prev };
        for (const item of items) next[item.caseId] = item.note;
        return next;
      });
      const data = await saveTestStatusesBatch(items);
      applyServerData(data);
      setBulkDescription("");
      setSaveFlash(`${ids.length} test(s) note appended as ${actingAssignBy}`);
      window.setTimeout(() => setSaveFlash(""), 3500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bulk description update failed.");
    } finally {
      setBulkBusy(false);
    }
  };

  const runSuite = async (suite: AutomatedSuite, mode: AutomatedRunMode = "new") => {
    setSuiteRunning(suite);
    setError("");
    const suiteLabel =
      suite === "all"
        ? "Vitest + Playwright + Lighthouse + Foresight"
        : suite === "lighthouse"
          ? "Lighthouse"
          : suite === "foresight"
            ? "Foresight"
            : suite;
    setRunLog(
      `Running ${suiteLabel} (${mode === "new" ? "new / not-started only" : "full regression"})…`,
    );
    try {
      const result = await runAutomatedSuite(suite, mode);
      const failCreated =
        result.createdFailureCases && result.createdFailureCases.length > 0
          ? `\nNew failure cases: ${result.createdFailureCases.join(", ")}`
          : "";
      setRunLog(
        [
          result.summary,
          ...result.details,
          failCreated,
          `Local full suite: ${result.commands.vitest} · ${result.commands.playwright}`,
          result.commands.report ? `Report to D1: ${result.commands.report}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
      if (!result.ok) {
        setError(result.summary);
      } else {
        setSaveFlash(result.summary);
        window.setTimeout(() => setSaveFlash(""), 4000);
      }
      await reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to run automated tests.";
      setError(msg);
      setRunLog(msg);
    } finally {
      setSuiteRunning(null);
    }
  };

  const testerLabel = (ids: TestOwnerId[]) =>
    ids.length === 0 ? "Unassigned" : ids.map((id) => testOwnerLabel(id)).join(", ");

  const portalBusy =
    loading || savingAll || savingIds.size > 0 || suiteRunning !== null;
  const portalBusyMessage = loading
    ? "Loading test statuses…"
    : suiteRunning === "vitest"
      ? "Running Vitest…"
      : suiteRunning === "playwright"
        ? "Running Playwright…"
        : suiteRunning === "lighthouse"
          ? "Running Lighthouse…"
          : suiteRunning === "foresight"
            ? "Running Foresight…"
            : suiteRunning === "all"
              ? "Running test suites…"
              : savingAll || savingIds.size > 0
                ? "Saving test updates…"
                : "Please wait…";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <BusyOverlay active={portalBusy} message={portalBusyMessage} />
      <div className="qa-status-tiles" data-testid="qa-status-tiles">
        {(["total", ...STATUSES] as const).map((k) => {
          const isTotal = k === "total";
          const active = isTotal ? statusFilters.size === 0 : statusFilters.has(k);
          const statusCount = isTotal ? completedCases : (counts[k] ?? 0);
          const statusPct = pctComplete(statusCount, counts.total);
          const rolledIn =
            isTotal
              ? counts.rolled_over ?? 0
              : k === "rolled_over"
                ? statusCount
                : rolledWithinStatus[k] ?? 0;
          return (
            <button
              key={k}
              type="button"
              className={`qa-status-tile${active ? " qa-status-tile--active" : ""}`}
              onClick={(e) => {
                if (isTotal) {
                  setStatusFilters(new Set());
                  lastStatusIdx.current = null;
                } else {
                  toggleStatusFilter(k, e);
                }
              }}
              title={
                isTotal
                  ? `${completedCases}/${counts.total} complete · ${rolledIn} rolled over`
                  : k === "rolled_over"
                    ? `${STATUS_LABELS[k]} · ${statusCount}`
                    : `${STATUS_LABELS[k]} · ${statusCount} · ${rolledIn} rolled over`
              }
            >
              <div className="qa-status-tile__label">
                {isTotal ? "Complete / Total" : STATUS_LABELS[k]}
              </div>
              <div
                className="qa-status-tile__num"
                style={active ? undefined : { color: isTotal ? "var(--charcoal)" : STATUS_COLOR[k] }}
              >
                <span className="qa-status-tile__count">
                  {isTotal ? `${completedCases}/${counts.total}` : statusCount}
                </span>
                <span className="qa-status-tile__pct">{statusPct}</span>
              </div>
              {k !== "rolled_over" && rolledIn > 0 ? (
                <div className="qa-status-tile__rolled">Rolled over: {rolledIn}</div>
              ) : null}
            </button>
          );
        })}
      </div>

      <SprintStatusBars
        selectedSprint={
          sprintFilters.size === 0
            ? "all"
            : sprintFilters.size === 1
              ? ([...sprintFilters][0] ?? null)
              : null
        }
        onSelectSprint={(selection) => {
          if (selection === "all") {
            setSprintFilters(new Set());
            lastSprintIdx.current = null;
            return;
          }
          setSprintFilters(new Set([selection]));
          lastSprintIdx.current = selection;
        }}
      />
      <div className="glass qa-testing-portal" style={{ padding: "24px", borderRadius: "16px" }}>
        <div className="qa-testing-portal__header">
          <div className="qa-testing-portal__intro">
            <h2 style={{ fontSize: "1.5rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <FlaskConical size={22} style={{ color: "var(--bronze)" }} /> Testing Portal
              {onOpenManual && (
                <button
                  type="button"
                  className="qa-testing-portal__manual-link"
                  title="Open the QA testing manual"
                  onClick={onOpenManual}
                >
                  Testing manual
                </button>
              )}
            </h2>
            <p style={{ color: "var(--text-primary)", marginTop: "6px", fontSize: "1rem" }}>
              Select tests with checkboxes to bulk-assign or bulk-update status. Use status buttons to filter.
            </p>
          </div>
        </div>

        <div className="qa-testing-portal__categories" data-testid="qa-top-filters" style={{ marginTop: 16 }}>
          <div className="schedule-board-filters__row qa-testing-portal__testers-row">
            <div className="schedule-board-filters__label schedule-board-filters__label--bar qa-testing-portal__testers-bar">
              <span className="qa-testing-portal__testers-title">QA Testors</span>
              <div className="qa-testing-portal__top-filters">
                <FilterChip
                  active={testerFilters.size === 0}
                  onToggle={() => {
                    setTesterFilters(new Set());
                    lastTesterIdx.current = null;
                  }}
                  title={`Clear tester filter · ${testerStats.allRolled} rolled over`}
                >
                  All testers
                  <span className="qa-tester-meta">
                    · {testerStats.allPassed}/{testerStats.allTotal} passed
                    {testerStats.allRolled > 0 ? (
                      <span className="status-bubble__rolled">
                        Rolled over: {testerStats.allRolled}
                      </span>
                    ) : null}
                  </span>
                </FilterChip>
                {testerStats.testers.map((tester) => {
                  const active = testerFilters.has(tester.id);
                  return (
                    <FilterChip
                      key={tester.id}
                      active={active}
                      accent={tester.accent}
                      title={`${tester.name} — ${tester.passed}/${tester.total} passed · ${tester.rolled} rolled over — Shift+click to select a range`}
                      onToggle={(e) => toggleTesterFilter(tester.id, e)}
                    >
                      <span className="qa-tester-dot" style={{ background: tester.accent }} />
                      {tester.shortName}
                      <span className="qa-tester-meta">
                        · {tester.passed}/{tester.total} passed
                        {tester.rolled > 0 ? (
                          <span className="status-bubble__rolled">Rolled over: {tester.rolled}</span>
                        ) : null}
                      </span>
                    </FilterChip>
                  );
                })}
                <FilterChip
                  active={testerFilters.has("unassigned")}
                  accent={UNASSIGNED_TESTER_ACCENT}
                  title={`Unassigned — no Tina/Evelyn/Lyriq owner · ${testerStats.unassigned.passed}/${testerStats.unassigned.total} passed · ${testerStats.unassigned.rolled} rolled over — Shift+click to select a range`}
                  testId="qa-filter-assignee-unassigned"
                  onToggle={(e) => toggleTesterFilter("unassigned", e)}
                >
                  <span className="qa-tester-dot" style={{ background: UNASSIGNED_TESTER_ACCENT }} />
                  Unassigned
                  <span className="qa-tester-meta">
                    · {testerStats.unassigned.passed}/{testerStats.unassigned.total} passed
                    {testerStats.unassigned.rolled > 0 ? (
                      <span className="status-bubble__rolled">
                        Rolled over: {testerStats.unassigned.rolled}
                      </span>
                    ) : null}
                  </span>
                </FilterChip>
                {AUTOMATED_SUITE_OWNERS.map((owner) => {
                  const stats = autoAssigneeStats[owner.id];
                  const active = suiteFilters.has(owner.id);
                  return (
                    <FilterChip
                      key={owner.id}
                      active={active}
                      accent={owner.accent}
                      title={`${owner.name} — filter list to this suite · ${stats.passed}/${stats.total} passed (full catalog). Run suites under Test Suites.`}
                      testId={`qa-filter-assignee-${owner.id}`}
                      onToggle={(e) => {
                        setTesterFilters(new Set());
                        lastTesterIdx.current = null;
                        toggleSuiteFilter(owner.id, e);
                      }}
                    >
                      <span className="qa-tester-dot" style={{ background: owner.accent }} />
                      {owner.shortName}
                      <span className="qa-tester-meta" style={{ fontVariantNumeric: "tabular-nums" }}>
                        · {stats.passed}/{stats.total} passed
                        {stats.rolled > 0 ? (
                          <span className="status-bubble__rolled">Rolled over: {stats.rolled}</span>
                        ) : null}
                      </span>
                    </FilterChip>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="schedule-board-filters__row qa-testing-portal__testers-row"
            data-testid="qa-status-panel"
            style={{ marginTop: 16 }}
          >
            <div
              className="schedule-board-filters__label schedule-board-filters__label--bar qa-testing-portal__testers-bar"
              aria-expanded={statusOpen}
            >
              <ShowHideChevron
                open={statusOpen}
                onOpenChange={setStatusOpen}
                label="Status"
                testId="qa-status-chevron"
              />
              <button
                type="button"
                className="schedule-board-filters__filter-title schedule-board-filters__filter-title--collapse"
                onClick={() => setStatusOpen((v) => !v)}
                aria-expanded={statusOpen}
              >
                <span className="qa-testing-portal__testers-title">Status</span>
                {!statusOpen ? (
                  <span className="schedule-board-filters__label-hint">
                    — {statusFilterSummary}
                  </span>
                ) : null}
              </button>
              <ShowHideToggle
                open={statusOpen}
                onOpenChange={setStatusOpen}
                label="Status"
                testId="qa-status-toggle"
              />
            </div>
            {statusOpen ? (
              <div className="qa-testing-portal__top-filters" style={{ marginTop: 10 }}>
                <FilterChip
                  active={statusFilters.size === 0}
                  onToggle={() => {
                    setStatusFilters(new Set());
                    lastStatusIdx.current = null;
                  }}
                  title="Clear status filter"
                >
                  All statuses
                  <span className="qa-tester-meta">
                    · {countWithPct(completedCases, counts.total)}
                    {(counts.rolled_over ?? 0) > 0 ? (
                      <span className="status-bubble__rolled">
                        Rolled over: {counts.rolled_over ?? 0}
                      </span>
                    ) : null}
                  </span>
                </FilterChip>
                {STATUSES.map((s) => {
                  const active = statusFilters.has(s);
                  const n = counts[s] ?? 0;
                  const rolled =
                    s === "rolled_over" ? n : rolledWithinStatus[s] ?? 0;
                  return (
                    <FilterChip
                      key={s}
                      active={active}
                      accent={STATUS_COLOR[s]}
                      title={
                        s === "rolled_over"
                          ? `${STATUS_LABELS[s]} — ${n} tests — Shift+click to select a range`
                          : `${STATUS_LABELS[s]} — ${n} tests · ${rolled} rolled over — Shift+click to select a range`
                      }
                      onToggle={(e) => toggleStatusFilter(s, e)}
                    >
                      <span className="qa-tester-dot" style={{ background: STATUS_COLOR[s] }} />
                      {STATUS_LABELS[s]}
                      <span className="qa-tester-meta">
                        · {n}
                        {s !== "rolled_over" && rolled > 0 ? (
                          <span className="status-bubble__rolled">Rolled over: {rolled}</span>
                        ) : null}
                      </span>
                    </FilterChip>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div
            className="qa-testing-portal__tester-bars"
            data-testid="qa-tester-status-bars"
            style={{ marginTop: 12 }}
          >
            <div
              className="qa-section-heading qa-categories-panel__header qa-testing-portal__tester-bars-header"
              aria-expanded={testerBarsOpen}
            >
              <ShowHideChevron
                open={testerBarsOpen}
                onOpenChange={setTesterBarsOpen}
                label="Status bars"
                testId="qa-tester-bars-chevron"
              />
              <button
                type="button"
                className="qa-categories-panel__heading-btn"
                onClick={() => setTesterBarsOpen((v) => !v)}
                aria-expanded={testerBarsOpen}
              >
                <span className="qa-categories-panel__title">Status bars</span>
                {!testerBarsOpen ? (
                  <span className="qa-categories-panel__active">
                    —{" "}
                    {[
                      ...testerStats.testers.map((t) => `${t.shortName} ${t.passed}/${t.total}`),
                      `Unassigned ${testerStats.unassigned.passed}/${testerStats.unassigned.total}`,
                      ...AUTOMATED_SUITE_OWNERS.map(
                        (o) =>
                          `${o.shortName} ${autoAssigneeStats[o.id].passed}/${autoAssigneeStats[o.id].total}`,
                      ),
                    ].join(" · ")}
                  </span>
                ) : (
                  <span className="qa-categories-panel__active">
                    — humans follow status tiles · Vitest/Playwright = full suite catalog
                  </span>
                )}
              </button>
              <ShowHideToggle
                open={testerBarsOpen}
                onOpenChange={setTesterBarsOpen}
                label="Status bars"
                testId="qa-tester-bars-toggle"
              />
            </div>
            {testerBarsOpen ? (
              <>
                <p className="qa-testing-portal__tester-bars-note">
                  Human name bars use the same sprint / suite / category filters as the status tiles
                  above (defaults: current sprint · Manual). Vitest / Playwright bars use the full
                  automated catalog (not Sprint/Manual-filtered). Only Pass counts as passed.
                </p>
                {testerStats.testers.map((tester) => (
                  <TesterStatusRow
                    key={tester.id}
                    label={tester.shortName}
                    tally={tester.tally}
                    accent={tester.accent}
                    rolled={tester.rolled}
                  />
                ))}
                <TesterStatusRow
                  label="Unassigned"
                  tally={testerStats.unassigned.tally}
                  accent={UNASSIGNED_TESTER_ACCENT}
                  rolled={testerStats.unassigned.rolled}
                />
                {AUTOMATED_SUITE_OWNERS.map((owner) => (
                  <TesterStatusRow
                    key={owner.id}
                    label={owner.shortName}
                    tally={autoAssigneeStats[owner.id].tally}
                    accent={owner.accent}
                    rolled={autoAssigneeStats[owner.id].rolled}
                  />
                ))}
              </>
            ) : null}
          </div>

          <div
            className="schedule-board-filters__row qa-testing-portal__category"
            data-testid="qa-test-suites"
          >
            <div className="schedule-board-filters__label schedule-board-filters__label--bar">
              <ShowHideChevron
                open={automatedOpen}
                onOpenChange={setAutomatedOpen}
                label="Test Suites"
                testId="qa-test-suites-chevron"
              />
              <button
                type="button"
                className="schedule-board-filters__filter-title schedule-board-filters__filter-title--collapse"
                onClick={() => setAutomatedOpen((v) => !v)}
                aria-expanded={automatedOpen}
              >
                <span>Test Suites</span>
                {!automatedOpen ? (
                  <span className="schedule-board-filters__label-hint">
                    Manual{" "}
                    {countWithPct(
                      facetSuiteStats.manual.passed,
                      facetSuiteStats.manual.total,
                      " passed",
                    )}{" "}
                    · Automated{" "}
                    {countWithPct(
                      autoAssigneeStats.vitest.passed + autoAssigneeStats.playwright.passed,
                      autoAssigneeStats.vitest.total + autoAssigneeStats.playwright.total,
                      " passed",
                    )}
                    {auditAreaStats.map(
                      (r) =>
                        ` · ${r.area} ${countWithPct(r.fixed, r.total, " passed")}`,
                    )}
                  </span>
                ) : null}
              </button>
              <ShowHideToggle
                open={automatedOpen}
                onOpenChange={setAutomatedOpen}
                label="Test Suites"
                testId="qa-test-suites-toggle"
              />
            </div>

            {automatedOpen ? (
              <div className="qa-test-suites__layout" data-testid="qa-test-suites-body">
                <div className="qa-test-suites__chips">
                  <FilterChip
                    active={suiteFilters.has("manual") && !automatedSuiteActive}
                    onToggle={(e) => {
                      setAreaFilter("all");
                      toggleSuiteFilter("manual", e);
                    }}
                    title="Manual QA — human-owned cases"
                  >
                    Manual
                    <span className="qa-tester-meta">
                      ·{" "}
                      {countWithPct(
                        facetSuiteStats.manual.passed,
                        facetSuiteStats.manual.total,
                        " passed",
                      )}
                    </span>
                  </FilterChip>

                  <div className="qa-test-suites__child">
                    <FilterChip
                      active={automatedSuiteActive && areaFilter === "all"}
                      onToggle={() => {
                        setAreaFilter("all");
                        toggleAutomatedSuiteFilter();
                      }}
                      title="All automated = Vitest + Playwright"
                    >
                      Automated
                      <span className="qa-tester-meta">
                        ·{" "}
                        {countWithPct(
                          autoAssigneeStats.vitest.passed + autoAssigneeStats.playwright.passed,
                          autoAssigneeStats.vitest.total + autoAssigneeStats.playwright.total,
                          " passed",
                        )}
                      </span>
                    </FilterChip>
                    <button
                      type="button"
                      className="qa-tester-bubble qa-filter-chip qa-suite-assignee-run"
                      data-active={suiteRunning === "all" ? "true" : "false"}
                      data-testid="qa-run-assignee-all"
                      disabled={suiteRunning !== null || loading}
                      title="Run Vitest + Playwright + Lighthouse + Foresight (new / not-run only)"
                      onClick={() => void runSuite("all", "new")}
                    >
                      <Play size={14} aria-hidden />
                      {suiteRunning === "all" ? <WaitLabel>Running…</WaitLabel> : "Run"}
                    </button>
                  </div>

                  {AUTOMATED_SUITE_OWNERS.map((owner) => {
                    const running = suiteRunning === owner.id;
                    const stats = autoAssigneeStats[owner.id];
                    const suiteActive =
                      suiteFilters.has(owner.id) &&
                      !suiteFilters.has(owner.id === "vitest" ? "playwright" : "vitest") &&
                      !suiteFilters.has("manual");
                    return (
                      <div key={owner.id} className="qa-test-suites__child">
                        <FilterChip
                          active={suiteActive}
                          accent={owner.accent}
                          title={`${owner.name} — part of Automated (${stats.passed}/${stats.total}). Click to filter.`}
                          onToggle={() => {
                            setAreaFilter("all");
                            setSuiteFilters(new Set([owner.id]));
                            lastSuiteIdx.current = null;
                          }}
                        >
                          <span className="qa-tester-dot" style={{ background: owner.accent }} />
                          {owner.shortName}
                          <span className="qa-tester-meta">
                            · {countWithPct(stats.passed, stats.total, " passed")}
                          </span>
                        </FilterChip>
                        <button
                          type="button"
                          className="qa-tester-bubble qa-filter-chip qa-suite-assignee-run"
                          data-active={running ? "true" : "false"}
                          data-testid={`qa-run-assignee-${owner.id}`}
                          disabled={suiteRunning !== null || loading}
                          title={`Run ${owner.name} (new / not-started only)`}
                          onClick={() => void runSuite(owner.id, "new")}
                          style={
                            running
                              ? { borderColor: owner.accent, boxShadow: `0 0 0 1px ${owner.accent}` }
                              : undefined
                          }
                        >
                          <Play size={14} aria-hidden />
                          {running ? <WaitLabel>Running…</WaitLabel> : "Run"}
                        </button>
                      </div>
                    );
                  })}

                  {auditAreaStats.map((row) => {
                    const suiteId = row.area === "Foresight" ? "foresight" : "lighthouse";
                    const running = suiteRunning === suiteId;
                    const accent = row.area === "Foresight" ? "#b45309" : "#0891b2";
                    const active = areaFilter === row.area;
                    return (
                      <div key={row.area} className="qa-test-suites__child">
                        <FilterChip
                          active={active}
                          accent={accent}
                          title={`${row.area} audit cases — ${countWithPct(row.fixed, row.total, " passed")}. Click to filter Area → ${row.area}.`}
                          onToggle={() => {
                            if (active) {
                              setAreaFilter("all");
                              return;
                            }
                            setAreaFilter(row.area);
                            setSuiteFilters(new Set());
                          }}
                        >
                          <span className="qa-tester-dot" style={{ background: accent }} />
                          {row.area}
                          <span
                            className="qa-tester-meta"
                            data-testid={`qa-audit-count-${row.area.toLowerCase()}`}
                          >
                            · {countWithPct(row.fixed, row.total, " passed")}
                          </span>
                        </FilterChip>
                        <button
                          type="button"
                          className="qa-tester-bubble qa-filter-chip qa-suite-assignee-run"
                          data-active={running ? "true" : "false"}
                          data-testid={`qa-run-assignee-${suiteId}`}
                          disabled={suiteRunning !== null || loading}
                          title={`Run ${row.area} portal checks (new / not-started only)`}
                          onClick={() => void runSuite(suiteId, "new")}
                          style={
                            running
                              ? { borderColor: accent, boxShadow: `0 0 0 1px ${accent}` }
                              : undefined
                          }
                        >
                          <Play size={14} aria-hidden />
                          {running ? <WaitLabel>Running…</WaitLabel> : "Run"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="qa-automated-testing__actions">
                  <button
                    type="button"
                    className="btn btn-outline suite-run-btn"
                    disabled={suiteRunning !== null || loading}
                    onClick={() => void runSuite("vitest", "all")}
                    title="Full Vitest regression — re-check all Vitest catalog + wizard rows"
                  >
                    <span className="suite-run-btn__label">
                      Run all Vitest
                      <span className="suite-run-btn__count">regression</span>
                    </span>
                  </button>
                </div>
                {runLog ? <pre className="qa-automated-testing__log">{runLog}</pre> : null}
              </div>
            ) : null}
          </div>

          <div className="qa-categories-panel" data-testid="qa-sprint-panel" style={{ marginTop: 16 }}>
            <div
              className="qa-section-heading qa-categories-panel__header"
              aria-expanded={sprintOpen}
            >
              <ShowHideChevron
                open={sprintOpen}
                onOpenChange={setSprintOpen}
                label="Sprint"
                testId="qa-sprint-chevron"
              />
              <button
                type="button"
                className="qa-categories-panel__heading-btn"
                onClick={() => setSprintOpen((v) => !v)}
                aria-expanded={sprintOpen}
              >
                <span className="qa-categories-panel__title">Sprint</span>
                <span className="qa-categories-panel__active">
                  — {sprintFilterSummary}
                  {sprintFilters.size === 1 && sprintFilters.has(activeSprintIndex)
                    ? " · current"
                    : ""}
                </span>
              </button>
              <ShowHideToggle
                open={sprintOpen}
                onOpenChange={setSprintOpen}
                label="Sprint"
                testId="qa-sprint-toggle"
              />
            </div>
            {sprintOpen && (
              <div className="qa-categories-panel__bubbles">
                <FilterChip
                  active={sprintFilters.size === 0}
                  onToggle={() => {
                    setSprintFilters(new Set());
                    lastSprintIdx.current = null;
                  }}
                  title="Clear sprint filter"
                >
                  All sprints
                  <span className="qa-tester-meta">
                    · Tests{" "}
                    {countWithPct(
                      sprintStats.backlog.done +
                        [...sprintStats.bySprint.values()].reduce((n, s) => n + s.done, 0),
                      sprintStats.backlog.total +
                        [...sprintStats.bySprint.values()].reduce((n, s) => n + s.total, 0),
                    )}
                    {" · Tasks "}
                    {countWithPct(
                      taskSprintStats.backlog.done +
                        [...taskSprintStats.bySprint.values()].reduce((n, s) => n + s.done, 0),
                      taskSprintStats.backlog.total +
                        [...taskSprintStats.bySprint.values()].reduce((n, s) => n + s.total, 0),
                    )}
                  </span>
                </FilterChip>
                <FilterChip
                  active={sprintFilters.has("backlog")}
                  title="Backlog — Shift+click to select a range"
                  onToggle={(e) => toggleSprintFilter("backlog", e)}
                >
                  Backlog
                  <span className="qa-tester-meta">
                    · Tests {countWithPct(sprintStats.backlog.done, sprintStats.backlog.total)}
                    {" · Tasks "}
                    {countWithPct(taskSprintStats.backlog.done, taskSprintStats.backlog.total)}
                  </span>
                </FilterChip>
                {sprints.map((s) => {
                  const stats = sprintStats.bySprint.get(s.index) ?? { done: 0, total: 0 };
                  const taskStats = taskSprintStats.bySprint.get(s.index) ?? {
                    done: 0,
                    total: 0,
                  };
                  const isCurrent = s.index === activeSprintIndex;
                  const locked = isSprintLocked(closedSprints, s.index);
                  const rollover = sprintRolloverByIndex.get(s.index);
                  const rolloverHint = rollover?.chipHint ?? "";
                  return (
                    <FilterChip
                      key={s.index}
                      active={sprintFilters.has(s.index)}
                      locked={locked}
                      testId={`qa-sprint-chip-${s.index}`}
                      title={
                        locked
                          ? `${s.label} · Closed & locked · ${s.rangeLabel} · Tests ${stats.done}/${stats.total} (Pass) · Tasks ${taskStats.done}/${taskStats.total} — full sprint totals`
                          : `${s.rangeLabel}${isCurrent ? " · current sprint" : ""} · Tests ${stats.done}/${stats.total} (Pass) · Tasks ${taskStats.done}/${taskStats.total}${
                              rollover?.banner ? ` · ${rollover.banner}` : ""
                            } — full sprint totals (not suite-filtered) · Shift+click for range`
                      }
                      onToggle={(e) => toggleSprintFilter(s.index, e)}
                      accent={isCurrent ? "#2e7d32" : undefined}
                    >
                      {s.label}
                      {isCurrent ? " · current" : ""}
                      {locked ? <SprintLockedBanner /> : null}
                      <span className="qa-tester-meta">
                        · Tests {countWithPct(stats.done, stats.total)}
                        {" · Tasks "}
                        {countWithPct(taskStats.done, taskStats.total)}
                        {rolloverHint ? (
                          <span
                            data-testid={`sprint-rollover-chip-${s.index}`}
                            style={{ color: "#0e7490", fontWeight: 700 }}
                          >
                            {" "}
                            · {rolloverHint}
                          </span>
                        ) : null}
                      </span>
                    </FilterChip>
                  );
                })}
              </div>
            )}
            {selectedSprintRollover?.banner ? (
              <p
                className="qa-sprint-rollover-banner"
                data-testid="sprint-rollover-banner"
                style={{
                  margin: "10px 0 0",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(14, 116, 144, 0.1)",
                  border: "1px solid rgba(14, 116, 144, 0.35)",
                  color: "#0e7490",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                }}
              >
                {selectedSprintRollover.banner}
                {selectedSprintRollover.fromPrev > 0 ? (
                  <span style={{ fontWeight: 600, opacity: 0.9 }}>
                    {" "}
                    — filter status “Rolled Over” to list them
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>

        <QaProgressBars
          title="All Test Cases"
          embedded
          collapsible
          defaultOpen={false}
          overall={qaProgress.overall}
          suites={qaProgress.suites}
          sprints={qaProgress.sprints}
          resources={qaProgress.resources}
        />

        {error && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(155,47,40,0.1)", border: "1px solid rgba(155,47,40,0.35)", color: "#9B2F28", fontSize: "0.95rem" }}>
            {error}
          </div>
        )}
        {saveFlash && !error && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(46,125,50,0.1)", border: "1px solid rgba(46,125,50,0.35)", color: "#2e7d32", fontSize: "0.95rem" }}>
            {saveFlash}
          </div>
        )}
        {loading && <WaitIndicator message="Loading statuses from database…" />}

        <div className="qa-categories-panel" data-testid="qa-facing-panel">
          <div
            className="qa-section-heading qa-categories-panel__header"
            aria-expanded={facingOpen}
          >
            <ShowHideChevron
              open={facingOpen}
              onOpenChange={setFacingOpen}
              label="External vs Internal"
              testId="qa-facing-chevron"
              size={20}
            />
            <button
              type="button"
              className="qa-categories-panel__heading-btn"
              onClick={() => setFacingOpen((v) => !v)}
              aria-expanded={facingOpen}
            >
              <span className="qa-categories-panel__title">External vs Internal</span>
              {facingFilters.size > 0 ? (
                <span className="qa-categories-panel__active">
                  — {[...facingFilters].map((f) => TEST_FACING_LABELS[f]).join(", ")}
                </span>
              ) : (
                <span className="qa-categories-panel__hint">
                  — top-level · External = live site · Internal = admin / QA
                </span>
              )}
            </button>
            <ShowHideToggle
              open={facingOpen}
              onOpenChange={setFacingOpen}
              label="External vs Internal"
              testId="qa-facing-toggle"
            />
          </div>
          {facingOpen && (
            <div className="qa-categories-panel__bubbles">
              <FilterChip
                active={facingFilters.size === 0}
                onToggle={() => {
                  setFacingFilters(new Set());
                  lastFacingIdx.current = null;
                }}
                title="Show External and Internal"
              >
                All
                <span className="qa-tester-meta">
                  ·{" "}
                  {countWithPct(
                    facingStats.external.done + facingStats.internal.done,
                    facingStats.external.total + facingStats.internal.total,
                  )}
                </span>
              </FilterChip>
              {TEST_FACINGS.map((facing) => {
                const stats = facingStats[facing];
                return (
                  <FilterChip
                    key={facing}
                    active={facingFilters.has(facing)}
                    onToggle={(e) => toggleFacingFilter(facing, e)}
                    title={
                      facing === "external"
                        ? "User-facing pages, guides, wizards, join, contact"
                        : "Admin Studio, Testing Portal, Schedule, suite runners"
                    }
                    accent={facing === "external" ? "#2e7d32" : "#6B5344"}
                  >
                    {TEST_FACING_LABELS[facing]}
                    <span className="qa-tester-meta">
                      · {countWithPct(stats.done, stats.total)}
                    </span>
                  </FilterChip>
                );
              })}
            </div>
          )}
        </div>

        <div className="qa-categories-panel" data-testid="qa-categories-panel">
          <div
            className="qa-section-heading qa-categories-panel__header"
            aria-expanded={categoriesOpen}
          >
            <ShowHideChevron
              open={categoriesOpen}
              onOpenChange={setCategoriesOpen}
              label="Categories"
              testId="qa-categories-chevron"
              size={20}
            />
            <button
              type="button"
              className="qa-categories-panel__heading-btn"
              onClick={() => setCategoriesOpen((v) => !v)}
              aria-expanded={categoriesOpen}
            >
              <span className="qa-categories-panel__title">Categories</span>
              <span className="qa-categories-panel__active">— {categoryFilterSummary}</span>
            </button>
            <ShowHideToggle
              open={categoriesOpen}
              onOpenChange={setCategoriesOpen}
              label="Categories"
              testId="qa-categories-toggle"
            />
          </div>
          {categoriesOpen && (
            <div className="qa-categories-panel__bubbles">
              <FilterChip
                active={categoryFilters.size === 0}
                onToggle={() => {
                  setCategoryFilters(new Set());
                  lastCategoryIdx.current = null;
                }}
                title="Clear category filter"
              >
                All categories
                <span className="qa-tester-meta">
                  ·{" "}
                  {countWithPct(
                    Object.values(categoryStats).reduce((n, s) => n + (s?.done ?? 0), 0),
                    Object.values(categoryStats).reduce((n, s) => n + (s?.total ?? 0), 0),
                  )}
                </span>
              </FilterChip>
              {TEST_CATEGORIES.map((cat) => {
                const active = categoryFilters.has(cat);
                const stats = categoryStats[cat];
                if (!stats || stats.total === 0) return null;
                return (
                  <FilterChip
                    key={cat}
                    active={active}
                    onToggle={(e) => toggleCategoryFilter(cat, e)}
                    title={`${TEST_CATEGORY_LABELS[cat]} — Shift+click to select a range`}
                  >
                    {TEST_CATEGORY_LABELS[cat]}
                    <span className="qa-tester-meta">
                      · {countWithPct(stats.done, stats.total)}
                    </span>
                  </FilterChip>
                );
              })}
              <p className="qa-categories-panel__note">
                ProofRead = page/guide copy checks · Website = About / Community / family framing · Facebook =
                social Page links · Contact = form delivery · Workshops stays its own category. Wizard FMSH
                inventory rows (~972) are excluded from all portal totals. Vitest shows real it() counts (
                {countWithPct(vitestReal.passed, vitestReal.total)}).
              </p>
            </div>
          )}
        </div>

      </div>

      {someSelected && (
        <div
          className="glass"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid var(--bronze)",
            background: "rgba(215,198,151,0.25)",
          }}
        >
          <div
            className="schedule-board-filters__label"
            style={{
              marginBottom: 12,
              display: "flex",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: "4px 8px",
            }}
          >
            Bulk Edit
            <span className="schedule-board-filters__label-hint">
              {selectedIds.size} selected
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
            }}
          >
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>Status:</span>
          {STATUSES.filter((s) => s !== "blocked" || canBlock).map((s) => (
            <button
              key={s}
              type="button"
              className="btn btn-outline"
              disabled={bulkBusy || !canChangeStatus}
              style={{
                padding: "6px 12px",
                fontSize: "0.9375rem",
                borderColor: STATUS_COLOR[s],
                color: STATUS_COLOR[s],
              }}
              title={`Set ${selectedIds.size} selected to ${STATUS_LABELS[s]} (${counts[s] ?? 0} currently)`}
              onClick={() => void bulkSetStatus(s)}
            >
              {STATUS_LABELS[s]}
              <span style={{ fontWeight: 800, marginLeft: 6 }}>({counts[s] ?? 0})</span>
            </button>
          ))}
          <span
            style={{
              width: 1,
              alignSelf: "stretch",
              background: "rgba(148, 125, 100, 0.45)",
              margin: "0 2px",
            }}
            aria-hidden
          />
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>Assign:</span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={bulkBusy}
            style={{ padding: "6px 12px", fontSize: "0.9375rem", background: "#2e7d32", borderColor: "#2e7d32" }}
            onClick={() => void bulkAssign("lyriq")}
          >
            Lyriq
            <span style={{ fontWeight: 800, marginLeft: 6 }}>
              (
              {(() => {
                const s = testerStats.testers.find((t) => t.id === "lyriq");
                return `${s?.passed ?? 0}/${s?.total ?? 0}`;
              })()}
              )
            </span>
          </button>
          {QA_TESTERS.filter((t) => t.id !== "lyriq").map((tester) => {
            const stats = testerStats.testers.find((t) => t.id === tester.id);
            const passed = stats?.passed ?? 0;
            const assigned = stats?.total ?? 0;
            return (
              <button
                key={tester.id}
                type="button"
                className="btn btn-outline"
                disabled={bulkBusy}
                style={{ padding: "6px 12px", fontSize: "0.9375rem" }}
                onClick={() => void bulkAssign(tester.id)}
              >
                {tester.shortName}
                <span style={{ fontWeight: 800, marginLeft: 6 }}>
                  ({passed}/{assigned})
                </span>
              </button>
            );
          })}
          <span
            style={{
              width: 1,
              alignSelf: "stretch",
              background: "rgba(148, 125, 100, 0.45)",
              margin: "0 2px",
            }}
            aria-hidden
          />
          <label
            className="form-label"
            style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}
            htmlFor="qa-bulk-sprint"
          >
            Sprint
          </label>
          <select
            id="qa-bulk-sprint"
            className="select-input"
            style={{ width: 150 }}
            defaultValue=""
            disabled={bulkBusy}
            aria-label={`Assign sprint to ${selectedIds.size} selected tests`}
            onChange={(e) => {
              const v = e.target.value;
              if (v !== "") void bulkSetSprint(Number(v));
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              Change…
            </option>
            <option value={BACKLOG_SPRINT}>Backlog</option>
            {sprints.map((s) => (
              <option key={s.index} value={s.index} disabled={isSprintLocked(closedSprints, s.index)}>
                {s.label}
                {isSprintLocked(closedSprints, s.index) ? " · Locked" : ""}
              </option>
            ))}
          </select>
          {isAdmin && (
            <>
              <label
                className="form-label"
                style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}
                htmlFor="qa-bulk-assigned-by"
              >
                Assigned By
              </label>
              <select
                id="qa-bulk-assigned-by"
                className="select-input"
                style={{ width: 150 }}
                defaultValue=""
                disabled={bulkBusy}
                aria-label={`Assigned By for ${selectedIds.size} selected tests`}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) void bulkSetAssignedBy(v);
                  e.target.value = "";
                }}
              >
                <option value="" disabled>
                  Change…
                </option>
                {assignByOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </>
          )}
          <label
            className="form-label"
            style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700 }}
            htmlFor="qa-bulk-due"
          >
            Due
          </label>
          <input
            id="qa-bulk-due"
            className="text-input"
            type="date"
            style={{ width: 150 }}
            value={bulkDueDate}
            disabled={bulkBusy}
            onChange={(e) => setBulkDueDate(e.target.value)}
            aria-label="Bulk due date"
          />
          <button
            type="button"
            className="btn btn-outline"
            disabled={bulkBusy || !bulkDueDate}
            onClick={() => void bulkSetDueDate(bulkDueDate)}
          >
            Apply due
          </button>
          <label
            className="form-label"
            style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700 }}
            htmlFor="qa-bulk-desc"
          >
            Description
          </label>
          <input
            id="qa-bulk-desc"
            className="text-input"
            style={{ width: 220 }}
            value={bulkDescription}
            disabled={bulkBusy}
            placeholder="Note / description…"
            onChange={(e) => setBulkDescription(e.target.value)}
            aria-label="Bulk description for selected tests"
          />
          <button
            type="button"
            className="btn btn-outline"
            disabled={bulkBusy || !bulkDescription.trim()}
            onClick={() => void bulkSetDescription(bulkDescription)}
          >
            Apply description
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setSelectedIds(new Set())}>
            Clear selection
          </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.95rem", color: "var(--charcoal)" }}>
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={toggleSelectAllFiltered}
            disabled={filteredIds.length === 0}
            aria-label="Select all visible tests"
          />
          Select all{filteredIds.length ? ` (${filteredIds.length})` : ""}
        </label>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: "6px 12px", fontSize: "0.9375rem" }}
          disabled={filteredIds.length === 0}
          onClick={() => {
            setPreferExpanded(true);
            setOpenIds(new Set(filteredIds));
          }}
        >
          Expand all
        </button>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: "6px 12px", fontSize: "0.9375rem" }}
          onClick={() => {
            setPreferExpanded(false);
            setOpenIds(new Set());
          }}
        >
          Collapse all
        </button>
        <button
          type="button"
          className="btn btn-primary qa-save-btn--ready"
          style={{ padding: "6px 14px", fontSize: "0.9375rem" }}
          disabled={savingAll || dirtySaveCount === 0}
          onClick={() => void saveEverything()}
          title="Save all unsaved notes and step checklists"
        >
          {savingAll
            ? <WaitLabel>Saving…</WaitLabel>
            : dirtySaveCount > 0
              ? `Save everything (${dirtySaveCount})`
              : "Save everything"}
        </button>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-primary)" }} />
          <input
            className="text-input"
            style={{ paddingLeft: 34, height: 40 }}
            placeholder="Search tests…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="select-input" style={{ width: 320, minWidth: 240, height: 40 }} value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
          {areas.map((a) => {
            if (a === "all") {
              return (
                <option key={a} value={a}>
                  All areas ({COUNTABLE_CASES.length})
                </option>
              );
            }
            const audit = auditAreaStats.find((r) => r.area === a);
            const total = areaCounts.get(a) ?? 0;
            const label = audit
              ? `${a} (${countWithPct(audit.fixed, audit.total, " passed")})`
              : `${a} (${total})`;
            return (
              <option key={a} value={a}>
                {label}
              </option>
            );
          })}
        </select>
      </div>

      {(facingFilters.size > 0 ||
        testerFilters.size > 0 ||
        suiteFilters.size > 0 ||
        sprintFilters.size > 0 ||
        statusFilters.size > 0 ||
        categoryFilters.size > 0) && (
        <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary)" }}>
          Showing {filtered.length} case{filtered.length === 1 ? "" : "s"}
          {facingFilters.size > 0 && (
            <>
              {" "}· facing:{" "}
              <strong style={{ color: "var(--charcoal)" }}>
                {[...facingFilters].map((f) => TEST_FACING_LABELS[f]).join(", ")}
              </strong>
            </>
          )}
          {testerFilters.size > 0 && (
            <>
              {" "}· testers:{" "}
              <strong style={{ color: "var(--charcoal)" }}>
                {[...testerFilters]
                  .map((id) =>
                    id === "unassigned"
                      ? "Unassigned"
                      : (QA_TESTERS.find((t) => t.id === id)?.shortName ?? id),
                  )
                  .join(", ")}
              </strong>
            </>
          )}
          {suiteFilters.size > 0 && (
            <>
              {" "}· suites:{" "}
              <strong style={{ color: "var(--charcoal)" }}>
                {[...suiteFilters].map((s) => SUITE_LABELS[s]).join(", ")}
              </strong>
            </>
          )}
          {sprintFilters.size > 0 && (
            <>
              {" "}· sprints:{" "}
              <strong style={{ color: "var(--charcoal)" }}>
                {[...sprintFilters]
                  .map((k) => (k === "backlog" ? "Backlog" : sprintLabel(k)))
                  .join(", ")}
              </strong>
            </>
          )}
          {statusFilters.size > 0 && (
            <>
              {" "}· status:{" "}
              <strong style={{ color: "var(--charcoal)" }}>
                {[...statusFilters].map((s) => STATUS_LABELS[s]).join(", ")}
              </strong>
            </>
          )}
          {categoryFilters.size > 0 && (
            <>
              {" "}· categories:{" "}
              <strong style={{ color: "var(--charcoal)" }}>
                {[...categoryFilters].map((c) => TEST_CATEGORY_LABELS[c]).join(", ")}
              </strong>
            </>
          )}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((t) => {
          const st = statuses[t.id] ?? DEFAULT_TEST_STATUS;
          const facing = facingForCase(t);
          const open = openIds.has(t.id);
          const automated = isAutomatedTestId(t.id);
          const checked = selectedIds.has(t.id);
          return (
            <div
              key={t.id}
              id={`test-row-${t.id}`}
              className={`glass test-case-card test-case-card--${st}`}
              style={{
                borderRadius: "12px",
                borderLeft: `5px solid ${STATUS_COLOR[st]}`,
                overflow: "hidden",
                outline:
                  highlightId === t.id
                    ? "2px solid #9B2F28"
                    : checked
                      ? "2px solid var(--bronze)"
                      : undefined,
                boxShadow:
                  highlightId === t.id ? "0 0 0 3px rgba(155,47,40,0.2)" : undefined,
              }}
            >
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 10px",
                    borderRight: "1px solid var(--border-color)",
                    cursor: automated ? "not-allowed" : "pointer",
                  }}
                  title={automated ? "Automated tests keep locked owners" : "Select for bulk assign / status"}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={automated}
                    onChange={() => toggleSelect(t.id)}
                    aria-label={`Select ${t.id}`}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPreferExpanded(false);
                    setOpenIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(t.id)) next.delete(t.id);
                      else next.add(t.id);
                      return next;
                    });
                  }}
                  className="test-case-row"
                  style={{ flex: 1 }}
                >
                  {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="flat-label flat-label--id">{t.id}</span>
                  <span
                    className={`flat-label flat-label--facing flat-label--facing-${facing}`}
                    title={
                      facing === "external"
                        ? "External — user-facing site"
                        : "Internal — admin / QA tooling"
                    }
                  >
                    {TEST_FACING_LABELS[facing]}
                  </span>
                  <span className="flat-label flat-label--priority">{PRIORITY_LABELS[t.priority]}</span>
                  <span className="flat-label flat-label--suite">{SUITE_LABELS[t.suite ?? "manual"]}</span>
                  <strong className="test-case-title">{t.title}</strong>
                  <span className="flat-label flat-label--assignee">{testerLabel(effectiveAssignees(t))}</span>
                  <span className="flat-label flat-label--id">
                    {effectiveSprint(t) === BACKLOG_SPRINT ? "Backlog" : sprintLabel(effectiveSprint(t))}
                  </span>
                  <span className="flat-label flat-label--area">{t.area}</span>
                  {testIsRolledOver(st, notes[t.id]) && (
                    <span
                      className="flat-label"
                      data-testid={`test-rolled-over-badge-${t.id}`}
                      style={{
                        background: "rgba(14, 116, 144, 0.14)",
                        color: STATUS_COLOR.rolled_over,
                        border: `1px solid ${STATUS_COLOR.rolled_over}`,
                        fontWeight: 700,
                      }}
                      title="Carried forward from a prior sprint"
                    >
                      Rolled Over
                    </span>
                  )}
                  {noteEntriesPlainText(notes[t.id]) && (
                    <span className="flat-label flat-label--id" title={noteEntriesPlainText(notes[t.id])}>
                      Notes
                    </span>
                  )}
                </button>
              </div>
              <div
                style={{
                  padding: "6px 14px 0",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  opacity: 0.9,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px 14px",
                }}
                data-testid={`test-assigned-meta-${t.id}`}
              >
                <span data-testid={`test-rolled-over-field-${t.id}`}>
                  Rolled Over{" "}
                  <span
                    style={{
                      color: testIsRolledOver(st, notes[t.id])
                        ? STATUS_COLOR.rolled_over
                        : "var(--charcoal)",
                      fontWeight: 700,
                    }}
                  >
                    {testIsRolledOver(st, notes[t.id]) ? "Yes" : "No"}
                  </span>
                </span>
                <span>
                  Assigned By{" "}
                  <span style={{ color: "var(--charcoal)" }}>
                    {assignedByByCase[t.id]?.trim() || SYSTEM_ASSIGNED_BY}
                  </span>
                </span>
                {st === "fail" && (
                  <span data-testid={`test-dev-assignee-label-${t.id}`}>
                    Assignee{" "}
                    <span style={{ color: STATUS_COLOR.fail }}>
                      {testOwnerLabel(
                        (isHumanQaTester(persistedAssignee(t.id))
                          ? persistedAssignee(t.id)
                          : FAILED_TEST_ASSIGNEE) as string,
                      )}
                    </span>
                  </span>
                )}
                <span>
                  Assigned Date{" "}
                  <span style={{ color: "var(--charcoal)" }}>
                    {dateAssignedByCase[t.id]?.trim() || "—"}
                  </span>
                </span>
              </div>
              {formatAuditTrail(updatedAtByCase[t.id], updatedByByCase[t.id]) && (
                <div
                  style={{
                    padding: "6px 14px 0",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    opacity: 0.85,
                  }}
                  data-testid={`test-audit-${t.id}`}
                >
                  {formatAuditTrail(updatedAtByCase[t.id], updatedByByCase[t.id])}
                </div>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px minmax(0, 1fr)",
                  gap: 10,
                  alignItems: "center",
                  padding: "10px 14px",
                  borderTop: "1px solid var(--border-color)",
                  fontSize: "0.9375rem",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                Status
                <select
                  className="text-input"
                  aria-label={`Status for ${t.id}`}
                  value={st}
                  disabled={isSaving(t.id) || !canChangeStatus}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => void setStatus(t.id, e.target.value as TestStatus)}
                  style={{
                    width: "100%",
                    minWidth: 0,
                    padding: "8px 12px",
                    fontSize: "1rem",
                    color: STATUS_COLOR[st],
                    fontWeight: 600,
                  }}
                >
                  {STATUSES.filter((s) => {
                    // Catalog Vitest/Playwright cases are suite-owned — never "In Progress".
                    if (automated && s === "in_progress") return st === "in_progress";
                    if (s === "blocked") return canBlock || st === "blocked";
                    if (isDevFixStatus(s)) return canDevFix || st === s;
                    return true;
                  }).map((s) => (
                    <option
                      key={s}
                      value={s}
                      disabled={
                        (s === "blocked" && !canBlock) || (isDevFixStatus(s) && !canDevFix)
                      }
                    >
                      {STATUS_LABELS[s]}
                      {s === "blocked" && !canBlock ? " (Evelyn only)" : ""}
                      {isDevFixStatus(s) && !canDevFix ? " (Lead Dev only)" : ""}
                    </option>
                  ))}
                </select>
                {rowErrors[t.id] && (
                  <p
                    style={{
                      gridColumn: "1 / -1",
                      margin: 0,
                      fontSize: "0.9rem",
                      color: "#9B2F28",
                      fontWeight: 600,
                    }}
                  >
                    {rowErrors[t.id]}
                  </p>
                )}
                {st === "fail" && (
                  <>
                    <span style={{ whiteSpace: "nowrap" }}>Assign to</span>
                    <select
                      className="text-input"
                      aria-label={`Assignee for ${t.id}`}
                      data-testid={`test-dev-assignee-${t.id}`}
                      value={
                        isHumanQaTester(persistedAssignee(t.id))
                          ? persistedAssignee(t.id)
                          : FAILED_TEST_ASSIGNEE
                      }
                      disabled={isSaving(t.id) || !canChangeStatus}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onChange={(e) => void reassign(t.id, e.target.value)}
                      style={{
                        width: "100%",
                        minWidth: 0,
                        padding: "8px 12px",
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: STATUS_COLOR.fail,
                      }}
                    >
                      {QA_TESTERS.map((tester) => (
                        <option key={tester.id} value={tester.id}>
                          {tester.shortName}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <span style={{ gridColumn: "1 / -1" }}>
                  <WorkTimer
                    source="test"
                    sourceId={t.id}
                    sourceLabel={t.title}
                    entry={timers.entryFor("test", t.id)}
                    onChanged={timers.onChanged}
                    compact
                    disabled={isTestStatusResolved(st)}
                  />
                </span>
              </div>
              {open && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border-color)" }}>
                  <p style={{ marginTop: 12, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                    Roles: {t.roles.join(", ")} · Assignees: {testerLabel(effectiveAssignees(t))}
                    {automated && " · Automated (owner locked)"}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 12,
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    {!automated && (
                      <label
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flex: "1 1 220px",
                          minWidth: 200,
                          fontSize: "0.9375rem",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                        }}
                      >
                        <span style={{ whiteSpace: "nowrap" }}>Assign to</span>
                        <select
                          className="text-input"
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: "8px 12px",
                            fontSize: "1rem",
                            color: st === "fail" ? STATUS_COLOR.fail : undefined,
                            fontWeight: st === "fail" ? 600 : undefined,
                          }}
                          aria-label={`Assignee for ${t.id}`}
                          data-testid={
                            st === "fail"
                              ? `test-dev-assignee-expanded-${t.id}`
                              : `test-assignee-expanded-${t.id}`
                          }
                          value={
                            st === "fail"
                              ? isHumanQaTester(persistedAssignee(t.id))
                                ? persistedAssignee(t.id)
                                : FAILED_TEST_ASSIGNEE
                              : (assigneeOverrides[t.id] ?? "")
                          }
                          disabled={isSaving(t.id) || !canChangeStatus}
                          onChange={(e) => void reassign(t.id, e.target.value)}
                        >
                          {st !== "fail" ? (
                            <option value="">Default ({testerLabel(t.assignees)})</option>
                          ) : null}
                          {QA_TESTERS.map((tester) => (
                            <option key={tester.id} value={tester.id}>
                              {tester.shortName}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "4px 16px",
                        flex: "1 1 220px",
                        minWidth: 200,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        alignItems: "center",
                      }}
                    >
                      {isAdmin ? (
                        <label
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flex: "1 1 220px",
                            minWidth: 200,
                            fontSize: "0.9375rem",
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          <span style={{ whiteSpace: "nowrap" }}>Assigned By</span>
                          <select
                            className="text-input"
                            style={{ flex: 1, minWidth: 0, padding: "8px 12px", fontSize: "1rem" }}
                            value={assignedByByCase[t.id]?.trim() || SYSTEM_ASSIGNED_BY}
                            disabled={isSaving(t.id)}
                            aria-label={`Assigned by for ${t.id}`}
                            onChange={(e) => void setAssignedBy(t.id, e.target.value)}
                          >
                            {assignByOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <span>
                          Assigned By:{" "}
                          <span style={{ color: "var(--charcoal)" }}>
                            {assignedByByCase[t.id]?.trim() || SYSTEM_ASSIGNED_BY}
                          </span>
                        </span>
                      )}
                      <span>
                        Assigned Date:{" "}
                        <span style={{ color: "var(--charcoal)" }}>
                          {dateAssignedByCase[t.id]?.trim() || "—"}
                        </span>
                      </span>
                    </div>
                    <label
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flex: "1 1 220px",
                        minWidth: 200,
                        fontSize: "0.9375rem",
                        color: "var(--text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ whiteSpace: "nowrap" }}>Sprint</span>
                      <select
                        className="text-input"
                        style={{ flex: 1, minWidth: 0, padding: "8px 12px", fontSize: "1rem" }}
                        value={effectiveSprint(t)}
                        onChange={(e) => void setSprint(t.id, Number(e.target.value))}
                      >
                        <option value={BACKLOG_SPRINT}>Backlog</option>
                        {sprints.map((s) => (
                          <option key={s.index} value={s.index}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flex: "1 1 200px",
                        minWidth: 180,
                        fontSize: "0.9375rem",
                        color: "var(--text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ whiteSpace: "nowrap" }}>Due</span>
                      <input
                        className="text-input"
                        type="date"
                        style={{ flex: 1, minWidth: 0, padding: "8px 12px", fontSize: "1rem" }}
                        value={mmddyyToIso(persistedDueDate(t.id, effectiveSprint(t)))}
                        key={`${t.id}-due-${persistedDueDate(t.id, effectiveSprint(t))}`}
                        onChange={(e) => void setDueDate(t.id, e.target.value)}
                        aria-label={`Due date for ${t.id}`}
                      />
                    </label>
                  </div>
                  <div style={{ margin: "12px 0", display: "grid", gap: 8 }}>
                    <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      Steps checklist{" "}
                      <span style={{ fontWeight: 500, color: "var(--charcoal)" }}>
                        ({checkedFor(t.id).filter(Boolean).length}/{t.steps.length} — Pass checks the rest)
                      </span>
                    </p>
                    {t.steps.map((s, i) => {
                      const checked = checkedFor(t.id)[i] ?? false;
                      const failedHere = failedStepByCase[t.id] === i;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: failedHere
                              ? "1px solid rgba(155,47,40,0.55)"
                              : "1px solid rgba(148,125,100,0.28)",
                            background: failedHere ? "rgba(155,47,40,0.06)" : "rgba(255,255,255,0.55)",
                          }}
                        >
                          <label style={{ display: "flex", gap: 8, flex: 1, cursor: "pointer", fontSize: "0.98rem", lineHeight: 1.45 }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleStep(t.id, i)}
                              style={{ marginTop: 3 }}
                            />
                            <span>
                              <strong style={{ marginRight: 6 }}>{i + 1}.</strong>
                              <MarkdownLinkText text={s} />
                            </span>
                          </label>
                          <label
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: "0.85rem",
                              whiteSpace: "nowrap",
                              color: failedHere ? "#9B2F28" : "var(--charcoal)",
                              fontWeight: 600,
                            }}
                          >
                            <input
                              type="radio"
                              name={`fail-step-${t.id}`}
                              checked={failedHere}
                              onChange={() =>
                                setFailedStepByCase((prev) => ({ ...prev, [t.id]: i }))
                              }
                            />
                            Failed here
                          </label>
                        </div>
                      );
                    })}
                    {t.steps.length === 0 && (
                      <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--charcoal)" }}>
                        No steps listed for this case.
                      </p>
                    )}
                  </div>
                  <p style={{ fontSize: "1rem", color: "var(--charcoal)" }}>
                    <strong>Expected:</strong> {t.expected}
                  </p>
                  <div style={{ marginTop: 12 }}>
                    <NotesThread
                      rawNotes={notes[t.id] ?? ""}
                      actor={actingAssignBy}
                      priorAttribution={priorNoteAttribution(t.id)}
                      editDrafts={editNoteDrafts[t.id]}
                      newDraft={newNoteDrafts[t.id] ?? ""}
                      onEditDraft={(noteId, text) => setEditNoteDraft(t.id, noteId, text)}
                      onNewDraft={(text) => setNewNoteDraft(t.id, text)}
                      onDeleteNote={(noteId) => setEditNoteDraft(t.id, noteId, "")}
                      disabled={savingIds.has(t.id) || isSprintLocked(closedSprints, effectiveSprint(t))}
                      textareaId={`test-note-${t.id}`}
                      invalid={
                        Boolean(rowErrors[t.id]) ||
                        (statusRequiresNote(st) && !noteMeetsRequirement(composedNote(t.id)))
                      }
                      label={
                        notesHaveUnsavedDraft(
                          notes[t.id],
                          actingAssignBy,
                          editNoteDrafts[t.id],
                          newNoteDrafts[t.id],
                        )
                          ? "Notes (unsaved)"
                          : "Notes"
                      }
                      requiredHint={
                        statusRequiresNote(st) || st === "fail"
                          ? "(required for Fail / Blocked — explain the failure or blocker)"
                          : undefined
                      }
                      newPlaceholder={
                        st === "fail"
                          ? "Required: which step failed, what you saw, and expected vs actual."
                          : statusRequiresNote(st)
                            ? "Required: describe what failed or what is blocking."
                            : "Add your note… (only you can edit or delete it later)"
                      }
                    />
                  </div>

                  <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                    <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                      Evidence <span style={{ fontWeight: 500 }}>(image, PDF, Word, or Excel — safety scanned)</span>
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <label className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.9375rem", cursor: "pointer" }}>
                        <Paperclip size={14} style={{ marginRight: 6 }} /> Attach file
                        <input
                          type="file"
                          accept={TEST_EVIDENCE_ACCEPT}
                          hidden
                          disabled={attachBusyId === t.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) void attachEvidenceFile(t.id, file);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "6px 12px", fontSize: "0.9375rem" }}
                        disabled={attachBusyId === t.id}
                        title="Opens the browser screen picker — choose this tab or a window, then Share"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void captureScreenshot(t.id);
                        }}
                      >
                        <Camera size={14} style={{ marginRight: 6 }} /> Screenshot
                      </button>
                      {attachBusyId === t.id && (
                        <span style={{ fontSize: "0.9rem", color: "var(--charcoal)" }}>
                          Choose a tab/window in the picker, then wait for upload…
                        </span>
                      )}
                    </div>
                    {(attachmentsByCase[t.id] ?? []).length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 8 }}>
                        {(attachmentsByCase[t.id] ?? []).map((a) => {
                          const isImage =
                            a.mimeType.startsWith("image/") ||
                            /\.(png|jpe?g|gif|webp|bmp)$/i.test(a.name);
                          const opening = openingAttachmentId === a.id;
                          return (
                            <li
                              key={a.id}
                              style={{
                                fontSize: "0.92rem",
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 10px",
                                borderRadius: 10,
                                border: "1px solid var(--border-color)",
                                background: "rgba(255,252,247,0.85)",
                              }}
                            >
                              <button
                                type="button"
                                className="btn btn-outline"
                                style={{ padding: "4px 10px", fontSize: "0.875rem" }}
                                disabled={opening || openingAttachmentId != null}
                                onClick={() => void openEvidence(t.id, a)}
                                title={isImage ? "Open image in a new tab" : "Download file"}
                              >
                                <ExternalLink size={12} style={{ marginRight: 4 }} />
                                {opening ? "Opening…" : isImage ? "View" : "Open"}
                              </button>
                              <button
                                type="button"
                                onClick={() => void openEvidence(t.id, a)}
                                disabled={opening || openingAttachmentId != null}
                                title={isImage ? "Open image" : "Download file"}
                                style={{
                                  fontWeight: 700,
                                  color: "var(--accent-crimson, #9b2f28)",
                                  textDecoration: "underline",
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  cursor: opening ? "wait" : "pointer",
                                  textAlign: "left",
                                }}
                              >
                                {a.name}
                              </button>
                              <span style={{ color: "var(--text-primary)" }}>
                                ({Math.max(1, Math.round(a.size / 1024))} KB · {a.scanStatus})
                              </span>
                              <button
                                type="button"
                                className="btn btn-outline"
                                style={{ padding: "2px 8px", fontSize: "0.8rem", marginLeft: "auto" }}
                                onClick={() => void removeEvidence(t.id, a.id)}
                                title="Remove attachment"
                              >
                                <Trash2 size={12} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
                    {STATUSES.filter((s) => {
                      if (s === "blocked") return canBlock || st === "blocked";
                      if (isDevFixStatus(s)) return canDevFix || st === s;
                      return true;
                    }).map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`btn ${st === s ? "btn-primary" : "btn-outline"}`}
                        style={{ padding: "6px 12px", fontSize: "0.9375rem" }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => void setStatus(t.id, s)}
                        disabled={
                          isSaving(t.id) ||
                          !canChangeStatus ||
                          (s === "blocked" && !canBlock) ||
                          (isDevFixStatus(s) && !canDevFix)
                        }
                        title={
                          s === "pass"
                            ? "Mark Pass (checks any remaining steps)"
                            : s === "conditional_approval"
                              ? "Write a note describing the conditions"
                              : s === "fail"
                                ? "Select failed step + write a note"
                                : s === "rolled_over"
                                  ? "Carried from a prior sprint — re-test in the current sprint"
                                  : s === "blocked"
                                    ? canBlock
                                      ? "Write a short note describing the blocker"
                                      : "Only Evelyn may set Blocked"
                                    : s === "fixed_retest"
                                      ? canDevFix
                                        ? "Bug fixed — note required; assigns back to tester"
                                        : "Only Lead Developer may set Fixed/Re-Test"
                                      : s === "failed_retest"
                                        ? canDevFix
                                          ? "Not a real failure — note required; assigns back to tester"
                                          : "Only Lead Developer may set Failed/Re-Test"
                                        : s === "fixed_cursor"
                                          ? canDevFix
                                            ? "Cursor fixed — note required; assigns back to tester"
                                            : "Only Lead Developer may set Fixed/Cursor"
                                          : s === "fixed_lighthouse"
                                            ? canDevFix
                                              ? "Lighthouse fix — note required; assigns back to tester"
                                              : "Only Lead Developer may set Fixed/Lighthouse"
                                            : s === "fixed_foresight"
                                              ? canDevFix
                                                ? "Foresight fix — note required; assigns back to tester"
                                                : "Only Lead Developer may set Fixed/Foresight"
                                              : undefined
                        }
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-primary qa-save-btn--ready"
                      style={{ padding: "6px 14px", fontSize: "0.9375rem" }}
                      disabled={isSaving(t.id) || !isCaseDirty(t.id)}
                      onClick={() => void saveOneCase(t.id)}
                      title="Save notes and step checklist for this test"
                    >
                      {isSaving(t.id) ? <WaitLabel>Saving…</WaitLabel> : "Save"}
                    </button>
                  </div>
                  {rowErrors[t.id] && (
                    <p style={{ marginTop: 10, fontSize: "0.95rem", color: "#9B2F28" }}>{rowErrors[t.id]}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="glass" style={{ padding: 24, textAlign: "center", color: "var(--text-primary)" }}>
            No tests match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
