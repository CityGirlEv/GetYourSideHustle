/**
 * Plant Watering Service (`plant-watering`, Guide #017).
 * Follow the owner's plant instructions — homes on vacation and local-business plants.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const PLANT_WATERING_REALITY_CHECK = {
  title: "FOLLOW THE OWNER'S PLANT INSTRUCTIONS",
  body: [
    "Different plants need different amounts of water. Do not assume every plant should be watered every visit.",
    "",
    "Before service, get written instructions for each plant/zone:",
    "- Which plants to water",
    "- How much",
    "- How often",
    "- Indoor/outdoor",
    "- Plants to skip",
    "- Drainage/saucers",
    "- Special instructions",
    "- Who to contact if something looks wrong",
    "",
    "Do not diagnose disease, apply pesticides/fertilizers, prune, repot, or provide professional horticultural treatment unless specifically qualified and hired to do so.",
    "",
    "Never publicly reveal that a client is away. Do not publish client addresses or travel dates.",
    "",
    "Tagline: Keep Their Plants Happy While They're Away.",
  ].join("\n"),
};

export const PLANT_WATERING_NOTES_WORKSHEET = `MY PLANT WATERING SERVICE

Service Area: ________
Visit Price: $____
Vacation Package: ________
Business Route Price: $____

Marketing Channels:
1. ________
2. ________
3. ________

CLIENT / BUSINESS

Client/Business: ________
Dates: ________
Access: ________
Emergency Contact: ________

Plant/Zone IDs: ________
Amount/Frequency: ________
Indoor/Outdoor: ________
Skip Plants: ________
Hose/Water Source: ________
Pet Notes: ________
Photo Updates: ☐ Yes ☐ No

VISIT LOG
Date | Plants/Zones | Completed | Issue | Client Updated | Next Visit
__________
__________
__________

BUSINESS RESULTS
Revenue: $____
Expenses: $____
Profit: $____
Hours: ____
Profit/Hour: $____
Rebooked: ☐ Yes ☐ Maybe ☐ No

GYSH PRO TIP
The money improves when you build a ROUTE, not when you drive across town for one small watering job.
NEARBY CLIENTS → SCHEDULED ROUTE → SHORT VISITS → CONSISTENT UPDATES → REPEAT BUSINESS.

BEGINNER CHALLENGE
Create a sample 5-plant watering plan with:
- Plant IDs
- Locations
- Amount/frequency instructions
- 7-day schedule
- Visit checklist
- Client update message
- Route/pricing worksheet`;

export const PLANT_WATERING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Water indoor or outdoor plants on an agreed schedule for neighbors who are traveling or busy, and offer recurring plant-watering visits to local businesses with lobby, reception, or office plants. Tagline: Keep Their Plants Happy While They're Away. Category: Home & Local Services / Plant Care. Best for Juniors/Teens with appropriate adult involvement, Adults, Seniors / Retirees. Beginner · Very low startup · Flexible / recurring · Client home / local business · Per visit / vacation package / recurring route · Free Guide · 2 - 8 hrs/week. Displayed pricing: $10 – $40 / job (examples).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable schedule · Phone · Basic plant-care awareness · Measuring cup/watering can where needed · Transportation if applicable · Client instructions · Safe access plan.",
  },
  {
    id: "confirm",
    label: "Confirm before the first visit",
    detail:
      "Client/business · Dates · Visit frequency · Plant list/zones · Watering amount/method · Access · Alarm/key/code process · Emergency contact · Outdoor hose rules · Pets · Photos/updates · Price/payment · Final visit.",
  },
  {
    id: "minors",
    label: "For minors",
    detail:
      "Use guardian-approved jobs, transportation, communication, and safe-access arrangements. A parent/guardian should know the client and meeting plan.",
  },
  {
    id: "privacy",
    label: "Access & privacy",
    detail:
      "Never publicly reveal that a client is away. Do not post client addresses, travel dates, or key/code details. Follow the owner's lock/alarm instructions exactly.",
  },
];

export const PLANT_WATERING_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Visit dates and route reminders" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Group nearby clients into a route" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Plant instructions and visit checklist" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Recurring business route tracker" },
];

export const PLANT_WATERING_SUPPLIES = {
  starterKitTotal: "About $0–15 using the owner's water source plus a can or cup you already have",
  items: [
    { id: "phone", name: "Phone", qty: "1", estCost: "$0", notes: "Essential — camera + calendar" },
    { id: "instructions", name: "Client plant instructions", qty: "1", estCost: "$0", notes: "Essential — written before first visit" },
    { id: "can", name: "Watering can / measuring cup", qty: "1", estCost: "$0–12", notes: "Essential — use the owner's first if they have one" },
    { id: "gloves", name: "Gloves", qty: "1 pair", estCost: "$0–8", notes: "Essential for outdoor pots" },
    { id: "towel", name: "Towel / paper towels", qty: "1 pack", estCost: "$0–5", notes: "Essential — spills and saucers" },
    { id: "flashlight", name: "Flashlight", qty: "1", estCost: "$0–8", notes: "Helpful for indoor corners", optional: true },
    { id: "bucket", name: "Small bucket", qty: "1", estCost: "$0–8", notes: "Helpful for dumping saucers", optional: true },
    { id: "covers", name: "Shoe covers", qty: "1 pack", estCost: "$3–8", notes: "If the client requests them", optional: true },
    { id: "route", name: "Route / visit sheet", qty: "1", estCost: "$0", notes: "Printed or in Notes" },
  ],
};

export const PLANT_WATERING_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "pw_phone",
    name: "Phone camera",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Permission-only photos and visit proof",
  },
  {
    id: "pw_maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Route nearby homes and businesses together",
    url: "https://maps.google.com/",
  },
  {
    id: "pw_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Exact visit dates and reminders",
    url: "https://calendar.google.com/",
  },
  {
    id: "pw_reminders",
    name: "Reminders",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Phone reminders so you never skip a visit",
  },
  {
    id: "pw_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Plant instructions and visit checklist",
    url: "https://docs.google.com/",
  },
  {
    id: "pw_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Plant IDs, amounts, and skip list",
  },
  {
    id: "pw_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Recurring business route tracker",
    url: "https://sheets.google.com/",
    optional: true,
  },
  {
    id: "pw_weather",
    name: "Weather app",
    freePlanAvailable: true,
    costNote: "Outdoor scheduling when rain or freeze is a factor",
    optional: true,
  },
  {
    id: "pw_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Calendar + Plant Instructions + Phone + Watering Can + Visit Checklist",
  },
];

export const PLANT_WATERING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "Displayed pricing: $10 – $40 / job (examples).",
    "",
    "Quote by workload, travel, number of plants/zones, and visit frequency — not just house size.",
    "",
    "For minors, use guardian-approved payment, communication, and client arrangements.",
    "",
    "Examples only — not income guarantees.",
  ].join("\n"),
  raiseTip:
    "After 3–5 happy clients, raise 10–20% or add a travel fee. Nearby recurring clients on one route improve profit. Examples only — not income guarantees.",
  items: [
    { id: "quick", label: "Quick visit / small plant group", price: "$10–$15", notes: "Few plants, short stop" },
    { id: "standard", label: "Standard home visit", price: "$15–$25", notes: "Typical indoor/outdoor list" },
    { id: "large", label: "Larger indoor/outdoor visit", price: "$25–$40+", notes: "More plants/zones or extra minutes" },
    { id: "vacation", label: "Vacation package", price: "Visits × agreed per-visit rate", notes: "Write the visit count in the quote" },
    { id: "business", label: "Business route", price: "Weekly/biweekly quote", notes: "Based on plant count, time, travel, and access" },
    { id: "addon", label: "Add-ons", price: "Quoted separately", notes: "Extra zones, extra visit, extended travel, owner-approved rotation, photo update" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Never ✓. */
