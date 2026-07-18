import { describe, expect, it } from "vitest";
import { BENCHMARK_REPORT_UX_TESTS } from "@/lib/benchmark-report-ux-tests";
import {
  BENCHMARK_NEW_INPUT_HINT,
  BENCHMARK_RUN_UPDATED_SCENARIO,
  BENCHMARK_TAB_INPUT,
} from "@/lib/plan-comparison-copy";
import { planChoiceRankSuffix } from "@/lib/plan-filters";
import {
  benchmarkAwaitPlansKey,
  consumeBenchmarkAwaitingPlans,
  markBenchmarkAwaitingPlans,
} from "@/lib/benchmark-optin-trigger";

describe("BENCHMARK_NEW_INPUT_HINT", () => {
  it("names the My Input tab and Run New Report action", () => {
    expect(BENCHMARK_NEW_INPUT_HINT).toContain(BENCHMARK_TAB_INPUT);
    expect(BENCHMARK_NEW_INPUT_HINT).toContain(BENCHMARK_RUN_UPDATED_SCENARIO);
    expect(BENCHMARK_NEW_INPUT_HINT).toContain("update the form");
    expect(BENCHMARK_NEW_INPUT_HINT).toMatch(/and click Run New Report\.$/);
  });
});

describe("planChoiceRankSuffix", () => {
  it('formats runners-up as "of 3" for PlanChoiceCard', () => {
    expect(planChoiceRankSuffix()).toBe("of 3");
    expect(planChoiceRankSuffix(5)).toBe("of 5");
  });
});

describe("benchmark await-plans flag", () => {
  it("marks and consumes once per new report navigation", () => {
    sessionStorage.clear();
    markBenchmarkAwaitingPlans("BM-TEST");
    expect(sessionStorage.getItem(benchmarkAwaitPlansKey("BM-TEST"))).toBe("1");
    expect(consumeBenchmarkAwaitingPlans("BM-TEST")).toBe(true);
    expect(consumeBenchmarkAwaitingPlans("BM-TEST")).toBe(false);
  });
});

describe("benchmark-report-ux-tests", () => {
  it("assigns all UX cases to Lyriq", () => {
    expect(BENCHMARK_REPORT_UX_TESTS.length).toBeGreaterThanOrEqual(4);
    for (const test of BENCHMARK_REPORT_UX_TESTS) {
      expect(test.assignee).toBe("Lyriq");
    }
  });

  it("covers hint, rank labels, hourglass, and CMS disclaimer", () => {
    const ids = BENCHMARK_REPORT_UX_TESTS.map((t) => t.id);
    expect(ids).toEqual(["BM-022", "BM-023", "BM-024", "BM-025"]);
  });
});
