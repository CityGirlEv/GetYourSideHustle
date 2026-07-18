import type { jsPDF } from "jspdf";

export function formatPdfPageLabel(page: number, pageCount: number): string {
  return `Page ${page} of ${pageCount}`;
}

function detectFooterImageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

export interface StampPdfPageFootersOptions {
  margin: number;
  /** Footer baseline Y. Defaults to page height − 18 pt. */
  footerY?: number;
  fontSize?: number;
  textColor?: [number, number, number];
  /** Optional left-aligned footer line (e.g. copyright). */
  copyright?: string;
  /** Optional centered website host — prefer {@link drawBenchmarkPageHeader} instead to avoid footer overlap. */
  website?: string;
  /** Optional square mini logo drawn at the left of the footer band. */
  miniLogoDataUrl?: string | null;
  /** Mini logo edge length in pt (default 14). */
  miniLogoSize?: number;
}

/** Stamp "Page X of Y" (and optional copyright / mini logo) on every page after content is complete. */
export function stampPdfPageFooters(doc: jsPDF, options: StampPdfPageFootersOptions): void {
  const pageCount = doc.getNumberOfPages();
  if (pageCount === 0) return;

  const fontSize = options.fontSize ?? 8;
  const textColor = options.textColor ?? [75, 85, 99];
  const miniLogoSize = options.miniLogoSize ?? 14;

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const footerY = options.footerY ?? pageH - 18;
    const rightX = pageW - options.margin;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(...textColor);

    const pageLabel = formatPdfPageLabel(page, pageCount);
    const pageLabelWidth = doc.getTextWidth(pageLabel);

    let textLeftX = options.margin;
    if (options.miniLogoDataUrl) {
      const logoY = footerY - miniLogoSize + 2;
      try {
        doc.addImage(
          options.miniLogoDataUrl,
          detectFooterImageFormat(options.miniLogoDataUrl),
          options.margin,
          logoY,
          miniLogoSize,
          miniLogoSize,
        );
        textLeftX = options.margin + miniLogoSize + 6;
      } catch {
        /* optional logo */
      }
    }

    if (options.copyright) {
      const maxCopyrightW = Math.max(
        80,
        rightX - textLeftX - pageLabelWidth - 20,
      );
      const copyrightLine = (
        doc.splitTextToSize(options.copyright, maxCopyrightW) as string[]
      )[0];
      doc.text(copyrightLine ?? options.copyright, textLeftX, footerY);
    }

    if (options.website) {
      doc.setFont("helvetica", "bold");
      const maxWebsiteW = Math.max(
        60,
        rightX - textLeftX - pageLabelWidth - 24,
      );
      const websiteLine = (doc.splitTextToSize(options.website, maxWebsiteW) as string[])[0];
      doc.text(websiteLine ?? options.website, rightX - pageLabelWidth - 12, footerY, {
        align: "right",
      });
      doc.setFont("helvetica", "normal");
    }

    doc.text(pageLabel, rightX, footerY, { align: "right" });
  }
}
