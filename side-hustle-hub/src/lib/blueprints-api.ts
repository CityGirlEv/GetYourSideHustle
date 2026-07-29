/** Client for Side Hustle Blueprint pending-claim + save APIs. */
import { api, ApiError } from "./api";
import type { BlueprintAgeGroup } from "./gysh-analytics";
import type { PendingBlueprint } from "./pending-blueprint";

export type SavedBlueprint = {
  id: string;
  userId: string;
  childProfileId: string | null;
  ageGroup: BlueprintAgeGroup;
  answers: Record<string, unknown>;
  resultIds: string[];
  resultPcts: Record<string, number>;
  /** hustleId → child profile id, or "self" for parent */
  matchAssignees?: Record<string, string>;
  topResultId: string | null;
  unlocked: boolean;
  source: string;
  completedAt: string;
  unlockedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function postPendingBlueprint(pending: PendingBlueprint): Promise<string | null> {
  try {
    const data = await api<{ ok: boolean; claimToken: string }>("blueprints/pending", {
      method: "POST",
      auth: false,
      body: {
        ageGroup: pending.ageGroup,
        answers: pending.answers,
        resultIds: pending.resultIds,
        resultPcts: pending.resultPcts ?? {},
        returnView: pending.returnView,
        returnTab: pending.returnTab,
      },
    });
    return data.claimToken ?? null;
  } catch {
    return null;
  }
}

export async function fetchPendingBlueprint(claimToken: string) {
  return api<{
    ok: boolean;
    claimToken: string;
    ageGroup: BlueprintAgeGroup;
    answers: Record<string, unknown>;
    resultIds: string[];
    resultPcts: Record<string, number>;
    returnView: string;
    returnTab: string | null;
    expiresAt: string;
  }>(`blueprints/pending/${encodeURIComponent(claimToken)}`, { auth: false });
}

export async function claimBlueprint(claimToken: string, childProfileId?: string | null) {
  return api<{ ok: boolean; blueprint: SavedBlueprint }>("blueprints/claim", {
    method: "POST",
    body: { claimToken, childProfileId: childProfileId ?? undefined },
  });
}

export async function saveBlueprintToAccount(input: {
  ageGroup: BlueprintAgeGroup;
  answers: Record<string, unknown>;
  resultIds: string[];
  resultPcts?: Record<string, number>;
  childProfileId?: string | null;
  claimToken?: string | null;
  id?: string;
}): Promise<SavedBlueprint | null> {
  try {
    const data = await api<{ ok: boolean; blueprint: SavedBlueprint }>("blueprints", {
      method: "POST",
      body: input,
    });
    return data.blueprint ?? null;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
}

export async function listSavedBlueprints(): Promise<SavedBlueprint[]> {
  const data = await api<{ ok: boolean; blueprints: SavedBlueprint[] }>("blueprints");
  return data.blueprints ?? [];
}

export async function assignSavedBlueprint(input: {
  blueprintId: string;
  childProfileId: string | null;
}): Promise<{ ok: boolean; blueprintId: string; childProfileId: string | null }> {
  return api("blueprints/assign", { method: "POST", body: input });
}

export async function assignBlueprintMatch(input: {
  blueprintId: string;
  hustleId: string;
  childProfileId: string | null;
}): Promise<{
  ok: boolean;
  blueprintId: string;
  hustleId: string;
  childProfileId: string | null;
  matchAssignees: Record<string, string>;
}> {
  return api("blueprints/assign-match", { method: "POST", body: input });
}
