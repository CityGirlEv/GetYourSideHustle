/**
 * Hustle-specific step-by-step guides — replaces generic catalog launchSteps.
 * Every step names real tools, clicks, and https links where relevant.
 */

export type DetailedGuideStep = { title: string; desc: string };

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
};

/** How to get customers before you deliver — marketing plan first, then outreach. */
export function clientScoutSteps(cfg: ClientScoutConfig): DetailedGuideStep[] {
  const youth = cfg.youthFriendly !== false;
  const warm = youth
    ? `Kids & teens: ask a parent or guardian to help you text, call, or walk the block with you. Contact 8–12 people you already know — parents’ friends, neighbors, relatives, coaches, church or youth-group leaders. Sample text: “${cfg.examplePitch} ${cfg.examplePrice} Want me to put you on the list?” Do not publish your home address; meet at their place or a public spot with a parent.`
    : `Contact 8–12 warm leads first (neighbors, coworkers, friends, local group chats, former colleagues). Sample: “${cfg.examplePitch} ${cfg.examplePrice} Reply YES and I’ll book you.” Keep your full street address off public posts.`;

  const social = youth
    ? `With a parent: open https://www.facebook.com/pages/create and create a Page named like “${cfg.serviceLabel} by [First name].” Add your pitch, neighborhood or ZIP only (not your street), hours, and a parent email/phone for booking — never put a minor’s personal cell on a public page. Optional: Instagram at https://www.instagram.com/ and a Nextdoor post or Page at https://nextdoor.com/ (parent posts if under 18). After your first job, add one before/after photo (no license plates, no house numbers).`
    : `Create a Facebook Page at https://www.facebook.com/pages/create for your ${cfg.serviceLabel}. Add services, sample prices, and a booking phone or email. Optional: Instagram https://www.instagram.com/, LinkedIn https://www.linkedin.com/, and Nextdoor https://nextdoor.com/ — same pitch, clear “Message to book.”`;

  const channels = youth
    ? "phone calls (parent nearby), text/DM, printed flyer, email, Facebook Page, Nextdoor, school/church boards"
    : "phone calls, text/DM, email, printed flyer, LinkedIn, Facebook Page, Nextdoor, local boards, Craigslist Services";

  return [
    {
      title: "Decide on Marketing Objectives",
      desc: `Before you spend a dime, pick 2–3 channels for this month and write one measurable objective for each. Channel menu: ${channels}. Examples: “Book 3 discovery calls from LinkedIn,” “Hand out 25 flyers on my block,” “Text 12 warm contacts by Friday.” Save the plan in Google Docs (https://docs.google.com/) with your offer line: “${cfg.examplePitch}” / “${cfg.examplePrice}”`,
    },
    {
      title: "Make your marketing materials",
      desc: `Build only the assets your objectives need — keep the same offer, price, and contact on every piece. Typical kit: (1) phone/text script (2–4 lines), (2) one-page flyer in Canva (https://www.canva.com/ — Flyer US Letter), (3) short bio/About blurb for your Page or LinkedIn, (4) optional email signature or QR to book. Export PDF + PNG; print a small batch only after the flyer proof looks good.`,
    },
    {
      title: "Carry out the marketing plan",
      desc: `Run the channels you chose this week. Warm contacts: ${warm} Social: ${social} If Craigslist fits your city and category: post under Services at https://www.craigslist.org/ (parent helps if under 18) — neighborhood or landmark only, not your street. Also use Facebook Marketplace / local groups (https://www.facebook.com/marketplace) when it fits. Track each touch in a Sheet (date, channel, result). Reply the same day. Refresh ads weekly.`,
    },
  ];
}

/** Local / service hustles that must teach client scouting before delivery steps. */
export const SERVICE_CLIENT_SCOUT: Record<string, ClientScoutConfig> = {
  "errand-runner": {
    serviceLabel: "Errand Runner",
    examplePitch: "I run local errands (pharmacy, groceries, post office) and bring receipts.",
    examplePrice: "Usually $10 base + $5 per extra stop.",
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
    serviceLabel: "Yard Help",
    examplePitch: "I help with mowing, weeding, and yard tidy-ups.",
    examplePrice: "About $15–25/hr or a flat small-yard price.",
  },
  "pet-sitting": {
    serviceLabel: "Pet Sitting",
    examplePitch: "I pet-sit while you’re away — feeding, walks, and daily photo updates.",
    examplePrice: "Daily visit pricing by arrangement.",
  },
  "plant-watering": {
    serviceLabel: "Plant Watering",
    examplePitch: "I’ll water plants on a schedule — homes while you travel, or weekly care for your shop or office lobby plants.",
    examplePrice: "About $10–15 per visit.",
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
    serviceLabel: "Tech Helper",
    examplePitch: "I help neighbors with phones, Wi‑Fi, and simple computer setup.",
    examplePrice: "Session pricing by visit.",
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
      "I’m booking leaf blowing — driveway, walks, and lawns, curb-ready. This hustle qualifies for Free Mini Hand Held Blower entry (optional purchase available).",
    examplePrice: "Flat by area size.",
  },
  "beach-shell-jewelry": {
    serviceLabel: "Beach Shell Jewelry",
    examplePitch: "Handmade jewelry from beach shells — earrings, bracelets, and necklaces.",
    examplePrice: "About $8–22 per piece.",
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
    examplePrice: "About $10–25 for a simple invite.",
  },
  "canva-flyer-creator": {
    serviceLabel: "Flyer Design",
    examplePitch: "I design flyers in Canva for yard sales, clubs, and local events.",
    examplePrice: "About $15–40 design.",
  },
  "greeting-card-creator": {
    serviceLabel: "Custom Greeting Cards",
    examplePitch: "I make custom greeting cards (Canva or handmade).",
    examplePrice: "About $3–15 per card.",
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
    examplePitch: "Standard 2-bed clean — kitchen, baths, floors, dusting. Free re-clean on any missed spot.",
    examplePrice: "About $140 for a standard 2-bed (examples).",
    youthFriendly: false,
  },
  "ai-social-helper": {
    serviceLabel: "AI Social Media Helper",
    examplePitch: "I help small businesses draft and schedule social posts with AI — you approve before anything goes live.",
    examplePrice: "Weekly package pricing by number of posts.",
    youthFriendly: false,
  },
  "ai-prompt-helper": {
    serviceLabel: "AI Prompt Helper",
    examplePitch: "I build prompt packs and chat workflows so you get better AI answers for your business tasks.",
    examplePrice: "Flat pack or hourly session fee.",
    youthFriendly: false,
  },
  "ai-peers": {
    serviceLabel: "AI Peer Coffee Chat",
    examplePitch: "I host short peer sessions teaching practical AI tools for everyday work.",
    examplePrice: "Per-session fee (examples in the guide).",
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
    examplePitch: "I produce short promo clips with AI tools for your product or event.",
    examplePrice: "Flat fee per finished video.",
    youthFriendly: false,
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
};

/** Shared competitor-research step — injected into every launch guide. */
export const RESEARCH_COMPETITORS_STEP: DetailedGuideStep = {
  title: "Research Competitors",
  desc: "Before you finalize pricing or ads, spend 20–30 minutes studying who already serves your niche nearby (or online). Search Google Maps, Facebook, Nextdoor, Instagram, and — if appropriate — Craigslist for similar offers. Note their prices, packages, reviews, response time, and gaps (slow replies, no photos, weak guarantees). Write 3 takeaways: what you’ll match, what you’ll avoid, and one clear differentiator you can say in one sentence.",
};

/** Every side hustle names the business after competitor research. */
export const NAME_SIDE_HUSTLE_STEP: DetailedGuideStep = {
  title: "Pick a Name for Your Side Hustle Business",
  desc: "Choose a clear, memorable name for your side hustle business — something you can say in one breath and put on a flyer, Facebook Page, invoice, or Canva graphics. Check that a matching handle is available enough for you (Google, Instagram, Facebook Pages search). Write the name at the top of your Google Doc plan (https://docs.google.com/) and use it the same way everywhere.",
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
] as const;

export function guideUsesSavingsFoundation(guideId: string): boolean {
  return (SAVINGS_FOUNDATION_GUIDE_IDS as readonly string[]).includes(
    String(guideId || "").trim(),
  );
}

/** Every guide: always step 1 — get a thumbs-up from someone close before going further. */
export const PARENT_THUMBS_UP_STEP: DetailedGuideStep = {
  title: "Run This by Your Parent, Partner, Friend, or Someone Close",
  desc: "Run this by your Parent, Partner, Friend, or someone close to get feedback and advice. Shoot for a THUMBS UP!",
};

/** @deprecated Use PARENT_THUMBS_UP_STEP — same step for kids and teens. */
export const KIDS_SAFETY_RULES_STEP = PARENT_THUMBS_UP_STEP;
/** @deprecated Use PARENT_THUMBS_UP_STEP — same step for kids and teens. */
export const TEEN_CONSULT_PARENT_STEP = PARENT_THUMBS_UP_STEP;

const RESEARCH_COMPETITORS_TITLE_RE = /research\s+competitors/i;
const NAME_SIDE_HUSTLE_TITLE_RE =
  /pick a name for your side hustle( business)?|name (your |the )?(side[- ]?)?hustle|name (your |the )?(club|business|brand|service)\b/i;
const MARKETING_OBJECTIVES_TITLE_RE = /decide on marketing objectives/i;
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
 * 2) Pick a Name for Your Side Hustle Business (or an existing name-* step)
 * 3) Decide on Marketing Objectives when present
 * Savings guides (Piggy Bank goals):
 * 1) Plan What You’re Saving For (goal, cost, earn plan, weekly savings) — no competitors / business name
 * Then the rest of the guide in relative order.
 */
