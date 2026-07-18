import { describe, expect, it } from "vitest";
import {
  benchmarkEstimateCreatedPath,
  benchmarkEstimateReportPath,
  isBenchmarkEstimateId,
} from "@/lib/benchmark-id";
import { finalizeBenchmarkIntake } from "@/lib/benchmark-intake";
import { loadBenchmarkEstimate, saveBenchmarkEstimate } from "@/lib/benchmark-estimate-storage";

describe("benchmark-id", () => {
  it("detects BM- estimate IDs", () => {
    expect(isBenchmarkEstimateId("BM-ABC-1234")).toBe(true);
    expect(isBenchmarkEstimateId("SCN-2026-ABCD-EFGH")).toBe(false);
  });

  it("builds stable report paths", () => {
    expect(benchmarkEstimateReportPath("BM-TEST")).toBe("/scenario/estimate/BM-TEST");
    expect(benchmarkEstimateCreatedPath("BM-TEST")).toBe("/scenario/estimate-created/BM-TEST");
  });
});

describe("benchmark-estimate-storage", () => {
  it("round-trips a finalized benchmark in sessionStorage", () => {
    const benchmark = finalizeBenchmarkIntake({
      birthYear: 1960,
      gender: "male",
      tobacco: true,
      zip3: "303",
      county: "Cobb",
      medicareEnrolled: "part_a",
      eligibilityCircumstance: "special_circumstance",
      incomeBand: "$75k–$95k",
      conditions: [],
      medications: [],
      medicationDetails: [],
      visitFrequency: "low",
      preferredPharmacy: "no",
      preferredPharmacyName: "",
      benefitPriorities: [],
    });

    saveBenchmarkEstimate(benchmark);
    const loaded = loadBenchmarkEstimate(benchmark.estimateId);
    expect(loaded?.estimateId).toBe(benchmark.estimateId);
    expect(loaded?.report.zip3).toBe("303");
  });
});
