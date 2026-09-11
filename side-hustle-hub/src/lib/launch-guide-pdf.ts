/**
 * Launch Guide PDFs — printable checklists with GYSH header/footer branding.
 * Pure model helper (`buildLaunchGuidePdfModel`) is canvas-free for unit tests.
 */
import { jsPDF } from "jspdf";
import { openPdfInBrowser } from "./open-pdf";
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
import { LAUNCH_GUIDES } from "./launch-guides";
import {
  formatGuideToolLine,
  formatPricingLine,
  guideKitForId,
  type GuideToolCost,
} from "./guide-tools";
import { hustleById } from "./side-hustle-catalog";

const COLORS = {
  ...PDF_BRAND_COLORS,
  link: [46, 90, 140] as [number, number, number],
  tintPrereq: [247, 241, 232] as [number, number, number],
  tintPricing: [242, 236, 245] as [number, number, number],
  tintSupply: [236, 244, 238] as [number, number, number],
  tintTools: [236, 242, 248] as [number, number, number],
  tintSteps: [248, 240, 236] as [number, number, number],
};

const FONT = {
  h1: 18,
  h2: 13,
  body: 10.5,
  small: 9.5,
  lineH1: 22,
  lineH2: 16,
  lineBody: 13,
  lineSmall: 12,
} as const;

/** First safe text baseline after a page break (clears checkbox glyphs vs header). */
const CONTENT_FLOW_TOP = PDF_CONTENT_TOP + 12;

type PdfCtx = { doc: jsPDF; y: number };

export type LaunchGuidePdfSupply = {
  qty: string;
  name: string;
  estCost: string;
  notes?: string;
};

export type LaunchGuidePdfModel = {
  title: string;
  prerequisites: string[];
  pricing?: string[];
  supplies: LaunchGuidePdfSupply[];
  tools: string[];
  steps: { title: string; desc: string }[];
};

/** Physical / non-app tools stay out of the PDF Tools section (supplies cover those). */
function isAppOrSoftwareTool(tool: GuideToolCost): boolean {
  if (
    tool.id === "phone_computer" ||
    tool.id === "basic_supplies" ||
    tool.id === "handyman_kit" ||
    tool.id === "printer"
  ) {
    return false;
  }
  return tool.planLabelApplicable !== false;
}

function supplyQty(item: { qty?: string; name: string }): string {
  const q = typeof item.qty === "string" ? item.qty.trim() : "";
  return q || "1";
}

function guideTitleForId(guideId: string): string {
  return (
    hustleById(guideId)?.name ??
    LAUNCH_GUIDES.find((g) => g.id === guideId)?.name ??
    guideId
  );
}

/** Canvas-free model for tests + PDF rendering. */
export function buildLaunchGuidePdfModel(guideId: string): LaunchGuidePdfModel {
  const kit = guideKitForId(guideId);
  const title = guideTitleForId(guideId);

  const prerequisites = kit.prerequisites.map((p) => `${p.label}: ${p.detail}`);

  const pricing =
    kit.suggestedPricing && kit.suggestedPricing.items.length > 0
      ? kit.suggestedPricing.items.map((item) => formatPricingLine(item))
      : undefined;

  const supplies: LaunchGuidePdfSupply[] = (kit.supplies?.items ?? []).map((item) => ({
    qty: supplyQty(item as { qty?: string; name: string }),
    name: item.name,
    estCost: item.estCost,
    notes: item.notes,
  }));

  const supplyNames = new Set(supplies.map((s) => s.name.trim().toLowerCase()));
  const tools = kit.tools
    .filter(isAppOrSoftwareTool)
    .filter((t) => !supplyNames.has(t.name.trim().toLowerCase()))
    .map((t) => formatGuideToolLine(t));

  const steps = (kit.steps ?? []).map((s) => ({ title: s.title, desc: s.desc }));

  return { title, prerequisites, pricing, supplies, tools, steps };
}

function launchGuideFilename(guideId: string): string {
  const slug = guideId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `GYSH-Launch-Guide-${slug || "guide"}.pdf`;
}

function ensureSpace(ctx: PdfCtx, need: number) {
  if (ctx.y + need > PDF_CONTENT_BOTTOM) {
    ctx.doc.addPage();
    drawPdfPageChrome(ctx.doc);
    ctx.y = CONTENT_FLOW_TOP;
  }
}

