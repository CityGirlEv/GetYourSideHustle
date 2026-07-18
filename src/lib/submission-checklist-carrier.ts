import {
  CATRIA_SCHEDULE_START,
  EVELYN_SCHEDULE_START,
  PREP_OWNER_LABEL,
  REVIEW_OWNER_LABEL,
  addScheduleDays,
  type ChecklistOwner,
} from "@/lib/submission-checklist-data";
import mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions, type TextItem } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export interface CarrierChecklistTask {
  id: string;
  title: string;
  description: string;
  assignee: ChecklistOwner;
  dueDate: string;
  reviewDueDate: string;
  carrierName: string;
  sourceFile?: string;
  lineNumber: number;
  uploadId?: string;
}

export interface CarrierChecklistUploadMeta {
  id: string;
  carrierName: string;
  fileName?: string;
  uploadedAt: string;
  /** Total items in the original upload dump. */
  originalTaskCount: number;
  /** Items in the admin-curated saved checklist (set after first save). */
  curatedTaskCount?: number;
  curatedAt?: string;
  curatedBy?: string;
  /** @deprecated Use originalTaskCount — kept for legacy payloads. */
  taskCount?: number;
}

export function carrierUploadOriginalTaskCount(upload: CarrierChecklistUploadMeta): number {
  return upload.originalTaskCount ?? upload.taskCount ?? 0;
}

export function isCarrierUploadCurated(upload: CarrierChecklistUploadMeta): boolean {
  return typeof upload.curatedAt === "string" && upload.curatedAt.length > 0;
}

/** Saved carrier requirements across all curated uploads. */
export function countCarrierRequirements(curatedTasks: CarrierChecklistTask[]): number {
  return curatedTasks.length;
}

export function carrierUploadTabLabel(
  upload: CarrierChecklistUploadMeta,
  curatedCount?: number,
): string {
  const name = upload.carrierName.trim() || "Carrier";
  if (typeof curatedCount === "number" && curatedCount > 0) {
    return `${name} · ${curatedCount}`;
  }
  if (isCarrierUploadCurated(upload)) {
    const count = upload.curatedTaskCount ?? 0;
    return count > 0 ? `${name} · ${count}` : name;
  }
  return name;
}

export const CARRIER_CHECKLIST_FILE_ACCEPT =
  ".txt,.csv,.tsv,.pdf,.docx,text/plain,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const HEADER_PATTERN = /^(task|item|requirement|checklist|description|due date|assignee|status|notes|#)\b/i;

const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

const BOILERPLATE_LINE_PATTERN =
  /^(confidential|for internal use|copyright|all rights reserved|please contact|contact us|submitted by|prepared by|date:|re:|fwd:|fw:)\b/i;

const PAGE_NUMBER_PATTERN =
  /^(?:page\s*)?\d{1,4}\s*(?:\/|of)\s*\d{1,4}$|^page\s+\d{1,4}(?:\s+of\s+\d{1,4})?$/i;

const URL_ONLY_PATTERN = /^https?:\/\/\S+$/i;

const FRAGMENT_ONLY_PATTERN = /^[\d\s.,;:()[\]{}\-_/\\|]+$/;

/** True when a raw line is header/boilerplate noise — not a carrier deliverable. */
export function isCarrierChecklistNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("#")) return true;
  if (HEADER_PATTERN.test(trimmed) && trimmed.length < 64) return true;
  if (BOILERPLATE_LINE_PATTERN.test(trimmed)) return true;
  if (PAGE_NUMBER_PATTERN.test(trimmed)) return true;
  if (URL_ONLY_PATTERN.test(trimmed)) return true;
  if (FRAGMENT_ONLY_PATTERN.test(trimmed)) return true;
  if (EMAIL_PATTERN.test(trimmed) && trimmed.replace(EMAIL_PATTERN, "").trim().length < 12) {
    return true;
  }
  return false;
}

