/**
 * Build a concise PDF from a Lighthouse JSON report.
 * Usage: node scripts/lighthouse-report-to-pdf.mjs [input.json] [output.pdf] [Before|After]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = path.resolve(root, process.argv[2] || "lighthouse-report-prod.json");
const outputPath = path.resolve(root, process.argv[3] || "Lighthouse-Before-Report.pdf");
const phaseArg = String(process.argv[4] || "").trim();
const phaseFromName = /after/i.test(path.basename(outputPath))
  ? "After"
  : /before/i.test(path.basename(outputPath))
    ? "Before"
    : "Before";
const phase = phaseArg || phaseFromName;

if (!fs.existsSync(inputPath)) {
  console.error(`Missing report: ${inputPath}`);
  process.exit(1);
}

const r = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const url = r.finalRequestedUrl || r.requestedUrl || r.mainDocumentUrl || "(unknown URL)";
const fetchTime = r.fetchTime || "";
const lhVersion = r.lighthouseVersion || "";
const cats = r.categories || {};
const audits = r.audits || {};

const scores = Object.fromEntries(
  Object.entries(cats).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)]),
);

const fails = [];
for (const [id, a] of Object.entries(audits)) {
  if (a.score === null || a.score === undefined || a.score >= 1) continue;
  if (["informative", "manual", "notApplicable"].includes(a.scoreDisplayMode)) continue;
  const inCats = [];
  for (const [ck, cv] of Object.entries(cats)) {
    if ((cv.auditRefs || []).some((ref) => ref.id === id)) inCats.push(ck);
  }
  fails.push({
    id,
    title: a.title || id,
    score: a.score,
    displayValue: a.displayValue || "",
    categories: inCats.join(", ") || "—",
  });
}
fails.sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));

const doc = new jsPDF({ unit: "pt", format: "letter" });
const margin = 48;
const pageW = doc.internal.pageSize.getWidth();
const pageH = doc.internal.pageSize.getHeight();
const maxW = pageW - margin * 2;
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

function scoreLine(label, score) {
  ensureSpace(18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const tone =
    score >= 90 ? [22, 163, 74] : score >= 50 ? [202, 138, 4] : [220, 38, 38];
  doc.setTextColor(...tone);
  doc.text(`${label}: ${score}`, margin, y);
  y += 18;
}

heading(`GYSH Lighthouse — ${phase} Report`, 18);
body(`URL: ${url}`, 10);
body(`Fetched: ${fetchTime}`, 9, [90, 90, 90]);
body(`Lighthouse ${lhVersion}`, 9, [90, 90, 90]);
body(`Generated for task attachment · ${new Date().toISOString()}`, 9, [90, 90, 90]);
y += 4;

heading("Category scores", 14);
body(
  phase === "Before"
    ? "Scores below are the pre-fix baseline from this report’s run."
    : "Scores below are from the post-fix re-run against production.",
  8,
  [100, 100, 100],
);

const CATEGORY_DEFS = {
  performance: {
    label: "Performance",
    def:
      "How quickly the page loads and becomes usable. Factors include First Contentful Paint (FCP), Largest Contentful Paint (LCP), Speed Index, Total Blocking Time, and overall payload size. Lower scores usually mean heavy images/JS, render-blocking resources, or slow server responses.",
  },
  accessibility: {
    label: "Accessibility",
    def:
      "Whether people can use the page with assistive tech and clear UI. Checks things like color contrast, image alt text, form labels, and accessible names that match visible text. A high score means fewer barriers for screen readers and keyboard users.",
  },
  seo: {
    label: "SEO",
    def:
      "Search-engine readiness basics: valid robots.txt, crawlable links, document title/meta description, viewport, and similar signals. This is not a full SEO audit—only Lighthouse’s automated checks that help crawlers find and understand the page.",
  },
  "best-practices": {
    label: "Best Practices",
    def:
      "General web hygiene (HTTPS, console errors, deprecated APIs, image aspect ratios, and similar). Included when present in the JSON report.",
  },
};

for (const key of ["performance", "accessibility", "seo", "best-practices"]) {
  if (scores[key] === undefined) continue;
  const meta = CATEGORY_DEFS[key] || {
    label: key,
    def: "",
  };
  const preFix =
    phase === "Before" && (key === "performance" || key === "seo")
      ? " (pre-fix)"
      : phase === "After"
        ? " (after fixes)"
        : "";
  scoreLine(`${meta.label}${preFix}`, scores[key]);
  if (meta.def) {
    body(meta.def, 8, [70, 70, 70]);
    y += 4;
  }
}
y += 6;

heading(`Failing / partial audits (${fails.length})`, 14);
body(
  "Score 0 = fail; scores between 0 and 1 are partial. Dev/Vite runs inflate Performance — this file uses the saved JSON report path below.",
  8,
  [100, 100, 100],
);

for (const f of fails) {
  ensureSpace(36);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(24, 23, 24);
  const pct = Math.round(f.score * 100);
  const titleLines = doc.splitTextToSize(`[${pct}] ${f.title}`, maxW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 12 + 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const meta = `id: ${f.id} · ${f.categories}${f.displayValue ? ` · ${f.displayValue}` : ""}`;
  const metaLines = doc.splitTextToSize(meta, maxW);
  ensureSpace(metaLines.length * 10 + 8);
  doc.text(metaLines, margin, y);
  y += metaLines.length * 10 + 10;
}

y += 8;
heading("Notes", 12);
body(
  "• Report source file: " + path.basename(inputPath),
  9,
);
body(
  "• Coverage: Manual LH-001…LH-005 + A11Y-002 under Area Lighthouse; Vitest VT-LH-001 (robots.txt). Optional: e2e/lighthouse-a11y.spec.ts.",
  9,
);
body(
  "• Remaining high-impact items typically include image compression and unused JS code-splitting.",
  9,
);

doc.save(outputPath);
console.log(`Wrote ${outputPath}`);