export function ensureGuideFoundationSteps(
  steps: DetailedGuideStep[],
  opts?: {
    audiences?: readonly GuideFoundationAudience[];
    /** Savings goals skip competitors + business naming. */
    foundation?: "business" | "savings";
  },
): DetailedGuideStep[] {
  const thumbsWanted = youthFirstStepForAudiences(opts?.audiences);
  const isSavings = opts?.foundation === "savings";

  if (!steps.length) {
    return isSavings
      ? [thumbsWanted, { ...SAVINGS_GOAL_PLAN_STEP }]
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

  if (isSavings) {
    // Authored savings steps (goal / cost / earn / weekly) follow thumbs-up.
    // Inject the overview only when the guide has no savings body yet.
    const hasSavingsBody = rest.some((s) =>
      /saving for|weekly savings|write the cost|plan how you will earn/i.test(s.title),
    );
    return [
      thumbsWanted,
      ...(hasSavingsBody ? [] : [savingsPlan ?? { ...SAVINGS_GOAL_PLAN_STEP }]),
      ...rest,
    ];
  }

  return [
    thumbsWanted,
    research ?? { ...RESEARCH_COMPETITORS_STEP },
    nameStep
      ? { ...nameStep, title: NAME_SIDE_HUSTLE_STEP.title }
      : { ...NAME_SIDE_HUSTLE_STEP },
    ...(marketingObjectives ? [marketingObjectives] : []),
    ...rest,
  ];
}

/** @deprecated Prefer ensureGuideFoundationSteps — kept for existing imports. */
export function ensureResearchCompetitorsStep(
  steps: DetailedGuideStep[],
  opts?: { audiences?: readonly GuideFoundationAudience[] },
): DetailedGuideStep[] {
  return ensureGuideFoundationSteps(steps, opts);
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
  return (BEFORE_AFTER_PHOTO_GUIDE_IDS as readonly string[]).includes(guideId);
}

export function stepsIncludeTakeBeforePhotos(steps: DetailedGuideStep[]): boolean {
  return steps.some((s) => /^take before photos$/i.test(s.title.trim()));
}

export function stepsIncludeTakeAfterPhotos(steps: DetailedGuideStep[]): boolean {
  return steps.some((s) => /take after photos|after photo/i.test(s.title));
}

/** Shared copy for transformation jobs — take before shots before you start work. */
export const TAKE_BEFORE_PHOTOS_STEP: DetailedGuideStep = {
  title: "Take Before Photos",
  desc: "Before you start, shoot clear phone photos of the work area from the same angles you’ll use after — wide shot plus any problem spots. No license plates, house numbers, or kids’ faces in frame. Keep them in a job album so you can prove progress and build a portfolio (with client permission).",
};

export const TAKE_AFTER_PHOTOS_STEP: DetailedGuideStep = {
  title: "Take After Photos",
  desc: "Reshoot from the same angles as your before photos. Text the after set to the client before asking for payment, and save both for your portfolio (crop private details).",
};

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
  steps = ensureGuideFoundationSteps(steps, {
    audiences: opts?.audiences,
    foundation: guideUsesSavingsFoundation(guideId) ? "savings" : "business",
  });
  if (guideRequiresBeforeAfterPhotos(guideId) && !stepsIncludeTakeBeforePhotos(steps)) {
    // After foundation / marketing / scout / youth-safety block when present.
    const insertAt =
      steps.length > 1 &&
      /decide on marketing|make your marketing|carry out the marketing|pitch — get a customer|research competitors|pick a name|name the |get parent thumbs up|set safety rules|consult parent|how you will advertise/i.test(
        steps.slice(0, 6).map((s) => s.title).join(" "),
      )
        ? Math.min(
            6,
            steps.findIndex(
              (s) =>
                !/marketing|competitors|pick a name|name the |get parent thumbs up|set safety rules|consult parent|pitch —|advertise/i.test(
                  s.title,
                ),
            ) >= 0
              ? steps.findIndex(
                  (s) =>
                    !/marketing|competitors|pick a name|name the |get parent thumbs up|set safety rules|consult parent|pitch —|advertise/i.test(
                      s.title,
                    ),
                )
              : 0,
          )
        : 0;
    const at = insertAt < 0 ? 0 : insertAt;
    steps = [...steps.slice(0, at), { ...TAKE_BEFORE_PHOTOS_STEP }, ...steps.slice(at)];
  }
  return steps;
}

/** True when the guide already teaches marketing channel choices. */
export function stepsIncludeMarketingChoices(steps: DetailedGuideStep[]): boolean {
  return steps.some((s) =>
    /decide on marketing objectives|make your marketing materials|carry out the marketing plan|how you will advertise|choose how you(?:'ll| will) market/i.test(
      s.title,
    ),
  );
}

