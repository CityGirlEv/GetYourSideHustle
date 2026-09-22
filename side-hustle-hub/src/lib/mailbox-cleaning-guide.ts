/**
 * Mailbox Cleaning Service (`mailbox-cleaning`, Guide #086).
 * Starter Membership. 2 - 8 hrs/week. Displayed $10 – $40 / job (examples).
 * Plain data only — no imports from guide-tools.
 */

export const MAILBOX_CLEANING_REALITY_CHECK = {
  title: "CLEAN THE EXTERIOR; DO NOT HANDLE THE MAIL",
  body: [
    "Wipe, wash, dry, and lightly polish the exterior of owner-authorized residential mailboxes while protecting address numbers, avoiding mail and locks, staying clear of traffic, and never interfering with postal delivery.",
    "",
    "This service does not authorize opening a mailbox, removing or sorting mail, accepting keys, changing locks, placing flyers or advertising on the box, repairing the post, repainting, or moving the receptacle.",
    "",
    "Before every job confirm: property owner/authorized customer; mailbox location and type; exterior-only scope; existing rust, peeling paint, cracks, loose post, or damage; address-number protection; water/product restrictions; traffic and parking conditions; weather; price; permission for photos.",
    "",
    "USPS states that customers are responsible for personal-mailbox maintenance and that mailbox access must remain safe and unobstructed. Advertising on mailboxes or supports is prohibited. When placement, repair, or replacement is involved, the owner should contact the local Post Office.",
    "Mailbox basics: https://faq.usps.com/s/article/Mailbox-The-Basics",
    "Mailbox standards: https://about.usps.com/publications/engineering-standards-specifications/spusps-std-7b01/",
    "",
    "Local business-license, youth-work, soliciting, water-use, wastewater, and insurance requirements vary. Verify them before launch.",
    "",
    "Tagline: Cleaner Curb Appeal. Clear Permission. Safe Routes.",
  ].join("\n"),
};

export const MAILBOX_CLEANING_NOTES_WORKSHEET = `MAILBOX CLEANING SERVICE NOTES

BUSINESS SETUP
Service Area: ________
Basic Price: $____
Detailed Price: $____
Route Price: $____
Daylight Hours: ________
Weather Rule: ________
Parent/Guardian: ________

CUSTOMER/JOB
Owner/Authorized Customer: ________
Private Address: ________
Mailbox Type/Material: ________
Post Included: ☐
Existing Damage: ________
Numbers/Decor: ________
Traffic/Parking: ________
Water/Product Restrictions: ________
Photo Permission: ☐

RESULTS
Quoted Price: $____
Actual Time: ____
Expenses: $____
Profit: $____
Completion Sent: ☐
Recurring Visit Offered: ☐
Review Requested: ☐

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Contacts: ____
Bookings: ____
Route Homes: ____

GYSH PRO TIP
The money is in safe, nearby routes — not driving across town for one ten-dollar mailbox.

OWNER PERMISSION → EXTERIOR ONLY → SAFE ROUTE → NEAT RESULT → MONTHLY TOUCH-UP.

STARTER MEMBERSHIP CHALLENGE
Build your first five-home route:
1. Define exterior-only scope.
2. Write safety/permission rules.
3. Set three prices.
4. Build an intake form.
5. Choose one safe neighborhood.
6. Contact 10 known households.
7. Book only owner-authorized jobs.
8. Track actual time and supplies.
9. Calculate route profit.
10. Ask for recurring touch-ups.`;

export const MAILBOX_CLEANING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Wipe, wash, dry, and lightly polish the exterior of owner-authorized residential mailboxes. Category: Neighborhood & Outdoor Services. Best for Kids and Teens working with parent/guardian approval and roadside supervision. Beginner · Low startup · Daylight / Weather-Dependent / Route-Based · Owner-Authorized Residential Mailboxes · Per Mailbox / Route Bundles / Recurring Touch-Ups · 2 - 8 hrs/week · Starter Membership. Displayed $10 – $40 / job is examples only. Tagline: Cleaner Curb Appeal. Clear Permission. Safe Routes.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Parent/guardian approval and roadside supervision for minors · Written or text permission from the property owner/authorized resident · Daylight-only work plan · Safe walking/parking route · Weather check · Exterior-cleaning checklist · Simple pricing · Calendar · Payment method · Income/expense log.",
  },
  {
    id: "do-not",
    label: "Do not",
    detail:
      "Open the mailbox or touch mail · Use a customer’s mailbox as a flyer holder · Clean during delivery or block carrier access · Stand in a traffic lane · Remove numbers, flags, locks, hardware, or decorations · Pressure-wash electrical components or fragile boxes · Perform repairs, painting, installation, or post replacement unless separately qualified, authorized, and compliant · Work on a box without verified owner/control permission.",
  },
  {
    id: "parent",
    label: "Parent / guardian for minors",
    detail:
      "Minors work only with parent/guardian approval and roadside supervision. Work in daylight. Stay out of traffic lanes. Never block the carrier.",
  },
];

