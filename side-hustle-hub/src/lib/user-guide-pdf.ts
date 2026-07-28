import { jsPDF } from "jspdf";
import { openPdfInBrowser } from "./open-pdf";
import {
  ADMIN_GUIDE_META,
  ADMIN_SECTIONS,
  ADMIN_TOC,
  MEMBER_BIG_PICTURE,
  MEMBER_GUIDE_META,
  MEMBER_MEMBERSHIP,
  MEMBER_QUICK_START,
  MEMBER_TOC,
  memberChapters,
  type GuideCheckItem,
  type GuideTocEntry,
} from "./user-guide-content";
import {
  getMarketingGuide,
  marketingGuideToc,
  type MarketingGuideId,
  type MarketingPerkTier,
  type MarketingSection,
} from "./marketing-guides";
import {
  PDF_PAGE_W as PAGE_W,
  PDF_MARGIN as MARGIN,
  PDF_CONTENT_W as CONTENT_W,
  PDF_CONTENT_TOP,
  PDF_CONTENT_BOTTOM,
  PDF_BRAND_COLORS,
  loadPdfLogoDataUrl,
  drawPdfPageChrome,
  applyPdfPageBranding,
  drawPdfLinkedWrappedText,
} from "./pdf-branding";

const COLORS = {
  ...PDF_BRAND_COLORS,
  check: [95, 122, 69] as [number, number, number],
  link: [46, 90, 140] as [number, number, number],
};

type PdfCtx = {
  doc: jsPDF;
  y: number;
  /** section id → page + top offset for TOC links */
  destinations?: Map<string, { page: number; top: number }>;
};

