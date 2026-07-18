import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import { downloadBlobFile } from "@/lib/article-authoring";
import { drawBenchmarkPageHeader } from "@/lib/benchmark-pdf";
import { formatCmsLandscapeLastLoadedNote } from "@/lib/cms-landscape";
import { formatSiteCopyright } from "@/lib/medicare-disclaimers";
import {
  PDF_CONTENT_START_Y,
  pdfEnsureVerticalSpace,
  pdfMaxContentY,
} from "@/lib/pdf-layout";
import { stampPdfPageFooters } from "@/lib/pdf-page-footer";
import { BENCHMARK_TOOL_NAME } from "@/lib/plan-comparison-copy";
import { PUBLIC_WEBSITE_HOST } from "@/lib/site-url";
import type { ZipCountyPlansReport } from "@/lib/zip-county-plans-report";

const MARGIN = 48;
const INK: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [75, 85, 99];
const BRAND: [number, number, number] = [0, 40, 112];

export type ZipCountyPlansPdfOptions = {
  logoDataUrl?: string | null;
  miniLogoDataUrl?: string | null;
};

function splitText(doc: jsPDF, text: string, maxW: number): string[] {
  return doc.splitTextToSize(text, maxW) as string[];
}

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function onNewPage(doc: jsPDF, logoDataUrl?: string | null): number {
  drawBenchmarkPageHeader(doc, doc.internal.pageSize.getWidth(), MARGIN, logoDataUrl);
  return PDF_CONTENT_START_Y;
}

export function buildZipCountyPlansPdf(
  report: ZipCountyPlansReport,
  options: ZipCountyPlansPdfOptions = {},
): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - MARGIN * 2;

  drawBenchmarkPageHeader(doc, pageW, MARGIN, options.logoDataUrl);
  let y = PDF_CONTENT_START_Y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...BRAND);
  doc.text("ZIP / County Plans Report", MARGIN, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(
    report.inputMode === "zip3"
      ? `ZIP prefix ${report.zip3}`
      : `ZIP ${report.zipCode} (prefix ${report.zip3}xx)`,
    MARGIN,
    y,
  );
  y += 14;
  doc.setTextColor(...MUTED);
  doc.text(
    `${report.counties.length} ${report.counties.length === 1 ? "county" : "counties"} · ${report.totalPlans} total plans`,
    MARGIN,
    y,
  );
  y += 14;
  doc.text(formatCmsLandscapeLastLoadedNote(), MARGIN, y);
  y += 20;

  for (const entry of report.counties) {
    y = pdfEnsureVerticalSpace(doc, y, 60, () => onNewPage(doc, options.logoDataUrl));

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND);
    doc.text(`${entry.countyLabel} (${entry.totalPlans} plans)`, MARGIN, y);
    y += 16;

    for (const group of entry.groups) {
      y = pdfEnsureVerticalSpace(doc, y, 40, () => onNewPage(doc, options.logoDataUrl));

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      doc.text(`${group.label} (${group.plans.length})`, MARGIN + 8, y);
      y += 12;

      const rows = group.plans.slice(0, 40).map((plan) => [
        plan.carrier,
        plan.plan,
        plan.planType,
        formatUsd(plan.monthly),
        plan.stars,
      ]);

      autoTable(doc, {
        startY: y,
        margin: { left: MARGIN + 8, right: MARGIN },
        head: [["Carrier", "Plan", "Type", "Premium/mo", "Stars"]],
        body: rows,
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 3, textColor: INK },
        headStyles: { fillColor: [239, 246, 255], textColor: BRAND, fontStyle: "bold" },
        didDrawPage: () => {
          drawBenchmarkPageHeader(doc, pageW, MARGIN, options.logoDataUrl);
        },
      });

      y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
      y += 10;

      if (group.plans.length > 40) {
        y = pdfEnsureVerticalSpace(doc, y, 14, () => onNewPage(doc, options.logoDataUrl));
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        const note = splitText(
          doc,
          `… and ${group.plans.length - 40} more ${group.label} plans (truncated for PDF).`,
          contentW - 8,
        );
        doc.text(note, MARGIN + 8, y);
        y += note.length * 10 + 6;
      }
    }

    y += 8;
  }

  y = pdfEnsureVerticalSpace(doc, y, 40, () => onNewPage(doc, options.logoDataUrl));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const disclaimer = splitText(
    doc,
    `${BENCHMARK_TOOL_NAME} — educational plan inventory only, not an enrollment offer. Verify availability with carriers before quoting.`,
    contentW,
  );
  for (const line of disclaimer) {
    if (y > pdfMaxContentY(doc)) {
      y = onNewPage(doc, options.logoDataUrl);
    }
    doc.text(line, MARGIN, y);
    y += 10;
  }

  stampPdfPageFooters(doc, {
    margin: MARGIN,
    copyright: formatSiteCopyright(),
    website: PUBLIC_WEBSITE_HOST,
    miniLogoDataUrl: options.miniLogoDataUrl,
  });

  return doc;
}

export function zipCountyPlansPdfFilename(zipCode: string): string {
  return `zip-county-plans-${zipCode}.pdf`;
}

export function zipCountyPlansPdfBlob(doc: jsPDF): Blob {
  return doc.output("blob");
}

export async function downloadZipCountyPlansPdf(
  report: ZipCountyPlansReport,
  options: ZipCountyPlansPdfOptions = {},
): Promise<void> {
  const doc = buildZipCountyPlansPdf(report, options);
  downloadBlobFile(zipCountyPlansPdfFilename(report.zipCode), zipCountyPlansPdfBlob(doc));
}
