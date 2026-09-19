/**
 * Suggested charge prices for service / product hustles (examples only — not guarantees).
 */

import { ERRAND_RUNNER_PRICING } from "./errand-runner-guide";
import { NEIGHBORHOOD_HELPER_PRICING } from "./neighborhood-helper-guide";
import { AI_ASSETS_PRICING } from "./ai-assets-guide";
import { AIRBNB_COHOST_PRICING } from "./airbnb-cohost-guide";
import { AMAZON_FBA_SELLER_PRICING } from "./amazon-fba-seller-guide";
import { VIRTUAL_CALL_ASSISTANT_PRICING } from "./virtual-call-assistant-guide";
import { AI_SOCIAL_HELPER_PRICING } from "./ai-social-helper-guide";
import { BIRTHDAY_PARTY_HELPER_PRICING } from "./birthday-party-helper-guide";
import { CLOSET_ORGANIZER_PRICING } from "./closet-organizer-guide";
import { LIEN_TAX_SALES_PRICING } from "./lien-tax-sales-guide";
import { JUNIOR_CONTENT_CREATE_PRICING } from "./junior-content-create-guide";
import { KIDS_CRAFT_HUSTLE_PRICING } from "./kids-craft-hustle-guide";
import { CREATE_GAMES_KIDS_PRICING } from "./create-games-kids-guide";
import { CREATE_GAMES_JUNIOR_PRICING } from "./create-games-junior-guide";
import { CUSTOM_BOOKMARK_CREATOR_PRICING } from "./custom-bookmark-creator-guide";
import { WEB_LEADS_PRICING } from "./web-leads-guide";
import { MAILBOX_CLEANING_PRICING } from "./mailbox-cleaning-guide";
import { AI_AGENTS_PRICING } from "./ai-agents-guide";
import { AI_PROMO_VIDEO_PRICING } from "./ai-promo-video-guide";
import { STR_COHOST_PRICING } from "./str-cohost-guide";
import { BEACH_SHELL_JEWELRY_PRICING } from "./beach-shell-jewelry-guide";
import { GIFT_WRAPPING_PRICING } from "./gift-wrapping-guide";
import { AFFILIATE_PRICING } from "./affiliate-guide";
import { DROPSHIPPING_PRICING } from "./dropshipping-guide";
import { FB_MARKETPLACE_HELPER_PRICING } from "./fb-marketplace-helper-guide";
import { BASIC_INVITATION_PRICING } from "./basic-invitation-creator-guide";
import { POD_PRICING } from "./pod-guide";
import { PET_SITTING_PRICING } from "./pet-sitting-guide";
import { HANDYMAN_PRICING } from "./handyman-guide";
import { FRIENDSHIP_BRACELET_PRICING } from "./friendship-bracelet-maker-guide";
import { LEAF_RAKING_PRICING } from "./leaf-raking-guide";
import { LEMONADE_STAND_PRICING } from "./lemonade-stand-guide";
import { AIRBNB_HOSTING_PRICING } from "./airbnb-hosting-guide";
import { DIGITAL_COOKBOOK_PRICING } from "./digital-cookbook-creator-guide";
import { FAMILY_PHOTO_SLIDESHOW_PRICING } from "./family-photo-slideshow-guide";
import { LOCAL_RESOURCE_LIST_PRICING } from "./local-resource-list-creator-guide";
import { RECYCLING_HELPER_PRICING } from "./recycling-helper-guide";
import { PROOFREADER_PRICING } from "./proofreader-guide";
import { TOY_ORGANIZER_PRICING } from "./toy-organizer-guide";
import { TRASH_CAN_SERVICE_PRICING } from "./trash-can-service-guide";
import { HOMEWORK_HELPER_PRICING } from "./homework-helper-guide";
import { CANVA_FLYER_PRICING } from "./canva-flyer-creator-guide";
import { CAR_INTERIOR_PRICING } from "./car-interior-cleanup-guide";
import { NEIGHBORHOOD_DOG_WALKER_PRICING } from "./neighborhood-dog-walker-guide";

