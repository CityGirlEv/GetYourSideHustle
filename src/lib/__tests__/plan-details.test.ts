import { describe, it, expect } from "vitest";
import { areaPlanDetails, fullCatalogPlanDetails, rankedPlanDetails, nationalRankedPlanDetails, potentialTop3PlanDetails, pathwayComparisonPlans, isStandalonePartDPlan, isMedigapPlan, isMedicareAdvantagePlan } from "../plan-details";
import { filterAreaPlans, filterPlansForScope, filterHighlyRatedBySubTabRanked, filterAllPlansByListTabRanked, allPlansListTabCounts, allPlansListTabRankingsMeta, ALL_PLANS_LIST_TABS, ALL_PLANS_LIST_TABS_WITH_PART_B, partBMedTabRankingsMeta, HIGHLY_RATED_MIN_STARS, HIGHLY_RATED_SUBFILTERS, highlyRatedSubTabCounts, highlyRatedSubTabRankingsMeta, highlyRatedCriteriaSentence, top10RankingsMethodologySentence, isHighlyRatedMedigapPlan, isHighlyRatedPlan, isPlanFilterRowActive, isAreaCatalogListPanel, isPlanListPanel, isZipCountyReportPanel, ZIP_COUNTY_REPORT_PANEL, myAvailablePlanFilterCounts, myAvailableRowFilterCounts, planFilterCounts, planFilterRankingsMeta, planFilterRunnersUpTitle, planFilterWhySectionMeta, planFilterWhySectionMetaForPanel, planPanelEmbeddedHeading, planHasCmsStarRating, fullCatalogPlanFilterCounts, shouldShowAllPlansRow, shouldShowPlanWhySection, visiblePlanSubfilters, TOP_PLAN_FILTER, POTENTIAL_TOP_3_FILTER, MA_ADVANTAGE_SUBFILTERS, MA_ROW_FILTERS, MEDIGAP_SUBFILTERS, MEDIGAP_GROUP_SUBFILTERS, ALL_PLANS_MEDIGAP_ROW_FILTERS, ALL_PLANS_PART_D_ROW_FILTERS, MY_AVAILABLE_MEDIGAP_ROW_FILTERS, MY_AVAILABLE_PART_D_ROW_FILTERS, myAvailableMaRowFiltersForMember, PART_D_ROW_FILTERS, MY_AVAILABLE_ROW_ALL_PLANS_FILTER, MY_AVAILABLE_ROW_HEADER_FILTERS, ALL_PLAN_FILTER_OPTIONS, ALL_PLANS_ROW_HEADER_FILTERS, catalogTypePartitionReconciles, catalogTypePartitionSum, maTypePartitionReconciles, CATALOG_TYPE_PARTITION_FILTERS, plansForPotentialTop3, plansForRankingsTable, planDetailKey, comparePlansByFitThenRating, AVAIL_MEDIGAP_ALL_FILTER, AVAIL_MA_ALL_FILTER, planRankCollapsibleTitle, planListCategoryTabsForPanel, planListCategoryTabCounts, filterPlansByListCategoryTabRanked, planListCategoryTabRankingsMeta, shouldShowPlanListCategoryTabs, defaultPlanListCategoryTab, shouldExcludeDSnpPlans, applyMemberEligibilityPlanExclusions, applyMyAvailablePlanExclusions, maRowFiltersForEligibility, maRowFiltersForCatalogDisplay, isDSnpPlan, isISnpPlan, planDrugDisplayContextForPanel, isAllPlansCategoryTopFilter, isAllPlansCategoryHighlyRatedFilter, isAllPlansCategoryScopedFilter, allPlansCategoryTopFilterMeta, allPlansCategoryHighlyRatedFilterMeta, countPlansForFilter, planActiveFilterPillMeta, shouldHidePlanFilterCount } from "../plan-filters";
import { POTENTIAL_TOP_3_LABEL, TOP_10_PLANS_LABEL } from "../plan-comparison-copy";
import type { Medication } from "../medicare-math";

const med = (over: Partial<Medication>): Medication => ({
  id: over.id ?? "m1",
  medication_name: over.medication_name ?? "atorvastatin",
  strength: "10mg",
  dosage_form: "tablet",
  frequency: "daily",
  estimated_monthly_retail: over.estimated_monthly_retail ?? 10,
});

describe("nationalRankedPlanDetails", () => {
  const input = {
    year: 2026 as const,
    medications: [
      med({ id: "1", medication_name: "atorvastatin", estimated_monthly_retail: 12 }),
      med({ id: "2", medication_name: "metformin", estimated_monthly_retail: 8 }),
    ],
  };

  it("returns 10 plans from the full national catalog", () => {
    const fullCatalog = fullCatalogPlanDetails(input);
    const nationalTop10 = nationalRankedPlanDetails(input);
    expect(nationalTop10).toHaveLength(10);
    expect(fullCatalog.length).toBeGreaterThan(10);
    expect(nationalTop10.every((p) => !/^Medicare Part D/i.test(p.planType))).toBe(true);
  });

  it("ranks ascending by annual cost", () => {
    const nationalTop10 = nationalRankedPlanDetails(input);
    for (let i = 1; i < nationalTop10.length; i++) {
      expect(nationalTop10[i]!.annual).toBeGreaterThanOrEqual(nationalTop10[i - 1]!.annual);
      expect(nationalTop10[i]!.rank).toBe(i + 1);
    }
  });
});

describe("rankedPlanDetails", () => {
  const input = {
    year: 2026 as const,
    zip3: "331",
    medications: [
      med({ id: "1", medication_name: "atorvastatin", estimated_monthly_retail: 12 }),
      med({ id: "2", medication_name: "metformin", estimated_monthly_retail: 8 }),
    ],
  };

  it("returns up to 10 ranked plans", () => {
    const list = rankedPlanDetails(input);
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(10);
  });

  it("ranks ascending by annual cost", () => {
    const list = rankedPlanDetails(input);
    for (let i = 1; i < list.length; i++) {
      expect(list[i].annual).toBeGreaterThanOrEqual(list[i - 1].annual);
      expect(list[i].rank).toBe(i + 1);
    }
  });

  it("handles empty meds", () => {
    const list = rankedPlanDetails({ ...input, medications: [] });
    expect(list.length).toBeGreaterThan(0);
  });
});

function planTypeBucket(planType: string): "MA" | "SUPP" | "PDP" | "OTHER" {
  if (/medicare advantage/i.test(planType)) return "MA";
  if (/medigap|supplement/i.test(planType)) return "SUPP";
  if (/^Medicare Part D/i.test(planType)) return "PDP";
  return "OTHER";
}

describe("potentialTop3PlanDetails", () => {
  const input = {
    year: 2026 as const,
    zip3: "331",
    county: "Miami-Dade, FL",
    medications: [] as Medication[],
  };

  it("returns the 3 lowest-cost pathway plans from the member catalog", () => {
    const memberPlans = areaPlanDetails(input);
    const pathway = pathwayComparisonPlans(memberPlans);
    const top3 = potentialTop3PlanDetails(input);
    expect(top3).toHaveLength(3);
    expect(top3.map((p) => planDetailKey(p))).toEqual(
      pathway.slice(0, 3).map((p) => planDetailKey(p)),
    );
    for (let i = 1; i < top3.length; i++) {
      expect(top3[i]!.annual).toBeGreaterThanOrEqual(top3[i - 1]!.annual);
    }
  });

  it("uses parish-scoped member catalog when county is set", () => {
    const evangeline = {
      year: 2026 as const,
      zip3: "705",
      county: "Evangeline Parish",
      medications: [] as Medication[],
    };
    const memberPlans = areaPlanDetails(evangeline);
    const pathway = pathwayComparisonPlans(memberPlans);
    const top3 = potentialTop3PlanDetails(evangeline);
    expect(top3.map((p) => planDetailKey(p))).toEqual(
      pathway.slice(0, 3).map((p) => planDetailKey(p)),
    );
  });

  it("pathway ranking excludes standalone Part D drug-only plans", () => {
    const memberPlans = areaPlanDetails(input);
    const top3 = potentialTop3PlanDetails(input);
    const catalogTypes = new Set(memberPlans.map((p) => planTypeBucket(p.planType)));
    expect(catalogTypes.has("MA")).toBe(true);
    expect(catalogTypes.has("SUPP")).toBe(true);
    expect(catalogTypes.has("PDP")).toBe(true);
    const pathway = pathwayComparisonPlans(memberPlans);
    const sorted = [...pathway].sort((a, b) => a.annual - b.annual);
    expect(top3[0]!.annual).toBe(sorted[0]!.annual);
    expect(top3.every((p) => !isStandalonePartDPlan(p))).toBe(true);
  });

  it("can include a mix of pathway plan types when they rank among the lowest cost", () => {
    const expensiveMeds = [
      med({ id: "1", medication_name: "eliquis", estimated_monthly_retail: 520 }),
      med({ id: "2", medication_name: "ozempic", estimated_monthly_retail: 890 }),
      med({ id: "3", medication_name: "entresto", estimated_monthly_retail: 640 }),
    ];
    const memberInput = {
      year: 2026 as const,
      zip3: "705",
      county: "Evangeline Parish",
      medications: expensiveMeds,
    };
    const memberPlans = areaPlanDetails(memberInput);
    const pathway = pathwayComparisonPlans(memberPlans);
    const top3 = potentialTop3PlanDetails(memberInput);
    const top3Types = new Set(top3.map((p) => planTypeBucket(p.planType)));
    const catalogTypes = new Set(memberPlans.map((p) => planTypeBucket(p.planType)));
    expect(catalogTypes.has("MA")).toBe(true);
    expect(catalogTypes.has("SUPP")).toBe(true);
    expect(catalogTypes.has("PDP")).toBe(true);
    expect(top3.map((p) => planDetailKey(p))).toEqual(
      pathway.slice(0, 3).map((p) => planDetailKey(p)),
    );
    expect(top3Types.size).toBeGreaterThanOrEqual(1);
    expect(top3.every((p) => !isStandalonePartDPlan(p))).toBe(true);
  });
});

