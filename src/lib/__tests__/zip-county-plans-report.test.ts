import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  applyZipCountyReportViewFilters,
  countiesForZip3ReportInput,
  countiesForZipCode,
  countyKeyForEntry,
  countyKeyForZip3County,
  filterZip3CountiesByKeys,
  filterZipCountyReportByCounties,
  filterZipCountyReportEntry,
  filterZipCountyReportPlans,
  groupPlansByCategory,
  hasZipCountyReportSelection,
  isCompleteZipCode,
  isCompleteZipInput,
  isCompleteZipInputForMode,
  narrowZip3CountiesByMatches,
  pickPrimaryZip5County,
  buildZipCountyPlansReport,
  normalizeZipCodeInput,
  pruneZipCountySelection,
  resolveCountiesForZipInput,
  zip3CountySelectOptions,
  zipCountyReportCountyOptions,
  zipCountyReportPlanFilterCounts,
  zipReportInputMode,
  type ZipCountyPlansEntry,
  type ZipCountyPlansReport,
} from "../zip-county-plans-report";
import type { PlanDetail } from "../plan-details";

vi.mock("../zip-county-lookup", () => ({
  lookupCountiesForZip: vi.fn(),
}));

import { lookupCountiesForZip } from "../zip-county-lookup";

const mockLookupCountiesForZip = vi.mocked(lookupCountiesForZip);

function sampleEntry(county: string, stateCode: string, plans: PlanDetail[]): ZipCountyPlansEntry {
  return {
    county: { county, stateCode },
    countyLabel: `${county}, ${stateCode}`,
    groups: groupPlansByCategory(plans),
    totalPlans: plans.length,
  };
}

function sampleReport(counties: ZipCountyPlansEntry[]): ZipCountyPlansReport {
  return {
    zipCode: "80202",
    zip3: "802",
    inputMode: "zip5",
    generatedAt: new Date().toISOString(),
    counties,
    totalPlans: counties.reduce((sum, entry) => sum + entry.totalPlans, 0),
  };
}

function samplePlan(overrides: Partial<PlanDetail> = {}): PlanDetail {
  return {
    rank: 1,
    carrier: "Test Carrier",
    plan: "Plan A",
    planType: "Medicare Advantage (HMO)",
    network: "HMO",
    premiumPartB: 185,
    premiumPlan: 0,
    premiumRx: 0,
    premiumDental: 0,
    premiumVision: 0,
    premiumExtras: 0,
    monthly: 185,
    annual: 2220,
    deductibleMed: 0,
    deductibleRx: 0,
    pcpCopay: "$0",
    specCopay: "$40",
    hospCopay: "$350/day",
    erCopay: "$120",
    moop: "$5,000",
    rxTier1: "$0",
    rxTier2: "$10",
    rxTier3: "$47",
    rxOOPCap: 2000,
    insulinCap: 35,
    dentalBenefit: "Included",
    visionBenefit: "Included",
    hearingBenefit: "Included",
    otcBenefit: "$50/qtr",
    stars: "4.0★",
    amBest: "A",
    extras: "Test",
    ...overrides,
  };
}

describe("normalizeZipCodeInput", () => {
  it("strips non-digits and caps at 5", () => {
    expect(normalizeZipCodeInput("80202")).toBe("80202");
    expect(normalizeZipCodeInput("80-202")).toBe("80202");
    expect(normalizeZipCodeInput("802021234")).toBe("80202");
  });
});

describe("isCompleteZipCode", () => {
  it("requires exactly 5 digits", () => {
    expect(isCompleteZipCode("80202")).toBe(true);
    expect(isCompleteZipCode("8020")).toBe(false);
    expect(isCompleteZipCode("802")).toBe(false);
    expect(isCompleteZipCode("")).toBe(false);
  });
});

describe("isCompleteZipInput", () => {
  it("accepts exactly 3 or 5 digits", () => {
    expect(isCompleteZipInput("802")).toBe(true);
    expect(isCompleteZipInput("80202")).toBe(true);
    expect(isCompleteZipInput("8020")).toBe(false);
    expect(isCompleteZipInput("80")).toBe(false);
    expect(isCompleteZipInput("")).toBe(false);
  });
});

