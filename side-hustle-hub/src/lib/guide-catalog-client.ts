import { api } from "./api";
import {
  isGuidePublished,
  normalizeGuideCatalogState,
  type GuideCatalogState,
  type GuideCatalogStateMap,
  type GuideVisibilityStatus,
} from "./guide-catalog-state";

type PublicState = {
  published?: boolean;
  status?: GuideVisibilityStatus;
  deleted?: boolean;
  custom?: boolean;
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
      patch: {},
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
): Promise<GuideCatalogState> {
  const data = await api<{
    guideId: string;
    state: PublicState;
  }>("guide-catalog", {
    method: "PUT",
    body: {
      guideId,
      status,
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
    patch: {},
    updatedAt: data.state.updatedAt,
    updatedBy: data.state.updatedBy,
  });
}

/** One-shot bulk status update (Active / Pending / Reviewed by QA / Inactive). */
export async function setGuideCatalogStatusBulk(
  guideIds: string[],
  status: GuideVisibilityStatus,
): Promise<GuideCatalogStateMap> {
  const ids = [...new Set(guideIds.map((id) => String(id || "").trim()).filter(Boolean))];
  if (!ids.length) return {};
  const data = await api<{
    ok?: boolean;
    status?: GuideVisibilityStatus;
    states?: Record<string, PublicState>;
  }>("guide-catalog/bulk", {
    method: "POST",
    body: { guideIds: ids, status },
    timeoutMs: 60_000,
  });
  return mapApiGuideCatalogStates(data.states ?? {});
}

/** @deprecated Prefer setGuideCatalogStatus — maps true→active, false→inactive. */
export async function setGuideCatalogPublished(
  guideId: string,
  published: boolean,
): Promise<GuideCatalogState> {
  return setGuideCatalogStatus(guideId, published ? "active" : "inactive");
}

/** Whether a guide should appear for members / guests (Active only; Pending stays hidden). */
export function isGuideActiveForMembers(
  guideId: string,
  states: GuideCatalogStateMap | null | undefined,
): boolean {
  return isGuidePublished(guideId, states);
}
