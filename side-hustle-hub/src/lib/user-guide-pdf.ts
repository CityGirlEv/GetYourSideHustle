import { jsPDF } from "jspdf";
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
} from "./user-guide-content";
import {
  getMarketingGuide,
  marketingGuideToc,
  type MarketingGuideId,
  type MarketingSection,
} from "./marketing-guides";

const MARGIN = 48;
const PAGE_W = 612; // US Letter pt
const PAGE_H = 792;
const CONTENT_W = PAGE_W - MARGIN * 2;

const COLORS = {
  charcoal: [45, 42, 38] as [number, number, number],
  bronze: [148, 125, 100] as [number, number, number],
  muted: [110, 100, 90] as [number, number, number],
  line: [210, 200, 188] as [number, number, number],
  soft: [248, 245, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  check: [95, 122, 69] as [number, number, number],
};

type PdfCtx = {
  doc: jsPDF;
  y: number;
};

function ensureSpace(ctx: PdfCtx, need: number) {
  if (ctx.y + need > PAGE_H - MARGIN) {
    ctx.doc.addPage();
    drawPageChrome(ctx.doc);
    ctx.y = MARGIN + 28;
  }
}

function drawPageChrome(doc: jsPDF) {
  doc.setFillColor(...COLORS.soft);
  doc.rect(0, 0, PAGE_W, 18, "F");
  doc.setFillColor(...COLORS.bronze);
  doc.rect(0, 0, PAGE_W, 4, "F");
  doc.setFillColor(...COLORS.bronze);
  doc.rect(0, PAGE_H - 4, PAGE_W, 4, "F");
}

/** One diagonal DRAFT stamp per page — applied before save. */
function drawDraftWatermark(doc: jsPDF) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(86);
  doc.setTextColor(200, 150, 145);
  doc.text("DRAFT", PAGE_W / 2, PAGE_H / 2, {
    align: "center",
    baseline: "middle",
    angle: 32,
  });
}

/** Centered image with reserved vertical space so text never draws on top of it. */
function drawContainedImage(
  ctx: PdfCtx,
  dataUrl: string,
  opts: { maxW?: number; maxH?: number; padBottom?: number } = {},
): boolean {
  try {
    const maxW = opts.maxW ?? CONTENT_W;
    const maxH = opts.maxH ?? 150;
    const padBottom = opts.padBottom ?? 14;
    const props = ctx.doc.getImageProperties(dataUrl);
    const ratio = props.width / Math.max(1, props.height);
    let imgW = maxW;
    let imgH = imgW / ratio;
    if (imgH > maxH) {
      imgH = maxH;
      imgW = imgH * ratio;
    }
    ensureSpace(ctx, imgH + padBottom + 4);
    const x = MARGIN + (CONTENT_W - imgW) / 2;
    ctx.doc.setDrawColor(...COLORS.line);
    ctx.doc.setFillColor(...COLORS.soft);
    ctx.doc.roundedRect(x - 4, ctx.y - 4, imgW + 8, imgH + 8, 4, 4, "FD");
    ctx.doc.addImage(dataUrl, "PNG", x, ctx.y, imgW, imgH);
    ctx.y += imgH + padBottom;
    return true;
  } catch {
    return false;
  }
}

function stampDraftOnAllPages(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    drawDraftWatermark(doc);
  }
}

function coverEditionLabel(kind: "member" | "admin" | "marketing"): string {
  if (kind === "member") return "Checklist edition · Families & Side Hustlers";
  if (kind === "admin") return "Checklist edition · Admin partners";
  return "Marketing edition · Showcase · Membership · Checklists";
}

