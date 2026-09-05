/**
 * GYSH Testing Portal — Failure Report + Execute Fixes + Post-Fix Report.
 *
 * Failure report sections: Failed → Conditionally approved → Approved (Pass).
 * Full case + runtime fields so the markdown can be fed to Cursor for fixes.
 */

import {
  DEFAULT_TEST_STATUS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  SUITE_LABELS,
  TEST_CASES,
  TEST_CATEGORY_LABELS,
  TEST_FACING_LABELS,
  categoryForCase,
  facingForCase,
  withDefaultSuite,
  type GeneratedTestCase,
  type TestAttachmentMeta,
  type TestCase,
  type TestStatus,
  type TestStatusesPayload,
} from "./gysh-test-plan";
import {
  AUTOMATED_PLAYWRIGHT_CASES,
  AUTOMATED_VITEST_CASES,
  isAutomatedTestId,
  isWizardMatrixCaseId,
} from "./gysh-automated-tests";
import {
  noteEntriesPlainText,
  parseNoteEntries,
  healCursorNoteAuthor,
} from "./gysh-note-entries";
import { FAILED_TEST_ASSIGNEE, isHumanQaTesterId, testOwnerLabel } from "./gysh-roles";

export const FAILURE_REPORT_STORAGE_KEY = "gysh.qa.failureReport.v1";
/** Archive of all generated Failure / Post-Fix reports (local browser). */
export const FAILURE_REPORT_ARCHIVE_KEY = "gysh.qa.reportArchive.v1";

export type FailureReportSectionId = "failed" | "conditional" | "approved";

export type FailureReportCaseRow = {
  id: string;
  title: string;
  area: string;
  path: string;
  priority: string;
  suite: string;
  facing: string;
  category: string;
  status: TestStatus;
  statusLabel: string;
  assignees: string;
  /** Runtime assignee id for rollback restores (empty = catalog / unassigned). */
  assigneeId: string;
  originalAssignee: string;
  /** Original QA tester id (for Approve → assign back). */
  originalAssigneeId: string;
  sprint: string;
  /** Numeric sprint for rollback (0 = backlog / unset). */
  sprintNumber: number;
  dueDate: string;
  steps: string[];
  expected: string;
  failedStepIndex: number | null;
  checkedSteps: boolean[];
  /** Flattened note text (all tester entries). */
  notes: string;
  /** Raw notes payload (JSON thread or plain text) for rollback. */
  notesRaw: string;
  /** Structured tester notes with author + timestamps for fix context. */
  noteEntries: Array<{ author: string; createdAt: string; updatedAt: string; text: string }>;
  relatedTaskIds: string[];
  attachments: Array<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
    addedAt: string;
    addedBy: string;
    scanStatus: string;
  }>;
  updatedAt: string;
  updatedBy: string;
  assignedBy: string;
  dateAssigned: string;
  failureDetail?: string;
  sourceFile?: string;
  /** Suggested fix steps from generated / automated failures. */
  fixSteps?: string[];
  /** manual | vitest | playwright — for Manual vs Automated filters. */
  suiteKind: "manual" | "vitest" | "playwright";
};

export type FailureReportSnapshot = {
  generatedAt: string;
  siteUrl: string;
  summary: {
    failed: number;
    conditional: number;
    approved: number;
    totalCatalog: number;
    failedManual: number;
    failedVitest: number;
    failedPlaywright: number;
  };
  failed: FailureReportCaseRow[];
  conditional: FailureReportCaseRow[];
  approved: FailureReportCaseRow[];
};

export type PostFixOutcome = {
  id: string;
  title: string;
  priorStatus: TestStatus;
  currentStatus: TestStatus;
  kind: "fixed" | "unfixed" | "regressed";
  /** How it was fixed, or why it could not be fixed. */
  note: string;
  /** Parsed Proposed Fix sticker steps (when present on the note). */
  proposedFixSteps?: string[];
};

export type PostFixReport = {
  generatedAt: string;
  basedOnFailureReportAt: string;
  fixed: PostFixOutcome[];
  unfixed: PostFixOutcome[];
  /** Was approved in failure report but is no longer pass. */
  regressed: PostFixOutcome[];
};

const FIXABLE_PRIOR: TestStatus[] = ["fail", "conditional_approval"];
const FIXED_NOW: TestStatus[] = [
  "pass",
  "fixed_retest",
  "fixed_cursor",
  "fixed_lighthouse",
  "fixed_foresight",
];

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

