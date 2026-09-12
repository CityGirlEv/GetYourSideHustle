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
import { guideTierSortRank, tierMeetsMinimum, type GuideMinTier } from "./guide-access";
import {
  effectiveGuideMinTier,
  getGuideVisibilityStatus,
  guideMatchesStatusFilter,
  type GuideCatalogStateMap,
} from "./guide-catalog-state";
import { effectiveGuideAudiences } from "./guide-library-update";
import { guidesForAudience, kidsGuideById } from "./kids-guides";
import { LAUNCH_GUIDES } from "./launch-guides";
import type { AudienceGroup, TierId } from "./membership";
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
  const launch = Array.isArray(LAUNCH_GUIDES) ? LAUNCH_GUIDES : [];
  const hustles = Array.isArray(SIDE_HUSTLES) ? SIDE_HUSTLES : [];
  const fromLaunch = launch.filter((g) => hustleById(g.id)?.audiences.includes(age));
  const seen = new Set(fromLaunch.map((g) => g.id));
  const extras = hustles
    .filter((h) => h.audiences.includes(age) && !seen.has(h.id))
    .map((h) => ({
      id: h.id,
      name: h.name,
    }));
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

/** Code-default audiences (ignores Admin catalog patch). */
export function codeAudiencesForLibraryGuideId(guideId: string): HustleAgeGroup[] {
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

/**
 * Age audiences where this guide appears — Admin `patch.audiences` overrides code.
 */
export function audiencesForLibraryGuideId(
  guideId: string,
  states?: GuideCatalogStateMap | null,
): HustleAgeGroup[] {
  return effectiveGuideAudiences(guideId, states, codeAudiencesForLibraryGuideId(guideId));
}

/** Code-default membership floor for one age lane (ignores Admin patch). */
export function codeLibraryMinTierForAge(
  guideId: string,
  age: HustleAgeGroup,
  launchGuideId?: string,
): GuideMinTier {
  return tierForAge(String(guideId || "").trim(), age, launchGuideId);
}

/**
 * Membership floor for one age lane — Admin `patch.minTier` overrides code.
 */
export function libraryMinTierForAge(
  guideId: string,
  age: HustleAgeGroup,
  states?: GuideCatalogStateMap | null,
  launchGuideId?: string,
): GuideMinTier {
  return effectiveGuideMinTier(
    guideId,
    states,
    codeLibraryMinTierForAge(guideId, age, launchGuideId),
  );
}

/** Code-default lowest tier across ages (ignores Admin patch). */
export function codeLibraryMinTierForGuideId(guideId: string): GuideMinTier {
  const id = String(guideId || "").trim();
  const audiences = codeAudiencesForLibraryGuideId(id);
  if (!audiences.length) return adultLibraryMinTier(id);
  let best: GuideMinTier | null = null;
  for (const age of audiences) {
    const tier = codeLibraryMinTierForAge(id, age);
    if (!best || guideTierSortRank(tier) < guideTierSortRank(best)) best = tier;
  }
  return best ?? adultLibraryMinTier(id);
}

/**
 * Lowest library membership tier — Admin `patch.minTier` overrides code defaults.
 */
export function libraryMinTierForGuideId(
  guideId: string,
  states?: GuideCatalogStateMap | null,
): GuideMinTier {
  return effectiveGuideMinTier(guideId, states, codeLibraryMinTierForGuideId(guideId));
}

function guideDisplayNameFallback(guideId: string): string {
  const id = String(guideId || "").trim();
  if (!id) return "";
  const catalogName = hustleById(id)?.name?.trim();
  if (catalogName) return catalogName;
  const launchName = LAUNCH_GUIDES.find((g) => g.id === id)?.name?.trim();
  if (launchName) return launchName;
  const kidsTitle = kidsGuideById(id)?.title?.trim();
  if (kidsTitle) return kidsTitle;
  return id;
}

/**
 * Guide ids that belong in an age lane after applying Admin audience patches.
 */
export function guideIdsForLibraryAudience(
  audience: HustleAgeGroup,
  states?: GuideCatalogStateMap | null,
): string[] {
  const pools = guideLibraryAgePools();
  const ids = new Set(pools[audience].map((g) => g.id));
  if (states) {
    for (const id of Object.keys(states)) {
      if (audiencesForLibraryGuideId(id, states).includes(audience)) ids.add(id);
    }
  }
  return [...ids].filter((id) => audiencesForLibraryGuideId(id, states).includes(audience));
}

/** Deduped Guide Library rows (unique id), lowest min-tier wins. */
export function uniqueGuideLibraryEntries(
  states?: GuideCatalogStateMap | null,
): GuideLibraryEntry[] {
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

  const candidateIds = new Set<string>();
  for (const age of ["adult", "senior", "junior", "kids"] as const) {
    for (const g of pools[age]) candidateIds.add(g.id);
  }
  if (states) {
    for (const [id, row] of Object.entries(states)) {
      if (row?.patch?.audiences?.length || row?.patch?.minTier || row?.patch?.membershipTiers?.length) {
        candidateIds.add(id);
      }
    }
  }

  for (const id of candidateIds) {
    const audiences = audiencesForLibraryGuideId(id, states);
    if (!audiences.length) continue;
    let best: GuideMinTier | null = null;
    for (const age of audiences) {
      const launchGuideId =
        age === "senior"
          ? pools.senior.find((g) => g.id === id)?.launchGuideId ?? id
          : undefined;
      const tier = libraryMinTierForAge(id, age, states, launchGuideId);
      if (!best || guideTierSortRank(tier) < guideTierSortRank(best)) best = tier;
    }
    if (best) take(id, guideDisplayNameFallback(id), best);
  }

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
  for (const id of uniqueGuideLibraryEntries(catalogStates).map((e) => e.id)) {
    if (guideMatchesStatusFilter(getGuideVisibilityStatus(id, catalogStates), "active")) {
      active += 1;
    }
  }
  return active;
}

/**
 * Unique Free-tier library guides that are Active (public Free test-drive allotment).
 * Respects Admin `patch.minTier` / membership overrides when `catalogStates` is provided.
 */
export function countActiveFreeGuideLibrary(
  catalogStates: GuideCatalogStateMap | null | undefined,
): number {
  let active = 0;
  for (const e of uniqueGuideLibraryEntries(catalogStates)) {
    if (e.minTier !== "free") continue;
    if (guideMatchesStatusFilter(getGuideVisibilityStatus(e.id, catalogStates), "active")) {
      active += 1;
    }
  }
  return active;
}

/** Unique Free-tier guides in the library inventory (Active or not). */
export function countFreeGuideLibrary(
  catalogStates?: GuideCatalogStateMap | null,
): number {
  return uniqueGuideLibraryEntries(catalogStates).filter((e) => e.minTier === "free").length;
}

/**
 * How many Side Hustle Guides a membership unlocks for one age demographic.
 * Uses the age library pool + per-age min-tier rules (cumulative: Pro includes Free+Starter+Pro).
 * Inventory count (what the plan includes) — not gated on Active/Pending visibility.
 * Pass `catalogStates` so Admin membership edits are reflected.
 */
export function countGuidesForMembershipAudience(
  audience: AudienceGroup,
  membershipTier: TierId,
  catalogStates?: GuideCatalogStateMap | null,
): number {
  const pools = guideLibraryAgePools();
  const ids = guideIdsForLibraryAudience(audience, catalogStates);
  let n = 0;
  for (const id of ids) {
    const launchGuideId =
      audience === "senior"
        ? pools.senior.find((g) => g.id === id)?.launchGuideId
        : undefined;
    const minTier = libraryMinTierForAge(id, audience, catalogStates, launchGuideId);
    if (tierMeetsMinimum(membershipTier, minTier)) n += 1;
  }
  return n;
}

/** Same as {@link countGuidesForMembershipAudience} for every tier (Free → Elite). */
export function membershipGuideCountsByTier(
  audience: AudienceGroup,
  catalogStates?: GuideCatalogStateMap | null,
): Record<TierId, number> {
  return {
    free: countGuidesForMembershipAudience(audience, "free", catalogStates),
    starter: countGuidesForMembershipAudience(audience, "starter", catalogStates),
    pro: countGuidesForMembershipAudience(audience, "pro", catalogStates),
    elite: countGuidesForMembershipAudience(audience, "elite", catalogStates),
  };
}

/**
 * Active-only variant (D1 catalog states) — for live library chips.
 * Prefers inventory helper for membership marketing copy.
 */
export function countActiveGuidesForMembershipAudience(
  audience: AudienceGroup,
  membershipTier: TierId,
  catalogStates: GuideCatalogStateMap | null | undefined,
): number {
  const pools = guideLibraryAgePools();
  const ids = guideIdsForLibraryAudience(audience, catalogStates);
  let n = 0;
  for (const id of ids) {
    const launchGuideId =
      audience === "senior"
        ? pools.senior.find((g) => g.id === id)?.launchGuideId
        : undefined;
    const minTier = libraryMinTierForAge(id, audience, catalogStates, launchGuideId);
    if (!tierMeetsMinimum(membershipTier, minTier)) continue;
    if (guideMatchesStatusFilter(getGuideVisibilityStatus(id, catalogStates), "active")) {
      n += 1;
    }
  }
  return n;
}

/** Display name for a library guide id (catalog / kids-teen title / pool), or the id itself. */
export function libraryGuideDisplayName(guideId: string): string {
  const id = String(guideId || "").trim();
  if (!id) return "";
  const hit = uniqueGuideLibraryEntries().find((e) => e.id === id);
  if (hit?.name && hit.name !== id) return hit.name;
  return guideDisplayNameFallback(id);
}
