/**
 * GYSH membership tiers, credit economy (Kids/Teens), and a-la-carte price list.
 * Pro+ unlocks proposed hustle schedules, trackers, progress reports, and email alerts.
 */

export type AudienceGroup = "kids" | "junior" | "adult" | "senior";
export type TierId = "free" | "starter" | "pro" | "elite";

export type MembershipFeature = {
  id: string;
  label: string;
  detail: string;
};

/** Features unlocked by tier — schedule suite starts at Pro. */
export const MEMBERSHIP_FEATURES: MembershipFeature[] = [
  { id: "free_guides", label: "Free guides library", detail: "Open starter playbooks for every age group." },
  { id: "member_guides", label: "Full member guides", detail: "Unlock gated launch and team guides." },
  { id: "community", label: "GYSH Community access", detail: "Ask questions and share wins in member threads." },
  { id: "workshop_discount", label: "Workshop discounts", detail: "Member pricing on live labs and clinics." },
  { id: "workshop_free", label: "Free workshop entry", detail: "Complimentary seats to eligible Glow labs." },
  { id: "training", label: "Group training sessions", detail: "Monthly cohort training with T / E / guests." },
  {
    id: "one_on_one",
    label: "1-on-1 consulting session",
    detail:
      "Monthly live 1-on-1 with T / E — length grows by plan (30 / 60 / 90 min). Same consulting rates for every age.",
  },
  { id: "schedule", label: "Proposed hustle schedule", detail: "Week-by-week plan matched to your Get Your Side Hustle results." },
  { id: "tracker", label: "Hustle tracker", detail: "Log hours, gigs, earnings, and checklist progress." },
  { id: "progress", label: "Progress reports", detail: "Weekly/monthly scorecards with next-step recommendations." },
  { id: "email", label: "Email notifications", detail: "Reminders for schedule blocks, milestones, and workshop seats." },
  { id: "zip_timing", label: "Best-times ZIP scout", detail: "Cross-app peak hours for rideshare & delivery in your ZIP." },
  { id: "story_time", label: "Story time seats", detail: "Kevina Starr / Glow Getter story sessions for kids." },
  {
    id: "kid_credits",
    label: "Kid Credits",
    detail:
      "Monthly Kid Credit pool for Kids, Teens, Adults, or Seniors — redeem toward workshops and 1-on-1s. Adult redemptions use half value (2 Kid Credits = 1 adult credit).",
  },
];

export type MembershipTier = {
  id: TierId;
  name: string;
  tagline: string;
  /** Adult USD monthly; Kids/Teens use creditsPerMonth instead. */
  priceMonthlyUsd?: number;
  priceYearlyUsd?: number;
  /** Senior (55+) USD pricing — intentionally lower than adult. */
  priceMonthlyUsdSenior?: number;
  priceYearlyUsdSenior?: number;
  creditsPerMonth?: number;
  /** Kid credits included on adult/senior USD plans (Pro+). */
  kidCreditsMonthly?: number;
  /** Included monthly 1-on-1 consulting length (minutes). Paid tiers only. */
  oneOnOneMinutes?: 30 | 60 | 90;
  /** Minimum paid commitment in months (all paid plans require 3). */
  commitmentMonths?: number;
  audiences: AudienceGroup[];
  featureIds: string[];
  highlight?: boolean;
};

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Explore GYSH and open every free guide.",
    priceMonthlyUsd: 0,
    priceMonthlyUsdSenior: 0,
    creditsPerMonth: 0,
    audiences: ["kids", "junior", "adult", "senior"],
    featureIds: ["free_guides"],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Member guides, community, monthly 30-min 1-on-1, and Kid Credits — 3-month commitment.",
    priceMonthlyUsd: 39,
    priceYearlyUsd: 390,
    priceMonthlyUsdSenior: 34,
    priceYearlyUsdSenior: 340,
    creditsPerMonth: 60,
    kidCreditsMonthly: 30,
    oneOnOneMinutes: 30,
    commitmentMonths: 3,
    audiences: ["kids", "junior", "adult", "senior"],
    featureIds: [
      "free_guides",
      "member_guides",
      "community",
      "workshop_discount",
      "one_on_one",
      "story_time",
      "kid_credits",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Hustle schedule suite plus a monthly 60-min 1-on-1 — 3-month commitment.",
    priceMonthlyUsd: 69,
    priceYearlyUsd: 690,
    priceMonthlyUsdSenior: 57,
    priceYearlyUsdSenior: 570,
    creditsPerMonth: 140,
    oneOnOneMinutes: 60,
    commitmentMonths: 3,
    audiences: ["kids", "junior", "adult", "senior"],
    featureIds: [
      "free_guides",
      "member_guides",
      "community",
      "workshop_discount",
      "workshop_free",
      "training",
      "one_on_one",
      "schedule",
      "tracker",
      "progress",
      "email",
      "story_time",
      "kid_credits",
    ],
    kidCreditsMonthly: 60,
    highlight: true,
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "Monthly 90-min 1-on-1, ZIP timing scout, and priority support — 3-month commitment.",
    priceMonthlyUsd: 119,
    priceYearlyUsd: 1190,
    priceMonthlyUsdSenior: 94,
    priceYearlyUsdSenior: 940,
    creditsPerMonth: 280,
    oneOnOneMinutes: 90,
    commitmentMonths: 3,
    audiences: ["kids", "junior", "adult", "senior"],
    featureIds: [
      "free_guides",
      "member_guides",
      "community",
      "workshop_discount",
      "workshop_free",
      "training",
      "one_on_one",
      "schedule",
      "tracker",
      "progress",
      "email",
      "zip_timing",
      "story_time",
      "kid_credits",
    ],
    kidCreditsMonthly: 120,
  },
];

