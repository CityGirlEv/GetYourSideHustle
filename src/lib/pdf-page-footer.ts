import type { jsPDF } from "jspdf";

export function formatPdfPageLabel(page: number, pageCount: number): string {
  return `Page ${page} of ${pageCount}`;
}

export interface StampPdfPageFootersOptions {
  margin: number;
  /** Footer baseline Y. Defaults to page height − 18 pt. */
  footerY?: number;
  fontSize?: number;
  textColor?: [number, number, number];
  /** Optional left-aligned footer line (e.g. copyright). */
  copyright?: string;
}

/** Stamp "Page X of Y" (and optional copyright) on every page after content is complete. */
export function stampPdfPageFooters(doc: jsPDF, options: StampPdfPageFootersOptions): void {
  const pageCount = doc.getNumberOfPages();
  if (pageCount === 0) return;

  const fontSize = options.fontSize ?? 8;
  const textColor = options.textColor ?? [75, 85, 99];

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const footerY = options.footerY ?? pageH - 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...textColor);

    if (options.copyright) {
      doc.text(options.copyright, options.margin, footerY);
    }

    doc.text(formatPdfPageLabel(page, pageCount), pageW - options.margin, footerY, {
      align: "right",
    });
  }
}