type TocHotspot = {
  id: string;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

function currentPageNumber(doc: jsPDF): number {
  const info = doc.getCurrentPageInfo?.();
  if (info && typeof info.pageNumber === "number") return info.pageNumber;
  return doc.getNumberOfPages();
}

function markDestination(ctx: PdfCtx, id: string) {
  if (!ctx.destinations || !id) return;
  if (ctx.destinations.has(id)) return;
  ctx.destinations.set(id, { page: currentPageNumber(ctx.doc), top: ctx.y });
}

function resolveTocDestination(
  id: string,
  destinations: Map<string, { page: number; top: number }>,
  toc: GuideTocEntry[],
): { page: number; top: number } | undefined {
  const direct = destinations.get(id);
  if (direct) return direct;
  const idx = toc.findIndex((e) => e.id === id);
  if (idx < 0) return undefined;
  for (let i = idx + 1; i < toc.length; i++) {
    if (toc[i].level === 1) break;
    const child = destinations.get(toc[i].id);
    if (child) return child;
  }
  return undefined;
}

/** Wire TOC row hotspots to section destinations (internal page links). */
function applyTocLinks(
  doc: jsPDF,
  hotspots: TocHotspot[],
  destinations: Map<string, { page: number; top: number }>,
  toc: GuideTocEntry[],
) {
  for (const spot of hotspots) {
    const dest = resolveTocDestination(spot.id, destinations, toc);
    if (!dest) continue;
    doc.setPage(spot.page);
    doc.link(spot.x, spot.y, spot.w, spot.h, {
      pageNumber: dest.page,
      top: Math.max(0, dest.top - 12),
      magFactor: "XYZ",
    });
  }
}

/**
 * First safe text baseline after a page break. Content often draws above the
 * baseline (checkboxes ≈ y−8, note plates ≈ y−10) — never land on PDF_CONTENT_TOP
 * raw or those glyphs collide with the header rule.
 */
const CONTENT_FLOW_TOP = PDF_CONTENT_TOP + 12;

function ensureSpace(ctx: PdfCtx, need: number) {
  if (ctx.y + need > PDF_CONTENT_BOTTOM) {
    ctx.doc.addPage();
    drawPdfPageChrome(ctx.doc);
    ctx.y = CONTENT_FLOW_TOP;
  }
}

function beginContentPage(ctx: PdfCtx) {
  ctx.doc.addPage();
  drawPdfPageChrome(ctx.doc);
  ctx.y = CONTENT_FLOW_TOP;
}

/** Page-break rules per marketing manual. */
function marketingSectionStartsNewPage(guideId: MarketingGuideId, n: number): boolean {
  if (!Number.isFinite(n)) return false;
  if (guideId === "master") {
    // Overview §1–3 · Adults · Kids · Teens · Seniors · Close
    return n === 4 || n === 8 || n === 12 || n === 16 || n === 20;
  }
  if (guideId === "kids") {
    // §1–2 · §3–4 · §5 with §6–7 (no membership photo on §5)
    return n === 3 || n === 5;
  }
  // Adult (and similar): §1–3 · §4–5 · §6 with §7–8 continuing
  return n === 4 || n === 6;
}

function sizeContentImage(
  doc: jsPDF,
  dataUrl: string,
  maxW: number,
  maxH: number,
): { w: number; h: number } | null {
  try {
    const props = doc.getImageProperties(dataUrl);
    const ratio = props.width / Math.max(1, props.height);
    let imgW = maxW;
    let imgH = imgW / ratio;
    if (imgH > maxH) {
      imgH = maxH;
      imgW = imgH * ratio;
    }
    return { w: imgW, h: imgH };
  } catch {
    return null;
  }
}

/**
 * Single type scale for every manual PDF (marketing / member / admin).
 * Never hardcode pt sizes in draw helpers — use these tokens only.
 */
const FONT = {
  h1: 18, // cover title
  h2: 14, // section headings (1. Welcome…)
  h3: 11, // subheads (perk tier, chapter, CTA headline, TOC title)
  body: 10.5, // body copy, checklist, journey labels, TOC rows
  small: 9.5, // notes, meta, journey detail, taglines
  micro: 8, // circle badges, TOC hint
  lineH1: 22,
  lineH2: 17,
  lineH3: 14,
  lineBody: 13,
  lineSmall: 12,
} as const;

/** Large block image — never beside body text; generous padding so pages don’t feel packed. */
function drawContainedImage(
  ctx: PdfCtx,
  dataUrl: string,
  opts: { maxW?: number; maxH?: number; padBottom?: number; center?: boolean } = {},
): boolean {
  try {
    const maxW = opts.maxW ?? CONTENT_W;
    const maxH = opts.maxH ?? 200;
    const padBottom = opts.padBottom ?? 36;
    const sized = sizeContentImage(ctx.doc, dataUrl, maxW, maxH);
    if (!sized) return false;
    ensureSpace(ctx, sized.h + padBottom + 8);
    ctx.y += 4;
    const x = opts.center === false ? MARGIN : MARGIN + (CONTENT_W - sized.w) / 2;
    ctx.doc.setDrawColor(...COLORS.line);
    ctx.doc.setFillColor(...COLORS.soft);
    ctx.doc.roundedRect(x - 2, ctx.y - 2, sized.w + 4, sized.h + 4, 3, 3, "FD");
    ctx.doc.addImage(dataUrl, "PNG", x, ctx.y, sized.w, sized.h);
    ctx.y += sized.h + padBottom;
    return true;
  } catch {
    return false;
  }
}

/** Draw a paragraph with wrap + page breaks so text never runs off the page. */
function drawBodyParagraph(ctx: PdfCtx, text: string, fontSize = FONT.body) {
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(fontSize);
  const lineH = FONT.lineBody;
  const lines = ctx.doc.splitTextToSize(text, CONTENT_W) as string[];
  for (let i = 0; i < lines.length; i++) {
    ensureSpace(ctx, lineH + 2);
    const chunk = lines[i]!;
    drawPdfLinkedWrappedText(ctx.doc, chunk, MARGIN, ctx.y, CONTENT_W, {
      lineHeight: lineH,
      color: COLORS.charcoal,
      linkColor: COLORS.link,
    });
    ctx.y += lineH;
  }
  ctx.y += 8;
}

function coverEditionLabel(kind: "member" | "admin" | "marketing"): string {
  if (kind === "member") return "Checklist edition · Families & Side Hustlers";
  if (kind === "admin") return "Checklist edition · Admin partners";
  return "Guide edition · Showcase · Membership · Checklists";
}

/**
 * Cover body + contents on the same page (no blank “page 2”).
 * Title/lead first, then a large full-width hero image, then Contents.
 */
function drawCoverAndToc(
  doc: jsPDF,
  meta: { eyebrow: string; title: string; lead: string },
  kind: "member" | "admin" | "marketing",
  tocEntries: { id: string; label: string; number?: string; level?: number }[],
  coverImageDataUrl?: string,
  _updatedAt: Date = new Date(),
): TocHotspot[] {
  drawPdfPageChrome(doc);

  let y = PDF_CONTENT_TOP + 2;

  doc.setTextColor(...COLORS.charcoal);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT.h1);
  const titleLines = doc.splitTextToSize(meta.title, CONTENT_W) as string[];
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 20 + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT.body);
  doc.setTextColor(...COLORS.muted);
  const leadLines = doc.splitTextToSize(meta.lead, CONTENT_W) as string[];
  doc.text(leadLines, MARGIN, y);
  y += leadLines.length * FONT.lineBody + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(FONT.small);
  doc.setTextColor(...COLORS.bronze);
  const editionLines = doc.splitTextToSize(coverEditionLabel(kind), CONTENT_W) as string[];
  doc.text(editionLines, MARGIN, y);
  y += editionLines.length * 11 + 10;
  // "Last updated" is drawn in the page footer (applyPdfPageBranding).

  if (coverImageDataUrl) {
    // Large hero under the intro (not inline). Leave room for Contents below.
    const room = Math.max(180, PDF_CONTENT_BOTTOM - y - 140);
    const sized = sizeContentImage(doc, coverImageDataUrl, CONTENT_W, Math.min(300, room));
    if (sized) {
      const x = MARGIN + (CONTENT_W - sized.w) / 2;
      doc.setDrawColor(...COLORS.line);
      doc.setFillColor(...COLORS.soft);
      doc.roundedRect(x - 2, y - 2, sized.w + 4, sized.h + 4, 3, 3, "FD");
      doc.addImage(coverImageDataUrl, "PNG", x, y, sized.w, sized.h);
      // Clear gap before Contents — first page has room; don’t pack the TOC against the image.
      y += sized.h + 40;
    }
  } else {
    y += 12;
  }

  if (y > PDF_CONTENT_BOTTOM - 90) {
    doc.addPage();
    drawPdfPageChrome(doc);
    y = PDF_CONTENT_TOP;
  }

  return drawToc(doc, "Contents", tocEntries, { startY: y, newPage: false });
}

