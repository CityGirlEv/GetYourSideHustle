/**
 * Site-wide guide gating: guests see no steps.
 * Members unlock by plan tier (Free → Starter → Pro → Elite).
 */

import type { TierId } from "./membership";
import { TIER_LADDER } from "./membership";
import {
  aiSideHustleMinTier,
  hustleById,
  isFreeWizardHustle,
} from "./side-hustle-catalog";
import { cachedComplimentaryGuideIds } from "./wizard-comp-guide";

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

/**
 * Ladder shorthand for gates — NOT a separate product.
 * “Starter or higher” = Starter, Pro, or Elite (there is no Starter+ plan).
 */
export function tierAndAboveLabel(minTier: GuideMinTier): string {
  switch (minTier) {
    case "starter":
      return "Starter or higher";
    case "pro":
      return "Pro or higher";
    case "elite":
      return "Elite";
    default:
      return "Free";
  }
}

/** Spelled-out plans included in a gate — never a “+” product. */
export function tierAndAbovePlans(minTier: GuideMinTier): string {
  switch (minTier) {
    case "starter":
      return "Starter, Pro, or Elite";
    case "pro":
      return "Pro or Elite";
    case "elite":
      return "Elite";
    default:
      return "Free";
  }
}

/** Pill on Join / Upgrade unlock buttons — same phrase as the lock badge after “Needs”. */
export function unlockCtaTierPill(minTier: GuideMinTier): string {
  if (minTier === "free") return JOIN_TO_UNLOCK_SUB;
  return tierAndAboveLabel(minTier);
}

/**
 * One-line glossary for Join / Membership / Beta Credits.
 * “Or higher” means this plan and every plan above it — not a separate “+” product.
 */
export const TIER_LADDER_GLOSSARY =
  "GYSH has exactly four plans: Free, Starter, Pro, and Elite. Each higher plan includes everything below it. When you see “Starter or higher,” that means Starter, Pro, or Elite — not a fifth plan. “Pro or higher” means Pro or Elite. Lock badges and unlock buttons always use the same phrase.";

/** How monthly credits, packs, and consulting fit together. */
export const CREDITS_AND_CONSULTING_BLURB =
  "Free starts with no credit card. Paid plans include monthly credits plus plan consulting (Starter: one 60-min or two 30-min; Pro: two 60-min; Elite: three 60-min). Spend those monthly credits on workshops and extra sessions. Buy a credit pack only when the monthly balance is not enough. Consulting on the plan is included; a-la-carte consulting is extra time if you want more.";

/** Live vs not-built-yet — paywalls unlock live content only. */
export const NOW_VS_COMING_SOON_BLURB =
  "Available now: Free-account members unlock Free Guides; higher plans unlock more live guides and tools. Coming soon: items marked Coming soon are not live yet — upgrading does not unlock them.";

/** Explicit denial for reviewers who misread “or higher” as Starter+/Pro+. */
export const NO_PLUS_PLAN_NOTE =
  "There is no Starter+ or Pro+ plan — “or higher” is ladder shorthand only.";

/** Card-level note so Coming soon never looks like a membership lock. */
export const COMING_SOON_NOT_UNLOCKED_NOTE =
  "Coming soon — not unlocked by membership yet.";

