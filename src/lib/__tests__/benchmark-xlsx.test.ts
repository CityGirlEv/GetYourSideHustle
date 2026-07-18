import { describe, expect, it } from "vitest";
import { finalizeBenchmarkIntake } from "@/lib/benchmark-intake";
import {
  benchmarkInputTabCount,
  benchmarkPboLocalTabCount,
  benchmarkWorkbookTabCount,
} from "@/lib/benchmark-report-tab-counts";
import {
  benchmarkReportXlsxFilename,
  buildBenchmarkReportWorkbook,
} from "@/lib/benchmark-xlsx";
import {
  enumerateChecklistItems,
  getBenchmarkWorkbookContent,
  totalChecklistItemCount,
} from "@/lib/benchmark-workbook-content";
import {
  BENCHMARK_TAB_INPUT,
  BENCHMARK_TAB_POSSIBLE_PLANS,
  BENCHMARK_TAB_PREPARE,
  BENCHMARK_TAB_PBO_LOCAL,
} from "@/lib/plan-comparison-copy";

function sampleBenchmark() {
  return finalizeBenchmarkIntake({
    birthYear: 1960,
    gender: "female",
    tobacco: false,
    zip3: "770",
    county: "Harris",
    medicareEnrolled: "none",
    eligibilityCircumstance: "turning_65",
    eligibilityCircumstanceOther: "",
    incomeBand: "$55k–$75k",
    conditions: ["Hypertension"],
    medications: ["Lisinopril"],
    medicationDetails: [],
    visitFrequency: "medium",
    preferredPharmacy: "no",
    preferredPharmacyName: "",
    benefitPriorities: ["fitness"],
  });
}

describe("benchmark-xlsx", () => {
  it("names the benchmark report xlsx download like the pdf filename", () => {
    expect(benchmarkReportXlsxFilename("BM-ABC123")).toBe("Part-B-Benchmark-Report-BM-ABC123.xlsx");
    expect(benchmarkReportXlsxFilename("BM-ABC123")).toMatch(
      /^Part-B-Benchmark-Report-[\w-]+\.xlsx$/,
    );
  });

  it("builds a workbook with benchmark report sections", async () => {
    const benchmark = sampleBenchmark();
    const workbook = getBenchmarkWorkbookContent();
    const wb = buildBenchmarkReportWorkbook(benchmark, {
      workbookFormState: {
        checked: { "workbook-before-compare:0": true },
        lines: { "workbook-agent-questions:notes:line-0": "Ask about Part B timing" },
      },
    });

    expect(wb.worksheets).toHaveLength(1);
    const sheet = wb.worksheets[0]!;
    expect(sheet.name).toBe("Benchmark Report");
    expect(sheet.rowCount).toBeGreaterThan(20);

    const cellTexts = sheet
      .getSheetValues()
      .flat()
      .filter((value): value is string => typeof value === "string");

    expect(cellTexts.some((text) => text.includes(BENCHMARK_TAB_INPUT))).toBe(true);
    expect(cellTexts.some((text) => text.includes(BENCHMARK_TAB_PBO_LOCAL))).toBe(true);
    expect(cellTexts.some((text) => text.includes(BENCHMARK_TAB_POSSIBLE_PLANS))).toBe(true);
    expect(cellTexts.some((text) => text.includes(BENCHMARK_TAB_PREPARE))).toBe(true);
    expect(cellTexts.some((text) => text.includes("Rank"))).toBe(true);
    expect(cellTexts.some((text) => text.includes(workbook.checklistSections[0]!.title))).toBe(true);
    expect(cellTexts.some((text) => text.includes("1.") && text.includes("[x]"))).toBe(true);
    expect(cellTexts.some((text) => text.includes("Ask about Part B timing"))).toBe(true);

    const buffer = await wb.xlsx.writeBuffer();
    expect(buffer.byteLength).toBeGreaterThan(2000);
  });
});

describe("benchmark workbook checklist numbering helpers", () => {
  it("counts checklist items across all sections", () => {
    const workbook = getBenchmarkWorkbookContent();
    const sectionTotals = workbook.checklistSections.reduce(
      (sum, section) => sum + section.items.length,
      0,
    );
    expect(totalChecklistItemCount(workbook)).toBe(sectionTotals);
    expect(totalChecklistItemCount(workbook)).toBeGreaterThan(0);
  });

  it("assigns continuous global numbers across sections", () => {
    const workbook = getBenchmarkWorkbookContent();
    const items = enumerateChecklistItems(workbook);

    expect(items[0]?.globalNumber).toBe(1);
    expect(items.at(-1)?.globalNumber).toBe(totalChecklistItemCount(workbook));

    const sectionTwoStart =
      workbook.checklistSections[0]!.items.length + workbook.checklistSections[1]!.items.length;
    const firstOfficialSource = items.find((item) => item.sectionId === "workbook-official-sources");
    expect(firstOfficialSource?.globalNumber).toBe(sectionTwoStart + 1);
  });
});

describe("benchmark-report-tab-counts", () => {
  it("derives tab counts from intake, report, and workbook content", () => {
    const benchmark = sampleBenchmark();

    expect(benchmarkInputTabCount(benchmark.intake)).toBeGreaterThan(0);
    expect(benchmarkPboLocalTabCount(benchmark.report)).toBeGreaterThanOrEqual(3);
    expect(benchmarkWorkbookTabCount()).toBe(
      totalChecklistItemCount() + getBenchmarkWorkbookContent().writingSections.length,
    );
  });
});
