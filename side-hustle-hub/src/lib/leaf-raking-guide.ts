/**
 * Leaf Blowing Service (`leaf-raking`, Guide #012).
 * Preserve Mini Hand-Held Blower drawing eligibility language. Plain data only.
 */

export const LEAF_BLOWING_DRAWING =
  "The Side-Hustler that picks this Side-Hustle is eligible for entry in a drawing to win a Free Mini Hand-Held Blower. Conditions apply. Inquire about details via the Contact Form.";

export const LEAF_RAKING_REALITY_CHECK = {
  title: "BLOW SAFELY — REVENUE IS NOT PROFIT",
  body: [
    "This is a local outdoor cleanup service: agreed driveways, walks, patios, entryways, and lawns. Bagging/haul-away is an add-on only if offered and lawful.",
    "",
    "GROSS SERVICE REVENUE = Service Fee + Approved Add-Ons.",
    "ESTIMATED PROFIT = Gross − fuel/charging − bags − travel − disposal − equipment maintenance − payment fees − advertising − other.",
    "",
    LEAF_BLOWING_DRAWING,
    "Do not treat the drawing as a guaranteed prize. Do not invent dates, odds, eligibility, or prize value.",
    "",
    "Inspect for rocks, glass, sticks, toys, and pet waste before blowing.",
    "Never blow debris toward people, animals, vehicles, windows, or neighboring property.",
    "Do not blow leaves into streets, storm drains, waterways, or prohibited areas.",
    "Use eye/hearing protection. Follow manufacturer instructions. Do not use damaged equipment.",
    "Younger Side-Hustlers need adult supervision for equipment, transportation, clients, and payments.",
    "Verify local noise/time and leaf-disposal rules. Do not invent laws.",
    "",
    "Tagline: Clear the Path. Stay in Bounds.",
  ].join("\n"),
};

export const LEAF_RAKING_NOTES_WORKSHEET = `MY LEAF BLOWING PLAN

CLIENT
Name: ________
Phone: ________
Address / Area: ________
Preferred Contact: ________

JOB
Driveway: ☐  Walk: ☐  Patio: ☐  Lawn: ☐  Other: ________
Approx. Size: ________
Leaf Volume: Light / Medium / Heavy
Wet / Dry: ________
Obstacles: ________

SERVICE
Blow Only: ☐  Bagging: ☐  Removal: ☐  Recurring: ☐

QUOTE
Base Fee: $____
Add-Ons: $____
Disposal: $____
Total: $____

SCHEDULE
Date: ________
Time: ________
Weather Check: ☐
Backup Date: ________

SAFETY
Area Inspected: ☐
Cars / Pets / People Clear: ☐
PPE: ☐
Equipment Check: ☐

WORK
Start: ________
Finish: ________
Areas Completed: ________
Bags: ____
Disposal Method: ________
Before / After Photos Approved: ☐

PAYMENT
Service Revenue: $____
Paid: $____
Balance: $____

RESULTS
Expenses: $____
Estimated Profit: $____
Hours: ____
Profit / Hour: $____

FOLLOW-UP
Client Satisfied: ☐
Testimonial: ☐
Referral: ☐
Recurring Visit: ________

DRAWING NOTE
${LEAF_BLOWING_DRAWING}
Eligible / Entered only according to existing GYSH drawing rules — do not invent status or terms.
`;

export const LEAF_RAKING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Clear driveways, walks, and lawns with a leaf-blowing package neighbors can book by the job. Free Guide. 2 - 8 hrs/week. $15 – $50 / job figures are examples only. " +
      LEAF_BLOWING_DRAWING,
  },
  {
    id: "safety",
    label: "Safe blower use and PPE",
    detail:
      "Ability to operate the blower you will use, outdoor stamina, property boundaries, weather awareness, hearing/eye/dust protection, and adult supervision for younger Side-Hustlers.",
  },
  {
    id: "rules",
    label: "Noise, time, and disposal rules",
    detail:
      "Know local noise/time restrictions and leaf/disposal rules where applicable. Do not invent laws.",
  },
];

export const LEAF_RAKING_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Job dates and weather backups" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Jobs, expenses, profit" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Route / service area — do not post client addresses" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Client intake" },
];