async function imageUrlToDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

function drawJourney(ctx: PdfCtx, steps: { label: string; detail: string }[]) {
  const textX = MARGIN + 32;
  const textW = CONTENT_W - 40;
  const labelLineH = FONT.lineBody;
  const detailLineH = FONT.lineSmall;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const heading = `${i + 1}. ${step.label}`;
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(FONT.body);
    const labelLines = ctx.doc.splitTextToSize(heading, textW) as string[];
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(FONT.small);
    const detailLines = ctx.doc.splitTextToSize(step.detail, textW) as string[];
    const blockH =
      6 + labelLines.length * labelLineH + detailLines.length * detailLineH + 6;
    ensureSpace(ctx, blockH + 8);
    if (ctx.y < CONTENT_FLOW_TOP) ctx.y = CONTENT_FLOW_TOP;

    const top = ctx.y;
    ctx.doc.setFillColor(...COLORS.soft);
    ctx.doc.roundedRect(MARGIN, top - 6, CONTENT_W, blockH, 3, 3, "F");

    ctx.doc.setFillColor(...COLORS.bronze);
    ctx.doc.circle(MARGIN + 12, top + 1, 5.5, "F");
    ctx.doc.setTextColor(...COLORS.white);
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(FONT.micro);
    ctx.doc.text(String(i + 1), MARGIN + 12, top + 3.5, { align: "center" });

    let ty = top + 1;
    ctx.doc.setTextColor(...COLORS.bronze);
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(FONT.body);
    for (const line of labelLines) {
      ctx.doc.text(line, textX, ty);
      ty += labelLineH;
    }
    ctx.doc.setTextColor(...COLORS.charcoal);
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(FONT.small);
    for (const line of detailLines) {
      drawPdfLinkedWrappedText(ctx.doc, line, textX, ty, textW, {
        lineHeight: detailLineH,
        color: COLORS.charcoal,
        linkColor: COLORS.link,
      });
      ty += detailLineH;
    }
    ctx.y = top - 6 + blockH + 6;

    if (i < steps.length - 1) {
      ctx.doc.setDrawColor(...COLORS.bronze);
      ctx.doc.setLineWidth(0.9);
      const ax = MARGIN + 12;
      ctx.doc.line(ax, ctx.y - 1, ax, ctx.y + 3);
      ctx.y += 6;
    }
  }
}