/** Merge PDF/word-wrapped continuations into single deliverable lines. */
export function mergeCarrierChecklistLines(lines: string[]): string[] {
  const merged: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || isCarrierChecklistNoiseLine(line)) continue;

    const parsed = parseCarrierChecklistLine(line);
    if (!parsed) {
      const prev = merged[merged.length - 1];
      if (prev && line.length < 120 && !EMAIL_PATTERN.test(line) && !URL_ONLY_PATTERN.test(line)) {
        merged[merged.length - 1] = `${prev} ${line}`.replace(/\s+/g, " ").trim();
      }
      continue;
    }

    const prev = merged[merged.length - 1];
    const isFragmentContinuation =
      prev &&
      /^[a-z]/.test(parsed) &&
      parsed.split(/\s+/).length <= 6 &&
      !/[.!?]$/.test(prev);

    if (isFragmentContinuation) {
      merged[merged.length - 1] = `${prev} ${parsed}`.replace(/\s+/g, " ").trim();
    } else {
      merged.push(parsed);
    }
  }

  return merged;
}

/** Resolve upload id for tasks saved before uploadId was persisted. */
export function resolveCarrierTaskUploadId(task: CarrierChecklistTask): string {
  if (task.uploadId) return task.uploadId;
  const match = task.id.match(/^carrier-(upload-\d+)-/);
  return match?.[1] ?? "";
}

/** Strip list markers and take first CSV/TSV column as the task title. */
export function parseCarrierChecklistLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed || isCarrierChecklistNoiseLine(trimmed)) return null;

  let text = trimmed
    .replace(/^\d+[.)-:]\s*/, "")
    .replace(/^[-*•]\s*/, "")
    .trim();

  if (text.includes("\t")) {
    text = text.split("\t")[0]?.trim() ?? text;
  } else if (text.includes(",")) {
    const parts = text.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
    text = parts.find((part) => part.length >= 2 && !EMAIL_PATTERN.test(part)) ?? parts[0] ?? text;
  }

  text = text.replace(EMAIL_PATTERN, "").replace(/\s+/g, " ").trim();
  if (!text || text.length < 2) return null;
  if (URL_ONLY_PATTERN.test(text)) return null;
  if (PAGE_NUMBER_PATTERN.test(text)) return null;
  if (FRAGMENT_ONLY_PATTERN.test(text)) return null;

  return text;
}

export function parseCarrierChecklistText(
  text: string,
  opts: {
    carrierName: string;
    sourceFile?: string;
    defaultAssignee?: ChecklistOwner;
    uploadId?: string;
  },
): CarrierChecklistTask[] {
  const carrierName = opts.carrierName.trim() || "Carrier";
  const assignee = opts.defaultAssignee ?? "both";
  const uploadId = opts.uploadId ?? `upload-${Date.now()}`;
  const rawLines = text.split(/\r?\n/);
  const deliverables = mergeCarrierChecklistLines(rawLines);
  const tasks: CarrierChecklistTask[] = [];
  let prepOffset = 0;

  for (let i = 0; i < deliverables.length; i++) {
    const title = deliverables[i]!;
    const dueDate = addScheduleDays(EVELYN_SCHEDULE_START, prepOffset);
    const reviewDueDate = addScheduleDays(CATRIA_SCHEDULE_START, prepOffset);
    prepOffset++;

    tasks.push({
      id: `carrier-${uploadId}-${tasks.length}`,
      title,
      description: `From ${carrierName} carrier checklist — ${PREP_OWNER_LABEL} delivers; ${REVIEW_OWNER_LABEL} reviews and approves.`,
      assignee,
      dueDate,
      reviewDueDate,
      carrierName,
      sourceFile: opts.sourceFile,
      lineNumber: i + 1,
      uploadId,
    });
  }

  return tasks;
}