describe("isCompleteZipInputForMode", () => {
  it("validates by explicit report mode", () => {
    expect(isCompleteZipInputForMode("802", "zip3")).toBe(true);
    expect(isCompleteZipInputForMode("80202", "zip3")).toBe(false);
    expect(isCompleteZipInputForMode("80202", "zip5")).toBe(true);
    expect(isCompleteZipInputForMode("802", "zip5")).toBe(false);
  });
});

describe("zipReportInputMode", () => {
  it("distinguishes zip3 from zip5 input", () => {
    expect(zipReportInputMode("802")).toBe("zip3");
    expect(zipReportInputMode("80202")).toBe("zip5");
    expect(zipReportInputMode("8020")).toBeNull();
  });
});

describe("countiesForZip3ReportInput", () => {
  it("returns prefix counties for a 3-digit input", () => {
    const counties = countiesForZip3ReportInput("802");
    expect(counties.length).toBe(3);
    expect(counties.some((c) => c.county === "Denver")).toBe(true);
  });

  it("returns [] for non-zip3 input", () => {
    expect(countiesForZip3ReportInput("80202")).toEqual([]);
  });
});

describe("pickPrimaryZip5County", () => {
  it("returns the first lookup match mapped to a prefix county", () => {
    const prefix = countiesForZipCode("802");
    expect(
      pickPrimaryZip5County(prefix, [{ county: "Denver County", stateCode: "CO" }]),
    ).toEqual([{ county: "Denver", stateCode: "CO" }]);
  });

  it("returns only one county when lookup spans multiple counties", () => {
    const prefix = countiesForZipCode("802");
    const picked = pickPrimaryZip5County(prefix, [
      { county: "Denver County", stateCode: "CO" },
      { county: "Adams County", stateCode: "CO" },
    ]);
    expect(picked).toEqual([{ county: "Denver", stateCode: "CO" }]);
  });

  it("returns [] when no lookup matches overlap the prefix list", () => {
    const prefix = countiesForZipCode("802");
    expect(
      pickPrimaryZip5County(prefix, [{ county: "Cook County", stateCode: "IL" }]),
    ).toEqual([]);
  });

  it("returns [] when lookup is empty", () => {
    expect(pickPrimaryZip5County(countiesForZipCode("802"), [])).toEqual([]);
  });
});

describe("narrowZip3CountiesByMatches", () => {
  it("delegates to pickPrimaryZip5County", () => {
    const prefix = countiesForZipCode("802");
    expect(
      narrowZip3CountiesByMatches(prefix, [{ county: "Denver County", stateCode: "CO" }]),
    ).toEqual([{ county: "Denver", stateCode: "CO" }]);
  });
});

describe("resolveCountiesForZipInput", () => {
  beforeEach(() => {
    mockLookupCountiesForZip.mockReset();
  });

  it("returns all prefix counties for zip3 input", async () => {
    const counties = await resolveCountiesForZipInput("802");
    expect(counties).toHaveLength(3);
    expect(mockLookupCountiesForZip).not.toHaveBeenCalled();
  });

  it("returns a single county for zip5 input via lookup", async () => {
    mockLookupCountiesForZip.mockResolvedValue([
      { county: "Denver County", state: "Colorado", stateCode: "CO" },
    ]);
    const counties = await resolveCountiesForZipInput("80202");
    expect(mockLookupCountiesForZip).toHaveBeenCalledWith("80202");
    expect(counties).toEqual([{ county: "Denver", stateCode: "CO" }]);
  });

  it("returns one county when lookup lists multiple matches", async () => {
    mockLookupCountiesForZip.mockResolvedValue([
      { county: "Denver County", state: "Colorado", stateCode: "CO" },
      { county: "Adams County", state: "Colorado", stateCode: "CO" },
    ]);
    const counties = await resolveCountiesForZipInput("80202");
    expect(counties).toHaveLength(1);
    expect(counties[0]?.county).toBe("Denver");
  });

  it("returns [] when lookup fails for zip5", async () => {
    mockLookupCountiesForZip.mockRejectedValue(new Error("network"));
    const counties = await resolveCountiesForZipInput("80202");
    expect(counties).toEqual([]);
  });

  it("returns [] when lookup finds no mappable county for zip5", async () => {
    mockLookupCountiesForZip.mockResolvedValue([
      { county: "Cook County", state: "Illinois", stateCode: "IL" },
    ]);
    const counties = await resolveCountiesForZipInput("80202");
    expect(counties).toEqual([]);
  });

  it("resolves 70805 to East Baton Rouge Parish only", async () => {
    mockLookupCountiesForZip.mockResolvedValue([
      {
        county: "East Baton Rouge Parish",
        state: "Louisiana",
        stateCode: "LA",
      },
    ]);
    const counties = await resolveCountiesForZipInput("70805");
    expect(mockLookupCountiesForZip).toHaveBeenCalledWith("70805");
    expect(counties).toEqual([
      { county: "East Baton Rouge Parish", stateCode: "LA" },
    ]);
  });

  it("returns one county for 70705 when lookup lists multiple prefix parishes", async () => {
    mockLookupCountiesForZip.mockResolvedValue([
      { county: "East Baton Rouge Parish", state: "Louisiana", stateCode: "LA" },
      { county: "Livingston Parish", state: "Louisiana", stateCode: "LA" },
    ]);
    const counties = await resolveCountiesForZipInput("70705");
    expect(counties).toHaveLength(1);
    expect(counties[0]?.county).toBe("East Baton Rouge Parish");
  });
});

