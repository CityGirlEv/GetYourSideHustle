import { describe, expect, it } from "vitest";
import {
  buildPlanDrugEstimates,
  estimateDrugCostOnPlan,
  medicationsForPlanDrugEstimates,
} from "@/lib/plan-drug-estimate";
import { cmsLandscapePlanToDetail, cmsModeledRxTierCopays } from "@/lib/cms-landscape";
import type { CmsLandscapePlanRecord } from "@/lib/cms-landscape-types";
import { benchmarkToPlanComparisonScenario } from "@/lib/benchmark-plan-input";
import { finalizeBenchmarkIntake } from "@/lib/benchmark-intake";
import { areaPlanDetails, potentialTop3PlanDetails } from "@/lib/plan-details";
import { INSULIN_CAP_MONTHLY, type Medication } from "@/lib/medicare-math";

const metformin: Medication = {
  id: "1",
  medication_name: "Metformin",
  strength: "500 mg",
  dosage_form: "Tablet",
  frequency: "Twice daily",
  estimated_monthly_retail: 4,
};

const lisinopril: Medication = {
  id: "2",
  medication_name: "Lisinopril",
  strength: "10 mg",
  dosage_form: "Tablet",
  frequency: "Daily",
  estimated_monthly_retail: 12,
};

const insulin: Medication = {
  id: "3",
  medication_name: "Novolog (insulin)",
  strength: "100 U/mL",
  dosage_form: "Vial",
  frequency: "With meals",
  estimated_monthly_retail: 289,
};

const dexcom: Medication = {
  id: "4",
  medication_name: "Dexcom G7",
  strength: "Sensor",
  dosage_form: "CGM (DME)",
  frequency: "Continuous",
  estimated_monthly_retail: 180,
};

