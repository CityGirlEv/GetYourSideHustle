import { guideTierSortRank, type GuideMinTier } from "./guide-access";

/** Expand/collapse-all state for Free Guides membership tier groups. */
export function tierGroupOpenState(open: boolean): Record<GuideMinTier, boolean> {
  return {
    free: open,
    starter: open,
    pro: open,
    elite: open,
  };
}

/** One guide row after Age Show All dedupe (unique id, lowest membership tier wins). */
export type UniqueGuideEntry<T> = { id: string; tier: GuideMinTier; item: T };

/**
 * Merge age-lane batches into unique guide ids.
 * Lowest min-tier wins; on a tie the earlier batch keeps the card (Adult → Senior → Teens → Kids).
 * Callers should re-sort with {@link sortGuidesFreeFirstThenAlphabetical} for display order.
 */
export function uniqueGuidesByLowestTier<T>(
  batches: readonly (readonly UniqueGuideEntry<T>[])[],
): UniqueGuideEntry<T>[] {
  const byId = new Map<string, UniqueGuideEntry<T>>();
  for (const batch of batches) {
    for (const entry of batch) {
      const prev = byId.get(entry.id);
      if (!prev || guideTierSortRank(entry.tier) < guideTierSortRank(prev.tier)) {
        byId.set(entry.id, entry);
      }
    }
  }
  return [...byId.values()];
}

/**
 * Library list order for Free / Show All: Free guides first (A–Z), then others (A–Z).
 */
export function sortGuidesFreeFirstThenAlphabetical<T>(
  guides: readonly T[],
  minTierOf: (g: T) => GuideMinTier,
  nameOf: (g: T) => string,
): T[] {
  return [...guides].sort((a, b) => {
    const aFree = minTierOf(a) === "free" ? 0 : 1;
    const bFree = minTierOf(b) === "free" ? 0 : 1;
    if (aFree !== bFree) return aFree - bFree;
    return nameOf(a).localeCompare(nameOf(b), undefined, { sensitivity: "base" });
  });
}

/**
 * Sort guides for a membership filter tab:
 * - Free / Show All → Free first, then A–Z
 * - Starter → Starter first, then Free (A–Z within)
 * - Pro → Pro first, then Starter (A–Z within)
 * - Elite → Elite, then Pro, then Starter, then Free (A–Z within)
 */
export function sortGuidesForMembershipTab<T>(
  tab: DemoMembershipFilter,
  guides: readonly T[],
  minTierOf: (g: T) => GuideMinTier,
  nameOf: (g: T) => string,
): T[] {
  if (tab === "all" || tab === "free") {
    return sortGuidesFreeFirstThenAlphabetical(guides, minTierOf, nameOf);
  }

  const priority = (tier: GuideMinTier): number => {
    if (tab === "starter") {
      if (tier === "starter") return 0;
      if (tier === "free") return 1;
      return 2;
    }
    if (tab === "pro") {
      if (tier === "pro") return 0;
      if (tier === "starter") return 1;
      return 2;
    }
    // elite — highest min-tier first
    return -guideTierSortRank(tier);
  };

  return [...guides].sort((a, b) => {
    const pa = priority(minTierOf(a));
    const pb = priority(minTierOf(b));
    if (pa !== pb) return pa - pb;
    return nameOf(a).localeCompare(nameOf(b), undefined, { sensitivity: "base" });
  });
}

/** @deprecated Prefer {@link sortGuidesFreeFirstThenAlphabetical}. */
export function sortGuidesByMembershipTier<T>(
  guides: readonly T[],
  minTierOf: (g: T) => GuideMinTier,
  compareNames?: (a: T, b: T) => number,
): T[] {
  return [...guides].sort((a, b) => {
    const aFree = minTierOf(a) === "free" ? 0 : 1;
    const bFree = minTierOf(b) === "free" ? 0 : 1;
    if (aFree !== bFree) return aFree - bFree;
    return compareNames ? compareNames(a, b) : 0;
  });
}

/** Membership filter tabs (Show All includes every tier including Free). */
export type DemoMembershipFilter = "all" | "free" | "starter" | "pro" | "elite";

/** Membership chip on first open of the Guide library (Show All, not Free-only). */
export const DEFAULT_LIBRARY_MEMBERSHIP_FILTERS: DemoMembershipFilter[] = ["all"];

/** Free / Starter / Pro / Elite groups start expanded on Show All. */
export const DEFAULT_LIBRARY_TIER_GROUPS_OPEN = true;

/**
 * Guide min-tiers listed under each membership filter tab (plan contents):
 * - Free → Free only
 * - Starter → Free + Starter (Starter plan)
 * - Pro → Starter + Pro
 * - Elite → all guides
 * - Show All → all
 */
