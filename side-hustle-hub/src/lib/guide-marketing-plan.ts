/**
 * Ensure every guide has Beach Shell Jewelry–style marketing plan steps
 * (Pick how… / Make your marketing materials / Carry out the marketing plan).
 */

import {
  clientScoutSteps,
  guideUsesNonLaunchPlaybook,
  guideUsesPlatformMarketplacePlaybook,
  SERVICE_CLIENT_SCOUT,
  type ClientScoutConfig,
  type DetailedGuideStep,
} from "./guide-detailed-steps";
import { hustleById } from "./side-hustle-catalog";
import { kidsGuideById } from "./kids-guides";

const MATERIALS_RE =
  /make your marketing materials|create your marketing campaign/i;
const CARRY_RE =
  /carry out (the|your) marketing plan|execute your marketing campaign/i;
const PICK_RE =
  /pick how you will tell people about your side hustle|decide on marketing objectives|choose your marketing channels/i;
const FOUNDATION_RE =
  /run this by your parent|research competitors|pick a name for your side hustle|plan what you.?re saving for|get parent thumbs up|set safety rules|consult parent/i;

/** Build scout config for any guide id (authored SERVICE_CLIENT_SCOUT preferred). */
export function clientScoutConfigForGuide(guideId: string): ClientScoutConfig {
  const authored = SERVICE_CLIENT_SCOUT[guideId];
  if (authored) return authored;

  const hustle = hustleById(guideId);
  if (hustle) {
    const youth = hustle.audiences.some((a) => a === "kids" || a === "junior");
    const priceHint =
      hustle.earningsExample?.match(/\$[\d,.]+(?:\s*[–-]\s*\$?[\d,.]+)?/)?.[0] ||
      "See the Suggested Pricing tab for starter prices.";
    return {
      serviceLabel: hustle.name,
      examplePitch: `I offer ${hustle.name} — ${hustle.description.slice(0, 120).replace(/\s+/g, " ").trim()}.`,
      examplePrice: `About ${priceHint} (examples only).`,
      youthFriendly: youth,
    };
  }

  const kids = kidsGuideById(guideId);
  if (kids) {
    return {
      serviceLabel: kids.title,
      examplePitch: `I’m working on “${kids.title}” — ${kids.summary.slice(0, 100).replace(/\s+/g, " ").trim()}.`,
      examplePrice: "Parent-approved prices — see the Suggested Pricing tab.",
      youthFriendly: true,
    };
  }

  const label = guideId.replace(/-/g, " ");
  return {
    serviceLabel: label,
    examplePitch: `I offer ${label}.`,
    examplePrice: "See the Suggested Pricing tab for starter prices.",
    youthFriendly: false,
  };
}

export function stepsIncludeMarketingMaterials(steps: DetailedGuideStep[]): boolean {
  return steps.some((s) => MATERIALS_RE.test(s.title));
}

export function stepsIncludeCarryOutMarketing(steps: DetailedGuideStep[]): boolean {
  return steps.some((s) => CARRY_RE.test(s.title));
}

/** Titles about figuring what you charge (so marketing can include prices). */
const PRICING_STEP_RE = /\b(price|pricing|rates?)\b/i;
const PRICING_STEP_EXCLUDE_RE = /pricelabs|price labs/i;

export function isGuidePricingStepTitle(title: string): boolean {
  return PRICING_STEP_RE.test(title) && !PRICING_STEP_EXCLUDE_RE.test(title);
}

/**
 * Move any pricing / rate steps that sit after “Make your marketing materials”
 * to immediately before that step (you need prices before you design materials).
 */
export function ensurePricingBeforeMarketingMaterials(
  steps: DetailedGuideStep[],
): DetailedGuideStep[] {
  const materialsAt = steps.findIndex((s) => MATERIALS_RE.test(s.title));
  if (materialsAt < 0) return steps;

  const pricingAfter: DetailedGuideStep[] = [];
  const kept: DetailedGuideStep[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    if (i > materialsAt && isGuidePricingStepTitle(step.title)) {
      pricingAfter.push(step);
    } else {
      kept.push(step);
    }
  }
  if (!pricingAfter.length) return steps;

  const insertAt = kept.findIndex((s) => MATERIALS_RE.test(s.title));
  if (insertAt < 0) return steps;
  return [...kept.slice(0, insertAt), ...pricingAfter, ...kept.slice(insertAt)];
}

/**
 * Inject missing marketing-plan steps (Beach Shell Jewelry template).
 * Keeps existing “Pick how…” / advertise steps; fills Make materials + Carry out when absent.
 * Always places pricing / rate steps before Make your marketing materials.
 */
