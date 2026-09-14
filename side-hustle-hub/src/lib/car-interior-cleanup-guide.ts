/**
 * Car Interior Cleanup Helper (`car-interior-cleanup`, Guide #044).
 * Light interior reset — not professional detailing. No chemicals kids shouldn’t use.
 * Plain data only (no imports from guide-tools).
 */

export const CAR_INTERIOR_REALITY_CHECK = {
  title: "LIGHT INTERIOR RESET — NO CHEMICALS KIDS SHOULDN’T USE",
  body: [
    "This is a light interior cleanup helper: bag trash, vacuum crumbs, wipe approved surfaces, basic glass, mats, and basic trunk cleanup when included.",
    "It is NOT professional detailing, engine/exterior work, paint correction, machine polishing, chemical stain removal, or mold / biohazard / bodily-fluid cleanup.",
    "",
    "GROSS SERVICE REVENUE = quick + standard + larger jobs + add-ons + recurring.",
    "ESTIMATED PROFIT = Gross − supplies − equipment costs − travel − fees − ads − other.",
    "",
    "Preserve: NO CHEMICALS KIDS SHOULDN’T USE. Never mix chemicals. Do not spray electronics.",
    "Vehicle off and secured. Do not move or run the vehicle. Do not remove or reinstall child seats unless trained and authorized.",
    "If you find a hazardous item (needles, unknown liquids, bodily fluids, mold, sharps): STOP, DO NOT TOUCH, GET AN ADULT / THE CUSTOMER.",
    "Never throw away uncertain personal items — set them aside for the owner.",
    "Younger helpers need adult supervision and age-appropriate products.",
    "",
    "Tagline: Bag It. Vacuum It. Hand It Back Clean.",
  ].join("\n"),
};

export const CAR_INTERIOR_NOTES_WORKSHEET = `MY CAR INTERIOR CLEANUP PLAN

CUSTOMER
Name: ________
Phone: ________
Vehicle: ________
Size: compact / sedan / SUV / minivan / other: ________

SERVICE
Service: quick / standard / larger
Quote: $____
Add-ons: trunk / pet hair / extra row / windows / organization / car-seat crumbs / recurring
Condition: ________
Pet hair: ________
Trash: ________
Instructions: ________
Photo permission: ☐

JOB LOG
Start: ________  Finish: ________  Travel: ____
Walk-around done: ☐  Scope agreed: ☐
Trash bagged: ☐  Personal items set aside: ☐
Vacuum: ☐  Mats: ☐  Cup holders / pockets: ☐
Approved surfaces: ☐  Approved glass: ☐
Final check: ☐  Customer review: ☐

RESULTS
Revenue: $____
Supply cost: $____
Other expenses: $____
Profit: $____
Hours (job + travel + setup + admin): ____
Profit per hour: $____
Next cleanup: ________
Repeat: ☐
Notes: ________
`;

export const CAR_INTERIOR_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Vacuum crumbs, wipe surfaces, and bag trash from family cars (no chemicals kids shouldn’t use). 2 - 8 hrs/week. Displayed $10 – $40 / job is examples only. Tagline: Bag It. Vacuum It. Hand It Back Clean.",
  },
  {
    id: "tools",
    label: "Safe basic tools",
    detail:
      "Ability to use a vacuum, bags, and microfiber cloths without damaging surfaces or electronics. Follow owner instructions.",
  },
  {
    id: "unsafe",
    label: "Recognize unsafe jobs",
    detail:
      "Refuse mold, biohazards, bodily fluids, unknown chemicals, sharps, and anything that needs professional detailing. STOP, DO NOT TOUCH, GET AN ADULT if a hazardous item appears.",
  },
  {
    id: "youth",
    label: "Adult supervision and age-appropriate products",
    detail:
      "Younger helpers use parent-approved products only. No mixing chemicals. Vehicle off and secured. Do not remove child seats unless trained and authorized.",
  },
];

export const CAR_INTERIOR_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Job times" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Intake and vehicle notes" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Payments, supplies, profit" },
  { label: "Canva", url: "https://www.canva.com/", note: "Marketing flyer" },
];

