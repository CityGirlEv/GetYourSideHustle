import { describe, expect, it } from "vitest";
import {
  buildRegionalBenchmarksFromZip3,
  currentMedicarePlanYear,
} from "@/lib/benchmark-regional-data";
import { GUIDELINES } from "@/lib/medicare-math";
import { partDPremiumByZip3 } from "@/lib/medicare-math";
import {
  buildEducationalBenchmarkReport,
  buildIncomeBandNote,
  buildPrescriptionTierSummary,
  buildUtilizationContext,
  buildAncillaryNeedsBreakdown,
} from "@/lib/educational-benchmark-report";
import {
  benchmarkIntakeInputsEqual,
  benchmarkIntakeLocationChanged,
} from "@/lib/benchmark-intake";
import type { BenchmarkIntakeInput } from "@/lib/benchmark-intake";
import {
  __clearCmsLandscapeForTests,
  __hydrateCmsLandscapeForTests,
} from "@/lib/cms-landscape";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const vitestRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const cmsYear = "2026";

function restoreCmsLandscapeForTests(): void {
  __hydrateCmsLandscapeForTests({
    plans: JSON.parse(
      readFileSync(join(vitestRoot, "data/cms-landscape", cmsYear, "plans.json"), "utf8"),
    ),
    countyIndex: JSON.parse(
      readFileSync(join(vitestRoot, "data/cms-landscape", cmsYear, "county-index.json"), "utf8"),
    ),
  });
}

describe("benchmark-regional-data", () => {
  it("derives Part B figures from CMS guidelines for the active plan year", () => {
    const year = currentMedicarePlanYear();
    const regional = buildRegionalBenchmarksFromZip3("770", year);
    const g = GUIDELINES[year];

    expect(regional.partBBase.standardMonthlyPremium).toBe(g.partBPremiumMonthly);
    expect(regional.partBBase.annualDeductible).toBe(g.partBDeductible);
    expect(regional.localBenchmarks.partD.federalOopCap).toBe(g.partDOOPCap);
  });

  it("varies Part D premium bracket by ZIP prefix", () => {
    const year = 2026;
    const houston = buildRegionalBenchmarksFromZip3("770", year);
    const nyc = buildRegionalBenchmarksFromZip3("100", year);

    expect(houston.localBenchmarks.partD.premiumRangeMonthly.low).not.toBe(
      nyc.localBenchmarks.partD.premiumRangeMonthly.low,
    );
    expect(houston.localBenchmarks.partD.source).toContain("770");
    expect(houston.localBenchmarks.partD.source).toContain(
      partDPremiumByZip3("770").toString(),
    );
  });

  it("uses CMS MOOP limits instead of static MOOP constants", () => {
    const regional = buildRegionalBenchmarksFromZip3("303", 2026);
    expect(regional.localBenchmarks.medicareAdvantage.moopRangeAnnual).toEqual({
      low: GUIDELINES[2026].moopLow,
      high: GUIDELINES[2026].moopHigh,
    });
  });

  it("includes counties for a known ZIP3 prefix", () => {
    const regional = buildRegionalBenchmarksFromZip3("770", 2026);
    expect(regional.counties.length).toBeGreaterThan(0);
    expect(regional.counties[0]?.stateCode).toBeTruthy();
  });

  it("does not throw when CMS landscape is not loaded yet", () => {
    __clearCmsLandscapeForTests();
    try {
      expect(() => buildRegionalBenchmarksFromZip3("770", 2026)).not.toThrow();
      expect(() =>
        buildEducationalBenchmarkReport({
          birthYear: 1960,
          gender: "female",
          tobacco: false,
          zip3: "770",
          county: "Harris",
          medicareEnrolled: "both",
          eligibilityCircumstance: "turning_65",
          incomeBand: "$95k–$115k",
          conditions: [],
          medications: [],
          medicationDetails: [],
          visitFrequency: "medium",
          preferredPharmacy: "no",
          preferredPharmacyName: "",
          benefitPriorities: [],
        }),
      ).not.toThrow();
    } finally {
      restoreCmsLandscapeForTests();
    }
  });
});