/** Pro is the first tier that unlocks the schedule / tracker / progress / email suite. */
export const SCHEDULE_SUITE_TIER: TierId = "pro";

export const SCHEDULE_SUITE_FEATURE_IDS = ["schedule", "tracker", "progress", "email"] as const;

/** Team / audience perks shown inside each plan as collapsible Member Perks. */
export type MemberPerkAudience = "adult" | "kids" | "junior" | "senior";

export type TierMemberPerk = {
  title: string;
  detail: string;
};

export type TierMemberPerks = Record<MemberPerkAudience, TierMemberPerk[]>;

export const MEMBER_PERK_AUDIENCE_LABELS: Record<MemberPerkAudience, string> = {
  adult: "Adult perks",
  kids: "Kids perks",
  junior: "Teens perks",
  senior: "Senior perks",
};

/**
 * Spread Adult / Kids / Teens / Senior team benefits across Free → Elite.
 * Advanced items (AI games, ZIP scout, deep consulting) sit on Pro/Elite.
 */
export const MEMBER_PERKS_BY_TIER: Record<TierId, TierMemberPerks> = {
  free: {
    adult: [
      {
        title: "Browse free guides",
        detail: "Open starter playbooks for Airbnb, POD, delivery, and more.",
      },
      {
        title: "Try the GYSH Match Wizard",
        detail: "Run the adult wizard and preview matches anytime.",
      },
    ],
    kids: [
      {
        title: "Kids Corner free tips",
        detail: "Safe hustle ideas and Kevina Starr story previews with a parent.",
      },
      {
        title: "Piggy Bank preview",
        detail: "Try goal-setting tools before joining the Kids team.",
      },
    ],
    junior: [
      {
        title: "Teens free teasers",
        detail: "Browse age-safe hustle ideas and My Bank basics.",
      },
      {
        title: "GYSH Teens Match Wizard",
        detail: "Run the teen wizard with parent awareness.",
      },
    ],
    senior: [
      {
        title: "Senior lane preview",
        detail: "Explore flexible 55+ hustle ideas at your own pace.",
      },
      {
        title: "Join Senior interest list",
        detail: "Flag interest for senior-focused updates (no paid plan required).",
      },
    ],
  },
  starter: {
    adult: [
      {
        title: "Full member guides",
        detail: "Unlock gated adult launch guides and bookmarks.",
      },
      {
        title: "GYSH Community",
        detail: "Ask questions and share wins in member threads.",
      },
      {
        title: "Monthly 30-min 1-on-1",
        detail: "Consulting with T / E — 3-month commitment on all paid plans.",
      },
      {
        title: "Monthly Kid Credits",
        detail: "30 Kid Credits / mo — redeem for workshops & 1-on-1s (kids or adults).",
      },
    ],
    kids: [
      {
        title: "Kids Corner team access",
        detail: "Join the Kids GYSH Team for member guides with a parent.",
      },
      {
        title: "Training videos for kids",
        detail: "Short, parent-friendly lessons on safe hustles and confidence.",
      },
      {
        title: "Kevina Glow Getter extras",
        detail: "Bonus story activities and kindness quests.",
      },
      {
        title: "Piggy Bank challenges",
        detail: "Goal-setting missions that make saving feel like a game.",
      },
    ],
    junior: [
      {
        title: "Teens Side Hustle Team",
        detail: "Unlock Teens member guides with parent/guardian OK.",
      },
      {
        title: "Teens training videos",
        detail: "Skill clips on safe earning, pricing, and customer care.",
      },
      {
        title: "CEO starter tips",
        detail: "Checklists for planning and saving like a young founder.",
      },
      {
        title: "My Bank goals",
        detail: "Track savings targets and jobs completed.",
      },
    ],
    senior: [
      {
        title: "Senior Side Hustle team",
        detail: "Early looks at senior-focused guides and workshop nights.",
      },
      {
        title: "Peer learning circle",
        detail: "Share skills, try gentle AI prompting, stay curious.",
      },
      {
        title: "Monthly 30-min 1-on-1",
        detail: "Senior-friendly consulting pacing — same rates as adults.",
      },
    ],
  },
  pro: {
    adult: [
      {
        title: "Hustle schedule suite",
        detail: "Weekly plan, tracker, progress reports, and email reminders.",
      },
      {
        title: "Group training sessions",
        detail: "Monthly cohort training with T / E / guests.",
      },
      {
        title: "Monthly 60-min 1-on-1",
        detail: "Deeper consulting for launches, pricing, and ops — 3-month commitment.",
      },
      {
        title: "Monthly Kid Credits",
        detail: "Use for kids or adults on workshops & 1-on-1s (2 Kid Credits = 1 adult credit).",
      },
    ],
    kids: [
      {
        title: "Craft hustle playbooks",
        detail: "Stickers, keychains, and fair-ready projects with family pricing tips.",
      },
      {
        title: "Make games with AI",
        detail: "Step-by-step guides to invent tiny games with a parent — stories, characters, levels.",
      },
      {
        title: "Workshop discounts",
        detail: "Member pricing on Kids Glow labs and family sessions.",
      },
      {
        title: "Kids schedule & tracker",
        detail: "Parent-friendly weekly plan tied to Get Your Side Hustle matches.",
      },
    ],
    junior: [
      {
        title: "Game-making with AI",
        detail: "Concepts, sprites, dialogue, and simple prototypes (guardian OK).",
      },
      {
        title: "Content creation starters",
        detail: "Parent-friendly paths for school projects and wholesome creator practice.",
      },
      {
        title: "Workshop invites & replays",
        detail: "Notes from family Glow labs and junior build nights.",
      },
      {
        title: "Teens schedule suite",
        detail: "Week plan + tracker around school — earn, save, reinvest.",
      },
    ],
    senior: [
      {
        title: "Flexible hustle schedule",
        detail: "Gentle weekly plan matched to senior Get Your Side Hustle results.",
      },
      {
        title: "Progress reports",
        detail: "Clear scorecards without grind-culture pressure.",
      },
      {
        title: "Monthly 60-min 1-on-1",
        detail: "Strategy time for consulting, tutoring, or hosting pilots.",
      },
      {
        title: "Workshop member seats",
        detail: "Discounted or complimentary seats to eligible senior-friendly labs.",
      },
    ],
  },
  elite: {
    adult: [
      {
        title: "Monthly 90-min 1-on-1",
        detail: "Priority consulting for scaling, ads, and multi-hustle ops — 3-month commitment.",
      },
      {
        title: "Best-times ZIP scout",
        detail: "Peak windows for rideshare & delivery in your ZIP.",
      },
      {
        title: "Larger Kid Credit pool",
        detail: "More monthly credits for workshops & 1-on-1s (kids or adults).",
      },
      {
        title: "Priority workshop access",
        detail: "First look at advanced AI-agent and build nights.",
      },
    ],
    kids: [
      {
        title: "Advanced AI game studio",
        detail: "Deeper builds — levels, characters, and shareable mini-games with a parent.",
      },
      {
        title: "Priority Glow labs",
        detail: "Early seats for Kids Glow nights and story + hustle combos.",
      },
      {
        title: "Family coaching add-ons",
        detail: "Longer 1-on-1 time parents can use for kid hustle planning.",
      },
      {
        title: "Reinvest challenges",
        detail: "Missions that teach putting earnings back into supplies and kindness.",
      },
    ],
    junior: [
      {
        title: "Advanced AI game & app tracks",
        detail: "Prototype games and simple tools — parent consent required.",
      },
      {
        title: "Young founder playbooks",
        detail: "Pricing, reinvestment, and portfolio projects for teens.",
      },
      {
        title: "Priority junior workshops",
        detail: "First access to build nights and guest sessions when available.",
      },
      {
        title: "Extended 1-on-1 support",
        detail: "90-min monthly consulting parents/teens can use for launch plans.",
      },
    ],
    senior: [
      {
        title: "Monthly 90-min 1-on-1",
        detail: "Deep dives on consulting offers, tutoring, or hosting.",
      },
      {
        title: "ZIP timing for flexible gigs",
        detail: "Optional peak-hour scout if you try rideshare/delivery at your pace.",
      },
      {
        title: "Priority senior workshops",
        detail: "Early access to second-career and AI-curiosity nights.",
      },
      {
        title: "Peer mentor spotlight",
        detail: "Share expertise with the GYSH community as a senior mentor.",
      },
    ],
  },
};

