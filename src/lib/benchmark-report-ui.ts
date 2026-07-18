import type { EducationalBenchmarkReport } from "@/lib/educational-benchmark-report";
import type { PlanDetail } from "@/lib/plan-details";
import { formatCountyOptionLabel } from "@/lib/zip3-county-lookup";
import { cn } from "@/lib/utils";

/** Shared interactive styles for benchmark report TOC links and in-page anchors. */
export const BENCHMARK_REPORT_LINK_CLASS = "underline cursor-pointer";

/** Stronger highlight for the currently selected tab, filter, or nav target. */
export const BENCHMARK_REPORT_SELECTED_CLASS =
  "ring-2 ring-primary/40 ring-offset-2 ring-offset-background";

/** Dark blue for benchmark report section and subsection titles. */
export const BENCHMARK_SECTION_HEADING_CLASS = "text-[var(--brand-navy)]";

/** Base layout for benchmark report section tabs and matching plan filter tabs. */
export const BENCHMARK_REPORT_TAB_BASE_CLASS =
  "relative inline-flex cursor-pointer items-center justify-center rounded-none rounded-t-md px-3 py-2 sm:px-4 text-xs font-medium transition-colors shadow-none";

const BENCHMARK_REPORT_TAB_INACTIVE_CLASS =
  "mb-0 border border-white/15 border-b-0 bg-[var(--brand-navy-light)] text-white hover:bg-[var(--brand-navy-accent)]";

const BENCHMARK_REPORT_TAB_ACTIVE_CLASS =
  "z-10 -mb-px border border-border border-b-emerald bg-emerald text-white font-semibold";

/** Plan filter pills and other buttons that mirror section tab selected/unselected states. */
export function benchmarkReportTabButtonClass(active: boolean) {
  return cn(
    BENCHMARK_REPORT_TAB_BASE_CLASS,
    active ? BENCHMARK_REPORT_TAB_ACTIVE_CLASS : BENCHMARK_REPORT_TAB_INACTIVE_CLASS,
  );
}

/** Radix TabsTrigger — same colors as {@link benchmarkReportTabButtonClass}. */
export const BENCHMARK_REPORT_TAB_TRIGGER_CLASS = cn(
  BENCHMARK_REPORT_TAB_BASE_CLASS,
  "data-[state=inactive]:mb-0 data-[state=inactive]:border data-[state=inactive]:border-white/15 data-[state=inactive]:border-b-0",
  "data-[state=inactive]:bg-[var(--brand-navy-light)] data-[state=inactive]:text-white",
  "data-[state=inactive]:hover:bg-[var(--brand-navy-accent)]",
  "data-[state=active]:z-10 data-[state=active]:-mb-px data-[state=active]:border data-[state=active]:border-border",
  "data-[state=active]:border-b-emerald data-[state=active]:bg-emerald data-[state=active]:text-white",
  "data-[state=active]:font-semibold",
);

/**
 * Uniform Possible Plans filter pills — width fits "Supplement 64" (longest common label+count)
 * at 11px with minimal horizontal padding.
 */
export const BENCHMARK_FILTER_PILL_WIDTH = "6.25rem";

/** Fixed label column — matches across every filter row so pill columns line up vertically. */
export const BENCHMARK_FILTER_LABEL_COLUMN_CLASS = cn(
  "min-w-0 shrink-0 text-right",
  "w-[7rem] min-w-[7rem] max-w-[7rem]",
  "sm:w-[11.5rem] sm:min-w-[11.5rem] sm:max-w-[11.5rem]",
);

export const BENCHMARK_FILTER_PILL_UNIFORM_CLASS = cn(
  "min-h-[1.375rem] w-[6.25rem] min-w-[6.25rem] max-w-[6.25rem] shrink-0 justify-center px-0.5 py-0.5 text-[11px] leading-none whitespace-nowrap",
);

/**
 * Filter row shell — fixed label column on the left, pills in a separate flex-wrap region
 * so wrapped bubbles align under the previous bubble, not under the label.
 */
export const BENCHMARK_FILTER_ROW_CLASS = cn("flex min-w-0 items-start gap-x-0.5 gap-y-1");

