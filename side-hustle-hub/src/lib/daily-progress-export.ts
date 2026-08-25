/** Download Daily Progress Report as PDF, Excel, or Word — branded GYSH exports. */

import { jsPDF } from "jspdf";
import gyshLogoUrl from "../assets/gysh-logo-rocket.png";
import { PRODUCTION_SITE_URL, ROOT_DOMAIN, SITE_NAME } from "./site-config";
import type { DailyProgressReport } from "./daily-progress-report";
import {
  PDF_CONTENT_BOTTOM,
  PDF_CONTENT_TOP,
  PDF_MARGIN,
  applyPdfPageBranding,
  drawPdfPageChrome,
  loadPdfLogoDataUrl,
} from "./pdf-branding";

export type ProgressExportFormat = "pdf" | "excel" | "word";

export type ProgressExportResult = {
  format: ProgressExportFormat;
  /** Branded HTML snapshot of the exact report (stored in D1 audit log). */
  snapshotHtml: string;
};

const SITE_URL = PRODUCTION_SITE_URL;
const SITE_HOST = ROOT_DOMAIN;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function fileStem(report: DailyProgressReport, usersLabel: string): string {
  const users = usersLabel.replace(/[^\w.+-]+/g, "_").slice(0, 40);
  return `GYSH_Daily_Progress_${report.from}_to_${report.to}_${users || "All"}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtml(s: string): string {
  return escapeXml(s);
}

type TableSection = {
  title: string;
  headers: string[];
  rows: string[][];
};

function reportTables(report: DailyProgressReport, usersLabel: string): TableSection[] {
  const overview: TableSection = {
    title: "Report overview",
    headers: ["Field", "Value"],
    rows: [
      ["Period", report.label],
      ["Users", usersLabel],
      ["View", report.viewLabel],
    ],
  };

  const summary: TableSection = {
    title: "Summary",
    headers: ["Metric", "Value"],
    rows: [
      ["Tasks touched", String(report.tasks.length)],
      ...report.taskBuckets.map((b) => [`Tasks · ${b.label}`, String(b.count)]),
      ["Tests touched", String(report.tests.length)],
      ...report.testBuckets.map((b) => [`Tests · ${b.label}`, String(b.count)]),
      ["Timesheet total", report.timeLabel],
      ...report.timeByPerson.map((p) => [`Time · ${p.name}`, p.label]),
      [
        "Open tasks",
        `in progress ${report.openTasks.inProgress}, blocked ${report.openTasks.blocked}, not started ${report.openTasks.notStarted}`,
      ],
      [
        "Open tests",
        `in progress ${report.openTests.inProgress}, blocked ${report.openTests.blocked}, fail ${report.openTests.fail}`,
      ],
    ],
  };

  const sections: TableSection[] = [overview, summary];

  if (report.tasks.length > 0) {
    sections.push({
      title: "Task activity",
      headers: ["ID", "Title", "Sprint", "Status", "Assignee", "When"],
      rows: report.tasks.map((t) => [
        t.id,
        t.title,
        t.sprintLabel,
        t.statusLabel,
        t.assignee,
        t.when,
      ]),
    });
  }

  if (report.tests.length > 0) {
    sections.push({
      title: "Test activity",
      headers: ["ID", "Title", "Sprint", "Status", "Assignee", "When"],
      rows: report.tests.map((t) => [
        t.id,
        t.title,
        t.sprintLabel,
        t.statusLabel,
        t.assignee,
        t.when,
      ]),
    });
  }

  return sections;
}

function htmlTable(section: TableSection): string {
  const head = section.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const body = section.rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
    )
    .join("");
  return `<h2>${escapeHtml(section.title)}</h2>
<table class="report-table">
  <thead><tr>${head}</tr></thead>
  <tbody>${body || `<tr><td colspan="${section.headers.length}">None</td></tr>`}</tbody>
</table>`;
}

let logoDataUrlCache: string | undefined;

async function loadLogoDataUrl(): Promise<string | undefined> {
  if (logoDataUrlCache) return logoDataUrlCache;
  try {
    const res = await fetch(gyshLogoUrl);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    logoDataUrlCache = dataUrl;
    return dataUrl;
  } catch {
    return undefined;
  }
}

/** Branded HTML document used for Word download + D1 audit snapshot link. */
export function buildDailyProgressSnapshotHtml(
  report: DailyProgressReport,
  usersLabel: string,
  opts?: { logoDataUrl?: string; formatNote?: string },
): string {
  const logoSrc = opts?.logoDataUrl || `${SITE_URL}/brand/gysh-logo-rocket.png`;
  const tablesHtml = reportTables(report, usersLabel).map(htmlTable).join("\n");
  const formatNote = opts?.formatNote
    ? `<p style="color:#8B6914;font-size:12px;margin:0 0 10px;">Exported as ${escapeHtml(opts.formatNote)}</p>`
    : "";

  // Word-compatible repeating header/footer via Office XML + CSS @page fallback.
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:w="urn:schemas-microsoft-com:office:word"
 xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>GYSH Daily Progress Report</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page {
    margin: 1.1in 0.75in 0.9in 0.75in;
    mso-header: h1;
    mso-footer: f1;
    mso-header-margin: 0.4in;
    mso-footer-margin: 0.4in;
  }
  body { font-family: Calibri, Arial, sans-serif; color: #181718; margin: 0; }
  h1 { color: #9B2F28; font-size: 22px; margin: 8px 0 6px; }
  h2 { color: #8B6914; font-size: 15px; margin: 22px 0 8px; text-transform: uppercase; letter-spacing: 0.04em; }
  .brand-bar { border-bottom: 3px solid #9B2F28; padding-bottom: 12px; margin-bottom: 16px; }
  .meta { color: #6B5344; font-size: 13px; margin: 0 0 4px; }
  table.report-table {
    width: 100%; border-collapse: collapse; margin: 0 0 8px;
    font-size: 12px;
  }
  table.report-table th, table.report-table td {
    border: 1px solid #D7C697; padding: 6px 8px; text-align: left; vertical-align: top;
  }
  table.report-table th {
    background: #F7F1E3; color: #6B5344; font-weight: 700;
  }
  table.report-table tr:nth-child(even) td { background: #FCFaf4; }
  .header-table, .footer-table { width: 100%; border-collapse: collapse; }
  .header-table td, .footer-table td { border: none; padding: 2px 0; vertical-align: middle; }
  .footer-line { border-top: 2px solid #D7C697; padding-top: 6px; color: #6B5344; font-size: 11px; }
</style>
</head>
<body>
  <div style="mso-element:header" id="h1">
    <table class="header-table">
      <tr>
        <td style="width:90px;">
          <img src="${logoSrc}" alt="${escapeHtml(SITE_NAME)}" width="72" height="auto" />
        </td>
        <td>
          <div style="color:#9B2F28;font-weight:700;font-size:14px;">GYSH Daily Progress Report</div>
          <div style="color:#6B5344;font-size:11px;">${escapeHtml(report.label)} · ${escapeHtml(usersLabel)}</div>
        </td>
      </tr>
    </table>
    <div style="border-bottom:2px solid #9B2F28;margin-top:6px;"></div>
  </div>
  <div style="mso-element:footer" id="f1">
    <div class="footer-line">
      <table class="footer-table">
        <tr>
          <td style="text-align:left;">${escapeHtml(SITE_HOST)}</td>
          <td style="text-align:center;">${escapeHtml(SITE_NAME)}</td>
          <td style="text-align:right;">Page <span style="mso-field-code:' PAGE '">1</span> of <span style="mso-field-code:' NUMPAGES '">1</span></td>
        </tr>
      </table>
    </div>
  </div>

  <div class="brand-bar">
    <img src="${logoSrc}" alt="${escapeHtml(SITE_NAME)}" width="120" style="display:block;margin:0 0 12px;" />
    <h1>GYSH Daily Progress Report</h1>
    <p class="meta">${escapeHtml(SITE_NAME)} · ${escapeHtml(report.label)} · ${escapeHtml(usersLabel)}</p>
    ${formatNote}
  </div>
  ${tablesHtml}
</body>
</html>`;
}