describe("plan-drug-estimate", () => {
  it("maps tier 1 generics to the plan Tier 1 copay", () => {
    const [plan] = potentialTop3PlanDetails({
      year: 2026,
      zip3: "770",
      county: "Harris",
      medications: [metformin],
    });
    expect(plan).toBeDefined();

    const rows = buildPlanDrugEstimates(plan!, [metformin]);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tier).toMatch(/Tier 1/i);
    expect(rows[0]!.tierCopay).toBe(plan!.rxTier1);
    expect(rows[0]!.estMonthly).toBeGreaterThan(0);
  });

  it("caps insulin at the plan insulin cap", () => {
    const [plan] = potentialTop3PlanDetails({
      year: 2026,
      zip3: "770",
      medications: [insulin],
    });
    const rows = buildPlanDrugEstimates(plan!, [insulin]);
    expect(rows[0]!.tier).toMatch(/insulin/i);
    expect(rows[0]!.estMonthly).toBe(INSULIN_CAP_MONTHLY);
  });

  it("returns per-drug rows for each intake medication on Top 3 plans", () => {
    const meds = [metformin, lisinopril];
    const top3 = potentialTop3PlanDetails({
      year: 2026,
      zip3: "331",
      county: "Miami-Dade, FL",
      medications: meds,
    });
    for (const plan of top3) {
      const rows = buildPlanDrugEstimates(plan, meds);
      expect(rows).toHaveLength(2);
      expect(rows.map((r) => r.name)).toEqual(["Metformin", "Lisinopril"]);
      expect(rows.every((r) => r.tier.length > 0)).toBe(true);
      expect(rows.every((r) => r.estAnnual === r.estMonthly * 12)).toBe(true);
    }
  });

  it("uses higher copays for specialty tiers", () => {
    const [plan] = potentialTop3PlanDetails({
      year: 2026,
      zip3: "770",
      medications: [],
    });
    const tier3 = estimateDrugCostOnPlan(
      "Tier 3 — Preferred Brand",
      50,
      200,
      plan!,
    );
    const tier5 = estimateDrugCostOnPlan("Tier 5 — Specialty", 200, 800, plan!);
    expect(tier5.estMonthly).toBeGreaterThan(tier3.estMonthly);
  });

  it("CMS All Plans national contracts use modeled rx tiers for drug cost rows", () => {
    const record: CmsLandscapePlanRecord = {
      id: "H1234_001_0",
      contractId: "H1234",
      planId: "001",
      segmentId: "0",
      contractPlanId: "H1234_001",
      contractCategory: "MA",
      state: "TX",
      county: "Harris",
      parentOrganization: "Example Health",
      marketingName: "Example Health",
      planName: "Example HMO",
      planType: "HMO",
      snpIndicator: false,
      snpType: "Not Applicable",
      partDCoverage: true,
      partCPremium: 0,
      partDTotalPremium: 18,
      consolidatedPremium: 18,
      partDDeductible: 0,
      inNetworkMoop: 4200,
      partOopThreshold: 2100,
      overallStarRating: 4.5,
      partCStarRating: 4.5,
      partDStarRating: 4,
      sanctioned: false,
    };
    const tiers = cmsModeledRxTierCopays(record);
    expect(tiers.rxTier1).toMatch(/\$/);
    expect(tiers.rxTier2).toMatch(/\$/);
    const plan = cmsLandscapePlanToDetail(record, 2026, [metformin]);
    expect(plan.rxTier1).toBe(tiers.rxTier1);
    const rows = buildPlanDrugEstimates(plan, [metformin]);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tierCopay).toBe(plan.rxTier1);
    expect(rows[0]!.estMonthly).toBeGreaterThan(0);
  });

  it("excludes Part B DME from standalone Part D and Medigap drug rows", () => {
    const meds = [metformin, dexcom];
    const all = areaPlanDetails({
      year: 2026,
      zip3: "770",
      county: "Harris",
      medications: meds,
    });
    const pdp = all.find((p) => /^Medicare Part D/i.test(p.planType));
    const medigap = all.find((p) => /medigap|supplement/i.test(p.planType));
    expect(pdp).toBeDefined();
    expect(medigap).toBeDefined();

    expect(medicationsForPlanDrugEstimates(pdp!, meds).map((m) => m.id)).toEqual(["1"]);
    expect(medicationsForPlanDrugEstimates(medigap!, meds).map((m) => m.id)).toEqual(["1"]);

    const pdpRows = buildPlanDrugEstimates(pdp!, meds);
    expect(pdpRows).toHaveLength(1);
    expect(pdpRows[0]!.name).toBe("Metformin");

    const medigapRows = buildPlanDrugEstimates(medigap!, meds);
    expect(medigapRows).toHaveLength(1);
    expect(medigapRows[0]!.name).toBe("Metformin");

    const ma = all.find((p) => /medicare advantage/i.test(p.planType));
    expect(ma).toBeDefined();
    expect(buildPlanDrugEstimates(ma!, meds)).toHaveLength(2);
  });

  it("benchmark intake Lisinopril maps to Tier 2 on each Potential Top 3 plan", () => {
    const benchmark = finalizeBenchmarkIntake({
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
    const scenario = benchmarkToPlanComparisonScenario(benchmark.intake, benchmark.report);
    const top3 = potentialTop3PlanDetails({
      year: scenario.year,
      zip3: scenario.zip3,
      county: scenario.county,
      medications: scenario.medications,
    });

    expect(top3).toHaveLength(3);
    for (const plan of top3) {
      const rows = buildPlanDrugEstimates(plan, scenario.medications);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.name).toBe("Lisinopril");
      expect(rows[0]!.tier).toBe("Tier 2 — Generic");
      expect(rows[0]!.tierCopay).toBe(plan.rxTier2);
      expect(rows[0]!.estMonthly).toBeGreaterThan(0);
      expect(rows[0]!.estAnnual).toBe(rows[0]!.estMonthly * 12);
    }
  });
});
