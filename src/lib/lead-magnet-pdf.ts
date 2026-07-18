import { jsPDF } from "jspdf";
import { downloadBlobFile } from "@/lib/article-authoring";
import { openPdfBlobInTab, preparePdfPreviewTab } from "@/lib/pdf-open";
import { loadPdfFooterMiniLogo, markdownToPdfBlocks } from "@/lib/article-pdf";
import { LEARNING_ARTICLE_DISCLAIMER } from "@/lib/learning-center";
import { formatSiteCopyright } from "@/lib/medicare-disclaimers";
import { stampPdfPageFooters } from "@/lib/pdf-page-footer";
import { SITE_BRAND_NAME, SITE_TAGLINE } from "@/lib/site-brand";
import { PUBLIC_WEBSITE_HOST } from "@/lib/site-url";
import { leadMagnetSlugFromDraft } from "@/lib/content-factory/lead-magnet-paths";
import type { CalendarDraftRef } from "@/lib/content-factory/editorial-calendar-links";
import {
  agentQuestionNotes,
  isWorkbookItemChecked,
  sectionIdForWorkbookHeading,
  supplementDrugRows,
  supplementLineValues,
  type WorkbookPdfFill,
} from "@/lib/workbook-pdf-fill";

const BRAND_BLUE: [number, number, number] = [29, 78, 216];
const INK: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [75, 85, 99];
const TITLE_PANEL: [number, number, number] = [253, 244, 255];
/** Light header band — logo reads clearly (not inverted). */
const HEADER_BG: [number, number, number] = [239, 246, 255];
const HEADER_BORDER: [number, number, number] = [191, 219, 254];

const PAGE_TOP_MARGIN = 12;
const HEADER_HEIGHT = 78;
/** Space between header rule and first content (title panel or section). */
const HEADER_CONTENT_GAP = 18;
const CONTENT_START_Y = PAGE_TOP_MARGIN + HEADER_HEIGHT + HEADER_CONTENT_GAP;
const LOGO_PATH = "/email-header-logo.png";
const WRITING_LINE_HEIGHT = 22;
/** Visible ruled lines for notes and writing prompts (print-friendly black). */
const WRITING_LINE_COLOR: [number, number, number] = INK;
const WRITING_LINE_WIDTH = 0.75;
const SECTION_NOTES_LINES = 4;
const PROMPT_WRITING_LINES = 4;
const SUPPLEMENT_QUESTIONS_LINES = 10;

const QUESTIONS_SECTION_HEADING = /questions for your review meeting/i;
const BEFORE_COMPARE_SECTION_HEADING = /before you compare plans/i;
const OFFICIAL_SOURCES_SECTION_HEADING = /official sources to verify/i;
/** Ruled lines under each review-meeting question for the user's answer. */
const QUESTIONS_ANSWER_LINES = 3;
/** Extra ruled lines after the listed questions for anything else to ask. */
const QUESTIONS_EXTRA_LINES = 5;
/** Space between review-meeting questions and before the Other questions block. */
const WORKBOOK_QUESTION_GAP = 28;
const OTHER_QUESTIONS_TOP_GAP = 32;
/** Space before Notes and between checklist items. */
const CHECKLIST_ITEM_GAP = 28;
const SECTION_NOTES_TOP_GAP = 28;
/** Space before each H2 section heading when it follows prior content. */
const WORKBOOK_SECTION_TOP_GAP = 44;
/** Space between supplement blocks (prescriptions, doctors, additional questions). */
const SUPPLEMENT_SECTION_GAP = 56;
const SUPPLEMENT_BLOCK_TAIL_GAP = 16;
const WORKBOOK_BODY_DISCLAIMER_PATTERN = /educational workbook only/i;
const DEFAULT_WORKBOOK_BODY_DISCLAIMER =
  "Educational workbook only — not personalized enrollment advice.";

/** Bump when PDF layout changes so inline previews rebuild instead of serving cached blobs. */
export const LEAD_MAGNET_PDF_LAYOUT_VERSION = "2026-07-disclaimer-last-page";

export interface LeadMagnetPdfSource {
  title: string;
  excerpt: string;
  body: string;
}

export interface LeadMagnetPdfAssets {
  logoDataUrl?: string | null;
  miniLogoDataUrl?: string | null;
  /** When set, checklist marks and writing lines are filled from the in-report workbook form. */
  fill?: WorkbookPdfFill;
}

function detectImageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