describe("plansForPotentialTop3", () => {
  const memberInput = {
    year: 2026 as const,
    zip3: "331",
    county: "Miami-Dade, FL",
    medications: [] as Medication[],
  };

  it("Potential Top 3 panel draws from pathway-ranked member catalog, not top-10 pool", () => {
    const memberPlans = areaPlanDetails(memberInput);
    const pathway = pathwayComparisonPlans(memberPlans);
    const top10 = rankedPlanDetails(memberInput);
    const fullCatalog = fullCatalogPlanDetails({
      year: memberInput.year,
      medications: memberInput.medications,
    });
    const top3 = plansForPotentialTop3(
      "why-this-plan",
      "my-available",
      memberPlans,
      top10,
      fullCatalog,
      "member",
    );
    expect(top3).toHaveLength(3);
    expect(top3.map((p) => planDetailKey(p))).toEqual(
      pathway.slice(0, 3).map((p) => planDetailKey(p)),
    );
  });

  it("All Plans row Top 3 draws from pathway-ranked national catalog", () => {
    const memberInput = {
      year: 2026 as const,
      zip3: "331",
      county: "Miami-Dade, FL",
      medications: [] as Medication[],
    };
    const memberPlans = areaPlanDetails(memberInput);
    const top10 = rankedPlanDetails(memberInput);
    const fullCatalog = fullCatalogPlanDetails({
      year: memberInput.year,
      medications: memberInput.medications,
    });
    const nationalPathway = pathwayComparisonPlans(fullCatalog);
    const top3 = plansForPotentialTop3(
      "why-this-plan",
      "my-available",
      memberPlans,
      top10,
      fullCatalog,
      "area",
    );
    expect(top3).toHaveLength(3);
    expect(top3.map((p) => planDetailKey(p))).toEqual(
      nationalPathway.slice(0, 3).map((p) => planDetailKey(p)),
    );
  });

  it("member-row category filters take top 3 within that category from member catalog", () => {
    const memberPlans = areaPlanDetails(memberInput);
    const top10 = rankedPlanDetails(memberInput);
    const fullCatalog = fullCatalogPlanDetails({
      year: memberInput.year,
      medications: memberInput.medications,
    });
    const hmoTop3 = plansForPotentialTop3(
      "hmo",
      "hmo",
      memberPlans,
      top10,
      fullCatalog,
      "member",
    );
    expect(hmoTop3.length).toBeLessThanOrEqual(3);
    expect(hmoTop3.every((p) => /\bHMO\b/i.test(p.planType) && !/HMO-POS/i.test(p.planType))).toBe(
      true,
    );
    const allHmo = filterPlansForScope(fullCatalog, "hmo", top10, "member", memberPlans);
    expect(hmoTop3.map((p) => planDetailKey(p))).toEqual(
      allHmo.slice(0, 3).map((p) => planDetailKey(p)),
    );
  });
});

