import { useEffect, useMemo, useState } from "react";
import { fetchAgilePlan } from "../../lib/gysh-agile-plan";
import { fetchTasks } from "../../lib/gysh-tasks";
import {
  fetchTestStatuses,
  TEST_CASES,
  withDefaultSuite,
} from "../../lib/gysh-test-plan";
import {
  AUTOMATED_PLAYWRIGHT_CASES,
  AUTOMATED_VITEST_CASES,
  isWizardMatrixCaseId,
} from "../../lib/gysh-automated-tests";
import {
  planToBoardCard,
  taskToBoardCard,
  testToBoardCard,
  type BoardCard,
} from "../../lib/gysh-sprint-board";
import {
  summarizeBoardProgress,
  type ProjectProgressSummary,
  type SprintProgressSlice,
  type WorkBreakdown,
} from "../../lib/sprint-progress";
import { fetchClosedSprints, isSprintLocked } from "../../lib/gysh-closed-sprints";
import { WaitIndicator } from "../WaitFeedback";
import { ShowHideChevron, ShowHideToggle } from "../ShowHideToggle";
import { RolloutScheduleSummary } from "./RolloutScheduleSummary";
import { SprintLockedBanner } from "./SprintLockedBanner";

const ALL_TESTS = [
  ...withDefaultSuite(TEST_CASES),
  ...AUTOMATED_VITEST_CASES,
  ...AUTOMATED_PLAYWRIGHT_CASES,
].filter((t) => !isWizardMatrixCaseId(t.id));

/** Sprint board selection from a progress row (Overall → all committed sprints). */
export type SprintProgressSelection = number | "all";

function TqLines({ row }: { row: Pick<WorkBreakdown, "tests" | "testsDone" | "tasks" | "tasksDone"> }) {
  return (
    <span className="sprint-status-row__tq" title={`Tests: ${row.testsDone}/${row.tests} · Tasks: ${row.tasksDone}/${row.tasks}`}>
      <span>Tests: {row.testsDone}/{row.tests}</span>
      <span>Tasks: {row.tasksDone}/{row.tasks}</span>
    </span>
  );
}

function SprintProgressRow({
  label,
  detail,
  row,
  accent,
  highlight,
  selected,
  locked,
  onFilter,
}: {
  label: string;
  detail?: string;
  row: WorkBreakdown;
  accent: string;
  highlight?: boolean;
  selected?: boolean;
  locked?: boolean;
  onFilter?: () => void;
}) {
  const filterable = Boolean(onFilter);
  return (
    <div
      className={`sprint-status-row${highlight ? " sprint-status-row--current" : ""}${selected ? " sprint-status-row--selected" : ""}${filterable ? " sprint-status-row--filterable" : ""}${locked ? " sprint-status-row--locked" : ""}`}
      data-testid="sprint-status-meter"
      data-selected={selected ? "true" : "false"}
      data-locked={locked ? "true" : "false"}
    >
      <div className="sprint-status-row__main">
        <div className="sprint-status-row__identity">
          {filterable ? (
            <button
              type="button"
              className="sprint-status-row__filter-btn"
              onClick={onFilter}
              title={locked ? `${label} · Closed & locked` : "Click to filter"}
              aria-label={`${label}${locked ? " · Locked" : ""}. Click to filter`}
            >
              <strong className="sprint-status-row__name">{label}</strong>
              {locked ? <SprintLockedBanner /> : null}
              <span className="sprint-status-row__click-hint">Click to filter</span>
            </button>
          ) : (
            <>
              <strong className="sprint-status-row__name">{label}</strong>
              {locked ? <SprintLockedBanner /> : null}
            </>
          )}
          {detail && <span className="sprint-status-row__dates">{detail}</span>}
        </div>
        <TqLines row={row} />
        <span className="sprint-status-row__pct">
          {row.done}/{row.total} · {row.percent}%
        </span>
      </div>
      <div
        className="sprint-status-row__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={row.percent}
      >
        <div
          className="sprint-status-row__fill"
          style={{ width: `${row.percent}%`, background: accent }}
        />
      </div>
    </div>
  );
}

function collapsedSummary(data: ProjectProgressSummary): string {
  return `${data.current.label} ${data.current.percent}% · Overall ${data.overall.percent}%`;
}

function sprintRowLabel(s: SprintProgressSlice): string {
  return s.isCurrent ? `${s.label} (current)` : s.label;
}

