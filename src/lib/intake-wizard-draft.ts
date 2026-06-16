import type { Medication } from "@/lib/medicare-math";
import type { ReferralSource } from "@/lib/referral-sources";

export const INTAKE_WIZARD_DRAFT_KEY = "intake-wizard-draft:v1";

export type IntakeWizardDraft = {
  step: number;
  birthYear: number | "";
  zip: string;
  county: string;
  gender: string;
  tobacco: boolean | null;
  incomeBand: string;
  costPref: "minimize_monthly" | "predictability" | "";
  conditions: string[];
  otherConditions: string[];
  otherInput: string;
  meds: Medication[];
  confirmedMedIds?: string[];
  requestExpertContact: boolean;
  referralSources: ReferralSource[];
  referralAgentName: string;
  referralFriendFamily: string;
  referralMedicareEvent: string;
  referralOther: string;
  savedAt: number;
};

export function saveIntakeWizardDraft(draft: Omit<IntakeWizardDraft, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      INTAKE_WIZARD_DRAFT_KEY,
      JSON.stringify({ ...draft, savedAt: Date.now() } satisfies IntakeWizardDraft),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadIntakeWizardDraft(): IntakeWizardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(INTAKE_WIZARD_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IntakeWizardDraft;
    if (typeof parsed.step !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearIntakeWizardDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(INTAKE_WIZARD_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
