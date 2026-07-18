import type { Medication } from "@/lib/medicare-math";

const CURRENT_YEAR = new Date().getFullYear();

export const MIN_BIRTH_YEAR = CURRENT_YEAR - 110;
export const MAX_BIRTH_YEAR = CURRENT_YEAR;

export const BIRTH_YEAR_SUGGESTIONS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, index) => MAX_BIRTH_YEAR - index,
);

export const INTAKE_GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export type IntakeGender = (typeof INTAKE_GENDER_OPTIONS)[number]["value"];

export const INTAKE_CONDITIONS = [
  "None",
  "Diabetes",
  "Type 2 Diabetes",
  "Hypertension",
  "Heart disease",
  "COPD",
  "Cancer history",
  "Chronic kidney disease",
  "Arthritis",
  "Other",
] as const;

/** Tablet count options — order: 1/2, 1, 2 tablets. @deprecated Use {@link intakeCountPerDoseOptions}. */
export const INTAKE_TABLET_COUNT_OPTIONS = ["1/2 tablet", "1 tablet", "2 tablets"] as const;

/** Dosage forms where users pick how many units per dose (tablet, capsule, pill). */
export const INTAKE_COUNTABLE_DOSAGE_FORMS = ["Tablet", "Capsule", "Pill"] as const;

export function intakeDosageFormSupportsCount(form: string): boolean {
  return INTAKE_COUNTABLE_DOSAGE_FORMS.some((entry) => entry.toLowerCase() === form.toLowerCase());
}

/** Singular or plural unit label for a dosage form (e.g. capsule / capsules). */
export function intakeDosageFormUnitLabel(form: string, quantity: number): string {
  const lower = form.trim().toLowerCase();
  const plural = quantity !== 1;
  if (lower === "tablet") return plural ? "tablets" : "tablet";
  if (lower === "capsule") return plural ? "capsules" : "capsule";
  if (lower === "pill") return plural ? "pills" : "pill";
  const base = form.trim().toLowerCase() || "unit";
  return plural && !base.endsWith("s") ? `${base}s` : base;
}

/** Field label — "# of capsules", "# of tablets", etc. */
export function intakeCountPerDoseHeading(form: string): string {
  return `# of ${intakeDosageFormUnitLabel(form, 2)}`;
}

/** Dropdown values for half, one, and two units of the selected form. */
export function intakeCountPerDoseOptions(form: string): string[] {
  return [
    `1/2 ${intakeDosageFormUnitLabel(form, 1)}`,
    `1 ${intakeDosageFormUnitLabel(form, 1)}`,
    `2 ${intakeDosageFormUnitLabel(form, 2)}`,
  ];
}

/** Map a saved count string onto the unit for a newly selected dosage form. */
export function migrateCountPerDoseToForm(value: string | undefined, form: string): string {
  const options = intakeCountPerDoseOptions(form);
  if (value && options.includes(value)) return value;
  if (value?.match(/^1\/2\b/i)) return options[0]!;
  if (value?.match(/^2\b/)) return options[2]!;
  return options[1]!;
}

export const INTAKE_DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Pill",
  "Vial",
  "Pen",
  "Injection",
  "Inhaler",
  "Nasal spray",
  "Cream",
  "Ointment",
  "Patch",
  "Drops",
  "Solution",
  "Suspension",
  "Powder",
  "Suppository",
  "Other",
] as const;

export const INTAKE_FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every other day",
  "Weekly",
  "Every 2 weeks",
  "Monthly",
  "Every 3 months",
  "With meals",
  "Before Meals",
  "At bedtime",
  "As needed",
] as const;

/** Insulin-only dosage form — delivery via pump (Part B DME when combined with pump hardware). */
export const INTAKE_INSULIN_PUMP_DOSAGE_FORM = "Pump" as const;

const INSULIN_MEDICATION_PATTERN =
  /insulin|novolog|humalog|lantus|tresiba|admelog|basaglar|levemir|toujeo/i;

export function isInsulinMedication(medicationName: string): boolean {
  return INSULIN_MEDICATION_PATTERN.test(medicationName.trim());
}

/** Dosage-form dropdown options — adds Pump only for insulin medications. */
export function intakeDosageFormsForMedication(medicationName: string): readonly string[] {
  if (!isInsulinMedication(medicationName)) return INTAKE_DOSAGE_FORMS;
  const forms = [...INTAKE_DOSAGE_FORMS];
  const penIndex = forms.indexOf("Pen");
  if (penIndex >= 0) forms.splice(penIndex + 1, 0, INTAKE_INSULIN_PUMP_DOSAGE_FORM);
  else forms.push(INTAKE_INSULIN_PUMP_DOSAGE_FORM);
  return forms;
}

export function blankIntakeMedication(): Medication {
  return {
    id: crypto.randomUUID(),
    medication_name: "",
    strength: "",
    dosage_form: "Tablet",
    frequency: "Daily",
    estimated_monthly_retail: 25,
  };
}
