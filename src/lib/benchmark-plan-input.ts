import type { BenchmarkIntakeInput } from "@/lib/benchmark-intake";
import type { EducationalBenchmarkReport } from "@/lib/educational-benchmark-report";
import type { Medication } from "@/lib/medicare-math";
import type { ScenarioPdfInput } from "@/lib/scenario-pdf";
import { countyMatchesZip3, formatCountyOptionLabel } from "@/lib/zip3-county-lookup";

const DEFAULT_MONTHLY_RETAIL = 25;

function nameToMedication(name: string, index: number): Medication {
  return {
    id: `bm-${index}`,
    medication_name: name.trim(),
    strength: "",
    dosage_form: "",
    frequency: "",
    estimated_monthly_retail: DEFAULT_MONTHLY_RETAIL,
  };
}

/** Map benchmark intake to the plan-ranking input used by PlanComparisonTopTen. */
export function benchmarkToPlanComparisonScenario(
  intake: BenchmarkIntakeInput,
  report: EducationalBenchmarkReport,
): ScenarioPdfInput & { county?: string } {
  const matched =
    countyMatchesZip3(intake.county, intake.zip3) ?? report.selectedCounty ?? null;
  const county = matched
    ? formatCountyOptionLabel(matched)
    : (intake.county ?? "").trim() || undefined;

  return {
    scenarioCode: "benchmark",
    year: report.year,
    birthYear: intake.birthYear,
    zip3: intake.zip3,
    county,
    gender: intake.gender,
    tobacco: intake.tobacco,
    incomeBand: intake.incomeBand,
    costPreference: "predictability",
    conditions: intake.conditions,
    medications:
      intake.medicationDetails.length > 0
        ? intake.medicationDetails
        : (intake.medications ?? []).map((m) => m.trim()).filter(Boolean).map(nameToMedication),
  };
}
