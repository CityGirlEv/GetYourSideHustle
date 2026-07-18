import type { PlanDetail } from "@/lib/plan-details";
import { pathwayComparisonPlans } from "@/lib/plan-details";
import { isIncomeAboveFederalPovertyLevel } from "@/lib/income-bands";
import {
  filterPlansForPartBDrugCoverage,
  PART_B_MEDS_TAB_LABEL,
} from "@/lib/part-b-drugs";
import {
  BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
  BENCHMARK_TAB_POSSIBLE_PLANS,
  POTENTIAL_TOP_3_LABEL,
  TOP_10_PLANS_LABEL,
} from "@/lib/plan-comparison-copy";

export type PlanFilterId =
  | "all"
  | "medigap"
  | "medicare-advantage"
  | "medicare-supplement"
  | "medicare-part-d"
  | "ppo"
  | "hmo"
  | "hmo-pos"
  | "pffs"
  | "msa"
  | "c-snp"
  | "d-snp"
  | "i-snp"
  | "highly-rated"
  | "my-available"
  | "medicare-supplement-top-3"
  | "medicare-supplement-top-10"
  | "medicare-part-d-top-3"
  | "medicare-part-d-top-10"
  | "medicare-supplement-highly-rated"
  | "medicare-part-d-highly-rated";

/** Agent ZIP → county cascading plans inventory (All Plans row). */
export const ZIP_COUNTY_REPORT_PANEL = "zip-county-report" as const;

export const ZIP_COUNTY_REPORT_BUBBLE = {
  id: ZIP_COUNTY_REPORT_PANEL,
  label: "County report",
} as const;

/** Active panel — plan list filter, Why This Plan rationale, or ZIP/county report. */
export type PlanPanelId = PlanFilterId | "why-this-plan" | typeof ZIP_COUNTY_REPORT_PANEL;

/**
 * Which benchmark filter row set the active panel — row 1 (member top pool) vs row 2
 * (full national CMS catalog).
 */
export type PlanFilterScope = "member" | "area";

/** Whether a filter pill in a given row should appear selected (panel + scope must both match). */
export function isPlanFilterRowActive(
  activePanel: PlanPanelId,
  activeScope: PlanFilterScope,
  filterId: PlanPanelId,
  rowScope: PlanFilterScope,
): boolean {
  return activePanel === filterId && activeScope === rowScope;
}

export type PlanFilterOption = {
  id: PlanFilterId;
  label: string;
};

export type PlanFilterGroup = {
  id: "medicare-advantage" | "medigap";
  label: string;
  filters: PlanFilterOption[];
};

/** Sort filter pills alphabetically by display label. */
export function sortPlanFiltersByLabel(filters: PlanFilterOption[]): PlanFilterOption[] {
  return [...filters].sort((a, b) => a.label.localeCompare(b.label));
}

/** Shown inline with the section heading (standalone comparison page). */
export const PLAN_HEADER_FILTERS: PlanFilterOption[] = sortPlanFiltersByLabel([
  { id: "all", label: "All" },
  { id: "highly-rated", label: "4.5+" },
]);

/** Benchmark report row 2 — category pills beside the "All Plans:" heading. */
export const ALL_PLANS_ROW_HEADER_FILTERS: PlanFilterOption[] = PLAN_HEADER_FILTERS;

/** All Plans bubble on row 2 line 1 — rendered next to the heading. */
export const ALL_PLANS_ROW_PRIMARY_FILTER: PlanFilterOption = { id: "all", label: "All" };

/** Additional header pills on row 2 line 1 (e.g. Highly Rated). */
export const ALL_PLANS_ROW_SECONDARY_HEADER_FILTERS: PlanFilterOption[] =
  ALL_PLANS_ROW_HEADER_FILTERS.filter((option) => option.id !== "all");

/** Row 1 (My Available Plans) — no header pills; "All Plans" and "Highly Rated" belong on row 2. */
export const MY_AVAILABLE_ROW_HEADER_FILTERS: PlanFilterOption[] = PLAN_HEADER_FILTERS.filter(
  (option) => option.id !== "all" && option.id !== "highly-rated",
);

/** Leading label on the benchmark report possible-plans filter row. */
export const POSSIBLE_PLANS_FILTER_HEADING = "My Available Plans*:";

/** Inline label on the benchmark report — full area catalog filters. */
export const ALL_PLANS_FILTER_HEADING = "All Plans*:";

/** Top-ranked plans for the member's coverage area. */
export const TOP_PLAN_FILTER: PlanFilterOption = {
  id: "my-available",
  label: TOP_10_PLANS_LABEL,
};

/** Top-3 rationale panel on the benchmark report (not a plan-list filter). */
export const POTENTIAL_TOP_3_FILTER = {
  id: "why-this-plan" as const,
  label: POTENTIAL_TOP_3_LABEL,
};

/**
 * Medicare Advantage sub-filters — mutually exclusive MA network/type buckets.
 * Sum of these counts equals `medicare-advantage` (and with Medigap buckets, equals `all`).
 */
export const MA_ADVANTAGE_SUBFILTERS: PlanFilterOption[] = sortPlanFiltersByLabel([
  { id: "c-snp", label: "C-SNP" },
  { id: "d-snp", label: "D-SNP" },
  { id: "i-snp", label: "I-SNP" },
  { id: "hmo", label: "HMO" },
  { id: "hmo-pos", label: "HMO-POS" },
  { id: "msa", label: "MSA" },
  { id: "pffs", label: "PFFS" },
  { id: "ppo", label: "PPO" },
]);

/** MA type buckets that partition the Advantage catalog (no overlap). */
export const MA_TYPE_PARTITION_FILTERS: PlanFilterId[] = MA_ADVANTAGE_SUBFILTERS.map((f) => f.id);

/**
 * Top-level type buckets that partition the full catalog (no overlap).
 * Highly Rated is cross-cutting and excluded from this sum.
 */
export const CATALOG_TYPE_PARTITION_FILTERS: PlanFilterId[] = [
  ...MA_TYPE_PARTITION_FILTERS,
  "medicare-supplement",
  "medicare-part-d",
];

/** Short UI label for Medicare supplement (Medigap) filter pills and category tabs. */
export const SUPPLEMENT_FILTER_LABEL = "Supplmnt";

/** Medigap sub-filters shown as (Supplement | Part D). */
export const MEDIGAP_SUBFILTERS: PlanFilterOption[] = [
  { id: "medicare-supplement", label: SUPPLEMENT_FILTER_LABEL },
  { id: "medicare-part-d", label: "Part D" },
];

/** Sub-tabs within the Highly Rated view — all rated plans or MA / Part D / Medigap. */
export type HighlyRatedSubTab =
  | "all"
  | "medicare-advantage"
  | "medicare-part-d"
  | "medicare-supplement";

/** Which drug-coverage chrome to show above the plan rankings list. */
export type PlanDrugDisplayContext = "part-d" | "medigap" | "ma" | "mixed" | "part-b";

/** Maps the active Potential Options filter to list-header drug coverage scope. */
export function planDrugDisplayContextForPanel(
  panel: PlanPanelId,
  highlyRatedSubTab: HighlyRatedSubTab = "all",
  listCategoryTab?: PlanListCategoryTabId,
): PlanDrugDisplayContext {
  if (listCategoryTab === "part-b-meds") return "part-b";
  if (panel === "medicare-part-d") return "part-d";
  if (panel === "medicare-supplement" || panel === "medigap") return "medigap";
  const categoryBase = allPlansCategoryScopedBaseFilter(panel as PlanFilterId);
  if (categoryBase === "medicare-part-d") return "part-d";
  if (categoryBase === "medicare-supplement") return "medigap";
  if (panel === "medicare-advantage" || isMaCatalogSubfilterPanel(panel)) return "ma";
  if (panel === "highly-rated") {
    if (highlyRatedSubTab === "medicare-part-d") return "part-d";
    if (highlyRatedSubTab === "medicare-supplement") return "medigap";
    if (highlyRatedSubTab === "medicare-advantage") return "ma";
    return "mixed";
  }
  return "mixed";
}

export const HIGHLY_RATED_SUBFILTERS: PlanFilterOption[] = [
  { id: "all", label: "All" },
  { id: "medicare-advantage", label: "Medicare Advantage" },
  { id: "medicare-part-d", label: "Part D" },
  { id: "medicare-supplement", label: "Medigap" },
];

/** Sub-tabs within the All Plans catalog list — partition by top-level plan type. */
export type AllPlansListTab =
  | "all"
  | "medicare-advantage"
  | "medicare-part-d"
  | "medicare-supplement"
  | "part-b-meds";

export const ALL_PLANS_LIST_TABS: { id: AllPlansListTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "medicare-advantage", label: "Medicare Advantage" },
  { id: "medicare-supplement", label: SUPPLEMENT_FILTER_LABEL },
  { id: "medicare-part-d", label: "Part D" },
];

/** All / My Available in-list tabs — includes the Part B medication coverage view. */
export const ALL_PLANS_LIST_TABS_WITH_PART_B: { id: AllPlansListTab; label: string }[] = [
  ...ALL_PLANS_LIST_TABS,
  { id: "part-b-meds", label: PART_B_MEDS_TAB_LABEL },
];

