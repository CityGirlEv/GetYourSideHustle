import { describe, expect, it } from "vitest";
import {
  buildBenchmarkMobileScenarioSteps,
  buildBenchmarkReportSectionSteps,
} from "@/lib/benchmark-mobile-qa-steps";
import {
  BENCHMARK_MOBILE_SCENARIO_BASE_IDS,
  BENCHMARK_MOBILE_SCENARIO_TESTS,
} from "@/lib/benchmark-mobile-scenario-tests";
import { TEST_CASES } from "@/lib/test-plan";
import { isIncomeBand } from "@/lib/income-bands";

const MOBILE_PLATFORM_SUFFIXES = ["MOBILE", "IPHONE", "IPAD"] as const;

describe("benchmark-mobile-scenario-tests", () => {
  it("fans out each scenario to Mobile, iPhone, and iPad", () => {
    expect(BENCHMARK_MOBILE_SCENARIO_TESTS).toHaveLength(
      BENCHMARK_MOBILE_SCENARIO_BASE_IDS.length * MOBILE_PLATFORM_SUFFIXES.length,
    );
  });

  it("assigns all mobile scenario variants to Unassigned", () => {
    for (const test of BENCHMARK_MOBILE_SCENARIO_TESTS) {
      expect(test.assignee).toBe("Unassigned");
    }
  });

  it("uses BM-026 through BM-030 platform suffix ids", () => {
    for (const baseId of BENCHMARK_MOBILE_SCENARIO_BASE_IDS) {
      for (const suffix of MOBILE_PLATFORM_SUFFIXES) {
        expect(BENCHMARK_MOBILE_SCENARIO_TESTS.some((t) => t.id === `${baseId}-${suffix}`)).toBe(
          true,
        );
      }
    }
  });

  it("includes varied ZIP3 scenarios (705, 802, 770, 606, 331)", () => {
    const ids = BENCHMARK_MOBILE_SCENARIO_TESTS.map((t) => t.id);
    expect(ids).toContain("BM-026-IPHONE");
    expect(ids).toContain("BM-027-MOBILE");
    expect(ids).toContain("BM-028-IPAD");
    expect(ids).toContain("BM-029-IPHONE");
    expect(ids).toContain("BM-030-MOBILE");
  });

  it("registers unique ids in TEST_CASES", () => {
    const mobileIds = BENCHMARK_MOBILE_SCENARIO_TESTS.map((t) => t.id);
    const allIds = TEST_CASES.map((t) => t.id);
    for (const id of mobileIds) {
      expect(allIds.filter((x) => x === id)).toHaveLength(1);
    }
  });
});

describe("buildBenchmarkMobileScenarioSteps", () => {
  it("covers all five wizard steps and four report sections", () => {
    const steps = buildBenchmarkMobileScenarioSteps({
      birthYear: "1960",
      gender: "Male",
      tobacco: "Non-smoker",
      zip3: "705",
      countyLine: "select Evangeline Parish, LA",
      medicareEnrolled: "Part B",
      incomeBand: "$55k–$75k",
      conditions: "Hypertension",
      medications: "Lisinopril 10 mg tablet (daily)",
      visitFrequency: "Medium (3–5 times)",
      preferredPharmacy: "No",
      benefitPriorities: "Dental Coverage",
    });
    const joined = steps.join(" ");
    expect(joined).toMatch(/Step 1/);
    expect(joined).toMatch(/Step 2/);
    expect(joined).toMatch(/Step 3/);
    expect(joined).toMatch(/Step 4/);
    expect(joined).toMatch(/Step 5/);
    expect(joined).toMatch(/My Input/);
    expect(joined).toMatch(/Potential Options/);
    expect(joined).toMatch(/Blueprint & Benchmarks/);
    expect(joined).toMatch(/Turning 65 Workbook/);
    expect(joined).toMatch(/Save my answers/);
  });

  it("uses wizard-selectable income bands", () => {
    const steps = buildBenchmarkMobileScenarioSteps({
      birthYear: "1960",
      gender: "Male",
      tobacco: "Non-smoker",
      zip3: "802",
      countyLine: "select Denver, CO",
      medicareEnrolled: "Unsure",
      incomeBand: "$55k–$75k",
      conditions: "None",
      medications: "",
      visitFrequency: "Low (1–2 times)",
      preferredPharmacy: "No",
      benefitPriorities: "",
    });
    const incomeStep = steps.find((s) => /income band =/i.test(s));
    expect(incomeStep).toBeTruthy();
    const band = incomeStep!.match(/income band = (.+)/i)?.[1];
    expect(band).toBeTruthy();
    expect(isIncomeBand(band!)).toBe(true);
  });

  it("includes county report steps when requested", () => {
    const steps = buildBenchmarkReportSectionSteps({ includeCountyReport: true, zip3: "705" });
    expect(steps.join(" ")).toMatch(/County report/);
    expect(steps.join(" ")).toMatch(/Filters hamburger/);
  });
});
