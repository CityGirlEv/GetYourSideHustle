/**
 * Fallback Supply List + Suggested Pricing when a guide has no authored kit.
 * Uses guide id / name / catalog cues so tabs stay guide-specific.
 */

import { kidsGuideById } from "./kids-guides";
import { hustleById } from "./side-hustle-catalog";
import type { GuideSupplyItem, GuideSupplyList } from "./guide-supplies";
import type { GuidePricingItem, GuideSuggestedPricing } from "./guide-suggested-pricing";
import { FOOD_DELIVERY_PRICING, FOOD_DELIVERY_SUPPLIES } from "./food-delivery-guide";
import { ESTATE_SALE_PRICING, ESTATE_SALE_SUPPLIES } from "./estate-sale-antique-resales-guide";
import { GENEALOGY_PRICING, GENEALOGY_SUPPLIES } from "./genealogy-family-history-guide";
import {
  KIDS_PARTY_GAME_HOST_PRICING,
  KIDS_PARTY_GAME_HOST_SUPPLIES,
} from "./kids-party-game-host-guide";
import {
  LEAD_FOLLOWUP_PRICING,
  LEAD_FOLLOWUP_SUPPLIES,
} from "./lead-followup-assistant-guide";
import {
  APPOINTMENT_SETTER_PRICING,
  APPOINTMENT_SETTER_SUPPLIES,
} from "./appointment-setter-guide";
import {
  ONLINE_RESEARCH_ASSISTANT_PRICING,
  ONLINE_RESEARCH_ASSISTANT_SUPPLIES,
} from "./online-research-assistant-guide";
import {
  MOTHERS_HELPER_PRICING,
  MOTHERS_HELPER_SUPPLIES,
} from "./mothers-helper-guide";
import { CRAFTS_PRICING, CRAFTS_SUPPLIES } from "./crafts-guide";
import {
  LOCAL_CONTENT_PHOTO_PRICING,
  LOCAL_CONTENT_PHOTO_SUPPLIES,
} from "./local-content-photographer-guide";
import {
  PERSONAL_SHOPPER_PRICING,
  PERSONAL_SHOPPER_SUPPLIES,
} from "./personal-shopper-guide";
import {
  YOUTH_SPORTS_HELPER_PRICING,
  YOUTH_SPORTS_HELPER_SUPPLIES,
} from "./youth-sports-helper-guide";
import {
  JUNIOR_GIVE_BACK_TEACH_PRICING,
  JUNIOR_GIVE_BACK_TEACH_SUPPLIES,
} from "./junior-give-back-teach-guide";
import { JUNIOR_SAVINGS_CEO_PRICING, JUNIOR_SAVINGS_CEO_SUPPLIES } from "./junior-savings-ceo-guide";
import {
  KIDS_KINDNESS_SHARE_PRICING,
  KIDS_KINDNESS_SHARE_SUPPLIES,
} from "./kids-kindness-share-guide";
import {
  KIDS_PIGGY_FIRST_GOAL_PRICING,
  KIDS_PIGGY_FIRST_GOAL_SUPPLIES,
} from "./kids-piggy-first-goal-guide";
import { BABYSITTING_PRICING, BABYSITTING_SUPPLIES } from "./babysitting-guide";
import { ERRAND_RUNNER_PRICING, ERRAND_RUNNER_SUPPLIES } from "./errand-runner-guide";
import {
  FB_MARKETPLACE_HELPER_PRICING,
  FB_MARKETPLACE_HELPER_SUPPLIES,
} from "./fb-marketplace-helper-guide";
import { PORCH_PACKAGE_PRICING, PORCH_PACKAGE_SUPPLIES } from "./porch-package-helper-guide";
import { TRAVEL_RESEARCH_PRICING, TRAVEL_RESEARCH_SUPPLIES } from "./travel-research-assistant-guide";
import { TRANSCRIPTION_NOTES_PRICING, TRANSCRIPTION_NOTES_SUPPLIES } from "./transcription-notes-helper-guide";
import { WEBSITE_TESTER_PRICING, WEBSITE_TESTER_SUPPLIES } from "./website-tester-guide";
import { COMMUNITY_NEWSLETTER_PRICING, COMMUNITY_NEWSLETTER_SUPPLIES } from "./community-newsletter-creator-guide";
import { COMMUNITY_TEACHING_PRICING, COMMUNITY_TEACHING_SUPPLIES } from "./community-teaching-workshops-guide";
import { REVIEW_RESPONSE_PRICING, REVIEW_RESPONSE_SUPPLIES } from "./review-response-assistant-guide";
import { CAREER_CONSULTING_PRICING, CAREER_CONSULTING_SUPPLIES } from "./career-industry-consulting-guide";
import { PART_TIME_NOTARY_PRICING, PART_TIME_NOTARY_SUPPLIES } from "./part-time-notary-guide";
import { RESUME_LINKEDIN_PRICING, RESUME_LINKEDIN_SUPPLIES } from "./resume-linkedin-helper-guide";
import { SHORT_FORM_VIDEO_PRICING, SHORT_FORM_VIDEO_SUPPLIES } from "./short-form-video-editor-guide";
import { GBP_HELPER_PRICING, GBP_HELPER_SUPPLIES } from "./google-business-profile-helper-guide";
import { UGC_CREATOR_PRICING, UGC_CREATOR_SUPPLIES } from "./ugc-creator-guide";
import { VIRTUAL_ASSISTANT_PRICING, VIRTUAL_ASSISTANT_SUPPLIES } from "./virtual-assistant-guide";
import { VIRTUAL_RECEPTIONIST_PRICING, VIRTUAL_RECEPTIONIST_SUPPLIES } from "./virtual-receptionist-guide";
import { SOCIAL_INFLUENCER_PRICING, SOCIAL_INFLUENCER_SUPPLIES } from "./social-influencer-guide";
import { COMMUNITY_MODERATOR_PRICING, COMMUNITY_MODERATOR_SUPPLIES } from "./online-community-moderator-guide";
import {
  BASIC_INVITATION_PRICING,
  BASIC_INVITATION_SUPPLIES,
} from "./basic-invitation-creator-guide";
import { POD_PRICING, POD_SUPPLIES } from "./pod-guide";
import { PET_SITTING_PRICING, PET_SITTING_SUPPLIES } from "./pet-sitting-guide";
import { FRIENDSHIP_BRACELET_PRICING, FRIENDSHIP_BRACELET_SUPPLIES } from "./friendship-bracelet-maker-guide";
import { LEAF_RAKING_PRICING, LEAF_RAKING_SUPPLIES } from "./leaf-raking-guide";
import { LEMONADE_STAND_PRICING, LEMONADE_STAND_SUPPLIES } from "./lemonade-stand-guide";
import { AIRBNB_HOSTING_PRICING, AIRBNB_HOSTING_SUPPLIES } from "./airbnb-hosting-guide";
import { DIGITAL_COOKBOOK_PRICING, DIGITAL_COOKBOOK_SUPPLIES } from "./digital-cookbook-creator-guide";
import { FAMILY_PHOTO_SLIDESHOW_PRICING, FAMILY_PHOTO_SLIDESHOW_SUPPLIES } from "./family-photo-slideshow-guide";
import { LOCAL_RESOURCE_LIST_PRICING, LOCAL_RESOURCE_LIST_SUPPLIES } from "./local-resource-list-creator-guide";
import { RECYCLING_HELPER_PRICING, RECYCLING_HELPER_SUPPLIES } from "./recycling-helper-guide";
import { PROOFREADER_PRICING, PROOFREADER_SUPPLIES } from "./proofreader-guide";
import { TOY_ORGANIZER_PRICING, TOY_ORGANIZER_SUPPLIES } from "./toy-organizer-guide";
import { TRASH_CAN_SERVICE_PRICING, TRASH_CAN_SERVICE_SUPPLIES } from "./trash-can-service-guide";
import { HOMEWORK_HELPER_PRICING, HOMEWORK_HELPER_SUPPLIES } from "./homework-helper-guide";
import { CANVA_FLYER_PRICING, CANVA_FLYER_SUPPLIES } from "./canva-flyer-creator-guide";
import { CAR_INTERIOR_PRICING, CAR_INTERIOR_SUPPLIES } from "./car-interior-cleanup-guide";
import { NEIGHBORHOOD_DOG_WALKER_PRICING, NEIGHBORHOOD_DOG_WALKER_SUPPLIES } from "./neighborhood-dog-walker-guide";
import { AI_AGENTS_PRICING, AI_AGENTS_SUPPLIES } from "./ai-agents-guide";
import { AI_PROMO_VIDEO_PRICING, AI_PROMO_VIDEO_SUPPLIES } from "./ai-promo-video-guide";
import { AI_TIMING_PRICING, AI_TIMING_SUPPLIES } from "./ai-timing-guide";
import { TECH_HELPER_PRICING, TECH_HELPER_SUPPLIES } from "./tech-helper-guide";
import { YARD_HELP_PRICING, YARD_HELP_SUPPLIES } from "./yard-help-guide";
import { CLEANING_SERVICE_PRICING, CLEANING_SERVICE_SUPPLIES } from "./cleaning-service-guide";
import {
  HOMEWORK_ORGANIZER_PRICING,
  HOMEWORK_ORGANIZER_SUPPLIES,
} from "./homework-organizer-guide";
import {
  GROUP_SETUP_HELPER_PRICING,
  GROUP_SETUP_HELPER_SUPPLIES,
} from "./group-setup-helper-guide";
import {
  HOUSE_SITTER_PRICING,
  HOUSE_SITTER_SUPPLIES,
} from "./house-sitter-guide";
import {
  BOOKKEEPING_PRICING,
  BOOKKEEPING_SUPPLIES,
} from "./bookkeeping-guide";
import {
  CLOSET_CLEANOUT_LISTING_PRICING,
  CLOSET_CLEANOUT_LISTING_SUPPLIES,
} from "./closet-cleanout-listing-guide";
import {
  NONPROFIT_SOCIAL_HELPER_PRICING,
  NONPROFIT_SOCIAL_HELPER_SUPPLIES,
} from "./nonprofit-social-helper-guide";
import {
  DIGITAL_PRODUCTS_PRICING,
  DIGITAL_PRODUCTS_SUPPLIES,
} from "./digital-products-guide";
import { BOOK_PUBLISHING_PRICING, BOOK_PUBLISHING_SUPPLIES } from "./book-publishing-guide";
import { BOOK_PUBLISHING_KIDS_PRICING, BOOK_PUBLISHING_KIDS_SUPPLIES } from "./book-publishing-kids-guide";
import {
  START_GARDENING_CLUB_PRICING,
  START_GARDENING_CLUB_SUPPLIES,
} from "./start-gardening-club-guide";
import {
  START_BOOK_CLUB_PRICING,
  START_BOOK_CLUB_SUPPLIES,
} from "./start-book-club-guide";
import {
  FORECLOSURE_PROPERTIES_PRICING,
  FORECLOSURE_PROPERTIES_SUPPLIES,
} from "./foreclosure-properties-guide";
import {
  KIDS_GAMES_AI_PRICING,
  KIDS_GAMES_AI_SUPPLIES,
} from "./kids-games-ai-guide";
import { AI_PROMPT_HELPER_PRICING, AI_PROMPT_HELPER_SUPPLIES } from "./ai-prompt-helper-guide";
import { AI_PEERS_PRICING, AI_PEERS_SUPPLIES } from "./ai-peers-guide";
import { JUNIOR_GAMES_AI_PRICING, JUNIOR_GAMES_AI_SUPPLIES } from "./junior-games-ai-guide";
import { ETSY_STORE_PRICING, ETSY_STORE_SUPPLIES } from "./etsy-store-guide";
import { RIDESHARE_PRICING, RIDESHARE_SUPPLIES } from "./rideshare-guide";
import {
  LOCAL_EVENT_CONTENT_PRICING,
  LOCAL_EVENT_CONTENT_SUPPLIES,
} from "./local-event-content-creator-guide";
import { PROPERTY_MGMT_PRICING, PROPERTY_MGMT_SUPPLIES } from "./property-mgmt-guide";
import {
  JUNIOR_REINVEST_CEO_PRICING,
  JUNIOR_REINVEST_CEO_SUPPLIES,
} from "./junior-reinvest-ceo-guide";
import {
  KIDS_REINVEST_JAR_PRICING,
  KIDS_REINVEST_JAR_SUPPLIES,
} from "./kids-reinvest-jar-guide";
import {
  AIRBNB_TURNOVER_CHECKER_PRICING,
  AIRBNB_TURNOVER_CHECKER_SUPPLIES,
} from "./airbnb-turnover-checker-guide";
import { STR_COHOST_PRICING, STR_COHOST_SUPPLIES } from "./str-cohost-guide";