/** Pills region — takes remaining width; wraps horizontally within the bubble column only. */
export const BENCHMARK_FILTER_PILLS_WRAP_CLASS = cn(
  "flex min-w-0 flex-1 flex-wrap items-center justify-start gap-x-0.5 gap-y-1",
);

/** @deprecated Use {@link BENCHMARK_FILTER_ROW_CLASS}. */
export const BENCHMARK_FILTER_ROW_SINGLE_CLASS = BENCHMARK_FILTER_ROW_CLASS;

/** @deprecated Use {@link BENCHMARK_FILTER_ROW_CLASS}. */
export const BENCHMARK_FILTER_ROW_MULTI_CLASS = BENCHMARK_FILTER_ROW_CLASS;

/** @deprecated Use {@link BENCHMARK_FILTER_ROW_CLASS}. */
export const BENCHMARK_FILTER_ROW_GRID_CLASS = BENCHMARK_FILTER_ROW_CLASS;

export function benchmarkFilterRowLayoutClass(_pillCount: number): string {
  return BENCHMARK_FILTER_ROW_CLASS;
}

/** Section header label cell — green buttons right-align so My Available / All Plans match. */
export const BENCHMARK_FILTER_SECTION_TITLE_LABEL_CLASS = cn(
  BENCHMARK_FILTER_LABEL_COLUMN_CLASS,
  "flex items-center justify-end pr-0.5",
);

/** Section header shell — title stacks above pills on mobile; inline on desktop. */
export const BENCHMARK_FILTER_SECTION_HEADER_CLASS = cn(
  "min-w-0 space-y-1 sm:space-y-0",
);

/** Pill count used for grid column tracks (defaults to actual pill count). */
export function benchmarkFilterRowGridPillCount(pillCount: number, layoutPillCount?: number): number {
  return layoutPillCount ?? pillCount;
}

/** Section headings — My Available Plans / All Plans (matches selected filter pill). */
export const BENCHMARK_FILTER_SECTION_HEADING_CLASS = cn(
  "inline-flex min-h-[1.5rem] max-w-full items-center rounded-full border border-emerald bg-emerald",
  "px-1.5 py-0.5 text-xs font-semibold leading-snug text-white shadow-sm",
  "hover:bg-emerald/90",
);

export const BENCHMARK_STICKY_HEADER_SELECTOR = "[data-benchmark-sticky-header]";

/** Scroll margin for in-page anchors below the sticky report header (tabs + filters). */
export const BENCHMARK_REPORT_STICKY_SCROLL_MT = "scroll-mt-36 sm:scroll-mt-48 md:scroll-mt-56";

/** Offset below report sticky header — used for scroll anchors only. */
export const BENCHMARK_PLAN_LIST_STICKY_TOP_CLASS = "top-36 sm:top-48 md:top-56";

/** Plan list section chrome (title, tabs, browse line) — scrolls with the page; not sticky. */
export const BENCHMARK_PLAN_LIST_CHROME_CLASS = "space-y-1.5";

/** Shared scroll region for Rankings / Side by Side plan results (legacy single-region scroll). */
export const PLAN_RESULTS_VIEW_SCROLL_CLASS =
  "max-h-[min(70vh,640px)] overflow-auto overscroll-contain";

/** Scroll only table bodies — chrome and tabs stay fixed above. */
export const PLAN_RESULTS_BODY_SCROLL_CLASS =
  "min-h-0 flex-1 overflow-auto overscroll-contain";

/** Rankings / Side by Side tabs — stick to top of the plan results scroll region (md+ only). */
export const PLAN_RESULTS_TABS_STICKY_BASE =
  "md:sticky z-20 border-b border-border/60 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90";

export const PLAN_RESULTS_TABS_STICKY_CLASS = cn(PLAN_RESULTS_TABS_STICKY_BASE, "top-0");

/** Section heading (Potential Options + plan name) — pins at top of the plan list scroll region. */
export const PLAN_LIST_SECTION_HEADING_STICKY_CLASS = cn(
  PLAN_RESULTS_TABS_STICKY_BASE,
  "top-0 z-30",
);

/** In-list category filter tabs — pins below the section heading. */
export const PLAN_LIST_CATEGORY_CHROME_STICKY_CLASS = cn(
  PLAN_RESULTS_TABS_STICKY_BASE,
  "top-[4.75rem] z-25",
);

