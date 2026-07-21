import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import {
  Camera,
  FlaskConical,
  Paperclip,
  RotateCcw,
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
  resetTestStatuses,
  runAutomatedSuite,
  withDefaultSuite,
  statusRequiresNote,
  noteMeetsRequirement,
  allStepsChecked,
  NOTE_MIN_LENGTH,
  TEST_EVIDENCE_ACCEPT,
  uploadTestEvidence,
  deleteTestEvidence,
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
  QA_TESTERS,
  isHumanQaTester,
  testOwnerLabel,
  type QaTesterId,
  type TestOwnerId,
} from "../../lib/gysh-roles";
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
  isSprintLocked,
  sprintLockedMessage,
} from "../../lib/gysh-closed-sprints";
import { healIncompleteTestDueDates } from "../../lib/gysh-sprint-board";
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
  canSetTestBlocked,
  todayMMDDYY as assignmentToday,
  userCanChangeTestStatus,
  userHasAdminRole,
} from "../../lib/gysh-assignment";
import { isoToMmddyy, mmddyyToIso } from "../../lib/gysh-tasks";
import { ApiError } from "../../lib/api";
import type { AuthUser } from "../../lib/auth";
import { suggestedSprintForTest } from "../../lib/gysh-sprint-board";
import { ensureWorkTimerStarted, stopTimerOnStatusChange } from "../../lib/gysh-time-entries";
import { useActiveTimers } from "../../lib/use-active-timers";
import { SprintStatusBars } from "./SprintStatusBars";
import { QaProgressBars, emptyTally, tallyStatuses, type StatusTally } from "./QaProgressBars";
import { WorkTimer } from "./WorkTimer";
import { NotesThread } from "./NotesThread";

const STATUSES: TestStatus[] = ["not_run", "in_progress", "pass", "fail", "blocked"];