function drawGuideTitle(ctx: PdfCtx, title: string) {
  ensureSpace(ctx, 40);
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(FONT.h1);
  ctx.doc.setTextColor(...COLORS.charcoal);
  const lines = ctx.doc.splitTextToSize(title, CONTENT_W) as string[];
  for (const line of lines) {
    ensureSpace(ctx, FONT.lineH1);
    ctx.doc.text(line, MARGIN, ctx.y);
    ctx.y += FONT.lineH1;
  }
  ctx.doc.setDrawColor(...COLORS.wine);
  ctx.doc.setLineWidth(1.15);
  ctx.doc.line(MARGIN, ctx.y, PAGE_W - MARGIN, ctx.y);
  ctx.y += 14;
}

function drawSectionBar(
  ctx: PdfCtx,
  title: string,
  tint: [number, number, number],
) {
  ensureSpace(ctx, 28);
  const barH = 22;
  ctx.doc.setFillColor(...tint);
  ctx.doc.roundedRect(MARGIN, ctx.y - 12, CONTENT_W, barH, 3, 3, "F");
  ctx.doc.setFillColor(...COLORS.wine);
  ctx.doc.rect(MARGIN, ctx.y - 12, 4, barH, "F");
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(FONT.h2);
  ctx.doc.setTextColor(...COLORS.charcoal);
  ctx.doc.text(title, MARGIN + 12, ctx.y + 2);
  ctx.y += 18;
}

function drawBullets(ctx: PdfCtx, items: string[]) {
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(FONT.body);
  for (const item of items) {
    const lines = ctx.doc.splitTextToSize(`•  ${item}`, CONTENT_W) as string[];
    for (let i = 0; i < lines.length; i++) {
      ensureSpace(ctx, FONT.lineBody + 2);
      drawPdfLinkedWrappedText(ctx.doc, lines[i]!, MARGIN, ctx.y, CONTENT_W, {
        lineHeight: FONT.lineBody,
        color: COLORS.charcoal,
        linkColor: COLORS.link,
      });
      ctx.y += FONT.lineBody;
    }
    ctx.y += 3;
  }
  ctx.y += 6;
}

function drawCheckboxLine(
  ctx: PdfCtx,
  index: number,
  primary: string,
  secondary?: string,
) {
  const box = 9;
  const boxLift = 7;
  const textX = MARGIN + 28;
  const textW = CONTENT_W - 28;
  const label = `${index}.  ${primary}`;

  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(FONT.body);
  const primaryLines = ctx.doc.splitTextToSize(label, textW) as string[];
  ctx.doc.setFontSize(FONT.small);
  const secondaryLines = secondary
    ? (ctx.doc.splitTextToSize(secondary, textW) as string[])
    : [];
  const blockH =
    primaryLines.length * FONT.lineBody +
    secondaryLines.length * FONT.lineSmall +
    6;

  ensureSpace(ctx, blockH + boxLift);
  if (ctx.y < CONTENT_FLOW_TOP) ctx.y = CONTENT_FLOW_TOP;

  ctx.doc.setDrawColor(...COLORS.bronze);
  ctx.doc.setLineWidth(0.9);
  ctx.doc.roundedRect(MARGIN, ctx.y - boxLift, box, box, 1.5, 1.5, "S");

  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(FONT.body);
  for (const line of primaryLines) {
    drawPdfLinkedWrappedText(ctx.doc, line, textX, ctx.y, textW, {
      lineHeight: FONT.lineBody,
      color: COLORS.charcoal,
      linkColor: COLORS.link,
    });
    ctx.y += FONT.lineBody;
  }
  if (secondaryLines.length) {
    ctx.doc.setFont("helvetica", "italic");
    ctx.doc.setFontSize(FONT.small);
    ctx.doc.setTextColor(...COLORS.muted);
    for (const line of secondaryLines) {
      ensureSpace(ctx, FONT.lineSmall + 2);
      ctx.doc.text(line, textX, ctx.y);
      ctx.y += FONT.lineSmall;
    }
  }
  ctx.y += 5;
}

function drawSupplyChecklist(ctx: PdfCtx, supplies: LaunchGuidePdfSupply[]) {
  supplies.forEach((item, i) => {
    const primary = `${item.name}  ·  Qty: ${item.qty}  ·  Est. ${item.estCost}`;
    const secondary = item.notes?.trim() || undefined;
    drawCheckboxLine(ctx, i + 1, primary, secondary);
  });
  ctx.y += 4;
}

