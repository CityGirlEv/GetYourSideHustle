/**
 * GYSH membership tiers, credit economy (Kids/Teens), and a-la-carte price list.
 * Pro & Above unlocks proposed hustle schedules, trackers, progress reports, and email alerts.
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
    label: "Bi-Weekly Newsletter",
    detail:
      "Two issues per month — kids glow story + adult hustle tip — in your inbox and on the members-only Newsletter page.",
  },
  { id: "workshop_discount", label: "Workshop discounts", detail: "Member pricing on live labs and clinics." },
  { id: "workshop_free", label: "Workshop member seats", detail: "Included seats: Starter one · Pro 2. Elite includes entry to all workshop sessions with 2 seats. Extra Starter/Pro seats are $40 or 40 credits." },
  {
    id: "workshop_priority",
    label: "Priority workshop access",
    detail: "First look at workshops, labs, and guest clinics. Included on Starter, Pro, and Elite.",
  },
  { id: "training", label: "Group training sessions", detail: "Monthly cohort training with Tina & Evelyn and/or Tina & Evelyn Guest Speakers. Available a la carte." },
  {
    id: "one_on_one",
    label: "1-on-1 consulting session",
    detail:
      "Live 1-on-1 with Tina & Evelyn — Starter includes one 60-minute session or two 30-minute sessions; Pro includes two 60-minute sessions; Elite includes three 60-minute sessions. Same consulting rates for every age.",
  },
  { id: "schedule", label: "Proposed hustle schedule", detail: "Week-by-week plan matched to your Get Your Side Hustle results." },
  { id: "tracker", label: "Hustle tracker", detail: "Log hours, gigs, earnings, and checklist progress." },
  { id: "progress", label: "Progress reports", detail: "Weekly/monthly scorecards with next-step recommendations." },
  { id: "email", label: "Email notifications", detail: "Reminders for schedule blocks, milestones, and workshop seats." },
  {
    id: "pnl",
    label: "Profit & Loss calculator",
    detail:
      "Log dated sales and expense line items (Admin, Overhead, Advertising, and more) with daily, weekly, and monthly rollups in Schedule Suite. Included on Elite.",
  },
  { id: "zip_timing", label: "Best-times ZipCode scout", detail: "Cross-app peak hours for rideshare & delivery in your ZipCode." },
  { id: "story_time", label: "Story time seats", detail: "Kevina Starr / Glow Getter story sessions for kids." },
  {
    id: "kid_credits",
    label: "Kid Credits",
    detail:
      "Monthly credit pool for Kids, Teens, Adults, or Seniors — 1 credit = $1 cash. Redeem toward workshops and 1-on-1s.",
  },
  {
    id: "merch",
    label: "GYSH merch",
    detail:
      "Starter includes one GYSH T-shirt or hat; Pro and Elite include 2 (mix and match). Choose at signup.",
  },
];

export type MembershipTier = {
  id: TierId;
  name: string;
  tagline: string;
  /** Adult/Senior USD monthly. Kids/Teens pay the same amount in credits (1 credit = $1). */
  priceMonthlyUsd?: number;
  priceYearlyUsd?: number;
  /** Senior (50+) USD pricing — intentionally lower than adult. */
  priceMonthlyUsdSenior?: number;
  priceYearlyUsdSenior?: number;
  /** Included monthly credits on the plan (same for every age). Not the membership price. */
  creditsPerMonth?: number;
  /** Alias of creditsPerMonth — kept so existing readers still resolve. */
  kidCreditsMonthly?: number;
  /** Included 1-on-1 consulting length (minutes). Starter = 60 min (or two 30s); Pro = two 60s; Elite = three 60s. */
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
    tagline:
      "Free for every age — Kids, Teens, Adults & Seniors. Includes 20 Side Hustle Guides to choose from, ideas, and your Corner at $0.",
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
    tagline: "Member guides, community, bi-weekly newsletter, one 60-minute or two 30-minute sessions, and 2.5 credits / month — 3-month commitment.",
    priceMonthlyUsd: 39,
    priceYearlyUsd: 390,
    priceMonthlyUsdSenior: 34,
    priceYearlyUsdSenior: 340,
    creditsPerMonth: 2.5,
    kidCreditsMonthly: 2.5,
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
      "workshop_priority",
      "one_on_one",
      "story_time",
      "kid_credits",
      "merch",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Hustle schedule suite plus two 60-minute sessions — 3-month commitment.",
    priceMonthlyUsd: 69,
    priceYearlyUsd: 690,
    priceMonthlyUsdSenior: 57,
    priceYearlyUsdSenior: 570,
    creditsPerMonth: 5,
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
      "workshop_priority",
      "one_on_one",
      "schedule",
      "tracker",
      "progress",
      "email",
      "story_time",
      "kid_credits",
      "merch",
    ],
    kidCreditsMonthly: 5,
    highlight: true,
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "Three 60-minute sessions, entry to all workshops (2 seats), and priority support — 3-month commitment.",
    priceMonthlyUsd: 119,
    priceYearlyUsd: 1190,
    priceMonthlyUsdSenior: 94,
    priceYearlyUsdSenior: 940,
    creditsPerMonth: 10,
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
      "workshop_priority",
      "one_on_one",
      "schedule",
      "tracker",
      "progress",
      "email",
      "pnl",
      "story_time",
      "kid_credits",
      "merch",
    ],
    kidCreditsMonthly: 10,
  },
];

