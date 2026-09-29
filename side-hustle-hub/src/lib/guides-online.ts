/**
 * Public Guides library online switch.
 * Set GUIDES_PUBLIC_ONLINE to true when ready to restore Guides for members/guests.
 * Admin and QA always keep access (unless previewing as a member).
 */

/** Flip to `true` only when the user asks to put Guides back online. */
export const GUIDES_PUBLIC_ONLINE = true;

export type GuidesAccessActor = {
  isAdmin?: boolean;
  isQa?: boolean;
  /** Profile Switcher viewing as a member — treat like a normal member. */
  previewingAsMember?: boolean;
};

/** True when this actor may open the live Guides library / guide detail. */
export function canAccessLiveGuides(actor: GuidesAccessActor = {}): boolean {
  if (GUIDES_PUBLIC_ONLINE) return true;
  if (actor.previewingAsMember) return false;
  return actor.isAdmin === true || actor.isQa === true;
}

/** True when members/guests should see the “Guides are being updated” screen. */
export function showGuidesUpdatingScreen(actor: GuidesAccessActor = {}): boolean {
  return !canAccessLiveGuides(actor);
}

/**
 * Home header library count tag next to the brand.
 * Hidden while public Guides are offline — restore with GUIDES_PUBLIC_ONLINE.
 */
export function showHomeGuidesLibraryTag(): boolean {
  return GUIDES_PUBLIC_ONLINE;
}
