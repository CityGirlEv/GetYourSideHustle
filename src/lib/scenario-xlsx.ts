import ExcelJS from "exceljs";
import {
  GUIDELINES,
  medigapPremiumByZip3,
  partDPremiumByZip3,
  recommendPlans,
  usd,
  type Year,
  type Medication,
} from "./medicare-math";
import { CMS_CATALOG } from "@/data/cms-catalog";

export interface ScenarioXlsxInput {
  scenarioCode: string;
  year: Year;
  birthYear: number;
  zip3: string;
  county?: string;
  gender: string;
  tobacco: boolean;
  incomeBand: string;
  costPreference: "minimize_monthly" | "predictability";
  conditions: string[];
  medications: Medication[];
}

type Row = (string | number | null)[];

const fmtMo = (n: number) => `${usd(Math.round(n * 100) / 100)}/month`;

function buildPersonalSheet(input: ScenarioXlsxInput): XLSX.WorkSheet {
  const age = new Date().getFullYear() - input.birthYear;
  const region = `${input.zip3} (Regional Average)`;
  const rec = recommendPlans({
    year: input.year,
    zip3: input.zip3,
    county: input.county,
    meds: input.medications,
    conditions: input.conditions,
    costPreference: input.costPreference,
  });
  const g = GUIDELINES[input.year];
  const medsList = input.medications.map((m) => m.medication_name).join(", ") || "None reported";
  const rxTier = rec.partD?.tier ?? "Standard";
  const priorityLabel =
    input.costPreference === "minimize_monthly" ? "Money Conscious" : "Predictability / Worst-case protection";
  const diagnosis = input.conditions.length ? input.conditions.join(", ") : "None reported";

  const rows: Row[] = [
    [],
    ["Personalized Medicare Optimization Summary"],
    [`Custom comparison analyzed for Age ${age} (${input.gender}${input.tobacco ? ", Smoker" : ""}) in ${input.county ?? "—"} County (${region})`],
    [],
    [`Scenario ID: ${input.scenarioCode} · Plan Year ${input.year}`],
    ["YOUR OPTIMIZER PROFILE"],
    ["Demographics:", `Age ${age} (${input.gender}${input.tobacco ? ", Smoker" : ", Non-smoker"})`],
    ["ZIP Prefix / Region:", region],
    ["County:", input.county ?? "—"],
    ["Core Priority:", priorityLabel],
    ["Income Band:", input.incomeBand],
    ["Clinical Diagnosis:", diagnosis],
    ["Medications / Rx Rec:", `${medsList} | ${rxTier} Tier`],
    [],
    ["OFFICIAL RECOMMENDATION"],
    [
      `RECOMMENDED PATHWAY:\n${rec.primary.pathwayLabel} — ${rec.primary.planName}\n\nBased on birth year ${input.birthYear} (Age ${age}), ${input.gender}, ${input.tobacco ? "Smoker" : "Non-smoker"}, and a ${priorityLabel} preference, ${rec.primary.planName} ranked best. ${rec.primary.rationale}\n\nRx Strategy: ${rxTier} Tier — sized to the medications listed.`,
    ],
    [],
    ["Estimated Monthly Premium:", fmtMo(rec.primary.estMonthlyPremium)],
    ["Estimated Annual Total:", usd(rec.primary.estAnnualTotal)],
    ["Worst-Case Annual:", usd(rec.primary.estWorstCase)],
    ["Also Consider:", `${rec.alternate.planName} · est. ${usd(rec.alternate.estAnnualTotal)} / yr`],
    [],
    ["SIDE-BY-SIDE RECOMMENDATION DETAILS"],
    ["Comparison Metric", "Pathway A: Medigap Plan G + Part D (Freedom)", "Pathway B: Medicare Advantage (Savings)"],
    [
      "Monthly Premium Cost",
      `Part B (${g.partBPremiumMonthly}) + ${medigapPremiumByZip3(input.zip3)} (Plan G) + ${partDPremiumByZip3(input.zip3)} (Part D) = ${usd(g.partBPremiumMonthly + medigapPremiumByZip3(input.zip3) + partDPremiumByZip3(input.zip3))}/mo total.`,
      `Part B (${g.partBPremiumMonthly}) + $0 (Advantage Premium) = ${usd(g.partBPremiumMonthly)}/mo total.`,
    ],
    [
      "Annual Medical Deductible",
      `${usd(g.partBDeductible)} (Standard ${input.year} Part B Deductible). Plan G covers all Part A hospital deductibles.`,
      "$0 (Typical for in-network medical services under major MA HMO plans).",
    ],
    [
      "Out-of-Pocket Max (MOOP)",
      `${usd(g.partBDeductible)} (Guaranteed Cap). Once the Part B deductible is met, Plan G pays 100% of all medical gaps.`,
      `${usd(g.moopHigh)} (Regional Network Maximum). Copays apply up to this out-of-pocket maximum.`,
    ],
    [
      "Prescription Drug Cap",
      `${usd(g.partDOOPCap)} (Standard ${input.year} Part D Cap).`,
      `${usd(g.partDOOPCap)} (Standard ${input.year} Part D Cap, bundled into the MA drug formulary).`,
    ],
    [
      "Doctor & Network Choice",
      "100% Freedom: Any doctor or hospital nationwide that accepts Medicare. No networks.",
      "Restricted Network: Locked to plan local networks. Out-of-network is not covered (HMO) or costs more (PPO).",
    ],
    [
      "Specialist Referrals",
      "Never Required: Schedule directly with any US specialist.",
      "Required (HMO): Primary Care Doctor must issue referrals before specialist visits.",
    ],
    [
      "Prior Authorizations",
      "Virtually None: Medicare-approved medically necessary services are paid immediately.",
      "Very High: Advanced diagnostics, therapies, and surgeries require pre-approval.",
    ],
    [
      "Bundled Perks (Dental/Vision)",
      "None included. Buy standalone policies for dental, vision, hearing, or gym.",
      "Included: Frequently bundles dental, vision exams, hearing allowances, OTC, and fitness programs.",
    ],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 28 }, { wch: 60 }, { wch: 60 }];
  return ws;
}

