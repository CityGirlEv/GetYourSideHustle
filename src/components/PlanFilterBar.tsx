import { useEffect, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PlanFilterMobileSheet } from "@/components/PlanFilterMobileSheet";
import { PlanFilterPill } from "@/components/PlanFilterPill";
import { PlanFilterPillRow } from "@/components/PlanFilterPillRow";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BENCHMARK_FILTER_LABEL_COLUMN_CLASS,
  BENCHMARK_FILTER_PILLS_WRAP_CLASS,
  BENCHMARK_FILTER_SECTION_HEADER_CLASS,
  BENCHMARK_FILTER_SECTION_HEADING_CLASS,
  BENCHMARK_FILTER_SECTION_TITLE_LABEL_CLASS,
  BENCHMARK_REPORT_DESKTOP_FILTER_CLASS,
  benchmarkFilterRowGridPillCount,
  benchmarkFilterRowLayoutClass,
  BENCHMARK_REPORT_TAB_TRIGGER_CLASS,
} from "@/lib/benchmark-report-ui";
import { PLAN_SCOPE_ASTERISK_DISCLAIMER } from "@/lib/plan-comparison-copy";
import { formatCmsLandscapeLastLoadedNote } from "@/lib/cms-landscape";
import {
  ALL_PLANS_FILTER_HEADING,
  ALL_PLANS_LIST_TABS,
  ALL_PLANS_ROW_PRIMARY_FILTER,
  ALL_PLANS_ROW_SECONDARY_HEADER_FILTERS,
  MA_ROW_FILTERS,
  MEDICARE_ADVANTAGE_GROUP_LABEL,
  MEDIGAP_GROUP_LABEL,
  ALL_PLANS_MEDIGAP_ROW_FILTERS,
  ALL_PLANS_PART_D_ROW_FILTERS,
  MY_AVAILABLE_MEDIGAP_ROW_FILTERS,
  MY_AVAILABLE_PART_D_ROW_FILTERS,
  myAvailableMaRowFiltersForMember,
  MY_AVAILABLE_ROW_MA_LABEL,
  MY_AVAILABLE_ROW_MEDIGAP_LABEL,
  MY_AVAILABLE_ROW_PART_D_LABEL,
  PART_D_GROUP_LABEL,
  PART_D_ROW_FILTERS,
  MY_AVAILABLE_ROW_TOP_10_LABEL,
  MY_AVAILABLE_ROW_TOP_3_LABEL,
  MY_AVAILABLE_ROW_ALL_PLANS_FILTER,
  PLAN_FILTER_GROUPS,
  PLAN_HEADER_FILTERS,
  PLAN_PRIMARY_BUBBLES,
  POSSIBLE_PLANS_FILTER_HEADING,
  POTENTIAL_TOP_3_FILTER,
  TOP_PLAN_FILTER,
  HIGHLY_RATED_SUBFILTERS,
  isPlanFilterRowActive,
  maRowFiltersForCatalogDisplay,
  planActiveFilterPillMeta,
  shouldExcludeDSnpPlans,
  shouldHidePlanFilterCount,
  ZIP_COUNTY_REPORT_BUBBLE,
  ZIP_COUNTY_REPORT_PANEL,
  type AllPlansListTab,
  type HighlyRatedSubTab,
  type PlanFilterId,
  type PlanFilterScope,
  type PlanPanelId,
} from "@/lib/plan-filters";
import { FEDERAL_POVERTY_LEVEL_NOTE } from "@/lib/income-bands";

export const HIGHLY_RATED_CATEGORY_LABEL = "Highly Rated Category";

/** Footnote for My Available* and All Plans* catalog sections. */
export function PlanCatalogScopeDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-[10px] leading-snug text-muted-foreground", className)}>
      * {PLAN_SCOPE_ASTERISK_DISCLAIMER} {formatCmsLandscapeLastLoadedNote()}
    </p>
  );
}

function FilterSectionDisclaimer() {
  return <PlanCatalogScopeDisclaimer className="w-full py-1.5" />;
}

function FilterSectionDivider() {
  return (
    <hr className="-mx-3 sm:-mx-4 border-0 border-t-2 border-[var(--brand-navy)]" aria-hidden />
  );
}

