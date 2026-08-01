import { useCallback, useEffect, useMemo, useState } from "react";
import { Columns2, FlaskConical, ListChecks, RotateCcw, Save } from "lucide-react";
import type { AuthUser } from "../../lib/auth";
import { ApiError } from "../../lib/api";
import { BusyOverlay, WaitIndicator, WaitLabel } from "../WaitFeedback";
import { MarkdownLinkText } from "./MarkdownLinkText";
import { taskOpenPageStep } from "../../lib/qa-page-links";
import {
  AUTOMATED_PLAYWRIGHT_CASES,
  AUTOMATED_VITEST_CASES,
  isAutomatedTestId,
  isWizardMatrixCaseId,
} from "../../lib/gysh-automated-tests";
import { isHumanQaTester } from "../../lib/gysh-roles";
import {
  applyPartnerDone,
  assigneeForAuthUser,
  assigneeDisplayLabel,
  fetchTasks,
  persistTasks,
  TASK_STATUS_LABELS,
  taskMatchesAssignee,
  type GyshTask,
  type PartnerAssignee,
  type TaskStatus,
} from "../../lib/gysh-tasks";
import {
  currentSprintIndex,
  getSprintWindow,
  listUpcomingSprints,
  sprintLabel,
} from "../../lib/gysh-sprints";
import {
  fetchClosedSprints,
  isSprintLocked,
  sprintLockedMessage,
} from "../../lib/gysh-closed-sprints";
import { SprintLockedBanner } from "./SprintLockedBanner";
import {
  DEFAULT_TEST_STATUS,
  STATUS_LABELS as TEST_STATUS_LABELS,
  TEST_CASES,
  fetchTestStatuses,
  saveTestStatus,
  withDefaultSuite,
  type TestCase,
  type TestStatus,
} from "../../lib/gysh-test-plan";

type Props = {
  authUser?: AuthUser | null;
  onOpenTaskListView: () => void;
  onOpenTestingPortal: () => void;
};

const HUMAN_STATUSES: TestStatus[] = [
  "not_run",
  "in_progress",
  "pass",
  "conditional_approval",
  "fail",
  "blocked",
];

const TASK_STATUSES = Object.keys(TASK_STATUS_LABELS) as TaskStatus[];

function catalogTests(): TestCase[] {
  return [
    ...withDefaultSuite(TEST_CASES),
    ...AUTOMATED_VITEST_CASES,
    ...AUTOMATED_PLAYWRIGHT_CASES,
  ].filter((t) => !isWizardMatrixCaseId(t.id) && !isAutomatedTestId(t.id));
}

function testMatchesPartner(
  assignee: string,
  caseAssignees: TestCase["assignees"],
  me: PartnerAssignee,
): boolean {
  const id = me.toLowerCase();
  if (assignee && isHumanQaTester(assignee)) return assignee === id;
  return caseAssignees.includes(id as TestCase["assignees"][number]);
}

