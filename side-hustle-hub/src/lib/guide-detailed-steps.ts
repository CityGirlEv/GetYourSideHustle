/**
 * Hustle-specific step-by-step guides — replaces generic catalog launchSteps.
 * Every step names real tools, clicks, and https links where relevant.
 */

import { FOOD_DELIVERY_DETAILED_STEPS } from "./food-delivery-guide";
import { ESTATE_SALE_DETAILED_STEPS } from "./estate-sale-antique-resales-guide";
import { KIDS_PARTY_GAME_HOST_DETAILED_STEPS } from "./kids-party-game-host-guide";
import { LEAD_FOLLOWUP_DETAILED_STEPS } from "./lead-followup-assistant-guide";
import { LOCAL_CONTENT_PHOTO_DETAILED_STEPS } from "./local-content-photographer-guide";
import { LOCAL_EVENT_CONTENT_DETAILED_STEPS } from "./local-event-content-creator-guide";
import { APPOINTMENT_SETTER_DETAILED_STEPS } from "./appointment-setter-guide";
import { ONLINE_RESEARCH_ASSISTANT_DETAILED_STEPS } from "./online-research-assistant-guide";
import { MOTHERS_HELPER_DETAILED_STEPS } from "./mothers-helper-guide";
import { CRAFTS_DETAILED_STEPS } from "./crafts-guide";
import { BEACH_SHELL_JEWELRY_DETAILED_STEPS } from "./beach-shell-jewelry-guide";
import { GIFT_WRAPPING_DETAILED_STEPS } from "./gift-wrapping-guide";
import { AFFILIATE_DETAILED_STEPS } from "./affiliate-guide";
import { DROPSHIPPING_DETAILED_STEPS } from "./dropshipping-guide";
import { FB_MARKETPLACE_HELPER_DETAILED_STEPS } from "./fb-marketplace-helper-guide";
import { PORCH_PACKAGE_DETAILED_STEPS } from "./porch-package-helper-guide";
import { TRAVEL_RESEARCH_DETAILED_STEPS } from "./travel-research-assistant-guide";
import { TRANSCRIPTION_NOTES_DETAILED_STEPS } from "./transcription-notes-helper-guide";
import { WEBSITE_TESTER_DETAILED_STEPS } from "./website-tester-guide";
import { COMMUNITY_NEWSLETTER_DETAILED_STEPS } from "./community-newsletter-creator-guide";
import { COMMUNITY_TEACHING_DETAILED_STEPS } from "./community-teaching-workshops-guide";
import { REVIEW_RESPONSE_DETAILED_STEPS } from "./review-response-assistant-guide";
import { CAREER_CONSULTING_DETAILED_STEPS } from "./career-industry-consulting-guide";
import { PART_TIME_NOTARY_DETAILED_STEPS } from "./part-time-notary-guide";
import { RESUME_LINKEDIN_DETAILED_STEPS } from "./resume-linkedin-helper-guide";
import { SHORT_FORM_VIDEO_DETAILED_STEPS } from "./short-form-video-editor-guide";
import { GBP_HELPER_DETAILED_STEPS } from "./google-business-profile-helper-guide";
import { UGC_CREATOR_DETAILED_STEPS } from "./ugc-creator-guide";
import { VIRTUAL_ASSISTANT_DETAILED_STEPS } from "./virtual-assistant-guide";
import { VIRTUAL_RECEPTIONIST_DETAILED_STEPS } from "./virtual-receptionist-guide";
import { SOCIAL_INFLUENCER_DETAILED_STEPS } from "./social-influencer-guide";
import { COMMUNITY_MODERATOR_DETAILED_STEPS } from "./online-community-moderator-guide";
import { BASIC_INVITATION_DETAILED_STEPS } from "./basic-invitation-creator-guide";
import { POD_DETAILED_STEPS } from "./pod-guide";
import { PET_SITTING_DETAILED_STEPS } from "./pet-sitting-guide";
import { HANDYMAN_DETAILED_STEPS } from "./handyman-guide";
import { FRIENDSHIP_BRACELET_DETAILED_STEPS } from "./friendship-bracelet-maker-guide";
import { LEAF_RAKING_DETAILED_STEPS } from "./leaf-raking-guide";
import { LEMONADE_STAND_DETAILED_STEPS } from "./lemonade-stand-guide";
import { AIRBNB_HOSTING_DETAILED_STEPS } from "./airbnb-hosting-guide";
import { DIGITAL_COOKBOOK_DETAILED_STEPS } from "./digital-cookbook-creator-guide";
import { FAMILY_PHOTO_SLIDESHOW_DETAILED_STEPS } from "./family-photo-slideshow-guide";
import { LOCAL_RESOURCE_LIST_DETAILED_STEPS } from "./local-resource-list-creator-guide";
import { RECYCLING_HELPER_DETAILED_STEPS } from "./recycling-helper-guide";
import { PROOFREADER_DETAILED_STEPS } from "./proofreader-guide";
import { TOY_ORGANIZER_DETAILED_STEPS } from "./toy-organizer-guide";
import { TRASH_CAN_SERVICE_DETAILED_STEPS } from "./trash-can-service-guide";
import { HOMEWORK_HELPER_DETAILED_STEPS } from "./homework-helper-guide";
import { CANVA_FLYER_DETAILED_STEPS } from "./canva-flyer-creator-guide";
import { CAR_INTERIOR_DETAILED_STEPS } from "./car-interior-cleanup-guide";
import { NEIGHBORHOOD_DOG_WALKER_DETAILED_STEPS } from "./neighborhood-dog-walker-guide";
import { GREETING_CARD_DETAILED_STEPS } from "./greeting-card-creator-guide";
import { HOLIDAY_DECORATING_DETAILED_STEPS } from "./holiday-decorating-helper-guide";
import { LIGHT_HANDYMAN_DETAILED_STEPS } from "./light-handyman-home-help-guide";
import { TUTORING_SKILLS_DETAILED_STEPS } from "./tutoring-skills-coaching-guide";
import { VACATION_PLANT_DETAILED_STEPS } from "./vacation-plant-helper-guide";
import { PERSONAL_SHOPPER_DETAILED_STEPS } from "./personal-shopper-guide";
import { YOUTH_SPORTS_HELPER_DETAILED_STEPS } from "./youth-sports-helper-guide";
import { GENEALOGY_DETAILED_STEPS } from "./genealogy-family-history-guide";
import { JUNIOR_GIVE_BACK_TEACH_DETAILED_STEPS } from "./junior-give-back-teach-guide";
import { JUNIOR_SAVINGS_CEO_DETAILED_STEPS } from "./junior-savings-ceo-guide";
import { KIDS_KINDNESS_SHARE_DETAILED_STEPS } from "./kids-kindness-share-guide";
import { KIDS_PIGGY_FIRST_GOAL_DETAILED_STEPS } from "./kids-piggy-first-goal-guide";
import { BABYSITTING_DETAILED_STEPS } from "./babysitting-guide";
import { DIGITAL_PRODUCTS_DETAILED_STEPS } from "./digital-products-guide";
import { BOOK_PUBLISHING_DETAILED_STEPS } from "./book-publishing-guide";
import { BOOK_PUBLISHING_KIDS_DETAILED_STEPS } from "./book-publishing-kids-guide";
import { AI_PROMPT_HELPER_DETAILED_STEPS } from "./ai-prompt-helper-guide";
import { AI_PEERS_DETAILED_STEPS } from "./ai-peers-guide";
import { JUNIOR_GAMES_AI_DETAILED_STEPS } from "./junior-games-ai-guide";
import { ETSY_STORE_DETAILED_STEPS } from "./etsy-store-guide";
import { RIDESHARE_DETAILED_STEPS } from "./rideshare-guide";
import { JUNIOR_REINVEST_CEO_DETAILED_STEPS } from "./junior-reinvest-ceo-guide";
import { KIDS_REINVEST_JAR_DETAILED_STEPS } from "./kids-reinvest-jar-guide";
import { PROPERTY_MGMT_DETAILED_STEPS } from "./property-mgmt-guide";
import { AIRBNB_TURNOVER_CHECKER_DETAILED_STEPS } from "./airbnb-turnover-checker-guide";
import { STR_COHOST_DETAILED_STEPS } from "./str-cohost-guide";
import { ERRAND_RUNNER_DETAILED_STEPS } from "./errand-runner-guide";
import { AI_AGENTS_DETAILED_STEPS } from "./ai-agents-guide";
import { AI_PROMO_VIDEO_DETAILED_STEPS } from "./ai-promo-video-guide";
import { AI_TIMING_DETAILED_STEPS } from "./ai-timing-guide";
import { TECH_HELPER_DETAILED_STEPS } from "./tech-helper-guide";
import { YARD_HELP_DETAILED_STEPS } from "./yard-help-guide";
import { CLEANING_SERVICE_DETAILED_STEPS } from "./cleaning-service-guide";
import { PLANT_WATERING_DETAILED_STEPS } from "./plant-watering-guide";
import { HOMEWORK_ORGANIZER_DETAILED_STEPS } from "./homework-organizer-guide";
import { GROUP_SETUP_HELPER_DETAILED_STEPS } from "./group-setup-helper-guide";
import { HOUSE_SITTER_DETAILED_STEPS } from "./house-sitter-guide";
import { BOOKKEEPING_DETAILED_STEPS } from "./bookkeeping-guide";
import { CLOSET_CLEANOUT_LISTING_DETAILED_STEPS } from "./closet-cleanout-listing-guide";
import { NONPROFIT_SOCIAL_HELPER_DETAILED_STEPS } from "./nonprofit-social-helper-guide";
import { START_GARDENING_CLUB_DETAILED_STEPS } from "./start-gardening-club-guide";
import { START_BOOK_CLUB_DETAILED_STEPS } from "./start-book-club-guide";
import { FORECLOSURE_PROPERTIES_DETAILED_STEPS } from "./foreclosure-properties-guide";
import { KIDS_GAMES_AI_DETAILED_STEPS } from "./kids-games-ai-guide";

