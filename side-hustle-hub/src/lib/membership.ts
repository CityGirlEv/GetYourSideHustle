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
  {
    id: "newsletter",
    label: "Weekly Newsletter",
    detail:
      "Friday dual-audience issue — kids glow story + adult hustle tip — in your inbox and on the members-only Newsletter page.",
  },
  { id: "workshop_discount", label: "Workshop discounts", detail: "Member pricing on live labs and clinics." },
  { id: "workshop_free", label: "Free workshop entry", detail: "Complimentary seats to eligible Glow labs." },
  { id: "training", label: "Group training sessions", detail: "Monthly cohort training with Tina & Evelyn and/or Tina & Evelyn Guest Speakers." },
  {
    id: "one_on_one",
    label: "1-on-1 consulting session",
    detail:
      "Live 1-on-1 with Tina & Evelyn — Starter includes one 45-minute session; Pro includes three 60-minute sessions; Elite includes three 90-minute sessions. Same consulting rates for every age.",
  },
  { id: "schedule", label: "Proposed hustle schedule", detail: "Week-by-week plan matched to your Get Your Side Hustle results." },
  { id: "tracker", label: "Hustle tracker", detail: "Log hours, gigs, earnings, and checklist progress." },
  { id: "progress", label: "Progress reports", detail: "Weekly/monthly scorecards with next-step recommendations." },
  { id: "email", label: "Email notifications", detail: "Reminders for schedule blocks, milestones, and workshop seats." },
  {
    id: "pnl",
    label: "Profit & Loss calculator",
    detail:
      "Log dated sales and expense line items (Admin, Overhead, Advertising, and more) with daily, weekly, and monthly rollups in Schedule Suite.",
  },
  { id: "zip_timing", label: "Best-times ZipCode scout", detail: "Cross-app peak hours for rideshare & delivery in your ZipCode." },
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
  /** Included 1-on-1 consulting length (minutes). Starter = one 45-min; Pro = three 60-min; Elite = three 90-min. */
  oneOnOneMinutes?: 30 | 45 | 60 | 90;
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
    tagline:
      "Free for every age — Kids, Teens, Adults & Seniors. Browse ideas, free guides, and your Corner at $0.",
    priceMonthlyUsd: 0,
    priceMonthlyUsdSenior: 0,
    creditsPerMonth: 0,
    audiences: ["kids", "junior", "adult", "senior"],
    // Guide / browse access lives only in MEMBER_PERKS_BY_TIER.free (no generic “Free guides library” row).
    featureIds: [],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Member guides, community, weekly newsletter, one 45-minute session, and Kid Credits — 3-month commitment.",
    priceMonthlyUsd: 39,
    priceYearlyUsd: 390,
    priceMonthlyUsdSenior: 34,
    priceYearlyUsdSenior: 340,
    creditsPerMonth: 60,
    kidCreditsMonthly: 30,
    oneOnOneMinutes: 45,
    commitmentMonths: 3,
    audiences: ["kids", "junior", "adult", "senior"],
    featureIds: [
      "free_guides",
      "member_guides",
      "community",
      "newsletter",
      "workshop_discount",
      "one_on_one",
      "story_time",
      "kid_credits",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Hustle schedule suite plus three 60-minute sessions — 3-month commitment.",
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
      "newsletter",
      "workshop_discount",
      "workshop_free",
      "training",
      "one_on_one",
      "schedule",
      "tracker",
      "progress",
      "email",
      "pnl",
      "story_time",
      "kid_credits",
    ],
    kidCreditsMonthly: 60,
    highlight: true,
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "Three 90-minute sessions, ZipCode timing scout, and priority support — 3-month commitment.",
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
      "newsletter",
      "workshop_discount",
      "workshop_free",
      "training",
      "one_on_one",
      "schedule",
      "tracker",
      "progress",
      "email",
      "pnl",
      "zip_timing",
      "story_time",
      "kid_credits",
    ],
    kidCreditsMonthly: 120,
  },
];

/** Pro is the first tier that unlocks the schedule / tracker / progress / email suite. */
export const SCHEDULE_SUITE_TIER: TierId = "pro";

export const SCHEDULE_SUITE_FEATURE_IDS = [
  "schedule",
  "tracker",
  "progress",
  "email",
  "pnl",
] as const;