export const CAR_INTERIOR_SUPPLIES = {
  starterKitTotal: "About $15–40 if you already can borrow a vacuum — never mix chemicals",
  items: [
    { id: "vacuum", name: "Vacuum (home or portable) with hose / crevice tool", qty: "1 (borrow first)", estCost: "$0–40", notes: "Essential — borrow before buying" },
    { id: "bags", name: "Trash bags", qty: "1 box", estCost: "$4–8", notes: "Essential" },
    { id: "cloths", name: "Microfiber cloths", qty: "1 pack", estCost: "$6–12", notes: "Essential" },
    { id: "towels", name: "Optional paper towels", qty: "1 roll", estCost: "$2–5", notes: "Optional", optional: true },
    { id: "gloves", name: "Disposable or reusable gloves", qty: "1 pair / box", estCost: "$4–8", notes: "Essential" },
    { id: "brush", name: "Soft brush", qty: "1", estCost: "$3–8", notes: "Essential for crumbs" },
    { id: "cleaner", name: "Mild surface-appropriate cleaner (adult-approved)", qty: "1", estCost: "$3–8", notes: "Essential — NO CHEMICALS KIDS SHOULDN’T USE" },
    { id: "water", name: "Water (for damp wipe only)", qty: "1 bottle", estCost: "$0–2", notes: "Essential" },
    { id: "tote", name: "Tote for supplies", qty: "1", estCost: "$5–10", notes: "Essential" },
    { id: "cord", name: "Optional extension cord used safely", qty: "1", estCost: "$0 if owned", notes: "Optional — trip hazard awareness", optional: true },
    { id: "glass", name: "Optional interior glass cleaner (adult-approved)", qty: "1", estCost: "$3–7", notes: "Optional", optional: true },
    { id: "lint", name: "Optional lint roller / pet-hair tool", qty: "1", estCost: "$3–8", notes: "Optional add-on jobs", optional: true },
  ],
};

export const CAR_INTERIOR_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Job schedule", url: "https://calendar.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Vehicle, scope, and instructions", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Payments, supplies, profit per hour", url: "https://sheets.google.com/" },
  {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Simple marketing flyer — no private addresses",
    url: "https://www.canva.com/",
  },
  { id: "camera", name: "Phone camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Approved before / after only — no plates or kids’ faces" },
  { id: "phone", name: "Text / phone", freePlanAvailable: true, planLabelApplicable: false, costNote: "Confirm scope and send after photos" },
  { id: "pay", name: "Payment app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Collect the cleanup fee" },
  { id: "weather", name: "Weather app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Plan outdoor vacuuming / cord safety" },
  {
    id: "chatgpt",
    name: "ChatGPT",
    freePlanAvailable: true,
    costNote: "Message, checklist, and promo drafts with human review",
    url: "https://chatgpt.com/",
    optional: true,
  },
  {
    id: "beginner-stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Calendar + Forms + Sheets + Canva + Phone + Payment",
  },
];

