/**
 * Prerequisites + tools (with costs & exact URLs) for every Launch / Kids / workshop guide.
 * Outside sources always include a full https link. Prices change — verify on the vendor site.
 */

import { detailedStepsForGuide, isGenericGuideSteps, finalizeGuidePlaybookSteps } from "./guide-detailed-steps";
import { ensureMarketingPlanSteps } from "./guide-marketing-plan";
import {
  FOOD_DELIVERY_EXTERNAL_LINKS,
  FOOD_DELIVERY_PREREQUISITE_EXTRAS,
  FOOD_DELIVERY_PRICING,
  FOOD_DELIVERY_SUPPLIES,
  FOOD_DELIVERY_SURVIVAL_TOOLS,
} from "./food-delivery-guide";
import {
  KIDS_PARTY_GAME_HOST_EXTERNAL_LINKS,
  KIDS_PARTY_GAME_HOST_PREREQUISITE_EXTRAS,
  KIDS_PARTY_GAME_HOST_PRICING,
  KIDS_PARTY_GAME_HOST_SUPPLIES,
  KIDS_PARTY_GAME_HOST_TOOLS,
  kidsPartyGameHostToolsDisclaimer,
} from "./kids-party-game-host-guide";
import {
  LEAD_FOLLOWUP_EXTERNAL_LINKS,
  LEAD_FOLLOWUP_PREREQUISITE_EXTRAS,
  LEAD_FOLLOWUP_PRICING,
  LEAD_FOLLOWUP_SUPPLIES,
  LEAD_FOLLOWUP_TOOLS,
  leadFollowupToolsDisclaimer,
} from "./lead-followup-assistant-guide";
import {
  APPOINTMENT_SETTER_EXTERNAL_LINKS,
  APPOINTMENT_SETTER_PREREQUISITE_EXTRAS,
  APPOINTMENT_SETTER_PRICING,
  APPOINTMENT_SETTER_SUPPLIES,
  APPOINTMENT_SETTER_TOOLS,
  appointmentSetterToolsDisclaimer,
} from "./appointment-setter-guide";
import {
  ONLINE_RESEARCH_ASSISTANT_EXTERNAL_LINKS,
  ONLINE_RESEARCH_ASSISTANT_PREREQUISITE_EXTRAS,
  ONLINE_RESEARCH_ASSISTANT_PRICING,
  ONLINE_RESEARCH_ASSISTANT_SUPPLIES,
  ONLINE_RESEARCH_ASSISTANT_TOOLS,
  onlineResearchAssistantToolsDisclaimer,
} from "./online-research-assistant-guide";
import {
  MOTHERS_HELPER_EXTERNAL_LINKS,
  MOTHERS_HELPER_PREREQUISITE_EXTRAS,
  MOTHERS_HELPER_PRICING,
  MOTHERS_HELPER_SUPPLIES,
  MOTHERS_HELPER_TOOLS,
  mothersHelperToolsDisclaimer,
} from "./mothers-helper-guide";
import {
  CRAFTS_EXTERNAL_LINKS,
  CRAFTS_PREREQUISITE_EXTRAS,
  CRAFTS_PRICING,
  CRAFTS_SUPPLIES,
  CRAFTS_TOOLS,
  craftsToolsDisclaimer,
} from "./crafts-guide";
import {
  LOCAL_CONTENT_PHOTO_EXTERNAL_LINKS,
  LOCAL_CONTENT_PHOTO_PREREQUISITE_EXTRAS,
  LOCAL_CONTENT_PHOTO_PRICING,
  LOCAL_CONTENT_PHOTO_SUPPLIES,
  LOCAL_CONTENT_PHOTO_TOOLS,
  localContentPhotoToolsDisclaimer,
} from "./local-content-photographer-guide";
import {
  PERSONAL_SHOPPER_EXTERNAL_LINKS,
  PERSONAL_SHOPPER_PREREQUISITE_EXTRAS,
  PERSONAL_SHOPPER_PRICING,
  PERSONAL_SHOPPER_SUPPLIES,
  PERSONAL_SHOPPER_TOOLS,
  personalShopperToolsDisclaimer,
} from "./personal-shopper-guide";
import {
  BABYSITTING_EXTERNAL_LINKS,
  BABYSITTING_PREREQUISITE_EXTRAS,
  BABYSITTING_PRICING,
  BABYSITTING_SUPPLIES,
  BABYSITTING_TOOLS,
  babysittingToolsDisclaimer,
} from "./babysitting-guide";
import {
  DIGITAL_PRODUCTS_EXTERNAL_LINKS,
  DIGITAL_PRODUCTS_PREREQUISITE_EXTRAS,
  DIGITAL_PRODUCTS_PRICING,
  DIGITAL_PRODUCTS_SUPPLIES,
  DIGITAL_PRODUCTS_TOOLS,
  digitalProductsToolsDisclaimer,
} from "./digital-products-guide";
import {
  YOUTH_SPORTS_HELPER_EXTERNAL_LINKS,
  YOUTH_SPORTS_HELPER_PREREQUISITE_EXTRAS,
  YOUTH_SPORTS_HELPER_PRICING,
  YOUTH_SPORTS_HELPER_SUPPLIES,
  YOUTH_SPORTS_HELPER_TOOLS,
  youthSportsHelperToolsDisclaimer,
} from "./youth-sports-helper-guide";
import {
  JUNIOR_GIVE_BACK_TEACH_EXTERNAL_LINKS,
  JUNIOR_GIVE_BACK_TEACH_PREREQUISITE_EXTRAS,
  JUNIOR_GIVE_BACK_TEACH_PRICING,
  JUNIOR_GIVE_BACK_TEACH_SUPPLIES,
  JUNIOR_GIVE_BACK_TEACH_TOOLS,
  juniorGiveBackTeachToolsDisclaimer,
} from "./junior-give-back-teach-guide";
import {
  KIDS_KINDNESS_SHARE_EXTERNAL_LINKS,
  KIDS_KINDNESS_SHARE_PREREQUISITE_EXTRAS,
  KIDS_KINDNESS_SHARE_PRICING,
  KIDS_KINDNESS_SHARE_SUPPLIES,
  KIDS_KINDNESS_SHARE_TOOLS,
  kidsKindnessShareToolsDisclaimer,
} from "./kids-kindness-share-guide";
import {
  KIDS_PIGGY_FIRST_GOAL_EXTERNAL_LINKS,
  KIDS_PIGGY_FIRST_GOAL_PREREQUISITE_EXTRAS,
  KIDS_PIGGY_FIRST_GOAL_PRICING,
  KIDS_PIGGY_FIRST_GOAL_SUPPLIES,
  KIDS_PIGGY_FIRST_GOAL_TOOLS,
  kidsPiggyFirstGoalToolsDisclaimer,
} from "./kids-piggy-first-goal-guide";
import {
  ESTATE_SALE_EXTERNAL_LINKS,
  ESTATE_SALE_PREREQUISITE_EXTRAS,
  ESTATE_SALE_PRICING,
  ESTATE_SALE_SUPPLIES,
  ESTATE_SALE_TOOLS,
  estateSaleToolsDisclaimer,
} from "./estate-sale-antique-resales-guide";
import {
  GENEALOGY_EXTERNAL_LINKS,
  GENEALOGY_PREREQUISITE_EXTRAS,
  GENEALOGY_PRICING,
  GENEALOGY_SUPPLIES,
  GENEALOGY_TOOLS,
  genealogyToolsDisclaimer,
} from "./genealogy-family-history-guide";
import {
  RIDESHARE_EXTERNAL_LINKS,
  RIDESHARE_PREREQUISITE_EXTRAS,
  RIDESHARE_PRICING,
  RIDESHARE_SUPPLIES,
  RIDESHARE_TOOLS,
  rideshareToolsDisclaimer,
} from "./rideshare-guide";
import {
  LOCAL_EVENT_CONTENT_EXTERNAL_LINKS,
  LOCAL_EVENT_CONTENT_PREREQUISITE_EXTRAS,
  LOCAL_EVENT_CONTENT_PRICING,
  LOCAL_EVENT_CONTENT_SUPPLIES,
  LOCAL_EVENT_CONTENT_TOOLS,
  localEventContentToolsDisclaimer,
} from "./local-event-content-creator-guide";
import {
  PROPERTY_MGMT_EXTERNAL_LINKS,
  PROPERTY_MGMT_PREREQUISITE_EXTRAS,
  PROPERTY_MGMT_PRICING,
  PROPERTY_MGMT_SUPPLIES,
  PROPERTY_MGMT_TOOLS,
  propertyMgmtToolsDisclaimer,
} from "./property-mgmt-guide";
import {
  JUNIOR_REINVEST_CEO_EXTERNAL_LINKS,
  JUNIOR_REINVEST_CEO_PREREQUISITE_EXTRAS,
  JUNIOR_REINVEST_CEO_PRICING,
  JUNIOR_REINVEST_CEO_SUPPLIES,
  JUNIOR_REINVEST_CEO_TOOLS,
  juniorReinvestCeoToolsDisclaimer,
} from "./junior-reinvest-ceo-guide";
import {
  KIDS_REINVEST_JAR_EXTERNAL_LINKS,
  KIDS_REINVEST_JAR_PREREQUISITE_EXTRAS,
  KIDS_REINVEST_JAR_PRICING,
  KIDS_REINVEST_JAR_SUPPLIES,
  KIDS_REINVEST_JAR_TOOLS,
  kidsReinvestJarToolsDisclaimer,
} from "./kids-reinvest-jar-guide";
import {
  AIRBNB_TURNOVER_CHECKER_EXTERNAL_LINKS,
  AIRBNB_TURNOVER_CHECKER_PREREQUISITE_EXTRAS,
  AIRBNB_TURNOVER_CHECKER_PRICING,
  AIRBNB_TURNOVER_CHECKER_SUPPLIES,
  AIRBNB_TURNOVER_CHECKER_TOOLS,
  airbnbTurnoverCheckerToolsDisclaimer,
} from "./airbnb-turnover-checker-guide";
import {
  type GuideSupplyList,
  suppliesForGuide,
} from "./guide-supplies";
import {
  type GuideSuggestedPricing,
  suggestedPricingForGuide,
} from "./guide-suggested-pricing";
import {
  defaultSuppliesForGuide,
  defaultSuggestedPricingForGuide,
} from "./guide-prep-defaults";
import { hustleById } from "./side-hustle-catalog";
import { kidsGuideById } from "./kids-guides";

