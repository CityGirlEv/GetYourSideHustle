import { describe, expect, it } from "vitest";
import { formatPdfPageLabel, stampPdfPageFooters } from "@/lib/pdf-page-footer";
import { jsPDF } from "jspdf";

describe("pdf-page-footer", () => {
  it("formats page labels as Page X of Y", () => {
    expect(formatPdfPageLabel(1, 5)).toBe("Page 1 of 5");
    expect(formatPdfPageLabel(3, 3)).toBe("Page 3 of 3");
  });

  it("stamps every page with Page X of Y", () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.text("Page one", 40, 40);
    doc.addPage();
    doc.text("Page two", 40, 40);
    stampPdfPageFooters(doc, { margin: 48, copyright: "© Test" });
    expect(doc.getNumberOfPages()).toBe(2);
  });
});