/** Pro is the first tier that unlocks the schedule / tracker / progress / email suite. */
export const SCHEDULE_SUITE_TIER: TierId = "pro";

export const SCHEDULE_SUITE_FEATURE_IDS = [
  "schedule",
  "tracker",
  "progress",
  "email",
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

/** Complimentary GYSH merch included on paid plans. */
export type MerchItemId = "tshirt" | "hat";

/** Adult unisex T-shirt sizes collected at signup when T-shirt is chosen. */
export type MerchTshirtSize = "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL";

export const MERCH_TSHIRT_SIZES: readonly MerchTshirtSize[] = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
];

export function isMerchTshirtSize(value: unknown): value is MerchTshirtSize {
  return (MERCH_TSHIRT_SIZES as readonly string[]).includes(String(value).trim().toUpperCase());
}

export function normalizeMerchTshirtSize(value: unknown): MerchTshirtSize | null {
  const raw = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  if (raw === "XXL") return "2XL";
  if (raw === "XXXL") return "3XL";
  return isMerchTshirtSize(raw) ? raw : null;
}

export const MEMBERSHIP_MERCH_ITEMS: readonly { id: MerchItemId; label: string }[] = [
  { id: "tshirt", label: "GYSH T-shirt" },
  { id: "hat", label: "GYSH hat" },
];

export function isMerchItemId(value: unknown): value is MerchItemId {
  return value === "tshirt" || value === "hat";
}

/** Starter = 1 item; Pro & Elite = 2 items. Free = none. */
export function merchItemCount(tierId: TierId | null | undefined): 0 | 1 | 2 {
  if (tierId === "starter") return 1;
  if (tierId === "pro" || tierId === "elite") return 2;
  return 0;
}

export function merchItemLabel(id: MerchItemId): string {
  return MEMBERSHIP_MERCH_ITEMS.find((item) => item.id === id)?.label ?? id;
}

export function parseMerchChoices(raw: unknown, count: number): MerchItemId[] | null {
  if (count <= 0) return [];
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(/[,+|]/)
      : [];
  const items = list.map((v) => String(v).trim().toLowerCase()).filter(isMerchItemId);
  if (items.length !== count) return null;
  return items;
}

/** Parallel size list for T-shirt slots (empty string / null for hats). */
export function parseMerchTshirtSizes(
  choices: readonly (MerchItemId | "")[],
  sizes: unknown,
): (MerchTshirtSize | "")[] {
  const raw = Array.isArray(sizes) ? sizes : [];
  return choices.map((choice, i) => {
    if (choice !== "tshirt") return "";
    return normalizeMerchTshirtSize(raw[i]) ?? "";
  });
}

export function merchChoicesError(
  tierId: TierId | null | undefined,
  raw: unknown,
  tshirtSizes?: unknown,
): string | null {
  const count = merchItemCount(tierId);
  if (count <= 0) return null;
  const choices = parseMerchChoices(raw, count);
  if (!choices) {
    return count === 1
      ? "Choose a GYSH T-shirt or hat — Starter includes one merch item."
      : "Choose a GYSH T-shirt or hat for each included item — Pro and Elite include 2.";
  }
  // Size is required only when the caller passes a sizes array (signup UI).
  if (tshirtSizes !== undefined) {
    const sizes = parseMerchTshirtSizes(choices, tshirtSizes);
    const missingSize = choices.some((c, i) => c === "tshirt" && !sizes[i]);
    if (missingSize) {
      return "Choose a T-shirt size for each GYSH T-shirt.";
    }
  }
  return null;
}

export function formatMerchChoiceNote(
  choices: readonly MerchItemId[],
  tshirtSizes: readonly (MerchTshirtSize | "")[] = [],
): string {
  const parts: string[] = [];
  choices.forEach((id, i) => {
    if (id === "tshirt") {
      const size = tshirtSizes[i];
      parts.push(size ? `1× T-shirt (${size})` : "1× T-shirt");
    } else {
      parts.push("1× hat");
    }
  });
  return parts.length ? `Merch: ${parts.join(" + ")}` : "";
}

export function mergeMerchNote(
  existingNotes: string,
  choices: readonly MerchItemId[],
  tshirtSizes: readonly (MerchTshirtSize | "")[] = [],
): string {
  const stamp = formatMerchChoiceNote(choices, tshirtSizes);
  if (!stamp) return existingNotes.slice(0, 1900);
  const without = existingNotes
    .replace(/(?:^| · )Merch: [^·]+/g, "")
    .replace(/^ · /, "")
    .trim();
  return `${without}${without ? " · " : ""}${stamp}`.slice(0, 1900);
}

