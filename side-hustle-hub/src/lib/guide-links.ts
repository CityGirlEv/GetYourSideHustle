/**
 * Guide ↔ demographics and Guide ↔ Side Hustle many-to-many maps.
 * Reuses existing guide ids only — no fake resources.
 */

import { SIDE_HUSTLE_CATALOG, type HustleAgeGroup } from "./side-hustle-catalog";
import { LAUNCH_GUIDES } from "./launch-guides";
import { KIDS_GUIDES } from "./kids-guides";
import { SENIOR_GUIDE_TEASERS } from "./seniors-content";
import { adultGuideMinTier, kidsGuideMinTier, seniorGuideMinTier } from "./guide-access";
import { SCHEDULE_SUITE_TIER } from "./membership";

/** Existing launch / kids / senior guide → audiences. */
export const GUIDE_AUDIENCES: Record<string, HustleAgeGroup[]> = {
  // Adult launch guides
  airbnb: ["adult", "senior"],
  pod: ["adult", "junior"],
  dropshipping: ["adult"],
  "digital-products": ["adult", "junior", "senior"],
  affiliate: ["adult", "senior", "junior"],
  amazon: ["adult"],
  social: ["adult", "junior"],
  "web-leads": ["adult"],
  "ai-assets": ["adult", "junior"],
  "property-mgmt": ["adult", "senior"],
  handyman: ["adult", "senior"],
  rideshare: ["adult", "senior"],
  "food-delivery": ["adult", "senior"],
  "ai-timing": ["adult"],
  "ai-agents": ["adult"],
  "book-publishing": ["adult", "senior", "kids", "junior"],
  // Kids guides
  "kids-piggy-first-goal": ["kids"],
  "kids-kindness-share": ["kids"],
  "kids-reinvest-jar": ["kids"],
  "kids-craft-hustle": ["kids"],
  "kids-games-ai": ["kids"],
  "junior-savings-ceo": ["junior"],
  "junior-give-back-teach": ["junior"],
  "junior-reinvest-ceo": ["junior"],
  "junior-games-ai": ["junior"],
  "junior-content-create": ["junior"],
  // Senior teasers
  "ai-peer-class": ["senior"],
  "safe-cohost": ["senior", "adult"],
  "senior-rideshare": ["senior", "adult"],
  "senior-handyman": ["senior", "adult"],
  "senior-affiliate": ["senior", "adult"],
  "start-consulting": ["senior", "adult"],
  "pricing-crafts": ["senior", "adult", "kids", "junior"],
  "neighborhood-errands": ["senior", "adult", "junior"],
};

/** Guide id → related hustle ids (existing hustles only). */
export const GUIDE_HUSTLE_IDS: Record<string, string[]> = {
  airbnb: ["airbnb", "str-cohost", "airbnb-turnover-checker", "property-mgmt"],
  "property-mgmt": ["property-mgmt", "airbnb", "str-cohost", "airbnb-turnover-checker"],
  handyman: ["handyman", "handyman-light", "cleaning-service", "yard-help", "errand-runner", "neighborhood-helper"],
  "cleaning-service": ["cleaning-service", "handyman", "errand-runner", "property-mgmt"],
  rideshare: ["rideshare", "food-delivery", "ai-timing"],
  "food-delivery": ["food-delivery", "rideshare"],
  affiliate: ["affiliate", "social", "community-newsletter-creator"],
  social: ["social", "ai-social-helper", "ugc-creator", "short-form-video-editor", "nonprofit-social-helper"],
  "digital-products": ["digital-products", "book-publishing", "digital-product-formatter", "digital-cookbook-creator", "crafts"],
  "book-publishing": ["book-publishing", "book-publishing-kids", "digital-products"],
  "ai-assets": ["ai-assets", "canva-flyer-creator", "ai-promo-video", "basic-invitation-creator"],
  "ai-agents": ["ai-agents", "ai-prompt-helper", "local-business-ai-setup", "ai-peers"],
  "ai-timing": ["ai-timing", "rideshare", "food-delivery"],
  "web-leads": ["web-leads", "google-business-helper", "local-business-ai-setup", "website-tester"],
  pod: ["pod"],
  dropshipping: ["dropshipping"],
  amazon: ["amazon"],
  "kids-craft-hustle": ["crafts", "friendship-bracelet-maker", "greeting-card-creator", "custom-bookmark-creator"],
  "kids-games-ai": ["create-games-kids"],
  "junior-games-ai": ["create-games-junior"],
  "junior-content-create": ["social", "canva-flyer-creator", "ai-social-helper"],
  "kids-piggy-first-goal": ["lemonade-stand", "dog-walk", "yard-help"],
  "junior-savings-ceo": ["dog-walk", "tech-helper", "errand-runner"],
  "senior-handyman": ["handyman", "handyman-light"],
  "senior-rideshare": ["rideshare"],
  "senior-affiliate": ["affiliate"],
  "safe-cohost": ["str-cohost", "property-mgmt", "airbnb"],
  "ai-peer-class": ["ai-peers", "tech-helper", "ai-prompt-helper"],
  "neighborhood-errands": ["errand-runner", "vacation-mail-plant-helper", "trash-can-service"],
  "pricing-crafts": ["crafts"],
};