export type DetailedGuideStep = { title: string; desc: string };

/**
 * Prefer this wording when a step needs Google Docs — the sign-in / Docs link lives on the Tools tab.
 */
export const OPEN_GOOGLE_DOCS_FROM_TOOLS =
  "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have)";

/** Shorter inline mention when “Open …” doesn’t fit the sentence. */
export const GOOGLE_DOCS_FROM_TOOLS =
  "Google Docs (Tools tab — sign in with Google, or use an account you already have)";

export const GENERIC_STEP_TITLE_RE =
  /define the offer|prep your kit|reach out|deliver & ask|repeat weekly|define your offer|find first customers|gather tools|one-sentence offer/i;

export function isGenericGuideSteps(
  steps: { title: string; desc?: string; body?: string }[],
): boolean {
  return steps.some((s) => GENERIC_STEP_TITLE_RE.test(s.title));
}

export type ClientScoutConfig = {
  serviceLabel: string;
  examplePitch: string;
  examplePrice: string;
  /** Kids/teens: parents help with outreach and ad accounts. Default true for local free hustles. */
  youthFriendly?: boolean;
  /**
   * When set, Make your marketing materials teaches opening Canva + finding this product template
   * (invitation / flyer / card). Default is a marketing Flyer · US Letter template.
   */
  canvaTemplate?: {
    /** What to type in Canva Templates search */
    search: string;
    /** How to choose among results */
    pickHint: string;
  };
};

/** How to get customers before you deliver — marketing plan first, then outreach. */
export function clientScoutSteps(cfg: ClientScoutConfig): DetailedGuideStep[] {
  const youth = cfg.youthFriendly !== false;
  const canvaTpl = cfg.canvaTemplate ?? {
    search: "Flyer (US Letter) or flyer",
    pickHint: "a layout with room for your offer, price, and contact",
  };

  const channelChecklist = youth
    ? [
        "☐ Phone calls (parent nearby)",
        "☐ Text messages",
        "☐ Printed flyer",
        "☐ Email",
        "☐ Facebook Page",
        "☐ Nextdoor",
        "☐ School or church bulletin board",
      ].join("\n")
    : [
        "☐ Phone calls",
        "☐ Text messages",
        "☐ Email",
        "☐ Printed flyer",
        "☐ LinkedIn",
        "☐ Facebook Page",
        "☐ Nextdoor",
        "☐ Local bulletin boards",
        "☐ Craigslist Services",
      ].join("\n");

  const goalExamples = youth
    ? [
        "☐ Goal 1: _______________________________ (example: Hand out 25 flyers on my block)",
        "☐ Goal 2: _______________________________ (example: Text 12 people we know by Friday)",
        "☐ Goal 3 (optional): ____________________ (example: Put up 5 flyers at church with a parent)",
      ].join("\n")
    : [
        "☐ Goal 1: _______________________________ (example: Book 3 discovery calls from LinkedIn)",
        "☐ Goal 2: _______________________________ (example: Hand out 25 flyers on my block)",
        "☐ Goal 3 (optional): ____________________ (example: Text 12 people I know by Friday)",
      ].join("\n");

  const carryOutDesc = youth
    ? [
        "This week, only use the 2 or 3 ways you already picked. Check each box as you go.",
        "",
        "Warm contacts (people you already know):",
        "☐ Ask a parent or guardian to help you text, call, or walk the block with you.",
        "☐ Contact 8–12 people you know — parents’ friends, neighbors, relatives, coaches, or church / youth-group leaders.",
        `☐ Send a short message like: “${cfg.examplePitch} ${cfg.examplePrice} Want me to put you on the list?”`,
        "☐ Do not post your home address. Meet at their place or a public spot with a parent.",
        "",
        "Social (with a parent):",
        `☐ Open https://www.facebook.com/pages/create and make a Page named like “${cfg.serviceLabel} by [First name].”`,
        "☐ Add your pitch, neighborhood or ZIP only (not your street), hours, and a parent email or phone for booking.",
        "☐ Never put a minor’s personal cell number on a public page.",
        "☐ Optional: Instagram at https://www.instagram.com/ (parent helps if under 18).",
        "☐ Optional: Nextdoor at https://nextdoor.com/ (parent posts if under 18).",
        "☐ After your first job, add one before/after photo (no license plates, no house numbers).",
        "",
        "More places (only if they fit):",
        "☐ Craigslist Services at https://www.craigslist.org/ (parent helps if under 18) — neighborhood or landmark only, not your street.",
        "☐ Facebook Marketplace or local groups at https://www.facebook.com/marketplace when it fits.",
        "",
        "Track and follow up:",
        "☐ Write each contact in a Sheet (date, channel, result).",
        "☐ Reply the same day when someone answers.",
        "☐ Refresh your ads or posts once a week.",
      ].join("\n")
    : [
        "This week, only use the 2 or 3 ways you already picked. Check each box as you go.",
        "",
        "Warm contacts (people you already know):",
        "☐ Contact 8–12 warm leads — neighbors, coworkers, friends, local group chats, or former colleagues.",
        `☐ Send a short message like: “${cfg.examplePitch} ${cfg.examplePrice} Reply YES and I’ll book you.”`,
        "☐ Keep your full street address off public posts.",
        "",
        "Social:",
        `☐ Create a Facebook Page at https://www.facebook.com/pages/create for your ${cfg.serviceLabel}.`,
        "☐ Add services, sample prices, and a booking phone or email.",
        "☐ Optional: Instagram at https://www.instagram.com/ — same pitch, clear “Message to book.”",
        "☐ Optional: LinkedIn at https://www.linkedin.com/ — same pitch, clear “Message to book.”",
        "☐ Optional: Nextdoor at https://nextdoor.com/ — same pitch, clear “Message to book.”",
        "",
        "More places (only if they fit):",
        "☐ Craigslist Services at https://www.craigslist.org/ — neighborhood or landmark only, not your street.",
        "☐ Facebook Marketplace or local groups at https://www.facebook.com/marketplace when it fits.",
        "",
        "Track and follow up:",
        "☐ Write each contact in a Sheet (date, channel, result).",
        "☐ Reply the same day when someone answers.",
        "☐ Refresh your ads or posts once a week.",
      ].join("\n");

  return [
    {
      title: "Pick how you will tell people about your side hustle",
      desc: [
        "A “channel” is one way people hear about you — like the phone, a text, a flyer, or Facebook.",
        "Do not try every way at once. Pick only 2 or 3 for this month.",
        "",
        "Checklist:",
        `☐ ${OPEN_GOOGLE_DOCS_FROM_TOOLS} and start a new page for this month’s plan.`,
        "☐ Write what you sell and your price at the top:",
        `   “${cfg.examplePitch}”`,
        `   “${cfg.examplePrice}”`,
        "☐ Check exactly 2 or 3 boxes below (your ways to tell people):",
        channelChecklist,
        "☐ Write one simple goal for each checked way (use a number you can count):",
        goalExamples,
        "☐ Save the Doc so you can check it off as you go.",
      ].join("\n"),
    },
    {
      title: "Make your marketing materials",
      desc: [
        "Build only what your plan needs. Keep the same offer, price, and contact on every piece.",
        "",
        "Checklist:",
        "☐ Write a phone/text script (2–4 lines) with your offer, price, and how to book.",
        "☐ Open Canva at https://www.canva.com/ — Free plan available — sign in at the link, or continue with an account you already have · Pro ~$15–18/mo or ~$120–144/yr (verify on Canva).",
        "☐ Click Create a design.",
        `☐ Search Templates for “${canvaTpl.search}.”`,
        `☐ Pick a template that fits — ${canvaTpl.pickHint}.`,
        "☐ Put your offer, price, and contact on the design (same words as your script).",
        "☐ Write a short bio / About blurb for your Facebook Page or LinkedIn.",
        "☐ Optional: add an email signature or QR code that points to how to book.",
        "☐ Export PDF + PNG from Canva.",
        "☐ Proof it once — then print a small batch only if it looks good.",
      ].join("\n"),
    },
    {
      title: "Carry out the marketing plan",
      desc: carryOutDesc,
    },
  ];
}

