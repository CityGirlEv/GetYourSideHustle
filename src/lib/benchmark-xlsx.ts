import ExcelJS from "exceljs";
import { openXlsxBlobInTab, prepareXlsxPreviewTab } from "@/lib/xlsx-open";
import type { FinalizedBenchmark } from "@/lib/benchmark-intake";
import { buildBenchmarkProfileAnswerRows } from "@/lib/benchmark-profile-answers";
import { benchmarkToPlanComparisonScenario } from "@/lib/benchmark-plan-input";
import {
  enumerateChecklistItems,
  getBenchmarkWorkbookContent,
} from "@/lib/benchmark-workbook-content";
import { formatUsd } from "@/lib/educational-benchmark-report";
import { BENCHMARK_TOOL_DISCLAIMER } from "@/lib/medicare-disclaimers";
import {
  BENCHMARK_REPORT_PAGE_SUBTITLE,
  BENCHMARK_TAB_INPUT,
  BENCHMARK_TAB_LOCAL,
  BENCHMARK_TAB_POSSIBLE_PLANS,
  BENCHMARK_TAB_PREPARE,
  BENCHMARK_TAB_PBO_LOCAL,
  BENCHMARK_WORKBOOK_SECTION_TITLE,
  BENCHMARK_TOOL_ID_LABEL,
  PBO_BLUEPRINT_SECTION_TITLE,
} from "@/lib/plan-comparison-copy";
import { PUBLIC_WEBSITE_HOST } from "@/lib/site-url";
import { potentialTop3PlanDetails, rankedPlanDetails } from "@/lib/plan-details";
import {
  buildScenarioFitReasons,
  buildTopPlanHighlights,
  buildWhyTopPlanOverRunnersUp,
} from "@/lib/plan-comparison-rationale";
import { renderSheet, type StyledRow } from "@/lib/scenario-xlsx";
import type { WorkbookFormState } from "@/lib/workbook-form-state";
import type { BenchmarkWorkbookWritingSection } from "@/lib/benchmark-workbook-content";

export type BenchmarkReportXlsxOptions = {
  workbookFormState?: WorkbookFormState | null;
};

function lineValue(lines: Record<string, string>, key: string): string {
  return lines[key]?.trim() ?? "";
}

function formatWritingSectionLines(
  section: BenchmarkWorkbookWritingSection,
  lines: Record<string, string>,
): string[] {
  const output: string[] = [];
  if (section.variant === "drug-table") {
    for (let index = 0; index < section.lines; index += 1) {
      const drug = lineValue(lines, `${section.id}:drug-${index}`);
      const dose = lineValue(lines, `${section.id}:dose-${index}`);
      if (!drug && !dose) continue;
      output.push(dose ? `${drug} — ${dose}` : drug);
    }
    return output;
  }

  for (let index = 0; index < section.lines; index += 1) {
    const value = lineValue(lines, `${section.id}:line-${index}`);
    if (value) output.push(value);
  }
  return output;
}

function formatLocation(benchmark: FinalizedBenchmark): string {
  const { report } = benchmark;
  if (report.selectedCounty) {
    return `ZIP prefix ${report.zip3}xx · ${report.selectedCounty.county}, ${report.selectedCounty.stateCode}`;
  }
  if (report.counties.length > 0) {
    return `ZIP prefix ${report.zip3}xx · ${report.counties.map((c) => `${c.county}, ${c.stateCode}`).join(" · ")}`;
  }
  return `ZIP prefix ${report.zip3}xx`;
}

export function benchmarkReportXlsxFilename(estimateId: string): string {
  const safe = estimateId.replace(/[^\w-]+/g, "");
  return `Part-B-Benchmark-Report-${safe || "report"}.xlsx`;
}

