import type { BenchmarkWorkbookContent } from "@/lib/benchmark-workbook-content";
import type { WorkbookFormState } from "@/lib/workbook-form-state";

/** Checklist and line answers overlaid on the printable workbook template. */
export type WorkbookPdfFill = {
  checked: Record<string, boolean>;
  lines: Record<string, string>;
};

export function workbookStateToPdfFill(state: WorkbookFormState): WorkbookPdfFill {
  return { checked: state.checked, lines: state.lines };
}

export function sectionIdForWorkbookHeading(heading: string): string | null {
  const text = heading.trim();
  if (/before you compare plans/i.test(text)) return "workbook-before-compare";
  if (/questions for your review meeting/i.test(text)) return "workbook-agent-questions";
  if (/official sources to verify/i.test(text)) return "workbook-official-sources";
  return null;
}

export function isWorkbookItemChecked(
  fill: WorkbookPdfFill | undefined,
  sectionId: string,
  index: number,
): boolean {
  if (!fill) return false;
  return fill.checked[`${sectionId}:${index}`] ?? false;
}

export function workbookLineValue(fill: WorkbookPdfFill | undefined, key: string): string {
  return fill?.lines[key]?.trim() ?? "";
}

/** Ordered note lines entered under the agent-questions checklist in the report UI. */
export function agentQuestionNotes(fill: WorkbookPdfFill | undefined): string[] {
  if (!fill) return [];
  const prefix = "workbook-agent-questions:notes:line-";
  return Object.entries(fill.lines)
    .filter(([key, value]) => key.startsWith(prefix) && value.trim())
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, value]) => value.trim());
}

export function supplementDrugRows(
  fill: WorkbookPdfFill | undefined,
  sectionId = "workbook-extra-prescriptions",
): { left: string; right: string }[] {
  if (!fill) return [];
  const rows: { left: string; right: string }[] = [];
  for (let index = 0; index < 16; index += 1) {
    const left = workbookLineValue(fill, `${sectionId}:drug-${index}`);
    const right = workbookLineValue(fill, `${sectionId}:dose-${index}`);
    if (!left && !right) continue;
    rows.push({ left, right });
  }
  return rows;
}

export function supplementLineValues(
  fill: WorkbookPdfFill | undefined,
  sectionId: string,
  max = 16,
): string[] {
  if (!fill) return [];
  const values: string[] = [];
  for (let index = 0; index < max; index += 1) {
    const value = workbookLineValue(fill, `${sectionId}:line-${index}`);
    if (value) values.push(value);
  }
  return values;
}

export function workbookPdfFillFromContent(
  workbook: BenchmarkWorkbookContent,
  state: WorkbookFormState,
): WorkbookPdfFill {
  return workbookStateToPdfFill(state);
}
