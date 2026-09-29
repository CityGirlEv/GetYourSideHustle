/** Senior Side Hustles — opportunities & guide teasers for 50+ / flexible schedules. */

import { seniorGuideMinTier } from "./guide-access";
import { hustleById, seniorBrowseOpportunities } from "./side-hustle-catalog";

export type SeniorOpportunity = {
  id: string;
  name: string;
  desc: string;
  fit: string;
  schedule: string;
  startup: string;
};

export type SeniorGuideTeaser = {
  id: string;
  title: string;
  blurb: string;
  /**
   * live = opens an existing adult Launch Guide (ready now; still membership-gated).
   * coming_soon = senior-specific draft not published yet.
   * preview = senior opener card (still membership-gated by min tier).
   */
  status: "coming_soon" | "preview" | "live";
  /** Adult Launch Guide id when status is "live". */
  launchGuideId?: string;
};

export const SENIOR_AUDIENCE_LABEL = "50+ · Retirees & flexible schedules";

export const SENIOR_INTRO = {
  headline: "GYSH side hustles that fit your pace",
  lead:
    "Get Your Side Hustle welcomes seniors, retirees, and anyone building a second chapter on a flexible schedule. Whether you want pocket income, purpose, or a lighter workweek — this lane is built for experience, not grind culture.",
  partnership:
    "Muntie's AI Agents built GYSH for adults, kids, teens, and seniors — lifelong learners and second careers welcome. Kids Corner and Teens Side Hustles sit beside practical adult and senior pilots. Your know-how is an asset — consulting, teaching, hosting, and peer help all count.",
};

export const SENIOR_OPPORTUNITIES: SeniorOpportunity[] = [
  {
    id: "consulting",
    name: "Career & Industry Consulting",
    desc: "Share decades of expertise with freelancers, small businesses, or career-changers who need seasoned advice — by the hour or by project.",
    fit: "Strong for former managers, specialists, and tradespeople",
    schedule: "You set the hours",
    startup: "Low — LinkedIn or local networking",
  },
  {
    id: "tutoring",
    name: "Tutoring & Skills Coaching",
    desc: "Math, reading, languages, music, or professional skills — in person or video. Steady demand from families and adult learners.",
    fit: "Teachers, coaches, bilingual speakers, musicians",
    schedule: "Afternoons / evenings as you like",
    startup: "Low — flyers, Nextdoor, tutoring platforms",
  },
  {
    id: "handyman-light",
    name: "Light Handyman & Home Help",
    desc: "Small fixes, furniture assembly, declutter coaching, or seasonal yard touch-ups — skip heavy demolition; focus on helpful, paced jobs.",
    fit: "Handy homeowners comfortable with light tools",
    schedule: "Job-by-job, daytime preferred",
    startup: "Low–medium — basic tools + insurance check",
  },
  {
    id: "crafts",
    name: "Handmade Craft Sales",
    desc: "Make and sell handmade goods at markets, church fairs, Etsy, or Facebook — quilts, woodwork, jewelry, or baked goods with a local following.",
    fit: "Hobby crafters ready to price and ship",
    schedule: "Batch-friendly weekends",
    startup: "Low — supplies + a simple booth or listing",
  },
  {
    id: "pod",
    name: "Print-on-Demand (POD)",
    desc: "Design original or licensed merch and sell shirts, mugs, and other products through Etsy or Shopify — the provider prints as orders come in. Elite Launch Guide.",
    fit: "Creative makers who want online sales without warehousing inventory",
    schedule: "Design in batches; light weekly listing and customer-service time",
    startup: "Low–medium — samples, fees, and tools; not a $0 business",
  },
  {
    id: "pet-sitting",
    name: "Pet Sitting & Dog Walking",
    desc: "Care for neighbors’ pets while they travel — walks, drop-ins, or overnight stays. Warm work that stays local.",
    fit: "Animal lovers with reliable transportation",
    schedule: "Flexible; peak around holidays",
    startup: "Low — trust network + keys protocol",
  },
  {
    id: "str-cohost",
    name: "Airbnb Arbitrage Hosting",
    desc: "Operate a short-term rental without owning the property by leasing or master-leasing a unit, furnishing it, and hosting guests only when the owner, lease, building/HOA, insurance, platform, and local laws allow it.",
    fit: "Organized hosts who want hospitality income without buying real estate",
    schedule: "10 - 25 hrs/week; property-based / local + online",
    startup: "Moderate–High — furnishing + deposits; not a $0 start",
  },
  {
    id: "bookkeeping",
    name: "Bookkeeping & Admin Support",
    desc: "Help solopreneurs stay organized with invoice tracking, QuickBooks basics, expense organization, and calendar operations — not CPA or tax advice.",
    fit: "Former office admins, accountants, detail people",
    schedule: "Remote-friendly weekly rhythm",
    startup: "Low — software you may already know",
  },
  {
    id: "teaching",
    name: "Community Teaching & Workshops",
    desc: "Lead classes at libraries, senior centers, churches, or online — cooking, genealogy, photography, writing, or life skills.",
    fit: "Natural teachers and storytellers",
    schedule: "One session or a short series",
    startup: "Low — venue partnership or Zoom",
  },
  {
    id: "affiliate",
    name: "Affiliate & Helpful Content",
    desc: "Review products you actually use — gardening, travel, health gadgets — and earn commissions when readers buy through your links.",
    fit: "Writers and trusted recommenders",
    schedule: "Create once, earn on the side",
    startup: "Low — blog, newsletter, or social posts",
  },
  {
    id: "ai-peers",
    name: "AI-for-Peers Coffee Chat",
    desc: "Host a friendly coffee-chat style session teaching peers ChatGPT and everyday AI tools — office hours pace, not tech jargon.",
    fit: "Curious tech adopters who like teaching",
    schedule: "Short sessions; group or 1:1",
    startup: "Very low — free AI tools + patience",
  },
  {
    id: "rideshare",
    name: "Part-Time Rideshare",
    desc: "Drive peak hours only — airport runs, evenings, or weekends — when you want activity and tips without a fixed shift.",
    fit: "Comfortable drivers with a reliable car",
    schedule: "On when you want; off when you don’t",
    startup: "Medium — vehicle requirements + app approval",
  },
  {
    id: "notary",
    name: "Part-Time Notary",
    desc: "Get commissioned and offer mobile or by-appointment notarizations for neighbors and local professionals — precise work on your schedule.",
    fit: "Detail-oriented adults and seniors",
    schedule: "Evenings and weekends on demand",
    startup: "Medium — state commission + stamp + bond",
  },
  {
    id: "start-gardening-club",
    name: "Start a Gardening Club",
    desc: "Launch a neighborhood or community-center gardening club — community first, income optional.",
    fit: "Gardeners who enjoy hosting peers",
    schedule: "Monthly or biweekly daytime meetups",
    startup: "Low — venue + simple handouts",
  },
  {
    id: "start-book-club",
    name: "Start a Book Club",
    desc: "Host a welcoming monthly book club with discussion prompts and optional reading kits.",
    fit: "Readers who love warm conversation",
    schedule: "One afternoon or evening per month",
    startup: "Very low — library partnership",
  },
];

