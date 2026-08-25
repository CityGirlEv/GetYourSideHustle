import { useMemo, useState } from "react";
import { listRolloutScheduleSummary } from "../../lib/gysh-sprints";
import { ShowHideChevron, ShowHideToggle } from "../ShowHideToggle";

type RolloutScheduleSummaryProps = {
  className?: string;
  /** Prefer collapsed to save vertical space on Admin Schedule. */
  defaultOpen?: boolean;
};

const LEDE =
  "Soft launch S2 (~Aug 3) · pause 8/4–8/17 · Sprint 3 resumes 8/18 · Kids S4 · Jr/Adult S5 · Senior S6";

/**
 * Compact phased rollout for Evelyn: soft launch (S2) then GMSH bands (S4–S6).
 * Dense table/grid — no sparse card stacks. Collapsible like Task/Tests status.
 */
export function RolloutScheduleSummary({
  className,
  defaultOpen = false,
}: RolloutScheduleSummaryProps) {
  const rows = useMemo(() => listRolloutScheduleSummary(), []);
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rollout-schedule${className ? ` ${className}` : ""}`}
      data-testid="rollout-schedule-summary"
    >
      <div
        className="rollout-schedule__toggle"
        aria-expanded={open}
        data-testid="rollout-schedule-toggle"
      >
        <ShowHideChevron
          open={open}
          onOpenChange={setOpen}
          label="Rollout schedule"
          testId="rollout-schedule-chevron"
        />
        <button
          type="button"
          className="rollout-schedule__heading-btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="rollout-schedule__title">Rollout schedule</span>
          {!open && <span className="rollout-schedule__lede">{LEDE}</span>}
        </button>
        <ShowHideToggle
          open={open}
          onOpenChange={setOpen}
          label="Rollout schedule"
          testId="rollout-schedule-show-hide"
        />
      </div>
      {open && (
        <>
          <p className="rollout-schedule__lede rollout-schedule__lede--open">{LEDE}</p>
          <div className="rollout-schedule__table" role="table" aria-label="Rollout schedule by sprint">
            <div className="rollout-schedule__row rollout-schedule__row--head" role="row">
              <span role="columnheader">Sprint</span>
              <span role="columnheader">Dates</span>
              <span role="columnheader">Goal</span>
              <span role="columnheader">Phase</span>
            </div>
            {rows.map((row) => {
              const highlight =
                row.sprint === 2 || row.sprint === 4 || row.sprint === 5 || row.sprint === 6;
              return (
                <div
                  key={row.sprint}
                  className={`rollout-schedule__row${highlight ? " rollout-schedule__row--key" : ""}`}
                  role="row"
                  data-sprint={row.sprint}
                >
                  <span className="rollout-schedule__sprint" role="cell">
                    S{row.sprint}
                  </span>
                  <span className="rollout-schedule__dates" role="cell">
                    {row.rangeLabel}
                  </span>
                  <span className="rollout-schedule__goal" role="cell">
                    {row.goal}
                  </span>
                  <span className="rollout-schedule__focus" role="cell">
                    {row.focus}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
