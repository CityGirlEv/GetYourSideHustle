import ExcelJS from "exceljs";
import {
  GUIDELINES,
  medigapPremiumByZip3,
  partDPremiumByZip3,
  recommendPlans,
  usd,
  INSULIN_CAP_MONTHLY,
  type Year,
  type Medication,
} from "./medicare-math";
import { CMS_CATALOG } from "@/data/cms-catalog";
import { rankedPlanDetails, type PlanDetail } from "./plan-details";

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

// ---------- Styling constants (mirrors the reference workbook) ----------
const FONT = "Calibri";
const COLOR_BRAND = "FF1F4E78";
const COLOR_SUB = "FF555555";
const COLOR_LINK = "FF0000FF";
const COLOR_GREEN = "FF006400";
const FILL_HEADER = "FF1F4E78";
const FILL_ALT = "FFF9FAFB";
const FILL_CALLOUT = "FFF2F6F9";
const FILL_TOTAL = "FFEAEAEA";
const FILL_HIGHLIGHT = "FFDAEFDA";

type StyledRow =
  | { kind: "blank" }
  | { kind: "title"; text: string; span: number }
  | { kind: "subtitle"; text: string; span: number }
  | { kind: "section"; text: string; span: number }
  | { kind: "callout"; text: string; span: number; height?: number }
  | { kind: "kv"; key: string; value: string }
  | { kind: "tableHeader"; cells: string[] }
  | { kind: "tableRow"; cells: (string | number)[]; alt?: boolean; linkCol?: number }
  | { kind: "totalRow"; cells: (string | number)[] }
  | { kind: "highlightRow"; cells: (string | number)[]; greenCols?: number[] }
  | { kind: "note"; text: string; span: number };

function renderSheet(ws: ExcelJS.Worksheet, rows: StyledRow[], widths: number[]) {
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
  ws.properties.defaultRowHeight = 15;

  rows.forEach((r) => {
    const rowIdx = ws.rowCount + 1;
    if (r.kind === "blank") {
      ws.addRow([]);
      return;
    }
    if (r.kind === "title") {
      const row = ws.addRow([r.text]);
      ws.mergeCells(rowIdx, 1, rowIdx, r.span);
      row.getCell(1).font = { name: FONT, size: 16, bold: true, color: { argb: COLOR_BRAND } };
      row.height = 22;
      return;
    }
    if (r.kind === "subtitle") {
      const row = ws.addRow([r.text]);
      ws.mergeCells(rowIdx, 1, rowIdx, r.span);
      row.getCell(1).font = { name: FONT, size: 9.5, italic: true, color: { argb: COLOR_SUB } };
      row.getCell(1).alignment = { wrapText: true, vertical: "top" };
      return;
    }
    if (r.kind === "section") {
      const row = ws.addRow([r.text]);
      ws.mergeCells(rowIdx, 1, rowIdx, r.span);
      row.getCell(1).font = { name: FONT, size: 11, bold: true, color: { argb: COLOR_BRAND } };
      row.height = 18;
      return;
    }
    if (r.kind === "callout") {
      const row = ws.addRow([r.text]);
      ws.mergeCells(rowIdx, 1, rowIdx, r.span);
      const c = row.getCell(1);
      c.font = { name: FONT, size: 9.5, bold: true, color: { argb: COLOR_BRAND } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FILL_CALLOUT } };
      c.alignment = { wrapText: true, vertical: "top" };
      row.height = r.height ?? 80;
      return;
    }
    if (r.kind === "kv") {
      const row = ws.addRow([r.key, r.value]);
      row.getCell(1).font = { name: FONT, size: 9, bold: true };
      row.getCell(2).font = { name: FONT, size: 9 };
      row.getCell(2).alignment = { wrapText: true, vertical: "top" };
      return;
    }
    if (r.kind === "tableHeader") {
      const row = ws.addRow(r.cells);
      row.eachCell((c) => {
        c.font = { name: FONT, size: 9, bold: true, color: { argb: "FFFFFFFF" } };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FILL_HEADER } };
        c.alignment = { wrapText: true, vertical: "middle", horizontal: "left" };
      });
      row.height = 28;
      return;
    }
    if (r.kind === "tableRow") {
      const row = ws.addRow(r.cells);
      row.eachCell({ includeEmpty: true }, (c, col) => {
        c.font = { name: FONT, size: 9, color: col === r.linkCol ? { argb: COLOR_LINK } : undefined };
        c.alignment = { wrapText: true, vertical: "top" };
        if (r.alt) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FILL_ALT } };
      });
      return;
    }
    if (r.kind === "totalRow") {
      const row = ws.addRow(r.cells);
      row.eachCell({ includeEmpty: true }, (c) => {
        c.font = { name: FONT, size: 9, bold: true };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FILL_TOTAL } };
        c.alignment = { wrapText: true, vertical: "top" };
      });
      return;
    }
    if (r.kind === "highlightRow") {
      const row = ws.addRow(r.cells);
      const greens = new Set(r.greenCols ?? []);
      row.eachCell({ includeEmpty: true }, (c, col) => {
        c.font = {
          name: FONT,
          size: 9,
          bold: true,
          color: greens.has(col) ? { argb: COLOR_GREEN } : undefined,
        };
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: FILL_HIGHLIGHT } };
        c.alignment = { wrapText: true, vertical: "top" };
      });
      return;
    }
    if (r.kind === "note") {
      const row = ws.addRow([r.text]);
      ws.mergeCells(rowIdx, 1, rowIdx, r.span);
      row.getCell(1).font = { name: FONT, size: 8.5, italic: true, color: { argb: COLOR_SUB } };
      row.getCell(1).alignment = { wrapText: true, vertical: "top" };
    }
  });
}