export function QaSprintSideBySide({
  authUser = null,
  onOpenTaskListView,
  onOpenTestingPortal,
}: Props) {
  const me = assigneeForAuthUser(authUser);
  const [sprint, setSprint] = useState(() => currentSprintIndex());
  const [scopeMine, setScopeMine] = useState(true);
  const [tasks, setTasks] = useState<GyshTask[]>([]);
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({});
  const [testNotes, setTestNotes] = useState<Record<string, string>>({});
  const [testAssignees, setTestAssignees] = useState<Record<string, string>>({});
  const [testSprints, setTestSprints] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  /** Unsaved status edits — persist only on Save all. */
  const [taskStatusDrafts, setTaskStatusDrafts] = useState<Record<string, TaskStatus>>({});
  const [testStatusDrafts, setTestStatusDrafts] = useState<Record<string, TestStatus>>({});
  const [closedSprints, setClosedSprints] = useState<Set<number>>(() => new Set());

  const sprints = useMemo(() => listUpcomingSprints(), []);
  const sw = getSprintWindow(sprint);
  const allTests = useMemo(() => catalogTests(), []);
  const sprintLocked = isSprintLocked(closedSprints, sprint);

  const loadSprintWork = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [taskList, testPayload, closedList] = await Promise.all([
        fetchTasks(),
        fetchTestStatuses(),
        fetchClosedSprints().catch(() => [] as number[]),
      ]);
      setClosedSprints(new Set(closedList));
      setTasks(taskList);
      setTestStatuses(testPayload.statuses);
      setTestNotes(testPayload.notes);
      setTestAssignees(testPayload.assignees);
      setTestSprints(testPayload.sprints);
      setTaskStatusDrafts({});
      setTestStatusDrafts({});
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load sprint work.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSprintWork();
  }, [loadSprintWork]);

  const taskStatusValue = (task: GyshTask): TaskStatus =>
    taskStatusDrafts[task.id] ?? task.status;

  const testStatusValue = (testId: string): TestStatus =>
    testStatusDrafts[testId] ?? testStatuses[testId] ?? DEFAULT_TEST_STATUS;

  const dirtyCount =
    Object.keys(taskStatusDrafts).length + Object.keys(testStatusDrafts).length;

  const stageTaskStatus = (task: GyshTask, status: TaskStatus) => {
    setTaskStatusDrafts((prev) => {
      const next = { ...prev };
      if (status === task.status) delete next[task.id];
      else next[task.id] = status;
      return next;
    });
  };

  const stageTestStatus = (testId: string, status: TestStatus) => {
    const baseline = testStatuses[testId] ?? DEFAULT_TEST_STATUS;
    setTestStatusDrafts((prev) => {
      const next = { ...prev };
      if (status === baseline) delete next[testId];
      else next[testId] = status;
      return next;
    });
  };

  /** Discard unsaved status drafts and set scope filter to All. */
  const resetEdits = () => {
    const hadDrafts = dirtyCount > 0;
    if (!hadDrafts && !scopeMine) return;
    if (hadDrafts) {
      setTaskStatusDrafts({});
      setTestStatusDrafts({});
    }
    setScopeMine(false);
    setFlash(
      hadDrafts
        ? "Reset — unsaved status edits discarded; filter set to All"
        : "Reset — filter set to All",
    );
    window.setTimeout(() => setFlash(""), 2000);
  };

  const myTasks = useMemo(() => {
    return tasks
      .filter((t) => Number(t.sprint) === sprint)
      .filter((t) => !scopeMine || !me || taskMatchesAssignee(t, me))
      .sort((a, b) => {
        const sa = taskStatusDrafts[a.id] ?? a.status;
        const sb = taskStatusDrafts[b.id] ?? b.status;
        if (sa === "done" && sb !== "done") return 1;
        if (sa !== "done" && sb === "done") return -1;
        return a.id.localeCompare(b.id);
      });
  }, [tasks, sprint, scopeMine, me, taskStatusDrafts]);

  const myTests = useMemo(() => {
    return allTests
      .filter((t) => Number(testSprints[t.id]) === sprint)
      .filter((t) => {
        if (!scopeMine || !me) return true;
        const assignee = testAssignees[t.id] || t.assignees[0] || "";
        return testMatchesPartner(assignee, t.assignees, me);
      })
      .sort((a, b) => {
        const sa = testStatusDrafts[a.id] ?? testStatuses[a.id] ?? DEFAULT_TEST_STATUS;
        const sb = testStatusDrafts[b.id] ?? testStatuses[b.id] ?? DEFAULT_TEST_STATUS;
        const aDone = sa === "pass" || sa === "conditional_approval";
        const bDone = sb === "pass" || sb === "conditional_approval";
        if (aDone && !bDone) return 1;
        if (!aDone && bDone) return -1;
        return a.id.localeCompare(b.id);
      });
  }, [allTests, testSprints, testAssignees, testStatuses, testStatusDrafts, sprint, scopeMine, me]);

  const taskOpen = myTasks.filter((t) => taskStatusValue(t) !== "done").length;
  const testOpen = myTests.filter((t) => {
    const st = testStatusValue(t.id);
    return st !== "pass" && st !== "conditional_approval";
  }).length;

  const saveAllDirty = async () => {
    const taskIds = Object.keys(taskStatusDrafts);
    const testIds = Object.keys(testStatusDrafts);
    if (taskIds.length === 0 && testIds.length === 0) {
      setFlash("Nothing to save");
      window.setTimeout(() => setFlash(""), 2000);
      return;
    }
    if (sprintLocked) {
      setError(sprintLockedMessage(sprint));
      return;
    }
    setBusy(true);
    setError("");
    try {
      let workingTasks = tasks;
      if (taskIds.length > 0) {
        workingTasks = tasks.map((t) => {
          const status = taskStatusDrafts[t.id];
          if (!status) return t;
          return applyPartnerDone(t, {
            status,
            ...(status === "done" && t.assignedTo === "Both"
              ? { tinaDone: true, evelynDone: true }
              : {}),
          });
        });
        workingTasks = await persistTasks(workingTasks);
        setTasks(workingTasks);
        setTaskStatusDrafts({});
      }
      for (const testId of testIds) {
        const status = testStatusDrafts[testId];
        if (!status) continue;
        const test = allTests.find((t) => t.id === testId);
        if (!test) continue;
        const note = testNotes[testId] ?? "";
        const assignee = testAssignees[testId] || test.assignees[0] || "";
        const stepCount = Array.isArray(test.steps) ? test.steps.length : 0;
        const data = await saveTestStatus(
          testId,
          status,
          (status === "pass" || status === "conditional_approval") && !note.trim()
            ? status === "conditional_approval"
              ? "Conditional approval from sprint side-by-side — add conditions in Testing Portal"
              : "Updated from sprint side-by-side"
            : note,
          assignee,
          sprint,
          status === "pass" && stepCount > 0
            ? {
                stepCount,
                checkedSteps: Array.from({ length: stepCount }, () => true),
              }
            : undefined,
        );
        setTestStatuses(data.statuses);
        setTestNotes(data.notes);
        setTestAssignees(data.assignees);
        setTestSprints(data.sprints);
      }
      if (testIds.length > 0) setTestStatusDrafts({});
      const n = taskIds.length + testIds.length;
      setFlash(`Saved ${n} status${n === 1 ? "" : "es"}`);
      window.setTimeout(() => setFlash(""), 2000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <BusyOverlay
        active={busy || loading}
        message={loading ? "Loading sprint work…" : "Saving…"}
      />
      <div className="glass" style={{ padding: 20, borderRadius: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.45rem",
                color: "var(--charcoal)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                margin: 0,
              }}
            >
              <Columns2 size={22} style={{ color: "var(--bronze)" }} />
              Sprint side-by-side
            </h2>
            <p style={{ margin: "6px 0 0", color: "var(--text-primary)", fontSize: "0.95rem" }}>
              Your tasks and tests for {sprintLabel(sprint)} ({sw.numericRangeLabel}
              ){me ? ` · ${me}` : ""}
              {sprintLocked ? " · Closed & locked" : ""}.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {sprintLocked ? <SprintLockedBanner size={12} /> : null}
            <button type="button" className="btn btn-outline" onClick={onOpenTestingPortal}>
              <FlaskConical size={14} /> Testing Portal
            </button>
            <button type="button" className="btn btn-outline" onClick={onOpenTaskListView}>
              <ListChecks size={14} /> Task list view
            </button>
            <button
              type="button"
              className="btn btn-primary qa-save-btn--ready"
              onClick={() => void saveAllDirty()}
              disabled={loading || busy || dirtyCount === 0 || sprintLocked}
              title={
                sprintLocked
                  ? sprintLockedMessage(sprint)
                  : dirtyCount > 0
                  ? "Save all unsaved status edits"
                  : "No unsaved changes"
              }
              aria-label={
                dirtyCount > 0
                  ? `Save all ${dirtyCount} unsaved status edits`
                  : "Save unavailable — no unsaved changes"
              }
            >
              {busy ? (
                <WaitLabel>Saving…</WaitLabel>
              ) : (
                <>
                  <Save size={14} /> Save all{dirtyCount > 0 ? ` (${dirtyCount})` : ""}
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={resetEdits}
              disabled={loading || busy || (dirtyCount === 0 && !scopeMine)}
              title={
                dirtyCount > 0 || scopeMine
                  ? "Discard unsaved status edits and set filter to All"
                  : "Nothing to reset — filter already All, no unsaved changes"
              }
              aria-label={
                dirtyCount > 0 || scopeMine
                  ? "Reset unsaved status edits and set filter to All"
                  : "Reset unavailable — nothing to clear"
              }
            >
              <RotateCcw size={14} /> Re-Set
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "end",
          }}
        >
          <label className="form-group" style={{ margin: 0, minWidth: 160 }}>
            <span className="form-label">Sprint</span>
            <select
              className="select-input"
              value={sprint}
              onChange={(e) => setSprint(Number(e.target.value))}
            >
              {sprints.map((s) => (
                <option key={s.index} value={s.index}>
                  {s.label} · {s.numericRangeLabel}
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              className={scopeMine ? "btn btn-primary" : "btn btn-outline"}
              onClick={() => setScopeMine(true)}
              disabled={!me}
              title={me ? `Show ${me}'s work` : "Sign in as Tina, Evelyn, or Lyriq"}
            >
              Mine{me ? ` (${me})` : ""}
            </button>
            <button
              type="button"
              className={!scopeMine ? "btn btn-primary" : "btn btn-outline"}
              onClick={() => setScopeMine(false)}
            >
              Everyone
            </button>
          </div>
          <span style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 600 }}>
            Open: {testOpen} tests · {taskOpen} tasks
          </span>
          {flash && (
            <span style={{ fontSize: "0.9rem", color: "#2e7d32", fontWeight: 700 }}>{flash}</span>
          )}
        </div>
        {error && (
          <p style={{ marginTop: 10, color: "#9B2F28", fontWeight: 600 }} role="alert">
            {error}
          </p>
        )}
      </div>

      {loading ? (
        <WaitIndicator message="Loading tasks & tests…" />
      ) : (
        <div
          className="qa-sprint-side-by-side"
          data-testid="qa-sprint-side-by-side"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 14,
            alignItems: "start",
          }}
        >
          <section className="glass" style={{ padding: 16, borderRadius: 14, minWidth: 0 }}>
            <h3
              style={{
                margin: "0 0 10px",
                fontSize: "1.05rem",
                color: "#3a1410",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderLeft: "4px solid #9b2f28",
                background: "linear-gradient(90deg, rgba(155,47,40,0.12), transparent)",
              }}
            >
              <FlaskConical size={18} /> Tests ({myTests.length})
            </h3>
            {myTests.length === 0 ? (
              <p style={{ color: "var(--text-primary)", margin: 0 }}>
                No tests in this sprint for this filter.
              </p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {myTests.map((t) => {
                  const st = testStatusValue(t.id);
                  return (
                    <li
                      key={t.id}
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
                      >
                        <span className="flat-label flat-label--id">{t.id}</span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          {t.area} · {t.priority}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "6px 0 8px",
                          color: "var(--charcoal)",
                          fontSize: "0.95rem",
                          lineHeight: 1.35,
                        }}
                      >
                        {t.title}
                      </p>
                      {t.steps[0] && (
                        <p
                          style={{
                            margin: "0 0 8px",
                            color: "var(--text-primary)",
                            fontSize: "0.875rem",
                            lineHeight: 1.35,
                          }}
                        >
                          <strong style={{ marginRight: 4 }}>1.</strong>
                          <MarkdownLinkText text={t.steps[0]} />
                        </p>
                      )}
                      <label
                        style={{
                          display: "grid",
                          gridTemplateColumns: "70px 1fr",
                          gap: 8,
                          alignItems: "center",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        Status
                        <select
                          className="select-input"
                          value={st}
                          disabled={busy || sprintLocked}
                          title={sprintLocked ? sprintLockedMessage(sprint) : undefined}
                          onChange={(e) =>
                            stageTestStatus(t.id, e.target.value as TestStatus)
                          }
                          aria-label={`Status for ${t.id}`}
                        >
                          {HUMAN_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {TEST_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="glass" style={{ padding: 16, borderRadius: 14, minWidth: 0 }}>
            <h3
              style={{
                margin: "0 0 10px",
                fontSize: "1.05rem",
                color: "#3a1410",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderLeft: "4px solid #9b2f28",
                background: "linear-gradient(90deg, rgba(155,47,40,0.12), transparent)",
              }}
            >
              <ListChecks size={18} /> Tasks ({myTasks.length})
            </h3>
            {myTasks.length === 0 ? (
              <p style={{ color: "var(--text-primary)", margin: 0 }}>
                No tasks in this sprint for this filter.
              </p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {myTasks.map((t) => (
                  <li
                    key={t.id}
                    style={{
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span className="flat-label flat-label--id">{t.id}</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {assigneeDisplayLabel(t.assignedTo)} · Due {t.dueDate || "—"}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "6px 0 8px",
                        color: "var(--charcoal)",
                        fontSize: "0.95rem",
                        lineHeight: 1.35,
                      }}
                    >
                      {t.description}
                    </p>
                    {(() => {
                      const openStep = taskOpenPageStep(t);
                      if (!openStep) return null;
                      return (
                        <p
                          style={{
                            margin: "0 0 8px",
                            color: "var(--text-primary)",
                            fontSize: "0.875rem",
                            lineHeight: 1.35,
                          }}
                        >
                          <strong style={{ marginRight: 4 }}>1.</strong>
                          <MarkdownLinkText text={openStep} />
                        </p>
                      );
                    })()}
                    <label
                      style={{
                        display: "grid",
                        gridTemplateColumns: "70px 1fr",
                        gap: 8,
                        alignItems: "center",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      Status
                      <select
                        className="select-input"
                        value={taskStatusValue(t)}
                        disabled={busy || sprintLocked}
                        title={sprintLocked ? sprintLockedMessage(sprint) : undefined}
                        onChange={(e) =>
                          stageTaskStatus(t, e.target.value as TaskStatus)
                        }
                        aria-label={`Status for ${t.id}`}
                      >
                        {TASK_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {TASK_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>
</div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .qa-sprint-side-by-side {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