/** Medigap group inline row — supplement letter plans only (Part D has its own row). */
export const MEDIGAP_GROUP_SUBFILTERS: PlanFilterOption[] = [
  { id: "medicare-supplement", label: SUPPLEMENT_FILTER_LABEL },
];

/** Aggregate pill — all Medigap supplement plans (Part D premium modeled in each plan). */
export const AVAIL_MEDIGAP_ALL_FILTER: PlanFilterOption = {
  id: "medigap",
  label: "All",
};

/** Part D row — pharmacy-only standalone drug plans. */
export const PART_D_ALL_FILTER: PlanFilterOption = {
  id: "medicare-part-d",
  label: "All",
};

export const PART_D_ROW_FILTERS: PlanFilterOption[] = [PART_D_ALL_FILTER];

/** Aggregate pill — all Medicare Advantage network/type buckets in the group. */
export const AVAIL_MA_ALL_FILTER: PlanFilterOption = {
  id: "medicare-advantage",
  label: "All",
};

/** Row 1 My Avail Medigap — supplements only (no aggregate All pill). */
export const MY_AVAILABLE_MEDIGAP_ROW_FILTERS: PlanFilterOption[] = [...MEDIGAP_GROUP_SUBFILTERS];

/** Row 1 My Avail Part D — standalone PDP only (no Top 3 / Top 10 / 4.5+). */
export const MY_AVAILABLE_PART_D_ROW_FILTERS: PlanFilterOption[] = [...PART_D_ROW_FILTERS];

/** Row 1 My Avail Medicare Advantage — member scope (D-SNP / I-SNP omitted per eligibility). */
export function myAvailableMaRowFiltersForMember(
  incomeBand?: string,
  canAccessISnp = true,
): PlanFilterOption[] {
  return maRowFiltersForCatalogDisplay({
    incomeBand,
    scope: "member",
    canAccessISnp,
  });
}

/** Inline labels for benchmark report Top 3 / Top 10 category pills. */
export const MY_AVAILABLE_ROW_TOP_3_LABEL = "Top 3";
export const MY_AVAILABLE_ROW_TOP_10_LABEL = "Top 10";

/** All Plans row — Top 3 / Top 10 within a category (area scope only). */
export const ALL_PLANS_MEDIGAP_TOP_3_FILTER: PlanFilterOption = {
  id: "medicare-supplement-top-3",
  label: MY_AVAILABLE_ROW_TOP_3_LABEL,
};

export const ALL_PLANS_MEDIGAP_TOP_10_FILTER: PlanFilterOption = {
  id: "medicare-supplement-top-10",
  label: MY_AVAILABLE_ROW_TOP_10_LABEL,
};

export const ALL_PLANS_PART_D_TOP_3_FILTER: PlanFilterOption = {
  id: "medicare-part-d-top-3",
  label: MY_AVAILABLE_ROW_TOP_3_LABEL,
};

export const ALL_PLANS_PART_D_TOP_10_FILTER: PlanFilterOption = {
  id: "medicare-part-d-top-10",
  label: MY_AVAILABLE_ROW_TOP_10_LABEL,
};

/** All Plans row — category-scoped 4.5+ highly rated pills (Medigap / Part D only). */
export const ALL_PLANS_MEDIGAP_HIGHLY_RATED_FILTER: PlanFilterOption = {
  id: "medicare-supplement-highly-rated",
  label: "4.5+",
};

export const ALL_PLANS_PART_D_HIGHLY_RATED_FILTER: PlanFilterOption = {
  id: "medicare-part-d-highly-rated",
  label: "4.5+",
};

/** Row 2 All Medigap Plans — supplement + Top 3 / Top 10 / 4.5+ (area scope only). */
export const ALL_PLANS_MEDIGAP_ROW_FILTERS: PlanFilterOption[] = [
  ...MEDIGAP_GROUP_SUBFILTERS,
  ALL_PLANS_MEDIGAP_TOP_3_FILTER,
  ALL_PLANS_MEDIGAP_TOP_10_FILTER,
  ALL_PLANS_MEDIGAP_HIGHLY_RATED_FILTER,
];

/** Row 2 All Part D Plans — All + Top 3 / Top 10 / 4.5+ (area scope only). */
export const ALL_PLANS_PART_D_ROW_FILTERS: PlanFilterOption[] = [
  PART_D_ALL_FILTER,
  ALL_PLANS_PART_D_TOP_3_FILTER,
  ALL_PLANS_PART_D_TOP_10_FILTER,
  ALL_PLANS_PART_D_HIGHLY_RATED_FILTER,
];

/** MA filter row — All Avail MA first, then network/type sub-filters. */
export const MA_ROW_FILTERS: PlanFilterOption[] = [AVAIL_MA_ALL_FILTER, ...MA_ADVANTAGE_SUBFILTERS];

export const MEDICARE_ADVANTAGE_GROUP_LABEL = "All Medicare Advantage Plans";
export const MEDIGAP_GROUP_LABEL = "All Medigap Plans";
export const PART_D_GROUP_LABEL = "All Part D Plans";

/** Inline labels for benchmark report row 1 — “Avail” saves horizontal space on filter rows. */
export const MY_AVAILABLE_ROW_MA_LABEL = "My Avail Medicare Advantage";
export const MY_AVAILABLE_ROW_MEDIGAP_LABEL = "My Avail Medigap";
export const MY_AVAILABLE_ROW_PART_D_LABEL = "My Avail Part D";

/** Member-scoped full catalog on row 1 — before Top 3 / Top 10. */
export const MY_AVAILABLE_ROW_ALL_PLANS_FILTER: PlanFilterOption = {
  id: "all",
  label: "All",
};

/** @deprecated Standalone comparison — Why This Plan + legacy list filters. */
export const PLAN_PRIMARY_BUBBLES: { id: PlanPanelId; label: string }[] = [
  { id: "why-this-plan", label: POTENTIAL_TOP_3_LABEL },
  { id: "my-available", label: "My Available Plans" },
];

/** HMO and PPO first under Medicare Advantage; supplement + Part D under Medigap. */
export const PLAN_FILTER_GROUPS: PlanFilterGroup[] = [
  {
    id: "medicare-advantage",
    label: "Medicare Advantage",
    filters: [
      { id: "hmo", label: "HMO Plans" },
      { id: "ppo", label: "PPO Plans" },
      { id: "medicare-advantage", label: "All Advantage Plans" },
    ],
  },
  {
    id: "medigap",
    label: "Medigap",
    filters: [
      { id: "medicare-supplement", label: "Supplement Plans" },
      { id: "medicare-part-d", label: "Part D Plans" },
    ],
  },
];

/** Flat list of every plan filter id (for counts and tests). */
export const ALL_PLAN_FILTER_OPTIONS: PlanFilterOption[] = [
  ...PLAN_HEADER_FILTERS,
  { id: "my-available", label: "My Available Plans" },
  AVAIL_MEDIGAP_ALL_FILTER,
  AVAIL_MA_ALL_FILTER,
  ...PLAN_FILTER_GROUPS.flatMap((group) => group.filters),
  ...MA_ADVANTAGE_SUBFILTERS.filter((option) => option.id !== "hmo" && option.id !== "ppo"),
  ALL_PLANS_MEDIGAP_TOP_3_FILTER,
  ALL_PLANS_MEDIGAP_TOP_10_FILTER,
  ALL_PLANS_PART_D_TOP_3_FILTER,
  ALL_PLANS_PART_D_TOP_10_FILTER,
  ALL_PLANS_MEDIGAP_HIGHLY_RATED_FILTER,
  ALL_PLANS_PART_D_HIGHLY_RATED_FILTER,
];

export function isZipCountyReportPanel(panel: PlanPanelId): panel is typeof ZIP_COUNTY_REPORT_PANEL {
  return panel === ZIP_COUNTY_REPORT_PANEL;
}

export function isPlanListPanel(panel: PlanPanelId): panel is PlanFilterId {
  return panel !== "why-this-plan" && !isZipCountyReportPanel(panel);
}

/** Hide count badges on filter pills with these ids (e.g. "All" for non-staff). */
export const PLAN_FILTER_HIDE_COUNT_IDS = new Set<PlanFilterId>([
  "all",
  "medicare-supplement-top-3",
  "medicare-supplement-top-10",
  "medicare-part-d-top-3",
  "medicare-part-d-top-10",
]);

/**
 * Whether a filter pill should omit its count badge.
 * Row 1 (member) "All" always shows the member-scoped pool total; row 2 (area) "All"
 * is admin-gated via {@link showAllPlanCount}; category Top 3 / Top 10 pills never show counts.
 */
export function shouldHidePlanFilterCount(
  filterId: PlanFilterId,
  scope: PlanFilterScope,
  showAllPlanCount = true,
): boolean {
  if (!PLAN_FILTER_HIDE_COUNT_IDS.has(filterId)) return false;
  if (filterId === "all") {
    return scope === "area" && !showAllPlanCount;
  }
  return true;
}

