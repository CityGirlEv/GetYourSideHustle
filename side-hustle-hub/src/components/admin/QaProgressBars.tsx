import { useState, type ReactNode } from "react";
import { DEFAULT_TEST_STATUS, type TestStatus } from "../../lib/gysh-test-plan";
import { ShowHideChevron, ShowHideToggle } from "../ShowHideToggle";

export type StatusTally = {
  not_run: number;
  in_progress: number;
  rolled_over: number;
  pass: number;
  conditional_approval: number;
  fail: number;
  blocked: number;
  fixed_retest: number;
  failed_retest: number;
  fixed_cursor: number;
  total: number;
};

export type QaProgressRow = {
  id: string;
  label: string;
  detail?: string;
  accent?: string;
  tally: StatusTally;
};

const SEGMENTS: Array<{ key: Exclude<keyof StatusTally, "total">; color: string; label: string }> = [
  { key: "pass", color: "#3f6b2e", label: "Pass" },
  { key: "conditional_approval", color: "#0f766e", label: "Cond. Pass" },
  { key: "fail", color: "#9B2F28", label: "Fail" },
  { key: "blocked", color: "#a16207", label: "Blocked" },
  { key: "fixed_retest", color: "#2563eb", label: "Fixed/Re-Test" },
  { key: "failed_retest", color: "#f97316", label: "Failed/Re-Test" },
  { key: "fixed_cursor", color: "#7c3aed", label: "Fixed/Cursor" },
  { key: "rolled_over", color: "#0e7490", label: "Rolled Over" },
  { key: "in_progress", color: "#b8860b", label: "In Progress" },
  { key: "not_run", color: "#6b5344", label: "Not Started" },
];

export function emptyTally(): StatusTally {
  return {
    not_run: 0,
    in_progress: 0,
    rolled_over: 0,
    pass: 0,
    conditional_approval: 0,
    fail: 0,
    blocked: 0,
    fixed_retest: 0,
    failed_retest: 0,
    fixed_cursor: 0,
    total: 0,
  };
}

export function tallyStatuses(
  caseIds: Iterable<string>,
  statuses: Record<string, TestStatus>,
): StatusTally {
  const t = emptyTally();
  for (const id of caseIds) {
    const st = statuses[id] ?? DEFAULT_TEST_STATUS;
    switch (st) {
      case "not_run":
      case "in_progress":
      case "rolled_over":
      case "pass":
      case "conditional_approval":
      case "fail":
      case "blocked":
      case "fixed_retest":
      case "failed_retest":
      case "fixed_cursor":
        t[st] += 1;
        break;
      default:
        t.not_run += 1;
        break;
    }
    t.total += 1;
  }
  return t;
}

function passPercent(t: StatusTally): number {
  return t.total === 0 ? 0 : Math.round((t.pass / t.total) * 100);
}

function aggregateTally(rows: QaProgressRow[]): StatusTally {
  const t = emptyTally();
  for (const row of rows) {
    t.not_run += row.tally.not_run;
    t.in_progress += row.tally.in_progress;
    t.rolled_over += row.tally.rolled_over;
    t.pass += row.tally.pass;
    t.conditional_approval += row.tally.conditional_approval;
    t.fail += row.tally.fail;
    t.blocked += row.tally.blocked;
    t.fixed_retest += row.tally.fixed_retest;
    t.failed_retest += row.tally.failed_retest;
    t.fixed_cursor += row.tally.fixed_cursor;
    t.total += row.tally.total;
  }
  return t;
}

function CollapsibleSection({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="qa-progress-bars__section qa-progress-bars__section--collapsible">
      <div className="qa-progress-bars__section-toggle" aria-expanded={open}>
        <ShowHideChevron open={open} onOpenChange={setOpen} label={title} />
        <button
          type="button"
          className="qa-progress-bars__heading-btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="qa-progress-bars__heading">{title}</span>
          {summary && <span className="qa-progress-bars__section-summary">{summary}</span>}
        </button>
        <ShowHideToggle open={open} onOpenChange={setOpen} label={title} />
      </div>
      {open && <div className="qa-progress-bars__section-body">{children}</div>}
    </section>
  );
}

/** e.g. Pass = 4 | Fail = 2 | Not Started = 90 */
export function formatStatusEqualsLine(tally: StatusTally): string {
  return SEGMENTS.map(({ key, label }) => `${label} = ${tally[key]}`).join(" | ");
}

function StatusTrack({ label, tally }: { label: string; tally: StatusTally }) {
  return (
    <div
      className="qa-progress-meter__track"
      role="progressbar"
      aria-label={`${label}: ${tally.pass} of ${tally.total} passed`}
      aria-valuemin={0}
      aria-valuemax={tally.total || 100}
      aria-valuenow={tally.pass}
    >
      {tally.total === 0 ? (
        <div className="qa-progress-meter__empty" />
      ) : (
        SEGMENTS.map((seg) => {
          const n = tally[seg.key];
          if (!n) return null;
          const width = (n / tally.total) * 100;
          return (
            <div
              key={seg.key}
              className="qa-progress-meter__seg"
              title={`${seg.label}: ${n}`}
              style={{ width: `${width}%`, background: seg.color }}
            />
          );
        })
      )}
    </div>
  );
}