export function downloadTextFile(text: string, filename: string, mime = "text/markdown;charset=utf-8") {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

export function stampFilename(prefix: string): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${prefix}_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.md`;
}

export type ReportSuiteFilter = "all" | "manual" | "automated" | "vitest" | "playwright";

export function caseSuiteKind(
  t: Pick<TestCase, "id" | "suite" | "area">,
): "manual" | "vitest" | "playwright" {
  if (t.suite === "vitest") return "vitest";
  if (t.suite === "playwright") return "playwright";
  if (/^VT-FAIL-/i.test(t.id) || t.area === "Vitest" || t.area === "Vitest Failure") {
    return "vitest";
  }
  if (/^PW-FAIL-/i.test(t.id) || t.area === "Playwright" || t.area === "Playwright Failure") {
    return "playwright";
  }
  if (isAutomatedTestId(t.id)) {
    return /^PW-/i.test(t.id) ? "playwright" : "vitest";
  }
  return "manual";
}

export function rowMatchesSuiteFilter(
  row: Pick<FailureReportCaseRow, "suiteKind">,
  filter: ReportSuiteFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "manual") return row.suiteKind === "manual";
  if (filter === "automated") return row.suiteKind === "vitest" || row.suiteKind === "playwright";
  return row.suiteKind === filter;
}

export function filterReportRows<T extends Pick<FailureReportCaseRow, "suiteKind">>(
  rows: T[],
  filter: ReportSuiteFilter,
): T[] {
  return rows.filter((r) => rowMatchesSuiteFilter(r, filter));
}

export function catalogCases(generated: GeneratedTestCase[] = []): TestCase[] {
  const base: TestCase[] = [
    ...withDefaultSuite(TEST_CASES),
    ...AUTOMATED_VITEST_CASES,
    ...AUTOMATED_PLAYWRIGHT_CASES,
  ];
  const generatedAsCases: TestCase[] = generated.map((g) => ({
    id: g.id,
    area: g.area,
    title: g.title,
    priority: g.priority,
    roles: ["admin", "qa"] as TestCase["roles"],
    assignees: [FAILED_TEST_ASSIGNEE],
    suite: g.suite,
    steps: g.steps.length ? g.steps : g.fixSteps,
    expected: g.expected,
    path: g.sourceFile || undefined,
  }));
  return [...base, ...generatedAsCases].filter((t) => !isWizardMatrixCaseId(t.id));
}

function sprintLabel(sprint: number | undefined): string {
  if (sprint == null) return "—";
  if (sprint === 0) return "Backlog";
  return `Sprint ${sprint}`;
}

function rowFromCase(
  t: TestCase,
  payload: TestStatusesPayload,
  generatedById: Map<string, GeneratedTestCase>,
): FailureReportCaseRow {
  const status = (payload.statuses[t.id] ?? DEFAULT_TEST_STATUS) as TestStatus;
  const noteRaw = payload.notes[t.id] ?? "";
  const entries = parseNoteEntries(noteRaw);
  const gen = generatedById.get(t.id);
  const assigneeRaw = payload.assignees[t.id];
  const assigneeIds =
    assigneeRaw != null && assigneeRaw !== ""
      ? [assigneeRaw]
      : t.assignees;
  const assigneeLabels =
    assigneeIds.length === 0
      ? "Unassigned"
      : assigneeIds.map((a) => testOwnerLabel(a) || a).join(", ");
  const orig = payload.originalAssignees[t.id] ?? "";
  return {
    id: t.id,
    title: t.title,
    area: t.area,
    path: t.path ?? "",
    priority: PRIORITY_LABELS[t.priority] ?? t.priority,
    suite: SUITE_LABELS[t.suite ?? "manual"] ?? t.suite ?? "manual",
    facing: TEST_FACING_LABELS[facingForCase(t)],
    category: TEST_CATEGORY_LABELS[categoryForCase(t)],
    status,
    statusLabel: STATUS_LABELS[status] ?? status,
    assignees: assigneeLabels,
    assigneeId: assigneeRaw ?? "",
    originalAssignee: orig ? testOwnerLabel(orig) || orig : "",
    originalAssigneeId: orig,
    sprint: sprintLabel(payload.sprints[t.id]),
    sprintNumber: payload.sprints[t.id] ?? 0,
    dueDate: payload.dueDates[t.id] ?? "",
    steps: t.steps,
    expected: t.expected,
    failedStepIndex: payload.failedStepIndex[t.id] ?? null,
    checkedSteps: payload.checkedSteps[t.id] ?? [],
    notes: noteEntriesPlainText(noteRaw) || noteRaw,
    notesRaw: noteRaw,
    noteEntries: entries.map((e) => ({
      author: e.author,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      text: e.text,
    })),
    relatedTaskIds: t.relatedTaskIds ?? [],
    attachments: (payload.attachments[t.id] ?? []).map((a: TestAttachmentMeta) => ({
      id: a.id,
      name: a.name,
      mimeType: a.mimeType,
      size: a.size,
      addedAt: a.addedAt,
      addedBy: a.addedBy,
      scanStatus: a.scanStatus,
    })),
    updatedAt: payload.updatedAt[t.id] ?? "",
    updatedBy: payload.updatedBy[t.id] ?? "",
    assignedBy: payload.assignedBy[t.id] ?? "",
    dateAssigned: payload.dateAssigned[t.id] ?? "",
    failureDetail: gen?.failureDetail,
    sourceFile: gen?.sourceFile,
    fixSteps: gen?.fixSteps?.length ? [...gen.fixSteps] : [],
    suiteKind: caseSuiteKind(t),
  };
}

export function buildFailureReportSnapshot(
  payload: TestStatusesPayload,
  opts?: { siteUrl?: string; generated?: GeneratedTestCase[] },
): FailureReportSnapshot {
  const generated = opts?.generated ?? payload.generatedCases ?? [];
  const genMap = new Map(generated.map((g) => [g.id, g]));
  const cases = catalogCases(generated);
  const failed: FailureReportCaseRow[] = [];
  const conditional: FailureReportCaseRow[] = [];
  const approved: FailureReportCaseRow[] = [];
  const seen = new Set<string>();

  for (const t of cases) {
    const st = (payload.statuses[t.id] ?? DEFAULT_TEST_STATUS) as TestStatus;
    const isGeneratedFail = genMap.has(t.id);
    // Generated VT-FAIL-*/PW-FAIL-* always belong on the failure report.
    const treatAsFail = st === "fail" || (isGeneratedFail && st !== "pass" && st !== "conditional_approval");
    if (!treatAsFail && st !== "conditional_approval" && st !== "pass") continue;
    const row = rowFromCase(
      t,
      treatAsFail && st !== "fail"
        ? { ...payload, statuses: { ...payload.statuses, [t.id]: "fail" } }
        : payload,
      genMap,
    );
    seen.add(t.id);
    if (treatAsFail) failed.push(row);
    else if (st === "conditional_approval") conditional.push(row);
    else approved.push(row);
  }

  // Safety: any generated case missing from catalog merge still appears under Failed.
  for (const g of generated) {
    if (seen.has(g.id) || isWizardMatrixCaseId(g.id)) continue;
    const asCase: TestCase = {
      id: g.id,
      area: g.area,
      title: g.title,
      priority: g.priority,
      roles: ["admin", "qa"],
      assignees: [FAILED_TEST_ASSIGNEE],
      suite: g.suite,
      steps: g.steps.length ? g.steps : g.fixSteps,
      expected: g.expected,
      path: g.sourceFile || undefined,
    };
    const st = (payload.statuses[g.id] ?? "fail") as TestStatus;
    if (st === "pass") continue;
    failed.push(
      rowFromCase(
        asCase,
        { ...payload, statuses: { ...payload.statuses, [g.id]: st === "conditional_approval" ? st : "fail" } },
        genMap,
      ),
    );
  }

  const byId = (a: FailureReportCaseRow, b: FailureReportCaseRow) => a.id.localeCompare(b.id);
  failed.sort(byId);
  conditional.sort(byId);
  approved.sort(byId);

  return {
    generatedAt: new Date().toISOString(),
    siteUrl: opts?.siteUrl ?? (typeof location !== "undefined" ? location.origin : ""),
    summary: {
      failed: failed.length,
      conditional: conditional.length,
      approved: approved.length,
      totalCatalog: cases.length,
      failedManual: failed.filter((r) => r.suiteKind === "manual").length,
      failedVitest: failed.filter((r) => r.suiteKind === "vitest").length,
      failedPlaywright: failed.filter((r) => r.suiteKind === "playwright").length,
    },
    failed,
    conditional,
    approved,
  };
}

function formatTesterNotesMarkdown(row: FailureReportCaseRow): string {
  const noteEntries = row.noteEntries ?? [];
  if (noteEntries.length === 0) {
    return ["", "### Tester notes (required reading before fixing)", "", "_(none)_", ""].join("\n");
  }
  const blocks = noteEntries.map((e, i) => {
    const when = e.updatedAt || e.createdAt || "—";
    const author = healCursorNoteAuthor({ author: e.author || "tester", text: e.text }).author;
    return [
      `#### Note ${i + 1} — ${author} (${when})`,
      "",
      String(e.text ?? "").trim() || "_(empty)_",
      "",
    ].join("\n");
  });
  return [
    "",
    "### Tester notes (required reading before fixing)",
    "",
    `_Read every note from the QA tester before changing code. Treat this as the defect description._`,
    "",
    ...blocks,
  ].join("\n");
}

