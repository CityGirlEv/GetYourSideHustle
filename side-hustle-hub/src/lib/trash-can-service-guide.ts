/**
 * Trash Can Service (`trash-can-service`, Guide #108).
 * Curb-out / curb-return of household trash and recycling bins — not junk removal.
 */

export const TRASH_CAN_SERVICE_REALITY_CHECK = {
  title: "BINS ONLY — NOT JUNK REMOVAL",
  body: [
    "Walk household trash/recycling bins to the curb on pickup day and return them after pickup if included.",
    "This is not junk hauling, dumpster rental, hazardous-waste pickup, or dumpster diving.",
    "",
    "GROSS SERVICE REVENUE = visit fees + recurring packages + approved add-ons.",
    "ESTIMATED PROFIT = Gross − travel − gloves/consumables − payment fees − advertising − other.",
    "",
    "Do not handle needles, chemicals, batteries, paint, biohazards, unknown liquids, or overloaded/unsafe bins.",
    "Do not climb into dumpsters. Follow HOA/city set-out rules.",
    "Never publicly post that a household is away. Protect gate codes and addresses.",
    "Younger helpers need adult supervision around roads, dark hours, heavy bins, and access.",
    "Do not invent municipal pickup or promise a missed truck will return.",
    "",
    "Tagline: Out on Time. Back After Pickup. Stay in Scope.",
  ].join("\n"),
};

export const TRASH_CAN_SERVICE_NOTES_WORKSHEET = `MY TRASH CAN SERVICE PLAN

CLIENT
Name: ________  Phone: ________  Address: ________  Contact: ________

SERVICE
Curb-out: ☐  Curb-return: ☐  Recurring: ☐  Vacation: ☐  Extra bins: ☐

PICKUP
Pickup day: ________  Set-out time: ________  Return time: ________
Bins: ____  Bin location: ________  Curb location: ________
Gate / access: ________  Special instructions: ________

PRICING
Per visit: $____  Monthly package: $____  Add-ons: $____  Expected monthly: $____

SERVICE LOG
Date: ________  Bins out: ☐  Returned: ☐
Problem: ________  Client contacted: ☐  Paid: ☐

RESULTS
Visits: ____  Revenue: $____  Expenses: $____  Profit: $____  Hours: ____  Profit/hour: $____
`;

export const TRASH_CAN_SERVICE_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this hustle is", detail: "Move bins out on pickup day and back after pickup. 2 - 6 hrs/week. $5 – $20 / job display is examples only — recurring visits fit better." },
  { id: "schedule", label: "Each client’s pickup day and bin location", detail: "Missed set-out is a missed pickup. Confirm access, gates, and where bins belong." },
];

export const TRASH_CAN_SERVICE_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Pickup days" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Route — do not post that someone is away" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Clients, days, payments" },
];

export const TRASH_CAN_SERVICE_SUPPLIES = {
  starterKitTotal: "About $15–35 — no hauling equipment required",
  items: [
    { id: "gloves", name: "Reusable work gloves", qty: "1 pair", estCost: "$5–10", notes: "Essential" },
    { id: "vest", name: "Reflective / visible clothing", qty: "1", estCost: "$8–15", notes: "Essential in low light" },
    { id: "light", name: "Flashlight / headlamp", qty: "1", estCost: "$8–15", notes: "Essential for dark mornings" },
    { id: "list", name: "Route / client list + pickup-day notes", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "rain", name: "Rain protection + weather-appropriate shoes", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "sanitizer", name: "Hand sanitizer + water bottle + phone charger", qty: "1", estCost: "$5–12", notes: "Essential" },
    { id: "wagon", name: "Optional small wagon", qty: "1", estCost: "$15–30", notes: "Only if safe", optional: true },
  ],
};

export const TRASH_CAN_SERVICE_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "phone", name: "Smartphone", freePlanAvailable: true, planLabelApplicable: false, costNote: "Reminders and client contact" },
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Pickup schedule", url: "https://calendar.google.com/" },
  { id: "maps", name: "Google Maps", freePlanAvailable: true, costNote: "Efficient route", url: "https://maps.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Clients, days, payments, profit", url: "https://sheets.google.com/" },
  { id: "forms", name: "Simple intake form", freePlanAvailable: true, costNote: "Bins, access, pickup day", url: "https://forms.google.com/" },
  { id: "pay", name: "Payment / invoice", freePlanAvailable: true, planLabelApplicable: false, costNote: "Visit and package fees" },
  { id: "photo", name: "Optional completion photo", freePlanAvailable: true, costNote: "Only with permission — never advertise vacancy", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Phone + Calendar + Maps + Sheets + Intake + Payment" },
];

