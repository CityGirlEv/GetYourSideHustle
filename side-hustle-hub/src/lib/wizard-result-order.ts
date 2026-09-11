/**
 * Wizard result ordering helpers.
 * Default display: highest match % first (true top match).
 * Free Membership library hustles are called out separately in Blueprint copy.
 */

import { isFreeWizardHustle } from "./side-hustle-catalog";

export type WizardScoredRow = { id: string; score: number };

/** Highest score first; stable tie-break by id. */
export function compareWizardByScore(a: WizardScoredRow, b: WizardScoredRow): number {
  if (b.score !== a.score) return b.score - a.score;
  return a.id.localeCompare(b.id);
}

export function sortWizardByMatchScore<T extends WizardScoredRow>(rows: T[]): T[] {
  return [...rows].sort(compareWizardByScore);
}

/** @deprecated Prefer sortWizardByMatchScore — kept for older free-first experiments. */
export function compareWizardRank(a: WizardScoredRow, b: WizardScoredRow): number {
  const aFree = isFreeWizardHustle(a.id) ? 0 : 1;
  const bFree = isFreeWizardHustle(b.id) ? 0 : 1;
  if (aFree !== bFree) return aFree - bFree;
  return compareWizardByScore(a, b);
}

/** @deprecated Prefer sortWizardByMatchScore */
export function sortWizardFreeFirstThenScore<T extends WizardScoredRow>(rows: T[]): T[] {
  return [...rows].sort(compareWizardRank);
}

export function relativeMatchPct(score: number, maxScore: number): number {
  const max = Math.max(maxScore, 1);
  return Math.round((score / max) * 100);
}

export function wizardMatchTierLabel(index: number, pct: number, hustleId: string): string {
  const free = isFreeWizardHustle(hustleId);
  if (index === 0) return "Best match";
  if (free) return "Free library match";
  if (pct >= 70 || index === 1) return "Strong match";
  return "Good fit";
}

export function wizardRankingDisclaimer(): string {
  return "Matches are ranked by how well they fit your answers (highest % first). Free members always keep the Free-library guides, plus one complimentary unlock of your first Blueprint’s #1 match for this demographic. Retakes do not unlock more paid guides — upgrade to open the rest.";
}

export function wizardRankingShortNote(): string {
  return "Highest match % first. One complimentary #1 unlock per demographic — retakes won’t farm more.";
}

/** How many ranked matches to show on Blueprint results. */
export const WIZARD_TOP_MATCH_COUNT = 10;

/** True when any of the top N match ids is a Free-library guide. */
export function topMatchesIncludeFree(
  matchIds: readonly string[],
  isFree: (id: string) => boolean,
  topN: number = WIZARD_TOP_MATCH_COUNT,
): boolean {
  return matchIds.slice(0, topN).some((id) => isFree(id));
}
