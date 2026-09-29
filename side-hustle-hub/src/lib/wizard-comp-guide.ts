/**
 * One complimentary Match Wizard extra guide per lifetime.
 *
 * Free members (after signup) check 1 guide on their wizard result list.
 * That pick unlocks any membership floor. The choice is once per lifetime —
 * retakes do not grant another extra. Unique Unique Free stays separate.
 */

import { getSessionToken } from "./api";
import { fetchMemberProgress, saveMemberProgress } from "./gysh-member-progress";
import { getLocalStore } from "./browser-storage";
import { isFreeWizardHustle } from "./side-hustle-catalog";
import {
  canOfferComplimentaryPick,
  claimComplimentaryGuide,
  complimentaryGuideIds,
  complimentarySelectionError,
  explicitComplimentaryGuideId,
  type WizardCompMap,
} from "./wizard-comp-pick";

export {
  WIZARD_COMP_EXTRA_KEY,
  WIZARD_COMP_PICK_SOURCE,
  canOfferComplimentaryPick,
  claimComplimentaryGuide,
  claimedExtraGuideId,
  complimentaryGuideIds,
  complimentaryPickNotice,
  complimentarySelectionError,
  explicitComplimentaryGuideId,
  isExplicitComplimentaryPick,
  pickComplimentaryExtraGuideId,
  pickTrueTopMatchId,
  type WizardCompMap,
} from "./wizard-comp-pick";

export const WIZARD_COMP_PROGRESS_KIND = "wizard_comp_guides" as const;
export const WIZARD_COMP_LOCAL_KEY = "gysh_wizard_comp_guides_v1";

let cachedComplimentaryIds: string[] = [];

export function setCachedComplimentaryGuideIds(ids: readonly string[]): void {
  cachedComplimentaryIds = ids.map((id) => id.trim()).filter(Boolean);
}

export function cachedComplimentaryGuideIds(): string[] {
  return cachedComplimentaryIds;
}

export function isComplimentaryGuide(map: WizardCompMap, guideId: string): boolean {
  const id = guideId.trim();
  if (!id) return false;
  return explicitComplimentaryGuideId(map) === id;
}

export function wizardCompUserFacingRule(): string {
  return "After you create a Free account, check 1 Match Wizard result as your complimentary Launch Guide — even if that extra is Starter, Pro, or Elite. That gift is once per lifetime. Free members also keep Unique Unique Free. You cannot unlock another extra later.";
}

/** Sticky local extra id after the member has checked a result. */
export function readLocalComplimentaryExtraId(): string | null {
  return explicitComplimentaryGuideId(readLocalCompMap());
}

/** New Free accounts start with no complimentary pick — drop leftover auto-grants. */
export function clearLocalComplimentaryClaim(): void {
  writeLocalCompMap({});
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
  setCachedComplimentaryGuideIds(complimentaryGuideIds(map));
}

/** Merge server + local; only an explicit checked pick counts. */
export function mergeCompMaps(a: WizardCompMap, b: WizardCompMap): WizardCompMap {
  const extra = explicitComplimentaryGuideId(a) || explicitComplimentaryGuideId(b);
  if (!extra) return {};
  return { extra, source: "pick" };
}

export async function loadComplimentaryGuides(isLoggedIn: boolean): Promise<WizardCompMap> {
  const local = readLocalCompMap();
  if (!isLoggedIn || !getSessionToken()) {
    const explicit = mergeCompMaps(local, {});
    writeLocalCompMap(explicit);
    setCachedComplimentaryGuideIds(complimentaryGuideIds(explicit));
    return explicit;
  }
  try {
    const remote = await fetchMemberProgress<WizardCompMap>(WIZARD_COMP_PROGRESS_KIND);
    const merged = mergeCompMaps(remote ?? {}, local);
    writeLocalCompMap(merged);
    if (explicitComplimentaryGuideId(merged) && !explicitComplimentaryGuideId(remote ?? {})) {
      await saveMemberProgress(WIZARD_COMP_PROGRESS_KIND, merged);
    }
    return merged;
  } catch {
    const explicit = mergeCompMaps(local, {});
    setCachedComplimentaryGuideIds(complimentaryGuideIds(explicit));
    return explicit;
  }
}