function drawMarketingSection(
  ctx: PdfCtx,
  section: MarketingSection,
  images: Partial<Record<"hero" | "membership" | "community" | "guides", string>>,
  opts?: { startOnNewPage?: boolean; padBefore?: number; skipImages?: boolean },
) {
  if (opts?.startOnNewPage) {
    beginContentPage(ctx);
  }
  if (opts?.padBefore && opts.padBefore > 0) {
    ctx.y += opts.padBefore;
  }
  drawSectionHeading(ctx, `${section.number}. ${section.title}`, section.id);
  if (section.intro) {
    drawNote(ctx, section.intro);
  }

  const imgKey =
    section.imageKey === "secondary" || section.imageKey === "hero"
      ? "hero"
      : section.imageKey === "membership" ||
          section.imageKey === "community" ||
          section.imageKey === "guides"
        ? section.imageKey
        : undefined;
  const dataUrl = !opts?.skipImages && imgKey ? images[imgKey] : undefined;
  // Guides art fills leftover page space after the list; other keys lead the section.
  const drawImageEarly = Boolean(
    dataUrl && imgKey !== "guides" && (section.kind === "prose" || section.kind === "perks" || section.kind === "cta"),
  );
  if (drawImageEarly && dataUrl) {
    drawContainedImage(ctx, dataUrl, { maxW: CONTENT_W, maxH: 180, padBottom: 28 });
  }

  for (const p of section.prose ?? []) {
    drawBodyParagraph(ctx, p);
  }

  if (section.callout) {
    drawNote(ctx, `${section.callout.title}: ${section.callout.body}`);
  }

  if (section.items) drawChecklist(ctx, section.items);
  if (section.journey) drawJourney(ctx, section.journey);

  if (dataUrl && imgKey === "guides") {
    drawContainedImage(ctx, dataUrl, { maxW: CONTENT_W, maxH: 200, padBottom: 36 });
  }

  if (section.perks) {
    drawPerkTiers(ctx, section.perks);
  }

  if (section.cta) {
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(FONT.h3);
    const hl = ctx.doc.splitTextToSize(section.cta.headline, CONTENT_W) as string[];
    ensureSpace(ctx, hl.length * FONT.lineH3 + 12);
    ctx.doc.setTextColor(...COLORS.charcoal);
    ctx.doc.text(hl, MARGIN, ctx.y);
    ctx.y += hl.length * FONT.lineH3 + 8;
    drawNote(ctx, section.cta.body);
    drawChecklist(
      ctx,
      section.cta.bullets.map((text, i) => ({ id: `cta-${i}`, text })),
    );
  }

  // Breathing room before the next section heading
  ctx.y += 16;
}

