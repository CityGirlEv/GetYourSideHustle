/**
 * Worker-safe Match Wizard extra picker (no browser / API imports).
 * The one extra is the guide the member checks on their result list — once per lifetime.
 */

export const WIZARD_COMP_EXTRA_KEY = "extra" as const;
export const WIZARD_COMP_PICK_SOURCE = "pick" as const;

export type WizardCompMap = Partial<Record<string, string>>;

/** True only after the member checks a result — leftover auto-grants do not count. */
export function isExplicitComplimentaryPick(map: WizardCompMap): boolean {
  return (
    String(map.source || "").trim() === WIZARD_COMP_PICK_SOURCE &&
    Boolean(claimedExtraGuideId(map))
  );
}

export function explicitComplimentaryGuideId(map: WizardCompMap): string | null {
  return isExplicitComplimentaryPick(map) ? claimedExtraGuideId(map) : null;
}

/** Keep only a guide the member actually checked. Auto-assigned extras become no pick. */
export function storedComplimentaryPayload(payload: unknown): WizardCompMap {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  const id = explicitComplimentaryGuideId(payload as WizardCompMap);
  return id ? { extra: id, source: WIZARD_COMP_PICK_SOURCE } : {};
}

export function freeGuideCardLine(guideName: string | null | undefined): string {
  const name = String(guideName || "").trim();
  return name ? `Free guide: ${name}` : "Free guide: not picked yet";
}

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

/** @deprecated Use an explicit complimentary pick. Kept so existing callers compile. */
export function pickComplimentaryExtraGuideId(input: {
  resultIds: string[];
  resultPcts?: Record<string, number> | null;
}): string | null {
  return pickTrueTopMatchId(input);
}

export function claimedExtraGuideId(map: WizardCompMap): string | null {
  const extra = map[WIZARD_COMP_EXTRA_KEY]?.trim();
  if (extra) return extra;
  for (const key of ["adult", "senior", "junior", "kids"]) {
    const id = map[key]?.trim();
    if (id) return id;
  }
  return null;
}

/** Immutable claim: the first *checked* extra on the account wins. Leftover auto-grants do not. */
export function claimComplimentaryGuide(
  existing: WizardCompMap,
  extraGuideId: string | null | undefined,
): { next: WizardCompMap; claimedId: string | null; alreadyClaimed: boolean } {
  const prior = explicitComplimentaryGuideId(existing);
  if (prior) {
    return { next: existing, claimedId: prior, alreadyClaimed: true };
  }
  const id = extraGuideId?.trim() || null;
  if (!id) {
    return { next: existing, claimedId: null, alreadyClaimed: false };
  }
  return {
    next: { [WIZARD_COMP_EXTRA_KEY]: id, source: WIZARD_COMP_PICK_SOURCE },
    claimedId: id,
    alreadyClaimed: false,
  };
}

export function complimentaryGuideIds(map: WizardCompMap): string[] {
  const id = explicitComplimentaryGuideId(map);
  return id ? [id] : [];
}

export function complimentarySelectionError(input: {
  selectedId: string | null | undefined;
  resultIds: readonly string[];
  alreadyClaimedId?: string | null;
  alreadyOnFree?: boolean;
}): string | null {
  const prior = String(input.alreadyClaimedId || "").trim();
  if (prior) return "You already used your 1 complimentary guide unlock.";
  const id = String(input.selectedId || "").trim();
  if (!id) return "Unlock 1 guide from your results.";
  const allowed = new Set(input.resultIds.map((x) => x.trim()).filter(Boolean));
  if (!allowed.has(id)) return "Pick a guide from this Match Wizard result list.";
  if (input.alreadyOnFree) {
    return "This guide is already on Unique Unique Free. Pick a Starter, Pro, or Elite match for your 1 complimentary unlock.";
  }
  return null;
}

export function complimentaryPickNotice(): string {
  return "Free members get to unlock 1 complimentary Launch Guide from this Blueprint — Starter, Pro, or Elite included. Use Unlock this complimentary guide on the match you want. This choice is once per lifetime.";
}

export function complimentaryUnlockButtonLabel(busy = false): string {
  return busy ? "Unlocking…" : "Select this as my free guide";
}

/** True when this logged-in member has not already chosen their one extra. */
export function canOfferComplimentaryPick(input: {
  isLoggedIn?: boolean;
  previewAsGuest?: boolean;
  claimedId?: string | null;
  membershipTier?: string | null;
}): boolean {
  if (input.previewAsGuest) return false;
  if (!input.isLoggedIn) return false;
  void input.membershipTier;
  return !String(input.claimedId || "").trim();
}

