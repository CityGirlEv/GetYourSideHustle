/**
 * Canvas-free layout math for launch-guide PDFs.
 * Keep-with-next rules prevent orphaned section headings and step titles.
 */
import { PDF_CONTENT_BOTTOM } from "./pdf-branding";

/** Typography used by launch-guide PDFs (pt). */
export const LAUNCH_GUIDE_PDF_FONT = {
  h1: 18,
  h2: 13,
  body: 10.5,
  small: 9.5,
  lineH1: 22,
  lineH2: 16,
  lineBody: 13,
  lineSmall: 12,
} as const;

/** Rounded section-bar height (fill). */
export const PDF_SECTION_BAR_H = 22;
/** Y advance after drawing a section bar. */
export const PDF_SECTION_BAR_ADVANCE = 18;
/** Extra pad above the bar before measuring keep-together. */
export const PDF_SECTION_BAR_PAD = 6;

/** Body lines that must stay with a heading (professional keep-with-next). */
export const PDF_KEEP_WITH_NEXT_LINES = 2;

export const PDF_TITLE_RULE_GAP = 14;
export const PDF_CHECKBOX_BOX_LIFT = 7;

export function pdfKeepWithNextBodyNeed(
  lineHeight: number = LAUNCH_GUIDE_PDF_FONT.lineBody,
): number {
  return PDF_KEEP_WITH_NEXT_LINES * lineHeight;
}

/**
 * Space to reserve before a section bar so the heading cannot sit alone
 * at the bottom of a page.
 */
export function pdfSectionKeepTogetherNeed(): number {
  return PDF_SECTION_BAR_H + PDF_SECTION_BAR_PAD + pdfKeepWithNextBodyNeed();
}

/** Guide title + rule + first section (heading + two body lines). */
export function pdfTitleKeepTogetherNeed(titleLineCount: number, ledeLineCount = 0): number {
  const titleH = Math.max(1, titleLineCount) * LAUNCH_GUIDE_PDF_FONT.lineH1 + PDF_TITLE_RULE_GAP;
  const ledeH = ledeLineCount > 0 ? ledeLineCount * LAUNCH_GUIDE_PDF_FONT.lineBody + 8 : 0;
  return titleH + ledeH + pdfSectionKeepTogetherNeed();
}

/**
 * Numbered checkbox row: keep the title and the first description lines together.
 * Remaining description may flow to the next page.
 */
export function pdfCheckboxKeepTogetherNeed(
  primaryLineCount: number,
  secondaryKeepLines: number,
): number {
  return (
    PDF_CHECKBOX_BOX_LIFT +
    Math.max(1, primaryLineCount) * LAUNCH_GUIDE_PDF_FONT.lineBody +
    Math.max(0, secondaryKeepLines) * LAUNCH_GUIDE_PDF_FONT.lineSmall +
    6
  );
}

export function pdfWouldBreakPage(
  y: number,
  need: number,
  contentBottom: number = PDF_CONTENT_BOTTOM,
): boolean {
  return y + need > contentBottom;
}
