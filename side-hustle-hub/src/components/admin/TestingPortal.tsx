import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { FlaskConical, RotateCcw, Search, ChevronDown, ChevronRight, Play } from "lucide-react";
import {
  TEST_CASES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  SUITE_LABELS,
  TEST_CATEGORIES,
  TEST_CATEGORY_LABELS,
  categoryForCase,
  fetchTestStatuses,
  saveTestStatus,
  resetTestStatuses,
  runAutomatedSuite,
  withDefaultSuite,
  statusRequiresNote,
  noteMeetsRequirement,
  NOTE_MIN_LENGTH,
  type TestStatus,
  type TestSuite,
  type TestCategory,
  type AutomatedSuite,
  type AutomatedRunMode,
  type GeneratedTestCase,
  type TestCase,
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
import { listUpcomingSprints, sprintLabel, BACKLOG_SPRINT } from "../../lib/gysh-sprints";
import { ApiError } from "../../lib/api";
import type { AuthUser } from "../../lib/auth";
import { suggestedSprintForTest } from "../../lib/gysh-sprint-board";
import { stopTimerOnStatusChange } from "../../lib/gysh-time-entries";
import { useActiveTimers } from "../../lib/use-active-timers";
import { SprintStatusBars } from "./SprintStatusBars";
import { QaProgressBars, emptyTally, tallyStatuses, type StatusTally } from "./QaProgressBars";
import { WorkTimer } from "./WorkTimer";

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
  not_run: "#6b5344",
  in_progress: "#b8860b",
  pass: "#3f6b2e",
  fail: "#9B2F28",
  blocked: "#9B2F28",
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
    assignees: [g.suite === "playwright" ? "playwright" : "vitest"],
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
  const [assigneeOverrides, setAssigneeOverrides] = useState<Record<string, string>>({});
  const [sprintByCase, setSprintByCase] = useState<Record<string, number>>({});
  const [generatedCases, setGeneratedCases] = useState<GeneratedTestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timers = useActiveTimers(Boolean(authUser));
  void authUser;
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [categoryFilters, setCategoryFilters] = useState<Set<TestCategory>>(() => new Set());
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [statusFilters, setStatusFilters] = useState<Set<TestStatus>>(() => new Set());
  const [testerFilters, setTesterFilters] = useState<Set<QaTesterId>>(() => new Set());
  /** Empty = all suites. Default manual to match prior portal focus. */
  const [suiteFilters, setSuiteFilters] = useState<Set<TestSuite>>(() => new Set(["manual"]));
  /** Empty = all sprints. Values are sprint index or "backlog". */
  const [sprintFilters, setSprintFilters] = useState<Set<SprintFilterKey>>(() => new Set());
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
  /** Per-case save generation — concurrent note/status saves must not lock controls. */
  const saveGenByIdRef = useRef<Record<string, number>>({});
  const statusesRef = useRef(statuses);
  statusesRef.current = statuses;
  const notesRef = useRef(notes);
  notesRef.current = notes;
  /** Unsaved note edits — never clobber these when another row's save returns. */
  const dirtyNotesRef = useRef(new Set<string>());

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

  const effectiveSprint = (t: TestCase) =>
    sprintByCase[t.id] ?? suggestedSprintForTest(t);

  const applyServerData = (
    data: {
      statuses: Record<string, TestStatus>;
      notes: Record<string, string>;
      assignees: Record<string, string>;
      sprints: Record<string, number>;
      generatedCases?: GeneratedTestCase[];
    },
    savedId?: string,
  ) => {
    if (savedId) dirtyNotesRef.current.delete(savedId);
    setStatuses(data.statuses);
    setNotes((prev) => {
      const next: Record<string, string> = { ...data.notes };
      for (const id of dirtyNotesRef.current) {
        if (prev[id] !== undefined) next[id] = prev[id];
      }
      return next;
    });
    setAssigneeOverrides(data.assignees);
    setSprintByCase(data.sprints);
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

  const markNoteDirty = (id: string, value: string) => {
    dirtyNotesRef.current.add(id);
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchTestStatuses();
      setStatuses(data.statuses);
      setNotes(data.notes);
      setAssigneeOverrides(data.assignees);
      setSprintByCase(data.sprints);
    } catch (e) {
      setStatuses({});
      setNotes({});
      setAssigneeOverrides({});
      setSprintByCase({});
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

  /** Effective assignees: humans for manual; suite owners for automated (D1 human override ignored). */
  const effectiveAssignees = (t: TestCase): TestOwnerId[] => {
    if (isAutomatedTestId(t.id) || t.suite === "vitest" || t.suite === "playwright") {
      return t.assignees;
    }
    const override = assigneeOverrides[t.id];
    if (override && isHumanQaTester(override)) {
      return [override];
    }
    return t.assignees;
  };

  /** Persist primary owner — suite owner for automated; human for manual. */
  const persistedAssignee = (id: string): string => {
    const t = ALL_CASES.find((c) => c.id === id);
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

  const isCaseComplete = (id: string) => {
    const st = statuses[id] ?? "not_run";
    return st === "pass" || st === "fail" || st === "blocked";
  };

  const testerStats = useMemo(() => {
    const manual = COUNTABLE_CASES.filter((t) => t.suite === "manual");
    return QA_TESTERS.map((tester) => {
      const cases = manual.filter((t) => effectiveAssignees(t).includes(tester.id));
      const done = cases.filter((t) => isCaseComplete(t.id)).length;
      return { ...tester, total: cases.length, done };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- effectiveAssignees derives from assigneeOverrides
  }, [statuses, assigneeOverrides, COUNTABLE_CASES]);

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

  const suiteOwnerStats = useMemo(() => {
    return AUTOMATED_SUITE_OWNERS.map((owner) => {
      if (owner.id === "vitest") {
        return {
          ...owner,
          total: vitestReal.total,
          done: vitestReal.done,
          passed: vitestReal.passed,
          tally: vitestReal.tally,
        };
      }
      const cases = COUNTABLE_CASES.filter(
        (t) => t.suite === owner.id && effectiveAssignees(t).includes(owner.id),
      );
      const tally = tallyStatuses(
        cases.map((c) => c.id),
        statuses,
      );
      return { ...owner, total: tally.total, done: tally.pass + tally.fail + tally.blocked, passed: tally.pass, tally };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- effectiveAssignees is pure over COUNTABLE_CASES
  }, [statuses, vitestReal, COUNTABLE_CASES]);

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

  const categoryStats = useMemo(() => {
    const counts: Partial<Record<TestCategory, { done: number; total: number }>> = {};
    for (const t of COUNTABLE_CASES) {
      const cat = categoryForCase(t);
      const cur = counts[cat] ?? { done: 0, total: 0 };
      cur.total += 1;
      if (isCaseComplete(t.id)) cur.done += 1;
      counts[cat] = cur;
    }
    return counts;
  }, [statuses, COUNTABLE_CASES]);

  const sprintStats = useMemo(() => {
    const bySprint = new Map<number, { done: number; total: number }>();
    let backlog = { done: 0, total: 0 };
    for (const t of COUNTABLE_CASES) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- effectiveSprint uses sprintByCase
  }, [statuses, sprintByCase, COUNTABLE_CASES]);

  const completedCases = useMemo(
    () => COUNTABLE_CASES.filter((t) => isCaseComplete(t.id)).length,
    [statuses, COUNTABLE_CASES],
  );

  const sprintFilterOrder = useMemo<SprintFilterKey[]>(
    () => ["backlog", ...sprints.map((s) => s.index)],
    [sprints],
  );
  const suiteFilterOrder = useMemo<TestSuite[]>(() => ["manual", "vitest", "playwright"], []);
  const testerFilterOrder = useMemo(() => QA_TESTERS.map((t) => t.id), []);

  const filtered = useMemo(() => {
    const list = COUNTABLE_CASES.filter((t) => {
      const st = statuses[t.id] ?? "not_run";
      const cat = categoryForCase(t);
      if (categoryFilters.size > 0 && !categoryFilters.has(cat)) return false;
      if (areaFilter !== "all" && t.area !== areaFilter) return false;
      if (statusFilters.size > 0 && !statusFilters.has(st)) return false;
      if (testerFilters.size > 0) {
        const owners = effectiveAssignees(t);
        if (!owners.some((a) => testerFilters.has(a as QaTesterId))) return false;
      }
      if (suiteFilters.size > 0 && !suiteFilters.has(t.suite ?? "manual")) return false;
      if (sprintFilters.size > 0) {
        const sprint = effectiveSprint(t);
        const key: SprintFilterKey = sprint === BACKLOG_SPRINT ? "backlog" : sprint;
        if (!sprintFilters.has(key)) return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q) ||
          TEST_CATEGORY_LABELS[cat].toLowerCase().includes(q) ||
          (notes[t.id] ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
    list.sort((a, b) => {
      const sa = statuses[a.id] ?? "not_run";
      const sb = statuses[b.id] ?? "not_run";
      const byStatus = STATUS_LIST_ORDER[sa] - STATUS_LIST_ORDER[sb];
      if (byStatus !== 0) return byStatus;
      return a.id.localeCompare(b.id);
    });
    return list;
  }, [
    COUNTABLE_CASES,
    statuses,
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
  ]);

  const filteredIds = useMemo(() => filtered.map((t) => t.id), [filtered]);

  useEffect(() => {
    if (loading || !preferExpanded) return;
    setOpenIds(new Set(filteredIds));
  }, [loading, preferExpanded, filteredIds]);

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

  const counts = COUNTABLE_CASES.reduce(
    (acc, t) => {
      const st = statuses[t.id] ?? "not_run";
      acc[st] = (acc[st] ?? 0) + 1;
      acc.total += 1;
      return acc;
    },
    { total: 0 } as Record<string, number>,
  );

  const setStatus = async (id: string, status: TestStatus) => {
    const note = (notesRef.current[id] ?? "").trim();
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
    const gen = beginSave(id);
    const prev = statusesRef.current[id] ?? "not_run";
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
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
      setSaveFlash(`${id} → ${STATUS_LABELS[status]} saved`);
      if (status !== prev) {
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

  const reassign = async (id: string, assignee: string) => {
    setError("");
    setAssigneeOverrides((prev) => {
      const next = { ...prev };
      if (assignee) next[id] = assignee;
      else delete next[id];
      return next;
    });
    const gen = beginSave(id);
    try {
      const status = statusesRef.current[id] ?? "in_progress";
      const data = await saveTestStatus(
        id,
        status === "not_run" ? "in_progress" : status,
        (notesRef.current[id] ?? "").trim(),
        assignee,
        persistedSprint(id),
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
    } catch (e) {
      endSave(id, gen);
      setError(e instanceof ApiError ? e.message : "Failed to save assignee.");
    }
  };

  const setSprint = async (id: string, sprint: number) => {
    setError("");
    setSprintByCase((prev) => ({ ...prev, [id]: sprint }));
    const gen = beginSave(id);
    try {
      const status = statusesRef.current[id] ?? "in_progress";
      const data = await saveTestStatus(
        id,
        status === "not_run" ? "in_progress" : status,
        (notesRef.current[id] ?? "").trim(),
        persistedAssignee(id),
        sprint,
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
    } catch (e) {
      endSave(id, gen);
      setError(e instanceof ApiError ? e.message : "Failed to save sprint.");
    }
  };

  const saveNotes = async (id: string) => {
    const currentStatus = statusesRef.current[id] ?? "not_run";
    const note = (notesRef.current[id] ?? "").trim();
    if (statusRequiresNote(currentStatus) && !noteMeetsRequirement(note)) {
      setRowErrors((prev) => ({
        ...prev,
        [id]: `A note is required for ${STATUS_LABELS[currentStatus]} (at least ${NOTE_MIN_LENGTH} characters).`,
      }));
      return;
    }
    if (currentStatus === "not_run") {
      const sprint = persistedSprint(id);
      if (!note && !persistedAssignee(id) && !(sprint > 0)) return;
    }
    setError("");
    const gen = beginSave(id);
    try {
      const status = currentStatus === "not_run" && note ? "in_progress" : currentStatus;
      const data = await saveTestStatus(
        id,
        status === "not_run" ? "in_progress" : status,
        note,
        persistedAssignee(id),
        persistedSprint(id),
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
      setSaveFlash(`${id} notes saved`);
    } catch (e) {
      if (!endSave(id, gen)) return;
      const msg = e instanceof ApiError ? e.message : "Failed to save notes.";
      setRowErrors((prev) => ({ ...prev, [id]: msg }));
      setError(msg);
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
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
    setBulkBusy(true);
    setError("");
    try {
      let nextAssignees = { ...assigneeOverrides };
      let nextStatuses = { ...statuses };
      let nextSprints = { ...sprintByCase };
      for (const id of selectedIds) {
        const caseDef = ALL_CASES.find((c) => c.id === id);
        if (caseDef && isAutomatedTestId(id)) continue;
        const status = nextStatuses[id] ?? "in_progress";
        const data = await saveTestStatus(
          id,
          status === "not_run" ? "in_progress" : status,
          (notesRef.current[id] ?? "").trim(),
          assignee,
          nextSprints[id] ?? (caseDef ? suggestedSprintForTest(caseDef) : 0),
        );
        nextAssignees = data.assignees;
        nextStatuses = data.statuses;
        nextSprints = { ...nextSprints, ...data.sprints };
        applyServerData(data, id);
      }
      setAssigneeOverrides(nextAssignees);
      setStatuses(nextStatuses);
      setSprintByCase(nextSprints);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bulk assign failed.");
    } finally {
      setBulkBusy(false);
    }
  };

  const runSuite = async (suite: AutomatedSuite, mode: AutomatedRunMode = "new") => {
    setSuiteRunning(suite);
    setError("");
    setRunLog(
      `Running ${suite === "all" ? "Vitest + Playwright" : suite} (${mode === "new" ? "new / not-run only" : "full regression"})…`,
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
    ids.map((id) => testOwnerLabel(id)).join(", ");

  const vitestPass = vitestReal.passed;
  const vitestTotal = vitestReal.total;
  const pwPass = suiteStats.playwright.passed;
  const pwTotal = suiteStats.playwright.total;
  const autoPass = vitestPass + pwPass;
  const autoTotal = vitestTotal + pwTotal;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <SprintStatusBars />
      <div className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: "8px" }}>
              <FlaskConical size={22} style={{ color: "var(--bronze)" }} /> Testing Portal
            </h2>
            <p style={{ color: "var(--text-primary)", marginTop: "6px", fontSize: "1rem" }}>
              Select tests with checkboxes to bulk-assign (including Lyriq). Use status buttons to filter.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              className="btn btn-primary suite-run-btn"
              disabled={suiteRunning !== null || loading}
              onClick={() => void runSuite("vitest", "new")}
              title="Run Vitest for new / not-run cases only. Failures create VT-FAIL-* cases in the current sprint."
            >
              <Play size={14} />
              <span className="suite-run-btn__label">
                {suiteRunning === "vitest" ? "Running Vitest…" : "Run Vitest"}
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
              title="Run Playwright for new / not-run cases only. Failures create PW-FAIL-* cases in the current sprint."
            >
              <Play size={14} />
              <span className="suite-run-btn__label">
                {suiteRunning === "playwright" ? "Running Playwright…" : "Run Playwright"}
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
                {suiteRunning === "all" ? "Running both…" : "Run both"}
                <span className="suite-run-btn__count">
                  {countWithPct(autoPass, autoTotal, " passed")}
                </span>
              </span>
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={async () => {
                if (!confirm("Reset all test statuses in the database?")) return;
                try {
                  await resetTestStatuses();
                  setStatuses({});
                  setNotes({});
                  setAssigneeOverrides({});
                  setSprintByCase({});
                } catch (e) {
                  setError(e instanceof ApiError ? e.message : "Failed to reset statuses.");
                }
              }}
            >
              <RotateCcw size={14} /> Reset statuses
            </button>
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

        {runLog && (
          <pre
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(148,125,100,0.08)",
              border: "1px solid var(--border-color)",
              color: "var(--charcoal)",
              fontSize: "0.9375rem",
              whiteSpace: "pre-wrap",
              maxHeight: 180,
              overflow: "auto",
            }}
          >
            {runLog}
          </pre>
        )}

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
        {loading && <p style={{ marginTop: 12, color: "var(--text-primary)" }}>Loading statuses from database…</p>}

        <div className="qa-categories-panel" data-testid="qa-categories-panel">
          <button
            type="button"
            className="qa-section-heading qa-categories-panel__toggle"
            onClick={() => setCategoriesOpen((o) => !o)}
            aria-expanded={categoriesOpen}
          >
            {categoriesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="qa-categories-panel__title">Categories</span>
            {categoryFilters.size > 0 ? (
              <span className="qa-categories-panel__active">
                — {[...categoryFilters].map((c) => TEST_CATEGORY_LABELS[c]).join(", ")}
              </span>
            ) : (
              <span className="qa-categories-panel__hint">— multi-select · Shift+click range</span>
            )}
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
                  · {countWithPct(completedCases, COUNTABLE_CASES.length)}
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
                Wizard FMSH inventory rows (~972) are excluded from all portal totals. Vitest shows real it() counts
                ({countWithPct(vitestReal.passed, vitestReal.total)}).
              </p>
            </div>
          )}
        </div>

        <div
          className="qa-owner-split"
          style={{
            marginTop: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px 20px",
            alignItems: "start",
          }}
        >
          <div>
            <div className="qa-section-heading">
              Manual QA Testers — multi-select (Shift+click range)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <FilterChip
                active={testerFilters.size === 0}
                onToggle={() => {
                  setTesterFilters(new Set());
                  lastTesterIdx.current = null;
                }}
                title="Clear tester filter"
              >
                All testers
              </FilterChip>
              {testerStats.map((tester) => {
                const active = testerFilters.has(tester.id);
                return (
                  <FilterChip
                    key={tester.id}
                    active={active}
                    accent={tester.accent}
                    title={`${tester.name} — Shift+click to select a range`}
                    onToggle={(e) => toggleTesterFilter(tester.id, e)}
                  >
                    <span className="qa-tester-dot" style={{ background: tester.accent }} />
                    {tester.shortName}
                    <span className="qa-tester-meta">· {countWithPct(tester.done, tester.total)}</span>
                  </FilterChip>
                );
              })}
            </div>
          </div>
          <div>
            <div className="qa-section-heading">
              Automated suite owners — multi-select
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              {suiteOwnerStats.map((owner) => {
                const active = suiteFilters.has(owner.id);
                return (
                  <FilterChip
                    key={owner.id}
                    active={active}
                    accent={owner.accent}
                    title={
                      owner.id === "vitest"
                        ? `Real Vitest suite: ${countWithPct(owner.passed, owner.total, " passed")}${vitestReal.at ? ` · last run ${new Date(vitestReal.at).toLocaleString()}` : ""}`
                        : `${owner.name} — Shift+click for range`
                    }
                    onToggle={(e) => toggleSuiteFilter(owner.id, e)}
                  >
                    <span className="qa-tester-dot" style={{ background: owner.accent }} />
                    {owner.shortName}
                    <span className="qa-tester-meta">
                      · {countWithPct(owner.passed, owner.total, " passed")}
                    </span>
                  </FilterChip>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <div className="qa-section-heading">
            Sprint — multi-select (Shift+click range · checkboxes)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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
                · {countWithPct(completedCases, COUNTABLE_CASES.length)}
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
              return (
                <FilterChip
                  key={s.index}
                  active={sprintFilters.has(s.index)}
                  title={`${s.rangeLabel} — Shift+click to select a range`}
                  onToggle={(e) => toggleSprintFilter(s.index, e)}
                >
                  {s.label}
                  <span className="qa-tester-meta">
                    · {countWithPct(stats.done, stats.total)}
                  </span>
                </FilterChip>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <div className="qa-section-heading">
            Status — multi-select (Shift+click range)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
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
              return (
                <FilterChip
                  key={s}
                  active={active}
                  accent={STATUS_COLOR[s]}
                  title={`${STATUS_LABELS[s]} — Shift+click to select a range`}
                  onToggle={(e) => toggleStatusFilter(s, e)}
                >
                  <span className="qa-tester-dot" style={{ background: STATUS_COLOR[s] }} />
                  {STATUS_LABELS[s]}
                  <span className="qa-tester-meta">
                    · {counts[s] ?? 0} · {pctComplete(counts[s] ?? 0, counts.total)}
                  </span>
                </FilterChip>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <div className="qa-section-heading">
            Test suites — multi-select (Shift+click range)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(() => {
              const allPassed =
                suiteStats.manual.passed + suiteStats.vitest.passed + suiteStats.playwright.passed;
              const allTotal =
                suiteStats.manual.total + suiteStats.vitest.total + suiteStats.playwright.total;
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
              const stats = suiteStats[suite];
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
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            border: "1px solid var(--bronze)",
            background: "rgba(215,198,151,0.25)",
          }}
        >
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--charcoal)" }}>
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={bulkBusy}
            style={{ padding: "6px 12px", fontSize: "0.9375rem", background: "#2e7d32", borderColor: "#2e7d32" }}
            onClick={() => void bulkAssign("lyriq")}
          >
            Assign Lyriq
          </button>
          {QA_TESTERS.filter((t) => t.id !== "lyriq").map((tester) => (
            <button
              key={tester.id}
              type="button"
              className="btn btn-outline"
              disabled={bulkBusy}
              style={{ padding: "6px 12px", fontSize: "0.9375rem" }}
              onClick={() => void bulkAssign(tester.id)}
            >
              Assign {tester.shortName}
            </button>
          ))}
          <button type="button" className="btn btn-outline" onClick={() => setSelectedIds(new Set())}>
            Clear selection
          </button>
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

      {(testerFilters.size > 0 ||
        suiteFilters.size > 0 ||
        sprintFilters.size > 0 ||
        statusFilters.size > 0 ||
        categoryFilters.size > 0) && (
        <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary)" }}>
          Showing {filtered.length} case{filtered.length === 1 ? "" : "s"}
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
          const st = statuses[t.id] ?? "not_run";
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
                  title={automated ? "Automated tests keep locked owners" : "Select for bulk assign"}
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
                  disabled={isSaving(t.id)}
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
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
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
                  </div>
                  <ol style={{ margin: "10px 0", paddingLeft: 18, color: "var(--text-primary)", fontSize: "1rem", lineHeight: 1.55 }}>
                    {t.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                  <p style={{ fontSize: "1rem", color: "var(--charcoal)" }}>
                    <strong>Expected:</strong> {t.expected}
                  </p>
                  <label style={{ display: "grid", gap: 6, marginTop: 12, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                    Notes{" "}
                    {statusRequiresNote(st) ? (
                      <span style={{ color: "var(--crimson)" }}>
                        (required for {STATUS_LABELS[st]} — explain the failure or blocker)
                      </span>
                    ) : (
                      <span>(optional for Pass / In Progress / Not Run)</span>
                    )}
                    <textarea
                      id={`test-note-${t.id}`}
                      className="text-input"
                      rows={3}
                      value={notes[t.id] ?? ""}
                      onChange={(e) => markNoteDirty(t.id, e.target.value)}
                      onBlur={() => void saveNotes(t.id)}
                      placeholder={
                        statusRequiresNote(st)
                          ? "Required: describe what failed or what is blocking (steps + actual result)."
                          : "Optional notes for this test. Saves when you leave this box or click Save note."
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
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "6px 12px", fontSize: "0.9375rem" }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => void saveNotes(t.id)}
                      disabled={isSaving(t.id)}
                    >
                      Save note
                    </button>
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`btn ${st === s ? "btn-primary" : "btn-outline"}`}
                        style={{ padding: "6px 12px", fontSize: "0.9375rem" }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => void setStatus(t.id, s)}
                        disabled={isSaving(t.id)}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
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
