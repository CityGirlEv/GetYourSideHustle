import type { Medication } from "@/lib/medicare-math";
import type { WorkbookFormState } from "@/lib/workbook-form-state";

export const WORKBOOK_PRESCRIPTIONS_SECTION_ID = "workbook-extra-prescriptions";

export type WorkbookMedicationSeed = {
  medicationNames?: string[];
  medicationDetails?: Medication[];
};

/** Dosage column for workbook PDF rows — strength, form, tablet count, and frequency. */
export function formatWorkbookMedicationDose(med: Medication): string {
  const parts = [
    med.strength?.trim(),
    med.tablets_per_dose?.trim(),
    med.dosage_form?.trim(),
    med.frequency?.trim(),
  ].filter(Boolean);
  return parts.join(" · ");
}

export function intakeMedicationsForWorkbook(
  medicationNames: string[],
  medicationDetails: Medication[] = [],
): { name: string; dose: string }[] {
  if (medicationDetails.length > 0) {
    return medicationDetails
      .map((med) => ({
        name: med.medication_name?.trim() ?? "",
        dose: formatWorkbookMedicationDose(med),
      }))
      .filter((row) => row.name);
  }
  return medicationNames
    .map((name) => ({ name: name.trim(), dose: "" }))
    .filter((row) => row.name);
}

/** Pre-fill prescription rows from benchmark intake — other workbook fields stay blank. */
export function seedWorkbookMedicationLines(
  lines: Record<string, string>,
  medicationNames: string[],
  medicationDetails: Medication[] = [],
): Record<string, string> {
  const next = { ...lines };
  const prefix = WORKBOOK_PRESCRIPTIONS_SECTION_ID;
  const rows = intakeMedicationsForWorkbook(medicationNames, medicationDetails);

  rows.forEach((row, index) => {
    const drugKey = `${prefix}:drug-${index}`;
    const doseKey = `${prefix}:dose-${index}`;
    if (!next[drugKey]?.trim()) {
      next[drugKey] = row.name;
    }
    if (!next[doseKey]?.trim() && row.dose) {
      next[doseKey] = row.dose;
    }
  });

  return next;
}

export function applyWorkbookMedicationSeed(
  state: WorkbookFormState,
  medicationNames: string[],
  medicationDetails: Medication[] = [],
): WorkbookFormState {
  const rows = intakeMedicationsForWorkbook(medicationNames, medicationDetails);
  if (rows.length === 0) return state;
  return {
    ...state,
    lines: seedWorkbookMedicationLines(state.lines, medicationNames, medicationDetails),
  };
}
