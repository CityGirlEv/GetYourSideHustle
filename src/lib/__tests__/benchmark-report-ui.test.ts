import { describe, expect, it } from "vitest";
import { buildEducationalBenchmarkReport } from "@/lib/educational-benchmark-report";
import {
  BENCHMARK_REPORT_DESKTOP_FILTER_CLASS,
  BENCHMARK_REPORT_LOCATION_SEPARATOR,
  BENCHMARK_REPORT_STICKY_SCROLL_MT,
  PLAN_RESULTS_TABS_STICKY_BASE,
  formatBenchmarkReportZipLineText,
} from "@/lib/benchmark-report-ui";

function sampleReport(overrides: { zip3?: string; county?: string } = {}) {
  return buildEducationalBenchmarkReport({
    birthYear: 1960,
    gender: "female",
    tobacco: false,
    zip3: overrides.zip3 ?? "302",
    county: overrides.county ?? "Fayette",
    medicareEnrolled: "none",
    eligibilityCircumstance: "turning_65",
    incomeBand: "$55k–$75k",
    conditions: [],
    medications: [],
    medicationDetails: [],
    visitFrequency: "medium",
    preferredPharmacy: "no",
    preferredPharmacyName: "",
    benefitPriorities: [],
  });
}

describe("formatBenchmarkReportZipLineText", () => {
  it("uses a Unicode middle dot between ZIP prefix and county", () => {
    const text = formatBenchmarkReportZipLineText(sampleReport());

    expect(text).toBe(`ZIP 302xx${BENCHMARK_REPORT_LOCATION_SEPARATOR}Fayette, GA`);
    expect(text).not.toMatch(/Ã|Â·/);
  });

  it("joins multiple counties with middle dots", () => {
    const text = formatBenchmarkReportZipLineText(sampleReport({ zip3: "770", county: "" }));

    expect(text).toMatch(/^ZIP 770xx · .+, TX$/);
    expect(text).not.toMatch(/Ã|Â·/);
  });
});

describe("mobile filter layout classes", () => {
  it("hides desktop filter bubbles below md breakpoint", () => {
    expect(BENCHMARK_REPORT_DESKTOP_FILTER_CLASS).toContain("hidden");
    expect(BENCHMARK_REPORT_DESKTOP_FILTER_CLASS).toContain("md:block");
  });

  it("limits sticky plan-results tabs to md+", () => {
    expect(PLAN_RESULTS_TABS_STICKY_BASE).toContain("md:sticky");
    expect(PLAN_RESULTS_TABS_STICKY_BASE).not.toMatch(/(?:^|\s)sticky(?:\s|$)/);
  });

  it("uses a shorter scroll margin on phone", () => {
    expect(BENCHMARK_REPORT_STICKY_SCROLL_MT).toContain("scroll-mt-36");
    expect(BENCHMARK_REPORT_STICKY_SCROLL_MT).toContain("md:scroll-mt-56");
  });
});
