import { jsPDF } from "jspdf";
import headerLogoBundled from "@/assets/part-b-optimizer-logo.png?inline";
import footerMiniLogoBundled from "@/assets/footer-mini-logo.png?inline";
import { downloadBlobFile } from "@/lib/article-authoring";
import type { ArticleDownloadSource } from "@/lib/article-download";
import {
  LEARNING_ARTICLE_DISCLAIMER,
  categoryLabel,
  formatArticleDate,
  getArticleLastUpdated,
  splitArticleBody,
} from "@/lib/learning-center";
import { MEDICARE_DISCLAIMER_SECTIONS, formatSiteCopyright } from "@/lib/medicare-disclaimers";
import { stampPdfPageFooters } from "@/lib/pdf-page-footer";
import { SITE_TAGLINE } from "@/lib/site-brand";
import { PUBLIC_WEBSITE_HOST } from "@/lib/site-url";
import { canonicalUrl } from "@/lib/site-url";

const BRAND_BLUE: [number, number, number] = [29, 78, 216];
const INK: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [75, 85, 99];
const PANEL: [number, number, number] = [239, 246, 255];
/** Light header band — full-color wordmark reads clearly (same as workbook PDF). */
const HEADER_BG: [number, number, number] = PANEL;
const HEADER_BORDER: [number, number, number] = [191, 219, 254];
const PAGE_TOP_MARGIN = 12;
const HEADER_HEIGHT = 78;
const HEADER_CONTENT_GAP = 18;
const ARTICLE_CONTENT_START_Y = PAGE_TOP_MARGIN + HEADER_HEIGHT + HEADER_CONTENT_GAP;
const ARTICLE_PDF_LOGO_PATH = "/email-header-logo.png";
const PDF_FOOTER_MINI_LOGO_PATH = "/email-footer-logo.png";

type PdfBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1 ($2)")
    .trim();
}

export function markdownToPdfBlocks(bodyMd: string): PdfBlock[] {
  const lines = bodyMd.replace(/\r\n/g, "\n").split("\n");
  const blocks: PdfBlock[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (!listType || !listItems.length) {
      listType = null;
      listItems = [];
      return;
    }
    blocks.push({ type: listType, items: [...listItems] });
    listType = null;
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      blocks.push({ type: "h2", text: stripInlineMarkdown(line.slice(3)) });
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      blocks.push({ type: "h3", text: stripInlineMarkdown(line.slice(4)) });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(stripInlineMarkdown(line.replace(/^[-*]\s+/, "")));
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(stripInlineMarkdown(line.replace(/^\d+\.\s+/, "")));
      continue;
    }
    flushList();
    blocks.push({ type: "p", text: stripInlineMarkdown(line) });
  }
  flushList();
  return blocks;
}

function detectImageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

