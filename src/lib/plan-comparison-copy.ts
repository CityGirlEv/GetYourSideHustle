/** User-facing Medicare plan comparison terminology (CMS-aligned). */
import { BENCHMARK_SCOPE_NOTE } from "@/lib/medicare-disclaimers";

/** Public name for the /scenario/new benchmark intake tool. */
export const BENCHMARK_TOOL_NAME = "Part B Optimizer Benchmark Tool";
/** Report page title — shown once in AppShell, not repeated in report body. */
export const BENCHMARK_REPORT_PAGE_SUBTITLE = "PART B OPTIMIZER EDUCATIONAL BENCHMARK REPORT";
/** Step 1 / first how-it-works item on the benchmark tool page. */
export const PBO_BLUEPRINT_LABEL = "PBO Blueprint";
/** Expanded section heading on the benchmark report (nav keeps PBO_BLUEPRINT_LABEL). */
export const PBO_BLUEPRINT_SECTION_TITLE = "Part B Optimizer (PBO) Blueprint";
/** Primary consumer CTA — benchmark tool, not plan-finding language. */
export const BENCHMARK_TOOL_CTA = "Use the Part B Optimizer Benchmark Tool";

/** Primary action CTA — alias for benchmark tool entry points. */
export const PLAN_COMPARISON_CTA = BENCHMARK_TOOL_CTA;
export const PLAN_COMPARISON_CTA_PRIVATE = BENCHMARK_TOOL_CTA;

/** Shown near CTAs and on results — qualifies scope for TPMO compliance. */
export const PLAN_COMPARISON_EDUCATIONAL_NOTE = BENCHMARK_SCOPE_NOTE;

/** Short explainer for de-identified / zero-PII positioning. */
export const DEIDENTIFIED_MEANING_HEADLINE = "What does de-identified mean?";
export const NO_PHI_PII_COLLECTION_NOTE =
  "We do not collect Personal Health Information (PHI) or Personally Identifiable Information (PII).";
export const NO_PHI_PII_COLLECTION_NOTE_LINE_1 =
  "We do not collect Personal Health Information (PHI)";
export const NO_PHI_PII_COLLECTION_NOTE_LINE_2 =
  "or Personally Identifiable Information (PII).";
export const DEIDENTIFIED_PII_NOTE = NO_PHI_PII_COLLECTION_NOTE;
/** Trust banner marquee — short form of the PHI/PII note. */
export const TRUST_BANNER_NO_PHI_PII = "No PHI or PII collected";

export const COMPARISON_ID_LABEL = "Comparison ID";
export const COMPARISON_ID_SHORT = "comparison ID";
export const COMPARISON_CODE_PLACEHOLDER = "Enter comparison code";

/** Benchmark tool output ID (BM-…) — distinct from legacy SCN- comparison IDs. */
export const BENCHMARK_TOOL_ID_LABEL = "Benchmark Tool ID";
export const BENCHMARK_TOOL_ID_SHORT = "benchmark tool ID";
export const BENCHMARK_CODE_PLACEHOLDER = "Enter your BM- code";
export const COPY_BENCHMARK_TOOL_ID = "Copy Benchmark Tool ID";
export const COPY_BENCHMARK_TOOL_LINK = "Copy benchmark report link";
export const BENCHMARK_TOOL_LINK_COPIED = "Benchmark report link copied";
export const BENCHMARK_TOOL_ID_COPIED = "Benchmark Tool ID copied";
export const VIEW_BENCHMARK_REPORT = "View your benchmark report";
export const YOUR_BENCHMARK_REPORT = "Your benchmark report";
export const BENCHMARK_CREATED = "Benchmark ready";
export const BENCHMARK_VIEW_AREA_PLANS = "See possible plans in your area";
export const BENCHMARK_POSSIBLE_PLANS_TOC = "Available Plans";
/** Benchmark report tab labels — each section tab starts with "My" except the workbook tab. */
export const BENCHMARK_TAB_INPUT = "My Input";
export const BENCHMARK_TAB_PBO_LOCAL = "Blueprint & Benchmarks";
/** @deprecated Use BENCHMARK_TAB_PBO_LOCAL — kept for subsection headings. */
export const BENCHMARK_TAB_PBO = "My PBO Blueprint";
export const BENCHMARK_TAB_PBO_LOCAL_SUBTITLE = "& Local Benchmarks";
/** @deprecated Use BENCHMARK_TAB_PBO_LOCAL — kept for in-panel local section heading. */
export const BENCHMARK_TAB_LOCAL = "My Local Benchmarks";
export const BENCHMARK_TAB_POSSIBLE_PLANS = "Potential Options";
export const BENCHMARK_TAB_WHY_THIS_PLAN = "Why This Plan?";
/** Row 1 pill — top-3 rationale view on the benchmark report. */
export const POTENTIAL_TOP_3_LABEL = "Potential Top 3";
/** Side-by-side comparison tab within Potential Top 3. */
export const PLAN_SIDE_BY_SIDE_LABEL = "Side by Side";
export const PLAN_COMPARE_SELECT_HINT = "Select up to 3 plans in the list, then compare side by side.";
export const PLAN_COMPARE_SELECTED_LABEL = "Compare selected";
/** Row 1 pill — full top-10 rankings for the member's available plans. */
export const TOP_10_PLANS_LABEL = "Top 10 Plans";
/** Collapsible rationale header on Potential Top 3. */
export const BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE = "Why This Plan Has Potential";
/** @deprecated Use {@link BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE} — kept for imports. */
export const BENCHMARK_ONE_VS_TWO_COLLAPSIBLE_TITLE = BENCHMARK_WHY_BEST_POTENTIAL_HEADLINE;
export const BENCHMARK_TAB_PREPARE = "Turning 65 Workbook";
export const BENCHMARK_TAB_PREPARE_SUBTITLE = "Get the Workbook";
/** @deprecated Use BENCHMARK_TAB_PREPARE — kept for workbook route aliases. */
export const BENCHMARK_WORKBOOK_TOC = BENCHMARK_TAB_PREPARE;
export const BENCHMARK_WORKBOOK_SECTION_TITLE = "Part B Optimizer (PBO) Turning 65 Workbook";
export const BENCHMARK_DOWNLOAD_REPORT = "Download full report";
export const BENCHMARK_REPORT_DOWNLOADED = "Benchmark report downloaded";
export const BENCHMARK_REPORT_OPENED =
  "Report opened in a new tab — use Save or Print in the PDF viewer to keep a copy.";
