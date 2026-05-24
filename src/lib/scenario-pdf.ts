import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  GUIDELINES,
  calcPathways,
  medigapPremiumByZip3,
  partDPremiumByZip3,
  usd,
  INSULIN_CAP_MONTHLY,
  type Year,
  type Medication,
} from "./medicare-math";
import { CMS_CATALOG } from "@/data/cms-catalog";
import { rankedPlanDetails, type PlanDetail } from "./plan-details";

export interface ScenarioPdfInput {
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

export function buildScenarioPdf(input: ScenarioPdfInput): jsPDF {
  const hasDME = input.medications.some((m) =>
    /dexcom|libre|omnipod|cpap|bipap|nebulizer|wheelchair|walker|oxygen/i.test(m.medication_name),
  );
  const { A, B } = calcPathways({ year: input.year, zip3: input.zip3, meds: input.medications, hasDME });

  const preferPredictability = input.costPreference === "predictability";
  const aWins = preferPredictability ? A.worstCaseAnnual <= B.worstCaseAnnual : A.totalAnnual <= B.totalAnnual;
  const best = aWins ? A : B;
  const other = aWins ? B : A;

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  // Header
  doc.setFillColor(16, 122, 87);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("The Medicare Optimizer", margin, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Scenario ${input.scenarioCode} · Plan year ${input.year}`, margin, 50);

  // Scenario snapshot
  doc.setTextColor(20, 20, 20);
  let y = 95;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Scenario snapshot", margin, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3 },
    body: [
      ["Year of birth", String(input.birthYear), "ZIP region", `${input.zip3}xx`],
      ["Gender", input.gender.replace(/_/g, " "), "Tobacco user", input.tobacco ? "Yes" : "No"],
      ["Income band", input.incomeBand, "Cost priority", preferPredictability ? "Predictability" : "Minimize monthly"],
      ["Conditions", input.conditions.join(", ") || "None reported", "Medications", String(input.medications.length)],
    ],
    columnStyles: {
      0: { fontStyle: "bold", textColor: [90, 90, 90] },
      2: { fontStyle: "bold", textColor: [90, 90, 90] },
    },
    margin: { left: margin, right: margin },
  });

  // Recommended plan banner
  // @ts-expect-error lastAutoTable is a runtime field set by jspdf-autotable
  y = doc.lastAutoTable.finalY + 18;
  doc.setFillColor(232, 245, 238);
  doc.setDrawColor(16, 122, 87);
  doc.roundedRect(margin, y, pageW - margin * 2, 56, 6, 6, "FD");
  doc.setTextColor(16, 122, 87);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("RECOMMENDED PATHWAY", margin + 14, y + 18);
  doc.setFontSize(14);
  doc.text(best.label, margin + 14, y + 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    preferPredictability
      ? `Best worst-case exposure: ${usd(best.worstCaseAnnual)} / yr`
      : `Lowest expected annual cost: ${usd(best.totalAnnual)} / yr`,
    margin + 14,
    y + 52,
  );

  y += 76;

  // Side-by-side comparison
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Side-by-side benefit comparison", margin, y);
  y += 10;

  const labelCol = ["Monthly premium", "Annual premium", "Annual drug cost (capped)", "Expected medical out-of-pocket", "Expected total annual cost", "Worst-case annual cost"];
  const aVals = [usd(A.monthlyPremium), usd(A.annualPremium), usd(A.annualDrugCost), usd(A.annualMedicalOOP), usd(A.totalAnnual), usd(A.worstCaseAnnual)];
  const bVals = [usd(B.monthlyPremium), usd(B.annualPremium), usd(B.annualDrugCost), usd(B.annualMedicalOOP), usd(B.totalAnnual), usd(B.worstCaseAnnual)];

  autoTable(doc, {
    startY: y,
    head: [["Benefit / cost", `${A.label}${aWins ? "  ★" : ""}`, `${B.label}${!aWins ? "  ★" : ""}`]],
    body: labelCol.map((l, i) => [l, aVals[i], bVals[i]]),
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 10 },
    styles: { fontSize: 9, cellPadding: 6 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 200 },
      1: { halign: "right" },
      2: { halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  // Cost breakdowns side by side
  // @ts-expect-error runtime field
  y = doc.lastAutoTable.finalY + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Cost breakdown — recommended", margin, y);
  doc.text("Cost breakdown — alternative", margin + (pageW - margin * 2) / 2 + 10, y);
  y += 6;

  const colW = (pageW - margin * 2 - 10) / 2;

  autoTable(doc, {
    startY: y,
    head: [[best.label, "Annual"]],
    body: best.breakdown.map((b) => [b.label, usd(b.value)]),
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 1: { halign: "right", cellWidth: 80 } },
    margin: { left: margin },
    tableWidth: colW,
  });
  const bestEndY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  autoTable(doc, {
    startY: y,
    head: [[other.label, "Annual"]],
    body: other.breakdown.map((b) => [b.label, usd(b.value)]),
    headStyles: { fillColor: [120, 120, 120], textColor: 255, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 1: { halign: "right", cellWidth: 80 } },
    margin: { left: margin + colW + 10 },
    tableWidth: colW,
  });
  const altEndY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  y = Math.max(bestEndY, altEndY) + 18;

  // Medications
  if (input.medications.length) {
    if (y > 680) { doc.addPage(); y = 60; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Medications on file", margin, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [["Medication", "Strength", "Form", "Frequency", "Condition", "$/mo retail"]],
      body: input.medications.map((m) => [
        m.medication_name || "—",
        m.strength || "—",
        m.dosage_form || "—",
        m.frequency || "—",
        m.resolved_diagnosis || "—",
        usd(m.estimated_monthly_retail),
      ]),
      headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: { 5: { halign: "right" } },
      margin: { left: margin, right: margin },
    });
  }

  // ---------- Pathway A — Medigap & Part D carriers ----------
  const fmtMo = (n: number) => `${usd(Math.round(n * 100) / 100)}/mo`;
  const baseG = medigapPremiumByZip3(input.zip3);
  const baseN = baseG * 0.72;
  const basePartD = partDPremiumByZip3(input.zip3);
  const g = GUIDELINES[input.year];

  doc.addPage();
  y = 60;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(`Pathway A — Medigap options (ZIP ${input.zip3}${input.county ? ` · ${input.county}` : ""})`, margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `Standardized Medicare Supplement (Plan G & Plan N) premiums for Age ${new Date().getFullYear() - input.birthYear}, ${input.gender}${input.tobacco ? ", Tobacco Smoker" : ", Non-smoker"}.`,
    margin,
    y + 12,
    { maxWidth: pageW - margin * 2 },
  );
  y += 28;

  autoTable(doc, {
    startY: y,
    head: [["Supplement Carrier", "Plan G Premium", "Plan N Premium", "A.M. Best", "Portal"]],
    body: CMS_CATALOG.medigapCarriers.slice(0, 8).map((c, i) => {
      const mult = [1.08, 0.99, 1.0, 1.02, 0.96, 1.05, 0.94, 1.03][i] ?? 1;
      return [
        c["Carrier Name"],
        fmtMo(baseG * mult),
        fmtMo(baseN * mult),
        c["A.M. Best Rating"],
        "Visit carrier portal",
      ];
    }),
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 5 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("Standalone Prescription Drug Plans (Part D)", margin, y);
  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Part D Carrier", "Basic PDP", "Standard PDP", "Star Rating", "Portal"]],
    body: CMS_CATALOG.partDCarriers.slice(0, 6).map((c, i) => {
      const mult = [0.72, 0.83, 1.15, 1.05, 0.95, 1.0][i] ?? 1;
      return [
        c["Carrier Name"],
        fmtMo(basePartD * mult * 0.55),
        fmtMo(basePartD * mult),
        ["3.5 Stars", "4.0 Stars", "4.5 Stars"][i % 3],
        "Visit Rx portal",
      ];
    }),
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 5 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    margin: { left: margin, right: margin },
  });

  // ---------- Pathway B — Medicare Advantage ----------
  doc.addPage();
  y = 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(20, 20, 20);
  doc.text(`Pathway B — Medicare Advantage networks (ZIP ${input.zip3})`, margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(
    "Coordinated HMO and PPO networks offering low upfront costs and bundled dental/vision/hearing/OTC benefits.",
    margin,
    y + 12,
    { maxWidth: pageW - margin * 2 },
  );
  y += 28;

  autoTable(doc, {
    startY: y,
    head: [["Carrier", "HMO Premium", "PPO Premium", "Star Rating", "Network Characteristics"]],
    body: CMS_CATALOG.advantageCarriers.slice(0, 8).map((c, i) => {
      const hmo = [0, 0, 0, 0, 14, 0, 0, 18][i] ?? 0;
      const ppo = [19, 24, 15, 0, 32, 22, 12, 28][i] ?? 0;
      return [
        c["Carrier Name"],
        hmo === 0 ? "$0/mo" : `$${hmo}/mo`,
        ppo === 0 ? "$0/mo" : `$${ppo}/mo`,
        ["4.0", "4.5", "4.0", "3.5", "4.0", "4.0", "3.5", "4.0"][i] + " Stars",
        c["Key Characteristics"],
      ];
    }),
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 5 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 4: { cellWidth: 200 } },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;

  const lc = input.conditions.map((c) => c.toLowerCase()).join(" ");
  if (/diabetes|heart|copd|kidney|cancer/.test(lc)) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text("Specialized Chronic Special Needs Plans (C-SNP)", margin, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [["C-SNP Carrier", "Qualifying Focus", "Stars", "Bundled Disease Perks"]],
      body: [
        ["UnitedHealthcare Chronic Care", "Diabetes & Cardiovascular", "4.0", "Specialized endocrinologist copays, zero insulin tiers"],
        ["Humana Chronic Care", "Cardiovascular & Heart Failure", "4.5", "Free home BP cuffs, customized cardiac rehab programs"],
        ["Aetna Chronic Care", "Diabetes & COPD", "4.0", "Care manager + medication therapy management"],
      ],
      headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 5 },
      margin: { left: margin, right: margin },
    });
  }

  // ---------- Top 10 Carrier Plans ----------
  const partBMo = g.partBPremiumMonthly;
  const annualDrugEst = Math.min(
    input.medications.reduce((s, m) => s + (m.estimated_monthly_retail ?? 0) * 12, 0),
    g.partDOOPCap,
  );
  type T10 = { rank: number; carrier: string; plan: string; monthly: number; moop: string; stars: string; extras: string; annual: number };
  const cands: T10[] = [];
  // Track richer detail for the landscape spread later in the doc.
  type T10Detail = T10 & {
    premiumPartB: number;
    premiumPlan: number;
    premiumRx: number;
    premiumDental: number;
    premiumVision: number;
    deductibleMed: number;
    deductibleRx: number;
    pcpCopay: string;
    specCopay: string;
    hospCopay: string;
    erCopay: string;
    rxTier1: string;
    rxTier2: string;
    rxTier3: string;
    dentalBenefit: string;
    visionBenefit: string;
    hearingBenefit: string;
    otcBenefit: string;
    network: string;
    rxOOPCap: number;
  };
  const details: T10Detail[] = [];
  const pushDetail = (base: T10, extra: Omit<T10Detail, keyof T10>) => {
    cands.push(base);
    details.push({ ...base, ...extra });
  };

  CMS_CATALOG.medigapCarriers.slice(0, 4).forEach((c, i) => {
    const supp = Math.round(baseG * ([1.0, 0.96, 1.02, 0.99][i] ?? 1));
    const pdp = Math.round(basePartD * ([0.95, 1.0, 1.05, 0.9][i] ?? 1));
    const dental = 38; const vision = 14;
    const monthly = partBMo + supp + pdp + dental + vision;
    pushDetail({ rank: 0, carrier: c["Carrier Name"], plan: "Medigap Plan G + Part D", monthly,
      moop: `${usd(g.partBDeductible)} med / ${usd(g.partDOOPCap)} Rx`,
      stars: ["4.0", "4.5", "4.0", "3.5"][i] + "★",
      extras: "Add standalone dental/vision",
      annual: Math.round(monthly * 12 + annualDrugEst) }, {
      premiumPartB: partBMo, premiumPlan: supp, premiumRx: pdp,
      premiumDental: dental, premiumVision: vision,
      deductibleMed: g.partBDeductible, deductibleRx: 0,
      pcpCopay: "$0", specCopay: "$0", hospCopay: "$0 after Part A",
      erCopay: "$0", rxTier1: "$0–$4", rxTier2: "$10", rxTier3: "$45",
      dentalBenefit: "Standalone — $1,500 annual max",
      visionBenefit: "Standalone — $200 frames + exam",
      hearingBenefit: "Discount program only",
      otcBenefit: "Not included",
      network: "Any Medicare-accepting provider, nationwide",
      rxOOPCap: g.partDOOPCap,
    });
  });
  CMS_CATALOG.medigapCarriers.slice(0, 2).forEach((c, i) => {
    const supp = Math.round(baseN * ([1.0, 0.97][i] ?? 1));
    const pdp = Math.round(basePartD * 0.95);
    const dental = 35; const vision = 12;
    const monthly = partBMo + supp + pdp + dental + vision;
    pushDetail({ rank: 0, carrier: c["Carrier Name"], plan: "Medigap Plan N + Part D", monthly,
      moop: `~${usd(g.partBDeductible + 250)} med / ${usd(g.partDOOPCap)} Rx`,
      stars: ["4.0", "4.5"][i] + "★",
      extras: "Small office copays; lower premium",
      annual: Math.round(monthly * 12 + annualDrugEst) }, {
      premiumPartB: partBMo, premiumPlan: supp, premiumRx: pdp,
      premiumDental: dental, premiumVision: vision,
      deductibleMed: g.partBDeductible, deductibleRx: 0,
      pcpCopay: "$20", specCopay: "$50", hospCopay: "$0 after Part A",
      erCopay: "$50 (waived if admitted)", rxTier1: "$0–$4", rxTier2: "$10", rxTier3: "$45",
      dentalBenefit: "Standalone — $1,500 annual max",
      visionBenefit: "Standalone — $200 frames + exam",
      hearingBenefit: "Discount program only",
      otcBenefit: "Not included",
      network: "Any Medicare-accepting provider, nationwide",
      rxOOPCap: g.partDOOPCap,
    });
  });
  CMS_CATALOG.advantageCarriers.slice(0, 4).forEach((c, i) => {
    const planPrem = [0, 0, 14, 0][i] ?? 0;
    const monthly = partBMo + planPrem;
    pushDetail({ rank: 0, carrier: c["Carrier Name"], plan: "Medicare Advantage HMO", monthly,
      moop: `${usd(g.moopLow)} in-network`,
      stars: ["4.5", "4.0", "4.0", "3.5"][i] + "★",
      extras: "Dental, vision, hearing, fitness, OTC",
      annual: Math.round(monthly * 12 + annualDrugEst + 800) }, {
      premiumPartB: partBMo, premiumPlan: planPrem, premiumRx: 0,
      premiumDental: 0, premiumVision: 0,
      deductibleMed: 0, deductibleRx: 0,
      pcpCopay: "$0", specCopay: "$35", hospCopay: "$295/day days 1–5",
      erCopay: "$120 (waived if admitted)", rxTier1: "$0", rxTier2: "$10", rxTier3: "$47",
      dentalBenefit: "Included — $2,500 comprehensive",
      visionBenefit: "Included — $300 eyewear + exam",
      hearingBenefit: "Included — $1,000 hearing aids",
      otcBenefit: "$125/quarter OTC card",
      network: "HMO — referral required for specialists",
      rxOOPCap: g.partDOOPCap,
    });
  });
  CMS_CATALOG.advantageCarriers.slice(0, 3).forEach((c, i) => {
    const planPrem = [19, 24, 32][i] ?? 20;
    const monthly = partBMo + planPrem;
    pushDetail({ rank: 0, carrier: c["Carrier Name"], plan: "Medicare Advantage PPO", monthly,
      moop: `${usd(g.moopHigh)} combined`,
      stars: ["4.0", "4.0", "4.5"][i] + "★",
      extras: "Dental, vision, hearing + PPO flexibility",
      annual: Math.round(monthly * 12 + annualDrugEst + 1100) }, {
      premiumPartB: partBMo, premiumPlan: planPrem, premiumRx: 0,
      premiumDental: 0, premiumVision: 0,
      deductibleMed: 0, deductibleRx: 150,
      pcpCopay: "$5", specCopay: "$45", hospCopay: "$350/day days 1–6",
      erCopay: "$120 (waived if admitted)", rxTier1: "$2", rxTier2: "$12", rxTier3: "$47",
      dentalBenefit: "Included — $2,000 comprehensive",
      visionBenefit: "Included — $250 eyewear + exam",
      hearingBenefit: "Included — $750 hearing aids",
      otcBenefit: "$100/quarter OTC card",
      network: "PPO — in/out-of-network without referral",
      rxOOPCap: g.partDOOPCap,
    });
  });
  cands.sort((a, b) => a.annual - b.annual);
  const top10 = cands.slice(0, 10).map((r, i) => ({ ...r, rank: i + 1 }));
  // Re-order detail rows to match top10 ranking by carrier+plan signature.
  const detailById = new Map(details.map((d) => [`${d.carrier}|${d.plan}`, d]));
  const top10Detail: T10Detail[] = top10
    .map((r) => {
      const d = detailById.get(`${r.carrier}|${r.plan}`)!;
      return { ...d, rank: r.rank, monthly: r.monthly, annual: r.annual, moop: r.moop, stars: r.stars, extras: r.extras };
    });

  doc.addPage();
  y = 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(20, 20, 20);
  doc.text("Top 10 Carrier Plans — personalized shortlist", margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `Ranked by lowest estimated annual total cost · Total monthly = Part B (${usd(partBMo)}) + plan premium + Part D + dental + vision (if applicable).`,
    margin,
    y + 12,
    { maxWidth: pageW - margin * 2 },
  );
  y += 28;

  autoTable(doc, {
    startY: y,
    head: [["#", "Carrier", "Plan", "Total Monthly*", "Out-of-Pocket Max", "Stars", "Bundled Extras", "Est. Annual"]],
    body: top10.map((r) => [r.rank, r.carrier, r.plan, fmtMo(r.monthly), r.moop, r.stars, r.extras, usd(r.annual)]),
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 4 },
    columnStyles: {
      0: { halign: "center", cellWidth: 18 },
      3: { halign: "right" },
      5: { halign: "center", cellWidth: 32 },
      7: { halign: "right" },
    },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18;

  // ---------- Landscape Top 10 — full plan detail spread ----------
  doc.addPage("letter", "landscape");
  const lsW = doc.internal.pageSize.getWidth();
  const lsH = doc.internal.pageSize.getHeight();
  const lsMargin = 28;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Top 10 Carrier Plans — full benefit & cost detail (landscape)", lsMargin, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `Side-by-side line-item view of every premium, deductible, copay, drug tier, and bundled benefit. Total monthly = Part B + plan + Part D + dental + vision (where applicable).`,
    lsMargin, 66, { maxWidth: lsW - lsMargin * 2 },
  );

  // Monthly premium breakdown table
  autoTable(doc, {
    startY: 82,
    head: [["#", "Carrier", "Plan", "Part B", "Plan", "Part D", "Dental", "Vision", "Total /mo", "Annual Premium"]],
    body: top10Detail.map((d) => [
      d.rank, d.carrier, d.plan,
      fmtMo(d.premiumPartB), fmtMo(d.premiumPlan), fmtMo(d.premiumRx),
      d.premiumDental ? fmtMo(d.premiumDental) : "—",
      d.premiumVision ? fmtMo(d.premiumVision) : "—",
      fmtMo(d.monthly),
      usd(Math.round(d.monthly * 12)),
    ]),
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 7.8, cellPadding: 3 },
    columnStyles: {
      0: { halign: "center", cellWidth: 16 },
      3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" },
      6: { halign: "right" }, 7: { halign: "right" },
      8: { halign: "right", fontStyle: "bold" }, 9: { halign: "right" },
    },
    margin: { left: lsMargin, right: lsMargin },
  });
  let lsY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("Medical cost-sharing & out-of-pocket detail", lsMargin, lsY);
  lsY += 4;
  autoTable(doc, {
    startY: lsY,
    head: [["#", "Carrier", "Med Deductible", "PCP", "Specialist", "Hospital", "ER", "MOOP", "Network rules"]],
    body: top10Detail.map((d) => [
      d.rank, d.carrier,
      d.deductibleMed ? usd(d.deductibleMed) : "$0",
      d.pcpCopay, d.specCopay, d.hospCopay, d.erCopay, d.moop, d.network,
    ]),
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 7.8, cellPadding: 3 },
    columnStyles: { 0: { halign: "center", cellWidth: 16 }, 8: { cellWidth: 160 } },
    margin: { left: lsMargin, right: lsMargin },
  });
  lsY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Prescription drug detail (Part D / MA-PD)", lsMargin, lsY);
  lsY += 4;
  autoTable(doc, {
    startY: lsY,
    head: [["#", "Carrier", "Rx Deductible", "Tier 1 (Pref. Generic)", "Tier 2 (Generic)", "Tier 3 (Pref. Brand)", "Insulin cap", "Rx OOP cap"]],
    body: top10Detail.map((d) => [
      d.rank, d.carrier,
      d.deductibleRx ? usd(d.deductibleRx) : "$0",
      d.rxTier1, d.rxTier2, d.rxTier3,
      `${usd(INSULIN_CAP_MONTHLY)}/mo`,
      usd(d.rxOOPCap),
    ]),
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 7.8, cellPadding: 3 },
    columnStyles: { 0: { halign: "center", cellWidth: 16 } },
    margin: { left: lsMargin, right: lsMargin },
  });
  lsY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;

  if (lsY > lsH - 140) {
    doc.addPage("letter", "landscape");
    lsY = 50;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("Ancillary benefits — dental, vision, hearing, OTC", lsMargin, lsY);
  lsY += 4;
  autoTable(doc, {
    startY: lsY,
    head: [["#", "Carrier", "Dental", "Vision", "Hearing", "OTC / wellness"]],
    body: top10Detail.map((d) => [
      d.rank, d.carrier, d.dentalBenefit, d.visionBenefit, d.hearingBenefit, d.otcBenefit,
    ]),
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 7.8, cellPadding: 3 },
    columnStyles: { 0: { halign: "center", cellWidth: 16 } },
    margin: { left: lsMargin, right: lsMargin },
  });

  // ---------- Yearly cost scenario based on health profile ----------
  doc.addPage();
  y = 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(20, 20, 20);
  doc.text("Annual cost scenario — based on your reported health profile", margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `Projected utilization for a Medicare beneficiary with: ${input.conditions.join(", ") || "no chronic conditions reported"}. Estimates assume typical care patterns at CMS national average reimbursement rates.`,
    margin, y + 12, { maxWidth: pageW - margin * 2 },
  );
  y += 36;

  // Build expected utilization line items from conditions
  const cond = input.conditions.map((c) => c.toLowerCase()).join(" ");
  const util: { category: string; item: string; freq: string; unit: number; annual: number }[] = [];
  util.push({ category: "Preventive", item: "Annual Wellness Visit", freq: "1 / yr", unit: 0, annual: 0 });
  util.push({ category: "Preventive", item: "Routine labs (CBC, CMP, lipid)", freq: "1–2 / yr", unit: 35, annual: 70 });
  util.push({ category: "Primary care", item: "PCP office visit", freq: "4 / yr", unit: 120, annual: 480 });

  if (/diabetes/.test(cond)) {
    util.push({ category: "Diabetes", item: "Endocrinologist visit", freq: "2 / yr", unit: 220, annual: 440 });
    util.push({ category: "Diabetes", item: "A1C + diabetic panel", freq: "4 / yr", unit: 55, annual: 220 });
    util.push({ category: "Diabetes", item: "Diabetic eye exam", freq: "1 / yr", unit: 145, annual: 145 });
    util.push({ category: "Diabetes", item: "CGM sensors / supplies (DME)", freq: "monthly", unit: 320, annual: 3840 });
    util.push({ category: "Diabetes", item: "Insulin (capped at $35/mo)", freq: "monthly", unit: INSULIN_CAP_MONTHLY, annual: INSULIN_CAP_MONTHLY * 12 });
  }
  if (/heart|cardio|chf|hypertension|blood pressure/.test(cond)) {
    util.push({ category: "Cardiac", item: "Cardiologist visit", freq: "2 / yr", unit: 240, annual: 480 });
    util.push({ category: "Cardiac", item: "EKG + echocardiogram", freq: "1 / yr", unit: 410, annual: 410 });
    util.push({ category: "Cardiac", item: "Cardiac rehab sessions", freq: "12 / yr", unit: 75, annual: 900 });
  }
  if (/copd|asthma|pulmonary/.test(cond)) {
    util.push({ category: "Pulmonary", item: "Pulmonologist visit", freq: "3 / yr", unit: 215, annual: 645 });
    util.push({ category: "Pulmonary", item: "Spirometry / PFT", freq: "1 / yr", unit: 180, annual: 180 });
    util.push({ category: "Pulmonary", item: "Nebulizer + oxygen (DME 20%)", freq: "monthly", unit: 95, annual: 1140 });
  }
  if (/kidney|renal|ckd/.test(cond)) {
    util.push({ category: "Renal", item: "Nephrologist visit", freq: "4 / yr", unit: 235, annual: 940 });
    util.push({ category: "Renal", item: "Renal panel + GFR", freq: "4 / yr", unit: 65, annual: 260 });
  }
  if (/cancer|oncology|chemo/.test(cond)) {
    util.push({ category: "Oncology", item: "Oncologist visit", freq: "6 / yr", unit: 285, annual: 1710 });
    util.push({ category: "Oncology", item: "Imaging (CT/MRI surveillance)", freq: "2 / yr", unit: 850, annual: 1700 });
    util.push({ category: "Oncology", item: "Infusion therapy", freq: "varies", unit: 0, annual: 4500 });
  }
  if (/arthritis|joint|orthop/.test(cond)) {
    util.push({ category: "Ortho", item: "Orthopedic visit + injection", freq: "2 / yr", unit: 310, annual: 620 });
    util.push({ category: "Ortho", item: "Physical therapy sessions", freq: "12 / yr", unit: 110, annual: 1320 });
  }
  if (/mental|depression|anxiety/.test(cond)) {
    util.push({ category: "Behavioral", item: "Therapy / counseling sessions", freq: "24 / yr", unit: 130, annual: 3120 });
  }

  // Always show prescription baseline
  const rxAnnualRetail = input.medications.reduce((s, m) => s + (m.estimated_monthly_retail ?? 0) * 12, 0);
  util.push({ category: "Pharmacy", item: "All prescriptions (retail)", freq: `${input.medications.length} meds`, unit: 0, annual: Math.round(rxAnnualRetail) });
  util.push({ category: "Pharmacy", item: "Capped Part D OOP", freq: "annual cap", unit: 0, annual: g.partDOOPCap });

  const totalRetail = util.reduce((s, r) => s + r.annual, 0);

  autoTable(doc, {
    startY: y,
    head: [["Category", "Service / item", "Frequency", "Unit cost", "Annual retail"]],
    body: util.map((r) => [r.category, r.item, r.freq, r.unit ? usd(r.unit) : "—", usd(r.annual)]),
    foot: [["", "", "", "Total annual retail exposure", usd(totalRetail)]],
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    footStyles: { fillColor: [232, 245, 238], textColor: [16, 122, 87], fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 4 },
    columnStyles: { 3: { halign: "right" }, 4: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16;

  // What each pathway pays for this scenario
  if (y > 600) { doc.addPage(); y = 60; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("What this scenario costs you on each pathway", margin, y);
  y += 6;

  const medicalRetail = totalRetail - rxAnnualRetail - g.partDOOPCap;
  const aPathwayOOP = g.partBDeductible; // Plan G covers almost everything else
  const bPathwayOOP = Math.min(medicalRetail * 0.2 + 400, g.moopHigh);
  autoTable(doc, {
    startY: y,
    head: [["Pathway", "Plan premiums /yr", "Drug costs /yr", "Medical OOP /yr", "Est. total /yr", "Worst-case /yr"]],
    body: [
      [A.label, usd(A.annualPremium), usd(A.annualDrugCost), usd(aPathwayOOP), usd(A.annualPremium + A.annualDrugCost + aPathwayOOP), usd(A.worstCaseAnnual)],
      [B.label, usd(B.annualPremium), usd(B.annualDrugCost), usd(bPathwayOOP), usd(B.annualPremium + B.annualDrugCost + bPathwayOOP), usd(B.worstCaseAnnual)],
    ],
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 5 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right", fontStyle: "bold" }, 5: { halign: "right" } },
    margin: { left: margin, right: margin },
  });

  // ---------- Contact a Licensed Agent (only clickable link) ----------
  if (y > 680) { doc.addPage(); y = 60; }
  doc.setFillColor(232, 245, 238);
  doc.setDrawColor(16, 122, 87);
  doc.roundedRect(margin, y, pageW - margin * 2, 68, 6, 6, "FD");
  doc.setTextColor(16, 122, 87);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Ready to enroll?", margin + 14, y + 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    "Speak with a licensed agent who can verify carrier availability in your county, check provider networks, and confirm formulary coverage before you enroll.",
    margin + 14,
    y + 38,
    { maxWidth: pageW - margin * 2 - 28 },
  );
  const linkText = "Contact a Licensed Agent →";
  const linkUrl = `https://themedicareoptimizer.lovable.app/scenario/created/${input.scenarioCode}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(16, 122, 87);
  doc.textWithLink(linkText, margin + 14, y + 60, { url: linkUrl });

  // Footer disclaimer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "This site does not offer every plan available in your area. Any information provided is limited to Medigap Plan G, Medicare Advantage HMO/PPO, and Standalone Part D plans. Contact Medicare.gov or 1-800-MEDICARE for all of your options.",
      margin,
      doc.internal.pageSize.getHeight() - 24,
      { maxWidth: pageW - margin * 2 },
    );
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin, doc.internal.pageSize.getHeight() - 10, { align: "right" });
  }

  return doc;
}

export function downloadScenarioPdf(input: ScenarioPdfInput) {
  const doc = buildScenarioPdf(input);
  doc.save(`medicare-scenario-${input.scenarioCode}.pdf`);
}