function drawToc(
  doc: jsPDF,
  title: string,
  entries: { id: string; label: string; number?: string; level?: number }[],
  opts?: { startY?: number; newPage?: boolean },
): TocHotspot[] {
  if (opts?.newPage !== false && opts?.startY === undefined) {
    doc.addPage();
    drawPdfPageChrome(doc);
  }
  let y = opts?.startY ?? PDF_CONTENT_TOP + 6;
  const hotspots: TocHotspot[] = [];

  doc.setTextColor(...COLORS.charcoal);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT.h2);
  doc.text(title, MARGIN, y);
  y += 6;
  doc.setDrawColor(...COLORS.bronze);
  doc.setLineWidth(1.2);
  doc.line(MARGIN, y, MARGIN + 64, y);
  y += 12;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(FONT.micro);
  doc.setTextColor(...COLORS.muted);
  doc.text("Click a title to jump to that section", MARGIN, y);
  y += 14;

  // Two columns — use each entry's own section number (never invent a second one)
  const colGap = 22;
  const colW = (CONTENT_W - colGap) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + colW + colGap;
  const mid = Math.ceil(entries.length / 2);
  let leftY = y;
  let rightY = y;
  const rowH = 20;

  entries.forEach((entry, i) => {
    const isLeft = i < mid;
    let cy = isLeft ? leftY : rightY;
    const cx = isLeft ? leftX : rightX;
    const num = (entry.number || String(i + 1)).trim();
    const indent = entry.level === 2 ? 8 : 0;
    const labelMax = colW - 36 - indent;
    const labelLines = doc.splitTextToSize(entry.label, labelMax) as string[];
    const blockH = Math.max(rowH, labelLines.length * FONT.lineBody + 4);

    if (cy + blockH > PDF_CONTENT_BOTTOM) {
      doc.addPage();
      drawPdfPageChrome(doc);
      leftY = CONTENT_FLOW_TOP;
      rightY = CONTENT_FLOW_TOP;
      cy = isLeft ? leftY : rightY;
    }

    const page = currentPageNumber(doc);
    // Clickable row (jsPDF link y is top of the box)
    const linkY = cy - 11;
    hotspots.push({
      id: entry.id,
      page,
      x: cx + indent,
      y: linkY,
      w: colW - indent - 4,
      h: blockH,
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONT.body);
    doc.setTextColor(...COLORS.bronze);
    doc.text(num, cx + indent, cy);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(FONT.body);
    doc.setTextColor(...COLORS.link);
    doc.text(labelLines, cx + indent + 28, cy);
    // Underline first line to signal it's a link
    const first = labelLines[0] ?? entry.label;
    const underlineW = Math.min(doc.getTextWidth(first), labelMax);
    doc.setDrawColor(...COLORS.link);
    doc.setLineWidth(0.5);
    doc.line(cx + indent + 28, cy + 2, cx + indent + 28 + underlineW, cy + 2);

    if (isLeft) leftY = cy + blockH;
    else rightY = cy + blockH;
  });

  return hotspots;
}

function drawSectionHeading(ctx: PdfCtx, title: string, destinationId?: string) {
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(FONT.h2);
  const lines = ctx.doc.splitTextToSize(title, CONTENT_W) as string[];
  // jsPDF text() Y is the baseline. Use the doc line-height factor so multi-line
  // titles and the wine rule stay aligned (no rule-through-text / text-through-rule).
  const lineFactor = ctx.doc.getLineHeightFactor?.() ?? 1.15;
  const lineH = FONT.h2 * lineFactor;
  const titleDescent = FONT.h2 * 0.28;
  const gapTitleToRule = 5;
  const gapRuleToContent = 8;
  const nextBaselinePad = FONT.body + 2; // clears checkboxes drawn at y−8
  const blockH =
    lines.length * lineH + titleDescent + gapTitleToRule + gapRuleToContent + nextBaselinePad + 10;
  ensureSpace(ctx, blockH);
  if (ctx.y < CONTENT_FLOW_TOP) ctx.y = CONTENT_FLOW_TOP;
  ctx.y += 6;
  if (destinationId) markDestination(ctx, destinationId);

  const firstBaseline = ctx.y;
  ctx.doc.setTextColor(...COLORS.charcoal);
  ctx.doc.text(lines, MARGIN, firstBaseline);
  const lastBaseline = firstBaseline + (lines.length - 1) * lineH;

  const ruleY = lastBaseline + titleDescent + gapTitleToRule;
  ctx.doc.setDrawColor(...COLORS.wine);
  ctx.doc.setLineWidth(1.15);
  ctx.doc.line(MARGIN, ruleY, PAGE_W - MARGIN, ruleY);
  ctx.y = ruleY + gapRuleToContent + nextBaselinePad;
}