function linesFromPdfTextItems(items: TextItem[]): string[] {
  const lineMap = new Map<number, string[]>();

  for (const item of items) {
    if (!("str" in item)) continue;
    const text = item.str.trim();
    if (!text) continue;
    const y = Math.round(item.transform[5] ?? 0);
    const bucket = lineMap.get(y) ?? [];
    bucket.push(text);
    lineMap.set(y, bucket);
  }

  return [...lineMap.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, parts]) => parts.join(" ").trim())
    .filter(Boolean);
}

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocument({ data: buffer }).promise;
  const pageLines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    pageLines.push(...linesFromPdfTextItems(content.items as TextItem[]));
  }

  return pageLines.join("\n");
}

export async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

export async function readCarrierChecklistFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".csv") || name.endsWith(".tsv")) {
    return file.text();
  }

  if (name.endsWith(".doc")) {
    throw new Error(
      "Legacy .doc files are not supported. Open the file in Word and save as .docx, then upload again.",
    );
  }

  const buffer = await file.arrayBuffer();

  if (name.endsWith(".pdf")) {
    const text = await extractPdfText(buffer);
    if (!text.trim()) {
      throw new Error(
        "No text found in PDF. Scanned/image-only PDFs need OCR before upload — try exporting as .docx or paste lines instead.",
      );
    }
    return text;
  }

  if (name.endsWith(".docx")) {
    const text = await extractDocxText(buffer);
    if (!text.trim()) {
      throw new Error("No text found in Word document.");
    }
    return text;
  }

  throw new Error("Upload a .txt, .csv, .tsv, .pdf, or .docx carrier checklist file.");
}

export function carrierAssigneeLabel(assignee: ChecklistOwner): string {
  return assignee === "prep" ? PREP_OWNER_LABEL : REVIEW_OWNER_LABEL;
}

export type CarrierCurationDraftEntry = {
  included: boolean;
};

/** Re-curate view: included when the task exists in the saved curated checklist. */
export function buildCurationDraftFromCurated(
  originalTasks: CarrierChecklistTask[],
  curatedTasks: CarrierChecklistTask[],
): Record<string, CarrierCurationDraftEntry> {
  const curatedById = new Map(curatedTasks.map((task) => [task.id, task]));
  return Object.fromEntries(
    originalTasks.map((task) => [task.id, { included: curatedById.has(task.id) }]),
  );
}

/** Pending first-time curation defaults every upload line to included (opt-out via discard). */
export function buildPendingCurationDraft(
  originalTasks: CarrierChecklistTask[],
): Record<string, CarrierCurationDraftEntry> {
  return Object.fromEntries(originalTasks.map((task) => [task.id, { included: true }]));
}

export function applyBulkCurationIncluded(
  draft: Record<string, CarrierCurationDraftEntry>,
  taskIds: Iterable<string>,
  included: boolean,
): Record<string, CarrierCurationDraftEntry> {
  const next = { ...draft };
  for (const taskId of taskIds) {
    next[taskId] = { ...(next[taskId] ?? { included: true }), included };
  }
  return next;
}

/** Whether a curation row is still included in the working checklist (default: included). */
export function isCurationTaskIncluded(
  taskId: string,
  draft: Record<string, CarrierCurationDraftEntry>,
): boolean {
  return draft[taskId]?.included ?? true;
}

/** Active curation rows — discarded (included: false) are hidden from the carrier list. */
export function filterIncludedCurationTasks(
  tasks: CarrierChecklistTask[],
  draft: Record<string, CarrierCurationDraftEntry>,
): CarrierChecklistTask[] {
  return tasks.filter((task) => isCurationTaskIncluded(task.id, draft));
}

export function resolveCurationDraftForUpload(
  persistedDraft: Record<string, CarrierCurationDraftEntry> | undefined,
  originalTasks: CarrierChecklistTask[],
  curatedTasks: CarrierChecklistTask[],
  upload: CarrierChecklistUploadMeta | undefined,
): Record<string, CarrierCurationDraftEntry> {
  if (persistedDraft) return persistedDraft;
  if (!upload || !isCarrierUploadCurated(upload)) {
    return buildPendingCurationDraft(originalTasks);
  }
  return buildCurationDraftFromCurated(originalTasks, curatedTasks);
}
