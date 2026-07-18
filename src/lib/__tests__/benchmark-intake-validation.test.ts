import { describe, expect, it } from "vitest";
import { validateBenchmarkIntakeInput } from "@/lib/benchmark-intake-validation";
import type { BenchmarkIntakeInput } from "@/lib/benchmark-intake";

const baseIntake: BenchmarkIntakeInput = {
  birthYear: 1960,
  gender: "female",
  tobacco: false,
  zip3: "770",
  county: "Harris",
  medicareEnrolled: "none",
  eligibilityCircumstance: "turning_65",
  eligibilityCircumstanceOther: "",
  incomeBand: "$55k–$75k",
  conditions: [],
  medications: [],
  medicationDetails: [],
  visitFrequency: "medium",
  preferredPharmacy: "no",
  preferredPharmacyName: "",
  benefitPriorities: [],
};

describe("validateBenchmarkIntakeInput", () => {
  it("returns null for a valid intake", () => {
    expect(validateBenchmarkIntakeInput(baseIntake, [], [])).toBeNull();
  });

  it("requires a pharmacy name when preferred pharmacy is yes", () => {
    const error = validateBenchmarkIntakeInput(
      { ...baseIntake, preferredPharmacy: "yes", preferredPharmacyName: "" },
      [],
      [],
    );
    expect(error).toMatch(/pharmacy name/i);
  });
});
