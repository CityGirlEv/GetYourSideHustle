/**
 * Neighborhood Helper (`neighborhood-helper`, Guide #015).
 * Unique Unique Free. 2 - 8 hrs/week. Displayed $10 – $40 / job (examples).
 * Plain data only — no imports from guide-tools.
 */

export const NEIGHBORHOOD_HELPER_REALITY_CHECK = {
  title: "SELL A SPECIFIC TASK, NOT “ANYTHING YOU NEED”",
  body: [
    "Offer a short, clearly defined menu of small chores, notes, and check-ins for nearby households — such as carrying in groceries, returning bins, sweeping a porch, watering one planter, or completing another safe task the customer approves in advance.",
    "",
    "A Neighborhood Helper is not an unlimited handyman, caregiver, driver, mover, or emergency service.",
    "",
    "Before every visit confirm: exact task; where it will happen; who will be present; start time; expected duration; supplies; physical limits; price; payment; permission for any completion photo.",
    "",
    "For anyone under 18, a parent/guardian should approve every customer, task, location, schedule, transportation plan, public post, payment method, and key/access arrangement.",
    "",
    "Do not offer roof, ladder, gutter, tree, electrical, plumbing, gas, pest, mold, biohazard, or structural work. Do not do heavy lifting beyond your safe limit. Do not administer medication. Do not provide childcare, elder care, transportation, banking, or financial errands unless separately qualified. Do not enter an unfamiliar home alone. Do not handle weapons, unknown chemicals, controlled substances, alcohol, or tobacco. Do not work in unsafe weather, traffic, or aggressive-animal conditions.",
    "",
    "Tagline: Small Tasks. Clear Boundaries. Trusted Neighbor Help.",
  ].join("\n"),
};

export const NEIGHBORHOOD_HELPER_NOTES_WORKSHEET = `NEIGHBORHOOD HELPER NOTES

BUSINESS SETUP
Service Area: ________
Daylight Hours: ________
Minimum Visit Price: $____
Maximum Task Time: ____
Maximum Lift: ____
Adult/Parent Contact: ________

TASK MENU
Task 1 / Price: ________
Task 2 / Price: ________
Task 3 / Price: ________
Task 4 / Price: ________
Task 5 / Price: ________

CUSTOMER
Name: ________
Private Address: ________
Contact: ________
Pets: ________
Who Will Be Present: ________
Access Instructions Stored Safely: ☐

JOB
Task: ________
Included: ________
Excluded: ________
Date/Time: ________
Quoted Price: $____
Actual Minutes: ____
Expenses: $____
Profit: $____
Completion Sent: ☐

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Contacts: ____
Quotes: ____
Bookings: ____

FOLLOW-UP
Review Requested: ☐
Referral Requested: ☐
Recurring Visit Offered: ☐
Next Date: ________

GYSH PRO TIP
Trust grows when every promise is small, specific, and finished well.
CLEAR TASK → CONFIRMED PRICE → SAFE VISIT → COMPLETION UPDATE → REBOOK → ROUTE.

FREE GUIDE CHALLENGE
Book your first 3 safe neighborhood tasks:
1. Define 5 tasks.
2. Define hard boundaries.
3. Set starter prices.
4. Choose a small service area.
5. Make one flyer/message.
6. Contact 10 trusted households.
7. Confirm every task in writing.
8. Track actual time and costs.
9. Ask one happy customer about recurring service.
10. Calculate real profit.`;

export const NEIGHBORHOOD_HELPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Offer a short, clearly defined menu of small chores, notes, and check-ins for nearby households. Tagline: Small Tasks. Clear Boundaries. Trusted Neighbor Help. Category: Neighborhood & Local Services. Best for Kids, Teens, Adults, and Seniors who are reliable and comfortable doing small local tasks. Beginner · Very Low startup · Flexible / One-Time or Recurring · Nearby Homes / Porches / Yards · Per Task / Visit Bundles / Recurring Routes · 2 - 8 hrs/week · Free Guide. Displayed $10 – $40 / job is examples only.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable phone or parent-approved contact method · Parent/guardian involvement if under 18 · Small, safe service area · Transportation/walking plan · Written task menu · Simple prices · Calendar · Weather plan · Payment method · Income/expense log · Emergency contact. Choose only tasks you can complete safely and legally.",
  },
  {
    id: "starter-tasks",
    label: "Good starter tasks",
    detail:
      "Carry bagged groceries from a vehicle to the door · Return empty trash/recycling bins · Sweep a small porch or walkway · Water a few planters · Bring delivered mail from a known location to the door · Put a package in a customer-designated safe spot while the customer authorizes the visit · Feed a familiar pet once with written instructions and proper supervision · Leave a note/check-in for a known neighbor.",
  },
  {
    id: "do-not-offer",
    label: "Do not offer",
    detail:
      "Roof, ladder, gutter, tree, electrical, plumbing, gas, pest, mold, biohazard, or structural work · Heavy lifting beyond your safe limit · Medication administration · Childcare, elder care, transportation, banking, or financial errands unless separately qualified · Entering an unfamiliar home alone · Handling weapons, unknown chemicals, controlled substances, alcohol, or tobacco · Work in unsafe weather, traffic, or aggressive-animal conditions. Rules for licenses, taxes, youth work, soliciting, insurance, keys, and local services vary — check city/county/state requirements with an adult or qualified professional before launching.",
  },
];

