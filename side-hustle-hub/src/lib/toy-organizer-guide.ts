/**
 * Toy Organizer (`toy-organizer`, Guide #106).
 * Play-space organizing. Client storage purchases are reimbursements, not profit.
 */

export const TOY_ORGANIZER_REALITY_CHECK = {
  title: "PARENT DECIDES KEEP / DONATE / TRASH — REIMBURSEMENTS ARE NOT PROFIT",
  body: [
    "Sort, categorize, label, and reset children’s toy spaces. This is organizing, not childcare.",
    "",
    "GROSS SERVICE REVENUE = organizing fee + approved add-on service fees.",
    "CLIENT-REIMBURSED STORAGE PRODUCTS are not organizer profit.",
    "ESTIMATED PROFIT = Gross − consumable supplies − travel − payment fees − advertising − other unreimbursed expenses.",
    "",
    "Never discard, donate, sell, or permanently remove belongings without clear parent/client approval.",
    "Keep small parts away from young children. Heavy items low. No climbing hazards. Do not block exits.",
    "Do not install wall-mounted/structural storage unless qualified and offered.",
    "Do not post before/after photos without permission. Avoid kids’ identifying information.",
    "Younger helpers need adult supervision for homes, tools, transport, and payments.",
    "Do not invent laws.",
    "",
    "Tagline: Sort With Permission. Measure Before You Buy Bins.",
  ].join("\n"),
};

export const TOY_ORGANIZER_NOTES_WORKSHEET = `MY TOY ORGANIZER PLAN

CLIENT
Name: ________  Phone: ________  Area: ________  Contact: ________

SPACE
Playroom / bedroom / family room / other: ________
Size: ________  Photos: ________  Walkthrough: ________  Ages: ________

PROJECT GOALS
Main problem: ________  Priority: ________
Keep / donate / sell / trash (parent approval): ________

STORAGE
Existing bins/shelves: ________  Measurements: ________
Needed: ________  Client budget: $____  Products approved: ________
Client reimbursement: $____

PLAN
Categories / zones / labels / rotation / books / art / small pieces / large toys: ________

PRICING
Service: $____  Add-ons: $____  Storage reimbursement: $____
Deposit: $____  Balance: $____

JOB
Date: ________  Hours: ____  Before/after approved: Y / N
Maintenance instructions given: ☐

RESULTS
Service revenue: $____  Expenses: $____  Profit: $____  Profit/hour: $____
Maintenance visit: ________  Testimonial: ☐  Referral: ☐
`;

export const TOY_ORGANIZER_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this hustle is", detail: "Sort playrooms into labeled bins so kids can find toys and parents can breathe. 2 - 8 hrs/week. Price by space, not a generic job guess." },
  { id: "consent", label: "Parent approval on keep / donate / trash", detail: "You never decide to throw away sentimental or valuable items. Storage products are usually a client expense." },
];

export const TOY_ORGANIZER_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Picture labels and flyers" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Intake" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Appointments" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Quotes, reimbursements, profit" },
];

export const TOY_ORGANIZER_SUPPLIES = {
  starterKitTotal: "About $10–30 for labels and sorting bags — do not buy bins before measuring",
  items: [
    { id: "labels", name: "Removable labels + markers or label maker", qty: "1 set", estCost: "$6–15", notes: "Essential" },
    { id: "tape", name: "Measuring tape", qty: "1", estCost: "$5–12", notes: "Essential — measure before buying storage" },
    { id: "sort", name: "Sorting bags / temporary containers", qty: "4–8", estCost: "$0–10", notes: "Essential" },
    { id: "trash", name: "Trash bags (parent-approved trash only)", qty: "1 box", estCost: "$4–8", notes: "Essential" },
    { id: "donate", name: "Donation bags/boxes (parent-approved only)", qty: "as needed", estCost: "$0–8", notes: "Essential when donating" },
    { id: "wipes", name: "Cleaning cloths / wipes", qty: "1 pack", estCost: "$3–6", notes: "Where appropriate" },
    { id: "clip", name: "Notebook / clipboard", qty: "1", estCost: "$3–8", notes: "Essential" },
    { id: "bins", name: "Client storage (bins, cubes, baskets)", qty: "only after measuring", estCost: "Client-paid / reimbursed", notes: "Not your inventory — not profit", optional: true },
    { id: "tools", name: "Optional small toolkit for simple assembly", qty: "1", estCost: "$10–20", notes: "Only if you offer assembly", optional: true },
  ],
};

export const TOY_ORGANIZER_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "camera", name: "Smartphone camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Approved before/after — no kids’ identifying details" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Picture + word labels and flyers — Free plan available", url: "https://www.canva.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Intake, ages, goals, photos", url: "https://forms.google.com/" },
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Jobs", url: "https://calendar.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Service vs reimbursement vs profit", url: "https://sheets.google.com/" },
  { id: "maps", name: "Google Maps", freePlanAvailable: true, costNote: "Travel", url: "https://maps.google.com/" },
  { id: "pay", name: "Payment / invoice", freePlanAvailable: true, planLabelApplicable: false, costNote: "Service fee separate from reimbursements" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Camera + Canva + Forms + Calendar + Sheets + Maps + Payment" },
];