/** Label + count for the active filter pill shown beside the plan list heading. */
export function planActiveFilterPillMeta(
  panel: PlanFilterId,
  scope: PlanFilterScope,
  counts: Record<PlanFilterId, number>,
  showAllPlanCount = true,
): { label: string; count?: number; hideCount?: boolean } {
  if (panel === "all") {
    return {
      label:
        scope === "member"
          ? MY_AVAILABLE_ROW_ALL_PLANS_FILTER.label
          : ALL_PLANS_ROW_PRIMARY_FILTER.label,
      count: counts.all,
      hideCount: shouldHidePlanFilterCount("all", scope, showAllPlanCount),
    };
  }
  if (panel === "my-available") {
    return { label: MY_AVAILABLE_ROW_ALL_PLANS_FILTER.label, count: counts.all };
  }
  if (panel === TOP_PLAN_FILTER.id) {
    return { label: MY_AVAILABLE_ROW_TOP_10_LABEL, hideCount: true };
  }
  if (isAllPlansCategoryScopedFilter(panel)) {
    const option = [
      ...ALL_PLANS_MEDIGAP_ROW_FILTERS,
      ...ALL_PLANS_PART_D_ROW_FILTERS,
    ].find((entry) => entry.id === panel);
    return {
      label: option?.label ?? panel,
      hideCount: isAllPlansCategoryTopFilter(panel),
    };
  }
  const option = ALL_PLAN_FILTER_OPTIONS.find((entry) => entry.id === panel);
  if (option) {
    return { label: option.label, count: counts[panel] };
  }
  return { label: panel, count: counts[panel] };
}

/**
 * Full top-3 rationale view — Potential Top 3 panel only.
 * Category filters (HMO, PPO, etc.) and catalog lists use plan tables/cards instead.
 */
export function shouldShowPlanWhySection(panel: PlanPanelId, _scope: PlanFilterScope): boolean {
  return panel === "why-this-plan";
}

/** Area-row filter panels browse the full national catalog as a compact list. */
export function isAreaCatalogListPanel(panel: PlanPanelId, scope: PlanFilterScope): boolean {
  return isPlanListPanel(panel) && scope === "area";
}

/** CMS assigns star ratings to Medicare Advantage and Part D only (not Medigap). */
export const HIGHLY_RATED_MIN_STARS = 4.5;

/** User-facing label for the highly rated threshold (e.g. "4.5+"). */
export const HIGHLY_RATED_MIN_STARS_LABEL = "4.5";

/** User-facing sentence explaining how plans qualify for the Highly Rated list. */
export function highlyRatedCriteriaSentence(): string {
  return `Highly rated plans include Medicare Advantage and Part D with ${HIGHLY_RATED_MIN_STARS_LABEL}+ CMS star ratings, plus Medigap supplements with ${HIGHLY_RATED_MIN_STARS_LABEL}+ modeled quality scores (CMS does not star-rate supplements). Within each category tab, plans are ranked by estimated annual cost.`;
}

/** User-facing sentence explaining Top 10 selection methodology (cost, stars, fit). */
export function top10RankingsMethodologySentence(
  scope: PlanFilterScope = "member",
  costPreference: PlanRankingPreference = "predictability",
): string {
  const costNote =
    costPreference === "minimize_monthly"
      ? "lowest projected annual total (premiums + drug costs + expected out-of-pocket)"
      : "best balance of predictable copays, out-of-pocket caps, and total annual cost";
  if (scope === "area") {
    return `Top 10 from the national CMS catalog — ranked by ${costNote}, with CMS star rating and pathway fit (Medicare Advantage vs Medigap + Part D) as tie-breakers.`;
  }
  return `Top 10 in your coverage area — ranked by ${costNote}, using your medications and conditions, CMS star ratings, and Medicare Advantage vs Medigap pathway fit.`;
}

export function planDetailKey(plan: PlanDetail): string {
  return `${plan.carrier}::${plan.plan}`;
}

function isMedicareAdvantage(plan: PlanDetail): boolean {
  return /medicare advantage/i.test(plan.planType);
}

function isMedicareSupplement(plan: PlanDetail): boolean {
  return /medigap|medicare supplement/i.test(plan.planType);
}

function isStandalonePartD(plan: PlanDetail): boolean {
  return /^Medicare Part D/i.test(plan.planType);
}

function isCostPlan(plan: PlanDetail): boolean {
  return /\(Cost\)/i.test(plan.planType);
}

function isPpoPlan(plan: PlanDetail): boolean {
  return /\bPPO\b/i.test(plan.planType) && !/HMO-POS/i.test(plan.planType);
}

function isHmoPlan(plan: PlanDetail): boolean {
  return (
    (/\bHMO\b/i.test(plan.planType) && !/HMO-POS/i.test(plan.planType)) || isCostPlan(plan)
  );
}

function isHmoPosPlan(plan: PlanDetail): boolean {
  return /HMO-POS/i.test(plan.planType);
}

function isPffsPlan(plan: PlanDetail): boolean {
  return /\(PFFS\)/i.test(plan.planType);
}

function isMsaPlan(plan: PlanDetail): boolean {
  return /\(MSA\)/i.test(plan.planType);
}

export function isDSnpPlan(plan: PlanDetail): boolean {
  return /D-SNP/i.test(plan.planType);
}

/** Institutional Special Needs Plans — nursing home / LTC institutional SNP. */
export function isISnpPlan(plan: PlanDetail): boolean {
  return /I-SNP/i.test(plan.planType);
}

/** D-SNP requires Medicaid dual eligibility — hide when income band suggests it is unlikely. */
export function shouldExcludeDSnpPlans(incomeBand?: string): boolean {
  if (!incomeBand) return false;
  return isIncomeAboveFederalPovertyLevel(incomeBand);
}

/** Remove D-SNP plans from a catalog when member income suggests dual eligibility is unlikely. */
export function applyMemberEligibilityPlanExclusions(
  plans: PlanDetail[],
  incomeBand?: string,
): PlanDetail[] {
  if (!shouldExcludeDSnpPlans(incomeBand)) return plans;
  return plans.filter((plan) => !isDSnpPlan(plan));
}

export type MyAvailablePlanExclusionOptions = {
  incomeBand?: string;
};

/**
 * Member-scoped plan pool for My Available row — income-based D-SNP exclusion plus
 * I-SNP always omitted (agents browse I-SNP via All Plans). Does not affect All Plans
 * (area) catalog browsing.
 */
export function applyMyAvailablePlanExclusions(
  plans: PlanDetail[],
  options?: MyAvailablePlanExclusionOptions,
): PlanDetail[] {
  const { incomeBand } = options ?? {};
  const result = applyMemberEligibilityPlanExclusions(plans, incomeBand);
  return result.filter((plan) => !isISnpPlan(plan));
}

/** MA filter row — omits D-SNP when income-based exclusion applies. */
export function maRowFiltersForEligibility(incomeBand?: string): PlanFilterOption[] {
  if (!shouldExcludeDSnpPlans(incomeBand)) return MA_ROW_FILTERS;
  return MA_ROW_FILTERS.filter((option) => option.id !== "d-snp");
}

/** MA network/type sub-filters (excludes the aggregate "All" pill). */
export const MA_CATALOG_SUBFILTER_IDS = new Set<PlanFilterId>(
  MA_ADVANTAGE_SUBFILTERS.map((option) => option.id),
);

export function isMaCatalogSubfilterPanel(panel: PlanPanelId): panel is PlanFilterId {
  return MA_CATALOG_SUBFILTER_IDS.has(panel as PlanFilterId);
}

/** All Plans row — category-scoped Top 3 / Top 10 filters (Medigap / Part D only). */
export const ALL_PLANS_CATEGORY_TOP_FILTER_IDS = new Set<PlanFilterId>([
  "medicare-supplement-top-3",
  "medicare-supplement-top-10",
  "medicare-part-d-top-3",
  "medicare-part-d-top-10",
]);

/** All Plans row — category-scoped 4.5+ highly rated filters (Medigap / Part D only). */
export const ALL_PLANS_CATEGORY_HIGHLY_RATED_FILTER_IDS = new Set<PlanFilterId>([
  "medicare-supplement-highly-rated",
  "medicare-part-d-highly-rated",
]);

export function isAllPlansCategoryTopFilter(
  filter: PlanFilterId,
): filter is
  | "medicare-supplement-top-3"
  | "medicare-supplement-top-10"
  | "medicare-part-d-top-3"
  | "medicare-part-d-top-10" {
  return ALL_PLANS_CATEGORY_TOP_FILTER_IDS.has(filter);
}

export function isAllPlansCategoryHighlyRatedFilter(
  filter: PlanFilterId,
): filter is "medicare-supplement-highly-rated" | "medicare-part-d-highly-rated" {
  return ALL_PLANS_CATEGORY_HIGHLY_RATED_FILTER_IDS.has(filter);
}

export function isAllPlansCategoryScopedFilter(filter: PlanFilterId): boolean {
  return isAllPlansCategoryTopFilter(filter) || isAllPlansCategoryHighlyRatedFilter(filter);
}

/** Base category filter + result limit for All Plans category Top 3 / Top 10 pills. */
export function allPlansCategoryTopFilterMeta(
  filter: PlanFilterId,
): { baseFilter: PlanFilterId; limit: number } | null {
  switch (filter) {
    case "medicare-supplement-top-3":
      return { baseFilter: "medicare-supplement", limit: 3 };
    case "medicare-supplement-top-10":
      return { baseFilter: "medicare-supplement", limit: 10 };
    case "medicare-part-d-top-3":
      return { baseFilter: "medicare-part-d", limit: 3 };
    case "medicare-part-d-top-10":
      return { baseFilter: "medicare-part-d", limit: 10 };
    default:
      return null;
  }
}