/** Shared label column + flex-wrap pill region — wrapped bubbles stay in the pill column. */
function FilterRowGrid({
  label,
  pillCount,
  layoutPillCount,
  labelCellClassName,
  children,
}: {
  label?: ReactNode;
  pillCount: number;
  /** When set, grid tracks match this count so pill columns align across rows (e.g. section headers). */
  layoutPillCount?: number;
  /** Extra classes on the label grid cell (e.g. right-align section heading buttons). */
  labelCellClassName?: string;
  children: ReactNode;
}) {
  const gridPillCount = benchmarkFilterRowGridPillCount(pillCount, layoutPillCount);
  const multiPill = gridPillCount > 1;

  return (
    <div className={benchmarkFilterRowLayoutClass(gridPillCount)}>
      {label != null ? (
        <div className={cn(BENCHMARK_FILTER_LABEL_COLUMN_CLASS, "pr-0.5", labelCellClassName)}>
          {label}
        </div>
      ) : multiPill ? (
        <div
          className={cn(
            BENCHMARK_FILTER_LABEL_COLUMN_CLASS,
            "invisible pointer-events-none pr-0.5",
          )}
          aria-hidden
        >
          {"\u00A0"}
        </div>
      ) : null}
      <div className={BENCHMARK_FILTER_PILLS_WRAP_CLASS}>{children}</div>
    </div>
  );
}

const sectionTitleTriggerClass = cn(
  BENCHMARK_FILTER_SECTION_HEADING_CLASS,
  "gap-1 transition-colors sm:whitespace-nowrap",
);

