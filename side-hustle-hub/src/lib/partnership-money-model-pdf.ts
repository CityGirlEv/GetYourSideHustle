/**
 * GYSH partnership money model PDF (Admin > Financials > Money model).
 * Plain Helvetica-safe text; roomy section layout; TOC on page 1.
 */
import { jsPDF } from "jspdf";
import { openPdfInBrowser } from "./open-pdf";
import {
  getMoneyModelDraft,
  type MoneyModelDraftId,
  type MoneyModelSection,
} from "./partnership-money-model";
import {
  PDF_MARGIN as MARGIN,
  PDF_CONTENT_W as CONTENT_W,
  PDF_CONTENT_TOP,
  PDF_CONTENT_BOTTOM,
  PDF_BRAND_COLORS,
  loadPdfLogoDataUrl,
  drawPdfPageChrome,
  applyPdfPageBranding,
} from "./pdf-branding";

export { PARTNERSHIP_MONEY_MODEL_META } from "./partnership-money-model";

const COLORS = PDF_BRAND_COLORS;
const LINE = 13;
const GAP = 10;
const SECTION_GAP = 18;

type Ctx = { doc: jsPDF; y: number };

function newPage(ctx: Ctx) {
  ctx.doc.addPage();
  drawPdfPageChrome(ctx.doc);
  ctx.y = PDF_CONTENT_TOP;
}

function ensureSpace(ctx: Ctx, need: number) {
  if (ctx.y + need > PDF_CONTENT_BOTTOM) newPage(ctx);
}

function heading(ctx: Ctx, text: string) {
  ensureSpace(ctx, 40);
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(13);
  ctx.doc.setTextColor(...COLORS.charcoal);
  const lines = ctx.doc.splitTextToSize(text, CONTENT_W) as string[];
  for (const line of lines) {
    ctx.doc.text(line, MARGIN, ctx.y);
    ctx.y += 16;
  }
  ctx.doc.setDrawColor(...COLORS.wine);
  ctx.doc.setLineWidth(1);
  ctx.doc.line(MARGIN, ctx.y, MARGIN + 72, ctx.y);
  ctx.y += 14;
}

function para(
  ctx: Ctx,
  text: string,
  opts?: { bold?: boolean; size?: number; color?: [number, number, number] },
) {
  const size = opts?.size ?? 10;
  const leading = size + 4;
  ctx.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  ctx.doc.setFontSize(size);
  ctx.doc.setTextColor(...(opts?.color ?? COLORS.charcoal));
  const lines = ctx.doc.splitTextToSize(text, CONTENT_W) as string[];
  ensureSpace(ctx, lines.length * leading + GAP);
  for (const line of lines) {
    ensureSpace(ctx, leading);
    ctx.doc.text(line, MARGIN, ctx.y);
    ctx.y += leading;
  }
  ctx.y += 6;
}

function bullets(ctx: Ctx, items: readonly string[]) {
  const size = 10;
  const leading = LINE;
  const bulletX = MARGIN;
  const textX = MARGIN + 14;
  const textW = CONTENT_W - 14;

  for (const item of items) {
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(size);
    ctx.doc.setTextColor(...COLORS.charcoal);
    const lines = ctx.doc.splitTextToSize(item, textW) as string[];
    ensureSpace(ctx, lines.length * leading + 4);
    ctx.doc.text("•", bulletX, ctx.y);
    for (let i = 0; i < lines.length; i++) {
      ensureSpace(ctx, leading);
      ctx.doc.text(lines[i]!, textX, ctx.y);
      ctx.y += leading;
    }
    ctx.y += 4;
  }
  ctx.y += 4;
}