/** Adult Launch Guide ids → minimum membership tier. */
export const ADULT_GUIDE_MIN_TIER: Record<string, GuideMinTier> = {
  rideshare: "pro",
  "food-delivery": "free",
  handyman: "free",
  "cleaning-service": "free",
  affiliate: "elite",
  social: "pro",
  "digital-products": "elite",
  "web-leads": "elite",
  "book-publishing": "pro",
  pod: "elite",
  dropshipping: "elite",
  airbnb: "starter",
  amazon: "elite",
  "property-mgmt": "free",
  "appointment-setter": "starter",
  "ai-assets": "elite",
  "greeting-card-creator": "pro",
  proofreader: "pro",
  "tech-helper": "elite",
  "ai-agents": "elite",
  "ai-timing": "elite",
  "ai-promo-video": "elite",
  "ai-social-helper": "elite",
  "ai-prompt-helper": "elite",
  "ai-peers": "elite",
  "local-business-ai-setup": "elite",
  "create-games-kids": "elite",
  "create-games-junior": "elite",
  "digital-cookbook-creator": "elite",
  "book-publishing-kids": "elite",
  "start-gardening-club": "elite",
  "start-book-club": "elite",
  "notary": "pro",
  "babysitting": "free",
  "family-photo-slideshow": "starter",
  "flipping-properties": "elite",
  "lien-tax-sales": "elite",
  "foreclosure-properties": "elite",
  "pet-sitting": "pro",
  "bookkeeping": "elite",
  "consulting": "pro",
  "teaching": "pro",
  "etsy-store": "elite",
  "canva-flyer-creator": "pro",
  "handyman-light": "pro",
  "transcription-notes-helper": "starter",
  "website-tester": "starter",
  "community-newsletter-creator": "pro",
  "review-response-assistant": "pro",
  "google-business-helper": "pro",
  "resume-linkedin-helper": "pro",
  "short-form-video-editor": "starter",
  "ugc-creator": "starter",
  "virtual-assistant": "pro",
  "virtual-receptionist": "pro",
};

/** Kids / Teens guide ids → minimum membership tier. */
export const KIDS_GUIDE_MIN_TIER: Record<string, GuideMinTier> = {
  "kids-piggy-first-goal": "free",
  "kids-kindness-share": "free",
  "kids-reinvest-jar": "starter",
  "kids-craft-hustle": "starter",
  "kids-games-ai": "elite",
  "junior-savings-ceo": "free",
  "junior-give-back-teach": "free",
  "junior-reinvest-ceo": "starter",
  "junior-games-ai": "elite",
  "junior-content-create": "elite",
};

/**
 * Teens library overrides — spread Free across Starter / Pro / Elite so Free isn’t ~half the lane.
 * Does not change Adult Free Wizard eligibility (adultGuideMinTier stays as-is).
 */
export const JUNIOR_GUIDE_MIN_TIER: Record<string, GuideMinTier> = {
  // Starter — still easy local / helper work
  "errand-runner": "starter",
  "gift-wrapping": "starter",
  "basic-invitation-creator": "starter",
  "family-photo-slideshow": "starter",
  "birthday-party-helper": "starter",
  "closet-cleanout-listing": "starter",
  "closet-organizer": "starter",
  "house-sitter": "starter",
  "toy-organizer": "starter",
  "youth-sports-helper": "starter",
  "personal-shopper": "starter",
  "digital-organizer": "starter",
  "digital-photo-organizer": "starter",
  "transcription-notes-helper": "starter",
  "website-tester": "starter",
  "group-setup-helper": "starter",
  "online-research-assistant": "starter",
  "fb-marketplace-helper": "starter",
  // Pro — client / service / content work (includes former Starter chunk)
  "community-newsletter-creator": "pro",
  "local-content-photographer": "pro",
  "local-event-content-creator": "elite",
  "nonprofit-social-helper": "pro",
  "resume-linkedin-helper": "pro",
  "review-response-assistant": "pro",
  "google-business-helper": "pro",
  "local-resource-list-creator": "pro",
  "social": "pro",
  "short-form-video-editor": "starter",
  "ugc-creator": "starter",
  "pet-sitting": "pro",
  "trash-can-service": "pro",
  "car-interior-cleanup": "pro",
  "recycling-helper": "pro",
  "garage-sale-helper": "pro",
  "vacation-mail-plant-helper": "pro",
  "handyman-light": "pro",
  "notary": "pro",
  "etsy-store": "elite",
  "bookkeeping": "elite",
  "consulting": "pro",
  "teaching": "pro",
  "virtual-assistant": "pro",
  "virtual-receptionist": "pro",
  // Elite — premium teen creative / digital (on top of Digital/AI elite policy)
  "canva-flyer-creator": "elite",
  "digital-product-formatter": "starter",
};

/** Senior teaser ids → minimum membership tier (live guides use launchGuideId for adult map). */
export const SENIOR_GUIDE_MIN_TIER: Record<string, GuideMinTier> = {
  "ai-peer-class": "elite",
  "senior-rideshare": "pro",
  "safe-cohost": "pro",
  "senior-handyman": "free",
  "senior-affiliate": "elite",
  "senior-pod": "elite",
  "start-consulting": "starter",
  "pricing-crafts": "pro",
  "neighborhood-errands": "starter",
  "start-gardening-club": "elite",
  "start-book-club": "elite",
};

