import {
  planSideBySideColumnSubtitle,
  planSideBySideColumnTitle,
  planSideBySideDrugRows,
  planSideBySideRows,
} from "@/lib/plan-side-by-side";
import type { PlanDetail } from "@/lib/plan-details";
import type { Medication } from "@/lib/medicare-math";
import { cn } from "@/lib/utils";

const SIDE_BY_SIDE_HEADER_CELL =
  "bg-[var(--brand-navy)] py-2 px-3 text-left font-semibold text-white border-b border-white/15";

export function PlanSideBySideComparison({
  plans,
  medications = [],
  className,
  id,
  scrollContained = true,
  stickyTableHeader,
  stickyHeaderTopClass = "top-0",
}: {
  plans: PlanDetail[];
  medications?: Medication[];
  className?: string;
  id?: string;
  /** When false, parent scroll region handles vertical scroll (e.g. Rankings / Side by Side tabs). */
  scrollContained?: boolean;
  /** Sticky plan column headers at the top of a parent scroll region. */
  stickyTableHeader?: boolean;
  stickyHeaderTopClass?: string;
}) {
  if (plans.length < 2) {
    return (
      <p className="text-xs text-muted-foreground rounded border border-border bg-muted/20 px-3 py-2">
        Select at least 2 plans to compare side by side.
      </p>
    );
  }

  const attributeRows = planSideBySideRows();
  const drugRows = planSideBySideDrugRows(plans, medications);
  const allRows = [...attributeRows, ...drugRows];

  const scrollWrapperClass = cn(
    scrollContained && "max-h-[min(70vh,640px)] overflow-y-auto overflow-x-auto overscroll-contain",
    !scrollContained && !stickyTableHeader && "overflow-x-auto overscroll-contain",
  );

  const detailHeaderClass = cn(
    SIDE_BY_SIDE_HEADER_CELL,
    "sticky left-0 z-30 min-w-[9rem] shadow-[2px_0_4px_-1px_rgba(0,0,0,0.25)]",
  );

  const detailCellClass = (emphasize: boolean | undefined) =>
    cn(
      "sticky left-0 z-[5] py-1.5 px-3 text-muted-foreground font-medium",
      "bg-background shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)]",
      emphasize && "bg-emerald/5",
    );

  const stickyThead = scrollContained || stickyTableHeader === true;
  const theadTopClass =
    stickyTableHeader && !scrollContained ? "top-0" : stickyHeaderTopClass;

  const table = (
    <table className="w-full min-w-[32rem] border-separate border-spacing-0 text-xs">
      <thead
        className={cn(
          stickyThead && "sticky z-30 shadow-[0_2px_4px_rgba(0,0,0,0.18)]",
          stickyThead && theadTopClass,
        )}
      >
        <tr>
          <th className={detailHeaderClass}>Detail</th>
          {plans.map((plan, index) => (
            <th
              key={`${plan.carrier}-${plan.plan}-head`}
              className={cn(
                SIDE_BY_SIDE_HEADER_CELL,
                "min-w-[10rem] align-bottom",
                index === 0 ? "bg-emerald/90" : undefined,
              )}
            >
              <div>{planSideBySideColumnTitle(plan, index)}</div>
              <div className="text-[10px] font-normal opacity-90 leading-snug mt-0.5">
                {planSideBySideColumnSubtitle(plan)}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {allRows.map((row) => (
          <tr
            key={row.label}
            className={cn(
              "border-t border-border/60",
              row.emphasize && "bg-emerald/5 font-semibold",
            )}
          >
            <td className={detailCellClass(row.emphasize)}>{row.label}</td>
            {plans.map((plan) => (
              <td
                key={`${plan.carrier}-${plan.plan}-${row.label}`}
                className={cn("py-1.5 px-3 align-top tabular-nums", row.emphasize && "bg-emerald/5")}
              >
                {row.values(plan)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div id={id} className={cn(className)}>
      {scrollContained || (!scrollContained && !stickyTableHeader) ? (
        <div className={scrollWrapperClass}>{table}</div>
      ) : (
        table
      )}
      {medications.length > 0 ? (
        <p className="text-[10px] text-muted-foreground leading-snug px-3 py-2 border-t border-border/60 bg-muted/20">
          Drug estimates use your intake medications and plan tier assumptions — confirm on
          Medicare.gov or with the carrier before enrolling.
        </p>
      ) : null}
    </div>
  );
}
