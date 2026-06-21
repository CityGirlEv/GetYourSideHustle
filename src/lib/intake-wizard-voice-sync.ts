import type { Medication } from "@/lib/medicare-math";
import type { IncomeBand } from "@/lib/income-bands";

/** Known condition labels shared with IntakeWizard (excluding Other / None). */
export const INTAKE_KNOWN_CONDITIONS = new Set([
  "Diabetes",
  "Type 2 Diabetes",
  "Hypertension",
  "Heart disease",
  "COPD",
  "Cancer history",
  "Chronic kidney disease",
  "Arthritis",
]);

export type IntakeWizardVoiceSync = {
  revision: number;
  formStep: 1 | 2 | 3;
  birthYear: number | null;
  zip3: string;
  county: string;
  gender: string;
  tobacco: boolean | null;
  incomeBand: string;
  costPref: "minimize_monthly" | "predictability" | "";
  conditions: string[];
  otherConditions: string[];
  meds: Medication[];
  confirmedMedIds: string[];
};

export function splitVoiceConditions(values: string[]): {
  conditions: string[];
  otherConditions: string[];
} {
  const conditions: string[] = [];
  const otherConditions: string[] = [];
  for (const value of values) {
    if (INTAKE_KNOWN_CONDITIONS.has(value)) conditions.push(value);
    else if (value.trim()) otherConditions.push(value.trim());
  }
  return { conditions, otherConditions };
}

export type VoiceWizardStepKey =
  | "intro"
  | "birthYear"
  | "zip"
  | "county"
  | "gender"
  | "tobacco"
  | "income"
  | "costPref"
  | "conditionsAsk"
  | "conditionsAdd"
  | "medsAsk"
  | "medsName"
  | "medsStrength"
  | "medsMore"
  | "confirm"
  | "verify"
  | "submitting"
  | "done";

/** Map voice wizard step → manual form step (1–3). */
export function voiceStepToFormStep(step: VoiceWizardStepKey, verifyFrom?: VoiceWizardStepKey): 1 | 2 | 3 {
  const effective = step === "verify" && verifyFrom ? verifyFrom : step;
  switch (effective) {
    case "birthYear":
    case "zip":
    case "county":
    case "gender":
    case "tobacco":
    case "income":
      return 1;
    case "costPref":
    case "conditionsAsk":
    case "conditionsAdd":
      return 2;
    default:
      return 3;
  }
}

export function buildIntakeWizardVoiceSync(input: {
  revision: number;
  voiceStep: VoiceWizardStepKey;
  verifyFrom?: VoiceWizardStepKey;
  birthYear: number | null;
  zip3: string;
  county: string;
  gender: string;
  tobacco: boolean;
  income: IncomeBand;
  costPref: "minimize_monthly" | "predictability";
  conditions: string[];
  meds: Medication[];
}): IntakeWizardVoiceSync {
  const { conditions, otherConditions } = splitVoiceConditions(input.conditions);
  const filledMeds = input.meds.filter((m) => m.medication_name.trim());
  return {
    revision: input.revision,
    formStep: voiceStepToFormStep(input.voiceStep, input.verifyFrom),
    birthYear: input.birthYear,
    zip3: input.zip3,
    county: input.county,
    gender: input.gender,
    tobacco: input.tobacco,
    incomeBand: input.income,
    costPref: input.costPref,
    conditions,
    otherConditions,
    meds: filledMeds.length ? filledMeds : [],
    confirmedMedIds: filledMeds.map((m) => m.id),
  };
}