export const LEAF_RAKING_SUPPLIES = {
  starterKitTotal:
    "About $15–40 for PPE, bags, and a rake if you already have a blower — do not buy commercial gear before demand. Optional Mini Hand-Held Blower ~$40–80 if you purchase one.",
  items: [
    { id: "blower", name: "Leaf blower appropriate to user and job", qty: "1", estCost: "$0 if owned / optional Mini Hand-Held Blower ~$40–80", notes: "Essential to borrow or own — " + LEAF_BLOWING_DRAWING },
    { id: "power", name: "Charged batteries / spare battery OR manufacturer-approved fuel setup", qty: "as needed", estCost: "$0–25", notes: "Essential — do not improvise unsafe charging/fueling" },
    { id: "rake", name: "Rake", qty: "1", estCost: "$8–15", notes: "Essential" },
    { id: "broom", name: "Broom + dustpan", qty: "1 set", estCost: "$6–12", notes: "Essential" },
    { id: "bags", name: "Leaf bags if bagging is offered", qty: "1 pack", estCost: "$6–12", notes: "Optional add-on materials", optional: true },
    { id: "gloves", name: "Work gloves", qty: "1 pair", estCost: "$5–10", notes: "Essential" },
    { id: "ppe", name: "Eye + hearing protection (+ dust protection as needed)", qty: "1 set", estCost: "$10–20", notes: "Essential PPE" },
    { id: "shoes", name: "Closed-toe work shoes + visible clothing", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "water", name: "Water bottle", qty: "1", estCost: "$0–8", notes: "Essential" },
    { id: "tarp", name: "Optional tarp for moving leaves", qty: "1", estCost: "$8–15", notes: "Optional", optional: true },
  ],
};

export const LEAF_RAKING_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "phone", name: "Smartphone", freePlanAvailable: true, planLabelApplicable: false, costNote: "Client photos and communication — no public addresses" },
  { id: "weather", name: "Weather forecast", freePlanAvailable: true, planLabelApplicable: false, costNote: "Do not blow in unsafe weather" },
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Jobs and backup weather dates", url: "https://calendar.google.com/" },
  { id: "forms", name: "Google Forms / intake checklist", freePlanAvailable: true, costNote: "Area, leaf volume, obstacles, disposal", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Jobs, expenses, profit", url: "https://sheets.google.com/" },
  { id: "maps", name: "Google Maps", freePlanAvailable: true, costNote: "Service-area routing", url: "https://maps.google.com/" },
  { id: "pay", name: "Payment / invoice + simple quote", freePlanAvailable: true, planLabelApplicable: false, costNote: "Collect the service fee, not reimbursements as profit" },
  { id: "photos", name: "Optional before/after photos", freePlanAvailable: true, costNote: "With permission only", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Smartphone + Weather + Google Calendar + Google Forms + Google Sheets + Google Maps + Payment" },
];

export const LEAF_RAKING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "LEAF BLOWING SERVICE — PRICING EXAMPLES",
    "",
    "Displayed $15 – $50 / job is examples only, not a guarantee.",
    "",
    "GROSS SERVICE REVENUE = Service Fee + Approved Add-Ons.",
    "ESTIMATED PROFIT = Gross − fuel/charging − bags − travel − disposal − maintenance − payment fees − advertising − other.",
    "",
    "STARTER RANGES — EXAMPLES ONLY",
    "Small driveway / walkway: about $15–$25",
    "Standard driveway + walks / patio: about $25–$40",
    "Larger yard / multiple areas: about $40–$75+",
    "Heavy buildup: quote higher",
    "Bagging / haul-away: optional add-ons only if offered and lawful",
    "Recurring weekly / seasonal: optional package",
    "",
    LEAF_BLOWING_DRAWING,
  ].join("\n"),
  raiseTip: "Raise after you know true hours, fuel, and disposal. Examples only — not income guarantees.",
  items: [
    { id: "small", label: "Small driveway / walkway", price: "$15–$25", notes: "Examples only" },
    { id: "std", label: "Standard driveway + walks / patio", price: "$25–$40", notes: "Examples only" },
    { id: "large", label: "Larger yard / multiple areas", price: "$40–$75+", notes: "Examples only" },
    { id: "bag", label: "Bagging add-on", price: "Quoted", notes: "Optional" },
    { id: "haul", label: "Haul-away / disposal", price: "Quoted", notes: "Only if offered and lawful" },
    { id: "recurring", label: "Recurring seasonal package", price: "Quoted", notes: "Examples only" },
  ],
};