export type CreditEarnAction = {
  id: string;
  label: string;
  credits: number;
  audiences: AudienceGroup[];
  detail: string;
  /** Optional grouping for “ways to earn” lists */
  category?: "referral" | "learn" | "launch" | "community" | "habit";
};

/**
 * Ways members earn Kid Credits (dashboard + membership page).
 * Rule of thumb: small habits 5–10, learning 10–20, launches 25–50, referrals 40–50.
 * Adult redemptions spend at half rate (2 Kid Credits = 1 adult credit).
 */
export const CREDIT_EARN_ACTIONS: CreditEarnAction[] = [
  {
    id: "refer_friend",
    label: "Refer a friend who joins",
    credits: 40,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "referral",
    detail: "Share your dashboard referral link. When they create a free or paid account, you earn Kid Credits.",
  },
  {
    id: "quiz_complete",
    label: "Finish GYSH Match Wizard",
    credits: 10,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "learn",
    detail: "Complete your age-group wizard once per season.",
  },
  {
    id: "guide_complete",
    label: "Finish a member guide",
    credits: 15,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "learn",
    detail: "Mark a guide complete (or pass an 80%+ guide quiz when available).",
  },
  {
    id: "workshop_attend",
    label: "Attend a workshop",
    credits: 20,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "learn",
    detail: "Check in at a live GYSH workshop, Glow lab, or training session.",
  },
  {
    id: "story_attend",
    label: "Attend Story Time",
    credits: 10,
    audiences: ["kids"],
    category: "learn",
    detail: "Join a Kevina Starr / Glow Getter session with a parent.",
  },
  {
    id: "one_on_one_prep",
    label: "Complete 1-on-1 prep checklist",
    credits: 10,
    audiences: ["adult", "senior", "junior"],
    category: "habit",
    detail: "Send your questions and goals before a consulting session.",
  },
  {
    id: "launch_hustle",
    label: "Launch your first hustle",
    credits: 50,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "launch",
    detail: "Confirm a first sale, gig, listing, or lemonade day (parent OK for Kids/Teens).",
  },
  {
    id: "income_25",
    label: "Earn $25 milestone",
    credits: 25,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "launch",
    detail: "Log verified earnings of $25 from a side hustle.",
  },
  {
    id: "income_100",
    label: "Earn $100 milestone",
    credits: 60,
    audiences: ["junior", "adult", "senior"],
    category: "launch",
    detail: "Hit $100 cumulative earnings (parent approval for Teens).",
  },
  {
    id: "piggy_goal",
    label: "Complete a Piggy / My Bank goal",
    credits: 20,
    audiences: ["kids", "junior"],
    category: "habit",
    detail: "Reach a savings goal tracked in Piggy Bank or My Bank.",
  },
  {
    id: "weekly_checkin",
    label: "Weekly hustle check-in",
    credits: 5,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "habit",
    detail: "Log hours + wins on your dashboard (or Pro tracker when unlocked).",
  },
  {
    id: "community_win",
    label: "Share a win in Community",
    credits: 10,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "community",
    detail: "Post a helpful win or tip in GYSH Community (once per week).",
  },
  {
    id: "parent_plan",
    label: "Parent approves your hustle plan",
    credits: 15,
    audiences: ["kids", "junior"],
    category: "habit",
    detail: "Guardian signs off on your proposed schedule.",
  },
];