export function ensureMarketingPlanSteps(
  steps: DetailedGuideStep[],
  guideId: string,
): DetailedGuideStep[] {
  // Savings / reinvest / free give-back / platform-marketplace guides skip client-scout marketing.
  if (guideUsesNonLaunchPlaybook(guideId) || guideUsesPlatformMarketplacePlaybook(guideId)) {
    return steps ?? [];
  }

  if (!steps.length) {
    return ensurePricingBeforeMarketingMaterials(
      clientScoutSteps(clientScoutConfigForGuide(guideId)),
    );
  }

  const hasCampaignCreate = steps.some((s) =>
    /create your marketing campaign|choose your marketing channels/i.test(s.title ?? ""),
  );
  const hasPick =
    steps.some((s) => PICK_RE.test(s.title)) || hasCampaignCreate;
  const hasMaterials = stepsIncludeMarketingMaterials(steps);
  const hasCarry = stepsIncludeCarryOutMarketing(steps);
  if (hasPick && hasMaterials && hasCarry) {
    return ensurePricingBeforeMarketingMaterials(steps);
  }

  const [pick, materials, carry] = clientScoutSteps(clientScoutConfigForGuide(guideId));
  const insert: DetailedGuideStep[] = [];
  if (!hasPick) insert.push(pick);
  if (!hasMaterials) insert.push(materials);
  if (!hasCarry) insert.push(carry);
  if (!insert.length) return ensurePricingBeforeMarketingMaterials(steps);

  // After last early foundation / pick-how step; otherwise after first step.
  let insertAt = 0;
  for (let i = 0; i < steps.length; i++) {
    const title = steps[i]?.title ?? "";
    if (FOUNDATION_RE.test(title) || PICK_RE.test(title) || /how you will advertise/i.test(title)) {
      insertAt = i + 1;
      continue;
    }
    break;
  }
  // If we already have pick-how later in the list, insert materials/carry right after it.
  const pickIdx = steps.findIndex((s) => PICK_RE.test(s.title) || /how you will advertise/i.test(s.title));
  if (pickIdx >= 0 && (hasMaterials === false || hasCarry === false)) {
    insertAt = pickIdx + 1;
  }

  return ensurePricingBeforeMarketingMaterials([
    ...steps.slice(0, insertAt),
    ...insert,
    ...steps.slice(insertAt),
  ]);
}

/**
 * Guide ids that lacked marketing materials/carry and/or Suggested Pricing / Supply List
 * before the Beach Shell Jewelry tab backfill — default to Pending / Needs Further Review.
 */
export const GUIDES_PENDING_AFTER_PREP_TAB_BACKFILL: readonly string[] = [
  "airbnb",
  "food-delivery",
  "property-mgmt",
  "book-publishing",
  "bookkeeping",
  "etsy-store",
  "nonprofit-social-helper",
  "community-newsletter-creator",
  "teaching",
  "review-response-assistant",
  "google-business-helper",
  "notary",
  "resume-linkedin-helper",
  "rideshare",
  "short-form-video-editor",
  "social",
  "ugc-creator",
  "virtual-assistant",
  "virtual-receptionist",
  "affiliate",
  "ai-agents",
  "ai-timing",
  "amazon",
  "digital-products",
  "dropshipping",
  "web-leads",
  "pod",
  "str-cohost",
  "airbnb-cohost",
  "virtual-call-assistant",
  "flipping-properties",
  "lien-tax-sales",
  "foreclosure-properties",
  "fb-marketplace-helper",
  "online-research-assistant",
  "digital-organizer",
  "transcription-notes-helper",
  "family-history-organizer",
  "digital-photo-organizer",
  "local-content-photographer",
  "local-event-content-creator",
  "travel-research-assistant",
  "online-community-moderator",
  "group-setup-helper",
  "website-tester",
  "digital-product-formatter",
  "appointment-setter",
  "lead-followup-assistant",
  "house-sitter",
  "porch-package-helper",
  "closet-organizer",
  "estate-sale-listing-helper",
  "personal-shopper",
  "airbnb-turnover-checker",
  "youth-sports-helper",
  "birthday-party-helper",
  "kids-party-game-host",
  "closet-cleanout-listing",
  "local-resource-list-creator",
  "start-gardening-club",
  "start-book-club",
  "book-publishing-kids",
  "create-games-junior",
  "babysitting",
  "mailbox-cleaning",
  "custom-bookmark-creator",
  "mothers-helper",
  "homework-organizer",
  "junior-savings-ceo",
  "junior-give-back-teach",
  "junior-games-ai",
  "junior-reinvest-ceo",
  "junior-content-create",
  "create-games-kids",
  "kids-piggy-first-goal",
  "kids-kindness-share",
  "kids-games-ai",
  "kids-reinvest-jar",
  "kids-craft-hustle",
  "cleaning-service",
  "consulting",
  "ai-assets",
  "ai-social-helper",
  "ai-promo-video",
  "ai-prompt-helper",
  "ai-peers",
  "local-business-ai-setup",
] as const;

export function guideMarkedPendingAfterPrepBackfill(guideId: string): boolean {
  return (GUIDES_PENDING_AFTER_PREP_TAB_BACKFILL as readonly string[]).includes(guideId);
}
