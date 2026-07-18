import type { BenchmarkIntakeInput } from "@/lib/benchmark-intake";
import { needsBenchmarkEligibilityQuestion } from "@/lib/benchmark-intake";
import { BENEFIT_LABELS } from "@/lib/educational-benchmark-report";
import { countyMatchesZip3, formatCountyOptionLabel } from "@/lib/zip3-county-lookup";

export type BenchmarkProfileAnswerRow = {
  label: string;
  value: string;
};

const MEDICARE_ENROLLED_LABELS: Record<BenchmarkIntakeInput["medicareEnrolled"], string> = {
  part_a: "Part A",
  part_b: "Part B",
  both: "Both Part A and Part B",
  unsure: "Unsure",
  none: "Not enrolled in Medicare",
};

const ELIGIBILITY_LABELS: Record<
  NonNullable<BenchmarkIntakeInput["eligibilityCircumstance"]>,
  string
> = {
  turning_65: "Turning 65 soon",
  special_circumstance:
    "Special circumstance (such as losing employer-provided coverage or disabled or a recent relocation)",
  other: "Other",
};

function formatEligibilityCircumstance(intake: BenchmarkIntakeInput): string {
  if (!needsBenchmarkEligibilityQuestion(intake.medicareEnrolled)) {
    return "Not applicable — already enrolled in Medicare";
  }
  if (!intake.eligibilityCircumstance) {
    return "—";
  }
  if (intake.eligibilityCircumstance === "other") {
    const detail = (intake.eligibilityCircumstanceOther ?? "").trim();
    return detail ? `Other: ${detail}` : ELIGIBILITY_LABELS.other;
  }
  return ELIGIBILITY_LABELS[intake.eligibilityCircumstance];
}

const VISIT_FREQUENCY_LABELS: Record<BenchmarkIntakeInput["visitFrequency"], string> = {
  low: "Low (1–2 times per year)",
  medium: "Medium (3–5 times per year)",
  high: "High (6+ times per year)",
};

const GENDER_LABELS: Record<BenchmarkIntakeInput["gender"], string> = {
  female: "Female",
  male: "Male",
  nonbinary: "Non-binary",
  prefer_not_to_say: "Prefer not to say",
};

/** Human-readable echo of benchmark tool answers for the My Input section. */
export function buildBenchmarkProfileAnswerRows(
  intake: BenchmarkIntakeInput,
): BenchmarkProfileAnswerRow[] {
  const countyLabel = (() => {
    const trimmed = (intake.county ?? "").trim();
    if (!trimmed) return "—";
    const matched = countyMatchesZip3(trimmed, intake.zip3);
    if (matched) return formatCountyOptionLabel(matched);
    return trimmed;
  })();

  const conditions =
    intake.conditions.length > 0 ? intake.conditions.join(", ") : "None selected";

  const medications =
    intake.medications.length > 0 ? intake.medications.join(", ") : "None listed";

  const benefitPriorities =
    intake.benefitPriorities.length > 0
      ? intake.benefitPriorities.map((b) => BENEFIT_LABELS[b]).join(", ")
      : "None selected";

  const preferredPharmacy =
    intake.preferredPharmacy === "yes"
      ? (intake.preferredPharmacyName ?? "").trim() || "Yes (name not provided)"
      : "No preferred pharmacy";

  return [
    { label: "Year of birth", value: String(intake.birthYear) },
    { label: "Gender", value: GENDER_LABELS[intake.gender] },
    { label: "Tobacco use", value: intake.tobacco ? "Smoker" : "Non-smoker" },
    { label: "ZIP prefix", value: `${intake.zip3}xx` },
    { label: "County or parish", value: countyLabel },
    { label: "Medicare enrollment", value: MEDICARE_ENROLLED_LABELS[intake.medicareEnrolled] },
    { label: "Eligibility circumstance", value: formatEligibilityCircumstance(intake) },
    { label: "Income band (annually)", value: intake.incomeBand },
    { label: "Conditions", value: conditions },
    { label: "Medications", value: medications },
    { label: "Doctor visit frequency", value: VISIT_FREQUENCY_LABELS[intake.visitFrequency] },
    { label: "Preferred pharmacy", value: preferredPharmacy },
    { label: "Extra benefit priorities", value: benefitPriorities },
  ];
}
