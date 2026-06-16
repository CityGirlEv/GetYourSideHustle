import { jsPDF } from "jspdf";

export const NDA_VERSION = "v1";
export const NDA_TITLE = "Get Part B Optimizer — Beta Tester Non-Disclosure Agreement";

export const NDA_BODY: string[] = [
  'This Non-Disclosure Agreement ("Agreement") is entered into between Get Part B Optimizer ("Company") and the undersigned beta tester ("Recipient") as of the date of electronic signature below.',
  "",
  '1. Confidential Information. Recipient acknowledges that during participation in the beta program, Recipient will have access to non-public information including software features, scenario data, scoring models, screenshots, roadmap materials, recommendations, pricing, and any data identified verbally or in writing as confidential (collectively, "Confidential Information").',
  "",
  "2. Obligations. Recipient agrees: (a) to hold all Confidential Information in strict confidence; (b) not to disclose, publish, post, demo, screenshot, or share any Confidential Information with any third party without prior written consent of the Company; (c) not to use Confidential Information for any purpose other than evaluating and providing feedback on the beta product; (d) to protect Confidential Information using at least the same degree of care used to protect Recipient's own confidential information, and no less than a reasonable standard of care.",
  "",
  "3. No PHI / PII Submission. Recipient will not submit Protected Health Information or any personally identifying information of real Medicare beneficiaries into the product. Test scenarios must be de-identified.",
  "",
  "4. Ownership. All Confidential Information, feedback, suggestions, and ideas Recipient provides become the property of the Company and may be used by the Company without restriction or compensation.",
  "",
  "5. Term. This Agreement remains in effect during the beta program and for two (2) years after its conclusion. The obligations of confidentiality survive termination.",
  "",
  "6. Remedies. Recipient acknowledges that breach of this Agreement may cause irreparable harm and that the Company is entitled to equitable relief, including injunction, in addition to any other available remedies.",
  "",
  "7. No License. Nothing in this Agreement grants Recipient any license or right in the Company's intellectual property, except the limited right to access the beta as authorized.",
  "",
  "8. Governing Law. This Agreement is governed by the laws of the State of Florida, without regard to conflict-of-laws principles.",
  "",
  '9. Electronic Signature. Recipient agrees that typing their full legal name and clicking "I agree and sign" constitutes a legally binding electronic signature under the U.S. E-SIGN Act.',
];

export interface NdaPdfInput {
  fullName: string;
  email: string;
  signedAt: Date;
  agreementVersion: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function buildNdaPdf(input: NdaPdfInput): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 54;
  const contentW = pageW - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(NDA_TITLE, margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`Agreement version: ${input.agreementVersion}`, margin, y);
  y += 14;
  doc.setTextColor(0);

  doc.setFontSize(10);
  for (const para of NDA_BODY) {
    if (para === "") {
      y += 6;
      continue;
    }
    const lines = doc.splitTextToSize(para, contentW);
    if (y + lines.length * 13 > pageH - margin - 120) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, margin, y);
    y += lines.length * 13 + 4;
  }

  if (y > pageH - margin - 140) {
    doc.addPage();
    y = margin;
  }
  y += 10;
  doc.setDrawColor(180);
  doc.line(margin, y, pageW - margin, y);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Electronic Signature", margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Signed name: ${input.fullName}`, margin, y);
  y += 14;
  doc.text(`Email: ${input.email}`, margin, y);
  y += 14;
  doc.text(`Signed at: ${input.signedAt.toUTCString()}`, margin, y);
  y += 14;
  if (input.ipAddress) {
    doc.text(`IP address: ${input.ipAddress}`, margin, y);
    y += 14;
  }
  if (input.userAgent) {
    const ua = doc.splitTextToSize(`User agent: ${input.userAgent}`, contentW);
    doc.text(ua, margin, y);
    y += ua.length * 13;
  }

  y += 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(
    "This document was executed electronically. The typed name above constitutes the signer's legal signature.",
    margin,
    y,
    { maxWidth: contentW },
  );

  return doc;
}
