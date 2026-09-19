/**
 * Physical / consumable supply lists with rough USD estimates for Launch guides.
 * Prices vary by store — treat as planning ranges, not quotes.
 * Apps, phones, and durable tools belong in Tools — not here.
 */

export type GuideSupplyItem = {
  id: string;
  name: string;
  /** Quantity to buy/bring, e.g. "1", "1 pack (50)", "4–6". */
  qty: string;
  /** Rough store range, e.g. "$6–10". */
  estCost: string;
  notes?: string;
  optional?: boolean;
};

export type GuideSupplyList = {
  items: GuideSupplyItem[];
  /** Ballpark to assemble a first-job kit (new buys only). */
  starterKitTotal: string;
};

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

import { TECH_HELPER_SUPPLIES } from "./tech-helper-guide";
import { YARD_HELP_SUPPLIES } from "./yard-help-guide";
import { CLEANING_SERVICE_SUPPLIES } from "./cleaning-service-guide";
import { ERRAND_RUNNER_SUPPLIES } from "./errand-runner-guide";
import { NEIGHBORHOOD_HELPER_SUPPLIES } from "./neighborhood-helper-guide";
import { AI_ASSETS_SUPPLIES } from "./ai-assets-guide";
import { AIRBNB_COHOST_SUPPLIES } from "./airbnb-cohost-guide";
import { AMAZON_FBA_SELLER_SUPPLIES } from "./amazon-fba-seller-guide";
import { VIRTUAL_CALL_ASSISTANT_SUPPLIES } from "./virtual-call-assistant-guide";
import { AI_SOCIAL_HELPER_SUPPLIES } from "./ai-social-helper-guide";
import { BIRTHDAY_PARTY_HELPER_SUPPLIES } from "./birthday-party-helper-guide";
import { CLOSET_ORGANIZER_SUPPLIES } from "./closet-organizer-guide";
import { LIEN_TAX_SALES_SUPPLIES } from "./lien-tax-sales-guide";
import { JUNIOR_CONTENT_CREATE_SUPPLIES } from "./junior-content-create-guide";
import { KIDS_CRAFT_HUSTLE_SUPPLIES } from "./kids-craft-hustle-guide";
import { CREATE_GAMES_KIDS_SUPPLIES } from "./create-games-kids-guide";
import { CREATE_GAMES_JUNIOR_SUPPLIES } from "./create-games-junior-guide";
import { CUSTOM_BOOKMARK_CREATOR_SUPPLIES } from "./custom-bookmark-creator-guide";
import { WEB_LEADS_SUPPLIES } from "./web-leads-guide";
import { MAILBOX_CLEANING_SUPPLIES } from "./mailbox-cleaning-guide";
import { AI_AGENTS_SUPPLIES } from "./ai-agents-guide";
import { AI_PROMO_VIDEO_SUPPLIES } from "./ai-promo-video-guide";
import { STR_COHOST_SUPPLIES } from "./str-cohost-guide";
import { BEACH_SHELL_JEWELRY_SUPPLIES } from "./beach-shell-jewelry-guide";
import { GIFT_WRAPPING_SUPPLIES } from "./gift-wrapping-guide";
import { AFFILIATE_SUPPLIES } from "./affiliate-guide";
import { DROPSHIPPING_SUPPLIES } from "./dropshipping-guide";
import { FB_MARKETPLACE_HELPER_SUPPLIES } from "./fb-marketplace-helper-guide";
import { BASIC_INVITATION_SUPPLIES } from "./basic-invitation-creator-guide";
import { POD_SUPPLIES } from "./pod-guide";
import { PET_SITTING_SUPPLIES } from "./pet-sitting-guide";
import { HANDYMAN_SUPPLIES } from "./handyman-guide";
import { FRIENDSHIP_BRACELET_SUPPLIES } from "./friendship-bracelet-maker-guide";
import { LEAF_RAKING_SUPPLIES } from "./leaf-raking-guide";
import { LEMONADE_STAND_SUPPLIES } from "./lemonade-stand-guide";
import { AIRBNB_HOSTING_SUPPLIES } from "./airbnb-hosting-guide";
import { DIGITAL_COOKBOOK_SUPPLIES } from "./digital-cookbook-creator-guide";
import { FAMILY_PHOTO_SLIDESHOW_SUPPLIES } from "./family-photo-slideshow-guide";
import { LOCAL_RESOURCE_LIST_SUPPLIES } from "./local-resource-list-creator-guide";
import { RECYCLING_HELPER_SUPPLIES } from "./recycling-helper-guide";
import { PROOFREADER_SUPPLIES } from "./proofreader-guide";
import { TOY_ORGANIZER_SUPPLIES } from "./toy-organizer-guide";
import { TRASH_CAN_SERVICE_SUPPLIES } from "./trash-can-service-guide";
import { HOMEWORK_HELPER_SUPPLIES } from "./homework-helper-guide";
import { CANVA_FLYER_SUPPLIES } from "./canva-flyer-creator-guide";
import { CAR_INTERIOR_SUPPLIES } from "./car-interior-cleanup-guide";
import { NEIGHBORHOOD_DOG_WALKER_SUPPLIES } from "./neighborhood-dog-walker-guide";