describe("educational-benchmark-report", () => {
  it("builds a zip-derived report without static benchmark constants", () => {
    const report = buildEducationalBenchmarkReport({
      birthYear: 1960,
      gender: "female",
      tobacco: false,
      zip3: "770",
      county: "Harris",
      medicareEnrolled: "both",
      eligibilityCircumstance: "turning_65",
      incomeBand: "$95k–$115k",
      conditions: ["Type 2 Diabetes"],
      medications: ["Metformin", "Eliquis"],
      medicationDetails: [],
      visitFrequency: "high",
      preferredPharmacy: "yes",
      preferredPharmacyName: "CVS Pharmacy",
      benefitPriorities: ["dental", "vision"],
    });

    const expected = buildRegionalBenchmarksFromZip3("770", report.year);

    expect(report.partBBase.standardMonthlyPremium).toBe(
      expected.partBBase.standardMonthlyPremium,
    );
    expect(report.localBenchmarks.medicareAdvantage.premiumRangeMonthly).toEqual(
      expected.localBenchmarks.medicareAdvantage.premiumRangeMonthly,
    );
    expect(report.localBenchmarks.medicareAdvantage.moopRangeAnnual).toEqual(
      expected.localBenchmarks.medicareAdvantage.moopRangeAnnual,
    );
    expect(report.prescriptionTierSummary.toLowerCase()).toContain("formulary");
    expect(report.utilizationContext.toLowerCase()).toContain("hmo");
    expect(report.ancillaryNeeds.selected).toEqual(["Dental coverage", "Vision care"]);
    expect(report.selectedCounty).toEqual({ county: "Harris", stateCode: "TX" });
    expect(report.incomeBand).toBe("$95k–$115k");
    expect(report.incomeBandNote).toContain("IRMAA");
    expect(JSON.stringify(report)).not.toMatch(/humana|aetna|united/i);
  });

  it("summarizes empty medication list educationally", () => {
    const summary = buildPrescriptionTierSummary([]);
    expect(summary.toLowerCase()).toContain("original medicare");
  });

  it("maps visit frequency to utilization context", () => {
    expect(buildUtilizationContext("low").toLowerCase()).toContain("low");
    expect(buildUtilizationContext("high").toLowerCase()).toContain("high");
  });

  it("explains ancillary benefits are not in Original Medicare", () => {
    const { note } = buildAncillaryNeedsBreakdown(["otc"]);
    expect(note.toLowerCase()).toContain("original medicare");
  });

  it("builds income band notes for LIS and IRMAA bands", () => {
    expect(buildIncomeBandNote("Under $15k").toLowerCase()).toContain("extra help");
    expect(buildIncomeBandNote("Over $115k").toLowerCase()).toContain("irmaa");
    expect(buildIncomeBandNote("Prefer not to say").toLowerCase()).toContain("preferred not");
  });

  it("gates Save Report on non-location edits only", () => {
    const saved: BenchmarkIntakeInput = {
      birthYear: 1960,
      gender: "female",
      tobacco: false,
      zip3: "770",
      county: "Harris",
      medicareEnrolled: "both",
      eligibilityCircumstance: "turning_65",
      eligibilityCircumstanceOther: "",
      incomeBand: "$95k–$115k",
      conditions: ["Type 2 Diabetes"],
      medications: ["Metformin"],
      medicationDetails: [],
      visitFrequency: "medium",
      preferredPharmacy: "no",
      preferredPharmacyName: "",
      benefitPriorities: ["dental"],
    };

    const visitEdit = { ...saved, visitFrequency: "high" as const };
    const zipEdit = { ...saved, zip3: "331" };
    const countyEdit = { ...saved, county: "Miami-Dade" };

    expect(benchmarkIntakeInputsEqual(saved, visitEdit)).toBe(false);
    expect(benchmarkIntakeLocationChanged(saved, visitEdit)).toBe(false);

    expect(benchmarkIntakeInputsEqual(saved, zipEdit)).toBe(false);
    expect(benchmarkIntakeLocationChanged(saved, zipEdit)).toBe(true);

    expect(benchmarkIntakeInputsEqual(saved, countyEdit)).toBe(false);
    expect(benchmarkIntakeLocationChanged(saved, countyEdit)).toBe(true);
  });
});
