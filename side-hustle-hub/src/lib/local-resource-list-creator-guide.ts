/**
 * Local Resource List Creator (`local-resource-list-creator`, Guide #084).
 * Research + verified directory, not copied databases. Plain data only.
 */

export const LOCAL_RESOURCE_LIST_REALITY_CHECK = {
  title: "VERIFY BEFORE YOU PUBLISH — A LISTING IS NOT AN ENDORSEMENT",
  body: [
    "The value is niche + research + verification + organization + a reasonable update schedule — not copying search snippets or another directory.",
    "",
    "GROSS REVENUE = ready-made copy sales + custom projects + update/refresh + add-ons.",
    "ESTIMATED PROFIT = Gross − software/design − platform/payment fees − printing − advertising − travel/research − other.",
    "Reusable lists may be sold more than once. Future sales are not guaranteed.",
    "",
    "Prefer official business/government sources for critical details. Record last-checked dates.",
    "Hours, prices, and programs change — say so in the guide.",
    "Do not claim licensed/insured/endorsed unless verified. Do not invent ratings.",
    "Do not copy another directory or copyrighted descriptions. Write original summaries.",
    "Use public business contacts — not private personal information. Do not sell personal contact lists.",
    "Be careful with children, tutors, home addresses, and vulnerable populations.",
    "Do not invent laws.",
    "",
    "Tagline: Pick a Niche. Verify It. Date-Stamp It.",
  ].join("\n"),
};

export const LOCAL_RESOURCE_LIST_NOTES_WORKSHEET = `MY LOCAL RESOURCE LIST PLAN

GUIDE
Guide name: ________  Audience: ________
City / neighborhood: ________  Boundary: ________
Categories: ________  Version: ________  Last updated: ________

RESOURCE ENTRY
Name: ________  Category: ________
Address / service area: ________  Phone: ________  Website: ________
Hours: ________  Price/cost: ________  Eligibility: ________
Notes: ________  Source: ________  Last verified: ________  Status: ________

PROJECT
Ready-made / custom: ________  Client: ________
Requested categories: ________  Number of resources: ____
Deadline: ________  Delivery format: ________

PRICING
Selling price: $____  Custom fee: $____  Add-ons: $____  Update fee: $____
Total quote: $____

QUALITY CHECK
Links / phone / hours / location checked: ☐
Outdated removed: ☐  Private info removed: ☐  Final proof: ☐

RESULTS
Copies sold: ____  Custom projects: ____
Gross: $____  Expenses: $____  Profit: $____  Hours: ____  Profit/hour: $____

UPDATE PLAN
Next verification: ________  Entries to recheck: ________  Feedback: ________
Testimonial: ☐  Referral: ☐  New niche: ________
`;

export const LOCAL_RESOURCE_LIST_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this side-hustle is", detail: "Compile neighborhood resources into a shareable list people will pay a small fee for. 3 - 10 hrs/week. $15 – $50 / project is examples only." },
  { id: "verify", label: "Research and verification", detail: "Multiple sources, official sites for critical facts, last-checked dates, original summaries. A listing is not an endorsement." },
];

export const LOCAL_RESOURCE_LIST_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Search", url: "https://www.google.com/", note: "Starting point — then verify on official sites" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Locations and geography" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Research tracker" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Final list" },
  { label: "Canva", url: "https://www.canva.com/", note: "Optional designed PDF" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Custom requests" },
];

export const LOCAL_RESOURCE_LIST_SUPPLIES = {
  starterKitTotal: "About $5–20 — this is a digital research business",
  items: [
    { id: "computer", name: "Computer / tablet + smartphone + internet", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "notes", name: "Notebook or digital research checklist", qty: "1", estCost: "$3–8", notes: "Essential" },
    { id: "print", name: "Optional printer for proof copies", qty: "as needed", estCost: "$3–10", notes: "Optional", optional: true },
    { id: "binder", name: "Optional folder / binder for physical copies", qty: "1", estCost: "$3–8", notes: "Optional", optional: true },
  ],
};

export const LOCAL_RESOURCE_LIST_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "search", name: "Google Search", freePlanAvailable: true, costNote: "Start research — verify on official sites", url: "https://www.google.com/" },
  { id: "maps", name: "Google Maps", freePlanAvailable: true, costNote: "Locations and hours clues — still verify", url: "https://maps.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Entries, sources, last verified", url: "https://sheets.google.com/" },
  { id: "docs", name: "Google Docs", freePlanAvailable: true, costNote: "Final guide", url: "https://docs.google.com/" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Optional designed PDF — Free plan available", url: "https://www.canva.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Custom client requests", url: "https://forms.google.com/" },
  { id: "drive", name: "Google Drive", freePlanAvailable: true, costNote: "Storage and delivery", url: "https://drive.google.com/" },
  { id: "cal", name: "Google Calendar", freePlanAvailable: true, costNote: "Update reminders", url: "https://calendar.google.com/" },
  { id: "pay", name: "Payment / invoicing", freePlanAvailable: true, planLabelApplicable: false, costNote: "Copy sales and custom projects" },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Search + Maps + Sheets + Docs + Drive + Calendar + Payment" },
];