export type { GuideSupplyItem, GuideSupplyList } from "./guide-supplies";
export {
  formatSupplyLine,
  suppliesDisclaimer,
  suppliesForGuide,
} from "./guide-supplies";
export type { GuidePricingItem, GuideSuggestedPricing } from "./guide-suggested-pricing";
export {
  formatPricingLine,
  pricingDisclaimer,
  suggestedPricingForGuide,
} from "./guide-suggested-pricing";

export type GuidePrerequisite = {
  id: string;
  label: string;
  detail: string;
};

export type GuideToolCost = {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  costNote: string;
  /** Official product page when the guide names this tool. */
  url?: string;
  /** Other acceptable options (same job). */
  alternatives?: string;
  optional?: boolean;
  /**
   * When false, skip “Free plan available” / “Paid tool” (phone, vacuum, hand tools, etc.).
   * Default true for apps/SaaS like Canva and Hedra.
   */
  planLabelApplicable?: boolean;
};

export type GuideExternalLink = {
  label: string;
  url: string;
  note?: string;
};

export type GuideAuthoredStep = { title: string; desc: string };

export type GuideKit = {
  prerequisites: GuidePrerequisite[];
  tools: GuideToolCost[];
  /** Physical / consumable supplies with estimated costs. */
  supplies?: GuideSupplyList;
  /** Example prices to charge customers. */
  suggestedPricing?: GuideSuggestedPricing;
  /** When set, replaces generic catalog / authored steps for this guide. */
  steps?: GuideAuthoredStep[];
  externalLinks?: GuideExternalLink[];
};

const P = {
  parent: (extra = "Parent or guardian stays nearby for accounts and publishing."): GuidePrerequisite => ({
    id: "parent",
    label: "Parent / guardian nearby",
    detail: extra,
  }),
  account: (label: string, detail: string): GuidePrerequisite => ({
    id: "account",
    label,
    detail,
  }),
  freeMembership: {
    id: "free-member",
    label: "GYSH Free account (or higher)",
    detail: "Guides are not public — sign in with at least a Free membership.",
  } satisfies GuidePrerequisite,
  computer: {
    id: "computer",
    label: "Computer or tablet with internet",
    detail: "Phone-only is possible for some steps; a laptop/desktop is easier for building.",
  } satisfies GuidePrerequisite,
  time: (hours: string): GuidePrerequisite => ({
    id: "time",
    label: "Focused time block",
    detail: hours,
  }),
};

