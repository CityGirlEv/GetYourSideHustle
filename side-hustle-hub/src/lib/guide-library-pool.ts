/**
 * Unique Guide Library inventory (Show All ages) — same pools as FreeGuidesPage admin view.
 * Used for status-tab totals (Active+Pending+… = unique count) and stable guide numbers.
 */

import {
  adultLibraryMinTier,
  kidsLibraryMinTier,
  juniorLibraryMinTier,
  seniorLibraryMinTier,
} from "./age-library-tiers";
import { guideTierSortRank, type GuideMinTier } from "./guide-access";
import {
  getGuideVisibilityStatus,
  guideMatchesStatusFilter,
  type GuideCatalogStateMap,
} from "./guide-catalog-state";
import { guidesForAudience } from "./kids-guides";
import { LAUNCH_GUIDES } from "./launch-guides";
import { orderedSeniorGuides, SENIOR_GUIDE_TEASERS } from "./seniors-content";
import {
  hustleById,
  SIDE_HUSTLES,
  type HustleAgeGroup,
} from "./side-hustle-catalog";

export type GuideLibraryEntry = {
  id: string;
  name: string;
  /** Lowest membership tier across ages where this guide appears. */
  minTier: GuideMinTier;
};

function launchForAge(age: HustleAgeGroup): { id: string; name: string }[] {
  const fromLaunch = LAUNCH_GUIDES.filter((g) => hustleById(g.id)?.audiences.includes(age));
  const seen = new Set(fromLaunch.map((g) => g.id));
  const extras = SIDE_HUSTLES.filter((h) => h.audiences.includes(age) && !seen.has(h.id)).map(
    (h) => ({
      id: h.id,
      name: h.name,
    }),
  );
  return [...fromLaunch.map((g) => ({ id: g.id, name: g.name })), ...extras];
}

/** Per-age library rows (unique by id within the age), matching FreeGuidesPage. */
export function guideLibraryAgePools(): {
  kids: { id: string; name: string }[];
  junior: { id: string; name: string }[];
  adult: { id: string; name: string }[];
  senior: { id: string; name: string; launchGuideId?: string }[];
} {
  const kidsLaunch = launchForAge("kids");
  const kidsSeen = new Set(kidsLaunch.map((g) => g.id));
  const kids = [
    ...kidsLaunch,
    ...guidesForAudience("kids")
      .filter((g) => !kidsSeen.has(g.id))
      .map((g) => ({ id: g.id, name: g.title })),
  ];

  const juniorLaunch = launchForAge("junior");
  const juniorSeen = new Set(juniorLaunch.map((g) => g.id));
  const junior = [
    ...juniorLaunch,
    ...guidesForAudience("junior")
      .filter((g) => !juniorSeen.has(g.id))
      .map((g) => ({ id: g.id, name: g.title })),
  ];

  const adult = launchForAge("adult");

  const seniorLaunch = launchForAge("senior");
  const seniorSeen = new Set(seniorLaunch.map((g) => g.id));
  const teasers = orderedSeniorGuides(SENIOR_GUIDE_TEASERS).filter(
    (g) => g.status !== "coming_soon" && !(g.launchGuideId && seniorSeen.has(g.launchGuideId)),
  );
  const senior = [
    ...seniorLaunch.map((g) => ({ id: g.id, name: g.name, launchGuideId: g.id })),
    ...teasers.map((g) => ({ id: g.id, name: g.title, launchGuideId: g.launchGuideId })),
  ];

  return { kids, junior, adult, senior };
}

function tierForAge(id: string, age: HustleAgeGroup, launchGuideId?: string): GuideMinTier {
  if (age === "kids") return kidsLibraryMinTier(id);
  if (age === "junior") return juniorLibraryMinTier(id);
  if (age === "senior") return seniorLibraryMinTier(id, launchGuideId);
  return adultLibraryMinTier(id);
}

