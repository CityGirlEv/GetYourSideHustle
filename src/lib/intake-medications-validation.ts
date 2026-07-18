export type MedicationForSubmit = {
  id: string;
  medication_name: string;
};

export function validateMedicationEntry(med: MedicationForSubmit): string | null {
  if (!med.medication_name.trim()) {
    return "Enter a medication name before saving.";
  }
  return null;
}

export function validateMedicationNotDuplicate(
  med: MedicationForSubmit,
  meds: MedicationForSubmit[],
  confirmedMedIds: string[],
): string | null {
  const nameLower = med.medication_name.trim().toLowerCase();
  const duplicate = meds.some(
    (m) =>
      m.id !== med.id &&
      confirmedMedIds.includes(m.id) &&
      m.medication_name.trim().toLowerCase() === nameLower,
  );
  if (duplicate) {
    return "This drug is already in your list.";
  }
  return null;
}

export function validateMedicationsForSubmit(
  meds: MedicationForSubmit[],
  confirmedMedIds: string[],
): { ok: true; submitted: MedicationForSubmit[] } | { ok: false; error: string } {
  const submitted = meds.filter(
    (m) => confirmedMedIds.includes(m.id) && m.medication_name.trim(),
  );
  const unconfirmedFilled = meds.filter(
    (m) => !confirmedMedIds.includes(m.id) && m.medication_name.trim(),
  );
  if (unconfirmedFilled.length) {
    return {
      ok: false,
      error:
        'Save each medication with "Save & Finish" or remove unsaved entries before continuing.',
    };
  }
  return { ok: true, submitted };
}

export function prepareMedicationsForStepFinish(
  meds: MedicationForSubmit[],
  confirmedMedIds: string[],
  currentMedId: string,
): { ok: true; nextConfirmedIds: string[] } | { ok: false; error: string } {
  const med = meds.find((m) => m.id === currentMedId);
  let nextConfirmed = [...confirmedMedIds];

  if (med?.medication_name.trim()) {
    const entryError = validateMedicationEntry(med);
    if (entryError) return { ok: false, error: entryError };
    const dupError = validateMedicationNotDuplicate(med, meds, confirmedMedIds);
    if (dupError) return { ok: false, error: dupError };
    if (!nextConfirmed.includes(med.id)) {
      nextConfirmed.push(med.id);
    }
  }

  const submitValidation = validateMedicationsForSubmit(meds, nextConfirmed);
  if (!submitValidation.ok) {
    return { ok: false, error: submitValidation.error };
  }
  return { ok: true, nextConfirmedIds: nextConfirmed };
}
