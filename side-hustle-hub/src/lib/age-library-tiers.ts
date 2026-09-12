/**
 * Per-age library membership tiers for the Guides page.
 * Cap: ≤ MAX_FREE_GUIDES_PER_AGE Free guides per age (maps to Membership Free).
 */

import {
  adultGuideMinTier,
  kidsTeensDigitalOrAiIsElite,
  KIDS_GUIDE_MIN_TIER,
  JUNIOR_GUIDE_MIN_TIER,
  SENIOR_GUIDE_MIN_TIER,
  type GuideMinTier,
} from "./guide-access";
import { isFreeWizardHustle } from "./side-hustle-catalog";

export const MAX_FREE_GUIDES_PER_AGE = 10;

/** Kids Age Free / Membership Free allowlist (≤10). */
export const KIDS_FREE_GUIDE_IDS = [
  "kids-piggy-first-goal",
  "kids-kindness-share",
  "lemonade-stand",
  "friendship-bracelet-maker",
  "beach-shell-jewelry",
  "crafts",
  "dog-walk",
  "plant-watering",
  "neighborhood-helper",
  "mothers-helper",
] as const;

/** Teens Age Free / Membership Free allowlist (≤10). */
export const JUNIOR_FREE_GUIDE_IDS = [
  "lemonade-stand",
  "friendship-bracelet-maker",
  "beach-shell-jewelry",
  "crafts",
  "dog-walk",
  "plant-watering",
  "neighborhood-helper",
  "babysitting",
  "junior-savings-ceo",
  "junior-give-back-teach",
] as const;

/** Seniors Age Free / Membership Free allowlist (≤10). */
export const SENIOR_FREE_GUIDE_IDS = [
  "crafts",
  "dog-walk",
  "plant-watering",
  "neighborhood-helper",
  "yard-help",
  "leaf-raking",
  "errand-runner",
  "cleaning-service",
  "handyman",
] as const;

/**
 * Senior library paid overrides (Free allowlist handled separately).
 * Moves excess Starter into Pro / Elite.
 */
export const SENIOR_LIBRARY_MIN_TIER: Record<string, GuideMinTier> = {
  // Former Free → Starter
  "food-delivery": "starter",
  "online-research-assistant": "starter",
  "digital-organizer": "starter",
  "digital-photo-organizer": "starter",
  "transcription-notes-helper": "starter",
  "group-setup-helper": "starter",
  "website-tester": "starter",
  "house-sitter": "starter",
  "closet-organizer": "starter",
  "personal-shopper": "starter",
  "family-history-organizer": "starter",
  "travel-research-assistant": "starter",
  "estate-sale-listing-helper": "starter",
  // Former Free / light digital → Pro
  "rideshare": "pro",
  "google-business-helper": "pro",
  "review-response-assistant": "pro",
  "resume-linkedin-helper": "pro",
  "community-newsletter-creator": "pro",
  "nonprofit-social-helper": "pro",
  // Former Starter → Pro
  "notary": "pro",
  "consulting": "pro",
  "bookkeeping": "pro",
  "teaching": "pro",
  "pet-sitting": "pro",
  "canva-flyer-creator": "pro",
  "handyman-light": "pro",
  "vacation-mail-plant-helper": "pro",
  "recycling-helper": "pro",
  "garage-sale-helper": "pro",
  "trash-can-service": "pro",
  "car-interior-cleanup": "pro",
  "porch-package-helper": "pro",
  "virtual-assistant": "pro",
  "virtual-receptionist": "pro",
  "etsy-store": "pro",
  // Former Starter → Elite
  "airbnb": "elite",
  "property-mgmt": "elite",
  "str-cohost": "elite",
  "ai-peers": "elite",
  "virtual-call-assistant": "elite",
  "start-gardening-club": "elite",
  "start-book-club": "elite",
  "affiliate": "elite",
  "flipping-properties": "elite",
  "lien-tax-sales": "elite",
  "foreclosure-properties": "elite",
};

/** Kids paid overrides beyond Free allowlist / Digital-AI elite. */
export const KIDS_LIBRARY_MIN_TIER: Record<string, GuideMinTier> = {
  "yard-help": "starter",
  "gift-wrapping": "starter",
  "basic-invitation-creator": "starter",
  "family-photo-slideshow": "starter",
  "family-history-organizer": "starter",
  "mailbox-cleaning": "starter",
  "toy-organizer": "starter",
  "custom-bookmark-creator": "starter",
  "homework-organizer": "starter",
  "kids-reinvest-jar": "starter",
  "kids-craft-hustle": "starter",
  "kids-games-ai": "elite",
  "create-games-kids": "elite",
  "digital-cookbook-creator": "elite",
  "book-publishing-kids": "elite",
};