describe("countiesForZipCode", () => {
  it("returns prefix counties for zip3 sync preview only", () => {
    const zip3Counties = countiesForZipCode("802");
    expect(zip3Counties.length).toBe(3);
    expect(zip3Counties.some((c) => c.county === "Denver")).toBe(true);

    expect(countiesForZipCode("80202")).toEqual([]);
  });

  it("returns [] for unknown ZIP prefix", () => {
    expect(countiesForZipCode("000")).toEqual([]);
    expect(countiesForZipCode("00000")).toEqual([]);
  });
});

describe("buildZipCountyPlansReport", () => {
  it("includes all prefix counties for zip3 input mode", () => {
    const report = buildZipCountyPlansReport({
      zipCode: "802",
      inputMode: "zip3",
      year: 2026,
      zip3: "802",
      medications: [],
    });
    expect(report.inputMode).toBe("zip3");
    expect(report.counties.length).toBe(3);
  });

  it("includes only resolved counties for zip5 input mode", () => {
    const report = buildZipCountyPlansReport({
      zipCode: "80202",
      inputMode: "zip5",
      counties: [{ county: "Denver", stateCode: "CO" }],
      year: 2026,
      zip3: "802",
      medications: [],
    });
    expect(report.inputMode).toBe("zip5");
    expect(report.counties).toHaveLength(1);
    expect(report.counties[0]?.county.county).toBe("Denver");
  });

  it("defaults to no counties for zip5 when none are resolved", () => {
    const report = buildZipCountyPlansReport({
      zipCode: "80202",
      inputMode: "zip5",
      year: 2026,
      zip3: "802",
      medications: [],
    });
    expect(report.counties).toEqual([]);
  });

  it("never loads all prefix counties for a 5-digit ZIP even when inputMode is zip3", () => {
    const report = buildZipCountyPlansReport({
      zipCode: "70705",
      inputMode: "zip3",
      year: 2026,
      zip3: "707",
      medications: [],
    });
    expect(report.inputMode).toBe("zip5");
    expect(report.counties).toEqual([]);
  });
});

describe("groupPlansByCategory", () => {
  it("partitions plans into MA, Part D, and Medigap buckets", () => {
    const groups = groupPlansByCategory([
      samplePlan({ planType: "Medicare Advantage (HMO)" }),
      samplePlan({ planType: "Medicare Part D (PDP)", plan: "PDP 1" }),
      samplePlan({ planType: "Medicare Supplement Plan G", plan: "G" }),
    ]);
    expect(groups.map((g) => g.category)).toEqual([
      "medicare-advantage",
      "medicare-part-d",
      "medicare-supplement",
    ]);
    expect(groups.every((g) => g.plans.length === 1)).toBe(true);
  });

  it("omits empty categories", () => {
    const groups = groupPlansByCategory([samplePlan()]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.category).toBe("medicare-advantage");
  });
});