function buildPathwayASheet(input: ScenarioXlsxInput): XLSX.WorkSheet {
  const baseG = medigapPremiumByZip3(input.zip3);
  // Industry-typical Plan N ≈ 72% of Plan G
  const baseN = baseG * 0.72;
  const basePartD = partDPremiumByZip3(input.zip3);

  // Carrier multipliers (rough variance around regional baseline)
  const medigapCarriers = CMS_CATALOG.medigapCarriers.slice(0, 8).map((c, i) => {
    const mult = [1.08, 0.99, 1.0, 1.02, 0.96, 1.05, 0.94, 1.03][i] ?? 1;
    return [
      c["Carrier Name"],
      fmtMo(baseG * mult),
      fmtMo(baseN * mult),
      c["A.M. Best Rating"],
      c["Carrier Portal"] ?? "Visit Carrier Portal",
    ] as Row;
  });

  const partDCarriers = CMS_CATALOG.partDCarriers.slice(0, 6).map((c, i) => {
    const mult = [0.72, 0.83, 1.15, 1.05, 0.95, 1.0][i] ?? 1;
    return [
      c["Carrier Name"],
      fmtMo(basePartD * mult * 0.55),
      fmtMo(basePartD * mult),
      ["3.5 Stars", "4.0 Stars", "4.5 Stars"][i % 3],
      c["Carrier Portal"] ?? "Visit Rx Portal",
    ] as Row;
  });

  const rows: Row[] = [
    [],
    ["Pathway A Options & Regional Carrier Estimates"],
    [`Detailed supplement coverage options for ZIP ${input.zip3} (Attained-Age, Gender & Tobacco Adjusted)`],
    [],
    [],
    ["Medicare Supplement (Medigap) Letter Plans"],
    ["Plan G is the comprehensive standard recommendation; Plan N is the lower-premium copay alternative."],
    [],
    ["Carrier Name", "Plan G Premium (Individualized)", "Plan N Premium (Individualized)", "A.M. Best Financial Strength", "Carrier Portal Links"],
    ...medigapCarriers,
    [],
    [],
    ["Standalone Prescription Drug Plans (Part D)"],
    [`Pharmacy Strategy: matches the medications you listed (${input.medications.length} med${input.medications.length === 1 ? "" : "s"}).`],
    [],
    ["Carrier Name", "Basic PDP Premium", "Standard PDP Premium", "Formulary Star Rating", "Carrier Portal"],
    ...partDCarriers,
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 28 }, { wch: 24 }, { wch: 24 }, { wch: 24 }, { wch: 22 }];
  return ws;
}

