import { describe, expect, it } from "vitest";
import {
  benchmarkIntakeLocationChanged,
  benchmarkIntakeLocationEqual,
  finalizeBenchmarkIntake,
  rebuildBenchmarkEstimate,
  type BenchmarkIntakeInput,
} from "@/lib/benchmark-intake";

const sampleIntake = (): BenchmarkIntakeInput => ({
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
  medicationDetails: [
    {
      id: "t1",
      medication_name: "Lisinopril",
      strength: "10 mg",
      dosage_form: "Tablet",
      frequency: "Once daily",
      estimated_monthly_retail: 8,
    },
  ],
  visitFrequency: "medium",
  preferredPharmacy: "no",
  preferredPharmacyName: "",
  benefitPriorities: ["fitness"],
});

describe("benchmark-intake", () => {
  it("finalizes a local educational benchmark without scenario RPC", () => {
    const result = finalizeBenchmarkIntake({
      ...sampleIntake(),
    });

    expect(result.estimateId).toMatch(/^BM-/);
    expect(result.report.zip3).toBe("770");
    expect(result.intakeSnapshot.birth_year).toBe(1960);
    expect(result.intakeSnapshot.gender).toBe("female");
    expect(result.intakeSnapshot.tobacco).toBe(false);
    expect(result.intakeSnapshot.kind).toBe("part_b_benchmark_tool");
    expect(result.intakeSnapshot.conditions).toEqual(["Hypertension"]);
    expect(result.report.selectedCounty).toEqual({ county: "Harris", stateCode: "TX" });
    expect(result.report.partBBase.standardMonthlyPremium).toBe(202.9);
  });

  it("stores optional referral preferences in the intake snapshot", () => {
    const result = finalizeBenchmarkIntake({
      birthYear: 1960,
      gender: "female",
      tobacco: false,
      zip3: "770",
      county: "Harris",
      medicareEnrolled: "none",
      eligibilityCircumstance: "turning_65",
      incomeBand: "$55k–$75k",
      conditions: [],
      medications: [],
      medicationDetails: [],
      visitFrequency: "low",
      preferredPharmacy: "no",
      preferredPharmacyName: "",
      benefitPriorities: [],
      referral: {
        referralSources: ["google", "agent_referral"],
        referralSource: "google",
        referralAgentName: "Smith Insurance Group",
      },
    });

    expect(result.intakeSnapshot.referral).toEqual({
      referralSources: ["google", "agent_referral"],
      referralSource: "google",
      referralAgentName: "Smith Insurance Group",
    });
  });

  it("rebuilds a saved benchmark in place with the same id", () => {
    const original = finalizeBenchmarkIntake({
      birthYear: 1960,
      gender: "female",
      tobacco: false,
      zip3: "770",
      county: "Harris",
      medicareEnrolled: "none",
      eligibilityCircumstance: "turning_65",
      incomeBand: "$55k–$75k",
      conditions: ["Hypertension"],
      medications: ["Lisinopril"],
      medicationDetails: [
        {
          id: "t1",
          medication_name: "Lisinopril",
          strength: "10 mg",
          dosage_form: "Tablet",
          frequency: "Once daily",
          estimated_monthly_retail: 8,
        },
      ],
      visitFrequency: "medium",
      preferredPharmacy: "no",
      preferredPharmacyName: "",
      benefitPriorities: ["fitness"],
    });

    const updated = rebuildBenchmarkEstimate(original.estimateId, {
      ...original.intake,
      zip3: "331",
      county: "Miami-Dade",
      visitFrequency: "high",
    });

    expect(updated.estimateId).toBe(original.estimateId);
    expect(updated.report.zip3).toBe("331");
    expect(updated.intake.visitFrequency).toBe("high");
  });

  it("detects location changes from zip3 or county edits", () => {
    const saved = sampleIntake();

    expect(benchmarkIntakeLocationEqual(saved, saved)).toBe(true);
    expect(benchmarkIntakeLocationChanged(saved, { ...saved, zip3: "331" })).toBe(true);
    expect(benchmarkIntakeLocationChanged(saved, { ...saved, county: "Miami-Dade" })).toBe(true);
    expect(
      benchmarkIntakeLocationChanged(saved, { ...saved, county: "  Harris  " }),
    ).toBe(false);
    expect(
      benchmarkIntakeLocationChanged(saved, { ...saved, visitFrequency: "high" }),
    ).toBe(false);
  });
});