/** Kids/Teens Digital + AI hustles unlock at Elite (age-appropriate library). */
export function kidsTeensDigitalOrAiIsElite(guideId: string): boolean {
  if (
    guideId === "digital-cookbook-creator" ||
    guideId === "book-publishing-kids" ||
    guideId === "create-games-kids" ||
    guideId === "create-games-junior" ||
    guideId === "kids-games-ai" ||
    guideId === "junior-games-ai" ||
    guideId === "junior-content-create"
  ) {
    return true;
  }
  const h = hustleById(guideId);
  if (!h) return false;
  if (aiSideHustleMinTier(guideId) != null) return true;
  const cat = (h.category || "").trim();
  if (cat === "Digital" || /^AI\b/i.test(cat)) return true;
  return false;
}

export function adultGuideMinTier(guideId: string): GuideMinTier {
  const aiTier = aiSideHustleMinTier(guideId);
  if (aiTier) return aiTier;
  if (isFreeWizardHustle(guideId)) return "free";
  const fromMap = ADULT_GUIDE_MIN_TIER[guideId];
  if (fromMap) return fromMap === "free" ? "starter" : fromMap;
  const fromCatalog = hustleById(guideId)?.minTier;
  if (fromCatalog && fromCatalog !== "free") return fromCatalog;
  return "starter";
}

/**
 * Kids Guides library tiers (prefer kidsLibraryMinTier from age-library-tiers for the Guides page).
 * Digital & AI guides → Elite; kids money guides use the kids map; shared catalog follows adult ladder.
 */
export function kidsGuideMinTier(guideId: string): GuideMinTier {
  if (kidsTeensDigitalOrAiIsElite(guideId)) return "elite";
  const fromKidsMap = KIDS_GUIDE_MIN_TIER[guideId];
  if (fromKidsMap) return fromKidsMap;
  if (!guideId.startsWith("kids-") && !guideId.startsWith("junior-")) {
    return adultGuideMinTier(guideId);
  }
  return "starter";
}

/** Teens Guides library tiers — JUNIOR_GUIDE_MIN_TIER overrides, then kids/adult ladder. */
export function juniorGuideMinTier(guideId: string): GuideMinTier {
  if (kidsTeensDigitalOrAiIsElite(guideId)) return "elite";
  const fromJunior = JUNIOR_GUIDE_MIN_TIER[guideId];
  if (fromJunior) return fromJunior;
  return kidsGuideMinTier(guideId);
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
  /** GYSH Admin (self profile) — all live guides unlocked for review. */
  isAdmin?: boolean;
  /** One complimentary Match Wizard unlock (and any others already claimed). */
  complimentaryGuideIds?: string[];
  /** Guide id being gated — required for complimentary check. */
  guideId?: string;
};

export type GuideAccessResult = {
  unlocked: boolean;
  /** Guest — show Join CTA. */
  needsJoin: boolean;
  /** Member on a lower plan — show Upgrade CTA. */
  needsUpgrade: boolean;
  userTier: TierId;
  minTier: GuideMinTier;
  /** Unlocked only because the viewer is Admin — show “Admin view only”. */
  adminViewOnly: boolean;
};

export function resolveGuideAccess(input: GuideAccessInput): GuideAccessResult {
  const minTier = input.minTier;
  const guideId = input.guideId?.trim();
  const complimentaryIds = input.complimentaryGuideIds ?? cachedComplimentaryGuideIds();
  const complimentary =
    Boolean(guideId) && complimentaryIds.some((id) => id.trim() === guideId);

  if (complimentary) {
    const userTier = input.isMember ? normalizeGuideTier(input.membershipTier) : "free";
    return {
      unlocked: true,
      needsJoin: false,
      needsUpgrade: false,
      userTier,
      minTier,
      adminViewOnly: false,
    };
  }

  if (input.isAdmin) {
    const userTier = input.isMember ? normalizeGuideTier(input.membershipTier) : "free";
    const memberWouldUnlock =
      input.isMember && (complimentary || tierMeetsMinimum(userTier, minTier));
    return {
      unlocked: true,
      needsJoin: false,
      needsUpgrade: false,
      userTier,
      minTier,
      /** Only when Admin unlock is the reason — not for Free guides already on their plan. */
      adminViewOnly: !memberWouldUnlock,
    };
  }

  const userTier = input.isMember ? normalizeGuideTier(input.membershipTier) : "free";
  if (!input.isMember) {
    return {
      unlocked: false,
      needsJoin: true,
      needsUpgrade: false,
      userTier: "free",
      minTier,
      adminViewOnly: false,
    };
  }
  const unlocked = complimentary || tierMeetsMinimum(userTier, minTier);
  return {
    unlocked,
    needsJoin: false,
    needsUpgrade: !unlocked,
    userTier,
    minTier,
    adminViewOnly: false,
  };
}

