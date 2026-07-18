import { describe, expect, it } from "vitest";
import {
  BENCHMARK_REPORT_LAYOUT_BASE_IDS,
  BENCHMARK_REPORT_LAYOUT_TESTS,
} from "@/lib/benchmark-report-layout-tests";

const LAYOUT_PLATFORM_SUFFIXES = ["COMP", "PHONE", "IPAD"] as const;

describe("benchmark-report-layout-tests", () => {
  it("fans out each layout case to Computer, Phone, and iPad", () => {
    expect(BENCHMARK_REPORT_LAYOUT_TESTS).toHaveLength(
      BENCHMARK_REPORT_LAYOUT_BASE_IDS.length * LAYOUT_PLATFORM_SUFFIXES.length,
    );
  });

  it("assigns all layout variants to Lyriq", () => {
    for (const test of BENCHMARK_REPORT_LAYOUT_TESTS) {
      expect(test.assignee).toBe("Lyriq");
    }
  });

  it("uses BM-010 through BM-021 platform suffix ids", () => {
    for (const baseId of BENCHMARK_REPORT_LAYOUT_BASE_IDS) {
      for (const suffix of LAYOUT_PLATFORM_SUFFIXES) {
        expect(BENCHMARK_REPORT_LAYOUT_TESTS.some((t) => t.id === `${baseId}-${suffix}`)).toBe(true);
      }
    }
  });

  it("includes spot-check and responsive coverage", () => {
    const ids = BENCHMARK_REPORT_LAYOUT_TESTS.map((t) => t.id);
    expect(ids).toContain("BM-017-COMP");
    expect(ids).toContain("BM-018-PHONE");
    expect(ids).toContain("BM-019-IPAD");
    expect(ids).toContain("BM-021-PHONE");
  });
});