export function buildBenchmarkReportWorkbook(
  benchmark: FinalizedBenchmark,
  options?: BenchmarkReportXlsxOptions,
): ExcelJS.Workbook {
  const { estimateId, report, intake } = benchmark;
  const workbook = getBenchmarkWorkbookContent();
  const formState = options?.workbookFormState ?? { checked: {}, lines: {} };
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Benchmark Report", { views: [{ showGridLines: false }] });
  const span = 4;
  const rows: StyledRow[] = [
    { kind: "title", text: BENCHMARK_REPORT_PAGE_SUBTITLE, span },
    {
      kind: "subtitle",
      span,
      text: `${PUBLIC_WEBSITE_HOST} · ${BENCHMARK_TOOL_ID_LABEL}: ${estimateId} · ${formatLocation(benchmark)}`,
    },
    {
      kind: "callout",
      span,
      text: "This report summarizes federal baselines and generalized regional frameworks from your inputs. It is not a plan recommendation or enrollment offer.",
      height: 36,
    },
    { kind: "blank" },
    { kind: "section", text: `1. ${BENCHMARK_TAB_INPUT}`, span },
  ];

  const profileRows = buildBenchmarkProfileAnswerRows(intake);
  if (profileRows.length > 0) {
    rows.push({ kind: "section", text: "Your answers", span: 2 });
    profileRows.forEach((row) => {
      rows.push({ kind: "kv", key: row.label, value: row.value });
    });
    rows.push({ kind: "blank" });
  }

  rows.push(
    { kind: "kv", key: "Prescription tier summary", value: report.prescriptionTierSummary },
    { kind: "kv", key: "Utilization context", value: report.utilizationContext },
    {
      kind: "kv",
      key: "Ancillary needs",
      value:
        report.ancillaryNeeds.selected.length > 0
          ? `${report.ancillaryNeeds.selected.join("; ")}. ${report.ancillaryNeeds.note}`
          : report.ancillaryNeeds.note,
    },
  );
  if (report.hasPreferredPharmacy && report.preferredPharmacyName) {
    rows.push({
      kind: "kv",
      key: "Preferred pharmacy",
      value: `${report.preferredPharmacyName}. Pharmacy network and formulary rules vary by Part D or Medicare Advantage contract.`,
    });
  }
  rows.push({ kind: "blank" });

  const { partBBase, localBenchmarks } = report;
  const { medicareAdvantage: ma, partD: pd } = localBenchmarks;
  rows.push(
    { kind: "section", text: `2. ${BENCHMARK_TAB_PBO_LOCAL}`, span },
    { kind: "section", text: PBO_BLUEPRINT_SECTION_TITLE, span },
    {
      kind: "note",
      span,
      text: `${report.partBBase.source}. These figures apply nationwide before any private supplemental or Advantage framework.`,
    },
    {
      kind: "kv",
      key: "Standard Part B monthly premium",
      value: `${formatUsd(partBBase.standardMonthlyPremium)}/month`,
    },
    {
      kind: "kv",
      key: "Annual Part B deductible",
      value: formatUsd(partBBase.annualDeductible, 0),
    },
    { kind: "kv", key: "Income band (annually)", value: report.incomeBand },
    { kind: "kv", key: "Income band note", value: report.incomeBandNote },
    {
      kind: "note",
      span,
      text: "Co-insurance: After meeting the annual deductible, standard Original Medicare generally covers 80% of Medicare-approved medical costs. You remain responsible for the remaining 20% co-insurance, which is not capped under Original Medicare alone.",
    },
    { kind: "blank" },
    { kind: "section", text: BENCHMARK_TAB_LOCAL, span },
    {
      kind: "note",
      span,
      text: `Regional cost ranges for private-market frameworks near ZIP prefix ${report.zip3}xx, derived from ${report.catalogRevision}. These are educational estimates — not live quotes, carrier offers, or policy selections.`,
    },
    { kind: "kv", key: ma.label, value: "" },
    {
      kind: "kv",
      key: "Typical premium bracket (MA)",
      value: `${formatUsd(ma.premiumRangeMonthly.low, 0)} – ${formatUsd(ma.premiumRangeMonthly.high, 0)}/month`,
    },
    {
      kind: "kv",
      key: "Common regional MOOP averages",
      value: `${formatUsd(ma.moopRangeAnnual.low, 0)} – ${formatUsd(ma.moopRangeAnnual.high, 0)}/year`,
    },
    { kind: "note", span, text: `${ma.moopSourceNote} ${ma.source}` },
    { kind: "kv", key: pd.label, value: "" },
    {
      kind: "kv",
      key: "Typical premium bracket (Part D)",
      value: `${formatUsd(pd.premiumRangeMonthly.low, 0)} – ${formatUsd(pd.premiumRangeMonthly.high, 0)}/month`,
    },
    {
      kind: "kv",
      key: `Federal statutory out-of-pocket cap (${partBBase.year})`,
      value: `${formatUsd(pd.federalOopCap, 0)}/year`,
    },
    { kind: "note", span, text: pd.source },
  );

  if (localBenchmarks.medigap) {
    rows.push(
      { kind: "kv", key: localBenchmarks.medigap.label, value: "" },
      {
        kind: "kv",
        key: "Typical premium bracket (Medigap)",
        value: `${formatUsd(localBenchmarks.medigap.premiumRangeMonthly.low, 0)} – ${formatUsd(localBenchmarks.medigap.premiumRangeMonthly.high, 0)}/month`,
      },
      { kind: "note", span, text: localBenchmarks.medigap.source },
    );
  }
  rows.push({ kind: "blank" });

  const planScenario = benchmarkToPlanComparisonScenario(intake, report);
  const rankedPlans = rankedPlanDetails({
    year: planScenario.year,
    zip3: planScenario.zip3,
    county: planScenario.county,
    medications: planScenario.medications,
  });
  const top3Plans = potentialTop3PlanDetails({
    year: planScenario.year,
    zip3: planScenario.zip3,
    county: planScenario.county,
    medications: planScenario.medications,
  });

  if (rankedPlans.length > 0) {
    const topPlan = top3Plans[0] ?? rankedPlans[0]!;
    const runnersUp = top3Plans.length > 1 ? top3Plans.slice(1, 3) : rankedPlans.slice(1, 3);
    const whyBullets = [
      ...buildTopPlanHighlights(topPlan, planScenario.medications.length),
      ...buildScenarioFitReasons(planScenario),
      ...buildWhyTopPlanOverRunnersUp(topPlan, runnersUp, planScenario),
    ];

    rows.push({ kind: "section", text: `3. ${BENCHMARK_TAB_POSSIBLE_PLANS}`, span });
    rows.push({
      kind: "kv",
      key: "Recommended plan (#1)",
      value: `${topPlan.carrier} — ${topPlan.plan} (${topPlan.planType}, ${topPlan.network}). Estimated ${formatUsd(topPlan.monthly, 0)}/month · ${formatUsd(topPlan.annual, 0)}/year including drugs.`,
    });
    rows.push({ kind: "section", text: "#1 plan highlights", span });
    whyBullets.forEach((bullet) => {
      rows.push({ kind: "note", span, text: `• ${bullet}` });
    });

    if (runnersUp.length > 0) {
      rows.push({ kind: "section", text: "Potential top 3", span });
      runnersUp.forEach((plan, index) => {
        rows.push({
          kind: "note",
          span,
          text: `#${index + 2} ${plan.carrier} — ${plan.plan} (${plan.planType}). ${formatUsd(plan.monthly, 0)}/month · ${formatUsd(plan.annual, 0)}/year.`,
        });
      });
    }

    rows.push({ kind: "blank" });
    rows.push({
      kind: "tableHeader",
      cells: ["Rank", "Carrier", "Plan", "Type", "Monthly", "Annual est."],
    });
    rankedPlans.forEach((plan, index) => {
      rows.push({
        kind: "tableRow",
        alt: index % 2 === 1,
        cells: [
          `#${plan.rank}`,
          plan.carrier,
          plan.plan,
          plan.planType,
          `${formatUsd(plan.monthly, 0)}/mo`,
          formatUsd(plan.annual, 0),
        ],
      });
    });
    rows.push({ kind: "blank" });
  }

  const prepareSectionNumber = rankedPlans.length > 0 ? 4 : 3;
  rows.push(
    { kind: "section", text: `${prepareSectionNumber}. ${BENCHMARK_TAB_PREPARE}`, span },
    { kind: "section", text: BENCHMARK_WORKBOOK_SECTION_TITLE, span },
    { kind: "note", span, text: workbook.excerpt },
    { kind: "blank" },
  );

  for (const section of workbook.checklistSections) {
    rows.push({ kind: "section", text: section.title, span });
    for (const entry of enumerateChecklistItems(workbook).filter(
      (item) => item.sectionId === section.id,
    )) {
      const checked = formState.checked[`${entry.sectionId}:${entry.itemIndex}`] ?? false;
      rows.push({
        kind: "kv",
        key: `${checked ? "[x]" : "[ ]"} ${entry.globalNumber}.`,
        value: entry.item,
      });
    }

    if (section.id === "workbook-agent-questions") {
      const notes = formatWritingSectionLines(
        {
          id: `${section.id}:notes`,
          title: "Your notes",
          hint: "",
          lines: 3,
        },
        formState.lines,
      );
      if (notes.length > 0) {
        rows.push({ kind: "section", text: "Your notes", span });
        notes.forEach((note) => rows.push({ kind: "note", span, text: `• ${note}` }));
      }
    }
    rows.push({ kind: "blank" });
  }

  for (const section of workbook.writingSections) {
    const entries = formatWritingSectionLines(section, formState.lines);
    rows.push({ kind: "section", text: section.title, span });
    rows.push({ kind: "note", span, text: section.hint });
    if (entries.length > 0) {
      entries.forEach((entry) => rows.push({ kind: "note", span, text: `• ${entry}` }));
    } else {
      rows.push({ kind: "note", span, text: "(No entries yet)" });
    }
    rows.push({ kind: "blank" });
  }

  rows.push(
    { kind: "note", span, text: workbook.disclaimer },
    {
      kind: "note",
      span,
      text: "This communication is for educational purposes only. It does not constitute personalized enrollment advice or a carrier plan catalog.",
    },
    { kind: "note", span, text: BENCHMARK_TOOL_DISCLAIMER },
  );

  renderSheet(ws, rows, [28, 52, 22, 22]);
  return wb;
}

/** Open the benchmark report Excel file in a new tab so the user can save from Excel. */
export async function openBenchmarkReportXlsxInNewTab(
  benchmark: FinalizedBenchmark,
  options?: BenchmarkReportXlsxOptions,
): Promise<void> {
  const tab = prepareXlsxPreviewTab();
  try {
    const wb = buildBenchmarkReportWorkbook(benchmark, options);
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    openXlsxBlobInTab(tab, blob, {
      fallbackFilename: benchmarkReportXlsxFilename(benchmark.estimateId),
    });
  } catch (err) {
    tab?.close();
    throw err;
  }
}

/** @deprecated Use {@link openBenchmarkReportXlsxInNewTab} */
export const downloadBenchmarkReportXlsx = openBenchmarkReportXlsxInNewTab;
