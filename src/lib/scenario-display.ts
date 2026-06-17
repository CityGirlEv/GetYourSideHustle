import { usd, type Medication } from "./medicare-math";

export function formatScenarioConditions(conditions: string[] | undefined | null): string {
  if (!conditions?.length) return "None reported";
  return conditions.join(", ");
}

/** Wizard / QA format: "Losartan 50 mg tablet (daily) = $7/mo" */
export function formatScenarioMedicationLine(m: Medication): string {
  const name = m.medication_name?.trim() || "Unnamed medication";
  const detail = [m.strength?.trim(), m.dosage_form?.trim()].filter(Boolean).join(" ");
  const freq = m.frequency?.trim();
  let desc = detail ? `${name} ${detail}` : name;
  if (freq) desc += ` (${freq})`;
  return `${desc} = ${usd(m.estimated_monthly_retail ?? 0)}/mo`;
}

export function formatScenarioMedicationsList(medications: Medication[] | undefined | null): string {
  if (!medications?.length) return "None reported";
  return medications.map(formatScenarioMedicationLine).join("; ");
}

export function formatScenarioMedicationsMultiline(
  medications: Medication[] | undefined | null,
): string {
  if (!medications?.length) return "None reported";
  return medications.map(formatScenarioMedicationLine).join("\n");
}

export function formatScenarioCostPreference(
  pref: "minimize_monthly" | "predictability" | undefined | null,
): string {
  if (pref === "minimize_monthly") return "Minimize monthly";
  if (pref === "predictability") return "Predictability";
  return "—";
}

export function formatScenarioGender(gender: string | undefined | null): string {
  return (gender ?? "—").replace(/_/g, " ");
}

export function scenarioMedicationRetailMonthly(medications: Medication[] | undefined | null): number {
  return (medications ?? []).reduce((sum, m) => sum + (m.estimated_monthly_retail ?? 0), 0);
}

export function scenarioMedicationRetailAnnual(medications: Medication[] | undefined | null): number {
  return scenarioMedicationRetailMonthly(medications) * 12;
}