describe("filterZipCountyReportPlans", () => {
  it("filters by plan type using standard plan filter ids", () => {
    const plans = [
      samplePlan({ planType: "Medicare Advantage (HMO)" }),
      samplePlan({ planType: "Medicare Part D (PDP)", plan: "PDP 1" }),
      samplePlan({ planType: "Medicare Supplement Plan G", plan: "G" }),
    ];
    expect(filterZipCountyReportPlans(plans, "medicare-part-d")).toHaveLength(1);
    expect(filterZipCountyReportPlans(plans, "medicare-supplement")).toHaveLength(1);
    expect(filterZipCountyReportPlans(plans, "all")).toHaveLength(3);
  });
});

describe("filterZipCountyReportEntry", () => {
  it("returns null when no plans match the filter", () => {
    const entry = {
      county: { county: "Denver", stateCode: "CO" },
      countyLabel: "Denver, CO",
      groups: groupPlansByCategory([samplePlan({ planType: "Medicare Advantage (HMO)" })]),
      totalPlans: 1,
    };
    expect(filterZipCountyReportEntry(entry, "medicare-part-d")).toBeNull();
  });

  it("re-groups filtered plans by category", () => {
    const entry = {
      county: { county: "Denver", stateCode: "CO" },
      countyLabel: "Denver, CO",
      groups: groupPlansByCategory([
        samplePlan({ planType: "Medicare Advantage (HMO)" }),
        samplePlan({ planType: "Medicare Part D (PDP)", plan: "PDP 1" }),
      ]),
      totalPlans: 2,
    };
    const filtered = filterZipCountyReportEntry(entry, "medicare-part-d");
    expect(filtered?.totalPlans).toBe(1);
    expect(filtered?.groups).toHaveLength(1);
    expect(filtered?.groups[0]?.category).toBe("medicare-part-d");
  });
});

describe("zipCountyReportPlanFilterCounts", () => {
  it("counts plan types across counties", () => {
    const report = {
      zipCode: "80202",
      zip3: "802",
      inputMode: "zip5" as const,
      generatedAt: new Date().toISOString(),
      totalPlans: 2,
      counties: [
        {
          county: { county: "Denver", stateCode: "CO" },
          countyLabel: "Denver, CO",
          groups: groupPlansByCategory([
            samplePlan({ planType: "Medicare Advantage (HMO)" }),
            samplePlan({ planType: "Medicare Part D (PDP)", plan: "PDP 1" }),
          ]),
          totalPlans: 2,
        },
      ],
    };
    const counts = zipCountyReportPlanFilterCounts(report);
    expect(counts["medicare-advantage"]).toBe(1);
    expect(counts["medicare-part-d"]).toBe(1);
    expect(counts.all).toBe(2);
  });
});

describe("countyKeyForEntry", () => {
  it("uses state and county for a stable multiselect value", () => {
    const entry = sampleEntry("Denver", "CO", [samplePlan()]);
    expect(countyKeyForEntry(entry)).toBe("CO::Denver");
  });
});

describe("countyKeyForZip3County", () => {
  it("matches countyKeyForEntry for the same county", () => {
    const entry = sampleEntry("Denver", "CO", [samplePlan()]);
    expect(countyKeyForZip3County(entry.county)).toBe(countyKeyForEntry(entry));
  });
});

describe("zip3CountySelectOptions", () => {
  it("builds labeled options for a prefix county list", () => {
    const counties = countiesForZip3ReportInput("802");
    const options = zip3CountySelectOptions(counties);
    expect(options.length).toBeGreaterThan(0);
    expect(options[0]).toMatchObject({
      value: expect.stringMatching(/^[A-Z]{2}::/),
      label: expect.stringMatching(/, [A-Z]{2}$/),
    });
  });
});

describe("filterZip3CountiesByKeys", () => {
  const prefixCounties = countiesForZip3ReportInput("802");

  it("returns all counties when selection is empty", () => {
    expect(filterZip3CountiesByKeys(prefixCounties, [])).toEqual(prefixCounties);
  });

  it("returns no counties for the none sentinel", () => {
    expect(filterZip3CountiesByKeys(prefixCounties, ["__none__"])).toEqual([]);
  });

  it("narrows to selected county keys", () => {
    const key = countyKeyForZip3County(prefixCounties[0]!);
    const filtered = filterZip3CountiesByKeys(prefixCounties, [key]);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toEqual(prefixCounties[0]);
  });
});

