import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import { downloadBlobFile } from "@/lib/article-authoring";
import { openPdfBlobInTab, preparePdfPreviewTab } from "@/lib/pdf-open";
import { loadArticlePdfLogo, loadPdfFooterMiniLogo } from "@/lib/article-pdf";
import type { FinalizedBenchmark } from "@/lib/benchmark-intake";
import { buildBenchmarkProfileAnswerRows } from "@/lib/benchmark-profile-answers";
import { getBenchmarkWorkbookContent } from "@/lib/benchmark-workbook-content";
import { formatUsd } from "@/lib/educational-benchmark-report";
import { BENCHMARK_TOOL_DISCLAIMER, formatSiteCopyright } from "@/lib/medicare-disclaimers";
import {
  PDF_CONTENT_START_Y,
  PDF_HEADER_CONTENT_GAP,
  PDF_HEADER_HEIGHT,
  PDF_PAGE_TOP_MARGIN,
  pdfMaxContentY,
} from "@/lib/pdf-layout";
import { stampPdfPageFooters } from "@/lib/pdf-page-footer";
import {
  BENCHMARK_REPORT_PAGE_SUBTITLE,
  BENCHMARK_TAB_INPUT,
  BENCHMARK_TAB_LOCAL,
  BENCHMARK_TAB_POSSIBLE_PLANS,
  BENCHMARK_TAB_PREPARE,
  BENCHMARK_TAB_PBO_LOCAL,
  BENCHMARK_TOOL_ID_LABEL,
  BENCHMARK_TOOL_NAME,
  BENCHMARK_WORKBOOK_SECTION_TITLE,
  PBO_BLUEPRINT_SECTION_TITLE,
} from "@/lib/plan-comparison-copy";
import { PUBLIC_WEBSITE_HOST } from "@/lib/site-url";
import { benchmarkToPlanComparisonScenario } from "@/lib/benchmark-plan-input";
import { rankedPlanDetails, potentialTop3PlanDetails } from "@/lib/plan-details";
import {
  buildScenarioFitReasons,
  buildTopPlanHighlights,
  buildWhyTopPlanOverRunnersUp,
} from "@/lib/plan-comparison-rationale";
import { appendWorkbookSectionToBenchmarkPdf } from "@/lib/workbook-answers-export";
import type { WorkbookFormState } from "@/lib/workbook-form-state";

const MARGIN = 48;
const INK: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [75, 85, 99];
const BRAND: [number, number, number] = [0, 40, 112];
const HEADER_BG: [number, number, number] = [239, 246, 255];
const HEADER_BORDER: [number, number, number] = [191, 219, 254];
const TITLE_PANEL_BG: [number, number, number] = [239, 246, 255];
const LINE = 1.35;
/** Hanging indent for bullet lists — keeps wrapped lines inside the content column. */
const BULLET_GUTTER = 14;
/** jsPDF line metrics can exceed maxW slightly; reserve space so text does not clip the margin. */
const PDF_TEXT_RIGHT_INSET = 10;
/** Minimum space reserved below a heading so body text is not orphaned on the next page. */
const PDF_KEEP_WITH_NEXT_MIN = 40;
const PDF_SECTION_KEEP_WITH_NEXT = 52;

export type BenchmarkReportPdfOptions = {
  logoDataUrl?: string | null;
  miniLogoDataUrl?: string | null;
  workbookFormState?: WorkbookFormState | null;
};

function splitText(doc: jsPDF, text: string, maxW: number): string[] {
  return doc.splitTextToSize(text, maxW) as string[];
}

function detectImageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

