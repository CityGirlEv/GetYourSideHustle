/**
 * Yard & Garden Helper (`yard-help`, Guide #020).
 * Light outdoor chores — not dangerous landscaping.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const YARD_HELP_REALITY_CHECK = {
  title: "THIS IS LIGHT YARD HELP, NOT DANGEROUS LANDSCAPING",
  body: [
    "Start with low-risk tasks you can perform safely.",
    "",
    "Good beginner jobs:",
    "- Rake leaves",
    "- Water flowers",
    "- Pull weeds",
    "- Sweep walkways",
    "- Pick up small sticks/debris",
    "- Light garden cleanup",
    "- Shovel manageable snow where safe",
    "",
    "Do NOT include chainsaws, tree climbing, roof/gutter work, pesticides/herbicides, dangerous power tools, heavy equipment, electrical work, large branches, or unsafe snow/ice conditions.",
    "",
    "For minors, a guardian approves jobs, customers, travel, tools, and work conditions.",
    "",
    "Tagline: Fresh Air. Helpful Work. Pocket Money.",
  ].join("\n"),
};

export const YARD_HELP_NOTES_WORKSHEET = `MY YARD & GARDEN HELPER PLAN

Services Offered: __________

I Do Not Do: __________

Service Area: __________

Small Price: $____
Standard Price: $____
Larger Price: $____
Add-Ons: __________

Marketing Channels:
1. ________
2. ________
3. ________

CLIENT JOB

Client: __________
Address / Area: __________
Tasks: __________
Plants to Protect: __________
Tools: __________
Bags / Disposal: __________
Water Source: __________
Pets / Gates: __________
Hazards: __________
Weather: __________
Price: $____

JOB LOG
Date | Tasks | Fee | Expenses | Time | Profit | Rebook
__________
__________
__________

SEASONAL OPPORTUNITIES
Spring cleanup: __________
Summer watering / weeding: __________
Fall leaves: __________
Safe winter snow: __________

GYSH PRO TIP
Don't automatically charge the same price for every yard.
A $15 quick rake is not the same job as two hours of weeds, leaves, and cleanup.
DEFINE THE JOB → AGREE ON PRICE → DO THE WORK → TRACK TIME → LEARN WHICH JOBS PAY BEST.

BEGINNER CHALLENGE
Create 3 sample yard packages at $15, $22, and $30.
Make a flyer, safety checklist, before-job walkthrough sheet, job tracker, and a one-week plan to contact 8 potential customers/referral sources.`;

export const YARD_HELP_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Earn money helping neighbors with light outdoor chores such as raking leaves, watering flowers, pulling weeds, picking up small yard debris, and shoveling light snow where appropriate. Tagline: Fresh Air. Helpful Work. Pocket Money. Category: Outdoor / Yard Services. Best for Juniors/Teens with guardian-approved jobs, Adults, Seniors / Retirees. Beginner · Very low startup · Flexible / seasonal · Client yard / garden · Per yard / per job / recurring · Free Guide · 3 - 10 hrs/week · Displayed pricing: $15 – $30 / yard.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Appropriate clothing / closed-toe shoes · Gloves · Water · Basic yard tools · Sun / weather awareness · Phone · Transportation if needed · Client instructions.",
  },
  {
    id: "before-job",
    label: "Before the job, confirm",
    detail:
      "Tasks · Yard / area · Price · Expected time · Tools · Disposal / bagging · Plants to protect · Water source · Pets / gates · Weather · Hazards · Client contact.",
  },
  {
    id: "stop-unsafe",
    label: "Stop and tell the client / guardian if you find",
    detail:
      "Broken glass · Needles · Animal hazards · Exposed wiring · Chemicals · Dangerous insects · Unstable branches · Severe ice · Other unsafe conditions.",
  },
  {
    id: "minors",
    label: "For minors",
    detail:
      "Guardian-approved jobs, customers, travel, tools, and work conditions. Use guardian-approved contact and payment arrangements.",
  },
];

export const YARD_HELP_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Maps", url: "https://maps.google.com/", note: "Service area and routes" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Job schedule" },
  { label: "Weather", url: "https://weather.gov/", note: "Outdoor scheduling" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Jobs, expenses, profit" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Offer, flyer, job checklist" },
  { label: "Nextdoor", url: "https://nextdoor.com/", note: "Neighborhood posts where permitted" },
  { label: "Facebook", url: "https://www.facebook.com/", note: "Local groups where permitted" },
];

export const YARD_HELP_SUPPLIES = {
  starterKitTotal: "About $10–40 if you buy gloves and bags (less if the client supplies tools)",
  items: [
    { id: "gloves", name: "Gloves", qty: "1 pair", estCost: "$5–12", notes: "Essential" },
    { id: "rake", name: "Rake", qty: "1", estCost: "$0–22", notes: "Essential — borrow or client-supplied first" },
    { id: "broom", name: "Broom", qty: "1", estCost: "$0–15", notes: "Essential" },
    { id: "weeder", name: "Small hand weeder / trowel", qty: "1", estCost: "$4–12", notes: "Essential" },
    { id: "water", name: "Watering can / hose with permission", qty: "1", estCost: "$0–12", notes: "Essential — client often supplies hose" },
    { id: "bags", name: "Yard bags", qty: "1 pack", estCost: "$5–12", notes: "Essential" },
    { id: "dustpan", name: "Dustpan", qty: "1", estCost: "$3–8", notes: "Essential" },
    { id: "sunscreen", name: "Sunscreen / hat", qty: "1", estCost: "$5–12", notes: "Essential" },
    { id: "bottle", name: "Water bottle", qty: "1", estCost: "$0–12", notes: "Essential" },
    { id: "phone", name: "Phone", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "shovel", name: "Snow shovel where appropriate", qty: "1", estCost: "$15–30", notes: "Useful — seasonal", optional: true },
  ],
};

export const YARD_HELP_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "yh_maps",
    name: "Maps",
    freePlanAvailable: true,
    costNote: "Service area and nearby-job routes",
    url: "https://maps.google.com/",
  },
  {
    id: "yh_calendar",
    name: "Calendar",
    freePlanAvailable: true,
    costNote: "Job dates and seasonal repeats",
    url: "https://calendar.google.com/",
  },
  {
    id: "yh_weather",
    name: "Weather",
    freePlanAvailable: true,
    costNote: "Check heat, rain, lightning, ice, and snow before outdoor work",
    url: "https://weather.gov/",
  },
  {
    id: "yh_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Walkthrough notes, plants to protect, hazards",
  },
  {
    id: "yh_calc",
    name: "Calculator",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Quote add-ons and profit per hour",
  },
  {
    id: "yh_sheets",
    name: "Sheets for jobs / revenue",
    freePlanAvailable: true,
    costNote: "Fee, supplies, travel, time, profit",
    url: "https://sheets.google.com/",
  },
  {
    id: "yh_camera",
    name: "Phone camera",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Approved before / after photos only",
  },
  {
    id: "yh_pay",
    name: "Payment method appropriate to seller / guardian arrangement",
    freePlanAvailable: true,
    costNote: "Cash, approved app, or guardian-handled payment",
    optional: true,
  },
  {
    id: "yh_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Gloves + Rake/Broom + Yard Bags + Water + Job Checklist",
  },
];

export const YARD_HELP_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "YARD & GARDEN HELPER PRICING. Keep displayed: $15 – $30 / yard.",
    "",
    "Define what “one yard” includes. Do not promise unlimited work for $15–$30.",
    "Large professional landscaping jobs should be quoted or referred separately.",
  ].join("\n"),
  raiseTip:
    "A $15 quick rake is not the same job as two hours of weeds, leaves, and cleanup. Quote by tasks, area, and time. Displayed range: $15 – $30 / yard. Examples only — not income guarantees.",
  items: [
    { id: "small", label: "Small / Quick Yard Help", price: "$15", notes: "Short, beginner-safe tidy-up" },
    { id: "standard", label: "Standard Light Yard Job", price: "$20–$25", notes: "Typical one-yard light chores" },
    { id: "larger", label: "Larger / Heavier Beginner-Safe Job", price: "$25–$30+", notes: "More area or extra time still within safe scope" },
    { id: "bags", label: "Add-on: Extra bags", price: "Agree in advance" },
    { id: "area", label: "Add-on: Second area", price: "Agree in advance" },
    { id: "time", label: "Add-on: Extra time", price: "Agree in advance" },
    { id: "weekly", label: "Add-on: Repeat weekly watering / weeding", price: "Recurring quote" },
    { id: "seasonal", label: "Add-on: Seasonal cleanup", price: "Quote by workload" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only — never ✓. */