export type CreditPack = {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  detail: string;
  popular?: boolean;
};

/** Optional parent/guardian top-ups for Kids and Teens accounts. */
export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "boost",
    name: "Boost Pack",
    credits: 25,
    priceUsd: 5,
    detail: "A small boost for a quiz, report, or savings goal.",
  },
  {
    id: "builder",
    name: "Builder Pack",
    credits: 60,
    priceUsd: 10,
    detail: "Enough for a workshop, training session, or custom schedule.",
  },
  {
    id: "launcher",
    name: "Launcher Pack",
    credits: 140,
    priceUsd: 20,
    detail: "A flexible balance for multiple learning activities.",
    popular: true,
  },
  {
    id: "family",
    name: "Family Pack",
    credits: 300,
    priceUsd: 40,
    detail: "Best value for ongoing coaching, workshops, and activities.",
  },
];

export type AlaCarteItem = {
  id: string;
  name: string;
  category: "story" | "consulting" | "workshop" | "coaching" | "digital" | "schedule";
  audiences: AudienceGroup[];
  priceUsd: number;
  credits?: number;
  detail: string;
  includedIn?: TierId[];
};

export const ALA_CARTE_PRICE_LIST: AlaCarteItem[] = [
  {
    id: "story-time",
    name: "Kevina Starr Story Time (1 session)",
    category: "story",
    audiences: ["kids"],
    priceUsd: 15,
    credits: 20,
    detail: "Live or replay Glow Getter story session with a parent nearby.",
    includedIn: ["starter", "pro", "elite"],
  },
  {
    id: "junior-lab",
    name: "Teens Glow Lab seat",
    category: "workshop",
    audiences: ["junior"],
    priceUsd: 25,
    credits: 35,
    detail: "Single seat at a junior build / pricing / AI game-making lab.",
    includedIn: ["pro", "elite"],
  },
  {
    id: "workshop-general",
    name: "Adult / Senior workshop ticket",
    category: "workshop",
    audiences: ["adult", "senior"],
    priceUsd: 35,
    detail: "One seat at a GYSH workshop or guest clinic.",
    includedIn: ["pro", "elite"],
  },
  {
    id: "training-group",
    name: "Group training session",
    category: "coaching",
    audiences: ["adult", "senior", "junior"],
    priceUsd: 45,
    credits: 50,
    detail: "Cohort training block (skills, outreach, pricing).",
    includedIn: ["pro", "elite"],
  },
  {
    id: "consult-30",
    name: "1-on-1 consulting (30 min)",
    category: "consulting",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 75,
    credits: 150,
    detail:
      "Same consulting rate for every age — strategy for launches, pricing, or pivots. Included monthly on Starter+ (Kids/Teens with a parent).",
    includedIn: ["starter", "pro", "elite"],
  },
  {
    id: "consult-60",
    name: "1-on-1 consulting (60 min)",
    category: "consulting",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 120,
    credits: 240,
    detail:
      "Same consulting rate for every age — deeper planning session. Included monthly on Pro+ (Kids/Teens with a parent).",
    includedIn: ["pro", "elite"],
  },
  {
    id: "consult-90",
    name: "1-on-1 consulting (90 min)",
    category: "consulting",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 165,
    credits: 330,
    detail:
      "Same consulting rate for every age — extended deep-dive. Included monthly on Elite (Kids/Teens with a parent).",
    includedIn: ["elite"],
  },
  {
    id: "custom-schedule",
    name: "Custom hustle schedule build",
    category: "schedule",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 45,
    credits: 55,
    detail: "One-time proposed week plan from your wizard matches.",
    includedIn: ["pro", "elite"],
  },
  {
    id: "progress-pdf",
    name: "Progress report PDF (one-off)",
    category: "digital",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 12,
    credits: 15,
    detail: "Downloadable scorecard — included automatically on Pro+.",
    includedIn: ["pro", "elite"],
  },
  {
    id: "zip-timing",
    name: "Best-times ZIP scout (month)",
    category: "digital",
    audiences: ["adult", "senior"],
    priceUsd: 29,
    detail: "Peak hours across rideshare & delivery apps for your ZIP.",
    includedIn: ["elite"],
  },
  {
    id: "parent-brief",
    name: "Parent safety brief",
    category: "digital",
    audiences: ["kids", "junior"],
    priceUsd: 10,
    credits: 12,
    detail: "Printed-ready checklist for safe neighbor gigs and online rules.",
    includedIn: ["starter", "pro", "elite"],
  },
];