/** Branded logo header band — repeated on every benchmark report page. */
export function drawBenchmarkPageHeader(
  doc: jsPDF,
  pageW: number,
  margin: number,
  logoDataUrl?: string | null,
): void {
  const headerTop = PDF_PAGE_TOP_MARGIN;
  const headerBottom = headerTop + PDF_HEADER_HEIGHT;

  doc.setFillColor(...HEADER_BG);
  doc.rect(0, headerTop, pageW, PDF_HEADER_HEIGHT, "F");
  doc.setDrawColor(...HEADER_BORDER);
  doc.setLineWidth(0.75);
  doc.line(0, headerBottom, pageW, headerBottom);

  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND);
  doc.text(PUBLIC_WEBSITE_HOST, pageW - margin, headerTop + 38, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(BENCHMARK_TOOL_NAME, pageW - margin, headerTop + 52, { align: "right" });

  const logoW = 200;
  const logoH = Math.round(logoW * (308 / 1024));
  const logoX = margin;
  const logoY = headerTop + 8;

  if (logoDataUrl) {
    try {
      doc.addImage(
        logoDataUrl,
        detectImageFormat(logoDataUrl),
        logoX,
        logoY,
        logoW,
        logoH,
      );
    } catch {
      /* optional logo */
    }
  }
}

/** @deprecated Use {@link drawBenchmarkPageHeader} — kept for existing tests. */
export function drawBenchmarkReportHeader(
  doc: jsPDF,
  pageW: number,
  margin: number,
  logoDataUrl?: string | null,
): number {
  drawBenchmarkPageHeader(doc, pageW, margin, logoDataUrl);
  return PDF_CONTENT_START_Y;
}

function drawTitlePanel(
  doc: jsPDF,
  y: number,
  contentW: number,
  margin: number,
  estimateId: string,
): number {
  const titlePadX = 16;
  const titlePadTop = 12;
  const titleText = BENCHMARK_REPORT_PAGE_SUBTITLE;
  const titleFontSize = 15;
  const idFontSize = 9;
  const titleLineH = titleFontSize * LINE;
  const idLineH = idFontSize * LINE;
  const idGap = 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(titleFontSize);
  const titleLines = splitText(doc, titleText, contentW - titlePadX * 2);
  const panelH =
    titlePadTop * 2 + titleLines.length * titleLineH + idGap + idLineH + 8;

  doc.setFillColor(...TITLE_PANEL_BG);
  doc.setDrawColor(...HEADER_BORDER);
  doc.setLineWidth(0.75);
  doc.roundedRect(margin, y, contentW, panelH, 6, 6, "FD");

  doc.setTextColor(...BRAND);
  titleLines.forEach((line, index) => {
    doc.text(line, margin + titlePadX, y + titlePadTop + index * titleLineH + 11);
  });

  const idY = y + titlePadTop + titleLines.length * titleLineH + idGap + 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(idFontSize);
  doc.setTextColor(...MUTED);
  doc.text(`${BENCHMARK_TOOL_ID_LABEL}: ${estimateId}`, margin + titlePadX, idY);

  return y + panelH + PDF_HEADER_CONTENT_GAP;
}

function ensureY(
  doc: jsPDF,
  y: number,
  need: number,
  pageW: number,
  logoDataUrl?: string | null,
): number {
  if (y + need <= pdfMaxContentY(doc)) return y;
  doc.addPage();
  drawBenchmarkPageHeader(doc, pageW, MARGIN, logoDataUrl);
  return PDF_CONTENT_START_Y;
}

function startNewContentPage(
  doc: jsPDF,
  pageW: number,
  logoDataUrl: string | null | undefined,
): number {
  doc.addPage();
  drawBenchmarkPageHeader(doc, pageW, MARGIN, logoDataUrl);
  return PDF_CONTENT_START_Y;
}

/** Height of a label/value stat row — used to keep the pair on one page. */
export function measureStatRowBlockHeight(
  doc: jsPDF,
  value: string,
  maxW: number,
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const valueLines = splitText(doc, value, maxW * 0.42);
  const lineH = 9.5 * LINE;
  return Math.max(14, valueLines.length * lineH) + 6;
}

function measureParagraphHeight(
  doc: jsPDF,
  text: string,
  maxW: number,
  fontSize = 10,
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  const lines = splitText(doc, text, maxW);
  if (lines.length === 0) return 10;
  return lines.length * fontSize * LINE + 10;
}

function drawParagraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  pageW: number,
  logoDataUrl: string | null | undefined,
  fontSize = 10,
  keepWithNext = 0,
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...MUTED);
  const lines = splitText(doc, text, maxW);
  if (lines.length === 0) return y + 10;

  const lineH = fontSize * LINE;
  const gapAfter = 10;
  const blockH = lines.length * lineH + gapAfter;
  const maxBody = pdfMaxContentY(doc) - PDF_CONTENT_START_Y;

  if (blockH + keepWithNext <= maxBody) {
    y = ensureY(doc, y, blockH + keepWithNext, pageW, logoDataUrl);
    lines.forEach((line, i) => doc.text(line, x, y + i * lineH));
    return y + blockH;
  }

  let idx = 0;
  while (idx < lines.length) {
    const remaining = lines.length - idx;
    let fitLines = Math.floor((pdfMaxContentY(doc) - y) / lineH);

    if (fitLines < 1) {
      y = startNewContentPage(doc, pageW, logoDataUrl);
      fitLines = Math.floor((pdfMaxContentY(doc) - y) / lineH);
    }

    if (remaining > 1 && fitLines < remaining && fitLines <= 1) {
      y = startNewContentPage(doc, pageW, logoDataUrl);
      fitLines = Math.floor((pdfMaxContentY(doc) - y) / lineH);
    }

    const chunk = Math.min(fitLines, remaining);
    for (let i = 0; i < chunk; i++) {
      doc.text(lines[idx + i]!, x, y + i * lineH);
    }
    idx += chunk;
    y += chunk * lineH;

    if (idx < lines.length) {
      y = startNewContentPage(doc, pageW, logoDataUrl);
    }
  }

  return y + gapAfter;
}

/** Bullet list item with hanging indent and a conservative wrap width. */
function drawBulletParagraph(
  doc: jsPDF,
  text: string,
  y: number,
  contentW: number,
  pageW: number,
  logoDataUrl: string | null | undefined,
  fontSize = 9.5,
): number {
  const textX = MARGIN + BULLET_GUTTER;
  const maxW = contentW - BULLET_GUTTER - PDF_TEXT_RIGHT_INSET;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...MUTED);
  const lines = splitText(doc, text, maxW);
  if (lines.length === 0) return y + 10;

  const lineH = fontSize * LINE;
  const gapAfter = 10;
  const blockH = lines.length * lineH + gapAfter;
  const maxBody = pdfMaxContentY(doc) - PDF_CONTENT_START_Y;

  const drawChunk = (startIdx: number, chunkLines: string[], drawBullet: boolean) => {
    if (drawBullet) doc.text("•", MARGIN + 2, y);
    chunkLines.forEach((line, i) => doc.text(line, textX, y + i * lineH));
    y += chunkLines.length * lineH;
  };

  if (blockH <= maxBody) {
    y = ensureY(doc, y, blockH, pageW, logoDataUrl);
    drawChunk(0, lines, true);
    return y + gapAfter;
  }

  let idx = 0;
  while (idx < lines.length) {
    const remaining = lines.length - idx;
    let fitLines = Math.floor((pdfMaxContentY(doc) - y) / lineH);

    if (fitLines < 1) {
      y = startNewContentPage(doc, pageW, logoDataUrl);
      fitLines = Math.floor((pdfMaxContentY(doc) - y) / lineH);
    }

    if (remaining > 1 && fitLines < remaining && fitLines <= 1) {
      y = startNewContentPage(doc, pageW, logoDataUrl);
      fitLines = Math.floor((pdfMaxContentY(doc) - y) / lineH);
    }

    const chunk = Math.min(fitLines, remaining);
    drawChunk(idx, lines.slice(idx, idx + chunk), idx === 0);
    idx += chunk;

    if (idx < lines.length) {
      y = startNewContentPage(doc, pageW, logoDataUrl);
    }
  }

  return y + gapAfter;
}

function drawSectionTitle(
  doc: jsPDF,
  num: number,
  title: string,
  x: number,
  y: number,
  pageW: number,
  logoDataUrl: string | null | undefined,
): number {
  y = ensureY(doc, y, 22 + PDF_SECTION_KEEP_WITH_NEXT, pageW, logoDataUrl);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND);
  doc.text(`${num}. ${title}`, x, y);
  return y + 22;
}