/**
 * Unlock the checked result as the one lifetime extra.
 * Guests cannot claim — they must create a Free account first.
 */
export async function claimSelectedComplimentaryGuide(input: {
  isLoggedIn?: boolean;
  previewAsGuest?: boolean;
  membershipTier?: string | null;
  guideId: string;
  resultIds: string[];
}): Promise<{
  map: WizardCompMap;
  claimedId: string | null;
  alreadyClaimed: boolean;
  error: string | null;
}> {
  if (input.previewAsGuest || !input.isLoggedIn) {
    return {
      map: {},
      claimedId: null,
      alreadyClaimed: false,
      error: "Create a Free account to pick your 1 complimentary guide.",
    };
  }
  if (!canOfferComplimentaryPick({ isLoggedIn: true, membershipTier: input.membershipTier })) {
    const current = await loadComplimentaryGuides(true);
    const prior = explicitComplimentaryGuideId(current);
    if (prior) {
      return {
        map: current,
        claimedId: prior,
        alreadyClaimed: true,
        error: complimentarySelectionError({
          selectedId: input.guideId,
          resultIds: input.resultIds,
          alreadyClaimedId: prior,
        }),
      };
    }
    return {
      map: current,
      claimedId: null,
      alreadyClaimed: false,
      error: "Complimentary unlock is for Free members — 1 guide, once.",
    };
  }
  const current = await loadComplimentaryGuides(true);
  const prior = explicitComplimentaryGuideId(current);
  const selectionError = complimentarySelectionError({
    selectedId: input.guideId,
    resultIds: input.resultIds,
    alreadyClaimedId: prior,
    alreadyOnFree: isFreeWizardHustle(input.guideId),
  });
  if (selectionError) {
    return {
      map: current,
      claimedId: prior,
      alreadyClaimed: Boolean(prior),
      error: selectionError,
    };
  }
  const { next, claimedId, alreadyClaimed } = claimComplimentaryGuide(current, input.guideId);
  writeLocalCompMap(next);
  if (!alreadyClaimed && claimedId && getSessionToken()) {
    try {
      await saveMemberProgress(WIZARD_COMP_PROGRESS_KIND, next);
    } catch {
      /* local map still applies until next sync */
    }
  }
  return { map: next, claimedId, alreadyClaimed, error: null };
}

export function canOfferComplimentaryPickForSession(input: {
  isLoggedIn?: boolean;
  previewAsGuest?: boolean;
  membershipTier?: string | null;
}): boolean {
  return canOfferComplimentaryPick({
    isLoggedIn: input.isLoggedIn,
    previewAsGuest: input.previewAsGuest,
    membershipTier: input.membershipTier,
    claimedId: cachedComplimentaryGuideIds()[0] ?? null,
  });
}

/**
 * Load the existing lifetime extra. Does not auto-pick a match —
 * the member must check 1 result after Free signup.
 */
export async function ensureComplimentaryClaim(input: {
  isLoggedIn?: boolean;
  previewAsGuest?: boolean;
  resultIds?: string[];
  resultPcts?: Record<string, number> | null;
}): Promise<{
  map: WizardCompMap;
  claimedId: string | null;
  alreadyClaimed: boolean;
}> {
  if (input.previewAsGuest) {
    return { map: {}, claimedId: null, alreadyClaimed: false };
  }
  const map = await loadComplimentaryGuides(Boolean(input.isLoggedIn));
  const claimedId = explicitComplimentaryGuideId(map);
  return { map, claimedId, alreadyClaimed: Boolean(claimedId) };
}