/** Collapsible My Available Plans / All Plans section within the filter toolbar. */
function PlanFilterSectionCollapsible({
  title,
  open,
  onOpenChange,
  headerPillCount,
  headerGridPillCount,
  headerRow,
  children,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headerPillCount: number;
  /** Shared grid width so header pills align across My Available and All Plans rows. */
  headerGridPillCount: number;
  headerRow: ReactNode;
  children: ReactNode;
}) {
  const sectionTitle = (
    <>
      <ChevronRight
        aria-hidden
        className="h-3.5 w-3.5 shrink-0 text-white transition-transform duration-200 group-data-[state=open]:rotate-90"
      />
      <span className="min-w-0 truncate">{title}</span>
    </>
  );

  const sectionTitleButton = (
    <CollapsibleTrigger className={sectionTitleTriggerClass}>{sectionTitle}</CollapsibleTrigger>
  );

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="group">
      <div className={BENCHMARK_FILTER_SECTION_HEADER_CLASS}>
        {headerPillCount > 0 ? (
          <FilterRowGrid
            pillCount={headerPillCount}
            layoutPillCount={headerGridPillCount}
            labelCellClassName="flex items-center justify-end"
            label={sectionTitleButton}
          >
            {headerRow}
          </FilterRowGrid>
        ) : (
          <div className={BENCHMARK_FILTER_SECTION_TITLE_LABEL_CLASS}>{sectionTitleButton}</div>
        )}
      </div>
      <CollapsibleContent className="space-y-1.5 pt-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

/** Label with filter pills in a fixed left-to-right order (All always first when listed first). */
function FilterRowInline({
  label,
  filters,
  activePanel,
  activeScope,
  rowScope,
  counts,
  onPanelChange,
  showAllPlanCount = true,
  pillsOnly = false,
}: {
  label?: ReactNode;
  filters: {
    id: PlanFilterId | "why-this-plan";
    label: string;
    hideCount?: boolean;
  }[];
  activePanel: PlanPanelId;
  activeScope: PlanFilterScope;
  rowScope: PlanFilterScope;
  counts: Record<PlanFilterId, number>;
  onPanelChange: (panel: PlanPanelId, scope?: PlanFilterScope) => void;
  showAllPlanCount?: boolean;
  /** When true, render only pills (for inline section header rows). */
  pillsOnly?: boolean;
}) {
  const pills = filters.map((option) => {
    const active = isPlanFilterRowActive(
      activePanel,
      activeScope,
      option.id as PlanFilterId,
      rowScope,
    );
    const filterId = option.id as PlanFilterId;
    return (
      <PlanFilterPill
        key={option.id}
        label={option.label}
        count={counts[filterId]}
        active={active}
        hideCount={
          option.hideCount || shouldHidePlanFilterCount(filterId, rowScope, showAllPlanCount)
        }
        onClick={() => onPanelChange(option.id as PlanPanelId, rowScope)}
        uniformSize
      />
    );
  });

  if (pillsOnly) {
    return <>{pills}</>;
  }

  return (
    <FilterRowGrid
      pillCount={filters.length}
      label={
        label != null ? (
          <span className="block text-right text-xs font-semibold text-foreground leading-snug sm:whitespace-nowrap">
            {label}
          </span>
        ) : undefined
      }
    >
      {pills}
    </FilterRowGrid>
  );
}

function InlineFilterGroupLabel({ label }: { label: string }) {
  return (
    <span className="block text-right text-[10px] font-bold text-foreground leading-snug sm:whitespace-nowrap">
      {label}:
    </span>
  );
}

function InlineFilterGroup({
  label,
  filters,
  activePanel,
  activeScope,
  rowScope,
  counts,
  onPanelChange,
  showAllPlanCount = true,
  subfilterVariant = "pill",
}: {
  label: string;
  filters: { id: PlanFilterId; label: string }[];
  activePanel: PlanPanelId;
  activeScope: PlanFilterScope;
  rowScope: PlanFilterScope;
  counts: Record<PlanFilterId, number>;
  onPanelChange: (panel: PlanPanelId) => void;
  showAllPlanCount?: boolean;
  subfilterVariant?: "pill" | "link";
}) {
  if (filters.length === 0) return null;

  return (
    <FilterRowGrid pillCount={filters.length} label={<InlineFilterGroupLabel label={label} />}>
      {filters.map((option) => (
        <PlanFilterPill
          key={option.id}
          label={option.label}
          count={counts[option.id]}
          active={isPlanFilterRowActive(activePanel, activeScope, option.id, rowScope)}
          onClick={() => onPanelChange(option.id)}
          variant={subfilterVariant}
          uniformSize
          hideCount={shouldHidePlanFilterCount(option.id, rowScope, showAllPlanCount)}
        />
      ))}
    </FilterRowGrid>
  );
}

/** Part D / Medigap / Medicare Advantage bubbles — matches My Available / All Plans styling. */
export function HighlyRatedCategoryFilterRow({
  activeSubTab,
  counts,
  onSubTabChange,
  className,
}: {
  activeSubTab: HighlyRatedSubTab;
  counts: Record<HighlyRatedSubTab, number>;
  onSubTabChange: (tab: HighlyRatedSubTab) => void;
  className?: string;
}) {
  return (
    <div className={className} role="group" aria-label="Highly rated plan categories">
      <FilterRowGrid
        pillCount={HIGHLY_RATED_SUBFILTERS.length}
        label={<InlineFilterGroupLabel label={HIGHLY_RATED_CATEGORY_LABEL} />}
      >
        {HIGHLY_RATED_SUBFILTERS.map((option) => (
          <PlanFilterPill
            key={option.id}
            label={option.label}
            count={counts[option.id as HighlyRatedSubTab]}
            active={activeSubTab === option.id}
            onClick={() => onSubTabChange(option.id as HighlyRatedSubTab)}
            size="compact"
            uniformSize
          />
        ))}
      </FilterRowGrid>
    </div>
  );
}

function planListCategoryTabLabel(tab: { label: string }, count: number) {
  return `${tab.label} (${count})`;
}

/** Reusable in-list category tabs — type or MA sub-type partitions inside the plan list chrome. */
export function PlanListCategoryTabBar({
  tabs,
  activeTab,
  counts,
  onTabChange,
  ariaLabel,
  className,
}: {
  tabs: { id: string; label: string }[];
  activeTab: string;
  counts: Record<string, number>;
  onTabChange: (tab: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value)} className={className}>
      <TabsList
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          "flex h-auto min-w-0 flex-nowrap items-end justify-start gap-0 overflow-x-auto rounded-none bg-transparent p-0",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className={BENCHMARK_REPORT_TAB_TRIGGER_CLASS}>
            {planListCategoryTabLabel(tab, counts[tab.id] ?? 0)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

/** Type tabs within the All Plans catalog list — Medicare Advantage, Supplement, Part D. */
export function AllPlansListTabBar({
  activeTab,
  counts,
  onTabChange,
  className,
}: {
  activeTab: AllPlansListTab;
  counts: Record<AllPlansListTab, number>;
  onTabChange: (tab: AllPlansListTab) => void;
  className?: string;
}) {
  return (
    <PlanListCategoryTabBar
      tabs={ALL_PLANS_LIST_TABS}
      activeTab={activeTab}
      counts={counts}
      onTabChange={(tab) => onTabChange(tab as AllPlansListTab)}
      ariaLabel="All plans by type"
      className={className}
    />
  );
}

/**
 * Benchmark report — plan filter rows directly under section tabs.
 * Row 1: top-ranked plans plus member category pills; row 2: full national CMS catalog.
 */
export function PossiblePlansFilterRow({
  activePanel,
  activeScope,
  onPanelChange,
  myAvailableCounts,
  areaCounts,
  highlyRatedSubTab,
  highlyRatedTabCounts,
  onHighlyRatedSubTabChange,
  className,
  showAllPlanCount = true,
  incomeBand,
  canAccessAllPlansRow = true,
  canAccessZipCountyReport = false,
  canAccessISnpCatalog = true,
}: {
  activePanel: PlanPanelId;
  activeScope: PlanFilterScope;
  onPanelChange: (panel: PlanPanelId, scope: PlanFilterScope) => void;
  myAvailableCounts: Record<PlanFilterId, number>;
  areaCounts: Record<PlanFilterId, number>;
  highlyRatedSubTab?: HighlyRatedSubTab;
  highlyRatedTabCounts?: Record<HighlyRatedSubTab, number>;
  onHighlyRatedSubTabChange?: (tab: HighlyRatedSubTab) => void;
  className?: string;
  /** When false, All Plans (row 2) header "All" pill omits count (admin only). Row 1 always shows its count. */
  showAllPlanCount?: boolean;
  incomeBand?: string;
  /** When false, hide the All Plans (national catalog) filter row. */
  canAccessAllPlansRow?: boolean;
  /** Agent/admin ZIP → county cascading plans report on the All Plans row. */
  canAccessZipCountyReport?: boolean;
  /** When false, hide I-SNP on All Plans MA row (i-snp-catalog add-on). */
  canAccessISnpCatalog?: boolean;
}) {
  const myAvailableMaRowFilters = myAvailableMaRowFiltersForMember(
    incomeBand,
    canAccessISnpCatalog,
  );
  const allPlansMaRowFilters = maRowFiltersForCatalogDisplay({
    incomeBand,
    scope: "area",
    canAccessISnp: canAccessISnpCatalog,
  });
  const excludeDSnp = shouldExcludeDSnpPlans(incomeBand);
  /** Row 1 category rows mirror row 2 — always list MA / Part D / Medigap pills (zero counts ok). */
  const myAvailableMaFilters = myAvailableMaRowFilters;
  const myAvailableMedigapFilters = MY_AVAILABLE_MEDIGAP_ROW_FILTERS;
  const myAvailablePartDFilters = MY_AVAILABLE_PART_D_ROW_FILTERS;
  const showTopPlan = myAvailableCounts[TOP_PLAN_FILTER.id] > 0;
  const showPotentialTop3 = showTopPlan;
  const showMaGroupRow1 = myAvailableMaRowFilters.length > 0;
  const showMedigapGroupRow1 = MY_AVAILABLE_MEDIGAP_ROW_FILTERS.length > 0;
  const showPartDGroupRow1 = MY_AVAILABLE_PART_D_ROW_FILTERS.length > 0;
  const showMaRow2 = allPlansMaRowFilters.length > 0;
  const showMedigapGroupRow2 = ALL_PLANS_MEDIGAP_ROW_FILTERS.length > 0;
  const showPartDGroupRow2 = ALL_PLANS_PART_D_ROW_FILTERS.length > 0;
  const showMyAvailableRow =
    showTopPlan ||
    showPotentialTop3 ||
    showMaGroupRow1 ||
    showMedigapGroupRow1 ||
    showPartDGroupRow1 ||
    myAvailableCounts.all > 0;
  const showAllPlansRow =
    canAccessAllPlansRow &&
    areaCounts.all > 0 &&
    (ALL_PLANS_ROW_PRIMARY_FILTER != null ||
      ALL_PLANS_ROW_SECONDARY_HEADER_FILTERS.length > 0 ||
      showMaRow2 ||
      showMedigapGroupRow2 ||
      showPartDGroupRow2);

  const [myAvailableOpen, setMyAvailableOpen] = useState(true);
  const [allPlansOpen, setAllPlansOpen] = useState(false);

  useEffect(() => {
    if (activePanel === ZIP_COUNTY_REPORT_PANEL && activeScope === "area") {
      setAllPlansOpen(true);
    }
  }, [activePanel, activeScope]);

  const myAvailableHeaderFilters = [
    ...(myAvailableCounts.all > 0 ? [MY_AVAILABLE_ROW_ALL_PLANS_FILTER] : []),
    ...(showPotentialTop3
      ? [{ id: POTENTIAL_TOP_3_FILTER.id, label: MY_AVAILABLE_ROW_TOP_3_LABEL, hideCount: true }]
      : []),
    ...(showTopPlan
      ? [{ id: TOP_PLAN_FILTER.id, label: MY_AVAILABLE_ROW_TOP_10_LABEL, hideCount: true }]
      : []),
  ];

  const allPlansHeaderFilters = [
    ALL_PLANS_ROW_PRIMARY_FILTER,
    ...(showPotentialTop3
      ? [{ id: POTENTIAL_TOP_3_FILTER.id, label: MY_AVAILABLE_ROW_TOP_3_LABEL, hideCount: true }]
      : []),
    ...(showTopPlan
      ? [{ id: TOP_PLAN_FILTER.id, label: MY_AVAILABLE_ROW_TOP_10_LABEL, hideCount: true }]
      : []),
    ...ALL_PLANS_ROW_SECONDARY_HEADER_FILTERS,
  ];

  const sectionHeaderGridPillCount = Math.max(
    showMyAvailableRow ? myAvailableHeaderFilters.length : 0,
    showAllPlansRow ? allPlansHeaderFilters.length : 0,
  );

  if (!showMyAvailableRow && !showAllPlansRow) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-slate-100/60 px-3 py-2.5 sm:px-4 sm:py-3 space-y-2",
        className,
      )}
      role="toolbar"
      aria-label="Filter possible plans"
    >
      {showMyAvailableRow ? (
        <PlanFilterSectionCollapsible
          title={POSSIBLE_PLANS_FILTER_HEADING}
          open={myAvailableOpen}
          onOpenChange={setMyAvailableOpen}
          headerPillCount={myAvailableHeaderFilters.length}
          headerGridPillCount={sectionHeaderGridPillCount}
          headerRow={
            <FilterRowInline
              pillsOnly
              filters={myAvailableHeaderFilters}
              activePanel={activePanel}
              activeScope={activeScope}
              rowScope="member"
              counts={myAvailableCounts}
              onPanelChange={onPanelChange}
              showAllPlanCount={showAllPlanCount}
            />
          }
        >
          {showMedigapGroupRow1 ? (
            <InlineFilterGroup
              label={MY_AVAILABLE_ROW_MEDIGAP_LABEL}
              filters={myAvailableMedigapFilters}
              activePanel={activePanel}
              activeScope={activeScope}
              rowScope="member"
              counts={myAvailableCounts}
              onPanelChange={(panel) => onPanelChange(panel, "member")}
              showAllPlanCount={showAllPlanCount}
            />
          ) : null}

          {showPartDGroupRow1 ? (
            <InlineFilterGroup
              label={MY_AVAILABLE_ROW_PART_D_LABEL}
              filters={myAvailablePartDFilters}
              activePanel={activePanel}
              activeScope={activeScope}
              rowScope="member"
              counts={myAvailableCounts}
              onPanelChange={(panel) => onPanelChange(panel, "member")}
              showAllPlanCount={showAllPlanCount}
            />
          ) : null}

          {showMaGroupRow1 ? (
            <InlineFilterGroup
              label={MY_AVAILABLE_ROW_MA_LABEL}
              filters={myAvailableMaFilters}
              activePanel={activePanel}
              activeScope={activeScope}
              rowScope="member"
              counts={myAvailableCounts}
              onPanelChange={(panel) => onPanelChange(panel, "member")}
              showAllPlanCount={showAllPlanCount}
            />
          ) : null}
        </PlanFilterSectionCollapsible>
      ) : null}

      {showMyAvailableRow && showAllPlansRow ? <FilterSectionDivider /> : null}

      {showAllPlansRow ? (
        <PlanFilterSectionCollapsible
          title={ALL_PLANS_FILTER_HEADING}
          open={allPlansOpen}
          onOpenChange={setAllPlansOpen}
          headerPillCount={allPlansHeaderFilters.length}
          headerGridPillCount={sectionHeaderGridPillCount}
          headerRow={
            <FilterRowInline
              pillsOnly
              filters={allPlansHeaderFilters}
              activePanel={activePanel}
              activeScope={activeScope}
              rowScope="area"
              counts={areaCounts}
              onPanelChange={onPanelChange}
              showAllPlanCount={showAllPlanCount}
            />
          }
        >
          {showMedigapGroupRow2 ? (
            <InlineFilterGroup
              label={MEDIGAP_GROUP_LABEL}
              filters={ALL_PLANS_MEDIGAP_ROW_FILTERS}
              activePanel={activePanel}
              activeScope={activeScope}
              rowScope="area"
              counts={areaCounts}
              onPanelChange={(panel) => onPanelChange(panel, "area")}
              showAllPlanCount={showAllPlanCount}
            />
          ) : null}

          {showPartDGroupRow2 ? (
            <InlineFilterGroup
              label={PART_D_GROUP_LABEL}
              filters={ALL_PLANS_PART_D_ROW_FILTERS}
              activePanel={activePanel}
              activeScope={activeScope}
              rowScope="area"
              counts={areaCounts}
              onPanelChange={(panel) => onPanelChange(panel, "area")}
              showAllPlanCount={showAllPlanCount}
            />
          ) : null}

          {showMaRow2 ? (
            <InlineFilterGroup
              label={MEDICARE_ADVANTAGE_GROUP_LABEL}
              filters={allPlansMaRowFilters}
              activePanel={activePanel}
              activeScope={activeScope}
              rowScope="area"
              counts={areaCounts}
              onPanelChange={(panel) => onPanelChange(panel, "area")}
              showAllPlanCount={showAllPlanCount}
            />
          ) : null}

          {canAccessZipCountyReport ? (
            <FilterRowGrid pillCount={1} label={<InlineFilterGroupLabel label="County report" />}>
              <PlanFilterPill
                label={ZIP_COUNTY_REPORT_BUBBLE.label}
                active={activePanel === ZIP_COUNTY_REPORT_PANEL && activeScope === "area"}
                hideCount
                onClick={() => onPanelChange(ZIP_COUNTY_REPORT_PANEL, "area")}
                uniformSize
              />
            </FilterRowGrid>
          ) : null}
        </PlanFilterSectionCollapsible>
      ) : null}

      {showMyAvailableRow || showAllPlansRow ? (
        <>
          <FilterSectionDivider />
          {excludeDSnp ? (
            <p className="text-[10px] leading-snug text-muted-foreground py-0.5">
              {FEDERAL_POVERTY_LEVEL_NOTE}
            </p>
          ) : null}
          <FilterSectionDisclaimer />
          <FilterSectionDivider />
        </>
      ) : null}

      {activePanel === "highly-rated" &&
      highlyRatedSubTab != null &&
      highlyRatedTabCounts != null &&
      onHighlyRatedSubTabChange ? (
        <HighlyRatedCategoryFilterRow
          activeSubTab={highlyRatedSubTab}
          counts={highlyRatedTabCounts}
          onSubTabChange={onHighlyRatedSubTabChange}
        />
      ) : null}
    </div>
  );
}