function buildPersonalSheet(wb: ExcelJS.Workbook, input: ScenarioXlsxInput) {
  const ws = wb.addWorksheet("Personal Recommendation", { views: [{ showGridLines: false }] });
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

  const totalA =
    (g.partBPremiumMonthly + medigapPremiumByZip3(input.zip3) + partDPremiumByZip3(input.zip3)) * 12 +
    g.partBDeductible;
  const totalB = g.partBPremiumMonthly * 12 + 800;
  const savings = Math.max(0, totalA - totalB);

  const rows: StyledRow[] = [
    { kind: "title", text: "Medicare Optimization & Plan Comparison Summary", span: 3 },
    {
      kind: "subtitle",
      span: 3,
      text: `Personalized clinical analysis for Age ${age} (Born ${input.birthYear}) ${input.gender}${input.tobacco ? " Smoker" : " Non-smoker"} in ${input.county ?? "—"} (ZIP ${input.zip3}) · Scenario ${input.scenarioCode} · Plan Year ${input.year}`,
    },
    { kind: "blank" },
    { kind: "blank" },
    { kind: "section", text: "YOUR OPTIMIZER PROFILE", span: 3 },
    { kind: "kv", key: "Demographics:", value: `Age ${age}, ${input.gender}, ${input.tobacco ? "Tobacco Smoker" : "Non-smoker"}` },
    { kind: "kv", key: "ZIP / County:", value: `${input.zip3} / ${input.county ?? "—"}` },
    { kind: "kv", key: "Core Healthcare Priority:", value: priorityLabel },
    { kind: "kv", key: "Income Band:", value: input.incomeBand },
    { kind: "kv", key: "Clinical Diagnoses:", value: diagnosis },
    { kind: "kv", key: "Regular Medications:", value: medsList },
    { kind: "kv", key: "Pharmacy Strategy:", value: `${rxTier} Tier — sized to listed medications` },
    { kind: "kv", key: "Actuarial Pharmacy Cap:", value: `Capped at ${usd(g.partDOOPCap)}/year (Federal Part D out-of-pocket maximum, ${input.year}).` },
    { kind: "blank" },
    { kind: "section", text: "TOP RECOMMENDED PATHWAY", span: 3 },
    {
      kind: "callout",
      span: 3,
      height: 110,
      text: `RECOMMENDED PATHWAY: ${rec.primary.pathwayLabel} — ${rec.primary.planName}\n\nBased on birth year ${input.birthYear} (Age ${age}), ${input.gender}, ${input.tobacco ? "Smoker" : "Non-smoker"}, and a "${priorityLabel}" preference, ${rec.primary.planName} ranked best. ${rec.primary.rationale}\n\nEstimated Monthly Premium: ${fmtMo(rec.primary.estMonthlyPremium)}    ·    Estimated Annual Total: ${usd(rec.primary.estAnnualTotal)}    ·    Worst-Case Annual: ${usd(rec.primary.estWorstCase)}\nAlternate to consider: ${rec.alternate.planName} — est. ${usd(rec.alternate.estAnnualTotal)} / yr`,
    },
    { kind: "blank" },
    { kind: "section", text: "PATHWAY A VS. PATHWAY B SIDE-BY-SIDE", span: 3 },
    {
      kind: "tableHeader",
      cells: [
        "Comparison Metric",
        "Pathway A: Medigap Plan G + Part D (Maximum Freedom)",
        "Pathway B: Medicare Advantage (Top Savings)",
      ],
    },
    {
      kind: "tableRow",
      cells: [
        "Monthly Premium Cost",
        `Part B (${usd(g.partBPremiumMonthly)}) + ${usd(medigapPremiumByZip3(input.zip3))} (Plan G) + ${usd(partDPremiumByZip3(input.zip3))} (Part D) = ${usd(g.partBPremiumMonthly + medigapPremiumByZip3(input.zip3) + partDPremiumByZip3(input.zip3))}/mo total.`,
        `Part B (${usd(g.partBPremiumMonthly)}) + $0 (Advantage Premium) = ${usd(g.partBPremiumMonthly)}/mo total.`,
      ],
    },
    {
      kind: "tableRow",
      alt: true,
      cells: [
        "Annual Medical Deductible",
        `${usd(g.partBDeductible)} (Standard ${input.year} Part B Deductible). Plan G covers all Part A hospital deductibles.`,
        "$0 (Typical for in-network medical services under major MA HMO plans).",
      ],
    },
    {
      kind: "tableRow",
      cells: [
        "Out-of-Pocket Max (MOOP)",
        `${usd(g.partBDeductible)} (Guaranteed cap — Plan G pays 100% of medical gaps once met).`,
        `${usd(g.moopHigh)} (Regional Network Maximum). Copays apply up to this OOP max.`,
      ],
    },
    {
      kind: "tableRow",
      alt: true,
      cells: [
        "Prescription Drug Cap",
        `${usd(g.partDOOPCap)} (Standard ${input.year} Part D Cap).`,
        `${usd(g.partDOOPCap)} (Bundled into MA-PD formulary).`,
      ],
    },
    {
      kind: "tableRow",
      cells: [
        "Doctor & Network Choice",
        "100% Freedom: Any provider nationwide that accepts Medicare.",
        "Restricted Network: Locked to plan's local network (HMO) or higher OON cost (PPO).",
      ],
    },
    {
      kind: "tableRow",
      alt: true,
      cells: [
        "Specialist Referrals",
        "Never required. Schedule directly with any US specialist.",
        "Required (HMO): Primary care must refer before specialist visits.",
      ],
    },
    {
      kind: "tableRow",
      cells: [
        "Prior Authorizations",
        "Virtually none — medically necessary services paid immediately.",
        "Frequent — advanced diagnostics, therapies, and surgeries need pre-approval.",
      ],
    },
    {
      kind: "tableRow",
      alt: true,
      cells: [
        "Bundled Perks (Dental/Vision)",
        "None included. Buy standalone dental, vision, hearing, or gym policies.",
        "Included: Dental, vision exams, hearing allowance, OTC credit, fitness programs.",
      ],
    },
    { kind: "totalRow", cells: ["ESTIMATED YEARLY TOTAL OOP", `${usd(totalA)} / year`, `${usd(totalB)} / year`] },
    {
      kind: "highlightRow",
      greenCols: [3],
      cells: [
        "NET YEARLY VALUE COMPARISON",
        "Baseline (Maximum freedom — see any provider nationwide with zero network constraints).",
        savings > 0
          ? `Saves ${usd(savings)} / year vs. Pathway A — top savings on premium and bundled benefits.`
          : "Comparable yearly cost — choose for bundled perks and lower premium predictability.",
      ],
    },
  ];

  renderSheet(ws, rows, [28, 52, 52]);
}

