import { describe, it, expect } from "vitest";
import {
  GUIDELINES,
  INSULIN_CAP_MONTHLY,
  isDmeForm,
  medigapPremiumByZip3,
  partDPremiumByZip3,
  calcPathways,
  recommendPlans,
  usd,
  type Medication,
} from "../medicare-math";

const insulin: Medication = {
  id: "1",
  medication_name: "Novolog (insulin)",
  strength: "100 U/mL",
  dosage_form: "Vial",
  frequency: "With meals",
  estimated_monthly_retail: 289,
};
const metformin: Medication = {
  id: "2",
  medication_name: "Metformin",
  strength: "500 mg",
  dosage_form: "Tablet",
  frequency: "Twice daily",
  estimated_monthly_retail: 4,
};
const cgm: Medication = {
  id: "3",
  medication_name: "Dexcom G7",
  strength: "—",
  dosage_form: "CGM (DME)",
  frequency: "Continuous",
  estimated_monthly_retail: 420,
};

describe("isDmeForm", () => {
  it("detects DME forms", () => {
    expect(isDmeForm("CGM (DME)")).toBe(true);
    expect(isDmeForm("CPAP (DME)")).toBe(true);
    expect(isDmeForm("Insulin Pump (DME)")).toBe(true);
  });
  it("returns false for non-DME forms", () => {
    expect(isDmeForm("Tablet")).toBe(false);
    expect(isDmeForm(null)).toBe(false);
    expect(isDmeForm(undefined)).toBe(false);
  });
});

describe("medigapPremiumByZip3 / partDPremiumByZip3", () => {
  it("returns a known value per first-digit region", () => {
    expect(medigapPremiumByZip3("770")).toBe(145);
    expect(partDPremiumByZip3("100")).toBe(52);
  });
  it("falls back to the 5-region default for bad input", () => {
    expect(medigapPremiumByZip3("")).toBe(145);
    expect(partDPremiumByZip3("")).toBe(36);
  });
});

describe("calcPathways", () => {
  it("caps insulin at $35/mo in Part D drug spend", () => {
    const { A } = calcPathways({ year: 2026, zip3: "770", meds: [insulin] });
    // 35 * 12 = 420 — well under $2100 cap
    expect(A.annualDrugCost).toBe(INSULIN_CAP_MONTHLY * 12);
  });
  it("excludes DME from Part D drug cost", () => {
    const { A } = calcPathways({ year: 2026, zip3: "770", meds: [cgm, metformin] });
    expect(A.annualDrugCost).toBe(4 * 12);
  });
  it("caps annual drug cost at the Part D OOP cap", () => {
    const expensive: Medication = { ...metformin, id: "x", estimated_monthly_retail: 10_000 };
    const { A } = calcPathways({ year: 2026, zip3: "770", meds: [expensive] });
    expect(A.annualDrugCost).toBe(GUIDELINES[2026].partDOOPCap);
  });
  it("returns both pathways with consistent totals", () => {
    const { A, B } = calcPathways({ year: 2027, zip3: "100", meds: [metformin] });
    expect(A.totalAnnual).toBeCloseTo(A.annualPremium + A.annualDrugCost, 5);
    expect(B.worstCaseAnnual).toBeGreaterThan(B.totalAnnual);
  });
});

describe("recommendPlans", () => {
  it("returns a primary + alternate across pathways A/B", () => {
    const rec = recommendPlans({
      year: 2026,
      zip3: "770",
      meds: [metformin],
      conditions: ["Hypertension"],
      costPreference: "predictability",
    });
    expect(["A", "B"]).toContain(rec.primary.pathway);
    expect(rec.primary.pathway).not.toBe(rec.alternate.pathway);
    expect(rec.catalogYear).toBeGreaterThan(0);
  });
  it("prefers chronic-condition friendly MA plan when chronic conditions exist", () => {
    const rec = recommendPlans({
      year: 2026,
      zip3: "770",
      meds: [],
      conditions: ["Diabetes"],
      costPreference: "minimize_monthly",
    });
    const bRec = rec.primary.pathway === "B" ? rec.primary : rec.alternate;
    expect(bRec.planName).toMatch(/Medicare Advantage/);
  });
});

describe("usd", () => {
  it("formats whole-dollar USD", () => {
    expect(usd(1500)).toBe("$1,500");
  });
});
