import type { AssigneeFilter, ChecklistOwner } from "@/lib/submission-checklist-data";

export type MetaAdConformanceStatus = "draft" | "submitted" | "approved" | "ready";

export type MetaAdAssetMeta = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  /** Inline data URL — kept in localStorage; omitted from team DB sync to avoid payload limits. */
  dataUrl?: string;
};

/** Per-ad checklist item progress — synced from global checklist when category item is checked. */
export type MetaAdChecklistItemProgress = {
  prepDone?: boolean;
  catriaApproved?: boolean;
  note?: string;
};

export type MetaAdConformanceRecord = {
  id: string;
  label: string;
  status: MetaAdConformanceStatus;
  /** Evelyn (prep) or Catria (review) — defaults to prep for new ads. */
  assignee?: ChecklistOwner;
  dateSubmitted?: string;
  dateApproved?: string;
  /** Catria compliance sign-off — required before ready to go. */
  catriaApproved: boolean;
  catriaReviewedAt?: string;
  readyToGo: boolean;
  asset?: MetaAdAssetMeta;
  /** Linked checklist items (creative/CMS) — inherits global checks; stores per-ad overrides. */
  checklistProgress?: Record<string, MetaAdChecklistItemProgress>;
  createdAt: string;
  updatedAt: string;
};

export const META_AD_ASSET_ACCEPT =
  ".png,.jpg,.jpeg,.gif,.webp,.mp4,.mov,video/mp4,video/quicktime,image/png,image/jpeg,image/gif,image/webp";

export const META_AD_ASSET_MAX_BYTES = 15 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "mp4", "mov"]);

export function metaAdStatusLabel(status: MetaAdConformanceStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "submitted":
      return "Submitted";
    case "approved":
      return "Approved";
    case "ready":
      return "Ready to go";
  }
}

export function deriveMetaAdStatus(record: MetaAdConformanceRecord): MetaAdConformanceStatus {
  if (record.readyToGo && record.dateApproved && record.catriaApproved) return "ready";
  if (record.catriaApproved && record.dateApproved) return "approved";
  if (record.dateSubmitted) return "submitted";
  return "draft";
}

export function isMetaAdRecordComplete(record: MetaAdConformanceRecord): boolean {
  return deriveMetaAdStatus(record) === "ready";
}

export function withDerivedMetaAdStatus(record: MetaAdConformanceRecord): MetaAdConformanceRecord {
  return { ...record, status: deriveMetaAdStatus(record) };
}

export function defaultMetaAdRecordAssignee(_record: MetaAdConformanceRecord): ChecklistOwner {
  return "prep";
}

export function getMetaAdRecordAssignee(record: MetaAdConformanceRecord): ChecklistOwner {
  return record.assignee ?? defaultMetaAdRecordAssignee(record);
}

/** Evelyn prep phase — upload/submit before Catria sign-off. */
export function metaAdRecordHasPrepWork(record: MetaAdConformanceRecord): boolean {
  return !record.catriaApproved;
}

/** Catria review — sign-off required until approved. */
export function metaAdRecordHasReviewWork(record: MetaAdConformanceRecord): boolean {
  return !record.catriaApproved;
}

export function metaAdRecordMatchesAssigneeFilter(
  record: MetaAdConformanceRecord,
  filter: AssigneeFilter,
): boolean {
  if (filter === "all") return true;
  const assignee = getMetaAdRecordAssignee(record);
  if (filter === "prep") {
    return metaAdRecordHasPrepWork(record) || assignee === "prep";
  }
  return metaAdRecordHasReviewWork(record) || assignee === "review";
}

export function filterMetaAdRecordsByAssignee(
  records: MetaAdConformanceRecord[],
  filter: AssigneeFilter,
): MetaAdConformanceRecord[] {
  if (filter === "all") return records;
  return records.filter((record) => metaAdRecordMatchesAssigneeFilter(record, filter));
}

