import { WORKBOOK_PRESCRIPTIONS_SECTION_ID } from "@/lib/workbook-medication-seed";
import type { WorkbookFormState } from "@/lib/workbook-form-state";

export type WorkbookDrugListRow = {
  name: string;
  dose: string;
};

export const WORKBOOK_DRUG_LIST_TEMPLATE_CSV_URL = "/downloads/workbook-drug-list-template.csv";

const TEMPLATE_HEADER = ["Drug name", "Dosage / how often"] as const;

export function workbookDrugListTemplateRows(): string[][] {
  return [
    [...TEMPLATE_HEADER],
    ["Lisinopril", "10 mg · 1 tablet · Once daily"],
    ["Metformin", "500 mg · 1 tablet · Twice daily"],
  ];
}

export function workbookDrugListTemplateCsv(): string {
  return workbookDrugListTemplateRows()
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function triggerDownload(blob: Blob, filename: string): void {
  if (typeof document === "undefined") return;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 500);
}

export function downloadWorkbookDrugListTemplateCsv(): void {
  const csv = `\uFEFF${workbookDrugListTemplateCsv()}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, "workbook-drug-list-template.csv");
}

export async function downloadWorkbookDrugListTemplateXlsx(): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Drug list");
  for (const row of workbookDrugListTemplateRows()) {
    sheet.addRow(row);
  }
  sheet.getRow(1).font = { bold: true };
  sheet.columns = [{ width: 28 }, { width: 36 }];
  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "workbook-drug-list-template.xlsx",
  );
}

function normalizeHeader(cell: string): string {
  return cell.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseDelimitedLine(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [];
  if (trimmed.includes("\t")) {
    return trimmed.split("\t").map((part) => part.trim());
  }
  if (trimmed.includes(",")) {
    return trimmed.split(",").map((part) => part.replace(/^"|"$/g, "").trim());
  }
  return [trimmed];
}

/** Parse plain text or CSV drug list uploads. */
export function parseDrugListFromText(text: string): WorkbookDrugListRow[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const firstCells = parseDelimitedLine(lines[0]!);
  const hasHeader =
    firstCells.length >= 2 &&
    (normalizeHeader(firstCells[0]!).includes("drug") ||
      normalizeHeader(firstCells[1]!).includes("dosage") ||
      normalizeHeader(firstCells[1]!).includes("dose"));

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const rows: WorkbookDrugListRow[] = [];

  for (const line of dataLines) {
    const cells = parseDelimitedLine(line);
    if (cells.length === 0) continue;
    const name = cells[0]?.trim() ?? "";
    if (!name) continue;
    rows.push({
      name,
      dose: cells.slice(1).join(" · ").trim(),
    });
  }

  return rows;
}

export async function parseDrugListFromExcel(file: File): Promise<WorkbookDrugListRow[]> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const rows: WorkbookDrugListRow[] = [];
  let startRow = 1;
  const firstRow = sheet.getRow(1);
  const firstName = String(firstRow.getCell(1).value ?? "").trim();
  const firstDose = String(firstRow.getCell(2).value ?? "").trim();
  if (
    normalizeHeader(firstName).includes("drug") ||
    normalizeHeader(firstDose).includes("dosage") ||
    normalizeHeader(firstDose).includes("dose")
  ) {
    startRow = 2;
  }

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber < startRow) return;
    const name = String(row.getCell(1).value ?? "").trim();
    if (!name) return;
    const dose = String(row.getCell(2).value ?? "").trim();
    rows.push({ name, dose });
  });

  return rows;
}

export async function parseDrugListFromFile(file: File): Promise<WorkbookDrugListRow[]> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    return parseDrugListFromExcel(file);
  }
  const text = await file.text();
  return parseDrugListFromText(text);
}

/** Merge uploaded drug rows into workbook prescription lines. */
export function applyDrugListToWorkbookState(
  state: WorkbookFormState,
  rows: WorkbookDrugListRow[],
): WorkbookFormState {
  if (rows.length === 0) return state;
  const prefix = WORKBOOK_PRESCRIPTIONS_SECTION_ID;
  const nextLines = { ...state.lines };

  rows.forEach((row, index) => {
    nextLines[`${prefix}:drug-${index}`] = row.name;
    if (row.dose) {
      nextLines[`${prefix}:dose-${index}`] = row.dose;
    }
  });

  return { ...state, lines: nextLines };
}

export function extractDrugListFromWorkbookState(state: WorkbookFormState): WorkbookDrugListRow[] {
  const prefix = WORKBOOK_PRESCRIPTIONS_SECTION_ID;
  const rows: WorkbookDrugListRow[] = [];
  for (let index = 0; index < 100; index++) {
    const name = state.lines[`${prefix}:drug-${index}`]?.trim() ?? "";
    if (!name) break;
    rows.push({
      name,
      dose: state.lines[`${prefix}:dose-${index}`]?.trim() ?? "",
    });
  }
  return rows;
}

export function drugListToCsv(rows: WorkbookDrugListRow[]): string {
  const lines = [[...TEMPLATE_HEADER], ...rows.map((row) => [row.name, row.dose])];
  return lines
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function downloadSavedDrugListCsv(rows: WorkbookDrugListRow[], scenarioCode?: string): void {
  const suffix = scenarioCode?.trim() ? `-${scenarioCode.trim().toUpperCase()}` : "";
  const csv = `\uFEFF${drugListToCsv(rows)}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, `workbook-drug-list${suffix}.csv`);
}
