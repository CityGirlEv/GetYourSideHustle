import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Flag, RotateCcw, X } from "lucide-react";
import { TASK_STATUS_LABELS, type GyshTask } from "../../lib/gysh-tasks";
import {
  getSprintWindow,
  sprintLabel,
  type PlanItem,
} from "../../lib/gysh-sprints";
import {
  STATUS_LABELS as TEST_STATUS_LABELS,
  type TestStatus,
} from "../../lib/gysh-test-plan";

export type EndSprintAction = "rollover" | "complete";

export type EndSprintWorkItem = {
  key: string;
  source: "task" | "test";
  sourceId: string;
  title: string;
  statusLabel: string;
  assignee: string;
};

type Props = {
  open: boolean;
  sprintIndex: number;
  tasks: EndSprintWorkItem[];
  tests: EndSprintWorkItem[];
  busy?: boolean;
  onClose: () => void;
  onConfirm: (actions: Record<string, EndSprintAction>) => void | Promise<void>;
};

function isTaskIncomplete(status: GyshTask["status"]): boolean {
  return status !== "done";
}

function isTestIncomplete(status: TestStatus | undefined): boolean {
  return status !== "pass";
}

/** Incomplete tasks + tests for a sprint (board face — excludes Plan). */
export function listIncompleteSprintWork(input: {
  sprintIndex: number;
  tasks: GyshTask[];
  tests: Array<{ id: string; title: string }>;
  testStatuses: Record<string, TestStatus>;
  testSprints: Record<string, number>;
  testAssignees: Record<string, string>;
}): { tasks: EndSprintWorkItem[]; tests: EndSprintWorkItem[] } {
  const { sprintIndex } = input;
  const tasks: EndSprintWorkItem[] = input.tasks
    .filter((t) => Number(t.sprint) === sprintIndex && isTaskIncomplete(t.status))
    .map((t) => ({
      key: `task:${t.id}`,
      source: "task" as const,
      sourceId: t.id,
      title: t.description || t.id,
      statusLabel: TASK_STATUS_LABELS[t.status] ?? t.status,
      assignee: t.assignedTo || "Unassigned",
    }));

  const tests: EndSprintWorkItem[] = input.tests
    .filter((t) => {
      const sprint = Number(input.testSprints[t.id]);
      if (sprint !== sprintIndex) return false;
      return isTestIncomplete(input.testStatuses[t.id]);
    })
    .map((t) => {
      const st = input.testStatuses[t.id] ?? "not_run";
      return {
        key: `test:${t.id}`,
        source: "test" as const,
        sourceId: t.id,
        title: t.title,
        statusLabel: TEST_STATUS_LABELS[st] ?? st,
        assignee: input.testAssignees[t.id]?.trim() || "Unassigned",
      };
    });

  return { tasks, tests };
}

/** Incomplete plan items in a sprint (auto-carried when ending — not shown in modal). */
export function listIncompletePlanItems(items: PlanItem[], sprintIndex: number): PlanItem[] {
  return items.filter((i) => i.sprint === sprintIndex && i.status !== "done");
}

function ActionToggle({
  value,
  onChange,
  disabled,
}: {
  value: EndSprintAction;
  onChange: (v: EndSprintAction) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button
        type="button"
        className={value === "rollover" ? "btn btn-primary" : "btn btn-outline"}
        style={{ padding: "5px 10px", fontSize: "0.875rem" }}
        disabled={disabled}
        onClick={() => onChange("rollover")}
      >
        <RotateCcw size={13} /> Rollover
      </button>
      <button
        type="button"
        className={value === "complete" ? "btn btn-primary" : "btn btn-outline"}
        style={{
          padding: "5px 10px",
          fontSize: "0.875rem",
          ...(value === "complete"
            ? { background: "#16a34a", borderColor: "#16a34a" }
            : {}),
        }}
        disabled={disabled}
        onClick={() => onChange("complete")}
      >
        <CheckCircle2 size={13} /> Complete
      </button>
    </div>
  );
}

function WorkRow({
  item,
  action,
  onChange,
  disabled,
}: {
  item: EndSprintWorkItem;
  action: EndSprintAction;
  onChange: (v: EndSprintAction) => void;
  disabled?: boolean;
}) {
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: 12,
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span className="flat-label flat-label--id">{item.sourceId}</span>
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              color: item.source === "test" ? "#2563eb" : "#8a7348",
            }}
          >
            {item.source === "test" ? "Test" : "Task"}
          </span>
        </div>
        <div
          style={{
            marginTop: 4,
            color: "var(--charcoal)",
            fontSize: "0.95rem",
            lineHeight: 1.35,
          }}
        >
          {item.title}
        </div>
        <div style={{ marginTop: 2, fontSize: "0.875rem", color: "var(--text-primary)" }}>
          {item.assignee} · {item.statusLabel}
        </div>
      </div>
      <ActionToggle value={action} onChange={onChange} disabled={disabled} />
    </li>
  );
}