/** Deduped Guide Library rows (unique id), lowest min-tier wins. */
export function uniqueGuideLibraryEntries(): GuideLibraryEntry[] {
  const pools = guideLibraryAgePools();
  const byId = new Map<string, GuideLibraryEntry>();
  const take = (id: string, name: string, tier: GuideMinTier) => {
    const prev = byId.get(id);
    if (!prev || guideTierSortRank(tier) < guideTierSortRank(prev.minTier)) {
      byId.set(id, { id, name: name || prev?.name || id, minTier: tier });
    } else if (prev && name && (!prev.name || prev.name === prev.id)) {
      byId.set(id, { ...prev, name });
    }
  };

  for (const g of pools.adult) take(g.id, g.name, tierForAge(g.id, "adult"));
  for (const g of pools.senior) {
    take(g.id, g.name, tierForAge(g.id, "senior", g.launchGuideId ?? g.id));
  }
  for (const g of pools.junior) take(g.id, g.name, tierForAge(g.id, "junior"));
  for (const g of pools.kids) take(g.id, g.name, tierForAge(g.id, "kids"));

  return [...byId.values()];
}

export function uniqueGuideLibraryIds(): string[] {
  return uniqueGuideLibraryEntries().map((e) => e.id);
}

export function uniqueGuideLibraryCount(): number {
  return uniqueGuideLibraryEntries().length;
}

/**
 * Unique library guides that hold Active for members/guests
 * (Active, Reviewed by QA, Reviewed by Dev — same as public visibility).
 */
export function countActiveGuideLibrary(
  catalogStates: GuideCatalogStateMap | null | undefined,
): number {
  let active = 0;
  for (const id of uniqueGuideLibraryIds()) {
    if (guideMatchesStatusFilter(getGuideVisibilityStatus(id, catalogStates), "active")) {
      active += 1;
    }
  }
  return active;
}

/**
 * Unique Free-tier library guides that are Active (public Free test-drive allotment).
 */
export function countActiveFreeGuideLibrary(
  catalogStates: GuideCatalogStateMap | null | undefined,
): number {
  let active = 0;
  for (const e of uniqueGuideLibraryEntries()) {
    if (e.minTier !== "free") continue;
    if (guideMatchesStatusFilter(getGuideVisibilityStatus(e.id, catalogStates), "active")) {
      active += 1;
    }
  }
  return active;
}

/** Unique Free-tier guides in the library inventory (Active or not). */
export function countFreeGuideLibrary(): number {
  return uniqueGuideLibraryEntries().filter((e) => e.minTier === "free").length;
}

/** Age audiences where this guide appears in the Side Hustle Library. */
export function audiencesForLibraryGuideId(guideId: string): HustleAgeGroup[] {
  const id = String(guideId || "").trim();
  if (!id) return [];
  const fromCatalog = hustleById(id)?.audiences;
  if (fromCatalog?.length) return [...fromCatalog];
  const pools = guideLibraryAgePools();
  const ages: HustleAgeGroup[] = [];
  if (pools.kids.some((g) => g.id === id)) ages.push("kids");
  if (pools.junior.some((g) => g.id === id)) ages.push("junior");
  if (pools.adult.some((g) => g.id === id)) ages.push("adult");
  if (pools.senior.some((g) => g.id === id)) ages.push("senior");
  return ages;
}

/** Display name for a library guide id (catalog / pool), or the id itself. */
export function libraryGuideDisplayName(guideId: string): string {
  const id = String(guideId || "").trim();
  if (!id) return "";
  const hit = uniqueGuideLibraryEntries().find((e) => e.id === id);
  if (hit?.name) return hit.name;
  return hustleById(id)?.name || id;
}

/** Lowest library membership tier for a guide id (Free across any age wins). */
export function libraryMinTierForGuideId(guideId: string): GuideMinTier {
  const id = String(guideId || "").trim();
  const hit = uniqueGuideLibraryEntries().find((e) => e.id === id);
  if (hit) return hit.minTier;
  return adultLibraryMinTier(id);
}