/** Expanded senior browse from shared M2M catalog (preserves curated ids above). */
const SENIOR_CATALOG_EXTRAS = seniorBrowseOpportunities().filter(
  (o) => !SENIOR_OPPORTUNITIES.some((c) => c.id === o.id),
);

export const SENIOR_OPPORTUNITIES_EXPANDED: SeniorOpportunity[] = [
  ...SENIOR_OPPORTUNITIES,
  ...SENIOR_CATALOG_EXTRAS,
];

export const SENIOR_GUIDE_TEASERS: SeniorGuideTeaser[] = [
  {
    id: "ai-peer-class",
    title: "Host an AI-for-peers coffee chat",
    blurb: "A friendly agenda for teaching neighbors ChatGPT basics — including scam red flags.",
    status: "preview",
    launchGuideId: "ai-peers",
  },
  {
    id: "safe-cohost",
    title: "Airbnb Arbitrage",
    blurb: "Partner on short-term rentals without owning — roles, guest messaging, and how to work with a host you trust.",
    status: "live",
    launchGuideId: "property-mgmt",
  },
  {
    id: "senior-rideshare",
    title: "Part-time rideshare on your schedule",
    blurb: "Peak hours only — airport runs, evenings, or weekends — on your terms.",
    status: "live",
    launchGuideId: "rideshare",
  },
  {
    id: "senior-handyman",
    title: "Light handyman & home help",
    blurb: "Furniture assembly, punch lists, and paced local jobs.",
    status: "live",
    launchGuideId: "handyman",
  },
  {
    id: "senior-affiliate",
    title: "Affiliate & helpful recommendations",
    blurb: "Share products you actually use and earn commissions when neighbors buy.",
    status: "live",
    launchGuideId: "affiliate",
  },
  {
    id: "senior-pod",
    title: "Print-on-Demand (POD)",
    blurb: "Design merch and sell through Etsy or Shopify without warehousing — Elite Launch Guide for a paced second chapter.",
    status: "live",
    launchGuideId: "pod",
  },
  {
    id: "start-consulting",
    title: "Start a consulting pilot in 7 days",
    blurb: "Define your niche, set a simple rate card, and land your first discovery call.",
    status: "coming_soon",
  },
  {
    id: "pricing-crafts",
    title: "Price crafts without undercharging",
    blurb: "Materials, time, and market tables so makers stop guessing at fair prices.",
    status: "coming_soon",
  },
  {
    id: "neighborhood-errands",
    title: "Launch a neighborhood errand circle",
    blurb: "Offer grocery runs, pharmacy pickups, and appointment rides with clear rates and neighbor trust.",
    status: "coming_soon",
  },
  {
    id: "start-gardening-club",
    title: "Start a Gardening Club",
    blurb: "Plant swaps, seasonal meetups, and optional workshops — community first, income optional.",
    status: "live",
    launchGuideId: "start-gardening-club",
  },
  {
    id: "start-book-club",
    title: "Start a Book Club",
    blurb: "Monthly reads, gentle discussion prompts, and library-friendly hosting for peers.",
    status: "live",
    launchGuideId: "start-book-club",
  },
  {
    id: "senior-notary",
    title: "Part-time notary on your schedule",
    blurb: "Get commissioned and offer mobile or by-appointment notarizations for neighbors and local pros.",
    status: "live",
    launchGuideId: "notary",
  },
];