/** Shared vendor catalog — prefer these IDs in GUIDE_TOOL_MAP. */
export const TOOL_CATALOG: Record<string, GuideToolCost> = {
  phone_computer: {
    id: "phone_computer",
    name: "Phone or computer",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Use what you already own · $0 extra to start",
  },
  basic_supplies: {
    id: "basic_supplies",
    name: "Basic job supplies",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Often $0–$25 from home · buy only what the first job needs",
  },
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT",
    freePlanAvailable: true,
    costNote: "Free plan available · Plus ~$20/mo (verify on OpenAI)",
    url: "https://chatgpt.com/",
    alternatives: "Google Gemini (https://gemini.google.com/) works the same for brainstorming and GAME.md drafts",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    freePlanAvailable: true,
    costNote: "Free plan with a Google account · paid Gemini Advanced optional",
    url: "https://gemini.google.com/",
    alternatives: "ChatGPT (https://chatgpt.com/)",
    optional: true,
  },
  antigravity: {
    id: "antigravity",
    name: "Google Antigravity",
    freePlanAvailable: true,
    costNote: "Download from Google · available at no charge for individuals (verify on site)",
    url: "https://antigravity.google/",
    alternatives: "Cursor (https://cursor.com/) if you already use it; Scratch is easier for younger kids",
  },
  cloudflare_pages: {
    id: "cloudflare_pages",
    name: "Cloudflare Pages",
    freePlanAvailable: true,
    costNote: "Free tier for static sites · custom domains + Workers add-ons (verify on Cloudflare)",
    url: "https://pages.cloudflare.com/",
    alternatives: "Do not use WordPress — keep the stack on Cloudflare Pages",
  },
  supabase: {
    id: "supabase",
    name: "Supabase",
    freePlanAvailable: true,
    costNote: "Free tier for auth, DB, and storage · paid as you scale (verify on Supabase)",
    url: "https://supabase.com/",
    optional: true,
  },
  resend: {
    id: "resend",
    name: "Resend",
    freePlanAvailable: true,
    costNote: "Free tier for transactional email · paid as volume grows (verify on Resend)",
    url: "https://resend.com/",
    alternatives: "Use Resend for site/contact email — not a WordPress plugin mailer",
  },
  cursor: {
    id: "cursor",
    name: "Cursor",
    freePlanAvailable: true,
    costNote: "Free Hobby tier available · Pro paid (verify on Cursor)",
    url: "https://cursor.com/",
    alternatives: "Google Antigravity (https://antigravity.google/)",
    optional: true,
  },
  scratch: {
    id: "scratch",
    name: "Scratch (MIT)",
    freePlanAvailable: true,
    costNote: "100% free · parent creates the account",
    url: "https://scratch.mit.edu/",
    alternatives: "For teens ready to code: Antigravity or Cursor instead",
  },
  canva: {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote:
      "Free plan available — sign in at the link, or continue with an account you already have · Pro ~$15–18/mo or ~$120–144/yr (verify on Canva)",
    url: "https://www.canva.com/",
  },
  capcut: {
    id: "capcut",
    name: "CapCut",
    freePlanAvailable: true,
    costNote: "Free plan available · Pro roughly ~$8–10/mo (verify in CapCut / app store)",
    url: "https://www.capcut.com/",
  },
  hedra: {
    id: "hedra",
    name: "Hedra",
    freePlanAvailable: true,
    costNote: "Free credits / trial often available · paid plans roughly ~$15–75/mo (verify on Hedra)",
    url: "https://www.hedra.com/",
  },
  google_docs: {
    id: "google_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote:
      "Free with a Google account — sign in at the link, or continue with an account you already have, then open Docs",
    /** Sign-in first; Google continues into Docs (or Drive if already signed in). */
    url: "https://accounts.google.com/ServiceLogin?continue=https%3A%2F%2Fdocs.google.com%2F",
    alternatives: "Already signed in? Go straight to https://docs.google.com/",
  },
  airdna: {
    id: "airdna",
    name: "AirDNA",
    freePlanAvailable: true,
    costNote: "Free market explore tier · Research/Host plans are paid (verify pricing)",
    url: "https://www.airdna.co/",
  },
  airbnb_host: {
    id: "airbnb_host",
    name: "Airbnb Host",
    freePlanAvailable: true,
    costNote: "Free to list · host service fees on bookings",
    url: "https://www.airbnb.com/host/homes",
  },
  pricelabs: {
    id: "pricelabs",
    name: "PriceLabs",
    freePlanAvailable: false,
    costNote: "Paid dynamic pricing · optional until you have bookings",
    url: "https://hello.pricelabs.co/",
    optional: true,
  },
  wheelhouse: {
    id: "wheelhouse",
    name: "Wheelhouse",
    freePlanAvailable: false,
    costNote: "Paid dynamic pricing alternative to PriceLabs",
    url: "https://usewheelhouse.com/",
    optional: true,
  },
  turnoverbnb: {
    id: "turnoverbnb",
    name: "Turno (formerly TurnoverBnB)",
    freePlanAvailable: true,
    costNote: "Free to start coordinating cleaners · fees may apply for some features",
    url: "https://turno.com/",
    optional: true,
  },
  printify: {
    id: "printify",
    name: "Printify",
    freePlanAvailable: true,
    costNote: "Free to connect · you pay per order when customers buy",
    url: "https://printify.com/",
    alternatives: "Printful (https://www.printful.com/)",
  },
  etsy: {
    id: "etsy",
    name: "Etsy",
    freePlanAvailable: true,
    costNote: "Listing fees + transaction fees on sales (verify on Etsy)",
    url: "https://www.etsy.com/sell",
  },
  shopify: {
    id: "shopify",
    name: "Shopify",
    freePlanAvailable: true,
    costNote: "Trial then ~$29+/mo (verify on Shopify)",
    url: "https://www.shopify.com/",
    optional: true,
  },
  kdp: {
    id: "kdp",
    name: "Amazon KDP",
    freePlanAvailable: true,
    costNote: "Free to publish · print costs deducted from royalties",
    url: "https://kdp.amazon.com/",
  },
  uber_lyft: {
    id: "uber_lyft",
    name: "Uber / Lyft driver apps",
    freePlanAvailable: true,
    costNote: "Free apps · vehicle, insurance, and gas are your costs",
    url: "https://www.uber.com/us/en/drive/",
    alternatives: "Lyft (https://www.lyft.com/driver)",
  },
  doordash: {
    id: "doordash",
    name: "DoorDash Dasher App",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Driver app for offers, navigation, and earnings · vehicle/bike + bag and gas are your costs",
    url: "https://www.doordash.com/dasher/signup/",
    alternatives: "Receive offers, navigate pickups/deliveries, view earnings",
  },
  uber_eats: {
    id: "uber_eats",
    name: "Uber Driver / Uber Eats",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Driver app for offers and upfront trip info · vehicle/bike + bag and gas are your costs",
    url: "https://www.uber.com/us/en/deliver/",
    alternatives: "Upfront earnings, pickup/dropoff, time and distance estimates",
  },
  maps_nav: {
    id: "maps_nav",
    name: "Google Maps / Apple Maps / Waze",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Navigation for pickups and dropoffs",
    url: "https://maps.google.com/",
    alternatives: "Apple Maps, Waze",
  },
  mileage_tracker: {
    id: "mileage_tracker",
    name: "Mileage & expense tracker",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Log miles and expenses from Day 1 · Stride, Everlance, MileIQ, Gridwise, or a spreadsheet",
    url: "https://www.irs.gov/tax-professionals/standard-mileage-rates",
    alternatives: "Stride, Everlance, MileIQ, Gridwise, or Google Sheets",
  },
  handyman_kit: {
    id: "handyman_kit",
    name: "Basic hand tools",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Start with tools you own · starter kit often ~$25–100 if buying",
  },
  zoom: {
    id: "zoom",
    name: "Zoom or Google Meet",
    freePlanAvailable: true,
    costNote: "Google Meet free · Zoom Basic free (time limits on free meetings)",
    url: "https://meet.google.com/",
    alternatives: "Zoom (https://zoom.us/)",
  },
  meetup: {
    id: "meetup",
    name: "Meetup",
    freePlanAvailable: true,
    costNote:
      "Meetup Starter free for eligible first-time organizers (limits apply) · paid organizer plans available (verify on Meetup)",
    url: "https://www.meetup.com/",
    alternatives: "Nextdoor events, Facebook Groups, or a library bulletin board",
  },
  itch: {
    id: "itch",
    name: "itch.io",
    freePlanAvailable: true,
    costNote: "Free to publish demos · optional revenue share if you sell",
    url: "https://itch.io/",
    optional: true,
  },
  meta_business: {
    id: "meta_business",
    name: "Meta Business Suite",
    freePlanAvailable: true,
    costNote: "Free to post · ad spend optional",
    url: "https://business.facebook.com/",
  },
  midjourney: {
    id: "midjourney",
    name: "Midjourney",
    freePlanAvailable: false,
    costNote: "Paid · or use ChatGPT / Canva Magic images instead",
    url: "https://www.midjourney.com/",
    optional: true,
  },
  printer: {
    id: "printer",
    name: "Printer or print shop",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Library / print shop · home printer optional",
    optional: true,
  },
};

