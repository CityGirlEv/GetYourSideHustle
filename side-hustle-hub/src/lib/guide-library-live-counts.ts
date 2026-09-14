/**
 * Live Side Hustle Library counts from D1 guide_catalog_state.
 * Shared cache — load once at app boot / login; all verbiage and bubbles should use these.
 *
 * Important: do not call guide-library-pool at module top-level (circular import with
 * launch-guides → guide-access). Optimistic inventory counts are seeded lazily.
 */
import { useEffect, useSyncExternalStore } from "react";
import { fetchGuideCatalogStates } from "./guide-catalog-client";
import { overlayGuideCatalogState, type GuideCatalogStateMap } from "./guide-catalog-state";
import {
  countActiveFreeGuideLibrary,
  countActiveGuideLibrary,
  countFreeGuideLibrary,
  countGuidesForMembershipAudience,
  membershipGuideCountsByTier,
  uniqueGuideLibraryCount,
} from "./guide-library-pool";
import {
  AUDIENCE_LABELS,
  MEMBERSHIP_COMPARE_ROWS,
  MEMBERSHIP_TIERS,
  numberedTierPerks,
  type AudienceGroup,
  type MemberPerkAudience,
  type MembershipCompareRow,
  type MembershipTier,
  type NumberedTierPerk,
  type TierId,
} from "./membership";

export type LiveGuideLibraryCounts = {
  /** Unique guides holding Active (public library total). */
  totalActive: number;
  /** Unique Free-tier guides holding Active (Free Membership allotment). */
  freeActive: number;
  /** Catalog state map used for the counts (may be empty before first fetch). */
  states: GuideCatalogStateMap;
  /** True after at least one successful fetch. */
  loaded: boolean;
};

type Listener = () => void;

let cache: LiveGuideLibraryCounts = {
  totalActive: 0,
  freeActive: 0,
  states: {},
  loaded: false,
};
let optimisticSeeded = false;
let inflight: Promise<LiveGuideLibraryCounts> | null = null;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

function setCache(next: LiveGuideLibraryCounts) {
  cache = next;
  emit();
}

/** Inventory totals once the library graph is initialized (not D1 Active). */
function seedOptimisticInventoryCounts(): void {
  if (optimisticSeeded || cache.loaded) return;
  optimisticSeeded = true;
  cache = {
    ...cache,
    totalActive: uniqueGuideLibraryCount(),
    freeActive: countFreeGuideLibrary(),
  };
}

export function getLiveGuideLibraryCounts(): LiveGuideLibraryCounts {
  seedOptimisticInventoryCounts();
  return cache;
}

