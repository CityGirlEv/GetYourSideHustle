import type { CarrierChecklistTask, CarrierChecklistUploadMeta } from "@/lib/submission-checklist-carrier";
import { syncCarrierReviewToMainChecklist } from "@/lib/submission-checklist-carrier-sync";
import {
  mergeMetaAdConformanceRecords,
  parseMetaAdConformanceRecords,
  removeMetaAdConformanceRecord,
  upsertMetaAdConformanceRecord,
  type MetaAdChecklistItemProgress,
  type MetaAdConformanceRecord,
} from "@/lib/submission-checklist-meta-ads";
import {
  SUBMISSION_CHECKLIST_ID,
  siteVerifiedChecklistIds,
  isChecklistItemStatus,
  PREP_OWNER_LABEL,
  REVIEW_OWNER_LABEL,
  type CatriaTaskFlags,
  type ChecklistItemStatus,
  type ChecklistOwner,
  type ItemPersonStatuses,
} from "@/lib/submission-checklist-data";

const STORAGE_KEY = SUBMISSION_CHECKLIST_ID;
const LEGACY_KEYS = ["pbo-submission-checklist-v1", "pbo-submission-checklist-v2", "pbo-submission-checklist-v3"];

export type SubmissionChecklistState = {
  completed: Record<string, boolean>;
  catriaReviewed: Record<string, boolean>;
  catriaApproved: Record<string, boolean>;
  /** Admin toggles — drop Catria Review or Approve per checklist item. */
  catriaTaskFlags: Record<string, Partial<CatriaTaskFlags>>;
  /** Per-item assignee override — defaults to both when unset. */
  itemAssignees: Record<string, ChecklistOwner>;
  /** Per-submission-task assignee override. */
  submissionTaskAssignees: Record<string, ChecklistOwner>;
  /** Workflow status for every checklist row (main, submissions, carrier). */
  itemStatuses: Record<string, ChecklistItemStatus>;
  /** Per-person workflow status — prep (Evelyn) and review (Catria) slots per item id. */
  personStatuses: Record<string, ItemPersonStatuses>;
  itemNotes: Record<string, string>;
  sectionNotes: Record<string, string>;
  submissionTasks: Record<string, boolean>;
  submissionTaskReviewed: Record<string, boolean>;
  submissionTaskApproved: Record<string, boolean>;
  submissionCatriaTaskFlags: Record<string, Partial<CatriaTaskFlags>>;
  submissionTaskNotes: Record<string, string>;
  carrierTasks: CarrierChecklistTask[];
  /** Full read-only dump for every carrier upload — never trimmed after curation. */
  carrierOriginalTasks: CarrierChecklistTask[];
  carrierTaskDone: Record<string, boolean>;
  carrierTaskReviewed: Record<string, boolean>;
  carrierTaskApproved: Record<string, boolean>;
  carrierCatriaTaskFlags: Record<string, Partial<CatriaTaskFlags>>;
  carrierTaskNotes: Record<string, string>;
  carrierUploads: CarrierChecklistUploadMeta[];
  metaAdConformanceRecords: MetaAdConformanceRecord[];
  updatedAt: string;
};

function emptyState(): SubmissionChecklistState {
  return {
    completed: {},
    catriaReviewed: {},
    catriaApproved: {},
    catriaTaskFlags: {},
    itemAssignees: {},
    submissionTaskAssignees: {},
    itemStatuses: {},
    personStatuses: {},
    itemNotes: {},
    sectionNotes: {},
    submissionTasks: {},
    submissionTaskReviewed: {},
    submissionTaskApproved: {},
    submissionCatriaTaskFlags: {},
    submissionTaskNotes: {},
    carrierTasks: [],
    carrierOriginalTasks: [],
    carrierTaskDone: {},
    carrierTaskReviewed: {},
    carrierTaskApproved: {},
    carrierCatriaTaskFlags: {},
    carrierTaskNotes: {},
    carrierUploads: [],
    metaAdConformanceRecords: [],
    updatedAt: new Date().toISOString(),
  };
}

export function emptySubmissionChecklistState(): SubmissionChecklistState {
  const state = emptyState();
  state.completed = seedSiteVerified(state.completed);
  return state;
}