const t = (...ids: (keyof typeof TOOL_CATALOG)[]): GuideToolCost[] =>
  ids.map((id) => TOOL_CATALOG[id]);

const DEFAULT_PREREQS: GuidePrerequisite[] = [P.freeMembership, P.computer];

const DEFAULT_TOOLS = t("phone_computer", "basic_supplies");

/** Precise AI game steps — kids path prefers Scratch; Antigravity is optional. */
export const CREATE_GAMES_KIDS_STEPS: GuideAuthoredStep[] = [
  {
    title: "Sit with a parent and open a chat",
    desc: "Parent opens ChatGPT (https://chatgpt.com/) or Gemini (https://gemini.google.com/). Kid does not create the AI account. Tell the chat: “Help us design a tiny game for ages 6–12. Keep it to one screen and 3 levels.”",
  },
  {
    title: "Layout the idea in the chat (copy answers into Docs)",
    desc: "Ask for: (1) game title, (2) hero name (made-up, no real names), (3) one goal, (4) three levels Easy→Hard, (5) how you win or lose. Parent pastes the answers into Google Docs (Tools tab — sign in with Google, or use an account you already have) and saves as GAME-IDEA.",
  },
  {
    title: "Choose the build path (Scratch is easiest)",
    desc: "Recommended for Kids: Scratch (https://scratch.mit.edu/) — free, visual blocks, no install. Optional advanced path: Google Antigravity (https://antigravity.google/) if a parent is ready to run an agentic IDE. Do not skip Scratch unless the parent already knows Antigravity/Cursor.",
  },
  {
    title: "If using Scratch — create the project",
    desc: "Parent creates a Scratch account, starts a new project, and follows Scratch’s Getting Started tips (https://scratch.mit.edu/ideas). Build only: one backdrop, one sprite, and three “levels” as different costumes or messages. No personal info in the project title.",
  },
  {
    title: "If using Antigravity — ask ChatGPT for GAME.md first",
    desc: "In ChatGPT/Gemini paste: “Write a markdown file named GAME.md for Google Antigravity. Include: project goal, folder layout, v1 features only (one HTML canvas mini-game), acceptance tests, and ‘do not add multiplayer.’ Use our GAME-IDEA notes: [paste Docs].” Save the reply as GAME.md on the computer.",
  },
  {
    title: "Run Antigravity with GAME.md (parent only)",
    desc: "Download Antigravity from https://antigravity.google/download . Parent opens a new project folder, drops GAME.md in the root, and asks the agent: “Implement v1 exactly as GAME.md — stop when acceptance tests pass.” Kid playtests; parent reviews every file change.",
  },
  {
    title: "Playtest and share safely",
    desc: "Play at family game night or a school fair with a parent present. Optional: export Scratch or zip the Antigravity build — never publish with real names, school, address, or photos. Track any tips in the Piggy Bank.",
  },
];

export const CREATE_GAMES_JUNIOR_STEPS: GuideAuthoredStep[] = [
  {
    title: "Scope one tiny game in ChatGPT or Gemini",
    desc: "Open https://chatgpt.com/ or https://gemini.google.com/ (guardian-approved). Prompt: “Help me scope a one-level browser game. Ask me questions until we have title, win condition, art style, and a 60-minute build plan.” Save the Q&A in Google Docs (Tools tab — sign in with Google, or use an account you already have).",
  },
  {
    title: "Generate GAME.md for Antigravity (or Cursor)",
    desc: "Prompt: “Write GAME.md for Google Antigravity (https://antigravity.google/) — or Cursor (https://cursor.com/) if I say so. Include: tech = single HTML+JS file or Vite+React, folder layout, v1 features only, acceptance checklist, no accounts/payments.” Download/save GAME.md.",
  },
  {
    title: "Install the builder and drop in GAME.md",
    desc: "Preferred: Antigravity — https://antigravity.google/download . Alternative: Cursor — https://cursor.com/ . Create an empty project folder, add GAME.md, then instruct the agent: “Build v1 per GAME.md; do not expand scope.”",
  },
  {
    title: "Art & dialogue drafts (optional tools)",
    desc: "Concept art: Canva (https://www.canva.com/) or ChatGPT images. Keep assets original — no trademarked characters. Paste short dialogue from the chat, then rewrite in your voice.",
  },
  {
    title: "Playtest, fix one bug, ship a demo",
    desc: "Friends or classmates try it. Fix one crash and one fun upgrade. Optional publish: itch.io (https://itch.io/) only with guardian approval — free demo, no personal data in the page.",
  },
];

const AIRBNB_STEPS: GuideAuthoredStep[] = [
  {
    title: "Market & feasibility audit",
    desc: "Check average occupancy and nightly rates for your ZIP on AirDNA (https://www.airdna.co/). Cross-check local short-term rental rules on your city/county website before you spend on furniture.",
  },
  {
    title: "Secure STR permits & insurance",
    desc: "Apply for local city licenses and buy short-term rental liability insurance. Keep permit PDFs in a Drive folder.",
  },
  {
    title: "Furnish & style",
    desc: "Durable mattress, fast Wi‑Fi, coffee, toiletries, and photo-ready rooms. Buy only what the first listing needs.",
  },
  {
    title: "Photography & listing copy",
    desc: "Hire a real-estate photographer if you can. Create the host listing at https://www.airbnb.com/host/homes with a clear title and house rules.",
  },
  {
    title: "Pricing strategy",
    desc: "Start with AirDNA comps (https://www.airdna.co/). Optional automation later: PriceLabs (https://hello.pricelabs.co/) or Wheelhouse (https://usewheelhouse.com/).",
  },
  {
    title: "Cleaning & messaging",
    desc: "Book a cleaner before the first guest. Optional coordination: Turno (https://turno.com/). Automate check-in codes with a smart lock when ready.",
  },
];