/** Local / service hustles that must teach client scouting before delivery steps. */
export const SERVICE_CLIENT_SCOUT: Record<string, ClientScoutConfig> = {
  "errand-runner": {
    serviceLabel: "Errand Runner",
    examplePitch:
      "I help with simple store pickups, returns, shopping, package drop-offs, and permitted pharmacy pickups. Receipts included. Merchandise is separate from the service fee.",
    examplePrice: "Starting at $10–$15 per errand (examples).",
  },
  "car-interior-cleanup": {
    serviceLabel: "Car Interior Cleanup",
    examplePitch: "I clean car interiors — vacuum, wipe-down, streak-free glass.",
    examplePrice: "About $40 compact / $60 SUV (examples).",
  },
  "dog-walk": {
    serviceLabel: "Dog Walking",
    examplePitch: "I’m taking on weekday dog walks in the neighborhood.",
    examplePrice: "About $12–18 per 20-minute walk.",
  },
  "yard-help": {
    serviceLabel: "Yard & Garden Helper",
    examplePitch:
      "I help with light yard work — raking, watering flowers, pulling weeds, sweeping, and seasonal cleanup. Yard jobs start at $15.",
    examplePrice: "Yard jobs start at $15 (examples $15 – $30 / yard).",
  },
  "pet-sitting": {
    serviceLabel: "Pet Sitting",
    examplePitch: "I pet-sit while you’re away — feeding, walks, and daily photo updates.",
    examplePrice: "Walks, drop-ins, and overnight by arrangement (examples only).",
  },
  "plant-watering": {
    serviceLabel: "Plant watering for homes and local businesses",
    examplePitch: "I water indoor and outdoor plants on a schedule — homes while you travel, and weekly care for lobby or office plants. I follow your written plant instructions.",
    examplePrice: "Quoted per visit, vacation package, or recurring business route.",
  },
  handyman: {
    serviceLabel: "Handyman Services",
    examplePitch: "I take small fix-it jobs: mounts, assembly, touch-ups.",
    examplePrice: "Clear flat quotes before I start.",
    youthFriendly: false,
  },
  "handyman-light": {
    serviceLabel: "Light Handyman / Organizing",
    examplePitch: "I help with furniture assembly, picture hanging, and light organizing.",
    examplePrice: "Flat fees by job (examples in the guide).",
  },
  "tech-helper": {
    serviceLabel: "Smartphone & everyday tech lessons",
    examplePitch: "I provide patient, one-on-one smartphone help for sending photos, video calls, apps, and everyday settings. You keep control of your phone and passwords.",
    examplePrice: "Sessions start at a quoted rate — see Suggested Pricing.",
  },
  homework: {
    serviceLabel: "Homework Help",
    examplePitch: "I offer after-school homework help (with parent OK).",
    examplePrice: "Per session — set with a parent.",
  },
  tutoring: {
    serviceLabel: "Tutoring",
    examplePitch: "I tutor [subject] for [grade] — weekly sessions.",
    examplePrice: "About $25–50/hr depending on level.",
  },
  proofreader: {
    serviceLabel: "Proofreading",
    examplePitch: "I proofread flyers, essays, and short web copy.",
    examplePrice: "Per page or flat flyer fee.",
  },
  "gift-wrapping": {
    serviceLabel: "Gift Wrapping",
    examplePitch: "I wrap gifts for holidays and parties — drop-off or pop-up.",
    examplePrice: "Per gift or bundle pricing.",
  },
  "lemonade-stand": {
    serviceLabel: "Lemonade Stand",
    examplePitch: "We’re opening a lemonade stand this weekend — come by!",
    examplePrice: "Cups priced on the sign ($1–2 examples).",
  },
  "trash-can-service": {
    serviceLabel: "Trash Can Roll-Out",
    examplePitch: "I’ll roll your bins to the curb and back on trash day.",
    examplePrice: "About $20–40/month per home.",
  },
  "neighborhood-helper": {
    serviceLabel: "Neighborhood Helper",
    examplePitch: "I help with small neighbor tasks — groceries in, porch tidy, quick assists.",
    examplePrice: "Menu prices from about $10–20 per task.",
  },
  "leaf-raking": {
    serviceLabel: "Leaf Blowing Service",
    examplePitch:
      "I’m booking leaf blowing — driveway, walks, and lawns, curb-ready. Side-Hustlers who pick this Side-Hustle are eligible for a Free Mini Hand-Held Blower drawing — conditions apply; inquire via the Contact Form.",
    examplePrice: "Flat by area size.",
  },
  "beach-shell-jewelry": {
    serviceLabel: "Beach Shell Jewelry",
    examplePitch: "Handmade jewelry from beach shells — earrings, bracelets, and necklaces.",
    examplePrice: "About $8–$18 earrings, $10–$22 bracelets, $15–$35+ necklaces (examples only).",
  },
  "garage-sale-helper": {
    serviceLabel: "Garage Sale Helper",
    examplePitch: "I help set up, price, and run garage sales.",
    examplePrice: "Flat day rate or % of sales (agreed upfront).",
  },
  "holiday-decorating-helper": {
    serviceLabel: "Holiday Decorating Helper",
    examplePitch: "I help hang indoor/outdoor holiday décor (safe ladder rules apply).",
    examplePrice: "Package pricing by porch vs whole-house.",
  },
  "recycling-helper": {
    serviceLabel: "Recycling Helper",
    examplePitch: "I sort recycling and roll the right bins on schedule.",
    examplePrice: "Bundle with trash service or monthly fee.",
  },
  "vacation-mail-plant-helper": {
    serviceLabel: "Vacation Plant Care",
    examplePitch: "While you travel I can water your plants on a schedule — plants only, no mail or packages.",
    examplePrice: "Per-visit or weekly trip rate.",
  },
  "toy-organizer": {
    serviceLabel: "Toy / Closet Organizing",
    examplePitch: "I help sort toys and closets into keep / donate / trash.",
    examplePrice: "By the hour or room.",
  },
  "friendship-bracelet-maker": {
    serviceLabel: "Friendship Bracelets",
    examplePitch: "Handmade friendship bracelets — customs welcome.",
    examplePrice: "About $5–12 each.",
  },
  crafts: {
    serviceLabel: "Handmade Crafts",
    examplePitch: "I’m selling handmade [craft] — local pickup or school fair.",
    examplePrice: "Priced per piece (2–3× materials + time).",
  },
  "basic-invitation-creator": {
    serviceLabel: "Invitation Design",
    examplePitch: "I design party invitations in Canva — digital files + optional print.",
    examplePrice: "About $15–$50 per project (examples only).",
    canvaTemplate: {
      search: "birthday invitation or party invite",
      pickHint: "kids, elegant, or casual — match the party vibe",
    },
  },
  "canva-flyer-creator": {
    serviceLabel: "Flyer Design",
    examplePitch: "I design flyers in Canva for yard sales, clubs, and local events.",
    examplePrice: "About $15–40 design.",
    canvaTemplate: {
      search: "Flyer (US Letter) or A4 flyer",
      pickHint: "big headline space and a clear footer for contact info",
    },
  },
  "greeting-card-creator": {
    serviceLabel: "Custom Greeting Cards",
    examplePitch: "I make custom greeting cards (Canva or handmade).",
    examplePrice: "About $3–15 per card.",
    canvaTemplate: {
      search: "Greeting card or folded 5×7",
      pickHint: "bold front cover; leave room for inside text later",
    },
  },
  "digital-cookbook-creator": {
    serviceLabel: "Family Cookbook Design",
    examplePitch: "I turn family recipes into a simple digital cookbook.",
    examplePrice: "Project fee by page count.",
  },
  "family-photo-slideshow": {
    serviceLabel: "Photo Slideshow",
    examplePitch: "I build photo slideshow videos for parties and anniversaries.",
    examplePrice: "Flat project fee.",
  },
  consulting: {
    serviceLabel: "Career & Industry Consulting",
    examplePitch:
      "I offer career and industry consulting for freelancers, small businesses, and career-changers — discovery call then clear next steps.",
    examplePrice: "Example packages from about $50–200/hr or a flat starter session.",
    youthFriendly: false,
  },
  "cleaning-service": {
    serviceLabel: "House Cleaning",
    examplePitch:
      "Standard cleans, recurring slots, move-outs, and turnovers — clear included/not-included lists and a quote before I start.",
    examplePrice: "Standard small home from about $80–130 (examples).",
    youthFriendly: false,
  },
  "ai-social-helper": {
    serviceLabel: "AI Social Media Helper",
    examplePitch: "I help small businesses draft and schedule social posts with AI — you approve before anything goes live.",
    examplePrice: "Weekly package pricing by number of posts.",
    youthFriendly: false,
  },
  "ai-prompt-helper": {
    serviceLabel: "Learn AI using ChatGPT",
    examplePitch: "I help beginners learn ChatGPT with simple prompts and reusable workflows for writing, planning, and everyday tasks.",
    examplePrice: "Optional paid projects $15–$50 (examples) after you review the AI output.",
    youthFriendly: true,
  },
  "ai-peers": {
    serviceLabel: "AI-for-Peers Coffee Chat",
    examplePitch:
      "Curious about ChatGPT but don’t want a tech lecture? Join a friendly AI Coffee Chat and learn practical everyday uses at your own pace.",
    examplePrice: "1:1 about $20–$50/hour · small group about $10–$30/person (examples).",
    youthFriendly: false,
  },
  "ai-assets": {
    serviceLabel: "AI Asset Creation",
    examplePitch: "I create AI-assisted graphics and copy packs for your offers — you keep final approval.",
    examplePrice: "Per asset pack or project fee.",
    youthFriendly: false,
  },
  "ai-promo-video": {
    serviceLabel: "AI Promo Video",
    examplePitch:
      "I create short promotional videos for local businesses using your brand assets plus licensed/AI-assisted visuals — may I send a sample and package options?",
    examplePrice: "Quick $35–$75 · Standard $75–$175 · Premium $175–$350+ (examples only).",
    youthFriendly: true,
  },
  "local-business-ai-setup": {
    serviceLabel: "Local Business AI Setup",
    examplePitch: "I help local shops set up simple AI tools for FAQs, posts, and customer replies.",
    examplePrice: "Setup package + optional monthly check-in.",
    youthFriendly: false,
  },
  babysitting: {
    serviceLabel: "Babysitting",
    examplePitch: "Available evenings for trusted babysitting — parent-approved house rules, references on request.",
    examplePrice: "Hourly rate set with parents (examples in the guide).",
  },
  "food-delivery": {
    serviceLabel: "Food Delivery",
    examplePitch: "I’m multi-apping food delivery in our zone — tip-friendly and on-time.",
    examplePrice: "App payouts + tips (track after each block).",
    youthFriendly: false,
  },
  "estate-sale-listing-helper": {
    serviceLabel: "Estate Sale Reseller",
    examplePitch:
      "I source and resell vintage and antique finds — researched comps, clear photos, honest condition notes.",
    examplePrice: "Priced from sold comps after fees and shipping.",
    youthFriendly: false,
  },
  "family-history-organizer": {
    serviceLabel: "Genealogy Researcher",
    examplePitch:
      "I help families research and organize family history — scoped hours, source-backed findings, clear next steps.",
    examplePrice: "Hourly or package pricing from the guide (examples only).",
    youthFriendly: false,
  },
};