export const ALL_AGES_GUIDES_FREE_PERK: TierMemberPerk = {
  title: "Free comes with 20 Side Hustle Guides to choose from",
  detail:
    "Kids, Teens, Adults & Seniors — pick the ones that fit, plus ideas, Corners, and next steps at $0.",
};

export const ALL_AGES_GUIDES_STARTER_PERK: TierMemberPerk = {
  title: "Kids, Teens, Adults & Seniors Guides, ideas, etc.",
  detail:
    "Unlock full member Kids, Teens, Adults & Seniors guides, ideas, and bookmarks — every age group, not just Adults.",
};

export const ALL_AGES_MATCH_WIZARDS_PERK: TierMemberPerk = {
  title: "Kids, Teens, Adults & Seniors Side Hustle Match Wizards",
  detail:
    "Kids, Teens, Adults, and Seniors each get their Side Hustle Match Wizard plus ranked ideas with match %.",
};

export const MERCH_STARTER_PERK: TierMemberPerk = {
  title: "One GYSH T-shirt or hat",
  detail: "One complimentary GYSH merch item — choose a T-shirt or hat when you sign up.",
};

export const MERCH_PRO_PERK: TierMemberPerk = {
  title: "2 GYSH T-shirts or hats",
  detail:
    "Two complimentary GYSH merch items (T-shirt or hat, mix and match) — up from Starter’s 1. Choose at signup.",
};

export const PRIORITY_WORKSHOP_PERK: TierMemberPerk = {
  title: "Priority workshop access",
  detail: "First look at workshops, labs, and guest clinics — included on Starter, Pro, and Elite.",
};

export const GROUP_TRAINING_PERK: TierMemberPerk = {
  title: "Group training sessions",
  detail: "Monthly cohort training with Tina & Evelyn and/or Tina & Evelyn Guest Speakers.",
};

export const PNL_PERK: TierMemberPerk = {
  title: "Profit & Loss calculator",
  detail:
    "Add dated sales and expense line items (Admin, Overhead, Advertising, and more) with daily, weekly, and monthly rollups in Schedule Suite.",
};

export const ELITE_WORKSHOP_PERK: TierMemberPerk = {
  title: "Entry to all workshop sessions — 2 seats",
  detail: "Two complimentary seats at every GYSH workshop, Glow lab, and guest clinic — no extra seat fee.",
};

/** Header My Dashboard chip color — matches the member’s current plan. */
export function dashboardNavTone(tier: string | null | undefined): TierId {
  const id = String(tier || "free").toLowerCase();
  if (id === "starter" || id === "pro" || id === "elite") return id;
  return "free";
}

/** Bi-Weekly Newsletter archive + inbox — Starter & Above (admins / QA / Dev bypass). */
export function canAccessNewsletter(
  tierId: TierId | null | undefined,
  opts?: { isAdmin?: boolean },
): boolean {
  if (opts?.isAdmin) return true;
  return tierHasFeature((tierId ?? "free") as TierId, "newsletter");
}

/** GYSH Community feed — Starter & Above (admins bypass). Free is browse-only. */
export function canAccessCommunity(
  tierId: TierId | null | undefined,
  opts?: { isAdmin?: boolean },
): boolean {
  if (opts?.isAdmin) return true;
  return tierHasFeature((tierId ?? "free") as TierId, "community");
}

/** Full member (non-free) launch guides — Starter & Above. */
export function canAccessMemberGuides(
  tierId: TierId | null | undefined,
  opts?: { isAdmin?: boolean },
): boolean {
  if (opts?.isAdmin) return true;
  return tierHasFeature((tierId ?? "free") as TierId, "member_guides");
}

export function tierMemberPerks(tierId: TierId, audience: MemberPerkAudience): TierMemberPerk[] {
  return MEMBER_PERKS_BY_TIER[tierId][audience];
}

export type NumberedTierPerk = TierMemberPerk & {
  n: number;
  numberedTitle: string;
};

/** Numbered perk rows for Membership / Join (1) 2) 3) …). */
export function numberedTierPerks(tierId: TierId, audience: MemberPerkAudience): NumberedTierPerk[] {
  return tierMemberPerks(tierId, audience).map((perk, index) => ({
    ...perk,
    n: index + 1,
    numberedTitle: `${index + 1}) ${perk.title}`,
  }));
}

/**
 * Spread Adult / Kids / Teens / Senior team benefits across Free → Elite.
 * Paid tiers lead with “Everything in {lower tier}, plus:” and list only new additions.
 * Advanced items (AI games, deep consulting) sit on Pro/Elite.
 */
