import { jsPDF } from "jspdf";
import { downloadBlobFile } from "@/lib/article-authoring";
import { markdownToPdfBlocks } from "@/lib/article-pdf";
import { LEARNING_ARTICLE_DISCLAIMER } from "@/lib/learning-center";
import { formatSiteCopyright } from "@/lib/medicare-disclaimers";
import { stampPdfPageFooters } from "@/lib/pdf-page-footer";
import { SITE_BRAND_NAME, SITE_TAGLINE } from "@/lib/site-brand";
import { leadMagnetSlugFromDraft } from "@/lib/content-factory/lead-magnet-paths";
import type { CalendarDraftRef } from "@/lib/content-factory/editorial-calendar-links";

const BRAND_BLUE: [number, number, number] = [29, 78, 216];
const INK: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [75, 85, 99];
const TITLE_PANEL: [number, number, number] = [253, 244, 255];
/** Light header band — logo reads clearly (not inverted). */
const HEADER_BG: [number, number, number] = [239, 246, 255];
const HEADER_BORDER: [number, number, number] = [191, 219, 254];

const HEADER_HEIGHT = 64;
const CONTENT_START_Y = 88;
const LOGO_PATH = "/email-header-logo.png";

export interface LeadMagnetPdfSource {
  title: string;
  excerpt: string;
  body: string;
}

export interface LeadMagnetPdfAssets {
  logoDataUrl?: string | null;
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

/** Light page header with brand logo on every page. */
export function drawLeadMagnetPageHeader(
  doc: jsPDF,
  pageW: number,
  margin: number,
  logoDataUrl?: string | null,
): void {
  doc.setFillColor(...HEADER_BG);
  doc.rect(0, 0, pageW, HEADER_HEIGHT, "F");
  doc.setDrawColor(...HEADER_BORDER);
  doc.setLineWidth(0.75);
  doc.line(0, HEADER_HEIGHT, pageW, HEADER_HEIGHT);

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(SITE_BRAND_NAME, margin, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Medicare Planning Workbook · Educational only", margin, 42);

  if (logoDataUrl) {
    try {
      doc.addImage(
        logoDataUrl,
        detectImageFormat(logoDataUrl),
        pageW - margin - 132,
        14,
        132,
        36,
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
  const logoDataUrl = assets.logoDataUrl;

  drawLeadMagnetPageHeader(doc, pageW, margin, logoDataUrl);

  const ensureSpace = (y: number, needed: number): number => {
    if (y + needed <= pageH - 36) return y;
    doc.addPage();
    drawLeadMagnetPageHeader(doc, pageW, margin, logoDataUrl);
    return CONTENT_START_Y;
  };

  let y = CONTENT_START_Y;

  doc.setFillColor(...TITLE_PANEL);
  doc.setDrawColor(244, 114, 182);
  doc.roundedRect(margin, y, contentW, 96, 8, 8, "FD");

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(source.title, contentW - 40);
  doc.text(titleLines, margin + 20, y + 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const excerptLines = doc.splitTextToSize(source.excerpt, contentW - 40);
  doc.text(excerptLines.slice(0, 2), margin + 20, y + 34 + titleLines.length * 20 + 8);

  y += 116;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 22;

  const drawCheckboxLine = (item: string, startY: number): number => {
    const box = 10;
    const textX = margin + box + 8;
    const textW = contentW - box - 8;
    const lines = doc.splitTextToSize(item, textW);
    const blockH = Math.max(box, lines.length * 13) + 6;
    let rowY = ensureSpace(startY, blockH);
    doc.setDrawColor(...MUTED);
    doc.setLineWidth(0.75);
    doc.rect(margin, rowY - box + 2, box, box);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(lines, textX, rowY);
    return rowY + blockH;
  };

  for (const block of blocks) {
    if (block.type === "h2") {
      y = ensureSpace(y, 40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...BRAND_BLUE);
      doc.text(block.text, margin, y);
      y += 22;
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
      for (const item of block.items) {
        y = drawCheckboxLine(item, y);
      }
      y += 6;
      continue;
    }
    if (block.type === "ol") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      for (const [index, item] of block.items.entries()) {
        const lines = doc.splitTextToSize(`${index + 1}. ${item}`, contentW - 12);
        y = ensureSpace(y, lines.length * 14 + 6);
        doc.text(lines, margin + 8, y);
        y += lines.length * 14 + 4;
      }
      y += 6;
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

  y = ensureSpace(y, 80);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Educational disclaimer", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  const disclaimerLines = doc.splitTextToSize(LEARNING_ARTICLE_DISCLAIMER, contentW);
  doc.text(disclaimerLines, margin, y);
  y += disclaimerLines.length * 11 + 14;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(SITE_TAGLINE, margin, y);

  stampPdfPageFooters(doc, {
    margin,
    pageH,
    textColor: MUTED,
    copyright: formatSiteCopyright(),
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

export async function buildLeadMagnetWorkbookPdfWithLogo(
  source: LeadMagnetPdfSource,
): Promise<jsPDF> {
  const logoDataUrl = await loadLeadMagnetPdfLogo();
  return buildLeadMagnetWorkbookPdf(source, { logoDataUrl });
}

export async function downloadLeadMagnetPdf(
  source: LeadMagnetPdfSource,
  filename?: string,
  assets?: LeadMagnetPdfAssets,
): Promise<void> {
  const slug = leadMagnetSlugFromDraft({ title: source.title, payload: {} });
  const logoDataUrl = assets?.logoDataUrl ?? (await loadLeadMagnetPdfLogo());
  const doc = buildLeadMagnetWorkbookPdf(source, { logoDataUrl });
  downloadBlobFile(filename ?? `${slug}.pdf`, leadMagnetPdfBlob(doc));
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