/** Shared competitor-research step — injected into every launch guide. */
export const RESEARCH_COMPETITORS_STEP: DetailedGuideStep = {
  title: "Research Competitors",
  desc: "Before you finalize pricing or ads, spend 20–30 minutes studying who already serves your niche nearby (or online). Search Google Maps, Facebook, Nextdoor, Instagram, and — if appropriate — Craigslist for similar offers. Note their prices, packages, reviews, response time, and gaps (slow replies, no photos, weak guarantees). Write 3 takeaways: what you’ll match, what you’ll avoid, and one clear differentiator you can say in one sentence.",
};

/** Every side hustle names the business after competitor research. */
export const NAME_SIDE_HUSTLE_STEP: DetailedGuideStep = {
  title: "Pick a Name for Your Side Hustle Business",
  desc: [
    "Choose a clear, memorable name for your side hustle business — something you can say in one breath and put on a flyer, Facebook Page, invoice, or Canva graphics.",
    "",
    "Research the name before you lock it in. Make sure it is not already taken and that you are not violating copyright, trademark, or other regulatory rules. Rules and name availability can differ by state and industry.",
    "",
    "How to check:",
    "☐ Search Google, Instagram, and Facebook Pages for the exact name and close look-alikes.",
    "☐ Search the U.S. Patent and Trademark Office trademark database at https://www.uspto.gov/trademarks/search.",
    "☐ Check your state’s business / DBA name search (usually your Secretary of State website).",
    "☐ When you are ready for a tax ID, apply for an EIN at the IRS: https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online — use the exact legal name you cleared, and do not file until the name checks above look clear.",
    "",
    `Write the name at the top of your ${GOOGLE_DOCS_FROM_TOOLS} plan and use it the same way everywhere.`,
  ].join("\n"),
};

/**
 * Savings goals (Piggy Bank) — no competitors and no business name.
 * Replaces Research Competitors + Pick a Name for Your Side Hustle Business.
 */
export const SAVINGS_GOAL_PLAN_STEP: DetailedGuideStep = {
  title: "Plan What You’re Saving For",
  desc: "Name what you are saving for, write the total cost, decide how you plan to earn the money, and set your weekly savings goal. Put all four on a sticky note or in the Piggy Bank tab with a parent nearby — savings goals don’t need a business name or competitor research.",
};

/** Guides that use the savings foundation (no competitors / business name). */
export const SAVINGS_FOUNDATION_GUIDE_IDS = [
  "kids-piggy-first-goal",
  "junior-savings-ceo",
  /** Fun / Save / Grow jars — money habit, not a business playbook. */
  "kids-reinvest-jar",
  /** Teen Save / Enjoy / Grow buckets — same foundation as kids reinvest. */
  "junior-reinvest-ceo",
] as const;

/** Free give-back / community skill guides — thumbs-up only; no sale closing or marketing inject. */
export const GIVE_BACK_FOUNDATION_GUIDE_IDS = [
  "kids-kindness-share",
  "junior-give-back-teach",
] as const;

/** Skill-building / education guides — no sale closing or marketing inject. */
export const SKILL_LEARNING_GUIDE_IDS = [
  "ai-prompt-helper",
  "junior-games-ai",
  "kids-games-ai",
] as const;

/** Investment-acquisition guides — no client-marketing or first-sale playbook. */
export const INVESTMENT_ACQUISITION_GUIDE_IDS = ["foreclosure-properties"] as const;

export function guideUsesInvestmentAcquisitionPlaybook(guideId: string): boolean {
  return (INVESTMENT_ACQUISITION_GUIDE_IDS as readonly string[]).includes(
    String(guideId || "").trim(),
  );
}

export function guideUsesSavingsFoundation(guideId: string): boolean {
  return (SAVINGS_FOUNDATION_GUIDE_IDS as readonly string[]).includes(
    String(guideId || "").trim(),
  );
}

export function guideUsesGiveBackFoundation(guideId: string): boolean {
  return (GIVE_BACK_FOUNDATION_GUIDE_IDS as readonly string[]).includes(
    String(guideId || "").trim(),
  );
}

export function guideUsesSkillLearningPlaybook(guideId: string): boolean {
  return (SKILL_LEARNING_GUIDE_IDS as readonly string[]).includes(
    String(guideId || "").trim(),
  );
}

/** Uber/Lyft-style marketplace — no customer-acquisition marketing sequence. */
export const PLATFORM_MARKETPLACE_GUIDE_IDS = ["rideshare", "str-cohost"] as const;

export function guideUsesPlatformMarketplacePlaybook(guideId: string): boolean {
  return (PLATFORM_MARKETPLACE_GUIDE_IDS as readonly string[]).includes(
    String(guideId || "").trim(),
  );
}

/** Savings + give-back + skill-learning + investment-acquisition guides skip business playbook extras. */
export function guideUsesNonLaunchPlaybook(guideId: string): boolean {
  return (
    guideUsesSavingsFoundation(guideId) ||
    guideUsesGiveBackFoundation(guideId) ||
    guideUsesSkillLearningPlaybook(guideId) ||
    guideUsesInvestmentAcquisitionPlaybook(guideId)
  );
}

/** Every guide: always step 1 — get a thumbs-up from someone close before going further. */
export const PARENT_THUMBS_UP_STEP: DetailedGuideStep = {
  title: "Run This by Your Parent, Partner, Friend, or Someone Close",
  desc: [
    "Run this by your Parent, Partner, Friend, or someone close to get feedback and advice. Shoot for a THUMBS UP!",
    "",
    "Be sure to check your local area for business license requirements and any other local regulations related to this side hustle. Rules can differ by city or county — abide by all of them.",
  ].join("\n"),
};

/** @deprecated Use PARENT_THUMBS_UP_STEP — same step for kids and teens. */
export const KIDS_SAFETY_RULES_STEP = PARENT_THUMBS_UP_STEP;
/** @deprecated Use PARENT_THUMBS_UP_STEP — same step for kids and teens. */
export const TEEN_CONSULT_PARENT_STEP = PARENT_THUMBS_UP_STEP;

const RESEARCH_COMPETITORS_TITLE_RE = /research\s+competitors/i;
const NAME_SIDE_HUSTLE_TITLE_RE =
  /pick a name for your side hustle( business)?|name (your |the )?(side[- ]?)?hustle|name (your |the )?(club|business|brand|service)\b/i;
const MARKETING_OBJECTIVES_TITLE_RE =
  /decide on marketing objectives|pick how you will tell people about your side hustle/i;
/** Matches the canonical step plus older parent-approval / thumbs-up titles. */
const PARENT_THUMBS_UP_TITLE_RE =
  /run this by your parent|get parent thumbs up on the side hustle|set safety rules with a parent|consult parent about (your )?idea/i;