function stripDuplicateTitleHeading(body: string, title: string): string {
  const md = body.trim();
  const match = md.match(/^#\s+(.+)(?:\n|$)/);
  if (match && match[1].trim().toLowerCase() === title.trim().toLowerCase()) {
    return md.slice(match[0].length).trimStart();
  }
  return md;
}

function extractWorkbookBodyDisclaimer(bodyMd: string): string {
  const line = bodyMd
    .split("\n")
    .map((entry) => entry.trim())
    .find(
      (entry) =>
        entry &&
        !entry.startsWith("#") &&
        !entry.startsWith("-") &&
        WORKBOOK_BODY_DISCLAIMER_PATTERN.test(entry),
    );
  return line ?? DEFAULT_WORKBOOK_BODY_DISCLAIMER;
}

function isWorkbookBodyDisclaimerText(text: string): boolean {
  return WORKBOOK_BODY_DISCLAIMER_PATTERN.test(text.trim());
}

/** Light page header with brand logo on every page. */
export function drawLeadMagnetPageHeader(
  doc: jsPDF,
  pageW: number,
  margin: number,
  logoDataUrl?: string | null,
): void {
  const headerTop = PAGE_TOP_MARGIN;
  const headerBottom = headerTop + HEADER_HEIGHT;

  doc.setFillColor(...HEADER_BG);
  doc.rect(0, headerTop, pageW, HEADER_HEIGHT, "F");
  doc.setDrawColor(...HEADER_BORDER);
  doc.setLineWidth(0.75);
  doc.line(0, headerBottom, pageW, headerBottom);

  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Medicare Planning Workbook · Educational only",
    pageW - margin,
    headerTop + 44,
    { align: "right" },
  );

  const logoW = 180;
  const logoH = 58;
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

export async function loadLeadMagnetPdfLogo(): Promise<string | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const response = await fetch(LOGO_PATH);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function itemNeedsWritingLines(item: string): boolean {
  return /\blist\b|\bwrite down\b/i.test(item);
}

export function itemNeedsPrescriptionRows(item: string): boolean {
  return /\blist\b/i.test(item) && /\bprescription\b|\bmedications?\b|\bdrugs?\b/i.test(item);
}

function twoColumnRuledRowsBlockHeight(count: number): number {
  const headerH = 18;
  return headerH + count * WRITING_LINE_HEIGHT + 28;
}

function drawItemWritingLines(
  doc: jsPDF,
  item: string,
  startY: number,
  ensureSpace: (y: number, needed: number) => number,
  margin: number,
  contentW: number,
  options?: { skipEnsure?: boolean },
  fill?: WorkbookPdfFill,
): number {
  if (itemNeedsPrescriptionRows(item)) {
    const drugRows = supplementDrugRows(fill);
    const filledRows = Array.from({ length: PROMPT_WRITING_LINES }, (_, index) => ({
      left: drugRows[index]?.left ?? "",
      right: drugRows[index]?.right ?? "",
    }));
    return drawTwoColumnRuledRows(
      doc,
      startY,
      PROMPT_WRITING_LINES,
      ensureSpace,
      margin,
      contentW,
      "Drug name",
      "Dosage / how often",
      { ...options, filledRows },
    );
  }
  if (!itemNeedsWritingLines(item)) {
    return startY;
  }
  return drawRuledLines(
    doc,
    startY,
    PROMPT_WRITING_LINES,
    ensureSpace,
    margin,
    contentW,
    undefined,
    options,
  );
}

export function isWorkbookQuestionsSectionHeading(text: string): boolean {
  return QUESTIONS_SECTION_HEADING.test(text.trim());
}

export function isWorkbookBeforeCompareSectionHeading(text: string): boolean {
  return BEFORE_COMPARE_SECTION_HEADING.test(text.trim());
}

export function isWorkbookOfficialSourcesSectionHeading(text: string): boolean {
  return OFFICIAL_SOURCES_SECTION_HEADING.test(text.trim());
}

function workbookQuestionItemHeight(doc: jsPDF, item: string, contentW: number, withTopGap: boolean): number {
  const lines = doc.splitTextToSize(item, contentW);
  const topGap = withTopGap ? WORKBOOK_QUESTION_GAP : 0;
  return topGap + lines.length * 14 + 8 + ruledLinesBlockHeight(QUESTIONS_ANSWER_LINES, false);
}

/** Height of the review-meeting questions list (each question + answer lines + extra lines). */
export function estimateWorkbookQuestionsSectionHeight(
  doc: jsPDF,
  items: string[],
  contentW: number,
): number {
  let height = 4;
  for (let i = 0; i < items.length; i++) {
    height += workbookQuestionItemHeight(doc, items[i]!, contentW, i > 0);
  }
  height += OTHER_QUESTIONS_TOP_GAP + ruledLinesBlockHeight(QUESTIONS_EXTRA_LINES, true);
  return height;
}

function drawWorkbookQuestionItem(
  doc: jsPDF,
  question: string,
  startY: number,
  ensureSpace: (y: number, needed: number) => number,
  margin: number,
  contentW: number,
  options?: { skipEnsure?: boolean; topGap?: boolean; answerLines?: string[] },
): number {
  let y = startY;
  if (options?.topGap) {
    y += WORKBOOK_QUESTION_GAP;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  const lines = doc.splitTextToSize(question, contentW);
  const textH = lines.length * 14 + 10;
  const blockH =
    (options?.topGap ? WORKBOOK_QUESTION_GAP : 0) + textH + ruledLinesBlockHeight(QUESTIONS_ANSWER_LINES, false);
  y = options?.skipEnsure ? y : ensureSpace(y, blockH);
  doc.text(lines, margin, y);
  y += textH;
  return drawRuledLines(
    doc,
    y,
    QUESTIONS_ANSWER_LINES,
    ensureSpace,
    margin,
    contentW,
    undefined,
    {
      skipEnsure: true,
      filledLines: options?.answerLines,
    },
  );
}

const PAGE_BOTTOM_PADDING = 36;

function countRuledLinesThatFit(y: number, pageH: number, withLabel: boolean): number {
  const available = pageH - PAGE_BOTTOM_PADDING - y;
  const labelH = withLabel ? 14 : 0;
  const overhead = labelH + 16;
  if (available <= overhead + WRITING_LINE_HEIGHT) return 0;
  return Math.floor((available - overhead) / WRITING_LINE_HEIGHT);
}

/** Extend ruled lines to the bottom of the current page (continues Notes without a second label). */
function fillPageBottomWithRuledLines(
  doc: jsPDF,
  startY: number,
  pageH: number,
  margin: number,
  contentW: number,
  ensureSpace: (y: number, needed: number) => number,
  label?: string,
): number {
  const withLabel = label !== undefined;
  const count = countRuledLinesThatFit(startY, pageH, withLabel);
  if (count < 1) return startY;
  return drawRuledLines(doc, startY, count, ensureSpace, margin, contentW, label, { skipEnsure: true });
}

const H2_SECTION_HEADING_HEIGHT = 34;

function ruledLinesBlockHeight(count: number, withLabel: boolean): number {
  const labelH = withLabel ? 14 : 0;
  return labelH + count * WRITING_LINE_HEIGHT + 22;
}

function checkboxLineHeight(doc: jsPDF, item: string, contentW: number): number {
  const box = 10;
  const textW = contentW - box - 8;
  const lines = doc.splitTextToSize(item, textW);
  return Math.max(box, lines.length * 13) + 6;
}

function orderedListItemHeight(doc: jsPDF, item: string, contentW: number): number {
  const lines = doc.splitTextToSize(item, contentW - 12);
  return lines.length * 14 + 4;
}

/** Height of a checklist section including prompt lines and trailing Notes. */
export function estimateWorkbookListSectionHeight(
  doc: jsPDF,
  items: string[],
  contentW: number,
  listType: "ul" | "ol",
  includeSectionNotes = true,
): number {
  let height = includeSectionNotes
    ? SECTION_NOTES_TOP_GAP + ruledLinesBlockHeight(SECTION_NOTES_LINES, true) + 4
    : 4;
  for (let i = 0; i < items.length; i++) {
    if (i > 0) height += CHECKLIST_ITEM_GAP;
    const item = items[i]!;
    height +=
      listType === "ul" ? checkboxLineHeight(doc, item, contentW) : orderedListItemHeight(doc, item, contentW);
    if (itemNeedsPrescriptionRows(item)) {
      height += twoColumnRuledRowsBlockHeight(PROMPT_WRITING_LINES);
    } else if (itemNeedsWritingLines(item)) {
      height += ruledLinesBlockHeight(PROMPT_WRITING_LINES, false);
    }
  }
  return height;
}

function estimateWorkbookH2ListSectionHeight(
  doc: jsPDF,
  items: string[],
  contentW: number,
  listType: "ul" | "ol",
  includeSectionNotes = true,
): number {
  return (
    H2_SECTION_HEADING_HEIGHT +
    estimateWorkbookListSectionHeight(doc, items, contentW, listType, includeSectionNotes)
  );
}

function drawWorkbookH2Heading(
  doc: jsPDF,
  text: string,
  y: number,
  margin: number,
  options?: { topGap?: boolean },
): number {
  if (options?.topGap) {
    y += WORKBOOK_SECTION_TOP_GAP;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(text, margin, y);
  return y + 18;
}

function drawRuledLines(
  doc: jsPDF,
  startY: number,
  count: number,
  ensureSpace: (y: number, needed: number) => number,
  margin: number,
  contentW: number,
  label?: string,
  options?: { skipEnsure?: boolean; filledLines?: string[] },
): number {
  const labelH = label ? 14 : 0;
  const totalH = labelH + count * WRITING_LINE_HEIGHT + 6;
  let y = options?.skipEnsure ? startY : ensureSpace(startY, totalH);

  if (label) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(label, margin, y + 10);
    y += labelH;
  }

  doc.setDrawColor(...WRITING_LINE_COLOR);
  doc.setLineWidth(WRITING_LINE_WIDTH);
  const lineEndX = margin + contentW;
  for (let i = 0; i < count; i++) {
    const lineY = y + WRITING_LINE_HEIGHT * i + 16;
    const filled = options?.filledLines?.[i]?.trim();
    if (filled) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      const wrapped = doc.splitTextToSize(filled, contentW - 8);
      doc.text(wrapped, margin + 4, lineY - 5);
    }
    doc.line(margin, lineY, lineEndX, lineY);
  }

  return y + count * WRITING_LINE_HEIGHT + 16;
}

function drawTwoColumnRuledRows(
  doc: jsPDF,
  startY: number,
  count: number,
  ensureSpace: (y: number, needed: number) => number,
  margin: number,
  contentW: number,
  leftLabel: string,
  rightLabel: string,
  options?: {
    skipEnsure?: boolean;
    filledRows?: { left: string; right: string }[];
  },
): number {
  const gap = 14;
  const leftW = Math.floor(contentW * 0.58);
  const rightX = margin + leftW + gap;
  const rightW = contentW - leftW - gap;
  const headerH = 18;
  const rowH = WRITING_LINE_HEIGHT;
  const totalH = headerH + count * rowH + 8;
  let y = options?.skipEnsure ? startY : ensureSpace(startY, totalH);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(leftLabel, margin, y + 10);
  doc.text(rightLabel, rightX, y + 10);
  y += headerH;

  doc.setDrawColor(...WRITING_LINE_COLOR);
  doc.setLineWidth(WRITING_LINE_WIDTH);
  for (let i = 0; i < count; i++) {
    const lineY = y + rowH * i + 16;
    const filled = options?.filledRows?.[i];
    if (filled?.left.trim()) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(doc.splitTextToSize(filled.left, leftW - 6), margin + 3, lineY - 5);
    }
    if (filled?.right.trim()) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(doc.splitTextToSize(filled.right, rightW - 6), rightX + 3, lineY - 5);
    }
    doc.line(margin, lineY, margin + leftW, lineY);
    doc.line(rightX, lineY, rightX + rightW, lineY);
  }

  return y + count * rowH + 18;
}