export const YARD_HELP_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your Safe Yard Services",
    desc: [
      "Check only tasks you can safely do.",
      "",
      "☐ Raking",
      "☐ Watering",
      "☐ Weeding",
      "☐ Sweeping",
      "☐ Light debris pickup",
      "☐ Simple garden cleanup",
      "☐ Manageable snow shoveling",
      "",
      "Write an “I DO NOT DO” list for risky tasks.",
      "",
      "I WILL DO: __________",
      "I DO NOT DO: __________",
      "",
      "Do not include chainsaws, tree climbing, roof/gutter work, pesticides/herbicides, dangerous power tools, heavy equipment, electrical work, large branches, or unsafe snow/ice.",
    ].join("\n"),
  },
  {
    title: "Set Your $15–$30 Yard Package",
    desc: [
      "Define small, standard, and larger beginner-safe jobs.",
      "",
      "Small / Quick: $15 — includes: __________",
      "Standard Light Yard Job: $20–$25 — includes: __________",
      "Larger beginner-safe: $25–$30+ — includes: __________",
      "",
      "State included tasks, approximate area/time, bagging/disposal expectations, and add-ons.",
      "",
      "What “one yard” includes: __________",
      "Add-ons: extra bags · second area · extra time · repeat weekly watering/weeding · seasonal cleanup",
      "",
      "Do not promise unlimited work for $15–$30. See Suggested Pricing — displayed $15 – $30 / yard.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way people hear about you.",
      "",
      "Pick only 2 or 3 this month.",
      "",
      "Possible channels:",
      "☐ Neighbors / family",
      "☐ Referrals",
      "☐ Neighborhood groups",
      "☐ Nextdoor",
      "☐ Facebook local groups",
      "☐ Community / church boards",
      "☐ Senior neighbors",
      "☐ Local small businesses needing light exterior tidying where appropriate",
      "",
      "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have).",
      "",
      "Write ONE measurable goal for each channel.",
      "",
      "Examples:",
      "- Tell 8 trusted neighbors",
      "- Post in 2 approved community groups",
      "- Ask 5 satisfied customers for referrals",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple flyer/post.",
      "",
      "Sample:",
      "",
      "NEED A LITTLE HELP IN THE YARD?",
      "",
      "- Raking",
      "- Watering Flowers",
      "- Pulling Weeds",
      "- Sweeping",
      "- Light Cleanup",
      "- Seasonal Help",
      "",
      "Yard jobs start at $15.",
      "Service Area: __________",
      "Contact: __________",
      "",
      "For minors, use guardian-approved contact arrangements.",
      "Never publish home/school schedule or unnecessary personal information.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, use ONLY the 2 or 3 channels selected.",
      "",
      "Tell or contact 8–12 appropriate people / referral sources.",
      "Share the flyer in approved places.",
      "Ask satisfied customers for referrals.",
      "",
      "Sample:",
      "“Hi! I help with light yard work — raking, watering flowers, pulling weeds, sweeping, and seasonal cleanup. Yard jobs start at $15. Let me know if you need a little help in the yard.”",
      "",
      "Track: Date | Prospect | Job Needed | Quote | Result | Follow-Up",
      "",
      "Do not spam. Do not promise dangerous landscaping.",
    ].join("\n"),
  },
  {
    title: "Walk the Yard Before Starting",
    desc: [
      "Have the client show the exact work area before you start.",
      "",
      "Confirm:",
      "- Plants to protect",
      "- Weeds vs wanted plants",
      "- Bag / disposal location",
      "- Hose / water source",
      "- Gates / pets",
      "- Hazards",
      "",
      "Agree on the job and price BEFORE starting.",
      "",
      "Do not pull a plant unless the client clearly identifies it as a weed or unwanted plant.",
    ].join("\n"),
  },
  {
    title: "Prep for Weather & Safety",
    desc: [
      "Check conditions before you go.",
      "",
      "- Wear suitable clothing, gloves, and closed-toe shoes",
      "- Hydrate",
      "- Use sun protection",
      "- Avoid lightning, extreme heat, unsafe cold, or ice",
      "- Move only manageable items",
      "- Use proper lifting and take breaks",
      "",
      "Do not use unfamiliar power equipment simply because a client offers it.",
      "",
      "Stop and tell the client / guardian if you find broken glass, needles, animal hazards, exposed wiring, chemicals, dangerous insects, unstable branches, severe ice, or other unsafe conditions.",
    ].join("\n"),
  },
  {
    title: "Complete the Job in a Smart Order",
    desc: [
      "Example order:",
      "1. Clear obvious light debris",
      "2. Rake / sweep",
      "3. Pull approved weeds",
      "4. Water specified plants",
      "5. Bag / stack debris as agreed",
      "6. Final sweep",
      "",
      "Do not remove plants unless the client clearly identifies them as weeds / unwanted.",
      "Do not apply pesticides, herbicides, or other chemicals.",
    ].join("\n"),
  },
  {
    title: "Do a Final Walkthrough",
    desc: [
      "Before you leave, check:",
      "- Agreed tasks",
      "- Paths / gates",
      "- Tools",
      "- Bags",
      "- Hose / faucet",
      "- Any missed areas",
      "",
      "Ask the client to review before adding extra work.",
      "Take before / after photos only with permission.",
    ].join("\n"),
  },
  {
    title: "Get Paid & Track the Real Profit",
    desc: [
      "Record:",
      "Job fee · Supplies · Transportation · Disposal cost if any · Total time including travel",
      "",
      "Profit = revenue − expenses.",
      "Effective profit/hour = profit ÷ total time.",
      "",
      "For minors, use guardian-approved payment methods.",
      "",
      "A $15 quick rake is not the same job as two hours of weeds, leaves, and cleanup. Track time so you learn which jobs pay best.",
    ].join("\n"),
  },
  {
    title: "Ask for Repeat Seasonal Work",
    desc: [
      "Offer a simple recurring schedule:",
      "- Weekly / biweekly watering or weeding",
      "- Fall leaf cleanup",
      "- Seasonal garden cleanup",
      "- Safe winter snow help where appropriate",
      "",
      "Ask for a referral or rebooking.",
      "Group nearby jobs into one route.",
      "",
      "DEFINE THE JOB → AGREE ON PRICE → DO THE WORK → TRACK TIME → LEARN WHICH JOBS PAY BEST.",
    ].join("\n"),
  },
];

