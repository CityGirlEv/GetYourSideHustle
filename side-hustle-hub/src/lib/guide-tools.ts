/**
 * Prerequisites + tools (with costs & exact URLs) for every Launch / Kids / workshop guide.
 * Outside sources always include a full https link. Prices change — verify on the vendor site.
 */

import { detailedStepsForGuide, isGenericGuideSteps, ensureGuideFoundationSteps, guideUsesSavingsFoundation } from "./guide-detailed-steps";
import {
  type GuideSupplyList,
  suppliesForGuide,
} from "./guide-supplies";
import {
  type GuideSuggestedPricing,
  suggestedPricingForGuide,
} from "./guide-suggested-pricing";
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
    costNote: "Free plan available · Pro ~$15–18/mo or ~$120–144/yr (verify on Canva)",
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
    name: "Google Docs / Drive",
    freePlanAvailable: true,
    costNote: "Free with a Google account",
    url: "https://docs.google.com/",
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
    name: "DoorDash / Uber Eats",
    freePlanAvailable: true,
    costNote: "Free apps · bike/scooter/car + bag (~$0–$40)",
    url: "https://www.doordash.com/dasher/signup/",
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
    desc: "Ask for: (1) game title, (2) hero name (made-up, no real names), (3) one goal, (4) three levels Easy→Hard, (5) how you win or lose. Parent pastes the answers into Google Docs (https://docs.google.com/) and saves as GAME-IDEA.",
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
    desc: "Open https://chatgpt.com/ or https://gemini.google.com/ (guardian-approved). Prompt: “Help me scope a one-level browser game. Ask me questions until we have title, win condition, art style, and a 60-minute build plan.” Save the Q&A in Google Docs.",
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
    prerequisites: [P.freeMembership, P.computer],
    tools: t("canva", "chatgpt", "google_docs", "etsy", "shopify"),
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
    prerequisites: [P.freeMembership, P.computer],
    tools: t("airbnb_host", "google_docs", "canva", "airdna"),
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
    prerequisites: [
      P.freeMembership,
      { id: "license", label: "Valid driver’s license & eligible vehicle", detail: "Meet Uber/Lyft local requirements." },
    ],
    tools: t("uber_lyft", "phone_computer"),
  },
  "food-delivery": {
    prerequisites: [P.freeMembership],
    tools: t("doordash", "phone_computer"),
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

/** Full kit for any guide / hustle / kids-guide id. */
export function guideKitForId(guideId: string): GuideKit {
  const base = GUIDE_KITS[guideId] ?? {
    prerequisites: [...DEFAULT_PREREQS],
    tools: DEFAULT_TOOLS,
  };
  const supplies = base.supplies ?? suppliesForGuide(guideId);
  const suggestedPricing = base.suggestedPricing ?? suggestedPricingForGuide(guideId);
  const tools = toolsWithoutSupplyDupes(base.tools, Boolean(supplies?.items.length));
  let kit: GuideKit = { ...base, tools };
  if (supplies) kit = { ...kit, supplies };
  if (suggestedPricing) kit = { ...kit, suggestedPricing };
  const hustle = hustleById(guideId);
  const kids = hustle ? undefined : kidsGuideById(guideId);
  const audiences =
    hustle?.audiences ??
    (kids
      ? kids.audience === "junior"
        ? (["junior"] as const)
        : (["kids"] as const)
      : undefined);
  const detailed = detailedStepsForGuide(guideId, { audiences });
  if (detailed?.length) {
    return { ...kit, steps: detailed };
  }
  if (kids?.steps?.length) {
    return {
      ...kit,
      steps: ensureGuideFoundationSteps(
        kids.steps.map((s) => ({ title: s.title, desc: s.body })),
        {
          audiences,
          foundation: guideUsesSavingsFoundation(guideId) ? "savings" : "business",
        },
      ),
    };
  }
  if (kit.steps?.length && isGenericGuideSteps(kit.steps)) {
    return { ...kit, steps: undefined };
  }
  if (kit.steps?.length) {
    return {
      ...kit,
      steps: ensureGuideFoundationSteps(
        kit.steps.map((s) => ({ title: s.title, desc: s.desc })),
        {
          audiences,
          foundation: guideUsesSavingsFoundation(guideId) ? "savings" : "business",
        },
      ),
    };
  }
  return kit;
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

export function prerequisitesDisclaimer(): string {
  return "Complete every prerequisite before step 1. Tools are listed separately so you know what to install or open.";
}