function simpleTable(ctx: Ctx, headers: string[], rows: string[][], colWeights?: number[]) {
  const cols = headers.length;
  const weights = colWeights ?? Array.from({ length: cols }, () => 1);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const colWs = weights.map((w) => (CONTENT_W * w) / weightSum);
  const padX = 6;
  const padY = 6;
  const fontSize = 9;
  const leading = fontSize + 3;

  const cellLines = (cells: string[], bold: boolean) => {
    ctx.doc.setFont("helvetica", bold ? "bold" : "normal");
    ctx.doc.setFontSize(fontSize);
    return cells.map((c, i) => {
      const w = Math.max(12, colWs[i]! - padX * 2);
      return ctx.doc.splitTextToSize(String(c || "-"), w) as string[];
    });
  };

  const rowHeight = (lineSets: string[][]) => {
    const maxLines = Math.max(1, ...lineSets.map((ls) => ls.length));
    return maxLines * leading + padY * 2;
  };

  const paint = (cells: string[], bold: boolean, fill: [number, number, number] | null) => {
    const lineSets = cellLines(cells, bold);
    const h = rowHeight(lineSets);
    ensureSpace(ctx, h + 2);
    // Recompute after possible page break (font state reset safe).
    const linesAfter = cellLines(cells, bold);
    const hh = rowHeight(linesAfter);

    if (fill) {
      ctx.doc.setFillColor(...fill);
      ctx.doc.rect(MARGIN, ctx.y, CONTENT_W, hh, "F");
    }
    ctx.doc.setDrawColor(...COLORS.line);
    ctx.doc.setLineWidth(0.4);
    ctx.doc.rect(MARGIN, ctx.y, CONTENT_W, hh, "S");

    let x = MARGIN;
    for (let i = 1; i < cols; i++) {
      x += colWs[i - 1]!;
      ctx.doc.line(x, ctx.y, x, ctx.y + hh);
    }

    ctx.doc.setFont("helvetica", bold ? "bold" : "normal");
    ctx.doc.setFontSize(fontSize);
    ctx.doc.setTextColor(...COLORS.charcoal);

    let cx = MARGIN;
    linesAfter.forEach((ls, i) => {
      let ty = ctx.y + padY + fontSize;
      for (const line of ls) {
        ctx.doc.text(line, cx + padX, ty);
        ty += leading;
      }
      cx += colWs[i]!;
    });
    ctx.y += hh;
  };

  paint(headers, true, [247, 241, 227]);
  rows.forEach((row, idx) => paint(row, false, idx % 2 ? [252, 250, 244] : null));
  ctx.y += SECTION_GAP;
}

function writeSection(ctx: Ctx, section: MoneyModelSection, startOnNewPage: boolean) {
  if (startOnNewPage) newPage(ctx);
  else ctx.y += SECTION_GAP;

  heading(ctx, section.title);
  if (section.intro) para(ctx, section.intro);
  for (const block of section.tables ?? []) {
    if (block.caption) para(ctx, block.caption, { bold: true, size: 9 });
    simpleTable(ctx, block.table.headers, block.table.rows, block.table.colWeights);
  }
  if (section.bullets?.length) bullets(ctx, section.bullets);
  for (const p of section.paragraphs ?? []) para(ctx, p);
  if (section.note) para(ctx, section.note, { size: 9, color: COLORS.muted });
}

export async function downloadPartnershipMoneyModelPdf(
  reservedTab?: Window | null,
  draftId: MoneyModelDraftId | string = "draft1",
): Promise<void> {
  const draft = getMoneyModelDraft(draftId);
  const m = draft.meta;
  const sections = draft.sections;
  const logoDataUrl = await loadPdfLogoDataUrl();
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);

  const ctx: Ctx = { doc, y: PDF_CONTENT_TOP + 4 };

  // Cover / TOC
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.charcoal);
  const titleLines = doc.splitTextToSize(m.title, CONTENT_W) as string[];
  for (const line of titleLines) {
    doc.text(line, MARGIN, ctx.y);
    ctx.y += 24;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.wine);
  doc.text(`${m.tabLabel} · Task ${m.taskNumber}`, MARGIN, ctx.y);
  ctx.y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.bronze);
  const subLines = doc.splitTextToSize(m.subtitle, CONTENT_W) as string[];
  for (const line of subLines) {
    doc.text(line, MARGIN, ctx.y);
    ctx.y += 15;
  }
  ctx.y += 8;

  para(ctx, m.lead, { size: 9, color: COLORS.muted });

  heading(ctx, "Contents");
  sections.forEach((s, i) => {
    ensureSpace(ctx, LINE + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.charcoal);
    doc.text(`${i + 1}.  ${s.tocLabel}`, MARGIN + 8, ctx.y);
    ctx.y += LINE + 4;
  });
  ctx.y += 8;
  para(ctx, `Where to find this: ${m.where}`, { size: 9, color: COLORS.muted });

  // Pack sections continuously — avoid sparse one-section-per-page blank space.
  sections.forEach((section, idx) => {
    writeSection(ctx, section, false);
    if (idx === sections.length - 1) {
      ctx.y += 6;
      para(
        ctx,
        "This is a working partner summary, not a signed legal agreement.",
        { size: 9, color: COLORS.muted },
      );
    }
  });

  applyPdfPageBranding(doc, m.title, logoDataUrl);
  openPdfInBrowser(doc, m.filename, reservedTab);
}
