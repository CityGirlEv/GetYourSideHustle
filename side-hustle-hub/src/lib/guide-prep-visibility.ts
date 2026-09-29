/**
 * Which GuidePrepSections tabs are available for a kit / lock state.
 * About (prereqs) is public on every guide. Other tabs stay listed so the UI can
 * show membership locks instead of hiding them.
 */

import type { GuideKit } from "./guide-tools";

export type GuidePrepSectionId =
  | "all"
  | "prereqs"
  | "pricing"
  | "supplies"
  | "tools"
  | "steps"
  | "calculator"
  | "notes";

/** User-facing name of the prereqs tab (Show All + dedicated tab). */
export const GUIDE_PREP_ABOUT_TAB_LABEL = "About";

/** First tab opened on every guide. */
export const GUIDE_PREP_DEFAULT_TAB: GuidePrepSectionId = "prereqs";

/**
 * Canonical Guide prep tabs (UI left-to-right) for QA review — every GUIDE-REV
 * case must open each of these, not only Show All.
 */
export const GUIDE_PREP_REVIEW_TAB_LABELS = [
  "Show All",
  GUIDE_PREP_ABOUT_TAB_LABEL,
  "Suggested Pricing",
  "Supply List",
  "Tools",
  "Steps",
  "Revenue Calculator",
] as const;

/** Comma list used in Testing Portal step / expected copy. */
export const GUIDE_PREP_REVIEW_TABS_PHRASE =
  `Show All, ${GUIDE_PREP_ABOUT_TAB_LABEL}, Suggested Pricing, Supply List, Tools, Steps, and Revenue Calculator`;

/** About is readable without membership; every other tab follows the guide gate. */
export function isPublicGuidePrepTab(id: GuidePrepSectionId): boolean {
  return id === "prereqs";
}

export function guidePrepTabIsLocked(
  id: GuidePrepSectionId,
  guideUnlocked: boolean,
): boolean {
  if (guideUnlocked) return false;
  return !isPublicGuidePrepTab(id);
}

export function guidePrepSectionIds(opts: {
  kit: Pick<GuideKit, "prerequisites" | "suggestedPricing" | "supplies" | "tools">;
  /**
   * @deprecated Locking is per-tab (About stays public). Kept so callers that
   * passed this still receive the full tab list.
   */
  prerequisitesOnly?: boolean;
  includeSteps?: boolean;
  includeCalculator?: boolean;
  includeNotes?: boolean;
}): GuidePrepSectionId[] {
  const ids: GuidePrepSectionId[] = ["all", "prereqs", "pricing", "supplies", "tools"];
  if (opts.includeSteps) ids.push("steps");
  if (opts.includeCalculator) ids.push("calculator");
  if (opts.includeNotes) ids.push("notes");
  return ids;
}