/** Base category for All Plans category-scoped 4.5+ pills. */
export function allPlansCategoryHighlyRatedFilterMeta(
  filter: PlanFilterId,
): { baseFilter: "medicare-supplement" | "medicare-part-d" } | null {
  switch (filter) {
    case "medicare-supplement-highly-rated":
      return { baseFilter: "medicare-supplement" };
    case "medicare-part-d-highly-rated":
      return { baseFilter: "medicare-part-d" };
    default:
      return null;
  }
}

/** Shared base category for All Plans Top 3 / Top 10 / 4.5+ scoped pills. */
export function allPlansCategoryScopedBaseFilter(
  filter: PlanFilterId,
): "medicare-supplement" | "medicare-part-d" | null {
  return (
    allPlansCategoryTopFilterMeta(filter)?.baseFilter ??
    allPlansCategoryHighlyRatedFilterMeta(filter)?.baseFilter ??
    null
  );
}

export type MaRowFiltersForCatalogDisplayOptions = {
  incomeBand?: string;
  scope?: PlanFilterScope;
  /**
   * When false, omit I-SNP (requires i-snp-catalog add-on).
   * MVP: agents/admins see I-SNP via {@link userCanAccessISnpCatalog} — billing gate later.
   */
  canAccessISnp?: boolean;
};

/**
 * MA filter row for All Plans row, county report, and in-list MA category tabs.
 * Member scope omits D-SNP when income suggests dual eligibility is unlikely.
 */
export function maRowFiltersForCatalogDisplay(
  options?: MaRowFiltersForCatalogDisplayOptions,
): PlanFilterOption[] {
  const { incomeBand, scope = "area", canAccessISnp = true } = options ?? {};
  let filters =
    scope === "member" ? maRowFiltersForEligibility(incomeBand) : MA_ROW_FILTERS;
  if (scope === "member" || !canAccessISnp) {
    filters = filters.filter((option) => option.id !== "i-snp");
  }
  return filters;
}

function isCSnpPlan(plan: PlanDetail): boolean {
  return /C-SNP/i.test(plan.planType) && !isISnpPlan(plan);
}

function isOpenMaNetworkPlan(plan: PlanDetail): boolean {
  return !isDSnpPlan(plan) && !isCSnpPlan(plan) && !isISnpPlan(plan);
}

/** CMS star ratings apply to Medicare Advantage and Part D — not Medigap supplement plans. */
export function planHasCmsStarRating(plan: PlanDetail): boolean {
  return isMedicareAdvantage(plan) || isStandalonePartD(plan);
}

function planStarValue(plan: PlanDetail): number | null {
  const stars = parseFloat(plan.stars);
  return Number.isFinite(stars) ? stars : null;
}

/** Plain-language star score for UI and PDF copy — avoids the ★ glyph that can render poorly. */
export function planStarsDisplayLabel(stars: string): string {
  const value = planStarValue({ stars } as PlanDetail);
  if (value !== null) {
    return `${value.toFixed(1)} out of 5`;
  }
  return stars.replace(/★/g, "").trim() || stars;
}

/** All Plans lists — highest star/quality first, then carrier name A–Z. */
export function comparePlansByRatingThenCarrier(a: PlanDetail, b: PlanDetail): number {
  const aStars = planStarValue(a) ?? -1;
  const bStars = planStarValue(b) ?? -1;
  if (bStars !== aStars) return bStars - aStars;
  const byCarrier = a.carrier.localeCompare(b.carrier, undefined, { sensitivity: "base" });
  if (byCarrier !== 0) return byCarrier;
  return a.plan.localeCompare(b.plan, undefined, { sensitivity: "base" });
}

export type PlanRankingPreference = "minimize_monthly" | "predictability";

/**
 * All Plans lists — best projected fit for the member first (annual or monthly cost),
 * then CMS/modeled star rating, then carrier name.
 */
export function comparePlansByFitThenRating(
  a: PlanDetail,
  b: PlanDetail,
  costPreference: PlanRankingPreference = "predictability",
): number {
  if (costPreference === "minimize_monthly") {
    if (a.monthly !== b.monthly) return a.monthly - b.monthly;
    if (a.annual !== b.annual) return a.annual - b.annual;
  } else if (a.annual !== b.annual) {
    return a.annual - b.annual;
  }

  const aStars = planStarValue(a) ?? -1;
  const bStars = planStarValue(b) ?? -1;
  if (bStars !== aStars) return bStars - aStars;

  const byCarrier = a.carrier.localeCompare(b.carrier, undefined, { sensitivity: "base" });
  if (byCarrier !== 0) return byCarrier;
  return a.plan.localeCompare(b.plan, undefined, { sensitivity: "base" });
}

/**
 * All Plans lists — Top 10 pathway picks first in rank order (1–10), then remaining plans
 * by projected fit, star rating, and carrier name.
 */
export function sortAllPlansWithTop10First(
  plans: PlanDetail[],
  top10Plans: PlanDetail[],
  costPreference: PlanRankingPreference = "predictability",
): PlanDetail[] {
  if (top10Plans.length === 0) {
    return [...plans].sort((a, b) => comparePlansByFitThenRating(a, b, costPreference));
  }

  const topKeysOrdered: string[] = [];
  for (const topPlan of top10Plans) {
    const key = planDetailKey(topPlan);
    if (!topKeysOrdered.includes(key)) {
      topKeysOrdered.push(key);
    }
  }

  const topInPool: PlanDetail[] = [];
  const usedIndices = new Set<number>();
  for (const key of topKeysOrdered) {
    const index = plans.findIndex(
      (plan, i) => !usedIndices.has(i) && planDetailKey(plan) === key,
    );
    if (index >= 0) {
      topInPool.push(plans[index]!);
      usedIndices.add(index);
    }
  }

  const rest = plans.filter((_, index) => !usedIndices.has(index));
  rest.sort((a, b) => comparePlansByFitThenRating(a, b, costPreference));
  return [...topInPool, ...rest];
}

/**
 * Medigap supplements are not CMS-star-rated. Qualify when the displayed modeled
 * quality score meets the same 4.5+ threshold used for CMS-rated plans.
 */
export function isHighlyRatedMedigapPlan(plan: PlanDetail): boolean {
  if (!isMedicareSupplement(plan)) return false;
  const stars = planStarValue(plan);
  return stars !== null && stars >= HIGHLY_RATED_MIN_STARS;
}

export function isHighlyRatedPlan(plan: PlanDetail): boolean {
  if (isMedicareSupplement(plan)) return isHighlyRatedMedigapPlan(plan);
  if (!planHasCmsStarRating(plan)) return false;
  const stars = planStarValue(plan);
  return stars !== null && stars >= HIGHLY_RATED_MIN_STARS;
}

/** Narrow a highly-rated pool to MA, Part D, Medigap, or the full rated pool. */
export function filterHighlyRatedBySubTab(
  plans: PlanDetail[],
  subTab: HighlyRatedSubTab,
): PlanDetail[] {
  const rated = plans.filter(isHighlyRatedPlan);
  if (subTab === "all") {
    return rated;
  }
  if (subTab === "medicare-advantage") {
    return rated.filter(isMedicareAdvantage);
  }
  if (subTab === "medicare-part-d") {
    return rated.filter(isStandalonePartD);
  }
  return rated.filter(isMedicareSupplement);
}

/** Sub-tab filter with cost re-ranking. */
export function filterHighlyRatedBySubTabRanked(
  plans: PlanDetail[],
  subTab: HighlyRatedSubTab,
): PlanDetail[] {
  return filterHighlyRatedBySubTab(plans, subTab)
    .sort((a, b) => a.annual - b.annual)
    .map((plan, index) => ({ ...plan, rank: index + 1 }));
}

/** Narrow an All Plans catalog pool to MA, Part D, Medigap, Part B, or the full pool. */
export function filterAllPlansByListTab(plans: PlanDetail[], tab: AllPlansListTab): PlanDetail[] {
  if (tab === "all") return plans;
  if (tab === "part-b-meds") return filterPlansForPartBDrugCoverage(plans);
  if (tab === "medicare-advantage") return plans.filter(isMedicareAdvantage);
  if (tab === "medicare-part-d") return plans.filter(isStandalonePartD);
  return plans.filter(isMedicareSupplement);
}

/** All Plans list-tab filter with rank re-assignment within the subset. */
export function filterAllPlansByListTabRanked(
  plans: PlanDetail[],
  tab: AllPlansListTab,
): PlanDetail[] {
  return filterAllPlansByListTab(plans, tab).map((plan, index) => ({
    ...plan,
    rank: index + 1,
  }));
}

/** Counts for All, MA, Supplement, Part D, and Part B tabs within an All Plans catalog. */
export function allPlansListTabCounts(plans: PlanDetail[]): Record<AllPlansListTab, number> {
  return {
    all: plans.length,
    "medicare-advantage": plans.filter(isMedicareAdvantage).length,
    "medicare-part-d": plans.filter(isStandalonePartD).length,
    "medicare-supplement": plans.filter(isMedicareSupplement).length,
    "part-b-meds": filterPlansForPartBDrugCoverage(plans).length,
  };
}

/** In-list category tab id — union of type and MA sub-type filters per panel. */
export type PlanListCategoryTabId = string;