describe("areaPlanDetails", () => {
  const input = {
    year: 2026 as const,
    zip3: "331",
    county: "Miami-Dade, FL",
    medications: [] as Medication[],
  };

  it("returns the full area catalog (more than the top 10)", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    expect(all.length).toBeGreaterThan(10);
    expect(top.length).toBe(10);
    expect(all[0]!.annual).toBeLessThanOrEqual(top[0]!.annual);
  });

  it("separates HMO, PPO, supplement, Advantage, and Part D plans", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const counts = planFilterCounts(all, top);
    expect(counts.hmo).toBeGreaterThan(0);
    expect(counts.ppo).toBeGreaterThan(0);
    expect(counts["hmo-pos"]).toBeGreaterThan(0);
    expect(counts.pffs).toBeGreaterThanOrEqual(0);
    expect(counts.msa).toBeGreaterThanOrEqual(0);
    expect(counts["medicare-advantage"]).toBeGreaterThan(0);
    expect(counts["medicare-supplement"]).toBeGreaterThan(0);
    expect(counts["medicare-part-d"]).toBeGreaterThan(0);
    expect(counts.all).toBe(all.length);
    expect(maTypePartitionReconciles(counts)).toBe(true);
    expect(catalogTypePartitionReconciles(counts)).toBe(true);

    const hmoPlans = filterAreaPlans(all, "hmo", top);
    const ppoPlans = filterAreaPlans(all, "ppo", top);
    const maPlans = filterAreaPlans(all, "medicare-advantage", top);
    const suppPlans = filterAreaPlans(all, "medicare-supplement", top);
    const pdpPlans = filterAreaPlans(all, "medicare-part-d", top);
    expect(hmoPlans.every((p) => /\bHMO\b/i.test(p.planType) && !/HMO-POS/i.test(p.planType))).toBe(
      true,
    );
    expect(ppoPlans.every((p) => /\(PPO\)/i.test(p.planType))).toBe(true);
    expect(maPlans.every((p) => /medicare advantage/i.test(p.planType))).toBe(true);
    expect(suppPlans.every((p) => /medigap|supplement/i.test(p.planType))).toBe(true);
    expect(pdpPlans.every((p) => /^Medicare Part D/i.test(p.planType))).toBe(true);

    const medigapPlans = filterAreaPlans(all, "medigap", top);
    expect(medigapPlans.length).toBe(suppPlans.length);
    expect(counts.medigap).toBe(counts["medicare-supplement"]);
    expect(PART_D_ROW_FILTERS.map((f) => f.id)).toEqual(["medicare-part-d"]);
    expect(AVAIL_MEDIGAP_ALL_FILTER.label).toBe("All");
    expect(AVAIL_MA_ALL_FILTER.label).toBe("All");
    expect(MY_AVAILABLE_ROW_ALL_PLANS_FILTER.label).toBe("All");
  });

  it("member-scoped All pill shows count for non-admin viewers", () => {
    expect(shouldHidePlanFilterCount("all", "member", false)).toBe(false);
    const meta = planActiveFilterPillMeta(
      "all",
      "member",
      { all: 90 } as ReturnType<typeof myAvailableRowFilterCounts>,
      false,
    );
    expect(meta.count).toBe(90);
    expect(meta.hideCount).toBe(false);
    expect(meta.label).toBe("All");
  });

  it("area-scoped All pill hides count when showAllPlanCount is false", () => {
    expect(shouldHidePlanFilterCount("all", "area", false)).toBe(true);
    const meta = planActiveFilterPillMeta(
      "all",
      "area",
      { all: 500 } as ReturnType<typeof fullCatalogPlanFilterCounts>,
      false,
    );
    expect(meta.hideCount).toBe(true);
  });

  it("row-1 header filters exclude All Plans and Highly Rated; row-2 includes both", () => {
    expect(MY_AVAILABLE_ROW_HEADER_FILTERS.map((f) => f.id)).not.toContain("all");
    expect(MY_AVAILABLE_ROW_HEADER_FILTERS.map((f) => f.id)).not.toContain("highly-rated");
    expect(ALL_PLANS_ROW_HEADER_FILTERS.map((f) => f.id)).toContain("all");
    expect(ALL_PLANS_ROW_HEADER_FILTERS.map((f) => f.id)).toContain("highly-rated");
  });

  it("full national catalog type buckets partition the All Plans total", () => {
    const fullCatalog = fullCatalogPlanDetails({ year: 2026, medications: [] });
    const top = fullCatalog.slice(0, 10);
    const counts = fullCatalogPlanFilterCounts(fullCatalog, top);

    expect(catalogTypePartitionSum(counts)).toBe(counts.all);
    expect(catalogTypePartitionReconciles(counts)).toBe(true);
    expect(maTypePartitionReconciles(counts)).toBe(true);
    expect(
      counts["medicare-advantage"] + counts["medicare-supplement"] + counts["medicare-part-d"],
    ).toBe(counts.all);
    expect(
      counts.hmo +
        counts.ppo +
        counts["hmo-pos"] +
        counts.pffs +
        counts.msa +
        counts["d-snp"] +
        counts["c-snp"] +
        counts["i-snp"],
    ).toBe(counts["medicare-advantage"]);
    expect(CATALOG_TYPE_PARTITION_FILTERS).toEqual(
      expect.arrayContaining([
        "hmo",
        "ppo",
        "hmo-pos",
        "pffs",
        "msa",
        "d-snp",
        "c-snp",
        "i-snp",
        "medicare-supplement",
        "medicare-part-d",
      ]),
    );
    expect(MA_ADVANTAGE_SUBFILTERS.map((f) => f.id)).toEqual(
      expect.arrayContaining(["hmo", "ppo", "hmo-pos", "pffs", "msa"]),
    );
  });

  it("shows all possible-plans sub-filters including zero-count options", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const counts = planFilterCounts(all, top);
    const visible = visiblePlanSubfilters(MA_ADVANTAGE_SUBFILTERS, counts);
    expect(visible).toEqual(MA_ADVANTAGE_SUBFILTERS);
    expect(counts[TOP_PLAN_FILTER.id]).toBeGreaterThan(0);
    expect(TOP_PLAN_FILTER.label).toBe(TOP_10_PLANS_LABEL);
    expect(POTENTIAL_TOP_3_FILTER.label).toBe(POTENTIAL_TOP_3_LABEL);
  });

  it("row-1 category pill counts use member parish catalog (not full ZIP prefix)", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const areaCounts = planFilterCounts(all, top);
    const topOnlyCounts = myAvailablePlanFilterCounts(top);
    expect(areaCounts[TOP_PLAN_FILTER.id]).toBe(top.length);
    expect(areaCounts["medicare-advantage"]).toBeGreaterThan(topOnlyCounts["medicare-advantage"]);
    expect(areaCounts["medicare-supplement"]).toBeGreaterThan(topOnlyCounts["medicare-supplement"]);
    expect(areaCounts.hmo).toBeGreaterThan(topOnlyCounts.hmo);
    expect(areaCounts.ppo).toBeGreaterThan(topOnlyCounts.ppo);
  });

  it("shows row-1 Medigap sub-filters when area has Supplement or Part D plans", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const areaCounts = planFilterCounts(all, top);
    const visibleMedigap = visiblePlanSubfilters(MEDIGAP_SUBFILTERS, areaCounts);
    expect(visibleMedigap).toEqual(MEDIGAP_SUBFILTERS);
  });

  it("shows row-1 Medicare Advantage HMO/PPO sub-filters when member catalog has MA plans", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const row1Counts = myAvailableRowFilterCounts(all, top);
    const visibleMa = visiblePlanSubfilters(MA_ROW_FILTERS, row1Counts);
    expect(row1Counts["medicare-advantage"]).toBeGreaterThan(0);
    expect(visibleMa).toEqual(MA_ROW_FILTERS);
    expect(row1Counts.hmo).toBe(filterAreaPlans(all, "hmo", top).length);
    expect(row1Counts.ppo).toBe(filterAreaPlans(all, "ppo", top).length);
  });

  it("ZIP 331 top-10 pathway ranking can include MA while area catalog has Part D", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const topOnly = myAvailablePlanFilterCounts(top);
    const area = planFilterCounts(all, top);
    const maInTop = top.filter((p) => /medicare advantage/i.test(p.planType)).length;
    const suppInTop = top.filter((p) => /medigap|supplement/i.test(p.planType)).length;
    expect(topOnly["medicare-advantage"]).toBe(maInTop);
    expect(topOnly["medicare-supplement"]).toBe(suppInTop);
    expect(area["medicare-advantage"]).toBeGreaterThan(maInTop);
    expect(area["medicare-supplement"]).toBeGreaterThan(suppInTop);
    expect(maInTop).toBeGreaterThan(0);
    expect(top.every((p) => !isStandalonePartDPlan(p))).toBe(true);
    expect(area["medicare-advantage"]).toBeGreaterThan(0);
    expect(area["medicare-supplement"]).toBeGreaterThan(0);
  });

  it("row-1 category pills use member catalog; row-2 uses full national CMS catalog", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const fullCatalog = fullCatalogPlanDetails({ year: input.year, medications: input.medications });
    const fullCounts = fullCatalogPlanFilterCounts(fullCatalog, top);
    const row1Counts = myAvailableRowFilterCounts(all, top);

    // Single-county ZIP 331 — open MA types only in member catalog; full includes SNPs + closed Medigap.
    expect(fullCounts["medicare-advantage"]).toBeGreaterThan(0);
    expect(fullCounts["medicare-supplement"]).toBeGreaterThan(0);
    expect(row1Counts["medicare-advantage"]).toBeLessThan(fullCounts["medicare-advantage"]);
    expect(row1Counts["medicare-supplement"]).toBeLessThan(fullCounts["medicare-supplement"]);
    expect(row1Counts["medicare-part-d"]).toBeLessThan(fullCounts["medicare-part-d"]);
    expect(row1Counts[TOP_PLAN_FILTER.id]).toBe(top.length);
    expect(fullCounts.all).toBe(fullCatalog.length);
  });

  it("row-1 category filters use member catalog; member scope limits top-10 only", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const fullCatalog = fullCatalogPlanDetails({ year: input.year, medications: input.medications });
    const maInTop = top.filter((p) => /medicare advantage/i.test(p.planType)).length;
    const nationalMa = filterPlansForScope(fullCatalog, "medicare-advantage", top, "area").length;
    const row1Ma = filterPlansForScope(fullCatalog, "medicare-advantage", top, "member", all).length;
    const top10Only = filterPlansForScope(fullCatalog, "my-available", top, "member", all).length;

    expect(nationalMa).toBeGreaterThan(maInTop);
    expect(row1Ma).toBeLessThan(nationalMa);
    expect(maInTop).toBeGreaterThan(0);
    expect(top10Only).toBe(top.length);
  });

  it("All Plans row Top 10 uses national CMS pathway ranking, not regional pool", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const nationalTop = nationalRankedPlanDetails({
      year: input.year,
      medications: input.medications,
    });
    const fullCatalog = fullCatalogPlanDetails({ year: input.year, medications: input.medications });
    const areaTop10 = filterPlansForScope(fullCatalog, "my-available", top, "area", all);

    expect(areaTop10).toHaveLength(10);
    expect(areaTop10.map((p) => planDetailKey(p))).toEqual(
      nationalTop.map((p) => planDetailKey(p)),
    );
    expect(areaTop10.map((p) => planDetailKey(p))).not.toEqual(top.map((p) => planDetailKey(p)));
    expect(isPlanFilterRowActive("my-available", "area", "my-available", "area")).toBe(true);
    expect(isPlanFilterRowActive("my-available", "member", "my-available", "area")).toBe(false);
  });

  it("member-row Top 10 uses regional pathway ranking; area-row uses national", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const nationalTop = nationalRankedPlanDetails({
      year: input.year,
      medications: input.medications,
    });
    const fullCatalog = fullCatalogPlanDetails({ year: input.year, medications: input.medications });
    const memberTop10 = filterPlansForScope(fullCatalog, "my-available", top, "member", all);
    const areaTop10 = filterPlansForScope(fullCatalog, "my-available", top, "area", all);

    expect(memberTop10).toHaveLength(top.length);
    expect(memberTop10.map((p) => planDetailKey(p))).toEqual(top.map((p) => planDetailKey(p)));
    expect(areaTop10).toHaveLength(10);
    expect(areaTop10.map((p) => planDetailKey(p))).toEqual(
      nationalTop.map((p) => planDetailKey(p)),
    );
  });

  it("row-1 visibility counts come from zip3+county member catalog, not top-10 pool", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const visibility = myAvailableRowFilterCounts(all, top);

    expect(visibility["medicare-advantage"]).toBeGreaterThan(0);
    expect(visibility["medicare-supplement"]).toBeGreaterThan(0);
    expect(visiblePlanSubfilters(MEDIGAP_SUBFILTERS, visibility).length).toBeGreaterThan(0);
  });

  it("ZIP 705 Evangeline parish — row 1 MA counts are lower than row 2 All Plans (national)", () => {
    const memberInput = {
      year: 2026 as const,
      zip3: "705",
      county: "Evangeline Parish",
      medications: [] as Medication[],
    };
    const fullCatalogInput = { year: 2026 as const, medications: [] as Medication[] };
    const memberPlans = areaPlanDetails(memberInput);
    const fullCatalogPlans = fullCatalogPlanDetails(fullCatalogInput);
    const top = rankedPlanDetails(memberInput);
    const row1 = myAvailableRowFilterCounts(memberPlans, top);
    const row2 = fullCatalogPlanFilterCounts(fullCatalogPlans, top);

    expect(memberPlans.length).toBeLessThan(fullCatalogPlans.length);
    expect(row1["medicare-advantage"]).toBeLessThan(row2["medicare-advantage"]);
    expect(row1.hmo).toBeLessThanOrEqual(row2.hmo);
    expect(row1.ppo).toBeLessThanOrEqual(row2.ppo);
    expect(row1["medicare-supplement"]).toBeLessThan(row2["medicare-supplement"]);
    expect(row1["medicare-part-d"]).toBeLessThan(row2["medicare-part-d"]);
    expect(row1.all).toBeLessThan(row2.all);
    expect(row1["highly-rated"]).toBeLessThan(row2["highly-rated"]);
    const visibleMa = visiblePlanSubfilters(MA_ROW_FILTERS, row1);
    expect(visibleMa).toEqual(MA_ROW_FILTERS);
    expect(visiblePlanSubfilters(MEDIGAP_SUBFILTERS, row1)).toEqual(MEDIGAP_SUBFILTERS);
  });

  it("ZIP 705 Evangeline — row-1 pill counts match member-scoped filtered lists", () => {
    const memberInput = {
      year: 2026 as const,
      zip3: "705",
      county: "Evangeline Parish, LA",
      medications: [] as Medication[],
    };
    const fullCatalogInput = { year: 2026 as const, medications: [] as Medication[] };
    const memberPlans = areaPlanDetails(memberInput);
    const fullCatalogPlans = fullCatalogPlanDetails(fullCatalogInput);
    const top = rankedPlanDetails(memberInput);
    const row1 = myAvailableRowFilterCounts(memberPlans, top);

    for (const option of ALL_PLAN_FILTER_OPTIONS) {
      const filteredLen = filterPlansForScope(
        fullCatalogPlans,
        option.id,
        top,
        "member",
        memberPlans,
      ).length;
      expect(row1[option.id], `count mismatch for ${option.id}`).toBe(filteredLen);
    }

    expect(visiblePlanSubfilters(MA_ROW_FILTERS, row1)).toEqual(MA_ROW_FILTERS);
    expect(visiblePlanSubfilters(MY_AVAILABLE_MEDIGAP_ROW_FILTERS, row1)).toEqual(
      MY_AVAILABLE_MEDIGAP_ROW_FILTERS,
    );
    expect(row1["medicare-advantage"]).toBeLessThan(
      fullCatalogPlanFilterCounts(fullCatalogPlans, top)["medicare-advantage"],
    );
  });

  it("row-1 member scope Supplement and Part D use zip3 regional catalog, not top-10", () => {
    const memberInput = {
      year: 2026 as const,
      zip3: "331",
      county: "Miami-Dade, FL",
      medications: [] as Medication[],
    };
    const fullCatalogInput = { year: 2026 as const, medications: [] as Medication[] };
    const memberPlans = areaPlanDetails(memberInput);
    const fullCatalogPlans = fullCatalogPlanDetails(fullCatalogInput);
    const top = rankedPlanDetails(memberInput);
    const row1Counts = myAvailableRowFilterCounts(memberPlans, top);

    const suppInTop = top.filter((p) => /medigap|supplement/i.test(p.planType)).length;
    const partDInTop = top.filter((p) => /^Medicare Part D/i.test(p.planType)).length;

    const memberSupp = filterPlansForScope(
      fullCatalogPlans,
      "medicare-supplement",
      top,
      "member",
      memberPlans,
    );
    const memberPartD = filterPlansForScope(
      fullCatalogPlans,
      "medicare-part-d",
      top,
      "member",
      memberPlans,
    );
    const areaSupp = filterPlansForScope(
      fullCatalogPlans,
      "medicare-supplement",
      top,
      "area",
      memberPlans,
    );

    expect(suppInTop).toBe(0);
    expect(row1Counts["medicare-supplement"]).toBeGreaterThan(0);
    expect(memberSupp.length).toBe(row1Counts["medicare-supplement"]);
    expect(memberSupp.length).toBeGreaterThan(suppInTop);

    expect(row1Counts["medicare-part-d"]).toBeGreaterThan(0);
    expect(memberPartD.length).toBe(row1Counts["medicare-part-d"]);
    expect(memberPartD.length).toBeGreaterThanOrEqual(partDInTop);
    const sharedSupp = memberSupp.find((plan) =>
      areaSupp.some(
        (areaPlan) => areaPlan.carrier === plan.carrier && areaPlan.plan === plan.plan,
      ),
    );
    const nationalMatch = areaSupp.find(
      (plan) => plan.carrier === sharedSupp?.carrier && plan.plan === sharedSupp?.plan,
    );
    expect(sharedSupp).toBeDefined();
    expect(nationalMatch).toBeDefined();
    expect(sharedSupp!.annual).not.toBe(nationalMatch!.annual);
  });

  it("row-1 Medigap pills use supplement/Part D counts, not MA HMO/PPO", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const row1Counts = myAvailableRowFilterCounts(all, top);

    expect(row1Counts.hmo).toBeGreaterThan(0);
    expect(row1Counts["medicare-supplement"]).toBeGreaterThan(0);
    expect(row1Counts["medicare-supplement"]).not.toBe(row1Counts.hmo);
    expect(row1Counts["medicare-part-d"]).not.toBe(row1Counts.ppo);

    const medigapIds = MEDIGAP_GROUP_SUBFILTERS.map((f) => f.id);
    expect(medigapIds).toEqual(["medicare-supplement"]);
    expect(medigapIds).not.toContain("hmo");
    expect(medigapIds).not.toContain("ppo");
    expect(medigapIds).toHaveLength(1);

    const visibleMedigap = visiblePlanSubfilters(MY_AVAILABLE_MEDIGAP_ROW_FILTERS, row1Counts);
    expect(visibleMedigap).toEqual(MY_AVAILABLE_MEDIGAP_ROW_FILTERS);
    expect(visibleMedigap.map((f) => f.id)).toEqual(["medicare-supplement"]);
  });

  it("row-1 My Available exposes dedicated MA and Part D filter rows (not zero-count gated)", () => {
    const row1Counts = myAvailableRowFilterCounts(
      areaPlanDetails({ year: 2026, zip3: "705", county: "Evangeline Parish", medications: [] }),
      rankedPlanDetails({ year: 2026, zip3: "705", county: "Evangeline Parish", medications: [] }),
    );
    const maFilters = myAvailableMaRowFiltersForMember("$55k–$75k", true);
    expect(MY_AVAILABLE_PART_D_ROW_FILTERS.map((f) => f.id)).toEqual(["medicare-part-d"]);
    expect(maFilters.some((f) => f.id === "medicare-advantage")).toBe(true);
    expect(maFilters.some((f) => f.id === "i-snp")).toBe(false);
    expect(row1Counts["medicare-advantage"]).toBeGreaterThan(0);
    expect(row1Counts["medicare-part-d"]).toBeGreaterThan(0);
    expect(MY_AVAILABLE_MEDIGAP_ROW_FILTERS.length).toBeGreaterThan(0);
  });

  it("row-2 All Medigap pills include supplement plus Top 3 / Top 10 / 4.5+ (not on row 1)", () => {
    const fullCatalogPlans = fullCatalogPlanDetails({ year: 2026, medications: [] });
    const top = rankedPlanDetails(input);
    const row2Counts = fullCatalogPlanFilterCounts(fullCatalogPlans, top);

    expect(row2Counts["medicare-supplement"]).toBeGreaterThan(0);
    expect(ALL_PLANS_MEDIGAP_ROW_FILTERS.map((f) => f.id)).toEqual([
      "medicare-supplement",
      "medicare-supplement-top-3",
      "medicare-supplement-top-10",
      "medicare-supplement-highly-rated",
    ]);
    expect(MY_AVAILABLE_MEDIGAP_ROW_FILTERS.map((f) => f.id)).toEqual(["medicare-supplement"]);
    expect(MY_AVAILABLE_MEDIGAP_ROW_FILTERS.map((f) => f.id)).not.toContain(
      "medicare-supplement-top-3",
    );
    expect(MY_AVAILABLE_MEDIGAP_ROW_FILTERS.map((f) => f.id)).not.toContain(
      "medicare-supplement-highly-rated",
    );

    const visibleMedigap = visiblePlanSubfilters(ALL_PLANS_MEDIGAP_ROW_FILTERS, row2Counts);
    expect(visibleMedigap).toEqual(ALL_PLANS_MEDIGAP_ROW_FILTERS);
    expect(visibleMedigap).not.toEqual(MY_AVAILABLE_MEDIGAP_ROW_FILTERS);
  });

  it("row-2 All Part D pills include All plus Top 3 / Top 10 / 4.5+ (not on row 1)", () => {
    const fullCatalogPlans = fullCatalogPlanDetails({ year: 2026, medications: [] });
    const top = rankedPlanDetails(input);
    const row2Counts = fullCatalogPlanFilterCounts(fullCatalogPlans, top);

    expect(ALL_PLANS_PART_D_ROW_FILTERS.map((f) => f.id)).toEqual([
      "medicare-part-d",
      "medicare-part-d-top-3",
      "medicare-part-d-top-10",
      "medicare-part-d-highly-rated",
    ]);
    expect(PART_D_ROW_FILTERS.map((f) => f.id)).toEqual(["medicare-part-d"]);
    expect(PART_D_ROW_FILTERS.map((f) => f.id)).not.toContain("medicare-part-d-highly-rated");
    expect(visiblePlanSubfilters(ALL_PLANS_PART_D_ROW_FILTERS, row2Counts)).toEqual(
      ALL_PLANS_PART_D_ROW_FILTERS,
    );
    expect(visiblePlanSubfilters(PART_D_ROW_FILTERS, row2Counts)).toEqual(PART_D_ROW_FILTERS);
  });

  it("same filter id is active in only one row (member vs area scope)", () => {
    expect(isPlanFilterRowActive("hmo", "member", "hmo", "member")).toBe(true);
    expect(isPlanFilterRowActive("hmo", "member", "hmo", "area")).toBe(false);
    expect(isPlanFilterRowActive("hmo", "area", "hmo", "area")).toBe(true);
    expect(isPlanFilterRowActive("hmo", "area", "hmo", "member")).toBe(false);
    expect(isPlanFilterRowActive("ppo", "member", "hmo", "member")).toBe(false);
    expect(isPlanFilterRowActive("ppo", "area", "hmo", "area")).toBe(false);
  });

  it("member and area scope return different HMO plan lists where parish narrows MA", () => {
    const memberInput = {
      year: 2026 as const,
      zip3: "705",
      county: "Evangeline Parish",
      medications: [] as Medication[],
    };
    const fullCatalogInput = { year: 2026 as const, medications: [] as Medication[] };
    const memberPlans = areaPlanDetails(memberInput);
    const fullCatalogPlans = fullCatalogPlanDetails(fullCatalogInput);
    const top = rankedPlanDetails(memberInput);
    const row1 = myAvailableRowFilterCounts(memberPlans, top);
    const row2 = fullCatalogPlanFilterCounts(fullCatalogPlans, top);

    const memberHmo = filterPlansForScope(fullCatalogPlans, "hmo", top, "member", memberPlans);
    const areaHmo = filterPlansForScope(fullCatalogPlans, "hmo", top, "area", memberPlans);

    expect(row1.hmo).toBe(memberHmo.length);
    expect(row2.hmo).toBe(areaHmo.length);
    expect(memberHmo.length).toBeLessThan(areaHmo.length);
    expect(isPlanFilterRowActive("hmo", "member", "hmo", "member")).toBe(true);
    expect(isPlanFilterRowActive("hmo", "member", "hmo", "area")).toBe(false);
  });

  it("formatted county label (parish, ST) yields same row-1 counts as bare parish name", () => {
    const base = {
      year: 2026 as const,
      zip3: "705",
      medications: [] as Medication[],
    };
    const bare = myAvailableRowFilterCounts(
      areaPlanDetails({ ...base, county: "Evangeline Parish" }),
      rankedPlanDetails({ ...base, county: "Evangeline Parish" }),
    );
    const formatted = myAvailableRowFilterCounts(
      areaPlanDetails({ ...base, county: "Evangeline Parish, LA" }),
      rankedPlanDetails({ ...base, county: "Evangeline Parish, LA" }),
    );
    expect(formatted.hmo).toBe(bare.hmo);
    expect(formatted.ppo).toBe(bare.ppo);
    expect(formatted["medicare-supplement"]).toBe(bare["medicare-supplement"]);
    expect(formatted["medicare-part-d"]).toBe(bare["medicare-part-d"]);
  });

  it("shows row-1 pills even when a category has zero parish-scoped plans", () => {
    const base = {
      year: 2026 as const,
      zip3: "705",
      medications: [] as Medication[],
    };
    const memberPlans = areaPlanDetails({ ...base, county: "Evangeline Parish" });
    const top = rankedPlanDetails({ ...base, county: "Evangeline Parish" });
    const row1 = myAvailableRowFilterCounts(memberPlans, top);

    expect(visiblePlanSubfilters(MY_AVAILABLE_MEDIGAP_ROW_FILTERS, row1)).toEqual(
      MY_AVAILABLE_MEDIGAP_ROW_FILTERS,
    );

    const emptyHmo = filterPlansForScope(
      fullCatalogPlanDetails({ year: 2026, medications: [] }),
      "hmo",
      top,
      "member",
      areaPlanDetails({ ...base, county: "Wrong Parish" }),
    );
    expect(emptyHmo).toHaveLength(0);
    expect(
      visiblePlanSubfilters(MA_ROW_FILTERS, { ...row1, hmo: 0, ppo: 0 }),
    ).toEqual(MA_ROW_FILTERS);
    expect(
      visiblePlanSubfilters(MA_ROW_FILTERS, { ...row1, hmo: 0, ppo: 0 }, true).map((f) => f.id),
    ).not.toContain("hmo");
    expect(
      visiblePlanSubfilters(MA_ROW_FILTERS, { ...row1, hmo: 0, ppo: 0 }, true).map((f) => f.id),
    ).not.toContain("ppo");
  });

  it("Highly Rated count is parish-scoped but excluded from row-1 header (ZIP 705 Evangeline)", () => {
    const memberInput = {
      year: 2026 as const,
      zip3: "705",
      county: "Evangeline Parish",
      medications: [] as Medication[],
    };
    const fullCatalogInput = { year: 2026 as const, medications: [] as Medication[] };
    const memberPlans = areaPlanDetails(memberInput);
    const fullCatalogPlans = fullCatalogPlanDetails(fullCatalogInput);
    const top = rankedPlanDetails(memberInput);
    const row1 = myAvailableRowFilterCounts(memberPlans, top);
    const row2 = fullCatalogPlanFilterCounts(fullCatalogPlans, top);

    expect(row1["highly-rated"]).toBeGreaterThan(0);
    expect(row1["highly-rated"]).toBeLessThan(row2["highly-rated"]);
    expect(MY_AVAILABLE_ROW_HEADER_FILTERS.map((f) => f.id)).not.toContain("highly-rated");
    expect(visiblePlanSubfilters(ALL_PLANS_ROW_HEADER_FILTERS, row2)).toEqual(
      ALL_PLANS_ROW_HEADER_FILTERS,
    );
    expect(
      filterPlansForScope(fullCatalogPlans, "highly-rated", top, "member", memberPlans).length,
    ).toBe(row1["highly-rated"]);
  });

  it("full national catalog is larger than member parish catalog for multi-county ZIP 705", () => {
    const memberInput = {
      year: 2026 as const,
      zip3: "705",
      county: "Evangeline Parish",
      medications: [] as Medication[],
    };
    const memberPlans = areaPlanDetails(memberInput);
    const fullCatalogPlans = fullCatalogPlanDetails({
      year: 2026,
      medications: [],
    });
    const top = rankedPlanDetails(memberInput);
    const row1 = myAvailableRowFilterCounts(memberPlans, top);
    const row2 = fullCatalogPlanFilterCounts(fullCatalogPlans, top);

    expect(fullCatalogPlans.length).toBeGreaterThan(memberPlans.length);
    expect(row2.all).toBeGreaterThan(row1.all);
    expect(row2["medicare-advantage"]).toBeGreaterThan(row1["medicare-advantage"]);
    expect(shouldShowAllPlansRow(row1, row2)).toBe(true);
  });
});