const RAISE =
  "After 3–5 happy customers, raise 10–20% or add a rush fee. Examples only — not income guarantees.";

type PrepKind =
  | "gig-drive"
  | "property"
  | "care-local"
  | "neighbor-local"
  | "clean-local"
  | "digital-desk"
  | "creator-content"
  | "ecommerce"
  | "craft-product"
  | "kids-learning"
  | "club-community";

function s(
  id: string,
  name: string,
  qty: string,
  estCost: string,
  notes?: string,
  optional?: boolean,
): GuideSupplyItem {
  return { id, name, qty, estCost, notes, optional };
}

function p(id: string, label: string, price: string, notes?: string): GuidePricingItem {
  return { id, label, price, notes };
}

function guideLabel(guideId: string): { name: string; hay: string; locationMode?: string; category?: string } {
  const hustle = hustleById(guideId);
  if (hustle) {
    const name = hustle.name;
    return {
      name,
      hay: `${guideId} ${name} ${hustle.category} ${hustle.description}`.toLowerCase(),
      locationMode: hustle.locationMode,
      category: hustle.category,
    };
  }
  const kids = kidsGuideById(guideId);
  if (kids) {
    return {
      name: kids.title,
      hay: `${guideId} ${kids.title} ${kids.summary} ${kids.theme}`.toLowerCase(),
      locationMode: "both",
      category: kids.theme,
    };
  }
  return { name: guideId.replace(/-/g, " "), hay: guideId.toLowerCase() };
}

function classify(meta: ReturnType<typeof guideLabel>): PrepKind {
  const { hay, locationMode } = meta;
  // AI / tech guides first — descriptions often mention rideshare/delivery as *customers*, not the job.
  if (/\bai[- ]|\bai\b|prompt|chatgpt|llm|agent workflow/.test(hay)) return "digital-desk";
  if (/rideshare|food-delivery|uber|lyft|door.?dash|delivery driver/.test(hay)) return "gig-drive";
  if (
    /airbnb|str-cohost|property-mgmt|turnover|house-sit|foreclosure|flipping|lien-tax|short.?term/.test(
      hay,
    )
  ) {
    return "property";
  }
  if (/clean|mailbox|trash|recycling|leaf|yard|porch/.test(hay) && /local|service|helper|cleaning/.test(hay)) {
    if (/clean|mailbox/.test(hay)) return "clean-local";
  }
  if (/babysit|mother.?s.?helper|party-game|birthday-party|youth-sports|pet-sit|dog-walk/.test(hay)) {
    return "care-local";
  }
  if (/book.?club|gardening.?club|community|newsletter|nonprofit|moderator|group-setup/.test(hay)) {
    return "club-community";
  }
  if (
    /etsy|amazon|dropship|pod|print.?on.?demand|affiliate|digital-products|digital-product/.test(hay)
  ) {
    return "ecommerce";
  }
  if (
    /ugc|social|video|photo|content|slideshow|creator|promo-video|short-form|local-content|local-event/.test(
      hay,
    )
  ) {
    return "creator-content";
  }
  if (
    /craft|bookmark|bracelet|jewelry|lemonade|games-ai|create-games|kids-craft|greeting|invitation|canva/.test(
      hay,
    )
  ) {
    return "craft-product";
  }
  if (/kids-|junior-|piggy|kindness|reinvest|savings|give-back|ceo/.test(hay)) return "kids-learning";
  if (
    /digital|virtual|online|transcription|website|research|bookkeeping|consult|review-response|google-business|resume|notary|organizer|appointment|lead-follow|travel-research|family-history|teaching|tutor|homework|proofread|book-publish|web-leads|timing|agents|assets|peers|formatter|tester/.test(
      hay,
    ) ||
    locationMode === "online"
  ) {
    return "digital-desk";
  }
  if (locationMode === "local") return "neighbor-local";
  return "digital-desk";
}