/** Default in-list tab when a panel opens (aggregate tab for that filter). */
export function defaultPlanListCategoryTab(panel: PlanPanelId): PlanListCategoryTabId {
  if (panel === "medicare-advantage") return "medicare-advantage";
  if (isMaCatalogSubfilterPanel(panel)) return panel;
  if (panel === "medicare-part-d") return "medicare-part-d";
  if (panel === "medicare-supplement" || panel === "medigap") return "medicare-supplement";
  if (allPlansCategoryScopedBaseFilter(panel as PlanFilterId)) {
    return allPlansCategoryScopedBaseFilter(panel as PlanFilterId)!;
  }
  return "all";
}

/** Sub-type tabs shown inside the plan list sticky chrome for the active filter panel. */
export function planListCategoryTabsForPanel(
  panel: PlanPanelId,
  scope?: PlanFilterScope,
  incomeBand?: string,
  canAccessISnp = true,
): { id: PlanListCategoryTabId; label: string }[] {
  if (panel === "why-this-plan" || isZipCountyReportPanel(panel)) return [];
  if (isAllPlansCategoryScopedFilter(panel as PlanFilterId)) return [];
  if (panel === "highly-rated") return HIGHLY_RATED_SUBFILTERS;
  /** Top 10 is already a ranked slice — sub-tabs would often show 0 (e.g. Part D excluded from pathways). */
  if (panel === "my-available") return [];
  if (panel === "all") return ALL_PLANS_LIST_TABS_WITH_PART_B;
  if (panel === "medicare-advantage" || isMaCatalogSubfilterPanel(panel)) {
    return maRowFiltersForCatalogDisplay({
      incomeBand,
      scope: scope ?? "area",
      canAccessISnp,
    });
  }
  if (panel === "medicare-part-d" || panel === "medicare-supplement" || panel === "medigap") {
    return ALL_PLANS_LIST_TABS;
  }
  return [];
}

export function shouldShowPlanListCategoryTabs(
  panel: PlanPanelId,
  scope: PlanFilterScope,
): boolean {
  return planListCategoryTabsForPanel(panel, scope).length > 1;
}

export function planListCategoryTabAriaLabel(panel: PlanPanelId): string {
  switch (panel) {
    case "highly-rated":
      return "Highly rated plan categories";
    case "medicare-advantage":
      return "Medicare Advantage plan types";
    case "all":
      return "All plans by type";
    case "my-available":
      return "Top 10 plans by type";
    case "medicare-part-d":
    case "medicare-supplement":
    case "medigap":
      return "Plans by type";
    default:
      return "Plan categories";
  }
}

/** Narrow a panel's plan pool by the active in-list category tab. */
export function filterPlansByListCategoryTab(
  plans: PlanDetail[],
  panel: PlanPanelId,
  tabId: PlanListCategoryTabId,
  myAvailablePlans: PlanDetail[],
  costPreference: PlanRankingPreference = "predictability",
): PlanDetail[] {
  if (panel === "highly-rated") {
    return filterHighlyRatedBySubTab(plans, tabId as HighlyRatedSubTab);
  }
  if (panel === "all" || panel === "my-available") {
    return filterAllPlansByListTab(plans, tabId as AllPlansListTab);
  }
  if (panel === "medicare-part-d" || panel === "medicare-supplement" || panel === "medigap") {
    return filterAllPlansByListTab(plans, tabId as AllPlansListTab);
  }
  if (panel === "medicare-advantage") {
    if (tabId === "medicare-advantage") return plans;
    return filterAreaPlans(plans, tabId as PlanFilterId, myAvailablePlans, costPreference);
  }
  return plans;
}

/** In-list category tab filter with rank re-assignment within the subset. */
export function filterPlansByListCategoryTabRanked(
  plans: PlanDetail[],
  panel: PlanPanelId,
  tabId: PlanListCategoryTabId,
  myAvailablePlans: PlanDetail[],
  costPreference: PlanRankingPreference = "predictability",
): PlanDetail[] {
  return filterPlansByListCategoryTab(plans, panel, tabId, myAvailablePlans, costPreference).map(
    (plan, index) => ({ ...plan, rank: index + 1 }),
  );
}

/** Counts for each in-list category tab within a panel's base plan pool. */
export function planListCategoryTabCounts(
  plans: PlanDetail[],
  panel: PlanPanelId,
  myAvailablePlans: PlanDetail[],
  costPreference: PlanRankingPreference = "predictability",
): Record<PlanListCategoryTabId, number> {
  const tabs = planListCategoryTabsForPanel(panel);
  return tabs.reduce(
    (counts, tab) => {
      counts[tab.id] = filterPlansByListCategoryTab(
        plans,
        panel,
        tab.id,
        myAvailablePlans,
        costPreference,
      ).length;
      return counts;
    },
    {} as Record<PlanListCategoryTabId, number>,
  );
}

/** Heading and browse subtitle for an in-list category tab. */
export function planListCategoryTabRankingsMeta(
  panel: PlanPanelId,
  tabId: PlanListCategoryTabId,
  count: number,
  scope?: PlanFilterScope,
): { title: string; subtitle: string } {
  if (panel === "highly-rated") {
    return highlyRatedSubTabRankingsMeta(tabId as HighlyRatedSubTab, count);
  }
  if (panel === "all" || panel === "my-available") {
    if (tabId === "all") {
      return planFilterRankingsMeta("all", count, scope);
    }
    if (tabId === "part-b-meds") {
      return partBMedTabRankingsMeta(count, scope);
    }
    return planFilterRankingsMeta(tabId as PlanFilterId, count, scope);
  }
  if (panel === "medicare-advantage") {
    if (tabId === "medicare-advantage") {
      return planFilterRankingsMeta("medicare-advantage", count, scope);
    }
    return planFilterRankingsMeta(tabId as PlanFilterId, count, scope);
  }
  return planFilterRankingsMeta(panel as PlanFilterId, count, scope);
}

/** Counts for All, MA, Part D, and Medigap tabs within a plan catalog. */
export function highlyRatedSubTabCounts(plans: PlanDetail[]): Record<HighlyRatedSubTab, number> {
  const rated = plans.filter(isHighlyRatedPlan);
  return {
    all: rated.length,
    "medicare-advantage": rated.filter(isMedicareAdvantage).length,
    "medicare-part-d": rated.filter(isStandalonePartD).length,
    "medicare-supplement": rated.filter(isMedicareSupplement).length,
  };
}

function matchesPlanFilter(
  plan: PlanDetail,
  filter: PlanFilterId,
  myAvailableKeys: Set<string>,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "medicare-advantage":
      return isMedicareAdvantage(plan);
    case "medicare-supplement":
      return isMedicareSupplement(plan);
    case "medicare-part-d":
      return isStandalonePartD(plan);
    case "medigap":
      return isMedicareSupplement(plan);
    case "ppo":
      return isPpoPlan(plan) && isOpenMaNetworkPlan(plan);
    case "hmo":
      return isHmoPlan(plan) && isOpenMaNetworkPlan(plan);
    case "hmo-pos":
      return isHmoPosPlan(plan) && isOpenMaNetworkPlan(plan);
    case "pffs":
      return isPffsPlan(plan) && isOpenMaNetworkPlan(plan);
    case "msa":
      return isMsaPlan(plan) && isOpenMaNetworkPlan(plan);
    case "d-snp":
      return isDSnpPlan(plan);
    case "c-snp":
      return isCSnpPlan(plan) && !isDSnpPlan(plan);
    case "i-snp":
      return isISnpPlan(plan);
    case "highly-rated":
      return isHighlyRatedPlan(plan);
    case "medicare-supplement-highly-rated":
      return isHighlyRatedMedigapPlan(plan);
    case "medicare-part-d-highly-rated":
      return isStandalonePartD(plan) && isHighlyRatedPlan(plan);
    case "my-available":
      return myAvailableKeys.has(planDetailKey(plan));
    case "medicare-supplement-top-3":
    case "medicare-supplement-top-10":
    case "medicare-part-d-top-3":
    case "medicare-part-d-top-10":
      return false;
    default:
      return true;
  }
}

/** Filter area plans and re-rank within the selection. */
export function filterAreaPlans(
  areaPlans: PlanDetail[],
  filter: PlanFilterId,
  myAvailablePlans: PlanDetail[],
  costPreference: PlanRankingPreference = "predictability",
  allSortTopPlans?: PlanDetail[],
): PlanDetail[] {
  return filterAreaPlansMulti(
    areaPlans,
    [filter],
    myAvailablePlans,
    costPreference,
    allSortTopPlans,
  );
}

/**
 * Plan catalog for a filter + scope. Row 1 (member): parish-scoped MA and zip3 regional
 * Medigap/Part D via `memberPlans`. Row 2 (area): full national CMS catalog for every filter,
 * including All Plans.
 */
export function catalogForFilterScope(
  filter: PlanFilterId,
  scope: PlanFilterScope,
  fullCatalogPlans: PlanDetail[],
  memberPlans?: PlanDetail[],
): PlanDetail[] {
  if (filter === "all" && scope === "member" && memberPlans) return memberPlans;
  if (scope === "area") return fullCatalogPlans;
  return memberPlans ?? fullCatalogPlans;
}