function pctComplete(done: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((done / total) * 100)}%`;
}

function countWithPct(done: number, total: number, suffix = ""): string {
  const base = `${done}/${total}${suffix}`;
  return `${base} · ${pctComplete(done, total)}`;
}

type SprintFilterKey = number | "backlog";

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
}: {
  active: boolean;
  onToggle: (e: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  title?: string;
  accent?: string;
}) {
  return (
    <button
      type="button"
      className="qa-tester-bubble qa-filter-chip"
      data-active={active ? "true" : "false"}
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

/** List order: in progress → not started → done (fail/blocked before pass). */
const STATUS_LIST_ORDER: Record<TestStatus, number> = {
  in_progress: 0,
  not_run: 1,
  fail: 2,
  blocked: 3,
  pass: 4,
};

const STATUS_COLOR: Record<TestStatus, string> = {
  not_run: "#9ca3af",
  in_progress: "#ca8a04",
  pass: "#16a34a",
  fail: "#dc2626",
  blocked: "#ea580c",
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
}: {
  focusTestId?: string | null;
  onFocusConsumed?: () => void;
  authUser?: AuthUser | null;
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
  const [dueDatesByCase, setDueDatesByCase] = useState<Record<string, string>>({});
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [bulkDescription, setBulkDescription] = useState("");
  const [checkedStepsByCase, setCheckedStepsByCase] = useState<Record<string, boolean[]>>({});
  const [failedStepByCase, setFailedStepByCase] = useState<Record<string, number | null>>({});
  const [attachmentsByCase, setAttachmentsByCase] = useState<Record<string, TestAttachmentMeta[]>>({});
  const [attachBusyId, setAttachBusyId] = useState<string | null>(null);
  const [generatedCases, setGeneratedCases] = useState<GeneratedTestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [closedSprints, setClosedSprints] = useState<Set<number>>(() => new Set());
  const timers = useActiveTimers(Boolean(authUser));
  const actingAssignBy = auditActorLabel(authUser);
  const isAdmin = userHasAdminRole(authUser);
  /** Tina / Lyriq / Evelyn (qa|admin|dev) — Pass/Fail/etc.; Blocked is Evelyn-only. */
  const canChangeStatus = userCanChangeTestStatus(authUser);
  const canBlock = canSetTestBlocked(authUser);
  const assignByOptions = useMemo(
    () => assignedBySelectOptions(actingAssignBy, ...Object.values(assignedByByCase)),
    [actingAssignBy, assignedByByCase],
  );
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  /** Empty = both. Top-level: External (user-facing) vs Internal (admin / QA). */
  const [facingFilters, setFacingFilters] = useState<Set<TestFacing>>(() => new Set());
  const [facingOpen, setFacingOpen] = useState(true);
  const [categoryFilters, setCategoryFilters] = useState<Set<TestCategory>>(() => new Set());
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<Set<TestStatus>>(() => new Set());
  const [statusOpen, setStatusOpen] = useState(false);
  const [testerFilters, setTesterFilters] = useState<Set<QaTesterId>>(() => new Set());
  /** Empty = all suites. Default manual to match prior portal focus. */
  const [suiteFilters, setSuiteFilters] = useState<Set<TestSuite>>(() => new Set(["manual"]));
  const [suitesOpen, setSuitesOpen] = useState(false);
  /** Run Vitest / Playwright controls — collapsed by default. */
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

  const suiteFilterSummary = useMemo(() => {
    if (suiteFilters.size === 0) return "All suites";
    return [...suiteFilters].map((s) => SUITE_LABELS[s]).join(", ");
  }, [suiteFilters]);

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

  const maybeStartTestTimer = async (id: string) => {
    const st = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
    if (st === "pass" || st === "fail" || st === "blocked") return;
    if (!authUser) return;
    const existing = timers.entryFor("test", id);
    if (existing?.status === "running" || existing?.status === "paused") return;
    if (startingTimersRef.current.has(id)) return;
    startingTimersRef.current.add(id);
    try {
      const title = ALL_CASES.find((c) => c.id === id)?.title ?? id;
      await ensureWorkTimerStarted({ source: "test", sourceId: id, sourceLabel: title });
      void timers.refresh();
    } finally {
      startingTimersRef.current.delete(id);
    }
  };

  const isCaseDirty = (id: string) =>
    dirtyNotesRef.current.has(id) || dirtyStepsRef.current.has(id);

  const assertCaseUnlocked = (id: string, nextSprint?: number): boolean => {
    const current = persistedSprint(id);
    if (isSprintLocked(closedSprints, current)) {
      const msg = sprintLockedMessage(current);
      setError(msg);
      setRowErrors((prev) => ({ ...prev, [id]: msg }));
      return false;
    }
    if (nextSprint !== undefined && isSprintLocked(closedSprints, nextSprint)) {
      const msg = sprintLockedMessage(nextSprint);
      setError(msg);
      setRowErrors((prev) => ({ ...prev, [id]: msg }));
      return false;
    }
    return true;
  };

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

  const composedNote = (id: string) =>
    applyNoteDrafts(
      notesRef.current[id] ?? "",
      actingAssignBy,
      editNoteDraftsRef.current[id],
      newNoteDraftsRef.current[id],
    );

  const applyServerData = (data: TestStatusesPayload, savedId?: string) => {
    if (savedId) {
      clearDirtyNote(savedId);
      clearDirtySteps(savedId);
    }
    // Merge server payload into local state so concurrent saves cannot drop fields.
    setStatuses((prev) => ({ ...prev, ...data.statuses }));
    // Server notes are source of truth; unsaved drafts live in new/edit draft maps.
    setNotes((prev) => ({ ...prev, ...data.notes }));
    setAssigneeOverrides((prev) => ({ ...prev, ...data.assignees }));
    setSprintByCase((prev) => ({ ...prev, ...data.sprints }));
    setDueDatesByCase((prev) => ({ ...prev, ...(data.dueDates ?? {}) }));
    setAssignedByByCase((prev) => ({ ...prev, ...(data.assignedBy ?? {}) }));
    setDateAssignedByCase((prev) => ({ ...prev, ...(data.dateAssigned ?? {}) }));
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
      const [closedList, fetched] = await Promise.all([
        fetchClosedSprints().catch(() => [] as number[]),
        fetchTestStatuses(),
      ]);
      setClosedSprints(new Set(closedList));
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
    const exists = ALL_CASES.some((t) => t.id === focusTestId);
    if (!exists) {
      onFocusConsumed?.();
      return;
    }
    setQuery(focusTestId);
    setAreaFilter("all");
    setCategoryFilters(new Set());
    setStatusFilters(new Set());
    setTesterFilters(new Set());
    setSuiteFilters(new Set());
    setSprintFilters(new Set());
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
  }, [focusTestId, loading, onFocusConsumed]);

  const areas = useMemo(
    () => ["all", ...Array.from(new Set(COUNTABLE_CASES.map((t) => t.area)))],
    [COUNTABLE_CASES],
  );

  const isFailureGeneratedId = (id: string) => /^(VT|PW)-FAIL-/i.test(id);

  /** Effective assignees: humans for manual + failure cases; suite owners for other automated. */
  const effectiveAssignees = (t: TestCase): TestOwnerId[] => {
    if (isFailureGeneratedId(t.id)) {
      const override = assigneeOverrides[t.id];
      if (override && isHumanQaTester(override)) return [override];
      return t.assignees.length ? t.assignees : ["evelyn"];
    }
    if (isAutomatedTestId(t.id) || t.suite === "vitest" || t.suite === "playwright") {
      return t.assignees;
    }
    const override = assigneeOverrides[t.id];
    if (override && isHumanQaTester(override)) {
      return [override];
    }
    return t.assignees;
  };

  /** Persist primary owner — suite owner for automated; Evelyn for new failure cases; human for manual. */
  const persistedAssignee = (id: string): string => {
    const t = ALL_CASES.find((c) => c.id === id);
    if (isFailureGeneratedId(id)) {
      const override = assigneeOverrides[id];
      if (override && isHumanQaTester(override)) return override;
      return t?.assignees[0] ?? "evelyn";
    }
    if (t && (isAutomatedTestId(id) || t.suite === "vitest" || t.suite === "playwright")) {
      return t.assignees[0] ?? "";
    }
    const override = assigneeOverrides[id];
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

  const evidenceOpts = (id: string, status?: TestStatus, dueOverride?: string) => {
    const st = status ?? statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
    return {
      checkedSteps: checkedFor(id),
      failedStepIndex: st === "fail" ? failedStepRef.current[id] ?? null : null,
      stepCount: stepsFor(id).length,
      dueDate: dueOverride ?? persistedDueDate(id),
    };
  };

  const isCaseComplete = (id: string) => {
    const st = statuses[id] ?? DEFAULT_TEST_STATUS;
    return st === "pass" || st === "fail" || st === "blocked";
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
    if (exclude !== "status" && statusFilters.size > 0 && !statusFilters.has(st)) return false;
    if (exclude !== "tester" && testerFilters.size > 0) {
      const owners = effectiveAssignees(t);
      if (!owners.some((a) => testerFilters.has(a as QaTesterId))) return false;
    }
    if (exclude !== "suite" && suiteFilters.size > 0 && !suiteFilters.has(t.suite ?? "manual")) {
      return false;
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
        (notes[t.id] ?? "").toLowerCase().includes(q)
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
        done: tally.pass + tally.fail + tally.blocked,
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
      fail: suiteStats.manual.tally.fail + suiteStats.vitest.tally.fail + suiteStats.playwright.tally.fail,
      blocked:
        suiteStats.manual.tally.blocked +
        suiteStats.vitest.tally.blocked +
        suiteStats.playwright.tally.blocked,
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
        const ids = COUNTABLE_CASES.filter(
          (t) => t.suite === "manual" && effectiveAssignees(t).includes(tester.id),
        ).map((t) => t.id);
        return {
          id: tester.id,
          label: tester.name,
          detail: "Manual QA",
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

  /** Filter-chip counts: each dimension counted within the intersection of all other filters. */
  const testerStats = useMemo(() => {
    const base = COUNTABLE_CASES.filter(
      (t) => t.suite === "manual" && caseMatchesFilters(t, "tester"),
    );
    return QA_TESTERS.map((tester) => {
      const cases = base.filter((t) => effectiveAssignees(t).includes(tester.id));
      const done = cases.filter((t) => isCaseComplete(t.id)).length;
      return { ...tester, total: cases.length, done };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caseMatchesFilters closes over filter state
  }, filterDeps);

  const facetSuiteStats = useMemo(() => {
    const base = COUNTABLE_CASES.filter((t) => caseMatchesFilters(t, "suite"));
    const counts: Record<TestSuite, { done: number; total: number; passed: number }> = {
      manual: { done: 0, total: 0, passed: 0 },
      vitest: { done: 0, total: 0, passed: 0 },
      playwright: { done: 0, total: 0, passed: 0 },
    };
    for (const suite of ["manual", "vitest", "playwright"] as TestSuite[]) {
      const ids = base.filter((t) => (t.suite ?? "manual") === suite).map((t) => t.id);
      const tally = tallyStatuses(ids, statuses);
      counts[suite] = {
        done: tally.pass + tally.fail + tally.blocked,
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

  const sprintStats = useMemo(() => {
    const bySprint = new Map<number, { done: number; total: number }>();
    let backlog = { done: 0, total: 0 };
    for (const t of COUNTABLE_CASES) {
      if (!caseMatchesFilters(t, "sprint")) continue;
      const sprint = effectiveSprint(t);
      if (sprint === BACKLOG_SPRINT) {
        backlog.total += 1;
        if (isCaseComplete(t.id)) backlog.done += 1;
        continue;
      }
      const cur = bySprint.get(sprint) ?? { done: 0, total: 0 };
      cur.total += 1;
      if (isCaseComplete(t.id)) cur.done += 1;
      bySprint.set(sprint, cur);
    }
    return { bySprint, backlog };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caseMatchesFilters closes over filter state
  }, filterDeps);

  const counts = useMemo(() => {
    const acc = { total: 0 } as Record<string, number>;
    for (const t of COUNTABLE_CASES) {
      if (!caseMatchesFilters(t, "status")) continue;
      const st = statuses[t.id] ?? DEFAULT_TEST_STATUS;
      acc[st] = (acc[st] ?? 0) + 1;
      acc.total += 1;
    }
    return acc;
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
  const testerFilterOrder = useMemo(() => QA_TESTERS.map((t) => t.id), []);

  const filtered = useMemo(() => {
    const list = COUNTABLE_CASES.filter((t) => caseMatchesFilters(t));
    list.sort((a, b) => {
      const sa = statuses[a.id] ?? DEFAULT_TEST_STATUS;
      const sb = statuses[b.id] ?? DEFAULT_TEST_STATUS;
      const byStatus = STATUS_LIST_ORDER[sa] - STATUS_LIST_ORDER[sb];
      if (byStatus !== 0) return byStatus;
      return a.id.localeCompare(b.id);
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caseMatchesFilters closes over filter state
  }, filterDeps);

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
    const note = composedNote(id);
    const steps = stepsFor(id);
    const checked = checkedFor(id);
    const failedIdx = failedStepRef.current[id];

    if (status === "pass" && !allStepsChecked(checked, steps.length)) {
      const msg = `Check every step before marking Pass (${checked.filter(Boolean).length}/${steps.length} done).`;
      setRowErrors((prev) => ({ ...prev, [id]: msg }));
      setError(msg);
      setOpenIds((prev) => new Set(prev).add(id));
      return;
    }
    if (status === "fail" && steps.length > 0 && (failedIdx === null || failedIdx === undefined || failedIdx < 0)) {
      const msg = "Select which step failed before marking Fail.";
      setRowErrors((prev) => ({ ...prev, [id]: msg }));
      setError(msg);
      setOpenIds((prev) => new Set(prev).add(id));
      return;
    }
    if (statusRequiresNote(status) && !noteMeetsRequirement(note)) {
      const msg = `A note is required for ${STATUS_LABELS[status]} (at least ${NOTE_MIN_LENGTH} characters). Describe what failed or what is blocking.`;
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
    setError("");
    setSaveFlash("");
    setRowErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (status === "in_progress") void maybeStartTestTimer(id);
    const gen = beginSave(id);
    const prev = statusesRef.current[id] ?? DEFAULT_TEST_STATUS;
    const assignee = status === "fail" ? FAILED_TEST_ASSIGNEE : persistedAssignee(id);
    setStatuses((s) => ({ ...s, [id]: status }));
    if (status === "fail") {
      setAssigneeOverrides((prevAssignees) => ({ ...prevAssignees, [id]: FAILED_TEST_ASSIGNEE }));
    }
    try {
      const data = await saveTestStatus(
        id,
        status,
        note,
        assignee,
        persistedSprint(id),
        evidenceOpts(id, status),
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
      setSaveFlash(`${id} → ${STATUS_LABELS[status]} saved`);
      if (status !== prev && (status === "pass" || status === "fail" || status === "blocked")) {
        await stopTimerOnStatusChange("test", id);
        void timers.refresh();
      }
    } catch (e) {
      if (!endSave(id, gen)) return;
      setStatuses((s) => ({ ...s, [id]: prev }));
      const msg = e instanceof ApiError ? e.message : "Failed to save test status.";
      setRowErrors((prevErr) => ({ ...prevErr, [id]: msg }));
      setError(msg);
    }
  };

  const attachEvidenceFile = async (caseId: string, file: File) => {
    if (!assertCaseUnlocked(caseId)) return;
    setAttachBusyId(caseId);
    setError("");
    try {
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
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Attachment rejected or upload failed.");
    } finally {
      setAttachBusyId(null);
    }
  };

  const captureScreenshot = async (caseId: string) => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError("Screenshot capture is not supported in this browser. Attach an image file instead.");
      return;
    }
    setAttachBusyId(caseId);
    setError("");
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" } as MediaTrackConstraints,
        audio: false,
      });
      const track = stream.getVideoTracks()[0];
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not capture frame.");
      ctx.drawImage(video, 0, 0);
      track?.stop();
      stream.getTracks().forEach((t) => t.stop());
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not build PNG.");
      const file = new File([blob], `screenshot-${caseId}-${Date.now()}.png`, { type: "image/png" });
      await attachEvidenceFile(caseId, file);
    } catch (e) {
      stream?.getTracks().forEach((t) => t.stop());
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        setError("Screenshot cancelled — permission denied.");
      } else {
        setError(e instanceof Error ? e.message : "Screenshot failed.");
      }
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
          !note &&
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

  const toggleTesterFilter = (id: QaTesterId, e?: MouseEvent) => {
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
      setSuiteFilters((prev) => {
        const suites = new Set(prev);
        suites.add("manual");
        return suites;
      });
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
    if (status === "pass") {
      const incomplete = ids.filter((id) => !allStepsChecked(checkedFor(id), stepsFor(id).length));
      if (incomplete.length > 0) {
        setError(
          `All steps must be checked before Pass on ${incomplete.length} selected case(s). Expand each case and complete the checklist.`,
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
    try {
      const items = ids.map((id) => ({
        caseId: id,
        status,
        note: composedNote(id),
        assignee: status === "fail" ? FAILED_TEST_ASSIGNEE : persistedAssignee(id),
        sprint: persistedSprint(id),
        dueDate: persistedDueDate(id),
        checkedSteps: checkedFor(id),
        failedStepIndex: status === "fail" ? failedStepRef.current[id] ?? null : null,
        stepCount: stepsFor(id).length,
      }));
      // Optimistic UI
      setStatuses((s) => {
        const next = { ...s };
        for (const id of ids) next[id] = status;
        return next;
      });
      if (status === "fail") {
        setAssigneeOverrides((prev) => {
          const next = { ...prev };
          for (const id of ids) next[id] = FAILED_TEST_ASSIGNEE;
          return next;
        });
      }
      const data = await saveTestStatusesBatch(items);
      applyServerData(data);
      for (const id of ids) {
        if ((prevStatuses[id] ?? DEFAULT_TEST_STATUS) !== status) {
          await stopTimerOnStatusChange("test", id);
        }
      }
      void timers.refresh();
      setSaveFlash(`${ids.length} test(s) → ${STATUS_LABELS[status]}`);
      window.setTimeout(() => setSaveFlash(""), 3500);
    } catch (e) {
      setStatuses(prevStatuses);
      setError(e instanceof ApiError ? e.message : "Bulk status update failed.");
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
      if (isBacklogSprint(sprint)) {
        setAssigneeOverrides((prev) => {
          const next = { ...prev };
          for (const id of ids) next[id] = "";
          return next;
        });
      }
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
    const note = raw.trim();
    if (!note) {
      setError("Enter a description/note to apply.");
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
        for (const id of ids) next[id] = note;
        return next;
      });
      const data = await saveTestStatusesBatch(items);
      applyServerData(data);
      setBulkDescription("");
      setSaveFlash(`${ids.length} test(s) description/note updated`);
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
    setRunLog(
      `Running ${suite === "all" ? "Vitest + Playwright" : suite} (${mode === "new" ? "new / not-started only" : "full regression"})…`,
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

  const vitestPass = vitestReal.passed;
  const vitestTotal = vitestReal.total;
  const pwPass = suiteStats.playwright.passed;
  const pwTotal = suiteStats.playwright.total;
  const autoPass = vitestPass + pwPass;
  const autoTotal = vitestTotal + pwTotal;

  const portalBusy =
    loading || savingAll || savingIds.size > 0 || suiteRunning !== null;
  const portalBusyMessage = loading
    ? "Loading test statuses…"
    : suiteRunning === "vitest"
      ? "Running Vitest…"
      : suiteRunning === "playwright"
        ? "Running Playwright…"
        : suiteRunning === "all"
          ? "Running test suites…"
          : savingAll || savingIds.size > 0
            ? "Saving test updates…"
            : "Please wait…";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <BusyOverlay active={portalBusy} message={portalBusyMessage} />
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
            <h2 style={{ fontSize: "1.5rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: "8px" }}>
              <FlaskConical size={22} style={{ color: "var(--bronze)" }} /> Testing Portal
            </h2>
            <p style={{ color: "var(--text-primary)", marginTop: "6px", fontSize: "1rem" }}>
              Select tests with checkboxes to bulk-assign or bulk-update status. Use status buttons to filter.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline qa-testing-portal__reset"
            title="Dangerous — requires typed confirmation. Snapshots rows to history first."
            onClick={async () => {
              const typed = window.prompt(
                'This deletes ALL test results. Type DELETE_ALL_TEST_RESULTS to confirm (a history snapshot is saved first).',
              );
              if (typed !== "DELETE_ALL_TEST_RESULTS") {
                setError("Reset cancelled — test results were not deleted.");
                return;
              }
              try {
                await resetTestStatuses("DELETE_ALL_TEST_RESULTS");
                setStatuses({});
                setNotes({});
                setAssigneeOverrides({});
                setSprintByCase({});
                setDueDatesByCase({});
                setUpdatedAtByCase({});
                setUpdatedByByCase({});
                setSaveFlash("All statuses reset (history snapshot saved).");
              } catch (e) {
                setError(e instanceof ApiError ? e.message : "Failed to reset statuses.");
              }
            }}
          >
            <RotateCcw size={14} /> Reset statuses
          </button>
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
                  title="Clear tester filter"
                >
                  All testers
                  <span className="qa-tester-meta">
                    · {testerStats.reduce((n, t) => n + t.total, 0)}
                  </span>
                </FilterChip>
                {testerStats.map((tester) => {
                  const active = testerFilters.has(tester.id);
                  return (
                    <FilterChip
                      key={tester.id}
                      active={active}
                      accent={tester.accent}
                      title={`${tester.name} — ${tester.total} assigned · ${tester.done} done — Shift+click to select a range`}
                      onToggle={(e) => toggleTesterFilter(tester.id, e)}
                    >
                      <span className="qa-tester-dot" style={{ background: tester.accent }} />
                      {tester.shortName}
                      <span className="qa-tester-meta">· {tester.total}</span>
                    </FilterChip>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="schedule-board-filters__row qa-testing-portal__category"
            data-testid="qa-automated-testing"
          >
            <div className="schedule-board-filters__label schedule-board-filters__label--bar">
              <button
                type="button"
                className="schedule-board-filters__chevron"
                onClick={() => setAutomatedOpen((o) => !o)}
                aria-expanded={automatedOpen}
                aria-label={automatedOpen ? "Collapse Automated Testing" : "Expand Automated Testing"}
                data-testid="qa-automated-testing-toggle"
              >
                {automatedOpen ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
              </button>
              <button
                type="button"
                className="schedule-board-filters__filter-title schedule-board-filters__filter-title--collapse"
                onClick={() => setAutomatedOpen((o) => !o)}
                aria-expanded={automatedOpen}
              >
                <span>Automated Testing</span>
                {!automatedOpen ? (
                  <span className="schedule-board-filters__label-hint">
                    Manual · Automated · Vitest · Playwright · {countWithPct(autoPass, autoTotal, " passed")}
                  </span>
                ) : null}
              </button>
            </div>
            <div className="qa-testing-portal__top-filters qa-testing-portal__suite-filters">
              <FilterChip
                active={suiteFilters.has("manual")}
                onToggle={(e) => toggleSuiteFilter("manual", e)}
                title="Manual QA suite — Shift+click to select a range with other suite chips"
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
              <FilterChip
                active={automatedSuiteActive}
                onToggle={() => toggleAutomatedSuiteFilter()}
                title="Vitest + Playwright automated suites"
              >
                Automated
                <span className="qa-tester-meta">
                  ·{" "}
                  {countWithPct(
                    facetSuiteStats.vitest.passed + facetSuiteStats.playwright.passed,
                    facetSuiteStats.vitest.total + facetSuiteStats.playwright.total,
                    " passed",
                  )}
                </span>
              </FilterChip>
            </div>
            {automatedOpen ? (
              <div className="qa-automated-testing__body">
                <div className="qa-automated-testing__actions">
                  <button
                    type="button"
                    className="btn btn-primary suite-run-btn"
                    disabled={suiteRunning !== null || loading}
                    onClick={() => void runSuite("vitest", "new")}
                    title="Run Vitest for new / not-run cases only. Failures create VT-FAIL-* in Backlog (Unassigned), or Tina + current/next sprint for Kids/Youth."
                  >
                    <Play size={14} />
                    <span className="suite-run-btn__label">
                      {suiteRunning === "vitest" ? <WaitLabel>Running Vitest…</WaitLabel> : "Run Vitest"}
                      <span className="suite-run-btn__count">
                        {countWithPct(vitestPass, vitestTotal, " passed")}
                      </span>
                    </span>
                  </button>
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
                  <button
                    type="button"
                    className="btn btn-primary suite-run-btn"
                    disabled={suiteRunning !== null || loading}
                    onClick={() => void runSuite("playwright", "new")}
                    title="Run Playwright for new / not-run cases only. Failures create PW-FAIL-* in Backlog (Unassigned), or Tina + current/next sprint for Kids/Youth."
                  >
                    <Play size={14} />
                    <span className="suite-run-btn__label">
                      {suiteRunning === "playwright" ? <WaitLabel>Running Playwright…</WaitLabel> : "Run Playwright"}
                      <span className="suite-run-btn__count">
                        {countWithPct(pwPass, pwTotal, " passed")}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline suite-run-btn"
                    disabled={suiteRunning !== null || loading}
                    onClick={() => void runSuite("all", "new")}
                    title="Run Vitest + Playwright for new / not-run cases only"
                  >
                    <span className="suite-run-btn__label">
                      {suiteRunning === "all" ? <WaitLabel>Running both…</WaitLabel> : "Run both"}
                      <span className="suite-run-btn__count">
                        {countWithPct(autoPass, autoTotal, " passed")}
                      </span>
                    </span>
                  </button>
                </div>
                {runLog ? (
                  <pre className="qa-automated-testing__log">{runLog}</pre>
                ) : null}
              </div>
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
          <button
            type="button"
            className="qa-section-heading qa-categories-panel__toggle"
            onClick={() => setFacingOpen((o) => !o)}
            aria-expanded={facingOpen}
          >
            {facingOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
          <button
            type="button"
            className="qa-section-heading qa-categories-panel__toggle"
            onClick={() => setCategoriesOpen((o) => !o)}
            aria-expanded={categoriesOpen}
          >
            {categoriesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="qa-categories-panel__title">Categories</span>
            <span className="qa-categories-panel__active">— {categoryFilterSummary}</span>
          </button>
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

        <div className="qa-categories-panel" data-testid="qa-sprint-panel" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="qa-section-heading qa-categories-panel__toggle"
            onClick={() => setSprintOpen((o) => !o)}
            aria-expanded={sprintOpen}
          >
            {sprintOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="qa-categories-panel__title">Sprint</span>
            <span className="qa-categories-panel__active">
              — {sprintFilterSummary}
              {sprintFilters.size === 1 && sprintFilters.has(activeSprintIndex)
                ? " · current"
                : ""}
            </span>
          </button>
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
                  ·{" "}
                  {countWithPct(
                    sprintStats.backlog.done +
                      [...sprintStats.bySprint.values()].reduce((n, s) => n + s.done, 0),
                    sprintStats.backlog.total +
                      [...sprintStats.bySprint.values()].reduce((n, s) => n + s.total, 0),
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
                  · {countWithPct(sprintStats.backlog.done, sprintStats.backlog.total)}
                </span>
              </FilterChip>
              {sprints.map((s) => {
                const stats = sprintStats.bySprint.get(s.index) ?? { done: 0, total: 0 };
                const isCurrent = s.index === activeSprintIndex;
                return (
                  <FilterChip
                    key={s.index}
                    active={sprintFilters.has(s.index)}
                    title={`${s.rangeLabel}${isCurrent ? " · current sprint" : ""} — Shift+click to select a range`}
                    onToggle={(e) => toggleSprintFilter(s.index, e)}
                    accent={isCurrent ? "#2e7d32" : undefined}
                  >
                    {s.label}
                    {isCurrent ? " · current" : ""}
                    <span className="qa-tester-meta">
                      · {countWithPct(stats.done, stats.total)}
                    </span>
                  </FilterChip>
                );
              })}
            </div>
          )}
        </div>

        <div className="qa-categories-panel" data-testid="qa-status-panel" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="qa-section-heading qa-categories-panel__toggle"
            onClick={() => setStatusOpen((o) => !o)}
            aria-expanded={statusOpen}
          >
            {statusOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="qa-categories-panel__title">Status</span>
            <span className="qa-categories-panel__active">— {statusFilterSummary}</span>
          </button>
          {statusOpen && (
            <div className="qa-categories-panel__bubbles">
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
                </span>
              </FilterChip>
              {STATUSES.map((s) => {
                const active = statusFilters.has(s);
                const n = counts[s] ?? 0;
                return (
                  <FilterChip
                    key={s}
                    active={active}
                    accent={STATUS_COLOR[s]}
                    title={`${STATUS_LABELS[s]} — ${n} tests — Shift+click to select a range`}
                    onToggle={(e) => toggleStatusFilter(s, e)}
                  >
                    <span className="qa-tester-dot" style={{ background: STATUS_COLOR[s] }} />
                    {STATUS_LABELS[s]}
                    <span className="qa-tester-meta">· {n}</span>
                  </FilterChip>
                );
              })}
            </div>
          )}
        </div>

        <div className="qa-categories-panel" data-testid="qa-suites-panel" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="qa-section-heading qa-categories-panel__toggle"
            onClick={() => setSuitesOpen((o) => !o)}
            aria-expanded={suitesOpen}
          >
            {suitesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="qa-categories-panel__title">Test suites</span>
            <span className="qa-categories-panel__active">— {suiteFilterSummary}</span>
          </button>
          {suitesOpen && (
            <div className="qa-categories-panel__bubbles">
              {(() => {
                const allPassed =
                  facetSuiteStats.manual.passed +
                  facetSuiteStats.vitest.passed +
                  facetSuiteStats.playwright.passed;
                const allTotal =
                  facetSuiteStats.manual.total +
                  facetSuiteStats.vitest.total +
                  facetSuiteStats.playwright.total;
                return (
                  <FilterChip
                    active={suiteFilters.size === 0}
                    onToggle={() => {
                      setSuiteFilters(new Set());
                      lastSuiteIdx.current = null;
                    }}
                    title="Clear suite filter"
                  >
                    All suites
                    <span className="qa-tester-meta">
                      · {countWithPct(allPassed, allTotal, " passed")}
                    </span>
                  </FilterChip>
                );
              })()}
              {suiteFilterOrder.map((suite) => {
                const stats = facetSuiteStats[suite];
                return (
                  <FilterChip
                    key={suite}
                    active={suiteFilters.has(suite)}
                    title={`${SUITE_LABELS[suite]} — Shift+click to select a range`}
                    onToggle={(e) => toggleSuiteFilter(suite, e)}
                  >
                    {SUITE_LABELS[suite]}
                    <span className="qa-tester-meta">
                      · {countWithPct(stats.passed, stats.total, " passed")}
                    </span>
                  </FilterChip>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", marginTop: "18px" }}>
          {(["total", ...STATUSES] as const).map((k) => {
            const isTotal = k === "total";
            const active = isTotal ? statusFilters.size === 0 : statusFilters.has(k);
            const statusCount = isTotal ? completedCases : (counts[k] ?? 0);
            const statusPct = pctComplete(statusCount, counts.total);
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
              >
                <div className="qa-status-tile__label">
                  {isTotal ? "Complete / Total" : STATUS_LABELS[k]}
                </div>
                <div
                  className="qa-status-tile__num"
                  style={active ? undefined : { color: isTotal ? "var(--charcoal)" : STATUS_COLOR[k] }}
                >
                  {isTotal ? countWithPct(completedCases, counts.total) : `${statusCount} · ${statusPct}`}
                </div>
              </button>
            );
          })}
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
              ({testerStats.find((t) => t.id === "lyriq")?.total ?? 0})
            </span>
          </button>
          {QA_TESTERS.filter((t) => t.id !== "lyriq").map((tester) => {
            const assigned = testerStats.find((t) => t.id === tester.id)?.total ?? 0;
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
                <span style={{ fontWeight: 800, marginLeft: 6 }}>({assigned})</span>
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
              <option key={s.index} value={s.index}>
                {s.label}
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
        <select className="select-input" style={{ width: 280, minWidth: 220, height: 40 }} value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
          {areas.map((a) => (
            <option key={a} value={a}>{a === "all" ? "All areas" : a}</option>
          ))}
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
                  .map((id) => QA_TESTERS.find((t) => t.id === id)?.shortName ?? id)
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
                  {(notes[t.id] ?? "").trim() && (
                    <span className="flat-label flat-label--id" title={(notes[t.id] ?? "").trim()}>
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
                <span>
                  Assigned By{" "}
                  <span style={{ color: "var(--charcoal)" }}>
                    {assignedByByCase[t.id]?.trim() || SYSTEM_ASSIGNED_BY}
                  </span>
                </span>
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
                  {STATUSES.filter((s) => s !== "blocked" || canBlock || st === "blocked").map((s) => (
                    <option key={s} value={s} disabled={s === "blocked" && !canBlock}>
                      {STATUS_LABELS[s]}
                      {s === "blocked" && !canBlock ? " (Evelyn only)" : ""}
                    </option>
                  ))}
                </select>
                <span style={{ gridColumn: "1 / -1" }}>
                  <WorkTimer
                    source="test"
                    sourceId={t.id}
                    sourceLabel={t.title}
                    entry={timers.entryFor("test", t.id)}
                    onChanged={timers.onChanged}
                    compact
                    disabled={st === "pass" || st === "fail" || st === "blocked"}
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
                          style={{ flex: 1, minWidth: 0, padding: "8px 12px", fontSize: "1rem" }}
                          value={assigneeOverrides[t.id] ?? ""}
                          onChange={(e) => void reassign(t.id, e.target.value)}
                        >
                          <option value="">Default ({testerLabel(t.assignees)})</option>
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
                        ({checkedFor(t.id).filter(Boolean).length}/{t.steps.length} — all required to Pass)
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
                  <label style={{ display: "grid", gap: 6, marginTop: 12, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                    Notes{" "}
                    {statusRequiresNote(st) || st === "fail" ? (
                      <span style={{ color: "var(--crimson)" }}>
                        (required for Fail / Blocked — explain the failure or blocker)
                      </span>
                    ) : (
                      <span>(optional for Pass / In Progress / Not Started — use Save everything)</span>
                    )}
                    <textarea
                      id={`test-note-${t.id}`}
                      className="text-input"
                      rows={3}
                      value={notes[t.id] ?? ""}
                      onChange={(e) => markNoteDirty(t.id, e.target.value)}
                      placeholder={
                        st === "fail"
                          ? "Required: which step failed, what you saw, and expected vs actual."
                          : statusRequiresNote(st)
                            ? "Required: describe what failed or what is blocking."
                            : "Optional notes for this test. Click Save everything in the toolbar to persist."
                      }
                      style={{
                        resize: "vertical",
                        width: "100%",
                        borderColor: rowErrors[t.id] || (statusRequiresNote(st) && !noteMeetsRequirement(notes[t.id] ?? ""))
                          ? "rgba(155,47,40,0.55)"
                          : undefined,
                      }}
                    />
                  </label>

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
                        onClick={() => void captureScreenshot(t.id)}
                      >
                        <Camera size={14} style={{ marginRight: 6 }} /> Screenshot
                      </button>
                      {attachBusyId === t.id && (
                        <span style={{ fontSize: "0.9rem", color: "var(--charcoal)" }}>Uploading / scanning…</span>
                      )}
                    </div>
                    {(attachmentsByCase[t.id] ?? []).length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
                        {(attachmentsByCase[t.id] ?? []).map((a) => (
                          <li key={a.id} style={{ fontSize: "0.92rem" }}>
                            {a.name}{" "}
                            <span style={{ color: "var(--charcoal)" }}>
                              ({Math.max(1, Math.round(a.size / 1024))} KB · {a.scanStatus})
                            </span>{" "}
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ padding: "2px 8px", fontSize: "0.8rem", marginLeft: 6 }}
                              onClick={() => void removeEvidence(t.id, a.id)}
                              title="Remove attachment"
                            >
                              <Trash2 size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
                    {STATUSES.filter((s) => s !== "blocked" || canBlock || st === "blocked").map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`btn ${st === s ? "btn-primary" : "btn-outline"}`}
                        style={{ padding: "6px 12px", fontSize: "0.9375rem" }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => void setStatus(t.id, s)}
                        disabled={isSaving(t.id) || !canChangeStatus || (s === "blocked" && !canBlock)}
                        title={
                          s === "pass"
                            ? "All steps must be checked"
                            : s === "fail"
                              ? "Select failed step + write a note"
                              : s === "blocked"
                                ? canBlock
                                  ? "Write a short note describing the blocker"
                                  : "Only Evelyn may set Blocked"
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
