/** Senior Side Hustles — opportunities & guide teasers for 55+ / flexible schedules. */

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
  status: "coming_soon" | "preview";
};

export const SENIOR_AUDIENCE_LABEL = "55+ · Retirees & flexible schedules";

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
    name: "Craft & Maker Sales",
    desc: "Sell handmade goods at markets, church fairs, Etsy, or Facebook — quilts, woodwork, jewelry, baked goods with a local following.",
    fit: "Hobby crafters ready to price and ship",
    schedule: "Batch-friendly weekends",
    startup: "Low — supplies + a simple booth or listing",
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
    name: "Airbnb / STR Co-Hosting",
    desc: "Help hosts with guest messaging, turnover checklists, or local hospitality — without owning the property yourself.",
    fit: "Organized hosts or hospitality veterans",
    schedule: "Part-time blocks; can share duties",
    startup: "Low if partnering with an existing host",
  },
  {
    id: "bookkeeping",
    name: "Bookkeeping & Admin Support",
    desc: "Invoice tracking, QuickBooks basics, or calendar ops for solopreneurs who outgrow spreadsheets.",
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
    name: "AI Prompting Help for Peers",
    desc: "Help other seniors get comfortable with ChatGPT and similar tools — email drafts, photo organizing, research, and scam spotting.",
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
];

export const SENIOR_GUIDE_TEASERS: SeniorGuideTeaser[] = [
  {
    id: "start-consulting",
    title: "Start a consulting pilot in 7 days",
    blurb: "Define your niche, set a simple rate card, and land your first discovery call.",
    status: "coming_soon",
  },
  {
    id: "safe-cohost",
    title: "Co-host a short-term rental without owning",
    blurb: "Roles, guest messaging templates, and how to partner with a host you trust.",
    status: "coming_soon",
  },
  {
    id: "ai-peer-class",
    title: "Host an AI-for-peers coffee chat",
    blurb: "A friendly agenda for teaching neighbors ChatGPT basics — including scam red flags.",
    status: "preview",
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
];

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

export function scoreSeniorMatch(opportunityId: string, answers: SeniorMatchAnswers): number {
  const profile = SENIOR_MATCH_PROFILES[opportunityId];
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