/**
 * Top 3 for the Potential Top 3 rationale view.
 * Overall panel: lowest-cost picks from the full parish-scoped member catalog (all plan types).
 * Category panels: top 3 within the active filter from the member or national catalog per scope.
 */
export function plansForPotentialTop3(
  panel: PlanPanelId,
  filter: PlanFilterId,
  memberPlans: PlanDetail[],
  myAvailablePlans: PlanDetail[],
  fullCatalogPlans: PlanDetail[],
  scope: PlanFilterScope,
): PlanDetail[] {
  if (panel === "why-this-plan") {
    const pool = scope === "area" ? fullCatalogPlans : memberPlans;
    return pathwayComparisonPlans(pool)
      .slice(0, 3)
      .map((plan, index) => ({ ...plan, rank: index + 1 }));
  }
  return filterPlansForScope(fullCatalogPlans, filter, myAvailablePlans, scope, memberPlans).slice(
    0,
    3,
  );
}

/**
 * Top 10 (`my-available`): member scope uses regional ranked pool (zip3 + county);
 * area scope (All Plans row) uses national CMS pathway top 10.
 * Other filters use `memberPlans` when scope is member, otherwise the national catalog.
 */
export function filterPlansForScope(
  fullCatalogPlans: PlanDetail[],
  filter: PlanFilterId,
  myAvailablePlans: PlanDetail[],
  scope: PlanFilterScope,
  memberPlans?: PlanDetail[],
  costPreference: PlanRankingPreference = "predictability",
): PlanDetail[] {
  if (filter === "my-available") {
    if (scope === "area") {
      return pathwayComparisonPlans(fullCatalogPlans)
        .slice(0, 10)
        .map((plan, index) => ({ ...plan, rank: index + 1 }));
    }
    return filterAreaPlans(myAvailablePlans, filter, myAvailablePlans, costPreference);
  }
  const catalog = catalogForFilterScope(filter, scope, fullCatalogPlans, memberPlans);
  const categoryTop = allPlansCategoryTopFilterMeta(filter);
  if (categoryTop) {
    const base = filterAreaPlans(
      catalog,
      categoryTop.baseFilter,
      myAvailablePlans,
      costPreference,
    );
    return base.slice(0, categoryTop.limit);
  }
  const allSortTopPlans =
    filter === "all" && scope === "area"
      ? pathwayComparisonPlans(catalog).slice(0, 10)
      : undefined;
  return filterAreaPlans(
    catalog,
    filter,
    myAvailablePlans,
    costPreference,
    allSortTopPlans,
  );
}

/** Multi-select: union of plans matching any active filter (OR). Empty or "all" alone → every plan. */
export function filterAreaPlansMulti(
  areaPlans: PlanDetail[],
  filters: PlanFilterId[],
  myAvailablePlans: PlanDetail[],
  costPreference: PlanRankingPreference = "predictability",
  allSortTopPlans?: PlanDetail[],
): PlanDetail[] {
  const myAvailableKeys = new Set(myAvailablePlans.map(planDetailKey));
  const normalized = filters.filter((f) => f !== "all");
  const useAll = normalized.length === 0 || filters.includes("all");

  let matched = useAll
    ? [...areaPlans]
    : areaPlans.filter((plan) =>
        normalized.some((filter) => matchesPlanFilter(plan, filter, myAvailableKeys)),
      );

  if (normalized.length === 1 && normalized[0] === "my-available") {
    matched = myAvailablePlans;
  } else if (normalized.includes("my-available") && normalized.length > 1) {
    const topKeys = new Set(myAvailablePlans.map(planDetailKey));
    matched = matched.filter((plan) => topKeys.has(planDetailKey(plan)));
  }

  const sortAllPlans = useAll && (filters.includes("all") || normalized.length === 0);
  const topForAllSort = allSortTopPlans ?? myAvailablePlans;

  const sorted = sortAllPlans
    ? sortAllPlansWithTop10First(matched, topForAllSort, costPreference)
    : [...matched].sort((a, b) => a.annual - b.annual);

  return sorted.map((plan, index) => ({ ...plan, rank: index + 1 }));
}

export function togglePlanFilter(current: PlanFilterId[], filter: PlanFilterId): PlanFilterId[] {
  if (filter === "all") return ["all"];
  const withoutAll = current.filter((f) => f !== "all");
  if (withoutAll.includes(filter)) {
    const next = withoutAll.filter((f) => f !== filter);
    return next.length === 0 ? ["all"] : next;
  }
  return [...withoutAll, filter];
}

export function countPlansForFilter(
  areaPlans: PlanDetail[],
  filter: PlanFilterId,
  myAvailablePlans: PlanDetail[],
): number {
  const categoryTop = allPlansCategoryTopFilterMeta(filter);
  if (categoryTop) {
    const baseCount = countPlansForFilter(areaPlans, categoryTop.baseFilter, myAvailablePlans);
    return Math.min(categoryTop.limit, baseCount);
  }
  return filterAreaPlans(areaPlans, filter, myAvailablePlans).length;
}

export function planFilterCounts(
  areaPlans: PlanDetail[],
  myAvailablePlans: PlanDetail[],
): Record<PlanFilterId, number> {
  return ALL_PLAN_FILTER_OPTIONS.reduce(
    (counts, option) => {
      counts[option.id] = countPlansForFilter(areaPlans, option.id, myAvailablePlans);
      return counts;
    },
    {} as Record<PlanFilterId, number>,
  );
}

/** Sum of mutually exclusive type-bucket counts shown on the All Plans row. */
export function catalogTypePartitionSum(counts: Record<PlanFilterId, number>): number {
  return CATALOG_TYPE_PARTITION_FILTERS.reduce((sum, id) => sum + counts[id], 0);
}

/** Whether MA sub-type buckets (HMO, PPO, HMO-POS, PFFS, MSA) sum to total Advantage plans. */
export function maTypePartitionReconciles(counts: Record<PlanFilterId, number>): boolean {
  return (
    MA_TYPE_PARTITION_FILTERS.reduce((sum, id) => sum + counts[id], 0) ===
    counts["medicare-advantage"]
  );
}

/**
 * Whether every plan type bucket on the All Plans row sums to the total catalog count.
 * Highly Rated is cross-cutting and excluded from the partition sum.
 */
export function catalogTypePartitionReconciles(counts: Record<PlanFilterId, number>): boolean {
  return catalogTypePartitionSum(counts) === counts.all;
}

/** @deprecated Prefer myAvailableRowFilterCounts for benchmark row-1 category pills. */
export function myAvailablePlanFilterCounts(
  myAvailablePlans: PlanDetail[],
): Record<PlanFilterId, number> {
  return ALL_PLAN_FILTER_OPTIONS.reduce(
    (counts, option) => {
      counts[option.id] = filterAreaPlans(myAvailablePlans, option.id, myAvailablePlans).length;
      return counts;
    },
    {} as Record<PlanFilterId, number>,
  );
}

/**
 * Full national CMS-catalog counts for row 2 (All Plans) — no ZIP or parish/county narrowing.
 */
export function fullCatalogPlanFilterCounts(
  fullCatalogPlans: PlanDetail[],
  myAvailablePlans: PlanDetail[],
): Record<PlanFilterId, number> {
  return planFilterCounts(fullCatalogPlans, myAvailablePlans);
}

/** @deprecated Use {@link fullCatalogPlanFilterCounts}. */
export const regionalPlanFilterCounts = fullCatalogPlanFilterCounts;

/**
 * Benchmark report row 1 badge counts — member parish/county catalog per category.
 * Top 10 uses the ranked pool size. Row 2 uses {@link fullCatalogPlanFilterCounts}.
 */
export function myAvailableRowFilterCounts(
  memberPlans: PlanDetail[],
  myAvailablePlans: PlanDetail[],
): Record<PlanFilterId, number> {
  return {
    ...planFilterCounts(memberPlans, myAvailablePlans),
    "my-available": myAvailablePlans.length,
  };
}

/** Sub-filters in a group — optionally omit pills with zero count (My Available row). */
export function visiblePlanSubfilters(
  options: PlanFilterOption[],
  counts: Record<PlanFilterId, number>,
  hideZeroCount = false,
): PlanFilterOption[] {
  if (!hideZeroCount) return options;
  return options.filter((option) => (counts[option.id] ?? 0) > 0);
}

/** @deprecated Row 2 is always shown when the national catalog is non-empty. */
export const ALL_PLANS_ROW_MAX_CATALOG = 100;

/** @deprecated Row 2 is always shown when the national catalog is non-empty. */
export const ALL_PLANS_ROW_MAX_FILTER = 75;

/**
 * Whether the benchmark report should show the All Plans filter row (row 2).
 * Always visible when the national catalog has plans.
 */
export function shouldShowAllPlansRow(
  _myAvailableCounts: Record<PlanFilterId, number>,
  fullCatalogCounts: Record<PlanFilterId, number>,
): boolean {
  return fullCatalogCounts.all > 0;
}

/** Collapsible titles for the top-3 rationale block on Potential Options. */
export type PlanFilterWhySectionMeta = {
  /** Main h3 above the collapsible subsections. */
  sectionHeading: string;
  /** One-line explanation of why plans in this filter qualify. */
  sectionBrief: string;
  topPickTitle: string;
  oneVsTwoTitle: string;
  whyNumberOneTitle: string;
  whyOverRunnersTitle: string;
  topRankLabel: string;
  /** Suffix for runners-up heading, e.g. " among HMO plans". */
  runnersUpScope: string;
};

