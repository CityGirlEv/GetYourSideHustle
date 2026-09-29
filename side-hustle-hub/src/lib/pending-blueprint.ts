import type { BlueprintAgeGroup } from "./gysh-analytics";
import { getLocalStore } from "./browser-storage";
import {
  claimBlueprint,
  listSavedBlueprints,
  postPendingBlueprint,
  saveBlueprintToAccount,
} from "./blueprints-api";
import { ensureComplimentaryClaim } from "./wizard-comp-guide";

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

/** Fields to send on /auth/register so the finished Match Wizard lands on the new profile. */
export function pendingWizardRegisterPayload(pending: PendingBlueprint | null): {
  claimToken?: string;
  pendingBlueprint?: {
    ageGroup: BlueprintAgeGroup;
    answers: Record<string, unknown>;
    resultIds: string[];
    resultPcts: Record<string, number>;
  };
} {
  if (!pending?.resultIds?.length) return {};
  return {
    ...(pending.claimToken ? { claimToken: pending.claimToken } : {}),
    pendingBlueprint: {
      ageGroup: pending.ageGroup,
      answers: pending.answers,
      resultIds: pending.resultIds,
      resultPcts: pending.resultPcts ?? {},
    },
  };
}

/** After login (session token present): claim or POST the local pending wizard. */
export async function attachPendingWizardToAccount(
  childProfileId?: string | null,
): Promise<boolean> {
  const pending = readPendingBlueprint();
  if (!pending?.resultIds?.length) return false;
  try {
    try {
      const existing = await listSavedBlueprints();
      const already = existing.some(
        (bp) =>
          bp.ageGroup === pending.ageGroup &&
          JSON.stringify(bp.resultIds) === JSON.stringify(pending.resultIds),
      );
      if (already) {
        await ensureComplimentaryClaim({
          isLoggedIn: true,
          resultIds: pending.resultIds,
          resultPcts: pending.resultPcts,
        });
        clearPendingBlueprint();
        return true;
      }
    } catch {
      /* no session yet — try claim/save below */
    }
    if (pending.claimToken) {
      try {
        await claimBlueprint(pending.claimToken, childProfileId ?? null);
        await ensureComplimentaryClaim({
          isLoggedIn: true,
          resultIds: pending.resultIds,
          resultPcts: pending.resultPcts,
        });
        clearPendingBlueprint();
        return true;
      } catch {
        /* fall through to a direct save */
      }
    }
    const saved = await saveBlueprintToAccount({
      ageGroup: pending.ageGroup,
      answers: pending.answers,
      resultIds: pending.resultIds,
      resultPcts: pending.resultPcts,
      childProfileId: childProfileId ?? null,
      claimToken: pending.claimToken,
    });
    if (saved) {
      await ensureComplimentaryClaim({
        isLoggedIn: true,
        resultIds: pending.resultIds,
        resultPcts: pending.resultPcts,
      });
      clearPendingBlueprint();
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Load any explicit complimentary pick already on the account.
 * Does not auto-claim a match — the member must check 1 result after Free signup.
 */
export async function recoverComplimentaryFromWizard(isLoggedIn: boolean): Promise<string | null> {
  const pending = readPendingBlueprint();
  if (pending?.resultIds?.length) {
    const { claimedId } = await ensureComplimentaryClaim({
      isLoggedIn,
      resultIds: pending.resultIds,
      resultPcts: pending.resultPcts,
    });
    return claimedId;
  }
  if (!isLoggedIn) return null;
  try {
    const rows = await listSavedBlueprints();
    const bp = rows.find((row) => row.resultIds?.length);
    if (bp?.resultIds?.length) {
      const { claimedId } = await ensureComplimentaryClaim({
        isLoggedIn: true,
        resultIds: bp.resultIds,
        resultPcts: bp.resultPcts,
      });
      return claimedId;
    }
  } catch {
    /* no session yet */
  }
  return null;
}