export const AUDIENCE_LABELS: Record<AudienceGroup, string> = {
  kids: "Kids (4–12)",
  junior: "Teens (13–17)",
  adult: "Adults (18–54)",
  senior: "Seniors (55+)",
};

/** Kid credits redeem for adult consulting at 2:1 (2 kid credits = 1 adult credit). */
export const KID_TO_ADULT_CREDIT_RATIO = 2;

export function tierKidCredits(tierId: TierId): number {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  return tier?.kidCreditsMonthly ?? 0;
}

export function adultCreditsFromKidCredits(kidCredits: number): number {
  return Math.floor(kidCredits / KID_TO_ADULT_CREDIT_RATIO);
}

export function kidCreditsFeatureLabel(tierId: TierId): string {
  const kidCredits = tierKidCredits(tierId);
  if (kidCredits <= 0) return "Kid Credits";
  const adultCredits = adultCreditsFromKidCredits(kidCredits);
  return `${kidCredits} Kid Credits (${adultCredits} adult credits)`;
}

/** Monthly 1-on-1 consulting length by paid tier (Free has none). */
export function tierOneOnOneMinutes(tierId: TierId): 30 | 60 | 90 | 0 {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  return tier?.oneOnOneMinutes ?? 0;
}

export function oneOnOneFeatureLabel(tierId: TierId): string {
  const minutes = tierOneOnOneMinutes(tierId);
  if (!minutes) return "1-on-1 consulting session";
  return `1× ${minutes}-min 1-on-1 / mo`;
}

