import type { jsPDF } from "jspdf";
/** Cream-panel logo — plate color must match header fill so the mark reads transparent. */
import gyshLogoUrl from "../assets/gysh-logo-pdf.png";
import {
  ADMIN_EMAIL,
  FACEBOOK_HANDLE,
  FACEBOOK_URL,
  PRODUCTION_SITE_URL,
  ROOT_DOMAIN,
} from "./site-config";

/** US Letter (pt) */
export const PDF_PAGE_W = 612;
export const PDF_PAGE_H = 792;
export const PDF_MARGIN = 36;
export const PDF_CONTENT_W = PDF_PAGE_W - PDF_MARGIN * 2;

/** Exact cream of the PDF logo plate — header uses the same so edges disappear. */
export const PDF_LOGO_CREAM: [number, number, number] = [247, 243, 237];
const LOGO_CREAM_HEX = "#F7F3ED";

/** Logo slot height inside the header (extra pad keeps print from clipping). */
export const PDF_LOGO_H = 48;
export const PDF_COVER_LOGO_H = 64;

/**
 * Header band: logo + centered title + contact row, then wine rule.
 * Extra top pad so browser/PDF print margins don’t clip the logo.
 */
const HEADER_PAD_TOP = 14;
const HEADER_PAD_BOTTOM = 12;
export const PDF_HEADER_BAND = HEADER_PAD_TOP + PDF_LOGO_H + HEADER_PAD_BOTTOM; // 74

/** Tall footer band — keeps page numbers off the page edge. */
export const PDF_FOOTER_BAND = 36;
export const PDF_FOOTER_BASELINE = PDF_PAGE_H - 16;
/** Breathing room under the header separator before any body content. */
export const PDF_CONTENT_TOP = PDF_HEADER_BAND + 28;
export const PDF_CONTENT_BOTTOM = PDF_PAGE_H - PDF_FOOTER_BAND - 10;

export const PDF_EMAIL_DISPLAY = "Info@GetYourSideHustle.com";
export const PDF_EMAIL_MAILTO = `mailto:${ADMIN_EMAIL}`;

