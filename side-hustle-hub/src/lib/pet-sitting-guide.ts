/**
 * Pet Sitting & Dog Walking (`pet-sitting`, Guide #093).
 * Local pet care: walks, drop-ins, overnight stays — owner keeps the pet; you provide the service.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const PET_SITTING_REALITY_CHECK = {
  title: "KEYS, ROUTINES, AND SAFETY FIRST — REVENUE IS NOT PROFIT",
  body: [
    "This is a local pet-care service: walks, drop-in visits, extended visits, or overnight sitting for neighbors’ pets while they travel or work.",
    "",
    "GROSS REVENUE is what the owner pays you (walks + drop-ins + overnights + add-ons).",
    "ESTIMATED PROFIT is revenue minus mileage/travel, supplies, payment/platform fees, insurance allocation, advertising, and other operating expenses.",
    "",
    "Do a meet-and-greet. Collect written routines, feeding, medication instructions, behavior/aggression notes, vet and emergency contacts, and key/access rules.",
    "Use secure leashes, doors, and gates. Watch weather and heat. Do not invent local licensing or insurance laws — check what applies where you work.",
    "Never post house interiors or the owner’s address publicly. Do not invite friends over. Do not bring your own pets without written permission.",
    "Medication only with written owner instructions — do not guess doses.",
    "Youth helpers: parent/guardian approves jobs, transportation, overnight stays, keys, and emergency plans. Overnight sitting is adult-led unless a parent/guardian is involved as required.",
    "",
    "Tagline: Show Up. Follow the Notes. Send the Update.",
  ].join("\n"),
};

export const PET_SITTING_NOTES_WORKSHEET = `MY PET SITTING & DOG WALKING PLAN

CLIENT / CONTACT
Owner name: ________
Phone: ________
Emergency backup contact: ________
Address (private — do not post): ________
Key / access plan: ________

PET DETAILS
Pet name: ________
Species / breed: ________
Age: ________
Weight: ________
Microchip / ID: ________
Behavior / aggression notes: ________
Vet name and phone: ________

FEEDING / MEDICATION / ROUTINE
Feeding: ________
Water: ________
Walk / play schedule: ________
Litter / yard: ________
Medication (written only): ________
Special care: ________

SERVICE
Service type: walk / drop-in / extended visit / overnight
Dates: ________
Visit length: ________
Number of pets: ________
Holiday / peak premium: ________
Add-ons: ________

PRICING
Quoted total: $____
Deposit: $____
Add-ons: $____
Expenses (mileage, supplies, fees, ads, insurance allocation): $____
Estimated profit: $____
Hours: ____
Profit per visit: $____
Profit per hour: $____

OWNER UPDATES
Photo / note sent each visit: ☐
Issues logged: ________

NEXT BOOKING
Repeat dates: ________
Referral requested: ☐

Marketing Channel 1: ________
Marketing Channel 2: ________
Marketing Channel 3: ________

GYSH PRO TIP
The care notes are the job.

WALK + DROP-IN + OVERNIGHT + ADD-ONS = GROSS REVENUE.
REVENUE − MILEAGE − SUPPLIES − FEES − INSURANCE − ADS − OTHER = PROFIT.

BEGINNER CHALLENGE
Complete one paid pet-care job:
1. Write your service menu and prices.
2. Intake one trusted owner.
3. Do a meet-and-greet.
4. Collect routines, meds, vet, and emergency contacts.
5. Confirm keys / access.
6. Put visits on the calendar.
7. Deliver the visits and send updates.
8. Collect payment.
9. Return keys.
10. Track profit.
11. Ask for the next trip dates.
`;

export const PET_SITTING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Care for neighbors’ pets while they travel — walks, drop-ins, or overnight stays. Warm work that stays local. Tagline: Show Up. Follow the Notes. Send the Update. Category: Local Services / Pet Care. Beginner · 4 - 14 hrs/week · $25 – $75 / day drop-in (examples only).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliability and a way to get to the home · Phone for updates · Written intake and calendar · Backup leash, waste bags, and a key/access plan · Parent/guardian approval for minors (jobs, transportation, overnight, keys, emergencies).",
  },
  {
    id: "safety",
    label: "Pet and home safety",
    detail:
      "Meet-and-greet first. Collect behavior/aggression disclosure, medication instructions, vet and emergency contacts. Secure leashes, doors, and gates. Weather and heat awareness. Household access and privacy. Check local licensing and insurance requirements where applicable — do not invent laws.",
  },
  {
    id: "overnight",
    label: "Overnight and keys",
    detail:
      "Overnight sitting needs a clear plan and, for youth, parent/guardian involvement. Store keys securely. Never copy keys without written permission. Return keys promptly.",
  },
];

export const PET_SITTING_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Bookings and visit reminders" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Pet intake" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Clients, visits, payments, profit" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Routing — do not post owner addresses publicly" },
  { label: "Nextdoor", url: "https://nextdoor.com/", note: "Neighborhood posts where allowed" },
];

export const PET_SITTING_SUPPLIES = {
  starterKitTotal: "About $10–35 if you already have a phone — do not buy a full pet store",
  items: [
    {
      id: "leash",
      name: "Backup leash",
      qty: "1",
      estCost: "$8–15",
      notes: "Essential backup — most owners provide their own",
    },
    {
      id: "bags",
      name: "Waste bags",
      qty: "1 roll",
      estCost: "$4–8",
      notes: "Essential for walks",
    },
    {
      id: "water",
      name: "Portable water / bowl",
      qty: "1",
      estCost: "$5–12",
      notes: "Essential in heat — follow owner rules",
    },
    {
      id: "treats",
      name: "Treats only with owner permission",
      qty: "1 small bag",
      estCost: "$4–8",
      notes: "Optional — never give food the owner did not approve",
      optional: true,
    },
    {
      id: "towels",
      name: "Towels",
      qty: "1–2",
      estCost: "$0–10",
      notes: "Essential — rain, muddy paws, minor messes",
    },
    {
      id: "clean",
      name: "Minor-accident cleaning supplies",
      qty: "small kit",
      estCost: "$5–12",
      notes: "Essential — enzyme cleaner or wipes the owner approves",
    },
    {
      id: "charger",
      name: "Phone charger",
      qty: "1",
      estCost: "$0 (if owned)",
      notes: "Essential — owner updates",
    },
    {
      id: "flashlight",
      name: "Flashlight",
      qty: "1",
      estCost: "$5–10",
      notes: "Essential for evening walks / visits",
    },
    {
      id: "firstaid",
      name: "Basic pet first-aid supplies",
      qty: "1 small kit",
      estCost: "$8–20",
      notes: "Helpful — you are not a vet; call owner then listed vet",
      optional: true,
    },
    {
      id: "keys",
      name: "Secure key / entry management",
      qty: "lockbox or labeled envelope",
      estCost: "$0–20",
      notes: "Essential — never post codes; return keys promptly",
    },
  ],
};

export const PET_SITTING_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Visit times, overnight dates, and reminders so you do not double-book",
    url: "https://calendar.google.com/",
  },
  {
    id: "forms",
    name: "Google Forms",
    freePlanAvailable: true,
    costNote: "Pet intake: routine, meds, behavior, vet, emergency contacts, access",
    url: "https://forms.google.com/",
  },
  {
    id: "sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Clients, visit log, payments, mileage, and profit",
    url: "https://sheets.google.com/",
  },
  {
    id: "maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Routing between visits — do not post owner addresses publicly",
    url: "https://maps.google.com/",
  },
  {
    id: "payments",
    name: "Payment / invoicing tool",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Collect YOUR service fee after visits or on an agreed schedule",
  },
  {
    id: "booking",
    name: "Scheduling / booking tool",
    freePlanAvailable: true,
    costNote: "Optional once you have repeat clients — Calendar is enough at first",
    optional: true,
  },
  {
    id: "platform",
    name: "Pet-care platforms (only if applicable)",
    freePlanAvailable: true,
    costNote: "Optional — Rover-style platforms have their own fees and rules; verify current terms. Not required to start locally.",
    optional: true,
  },
  {
    id: "beginner-stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Google Calendar + Google Forms + Google Sheets + Google Maps + Payment Tool",
  },
];

export const PET_SITTING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "PET SITTING & DOG WALKING — PRICING EXAMPLES",
    "",
    "Displayed earning potential: $25 – $75 / day drop-in (examples only).",
    "",
    "These are examples only, not guarantees. Prices vary by market, pet needs, visit length, number of pets, travel distance, and service level.",
    "",
    "GROSS REVENUE = Dog Walk Revenue + Drop-In Revenue + Overnight Revenue + Add-On Revenue.",
    "ESTIMATED PROFIT = Gross Revenue − mileage/travel − supplies − payment/platform fees − insurance allocation − advertising − other operating expenses.",
    "",
    "REVENUE is not PROFIT.",
    "",
    "STARTER RANGES — EXAMPLES ONLY",
    "Dog walk (about 20–30 minutes): approximately $15–$30",
    "Drop-in visit (about 20–30 minutes): approximately $20–$35 / visit · displayed day examples $25–$75 / day depending on visit count",
    "Extended visit: approximately $30–$50",
    "Multiple pets: add approximately $5–$15 / extra pet",
    "Overnight sitting: approximately $40–$75+ / night (adult-led / parent-involved for youth)",
    "Holiday / peak-date premium: optional extra",
    "Medication or special-care add-on: quoted only with written instructions",
  ].join("\n"),
  raiseTip:
    "Charge more for extra pets, longer visits, holidays, and special care. Displayed $25 – $75 / day drop-in is examples only — not income guarantees.",
  items: [
    { id: "walk", label: "Dog walk (20–30 min)", price: "$15–$30", notes: "Examples only" },
    { id: "dropin", label: "Drop-in visit", price: "$20–$35 / visit", notes: "Day examples $25–$75 depending on visits" },
    { id: "extended", label: "Extended visit", price: "$30–$50", notes: "Examples only" },
    { id: "extra-pet", label: "Extra pet", price: "+$5–$15", notes: "Examples only" },
    { id: "overnight", label: "Overnight sitting", price: "$40–$75+ / night", notes: "Adult-led / parent-involved for youth" },
    { id: "holiday", label: "Holiday / peak-date premium", price: "Optional extra", notes: "Examples only" },
    { id: "special", label: "Medication / special-care add-on", price: "Quoted", notes: "Written instructions only" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ only. */