/** Curated overrides when archetype defaults are too generic. */
const SUPPLY_OVERRIDES: Record<string, GuideSupplyList> = {
  "cleaning-service": {
    starterKitTotal: CLEANING_SERVICE_SUPPLIES.starterKitTotal,
    items: CLEANING_SERVICE_SUPPLIES.items.map((item) => ({ ...item })),
  },
  rideshare: {
    starterKitTotal: RIDESHARE_SUPPLIES.starterKitTotal,
    items: RIDESHARE_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "food-delivery": {
    starterKitTotal: FOOD_DELIVERY_SUPPLIES.starterKitTotal,
    items: FOOD_DELIVERY_SUPPLIES.items.map((item) => ({ ...item })),
  },
  babysitting: {
    starterKitTotal: BABYSITTING_SUPPLIES.starterKitTotal,
    items: BABYSITTING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "errand-runner": {
    starterKitTotal: ERRAND_RUNNER_SUPPLIES.starterKitTotal,
    items: ERRAND_RUNNER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "mailbox-cleaning": {
    starterKitTotal: "About $8–20 for gloves and cleaner",
    items: [
      s("gloves", "Work gloves", "1 pair", "$5–12"),
      s("wipe", "Outdoor-safe wipes or mild cleaner", "1", "$3–8"),
      s("brush", "Small scrub brush", "1", "$3–6", undefined, true),
    ],
  },
  airbnb: {
    starterKitTotal: AIRBNB_HOSTING_SUPPLIES.starterKitTotal,
    items: AIRBNB_HOSTING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "property-mgmt": {
    starterKitTotal: PROPERTY_MGMT_SUPPLIES.starterKitTotal,
    items: PROPERTY_MGMT_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "book-publishing": {
    starterKitTotal: BOOK_PUBLISHING_SUPPLIES.starterKitTotal,
    items: BOOK_PUBLISHING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "book-publishing-kids": {
    starterKitTotal: BOOK_PUBLISHING_KIDS_SUPPLIES.starterKitTotal,
    items: BOOK_PUBLISHING_KIDS_SUPPLIES.items.map((item) => ({ ...item })),
  },
  bookkeeping: {
    starterKitTotal: BOOKKEEPING_SUPPLIES.starterKitTotal,
    items: BOOKKEEPING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "etsy-store": {
    starterKitTotal: ETSY_STORE_SUPPLIES.starterKitTotal,
    items: ETSY_STORE_SUPPLIES.items.map((item) => ({ ...item })),
  },
  amazon: {
    starterKitTotal: "About $25–80 for samples, labels, and photo props (inventory is separate)",
    items: [
      s("sample", "Product sample for photos / QC", "1–3", "$10–40"),
      s("labels", "FNSKU / barcode label sheet", "1 pack", "$8–15"),
      s("backdrop", "White photo backdrop", "1", "$8–20"),
      s("tape", "Packing tape for prep", "1", "$3–7", undefined, true),
    ],
  },
  dropshipping: {
    starterKitTotal: "About $10–40 for branding samples (no warehouse stock)",
    items: [
      s("mock", "Printed packaging mockups / inserts", "1 set", "$8–20"),
      s("sample", "1 supplier sample order", "1", "$10–30", undefined, true),
      s("notebook", "Supplier / SKU tracker notebook", "1", "$3–8"),
    ],
  },
  pod: {
    starterKitTotal: POD_SUPPLIES.starterKitTotal,
    items: POD_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "digital-products": {
    starterKitTotal: DIGITAL_PRODUCTS_SUPPLIES.starterKitTotal,
    items: DIGITAL_PRODUCTS_SUPPLIES.items.map((item) => ({ ...item })),
  },
  affiliate: {
    starterKitTotal: "About $0–15 — mostly tracking printables",
    items: [
      s("sheet", "Printed link / promo tracker", "1", "$2–6"),
      s("cards", "Business cards with your link/QR", "1 pack", "$8–15", undefined, true),
    ],
  },
  notary: {
    starterKitTotal: PART_TIME_NOTARY_SUPPLIES.starterKitTotal,
    items: PART_TIME_NOTARY_SUPPLIES.items.map((item) => ({ ...item })),
  },
  consulting: {
    starterKitTotal: CAREER_CONSULTING_SUPPLIES.starterKitTotal,
    items: CAREER_CONSULTING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  teaching: {
    starterKitTotal: COMMUNITY_TEACHING_SUPPLIES.starterKitTotal,
    items: COMMUNITY_TEACHING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "virtual-assistant": {
    starterKitTotal: VIRTUAL_ASSISTANT_SUPPLIES.starterKitTotal,
    items: VIRTUAL_ASSISTANT_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "virtual-receptionist": {
    starterKitTotal: VIRTUAL_RECEPTIONIST_SUPPLIES.starterKitTotal,
    items: VIRTUAL_RECEPTIONIST_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "resume-linkedin-helper": {
    starterKitTotal: RESUME_LINKEDIN_SUPPLIES.starterKitTotal,
    items: RESUME_LINKEDIN_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "google-business-helper": {
    starterKitTotal: GBP_HELPER_SUPPLIES.starterKitTotal,
    items: GBP_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "review-response-assistant": {
    starterKitTotal: REVIEW_RESPONSE_SUPPLIES.starterKitTotal,
    items: REVIEW_RESPONSE_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "community-newsletter-creator": {
    starterKitTotal: COMMUNITY_NEWSLETTER_SUPPLIES.starterKitTotal,
    items: COMMUNITY_NEWSLETTER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "nonprofit-social-helper": {
    starterKitTotal: NONPROFIT_SOCIAL_HELPER_SUPPLIES.starterKitTotal,
    items: NONPROFIT_SOCIAL_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "short-form-video-editor": {
    starterKitTotal: SHORT_FORM_VIDEO_SUPPLIES.starterKitTotal,
    items: SHORT_FORM_VIDEO_SUPPLIES.items.map((item) => ({ ...item })),
  },
  social: {
    starterKitTotal: SOCIAL_INFLUENCER_SUPPLIES.starterKitTotal,
    items: SOCIAL_INFLUENCER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "ugc-creator": {
    starterKitTotal: UGC_CREATOR_SUPPLIES.starterKitTotal,
    items: UGC_CREATOR_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "web-leads": {
    starterKitTotal: "About $10–30 for pitch leave-behinds",
    items: [
      s("onepager", "Printed website audit one-pager", "1 set", "$5–15"),
      s("cards", "Business cards", "1 pack", "$8–15"),
    ],
  },
  "str-cohost": {
    starterKitTotal: STR_COHOST_SUPPLIES.starterKitTotal,
    items: STR_COHOST_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "airbnb-cohost": {
    starterKitTotal: "About $20–50 for co-host turnover tote",
    items: [
      s("tote", "Turnover restock tote", "1", "$10–20"),
      s("checklist", "Guest-ready checklist", "1", "$3–8"),
      s("lockbox", "Spare lockbox batteries", "1 pack", "$5–12", undefined, true),
    ],
  },
  "airbnb-turnover-checker": {
    starterKitTotal: AIRBNB_TURNOVER_CHECKER_SUPPLIES.starterKitTotal,
    items: AIRBNB_TURNOVER_CHECKER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "house-sitter": {
    starterKitTotal: HOUSE_SITTER_SUPPLIES.starterKitTotal,
    items: HOUSE_SITTER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "porch-package-helper": {
    starterKitTotal: PORCH_PACKAGE_SUPPLIES.starterKitTotal,
    items: PORCH_PACKAGE_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "closet-organizer": {
    starterKitTotal: "About $15–40 for sorting supplies",
    items: [
      s("bags", "Donate / trash / keep bags", "1 pack", "$5–12"),
      s("labels", "Closet labels or sticky notes", "1 pack", "$3–8"),
      s("hangers", "Extra slim hangers", "1 pack", "$8–18", undefined, true),
    ],
  },
  "personal-shopper": {
    starterKitTotal: PERSONAL_SHOPPER_SUPPLIES.starterKitTotal,
    items: PERSONAL_SHOPPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "estate-sale-listing-helper": {
    starterKitTotal: ESTATE_SALE_SUPPLIES.starterKitTotal,
    items: ESTATE_SALE_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "birthday-party-helper": {
    starterKitTotal: "About $10–35 for party-assist extras",
    items: [
      s("games", "Backup party games / crafts", "1 kit", "$8–20"),
      s("bags", "Trash bags", "1 box", "$4–8"),
      s("tape", "Painter’s tape / balloon tape", "1", "$3–8", undefined, true),
    ],
  },
  "kids-party-game-host": {
    starterKitTotal: KIDS_PARTY_GAME_HOST_SUPPLIES.starterKitTotal,
    items: KIDS_PARTY_GAME_HOST_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "youth-sports-helper": {
    starterKitTotal: YOUTH_SPORTS_HELPER_SUPPLIES.starterKitTotal,
    items: YOUTH_SPORTS_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "custom-bookmark-creator": {
    starterKitTotal: "About $10–30 for first batch materials",
    items: [
      s("cardstock", "Cardstock / bookmark blanks", "1 pack", "$5–12"),
      s("ribbon", "Ribbon or tassel cord", "1 pack", "$3–8"),
      s("laminate", "Laminating sheets (optional)", "1 pack", "$6–15", undefined, true),
    ],
  },
  "mothers-helper": {
    starterKitTotal: MOTHERS_HELPER_SUPPLIES.starterKitTotal,
    items: MOTHERS_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  crafts: {
    starterKitTotal: CRAFTS_SUPPLIES.starterKitTotal,
    items: CRAFTS_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "homework-organizer": {
    starterKitTotal: HOMEWORK_ORGANIZER_SUPPLIES.starterKitTotal,
    items: HOMEWORK_ORGANIZER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "tech-helper": {
    starterKitTotal: TECH_HELPER_SUPPLIES.starterKitTotal,
    items: TECH_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "yard-help": {
    starterKitTotal: YARD_HELP_SUPPLIES.starterKitTotal,
    items: YARD_HELP_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "start-gardening-club": {
    starterKitTotal: START_GARDENING_CLUB_SUPPLIES.starterKitTotal,
    items: START_GARDENING_CLUB_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "start-book-club": {
    starterKitTotal: START_BOOK_CLUB_SUPPLIES.starterKitTotal,
    items: START_BOOK_CLUB_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "local-resource-list-creator": {
    starterKitTotal: LOCAL_RESOURCE_LIST_SUPPLIES.starterKitTotal,
    items: LOCAL_RESOURCE_LIST_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "closet-cleanout-listing": {
    starterKitTotal: CLOSET_CLEANOUT_LISTING_SUPPLIES.starterKitTotal,
    items: CLOSET_CLEANOUT_LISTING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "create-games-kids": {
    starterKitTotal: "About $5–20 for paper prototypes (parent helps)",
    items: [
      s("paper", "Paper + markers for game boards", "1 set", "$4–10"),
      s("dice", "Dice / tokens", "1 set", "$3–8"),
      s("sleeve", "Sheet protectors for boards", "1 pack", "$3–8", undefined, true),
    ],
  },
  "create-games-junior": {
    starterKitTotal: "About $5–25 for prototypes and playtest notes",
    items: [
      s("paper", "Prototype paper / cardstock", "1 pack", "$5–12"),
      s("notebook", "Playtest notes notebook", "1", "$3–8"),
      s("usb", "USB for build backup", "1", "$6–12", undefined, true),
    ],
  },
  "kids-craft-hustle": {
    starterKitTotal: "About $10–30 for first craft batch (parent helps)",
    items: [
      s("craft", "Craft materials for first batch", "1 kit", "$8–20"),
      s("bags", "Sales bags / tags", "1 pack", "$3–8"),
    ],
  },
  "flipping-properties": {
    starterKitTotal: "About $15–40 for walkthrough documentation",
    items: [
      s("checklist", "Property walkthrough checklist", "1", "$3–8"),
      s("tape", "Measuring tape", "1", "$8–15"),
      s("flashlight", "Flashlight", "1", "$5–12"),
      s("notebook", "Rehab estimate notepad", "1", "$3–8"),
    ],
  },
  "foreclosure-properties": {
    starterKitTotal: FORECLOSURE_PROPERTIES_SUPPLIES.starterKitTotal,
    items: FORECLOSURE_PROPERTIES_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "lien-tax-sales": {
    starterKitTotal: "About $10–25 for research binders",
    items: [
      s("binder", "Tax-sale research binder", "1", "$5–12"),
      s("checklist", "Lien checklist printouts", "1 set", "$3–8"),
      s("highlighter", "Highlighters", "1 pack", "$2–5"),
    ],
  },
  "ai-agents": {
    starterKitTotal: AI_AGENTS_SUPPLIES.starterKitTotal,
    items: AI_AGENTS_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "ai-assets": {
    starterKitTotal: "About $15–45 for brand proofs and delivery media",
    items: [
      s("prints", "Color print proofs of sample assets", "5–10", "$5–15"),
      s("usb", "Client delivery USB / SD card", "1", "$8–20"),
      s("mood", "Printed mood-board / brand sheet", "1", "$3–8"),
      s("sleeve", "Protective sleeve for proofs", "1 pack", "$3–8", undefined, true),
    ],
  },
  "ai-timing": {
    starterKitTotal: AI_TIMING_SUPPLIES.starterKitTotal,
    items: AI_TIMING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "ai-social-helper": {
    starterKitTotal: "About $10–30 for content calendars and caption proofs",
    items: [
      s("calendar", "Printed 30-day content calendar template", "1", "$3–8"),
      s("captions", "Caption / hashtag cheat-sheet printouts", "1 set", "$3–8"),
      s("folder", "Client brand voice folder", "1", "$2–5"),
      s("usb", "Asset handoff USB (optional)", "1", "$8–15", undefined, true),
    ],
  },
  "ai-promo-video": {
    starterKitTotal: AI_PROMO_VIDEO_SUPPLIES.starterKitTotal,
    items: AI_PROMO_VIDEO_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "ai-prompt-helper": {
    starterKitTotal: AI_PROMPT_HELPER_SUPPLIES.starterKitTotal,
    items: AI_PROMPT_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "ai-peers": {
    starterKitTotal: AI_PEERS_SUPPLIES.starterKitTotal,
    items: AI_PEERS_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "local-business-ai-setup": {
    starterKitTotal: "About $10–35 for on-site setup leave-behinds",
    items: [
      s("checklist", "Printed AI setup checklist for the shop", "1 set", "$3–8"),
      s("laminate", "Laminated how-to card for staff", "1–2", "$4–10"),
      s("folder", "Login / SOP folder (owner keeps passwords)", "1", "$2–5"),
      s("cable", "Spare USB-C / charging cable for demos", "1", "$8–15", undefined, true),
    ],
  },
  "virtual-call-assistant": {
    starterKitTotal: "About $5–25 for call scripts and intake sheets",
    items: [
      s("script", "Printed call scripts + objection sheet", "1 set", "$3–8"),
      s("intake", "Client intake / FAQ forms", "1 pad", "$3–8"),
      s("headset", "Headset (if not already owned)", "1", "$20–50", "Often already owned — Tools", true),
      s("notebook", "Call log notebook", "1", "$3–8"),
    ],
  },
  "online-research-assistant": {
    starterKitTotal: ONLINE_RESEARCH_ASSISTANT_SUPPLIES.starterKitTotal,
    items: ONLINE_RESEARCH_ASSISTANT_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "family-history-organizer": {
    starterKitTotal: GENEALOGY_SUPPLIES.starterKitTotal,
    items: GENEALOGY_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "travel-research-assistant": {
    starterKitTotal: TRAVEL_RESEARCH_SUPPLIES.starterKitTotal,
    items: TRAVEL_RESEARCH_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "website-tester": {
    starterKitTotal: WEBSITE_TESTER_SUPPLIES.starterKitTotal,
    items: WEBSITE_TESTER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "appointment-setter": {
    starterKitTotal: APPOINTMENT_SETTER_SUPPLIES.starterKitTotal,
    items: APPOINTMENT_SETTER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "lead-followup-assistant": {
    starterKitTotal: LEAD_FOLLOWUP_SUPPLIES.starterKitTotal,
    items: LEAD_FOLLOWUP_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "fb-marketplace-helper": {
    starterKitTotal: FB_MARKETPLACE_HELPER_SUPPLIES.starterKitTotal,
    items: FB_MARKETPLACE_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "basic-invitation-creator": {
    starterKitTotal: BASIC_INVITATION_SUPPLIES.starterKitTotal,
    items: BASIC_INVITATION_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "pet-sitting": {
    starterKitTotal: PET_SITTING_SUPPLIES.starterKitTotal,
    items: PET_SITTING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "friendship-bracelet-maker": {
    starterKitTotal: FRIENDSHIP_BRACELET_SUPPLIES.starterKitTotal,
    items: FRIENDSHIP_BRACELET_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "leaf-raking": {
    starterKitTotal: LEAF_RAKING_SUPPLIES.starterKitTotal,
    items: LEAF_RAKING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "lemonade-stand": {
    starterKitTotal: LEMONADE_STAND_SUPPLIES.starterKitTotal,
    items: LEMONADE_STAND_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "digital-cookbook-creator": {
    starterKitTotal: DIGITAL_COOKBOOK_SUPPLIES.starterKitTotal,
    items: DIGITAL_COOKBOOK_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "family-photo-slideshow": {
    starterKitTotal: FAMILY_PHOTO_SLIDESHOW_SUPPLIES.starterKitTotal,
    items: FAMILY_PHOTO_SLIDESHOW_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "recycling-helper": {
    starterKitTotal: RECYCLING_HELPER_SUPPLIES.starterKitTotal,
    items: RECYCLING_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  proofreader: {
    starterKitTotal: PROOFREADER_SUPPLIES.starterKitTotal,
    items: PROOFREADER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "toy-organizer": {
    starterKitTotal: TOY_ORGANIZER_SUPPLIES.starterKitTotal,
    items: TOY_ORGANIZER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "trash-can-service": {
    starterKitTotal: TRASH_CAN_SERVICE_SUPPLIES.starterKitTotal,
    items: TRASH_CAN_SERVICE_SUPPLIES.items.map((item) => ({ ...item })),
  },
  homework: {
    starterKitTotal: HOMEWORK_HELPER_SUPPLIES.starterKitTotal,
    items: HOMEWORK_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "canva-flyer-creator": {
    starterKitTotal: CANVA_FLYER_SUPPLIES.starterKitTotal,
    items: CANVA_FLYER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "car-interior-cleanup": {
    starterKitTotal: CAR_INTERIOR_SUPPLIES.starterKitTotal,
    items: CAR_INTERIOR_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "dog-walk": {
    starterKitTotal: NEIGHBORHOOD_DOG_WALKER_SUPPLIES.starterKitTotal,
    items: NEIGHBORHOOD_DOG_WALKER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "digital-organizer": {
    starterKitTotal: "About $10–30 for file-taxonomy printables",
    items: [
      s("map", "Printed folder taxonomy / map", "1 set", "$3–8"),
      s("checklist", "Declutter-by-folder checklist", "1 set", "$3–8"),
      s("usb", "Backup USB before reorganize", "1", "$8–15"),
      s("labels", "Drive / binder labels", "1 pack", "$3–8", undefined, true),
    ],
  },
  "transcription-notes-helper": {
    starterKitTotal: TRANSCRIPTION_NOTES_SUPPLIES.starterKitTotal,
    items: TRANSCRIPTION_NOTES_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "digital-photo-organizer": {
    starterKitTotal: "About $15–45 for photo archive handoff",
    items: [
      s("hdd", "External drive for client archive (optional)", "1", "$40–80", "Or use client’s drive", true),
      s("usb", "USB stick for sample album", "1", "$8–15"),
      s("labels", "Year / event album labels", "1 pack", "$4–10"),
      s("sheet", "Printed naming convention sheet", "1", "$2–5"),
    ],
  },
  "local-content-photographer": {
    starterKitTotal: LOCAL_CONTENT_PHOTO_SUPPLIES.starterKitTotal,
    items: LOCAL_CONTENT_PHOTO_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "local-event-content-creator": {
    starterKitTotal: LOCAL_EVENT_CONTENT_SUPPLIES.starterKitTotal,
    items: LOCAL_EVENT_CONTENT_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "online-community-moderator": {
    starterKitTotal: COMMUNITY_MODERATOR_SUPPLIES.starterKitTotal,
    items: COMMUNITY_MODERATOR_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "group-setup-helper": {
    starterKitTotal: GROUP_SETUP_HELPER_SUPPLIES.starterKitTotal,
    items: GROUP_SETUP_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "digital-product-formatter": {
    starterKitTotal: "About $10–35 for format proofs (files live in Tools)",
    items: [
      s("proof", "Printed page proofs for layout check", "5–10 pages", "$3–10"),
      s("swatch", "Color / font swatch print", "1", "$2–5"),
      s("usb", "Formatted-file delivery USB", "1", "$8–15", undefined, true),
      s("checklist", "Ebook / workbook format checklist", "1", "$2–5"),
    ],
  },
  "junior-savings-ceo": {
    starterKitTotal: JUNIOR_SAVINGS_CEO_SUPPLIES.starterKitTotal,
    items: JUNIOR_SAVINGS_CEO_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "junior-give-back-teach": {
    starterKitTotal: JUNIOR_GIVE_BACK_TEACH_SUPPLIES.starterKitTotal,
    items: JUNIOR_GIVE_BACK_TEACH_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "junior-games-ai": {
    starterKitTotal: JUNIOR_GAMES_AI_SUPPLIES.starterKitTotal,
    items: JUNIOR_GAMES_AI_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "junior-reinvest-ceo": {
    starterKitTotal: JUNIOR_REINVEST_CEO_SUPPLIES.starterKitTotal,
    items: JUNIOR_REINVEST_CEO_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "junior-content-create": {
    starterKitTotal: "About $10–35 for parent-friendly content kit",
    items: [
      s("tripod", "Mini phone tripod", "1", "$12–25"),
      s("backdrop", "Simple backdrop / poster board", "1", "$5–12"),
      s("calendar", "Printed posting calendar (parent co-signs)", "1", "$2–5"),
    ],
  },
  "kids-piggy-first-goal": {
    starterKitTotal: KIDS_PIGGY_FIRST_GOAL_SUPPLIES.starterKitTotal,
    items: KIDS_PIGGY_FIRST_GOAL_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "kids-kindness-share": {
    starterKitTotal: KIDS_KINDNESS_SHARE_SUPPLIES.starterKitTotal,
    items: KIDS_KINDNESS_SHARE_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "kids-games-ai": {
    starterKitTotal: KIDS_GAMES_AI_SUPPLIES.starterKitTotal,
    items: KIDS_GAMES_AI_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "kids-reinvest-jar": {
    starterKitTotal: KIDS_REINVEST_JAR_SUPPLIES.starterKitTotal,
    items: KIDS_REINVEST_JAR_SUPPLIES.items.map((item) => ({ ...item })),
  },
};

const PRICING_OVERRIDES: Record<string, GuideSuggestedPricing> = {
  "cleaning-service": {
    ...CLEANING_SERVICE_PRICING,
    items: CLEANING_SERVICE_PRICING.items.map((item) => ({ ...item })),
  },
  rideshare: {
    ...RIDESHARE_PRICING,
    items: RIDESHARE_PRICING.items.map((item) => ({ ...item })),
  },
  "food-delivery": {
    ...FOOD_DELIVERY_PRICING,
    items: FOOD_DELIVERY_PRICING.items.map((item) => ({ ...item })),
  },
  airbnb: {
    tabLabel: AIRBNB_HOSTING_PRICING.tabLabel,
    raiseTip: AIRBNB_HOSTING_PRICING.raiseTip,
    intro: AIRBNB_HOSTING_PRICING.intro,
    items: AIRBNB_HOSTING_PRICING.items.map((item) => ({ ...item })),
  },
  babysitting: {
    ...BABYSITTING_PRICING,
    items: BABYSITTING_PRICING.items.map((item) => ({ ...item })),
  },
  "errand-runner": {
    ...ERRAND_RUNNER_PRICING,
    items: ERRAND_RUNNER_PRICING.items.map((item) => ({ ...item })),
  },
  "virtual-assistant": {
    tabLabel: VIRTUAL_ASSISTANT_PRICING.tabLabel,
    raiseTip: VIRTUAL_ASSISTANT_PRICING.raiseTip,
    intro: VIRTUAL_ASSISTANT_PRICING.intro,
    items: VIRTUAL_ASSISTANT_PRICING.items.map((item) => ({ ...item })),
  },
  bookkeeping: {
    ...BOOKKEEPING_PRICING,
    items: BOOKKEEPING_PRICING.items.map((item) => ({ ...item })),
  },
  notary: {
    tabLabel: PART_TIME_NOTARY_PRICING.tabLabel,
    raiseTip: PART_TIME_NOTARY_PRICING.raiseTip,
    intro: PART_TIME_NOTARY_PRICING.intro,
    items: PART_TIME_NOTARY_PRICING.items.map((item) => ({ ...item })),
  },
  teaching: {
    tabLabel: COMMUNITY_TEACHING_PRICING.tabLabel,
    raiseTip: COMMUNITY_TEACHING_PRICING.raiseTip,
    intro: COMMUNITY_TEACHING_PRICING.intro,
    items: COMMUNITY_TEACHING_PRICING.items.map((item) => ({ ...item })),
  },
  consulting: {
    tabLabel: CAREER_CONSULTING_PRICING.tabLabel,
    raiseTip: CAREER_CONSULTING_PRICING.raiseTip,
    intro: CAREER_CONSULTING_PRICING.intro,
    items: CAREER_CONSULTING_PRICING.items.map((item) => ({ ...item })),
  },
  "book-publishing": {
    ...BOOK_PUBLISHING_PRICING,
    items: BOOK_PUBLISHING_PRICING.items.map((item) => ({ ...item })),
  },
  "book-publishing-kids": {
    ...BOOK_PUBLISHING_KIDS_PRICING,
    items: BOOK_PUBLISHING_KIDS_PRICING.items.map((item) => ({ ...item })),
  },
  "etsy-store": {
    ...ETSY_STORE_PRICING,
    items: ETSY_STORE_PRICING.items.map((item) => ({ ...item })),
  },
  amazon: {
    raiseTip: RAISE,
    items: [
      p("unit", "Unit retail (after fees/COGS)", "Aim 25–40% contribution margin"),
      p("promo", "Launch coupon", "10–20% off first 2 weeks"),
      p("bundle", "Multi-pack", "Higher AOV; watch FBA fees"),
    ],
  },
  dropshipping: {
    raiseTip: RAISE,
    items: [
      p("markup", "Product markup over supplier", "2–3× landed cost to start"),
      p("bundle", "Upsell bundle", "+15–30% vs single"),
      p("ship", "Shown shipping", "At least cover supplier ship + buffer"),
    ],
  },
  pod: {
    tabLabel: POD_PRICING.tabLabel,
    raiseTip: POD_PRICING.raiseTip,
    intro: POD_PRICING.intro,
    items: POD_PRICING.items.map((item) => ({ ...item })),
  },
  "digital-products": {
    ...DIGITAL_PRODUCTS_PRICING,
    items: DIGITAL_PRODUCTS_PRICING.items.map((item) => ({ ...item })),
  },
  affiliate: {
    raiseTip: "Promote products you trust; disclose affiliates. Examples only — not income guarantees.",
    items: [
      p("post", "Sponsored / affiliate post goal", "Commission + tip: track EPC"),
      p("bundle", "Resource list / roundup PDF", "$0 free lead magnet or $5–15"),
      p("rate", "Brand flat fee (if offered)", "$50–500+ by audience size"),
    ],
  },
  "property-mgmt": {
    ...PROPERTY_MGMT_PRICING,
    items: PROPERTY_MGMT_PRICING.items.map((item) => ({ ...item })),
  },
  "virtual-receptionist": {
    tabLabel: VIRTUAL_RECEPTIONIST_PRICING.tabLabel,
    raiseTip: VIRTUAL_RECEPTIONIST_PRICING.raiseTip,
    intro: VIRTUAL_RECEPTIONIST_PRICING.intro,
    items: VIRTUAL_RECEPTIONIST_PRICING.items.map((item) => ({ ...item })),
  },
  "resume-linkedin-helper": {
    tabLabel: RESUME_LINKEDIN_PRICING.tabLabel,
    raiseTip: RESUME_LINKEDIN_PRICING.raiseTip,
    intro: RESUME_LINKEDIN_PRICING.intro,
    items: RESUME_LINKEDIN_PRICING.items.map((item) => ({ ...item })),
  },
  "google-business-helper": {
    tabLabel: GBP_HELPER_PRICING.tabLabel,
    raiseTip: GBP_HELPER_PRICING.raiseTip,
    intro: GBP_HELPER_PRICING.intro,
    items: GBP_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  "review-response-assistant": {
    tabLabel: REVIEW_RESPONSE_PRICING.tabLabel,
    raiseTip: REVIEW_RESPONSE_PRICING.raiseTip,
    intro: REVIEW_RESPONSE_PRICING.intro,
    items: REVIEW_RESPONSE_PRICING.items.map((item) => ({ ...item })),
  },
  "community-newsletter-creator": {
    tabLabel: COMMUNITY_NEWSLETTER_PRICING.tabLabel,
    raiseTip: COMMUNITY_NEWSLETTER_PRICING.raiseTip,
    intro: COMMUNITY_NEWSLETTER_PRICING.intro,
    items: COMMUNITY_NEWSLETTER_PRICING.items.map((item) => ({ ...item })),
  },
  "nonprofit-social-helper": {
    ...NONPROFIT_SOCIAL_HELPER_PRICING,
    items: NONPROFIT_SOCIAL_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  social: {
    tabLabel: SOCIAL_INFLUENCER_PRICING.tabLabel,
    raiseTip: SOCIAL_INFLUENCER_PRICING.raiseTip,
    intro: SOCIAL_INFLUENCER_PRICING.intro,
    items: SOCIAL_INFLUENCER_PRICING.items.map((item) => ({ ...item })),
  },
  "ugc-creator": {
    tabLabel: UGC_CREATOR_PRICING.tabLabel,
    raiseTip: UGC_CREATOR_PRICING.raiseTip,
    intro: UGC_CREATOR_PRICING.intro,
    items: UGC_CREATOR_PRICING.items.map((item) => ({ ...item })),
  },
  "short-form-video-editor": {
    tabLabel: SHORT_FORM_VIDEO_PRICING.tabLabel,
    raiseTip: SHORT_FORM_VIDEO_PRICING.raiseTip,
    intro: SHORT_FORM_VIDEO_PRICING.intro,
    items: SHORT_FORM_VIDEO_PRICING.items.map((item) => ({ ...item })),
  },
  "web-leads": {
    raiseTip: RAISE,
    items: [
      p("audit", "Local site audit + pitch", "$50–150"),
      p("site", "Simple brochure site", "$400–1,500"),
      p("month", "Hosting / lead form care", "$25–75 / mo"),
    ],
  },
  "str-cohost": {
    ...STR_COHOST_PRICING,
    items: STR_COHOST_PRICING.items.map((item) => ({ ...item })),
  },
  "airbnb-cohost": {
    raiseTip: RAISE,
    items: [
      p("pct", "Co-host share", "15–25% of booking"),
      p("turn", "Turnover coordination", "$50–120"),
      p("guest", "Guest messaging only", "$100–250 / mo"),
    ],
  },
  "airbnb-turnover-checker": {
    ...AIRBNB_TURNOVER_CHECKER_PRICING,
    items: AIRBNB_TURNOVER_CHECKER_PRICING.items.map((item) => ({ ...item })),
  },
  "house-sitter": {
    ...HOUSE_SITTER_PRICING,
    items: HOUSE_SITTER_PRICING.items.map((item) => ({ ...item })),
  },
  "porch-package-helper": {
    tabLabel: PORCH_PACKAGE_PRICING.tabLabel,
    raiseTip: PORCH_PACKAGE_PRICING.raiseTip,
    intro: PORCH_PACKAGE_PRICING.intro,
    items: PORCH_PACKAGE_PRICING.items.map((item) => ({ ...item })),
  },
  "closet-organizer": {
    raiseTip: RAISE,
    items: [
      p("closet", "One closet session", "$60–120"),
      p("hour", "Hourly organizing", "$25–45 / hr"),
      p("room", "Full bedroom / closet system", "$150–350"),
    ],
  },
  "personal-shopper": {
    ...PERSONAL_SHOPPER_PRICING,
    items: PERSONAL_SHOPPER_PRICING.items.map((item) => ({ ...item })),
  },
  "estate-sale-listing-helper": {
    ...ESTATE_SALE_PRICING,
    items: ESTATE_SALE_PRICING.items.map((item) => ({ ...item })),
  },
  "birthday-party-helper": {
    raiseTip: RAISE,
    items: [
      p("party", "Party helper (2 hrs)", "$40–80"),
      p("hour", "Extra hour", "+$15–25"),
      p("setup", "Setup-only block", "$30–60"),
    ],
  },
  "kids-party-game-host": {
    ...KIDS_PARTY_GAME_HOST_PRICING,
    items: KIDS_PARTY_GAME_HOST_PRICING.items.map((item) => ({ ...item })),
  },
  "youth-sports-helper": {
    ...YOUTH_SPORTS_HELPER_PRICING,
    items: YOUTH_SPORTS_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  "custom-bookmark-creator": {
    raiseTip: RAISE,
    items: [
      p("one", "Single bookmark", "$3–6"),
      p("set", "Set of 5", "$12–22"),
      p("custom", "Name / quote custom", "+$1–3"),
    ],
  },
  "mothers-helper": {
    ...MOTHERS_HELPER_PRICING,
    items: MOTHERS_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  crafts: {
    ...CRAFTS_PRICING,
    items: CRAFTS_PRICING.items.map((item) => ({ ...item })),
  },
  "homework-organizer": {
    ...HOMEWORK_ORGANIZER_PRICING,
    items: HOMEWORK_ORGANIZER_PRICING.items.map((item) => ({ ...item })),
  },
  "tech-helper": {
    ...TECH_HELPER_PRICING,
    items: TECH_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  "yard-help": {
    ...YARD_HELP_PRICING,
    items: YARD_HELP_PRICING.items.map((item) => ({ ...item })),
  },
  "start-gardening-club": {
    ...START_GARDENING_CLUB_PRICING,
    items: START_GARDENING_CLUB_PRICING.items.map((item) => ({ ...item })),
  },
  "start-book-club": {
    ...START_BOOK_CLUB_PRICING,
    items: START_BOOK_CLUB_PRICING.items.map((item) => ({ ...item })),
  },
  "closet-cleanout-listing": {
    ...CLOSET_CLEANOUT_LISTING_PRICING,
    items: CLOSET_CLEANOUT_LISTING_PRICING.items.map((item) => ({ ...item })),
  },
  "create-games-kids": {
    raiseTip: "Parent-approved prices. Examples only.",
    items: [
      p("game", "Simple printable game", "$3–8"),
      p("pack", "3-game pack", "$8–18"),
      p("custom", "Custom theme", "+$2–5"),
    ],
  },
  "create-games-junior": {
    raiseTip: RAISE,
    items: [
      p("proto", "Playable prototype fee", "$25–75"),
      p("digital", "Browser mini-game commission", "$50–200"),
      p("pack", "Asset + rules PDF", "$15–40"),
    ],
  },
  "kids-craft-hustle": {
    raiseTip: "Parent-approved prices. Examples only.",
    items: [
      p("piece", "Craft piece", "$3–10"),
      p("set", "Set of 3", "$8–20"),
      p("custom", "Custom colors / name", "+$1–3"),
    ],
  },
  "flipping-properties": {
    raiseTip: "Deal math first — walk away when numbers fail. Examples only — not income guarantees.",
    items: [
      p("fee", "Deal analysis fee (if offering)", "$100–300"),
      p("partner", "Finders / assignment fee", "Market-dependent — contracts required"),
      p("consult", "Walkthrough consult", "$75–200"),
    ],
  },
  "foreclosure-properties": {
    ...FORECLOSURE_PROPERTIES_PRICING,
    items: FORECLOSURE_PROPERTIES_PRICING.items.map((item) => ({ ...item })),
  },
  "lien-tax-sales": {
    raiseTip: RAISE,
    items: [
      p("research", "Parcel research memo", "$50–150"),
      p("month", "Monthly sale calendar + notes", "$75–200 / mo"),
      p("class", "Intro class seat", "$25–75"),
    ],
  },
  "ai-agents": {
    ...AI_AGENTS_PRICING,
    items: AI_AGENTS_PRICING.items.map((item) => ({ ...item })),
  },
  "ai-assets": {
    raiseTip: RAISE,
    items: [
      p("pack", "Asset pack (10 graphics)", "$75–250"),
      p("brand", "Brand kit + templates", "$150–500"),
      p("rush", "Rush 48-hour", "+25%"),
    ],
  },
  "ai-timing": {
    ...AI_TIMING_PRICING,
    items: AI_TIMING_PRICING.items.map((item) => ({ ...item })),
  },
  "ai-social-helper": {
    raiseTip: RAISE,
    items: [
      p("week", "Weekly AI draft pack (client approves)", "$75–200"),
      p("month", "Monthly retainer", "$250–800"),
      p("setup", "Voice + prompt library setup", "$100–250"),
    ],
  },
  "ai-promo-video": {
    ...AI_PROMO_VIDEO_PRICING,
    items: AI_PROMO_VIDEO_PRICING.items.map((item) => ({ ...item })),
  },
  "ai-prompt-helper": {
    ...AI_PROMPT_HELPER_PRICING,
    items: AI_PROMPT_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  "ai-peers": {
    ...AI_PEERS_PRICING,
    items: AI_PEERS_PRICING.items.map((item) => ({ ...item })),
  },
  "local-business-ai-setup": {
    raiseTip: RAISE,
    items: [
      p("setup", "Local biz AI starter setup", "$200–600"),
      p("train", "Owner training (1 hr)", "$75–150"),
      p("month", "Light support retainer", "$75–200 / mo"),
    ],
  },
  "digital-organizer": {
    raiseTip: RAISE,
    items: [
      p("session", "Digital declutter session", "$40–90"),
      p("drive", "Drive / photo library cleanup", "$75–200"),
      p("month", "Monthly tidy retainer", "$40–100 / mo"),
    ],
  },
  "transcription-notes-helper": {
    tabLabel: TRANSCRIPTION_NOTES_PRICING.tabLabel,
    raiseTip: TRANSCRIPTION_NOTES_PRICING.raiseTip,
    intro: TRANSCRIPTION_NOTES_PRICING.intro,
    items: TRANSCRIPTION_NOTES_PRICING.items.map((item) => ({ ...item })),
  },
  "family-history-organizer": {
    ...GENEALOGY_PRICING,
    items: GENEALOGY_PRICING.items.map((item) => ({ ...item })),
  },
  "digital-photo-organizer": {
    raiseTip: RAISE,
    items: [
      p("gb", "Per 10GB organized", "$40–100"),
      p("album", "Highlight album / slideshow prep", "$50–150"),
      p("hour", "Hourly", "$25–45 / hr"),
    ],
  },
  "local-content-photographer": {
    ...LOCAL_CONTENT_PHOTO_PRICING,
    items: LOCAL_CONTENT_PHOTO_PRICING.items.map((item) => ({ ...item })),
  },
  "local-event-content-creator": {
    ...LOCAL_EVENT_CONTENT_PRICING,
    items: LOCAL_EVENT_CONTENT_PRICING.items.map((item) => ({ ...item })),
  },
  "travel-research-assistant": {
    tabLabel: TRAVEL_RESEARCH_PRICING.tabLabel,
    raiseTip: TRAVEL_RESEARCH_PRICING.raiseTip,
    intro: TRAVEL_RESEARCH_PRICING.intro,
    items: TRAVEL_RESEARCH_PRICING.items.map((item) => ({ ...item })),
  },
  "online-community-moderator": {
    tabLabel: COMMUNITY_MODERATOR_PRICING.tabLabel,
    raiseTip: COMMUNITY_MODERATOR_PRICING.raiseTip,
    intro: COMMUNITY_MODERATOR_PRICING.intro,
    items: COMMUNITY_MODERATOR_PRICING.items.map((item) => ({ ...item })),
  },
  "group-setup-helper": {
    ...GROUP_SETUP_HELPER_PRICING,
    items: GROUP_SETUP_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  "website-tester": {
    tabLabel: WEBSITE_TESTER_PRICING.tabLabel,
    raiseTip: WEBSITE_TESTER_PRICING.raiseTip,
    intro: WEBSITE_TESTER_PRICING.intro,
    items: WEBSITE_TESTER_PRICING.items.map((item) => ({ ...item })),
  },
  "digital-product-formatter": {
    raiseTip: RAISE,
    items: [
      p("ebook", "Ebook / PDF format polish", "$50–150"),
      p("workbook", "Workbook / planner format", "$75–200"),
      p("rush", "Rush turnaround", "+25–40%"),
    ],
  },
  "appointment-setter": {
    ...APPOINTMENT_SETTER_PRICING,
    items: APPOINTMENT_SETTER_PRICING.items.map((item) => ({ ...item })),
  },
  "lead-followup-assistant": {
    ...LEAD_FOLLOWUP_PRICING,
    items: LEAD_FOLLOWUP_PRICING.items.map((item) => ({ ...item })),
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
  "pet-sitting": {
    tabLabel: PET_SITTING_PRICING.tabLabel,
    raiseTip: PET_SITTING_PRICING.raiseTip,
    intro: PET_SITTING_PRICING.intro,
    items: PET_SITTING_PRICING.items.map((item) => ({ ...item })),
  },
  "friendship-bracelet-maker": {
    tabLabel: FRIENDSHIP_BRACELET_PRICING.tabLabel,
    raiseTip: FRIENDSHIP_BRACELET_PRICING.raiseTip,
    intro: FRIENDSHIP_BRACELET_PRICING.intro,
    items: FRIENDSHIP_BRACELET_PRICING.items.map((item) => ({ ...item })),
  },
  "leaf-raking": {
    tabLabel: LEAF_RAKING_PRICING.tabLabel,
    raiseTip: LEAF_RAKING_PRICING.raiseTip,
    intro: LEAF_RAKING_PRICING.intro,
    items: LEAF_RAKING_PRICING.items.map((item) => ({ ...item })),
  },
  "lemonade-stand": {
    tabLabel: LEMONADE_STAND_PRICING.tabLabel,
    raiseTip: LEMONADE_STAND_PRICING.raiseTip,
    intro: LEMONADE_STAND_PRICING.intro,
    items: LEMONADE_STAND_PRICING.items.map((item) => ({ ...item })),
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
  "recycling-helper": {
    tabLabel: RECYCLING_HELPER_PRICING.tabLabel,
    raiseTip: RECYCLING_HELPER_PRICING.raiseTip,
    intro: RECYCLING_HELPER_PRICING.intro,
    items: RECYCLING_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  proofreader: {
    tabLabel: PROOFREADER_PRICING.tabLabel,
    raiseTip: PROOFREADER_PRICING.raiseTip,
    intro: PROOFREADER_PRICING.intro,
    items: PROOFREADER_PRICING.items.map((item) => ({ ...item })),
  },
  "toy-organizer": {
    tabLabel: TOY_ORGANIZER_PRICING.tabLabel,
    raiseTip: TOY_ORGANIZER_PRICING.raiseTip,
    intro: TOY_ORGANIZER_PRICING.intro,
    items: TOY_ORGANIZER_PRICING.items.map((item) => ({ ...item })),
  },
  "trash-can-service": {
    tabLabel: TRASH_CAN_SERVICE_PRICING.tabLabel,
    raiseTip: TRASH_CAN_SERVICE_PRICING.raiseTip,
    intro: TRASH_CAN_SERVICE_PRICING.intro,
    items: TRASH_CAN_SERVICE_PRICING.items.map((item) => ({ ...item })),
  },
  homework: {
    tabLabel: HOMEWORK_HELPER_PRICING.tabLabel,
    raiseTip: HOMEWORK_HELPER_PRICING.raiseTip,
    intro: HOMEWORK_HELPER_PRICING.intro,
    items: HOMEWORK_HELPER_PRICING.items.map((item) => ({ ...item })),
  },
  "canva-flyer-creator": {
    tabLabel: CANVA_FLYER_PRICING.tabLabel,
    raiseTip: CANVA_FLYER_PRICING.raiseTip,
    intro: CANVA_FLYER_PRICING.intro,
    items: CANVA_FLYER_PRICING.items.map((item) => ({ ...item })),
  },
  "car-interior-cleanup": {
    tabLabel: CAR_INTERIOR_PRICING.tabLabel,
    raiseTip: CAR_INTERIOR_PRICING.raiseTip,
    intro: CAR_INTERIOR_PRICING.intro,
    items: CAR_INTERIOR_PRICING.items.map((item) => ({ ...item })),
  },
  "dog-walk": {
    tabLabel: NEIGHBORHOOD_DOG_WALKER_PRICING.tabLabel,
    raiseTip: NEIGHBORHOOD_DOG_WALKER_PRICING.raiseTip,
    intro: NEIGHBORHOOD_DOG_WALKER_PRICING.intro,
    items: NEIGHBORHOOD_DOG_WALKER_PRICING.items.map((item) => ({ ...item })),
  },
  "online-research-assistant": {
    ...ONLINE_RESEARCH_ASSISTANT_PRICING,
    items: ONLINE_RESEARCH_ASSISTANT_PRICING.items.map((item) => ({ ...item })),
  },
  "virtual-call-assistant": {
    raiseTip: RAISE,
    items: [
      p("hour", "Call support hourly", "$20–35 / hr"),
      p("month", "Part-time monthly", "$400–1,000 / mo"),
      p("script", "Script + FAQ setup", "$50–150"),
    ],
  },
  "mailbox-cleaning": {
    raiseTip: RAISE,
    items: [
      p("box", "Per mailbox clean", "$5–12"),
      p("route", "Neighborhood route (10 boxes)", "$50–90"),
      p("month", "Monthly standing route", "$20–40 / home"),
    ],
  },
  "junior-savings-ceo": {
    ...JUNIOR_SAVINGS_CEO_PRICING,
    items: JUNIOR_SAVINGS_CEO_PRICING.items.map((item) => ({ ...item })),
  },
  "kids-piggy-first-goal": {
    ...KIDS_PIGGY_FIRST_GOAL_PRICING,
    items: KIDS_PIGGY_FIRST_GOAL_PRICING.items.map((item) => ({ ...item })),
  },
  "kids-kindness-share": {
    ...KIDS_KINDNESS_SHARE_PRICING,
    items: KIDS_KINDNESS_SHARE_PRICING.items.map((item) => ({ ...item })),
  },
  "kids-games-ai": {
    ...KIDS_GAMES_AI_PRICING,
    items: KIDS_GAMES_AI_PRICING.items.map((item) => ({ ...item })),
  },
  "kids-reinvest-jar": {
    ...KIDS_REINVEST_JAR_PRICING,
    items: KIDS_REINVEST_JAR_PRICING.items.map((item) => ({ ...item })),
  },
  "junior-reinvest-ceo": {
    ...JUNIOR_REINVEST_CEO_PRICING,
    items: JUNIOR_REINVEST_CEO_PRICING.items.map((item) => ({ ...item })),
  },
  "junior-give-back-teach": {
    ...JUNIOR_GIVE_BACK_TEACH_PRICING,
    items: JUNIOR_GIVE_BACK_TEACH_PRICING.items.map((item) => ({ ...item })),
  },
  "junior-games-ai": {
    ...JUNIOR_GAMES_AI_PRICING,
    items: JUNIOR_GAMES_AI_PRICING.items.map((item) => ({ ...item })),
  },
  "junior-content-create": {
    raiseTip: RAISE,
    items: [
      p("post", "Content piece for a neighbor biz", "$10–30"),
      p("pack", "3-post pack", "$25–60"),
    ],
  },
};

function suppliesForKind(kind: PrepKind, name: string): GuideSupplyList {
  switch (kind) {
    case "gig-drive":
      return {
        starterKitTotal: "About $15–40 for car/phone comfort gear",
        items: [
          s("mount", "Phone mount", "1", "$10–20"),
          s("charger", "Car charger / cable", "1", "$8–15"),
          s("wipes", "Hand / surface wipes", "1 pack", "$3–8", undefined, true),
          s("bag", `Insulated bag (if ${name} includes food)`, "1", "$15–30", undefined, true),
        ],
      };
    case "property":
      return {
        starterKitTotal: "About $20–60 for turnover / showing essentials",
        items: [
          s("checklist", "Printed turnover / showing checklist", "1 pad", "$3–8"),
          s("kit", "Small restock tote (trash bags, paper goods)", "1", "$15–35"),
          s("lockbox", "Spare lockbox / key pouch", "1", "$10–25", undefined, true),
          s("camera", "Phone tripod for listing photos", "1", "$15–30", undefined, true),
        ],
      };
    case "care-local":
      return {
        starterKitTotal: "About $5–25 for activity / care backups",
        items: [
          s("activities", "Quiet activities / games pack", "1", "$5–15"),
          s("wipes", "Hand wipes", "1 pack", "$3–6", undefined, true),
          s("notebook", "Care notes notepad", "1", "$2–5", undefined, true),
          s("phone", "Charged phone (already owned)", "1", "$0"),
        ],
      };
    case "clean-local":
      return {
        starterKitTotal: "About $15–45 for cleaning consumables",
        items: [
          s("gloves", "Work or disposable gloves", "1 pair / box", "$5–12"),
          s("cleaner", "Mild cleaner / wipes", "1", "$4–10"),
          s("cloths", "Microfiber cloths", "1 pack", "$6–12"),
          s("bags", "Trash bags", "1 box", "$4–8", undefined, true),
        ],
      };
    case "neighbor-local":
      return {
        starterKitTotal: "About $10–35 for a small helper kit",
        items: [
          s("tote", "Tote or crate for the job", "1", "$5–12"),
          s("gloves", "Work gloves", "1 pair", "$5–12", undefined, true),
          s("notebook", "Job notepad + pen", "1", "$2–5"),
          s("bags", "Reusable shopping / trash bags", "2–4", "$3–8", undefined, true),
        ],
      };
    case "creator-content":
      return {
        starterKitTotal: "About $10–40 for shoot / delivery extras (phone is Tools)",
        items: [
          s("sd", "Extra SD card or USB for client delivery", "1", "$8–20"),
          s("tripod", "Mini tripod / grip", "1", "$12–25", undefined, true),
          s("light", "Clip-on LED light", "1", "$10–20", undefined, true),
          s("backdrop", "Simple backdrop cloth", "1", "$10–25", undefined, true),
        ],
      };
    case "ecommerce":
      return {
        starterKitTotal: "About $15–50 for packing / sample materials",
        items: [
          s("mailers", "Poly mailers or boxes", "1 pack", "$8–20"),
          s("tape", "Packing tape", "1 roll", "$3–7"),
          s("labels", "Shipping label paper / stickers", "1 pack", "$5–12"),
          s("sample", "Product sample or mockup print", "1–3", "$5–20", undefined, true),
        ],
      };
    case "craft-product":
      return {
        starterKitTotal: "About $10–40 for first batch materials",
        items: [
          s("materials", `${name} starter materials`, "1 kit", "$8–25"),
          s("packaging", "Bags / boxes / tags", "1 pack", "$4–12"),
          s("display", "Small display tray or stand", "1", "$5–15", undefined, true),
        ],
      };
    case "kids-learning":
      return {
        starterKitTotal: "About $0–15 — mostly paper and a jar (parent helps)",
        items: [
          s("jar", "Clear jar or envelope for tracking", "1", "$0–5"),
          s("paper", "Paper + markers for goals / charts", "1 pack", "$3–8"),
          s("stickers", "Sticker sheet for progress", "1", "$2–5", undefined, true),
        ],
      };
    case "club-community":
      return {
        starterKitTotal: "About $5–25 for printables and name tags",
        items: [
          s("print", "Printed agendas / flyers", "1 set", "$5–15"),
          s("tags", "Name tags or sign-in sheet", "1 pack", "$3–8"),
          s("snacks", "Simple snacks (if hosting in person)", "1", "$8–20", undefined, true),
        ],
      };
    case "digital-desk":
    default:
      return {
        starterKitTotal: "About $5–25 for delivery / client-facing printables",
        items: [
          s("notebook", "Client notes notebook", "1", "$3–8"),
          s("usb", "USB drive for file handoff (optional)", "1", "$6–12", undefined, true),
          s("print", "Printed checklist or one-pager", "1 set", "$2–8", undefined, true),
          s("folder", "Folder or envelope for signed docs", "1", "$2–5", undefined, true),
        ],
      };
  }
}

function pricingForKind(kind: PrepKind, name: string): GuideSuggestedPricing {
  switch (kind) {
    case "gig-drive":
      return {
        raiseTip: "Optimize for $/hour and peak windows. Examples only — not income guarantees.",
        items: [
          p("hour", `${name} busy-window goal`, "$18–30 / hr gross before expenses"),
          p("trip", "Typical single trip / drop", "$6–25 depending on distance"),
          p("bonus", "Promo / quest boosts", "Follow platform terms"),
        ],
      };
    case "property":
      return {
        raiseTip: RAISE,
        items: [
          p("visit", `${name} site visit / check`, "$25–60"),
          p("turn", "Turnover / clean coordination", "$75–150"),
          p("month", "Monthly co-host / mgmt slice", "10–25% of booking or flat fee"),
        ],
      };
    case "care-local":
      return {
        raiseTip: RAISE,
        items: [
          p("hour", `${name} hourly`, "$12–25 / hr"),
          p("block", "2–3 hour block", "$30–70"),
          p("party", "Party / event block (if offered)", "$50–120"),
        ],
      };
    case "clean-local":
      return {
        raiseTip: RAISE,
        items: [
          p("job", `${name} single job`, "$25–80"),
          p("month", "Monthly standing route", "$20–50 / home"),
          p("add", "Add-on deep tidy", "+$10–25"),
        ],
      };
    case "neighbor-local":
      return {
        raiseTip: RAISE,
        items: [
          p("task", `${name} single task`, "$15–40"),
          p("hour", "Hourly helper rate", "$18–35 / hr"),
          p("bundle", "Multi-task bundle", "$40–80"),
        ],
      };
    case "creator-content":
      return {
        raiseTip: RAISE,
        items: [
          p("asset", `${name} single asset / clip`, "$25–75"),
          p("pack", "5-asset content pack", "$100–250"),
          p("retainer", "Monthly content retainer", "$300–900 / mo"),
        ],
      };
    case "ecommerce":
      return {
        raiseTip: RAISE,
        items: [
          p("item", `${name} starter product price`, "2–3× materials + platform fees"),
          p("bundle", "Bundle of 3", "Save customer ~10%"),
          p("custom", "Custom / personalized order", "+$5–25"),
        ],
      };
    case "craft-product":
      return {
        raiseTip: RAISE,
        items: [
          p("piece", `${name} per piece`, "$5–20"),
          p("set", "Set of 3", "$15–45"),
          p("custom", "Custom request", "2–3× materials + time"),
        ],
      };
    case "kids-learning":
      return {
        raiseTip: "These are learning goals — keep money talk parent-approved. Examples only.",
        items: [
          p("chore", "Parent-approved chore payout", "$1–5 per job"),
          p("sale", "Small craft / bake sale item (if any)", "$1–5"),
          p("goal", "Savings goal checkpoint", "Celebrate progress, not perfection"),
        ],
      };
    case "club-community":
      return {
        raiseTip: RAISE,
        items: [
          p("setup", `${name} setup fee`, "$40–120"),
          p("month", "Monthly facilitation", "$50–200 / mo"),
          p("event", "One-off event host", "$75–200"),
        ],
      };
    case "digital-desk":
    default:
      return {
        raiseTip: RAISE,
        items: [
          p("hour", `${name} hourly`, "$25–55 / hr"),
          p("project", "Scoped starter project", "$75–300"),
          p("retainer", "Monthly retainer", "$200–800 / mo"),
        ],
      };
  }
}

export function defaultSuppliesForGuide(guideId: string): GuideSupplyList {
  if (SUPPLY_OVERRIDES[guideId]) return SUPPLY_OVERRIDES[guideId];
  const meta = guideLabel(guideId);
  return suppliesForKind(classify(meta), meta.name);
}

export function defaultSuggestedPricingForGuide(guideId: string): GuideSuggestedPricing {
  if (PRICING_OVERRIDES[guideId]) return PRICING_OVERRIDES[guideId];
  const meta = guideLabel(guideId);
  return pricingForKind(classify(meta), meta.name);
}
