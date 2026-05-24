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

  // ============ RECOMMENDED PLAN — full benefit & cost detail page ============
  const ranked = rankedPlanDetails({ year: input.year, zip3: input.zip3, medications: input.medications });
  const top = ranked[0];
  const second = ranked[1];
  if (top) {
    doc.addPage();
    renderRecommendationPage(doc, input, top, second, pageW, margin);
  }

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
  const top10 = ranked;
  const top10Detail = ranked;

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
    `Side-by-side line-item view of every premium, deductible, copay, drug tier, and bundled benefit. Total monthly = Part B + plan + Part D + dental + vision + extras (hearing / OTC / wellness) where applicable.`,
    lsMargin, 66, { maxWidth: lsW - lsMargin * 2 },
  );

  // Monthly premium breakdown table
  autoTable(doc, {
    startY: 82,
    head: [["#", "Carrier", "Plan", "Part B", "Plan", "Part D", "Dental", "Vision", "Extras", "Total /mo", "Annual Premium"]],
    body: top10Detail.map((d) => [
      d.rank, d.carrier, d.plan,
      fmtMo(d.premiumPartB), fmtMo(d.premiumPlan), fmtMo(d.premiumRx),
      d.premiumDental ? fmtMo(d.premiumDental) : "—",
      d.premiumVision ? fmtMo(d.premiumVision) : "—",
      d.premiumExtras ? fmtMo(d.premiumExtras) : "—",
      fmtMo(d.monthly),
      usd(Math.round(d.monthly * 12)),
    ]),
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 8.5 },
    styles: { fontSize: 7.8, cellPadding: 3 },
    columnStyles: {
      0: { halign: "center", cellWidth: 16 },
      3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" },
      6: { halign: "right" }, 7: { halign: "right" }, 8: { halign: "right" },
      9: { halign: "right", fontStyle: "bold" }, 10: { halign: "right" },
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
      "This tool compares sample Medicare plan scenarios for educational purposes only. It is not a complete listing of plans available in your area. For a complete listing, contact Medicare.gov or 1-800-MEDICARE.",
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

// ============================================================
// Consumer (non-logged-in) PDF — recommendation only
// Page 1: Recommended plan full detail (premium + medical + Rx + bundled)
// Page 2: Top 3 side-by-side comparison incl. prescription costs
// Page 3: Landscape full plan-detail spread for the recommended plan
// ============================================================
export function buildConsumerScenarioPdf(input: ScenarioPdfInput): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;

  const ranked = rankedPlanDetails({ year: input.year, zip3: input.zip3, medications: input.medications });
  const top3 = ranked.slice(0, 3);
  const rec = top3[0];
  const alt = top3[1];

  if (!rec) {
    doc.setFontSize(14);
    doc.text("No plan recommendation available for this scenario.", margin, 80);
    return doc;
  }

  // ---------- Page 1: Recommendation detail ----------
  renderRecommendationPage(doc, input, rec, alt, pageW, margin);

  // ---------- Page 2: Top 3 side-by-side ----------
  doc.addPage();
  let y = 60;
  doc.setFillColor(16, 122, 87);
  doc.rect(0, 0, pageW, 50, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Top 3 plans — side-by-side", margin, 32);
  doc.setTextColor(20, 20, 20);
  y = 70;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `Including prescription drug coverage and bundled benefits. Total monthly is all-in: Part B + plan + Part D + dental + vision.`,
    margin, y, { maxWidth: pageW - margin * 2 },
  );
  y += 18;

  const colHeads = ["Detail", ...top3.map((p, i) => `#${i + 1} ${p.carrier}\n${p.plan}${i === 0 ? "  ★" : ""}`)];
  const rows: (string | number)[][] = [
    ["Plan type", ...top3.map((p) => p.planType)],
    ["Network", ...top3.map((p) => p.network)],
    ["Star rating", ...top3.map((p) => p.stars)],
    ["A.M. Best", ...top3.map((p) => p.amBest)],
    ["Part B premium", ...top3.map((p) => `${usd(Math.round(p.premiumPartB * 100) / 100)}/mo`)],
    ["Plan premium", ...top3.map((p) => `${usd(Math.round(p.premiumPlan * 100) / 100)}/mo`)],
    ["Part D / Rx premium", ...top3.map((p) => `${usd(Math.round(p.premiumRx * 100) / 100)}/mo`)],
    ["Dental premium", ...top3.map((p) => p.premiumDental ? `${usd(Math.round(p.premiumDental * 100) / 100)}/mo` : "—")],
    ["Vision premium", ...top3.map((p) => p.premiumVision ? `${usd(Math.round(p.premiumVision * 100) / 100)}/mo` : "—")],
    ["Extras premium", ...top3.map((p) => p.premiumExtras ? `${usd(Math.round(p.premiumExtras * 100) / 100)}/mo` : "Bundled")],
    ["TOTAL MONTHLY", ...top3.map((p) => `${usd(Math.round(p.monthly * 100) / 100)}/mo`)],
    ["EST. ANNUAL TOTAL", ...top3.map((p) => usd(p.annual))],
    ["Medical deductible", ...top3.map((p) => p.deductibleMed ? usd(p.deductibleMed) : "$0")],
    ["Primary care", ...top3.map((p) => p.pcpCopay)],
    ["Specialist", ...top3.map((p) => p.specCopay)],
    ["Hospital", ...top3.map((p) => p.hospCopay)],
    ["Emergency room", ...top3.map((p) => p.erCopay)],
    ["Medical OOP max", ...top3.map((p) => p.moop)],
    ["Rx deductible", ...top3.map((p) => p.deductibleRx ? usd(p.deductibleRx) : "$0")],
    ["Tier 1 generic", ...top3.map((p) => p.rxTier1)],
    ["Tier 2 generic", ...top3.map((p) => p.rxTier2)],
    ["Tier 3 brand", ...top3.map((p) => p.rxTier3)],
    ["Insulin cap", ...top3.map((p) => `${usd(p.insulinCap)}/mo`)],
    ["Rx OOP cap", ...top3.map((p) => usd(p.rxOOPCap))],
    ["Dental", ...top3.map((p) => p.dentalBenefit)],
    ["Vision", ...top3.map((p) => p.visionBenefit)],
    ["Hearing", ...top3.map((p) => p.hearingBenefit)],
    ["OTC / wellness", ...top3.map((p) => p.otcBenefit)],
    ["Extras", ...top3.map((p) => p.extras)],
  ];

  autoTable(doc, {
    startY: y,
    head: [colHeads],
    body: rows,
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9, valign: "middle" },
    styles: { fontSize: 8, cellPadding: 4, valign: "top" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 110, textColor: [60, 60, 60] },
    },
    didParseCell: (data) => {
      // Highlight the TOTAL MONTHLY and EST. ANNUAL TOTAL rows
      const label = (data.row.raw as (string | number)[])[0];
      if (label === "TOTAL MONTHLY" || label === "EST. ANNUAL TOTAL") {
        data.cell.styles.fillColor = [232, 245, 238];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [16, 122, 87];
      }
    },
    margin: { left: margin, right: margin },
  });

  // ---------- Page 3: Landscape — full plan details of recommended plan ----------
  doc.addPage("letter", "landscape");
  const lsW = doc.internal.pageSize.getWidth();
  const lsMargin = 28;

  doc.setFillColor(16, 122, 87);
  doc.rect(0, 0, lsW, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Recommended plan — full detail: ${rec.carrier} · ${rec.plan}`, lsMargin, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Plan year ${input.year} · ZIP ${input.zip3}${input.county ? ` · ${input.county}` : ""} · ${rec.planType} · ${rec.stars}`,
    lsMargin, 50,
  );

  doc.setTextColor(20, 20, 20);
  let lsY = 84;

  const fmtMo = (n: number) => `${usd(Math.round(n * 100) / 100)}/mo`;

  // Premium + medical | Rx + bundled, two big columns
  const lsColW = (lsW - lsMargin * 2 - 16) / 2;

  autoTable(doc, {
    startY: lsY,
    head: [["Premium component", "Monthly", "Annual"]],
    body: [
      ["Medicare Part B", fmtMo(rec.premiumPartB), usd(Math.round(rec.premiumPartB * 12))],
      [`Plan premium (${rec.planType})`, fmtMo(rec.premiumPlan), usd(Math.round(rec.premiumPlan * 12))],
      ["Part D / Rx", fmtMo(rec.premiumRx), usd(Math.round(rec.premiumRx * 12))],
      ["Dental", rec.premiumDental ? fmtMo(rec.premiumDental) : "Included", rec.premiumDental ? usd(Math.round(rec.premiumDental * 12)) : "—"],
      ["Vision", rec.premiumVision ? fmtMo(rec.premiumVision) : "Included", rec.premiumVision ? usd(Math.round(rec.premiumVision * 12)) : "—"],
      ["Extras (hearing / OTC / wellness)", rec.premiumExtras ? fmtMo(rec.premiumExtras) : "Bundled", rec.premiumExtras ? usd(Math.round(rec.premiumExtras * 12)) : "—"],
    ],
    foot: [["TOTAL (all-in)", fmtMo(rec.monthly), usd(Math.round(rec.monthly * 12))]],
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    footStyles: { fillColor: [232, 245, 238], textColor: [16, 122, 87], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    margin: { left: lsMargin },
    tableWidth: lsColW,
  });
  const leftA = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  autoTable(doc, {
    startY: lsY,
    head: [["Prescription drug detail", "Member cost"]],
    body: [
      ["Rx deductible", rec.deductibleRx ? usd(rec.deductibleRx) : "$0"],
      ["Tier 1 — Preferred generic", rec.rxTier1],
      ["Tier 2 — Generic", rec.rxTier2],
      ["Tier 3 — Preferred brand", rec.rxTier3],
      ["Insulin (federal cap)", `${usd(rec.insulinCap)}/mo`],
      ["Annual Rx OOP cap", usd(rec.rxOOPCap)],
    ],
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold" }, 1: { halign: "right" } },
    margin: { left: lsMargin + lsColW + 16 },
    tableWidth: lsColW,
  });
  const rightA = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  lsY = Math.max(leftA, rightA) + 14;

  autoTable(doc, {
    startY: lsY,
    head: [["Medical cost-sharing", "Member cost"]],
    body: [
      ["Medical deductible", rec.deductibleMed ? usd(rec.deductibleMed) : "$0"],
      ["Primary care visit", rec.pcpCopay],
      ["Specialist visit", rec.specCopay],
      ["Inpatient hospital", rec.hospCopay],
      ["Emergency room", rec.erCopay],
      ["Out-of-pocket maximum", rec.moop],
      ["Network rules", rec.network],
    ],
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold" } },
    margin: { left: lsMargin },
    tableWidth: lsColW,
  });
  const leftB = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  autoTable(doc, {
    startY: lsY,
    head: [["Bundled benefit", "Coverage"]],
    body: [
      ["Dental", rec.dentalBenefit],
      ["Vision", rec.visionBenefit],
      ["Hearing", rec.hearingBenefit],
      ["OTC / wellness", rec.otcBenefit],
      ["Extras", rec.extras],
    ],
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold" } },
    margin: { left: lsMargin + lsColW + 16 },
    tableWidth: lsColW,
  });

  // Footer disclaimer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.text(
      "Educational comparison only — not a complete listing of plans available in your area. Contact Medicare.gov or 1-800-MEDICARE for all options.",
      28, h - 22, { maxWidth: w - 56 },
    );
    doc.text(`Page ${i} of ${pageCount}`, w - 28, h - 10, { align: "right" });
  }

  return doc;
}