export const MAILBOX_CLEANING_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "USPS Mailbox basics", url: "https://faq.usps.com/s/article/Mailbox-The-Basics", note: "Customer maintenance responsibilities" },
  { label: "USPS mailbox standards", url: "https://about.usps.com/publications/engineering-standards-specifications/spusps-std-7b01/", note: "Placement and standards reference" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Permission and job intake" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Route, jobs, income, expenses" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Scope, safety checklist, service menu" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Bookings and recurring touch-ups" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Route and traffic planning" },
];

export const MAILBOX_CLEANING_SUPPLIES = {
  starterKitTotal: "About $15–35 for bucket, cloths, mild soap, gloves, and visibility gear",
  items: [
    { id: "bucket", name: "Bucket", qty: "1", estCost: "$5–10", notes: "Core" },
    { id: "water", name: "Water carried safely or owner-provided with permission", qty: "as needed", estCost: "$0", notes: "Core" },
    { id: "cloths", name: "Microfiber cloths", qty: "3–5", estCost: "$5–10", notes: "Core" },
    { id: "sponge", name: "Soft sponge", qty: "1–2", estCost: "$3–6", notes: "Core" },
    { id: "brush", name: "Soft-detail brush", qty: "1", estCost: "$3–6", notes: "Core" },
    { id: "soap", name: "Mild soap appropriate for the surface", qty: "1 bottle", estCost: "$4–8", notes: "Core" },
    { id: "gloves", name: "Disposable or work gloves", qty: "1 pack", estCost: "$4–8", notes: "Core" },
    { id: "eyes", name: "Eye protection where splashing is possible", qty: "1", estCost: "$3–8", notes: "Core" },
    { id: "sanitizer", name: "Hand sanitizer", qty: "1 bottle", estCost: "$2–5", notes: "Core" },
    { id: "trash", name: "Trash bag for used towels/debris", qty: "1 pack", estCost: "$3–6", notes: "Core" },
    { id: "shoes", name: "Closed-toe non-slip shoes", qty: "1 pair", estCost: "$0 if owned", notes: "Core" },
    { id: "vest", name: "High-visibility vest for roadside visibility", qty: "1", estCost: "$8–15", notes: "Core" },
    { id: "polish", name: "Surface-safe exterior polish", qty: "1 bottle", estCost: "$5–10", notes: "Optional", optional: true },
    { id: "scraper", name: "Plastic scraper used carefully", qty: "1", estCost: "$3–6", notes: "Optional", optional: true },
    { id: "tape", name: "Painter’s tape to protect numbers/labels", qty: "1 roll", estCost: "$3–6", notes: "Optional", optional: true },
  ],
};

export const MAILBOX_CLEANING_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Permission and job intake", url: "https://forms.google.com/" },
  { id: "docs", name: "Google Docs", freePlanAvailable: true, costNote: "Scope, safety checklist, service menu", url: "https://docs.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Route, jobs, income, expenses", url: "https://sheets.google.com/" },
  { id: "calendar", name: "Calendar", freePlanAvailable: true, costNote: "Bookings and recurring touch-ups", url: "https://calendar.google.com/" },
  { id: "maps", name: "Maps", freePlanAvailable: true, costNote: "Route and traffic planning", url: "https://maps.google.com/" },
  { id: "weather", name: "Weather App", freePlanAvailable: true, planLabelApplicable: false, costNote: "Wind, heat, rain, lightning decisions" },
  { id: "camera", name: "Phone Camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Damage and completion photos only with permission" },
  { id: "calc", name: "Calculator", freePlanAvailable: true, planLabelApplicable: false, costNote: "Quotes and profit" },
  { id: "pay", name: "Payment App/Processor", freePlanAvailable: true, costNote: "Parent-approved for minors", optional: true },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Owner Permission + Exterior Checklist + Weather Check + Route Map + Job/Profit Tracker" },
];

