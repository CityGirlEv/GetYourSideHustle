import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { TestStatus } from "../../lib/gysh-test-plan";

export type StatusTally = {
  not_run: number;
  in_progress: number;
  pass: number;
  fail: number;
  blocked: number;
  total: number;
};

export type QaProgressRow = {
  id: string;
  label: string;
  detail?: string;
  accent?: string;
  tally: StatusTally;
};

const SEGMENTS: Array<{ key: keyof StatusTally; color: string; label: string }> = [
  { key: "pass", color: "#3f6b2e", label: "Pass" },
  { key: "fail", color: "#9B2F28", label: "Fail" },
  { key: "blocked", color: "#a16207", label: "Blocked" },
  { key: "in_progress", color: "#b8860b", label: "In progress" },
  { key: "not_run", color: "#6b5344", label: "Not Started" },
];

export function emptyTally(): StatusTally {
  return { not_run: 0, in_progress: 0, pass: 0, fail: 0, blocked: 0, total: 0 };
}

export function tallyStatuses(
  caseIds: Iterable<string>,
  statuses: Record<string, TestStatus>,
): StatusTally {
  const t = emptyTally();
  for (const id of caseIds) {
    const st = statuses[id] ?? "not_run";
    t[st] += 1;
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
    t.pass += row.tally.pass;
    t.fail += row.tally.fail;
    t.blocked += row.tally.blocked;
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
      <button
        type="button"
        className="qa-progress-bars__section-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? <ChevronDown size={15} aria-hidden /> : <ChevronRight size={15} aria-hidden />}
        <span className="qa-progress-bars__heading">{title}</span>
        {summary && <span className="qa-progress-bars__section-summary">{summary}</span>}
      </button>
      {open && <div className="qa-progress-bars__section-body">{children}</div>}
    </section>
  );
}

function SegmentedMeter({ row }: { row: QaProgressRow }) {
  const { tally } = row;
  const pct = passPercent(tally);
  return (
    <div className="qa-progress-meter" data-testid="qa-progress-meter">
      <div className="qa-progress-meter__head">
        <div>
          <strong style={row.accent ? { color: row.accent } : undefined}>{row.label}</strong>
          {row.detail && <span className="qa-progress-meter__detail">{row.detail}</span>}
        </div>
        <span className="qa-progress-meter__nums">
          {tally.pass}/{tally.total} passed · {pct}%
        </span>
      </div>
      <div
        className="qa-progress-meter__track"
        role="progressbar"
        aria-label={`${row.label}: ${tally.pass} of ${tally.total} passed`}
        aria-valuemin={0}
        aria-valuemax={tally.total || 100}
        aria-valuenow={tally.pass}
      >
        {tally.total === 0 ? (
          <div className="qa-progress-meter__empty" />
        ) : (
          SEGMENTS.map((seg) => {
            const n = tally[seg.key];
            if (!n || seg.key === "total") return null;
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
      <div className="qa-progress-meter__legend">
        <span>Pass {tally.pass}</span>
        <span>Fail {tally.fail}</span>
        <span>Blocked {tally.blocked}</span>
        <span>In progress {tally.in_progress}</span>
        <span>Not Started {tally.not_run}</span>
      </div>
    </div>
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
      <button
        type="button"
        className="qa-progress-bars__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? <ChevronDown size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
        <span className="qa-progress-bars__toggle-title">{title}</span>
        <span className="qa-progress-bars__toggle-summary">{summary}</span>
      </button>
      {open && <div className="qa-progress-bars__body">{body}</div>}
    </div>
  );
}