export type GuideFoundationAudience = "kids" | "junior" | "adult" | "senior";

/** Step 1 for every guide — feedback thumbs-up from someone close. */
export function youthFirstStepForAudiences(
  _audiences?: readonly GuideFoundationAudience[] | null,
): DetailedGuideStep {
  return { ...PARENT_THUMBS_UP_STEP };
}

/**
 * Canonical early order for every guide:
 * 0) Run this by Parent / Partner / Friend / someone close — Shoot for a THUMBS UP!
 * Business guides:
 * 1) Research Competitors
 * 2) Pick a Name for Your Side Hustle Business (canonical EIN / USPTO copy)
 * 3) Pick how you will tell people about your side hustle (marketing plan) when present
 * Savings guides (Piggy Bank goals):
 * 1) Plan What You’re Saving For (goal, cost, earn plan, weekly savings) — no competitors / business name
 * Then the rest of the guide in relative order.
 */
export function ensureGuideFoundationSteps(
  steps: DetailedGuideStep[],
  opts?: {
    audiences?: readonly GuideFoundationAudience[];
    /** Savings goals skip competitors + business naming. Give-back skips those too. */
    foundation?: "business" | "savings" | "giveback";
  },
): DetailedGuideStep[] {
  const thumbsWanted = youthFirstStepForAudiences(opts?.audiences);
  const isSavings = opts?.foundation === "savings";
  const isGiveBack = opts?.foundation === "giveback";

  if (!steps.length) {
    return isSavings
      ? [thumbsWanted, { ...SAVINGS_GOAL_PLAN_STEP }]
      : isGiveBack
        ? [thumbsWanted]
        : [thumbsWanted, { ...RESEARCH_COMPETITORS_STEP }, { ...NAME_SIDE_HUSTLE_STEP }];
  }

  let priorThumbs: DetailedGuideStep | null = null;
  let research: DetailedGuideStep | null = null;
  let nameStep: DetailedGuideStep | null = null;
  let savingsPlan: DetailedGuideStep | null = null;
  let marketingObjectives: DetailedGuideStep | null = null;
  const rest: DetailedGuideStep[] = [];

  for (const step of steps) {
    const title = step.title ?? "";
    if (!priorThumbs && PARENT_THUMBS_UP_TITLE_RE.test(title)) {
      priorThumbs = { ...step };
      continue;
    }
    if (!research && RESEARCH_COMPETITORS_TITLE_RE.test(title)) {
      research = { ...step };
      continue;
    }
    if (!nameStep && NAME_SIDE_HUSTLE_TITLE_RE.test(title)) {
      nameStep = { ...step };
      continue;
    }
    if (!savingsPlan && /plan what you.?re saving for/i.test(title)) {
      savingsPlan = { ...step };
      continue;
    }
    if (!marketingObjectives && MARKETING_OBJECTIVES_TITLE_RE.test(title)) {
      marketingObjectives = { ...step };
      continue;
    }
    rest.push({ ...step });
  }

  void priorThumbs;
  void nameStep;

  if (isSavings) {
    // Authored savings / reinvest body follows thumbs-up.
    // Inject the overview only when the guide has no authored body yet.
    const hasSavingsBody =
      rest.length > 0 &&
      rest.some((s) =>
        /saving for|weekly savings|write the cost|plan how you will earn|pick your goal|find the price|already have|savings spot|safe ways to earn|goes to your goal|how many jobs|goal tracker|earn & save|check your progress|reach it|three jars|hustle jar|three buckets|split (your|rule)|grow (wish|spends)|put some earnings|name what you are saving for/i.test(
          s.title,
        ),
      );
    return [
      thumbsWanted,
      ...(hasSavingsBody ? [] : [savingsPlan ?? { ...SAVINGS_GOAL_PLAN_STEP }]),
      ...rest,
    ];
  }

  if (isGiveBack) {
    return [thumbsWanted, ...rest];
  }

  return [
    thumbsWanted,
    research ?? { ...RESEARCH_COMPETITORS_STEP },
    { ...NAME_SIDE_HUSTLE_STEP },
    ...(marketingObjectives ? [marketingObjectives] : []),
    ...rest,
  ];
}

/** Early block titles — before-photos and hustle body come after these. */
const EARLY_PLAYBOOK_BLOCK_RE =
  /run this by your parent|get parent thumbs up|set safety rules|consult parent|research competitors|pick a name for your side hustle|plan what you.?re saving for|pick how you will tell people|decide on marketing objectives|choose your marketing channels|make your (?:authority\s*&\s*)?marketing materials|create your marketing campaign|carry out (the|your) marketing plan|execute your marketing campaign|how you will advertise/i;

/** Index right after consecutive foundation + marketing steps at the start of the list. */
export function indexAfterEarlyPlaybookBlock(steps: DetailedGuideStep[]): number {
  let insertAt = 0;
  for (let i = 0; i < steps.length; i++) {
    if (EARLY_PLAYBOOK_BLOCK_RE.test(steps[i]?.title ?? "")) {
      insertAt = i + 1;
      continue;
    }
    break;
  }
  return insertAt;
}

/** Guides where the finished job should show a clear before → after change. */
export const BEFORE_AFTER_PHOTO_GUIDE_IDS = [
  "car-interior-cleanup",
  "cleaning-service",
  "yard-help",
  "leaf-raking",
  "holiday-decorating-helper",
  "handyman",
  "handyman-light",
] as const;

export type BeforeAfterPhotoGuideId = (typeof BEFORE_AFTER_PHOTO_GUIDE_IDS)[number];

export function guideRequiresBeforeAfterPhotos(guideId: string): boolean {
  return (BEFORE_AFTER_PHOTO_GUIDE_IDS as readonly string[]).includes(guideId as BeforeAfterPhotoGuideId);
}

/** Shared copy for transformation jobs — take before shots before you start work. */
export const TAKE_BEFORE_PHOTOS_STEP: DetailedGuideStep = {
  title: "Take Before Photos",
  desc: "Before you start, shoot clear phone photos of the work area from the same angles you’ll use after — wide shot plus any problem spots. No license plates, house numbers, or kids’ faces in frame. Keep them in a job album so you can prove progress and build a portfolio (with client permission).",
};

export const TAKE_AFTER_PHOTOS_STEP: DetailedGuideStep = {
  title: "Take After Photos",
  desc: "Reshoot from the same angles as your before photos. Send the after set to the client before asking for payment, and save both for your portfolio (crop private details).",
};

/** Canonical second-to-last step — log the first paid job with the Revenue Calculator. */
export const MAKE_YOUR_FIRST_SALE_STEP: DetailedGuideStep = {
  title: "Make Your First Sale",
  desc: [
    "Complete your first paid job or sale.",
    "",
    "Document all sales (what you sold or did, who paid, date, and amount) and all expenses (supplies, fees, travel, tools, ads) in one place.",
    "",
    "Use the Revenue Calculator provided with this guide to enter income and costs so you can see real profit — not just cash in your pocket. Keep receipts or screenshots with your notes for taxes and future pricing.",
  ].join("\n"),
};

/** Canonical last step — ask the customer for a short review (and optionally a rebook/referral). */
export const ASK_FOR_REVIEW_STEP: DetailedGuideStep = {
  title: "Ask for a Short Review",
  desc: [
    "After you deliver, ask the customer if they would leave a short 1–2 sentence review you can share (text, Google, Facebook, or a simple written note).",
    "",
    "A good ask: what went well, and whether they'd hire you again. Also ask if they want to rebook or know someone else who might need the same help — one warm referral beats cold outreach.",
  ].join("\n"),
};

const MAKE_YOUR_FIRST_SALE_TITLE_RE =
  /make your first sale|deliver the first (small )?job|complete your first (paid )?(sale|job)|document all sales|log (your )?(first )?(sale|income)/i;
const ASK_FOR_REVIEW_TITLE_RE =
  /^(ask for a (short )?review)\b|^ask .+ to leave a review$|review and a next booking|^ask for (a )?testimonial$/i;

/**
 * Every business guide ends with:
 * 1) Make Your First Sale (Revenue Calculator + document sales/expenses)
 * 2) Ask for a Short Review
 * Savings-goal and free give-back guides skip these (no sale/review loop).
 */
export function ensureGuideClosingSteps(
  guideId: string,
  steps: DetailedGuideStep[],
): DetailedGuideStep[] {
  const id = String(guideId || "").trim();
  if (!id || guideUsesNonLaunchPlaybook(id) || guideUsesPlatformMarketplacePlaybook(id)) {
    return steps ?? [];
  }

  const rest: DetailedGuideStep[] = [];
  for (const step of steps ?? []) {
    const title = step.title ?? "";
    if (MAKE_YOUR_FIRST_SALE_TITLE_RE.test(title) || ASK_FOR_REVIEW_TITLE_RE.test(title)) {
      continue;
    }
    rest.push(step);
  }

  return [...rest, { ...MAKE_YOUR_FIRST_SALE_STEP }, { ...ASK_FOR_REVIEW_STEP }];
}