export const MEMBER_PERKS_BY_TIER: Record<TierId, TierMemberPerks> = {
  free: {
    adult: [
      {
        title: "Free for every age group",
        detail:
          "Kids, Teens, Adults, and Seniors each get free access — browse ideas, free guides, and age-appropriate Corners at $0.",
      },
      ALL_AGES_GUIDES_FREE_PERK,
      ALL_AGES_MATCH_WIZARDS_PERK,
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
      ALL_AGES_GUIDES_FREE_PERK,
      ALL_AGES_MATCH_WIZARDS_PERK,
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
      ALL_AGES_GUIDES_FREE_PERK,
      ALL_AGES_MATCH_WIZARDS_PERK,
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
      ALL_AGES_GUIDES_FREE_PERK,
      ALL_AGES_MATCH_WIZARDS_PERK,
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
      ALL_AGES_GUIDES_STARTER_PERK,
      ALL_AGES_MATCH_WIZARDS_PERK,
      {
        title: "GYSH Community",
        detail: "Ask questions and share wins in member threads.",
      },
      {
        title: "Bi-Weekly Newsletter",
        detail:
          "Two issues per month — kids glow story + adult hustle tip — in your inbox and on the members-only Newsletter page.",
      },
      {
        title: "One workshop member seat",
        detail: "One complimentary seat at a GYSH workshop, Glow lab, or guest clinic. Extra seats are $40 or 40 credits.",
      },
      MERCH_STARTER_PERK,
      PRIORITY_WORKSHOP_PERK,
      {
        title: "One 60-minute session or two 30-minute sessions",
        detail: "One 60-minute session or two 30-minute sessions with Tina and/or Evelyn — 3-month commitment on all paid plans.",
      },
      {
        title: "2.5 credits / mo",
        detail: "Spend on workshops, extra sessions, and Kids/Teens memberships — 1 credit = $1. Adult and Senior memberships stay cash.",
      },
    ],
    kids: [
      {
        title: "Everything in Free, plus:",
        detail: "All Free benefits carry forward — here’s what’s new on Starter for Kids.",
      },
      ALL_AGES_GUIDES_STARTER_PERK,
      ALL_AGES_MATCH_WIZARDS_PERK,
      {
        title: "Bi-Weekly Newsletter",
        detail:
          "Two family issues per month — kids glow story + a parent coach tip — in your inbox and on the Newsletter page.",
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
        title: "One workshop member seat",
        detail: "One complimentary family seat at a Kids Glow lab or workshop. Extra seats are $40 or 40 credits.",
      },
      MERCH_STARTER_PERK,
      PRIORITY_WORKSHOP_PERK,
      {
        title: "Piggy Bank challenges",
        detail: "Goal-setting missions that make saving feel like a game.",
      },
      {
        title: "One 60-minute family session or two 30-minute sessions",
        detail: "Live consulting with a parent — one hour or two 30-minute sessions; 3-month commitment.",
      },
      {
        title: "2.5 credits / mo",
        detail: "Included each month. Pay Kids/Teens memberships, workshops, and extra sessions with credits (1 credit = $1).",
      },
    ],
    junior: [
      {
        title: "Everything in Free, plus:",
        detail: "All Free benefits carry forward — here’s what’s new on Starter for Teens.",
      },
      ALL_AGES_GUIDES_STARTER_PERK,
      ALL_AGES_MATCH_WIZARDS_PERK,
      {
        title: "Bi-Weekly Newsletter",
        detail:
          "Two teen-founder issues per month — skill tip + next step — in your inbox and on the Newsletter page.",
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
        title: "One workshop member seat",
        detail: "One complimentary seat at a Teens Glow lab or workshop. Extra seats are $40 or 40 credits.",
      },
      MERCH_STARTER_PERK,
      PRIORITY_WORKSHOP_PERK,
      {
        title: "One 60-minute session or two 30-minute sessions",
        detail: "Live consulting (guardian OK) — one hour or two 30-minute sessions; 3-month commitment.",
      },
      {
        title: "2.5 credits / mo",
        detail: "Included each month. Pay Teens memberships, workshops, and extra sessions with credits (1 credit = $1).",
      },
    ],
    senior: [
      {
        title: "Everything in Free, plus:",
        detail: "All Free benefits carry forward — here’s what’s new on Starter for Seniors.",
      },
      ALL_AGES_GUIDES_STARTER_PERK,
      ALL_AGES_MATCH_WIZARDS_PERK,
      {
        title: "Bi-Weekly Newsletter",
        detail:
          "Two senior issues per month — one flexible hustle tip at your pace — in your inbox and on the Newsletter page.",
      },
      {
        title: "Peer learning circle",
        detail: "Share skills, try gentle AI prompting, stay curious.",
      },
      {
        title: "One workshop member seat",
        detail: "One complimentary seat at a senior-friendly GYSH workshop or clinic. Extra seats are $40 or 40 credits.",
      },
      MERCH_STARTER_PERK,
      PRIORITY_WORKSHOP_PERK,
      {
        title: "One 60-minute session or two 30-minute sessions",
        detail: "Senior-friendly consulting pacing — one hour or two 30-minute sessions; 3-month commitment.",
      },
      {
        title: "2.5 credits / mo",
        detail: "Spend on workshops and extra sessions — 1 credit = $1. Senior memberships stay cash.",
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
          "Weekly plan, tracker, progress reports, and email reminders.",
      },
      {
        title: "2 workshop member seats",
        detail: "Two complimentary seats — up from Starter’s 1. Extra seats are $40 or 40 credits.",
      },
      MERCH_PRO_PERK,
      {
        title: "Two 60-minute sessions",
        detail: "Upgrade from Starter’s included hour — two live 60-minute sessions with Tina and/or Evelyn; 3-month commitment.",
      },
      {
        title: "5 credits / mo",
        detail: "Double Starter’s included credits — workshops, extra sessions, and Kids/Teens memberships at 1 credit = $1.",
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
          "Parent-friendly weekly plan tied to Get Your Side Hustle matches.",
      },
      {
        title: "2 workshop member seats",
        detail: "Two complimentary Kids Glow / workshop seats — up from Starter’s 1. Extra seats are $40 or 40 credits.",
      },
      MERCH_PRO_PERK,
      {
        title: "Two 60-minute family sessions",
        detail: "Upgrade from Starter’s included hour — parent joins; 3-month commitment.",
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
        title: "2 workshop member seats",
        detail: "Two complimentary Teens Glow / workshop seats — up from Starter’s 1. Extra seats are $40 or 40 credits.",
      },
      MERCH_PRO_PERK,
      {
        title: "Teens schedule suite",
        detail:
          "Week plan + tracker around school — earn, save, reinvest.",
      },
      {
        title: "Two 60-minute sessions",
        detail: "Upgrade from Starter’s included hour — guardian OK; 3-month commitment.",
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
        title: "Progress reports + email nudges",
        detail: "Clear scorecards without grind-culture pressure.",
      },
      {
        title: "Workshop member seats",
        detail: "Discounted or complimentary seats to eligible senior-friendly labs.",
      },
      MERCH_PRO_PERK,
      {
        title: "Two 60-minute sessions",
        detail: "Upgrade from Starter’s included hour — strategy for consulting, tutoring, or hosting.",
      },
    ],
  },
  elite: {
    adult: [
      {
        title: "Everything in Pro, plus:",
        detail: "All Free + Starter + Pro benefits carry forward — here’s what’s new on Elite.",
      },
      PNL_PERK,
      ELITE_WORKSHOP_PERK,
      {
        title: "Three 60-minute sessions",
        detail: "Upgrade from Pro’s two 60-minute sessions — scaling, ads, and multi-hustle ops; 3-month commitment.",
      },
      {
        title: "10 credits / mo",
        detail: "Double Pro’s included credits — workshops, extra sessions, and Kids/Teens memberships at 1 credit = $1.",
      },
    ],
    kids: [
      {
        title: "Everything in Pro, plus:",
        detail: "All Free + Starter + Pro benefits carry forward — here’s what’s new on Elite for Kids.",
      },
      PNL_PERK,
      ELITE_WORKSHOP_PERK,
      {
        title: "Advanced AI game studio",
        detail: "Deeper builds — levels, characters, and shareable mini-games with a parent.",
      },
      {
        title: "Priority Glow labs",
        detail: "Early seats for Kids Glow nights and story + hustle combos.",
      },
      {
        title: "Three 60-minute family sessions",
        detail: "Upgrade from Pro’s two 60-minute sessions — parents can use for kid hustle planning.",
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
      PNL_PERK,
      ELITE_WORKSHOP_PERK,
      {
        title: "Advanced AI game & app tracks",
        detail: "Prototype games and simple tools — parent consent required.",
      },
      {
        title: "Young founder playbooks",
        detail: "Pricing, reinvestment, and portfolio projects for teens.",
      },
      {
        title: "Three 60-minute sessions",
        detail: "Upgrade from Pro’s two 60-minute sessions — launch plans with a guardian.",
      },
    ],
    senior: [
      {
        title: "Everything in Pro, plus:",
        detail: "All Free + Starter + Pro benefits carry forward — here’s what’s new on Elite for Seniors.",
      },
      PNL_PERK,
      ELITE_WORKSHOP_PERK,
      {
        title: "Three 60-minute sessions",
        detail: "Upgrade from Pro’s two 60-minute sessions — deep dives on consulting, tutoring, or hosting.",
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
  /** Cap how often this earn action can pay out. */
  limit?: { count: number; period: "week" | "month" | "season" | "once" };
};

export function formatCreditEarnLimit(limit?: CreditEarnAction["limit"]): string {
  if (!limit) return "";
  if (limit.period === "once") return "once";
  if (limit.period === "season") return limit.count === 1 ? "once per season" : `${limit.count} per season`;
  const unit = limit.period;
  if (limit.count === 1) return `1 per ${unit}`;
  return `${limit.count} per ${unit}`;
}

/** Ways to Earn badge, e.g. +2.5 or +10. */
export function formatEarnCreditDelta(credits: number): string {
  const n = Number(credits);
  if (!Number.isFinite(n)) return "+0";
  const shown = Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
  return `+${shown}`;
}

/**
 * Ways members earn credits (dashboard + membership page).
 * Kids board: referral 5, small habits 1–2, parent plan 5. 1 credit = $1.
 */
export const CREDIT_EARN_ACTIONS: CreditEarnAction[] = [
  {
    id: "refer_friend",
    label: "Refer a friend who joins",
    credits: 5,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "referral",
    detail: "Share your dashboard referral link. When they create a free or paid account, you earn Kid Credits.",
  },
  {
    id: "guide_complete",
    label: "Finish a member guide",
    credits: 1,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "learn",
    limit: { count: 1, period: "week" },
    detail: "Mark a member guide complete. 1 credit, once per week — same for every age.",
  },
  {
    id: "launch_hustle",
    label: "Launch your first hustle",
    credits: 2,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "launch",
    detail: "Confirm a first sale, gig, listing, or lemonade day (parent OK for Kids/Teens).",
  },
  {
    id: "income_25",
    label: "Earn $25 milestone",
    credits: 2.5,
    audiences: ["junior", "adult", "senior"],
    category: "launch",
    detail: "Log verified earnings of $25 from a side hustle. Reward is 10% — $2.50 (2.5 credits).",
  },
  {
    id: "income_100",
    label: "Earn $100 milestone",
    credits: 10,
    audiences: ["junior", "adult", "senior"],
    category: "launch",
    detail: "Hit $100 cumulative earnings (parent approval for Teens). Reward is 10% — $10 (10 credits).",
  },
  {
    id: "piggy_goal",
    label: "Complete a Piggy / My Bank goal",
    credits: 7,
    audiences: ["junior"],
    category: "habit",
    detail: "Reach a savings goal tracked in Piggy Bank or My Bank.",
  },
  {
    id: "community_win",
    label: "Share a win",
    credits: 2,
    audiences: ["kids", "junior", "adult", "senior"],
    category: "community",
    limit: { count: 2, period: "month" },
    detail: "Post a helpful win on My Dashboard → Ways to Earn (up to 2 per month).",
  },
  {
    id: "parent_plan",
    label: "Parent approves your hustle plan",
    credits: 5,
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

/** Optional parent/funded top-ups — 1 Kid Credit = $1. */
export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "boost",
    name: "Boost Pack",
    credits: 5,
    priceUsd: 5,
    detail: "A small boost for a quiz, report, or savings goal.",
  },
  {
    id: "builder",
    name: "Builder Pack",
    credits: 10,
    priceUsd: 10,
    detail: "Enough for a workshop, training session, or extra 1-on-1 time.",
  },
  {
    id: "launcher",
    name: "Launcher Pack",
    credits: 20,
    priceUsd: 20,
    detail: "A flexible balance for multiple learning activities.",
    popular: true,
  },
  {
    id: "family",
    name: "Family Pack",
    credits: 40,
    priceUsd: 40,
    detail: "Best value for ongoing coaching, workshops, and activities.",
  },
];

export function creditPackById(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((pack) => pack.id === id);
}

export function isCreditPackId(id: string): boolean {
  return CREDIT_PACKS.some((pack) => pack.id === id);
}

/** Join pack column: "Boost Pack - 5 credits". */
export function formatCreditPackListingName(pack: Pick<CreditPack, "name" | "credits">): string {
  const credits = Math.max(0, Math.floor(Number(pack.credits) || 0));
  return `${pack.name} - ${credits} credits`;
}

/** Join Cost column for packs — price only. */
export function formatCreditPackCost(pack: Pick<CreditPack, "priceUsd">): string {
  return formatUsd(pack.priceUsd);
}

export type AlaCarteItem = {
  id: string;
  name: string;
  category: "story" | "consulting" | "workshop" | "coaching" | "digital" | "schedule";
  audiences: AudienceGroup[];
  priceUsd: number;
  credits?: number;
  detail: string;
  /** Longer “What is this?” popup copy. Shown only when set. */
  explain?: string;
  includedIn?: TierId[];
};

export const ALA_CARTE_PRICE_LIST: AlaCarteItem[] = [
  {
    id: "story-time",
    name: "Kevina Starr Story Time (1 session — 5 students needed to hold a class)",
    category: "story",
    audiences: ["kids"],
    priceUsd: 15,
    credits: 15,
    detail: "Live Glow Getter story session — book a class (5 students needed to hold a class), with a parent nearby.",
    explain:
      "Kevina Starr Story Time is a live Glow Getter class for kids. The $15 (or 15 credits) price is for one session. Five students are needed to hold a class. A parent or guardian stays nearby. Paid memberships include Story Time seats; this listing is for extra sessions.",
    includedIn: ["starter", "pro", "elite"],
  },
  {
    id: "junior-lab",
    name: "Teens Glow Lab seat",
    category: "workshop",
    audiences: ["junior"],
    priceUsd: 25,
    credits: 25,
    detail: "Single seat at a junior build / pricing / AI game-making lab.",
    includedIn: ["pro", "elite"],
  },
  {
    id: "workshop-general",
    name: "Workshops (Starter & Above Workshops Free)",
    category: "workshop",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 40,
    credits: 40,
    detail: "One seat at a GYSH workshop, Glow lab, or guest clinic. Starter includes one seat, Pro includes 2, and Elite includes entry to all sessions with 2 seats.",
    includedIn: ["starter", "pro", "elite"],
  },
  {
    id: "training-group",
    name: "Group training session",
    category: "coaching",
    audiences: ["adult", "senior", "junior"],
    priceUsd: 45,
    credits: 45,
    detail: "Cohort training block (skills, outreach, pricing).",
    includedIn: [],
  },
  {
    id: "consult-30",
    name: "1-on-1 consulting (30 min)",
    category: "consulting",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 45,
    credits: 45,
    detail:
      "Same consulting rate for every age — strategy for launches, pricing, or pivots. Starter can use two 30-minute sessions as the included hour; extra 30-minute sessions are a la carte (Kids/Teens with a parent).",
    includedIn: ["starter"],
  },
  {
    id: "consult-60",
    name: "1-on-1 consulting (60 min)",
    category: "consulting",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 65,
    credits: 65,
    detail:
      "Same consulting rate for every age — deeper planning session. Included as one 60-minute session on Starter (or two 30s), two 60-minute sessions on Pro, and three 60-minute sessions on Elite (Kids/Teens with a parent).",
    includedIn: ["starter", "pro", "elite"],
  },
  {
    id: "consult-90",
    name: "1-on-1 consulting (90 min)",
    category: "consulting",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 75,
    credits: 75,
    detail:
      "Same consulting rate for every age — extended deep-dive. Not included on any plan; buy extra time a la carte (Kids/Teens with a parent).",
    includedIn: [],
  },
  {
    id: "consult-120",
    name: "1-on-1 consulting (2 hours)",
    category: "consulting",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 145,
    credits: 145,
    detail:
      "Same consulting rate for every age — a two-hour deep-dive. Not included on any plan; buy extra time a la carte (Kids/Teens with a parent).",
    includedIn: [],
  },
  {
    id: "progress-pdf",
    name: "Progress report PDF (one-off)",
    category: "digital",
    audiences: ["kids", "junior", "adult", "senior"],
    priceUsd: 12,
    credits: 12,
    detail:
      "A downloadable scorecard of hustle progress, wins, and next steps. Pro and Elite include it; this is a one-off extra copy.",
    explain:
      "The Progress report PDF is a one-page scorecard of how the hustle is going — what’s working, what’s stuck, and the next recommended steps. Pro and Elite include it automatically. This listing is a one-off extra copy for $12 or 12 credits.",
    includedIn: ["pro", "elite"],
  },
  {
    id: "zip-timing",
    name: "Best-times ZipCode scout (month)",
    category: "digital",
    audiences: ["adult", "senior"],
    priceUsd: 29,
    credits: 29,
    detail: "Peak hours across rideshare & delivery apps for your ZipCode.",
    includedIn: [],
  },
];

export const AUDIENCE_LABELS: Record<AudienceGroup, string> = {
  kids: "Kids (4–12)",
  junior: "Teens (13–17)",
  adult: "Adults (18–49)",
  senior: "Seniors (50+)",
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
    "Active-duty, Guard, Reserve, and Veterans belong in our Adults & Seniors lanes — GYSH was built with military grit in the family. Veterans save even more: mention your service at signup and we’ll apply the veteran rate before you pay (on top of Senior pricing when you’re 50+).",
  audiences: ["adult", "senior"] as const satisfies readonly AudienceGroup[],
};

export function tierKidCredits(tierId: TierId): number {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  return tier?.kidCreditsMonthly ?? 0;
}

export function kidCreditsFeatureLabel(tierId: TierId): string {
  const credits = tierKidCredits(tierId);
  if (credits <= 0) return "credits";
  return `${credits} credit${credits === 1 ? "" : "s"}`;
}

/**
 * Join a-la-carte Cost column: dollar price or the same number of credits.
 * 1 credit = $1. No kid/adult split and no membership-tier tags.
 */
export function formatAlaCarteDetails(item: {
  priceUsd: number;
  credits?: number;
  includedIn?: readonly string[];
}): string {
  const usd = Number.isFinite(item.priceUsd) ? Math.max(0, Math.round(item.priceUsd)) : 0;
  const credits =
    item.credits != null && Number.isFinite(item.credits)
      ? Math.max(0, Math.round(Number(item.credits)))
      : usd;
  const amount = usd > 0 ? usd : credits;
  return `${formatUsd(amount)} or ${amount} credit${amount === 1 ? "" : "s"}`;
}

/** Included 1-on-1 consulting length by paid tier (Free has none). Starter/Pro/Elite sessions are 60 minutes (Starter may split into two 30s). */
export function tierOneOnOneMinutes(tierId: TierId): 30 | 60 | 90 | 0 {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  return tier?.oneOnOneMinutes ?? 0;
}

export function oneOnOneFeatureLabel(tierId: TierId): string {
  if (tierId === "starter") return "1× 60-min or 2× 30-min sessions";
  if (tierId === "pro") return "2× 60-minute sessions";
  if (tierId === "elite") return "3× 60-minute sessions";
  return "1-on-1 consulting session";
}

/** Included 1-on-1 session count on a paid plan (Free has none). Starter’s 1×60 may be taken as 2×30. */
export function oneOnOneSessionCount(tierId: TierId): number {
  if (tierId === "starter") return 1;
  if (tierId === "pro") return 2;
  if (tierId === "elite") return 3;
  return 0;
}

export function oneOnOneFeatureDetail(tierId: TierId): string {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  const commit =
    tier?.commitmentMonths && tier.commitmentMonths > 1
      ? ` ${tier.commitmentMonths}-month commitment required.`
      : "";
  if (tierId === "starter") {
    return `One 60-minute consulting session or two 30-minute sessions included. Same rates for Kids, Teens, Adults, and Seniors.${commit}`;
  }
  if (tierId === "pro") {
    return `Two 60-minute consulting sessions included. Same rates for Kids, Teens, Adults, and Seniors.${commit}`;
  }
  if (tierId === "elite") {
    return `Three 60-minute consulting sessions included. Same rates for Kids, Teens, Adults, and Seniors.${commit}`;
  }
  return "Personal consulting for strategy, pricing, and launches.";
}

export function tierHasFeature(tierId: TierId, featureId: string): boolean {
  const tier = MEMBERSHIP_TIERS.find((t) => t.id === tierId);
  return !!tier?.featureIds.includes(featureId);
}

/**
 * Compact Join comparison — what’s included vs locked per plan.
 * Cells: "Yes" | "—" | short note (consulting counts, etc.).
 */
export type MembershipCompareRow = {
  id: string;
  label: string;
  whyUpgrade?: string;
  cells: Record<TierId, string>;
};

export const MEMBERSHIP_COMPARE_ROWS: readonly MembershipCompareRow[] = [
  {
    id: "browse",
    label: "Browse ideas & free guides",
    cells: { free: "Yes", starter: "Yes", pro: "Yes", elite: "Yes" },
  },
  {
    id: "member_guides",
    label: "Full member guides (gated)",
    whyUpgrade: "Upgrade when you’re ready for paid playbooks",
    cells: { free: "—", starter: "Yes", pro: "Yes", elite: "Yes" },
  },
  {
    id: "newsletter",
    label: "Weekly Newsletter archive",
    cells: { free: "—", starter: "Yes", pro: "Yes", elite: "Yes" },
  },
  {
    id: "consulting",
    label: "1-on-1 consulting included",
    whyUpgrade: "More included 60-minute sessions as you move up",
    cells: {
      free: "—",
      starter: "1 × 60 min or 2 × 30 min",
      pro: "2 × 60 min",
      elite: "3 × 60 min",
    },
  },
  {
    id: "workshop_priority",
    label: "Priority workshop access",
    whyUpgrade: "Paid plans get first look at workshops and labs",
    cells: { free: "—", starter: "Yes", pro: "Yes", elite: "Yes" },
  },
  {
    id: "schedule",
    label: "Hustle Schedule Suite",
    whyUpgrade: "Pro and Elite unlock the weekly plan toolkit",
    cells: { free: "—", starter: "—", pro: "Yes", elite: "Yes" },
  },
  {
    id: "pnl",
    label: "Profit & Loss calculator",
    whyUpgrade: "Elite unlocks dated sales and expense tracking",
    cells: { free: "—", starter: "—", pro: "—", elite: "Yes" },
  },
  {
    id: "credits",
    label: "Monthly credits",
    cells: {
      free: "—",
      starter: "2.5 / mo",
      pro: "5 / mo",
      elite: "10 / mo",
    },
  },
  {
    id: "merch",
    label: "GYSH T-shirt or hat",
    whyUpgrade: "Starter includes one; Pro and Elite include 2. Choose at signup.",
    cells: {
      free: "—",
      starter: "One item",
      pro: "2 items",
      elite: "2 items",
    },
  },
  {
    id: "packs",
    label: "Optional credit packs",
    whyUpgrade: "Top up only when monthly credits aren’t enough",
    cells: { free: "Buy any time", starter: "Buy any time", pro: "Buy any time", elite: "Buy any time" },
  },
  {
    id: "coming_soon",
    label: "Coming soon content",
    whyUpgrade: "Not unlocked by membership — still building",
    cells: {
      free: "Marked Coming soon",
      starter: "Marked Coming soon",
      pro: "Marked Coming soon",
      elite: "Marked Coming soon",
    },
  },
];

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