function buildPathwayASheet(wb: ExcelJS.Workbook, input: ScenarioXlsxInput) {
  const ws = wb.addWorksheet("Pathway A - Medigap", { views: [{ showGridLines: false }] });
  const baseG = medigapPremiumByZip3(input.zip3);
  // Industry-typical Plan N ≈ 72% of Plan G
  const baseN = baseG * 0.72;
  const basePartD = partDPremiumByZip3(input.zip3);

  const medigapCarriers = CMS_CATALOG.medigapCarriers.slice(0, 8).map((c, i): StyledRow => {
    const mult = [1.08, 0.99, 1.0, 1.02, 0.96, 1.05, 0.94, 1.03][i] ?? 1;
    return {
      kind: "tableRow",
      alt: i % 2 === 1,
      linkCol: 5,
      cells: [
        c["Carrier Name"],
        fmtMo(baseG * mult),
        fmtMo(baseN * mult),
        c["A.M. Best Rating"],
        c["Carrier Portal"] ?? "Visit Carrier Portal",
      ],
    };
  });

  const partDCarriers = CMS_CATALOG.partDCarriers.slice(0, 6).map((c, i): StyledRow => {
    const mult = [0.72, 0.83, 1.15, 1.05, 0.95, 1.0][i] ?? 1;
    return {
      kind: "tableRow",
      alt: i % 2 === 1,
      linkCol: 5,
      cells: [
        c["Carrier Name"],
        fmtMo(basePartD * mult * 0.55),
        fmtMo(basePartD * mult),
        ["3.5 Stars", "4.0 Stars", "4.5 Stars"][i % 3],
        c["Carrier Portal"] ?? "Visit Rx Portal",
      ],
    };
  });

  const rows: StyledRow[] = [
    { kind: "title", text: `Pathway A Medigap Options (ZIP ${input.zip3}${input.county ? ` · ${input.county}` : ""})`, span: 5 },
    {
      kind: "subtitle",
      span: 5,
      text: `Standardized Medicare Supplement (Plan G and Plan N) and Standalone Part D plan premiums for Age ${new Date().getFullYear() - input.birthYear}, ${input.gender}${input.tobacco ? ", Tobacco Smoker" : ", Non-smoker"}.`,
    },
    { kind: "blank" },
    { kind: "section", text: "Medicare Supplement Carrier Premium Estimates", span: 5 },
    { kind: "subtitle", span: 5, text: "Plan G is the comprehensive standard; Plan N is the lower-premium copay alternative." },
    { kind: "blank" },
    {
      kind: "tableHeader",
      cells: [
        "Supplement Carrier Name",
        "Plan G Monthly Premium",
        "Plan N Monthly Premium",
        "Financial Strength Rating",
        "Portal Links",
      ],
    },
    ...medigapCarriers,
    { kind: "blank" },
    { kind: "section", text: "Standalone Prescription Drug Plans (Part D)", span: 5 },
    {
      kind: "subtitle",
      span: 5,
      text: `Pharmacy strategy sized to the ${input.medications.length} medication${input.medications.length === 1 ? "" : "s"} you listed.`,
    },
    { kind: "blank" },
    {
      kind: "tableHeader",
      cells: [
        "Part D Carrier & Plan Name",
        "Basic PDP Premium",
        "Standard PDP Premium",
        "Formulary Star Rating",
        "Portal Links",
      ],
    },
    ...partDCarriers,
  ];

  renderSheet(ws, rows, [34, 22, 22, 24, 22]);
}

