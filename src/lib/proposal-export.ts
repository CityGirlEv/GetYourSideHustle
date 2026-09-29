import { jsPDF } from "jspdf";

export interface ProposalExportData {
  title: string;
  subtitle: string;
  preparedFor: string;
  proposalNotes: string;
  lineItems: Array<{
    id: string;
    name: string;
    description: string;
    baseAmount: number;
  }>;
  totalBasePrice: number;
  selectedDiscountTier: number;
}

/**
 * Generate and download a clean, formatted PDF version of the edited proposal directly in the browser.
 */
export function downloadProposalPdf(data: ProposalExportData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 15;
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - margin * 2;
  let y = 20;

  // Header band
  doc.setFillColor(11, 19, 43);
  doc.rect(0, 0, pageW, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("MY PLAN, NOT MY MOOD — MASTER IMPLEMENTATION PROPOSAL", margin, 9);
  doc.text("CONFIDENTIAL", pageW - margin, 9, { align: "right" });

  // Title section
  y = 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(11, 19, 43);
  doc.text(data.title || "Master Implementation Proposal", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(129, 178, 154);
  doc.text(data.subtitle || "Prepared for Angela Harris (Muntie Ev)", margin, y);
  y += 10;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // Proposal Text / Executive Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(11, 19, 43);
  doc.text("1. Executive Summary & Scope", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const cleanNotes = (data.proposalNotes || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&rarr;/g, "->");

  const splitNotes = doc.splitTextToSize(cleanNotes, contentW);
  doc.text(splitNotes, margin, y);
  y += splitNotes.length * 4 + 8;

  // Line Items Breakdown
  if (y + 40 > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage();
    y = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(11, 19, 43);
  doc.text("2. Build Phase Line Items & Investment Breakdown", margin, y);
  y += 8;

  data.lineItems.forEach((item) => {
    if (y + 16 > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.name, margin, y);

    const priceText = `$${item.baseAmount.toLocaleString()}`;
    doc.text(priceText, pageW - margin, y, { align: "right" });
    y += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const splitDesc = doc.splitTextToSize(item.description, contentW - 10);
    doc.text(splitDesc, margin + 4, y);
    y += splitDesc.length * 3.8 + 4;
  });

  // Totals & Pre-payment options
  y += 4;
  doc.setDrawColor(129, 178, 154);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  const discountedPrice = data.totalBasePrice * (1 - data.selectedDiscountTier / 100);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(11, 19, 43);
  doc.text("Total Base Buildout Investment:", margin, y);
  doc.text(`$${data.totalBasePrice.toLocaleString()}`, pageW - margin, y, { align: "right" });
  y += 6;

  doc.setFontSize(10);
  doc.setTextColor(16, 185, 129);
  doc.text(`Selected Incentive Schedule (${data.selectedDiscountTier}% Pre-Payment Discount):`, margin, y);
  doc.text(`$${discountedPrice.toLocaleString()}`, pageW - margin, y, { align: "right" });
  y += 12;

  // Footer page label
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `MY PLAN, NOT MY MOOD — Master Proposal  |  Page ${i} of ${totalPages}  |  Angela Harris (Muntie Ev)`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  doc.save("implementation_plan_muntie_ev.pdf");
}

/**
 * Generate and download a formatted Word (.docx) document of the edited proposal directly in the browser.
 */
export function downloadProposalDocx(data: ProposalExportData) {
  const cleanNotes = (data.proposalNotes || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&rarr;/g, "->");

  const discountedPrice = data.totalBasePrice * (1 - data.selectedDiscountTier / 100);

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${data.title}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1c2541; line-height: 1.6; padding: 30px; }
        h1 { color: #0b132b; font-size: 24px; margin-bottom: 4px; border-bottom: 2px solid #81b29a; padding-bottom: 8px; }
        h2 { color: #0b132b; font-size: 18px; margin-top: 24px; margin-bottom: 8px; border-left: 4px solid #81b29a; padding-left: 10px; }
        .subtitle { color: #81b29a; font-size: 14px; font-weight: bold; margin-bottom: 20px; }
        .badge { background: #fee2e2; color: #dc2626; padding: 4px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 14px; margin-bottom: 20px; }
        th { background-color: #0b132b; color: #ffffff; text-align: left; padding: 10px; font-size: 12px; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .total-box { background: #f0fdf4; border: 1px solid #10b981; padding: 16px; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="badge">CONFIDENTIAL & PROPRIETARY EXECUTIVE DELIVERABLE</div>
      <h1>${data.title || "MY PLAN, NOT MY MOOD — Master Implementation Proposal"}</h1>
      <div class="subtitle">${data.subtitle || "Prepared for Angela Harris (Muntie Ev)"}</div>

      <h2>1. Executive Summary & Brand Thesis</h2>
      <p>${cleanNotes}</p>

      <h2>2. Implementation Phase Breakdown & Pricing Schedule</h2>
      <table>
        <thead>
          <tr>
            <th>Phase / Component</th>
            <th>Description & Scope</th>
            <th style="text-align: right;">Base Investment</th>
          </tr>
        </thead>
        <tbody>
          ${data.lineItems
            .map(
              (item) => `
            <tr>
              <td><strong>${item.name}</strong></td>
              <td>${item.description}</td>
              <td style="text-align: right; font-weight: bold;">$${item.baseAmount.toLocaleString()}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div class="total-box">
        <p style="margin:0; font-size:14px;"><strong>Total Base Buildout Investment:</strong> $${data.totalBasePrice.toLocaleString()}</p>
        <p style="margin:4px 0 0 0; font-size:14px; color:#059669;"><strong>Selected Pre-Payment Tier (${data.selectedDiscountTier}% Off):</strong> $${discountedPrice.toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff" + htmlContent], {
    type: "application/msword",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "implementation_plan_muntie_ev.docx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