/** Fully cleared state — no site-verified seeding (used by Clear all). */
export function clearedSubmissionChecklistState(): SubmissionChecklistState {
  return {
    ...emptyState(),
    updatedAt: new Date().toISOString(),
  };
}

/** True when checklist progress fields match a Clear-all wipe (no seeded site-verified defaults). */
export function isSubmissionChecklistProgressCleared(state: SubmissionChecklistState): boolean {
  const cleared = clearedSubmissionChecklistState();
  return (
    submissionChecklistSyncFingerprint({
      ...state,
      updatedAt: cleared.updatedAt,
    }) === submissionChecklistSyncFingerprint(cleared)
  );
}

/** On load, keep an intentional Clear-all local draft instead of merging stale server checkboxes. */
export function coalesceSubmissionChecklistStatesOnLoad(
  server: SubmissionChecklistState | null,
  local: SubmissionChecklistState,
): SubmissionChecklistState {
  if (!server) return local;
  if (isSubmissionChecklistProgressCleared(local)) return local;
  return mergeSubmissionChecklistStates(server, local);
}

function mergeBoolRecords(...records: Record<string, boolean>[]): Record<string, boolean> {
  const merged: Record<string, boolean> = {};
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      if (value === true) {
        merged[key] = true;
      } else if (value === false) {
        // Persist explicit false (e.g. intentional uncheck of site-verified items).
        merged[key] = false;
      }
    }
  }
  return merged;
}

/**
 * Encode absent keys as explicit false when they were checked in the last server baseline.
 * Local unchecks delete keys; server merge only clears on false, not absence.
 */
export function materializeBoolRecordDeletionsForMerge(
  current: Record<string, boolean>,
  baseline: Record<string, boolean>,
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(current)) {
    if (value === true) {
      result[key] = true;
    } else if (value === false) {
      result[key] = false;
    }
  }
  for (const [key, value] of Object.entries(baseline)) {
    if (value === true && current[key] !== true) {
      result[key] = false;
    }
  }
  return result;
}

function materializeSubmissionChecklistBoolDeletionsForMerge(
  state: SubmissionChecklistState,
  baseline: SubmissionChecklistState,
): SubmissionChecklistState {
  return {
    ...state,
    completed: materializeBoolRecordDeletionsForMerge(state.completed, baseline.completed),
    catriaReviewed: materializeBoolRecordDeletionsForMerge(
      state.catriaReviewed,
      baseline.catriaReviewed,
    ),
    catriaApproved: materializeBoolRecordDeletionsForMerge(
      state.catriaApproved,
      baseline.catriaApproved,
    ),
    submissionTasks: materializeBoolRecordDeletionsForMerge(
      state.submissionTasks,
      baseline.submissionTasks,
    ),
    submissionTaskReviewed: materializeBoolRecordDeletionsForMerge(
      state.submissionTaskReviewed,
      baseline.submissionTaskReviewed,
    ),
    submissionTaskApproved: materializeBoolRecordDeletionsForMerge(
      state.submissionTaskApproved,
      baseline.submissionTaskApproved,
    ),
    carrierTaskDone: materializeBoolRecordDeletionsForMerge(
      state.carrierTaskDone,
      baseline.carrierTaskDone,
    ),
    carrierTaskReviewed: materializeBoolRecordDeletionsForMerge(
      state.carrierTaskReviewed,
      baseline.carrierTaskReviewed,
    ),
    carrierTaskApproved: materializeBoolRecordDeletionsForMerge(
      state.carrierTaskApproved,
      baseline.carrierTaskApproved,
    ),
  };
}

/** Apply checkbox patch — true sets the key; false removes it (matches mergeBoolRecords). */
export function applyBoolRecordPatch(
  record: Record<string, boolean>,
  patch: Record<string, boolean>,
): Record<string, boolean> {
  const next = { ...record };
  for (const [key, value] of Object.entries(patch)) {
    if (value === true) {
      next[key] = true;
    } else {
      delete next[key];
    }
  }
  for (const [key, value] of Object.entries(next)) {
    if (value !== true) delete next[key];
  }
  return next;
}

export function checklistItemChecked(
  record: Record<string, boolean>,
  itemId: string,
): boolean {
  return record[itemId] === true;
}

function mergeStringRecords(...records: Record<string, string>[]): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      const trimmed = value.trim();
      if (trimmed) merged[key] = trimmed;
    }
  }
  return merged;
}

