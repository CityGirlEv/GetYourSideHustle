import { jsPDF } from "jspdf";
import { openPdfInBrowser } from "./open-pdf";
import {
  BETA_PROGRAM_DOC_SUBTITLE,
  BETA_PROGRAM_DOC_TITLE,
  BETA_PROGRAM_EFFECTIVE,
  BETA_PROGRAM_PDF_FILENAME,
  BETA_PROGRAM_INTRO,
  BETA_PROGRAM_SECTIONS,
} from "./beta-program-doc";
import {
  PDF_MARGIN as MARGIN,
  PDF_CONTENT_W as CONTENT_W,
  PDF_CONTENT_TOP,
  PDF_CONTENT_BOTTOM,
  PDF_BRAND_COLORS,
  drawPdfPageChrome,
  applyPdfPageBranding,
} from "./pdf-branding";
import { loadPdfLogoDataUrl } from "./pdf-logo";
import { SITE_NAME } from "./site-config";

const COLORS = PDF_BRAND_COLORS;

type Ctx = { doc: jsPDF; y: number };

function ensureSpace(ctx: Ctx, need: number) {
  if (ctx.y + need > PDF_CONTENT_BOTTOM) {
    ctx.doc.addPage();
    drawPdfPageChrome(ctx.doc);
    ctx.y = PDF_CONTENT_TOP;
  }
}

function heading(ctx: Ctx, text: string) {
  ensureSpace(ctx, 36);
  ctx.doc.setFont("times", "bold");
  ctx.doc.setFontSize(13);
  ctx.doc.setTextColor(...COLORS.wine);
  ctx.doc.text(text, MARGIN, ctx.y);
  ctx.y += 7;
  ctx.doc.setDrawColor(...COLORS.line);
  ctx.doc.setLineWidth(0.6);
  ctx.doc.line(MARGIN, ctx.y, MARGIN + CONTENT_W, ctx.y);
  ctx.y += 14;
}

function para(ctx: Ctx, text: string, opts?: { italic?: boolean; size?: number }) {
  const size = opts?.size ?? 11;
  ctx.doc.setFont("times", opts?.italic ? "italic" : "normal");
  ctx.doc.setFontSize(size);
  ctx.doc.setTextColor(...COLORS.charcoal);
  const lines = ctx.doc.splitTextToSize(text, CONTENT_W) as string[];
  ensureSpace(ctx, lines.length * (size + 3) + 8);
  for (const line of lines) {
    ctx.doc.text(line, MARGIN, ctx.y);
    ctx.y += size + 3;
  }
  ctx.y += 6;
}

function bullets(ctx: Ctx, items: readonly string[]) {
  ctx.doc.setFont("times", "normal");
  ctx.doc.setFontSize(11);
  ctx.doc.setTextColor(...COLORS.charcoal);
  for (const item of items) {
    const lines = ctx.doc.splitTextToSize(`•  ${item}`, CONTENT_W) as string[];
    ensureSpace(ctx, lines.length * 14 + 2);
    for (const line of lines) {
      ctx.doc.text(line, MARGIN, ctx.y);
      ctx.y += 14;
    }
  }
  ctx.y += 6;
}

function table(ctx: Ctx, headers: string[], rows: string[][]) {
  const cols = headers.length;
  const colW = CONTENT_W / cols;
  const rowH = (cells: string[]) => {
    let h = 16;
    cells.forEach((cell) => {
      const lines = ctx.doc.splitTextToSize(cell, colW - 8) as string[];
      h = Math.max(h, lines.length * 11 + 8);
    });
    return h;
  };
  const paint = (cells: string[], header: boolean) => {
    const h = rowH(cells);
    ensureSpace(ctx, h + 2);
    if (header) {
      ctx.doc.setFillColor(247, 241, 227);
      ctx.doc.rect(MARGIN, ctx.y - 10, CONTENT_W, h, "F");
      ctx.doc.setFont("times", "bold");
    } else {
      ctx.doc.setFont("times", "normal");
    }
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(...COLORS.charcoal);
    cells.forEach((cell, i) => {
      const lines = ctx.doc.splitTextToSize(cell, colW - 8) as string[];
      ctx.doc.text(lines, MARGIN + i * colW + 4, ctx.y);
    });
    ctx.y += h;
  };
  paint(headers, true);
  rows.forEach((row) => paint(row, false));
  ctx.y += 10;
}

export async function downloadBetaProgramPdf(reservedTab?: Window | null): Promise<void> {
  const logoDataUrl = await loadPdfLogoDataUrl();
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);
  const ctx: Ctx = { doc, y: PDF_CONTENT_TOP + 4 };

  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.charcoal);
  doc.text(BETA_PROGRAM_DOC_TITLE, MARGIN, ctx.y);
  ctx.y += 22;
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.bronze);
  doc.text(BETA_PROGRAM_DOC_SUBTITLE, MARGIN, ctx.y);
  ctx.y += 16;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text(`${SITE_NAME}  ·  Effective ${BETA_PROGRAM_EFFECTIVE}`, MARGIN, ctx.y);
  ctx.y += 18;

  for (const p of BETA_PROGRAM_INTRO) para(ctx, p);

  for (const section of BETA_PROGRAM_SECTIONS) {
    heading(ctx, section.heading);
    for (const block of section.blocks) {
      if (block.type === "p") para(ctx, block.text);
      else if (block.type === "list") bullets(ctx, block.items);
      else table(ctx, block.headers, block.rows);
    }
  }

  applyPdfPageBranding(doc, BETA_PROGRAM_DOC_TITLE, logoDataUrl);
  openPdfInBrowser(doc, BETA_PROGRAM_PDF_FILENAME, reservedTab);
}
