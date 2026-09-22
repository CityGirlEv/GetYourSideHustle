/**
 * Vacation Plant Helper (`vacation-mail-plant-helper`, Guide #113).
 * PLANTS ONLY — never mail or packages. Distinct from #017 Plant Watering. Plain data only.
 */

export const VACATION_PLANT_REALITY_CHECK = {
  title: "PLANTS ONLY — NEVER MAIL OR PACKAGES",
  body: [
    "Local vacation plant care for trusted neighbors. PLANTS ONLY. Never mail or packages.",
    "Not house sitting, pet sitting, overnight stays, general home monitoring, security checks, valuables, mail, or packages.",
    "",
    "GROSS = single visits + packages + add-ons. Clearly separate PRICE PER VISIT vs TOTAL TRIP PRICE.",
    "PROFIT = Gross − travel − parking/tolls − supplies − fees − ads − other.",
    "",
    "Never share travel dates or address, private photos, enter unrelated rooms, open drawers, handle valuables, collect mail/packages, invite others, or share access codes/keys.",
    "Youth: trusted customers, guardian involvement, no independent unfamiliar-home entry, no unknown chemicals.",
    "Follow owner watering instructions exactly. Never guess. No disease diagnosis. No unauthorized pesticides/fertilizers. No survival/growth guarantees.",
    "",
    "Tagline: Water the List. Touch Nothing Else.",
  ].join("\n"),
};

export const VACATION_PLANT_NOTES_WORKSHEET = `MY VACATION PLANT HELPER PLAN

CUSTOMER
Customer: ________  Phone: ________  Emergency contact: ________
Travel dates: ________
First visit: ________  Last visit: ________
Visit schedule: ________
Access: ________  (never post)

PLANTS
Plant count / locations: ________
Indoor / outdoor: ________
Watering amounts: ________
Plants NOT to water: ________
Special instructions: ________
Photo updates: ☐

QUOTE
Quote: $____  Package: per visit / trip total: ________

VISIT LOG
Date: ________  Arrived: ☐  List checked: ☐  Followed instructions: ☐
Spills checked: ☐  Property secured: ☐  Update sent: ☐
Travel: ____  Paid: ☐

RESULTS
Visit count: ____  Revenue: $____  Expenses: $____  Profit: $____
Profit per visit: $____  Profit per hour: $____
Customer returned: ☐  Review: ☐  Future trip: ________
Notes: ________
`;

export const VACATION_PLANT_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this side-hustle is", detail: "Water plants on a schedule for trusted neighbors while they travel — plants only, never mail or packages. 2 - 8 hrs/week. Displayed $10 – $40 / job is examples only." },
  { id: "follow", label: "Follow owner instructions exactly", detail: "Owner shows every plant. If watering is unclear, do not guess — ask before the trip starts." },
  { id: "access", label: "Trusted access only", detail: "Phone and emergency contact. Guardian involvement for minors. Never enter an unfamiliar home independently as a child." },
];

export const VACATION_PLANT_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Every visit" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Intake" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Visits, payments, profit" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Route — never post that someone is away" },
  { label: "Canva", url: "https://www.canva.com/", note: "Marketing — never advertise vacancy" },
];

export const VACATION_PLANT_SUPPLIES = {
  starterKitTotal: "About $0–15 — owner normally provides specialty treatments",
  items: [
    { id: "phone", name: "Phone", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "can", name: "Watering can if customer does not provide one", qty: "1", estCost: "$5–12", notes: "Use owner’s first" },
    { id: "towel", name: "Towel", qty: "1", estCost: "$0–8", notes: "Essential for spills" },
    { id: "gloves", name: "Gloves where appropriate", qty: "1 pair", estCost: "$4–8", notes: "Essential if plants require" },
    { id: "list", name: "Visit checklist", qty: "1", estCost: "$0–3", notes: "Essential" },
    { id: "shoes", name: "Comfortable shoes", qty: "1 (owned)", estCost: "$0", notes: "Essential" },
    { id: "bag", name: "Small bag", qty: "1", estCost: "$0–8", notes: "Essential" },
    { id: "cup", name: "Optional measuring cup / moisture meter / labels", qty: "1", estCost: "$5–12", notes: "Optional — follow owner tools first", optional: true },
    { id: "spray", name: "Optional spray bottle only per instructions", qty: "1", estCost: "$3–8", notes: "Optional", optional: true },
    { id: "light", name: "Optional flashlight", qty: "1", estCost: "$0 if owned", notes: "Optional", optional: true },
  ],
};