/**
 * Re-apply foundation + before-photo ordering so Admin patches / authored
 * kits cannot drop "Pick a Name…" or shove Take Before Photos above step 1–3.
 */
export function finalizeGuidePlaybookSteps(
  guideId: string,
  steps: DetailedGuideStep[],
  opts?: { audiences?: readonly GuideFoundationAudience[] },
): DetailedGuideStep[] {
  const id = String(guideId || "").trim();
  let next = ensureGuideFoundationSteps(steps ?? [], {
    audiences: opts?.audiences,
    foundation: guideUsesSavingsFoundation(id)
      ? "savings"
      : guideUsesGiveBackFoundation(id) ||
          guideUsesPlatformMarketplacePlaybook(id) ||
          guideUsesSkillLearningPlaybook(id) ||
          guideUsesInvestmentAcquisitionPlaybook(id)
        ? "giveback"
        : "business",
  });

  // Pull any Take Before Photos out of the middle/front, then place after early block.
  const beforePhotos: DetailedGuideStep[] = [];
  const withoutBefore: DetailedGuideStep[] = [];
  for (const step of next) {
    if (/^take before photos$/i.test(step.title.trim())) {
      if (!beforePhotos.length) beforePhotos.push({ ...TAKE_BEFORE_PHOTOS_STEP });
      continue;
    }
    withoutBefore.push(step);
  }
  next = withoutBefore;

  if (guideRequiresBeforeAfterPhotos(id)) {
    const at = indexAfterEarlyPlaybookBlock(next);
    next = [...next.slice(0, at), { ...TAKE_BEFORE_PHOTOS_STEP }, ...next.slice(at)];
  } else if (beforePhotos.length) {
    const at = indexAfterEarlyPlaybookBlock(next);
    next = [...next.slice(0, at), ...beforePhotos, ...next.slice(at)];
  }

  return ensureGuideClosingSteps(id, next);
}

/** @deprecated Prefer ensureGuideFoundationSteps — kept for existing imports. */
export function ensureResearchCompetitorsStep(
  steps: DetailedGuideStep[],
  opts?: { audiences?: readonly GuideFoundationAudience[] },
): DetailedGuideStep[] {
  return ensureGuideFoundationSteps(steps, opts);
}

export function stepsIncludeTakeBeforePhotos(steps: DetailedGuideStep[]): boolean {
  return steps.some((s) => /^take before photos$/i.test(s.title.trim()));
}

export function stepsIncludeTakeAfterPhotos(steps: DetailedGuideStep[]): boolean {
  return steps.some((s) => /take after photos|after photo/i.test(s.title));
}

export function detailedStepsForGuide(
  guideId: string,
  opts?: { audiences?: readonly GuideFoundationAudience[] },
): DetailedGuideStep[] | undefined {
  const base = DETAILED_GUIDE_STEPS[guideId];
  if (!base?.length) return undefined;
  const scoutCfg = SERVICE_CLIENT_SCOUT[guideId];
  let steps = base;
  if (scoutCfg) {
    // Idempotent if steps were already authored with scout / marketing titles
    // (including “how you will advertise” on kids helper menus).
    if (!stepsIncludeMarketingChoices(base)) {
      steps = [...clientScoutSteps(scoutCfg), ...base];
    }
  }
  return finalizeGuidePlaybookSteps(guideId, steps, opts);
}

/** True when the guide already teaches marketing channel choices. */
export function stepsIncludeMarketingChoices(steps: DetailedGuideStep[]): boolean {
  return steps.some((s) =>
    /decide on marketing objectives|pick how you will tell people about your side hustle|choose your marketing channels|make your (?:authority\s*&\s*)?marketing materials|create your marketing campaign|carry out (the|your) marketing plan|execute your marketing campaign|how you will advertise|choose how you(?:'ll| will) market|create honest marketing materials|contact suitable clients/i.test(
      s.title,
    ),
  );
}

