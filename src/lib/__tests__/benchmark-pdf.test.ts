import { describe, expect, it } from "vitest";
import { finalizeBenchmarkIntake } from "@/lib/benchmark-intake";
import { buildBenchmarkReportPdf } from "@/lib/benchmark-pdf";
import { getBenchmarkWorkbookContent } from "@/lib/benchmark-workbook-content";
import { BENCHMARK_TOOL_DISCLAIMER } from "@/lib/medicare-disclaimers";
import {
  BENCHMARK_REPORT_PAGE_SUBTITLE,
  BENCHMARK_TAB_INPUT,
  BENCHMARK_TAB_POSSIBLE_PLANS,
  BENCHMARK_TAB_PREPARE,
  BENCHMARK_TAB_PBO_LOCAL,
  BENCHMARK_TOOL_NAME,
} from "@/lib/plan-comparison-copy";
import { PUBLIC_WEBSITE_HOST } from "@/lib/site-url";
import { emptyWorkbookFormState } from "@/lib/workbook-form-state";

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

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

function pdfLatin1(doc: ReturnType<typeof buildBenchmarkReportPdf>): string {
  const bytes = doc.output("arraybuffer");
  return new TextDecoder("latin1").decode(new Uint8Array(bytes));
}

describe("benchmark-pdf", () => {
  it("builds a branded PDF with all report tab sections, header, and footer", () => {
    const benchmark = sampleBenchmark();
    const workbook = getBenchmarkWorkbookContent();
    const formState = emptyWorkbookFormState(workbook);
    formState.checked["workbook-before-compare:0"] = true;
    formState.lines["workbook-agent-questions:notes:line-0"] = "Ask about Part B timing";

    const doc = buildBenchmarkReportPdf(benchmark, TINY_PNG, formState, TINY_PNG);
    const blobText = pdfLatin1(doc);

    expect(doc.output("arraybuffer").byteLength).toBeGreaterThan(2000);
    expect(blobText).toContain("/Subtype /Image");
    expect(blobText).toContain(BENCHMARK_REPORT_PAGE_SUBTITLE);
    expect(blobText).toContain(BENCHMARK_TOOL_NAME);
    expect(blobText).toContain(benchmark.estimateId);
    expect(blobText).toContain(PUBLIC_WEBSITE_HOST);
    expect(blobText).toContain(BENCHMARK_TOOL_DISCLAIMER.slice(0, 40));
    expect(blobText).toContain(BENCHMARK_TAB_INPUT);
    expect(blobText).toContain(BENCHMARK_TAB_PBO_LOCAL);
    expect(blobText).toContain(BENCHMARK_TAB_POSSIBLE_PLANS);
    expect(blobText).toContain(BENCHMARK_TAB_PREPARE);
    expect(blobText).toContain("Before you compare plans");
    expect(blobText).toContain("Year of birth");
    expect(blobText).toContain("Top 10 rankings");
    expect(blobText).toContain("Ask about Part B timing");
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
  });
});
