import type { jsPDF } from "jspdf";

export const PDF_PAGE_TOP_MARGIN = 12;
export const PDF_HEADER_HEIGHT = 78;
export const PDF_HEADER_CONTENT_GAP = 18;
/** Y position where body content begins below the logo header band. */
export const PDF_CONTENT_START_Y = PDF_PAGE_TOP_MARGIN + PDF_HEADER_HEIGHT + PDF_HEADER_CONTENT_GAP;

/** Reserved space at page bottom for the two-line footer (copyright + website + page). */
export const PDF_FOOTER_RESERVE = 54;

export function pdfPageHeight(doc: jsPDF): number {
  return doc.internal.pageSize.getHeight();
}

/** Maximum Y (baseline) for body content before it would collide with the footer zone. */
export function pdfMaxContentY(doc: jsPDF): number {
  return pdfPageHeight(doc) - PDF_FOOTER_RESERVE;
}

/** Start a new page when `y + needed` would enter the footer zone. */
export function pdfEnsureVerticalSpace(
  doc: jsPDF,
  y: number,
  needed: number,
  onNewPage: () => number,
): number {
  if (y + needed <= pdfMaxContentY(doc)) return y;
  doc.addPage();
  return onNewPage();
}