function drawSubsectionTitle(
  doc: jsPDF,
  title: string,
  x: number,
  y: number,
  pageW: number,
  logoDataUrl: string | null | undefined,
  keepWithNext = PDF_KEEP_WITH_NEXT_MIN,
): number {
  y = ensureY(doc, y, 16 + keepWithNext, pageW, logoDataUrl);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(title, x, y);
  return y + 16;
}

function drawStatRow(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxW: number,
  pageW: number,
  logoDataUrl: string | null | undefined,
): number {
  const blockH = measureStatRowBlockHeight(doc, value, maxW);
  y = ensureY(doc, y, blockH, pageW, logoDataUrl);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(label, x, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  const valueLines = splitText(doc, value, maxW * 0.42);
  const lineH = 9.5 * LINE;
  valueLines.forEach((line, i) => {
    doc.text(line, x + maxW, y + i * lineH, { align: "right" });
  });
  return y + blockH;
}

function drawProfileGrid(
  doc: jsPDF,
  rows: { label: string; value: string }[],
  x: number,
  y: number,
  maxW: number,
  pageW: number,
  logoDataUrl: string | null | undefined,
): number {
  const colW = maxW / 2 - 8;
  let rowY = y;
  for (let i = 0; i < rows.length; i += 2) {
    rowY = ensureY(doc, rowY, 28, pageW, logoDataUrl);
    const left = rows[i]!;
    const right = rows[i + 1];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(left.label, x, rowY);
    if (right) doc.text(right.label, x + colW + 16, rowY);
    rowY += 11;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const leftLines = splitText(doc, left.value, colW);
    leftLines.forEach((line, li) => doc.text(line, x, rowY + li * 11));
    if (right) {
      const rightLines = splitText(doc, right.value, colW);
      rightLines.forEach((line, ri) => doc.text(line, x + colW + 16, rowY + ri * 11));
    }
    const blockH = Math.max(leftLines.length, right ? splitText(doc, right.value, colW).length : 0);
    rowY += blockH * 11 + 10;
  }
  return rowY;
}

function drawTop10Table(
  doc: jsPDF,
  y: number,
  margin: number,
  contentW: number,
  pageW: number,
  logoDataUrl: string | null | undefined,
  plans: ReturnType<typeof rankedPlanDetails>,
): number {
  y = ensureY(doc, y, 80, pageW, logoDataUrl);
  y = drawSubsectionTitle(doc, "Top 10 rankings", margin, y, pageW, logoDataUrl);

  const body = plans.map((plan) => [
    `#${plan.rank}`,
    plan.carrier,
    plan.plan,
    plan.planType,
    `${formatUsd(plan.monthly, 0)}/mo`,
    formatUsd(plan.annual, 0),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Rank", "Carrier", "Plan", "Type", "Monthly", "Annual est."]],
    body,
    margin: { left: margin, right: margin, top: PDF_CONTENT_START_Y },
    styles: { fontSize: 8, cellPadding: 4, textColor: INK },
    headStyles: { fillColor: BRAND, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    theme: "grid",
    didDrawPage: () => {
      drawBenchmarkPageHeader(doc, pageW, margin, logoDataUrl);
    },
  });

  // @ts-expect-error lastAutoTable is set by jspdf-autotable at runtime
  return (doc.lastAutoTable?.finalY ?? y) + 16;
}

export function buildBenchmarkReportPdf(
  benchmark: FinalizedBenchmark,
  logoDataUrl?: string | null,
  workbookFormState?: WorkbookFormState | null,
  miniLogoDataUrl?: string | null,
): jsPDF {
  const { estimateId, report, intake } = benchmark;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - MARGIN * 2;
  const workbook = getBenchmarkWorkbookContent();

  drawBenchmarkPageHeader(doc, pageW, MARGIN, logoDataUrl);
  let y = PDF_CONTENT_START_Y;
  y = drawTitlePanel(doc, y, contentW, MARGIN, estimateId);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const location = report.selectedCounty
    ? `ZIP prefix ${report.zip3}xx · ${report.selectedCounty.county}, ${report.selectedCounty.stateCode}`
    : report.counties.length > 0
      ? `ZIP prefix ${report.zip3}xx · ${report.counties.map((c) => `${c.county}, ${c.stateCode}`).join(" · ")}`
      : `ZIP prefix ${report.zip3}xx`;
  doc.text(location, MARGIN, y);
  y += 18;

  y = drawParagraph(
    doc,
    "This report summarizes federal baselines and generalized regional frameworks from your inputs. It is not a plan recommendation or enrollment offer.",
    MARGIN,
    y,
    contentW,
    pageW,
    logoDataUrl,
  );

  const ensureSpace = (currentY: number, needed: number) =>
    ensureY(doc, currentY, needed, pageW, logoDataUrl);

  // —— Section 1: My Input ——
  y = drawSectionTitle(doc, 1, BENCHMARK_TAB_INPUT, MARGIN, y, pageW, logoDataUrl);

  const profileRows = buildBenchmarkProfileAnswerRows(intake);
  if (profileRows.length > 0) {
    y = drawSubsectionTitle(doc, "Your answers", MARGIN, y, pageW, logoDataUrl);
    y = drawProfileGrid(doc, profileRows, MARGIN, y, contentW, pageW, logoDataUrl);
  }

  y = drawSubsectionTitle(
    doc,
    "Prescription tier summary",
    MARGIN,
    y,
    pageW,
    logoDataUrl,
    measureParagraphHeight(doc, report.prescriptionTierSummary, contentW, 9.5),
  );
  y = drawParagraph(doc, report.prescriptionTierSummary, MARGIN, y, contentW, pageW, logoDataUrl, 9.5);

  y = drawSubsectionTitle(
    doc,
    "Utilization context",
    MARGIN,
    y,
    pageW,
    logoDataUrl,
    measureParagraphHeight(doc, report.utilizationContext, contentW, 9.5),
  );
  y = drawParagraph(doc, report.utilizationContext, MARGIN, y, contentW, pageW, logoDataUrl, 9.5);

  y = drawSubsectionTitle(doc, "Ancillary needs breakdown", MARGIN, y, pageW, logoDataUrl);
  if (report.ancillaryNeeds.selected.length > 0) {
    y = drawParagraph(
      doc,
      report.ancillaryNeeds.selected.map((item) => `• ${item}`).join("\n"),
      MARGIN,
      y,
      contentW,
      pageW,
      logoDataUrl,
      9.5,
    );
  }
  y = drawParagraph(doc, report.ancillaryNeeds.note, MARGIN, y, contentW, pageW, logoDataUrl, 9.5);

  if (report.hasPreferredPharmacy && report.preferredPharmacyName) {
    y = drawParagraph(
      doc,
      `Preferred pharmacy noted: ${report.preferredPharmacyName}. Pharmacy network and formulary rules vary by Part D or Medicare Advantage contract.`,
      MARGIN,
      y,
      contentW,
      pageW,
      logoDataUrl,
      9,
    );
  }

  // —— Section 2: My PBO Blueprint & Benchmarks ——
  const { partBBase, localBenchmarks } = report;
  y = drawSectionTitle(doc, 2, BENCHMARK_TAB_PBO_LOCAL, MARGIN, y, pageW, logoDataUrl);

  y = drawSubsectionTitle(
    doc,
    PBO_BLUEPRINT_SECTION_TITLE,
    MARGIN,
    y,
    pageW,
    logoDataUrl,
    measureParagraphHeight(
      doc,
      `${report.partBBase.source}. These figures apply nationwide before any private supplemental or Advantage framework.`,
      contentW,
    ) +
      measureStatRowBlockHeight(doc, `${formatUsd(partBBase.standardMonthlyPremium)}/month`, contentW),
  );
  y = drawParagraph(
    doc,
    `${report.partBBase.source}. These figures apply nationwide before any private supplemental or Advantage framework.`,
    MARGIN,
    y,
    contentW,
    pageW,
    logoDataUrl,
  );
  y = drawStatRow(
    doc,
    "Standard Part B monthly premium",
    `${formatUsd(partBBase.standardMonthlyPremium)}/month`,
    MARGIN,
    y,
    contentW,
    pageW,
    logoDataUrl,
  );
  y = drawStatRow(
    doc,
    "Annual Part B deductible",
    formatUsd(partBBase.annualDeductible, 0),
    MARGIN,
    y,
    contentW,
    pageW,
    logoDataUrl,
  );
  y = drawParagraph(doc, `Income band (annually): ${report.incomeBand}`, MARGIN, y, contentW, pageW, logoDataUrl);
  y = drawParagraph(doc, report.incomeBandNote, MARGIN, y, contentW, pageW, logoDataUrl);
  y = drawParagraph(
    doc,
    "Co-insurance: After meeting the annual deductible, standard Original Medicare generally covers 80% of Medicare-approved medical costs. You remain responsible for the remaining 20% co-insurance, which is not capped under Original Medicare alone.",
    MARGIN,
    y,
    contentW,
    pageW,
    logoDataUrl,
  );

  const { medicareAdvantage: ma, partD: pd } = localBenchmarks;
  const localBenchmarkIntro = `Regional cost ranges for private-market frameworks near ZIP prefix ${report.zip3}xx, derived from ${report.catalogRevision}. These are educational estimates — not live quotes, carrier offers, or policy selections.`;
  const statRowKeepWithNext = measureStatRowBlockHeight(
    doc,
    `${formatUsd(ma.premiumRangeMonthly.low, 0)} – ${formatUsd(ma.premiumRangeMonthly.high, 0)}/month`,
    contentW,
  );
  const maStatsKeep =
    statRowKeepWithNext +
    measureStatRowBlockHeight(
      doc,
      `${formatUsd(ma.moopRangeAnnual.low, 0)} – ${formatUsd(ma.moopRangeAnnual.high, 0)}/year`,
      contentW,
    );
  y = drawSubsectionTitle(
    doc,
    BENCHMARK_TAB_LOCAL,
    MARGIN,
    y,
    pageW,
    logoDataUrl,
    measureParagraphHeight(doc, localBenchmarkIntro, contentW) +
      measureParagraphHeight(doc, ma.label, contentW, 10.5) +
      maStatsKeep,
  );
  y = drawParagraph(
    doc,
    localBenchmarkIntro,
    MARGIN,
    y,
    contentW,
    pageW,
    logoDataUrl,
  );

  y = drawParagraph(doc, ma.label, MARGIN, y, contentW, pageW, logoDataUrl, 10.5, maStatsKeep);
  y = drawStatRow(
    doc,
    "Typical premium bracket",
    `${formatUsd(ma.premiumRangeMonthly.low, 0)} – ${formatUsd(ma.premiumRangeMonthly.high, 0)}/month`,
    MARGIN,
    y,
    contentW,
    pageW,
    logoDataUrl,
  );
  y = drawStatRow(
    doc,
    "Common regional MOOP averages",
    `${formatUsd(ma.moopRangeAnnual.low, 0)} – ${formatUsd(ma.moopRangeAnnual.high, 0)}/year`,
    MARGIN,
    y,
    contentW,
    pageW,
    logoDataUrl,
  );
  y = drawParagraph(doc, ma.moopSourceNote, MARGIN, y, contentW, pageW, logoDataUrl);
  y = drawParagraph(doc, ma.source, MARGIN, y, contentW, pageW, logoDataUrl, 9);

  const pdStatKeep = measureStatRowBlockHeight(
    doc,
    `${formatUsd(pd.premiumRangeMonthly.low, 0)} – ${formatUsd(pd.premiumRangeMonthly.high, 0)}/month`,
    contentW,
  );
  const pdStatsKeep =
    pdStatKeep +
    measureStatRowBlockHeight(doc, `${formatUsd(pd.federalOopCap, 0)}/year`, contentW);
  y = drawParagraph(doc, pd.label, MARGIN, y, contentW, pageW, logoDataUrl, 10.5, pdStatsKeep);
  y = drawStatRow(
    doc,
    "Typical premium bracket",
    `${formatUsd(pd.premiumRangeMonthly.low, 0)} – ${formatUsd(pd.premiumRangeMonthly.high, 0)}/month`,
    MARGIN,
    y,
    contentW,
    pageW,
    logoDataUrl,
  );
  y = drawStatRow(
    doc,
    `Federal statutory out-of-pocket cap (${partBBase.year})`,
    `${formatUsd(pd.federalOopCap, 0)}/year`,
    MARGIN,
    y,
    contentW,
    pageW,
    logoDataUrl,
  );
  y = drawParagraph(doc, pd.source, MARGIN, y, contentW, pageW, logoDataUrl, 9);

  if (localBenchmarks.medigap) {
    const medigapStatKeep = measureStatRowBlockHeight(
      doc,
      `${formatUsd(localBenchmarks.medigap.premiumRangeMonthly.low, 0)} – ${formatUsd(localBenchmarks.medigap.premiumRangeMonthly.high, 0)}/month`,
      contentW,
    );
    y = drawParagraph(
      doc,
      localBenchmarks.medigap.label,
      MARGIN,
      y,
      contentW,
      pageW,
      logoDataUrl,
      10.5,
      medigapStatKeep,
    );
    y = drawStatRow(
      doc,
      "Typical premium bracket",
      `${formatUsd(localBenchmarks.medigap.premiumRangeMonthly.low, 0)} – ${formatUsd(localBenchmarks.medigap.premiumRangeMonthly.high, 0)}/month`,
      MARGIN,
      y,
      contentW,
      pageW,
      logoDataUrl,
    );
    y = drawParagraph(doc, localBenchmarks.medigap.source, MARGIN, y, contentW, pageW, logoDataUrl, 9);
  }

  // —— Section 3: My Potential Options ——
  const planScenario = benchmarkToPlanComparisonScenario(intake, report);
  const rankedPlans = rankedPlanDetails({
    year: planScenario.year,
    zip3: planScenario.zip3,
    county: planScenario.county,
    medications: planScenario.medications,
  });
  const top3Plans = potentialTop3PlanDetails({
    year: planScenario.year,
    zip3: planScenario.zip3,
    county: planScenario.county,
    medications: planScenario.medications,
  });

  if (rankedPlans.length > 0) {
    y = drawSectionTitle(doc, 3, BENCHMARK_TAB_POSSIBLE_PLANS, MARGIN, y, pageW, logoDataUrl);

    const topPlan = top3Plans[0] ?? rankedPlans[0]!;
    const runnersUp = top3Plans.length > 1 ? top3Plans.slice(1, 3) : rankedPlans.slice(1, 3);
    const whyBullets = [
      ...buildTopPlanHighlights(topPlan, planScenario.medications.length),
      ...buildScenarioFitReasons(planScenario),
      ...buildWhyTopPlanOverRunnersUp(topPlan, runnersUp, planScenario),
    ];

    y = drawSubsectionTitle(doc, "Recommended plan (#1)", MARGIN, y, pageW, logoDataUrl);
    y = drawParagraph(
      doc,
      `${topPlan.carrier} — ${topPlan.plan} (${topPlan.planType}, ${topPlan.network}). Estimated ${formatUsd(topPlan.monthly, 0)}/month · ${formatUsd(topPlan.annual, 0)}/year including drugs.`,
      MARGIN,
      y,
      contentW,
      pageW,
      logoDataUrl,
    );

    y = drawSubsectionTitle(doc, "#1 plan highlights", MARGIN, y, pageW, logoDataUrl);
    for (const bullet of whyBullets) {
      y = drawBulletParagraph(doc, bullet, y, contentW, pageW, logoDataUrl, 9.5);
    }

    if (runnersUp.length > 0) {
      y = drawSubsectionTitle(doc, "Potential top 3", MARGIN, y, pageW, logoDataUrl);
      for (const [index, plan] of runnersUp.entries()) {
        y = drawParagraph(
          doc,
          `#${index + 2} ${plan.carrier} — ${plan.plan} (${plan.planType}). ${formatUsd(plan.monthly, 0)}/month · ${formatUsd(plan.annual, 0)}/year.`,
          MARGIN + 8,
          y,
          contentW - 8,
          pageW,
          logoDataUrl,
          9.5,
        );
      }
    }

    y = drawTop10Table(doc, y, MARGIN, contentW, pageW, logoDataUrl, rankedPlans);
  }

  // —— Section 4: Help Me Prepare / workbook ——
  y = drawSectionTitle(doc, rankedPlans.length > 0 ? 4 : 3, BENCHMARK_TAB_PREPARE, MARGIN, y, pageW, logoDataUrl);
  y = drawSubsectionTitle(doc, BENCHMARK_WORKBOOK_SECTION_TITLE, MARGIN, y, pageW, logoDataUrl);
  y = appendWorkbookSectionToBenchmarkPdf(
    doc,
    y,
    MARGIN,
    contentW,
    workbook,
    workbookFormState,
    ensureSpace,
    () => startNewContentPage(doc, pageW, logoDataUrl),
  );

  y = ensureY(doc, y, 48, pageW, logoDataUrl);
  y = drawParagraph(
    doc,
    "This communication is for educational purposes only. It does not constitute personalized enrollment advice or a carrier plan catalog.",
    MARGIN,
    y,
    contentW,
    pageW,
    logoDataUrl,
    9,
  );
  drawParagraph(doc, BENCHMARK_TOOL_DISCLAIMER, MARGIN, y, contentW, pageW, logoDataUrl, 8);

  stampBenchmarkPdfPageHeaders(doc, pageW, logoDataUrl);
  stampPdfPageFooters(doc, {
    margin: MARGIN,
    copyright: formatSiteCopyright(),
    miniLogoDataUrl,
    miniLogoSize: 14,
  });

  return doc;
}

/** Ensure the branded header band (site wordmark) appears on every page, including autotable breaks. */
export function stampBenchmarkPdfPageHeaders(
  doc: jsPDF,
  pageW: number,
  logoDataUrl?: string | null,
): void {
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    drawBenchmarkPageHeader(doc, pageW, MARGIN, logoDataUrl);
  }
}

export function benchmarkReportPdfBlob(doc: jsPDF): Blob {
  return doc.output("blob");
}

export function benchmarkReportPdfFilename(estimateId: string): string {
  const safe = estimateId.replace(/[^\w-]+/g, "");
  return `Part-B-Benchmark-Report-${safe || "report"}.pdf`;
}

async function buildBenchmarkReportPdfDocument(
  benchmark: FinalizedBenchmark,
  options?: Pick<BenchmarkReportPdfOptions, "workbookFormState">,
): Promise<jsPDF> {
  const [logoDataUrl, miniLogoDataUrl] = await Promise.all([
    loadArticlePdfLogo(),
    loadPdfFooterMiniLogo(),
  ]);
  return buildBenchmarkReportPdf(
    benchmark,
    logoDataUrl,
    options?.workbookFormState,
    miniLogoDataUrl,
  );
}

/** Download the benchmark report PDF to the user's device. */
export async function downloadBenchmarkReportPdf(
  benchmark: FinalizedBenchmark,
  options?: Pick<BenchmarkReportPdfOptions, "workbookFormState">,
): Promise<void> {
  const doc = await buildBenchmarkReportPdfDocument(benchmark, options);
  downloadBlobFile(benchmarkReportPdfFilename(benchmark.estimateId), benchmarkReportPdfBlob(doc));
}

/** Open the benchmark report PDF in a new tab so the user can save or print from the viewer. */
export async function openBenchmarkReportPdfInNewTab(
  benchmark: FinalizedBenchmark,
  options?: Pick<BenchmarkReportPdfOptions, "workbookFormState">,
): Promise<void> {
  const tab = preparePdfPreviewTab();
  try {
    const doc = await buildBenchmarkReportPdfDocument(benchmark, options);
    openPdfBlobInTab(tab, benchmarkReportPdfBlob(doc), {
      fallbackFilename: benchmarkReportPdfFilename(benchmark.estimateId),
    });
  } catch (err) {
    tab?.close();
    throw err;
  }
}
