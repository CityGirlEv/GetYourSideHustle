import { useEffect, useMemo, useRef, useState } from "react";
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
} from "../../lib/gysh-test-plan";
import {
  AUTOMATED_VITEST_CASES,
  AUTOMATED_PLAYWRIGHT_CASES,
  isAutomatedTestId,
} from "../../lib/gysh-automated-tests";
import {
  AUTOMATED_SUITE_OWNERS,
  QA_TESTERS,
  isHumanQaTester,
  testOwnerLabel,
  type QaTesterId,
  type TestOwnerId,
} from "../../lib/gysh-roles";
import { listUpcomingSprints, sprintLabel, BACKLOG_SPRINT } from "../../lib/gysh-sprints";
import { ApiError } from "../../lib/api";
import { suggestedSprintForTest } from "../../lib/gysh-sprint-board";
import { SprintStatusBars } from "./SprintStatusBars";

const STATUSES: TestStatus[] = ["not_run", "in_progress", "pass", "fail", "blocked"];

const STATUS_COLOR: Record<TestStatus, string> = {
  not_run: "var(--text-muted)",
  in_progress: "var(--bronze)",
  pass: "var(--accent-emerald)",
  fail: "var(--crimson)",
  blocked: "#a16207",
};

const ALL_CASES = [
  ...withDefaultSuite(TEST_CASES),
  ...AUTOMATED_VITEST_CASES,
  ...AUTOMATED_PLAYWRIGHT_CASES,
];

const SUITE_OPTIONS: Array<TestSuite | "all"> = ["all", "manual", "vitest", "playwright"];

