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
import {
  KIDS_KINDNESS_SHARE_PRICING,
  KIDS_KINDNESS_SHARE_SUPPLIES,
} from "./kids-kindness-share-guide";
import {
  KIDS_PIGGY_FIRST_GOAL_PRICING,
  KIDS_PIGGY_FIRST_GOAL_SUPPLIES,
} from "./kids-piggy-first-goal-guide";
import { BABYSITTING_PRICING, BABYSITTING_SUPPLIES } from "./babysitting-guide";
import {
  DIGITAL_PRODUCTS_PRICING,
  DIGITAL_PRODUCTS_SUPPLIES,
} from "./digital-products-guide";
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
    starterKitTotal: "About $40–120 for a portable starter kit (less if client provides vacuum/mop)",
    items: [
      s("microfiber", "Microfiber cloths", "1 pack (12)", "$8–15"),
      s("spray", "All-purpose + bathroom cleaner", "2 bottles", "$8–16"),
      s("gloves", "Disposable gloves", "1 box", "$6–12"),
      s("trash", "Trash bags", "1 box", "$5–10"),
      s("tote", "Caddy / tote for supplies", "1", "$8–18"),
      s("vacuum", "Vacuum (if client doesn’t provide)", "1", "$80–200", "Borrow first when possible", true),
      s("mop", "Mop + bucket (if client doesn’t provide)", "1", "$15–35", undefined, true),
    ],
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
  "mailbox-cleaning": {
    starterKitTotal: "About $8–20 for gloves and cleaner",
    items: [
      s("gloves", "Work gloves", "1 pair", "$5–12"),
      s("wipe", "Outdoor-safe wipes or mild cleaner", "1", "$3–8"),
      s("brush", "Small scrub brush", "1", "$3–6", undefined, true),
    ],
  },
  airbnb: {
    starterKitTotal: "About $40–120 for guest welcome / restock basics (furniture is separate)",
    items: [
      s("toiletries", "Travel toiletries kit for guests", "1 set", "$15–30"),
      s("linens", "Extra sheet / towel set", "1", "$25–50"),
      s("welcome", "Welcome card + local tips printout", "1", "$3–8"),
      s("locks", "Spare lockbox batteries", "1 pack", "$5–12", undefined, true),
    ],
  },
  "property-mgmt": {
    starterKitTotal: PROPERTY_MGMT_SUPPLIES.starterKitTotal,
    items: PROPERTY_MGMT_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "book-publishing": {
    starterKitTotal: "About $15–60 for proofs and samples (software is Tools)",
    items: [
      s("proof", "Printed proof copy (KDP / local shop)", "1–2", "$8–25"),
      s("notebook", "Outline / chapter notebook", "1", "$3–8"),
      s("usb", "USB for manuscript backup", "1", "$6–12", undefined, true),
      s("bookmark", "Promo bookmark samples", "1 pack", "$5–15", undefined, true),
    ],
  },
  "book-publishing-kids": {
    starterKitTotal: "About $10–35 for kid-safe craft + print proofs (parent helps)",
    items: [
      s("paper", "Color printer paper / cardstock", "1 pack", "$6–12"),
      s("markers", "Markers or crayons for mock covers", "1 set", "$4–10"),
      s("proof", "One printed story booklet", "1", "$5–15"),
    ],
  },
  bookkeeping: {
    starterKitTotal: "About $5–25 for client intake paper (apps are Tools)",
    items: [
      s("folder", "Client accordion folder", "1", "$5–12"),
      s("receipt", "Receipt envelope pack", "1", "$3–8"),
      s("checklist", "Month-end close checklist printouts", "1 set", "$2–6"),
    ],
  },
  "etsy-store": {
    starterKitTotal: "About $20–60 for packing + first listing photos",
    items: [
      s("mailers", "Poly mailers / boxes", "1 pack", "$8–20"),
      s("tissue", "Tissue paper + thank-you stickers", "1 set", "$6–15"),
      s("backdrop", "Photo backdrop / poster board", "1", "$5–12"),
      s("tape", "Packing tape", "1 roll", "$3–7"),
    ],
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
    starterKitTotal: "About $15–45 for design print tests and sample merch",
    items: [
      s("sample", "1 sample shirt / mug from Printify/Printful", "1", "$12–30"),
      s("mock", "Printed size chart / care card", "1 pack", "$4–10"),
      s("notebook", "Niche / keyword idea notebook", "1", "$3–8"),
    ],
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
    starterKitTotal: "About $30–100 for stamp, journal, and travel pouch (state rules vary)",
    items: [
      s("stamp", "Notary stamp / seal (state-compliant)", "1", "$20–45"),
      s("journal", "Notary journal", "1", "$10–25"),
      s("pouch", "Travel pouch for stamp + ID check tools", "1", "$8–18"),
      s("ink", "Stamp ink refill", "1", "$5–12", undefined, true),
    ],
  },
  consulting: {
    starterKitTotal: "About $5–20 for session materials",
    items: [
      s("notebook", "Session notes notebook", "1", "$3–8"),
      s("print", "Printed discovery worksheet", "1 set", "$2–8"),
      s("folder", "Client takeaway folder", "1", "$2–5", undefined, true),
    ],
  },
  teaching: {
    starterKitTotal: "About $10–35 for class materials",
    items: [
      s("handout", "Printed handouts / worksheets", "1 set", "$5–15"),
      s("markers", "Whiteboard markers or sticky notes", "1 pack", "$4–10"),
      s("nametag", "Name tags", "1 pack", "$3–8", undefined, true),
    ],
  },
  "virtual-assistant": {
    starterKitTotal: "About $5–20 for client onboarding printables",
    items: [
      s("checklist", "Printed onboarding checklist", "1", "$2–6"),
      s("folder", "Client project folder", "1", "$2–5"),
      s("notebook", "Task log notebook", "1", "$3–8"),
    ],
  },
  "virtual-receptionist": {
    starterKitTotal: "About $5–15 for call scripts (headset is Tools)",
    items: [
      s("script", "Printed call / SMS scripts", "1 set", "$2–6"),
      s("log", "Call log notepad", "1", "$2–5"),
    ],
  },
  "resume-linkedin-helper": {
    starterKitTotal: "About $5–20 for portfolio print samples",
    items: [
      s("paper", "Resume paper (quality)", "1 pack", "$6–12"),
      s("folder", "Client presentation folder", "1", "$2–5"),
      s("print", "Printed before/after sample (anonymized)", "1", "$1–3"),
    ],
  },
  "google-business-helper": {
    starterKitTotal: "About $5–25 for on-site photo visit extras",
    items: [
      s("checklist", "GBP setup checklist printout", "1", "$2–5"),
      s("cards", "Ask-for-review QR cards", "1 pack", "$5–12", undefined, true),
    ],
  },
  "review-response-assistant": {
    starterKitTotal: "About $0–10 for tone/style cheat sheets",
    items: [
      s("sheet", "Printed response tone cheat sheet", "1", "$2–5"),
      s("log", "Review log notepad", "1", "$2–5"),
    ],
  },
  "community-newsletter-creator": {
    starterKitTotal: "About $5–20 for print proofs",
    items: [
      s("proof", "Printed newsletter proof", "1–2", "$3–8"),
      s("notebook", "Story / interview notepad", "1", "$3–8"),
    ],
  },
  "nonprofit-social-helper": {
    starterKitTotal: "About $5–20 for campaign printables",
    items: [
      s("flyer", "Printed campaign flyer draft", "1 set", "$3–10"),
      s("checklist", "Posting calendar printout", "1", "$2–5"),
    ],
  },
  "short-form-video-editor": {
    starterKitTotal: "About $10–40 for shoot / delivery extras",
    items: [
      s("sd", "Extra SD card", "1", "$10–20"),
      s("tripod", "Mini tripod / grip", "1", "$12–25", undefined, true),
      s("usb", "USB for client delivery", "1", "$6–12", undefined, true),
    ],
  },
  social: {
    starterKitTotal: "About $5–25 for content planning printables",
    items: [
      s("calendar", "Printed content calendar", "1", "$2–6"),
      s("cards", "Hashtag / hook idea cards", "1 set", "$3–8"),
    ],
  },
  "ugc-creator": {
    starterKitTotal: "About $15–50 for simple UGC set pieces",
    items: [
      s("backdrop", "Neutral backdrop / poster board", "1", "$8–20"),
      s("light", "Ring light or clip LED", "1", "$12–30", undefined, true),
      s("props", "Small product props (neutral)", "1 set", "$5–15", undefined, true),
    ],
  },
  "web-leads": {
    starterKitTotal: "About $10–30 for pitch leave-behinds",
    items: [
      s("onepager", "Printed website audit one-pager", "1 set", "$5–15"),
      s("cards", "Business cards", "1 pack", "$8–15"),
    ],
  },
  "str-cohost": {
    starterKitTotal: "About $20–50 for turnover restock tote",
    items: [
      s("tote", "Turnover restock tote", "1", "$10–20"),
      s("trash", "Trash bags + paper goods mini stock", "1 set", "$8–15"),
      s("checklist", "Turnover checklist pad", "1", "$3–8"),
    ],
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
    starterKitTotal: "About $5–20 for care-log basics (keys from owner)",
    items: [
      s("log", "House / pet care log notebook", "1", "$2–5"),
      s("flashlight", "Small flashlight", "1", "$5–10", undefined, true),
      s("bags", "Waste bags (if pets)", "1 roll", "$4–8", undefined, true),
    ],
  },
  "porch-package-helper": {
    starterKitTotal: "About $5–15 for weather-safe handling",
    items: [
      s("tote", "Sturdy tote for packages", "1", "$5–12"),
      s("marker", "Permanent marker for notes", "1", "$1–3"),
      s("log", "Pickup / drop log notepad", "1", "$2–5"),
    ],
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
  "homework-organizer": {
    starterKitTotal: "About $5–20 for student organization kit",
    items: [
      s("folders", "Color folders / binder tabs", "1 set", "$4–10"),
      s("stickers", "Planner stickers", "1 pack", "$3–8"),
      s("timer", "Study timer (optional)", "1", "$5–12", undefined, true),
    ],
  },
  "start-gardening-club": {
    starterKitTotal: "About $25–60 for first meetup host kit + light refreshments",
    items: [
      s("seeds", "Seed packets for demo / walk-aways", "3–5", "$5–12"),
      s("gloves", "Demo gloves", "1 pair", "$5–12"),
      s("handout", "Printed garden tip sheets", "1 set", "$3–8"),
      s("nametag", "Name tags + markers", "1 pack", "$3–8"),
      s("clipboard", "Sign-in clipboard", "1", "$2–6"),
      s("snacks", "Light snacks + napkins for hosting", "1", "$8–20"),
      s("drinks", "Water / iced tea + cups", "1", "$5–12"),
      s("bags", "Trash bags + sanitizer", "1 set", "$3–8", undefined, true),
      s("pots", "Spare small pots for plant swap", "4–6", "$5–12", undefined, true),
    ],
  },
  "start-book-club": {
    starterKitTotal: "About $5–25 for meetup printables",
    items: [
      s("handout", "Discussion question printouts", "1 set", "$3–8"),
      s("nametag", "Name tags", "1 pack", "$3–8"),
      s("snacks", "Simple snacks (if hosting)", "1", "$8–20", undefined, true),
    ],
  },
  "local-resource-list-creator": {
    starterKitTotal: "About $5–20 for research printables",
    items: [
      s("notebook", "Resource research notepad", "1", "$3–8"),
      s("print", "Printed list proofs for clients", "1 set", "$3–10"),
    ],
  },
  "closet-cleanout-listing": {
    starterKitTotal: "About $10–30 for listing / donate sorting",
    items: [
      s("bags", "Donate / sell / trash bags", "1 pack", "$5–12"),
      s("tags", "Size / price tags", "1 pack", "$3–8"),
      s("hanger", "Extra hangers for photo day", "1 pack", "$5–12", undefined, true),
    ],
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
    starterKitTotal: "About $10–30 for research + walk notes",
    items: [
      s("notebook", "Auction / lead notebook", "1", "$3–8"),
      s("folder", "County docs folder", "1", "$2–5"),
      s("checklist", "Due-diligence checklist printouts", "1 set", "$3–8"),
    ],
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
    starterKitTotal: "About $10–40 for demos and client handoff (software is Tools)",
    items: [
      s("notebook", "Agent workflow intake notebook", "1", "$3–8"),
      s("checklist", "Printed agent QA checklist", "1 set", "$3–8"),
      s("usb", "Encrypted USB for credential handoff (optional)", "1", "$8–20", undefined, true),
      s("folder", "Signed SOW / scope folder", "1", "$2–5"),
    ],
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
    starterKitTotal: "About $10–35 for research printouts and hotspot maps (no car kit)",
    items: [
      s("maps", "Printed ZIP / hotspot map proofs", "1 set", "$5–12"),
      s("notebook", "Timing research notebook", "1", "$3–8"),
      s("binder", "Weekly playbook binder for driver clients", "1", "$5–12"),
      s("highlighter", "Highlighters for peak windows", "1 pack", "$2–5"),
    ],
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
    starterKitTotal: "About $15–50 for shoot extras and delivery media",
    items: [
      s("tripod", "Mini phone tripod / grip", "1", "$12–25"),
      s("mic", "Clip-on lav mic (optional)", "1", "$15–30", undefined, true),
      s("usb", "Delivery USB / SD card", "1", "$8–20"),
      s("script", "Printed script / shot-list cards", "1 set", "$3–8"),
    ],
  },
  "ai-prompt-helper": {
    starterKitTotal: "About $5–20 for prompt packs and coaching printables",
    items: [
      s("cards", "Printed prompt recipe cards", "1 set", "$4–10"),
      s("notebook", "Coaching session notebook", "1", "$3–8"),
      s("folder", "Client workflow folder", "1", "$2–5"),
    ],
  },
  "ai-peers": {
    starterKitTotal: "About $10–35 for coffee-chat host kit",
    items: [
      s("agenda", "Printed peer-session agenda cards", "1 set", "$3–8"),
      s("nametag", "Name tags / table tents", "1 pack", "$4–10"),
      s("timer", "Session timer", "1", "$5–12", undefined, true),
      s("handout", "Take-home prompt / tip sheet", "1 set", "$3–8"),
    ],
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
    starterKitTotal: "About $5–25 for itinerary print packs",
    items: [
      s("itinerary", "Printed day-by-day itinerary templates", "1 set", "$3–8"),
      s("folder", "Trip folder with pockets", "1", "$3–8"),
      s("checklist", "Packing + booking checklist printouts", "1 set", "$3–8"),
      s("map", "Printed walking maps / transit cheat sheets", "1 set", "$3–10", undefined, true),
    ],
  },
  "website-tester": {
    starterKitTotal: "About $5–20 for bug logs and device notes",
    items: [
      s("buglog", "Printed bug-report templates", "1 set", "$3–8"),
      s("notebook", "Device / browser test matrix notepad", "1", "$3–8"),
      s("usb", "USB for screenshot handoff (optional)", "1", "$8–15", undefined, true),
    ],
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
    starterKitTotal: "About $15–40 for listing photo day kit",
    items: [
      s("tags", "Price / size tags + marker", "1 set", "$4–10"),
      s("backdrop", "Plain backdrop cloth for photos", "1", "$10–20"),
      s("measure", "Measuring tape for dimensions", "1", "$5–12"),
      s("bags", "Bags for sold / donate piles", "1 pack", "$4–10", undefined, true),
    ],
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
    starterKitTotal: "About $10–35 for transcript delivery (not cleaning supplies)",
    items: [
      s("headset", "Comfortable headset (if not owned)", "1", "$20–50", undefined, true),
      s("template", "Printed transcript / notes template", "1 set", "$3–8"),
      s("usb", "Delivery USB for long audio jobs", "1", "$8–15", undefined, true),
      s("notebook", "Timestamp / speaker notepad", "1", "$3–8"),
    ],
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
    starterKitTotal: "About $5–20 for rules and escalation sheets",
    items: [
      s("rules", "Printed community rules / tone guide", "1 set", "$3–8"),
      s("escalation", "Escalation contact sheet", "1", "$2–5"),
      s("log", "Incident log notepad", "1", "$3–8"),
    ],
  },
  "group-setup-helper": {
    starterKitTotal: "About $5–25 for Discord/Facebook setup handoffs",
    items: [
      s("map", "Printed channel / group structure map", "1", "$3–8"),
      s("admin", "Admin roles + permissions checklist", "1 set", "$3–8"),
      s("welcome", "Welcome post / onboarding template printout", "1", "$2–5"),
    ],
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
    starterKitTotal: "About $5–15 for a teen savings tracker kit (parent-approved)",
    items: [
      s("jar", "Clear savings jar or envelope system", "1", "$0–5"),
      s("ledger", "Printed CEO savings ledger pages", "1 set", "$3–8"),
      s("stickers", "Goal milestone stickers", "1 sheet", "$2–5", undefined, true),
    ],
  },
  "junior-give-back-teach": {
    starterKitTotal: JUNIOR_GIVE_BACK_TEACH_SUPPLIES.starterKitTotal,
    items: JUNIOR_GIVE_BACK_TEACH_SUPPLIES.items.map((item) => ({ ...item })),
  },
  "junior-games-ai": {
    starterKitTotal: "About $10–30 for paper prototypes and playtest notes",
    items: [
      s("cardstock", "Cardstock for boards / cards", "1 pack", "$5–12"),
      s("tokens", "Dice / tokens / paper stands", "1 set", "$3–8"),
      s("notes", "Playtest feedback notepad", "1", "$3–8"),
      s("usb", "Build backup USB", "1", "$6–12", undefined, true),
    ],
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
    starterKitTotal: "About $5–20 for tiny paper game prototypes (parent nearby)",
    items: [
      s("paper", "Paper + markers for a tiny board", "1 set", "$3–8"),
      s("tokens", "Buttons / coins as tokens (from home OK)", "1 set", "$0–5"),
      s("sleeve", "Sheet protector for the board", "1–2", "$1–3", undefined, true),
    ],
  },
  "kids-reinvest-jar": {
    starterKitTotal: KIDS_REINVEST_JAR_SUPPLIES.starterKitTotal,
    items: KIDS_REINVEST_JAR_SUPPLIES.items.map((item) => ({ ...item })),
  },
};

const PRICING_OVERRIDES: Record<string, GuideSuggestedPricing> = {
  "cleaning-service": {
    raiseTip: RAISE,
    items: [
      p("studio", "Studio / 1-bed standard clean", "$90–140"),
      p("two", "2-bed standard clean", "$120–180"),
      p("deep", "Deep clean add-on", "+$40–80"),
      p("move", "Move-out clean", "$200–350"),
      p("recur", "Weekly recurring (same home)", "5–10% off package"),
    ],
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
    raiseTip: "Price from comps and seasonality; raise after strong reviews. Examples only — not income guarantees.",
    items: [
      p("night", "Nightly rate (market comps)", "Match mid-tier comps ±10%"),
      p("clean", "Cleaning fee passed to guest", "$75–150"),
      p("min", "Minimum stay (weekday vs weekend)", "2–3 nights typical"),
    ],
  },
  babysitting: {
    ...BABYSITTING_PRICING,
    items: BABYSITTING_PRICING.items.map((item) => ({ ...item })),
  },
  "virtual-assistant": {
    raiseTip: RAISE,
    items: [
      p("hour", "General VA hourly", "$25–45 / hr"),
      p("pack", "10-hour starter pack", "$220–400"),
      p("retainer", "Monthly retainer (20 hrs)", "$500–900"),
    ],
  },
  bookkeeping: {
    raiseTip: RAISE,
    items: [
      p("month", "Monthly bookkeeping (simple books)", "$150–400 / mo"),
      p("catch", "Catch-up cleanup (per month of backlog)", "$75–150"),
      p("setup", "Chart-of-accounts / QuickBooks setup", "$100–250"),
    ],
  },
  notary: {
    raiseTip: RAISE,
    items: [
      p("stamp", "Standard notarization (where fee-capped)", "State max or $10–25"),
      p("travel", "Mobile travel fee", "$25–75"),
      p("loan", "Loan signing (if commissioned)", "$75–150"),
    ],
  },
  teaching: {
    raiseTip: RAISE,
    items: [
      p("class", "Group class seat", "$15–40 / person"),
      p("private", "Private lesson", "$40–75 / hr"),
      p("pack", "4-class pack", "5–10% off"),
    ],
  },
  consulting: {
    raiseTip: RAISE,
    items: [
      p("call", "Discovery / strategy call (45–60 min)", "$75–150"),
      p("project", "Scoped mini-project", "$300–1,200"),
      p("retainer", "Monthly advisory", "$500–2,000 / mo"),
    ],
  },
  "book-publishing": {
    raiseTip: RAISE,
    items: [
      p("ebook", "Ebook retail price", "$2.99–9.99"),
      p("paper", "Paperback retail", "$9.99–18.99"),
      p("service", "Done-for-you publish package (if offering)", "$300–1,500"),
    ],
  },
  "book-publishing-kids": {
    raiseTip: "Keep prices parent-approved. Examples only.",
    items: [
      p("pdf", "Digital story PDF", "$3–8"),
      p("print", "Printed booklet", "$8–15"),
      p("custom", "Custom dedication page", "+$2–5"),
    ],
  },
  "etsy-store": {
    raiseTip: RAISE,
    items: [
      p("item", "Starter listing price", "2–3× materials + fees + time"),
      p("ship", "Flat shipping add-on", "$4–9 typical domestic"),
      p("bundle", "3-item bundle", "~10% off vs singles"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("tee", "T-shirt retail", "$22–32"),
      p("mug", "Mug retail", "$14–22"),
      p("hoodie", "Hoodie retail", "$35–55"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("month", "Monthly answering plan", "$150–400 / mo"),
      p("overage", "Overage minutes", "$0.75–1.50 / min"),
      p("setup", "Script + CRM setup", "$75–200"),
    ],
  },
  "resume-linkedin-helper": {
    raiseTip: RAISE,
    items: [
      p("resume", "Resume rewrite", "$75–200"),
      p("linkedin", "LinkedIn profile polish", "$50–150"),
      p("bundle", "Resume + LinkedIn bundle", "$120–300"),
    ],
  },
  "google-business-helper": {
    raiseTip: RAISE,
    items: [
      p("setup", "GBP setup / cleanup", "$75–200"),
      p("month", "Monthly post + photo help", "$50–150 / mo"),
      p("review", "Review-request system setup", "$40–100"),
    ],
  },
  "review-response-assistant": {
    raiseTip: RAISE,
    items: [
      p("month", "Monthly review replies", "$75–250 / mo"),
      p("backlog", "Backlog cleanup (per 20 reviews)", "$40–100"),
      p("playbook", "Tone playbook setup", "$50–125"),
    ],
  },
  "community-newsletter-creator": {
    raiseTip: RAISE,
    items: [
      p("issue", "Per newsletter issue", "$50–150"),
      p("month", "Monthly retainer (4 issues)", "$150–500"),
      p("setup", "Template + list setup", "$75–200"),
    ],
  },
  "nonprofit-social-helper": {
    raiseTip: RAISE,
    items: [
      p("week", "Weekly social pack", "$75–200"),
      p("month", "Monthly nonprofit retainer", "$250–800"),
      p("campaign", "Campaign launch pack", "$150–400"),
    ],
  },
  social: {
    raiseTip: RAISE,
    items: [
      p("post", "Single post design + caption", "$25–60"),
      p("week", "Weekly content pack (5 posts)", "$100–250"),
      p("month", "Monthly retainer", "$400–1,200"),
    ],
  },
  "ugc-creator": {
    raiseTip: RAISE,
    items: [
      p("clip", "1 UGC video (15–30s)", "$75–200"),
      p("pack", "3-video pack", "$180–450"),
      p("usage", "Paid usage rights add-on", "+$50–200"),
    ],
  },
  "short-form-video-editor": {
    raiseTip: RAISE,
    items: [
      p("edit", "Per short edit", "$25–75"),
      p("pack", "10 shorts / month", "$200–600"),
      p("rush", "24-hour rush", "+25–50%"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("pct", "Co-host share of booking", "15–25%"),
      p("flat", "Flat per turnover", "$50–120"),
      p("setup", "Listing setup / photo day", "$150–400"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("night", "Overnight house sit", "$40–75 / night"),
      p("day", "Daytime drop-in", "$20–35"),
      p("week", "Week package", "Price 7 nights − 10%"),
    ],
  },
  "porch-package-helper": {
    raiseTip: RAISE,
    items: [
      p("week", "Weekday porch watch", "$25–50 / week"),
      p("trip", "One-off package bring-in", "$8–15"),
      p("vacay", "Vacation week package", "$40–80"),
    ],
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
  "homework-organizer": {
    raiseTip: RAISE,
    items: [
      p("session", "Organize + plan session", "$25–45"),
      p("week", "Weekly check-in", "$40–80 / week"),
      p("setup", "Binder / system setup", "$35–70"),
    ],
  },
  "start-gardening-club": {
    raiseTip: RAISE,
    items: [
      p("meetup", "Hosted meetup", "$5–15 / person or free + tips"),
      p("setup", "Club setup package", "$50–150"),
      p("workshop", "Skill workshop", "$15–40 / person"),
    ],
  },
  "start-book-club": {
    raiseTip: RAISE,
    items: [
      p("host", "Hosted discussion", "Free / tip jar or $5–10"),
      p("setup", "Club launch kit", "$40–100"),
      p("guide", "Custom discussion guide", "$15–40"),
    ],
  },
  "local-resource-list-creator": {
    raiseTip: RAISE,
    items: [
      p("list", "Curated local list (PDF)", "$25–75"),
      p("niche", "Niche pack (schools, seniors, etc.)", "$40–120"),
      p("update", "Quarterly update", "$15–40"),
    ],
  },
  "closet-cleanout-listing": {
    raiseTip: RAISE,
    items: [
      p("session", "Cleanout + list session", "$50–120"),
      p("pct", "Resale listing commission", "20–40% of sold items"),
      p("hour", "Hourly", "$20–35 / hr"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("research", "Lead research package", "$75–200"),
      p("watch", "Monthly auction watch list", "$50–150 / mo"),
      p("consult", "Strategy call", "$75–150"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("setup", "Single agent workflow setup", "$300–1,200"),
      p("month", "Monitoring retainer", "$100–400 / mo"),
      p("train", "Staff training session", "$150–400"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("report", "Zip / niche timing report", "$49–149"),
      p("month", "Monthly timing brief", "$99–299 / mo"),
      p("call", "Strategy call add-on", "$50–100"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("clip", "15–30s promo clip", "$75–250"),
      p("pack", "3-clip campaign", "$200–600"),
      p("script", "Script-only", "$40–100"),
    ],
  },
  "ai-prompt-helper": {
    raiseTip: RAISE,
    items: [
      p("pack", "Prompt pack (10–20 prompts)", "$40–120"),
      p("session", "Live prompt coaching (1 hr)", "$50–125"),
      p("biz", "Business workflow pack", "$100–300"),
    ],
  },
  "ai-peers": {
    raiseTip: RAISE,
    items: [
      p("seat", "Peer session seat", "$10–30"),
      p("host", "Hosted cohort (4 weeks)", "$40–120 / person"),
      p("office", "Office-hours add-on", "$15–40"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("audio", "Per audio hour transcribed", "$30–75"),
      p("notes", "Meeting notes cleanup", "$25–60"),
      p("rush", "Same-day rush", "+50%"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("trip", "Trip research packet", "$40–120"),
      p("day", "Per planned day itinerary", "$15–35"),
      p("rush", "48-hour rush", "+25%"),
    ],
  },
  "online-community-moderator": {
    raiseTip: RAISE,
    items: [
      p("month", "Monthly moderation", "$150–500 / mo"),
      p("hour", "Hourly overflow", "$20–40 / hr"),
      p("setup", "Rules + onboarding setup", "$75–200"),
    ],
  },
  "group-setup-helper": {
    raiseTip: RAISE,
    items: [
      p("setup", "Group / community setup", "$50–150"),
      p("train", "Admin training call", "$40–100"),
      p("month", "Light ongoing help", "$40–120 / mo"),
    ],
  },
  "website-tester": {
    raiseTip: RAISE,
    items: [
      p("test", "Test session + written bugs", "$40–100"),
      p("flow", "Full checkout / signup flow test", "$75–180"),
      p("retest", "Retest after fixes", "$25–60"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("listing", "Per listing (photo + post)", "$10–25"),
      p("day", "Half-day listing blitz", "$60–120"),
      p("pct", "Sale assist commission", "10–20% (agree first)"),
    ],
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
    raiseTip: "Learning goal — parent-approved. Examples only.",
    items: [
      p("chore", "Chore payout toward goal", "$1–5"),
      p("sale", "Small sale item (if any)", "$1–5"),
      p("goal", "Weekly savings target", "Celebrate progress"),
    ],
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
    raiseTip: "Parent-approved. Examples only.",
    items: [
      p("share", "Share / school credit", "Optional tip jar"),
      p("file", "Simple game file (if offered)", "$3–10"),
    ],
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
    raiseTip: RAISE,
    items: [
      p("game", "Mini-game file", "$5–20"),
      p("commission", "Custom game level", "$25–75"),
    ],
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
