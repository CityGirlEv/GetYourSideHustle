/**
 * Light Handyman & Home Help (`handyman-light`, Guide #080).
 * Light home help only — not the #011 Handyman Services guide. Plain data only.
 */

export const LIGHT_HANDYMAN_REALITY_CHECK = {
  title: "STAY IN SCOPE — SCREEN THE JOB BEFORE YOU SAY YES",
  body: [
    "Light handyman and home help only: furniture assembly, pictures/decor, appropriate shelving, simple hardware, minor non-specialized fixes, decluttering, seasonal tasks, basic yard touch-ups, and manageable item rearranging.",
    "Stay within your skill level. Skip heavy demolition.",
    "",
    "GROSS = hourly work + flat-rate jobs + packages/recurring.",
    "PROFIT = Gross − materials − supplies − fuel/travel − parking/tolls − fees − ads − tool wear − insurance/business − other.",
    "Include job + travel + estimating + shopping + cleanup/admin in total hours.",
    "",
    "Do not take significant electrical, gas, major plumbing, HVAC, roofing, structural work, demolition, hazardous materials, asbestos/mold remediation, major tree work, dangerous heights, or tasks beyond your ability.",
    "Verify local licensing, permit, and insurance boundaries — do not invent laws.",
    "Protect addresses. Photo permission required. Materials reimbursement is not profit.",
    "",
    "Tagline: Light Jobs. Clear Scope. Leave It Better.",
  ].join("\n"),
};

export const LIGHT_HANDYMAN_NOTES_WORKSHEET = `MY LIGHT HANDYMAN & HOME HELP PLAN

CUSTOMER
Customer: ________  General location: ________
Task: ________
Accepted: ☐  Declined: ☐  Reason: ________

QUOTE
Estimate: $____  Quote: $____
Materials: $____  Reimbursement: $____
Appointment: ________

JOB LOG
Job time: ____  Travel: ____
Photos (permission): ☐  Follow-up: ________
Review: ☐  Repeat work: ☐

RESULTS
Revenue: $____  Expenses: $____  Profit: $____
Profit per total hour: $____
Notes: ________
`;

export const LIGHT_HANDYMAN_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this hustle is", detail: "Small fixes, furniture assembly, declutter coaching, or seasonal yard touch-ups — skip heavy demolition. 5 - 15 hrs/week. Displayed $40 – $80 / hour is examples only." },
  { id: "tools", label: "Basic safe tool use", detail: "Physical ability for accepted tasks only. Screen jobs you cannot do safely." },
  { id: "travel", label: "Reliable transportation if needed", detail: "Account for travel time and vehicle cost in the quote." },
  { id: "rules", label: "Licensing, permits, and insurance awareness", detail: "Check what applies locally. Do not invent requirements or skip them." },
];

export const LIGHT_HANDYMAN_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Appointments" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Travel" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Jobs, expenses, profit" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Intake and screening" },
  { label: "Canva", url: "https://www.canva.com/", note: "Marketing" },
];

export const LIGHT_HANDYMAN_SUPPLIES = {
  starterKitTotal: "About $40–90 for a basic bag if you do not already own tools",
  items: [
    { id: "gloves", name: "Gloves", qty: "1 pair", estCost: "$5–10", notes: "Essential" },
    { id: "glasses", name: "Safety glasses", qty: "1", estCost: "$5–10", notes: "Essential" },
    { id: "tape", name: "Tape measure", qty: "1", estCost: "$5–12", notes: "Essential" },
    { id: "drivers", name: "Screwdrivers", qty: "1 set", estCost: "$8–15", notes: "Essential" },
    { id: "pliers", name: "Pliers and adjustable wrench", qty: "1 each", estCost: "$10–18", notes: "Essential" },
    { id: "hammer", name: "Hammer", qty: "1", estCost: "$8–15", notes: "Essential" },
    { id: "knife", name: "Utility knife", qty: "1", estCost: "$5–10", notes: "Essential" },
    { id: "level", name: "Level", qty: "1", estCost: "$8–15", notes: "Essential" },
    { id: "light", name: "Flashlight", qty: "1", estCost: "$5–12", notes: "Essential" },
    { id: "cloths", name: "Cloths", qty: "1 pack", estCost: "$4–8", notes: "Essential" },
    { id: "bag", name: "Tool bag", qty: "1", estCost: "$10–20", notes: "Essential" },
    { id: "drill", name: "Optional drill / bits / stud finder / socket set", qty: "1", estCost: "$0 if owned", notes: "Optional", optional: true },
    { id: "stool", name: "Optional step stool (not extension ladders)", qty: "1", estCost: "$15–30", notes: "Optional", optional: true },
    { id: "bins", name: "Optional drop cloth / yard tools / organizer bins / labels", qty: "as needed", estCost: "$8–20", notes: "Optional", optional: true },
  ],
};