export const PLANT_WATERING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Service",
    desc: [
      "Offer scheduled plant watering, a basic visual check, a saucer/spill check, and an optional photo update.",
      "",
      "Decide:",
      "- Homes / vacation clients",
      "- Local businesses with lobby, reception, or office plants",
      "- Both",
      "",
      "Write:",
      "Service Area: ________",
      "I OFFER: ________",
      "I DO NOT PROVIDE: ________",
      "",
      "I do NOT diagnose disease, apply pesticides/fertilizer, prune, or repot unless specifically qualified and hired to do so.",
    ].join("\n"),
  },
  {
    title: "Set Your Visit & Package Price",
    desc: [
      "Define options so the scope is clear. Displayed examples: $10 – $40 / job.",
      "",
      "Quick visit / small plant group: $____",
      "Standard home visit: $____",
      "Larger indoor/outdoor visit: $____",
      "Vacation package: visits × $____",
      "Business route (weekly/biweekly): $____",
      "",
      "Write a maximum plant count/zones or expected minutes:",
      "Max plants/zones: ________",
      "Expected minutes: ________",
      "Travel fee if any: $____",
      "",
      "Quote by workload, travel, plant/zone count, and visit frequency — not just house size.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3 this month.",
      "",
      "Strong local channels:",
      "☐ Neighbors / friends",
      "☐ Referrals",
      "☐ Neighborhood groups",
      "☐ Nextdoor",
      "☐ Facebook community groups",
      "☐ Local businesses",
      "☐ Offices with lobby plants",
      "☐ Churches / community centers",
      "☐ Apartment / condo communities where allowed",
      "",
      "Write:",
      "What I Offer: Scheduled plant watering for homes and local-business plants",
      "Starting Price: $____",
      "Service Area: ________",
      "",
      "Set one measurable goal per channel.",
      "Examples:",
      "- Tell 10 neighbors",
      "- Ask 5 people for referrals",
      "- Contact 3 offices with visible lobby plants",
      "- Post one approved local service announcement",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple flyer or post. Use plain language.",
      "",
      "Sample:",
      "",
      "GOING OUT OF TOWN? I CAN HELP KEEP YOUR PLANTS WATERED.",
      "",
      "I can help with:",
      "- Indoor plants",
      "- Outdoor pots",
      "- Scheduled visits",
      "- Optional photo updates",
      "- Business lobby / office plant routes",
      "",
      "Service area: ________",
      "Starting price: $____",
      "Contact: ________",
      "",
      "Do not publish client addresses or travel dates.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2–3 selected channels.",
      "",
      "This week:",
      "- Contact 8–12 appropriate prospects or referral sources",
      "- For businesses, politely approach office managers/owners with visible lobby/office plants",
      "- Share your flyer",
      "- Respond promptly",
      "- Track inquiries",
      "",
      "Track:",
      "Date | Prospect | Channel | Need | Follow-Up",
      "",
      "Never publicly reveal that a client is away.",
    ].join("\n"),
  },
  {
    title: "Do a Plant Walkthrough",
    desc: [
      "Before the first visit, walk through with the owner when possible.",
      "",
      "Number or name plants or zones: P01, P02, etc.",
      "",
      "Record for each:",
      "ID: ________",
      "Location: ________",
      "Amount: ________",
      "Frequency: ________",
      "Method: ________",
      "Drainage / saucer: ________",
      "Skip instructions: ________",
      "Special concerns: ________",
      "",
      "Photograph only with permission.",
      "",
      "Do not assume every plant should be watered every visit.",
    ].join("\n"),
  },
  {
    title: "Build the Watering Schedule",
    desc: [
      "Create exact visit dates and reminders in Calendar.",
      "",
      "Group nearby clients into efficient routes.",
      "",
      "Write:",
      "Visit dates: ________",
      "Route order: ________",
      "If I cannot complete a visit: contact ________ immediately",
      "",
      "Never “make up” a missed visit without telling the client.",
      "Contact the client immediately if access, weather, or an emergency prevents service.",
    ].join("\n"),
  },
  {
    title: "Complete Each Visit Exactly as Instructed",
    desc: [
      "Confirm the correct property.",
      "Secure entry as instructed.",
      "Check the written plant instructions.",
      "Water only the plants scheduled for this visit.",
      "Use the specified amount and method.",
      "Check overflow / spills / saucers.",
      "Return tools and hose exactly as found.",
      "Do not disturb unrelated property.",
      "",
      "Never use chemicals or fertilizer without explicit authorization.",
    ].join("\n"),
  },
  {
    title: "Check & Report Problems",
    desc: [
      "Look for obvious concerns such as:",
      "- Standing water",
      "- Severe wilting",
      "- Broken pot",
      "- Leak",
      "- Fallen plant",
      "- Inaccessible water source",
      "- Unusual damage",
      "",
      "Photograph with permission and report.",
      "Do not diagnose or treat beyond scope.",
      "",
      "Sample:",
      "“Visit complete. I watered the plants on the plan. I noticed ________. I did not change anything else. Next visit: ________.”",
    ].join("\n"),
  },
  {
    title: "Secure the Property & Send Update",
    desc: [
      "Check:",
      "- Faucets / hose off",
      "- Doors / gates / windows handled exactly as instructed",
      "- Key / code secured",
      "- Alarm procedure followed",
      "",
      "Send a concise update:",
      "- Visit complete",
      "- Plants watered per plan",
      "- Any issue",
      "- Next visit date",
      "",
      "Never post the client location or travel dates publicly.",
    ].join("\n"),
  },
  {
    title: "Close Out & Build a Recurring Route",
    desc: [
      "On the final visit:",
      "- Complete the checklist",
      "- Return the key as agreed",
      "- Send a final update",
      "- Request feedback / referral",
      "- Offer future vacation or business recurring service",
      "",
      "Route nearby recurring clients together to improve profit.",
      "",
      "NEARBY CLIENTS → SCHEDULED ROUTE → SHORT VISITS → CONSISTENT UPDATES → REPEAT BUSINESS",
    ].join("\n"),
  },
];