type SprintStatusBarsProps = {
  /** Optional prebuilt board cards — skips fetch when provided. */
  boardCards?: BoardCard[];
  className?: string;
  /** Prefer collapsed to save vertical space (matches Rollout / Task·Tests filters). */
  defaultOpen?: boolean;
  /** Currently selected sprint on the parent board (highlights matching row). */
  selectedSprint?: number | "all" | "backlog" | null;
  /** Clicking a sprint / Overall label filters the parent board. */
  onSelectSprint?: (selection: SprintProgressSelection) => void;
};

export function SprintStatusBars({
  boardCards,
  className,
  defaultOpen = false,
  selectedSprint = null,
  onSelectSprint,
}: SprintStatusBarsProps) {
  const [summary, setSummary] = useState<ProjectProgressSummary | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(defaultOpen);
  const [closedSprints, setClosedSprints] = useState<Set<number>>(() => new Set());

  const fromProps = useMemo(
    () => (boardCards ? summarizeBoardProgress(boardCards) : null),
    [boardCards],
  );

  useEffect(() => {
    let cancelled = false;
    void fetchClosedSprints()
      .then((closed) => {
        if (!cancelled) setClosedSprints(new Set(closed));
      })
      .catch(() => {
        /* keep empty — banners optional */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (boardCards) {
      setSummary(fromProps);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [plan, tasks, tests] = await Promise.all([
          fetchAgilePlan(),
          fetchTasks(),
          fetchTestStatuses(),
        ]);
        if (cancelled) return;
        const cards: BoardCard[] = [
          ...plan.items.map(planToBoardCard),
          ...tasks.filter((t) => !String(t.parentId || "").trim()).map(taskToBoardCard),
          ...ALL_TESTS.map((t) =>
            testToBoardCard(t, tests.statuses[t.id], tests.sprints?.[t.id], tests.assignees?.[t.id], {
              updatedAt: tests.updatedAt?.[t.id],
              updatedBy: tests.updatedBy?.[t.id],
            }),
          ),
        ];
        setSummary(summarizeBoardProgress(cards));
        setError("");
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load sprint progress.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boardCards, fromProps]);

  const data = boardCards ? fromProps : summary;
  const hint = data ? collapsedSummary(data) : error ? "error" : "loading…";
  const filterable = Boolean(onSelectSprint);

  return (
    <div
      className={`glass sprint-status-bars${className ? ` ${className}` : ""}`}
      data-testid="sprint-status-bars"
    >
      <div className="sprint-status-bars__top">
        <div
          className="sprint-status-bars__toggle"
          aria-expanded={open}
          data-testid="sprint-status-toggle"
        >
          <ShowHideChevron
            open={open}
            onOpenChange={setOpen}
            label="Sprint Progress"
            testId="sprint-status-chevron"
          />
          <button
            type="button"
            className="sprint-status-bars__heading-btn"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <span className="sprint-status-bars__title">Sprint Progress</span>
            {!open && <span className="sprint-status-bars__hint">{hint}</span>}
            {open && filterable && (
              <span className="sprint-status-bars__hint sprint-status-bars__hint--filter">
                Click a sprint name to filter
              </span>
            )}
          </button>
          <ShowHideToggle
            open={open}
            onOpenChange={setOpen}
            label="Sprint Progress"
            testId="sprint-status-show-hide"
          />
        </div>
        {open && (
          <>
            {error && <p className="sprint-status-bars__error">{error}</p>}
            {!data && !error && (
              <WaitIndicator
                className="sprint-status-bars__loading"
                message="Loading progress…"
                style={{ marginTop: 0 }}
              />
            )}
            {data && (
              <div className="sprint-status-bars__list" data-testid="sprint-status-list">
                <div className="sprint-status-bars__cols" aria-hidden>
                  <span>Sprint</span>
                  <span>Tests / Tasks</span>
                  <span>Progress</span>
                </div>
                {data.sprints.map((s) => (
                  <SprintProgressRow
                    key={s.sprintIndex}
                    label={sprintRowLabel(s)}
                    detail={s.rangeLabel}
                    row={s}
                    accent={s.isCurrent ? "#5f7a45" : "#947D64"}
                    highlight={s.isCurrent}
                    selected={selectedSprint === s.sprintIndex}
                    locked={isSprintLocked(closedSprints, s.sprintIndex)}
                    onFilter={
                      onSelectSprint ? () => onSelectSprint(s.sprintIndex) : undefined
                    }
                  />
                ))}
                <SprintProgressRow
                  label="Overall project"
                  detail="Committed sprints (tasks + passed tests) · All Sprints"
                  row={data.overall}
                  accent="#6B5344"
                  selected={selectedSprint === "all"}
                  onFilter={onSelectSprint ? () => onSelectSprint("all") : undefined}
                />
              </div>
            )}
          </>
        )}
      </div>
      <RolloutScheduleSummary />
    </div>
  );
}
