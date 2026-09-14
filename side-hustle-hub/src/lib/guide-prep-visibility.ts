/**
 * Which GuidePrepSections tabs are available for a kit / lock state.
 * Locked guides preview Prerequisites only — hide pricing, supplies, tools, steps, calculator.
 * Notes can still appear when includeNotes is set (logged-in members).
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

/**
 * Canonical Guide prep tabs (UI left-to-right) for QA review — every GUIDE-REV
 * case must open each of these, not only Show All.
 */
export const GUIDE_PREP_REVIEW_TAB_LABELS = [
  "Show All",
  "Prerequisites",
  "Suggested Pricing",
  "Supply List",
  "Tools",
  "Steps",
  "Revenue Calculator",
] as const;

/** Comma list used in Testing Portal step / expected copy. */
export const GUIDE_PREP_REVIEW_TABS_PHRASE =
  "Show All, Prerequisites, Suggested Pricing, Supply List, Tools, Steps, and Revenue Calculator";

export function guidePrepSectionIds(opts: {
  kit: Pick<GuideKit, "prerequisites" | "suggestedPricing" | "supplies" | "tools">;
  /** Membership-locked: Prerequisites only (no Show All / tools / steps). */
  prerequisitesOnly?: boolean;
  includeSteps?: boolean;
  includeCalculator?: boolean;
  includeNotes?: boolean;
}): GuidePrepSectionId[] {
  const prereqsOnly = opts.prerequisitesOnly === true;
  if (prereqsOnly) {
    return opts.includeNotes ? ["prereqs", "notes"] : ["prereqs"];
  }

  const ids: GuidePrepSectionId[] = ["all", "prereqs", "pricing", "supplies", "tools"];
  if (opts.includeSteps) ids.push("steps");
  if (opts.includeCalculator) ids.push("calculator");
  if (opts.includeNotes) ids.push("notes");
  return ids;
}