function drawCover(
  doc: jsPDF,
  meta: { eyebrow: string; title: string; lead: string },
  kind: "member" | "admin" | "marketing",
  coverImageDataUrl?: string,
) {
  drawPageChrome(doc);

  doc.setDrawColor(...COLORS.bronze);
  doc.setLineWidth(1.25);
  doc.line(MARGIN + 24, 112, MARGIN + 120, 112);

  doc.setTextColor(...COLORS.bronze);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(meta.eyebrow.toUpperCase(), MARGIN + 24, 140);

  doc.setTextColor(...COLORS.charcoal);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  const titleLines = doc.splitTextToSize(meta.title, CONTENT_W - 48);
  doc.text(titleLines, MARGIN + 24, 172);

  let y = 172 + titleLines.length * 30 + 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.muted);
  const leadLines = doc.splitTextToSize(meta.lead, CONTENT_W - 48);
  doc.text(leadLines, MARGIN + 24, y);
  y += leadLines.length * 14 + 20;

  if (coverImageDataUrl) {
    try {
      const maxW = CONTENT_W - 48;
      const maxH = 170;
      const props = doc.getImageProperties(coverImageDataUrl);
      const ratio = props.width / Math.max(1, props.height);
      let imgW = maxW;
      let imgH = imgW / ratio;
      if (imgH > maxH) {
        imgH = maxH;
        imgW = imgH * ratio;
      }
      // Keep cover art below copy — never let labels land on the image.
      if (y + imgH + 56 > PAGE_H - MARGIN) {
        imgH = Math.max(80, PAGE_H - MARGIN - y - 56);
        imgW = imgH * ratio;
        if (imgW > maxW) {
          imgW = maxW;
          imgH = imgW / ratio;
        }
      }
      const x = MARGIN + 24 + (maxW - imgW) / 2;
      doc.setDrawColor(...COLORS.line);
      doc.setFillColor(...COLORS.soft);
      doc.roundedRect(x - 4, y - 4, imgW + 8, imgH + 8, 4, 4, "FD");
      doc.addImage(coverImageDataUrl, "PNG", x, y, imgW, imgH);
      y += imgH + 22;
    } catch {
      /* image optional */
    }
  }

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.bronze);
  doc.text(coverEditionLabel(kind), MARGIN + 24, y);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Get Your Side Hustle  ·  ${new Date().toLocaleDateString()}`, MARGIN + 24, y + 18);
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
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const lines = ctx.doc.splitTextToSize(step.detail, CONTENT_W - 56);
    const blockH = 28 + lines.length * 12;
    ensureSpace(ctx, blockH + 18);

    ctx.doc.setFillColor(...COLORS.soft);
    ctx.doc.roundedRect(MARGIN, ctx.y - 12, CONTENT_W, blockH, 4, 4, "F");
    ctx.doc.setFillColor(...COLORS.bronze);
    ctx.doc.circle(MARGIN + 16, ctx.y + 2, 8, "F");
    ctx.doc.setTextColor(...COLORS.white);
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(9);
    ctx.doc.text(String(i + 1), MARGIN + 16, ctx.y + 5, { align: "center" });

    ctx.doc.setTextColor(...COLORS.bronze);
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(11);
    ctx.doc.text(step.label.toUpperCase(), MARGIN + 34, ctx.y);
    ctx.doc.setTextColor(...COLORS.charcoal);
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(10);
    ctx.doc.text(lines, MARGIN + 34, ctx.y + 14);
    ctx.y += blockH + 4;

    if (i < steps.length - 1) {
      ensureSpace(ctx, 16);
      ctx.doc.setDrawColor(...COLORS.bronze);
      ctx.doc.setLineWidth(1.2);
      const ax = MARGIN + 16;
      ctx.doc.line(ax, ctx.y - 2, ax, ctx.y + 8);
      // arrow head
      ctx.doc.line(ax, ctx.y + 8, ax - 3, ctx.y + 4);
      ctx.doc.line(ax, ctx.y + 8, ax + 3, ctx.y + 4);
      ctx.y += 14;
    }
  }
}

function drawMarketingSection(
  ctx: PdfCtx,
  section: MarketingSection,
  images: Partial<Record<"hero" | "membership" | "community", string>>,
) {
  drawSectionHeading(ctx, `${section.number}. ${section.title}`);
  if (section.intro) {
    drawNote(ctx, section.intro);
  }

  const imgKey =
    section.imageKey === "secondary" || section.imageKey === "hero"
      ? "hero"
      : section.imageKey === "membership" || section.imageKey === "community"
        ? section.imageKey
        : undefined;
  const dataUrl = imgKey ? images[imgKey] : undefined;
  if (dataUrl && (section.kind === "prose" || section.kind === "perks" || section.kind === "cta")) {
    // Full-width block above copy so the image never sits on top of text.
    drawContainedImage(ctx, dataUrl, { maxW: CONTENT_W * 0.88, maxH: 160, padBottom: 18 });
  }

  if (section.prose) {
    for (const p of section.prose) {
      const lines = ctx.doc.splitTextToSize(p, CONTENT_W);
      ensureSpace(ctx, lines.length * 13 + 10);
      ctx.doc.setFont("helvetica", "normal");
      ctx.doc.setFontSize(10.5);
      ctx.doc.setTextColor(...COLORS.charcoal);
      ctx.doc.text(lines, MARGIN, ctx.y);
      ctx.y += lines.length * 13 + 10;
    }
  }

  if (section.callout) {
    drawNote(ctx, `${section.callout.title}: ${section.callout.body}`);
  }

  if (section.items) drawChecklist(ctx, section.items);
  if (section.journey) drawJourney(ctx, section.journey);

  if (section.perks) {
    for (const tier of section.perks) {
      ensureSpace(ctx, 36);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(12);
      ctx.doc.setTextColor(...COLORS.bronze);
      ctx.doc.text(`${tier.name}  ·  ${tier.priceLine}`, MARGIN, ctx.y);
      ctx.y += 16;
      drawChecklist(
        ctx,
        tier.bullets.map((text, i) => ({ id: `${tier.tierId}-${i}`, text })),
      );
      ctx.y += 6;
    }
  }

  if (section.cta) {
    ensureSpace(ctx, 40);
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(12);
    ctx.doc.setTextColor(...COLORS.charcoal);
    const hl = ctx.doc.splitTextToSize(section.cta.headline, CONTENT_W);
    ctx.doc.text(hl, MARGIN, ctx.y);
    ctx.y += hl.length * 14 + 8;
    drawNote(ctx, section.cta.body);
    drawChecklist(
      ctx,
      section.cta.bullets.map((text, i) => ({ id: `cta-${i}`, text })),
    );
  }

  ctx.y += 6;
}

function drawToc(
  doc: jsPDF,
  title: string,
  entries: { id: string; label: string; number?: string; level?: number }[],
) {
  doc.addPage();
  drawPageChrome(doc);
  let y = MARGIN + 36;

  doc.setTextColor(...COLORS.charcoal);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, MARGIN, y);
  y += 10;
  doc.setDrawColor(...COLORS.bronze);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, y, MARGIN + 80, y);
  y += 28;

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
    const blockH = Math.max(rowH, labelLines.length * 13 + 4);

    if (cy + blockH > PAGE_H - MARGIN) {
      doc.addPage();
      drawPageChrome(doc);
      leftY = MARGIN + 28;
      rightY = MARGIN + 28;
      cy = isLeft ? leftY : rightY;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.bronze);
    doc.text(num, cx + indent, cy);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.charcoal);
    doc.text(labelLines, cx + indent + 28, cy);

    if (isLeft) leftY = cy + blockH;
    else rightY = cy + blockH;
  });
}

function drawSectionHeading(ctx: PdfCtx, title: string) {
  ensureSpace(ctx, 48);
  ctx.y += 8;
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(14);
  ctx.doc.setTextColor(...COLORS.charcoal);
  ctx.doc.text(title, MARGIN, ctx.y);
  ctx.y += 8;
  ctx.doc.setDrawColor(...COLORS.line);
  ctx.doc.setLineWidth(0.6);
  ctx.doc.line(MARGIN, ctx.y, PAGE_W - MARGIN, ctx.y);
  ctx.y += 16;
}

function drawChecklist(ctx: PdfCtx, items: GuideCheckItem[]) {
  for (const item of items) {
    const lines = ctx.doc.splitTextToSize(item.text, CONTENT_W - 28);
    const blockH = Math.max(18, lines.length * 14 + 8);
    ensureSpace(ctx, blockH + 4);

    // Checkbox
    ctx.doc.setDrawColor(...COLORS.bronze);
    ctx.doc.setLineWidth(1);
    ctx.doc.roundedRect(MARGIN, ctx.y - 8, 11, 11, 2, 2, "S");

    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(10.5);
    ctx.doc.setTextColor(...COLORS.charcoal);
    ctx.doc.text(lines, MARGIN + 20, ctx.y);
    ctx.y += blockH;
  }
}

function drawNote(ctx: PdfCtx, note: string) {
  const lines = ctx.doc.splitTextToSize(note, CONTENT_W - 16);
  ensureSpace(ctx, lines.length * 13 + 20);
  ctx.doc.setFillColor(...COLORS.soft);
  ctx.doc.roundedRect(MARGIN, ctx.y - 10, CONTENT_W, lines.length * 13 + 16, 4, 4, "F");
  ctx.doc.setFont("helvetica", "italic");
  ctx.doc.setFontSize(9.5);
  ctx.doc.setTextColor(...COLORS.muted);
  ctx.doc.text(lines, MARGIN + 10, ctx.y + 2);
  ctx.y += lines.length * 13 + 24;
}

function addFooters(doc: jsPDF, label: string) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text("Get Your Side Hustle", MARGIN, PAGE_H - 16);
    doc.text(`${label}  ·  ${i} / ${pages}`, PAGE_W - MARGIN, PAGE_H - 16, { align: "right" });
  }
}

export type MemberPdfImages = {
  kids?: string;
  teens?: string;
  adult?: string;
  senior?: string;
};

export async function downloadMemberUserGuidePdf(imageUrls: MemberPdfImages = {}) {
  const images: MemberPdfImages = {};
  if (imageUrls.kids) images.kids = await imageUrlToDataUrl(imageUrls.kids);
  if (imageUrls.teens) images.teens = await imageUrlToDataUrl(imageUrls.teens);
  if (imageUrls.adult) images.adult = await imageUrlToDataUrl(imageUrls.adult);
  if (imageUrls.senior) images.senior = await imageUrlToDataUrl(imageUrls.senior);

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawCover(doc, MEMBER_GUIDE_META, "member", images.adult);
  drawToc(doc, "Contents", MEMBER_TOC);

  const ctx: PdfCtx = { doc, y: 0 };
  doc.addPage();
  drawPageChrome(doc);
  ctx.y = MARGIN + 28;

  drawSectionHeading(ctx, "1. The big picture");
  drawChecklist(ctx, MEMBER_BIG_PICTURE);

  drawSectionHeading(ctx, "2. Age chapters");
  const chapters = memberChapters({
    kids: imageUrls.kids || "",
    teens: imageUrls.teens || "",
    adult: imageUrls.adult || "",
    senior: imageUrls.senior || "",
  });
  for (const ch of chapters) {
    ensureSpace(ctx, 36);
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(12);
    ctx.doc.setTextColor(...COLORS.bronze);
    ctx.doc.text(`${ch.number}  ${ch.title}`, MARGIN, ctx.y);
    ctx.y += 14;
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(...COLORS.muted);
    ctx.doc.text(ch.ages, MARGIN, ctx.y);
    ctx.y += 14;

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
    // Image as its own block above checklist — never beside or over text
    if (chapterImg) {
      drawContainedImage(ctx, chapterImg, { maxW: CONTENT_W * 0.78, maxH: 140, padBottom: 16 });
    }

    drawChecklist(ctx, ch.items);
    ctx.y += 6;
  }

  drawSectionHeading(ctx, "3. Membership levels");
  drawChecklist(ctx, MEMBER_MEMBERSHIP);
  drawNote(
    ctx,
    "Consulting rates are the same for Kids, Teens, Adults, and Seniors. Kids/Teens often pay with parent-funded GYSH credits.",
  );

  drawSectionHeading(ctx, "4. Quick start");
  drawChecklist(ctx, MEMBER_QUICK_START);

  addFooters(doc, "Member User Guide");
  stampDraftOnAllPages(doc);
  doc.save(MEMBER_GUIDE_META.filename);
}

export function downloadAdminUserGuidePdf() {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawCover(doc, ADMIN_GUIDE_META, "admin");
  drawToc(doc, "Contents", ADMIN_TOC);

  const ctx: PdfCtx = { doc, y: 0 };
  doc.addPage();
  drawPageChrome(doc);
  ctx.y = MARGIN + 28;

  for (const section of ADMIN_SECTIONS) {
    drawSectionHeading(ctx, section.title);
    drawChecklist(ctx, section.items);
    ctx.y += 4;
  }

  addFooters(doc, "Admin User Guide");
  stampDraftOnAllPages(doc);
  doc.save(ADMIN_GUIDE_META.filename);
}

export type MarketingPdfImages = {
  hero?: string;
  membership?: string;
  community?: string;
};

/** Beautifully formatted marketing manual PDF (async — embeds hero images when available). */
export async function downloadMarketingGuidePdf(
  guideId: MarketingGuideId,
  imageUrls: MarketingPdfImages = {},
) {
  const guide = getMarketingGuide(guideId);
  const toc = marketingGuideToc(guide);

  const images: MarketingPdfImages = {};
  if (imageUrls.hero) images.hero = await imageUrlToDataUrl(imageUrls.hero);
  if (imageUrls.membership) images.membership = await imageUrlToDataUrl(imageUrls.membership);
  if (imageUrls.community) images.community = await imageUrlToDataUrl(imageUrls.community);

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawCover(
    doc,
    { eyebrow: guide.eyebrow, title: guide.title, lead: guide.lead },
    "marketing",
    images.hero,
  );
  drawToc(doc, "Contents", toc);

  const ctx: PdfCtx = { doc, y: 0 };
  doc.addPage();
  drawPageChrome(doc);
  ctx.y = MARGIN + 28;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  const tag = doc.splitTextToSize(guide.tagline, CONTENT_W);
  doc.text(tag, MARGIN, ctx.y);
  ctx.y += tag.length * 13 + 8;
  drawNote(ctx, guide.audienceBadge);

  for (const section of guide.sections) {
    drawMarketingSection(ctx, section, images);
  }

  addFooters(doc, guide.menuLabel);
  stampDraftOnAllPages(doc);
  doc.save(guide.filename);
}