export function downloadConsumerScenarioPdf(input: ScenarioPdfInput) {
  const doc = buildConsumerScenarioPdf(input);
  doc.save(`medicare-recommendation-${input.scenarioCode}.pdf`);
}

// ============ Beautifully formatted recommendation page ============
function renderRecommendationPage(
  doc: jsPDF,
  input: ScenarioPdfInput,
  rec: PlanDetail,
  alt: PlanDetail | undefined,
  pageW: number,
  margin: number,
) {
  const fmtMo = (n: number) => `${usd(Math.round(n * 100) / 100)}/mo`;
  const age = new Date().getFullYear() - input.birthYear;

  // Hero header band
  doc.setFillColor(16, 122, 87);
  doc.rect(0, 0, pageW, 110, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("YOUR PERSONALIZED RECOMMENDATION", margin, 36);
  doc.setFontSize(22);
  doc.text(`#1 · ${rec.carrier}`, margin, 64);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text(rec.plan, margin, 84);
  doc.setFontSize(10);
  doc.text(
    `Best total annual value for Age ${age}, ZIP ${input.zip3}${input.county ? ` · ${input.county}` : ""} · Plan year ${input.year}`,
    margin, 100,
  );

  // Three big stat tiles
  doc.setTextColor(20, 20, 20);
  const tileY = 128;
  const tileH = 64;
  const gap = 10;
  const tileW = (pageW - margin * 2 - gap * 2) / 3;
  const tiles: { label: string; value: string; sub: string }[] = [
    { label: "TOTAL MONTHLY", value: fmtMo(rec.monthly), sub: "All-in: Part B + plan + Rx + dental + vision + extras" },
    { label: "EST. ANNUAL TOTAL", value: usd(rec.annual), sub: "Premiums + capped drug costs + expected OOP" },
    { label: "STAR RATING", value: rec.stars, sub: `A.M. Best: ${rec.amBest}` },
  ];
  tiles.forEach((t, i) => {
    const x = margin + i * (tileW + gap);
    doc.setFillColor(245, 250, 247);
    doc.setDrawColor(16, 122, 87);
    doc.roundedRect(x, tileY, tileW, tileH, 6, 6, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(16, 122, 87);
    doc.text(t.label, x + 10, tileY + 16);
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text(t.value, x + 10, tileY + 38);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(90, 90, 90);
    doc.text(t.sub, x + 10, tileY + 54, { maxWidth: tileW - 20 });
  });

  let y = tileY + tileH + 18;

  // Monthly premium breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text("Monthly premium breakdown", margin, y);
  autoTable(doc, {
    startY: y + 6,
    head: [["Component", "Monthly", "Annual"]],
    body: [
      ["Medicare Part B premium", fmtMo(rec.premiumPartB), usd(Math.round(rec.premiumPartB * 12))],
      [`Plan premium (${rec.planType})`, fmtMo(rec.premiumPlan), usd(Math.round(rec.premiumPlan * 12))],
      ["Part D / prescription drug premium", fmtMo(rec.premiumRx), usd(Math.round(rec.premiumRx * 12))],
      ["Dental premium", rec.premiumDental ? fmtMo(rec.premiumDental) : "Included / standalone", rec.premiumDental ? usd(Math.round(rec.premiumDental * 12)) : "—"],
      ["Vision premium", rec.premiumVision ? fmtMo(rec.premiumVision) : "Included / standalone", rec.premiumVision ? usd(Math.round(rec.premiumVision * 12)) : "—"],
      ["Extras (hearing / OTC / wellness)", rec.premiumExtras ? fmtMo(rec.premiumExtras) : "Bundled / included", rec.premiumExtras ? usd(Math.round(rec.premiumExtras * 12)) : "—"],
    ],
    foot: [["TOTAL MONTHLY PAYMENT (all-in)", fmtMo(rec.monthly), usd(Math.round(rec.monthly * 12))]],
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    footStyles: { fillColor: [232, 245, 238], textColor: [16, 122, 87], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;

  // Medical cost-sharing
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Medical cost-sharing", margin, y);
  autoTable(doc, {
    startY: y + 6,
    head: [["Service", "Member cost"]],
    body: [
      ["Medical deductible", rec.deductibleMed ? usd(rec.deductibleMed) : "$0"],
      ["Primary care visit", rec.pcpCopay],
      ["Specialist visit", rec.specCopay],
      ["Inpatient hospital", rec.hospCopay],
      ["Emergency room", rec.erCopay],
      ["Out-of-pocket maximum", rec.moop],
      ["Network rules", rec.network],
    ],
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 200 } },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;

  if (y > 640) { doc.addPage(); y = 60; }

  // Drug & ancillary side-by-side
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Prescription drugs", margin, y);
  doc.text("Bundled benefits", margin + (pageW - margin * 2) / 2 + 10, y);
  const colW = (pageW - margin * 2 - 10) / 2;
  autoTable(doc, {
    startY: y + 6,
    head: [["Tier / item", "Cost"]],
    body: [
      ["Rx deductible", rec.deductibleRx ? usd(rec.deductibleRx) : "$0"],
      ["Tier 1 — Preferred generic", rec.rxTier1],
      ["Tier 2 — Generic", rec.rxTier2],
      ["Tier 3 — Preferred brand", rec.rxTier3],
      ["Insulin (federal cap)", `${usd(rec.insulinCap)}/mo`],
      ["Annual Rx OOP cap", usd(rec.rxOOPCap)],
    ],
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 4 },
    margin: { left: margin },
    tableWidth: colW,
  });
  const leftEnd = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  autoTable(doc, {
    startY: y + 6,
    head: [["Benefit", "Coverage"]],
    body: [
      ["Dental", rec.dentalBenefit],
      ["Vision", rec.visionBenefit],
      ["Hearing", rec.hearingBenefit],
      ["OTC / wellness", rec.otcBenefit],
      ["Extras", rec.extras],
    ],
    headStyles: { fillColor: [16, 122, 87], textColor: 255, fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 4 },
    margin: { left: margin + colW + 10 },
    tableWidth: colW,
  });
  const rightEnd = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  y = Math.max(leftEnd, rightEnd) + 14;

  // Alternate
  if (alt) {
    if (y > 660) { doc.addPage(); y = 60; }
    doc.setFillColor(248, 248, 248);
    doc.setDrawColor(180, 180, 180);
    doc.roundedRect(margin, y, pageW - margin * 2, 56, 6, 6, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("RUNNER-UP — also worth a look", margin + 14, y + 18);
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(`${alt.carrier} — ${alt.plan}`, margin + 14, y + 36);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `${fmtMo(alt.monthly)} all-in · ${usd(alt.annual)}/yr estimated · ${alt.stars}`,
      margin + 14, y + 50,
    );
  }
}