export const DETAILED_GUIDE_STEPS: Record<string, DetailedGuideStep[]> = {
  babysitting: BABYSITTING_DETAILED_STEPS.map((s) => ({ ...s })),
  "digital-products": DIGITAL_PRODUCTS_DETAILED_STEPS.map((s) => ({ ...s })),
  "book-publishing": BOOK_PUBLISHING_DETAILED_STEPS.map((s) => ({ ...s })),
  "book-publishing-kids": BOOK_PUBLISHING_KIDS_DETAILED_STEPS.map((s) => ({ ...s })),
  "ai-prompt-helper": AI_PROMPT_HELPER_DETAILED_STEPS.map((s) => ({ ...s })),
  "ai-peers": AI_PEERS_DETAILED_STEPS.map((s) => ({ ...s })),
  "junior-games-ai": JUNIOR_GAMES_AI_DETAILED_STEPS.map((s) => ({ ...s })),
  "etsy-store": ETSY_STORE_DETAILED_STEPS.map((s) => ({ ...s })),
  "food-delivery": FOOD_DELIVERY_DETAILED_STEPS.map((s) => ({ ...s })),
  "estate-sale-listing-helper": ESTATE_SALE_DETAILED_STEPS.map((s) => ({ ...s })),
  "kids-party-game-host": KIDS_PARTY_GAME_HOST_DETAILED_STEPS.map((s) => ({ ...s })),
  "lead-followup-assistant": LEAD_FOLLOWUP_DETAILED_STEPS.map((s) => ({ ...s })),
  "local-content-photographer": LOCAL_CONTENT_PHOTO_DETAILED_STEPS.map((s) => ({ ...s })),
  "local-event-content-creator": LOCAL_EVENT_CONTENT_DETAILED_STEPS.map((s) => ({ ...s })),
  "appointment-setter": APPOINTMENT_SETTER_DETAILED_STEPS.map((s) => ({ ...s })),
  "online-research-assistant": ONLINE_RESEARCH_ASSISTANT_DETAILED_STEPS.map((s) => ({ ...s })),
  "mothers-helper": MOTHERS_HELPER_DETAILED_STEPS.map((s) => ({ ...s })),
  crafts: CRAFTS_DETAILED_STEPS.map((s) => ({ ...s })),
  "beach-shell-jewelry": BEACH_SHELL_JEWELRY_DETAILED_STEPS.map((s) => ({ ...s })),
  "gift-wrapping": GIFT_WRAPPING_DETAILED_STEPS.map((s) => ({ ...s })),
  affiliate: AFFILIATE_DETAILED_STEPS.map((s) => ({ ...s })),
  dropshipping: DROPSHIPPING_DETAILED_STEPS.map((s) => ({ ...s })),
  "fb-marketplace-helper": FB_MARKETPLACE_HELPER_DETAILED_STEPS.map((s) => ({ ...s })),
  "porch-package-helper": PORCH_PACKAGE_DETAILED_STEPS.map((s) => ({ ...s })),
  "travel-research-assistant": TRAVEL_RESEARCH_DETAILED_STEPS.map((s) => ({ ...s })),
  "transcription-notes-helper": TRANSCRIPTION_NOTES_DETAILED_STEPS.map((s) => ({ ...s })),
  "website-tester": WEBSITE_TESTER_DETAILED_STEPS.map((s) => ({ ...s })),
  "community-newsletter-creator": COMMUNITY_NEWSLETTER_DETAILED_STEPS.map((s) => ({ ...s })),
  teaching: COMMUNITY_TEACHING_DETAILED_STEPS.map((s) => ({ ...s })),
  "review-response-assistant": REVIEW_RESPONSE_DETAILED_STEPS.map((s) => ({ ...s })),
  consulting: CAREER_CONSULTING_DETAILED_STEPS.map((s) => ({ ...s })),
  notary: PART_TIME_NOTARY_DETAILED_STEPS.map((s) => ({ ...s })),
  "resume-linkedin-helper": RESUME_LINKEDIN_DETAILED_STEPS.map((s) => ({ ...s })),
  "short-form-video-editor": SHORT_FORM_VIDEO_DETAILED_STEPS.map((s) => ({ ...s })),
  "google-business-helper": GBP_HELPER_DETAILED_STEPS.map((s) => ({ ...s })),
  "ugc-creator": UGC_CREATOR_DETAILED_STEPS.map((s) => ({ ...s })),
  "virtual-assistant": VIRTUAL_ASSISTANT_DETAILED_STEPS.map((s) => ({ ...s })),
  "virtual-receptionist": VIRTUAL_RECEPTIONIST_DETAILED_STEPS.map((s) => ({ ...s })),
  social: SOCIAL_INFLUENCER_DETAILED_STEPS.map((s) => ({ ...s })),
  "online-community-moderator": COMMUNITY_MODERATOR_DETAILED_STEPS.map((s) => ({ ...s })),
  "basic-invitation-creator": BASIC_INVITATION_DETAILED_STEPS.map((s) => ({ ...s })),
  pod: POD_DETAILED_STEPS.map((s) => ({ ...s })),
  "pet-sitting": PET_SITTING_DETAILED_STEPS.map((s) => ({ ...s })),
  handyman: HANDYMAN_DETAILED_STEPS.map((s) => ({ ...s })),
  "friendship-bracelet-maker": FRIENDSHIP_BRACELET_DETAILED_STEPS.map((s) => ({ ...s })),
  "leaf-raking": LEAF_RAKING_DETAILED_STEPS.map((s) => ({ ...s })),
  "lemonade-stand": LEMONADE_STAND_DETAILED_STEPS.map((s) => ({ ...s })),
  airbnb: AIRBNB_HOSTING_DETAILED_STEPS.map((s) => ({ ...s })),
  "digital-cookbook-creator": DIGITAL_COOKBOOK_DETAILED_STEPS.map((s) => ({ ...s })),
  "family-photo-slideshow": FAMILY_PHOTO_SLIDESHOW_DETAILED_STEPS.map((s) => ({ ...s })),
  "local-resource-list-creator": LOCAL_RESOURCE_LIST_DETAILED_STEPS.map((s) => ({ ...s })),
  "recycling-helper": RECYCLING_HELPER_DETAILED_STEPS.map((s) => ({ ...s })),
  proofreader: PROOFREADER_DETAILED_STEPS.map((s) => ({ ...s })),
  "toy-organizer": TOY_ORGANIZER_DETAILED_STEPS.map((s) => ({ ...s })),
  "trash-can-service": TRASH_CAN_SERVICE_DETAILED_STEPS.map((s) => ({ ...s })),
  homework: HOMEWORK_HELPER_DETAILED_STEPS.map((s) => ({ ...s })),
  "canva-flyer-creator": CANVA_FLYER_DETAILED_STEPS.map((s) => ({ ...s })),
  "car-interior-cleanup": CAR_INTERIOR_DETAILED_STEPS.map((s) => ({ ...s })),
  "dog-walk": NEIGHBORHOOD_DOG_WALKER_DETAILED_STEPS.map((s) => ({ ...s })),
  "greeting-card-creator": GREETING_CARD_DETAILED_STEPS.map((s) => ({ ...s })),
  "holiday-decorating-helper": HOLIDAY_DECORATING_DETAILED_STEPS.map((s) => ({ ...s })),
  "handyman-light": LIGHT_HANDYMAN_DETAILED_STEPS.map((s) => ({ ...s })),
  tutoring: TUTORING_SKILLS_DETAILED_STEPS.map((s) => ({ ...s })),
  "vacation-mail-plant-helper": VACATION_PLANT_DETAILED_STEPS.map((s) => ({ ...s })),
  "personal-shopper": PERSONAL_SHOPPER_DETAILED_STEPS.map((s) => ({ ...s })),
  "youth-sports-helper": YOUTH_SPORTS_HELPER_DETAILED_STEPS.map((s) => ({ ...s })),
  "junior-give-back-teach": JUNIOR_GIVE_BACK_TEACH_DETAILED_STEPS.map((s) => ({ ...s })),
  "junior-savings-ceo": JUNIOR_SAVINGS_CEO_DETAILED_STEPS.map((s) => ({ ...s })),
  "kids-kindness-share": KIDS_KINDNESS_SHARE_DETAILED_STEPS.map((s) => ({ ...s })),
  "kids-piggy-first-goal": KIDS_PIGGY_FIRST_GOAL_DETAILED_STEPS.map((s) => ({ ...s })),
  "kids-reinvest-jar": KIDS_REINVEST_JAR_DETAILED_STEPS.map((s) => ({ ...s })),
  "family-history-organizer": GENEALOGY_DETAILED_STEPS.map((s) => ({ ...s })),

  rideshare: RIDESHARE_DETAILED_STEPS.map((s) => ({ ...s })),
  "junior-reinvest-ceo": JUNIOR_REINVEST_CEO_DETAILED_STEPS.map((s) => ({ ...s })),
  "property-mgmt": PROPERTY_MGMT_DETAILED_STEPS.map((s) => ({ ...s })),
  "airbnb-turnover-checker": AIRBNB_TURNOVER_CHECKER_DETAILED_STEPS.map((s) => ({ ...s })),
  "str-cohost": STR_COHOST_DETAILED_STEPS.map((s) => ({ ...s })),
  "errand-runner": ERRAND_RUNNER_DETAILED_STEPS.map((s) => ({ ...s })),
  "ai-agents": AI_AGENTS_DETAILED_STEPS.map((s) => ({ ...s })),
  "ai-promo-video": AI_PROMO_VIDEO_DETAILED_STEPS.map((s) => ({ ...s })),
  "ai-timing": AI_TIMING_DETAILED_STEPS.map((s) => ({ ...s })),
  "tech-helper": TECH_HELPER_DETAILED_STEPS.map((s) => ({ ...s })),
  "yard-help": YARD_HELP_DETAILED_STEPS.map((s) => ({ ...s })),
  "cleaning-service": CLEANING_SERVICE_DETAILED_STEPS.map((s) => ({ ...s })),
  "plant-watering": PLANT_WATERING_DETAILED_STEPS.map((s) => ({ ...s })),
  "homework-organizer": HOMEWORK_ORGANIZER_DETAILED_STEPS.map((s) => ({ ...s })),
  "group-setup-helper": GROUP_SETUP_HELPER_DETAILED_STEPS.map((s) => ({ ...s })),
  "house-sitter": HOUSE_SITTER_DETAILED_STEPS.map((s) => ({ ...s })),
  bookkeeping: BOOKKEEPING_DETAILED_STEPS.map((s) => ({ ...s })),
  "closet-cleanout-listing": CLOSET_CLEANOUT_LISTING_DETAILED_STEPS.map((s) => ({ ...s })),
  "nonprofit-social-helper": NONPROFIT_SOCIAL_HELPER_DETAILED_STEPS.map((s) => ({ ...s })),
  "start-gardening-club": START_GARDENING_CLUB_DETAILED_STEPS.map((s) => ({ ...s })),
  "start-book-club": START_BOOK_CLUB_DETAILED_STEPS.map((s) => ({ ...s })),
  "foreclosure-properties": FORECLOSURE_PROPERTIES_DETAILED_STEPS.map((s) => ({ ...s })),
  "kids-games-ai": KIDS_GAMES_AI_DETAILED_STEPS.map((s) => ({ ...s })),

  "web-leads": [
    {
      title: "Pick a ZipCode + niche lane",
      desc: "Choose 1–2 niches (dentists, HVAC, salons, contractors) within ~20 miles. Write a one-line sample offer. Save prospects in Google Sheets or Google Docs (Tools tab — sign in with Google, or use an account you already have).",
    },
    {
      title: "Build a lead list from Maps",
      desc: "Use Google Maps / Bing Places to find businesses with no site, a broken mobile layout, or a dated DIY page. Log name, phone, URL, and 3 pain notes. Do not pitch WordPress rebuilds — your stack is modern.",
    },
    {
      title: "Run a 60-second audit",
      desc: "Score speed, mobile, contact CTA, and booking path. Record a short Loom or PDF with 3 fixes + a package price ($150–$400 audit; $800–$3,500 build). ChatGPT (https://chatgpt.com/) can draft the audit shell — you fill the screenshots.",
    },
    {
      title: "Outreach cadence",
      desc: "Call, text, or drop by with the audit. Aim for ~20 touches/day. Sell the audit first; never start a full build without a signed deposit.",
    },
    {
      title: "Build on Cloudflare + Supabase + Resend (kick off in Antigravity)",
      desc: "Kick off the site in Google Antigravity (https://antigravity.google/download). Deploy on Cloudflare Pages (https://pages.cloudflare.com/). Use Supabase (https://supabase.com/) for forms/auth/data when needed, and Resend (https://resend.com/) for contact/transactional email. Deliver booking CTA, NAP consistency, and basic SEO. Never use WordPress.",
    },
    {
      title: "Stack recurring revenue",
      desc: "Offer monthly hosting + light edits on Cloudflare ($49–$149). Ask every client for 2 referrals and one Google review. Keep revision limits in writing.",
    },
  ],

  "neighborhood-helper": [
    {
      title: "Publish a menu of micro-chores you’ll do",
      desc: "List concrete tasks: carry groceries in, move trash bins, walk mail to door, quick porch sweep, feed cat once, water one planter. Avoid vague “anything you need.” Share the menu in a neighborhood group or flyer.",
    },
    {
      title: "Set boundaries and adult supervision rules",
      desc: "Kids: parent approves each home; no entering unless owner is present or key protocol signed by parent. Work daylight hours. Decline jobs involving chemicals, ladders, or strangers’ cars.",
    },
    {
      title: "Book 30-minute blocks in Google Calendar",
      desc: "Stack errands geographically: “Tuesday 4–5 pm Oak Street trio.” Text ETA 10 minutes before arrival. Bring your own gloves and hand sanitizer.",
    },
    {
      title: "Confirm price before starting",
      desc: "Examples: $10 grocery carry-in, $15 porch tidy, $20 multi-task bundle. Text confirmation: “OK to do X and Y for $20 today?” Never add tasks without approval.",
    },
    {
      title: "Close each job with a quick photo receipt",
      desc: "Photo of completed task (neat porch, bins returned). Text: “Done — thank you!” Note hours in a simple Sheet for taxes if you’re older and earning regularly.",
    },
    {
      title: "Ask for standing weekly slots",
      desc: "One neighbor may want bins every Thursday; another weekly mail grab. Standing gigs beat one-offs — offer $5/month discount for prepaid quarterly.",
    },
  ],

  "garage-sale-helper": [
    {
      title: "Plan sort, price, and layout day before",
      desc: "With the homeowner, group items: tools, clothes, toys, kitchen. Price with color dots ($1 yellow, $5 green) or masking tape tags. Lay tables by category facing the driveway for flow.",
    },
    {
      title: "Make directional signs in Canva",
      desc: "Canva (https://www.canva.com/) → “Yard sale sign” template → big arrows, date, start time, address last line small for privacy on highway signs. Print 3–4 copies; parent helps place legally.",
    },
    {
      title: "Run the cash table and calculator",
      desc: "Float $30 in small bills. Use phone calculator + notebook log: item, price, sold Y/N. Offer bundles: “Fill a bag for $10.”",
    },
    {
      title: "Haggle politely with a minimum",
      desc: "Owner sets floor prices on sticky notes inside (“lowest $8”). You can discount 10% after noon — not before 10 am. Donate leftovers only if owner pre-labels donation pickup.",
    },
    {
      title: "Post live updates in local groups",
      desc: "Facebook Marketplace or Nextdoor “Sale live until 2 pm — kids’ bikes left” with parent posting. No photos of house number — use cross streets.",
    },
    {
      title: "Pay helper fee or commission",
      desc: "Agree upfront: $50 flat for 4 hours or 10% of sales. Count cash with owner at end; Venmo your fee same day.",
    },
  ],

  /* ── AI / paid guides ── */

  "ai-social-helper": [
    {
      title: "Audit the client’s current social accounts",
      desc: "Open their Instagram, Facebook Page, or TikTok (with login access or screen-share). Screenshot bio, last 9 posts, and link-in-bio. Note posting frequency and which posts got most saves/shares.",
    },
    {
      title: "Draft a 2-week content calendar in Google Sheets",
      desc: "Columns: date, platform, post type (carousel/Reel/story), topic, CTA. Use ChatGPT (https://chatgpt.com/) to brainstorm 10 post ideas from their menu/services — human-edit every caption for local voice.",
    },
    {
      title: "Design templates in Canva Brand Kit",
      desc: "Canva (https://www.canva.com/) → Brand → add their hex colors and logo. Build 3 reusable templates: promo, testimonial quote, behind-the-scenes. Export correct sizes: IG square 1080×1080, story 1080×1920.",
    },
    {
      title: "Schedule posts in Meta Business Suite",
      desc: "https://business.facebook.com/ → Content → schedule Facebook/Instagram posts from the calendar. Batch one week in a 60-minute block; leave story slots manual for daily authenticity.",
    },
    {
      title: "Write on-brand captions with a CTA",
      desc: "Prompt ChatGPT: “Rewrite this promo in 120 words, friendly, no hype, include address hours.” Always add one question to boost comments. Hashtags: 3 local + 3 niche max.",
    },
    {
      title: "Report metrics weekly",
      desc: "Screenshot Insights: reach, profile visits, top post. Google Docs (Tools tab — sign in with Google, or use an account you already have) one-pager for client every Friday. Suggest one experiment next week (Reel vs. static).",
    },
  ],

  "ai-assets": [
    {
      title: "Define asset pack for one niche",
      desc: "Pick a niche you know: local bakery social pack, Etsy digital planner, or KDP coloring pages. List 10 assets: 5 PNG stickers, 3 Instagram templates, 2 PDF inserts.",
    },
    {
      title: "Generate concepts in ChatGPT + refine in Canva",
      desc: "ChatGPT (https://chatgpt.com/): “List 10 clip-art prompts for a coffee shop, flat vector, no text.” Build in Canva (https://www.canva.com/) Magic Media or draw simple shapes — avoid trademark logos.",
    },
    {
      title: "Export consistent sizes and naming",
      desc: "Folder structure: /PNG-transparent, /Canva-templates, /PDF-print. Filenames: coffee-cup-01.png. Include a README.txt with commercial use terms you intend.",
    },
    {
      title: "List on Etsy or Gumroad",
      desc: "Parent/guardian for teen accounts. Etsy: https://www.etsy.com/sell upload mockups from Canva scene templates. Gumroad: https://gumroad.com/ for instant ZIP delivery.",
    },
    {
      title: "Create listing SEO title and tags",
      desc: "Title pattern: “Coffee Shop Social Media Template Pack | Canva | Small Business.” Tags from Etsy search suggest — no misleading “official Canva” claims.",
    },
    {
      title: "Iterate from first 5 reviews",
      desc: "Ask buyers one improvement; add bonus asset v1.1 free to past buyers via Etsy message — builds repeat purchases.",
    },
  ],

  "local-business-ai-setup": [
    {
      title: "Discovery call: tools they already use",
      desc: "List POS, email (prefer Resend — https://resend.com/), site host (Cloudflare Pages — https://pages.cloudflare.com/; kick off builds in Antigravity — https://antigravity.google/; Supabase — https://supabase.com/ for data/auth), and social accounts. Goal: one AI win in week one — not ten logins day one. Meet on Google Meet with screen-share. Do not recommend WordPress.",
    },
    {
      title: "Create a shared AI policy doc",
      desc: "Google Docs (Tools tab — sign in with Google, or use an account you already have): approved tools (ChatGPT Team, Gemini), banned uses (medical advice, auto refunds), human review rule. Owner signs digitally.",
    },
    {
      title: "Set up ChatGPT Team or shared workspace",
      desc: "Parent/business owner creates account at https://chatgpt.com/ — invite staff. Custom instructions: brand voice, hours, address, services list.",
    },
    {
      title: "Build 5 everyday prompts as shortcuts",
      desc: "Reply to Google review, weekly special caption, job posting, FAQ email, meeting summary. Save in Doc titled “Staff Prompt Cards.”",
    },
    {
      title: "Connect Canva Brand Templates",
      desc: "Canva (https://www.canva.com/) Pro if budget allows — brand colors, logo, social sizes. Train one employee to duplicate template → export.",
    },
    {
      title: "30-day check-in and metrics",
      desc: "Track hours saved on email/social. Adjust prompts that hallucinate prices — feed current menu PDF into chat each session.",
    },
  ],

  "create-games-kids": [
    {
      title: "Parent opens ChatGPT or Gemini with the kid",
      desc: "Parent account only at https://chatgpt.com/ or https://gemini.google.com/. Kid suggests hero, setting, and win condition — no real names or school in the chat.",
    },
    {
      title: "Save GAME-IDEA in Google Docs (Tools tab)",
      desc: "Parent copies chat answers: title, 3 levels easy→hard, lose condition. Paste into Google Docs (Tools tab — sign in with Google, or use an account you already have) and name the file GAME-IDEA.",
    },
    {
      title: "Build in Scratch first",
      desc: "New project at https://scratch.mit.edu/ — one sprite, one backdrop, broadcast messages for level changes. Follow Getting Started cards under Ideas.",
    },
    {
      title: "Optional Antigravity path with GAME.md",
      desc: "ChatGPT writes GAME.md spec for https://antigravity.google/ — parent runs agent, kid playtests. Download IDE from https://antigravity.google/download .",
    },
    {
      title: "Playtest with 3 friends and fix one bug",
      desc: "Note where players die too fast or get stuck. Change one variable (speed, timer) — not ten at once.",
    },
    {
      title: "Share safely at school fair",
      desc: "Demo on laptop offline if Wi‑Fi fails. No itch.io publish without parent — no photos of players in promo.",
    },
  ],

  "create-games-junior": [
    {
      title: "Scope one-level game in ChatGPT",
      desc: "Guardian-approved session at https://chatgpt.com/: “Interview me until we have a one-screen browser game design — title, controls, art style, 60-min build plan.” Save Q&A to Docs.",
    },
    {
      title: "Generate GAME.md for Antigravity",
      desc: "Prompt includes folder layout, HTML+JS single file, acceptance tests, no accounts/payments. Save as GAME.md in empty project folder.",
    },
    {
      title: "Install Antigravity and build v1",
      desc: "https://antigravity.google/download — open folder, attach GAME.md, instruct: “Implement v1 only; stop when tests pass.” Guardian reviews diffs.",
    },
    {
      title: "Art pass in Canva or chat images",
      desc: "Export PNG sprites from Canva (https://www.canva.com/) 64×64 or use simple shapes in code first — polish later.",
    },
    {
      title: "Playtest, fix crash, optional itch.io demo",
      desc: "Fix one blocking bug before share. Publish free demo at https://itch.io/ only with guardian approval — page has no personal contact info.",
    },
    {
      title: "Write a short postmortem in Google Docs (Tools tab)",
      desc: "Three bullets: what worked in Antigravity, what broke, next feature for v2. Share with your guardian or classmates as a portfolio piece — link the itch.io or GitHub demo, not your home address.",
    },
  ],
};