export const BENCHMARK_WORKBOOK_OPENED =
  "Workbook opened in a new tab — use Save or Print in the PDF viewer to keep a copy.";
export const BENCHMARK_OPEN_PDF = "Open PDF";
export const BENCHMARK_OPENING_PDF = "Opening…";
export const BENCHMARK_OPEN_EXCEL = "Open Excel";
export const BENCHMARK_OPENING_EXCEL = "Opening…";
export const BENCHMARK_REPORT_XLSX_OPENED =
  "Excel report opened in a new tab — use Save As in Excel to keep a copy.";
export const PLAN_COMPARISON_OPEN_EXCEL = "Open Excel";
export const PLAN_COMPARISON_XLSX_OPENED =
  "Excel workbook opened in a new tab — use Save As in Excel to keep a copy.";
export const BENCHMARK_TOOL_REPORT_LABEL = "Benchmark Tool Report";
export const BENCHMARK_TOOL_REPORTS_LABEL = "Benchmark Tool Reports";
export const BENCHMARK_NEW_SCENARIO = "New Benchmark Tool Report";
export const BENCHMARK_SAVE_SCENARIO = "Save Report";
export const BENCHMARK_SAVING_SCENARIO = "Saving…";
export const BENCHMARK_SCENARIO_SAVED = "Report saved — PDF downloaded";
export const BENCHMARK_RUN_UPDATED_SCENARIO = "Run New Report";
export const BENCHMARK_RUNNING_SCENARIO = "Building report…";
/** Save Report stays disabled when ZIP prefix or county changes — use Run New Report instead. */
export const BENCHMARK_SAVE_LOCATION_CHANGED_HINT =
  "Change ZIP or county requires generating a new report";
/** Shown on non–My Input tabs — how to start a fresh report from edited answers. */
export const BENCHMARK_NEW_INPUT_HINT = `You can create a new input by going back to the ${BENCHMARK_TAB_INPUT} tab, update the form, and click ${BENCHMARK_RUN_UPDATED_SCENARIO}.`;
export const BENCHMARK_CONTACT_AGENT = "Contact an agent";
export const BENCHMARK_SUBSCRIBE = "Subscribe/Learning Center";

/** Footnote under My Available* and All Plans* filter sections and plan lists. */
export const PLAN_SCOPE_ASTERISK_DISCLAIMER =
  "Plans from the official CMS Medicare Advantage and Part D Landscape file. Medigap supplements use CMS standardized benefit references. D-SNP, C-SNP, and I-SNP plans require qualifying eligibility. We may not represent every carrier — confirm on Medicare.gov.";

export const YOUR_PLAN_COMPARISON = "Your plan comparison";
export const VIEW_PLAN_COMPARISON = "View your plan comparison";
export const VIEW_COMPARISON_SUMMARY = "View comparison summary";
export const CREATE_COMPARISON = "Create comparison";
export const COMPARISON_CREATED = "Comparison created";
export const COPY_COMPARISON_ID = "Copy Comparison ID";
export const COPY_COMPARISON_LINK = "Copy comparison link";
export const COMPARISON_LINK_COPIED = "Comparison link copied";
export const COMPARISON_ID_COPIED = "Comparison ID copied";

export const BUILD_COMPARISON_HEADLINE = "Part B Optimizer Benchmark Tool";
export const BUILD_COMPARISON_SUBTITLE =
  "Answer a few benchmark questions about your Medicare needs — about 2 minutes.";
export const BUILD_COMPARISON_PRIVACY =
  "No phone, no email, no login — share your Benchmark Tool ID only if you choose.";

/** Home page banner below the hero — educational benchmark, not plan comparison. */
export const HOME_BENCHMARK_BANNER_LEAD =
  "benchmarks your Medicare situation using current federal guidelines, so you can";
export const HOME_BENCHMARK_BANNER_EMPHASIS =
  "UNDERSTAND YOUR OPTIONS AND CHOOSE WITH CONFIDENCE!";

export const PREVIOUS_COMPARISONS_LABEL = "Previous comparisons on this device";
export const PREVIOUS_ESTIMATES_LABEL = "Previous Benchmark Tool Reports on this device";
export const PREVIOUS_BENCHMARK_TOOL_REPORTS_LABEL = "Previous Benchmark Tool Reports";
/** @deprecated Use {@link PREVIOUS_BENCHMARK_TOOL_REPORTS_LABEL}. */
export const PREVIOUS_SCENARIOS_LABEL = PREVIOUS_BENCHMARK_TOOL_REPORTS_LABEL;

export const DEIDENTIFIED_COMPARISONS_ONLY = "De-identified plan comparisons only";
export const COMPARISON_ANONYMOUS_UNLESS_OPT_IN =
  "Your comparison is anonymous unless you opt in";