function drawChecklist(
  ctx: PdfCtx,
  items: GuideCheckItem[],
  opts?: { compact?: boolean },
) {
  // Same body size everywhere; compact only tightens gaps for perk packing.
  const compact = opts?.compact === true;
  const fontSize = FONT.body;
  const lineH = FONT.lineBody;
  const itemGap = compact ? 3 : 5;
  const box = 9;
  const boxLift = 7;
  const textW = CONTENT_W - 26;
  const textX = MARGIN + 18;

  for (const item of items) {
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(fontSize);
    const lines = ctx.doc.splitTextToSize(item.text, textW) as string[];
    for (let li = 0; li < lines.length; li++) {
      ensureSpace(ctx, lineH + 3 + boxLift);
      if (ctx.y < CONTENT_FLOW_TOP) ctx.y = CONTENT_FLOW_TOP;
      if (li === 0) {
        ctx.doc.setDrawColor(...COLORS.bronze);
        ctx.doc.setLineWidth(0.9);
        ctx.doc.roundedRect(MARGIN, ctx.y - boxLift, box, box, 2, 2, "S");
      }
      ctx.doc.setFont("helvetica", "normal");
      ctx.doc.setFontSize(fontSize);
      drawPdfLinkedWrappedText(ctx.doc, lines[li]!, textX, ctx.y, textW, {
        lineHeight: lineH,
        color: COLORS.charcoal,
        linkColor: COLORS.link,
      });
      ctx.y += lineH;
    }
    ctx.y += itemGap;
  }
}

/** Membership perk tiers — same h3 + body scale as the rest of the manual. */
function drawPerkTiers(ctx: PdfCtx, perks: MarketingPerkTier[]) {
  for (const tier of perks) {
    ensureSpace(ctx, 32);
    if (ctx.y < CONTENT_FLOW_TOP) ctx.y = CONTENT_FLOW_TOP;
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(FONT.h3);
    ctx.doc.setTextColor(...COLORS.bronze);
    ctx.doc.text(`${tier.name}  ·  ${tier.priceLine}`, MARGIN, ctx.y);
    ctx.y += FONT.lineH3;
    drawChecklist(
      ctx,
      tier.bullets.map((text, i) => ({ id: `${tier.tierId}-${i}`, text })),
      { compact: true },
    );
    ctx.y += 4;
  }
}