export const MAILBOX_CLEANING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $10 – $40 / job (examples, not guarantees).",
    "",
    "STARTER PRICE EXAMPLES",
    "Basic Exterior Wipe/Wash: $10 – $15",
    "Detailed Wash + Light Polish: $15 – $25",
    "Mailbox + Post Surface Clean: $20 – $35",
    "Two Mailboxes at Same Property: $25 – $40",
    "Five-Home Neighbor Route: $50 – $100 total",
    "Monthly Exterior Touch-Up: $8 – $15 per visit",
    "",
    "COMMON ADD-ONS — EXAMPLES",
    "Adhesive/Sticker Residue Attempt: +$5 – $10 only when surface-safe",
    "Decor Removal/Rehang: +$5 – $10 with owner permission",
    "Heavy Soil Assessment: quote before work",
    "Travel Outside Core Route: optional fee",
    "",
    "Repairs, repainting, number replacement, post work, and vegetation trimming are separate services and should not be quietly slipped into a cleaning quote.",
    "",
    "PRICING FORMULA",
    "Estimated Cleaning Time × Target Labor Value + Supplies + Travel/Route Cost + Difficulty Add-On = Quote",
    "",
    "MONTHLY EXAMPLES",
    "5 jobs/week × $12 × 4.33 = $259.80 gross/month",
    "8 jobs/week × $18 × 4.33 = $623.52 gross/month",
    "",
    "Gross revenue is NOT profit.",
    "Do not guarantee earnings. Actual results depend on permission, route density, demand, weather, pricing, cancellations, supplies, travel, taxes, and expenses.",
  ].join("\n"),
  raiseTip:
    "Raise prices after you know route time and supply cost. Displayed $10 – $40 / job is examples only — not income guarantees.",
  items: [
    { id: "basic", label: "Basic exterior wipe/wash", price: "$10 – $15", notes: "Examples only" },
    { id: "detailed", label: "Detailed wash + light polish", price: "$15 – $25", notes: "Examples only" },
    { id: "post", label: "Mailbox + post surface clean", price: "$20 – $35", notes: "Examples only" },
    { id: "two", label: "Two mailboxes at same property", price: "$25 – $40", notes: "Examples only" },
    { id: "route", label: "Five-home neighbor route", price: "$50 – $100 total", notes: "Examples only" },
    { id: "monthly", label: "Monthly exterior touch-up", price: "$8 – $15 per visit", notes: "Examples only" },
  ],
};

