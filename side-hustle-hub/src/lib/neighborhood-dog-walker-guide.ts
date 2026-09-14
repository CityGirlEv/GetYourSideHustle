/**
 * Neighborhood Dog Walker (`dog-walk`, Guide #014).
 * Local walks for friendly dogs — not vet care, training, grooming, or boarding.
 * Unique Unique Free. Plain data only (no imports from guide-tools).
 */

export const NEIGHBORHOOD_DOG_WALKER_REALITY_CHECK = {
  title: "MEET THE DOG FIRST — NEVER WALK A DOG YOU CANNOT CONTROL",
  body: [
    "This is a low-cost local dog-walking service: quick, standard, or long walks, recurring walks, an extra dog in the same household when safe, a basic water refill, and an approved photo/text update.",
    "It is not veterinary care, training, grooming, boarding, or medical care.",
    "",
    "GROSS REVENUE = walk fees + extra-dog fees + add-ons.",
    "ESTIMATED PROFIT = Gross − supplies − travel − fees − ads − insurance/business costs where applicable.",
    "",
    "Meet the dog with the owner present. Ask about aggression, biting, pulling, escape, reactivity, fears, and health.",
    "Never accept a dog you cannot safely control. Follow leash and animal rules. Watch weather and heat.",
    "Youth: a parent/guardian is involved with new customers, home entry, money, and unfamiliar dogs. Never encourage a child to independently enter an unfamiliar customer’s home.",
    "Do not invent licensing or insurance laws — check what applies where you walk.",
    "",
    "Tagline: Meet First. Leash On. Walk Safe.",
  ].join("\n"),
};

export const NEIGHBORHOOD_DOG_WALKER_NOTES_WORKSHEET = `MY NEIGHBORHOOD DOG WALKER PLAN

OWNER
Owner: ________
Phone: ________
Emergency contact: ________

DOG
Name: ________
Age: ________
Breed / size: ________
Temperament: ________
Triggers: ________
Leash behavior: ________
Reactivity (dogs / children / people / bikes / cars): ________
Escape risk: ________
Medical concerns: ________
Vet: ________

WALK
Route: ________
Walk length: 15–20 / 30 / 45–60
Rate: $____
Schedule: ________
Food / water: ________
Treat permission: ☐
Home entry: ________
Emergency instructions: ________
Photo permission: ☐

LOG
Completed: ☐
Duration: ____
Update sent: ☐
Payment: $____
Expenses: $____
Profit: $____
Repeat booking: ☐
Notes: ________
`;

export const NEIGHBORHOOD_DOG_WALKER_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Help busy neighbors by taking their friendly dogs for outdoor walks around the neighborhood. Free Guide. 2 - 8 hrs/week. Displayed $10 – $20 / walk is examples only. Tagline: Meet First. Leash On. Walk Safe.",
  },
  {
    id: "dogs",
    label: "Comfort with dogs and physical control",
    detail:
      "You must be able to safely control every dog you accept. If a dog pulls harder than you can handle, decline the job.",
  },
  {
    id: "schedule",
    label: "Reliable scheduling and emergency contacts",
    detail:
      "Keep a phone, owner contact, and emergency contact. Do a meet-and-greet before the first paid walk.",
  },
  {
    id: "youth",
    label: "Parent / guardian involvement",
    detail:
      "Younger walkers need a parent/guardian for new customers, home entry, money, and unfamiliar dogs. Never enter an unfamiliar home alone.",
  },
];

export const NEIGHBORHOOD_DOG_WALKER_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Walk times" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Owner-approved routes — do not post addresses" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Dog and emergency intake" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Walks, payments, profit" },
  { label: "Canva", url: "https://www.canva.com/", note: "Simple flyer" },
];

export const NEIGHBORHOOD_DOG_WALKER_SUPPLIES = {
  starterKitTotal: "About $5–20 — owners generally provide collar, harness, and leash",
  items: [
    { id: "shoes", name: "Walking shoes and weather clothing", qty: "1 set (already owned)", estCost: "$0", notes: "Essential" },
    { id: "phone", name: "Phone (charged) for start/finish updates", qty: "1 (already owned)", estCost: "$0", notes: "Essential" },
    { id: "bags", name: "Waste bags", qty: "1 roll", estCost: "$4–8", notes: "Essential — bring extras even if owner has some" },
    { id: "water", name: "Water for you (and a small amount for the dog if owner approves)", qty: "1 bottle", estCost: "$0–3", notes: "Essential in heat" },
    { id: "contacts", name: "Emergency contact list (owner + backup + vet)", qty: "1 card / phone note", estCost: "$0", notes: "Essential" },
    { id: "kitbag", name: "Small bag for bags, keys, and phone", qty: "1", estCost: "$0–8", notes: "Essential" },
    { id: "bowl", name: "Optional collapsible bowl", qty: "1", estCost: "$5–12", notes: "Optional — owner rules first", optional: true },
    { id: "reflective", name: "Optional reflective gear", qty: "1", estCost: "$8–15", notes: "Optional dusk walks", optional: true },
    { id: "rain", name: "Optional rain gear / towel", qty: "1", estCost: "$0 if owned", notes: "Optional", optional: true },
    { id: "treats", name: "Optional treats only with owner permission", qty: "1 small bag", estCost: "$4–8", notes: "Optional — never guess food rules", optional: true },
  ],
};