export const LIGHT_HANDYMAN_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Appointments", url: "https://calendar.google.com/" },
  { id: "maps", name: "Google Maps", freePlanAvailable: true, costNote: "Travel", url: "https://maps.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Jobs, expenses, materials reimbursement, profit", url: "https://sheets.google.com/" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Service menu flyer", url: "https://www.canva.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Intake and job screening", url: "https://forms.google.com/" },
  { id: "pay", name: "Payment app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Labor fee separate from materials reimbursement" },
  { id: "camera", name: "Phone camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Before/after with permission — no addresses in public posts" },
  { id: "chatgpt", name: "ChatGPT", freePlanAvailable: true, costNote: "Draft estimates/checklists/messages with review", url: "https://chatgpt.com/", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Calendar + Maps + Sheets + Forms + Canva + Payment" },
];

export const LIGHT_HANDYMAN_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "LIGHT HANDYMAN & HOME HELP — RATE EXAMPLES",
    "",
    "Displayed $40 – $80 / hour is examples only, not a guarantee.",
    "GROSS = hourly + flat-rate + packages/recurring. Materials reimbursement is not profit.",
    "",
    "Basic home help: about $30–$45/hour",
    "Light handyman: about $40–$65/hour",
    "Experienced / specialized light work: about $60–$85+/hour where justified",
    "Minimum service call: write yours",
    "Small flat-rate jobs: quote after screening",
    "3–4 hour half-day package: write yours",
    "Repeat seasonal / monthly help: package",
    "Optional travel charge when distance eats the hour",
  ].join("\n"),
  raiseTip: "Account for labor, travel, materials, tool wear, vehicle, fees, and insurance. Examples only.",
  items: [
    { id: "help", label: "Basic home help", price: "$30–$45 / hour", notes: "Examples only" },
    { id: "light", label: "Light handyman", price: "$40–$65 / hour", notes: "Examples only" },
    { id: "exp", label: "Experienced light work", price: "$60–$85+ / hour", notes: "Examples only" },
    { id: "min", label: "Minimum service call", price: "Write yours", notes: "Examples only" },
    { id: "half", label: "3–4 hour half-day", price: "Package", notes: "Examples only" },
  ],
};

export const LIGHT_HANDYMAN_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Write the Jobs You WILL Do", desc: "Furniture assembly, pictures/decor, appropriate shelving, simple hardware, minor non-specialized fixes, decluttering, seasonal tasks, basic yard touch-ups, manageable rearranging. Stay inside your skill." },
  { title: "Write the Jobs You WILL NOT Do", desc: "No significant electrical, gas, major plumbing, HVAC, roofing, structural work, demolition, hazardous materials, asbestos/mold remediation, major tree work, dangerous heights, or anything beyond your ability." },
  { title: "Match Skills and Tools to the Menu", desc: "Use the Supply List. Borrow before buying. If you need a permit or a licensed trade, decline." },
  { title: "Build Your Service and Pricing Menu", desc: "Open Google Sheets. Hourly ranges, minimum call, small flat rates, half-day package, recurring help, materials reimbursement, optional travel charge. REVENUE is not PROFIT." },
  { title: "Create Intake and Screen Every Job", desc: "Open Google Forms. Task, location (general), photos, access, materials, deadline. Decline in writing when it is out of scope." },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3:",
      "☐ Neighbors / past clients",
      "☐ Local groups where allowed",
      "☐ Repeat seasonal homes",
      "",
      "Examples:",
      "- Tell 10 trusted people your I WILL / I WON’T list.",
      "- Share one assembly-before/after (permission, no address).",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "Sign in at the link or use an account you already have.",
      "Search Templates for a Flyer (US Letter) or A4 flyer you can customize as a SAMPLE.",
      "",
      "Create:",
      "☐ I WILL / I WON’T list",
      "☐ Hourly and minimum-call examples",
      "☐ How to request a quote",
      "",
      "Sample:",
      "“Light home help — assembly, pictures, declutter, seasonal touch-ups. No heavy demo. Hourly from $____.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week:",
      "☐ Share the menu with warm contacts",
      "☐ Screen one request",
      "☐ Quote only in-scope jobs",
    ].join("\n"),
  },
  { title: "Quote and Schedule Only After Screening", desc: "Write labor vs materials. Get yes on scope before you buy parts. Put the job on Google Calendar." },
  { title: "Complete Safely and Document", desc: "Protect floors. Follow manuals. Take approved after photos. Leave leftover hardware labeled. Collect labor fee; reimburse materials separately." },
  { title: "Track Profit, Reviews, and Repeat Work", desc: "Job + travel + estimating + shopping + cleanup/admin = total hours. Profit per total hour. Ask for a review and the next seasonal visit." },
];

export function lightHandymanToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Calendar + Maps + Sheets + Forms + Canva + Payment.",
    "",
    "Physical tools are Supplies. This is not the Handyman Services (#011) guide. Do not take licensed-trade work.",
  ].join("\n");
}

export function computeLightHandymanProfit(input: {
  lightHandymanHours?: number;
  hourlyRate?: number;
  flatRateRevenue?: number;
  packageRevenue?: number;
  materialsReimbursed?: number;
  materialsCost?: number;
  supplies?: number;
  fuelTravel?: number;
  parkingTolls?: number;
  paymentFees?: number;
  advertising?: number;
  toolWear?: number;
  insuranceBusiness?: number;
  otherExpenses?: number;
  laborHours?: number;
  jobsCompleted?: number;
}): {
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerJob: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossServiceRevenue =
    Math.max(0, Number(input.lightHandymanHours) || 0) * Math.max(0, Number(input.hourlyRate) || 0) +
    Math.max(0, Number(input.flatRateRevenue) || 0) +
    Math.max(0, Number(input.packageRevenue) || 0);
  const materialsCost = Math.max(0, Number(input.materialsCost) || 0);
  const reimbursed = Math.max(0, Number(input.materialsReimbursed) || 0);
  const netMaterials = Math.max(0, materialsCost - reimbursed);
  const totalExpenses =
    netMaterials +
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.fuelTravel) || 0) +
    Math.max(0, Number(input.parkingTolls) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.toolWear) || 0) +
    Math.max(0, Number(input.insuranceBusiness) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const jobs = Math.max(0, Number(input.jobsCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerJob: jobs > 0 ? estimatedProfit / jobs : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