const SUPPLEMENT_HEADING_AFTER = 14;
const SUPPLEMENT_HINT_AFTER = 14;
const SUPPLEMENT_PROVIDER_LINES = 8;
const SUPPLEMENT_DRUG_ROWS = 8;

function supplementHintLineCount(doc: jsPDF, hint: string, contentW: number): number {
  return doc.splitTextToSize(hint, contentW).length;
}

function estimateSupplementRuledBlockHeight(
  doc: jsPDF,
  hint: string,
  contentW: number,
  lineCount: number,
): number {
  return (
    SUPPLEMENT_HEADING_AFTER +
    supplementHintLineCount(doc, hint, contentW) * 11 +
    SUPPLEMENT_HINT_AFTER +
    ruledLinesBlockHeight(lineCount, false)
  );
}

function estimateSupplementDrugBlockHeight(doc: jsPDF, hint: string, contentW: number): number {
  return (
    SUPPLEMENT_HEADING_AFTER +
    supplementHintLineCount(doc, hint, contentW) * 11 +
    SUPPLEMENT_HINT_AFTER +
    twoColumnRuledRowsBlockHeight(SUPPLEMENT_DRUG_ROWS)
  );
}

function drawSupplementHeading(doc: jsPDF, title: string, y: number, margin: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(title, margin, y);
  return y + SUPPLEMENT_HEADING_AFTER;
}

