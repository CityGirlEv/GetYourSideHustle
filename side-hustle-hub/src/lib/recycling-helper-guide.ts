/**
 * Neighborhood Recycling Helper (`recycling-helper`, Guide #088).
 * Recurring bin/sort convenience — not hazardous waste. Plain data only.
 */

export const RECYCLING_HELPER_REALITY_CHECK = {
  title: "BINS AND SORTING ONLY — NO HAZARDOUS WASTE",
  body: [
    "Help nearby households sort accepted recyclables and move bins to the pickup point (and back if included). This is not junk removal, dumpster diving, or hazardous-waste handling.",
    "",
    "GROSS SERVICE REVENUE = visit fees + recurring packages + approved add-ons.",
    "ESTIMATED PROFIT = Gross − travel − gloves/consumables − payment fees − advertising − other.",
    "Do not count bottle deposits or material value as helper revenue unless a separate written deal exists.",
    "",
    "Do not handle needles, chemicals, batteries, paint, broken glass, biohazards, or unknown liquids.",
    "Do not climb into dumpsters or lift unsafe/overloaded bins.",
    "Follow current local recycling rules — they vary and change. If contamination is unclear, leave it out and ask.",
    "Never publicly post that a household is away. Protect gate codes and addresses.",
    "Younger helpers need adult supervision around roads, dark hours, heavy bins, and access.",
    "Do not invent recycling rules or promise municipal pickup.",
    "",
    "Tagline: Right Day. Right Bin. Stay in Scope.",
  ].join("\n"),
};

export const RECYCLING_HELPER_NOTES_WORKSHEET = `MY RECYCLING HELPER PLAN

CLIENT
Name: ________  Phone: ________  Address: ________  Contact: ________

SERVICE
Curb-out: ☐  Curb-return: ☐  Light sorting: ☐  Recurring: ☐  Vacation: ☐

PICKUP
Pickup day: ________  Set-out time: ________  Return time: ________
Bins: ____  Bin location: ________  Curb location: ________
Gate / access: ________  Special instructions: ________

RECYCLING
Accepted materials: ________
Do-not-handle: ________
Contamination notes: ________
Local rule source / last checked: ________

PRICING
Per visit: $____  Monthly package: $____  Add-ons: $____  Expected monthly: $____

SERVICE LOG
Date: ________  Bins out: ☐  Returned: ☐  Sorting: ☐
Problem: ________  Client contacted: ☐  Paid: ☐

RESULTS
Visits: ____  Revenue: $____  Expenses: $____  Profit: $____  Hours: ____  Profit/hour: $____
`;

export const RECYCLING_HELPER_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this side-hustle is", detail: "Sort recyclables and walk bins out on the right day. 2 - 8 hrs/week. $10 – $40 / job display is examples only — recurring visits fit better." },
  { id: "rules", label: "Local pickup day and accepted materials", detail: "Learn each client's pickup day and current municipal rules. Do not invent what is recyclable." },
];

export const RECYCLING_HELPER_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Pickup days" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Route — do not post that someone is away" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Clients, days, payments" },
];

export const RECYCLING_HELPER_SUPPLIES = {
  starterKitTotal: "About $15–35 — no hauling equipment required",
  items: [
    { id: "gloves", name: "Reusable work gloves", qty: "1 pair", estCost: "$5–10", notes: "Essential" },
    { id: "vest", name: "Reflective / visible clothing", qty: "1", estCost: "$8–15", notes: "Essential in low light" },
    { id: "light", name: "Flashlight / headlamp", qty: "1", estCost: "$8–15", notes: "Essential for dark mornings" },
    { id: "card", name: "Recycling-rule reference card + route list", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "rain", name: "Rain protection + weather-appropriate shoes", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "sanitizer", name: "Hand sanitizer + water bottle + phone charger", qty: "1", estCost: "$5–12", notes: "Essential" },
    { id: "grabber", name: "Optional grabber tool", qty: "1", estCost: "$8–15", notes: "Optional", optional: true },
    { id: "wagon", name: "Optional small wagon", qty: "1", estCost: "$15–30", notes: "Only if safe", optional: true },
  ],
};

