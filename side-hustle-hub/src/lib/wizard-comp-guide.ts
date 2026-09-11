/**
 * One complimentary Match Wizard guide unlock per demographic.
 *
 * Rule: on the first completed Blueprint for an age group, the true top match
 * (highest match %) is claimed forever for that account + age group.
 * Retakes may reorder results but do not grant another paid guide.
 */

import type { BlueprintAgeGroup } from "./gysh-analytics";
import { fetchMemberProgress, saveMemberProgress } from "./gysh-member-progress";
import { getLocalStore } from "./browser-storage";
import { isFreeWizardHustle } from "./side-hustle-catalog";

export const WIZARD_COMP_PROGRESS_KIND = "wizard_comp_guides" as const;
export const WIZARD_COMP_LOCAL_KEY = "gysh_wizard_comp_guides_v1";

export type WizardCompMap = Partial<Record<BlueprintAgeGroup, string>>;

export function pickTrueTopMatchId(input: {
  resultIds: string[];
  resultPcts?: Record<string, number> | null;
}): string | null {
  const ids = input.resultIds.map((id) => id.trim()).filter(Boolean);
  if (!ids.length) return null;
  const pcts = input.resultPcts ?? {};
  let bestId = ids[0];
  let bestPct = Number(pcts[bestId] ?? -1);
  for (const id of ids) {
    const pct = Number(pcts[id] ?? -1);
    if (pct > bestPct) {
      bestPct = pct;
      bestId = id;
    }
  }
  return bestId;
}

/** Immutable claim: existing age-group unlock wins. */
export function claimComplimentaryGuide(
  existing: WizardCompMap,
  ageGroup: BlueprintAgeGroup,
  topGuideId: string | null | undefined,
): { next: WizardCompMap; claimedId: string | null; alreadyClaimed: boolean } {
  const prior = existing[ageGroup]?.trim() || null;
  if (prior) {
    return { next: existing, claimedId: prior, alreadyClaimed: true };
  }
  const id = topGuideId?.trim() || null;
  if (!id) {
    return { next: existing, claimedId: null, alreadyClaimed: false };
  }
  return {
    next: { ...existing, [ageGroup]: id },
    claimedId: id,
    alreadyClaimed: false,
  };
}

export function complimentaryGuideIds(map: WizardCompMap): string[] {
  return Object.values(map).filter((id): id is string => Boolean(id?.trim()));
}

export function isComplimentaryGuide(
  map: WizardCompMap,
  guideId: string,
  ageGroup?: BlueprintAgeGroup,
): boolean {
  const id = guideId.trim();
  if (!id) return false;
  if (ageGroup) return map[ageGroup] === id;
  return complimentaryGuideIds(map).includes(id);
}

export function complimentaryUnlockNote(guideId: string): string {
  if (isFreeWizardHustle(guideId)) {
    return "Already on the Free Membership library — open anytime. Your complimentary slot for this demographic is marked so retakes cannot unlock extra paid guides.";
  }
  return "Complimentary unlock from your Match Wizard — one top-match guide per Kids / Teens / Adult / Senior Blueprint. Retaking the wizard will not unlock more paid guides.";
}

export function wizardCompUserFacingRule(): string {
  return "Free members get every Free-library guide anytime, plus one complimentary top-match guide per demographic from your first Blueprint save. Retakes update rankings but do not unlock more paid guides. Upgrade to open the rest.";
}

function readLocalCompMap(): WizardCompMap {
  try {
    const raw = getLocalStore().getItem(WIZARD_COMP_LOCAL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as WizardCompMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocalCompMap(map: WizardCompMap): void {
  getLocalStore().setItem(WIZARD_COMP_LOCAL_KEY, JSON.stringify(map));
}

/** Merge server + local; prefer first claim (do not overwrite with a different guide). */
export function mergeCompMaps(a: WizardCompMap, b: WizardCompMap): WizardCompMap {
  const out: WizardCompMap = { ...a };
  for (const key of ["kids", "junior", "adult", "senior"] as BlueprintAgeGroup[]) {
    if (!out[key] && b[key]) out[key] = b[key];
  }
  return out;
}

export async function loadComplimentaryGuides(isLoggedIn: boolean): Promise<WizardCompMap> {
  const local = readLocalCompMap();
  if (!isLoggedIn) return local;
  try {
    const remote = await fetchMemberProgress<WizardCompMap>(WIZARD_COMP_PROGRESS_KIND);
    const merged = mergeCompMaps(remote ?? {}, local);
    writeLocalCompMap(merged);
    if (JSON.stringify(merged) !== JSON.stringify(remote ?? {})) {
      await saveMemberProgress(WIZARD_COMP_PROGRESS_KIND, merged);
    }
    return merged;
  } catch {
    return local;
  }
}

/**
 * Claim top match for this age group (no-op if already claimed).
 * Returns the guide id that is unlocked for this demographic.
 */
export async function ensureComplimentaryClaim(input: {
  isLoggedIn: boolean;
  ageGroup: BlueprintAgeGroup;
  resultIds: string[];
  resultPcts?: Record<string, number> | null;
}): Promise<{ map: WizardCompMap; claimedId: string | null; alreadyClaimed: boolean }> {
  const top = pickTrueTopMatchId({
    resultIds: input.resultIds,
    resultPcts: input.resultPcts,
  });
  const current = await loadComplimentaryGuides(input.isLoggedIn);
  const { next, claimedId, alreadyClaimed } = claimComplimentaryGuide(
    current,
    input.ageGroup,
    top,
  );
  writeLocalCompMap(next);
  if (input.isLoggedIn && !alreadyClaimed && claimedId) {
    try {
      await saveMemberProgress(WIZARD_COMP_PROGRESS_KIND, next);
    } catch {
      /* local map still applies until next sync */
    }
  }
  return { map: next, claimedId, alreadyClaimed };
}
