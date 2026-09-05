import {
  BETA_PROGRAM_DOC_SUBTITLE,
  BETA_PROGRAM_DOC_TITLE,
  BETA_PROGRAM_EFFECTIVE,
  BETA_PROGRAM_INTRO,
  BETA_PROGRAM_SECTIONS,
  BETA_PROGRAM_WORD_FILENAME,
} from "./beta-program-doc";
import { ADMIN_EMAIL, PRODUCTION_SITE_URL, ROOT_DOMAIN, SITE_NAME } from "./site-config";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBlock(block: (typeof BETA_PROGRAM_SECTIONS)[number]["blocks"][number]): string {
  if (block.type === "p") return `<p>${escapeHtml(block.text)}</p>`;
  if (block.type === "list") {
    return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }
  const head = block.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const body = block.rows
    .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export function buildBetaProgramWordHtml(): string {
  const sections = BETA_PROGRAM_SECTIONS.map(
    (section) =>
      `<h2>${escapeHtml(section.heading)}</h2>${section.blocks.map(renderBlock).join("")}`,
  ).join("");
  const intro = BETA_PROGRAM_INTRO.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(BETA_PROGRAM_DOC_TITLE)}</title>
<!--[if gte mso 9]><xml>
<w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
</w:WordDocument>
</xml><![endif]-->
<style>
  @page WordSection1 {
    size: 8.5in 11.0in;
    margin: 1.15in 1.0in 1.0in 1.0in;
    mso-header: h1;
    mso-footer: f1;
    mso-header-margin: 0.5in;
    mso-footer-margin: 0.5in;
  }
  div.WordSection1 { page: WordSection1; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color: #2d2a26; }
  h1 { font-size: 22pt; color: #181718; margin: 0 0 6pt; }
  .kicker { font-style: italic; color: #947D64; font-size: 12pt; margin: 0 0 10pt; }
  .meta { font-size: 10pt; color: #5c4a38; margin: 0 0 16pt; }
  h2 { font-size: 14pt; color: #9B2F28; border-bottom: 1px solid #D2C8BC; padding-bottom: 4pt; margin: 18pt 0 8pt; }
  p, li { line-height: 1.35; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0 14pt; font-size: 10pt; }
  th, td { border: 1px solid #D2C8BC; padding: 6pt 8pt; vertical-align: top; }
  th { background: #F7F1E3; text-align: left; }
  #h1 { font-size: 9pt; color: #5c4a38; border-bottom: 1.5pt solid #9B2F28; padding-bottom: 4pt; }
  #f1 { font-size: 8pt; color: #5c4a38; border-top: 1pt solid #D2C8BC; padding-top: 4pt; }
</style>
</head>
<body>
<div style="mso-element:header" id="h1">
  <p>${escapeHtml(SITE_NAME)} — ${escapeHtml(BETA_PROGRAM_DOC_TITLE)} · Confidential program briefing</p>
</div>
<div style="mso-element:footer" id="f1">
  <p>${escapeHtml(ROOT_DOMAIN)} · ${escapeHtml(ADMIN_EMAIL)} · Effective ${escapeHtml(BETA_PROGRAM_EFFECTIVE)} · Page <span style="mso-field-code:' PAGE '">1</span> of <span style="mso-field-code:' NUMPAGES '">1</span></p>
</div>
<div class="WordSection1">
  <h1>${escapeHtml(BETA_PROGRAM_DOC_TITLE)}</h1>
  <p class="kicker">${escapeHtml(BETA_PROGRAM_DOC_SUBTITLE)}</p>
  <p class="meta">${escapeHtml(SITE_NAME)} · Effective ${escapeHtml(BETA_PROGRAM_EFFECTIVE)} · ${escapeHtml(PRODUCTION_SITE_URL)}</p>
  ${intro}
  ${sections}
</div>
</body>
</html>`;
}

export function downloadBetaProgramWord(): void {
  const html = buildBetaProgramWordHtml();
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = BETA_PROGRAM_WORD_FILENAME;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}