export const MAILBOX_CLEANING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define the Exterior-Only Service",
    desc: [
      "Write exactly what is included: dust/cobweb removal; exterior wash; gentle spot treatment; drying; light polish if surface-safe; post surface wipe if included.",
      "Write exclusions: mail handling, opening, locks, repairs, painting, installation, pressure washing, and hazardous cleanup.",
    ].join("\n"),
  },
  {
    title: "Set Safety & Permission Rules",
    desc: [
      "Require owner/authorized-resident permission. Minors work only with parent/guardian approval and roadside supervision.",
      "Work in daylight. Stay out of traffic lanes. Never block the carrier.",
      "Cancel for unsafe weather or road conditions. Decline damaged, unstable, insect-infested, electrically decorated, or hazardous boxes.",
    ].join("\n"),
  },
  {
    title: "Build Your Pricing & Route System",
    desc: [
      "Choose a minimum visit price. Set basic, detailed, and route-bundle prices. Define the service radius. Group nearby customers.",
      "Quote from mailbox type, soil level, post inclusion, product needs, travel, and time — not from guesswork.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3: family/friend referrals; known neighbors; parent-managed neighborhood group; HOA/community board with permission; local lawn/yard-service referral partners.",
      "Do not put advertising in or on mailboxes.",
      "Set goals: ask 10 known households; book one five-home route; request two referral introductions.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a hand-delivered, posted, or digital message:",
      "",
      "“MAILBOX EXTERIOR LOOKING TIRED?”",
      "Owner-Authorized Exterior Wash • Detail • Light Polish",
      "Starting at: $____",
      "Serving: ________",
      "Book: ________",
      "",
      "State exterior-only service and parent-supervised availability where appropriate.",
    ].join("\n"),
  },
  {
    title: "Complete Intake & Pre-Inspection",
    desc: [
      "Confirm: owner/authorized customer; private address; mailbox type; surface/material; post included or excluded; existing damage; numbers/decorations; water access; road/parking conditions; date/time; price; photo permission.",
      "If ownership or permission is unclear, do not clean.",
    ].join("\n"),
  },
  {
    title: "Prep the Work Area",
    desc: [
      "Check weather and delivery activity. Park safely. Set supplies on the property side, not in the roadway.",
      "Photograph existing damage only with permission. Protect address numbers and delicate areas. Remove loose décor only with approval.",
    ].join("\n"),
  },
  {
    title: "Clean With a Surface-Safe Method",
    desc: [
      "Brush away dry debris. Apply mild solution to the cloth/sponge — not into the mailbox.",
      "Clean top, sides, door exterior, flag exterior, and post surface as agreed. Use minimal water near openings.",
      "Do not force the door or flag. Rinse/wipe and dry fully.",
    ].join("\n"),
  },
  {
    title: "Quality Check & Restore Access",
    desc: [
      "Check for: streaks; soap residue; water near mail opening; loose décor; visible address numbers; clear carrier approach; tools or debris left behind.",
      "Report damage; do not make unauthorized repairs.",
    ].join("\n"),
  },
  {
    title: "Get Paid & Track Real Profit",
    desc: [
      "Send the completion update. Collect payment.",
      "Record: revenue; tips; supplies; travel; payment fees; marketing; work time; travel/admin time.",
      "Job Profit = Revenue − Expenses. Effective Profit per Hour = Profit ÷ Total Hours.",
    ].join("\n"),
  },
  {
    title: "Build a Recurring Route",
    desc: [
      "Ask satisfied customers about monthly or seasonal touch-ups. Schedule neighboring homes together. Save surface/product notes. Ask for a review/referral. Track weather cancellations. Review route profitability monthly.",
      "Best pattern: PERMISSION → SAFE INSPECTION → EXTERIOR CLEAN → CLEAR ACCESS → REBOOK → DENSER ROUTE.",
    ].join("\n"),
  },
];

export function mailboxCleaningToolsDisclaimer(): string {
  return "Beginner stack: Owner Permission + Exterior Checklist + Weather Check + Route Map + Job/Profit Tracker. Clean the exterior only — do not handle the mail. Parent/guardian approval and roadside supervision for minors.";
}

export function computeMailboxCleaningProfit(input: {
  mcJobsPerWeek?: number;
  mcAvgIndividualPrice?: number;
  mcRouteJobsPerMonth?: number;
  mcAvgRoutePrice?: number;
  mcRecurringTouchUpRevenue?: number;
  mcTipsOtherRevenue?: number;
  mcCleaningSupplies?: number;
  mcProtectiveGear?: number;
  mcTravel?: number;
  mcPaymentFees?: number;
  mcAdvertising?: number;
  mcInsuranceLicensing?: number;
  mcOtherExpenses?: number;
  mcCleaningHours?: number;
  mcTravelAdminHours?: number;
}): {
  weeklyIndividualRevenue: number;
  monthlyIndividualRevenue: number;
  routeRevenue: number;
  totalMonthlyRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const weeklyIndividualRevenue = n(input.mcJobsPerWeek) * n(input.mcAvgIndividualPrice);
  const monthlyIndividualRevenue = weeklyIndividualRevenue * 4.33;
  const routeRevenue = n(input.mcRouteJobsPerMonth) * n(input.mcAvgRoutePrice);
  const totalMonthlyRevenue =
    monthlyIndividualRevenue + routeRevenue + n(input.mcRecurringTouchUpRevenue) + n(input.mcTipsOtherRevenue);
  const totalExpenses =
    n(input.mcCleaningSupplies) +
    n(input.mcProtectiveGear) +
    n(input.mcTravel) +
    n(input.mcPaymentFees) +
    n(input.mcAdvertising) +
    n(input.mcInsuranceLicensing) +
    n(input.mcOtherExpenses);
  const estimatedProfit = totalMonthlyRevenue - totalExpenses;
  const totalHours = n(input.mcCleaningHours) + n(input.mcTravelAdminHours);
  return {
    weeklyIndividualRevenue,
    monthlyIndividualRevenue,
    routeRevenue,
    totalMonthlyRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: totalMonthlyRevenue > 0 ? (estimatedProfit / totalMonthlyRevenue) * 100 : 0,
  };
}