function drawNote(ctx: PdfCtx, note: string) {
  ctx.doc.setFont("helvetica", "italic");
  ctx.doc.setFontSize(FONT.small);
  const lines = ctx.doc.splitTextToSize(note, CONTENT_W - 16) as string[];
  const lineH = FONT.lineSmall;
  const platePadTop = 10;
  // Page-break friendly: if the note won't fit, start a new page first when large.
  if (ctx.y + lines.length * lineH + 20 > PDF_CONTENT_BOTTOM && lines.length > 3) {
    ensureSpace(ctx, lines.length * lineH + 24);
  }
  let i = 0;
  while (i < lines.length) {
    const room = Math.max(1, Math.floor((PDF_CONTENT_BOTTOM - ctx.y - 16) / lineH));
    const slice = lines.slice(i, i + room);
    if (slice.length === 0) {
      ensureSpace(ctx, 40);
      continue;
    }
    ensureSpace(ctx, slice.length * lineH + 18 + platePadTop);
    if (ctx.y < CONTENT_FLOW_TOP) ctx.y = CONTENT_FLOW_TOP;
    ctx.doc.setFillColor(...COLORS.soft);
    ctx.doc.roundedRect(MARGIN, ctx.y - platePadTop, CONTENT_W, slice.length * lineH + 14, 4, 4, "F");
    ctx.doc.setFont("helvetica", "italic");
    ctx.doc.setFontSize(FONT.small);
    ctx.doc.setTextColor(...COLORS.muted);
    ctx.doc.text(slice, MARGIN + 10, ctx.y + 2);
    ctx.y += slice.length * lineH + 16;
    i += slice.length;
  }
}

export type MemberPdfImages = {
  kids?: string;
  teens?: string;
  adult?: string;
  senior?: string;
};

export async function downloadMemberUserGuidePdf(
  imageUrls: MemberPdfImages = {},
  reservedTab?: Window | null,
) {
  const images: MemberPdfImages = {};
  if (imageUrls.kids) images.kids = await imageUrlToDataUrl(imageUrls.kids);
  if (imageUrls.teens) images.teens = await imageUrlToDataUrl(imageUrls.teens);
  if (imageUrls.adult) images.adult = await imageUrlToDataUrl(imageUrls.adult);
  if (imageUrls.senior) images.senior = await imageUrlToDataUrl(imageUrls.senior);
  const logoDataUrl = await loadPdfLogoDataUrl();
  const updatedAt = new Date();

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const tocHotspots = drawCoverAndToc(
    doc,
    MEMBER_GUIDE_META,
    "member",
    MEMBER_TOC,
    images.adult,
    updatedAt,
  );

  const destinations = new Map<string, { page: number; top: number }>();
  const ctx: PdfCtx = { doc, y: 0, destinations };
  beginContentPage(ctx);

  drawSectionHeading(ctx, "1. The big picture", "big-picture");
  drawChecklist(ctx, MEMBER_BIG_PICTURE);

  drawSectionHeading(ctx, "2. Age chapters", "age-chapters");
  const chapters = memberChapters({
    kids: imageUrls.kids || "",
    teens: imageUrls.teens || "",
    adult: imageUrls.adult || "",
    senior: imageUrls.senior || "",
  });
  for (const ch of chapters) {
    ensureSpace(ctx, 36);
    markDestination(ctx, ch.id);
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(FONT.h3);
    ctx.doc.setTextColor(...COLORS.bronze);
    ctx.doc.text(`${ch.number}  ${ch.title}`, MARGIN, ctx.y);
    ctx.y += FONT.lineH3;
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(FONT.small);
    ctx.doc.setTextColor(...COLORS.muted);
    ctx.doc.text(ch.ages, MARGIN, ctx.y);
    ctx.y += FONT.lineSmall + 2;

    const chapterImg =
      ch.id === "kids"
        ? images.kids
        : ch.id === "juniors"
          ? images.teens
          : ch.id === "adults"
            ? images.adult
            : ch.id === "seniors"
              ? images.senior
              : undefined;
    if (chapterImg) {
      drawContainedImage(ctx, chapterImg, { maxW: CONTENT_W, maxH: 200, padBottom: 40 });
    }

    drawChecklist(ctx, ch.items);
    ctx.y += 6;
  }

  drawSectionHeading(ctx, "3. Membership levels", "membership");
  drawChecklist(ctx, MEMBER_MEMBERSHIP);
  drawNote(
    ctx,
    "Consulting rates are the same for Kids, Teens, Adults, and Seniors. Kids/Teens often pay with parent-funded GYSH credits.",
  );

  drawSectionHeading(ctx, "4. Quick start", "quick-start");
  drawChecklist(ctx, MEMBER_QUICK_START);

  applyTocLinks(doc, tocHotspots, destinations, MEMBER_TOC);
  applyPdfPageBranding(doc, "Member User Guide", logoDataUrl, updatedAt);
  openPdfInBrowser(doc, MEMBER_GUIDE_META.filename, reservedTab);
}