/** Short badge on guide cards when unlocked / catalog. */
export function guideTierBadgeLabel(minTier: GuideMinTier): string {
  if (minTier === "free") return "Free Guide";
  return `${tierDisplayName(minTier)} Members`;
}

/** CSS tone class for membership bubbles / matching filter tabs (`glow-badge` + this). */
export function guideTierBadgeClass(minTier: GuideMinTier): "free" | "starter" | "pro" | "elite" {
  return minTier;
}

/**
 * Membership badge(s) for a guide card — the plan this guide belongs to.
 * Free / Starter / Pro / Elite each show one bubble in that tier’s tab color.
 */
export function membershipsIncludedForMinTier(minTier: GuideMinTier): GuideMinTier[] {
  return [minTier];
}

/**
 * Badge when content is locked — always names the required membership level.
 * Uses “Starter or higher” / “Pro or higher” so badges match unlock buttons
 * (ladder shorthand — not separate products like Starter+ / Pro+).
 */
export function membershipLockedBadgeLabel(minTier: GuideMinTier): string {
  if (minTier === "free") return "Locked · Join Free";
  return `Locked · Needs ${tierAndAboveLabel(minTier)}`;
}

/** Minimum tier for Schedule Suite features (tracker, progress, email). P&L is Elite. */
export const SCHEDULE_SUITE_MIN_TIER: GuideMinTier = "pro";

/**
 * Membership floor for launch-guide PDF downloads.
 * Guests cannot download. Logged-in members download only guides they can already view
 * (Free members: Free guides; Starter/Pro/Elite follow the same ladder as on-screen unlock).
 */
export const GUIDE_PDF_MIN_TIER: GuideMinTier = "free";

export function guidePdfAvailableLabel(minTier: GuideMinTier = GUIDE_PDF_MIN_TIER): string {
  if (minTier === "free") return "Join to download";
  return `Available on ${tierAndAboveLabel(minTier)}`;
}

/** Gate badge on the Download PDF button (guest vs upgrade). */
export function guidePdfGateLabel(access: Pick<GuideAccessResult, "needsJoin" | "needsUpgrade" | "minTier">): string {
  if (access.needsJoin) return "Join to download";
  if (access.needsUpgrade) return `Available on ${tierAndAboveLabel(access.minTier)}`;
  return guidePdfAvailableLabel(access.minTier);
}

export function membershipFeatureLockedBadgeLabel(
  feature: "schedule_suite" | "pnl" | "tracker" | "progress",
): string {
  if (feature === "pnl") return membershipLockedBadgeLabel("elite");
  return membershipLockedBadgeLabel(SCHEDULE_SUITE_MIN_TIER);
}

/** Compact label for narrow sidebars / chips (Free, Starter, Pro, Elite). */
export function guideTierShortLabel(minTier: GuideMinTier): string {
  if (minTier === "free") return "Free";
  return tierDisplayName(minTier);
}

/** Free chip on Open-guide buttons. Paid guides omit the badge. */
export function openGuideFreeBadgeLabel(minTier: GuideMinTier): "Free" | null {
  return minTier === "free" ? "Free" : null;
}

/** Extra line under Free Guide badges / cards (standalone or in copy). */
export const FREE_GUIDE_SIGNUP_NOTE = "Free Membership · sign-up, no credit card required";