function drawPdfTable(
  doc: jsPDF,
  section: TableSection,
  opts: {
    margin: number;
    pageW: number;
    pageH: number;
    contentTop: number;
    contentBottom: number;
    y: number;
    onNewPage: () => void;
  },
): number {
  const { margin, pageW, contentTop, contentBottom } = opts;
  let y = opts.y;
  const maxW = pageW - margin * 2;
  const colCount = Math.max(1, section.headers.length);
  const colW = maxW / colCount;
  const pad = 4;
  const fontSize = colCount > 4 ? 8 : 9;
  const headerSize = 10;

  const ensureSpace = (need: number) => {
    if (y + need > contentBottom) {
      opts.onNewPage();
      y = contentTop;
    }
  };

  ensureSpace(28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(139, 105, 20);
  doc.text(section.title, margin, y);
  y += 16;

  const rowHeight = (cells: string[], bold: boolean): number => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? headerSize : fontSize);
    let h = 14;
    for (const cell of cells) {
      const lines = doc.splitTextToSize(cell || "—", colW - pad * 2) as string[];
      h = Math.max(h, lines.length * ((bold ? headerSize : fontSize) + 2) + pad * 2);
    }
    return h;
  };

  const paintRow = (cells: string[], bold: boolean, fill: [number, number, number] | null) => {
    const h = rowHeight(cells, bold);
    ensureSpace(h + 2);
    if (fill) {
      doc.setFillColor(...fill);
      doc.rect(margin, y, maxW, h, "F");
    }
    doc.setDrawColor(215, 198, 151);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, maxW, h, "S");
    for (let i = 1; i < colCount; i += 1) {
      const x = margin + colW * i;
      doc.line(x, y, x, y + h);
    }
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? headerSize : fontSize);
    doc.setTextColor(24, 23, 24);
    for (let i = 0; i < colCount; i += 1) {
      const text = cells[i] ?? "";
      const lines = doc.splitTextToSize(text || "—", colW - pad * 2) as string[];
      let ty = y + pad + (bold ? headerSize : fontSize);
      for (const line of lines) {
        doc.text(line, margin + colW * i + pad, ty);
        ty += (bold ? headerSize : fontSize) + 2;
      }
    }
    y += h;
  };

  paintRow(section.headers, true, [247, 241, 227]);
  section.rows.forEach((row, idx) => {
    paintRow(row, false, idx % 2 === 1 ? [252, 250, 244] : null);
  });
  if (section.rows.length === 0) {
    paintRow(
      section.headers.map(() => "None"),
      false,
      null,
    );
  }
  y += 10;
  return y;
}