/** True when this senior teaser belongs in the Free Membership guides bundle. */
export function isSeniorGuideFree(
  guide: SeniorGuideTeaser,
  _freeLaunchIds?: ReadonlySet<string> | readonly string[],
): boolean {
  void _freeLaunchIds;
  if (guide.status === "coming_soon") return false;
  return seniorGuideMinTier(guide.id, guide.launchGuideId) === "free";
}

/** Sort: Free-plan openers first → live/preview → coming soon. */
export function orderedSeniorGuides(guides: SeniorGuideTeaser[] = SENIOR_GUIDE_TEASERS): SeniorGuideTeaser[] {
  const statusRank = (g: SeniorGuideTeaser) =>
    g.status === "coming_soon" ? 2 : g.status === "live" ? 1 : 0;
  return [...guides].sort((a, b) => {
    const freeDelta = Number(isSeniorGuideFree(b)) - Number(isSeniorGuideFree(a));
    if (freeDelta !== 0) return freeDelta;
    return statusRank(a) - statusRank(b);
  });
}

/** Senior Get Your Side Hustle answers — lifestyle, ranked skills/goals, availability. */
export type SeniorMatchAnswers = {
  lifestyle: string;
  availability: string;
  /** Ordered by priority: index 0 = rank 1 */
  skills: string[];
  /** Ordered by priority: index 0 = rank 1 */
  goals: string[];
};

/** How well each senior opportunity aligns with Get Your Side Hustle tags. */
const SENIOR_MATCH_PROFILES: Record<
  string,
  {
    skills: Partial<Record<string, number>>;
    goals: Partial<Record<string, number>>;
    lifestyles: string[];
    availability: string[];
  }
> = {
  consulting: {
    skills: { teaching: 0.85, admin: 0.4, writing: 0.35 },
    goals: { expertise: 1, income: 0.7, purpose: 0.55, flexible: 0.5 },
    lifestyles: ["gentle", "balanced"],
    availability: ["light", "steady", "flexible"],
  },
  tutoring: {
    skills: { teaching: 1, writing: 0.3 },
    goals: { purpose: 1, income: 0.65, social: 0.45, expertise: 0.7 },
    lifestyles: ["gentle", "balanced"],
    availability: ["light", "steady"],
  },
  "handyman-light": {
    skills: { hands_on: 1 },
    goals: { income: 0.75, flexible: 0.7, social: 0.4 },
    lifestyles: ["balanced", "active"],
    availability: ["light", "flexible", "steady"],
  },
  crafts: {
    skills: { creative: 1, writing: 0.25 },
    goals: { income: 0.6, purpose: 0.45, flexible: 0.8, learn: 0.4 },
    lifestyles: ["gentle", "balanced"],
    availability: ["light", "flexible", "steady"],
  },
  pod: {
    skills: { creative: 1, tech: 0.7, writing: 0.45 },
    goals: { income: 0.9, flexible: 1, learn: 0.7, purpose: 0.35 },
    lifestyles: ["gentle", "balanced"],
    availability: ["light", "flexible"],
  },
  "pet-sitting": {
    skills: { hands_on: 0.7, hospitality: 0.55 },
    goals: { income: 0.7, social: 0.55, flexible: 0.85, purpose: 0.4 },
    lifestyles: ["balanced", "active"],
    availability: ["flexible", "light", "steady"],
  },
  "str-cohost": {
    skills: { hospitality: 1, admin: 0.65, teaching: 0.25 },
    goals: { income: 0.8, flexible: 0.55, expertise: 0.5 },
    lifestyles: ["balanced", "active"],
    availability: ["steady", "flexible"],
  },
  bookkeeping: {
    skills: { admin: 1, tech: 0.35 },
    goals: { income: 0.75, flexible: 0.7, expertise: 0.65 },
    lifestyles: ["gentle", "balanced"],
    availability: ["light", "steady"],
  },
  teaching: {
    skills: { teaching: 1, creative: 0.4, writing: 0.35 },
    goals: { purpose: 1, social: 0.75, expertise: 0.8, learn: 0.45 },
    lifestyles: ["balanced", "active", "gentle"],
    availability: ["light", "flexible", "steady"],
  },
  affiliate: {
    skills: { writing: 1, tech: 0.4, creative: 0.35 },
    goals: { income: 0.7, flexible: 0.9, learn: 0.5 },
    lifestyles: ["gentle", "balanced"],
    availability: ["light", "flexible"],
  },
  "ai-peers": {
    skills: { tech: 1, teaching: 0.85 },
    goals: { purpose: 0.9, learn: 1, social: 0.7, expertise: 0.55 },
    lifestyles: ["gentle", "balanced"],
    availability: ["light", "flexible"],
  },
  rideshare: {
    skills: { hands_on: 0.45, hospitality: 0.4 },
    goals: { income: 0.85, flexible: 0.9, social: 0.5 },
    lifestyles: ["active", "balanced"],
    availability: ["flexible", "light", "steady"],
  },
};

