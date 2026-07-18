import {
  buildEducationalBenchmarkReport,
  type EducationalBenchmarkReport,
} from "@/lib/educational-benchmark-report";
import {
  createBenchmarkEstimateId,
  rememberBenchmarkEstimate,
} from "@/lib/benchmark-estimate-history";

import type { IncomeBand } from "@/lib/income-bands";
import type { IntakeGender } from "@/lib/intake-constants";
import type { Medication } from "@/lib/medicare-math";
import type { ReferralPreferences } from "@/lib/referral-sources";

export type BenchmarkMedicareEnrolled = "part_a" | "part_b" | "both" | "unsure" | "none";
export type BenchmarkEligibilityCircumstance = "turning_65" | "special_circumstance" | "other";

/** Turning-65 / special-circumstance question applies only when enrollment is unclear or none. */
export function needsBenchmarkEligibilityQuestion(enrolled: BenchmarkMedicareEnrolled): boolean {
  return enrolled === "unsure" || enrolled === "none";
}

export type BenchmarkVisitFrequency = "low" | "medium" | "high";
export type BenchmarkBenefitPriority = "dental" | "vision" | "hearing" | "fitness" | "otc";
export type BenchmarkPreferredPharmacy = "yes" | "no";
export type BenchmarkGender = IntakeGender;

export type BenchmarkIntakeInput = {
  birthYear: number;
  gender: BenchmarkGender;
  tobacco: boolean;
  zip3: string;
  county: string;
  medicareEnrolled: BenchmarkMedicareEnrolled;
  /** Required when {@link needsBenchmarkEligibilityQuestion} is true; otherwise null. */
  eligibilityCircumstance: BenchmarkEligibilityCircumstance | null;
  /** Optional free text when eligibility is "other". */
  eligibilityCircumstanceOther: string;
  incomeBand: IncomeBand;
  conditions: string[];
  medications: string[];
  medicationDetails: Medication[];
  visitFrequency: BenchmarkVisitFrequency;
  preferredPharmacy: BenchmarkPreferredPharmacy;
  preferredPharmacyName: string;
  benefitPriorities: BenchmarkBenefitPriority[];
  referral?: ReferralPreferences;
};

export function buildBenchmarkIntakeSnapshot(input: BenchmarkIntakeInput): Record<string, unknown> {
  return {
    kind: "part_b_benchmark_tool",
    birth_year: input.birthYear,
    gender: input.gender,
    tobacco: input.tobacco,
    zip3: input.zip3,
    county: input.county.trim() || null,
    medicare_enrolled: input.medicareEnrolled,
    eligibility_circumstance: input.eligibilityCircumstance,
    ...((input.eligibilityCircumstanceOther ?? "").trim()
      ? { eligibility_circumstance_other: (input.eligibilityCircumstanceOther ?? "").trim() }
      : {}),
    income_band: input.incomeBand,
    conditions: input.conditions,
    medications: input.medications,
    medication_details: input.medicationDetails,
    visit_frequency: input.visitFrequency,
    preferred_pharmacy:
      input.preferredPharmacy === "yes" ? input.preferredPharmacyName.trim() || null : null,
    has_preferred_pharmacy: input.preferredPharmacy === "yes",
    benefit_priorities: input.benefitPriorities,
    ...(input.referral && Object.keys(input.referral).length > 0 ? { referral: input.referral } : {}),
  };
}

export type FinalizedBenchmark = {
  estimateId: string;
  intake: BenchmarkIntakeInput;
  intakeSnapshot: Record<string, unknown>;
  report: EducationalBenchmarkReport;
};

function buildFinalizedBenchmark(estimateId: string, input: BenchmarkIntakeInput): FinalizedBenchmark {
  return {
    estimateId,
    intake: input,
    intakeSnapshot: buildBenchmarkIntakeSnapshot(input),
    report: buildEducationalBenchmarkReport(input),
  };
}

/** Create a new local benchmark scenario (new BM- id). */
export function finalizeBenchmarkIntake(input: BenchmarkIntakeInput): FinalizedBenchmark {
  const estimateId = createBenchmarkEstimateId();
  rememberBenchmarkEstimate({ id: estimateId, zip3: input.zip3 });
  return buildFinalizedBenchmark(estimateId, input);
}

/** Rebuild a saved benchmark in place — keeps the same BM- id. */
export function rebuildBenchmarkEstimate(
  estimateId: string,
  input: BenchmarkIntakeInput,
): FinalizedBenchmark {
  return buildFinalizedBenchmark(estimateId, input);
}

function benchmarkIntakeCountySnapshot(county: string): string | null {
  return county.trim() || null;
}

/** Whether two intakes share the same ZIP prefix and county (regional plan context). */
export function benchmarkIntakeLocationEqual(
  a: BenchmarkIntakeInput,
  b: BenchmarkIntakeInput,
): boolean {
  return (
    a.zip3 === b.zip3 &&
    benchmarkIntakeCountySnapshot(a.county) === benchmarkIntakeCountySnapshot(b.county)
  );
}

/** Whether edited intake changed ZIP prefix or county vs the saved report. */
export function benchmarkIntakeLocationChanged(
  saved: BenchmarkIntakeInput,
  edited: BenchmarkIntakeInput,
): boolean {
  return !benchmarkIntakeLocationEqual(saved, edited);
}

/** Whether two intake payloads differ (for My Input dirty-state). */
export function benchmarkIntakeInputsEqual(
  a: BenchmarkIntakeInput,
  b: BenchmarkIntakeInput,
): boolean {
  return (
    JSON.stringify(buildBenchmarkIntakeSnapshot(a)) ===
    JSON.stringify(buildBenchmarkIntakeSnapshot(b))
  );
}