export const NEIGHBORHOOD_HELPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Forms", url: "https://forms.google.com/", note: "Task request / intake" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Jobs, contacts, income, and expenses" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Menu, boundaries, and confirmation template" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Visits and recurring routes" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Route and travel-time planning" },
  { label: "IRS recordkeeping", url: "https://www.irs.gov/businesses/small-businesses-self-employed/recordkeeping", note: "Keep records that clearly show income and expenses" },
];

export const NEIGHBORHOOD_HELPER_SUPPLIES = {
  starterKitTotal:
    "About $10–25 for gloves, sanitizer, a tote, and a checklist — skip specialty gear until a paid task needs it",
  items: [
    { id: "phone", name: "Phone", qty: "1 (usually owned)", estCost: "$0", notes: "Essential — parent-approved contact method if under 18" },
    { id: "shoes", name: "Closed-toe shoes", qty: "1 pair", estCost: "$0", notes: "Essential" },
    { id: "gloves", name: "Work gloves", qty: "1 pair", estCost: "$4–8", notes: "Core" },
    { id: "sanitizer", name: "Hand sanitizer", qty: "1 bottle", estCost: "$2–5", notes: "Core" },
    { id: "tote", name: "Reusable tote or small caddy", qty: "1", estCost: "$0–8", notes: "Core" },
    { id: "checklist", name: "Simple task checklist", qty: "1", estCost: "$0–5", notes: "Core" },
    { id: "clothes", name: "Weather-appropriate clothing", qty: "1 set", estCost: "$0", notes: "Core" },
    { id: "water", name: "Water bottle", qty: "1", estCost: "$0–5", notes: "Core" },
    { id: "broom", name: "Small broom and dustpan", qty: "1", estCost: "$5–12", notes: "Task-specific", optional: true },
    { id: "bags", name: "Trash bags", qty: "1 pack", estCost: "$3–8", notes: "Task-specific", optional: true },
    { id: "pitcher", name: "Watering can or pitcher", qty: "1", estCost: "$0–10", notes: "Task-specific", optional: true },
    { id: "vest", name: "Reflective vest for low-light visibility", qty: "1", estCost: "$5–12", notes: "Where appropriate", optional: true },
    { id: "grocery-bags", name: "Reusable grocery bags", qty: "2–4", estCost: "$5–12", notes: "If the customer requests them", optional: true },
  ],
};

export const NEIGHBORHOOD_HELPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "calendar", name: "Calendar", freePlanAvailable: true, costNote: "Visits and recurring routes", url: "https://calendar.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Task request / intake", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Jobs, contacts, income, and expenses", url: "https://sheets.google.com/" },
  { id: "docs", name: "Google Docs", freePlanAvailable: true, costNote: "Menu, boundaries, and confirmation template — sign in with Google, or use an account you already have", url: "https://docs.google.com/" },
  { id: "maps", name: "Maps", freePlanAvailable: true, planLabelApplicable: false, costNote: "Route and travel-time planning", url: "https://maps.google.com/" },
  { id: "weather", name: "Weather app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Outdoor-task decisions" },
  { id: "camera", name: "Phone camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Completion photo only with customer permission" },
  { id: "pay", name: "Payment app / processor", freePlanAvailable: true, costNote: "Parent-approved where a minor is involved", optional: true },
  { id: "calc", name: "Calculator", freePlanAvailable: true, planLabelApplicable: false, costNote: "Quotes and profit" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Task Menu + Intake Form + Calendar + Route Map + Job/Profit Tracker" },
];