describe("shouldShowAllPlansRow", () => {
  it("shows row 2 when national catalog is non-empty (ZIP 705)", () => {
    const memberInput = {
      year: 2026 as const,
      zip3: "705",
      county: "Evangeline Parish",
      medications: [] as Medication[],
    };
    const memberPlans = areaPlanDetails(memberInput);
    const fullCatalogPlans = fullCatalogPlanDetails({ year: 2026, medications: [] });
    const top = rankedPlanDetails(memberInput);
    const row1 = myAvailableRowFilterCounts(memberPlans, top);
    const row2 = fullCatalogPlanFilterCounts(fullCatalogPlans, top);

    expect(fullCatalogPlans.length).toBeGreaterThan(0);
    expect(row1["medicare-advantage"]).toBeLessThan(row2["medicare-advantage"]);
    expect(shouldShowAllPlansRow(row1, row2)).toBe(true);
    expect(row1["medicare-advantage"]).toBeGreaterThan(0);
    expect(row1["medicare-supplement"]).toBeGreaterThan(0);
    expect(row1["medicare-part-d"]).toBeGreaterThan(0);
  });

  it("single-county ZIP 331 — row 1 open MA type counts are below row 2 national", () => {
    const input = {
      year: 2026 as const,
      zip3: "331",
      county: "Miami-Dade, FL",
      medications: [] as Medication[],
    };
    const memberPlans = areaPlanDetails(input);
    const fullCatalogPlans = fullCatalogPlanDetails({ year: 2026, medications: [] });
    const top = rankedPlanDetails(input);
    const row1 = myAvailableRowFilterCounts(memberPlans, top);
    const row2 = fullCatalogPlanFilterCounts(fullCatalogPlans, top);

    expect(memberPlans.length).toBeLessThan(fullCatalogPlans.length);
    expect(row1["medicare-advantage"]).toBeLessThan(row2["medicare-advantage"]);
    expect(row1.hmo).toBeLessThan(row2.hmo);
    expect(row1.ppo).toBeLessThan(row2.ppo);
    expect(row1["hmo-pos"]).toBeLessThan(row2["hmo-pos"]);
    expect(row1.pffs).toBeLessThan(row2.pffs);
    expect(row1.msa).toBeLessThan(row2.msa);
    expect(row1["medicare-supplement"]).toBeLessThan(row2["medicare-supplement"]);
    expect(row1["medicare-part-d"]).toBeLessThan(row2["medicare-part-d"]);
    expect(shouldShowAllPlansRow(row1, row2)).toBe(true);
    expect(visiblePlanSubfilters(MA_ROW_FILTERS, row1)).toEqual(MA_ROW_FILTERS);
    expect(visiblePlanSubfilters(MY_AVAILABLE_MEDIGAP_ROW_FILTERS, row1)).toEqual(
      MY_AVAILABLE_MEDIGAP_ROW_FILTERS,
    );
    expect(visiblePlanSubfilters(ALL_PLANS_MEDIGAP_ROW_FILTERS, row2)).toEqual(
      ALL_PLANS_MEDIGAP_ROW_FILTERS,
    );
  });

  it("returns true for any non-empty national catalog counts", () => {
    const myAvailableCounts = {
      all: 40,
      "my-available": 10,
      "medicare-advantage": 12,
      "medicare-supplement": 10,
      "medicare-part-d": 18,
      hmo: 6,
      ppo: 6,
      "highly-rated": 20,
    } as Record<import("../plan-filters").PlanFilterId, number>;
    const fullCounts = {
      ...myAvailableCounts,
      all: 55,
      "medicare-advantage": 25,
      hmo: 12,
      ppo: 13,
      "highly-rated": 30,
    };

    expect(shouldShowAllPlansRow(myAvailableCounts, fullCounts)).toBe(true);
  });

  it("returns false only when national catalog is empty", () => {
    const emptyCounts = {
      all: 0,
      "my-available": 10,
      "medicare-advantage": 0,
      "medicare-supplement": 0,
      "medicare-part-d": 0,
      hmo: 0,
      ppo: 0,
      "highly-rated": 0,
    } as Record<import("../plan-filters").PlanFilterId, number>;

    expect(shouldShowAllPlansRow(emptyCounts, emptyCounts)).toBe(false);
  });
});