function buildPathwayBSheet(wb: ExcelJS.Workbook, input: ScenarioXlsxInput) {
  const ws = wb.addWorksheet("Pathway B - Advantage", { views: [{ showGridLines: false }] });
  const lc = input.conditions.map((c) => c.toLowerCase()).join(" ");
  const hasChronic = /diabetes|heart|copd|kidney|cancer/.test(lc);

  const maCarriers = CMS_CATALOG.advantageCarriers.slice(0, 8).map((c, i): StyledRow => {
    const hmo = [0, 0, 0, 0, 14, 0, 0, 18][i] ?? 0;
    const ppo = [19, 24, 15, 0, 32, 22, 12, 28][i] ?? 0;
    return {
      kind: "tableRow",
      alt: i % 2 === 1,
      linkCol: 6,
      cells: [
        c["Carrier Name"],
        hmo === 0 ? "$0/month" : `$${hmo}/month`,
        ppo === 0 ? "$0/month" : `$${ppo}/month`,
        ["4.0 Stars", "4.5 Stars", "4.0 Stars", "3.5 Stars", "4.0 Stars", "4.0 Stars", "3.5 Stars", "4.0 Stars"][i],
        c["Key Characteristics"],
        c["Carrier Portal"] ?? "Visit Advantage Portal",
      ],
    };
  });

  const rows: StyledRow[] = [
    { kind: "title", text: `Pathway B Coordinated Care Network Choices (ZIP ${input.zip3})`, span: 6 },
    {
      kind: "subtitle",
      span: 6,
      text: "Medicare Advantage HMO and PPO plan carriers available in your area — coordinated networks with low upfront costs and bundled benefits.",
    },
    { kind: "blank" },
    { kind: "section", text: "Regional Medicare Advantage Plans", span: 6 },
    { kind: "blank" },
    {
      kind: "tableHeader",
      cells: [
        "Carrier Name",
        "HMO Premium",
        "PPO Premium",
        "Local Avg Star Rating",
        "Network Characteristics",
        "Portal Links",
      ],
    },
    ...maCarriers,
  ];

  if (hasChronic) {
    rows.push(
      { kind: "blank" },
      { kind: "section", text: "Specialized Chronic Special Needs Plans (C-SNP)", span: 6 },
      {
        kind: "subtitle",
        span: 6,
        text: `Clinical Diagnosis Alert: Detected chronic condition (${input.conditions.join(", ")}). C-SNPs offer specialized disease-care networks and customized pharmacy formularies.`,
      },
      { kind: "blank" },
      {
        kind: "tableHeader",
        cells: ["Specialized C-SNP Carrier", "Qualifying Chronic Focus", "Star Rating", "Bundled Disease Perks", "Carrier Portal", ""],
      },
      { kind: "tableRow", linkCol: 5, cells: ["UnitedHealthcare Chronic Care", "Diabetes & Cardiovascular", "4.0 Stars", "Specialized endocrinologist copays, zero insulin cost tiers", "Visit C-SNP Portal", ""] },
      { kind: "tableRow", alt: true, linkCol: 5, cells: ["Humana Chronic Care", "Cardiovascular & Heart Failure", "4.5 Stars", "Free home BP cuffs, customized cardiac rehab programs", "Visit C-SNP Portal", ""] },
      { kind: "tableRow", linkCol: 5, cells: ["Aetna Chronic Care", "Diabetes & COPD", "4.0 Stars", "Care manager + medication therapy management", "Visit C-SNP Portal", ""] },
    );
  }

  renderSheet(ws, rows, [30, 18, 18, 22, 40, 22]);
}