/** Team / audience perks shown under each plan (additive ladder — no cross-tier repeats). */
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

/** Free → Elite ladder used for additive perk copy. */
export const TIER_LADDER: readonly TierId[] = ["free", "starter", "pro", "elite"] as const;

export function previousTierId(tierId: TierId): TierId | null {
  const idx = TIER_LADDER.indexOf(tierId);
  return idx > 0 ? TIER_LADDER[idx - 1]! : null;
}

export function nextTierId(tierId: TierId): TierId | null {
  const idx = TIER_LADDER.indexOf(tierId);
  return idx >= 0 && idx < TIER_LADDER.length - 1 ? TIER_LADDER[idx + 1]! : null;
}

/** Paid Starter / Pro / Elite — a subscribed member, not Free. */
export function isMembershipSubscriber(tierId: TierId | null | undefined): boolean {
  return tierId === "starter" || tierId === "pro" || tierId === "elite";
}

/** Weekly Newsletter archive + inbox — Starter+ (admins / QA / Dev bypass). */
export function canAccessNewsletter(
  tierId: TierId | null | undefined,
  opts?: { isAdmin?: boolean },
): boolean {
  if (opts?.isAdmin) return true;
  return tierHasFeature((tierId ?? "free") as TierId, "newsletter");
}

export function tierMemberPerks(tierId: TierId, audience: MemberPerkAudience): TierMemberPerk[] {
  return MEMBER_PERKS_BY_TIER[tierId][audience];
}

export type NumberedTierPerk = TierMemberPerk & {
  n: number;
  numberedTitle: string;
};

/** Numbered perk rows for Membership / Join (1., 2., 3. …). */
export function numberedTierPerks(tierId: TierId, audience: MemberPerkAudience): NumberedTierPerk[] {
  return tierMemberPerks(tierId, audience).map((perk, index) => ({
    ...perk,
    n: index + 1,
    numberedTitle: `${index + 1}. ${perk.title}`,
  }));
}

/**
 * Spread Adult / Kids / Teens / Senior team benefits across Free → Elite.
 * Paid tiers lead with “Everything in {lower tier}, plus:” and list only new additions.
 * Advanced items (AI games, ZipCode scout, deep consulting) sit on Pro/Elite.
 */