export function plantWateringToolsDisclaimer(): string {
  return "Beginner stack: Calendar + Plant Instructions + Phone + Watering Can + Visit Checklist. Use the owner's water source and written plant instructions. Features and prices change — verify current tools before you rely on them. Never post client addresses, travel dates, or access codes.";
}

/** Weekly plant-watering profit math. Hours are weekly totals, not per visit. */
export function computePlantWateringProfit(input: {
  averageVisitFee: number;
  visitsPerWeek: number;
  packageAddOnRevenue?: number;
  fuelTravel?: number;
  supplies?: number;
  advertising?: number;
  otherExpenses?: number;
  serviceHours?: number;
  travelAdminHours?: number;
}): {
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  weeklyHours: number;
  effectiveProfitPerHour: number | null;
} {
  const fee = Math.max(0, Number(input.averageVisitFee) || 0);
  const visits = Math.max(0, Number(input.visitsPerWeek) || 0);
  const addOns = Math.max(0, Number(input.packageAddOnRevenue) || 0);
  const weeklyRevenue = fee * visits + addOns;
  const weeklyExpenses =
    Math.max(0, Number(input.fuelTravel) || 0) +
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const weeklyHours =
    Math.max(0, Number(input.serviceHours) || 0) +
    Math.max(0, Number(input.travelAdminHours) || 0);
  return {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    weeklyHours,
    effectiveProfitPerHour: weeklyHours > 0 ? weeklyProfit / weeklyHours : null,
  };
}