export function TestingPortal({
  focusTestId = null,
  onFocusConsumed,
}: {
  focusTestId?: string | null;
  onFocusConsumed?: () => void;
} = {}) {
  const [statuses, setStatuses] = useState<Record<string, TestStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [assigneeOverrides, setAssigneeOverrides] = useState<Record<string, string>>({});
  const [sprintByCase, setSprintByCase] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [categoryFilters, setCategoryFilters] = useState<Set<TestCategory>>(() => new Set());
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [statusFilters, setStatusFilters] = useState<Set<TestStatus>>(() => new Set());
  const [testerFilter, setTesterFilter] = useState<QaTesterId | null>(null);
  const [suiteFilter, setSuiteFilter] = useState<TestSuite | "all">("manual");
  const [sprintFilter, setSprintFilter] = useState<number | "all" | "backlog">("all");
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
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

  const effectiveSprint = (t: (typeof ALL_CASES)[number]) =>
    sprintByCase[t.id] ?? suggestedSprintForTest(t);

  const applyServerData = (
    data: {
      statuses: Record<string, TestStatus>;
      notes: Record<string, string>;
      assignees: Record<string, string>;
      sprints: Record<string, number>;
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
    setTesterFilter(null);
    setSuiteFilter("all");
    setSprintFilter("all");
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
    () => ["all", ...Array.from(new Set(ALL_CASES.map((t) => t.area)))],
    [],
  );

  /** Effective assignees: humans for manual; suite owners for automated (D1 human override ignored). */
  const effectiveAssignees = (t: (typeof ALL_CASES)[number]): TestOwnerId[] => {
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
    const manual = ALL_CASES.filter((t) => t.suite === "manual");
    return QA_TESTERS.map((tester) => {
      const cases = manual.filter((t) => effectiveAssignees(t).includes(tester.id));
      const done = cases.filter((t) => isCaseComplete(t.id)).length;
      return { ...tester, total: cases.length, done };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- effectiveAssignees derives from assigneeOverrides
  }, [statuses, assigneeOverrides]);

  const suiteOwnerStats = useMemo(() => {
    return AUTOMATED_SUITE_OWNERS.map((owner) => {
      const cases = ALL_CASES.filter(
        (t) => t.suite === owner.id && effectiveAssignees(t).includes(owner.id),
      );
      const done = cases.filter((t) => isCaseComplete(t.id)).length;
      return { ...owner, total: cases.length, done };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- effectiveAssignees is pure over ALL_CASES
  }, [statuses]);

  const suiteStats = useMemo(() => {
    const counts: Record<TestSuite, { done: number; total: number }> = {
      manual: { done: 0, total: 0 },
      vitest: { done: 0, total: 0 },
      playwright: { done: 0, total: 0 },
    };
    for (const t of ALL_CASES) {
      counts[t.suite].total += 1;
      if (isCaseComplete(t.id)) counts[t.suite].done += 1;
    }
    return counts;
  }, [statuses]);

  const categoryStats = useMemo(() => {
    const counts: Partial<Record<TestCategory, { done: number; total: number }>> = {};
    for (const t of ALL_CASES) {
      const cat = categoryForCase(t);
      const cur = counts[cat] ?? { done: 0, total: 0 };
      cur.total += 1;
      if (isCaseComplete(t.id)) cur.done += 1;
      counts[cat] = cur;
    }
    return counts;
  }, [statuses]);

  const sprintStats = useMemo(() => {
    const bySprint = new Map<number, { done: number; total: number }>();
    let backlog = { done: 0, total: 0 };
    for (const t of ALL_CASES) {
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
  }, [statuses, sprintByCase]);

  const completedCases = useMemo(
    () => ALL_CASES.filter((t) => isCaseComplete(t.id)).length,
    [statuses],
  );

  const filtered = ALL_CASES.filter((t) => {
    const st = statuses[t.id] ?? "not_run";
    const cat = categoryForCase(t);
    if (categoryFilters.size > 0 && !categoryFilters.has(cat)) return false;
    if (areaFilter !== "all" && t.area !== areaFilter) return false;
    if (statusFilters.size > 0 && !statusFilters.has(st)) return false;
    if (testerFilter && !effectiveAssignees(t).includes(testerFilter)) return false;
    if (suiteFilter !== "all" && t.suite !== suiteFilter) return false;
    if (sprintFilter === "backlog") {
      if (effectiveSprint(t) !== BACKLOG_SPRINT) return false;
    } else if (sprintFilter !== "all" && effectiveSprint(t) !== sprintFilter) {
      return false;
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

  const toggleCategoryFilter = (cat: TestCategory) => {
    setCategoryFilters((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const counts = ALL_CASES.reduce(
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
    setStatuses((s) => ({ ...s, [id]: status }));
    try {
      const data = await saveTestStatus(
        id,
        status,
        note,
        persistedAssignee(id),
        persistedSprint(id),
      );
      if (!endSave(id, gen)) return;
      applyServerData(data, id);
      setSaveFlash(`${id} → ${STATUS_LABELS[status]} saved`);
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

  const toggleStatusFilter = (status: TestStatus) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const filteredIds = filtered.map((t) => t.id);
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

  const runSuite = async (suite: AutomatedSuite) => {
    setSuiteRunning(suite);
    setError("");
    setRunLog(`Running ${suite === "all" ? "Vitest + Playwright" : suite}…`);
    try {
      const result = await runAutomatedSuite(suite);
      setRunLog(
        [result.summary, ...result.details, `Local full suite: ${result.commands.vitest} · ${result.commands.playwright}`].join(
          "\n",
        ),
      );
      if (!result.ok) {
        setError(result.summary);
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <SprintStatusBars />
      <div className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", color: "var(--charcoal)", display: "flex", alignItems: "center", gap: "8px" }}>
              <FlaskConical size={22} style={{ color: "var(--bronze)" }} /> Testing Portal
            </h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "0.9rem" }}>
              Select tests with checkboxes to bulk-assign (including Lyriq). Use status buttons to filter.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={suiteRunning !== null || loading}
              onClick={() => void runSuite("vitest")}
              title="Run portal Vitest checks and update automated Vitest / wizard matrix statuses"
            >
              <Play size={14} /> {suiteRunning === "vitest" ? "Running Vitest…" : "Run Vitest"}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={suiteRunning !== null || loading}
              onClick={() => void runSuite("playwright")}
              title="Run live HTTP smoke checks and update Playwright case statuses"
            >
              <Play size={14} /> {suiteRunning === "playwright" ? "Running Playwright…" : "Run Playwright"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              disabled={suiteRunning !== null || loading}
              onClick={() => void runSuite("all")}
              title="Run Vitest + Playwright portal checks"
            >
              {suiteRunning === "all" ? "Running both…" : "Run both"}
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

        {runLog && (
          <pre
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(148,125,100,0.08)",
              border: "1px solid var(--border-color)",
              color: "var(--charcoal)",
              fontSize: "0.78rem",
              whiteSpace: "pre-wrap",
              maxHeight: 180,
              overflow: "auto",
            }}
          >
            {runLog}
          </pre>
        )}

        {error && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(155,47,40,0.1)", border: "1px solid rgba(155,47,40,0.35)", color: "#9B2F28", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}
        {saveFlash && !error && (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "rgba(46,125,50,0.1)", border: "1px solid rgba(46,125,50,0.35)", color: "#2e7d32", fontSize: "0.85rem" }}>
            {saveFlash}
          </div>
        )}
        {loading && <p style={{ marginTop: 12, color: "var(--text-muted)" }}>Loading statuses from database…</p>}

        <div className="qa-categories-panel" data-testid="qa-categories-panel">
          <button
            type="button"
            className="qa-categories-panel__toggle"
            onClick={() => setCategoriesOpen((o) => !o)}
            aria-expanded={categoriesOpen}
          >
            {categoriesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="qa-categories-panel__title">Categories</span>
            {categoryFilters.size > 0 ? (
              <span className="qa-categories-panel__active">
                {[...categoryFilters].map((c) => TEST_CATEGORY_LABELS[c]).join(", ")}
              </span>
            ) : (
              <span className="qa-categories-panel__hint">click to filter (multi)</span>
            )}
          </button>
          {categoriesOpen && (
            <div className="qa-categories-panel__bubbles">
              <button
                type="button"
                className="qa-tester-bubble qa-categories-panel__bubble"
                data-active={categoryFilters.size === 0 ? "true" : "false"}
                onClick={() => setCategoryFilters(new Set())}
              >
                All categories
                <span className="qa-tester-meta">
                  · {completedCases}/{ALL_CASES.length}
                </span>
              </button>
              {TEST_CATEGORIES.map((cat) => {
                const active = categoryFilters.has(cat);
                const stats = categoryStats[cat];
                if (!stats || stats.total === 0) return null;
                return (
                  <button
                    key={cat}
                    type="button"
                    className="qa-tester-bubble qa-categories-panel__bubble"
                    data-active={active ? "true" : "false"}
                    onClick={() => toggleCategoryFilter(cat)}
                    title={TEST_CATEGORY_LABELS[cat]}
                  >
                    {TEST_CATEGORY_LABELS[cat]}
                    <span className="qa-tester-meta">
                      · {stats.done}/{stats.total}
                    </span>
                  </button>
                );
              })}
              <p className="qa-categories-panel__note">Wizard FMSH matrices are automated (Vitest).</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
            Manual QA Testers — click to filter (manual suite only)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {testerStats.map((tester) => {
              const active = testerFilter === tester.id;
              return (
                <button
                  key={tester.id}
                  type="button"
                  onClick={() => {
                    setTesterFilter(active ? null : tester.id);
                    if (!active) setSuiteFilter("manual");
                  }}
                  title={`${tester.name} — manual cases only`}
                  className="qa-tester-bubble"
                  data-active={active ? "true" : "false"}
                  style={{
                    borderColor: active ? tester.accent : undefined,
                    boxShadow: active ? `0 0 0 1px ${tester.accent}` : undefined,
                  }}
                >
                  <span className="qa-tester-dot" style={{ background: tester.accent }} />
                  {tester.shortName}
                  <span className="qa-tester-meta">· {tester.done}/{tester.total}</span>
                </button>
              );
            })}
            {testerFilter && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                onClick={() => setTesterFilter(null)}
              >
                Show all assignees
              </button>
            )}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "12px 0 8px" }}>
            Automated suite owners — status only (not assigned to human testers)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {suiteOwnerStats.map((owner) => {
              const active = suiteFilter === owner.id;
              return (
                <button
                  key={owner.id}
                  type="button"
                  onClick={() => {
                    setTesterFilter(null);
                    setSuiteFilter(active ? "all" : owner.id);
                  }}
                  title={`${owner.name} runs these tests`}
                  className="qa-tester-bubble"
                  data-active={active ? "true" : "false"}
                  style={{
                    borderColor: active ? owner.accent : undefined,
                    boxShadow: active ? `0 0 0 1px ${owner.accent}` : undefined,
                  }}
                >
                  <span className="qa-tester-dot" style={{ background: owner.accent }} />
                  {owner.shortName}
                  <span className="qa-tester-meta">· {owner.done}/{owner.total}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
            Sprint — click to filter
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="qa-tester-bubble"
              data-active={sprintFilter === "all" ? "true" : "false"}
              onClick={() => setSprintFilter("all")}
            >
              All sprints
              <span className="qa-tester-meta">
                · {completedCases}/{ALL_CASES.length}
              </span>
            </button>
            <button
              type="button"
              className="qa-tester-bubble"
              data-active={sprintFilter === "backlog" ? "true" : "false"}
              onClick={() => setSprintFilter("backlog")}
            >
              Backlog
              <span className="qa-tester-meta">
                · {sprintStats.backlog.done}/{sprintStats.backlog.total}
              </span>
            </button>
            {sprints.map((s) => {
              const stats = sprintStats.bySprint.get(s.index) ?? { done: 0, total: 0 };
              return (
                <button
                  key={s.index}
                  type="button"
                  className="qa-tester-bubble"
                  data-active={sprintFilter === s.index ? "true" : "false"}
                  onClick={() => setSprintFilter(s.index)}
                  title={s.rangeLabel}
                >
                  {s.label}
                  <span className="qa-tester-meta">
                    · {stats.done}/{stats.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
            Status — click to filter (multi)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              className="qa-tester-bubble"
              data-active={statusFilters.size === 0 ? "true" : "false"}
              onClick={() => setStatusFilters(new Set())}
            >
              All statuses
              <span className="qa-tester-meta">
                · {completedCases}/{counts.total}
              </span>
            </button>
            {STATUSES.map((s) => {
              const active = statusFilters.has(s);
              return (
                <button
                  key={s}
                  type="button"
                  className="qa-tester-bubble"
                  data-active={active ? "true" : "false"}
                  onClick={() => toggleStatusFilter(s)}
                  style={{
                    borderColor: active ? STATUS_COLOR[s] : undefined,
                    boxShadow: active ? `0 0 0 1px ${STATUS_COLOR[s]}` : undefined,
                  }}
                >
                  <span className="qa-tester-dot" style={{ background: STATUS_COLOR[s] }} />
                  {STATUS_LABELS[s]}
                  <span className="qa-tester-meta">· {counts[s] ?? 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
            Test suites
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUITE_OPTIONS.map((suite) => {
              const active = suiteFilter === suite;
              const stats =
                suite === "all"
                  ? { done: completedCases, total: ALL_CASES.length }
                  : suiteStats[suite];
              const label = suite === "all" ? "All suites" : SUITE_LABELS[suite];
              return (
                <button
                  key={suite}
                  type="button"
                  className="qa-tester-bubble"
                  data-active={active ? "true" : "false"}
                  onClick={() => setSuiteFilter(active && suite !== "all" ? "all" : suite)}
                >
                  {label}
                  <span className="qa-tester-meta">
                    · {stats.done}/{stats.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", marginTop: "18px" }}>
          {(["total", ...STATUSES] as const).map((k) => {
            const isTotal = k === "total";
            const active = isTotal ? statusFilters.size === 0 : statusFilters.has(k);
            return (
              <button
                key={k}
                type="button"
                className="glass"
                onClick={() => {
                  if (isTotal) setStatusFilters(new Set());
                  else toggleStatusFilter(k);
                }}
                style={{
                  padding: "12px",
                  textAlign: "center",
                  background: active ? "rgba(215,198,151,0.4)" : "#fff",
                  border: active ? "1px solid var(--bronze)" : "1px solid var(--border-color)",
                  cursor: "pointer",
                  borderRadius: 12,
                }}
              >
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {isTotal ? "Complete / Total" : STATUS_LABELS[k]}
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: isTotal ? "var(--charcoal)" : STATUS_COLOR[k] }}>
                  {isTotal ? `${completedCases}/${counts.total}` : counts[k] ?? 0}
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
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--charcoal)" }}>
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={bulkBusy}
            style={{ padding: "6px 12px", fontSize: "0.8rem", background: "#2e7d32", borderColor: "#2e7d32" }}
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
              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
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
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.85rem", color: "var(--charcoal)" }}>
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
          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
          disabled={filteredIds.length === 0}
          onClick={() => setOpenIds(new Set(filteredIds))}
        >
          Expand all visible
        </button>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
          onClick={() => setOpenIds(new Set())}
        >
          Collapse all
        </button>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
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

      {(testerFilter || suiteFilter !== "all" || statusFilters.size > 0 || categoryFilters.size > 0) && (
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Showing {filtered.length} case{filtered.length === 1 ? "" : "s"}
          {testerFilter && (
            <>
              {" "}for <strong style={{ color: "var(--charcoal)" }}>
                {QA_TESTERS.find((t) => t.id === testerFilter)?.name}
              </strong>
            </>
          )}
          {suiteFilter !== "all" && (
            <>
              {" "}in <strong style={{ color: "var(--charcoal)" }}>{SUITE_LABELS[suiteFilter]}</strong>
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
              className="glass"
              style={{
                borderRadius: "12px",
                borderLeft: `4px solid ${STATUS_COLOR[st]}`,
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
                  onClick={() =>
                    setOpenIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(t.id)) next.delete(t.id);
                      else next.add(t.id);
                      return next;
                    })
                  }
                  className="test-case-row"
                  style={{ flex: 1 }}
                >
                  {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="flat-label flat-label--id">{t.id}</span>
                  <span className="flat-label flat-label--priority">{PRIORITY_LABELS[t.priority]}</span>
                  <span className="flat-label flat-label--suite">{SUITE_LABELS[t.suite]}</span>
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
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
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
                    fontSize: "0.9rem",
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
              </div>
              {open && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border-color)" }}>
                  <p style={{ marginTop: 12, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Roles: {t.roles.join(", ")} · Assignees: {testerLabel(effectiveAssignees(t))}
                    {automated && " · Automated (owner locked)"}
                  </p>
                  {!automated && (
                    <label
                      style={{
                        display: "grid",
                        gridTemplateColumns: "88px minmax(0, 1fr)",
                        gap: 10,
                        alignItems: "center",
                        marginTop: 8,
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                      }}
                    >
                      Assign to
                      <select
                        className="text-input"
                        style={{ width: "100%", minWidth: 0, padding: "8px 12px", fontSize: "0.9rem" }}
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
                      display: "grid",
                      gridTemplateColumns: "88px minmax(0, 1fr)",
                      gap: 10,
                      alignItems: "center",
                      marginTop: 8,
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    Sprint
                    <select
                      className="text-input"
                      style={{ width: "100%", minWidth: 0, padding: "8px 12px", fontSize: "0.9rem" }}
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
                  <ol style={{ margin: "10px 0", paddingLeft: 18, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.55 }}>
                    {t.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                  <p style={{ fontSize: "0.9rem", color: "var(--charcoal)" }}>
                    <strong>Expected:</strong> {t.expected}
                  </p>
                  <label style={{ display: "grid", gap: 6, marginTop: 12, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
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
                      style={{ padding: "6px 12px", fontSize: "0.8rem" }}
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
                        style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => void setStatus(t.id, s)}
                        disabled={isSaving(t.id)}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                  {rowErrors[t.id] && (
                    <p style={{ marginTop: 10, fontSize: "0.85rem", color: "#9B2F28" }}>{rowErrors[t.id]}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="glass" style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)" }}>
            No tests match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
