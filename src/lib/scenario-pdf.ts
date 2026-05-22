import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { calcPathways, usd, type Year, type Medication } from "./medicare-math";

export interface ScenarioPdfInput {
  scenarioCode: string;
  year: Year;
  birthYear: number;
  zip3: string;
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