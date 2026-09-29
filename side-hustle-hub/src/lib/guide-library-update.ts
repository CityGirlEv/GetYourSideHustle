/**
 * Library Admin “Update Guide” panel — membership level + age group toggles.
 * Membership Level is a single choice (Free / Starter / Pro / Elite).
 * Higher plans still unlock lower guides via minTier ladder access — display only.
 * Age groups remain multi-select (at least one required).
 */

import type { TierId } from "./membership";
import type { HustleAgeGroup } from "./side-hustle-catalog";
import {
  effectiveGuideMinTier,
  isGuideMinTier,
  type GuideCatalogStateMap,
} from "./guide-catalog-state";

export const GUIDE_MEMBERSHIP_LEVELS: readonly TierId[] = [
  "free",
  "starter",
  "pro",
  "elite",
] as const;

export const GUIDE_AGE_GROUP_OPTIONS: readonly {
  id: HustleAgeGroup;
  label: string;
}[] = [
  { id: "kids", label: "Kids" },
  { id: "junior", label: "Teens" },
  { id: "adult", label: "Adults" },
  { id: "senior", label: "Seniors" },
];

export const GUIDE_AGE_GROUPS: readonly HustleAgeGroup[] = GUIDE_AGE_GROUP_OPTIONS.map(
  (o) => o.id,
);

/** Dedupe + order membership levels (does not expand Elite → all). */
export function normalizeMembershipSelection(
  selected: readonly TierId[],
): TierId[] {
  const set = new Set(selected.filter(isGuideMinTier));
  return GUIDE_MEMBERSHIP_LEVELS.filter((t) => set.has(t));
}

/**
 * Guide’s membership floor — lowest selected when legacy multi-select data exists.
 * New UI always stores exactly one level.
 */
export function minTierFromMembershipSelection(
  selected: readonly TierId[],
): TierId {
  const norm = normalizeMembershipSelection(selected);
  if (!norm.length) return "elite";
  return GUIDE_MEMBERSHIP_LEVELS.find((t) => norm.includes(t)) ?? "elite";
}

/** Display / edit selection is always exactly one bubble — the guide’s plan. */
export function membershipSelectionFromMinTier(minTier: TierId): TierId[] {
  if (!isGuideMinTier(minTier)) return ["elite"];
  return [minTier];
}

/**
 * Single-select membership: clicking a level makes it the only checked plan.
 * Re-clicking the active level keeps it (always exactly one).
 */
export function toggleMembershipSelection(
  selected: readonly TierId[],
  tier: TierId,
): TierId[] {
  if (!isGuideMinTier(tier)) {
    return membershipSelectionFromMinTier(minTierFromMembershipSelection(selected));
  }
  return [tier];
}

/** Effective membership bubble (always one): patch.membershipTiers → min, else minTier. */
export function effectiveGuideMembershipSelection(
  guideId: string,
  states: GuideCatalogStateMap | null | undefined,
  fallbackMinTier: TierId,
): TierId[] {
  const patched = states?.[guideId]?.patch?.membershipTiers;
  if (Array.isArray(patched) && patched.length) {
    return membershipSelectionFromMinTier(minTierFromMembershipSelection(patched));
  }
  const min = effectiveGuideMinTier(guideId, states, fallbackMinTier);
  return membershipSelectionFromMinTier(min);
}

export function normalizeAgeAudienceSelection(
  selected: readonly HustleAgeGroup[],
): HustleAgeGroup[] {
  const set = new Set(
    selected.filter((a): a is HustleAgeGroup =>
      (GUIDE_AGE_GROUPS as readonly string[]).includes(a),
    ),
  );
  return GUIDE_AGE_GROUPS.filter((a) => set.has(a));
}

/**
 * Include/exclude an age group. Always keeps at least one age selected.
 */
export function toggleAgeAudienceSelection(
  selected: readonly HustleAgeGroup[],
  age: HustleAgeGroup,
): HustleAgeGroup[] {
  const current = new Set(normalizeAgeAudienceSelection(selected));
  if (current.has(age)) {
    if (current.size <= 1) return normalizeAgeAudienceSelection(selected);
    current.delete(age);
  } else {
    current.add(age);
  }
  return GUIDE_AGE_GROUPS.filter((a) => current.has(a));
}

export function effectiveGuideAudiences(
  guideId: string,
  states: GuideCatalogStateMap | null | undefined,
  fallback: readonly HustleAgeGroup[],
): HustleAgeGroup[] {
  const patched = states?.[guideId]?.patch?.audiences;
  if (Array.isArray(patched) && patched.length) {
    return normalizeAgeAudienceSelection(patched);
  }
  const fb = normalizeAgeAudienceSelection(fallback);
  return fb.length ? fb : ["adult"];
}
