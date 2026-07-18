import {
  isMedigapPlan,
  isMedicareAdvantagePlan,
  type PlanDetail,
} from "@/lib/plan-details";
import { isDmeForm, type Medication } from "@/lib/medicare-math";

/** In-list category tab label for Part B outpatient drug coverage. */
export const PART_B_MEDS_TAB_LABEL = "Part B meds";

export type PartBDrugCategory = {
  category: string;
  examples: string[];
  note?: string;
};

/** Common outpatient drugs and supplies billed under Medicare Part B (not Part D). */
export const PART_B_DRUG_CATEGORIES: PartBDrugCategory[] = [
  {
    category: "Durable medical equipment (DME) supplies",
    examples: ["CGM sensors & transmitters", "Insulin pumps", "CPAP/BiPAP", "Nebulizer supplies"],
    note: "Equipment and related supplies — generally 20% coinsurance after Part B deductible.",
  },
  {
    category: "Physician-administered injectables",
    examples: [
      "Humira (adalimumab)",
      "Enbrel (etanercept)",
      "Remicade (infliximab)",
      "Prolia (denosumab)",
      "Lucentis (ranibizumab)",
    ],
    note: "Usually given in a doctor's office or outpatient clinic — Part B, not Part D.",
  },
  {
    category: "Oral anticancer drugs",
    examples: ["Imatinib (Gleevec)", "Capecitabine (Xeloda)", "Lenalidomide (Revlimid)"],
    note: "Certain oral cancer drugs are covered under Part B when used for approved indications.",
  },
  {
    category: "Immunosuppressive drugs",
    examples: ["Tacrolimus", "Mycophenolate", "Cyclosporine"],
    note: "After an organ transplant when billed under Part B.",
  },
  {
    category: "Other Part B outpatient drugs",
    examples: [
      "Erythropoietin (ESA)",
      "Intravenous immunoglobulin (IVIG)",
      "Bone-modifying agents (e.g. zoledronic acid in some settings)",
    ],
    note: "Confirm benefit category on Medicare.gov or with your provider.",
  },
];

const PART_B_INJECTABLE_PATTERN =
  /\b(humira|adalimumab|enbrel|etanercept|remicade|infliximab|prolia|denosumab|lucentis|ranibizumab|ocrevus|natalizumab|rituximab|pembrolizumab|nivolumab|bevacizumab|trastuzumab|upadacitinib|secukinumab|ustekinumab|vedolizumab|golimumab|certolizumab|dupixent|dupilumab|skyrizi|risankizumab|tremfya|guselkumab|stelara|cosentyx|taltz|ixekizumab|simponi|cimzia|orencia|abatacept|actemra|tocilizumab|xolair|omalizumab|nucala|mepolizumab|fasenra|benralizumab|tezspire|tezepelumab)\b/i;

const PART_B_ORAL_ONCOLOGY_PATTERN =
  /\b(gleevec|imatinib|xeloda|capecitabine|revlimid|lenalidomide|ibrance|palbociclib|kisqali|ribociclib|verzenio|abemaciclib|tarceva|erlotinib|sprycel|dasatinib|tasigna|nilotinib)\b/i;

const PART_B_IMMUNOSUPPRESSANT_PATTERN =
  /\b(tacrolimus|prograf|mycophenolate|cellcept|cyclosporine|neoral|sandimmune|sirolimus|rapamune|everolimus|zortress|azathioprine|imuran)\b/i;

const PART_B_OTHER_PATTERN =
  /\b(erythropoietin|epoetin|procrit|aranesp|darbepeoetin|ivig|immunoglobulin|zoledronic acid|reclast|zoledronate|heparin|enoxaparin|lovenox)\b/i;

const PART_B_FORM_PATTERN =
  /\b(injection|injectable|infusion|intravenous|subcutaneous|prefilled syringe|auto-injector|vial)\b/i;

/** Heuristic: medication likely billed under Part B rather than Part D. */
export function isPartBDrug(medication: Medication): boolean {
  if (isDmeForm(medication.dosage_form)) return true;

  const haystack = [
    medication.medication_name,
    medication.dosage_form,
    medication.strength,
    medication.resolved_diagnosis ?? "",
  ]
    .join(" ")
    .trim();

  if (!haystack) return false;

  return (
    PART_B_INJECTABLE_PATTERN.test(haystack) ||
    PART_B_ORAL_ONCOLOGY_PATTERN.test(haystack) ||
    PART_B_IMMUNOSUPPRESSANT_PATTERN.test(haystack) ||
    PART_B_OTHER_PATTERN.test(haystack) ||
    (PART_B_FORM_PATTERN.test(haystack) &&
      !/\b(tablet|capsule|pill|oral suspension|solution oral)\b/i.test(haystack))
  );
}

export function partBMedicationsFromIntake(medications: Medication[]): Medication[] {
  return medications.filter(isPartBDrug);
}

/** Intake medications modeled on a Part D formulary (excludes Part B outpatient / DME). */
export function partDMedicationsFromIntake(medications: Medication[]): Medication[] {
  return medications.filter((med) => !isPartBDrug(med));
}

/** Plans where Part B outpatient drugs and DME apply (not standalone Part D). */
export function planAppliesToPartBDrugCoverage(plan: PlanDetail): boolean {
  return isMedicareAdvantagePlan(plan) || isMedigapPlan(plan);
}

export function filterPlansForPartBDrugCoverage(plans: PlanDetail[]): PlanDetail[] {
  return plans.filter(planAppliesToPartBDrugCoverage);
}

/** Concise Part B drug note for MA / Medigap plan cards when the member has Part B meds. */
export function partBDrugNoteForPlan(
  plan: PlanDetail,
  partBMeds: Medication[],
): string | null {
  if (!partBMeds.length || !planAppliesToPartBDrugCoverage(plan)) return null;
  const names = partBMeds.map((med) => med.medication_name).join(", ");
  if (isMedicareAdvantagePlan(plan)) {
    return `Part B medications (${names}) are covered through this plan's medical benefit — typically 20% coinsurance after the Part B deductible, not on the Part D formulary.`;
  }
  return `Part B medications (${names}) are covered under Original Medicare Part B — Medigap may reduce your 20% coinsurance after the Part B deductible.`;
}