export const LEAF_RAKING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define What the Service Includes and Excludes",
    desc: "Write blowing vs agreed collection area vs optional bagging/removal. Do not blow onto neighbor property or into streets/storm drains.",
  },
  {
    title: "Learn Safe Blower Operation, PPE, and Work Boundaries",
    desc: [
      "Inspect equipment. Use eye/hearing protection. Follow manufacturer instructions.",
      "Define unsafe weather, noise hours, and when you will stop.",
      "Younger helpers: adult supervision for equipment.",
    ].join("\n"),
  },
  {
    title: "Set Service Area and Job-Based Pricing",
    desc: "Price by size, leaf volume, time, travel, and add-ons. Use Suggested Pricing as examples only. Open Google Sheets from the Tools tab.",
  },
  {
    title: "Create Client Intake and Quote from Photos",
    desc: [
      "Open Google Forms from the Tools tab.",
      "Collect: address/area, surfaces, leaf volume, obstacles, disposal preference, photos.",
      "Quote before you start.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3:",
      "☐ Neighbors / referrals",
      "☐ Neighborhood Facebook groups where allowed",
      "☐ Nextdoor",
      "☐ Community boards",
      "☐ Repeat seasonal clients",
      "",
      "Write one measurable goal per channel.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple service list, example prices, service area, approved before/after, and how to book.",
      "",
      "Sample:",
      "“Leaf blowing for driveways, walks, and lawns in ______. Small jobs from $____. Message photos for a quote.”",
      "",
      LEAF_BLOWING_DRAWING,
      "You may note eligibility on a flyer. Do not invent prize terms.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: "Contact warm neighbors, post where allowed, reply promptly, quote jobs, and track inquiries.",
  },
  {
    title: "Confirm Scope, Price, Schedule, Weather, and Where Leaves Go",
    desc: "Confirm boundaries, parked vehicles, pets, date/time, weather backup, and collection area. Protect addresses.",
  },
  {
    title: "Perform the Job Safely and Leave Surfaces Tidy",
    desc: "Inspect, avoid hazards, blow away from people/vehicles/windows/roads, bag only as agreed, keep kids/pets away from the work area.",
  },
  {
    title: "Walk the Job, Collect Payment, and Offer Recurring Seasonal Work",
    desc: "Client confirmation, collect the service fee, record expenses, offer a seasonal repeat if appropriate.",
  },
  {
    title: "Calculate Profit Per Job and Improve Routes and Packages",
    desc: [
      "Record revenue, expenses, profit, hours, profit per job/hour.",
      "Ask for a testimonial/referral. Review best routes.",
      "$15 – $50 / job is examples only — not a guarantee.",
    ].join("\n"),
  },
];

export function leafRakingToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Smartphone + Weather + Google Calendar + Google Forms + Google Sheets + Google Maps + Payment.",
    "",
    "Apps belong here. Blower, rake, PPE, and bags live on the Supply List.",
    "",
    LEAF_BLOWING_DRAWING,
  ].join("\n");
}

export function computeLeafRakingProfit(input: {
  leafBlowingSmallJobs?: number;
  smallJobPrice?: number;
  standardJobs?: number;
  standardJobPrice?: number;
  largeJobs?: number;
  largeJobPrice?: number;
  baggingRevenue?: number;
  removalRevenue?: number;
  recurringRevenue?: number;
  fuelCharging?: number;
  bagsConsumables?: number;
  travel?: number;
  disposal?: number;
  equipmentMaintenance?: number;
  paymentFees?: number;
  advertising?: number;
  otherExpenses?: number;
  laborHours?: number;
  jobsCompleted?: number;
}): {
  smallRevenue: number;
  standardRevenue: number;
  largeRevenue: number;
  baggingRevenue: number;
  removalRevenue: number;
  recurringRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerJob: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const smallRevenue =
    Math.max(0, Number(input.leafBlowingSmallJobs) || 0) * Math.max(0, Number(input.smallJobPrice) || 0);
  const standardRevenue =
    Math.max(0, Number(input.standardJobs) || 0) * Math.max(0, Number(input.standardJobPrice) || 0);
  const largeRevenue =
    Math.max(0, Number(input.largeJobs) || 0) * Math.max(0, Number(input.largeJobPrice) || 0);
  const baggingRevenue = Math.max(0, Number(input.baggingRevenue) || 0);
  const removalRevenue = Math.max(0, Number(input.removalRevenue) || 0);
  const recurringRevenue = Math.max(0, Number(input.recurringRevenue) || 0);
  const grossServiceRevenue =
    smallRevenue + standardRevenue + largeRevenue + baggingRevenue + removalRevenue + recurringRevenue;
  const totalExpenses =
    Math.max(0, Number(input.fuelCharging) || 0) +
    Math.max(0, Number(input.bagsConsumables) || 0) +
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.disposal) || 0) +
    Math.max(0, Number(input.equipmentMaintenance) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const jobs = Math.max(0, Number(input.jobsCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    smallRevenue,
    standardRevenue,
    largeRevenue,
    baggingRevenue,
    removalRevenue,
    recurringRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerJob: jobs > 0 ? estimatedProfit / jobs : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
