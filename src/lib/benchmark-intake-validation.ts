import { needsBenchmarkEligibilityQuestion, type BenchmarkIntakeInput } from "@/lib/benchmark-intake";
import { MAX_BIRTH_YEAR, MIN_BIRTH_YEAR } from "@/lib/intake-constants";
import { countyMatchesZip3, countiesForZip3 } from "@/lib/zip3-county-lookup";
import type { Medication } from "@/lib/medicare-math";
import { validateMedicationsForSubmit } from "@/lib/intake-medications-validation";

export function validateBenchmarkIntakeInput(
  intake: BenchmarkIntakeInput,
  medications: Medication[],
  confirmedMedIds: string[],
): string | null {
  if (intake.birthYear < MIN_BIRTH_YEAR || intake.birthYear > MAX_BIRTH_YEAR) {
    return `Year of birth must be between ${MIN_BIRTH_YEAR} and ${MAX_BIRTH_YEAR}.`;
  }
  if (!/^\d{3}$/.test(intake.zip3)) {
    return "Enter exactly 3 digits of your ZIP code.";
  }
  if (intake.county.trim().length < 2) {
    return "Please select your county or parish.";
  }
  const countyOptions = countiesForZip3(intake.zip3);
  if (countyOptions.length > 0 && !countyMatchesZip3(intake.county, intake.zip3)) {
    return `"${intake.county}" is not within ZIP ${intake.zip3}xx.`;
  }
  if (countyOptions.length === 0 && /^\d{3}$/.test(intake.zip3)) {
    return `We don't recognize ZIP prefix ${intake.zip3}. Double-check the first 3 digits.`;
  }
  if (needsBenchmarkEligibilityQuestion(intake.medicareEnrolled) && !intake.eligibilityCircumstance) {
    return "Select the option that best describes your situation.";
  }
  if (intake.preferredPharmacy === "yes" && !intake.preferredPharmacyName.trim()) {
    return "Enter your preferred pharmacy name.";
  }
  const medValidation = validateMedicationsForSubmit(medications, confirmedMedIds);
  if (!medValidation.ok) {
    return medValidation.error;
  }
  return null;
}