export const NEIGHBORHOOD_DOG_WALKER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Walk schedule", url: "https://calendar.google.com/" },
  { id: "maps", name: "Google Maps", freePlanAvailable: true, costNote: "Owner-approved routes", url: "https://maps.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Intake and emergency info", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Walks, payments, profit", url: "https://sheets.google.com/" },
  {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Simple neighborhood flyer — no home addresses",
    url: "https://www.canva.com/",
  },
  { id: "camera", name: "Phone camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Approved photo/text updates only" },
  { id: "phone", name: "Text / phone", freePlanAvailable: true, planLabelApplicable: false, costNote: "Start/finish updates and emergencies" },
  { id: "pay", name: "Optional payment app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Cash or app — parent-managed for minors", optional: true },
  { id: "weather", name: "Weather app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Heat, ice, and storm safety" },
  {
    id: "beginner-stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Calendar + Maps + Forms + Sheets + Canva + Phone — no paid platform required",
  },
];

export const NEIGHBORHOOD_DOG_WALKER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "NEIGHBORHOOD DOG WALKER — WALK PRICING EXAMPLES",
    "",
    "Displayed earning potential: $10 – $20 / walk (examples only, not guarantees).",
    "GROSS = walk fees + extra-dog fees + add-ons.",
    "PROFIT = Gross − supplies − travel − fees − ads − insurance/business costs where they apply.",
    "REVENUE is not PROFIT.",
    "",
    "15–20 min: about $10–$15",
    "30 min: about $15–$25",
    "45–60 min: about $25–$40+",
    "Extra dog same household: about +$5–$10 when safe",
    "Recurring 3–5 walks / week: package discount you write in advance",
    "",
    "Add-ons: extra time, additional dog, weekend/holiday, simple feeding/water connected to the walk.",
    "Rates vary. Never accept a second dog you cannot safely control.",
  ].join("\n"),
  raiseTip:
    "Raise for longer routes, extra dogs, weekends, or heat/ice difficulty. Displayed $10 – $20 / walk is examples only.",
  items: [
    { id: "short", label: "15–20 minute walk", price: "$10–$15", notes: "Examples only" },
    { id: "standard", label: "30 minute walk", price: "$15–$25", notes: "Examples only" },
    { id: "long", label: "45–60 minute walk", price: "$25–$40+", notes: "Examples only" },
    { id: "extra", label: "Extra dog same household (when safe)", price: "+$5–$10", notes: "Examples only" },
    { id: "package", label: "Recurring 3–5 walks / week", price: "Package", notes: "Examples only" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ only. */
export const NEIGHBORHOOD_DOG_WALKER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your Service Area and Availability",
    desc: [
      "Write the streets or neighborhood you will cover and the days/times you can actually show up.",
      "Keep walks nearby so travel time does not erase profit.",
      "Younger walkers: a parent/guardian approves the map and daylight hours.",
    ].join("\n"),
  },
  {
    title: "Write Safe Dog and Job Limits",
    desc: [
      "Meet every dog with the owner present before a paid walk.",
      "Ask about aggression, biting, pulling, escape, reactivity, fears, and health.",
      "Never accept a dog you cannot safely control. No off-leash unless the owner and local rules clearly allow it — most neighborhood jobs stay on leash.",
      "This is not vet care, training, grooming, boarding, or medical care.",
    ].join("\n"),
  },
  {
    title: "Set Walk Lengths and Prices",
    desc: [
      "Open Google Sheets. Price 15–20 min, 30 min, 45–60 min, extra dog (when safe), and recurring packages.",
      "Displayed $10 – $20 / walk is examples only. REVENUE is not PROFIT.",
    ].join("\n"),
  },
  {
    title: "Create Intake and Emergency Info",
    desc: [
      "Open Google Forms.",
      "",
      "Collect:",
      "☐ Owner + phone + emergency contact",
      "☐ Dog name, age, breed/size, temperament",
      "☐ Leash behavior, triggers, reactivity",
      "☐ Dogs / children / people / bikes / cars",
      "☐ Escape risk, medical concerns, vet",
      "☐ Route, walk length, food/water, treat permission",
      "☐ Home entry rules and emergency instructions",
      "☐ Photo permission",
    ].join("\n"),
  },
  {
    title: "Pack Your Walk Supplies",
    desc: [
      "Walking shoes, weather clothing, charged phone, waste bags, water, emergency contacts, small bag.",
      "Owner generally provides fitted collar/harness and leash. Optional: bowl, reflective gear, rain gear, towel, owner-approved treats.",
      "No paid walking platform is required.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "You need nearby owners of friendly dogs. Pick only 2 or 3 channels.",
      "",
      "Beginner options:",
      "☐ Neighbors you already know",
      "☐ Family / parent-approved intros",
      "☐ Local groups where allowed (no home addresses on public posts)",
      "☐ Repeat households on the same street",
      "",
      "Write ONE measurable goal per channel.",
      "Examples:",
      "- Ask 8 trusted neighbors this week.",
      "- Share one flyer (no addresses) in one approved group.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "Sign in at the link or use an account you already have.",
      "Search Templates for a dog walking flyer or pet-sitter flyer you can customize as a SAMPLE (no real addresses).",
      "",
      "Create:",
      "☐ A one-page walk menu and prices",
      "☐ Meet-and-greet first / leash-on message",
      "☐ Service area and hours",
      "☐ How to book (parent-managed contact for minors)",
      "",
      "Sample:",
      "“Neighborhood dog walks — meet first, leash on, text updates. 20 minutes $____ · 30 minutes $____.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Do the 2–3 channels you chose.",
      "",
      "This week:",
      "☐ Tell warm contacts",
      "☐ Share the flyer where allowed",
      "☐ Book one meet-and-greet",
      "",
      "Younger walkers: a parent/guardian manages public posts, money, and new customers. Never encourage a child to enter an unfamiliar home alone.",
    ].join("\n"),
  },
  {
    title: "Meet the Owner and Dog Before the First Paid Walk",
    desc: [
      "Walk together once. Confirm leash, route, waste-bag location, water rules, and whether you enter the home.",
      "If you cannot safely control the dog, decline politely.",
    ].join("\n"),
  },
  {
    title: "Complete the Walk Safely and Send the Update",
    desc: [
      "Leash on before the door opens. Stick to the approved route. Pick up waste.",
      "Text start and finish. Send an approved photo only if they said yes.",
      "Lock up if you entered. Never share gate codes.",
    ].join("\n"),
  },
  {
    title: "Track Earnings, Repeat Walks, and Reviews",
    desc: [
      "Log walk + travel + admin time. Profit per total hour. Ask for a repeat slot and a short review.",
      "No paid platform required. Examples only — not guarantees.",
    ].join("\n"),
  },
];

export function neighborhoodDogWalkerToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Calendar + Maps + Forms + Sheets + Canva + Phone. No paid walking platform required.",
    "",
    "Waste bags and weather gear are Supplies. Owners usually provide collar, harness, and leash. Photos only with permission.",
  ].join("\n");
}

export function computeNeighborhoodDogWalkerProfit(input: {
  neighborhoodWalks15?: number;
  price15?: number;
  walks30?: number;
  price30?: number;
  walks45?: number;
  price45?: number;
  extraDogFees?: number;
  addOnRevenue?: number;
  supplies?: number;
  travel?: number;
  paymentFees?: number;
  advertising?: number;
  insuranceBusiness?: number;
  otherExpenses?: number;
  laborHours?: number;
  walksCompleted?: number;
}): {
  grossRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerWalk: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossRevenue =
    Math.max(0, Number(input.neighborhoodWalks15) || 0) * Math.max(0, Number(input.price15) || 0) +
    Math.max(0, Number(input.walks30) || 0) * Math.max(0, Number(input.price30) || 0) +
    Math.max(0, Number(input.walks45) || 0) * Math.max(0, Number(input.price45) || 0) +
    Math.max(0, Number(input.extraDogFees) || 0) +
    Math.max(0, Number(input.addOnRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.insuranceBusiness) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossRevenue - totalExpenses;
  const walks = Math.max(0, Number(input.walksCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerWalk: walks > 0 ? estimatedProfit / walks : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0,
  };
}