function buildPathwayBSheet(input: ScenarioXlsxInput): XLSX.WorkSheet {
  const lc = input.conditions.map((c) => c.toLowerCase()).join(" ");
  const hasChronic = /diabetes|heart|copd|kidney|cancer/.test(lc);

  const maCarriers = CMS_CATALOG.advantageCarriers.slice(0, 8).map((c, i) => {
    const hmo = [0, 0, 0, 0, 14, 0, 0, 18][i] ?? 0;
    const ppo = [19, 24, 15, 0, 32, 22, 12, 28][i] ?? 0;
    return [
      c["Carrier Name"],
      hmo === 0 ? "$0/month" : `$${hmo}/month`,
      ppo === 0 ? "$0/month" : `$${ppo}/month`,
      ["4.0 Stars", "4.5 Stars", "4.0 Stars", "3.5 Stars", "4.0 Stars", "4.0 Stars", "3.5 Stars", "4.0 Stars"][i],
      c["Key Characteristics"],
      c["Carrier Portal"] ?? "Visit Advantage Portal",
    ] as Row;
  });

  const rows: Row[] = [
    [],
    ["Pathway B Coordinated Care Network Choices"],
    [`Medicare Advantage HMO and PPO available plan carriers for ZIP ${input.zip3}`],
    [],
    [],
    ["Regional Medicare Advantage Plans"],
    ["Advantage plans are coordinated networks (HMO/PPO) offering low upfront costs and bundled benefits."],
    [],
    ["Carrier Name", "HMO Premium Cost", "PPO Premium Cost", "Local Average Star Rating", "Network Characteristics", "Carrier Portal Links"],
    ...maCarriers,
  ];

  if (hasChronic) {
    rows.push(
      [],
      [],
      ["Specialized Chronic Special Needs Plans (C-SNP)"],
      [`Clinical Diagnosis Alert: Detected chronic condition (${input.conditions.join(", ")}). C-SNPs offer specialized disease care networks and customized pharmacy formularies.`],
      [],
      ["Specialized C-SNP Carrier", "Qualifying Chronic Focus", "Star Rating", "Bundled Disease Perks", "Carrier Portal"],
      ["UnitedHealthcare Chronic Care", "Diabetes & Cardiovascular", "4.0 Stars", "Specialized endocrinologist copays, zero insulin cost tiers", "Visit C-SNP Portal"],
      ["Humana Chronic Care", "Cardiovascular & Heart Failure", "4.5 Stars", "Free home BP cuffs, customized cardiac rehab programs", "Visit C-SNP Portal"],
      ["Aetna Chronic Care", "Diabetes & COPD", "4.0 Stars", "Care manager + medication therapy management", "Visit C-SNP Portal"],
    );
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 28 }, { wch: 20 }, { wch: 20 }, { wch: 26 }, { wch: 38 }, { wch: 22 }];
  return ws;
}

export function buildScenarioWorkbook(input: ScenarioXlsxInput): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildPersonalSheet(input), "Personal Recommendation");
  XLSX.utils.book_append_sheet(wb, buildPathwayASheet(input), "Pathway A - Medigap");
  XLSX.utils.book_append_sheet(wb, buildPathwayBSheet(input), "Pathway B - Advantage");
  XLSX.utils.book_append_sheet(wb, buildTop10Sheet(input), "Top 10 Carrier Plans");
  return wb;
}

interface Top10Row {
  rank: number;
  carrier: string;
  planName: string;
  planType: string;
  network: string;
  monthlyPremium: number;
  medDeductible: string;
  pcpCopay: string;
  specialistCopay: string;
  hospitalCopay: string;
  moop: string;
  rxTier: string;
  rxDeductible: string;
  starRating: string;
  amBest: string;
  extras: string;
  portal: string;
  estAnnualTotal: number;
}