/** In-list category filter tabs when there is no section heading above. */
export const PLAN_LIST_CATEGORY_CHROME_STICKY_ONLY_CLASS = cn(
  PLAN_RESULTS_TABS_STICKY_BASE,
  "top-0 z-25",
);

/** Plan table column headers below Rankings / Side by Side tabs in the same scroll region. */
export const PLAN_TABLE_HEAD_STICKY_BELOW_TABS_CLASS = "top-9";

export function planResultsTabsStickyClass(
  below: "none" | "heading" | "category" | "heading-category",
): string {
  switch (below) {
    case "heading":
      return cn(PLAN_RESULTS_TABS_STICKY_BASE, "top-[4.75rem]");
    case "category":
      return cn(PLAN_RESULTS_TABS_STICKY_BASE, "top-[2.25rem]");
    case "heading-category":
      return cn(PLAN_RESULTS_TABS_STICKY_BASE, "top-[7rem]");
    default:
      return PLAN_RESULTS_TABS_STICKY_CLASS;
  }
}

export function planTableHeadStickyClass(
  below: "none" | "tabs" | "heading-tabs" | "category-tabs" | "full-chrome",
): string {
  switch (below) {
    case "heading-tabs":
      return "top-[7rem]";
    case "category-tabs":
      return "top-[4.5rem]";
    case "full-chrome":
      return "top-[9.25rem]";
    case "tabs":
      return PLAN_TABLE_HEAD_STICKY_BELOW_TABS_CLASS;
    default:
      return "top-0";
  }
}

/** @deprecated Plan list chrome is no longer sticky — only table column headers stick. */
export const BENCHMARK_PLAN_LIST_STICKY_CHROME_CLASS = BENCHMARK_PLAN_LIST_CHROME_CLASS;

/** Sticky benchmark report chrome — section tabs and toolbar (compact on mobile). */
export const BENCHMARK_REPORT_STICKY_HEADER_CLASS =
  "sticky top-0 z-40 -mx-1 border-b border-border bg-background/95 px-1 pb-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90";

/** Desktop-only inline filter bubble rows inside the sticky report header. */
export const BENCHMARK_REPORT_DESKTOP_FILTER_CLASS = "hidden md:block";
export const BENCHMARK_PLANS_SUBSECTION = {
  recommended: "plans-recommended",
  runnersUp: "plans-runners-up",
  oneVsTwo: "plans-one-vs-two",
  whyNumberOne: "plans-why-number-one",
  howCompared: "plans-how-compared",
  whyOverRunners: "plans-why-over-runners",
  /** Scroll target for filter bubbles — section title at top of list block. */
  rankingsListHeading: "plans-rankings-list-heading",
  /** Wrapper for full rankings block (list + table). */
  rankingsList: "plans-rankings-list",
  top10Rankings: "plans-top-10-rankings",
  fullDetails: "plans-full-details",
} as const;

/** Saved benchmark scenarios — bottom of each report tab. */
export const BENCHMARK_PREVIOUS_SCENARIOS_ANCHOR = {
  input: "benchmark-previous-scenarios-input",
  possiblePlans: "benchmark-previous-scenarios-plans",
  pboLocal: "benchmark-previous-scenarios-pbo-local",
  workbook: "benchmark-previous-scenarios-workbook",
} as const;

export type BenchmarkPreviousScenariosSectionId = keyof typeof BENCHMARK_PREVIOUS_SCENARIOS_ANCHOR;

const BENCHMARK_TAB_INPUT_ID = "benchmark-utilization";
const BENCHMARK_TAB_POSSIBLE_PLANS_ID = "benchmark-possible-plans";
const BENCHMARK_TAB_PBO_LOCAL_ID = "benchmark-part-b";
const BENCHMARK_TAB_WORKBOOK_ID = "benchmark-workbook";

/** Map active report tab id → previous-scenarios anchor section. */
export function previousScenariosSectionForTab(tabId: string): BenchmarkPreviousScenariosSectionId {
  switch (tabId) {
    case BENCHMARK_TAB_POSSIBLE_PLANS_ID:
      return "possiblePlans";
    case BENCHMARK_TAB_PBO_LOCAL_ID:
      return "pboLocal";
    case BENCHMARK_TAB_WORKBOOK_ID:
      return "workbook";
    case BENCHMARK_TAB_INPUT_ID:
    default:
      return "input";
  }
}