function formatAttachmentsMarkdown(row: FailureReportCaseRow): string {
  const attachments = row.attachments ?? [];
  if (attachments.length === 0) {
    return ["", "### Attachments / evidence", "", "_(none)_", ""].join("\n");
  }
  const lines = attachments.map((a, i) => {
    const sizeKb = a.size > 0 ? `${Math.round(a.size / 1024)} KB` : "size unknown";
    return (
      `${i + 1}. **${a.name}** (\`${a.id}\`) — ${a.mimeType}; ${sizeKb}; ` +
      `added ${a.addedAt || "—"} by ${a.addedBy || "—"}; scan: ${a.scanStatus || "—"}`
    );
  });
  return [
    "",
    "### Attachments / evidence (required — open in Testing Portal if needed)",
    "",
    `_Screenshots, recordings, and docs attached by the tester. Use them to see the exact failure UI/behavior._`,
    "",
    ...lines,
    "",
    `_Attachment binary content is in GYSH D1 via Testing Portal evidence for this case id; ask the user to open the case if you need the file viewed._`,
    "",
  ].join("\n");
}

function formatCaseMarkdown(row: FailureReportCaseRow, index: number): string {
  const lines: string[] = [
    `### ${index}. \`${row.id}\` — ${row.title}`,
    "",
    `| Field | Value |`,
    `| --- | --- |`,
    `| Status | **${row.statusLabel}** (\`${row.status}\`) |`,
    `| Priority | ${row.priority} |`,
    `| Area | ${row.area} |`,
    `| Path | ${row.path || "—"} |`,
    `| Suite | ${row.suite} |`,
    `| Facing | ${row.facing} |`,
    `| Category | ${row.category} |`,
    `| Assignee(s) | ${row.assignees} |`,
    `| Original assignee | ${row.originalAssignee || "—"} |`,
    `| Sprint | ${row.sprint} |`,
    `| Due date | ${row.dueDate || "—"} |`,
    `| Updated | ${row.updatedAt || "—"} by ${row.updatedBy || "—"} |`,
    `| Assigned | ${row.dateAssigned || "—"} by ${row.assignedBy || "—"} |`,
    `| Failed step index | ${row.failedStepIndex == null ? "—" : String(row.failedStepIndex)} |`,
    `| Related tasks | ${(row.relatedTaskIds ?? []).length ? (row.relatedTaskIds ?? []).join(", ") : "—"} |`,
    `| Attachment count | ${(row.attachments ?? []).length} |`,
    `| Tester note count | ${(row.noteEntries ?? []).length} |`,
  ];
  if (row.sourceFile) lines.push(`| Source file | \`${row.sourceFile}\` |`);

  // Notes + attachments first so fix agents don't skip them.
  lines.push(formatTesterNotesMarkdown(row));
  lines.push(formatAttachmentsMarkdown(row));

  if (row.failureDetail) {
    lines.push("", "**Failure detail**", "", "```", row.failureDetail, "```");
  }
  lines.push("", "**Steps**", "");
  (row.steps ?? []).forEach((step, i) => {
    const checked = (row.checkedSteps ?? [])[i] ? "x" : " ";
    lines.push(`${i + 1}. [${checked}] ${step}`);
  });
  lines.push("", "**Expected**", "", row.expected || "—", "");
  return lines.join("\n");
}

function sectionMarkdown(title: string, rows: FailureReportCaseRow[]): string {
  if (rows.length === 0) {
    return `## ${title}\n\n_None._\n`;
  }
  return [
    `## ${title} (${rows.length})`,
    "",
    ...rows.map((r, i) => formatCaseMarkdown(r, i + 1)),
  ].join("\n");
}

/** Human-readable failure report (Failed → Conditional → Approved). */
export function failureReportToMarkdown(report: FailureReportSnapshot): string {
  return [
    `# GYSH Failure Report`,
    "",
    `Generated: ${report.generatedAt}`,
    `Site: ${report.siteUrl || "—"}`,
    "",
    `## Summary`,
    "",
    `- Failed: **${report.summary.failed}**`,
    `- Conditionally approved: **${report.summary.conditional}**`,
    `- Approved (Pass): **${report.summary.approved}**`,
    `- Catalog size (countable): ${report.summary.totalCatalog}`,
    "",
    sectionMarkdown("1. Failed tests", report.failed),
    sectionMarkdown("2. Conditionally approved", report.conditional),
    sectionMarkdown("3. Approved tests (Pass)", report.approved),
    "",
    `---`,
    `_End of Failure Report_`,
    "",
  ].join("\n");
}

