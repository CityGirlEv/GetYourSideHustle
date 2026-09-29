/**
 * Kids / Teens Match Wizard pool — always derived from SIDE_HUSTLES audiences
 * so newly added catalog hustles are ranked automatically.
 */

import { hustleById, kidsScoreEntries, type SideHustleRecord } from "./side-hustle-catalog";
import type { KidsAudienceMode, KidsHustleTags, KidsScoreHustle } from "./kids-match-score";

export type KidsWizardDisplayHustle = KidsScoreHustle & {
  name: string;
  desc: string;
  pay: string;
  difficulty: string;
  safety: string;
  nextSteps: string[];
};

/** Optional hand-tuned copy layered on catalog rows (id → overrides). */
export type KidsWizardCopyOverride = Partial<
  Pick<KidsWizardDisplayHustle, "name" | "desc" | "pay" | "difficulty" | "safety" | "nextSteps">
>;

function defaultSafety(h: SideHustleRecord | undefined): string {
  if (h?.adultSupervisionRequired) {
    return "Always work with a parent or guardian nearby. Never share personal details online.";
  }
  return "Talk it over at home first. Stay local, keep schoolwork first, and never go into a stranger’s house alone.";
}

function toDisplay(
  entry: KidsScoreHustle,
  overrides: Record<string, KidsWizardCopyOverride> = {},
): KidsWizardDisplayHustle {
  const cat = hustleById(entry.id);
  const rich = overrides[entry.id] ?? {};
  return {
    ...entry,
    name: rich.name ?? cat?.name ?? entry.id,
    desc: rich.desc ?? cat?.description ?? cat?.fullDescription ?? "",
    pay: rich.pay ?? cat?.potentialIncome ?? "",
    difficulty: rich.difficulty ?? cat?.difficulty ?? "Easy",
    safety: rich.safety ?? defaultSafety(cat),
    nextSteps:
      rich.nextSteps ??
      (cat?.howToStartToday?.length ? cat.howToStartToday.slice(0, 3) : ["Ask a parent how to start safely."]),
    tags: entry.tags as KidsHustleTags,
  };
}

/** Full wizard/ranking pool for Kids or Teens — every catalog hustle tagged for that audience. */
export function kidsWizardPoolForMode(
  mode: KidsAudienceMode,
  overrides: Record<string, KidsWizardCopyOverride> = {},
): KidsWizardDisplayHustle[] {
  return kidsScoreEntries(mode).map((entry) => toDisplay(entry, overrides));
}

/** Every kids + junior catalog id (for coverage tests). */
export function allKidsJuniorCatalogIds(): string[] {
  const ids = new Set<string>();
  for (const h of kidsScoreEntries("kids")) ids.add(h.id);
  for (const h of kidsScoreEntries("junior")) ids.add(h.id);
  return [...ids];
}
