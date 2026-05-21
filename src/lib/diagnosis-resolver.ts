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