/** Package for Cursor: same report + fix instructions (focus Failed + Conditional). */
export function failureReportFixPackageMarkdown(report: FailureReportSnapshot): string {
  const openCount = report.summary.failed + report.summary.conditional;
  return [
    `# GYSH Execute Fixes — Cursor package`,
    "",
    `Generated: ${report.generatedAt}`,
    `Open items to fix: **${openCount}** (Failed ${report.summary.failed} + Conditional ${report.summary.conditional})`,
    "",
    `## Instructions for Cursor`,
    "",
    `Repo: \`eager-hypatia/side-hustle-hub\` (Get Your Side Hustle / GYSH).`,
    "",
    `1. For each Failed / Conditional case, **read the tester notes first** (author + timestamps) and **review every attachment / evidence** listed — they describe what QA saw.`,
    `2. Open the case in Testing Portal if you need to view screenshot/video evidence binaries.`,
    `3. Fix what you can in code (prefer smallest correct change), matching the notes + attachments.`,
    `4. For each open item, record either:`,
    `   - **Fixed:** how you fixed it (files/approach), citing which note/attachment informed the fix, or`,
    `   - **Could not fix:** clear reason (include if notes/attachments were insufficient).`,
    `5. Do not rewrite Passed cases unless required to unblock a failure.`,
    `6. When done, produce a **Post-Fix Report** markdown with sections Fixed / Could not fix (and note any Pass regressions).`,
    `7. Ask the user to refresh Testing Portal statuses (Pass / Fixed/Re-Test / etc.) and click **Generate Post-Fix Report** to snapshot outcomes in the app.`,
    "",
    `## Fix queue (Failed + Conditional only)`,
    "",
    sectionMarkdown("Failed tests", report.failed),
    sectionMarkdown("Conditionally approved", report.conditional),
    "",
    `## Reference — Approved (Pass) at report time`,
    "",
    `_Included for context; do not treat as fix work unless a failure depends on it._`,
    "",
    sectionMarkdown("Approved tests (Pass)", report.approved),
    "",
    `---`,
    `_End of Execute Fixes package_`,
    "",
  ].join("\n");
}

export function saveFailureReportSnapshot(report: FailureReportSnapshot): void {
  try {
    localStorage.setItem(FAILURE_REPORT_STORAGE_KEY, JSON.stringify(report));
  } catch {
    /* quota / private mode */
  }
}

export function loadFailureReportSnapshot(): FailureReportSnapshot | null {
  try {
    const raw = localStorage.getItem(FAILURE_REPORT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FailureReportSnapshot;
  } catch {
    return null;
  }
}

export type StoredQaReport = {
  id: string;
  createdAt: string;
  /** Short label for tabs, e.g. "Aug 30, 2026 · 12:53 AM" */
  label: string;
  failure: FailureReportSnapshot;
  postFix: PostFixReport | null;
};

export function formatReportLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function newReportId(createdAt: string): string {
  return `rpt_${createdAt.replace(/[:.]/g, "-")}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadReportArchive(): StoredQaReport[] {
  try {
    const raw = localStorage.getItem(FAILURE_REPORT_ARCHIVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredQaReport[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((r) => r && r.id && r.failure)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

function persistArchive(reports: StoredQaReport[]): void {
  try {
    localStorage.setItem(FAILURE_REPORT_ARCHIVE_KEY, JSON.stringify(reports));
  } catch {
    /* quota */
  }
}

/** Migrate legacy single snapshot into the archive once. */
export function migrateLegacySnapshotIntoArchive(): StoredQaReport[] {
  const existing = loadReportArchive();
  if (existing.length > 0) return existing;
  const legacy = loadFailureReportSnapshot();
  if (!legacy) return [];
  const createdAt = legacy.generatedAt || new Date().toISOString();
  const entry: StoredQaReport = {
    id: newReportId(createdAt),
    createdAt,
    label: formatReportLabel(createdAt),
    failure: legacy,
    postFix: null,
  };
  persistArchive([entry]);
  return [entry];
}

/** Create a new archived Failure Report (re-run). Does not overwrite prior reports. */
export function createArchivedFailureReport(
  failure: FailureReportSnapshot,
  postFix: PostFixReport | null = null,
): StoredQaReport {
  const createdAt = failure.generatedAt || new Date().toISOString();
  const entry: StoredQaReport = {
    id: newReportId(createdAt),
    createdAt,
    label: formatReportLabel(createdAt),
    failure,
    postFix,
  };
  const next = [entry, ...loadReportArchive().filter((r) => r.id !== entry.id)];
  persistArchive(next);
  saveFailureReportSnapshot(failure);
  return entry;
}

export function updateArchivedReport(
  id: string,
  patch: Partial<Pick<StoredQaReport, "failure" | "postFix" | "label">>,
): StoredQaReport | null {
  const all = loadReportArchive();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const updated: StoredQaReport = { ...all[idx], ...patch };
  all[idx] = updated;
  persistArchive(all);
  if (patch.failure) saveFailureReportSnapshot(patch.failure);
  return updated;
}

export function deleteArchivedReport(id: string): StoredQaReport[] {
  const next = loadReportArchive().filter((r) => r.id !== id);
  persistArchive(next);
  const latest = next[0];
  if (latest) saveFailureReportSnapshot(latest.failure);
  else {
    try {
      localStorage.removeItem(FAILURE_REPORT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  return next;
}

export function getArchivedReport(id: string): StoredQaReport | null {
  return loadReportArchive().find((r) => r.id === id) ?? null;
}

function outcomeNote(
  prior: FailureReportCaseRow,
  currentStatus: TestStatus,
  currentNote: string,
  kind: PostFixOutcome["kind"],
): string {
  const plain = (currentNote || prior.notes || "").trim();
  if (kind === "fixed") {
    return plain || `Status moved from ${prior.statusLabel} → ${STATUS_LABELS[currentStatus]}.`;
  }
  if (kind === "regressed") {
    return plain || `Was Pass; now ${STATUS_LABELS[currentStatus]}.`;
  }
  return plain || `Still ${STATUS_LABELS[currentStatus]} — no fix note recorded yet.`;
}

export function buildPostFixReport(
  prior: FailureReportSnapshot,
  payload: TestStatusesPayload,
): PostFixReport {
  const openPrior = [...prior.failed, ...prior.conditional];
  const fixed: PostFixOutcome[] = [];
  const unfixed: PostFixOutcome[] = [];
  const regressed: PostFixOutcome[] = [];

  for (const row of openPrior) {
    const currentStatus = (payload.statuses[row.id] ?? DEFAULT_TEST_STATUS) as TestStatus;
    const currentNote =
      noteEntriesPlainText(payload.notes[row.id] ?? "") || payload.notes[row.id] || "";
    if (FIXED_NOW.includes(currentStatus) || currentStatus === "pass") {
      fixed.push({
        id: row.id,
        title: row.title,
        priorStatus: row.status,
        currentStatus,
        kind: "fixed",
        note: outcomeNote(row, currentStatus, currentNote, "fixed"),
        proposedFixSteps: parseProposedFixSteps(currentNote),
      });
    } else {
      unfixed.push({
        id: row.id,
        title: row.title,
        priorStatus: row.status,
        currentStatus,
        kind: "unfixed",
        note: outcomeNote(row, currentStatus, currentNote, "unfixed"),
        proposedFixSteps: [],
      });
    }
  }

  for (const row of prior.approved) {
    const currentStatus = (payload.statuses[row.id] ?? DEFAULT_TEST_STATUS) as TestStatus;
    if (currentStatus === "pass") continue;
    if (FIXABLE_PRIOR.includes(currentStatus) || currentStatus === "fail" || currentStatus === "blocked") {
      const currentNote =
        noteEntriesPlainText(payload.notes[row.id] ?? "") || payload.notes[row.id] || "";
      regressed.push({
        id: row.id,
        title: row.title,
        priorStatus: row.status,
        currentStatus,
        kind: "regressed",
        note: outcomeNote(row, currentStatus, currentNote, "regressed"),
        proposedFixSteps: [],
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    basedOnFailureReportAt: prior.generatedAt,
    fixed,
    unfixed,
    regressed,
  };
}

export function postFixReportToMarkdown(report: PostFixReport): string {
  const block = (title: string, rows: PostFixOutcome[], empty: string) => {
    if (rows.length === 0) return `## ${title}\n\n${empty}\n`;
    const body = rows
      .map(
        (r, i) =>
          `### ${i + 1}. \`${r.id}\` — ${r.title}\n\n` +
          `- Prior: ${STATUS_LABELS[r.priorStatus]} → Now: **${STATUS_LABELS[r.currentStatus]}**\n` +
          ((r.proposedFixSteps ?? []).length
            ? `- **Proposed Fix** steps:\n${(r.proposedFixSteps ?? []).map((s, n) => `  ${n + 1}. ${s}`).join("\n")}\n`
            : "") +
          `- Note: ${r.note}\n`,
      )
      .join("\n");
    return `## ${title} (${rows.length})\n\n${body}`;
  };

  return [
    `# GYSH Post-Fix Report`,
    "",
    `Generated: ${report.generatedAt}`,
    `Based on Failure Report from: ${report.basedOnFailureReportAt}`,
    "",
    `## Summary`,
    "",
    `- Fixed: **${report.fixed.length}**`,
    `- Could not fix / still open: **${report.unfixed.length}**`,
    `- Regressed (was Pass): **${report.regressed.length}**`,
    "",
    block("Fixed", report.fixed, "_None yet. Update statuses after Cursor fixes, then regenerate._"),
    block(
      "Could not fix / still open",
      report.unfixed,
      "_None — all prior failures/conditionals are resolved._",
    ),
    block("Regressed (was Pass)", report.regressed, "_None._"),
    "",
    `---`,
    `_End of Post-Fix Report_`,
    "",
  ].join("\n");
}