/** Tester row: name + passed/total + bar + Pass = X | Fail = X | … (colors match bar). */
export function TesterStatusRow({
  label,
  tally,
  accent,
}: {
  label: string;
  tally: StatusTally;
  accent?: string;
}) {
  const pct = passPercent(tally);
  const statusLine = formatStatusEqualsLine(tally);
  return (
    <div className="qa-tester-status-row" data-testid="qa-tester-status-row">
      <div className="qa-tester-status-row__head">
        <strong style={accent ? { color: accent } : undefined}>{label}</strong>
        <span className="qa-progress-meter__nums">
          {tally.pass}/{tally.total} passed · {pct}%
        </span>
      </div>
      <StatusTrack label={label} tally={tally} />
      <p className="qa-tester-status-row__equals" title={statusLine}>
        {SEGMENTS.map((seg, i) => (
          <span key={seg.key} className="qa-tester-status-row__part">
            {i > 0 && <span className="qa-tester-status-row__sep" aria-hidden> | </span>}
            <span style={{ color: seg.color }}>
              {seg.label} = {tally[seg.key]}
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}

/** Segmented status track (Pass / Fail / …) for a tally. */
export function StatusTallyBar({
  label,
  tally,
  accent,
  detail,
}: {
  label: string;
  tally: StatusTally;
  accent?: string;
  detail?: string;
  /** @deprecated Use TesterStatusRow for collapsible tester details. */
  compact?: boolean;
}) {
  const pct = passPercent(tally);
  return (
    <div className="qa-progress-meter" data-testid="qa-progress-meter">
      <div className="qa-progress-meter__head">
        <div className="qa-progress-meter__title-block">
          <strong style={accent ? { color: accent } : undefined}>{label}</strong>
          {detail && <span className="qa-progress-meter__detail">{detail}</span>}
        </div>
        <span className="qa-progress-meter__nums">
          {tally.pass}/{tally.total} passed · {pct}%
        </span>
      </div>
      <StatusTrack label={label} tally={tally} />
      <div className="qa-progress-meter__legend">
        {SEGMENTS.map(({ key, label: statusLabel }) => (
          <span key={key}>
            {statusLabel} {tally[key]}
          </span>
        ))}
      </div>
    </div>
  );
}

function SegmentedMeter({ row }: { row: QaProgressRow }) {
  return (
    <StatusTallyBar
      label={row.label}
      tally={row.tally}
      accent={row.accent}
      detail={row.detail}
    />
  );
}

type QaProgressBarsProps = {
  title?: string;
  overall: QaProgressRow;
  suites: QaProgressRow[];
  sprints: QaProgressRow[];
  resources: QaProgressRow[];
  /** Nest under Testing Portal card (no outer glass). */
  embedded?: boolean;
  /** Collapsible panel; toggle label uses title. */
  collapsible?: boolean;
  defaultOpen?: boolean;
};

export function QaProgressBars({
  title = "All Test Cases",
  overall,
  suites,
  sprints,
  resources,
  embedded = false,
  collapsible = true,
  defaultOpen = false,
}: QaProgressBarsProps) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = passPercent(overall.tally);
  const summary = `${overall.tally.pass}/${overall.tally.total} passed · ${pct}%`;

  const suiteTally = aggregateTally(suites);
  const sprintTally = aggregateTally(sprints);
  const resourceTally = aggregateTally(resources);
  const sectionSummary = (t: StatusTally) =>
    `${t.pass}/${t.total} passed · ${passPercent(t)}%`;

  const body = (
    <>
      <section className="qa-progress-bars__section">
        <h3 className="qa-progress-bars__heading">Overall</h3>
        <SegmentedMeter row={overall} />
      </section>

      {suites.length > 0 && (
        <CollapsibleSection
          title="Suites (Vitest · Playwright · Manual)"
          summary={sectionSummary(suiteTally)}
          defaultOpen={false}
        >
          <div className="qa-progress-bars__grid">
            {suites.map((row) => (
              <SegmentedMeter key={row.id} row={row} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {sprints.length > 0 && (
        <CollapsibleSection title="Per Sprint" summary={sectionSummary(sprintTally)} defaultOpen={false}>
          <div className="qa-progress-bars__grid">
            {sprints.map((row) => (
              <SegmentedMeter key={row.id} row={row} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {resources.length > 0 && (
        <CollapsibleSection
          title="Per QA Resource"
          summary={sectionSummary(resourceTally)}
          defaultOpen={false}
        >
          <div className="qa-progress-bars__grid">
            {resources.map((row) => (
              <SegmentedMeter key={row.id} row={row} />
            ))}
          </div>
        </CollapsibleSection>
      )}
    </>
  );

  const shellClass = embedded
    ? "qa-progress-bars qa-progress-bars--embedded"
    : "glass qa-progress-bars";

  if (!collapsible) {
    return (
      <div className={shellClass} data-testid="qa-progress-bars">
        <div className="qa-progress-bars__title">{title}</div>
        {body}
      </div>
    );
  }

  return (
    <div className={shellClass} data-testid="qa-progress-bars">
      <div className="qa-progress-bars__toggle" aria-expanded={open}>
        <ShowHideChevron open={open} onOpenChange={setOpen} label={title} />
        <button
          type="button"
          className="qa-progress-bars__heading-btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="qa-progress-bars__toggle-title">{title}</span>
          <span className="qa-progress-bars__toggle-summary">{summary}</span>
        </button>
        <ShowHideToggle open={open} onOpenChange={setOpen} label={title} />
      </div>
      {open && <div className="qa-progress-bars__body">{body}</div>}
    </div>
  );
}
