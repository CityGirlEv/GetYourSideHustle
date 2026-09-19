/**
 * Launch Guide PDFs — printable checklists with GYSH header/footer branding.
 * Pure model helper (`buildLaunchGuidePdfModel`) is canvas-free for unit tests.
 * Layout uses keep-with-next so section headings and step titles are never orphaned.
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
import {
  LAUNCH_GUIDE_PDF_FONT as FONT,
  PDF_SECTION_BAR_H,
  PDF_SECTION_BAR_ADVANCE,
  PDF_CHECKBOX_BOX_LIFT,
  PDF_TITLE_RULE_GAP,
  PDF_KEEP_WITH_NEXT_LINES,
  pdfSectionKeepTogetherNeed,
  pdfTitleKeepTogetherNeed,
  pdfCheckboxKeepTogetherNeed,
} from "./launch-guide-pdf-layout";
import { LAUNCH_GUIDES } from "./launch-guides";
import {
  formatGuideToolLine,
  formatPricingLine,
  type GuideToolCost,
} from "./guide-tools";
import { pricingDisclaimer } from "./guide-suggested-pricing";
import { hustleById, guideSideHustleDescription } from "./side-hustle-catalog";
import { kidsGuideById } from "./kids-guides";
import { uniqueGuideLibraryIds } from "./guide-library-pool";
import { applyGuideCatalogPatch, type GuideCatalogPatch } from "./guide-catalog-state";
import { resolveGuideKit } from "./guide-kit-overrides";
import { fetchGuideCatalogStates } from "./guide-catalog-client";
import { parseGuideStepDesc } from "./guide-step-checklist";

const COLORS = {
  ...PDF_BRAND_COLORS,
  link: [46, 90, 140] as [number, number, number],
  tintPrereq: [247, 241, 232] as [number, number, number],
  tintPricing: [242, 236, 245] as [number, number, number],
  tintSupply: [236, 244, 238] as [number, number, number],
  tintTools: [236, 242, 248] as [number, number, number],
  tintSteps: [248, 240, 236] as [number, number, number],
};

/** First safe text baseline after a page break (clears checkbox glyphs vs header). */
const CONTENT_FLOW_TOP = PDF_CONTENT_TOP + 12;

type PdfCtx = { doc: jsPDF; y: number };

export type LaunchGuidePdfSupply = {
  qty: string;
  name: string;
  estCost: string;
  notes?: string;
};

export type LaunchGuidePdfStepBodyPart =
  | { kind: "p"; text: string }
  | { kind: "check"; text: string };

export type LaunchGuidePdfModel = {
  title: string;
  lede?: string;
  prerequisites: string[];
  pricingIntro?: string;
  pricing?: string[];
  pricingRaiseTip?: string;
  supplies: LaunchGuidePdfSupply[];
  tools: string[];
  steps: { title: string; desc: string }[];
};

let cachedPdfGuideIds: Set<string> | undefined;

function allPdfGuideIds(): Set<string> {
  if (!cachedPdfGuideIds) {
    cachedPdfGuideIds = new Set(uniqueGuideLibraryIds());
    for (const g of LAUNCH_GUIDES) cachedPdfGuideIds.add(g.id);
  }
  return cachedPdfGuideIds;
}

/** True when a printable launch-guide PDF can be generated for this id. */
export function guideHasPdfDownload(guideId: string): boolean {
  const id = String(guideId || "").trim();
  if (!id) return false;
  if (hustleById(id) || kidsGuideById(id)) return true;
  return allPdfGuideIds().has(id);
}

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
    kidsGuideById(guideId)?.title ??
    guideId
  );
}

/** Flatten a step description into body paragraphs and ☐ checklist lines. */
export function launchGuidePdfStepBodyParts(desc: string): LaunchGuidePdfStepBodyPart[] {
  const parts: LaunchGuidePdfStepBodyPart[] = [];
  for (const seg of parseGuideStepDesc(desc)) {
    if (seg.kind === "check") {
      const label = seg.label.trim();
      if (label) parts.push({ kind: "check", text: label });
      continue;
    }
    const lines = String(seg.text || "").split(/\r?\n/);
    let buf: string[] = [];
    const flush = () => {
      const text = buf.join(" ").replace(/\s+/g, " ").trim();
      buf = [];
      if (text) parts.push({ kind: "p", text });
    };
    for (const line of lines) {
      if (!line.trim()) {
        flush();
        continue;
      }
      buf.push(line.trim());
    }
    flush();
  }
  return parts;
}