export type FailureReportRollbackItem = {
  caseId: string;
  title: string;
  fromStatus: TestStatus;
  toStatus: TestStatus;
  note: string;
  assignee: string;
  sprint: number;
  dueDate: string;
  checkedSteps: boolean[];
  failedStepIndex: number | null;
  stepCount: number;
};

/**
 * Cases that were Fail/Conditional in the Failure Report snapshot but have since
 * changed (typically to Pass / Fixed/*) — restore targets for "Roll back fixes".
 */
export function planFailureReportRollback(
  prior: FailureReportSnapshot,
  payload: TestStatusesPayload,
): FailureReportRollbackItem[] {
  const openPrior = [...prior.failed, ...prior.conditional];
  const items: FailureReportRollbackItem[] = [];

  for (const row of openPrior) {
    const current = (payload.statuses[row.id] ?? DEFAULT_TEST_STATUS) as TestStatus;
    if (current === row.status) continue;
    items.push({
      caseId: row.id,
      title: row.title,
      fromStatus: current,
      toStatus: row.status,
      note: row.notesRaw || row.notes || "",
      assignee: row.assigneeId || "",
      sprint: row.sprintNumber ?? 0,
      dueDate: row.dueDate || "",
      checkedSteps: row.checkedSteps ?? [],
      failedStepIndex: row.failedStepIndex ?? null,
      stepCount: (row.steps ?? []).length,
    });
  }

  return items.sort((a, b) => a.caseId.localeCompare(b.caseId));
}

export function rollbackReportToMarkdown(items: FailureReportRollbackItem[]): string {
  if (items.length === 0) {
    return [
      `# GYSH Fix Rollback`,
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
      `_Nothing to roll back — open-queue statuses already match the Failure Report snapshot._`,
      "",
    ].join("\n");
  }
  return [
    `# GYSH Fix Rollback`,
    "",
    `Generated: ${new Date().toISOString()}`,
    `Restored **${items.length}** case(s) to Failure Report statuses.`,
    "",
    ...items.map(
      (it, i) =>
        `${i + 1}. \`${it.caseId}\` — ${it.title}\n` +
        `   - ${STATUS_LABELS[it.fromStatus]} → **${STATUS_LABELS[it.toStatus]}**\n`,
    ),
    "",
    `_Tester notes / assignee / sprint / checklist restored from the Failure Report snapshot._`,
    "",
  ].join("\n");
}

export type ExecuteFixesItem = {
  caseId: string;
  title: string;
  fromStatus: TestStatus;
  /** Applied when Execute Fixes marks the case resolved by Cursor. */
  toStatus: "fixed_cursor";
  note: string;
  assignee: string;
  sprint: number;
  dueDate: string;
  stepCount: number;
  kind: "fixed";
};