export type LaunchKitItem = {
  kind: "guide" | "checklist" | "schedule";
  id: string;
  title: string;
  hrefHint: string;
  lockedForNonPro?: boolean;
  minTier?: string;
};

/** Related existing guides / checklist / Schedule CTA for a hustle — no fake links. */
export function buildLaunchKit(hustleId: string): LaunchKitItem[] {
  const record = SIDE_HUSTLE_CATALOG.find((h) => h.id === hustleId);
  const related = new Set<string>([
    ...(record?.relatedGuideIds ?? []),
    hustleId,
  ]);
  for (const [guideId, hustleIds] of Object.entries(GUIDE_HUSTLE_IDS)) {
    if (hustleIds.includes(hustleId)) related.add(guideId);
  }

  const items: LaunchKitItem[] = [];
  for (const gid of related) {
    const launch = LAUNCH_GUIDES.find((g) => g.id === gid);
    if (launch) {
      items.push({
        kind: "guide",
        id: launch.id,
        title: launch.name,
        hrefHint: `/guides?hustle=${launch.id}`,
        minTier: adultGuideMinTier(launch.id),
      });
      continue;
    }
    const kids = KIDS_GUIDES.find((g) => g.id === gid);
    if (kids) {
      items.push({
        kind: "guide",
        id: kids.id,
        title: kids.title,
        hrefHint: kids.audience === "junior" ? "/kids?tab=guides&mode=junior" : "/kids?tab=guides&mode=kids",
        minTier: kidsGuideMinTier(kids.id),
      });
      continue;
    }
    const senior = SENIOR_GUIDE_TEASERS.find((g) => g.id === gid);
    if (senior && senior.status !== "coming_soon") {
      items.push({
        kind: "guide",
        id: senior.id,
        title: senior.title,
        hrefHint: "/seniors?tab=guides",
        minTier: seniorGuideMinTier(senior.id, senior.launchGuideId),
      });
    }
  }

  items.push({
    kind: "checklist",
    id: "side-hustle-checklist",
    title: "GYSH Side Hustle Checklist",
    hrefHint: "/checklist",
  });

  items.push({
    kind: "schedule",
    id: "schedule-suite",
    title: "Schedule Suite",
    hrefHint: "/my-dashboard#schedule",
    lockedForNonPro: true,
    minTier: SCHEDULE_SUITE_TIER,
  });

  // Dedupe by id
  const seen = new Set<string>();
  return items.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
}

export function guideAudiences(guideId: string): HustleAgeGroup[] {
  return GUIDE_AUDIENCES[guideId] ?? [];
}

export function hustleIdsForGuide(guideId: string): string[] {
  return GUIDE_HUSTLE_IDS[guideId] ?? [];
}
