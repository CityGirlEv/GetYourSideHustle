/**
 * Canonical GYSH legal disclaimer — site footer, every outbound email footer,
 * every guide/printable PDF page footer, and on-screen guide documents.
 */

import { SITE_NAME } from "./site-config";

export const LEGAL_DISCLAIMER_HEADLINE = "Your hustle, your results.";

export const LEGAL_DISCLAIMER_BODY = `Income examples, calculators, and workshop takeaways are educational illustrations only — not guarantees. Outcomes depend on your effort, skills, market, and consistency. ${SITE_NAME} does not provide financial, legal, tax, or investment advice. Consult licensed professionals before making business or money decisions.`;

export const LEGAL_DISCLAIMER_LIABILITY = `By using our platform, you agree that ${SITE_NAME} is not responsible or liable for any business losses, damages, or legal issues you may experience while building your side hustle.`;

/** Personal-use license — member guides and printables. Never stamp “AI generated”. */
export const LEGAL_COPYRIGHT_LICENSE =
  "Licensed for personal use by authorized members. Do not copy, share, resell, or republish.";

export function legalCopyrightNotice(year: number = new Date().getFullYear()): string {
  return `© ${year} ${SITE_NAME}. All rights reserved. ${LEGAL_COPYRIGHT_LICENSE}`;
}

const DISCLAIMER_MARKER = /your hustle,\s*your results/i;

export function legalDisclaimerPlainText(): string {
  return `${LEGAL_DISCLAIMER_HEADLINE} ${LEGAL_DISCLAIMER_BODY} ${LEGAL_DISCLAIMER_LIABILITY}`;
}

/** Copyright + income disclaimer for PDF wrapping (every printable page). */
export function legalDisclaimerPdfParagraphs(
  year: number = new Date().getFullYear(),
): string[] {
  return [
    legalCopyrightNotice(year),
    `${LEGAL_DISCLAIMER_HEADLINE} ${LEGAL_DISCLAIMER_BODY}`,
    LEGAL_DISCLAIMER_LIABILITY,
  ];
}

export function emailHasLegalDisclaimer(htmlOrText: string): boolean {
  return DISCLAIMER_MARKER.test(String(htmlOrText || ""));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Inner paragraph used inside the branded email footer. */
export function legalDisclaimerEmailInnerHtml(): string {
  return `<p style="margin:10px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.55;color:#8a7a68;max-width:440px;">
                <strong style="color:#6b5344;">${escapeHtml(LEGAL_DISCLAIMER_HEADLINE)}</strong>
                ${escapeHtml(LEGAL_DISCLAIMER_BODY)}
              </p>
              <p style="margin:8px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.55;color:#8a7a68;max-width:440px;">
                ${escapeHtml(LEGAL_DISCLAIMER_LIABILITY)}
              </p>`;
}

/** Standalone footer block for HTML that did not go through wrapBrandedEmail. */
export function legalDisclaimerEmailFallbackHtml(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #e2d5bc;">
  <tr><td style="padding:16px 20px;">
    ${legalDisclaimerEmailInnerHtml()}
  </td></tr>
</table>`;
}

export function appendLegalDisclaimerToEmailHtml(html: string): string {
  const raw = String(html || "");
  if (emailHasLegalDisclaimer(raw)) return raw;
  const block = legalDisclaimerEmailFallbackHtml();
  if (/<\/body>/i.test(raw)) {
    return raw.replace(/<\/body>/i, `${block}</body>`);
  }
  return raw + block;
}

export function appendLegalDisclaimerToEmailText(text: string): string {
  const raw = String(text || "");
  if (emailHasLegalDisclaimer(raw)) return raw;
  const disclaimer = legalDisclaimerPlainText();
  return raw.trim() ? `${raw.trim()}\n\n${disclaimer}` : disclaimer;
}

/** Guarantee HTML + plain-text payloads include the legal disclaimer (no duplicates). */
export function ensureEmailLegalDisclaimer(input: {
  html: string;
  text?: string;
}): { html: string; text: string } {
  const html = appendLegalDisclaimerToEmailHtml(input.html);
  const textSource =
    String(input.text || "").trim() ||
    String(input.html || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  return {
    html,
    text: appendLegalDisclaimerToEmailText(textSource),
  };
}