/** Canvas-free model for tests + PDF rendering.
 * Pass catalog `patch` so admin edits (name / steps / tools / prerequisites) match the library. */
export function buildLaunchGuidePdfModel(
  guideId: string,
  patch?: GuideCatalogPatch | null,
): LaunchGuidePdfModel {
  const kit = resolveGuideKit(guideId, patch);
  const baseTitle = guideTitleForId(guideId);
  const title = String(
    applyGuideCatalogPatch({ name: baseTitle }, patch).name || baseTitle,
  );
  const lede = String(
    applyGuideCatalogPatch({ peek: guideSideHustleDescription(guideId) }, patch).peek ||
      guideSideHustleDescription(guideId) ||
      "",
  ).trim();

  const prerequisites = kit.prerequisites.map((p) => `${p.label}: ${p.detail}`);

  const pricingIntro = kit.suggestedPricing?.intro?.trim() || undefined;
  const pricingRaiseTip = kit.suggestedPricing?.raiseTip?.trim() || undefined;
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

  return {
    title,
    lede: lede || undefined,
    prerequisites,
    pricingIntro,
    pricing,
    pricingRaiseTip,
    supplies,
    tools,
    steps,
  };
}

async function catalogPatchForGuide(
  guideId: string,
): Promise<GuideCatalogPatch | null | undefined> {
  try {
    const states = await fetchGuideCatalogStates();
    return states[guideId]?.patch ?? null;
  } catch {
    return undefined;
  }
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

function drawMutedNote(ctx: PdfCtx, text: string) {
  ctx.doc.setFont("helvetica", "italic");
  ctx.doc.setFontSize(FONT.small);
  ctx.doc.setTextColor(...COLORS.muted);
  const lines = ctx.doc.splitTextToSize(text, CONTENT_W) as string[];
  for (const line of lines) {
    ensureSpace(ctx, FONT.lineSmall + 2);
    ctx.doc.text(line, MARGIN, ctx.y);
    ctx.y += FONT.lineSmall;
  }
  ctx.y += 8;
}

function drawBodyParagraph(ctx: PdfCtx, text: string, opts?: { keepFirstLines?: number }) {
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(FONT.body);
  const lines = ctx.doc.splitTextToSize(text, CONTENT_W) as string[];
  const keep = opts?.keepFirstLines ?? 0;
  if (keep > 0) {
    ensureSpace(ctx, Math.min(keep, lines.length) * FONT.lineBody);
  }
  for (const line of lines) {
    ensureSpace(ctx, FONT.lineBody + 2);
    drawPdfLinkedWrappedText(ctx.doc, line, MARGIN, ctx.y, CONTENT_W, {
      lineHeight: FONT.lineBody,
      color: COLORS.charcoal,
      linkColor: COLORS.link,
    });
    ctx.y += FONT.lineBody;
  }
  ctx.y += 4;
}

function drawGuideTitle(ctx: PdfCtx, title: string, lede?: string) {
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(FONT.h1);
  const titleLines = ctx.doc.splitTextToSize(title, CONTENT_W) as string[];
  let ledeLines: string[] = [];
  if (lede) {
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(FONT.body);
    ledeLines = ctx.doc.splitTextToSize(lede, CONTENT_W) as string[];
  }
  ensureSpace(ctx, pdfTitleKeepTogetherNeed(titleLines.length, ledeLines.length));

  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(FONT.h1);
  ctx.doc.setTextColor(...COLORS.charcoal);
  for (const line of titleLines) {
    ctx.doc.text(line, MARGIN, ctx.y);
    ctx.y += FONT.lineH1;
  }
  ctx.doc.setDrawColor(...COLORS.wine);
  ctx.doc.setLineWidth(1.15);
  ctx.doc.line(MARGIN, ctx.y, PAGE_W - MARGIN, ctx.y);
  ctx.y += PDF_TITLE_RULE_GAP;

  if (ledeLines.length) {
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(FONT.body);
    ctx.doc.setTextColor(...COLORS.muted);
    for (const line of ledeLines) {
      ctx.doc.text(line, MARGIN, ctx.y);
      ctx.y += FONT.lineBody;
    }
    ctx.y += 8;
  }
}

function drawSectionBar(
  ctx: PdfCtx,
  title: string,
  tint: [number, number, number],
) {
  ensureSpace(ctx, pdfSectionKeepTogetherNeed());
  ctx.doc.setFillColor(...tint);
  ctx.doc.roundedRect(MARGIN, ctx.y - 12, CONTENT_W, PDF_SECTION_BAR_H, 3, 3, "F");
  ctx.doc.setFillColor(...COLORS.wine);
  ctx.doc.rect(MARGIN, ctx.y - 12, 4, PDF_SECTION_BAR_H, "F");
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(FONT.h2);
  ctx.doc.setTextColor(...COLORS.charcoal);
  ctx.doc.text(title, MARGIN + 12, ctx.y + 2);
  ctx.y += PDF_SECTION_BAR_ADVANCE;
}

function drawBullets(ctx: PdfCtx, items: string[]) {
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(FONT.body);
  for (const item of items) {
    const lines = ctx.doc.splitTextToSize(`•  ${item}`, CONTENT_W) as string[];
    ensureSpace(ctx, Math.min(PDF_KEEP_WITH_NEXT_LINES, lines.length) * FONT.lineBody + 2);
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
  const textX = MARGIN + 28;
  const textW = CONTENT_W - 28;
  const label = `${index}.  ${primary}`;

  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(FONT.body);
  const primaryLines = ctx.doc.splitTextToSize(label, textW) as string[];
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(FONT.small);
  const secondaryLines = secondary
    ? (ctx.doc.splitTextToSize(secondary, textW) as string[])
    : [];
  const keepSecondary = Math.min(PDF_KEEP_WITH_NEXT_LINES, secondaryLines.length);
  ensureSpace(ctx, pdfCheckboxKeepTogetherNeed(primaryLines.length, keepSecondary));
  if (ctx.y < CONTENT_FLOW_TOP) ctx.y = CONTENT_FLOW_TOP;

  ctx.doc.setDrawColor(...COLORS.bronze);
  ctx.doc.setLineWidth(0.9);
  ctx.doc.roundedRect(MARGIN, ctx.y - PDF_CHECKBOX_BOX_LIFT, box, box, 1.5, 1.5, "S");

  ctx.doc.setFont("helvetica", "bold");
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
    ctx.doc.setFont("helvetica", "normal");
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

function drawNestedCheck(ctx: PdfCtx, text: string, textX: number, textW: number) {
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(FONT.small);
  const lines = ctx.doc.splitTextToSize(`☐  ${text}`, textW) as string[];
  ensureSpace(ctx, Math.min(PDF_KEEP_WITH_NEXT_LINES, lines.length) * FONT.lineSmall);
  for (const line of lines) {
    ensureSpace(ctx, FONT.lineSmall + 2);
    ctx.doc.setTextColor(...COLORS.charcoal);
    ctx.doc.text(line, textX, ctx.y);
    ctx.y += FONT.lineSmall;
  }
  ctx.y += 2;
}

function drawStepChecklist(
  ctx: PdfCtx,
  steps: { title: string; desc: string }[],
) {
  const box = 9;
  const textX = MARGIN + 28;
  const textW = CONTENT_W - 28;

  steps.forEach((step, i) => {
    const label = `${i + 1}.  ${step.title}`;
    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(FONT.body);
    const titleLines = ctx.doc.splitTextToSize(label, textW) as string[];
    const bodyParts = launchGuidePdfStepBodyParts(step.desc);
    const firstBody =
      bodyParts[0]?.kind === "p"
        ? (ctx.doc.splitTextToSize(bodyParts[0].text, textW) as string[])
        : [];
    const keepSecondary = Math.min(PDF_KEEP_WITH_NEXT_LINES, firstBody.length);
    ensureSpace(ctx, pdfCheckboxKeepTogetherNeed(titleLines.length, keepSecondary));
    if (ctx.y < CONTENT_FLOW_TOP) ctx.y = CONTENT_FLOW_TOP;

    ctx.doc.setDrawColor(...COLORS.bronze);
    ctx.doc.setLineWidth(0.9);
    ctx.doc.roundedRect(MARGIN, ctx.y - PDF_CHECKBOX_BOX_LIFT, box, box, 1.5, 1.5, "S");

    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(FONT.body);
    ctx.doc.setTextColor(...COLORS.charcoal);
    for (const line of titleLines) {
      drawPdfLinkedWrappedText(ctx.doc, line, textX, ctx.y, textW, {
        lineHeight: FONT.lineBody,
        color: COLORS.charcoal,
        linkColor: COLORS.link,
      });
      ctx.y += FONT.lineBody;
    }

    for (const part of bodyParts) {
      if (part.kind === "check") {
        drawNestedCheck(ctx, part.text, textX, textW);
        continue;
      }
      ctx.doc.setFont("helvetica", "normal");
      ctx.doc.setFontSize(FONT.body);
      const lines = ctx.doc.splitTextToSize(part.text, textW) as string[];
      for (const line of lines) {
        ensureSpace(ctx, FONT.lineBody + 2);
        drawPdfLinkedWrappedText(ctx.doc, line, textX, ctx.y, textW, {
          lineHeight: FONT.lineBody,
          color: COLORS.charcoal,
          linkColor: COLORS.link,
        });
        ctx.y += FONT.lineBody;
      }
      ctx.y += 3;
    }
    ctx.y += 6;
  });
  ctx.y += 4;
}

function renderGuideContent(ctx: PdfCtx, model: LaunchGuidePdfModel) {
  drawGuideTitle(ctx, model.title, model.lede);

  drawSectionBar(ctx, "Prerequisites", COLORS.tintPrereq);
  if (model.prerequisites.length) drawBullets(ctx, model.prerequisites);
  else drawMutedNote(ctx, "None listed.");

  if (
    (model.pricing && model.pricing.length > 0) ||
    model.pricingIntro ||
    model.pricingRaiseTip
  ) {
    drawSectionBar(ctx, "Suggested pricing", COLORS.tintPricing);
    if (model.pricingIntro) drawBodyParagraph(ctx, model.pricingIntro);
    if (model.pricing && model.pricing.length > 0) drawBullets(ctx, model.pricing);
    if (model.pricingRaiseTip) drawBodyParagraph(ctx, model.pricingRaiseTip);
    drawMutedNote(ctx, pricingDisclaimer());
  }

  if (model.supplies.length > 0) {
    drawSectionBar(ctx, "Supply checklist", COLORS.tintSupply);
    drawSupplyChecklist(ctx, model.supplies);
  }

  drawSectionBar(ctx, "Tools (apps & software)", COLORS.tintTools);
  if (model.tools.length) drawBullets(ctx, model.tools);
  else drawMutedNote(ctx, "No apps/software required beyond what you already use.");

  drawSectionBar(ctx, "Step-by-step checklist", COLORS.tintSteps);
  if (model.steps.length) drawStepChecklist(ctx, model.steps);
  else drawMutedNote(ctx, "Steps coming soon for this guide.");
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

/** One hustle Launch Guide PDF. Uses live catalog patch when `patch` omitted. */
export async function downloadLaunchGuidePdf(
  guideId: string,
  reservedTab?: Window | null,
  patch?: GuideCatalogPatch | null,
): Promise<void> {
  const resolvedPatch = patch !== undefined ? patch : await catalogPatchForGuide(guideId);
  const model = buildLaunchGuidePdfModel(guideId, resolvedPatch);
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
 * Each guide starts on a fresh page. Loads catalog patches once when not provided.
 */
export async function downloadAllLaunchGuidesPdf(
  guideIds?: string[],
  reservedTab?: Window | null,
  patchesByGuideId?: Record<string, GuideCatalogPatch | null | undefined>,
): Promise<void> {
  const ids = orderedGuideIds(guideIds);
  let patches = patchesByGuideId;
  if (!patches) {
    try {
      const states = await fetchGuideCatalogStates();
      patches = Object.fromEntries(
        Object.entries(states).map(([id, state]) => [id, state.patch ?? null]),
      );
    } catch {
      patches = {};
    }
  }
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
    renderGuideContent(ctx, buildLaunchGuidePdfModel(id, patches?.[id]));
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
