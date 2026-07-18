import { describe, it, expect } from "vitest";
import type { Medication } from "@/lib/medicare-math";
import {
  isPartBDrug,
  partBMedicationsFromIntake,
  partDMedicationsFromIntake,
  partBDrugNoteForPlan,
  planAppliesToPartBDrugCoverage,
  PART_B_DRUG_CATEGORIES,
  PART_B_MEDS_TAB_LABEL,
} from "@/lib/part-b-drugs";
import type { PlanDetail } from "@/lib/plan-details";

const med = (over: Partial<Medication>): Medication => ({
  id: over.id ?? "m1",
  medication_name: over.medication_name ?? "atorvastatin",
  strength: over.strength ?? "10mg",
  dosage_form: over.dosage_form ?? "Tablet",
  frequency: over.frequency ?? "daily",
  estimated_monthly_retail: over.estimated_monthly_retail ?? 10,
  ...over,
});

describe("PART_B_DRUG_CATEGORIES", () => {
  it("includes DME and physician-administered categories", () => {
    const labels = PART_B_DRUG_CATEGORIES.map((c) => c.category);
    expect(labels.some((l) => /DME/i.test(l))).toBe(true);
    expect(labels.some((l) => /injectable/i.test(l))).toBe(true);
  });
});

describe("isPartBDrug", () => {
  it("detects DME forms", () => {
    expect(isPartBDrug(med({ medication_name: "Dexcom G7", dosage_form: "CGM (DME)" }))).toBe(true);
    expect(isPartBDrug(med({ medication_name: "CPAP machine", dosage_form: "CPAP (DME)" }))).toBe(
      true,
    );
  });

  it("detects physician-administered biologics by name", () => {
    expect(isPartBDrug(med({ medication_name: "Humira", dosage_form: "Injection" }))).toBe(true);
    expect(isPartBDrug(med({ medication_name: "Prolia", dosage_form: "Injection" }))).toBe(true);
    expect(isPartBDrug(med({ medication_name: "Revlimid", dosage_form: "Capsule" }))).toBe(true);
  });

  it("returns false for typical Part D oral meds", () => {
    expect(isPartBDrug(med({ medication_name: "Metformin", dosage_form: "Tablet" }))).toBe(false);
    expect(isPartBDrug(med({ medication_name: "Lisinopril", dosage_form: "Tablet" }))).toBe(false);
  });
});

describe("partBMedicationsFromIntake", () => {
  it("filters to Part B meds only", () => {
    const intake = [
      med({ id: "1", medication_name: "Metformin", dosage_form: "Tablet" }),
      med({ id: "2", medication_name: "Dexcom G7", dosage_form: "CGM (DME)" }),
      med({ id: "3", medication_name: "Humira", dosage_form: "Injection" }),
    ];
    const partB = partBMedicationsFromIntake(intake);
    expect(partB.map((m) => m.id)).toEqual(["2", "3"]);
  });
});

describe("partDMedicationsFromIntake", () => {
  it("filters to Part D formulary meds only", () => {
    const intake = [
      med({ id: "1", medication_name: "Metformin", dosage_form: "Tablet" }),
      med({ id: "2", medication_name: "Dexcom G7", dosage_form: "CGM (DME)" }),
      med({ id: "3", medication_name: "Humira", dosage_form: "Injection" }),
    ];
    const partD = partDMedicationsFromIntake(intake);
    expect(partD.map((m) => m.id)).toEqual(["1"]);
  });
});

const plan = (planType: string): PlanDetail =>
  ({
    rank: 1,
    carrier: "Test",
    plan: "Plan",
    planType,
    network: "National",
    premiumPartB: 185,
    premiumPlan: 0,
    premiumRx: 30,
    premiumDental: 0,
    premiumVision: 0,
    premiumExtras: 0,
    monthly: 215,
    annual: 2580,
    deductibleMed: 283,
    deductibleRx: 0,
    pcpCopay: "$0",
    specCopay: "$40",
    hospCopay: "$0",
    erCopay: "$90",
    moop: "$0",
    rxTier1: "$0",
    rxTier2: "$12",
    rxTier3: "$47",
    rxOOPCap: 2000,
    insulinCap: 35,
    dentalBenefit: "None",
    visionBenefit: "None",
    hearingBenefit: "None",
    otcBenefit: "None",
    stars: "4.0",
    amBest: "A",
    extras: "",
  }) as PlanDetail;

describe("planAppliesToPartBDrugCoverage", () => {
  it("includes Medicare Advantage and Medigap only", () => {
    expect(planAppliesToPartBDrugCoverage(plan("Medicare Advantage (HMO)"))).toBe(true);
    expect(planAppliesToPartBDrugCoverage(plan("Medigap Plan G"))).toBe(true);
    expect(planAppliesToPartBDrugCoverage(plan("Medicare Part D PDP"))).toBe(false);
  });
});

describe("partBDrugNoteForPlan", () => {
  it("returns contextual notes for MA and Medigap", () => {
    const partBMeds = [med({ medication_name: "Humira", dosage_form: "Injection" })];
    const maNote = partBDrugNoteForPlan(plan("Medicare Advantage (HMO)"), partBMeds);
    const medigapNote = partBDrugNoteForPlan(plan("Medigap Plan G"), partBMeds);
    expect(maNote).toMatch(/medical benefit/);
    expect(medigapNote).toMatch(/Original Medicare Part B/);
    expect(partBDrugNoteForPlan(plan("Medicare Part D PDP"), partBMeds)).toBeNull();
  });
});

describe("PART_B_MEDS_TAB_LABEL", () => {
  it("uses the short Part B meds label", () => {
    expect(PART_B_MEDS_TAB_LABEL).toBe("Part B meds");
  });
});