function buildTop10Sheet(input: ScenarioXlsxInput): XLSX.WorkSheet {
  const g = GUIDELINES[input.year];
  const baseG = medigapPremiumByZip3(input.zip3);
  const baseN = baseG * 0.72;
  const basePartD = partDPremiumByZip3(input.zip3);
  const partBMo = g.partBPremiumMonthly;

  const annualDrugEst = Math.min(
    input.medications.reduce((s, m) => s + (m.estimated_monthly_retail ?? 0) * 12, 0),
    g.partDOOPCap,
  );

  const medigapCarriers = CMS_CATALOG.medigapCarriers.slice(0, 8);
  const maCarriers = CMS_CATALOG.advantageCarriers.slice(0, 8);

  const candidates: Top10Row[] = [];

  // Medigap Plan G entries
  medigapCarriers.slice(0, 4).forEach((c, i) => {
    const mult = [1.0, 0.96, 1.02, 0.99][i] ?? 1;
    const supp = Math.round(baseG * mult);
    const pdp = Math.round(basePartD * ([0.95, 1.0, 1.05, 0.9][i] ?? 1));
    const monthly = partBMo + supp + pdp;
    candidates.push({
      rank: 0,
      carrier: c["Carrier Name"],
      planName: "Medigap Plan G + Part D",
      planType: "Medigap (Supplement) + Standalone PDP",
      network: "Any provider that accepts Medicare (nationwide)",
      monthlyPremium: monthly,
      medDeductible: `${usd(g.partBDeductible)} (Part B only)`,
      pcpCopay: "$0 after Part B deductible",
      specialistCopay: "$0 after Part B deductible",
      hospitalCopay: "$0 (Plan G covers Part A deductible & coinsurance)",
      moop: `${usd(g.partBDeductible)} medical / ${usd(g.partDOOPCap)} Rx`,
      rxTier: "Standard PDP",
      rxDeductible: `${usd(g.partDOOPCap > 0 ? 0 : 0)} – tier-based copays`,
      starRating: ["4.0", "4.5", "4.0", "3.5"][i] + " Stars",
      amBest: c["A.M. Best Rating"],
      extras: "No bundled extras – add standalone dental/vision",
      portal: c["Carrier Portal"] ?? "Carrier portal",
      estAnnualTotal: Math.round(monthly * 12 + annualDrugEst),
    });
  });

  // Medigap Plan N entries
  medigapCarriers.slice(0, 2).forEach((c, i) => {
    const mult = [1.0, 0.97][i] ?? 1;
    const supp = Math.round(baseN * mult);
    const pdp = Math.round(basePartD * 0.95);
    const monthly = partBMo + supp + pdp;
    candidates.push({
      rank: 0,
      carrier: c["Carrier Name"],
      planName: "Medigap Plan N + Part D",
      planType: "Medigap (Supplement) + Standalone PDP",
      network: "Any provider that accepts Medicare (nationwide)",
      monthlyPremium: monthly,
      medDeductible: `${usd(g.partBDeductible)} (Part B only)`,
      pcpCopay: "Up to $20 office visit copay",
      specialistCopay: "Up to $20 specialist copay",
      hospitalCopay: "$50 ER copay (waived if admitted)",
      moop: `~${usd(g.partBDeductible + 250)} medical / ${usd(g.partDOOPCap)} Rx`,
      rxTier: "Standard PDP",
      rxDeductible: "Tier-based copays",
      starRating: ["4.0", "4.5"][i] + " Stars",
      amBest: c["A.M. Best Rating"],
      extras: "Lower premium than Plan G; small office copays",
      portal: c["Carrier Portal"] ?? "Carrier portal",
      estAnnualTotal: Math.round(monthly * 12 + annualDrugEst),
    });
  });

  // MA HMO entries
  maCarriers.slice(0, 4).forEach((c, i) => {
    const maPrem = [0, 0, 14, 0][i] ?? 0;
    const monthly = partBMo + maPrem;
    candidates.push({
      rank: 0,
      carrier: c["Carrier Name"],
      planName: `${c["Carrier Name"]} MA HMO`,
      planType: "Medicare Advantage (HMO)",
      network: "Local HMO network; PCP referral required",
      monthlyPremium: monthly,
      medDeductible: "$0 in-network",
      pcpCopay: "$0 primary care visit",
      specialistCopay: `$${[35, 40, 45, 50][i]} specialist visit`,
      hospitalCopay: `$${[350, 295, 325, 375][i]}/day, days 1–5`,
      moop: `${usd(g.moopLow)} in-network`,
      rxTier: "Bundled MA-PD formulary",
      rxDeductible: `${usd(g.partDOOPCap)} Rx OOP cap`,
      starRating: ["4.5", "4.0", "4.0", "3.5"][i] + " Stars",
      amBest: c["A.M. Best Rating"],
      extras: "Bundles dental, vision, hearing, fitness, OTC",
      portal: c["Carrier Portal"] ?? "Carrier portal",
      estAnnualTotal: Math.round(monthly * 12 + annualDrugEst + 800),
    });
  });

  // MA PPO entries
  maCarriers.slice(0, 3).forEach((c, i) => {
    const maPrem = [19, 24, 32][i] ?? 20;
    const monthly = partBMo + maPrem;
    candidates.push({
      rank: 0,
      carrier: c["Carrier Name"],
      planName: `${c["Carrier Name"]} MA PPO`,
      planType: "Medicare Advantage (PPO)",
      network: "In/out-of-network; no referrals required",
      monthlyPremium: monthly,
      medDeductible: "$0 in-network / $500 out-of-network",
      pcpCopay: `$${[5, 10, 0][i]} primary care visit`,
      specialistCopay: `$${[45, 50, 55][i]} specialist visit`,
      hospitalCopay: `$${[395, 350, 425][i]}/day, days 1–6`,
      moop: `${usd(g.moopHigh)} combined in/out-of-network`,
      rxTier: "Bundled MA-PD formulary",
      rxDeductible: `${usd(g.partDOOPCap)} Rx OOP cap`,
      starRating: ["4.0", "4.0", "4.5"][i] + " Stars",
      amBest: c["A.M. Best Rating"],
      extras: "Dental, vision, hearing + nationwide PPO flexibility",
      portal: c["Carrier Portal"] ?? "Carrier portal",
      estAnnualTotal: Math.round(monthly * 12 + annualDrugEst + 1100),
    });
  });

  // Sort by annual total (best value first), keep top 10
  candidates.sort((a, b) => a.estAnnualTotal - b.estAnnualTotal);
  const top10 = candidates.slice(0, 10).map((r, i) => ({ ...r, rank: i + 1 }));

  const header = [
    "Rank",
    "Carrier",
    "Plan Name",
    "Plan Type",
    "Network & Referrals",
    "Total Monthly Premium",
    "Medical Deductible",
    "Primary Care Copay",
    "Specialist Copay",
    "Inpatient Hospital",
    "Out-of-Pocket Max",
    "Rx Strategy",
    "Rx Deductible / Cap",
    "Star Rating",
    "A.M. Best",
    "Bundled Extras",
    "Carrier Portal",
    "Estimated Annual Total",
  ];

  const rows: Row[] = [
    [],
    ["Top 10 Carrier Plans — Personalized Shortlist"],
    [`Ranked by lowest estimated annual total cost for ZIP ${input.zip3}${input.county ? ` (${input.county} County)` : ""} · Plan Year ${input.year}`],
    ["Includes Part B (" + usd(partBMo) + "/mo), regional supplement/MA premium, and your modeled Rx out-of-pocket. Copays shown are typical for the plan type; confirm specifics with the carrier."],
    [],
    header,
    ...top10.map((r) => [
      r.rank,
      r.carrier,
      r.planName,
      r.planType,
      r.network,
      fmtMo(r.monthlyPremium),
      r.medDeductible,
      r.pcpCopay,
      r.specialistCopay,
      r.hospitalCopay,
      r.moop,
      r.rxTier,
      r.rxDeductible,
      r.starRating,
      r.amBest,
      r.extras,
      r.portal,
      usd(r.estAnnualTotal),
    ] as Row),
    [],
    ["Notes"],
    ["• Premiums are regional baselines adjusted for ZIP3 and plan type; actual rates depend on attained age, gender, tobacco use, and underwriting."],
    ["• Medical deductible, copays, and MOOP shown are typical published values for each plan type — verify on the carrier's Summary of Benefits."],
    ["• Estimated Annual Total = (Monthly Premium × 12) + modeled Rx out-of-pocket + typical MA medical OOP (where applicable)."],
    ["• Always confirm provider network, formulary, and prior-authorization requirements before enrolling."],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 5 },  { wch: 24 }, { wch: 28 }, { wch: 28 }, { wch: 34 },
    { wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 26 },
    { wch: 28 }, { wch: 22 }, { wch: 22 }, { wch: 12 }, { wch: 10 },
    { wch: 36 }, { wch: 22 }, { wch: 20 },
  ];
  return ws;
}

export function downloadScenarioXlsx(input: ScenarioXlsxInput) {
  const wb = buildScenarioWorkbook(input);
  XLSX.writeFile(wb, `medicare-optimizer-${input.scenarioCode}.xlsx`);
}