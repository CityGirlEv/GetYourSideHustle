/** Branded PDF of the MAKE IT POP workshop sneak peek (TOC, rules, Before Class). */

import { jsPDF } from "jspdf";
import { openPdfInBrowser, reservePdfTab } from "./open-pdf";
import {
  PDF_BRAND_COLORS,
  PDF_CONTENT_BOTTOM,
  PDF_CONTENT_TOP,
  PDF_CONTENT_W,
  PDF_MARGIN,
  PDF_PAGE_W,
  applyPdfPageBranding,
  drawPdfPageChrome,
  loadPdfLogoDataUrl,
} from "./pdf-branding";
import {
  workshopSneakPeek,
  type WorkshopChecklistItem,
  type WorkshopSneakPeek,
} from "./workshop-playbooks";

const BODY = 10;
const LINE = 14;
const BOX = 8;
const BOX_LIFT = 7;
const CODE_COL = 28;
const TOC_NUM_COL = 26;

/** Helvetica/WinAnsi cannot paint Unicode dashes, bullets, or ballot boxes. */
export function pdfSafeWorkshopText(text: string): string {
  return String(text || "")
    .replace(/\u00a0/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/[•·●]/g, "")
    .replace(/[☐☑✓✔]/g, "")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

export function workshopSneakPeekPdfFilename(workshopId: string): string | null {
  if (!workshopSneakPeek(workshopId)) return null;
  return "GYSH-MAKE-IT-POP-Workshop-Guide.pdf";
}

export function workshopSneakPeekPdfTitle(peek: WorkshopSneakPeek): string {
  return "MAKE IT POP Workshop Guide";
}

type DrawState = { doc: jsPDF; y: number };

function ensure(state: DrawState, need: number) {
  if (state.y + need <= PDF_CONTENT_BOTTOM) return;
  state.doc.addPage();
  drawPdfPageChrome(state.doc);
  state.y = PDF_CONTENT_TOP;
}

function wrap(doc: jsPDF, text: string, maxW: number, size: number, bold = false): string[] {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
  return doc.splitTextToSize(pdfSafeWorkshopText(text), maxW) as string[];
}

function centerLines(state: DrawState, text: string, size: number, bold: boolean, color: [number, number, number], gap = 4) {
  const lines = wrap(state.doc, text, PDF_CONTENT_W, size, bold);
  const lineH = size + 5;
  ensure(state, lines.length * lineH + gap);
  state.doc.setFont("helvetica", bold ? "bold" : "normal");
  state.doc.setFontSize(size);
  state.doc.setTextColor(...color);
  for (const line of lines) {
    state.doc.text(line, PDF_PAGE_W / 2, state.y, { align: "center" });
    state.y += lineH;
  }
  state.y += gap;
}

function sectionHeading(state: DrawState, text: string) {
  const line = pdfSafeWorkshopText(text).toUpperCase();
  ensure(state, 36);
  state.y += 10;
  state.doc.setFont("helvetica", "bold");
  state.doc.setFontSize(11);
  state.doc.setTextColor(...PDF_BRAND_COLORS.link);
  state.doc.text(line, PDF_MARGIN, state.y);
  state.y += 8;
  state.doc.setDrawColor(...PDF_BRAND_COLORS.line);
  state.doc.setLineWidth(0.5);
  state.doc.line(PDF_MARGIN, state.y, PDF_MARGIN + PDF_CONTENT_W, state.y);
  state.y += 12;
}

function tocRow(state: DrawState, index: number, item: string) {
  const textW = PDF_CONTENT_W - TOC_NUM_COL;
  const lines = wrap(state.doc, item, textW, BODY, false);
  ensure(state, lines.length * LINE + 2);
  state.doc.setFont("helvetica", "bold");
  state.doc.setFontSize(BODY);
  state.doc.setTextColor(...PDF_BRAND_COLORS.charcoal);
  state.doc.text(`${index}.`, PDF_MARGIN + TOC_NUM_COL - 6, state.y, { align: "right" });
  state.doc.setFont("helvetica", "normal");
  for (const line of lines) {
    state.doc.text(line, PDF_MARGIN + TOC_NUM_COL, state.y);
    state.y += LINE;
  }
  state.y += 1;
}

function checkRow(state: DrawState, item: WorkshopChecklistItem) {
  const textX = PDF_MARGIN + CODE_COL + BOX + 10;
  const textW = PDF_CONTENT_W - (textX - PDF_MARGIN);
  const lines = wrap(state.doc, item.text, textW, BODY, false);
  ensure(state, Math.max(BOX, lines.length * LINE) + 4);

  state.doc.setFont("helvetica", "bold");
  state.doc.setFontSize(BODY);
  state.doc.setTextColor(...PDF_BRAND_COLORS.link);
  state.doc.text(pdfSafeWorkshopText(item.code), PDF_MARGIN, state.y);

  const boxY = state.y - BOX_LIFT;
  state.doc.setDrawColor(...PDF_BRAND_COLORS.bronze);
  state.doc.setLineWidth(0.9);
  state.doc.roundedRect(PDF_MARGIN + CODE_COL, boxY, BOX, BOX, 1.2, 1.2, "S");

  state.doc.setFont("helvetica", "normal");
  state.doc.setFontSize(BODY);
  state.doc.setTextColor(...PDF_BRAND_COLORS.charcoal);
  for (const line of lines) {
    state.doc.text(line, textX, state.y);
    state.y += LINE;
  }
  state.y += 3;
}

export async function buildWorkshopSneakPeekPdf(workshopId: string): Promise<jsPDF | null> {
  const peek = workshopSneakPeek(workshopId);
  if (!peek) return null;
  const logoDataUrl = await loadPdfLogoDataUrl();
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);
  const state: DrawState = { doc, y: PDF_CONTENT_TOP };

  centerLines(state, peek.kicker, 16, true, PDF_BRAND_COLORS.charcoal, 2);
  centerLines(state, peek.title, 13, true, PDF_BRAND_COLORS.charcoal, 2);
  centerLines(state, peek.tools, 11, false, PDF_BRAND_COLORS.muted, 6);

  doc.setDrawColor(...PDF_BRAND_COLORS.wine);
  doc.setLineWidth(0.9);
  const rulePad = 90;
  doc.line(PDF_MARGIN + rulePad, state.y, PDF_MARGIN + PDF_CONTENT_W - rulePad, state.y);
  state.y += 8;

  sectionHeading(state, "Table of Contents");
  peek.toc.forEach((item, i) => tocRow(state, i + 1, item));

  sectionHeading(state, peek.rulesHeading);
  peek.rules.forEach((item) => checkRow(state, item));

  sectionHeading(state, peek.beforeClassHeading);
  peek.beforeClass.forEach((item) => checkRow(state, item));

  applyPdfPageBranding(doc, workshopSneakPeekPdfTitle(peek), logoDataUrl);
  return doc;
}

export async function downloadWorkshopSneakPeekPdf(
  workshopId: string,
  reservedTab?: Window | null,
): Promise<string | null> {
  const filename = workshopSneakPeekPdfFilename(workshopId);
  if (!filename) {
    reservedTab?.close();
    return null;
  }
  const tab = reservedTab ?? reservePdfTab();
  const doc = await buildWorkshopSneakPeekPdf(workshopId);
  if (!doc) {
    tab?.close();
    return null;
  }
  openPdfInBrowser(doc, filename, tab);
  return filename;
}