export async function downloadAdminUserGuidePdf(reservedTab?: Window | null) {
  const logoDataUrl = await loadPdfLogoDataUrl();
  const updatedAt = new Date();
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const tocHotspots = drawCoverAndToc(doc, ADMIN_GUIDE_META, "admin", ADMIN_TOC, undefined, updatedAt);

  const destinations = new Map<string, { page: number; top: number }>();
  const ctx: PdfCtx = { doc, y: 0, destinations };
  doc.addPage();
  drawPdfPageChrome(doc);
  ctx.y = PDF_CONTENT_TOP;

  for (const section of ADMIN_SECTIONS) {
    drawSectionHeading(ctx, section.title, section.id);
    drawChecklist(ctx, section.items);
    ctx.y += 4;
  }

  applyTocLinks(doc, tocHotspots, destinations, ADMIN_TOC);
  applyPdfPageBranding(doc, "Admin User Guide", logoDataUrl, updatedAt);
  openPdfInBrowser(doc, ADMIN_GUIDE_META.filename, reservedTab);
}

export type MarketingPdfImages = {
  hero?: string;
  membership?: string;
  community?: string;
  /** Launch Guides / library art (fills space on guides showcase pages). */
  guides?: string;
};

/** Beautifully formatted marketing manual PDF (async — embeds hero images when available). */
export async function downloadMarketingGuidePdf(
  guideId: MarketingGuideId,
  imageUrls: MarketingPdfImages = {},
  reservedTab?: Window | null,
) {
  const guide = getMarketingGuide(guideId);
  const toc = marketingGuideToc(guide);

  const images: MarketingPdfImages = {};
  if (imageUrls.hero) images.hero = await imageUrlToDataUrl(imageUrls.hero);
  if (imageUrls.membership) images.membership = await imageUrlToDataUrl(imageUrls.membership);
  if (imageUrls.community) images.community = await imageUrlToDataUrl(imageUrls.community);
  if (imageUrls.guides) images.guides = await imageUrlToDataUrl(imageUrls.guides);
  const logoDataUrl = await loadPdfLogoDataUrl();
  const updatedAt = new Date();

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const tocHotspots = drawCoverAndToc(
    doc,
    { eyebrow: guide.eyebrow, title: guide.title, lead: guide.lead },
    "marketing",
    toc,
    images.hero,
    updatedAt,
  );

  const destinations = new Map<string, { page: number; top: number }>();
  const ctx: PdfCtx = { doc, y: 0, destinations };
  beginContentPage(ctx);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(FONT.small);
  doc.setTextColor(...COLORS.muted);
  const tag = doc.splitTextToSize(guide.tagline, CONTENT_W);
  doc.text(tag, MARGIN, ctx.y);
  ctx.y += tag.length * 11 + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT.small);
  doc.setTextColor(...COLORS.bronze);
  doc.text(guide.audienceBadge, MARGIN, ctx.y);
  ctx.y += 14;

  for (const section of guide.sections) {
    const n = Number(section.number);
    const startOnNewPage = marketingSectionStartsNewPage(guideId, n);
    // Extra air between sections that share a page (not needed after a fresh page break).
    const padBefore = startOnNewPage ? 0 : 6;
    drawMarketingSection(ctx, section, images, {
      startOnNewPage,
      padBefore,
      // Complete Guide + Kids §5 page: text-forward (cover already has the hero).
      skipImages: guideId === "master" || guideId === "kids",
    });
  }

  applyTocLinks(doc, tocHotspots, destinations, toc);
  applyPdfPageBranding(doc, guide.eyebrow, logoDataUrl, updatedAt);
  openPdfInBrowser(doc, guide.filename, reservedTab);
}