export function formatPdfUpdatedAt(d: Date = new Date()): string {
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const PDF_SITE_TAGLINE =
  'Four "Get Your Side Hustle" Match Wizards. One Family Adventure.';

export const PDF_BRAND_COLORS = {
  charcoal: [45, 42, 38] as [number, number, number],
  ink: [24, 23, 24] as [number, number, number],
  wine: [155, 47, 40] as [number, number, number],
  bronze: [148, 125, 100] as [number, number, number],
  muted: [92, 74, 56] as [number, number, number],
  line: [210, 200, 188] as [number, number, number],
  soft: [248, 245, 240] as [number, number, number],
  cream: PDF_LOGO_CREAM,
  white: [255, 255, 255] as [number, number, number],
  link: [46, 90, 140] as [number, number, number],
  facebook: [24, 119, 242] as [number, number, number],
};

/** Known in-app paths → absolute URLs for PDF hyperlinks. */
export const PDF_PATH_LINKS: { label: string; url: string }[] = [
  { label: "Testing Portal", url: `${PRODUCTION_SITE_URL}/admin?tab=testing` },
  { label: "Implementation Board", url: `${PRODUCTION_SITE_URL}/admin?tab=schedule` },
  { label: "Sprint Board", url: `${PRODUCTION_SITE_URL}/admin?tab=schedule` },
  { label: "Content Factory", url: `${PRODUCTION_SITE_URL}/admin?tab=factory` },
  { label: "Admin Studio", url: `${PRODUCTION_SITE_URL}/admin` },
  { label: "User Guides", url: `${PRODUCTION_SITE_URL}/admin?tab=user-guides` },
  { label: "getyoursidehustle.com", url: PRODUCTION_SITE_URL },
];

type TextSeg = { text: string; url?: string };

export function segmentPdfLinkedText(text: string): TextSeg[] {
  const patterns: { re: RegExp; url: (m: string) => string }[] = [
    {
      re: /https?:\/\/[^\s<>"']+/gi,
      url: (m) => m.replace(/[.,;:!?)]+$/g, ""),
    },
    {
      re: /\bgetyoursidehustle\.com(?:\/[^\s<>"']*)?/gi,
      url: (m) => {
        const clean = m.replace(/[.,;:!?)]+$/g, "");
        return clean.startsWith("http") ? clean : `https://${clean}`;
      },
    },
    ...PDF_PATH_LINKS.filter((p) => p.label !== "getyoursidehustle.com").map((p) => ({
      re: new RegExp(`\\b${p.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g"),
      url: () => p.url,
    })),
  ];

  type Hit = { start: number; end: number; url: string };
  const hits: Hit[] = [];
  for (const p of patterns) {
    p.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = p.re.exec(text)) !== null) {
      const raw = m[0];
      const url = p.url(raw);
      const end = m.index + raw.length;
      const overlaps = hits.some((h) => m!.index < h.end && end > h.start);
      if (!overlaps) hits.push({ start: m.index, end, url });
    }
  }
  hits.sort((a, b) => a.start - b.start);
  if (hits.length === 0) return [{ text }];

  const segs: TextSeg[] = [];
  let cursor = 0;
  for (const h of hits) {
    if (h.start > cursor) segs.push({ text: text.slice(cursor, h.start) });
    segs.push({ text: text.slice(h.start, h.end), url: h.url });
    cursor = h.end;
  }
  if (cursor < text.length) segs.push({ text: text.slice(cursor) });
  return segs;
}

export function drawPdfTextLink(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  url: string,
  opts?: { color?: [number, number, number] },
): number {
  const color = opts?.color ?? PDF_BRAND_COLORS.link;
  doc.setTextColor(...color);
  doc.textWithLink(text, x, y, { url });
  return doc.getTextWidth(text);
}

function chunkTokenToWidth(doc: jsPDF, token: string, maxW: number): string[] {
  if (doc.getTextWidth(token) <= maxW) return [token];
  const chunks: string[] = [];
  let buf = "";
  for (const ch of token) {
    const next = buf + ch;
    if (buf && doc.getTextWidth(next) > maxW) {
      chunks.push(buf);
      buf = ch;
    } else {
      buf = next;
    }
  }
  if (buf) chunks.push(buf);
  return chunks.length ? chunks : [token];
}

export function drawPdfLinkedWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  opts?: {
    lineHeight?: number;
    color?: [number, number, number];
    linkColor?: [number, number, number];
  },
): number {
  const lineH = opts?.lineHeight ?? 12;
  const color = opts?.color ?? PDF_BRAND_COLORS.charcoal;
  const linkColor = opts?.linkColor ?? PDF_BRAND_COLORS.link;
  const segs = segmentPdfLinkedText(text);
  let cx = x;
  let cy = y;
  const usable = Math.max(24, maxW);

  for (const seg of segs) {
    const parts = seg.text.split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        const sw = doc.getTextWidth(part);
        if (cx + sw > x + usable && cx > x) {
          cx = x;
          cy += lineH;
        } else {
          cx += sw;
        }
        continue;
      }
      for (const piece of chunkTokenToWidth(doc, part, usable)) {
        const w = doc.getTextWidth(piece);
        if (cx > x && cx + w > x + usable) {
          cx = x;
          cy += lineH;
        }
        if (seg.url) {
          doc.setTextColor(...linkColor);
          doc.textWithLink(piece, cx, cy, { url: seg.url });
        } else {
          doc.setTextColor(...color);
          doc.text(piece, cx, cy);
        }
        cx += w;
      }
    }
  }
  return cy;
}

let logoDataUrlCache: string | undefined;

async function trimLogoToDataUrl(srcUrl: string): Promise<string | undefined> {
  try {
    const res = await fetch(srcUrl);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    const w = bmp.width;
    const h = bmp.height;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close();
      return undefined;
    }
    ctx.drawImage(bmp, 0, 0);
    bmp.close();

    const { data } = ctx.getImageData(0, 0, w, h);
    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const a = data[i + 3]!;
        if (a < 8) continue;
        const r = data[i]!;
        const g = data[i + 1]!;
        const b = data[i + 2]!;
        if (r < 18 && g < 18 && b < 18) continue;
        const chroma = Math.max(r, g, b) - Math.min(r, g, b);
        if (r > 220 && g > 210 && b > 190 && chroma < 40) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX <= minX || maxY <= minY) {
      return canvas.toDataURL("image/png");
    }

    const pad = 4;
    const sx = Math.max(0, minX - pad);
    const sy = Math.max(0, minY - pad);
    const sw = Math.min(w - sx, maxX - minX + 1 + pad * 2);
    const sh = Math.min(h - sy, maxY - minY + 1 + pad * 2);
    const scale = sw < 400 ? 2 : 1;
    const out = document.createElement("canvas");
    out.width = Math.round(sw * scale);
    out.height = Math.round(sh * scale);
    const octx = out.getContext("2d");
    if (!octx) return canvas.toDataURL("image/png");
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = "high";
    octx.fillStyle = LOGO_CREAM_HEX;
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(canvas, sx, sy, sw, sh, 0, 0, out.width, out.height);
    return out.toDataURL("image/png");
  } catch {
    return undefined;
  }
}

export async function loadPdfLogoDataUrl(): Promise<string | undefined> {
  if (logoDataUrlCache) return logoDataUrlCache;
  const trimmed = await trimLogoToDataUrl(gyshLogoUrl);
  if (trimmed) {
    logoDataUrlCache = trimmed;
    return trimmed;
  }
  try {
    const res = await fetch(gyshLogoUrl);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    logoDataUrlCache = dataUrl;
    return dataUrl;
  } catch {
    return undefined;
  }
}

function fillHeaderCream(doc: jsPDF, bandH: number) {
  doc.setFillColor(...PDF_LOGO_CREAM);
  doc.rect(0, 0, PDF_PAGE_W, bandH, "F");
}

function drawHeaderRule(doc: jsPDF) {
  doc.setFillColor(...PDF_BRAND_COLORS.wine);
  doc.rect(0, PDF_HEADER_BAND - 2, PDF_PAGE_W, 2, "F");
}

function drawFooterChrome(doc: jsPDF) {
  doc.setFillColor(...PDF_BRAND_COLORS.wine);
  doc.rect(0, PDF_PAGE_H - 2, PDF_PAGE_W, 2, "F");
  doc.setDrawColor(...PDF_BRAND_COLORS.line);
  doc.setLineWidth(0.5);
  doc.line(PDF_MARGIN, PDF_PAGE_H - PDF_FOOTER_BAND, PDF_PAGE_W - PDF_MARGIN, PDF_PAGE_H - PDF_FOOTER_BAND);
}

export function drawPdfPageChrome(doc: jsPDF) {
  fillHeaderCream(doc, PDF_HEADER_BAND);
  drawHeaderRule(doc);
  drawFooterChrome(doc);
}

/** Fit logo inside a max box (contain) so nothing is cropped by the header rule. */
function logoSize(
  doc: jsPDF,
  logoDataUrl: string,
  maxW: number,
  maxH: number,
): { w: number; h: number } {
  const props = doc.getImageProperties(logoDataUrl);
  const ratio = props.width / Math.max(1, props.height);
  let h = maxH;
  let w = h * ratio;
  if (w > maxW) {
    w = maxW;
    h = w / ratio;
  }
  return { w, h };
}

export function drawPdfHeaderLogo(
  doc: jsPDF,
  logoDataUrl?: string,
  opts?: { height?: number; y?: number; x?: number },
): { w: number; h: number } {
  if (!logoDataUrl) return { w: 0, h: 0 };
  try {
    const maxH = opts?.height ?? PDF_LOGO_H;
    const maxW = PDF_CONTENT_W * 0.4;
    const { w, h } = logoSize(doc, logoDataUrl, maxW, maxH);
    const x = opts?.x ?? PDF_MARGIN;
    // Vertically center in the logo slot so top/bottom aren’t clipped.
    const slotTop = opts?.y ?? HEADER_PAD_TOP;
    const y = slotTop + Math.max(0, (maxH - h) / 2);
    doc.addImage(logoDataUrl, "PNG", x, y, w, h);
    return { w, h };
  } catch {
    return { w: 0, h: 0 };
  }
}

export function drawPdfCoverLogo(doc: jsPDF, logoDataUrl?: string): number {
  if (!logoDataUrl) return PDF_CONTENT_TOP;
  try {
    const { w, h } = logoSize(doc, logoDataUrl, PDF_CONTENT_W * 0.5, PDF_COVER_LOGO_H);
    doc.addImage(logoDataUrl, "PNG", PDF_MARGIN, PDF_CONTENT_TOP, w, h);
    return PDF_CONTENT_TOP + h + 12;
  } catch {
    return PDF_CONTENT_TOP;
  }
}

/** Labeled contact chip: "Website: value" with value linked. Returns width. */
function drawLabeledLink(
  doc: jsPDF,
  label: string,
  value: string,
  url: string,
  x: number,
  y: number,
  valueColor: [number, number, number],
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF_BRAND_COLORS.muted);
  const labelText = `${label}: `;
  doc.text(labelText, x, y);
  const labelW = doc.getTextWidth(labelText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const valueW = drawPdfTextLink(doc, value, x + labelW, y, url, { color: valueColor });
  return labelW + valueW;
}

/**
 * Clean header:
 * [ big logo ]     Guide title (centered, content-title size)
 *                  Website: …   Facebook: …   Email: …
 * ──────── wine rule ────────
 */
export function drawPdfBrandedHeader(
  doc: jsPDF,
  guideTitle: string,
  logoDataUrl?: string,
) {
  fillHeaderCream(doc, PDF_HEADER_BAND);

  const logoY = HEADER_PAD_TOP;
  const { w: logoW, h: logoH } = drawPdfHeaderLogo(doc, logoDataUrl, {
    height: PDF_LOGO_H,
    y: logoY,
  });

  // Title + contacts sit in the remaining width, centered (like the cover H1).
  const colLeft = PDF_MARGIN + (logoW > 0 ? logoW + 10 : 0);
  const colRight = PDF_PAGE_W - PDF_MARGIN;
  const colW = Math.max(120, colRight - colLeft);
  const colCenter = colLeft + colW / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...PDF_BRAND_COLORS.wine);
  const titleLines = (doc.splitTextToSize(guideTitle, colW) as string[]).slice(0, 2);
  const titleBlockH = titleLines.length * 17;
  const contactH = 11;
  const stackH = titleBlockH + 6 + contactH;
  const stackTop = logoY + Math.max(0, (logoH - stackH) / 2);
  const titleY = stackTop + 12;
  doc.text(titleLines, colCenter, titleY, { align: "center" });

  // Measure contact row, then center it under the title
  const contactY = titleY + titleBlockH + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  const parts = [
    { label: "Website", value: ROOT_DOMAIN, url: PRODUCTION_SITE_URL, color: PDF_BRAND_COLORS.link },
    { label: "Facebook", value: FACEBOOK_HANDLE, url: FACEBOOK_URL, color: PDF_BRAND_COLORS.facebook },
    { label: "Email", value: PDF_EMAIL_DISPLAY, url: PDF_EMAIL_MAILTO, color: PDF_BRAND_COLORS.wine },
  ] as const;
  const gap = 16;
  let rowW = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]!;
    rowW += doc.getTextWidth(`${p.label}: `) + doc.getTextWidth(p.value);
    if (i < parts.length - 1) rowW += gap;
  }
  let cx = colCenter - rowW / 2;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]!;
    cx += drawLabeledLink(doc, p.label, p.value, p.url, cx, contactY, p.color);
    if (i < parts.length - 1) cx += gap;
  }

  drawHeaderRule(doc);
}

/** Diagonal DRAFT mark on every PDF page (marketing + member + admin manuals). */
function drawPdfDraftWatermark(doc: jsPDF) {
  const cx = PDF_PAGE_W / 2;
  const cy = PDF_PAGE_H / 2;
  doc.saveGraphicsState?.();
  try {
    // jsPDF GState opacity when available; otherwise a light solid color.
    const GState = (doc as unknown as { GState?: new (o: { opacity: number }) => object }).GState;
    if (GState && doc.setGState) {
      doc.setGState(new GState({ opacity: 0.12 }));
      doc.setTextColor(...PDF_BRAND_COLORS.wine);
    } else {
      doc.setTextColor(220, 190, 188);
    }
  } catch {
    doc.setTextColor(220, 190, 188);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(72);
  doc.text("DRAFT", cx, cy, { align: "center", angle: 32 });
  try {
    doc.restoreGraphicsState?.();
  } catch {
    /* ignore */
  }
  doc.setTextColor(...PDF_BRAND_COLORS.charcoal);
}

export function applyPdfPageBranding(
  doc: jsPDF,
  label: string,
  logoDataUrl?: string,
  updatedAt: Date = new Date(),
) {
  const pages = doc.getNumberOfPages();
  const updatedLabel = `Last updated: ${formatPdfUpdatedAt(updatedAt)}`;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    drawPdfDraftWatermark(doc);
    drawPdfBrandedHeader(doc, label, logoDataUrl);
    drawFooterChrome(doc);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    // Left: website · Last updated …   Right: Page n of m
    let fx = PDF_MARGIN;
    fx +=
      drawLabeledLink(
        doc,
        "Website",
        ROOT_DOMAIN,
        PRODUCTION_SITE_URL,
        fx,
        PDF_FOOTER_BASELINE,
        PDF_BRAND_COLORS.link,
      ) + 10;
    doc.setTextColor(...PDF_BRAND_COLORS.muted);
    doc.text(`·  ${updatedLabel}`, fx, PDF_FOOTER_BASELINE);
    doc.text(`Page ${i} of ${pages}`, PDF_PAGE_W - PDF_MARGIN, PDF_FOOTER_BASELINE, {
      align: "right",
    });
  }
}