export const PET_SITTING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Services, Boundaries, and Pricing",
    desc: [
      "Write a short menu so owners know what you offer.",
      "",
      "Typical services:",
      "☐ Dog walks",
      "☐ Drop-in visits (feed, water, litter, short play)",
      "☐ Extended visits",
      "☐ Overnight sitting (adult-led / parent-involved for youth)",
      "",
      "Write what you will NOT do (for example: aggressive dogs you are not trained for, unauthorized friends in the home, or guessing medication).",
      "Post example prices and that they vary by pet, time, distance, and market.",
    ].join("\n"),
  },
  {
    title: "Create Pet Intake and Do a Meet-and-Greet",
    desc: [
      "Open Google Forms from the Tools tab.",
      "",
      "Intake:",
      "☐ Owner contacts and emergency backup",
      "☐ Pet details and behavior / aggression notes",
      "☐ Feeding and medication (written only)",
      "☐ Vet name and phone",
      "☐ Key / access plan",
      "",
      "Meet the pet in person before the first paid stay. Youth helpers: parent/guardian present as required.",
      "If the pet’s behavior is unsafe for you, decline politely.",
    ].join("\n"),
  },
  {
    title: "Collect Routines, Emergency Contacts, and Access",
    desc: [
      "Confirm feeding amounts, walk times, litter/yard rules, and medication instructions in writing.",
      "Save vet and emergency contacts in your phone. Know when to call the owner first, then the listed vet.",
      "Agree how keys / codes are stored. Never post the address or lockbox code publicly.",
      "Check local licensing and insurance requirements where applicable — do not invent laws.",
    ].join("\n"),
  },
  {
    title: "Schedule Visits and Prepare Your Kit",
    desc: [
      "Put every visit on Google Calendar (Tools tab). Do not double-book.",
      "Pack backup leash, waste bags, portable water, towels, minor-accident supplies, charger, and flashlight.",
      "Treats only with owner permission. Bring the care notes on your phone.",
    ].join("\n"),
  },
  {
    title: "Deliver Care, Updates, and Secure Homes",
    desc: [
      "Follow the owner’s checklist every visit: feed → water → walk or play → waste → quick home check.",
      "Send a short photo/note update as agreed. Do not post house interiors or the address on social media.",
      "Lock doors and gates. No extra visitors. Weather and heat: shorten walks if needed and tell the owner.",
      "Use a secure leash. If a gate or door is unsafe, fix the situation or pause and call the owner.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "You need nearby pet owners. Pick only 2 or 3 channels at first.",
      "",
      "Beginner options:",
      "☐ Referrals from people you already know",
      "☐ Neighborhood Facebook groups where allowed",
      "☐ Nextdoor",
      "☐ Veterinarian / groomer / community bulletin boards where allowed",
      "",
      "Write ONE measurable goal per channel.",
      "Examples:",
      "- Tell 10 trusted neighbors this week.",
      "- Share one service flyer in one parent-approved group.",
      "- Ask one groomer if you may leave a card.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "☐ A one-page service menu and example prices",
      "☐ What is included / not included",
      "☐ Meet-and-greet requirement",
      "☐ How owners send care notes and pay you",
      "",
      "Sample:",
      "“I walk and drop in on neighborhood pets while you’re away. Walks $____ · drop-ins $____ · overnight by arrangement. Meet-and-greet first. You get a photo update each visit.”",
      "",
      "Do not use fake reviews. Do not post a client’s home.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Do the 2–3 channels you chose.",
      "",
      "This week:",
      "☐ Share the menu with your referral list",
      "☐ Post or hang the flyer where allowed",
      "☐ Ask one happy owner for a referral after a job",
      "",
      "Track yes / maybe / no. Younger helpers: a parent/guardian manages public posts.",
    ].join("\n"),
  },
  {
    title: "Handle Emergencies, Weather, and Behavior Safely",
    desc: [
      "If the pet seems ill or injured: call the owner, then the listed vet. Transport only if pre-authorized and an adult drives when required.",
      "Heat, ice, and storms: adjust walks and notify the owner. Secure doors and gates every time.",
      "Aggression or a bite: get to safety, call the owner, document, and follow local reporting rules if they apply — do not invent them.",
      "You are not a veterinarian. Do not guess medication doses.",
    ].join("\n"),
  },
  {
    title: "Collect Payment and Close the Job",
    desc: [
      "Collect the quoted fee (walks + drop-ins + overnight + add-ons).",
      "Return keys the day they come home. Walk through any issues with a short written log.",
      "Give a simple receipt. Parent-managed payment tools for minors.",
    ].join("\n"),
  },
  {
    title: "Track Profit, Repeat Bookings, and Referrals",
    desc: [
      "Record:",
      "☐ Walk revenue, drop-in revenue, overnight revenue, add-on revenue",
      "☐ Mileage / travel",
      "☐ Supplies",
      "☐ Payment / platform fees",
      "☐ Insurance allocation",
      "☐ Advertising",
      "☐ Other expenses",
      "☐ Estimated profit, profit per visit, profit per hour, average revenue per client",
      "",
      "Ask for the next trip dates and a referral. Open Google Sheets from the Tools tab. Revenue is not profit.",
    ].join("\n"),
  },
];

