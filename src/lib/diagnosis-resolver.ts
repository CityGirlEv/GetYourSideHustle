const MAP: { match: RegExp; dx: string }[] = [
  { match: /lisinopril|metoprolol|amlodipine|losartan/i, dx: "Hypertension" },
  { match: /atorvastatin|lipitor|crestor|rosuvastatin|simvastatin/i, dx: "Hyperlipidemia" },
  { match: /novolog|humalog|admelog/i, dx: "Type 1 Diabetes (Insulin)" },
  { match: /omnipod/i, dx: "Type 1 Diabetes (Pump)" },
  { match: /dexcom|cgm|libre/i, dx: "Type 1 Diabetes (CGM DME)" },
  { match: /albuterol|advair|spiriva|symbicort/i, dx: "COPD / Asthma" },
  { match: /cpap|bipap/i, dx: "Sleep Apnea (DME)" },
  { match: /levothyroxine|synthroid/i, dx: "Hypothyroidism" },
  { match: /metformin|jardiance|ozempic|trulicity/i, dx: "Type 2 Diabetes" },
  { match: /eliquis|warfarin|xarelto/i, dx: "Anticoagulation" },
];

export function resolveDiagnosis(name: string): string | undefined {
  return MAP.find((m) => m.match.test(name))?.dx;
}

export function isDME(name: string): boolean {
  return /cpap|bipap|dexcom|cgm|libre|omnipod|nebulizer|wheelchair|walker/i.test(name);
}

// Common medications suggested per condition. Used by the intake wizard
// to help users who know their conditions but not exact drug names.
export const COMMON_MEDS_BY_CONDITION: Record<string, { name: string; strength?: string; form?: string; freq?: string; retail?: number }[]> = {
  "Diabetes": [
    { name: "Metformin", strength: "500 mg", form: "Tablet", freq: "Twice daily", retail: 10 },
    { name: "Jardiance", strength: "10 mg", form: "Tablet", freq: "Daily", retail: 570 },
    { name: "Ozempic", strength: "1 mg", form: "Injection", freq: "Weekly", retail: 950 },
    { name: "Trulicity", strength: "1.5 mg", form: "Injection", freq: "Weekly", retail: 900 },
    { name: "Novolog (insulin)", strength: "100 U/mL", form: "Vial", freq: "With meals", retail: 350 },
  ],
  "Hypertension": [
    { name: "Lisinopril", strength: "10 mg", form: "Tablet", freq: "Daily", retail: 8 },
    { name: "Amlodipine", strength: "5 mg", form: "Tablet", freq: "Daily", retail: 8 },
    { name: "Losartan", strength: "50 mg", form: "Tablet", freq: "Daily", retail: 10 },
    { name: "Metoprolol", strength: "25 mg", form: "Tablet", freq: "Twice daily", retail: 10 },
  ],
  "Heart disease": [
    { name: "Atorvastatin", strength: "20 mg", form: "Tablet", freq: "Daily", retail: 12 },
    { name: "Eliquis", strength: "5 mg", form: "Tablet", freq: "Twice daily", retail: 550 },
    { name: "Metoprolol", strength: "25 mg", form: "Tablet", freq: "Twice daily", retail: 10 },
    { name: "Aspirin", strength: "81 mg", form: "Tablet", freq: "Daily", retail: 5 },
  ],
  "COPD": [
    { name: "Albuterol", strength: "90 mcg", form: "Inhaler", freq: "As needed", retail: 65 },
    { name: "Spiriva", strength: "18 mcg", form: "Inhaler", freq: "Daily", retail: 500 },
    { name: "Symbicort", strength: "160/4.5 mcg", form: "Inhaler", freq: "Twice daily", retail: 400 },
    { name: "Advair", strength: "250/50 mcg", form: "Inhaler", freq: "Twice daily", retail: 420 },
  ],
  "Cancer history": [
    { name: "Tamoxifen", strength: "20 mg", form: "Tablet", freq: "Daily", retail: 30 },
    { name: "Anastrozole", strength: "1 mg", form: "Tablet", freq: "Daily", retail: 25 },
  ],
  "Chronic kidney disease": [
    { name: "Furosemide", strength: "40 mg", form: "Tablet", freq: "Daily", retail: 10 },
    { name: "Losartan", strength: "50 mg", form: "Tablet", freq: "Daily", retail: 10 },
    { name: "Sevelamer", strength: "800 mg", form: "Tablet", freq: "With meals", retail: 250 },
  ],
  "Arthritis": [
    { name: "Meloxicam", strength: "15 mg", form: "Tablet", freq: "Daily", retail: 12 },
    { name: "Celebrex", strength: "200 mg", form: "Capsule", freq: "Daily", retail: 90 },
    { name: "Acetaminophen", strength: "500 mg", form: "Tablet", freq: "As needed", retail: 8 },
  ],
};