export function subscribeLiveGuideLibraryCounts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Fetch (or reuse in-flight) catalog states and refresh live totals. */
export async function refreshLiveGuideLibraryCounts(opts?: {
  force?: boolean;
}): Promise<LiveGuideLibraryCounts> {
  seedOptimisticInventoryCounts();
  if (!opts?.force && cache.loaded && !inflight) return cache;
  if (inflight) return inflight;
  inflight = fetchGuideCatalogStates()
    .then((states) => applyLiveGuideLibraryCountsFromStates(states))
    .catch(() => {
      // Keep last optimistic inventory counts on network failure.
      return getLiveGuideLibraryCounts();
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** React: subscribe to live totals (loads on first mount if needed). */
export function useLiveGuideLibraryCounts(): LiveGuideLibraryCounts {
  const counts = useSyncExternalStore(
    subscribeLiveGuideLibraryCounts,
    getLiveGuideLibraryCounts,
    getLiveGuideLibraryCounts,
  );
  useEffect(() => {
    void refreshLiveGuideLibraryCounts();
  }, []);
  return counts;
}

function clampCount(n: number): number {
  return Math.max(0, Math.floor(Number(n) || 0));
}

/** Free Membership chip / tag — always interpolate live free Active count. */
export function freeMembershipGuidesTag(freeCount: number): string {
  const n = clampCount(freeCount);
  return `Free comes with ${n} Side Hustle Guides to choose from`;
}

export function freeMembershipGuidesBanner(freeCount: number): string {
  const n = clampCount(freeCount);
  return `${n} Side Hustle Guides to choose from`;
}

export function freeMembershipTagline(freeCount: number): string {
  const n = clampCount(freeCount);
  return `Free for every age — Kids, Teens, Adults & Seniors. Includes ${n} Side Hustle Guides to choose from, ideas, and your Corner at $0.`;
}

export function allAgesGuidesFreePerkTitle(freeCount: number): string {
  return freeMembershipGuidesTag(freeCount);
}

/** Short demographic label for membership cards (Kids / Teens / Adults / Seniors). */
export function membershipAudienceShortLabel(audience: AudienceGroup): string {
  return AUDIENCE_LABELS[audience].replace(/\s*\(.*\)$/, "").trim();
}

/** Card line: “42 Side Hustle Guides for Adults”. */
export function membershipGuideCountLine(
  guideCount: number,
  audience: AudienceGroup,
): string {
  const n = clampCount(guideCount);
  const who = membershipAudienceShortLabel(audience);
  const noun = n === 1 ? "Side Hustle Guide" : "Side Hustle Guides";
  return `${n} ${noun} for ${who}`;
}

/** Free perk title for a selected age lane. */
export function membershipFreeGuidesPerkTitle(
  guideCount: number,
  audience: AudienceGroup,
): string {
  const n = clampCount(guideCount);
  const who = membershipAudienceShortLabel(audience);
  return `Free comes with ${n} Side Hustle Guides for ${who}`;
}

/** Paid-plan guides perk title for a selected age lane + tier. */
export function membershipTierGuidesPerkTitle(
  guideCount: number,
  audience: AudienceGroup,
  tierId: TierId,
): string {
  const n = clampCount(guideCount);
  const who = membershipAudienceShortLabel(audience);
  if (tierId === "free") return membershipFreeGuidesPerkTitle(n, audience);
  return `Includes ${n} Side Hustle Guides for ${who}`;
}

/** Free tagline scoped to the selected demographic. */
export function membershipFreeTaglineForAudience(
  guideCount: number,
  audience: AudienceGroup,
): string {
  const n = clampCount(guideCount);
  const who = membershipAudienceShortLabel(audience);
  return `Free for ${who} — includes ${n} Side Hustle Guides to choose from, ideas, and your Corner at $0.`;
}

/** Paid tagline: lead with guide count for the selected demographic. */
export function membershipPaidTaglineForAudience(
  baseTagline: string,
  guideCount: number,
  audience: AudienceGroup,
): string {
  const line = membershipGuideCountLine(guideCount, audience);
  const rest = String(baseTagline || "").trim();
  if (!rest) return line;
  if (/side hustle guides?/i.test(rest)) return `${line}. ${rest}`;
  return `${line} · ${rest}`;
}

/** True when copy embeds the Free Membership Side Hustle Guide allotment count. */
export function copyMentionsFreeGuideAllotment(text: string): boolean {
  return /Side Hustle Guides to choose from/i.test(String(text || ""));
}

/** True when copy is the guides membership perk that should show a live count. */
export function copyMentionsMembershipGuideAllotment(text: string): boolean {
  const t = String(text || "");
  return (
    copyMentionsFreeGuideAllotment(t) ||
    /Kids, Teens, Adults & Seniors Guides/i.test(t) ||
    /Side Hustle Guides for /i.test(t) ||
    /^Includes \d+ Side Hustle Guides/i.test(t) ||
    /^Free comes with \d+ Side Hustle Guides/i.test(t)
  );
}

/** Push counts from an already-fetched catalog map (shared with library pages). */
export function applyLiveGuideLibraryCountsFromStates(
  states: GuideCatalogStateMap,
): LiveGuideLibraryCounts {
  optimisticSeeded = true;
  const next: LiveGuideLibraryCounts = {
    totalActive: countActiveGuideLibrary(states),
    freeActive: countActiveFreeGuideLibrary(states),
    states,
    loaded: true,
  };
  setCache(next);
  return next;
}

/** Merge one guide catalog row into the live cache and recompute Active / Free Active. */
export function patchLiveGuideLibraryCatalogState(
  guideId: string,
  state: import("./guide-catalog-state").GuideCatalogState,
): LiveGuideLibraryCounts {
  const id = String(guideId || "").trim();
  const states = { ...getLiveGuideLibraryCounts().states };
  if (id) states[id] = overlayGuideCatalogState(states[id], state);
  return applyLiveGuideLibraryCountsFromStates(states);
}

/**
 * Same as {@link numberedTierPerks}, but Free allotment titles use live Active Free count from D1.
 * @deprecated Prefer {@link numberedTierPerksWithAudienceGuideCount}.
 */
export function numberedTierPerksWithLiveFreeCount(
  tierId: TierId,
  audience: MemberPerkAudience,
  freeActiveCount: number,
): NumberedTierPerk[] {
  return numberedTierPerksWithAudienceGuideCount(tierId, audience, freeActiveCount);
}

/**
 * Numbered perks with Side Hustle Guide counts for the selected demographic + plan.
 * `guideCount` should be {@link countGuidesForMembershipAudience}(audience, tierId).
 */
export function numberedTierPerksWithAudienceGuideCount(
  tierId: TierId,
  audience: MemberPerkAudience,
  guideCount: number,
): NumberedTierPerk[] {
  const title = membershipTierGuidesPerkTitle(guideCount, audience, tierId);
  return numberedTierPerks(tierId, audience).map((perk) => {
    if (!copyMentionsMembershipGuideAllotment(perk.title)) return perk;
    return { ...perk, title, numberedTitle: `${perk.n}) ${title}` };
  });
}

/**
 * Membership cards with taglines that include guide counts for the selected demographic.
 */
export function membershipTiersWithAudienceGuideCounts(
  audience: AudienceGroup,
  countsByTier?: Record<TierId, number>,
  catalogStates?: import("./guide-catalog-state").GuideCatalogStateMap | null,
): MembershipTier[] {
  const counts = countsByTier ?? membershipGuideCountsByTier(audience, catalogStates);
  return MEMBERSHIP_TIERS.map((tier) => {
    const n = counts[tier.id] ?? countGuidesForMembershipAudience(audience, tier.id, catalogStates);
    if (tier.id === "free") {
      return { ...tier, tagline: membershipFreeTaglineForAudience(n, audience) };
    }
    return {
      ...tier,
      tagline: membershipPaidTaglineForAudience(tier.tagline, n, audience),
    };
  });
}

/** @deprecated Prefer {@link membershipTiersWithAudienceGuideCounts}. */
export function membershipTiersWithLiveFreeCount(freeActiveCount: number): MembershipTier[] {
  const tagline = freeMembershipTagline(freeActiveCount);
  return MEMBERSHIP_TIERS.map((tier) =>
    tier.id === "free" ? { ...tier, tagline } : tier,
  );
}

/** Compare-table rows with guide counts for the selected demographic. */
export function membershipCompareRowsWithAudienceGuideCounts(
  audience: AudienceGroup,
  countsByTier?: Record<TierId, number>,
  catalogStates?: import("./guide-catalog-state").GuideCatalogStateMap | null,
): MembershipCompareRow[] {
  const counts = countsByTier ?? membershipGuideCountsByTier(audience, catalogStates);
  const who = membershipAudienceShortLabel(audience);
  return MEMBERSHIP_COMPARE_ROWS.map((row) => {
    if (row.id === "browse") {
      return {
        ...row,
        label: `Side Hustle Guides for ${who}`,
        cells: {
          free: String(counts.free),
          starter: String(counts.starter),
          pro: String(counts.pro),
          elite: String(counts.elite),
        },
      };
    }
    if (row.id === "member_guides") {
      return {
        ...row,
        cells: {
          free: counts.free > 0 ? `${counts.free} Free` : "—",
          starter: String(counts.starter),
          pro: String(counts.pro),
          elite: String(counts.elite),
        },
      };
    }
    return row;
  });
}
