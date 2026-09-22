/** Branded PDF for GYSH Failure Report + Post-Fix Report. */

import { jsPDF } from "jspdf";
import {
  PDF_CONTENT_BOTTOM,
  PDF_CONTENT_TOP,
  PDF_MARGIN,
  applyPdfPageBranding,
  drawPdfPageChrome,
} from "./pdf-branding";
import { loadPdfLogoDataUrl } from "./pdf-logo";
import { openPdfInBrowser, reservePdfTab } from "./open-pdf";
import { STATUS_LABELS } from "./gysh-test-plan";
import { healCursorNoteAuthor } from "./gysh-note-entries";
import {
  stampFilename,
  type FailureReportSnapshot,
  type PostFixReport,
} from "./gysh-failure-report";

function wrapLines(doc: jsPDF, text: string, maxW: number): string[] {
  return doc.splitTextToSize(String(text || "—"), maxW) as string[];
}

function buildDoc(
  title: string,
  logoDataUrl: string | undefined,
  paint: (ctx: {
    writeHeading: (text: string, size?: number) => void;
    writePara: (text: string, size?: number) => void;
  }) => void,
): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);
  const margin = PDF_MARGIN;
  const pageW = doc.internal.pageSize.getWidth();
  const contentBottom = PDF_CONTENT_BOTTOM;
  const state = { y: PDF_CONTENT_TOP };

  const ensure = (need: number) => {
    if (state.y + need <= contentBottom) return;
    doc.addPage();
    drawPdfPageChrome(doc);
    state.y = PDF_CONTENT_TOP;
  };

  const writeHeading = (text: string, size = 13) => {
    ensure(22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(45, 42, 38);
    doc.text(text, margin, state.y);
    state.y += size + 8;
  };

  const writePara = (text: string, size = 9) => {
    const lines = wrapLines(doc, text, pageW - margin * 2);
    ensure(lines.length * (size + 2) + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(45, 42, 38);
    doc.text(lines, margin, state.y);
    state.y += lines.length * (size + 2) + 6;
  };

  paint({ writeHeading, writePara });
  applyPdfPageBranding(doc, title, logoDataUrl);
  return doc;
}

export async function buildFailureReportPdf(report: FailureReportSnapshot): Promise<jsPDF> {
  const logoDataUrl = await loadPdfLogoDataUrl();
  return buildDoc("Failure Report", logoDataUrl, ({ writeHeading, writePara }) => {
    writeHeading("GYSH Failure Report", 16);
    writePara(`Generated: ${report.generatedAt}`);
    writePara(`Site: ${report.siteUrl || "—"}`);
    writePara(
      `Failed: ${report.summary.failed} · Conditional: ${report.summary.conditional} · Approved (Pass): ${report.summary.approved}`,
    );

    const sections: Array<{ title: string; rows: typeof report.failed }> = [
      { title: "1. Failed tests", rows: report.failed },
      { title: "2. Conditionally approved", rows: report.conditional },
      { title: "3. Approved tests (Pass)", rows: report.approved },
    ];

    for (const sec of sections) {
      writeHeading(`${sec.title} (${sec.rows.length})`);
      if (sec.rows.length === 0) {
        writePara("None.");
        continue;
      }
      for (const row of sec.rows) {
        writeHeading(`${row.id} — ${row.title}`, 11);
        writePara(
          `Status: ${row.statusLabel} · Priority: ${row.priority} · ${row.area} · ${row.path || "—"}`,
        );
        writePara(`Assignee: ${row.assignees} · Sprint: ${row.sprint}`);
        if (row.noteEntries.length) {
          writePara("Tester notes:");
          for (const n of row.noteEntries) {
            const author = healCursorNoteAuthor({
              author: n.author || "tester",
              text: n.text,
            }).author;
            writePara(`[${author} · ${n.updatedAt || n.createdAt}] ${n.text}`);
          }
        } else {
          writePara("Tester notes: (none)");
        }
        if (row.attachments.length) {
          writePara(
            `Attachments: ${row.attachments.map((a) => `${a.name} (${a.mimeType})`).join("; ")}`,
          );
        }
        writePara(`Expected: ${row.expected || "—"}`);
      }
    }
  });
}

export async function buildPostFixReportPdf(report: PostFixReport): Promise<jsPDF> {
  const logoDataUrl = await loadPdfLogoDataUrl();
  return buildDoc("Post-Fix Report", logoDataUrl, ({ writeHeading, writePara }) => {
    writeHeading("GYSH Post-Fix Report", 16);
    writePara(`Generated: ${report.generatedAt}`);
    writePara(`Based on Failure Report from: ${report.basedOnFailureReportAt}`);
    writePara(
      `Fixed: ${report.fixed.length} · Still open: ${report.unfixed.length} · Regressed: ${report.regressed.length}`,
    );

    const blocks: Array<{ title: string; rows: typeof report.fixed }> = [
      { title: "Fixed", rows: report.fixed },
      { title: "Could not fix / still open", rows: report.unfixed },
      { title: "Regressed (was Pass)", rows: report.regressed },
    ];

    for (const block of blocks) {
      writeHeading(`${block.title} (${block.rows.length})`);
      if (block.rows.length === 0) {
        writePara("None.");
        continue;
      }
      for (const row of block.rows) {
        writeHeading(`${row.id} — ${row.title}`, 11);
        writePara(`${STATUS_LABELS[row.priorStatus]} → ${STATUS_LABELS[row.currentStatus]}`);
        writePara(row.note || "—");
      }
    }
  });
}

export async function downloadFailureReportPdf(report: FailureReportSnapshot): Promise<string> {
  const doc = await buildFailureReportPdf(report);
  const name = stampFilename("GYSH_Failure_Report").replace(/\.md$/, ".pdf");
  doc.save(name);
  return name;
}

export async function openFailureReportPdf(report: FailureReportSnapshot): Promise<string> {
  const tab = reservePdfTab();
  const doc = await buildFailureReportPdf(report);
  const name = stampFilename("GYSH_Failure_Report").replace(/\.md$/, ".pdf");
  openPdfInBrowser(doc, name, tab);
  return name;
}

export async function downloadPostFixReportPdf(report: PostFixReport): Promise<string> {
  const doc = await buildPostFixReportPdf(report);
  const name = stampFilename("GYSH_Post_Fix_Report").replace(/\.md$/, ".pdf");
  doc.save(name);
  return name;
}

export async function openPostFixReportPdf(report: PostFixReport): Promise<string> {
  const tab = reservePdfTab();
  const doc = await buildPostFixReportPdf(report);
  const name = stampFilename("GYSH_Post_Fix_Report").replace(/\.md$/, ".pdf");
  openPdfInBrowser(doc, name, tab);
  return name;
}
