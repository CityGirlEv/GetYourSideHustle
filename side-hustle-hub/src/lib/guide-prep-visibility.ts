/**
 * Which GuidePrepSections tabs are available for a kit / lock state.
 * Locked guides preview Prerequisites only — hide pricing, supplies, tools, steps, calculator.
 */

import type { GuideKit } from "./guide-tools";

export type GuidePrepSectionId =
  | "all"
  | "prereqs"
  | "pricing"
  | "supplies"
  | "tools"
  | "steps"
  | "calculator";

export function guidePrepSectionIds(opts: {
  kit: Pick<GuideKit, "prerequisites" | "suggestedPricing" | "supplies" | "tools">;
  /** Membership-locked: Prerequisites only (no Show All / tools / steps). */
  prerequisitesOnly?: boolean;
  includeSteps?: boolean;
  includeCalculator?: boolean;
}): GuidePrepSectionId[] {
  const prereqsOnly = opts.prerequisitesOnly === true;
  if (prereqsOnly) return ["prereqs"];

  const ids: GuidePrepSectionId[] = ["all", "prereqs"];
  if (opts.kit.suggestedPricing && opts.kit.suggestedPricing.items.length > 0) {
    ids.push("pricing");
  }
  if (opts.kit.supplies && opts.kit.supplies.items.length > 0) {
    ids.push("supplies");
  }
  ids.push("tools");
  if (opts.includeSteps) ids.push("steps");
  if (opts.includeCalculator) ids.push("calculator");
  return ids;
}
