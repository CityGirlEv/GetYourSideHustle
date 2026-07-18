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
import { summarizeBoardProgress, type ProjectProgressSummary } from "../../lib/sprint-progress";

const ALL_TESTS = [
  ...withDefaultSuite(TEST_CASES),
  ...AUTOMATED_VITEST_CASES,
  ...AUTOMATED_PLAYWRIGHT_CASES,
].filter((t) => !isWizardMatrixCaseId(t.id));

function Meter({
  label,
  detail,
  done,
  total,
  percent,
  accent,
}: {
  label: string;
  detail?: string;
  done: number;
  total: number;
  percent: number;
  accent: string;
}) {
  return (
    <div className="sprint-status-meter" data-testid="sprint-status-meter">
      <div className="sprint-status-meter__head">
        <div>
          <strong>{label}</strong>
          {detail && <span className="sprint-status-meter__detail">{detail}</span>}
        </div>
        <span className="sprint-status-meter__nums">
          {done}/{total} · {percent}%
        </span>
      </div>
      <div
        className="sprint-status-meter__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="sprint-status-meter__fill" style={{ width: `${percent}%`, background: accent }} />
      </div>
    </div>
  );
}

type SprintStatusBarsProps = {
  /** Optional prebuilt board cards — skips fetch when provided. */
  boardCards?: BoardCard[];
  className?: string;
};

export function SprintStatusBars({ boardCards, className }: SprintStatusBarsProps) {
  const [summary, setSummary] = useState<ProjectProgressSummary | null>(null);
  const [error, setError] = useState("");

  const fromProps = useMemo(
    () => (boardCards ? summarizeBoardProgress(boardCards) : null),
    [boardCards],
  );

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
          ...tasks.map(taskToBoardCard),
          ...ALL_TESTS.map((t) =>
            testToBoardCard(t, tests.statuses[t.id], tests.sprints?.[t.id], tests.assignees?.[t.id]),
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

  return (
    <div
      className={`glass sprint-status-bars${className ? ` ${className}` : ""}`}
      data-testid="sprint-status-bars"
    >
      <div className="sprint-status-bars__title">Sprint Status</div>
      {error && <p className="sprint-status-bars__error">{error}</p>}
      {!data && !error && <p className="sprint-status-bars__loading">Loading progress…</p>}
      {data && (
        <div className="sprint-status-bars__grid">
          <Meter
            label={`${data.current.label} (current)`}
            detail={
              data.current.theme
                ? `${data.current.rangeLabel} · ${data.current.theme}`
                : data.current.rangeLabel
            }
            done={data.current.done}
            total={data.current.total}
            percent={data.current.percent}
            accent="#5f7a45"
          />
          <Meter
            label="Overall project"
            detail="All committed sprints (plan + tasks + passed tests)"
            done={data.overall.done}
            total={data.overall.total}
            percent={data.overall.percent}
            accent="#947D64"
          />
        </div>
      )}
    </div>
  );
}