export function oneOnOneFeatureDetail(tierId: TierId): string {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  const minutes = tier?.oneOnOneMinutes;
  if (!minutes) return "Personal consulting for strategy, pricing, and launches.";
  const commit =
    tier?.commitmentMonths && tier.commitmentMonths > 1
      ? ` ${tier.commitmentMonths}-month commitment required.`
      : "";
  return `One live consulting session per month (${minutes} minutes). Same rates for Kids, Teens, Adults, and Seniors.${commit}`;
}

export function tierHasFeature(tierId: TierId, featureId: string): boolean {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  return !!tier?.featureIds.includes(featureId);
}

export function featuresForTier(tierId: TierId): MembershipFeature[] {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  if (!tier) return [];
  return MEMBERSHIP_FEATURES.filter((f) => tier.featureIds.includes(f.id));
}

export function formatUsd(n: number): string {
  if (n === 0) return "Free";
  return `$${n.toLocaleString()}`;
}

/** USD monthly price for Adult vs Senior (Kids/Teens use credits). */
export function tierPriceMonthlyUsd(tier: MembershipTier, audience: AudienceGroup): number {
  if (audience === "senior") {
    return tier.priceMonthlyUsdSenior ?? tier.priceMonthlyUsd ?? 0;
  }
  return tier.priceMonthlyUsd ?? 0;
}

/** USD yearly price for Adult vs Senior. */
export function tierPriceYearlyUsd(tier: MembershipTier, audience: AudienceGroup): number | undefined {
  if (audience === "senior") {
    return tier.priceYearlyUsdSenior ?? tier.priceYearlyUsd;
  }
  return tier.priceYearlyUsd;
}