export const LOCAL_RESOURCE_LIST_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "LOCAL RESOURCE LIST CREATOR — PRICING",
    "",
    "Displayed $15 – $50 / project is examples only, not a guarantee.",
    "ONE-TIME CUSTOM PROJECT vs REUSABLE DIGITAL PRODUCT (research once, sell copies — sales not guaranteed).",
    "",
    "Simple ready-made list: about $5–$15 per copy",
    "Detailed / niche guide: about $10–$25 per copy",
    "Custom list for one client: about $25–$75+",
    "Expanded custom research: about $50–$150+",
    "Periodic update / refresh: optional fee",
  ].join("\n"),
  raiseTip: "Price research time, verification depth, and updates. Copies of a reusable list are not guaranteed. Examples only.",
  items: [
    { id: "simple", label: "Simple ready-made list (per copy)", price: "$5–$15", notes: "Examples only" },
    { id: "niche", label: "Detailed / niche guide (per copy)", price: "$10–$25", notes: "Examples only" },
    { id: "custom", label: "Custom resource list", price: "$25–$75+", notes: "Examples only" },
    { id: "expand", label: "Expanded custom research", price: "$50–$150+", notes: "Examples only" },
    { id: "update", label: "Update / refresh", price: "Quoted", notes: "Optional" },
  ],
};

export const LOCAL_RESOURCE_LIST_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Choose a Specific Audience, Problem, and Geographic Area", desc: "Example: new residents, seniors, families, or home services in one city/neighborhood. Write the boundary." },
  { title: "Decide Categories and How Each Entry Will Look", desc: "Same fields every time: name, category, area, phone, website, hours, cost notes, eligibility, source, last verified." },
  { title: "Research Resources from Multiple Sources", desc: "Search, Maps, official city/county/community and business sites. Do not copy another paid directory." },
  { title: "Verify Important Information and Date-Stamp Entries", desc: "Prefer official sources. Record last-checked date. State that hours/prices change. No invented ratings." },
  { title: "Set Pricing for Copies vs Custom Projects", desc: "Open Google Sheets. Ready-made vs custom vs update fee. Revenue is not profit." },
  { title: "Choose Your Marketing Channels", desc: "Pick only 2 or 3: neighborhood Facebook groups (allowed) · Nextdoor · community orgs · parent/senior/new-resident groups · real estate · apartments · referrals." },
  { title: "Make Your Marketing Materials", desc: "Sample page (no private data), who it’s for, area, price, and how to buy. Open Canva at https://www.canva.com/ if you design a PDF." },
  { title: "Carry Out Your Marketing Plan", desc: "Warm contacts, permitted posts, quote custom jobs by category count and deadline." },
  { title: "Create, Quality-Check, and Deliver the Guide", desc: "Original summaries, public business contacts only, links/hours/location checked, private info removed, proof, then deliver." },
  { title: "Schedule Updates and Remove Outdated Entries", desc: "Calendar reminder. Correct when you learn something changed." },
  { title: "Track Sales, Custom Projects, Hours, and Profit", desc: "Copies sold, custom jobs, gross, expenses, profit per copy and per hour. Ask for testimonial/referral. Future copy sales are not guaranteed." },
];

export function localResourceListToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Search + Maps + Sheets + Docs + Drive + Calendar + Payment.",
    "",
    "Verify on official sites. A listing is not an endorsement. Do not sell private personal contacts.",
  ].join("\n");
}

export function computeLocalResourceListProfit(input: {
  resourceListCopiesSold?: number;
  copyPrice?: number;
  customProjects?: number;
  customPrice?: number;
  updateRevenue?: number;
  addOnRevenue?: number;
  softwareDesign?: number;
  platformPaymentFees?: number;
  printing?: number;
  advertising?: number;
  travelResearch?: number;
  otherExpenses?: number;
  laborHours?: number;
}): {
  copyRevenue: number;
  customRevenue: number;
  grossRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const copyRevenue =
    Math.max(0, Number(input.resourceListCopiesSold) || 0) * Math.max(0, Number(input.copyPrice) || 0);
  const customRevenue =
    Math.max(0, Number(input.customProjects) || 0) * Math.max(0, Number(input.customPrice) || 0);
  const grossRevenue =
    copyRevenue + customRevenue + Math.max(0, Number(input.updateRevenue) || 0) + Math.max(0, Number(input.addOnRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.softwareDesign) || 0) +
    Math.max(0, Number(input.platformPaymentFees) || 0) +
    Math.max(0, Number(input.printing) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.travelResearch) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossRevenue - totalExpenses;
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    copyRevenue,
    customRevenue,
    grossRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0,
  };
}
