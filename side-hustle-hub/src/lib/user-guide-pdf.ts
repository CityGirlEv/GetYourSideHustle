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

function drawCover(
  doc: jsPDF,
  meta: { eyebrow: string; title: string; lead: string },
  kind: "member" | "admin",
) {
  drawPageChrome(doc);
  doc.setFillColor(...COLORS.soft);
  doc.rect(MARGIN, 120, CONTENT_W, 280, "F");

  doc.setDrawColor(...COLORS.bronze);
  doc.setLineWidth(1.25);
  doc.line(MARGIN + 24, 148, MARGIN + 120, 148);

  doc.setTextColor(...COLORS.bronze);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(meta.eyebrow.toUpperCase(), MARGIN + 24, 176);

  doc.setTextColor(...COLORS.charcoal);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  const titleLines = doc.splitTextToSize(meta.title, CONTENT_W - 48);
  doc.text(titleLines, MARGIN + 24, 210);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.muted);
  const leadLines = doc.splitTextToSize(meta.lead, CONTENT_W - 48);
  doc.text(leadLines, MARGIN + 24, 210 + titleLines.length * 34 + 16);

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.bronze);
  doc.text(
    kind === "member" ? "Checklist edition · Families & Side Hustlers" : "Checklist edition · Admin partners",
    MARGIN + 24,
    380,
  );

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Get Your Side Hustle  ·  ${new Date().toLocaleDateString()}`, MARGIN + 24, 400);
}

function drawToc(doc: jsPDF, title: string, entries: { id: string; label: string }[]) {
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

  entries.forEach((entry, i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.charcoal);
    const num = String(i + 1).padStart(2, "0");
    doc.setTextColor(...COLORS.bronze);
    doc.setFont("helvetica", "bold");
    doc.text(num, MARGIN, y);
    doc.setTextColor(...COLORS.charcoal);
    doc.setFont("helvetica", "normal");
    doc.text(entry.label, MARGIN + 28, y);
    y += 22;
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

export function downloadMemberUserGuidePdf() {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawCover(doc, MEMBER_GUIDE_META, "member");
  drawToc(doc, "Contents", MEMBER_TOC);

  const ctx: PdfCtx = { doc, y: 0 };
  doc.addPage();
  drawPageChrome(doc);
  ctx.y = MARGIN + 28;

  drawSectionHeading(ctx, "1. The big picture");
  drawChecklist(ctx, MEMBER_BIG_PICTURE);

  drawSectionHeading(ctx, "2. Age chapters");
  const chapters = memberChapters({ kids: "", teens: "", adult: "", senior: "" });
  for (const ch of chapters) {
    ensureSpace(ctx, 36);
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(12);
    ctx.doc.setTextColor(...COLORS.bronze);
    ctx.doc.text(ch.title, MARGIN, ctx.y);
    ctx.y += 14;
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(...COLORS.muted);
    ctx.doc.text(ch.ages, MARGIN, ctx.y);
    ctx.y += 16;
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
  doc.save(ADMIN_GUIDE_META.filename);
}
