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

// Catalog used for the medication name autocomplete. Includes brand and
// generic names plus DME items so users can type partial matches like
// "dex" → Dexcom G7 or "omni" → Omnipod 5.
export type MedCatalogEntry = {
  name: string;
  aliases?: string[];
  strength?: string;
  form?: string;
  freq?: string;
  retail?: number;
  category?: string;
};

// Estimated monthly retail (30-day supply) cash prices.
// Sources (verified Q4 2025): manufacturer list / WAC published prices,
// GoodRx national average cash, and CMS Drug Spending Dashboard 2024 unit
// cost. Generic prices reflect typical $4–$15 pharmacy programs (Costco,
// Walmart, GoodRx). Brand prices reflect WAC list — what an uninsured
// member would pay at retail before any plan discount.
// Anything Medicare classifies as Part B DME (CGMs, insulin pumps, CPAP)
// is excluded from Part D drug-cost math by `isDmeForm()` in
// medicare-math.ts — those items still appear here for the intake list.
export const MED_CATALOG: MedCatalogEntry[] = [
  // Diabetes — oral / injectable (Part D)
  { name: "Metformin", aliases: ["Glucophage"], strength: "500 mg", form: "Tablet", freq: "Twice daily", retail: 4, category: "Diabetes" },
  { name: "Jardiance", aliases: ["empagliflozin"], strength: "10 mg", form: "Tablet", freq: "Daily", retail: 650, category: "Diabetes" },
  { name: "Ozempic", aliases: ["semaglutide"], strength: "1 mg", form: "Injection", freq: "Weekly", retail: 998, category: "Diabetes" },
  { name: "Trulicity", aliases: ["dulaglutide"], strength: "1.5 mg", form: "Injection", freq: "Weekly", retail: 987, category: "Diabetes" },
  { name: "Mounjaro", aliases: ["tirzepatide"], strength: "5 mg", form: "Injection", freq: "Weekly", retail: 1135, category: "Diabetes" },
  // Insulin: $35/mo Part D cap per IRA; pre-cap retail shown here.
  { name: "Novolog (insulin)", aliases: ["insulin aspart"], strength: "100 U/mL", form: "Vial", freq: "With meals", retail: 289, category: "Diabetes" },
  { name: "Humalog (insulin)", aliases: ["insulin lispro"], strength: "100 U/mL", form: "Vial", freq: "With meals", retail: 274, category: "Diabetes" },
  { name: "Lantus (insulin)", aliases: ["insulin glargine"], strength: "100 U/mL", form: "Vial", freq: "Daily", retail: 340, category: "Diabetes" },
  // Diabetes DME (Part B, not Part D)
  { name: "Dexcom G7", aliases: ["dexcom", "cgm"], strength: "—", form: "CGM (DME)", freq: "Continuous", retail: 420, category: "Diabetes DME" },
  { name: "Freestyle Libre 3", aliases: ["libre", "cgm"], strength: "—", form: "CGM (DME)", freq: "Continuous", retail: 140, category: "Diabetes DME" },
  { name: "Omnipod 5", aliases: ["omnipod", "insulin pump"], strength: "—", form: "Insulin Pump (DME)", freq: "Continuous", retail: 600, category: "Diabetes DME" },
  // BP — all generic, Walmart/Costco $4–$10 tier
  { name: "Lisinopril", strength: "10 mg", form: "Tablet", freq: "Daily", retail: 4, category: "Hypertension" },
  { name: "Amlodipine", strength: "5 mg", form: "Tablet", freq: "Daily", retail: 5, category: "Hypertension" },
  { name: "Losartan", strength: "50 mg", form: "Tablet", freq: "Daily", retail: 8, category: "Hypertension" },
  { name: "Metoprolol", strength: "25 mg", form: "Tablet", freq: "Twice daily", retail: 7, category: "Hypertension" },
  { name: "Hydrochlorothiazide", aliases: ["HCTZ"], strength: "25 mg", form: "Tablet", freq: "Daily", retail: 4, category: "Hypertension" },
  // Cholesterol — generic statins
  { name: "Atorvastatin", aliases: ["Lipitor"], strength: "20 mg", form: "Tablet", freq: "Daily", retail: 10, category: "Cholesterol" },
  { name: "Rosuvastatin", aliases: ["Crestor"], strength: "10 mg", form: "Tablet", freq: "Daily", retail: 12, category: "Cholesterol" },
  { name: "Simvastatin", aliases: ["Zocor"], strength: "20 mg", form: "Tablet", freq: "Daily", retail: 8, category: "Cholesterol" },
  // Cardiac / anticoag — brand DOACs at WAC
  { name: "Eliquis", aliases: ["apixaban"], strength: "5 mg", form: "Tablet", freq: "Twice daily", retail: 594, category: "Anticoagulant" },
  { name: "Xarelto", aliases: ["rivaroxaban"], strength: "20 mg", form: "Tablet", freq: "Daily", retail: 564, category: "Anticoagulant" },
  { name: "Warfarin", aliases: ["Coumadin"], strength: "5 mg", form: "Tablet", freq: "Daily", retail: 12, category: "Anticoagulant" },
  { name: "Aspirin", strength: "81 mg", form: "Tablet", freq: "Daily", retail: 5, category: "Cardiac" },
  // COPD / Asthma — brand inhalers at WAC
  { name: "Albuterol", aliases: ["ProAir", "Ventolin"], strength: "90 mcg", form: "Inhaler", freq: "As needed", retail: 80, category: "COPD/Asthma" },
  { name: "Spiriva", aliases: ["tiotropium"], strength: "18 mcg", form: "Inhaler", freq: "Daily", retail: 540, category: "COPD/Asthma" },
  { name: "Symbicort", strength: "160/4.5 mcg", form: "Inhaler", freq: "Twice daily", retail: 370, category: "COPD/Asthma" },
  { name: "Advair", strength: "250/50 mcg", form: "Inhaler", freq: "Twice daily", retail: 420, category: "COPD/Asthma" },
  { name: "Trelegy Ellipta", strength: "100/62.5/25 mcg", form: "Inhaler", freq: "Daily", retail: 680, category: "COPD/Asthma" },
  // Sleep DME (Part B)
  { name: "CPAP machine", aliases: ["cpap", "bipap"], strength: "—", form: "CPAP (DME)", freq: "Nightly", retail: 80, category: "Sleep DME" },
  // Thyroid
  { name: "Levothyroxine", aliases: ["Synthroid"], strength: "50 mcg", form: "Tablet", freq: "Daily", retail: 10, category: "Thyroid" },
  // Kidney
  { name: "Furosemide", aliases: ["Lasix"], strength: "40 mg", form: "Tablet", freq: "Daily", retail: 8, category: "Kidney" },
  { name: "Sevelamer", strength: "800 mg", form: "Tablet", freq: "With meals", retail: 390, category: "Kidney" },
  // Cancer (hormone therapy)
  { name: "Tamoxifen", strength: "20 mg", form: "Tablet", freq: "Daily", retail: 45, category: "Oncology" },
  { name: "Anastrozole", aliases: ["Arimidex"], strength: "1 mg", form: "Tablet", freq: "Daily", retail: 30, category: "Oncology" },
  // Pain / arthritis
  { name: "Meloxicam", strength: "15 mg", form: "Tablet", freq: "Daily", retail: 10, category: "Arthritis" },
  { name: "Celebrex", aliases: ["celecoxib"], strength: "200 mg", form: "Capsule", freq: "Daily", retail: 25, category: "Arthritis" },
  { name: "Acetaminophen", aliases: ["Tylenol"], strength: "500 mg", form: "Tablet", freq: "As needed", retail: 8, category: "Pain" },
  { name: "Ibuprofen", aliases: ["Advil", "Motrin"], strength: "200 mg", form: "Tablet", freq: "As needed", retail: 7, category: "Pain" },
  // GI
  { name: "Omeprazole", aliases: ["Prilosec"], strength: "20 mg", form: "Capsule", freq: "Daily", retail: 10, category: "GI" },
  { name: "Pantoprazole", aliases: ["Protonix"], strength: "40 mg", form: "Tablet", freq: "Daily", retail: 12, category: "GI" },
  // Mental health
  { name: "Sertraline", aliases: ["Zoloft"], strength: "50 mg", form: "Tablet", freq: "Daily", retail: 12, category: "Mental Health" },
  { name: "Escitalopram", aliases: ["Lexapro"], strength: "10 mg", form: "Tablet", freq: "Daily", retail: 14, category: "Mental Health" },
];

export function searchMedCatalog(query: string, limit = 8): MedCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const starts: MedCatalogEntry[] = [];
  const contains: MedCatalogEntry[] = [];
  for (const entry of MED_CATALOG) {
    const haystacks = [entry.name, ...(entry.aliases ?? [])].map((s) => s.toLowerCase());
    if (haystacks.some((h) => h.startsWith(q))) starts.push(entry);
    else if (haystacks.some((h) => h.includes(q))) contains.push(entry);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
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