type PossiblePlansFilterRowProps = Parameters<typeof PossiblePlansFilterRow>[0];

/** Benchmark report filters — inline bubble rows on desktop; hamburger sheet on mobile. */
export function ResponsivePossiblePlansFilterRow(props: PossiblePlansFilterRowProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const counts =
    props.activeScope === "member" ? props.myAvailableCounts : props.areaCounts;
  const activeMeta = planActiveFilterPillMeta(
    props.activePanel as PlanFilterId,
    props.activeScope,
    counts,
    props.showAllPlanCount,
  );

  const handlePanelChange = (panel: PlanPanelId, scope?: PlanFilterScope) => {
    props.onPanelChange(panel, scope ?? props.activeScope);
    setMobileOpen(false);
  };

  const handleHighlyRatedSubTabChange = (tab: HighlyRatedSubTab) => {
    props.onHighlyRatedSubTabChange?.(tab);
    setMobileOpen(false);
  };

  const filterRow = (
    <PossiblePlansFilterRow
      {...props}
      onPanelChange={handlePanelChange}
      onHighlyRatedSubTabChange={
        props.onHighlyRatedSubTabChange ? handleHighlyRatedSubTabChange : undefined
      }
    />
  );

  return (
    <>
      <div className={BENCHMARK_REPORT_DESKTOP_FILTER_CLASS}>{filterRow}</div>
      <PlanFilterMobileSheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        activeFilterLabel={activeMeta.label}
        activeFilterCount={activeMeta.count}
        hideActiveFilterCount={activeMeta.hideCount}
        className="px-1"
      >
        {filterRow}
      </PlanFilterMobileSheet>
    </>
  );
}