export const CAR_INTERIOR_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "CAR INTERIOR CLEANUP HELPER — JOB PRICING EXAMPLES",
    "",
    "Displayed $10 – $40 / job is examples only, not a guarantee.",
    "GROSS = quick + standard + larger + add-ons + recurring.",
    "PROFIT = Gross − supplies − equipment − travel − fees − ads − other.",
    "REVENUE is not PROFIT.",
    "",
    "This is light interior cleanup, NOT professional detailing.",
    "",
    "Quick reset: about $15–$25",
    "Standard cleanup: about $25–$45",
    "Larger / more involved: about $40–$65+",
    "",
    "Add-ons: trunk, heavy pet hair, extra row, interior windows, organization, safe car-seat-area crumb cleanup without altering safety equipment, recurring cleanup.",
    "Price by vehicle size, condition, trash, pet hair, rows, time, travel, and supplies.",
  ].join("\n"),
  raiseTip:
    "Raise for SUVs, extra rows, heavy pet hair, or travel. Displayed $10 – $40 / job is examples only.",
  items: [
    { id: "quick", label: "Quick reset", price: "$15–$25", notes: "Examples only" },
    { id: "standard", label: "Standard cleanup", price: "$25–$45", notes: "Examples only" },
    { id: "larger", label: "Larger / more involved", price: "$40–$65+", notes: "Examples only" },
    { id: "trunk", label: "Trunk add-on", price: "Add-on", notes: "Examples only" },
    { id: "pet", label: "Heavy pet hair", price: "Add-on", notes: "Examples only" },
    { id: "recurring", label: "Recurring cleanup", price: "Package", notes: "Examples only" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ only. */
export const CAR_INTERIOR_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define What You Clean — and What You Refuse",
    desc: [
      "Offer light interior work only:",
      "☐ Bag trash",
      "☐ Vacuum crumbs",
      "☐ Cup holders / door pockets",
      "☐ Basic surface dust / wipe",
      "☐ Approved interior glass",
      "☐ Mats",
      "☐ Basic trunk cleanup when quoted",
      "",
      "Write I DO NOT DO: engine, exterior detailing, paint, machine polishing, chemical stain removal, mold, biohazards, bodily fluids, mixing chemicals, moving the car, child-seat removal unless trained and authorized.",
    ].join("\n"),
  },
  {
    title: "Set Safety Rules and Hazardous-Item Stops",
    desc: [
      "NO CHEMICALS KIDS SHOULDN’T USE. Never mix products. Vehicle off and secured.",
      "If you find needles, unknown liquids, bodily fluids, mold, or sharps: STOP, DO NOT TOUCH, GET AN ADULT / THE CUSTOMER.",
      "Do not spray electronics or change wiring. Younger helpers work with a parent/guardian.",
    ].join("\n"),
  },
  {
    title: "Gather Supplies and Practice on a Family Car First",
    desc: [
      "Use the Supply List: vacuum, bags, microfiber, gloves, soft brush, mild adult-approved cleaner, water, tote.",
      "Practice the workflow on a family vehicle before you charge a neighbor.",
      "Never throw away uncertain items — set them aside.",
    ].join("\n"),
  },
  {
    title: "Write Service Levels and Prices",
    desc: [
      "Open Google Sheets. Price quick / standard / larger plus add-ons (trunk, pet hair, extra row, windows, organization, recurring).",
      "Price by size, condition, trash, pet hair, rows, time, travel, and supplies.",
      "REVENUE is not PROFIT.",
    ].join("\n"),
  },
  {
    title: "Create Intake and Do a Walk-Around Inspection",
    desc: [
      "Open Google Forms. Collect customer, vehicle, size, service, add-ons, condition, pet hair, trash, instructions, and photo permission.",
      "Walk-around → agree scope before you start. Photograph only with permission — no license plates or kids’ faces.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "You need nearby families with cars. Pick only 2 or 3 channels.",
      "",
      "Beginner options:",
      "☐ Neighbors / family referrals",
      "☐ Parent-approved local groups",
      "☐ Repeat households (recurring)",
      "☐ Driveway / workplace lots you already have permission to work in",
      "",
      "Write ONE measurable goal per channel.",
      "Examples:",
      "- Ask 8 trusted neighbors this week.",
      "- Share one sample (no plates) in one approved group.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "Sign in at the link or use an account you already have.",
      "Search Templates for a Flyer (US Letter) or A4 flyer you can customize as a SAMPLE (no license plates, no kids’ faces).",
      "",
      "Create:",
      "☐ A one-page service menu and prices",
      "☐ What you do / will not do",
      "☐ Safety line: no chemicals kids shouldn’t use",
      "☐ How to book and pay",
      "",
      "Sample:",
      "“I do light car-interior cleanup — trash, vacuum, wipe, mats. Quick reset $____ · standard $____. No detailing chemicals.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Do the 2–3 channels you chose.",
      "",
      "This week:",
      "☐ Message warm contacts",
      "☐ Share the menu where allowed",
      "☐ Track yes / maybe / no",
      "",
      "Younger helpers: a parent/guardian manages public posts and payments.",
    ].join("\n"),
  },
  {
    title: "Confirm Scope, Then Clean in Order",
    desc: [
      "Workflow: WALK-AROUND → SCOPE → BAG TRASH → SET ASIDE PERSONAL ITEMS → VACUUM → MATS → CUP HOLDERS/POCKETS → APPROVED SURFACES → APPROVED GLASS → FINAL CHECK → CUSTOMER REVIEW.",
      "Do not start extra work (trunk, pet hair, extra row) unless it is in the quote.",
    ].join("\n"),
  },
  {
    title: "Quality Check, Customer Review, and Payment",
    desc: [
      "Reshoot approved after photos from the same angles.",
      "Walk the customer through the cabin. Collect the quoted fee.",
      "Ask if they want a recurring reset.",
    ].join("\n"),
  },
  {
    title: "Track Profit, Time, and Repeat Customers",
    desc: [
      "Log job + travel + setup/cleanup + admin time. Profit per total hour. Average revenue/profit per vehicle.",
      "Restock bags and cloths. Examples only — not guarantees.",
    ].join("\n"),
  },
];

export function carInteriorToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Calendar + Forms + Sheets + Canva + Phone + Payment.",
    "",
    "Vacuum, bags, and cloths are Supplies. NO CHEMICALS KIDS SHOULDN’T USE. Never mix products. Camera is for approved before/after only.",
  ].join("\n");
}

export function computeCarInteriorProfit(input: {
  carInteriorQuickJobs?: number;
  quickPrice?: number;
  standardJobs?: number;
  standardPrice?: number;
  largerJobs?: number;
  largerPrice?: number;
  addOnRevenue?: number;
  recurringRevenue?: number;
  supplies?: number;
  equipmentCosts?: number;
  travel?: number;
  paymentFees?: number;
  advertising?: number;
  otherExpenses?: number;
  laborHours?: number;
  vehiclesCompleted?: number;
}): {
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerVehicle: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossServiceRevenue =
    Math.max(0, Number(input.carInteriorQuickJobs) || 0) * Math.max(0, Number(input.quickPrice) || 0) +
    Math.max(0, Number(input.standardJobs) || 0) * Math.max(0, Number(input.standardPrice) || 0) +
    Math.max(0, Number(input.largerJobs) || 0) * Math.max(0, Number(input.largerPrice) || 0) +
    Math.max(0, Number(input.addOnRevenue) || 0) +
    Math.max(0, Number(input.recurringRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.equipmentCosts) || 0) +
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const vehicles = Math.max(0, Number(input.vehiclesCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerVehicle: vehicles > 0 ? estimatedProfit / vehicles : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