export const MEMBER_PERKS_BY_TIER: Record<TierId, TierMemberPerks> = {
  free: {
    adult: [
      {
        title: "Free for every age group",
        detail:
          "Kids, Teens, Adults, and Seniors each get free access — browse ideas, free guides, and age-appropriate Corners at $0.",
      },
      {
        title: "Browse free guides & hustle ideas",
        detail:
          "Open free starter playbooks and Side Hustle ideas in your lane (Adults shown here; Kids, Teens & Seniors have their own free libraries too).",
      },
      {
        title: "Adults Match Wizard + ranked ideas",
        detail: "Run the adult wizard anytime and see matches with match % before you upgrade.",
      },
      {
        title: "Browse Adults Corner (and every Corner)",
        detail:
          "Skim Adults Corner free tips and launch ideas — Kids Corner, Teens Corner, and Seniors Corner also have free browse areas.",
      },
      {
        title: "Free account + Member Dashboard",
        detail: "Create a Free account to bookmark guides, save wizard results, and pick up where you left off.",
      },
    ],
    kids: [
      {
        title: "Free for every age group",
        detail:
          "Kids, Teens, Adults, and Seniors each get free access — browse ideas, free guides, and age-appropriate Corners at $0.",
      },
      {
        title: "Browse free guides & hustle ideas",
        detail:
          "Age-appropriate free guides and safe Side Hustle ideas with a parent nearby — Teens, Adults & Seniors get free browse in their lanes too.",
      },
      {
        title: "Kids Match Wizard + ranked ideas",
        detail: "Try the Kids wizard and see ranked hustle ideas matched to your answers.",
      },
      {
        title: "Browse Kids Corner (and every Corner)",
        detail:
          "Explore Kids Corner free areas — story teasers, ideas, and next steps. Teens, Adults & Seniors Corners have free browse too.",
      },
      {
        title: "Free family account + Piggy Bank preview",
        detail: "Parents create a Free account to save progress; try Piggy Bank goal-setting before paid plans or credit packs.",
      },
    ],
    junior: [
      {
        title: "Free for every age group",
        detail:
          "Kids, Teens, Adults, and Seniors each get free access — browse ideas, free guides, and age-appropriate Corners at $0.",
      },
      {
        title: "Browse free guides & hustle ideas",
        detail:
          "Age-safe free guides and Teens idea teasers with parent awareness — Kids, Adults & Seniors have free libraries in their lanes too.",
      },
      {
        title: "Teens Match Wizard + ranked ideas",
        detail: "Run the Teens wizard and see Side Hustle ideas that fit school schedules and skills.",
      },
      {
        title: "Browse Teens Corner (and every Corner)",
        detail:
          "Explore free Teens content — My Bank basics, CEO tips, and wins. Kids, Adults & Seniors Corners also offer free browse.",
      },
      {
        title: "Free account + My Bank preview",
        detail: "Create a Free account (guardian OK) to save wizard results; practice savings goals before paid upgrades.",
      },
    ],
    senior: [
      {
        title: "Free for every age group",
        detail:
          "Kids, Teens, Adults, and Seniors each get free access — browse ideas, free guides, and age-appropriate Corners at $0.",
      },
      {
        title: "Browse free guides & hustle ideas",
        detail:
          "Flexible 55+ free guides and starter ideas at your pace — Kids, Teens & Adults have free browse in their lanes too.",
      },
      {
        title: "Seniors Match Wizard + ranked ideas",
        detail: "Run the Seniors wizard and browse Side Hustle ideas matched to energy, skills, and schedule.",
      },
      {
        title: "Browse Seniors Corner (and every Corner)",
        detail:
          "Explore Seniors Corner free tips and gentle next steps — Kids, Teens & Adults Corners have free browse areas too.",
      },
      {
        title: "Free account + interest list",
        detail: "Save progress on your Member Dashboard and flag interest for senior-focused updates — still Free.",
      },
    ],
  },
  starter: {
    adult: [
      {
        title: "Everything in Free, plus:",
        detail: "All Free benefits carry forward — here’s what’s new on Starter.",
      },
      {
        title: "Full member guides",
        detail: "Unlock gated adult launch guides and bookmarks.",
      },
      {
        title: "GYSH Community",
        detail: "Ask questions and share wins in member threads.",
      },
      {
        title: "Weekly Newsletter",
        detail:
          "Friday dual-audience issue — kids glow story + adult hustle tip — in your inbox and on the members-only Newsletter page.",
      },
      {
        title: "Workshop member pricing",
        detail: "Member discounts on live labs and clinics.",
      },
      {
        title: "One 45-minute session",
        detail: "One live consulting session with Tina & Evelyn — 3-month commitment on all paid plans.",
      },
      {
        title: "30 Kid Credits / mo",
        detail: "Redeem for workshops & 1-on-1s (kids or adults; 2 Kid Credits = 1 adult credit).",
      },
    ],
    kids: [
      {
        title: "Everything in Free, plus:",
        detail: "All Free benefits carry forward — here’s what’s new on Starter for Kids.",
      },
      {
        title: "Kids Corner team access",
        detail: "Join the Kids GYSH Team for member guides with a parent.",
      },
      {
        title: "Weekly Newsletter",
        detail:
          "Friday family issue — kids glow story + a parent coach tip — in your inbox and on the Newsletter page.",
      },
      {
        title: "Training videos for kids",
        detail: "Short, parent-friendly lessons on safe hustles and confidence.",
      },
      {
        title: "Kevina Glow Getter extras + story seats",
        detail: "Bonus story activities, kindness quests, and Story Time seats.",
      },
      {
        title: "Piggy Bank challenges",
        detail: "Goal-setting missions that make saving feel like a game.",
      },
      {
        title: "One 45-minute family session",
        detail: "Live consulting with a parent — same rates for every age; 3-month commitment.",
      },
    ],
    junior: [
      {
        title: "Everything in Free, plus:",
        detail: "All Free benefits carry forward — here’s what’s new on Starter for Teens.",
      },
      {
        title: "Teens Side Hustle Team",
        detail: "Unlock Teens member guides with parent/guardian OK.",
      },
      {
        title: "Weekly Newsletter",
        detail:
          "Friday teen-founder issue — skill tip + next step — in your inbox and on the Newsletter page.",
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
      {
        title: "One 45-minute session",
        detail: "Live consulting (guardian OK) — same rates for every age; 3-month commitment.",
      },
    ],
    senior: [
      {
        title: "Everything in Free, plus:",
        detail: "All Free benefits carry forward — here’s what’s new on Starter for Seniors.",
      },
      {
        title: "Senior Side Hustle team",
        detail: "Early looks at senior-focused guides and workshop nights.",
      },
      {
        title: "Weekly Newsletter",
        detail:
          "Friday senior issue — one flexible hustle tip at your pace — in your inbox and on the Newsletter page.",
      },
      {
        title: "Peer learning circle",
        detail: "Share skills, try gentle AI prompting, stay curious.",
      },
      {
        title: "Workshop member pricing",
        detail: "Member discounts on senior-friendly labs and clinics.",
      },
      {
        title: "One 45-minute session",
        detail: "Senior-friendly consulting pacing — same rates as adults; 3-month commitment.",
      },
    ],
  },
  pro: {
    adult: [
      {
        title: "Everything in Starter, plus:",
        detail: "All Free + Starter benefits carry forward — here’s what’s new on Pro.",
      },
      {
        title: "Hustle schedule suite",
        detail:
          "Weekly plan, tracker, progress reports, email reminders, and Profit & Loss calculator.",
      },
      {
        title: "Profit & Loss calculator",
        detail:
          "Add dated sales and expense line items (Admin, Overhead, Advertising, and more) with daily, weekly, and monthly rollups.",
      },
      {
        title: "Group training sessions",
        detail: "Monthly cohort training with Tina & Evelyn and/or Tina & Evelyn Guest Speakers.",
      },
      {
        title: "Free workshop entry",
        detail: "Complimentary seats to eligible Glow labs.",
      },
      {
        title: "Three 60-minute sessions",
        detail: "Upgrade from Starter’s one 45-minute session — 3-month commitment.",
      },
      {
        title: "60 Kid Credits / mo",
        detail: "Double Starter’s pool — redeem for kids or adults (2 Kid Credits = 1 adult credit).",
      },
    ],
    kids: [
      {
        title: "Everything in Starter, plus:",
        detail: "All Free + Starter benefits carry forward — here’s what’s new on Pro for Kids.",
      },
      {
        title: "Craft hustle playbooks",
        detail: "Stickers, keychains, and fair-ready projects with family pricing tips.",
      },
      {
        title: "Make games with AI",
        detail: "Step-by-step guides to invent tiny games with a parent — stories, characters, levels.",
      },
      {
        title: "Kids schedule & tracker",
        detail:
          "Parent-friendly weekly plan tied to Get Your Side Hustle matches — includes Profit & Loss for kid hustles.",
      },
      {
        title: "Profit & Loss calculator",
        detail: "Simple sales and expense tracking with categories and weekly/monthly rollups.",
      },
      {
        title: "Workshop member seats",
        detail: "Stronger member pricing on Kids Glow labs and family sessions.",
      },
      {
        title: "Three 60-minute family sessions",
        detail: "Upgrade from Starter’s one 45-minute session — parent joins; 3-month commitment.",
      },
    ],
    junior: [
      {
        title: "Everything in Starter, plus:",
        detail: "All Free + Starter benefits carry forward — here’s what’s new on Pro for Teens.",
      },
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
        detail:
          "Week plan + tracker around school — earn, save, reinvest — plus Profit & Loss calculator.",
      },
      {
        title: "Profit & Loss calculator",
        detail: "Track sales and categorized expenses; see daily, weekly, and monthly totals.",
      },
      {
        title: "Three 60-minute sessions",
        detail: "Upgrade from Starter’s one 45-minute session — guardian OK; 3-month commitment.",
      },
    ],
    senior: [
      {
        title: "Everything in Starter, plus:",
        detail: "All Free + Starter benefits carry forward — here’s what’s new on Pro for Seniors.",
      },
      {
        title: "Flexible hustle schedule",
        detail: "Gentle weekly plan matched to senior Get Your Side Hustle results.",
      },
      {
        title: "Profit & Loss calculator",
        detail: "Easy sales and expense line items with clear weekly and monthly rollups.",
      },
      {
        title: "Progress reports + email nudges",
        detail: "Clear scorecards without grind-culture pressure.",
      },
      {
        title: "Workshop member seats",
        detail: "Discounted or complimentary seats to eligible senior-friendly labs.",
      },
      {
        title: "Three 60-minute sessions",
        detail: "Upgrade from Starter’s one 45-minute session — strategy for consulting, tutoring, or hosting.",
      },
    ],
  },
  elite: {
    adult: [
      {
        title: "Everything in Pro, plus:",
        detail: "All Free + Starter + Pro benefits carry forward — here’s what’s new on Elite.",
      },
      {
        title: "Three 90-minute sessions",
        detail: "Upgrade from Pro’s 60-minute sessions — scaling, ads, and multi-hustle ops; 3-month commitment.",
      },
      {
        title: "Best-times ZipCode scout",
        detail: "Peak windows for rideshare & delivery in your ZipCode.",
      },
      {
        title: "120 Kid Credits / mo",
        detail: "Largest monthly pool for workshops & 1-on-1s (kids or adults).",
      },
      {
        title: "Priority workshop access",
        detail: "First look at advanced AI-agent and build nights.",
      },
    ],
    kids: [
      {
        title: "Everything in Pro, plus:",
        detail: "All Free + Starter + Pro benefits carry forward — here’s what’s new on Elite for Kids.",
      },
      {
        title: "Advanced AI game studio",
        detail: "Deeper builds — levels, characters, and shareable mini-games with a parent.",
      },
      {
        title: "Priority Glow labs",
        detail: "Early seats for Kids Glow nights and story + hustle combos.",
      },
      {
        title: "Three 90-minute family sessions",
        detail: "Upgrade from Pro’s 60-minute sessions — parents can use for kid hustle planning.",
      },
      {
        title: "Reinvest challenges",
        detail: "Missions that teach putting earnings back into supplies and kindness.",
      },
    ],
    junior: [
      {
        title: "Everything in Pro, plus:",
        detail: "All Free + Starter + Pro benefits carry forward — here’s what’s new on Elite for Teens.",
      },
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
        title: "Three 90-minute sessions",
        detail: "Upgrade from Pro’s 60-minute sessions — launch plans with a guardian.",
      },
    ],
    senior: [
      {
        title: "Everything in Pro, plus:",
        detail: "All Free + Starter + Pro benefits carry forward — here’s what’s new on Elite for Seniors.",
      },
      {
        title: "Three 90-minute sessions",
        detail: "Upgrade from Pro’s 60-minute sessions — deep dives on consulting, tutoring, or hosting.",
      },
      {
        title: "ZipCode timing for flexible gigs",
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
      "Same consulting rate for every age — strategy for launches, pricing, or pivots. Buy a la carte anytime (Kids/Teens with a parent).",
    includedIn: [],
  },
  {
    id: "consult-60",
    name: "1-on-1 consulting (60 min)",
    category: "consulting",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 120,
    credits: 240,
    detail:
      "Same consulting rate for every age — deeper planning session. Included as one 45-minute session on Starter; three 60-minute sessions on Pro (Kids/Teens with a parent).",
    includedIn: ["starter", "pro", "elite"],
  },
  {
    id: "consult-90",
    name: "1-on-1 consulting (90 min)",
    category: "consulting",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 165,
    credits: 330,
    detail:
      "Same consulting rate for every age — extended deep-dive. Included as three 90-minute sessions on Elite (Kids/Teens with a parent).",
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
    name: "Best-times ZipCode scout (month)",
    category: "digital",
    audiences: ["adult", "senior"],
    priceUsd: 29,
    detail: "Peak hours across rideshare & delivery apps for your ZipCode.",
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

/**
 * Adults & Seniors Join callout. No separate Stripe price IDs yet — copy only until
 * veteran checkout pricing is wired; do not invent dollar amounts here.
 *
 * Hidden on Join until Task T-MEM-MILITARY (Sprint 6) re-enables it with the Military membership discount.
 * Flip {@link SHOW_MILITARY_VETERAN_CALLOUT} to true when that sprint ships.
 */
export const SHOW_MILITARY_VETERAN_CALLOUT = false;

export const MILITARY_VETERAN_CALLOUT = {
  badge: "Military & Veterans",
  title: "Serving or served? You’re welcome here.",
  body:
    "Active-duty, Guard, Reserve, and Veterans belong in our Adults & Seniors lanes — GYSH was built with military grit in the family. Veterans save even more: mention your service at signup and we’ll apply the veteran rate before you pay (on top of Senior pricing when you’re 55+).",
  audiences: ["adult", "senior"] as const satisfies readonly AudienceGroup[],
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

/** Included 1-on-1 consulting length by paid tier (Free has none). Starter = one 45-min; Pro = three 60-min; Elite = three 90-min. */
export function tierOneOnOneMinutes(tierId: TierId): 30 | 45 | 60 | 90 | 0 {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  return tier?.oneOnOneMinutes ?? 0;
}

export function oneOnOneFeatureLabel(tierId: TierId): string {
  const minutes = tierOneOnOneMinutes(tierId);
  if (!minutes) return "1-on-1 consulting session";
  if (tierId === "starter") return "1× 45-minute session";
  if (tierId === "pro") return "3× 60-minute sessions";
  if (tierId === "elite") return "3× 90-minute sessions";
  return `1× ${minutes}-minute session`;
}

export function oneOnOneFeatureDetail(tierId: TierId): string {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  const minutes = tier?.oneOnOneMinutes;
  if (!minutes) return "Personal consulting for strategy, pricing, and launches.";
  const commit =
    tier?.commitmentMonths && tier.commitmentMonths > 1
      ? ` ${tier.commitmentMonths}-month commitment required.`
      : "";
  if (tierId === "starter") {
    return `One 45-minute consulting session included. Same rates for Kids, Teens, Adults, and Seniors.${commit}`;
  }
  if (tierId === "pro") {
    return `Three 60-minute consulting sessions included. Same rates for Kids, Teens, Adults, and Seniors.${commit}`;
  }
  if (tierId === "elite") {
    return `Three 90-minute consulting sessions included. Same rates for Kids, Teens, Adults, and Seniors.${commit}`;
  }
  return `Live consulting session (${minutes} minutes). Same rates for Kids, Teens, Adults, and Seniors.${commit}`;
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
  if (Number.isInteger(n)) return `$${n.toLocaleString()}`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export type BillingPeriod = "monthly" | "yearly";

/** Months charged when paying yearly in advance (2 months free ≈ 17% off). */
export const YEARLY_MONTHS_CHARGED = 10;

/** What 12 months would cost at the monthly rate (before yearly discount). */
export function yearlyListPriceUsd(monthly: number): number {
  return monthly * 12;
}

/** Dollars saved by paying yearly vs 12 × monthly. */
export function yearlySavingsUsd(monthly: number, yearly: number): number {
  return Math.max(0, yearlyListPriceUsd(monthly) - yearly);
}

/** Percent saved by paying yearly vs 12 × monthly (rounded). */
export function yearlySavingsPercent(monthly: number, yearly: number): number {
  const list = yearlyListPriceUsd(monthly);
  if (list <= 0) return 0;
  return Math.round((yearlySavingsUsd(monthly, yearly) / list) * 100);
}

/** Effective monthly rate when billed yearly. */
export function equivalentMonthlyUsd(yearly: number): number {
  return Math.round((yearly / 12) * 100) / 100;
}

/** USD monthly price for Adult vs Senior (Kids/Teens use credits). */
export function tierPriceMonthlyUsd(tier: MembershipTier, audience: AudienceGroup): number {
  if (audience === "senior") {
    return tier.priceMonthlyUsdSenior ?? tier.priceMonthlyUsd ?? 0;
  }
  return tier.priceMonthlyUsd ?? 0;
}

/** USD yearly price for Adult vs Senior (pay YEARLY_MONTHS_CHARGED months up front). */
export function tierPriceYearlyUsd(tier: MembershipTier, audience: AudienceGroup): number | undefined {
  if (audience === "senior") {
    return tier.priceYearlyUsdSenior ?? tier.priceYearlyUsd;
  }
  return tier.priceYearlyUsd;
}