/** Embedded card title + subtitle when a filter bubble is active on Potential Options. */
export function planPanelEmbeddedHeading(
  panel: PlanPanelId,
  planCount: number,
  scope?: PlanFilterScope,
): { title: string; subtitle: string } {
  if (panel === "why-this-plan") {
    return {
      title: POTENTIAL_TOP_3_LABEL,
      subtitle:
        scope === "area"
          ? "Top 3 pathways from the national CMS catalog — lowest projected annual cost"
          : "Top 3 pathways — Medicare Advantage vs Medigap (with Part D) — lowest projected annual cost in your area",
    };
  }
  if (isZipCountyReportPanel(panel)) {
    return {
      title: "County plan inventory by ZIP",
      subtitle:
        "Choose ZIP prefix (3 digits, multiselect counties) or full ZIP (5 digits, one county) — filter by plan type below",
    };
  }
  if (isPlanListPanel(panel)) {
    return planFilterRankingsMeta(panel, planCount, scope);
  }
  return {
    title: BENCHMARK_TAB_POSSIBLE_PLANS,
    subtitle: "",
  };
}

export function planFilterRunnersUpTitle(runnersUpScope: string, runnerCount: number): string {
  if (runnerCount <= 0) return "";
  if (runnerCount === 1) return `Also ranked #2${runnersUpScope}`;
  return `Also ranked #2 and #3${runnersUpScope}`;
}

/** Suffix on PlanChoiceCard rank line — "#{rank} of 3" for runners-up. */
export function planChoiceRankSuffix(total = 3): string {
  return `of ${total}`;
}

/** Collapsible header for a ranked plan — rank label plus carrier / plan name. */
/** Compact tab label for Potential Top 3 — rank + carrier / plan. */
export function planRankTabLabel(plan: {
  rank: number;
  carrier: string;
  plan: string;
}): string {
  return `#${plan.rank} · ${plan.carrier} / ${plan.plan}`;
}

export function planRankCollapsibleTitle(
  plan: { rank: number; carrier: string; plan: string },
  meta: Pick<PlanFilterWhySectionMeta, "topPickTitle" | "runnersUpScope">,
): string {
  const rankLabel =
    plan.rank === 1 ? meta.topPickTitle : `Also ranked #${plan.rank}${meta.runnersUpScope}`;
  return `${rankLabel} — ${plan.carrier} / ${plan.plan}`;
}

export function planFilterWhySectionMetaForPanel(
  panel: PlanPanelId | undefined,
  filter: PlanFilterId,
  scope?: PlanFilterScope,
): PlanFilterWhySectionMeta {
  if (panel === "why-this-plan") {
    return {
      sectionHeading: "",
      sectionBrief:
        "Your three lowest-cost coverage pathways — Medicare Advantage vs Medigap supplement (with Part D modeled in) — ranked by projected annual cost (premiums + drug costs + expected out-of-pocket). Standalone pharmacy-only Part D plans are listed separately.",
      topPickTitle: "Top pick (#1)",
      oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
      whyNumberOneTitle: "Why #1",
      whyOverRunnersTitle: "Why #1 over #2 and #3",
      topRankLabel: "· Best overall match",
      runnersUpScope: "",
    };
  }
  return planFilterWhySectionMeta(filter, scope);
}

export function planFilterWhySectionMeta(
  filter: PlanFilterId,
  scope?: PlanFilterScope,
): PlanFilterWhySectionMeta {
  switch (filter) {
    case "my-available":
      return {
        sectionHeading: "",
        sectionBrief:
          "Your top-ranked plans in your coverage area for the current plan year — selected by lowest projected annual cost (premiums + drug costs + expected out-of-pocket). Standalone Part D drug-only plans are excluded from pathway ranking.",
        topPickTitle: "Top pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Why #1",
        whyOverRunnersTitle: "Why #1 over #2 and #3",
        topRankLabel: "· Best match",
        runnersUpScope: "",
      };
    case "all":
      return {
        sectionHeading: "",
        sectionBrief:
          "Every Medicare plan in your coverage area — sorted by projected fit for your input (cost), then star rating.",
        topPickTitle: "Top pick (#1) — all plans",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Why #1 among all plans",
        whyOverRunnersTitle: "Why #1 over #2 and #3 — all plans",
        topRankLabel: "· Best overall match",
        runnersUpScope: " among all plans",
      };
    case "medicare-advantage":
      return {
        sectionHeading: "",
        sectionBrief:
          "Part C plans that bundle medical and usually drug coverage — ranked by lowest projected annual cost in this filter.",
        topPickTitle: "Top Medicare Advantage pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Ranks #1 — Medicare Advantage",
        whyOverRunnersTitle: "Why #1 over #2 and #3 — Medicare Advantage",
        topRankLabel: "· Best Advantage match",
        runnersUpScope: " among Medicare Advantage plans",
      };
    case "medicare-supplement":
      return {
        sectionHeading: "",
        sectionBrief:
          "Medigap letter plans paired with standalone Part D — ranked by estimated annual cost; CMS does not assign star ratings to supplement plans.",
        topPickTitle: "Top Supplemental pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Ranks #1 — Supplemental",
        whyOverRunnersTitle: "Why #1 over #2 and #3 — Supplemental",
        topRankLabel: "· Best Supplement match",
        runnersUpScope: " among Supplemental plans",
      };
    case "medicare-part-d":
      return {
        sectionHeading: "",
        sectionBrief:
          "Standalone prescription drug plans — ranked by premium and modeled drug costs for your medications.",
        topPickTitle: "Top Part D pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Ranks #1 — Part D",
        whyOverRunnersTitle: "Why #1 over #2 and #3 — Part D",
        topRankLabel: "· Best Part D match",
        runnersUpScope: " among Part D plans",
      };
    case "medigap":
      return {
        sectionHeading: "",
        sectionBrief:
          "Medigap supplement letter plans — ranked by estimated annual cost in your coverage area.",
        topPickTitle: "Top Medigap pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Ranks #1 — Medigap",
        whyOverRunnersTitle: "Why #1 over #2 and #3 — Medigap",
        topRankLabel: "· Best Medigap match",
        runnersUpScope: " among Medigap plans",
      };
    case "hmo":
      return {
        sectionHeading: "",
        sectionBrief:
          "Medicare Advantage HMO plans with in-network primary care and specialist referrals — ranked by estimated annual cost.",
        topPickTitle: "Top HMO pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Ranks #1 — HMO",
        whyOverRunnersTitle: "Why #1 over #2 and #3 — HMO",
        topRankLabel: "· Best HMO match",
        runnersUpScope: " among HMO plans",
      };
    case "ppo":
      return {
        sectionHeading: "",
        sectionBrief:
          "Medicare Advantage PPO plans with broader out-of-network access — ranked by estimated annual cost.",
        topPickTitle: "Top PPO pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Ranks #1 — PPO",
        whyOverRunnersTitle: "Why #1 over #2 and #3 — PPO",
        topRankLabel: "· Best PPO match",
        runnersUpScope: " among PPO plans",
      };
    case "hmo-pos":
      return {
        sectionHeading: "",
        sectionBrief:
          "Medicare Advantage HMO Point-of-Service plans — in-network HMO savings with limited out-of-network access.",
        topPickTitle: "Top HMO-POS pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Ranks #1 — HMO-POS",
        whyOverRunnersTitle: "Why #1 over #2 and #3 — HMO-POS",
        topRankLabel: "· Best HMO-POS match",
        runnersUpScope: " among HMO-POS plans",
      };
    case "pffs":
      return {
        sectionHeading: "",
        sectionBrief:
          "Private Fee-for-Service Medicare Advantage plans — providers must accept plan terms per visit.",
        topPickTitle: "Top PFFS pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Ranks #1 — PFFS",
        whyOverRunnersTitle: "Why #1 over #2 and #3 — PFFS",
        topRankLabel: "· Best PFFS match",
        runnersUpScope: " among PFFS plans",
      };
    case "msa":
      return {
        sectionHeading: "",
        sectionBrief:
          "Medical Savings Account Medicare Advantage plans — high-deductible coverage with a member savings deposit.",
        topPickTitle: "Top MSA pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Ranks #1 — MSA",
        whyOverRunnersTitle: "Why #1 over #2 and #3 — MSA",
        topRankLabel: "· Best MSA match",
        runnersUpScope: " among MSA plans",
      };
    case "highly-rated":
      return {
        sectionHeading: "",
        sectionBrief: `Part D plans with ${HIGHLY_RATED_MIN_STARS_LABEL}+ CMS star ratings and Medigap supplements with ${HIGHLY_RATED_MIN_STARS_LABEL}+ modeled quality scores qualify — use the Part D and Medigap tabs to browse each category. Ranked by estimated annual cost within the active tab.`,
        topPickTitle: "Top highly rated pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: `Ranks #1 (${HIGHLY_RATED_MIN_STARS_LABEL}+ stars)`,
        whyOverRunnersTitle: "Why #1 over #2 and #3 — highly rated",
        topRankLabel: "· Best highly rated match",
        runnersUpScope: " among highly rated plans",
      };
    default:
      return {
        sectionHeading: "",
        sectionBrief:
          "Plans ranked by lowest projected annual cost for your reported medications and coverage area.",
        topPickTitle: "Top pick (#1)",
        oneVsTwoTitle: BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE,
        whyNumberOneTitle: "Why #1",
        whyOverRunnersTitle: "Why #1 over #2 and #3",
        topRankLabel: "· Best match",
        runnersUpScope: "",
      };
  }
}

