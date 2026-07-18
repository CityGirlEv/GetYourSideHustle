import type { BlueprintAgeGroup } from "./gysh-analytics";
import { getLocalStore } from "./browser-storage";
import { postPendingBlueprint } from "./blueprints-api";

export const PENDING_BLUEPRINT_KEY = "gysh_pending_blueprint_v1";
export const PENDING_BLUEPRINT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type PendingBlueprintReturnView = "quiz" | "kids" | "seniors";

export type PendingBlueprint = {
  version: 1;
  ageGroup: BlueprintAgeGroup;
  answers: Record<string, unknown>;
  resultIds: string[];
  /** Relative match percents when the wizard computed them (display only; recalculate when possible). */
  resultPcts?: Record<string, number>;
  completedAt: string;
  returnView: PendingBlueprintReturnView;
  returnTab?: string;
  /** Opaque server claim token — never put answers in the URL. */
  claimToken?: string;
};

export function isPendingBlueprintFresh(pending: PendingBlueprint, now = Date.now()): boolean {
  const completed = Date.parse(pending.completedAt);
  if (Number.isNaN(completed)) return false;
  return now - completed <= PENDING_BLUEPRINT_TTL_MS;
}

export function savePendingBlueprint(
  input: Omit<PendingBlueprint, "version" | "completedAt"> & { completedAt?: string },
): PendingBlueprint {
  const payload: PendingBlueprint = {
    version: 1,
    ageGroup: input.ageGroup,
    answers: input.answers,
    resultIds: input.resultIds,
    resultPcts: input.resultPcts,
    completedAt: input.completedAt ?? new Date().toISOString(),
    returnView: input.returnView,
    returnTab: input.returnTab,
    claimToken: input.claimToken,
  };
  getLocalStore().setItem(PENDING_BLUEPRINT_KEY, JSON.stringify(payload));
  return payload;
}

/** Persist locally and best-effort sync a claim token to D1. */
export async function savePendingBlueprintAsync(
  input: Omit<PendingBlueprint, "version" | "completedAt" | "claimToken"> & {
    completedAt?: string;
  },
): Promise<PendingBlueprint> {
  const local = savePendingBlueprint(input);
  const claimToken = await postPendingBlueprint(local);
  if (!claimToken) return local;
  return savePendingBlueprint({ ...local, claimToken });
}

export function readPendingBlueprint(): PendingBlueprint | null {
  try {
    const raw = getLocalStore().getItem(PENDING_BLUEPRINT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingBlueprint;
    if (!parsed || parsed.version !== 1 || !parsed.ageGroup || !Array.isArray(parsed.resultIds)) {
      clearPendingBlueprint();
      return null;
    }
    if (!isPendingBlueprintFresh(parsed)) {
      clearPendingBlueprint();
      return null;
    }
    return parsed;
  } catch {
    clearPendingBlueprint();
    return null;
  }
}

export function clearPendingBlueprint(): void {
  getLocalStore().removeItem(PENDING_BLUEPRINT_KEY);
}

export function peekPendingBlueprintFor(ageGroup: BlueprintAgeGroup): PendingBlueprint | null {
  const pending = readPendingBlueprint();
  if (!pending || pending.ageGroup !== ageGroup) return null;
  return pending;
}