export const RECYCLING_HELPER_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "phone", name: "Smartphone", freePlanAvailable: true, planLabelApplicable: false, costNote: "Reminders and client contact" },
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Pickup schedule", url: "https://calendar.google.com/" },
  { id: "maps", name: "Google Maps", freePlanAvailable: true, costNote: "Efficient route", url: "https://maps.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Clients, days, payments, profit", url: "https://sheets.google.com/" },
  { id: "forms", name: "Simple intake form", freePlanAvailable: true, costNote: "Bins, access, do-not-handle", url: "https://forms.google.com/" },
  { id: "pay", name: "Payment / invoice", freePlanAvailable: true, planLabelApplicable: false, costNote: "Visit and package fees" },
  { id: "photo", name: "Optional completion photo", freePlanAvailable: true, costNote: "Only with permission — never advertise vacancy", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Phone + Calendar + Maps + Sheets + Intake + Payment" },
];

export const RECYCLING_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "NEIGHBORHOOD RECYCLING HELPER — VISIT AND PACKAGE PRICING",
    "",
    "Displayed $10 – $40 / job is examples only. Recurring service fits better.",
    "GROSS = visit fees + packages + add-ons. PROFIT = Gross − travel − consumables − fees − ads − other.",
    "Deposits / material value are not helper revenue unless separately agreed.",
    "",
    "Curb-out only: about $5–$10 per visit",
    "Curb-out + return: about $8–$15 per pickup day",
    "Light sorting + curb: about $10–$20 per visit",
    "Monthly recurring: about $25–$60+",
  ].join("\n"),
  raiseTip: "Raise after you know route time and bin count. Examples only.",
  items: [
    { id: "out", label: "Curb-out only", price: "$5–$10 / visit", notes: "Examples only" },
    { id: "back", label: "Curb-out + return", price: "$8–$15 / cycle", notes: "Examples only" },
    { id: "sort", label: "Light sorting + curb", price: "$10–$20 / visit", notes: "Examples only" },
    { id: "month", label: "Monthly recurring package", price: "$25–$60+", notes: "Examples only" },
  ],
};

export const RECYCLING_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Define the Service: Out, Return, Sorting, or Recurring", desc: "Write what you will and will not handle. Hazardous items are always out of scope." },
  { title: "Learn Each Client’s Pickup Day and Accepted Materials", desc: "Check current local rules. Record last-checked source. Do not invent what belongs in the bin." },
  { title: "Set Visit and Package Pricing", desc: "Price by bins, distance, stairs/gates, sorting time, and whether return is included. Open Google Sheets." },
  { title: "Create Client Intake", desc: "Address, pickup day, bin location, gate/access, bin count, curb placement, return preference, do-not-handle list. Open Google Forms." },
  { title: "Choose Your Marketing Channels", desc: "Pick only 2 or 3: neighbors/referrals · Nextdoor · local Facebook groups · senior/community groups · repeat households." },
  { title: "Make Your Marketing Materials", desc: "Simple service list, recurring options, service area, pickup-day reliability, contact. Never say a client is out of town." },
  { title: "Carry Out Your Marketing Plan", desc: "Warm leads, group by neighborhood, book recurring routes, track every commitment." },
  { title: "Before Pickup: Confirm Schedule, Access, and Safe Sorting", desc: "Weather, access, sort only agreed recyclables, reject unsafe/prohibited items." },
  { title: "Move Bins Safely to the Correct Pickup Point", desc: "Do not block driveways, sidewalks, ramps, hydrants, or traffic. Visible clothing in low light." },
  { title: "Return Bins If Included, Confirm Completion, Record Payment", desc: "Note exceptions. Collect visit or package fees." },
  { title: "Review Route Efficiency, Profit, and Retention", desc: "Profit per visit/hour, missed pickups, density. Improve before adding homes." },
];

export function recyclingHelperToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Phone + Calendar + Maps + Sheets + Intake + Payment.",
    "",
    "Gloves and lights are Supplies. Never advertise that a house is empty.",
  ].join("\n");
}

export function computeRecyclingHelperProfit(input: {
  recyclingCurbOutVisits?: number;
  curbOutPrice?: number;
  curbReturnVisits?: number;
  curbReturnPrice?: number;
  sortingVisits?: number;
  sortingPrice?: number;
  monthlyPackageRevenue?: number;
  addOnRevenue?: number;
  travel?: number;
  glovesConsumables?: number;
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
    Math.max(0, Number(input.recyclingCurbOutVisits) || 0) * Math.max(0, Number(input.curbOutPrice) || 0) +
    Math.max(0, Number(input.curbReturnVisits) || 0) * Math.max(0, Number(input.curbReturnPrice) || 0) +
    Math.max(0, Number(input.sortingVisits) || 0) * Math.max(0, Number(input.sortingPrice) || 0) +
    Math.max(0, Number(input.monthlyPackageRevenue) || 0) +
    Math.max(0, Number(input.addOnRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.glovesConsumables) || 0) +
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