export function tiersIncludedInMembershipTab(tab: DemoMembershipFilter): GuideMinTier[] | "all" {
  if (tab === "all" || tab === "elite") return "all";
  if (tab === "free") return ["free"];
  if (tab === "starter") return ["free", "starter"];
  if (tab === "pro") return ["starter", "pro"];
  return [tab];
}

/**
 * Membership library filter (single tab) — guides included with that plan view.
 */
export function filterGuidesByExactMembershipTier<T>(
  guides: T[],
  membershipTab: DemoMembershipFilter,
  minTierOf: (g: T) => GuideMinTier,
): T[] {
  return filterGuidesByMembershipSelection(guides, [membershipTab], minTierOf);
}

/** Multi-select membership filter — Show All (or empty) includes every tier. */
export function filterGuidesByMembershipSelection<T>(
  guides: T[],
  selected: readonly DemoMembershipFilter[],
  minTierOf: (g: T) => GuideMinTier,
): T[] {
  if (selected.length === 0 || selected.includes("all")) return guides;
  const allowed = new Set<GuideMinTier>();
  for (const tab of selected) {
    const tiers = tiersIncludedInMembershipTab(tab);
    if (tiers === "all") return guides;
    for (const t of tiers) allowed.add(t);
  }
  return guides.filter((g) => allowed.has(minTierOf(g)));
}

/**
 * Toggle a filter chip. Exclusive ids (e.g. Show All) clear other selections when chosen.
 * Always keeps at least one selection.
 */
export function toggleFilterSelection<T extends string>(
  selected: readonly T[],
  next: T,
  exclusiveIds: readonly T[] = [],
): T[] {
  const isExclusive = exclusiveIds.includes(next);
  const isOn = selected.includes(next);
  if (isOn) {
    const remaining = selected.filter((x) => x !== next);
    return remaining.length > 0 ? remaining : [...selected];
  }
  if (isExclusive) return [next];
  return [...selected.filter((x) => !exclusiveIds.includes(x)), next];
}

/**
 * Library Age / Membership / Status checkboxes: unchecking the last specific
 * option returns to Show All instead of forcing the sole chip to stay on.
 */
export function toggleLibraryFilterSelection<T extends string>(
  selected: readonly T[],
  next: T,
  allId: T,
): T[] {
  if (selected.length === 1 && selected[0] === next && next !== allId) {
    return [allId];
  }
  return toggleFilterSelection(selected, next, [allId]);
}

/**
 * Membership tab counts — how many guides appear under each plan filter.
 * Free = Free only; Starter = Free + Starter; Pro = Starter + Pro; Elite / Show All = all.
 */
export function exactMembershipTabCounts<T>(
  guides: T[],
  minTierOf: (g: T) => GuideMinTier,
): Record<DemoMembershipFilter, number> {
  const countFor = (tab: DemoMembershipFilter) =>
    filterGuidesByExactMembershipTier(guides, tab, minTierOf).length;
  return {
    all: guides.length,
    free: countFor("free"),
    starter: countFor("starter"),
    pro: countFor("pro"),
    elite: countFor("elite"),
  };
}

/** Age Free filter: Show All + Free show the unique Free total; paid tiers are N/A (not zero). */
export function freeAgeMembershipTabCounts(
  uniqueFreeCount: number,
): Record<DemoMembershipFilter, number | null> {
  const n = Math.max(0, uniqueFreeCount);
  return { all: n, free: n, starter: null, pro: null, elite: null };
}

/** True when a membership tab is usable while Age Free is selected. */
export function membershipTabEnabledOnAgeFree(tab: DemoMembershipFilter): boolean {
  return tab === "all" || tab === "free";
}

/**
 * Paid membership chips (Starter / Pro / Elite) apply when Age includes
 * Adults, Seniors, or Show All — not for Kids/Teens-only selections.
 */
export function ageSelectionAllowsPaidMembership(
  ages: readonly string[],
  allId = "all",
): boolean {
  if (ages.length === 0 || ages.includes(allId)) return true;
  return ages.some((a) => a === "adult" || a === "senior");
}

/**
 * Keep the user's membership filter when switching age (e.g. Starter + Adults).
 * Youth-only ages clamp paid selections back to Free.
 */
export function clampMembershipFiltersForAges(
  membership: readonly DemoMembershipFilter[],
  ages: readonly string[],
  allId = "all",
): DemoMembershipFilter[] {
  if (membership.length === 0) return [...DEFAULT_LIBRARY_MEMBERSHIP_FILTERS];
  if (ageSelectionAllowsPaidMembership(ages, allId)) return [...membership];
  if (membership.includes("all")) return ["all"];
  return ["free"];
}
