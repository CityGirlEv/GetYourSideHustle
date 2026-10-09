/**
 * One complimentary Match Wizard extra guide per lifetime.
 *
 * Free members (after signup) check 1 guide on their wizard result list.
 * That pick unlocks any membership floor. The choice is once per lifetime —
 * retakes do not grant another extra. Unique Unique Free stays separate.
 */

import { actAsUserId, readActAsTarget } from "./admin-act-as";
import { getSessionToken } from "./api";
import { accountActivationStillPending } from "./free-member-session";
import { fetchMemberProgress, saveMemberProgress } from "./gysh-member-progress";
import { getLocalStore } from "./browser-storage";
import {
  ACCOUNT_ACTIVATION_REQUIRED_ERROR,
  accountNeedsEmailActivation,
} from "./register-activation";
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
  complimentaryUnlockButtonLabel,
  complimentarySelectionError,
  explicitComplimentaryGuideId,
  freeGuideCardLine,
  isExplicitComplimentaryPick,
  pickComplimentaryExtraGuideId,
  pickTrueTopMatchId,
  storedComplimentaryPayload,
  type WizardCompMap,
} from "./wizard-comp-pick";

export const WIZARD_COMP_PROGRESS_KIND = "wizard_comp_guides" as const;
export const WIZARD_COMP_LOCAL_KEY = "gysh_wizard_comp_guides_v1";

let cachedComplimentaryIds: string[] = [];
/** In-memory pick for the member currently on screen. Never reuse it for someone else. */
let sessionClaimedGuideId: string | null = null;
let sessionClaimedUserKey: string | null = null;

function viewedComplimentaryUserKey(): string {
  return actAsUserId(readActAsTarget()) || "self";
}

function sessionPickForCurrentUser(): string | null {
  if (sessionClaimedUserKey !== viewedComplimentaryUserKey()) return null;
  return sessionClaimedGuideId;
}

function rememberSessionPick(id: string | null): void {
  sessionClaimedUserKey = viewedComplimentaryUserKey();
  sessionClaimedGuideId = id;
}

/** Drop another member's free-guide choice before this dashboard loads. */
export function prepareComplimentaryLoadForCurrentUser(): void {
  const key = viewedComplimentaryUserKey();
  if (sessionClaimedUserKey === key) return;
  sessionClaimedGuideId = null;
  sessionClaimedUserKey = key;
  writeLocalCompMap({});
  setCachedComplimentaryGuideIds([]);
}

/**
 * Remote explicit picks win. A pick saved earlier in this visit is kept when the
 * server read is still empty, so the guide stays unlocked for every free signup.
 * An `{ extra }` row with no source is not a pick.
 */
export function resolveStoredComplimentaryPick(
  remote: WizardCompMap | null | undefined,
  sessionGuideId?: string | null,
): WizardCompMap {
  const remoteId = explicitComplimentaryGuideId(remote ?? {});
  const sessionId = String(sessionGuideId || "").trim();
  const id = remoteId || sessionId || "";
  if (!id) return {};
  return { extra: id, source: "pick" };
}

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

export const GUEST_FREE_GUIDE_BUTTON_LABEL = "Select this as my free guide";

export { ACCOUNT_ACTIVATION_REQUIRED_ERROR };

/**
 * Pending accounts cannot lock a free guide until they open the activation email.
 * Logged-in Active accounts are not blocked by a leftover local reminder.
 */
export function freeGuideSelectionBlock(input: {
  isLoggedIn?: boolean;
  accountStatus?: string | null;
}): string | null {
  if (accountNeedsEmailActivation(input.accountStatus)) {
    return ACCOUNT_ACTIVATION_REQUIRED_ERROR;
  }
  if (!input.isLoggedIn && accountActivationStillPending()) {
    return ACCOUNT_ACTIVATION_REQUIRED_ERROR;
  }
  return null;
}

/**
 * Anonymous wizard: remember one free-guide choice. The first pick wins for life.
 * A later pick of a different guide is ignored.
 */
export function selectGuestFreeGuide(
  guideId: string,
  resultIds: readonly string[],
): { claimedId: string | null; alreadyClaimed: boolean; error: string | null } {
  const activationBlock = freeGuideSelectionBlock({ isLoggedIn: false });
  if (activationBlock) {
    return { claimedId: null, alreadyClaimed: false, error: activationBlock };
  }
  const id = guideId.trim();
  const allowed = new Set(resultIds.map((row) => row.trim()).filter(Boolean));
  const existing = readLocalCompMap();
  if (!id || !allowed.has(id)) {
    return {
      claimedId: explicitComplimentaryGuideId(existing),
      alreadyClaimed: Boolean(explicitComplimentaryGuideId(existing)),
      error: "Pick a guide from this Match Wizard result list.",
    };
  }
  const { next, claimedId, alreadyClaimed } = claimComplimentaryGuide(existing, id);
  writeLocalCompMap(next);
  if (alreadyClaimed && claimedId !== id) {
    return {
      claimedId,
      alreadyClaimed: true,
      error: "You already selected your 1 free guide. That choice is once per lifetime.",
    };
  }
  return { claimedId, alreadyClaimed, error: null };
}

/** Sticky local extra id after the member has checked a result. */
export function readLocalComplimentaryExtraId(): string | null {
  return explicitComplimentaryGuideId(readLocalCompMap());
}

/** New Free accounts start with no complimentary pick — drop leftover auto-grants. */
export function clearLocalComplimentaryClaim(): void {
  sessionClaimedGuideId = null;
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
  if (!isLoggedIn || !getSessionToken()) {
    writeLocalCompMap({});
    setCachedComplimentaryGuideIds([]);
    return {};
  }
  prepareComplimentaryLoadForCurrentUser();
  try {
    const remote = await fetchMemberProgress<WizardCompMap>(WIZARD_COMP_PROGRESS_KIND);
    const explicit = resolveStoredComplimentaryPick(remote, sessionPickForCurrentUser());
    const id = explicitComplimentaryGuideId(explicit);
    if (id && !explicitComplimentaryGuideId(remote ?? {}) && sessionPickForCurrentUser() === id) {
      try {
        await saveMemberProgress(WIZARD_COMP_PROGRESS_KIND, explicit);
      } catch {
        /* this visit still unlocks from the session pick */
      }
    }
    writeLocalCompMap(explicit);
    rememberSessionPick(id);
    return explicit;
  } catch {
    const sessionId = sessionPickForCurrentUser();
    if (sessionId) {
      setCachedComplimentaryGuideIds([sessionId]);
      return { extra: sessionId, source: "pick" };
    }
    writeLocalCompMap({});
    return {};
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
  accountStatus?: string | null;
  guideId: string;
  resultIds: string[];
}): Promise<{
  map: WizardCompMap;
  claimedId: string | null;
  alreadyClaimed: boolean;
  error: string | null;
}> {
  const signedIn = Boolean(input.isLoggedIn) && !input.previewAsGuest;
  const activationBlock = freeGuideSelectionBlock({
    isLoggedIn: signedIn,
    accountStatus: input.accountStatus,
  });
  if (activationBlock) {
    return {
      map: {},
      claimedId: null,
      alreadyClaimed: false,
      error: activationBlock,
    };
  }
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
      if (claimedId) rememberSessionPick(claimedId);
    } catch (err) {
      writeLocalCompMap(current);
      return {
        map: current,
        claimedId: prior,
        alreadyClaimed: Boolean(prior),
        error: err instanceof Error ? err.message : "Could not save your free guide. Try again.",
      };
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
