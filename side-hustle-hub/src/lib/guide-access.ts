/**
 * Site-wide guide gating: guests see no steps.
 * Members unlock by plan tier (Free → Starter → Pro → Elite).
 */

import type { TierId } from "./membership";
import { TIER_LADDER } from "./membership";

export const JOIN_TO_UNLOCK_LABEL = "Join to Unlock";
/** Small line under the Join button — Free Membership unlocks Free-plan guides. */
export const JOIN_TO_UNLOCK_SUB = "(FREE)";

/** Minimum plan required to open a guide’s steps. */
export type GuideMinTier = TierId;

const TIER_RANK: Record<TierId, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  elite: 3,
};

export function normalizeGuideTier(raw: string | null | undefined): TierId {
  const t = String(raw || "free").toLowerCase();
  if (t === "starter" || t === "pro" || t === "elite" || t === "free") return t;
  return "free";
}

export function tierMeetsMinimum(userTier: TierId, minTier: GuideMinTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[minTier];
}

/** Sort key: Free (0) → Starter → Pro → Elite. */
export function guideTierSortRank(tier: GuideMinTier): number {
  return TIER_RANK[tier];
}

export function tierDisplayName(tier: TierId): string {
  switch (tier) {
    case "starter":
      return "Starter";
    case "pro":
      return "Pro";
    case "elite":
      return "Elite";
    default:
      return "Free";
  }
}

/** Adult Launch Guide ids → minimum membership tier. */
export const ADULT_GUIDE_MIN_TIER: Record<string, GuideMinTier> = {
  rideshare: "free",
  "food-delivery": "free",
  handyman: "starter",
  affiliate: "starter",
  social: "starter",
  "digital-products": "starter",
  "web-leads": "starter",
  "book-publishing": "starter",
  pod: "starter",
  dropshipping: "starter",
  airbnb: "starter",
  amazon: "starter",
  "property-mgmt": "starter",
  "ai-assets": "pro",
  "ai-agents": "pro",
  "ai-timing": "elite",
};

/** Kids / Teens guide ids → minimum membership tier. */
export const KIDS_GUIDE_MIN_TIER: Record<string, GuideMinTier> = {
  "kids-piggy-first-goal": "free",
  "kids-kindness-share": "free",
  "kids-reinvest-jar": "starter",
  "kids-craft-hustle": "pro",
  "kids-games-ai": "pro",
  "junior-savings-ceo": "free",
  "junior-give-back-teach": "free",
  "junior-reinvest-ceo": "starter",
  "junior-games-ai": "pro",
  "junior-content-create": "pro",
};

/** Senior teaser ids → minimum membership tier (live guides use launchGuideId for adult map). */
export const SENIOR_GUIDE_MIN_TIER: Record<string, GuideMinTier> = {
  "ai-peer-class": "free",
  "senior-rideshare": "free",
  "safe-cohost": "starter",
  "senior-handyman": "starter",
  "senior-affiliate": "starter",
  "start-consulting": "starter",
  "pricing-crafts": "pro",
  "neighborhood-errands": "starter",
};

export function adultGuideMinTier(guideId: string): GuideMinTier {
  return ADULT_GUIDE_MIN_TIER[guideId] ?? "starter";
}

export function kidsGuideMinTier(guideId: string): GuideMinTier {
  return KIDS_GUIDE_MIN_TIER[guideId] ?? "starter";
}

export function seniorGuideMinTier(guideId: string, launchGuideId?: string): GuideMinTier {
  if (launchGuideId) return adultGuideMinTier(launchGuideId);
  return SENIOR_GUIDE_MIN_TIER[guideId] ?? "starter";
}

export type GuideAccessInput = {
  /** Portal login, free member session, or age-group team join (not guest preview). */
  isMember: boolean;
  /** Plan on the account; free-session / team join → "free". */
  membershipTier?: string | null;
  minTier: GuideMinTier;
};

export type GuideAccessResult = {
  unlocked: boolean;
  /** Guest — show Join CTA. */
  needsJoin: boolean;
  /** Member on a lower plan — show Upgrade CTA. */
  needsUpgrade: boolean;
  userTier: TierId;
  minTier: GuideMinTier;
};

export function resolveGuideAccess(input: GuideAccessInput): GuideAccessResult {
  const minTier = input.minTier;
  const userTier = input.isMember ? normalizeGuideTier(input.membershipTier) : "free";
  if (!input.isMember) {
    return {
      unlocked: false,
      needsJoin: true,
      needsUpgrade: false,
      userTier: "free",
      minTier,
    };
  }
  const unlocked = tierMeetsMinimum(userTier, minTier);
  return {
    unlocked,
    needsJoin: false,
    needsUpgrade: !unlocked,
    userTier,
    minTier,
  };
}

/** Short badge on guide cards. */
export function guideTierBadgeLabel(minTier: GuideMinTier): string {
  if (minTier === "free") return "Free Guide";
  return `${tierDisplayName(minTier)} Membership`;
}

/** Compact label for narrow sidebars / chips (Free, Starter, Pro, Elite). */
export function guideTierShortLabel(minTier: GuideMinTier): string {
  if (minTier === "free") return "Free";
  return tierDisplayName(minTier);
}

/** Extra line under Free Guide badges / cards. */
export const FREE_GUIDE_SIGNUP_NOTE = "Free (sign-up, no credit card required)";

/** Membership requirement line for any guide. */
export function guideTierMembershipNote(minTier: GuideMinTier): string {
  if (minTier === "free") {
    return `Free with Free Membership — ${FREE_GUIDE_SIGNUP_NOTE}`;
  }
  return `Included with ${tierDisplayName(minTier)} Membership`;
}

/** All tier ids in ladder order (for filters / docs). */
export function guideTierLadder(): readonly TierId[] {
  return TIER_LADDER;
}

export type GuideCatalogAudience = "Adults" | "Kids" | "Teens" | "Seniors";

export type GuideCatalogRow = {
  id: string;
  title: string;
  audience: GuideCatalogAudience;
  minTier: GuideMinTier;
  /** Adult launch id when senior card opens a launch guide. */
  openId?: string;
};

/** Flat catalog for membership matrix / table views. */
export function buildGuideCatalogRows(input: {
  adult: { id: string; name: string }[];
  kids: { id: string; title: string; audience: "kids" | "junior" }[];
  seniors: { id: string; title: string; launchGuideId?: string; status?: string }[];
}): GuideCatalogRow[] {
  const rows: GuideCatalogRow[] = [];
  for (const g of input.adult) {
    rows.push({
      id: g.id,
      title: g.name,
      audience: "Adults",
      minTier: adultGuideMinTier(g.id),
      openId: g.id,
    });
  }
  for (const g of input.kids) {
    rows.push({
      id: g.id,
      title: g.title,
      audience: g.audience === "junior" ? "Teens" : "Kids",
      minTier: kidsGuideMinTier(g.id),
    });
  }
  for (const g of input.seniors) {
    if (g.status === "coming_soon") continue;
    rows.push({
      id: g.id,
      title: g.title,
      audience: "Seniors",
      minTier: seniorGuideMinTier(g.id, g.launchGuideId),
      openId: g.launchGuideId,
    });
  }
  const rank = (t: GuideMinTier) => TIER_RANK[t];
  return rows.sort((a, b) => {
    const tr = rank(a.minTier) - rank(b.minTier);
    if (tr !== 0) return tr;
    const aud = a.audience.localeCompare(b.audience);
    if (aud !== 0) return aud;
    return a.title.localeCompare(b.title);
  });
}