export const PLAN_TABLE_SCROLL_SELECTOR = "[data-plan-table-scroll]";

/** Possible Plans card body — plan list uses full width on phone/tablet. */
export const BENCHMARK_POSSIBLE_PLANS_CARD_BODY_CLASS = "px-0 pb-4 lg:px-6";

/** Possible Plans card footer — keep Previous Scenarios and back-to-top inset. */
export const BENCHMARK_POSSIBLE_PLANS_CARD_FOOTER_CLASS = "px-6";

/**
 * Embedded plan results body padding — matches card inset on lg+; tighter on phone/tablet
 * so the plan table can bleed to card edges via {@link BENCHMARK_EMBEDDED_PLAN_TABLE_BLEED_CLASS}.
 */
export const BENCHMARK_EMBEDDED_PLAN_RESULTS_BODY_CLASS = cn(
  "py-3 space-y-2",
  "px-2 sm:px-3 lg:px-5",
);

/**
 * Negative horizontal margin matching {@link BENCHMARK_EMBEDDED_PLAN_RESULTS_BODY_CLASS} —
 * lets bordered plan tables span the full card width on phone/tablet.
 */
export const BENCHMARK_EMBEDDED_PLAN_TABLE_BLEED_CLASS = "-mx-2 sm:-mx-3 lg:mx-0";

/** Bordered plan results shell inside embedded Possible Plans — full width below lg. */
export const BENCHMARK_EMBEDDED_PLAN_TABLE_SHELL_CLASS = cn(
  "flex max-h-[min(70vh,640px)] min-h-0 flex-col overflow-hidden",
  "rounded-none border-y border-border lg:rounded-md lg:border",
  BENCHMARK_EMBEDDED_PLAN_TABLE_BLEED_CLASS,
);

/** Standalone embedded plan table frame (e.g. Potential Top 3 rankings tab). */
export const BENCHMARK_EMBEDDED_PLAN_TABLE_FRAME_CLASS = cn(
  "overflow-hidden rounded-none border-y border-border lg:rounded-md lg:border",
  BENCHMARK_EMBEDDED_PLAN_TABLE_BLEED_CLASS,
);

/** Plan comparison table — fluid on phone/tablet; min width only on desktop. */
export const PLAN_TABLE_CLASS = cn("w-full text-xs", "min-w-0 lg:min-w-[440px]");

/** Slightly tighter cell padding on small screens. */
export const PLAN_TABLE_HEADER_CELL_CLASS = cn(
  "py-1.5 font-semibold bg-[var(--brand-navy)] text-white border-b border-white/15",
  "px-1.5 sm:px-2",
);

export const PLAN_TABLE_BODY_CELL_CLASS = "py-1 px-1.5 sm:px-2";

export function getBenchmarkStickyHeaderOffsetPx(): number {
  const header = document.querySelector<HTMLElement>(BENCHMARK_STICKY_HEADER_SELECTOR);
  if (header) return header.getBoundingClientRect().height + 8;
  return window.matchMedia("(min-width: 768px)").matches ? 224 : 160;
}