export const TRASH_CAN_SERVICE_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "TRASH CAN SERVICE — VISIT AND PACKAGE PRICING",
    "",
    "Displayed $5 – $20 / job is examples only. Recurring service fits better.",
    "GROSS = visit fees + packages + add-ons. PROFIT = Gross − travel − consumables − fees − ads − other.",
    "",
    "Curb-out only: about $5–$10 per visit",
    "Curb-return only: about $4–$8 per visit",
    "Curb-out + return: about $8–$15 per pickup day",
    "Monthly recurring: about $20–$50+",
    "Vacation / extra-bin add-ons: quoted",
  ].join("\n"),
  raiseTip: "Raise after you know route time and bin count. Examples only.",
  items: [
    { id: "out", label: "Curb-out only", price: "$5–$10 / visit", notes: "Examples only" },
    { id: "back", label: "Curb-return only", price: "$4–$8 / visit", notes: "Examples only" },
    { id: "both", label: "Curb-out + return", price: "$8–$15 / cycle", notes: "Examples only" },
    { id: "month", label: "Monthly recurring package", price: "$20–$50+", notes: "Examples only" },
    { id: "extra", label: "Extra bin / vacation coverage", price: "Quoted", notes: "Optional" },
  ],
};

export const TRASH_CAN_SERVICE_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Define the Service: Out, Return, Recurring, or Vacation", desc: "Write what you will and will not handle. Hazardous items and junk hauling are always out of scope." },
  { title: "Learn Each Client’s Pickup Day, Bin Count, and Access", desc: "Record set-out time, return time, gate codes, and curb placement. Do not invent municipal pickup." },
  { title: "Set Visit and Package Pricing", desc: "Price by bins, distance, stairs/gates, and whether return is included. Open Google Sheets." },
  { title: "Create Client Intake", desc: "Address, pickup day, bin location, gate/access, bin count, curb placement, return preference. Open Google Forms." },
  { title: "Choose Your Marketing Channels", desc: "Pick only 2 or 3: neighbors/referrals · Nextdoor · local Facebook groups · senior/community groups · repeat households." },
  { title: "Make Your Marketing Materials", desc: "Simple service list, recurring options, service area, pickup-day reliability, contact. Never say a client is out of town." },
  { title: "Carry Out Your Marketing Plan", desc: "Warm leads, group by neighborhood, book recurring routes, track every commitment." },
  { title: "Before Pickup: Confirm Schedule, Access, and Safe Handling", desc: "Weather, access, reject unsafe/overloaded bins, leave prohibited items." },
  { title: "Move Bins Safely to the Correct Pickup Point", desc: "Do not block driveways, sidewalks, ramps, hydrants, or traffic. Visible clothing in low light." },
  { title: "Return Bins If Included, Confirm Completion, Record Payment", desc: "Note exceptions. Collect visit or package fees." },
  { title: "Review Route Efficiency, Profit, and Retention", desc: "Profit per visit/hour, missed pickups, density. Improve before adding homes." },
];

export function trashCanServiceToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Phone + Calendar + Maps + Sheets + Intake + Payment.",
    "",
    "Gloves and lights are Supplies. Never advertise that a house is empty.",
  ].join("\n");
}

export function computeTrashCanServiceProfit(input: {
  trashCanCurbOutVisits?: number;
  curbOutPrice?: number;
  curbReturnVisits?: number;
  curbReturnPrice?: number;
  monthlyPackageRevenue?: number;
  multiBinAddOnRevenue?: number;
  vacationCoverageRevenue?: number;
  extraRevenue?: number;
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
    Math.max(0, Number(input.trashCanCurbOutVisits) || 0) * Math.max(0, Number(input.curbOutPrice) || 0) +
    Math.max(0, Number(input.curbReturnVisits) || 0) * Math.max(0, Number(input.curbReturnPrice) || 0) +
    Math.max(0, Number(input.monthlyPackageRevenue) || 0) +
    Math.max(0, Number(input.multiBinAddOnRevenue) || 0) +
    Math.max(0, Number(input.vacationCoverageRevenue) || 0) +
    Math.max(0, Number(input.extraRevenue) || 0);
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