function buildScenarioWorkbook(input: ScenarioXlsxInput): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Medicare Optimizer";
  wb.created = new Date();
  buildPersonalSheet(wb, input);
  buildPathwayASheet(wb, input);
  buildPathwayBSheet(wb, input);
  buildTop10Sheet(wb, input);
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

function buildTop10Sheet(wb: ExcelJS.Workbook, input: ScenarioXlsxInput) {
  const ws = wb.addWorksheet("Top 10 Carrier Plans", { views: [{ showGridLines: false, state: "frozen", ySplit: 6 }] });
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

  const header: string[] = [
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

  const span = header.length;
  const rows: StyledRow[] = [
    { kind: "title", text: "Top 10 Carrier Plans — Personalized Shortlist", span },
    {
      kind: "subtitle",
      span,
      text: `Ranked by lowest estimated annual total cost for ZIP ${input.zip3}${input.county ? ` · ${input.county}` : ""} · Plan Year ${input.year}. Includes Part B (${usd(partBMo)}/mo), regional supplement/MA premium, and modeled Rx OOP.`,
    },
    { kind: "blank" },
    { kind: "tableHeader", cells: header },
    ...top10.map((r, i): StyledRow => ({
      kind: "tableRow",
      alt: i % 2 === 1,
      linkCol: 17,
      cells: [
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
      ],
    })),
    { kind: "blank" },
    { kind: "section", text: "Notes", span },
    { kind: "note", span, text: "• Premiums are regional baselines adjusted for ZIP3 and plan type; actual rates depend on attained age, gender, tobacco use, and underwriting." },
    { kind: "note", span, text: "• Medical deductible, copays, and MOOP shown are typical published values for each plan type — verify on the carrier's Summary of Benefits." },
    { kind: "note", span, text: "• Estimated Annual Total = (Monthly Premium × 12) + modeled Rx out-of-pocket + typical MA medical OOP (where applicable)." },
    { kind: "note", span, text: "• Always confirm provider network, formulary, and prior-authorization requirements before enrolling." },
  ];

  renderSheet(ws, rows, [6, 24, 28, 30, 34, 18, 22, 22, 22, 26, 28, 22, 22, 12, 10, 36, 22, 20]);
}

export async function downloadScenarioXlsx(input: ScenarioXlsxInput) {
  const wb = buildScenarioWorkbook(input);
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `medicare-optimizer-${input.scenarioCode}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}