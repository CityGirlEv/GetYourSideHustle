import { PlanSideBySideComparison } from "@/components/PlanSideBySideComparison";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLAN_SIDE_BY_SIDE_LABEL } from "@/lib/plan-comparison-copy";
import { PLAN_RESULTS_LIST_TAB } from "@/lib/plan-compare-selection";
import { PLAN_SIDE_BY_SIDE_TAB } from "@/lib/plan-side-by-side";
import type { PlanDetail } from "@/lib/plan-details";
import type { Medication } from "@/lib/medicare-math";
import {
  BENCHMARK_REPORT_TAB_TRIGGER_CLASS,
  benchmarkReportTabButtonClass,
  PLAN_RESULTS_BODY_SCROLL_CLASS,
  PLAN_RESULTS_TABS_STICKY_CLASS,
  PLAN_RESULTS_VIEW_SCROLL_CLASS,
  PLAN_TABLE_HEAD_STICKY_BELOW_TABS_CLASS,
} from "@/lib/benchmark-report-ui";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PlanResultsViewTabsProps = {
  listLabel?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sideBySideEnabled: boolean;
  sideBySidePlans: PlanDetail[];
  medications?: Medication[];
  listContent: ReactNode;
  sideBySideIntro?: string;
  className?: string;
  tabsListClassName?: string;
  /** When true, wraps tabs + panels in the plan results scroll region. */
  stickyScroll?: boolean;
  /** When true, tabs stay fixed; only tab panel content scrolls (column headers sticky at top-0). */
  bodyScroll?: boolean;
  tabsStickyClassName?: string;
  tableStickyTopClass?: string;
};

/** Rankings / Side by Side triggers for the sticky report header (standalone, no Radix Tabs parent). */
export function PlanResultsTabTriggers({
  activeTab,
  onTabChange,
  sideBySideEnabled,
  listLabel = "Rankings",
  className,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sideBySideEnabled: boolean;
  listLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Plan results view"
      className={cn(
        "flex h-auto min-w-0 flex-nowrap items-end justify-start gap-0 overflow-x-auto",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === PLAN_RESULTS_LIST_TAB}
        className={cn(
          benchmarkReportTabButtonClass(activeTab === PLAN_RESULTS_LIST_TAB),
          "shrink-0",
        )}
        onClick={() => onTabChange(PLAN_RESULTS_LIST_TAB)}
      >
        {listLabel}
      </button>
      {sideBySideEnabled ? (
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === PLAN_SIDE_BY_SIDE_TAB}
          className={cn(
            benchmarkReportTabButtonClass(activeTab === PLAN_SIDE_BY_SIDE_TAB),
            "shrink-0",
          )}
          onClick={() => onTabChange(PLAN_SIDE_BY_SIDE_TAB)}
        >
          {PLAN_SIDE_BY_SIDE_LABEL}
        </button>
      ) : null}
    </div>
  );
}

/** List + Side by Side view tabs — Side by Side appears once compare is ready. */
export function PlanResultsViewTabs({
  listLabel = "Rankings",
  activeTab,
  onTabChange,
  sideBySideEnabled,
  sideBySidePlans,
  medications = [],
  listContent,
  sideBySideIntro,
  className,
  tabsListClassName,
  stickyScroll = true,
  bodyScroll = false,
  tabsStickyClassName,
  tableStickyTopClass = PLAN_TABLE_HEAD_STICKY_BELOW_TABS_CLASS,
}: PlanResultsViewTabsProps) {
  const tabsStickyClass =
    tabsStickyClassName ?? (stickyScroll && !bodyScroll ? PLAN_RESULTS_TABS_STICKY_CLASS : undefined);
  const stickyColumnHeaders = bodyScroll;

  const tabsList = (
    <TabsList
      role="tablist"
      aria-label="Plan results view"
      className={cn(
        "flex h-auto min-w-0 flex-nowrap items-end justify-start gap-0 overflow-x-auto rounded-none bg-transparent p-0",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        tabsStickyClass,
        tabsListClassName,
      )}
    >
      <TabsTrigger value={PLAN_RESULTS_LIST_TAB} className={BENCHMARK_REPORT_TAB_TRIGGER_CLASS}>
        {listLabel}
      </TabsTrigger>
      {sideBySideEnabled ? (
        <TabsTrigger value={PLAN_SIDE_BY_SIDE_TAB} className={BENCHMARK_REPORT_TAB_TRIGGER_CLASS}>
          {PLAN_SIDE_BY_SIDE_LABEL}
        </TabsTrigger>
      ) : null}
    </TabsList>
  );

  const tabPanels = (
    <>
      <TabsContent value={PLAN_RESULTS_LIST_TAB} className="mt-0">
        {listContent}
      </TabsContent>
      {sideBySideEnabled ? (
        <TabsContent value={PLAN_SIDE_BY_SIDE_TAB} className="mt-0 space-y-2">
          {sideBySideIntro ? (
            <p className="text-xs text-muted-foreground leading-snug px-2 pt-2">
              {sideBySideIntro}
            </p>
          ) : null}
          <PlanSideBySideComparison
            plans={sideBySidePlans}
            medications={medications}
            className="border-0 rounded-none"
            scrollContained={false}
            stickyTableHeader={stickyColumnHeaders}
            stickyHeaderTopClass="top-0"
          />
        </TabsContent>
      ) : null}
    </>
  );

  if (bodyScroll) {
    return (
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className={cn("flex min-h-0 flex-1 flex-col", className)}
      >
        <div className="shrink-0 border-b border-border/60 bg-background px-2 shadow-sm">
          {tabsList}
        </div>
        <div className={cn(PLAN_RESULTS_BODY_SCROLL_CLASS, "relative")}>{tabPanels}</div>
      </Tabs>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className={className}>
      {stickyScroll ? (
        <div className={PLAN_RESULTS_VIEW_SCROLL_CLASS}>
          {tabsList}
          {tabPanels}
        </div>
      ) : (
        <>
          {tabsList}
          {tabPanels}
        </>
      )}
    </Tabs>
  );
}