/** Smooth-scroll to an in-page anchor below sticky report chrome; optionally focus it. */
export function scrollToBenchmarkReportElement(elementId: string, focus = true): void {
  const el = document.getElementById(elementId);
  if (!el) return;

  const scrollToTarget = () => {
    const offset = getBenchmarkStickyHeaderOffsetPx();
    const top = window.scrollY + el.getBoundingClientRect().top - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  scrollToTarget();
  window.requestAnimationFrame(() => {
    scrollToTarget();
    if (focus) el.focus({ preventScroll: true });
  });
}

/** Scroll to a ranked plan card — top of the block where carrier and plan name appear. */
export function scrollToBenchmarkPlanCard(plan: PlanDetail): void {
  scrollToBenchmarkReportElement(planCardAnchorId(plan));
}

/** Smooth-scroll to the Previous Scenarios heading for a report tab section. */
export function scrollToPreviousScenariosSection(section: BenchmarkPreviousScenariosSectionId): void {
  scrollToBenchmarkReportElement(BENCHMARK_PREVIOUS_SCENARIOS_ANCHOR[section]);
}

/** Smooth-scroll to the sticky report header (tabs + filters). */
export function scrollToBenchmarkReportTop(): void {
  const header = document.querySelector<HTMLElement>(BENCHMARK_STICKY_HEADER_SELECTOR);
  if (header) {
    const top = window.scrollY + header.getBoundingClientRect().top - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetPlanTableInnerScroll(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(PLAN_TABLE_SCROLL_SELECTOR).forEach((el) => {
    el.scrollTop = 0;
  });
}

/** Scroll embedded report content to the plan list section heading; reset inner table scroll. */
export function scrollToBenchmarkReportContent(): void {
  const scrollToAnchor = (elementId: string, focus: boolean) => {
    scrollToBenchmarkReportElement(elementId, focus);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resetPlanTableInnerScroll(document);
        window.setTimeout(() => resetPlanTableInnerScroll(document), 100);
      });
    });
  };

  const heading = document.getElementById(BENCHMARK_PLANS_SUBSECTION.rankingsListHeading);
  if (heading) {
    scrollToAnchor(BENCHMARK_PLANS_SUBSECTION.rankingsListHeading, true);
    return;
  }

  const anchor =
    document.getElementById(BENCHMARK_PLANS_SUBSECTION.recommended) ??
    document.querySelector<HTMLElement>("[id^='plan-card-']") ??
    document.getElementById(BENCHMARK_PLANS_SUBSECTION.rankingsList) ??
    document.getElementById(BENCHMARK_PLANS_SUBSECTION.top10Rankings);
  if (!anchor) return;

  scrollToAnchor(anchor.id, false);
}

/** Retry until the plan list heading mounts, then scroll and focus it. */
export function scrollToBenchmarkPlanListHeading(): void {
  let attempts = 0;
  const tryScroll = () => {
    const heading = document.getElementById(BENCHMARK_PLANS_SUBSECTION.rankingsListHeading);
    if (heading) {
      scrollToBenchmarkReportContent();
      return;
    }
    if (attempts < 32) {
      attempts += 1;
      requestAnimationFrame(tryScroll);
    } else {
      scrollToBenchmarkReportContent();
    }
  };
  requestAnimationFrame(tryScroll);
}

/** @deprecated Use {@link scrollToBenchmarkReportContent}. */
export const scrollToBenchmarkPlansList = scrollToBenchmarkReportContent;

export type BenchmarkPlansSubsectionId =
  (typeof BENCHMARK_PLANS_SUBSECTION)[keyof typeof BENCHMARK_PLANS_SUBSECTION];

export type BenchmarkReportNavChild = {
  id: string;
  label: string;
};

/** In-page anchor for a ranked plan card (#1 uses the recommended subsection). */
export function benchmarkPlanDetailAnchorId(rank: number): string {
  return rank === 1 ? BENCHMARK_PLANS_SUBSECTION.recommended : `plan-detail-${rank}`;
}

/** Middle dot separator between ZIP prefix and county labels in report headers. */
export const BENCHMARK_REPORT_LOCATION_SEPARATOR = " · ";

/** Plain-text location line shown under the benchmark report title (ZIP + county). */
export function formatBenchmarkReportZipLineText(report: EducationalBenchmarkReport): string {
  const zipPart = `ZIP ${report.zip3}xx`;
  if (report.selectedCounty) {
    return `${zipPart}${BENCHMARK_REPORT_LOCATION_SEPARATOR}${formatCountyOptionLabel(report.selectedCounty)}`;
  }
  if (report.counties.length > 0) {
    return `${zipPart}${BENCHMARK_REPORT_LOCATION_SEPARATOR}${report.counties
      .map((c) => formatCountyOptionLabel(c))
      .join(BENCHMARK_REPORT_LOCATION_SEPARATOR)}`;
  }
  return `${zipPart} (regional context)`;
}

/** Stable anchor for a specific plan card — used when filters re-rank the list. */
export function planCardAnchorId(plan: PlanDetail): string {
  const slug = `${plan.carrier}-${plan.plan}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `plan-card-${slug}`;
}