/**
 * @deprecated Prefer {@link freeMembershipGuidesTag} with live Active Free count from
 * `guide-library-live-counts`. Static fallback only — not for UI after catalog load.
 */
export const FREE_MEMBERSHIP_SIDE_HUSTLE_GUIDE_COUNT = 20;

/** @deprecated Prefer freeMembershipGuidesTag(liveFreeCount). */
export const FREE_MEMBERSHIP_GUIDES_TAG = `Free comes with ${FREE_MEMBERSHIP_SIDE_HUSTLE_GUIDE_COUNT} Side Hustle Guides to choose from`;

/** @deprecated Prefer freeMembershipGuidesBanner(liveFreeCount). */
export const FREE_MEMBERSHIP_GUIDES_BANNER = `${FREE_MEMBERSHIP_SIDE_HUSTLE_GUIDE_COUNT} Side Hustle Guides to choose from`;

/** Membership requirement line for any guide. */
export function guideTierMembershipNote(minTier: GuideMinTier): string {
  if (minTier === "free") {
    return FREE_GUIDE_SIGNUP_NOTE;
  }
  return `Included with ${tierAndAboveLabel(minTier)}`;
}

/** True when this guide is the account’s one Match Wizard extra (100% match gift). */
export function isComplimentaryExtraUnlock(guideId: string | null | undefined): boolean {
  const id = String(guideId || "").trim();
  return Boolean(id) && cachedComplimentaryGuideIds().some((x) => x.trim() === id);
}

/**
 * Gift copy for the one complimentary Match Wizard extra the member checked.
 * Paid floors name the usual plan; Unique Unique Free stays a Free-library guide.
 */
export function complimentaryExtraGiftNote(minTier: GuideMinTier): string {
  if (minTier === "free") {
    return "This guide is on Unique Unique Free, and it is also your 1 complimentary Match Wizard gift, no matter the level.";
  }
  return `This guide is only available to ${tierAndAbovePlans(minTier)} members, but as a special gift, we are letting you have 1 complimentary guide (the one you checked), no matter the level, as a free gift.`;
}

/** Badge on the complimentary extra match — names that guide’s membership floor. */
export function complimentaryExtraUnlockBadge(minTier: GuideMinTier): string {
  return `Your 1 free ${guideTierShortLabel(minTier)} unlock`;
}

/** Complimentary unlock is for paid floors. Unique Unique Free is already included on Free. */
export function complimentaryUnlockAppliesToGuide(minTier: GuideMinTier): boolean {
  return normalizeGuideTier(minTier) !== "free";
}

/** All tier ids in ladder order (for filters / docs). */
export function guideTierLadder(): readonly TierId[] {
  return TIER_LADDER;
}

export type GuideCatalogAudience = "Adults" | "Kids" | "Teens" | "Seniors";

export type GuideCatalogRow = {
  id: string;
  title: string;
  /** Short “what it does” line shown next to the title in list views. */
  summary: string;
  audience: GuideCatalogAudience;
  minTier: GuideMinTier;
  /** Adult launch id when senior card opens a launch guide. */
  openId?: string;
};

/** Flat catalog for membership matrix / table views. */
export function buildGuideCatalogRows(input: {
  adult: { id: string; name: string; peek?: string }[];
  kids: { id: string; title: string; audience: "kids" | "junior"; summary?: string }[];
  seniors: {
    id: string;
    title: string;
    blurb?: string;
    launchGuideId?: string;
    status?: string;
  }[];
}): GuideCatalogRow[] {
  const rows: GuideCatalogRow[] = [];
  for (const g of input.adult) {
    rows.push({
      id: g.id,
      title: g.name,
      summary: (g.peek ?? "").trim(),
      audience: "Adults",
      minTier: adultGuideMinTier(g.id),
      openId: g.id,
    });
  }
  for (const g of input.kids) {
    rows.push({
      id: g.id,
      title: g.title,
      summary: (g.summary ?? "").trim(),
      audience: g.audience === "junior" ? "Teens" : "Kids",
      minTier: kidsGuideMinTier(g.id),
    });
  }
  for (const g of input.seniors) {
    if (g.status === "coming_soon") continue;
    rows.push({
      id: g.id,
      title: g.title,
      summary: (g.blurb ?? "").trim(),
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