export const TOY_ORGANIZER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "TOY ORGANIZER — SERVICE PRICING",
    "",
    "GROSS SERVICE REVENUE = organizing fee + approved add-on services.",
    "CLIENT STORAGE REIMBURSEMENTS ARE NOT PROFIT.",
    "",
    "Small toy area / reset: about $30–$60",
    "Standard playroom: about $60–$150",
    "Larger / multi-zone: about $125–$300+",
    "Hourly beginner: about $20–$40/hour",
    "Add-ons: labeling/setup, shopping/setup, maintenance reset",
  ].join("\n"),
  raiseTip: "Raise after true hours and clutter level. Do not count reimbursed bins as profit. Examples only.",
  items: [
    { id: "small", label: "Small toy area / reset", price: "$30–$60", notes: "Examples only" },
    { id: "std", label: "Standard playroom", price: "$60–$150", notes: "Examples only" },
    { id: "large", label: "Larger / multi-zone", price: "$125–$300+", notes: "Examples only" },
    { id: "hour", label: "Hourly (beginner)", price: "$20–$40 / hour", notes: "Examples only" },
    { id: "maint", label: "Maintenance / reset visit", price: "Quoted", notes: "Optional" },
    { id: "reimb", label: "Storage product reimbursement", price: "At cost", notes: "Not profit" },
  ],
};

export const TOY_ORGANIZER_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Define Packages and What You Will Not Discard", desc: "Small reset vs playroom vs multi-zone. Parent decides keep/donate/trash. Not childcare." },
  { title: "Client Intake, Photos, or Walkthrough", desc: "Open Google Forms. Space, ages, goals, existing storage, photos." },
  { title: "Measure the Space and Agree Scope, Budget, and Reimbursements", desc: "Measure before anyone buys bins. Quote service vs client-paid storage separately." },
  { title: "Sort With Parent Approval, Then Zone and Label", desc: "Categories, accessible zones, no climbing hazards, labels (Canva picture + word). Optional rotation." },
  { title: "Final Reset and Teach a Simple Maintenance Routine", desc: "Show the family how to put things back. Quality check." },
  { title: "Choose Your Marketing Channels", desc: "Pick only 2 or 3: referrals · neighborhood Facebook · Nextdoor · parent groups · community boards · cleaner/organizer referrals." },
  { title: "Make Your Marketing Materials", desc: "Open Canva at https://www.canva.com/. Service list, example prices, approved before/after (no kids’ IDs), how to book." },
  { title: "Carry Out Your Marketing Plan", desc: "Warm contacts, permitted posts, quote from photos/walkthrough." },
  { title: "Do the Job Safely and Collect the Service Fee", desc: "PPE/common sense, parent on keep/donate/trash, reimbursements on a separate line." },
  { title: "Ask for Maintenance Visits, Testimonials, and Referrals", desc: "Optional recurring reset. Next room opportunity." },
  { title: "Track Service Revenue vs Reimbursements vs Profit", desc: "Hours, profit per project/hour. Restock only consumable labels — not a warehouse of bins." },
];

export function toyOrganizerToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Camera + Canva + Forms + Calendar + Sheets + Maps + Payment.",
    "",
    "Bins are usually a client purchase. Reimbursements are not profit.",
  ].join("\n");
}

export function computeToyOrganizerProfit(input: {
  toyOrganizerSmallProjects?: number;
  smallPrice?: number;
  standardProjects?: number;
  standardPrice?: number;
  largeProjects?: number;
  largePrice?: number;
  addOnServiceRevenue?: number;
  maintenanceRevenue?: number;
  storageReimbursements?: number;
  consumableSupplies?: number;
  travel?: number;
  paymentFees?: number;
  advertising?: number;
  otherExpenses?: number;
  laborHours?: number;
  projectsCompleted?: number;
}): {
  grossServiceRevenue: number;
  storageReimbursements: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerProject: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossServiceRevenue =
    Math.max(0, Number(input.toyOrganizerSmallProjects) || 0) * Math.max(0, Number(input.smallPrice) || 0) +
    Math.max(0, Number(input.standardProjects) || 0) * Math.max(0, Number(input.standardPrice) || 0) +
    Math.max(0, Number(input.largeProjects) || 0) * Math.max(0, Number(input.largePrice) || 0) +
    Math.max(0, Number(input.addOnServiceRevenue) || 0) +
    Math.max(0, Number(input.maintenanceRevenue) || 0);
  const storageReimbursements = Math.max(0, Number(input.storageReimbursements) || 0);
  const totalExpenses =
    Math.max(0, Number(input.consumableSupplies) || 0) +
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const projects = Math.max(0, Number(input.projectsCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossServiceRevenue,
    storageReimbursements,
    totalExpenses,
    estimatedProfit,
    profitPerProject: projects > 0 ? estimatedProfit / projects : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