export type ExecuteFixesUnfixedItem = {
  caseId: string;
  title: string;
  fromStatus: TestStatus;
  /** Keep current open status; append could-not-fix reason. */
  toStatus: TestStatus;
  note: string;
  assignee: string;
  sprint: number;
  dueDate: string;
  stepCount: number;
  kind: "unfixed";
};

export type ExecuteFixesPlan = {
  fixed: ExecuteFixesItem[];
  unfixed: ExecuteFixesUnfixedItem[];
  source: "report" | "markdown";
};

const CASE_ID_IN_MD = /`([A-Z][A-Z0-9]+(?:-[A-Z0-9]+)+)`/g;

/**
 * Parse Fixed / Could not fix sections from a Post-Fix (or Cursor) markdown file.
 * Returns case ids found under each heading block.
 */
export function parseFixOutcomeMarkdown(md: string): {
  fixedIds: string[];
  unfixedIds: Array<{ id: string; reason: string }>;
} {
  const text = String(md || "");
  const fixedIds: string[] = [];
  const unfixedIds: Array<{ id: string; reason: string }> = [];

  const sectionRe =
    /^##\s+(Fixed|Could not fix(?:\s*\/\s*still open)?|Still open|Unfixed)\b[^\n]*\n([\s\S]*?)(?=^##\s+|\Z)/gim;
  let match: RegExpExecArray | null;
  while ((match = sectionRe.exec(text)) !== null) {
    const heading = match[1]!.toLowerCase();
    const body = match[2] || "";
    const blocks = body.split(/^###\s+/m).filter(Boolean);
    const collectFixed = heading.startsWith("fixed");
    for (const block of blocks.length ? blocks : [body]) {
      CASE_ID_IN_MD.lastIndex = 0;
      const idMatch = CASE_ID_IN_MD.exec(block);
      if (!idMatch) continue;
      const id = idMatch[1]!;
      if (collectFixed) {
        if (!fixedIds.includes(id)) fixedIds.push(id);
      } else {
        const reasonLine =
          block
            .split("\n")
            .map((l) => l.replace(/^[-*]\s*/, "").trim())
            .find((l) => /could not|reason|note|still/i.test(l) || l.length > 24) ||
          "Could not fix — see Failure Report notes.";
        if (!unfixedIds.some((u) => u.id === id)) {
          unfixedIds.push({ id, reason: reasonLine.slice(0, 500) });
        }
      }
    }
    // Also catch bare `CASE-ID` lists without ### headings
    if (blocks.length === 0) {
      CASE_ID_IN_MD.lastIndex = 0;
      let idOnly: RegExpExecArray | null;
      while ((idOnly = CASE_ID_IN_MD.exec(body)) !== null) {
        const id = idOnly[1]!;
        if (collectFixed) {
          if (!fixedIds.includes(id)) fixedIds.push(id);
        } else if (!unfixedIds.some((u) => u.id === id)) {
          unfixedIds.push({ id, reason: "Could not fix — listed in imported markdown." });
        }
      }
    }
  }

  return { fixedIds, unfixedIds };
}

export { CURSOR_NOTE_AUTHOR } from "./gysh-note-entries";
const PROPOSED_FIX_STICKER = "Proposed Fix";
const PROPOSED_FIX_START = "[Proposed Fix]";
const PROPOSED_FIX_END = "[/Proposed Fix]";

const BOGUS_EXECUTE_FIX_MARKER = "Fixed/Cursor via Execute Fixes";

/** Detect greeting / paragraph defects from tester notes (Candace EMAIL / ADMIN-010 pattern). */
function notesAskGreetingParagraphFix(text: string): boolean {
  const t = text.toLowerCase();
  return (
    (/hi side hustler|hi \{\{name\}\}|after hi\b/.test(t) &&
      /new line|paragraph|capital/.test(t)) ||
    (/hi \{\{name\}\},/.test(t) && /here's|here is|you can|your /.test(t))
  );
}

/**
 * Concrete code fixes Cursor already applied (or can claim) for this Failure Report row.
 * Returns null when no real fix was applied — status must stay Fail.
 */
export function describeAppliedCodeFix(row: FailureReportCaseRow): string[] | null {
  const blob = [
    row.id,
    row.title,
    row.notes,
    ...(row.noteEntries ?? []).map((e) => e.text),
    row.area,
    row.path,
  ]
    .join("\n")
    .toLowerCase();

  const steps: string[] = [];

  if (
    notesAskGreetingParagraphFix(blob) ||
    /email-tpl-|admin-010|schedule.?suite.?reminder|parent_kid_progress|kid_login|password_reset|password_changed|parent_account_ready/i.test(
      `${row.id} ${row.title} ${row.path}`,
    )
  ) {
    if (
      notesAskGreetingParagraphFix(blob) ||
      /schedule.?suite|admin-010|email-tpl-|hi \{\{name\}\}/i.test(`${row.id} ${row.title} ${blob}`)
    ) {
      steps.push(
        "Split email greeting so subhead is only `Hi {{name}}.` (its own line).",
        "Moved the next sentence into bodyHtml as a new paragraph that starts with a capital letter (e.g. “Here's your…”).",
        "Updated defaults in functions/_lib/email-template-content.ts (and Schedule Suite fallback in email.ts).",
      );
    }
  }

  // Contact Us / copyright footer notes on email templates — brand footer already has Contact + © in email-brand.
  if (/contact us line|copyright/i.test(blob) && /email|template|admin_form|contact/i.test(blob + row.id)) {
    steps.push(
      "Verified branded email footer already includes Contact (`/contact`) and © year + site name via wrapBrandedEmail in email-brand.ts.",
      "Left Contact Us + copyright on the shared footer (all templates inherit it) rather than duplicating per-slug copy.",
    );
  }

  return steps.length ? steps : null;
}

/** Build numbered steps describing what Cursor did (or why it could not fix). */
export function buildProposedFixSteps(
  row: FailureReportCaseRow,
  opts?: {
    fromMarkdown?: boolean;
    fixApplied?: string[] | null;
    couldNotFix?: string | null;
  },
): string[] {
  const steps: string[] = [];
  const noteEntries = row.noteEntries ?? [];
  const fixApplied = opts?.fixApplied?.filter((s) => String(s || "").trim()) ?? [];
  const couldNotFix = String(opts?.couldNotFix || "").trim();

  if (noteEntries.length > 0) {
    for (const e of noteEntries) {
      const text = String(e.text || "").trim();
      if (!text) continue;
      steps.push(`Tester note (${e.author || "tester"}): “${text.slice(0, 400)}${text.length > 400 ? "…" : ""}”`);
    }
  } else if (String(row.notes || "").trim()) {
    const text = String(row.notes).trim();
    steps.push(`Tester note: “${text.slice(0, 400)}${text.length > 400 ? "…" : ""}”`);
  } else {
    steps.push("No tester notes on file — insufficient defect detail to apply a precise code fix.");
  }

  if (fixApplied.length > 0) {
    for (const s of fixApplied) steps.push(`Fix applied: ${s}`);
  } else if (couldNotFix) {
    steps.push(`Could not fix: ${couldNotFix}`);
  } else {
    steps.push(
      "Could not fix: No concrete code change was applied from this Failure Report alone — left status Fail for a real fix.",
    );
  }

  return steps;
}

/** Format a Proposed Fix sticker block for the case note thread. */
export function formatProposedFixSticker(steps: string[]): string {
  const lines = steps.map((s, i) => `${i + 1}. ${s}`);
  return [
    PROPOSED_FIX_START,
    `${PROPOSED_FIX_STICKER} — steps taken to fix:`,
    ...lines,
    PROPOSED_FIX_END,
  ].join("\n");
}

/** Extract Proposed Fix sticker steps from a note (or plain text). */
export function parseProposedFixSteps(note: string): string[] {
  const text = String(note || "");
  const blockRe = /\[Proposed Fix\]([\s\S]*?)\[\/Proposed Fix\]/i;
  const m = blockRe.exec(text);
  const body = m ? m[1]! : text;
  const steps: string[] = [];
  for (const line of body.split(/\r?\n/)) {
    const step = line.match(/^\s*\d+[.)]\s+(.+)\s*$/);
    if (step?.[1]?.trim()) steps.push(step[1].trim());
  }
  return steps;
}

function executeFixNote(
  row: FailureReportCaseRow,
  how: string,
  opts?: {
    fromMarkdown?: boolean;
    fixApplied?: string[] | null;
    couldNotFix?: string | null;
  },
): string {
  const proposedSteps = buildProposedFixSteps(row, opts);
  const sticker = formatProposedFixSticker(proposedSteps);
  return [how, "", sticker].join("\n");
}

function batchMetaFromRow(
  row: FailureReportCaseRow,
  payload: TestStatusesPayload,
): Pick<ExecuteFixesItem, "assignee" | "sprint" | "dueDate" | "stepCount"> {
  return {
    assignee: row.assigneeId || payload.assignees[row.id] || "",
    sprint: row.sprintNumber ?? payload.sprints[row.id] ?? 0,
    dueDate: row.dueDate || payload.dueDates[row.id] || "",
    stepCount: (row.steps ?? []).length,
  };
}

/**
 * Execute Fixes from the Failure Report:
 * - If Cursor has a real code fix for the tester notes → Fixed/Cursor + Cursor note with exact steps
 * - Otherwise → leave / restore Fail + Cursor note explaining why (never fake Fixed)
 * Also repairs today's bogus auto Fixed/Cursor handoffs that had no real fix.
 */
export function planExecuteFixesFromReport(
  prior: FailureReportSnapshot,
  payload: TestStatusesPayload,
): ExecuteFixesPlan {
  const openPrior = [...prior.failed, ...prior.conditional];
  const fixed: ExecuteFixesItem[] = [];
  const unfixed: ExecuteFixesUnfixedItem[] = [];

  for (const row of openPrior) {
    const current = (payload.statuses[row.id] ?? DEFAULT_TEST_STATUS) as TestStatus;
    const liveNote = String(payload.notes[row.id] ?? "");
    const applied = describeAppliedCodeFix(row);
    const meta = batchMetaFromRow(row, payload);

    if (applied && applied.length > 0) {
      if (current === "fixed_retest" && !liveNote.includes(BOGUS_EXECUTE_FIX_MARKER)) continue;
      fixed.push({
        caseId: row.id,
        title: row.title,
        fromStatus: current,
        toStatus: "fixed_cursor",
        note: executeFixNote(
          row,
          "Cursor fix from tester notes — concrete change applied; ready for Approve → Fixed/Re-Test.",
          { fixApplied: applied },
        ),
        ...meta,
        kind: "fixed",
      });
      continue;
    }

    // No real fix — keep/restore Fail (including reverting status-only Fixed/Cursor handoffs).
    const shouldRevertBogus =
      current === "fixed_cursor" ||
      (current === "pass" && liveNote.includes(BOGUS_EXECUTE_FIX_MARKER));
    const stayOpen =
      current === "fail" ||
      current === "conditional_approval" ||
      current === "blocked" ||
      shouldRevertBogus;

    if (!stayOpen) continue;

    unfixed.push({
      caseId: row.id,
      title: row.title,
      fromStatus: current,
      toStatus: row.status === "conditional_approval" ? "conditional_approval" : "fail",
      note: executeFixNote(
        row,
        shouldRevertBogus
          ? "Cursor repaired prior Execute Fixes handoff — no real code fix had been applied, so status was restored to Fail."
          : "Cursor could not apply a safe code fix from the Failure Report alone — left Fail for a real fix.",
        {
          couldNotFix: shouldRevertBogus
            ? "Earlier Fixed/Cursor was status-only. Reverted to Fail until a real code change is made."
            : "Need a specific code change matching the tester notes; auto-handoff to Fixed/Cursor is not allowed.",
        },
      ),
      ...meta,
      kind: "unfixed",
    });
  }

  return { fixed, unfixed, source: "report" };
}

/**
 * Execute Fixes from an imported Post-Fix / Cursor markdown.
 * MD "Fixed" lists only become Fixed/Cursor when describeAppliedCodeFix confirms a real code fix;
 * otherwise leave Fail. "Could not fix" stays open with a Cursor Proposed Fix note.
 */
export function planExecuteFixesFromMarkdown(
  prior: FailureReportSnapshot,
  payload: TestStatusesPayload,
  md: string,
): ExecuteFixesPlan {
  const parsed = parseFixOutcomeMarkdown(md);
  if (parsed.fixedIds.length === 0 && parsed.unfixedIds.length === 0) {
    return planExecuteFixesFromReport(prior, payload);
  }

  const byId = new Map([...prior.failed, ...prior.conditional].map((r) => [r.id, r]));
  const fixed: ExecuteFixesItem[] = [];
  const unfixed: ExecuteFixesUnfixedItem[] = [];
  const seen = new Set<string>();

  for (const id of parsed.fixedIds) {
    const row = byId.get(id);
    if (!row || seen.has(id)) continue;
    seen.add(id);
    const current = (payload.statuses[id] ?? DEFAULT_TEST_STATUS) as TestStatus;
    const applied = describeAppliedCodeFix(row);
    const meta = batchMetaFromRow(row, payload);

    if (applied && applied.length > 0) {
      if (FIXED_NOW.includes(current) || current === "pass") continue;
      fixed.push({
        caseId: id,
        title: row.title,
        fromStatus: current,
        toStatus: "fixed_cursor",
        note: executeFixNote(
          row,
          "Cursor fix from imported markdown — concrete change applied; ready for Approve → Fixed/Re-Test.",
          { fromMarkdown: true, fixApplied: applied },
        ),
        ...meta,
        kind: "fixed",
      });
      continue;
    }

    // MD claimed Fixed but no real code fix — leave / restore Fail.
    const toStatus = row.status === "conditional_approval" ? "conditional_approval" : "fail";
    if (FIXED_NOW.includes(current) || current === "pass" || current === "fail" || current === "conditional_approval") {
      unfixed.push({
        caseId: id,
        title: row.title,
        fromStatus: current,
        toStatus,
        note: executeFixNote(
          row,
          "Cursor could not apply a safe code fix — imported markdown listed Fixed, but no matching code change was applied; left Fail.",
          {
            fromMarkdown: true,
            couldNotFix:
              "Markdown marked Fixed without a concrete code change. Status stays Fail until a real fix lands.",
          },
        ),
        ...meta,
        kind: "unfixed",
      });
    }
  }

  for (const u of parsed.unfixedIds) {
    const row = byId.get(u.id);
    if (!row || seen.has(u.id)) continue;
    seen.add(u.id);
    const current = (payload.statuses[u.id] ?? row.status) as TestStatus;
    const reason = u.reason.trim() || "Could not fix — see imported markdown.";
    unfixed.push({
      caseId: u.id,
      title: row.title,
      fromStatus: current,
      toStatus: current === "pass" || FIXED_NOW.includes(current) ? row.status : current,
      note: executeFixNote(row, `Could not fix via Execute Fixes: ${reason}`, {
        fromMarkdown: true,
        couldNotFix: reason,
      }),
      ...batchMetaFromRow(row, payload),
      kind: "unfixed",
    });
  }

  return { fixed, unfixed, source: "markdown" };
}

export type ApproveFixesItem = {
  caseId: string;
  title: string;
  fromStatus: TestStatus;
  /** Always fixed_retest after approval. */
  toStatus: "fixed_retest";
  testerId: string;
  testerLabel: string;
  note: string;
  sprint: number;
  dueDate: string;
  stepCount: number;
};

/**
 * Approve code fixes: set Fixed/Re-Test and assign back to the original QA tester.
 * Targets Failure Report Fail/Conditional cases that are currently Pass or Fixed/*.
 * Pass `onlyCaseIds` to approve a subset (individual approve).
 */
export function planApproveFixesForTester(
  prior: FailureReportSnapshot,
  payload: TestStatusesPayload,
  onlyCaseIds?: string[] | null,
): ApproveFixesItem[] {
  const openPrior = [...prior.failed, ...prior.conditional];
  const allow = onlyCaseIds?.length ? new Set(onlyCaseIds) : null;
  const items: ApproveFixesItem[] = [];

  for (const row of openPrior) {
    if (allow && !allow.has(row.id)) continue;
    const current = (payload.statuses[row.id] ?? DEFAULT_TEST_STATUS) as TestStatus;
    const isFixedNow = FIXED_NOW.includes(current) || current === "pass";
    if (!isFixedNow && current !== "fixed_retest") continue;

    const liveOriginal = payload.originalAssignees[row.id] ?? "";
    const liveAssignee = payload.assignees[row.id] ?? "";
    const testerId =
      (row.originalAssigneeId || liveOriginal || "").trim() ||
      (isHumanQaTesterId(row.assigneeId) ? row.assigneeId : "") ||
      (isHumanQaTesterId(liveAssignee) ? liveAssignee : "") ||
      FAILED_TEST_ASSIGNEE;
    // Skip if already handed back as fixed_retest to the same tester
    if (current === "fixed_retest" && liveAssignee === testerId) continue;

    const approvalNote =
      `Approved fix — re-test assigned to ${testOwnerLabel(testerId) || testerId}.` +
      (row.notes ? `\n\nPrior tester notes:\n${row.notes}` : "");

    items.push({
      caseId: row.id,
      title: row.title,
      fromStatus: current,
      toStatus: "fixed_retest",
      testerId,
      testerLabel: testOwnerLabel(testerId) || testerId,
      note: approvalNote,
      sprint: row.sprintNumber ?? payload.sprints[row.id] ?? 0,
      dueDate: row.dueDate || payload.dueDates[row.id] || "",
      stepCount: (row.steps ?? []).length,
    });
  }

  return items.sort((a, b) => a.caseId.localeCompare(b.caseId));
}

export function approveFixesReportToMarkdown(items: ApproveFixesItem[]): string {
  return [
    `# GYSH Approve Fixes → Tester Re-Test`,
    "",
    `Generated: ${new Date().toISOString()}`,
    `Approved **${items.length}** fix(es); assigned back for Fixed/Re-Test.`,
    "",
    ...items.map(
      (it, i) =>
        `${i + 1}. \`${it.caseId}\` — ${it.title}\n` +
        `   - ${STATUS_LABELS[it.fromStatus]} → **Fixed/Re-Test**\n` +
        `   - Assigned to: **${it.testerLabel}** (\`${it.testerId}\`)\n`,
    ),
    "",
  ].join("\n");
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