export function petSittingToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Google Calendar + Google Forms + Google Sheets + Google Maps + Payment Tool.",
    "",
    "Apps belong here. Leash backup, bags, water bowl, towels, and cleaning supplies live on the Supply List.",
    "",
    "Parent/guardian manages jobs, transportation, overnight stays, keys, and emergencies for minors. Check local licensing and insurance where applicable — do not invent laws.",
  ].join("\n");
}

/** Pet-care profit. Revenue is not profit. */
export function computePetSittingProfit(input: {
  dogWalkVisits?: number;
  walkPrice?: number;
  dropInVisits?: number;
  dropInPrice?: number;
  overnightNights?: number;
  overnightPrice?: number;
  addOnRevenue?: number;
  mileageTravel?: number;
  supplies?: number;
  paymentPlatformFees?: number;
  insuranceAllocation?: number;
  advertising?: number;
  otherExpenses?: number;
  laborHours?: number;
  totalVisits?: number;
  clientsServed?: number;
}): {
  walkRevenue: number;
  dropInRevenue: number;
  overnightRevenue: number;
  addOnRevenue: number;
  grossRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerVisit: number | null;
  profitPerHour: number | null;
  averageRevenuePerClient: number | null;
  profitMarginPercent: number;
} {
  const dogWalkVisits = Math.max(0, Number(input.dogWalkVisits) || 0);
  const dropInVisits = Math.max(0, Number(input.dropInVisits) || 0);
  const overnightNights = Math.max(0, Number(input.overnightNights) || 0);
  const walkRevenue = dogWalkVisits * Math.max(0, Number(input.walkPrice) || 0);
  const dropInRevenue = dropInVisits * Math.max(0, Number(input.dropInPrice) || 0);
  const overnightRevenue = overnightNights * Math.max(0, Number(input.overnightPrice) || 0);
  const addOnRevenue = Math.max(0, Number(input.addOnRevenue) || 0);
  const grossRevenue = walkRevenue + dropInRevenue + overnightRevenue + addOnRevenue;
  const totalExpenses =
    Math.max(0, Number(input.mileageTravel) || 0) +
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.paymentPlatformFees) || 0) +
    Math.max(0, Number(input.insuranceAllocation) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossRevenue - totalExpenses;
  const hours = Math.max(0, Number(input.laborHours) || 0);
  const totalVisits = Math.max(0, Number(input.totalVisits) || 0);
  const clientsServed = Math.max(0, Number(input.clientsServed) || 0);
  return {
    walkRevenue,
    dropInRevenue,
    overnightRevenue,
    addOnRevenue,
    grossRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerVisit: totalVisits > 0 ? estimatedProfit / totalVisits : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    averageRevenuePerClient: clientsServed > 0 ? grossRevenue / clientsServed : null,
    profitMarginPercent: grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0,
  };
}