/** Standalone plan comparison — desktop bubble rows; mobile hamburger sheet. */
export function ResponsivePlanFilterBar({
  activePanel,
  onPanelChange,
  counts,
  className,
}: {
  activePanel: PlanPanelId;
  onPanelChange: (panel: PlanPanelId) => void;
  counts: Record<PlanFilterId, number>;
  className?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeMeta = planActiveFilterPillMeta(activePanel as PlanFilterId, "area", counts);

  const handlePanelChange = (panel: PlanPanelId) => {
    onPanelChange(panel);
    setMobileOpen(false);
  };

  const filterBar = (
    <PlanFilterBar
      activePanel={activePanel}
      onPanelChange={handlePanelChange}
      counts={counts}
      className={className}
    />
  );

  return (
    <>
      <div className={BENCHMARK_REPORT_DESKTOP_FILTER_CLASS}>{filterBar}</div>
      <PlanFilterMobileSheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        activeFilterLabel={activeMeta.label}
        activeFilterCount={activeMeta.count}
        hideActiveFilterCount={activeMeta.hideCount}
      >
        {filterBar}
      </PlanFilterMobileSheet>
    </>
  );
}

/** Standalone plan comparison page — legacy multi-row filter bar. */
export function PlanFilterBar({
  activePanel,
  onPanelChange,
  counts,
  className,
}: {
  activePanel: PlanPanelId;
  onPanelChange: (panel: PlanPanelId) => void;
  counts: Record<PlanFilterId, number>;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)} role="toolbar" aria-label="Filter plans">
      <PlanFilterPillRow>
        {PLAN_PRIMARY_BUBBLES.map((bubble) => (
          <PlanFilterPill
            key={bubble.id}
            label={bubble.label}
            active={activePanel === bubble.id}
            onClick={() => onPanelChange(bubble.id)}
            hideCount={bubble.id === "why-this-plan"}
            uniformSize
          />
        ))}
      </PlanFilterPillRow>

      <PlanFilterPillRow>
        {PLAN_HEADER_FILTERS.map((option) => (
          <PlanFilterPill
            key={option.id}
            label={option.label}
            count={counts[option.id]}
            active={activePanel === option.id}
            onClick={() => onPanelChange(option.id)}
            uniformSize
          />
        ))}
      </PlanFilterPillRow>

      {PLAN_FILTER_GROUPS.map((group) => (
        <FilterRowGrid
          key={group.id}
          pillCount={group.id === "medicare-advantage" ? MA_ROW_FILTERS.length : group.filters.length}
          label={
            <span className="text-micro font-semibold uppercase tracking-wide text-muted-foreground shrink-0">
              {group.label}
            </span>
          }
        >
          {(group.id === "medicare-advantage" ? MA_ROW_FILTERS : group.filters).map((option) => (
            <PlanFilterPill
              key={option.id}
              label={option.label}
              count={counts[option.id]}
              active={activePanel === option.id}
              onClick={() => onPanelChange(option.id)}
              uniformSize
            />
          ))}
        </FilterRowGrid>
      ))}
    </div>
  );
}
