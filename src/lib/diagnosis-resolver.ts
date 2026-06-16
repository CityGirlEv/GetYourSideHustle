const MAP: { match: RegExp; dx: string }[] = [
  {
    match:
      /lisinopril|metoprolol|amlodipine|losartan|benazepril|enalapril|diltiazem|nifedipine|clonidine|hydrochlorothiazide|hctz/i,
    dx: "Hypertension",
  },
  {
    match: /atorvastatin|lipitor|crestor|rosuvastatin|simvastatin|pravastatin/i,
    dx: "Hyperlipidemia",
  },
  {
    match: /novolog|humalog|admelog|insulin lispro|insulin glargine|lantus|basaglar|toujeo/i,
    dx: "Type 1 Diabetes (Insulin)",
  },
  { match: /omnipod/i, dx: "Type 1 Diabetes (Pump)" },
  { match: /dexcom|cgm|libre/i, dx: "Type 1 Diabetes (CGM DME)" },
  {
    match:
      /albuterol|advair|spiriva|symbicort|tiotropium|trelegy|montelukast|budesonide|fluticasone.*inhal/i,
    dx: "COPD / Asthma",
  },
  { match: /cpap|bipap/i, dx: "Sleep Apnea (DME)" },
  { match: /levothyroxine|synthroid/i, dx: "Hypothyroidism" },
  {
    match:
      /metformin|jardiance|ozempic|trulicity|mounjaro|glimepiride|sitagliptin|januvia|empagliflozin/i,
    dx: "Type 2 Diabetes",
  },
  {
    match: /eliquis|warfarin|xarelto|clopidogrel|plavix|apixaban|rivaroxaban/i,
    dx: "Anticoagulation",
  },
  {
    match: /entresto|sacubitril|carvedilol|isosorbide|digoxin|spironolactone/i,
    dx: "Heart Failure",
  },
  { match: /alendronate|fosamax|risedronate|actonel/i, dx: "Osteoporosis" },
  { match: /donepezil|aricept|memantine|namenda|galantamine/i, dx: "Alzheimer's Disease" },
  { match: /carbidopa|levodopa|sinemet|ropinirole|pramipexole/i, dx: "Parkinson's Disease" },
  {
    match: /humira|adalimumab|methotrexate|hydroxychloroquine|plaquenil/i,
    dx: "Rheumatoid Arthritis",
  },
  { match: /ocrevus|ocrelizumab|dimethyl fumarate|teriflunomide/i, dx: "Multiple Sclerosis" },
  {
    match:
      /sertraline|escitalopram|duloxetine|cymbalta|trazodone|bupropion|citalopram|fluoxetine|venlafaxine|buspirone|quetiapine|aripiprazole/i,
    dx: "Depression / Anxiety",
  },
  { match: /gabapentin|pregabalin|lyrica/i, dx: "Neuropathy / Pain" },
  { match: /tamsulosin|flomax|finasteride/i, dx: "BPH" },
  { match: /furosemide|lasix|losartan|sevelamer/i, dx: "Chronic Kidney Disease" },
  { match: /omeprazole|pantoprazole|esomeprazole|nexium/i, dx: "GERD" },
  { match: /allopurinol|colchicine/i, dx: "Gout" },
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
// Sources (verified Q4 2025):
//   - Manufacturer WAC / list: https://www.medicare.gov/drug-coverage-comparison
//   - GoodRx national cash avg: https://www.goodrx.com
//   - CMS Part D spending by drug: https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-d-spending-by-drug
//   - CMS Drug Spending portal: https://www.cms.gov/Research-Statistics-Data-and-Systems/Statistics-Trends-and-Reports/Information-on-Prescription-Drugs
// Generic prices reflect typical $4–$15 pharmacy programs (Costco, Walmart, GoodRx).
// Brand prices reflect WAC list — what an uninsured member would pay at retail before any plan discount.
// Anything Medicare classifies as Part B DME (CGMs, insulin pumps, CPAP)
// is excluded from Part D drug-cost math by `isDmeForm()` in
// medicare-math.ts — those items still appear here for the intake list.
export const MED_CATALOG: MedCatalogEntry[] = [
  // Diabetes — oral / injectable (Part D)
  {
    name: "Metformin",
    aliases: ["Glucophage"],
    strength: "500 mg",
    form: "Tablet",
    freq: "Twice daily",
    retail: 4,
    category: "Diabetes",
  },
  {
    name: "Jardiance",
    aliases: ["empagliflozin"],
    strength: "10 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 650,
    category: "Diabetes",
  },
  {
    name: "Ozempic",
    aliases: ["semaglutide"],
    strength: "1 mg",
    form: "Injection",
    freq: "Weekly",
    retail: 998,
    category: "Diabetes",
  },
  {
    name: "Trulicity",
    aliases: ["dulaglutide"],
    strength: "1.5 mg",
    form: "Injection",
    freq: "Weekly",
    retail: 987,
    category: "Diabetes",
  },
  {
    name: "Mounjaro",
    aliases: ["tirzepatide"],
    strength: "5 mg",
    form: "Injection",
    freq: "Weekly",
    retail: 1135,
    category: "Diabetes",
  },
  // Insulin: $35/mo Part D cap per IRA; pre-cap retail shown here.
  {
    name: "Novolog (insulin)",
    aliases: ["insulin aspart"],
    strength: "100 U/mL",
    form: "Vial",
    freq: "With meals",
    retail: 289,
    category: "Diabetes",
  },
  {
    name: "Humalog (insulin)",
    aliases: ["insulin lispro"],
    strength: "100 U/mL",
    form: "Vial",
    freq: "With meals",
    retail: 274,
    category: "Diabetes",
  },
  {
    name: "Lantus (insulin)",
    aliases: ["insulin glargine"],
    strength: "100 U/mL",
    form: "Vial",
    freq: "Daily",
    retail: 340,
    category: "Diabetes",
  },
  // Diabetes DME (Part B, not Part D)
  {
    name: "Dexcom G7",
    aliases: ["dexcom", "cgm"],
    strength: "—",
    form: "CGM (DME)",
    freq: "Continuous",
    retail: 420,
    category: "Diabetes DME",
  },
  {
    name: "Freestyle Libre 3",
    aliases: ["libre", "cgm"],
    strength: "—",
    form: "CGM (DME)",
    freq: "Continuous",
    retail: 140,
    category: "Diabetes DME",
  },
  {
    name: "Omnipod 5",
    aliases: ["omnipod", "insulin pump"],
    strength: "—",
    form: "Insulin Pump (DME)",
    freq: "Continuous",
    retail: 600,
    category: "Diabetes DME",
  },
  // BP — all generic, Walmart/Costco $4–$10 tier
  {
    name: "Lisinopril",
    strength: "10 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 4,
    category: "Hypertension",
  },
  {
    name: "Amlodipine",
    strength: "5 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 5,
    category: "Hypertension",
  },
  {
    name: "Losartan",
    strength: "50 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 8,
    category: "Hypertension",
  },
  {
    name: "Metoprolol",
    strength: "25 mg",
    form: "Tablet",
    freq: "Twice daily",
    retail: 7,
    category: "Hypertension",
  },
  {
    name: "Hydrochlorothiazide",
    aliases: ["HCTZ"],
    strength: "25 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 4,
    category: "Hypertension",
  },
  // Cholesterol — generic statins
  {
    name: "Atorvastatin",
    aliases: ["Lipitor"],
    strength: "20 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 10,
    category: "Cholesterol",
  },
  {
    name: "Rosuvastatin",
    aliases: ["Crestor"],
    strength: "10 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 12,
    category: "Cholesterol",
  },
  {
    name: "Simvastatin",
    aliases: ["Zocor"],
    strength: "20 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 8,
    category: "Cholesterol",
  },
  // Cardiac / anticoag — brand DOACs at WAC
  {
    name: "Eliquis",
    aliases: ["apixaban"],
    strength: "5 mg",
    form: "Tablet",
    freq: "Twice daily",
    retail: 594,
    category: "Anticoagulant",
  },
  {
    name: "Xarelto",
    aliases: ["rivaroxaban"],
    strength: "20 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 564,
    category: "Anticoagulant",
  },
  {
    name: "Warfarin",
    aliases: ["Coumadin"],
    strength: "5 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 12,
    category: "Anticoagulant",
  },
  {
    name: "Aspirin",
    strength: "81 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 5,
    category: "Cardiac",
  },
  // COPD / Asthma — brand inhalers at WAC
  {
    name: "Albuterol",
    aliases: ["ProAir", "Ventolin"],
    strength: "90 mcg",
    form: "Inhaler",
    freq: "As needed",
    retail: 80,
    category: "COPD/Asthma",
  },
  {
    name: "Spiriva",
    aliases: ["tiotropium"],
    strength: "18 mcg",
    form: "Inhaler",
    freq: "Daily",
    retail: 540,
    category: "COPD/Asthma",
  },
  {
    name: "Symbicort",
    strength: "160/4.5 mcg",
    form: "Inhaler",
    freq: "Twice daily",
    retail: 370,
    category: "COPD/Asthma",
  },
  {
    name: "Advair",
    strength: "250/50 mcg",
    form: "Inhaler",
    freq: "Twice daily",
    retail: 420,
    category: "COPD/Asthma",
  },
  {
    name: "Trelegy Ellipta",
    strength: "100/62.5/25 mcg",
    form: "Inhaler",
    freq: "Daily",
    retail: 680,
    category: "COPD/Asthma",
  },
  // Sleep DME (Part B)
  {
    name: "CPAP machine",
    aliases: ["cpap", "bipap"],
    strength: "—",
    form: "CPAP (DME)",
    freq: "Nightly",
    retail: 80,
    category: "Sleep DME",
  },
  // Thyroid
  {
    name: "Levothyroxine",
    aliases: ["Synthroid"],
    strength: "50 mcg",
    form: "Tablet",
    freq: "Daily",
    retail: 10,
    category: "Thyroid",
  },
  // Kidney
  {
    name: "Furosemide",
    aliases: ["Lasix"],
    strength: "40 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 8,
    category: "Kidney",
  },
  {
    name: "Sevelamer",
    strength: "800 mg",
    form: "Tablet",
    freq: "With meals",
    retail: 390,
    category: "Kidney",
  },
  // Cancer (hormone therapy)
  {
    name: "Tamoxifen",
    strength: "20 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 45,
    category: "Oncology",
  },
  {
    name: "Anastrozole",
    aliases: ["Arimidex"],
    strength: "1 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 30,
    category: "Oncology",
  },
  // Pain / arthritis
  {
    name: "Meloxicam",
    strength: "15 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 10,
    category: "Arthritis",
  },
  {
    name: "Celebrex",
    aliases: ["celecoxib"],
    strength: "200 mg",
    form: "Capsule",
    freq: "Daily",
    retail: 25,
    category: "Arthritis",
  },
  {
    name: "Acetaminophen",
    aliases: ["Tylenol"],
    strength: "500 mg",
    form: "Tablet",
    freq: "As needed",
    retail: 8,
    category: "Pain",
  },
  {
    name: "Ibuprofen",
    aliases: ["Advil", "Motrin"],
    strength: "200 mg",
    form: "Tablet",
    freq: "As needed",
    retail: 7,
    category: "Pain",
  },
  // GI
  {
    name: "Omeprazole",
    aliases: ["Prilosec"],
    strength: "20 mg",
    form: "Capsule",
    freq: "Daily",
    retail: 10,
    category: "GI",
  },
  {
    name: "Pantoprazole",
    aliases: ["Protonix"],
    strength: "40 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 12,
    category: "GI",
  },
  // Mental health
  {
    name: "Sertraline",
    aliases: ["Zoloft"],
    strength: "50 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 12,
    category: "Mental Health",
  },
  {
    name: "Escitalopram",
    aliases: ["Lexapro"],
    strength: "10 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 14,
    category: "Mental Health",
  },
  // --- SCEN-QA & high-volume Medicare Part D additions ---
  // Heart / anticoag (generics)
  {
    name: "Clopidogrel",
    aliases: ["Plavix"],
    strength: "75 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 9,
    category: "Cardiac",
  },
  {
    name: "Entresto",
    aliases: ["sacubitril/valsartan"],
    strength: "97/103 mg",
    form: "Tablet",
    freq: "Twice daily",
    retail: 620,
    category: "Heart Failure",
  },
  {
    name: "Carvedilol",
    strength: "25 mg",
    form: "Tablet",
    freq: "Twice daily",
    retail: 8,
    category: "Heart Failure",
  },
  {
    name: "Isosorbide mononitrate",
    strength: "30 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 10,
    category: "Heart Failure",
  },
  {
    name: "Spironolactone",
    strength: "25 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 8,
    category: "Heart Failure",
  },
  {
    name: "Digoxin",
    strength: "0.125 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 10,
    category: "Heart Failure",
  },
  // Additional BP agents
  {
    name: "Benazepril",
    strength: "10 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 6,
    category: "Hypertension",
  },
  {
    name: "Enalapril",
    strength: "10 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 6,
    category: "Hypertension",
  },
  {
    name: "Diltiazem",
    strength: "120 mg",
    form: "Capsule",
    freq: "Daily",
    retail: 10,
    category: "Hypertension",
  },
  {
    name: "Nifedipine",
    aliases: ["Procardia"],
    strength: "30 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 8,
    category: "Hypertension",
  },
  {
    name: "Clonidine",
    strength: "0.1 mg",
    form: "Tablet",
    freq: "Twice daily",
    retail: 8,
    category: "Hypertension",
  },
  // Diabetes — additional orals
  {
    name: "Glimepiride",
    aliases: ["Amaryl"],
    strength: "2 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 8,
    category: "Diabetes",
  },
  {
    name: "Sitagliptin",
    aliases: ["Januvia"],
    strength: "100 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 480,
    category: "Diabetes",
  },
  {
    name: "Insulin Glargine",
    aliases: ["Lantus", "Basaglar", "Toujeo"],
    strength: "100 U/mL",
    form: "Vial",
    freq: "Daily",
    retail: 290,
    category: "Diabetes",
  },
  // COPD / asthma — additional
  {
    name: "Montelukast",
    aliases: ["Singulair"],
    strength: "10 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 12,
    category: "COPD/Asthma",
  },
  {
    name: "Budesonide",
    aliases: ["Pulmicort"],
    strength: "180 mcg",
    form: "Inhaler",
    freq: "Twice daily",
    retail: 280,
    category: "COPD/Asthma",
  },
  {
    name: "Fluticasone inhaler",
    aliases: ["Flovent"],
    strength: "110 mcg",
    form: "Inhaler",
    freq: "Twice daily",
    retail: 260,
    category: "COPD/Asthma",
  },
  {
    name: "Fluticasone nasal",
    aliases: ["Flonase"],
    strength: "50 mcg",
    form: "Nasal spray",
    freq: "Daily",
    retail: 15,
    category: "Allergy",
  },
  // Bone / osteoporosis
  {
    name: "Alendronate",
    aliases: ["Fosamax"],
    strength: "70 mg",
    form: "Tablet",
    freq: "Weekly",
    retail: 18,
    category: "Osteoporosis",
  },
  {
    name: "Risedronate",
    aliases: ["Actonel"],
    strength: "35 mg",
    form: "Tablet",
    freq: "Weekly",
    retail: 25,
    category: "Osteoporosis",
  },
  // Neurology — dementia, Parkinson's, MS
  {
    name: "Donepezil",
    aliases: ["Aricept"],
    strength: "10 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 15,
    category: "Alzheimer's",
  },
  {
    name: "Memantine",
    aliases: ["Namenda"],
    strength: "10 mg",
    form: "Tablet",
    freq: "Twice daily",
    retail: 40,
    category: "Alzheimer's",
  },
  {
    name: "Carbidopa-Levodopa",
    aliases: ["Sinemet"],
    strength: "25-100 mg",
    form: "Tablet",
    freq: "Three times daily",
    retail: 22,
    category: "Parkinson's",
  },
  {
    name: "Ropinirole",
    aliases: ["Requip"],
    strength: "1 mg",
    form: "Tablet",
    freq: "Three times daily",
    retail: 35,
    category: "Parkinson's",
  },
  {
    name: "Ocrevus",
    aliases: ["ocrelizumab"],
    strength: "300 mg/10 mL",
    form: "Infusion",
    freq: "Every 6 months",
    retail: 34000,
    category: "Multiple Sclerosis",
  },
  // Rheumatology / immunology
  {
    name: "Humira",
    aliases: ["adalimumab"],
    strength: "40 mg/0.4 mL",
    form: "Injection",
    freq: "Every 2 weeks",
    retail: 6900,
    category: "Rheumatoid Arthritis",
  },
  {
    name: "Methotrexate",
    strength: "2.5 mg",
    form: "Tablet",
    freq: "Weekly",
    retail: 25,
    category: "Rheumatoid Arthritis",
  },
  {
    name: "Hydroxychloroquine",
    aliases: ["Plaquenil"],
    strength: "200 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 20,
    category: "Rheumatoid Arthritis",
  },
  // Pain / neuropathy
  {
    name: "Gabapentin",
    aliases: ["Neurontin"],
    strength: "300 mg",
    form: "Capsule",
    freq: "Three times daily",
    retail: 15,
    category: "Neuropathy",
  },
  {
    name: "Pregabalin",
    aliases: ["Lyrica"],
    strength: "75 mg",
    form: "Capsule",
    freq: "Twice daily",
    retail: 350,
    category: "Neuropathy",
  },
  {
    name: "Duloxetine",
    aliases: ["Cymbalta"],
    strength: "60 mg",
    form: "Capsule",
    freq: "Daily",
    retail: 30,
    category: "Neuropathy",
  },
  {
    name: "Cyclobenzaprine",
    aliases: ["Flexeril"],
    strength: "10 mg",
    form: "Tablet",
    freq: "At bedtime",
    retail: 8,
    category: "Pain",
  },
  {
    name: "Baclofen",
    strength: "10 mg",
    form: "Tablet",
    freq: "Three times daily",
    retail: 12,
    category: "Pain",
  },
  // Mental health — additional common
  {
    name: "Buspirone",
    strength: "10 mg",
    form: "Tablet",
    freq: "Twice daily",
    retail: 14,
    category: "Mental Health",
  },
  {
    name: "Trazodone",
    strength: "50 mg",
    form: "Tablet",
    freq: "At bedtime",
    retail: 8,
    category: "Mental Health",
  },
  {
    name: "Bupropion",
    aliases: ["Wellbutrin"],
    strength: "150 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 12,
    category: "Mental Health",
  },
  {
    name: "Citalopram",
    aliases: ["Celexa"],
    strength: "20 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 8,
    category: "Mental Health",
  },
  {
    name: "Fluoxetine",
    aliases: ["Prozac"],
    strength: "20 mg",
    form: "Capsule",
    freq: "Daily",
    retail: 8,
    category: "Mental Health",
  },
  {
    name: "Venlafaxine",
    aliases: ["Effexor"],
    strength: "75 mg",
    form: "Capsule",
    freq: "Daily",
    retail: 25,
    category: "Mental Health",
  },
  {
    name: "Quetiapine",
    aliases: ["Seroquel"],
    strength: "50 mg",
    form: "Tablet",
    freq: "At bedtime",
    retail: 15,
    category: "Mental Health",
  },
  {
    name: "Aripiprazole",
    aliases: ["Abilify"],
    strength: "5 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 30,
    category: "Mental Health",
  },
  // Urology / men's health
  {
    name: "Tamsulosin",
    aliases: ["Flomax"],
    strength: "0.4 mg",
    form: "Capsule",
    freq: "Daily",
    retail: 10,
    category: "BPH",
  },
  {
    name: "Finasteride",
    aliases: ["Proscar"],
    strength: "5 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 10,
    category: "BPH",
  },
  // GI — additional
  {
    name: "Esomeprazole",
    aliases: ["Nexium"],
    strength: "40 mg",
    form: "Capsule",
    freq: "Daily",
    retail: 20,
    category: "GI",
  },
  // Gout / inflammation
  {
    name: "Allopurinol",
    strength: "300 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 8,
    category: "Gout",
  },
  {
    name: "Colchicine",
    strength: "0.6 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 12,
    category: "Gout",
  },
  {
    name: "Prednisone",
    strength: "10 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 6,
    category: "Inflammation",
  },
  // Sleep
  {
    name: "Zolpidem",
    aliases: ["Ambien"],
    strength: "10 mg",
    form: "Tablet",
    freq: "At bedtime",
    retail: 15,
    category: "Sleep",
  },
  // Cholesterol — additional
  {
    name: "Pravastatin",
    strength: "40 mg",
    form: "Tablet",
    freq: "Daily",
    retail: 8,
    category: "Cholesterol",
  },
  // Vitamins / supplements (common on Part D claims)
  {
    name: "Cholecalciferol",
    aliases: ["Vitamin D3"],
    strength: "2000 IU",
    form: "Capsule",
    freq: "Daily",
    retail: 5,
    category: "Supplement",
  },
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
export const COMMON_MEDS_BY_CONDITION: Record<
  string,
  { name: string; strength?: string; form?: string; freq?: string; retail?: number }[]
> = {
  Diabetes: [
    { name: "Metformin", strength: "500 mg", form: "Tablet", freq: "Twice daily", retail: 4 },
    { name: "Jardiance", strength: "10 mg", form: "Tablet", freq: "Daily", retail: 650 },
    { name: "Ozempic", strength: "1 mg", form: "Injection", freq: "Weekly", retail: 998 },
    { name: "Trulicity", strength: "1.5 mg", form: "Injection", freq: "Weekly", retail: 987 },
    {
      name: "Novolog (insulin)",
      strength: "100 U/mL",
      form: "Vial",
      freq: "With meals",
      retail: 289,
    },
  ],
  Hypertension: [
    { name: "Lisinopril", strength: "10 mg", form: "Tablet", freq: "Daily", retail: 4 },
    { name: "Amlodipine", strength: "5 mg", form: "Tablet", freq: "Daily", retail: 5 },
    { name: "Losartan", strength: "50 mg", form: "Tablet", freq: "Daily", retail: 8 },
    { name: "Metoprolol", strength: "25 mg", form: "Tablet", freq: "Twice daily", retail: 7 },
  ],
  "Heart disease": [
    { name: "Atorvastatin", strength: "20 mg", form: "Tablet", freq: "Daily", retail: 10 },
    { name: "Eliquis", strength: "5 mg", form: "Tablet", freq: "Twice daily", retail: 594 },
    { name: "Metoprolol", strength: "25 mg", form: "Tablet", freq: "Twice daily", retail: 7 },
    { name: "Aspirin", strength: "81 mg", form: "Tablet", freq: "Daily", retail: 5 },
    { name: "Clopidogrel", strength: "75 mg", form: "Tablet", freq: "Daily", retail: 9 },
    { name: "Entresto", strength: "97/103 mg", form: "Tablet", freq: "Twice daily", retail: 620 },
    { name: "Carvedilol", strength: "25 mg", form: "Tablet", freq: "Twice daily", retail: 8 },
  ],
  COPD: [
    { name: "Albuterol", strength: "90 mcg", form: "Inhaler", freq: "As needed", retail: 80 },
    { name: "Spiriva", strength: "18 mcg", form: "Inhaler", freq: "Daily", retail: 540 },
    {
      name: "Symbicort",
      strength: "160/4.5 mcg",
      form: "Inhaler",
      freq: "Twice daily",
      retail: 370,
    },
    { name: "Advair", strength: "250/50 mcg", form: "Inhaler", freq: "Twice daily", retail: 420 },
  ],
  "Cancer history": [
    { name: "Tamoxifen", strength: "20 mg", form: "Tablet", freq: "Daily", retail: 45 },
    { name: "Anastrozole", strength: "1 mg", form: "Tablet", freq: "Daily", retail: 30 },
  ],
  "Chronic kidney disease": [
    { name: "Furosemide", strength: "40 mg", form: "Tablet", freq: "Daily", retail: 8 },
    { name: "Losartan", strength: "50 mg", form: "Tablet", freq: "Daily", retail: 8 },
    { name: "Sevelamer", strength: "800 mg", form: "Tablet", freq: "With meals", retail: 390 },
  ],
  Arthritis: [
    { name: "Meloxicam", strength: "15 mg", form: "Tablet", freq: "Daily", retail: 10 },
    { name: "Celebrex", strength: "200 mg", form: "Capsule", freq: "Daily", retail: 25 },
    { name: "Acetaminophen", strength: "500 mg", form: "Tablet", freq: "As needed", retail: 8 },
    { name: "Alendronate", strength: "70 mg", form: "Tablet", freq: "Weekly", retail: 18 },
    { name: "Methotrexate", strength: "2.5 mg", form: "Tablet", freq: "Weekly", retail: 25 },
    {
      name: "Humira",
      strength: "40 mg/0.4 mL",
      form: "Injection",
      freq: "Every 2 weeks",
      retail: 6900,
    },
  ],
};

export type CommonMedSuggestion = {
  name: string;
  strength?: string;
  form?: string;
  freq?: string;
  retail?: number;
};

/** Maps free-text or alias condition labels to COMMON_MEDS_BY_CONDITION keys. */
const CONDITION_MED_KEY_ALIASES: { pattern: RegExp; key: string }[] = [
  { pattern: /type 2 diabetes|diabetes|blood sugar|a1c|insulin resistance/i, key: "Diabetes" },
  { pattern: /hypertension|high blood pressure|\bhbp\b/i, key: "Hypertension" },
  { pattern: /heart disease|heart failure|\bchf\b|coronary|cardiac|atrial fibrillation|\bafib\b/i, key: "Heart disease" },
  { pattern: /\bcopd\b|asthma|emphysema|bronch/i, key: "COPD" },
  { pattern: /cancer|oncolog|chemo|tumor|malign/i, key: "Cancer history" },
  { pattern: /kidney|renal|\bckd\b|neph/i, key: "Chronic kidney disease" },
  { pattern: /arthrit|rheumat|joint pain|\bra\b/i, key: "Arthritis" },
];

function catalogMedsForCondition(condition: string, limit = 6): CommonMedSuggestion[] {
  const norm = condition.trim().toLowerCase();
  if (!norm) return [];
  const words = norm.split(/[\s,/]+/).filter((w) => w.length > 2);

  const scored = MED_CATALOG.map((entry) => {
    const cat = (entry.category ?? "").toLowerCase();
    if (!cat) return { entry, score: 0 };
    const catParts = cat.split(/[/\s]+/).filter(Boolean);
    let score = 0;
    if (cat === norm || norm === cat) score = 100;
    else if (cat.includes(norm) || norm.includes(cat)) score = 80;
    else {
      for (const part of catParts) {
        if (part === norm || norm.includes(part) || part.includes(norm)) score = Math.max(score, 60);
      }
      for (const word of words) {
        if (catParts.some((part) => part.includes(word) || word.includes(part))) {
          score = Math.max(score, 50);
        }
      }
    }
    return { entry, score };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ entry }) => ({
    name: entry.name,
    strength: entry.strength,
    form: entry.form,
    freq: entry.freq,
    retail: entry.retail,
  }));
}

/** Resolve common medication suggestions for a condition label (preset or free-text). */
export function getCommonMedsForCondition(condition: string): CommonMedSuggestion[] {
  const trimmed = condition.trim();
  if (!trimmed) return [];

  const exactKey = Object.keys(COMMON_MEDS_BY_CONDITION).find(
    (key) => key.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exactKey) return COMMON_MEDS_BY_CONDITION[exactKey]!;

  for (const { pattern, key } of CONDITION_MED_KEY_ALIASES) {
    if (pattern.test(trimmed) && COMMON_MEDS_BY_CONDITION[key]) {
      return COMMON_MEDS_BY_CONDITION[key]!;
    }
  }

  return catalogMedsForCondition(trimmed);
}