/** Free / local hustles that need a real supply list. */
export const GUIDE_SUPPLIES: Record<string, GuideSupplyList> = {
  "car-interior-cleanup": {
    starterKitTotal: CAR_INTERIOR_SUPPLIES.starterKitTotal,
    items: CAR_INTERIOR_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "dog-walk": {
    starterKitTotal: NEIGHBORHOOD_DOG_WALKER_SUPPLIES.starterKitTotal,
    items: NEIGHBORHOOD_DOG_WALKER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "pet-sitting": {
    starterKitTotal: PET_SITTING_SUPPLIES.starterKitTotal,
    items: PET_SITTING_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "yard-help": {
    starterKitTotal: YARD_HELP_SUPPLIES.starterKitTotal,
    items: YARD_HELP_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "leaf-raking": {
    starterKitTotal: LEAF_RAKING_SUPPLIES.starterKitTotal,
    items: LEAF_RAKING_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "plant-watering": {
    starterKitTotal: "About $0–12 (keys from owner; can optional)",
    items: [
      s("keys", "Key / lockbox", "1", "$0", "from owner"),
      s("watercan", "Watering can or pitcher", "1", "$5–12", "Use owner’s first", true),
      s("plantfood", "Liquid plant food (mild)", "1 small bottle", "$4–8", undefined, true),
    ],
  },

  "trash-can-service": {
    starterKitTotal: TRASH_CAN_SERVICE_SUPPLIES.starterKitTotal,
    items: TRASH_CAN_SERVICE_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "neighborhood-helper": {
    starterKitTotal: NEIGHBORHOOD_HELPER_SUPPLIES.starterKitTotal,
    items: NEIGHBORHOOD_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "ai-assets": {
    starterKitTotal: AI_ASSETS_SUPPLIES.starterKitTotal,
    items: AI_ASSETS_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "airbnb-cohost": {
    starterKitTotal: AIRBNB_COHOST_SUPPLIES.starterKitTotal,
    items: AIRBNB_COHOST_SUPPLIES.items.map((item) => ({ ...item })),
  },

  amazon: {
    starterKitTotal: AMAZON_FBA_SELLER_SUPPLIES.starterKitTotal,
    items: AMAZON_FBA_SELLER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "virtual-call-assistant": {
    starterKitTotal: VIRTUAL_CALL_ASSISTANT_SUPPLIES.starterKitTotal,
    items: VIRTUAL_CALL_ASSISTANT_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "ai-social-helper": {
    starterKitTotal: AI_SOCIAL_HELPER_SUPPLIES.starterKitTotal,
    items: AI_SOCIAL_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "birthday-party-helper": {
    starterKitTotal: BIRTHDAY_PARTY_HELPER_SUPPLIES.starterKitTotal,
    items: BIRTHDAY_PARTY_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "closet-organizer": {
    starterKitTotal: CLOSET_ORGANIZER_SUPPLIES.starterKitTotal,
    items: CLOSET_ORGANIZER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "lien-tax-sales": {
    starterKitTotal: LIEN_TAX_SALES_SUPPLIES.starterKitTotal,
    items: LIEN_TAX_SALES_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "junior-content-create": {
    starterKitTotal: JUNIOR_CONTENT_CREATE_SUPPLIES.starterKitTotal,
    items: JUNIOR_CONTENT_CREATE_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "kids-craft-hustle": {
    starterKitTotal: KIDS_CRAFT_HUSTLE_SUPPLIES.starterKitTotal,
    items: KIDS_CRAFT_HUSTLE_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "create-games-kids": {
    starterKitTotal: CREATE_GAMES_KIDS_SUPPLIES.starterKitTotal,
    items: CREATE_GAMES_KIDS_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "create-games-junior": {
    starterKitTotal: CREATE_GAMES_JUNIOR_SUPPLIES.starterKitTotal,
    items: CREATE_GAMES_JUNIOR_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "custom-bookmark-creator": {
    starterKitTotal: CUSTOM_BOOKMARK_CREATOR_SUPPLIES.starterKitTotal,
    items: CUSTOM_BOOKMARK_CREATOR_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "web-leads": {
    starterKitTotal: WEB_LEADS_SUPPLIES.starterKitTotal,
    items: WEB_LEADS_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "mailbox-cleaning": {
    starterKitTotal: MAILBOX_CLEANING_SUPPLIES.starterKitTotal,
    items: MAILBOX_CLEANING_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "errand-runner": {
    starterKitTotal: ERRAND_RUNNER_SUPPLIES.starterKitTotal,
    items: ERRAND_RUNNER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "ai-agents": {
    starterKitTotal: AI_AGENTS_SUPPLIES.starterKitTotal,
    items: AI_AGENTS_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "ai-promo-video": {
    starterKitTotal: AI_PROMO_VIDEO_SUPPLIES.starterKitTotal,
    items: AI_PROMO_VIDEO_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "vacation-mail-plant-helper": {
    starterKitTotal: "About $0–8 (keys from owner)",
    items: [
      s("keys", "Key / lockbox", "1", "$0", "from owner"),
      s("checklist", "Printed plant watering checklist (paper)", "1 pad", "$2–4", undefined, true),
      s("cloth", "Small towel for spills", "1", "$2–5", undefined, true),
    ],
  },

  "recycling-helper": {
    starterKitTotal: RECYCLING_HELPER_SUPPLIES.starterKitTotal,
    items: RECYCLING_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "garage-sale-helper": {
    starterKitTotal: "About $10–25 for tags, bags, and signs",
    items: [
      s("tags", "Price stickers / masking tape + marker", "1 set", "$4–8"),
      s("bags", "Paper bags for buyers", "1 pack", "$4–8", undefined, true),
      s("signs", "Garage sale signs + balloons", "1 set", "$5–12", undefined, true),
      s("cashbox", "Cash box", "1", "$8–15", "Float/change from owner", true),
    ],
  },

  "holiday-decorating-helper": {
    starterKitTotal: "About $5–20 (décor is owner’s)",
    items: [
      s("hooks", "Command hooks or clips", "1 pack", "$6–12", "Only with owner OK"),
      s("gloves", "Work gloves", "1 pair", "$5–12"),
      s("ties", "Twist ties / zip ties for lights", "1 pack", "$3–6", undefined, true),
      s("bulbs", "Spare bulbs", "1 pack", "$4–8", "Often from owner", true),
    ],
  },

  "gift-wrapping": {
    starterKitTotal: GIFT_WRAPPING_SUPPLIES.starterKitTotal,
    items: GIFT_WRAPPING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  affiliate: {
    starterKitTotal: AFFILIATE_SUPPLIES.starterKitTotal,
    items: AFFILIATE_SUPPLIES.items.map((item) => ({ ...item })),
  },
  dropshipping: {
    starterKitTotal: DROPSHIPPING_SUPPLIES.starterKitTotal,
    items: DROPSHIPPING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "fb-marketplace-helper": {
    starterKitTotal: FB_MARKETPLACE_HELPER_SUPPLIES.starterKitTotal,
    items: FB_MARKETPLACE_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "basic-invitation-creator": {
    starterKitTotal: BASIC_INVITATION_SUPPLIES.starterKitTotal,
    items: BASIC_INVITATION_SUPPLIES.items.map((item) => ({ ...item })),
  },
  pod: {
    starterKitTotal: POD_SUPPLIES.starterKitTotal,
    items: POD_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "lemonade-stand": {
    starterKitTotal: LEMONADE_STAND_SUPPLIES.starterKitTotal,
    items: LEMONADE_STAND_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "friendship-bracelet-maker": {
    starterKitTotal: FRIENDSHIP_BRACELET_SUPPLIES.starterKitTotal,
    items: FRIENDSHIP_BRACELET_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "beach-shell-jewelry": {
    starterKitTotal: BEACH_SHELL_JEWELRY_SUPPLIES.starterKitTotal,
    items: BEACH_SHELL_JEWELRY_SUPPLIES.items.map((item) => ({ ...item })),
  },

  crafts: {
    starterKitTotal: "About $15–40 depending on craft lane",
    items: [
      s("materials", "Primary craft materials for ~10 units", "1 kit / batch", "$10–30", "Clay, beads, stickers, or yarn — pick one lane"),
      s("packaging", "Bags / cards / stickers for packaging", "1 pack", "$5–12"),
      s("glue", "Craft glue or hot-glue sticks", "1", "$3–8", undefined, true),
    ],
  },

  "toy-organizer": {
    starterKitTotal: TOY_ORGANIZER_SUPPLIES.starterKitTotal,
    items: TOY_ORGANIZER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  airbnb: {
    starterKitTotal: AIRBNB_HOSTING_SUPPLIES.starterKitTotal,
    items: AIRBNB_HOSTING_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "digital-cookbook-creator": {
    starterKitTotal: DIGITAL_COOKBOOK_SUPPLIES.starterKitTotal,
    items: DIGITAL_COOKBOOK_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "family-photo-slideshow": {
    starterKitTotal: FAMILY_PHOTO_SLIDESHOW_SUPPLIES.starterKitTotal,
    items: FAMILY_PHOTO_SLIDESHOW_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "local-resource-list-creator": {
    starterKitTotal: LOCAL_RESOURCE_LIST_SUPPLIES.starterKitTotal,
    items: LOCAL_RESOURCE_LIST_SUPPLIES.items.map((item) => ({ ...item })),
  },
  proofreader: {
    starterKitTotal: PROOFREADER_SUPPLIES.starterKitTotal,
    items: PROOFREADER_SUPPLIES.items.map((item) => ({ ...item })),
  },
  homework: {
    starterKitTotal: HOMEWORK_HELPER_SUPPLIES.starterKitTotal,
    items: HOMEWORK_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  handyman: {
    starterKitTotal: HANDYMAN_SUPPLIES.starterKitTotal,
    items: HANDYMAN_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "cleaning-service": {
    starterKitTotal: CLEANING_SERVICE_SUPPLIES.starterKitTotal,
    items: CLEANING_SERVICE_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "str-cohost": {
    starterKitTotal: STR_COHOST_SUPPLIES.starterKitTotal,
    items: STR_COHOST_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "handyman-light": {
    starterKitTotal: "About $15–35 for hanging kit and gloves",
    items: [
      s("anchors", "Picture hanging kit / wall anchors", "1 kit", "$6–12"),
      s("ppe", "Work gloves", "1 pair", "$5–10"),
      s("caulk", "Caulk tube (touch-ups)", "1", "$4–8", "Caulk gun is a tool", true),
      s("wipes", "Cleaning wipes for touch-up mess", "1 pack", "$3–6", undefined, true),
    ],
  },

  "tech-helper": {
    starterKitTotal: TECH_HELPER_SUPPLIES.starterKitTotal,
    items: TECH_HELPER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  tutoring: {
    starterKitTotal: "About $8–20 for notebook and markers",
    items: [
      s("notebook", "Session notebook", "1", "$3–6"),
      s("pens", "Pens / pencils", "1 pack", "$3–6"),
      s("whiteboard", "Small whiteboard + markers", "1 set", "$8–15", undefined, true),
      s("flash", "Index cards", "1 pack", "$2–5", undefined, true),
    ],
  },

  "canva-flyer-creator": {
    starterKitTotal: CANVA_FLYER_SUPPLIES.starterKitTotal,
    items: CANVA_FLYER_SUPPLIES.items.map((item) => ({ ...item })),
  },

  "greeting-card-creator": {
    starterKitTotal: "About $8–25 for handmade card supplies",
    items: [
      s("cardstock", "Cardstock / blank cards", "1 pack", "$6–12"),
      s("pens", "Markers / colored pencils", "1 set", "$5–12"),
      s("stickers", "Stickers / washi tape", "1 pack", "$3–8", undefined, true),
      s("glue", "Glue stick", "1", "$1–3", undefined, true),
    ],
  },
};

export function suppliesForGuide(guideId: string): GuideSupplyList | undefined {
  return GUIDE_SUPPLIES[guideId];
}

export function formatSupplyLine(item: GuideSupplyItem, index?: number): string {
  const num = typeof index === "number" ? `${index + 1}. ` : "";
  const opt = item.optional ? " (optional)" : "";
  const notes = item.notes ? ` — ${item.notes}` : "";
  return `${num}${item.name}${opt} — Qty: ${item.qty} — Est. ${item.estCost}${notes}`;
}

export function suppliesDisclaimer(): string {
  return "Vendor prices are estimates — check the store for current pricing. Supplies listed here are physical items to buy or borrow for the job, not apps or software.";
}