export const VACATION_PLANT_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Every visit", url: "https://calendar.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Intake and watering instructions", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Visits, payments, profit per trip", url: "https://sheets.google.com/" },
  { id: "maps", name: "Google Maps", freePlanAvailable: true, costNote: "Route — never post travel dates", url: "https://maps.google.com/" },
  { id: "camera", name: "Phone camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Approved plant updates only — never interiors that show vacancy" },
  { id: "phone", name: "Text / phone", freePlanAvailable: true, planLabelApplicable: false, costNote: "Updates and emergencies" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Plant-only flyer — never advertise that a house is empty", url: "https://www.canva.com/" },
  { id: "pay", name: "Optional payment app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Visit or trip fee", optional: true },
  { id: "weather", name: "Weather app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Outdoor plant timing" },
  { id: "chatgpt", name: "ChatGPT", freePlanAvailable: true, costNote: "Organize owner instructions with human review — never invent watering amounts", url: "https://chatgpt.com/", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Calendar + Forms + Sheets + Maps + Phone + Canva" },
];

export const VACATION_PLANT_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "VACATION PLANT HELPER — VISIT AND TRIP EXAMPLES",
    "",
    "Displayed $10 – $40 / job is examples only.",
    "Write PRICE PER VISIT and TOTAL TRIP PRICE separately so a 7-visit trip is not confused with one visit.",
    "GROSS = visits + packages + add-ons. PROFIT = Gross − travel − parking/tolls − supplies − fees − ads − other.",
    "PLANTS ONLY — never mail or packages.",
    "",
    "Quick visit: about $10–$20",
    "Standard visit: about $15–$30",
    "Larger collection / longer visit: about $25–$40+",
    "3 visits: about $40–$75+",
    "5 visits: about $65–$125+",
    "7+ visits: custom trip quote",
    "",
    "Add-ons only for real extra work/time. Price by plant count, locations, complexity, duration, visits, travel, access, supplies.",
  ].join("\n"),
  raiseTip: "Quote the trip total AND the per-visit price. Examples only. No plant-survival guarantees.",
  items: [
    { id: "quick", label: "Quick visit", price: "$10–$20", notes: "Per visit — examples only" },
    { id: "standard", label: "Standard visit", price: "$15–$30", notes: "Per visit — examples only" },
    { id: "large", label: "Larger / longer visit", price: "$25–$40+", notes: "Per visit — examples only" },
    { id: "three", label: "3-visit package", price: "$40–$75+", notes: "Trip total — examples only" },
    { id: "five", label: "5-visit package", price: "$65–$125+", notes: "Examples only" },
    { id: "seven", label: "7+ visit custom trip", price: "Custom quote", notes: "Examples only" },
  ],
};