export function planFilterRankingsMeta(
  filter: PlanFilterId,
  count: number,
  scope?: PlanFilterScope,
): { title: string; subtitle: string } {
  switch (filter) {
    case "my-available":
      return scope === "area"
        ? {
            title: "Top 10 rankings",
            subtitle:
              "Top national CMS catalog plans by estimated annual cost (Medicare Advantage and Medigap pathways)",
          }
        : {
            title: "Top 10 rankings",
            subtitle: "Your best-match plans in your coverage area by estimated annual cost",
          };
    case "all":
      return scope === "area"
        ? {
            title: `All plans (${count})`,
            subtitle:
              "Full national CMS catalog — sorted by projected fit for your input, then star rating",
          }
        : {
            title: `All plans (${count})`,
            subtitle:
              "Plans in your coverage area — sorted by projected fit for your input, then star rating",
          };
    case "medicare-advantage":
      return scope === "area"
        ? {
            title: `Medicare Advantage plans (${count})`,
            subtitle:
              "All Part C plans in the national CMS catalog — HMO, PPO, and other Advantage types",
          }
        : {
            title: `Medicare Advantage plans (${count})`,
            subtitle: "All Part C plans in your area — HMO, PPO, and other Advantage types",
          };
    case "medicare-supplement":
      return {
        title: `Medicare Supplement plans (${count})`,
        subtitle:
          scope === "area"
            ? "All Medigap letter plans in the national CMS catalog"
            : "All Medigap letter plans modeled for your area",
      };
    case "medicare-part-d":
      return {
        title: `Medicare Part D plans (${count})`,
        subtitle:
          scope === "area"
            ? "All standalone prescription drug plans in the national CMS catalog"
            : "All standalone prescription drug plans in your area",
      };
    case "medicare-supplement-top-3":
      return {
        title: `Top 3 Medicare Supplement plans (${count})`,
        subtitle:
          "Lowest projected annual cost Medigap letter plans in the national CMS catalog",
      };
    case "medicare-supplement-top-10":
      return {
        title: `Top 10 Medicare Supplement plans (${count})`,
        subtitle:
          "Lowest projected annual cost Medigap letter plans in the national CMS catalog",
      };
    case "medicare-part-d-top-3":
      return {
        title: `Top 3 Part D plans (${count})`,
        subtitle:
          "Lowest projected annual cost standalone prescription drug plans in the national CMS catalog",
      };
    case "medicare-part-d-top-10":
      return {
        title: `Top 10 Part D plans (${count})`,
        subtitle:
          "Lowest projected annual cost standalone prescription drug plans in the national CMS catalog",
      };
    case "medicare-supplement-highly-rated":
      return {
        title: `Highly rated Medicare Supplement plans (${count})`,
        subtitle: `Medigap letter plans with ${HIGHLY_RATED_MIN_STARS_LABEL}+ modeled quality scores in the national CMS catalog — ranked by estimated annual cost`,
      };
    case "medicare-part-d-highly-rated":
      return {
        title: `Highly rated Part D plans (${count})`,
        subtitle: `Standalone prescription drug plans with ${HIGHLY_RATED_MIN_STARS_LABEL}+ CMS star ratings in the national CMS catalog — ranked by estimated annual cost`,
      };
    case "medigap":
      return {
        title: `Medigap plans (${count})`,
        subtitle:
          scope === "area"
            ? "All Medigap supplement letter plans in the national CMS catalog"
            : "All Medigap supplement letter plans in your area",
      };
    case "hmo":
      return {
        title: `HMO plans (${count})`,
        subtitle:
          scope === "area"
            ? "Medicare Advantage HMO options in the national CMS catalog"
            : "Medicare Advantage HMO options in your area",
      };
    case "ppo":
      return {
        title: `PPO plans (${count})`,
        subtitle:
          scope === "area"
            ? "Medicare Advantage PPO options in the national CMS catalog"
            : "Medicare Advantage PPO options in your area",
      };
    case "hmo-pos":
      return {
        title: `HMO-POS plans (${count})`,
        subtitle:
          scope === "area"
            ? "Medicare Advantage HMO Point-of-Service options in the national CMS catalog"
            : "Medicare Advantage HMO Point-of-Service options in your area",
      };
    case "pffs":
      return {
        title: `PFFS plans (${count})`,
        subtitle:
          scope === "area"
            ? "Private Fee-for-Service Medicare Advantage options in the national CMS catalog"
            : "Private Fee-for-Service Medicare Advantage options in your area",
      };
    case "msa":
      return {
        title: `MSA plans (${count})`,
        subtitle:
          scope === "area"
            ? "Medical Savings Account Medicare Advantage options in the national CMS catalog"
            : "Medical Savings Account Medicare Advantage options in your area",
      };
    case "c-snp":
      return {
        title: `C-SNP plans (${count})`,
        subtitle:
          scope === "area"
            ? "Chronic Condition Special Needs Medicare Advantage plans in the national CMS catalog"
            : "Chronic Condition Special Needs Medicare Advantage plans in your area",
      };
    case "d-snp":
      return {
        title: `D-SNP plans (${count})`,
        subtitle:
          scope === "area"
            ? "Dual Eligible Special Needs Medicare Advantage plans in the national CMS catalog"
            : "Dual Eligible Special Needs Medicare Advantage plans in your area",
      };
    case "i-snp":
      return {
        title: `I-SNP plans (${count})`,
        subtitle:
          scope === "area"
            ? "Institutional Special Needs Medicare Advantage plans in the national CMS catalog"
            : "Institutional Special Needs Medicare Advantage plans in your area",
      };
    case "highly-rated":
      return {
        title: `Highly rated plans (${count})`,
        subtitle: `Part D with ${HIGHLY_RATED_MIN_STARS_LABEL}+ CMS stars and Medigap with ${HIGHLY_RATED_MIN_STARS_LABEL}+ modeled quality — switch tabs to browse each category`,
      };
    default:
      return { title: "Plan rankings", subtitle: "" };
  }
}

/** Rankings heading when a Highly Rated sub-tab is active. */
export function highlyRatedSubTabRankingsMeta(
  subTab: HighlyRatedSubTab,
  count: number,
): { title: string; subtitle: string } {
  if (subTab === "all") {
    return {
      title: `Highly rated plans (${count})`,
      subtitle: `All ${HIGHLY_RATED_MIN_STARS_LABEL}+ star Medicare Advantage, Part D, and Medigap plans — ranked by estimated annual cost`,
    };
  }
  if (subTab === "medicare-advantage") {
    return {
      title: `Highly rated Medicare Advantage plans (${count})`,
      subtitle: `Medicare Advantage plans with ${HIGHLY_RATED_MIN_STARS_LABEL}+ CMS star ratings — ranked by estimated annual cost`,
    };
  }
  if (subTab === "medicare-part-d") {
    return {
      title: `Highly rated Part D plans (${count})`,
      subtitle: `Standalone prescription drug plans with ${HIGHLY_RATED_MIN_STARS_LABEL}+ CMS star ratings — ranked by estimated annual cost`,
    };
  }
  return {
    title: `Highly rated Medigap plans (${count})`,
    subtitle: `Medigap letter plans with ${HIGHLY_RATED_MIN_STARS_LABEL}+ modeled quality scores — ranked by estimated annual cost (CMS does not star-rate supplements)`,
  };
}

/** Heading and browse subtitle for an All Plans list sub-tab. */
export function allPlansListTabRankingsMeta(
  tab: AllPlansListTab,
  count: number,
): { title: string; subtitle: string } {
  if (tab === "all") {
    return planFilterRankingsMeta("all", count, "area");
  }
  if (tab === "part-b-meds") {
    return partBMedTabRankingsMeta(count, "area");
  }
  return planFilterRankingsMeta(tab, count, "area");
}

/** Rankings heading when the Part B medications in-list tab is active. */
export function partBMedTabRankingsMeta(
  count: number,
  scope?: PlanFilterScope,
): { title: string; subtitle: string } {
  return {
    title: `Part B medication coverage (${count})`,
    subtitle:
      scope === "area"
        ? "Outpatient drugs and DME covered under Medicare Part B — browse Medicare Advantage and Medigap plans that pair with Part B coverage"
        : "Outpatient drugs and DME covered under Medicare Part B — browse Advantage and Medigap plans in your area that pair with Part B coverage",
  };
}

/** Plans shown in the rankings table — all matches except My Available (top 10). */
export function plansForRankingsTable(
  filteredPlans: PlanDetail[],
  filter: PlanFilterId,
): PlanDetail[] {
  if (filter === "my-available") {
    return filteredPlans.slice(0, 10);
  }
  return filteredPlans;
}

/** Plans shown in detail cards — runners-up for My Available; full list for other filters. */
export function plansForDetailCards(
  filteredPlans: PlanDetail[],
  filter: PlanFilterId,
): PlanDetail[] {
  if (filter === "my-available") {
    return filteredPlans.slice(1, 10);
  }
  return filteredPlans;
}
