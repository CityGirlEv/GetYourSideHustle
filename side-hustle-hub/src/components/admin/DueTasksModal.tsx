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
  const itemCount = overdue.length + dueToday.length + overdueTests.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="due-tasks-modal-title"
      className="due-tasks-modal"
      data-testid="due-tasks-modal"
      data-item-count={itemCount}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="glass due-tasks-modal__card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="due-tasks-modal__head">
          <div>
            <h3 id="due-tasks-modal-title">
              Work needing attention
            </h3>
            <p>
              Past-due tasks &amp; tests for {assigneeLabel}
              {assigneeLabel !== "Lyriq" ? " (tasks include Both)" : ""}.
            </p>
            <p className="due-tasks-modal__sprint">
              {sprint.headline}. {sprint.nudge}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline due-tasks-modal__x"
            onClick={onClose}
            aria-label="Close"
            data-testid="due-tasks-modal-close"
          >
            <X size={16} />
          </button>
        </div>

        {empty ? (
          <p className="due-tasks-modal__empty">Nothing overdue. Nice work.</p>
        ) : (
          <div className="due-tasks-modal__body">
            {overdueTests.length > 0 && (
              <section className="due-tasks-modal__section">
                <h4 className="due-tasks-modal__h4 due-tasks-modal__h4--overdue">
                  Past-due tests ({overdueTests.length})
                </h4>
                <ul className="due-tasks-modal__list">
                  {overdueTests.map((t) => (
                    <TestLine key={t.id} t={t} />
                  ))}
                </ul>
              </section>
            )}
            {overdue.length > 0 && (
              <section className="due-tasks-modal__section">
                <h4 className="due-tasks-modal__h4 due-tasks-modal__h4--overdue">
                  Past-due tasks ({overdue.length})
                </h4>
                <ul className="due-tasks-modal__list">
                  {overdue.map((t) => (
                    <TaskLine key={t.id} t={t} tone="overdue" />
                  ))}
                </ul>
              </section>
            )}
            {dueToday.length > 0 && (
              <section className="due-tasks-modal__section">
                <h4 className="due-tasks-modal__h4">
                  Due today — tasks ({dueToday.length})
                </h4>
                <ul className="due-tasks-modal__list">
                  {dueToday.map((t) => (
                    <TaskLine key={t.id} t={t} tone="today" />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <div className="due-tasks-modal__actions">
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