export const DETAILED_GUIDE_STEPS: Record<string, DetailedGuideStep[]> = {
  rideshare: [
    {
      title: "Confirm you meet Uber / Lyft local requirements",
      desc: "Check current age, vehicle year, insurance, and background-check rules for your city on Uber (https://www.uber.com/us/en/drive/) and Lyft (https://www.lyft.com/driver). Do not apply until your car and license qualify — rules change by market.",
    },
    {
      title: "Apply and complete onboarding docs",
      desc: "Submit license, registration, proof of insurance, and profile photo in both apps (or start with one). Complete any vehicle inspection they require. Save approval emails in a Drive folder named “Rideshare docs.”",
    },
    {
      title: "Stage the car for passengers",
      desc: "Clean interior (vac + wipe), remove personal clutter, keep a phone mount and charger cable ready. Stock water or tissues only if your market allows and you can restock cheaply.",
    },
    {
      title: "Map your first peak windows",
      desc: "Note airport departures, downtown nightlife, and event nights on a one-week calendar. Pair later with AI Timing Scout for ZipCode hotspots — start with 2–3 fixed blocks you can actually drive.",
    },
    {
      title: "Go online for short practice blocks",
      desc: "Drive 2-hour blocks first. Track every trip: platform, miles, time online, tips. Screenshot end-of-shift earnings. Goal is learning pickup flow, not max hours day one.",
    },
    {
      title: "Log mileage and weekly P&L",
      desc: "Use a mileage app or Sheet from day one (IRS standard mileage). Once a week: total fares − gas − car washes − phone mount costs. Raise hours only on blocks that beat your $/hour target.",
    },
  ],

  "web-leads": [
    {
      title: "Pick a ZipCode + niche lane",
      desc: "Choose 1–2 niches (dentists, HVAC, salons, contractors) within ~20 miles. Write a one-line sample offer. Save prospects in Google Sheets or Docs (https://docs.google.com/).",
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

  consulting: [
    {
      title: "Define your niche and who you help",
      desc: "Write one sentence: industry + who you advise + outcome (e.g. “I help mid-career nurses move into healthcare admin roles with a 90-day plan”). List 3 problems you solve. Save in Google Docs (https://docs.google.com/). Skip “I advise anyone.”",
    },
    {
      title: "Build a simple rate card",
      desc: "Publish 2–3 packages: 30-min discovery (free or low fee), 60-min strategy session, and optional 3-session retainer. Example ranges only: $50–200/hr depending on niche depth — not a guarantee. State what’s included (agenda, notes, one follow-up email).",
    },
    {
      title: "Prep a discovery-call agenda",
      desc: "One-page outline: goals, current role/business, blockers, 90-day success, next step. Use Google Docs or Notion. Practice a 45-minute flow: 10 listen / 25 advise / 10 agree on homework.",
    },
    {
      title: "Deliver the first paid session and send notes",
      desc: "Meet on Zoom (https://zoom.us/) or in a public café. Take notes live; within 24 hours email a 5-bullet summary + 3 action items. Ask permission to use a one-line testimonial (no confidential details).",
    },
    {
      title: "Ask for referrals and a LinkedIn recommendation",
      desc: "After a strong session: “Who else in your network should hear about this?” Send a LinkedIn recommendation request (https://www.linkedin.com/) with a draft sentence they can edit. Track referrals in a Sheet.",
    },
    {
      title: "Productize a workshop or group cohort",
      desc: "Turn your best session into a 90-minute workshop or 4-week group (same agenda, more seats). Promote with the flyer and LinkedIn posts from your marketing plan. Raise 1:1 rates after 5 happy clients.",
    },
  ],

  "basic-invitation-creator": [
    {
      title: "Collect event details from the host",
      desc: "Text or call the host and write down: event name, date, start/end time, street address or venue, dress code (optional), and RSVP name + phone or email. Save these in a Notes app or Google Doc (https://docs.google.com/) so you can paste them into Canva without guessing.",
    },
    {
      title: "Open Canva and pick an invitation template",
      desc: "Go to https://www.canva.com/ → sign in (free account is fine) → click Create a design → search Templates for “birthday invitation” or “party invite.” Click a template that matches the vibe (kids, elegant, casual).",
    },
    {
      title: "Customize text, colors, and photos",
      desc: "Double-click headline text and replace with the event name and date. Use the Text tool for time, address, and RSVP line. Swap colors with the color picker; upload a photo via Uploads if the host sent one. Keep fonts readable at print size.",
    },
    {
      title: "Export PDF Print and PNG files",
      desc: "Click Share → Download → choose PDF Print for home or print-shop printing (with bleed if offered). Download a second copy as PNG for texting or email. Name files like Smith-Birthday-Invite.pdf.",
    },
    {
      title: "Send a proof and do one revision",
      desc: "Text the host the PNG preview: “Does this look right? One free text fix.” Fix typos or time changes in Canva, re-export, and resend. Do not print until they approve.",
    },
    {
      title: "Deliver files and optional printing",
      desc: "Email or AirDrop the final PDF/PNG. If they want prints, use your home printer or a local shop / library copier. Charge a flat fee ($10–25 for a simple invite is a fair example).",
    },
    {
      title: "Invoice and ask for a neighbor referral",
      desc: "Send a simple text invoice: “Invitation design $20 — Venmo @you or cash OK.” Ask: “Know anyone else with a party coming up?” Save the approved Canva file in a folder for fast reorders.",
    },
  ],

  "canva-flyer-creator": [
    {
      title: "Interview the client on flyer purpose",
      desc: "Ask what the flyer is for (yard sale, babysitting, bake sale, lost pet, club signup). Get the must-have lines: headline, date/time, location, price or free, and one contact (phone or QR). Write them in Google Docs before opening Canva.",
    },
    {
      title: "Start a flyer-sized design in Canva",
      desc: "Open https://www.canva.com/ → Create a design → search “Flyer (US Letter)” or “A4 flyer.” Browse Templates and pick one with big headline space and a clear footer for contact info.",
    },
    {
      title: "Drop in copy and high-contrast colors",
      desc: "Replace placeholder text with the client’s exact words. Use Canva’s Elements tab for simple icons (calendar, map pin). Avoid tiny fonts — flyers are read from 6 feet away. Check spelling twice.",
    },
    {
      title: "Add a QR code if they have a link",
      desc: "In Canva search Elements for “QR code” (or use https://www.qr-code-generator.com/ ) and paste their signup URL, Instagram, or Google Form. Place it bottom-right with “Scan to sign up.”",
    },
    {
      title: "Download print-ready PDF and share PNG",
      desc: "Share → Download → PDF Print for bulletin boards and shop windows. Also export PNG for group texts and Facebook neighborhood posts. Send both to the client for approval.",
    },
    {
      title: "Print test copy and adjust margins",
      desc: "Print one copy on plain paper at home or library. If text is clipped, nudge margins in Canva and re-export. Charge per flyer ($15–40 design) or add $5–15 if you handle printing.",
    },
    {
      title: "Post where the client wants visibility",
      desc: "With permission, tape copies on community boards, church lobbies, or local café windows. Take a photo of the posted flyer for your portfolio in Canva or Google Photos.",
    },
  ],

  "greeting-card-creator": [
    {
      title: "Pick the occasion and tone with the buyer",
      desc: "Confirm birthday, thank-you, sympathy, or holiday — and whether they want funny, heartfelt, or kid-made. Note inside message text (20–40 words) and whether they need a blank inside for handwriting.",
    },
    {
      title: "Design the cover in Canva or by hand",
      desc: "Digital path: https://www.canva.com/ → Create design → “Greeting card” or folded 5×7 template. Handmade path: cardstock, colored pencils, stickers from a craft drawer. Keep the front bold; save long messages for the inside.",
    },
    {
      title: "Set up inside text and envelope fit",
      desc: "In Canva add a second page for inside copy. Use 14–18 pt font for readability. If mailing, measure against a standard envelope (#10 or A2) so nothing gets cropped when folded.",
    },
    {
      title: "Export or photograph the finished card",
      desc: "Canva: Download PDF Print (front/back pages) or PNG. Handmade: photograph in daylight on a plain background; crop in your phone Photos app. Send preview before final print or delivery.",
    },
    {
      title: "Print at home or order a small run",
      desc: "Home printer on cardstock (110 lb is ideal) or library color printer. For multiples, export PDF and use a print shop quote. Price single cards $3–8 handmade, $5–15 custom Canva sets.",
    },
    {
      title: "Hand-deliver or mail with parent help",
      desc: "Kid sellers: parent handles stamps and addresses. Include a sticky note: “Made by [first name only].” Ask the buyer to show the card to one friend who might order for the next holiday.",
    },
  ],

  "digital-cookbook-creator": [
    {
      title: "Gather recipes and stories from the family",
      desc: "Interview a parent or grandparent over FaceTime. Collect 8–15 recipes with ingredients, steps, serving size, and one memory line each. Paste everything into Google Docs (https://docs.google.com/) in one shared doc.",
    },
    {
      title: "Organize sections and standardize formatting",
      desc: "Create headings: Appetizers, Mains, Desserts, Family Favorites. Use the same format for every recipe: title, prep time, ingredients bullet list, numbered steps. Fix typos; do not change grandma’s wording without asking.",
    },
    {
      title: "Add photos in Canva or Docs",
      desc: "Scan or phone-photo dish pictures. In Canva (https://www.canva.com/) start a “Photo book” or “Document” layout — one recipe per page with a photo strip. Or keep it simple in Google Docs with Insert → Image.",
    },
    {
      title: "Design a cover and title page",
      desc: "In Canva search “cookbook cover.” Add family name + “Recipes & Stories.” Export cover as PNG; keep the interior in Docs or Canva multipage PDF.",
    },
    {
      title: "Export a shareable PDF",
      desc: "Google Docs: File → Download → PDF. Canva: Download PDF Print. Name it like Johnson-Family-Cookbook-2026.pdf. Email a proof PDF to the family for one round of edits.",
    },
    {
      title: "Optional print via Amazon KDP or local shop",
      desc: "For printed copies, parent can upload PDF to Amazon KDP (https://kdp.amazon.com/) as a low-cost paperback — verify trim size. Or print spiral-bound at Office Depot / Staples. Charge $50–150 for design depending on page count.",
    },
    {
      title: "Deliver files and backup to Drive",
      desc: "Send final PDF by email and upload to Google Drive with view-only link. Ask for a testimonial line you can reuse: “We finally saved all of Nana’s recipes in one place.”",
    },
  ],

  "family-photo-slideshow": [
    {
      title: "Collect photos and the event storyline",
      desc: "Ask the family for 30–80 photos (birthdays, vacations, holidays) via Google Photos shared album, AirDrop, or USB. Note the occasion (retirement party, anniversary) and song preference if they want music.",
    },
    {
      title: "Sort photos chronologically or by theme",
      desc: "In Google Photos (https://photos.google.com/) or your computer folder, order images: childhood → teens → today, or “Summer at the lake” chapters. Delete duplicates and blurry shots.",
    },
    {
      title: "Build the slideshow in Canva or CapCut",
      desc: "Canva: https://www.canva.com/ → Video → “Slideshow” template → upload photos, set 3–5 seconds per slide, add title cards. CapCut (https://www.capcut.com/): import photos, add transitions and licensed music from CapCut’s library.",
    },
    {
      title: "Add captions, dates, and one opening title",
      desc: "Keep captions short: names and year only — no full addresses. Opening slide: “The Martinez Family — 40 Years.” End slide: “Happy Anniversary!” Export 1080p MP4.",
    },
    {
      title: "Preview with the family and trim length",
      desc: "Target 3–6 minutes for parties. Send a private YouTube link (Unlisted) or text the MP4. Fix photo order or typos once; charge extra for major re-edits.",
    },
    {
      title: "Deliver MP4 and optional USB",
      desc: "Email/Drive link for the MP4. Optional: copy to a labeled USB for the party venue AV person. Price $40–120 depending on photo count and music licensing needs.",
    },
    {
      title: "Archive project files for repeat customers",
      desc: "Save the CapCut or Canva project and a folder of exported slides. Offer annual “add new year’s photos” updates for a smaller fee.",
    },
  ],

  "dog-walk": [
    {
      title: "Meet the dog and owner on a trial walk",
      desc: "Walk with the owner once to learn the dog’s name, leash manners, triggers (squirrels, other dogs), and where waste bags live. Confirm vet contact and whether the dog is allowed off-leash (usually no).",
    },
    {
      title: "Agree on schedule, route, and price",
      desc: "Set fixed days/times (e.g., Mon/Wed/Fri 4 pm, 20 minutes). Stick to sidewalks and neighborhood paths the owner approves. Example pricing: $12–18 per walk for one dog; write it in a text thread both sides save.",
    },
    {
      title: "Pack your walk kit every time",
      desc: "Bring poop bags, a spare leash clip if you have one, water in summer, and your phone fully charged. Wear reflective gear at dusk. Never use retractable leashes unless the owner insists and you’re trained.",
    },
    {
      title: "Send a start and finish text",
      desc: "Text the owner when you pick up and when you drop off: “Started walk with Bella” / “Bella home, water refreshed.” Include one fun detail — “She made a friend at the park bench.”",
    },
    {
      title: "Lock up and secure the home",
      desc: "If you enter the house, follow their rule: leash on before opening the door, lock deadbolt on exit, don’t adjust thermostat. Never share house codes with friends.",
    },
    {
      title: "Track walks and payments weekly",
      desc: "Use Notes or a simple Google Sheet: date, duration, paid Y/N. Collect weekly via Venmo/Cash App or cash Sunday. Ask satisfied owners for one intro to another dog neighbor.",
    },
  ],

  "yard-help": [
    {
      title: "Walk the yard with the homeowner",
      desc: "Ask which beds to weed, where the hose/spigot is, and whether they want lawn mowing or just edging. Note poison ivy, bee nests, or fragile plants to avoid.",
    },
    {
      ...TAKE_BEFORE_PHOTOS_STEP,
      desc: "Photograph the lawn, beds, and walkways from the curb and from the porch before you touch anything. Same angles later prove the tidy-up.",
    },
    {
      title: "Confirm tools and disposal rules",
      desc: "Use their mower, rake, and trimmers when possible — $0 startup. Ask where yard waste bags go (curb pickup day?) and whether they have gloves you should wear. Buy nothing until a job repeats.",
    },
    {
      title: "Weed, rake, or mow in a set order",
      desc: "Typical order: mow open lawn → edge walkways → weed beds → rake clippings → water if asked. Work when dry grass won’t clump. Bag debris per city rules.",
    },
    {
      title: "Water plants if included in the job",
      desc: "Use the hose or watering can on the schedule they give (deep soak vs. sprinkle). Don’t overwater succulents. Text if a sprinkler head is broken — don’t DIY plumbing.",
    },
    {
      title: "Snow shoveling seasonal add-on",
      desc: "In winter, offer driveway/sidewalk clearing after storms. Use their shovel or a lightweight pusher. Salt only if they provide it and approve where to spread.",
    },
    {
      title: "Take After Photos and collect payment",
      desc: "Reshoot from the same curb/porch angles. Send after photos with “Done — 1 hr” text. Charge $15–25/hr youth helper rates or $30–50 flat for a small yard. Book recurring weekly slots in spring/fall.",
    },
  ],

  crafts: [
    {
      title: "Pick one craft lane to sell first",
      desc: "Choose a single line: polymer clay charms, friendship bracelets, sticker sheets, crochet coasters, or painted rocks. One lane = faster mastery and clearer pricing. Browse Etsy (https://www.etsy.com/) for style ideas — do not copy trademarked characters.",
    },
    {
      title: "Cost your materials per unit",
      desc: "List supply cost for 10 items (clay pack, cord, beads, bags). Divide by 10 for unit cost. Target selling price at 2–3× materials plus $5–10 for your time on simple pieces.",
    },
    {
      title: "Photograph makes on a clean background",
      desc: "Use daylight near a window, white poster board, and your phone. Take 3 angles and one “in hand” shot for scale. Edit brightness in Canva (https://www.canva.com/) — no filters that change colors.",
    },
    {
      title: "Set up a simple sales table or Etsy draft",
      desc: "Local: school fair, farmers market with parent permission, or neighborhood Instagram story. Online: parent helps create Etsy shop at https://www.etsy.com/sell — draft listings with your photos and clear titles (“Handmade Clay Cat Charm — Nickel Free”).",
    },
    {
      title: "Pack orders with a thank-you card",
      desc: "Use cello bags, tape, and a handwritten thank-you. For shipping, weigh on a kitchen scale and buy labels via Etsy or Pirate Ship. Never put your full address on public listings — use city only.",
    },
    {
      title: "Track inventory in a notebook or Sheet",
      desc: "Google Sheets: item, qty made, qty sold, revenue. Restock only what sold in 2 weeks. Reinvest 50% of profit into materials after the first successful fair.",
    },
  ],

  "tech-helper": [
    {
      title: "Book a calm intake at their kitchen table",
      desc: "Ask what device (iPhone, Android, iPad, laptop) and the top 3 goals: “video call grandkids,” “text photos,” “stop spam calls.” Write goals on paper — seniors remember paper better than texts.",
    },
    {
      title: "Set large text and simple home screen",
      desc: "iPhone: Settings → Display & Brightness → Text Size / Larger Text. Android: Settings → Display → Font size. Remove unused app icons; keep Phone, Messages, Photos, and one video app (FaceTime or Google Meet https://meet.google.com/).",
    },
    {
      title: "Teach one skill per visit",
      desc: "Visit 1: send a photo in Messages. Visit 2: start a Meet call. Visit 3: save contacts with photos. Repeat the same steps slowly; let them tap while you point — don’t take the phone away the whole time.",
    },
    {
      title: "Write cheat-sheet steps they can photograph",
      desc: "Type 5-step instructions in large font in Google Docs, print or text a photo of the sheet. Title: “How to FaceTime Emma.” Number every tap (“1. Tap green Phone icon”).",
    },
    {
      title: "Security basics without fear",
      desc: "Show how to ignore unknown links, update iOS/Android when home Wi‑Fi is strong, and use a simple passcode they can remember. Do not install remote-access apps unless a trusted family member approves.",
    },
    {
      title: "Charge by the visit and offer a bundle",
      desc: "Example: $20 for 30 minutes, $120 for six visits prepaid. Log visit dates in Notes. Ask if their church or senior center needs a group workshop — parent/guardian present for youth helpers.",
    },
  ],

  homework: [
    {
      title: "Align with the parent on subjects and limits",
      desc: "Confirm grade level, subjects (reading, spelling, math facts), and rules: you guide, you don’t do assignments for them. Ask for teacher expectations or a sample worksheet.",
    },
    {
      title: "Set a quiet weekly time block",
      desc: "Same day/time reduces fights — e.g., Tue/Thu 4–4:45 pm at kitchen table or library. Bring pencils, scratch paper, and a timer. Phones in another room unless the assignment needs a calculator app.",
    },
    {
      title: "Use the read-cover-retell method for reading",
      desc: "Student reads aloud one page, covers it, retells in their words. You praise specifics: “You remembered the dragon’s color.” Track minutes read on a sticky note for the parent.",
    },
    {
      title: "Drill math with flashcards or free apps",
      desc: "Grades K–3: addition/subtraction flashcards. Optional: Khan Academy Kids (https://learn.khanacademy.org/khan-academy-kids/) with parent permission. Stop after 15 minutes of drills — short wins beat marathons.",
    },
    {
      title: "Check work without giving answers",
      desc: "Ask “How did you get that number?” If stuck, show a similar example on scratch paper — never copy their homework answers. Note tricky topics for the parent email.",
    },
    {
      title: "End with a 2-sentence summary to the parent",
      desc: "Text: “Today we practiced 7× tables and read 12 min of chapter 2. Struggled with carrying — suggest one more worksheet.” Charge $12–20/hr depending on age and local norms.",
    },
  ],

  "pet-sitting": [
    {
      title: "Do a meet-and-greet with pets and supplies",
      desc: "Learn feeding amounts, treat rules, litter box location, and where leashes/carriers live. Note meds with written instructions — don’t guess doses. Save vet phone and emergency contact in your phone favorites.",
    },
    {
      title: "Agree on drop-in vs. overnight scope",
      desc: "Drop-in: 1–2 visits/day, 20–30 min each. Overnight: only with parent/guardian approval for youth sitters. Price examples: $15–25 per drop-in, $50–75 overnight. Put dates in a shared calendar.",
    },
    {
      title: "Follow the owner’s checklist every visit",
      desc: "Feed → fresh water → walk or play → scoop litter → quick home check (mail piled visibly?). Take one photo of happy pet per day and text — not live location publicly.",
    },
    {
      title: "Secure doors and don’t invite friends over",
      desc: "Lock all doors you use; set thermostat as instructed. No additional visitors or your own pets without written owner OK. Never post house interiors on social media.",
    },
    {
      title: "Handle emergencies with the vet list first",
      desc: "If pet seems ill, call owner, then vet on their card. Transport only if owner pre-authorized and an adult drives. Document what happened in a timestamped note.",
    },
    {
      title: "Return keys and debrief in person",
      desc: "Hand keys back the day they return; walk through any issues (chewed shoe, skipped walk). Leave a short written log in Google Docs. Ask for repeat booking on their next trip.",
    },
  ],

  "plant-watering": [
    {
      title: "Pitch local businesses too — not only vacation homes",
      desc: "Don’t forget shops and offices: salons, cafés, boutiques, dental/medical waiting rooms, coworking lobbies, and realtor offices often have plants nobody “owns.” Drop in with a parent if under 18; leave a simple flyer or say: “I water lobby plants weekly so they stay healthy — about $10–15 per visit or a flat monthly route fee.” Recurring business stops beat one-off travel jobs for steady cash.",
    },
    {
      title: "Label every plant with water needs",
      desc: "Walk the home or shop with the owner; mark each plant “daily / twice weekly / weekly / skip.” Note which pots are succulents vs. tropical. Photo each plant with a sticky note number for your reference.",
    },
    {
      title: "Learn hose, sink, and drainage spots",
      desc: "Find watering cans, mister bottles, and where to dump excess water. Check saucers so hardwood floors don’t stain. Ask about fertilizer — usually skip unless they leave exact bottles and doses. At businesses, ask who locks up and where the break-room sink is.",
    },
    {
      title: "Build a visit calendar for travel dates and shop routes",
      desc: "Google Calendar entries for every day a client is gone: “Smith plants — morning porch, evening indoor.” For businesses, set a weekly route day (e.g. every Tuesday). Include key/lockbox pickup time and emergency contact.",
    },
    {
      title: "Water deeply but don’t flood",
      desc: "Water until a little drains from bottom holes, then stop. For outdoor pots in summer, early morning is best. Text one photo of the healthiest bloom mid-week as proof of life — same for shop managers who aren’t on site daily.",
    },
    {
      title: "Report problems immediately",
      desc: "Yellow leaves or broken stems — text photos, don’t prune heavily without permission. If a plant dies despite care, document dates watered for honesty.",
    },
    {
      title: "Charge per visit, trip package, or monthly business route",
      desc: "Example: $10–15 per visit, $60 for a week of daily vacation visits, or a flat monthly fee for a small office/salon plant list. Offer plant-watering bundled with mail pickup if you also run vacation helper services.",
    },
  ],

  handyman: [
    {
      title: "Scope the job with photos before quoting",
      desc: "Ask the homeowner to text wide shots and close-ups of the repair (loose railing, leaky faucet trim, TV mount wall). Confirm you’re licensed for the task locally — youth/adults skip electrical panel work and gas lines.",
    },
    {
      title: "List tools and parts for one trip",
      desc: "Pack screwdriver set, drill, level, tape measure, pliers, and drop cloth. Buy parts after approval (Home Depot / Lowe’s) and keep receipts. Charge materials at cost + tax unless you pre-agree a flat materials fee.",
    },
    {
      title: "Confirm shutoffs before water or demo",
      desc: "Locate water shutoff under sink or at meter before changing a faucet cartridge. For drywall anchors, use a stud finder app or knock test. Never cut walls if owner hasn’t marked OK.",
    },
    {
      title: "Protect floors and clean up daily",
      desc: "Shoe booties or removed shoes indoors; vacuum metal shavings. Leave work area broom-clean even if the job spans two days. Before/after photos go in a Google Photos album for portfolio.",
    },
    {
      title: "Write a simple scope note and price",
      desc: "Google Docs one-pager: tasks done, parts used, labor hours, total due. Example labor $45–85/hr depending on market and skill. Collect deposit on jobs over $200 if materials are special-order.",
    },
    {
      title: "Follow up in 48 hours",
      desc: "Text: “Everything still working OK?” Fix small punch-list items once if it’s a workmanship issue. Ask landlords for repeat work on turnover units.",
    },
  ],

  "cleaning-service": [
    {
      title: "Define your cleaning packages",
      desc: "Write clear packages clients can buy: e.g. Standard 2-bed (kitchen, baths, floors, dusting), deep clean (+40–60%), and move-out after a walkthrough. Put the same package names and example prices on every flyer and Page — free re-clean on any missed spot is a strong differentiator.",
    },
    {
      title: "Write a room-by-room checklist in Google Docs",
      desc: "Bath: toilet, sink, shower, mirrors, floors. Kitchen: counters, sink, stove top, microwave inside, floors. Living areas: dust surfaces, vacuum/sweep, empty trash. Share the checklist with the client so expectations match.",
    },
    {
      title: "Build a portable cleaning kit",
      desc: "All-purpose cleaner, bathroom cleaner, glass spray, microfiber cloths, scrub brush, gloves, trash bags, plus a vacuum and mop you can carry (if the client doesn’t provide them). Prefer fragrance-light products unless the client requests otherwise. Restock after every 3–4 jobs.",
    },
    {
      title: "Walk the home before you start",
      desc: "Confirm pets, no-go rooms, breakables, and parking. Note stain priorities. Take quick before photos (phone) of problem spots so you can prove progress after.",
    },
    {
      title: "Work top-to-bottom, dry-to-wet",
      desc: "Dust high shelves first, then surfaces, then floors last. Do bathrooms and kitchen carefully — clients judge those rooms hardest. Leave a sticky note: “Done — text me if anything needs a touch-up.”",
    },
    {
      title: "Price packages and lock recurring slots",
      desc: "Examples: studio/1-bed $90–130, 2-bed $120–180, 3-bed $160–240; deep clean +40–60%; move-out quote after a walkthrough. Ask every happy client for a weekly or biweekly standing slot — recurring beats one-offs.",
    },
  ],

  "handyman-light": [
    {
      title: "Stick to an approved light task list",
      desc: "Offer furniture assembly (IKEA), picture hanging, smoke-detector battery swaps, caulk touch-ups, and closet organizing — no roof, electrical panel, or structural demo. Text the list to clients so expectations match.",
    },
    {
      title: "Bring a minimal tool belt",
      desc: "Hammer, multi-bit screwdriver, stud finder, level, pencil, painter’s tape, and Command strips for renters. Use their hardware when possible to avoid wrong screws.",
    },
    {
      title: "Assemble furniture with the manual open",
      desc: "Lay parts on a blanket; match diagram numbers to bags. Tighten evenly — don’t strip IKEA cam locks. Bag leftover parts and tape to the underside of the table with a note.",
    },
    {
      title: "Hang art at eye level with anchors",
      desc: "Mark 57–60″ center height for frames. Use anchors rated for weight; for drywall only, use toggle or self-drill anchors. Vacuum dust immediately.",
    },
    {
      title: "Time-box declutter coaching sessions",
      desc: "Set a 2-hour block: sort keep/donate/trash, label three bins, stop when timer ends. Don’t haul away donations without adult transport arranged.",
    },
    {
      title: "Invoice flat rates for common jobs",
      desc: "Examples: $60–90 per IKEA dresser, $40 for TV picture mount consult + hang, $35/hr declutter assist. Payment on completion via check or Venmo.",
    },
  ],

  "gift-wrapping": [
    {
      title: "Stock wrap, tape, scissors, and tags",
      desc: "Buy or reuse kraft paper, tissue, ribbon, and double-sided tape for clean seams. Keep a bone folder or credit card edge for crisp folds. Sort paper rolls in a under-bed bin for transport.",
    },
    {
      title: "Price by box size and bow level",
      desc: "Post simple tiers: small box $3, medium $5, large $7, luxury bow +$2. Odd shapes (bikes, wine) = custom quote. Confirm whether client supplies paper or you do (mark up paper 20%).",
    },
    {
      title: "Measure paper with the box diagonal trick",
      desc: "Place box on paper; paper must wrap all sides with 2″ overlap. Cut once. Use double-sided tape on seams hidden underneath — no visible scotch on glossy paper.",
    },
    {
      title: "Add tags without full names on public displays",
      desc: "Write “To: Mom” on tags; keep surnames private at mall booths. Use stick-on bows or tie ribbon knots that flatten for stacking in car trunks.",
    },
    {
      title: "Run holiday pop-up hours with a parent",
      desc: "Set up a folding table at church bazaar or driveway with sanitizer and a cash box. Take photos (no addresses) for Instagram with parent account. Peak: first two weekends of December.",
    },
    {
      title: "Offer pickup/drop-off for busy parents",
      desc: "Neighbors drop unwrapped gifts in a labeled bin on your porch; you wrap and text when ready. Bundle 10 gifts for a 10% discount to fill your calendar early.",
    },
  ],

  "lemonade-stand": [
    {
      title: "Pick a safe spot with parent approval",
      desc: "Choose your driveway, cul-de-sac, or school fair booth — never busy roads. Check if your town needs a temporary permit (city website). Parent handles any food-safety questions.",
    },
    {
      title: "Cost ingredients and set cup price",
      desc: "Recipe: 1 cup lemon juice, 1 cup sugar, 6 cups water = ~8 cups. Count cup cost (lemons + sugar ÷ servings). Price $1–2 per cup so you earn after supplies — write prices on poster board.",
    },
    {
      title: "Make a sign in Canva or by hand",
      desc: "Big letters: “Lemonade $1 — Cash/Venmo.” Add ice graphic from Canva (https://www.canva.com/) printed at home. Tape to a folding table at kid eye level.",
    },
    {
      title: "Food safety: ice, lid, and hand wash",
      desc: "Keep pitcher on ice in a cooler; use a ladle, not fingers. Paper cups only; trash bag attached to table. Wash hands before setup — hand sanitizer visible for customers.",
    },
    {
      title: "Run a 2-hour shift with a float",
      desc: "Start with $5–10 in quarters for change. Track sales on a tally sheet: hash marks per cup. Parent supervises money handling for younger kids.",
    },
    {
      title: "Count profit and save for reinvestment",
      desc: "Revenue minus lemon/sugar/ice/cups = profit. Photograph the tally sheet for school project credit. Split profit: 50% spend, 50% save in piggy bank per family rule.",
    },
  ],

  "trash-can-service": [
    {
      title: "Learn pickup day and bin colors",
      desc: "Ask neighbors which day trash vs. recycling runs (city site or sticker on bin). Note if they use green waste carts. Write a street calendar in Google Sheets: address, trash day, recycling week A/B if applicable.",
    },
    {
      title: "Agree on curb times and return rules",
      desc: "Typical: roll to curb by 6 pm night before, return to side yard by 8 pm after pickup. Some HOAs fine late bins — charge $5–10 per stop per house for roll-out + return.",
    },
    {
      title: "Use gloves and check lid closure",
      desc: "Work gloves prevent cuts; tilt bins don’t overfill (lids must close or trucks skip). If bin is heavy, two-person lift with parent help — no back injuries for kids.",
    },
    {
      title: "Text confirmation photo optional",
      desc: "Send a quick photo of bins at curb for snowbird clients who travel. No house numbers visible in public posts — crop the photo.",
    },
    {
      title: "Monthly billing for recurring route",
      desc: "Group 8–15 houses on the same trash day. Collect $20–40/month per home via Venmo on the 1st. Skip service weeks only if they notify you — credit $5.",
    },
    {
      title: "Add storm and holiday schedule notes",
      desc: "When city delays pickup (snow, holidays), check https://www.google.com/search?q=your+city+trash+schedule and shift your route. Text the block: “Pickup moved to Friday — still handling bins.”",
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

  "mothers-helper": [
    {
      title: "Make a list of potential Helper Tasks",
      desc: "Do this before you invent an “offer.” In Google Docs (https://docs.google.com/) or Notes, write 8–12 small tasks a parent might want help with while they stay home — examples: tidy toys into bins, set out a simple snack with parent OK, read aloud / play a board game, fold a small laundry pile, wipe highchair tray, set the table, pack a diaper bag for an outing, walk the dog with parent watching, entertain a toddler while parent cooks. Mark each: indoor / outdoor, with-parent-only, and “I can do this today.” Cross off anything that is solo babysitting, bathing, medicine, driving, or being alone with kids — this hustle is helper work with a parent present.",
    },
    {
      title: "Price those helper jobs",
      desc: "Pick 3–5 tasks from your list and write a flat price next to each (examples only, not guarantees): $10 toy tidy, $15 play-and-snack hour, $20 two-hour helper block, $8 fold laundry basket. Prefer flat fees over vague hourly. Put the mini price menu in the same Doc. Ask a parent/guardian to review prices before you share them.",
    },
    {
      title: "Decide how you will advertise (pick your channels)",
      desc: "Choose 2 channels only for week one from this menu: (1) warm texts — parent helps you message 5–8 trusted families (“I help with toys, snacks, and play while a parent is home — menu + prices attached”), (2) a simple Canva flyer (https://www.canva.com/) or Notes screenshot of your task menu, (3) optional with a parent: one post in a neighborhood Facebook group or Nextdoor (https://nextdoor.com/) — parent posts if you’re under 18; never put your street address or a minor’s personal cell on a public post. Save your pitch line: “Babysitter’s Helper — parent stays home.”",
    },
    {
      title: "Deliver the first small job",
      desc: "Book one short session (30–90 minutes) with a family you already know. Confirm in writing: which tasks from your menu, flat price, date/time, and that a parent will remain home. Arrive on time, do only the agreed tasks, leave the space tidier than you found it. Text when finished: “Done — thank you!” Collect payment as arranged with your parent/guardian.",
    },
    {
      title: "Ask for a short review and a next booking",
      desc: "Ask for a 1–2 sentence parent note (“Helpful, reliable, great with toys”) and whether they want a standing weekly helper hour. Offer the same menu prices for a return visit — don’t invent new tasks mid-job without asking.",
    },
  ],

  "leaf-raking": [
    {
      title: "Highlight Free Mini Hand Held Blower entry",
      desc: "This Leaf Blowing Service qualifies for entry for a Free Mini Hand Held Blower. Put that on your flyer. Optional: purchase a Mini Hand Held Blower now if you want gear before any drawing — free entry still applies.",
    },
    {
      title: "Quote by area size",
      desc: "Walk the property: driveway only, front lawn, or full lot. Ask if they want bagging to curb. Price examples: $25 / $45 / $80 flat in peak leaf season.",
    },
    {
      title: "Bring bags, gloves, rake — and optional Mini Hand Held Blower",
      desc: "Yard bags per city rules, work gloves, and a rake. Optional purchase: Mini Hand Held Blower for faster walkways. Wear eye/ear protection with any blower.",
    },
    {
      title: "Blow toward one pile per zone",
      desc: "Start farthest from disposal; work downhill when possible. Don’t leave piles on storm drains. Bag or mulch per the homeowner’s preference.",
    },
    {
      title: "Bag, label, and place for pickup",
      desc: "Fill bags ¾ full for lift safety; place at curb per city yard-waste rules. Sweep the sidewalk — that’s your signature finish.",
    },
    {
      title: "Book repeat visits after windy nights",
      desc: "Text the street after storms: same rate if booked by Sunday. Keep 3–5 fall regulars.",
    },
  ],

  "beach-shell-jewelry": [
    {
      title: "Check beach collecting rules with a parent",
      desc: "Before you pick up a single shell, confirm the beach allows collecting (city/park site or posted signs). Skip live animals, protected species, and parks that ban removing shells. Parent comes on every beach trip.",
    },
    {
      title: "Collect, rinse, and fully dry shells",
      desc: "Gather only empty shells in a mesh bag. At home: soak in fresh water, scrub gently with an old toothbrush, rinse salt off, and air-dry 24–48 hours so jewelry doesn’t smell or rust findings.",
    },
    {
      title: "Sort shells by size for earrings vs pendants",
      desc: "Small matched pairs → earrings. Medium flat shells → pendants. Tiny chips → bracelet accents. Discard cracked pieces. Photograph your best 10 for inventory.",
    },
    {
      title: "Make 3 sample pieces (parent helps with tools)",
      desc: "Start simple: cord necklace with one pendant, bracelet with 3–5 shells on elastic, earring pair with jump rings + hooks. Parent operates any drill or sharp pliers. Work on a towel so shells don’t roll.",
    },
    {
      title: "Price each piece and photograph in daylight",
      desc: "Materials + time × 2–3. Example targets: earrings $8–15, necklace $12–22, set $22–35. White poster-board photos on your phone; optional Canva collage (https://www.canva.com/) for a price sheet.",
    },
    {
      title: "Sell locally with parent-run posts",
      desc: "Neighbors, school fair, beach-town stand, or parent Facebook/Nextdoor post. Use a first-name-only shop name. Never put a kid’s personal cell on a public listing — parent contact only.",
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

  "car-interior-cleanup": [
    {
      title: "Inspect car and agree on scope",
      desc: "Check seats, floor mats, cup holders, trunk. Confirm no biohazards (mold, needles) — those are adult pros only. Price by vehicle size: compact $40, SUV $60, minivan $75 examples.",
    },
    {
      ...TAKE_BEFORE_PHOTOS_STEP,
      desc: "Photograph the cabin from the driver door and the back seat before you vacuum — floors, seats, and cup holders. No license plates or kids’ faces. Same angles after prove the clean.",
    },
    {
      title: "Gather vac, microfiber, and safe cleaners",
      desc: "Shop vac or home vacuum with hose, microfiber cloths, mild all-purpose cleaner (diluted), glass cleaner for inside windshield, lint roller for pet hair. Avoid harsh bleach on upholstery.",
    },
    {
      title: "Remove trash and floor mats first",
      desc: "Trash bag all cups and wrappers; shake mats outside. Vacuum mats separately then car floors front-to-back. Use crevice tool for seats and between console.",
    },
    {
      title: "Wipe surfaces and streak-free glass",
      desc: "Damp microfiber on dash and doors — not soaking electronics. Dry glass with second cloth. Replace air freshener only if owner supplies one.",
    },
    {
      ...TAKE_AFTER_PHOTOS_STEP,
      desc: "Reshoot from the same driver-door and back-seat angles. Send the after set to the client before payment; crop private details for your portfolio.",
    },
    {
      title: "Schedule monthly for family fleets",
      desc: "Offer $10 off when booking 3 cars same driveway. Keep supplies in a milk crate in your trunk for route days.",
    },
  ],

  "holiday-decorating-helper": [
    {
      title: "Walk through décor plan and storage boxes",
      desc: "Label owner boxes “indoor,” “outdoor,” “fragile.” Note ladder heights needed — kids don’t climb extension ladders; adults only. Confirm outlet locations for lights.",
    },
    {
      title: "Test lights before hanging",
      desc: "Plug each string on the ground; replace bulbs from spare pack owner provides. Use outdoor-rated extension cords and timers from Home Depot — don’t overload one outlet.",
    },
    {
      title: "Hang wreaths, garland, and mantle pieces",
      desc: "Command hooks for renters; nails only with owner OK. Step ladder max 2 steps for teens with spotter. Symmetry check from street — one person outside radios adjustments.",
    },
    {
      title: "Set timer and tidy wire runs",
      desc: "Hide cords along gutters with clips; no trip hazards on walkways. Set timer 4:30 pm–11 pm default; adjust per HOA rules.",
    },
    {
      title: "Pack takedown date on calendar",
      desc: "Book January takedown now at 50% of install price. Label broken items in a “repair” bag for owner.",
    },
    {
      title: "Charge package pricing",
      desc: "Example: $150 front porch only, $350 whole-house with adult ladder team. Photos for next year’s Canva marketing flyer (with permission).",
    },
  ],

  "recycling-helper": [
    {
      title: "Learn local recycle rules",
      desc: "Search “[city] recycling guidelines” for what goes in blue bin vs. trash (plastic #1–2, clean cardboard, no plastic bags). Save PDF on phone for quick checks at curb.",
    },
    {
      title: "Sort countertop pile for elderly neighbors",
      desc: "Weekly visit: rinse cans/jars, flatten boxes, separate glass if curbside glass isn’t allowed. Leave a one-page chart on fridge with pictures.",
    },
    {
      title: "Roll correct bin on alternating weeks",
      desc: "Many cities alternate trash/recycling — mark A/B weeks in Google Calendar reminders. Text “Recycling out” photo like trash-can service.",
    },
    {
      title: "Return bins and wipe handles",
      desc: "Pull bins back to side yard; quick Lysol wipe on lids during flu season. Small touch that earns referrals.",
    },
    {
      title: "Monthly fee on same route as trash helper",
      desc: "Bundle recycling + trash roll-out for $35/month. Offer senior discount $5 if prepaid 6 months.",
    },
    {
      title: "Print a fridge cheat sheet in Canva",
      desc: "Canva (https://www.canva.com/) one-page guide with photos: bottles, cans, paper, landfill. Leave a copy taped inside the cabinet for the household and a duplicate for your clipboard on route days.",
    },
  ],

  "vacation-mail-plant-helper": [
    {
      title: "Scope plant care only (no mail)",
      desc: "Agree in writing: which plants, how much water, which days. Never collect, open, or move mail or packages — leave porch deliveries alone. Write a daily checklist in Google Docs both sign.",
    },
    {
      title: "Collect keys or lockbox code with parent witness",
      desc: "One labeled key per house; never tag with address on keyring. Return keys in person when they return. Log entry/exit times in Notes.",
    },
    {
      title: "Visit routine (10–15 minutes)",
      desc: "Water per plant tags → wipe spills → lock up. Text “Plants watered — all good” unless there’s an issue (leak, wilted plant, broken pot).",
    },
    {
      title: "Leave packages and mail untouched",
      desc: "If you see a package or piled mail, do not touch it. Optional: text the owner a photo from outside so they know deliveries arrived — still do not move anything.",
    },
    {
      title: "Emergency contacts on fridge sheet",
      desc: "Owner leaves plumber and neighbor numbers. Call owner first, then listed contact — never 911 unless true emergency.",
    },
    {
      title: "Trip pricing examples",
      desc: "$15–25 per visit for plant watering, or $90–140 flat week for a small plant list. Add $5 per extra heavy-watering plant if scoped.",
    },
  ],

  "errand-runner": [
    {
      title: "Take precise errand orders by text",
      desc: "Item list, store name, size/brand, max spend, receipt required. Confirm payment method: their card via mobile wallet tap in store (with adult) or reimbursement after receipt photo.",
    },
    {
      title: "Route batch errands geographically",
      desc: "Pharmacy + post office + Target in one loop saves time. Google Maps (https://maps.google.com/) multi-stop route. Text ETA before leaving each store if lines are long.",
    },
    {
      title: "Keep receipts and bag cold items first",
      desc: "Photo receipt before leaving register; insulated bag for groceries. Separate fragile (eggs) from heavy (milk).",
    },
    {
      title: "Deliver to door and confirm change",
      desc: "Hand items, return cash change and receipt. Charge runner fee: $10 base + $5 per extra stop or 15% of purchase total (cap agreed upfront).",
    },
    {
      title: "Decline restricted purchases",
      desc: "No alcohol, tobacco, lottery, or prescription pickups unless local law and parent allow for specific senior assist programs — default decline.",
    },
    {
      title: "Build senior weekly slot",
      desc: "Same Tuesday pharmacy run = reliable income. Store preferences in Contacts note: “CVS on Main, generic OK.”",
    },
  ],

  tutoring: [
    {
      title: "Diagnostic chat with parent and student",
      desc: "Identify subject, grade, upcoming test dates, and pain points (fractions, essay thesis, Spanish verbs). Review a recent graded paper. Set one measurable goal: “Raise next unit test to B.”",
    },
    {
      title: "Schedule sessions in Google Calendar + Meet link",
      desc: "Weekly 45–60 min slot. Video: Google Meet (https://meet.google.com/) or Zoom (https://zoom.us/) with waiting room on. In-person: library study room with parent OK.",
    },
    {
      title: "Prep a mini-lesson before each session",
      desc: "Google Docs agenda: warm-up 5 min, teach 20 min, practice 15 min, exit ticket 5 min. Pull free practice from Khan Academy (https://www.khanacademy.org/) aligned to topic.",
    },
    {
      title: "Teach one concept; assign targeted practice",
      desc: "Show worked example, student tries two with coaching, assigns 10 problems or one paragraph draft before next week. No doing their homework for them.",
    },
    {
      title: "Email parent summary after session",
      desc: "Three bullets: what we covered, what student did well, homework for next time. Track hours in Sheet for monthly invoice.",
    },
    {
      title: "Adjust rate by subject and level",
      desc: "Examples: $25/hr elementary math, $40/hr HS chemistry, $50/hr SAT reading. Offer 4-pack prepaid discount.",
    },
  ],

  proofreader: [
    {
      title: "Confirm document format and deadline",
      desc: "Ask for Word, Google Doc link, or PDF. Note style: AP, casual blog, or school essay. Get word count and due time — rush fees OK for <24 hr.",
    },
    {
      title: "First pass: spelling and grammar",
      desc: "Google Docs: suggest mode (https://docs.google.com/). Run Grammarly free browser check if client allows. Mark fixes; don’t rewrite voice without comment.",
    },
    {
      title: "Second pass: clarity and flow",
      desc: "Shorten long sentences, flag jargon, check headings match content. Leave polite comments: “Consider defining this term for new readers.”",
    },
    {
      title: "Third pass: links and facts spot-check",
      desc: "Click every hyperlink; flag broken URLs. Don’t fact-check medical/legal claims — comment “verify statistic” instead.",
    },
    {
      title: "Return tracked changes and summary note",
      desc: "Send Doc link + 5-line summary of major fixes. Price: $0.02–0.04/word or $15 flat per 500-word flyer.",
    },
    {
      title: "Offer retainer for small businesses",
      desc: "Local café menu monthly proof for $40. Build template checklist in Docs you reuse.",
    },
  ],

  "friendship-bracelet-maker": [
    {
      title: "Pick 3 patterns and master each",
      desc: "Start with candy stripe, chevron, and fishtail — video tutorials on YouTube search “friendship bracelet candy stripe.” Use embroidery floss (DMC colors) and tape to table edge.",
    },
    {
      title: "Cost floss per bracelet",
      desc: "One skein ~$0.50 makes 2–3 medium bracelets. Price $5–8 each at school or $12 custom with name beads. Track time — aim for 30–45 min per bracelet at first.",
    },
    {
      title: "Photograph on wrist for sales",
      desc: "Daylight photo on plain background; show clasp knot quality. Post in Canva collage (https://www.canva.com/) for Instagram story price sticker.",
    },
    {
      title: "Take custom orders with color chart",
      desc: "Show floss color ring; write orders in Notes: “4 blue/4 white, 7″ wrist.” 50% deposit on orders over $15 via Venmo with parent.",
    },
    {
      title: "Sell at craft fair with display board",
      desc: "Pin samples on cork board; bag finished ones in cello with business card sticker (first name + parent email only).",
    },
    {
      title: "Bundle for parties",
      desc: "Birthday party pack: 10 matching bracelets $70 — parent hosts bracelet station while you teach one pattern for 20 minutes extra fee.",
    },
  ],

  "toy-organizer": [
    {
      title: "Walk the playroom with the parent",
      desc: "Ask goals: floor clear for vacuum, labeled bins for LEGO vs. dolls, donate pile. Note if new bins should be bought (Target clear bins) or use existing.",
    },
    {
      title: "Sort keep, donate, trash with kid present if possible",
      desc: "Three laundry baskets labeled; broken toys trash, duplicates donate. Kid picks one of duplicate sets to keep — reduces meltdowns.",
    },
    {
      title: "Label bins with pictures + words",
      desc: "Print picture labels from Canva (https://www.canva.com/) — photo of blocks + word “Blocks.” Tape at kid eye level. Same size bins stack on short shelf.",
    },
    {
      title: "Zone layout: daily toys low, rare up high",
      desc: "Everyday play on floor bins; messy crafts up high with parent permission. Leave one empty bin for “quick toss” before guests.",
    },
    {
      title: "Teach 5-minute reset routine",
      desc: "Show kid: “Everything in a bin beats perfect sorting.” Parent records 30-sec video of you demoing reset for repeat use.",
    },
    {
      title: "Charge by room size",
      desc: "Small play corner $40, full basement $120. Add $30 if you haul donate bags to car (parent drives to Goodwill).",
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
      desc: "Screenshot Insights: reach, profile visits, top post. Google Doc one-pager for client every Friday. Suggest one experiment next week (Reel vs. static).",
    },
  ],

  "ai-prompt-helper": [
    {
      title: "Interview the client on outcomes they want from AI",
      desc: "Examples: weekly blog drafts, customer email replies, job descriptions, study guides. Pick one workflow first — don’t sell “AI everything day one.”",
    },
    {
      title: "Build a prompt library in Google Docs",
      desc: "Sections: Role, Context, Task, Format, Examples, Constraints. Store at https://docs.google.com/ shared folder “Client Prompts v1.” Never paste client secrets or passwords into ChatGPT.",
    },
    {
      title: "Test prompts in ChatGPT and Gemini side by side",
      desc: "Run the same prompt on https://chatgpt.com/ and https://gemini.google.com/ — compare accuracy and tone. Save the winning version with version date in doc title.",
    },
    {
      title: "Add guardrails and review checklist",
      desc: "Every prompt ends with: “If unsure, say you don’t know; no invented citations.” Client checklist: factual review, brand voice, legal/compliance sign-off.",
    },
    {
      title: "Train client in a 45-minute Zoom",
      desc: "Google Meet or Zoom: screen-share paste workflow, show edit-don’t-send-raw rule. Record with permission; link in Drive.",
    },
    {
      title: "Package deliverables and maintenance",
      desc: "Deliver PDF export of prompt pack + 30-day Slack/email tweak support. Charge setup $200–500 + $75/mo refresh as models update.",
    },
  ],

  "ai-peers": [
    {
      title: "Form a 4–6 person accountability pod",
      desc: "Invite peers learning the same AI stack (ChatGPT, Canva, CapCut). Set norms: no client confidential data in shared chats, meet weekly 45 min on Google Meet (https://meet.google.com/).",
    },
    {
      title: "Rotate show-and-tell demos",
      desc: "Each week one member screenshares a workflow: “How I batch captions” or “My KDP cover prompt.” Others take notes in a shared Google Doc.",
    },
    {
      title: "Run prompt swap exercises",
      desc: "Everyone brings one prompt; group improves it live in ChatGPT (https://chatgpt.com/). Save best versions to a pod Prompt Vault doc with contributor credit.",
    },
    {
      title: "Track experiments in a simple Sheet",
      desc: "Columns: hypothesis, tool, result metric (time saved, $ earned), keep/kill. Review last 10 rows monthly — double down on keeps.",
    },
    {
      title: "Share client-safe templates only",
      desc: "Strip PII from examples before sharing. Use first names fake (“Sample Bakery”) in templates uploaded to Drive.",
    },
    {
      title: "Optional paid mastermind upgrade",
      desc: "If pod matures, charge $20/mo for office hours with an adult mentor — parent/guardian approves for teen pods. Reinvest in one shared Canva Teams seat if needed.",
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

  "ai-agents": [
    {
      title: "Pick one boring workflow to automate",
      desc: "Good first agent job: weekly competitor price scrape summary, inbox triage draft replies, or blog outline from bullet notes. Write acceptance tests: “Output must be CSV with 5 columns.”",
    },
    {
      title: "Draft AGENT.md spec in ChatGPT",
      desc: "Prompt: “Write AGENT.md for Google Antigravity with goal, inputs, outputs, tools allowed, stop conditions, and 5 acceptance tests.” Save to project root — see https://antigravity.google/",
    },
    {
      title: "Implement in Antigravity or Cursor with human review",
      desc: "Download Antigravity from https://antigravity.google/download or open Cursor (https://cursor.com/). Agent runs read-only APIs first; no auto-send email until client signs off.",
    },
    {
      title: "Sandbox test on fake data",
      desc: "Google Sheets copy with dummy rows — never production passwords. Log each run: time, success/fail, human edits needed.",
    },
    {
      title: "Deploy scheduled trigger with limits",
      desc: "Cron weekly Monday 8 am; cap API spend; alert human on failure via email. Document kill switch in README.",
    },
    {
      title: "Charge setup + maintenance",
      desc: "Example $500–1500 setup + $100/mo monitoring for local business lead digest agent. Include 2 revision rounds in SOW Google Doc.",
    },
  ],

  "ai-timing": [
    {
      title: "Map the client’s seasonal revenue calendar",
      desc: "Interview: when do they peak (tax season, holidays, back-to-school)? Plot 12 months in Google Sheets with historical sales if they share.",
    },
    {
      title: "Research trend windows with ChatGPT + web",
      desc: "ChatGPT (https://chatgpt.com/): “List US search trend windows for [niche] by month; cite general patterns only.” Cross-check one data source they use (Shopify dashboard, Google Trends https://trends.google.com/).",
    },
    {
      title: "Build a launch timing playbook",
      desc: "Doc sections: 90-day pre-launch content, 30-day teaser, launch week daily actions, post-launch recap. Tie each action to a channel (email, IG, in-store sign).",
    },
    {
      title: "Align ad spend to margin weeks",
      desc: "Recommend heavier Meta ads (https://business.facebook.com/) only in weeks with >40% margin promos — never bleed budget in slow months without test budget cap ($5/day).",
    },
    {
      title: "Set reminder automations",
      desc: "Google Calendar alerts for inventory order dates, email draft due dates, and influencer outreach 14 days before peak.",
    },
    {
      title: "Deliver one-page timing poster",
      desc: "Canva timeline graphic they can print for office. Charge $150–400 for seasonal plan + 30-min walkthrough call.",
    },
  ],

  "ai-promo-video": [
    {
      title: "Script a 30-second promo in ChatGPT",
      desc: "Prompt: “Write a 75-word voiceover for [business] promo: hook, 2 benefits, CTA, spoken tone friendly.” Read aloud — trim to 25–30 seconds at moderate pace.",
    },
    {
      title: "Generate avatar or B-roll in Hedra or CapCut",
      desc: "Hedra (https://www.hedra.com/) for talking-head avatar from script if client wants faceless promo. CapCut (https://www.capcut.com/) for stock clips + text overlays.",
    },
    {
      title: "Record voiceover or use licensed AI voice",
      desc: "CapCut Text-to-speech or client’s own voice on phone mic in quiet room. Match music bed lower than voice (-12 LUFS target roughly).",
    },
    {
      title: "Edit to platform specs",
      desc: "Export 9:16 for Reels/TikTok, 1:1 optional for feed. Add captions burned-in (CapCut auto-captions → fix names). Logo end card 2 seconds.",
    },
    {
      title: "Client review with one revision round",
      desc: "Unlisted YouTube link or Drive preview. Track comments timestamped; fix typos and CTA phone number — not full reshoot unless paid.",
    },
    {
      title: "Deliver masters and price tiers",
      desc: "ZIP: MP4 1080p + project file if agreed. Price $75–250 first video; bundle 3 for 20% off.",
    },
  ],

  "local-business-ai-setup": [
    {
      title: "Discovery call: tools they already use",
      desc: "List POS, email (prefer Resend — https://resend.com/), site host (Cloudflare Pages — https://pages.cloudflare.com/; kick off builds in Antigravity — https://antigravity.google/; Supabase — https://supabase.com/ for data/auth), and social accounts. Goal: one AI win in week one — not ten logins day one. Meet on Google Meet with screen-share. Do not recommend WordPress.",
    },
    {
      title: "Create a shared AI policy doc",
      desc: "Google Doc: approved tools (ChatGPT Team, Gemini), banned uses (medical advice, auto refunds), human review rule. Owner signs digitally.",
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
      title: "Save GAME-IDEA in Google Docs",
      desc: "Parent copies chat answers: title, 3 levels easy→hard, lose condition. Paste into https://docs.google.com/ named GAME-IDEA.",
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
      title: "Write a short postmortem in Google Docs",
      desc: "Three bullets: what worked in Antigravity, what broke, next feature for v2. Share with your guardian or classmates as a portfolio piece — link the itch.io or GitHub demo, not your home address.",
    },
  ],
};
