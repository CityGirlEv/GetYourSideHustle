import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronRight, ArrowDown, ArrowUp, ArrowUpDown, ListFilter } from "lucide-react";
import { PlanChoiceCard } from "@/components/PlanComparisonPlanCard";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PlanDetail } from "@/lib/plan-details";
import { planChoiceRankSuffix, planDetailKey } from "@/lib/plan-filters";
import { PLAN_COMPARE_SELECT_HINT } from "@/lib/plan-comparison-copy";
import { planUsd } from "@/lib/plan-comparison-rationale";
import { asScenarioMedications } from "@/lib/plan-drug-estimate";
import type { Medication } from "@/lib/medicare-math";
import {
  BENCHMARK_PLANS_SUBSECTION,
  BENCHMARK_REPORT_LINK_CLASS,
  PLAN_TABLE_BODY_CELL_CLASS,
  PLAN_TABLE_CLASS,
  PLAN_TABLE_HEADER_CELL_CLASS,
  planCardAnchorId,
} from "@/lib/benchmark-report-ui";
import {
  emptyPlanTableFilters,
  filterPlanTableRows,
  hasActivePlanTableFilters,
  isPlanTableFilterOptionChecked,
  PLAN_TABLE_COLUMNS,
  planTableFilterOptions,
  planTableSortKeyForColumn,
  deselectPlanTableColumnFilter,
  isPlanTableColumnDeselected,
  togglePlanTableFilterOption,
  type PlanTableColumnKey,
  type PlanTableFilters,
} from "@/lib/plan-table-filter";
import {
  nextSortState,
  sortPlanDetails,
  type PlanSortDirection,
  type PlanSortKey,
} from "@/lib/plan-table-sort";

const FILTER_SEARCH_THRESHOLD = 20;

function planTableFilterDropdownClass(column: PlanTableColumnKey): string {
  switch (column) {
    case "carrierPlan":
      return "min-w-[20rem] w-max max-w-[min(36rem,calc(100vw-2rem))]";
    case "planType":
      return "min-w-[18rem] w-max max-w-[min(28rem,calc(100vw-2rem))]";
    case "rank":
      return "min-w-[8rem] w-max max-w-[min(14rem,calc(100vw-2rem))]";
    default:
      return "min-w-[12rem] w-max max-w-[min(22rem,calc(100vw-2rem))]";
  }
}

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: PlanSortDirection;
}) {
  if (!active) {
    return <ArrowUpDown className="h-3 w-3 shrink-0 opacity-50" aria-hidden />;
  }
  return direction === "asc" ? (
    <ArrowUp className="h-3 w-3 shrink-0" aria-hidden />
  ) : (
    <ArrowDown className="h-3 w-3 shrink-0" aria-hidden />
  );
}