describe("hasZipCountyReportSelection", () => {
  it("treats empty selection as all counties selected", () => {
    expect(hasZipCountyReportSelection([])).toBe(true);
  });

  it("rejects the none sentinel", () => {
    expect(hasZipCountyReportSelection(["__none__"])).toBe(false);
  });

  it("accepts explicit county keys", () => {
    expect(hasZipCountyReportSelection(["CO::Denver"])).toBe(true);
  });
});

describe("filterZipCountyReportByCounties", () => {
  const report = sampleReport([
    sampleEntry("Denver", "CO", [samplePlan()]),
    sampleEntry("Adams", "CO", [samplePlan({ plan: "Plan B" })]),
  ]);

  it("returns all counties when selection is empty", () => {
    expect(filterZipCountyReportByCounties(report, []).counties).toHaveLength(2);
  });

  it("narrows to selected county keys", () => {
    const key = countyKeyForEntry(report.counties[0]!);
    const filtered = filterZipCountyReportByCounties(report, [key]);
    expect(filtered.counties).toHaveLength(1);
    expect(filtered.counties[0]?.county.county).toBe("Denver");
    expect(filtered.totalPlans).toBe(1);
  });

  it("returns no counties for the none sentinel", () => {
    expect(filterZipCountyReportByCounties(report, ["__none__"]).counties).toEqual([]);
  });
});

describe("applyZipCountyReportViewFilters", () => {
  const report = sampleReport([
    sampleEntry("Denver", "CO", [
      samplePlan({ planType: "Medicare Advantage (HMO)" }),
      samplePlan({ planType: "Medicare Part D (PDP)", plan: "PDP 1" }),
    ]),
    sampleEntry("Adams", "CO", [
      samplePlan({ plan: "Plan B", planType: "Medicare Advantage (PPO)" }),
    ]),
  ]);

  it("combines county multiselect and plan-type filter", () => {
    const denverKey = countyKeyForEntry(report.counties[0]!);
    const filtered = applyZipCountyReportViewFilters(report, {
      countyKeys: [denverKey],
      planFilter: "medicare-part-d",
    });
    expect(filtered.counties).toHaveLength(1);
    expect(filtered.counties[0]?.county.county).toBe("Denver");
    expect(filtered.totalPlans).toBe(1);
    expect(filtered.counties[0]?.groups[0]?.category).toBe("medicare-part-d");
  });

  it("drops counties with no matching plan type", () => {
    const filtered = applyZipCountyReportViewFilters(report, {
      countyKeys: [],
      planFilter: "medicare-part-d",
    });
    expect(filtered.counties).toHaveLength(1);
    expect(filtered.counties[0]?.county.county).toBe("Denver");
  });
});

describe("zipCountyReportCountyOptions", () => {
  const report = sampleReport([
    sampleEntry("Denver", "CO", [samplePlan({ planType: "Medicare Advantage (HMO)" })]),
    sampleEntry("Adams", "CO", [samplePlan({ plan: "PDP", planType: "Medicare Part D (PDP)" })]),
  ]);

  it("lists every county when plan filter is all", () => {
    expect(zipCountyReportCountyOptions(report, "all")).toHaveLength(2);
  });

  it("lists only counties with matching plans for the active type filter", () => {
    const options = zipCountyReportCountyOptions(report, "medicare-part-d");
    expect(options).toHaveLength(1);
    expect(options[0]?.label).toBe("Adams, CO");
  });
});

describe("pruneZipCountySelection", () => {
  it("keeps all/none sentinel selections unchanged", () => {
    expect(pruneZipCountySelection([], ["CO::Denver"])).toEqual([]);
    expect(pruneZipCountySelection(["__none__"], ["CO::Denver"])).toEqual(["__none__"]);
  });

  it("drops invalid keys and resets to all when nothing remains", () => {
    expect(pruneZipCountySelection(["CO::Denver", "CO::Adams"], ["CO::Denver"])).toEqual([
      "CO::Denver",
    ]);
    expect(pruneZipCountySelection(["CO::Adams"], ["CO::Denver"])).toEqual([]);
  });
});