export type GuidePricingItem = {
  id: string;
  label: string;
  /** What to charge the customer */
  price: string;
  notes?: string;
};

export type GuideSuggestedPricing = {
  items: GuidePricingItem[];
  /** How to raise rates later */
  raiseTip?: string;
  /** Override prep-tab label (e.g. Earnings & Order Strategy for delivery). */
  tabLabel?: string;
  /** Extra strategy copy shown above the price list. */
  intro?: string;
};

function p(id: string, label: string, price: string, notes?: string): GuidePricingItem {
  return { id, label, price, notes };
}

const RAISE =
  "After 3–5 happy customers, raise 10–20% or add a rush fee. Examples only — not income guarantees.";

/** Suggested customer prices by guide / hustle id. */
export const GUIDE_SUGGESTED_PRICING: Record<string, GuideSuggestedPricing> = {
  "car-interior-cleanup": {
    tabLabel: CAR_INTERIOR_PRICING.tabLabel,
    raiseTip: CAR_INTERIOR_PRICING.raiseTip,
    intro: CAR_INTERIOR_PRICING.intro,
    items: CAR_INTERIOR_PRICING.items.map((item) => ({ ...item })),
  },
  "errand-runner": {
    tabLabel: ERRAND_RUNNER_PRICING.tabLabel,
    raiseTip: ERRAND_RUNNER_PRICING.raiseTip,
    intro: ERRAND_RUNNER_PRICING.intro,
    items: ERRAND_RUNNER_PRICING.items.map((item) => ({ ...item })),
  },
  "ai-agents": {
    tabLabel: AI_AGENTS_PRICING.tabLabel,
    raiseTip: AI_AGENTS_PRICING.raiseTip,
    intro: AI_AGENTS_PRICING.intro,
    items: AI_AGENTS_PRICING.items.map((item) => ({ ...item })),
  },
  "ai-promo-video": {
    tabLabel: AI_PROMO_VIDEO_PRICING.tabLabel,
    raiseTip: AI_PROMO_VIDEO_PRICING.raiseTip,
    intro: AI_PROMO_VIDEO_PRICING.intro,
    items: AI_PROMO_VIDEO_PRICING.items.map((item) => ({ ...item })),
  },
  "str-cohost": {
    tabLabel: STR_COHOST_PRICING.tabLabel,
    raiseTip: STR_COHOST_PRICING.raiseTip,
    intro: STR_COHOST_PRICING.intro,
    items: STR_COHOST_PRICING.items.map((item) => ({ ...item })),
  },
  "dog-walk": {
    tabLabel: NEIGHBORHOOD_DOG_WALKER_PRICING.tabLabel,
    raiseTip: NEIGHBORHOOD_DOG_WALKER_PRICING.raiseTip,
    intro: NEIGHBORHOOD_DOG_WALKER_PRICING.intro,
    items: NEIGHBORHOOD_DOG_WALKER_PRICING.items.map((item) => ({ ...item })),
  },
  "yard-help": {
    raiseTip:
      "A $15 quick rake is not the same job as two hours of weeds, leaves, and cleanup. Quote by tasks, area, and time. Displayed range: $15 – $30 / yard. Examples only — not income guarantees.",
    intro:
      "Keep displayed: $15 – $30 / yard. Define what “one yard” includes. Do not promise unlimited work for $15–$30.",
    items: [
      p("small", "Small / Quick Yard Help", "$15"),
      p("standard", "Standard Light Yard Job", "$20–$25"),
      p("larger", "Larger / Heavier Beginner-Safe Job", "$25–$30+"),
      p("bags", "Add-on: Extra bags", "Agree in advance"),
    ],
  },
  "pet-sitting": {
    tabLabel: PET_SITTING_PRICING.tabLabel,
    raiseTip: PET_SITTING_PRICING.raiseTip,
    intro: PET_SITTING_PRICING.intro,
    items: PET_SITTING_PRICING.items.map((item) => ({ ...item })),
  },
  "plant-watering": {
    raiseTip: RAISE,
    items: [
      p("visit", "Per watering visit", "$10–15"),
      p("week", "Daily visits for 1 week", "$60–90"),
      p("bundle", "Bundle with mail pickup", "+$5–10 / trip"),
    ],
  },
  handyman: {
    tabLabel: HANDYMAN_PRICING.tabLabel,
    raiseTip: HANDYMAN_PRICING.raiseTip,
    intro: HANDYMAN_PRICING.intro,
    items: HANDYMAN_PRICING.items.map((item) => ({ ...item })),
  },
  "handyman-light": {
    raiseTip: RAISE,
    items: [
      p("assemble", "Furniture assembly (simple)", "$40–70"),
      p("hang", "Picture / shelf hang", "$25–45"),
      p("declutter", "2-hour declutter assist", "$50–80"),
      p("hour", "Hourly youth rate", "$20–35 / hr"),
    ],
  },
  "tech-helper": {
    raiseTip: RAISE,
    items: [
      p("quick", "Quick tech lesson (30 minutes)", "$15–$25"),
      p("standard", "Standard smartphone session (60 minutes)", "$25–$45"),
      p("extended", "Extended / multi-topic session (90 minutes)", "$40–$65+"),
      p("pack", "3-session package", "Agreed package price"),
      p("addon", "Add-ons (cheat sheet, extra device, travel, follow-up)", "Quoted separately"),
    ],
  },
  homework: {
    tabLabel: HOMEWORK_HELPER_PRICING.tabLabel,
    raiseTip: HOMEWORK_HELPER_PRICING.raiseTip,
    intro: HOMEWORK_HELPER_PRICING.intro,
    items: HOMEWORK_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  tutoring: {
    raiseTip: RAISE,
    items: [
      p("elem", "Elementary subjects", "$25–35 / hr"),
      p("ms", "Middle school", "$30–40 / hr"),
      p("hs", "High school / test prep", "$40–55 / hr"),
      p("pack", "4-pack prepaid", "5–10% off"),
    ],
  },
  proofreader: {
    tabLabel: PROOFREADER_PRICING.tabLabel,
    raiseTip: PROOFREADER_PRICING.raiseTip,
    intro: PROOFREADER_PRICING.intro,
    items: PROOFREADER_PRICING.items.map((item) => ({ ...item })),
  },
  "gift-wrapping": {
    tabLabel: GIFT_WRAPPING_PRICING.tabLabel,
    raiseTip: GIFT_WRAPPING_PRICING.raiseTip,
    intro: GIFT_WRAPPING_PRICING.intro,
    items: GIFT_WRAPPING_PRICING.items.map((item) => ({ ...item })),
  },
  affiliate: {
    tabLabel: AFFILIATE_PRICING.tabLabel,
    raiseTip: AFFILIATE_PRICING.raiseTip,
    intro: AFFILIATE_PRICING.intro,
    items: AFFILIATE_PRICING.items.map((item) => ({ ...item })),
  },
  dropshipping: {
    tabLabel: DROPSHIPPING_PRICING.tabLabel,
    raiseTip: DROPSHIPPING_PRICING.raiseTip,
    intro: DROPSHIPPING_PRICING.intro,
    items: DROPSHIPPING_PRICING.items.map((item) => ({ ...item })),
  },
  "fb-marketplace-helper": {
    tabLabel: FB_MARKETPLACE_HELPER_PRICING.tabLabel,
    raiseTip: FB_MARKETPLACE_HELPER_PRICING.raiseTip,
    intro: FB_MARKETPLACE_HELPER_PRICING.intro,
    items: FB_MARKETPLACE_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  "basic-invitation-creator": {
    tabLabel: BASIC_INVITATION_PRICING.tabLabel,
    raiseTip: BASIC_INVITATION_PRICING.raiseTip,
    intro: BASIC_INVITATION_PRICING.intro,
    items: BASIC_INVITATION_PRICING.items.map((item) => ({ ...item })),
  },
  pod: {
    tabLabel: POD_PRICING.tabLabel,
    raiseTip: POD_PRICING.raiseTip,
    intro: POD_PRICING.intro,
    items: POD_PRICING.items.map((item) => ({ ...item })),
  },
  "lemonade-stand": {
    tabLabel: LEMONADE_STAND_PRICING.tabLabel,
    raiseTip: LEMONADE_STAND_PRICING.raiseTip,
    intro: LEMONADE_STAND_PRICING.intro,
    items: LEMONADE_STAND_PRICING.items.map((item) => ({ ...item })),
  },
  "trash-can-service": {
    tabLabel: TRASH_CAN_SERVICE_PRICING.tabLabel,
    raiseTip: TRASH_CAN_SERVICE_PRICING.raiseTip,
    intro: TRASH_CAN_SERVICE_PRICING.intro,
    items: TRASH_CAN_SERVICE_PRICING.items.map((item) => ({ ...item })),
  },
  "neighborhood-helper": {
    tabLabel: NEIGHBORHOOD_HELPER_PRICING.tabLabel,
    raiseTip: NEIGHBORHOOD_HELPER_PRICING.raiseTip,
    intro: NEIGHBORHOOD_HELPER_PRICING.intro,
    items: NEIGHBORHOOD_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  "ai-assets": {
    tabLabel: AI_ASSETS_PRICING.tabLabel,
    raiseTip: AI_ASSETS_PRICING.raiseTip,
    intro: AI_ASSETS_PRICING.intro,
    items: AI_ASSETS_PRICING.items.map((item) => ({ ...item })),
  },
  "airbnb-cohost": {
    tabLabel: AIRBNB_COHOST_PRICING.tabLabel,
    raiseTip: AIRBNB_COHOST_PRICING.raiseTip,
    intro: AIRBNB_COHOST_PRICING.intro,
    items: AIRBNB_COHOST_PRICING.items.map((item) => ({ ...item })),
  },
  amazon: {
    tabLabel: AMAZON_FBA_SELLER_PRICING.tabLabel,
    raiseTip: AMAZON_FBA_SELLER_PRICING.raiseTip,
    intro: AMAZON_FBA_SELLER_PRICING.intro,
    items: AMAZON_FBA_SELLER_PRICING.items.map((item) => ({ ...item })),
  },
  "virtual-call-assistant": {
    tabLabel: VIRTUAL_CALL_ASSISTANT_PRICING.tabLabel,
    raiseTip: VIRTUAL_CALL_ASSISTANT_PRICING.raiseTip,
    intro: VIRTUAL_CALL_ASSISTANT_PRICING.intro,
    items: VIRTUAL_CALL_ASSISTANT_PRICING.items.map((item) => ({ ...item })),
  },
  "ai-social-helper": {
    tabLabel: AI_SOCIAL_HELPER_PRICING.tabLabel,
    raiseTip: AI_SOCIAL_HELPER_PRICING.raiseTip,
    intro: AI_SOCIAL_HELPER_PRICING.intro,
    items: AI_SOCIAL_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  "birthday-party-helper": {
    tabLabel: BIRTHDAY_PARTY_HELPER_PRICING.tabLabel,
    raiseTip: BIRTHDAY_PARTY_HELPER_PRICING.raiseTip,
    intro: BIRTHDAY_PARTY_HELPER_PRICING.intro,
    items: BIRTHDAY_PARTY_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  "closet-organizer": {
    tabLabel: CLOSET_ORGANIZER_PRICING.tabLabel,
    raiseTip: CLOSET_ORGANIZER_PRICING.raiseTip,
    intro: CLOSET_ORGANIZER_PRICING.intro,
    items: CLOSET_ORGANIZER_PRICING.items.map((item) => ({ ...item })),
  },
  "lien-tax-sales": {
    tabLabel: LIEN_TAX_SALES_PRICING.tabLabel,
    raiseTip: LIEN_TAX_SALES_PRICING.raiseTip,
    intro: LIEN_TAX_SALES_PRICING.intro,
    items: LIEN_TAX_SALES_PRICING.items.map((item) => ({ ...item })),
  },
  "junior-content-create": {
    tabLabel: JUNIOR_CONTENT_CREATE_PRICING.tabLabel,
    raiseTip: JUNIOR_CONTENT_CREATE_PRICING.raiseTip,
    intro: JUNIOR_CONTENT_CREATE_PRICING.intro,
    items: JUNIOR_CONTENT_CREATE_PRICING.items.map((item) => ({ ...item })),
  },
  "kids-craft-hustle": {
    tabLabel: KIDS_CRAFT_HUSTLE_PRICING.tabLabel,
    raiseTip: KIDS_CRAFT_HUSTLE_PRICING.raiseTip,
    intro: KIDS_CRAFT_HUSTLE_PRICING.intro,
    items: KIDS_CRAFT_HUSTLE_PRICING.items.map((item) => ({ ...item })),
  },
  "create-games-kids": {
    tabLabel: CREATE_GAMES_KIDS_PRICING.tabLabel,
    raiseTip: CREATE_GAMES_KIDS_PRICING.raiseTip,
    intro: CREATE_GAMES_KIDS_PRICING.intro,
    items: CREATE_GAMES_KIDS_PRICING.items.map((item) => ({ ...item })),
  },
  "create-games-junior": {
    tabLabel: CREATE_GAMES_JUNIOR_PRICING.tabLabel,
    raiseTip: CREATE_GAMES_JUNIOR_PRICING.raiseTip,
    intro: CREATE_GAMES_JUNIOR_PRICING.intro,
    items: CREATE_GAMES_JUNIOR_PRICING.items.map((item) => ({ ...item })),
  },
  "custom-bookmark-creator": {
    tabLabel: CUSTOM_BOOKMARK_CREATOR_PRICING.tabLabel,
    raiseTip: CUSTOM_BOOKMARK_CREATOR_PRICING.raiseTip,
    intro: CUSTOM_BOOKMARK_CREATOR_PRICING.intro,
    items: CUSTOM_BOOKMARK_CREATOR_PRICING.items.map((item) => ({ ...item })),
  },
  "web-leads": {
    tabLabel: WEB_LEADS_PRICING.tabLabel,
    raiseTip: WEB_LEADS_PRICING.raiseTip,
    intro: WEB_LEADS_PRICING.intro,
    items: WEB_LEADS_PRICING.items.map((item) => ({ ...item })),
  },
  "mailbox-cleaning": {
    tabLabel: MAILBOX_CLEANING_PRICING.tabLabel,
    raiseTip: MAILBOX_CLEANING_PRICING.raiseTip,
    intro: MAILBOX_CLEANING_PRICING.intro,
    items: MAILBOX_CLEANING_PRICING.items.map((item) => ({ ...item })),
  },
  "leaf-raking": {
    tabLabel: LEAF_RAKING_PRICING.tabLabel,
    raiseTip: LEAF_RAKING_PRICING.raiseTip,
    intro: LEAF_RAKING_PRICING.intro,
    items: LEAF_RAKING_PRICING.items.map((item) => ({ ...item })),
  },
  "beach-shell-jewelry": {
    tabLabel: BEACH_SHELL_JEWELRY_PRICING.tabLabel,
    raiseTip: BEACH_SHELL_JEWELRY_PRICING.raiseTip,
    intro: BEACH_SHELL_JEWELRY_PRICING.intro,
    items: BEACH_SHELL_JEWELRY_PRICING.items.map((item) => ({ ...item })),
  },
  "garage-sale-helper": {
    raiseTip: RAISE,
    items: [
      p("flat", "Half-day setup + staffing", "$40–60"),
      p("day", "Full day", "$80–120"),
      p("cut", "Or commission", "10% of sales (agree first)"),
    ],
  },
  "holiday-decorating-helper": {
    raiseTip: RAISE,
    items: [
      p("porch", "Front porch only", "$100–175"),
      p("house", "Whole-house with adult ladder team", "$250–400"),
      p("takedown", "January takedown", "50% of install"),
    ],
  },
  "recycling-helper": {
    tabLabel: RECYCLING_HELPER_PRICING.tabLabel,
    raiseTip: RECYCLING_HELPER_PRICING.raiseTip,
    intro: RECYCLING_HELPER_PRICING.intro,
    items: RECYCLING_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  "vacation-mail-plant-helper": {
    raiseTip: RAISE,
    items: [
      p("visit", "Daily plant visit", "$15–25"),
      p("week", "Flat week package (plants only)", "$90–140"),
    ],
  },
  "toy-organizer": {
    tabLabel: TOY_ORGANIZER_PRICING.tabLabel,
    raiseTip: TOY_ORGANIZER_PRICING.raiseTip,
    intro: TOY_ORGANIZER_PRICING.intro,
    items: TOY_ORGANIZER_PRICING.items.map((item) => ({ ...item })),
  },
  "friendship-bracelet-maker": {
    tabLabel: FRIENDSHIP_BRACELET_PRICING.tabLabel,
    raiseTip: FRIENDSHIP_BRACELET_PRICING.raiseTip,
    intro: FRIENDSHIP_BRACELET_PRICING.intro,
    items: FRIENDSHIP_BRACELET_PRICING.items.map((item) => ({ ...item })),
  },
  airbnb: {
    tabLabel: AIRBNB_HOSTING_PRICING.tabLabel,
    raiseTip: AIRBNB_HOSTING_PRICING.raiseTip,
    intro: AIRBNB_HOSTING_PRICING.intro,
    items: AIRBNB_HOSTING_PRICING.items.map((item) => ({ ...item })),
  },
  "digital-cookbook-creator": {
    tabLabel: DIGITAL_COOKBOOK_PRICING.tabLabel,
    raiseTip: DIGITAL_COOKBOOK_PRICING.raiseTip,
    intro: DIGITAL_COOKBOOK_PRICING.intro,
    items: DIGITAL_COOKBOOK_PRICING.items.map((item) => ({ ...item })),
  },
  "family-photo-slideshow": {
    tabLabel: FAMILY_PHOTO_SLIDESHOW_PRICING.tabLabel,
    raiseTip: FAMILY_PHOTO_SLIDESHOW_PRICING.raiseTip,
    intro: FAMILY_PHOTO_SLIDESHOW_PRICING.intro,
    items: FAMILY_PHOTO_SLIDESHOW_PRICING.items.map((item) => ({ ...item })),
  },
  "local-resource-list-creator": {
    tabLabel: LOCAL_RESOURCE_LIST_PRICING.tabLabel,
    raiseTip: LOCAL_RESOURCE_LIST_PRICING.raiseTip,
    intro: LOCAL_RESOURCE_LIST_PRICING.intro,
    items: LOCAL_RESOURCE_LIST_PRICING.items.map((item) => ({ ...item })),
  },
  crafts: {
    raiseTip: RAISE,
    items: [
      p("small", "Small craft piece", "$5–12"),
      p("set", "Set of 3", "$15–30"),
      p("custom", "Custom order", "2–3× materials + time"),
    ],
  },
  "canva-flyer-creator": {
    tabLabel: CANVA_FLYER_PRICING.tabLabel,
    raiseTip: CANVA_FLYER_PRICING.raiseTip,
    intro: CANVA_FLYER_PRICING.intro,
    items: CANVA_FLYER_PRICING.items.map((item) => ({ ...item })),
  },
  "greeting-card-creator": {
    raiseTip: RAISE,
    items: [
      p("hand", "Handmade card", "$3–8"),
      p("canva", "Custom Canva card set", "$5–15"),
    ],
  },
};

export function suggestedPricingForGuide(guideId: string): GuideSuggestedPricing | undefined {
  return GUIDE_SUGGESTED_PRICING[guideId];
}

export function formatPricingLine(item: GuidePricingItem): string {
  const label =
    item.label?.trim() ||
    String((item as { name?: string }).name ?? "").trim();
  const notes = item.notes ? ` — ${item.notes}` : "";
  return `${label}: ${item.price}${notes}`;
}

export function pricingDisclaimer(): string {
  return "Suggested prices are examples only — not income guarantees. Adjust for your city, experience, and materials cost. Confirm what the customer agrees to in writing (text is fine) before you start.";
}
