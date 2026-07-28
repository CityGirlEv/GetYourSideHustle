import { jsPDF } from "jspdf";
import { openPdfInBrowser } from "./open-pdf";
import { QA_TESTING_MANUAL } from "./qa-testing-manual";
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

const COLORS = {
  ...PDF_BRAND_COLORS,
  purple: [124, 58, 237] as [number, number, number],
};

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
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(14);
  ctx.doc.setTextColor(...COLORS.charcoal);
  ctx.doc.text(text, MARGIN, ctx.y);
  ctx.y += 8;
  ctx.doc.setDrawColor(...COLORS.line);
  ctx.doc.setLineWidth(0.8);
  ctx.doc.line(MARGIN, ctx.y, MARGIN + CONTENT_W, ctx.y);
  ctx.y += 14;
}

function para(
  ctx: Ctx,
  text: string,
  opts?: { bold?: boolean; size?: number; color?: [number, number, number] },
) {
  const size = opts?.size ?? 10;
  ctx.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  ctx.doc.setFontSize(size);
  ctx.doc.setTextColor(...(opts?.color ?? COLORS.charcoal));
  const lines = ctx.doc.splitTextToSize(text, CONTENT_W) as string[];
  ensureSpace(ctx, lines.length * (size + 3) + 6);
  for (const line of lines) {
    ctx.doc.text(line, MARGIN, ctx.y);
    ctx.y += size + 3;
  }
  ctx.y += 4;
}

function bullets(ctx: Ctx, items: readonly string[]) {
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(10);
  ctx.doc.setTextColor(...COLORS.charcoal);
  for (const item of items) {
    const lines = ctx.doc.splitTextToSize(`•  ${item}`, CONTENT_W) as string[];
    ensureSpace(ctx, lines.length * 13 + 2);
    for (const line of lines) {
      ctx.doc.text(line, MARGIN, ctx.y);
      ctx.y += 13;
    }
  }
  ctx.y += 6;
}

function numbered(ctx: Ctx, items: readonly string[]) {
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(10);
  ctx.doc.setTextColor(...COLORS.charcoal);
  items.forEach((item, i) => {
    const lines = ctx.doc.splitTextToSize(`${i + 1}.  ${item}`, CONTENT_W) as string[];
    ensureSpace(ctx, lines.length * 13 + 2);
    for (const line of lines) {
      ctx.doc.text(line, MARGIN, ctx.y);
      ctx.y += 13;
    }
  });
  ctx.y += 6;
}

function simpleTable(ctx: Ctx, headers: string[], rows: string[][]) {
  const cols = headers.length;
  const colW = CONTENT_W / cols;
  const pad = 4;
  const fontSize = 8;

  const rowH = (cells: string[], bold: boolean) => {
    let h = 0;
    ctx.doc.setFont("helvetica", bold ? "bold" : "normal");
    ctx.doc.setFontSize(fontSize);
    for (const c of cells) {
      const lines = ctx.doc.splitTextToSize(c || "—", colW - pad * 2) as string[];
      h = Math.max(h, lines.length * (fontSize + 2) + pad * 2);
    }
    return Math.max(h, 18);
  };

  const paint = (cells: string[], bold: boolean, fill: [number, number, number] | null) => {
    const h = rowH(cells, bold);
    ensureSpace(ctx, h + 2);
    if (fill) {
      ctx.doc.setFillColor(...fill);
      ctx.doc.rect(MARGIN, ctx.y, CONTENT_W, h, "F");
    }
    ctx.doc.setDrawColor(...COLORS.line);
    ctx.doc.setLineWidth(0.4);
    ctx.doc.rect(MARGIN, ctx.y, CONTENT_W, h, "S");
    for (let i = 1; i < cols; i++) {
      ctx.doc.line(MARGIN + colW * i, ctx.y, MARGIN + colW * i, ctx.y + h);
    }
    ctx.doc.setFont("helvetica", bold ? "bold" : "normal");
    ctx.doc.setFontSize(fontSize);
    ctx.doc.setTextColor(...COLORS.charcoal);
    cells.forEach((c, i) => {
      const lines = ctx.doc.splitTextToSize(c || "—", colW - pad * 2) as string[];
      ctx.doc.text(lines, MARGIN + colW * i + pad, ctx.y + pad + fontSize);
    });
    ctx.y += h;
  };

  paint(headers, true, [247, 241, 227]);
  rows.forEach((row, idx) => paint(row, false, idx % 2 ? [252, 250, 244] : null));
  ctx.y += 10;
}

