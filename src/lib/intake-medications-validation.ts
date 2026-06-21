export type MedicationForSubmit = {
  id: string;
  medication_name: string;
};

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
      error: 'Click "Add this Drug" on each medication card before creating your scenario.',
    };
  }
  return { ok: true, submitted };
}