describe("all plans sort order", () => {
  const input = {
    year: 2026 as const,
    zip3: "331",
    county: "Miami-Dade, FL",
    medications: [] as Medication[],
  };

  function expectTop10FirstThenFitSorted(
    sorted: ReturnType<typeof areaPlanDetails>,
    top10: ReturnType<typeof rankedPlanDetails>,
    costPreference: "minimize_monthly" | "predictability" = "predictability",
  ): void {
    const topKeys = top10.map(planDetailKey);
    expect(sorted.slice(0, top10.length).map(planDetailKey)).toEqual(topKeys);
    for (let i = top10.length + 1; i < sorted.length; i++) {
      expect(
        comparePlansByFitThenRating(sorted[i - 1]!, sorted[i]!, costPreference),
      ).toBeLessThanOrEqual(0);
    }
  }

  it("puts Top 10 first in rank order for My Available All Plans", () => {
    const memberPlans = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const sorted = filterPlansForScope(memberPlans, "all", top, "member", memberPlans);
    expect(sorted.length).toBe(memberPlans.length);
    expectTop10FirstThenFitSorted(sorted, top);
    expect(sorted.slice(0, 10).map((p) => p.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("puts national Top 10 first for area-scope All Plans catalog", () => {
    const fullCatalogPlans = fullCatalogPlanDetails({ year: input.year, medications: input.medications });
    const memberPlans = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const nationalTop10 = nationalRankedPlanDetails({
      year: input.year,
      medications: input.medications,
    });
    const sorted = filterPlansForScope(fullCatalogPlans, "all", top, "area", memberPlans);
    expect(sorted.length).toBe(fullCatalogPlans.length);
    expect(sorted.length).toBeGreaterThan(memberPlans.length);
    expectTop10FirstThenFitSorted(sorted, nationalTop10);
  });

  it("uses monthly cost as primary fit for plans after Top 10 when member prefers minimize_monthly", () => {
    const memberPlans = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const sorted = filterPlansForScope(
      memberPlans,
      "all",
      top,
      "member",
      memberPlans,
      "minimize_monthly",
    );
    expectTop10FirstThenFitSorted(sorted, top, "minimize_monthly");
  });

  it("keeps category filters sorted by estimated annual cost", () => {
    const memberPlans = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const hmoPlans = filterPlansForScope(memberPlans, "hmo", top, "member", memberPlans);
    for (let i = 1; i < hmoPlans.length; i++) {
      expect(hmoPlans[i - 1]!.annual).toBeLessThanOrEqual(hmoPlans[i]!.annual);
    }
  });

  it("documents fit-first sort in All Plans rankings meta", () => {
    const meta = planFilterRankingsMeta("all", 42);
    expect(meta.subtitle).toMatch(/fit/i);
    expect(meta.subtitle).toMatch(/star rating/i);
  });

  it("uses national CMS language for area-scope my-available Top 10", () => {
    const meta = planFilterRankingsMeta("my-available", 10, "area");
    expect(meta.subtitle).toMatch(/national CMS catalog/i);
    expect(meta.subtitle).not.toMatch(/your coverage area/i);
  });

  it("keeps regional language for my-available Top 10 (member scope)", () => {
    const meta = planFilterRankingsMeta("my-available", 10, "member");
    expect(meta.subtitle).toMatch(/best-match/i);
    expect(meta.subtitle).not.toMatch(/national CMS catalog/i);
  });

  it("documents highly rated criteria and Top 10 methodology for UI copy", () => {
    expect(highlyRatedCriteriaSentence()).toMatch(/4\.5\+/);
    expect(highlyRatedCriteriaSentence()).toMatch(/Medigap/);
    expect(top10RankingsMethodologySentence("member")).toMatch(/medications/i);
    expect(top10RankingsMethodologySentence("member")).toMatch(/star/i);
    expect(top10RankingsMethodologySentence("area")).toMatch(/national CMS catalog/i);
  });
});

describe("highly-rated plan filter", () => {
  const input = {
    year: 2026 as const,
    zip3: "331",
    county: "Miami-Dade, FL",
    medications: [] as Medication[],
  };

  it("includes CMS-rated MA and Part D plus Medigap with 4.0+ modeled stars", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const highlyRated = filterAreaPlans(all, "highly-rated", top);

    expect(highlyRated.length).toBeGreaterThan(0);
    expect(highlyRated.length).toBeLessThan(all.length);
    expect(countHighlyRatedPlans(all, top)).toBe(highlyRated.length);

    for (const plan of highlyRated) {
      expect(isHighlyRatedPlan(plan)).toBe(true);
      expect(parseFloat(plan.stars)).toBeGreaterThanOrEqual(HIGHLY_RATED_MIN_STARS);
    }

    const medigapInPool = highlyRated.filter((p) => /medigap|supplement/i.test(p.planType));
    expect(medigapInPool.length).toBeGreaterThan(0);
    for (const plan of medigapInPool) {
      expect(isHighlyRatedMedigapPlan(plan)).toBe(true);
      expect(planHasCmsStarRating(plan)).toBe(false);
    }
  });

  it("includes Medigap plans with 4.0+ synthetic quality scores", () => {
    const all = areaPlanDetails(input);
    const medigap = all.filter((p) => /medigap|supplement/i.test(p.planType));
    expect(medigap.length).toBeGreaterThan(0);
    for (const plan of medigap) {
      expect(parseFloat(plan.stars)).toBeGreaterThanOrEqual(HIGHLY_RATED_MIN_STARS);
      expect(isHighlyRatedPlan(plan)).toBe(true);
      expect(isHighlyRatedMedigapPlan(plan)).toBe(true);
    }
  });

  it("filter count matches planFilterCounts badge", () => {
    const all = areaPlanDetails(input);
    const top = rankedPlanDetails(input);
    const counts = planFilterCounts(all, top);
    const filtered = filterAreaPlans(all, "highly-rated", top);
    expect(counts["highly-rated"]).toBe(filtered.length);
  });

  it("documents Part D and Medigap scope in rankings subtitle", () => {
    const meta = planFilterRankingsMeta("highly-rated", 12);
    expect(meta.subtitle).toMatch(/Part D/);
    expect(meta.subtitle).toMatch(/Medigap/);
    expect(meta.subtitle).toMatch(/4\.0\+/);
  });

  it("exposes All, MA, Part D, and Medigap sub-tabs with partition counts", () => {
    const all = areaPlanDetails(input);
    expect(HIGHLY_RATED_SUBFILTERS.map((f) => f.label)).toEqual([
      "All",
      "Medicare Advantage",
      "Part D",
      "Medigap",
    ]);
    const tabCounts = highlyRatedSubTabCounts(all);
    expect(tabCounts.all).toBeGreaterThan(0);
    expect(tabCounts.all).toBe(
      tabCounts["medicare-advantage"] +
        tabCounts["medicare-part-d"] +
        tabCounts["medicare-supplement"],
    );
    expect(tabCounts["medicare-advantage"]).toBeGreaterThan(0);
    expect(tabCounts["medicare-supplement"]).toBeGreaterThan(0);
    // Part D highly-rated depends on CMS star ratings in the member's county (may be 0 locally).
    expect(tabCounts["medicare-part-d"]).toBeGreaterThanOrEqual(0);
    const allRated = filterHighlyRatedBySubTabRanked(all, "all");
    const partDOnly = filterHighlyRatedBySubTabRanked(all, "medicare-part-d");
    const medigapOnly = filterHighlyRatedBySubTabRanked(all, "medicare-supplement");
    expect(allRated.length).toBe(tabCounts.all);
    expect(allRated.length).toBeGreaterThan(3);
    expect(partDOnly.every((p) => /^Medicare Part D/i.test(p.planType))).toBe(true);
    expect(medigapOnly.every((p) => /medigap|supplement/i.test(p.planType))).toBe(true);
    expect(partDOnly.length + medigapOnly.length).toBeLessThanOrEqual(allRated.length);
    expect(partDOnly.length + medigapOnly.length).toBeLessThanOrEqual(
      filterAreaPlans(all, "highly-rated", rankedPlanDetails(input)).length,
    );
    const allMeta = highlyRatedSubTabRankingsMeta("all", allRated.length);
    expect(allMeta.title).toMatch(/^Highly rated plans/);
    const partDMeta = highlyRatedSubTabRankingsMeta("medicare-part-d", partDOnly.length);
    expect(partDMeta.title).toMatch(/Part D/);
    const medigapMeta = highlyRatedSubTabRankingsMeta("medicare-supplement", medigapOnly.length);
    expect(medigapMeta.title).toMatch(/Medigap/);
  });
});

function countHighlyRatedPlans(
  areaPlans: ReturnType<typeof areaPlanDetails>,
  myAvailablePlans: ReturnType<typeof rankedPlanDetails>,
) {
  return filterAreaPlans(areaPlans, "highly-rated", myAvailablePlans).length;
}

describe("planFilterWhySectionMeta", () => {
  it("uses top-pick language for my-available (member scope)", () => {
    const meta = planFilterWhySectionMeta("my-available");
    expect(meta.sectionHeading).toBe("");
    expect(meta.sectionBrief).toMatch(/top-ranked/i);
    expect(meta.sectionBrief).toMatch(/coverage area/i);
    expect(meta.topPickTitle).toBe("Top pick (#1)");
    expect(planFilterRunnersUpTitle(meta.runnersUpScope, 2)).toBe("Also ranked #2 and #3");
  });

  it("uses regional language for my-available (all scopes)", () => {
    const meta = planFilterWhySectionMeta("my-available", "area");
    expect(meta.sectionBrief).toMatch(/your coverage area/i);
    expect(meta.sectionBrief).not.toMatch(/national CMS catalog/i);
    expect(meta.topRankLabel).toBe("· Best match");
  });

  it("scopes runners-up heading to the active filter", () => {
    const hmo = planFilterWhySectionMeta("hmo");
    expect(hmo.sectionHeading).toBe("");
    expect(hmo.sectionBrief).toMatch(/HMO/i);
    expect(hmo.topPickTitle).toBe("Top HMO pick (#1)");
    expect(hmo.whyNumberOneTitle).toBe("Ranks #1 — HMO");
    expect(planFilterRunnersUpTitle(hmo.runnersUpScope, 2)).toBe(
      "Also ranked #2 and #3 among HMO plans",
    );
    expect(hmo.oneVsTwoTitle).toBe("Why This Plan Has Potential");

    const ppo = planFilterWhySectionMeta("ppo");
    expect(planFilterRunnersUpTitle(ppo.runnersUpScope, 1)).toBe("Also ranked #2 among PPO plans");

    const partD = planFilterWhySectionMeta("medicare-part-d");
    expect(partD.whyOverRunnersTitle).toBe("Why #1 over #2 and #3 — Part D");

    const highlyRated = planFilterWhySectionMeta("highly-rated");
    expect(highlyRated.sectionBrief).toMatch(/4\.0\+/);
    expect(highlyRated.sectionBrief).toMatch(/Medigap/);
    expect(highlyRated.sectionBrief).toMatch(/Part D/);
    expect(planFilterRunnersUpTitle(highlyRated.runnersUpScope, 2)).toBe(
      "Also ranked #2 and #3 among highly rated plans",
    );
  });

  it("builds collapsible titles with carrier and plan name", () => {
    const meta = planFilterWhySectionMeta("my-available");
    expect(
      planRankCollapsibleTitle(
        { rank: 1, carrier: "Humana", plan: "Gold Plus HMO" },
        meta,
      ),
    ).toBe("Top pick (#1) — Humana / Gold Plus HMO");
    expect(
      planRankCollapsibleTitle(
        { rank: 2, carrier: "Aetna", plan: "Medicare Eagle PPO" },
        meta,
      ),
    ).toBe("Also ranked #2 — Aetna / Medicare Eagle PPO");

    const hmo = planFilterWhySectionMeta("hmo");
    expect(
      planRankCollapsibleTitle(
        { rank: 3, carrier: "UnitedHealthcare", plan: "AARP HMO" },
        hmo,
      ),
    ).toBe("Also ranked #3 among HMO plans — UnitedHealthcare / AARP HMO");
  });
});

describe("planPanelEmbeddedHeading", () => {
  it("returns filter-specific titles for embedded Potential Options", () => {
    expect(planPanelEmbeddedHeading("why-this-plan", 3).title).toBe(POTENTIAL_TOP_3_LABEL);
    expect(planPanelEmbeddedHeading("why-this-plan", 3).subtitle).toMatch(
      /Medicare Advantage vs Medigap/,
    );
    expect(planPanelEmbeddedHeading("my-available", 10).title).toBe("Top 10 rankings");
    expect(planPanelEmbeddedHeading("my-available", 10, "area").subtitle).toMatch(
      /national CMS catalog/i,
    );
    expect(planPanelEmbeddedHeading("hmo", 5).title).toMatch(/^HMO plans/);
    expect(planPanelEmbeddedHeading("highly-rated", 4).title).toMatch(/^Highly rated plans/);
    expect(planPanelEmbeddedHeading("medicare-advantage", 12).title).toMatch(
      /^Medicare Advantage plans/,
    );
    expect(planPanelEmbeddedHeading(ZIP_COUNTY_REPORT_PANEL, 0).title).toMatch(
      /County plan inventory/,
    );
  });
});

describe("isZipCountyReportPanel", () => {
  it("identifies the county report panel id", () => {
    expect(isZipCountyReportPanel(ZIP_COUNTY_REPORT_PANEL)).toBe(true);
    expect(isZipCountyReportPanel("all")).toBe(false);
    expect(isPlanListPanel(ZIP_COUNTY_REPORT_PANEL)).toBe(false);
  });
});

describe("All Plans list type tabs", () => {
  it("exposes All, Medicare Advantage, Supplement, and Part D tab ids", () => {
    expect(ALL_PLANS_LIST_TABS.map((t) => t.id)).toEqual([
      "all",
      "medicare-advantage",
      "medicare-supplement",
      "medicare-part-d",
    ]);
    expect(ALL_PLANS_LIST_TABS.map((t) => t.label)).toEqual([
      "All",
      "Medicare Advantage",
      "Supplmnt",
      "Part D",
    ]);
  });

  it("adds Part B meds tab on All / My Available in-list category rows", () => {
    expect(ALL_PLANS_LIST_TABS_WITH_PART_B.map((t) => t.id)).toEqual([
      "all",
      "medicare-advantage",
      "medicare-supplement",
      "medicare-part-d",
      "part-b-meds",
    ]);
    expect(ALL_PLANS_LIST_TABS_WITH_PART_B.at(-1)?.label).toBe("Part B meds");
    expect(planListCategoryTabsForPanel("all", "area").map((t) => t.id)).toContain("part-b-meds");
    expect(planListCategoryTabsForPanel("my-available", "member")).toEqual([]);
    expect(shouldShowPlanListCategoryTabs("my-available", "area")).toBe(false);
    expect(planListCategoryTabsForPanel("medicare-part-d", "area").map((t) => t.id)).not.toContain(
      "part-b-meds",
    );
  });

  it("partitions the national All Plans catalog by type with reconciling counts", () => {
    const input = {
      year: 2026 as const,
      zip3: "705",
      county: "Evangeline, LA",
      medications: [] as Medication[],
    };
    const fullCatalogPlans = fullCatalogPlanDetails({ year: input.year, medications: input.medications });
    const top = rankedPlanDetails(input);
    const allPlans = filterPlansForScope(fullCatalogPlans, "all", top, "area", areaPlanDetails(input));
    expect(allPlans.length).toBe(fullCatalogPlans.length);
    const tabCounts = allPlansListTabCounts(allPlans);
    expect(tabCounts.all).toBeGreaterThan(0);
    expect(tabCounts.all).toBe(
      tabCounts["medicare-advantage"] +
        tabCounts["medicare-part-d"] +
        tabCounts["medicare-supplement"],
    );
    const maOnly = filterAllPlansByListTabRanked(allPlans, "medicare-advantage");
    const supplementOnly = filterAllPlansByListTabRanked(allPlans, "medicare-supplement");
    const partDOnly = filterAllPlansByListTabRanked(allPlans, "medicare-part-d");
    const partBOnly = filterAllPlansByListTabRanked(allPlans, "part-b-meds");
    expect(maOnly.length).toBe(tabCounts["medicare-advantage"]);
    expect(supplementOnly.length).toBe(tabCounts["medicare-supplement"]);
    expect(partDOnly.length).toBe(tabCounts["medicare-part-d"]);
    expect(partBOnly.length).toBe(tabCounts["part-b-meds"]);
    expect(tabCounts["part-b-meds"]).toBe(
      tabCounts["medicare-advantage"] + tabCounts["medicare-supplement"],
    );
    expect(maOnly.every((p) => /medicare advantage/i.test(p.planType))).toBe(true);
    expect(supplementOnly.every((p) => /medigap|supplement/i.test(p.planType))).toBe(true);
    expect(partDOnly.every((p) => /^Medicare Part D/i.test(p.planType))).toBe(true);
    expect(partBOnly.every((p) => isMedicareAdvantagePlan(p) || isMedigapPlan(p))).toBe(true);
    expect(partBOnly.some((p) => isStandalonePartDPlan(p))).toBe(false);
    const allMeta = allPlansListTabRankingsMeta("all", tabCounts.all);
    expect(allMeta.title).toMatch(/^All plans/);
    expect(allMeta.subtitle).toMatch(/national CMS catalog/i);
    const maMeta = allPlansListTabRankingsMeta("medicare-advantage", maOnly.length);
    expect(maMeta.title).toMatch(/Medicare Advantage/);
    const partBMeta = partBMedTabRankingsMeta(partBOnly.length, "area");
    expect(partBMeta.title).toMatch(/Part B medication coverage/);
    expect(partBMeta.subtitle).toMatch(/Medicare Advantage and Medigap/);
  });
});

describe("Medicare Advantage list category tabs", () => {
  const input = {
    year: 2026 as const,
    zip3: "705",
    county: "Evangeline, LA",
    medications: [] as Medication[],
  };

  it("exposes MA sub-type tabs for the medicare-advantage panel", () => {
    expect(planListCategoryTabsForPanel("medicare-advantage", "area").map((t) => t.id)).toEqual(
      MA_ROW_FILTERS.map((f) => f.id),
    );
    expect(defaultPlanListCategoryTab("medicare-advantage")).toBe("medicare-advantage");
    expect(shouldShowPlanListCategoryTabs("medicare-advantage", "member")).toBe(true);
    expect(shouldShowPlanListCategoryTabs("medicare-advantage", "area")).toBe(true);
    expect(shouldShowPlanListCategoryTabs("hmo", "member")).toBe(false);
  });

  it("partitions MA catalog by network/type with reconciling counts", () => {
    const fullCatalogPlans = fullCatalogPlanDetails({ year: input.year, medications: input.medications });
    const top = rankedPlanDetails(input);
    const memberPlans = areaPlanDetails(input);
    const maPlans = filterPlansForScope(
      fullCatalogPlans,
      "medicare-advantage",
      top,
      "area",
      memberPlans,
    );
    const tabCounts = planListCategoryTabCounts(maPlans, "medicare-advantage", top);
    expect(tabCounts["medicare-advantage"]).toBe(maPlans.length);
    expect(
      MA_ROW_FILTERS.filter((f) => f.id !== "medicare-advantage").reduce(
        (sum, f) => sum + tabCounts[f.id],
        0,
      ),
    ).toBe(maPlans.length);
    const hmoOnly = filterPlansByListCategoryTabRanked(maPlans, "medicare-advantage", "hmo", top);
    expect(hmoOnly.length).toBe(tabCounts.hmo);
    expect(
      hmoOnly.every(
        (p) =>
          (/\bHMO\b/i.test(p.planType) && !/HMO-POS/i.test(p.planType)) ||
          /\(Cost\)/i.test(p.planType),
      ),
    ).toBe(true);
    const meta = planListCategoryTabRankingsMeta("medicare-advantage", "hmo", hmoOnly.length, "area");
    expect(meta.title).toMatch(/^HMO plans/);
    expect(meta.subtitle).toMatch(/national CMS catalog/i);
  });
});

describe("All Plans category Top 3 / Top 10 filters", () => {
  const input = {
    year: 2026 as const,
    zip3: "331",
    county: "Miami-Dade, FL",
    medications: [] as Medication[],
  };

  it("identifies category top filters and maps to base category + limit", () => {
    expect(isAllPlansCategoryTopFilter("medicare-supplement-top-3")).toBe(true);
    expect(isAllPlansCategoryTopFilter("medicare-part-d-top-10")).toBe(true);
    expect(isAllPlansCategoryTopFilter("medicare-supplement")).toBe(false);
    expect(allPlansCategoryTopFilterMeta("medicare-supplement-top-3")).toEqual({
      baseFilter: "medicare-supplement",
      limit: 3,
    });
    expect(allPlansCategoryTopFilterMeta("medicare-part-d-top-10")).toEqual({
      baseFilter: "medicare-part-d",
      limit: 10,
    });
  });

  it("area-scope Medigap Top 3 returns lowest-cost supplements from national catalog", () => {
    const fullCatalogPlans = fullCatalogPlanDetails({ year: 2026, medications: [] });
    const top = rankedPlanDetails(input);
    const memberPlans = areaPlanDetails(input);
    const allSupp = filterPlansForScope(
      fullCatalogPlans,
      "medicare-supplement",
      top,
      "area",
      memberPlans,
    );
    const top3 = filterPlansForScope(
      fullCatalogPlans,
      "medicare-supplement-top-3",
      top,
      "area",
      memberPlans,
    );

    expect(top3).toHaveLength(3);
    expect(top3.map((p) => planDetailKey(p))).toEqual(
      allSupp.slice(0, 3).map((p) => planDetailKey(p)),
    );
    expect(top3.every((p) => /medigap|supplement/i.test(p.planType))).toBe(true);
    for (let i = 1; i < top3.length; i++) {
      expect(top3[i]!.annual).toBeGreaterThanOrEqual(top3[i - 1]!.annual);
    }
  });

  it("area-scope Part D Top 10 returns lowest-cost PDP plans from national catalog", () => {
    const fullCatalogPlans = fullCatalogPlanDetails({ year: 2026, medications: [] });
    const top = rankedPlanDetails(input);
    const memberPlans = areaPlanDetails(input);
    const allPartD = filterPlansForScope(
      fullCatalogPlans,
      "medicare-part-d",
      top,
      "area",
      memberPlans,
    );
    const top10 = filterPlansForScope(
      fullCatalogPlans,
      "medicare-part-d-top-10",
      top,
      "area",
      memberPlans,
    );

    expect(top10).toHaveLength(10);
    expect(top10.map((p) => planDetailKey(p))).toEqual(
      allPartD.slice(0, 10).map((p) => planDetailKey(p)),
    );
    expect(top10.every((p) => /^Medicare Part D/i.test(p.planType))).toBe(true);
  });

  it("category top filters omit in-list category tabs and use correct drug display context", () => {
    expect(shouldShowPlanListCategoryTabs("medicare-supplement-top-3", "area")).toBe(false);
    expect(planDrugDisplayContextForPanel("medicare-supplement-top-3")).toBe("medigap");
    expect(planDrugDisplayContextForPanel("medicare-part-d-top-10")).toBe("part-d");
    expect(isAreaCatalogListPanel("medicare-supplement-top-3", "area")).toBe(true);
  });

  it("category top filter counts cap at limit", () => {
    const fullCatalogPlans = fullCatalogPlanDetails({ year: 2026, medications: [] });
    const top = rankedPlanDetails(input);
    expect(countPlansForFilter(fullCatalogPlans, "medicare-supplement-top-3", top)).toBe(3);
    expect(countPlansForFilter(fullCatalogPlans, "medicare-part-d-top-10", top)).toBe(10);
  });

  it("category top filters still return plans when regional top-10 pool is empty", () => {
    const fullCatalogPlans = fullCatalogPlanDetails({ year: 2026, medications: [] });
    const memberPlans = areaPlanDetails(input);
    const emptyTop: ReturnType<typeof rankedPlanDetails> = [];
    const top10 = filterPlansForScope(
      fullCatalogPlans,
      "medicare-part-d-top-10",
      emptyTop,
      "area",
      memberPlans,
    );
    expect(top10).toHaveLength(10);
    expect(top10.every((p) => /^Medicare Part D/i.test(p.planType))).toBe(true);
  });

  it("category top filter ids do not match every plan in filterAreaPlans", () => {
    const fullCatalogPlans = fullCatalogPlanDetails({ year: 2026, medications: [] });
    expect(filterAreaPlans(fullCatalogPlans, "medicare-supplement-top-10", []).length).toBe(0);
    expect(filterAreaPlans(fullCatalogPlans, "medicare-part-d-top-10", []).length).toBe(0);
  });

  it("category top rankings meta uses national CMS language", () => {
    const meta = planFilterRankingsMeta("medicare-supplement-top-3", 3, "area");
    expect(meta.title).toMatch(/Top 3 Medicare Supplement/i);
    expect(meta.subtitle).toMatch(/national CMS catalog/i);
  });

  it("identifies category highly rated filters and maps to base category", () => {
    expect(isAllPlansCategoryHighlyRatedFilter("medicare-supplement-highly-rated")).toBe(true);
    expect(isAllPlansCategoryHighlyRatedFilter("medicare-part-d-highly-rated")).toBe(true);
    expect(isAllPlansCategoryHighlyRatedFilter("medicare-supplement-top-3")).toBe(false);
    expect(allPlansCategoryHighlyRatedFilterMeta("medicare-supplement-highly-rated")).toEqual({
      baseFilter: "medicare-supplement",
    });
    expect(allPlansCategoryHighlyRatedFilterMeta("medicare-part-d-highly-rated")).toEqual({
      baseFilter: "medicare-part-d",
    });
  });

  it("area-scope Medigap 4.5+ returns highly rated supplements from national catalog", () => {
    const fullCatalogPlans = fullCatalogPlanDetails({ year: 2026, medications: [] });
    const top = rankedPlanDetails(input);
    const memberPlans = areaPlanDetails(input);
    const ratedSupp = filterPlansForScope(
      fullCatalogPlans,
      "medicare-supplement-highly-rated",
      top,
      "area",
      memberPlans,
    );

    expect(ratedSupp.length).toBeGreaterThan(0);
    expect(ratedSupp.every(isHighlyRatedMedigapPlan)).toBe(true);
    expect(ratedSupp.every((p) => /medigap|supplement/i.test(p.planType))).toBe(true);
    for (const plan of ratedSupp) {
      expect(parseFloat(plan.stars)).toBeGreaterThanOrEqual(HIGHLY_RATED_MIN_STARS);
    }
  });

  it("area-scope Part D 4.5+ returns highly rated PDP plans from national catalog", () => {
    const fullCatalogPlans = fullCatalogPlanDetails({ year: 2026, medications: [] });
    const top = rankedPlanDetails(input);
    const memberPlans = areaPlanDetails(input);
    const ratedPartD = filterPlansForScope(
      fullCatalogPlans,
      "medicare-part-d-highly-rated",
      top,
      "area",
      memberPlans,
    );

    expect(ratedPartD.every((p) => /^Medicare Part D/i.test(p.planType))).toBe(true);
    expect(ratedPartD.every(isHighlyRatedPlan)).toBe(true);
    for (const plan of ratedPartD) {
      expect(parseFloat(plan.stars)).toBeGreaterThanOrEqual(HIGHLY_RATED_MIN_STARS);
    }
    expect(countPlansForFilter(fullCatalogPlans, "medicare-part-d-highly-rated", top)).toBe(
      ratedPartD.length,
    );
    // Part D 4.5+ depends on CMS star ratings in the catalog (may be 0 in modeled data).
    expect(ratedPartD.length).toBeGreaterThanOrEqual(0);
  });

  it("category highly rated filters omit in-list tabs and use correct drug display context", () => {
    expect(shouldShowPlanListCategoryTabs("medicare-supplement-highly-rated", "area")).toBe(false);
    expect(planDrugDisplayContextForPanel("medicare-supplement-highly-rated")).toBe("medigap");
    expect(planDrugDisplayContextForPanel("medicare-part-d-highly-rated")).toBe("part-d");
    expect(isAreaCatalogListPanel("medicare-part-d-highly-rated", "area")).toBe(true);
    expect(isAllPlansCategoryScopedFilter("medicare-part-d-highly-rated")).toBe(true);
  });
});

describe("plan panel display mode", () => {
  it("area-row All Plans uses catalog list, not top-3 rationale", () => {
    expect(shouldShowPlanWhySection("all", "area")).toBe(false);
    expect(isAreaCatalogListPanel("all", "area")).toBe(true);
  });

  it("Highly Rated on All Plans row returns the full rated catalog, not top 3", () => {
    expect(shouldShowPlanWhySection("highly-rated", "area")).toBe(false);
    expect(isAreaCatalogListPanel("highly-rated", "area")).toBe(true);

    const input = {
      year: 2026 as const,
      zip3: "705",
      county: "Evangeline, LA",
      medications: [] as Medication[],
    };
    const fullCatalogPlans = fullCatalogPlanDetails({ year: input.year, medications: input.medications });
    const top = rankedPlanDetails(input);
    const highlyRated = filterPlansForScope(fullCatalogPlans, "highly-rated", top, "area");
    expect(highlyRated.length).toBeGreaterThan(3);
    expect(filterHighlyRatedBySubTabRanked(highlyRated, "all").length).toBe(highlyRated.length);
    expect(plansForRankingsTable(highlyRated, "highly-rated").length).toBe(highlyRated.length);
  });

  it("member-row category filters use plan list, not top-3 rationale", () => {
    expect(shouldShowPlanWhySection("hmo", "member")).toBe(false);
    expect(isAreaCatalogListPanel("hmo", "member")).toBe(false);
  });

  it("Potential Top 3 panel always shows rationale", () => {
    expect(shouldShowPlanWhySection("why-this-plan", "member")).toBe(true);
    expect(shouldShowPlanWhySection("why-this-plan", "area")).toBe(true);
    expect(isAreaCatalogListPanel("why-this-plan", "area")).toBe(false);
    const meta = planFilterWhySectionMetaForPanel("why-this-plan", "my-available");
    expect(meta.sectionBrief).toMatch(/Medicare Advantage vs Medigap supplement/);
  });

  it("filterPlansForScope all + area returns full national CMS catalog", () => {
    const input = {
      year: 2026 as const,
      zip3: "705",
      county: "Evangeline, LA",
      medications: [] as Medication[],
    };
    const fullCatalogPlans = fullCatalogPlanDetails({ year: input.year, medications: input.medications });
    const top = rankedPlanDetails(input);
    const memberPlans = areaPlanDetails(input);
    const filtered = filterPlansForScope(fullCatalogPlans, "all", top, "area", memberPlans);
    expect(filtered.length).toBe(fullCatalogPlans.length);
    expect(filtered.length).toBeGreaterThan(memberPlans.length);
    expect(filtered.length).toBeGreaterThan(top.length);
  });
});

describe("member eligibility plan exclusions (D-SNP)", () => {
  const input = { year: 2026 as const, zip3: "705", county: "Evangeline Parish", medications: [] as Medication[] };

  it("shouldExcludeDSnpPlans is true for mid/high income bands", () => {
    expect(shouldExcludeDSnpPlans("$55k–$75k")).toBe(true);
    expect(shouldExcludeDSnpPlans("Over $115k")).toBe(true);
    expect(shouldExcludeDSnpPlans("Under $15k")).toBe(false);
    expect(shouldExcludeDSnpPlans("Prefer not to say")).toBe(false);
  });

  it("applyMemberEligibilityPlanExclusions removes D-SNP when income is above poverty", () => {
    const member = areaPlanDetails(input);
    const dsnpBefore = member.filter(isDSnpPlan);
    expect(dsnpBefore.length).toBeGreaterThan(0);
    const filtered = applyMemberEligibilityPlanExclusions(member, "$55k–$75k");
    expect(filtered.filter(isDSnpPlan)).toHaveLength(0);
    expect(filtered.length).toBeLessThan(member.length);
  });

  it("maRowFiltersForEligibility omits d-snp filter when excluded", () => {
    const allFilters = maRowFiltersForEligibility("Under $15k");
    expect(allFilters.some((f) => f.id === "d-snp")).toBe(true);
    const highIncome = maRowFiltersForEligibility("$55k–$75k");
    expect(highIncome.some((f) => f.id === "d-snp")).toBe(false);
    expect(highIncome.length).toBe(MA_ROW_FILTERS.length - 1);
  });

  it("planListCategoryTabsForPanel respects income-based MA filter row", () => {
    const low = planListCategoryTabsForPanel("medicare-advantage", "member", "Under $15k");
    expect(low.some((t) => t.id === "d-snp")).toBe(true);
    const high = planListCategoryTabsForPanel("medicare-advantage", "member", "$75k–$95k");
    expect(high.some((t) => t.id === "d-snp")).toBe(false);
    const areaHigh = planListCategoryTabsForPanel("medicare-advantage", "area", "$75k–$95k");
    expect(areaHigh.some((t) => t.id === "d-snp")).toBe(true);
    expect(areaHigh.map((t) => t.id)).toEqual(MA_ROW_FILTERS.map((f) => f.id));
  });

  it("full catalog All Plans counts include D-SNP regardless of income band", () => {
    const input = { year: 2026 as const, zip3: "705", county: "Evangeline Parish", medications: [] as Medication[] };
    const fullCatalogInput = { year: 2026 as const, medications: [] as Medication[] };
    const fullCatalog = fullCatalogPlanDetails(fullCatalogInput);
    const memberRaw = areaPlanDetails(input);
    const topRaw = rankedPlanDetails(input);
    const highIncome = "$55k–$75k";

    const memberFiltered = applyMemberEligibilityPlanExclusions(memberRaw, highIncome);
    const topFiltered = applyMemberEligibilityPlanExclusions(topRaw, highIncome);
    const areaCounts = fullCatalogPlanFilterCounts(fullCatalog, topFiltered);
    const memberCounts = myAvailableRowFilterCounts(memberFiltered, topFiltered);

    expect(fullCatalog.filter(isDSnpPlan).length).toBeGreaterThan(0);
    expect(areaCounts.all).toBe(fullCatalog.length);
    expect(areaCounts.all).toBeGreaterThan(memberCounts.all);
    expect(memberFiltered.filter(isDSnpPlan)).toHaveLength(0);
  });
});

describe("I-SNP plan type filter", () => {
  const fullCatalogInput = { year: 2026 as const, medications: [] as Medication[] };

  it("classifies institutional SNP plans and exposes i-snp filter on All Plans row", () => {
    const fullCatalog = fullCatalogPlanDetails(fullCatalogInput);
    const isnp = fullCatalog.filter(isISnpPlan);
    expect(isnp.length).toBeGreaterThan(0);
    expect(isnp.every((p) => /I-SNP/i.test(p.planType))).toBe(true);

    const counts = planFilterCounts(fullCatalog, []);
    expect(counts["i-snp"]).toBe(isnp.length);
    expect(MA_ROW_FILTERS.some((f) => f.id === "i-snp")).toBe(true);
    expect(filterAreaPlans(fullCatalog, "i-snp", []).length).toBe(isnp.length);
  });

  it("does not double-count I-SNP under PPO or HMO buckets", () => {
    const fullCatalog = fullCatalogPlanDetails(fullCatalogInput);
    const ppoOverlap = filterAreaPlans(fullCatalog, "ppo", []).filter(isISnpPlan);
    const hmoOverlap = filterAreaPlans(fullCatalog, "hmo", []).filter(isISnpPlan);
    expect(ppoOverlap).toHaveLength(0);
    expect(hmoOverlap).toHaveLength(0);
    expect(maTypePartitionReconciles(planFilterCounts(fullCatalog, []))).toBe(true);
  });

  it("shows I-SNP in All Plans MA row and in-list tabs when i-snp panel is active", () => {
    const areaTabs = planListCategoryTabsForPanel("i-snp", "area", undefined, true);
    expect(areaTabs.some((t) => t.id === "i-snp")).toBe(true);
    expect(maRowFiltersForCatalogDisplay({ scope: "area", canAccessISnp: true }).some(
      (f) => f.id === "i-snp",
    )).toBe(true);
    expect(
      maRowFiltersForCatalogDisplay({ scope: "area", canAccessISnp: false }).some(
        (f) => f.id === "i-snp",
      ),
    ).toBe(false);
    expect(defaultPlanListCategoryTab("i-snp")).toBe("i-snp");
  });
});

describe("My Available I-SNP exclusions", () => {
  const fullCatalogInput = { year: 2026 as const, medications: [] as Medication[] };
  const memberInput = {
    year: 2026 as const,
    zip3: "705",
    county: "Evangeline Parish",
    medications: [] as Medication[],
  };

  it("applyMyAvailablePlanExclusions always removes I-SNP regardless of user role", () => {
    const fullCatalog = fullCatalogPlanDetails(fullCatalogInput);
    const isnpCount = fullCatalog.filter(isISnpPlan).length;
    expect(isnpCount).toBeGreaterThan(0);

    const filtered = applyMyAvailablePlanExclusions(fullCatalog);
    expect(filtered.filter(isISnpPlan)).toHaveLength(0);
    expect(filtered.length).toBe(fullCatalog.length - isnpCount);
  });

  it("My Available counts exclude I-SNP for all users", () => {
    const memberRaw = areaPlanDetails(memberInput);
    const topRaw = rankedPlanDetails(memberInput);

    const member = applyMyAvailablePlanExclusions(memberRaw);
    const top = applyMyAvailablePlanExclusions(topRaw);
    const counts = myAvailableRowFilterCounts(member, top);

    expect(counts["i-snp"]).toBe(0);
  });

  it("All Plans area counts still include I-SNP", () => {
    const fullCatalog = fullCatalogPlanDetails(fullCatalogInput);
    const topRaw = rankedPlanDetails(memberInput);
    const top = applyMyAvailablePlanExclusions(topRaw);
    const areaCounts = fullCatalogPlanFilterCounts(fullCatalog, top);

    expect(areaCounts["i-snp"]).toBe(fullCatalog.filter(isISnpPlan).length);
    expect(areaCounts["i-snp"]).toBeGreaterThan(0);
    expect(areaCounts.all).toBe(fullCatalog.length);
  });

  it("member MA filter row omits i-snp tab for all users", () => {
    const customerTabs = planListCategoryTabsForPanel("medicare-advantage", "member", undefined, false);
    expect(customerTabs.some((t) => t.id === "i-snp")).toBe(false);
    const agentTabs = planListCategoryTabsForPanel("medicare-advantage", "member", undefined, true);
    expect(agentTabs.some((t) => t.id === "i-snp")).toBe(false);
  });
});

describe("plan type helpers", () => {
  const input = { year: 2026 as const, zip3: "770", county: "Harris", medications: [] as Medication[] };
  const plans = areaPlanDetails(input);

  it("classifies MA, Medigap, and standalone Part D plans", () => {
    const ma = plans.find((p) => isMedicareAdvantagePlan(p));
    const medigap = plans.find((p) => isMedigapPlan(p));
    const pdp = plans.find((p) => isStandalonePartDPlan(p));
    expect(ma).toBeDefined();
    expect(medigap).toBeDefined();
    expect(pdp).toBeDefined();
    expect(isMedicareAdvantagePlan(ma!)).toBe(true);
    expect(isMedigapPlan(medigap!)).toBe(true);
    expect(isStandalonePartDPlan(pdp!)).toBe(true);
  });
});

describe("planDrugDisplayContextForPanel", () => {
  it("scopes list-header drug chrome to the active filter panel", () => {
    expect(planDrugDisplayContextForPanel("medicare-part-d")).toBe("part-d");
    expect(planDrugDisplayContextForPanel("medicare-supplement")).toBe("medigap");
    expect(planDrugDisplayContextForPanel("medigap")).toBe("medigap");
    expect(planDrugDisplayContextForPanel("medicare-advantage")).toBe("ma");
    expect(planDrugDisplayContextForPanel("hmo")).toBe("ma");
    expect(planDrugDisplayContextForPanel("highly-rated", "medicare-part-d")).toBe("part-d");
    expect(planDrugDisplayContextForPanel("highly-rated", "medicare-supplement")).toBe("medigap");
    expect(planDrugDisplayContextForPanel("highly-rated", "medicare-advantage")).toBe("ma");
    expect(planDrugDisplayContextForPanel("highly-rated", "all")).toBe("mixed");
    expect(planDrugDisplayContextForPanel("my-available")).toBe("mixed");
    expect(planDrugDisplayContextForPanel("my-available", "all", "part-b-meds")).toBe("part-b");
    expect(planDrugDisplayContextForPanel("all", "all", "part-b-meds")).toBe("part-b");
  });
});