/** Light page header with brand logo on every article PDF page. */
export function drawArticlePageHeader(
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
  doc.text("Learning Center · Educational Guide", pageW - margin, headerTop + 44, {
    align: "right",
  });

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

function ensureSpace(
  doc: jsPDF,
  y: number,
  needed: number,
  margin: number,
  pageW: number,
  pageH: number,
  logoDataUrl?: string | null,
): number {
  if (y + needed <= pageH - 36) return y;
  doc.addPage();
  drawArticlePageHeader(doc, pageW, margin, logoDataUrl);
  return ARTICLE_CONTENT_START_Y;
}

export interface ArticlePdfAssets {
  logoDataUrl?: string | null;
  featuredDataUrl?: string | null;
  miniLogoDataUrl?: string | null;
}

/** Executive-style Learning Center guide PDF. */
export function buildArticleDownloadPdf(
  article: ArticleDownloadSource,
  assets: ArticlePdfAssets = {},
): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  const { mainBody, faq } = splitArticleBody(article.bodyMd);
  const blocks = markdownToPdfBlocks(mainBody);
  const publishedLabel = formatArticleDate(article.publishedAt);
  const updatedRaw = getArticleLastUpdated(article as any);
  const updatedLabel = formatArticleDate(updatedRaw ?? null);
  const showUpdated = updatedRaw && updatedRaw !== article.publishedAt;
  const articleUrl = canonicalUrl(`/learning-center/${article.slug}`);

  drawArticlePageHeader(doc, pageW, margin, assets.logoDataUrl);

  const logoDataUrl = assets.logoDataUrl ?? null;
  const nextPage = (currentY: number, needed: number) =>
    ensureSpace(doc, currentY, needed, margin, pageW, pageH, logoDataUrl);

  let y = ARTICLE_CONTENT_START_Y;

  doc.setFillColor(...PANEL);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, contentW, 132, 8, 8, "FD");

  const imageW = 132;
  const imageH = 88;
  const textX = assets.featuredDataUrl ? margin + 20 + imageW + 16 : margin + 20;
  const textW = assets.featuredDataUrl ? contentW - imageW - 56 : contentW - 40;

  if (assets.featuredDataUrl) {
    try {
      doc.addImage(
        assets.featuredDataUrl,
        detectImageFormat(assets.featuredDataUrl),
        margin + 20,
        y + 22,
        imageW,
        imageH,
      );
    } catch {
      /* optional featured image */
    }
  }

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(article.title, textW);
  doc.text(titleLines, textX, y + 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const metaParts = [
    categoryLabel(article.category),
    publishedLabel ? `Published ${publishedLabel}` : null,
    showUpdated && updatedLabel ? `Updated ${updatedLabel}` : null,
  ].filter(Boolean);
  doc.text(metaParts.join(" · "), textX, y + 34 + titleLines.length * 20 + 4);

  doc.setTextColor(...INK);
  doc.setFontSize(10);
  const excerptLines = doc.splitTextToSize(article.excerpt, textW);
  doc.text(excerptLines.slice(0, 3), textX, y + 34 + titleLines.length * 20 + 22);

  y += 152;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageW - margin, y);
  y += 22;

  for (const block of blocks) {
    if (block.type === "h2") {
      y = nextPage(y, 40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...BRAND_BLUE);
      doc.text(block.text, margin, y);
      y += 22;
      continue;
    }
    if (block.type === "h3") {
      y = nextPage(y, 32);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...INK);
      doc.text(block.text, margin, y);
      y += 18;
      continue;
    }
    if (block.type === "ul" || block.type === "ol") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      for (const [index, item] of block.items.entries()) {
        const prefix = block.type === "ol" ? `${index + 1}. ` : "• ";
        const lines = doc.splitTextToSize(prefix + item, contentW - 12);
        y = nextPage(y, lines.length * 14 + 6);
        doc.text(lines, margin + 8, y);
        y += lines.length * 14 + 4;
      }
      y += 6;
      continue;
    }
    const lines = doc.splitTextToSize(block.text, contentW);
    y = nextPage(y, lines.length * 14 + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 10;
  }

  if (faq.length) {
    y = nextPage(y, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND_BLUE);
    doc.text("Frequently asked questions", margin, y);
    y += 22;
    for (const item of faq) {
      y = nextPage(y, 36);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(item.question, margin, y);
      y += 16;
      for (const answerBlock of markdownToPdfBlocks(item.answer)) {
        if (answerBlock.type !== "p") continue;
        const lines = doc.splitTextToSize(answerBlock.text, contentW);
        y = nextPage(y, lines.length * 14 + 6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...MUTED);
        doc.text(lines, margin, y);
        y += lines.length * 14 + 8;
      }
      y += 6;
    }
  }

  doc.addPage();
  drawArticlePageHeader(doc, pageW, margin, logoDataUrl);
  y = ARTICLE_CONTENT_START_Y;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Educational disclaimer", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const eduLines = doc.splitTextToSize(LEARNING_ARTICLE_DISCLAIMER, contentW);
  doc.text(eduLines, margin, y);
  y += eduLines.length * 12 + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Important notices", margin, y);
  y += 16;

  for (const section of MEDICARE_DISCLAIMER_SECTIONS) {
    const lines = doc.splitTextToSize(`${section.label}: ${section.body}`, contentW);
    y = nextPage(y, lines.length * 11 + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(lines, margin, y);
    y += lines.length * 11 + 10;
  }

  y = nextPage(y, 40);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Online version: ${articleUrl}`, margin, y);
  y += 14;
  doc.text(SITE_TAGLINE, margin, y);

  stampPdfPageFooters(doc, {
    margin,
    pageH,
    textColor: MUTED,
    copyright: formatSiteCopyright(),
    website: PUBLIC_WEBSITE_HOST,
    miniLogoDataUrl: assets.miniLogoDataUrl,
    miniLogoSize: 14,
  });
  return doc;
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
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

export async function loadArticlePdfLogo(): Promise<string | null> {
  if (headerLogoBundled?.startsWith("data:")) return headerLogoBundled;
  const headerLogo = await loadImageAsDataUrl(canonicalUrl(ARTICLE_PDF_LOGO_PATH));
  if (headerLogo) return headerLogo;
  return loadImageAsDataUrl(canonicalUrl("/email-logo.png"));
}

export async function loadPdfFooterMiniLogo(): Promise<string | null> {
  if (footerMiniLogoBundled?.startsWith("data:")) return footerMiniLogoBundled;
  const footerLogo = await loadImageAsDataUrl(canonicalUrl(PDF_FOOTER_MINI_LOGO_PATH));
  if (footerLogo) return footerLogo;
  return loadImageAsDataUrl(canonicalUrl("/favicon.png"));
}

function resolveAssetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return canonicalUrl(path.startsWith("/") ? path : `/${path}`);
}

export async function downloadArticleGuide(article: ArticleDownloadSource): Promise<void> {
  const [logoDataUrl, miniLogoDataUrl, featuredDataUrl] = await Promise.all([
    loadArticlePdfLogo(),
    loadPdfFooterMiniLogo(),
    article.featuredImage
      ? loadImageAsDataUrl(resolveAssetUrl(article.featuredImage))
      : Promise.resolve(null),
  ]);

  const doc = buildArticleDownloadPdf(article, { logoDataUrl, miniLogoDataUrl, featuredDataUrl });
  downloadBlobFile(`${article.slug}.pdf`, doc.output("blob"));
}