export function createMetaAdConformanceRecord(label = ""): MetaAdConformanceRecord {
  const now = new Date().toISOString();
  const id = `meta-ad-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return withDerivedMetaAdStatus({
    id,
    label: label.trim() || "Untitled ad",
    status: "draft",
    assignee: "prep",
    catriaApproved: false,
    readyToGo: false,
    createdAt: now,
    updatedAt: now,
  });
}

export async function readMetaAdAssetFile(file: File): Promise<MetaAdAssetMeta> {
  if (file.size === 0) throw new Error("File is empty.");
  if (file.size > META_AD_ASSET_MAX_BYTES) {
    throw new Error(`File exceeds ${Math.round(META_AD_ASSET_MAX_BYTES / (1024 * 1024))} MB limit.`);
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("Upload a PNG, JPG, GIF, WebP, MP4, or MOV creative file.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read file."));
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });

  return {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    dataUrl,
  };
}

export function upsertMetaAdConformanceRecord(
  records: MetaAdConformanceRecord[],
  next: MetaAdConformanceRecord,
): MetaAdConformanceRecord[] {
  const stamped = withDerivedMetaAdStatus({
    ...next,
    updatedAt: new Date().toISOString(),
  });
  const idx = records.findIndex((r) => r.id === stamped.id);
  if (idx === -1) return [stamped, ...records];
  const copy = [...records];
  copy[idx] = stamped;
  return copy;
}

export function removeMetaAdConformanceRecord(
  records: MetaAdConformanceRecord[],
  id: string,
): MetaAdConformanceRecord[] {
  return records.filter((r) => r.id !== id);
}

function recordTimestamp(record: MetaAdConformanceRecord): number {
  return Date.parse(record.updatedAt || record.createdAt) || 0;
}

function mergeMetaAdChecklistProgress(
  server?: Record<string, MetaAdChecklistItemProgress>,
  local?: Record<string, MetaAdChecklistItemProgress>,
): Record<string, MetaAdChecklistItemProgress> | undefined {
  if (!server && !local) return undefined;
  const merged: Record<string, MetaAdChecklistItemProgress> = {};
  const itemIds = new Set([
    ...Object.keys(server ?? {}),
    ...Object.keys(local ?? {}),
  ]);
  for (const itemId of itemIds) {
    const existing = server?.[itemId];
    const progress = local?.[itemId];
    const entry: MetaAdChecklistItemProgress = {};
    if (existing?.prepDone || progress?.prepDone) entry.prepDone = true;
    if (existing?.catriaApproved || progress?.catriaApproved) entry.catriaApproved = true;
    const note = progress?.note?.trim() || existing?.note?.trim();
    if (note) entry.note = note;
    if (Object.keys(entry).length > 0) merged[itemId] = entry;
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}

function mergeMetaAdRecord(
  server: MetaAdConformanceRecord,
  local: MetaAdConformanceRecord,
): MetaAdConformanceRecord {
  const preferLocal = recordTimestamp(local) >= recordTimestamp(server);
  const primary = preferLocal ? local : server;
  const secondary = preferLocal ? server : local;
  const assignee =
    preferLocal && local.assignee !== undefined
      ? local.assignee
      : server.assignee !== undefined
        ? server.assignee
        : local.assignee ?? server.assignee;
  return withDerivedMetaAdStatus({
    ...secondary,
    ...primary,
    label: primary.label.trim() || secondary.label,
    assignee,
    asset: primary.asset ?? secondary.asset,
    dateSubmitted: primary.dateSubmitted ?? secondary.dateSubmitted,
    dateApproved: primary.dateApproved ?? secondary.dateApproved,
    catriaApproved: primary.catriaApproved || secondary.catriaApproved,
    catriaReviewedAt: primary.catriaReviewedAt ?? secondary.catriaReviewedAt,
    readyToGo: primary.readyToGo || secondary.readyToGo,
    checklistProgress: mergeMetaAdChecklistProgress(
      server.checklistProgress,
      local.checklistProgress,
    ),
    createdAt: server.createdAt <= local.createdAt ? server.createdAt : local.createdAt,
    updatedAt: new Date(Math.max(recordTimestamp(server), recordTimestamp(local))).toISOString(),
  });
}

export function mergeMetaAdConformanceRecords(
  server: MetaAdConformanceRecord[],
  local: MetaAdConformanceRecord[],
): MetaAdConformanceRecord[] {
  const byId = new Map<string, MetaAdConformanceRecord>();
  for (const record of server) byId.set(record.id, record);
  for (const record of local) {
    const existing = byId.get(record.id);
    byId.set(record.id, existing ? mergeMetaAdRecord(existing, record) : record);
  }
  return [...byId.values()].sort(
    (a, b) => recordTimestamp(b) - recordTimestamp(a) || a.label.localeCompare(b.label),
  );
}

export function countMetaAdConformanceProgress(records: MetaAdConformanceRecord[]): {
  done: number;
  total: number;
  percent: number;
} {
  const total = records.length;
  const done = records.filter((r) => isMetaAdRecordComplete(r)).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
}

function parseMetaAdChecklistProgress(
  payload: unknown,
): Record<string, MetaAdChecklistItemProgress> | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return undefined;
  const merged: Record<string, MetaAdChecklistItemProgress> = {};
  for (const [itemId, raw] of Object.entries(payload as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const entry = raw as Partial<MetaAdChecklistItemProgress>;
    const progress: MetaAdChecklistItemProgress = {};
    if (entry.prepDone === true) progress.prepDone = true;
    if (entry.catriaApproved === true) progress.catriaApproved = true;
    if (typeof entry.note === "string" && entry.note.trim()) progress.note = entry.note.trim();
    if (Object.keys(progress).length > 0) merged[itemId] = progress;
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function parseMetaAdConformanceRecords(payload: unknown): MetaAdConformanceRecord[] {
  if (!Array.isArray(payload)) return [];
  const records: MetaAdConformanceRecord[] = [];
  for (const item of payload) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const r = item as Partial<MetaAdConformanceRecord>;
    if (typeof r.id !== "string" || typeof r.label !== "string") continue;
    const assignee =
      r.assignee === "prep" || r.assignee === "review" ? r.assignee : undefined;
    records.push(
      withDerivedMetaAdStatus({
        id: r.id,
        label: r.label,
        status: r.status === "submitted" || r.status === "approved" || r.status === "ready" ? r.status : "draft",
        assignee,
        dateSubmitted: typeof r.dateSubmitted === "string" ? r.dateSubmitted : undefined,
        dateApproved: typeof r.dateApproved === "string" ? r.dateApproved : undefined,
        catriaApproved: r.catriaApproved === true,
        catriaReviewedAt: typeof r.catriaReviewedAt === "string" ? r.catriaReviewedAt : undefined,
        readyToGo: r.readyToGo === true,
        checklistProgress: parseMetaAdChecklistProgress(r.checklistProgress),
        asset:
          r.asset &&
          typeof r.asset === "object" &&
          typeof (r.asset as MetaAdAssetMeta).fileName === "string"
            ? {
                fileName: (r.asset as MetaAdAssetMeta).fileName,
                mimeType:
                  typeof (r.asset as MetaAdAssetMeta).mimeType === "string"
                    ? (r.asset as MetaAdAssetMeta).mimeType
                    : "application/octet-stream",
                sizeBytes:
                  typeof (r.asset as MetaAdAssetMeta).sizeBytes === "number"
                    ? (r.asset as MetaAdAssetMeta).sizeBytes
                    : 0,
                uploadedAt:
                  typeof (r.asset as MetaAdAssetMeta).uploadedAt === "string"
                    ? (r.asset as MetaAdAssetMeta).uploadedAt
                    : new Date().toISOString(),
                dataUrl:
                  typeof (r.asset as MetaAdAssetMeta).dataUrl === "string"
                    ? (r.asset as MetaAdAssetMeta).dataUrl
                    : undefined,
              }
            : undefined,
        createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
        updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : new Date().toISOString(),
      }),
    );
  }
  return records;
}