function PlanTableHeaderFilter({
  column,
  plans,
  value,
  onChange,
}: {
  column: PlanTableColumnKey;
  plans: PlanDetail[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const options = useMemo(() => planTableFilterOptions(plans, column), [plans, column]);
  const allValues = useMemo(() => options.map((option) => option.value), [options]);
  const active = value.length > 0 && !(value.length === 1 && value[0] === "__none__");
  const searchable = options.length > FILTER_SEARCH_THRESHOLD;
  const visibleOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options;
    const query = search.toLowerCase().trim();
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, search, searchable]);

  const columnLabel = PLAN_TABLE_COLUMNS.find((col) => col.key === column)?.label ?? column;

  return (
    <DropdownMenu onOpenChange={(open) => !open && setSearch("")}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white",
            active && "text-emerald-200",
          )}
          aria-label={`Filter ${columnLabel}`}
          onClick={(event) => event.stopPropagation()}
        >
          <ListFilter className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={column === "monthly" || column === "annual" || column === "stars" ? "end" : "start"}
        className={cn("z-[120] overflow-x-auto p-0", planTableFilterDropdownClass(column))}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b px-2 py-1.5 min-w-0">
          <span className="text-xs font-semibold shrink-0 whitespace-nowrap">
            Filter {columnLabel}
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            <label
              className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium whitespace-nowrap"
              onPointerDown={(event) => event.preventDefault()}
            >
              <Checkbox
                checked={value.length === 0}
                onCheckedChange={(checked) => onChange(checked ? [] : deselectPlanTableColumnFilter())}
                className="h-3.5 w-3.5"
                aria-label="Select all"
              />
              Select all
            </label>
            <label
              className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium whitespace-nowrap"
              onPointerDown={(event) => event.preventDefault()}
            >
              <Checkbox
                checked={isPlanTableColumnDeselected(value)}
                onCheckedChange={(checked) =>
                  onChange(checked ? deselectPlanTableColumnFilter() : [])
                }
                className="h-3.5 w-3.5"
                aria-label="Deselect all"
              />
              Deselect all
            </label>
          </div>
        </div>
        {searchable ? (
          <div className="px-2 pb-2 pt-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search…"
              className="h-8 text-xs"
            />
          </div>
        ) : null}
        <div className="max-h-56 overflow-y-auto overflow-x-visible px-1 pb-1">
          {visibleOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={isPlanTableFilterOptionChecked(value, option.value, allValues)}
              onCheckedChange={(checked) =>
                onChange(togglePlanTableFilterOption(value, option.value, Boolean(checked), allValues))
              }
              onSelect={(event) => event.preventDefault()}
              className="text-xs items-start whitespace-normal"
            >
              <span className="break-words">{option.label}</span>
            </DropdownMenuCheckboxItem>
          ))}
          {visibleOptions.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">No matches.</p>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PlanComparisonTable({
  plans,
  filterResetKey,
  selectedPlanKey,
  onSelectPlan,
  comparePlanKeys = [],
  onToggleComparePlan,
  maxComparePlans = 3,
  scenario,
  myAvailablePlans,
  isAreaCatalogList,
  usesInnerScroll,
  stickyTableHeader,
  stickyHeaderTopClass = "top-0",
  parentScrolls = false,
}: {
  plans: PlanDetail[];
  filterResetKey: string;
  selectedPlanKey: string | null;
  onSelectPlan: (plan: PlanDetail) => void;
  comparePlanKeys?: string[];
  onToggleComparePlan?: (plan: PlanDetail) => void;
  maxComparePlans?: number;
  scenario: { year: number; zip3: string; medications?: Medication[] | unknown[] };
  myAvailablePlans: PlanDetail[];
  isAreaCatalogList: boolean;
  usesInnerScroll: boolean;
  /** Sticky column headers inside a parent scroll region (e.g. below Rankings tabs). */
  stickyTableHeader?: boolean;
  stickyHeaderTopClass?: string;
  /** Parent owns vertical scroll — avoid nested overflow so sticky headers work. */
  parentScrolls?: boolean;
}) {
  const compareEnabled = onToggleComparePlan != null;
  const intakeMedications = useMemo(
    () => asScenarioMedications(scenario.medications),
    [scenario.medications],
  );
  const [sortKey, setSortKey] = useState<PlanSortKey>("rank");
  const [sortDirection, setSortDirection] = useState<PlanSortDirection>("asc");
  const [filters, setFilters] = useState<PlanTableFilters>(() => emptyPlanTableFilters());

  useEffect(() => {
    setFilters(emptyPlanTableFilters());
    setSortKey("rank");
    setSortDirection("asc");
  }, [filterResetKey]);

  const filteredPlans = useMemo(() => filterPlanTableRows(plans, filters), [plans, filters]);
  const displayPlans = useMemo(
    () => sortPlanDetails(filteredPlans, sortKey, sortDirection),
    [filteredPlans, sortKey, sortDirection],
  );

  const handleSort = (column: PlanTableColumnKey) => {
    const clicked = planTableSortKeyForColumn(column);
    const next = nextSortState(sortKey, sortDirection, clicked);
    setSortKey(next.key);
    setSortDirection(next.direction);
  };

  const planTableHeaderCellClass = PLAN_TABLE_HEADER_CELL_CLASS;

  const stickyHeader = usesInnerScroll || stickyTableHeader === true;
  const stickyLayout = usesInnerScroll || stickyTableHeader === true;

  if (plans.length === 0) return null;

  return (
    <div
      id={BENCHMARK_PLANS_SUBSECTION.top10Rankings}
      data-plan-table-scroll={usesInnerScroll ? "" : undefined}
      className={cn(
        !parentScrolls && !usesInnerScroll && "overflow-x-auto",
        usesInnerScroll && "max-h-[min(70vh,640px)] overflow-y-auto overscroll-contain overflow-x-auto",
      )}
    >
      {hasActivePlanTableFilters(filters) ? (
        <p className="px-2 py-1 text-[10px] text-muted-foreground border-b border-border/40 bg-muted/20">
          Showing {displayPlans.length.toLocaleString()} of {plans.length.toLocaleString()} plans
        </p>
      ) : null}
      <table
        className={cn(
          PLAN_TABLE_CLASS,
          stickyLayout ? "border-separate border-spacing-0" : "border-collapse",
        )}
      >
        <thead
          className={cn(
            stickyHeader &&
              cn(
                "sticky z-30 shadow-[0_2px_4px_rgba(0,0,0,0.18)]",
                stickyHeaderTopClass,
              ),
            "[&_th]:bg-[var(--brand-navy)] [&_th]:text-white",
          )}
        >
          <tr className="bg-[var(--brand-navy)] text-white">
            {compareEnabled ? (
              <th
                className={cn(planTableHeaderCellClass, "w-8 text-center")}
                title={PLAN_COMPARE_SELECT_HINT}
              >
                <span className="sr-only">Compare</span>
                ⇔
              </th>
            ) : null}
            {PLAN_TABLE_COLUMNS.map((column) => {
              const columnSortKey = planTableSortKeyForColumn(column.key);
              const isSorted = sortKey === columnSortKey;
              return (
                <th
                  key={column.key}
                  className={cn(
                    planTableHeaderCellClass,
                    column.align === "right" ? "text-right" : "text-left",
                    column.key === "rank" && "w-8",
                  )}
                  aria-sort={
                    isSorted ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
                  }
                >
                  <div
                    className={cn(
                      "flex items-center gap-0.5",
                      column.align === "right" ? "justify-end" : "justify-start",
                    )}
                  >
                    <button
                      type="button"
                      className={cn(
                        "inline-flex min-w-0 cursor-pointer items-center gap-0.5 rounded hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white",
                        column.align === "right" && "flex-row-reverse",
                      )}
                      onClick={() => handleSort(column.key)}
                    >
                      <span>{column.label}</span>
                      <SortIndicator active={isSorted} direction={sortDirection} />
                    </button>
                    <PlanTableHeaderFilter
                      column={column.key}
                      plans={plans}
                      value={filters[column.key]}
                      onChange={(next) =>
                        setFilters((current) => ({ ...current, [column.key]: next }))
                      }
                    />
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {displayPlans.length === 0 ? (
            <tr>
              <td
                colSpan={PLAN_TABLE_COLUMNS.length + (compareEnabled ? 1 : 0)}
                className="py-4 px-2 text-center text-muted-foreground"
              >
                No plans match the current column filters.
              </td>
            </tr>
          ) : (
            displayPlans.map((plan) => {
              const rowKey = planDetailKey(plan);
              const isSelected = selectedPlanKey === rowKey;
              const isCompared = comparePlanKeys.includes(rowKey);
              const compareDisabled =
                compareEnabled && !isCompared && comparePlanKeys.length >= maxComparePlans;
              return (
                <Fragment key={rowKey}>
                  <tr
                    onClick={() => onSelectPlan(plan)}
                    className={cn(
                      "border-b border-border/50 cursor-pointer hover:bg-muted/40",
                      isSelected && "bg-primary/10",
                      isCompared && "bg-emerald/10",
                      !isSelected &&
                        !isCompared &&
                        !isAreaCatalogList &&
                        myAvailablePlans.some(
                          (memberPlan) =>
                            memberPlan.carrier === plan.carrier && memberPlan.plan === plan.plan,
                        ) &&
                        plan.rank <= 3
                        ? "bg-primary/5"
                        : undefined,
                    )}
                  >
                    {compareEnabled ? (
                      <td className={cn(PLAN_TABLE_BODY_CELL_CLASS, "px-1 text-center")} onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={isCompared}
                          disabled={compareDisabled}
                          onCheckedChange={() => onToggleComparePlan?.(plan)}
                          aria-label={`Compare ${plan.carrier} ${plan.plan}`}
                          className="h-3.5 w-3.5"
                        />
                      </td>
                    ) : null}
                    <td className={cn(PLAN_TABLE_BODY_CELL_CLASS, "font-bold tabular-nums")}>{plan.rank}</td>
                    <td className={PLAN_TABLE_BODY_CELL_CLASS}>
                      <div className="flex items-start gap-1 min-w-0">
                        <ChevronRight
                          aria-hidden
                          className={cn(
                            "shrink-0 text-primary mt-0.5 h-3.5 w-3.5 transition-transform duration-200",
                            isSelected && "rotate-90",
                          )}
                        />
                        <div className="min-w-0">
                          <span
                            className={cn(
                              "font-semibold text-left",
                              !isAreaCatalogList && BENCHMARK_REPORT_LINK_CLASS,
                            )}
                          >
                            {plan.carrier}
                          </span>
                          <div className="text-micro text-muted-foreground">{plan.plan}</div>
                        </div>
                      </div>
                    </td>
                    <td className={cn(PLAN_TABLE_BODY_CELL_CLASS, "text-micro text-muted-foreground")}>{plan.planType}</td>
                    <td className={cn(PLAN_TABLE_BODY_CELL_CLASS, "text-right tabular-nums font-semibold")}>
                      {planUsd(plan.monthly)}
                    </td>
                    <td className={cn(PLAN_TABLE_BODY_CELL_CLASS, "text-right tabular-nums")}>{planUsd(plan.annual)}</td>
                    <td className={cn(PLAN_TABLE_BODY_CELL_CLASS, "text-right tabular-nums")}>{plan.stars}</td>
                  </tr>
                  {isSelected ? (
                    <tr className="border-b border-border/50 bg-muted/15">
                      <td colSpan={PLAN_TABLE_COLUMNS.length + (compareEnabled ? 1 : 0)} className="p-2">
                        <PlanChoiceCard
                          id={planCardAnchorId(plan)}
                          plan={plan}
                          year={scenario.year}
                          zip3={scenario.zip3}
                          rankLabel={
                            plan.rank === 1 ? "· Best match" : planChoiceRankSuffix()
                          }
                          highlight={plan.rank === 1}
                          medications={
                            intakeMedications.length > 0 ? intakeMedications : undefined
                          }
                          compactDrugList
                        />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