function clampFree(tier: GuideMinTier, guideId: string, allow: ReadonlySet<string>): GuideMinTier {
  if (tier !== "free") return tier;
  return allow.has(guideId) ? "free" : "starter";
}

const KIDS_FREE = new Set<string>(KIDS_FREE_GUIDE_IDS);
const JUNIOR_FREE = new Set<string>(JUNIOR_FREE_GUIDE_IDS);
const SENIOR_FREE = new Set<string>(SENIOR_FREE_GUIDE_IDS);

/** Kids Guides library tier (≤10 Free). */
export function kidsLibraryMinTier(guideId: string): GuideMinTier {
  if (kidsTeensDigitalOrAiIsElite(guideId)) return "elite";
  if (KIDS_LIBRARY_MIN_TIER[guideId]) return KIDS_LIBRARY_MIN_TIER[guideId];
  const fromKidsMap = KIDS_GUIDE_MIN_TIER[guideId];
  if (fromKidsMap) return clampFree(fromKidsMap, guideId, KIDS_FREE);
  if (KIDS_FREE.has(guideId)) return "free";
  if (guideId.startsWith("kids-")) return "starter";
  return clampFree(adultGuideMinTier(guideId), guideId, KIDS_FREE);
}

/** Teens Guides library tier (≤10 Free). */
export function juniorLibraryMinTier(guideId: string): GuideMinTier {
  if (kidsTeensDigitalOrAiIsElite(guideId)) return "elite";
  if (JUNIOR_GUIDE_MIN_TIER[guideId]) return JUNIOR_GUIDE_MIN_TIER[guideId];
  const fromKidsMap = KIDS_GUIDE_MIN_TIER[guideId];
  if (fromKidsMap) return clampFree(fromKidsMap, guideId, JUNIOR_FREE);
  if (JUNIOR_FREE.has(guideId)) return "free";
  if (guideId.startsWith("junior-")) return "starter";
  return clampFree(adultGuideMinTier(guideId), guideId, JUNIOR_FREE);
}

/** Seniors Guides library tier (≤10 Free; Starter spread into Pro/Elite). */
export function seniorLibraryMinTier(guideId: string, launchGuideId?: string): GuideMinTier {
  const primary = launchGuideId || guideId;
  if (SENIOR_LIBRARY_MIN_TIER[guideId]) return SENIOR_LIBRARY_MIN_TIER[guideId];
  if (launchGuideId && SENIOR_LIBRARY_MIN_TIER[launchGuideId]) {
    return SENIOR_LIBRARY_MIN_TIER[launchGuideId];
  }
  if (SENIOR_GUIDE_MIN_TIER[guideId]) {
    return clampFree(SENIOR_GUIDE_MIN_TIER[guideId], guideId, SENIOR_FREE);
  }
  if (SENIOR_FREE.has(primary) || SENIOR_FREE.has(guideId)) return "free";
  const base = launchGuideId ? adultGuideMinTier(launchGuideId) : adultGuideMinTier(guideId);
  return clampFree(base, primary, SENIOR_FREE);
}

/** Adults Guides library: Free = Free Wizard allowlist only (≤10). */
export function adultLibraryMinTier(guideId: string): GuideMinTier {
  if (isFreeWizardHustle(guideId)) return "free";
  const tier = adultGuideMinTier(guideId);
  return tier === "free" ? "starter" : tier;
}

/** Membership min tier for a Match Wizard / Blueprint result card by age lane. */
export function wizardResultMinTier(
  ageGroup: "kids" | "junior" | "adult" | "senior",
  hustleId: string,
): GuideMinTier {
  if (ageGroup === "kids") return kidsLibraryMinTier(hustleId);
  if (ageGroup === "junior") return juniorLibraryMinTier(hustleId);
  if (ageGroup === "senior") return seniorLibraryMinTier(hustleId);
  return adultLibraryMinTier(hustleId);
}

export function assertFreeAllowlistsWithinCap(): void {
  if (KIDS_FREE_GUIDE_IDS.length > MAX_FREE_GUIDES_PER_AGE) {
    throw new Error(`Kids Free allowlist exceeds ${MAX_FREE_GUIDES_PER_AGE}`);
  }
  if (JUNIOR_FREE_GUIDE_IDS.length > MAX_FREE_GUIDES_PER_AGE) {
    throw new Error(`Teens Free allowlist exceeds ${MAX_FREE_GUIDES_PER_AGE}`);
  }
  if (SENIOR_FREE_GUIDE_IDS.length > MAX_FREE_GUIDES_PER_AGE) {
    throw new Error(`Seniors Free allowlist exceeds ${MAX_FREE_GUIDES_PER_AGE}`);
  }
}