function mergeAssigneeRecords(
  ...records: (Record<string, ChecklistOwner> | undefined)[]
): Record<string, ChecklistOwner> {
  const merged: Record<string, ChecklistOwner> = {};
  for (const record of records) {
    if (!record) continue;
    for (const [key, value] of Object.entries(record)) {
      if (value === "prep" || value === "review" || value === "both") merged[key] = value;
    }
  }
  return merged;
}

function mergeStatusRecords(
  ...records: (Record<string, ChecklistItemStatus> | undefined)[]
): Record<string, ChecklistItemStatus> {
  const merged: Record<string, ChecklistItemStatus> = {};
  for (const record of records) {
    if (!record) continue;
    for (const [key, value] of Object.entries(record)) {
      if (isChecklistItemStatus(value)) merged[key] = value;
    }
  }
  return merged;
}

function mergePersonStatusRecords(
  ...records: (Record<string, ItemPersonStatuses> | undefined)[]
): Record<string, ItemPersonStatuses> {
  const merged: Record<string, ItemPersonStatuses> = {};
  for (const record of records) {
    if (!record) continue;
    for (const [itemId, statuses] of Object.entries(record)) {
      if (!statuses || typeof statuses !== "object") continue;
      const next: ItemPersonStatuses = { ...merged[itemId] };
      for (const [person, status] of Object.entries(statuses)) {
        if (person !== "prep" && person !== "review") continue;
        if (isChecklistItemStatus(status)) next[person] = status;
      }
      merged[itemId] = next;
    }
  }
  return merged;
}

function statesDiffer(a: SubmissionChecklistState, b: SubmissionChecklistState): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

/** True when merged local+server state should be written to the team row. */
export function submissionChecklistNeedsServerSync(
  server: SubmissionChecklistState | null,
  local: SubmissionChecklistState,
): boolean {
  const merged = server ? mergeSubmissionChecklistStates(server, local) : local;
  return server === null || statesDiffer(merged, server);
}

function mergeCatriaTaskFlagRecords(
  ...records: (Record<string, Partial<CatriaTaskFlags>> | undefined)[]
): Record<string, Partial<CatriaTaskFlags>> {
  const merged: Record<string, Partial<CatriaTaskFlags>> = {};
  for (const record of records) {
    if (!record) continue;
    for (const [key, value] of Object.entries(record)) {
      if (!value || typeof value !== "object") continue;
      merged[key] = { ...merged[key], ...value };
    }
  }
  return merged;
}

/** Union checkbox + note maps; prefer the side with more carrier imports. */
export function mergeSubmissionChecklistStates(
  server: SubmissionChecklistState,
  local: SubmissionChecklistState,
): SubmissionChecklistState {
  const useLocalCarriers =
    local.carrierOriginalTasks.length >= server.carrierOriginalTasks.length ||
    local.carrierTasks.length >= server.carrierTasks.length;
  return {
    completed: mergeBoolRecords(server.completed, local.completed),
    catriaReviewed: mergeBoolRecords(server.catriaReviewed, local.catriaReviewed),
    catriaApproved: mergeBoolRecords(server.catriaApproved, local.catriaApproved),
    catriaTaskFlags: mergeCatriaTaskFlagRecords(server.catriaTaskFlags, local.catriaTaskFlags),
    itemAssignees: mergeAssigneeRecords(server.itemAssignees, local.itemAssignees),
    submissionTaskAssignees: mergeAssigneeRecords(
      server.submissionTaskAssignees,
      local.submissionTaskAssignees,
    ),
    itemStatuses: mergeStatusRecords(server.itemStatuses, local.itemStatuses),
    personStatuses: mergePersonStatusRecords(server.personStatuses, local.personStatuses),
    itemNotes: mergeStringRecords(server.itemNotes, local.itemNotes),
    sectionNotes: mergeStringRecords(server.sectionNotes, local.sectionNotes),
    submissionTasks: mergeBoolRecords(server.submissionTasks, local.submissionTasks),
    submissionTaskReviewed: mergeBoolRecords(
      server.submissionTaskReviewed,
      local.submissionTaskReviewed,
    ),
    submissionTaskApproved: mergeBoolRecords(
      server.submissionTaskApproved,
      local.submissionTaskApproved,
    ),
    submissionCatriaTaskFlags: mergeCatriaTaskFlagRecords(
      server.submissionCatriaTaskFlags,
      local.submissionCatriaTaskFlags,
    ),
    submissionTaskNotes: mergeStringRecords(
      server.submissionTaskNotes,
      local.submissionTaskNotes,
    ),
    carrierTasks: useLocalCarriers ? local.carrierTasks : server.carrierTasks,
    carrierOriginalTasks: useLocalCarriers
      ? local.carrierOriginalTasks
      : server.carrierOriginalTasks,
    carrierTaskDone: mergeBoolRecords(server.carrierTaskDone, local.carrierTaskDone),
    carrierTaskReviewed: mergeBoolRecords(server.carrierTaskReviewed, local.carrierTaskReviewed),
    carrierTaskApproved: mergeBoolRecords(server.carrierTaskApproved, local.carrierTaskApproved),
    carrierCatriaTaskFlags: mergeCatriaTaskFlagRecords(
      server.carrierCatriaTaskFlags,
      local.carrierCatriaTaskFlags,
    ),
    carrierTaskNotes: mergeStringRecords(server.carrierTaskNotes, local.carrierTaskNotes),
    carrierUploads: useLocalCarriers ? local.carrierUploads : server.carrierUploads,
    metaAdConformanceRecords: mergeMetaAdConformanceRecords(
      server.metaAdConformanceRecords,
      local.metaAdConformanceRecords,
    ),
    updatedAt: new Date(
      Math.max(Date.parse(server.updatedAt), Date.parse(local.updatedAt)),
    ).toISOString(),
  };
}