export const NEIGHBORHOOD_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $10 – $40 / job (examples, not guarantees).",
    "Use local demand, time, travel, difficulty, supplies, and risk to adjust prices.",
    "",
    "STARTER TASK EXAMPLES",
    "Grocery Carry-In: $10 – $15",
    "Bin Return or Curb-to-Home Visit: $8 – $15",
    "Small Porch Sweep/Tidy: $15 – $25",
    "Water 1–5 Planters: $10 – $20",
    "Quick Mail/Package Check-In: $10 – $20",
    "Two Small Tasks in One Visit: $20 – $35",
    "30-Minute Helper Block: $15 – $30",
    "",
    "RECURRING EXAMPLES",
    "Weekly Bin Return: $25 – $50/month",
    "Weekly Planter Check: $35 – $80/month depending on number of plants and travel",
    "Two-Visit Weekly Neighbor Bundle: quote from the actual task list and visit time",
    "",
    "COMMON ADD-ONS — EXAMPLES",
    "Extra 15 Minutes: $5 – $12",
    "Extra Planter Group: $5 – $10",
    "Same-Day/Rush Request: optional $5 – $15 premium",
    "Supplies Purchased for Customer: reimbursement with receipt plus any agreed shopping fee",
    "",
    "PRICING FORMULA: Estimated Work Time × Target Hourly Value + Travel Time/Distance + Supplies + Difficulty or Rush Premium = Quote.",
    "Use a minimum visit charge so a ten-minute task still covers coordination and travel.",
    "",
    "MONTHLY EXAMPLES: 4 jobs/week × $15 × 4.33 = $259.80 gross/month · 8 jobs/week × $22 × 4.33 = $762.08 gross/month.",
    "Gross revenue is NOT profit. Do not guarantee earnings.",
  ].join("\n"),
  raiseTip:
    "Raise prices after a few smooth visits. Displayed $10 – $40 / job is examples only — not income guarantees.",
  items: [
    { id: "grocery", label: "Grocery carry-in", price: "$10 – $15", notes: "Examples only" },
    { id: "bins", label: "Bin return or curb-to-home visit", price: "$8 – $15", notes: "Examples only" },
    { id: "porch", label: "Small porch sweep/tidy", price: "$15 – $25", notes: "Examples only" },
    { id: "planters", label: "Water 1–5 planters", price: "$10 – $20", notes: "Examples only" },
    { id: "mail", label: "Quick mail/package check-in", price: "$10 – $20", notes: "Examples only" },
    { id: "two", label: "Two small tasks in one visit", price: "$20 – $35", notes: "Examples only" },
    { id: "block", label: "30-minute helper block", price: "$15 – $30", notes: "Examples only" },
    { id: "weekly-bins", label: "Weekly bin return", price: "$25 – $50/month", notes: "Recurring example" },
  ],
};

