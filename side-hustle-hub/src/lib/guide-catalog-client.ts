import { api } from "./api";
import {
  isGuidePublished,
  isGuideVisibilityStatus,
  normalizeGuideCatalogState,
  type GuideCatalogPatch,
  type GuideCatalogState,
  type GuideCatalogStateMap,
  type GuideVisibilityStatus,
} from "./guide-catalog-state";
import {
  isGuideChangeLogAction,
  type GuideChangeLogEntry,
} from "./guide-change-log";

type PublicState = {
  published?: boolean;
  status?: GuideVisibilityStatus;
  deleted?: boolean;
  custom?: boolean;
  patch?: GuideCatalogPatch | Record<string, unknown>;
  updatedAt?: string;
  updatedBy?: string;
};

export function mapApiGuideCatalogStates(
  raw: Record<string, PublicState> | null | undefined,
): GuideCatalogStateMap {
  const out: GuideCatalogStateMap = {};
  if (!raw) return out;
  for (const [guideId, row] of Object.entries(raw)) {
    out[guideId] = normalizeGuideCatalogState(guideId, {
      guideId,
      status: row.status,
      published: typeof row.published === "boolean" ? row.published : undefined,
      deleted: row.deleted === true,
      custom: row.custom === true,
      patch: (row.patch as GuideCatalogPatch) ?? {},
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
    });
  }
  return out;
}

export async function fetchGuideCatalogStates(): Promise<GuideCatalogStateMap> {
  const data = await api<{ states: Record<string, PublicState> }>("guide-catalog", {
    method: "GET",
    auth: false,
  });
  return mapApiGuideCatalogStates(data.states);
}

export async function setGuideCatalogStatus(
  guideId: string,
  status: GuideVisibilityStatus,
  note?: string,
): Promise<GuideCatalogState> {
  const data = await api<{
    guideId: string;
    state: PublicState;
  }>("guide-catalog", {
    method: "PUT",
    body: {
      guideId,
      status,
      note: note?.trim() || undefined,
      /** Keep published in sync for older readers / tooling. */
      published: status === "active",
    },
  });
  return normalizeGuideCatalogState(guideId, {
    guideId,
    status: data.state.status,
    published: data.state.published === true,
    deleted: data.state.deleted === true,
    custom: data.state.custom === true,
    patch: (data.state.patch as GuideCatalogPatch) ?? {},
    updatedAt: data.state.updatedAt,
    updatedBy: data.state.updatedBy,
  });
}

/** One-shot bulk status update (Active / Pending / Reviewed by QA / Inactive). */
export async function setGuideCatalogStatusBulk(
  guideIds: string[],
  status: GuideVisibilityStatus,
  note?: string,
): Promise<GuideCatalogStateMap> {
  const ids = [...new Set(guideIds.map((id) => String(id || "").trim()).filter(Boolean))];
  if (!ids.length) return {};
  const data = await api<{
    ok?: boolean;
    status?: GuideVisibilityStatus;
    states?: Record<string, PublicState>;
  }>("guide-catalog/bulk", {
    method: "POST",
    body: { guideIds: ids, status, note: note?.trim() || undefined },
    timeoutMs: 60_000,
  });
  return mapApiGuideCatalogStates(data.states ?? {});
}

/** Admin: save Side Hustle name + kit body (steps / tools / prerequisites). */
export async function saveGuideCatalogContent(
  guideId: string,
  patch: GuideCatalogPatch,
): Promise<GuideCatalogState> {
  const data = await api<{
    guideId: string;
    state: PublicState;
  }>("guide-catalog", {
    method: "PUT",
    body: {
      guideId,
      patch,
    },
  });
  return normalizeGuideCatalogState(guideId, {
    guideId,
    status: data.state.status,
    published: data.state.published === true,
    deleted: data.state.deleted === true,
    custom: data.state.custom === true,
    patch: (data.state.patch as GuideCatalogPatch) ?? {},
    updatedAt: data.state.updatedAt,
    updatedBy: data.state.updatedBy,
  });
}

/** @deprecated Prefer setGuideCatalogStatus — maps true→active, false→inactive. */
export async function setGuideCatalogPublished(
  guideId: string,
  published: boolean,
): Promise<GuideCatalogState> {
  return setGuideCatalogStatus(guideId, published ? "active" : "inactive");
}

/** Admin/QA: load per-guide change history (audit trail). */
export function mapGuideChangeLogEntries(raw: unknown[]): GuideChangeLogEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: GuideChangeLogEntry[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const body = row as Record<string, unknown>;
    const action = isGuideChangeLogAction(body.action) ? body.action : "status";
    const fromStatus = isGuideVisibilityStatus(body.fromStatus) ? body.fromStatus : null;
    const toStatus = isGuideVisibilityStatus(body.toStatus) ? body.toStatus : null;
    const detailRaw =
      body.detail && typeof body.detail === "object" && !Array.isArray(body.detail)
        ? (body.detail as Record<string, unknown>)
        : {};
    out.push({
      id: (body.id as number | string) ?? out.length,
      guideId: String(body.guideId || ""),
      changedAt: String(body.changedAt || ""),
      changedBy: String(body.changedBy || ""),
      action,
      fromStatus,
      toStatus,
      detail: {
        minTier: typeof detailRaw.minTier === "string" ? detailRaw.minTier : undefined,
        note: typeof detailRaw.note === "string" ? detailRaw.note : undefined,
        fields: Array.isArray(detailRaw.fields)
          ? detailRaw.fields.map((f) => String(f)).filter(Boolean)
          : undefined,
      },
    });
  }
  return out;
}

export async function fetchGuideChangeLog(
  guideId: string,
  limit = 50,
): Promise<GuideChangeLogEntry[]> {
  const id = String(guideId || "").trim();
  if (!id) return [];
  const data = await api<{ guideId?: string; entries?: unknown[] }>(
    `guide-catalog/history?guideId=${encodeURIComponent(id)}&limit=${Math.min(Math.max(limit, 1), 200)}`,
    { method: "GET" },
  );
  return mapGuideChangeLogEntries(data.entries ?? []);
}

/** Whether a guide should appear for members / guests (Active only; Pending stays hidden). */
export function isGuideActiveForMembers(
  guideId: string,
  states: GuideCatalogStateMap | null | undefined,
): boolean {
  return isGuidePublished(guideId, states);
}
