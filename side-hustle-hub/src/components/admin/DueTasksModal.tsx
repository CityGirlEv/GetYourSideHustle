import { FlaskConical, ListChecks, X } from "lucide-react";
import {
  TASK_STATUS_LABELS,
  type GyshTask,
} from "../../lib/gysh-tasks";
import {
  currentSprintIndex,
  daysUntilSprintEnd,
  getSprintWindow,
} from "../../lib/gysh-sprints";
import { STATUS_LABELS } from "../../lib/gysh-test-plan";
import type { AttentionTest } from "../../lib/gysh-due-attention";

type Props = {
  open: boolean;
  assigneeLabel: string;
  overdue: GyshTask[];
  dueToday: GyshTask[];
  overdueTests: AttentionTest[];
  onClose: () => void;
  onOpenTaskList: () => void;
  onOpenTesting: () => void;
};

function TaskLine({ t, tone }: { t: GyshTask; tone: "overdue" | "today" }) {
  return (
    <li className="due-tasks-line">
      <span className="flat-label flat-label--id due-tasks-line__id">{t.id}</span>
      <span className="due-tasks-line__title">{t.description}</span>
      <span
        className="due-tasks-line__due"
        data-tone={tone}
      >
        {t.dueDate || "—"}
      </span>
      <span className="due-tasks-line__status">
        {TASK_STATUS_LABELS[t.status]}
      </span>
    </li>
  );
}

function TestLine({ t }: { t: AttentionTest }) {
  return (
    <li className="due-tasks-line">
      <span className="flat-label flat-label--id due-tasks-line__id">{t.id}</span>
      <span className="due-tasks-line__title">{t.title}</span>
      <span className="due-tasks-line__due" data-tone="overdue">
        {t.dueDate || "—"}
      </span>
      <span className="due-tasks-line__status">
        {STATUS_LABELS[t.status]}
      </span>
    </li>
  );
}

function sprintCountdownCopy(ref: Date = new Date()): { headline: string; nudge: string } {
  const idx = currentSprintIndex(ref);
  const sw = getSprintWindow(idx, ref);
  const days = daysUntilSprintEnd(ref);
  const daysPhrase =
    days === 0
      ? "ends today"
      : days === 1
        ? "1 day left"
        : `${days} days left`;

  return {
    headline: `${sw.label}: ${daysPhrase} (Mon ${sw.endLabel})`,
    nudge:
      days === 0
        ? "Finish these before the sprint wraps tonight."
        : "Let's clear these before the sprint ends.",
  };
}

export function DueTasksModal({
  open,
  assigneeLabel,
  overdue,
  dueToday,
  overdueTests,
  onClose,
  onOpenTaskList,
  onOpenTesting,
}: Props) {
  if (!open) return null;

  const empty = overdue.length === 0 && dueToday.length === 0 && overdueTests.length === 0;
  const sprint = sprintCountdownCopy();
  const hasTasks = overdue.length > 0 || dueToday.length > 0;
  const hasTests = overdueTests.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="due-tasks-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(24, 23, 24, 0.45)",
      }}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="glass"
        style={{
          width: "min(680px, 100%)",
          maxHeight: "85vh",
          overflow: "auto",
          borderRadius: 16,
          padding: "22px 24px",
          background: "#fff",
          border: "1px solid var(--border-color)",
          boxShadow: "0 18px 48px rgba(24,23,24,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div>
            <h3 id="due-tasks-modal-title" style={{ margin: 0, fontSize: "1.25rem", color: "var(--charcoal)" }}>
              Work needing attention
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: "0.95rem", color: "var(--text-primary)" }}>
              Past-due tasks &amp; tests for {assigneeLabel}
              {assigneeLabel !== "Lyriq" ? " (tasks include Both)" : ""}.
            </p>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "0.95rem",
                color: "var(--bronze)",
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {sprint.headline}. {sprint.nudge}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: "6px 8px" }}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {empty ? (
          <p style={{ marginTop: 20, color: "var(--text-primary)" }}>Nothing overdue. Nice work.</p>
        ) : (
          <div style={{ marginTop: 16 }}>
            {overdueTests.length > 0 && (
              <section style={{ marginBottom: overdue.length > 0 || dueToday.length > 0 ? 18 : 0 }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "0.9375rem", color: "#9B2F28", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Past-due tests ({overdueTests.length})
                </h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {overdueTests.map((t) => (
                    <TestLine key={t.id} t={t} />
                  ))}
                </ul>
              </section>
            )}
            {overdue.length > 0 && (
              <section style={{ marginBottom: dueToday.length > 0 ? 18 : 0 }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "0.9375rem", color: "#9B2F28", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Past-due tasks ({overdue.length})
                </h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {overdue.map((t) => (
                    <TaskLine key={t.id} t={t} tone="overdue" />
                  ))}
                </ul>
              </section>
            )}
            {dueToday.length > 0 && (
              <section>
                <h4 style={{ margin: "0 0 4px", fontSize: "0.9375rem", color: "var(--bronze)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Due today — tasks ({dueToday.length})
                </h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {dueToday.map((t) => (
                    <TaskLine key={t.id} t={t} tone="today" />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Got it
          </button>
          {hasTests && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onOpenTesting();
                onClose();
              }}
            >
              <FlaskConical size={14} /> Open Testing Portal
            </button>
          )}
          {hasTasks && (
            <button
              type="button"
              className={hasTests ? "btn btn-outline" : "btn btn-primary"}
              onClick={() => {
                onOpenTaskList();
                onClose();
              }}
            >
              <ListChecks size={14} /> Open Task List
            </button>
          )}
          {!hasTasks && !hasTests && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onOpenTaskList();
                onClose();
              }}
            >
              <ListChecks size={14} /> Open Task List
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