export const NEIGHBORHOOD_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Safe Task Menu",
    desc: [
      "Choose 5–8 small tasks you can finish in about 15–45 minutes.",
      "For each task write: what is included; what is excluded; time limit; supplies; starting price; weather limits; whether an adult must be present.",
      "Do not advertise “anything you need.”",
    ].join("\n"),
  },
  {
    title: "Set Your Service Area & Safety Rules",
    desc: [
      "Draw a small area you can reach safely and reliably.",
      "Decide: daylight-only hours; maximum walking/driving distance; bad-weather cancellation rule; no-entry or adult-present rule; maximum safe lifting weight; animal policy; key/access policy; emergency contact plan.",
      "Minors should start with households their family already knows.",
    ].join("\n"),
  },
  {
    title: "Build Your Pricing & Quote System",
    desc: [
      "Use the Suggested Pricing tab to create a one-page menu.",
      "Capture: task; estimated minutes; travel; supplies; risk/difficulty; minimum visit charge; final price.",
      "Send: “I can complete [task] on [date/time] for $__. This includes __ and does not include __. Please reply YES to confirm.”",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3: family/friend referrals; known neighbors; parent-managed neighborhood group; community or faith bulletin board with permission; senior/community center referral contact; HOA or apartment board where permitted.",
      "Set measurable goals such as: ask 10 known households; post one parent-approved flyer; request 3 referral introductions.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple flyer or message in Google Docs (Tools tab — sign in with Google, or use an account you already have):",
      "“NEED HELP WITH A SMALL NEIGHBOR TASK?”",
      "Bin Return • Grocery Carry-In • Porch Sweep • Planter Watering",
      "Serving: ________",
      "Tasks from: $____",
      "Booking Contact: ________",
      "Include only your general service area — not a minor’s school, full schedule, or home address.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2 or 3 channels you chose.",
      "☐ Warm contacts — ask 10 known households.",
      "☐ Post one parent-approved flyer or message.",
      "☐ Request 3 referral introductions.",
      "Track and follow up: Date | Household | Channel | Response | Follow-Up.",
      "Honor opt-outs. Do not scrape contact lists or add people to a promotional list without permission.",
    ].join("\n"),
  },
  {
    title: "Screen & Confirm Each Request",
    desc: [
      "Ask: customer name/contact; exact address privately; task and location; who will be present; pets; stairs or lifting; supplies; access; requested date/time; price/payment; photo permission.",
      "Decline if the request changes into unsafe, skilled, private, medical, financial, transportation, or heavy work.",
    ].join("\n"),
  },
  {
    title: "Prep the Visit",
    desc: [
      "Review the confirmation. Check weather and route. Tell a trusted person where you are going. Charge your phone. Bring only the supplies needed. Wear safe shoes and clothing. Send an ETA if appropriate.",
      "Never share a key, code, alarm detail, or customer address.",
    ].join("\n"),
  },
  {
    title: "Complete Only the Agreed Task",
    desc: [
      "Arrive on time. Greet the customer. Repeat the task and price. Work carefully. Avoid unrelated areas and belongings. Stop if conditions are different or unsafe. Ask before doing extra work.",
      "If additional work is requested, quote it separately before starting.",
    ].join("\n"),
  },
  {
    title: "Close, Get Paid & Track Real Profit",
    desc: [
      "Complete a quick final check. Return supplies and access items. Take a completion photo only if permitted. Send: “Done—[task] was completed at [time].” Report damage or problems neutrally; do not make unauthorized repairs.",
      "Record: revenue; tips; supplies; travel; payment fees; marketing; total task time; travel/admin time.",
      "Job Profit = Revenue − Job Expenses. Effective Profit per Hour = Profit ÷ Total Hours.",
      "Keep records that clearly show income and expenses. IRS recordkeeping: https://www.irs.gov/businesses/small-businesses-self-employed/recordkeeping",
    ].join("\n"),
  },
  {
    title: "Build a Recurring Neighbor Route",
    desc: [
      "After a successful visit ask: “Would you like this handled weekly or monthly?”",
      "Then: set the recurring task and price; confirm skip/cancellation rules; group nearby visits; save customer preferences securely; ask for a short review/referral; review your route and prices monthly.",
      "Best pattern: SMALL TASK → CLEAR FINISH → TRUST → RECURRING VISIT → REFERRAL → DENSER ROUTE.",
    ].join("\n"),
  },
];

export function neighborhoodHelperToolsDisclaimer(): string {
  return "Beginner stack: Task Menu + Intake Form + Calendar + Route Map + Job/Profit Tracker. Sell a specific task, not “anything you need.” Parent/guardian approval for anyone under 18. Never share a key, code, alarm detail, or customer address.";
}

export function computeNeighborhoodHelperProfit(input: {
  nhJobsPerWeek?: number;
  nhAvgPricePerJob?: number;
  nhRecurringMonthly?: number;
  nhAddOnRush?: number;
  nhTipsOther?: number;
  nhSupplies?: number;
  nhTravel?: number;
  nhPaymentFees?: number;
  nhAdvertising?: number;
  nhInsuranceLicensing?: number;
  nhOtherExpenses?: number;
  nhTaskHours?: number;
  nhTravelAdminHours?: number;
}): {
  weeklyOneTimeRevenue: number;
  monthlyOneTimeRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const weeklyOneTimeRevenue = n(input.nhJobsPerWeek) * n(input.nhAvgPricePerJob);
  const monthlyOneTimeRevenue = weeklyOneTimeRevenue * 4.33;
  const grossServiceRevenue =
    monthlyOneTimeRevenue + n(input.nhRecurringMonthly) + n(input.nhAddOnRush) + n(input.nhTipsOther);
  const totalExpenses =
    n(input.nhSupplies) +
    n(input.nhTravel) +
    n(input.nhPaymentFees) +
    n(input.nhAdvertising) +
    n(input.nhInsuranceLicensing) +
    n(input.nhOtherExpenses);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours = n(input.nhTaskHours) + n(input.nhTravelAdminHours);
  return {
    weeklyOneTimeRevenue,
    monthlyOneTimeRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