export function yardHelpToolsDisclaimer(): string {
  return "Beginner stack: Gloves + Rake/Broom + Yard Bags + Water + Job Checklist. Client may supply tools and materials. Do not use unfamiliar power equipment simply because a client offers it. This is light yard help, not dangerous landscaping. Minors: guardian-approved jobs, customers, travel, tools, and work conditions.";
}

/** Weekly yard-help profit math. Job hours and travel/admin hours are weekly totals, not per yard. */
export function computeYardHelpProfit(input: {
  averageYardFee: number;
  yardsPerWeek: number;
  addOnRevenue?: number;
  suppliesBags?: number;
  fuelTravel?: number;
  disposal?: number;
  advertising?: number;
  otherExpenses?: number;
  jobHours?: number;
  travelAdminHours?: number;
}): {
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  weeklyHours: number;
  effectiveProfitPerHour: number | null;
} {
  const fee = Math.max(0, Number(input.averageYardFee) || 0);
  const yards = Math.max(0, Number(input.yardsPerWeek) || 0);
  const addOns = Math.max(0, Number(input.addOnRevenue) || 0);
  const weeklyRevenue = fee * yards + addOns;
  const weeklyExpenses =
    Math.max(0, Number(input.suppliesBags) || 0) +
    Math.max(0, Number(input.fuelTravel) || 0) +
    Math.max(0, Number(input.disposal) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const weeklyHours =
    Math.max(0, Number(input.jobHours) || 0) + Math.max(0, Number(input.travelAdminHours) || 0);
  return {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    weeklyHours,
    effectiveProfitPerHour: weeklyHours > 0 ? weeklyProfit / weeklyHours : null,
  };
}
