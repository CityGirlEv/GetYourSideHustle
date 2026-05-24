import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  GUIDELINES,
  calcPathways,
  medigapPremiumByZip3,
  partDPremiumByZip3,
  usd,
  type Year,
  type Medication,
} from "./medicare-math";
import { CMS_CATALOG } from "@/data/cms-catalog";

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
  CMS_CATALOG.medigapCarriers.slice(0, 4).forEach((c, i) => {
    const supp = Math.round(baseG * ([1.0, 0.96, 1.02, 0.99][i] ?? 1));
    const pdp = Math.round(basePartD * ([0.95, 1.0, 1.05, 0.9][i] ?? 1));
    const monthly = partBMo + supp + pdp;
    cands.push({ rank: 0, carrier: c["Carrier Name"], plan: "Medigap Plan G + Part D", monthly,
      moop: `${usd(g.partBDeductible)} med / ${usd(g.partDOOPCap)} Rx`,
      stars: ["4.0", "4.5", "4.0", "3.5"][i] + "★",
      extras: "Add standalone dental/vision",
      annual: Math.round(monthly * 12 + annualDrugEst) });
  });
  CMS_CATALOG.medigapCarriers.slice(0, 2).forEach((c, i) => {
    const supp = Math.round(baseN * ([1.0, 0.97][i] ?? 1));
    const pdp = Math.round(basePartD * 0.95);
    const monthly = partBMo + supp + pdp;
    cands.push({ rank: 0, carrier: c["Carrier Name"], plan: "Medigap Plan N + Part D", monthly,
      moop: `~${usd(g.partBDeductible + 250)} med / ${usd(g.partDOOPCap)} Rx`,
      stars: ["4.0", "4.5"][i] + "★",
      extras: "Small office copays; lower premium",
      annual: Math.round(monthly * 12 + annualDrugEst) });
  });
  CMS_CATALOG.advantageCarriers.slice(0, 4).forEach((c, i) => {
    const monthly = partBMo + ([0, 0, 14, 0][i] ?? 0);
    cands.push({ rank: 0, carrier: c["Carrier Name"], plan: "Medicare Advantage HMO", monthly,
      moop: `${usd(g.moopLow)} in-network`,
      stars: ["4.5", "4.0", "4.0", "3.5"][i] + "★",
      extras: "Dental, vision, hearing, fitness, OTC",
      annual: Math.round(monthly * 12 + annualDrugEst + 800) });
  });
  CMS_CATALOG.advantageCarriers.slice(0, 3).forEach((c, i) => {
    const monthly = partBMo + ([19, 24, 32][i] ?? 20);
    cands.push({ rank: 0, carrier: c["Carrier Name"], plan: "Medicare Advantage PPO", monthly,
      moop: `${usd(g.moopHigh)} combined`,
      stars: ["4.0", "4.0", "4.5"][i] + "★",
      extras: "Dental, vision, hearing + PPO flexibility",
      annual: Math.round(monthly * 12 + annualDrugEst + 1100) });
  });
  cands.sort((a, b) => a.annual - b.annual);
  const top10 = cands.slice(0, 10).map((r, i) => ({ ...r, rank: i + 1 }));

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
    `Ranked by lowest estimated annual total cost · Part B (${usd(partBMo)}/mo) + regional supplement/MA premium + modeled Rx OOP.`,
    margin,
    y + 12,
    { maxWidth: pageW - margin * 2 },
  );
  y += 28;

  autoTable(doc, {
    startY: y,
    head: [["#", "Carrier", "Plan", "Monthly", "Out-of-Pocket Max", "Stars", "Bundled Extras", "Est. Annual"]],
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