const SKILL_WEIGHTS = [30, 15];
const GOAL_WEIGHTS = [28, 16, 8];
const LIFESTYLE_WEIGHT = 14;
const AVAILABILITY_WEIGHT = 12;

/** Heuristic senior profile from catalog tags when no hand-tuned entry exists. */
export function seniorProfileFromCatalog(opportunityId: string): {
  skills: Partial<Record<string, number>>;
  goals: Partial<Record<string, number>>;
  lifestyles: string[];
  availability: string[];
} | null {
  const h = hustleById(opportunityId);
  if (!h) return null;
  const skills: Partial<Record<string, number>> = {};
  const goals: Partial<Record<string, number>> = {};
  for (const t of h.matchTags ?? []) {
    if (t === "creative") skills.creative = 1;
    if (t === "tech" || t === "ai") skills.tech = Math.max(skills.tech ?? 0, 0.85);
    if (t === "physical" || t === "outdoor") skills.hands_on = 1;
    if (t === "animals") skills.hands_on = Math.max(skills.hands_on ?? 0, 0.7);
    if (t === "people" || t === "helping") skills.teaching = Math.max(skills.teaching ?? 0, 0.65);
    if (t === "operations" || t === "admin") skills.admin = Math.max(skills.admin ?? 0, 0.7);
    if (t === "hosting" || t === "hospitality") skills.hospitality = 1;
    if (t === "local") goals.flexible = Math.max(goals.flexible ?? 0, 0.75);
    if (t === "indoor") goals.purpose = Math.max(goals.purpose ?? 0, 0.45);
  }
  if (h.zeroStart) goals.income = Math.max(goals.income ?? 0, 0.55);
  if (!Object.keys(skills).length) skills.admin = 0.45;
  if (!Object.keys(goals).length) {
    goals.income = 0.55;
    goals.flexible = 0.6;
  }
  return {
    skills,
    goals,
    lifestyles: ["gentle", "balanced", "active"],
    availability: ["light", "steady", "flexible"],
  };
}

export function resolveSeniorMatchProfile(opportunityId: string) {
  return SENIOR_MATCH_PROFILES[opportunityId] ?? seniorProfileFromCatalog(opportunityId);
}

/** Four Senior Match Wizard picks that rank Print-on-Demand (POD) first (Elite). */
export const SENIOR_POD_TOP_MATCH_ANSWERS: SeniorMatchAnswers = {
  lifestyle: "gentle",
  skills: ["creative", "tech"],
  goals: ["income", "flexible", "learn"],
  availability: "light",
};

export function scoreSeniorMatch(opportunityId: string, answers: SeniorMatchAnswers): number {
  const profile = resolveSeniorMatchProfile(opportunityId);
  if (!profile) return 0;

  let score = 0;

  answers.skills.forEach((skill, i) => {
    const fit = profile.skills[skill] ?? 0;
    score += fit * (SKILL_WEIGHTS[i] ?? 0);
  });

  answers.goals.slice(0, 3).forEach((goal, i) => {
    const fit = profile.goals[goal] ?? 0;
    score += fit * (GOAL_WEIGHTS[i] ?? 0);
  });

  if (profile.lifestyles.includes(answers.lifestyle)) score += LIFESTYLE_WEIGHT;
  if (profile.availability.includes(answers.availability)) score += AVAILABILITY_WEIGHT;

  return Math.round(score * 10) / 10;
}

const SENIOR_TEAM_KEY = "gysh_senior_side_hustle_team";

export function readSeniorTeamInterest(): boolean {
  try {
    return localStorage.getItem(SENIOR_TEAM_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSeniorTeamInterest(): void {
  try {
    localStorage.setItem(SENIOR_TEAM_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}