export const VACATION_PLANT_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Define Plant-Only Service and Area", desc: "Trusted neighbors/customers only. PLANTS ONLY — NEVER MAIL OR PACKAGES. Not house sitting, pets, overnight, security checks, valuables, or mail." },
  { title: "Write Tasks In and Tasks Out", desc: "IN: scheduled watering per owner list, approved photo/text update, secure property. OUT: mail, packages, other rooms, drawers, valuables, inviting friends, sharing codes." },
  { title: "Set Per-Visit and Package Pricing", desc: "Open Google Sheets. Quick / standard / larger visits AND 3 / 5 / 7+ trip totals. Show both so customers are not confused. REVENUE is not PROFIT." },
  { title: "Create Intake and Collect Watering Instructions", desc: "Open Google Forms. Customer, phone, emergency contact, travel dates, first/last visit, schedule, plant count/locations, indoor/outdoor, amounts, plants NOT to water, photo updates, access, emergency instructions." },
  { title: "Pack Supplies and Put Every Visit on the Calendar", desc: "Phone, owner watering can when possible, towel, gloves, checklist, shoes, bag. Owner provides fertilizer/pesticides/specialty equipment. Put each visit on Google Calendar." },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3:",
      "☐ Trusted neighbors you already know",
      "☐ Family intros",
      "☐ Repeat travelers",
      "",
      "Never advertise that a specific house will be empty.",
      "Examples:",
      "- Ask 8 trusted neighbors if they travel.",
      "- Offer a 3-visit plant-only package.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "Sign in at the link or use an account you already have.",
      "Search Templates for a Flyer (US Letter) or A4 flyer you can customize as a SAMPLE (no addresses, no “away this week”).",
      "",
      "Create:",
      "☐ Plants only — never mail or packages",
      "☐ Per-visit and trip-package prices",
      "☐ How trusted neighbors book a walkthrough",
      "",
      "Sample:",
      "“Vacation plant helper — plants only, never mail or packages. Quick visit $____ · 3-visit package $____.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week:",
      "☐ Tell trusted contacts (no public vacancy posts)",
      "☐ Book one walkthrough",
      "☐ Track yes / maybe / no",
      "",
      "Youth: guardian involvement; no independent unfamiliar-home entry.",
    ].join("\n"),
  },
  { title: "Do a Pre-Trip Walkthrough", desc: "Owner shows every plant, amounts, equipment, drainage, outdoor plants, access, water source. Never guess unclear instructions. Confirm first and last visit." },
  { title: "Complete and Document Each Visit", desc: "ARRIVE → ACCESS → CHECK LIST → CHECK BEFORE WATERING → FOLLOW OWNER INSTRUCTIONS → CHECK SPILLS/OVERFLOW → APPROVED TASKS ONLY → VERIFY PLANTS → UPDATE IF REQUESTED → SECURE PROPERTY → LOG COMPLETE. Do not touch mail or packages." },
  { title: "Close Out the Trip, Track Profit, and Ask for a Review", desc: "Return keys/codes as agreed. Log visit + travel + admin time, profit per visit and per total hour, and total profit per vacation customer. Ask about the next trip." },
];

export function vacationPlantToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Calendar + Forms + Sheets + Maps + Phone + Canva.",
    "",
    "This is not Plant Watering (#017) and not House Sitter. PLANTS ONLY — never mail or packages. Never advertise that a house is empty.",
  ].join("\n");
}

export function computeVacationPlantProfit(input: {
  vacationPlantQuickVisits?: number;
  quickPrice?: number;
  standardVisits?: number;
  standardPrice?: number;
  largerVisits?: number;
  largerPrice?: number;
  packageRevenue?: number;
  addOnRevenue?: number;
  travel?: number;
  parkingTolls?: number;
  supplies?: number;
  paymentFees?: number;
  advertising?: number;
  otherExpenses?: number;
  laborHours?: number;
  visitsCompleted?: number;
}): {
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerVisit: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossServiceRevenue =
    Math.max(0, Number(input.vacationPlantQuickVisits) || 0) * Math.max(0, Number(input.quickPrice) || 0) +
    Math.max(0, Number(input.standardVisits) || 0) * Math.max(0, Number(input.standardPrice) || 0) +
    Math.max(0, Number(input.largerVisits) || 0) * Math.max(0, Number(input.largerPrice) || 0) +
    Math.max(0, Number(input.packageRevenue) || 0) +
    Math.max(0, Number(input.addOnRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.parkingTolls) || 0) +
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const visits = Math.max(0, Number(input.visitsCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerVisit: visits > 0 ? estimatedProfit / visits : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
