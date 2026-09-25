/** Branded PDF of the MAKE IT POP workshop sneak peek (copyright, TOC, rules, Before Class). */

import { jsPDF } from "jspdf";
import {
  PDF_BRAND_COLORS,
  PDF_CONTENT_BOTTOM,
  PDF_CONTENT_TOP,
  PDF_CONTENT_W,
  PDF_MARGIN,
  PDF_PAGE_W,
  applyPdfPageBranding,
  drawPdfPageChrome,
} from "./pdf-branding";
import { PRODUCTION_SITE_URL } from "./site-config";
import {
  AI_SCENE_PACKS_PREREQ_PDF_PATH,
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

export function workshopSneakPeekPdfPublicPath(workshopId: string): string | null {
  if (!workshopSneakPeek(workshopId)) return null;
  return AI_SCENE_PACKS_PREREQ_PDF_PATH;
}

export function workshopSneakPeekPdfPublicUrl(workshopId: string): string | null {
  const path = workshopSneakPeekPdfPublicPath(workshopId);
  return path ? `${PRODUCTION_SITE_URL}${path}` : null;
}

export function workshopSneakPeekPdfTitle(_peek: WorkshopSneakPeek): string {
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

function bulletRow(state: DrawState, item: string) {
  const textX = PDF_MARGIN + 18;
  const textW = PDF_CONTENT_W - 18;
  const lines = wrap(state.doc, item, textW, BODY, false);
  ensure(state, lines.length * LINE + 4);
  state.doc.setFillColor(...PDF_BRAND_COLORS.wine);
  state.doc.circle(PDF_MARGIN + 5, state.y - 3, 2.2, "F");
  state.doc.setFont("helvetica", "normal");
  state.doc.setFontSize(BODY);
  state.doc.setTextColor(...PDF_BRAND_COLORS.charcoal);
  for (const line of lines) {
    state.doc.text(line, textX, state.y);
    state.y += LINE;
  }
  state.y += 3;
}

function bodyPara(state: DrawState, text: string, size = BODY, gap = 6) {
  const lines = wrap(state.doc, text, PDF_CONTENT_W, size, false);
  ensure(state, lines.length * LINE + gap);
  state.doc.setFont("helvetica", "normal");
  state.doc.setFontSize(size);
  state.doc.setTextColor(...PDF_BRAND_COLORS.charcoal);
  for (const line of lines) {
    state.doc.text(line, PDF_MARGIN, state.y);
    state.y += LINE;
  }
  state.y += gap;
}

function creditPlanRow(state: DrawState, plan: WorkshopSneakPeek["creditPlans"][number]) {
  const colTool = 78;
  const colPrice = 230;
  const colNotes = PDF_CONTENT_W - colTool - colPrice - 12;
  const xPrice = PDF_MARGIN + colTool + 6;
  const xNotes = xPrice + colPrice + 6;
  const toolLines = wrap(state.doc, plan.tool, colTool, 9, true);
  const priceLines = wrap(state.doc, plan.pricing, colPrice, 9, false);
  const noteLines = wrap(state.doc, plan.notes, colNotes, 9, false);
  const rowH = Math.max(toolLines.length, priceLines.length, noteLines.length) * 12 + 10;
  ensure(state, rowH + 4);
  const top = state.y - 10;
  state.doc.setFillColor(...PDF_BRAND_COLORS.soft);
  state.doc.roundedRect(PDF_MARGIN, top, PDF_CONTENT_W, rowH, 4, 4, "F");
  state.doc.setFont("helvetica", "bold");
  state.doc.setFontSize(9);
  state.doc.setTextColor(...PDF_BRAND_COLORS.wine);
  let yTool = state.y;
  for (const line of toolLines) {
    state.doc.text(line, PDF_MARGIN + 6, yTool);
    yTool += 12;
  }
  state.doc.setFont("helvetica", "normal");
  state.doc.setTextColor(...PDF_BRAND_COLORS.charcoal);
  let yPrice = state.y;
  for (const line of priceLines) {
    state.doc.text(line, xPrice, yPrice);
    yPrice += 12;
  }
  let yNotes = state.y;
  for (const line of noteLines) {
    state.doc.text(line, xNotes, yNotes);
    yNotes += 12;
  }
  state.y = top + rowH + 8;
}

function copyrightSection(state: DrawState, peek: WorkshopSneakPeek) {
  sectionHeading(state, peek.copyrightHeading);
  peek.copyrightLines.forEach((line) => bodyPara(state, line, BODY, 8));
}

function creditsSection(state: DrawState, peek: WorkshopSneakPeek) {
  state.doc.addPage();
  drawPdfPageChrome(state.doc);
  state.y = PDF_CONTENT_TOP;
  sectionHeading(state, peek.creditsHeading);
  bodyPara(state, peek.creditsIntro);
  state.doc.setFont("helvetica", "bold");
  state.doc.setFontSize(8);
  state.doc.setTextColor(...PDF_BRAND_COLORS.muted);
  ensure(state, 16);
  state.doc.text("Tool", PDF_MARGIN + 6, state.y);
  state.doc.text("Pricing Guide", PDF_MARGIN + 84, state.y);
  state.doc.text("What to Know", PDF_MARGIN + 320, state.y);
  state.y += 12;
  peek.creditPlans.forEach((plan) => creditPlanRow(state, plan));
  sectionHeading(state, peek.creditsImportantHeading);
  bodyPara(state, peek.creditsImportantLead);
  bodyPara(state, "Plan for:", 10, 4);
  peek.creditsPlanFor.forEach((item) => bulletRow(state, item));
  bodyPara(state, peek.creditsTip, BODY, 8);
  bodyPara(state, peek.creditsDisclaimer, 9, 4);
}

export async function buildWorkshopSneakPeekPdf(workshopId: string): Promise<jsPDF | null> {
  const peek = workshopSneakPeek(workshopId);
  if (!peek) return null;
  const logoDataUrl = undefined;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);
  const state: DrawState = { doc, y: PDF_CONTENT_TOP };

  centerLines(state, peek.kicker, 16, true, PDF_BRAND_COLORS.charcoal, 2);
  centerLines(state, peek.title, 12, true, PDF_BRAND_COLORS.charcoal, 2);
  centerLines(state, peek.tools, 11, false, PDF_BRAND_COLORS.muted, 6);

  copyrightSection(state, peek);

  sectionHeading(state, "Table of Contents");
  peek.toc.forEach((item, i) => tocRow(state, i + 1, item));

  sectionHeading(state, peek.rulesHeading);
  peek.rules.forEach((item) => checkRow(state, item));

  sectionHeading(state, peek.beforeClassHeading);
  peek.beforeClass.forEach((item) => checkRow(state, item));

  creditsSection(state, peek);

  applyPdfPageBranding(doc, workshopSneakPeekPdfTitle(peek), logoDataUrl, new Date(), {
    hideLastUpdated: true,
  });
  return doc;
}

/** Resend wants raw base64 (no data: prefix). Works in the browser and in Pages Functions. */
export function workshopGuidePdfBase64(doc: jsPDF): string {
  const bytes = new Uint8Array(doc.output("arraybuffer"));
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function workshopGuidePdfAttachment(workshopId: string): Promise<{
  filename: string;
  content: string;
  contentType: "application/pdf";
} | null> {
  const filename = workshopSneakPeekPdfFilename(workshopId);
  if (!filename) return null;
  const doc = await buildWorkshopSneakPeekPdf(workshopId);
  if (!doc) return null;
  return {
    filename,
    content: workshopGuidePdfBase64(doc),
    contentType: "application/pdf",
  };
}

export async function downloadWorkshopSneakPeekPdf(
  workshopId: string,
  reservedTab?: Window | null,
): Promise<string | null> {
  const { openPdfInBrowser, reservePdfTab } = await import("./open-pdf");
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