function drawSupplementHint(
  doc: jsPDF,
  hint: string,
  y: number,
  margin: number,
  contentW: number,
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const lines = doc.splitTextToSize(hint, contentW);
  doc.text(lines, margin, y);
  return y + lines.length * 11 + SUPPLEMENT_HINT_AFTER;
}

function drawSupplementRuledBlock(
  doc: jsPDF,
  startY: number,
  sectionGap: number,
  title: string,
  hint: string,
  lineCount: number,
  ensureSpace: (y: number, needed: number) => number,
  margin: number,
  contentW: number,
  filledLines?: string[],
): number {
  const blockHeight = estimateSupplementRuledBlockHeight(doc, hint, contentW, lineCount);
  let y = startY + sectionGap;
  y = ensureSpace(y, blockHeight);
  y = drawSupplementHeading(doc, title, y, margin);
  y = drawSupplementHint(doc, hint, y, margin, contentW);
  y = drawRuledLines(doc, y, lineCount, ensureSpace, margin, contentW, undefined, {
    skipEnsure: true,
    filledLines,
  });
  return y;
}

/** Extra prescriptions, providers, and review-meeting questions — flows after main workbook content. */
export function drawWorkbookSupplementPage(
  doc: jsPDF,
  startY: number,
  pageW: number,
  _pageH: number,
  margin: number,
  _logoDataUrl: string | null | undefined,
  ensureSpace: (y: number, needed: number) => number,
  fill?: WorkbookPdfFill,
): number {
  const contentW = pageW - margin * 2;
  const drugHint =
    "Use this page for extra medications — include the drug name, exact dosage, and how often you take it.";
  const providerHint =
    "Write down names, specialties, and locations you want to keep when comparing plans.";

  let y = startY;
  const drugRows = supplementDrugRows(fill);
  const filledDrugRows = Array.from({ length: SUPPLEMENT_DRUG_ROWS }, (_, index) => ({
    left: drugRows[index]?.left ?? "",
    right: drugRows[index]?.right ?? "",
  }));
  const drugBlockHeight = estimateSupplementDrugBlockHeight(doc, drugHint, contentW);
  y = ensureSpace(y, drugBlockHeight);
  y = drawSupplementHeading(doc, "Additional prescriptions", y, margin);
  y = drawSupplementHint(doc, drugHint, y, margin, contentW);
  y = drawTwoColumnRuledRows(
    doc,
    y,
    SUPPLEMENT_DRUG_ROWS,
    ensureSpace,
    margin,
    contentW,
    "Drug name",
    "Dosage / how often",
    { skipEnsure: true, filledRows: filledDrugRows },
  );
  y += SUPPLEMENT_BLOCK_TAIL_GAP;

  const providerLines = supplementLineValues(fill, "workbook-providers", SUPPLEMENT_PROVIDER_LINES);
  const filledProviderLines = Array.from(
    { length: SUPPLEMENT_PROVIDER_LINES },
    (_, index) => providerLines[index] ?? "",
  );
  y = drawSupplementRuledBlock(
    doc,
    y,
    SUPPLEMENT_SECTION_GAP,
    "Preferred doctors, specialists & hospitals",
    providerHint,
    SUPPLEMENT_PROVIDER_LINES,
    ensureSpace,
    margin,
    contentW,
    filledProviderLines,
  );
  y += SUPPLEMENT_BLOCK_TAIL_GAP;

  const extraQuestionLines = supplementLineValues(
    fill,
    "workbook-extra-questions",
    SUPPLEMENT_QUESTIONS_LINES,
  );
  const filledExtraQuestions = Array.from(
    { length: SUPPLEMENT_QUESTIONS_LINES },
    (_, index) => extraQuestionLines[index] ?? "",
  );
  y = drawSupplementRuledBlock(
    doc,
    y,
    SUPPLEMENT_SECTION_GAP,
    "Additional questions",
    "Use these lines if you think of more to ask at your review meeting.",
    SUPPLEMENT_QUESTIONS_LINES,
    ensureSpace,
    margin,
    contentW,
    filledExtraQuestions,
  );

  return y;
}

