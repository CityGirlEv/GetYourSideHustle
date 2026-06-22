import { jsPDF } from "jspdf";
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
import { SITE_BRAND_NAME, SITE_TAGLINE } from "@/lib/site-brand";
import { canonicalUrl } from "@/lib/site-url";

const BRAND_BLUE: [number, number, number] = [29, 78, 216];
const INK: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [75, 85, 99];
const PANEL: [number, number, number] = [239, 246, 255];

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

function ensureSpace(
  doc: jsPDF,
  y: number,
  needed: number,
  margin: number,
  pageW: number,
  pageH: number,
): number {
  if (y + needed <= pageH - 36) return y;
  doc.addPage();
  return 72;
}

export interface ArticlePdfAssets {
  logoDataUrl?: string | null;
  featuredDataUrl?: string | null;
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

  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, pageW, 64, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(SITE_BRAND_NAME, margin, 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Learning Center · Executive Guide", margin, 46);

  if (assets.logoDataUrl) {
    try {
      doc.addImage(
        assets.logoDataUrl,
        detectImageFormat(assets.logoDataUrl),
        pageW - margin - 140,
        12,
        140,
        40,
      );
    } catch {
      /* optional logo */
    }
  }

  let y = 88;

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
      y = ensureSpace(doc, y, 40, margin, pageW, pageH);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...BRAND_BLUE);
      doc.text(block.text, margin, y);
      y += 22;
      continue;
    }
    if (block.type === "h3") {
      y = ensureSpace(doc, y, 32, margin, pageW, pageH);
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
        y = ensureSpace(doc, y, lines.length * 14 + 6, margin, pageW, pageH);
        doc.text(lines, margin + 8, y);
        y += lines.length * 14 + 4;
      }
      y += 6;
      continue;
    }
    const lines = doc.splitTextToSize(block.text, contentW);
    y = ensureSpace(doc, y, lines.length * 14 + 8, margin, pageW, pageH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 10;
  }

  if (faq.length) {
    y = ensureSpace(doc, y, 40, margin, pageW, pageH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND_BLUE);
    doc.text("Frequently asked questions", margin, y);
    y += 22;
    for (const item of faq) {
      y = ensureSpace(doc, y, 36, margin, pageW, pageH);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(item.question, margin, y);
      y += 16;
      for (const answerBlock of markdownToPdfBlocks(item.answer)) {
        if (answerBlock.type !== "p") continue;
        const lines = doc.splitTextToSize(answerBlock.text, contentW);
        y = ensureSpace(doc, y, lines.length * 14 + 6, margin, pageW, pageH);
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
  y = 72;
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
    y = ensureSpace(doc, y, lines.length * 11 + 10, margin, pageW, pageH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(lines, margin, y);
    y += lines.length * 11 + 10;
  }

  y = ensureSpace(doc, y, 40, margin, pageW, pageH);
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

/** White logo for dark/colored PDF headers (blue wordmark → invisible on blue band). */
export async function invertLogoForDarkBackground(dataUrl: string): Promise<string> {
  if (typeof document === "undefined") return dataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.filter = "brightness(0) invert(1)";
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function resolveAssetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return canonicalUrl(path.startsWith("/") ? path : `/${path}`);
}

export async function downloadArticleGuide(article: ArticleDownloadSource): Promise<void> {
  const [rawLogo, featuredDataUrl] = await Promise.all([
    loadImageAsDataUrl(canonicalUrl("/email-logo.png")),
    article.featuredImage
      ? loadImageAsDataUrl(resolveAssetUrl(article.featuredImage))
      : Promise.resolve(null),
  ]);
  const logoDataUrl = rawLogo ? await invertLogoForDarkBackground(rawLogo) : null;

  const doc = buildArticleDownloadPdf(article, { logoDataUrl, featuredDataUrl });
  downloadBlobFile(`${article.slug}.pdf`, doc.output("blob"));
}