function drawStepChecklist(
  ctx: PdfCtx,
  steps: { title: string; desc: string }[],
) {
  steps.forEach((step, i) => {
    drawCheckboxLine(ctx, i + 1, step.title, step.desc);
  });
  ctx.y += 4;
}

function renderGuideContent(ctx: PdfCtx, model: LaunchGuidePdfModel) {
  drawGuideTitle(ctx, model.title);

  drawSectionBar(ctx, "Prerequisites", COLORS.tintPrereq);
  if (model.prerequisites.length) drawBullets(ctx, model.prerequisites);
  else {
    ctx.doc.setFont("helvetica", "italic");
    ctx.doc.setFontSize(FONT.small);
    ctx.doc.setTextColor(...COLORS.muted);
    ctx.doc.text("None listed.", MARGIN, ctx.y);
    ctx.y += 16;
  }

  if (model.pricing && model.pricing.length > 0) {
    drawSectionBar(ctx, "Suggested pricing", COLORS.tintPricing);
    drawBullets(ctx, model.pricing);
  }

  if (model.supplies.length > 0) {
    drawSectionBar(ctx, "Supply checklist", COLORS.tintSupply);
    drawSupplyChecklist(ctx, model.supplies);
  }

  drawSectionBar(ctx, "Tools (apps & software)", COLORS.tintTools);
  if (model.tools.length) drawBullets(ctx, model.tools);
  else {
    ctx.doc.setFont("helvetica", "italic");
    ctx.doc.setFontSize(FONT.small);
    ctx.doc.setTextColor(...COLORS.muted);
    ctx.doc.text("No apps/software required beyond what you already use.", MARGIN, ctx.y);
    ctx.y += 16;
  }

  drawSectionBar(ctx, "Step-by-step checklist", COLORS.tintSteps);
  if (model.steps.length) drawStepChecklist(ctx, model.steps);
  else {
    ctx.doc.setFont("helvetica", "italic");
    ctx.doc.setFontSize(FONT.small);
    ctx.doc.setTextColor(...COLORS.muted);
    ctx.doc.text("Steps coming soon for this guide.", MARGIN, ctx.y);
    ctx.y += 16;
  }
}

function orderedGuideIds(guideIds?: string[]): string[] {
  if (!guideIds || guideIds.length === 0) {
    return LAUNCH_GUIDES.map((g) => g.id);
  }
  const wanted = new Set(guideIds);
  // Preserve free-first LAUNCH_GUIDES order; append unknown ids at the end.
  const ordered = LAUNCH_GUIDES.map((g) => g.id).filter((id) => wanted.has(id));
  for (const id of guideIds) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  return ordered;
}

/** One hustle Launch Guide PDF. */
export async function downloadLaunchGuidePdf(
  guideId: string,
  reservedTab?: Window | null,
): Promise<void> {
  const model = buildLaunchGuidePdfModel(guideId);
  const logoDataUrl = await loadPdfLogoDataUrl();
  const updatedAt = new Date();
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);
  const ctx: PdfCtx = { doc, y: CONTENT_FLOW_TOP };
  renderGuideContent(ctx, model);
  applyPdfPageBranding(doc, model.title, logoDataUrl, updatedAt);
  openPdfInBrowser(doc, launchGuideFilename(guideId), reservedTab);
}

/**
 * All Launch Guides (or a subset) in free-first `LAUNCH_GUIDES` order.
 * Each guide starts on a fresh page.
 */
export async function downloadAllLaunchGuidesPdf(
  guideIds?: string[],
  reservedTab?: Window | null,
): Promise<void> {
  const ids = orderedGuideIds(guideIds);
  const logoDataUrl = await loadPdfLogoDataUrl();
  const updatedAt = new Date();
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const headerLabel = "Launch Guides";

  ids.forEach((id, index) => {
    if (index === 0) {
      drawPdfPageChrome(doc);
    } else {
      doc.addPage();
      drawPdfPageChrome(doc);
    }
    const ctx: PdfCtx = { doc, y: CONTENT_FLOW_TOP };
    renderGuideContent(ctx, buildLaunchGuidePdfModel(id));
  });

  if (ids.length === 0) {
    drawPdfPageChrome(doc);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(FONT.body);
    doc.setTextColor(...COLORS.muted);
    doc.text("No launch guides selected.", MARGIN, CONTENT_FLOW_TOP);
  }

  applyPdfPageBranding(doc, headerLabel, logoDataUrl, updatedAt);
  openPdfInBrowser(doc, "GYSH-All-Launch-Guides.pdf", reservedTab);
}