const GUIDE_KITS: Record<string, GuideKit> = {
  airbnb: {
    prerequisites: [
      P.freeMembership,
      {
        id: "property",
        label: "Legal place to host",
        detail: "Owned unit, leased unit with landlord permission, or co-host access — confirm STR rules first.",
      },
      P.time("Plan 2–4 weeks before the first booking."),
    ],
    tools: t("airdna", "airbnb_host", "pricelabs", "wheelhouse", "turnoverbnb", "canva", "google_docs"),
    steps: AIRBNB_STEPS,
    externalLinks: [
      { label: "AirDNA", url: "https://www.airdna.co/", note: "Market occupancy & rates" },
      { label: "Airbnb Host", url: "https://www.airbnb.com/host/homes" },
      { label: "PriceLabs", url: "https://hello.pricelabs.co/", note: "Optional dynamic pricing" },
      { label: "Wheelhouse", url: "https://usewheelhouse.com/", note: "Optional dynamic pricing" },
      { label: "Turno", url: "https://turno.com/", note: "Cleaning coordination" },
    ],
  },
  "create-games-kids": {
    prerequisites: [
      P.freeMembership,
      P.parent("Parent creates every AI / Scratch / Antigravity account. Kid never shares real name, school, or address in chats."),
      P.computer,
      P.time("About 60–90 minutes for v1 on Scratch; longer if using Antigravity."),
    ],
    tools: t("chatgpt", "gemini", "scratch", "antigravity", "google_docs", "canva"),
    steps: CREATE_GAMES_KIDS_STEPS,
    externalLinks: [
      { label: "ChatGPT", url: "https://chatgpt.com/" },
      { label: "Google Gemini", url: "https://gemini.google.com/" },
      { label: "Scratch", url: "https://scratch.mit.edu/", note: "Easiest kids path" },
      { label: "Google Antigravity", url: "https://antigravity.google/" },
      { label: "Antigravity download", url: "https://antigravity.google/download" },
    ],
  },
  "create-games-junior": {
    prerequisites: [
      P.freeMembership,
      P.parent("Guardian approves AI accounts and any itch.io publish."),
      P.computer,
      P.time("One focused afternoon for a one-level prototype."),
    ],
    tools: t("chatgpt", "gemini", "antigravity", "cursor", "canva", "google_docs", "itch"),
    steps: CREATE_GAMES_JUNIOR_STEPS,
    externalLinks: [
      { label: "ChatGPT", url: "https://chatgpt.com/" },
      { label: "Gemini", url: "https://gemini.google.com/" },
      { label: "Antigravity", url: "https://antigravity.google/" },
      { label: "Cursor", url: "https://cursor.com/" },
      { label: "itch.io", url: "https://itch.io/" },
    ],
  },
  "kids-games-ai": {
    prerequisites: [
      P.freeMembership,
      P.parent(),
      P.computer,
    ],
    tools: t("chatgpt", "gemini", "scratch", "antigravity", "google_docs"),
    steps: CREATE_GAMES_KIDS_STEPS,
  },
  "junior-games-ai": {
    prerequisites: [
      P.freeMembership,
      P.parent("Guardian approves tools and publishing."),
      P.computer,
    ],
    tools: t("chatgpt", "gemini", "antigravity", "cursor", "canva", "itch"),
    steps: CREATE_GAMES_JUNIOR_STEPS,
  },
  pod: {
    prerequisites: [P.freeMembership, P.computer, P.time("1–2 weeks to first listings.")],
    tools: t("canva", "printify", "etsy", "shopify", "chatgpt"),
  },
  dropshipping: {
    prerequisites: [P.freeMembership, P.computer, P.account("Ad budget ready", "Plan a small test budget ($20–50/day) only after product samples.")],
    tools: t("shopify", "canva", "capcut", "meta_business", "chatgpt"),
  },
  "digital-products": {
    prerequisites: [P.freeMembership, ...DIGITAL_PRODUCTS_PREREQUISITE_EXTRAS],
    tools: [...DIGITAL_PRODUCTS_TOOLS, ...t("phone_computer")],
    externalLinks: DIGITAL_PRODUCTS_EXTERNAL_LINKS,
    supplies: DIGITAL_PRODUCTS_SUPPLIES,
    suggestedPricing: DIGITAL_PRODUCTS_PRICING,
  },
  babysitting: {
    prerequisites: [P.freeMembership, ...BABYSITTING_PREREQUISITE_EXTRAS],
    tools: [...BABYSITTING_TOOLS, ...t("phone_computer")],
    externalLinks: BABYSITTING_EXTERNAL_LINKS,
    supplies: BABYSITTING_SUPPLIES,
    suggestedPricing: BABYSITTING_PRICING,
  },
  affiliate: {
    prerequisites: [P.freeMembership, P.computer],
    tools: t("canva", "chatgpt", "meta_business", "google_docs"),
  },
  amazon: {
    prerequisites: [P.freeMembership, P.account("Startup capital", "FBA needs inventory budget — not a $0 start.")],
    tools: t("google_docs", "canva"),
  },
  social: {
    prerequisites: [P.freeMembership, P.computer],
    tools: t("canva", "capcut", "chatgpt", "meta_business"),
  },
  "web-leads": {
    prerequisites: [P.freeMembership, P.computer],
    tools: t("chatgpt", "antigravity", "cloudflare_pages", "supabase", "resend", "canva", "google_docs"),
  },
  "ai-assets": {
    prerequisites: [P.freeMembership, P.computer, P.time("Pro membership required for this AI guide.")],
    tools: t("chatgpt", "gemini", "canva", "midjourney", "antigravity"),
  },
  "ai-agents": {
    prerequisites: [P.freeMembership, P.computer],
    tools: t("chatgpt", "gemini", "antigravity", "cursor", "google_docs"),
  },
  "ai-timing": {
    prerequisites: [P.freeMembership, P.computer],
    tools: t("chatgpt", "gemini", "google_docs"),
  },
  "ai-promo-video": {
    prerequisites: [P.freeMembership, P.computer, P.time("90 minutes for a first promo cut.")],
    tools: t("chatgpt", "hedra", "capcut", "canva"),
  },
  "ai-social-helper": {
    prerequisites: [P.freeMembership, P.computer],
    tools: t("chatgpt", "gemini", "canva", "meta_business"),
  },
  "ai-prompt-helper": {
    prerequisites: [P.freeMembership, P.computer],
    tools: t("chatgpt", "gemini", "google_docs"),
  },
  "ai-peers": {
    prerequisites: [P.freeMembership, P.computer],
    tools: t("chatgpt", "gemini", "zoom", "google_docs"),
  },
  "local-business-ai-setup": {
    prerequisites: [P.freeMembership, P.computer],
    tools: t("chatgpt", "gemini", "google_docs", "canva"),
  },
  "property-mgmt": {
    prerequisites: [P.freeMembership, ...PROPERTY_MGMT_PREREQUISITE_EXTRAS],
    tools: [...PROPERTY_MGMT_TOOLS, ...t("phone_computer")],
    externalLinks: PROPERTY_MGMT_EXTERNAL_LINKS,
    supplies: PROPERTY_MGMT_SUPPLIES,
    suggestedPricing: PROPERTY_MGMT_PRICING,
  },
  handyman: {
    prerequisites: [P.freeMembership, { id: "transport", label: "Way to reach local jobs", detail: "Walk, bike, or parent-driven for youth." }],
    tools: t("phone_computer"),
  },
  "cleaning-service": {
    prerequisites: [
      P.freeMembership,
      { id: "transport", label: "Way to reach client homes", detail: "Car, bike, or rideshare — confirm parking with the client." },
    ],
    tools: t("phone_computer", "google_docs"),
  },
  "handyman-light": {
    prerequisites: [P.freeMembership],
    tools: t("phone_computer"),
  },
  rideshare: {
    prerequisites: [P.freeMembership, ...RIDESHARE_PREREQUISITE_EXTRAS],
    tools: [...RIDESHARE_TOOLS, ...t("phone_computer")],
    externalLinks: RIDESHARE_EXTERNAL_LINKS,
    supplies: RIDESHARE_SUPPLIES,
    suggestedPricing: RIDESHARE_PRICING,
  },
  "food-delivery": {
    prerequisites: [P.freeMembership, ...FOOD_DELIVERY_PREREQUISITE_EXTRAS],
    tools: [
      ...t("doordash", "uber_eats", "maps_nav", "mileage_tracker", "phone_computer"),
      ...FOOD_DELIVERY_SURVIVAL_TOOLS,
    ],
    externalLinks: FOOD_DELIVERY_EXTERNAL_LINKS,
    supplies: FOOD_DELIVERY_SUPPLIES,
    suggestedPricing: FOOD_DELIVERY_PRICING,
  },
  "estate-sale-listing-helper": {
    prerequisites: [P.freeMembership, ...ESTATE_SALE_PREREQUISITE_EXTRAS],
    tools: [...ESTATE_SALE_TOOLS, ...t("canva", "phone_computer")],
    externalLinks: ESTATE_SALE_EXTERNAL_LINKS,
    supplies: ESTATE_SALE_SUPPLIES,
    suggestedPricing: ESTATE_SALE_PRICING,
  },
  "kids-party-game-host": {
    prerequisites: [P.freeMembership, ...KIDS_PARTY_GAME_HOST_PREREQUISITE_EXTRAS],
    tools: [...KIDS_PARTY_GAME_HOST_TOOLS, ...t("canva", "phone_computer")],
    externalLinks: KIDS_PARTY_GAME_HOST_EXTERNAL_LINKS,
    supplies: KIDS_PARTY_GAME_HOST_SUPPLIES,
    suggestedPricing: KIDS_PARTY_GAME_HOST_PRICING,
  },
  "lead-followup-assistant": {
    prerequisites: [P.freeMembership, ...LEAD_FOLLOWUP_PREREQUISITE_EXTRAS],
    tools: [...LEAD_FOLLOWUP_TOOLS, ...t("phone_computer")],
    externalLinks: LEAD_FOLLOWUP_EXTERNAL_LINKS,
    supplies: LEAD_FOLLOWUP_SUPPLIES,
    suggestedPricing: LEAD_FOLLOWUP_PRICING,
  },
  "appointment-setter": {
    prerequisites: [P.freeMembership, ...APPOINTMENT_SETTER_PREREQUISITE_EXTRAS],
    tools: [...APPOINTMENT_SETTER_TOOLS, ...t("phone_computer")],
    externalLinks: APPOINTMENT_SETTER_EXTERNAL_LINKS,
    supplies: APPOINTMENT_SETTER_SUPPLIES,
    suggestedPricing: APPOINTMENT_SETTER_PRICING,
  },
  "online-research-assistant": {
    prerequisites: [P.freeMembership, ...ONLINE_RESEARCH_ASSISTANT_PREREQUISITE_EXTRAS],
    tools: [...ONLINE_RESEARCH_ASSISTANT_TOOLS, ...t("phone_computer")],
    externalLinks: ONLINE_RESEARCH_ASSISTANT_EXTERNAL_LINKS,
    supplies: ONLINE_RESEARCH_ASSISTANT_SUPPLIES,
    suggestedPricing: ONLINE_RESEARCH_ASSISTANT_PRICING,
  },
  "mothers-helper": {
    prerequisites: [P.freeMembership, ...MOTHERS_HELPER_PREREQUISITE_EXTRAS],
    tools: [...MOTHERS_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: MOTHERS_HELPER_EXTERNAL_LINKS,
    supplies: MOTHERS_HELPER_SUPPLIES,
    suggestedPricing: MOTHERS_HELPER_PRICING,
  },
  crafts: {
    prerequisites: [P.freeMembership, ...CRAFTS_PREREQUISITE_EXTRAS],
    tools: [...CRAFTS_TOOLS, ...t("phone_computer")],
    externalLinks: CRAFTS_EXTERNAL_LINKS,
    supplies: CRAFTS_SUPPLIES,
    suggestedPricing: CRAFTS_PRICING,
  },
  "local-content-photographer": {
    prerequisites: [P.freeMembership, ...LOCAL_CONTENT_PHOTO_PREREQUISITE_EXTRAS],
    tools: [...LOCAL_CONTENT_PHOTO_TOOLS, ...t("canva", "phone_computer")],
    externalLinks: LOCAL_CONTENT_PHOTO_EXTERNAL_LINKS,
    supplies: LOCAL_CONTENT_PHOTO_SUPPLIES,
    suggestedPricing: LOCAL_CONTENT_PHOTO_PRICING,
  },
  "personal-shopper": {
    prerequisites: [P.freeMembership, ...PERSONAL_SHOPPER_PREREQUISITE_EXTRAS],
    tools: [...PERSONAL_SHOPPER_TOOLS, ...t("phone_computer")],
    externalLinks: PERSONAL_SHOPPER_EXTERNAL_LINKS,
    supplies: PERSONAL_SHOPPER_SUPPLIES,
    suggestedPricing: PERSONAL_SHOPPER_PRICING,
  },
  "youth-sports-helper": {
    prerequisites: [P.freeMembership, ...YOUTH_SPORTS_HELPER_PREREQUISITE_EXTRAS],
    tools: [...YOUTH_SPORTS_HELPER_TOOLS, ...t("phone_computer")],
    externalLinks: YOUTH_SPORTS_HELPER_EXTERNAL_LINKS,
    supplies: YOUTH_SPORTS_HELPER_SUPPLIES,
    suggestedPricing: YOUTH_SPORTS_HELPER_PRICING,
  },
  "junior-give-back-teach": {
    prerequisites: [P.freeMembership, ...JUNIOR_GIVE_BACK_TEACH_PREREQUISITE_EXTRAS],
    tools: [...JUNIOR_GIVE_BACK_TEACH_TOOLS, ...t("phone_computer")],
    externalLinks: JUNIOR_GIVE_BACK_TEACH_EXTERNAL_LINKS,
    supplies: JUNIOR_GIVE_BACK_TEACH_SUPPLIES,
    suggestedPricing: JUNIOR_GIVE_BACK_TEACH_PRICING,
  },
  "kids-kindness-share": {
    prerequisites: [P.freeMembership, ...KIDS_KINDNESS_SHARE_PREREQUISITE_EXTRAS],
    tools: [...KIDS_KINDNESS_SHARE_TOOLS, ...t("phone_computer")],
    externalLinks: KIDS_KINDNESS_SHARE_EXTERNAL_LINKS,
    supplies: KIDS_KINDNESS_SHARE_SUPPLIES,
    suggestedPricing: KIDS_KINDNESS_SHARE_PRICING,
  },
  "kids-piggy-first-goal": {
    prerequisites: [P.freeMembership, ...KIDS_PIGGY_FIRST_GOAL_PREREQUISITE_EXTRAS],
    tools: [...KIDS_PIGGY_FIRST_GOAL_TOOLS, ...t("phone_computer")],
    externalLinks: KIDS_PIGGY_FIRST_GOAL_EXTERNAL_LINKS,
    supplies: KIDS_PIGGY_FIRST_GOAL_SUPPLIES,
    suggestedPricing: KIDS_PIGGY_FIRST_GOAL_PRICING,
  },
  "family-history-organizer": {
    prerequisites: [P.freeMembership, ...GENEALOGY_PREREQUISITE_EXTRAS],
    tools: [...GENEALOGY_TOOLS, ...t("phone_computer")],
    externalLinks: GENEALOGY_EXTERNAL_LINKS,
    supplies: GENEALOGY_SUPPLIES,
    suggestedPricing: GENEALOGY_PRICING,
  },
  "local-event-content-creator": {
    prerequisites: [P.freeMembership, ...LOCAL_EVENT_CONTENT_PREREQUISITE_EXTRAS],
    tools: [...LOCAL_EVENT_CONTENT_TOOLS, ...t("phone_computer")],
    externalLinks: LOCAL_EVENT_CONTENT_EXTERNAL_LINKS,
    supplies: LOCAL_EVENT_CONTENT_SUPPLIES,
    suggestedPricing: LOCAL_EVENT_CONTENT_PRICING,
  },
  "junior-reinvest-ceo": {
    prerequisites: [P.freeMembership, ...JUNIOR_REINVEST_CEO_PREREQUISITE_EXTRAS],
    tools: [...JUNIOR_REINVEST_CEO_TOOLS, ...t("phone_computer")],
    externalLinks: JUNIOR_REINVEST_CEO_EXTERNAL_LINKS,
    supplies: JUNIOR_REINVEST_CEO_SUPPLIES,
    suggestedPricing: JUNIOR_REINVEST_CEO_PRICING,
  },
  "kids-reinvest-jar": {
    prerequisites: [P.freeMembership, ...KIDS_REINVEST_JAR_PREREQUISITE_EXTRAS],
    tools: [...KIDS_REINVEST_JAR_TOOLS, ...t("phone_computer")],
    externalLinks: KIDS_REINVEST_JAR_EXTERNAL_LINKS,
    supplies: KIDS_REINVEST_JAR_SUPPLIES,
    suggestedPricing: KIDS_REINVEST_JAR_PRICING,
  },
  "airbnb-turnover-checker": {
    prerequisites: [P.freeMembership, ...AIRBNB_TURNOVER_CHECKER_PREREQUISITE_EXTRAS],
    tools: [...AIRBNB_TURNOVER_CHECKER_TOOLS, ...t("phone_computer")],
    externalLinks: AIRBNB_TURNOVER_CHECKER_EXTERNAL_LINKS,
    supplies: AIRBNB_TURNOVER_CHECKER_SUPPLIES,
    suggestedPricing: AIRBNB_TURNOVER_CHECKER_PRICING,
  },
  "book-publishing": {
    prerequisites: [P.freeMembership, P.computer],
    tools: t("chatgpt", "canva", "kdp", "google_docs"),
  },
  "canva-flyer-creator": {
    prerequisites: [P.freeMembership, P.computer],
    tools: t("canva", "phone_computer", "google_docs"),
  },
};

const GUIDE_TOOL_MAP: Record<string, (keyof typeof TOOL_CATALOG)[]> = {
  dog_walk: ["phone_computer", "basic_supplies"],
};

for (const [id, keys] of Object.entries({
  "friendship-bracelet-maker": ["phone_computer", "canva"],
  "beach-shell-jewelry": ["phone_computer", "canva"],
  "greeting-card-creator": ["canva", "phone_computer", "google_docs"],
  "basic-invitation-creator": ["canva", "phone_computer", "google_docs"],
  "digital-cookbook-creator": ["canva", "chatgpt", "google_docs"],
  "family-photo-slideshow": ["canva", "capcut", "phone_computer"],
  "gift-wrapping": ["phone_computer"],
  "lemonade-stand": ["phone_computer", "canva"],
  "toy-organizer": ["phone_computer"],
  "dog-walk": ["phone_computer"],
  "pet-sitting": ["phone_computer"],
  crafts: ["phone_computer", "canva"],
  "yard-help": ["phone_computer"],
  tutoring: ["phone_computer", "zoom", "google_docs"],
  proofreader: ["phone_computer", "google_docs", "chatgpt"],
  homework: ["phone_computer", "google_docs"],
  "tech-helper": ["phone_computer"],
  "errand-runner": ["phone_computer"],
  "trash-can-service": ["phone_computer"],
  "leaf-raking": ["phone_computer"],
  "car-interior-cleanup": ["phone_computer"],
  "neighborhood-helper": ["phone_computer", "canva"],
  "holiday-decorating-helper": ["phone_computer"],
  "recycling-helper": ["phone_computer"],
  "vacation-mail-plant-helper": ["phone_computer"],
  "plant-watering": ["phone_computer"],
  "garage-sale-helper": ["phone_computer"],
  "start-gardening-club": ["meetup", "canva", "google_docs", "phone_computer"],
} as Record<string, (keyof typeof TOOL_CATALOG)[]>)) {
  if (!GUIDE_KITS[id]) {
    GUIDE_KITS[id] = {
      prerequisites: [...DEFAULT_PREREQS],
      tools: t(...keys),
    };
  }
}

void GUIDE_TOOL_MAP;

/** Apps / accounts only — physical buys live on the Supply list. */
const PHYSICAL_TOOL_IDS = new Set([
  "basic_supplies",
  "handyman_kit",
  "printer",
]);

function toolsWithoutSupplyDupes(
  tools: GuideToolCost[],
  hasSupplies: boolean,
): GuideToolCost[] {
  return tools.filter((tool) => {
    if (PHYSICAL_TOOL_IDS.has(tool.id)) return false;
    // When a supply list exists, keep phone + software; drop vague “basic supplies”.
    if (hasSupplies && tool.id === "basic_supplies") return false;
    return true;
  });
}

/** When steps mention Google Docs, always surface it on the Tools tab with the sign-in link. */
export function ensureGoogleDocsTool(
  tools: GuideToolCost[],
  steps?: { title?: string; desc?: string; body?: string }[],
): GuideToolCost[] {
  const blob = (steps ?? [])
    .map((s) => `${s.title ?? ""} ${s.desc ?? ""} ${s.body ?? ""}`)
    .join("\n");
  const mentionsDocs = /google\s*docs?/i.test(blob);
  if (!mentionsDocs) return tools;
  const fresh = TOOL_CATALOG.google_docs;
  if (tools.some((t) => t.id === "google_docs")) {
    return tools.map((t) => (t.id === "google_docs" ? { ...fresh } : t));
  }
  return [...tools, { ...fresh }];
}

/** When steps mention Canva, always surface it on the Tools tab. */
export function ensureCanvaTool(
  tools: GuideToolCost[],
  steps?: { title?: string; desc?: string; body?: string }[],
): GuideToolCost[] {
  const blob = (steps ?? [])
    .map((s) => `${s.title ?? ""} ${s.desc ?? ""} ${s.body ?? ""}`)
    .join("\n");
  if (!/\bcanva\b/i.test(blob)) return tools;
  const fresh = TOOL_CATALOG.canva;
  if (tools.some((t) => t.id === "canva")) {
    return tools.map((t) => (t.id === "canva" ? { ...fresh } : t));
  }
  return [...tools, { ...fresh }];
}

function ensureMentionedAppTools(
  tools: GuideToolCost[],
  steps?: { title?: string; desc?: string; body?: string }[],
): GuideToolCost[] {
  return ensureCanvaTool(ensureGoogleDocsTool(tools, steps), steps);
}

/** Delivery-driver kits: no free-plan pitches; drop marketing app injects. */
function finalizeDeliveryDriverTools(guideId: string, tools: GuideToolCost[]): GuideToolCost[] {
  if (guideId !== "food-delivery" && guideId !== "rideshare") return tools;
  const skip = new Set(["google_docs", "canva", "chatgpt", "phone_computer"]);
  return tools
    .filter((t) => !skip.has(t.id))
    .map((t) => ({ ...t, planLabelApplicable: false }));
}

/** Full kit for any guide / hustle / kids-guide id. */
export function guideKitForId(guideId: string): GuideKit {
  const base = GUIDE_KITS[guideId] ?? {
    prerequisites: [...DEFAULT_PREREQS],
    tools: DEFAULT_TOOLS,
  };
  const supplies = base.supplies ?? suppliesForGuide(guideId) ?? defaultSuppliesForGuide(guideId);
  const suggestedPricing =
    base.suggestedPricing ?? suggestedPricingForGuide(guideId) ?? defaultSuggestedPricingForGuide(guideId);
  let tools = toolsWithoutSupplyDupes(base.tools, Boolean(supplies?.items.length));
  let kit: GuideKit = { ...base, tools };
  if (supplies?.items?.length) kit = { ...kit, supplies };
  if (suggestedPricing?.items?.length) kit = { ...kit, suggestedPricing };
  const hustle = hustleById(guideId);
  const kids = hustle ? undefined : kidsGuideById(guideId);
  const audiences =
    hustle?.audiences ??
    (kids
      ? kids.audience === "junior"
        ? (["junior"] as const)
        : (["kids"] as const)
      : undefined);

  const withMarketing = (raw: { title: string; desc: string }[]) =>
    finalizeGuidePlaybookSteps(
      guideId,
      ensureMarketingPlanSteps(raw, guideId),
      { audiences },
    );

  const finish = (next: GuideKit): GuideKit => ({
    ...next,
    tools: finalizeDeliveryDriverTools(guideId, next.tools),
  });

  const detailed = detailedStepsForGuide(guideId, { audiences });
  if (detailed?.length) {
    const steps = finalizeGuidePlaybookSteps(
      guideId,
      ensureMarketingPlanSteps(detailed, guideId),
      { audiences },
    );
    tools = ensureMentionedAppTools(tools, steps);
    return finish({ ...kit, tools, steps });
  }
  /** Prefer authored kit playbooks (e.g. AI games with ChatGPT/Scratch URLs) over short Kids Corner teasers. */
  if (kit.steps?.length && !isGenericGuideSteps(kit.steps)) {
    const steps = withMarketing(kit.steps.map((s) => ({ title: s.title, desc: s.desc })));
    return finish({ ...kit, tools: ensureMentionedAppTools(tools, steps), steps });
  }
  if (kids?.steps?.length) {
    const steps = withMarketing(kids.steps.map((s) => ({ title: s.title, desc: s.body })));
    return finish({ ...kit, tools: ensureMentionedAppTools(tools, steps), steps });
  }
  if (kit.steps?.length && isGenericGuideSteps(kit.steps)) {
    const steps = withMarketing([]);
    return finish({ ...kit, tools: ensureMentionedAppTools(tools, steps), steps });
  }
  if (kit.steps?.length) {
    const steps = withMarketing(kit.steps.map((s) => ({ title: s.title, desc: s.desc })));
    return finish({ ...kit, tools: ensureMentionedAppTools(tools, steps), steps });
  }
  const steps = withMarketing([]);
  return finish({ ...kit, tools: ensureMentionedAppTools(tools, steps), steps });
}

/** @deprecated Prefer guideKitForId — kept for existing imports. */
export function toolsForGuide(guideId: string): GuideToolCost[] {
  return guideKitForId(guideId).tools;
}

export function formatGuideToolLine(tool: GuideToolCost): string {
  const opt = tool.optional ? " (optional)" : "";
  const showPlan = tool.planLabelApplicable !== false;
  const plan = showPlan
    ? tool.freePlanAvailable
      ? "Free plan available — start here; upgrade only if you need it"
      : "Paid tool"
    : null;
  const planBit = plan ? ` — ${plan}.` : " —";
  const link = tool.url ? ` · ${tool.url}` : "";
  const alt = tool.alternatives ? ` · Alternatives: ${tool.alternatives}` : "";
  return `${tool.name}${opt}${planBit} ${tool.costNote}${link}${alt}`;
}

export function guideToolsDisclaimer(): string {
  return "Vendor prices are estimates. Check the vendor site for current pricing. Start on the free plan where available (Canva, Hedra, CapCut, ChatGPT, and similar) and upgrade only when/if you need it.";
}

/** Tools blurb for delivery-driver guides — apps are standard for drivers (no free-plan pitch). */
export function deliveryDriverToolsDisclaimer(): string {
  return "Driver apps and navigation are standard for this hustle. Your real costs are vehicle/bike use, fuel, and any gear you buy — check the Supply List for purchase items.";
}

export {
  estateSaleToolsDisclaimer,
  genealogyToolsDisclaimer,
  kidsPartyGameHostToolsDisclaimer,
  leadFollowupToolsDisclaimer,
  localContentPhotoToolsDisclaimer,
  personalShopperToolsDisclaimer,
  youthSportsHelperToolsDisclaimer,
  juniorGiveBackTeachToolsDisclaimer,
  kidsKindnessShareToolsDisclaimer,
  kidsPiggyFirstGoalToolsDisclaimer,
  appointmentSetterToolsDisclaimer,
  onlineResearchAssistantToolsDisclaimer,
  mothersHelperToolsDisclaimer,
  craftsToolsDisclaimer,
  babysittingToolsDisclaimer,
  digitalProductsToolsDisclaimer,
  rideshareToolsDisclaimer,
  localEventContentToolsDisclaimer,
  propertyMgmtToolsDisclaimer,
  juniorReinvestCeoToolsDisclaimer,
  kidsReinvestJarToolsDisclaimer,
  airbnbTurnoverCheckerToolsDisclaimer,
};

export function prerequisitesDisclaimer(): string {
  return "Complete every prerequisite before step 1. Tools are listed separately so you know what to install or open.";
}
