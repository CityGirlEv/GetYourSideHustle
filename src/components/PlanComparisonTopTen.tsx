import { PLAN_COMPARISON_EDUCATIONAL_NOTE } from "@/lib/plan-comparison-copy";
import { PLAN_RESULTS_LIST_TAB } from "@/lib/plan-compare-selection";
import { PLAN_SIDE_BY_SIDE_TAB } from "@/lib/plan-side-by-side";
import { PlansLoadingScreen } from "@/components/PlansLoadingScreen";
import { CMS_LANDSCAPE_LOADING_LABEL } from "@/lib/plan-filter-loading";
import { Card } from "@/components/ui/card";
import { ListOrdered } from "lucide-react";
import {
  areaPlanDetails,
  fullCatalogPlanDetails,
  rankedPlanDetails,
  type PlanDetail,
} from "@/lib/plan-details";
import { cn } from "@/lib/utils";
import { PlanChoiceCard } from "@/components/PlanComparisonPlanCard";
import { PlanComparisonTable } from "@/components/PlanComparisonTable";
import {
  PlanListCategoryTabBar,
  PlanCatalogScopeDisclaimer,
  ResponsivePlanFilterBar,
} from "@/components/PlanFilterBar";
import { PlanFilterLoadingOverlay } from "@/components/PlanFilterLoadingOverlay";
import { PlanCompareHintBubble } from "@/components/PlanCompareHintBubble";
import { PlanFilterPill } from "@/components/PlanFilterPill";
import { PlanResultsViewTabs } from "@/components/PlanResultsViewTabs";
import { usePlanCompareSelection } from "@/hooks/use-plan-compare-selection";
import { useCmsLandscapeReady } from "@/hooks/use-cms-landscape-ready";
import { WhyThisPlanSection } from "@/components/WhyThisPlanSection";
import { ZipCountyPlansReportPanel } from "@/components/ZipCountyPlansReportPanel";
import { useDeferredPlanFilter, useProgressivePlanRows } from "@/hooks/use-plan-filter-progress";
import {
  BenchmarkReportCollapsible,
  BenchmarkReportSubsection,
} from "@/components/BenchmarkReportCollapsible";
import { asScenarioMedications } from "@/lib/plan-drug-estimate";
import { partDMedicationsFromIntake } from "@/lib/part-b-drugs";
import { PlanEnteredDrugSummary } from "@/components/PlanDrugCostList";
import { PartBDrugCoverageList } from "@/components/PartBDrugCoverageList";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";
import {
  BENCHMARK_EMBEDDED_PLAN_RESULTS_BODY_CLASS,
  BENCHMARK_EMBEDDED_PLAN_TABLE_SHELL_CLASS,
  BENCHMARK_PLAN_LIST_CHROME_CLASS,
  BENCHMARK_PLANS_SUBSECTION,
  BENCHMARK_REPORT_STICKY_SCROLL_MT,
  BENCHMARK_SECTION_HEADING_CLASS,
  planCardAnchorId,
  scrollToBenchmarkPlanCard,
  scrollToBenchmarkPlanListHeading,
} from "@/lib/benchmark-report-ui";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";
import {
  defaultPlanListCategoryTab,
  filterPlansForScope,
  filterPlansByListCategoryTabRanked,
  planListCategoryTabCounts,
  planListCategoryTabRankingsMeta,
  planListCategoryTabsForPanel,
  planListCategoryTabAriaLabel,
  shouldShowPlanListCategoryTabs,
  planDetailKey,
  planFilterCounts,
  myAvailableRowFilterCounts,
  planFilterRankingsMeta,
  planPanelEmbeddedHeading,
  planActiveFilterPillMeta,
  plansForDetailCards,
  plansForPotentialTop3,
  plansForRankingsTable,
  shouldShowPlanWhySection,
  highlyRatedCriteriaSentence,
  top10RankingsMethodologySentence,
  type HighlyRatedSubTab,
  type PlanFilterId,
  type PlanFilterScope,
  type PlanListCategoryTabId,
  type PlanPanelId,
  isAreaCatalogListPanel,
  isPlanListPanel,
  isZipCountyReportPanel,
  isMaCatalogSubfilterPanel,
  PLAN_HEADER_FILTERS,
  applyMyAvailablePlanExclusions,
  planDrugDisplayContextForPanel,
  type PlanDrugDisplayContext,
} from "@/lib/plan-filters";