export async function downloadDailyProgressPdf(
  report: DailyProgressReport,
  usersLabel: string,
): Promise<ProgressExportResult> {
  const logoDataUrl = await loadPdfLogoDataUrl();
  const snapshotHtml = buildDailyProgressSnapshotHtml(report, usersLabel, {
    logoDataUrl,
    formatNote: "PDF",
  });

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  drawPdfPageChrome(doc);
  const margin = PDF_MARGIN;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentTop = PDF_CONTENT_TOP;
  const contentBottom = PDF_CONTENT_BOTTOM;
  let y = contentTop;

  for (const section of reportTables(report, usersLabel)) {
    y = drawPdfTable(doc, section, {
      margin,
      pageW,
      pageH,
      contentTop,
      contentBottom,
      y,
      onNewPage: () => {
        doc.addPage();
        drawPdfPageChrome(doc);
      },
    });
  }

  applyPdfPageBranding(doc, "Daily Progress Report", logoDataUrl);
  doc.save(`${fileStem(report, usersLabel)}.pdf`);
  return { format: "pdf", snapshotHtml };
}

/** Excel-compatible SpreadsheetML (.xls) — branded header + footer. */
function sheetRowsXml(rows: string[][]): string {
  return rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => `<Cell><Data ss:Type="String">${escapeXml(String(cell))}</Data></Cell>`)
          .join("")}</Row>`,
    )
    .join("");
}

function brandHeaderRows(report: DailyProgressReport, usersLabel: string): string[][] {
  return [
    [SITE_NAME],
    [SITE_HOST],
    ["GYSH Daily Progress Report"],
    ["Period", report.label],
    ["Users", usersLabel],
    ["View", report.viewLabel],
    [],
  ];
}

function brandFooterRows(): string[][] {
  return [[], ["—"], [SITE_NAME], [SITE_HOST], ["Page numbers available in PDF/Word print view"]];
}

function sheetName(title: string): string {
  return title.replace(/[\\/*?:\[\]]/g, "").slice(0, 31) || "Sheet";
}

export async function downloadDailyProgressExcel(
  report: DailyProgressReport,
  usersLabel: string,
): Promise<ProgressExportResult> {
  const logoDataUrl = await loadLogoDataUrl();
  const snapshotHtml = buildDailyProgressSnapshotHtml(report, usersLabel, {
    logoDataUrl,
    formatNote: "Excel",
  });

  const brandRows = brandHeaderRows(report, usersLabel);
  // Freeze below brand block + column header row
  const freezeAt = brandRows.length + 1;

  const sections = reportTables(report, usersLabel);
  const worksheets = sections
    .map((section) => {
      const rows: string[][] = [
        ...brandRows,
        section.headers,
        ...section.rows,
        ...brandFooterRows(),
      ];
      return `  <Worksheet ss:Name="${escapeXml(sheetName(section.title))}">
    <Names>
      <NamedRange ss:Name="_FilterDatabase" ss:RefersTo="='${escapeXml(sheetName(section.title))}'!R${freezeAt}C1:R${freezeAt}C${section.headers.length}" ss:Hidden="1"/>
    </Names>
    <Table>${sheetRowsXml(rows)}</Table>
    <WorksheetOptions>
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>${freezeAt}</SplitHorizontal>
      <TopRowBottomPane>${freezeAt}</TopRowBottomPane>
      <ActivePane>2</ActivePane>
      <Print>
        <ValidPrinterInfo/>
        <HorizontalResolution>600</HorizontalResolution>
        <VerticalResolution>600</VerticalResolution>
      </Print>
      <PageSetup>
        <Header x:Margin="0.3" x:Data="&amp;L${escapeXml(SITE_NAME)}&amp;CGYSH Daily Progress Report&amp;R${escapeXml(report.label)}"/>
        <Footer x:Margin="0.3" x:Data="&amp;L${escapeXml(SITE_HOST)}&amp;C${escapeXml(SITE_NAME)}&amp;RPage &amp;P of &amp;N"/>
      </PageSetup>
    </WorksheetOptions>
  </Worksheet>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:x="urn:schemas-microsoft-com:office:excel">
  <Styles>
    <Style ss:ID="Brand"><Font ss:Bold="1" ss:Color="#9B2F28" ss:Size="14"/></Style>
    <Style ss:ID="Muted"><Font ss:Color="#6B5344" ss:Size="10"/></Style>
  </Styles>
${worksheets}
</Workbook>`;

  downloadBlob(
    new Blob([xml], { type: "application/vnd.ms-excel" }),
    `${fileStem(report, usersLabel)}.xls`,
  );
  return { format: "excel", snapshotHtml };
}

export async function downloadDailyProgressWord(
  report: DailyProgressReport,
  usersLabel: string,
): Promise<ProgressExportResult> {
  const logoDataUrl = await loadLogoDataUrl();
  const snapshotHtml = buildDailyProgressSnapshotHtml(report, usersLabel, {
    logoDataUrl,
    formatNote: "Word",
  });

  downloadBlob(
    new Blob(["\ufeff", snapshotHtml], { type: "application/msword" }),
    `${fileStem(report, usersLabel)}.doc`,
  );
  return { format: "word", snapshotHtml };
}
