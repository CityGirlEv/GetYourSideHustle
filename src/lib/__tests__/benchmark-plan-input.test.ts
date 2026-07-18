import { describe, expect, it } from "vitest";
import { benchmarkToPlanComparisonScenario } from "../benchmark-plan-input";
import { buildEducationalBenchmarkReport } from "../educational-benchmark-report";
import type { BenchmarkIntakeInput } from "../benchmark-intake";
import { areaPlanDetails, fullCatalogPlanDetails, rankedPlanDetails } from "../plan-details";
import {
  filterPlansForScope,
  fullCatalogPlanFilterCounts,
  myAvailableRowFilterCounts,
  visiblePlanSubfilters,
  MA_ROW_FILTERS,
  ALL_PLANS_MEDIGAP_ROW_FILTERS,
  MY_AVAILABLE_MEDIGAP_ROW_FILTERS,
  MY_AVAILABLE_ROW_HEADER_FILTERS,
} from "../plan-filters";

function evangelineIntake(over: Partial<BenchmarkIntakeInput> = {}): BenchmarkIntakeInput {
  return {
    birthYear: 1960,
    gender: "female",
    tobacco: false,
    zip3: "705",
    county: "Evangeline Parish",
    medicareEnrolled: "both",
    eligibilityCircumstance: null,
    eligibilityCircumstanceOther: "",
    incomeBand: "$35k–$65k",
    conditions: [],
    medications: [],
    medicationDetails: [],
    visitFrequency: "low",
    preferredPharmacy: "no",
    preferredPharmacyName: "",
    benefitPriorities: [],
    ...over,
  };
}

describe("benchmarkToPlanComparisonScenario", () => {
  it("passes zip3 and formatted parish county for ZIP 705 Evangeline", () => {
    const intake = evangelineIntake();
    const report = buildEducationalBenchmarkReport(intake);
    const scenario = benchmarkToPlanComparisonScenario(intake, report);

    expect(scenario.zip3).toBe("705");
    expect(scenario.county).toBe("Evangeline Parish, LA");
    expect(report.selectedCounty).toEqual({
      county: "Evangeline Parish",
      stateCode: "LA",
    });
  });

  it("falls back to report.selectedCounty when intake county text differs slightly", () => {
    const intake = evangelineIntake({ county: "Evangeline Parish, LA" });
    const report = buildEducationalBenchmarkReport(evangelineIntake());
    const scenario = benchmarkToPlanComparisonScenario(intake, report);

    expect(scenario.county).toBe("Evangeline Parish, LA");
  });

  it("row-1 counts from scenario are parish-scoped, not full zip3", () => {
    const intake = evangelineIntake();
    const report = buildEducationalBenchmarkReport(intake);
    const scenario = benchmarkToPlanComparisonScenario(intake, report);

    const memberInput = {
      year: scenario.year,
      zip3: scenario.zip3,
      county: scenario.county,
      medications: scenario.medications,
    };
    const fullCatalogInput = {
      year: scenario.year,
      medications: scenario.medications,
    };

    const memberPlans = areaPlanDetails(memberInput);
    const fullCatalogPlans = fullCatalogPlanDetails(fullCatalogInput);
    const top = rankedPlanDetails(memberInput);
    const row1 = myAvailableRowFilterCounts(memberPlans, top);
    const row2 = fullCatalogPlanFilterCounts(fullCatalogPlans, top);

    expect(row1["medicare-advantage"]).toBeLessThan(row2["medicare-advantage"]);
    expect(row1["highly-rated"]).toBeLessThan(row2["highly-rated"]);
    expect(visiblePlanSubfilters(MY_AVAILABLE_ROW_HEADER_FILTERS, row1)).toEqual(
      MY_AVAILABLE_ROW_HEADER_FILTERS,
    );
    expect(visiblePlanSubfilters(MY_AVAILABLE_MEDIGAP_ROW_FILTERS, row1)).toEqual(
      MY_AVAILABLE_MEDIGAP_ROW_FILTERS,
    );
    expect(visiblePlanSubfilters(ALL_PLANS_MEDIGAP_ROW_FILTERS, row2)).toEqual(
      ALL_PLANS_MEDIGAP_ROW_FILTERS,
    );
    expect(ALL_PLANS_MEDIGAP_ROW_FILTERS.map((f) => f.id)).toEqual([
      "medicare-supplement",
      "medicare-supplement-top-3",
      "medicare-supplement-top-10",
      "medicare-supplement-highly-rated",
    ]);
    expect(ALL_PLANS_MEDIGAP_ROW_FILTERS.map((f) => f.id)).not.toContain("medigap");

    const memberHmo = filterPlansForScope(fullCatalogPlans, "hmo", top, "member", memberPlans);
    expect(memberHmo.length).toBe(row1.hmo);
    expect(memberHmo.length).toBeLessThan(
      filterPlansForScope(fullCatalogPlans, "hmo", top, "area", memberPlans).length,
    );
    expect(visiblePlanSubfilters(MA_ROW_FILTERS, row1)).toEqual(MA_ROW_FILTERS);
  });

  it("row-2 All pill badge and All filter list both use national CMS catalog", () => {
    const intake = evangelineIntake();
    const report = buildEducationalBenchmarkReport(intake);
    const scenario = benchmarkToPlanComparisonScenario(intake, report);

    const memberInput = {
      year: scenario.year,
      zip3: scenario.zip3,
      county: scenario.county,
      medications: scenario.medications,
    };
    const fullCatalogInput = {
      year: scenario.year,
      medications: scenario.medications,
    };

    const memberPlans = areaPlanDetails(memberInput);
    const fullCatalogPlans = fullCatalogPlanDetails(fullCatalogInput);
    const top = rankedPlanDetails(memberInput);
    const areaCounts = fullCatalogPlanFilterCounts(fullCatalogPlans, top);

    expect(areaCounts.all).toBe(fullCatalogPlans.length);
    expect(memberPlans.length).toBeLessThan(fullCatalogPlans.length);
    expect(areaCounts.all).not.toBe(memberPlans.length);

    const nationalAllList = filterPlansForScope(
      fullCatalogPlans,
      "all",
      top,
      "area",
      memberPlans,
    );
    expect(nationalAllList.length).toBe(fullCatalogPlans.length);
    expect(nationalAllList.length).toBe(areaCounts.all);
  });
});
