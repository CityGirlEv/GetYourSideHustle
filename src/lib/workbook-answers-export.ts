import type { jsPDF } from "jspdf";
import { downloadBlobFile } from "@/lib/article-authoring";
import type {
  BenchmarkWorkbookContent,
  BenchmarkWorkbookWritingSection,
} from "@/lib/benchmark-workbook-content";
import {
  enumerateChecklistItems,
  workbookSectionStartsNewPage,
} from "@/lib/benchmark-workbook-content";
import { DEFAULT_WORKBOOK_LEAD_MAGNET } from "@/lib/content-factory/batch-seed";
import { DEFAULT_WORKBOOK_SLUG } from "@/lib/content-factory/lead-magnet-paths";
import { buildLeadMagnetWorkbookPdf, loadLeadMagnetPdfLogo } from "@/lib/lead-magnet-pdf";
import type { WorkbookFormState } from "@/lib/workbook-form-state";
import { workbookStateToPdfFill } from "@/lib/workbook-pdf-fill";

const INK: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [75, 85, 99];
const BRAND: [number, number, number] = [0, 40, 112];

export function workbookAnswersDownloadFilename(slug = DEFAULT_WORKBOOK_SLUG): string {
  return `${slug}-my-answers.pdf`;
}

function lineValue(lines: Record<string, string>, key: string): string {
  return lines[key]?.trim() ?? "";
}

function formatWritingSectionLines(
  section: BenchmarkWorkbookWritingSection,
  lines: Record<string, string>,
): string[] {
  const output: string[] = [];
  if (section.variant === "drug-table") {
    for (let index = 0; index < section.lines; index += 1) {
      const drug = lineValue(lines, `${section.id}:drug-${index}`);
      const dose = lineValue(lines, `${section.id}:dose-${index}`);
      if (!drug && !dose) continue;
      output.push(dose ? `${drug} — ${dose}` : drug);
    }
    return output;
  }

  for (let index = 0; index < section.lines; index += 1) {
    const value = lineValue(lines, `${section.id}:line-${index}`);
    if (value) output.push(value);
  }
  return output;
}

function formatNumberedChecklistLabel(item: string, globalNumber: number): string {
  return `${globalNumber}. ${item}`;
}

/** Plain-text export for tests and optional copy-to-clipboard flows. */
export function formatWorkbookAnswersAsText(
  workbook: BenchmarkWorkbookContent,
  state: WorkbookFormState,
  savedAt = new Date(),
): string {
  const lines: string[] = [
    workbook.title,
    "My saved answers",
    `Saved ${savedAt.toLocaleString()}`,
    "",
  ];

  for (const section of workbook.checklistSections) {
    lines.push(section.title);
    lines.push("-".repeat(section.title.length));
    for (const entry of enumerateChecklistItems(workbook).filter(
      (item) => item.sectionId === section.id,
    )) {
      const checked = state.checked[`${entry.sectionId}:${entry.itemIndex}`] ?? false;
      lines.push(`${checked ? "[x]" : "[ ]"} ${formatNumberedChecklistLabel(entry.item, entry.globalNumber)}`);
    }

    if (section.id === "workbook-agent-questions") {
      const notes = formatWritingSectionLines(
        {
          id: `${section.id}:notes`,
          title: "Your notes",
          hint: "",
          lines: 3,
        },
        state.lines,
      );
      if (notes.length > 0) {
        lines.push("");
        lines.push("Your notes");
        notes.forEach((note) => lines.push(`  • ${note}`));
      }
    }
    lines.push("");
  }

  for (const section of workbook.writingSections) {
    const entries = formatWritingSectionLines(section, state.lines);
    if (entries.length === 0) continue;
    lines.push(section.title);
    lines.push("-".repeat(section.title.length));
    entries.forEach((entry) => lines.push(`  • ${entry}`));
    lines.push("");
  }

  lines.push(workbook.disclaimer);
  return lines.join("\n");
}

function splitText(doc: jsPDF, text: string, maxW: number): string[] {
  return doc.splitTextToSize(text, maxW) as string[];
}

function drawSubheading(doc: jsPDF, title: string, x: number, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND);
  doc.text(title, x, y);
  return y + 16;
}