export function parseSubmissionChecklistStatePayload(payload: unknown): SubmissionChecklistState | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  return parseStoredState(JSON.stringify(payload));
}

function seedSiteVerified(completed: Record<string, boolean>): Record<string, boolean> {
  const next = { ...completed };
  for (const id of siteVerifiedChecklistIds()) {
    if (next[id] !== false) {
      next[id] = true;
    }
  }
  return next;
}

function parseStoredState(raw: string): SubmissionChecklistState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<SubmissionChecklistState>;
    return {
      completed: parsed.completed ?? {},
      catriaReviewed: parsed.catriaReviewed ?? {},
      catriaApproved: parsed.catriaApproved ?? {},
      catriaTaskFlags: parsed.catriaTaskFlags ?? {},
      itemAssignees: parsed.itemAssignees ?? {},
      submissionTaskAssignees: parsed.submissionTaskAssignees ?? {},
      itemStatuses: parsed.itemStatuses ?? {},
      personStatuses: parsed.personStatuses ?? {},
      itemNotes: parsed.itemNotes ?? {},
      sectionNotes: parsed.sectionNotes ?? {},
      submissionTasks: parsed.submissionTasks ?? {},
      submissionTaskReviewed: parsed.submissionTaskReviewed ?? {},
      submissionTaskApproved: parsed.submissionTaskApproved ?? {},
      submissionCatriaTaskFlags: parsed.submissionCatriaTaskFlags ?? {},
      submissionTaskNotes: parsed.submissionTaskNotes ?? {},
      carrierTasks: parsed.carrierTasks ?? [],
      carrierOriginalTasks: parsed.carrierOriginalTasks ?? parsed.carrierTasks ?? [],
      carrierTaskDone: parsed.carrierTaskDone ?? {},
      carrierTaskReviewed: parsed.carrierTaskReviewed ?? {},
      carrierTaskApproved: parsed.carrierTaskApproved ?? {},
      carrierCatriaTaskFlags: parsed.carrierCatriaTaskFlags ?? {},
      carrierTaskNotes: parsed.carrierTaskNotes ?? {},
      carrierUploads: parsed.carrierUploads ?? [],
      metaAdConformanceRecords: parseMetaAdConformanceRecords(parsed.metaAdConformanceRecords),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function migrateLegacy(parsed: Partial<SubmissionChecklistState>): SubmissionChecklistState {
  return {
    ...emptyState(),
    completed: seedSiteVerified(parsed.completed ?? {}),
    itemNotes: parsed.itemNotes ?? {},
    sectionNotes: parsed.sectionNotes ?? {},
    submissionTasks: parsed.submissionTasks ?? {},
    submissionTaskNotes: parsed.submissionTaskNotes ?? {},
    updatedAt: new Date().toISOString(),
  };
}

export function loadSubmissionChecklistState(): SubmissionChecklistState {
  if (typeof window === "undefined") return emptyState();

  const currentRaw = localStorage.getItem(STORAGE_KEY);
  if (currentRaw) {
    const parsed = parseStoredState(currentRaw);
    if (parsed) return parsed;
  }

  for (const legacyKey of LEGACY_KEYS) {
    const legacyRaw = localStorage.getItem(legacyKey);
    if (!legacyRaw) continue;
    const legacy = parseStoredState(legacyRaw);
    const state = legacy ? migrateLegacy(legacy) : emptyState();
    saveSubmissionChecklistState(state);
    localStorage.removeItem(legacyKey);
    return state;
  }

  const state = emptyState();
  state.completed = seedSiteVerified(state.completed);
  saveSubmissionChecklistState(state);
  return state;
}

/** Deep clone for reverting local draft to last server-synced baseline. */
export function cloneSubmissionChecklistState(
  state: SubmissionChecklistState,
): SubmissionChecklistState {
  return JSON.parse(JSON.stringify(state)) as SubmissionChecklistState;
}

export function saveSubmissionChecklistState(state: SubmissionChecklistState): void {
  if (typeof window === "undefined") return;
  const next: SubmissionChecklistState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearSubmissionChecklistState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
}

/** Wipe localStorage and persist a fully empty checklist (no site-verified defaults). */
export function clearAllSubmissionChecklistState(): SubmissionChecklistState {
  const state = clearedSubmissionChecklistState();
  if (typeof window === "undefined") return state;
  clearSubmissionChecklistState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function countChecklistProgress(
  completed: Record<string, boolean>,
  total: number,
): {
  done: number;
  total: number;
  percent: number;
} {
  const done = Object.values(completed).filter(Boolean).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
}

export function carrierOriginalTasksForUpload(
  state: SubmissionChecklistState,
  uploadId: string,
): CarrierChecklistTask[] {
  return state.carrierOriginalTasks.filter((task) => task.uploadId === uploadId);
}

export function carrierCuratedTasksForUpload(
  state: SubmissionChecklistState,
  uploadId: string,
): CarrierChecklistTask[] {
  return state.carrierTasks.filter((task) => task.uploadId === uploadId);
}

/** Rename a carrier upload and propagate the name to all related tasks. */
export function renameCarrierUpload(
  state: SubmissionChecklistState,
  uploadId: string,
  nextName: string,
): SubmissionChecklistState {
  const trimmed = nextName.trim();
  if (!trimmed) return state;

  const renameTask = (task: CarrierChecklistTask): CarrierChecklistTask => {
    if (task.uploadId !== uploadId) return task;
    return {
      ...task,
      carrierName: trimmed,
      description: `From ${trimmed} carrier checklist — ${PREP_OWNER_LABEL} delivers; ${REVIEW_OWNER_LABEL} reviews and approves.`,
    };
  };

  const nextState: SubmissionChecklistState = {
    ...state,
    carrierUploads: state.carrierUploads.map((upload) =>
      upload.id === uploadId ? { ...upload, carrierName: trimmed } : upload,
    ),
    carrierOriginalTasks: state.carrierOriginalTasks.map(renameTask),
    carrierTasks: state.carrierTasks.map(renameTask),
  };

  return syncCarrierReviewToMainChecklist(nextState);
}

/** Stage a new carrier upload — original dump preserved; curated list saved separately. */
export function stageCarrierChecklistUpload(
  state: SubmissionChecklistState,
  originalTasks: CarrierChecklistTask[],
  upload: CarrierChecklistUploadMeta,
): SubmissionChecklistState {
  return {
    ...state,
    carrierOriginalTasks: [...state.carrierOriginalTasks, ...originalTasks],
    carrierUploads: [upload, ...state.carrierUploads],
  };
}

export type CarrierCurationSelection = {
  taskId: string;
  included: boolean;
};

/** Apply admin curation — updates saved checklist, prunes progress for excluded tasks, syncs main checklist. */
export function saveCuratedCarrierChecklist(
  state: SubmissionChecklistState,
  uploadId: string,
  selections: CarrierCurationSelection[],
  curatedBy?: string,
): SubmissionChecklistState {
  const originalTasks = carrierOriginalTasksForUpload(state, uploadId);
  const selectionById = new Map(selections.map((entry) => [entry.taskId, entry]));
  const curatedTasks: CarrierChecklistTask[] = [];

  for (const task of originalTasks) {
    const selection = selectionById.get(task.id);
    if (!selection?.included) continue;
    curatedTasks.push({ ...task, assignee: "both" });
  }

  const curatedIds = new Set(curatedTasks.map((task) => task.id));
  const removedIds = state.carrierTasks
    .filter((task) => task.uploadId === uploadId && !curatedIds.has(task.id))
    .map((task) => task.id);

  const pruneRecord = <T extends Record<string, unknown>>(record: T): T => {
    const next = { ...record };
    for (const id of removedIds) {
      delete next[id];
    }
    return next;
  };

  const otherUploadTasks = state.carrierTasks.filter((task) => task.uploadId !== uploadId);
  const curatedAt = new Date().toISOString();

  const nextUploads = state.carrierUploads.map((upload) =>
    upload.id === uploadId
      ? {
          ...upload,
          originalTaskCount: originalTasks.length,
          curatedTaskCount: curatedTasks.length,
          curatedAt,
          curatedBy,
        }
      : upload,
  );

  const nextState: SubmissionChecklistState = {
    ...state,
    carrierTasks: [...otherUploadTasks, ...curatedTasks],
    carrierTaskDone: pruneRecord(state.carrierTaskDone),
    carrierTaskReviewed: pruneRecord(state.carrierTaskReviewed),
    carrierTaskApproved: pruneRecord(state.carrierTaskApproved),
    carrierCatriaTaskFlags: pruneRecord(state.carrierCatriaTaskFlags),
    carrierTaskNotes: pruneRecord(state.carrierTaskNotes),
    itemStatuses: pruneRecord(state.itemStatuses),
    personStatuses: pruneRecord(state.personStatuses),
    carrierUploads: nextUploads,
  };

  return syncCarrierReviewToMainChecklist(nextState);
}

export function appendCarrierChecklistTasks(
  state: SubmissionChecklistState,
  tasks: CarrierChecklistTask[],
  upload: CarrierChecklistUploadMeta,
): SubmissionChecklistState {
  return syncCarrierReviewToMainChecklist({
    ...state,
    carrierTasks: [...state.carrierTasks, ...tasks],
    carrierOriginalTasks: [...state.carrierOriginalTasks, ...tasks],
    carrierUploads: [upload, ...state.carrierUploads],
  });
}

export function clearCarrierChecklistTasks(state: SubmissionChecklistState): SubmissionChecklistState {
  return syncCarrierReviewToMainChecklist({
    ...state,
    carrierTasks: [],
    carrierOriginalTasks: [],
    carrierTaskDone: {},
    carrierTaskReviewed: {},
    carrierTaskApproved: {},
    carrierCatriaTaskFlags: {},
    carrierTaskNotes: {},
    carrierUploads: [],
  });
}

export function upsertMetaAdConformanceRecordInState(
  state: SubmissionChecklistState,
  record: MetaAdConformanceRecord,
): SubmissionChecklistState {
  return {
    ...state,
    metaAdConformanceRecords: upsertMetaAdConformanceRecord(state.metaAdConformanceRecords, record),
  };
}

export function removeMetaAdConformanceRecordFromState(
  state: SubmissionChecklistState,
  id: string,
): SubmissionChecklistState {
  return {
    ...state,
    metaAdConformanceRecords: removeMetaAdConformanceRecord(state.metaAdConformanceRecords, id),
  };
}

/** Keep team DB payloads under server/request limits — strip inline creative bytes. */
export const SUBMISSION_CHECKLIST_SERVER_SYNC_MAX_BYTES = 4 * 1024 * 1024;

export function estimateSubmissionChecklistPayloadBytes(state: SubmissionChecklistState): number {
  return new TextEncoder().encode(JSON.stringify(state)).length;
}

export function stripMetaAdAssetsForServerSync(
  state: SubmissionChecklistState,
): SubmissionChecklistState {
  return {
    ...state,
    metaAdConformanceRecords: state.metaAdConformanceRecords.map((record) => {
      if (!record.asset?.dataUrl) return record;
      const { dataUrl: _dataUrl, ...assetMeta } = record.asset;
      return { ...record, asset: assetMeta };
    }),
  };
}

/** Drop per-ad checklist rows that duplicate global completed / approval / notes. */
export function compactMetaAdChecklistProgressForServerSync(
  record: MetaAdConformanceRecord,
  globalState: Pick<SubmissionChecklistState, "completed" | "catriaApproved" | "itemNotes">,
): Record<string, MetaAdChecklistItemProgress> | undefined {
  const progress = record.checklistProgress;
  if (!progress) return undefined;

  const compact: Record<string, MetaAdChecklistItemProgress> = {};
  for (const [itemId, local] of Object.entries(progress)) {
    const globalPrep = !!globalState.completed[itemId];
    const globalCatria = !!globalState.catriaApproved[itemId];
    const globalNote = globalState.itemNotes[itemId]?.trim() ?? "";
    const localNote = local.note?.trim() ?? "";

    const prepOverride = local.prepDone === true && !globalPrep;
    const catriaOverride = local.catriaApproved === true && !globalCatria;
    const noteOverride = localNote.length > 0 && localNote !== globalNote;

    if (!prepOverride && !catriaOverride && !noteOverride) continue;

    const entry: MetaAdChecklistItemProgress = {};
    if (prepOverride) entry.prepDone = true;
    if (catriaOverride) entry.catriaApproved = true;
    if (noteOverride) entry.note = localNote;
    compact[itemId] = entry;
  }

  return Object.keys(compact).length > 0 ? compact : undefined;
}

function compactMetaAdRecordsForServerSync(state: SubmissionChecklistState): SubmissionChecklistState {
  return {
    ...state,
    metaAdConformanceRecords: state.metaAdConformanceRecords.map((record) => ({
      ...record,
      checklistProgress: compactMetaAdChecklistProgressForServerSync(record, state),
    })),
  };
}

/** Reattach local-only creative bytes after a server round-trip. */
export function restoreLocalMetaAdAssets(
  state: SubmissionChecklistState,
  local: SubmissionChecklistState,
): SubmissionChecklistState {
  const localById = new Map(local.metaAdConformanceRecords.map((record) => [record.id, record]));
  return {
    ...state,
    metaAdConformanceRecords: state.metaAdConformanceRecords.map((record) => {
      const localRecord = localById.get(record.id);
      const localDataUrl = localRecord?.asset?.dataUrl;
      if (!localDataUrl) return record;
      if (record.asset?.dataUrl) return record;
      if (!record.asset) return { ...record, asset: localRecord!.asset };
      return { ...record, asset: { ...record.asset, dataUrl: localDataUrl } };
    }),
  };
}

/** Reattach full per-ad checklist progress after a compact server round-trip. */
export function restoreLocalMetaAdChecklistProgress(
  state: SubmissionChecklistState,
  local: SubmissionChecklistState,
): SubmissionChecklistState {
  const localById = new Map(local.metaAdConformanceRecords.map((record) => [record.id, record]));
  return {
    ...state,
    metaAdConformanceRecords: state.metaAdConformanceRecords.map((record) => {
      const localRecord = localById.get(record.id);
      const localProgress = localRecord?.checklistProgress;
      if (!localProgress || Object.keys(localProgress).length === 0) return record;
      return {
        ...record,
        checklistProgress: {
          ...record.checklistProgress,
          ...localProgress,
        },
      };
    }),
  };
}

export function prepareSubmissionChecklistStateForServer(
  state: SubmissionChecklistState,
): SubmissionChecklistState {
  return compactMetaAdRecordsForServerSync(stripMetaAdAssetsForServerSync(state));
}

/** Strip assets and encode checkbox unchecks for server merge against last synced baseline. */
export function prepareSubmissionChecklistStateForServerMerge(
  state: SubmissionChecklistState,
  baseline: SubmissionChecklistState,
): SubmissionChecklistState {
  const materialized = materializeSubmissionChecklistBoolDeletionsForMerge(state, baseline);
  return prepareSubmissionChecklistStateForServer(materialized);
}

/** Stable fingerprint for comparing local draft vs last server-synced snapshot. */
export function submissionChecklistSyncFingerprint(state: SubmissionChecklistState): string {
  return JSON.stringify(prepareSubmissionChecklistStateForServer(state));
}

export function isSubmissionChecklistStateDirty(
  local: SubmissionChecklistState,
  baseline: SubmissionChecklistState,
): boolean {
  return submissionChecklistSyncFingerprint(local) !== submissionChecklistSyncFingerprint(baseline);
}

export function isSubmissionChecklistItemDirty(
  itemId: string,
  local: SubmissionChecklistState,
  baseline: SubmissionChecklistState,
): boolean {
  const localAssignee = local.itemAssignees[itemId];
  const baselineAssignee = baseline.itemAssignees[itemId];
  const localStatus = local.itemStatuses[itemId];
  const baselineStatus = baseline.itemStatuses[itemId];
  const localPerson = local.personStatuses[itemId];
  const baselinePerson = baseline.personStatuses[itemId];
  return (
    checklistItemChecked(local.completed, itemId) !==
      checklistItemChecked(baseline.completed, itemId) ||
    checklistItemChecked(local.catriaReviewed, itemId) !==
      checklistItemChecked(baseline.catriaReviewed, itemId) ||
    checklistItemChecked(local.catriaApproved, itemId) !==
      checklistItemChecked(baseline.catriaApproved, itemId) ||
    (localAssignee ?? null) !== (baselineAssignee ?? null) ||
    (localStatus ?? null) !== (baselineStatus ?? null) ||
    JSON.stringify(localPerson ?? null) !== JSON.stringify(baselinePerson ?? null) ||
    (local.itemNotes[itemId]?.trim() ?? "") !== (baseline.itemNotes[itemId]?.trim() ?? "")
  );
}

export function getDirtySubmissionChecklistItemIds(
  local: SubmissionChecklistState,
  baseline: SubmissionChecklistState,
  itemIds: Iterable<string>,
): string[] {
  const dirty: string[] = [];
  for (const itemId of itemIds) {
    if (isSubmissionChecklistItemDirty(itemId, local, baseline)) dirty.push(itemId);
  }
  return dirty;
}

const DB_SETUP_ERROR_MARKERS = [
  "schema cache",
  "could not find the table",
  'relation "public.submission_checklist_progress" does not exist',
] as const;

export const SUBMISSION_CHECKLIST_DB_SETUP_MESSAGE =
  "Database not set up — contact an admin to apply migrations. Changes are saved locally only.";

export function isSubmissionChecklistDbSetupError(message: string): boolean {
  const lower = message.toLowerCase();
  return DB_SETUP_ERROR_MARKERS.some((marker) => lower.includes(marker));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Pull a human-readable message from Error, PostgrestError, Zod, or serialized RPC payloads. */
export function extractSubmissionChecklistErrorText(err: unknown): string {
  if (err == null) return "";

  if (typeof err === "string") return err.trim();

  if (err instanceof Error) {
    const message = err.message.trim();
    if (message && message !== "[object Object]") return message;
  }

  if (isRecord(err)) {
    const nestedError = err.error;
    if (nestedError !== undefined && nestedError !== err) {
      const nested = extractSubmissionChecklistErrorText(nestedError);
      if (nested) return nested;
    }

    const message = err.message;
    if (typeof message === "string" && message.trim()) return message.trim();

    const issues = err.issues;
    if (Array.isArray(issues) && issues.length > 0) {
      const zodLines = issues
        .map((issue) => {
          if (!isRecord(issue)) return "";
          const path = Array.isArray(issue.path) ? issue.path.map(String).join(".") : "";
          const text = typeof issue.message === "string" ? issue.message.trim() : "";
          if (!text) return "";
          return path ? `${path}: ${text}` : text;
        })
        .filter(Boolean);
      if (zodLines.length > 0) return zodLines.join("; ");
    }

    const details = err.details;
    if (typeof details === "string" && details.trim()) return details.trim();

    const hint = err.hint;
    if (typeof hint === "string" && hint.trim()) return hint.trim();

    const code = err.code;
    if (typeof code === "string" && code.trim()) return code.trim();
  }

  return "";
}

export function submissionChecklistErrorMessage(err: unknown): string {
  const message = extractSubmissionChecklistErrorText(err);
  if (isSubmissionChecklistDbSetupError(message)) {
    return SUBMISSION_CHECKLIST_DB_SETUP_MESSAGE;
  }
  return message || "Could not save checklist.";
}