export async function downloadQaTestingManualPdf(reservedTab?: Window | null): Promise<void> {
  const m = QA_TESTING_MANUAL;
  const logoDataUrl = await loadPdfLogoDataUrl();
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);

  const ctx: Ctx = { doc, y: PDF_CONTENT_TOP + 6 };
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.charcoal);
  doc.text(m.title, MARGIN, ctx.y);
  ctx.y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.bronze);
  doc.text(m.subtitle, MARGIN, ctx.y);
  ctx.y += 18;
  para(ctx, m.lead);
  para(ctx, `Where to work: ${m.where}`, { size: 9, color: COLORS.muted });

  heading(ctx, "Quick start");
  numbered(ctx, m.quickStart);

  heading(ctx, "Testing paths");
  for (const flow of m.flows) {
    heading(ctx, flow.title);
    flow.steps.forEach((step, i) => {
      para(ctx, `${i + 1}. ${step.title}`, { bold: true, size: 10 });
      if (step.detail) para(ctx, step.detail, { size: 9, color: COLORS.muted });
    });
  }

  heading(ctx, "Status definitions");
  simpleTable(
    ctx,
    ["Status", "Meaning", "Who", "Note?", "Done?"],
    m.statuses.map((s) => [s.status, s.meaning, s.who, s.note, s.done]),
  );
  para(ctx, m.statusCallout, { size: 9, color: COLORS.purple });

  heading(ctx, "What to do for each outcome");
  for (const o of m.outcomes) {
    para(ctx, o.title, { bold: true });
    bullets(ctx, o.bullets);
  }

  heading(ctx, m.fixedCursor.title);
  para(ctx, m.fixedCursor.intro);
  bullets(ctx, m.fixedCursor.bullets);
  para(ctx, "Fail note format:", { bold: true, size: 9 });
  para(ctx, m.fixedCursor.failFormat, { size: 9, color: COLORS.muted });
  para(ctx, "Conditional Pass note format:", { bold: true, size: 9 });
  para(ctx, m.fixedCursor.condFormat, { size: 9, color: COLORS.muted });
  para(ctx, "Your job when you see Fixed/Cursor:", { bold: true });
  numbered(ctx, m.fixedCursor.job);

  heading(ctx, "Fixed/Re-Test vs Failed/Re-Test vs Fixed/Cursor");
  simpleTable(
    ctx,
    ["Status", "Meaning", "After you re-test"],
    m.retestCompare.map((r) => [r.status, r.meaning, r.after]),
  );

  heading(ctx, "Progress counts (Tina chip)");
  bullets(
    ctx,
    m.progressColors.map(
      (c) =>
        `${c.label}${"emphasize" in c && c.emphasize ? " ← all system fixes land here" : ""}`,
    ),
  );
  para(ctx, m.progressNote, { size: 9, color: COLORS.muted });

  heading(ctx, "Notes rules");
  simpleTable(
    ctx,
    ["Situation", "Note?"],
    m.noteRules.map((r) => [r.situation, r.note]),
  );
  bullets(ctx, m.noteTips);

  heading(ctx, "Sprint Board vs Testing Portal");
  bullets(ctx, m.boardVsPortal);

  heading(ctx, "Checklist for Tina");
  bullets(
    ctx,
    m.checklist.map((c) => `[ ] ${c}`),
  );

  para(ctx, m.footer, { size: 9, color: COLORS.muted });

  applyPdfPageBranding(doc, m.title, logoDataUrl);
  openPdfInBrowser(doc, m.filename, reservedTab);
}