function drawCheckboxItem(
  doc: jsPDF,
  item: string,
  checked: boolean,
  y: number,
  margin: number,
  contentW: number,
  globalNumber?: number,
): number {
  const label = globalNumber != null ? formatNumberedChecklistLabel(item, globalNumber) : item;
  const box = 10;
  const textX = margin + box + 8;
  const textW = contentW - box - 8;
  const wrapped = splitText(doc, label, textW);
  const blockH = Math.max(box, wrapped.length * 13) + 8;

  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.75);
  doc.rect(margin, y - box + 2, box, box);
  if (checked) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text("✓", margin + 2.5, y + 1);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(wrapped, textX, y);

  return y + blockH;
}

function drawFilledLines(
  doc: jsPDF,
  entries: string[],
  y: number,
  margin: number,
  contentW: number,
): number {
  let rowY = y;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK);

  for (const entry of entries) {
    const wrapped = splitText(doc, `• ${entry}`, contentW - 12);
    doc.text(wrapped, margin + 8, rowY);
    rowY += wrapped.length * 13 + 6;
  }

  return rowY + 4;
}

/** Workbook checklist + notes for the benchmark report PDF (Help Me Prepare tab). */
export function appendWorkbookSectionToBenchmarkPdf(
  doc: jsPDF,
  y: number,
  margin: number,
  contentW: number,
  workbook: BenchmarkWorkbookContent,
  state: WorkbookFormState | null | undefined,
  ensureY: (currentY: number, needed: number) => number,
  startNewPage?: () => number,
): number {
  const formState = state ?? { checked: {}, lines: {} };

  y = ensureY(y, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  const excerptLines = splitText(doc, workbook.excerpt, contentW);
  excerptLines.forEach((line, index) => doc.text(line, margin, y + index * 12));
  y += excerptLines.length * 12 + 12;

  for (const section of workbook.checklistSections) {
    if (workbookSectionStartsNewPage(section.id) && startNewPage) {
      y = startNewPage();
    }
    y = ensureY(y, 28);
    y = drawSubheading(doc, section.title, margin, y);

    for (const entry of enumerateChecklistItems(workbook).filter(
      (item) => item.sectionId === section.id,
    )) {
      const checked = formState.checked[`${entry.sectionId}:${entry.itemIndex}`] ?? false;
      y = ensureY(y, 20);
      y = drawCheckboxItem(doc, entry.item, checked, y, margin, contentW, entry.globalNumber);
    }

    if (section.id === "workbook-agent-questions") {
      const notes = formatWritingSectionLines(
        {
          id: `${section.id}:notes`,
          title: "Your notes",
          hint: "",
          lines: 3,
        },
        formState.lines,
      );
      if (notes.length > 0) {
        y = ensureY(y, 24);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...MUTED);
        doc.text("Your notes", margin, y);
        y += 14;
        y = drawFilledLines(doc, notes, y, margin, contentW);
      }
    }

    y += 6;
  }

  for (const section of workbook.writingSections) {
    if (workbookSectionStartsNewPage(section.id) && startNewPage) {
      y = startNewPage();
    }
    const entries = formatWritingSectionLines(section, formState.lines);
    y = ensureY(y, 28);
    y = drawSubheading(doc, section.title, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    const hintLines = splitText(doc, section.hint, contentW);
    hintLines.forEach((line, index) => doc.text(line, margin, y + index * 11));
    y += hintLines.length * 11 + 6;

    if (entries.length > 0) {
      y = drawFilledLines(doc, entries, y, margin, contentW);
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("(No entries yet)", margin, y);
      y += 14;
    }
    y += 6;
  }

  y = ensureY(y, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const disclaimerLines = splitText(doc, workbook.disclaimer, contentW);
  disclaimerLines.forEach((line, index) => doc.text(line, margin, y + index * 10));
  y += disclaimerLines.length * 10 + 8;

  return y;
}

/** Full printable workbook PDF with the user's checklist marks and writing lines filled in. */
export function buildWorkbookAnswersPdf(
  workbook: BenchmarkWorkbookContent,
  state: WorkbookFormState,
  logoDataUrl?: string | null,
): jsPDF {
  return buildLeadMagnetWorkbookPdf(
    {
      title: workbook.title,
      excerpt: workbook.excerpt,
      body: DEFAULT_WORKBOOK_LEAD_MAGNET.body,
    },
    {
      logoDataUrl,
      fill: workbookStateToPdfFill(state),
    },
  );
}

export async function downloadWorkbookAnswersPdf(
  workbook: BenchmarkWorkbookContent,
  state: WorkbookFormState,
): Promise<void> {
  const logoDataUrl = await loadLeadMagnetPdfLogo();
  const doc = buildWorkbookAnswersPdf(workbook, state, logoDataUrl);
  downloadBlobFile(workbookAnswersDownloadFilename(), doc.output("blob"));
}
