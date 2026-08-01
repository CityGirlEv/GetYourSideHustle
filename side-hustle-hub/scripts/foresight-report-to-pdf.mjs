/**
 * Foresight (Flow Ninja) PDF — Issues found: 16. Same folder as Lighthouse-*Report.pdf.
 * Usage: node scripts/foresight-report-to-pdf.mjs [output.pdf]
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.resolve(root, process.argv[2] || "ForeSight-After-Report.pdf");

const SITE = "https://www.getyoursidehustle.com/";
const BEFORE_SCORE = 56;
const ISSUES_FOUND = 16;

/** 16 PDF improvement-list items → catalog IDs. */
const issues = [
  ["PW-FS-001", "Positioning", "Outcome-led homepage H1", "automated"],
  ["PW-FS-002", "Positioning", "H1 names distinctive tools", "automated"],
  ["PW-FS-003", "Positioning", "Benefit / purpose line", "automated"],
  ["PW-FS-004", "Positioning", "Pricing / access near CTA", "automated"],
  ["PW-FS-005", "Positioning", "CTA expectation line", "automated"],
  ["PW-FS-006", "Positioning", "Reason-to-choose vs idea lists", "automated"],
  ["PW-FS-007", "Positioning", "Homepage FAQ", "automated"],
  ["PW-FS-008", "Positioning", "Positioning block (audience/promise/method)", "automated"],
  ["PW-FS-009", "Differentiation", "Named method (Margin Match)", "automated"],
  ["PW-FS-010", "Differentiation", "Contrast vs status quo", "automated"],
  ["FS-011", "Differentiation", "One primary audience on homepage", "manual — outstanding"],
  ["PW-FS-012", "Differentiation", "Branded evaluation name", "automated"],
  ["FS-013", "Differentiation", "Reinforce in title/meta/future content", "manual — outstanding"],
  ["PW-FS-014", "Target Audience", "ICP three audiences + problems", "automated"],
  ["PW-FS-015", "Conversion", "Headline searcher intent", "automated"],
  ["PW-FS-016", "SEO/AEO", "Organization + WebPage + FAQ schema", "automated"],
];

const doc = new jsPDF({ unit: "pt", format: "letter" });
const margin = 48;
const pageH = doc.internal.pageSize.getHeight();
const maxW = doc.internal.pageSize.getWidth() - margin * 2;
let y = margin;

function ensureSpace(needed = 40) {
  if (y + needed > pageH - margin) {
    doc.addPage();
    y = margin;
  }
}

function heading(text, size = 16) {
  ensureSpace(size + 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(24, 23, 24);
  doc.text(text, margin, y);
  y += size + 10;
}

function body(text, size = 10, color = [40, 40, 40]) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, maxW);
  ensureSpace(lines.length * (size + 3) + 4);
  doc.text(lines, margin, y);
  y += lines.length * (size + 3) + 6;
}

function metric(label, value, definition) {
  ensureSpace(56);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(24, 23, 24);
  doc.text(`${label}: ${value}`, margin, y);
  y += 16;
  body(definition, 9, [80, 80, 80]);
  y += 4;
}

heading("GYSH Foresight Report — After", 18);
body(`URL: ${SITE}`);
body("Source: Flow Ninja Foresight PDF · foresight-audit-www.getyoursidehustle.com.pdf");
body("After scores are implementation estimates. Re-run Flow Ninja to confirm.", 9, [80, 80, 80]);

heading("Summary", 14);
metric(
  "Site score (before)",
  String(BEFORE_SCORE),
  "Overall Foresight grade (0–100) from Flow Ninja before GYSH copy and schema fixes.",
);
metric(
  "Issues found (PDF)",
  String(ISSUES_FOUND),
  "Count of Improvement-list items in the Flow Ninja report (not category scores). Each maps to one Testing Portal case under area Foresight.",
);
metric(
  "Fixed vs Outstanding (portal)",
  "Pass = Fixed · not Pass = Outstanding",
  "On Testing Portal, open the Foresight chip under the status tiles: Fixed N · Outstanding M · Total 16. Mark Pass on a case to move it from Outstanding to Fixed. Two items remain manual: FS-011 (one primary audience) and FS-013 (ongoing content reinforcement).",
);

heading(`All ${ISSUES_FOUND} issues → catalog`, 14);
for (const [id, cat, title, note] of issues) {
  body(`${id}  [${cat}]  ${title}  (${note})`);
}

heading("Compare: Lighthouse Final (prod)", 14);
body("Performance 91 · Accessibility 100 · SEO 100 (was 63 / 96 / 92).");
body(
  "Same folder: Lighthouse-Before-Report.pdf, Lighthouse-After-Report.pdf, Lighthouse-Final-Report.pdf, ForeSight-After-Report.pdf",
);

doc.save(outputPath);
console.log(`Wrote ${outputPath}`);