export function EndSprintModal({
  open,
  sprintIndex,
  tasks,
  tests,
  busy = false,
  onClose,
  onConfirm,
}: Props) {
  const allItems = useMemo(() => [...tests, ...tasks], [tasks, tests]);
  const [actions, setActions] = useState<Record<string, EndSprintAction>>({});

  useEffect(() => {
    if (!open) return;
    const next: Record<string, EndSprintAction> = {};
    for (const item of allItems) next[item.key] = "rollover";
    setActions(next);
  }, [open, allItems]);

  if (!open) return null;

  const sw = getSprintWindow(sprintIndex);
  const nextLabel = sprintLabel(sprintIndex + 1);
  const empty = allItems.length === 0;

  const setAll = (action: EndSprintAction) => {
    const next: Record<string, EndSprintAction> = {};
    for (const item of allItems) next[item.key] = action;
    setActions(next);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-sprint-modal-title"
      data-testid="end-sprint-modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 420,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(24, 23, 24, 0.45)",
      }}
      onClick={() => {
        if (!busy) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !busy) onClose();
      }}
    >
      <div
        className="glass"
        style={{
          width: "min(760px, 100%)",
          maxHeight: "88vh",
          overflow: "auto",
          borderRadius: 16,
          padding: "22px 24px",
          background: "#fff",
          border: "1px solid var(--border-color)",
          boxShadow: "0 18px 48px rgba(24,23,24,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div>
            <h3
              id="end-sprint-modal-title"
              style={{
                margin: 0,
                fontSize: "1.25rem",
                color: "var(--charcoal)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Flag size={20} color="#9B2F28" />
              End {sprintLabel(sprintIndex)}
            </h3>
            <p style={{ margin: "8px 0 0", fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.45 }}>
              Sprint ends <strong>{sw.endLabel}</strong> (Monday night). Choose{" "}
              <strong>Rollover</strong> to move unfinished work to {nextLabel}, or{" "}
              <strong>Complete</strong> to mark it done/pass now.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: "6px 8px" }}
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {empty ? (
          <p style={{ marginTop: 20, color: "#2e7d32", fontWeight: 600 }}>
            Nothing left open — all tasks and tests in this sprint are complete. You can finish
            the sprint cleanly.
          </p>
        ) : (
          <>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
                {tests.length} test{tests.length === 1 ? "" : "s"} · {tasks.length} task
                {tasks.length === 1 ? "" : "s"} open
              </span>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "5px 10px", fontSize: "0.875rem" }}
                disabled={busy}
                onClick={() => setAll("rollover")}
              >
                All → Rollover
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "5px 10px", fontSize: "0.875rem" }}
                disabled={busy}
                onClick={() => setAll("complete")}
              >
                All → Complete
              </button>
            </div>

            {tests.length > 0 && (
              <section style={{ marginTop: 16 }}>
                <h4
                  style={{
                    margin: "0 0 4px",
                    fontSize: "0.9375rem",
                    color: "#9B2F28",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Tests ({tests.length})
                </h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {tests.map((item) => (
                    <WorkRow
                      key={item.key}
                      item={item}
                      action={actions[item.key] ?? "rollover"}
                      onChange={(v) => setActions((prev) => ({ ...prev, [item.key]: v }))}
                      disabled={busy}
                    />
                  ))}
                </ul>
              </section>
            )}

            {tasks.length > 0 && (
              <section style={{ marginTop: 16 }}>
                <h4
                  style={{
                    margin: "0 0 4px",
                    fontSize: "0.9375rem",
                    color: "#9B2F28",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Tasks ({tasks.length})
                </h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {tasks.map((item) => (
                    <WorkRow
                      key={item.key}
                      item={item}
                      action={actions[item.key] ?? "rollover"}
                      onChange={(v) => setActions((prev) => ({ ...prev, [item.key]: v }))}
                      disabled={busy}
                    />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        <div
          style={{
            marginTop: 20,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-testid="end-sprint-confirm"
            disabled={busy}
            onClick={() => void onConfirm(actions)}
          >
            <Flag size={14} />{" "}
            {empty
              ? `Finish ${sprintLabel(sprintIndex)}`
              : `Apply & end → ${nextLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}