/** Printable Medicare planning workbook PDF from Content Factory markdown. */
export function buildLeadMagnetWorkbookPdf(
  source: LeadMagnetPdfSource,
  assets: LeadMagnetPdfAssets = {},
): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  const bodyMd = stripDuplicateTitleHeading(source.body, source.title);
  const blocks = markdownToPdfBlocks(bodyMd);
  const workbookBodyDisclaimer = extractWorkbookBodyDisclaimer(bodyMd);
  const logoDataUrl = assets.logoDataUrl;
  const fill = assets.fill;
  const titleUpper = source.title.toUpperCase();

  drawLeadMagnetPageHeader(doc, pageW, margin, logoDataUrl);

  const ensureSpace = (y: number, needed: number): number => {
    if (y + needed <= pageH - 36) return y;
    doc.addPage();
    drawLeadMagnetPageHeader(doc, pageW, margin, logoDataUrl);
    return CONTENT_START_Y;
  };

  let y = CONTENT_START_Y;

  const titlePadX = 16;
  const titlePadTop = 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(titleUpper, contentW - titlePadX * 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const excerptLines = doc.splitTextToSize(source.excerpt, contentW - titlePadX * 2).slice(0, 2);
  const titleLineH = 16;
  const excerptLineH = 12;
  const panelH =
    titlePadTop +
    titleLines.length * titleLineH +
    (excerptLines.length ? 4 + excerptLines.length * excerptLineH : 0) +
    8;

  doc.setFillColor(...TITLE_PANEL);
  doc.setDrawColor(244, 114, 182);
  doc.roundedRect(margin, y, contentW, panelH, 6, 6, "FD");

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(titleLines, margin + titlePadX, y + titlePadTop + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  if (excerptLines.length) {
    doc.text(excerptLines, margin + titlePadX, y + titlePadTop + 8 + titleLines.length * titleLineH + 4);
  }

  y += panelH + 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 16;

  const drawCheckboxLine = (
    item: string,
    startY: number,
    skipEnsure = false,
    checked = false,
  ): number => {
    const box = 10;
    const textX = margin + box + 8;
    const textW = contentW - box - 8;
    const lines = doc.splitTextToSize(item, textW);
    const blockH = Math.max(box, lines.length * 13) + 6;
    let rowY = skipEnsure ? startY : ensureSpace(startY, blockH);
    const boxTop = rowY - box + 2;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.75);
    doc.rect(margin, boxTop, box, box, "FD");
    if (checked) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text("✓", margin + 2.5, rowY + 0.5);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(lines, textX, rowY);
    return rowY + blockH;
  };

  const maxListSectionHeight = pageH - 36 - CONTENT_START_Y;
  let currentH2 = "";
  let officialSourcesKeepTogether = false;
  let questionsKeepTogether = false;

  const startNewPage = () => {
    doc.addPage();
    drawLeadMagnetPageHeader(doc, pageW, margin, logoDataUrl);
    return CONTENT_START_Y;
  };

  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
    const block = blocks[blockIndex]!;
    if (block.type === "h2") {
      currentH2 = block.text;
      officialSourcesKeepTogether = false;
      questionsKeepTogether = false;

      if (isWorkbookQuestionsSectionHeading(block.text)) {
        const nextBlock = blocks[blockIndex + 1];
        const listItems = nextBlock?.type === "ul" ? nextBlock.items : [];
        const sectionHeight =
          listItems.length > 0
            ? H2_SECTION_HEADING_HEIGHT + estimateWorkbookQuestionsSectionHeight(doc, listItems, contentW)
            : H2_SECTION_HEADING_HEIGHT;

        if (y > CONTENT_START_Y) {
          y = fillPageBottomWithRuledLines(doc, y, pageH, margin, contentW, ensureSpace);
        }
        y = startNewPage();
        if (sectionHeight <= maxListSectionHeight) {
          y = ensureSpace(y, sectionHeight);
          questionsKeepTogether = true;
        }

        y = drawWorkbookH2Heading(doc, block.text, y, margin);
        continue;
      }

      if (isWorkbookOfficialSourcesSectionHeading(block.text)) {
        const nextBlock = blocks[blockIndex + 1];
        const listItems = nextBlock?.type === "ul" ? nextBlock.items : [];
        const sectionHeight =
          listItems.length > 0
            ? estimateWorkbookH2ListSectionHeight(doc, listItems, contentW, "ul", true)
            : H2_SECTION_HEADING_HEIGHT;

        y = startNewPage();
        if (sectionHeight <= maxListSectionHeight) {
          y = ensureSpace(y, sectionHeight);
          officialSourcesKeepTogether = true;
        }

        y = drawWorkbookH2Heading(doc, block.text, y, margin);
        continue;
      }

      y = ensureSpace(y, H2_SECTION_HEADING_HEIGHT);
      y = drawWorkbookH2Heading(doc, block.text, y, margin);
      continue;
    }
    if (block.type === "h3") {
      y = ensureSpace(y, 32);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...INK);
      doc.text(block.text, margin, y);
      y += 18;
      continue;
    }
    if (block.type === "ul") {
      if (isWorkbookQuestionsSectionHeading(currentH2)) {
        const sectionHeight = estimateWorkbookQuestionsSectionHeight(doc, block.items, contentW);
        const keepTogether = questionsKeepTogether || sectionHeight <= maxListSectionHeight;
        if (keepTogether && !questionsKeepTogether) {
          y = ensureSpace(y, sectionHeight);
        }
        const notes = agentQuestionNotes(fill);
        for (let i = 0; i < block.items.length; i++) {
          const answerLines: string[] = [];
          if (notes[i]) {
            answerLines[0] = notes[i]!;
          }
          y = drawWorkbookQuestionItem(doc, block.items[i]!, y, ensureSpace, margin, contentW, {
            skipEnsure: keepTogether,
            topGap: i > 0,
            answerLines,
          });
        }
        y += OTHER_QUESTIONS_TOP_GAP;
        const extraQuestionFill = [
          ...supplementLineValues(fill, "workbook-extra-questions", QUESTIONS_EXTRA_LINES),
          ...notes.slice(block.items.length),
        ];
        const otherFilled = Array.from(
          { length: QUESTIONS_EXTRA_LINES },
          (_, index) => extraQuestionFill[index] ?? "",
        );
        y = drawRuledLines(
          doc,
          y,
          QUESTIONS_EXTRA_LINES,
          ensureSpace,
          margin,
          contentW,
          "Other questions:",
          { skipEnsure: keepTogether, filledLines: otherFilled },
        );
        y = fillPageBottomWithRuledLines(doc, y, pageH, margin, contentW, ensureSpace);
        y += 4;
        continue;
      }

      const checklistSectionId = sectionIdForWorkbookHeading(currentH2);
      const includeSectionNotes = !isWorkbookQuestionsSectionHeading(currentH2);
      const sectionHeight = estimateWorkbookListSectionHeight(
        doc,
        block.items,
        contentW,
        "ul",
        includeSectionNotes,
      );
      const keepTogether =
        isWorkbookOfficialSourcesSectionHeading(currentH2) && officialSourcesKeepTogether
          ? true
          : sectionHeight <= maxListSectionHeight;
      if (keepTogether && !isWorkbookOfficialSourcesSectionHeading(currentH2)) {
        y = ensureSpace(y, sectionHeight);
      }
      for (let i = 0; i < block.items.length; i++) {
        if (i > 0) y += CHECKLIST_ITEM_GAP;
        const checked =
          checklistSectionId != null
            ? isWorkbookItemChecked(fill, checklistSectionId, i)
            : false;
        y = drawCheckboxLine(block.items[i]!, y, keepTogether, checked);
        y = drawItemWritingLines(doc, block.items[i]!, y, ensureSpace, margin, contentW, {
          skipEnsure: keepTogether,
        }, fill);
      }
      if (includeSectionNotes) {
        y += SECTION_NOTES_TOP_GAP;
        y = drawRuledLines(
          doc,
          y,
          SECTION_NOTES_LINES,
          ensureSpace,
          margin,
          contentW,
          "Notes:",
          { skipEnsure: keepTogether },
        );
      }
      if (isWorkbookOfficialSourcesSectionHeading(currentH2)) {
        y = fillPageBottomWithRuledLines(doc, y, pageH, margin, contentW, ensureSpace);
      }
      y += 4;
      continue;
    }
    if (block.type === "ol") {
      const includeSectionNotes = !isWorkbookQuestionsSectionHeading(currentH2);
      const sectionHeight = estimateWorkbookListSectionHeight(
        doc,
        block.items,
        contentW,
        "ol",
        includeSectionNotes,
      );
      const keepTogether = sectionHeight <= maxListSectionHeight;
      if (keepTogether) {
        y = ensureSpace(y, sectionHeight);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      for (const [index, item] of block.items.entries()) {
        const lines = doc.splitTextToSize(`${index + 1}. ${item}`, contentW - 12);
        const itemHeight = lines.length * 14 + 4;
        if (!keepTogether) {
          y = ensureSpace(y, lines.length * 14 + 6);
        }
        doc.text(lines, margin + 8, y);
        y += itemHeight;
        y = drawItemWritingLines(doc, item, y, ensureSpace, margin, contentW, {
          skipEnsure: keepTogether,
        }, fill);
      }
      if (includeSectionNotes) {
        y = drawRuledLines(
          doc,
          y,
          SECTION_NOTES_LINES,
          ensureSpace,
          margin,
          contentW,
          "Notes:",
          { skipEnsure: keepTogether },
        );
      }
      y += 4;
      continue;
    }
    if (isWorkbookBodyDisclaimerText(block.text)) {
      continue;
    }
    const lines = doc.splitTextToSize(block.text, contentW);
    y = ensureSpace(y, lines.length * 14 + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 10;
  }

  y = startNewPage();
  y = drawWorkbookSupplementPage(doc, y, pageW, pageH, margin, logoDataUrl, ensureSpace, fill);

  doc.addPage();
  drawLeadMagnetPageHeader(doc, pageW, margin, logoDataUrl);
  y = CONTENT_START_Y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Educational disclaimer", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const eduLines = doc.splitTextToSize(LEARNING_ARTICLE_DISCLAIMER, contentW);
  y = ensureSpace(y, eduLines.length * 12 + 8);
  doc.text(eduLines, margin, y);
  y += eduLines.length * 12 + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Workbook notice", margin, y);
  y += 16;
  const workbookDisclaimerLines = doc.splitTextToSize(workbookBodyDisclaimer, contentW);
  y = ensureSpace(y, workbookDisclaimerLines.length * 12 + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(workbookDisclaimerLines, margin, y);
  y += workbookDisclaimerLines.length * 12 + 20;

  y = ensureSpace(y, 40);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(SITE_TAGLINE, margin, y);
  y += 20;

  y = ensureSpace(y, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(formatSiteCopyright(), margin, y);
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.text(PUBLIC_WEBSITE_HOST, margin, y);

  stampPdfPageFooters(doc, {
    margin,
    pageH,
    textColor: MUTED,
    miniLogoDataUrl: assets.miniLogoDataUrl,
    miniLogoSize: 14,
  });
  return doc;
}

export function leadMagnetPdfToBase64(doc: jsPDF): string {
  const bytes = new Uint8Array(doc.output("arraybuffer"));
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export function leadMagnetPdfBlob(doc: jsPDF): Blob {
  return doc.output("blob");
}

const previewBlobCache = new Map<string, string>();

/** Blob URL for inline preview — cached so Strict Mode remounts do not revoke mid-render. */
export function leadMagnetPdfPreviewBlobUrl(doc: jsPDF, cacheKey: string): string {
  const cached = previewBlobCache.get(cacheKey);
  if (cached) return cached;

  for (const [key, url] of previewBlobCache) {
    if (key !== cacheKey) {
      URL.revokeObjectURL(url);
      previewBlobCache.delete(key);
    }
  }

  const url = URL.createObjectURL(leadMagnetPdfBlob(doc));
  previewBlobCache.set(cacheKey, url);
  return url;
}

/** Inline preview — stable in iframes (unlike blob URLs that Strict Mode can revoke). */
export function leadMagnetPdfDataUrl(doc: jsPDF): string {
  return `data:application/pdf;base64,${leadMagnetPdfToBase64(doc)}`;
}

export async function buildLeadMagnetWorkbookPdfWithLogo(
  source: LeadMagnetPdfSource,
): Promise<jsPDF> {
  const [logoDataUrl, miniLogoDataUrl] = await Promise.all([
    loadLeadMagnetPdfLogo(),
    loadPdfFooterMiniLogo(),
  ]);
  return buildLeadMagnetWorkbookPdf(source, { logoDataUrl, miniLogoDataUrl });
}

export async function downloadLeadMagnetPdf(
  source: LeadMagnetPdfSource,
  filename?: string,
  assets?: LeadMagnetPdfAssets,
): Promise<void> {
  const slug = leadMagnetSlugFromDraft({ title: source.title, payload: {} });
  const [logoDataUrl, miniLogoDataUrl] = await Promise.all([
    assets?.logoDataUrl !== undefined ? Promise.resolve(assets.logoDataUrl) : loadLeadMagnetPdfLogo(),
    assets?.miniLogoDataUrl !== undefined ? Promise.resolve(assets.miniLogoDataUrl) : loadPdfFooterMiniLogo(),
  ]);
  const doc = buildLeadMagnetWorkbookPdf(source, { ...assets, logoDataUrl, miniLogoDataUrl });
  downloadBlobFile(filename ?? `${slug}.pdf`, leadMagnetPdfBlob(doc));
}

/** Open the live workbook PDF in a new browser tab (from draft queue View PDF). */
export async function openLeadMagnetWorkbookPdfInNewTab(
  source: LeadMagnetPdfSource,
  assets?: LeadMagnetPdfAssets,
): Promise<void> {
  const tab = preparePdfPreviewTab();
  try {
    const [logoDataUrl, miniLogoDataUrl] = await Promise.all([
      assets?.logoDataUrl !== undefined ? Promise.resolve(assets.logoDataUrl) : loadLeadMagnetPdfLogo(),
      assets?.miniLogoDataUrl !== undefined ? Promise.resolve(assets.miniLogoDataUrl) : loadPdfFooterMiniLogo(),
    ]);
    const doc = buildLeadMagnetWorkbookPdf(source, { ...assets, logoDataUrl, miniLogoDataUrl });
    openPdfBlobInTab(tab, leadMagnetPdfBlob(doc), {
      fallbackFilename: `${leadMagnetSlugFromDraft(source.title)}.pdf`,
    });
  } catch (err) {
    tab?.close();
    throw err;
  }
}

export function leadMagnetSourceFromDraft(
  draft: Pick<CalendarDraftRef, "title" | "excerpt" | "body">,
): LeadMagnetPdfSource {
  return {
    title: draft.title,
    excerpt: draft.excerpt,
    body: draft.body,
  };
}