export function PlanComparisonTopTen({
  scenario,
  className,
  embedded = false,
  openSubsections,
  onSubsectionOpenChange,
  activeSubsectionId,
  sectionNumber,
  sectionTitle,
  resetOneVsTwoKey,
  highlyRatedSubTab: highlyRatedSubTabProp,
  onHighlyRatedSubTabChange,
  hideHighlyRatedCategoryRow = false,
  activePanel: activePanelProp,
  onPanelChange,
  planFilterScope,
  initialCatalogDeferred = false,
  onInitialCatalogReady,
  showAllPlanCount = true,
  canAccessZipCountyReport = false,
  canAccessCountyReportZip3 = false,
  canAccessCountyReportZip5 = false,
  canAccessISnpCatalog = true,
}: {
  scenario: ScenarioPdfInput & { county?: string };
  className?: string;
  embedded?: boolean;
  openSubsections?: string[];
  onSubsectionOpenChange?: (id: string, open: boolean) => void;
  activeSubsectionId?: string;
  sectionNumber?: number;
  sectionTitle?: string;
  /** Bump when the Potential Options tab opens to collapse #1 vs #2. */
  resetOneVsTwoKey?: number;
  /** Controlled Highly Rated sub-tab (Part D / Medigap / MA). */
  highlyRatedSubTab?: HighlyRatedSubTab;
  onHighlyRatedSubTabChange?: (tab: HighlyRatedSubTab) => void;
  /** When true, category bubbles render in PossiblePlansFilterRow instead. */
  hideHighlyRatedCategoryRow?: boolean;
  /** Controlled filter panel â€” used when filters render above the card (benchmark report). */
  activePanel?: PlanPanelId;
  onPanelChange?: (panel: PlanPanelId, scope?: PlanFilterScope) => void;
  /** Row 1 (member top pool) vs row 2 (full national CMS catalog) â€” benchmark report only. */
  planFilterScope?: PlanFilterScope;
  /** Defer catalog useMemos so a parent overlay can paint first. */
  initialCatalogDeferred?: boolean;
  /** Called once when deferred catalog work and initial filterTopPlans render complete. */
  onInitialCatalogReady?: () => void;
  /** When false, All Plans (row 2) header "All" pill omits count (admin only). Row 1 always shows its count. */
  showAllPlanCount?: boolean;
  /** Agent/admin — inline ZIP/county report sub-view on Potential Options. */
  canAccessZipCountyReport?: boolean;
  /** County report by 3-digit ZIP prefix (county-report-zip3 add-on). */
  canAccessCountyReportZip3?: boolean;
  /** County report by 5-digit ZIP (county-report-zip5 add-on). */
  canAccessCountyReportZip5?: boolean;
  /** When false, hide I-SNP in MA category tabs (i-snp-catalog add-on). */
  canAccessISnpCatalog?: boolean;
}) {
  const [internalPanel, setInternalPanel] = useState<PlanPanelId>("my-available");
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const [resultsViewTab, setResultsViewTab] = useState(PLAN_RESULTS_LIST_TAB);
  const pendingPlanKeyRef = useRef<string | null>(null);
  const pendingScrollPlanRef = useRef<PlanDetail | null>(null);
  const [internalHighlyRatedSubTab, setInternalHighlyRatedSubTab] =
    useState<HighlyRatedSubTab>("all");
  const [planListCategoryTab, setPlanListCategoryTab] = useState<PlanListCategoryTabId>("all");
  const highlyRatedSubTab = highlyRatedSubTabProp ?? internalHighlyRatedSubTab;
  const setHighlyRatedSubTab = onHighlyRatedSubTabChange ?? setInternalHighlyRatedSubTab;
  const activePanel = activePanelProp ?? internalPanel;
  const filterScope: PlanFilterScope = planFilterScope ?? "area";
  const changePanel = useCallback(
    (panel: PlanPanelId, scope: PlanFilterScope = filterScope) => {
      if (!pendingPlanKeyRef.current) {
        setSelectedPlanKey(null);
      }
      setResultsViewTab(PLAN_RESULTS_LIST_TAB);
      if (onPanelChange) onPanelChange(panel, scope);
      else setInternalPanel(panel);
    },
    [filterScope, onPanelChange],
  );
  const handlePlanListCategoryTabChange = useCallback(
    (tab: PlanListCategoryTabId) => {
      setSelectedPlanKey(null);
      setResultsViewTab(PLAN_RESULTS_LIST_TAB);
      setPlanListCategoryTab(tab);
      if (activePanel === "highly-rated") {
        setHighlyRatedSubTab(tab as HighlyRatedSubTab);
        return;
      }
      if (
        activePanel === "medicare-part-d" ||
        activePanel === "medicare-supplement" ||
        activePanel === "medigap"
      ) {
        if (tab === "all") {
          changePanel("all", filterScope);
        } else if (
          tab === "medicare-part-d" ||
          tab === "medicare-supplement" ||
          tab === "medicare-advantage"
        ) {
          changePanel(tab as PlanPanelId, filterScope);
        }
        return;
      }
      if (activePanel === "medicare-advantage" || isMaCatalogSubfilterPanel(activePanel)) {
        changePanel(tab as PlanPanelId, filterScope);
      }
    },
    [activePanel, setHighlyRatedSubTab, changePanel, filterScope],
  );
  const incomeBand = scenario.incomeBand;
  const showPlanListCategoryTabs = shouldShowPlanListCategoryTabs(activePanel, filterScope);
  const planListCategoryTabs = useMemo(
    () =>
      planListCategoryTabsForPanel(activePanel, filterScope, incomeBand, canAccessISnpCatalog),
    [activePanel, filterScope, incomeBand, canAccessISnpCatalog],
  );

  const memberPlanInput = {
    year: scenario.year,
    zip3: scenario.zip3,
    county: scenario.county,
    medications: scenario.medications,
  };

  const fullCatalogInput = {
    year: scenario.year,
    medications: scenario.medications,
  };

  const landscapeReady = useCmsLandscapeReady();
  const [catalogReady, setCatalogReady] = useState(!initialCatalogDeferred);
  const initialCatalogReadyCalledRef = useRef(false);

  useEffect(() => {
    if (!initialCatalogDeferred) {
      setCatalogReady(true);
      return;
    }
    setCatalogReady(false);
    let frame2: number | undefined;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        startTransition(() => {
          setCatalogReady(true);
        });
      });
    });
    return () => {
      cancelAnimationFrame(frame1);
      if (frame2 != null) cancelAnimationFrame(frame2);
    };
  }, [initialCatalogDeferred]);

  const myAvailablePlansRaw = useMemo(
    () => (catalogReady && landscapeReady ? rankedPlanDetails(memberPlanInput) : []),
    [
      catalogReady,
      landscapeReady,
      scenario.year,
      scenario.zip3,
      scenario.county,
      scenario.medications,
    ],
  );

  const memberPlansRaw = useMemo(
    () => (catalogReady && landscapeReady ? areaPlanDetails(memberPlanInput) : []),
    [
      catalogReady,
      landscapeReady,
      scenario.year,
      scenario.zip3,
      scenario.county,
      scenario.medications,
    ],
  );

  const fullCatalogPlansRaw = useMemo(
    () => (catalogReady && landscapeReady ? fullCatalogPlanDetails(fullCatalogInput) : []),
    [catalogReady, landscapeReady, scenario.year, scenario.medications],
  );

  const myAvailablePlans = useMemo(
    () => applyMyAvailablePlanExclusions(myAvailablePlansRaw, { incomeBand }),
    [myAvailablePlansRaw, incomeBand],
  );

  const memberPlans = useMemo(
    () => applyMyAvailablePlanExclusions(memberPlansRaw, { incomeBand }),
    [memberPlansRaw, incomeBand],
  );

  const fullCatalogPlans = fullCatalogPlansRaw;

  const filterCounts = useMemo(() => {
    if (filterScope === "member") {
      return myAvailableRowFilterCounts(memberPlans, myAvailablePlans);
    }
    return planFilterCounts(fullCatalogPlans, myAvailablePlans);
  }, [filterScope, memberPlans, myAvailablePlans, fullCatalogPlans]);

  const activeListCategoryTab =
    activePanel === "highly-rated" && highlyRatedSubTabProp != null
      ? highlyRatedSubTabProp
      : planListCategoryTab;

  const requestedPlanCount = useMemo(() => {
    if (!isPlanListPanel(activePanel)) return 0;
    return filterCounts[activePanel as PlanFilterId] ?? 0;
  }, [activePanel, filterCounts]);

  const {
    appliedPanelKey,
    appliedScopeKey,
    appliedTabKey,
    progress: filterProgress,
    beginRendering,
    updateRendering,
    complete: completeFilterProgress,
    rowChunkSize,
    progressThreshold,
  } = useDeferredPlanFilter({
    panelKey: activePanel,
    scopeKey: filterScope,
    tabKey: activeListCategoryTab,
    catalogPlanCount: requestedPlanCount,
    enableProgressOverlay: embedded,
  });

  const appliedPanel = appliedPanelKey as PlanPanelId;
  const appliedScope = appliedScopeKey as PlanFilterScope;
  const appliedListCategoryTab = appliedTabKey as PlanListCategoryTabId;
  const filterApplied =
    appliedPanelKey === activePanel &&
    appliedScopeKey === filterScope &&
    appliedTabKey === activeListCategoryTab;

  const appliedShowPlanListCategoryTabs = shouldShowPlanListCategoryTabs(
    appliedPanel,
    appliedScope,
  );

  const basePlans = useMemo(() => {
    if (!isPlanListPanel(appliedPanel)) return [];
    return filterPlansForScope(
      fullCatalogPlans,
      appliedPanel,
      myAvailablePlans,
      appliedScope,
      memberPlans,
      scenario.costPreference,
    );
  }, [
    fullCatalogPlans,
    appliedPanel,
    myAvailablePlans,
    appliedScope,
    memberPlans,
    scenario.costPreference,
  ]);

  const planFilter: PlanFilterId = isPlanListPanel(appliedPanel) ? appliedPanel : "my-available";

  const plans = useMemo(() => {
    if (!appliedShowPlanListCategoryTabs) return basePlans;
    const defaultTab = defaultPlanListCategoryTab(appliedPanel);
    if (appliedListCategoryTab === defaultTab) return basePlans;
    const filtered = filterPlansByListCategoryTabRanked(
      basePlans,
      appliedPanel,
      appliedListCategoryTab,
      myAvailablePlans,
      scenario.costPreference,
    );
    if (filtered.length === 0 && basePlans.length > 0) return basePlans;
    return filtered;
  }, [
    basePlans,
    appliedShowPlanListCategoryTabs,
    appliedListCategoryTab,
    appliedPanel,
    myAvailablePlans,
    scenario.costPreference,
  ]);

  const planListCategoryTabCountsForBar = useMemo(() => {
    if (!appliedShowPlanListCategoryTabs) return null;
    return planListCategoryTabCounts(
      basePlans,
      appliedPanel,
      myAvailablePlans,
      scenario.costPreference,
    );
  }, [
    appliedShowPlanListCategoryTabs,
    basePlans,
    appliedPanel,
    myAvailablePlans,
    scenario.costPreference,
  ]);

  const filterTopPlans = useMemo(() => {
    if (appliedPanel === "why-this-plan") {
      return plansForPotentialTop3(
        appliedPanel,
        planFilter,
        memberPlans,
        myAvailablePlans,
        fullCatalogPlans,
        appliedScope,
      );
    }
    if (planFilter === "highly-rated") {
      return [];
    }
    return plansForPotentialTop3(
      appliedPanel,
      planFilter,
      memberPlans,
      myAvailablePlans,
      fullCatalogPlans,
      appliedScope,
    );
  }, [
    appliedPanel,
    planFilter,
    memberPlans,
    myAvailablePlans,
    fullCatalogPlans,
    appliedScope,
    plans,
  ]);

  useLayoutEffect(() => {
    if (
      !initialCatalogDeferred ||
      !catalogReady ||
      initialCatalogReadyCalledRef.current ||
      !onInitialCatalogReady
    ) {
      return;
    }
    initialCatalogReadyCalledRef.current = true;
    onInitialCatalogReady();
  }, [initialCatalogDeferred, catalogReady, filterTopPlans, onInitialCatalogReady]);

  const rankingsPlans = useMemo(
    () => plansForRankingsTable(plans, planFilter),
    [plans, planFilter],
  );

  const detailPlans = useMemo(() => plansForDetailCards(plans, planFilter), [plans, planFilter]);

  const rankingsMeta = useMemo(() => {
    if (appliedShowPlanListCategoryTabs) {
      return planListCategoryTabRankingsMeta(
        appliedPanel,
        appliedListCategoryTab,
        plans.length,
        appliedScope,
      );
    }
    return planFilterRankingsMeta(planFilter, plans.length, appliedScope);
  }, [
    planFilter,
    plans.length,
    appliedScope,
    appliedShowPlanListCategoryTabs,
    appliedPanel,
    appliedListCategoryTab,
  ]);

  const embeddedHeading = useMemo(() => {
    const panel = filterApplied ? appliedPanel : activePanel;
    const scope = filterApplied ? appliedScope : filterScope;
    if (isZipCountyReportPanel(panel)) {
      return planPanelEmbeddedHeading(panel, 0, scope);
    }
    const count = filterApplied
      ? plans.length
      : (filterCounts[panel as PlanFilterId] ?? requestedPlanCount);
    const showCategoryTabs = shouldShowPlanListCategoryTabs(panel, scope);
    if (showCategoryTabs) {
      const tab = filterApplied ? appliedListCategoryTab : activeListCategoryTab;
      return planListCategoryTabRankingsMeta(panel, tab, count, scope);
    }
    return planPanelEmbeddedHeading(panel, count, scope);
  }, [
    filterApplied,
    appliedPanel,
    activePanel,
    plans.length,
    appliedScope,
    filterScope,
    filterCounts,
    requestedPlanCount,
    appliedListCategoryTab,
    activeListCategoryTab,
  ]);

  const listHeadingPanel = filterApplied ? appliedPanel : activePanel;
  const listHeadingScope = filterApplied ? appliedScope : filterScope;
  const areaFilterCounts = useMemo(
    () => planFilterCounts(fullCatalogPlans, myAvailablePlans),
    [fullCatalogPlans, myAvailablePlans],
  );
  const memberFilterCounts = useMemo(
    () => myAvailableRowFilterCounts(memberPlans, myAvailablePlans),
    [memberPlans, myAvailablePlans],
  );
  const listHeadingFilterCounts =
    listHeadingScope === "area" ? areaFilterCounts : memberFilterCounts;
  const activeFilterPill =
    isPlanListPanel(listHeadingPanel) && listHeadingPanel !== "highly-rated"
      ? planActiveFilterPillMeta(
          listHeadingPanel,
          listHeadingScope,
          listHeadingFilterCounts,
          showAllPlanCount,
        )
      : null;

  const showWhySection =
    shouldShowPlanWhySection(appliedPanel, appliedScope) && planFilter !== "highly-rated";
  const isAreaCatalogList =
    isAreaCatalogListPanel(appliedPanel, appliedScope) || planFilter === "highly-rated";

  useLayoutEffect(() => {
    if (pendingPlanKeyRef.current) {
      const key = pendingPlanKeyRef.current;
      pendingPlanKeyRef.current = null;
      setSelectedPlanKey(key);
      return;
    }
    setSelectedPlanKey(null);
  }, [activePanel, filterScope, activeListCategoryTab]);

  useEffect(() => {
    setPlanListCategoryTab(defaultPlanListCategoryTab(activePanel));
    if (activePanel !== "highly-rated") {
      setHighlyRatedSubTab("all");
    }
  }, [activePanel, setHighlyRatedSubTab]);

  useEffect(() => {
    if (!embedded || !isPlanListPanel(activePanel)) return;
    if (pendingScrollPlanRef.current) return;
    scrollToBenchmarkPlanListHeading();
  }, [activePanel, embedded, filterScope, activeListCategoryTab]);

  const openPlanInList = useCallback(
    (plan: PlanDetail) => {
      const panel: PlanFilterId = filterScope === "area" ? "all" : "my-available";
      const key = planDetailKey(plan);
      pendingScrollPlanRef.current = plan;
      if (activePanel === panel) {
        setSelectedPlanKey(key);
        return;
      }
      pendingPlanKeyRef.current = key;
      changePanel(panel, filterScope);
    },
    [activePanel, changePanel, filterScope],
  );

  const showZipCountyReport =
    embedded && canAccessZipCountyReport && isZipCountyReportPanel(activePanel);
  const showWhyPanel = !embedded && showWhySection;
  const embeddedListPanelActive =
    embedded && isPlanListPanel(activePanel) && !shouldShowPlanWhySection(activePanel, filterScope);
  const showPlanList =
    (embedded ? embeddedListPanelActive : isPlanListPanel(appliedPanel) && !showWhySection);
  const showEmbeddedPlanListChrome = embeddedListPanelActive;
  const showEmbeddedWhySection =
    embedded && shouldShowPlanWhySection(activePanel, filterScope) && !embeddedListPanelActive;

  const tablePlans = useMemo(() => {
    if (showEmbeddedWhySection || showWhyPanel) {
      return [];
    }
    return rankingsPlans;
  }, [showEmbeddedWhySection, showWhyPanel, rankingsPlans]);

  const displayTablePlans = useProgressivePlanRows(tablePlans, {
    enabled: embedded && filterProgress.active && filterApplied,
    chunkSize: rowChunkSize,
    threshold: progressThreshold,
    onBegin: beginRendering,
    onChunk: updateRendering,
    onComplete: completeFilterProgress,
  });

  const planTableFilterResetKey = `${appliedPanel}|${appliedScope}|${appliedListCategoryTab}`;
  const {
    comparePlanKeys,
    showCompareCheckboxes,
    sideBySideEnabled,
    sideBySidePlans,
    toggleComparePlan,
  } = usePlanCompareSelection(tablePlans, planTableFilterResetKey);

  useEffect(() => {
    if (!sideBySideEnabled && resultsViewTab === PLAN_SIDE_BY_SIDE_TAB) {
      setResultsViewTab(PLAN_RESULTS_LIST_TAB);
    }
  }, [sideBySideEnabled, resultsViewTab]);

  const planTableUsesInnerScroll = embedded ? false : tablePlans.length > 10;

  useEffect(() => {
    const plan = pendingScrollPlanRef.current;
    if (!plan || !embedded) return;
    if (!isPlanListPanel(appliedPanel) || !filterApplied) return;
    if (selectedPlanKey !== planDetailKey(plan)) return;
    if (filterProgress.active) return;

    const anchorId = planCardAnchorId(plan);
    let attempts = 0;
    let cancelled = false;

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(anchorId);
      if (el) {
        pendingScrollPlanRef.current = null;
        scrollToBenchmarkPlanCard(plan);
        return;
      }
      if (attempts < 24) {
        attempts += 1;
        requestAnimationFrame(tryScroll);
      }
    };

    tryScroll();
    return () => {
      cancelled = true;
    };
  }, [
    embedded,
    appliedPanel,
    filterApplied,
    selectedPlanKey,
    filterProgress.active,
    displayTablePlans.length,
  ]);

  const intakeMedications = useMemo(
    () => asScenarioMedications(scenario.medications),
    [scenario.medications],
  );

  const partDMedications = useMemo(
    () => partDMedicationsFromIntake(intakeMedications),
    [intakeMedications],
  );

  const drugDisplayContext = useMemo((): PlanDrugDisplayContext => {
    const panel = filterApplied ? appliedPanel : activePanel;
    const ratedTab = panel === "highly-rated" ? highlyRatedSubTab : "all";
    const listTab = filterApplied ? appliedListCategoryTab : activeListCategoryTab;
    return planDrugDisplayContextForPanel(panel, ratedTab, listTab);
  }, [
    filterApplied,
    appliedPanel,
    activePanel,
    highlyRatedSubTab,
    appliedListCategoryTab,
    activeListCategoryTab,
  ]);

  if (!landscapeReady) {
    return (
      <Card className={`glass ${className ?? ""}`}>
        <PlansLoadingScreen message={CMS_LANDSCAPE_LOADING_LABEL} />
      </Card>
    );
  }

  const canBrowseAreaCatalog =
    filterScope === "area" &&
    fullCatalogPlans.length > 0 &&
    isPlanListPanel(activePanel);

  if (
    catalogReady &&
    landscapeReady &&
    myAvailablePlans.length === 0 &&
    !isZipCountyReportPanel(activePanel) &&
    !canBrowseAreaCatalog
  ) {
    return (
      <Card className={`glass p-6 text-sm text-muted-foreground ${className ?? ""}`}>
        No plans available for this comparison.
      </Card>
    );
  }

  const top = filterTopPlans[0];
  const runnersUp = filterTopPlans.slice(1);

  const isOpen = (id: string) => openSubsections?.includes(id) ?? false;
  const onOpenChange = (id: string) => (open: boolean) => onSubsectionOpenChange?.(id, open);

  const Section = embedded ? BenchmarkReportSubsection : BenchmarkReportCollapsible;

  const selectPlanFromTable = (plan: PlanDetail) => {
    const key = planDetailKey(plan);
    setSelectedPlanKey((current) => (current === key ? null : key));
  };

  const isSubsectionActive = (id: string) => activeSubsectionId === id;
  const subsectionPanelProps = (id: string) =>
    embedded
      ? { active: isSubsectionActive(id), compact: true }
      : {
          open: isOpen(id),
          onOpenChange: onOpenChange(id),
        };

  const showPlanListCategoryTabsInList =
    showPlanListCategoryTabs && !(activePanel === "highly-rated" && hideHighlyRatedCategoryRow);
  const hasInListCategoryTabs =
    showPlanListCategoryTabsInList && planListCategoryTabCountsForBar != null;

  const usesPlanResultsTabs =
    showPlanList && !showWhyPanel && (tablePlans.length > 0 || filterProgress.active);

  /** Rankings show per-plan estimated drug costs when a plan row is expanded. */
  const showPlanDrugCostHint =
    showPlanList &&
    drugDisplayContext !== "part-b" &&
    (drugDisplayContext === "part-d"
      ? partDMedications.length > 0
      : drugDisplayContext === "medigap"
        ? partDMedications.length > 0
        : intakeMedications.length > 0);

  const planDrugCostHintText =
    drugDisplayContext === "part-d"
      ? "Expand any Part D plan row below for formulary tier placement and estimated costs for your Part D-covered medications — confirm tier and copay on the plan formulary."
      : drugDisplayContext === "medigap"
        ? "Expand any Medigap row below for paired Part D coverage and estimated drug costs for your prescriptions — Medigap does not include drug benefits."
        : "Expand any plan row below for estimated costs for every medication you entered — modeled from plan type and CMS star rating; confirm tier and copay on the plan formulary.";

  const showPartBDrugPanel =
    intakeMedications.length > 0 && drugDisplayContext === "part-b";

  const showPartDDrugSummary =
    partDMedications.length > 0 &&
    (drugDisplayContext === "part-d" || drugDisplayContext === "medigap");

  const planTableBody =
    displayTablePlans.length > 0 || (filterProgress.active && tablePlans.length > 0) ? (
      <PlanComparisonTable
        plans={displayTablePlans}
        filterResetKey={planTableFilterResetKey}
        selectedPlanKey={selectedPlanKey}
        onSelectPlan={selectPlanFromTable}
        comparePlanKeys={comparePlanKeys}
        onToggleComparePlan={showCompareCheckboxes ? toggleComparePlan : undefined}
        scenario={scenario}
        myAvailablePlans={myAvailablePlans}
        isAreaCatalogList={isAreaCatalogList}
        usesInnerScroll={planTableUsesInnerScroll}
        stickyTableHeader={usesPlanResultsTabs || planTableUsesInnerScroll}
        stickyHeaderTopClass="top-0"
        parentScrolls={usesPlanResultsTabs && !planTableUsesInnerScroll}
      />
    ) : null;

  const showCompareHintBubble =
    showEmbeddedPlanListChrome && showCompareCheckboxes && !sideBySideEnabled;

  const planListResultsTabs = usesPlanResultsTabs ? (
    <PlanResultsViewTabs
      activeTab={resultsViewTab}
      onTabChange={setResultsViewTab}
      sideBySideEnabled={sideBySideEnabled}
      sideBySidePlans={sideBySidePlans}
      medications={intakeMedications}
      listContent={planTableBody}
      className="flex min-h-0 flex-1 flex-col"
      bodyScroll
      stickyScroll={false}
    />
  ) : (
    planTableBody
  );

  const whyThisPlanBlock = top ? (
    <WhyThisPlanSection
      scenario={scenario}
      top={top}
      runnersUp={runnersUp}
      planFilter={planFilter}
      planPanel={activePanel}
      filterScope={appliedScope}
      myAvailablePlans={myAvailablePlans}
      compact
      showHeading
      embedded={embedded}
      openSubsections={openSubsections}
      onSubsectionOpenChange={onSubsectionOpenChange}
      activeSubsectionId={activeSubsectionId}
      resetOneVsTwoKey={resetOneVsTwoKey}
      onOpenPlanInList={embedded ? openPlanInList : undefined}
    />
  ) : (
    <p className="text-xs text-muted-foreground rounded border border-border bg-muted/20 px-3 py-2">
      No plans match this filter in your area.
    </p>
  );

  const browseSubtitle = rankingsMeta.subtitle;

  const listCriteriaLine =
    planFilter === "highly-rated" ? (
      <p className="text-xs text-muted-foreground leading-snug">{highlyRatedCriteriaSentence()}</p>
    ) : planFilter === "my-available" ? (
      <p className="text-xs text-muted-foreground leading-snug">
        {top10RankingsMethodologySentence(appliedScope, scenario.costPreference)}
      </p>
    ) : null;

  const hideZipLocationSuffix = appliedScope === "area" && appliedPanel === "my-available";

  const planListCategoryTabRow =
    showPlanListCategoryTabsInList && planListCategoryTabCountsForBar ? (
      <PlanListCategoryTabBar
        tabs={planListCategoryTabs}
        activeTab={activeListCategoryTab}
        counts={planListCategoryTabCountsForBar}
        onTabChange={handlePlanListCategoryTabChange}
        ariaLabel={planListCategoryTabAriaLabel(activePanel)}
      />
    ) : null;

  const showPlanScopeDisclaimer = filterScope === "member" || filterScope === "area";

  const planScopeDisclaimer = showPlanScopeDisclaimer ? (
    <PlanCatalogScopeDisclaimer className="pt-1 border-t border-border/50" />
  ) : null;

  const hasEmbeddedSectionHeading =
    embedded && sectionNumber != null && (showEmbeddedPlanListChrome || showZipCountyReport);

  const embeddedListHeading = hasEmbeddedSectionHeading ? (
    <div
      id={BENCHMARK_PLANS_SUBSECTION.rankingsListHeading}
      tabIndex={-1}
      className="space-y-1.5 py-2.5 outline-none px-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-display font-bold text-xs">
          {sectionNumber}
        </div>
        <ListOrdered className="h-3.5 w-3.5 text-primary shrink-0" />
        {sectionTitle ? (
          <h3
            className={cn(
              "font-display text-sm font-bold leading-snug",
              BENCHMARK_SECTION_HEADING_CLASS,
            )}
          >
            {sectionTitle}
          </h3>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 pl-9 sm:pl-9">
        <h4 className="font-display text-sm font-bold leading-snug text-foreground">
          {embeddedHeading.title}
        </h4>
        {activeFilterPill && listHeadingPanel !== "my-available" ? (
          <PlanFilterPill
            label={activeFilterPill.label}
            count={activeFilterPill.count}
            hideCount={activeFilterPill.hideCount}
            active
            onClick={() => changePanel(listHeadingPanel, listHeadingScope)}
            uniformSize
          />
        ) : null}
        {showCompareHintBubble ? (
          <PlanCompareHintBubble className="shrink-0 max-w-[min(100%,20rem)] sm:max-w-xs" />
        ) : null}
      </div>
      {embeddedHeading.subtitle ? (
        <p className="text-micro text-muted-foreground leading-snug pl-9">
          {embeddedHeading.subtitle}
        </p>
      ) : null}
    </div>
  ) : null;

  const browseSubtitleLine = (
    <p className="text-xs text-muted-foreground leading-snug">
      {browseSubtitle}
      {!hideZipLocationSuffix ? (
        <>
          {" "}
          · ZIP {scenario.zip3}xx
          {scenario.county ? ` · ${scenario.county}` : ""}
        </>
      ) : null}
    </p>
  );

  const planListChrome =
    planListCategoryTabRow ||
    browseSubtitleLine ||
    listCriteriaLine ||
    showPlanDrugCostHint ||
    showPartBDrugPanel ||
    showPartDDrugSummary ? (
      <div className="space-y-1 border-b border-border/40 px-2 py-1.5 bg-background shrink-0">
        {planListCategoryTabRow}
        {listCriteriaLine}
        {browseSubtitleLine}
        {showPartBDrugPanel ? (
          <PartBDrugCoverageList medications={intakeMedications} variant="panel" />
        ) : null}
        {showPlanDrugCostHint ? (
          <p className="text-[10px] text-muted-foreground leading-snug">{planDrugCostHintText}</p>
        ) : null}
        {showPartDDrugSummary ? (
          <PlanEnteredDrugSummary
            medications={partDMedications}
            compact
            title={
              drugDisplayContext === "medigap"
                ? "Your Part D-covered medications — CMS tier placement"
                : "Your Part D-covered medications"
            }
            hint={
              drugDisplayContext === "medigap"
                ? "Expand any Medigap row below for paired Part D formulary coverage and estimated costs on that supplement's modeled PDP."
                : "Expand any Part D plan row below for modeled tier copays and estimated costs on that PDP contract."
            }
          />
        ) : null}
      </div>
    ) : null;

  const planTable =
    usesPlanResultsTabs || (filterProgress.active && showEmbeddedPlanListChrome) ? (
      <div
        className={
          embedded
            ? BENCHMARK_EMBEDDED_PLAN_TABLE_SHELL_CLASS
            : "flex max-h-[min(70vh,640px)] min-h-0 flex-col rounded-md border border-border overflow-hidden"
        }
      >
        <div className="shrink-0 bg-background shadow-sm">
          {embeddedListHeading}
          {planListChrome}
        </div>
        {planListResultsTabs}
      </div>
    ) : null;

  const panelContent = showWhyPanel ? (
    <div className="space-y-2">
      {planListCategoryTabRow}
      {whyThisPlanBlock}
      {planScopeDisclaimer}
    </div>
  ) : showPlanList || showEmbeddedPlanListChrome ? (
    <div className="space-y-2">
      {plans.length === 0 && filterApplied && !filterProgress.active ? (
        <p className="text-xs text-muted-foreground rounded border border-border bg-muted/20 px-3 py-2">
          No plans match this filter in your area.
        </p>
      ) : tablePlans.length > 0 || (filterProgress.active && showEmbeddedPlanListChrome) ? (
        planTable
      ) : null}
      {planScopeDisclaimer}
    </div>
  ) : null;

  const embeddedHeader =
    embedded && !showPlanList && embeddedListHeading ? (
      <div className="border-b border-border/60 px-2 sm:px-3 lg:px-5">{embeddedListHeading}</div>
    ) : null;

  const filterAndList = embedded ? (
    showZipCountyReport ? (
      <div className="space-y-2">
        <ZipCountyPlansReportPanel
          scenario={scenario}
          canAccessISnpCatalog={canAccessISnpCatalog}
          canAccessCountyReportZip3={canAccessCountyReportZip3}
          canAccessCountyReportZip5={canAccessCountyReportZip5}
        />
        {planScopeDisclaimer}
      </div>
    ) : showEmbeddedWhySection ? (
      <div className="space-y-2">
        {planListCategoryTabRow}
        {whyThisPlanBlock}
        {planScopeDisclaimer}
      </div>
    ) : showPlanList || showEmbeddedPlanListChrome ? (
      panelContent
    ) : null
  ) : (
    <div className="space-y-2">
      <ResponsivePlanFilterBar activePanel={activePanel} onPanelChange={changePanel} counts={filterCounts} />
      {panelContent}
    </div>
  );

  const filterAndListWithOverlay = (
    <>
      {embedded ? (
        <PlanFilterLoadingOverlay
          open={filterProgress.active}
          phase={filterProgress.phase}
          planCount={filterProgress.planCount}
          secondsLeft={filterProgress.secondsLeft}
          progress={filterProgress.progress}
          variant="fixed"
        />
      ) : null}
      <div className="relative min-h-[10rem]">{filterAndList}</div>
    </>
  );

  const embeddedBodyContent = (
    <div className={BENCHMARK_EMBEDDED_PLAN_RESULTS_BODY_CLASS}>
      {filterAndListWithOverlay}
      <p className="text-micro text-muted-foreground leading-snug pt-1 border-t border-border/60">
        {PLAN_COMPARISON_EDUCATIONAL_NOTE}
      </p>
    </div>
  );

  const body = embedded ? (
    <div id={BENCHMARK_PLANS_SUBSECTION.rankingsList} className={BENCHMARK_REPORT_STICKY_SCROLL_MT}>
      {embeddedHeader}
      {embeddedBodyContent}
    </div>
  ) : (
    <>
      <div className="flex items-center gap-2">
        <ListOrdered className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold">Top 10 plans in your area</h2>
      </div>
      <div className="hidden md:flex flex-wrap gap-1.5 justify-end">
        {PLAN_HEADER_FILTERS.map((option) => (
          <PlanFilterPill
            key={option.id}
            label={option.label}
            count={filterCounts[option.id]}
            active={activePanel === option.id}
            onClick={() => changePanel(option.id)}
          />
        ))}
      </div>
      {filterAndListWithOverlay}
      {!embedded && detailPlans.length > 0 && activePanel === "my-available" ? (
        <Section
          id={BENCHMARK_PLANS_SUBSECTION.fullDetails}
          title="Full plan details"
          {...subsectionPanelProps(BENCHMARK_PLANS_SUBSECTION.fullDetails)}
        >
          <div className="space-y-3">
            {detailPlans.map((p) => (
              <PlanChoiceCard
                key={`${p.carrier}-${p.plan}`}
                id={planCardAnchorId(p)}
                plan={p}
                year={scenario.year}
                zip3={scenario.zip3}
              />
            ))}
          </div>
        </Section>
      ) : null}
      <p className="text-micro text-muted-foreground border-t border-border pt-2">
        {PLAN_COMPARISON_EDUCATIONAL_NOTE}
      </p>
    </>
  );

  if (embedded) {
    return <div className={cn(className)}>{body}</div>;
  }

  return <Card className={cn("glass p-6 space-y-3", className)}>{body}</Card>;
}
