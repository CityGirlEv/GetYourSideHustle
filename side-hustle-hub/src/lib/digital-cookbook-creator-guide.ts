/**
 * Digital Cookbook Creator (`digital-cookbook-creator`, Guide #058).
 * Client family recipes → PDF. Plain data only.
 */

export const DIGITAL_COOKBOOK_REALITY_CHECK = {
  title: "CLIENT RECIPES ONLY — DO NOT INVENT INGREDIENTS",
  body: [
    "Organize client-provided family recipes, stories, and photos into a polished digital cookbook (usually PDF). You do not own the family recipes.",
    "",
    "GROSS SERVICE REVENUE = Base project + add-ons + rush + extra revisions.",
    "ESTIMATED PROFIT = Gross − software/assets − payment fees − test prints − storage/delivery − advertising − other.",
    "",
    "Use only recipes/photos/stories the client owns or has permission to use.",
    "Do not copy published cookbook headnotes, photos, or expressive instructions.",
    "Do not invent missing amounts, times, temperatures, or safety steps — ask the client.",
    "Do not upload private family material into AI tools without permission.",
    "Get permission before using cookbook pages in a portfolio.",
    "Do not promise printer results, nutrition analysis, or allergen safety unless contracted and qualified.",
    "",
    "Tagline: Organize It. Proof It. Deliver a Keepsake PDF.",
  ].join("\n"),
};

export const DIGITAL_COOKBOOK_NOTES_WORKSHEET = `MY DIGITAL COOKBOOK PLAN

CLIENT
Name: ________
Contact: ________
Occasion / Purpose: ________
Deadline: ________

PROJECT
Cookbook Title: ________
Recipe Count: ____
Expected Pages: ____
Sections: ________
Photos: ____
Stories / Notes: ________
Digital PDF: ☐  Print-Ready: ☐

RECIPE COLLECTION
Recipes Received: ____
Missing: ________
Photos Received: ____
Handwritten to Transcribe: ____
Duplicates: ________
Questions for Client: ________

DESIGN
Cover Style: ________
Page Size: ________
Fonts / Theme: ________
Table of Contents: ☐  Index: ☐

PRICING
Base: $____  Transcription: $____  Photo cleanup: $____
Print-ready: $____  Rush: $____  Extra revisions: $____
Total: $____  Paid: $____  Balance: $____

PROOFING
Ingredients / measurements / instructions / names / photos / page order: ☐
Client proof sent: ☐  Corrections: ________  Final approved: ☐

DELIVERY
PDF: ☐  Print-ready: ☐  Source included: Y / N
Delivery date: ________  Archive date: ________

RESULTS
Revenue: $____  Expenses: $____  Profit: $____  Hours: ____  Profit/hour: $____
Testimonial: ☐  Referral: ☐
`;

export const DIGITAL_COOKBOOK_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this side-hustle is", detail: "Collect family recipes into a simple PDF cookbook with photos and tips. Elite membership unchanged. 3 - 10 hrs/week. $15 – $50 / project display is examples only — price by recipe count." },
  { id: "skills", label: "Layout, recipe cleanup, and PDF export", detail: "Canva/document layout, consistent recipe fields, photo handling, backups, proofreading, and copyright/permission awareness." },
];

export const DIGITAL_COOKBOOK_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Cookbook layout — Free plan available" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Recipe cleanup" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Recipe intake fields" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Client uploads and delivery" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Recipe inventory and pricing" },
];

export const DIGITAL_COOKBOOK_SUPPLIES = {
  starterKitTotal: "Mostly digital — about $0–25 if you already have a computer",
  items: [
    { id: "computer", name: "Computer or tablet + reliable internet", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "phone", name: "Phone / camera for optional photo capture", qty: "1", estCost: "$0 if owned", notes: "Essential if you shoot photos" },
    { id: "backup", name: "Cloud backup / digital storage", qty: "1", estCost: "$0–12", notes: "Essential" },
    { id: "intake", name: "Client intake checklist + recipe template", qty: "1", estCost: "$0–3", notes: "Essential" },
    { id: "scan", name: "Optional scanner for handwritten cards / photos", qty: "1", estCost: "$0–40", notes: "Optional add-on work", optional: true },
    { id: "print", name: "Optional test printer / paper", qty: "as needed", estCost: "$5–15", notes: "Only if offering print-ready", optional: true },
  ],
};

export const DIGITAL_COOKBOOK_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Cover and interior layout — Free plan available", url: "https://www.canva.com/" },
  { id: "docs", name: "Google Docs", freePlanAvailable: true, costNote: "Recipe cleanup before layout", url: "https://docs.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Title, ingredients, steps, servings, notes, photos", url: "https://forms.google.com/" },
  { id: "drive", name: "Google Drive", freePlanAvailable: true, costNote: "Uploads, backups, delivery", url: "https://drive.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Recipe count, quotes, profit", url: "https://sheets.google.com/" },
  { id: "pdf", name: "PDF export / viewer", freePlanAvailable: true, planLabelApplicable: false, costNote: "Client proof and final file" },
  { id: "photo", name: "Basic photo-editing tools", freePlanAvailable: true, planLabelApplicable: false, costNote: "Crop/light cleanup — not professional restoration unless offered" },
  { id: "ai", name: "Optional AI formatting ideas only", freePlanAvailable: true, costNote: "Human review required; no private family files without permission", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Canva + Google Docs + Forms + Drive + Sheets + PDF export + Payment" },
];

export const DIGITAL_COOKBOOK_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DIGITAL COOKBOOK CREATOR — PROJECT PRICING",
    "",
    "Displayed $15 – $50 / project is examples only. Price by recipe count, pages, photos, cleanup, and turnaround.",
    "",
    "GROSS = Base + add-ons + rush + extra revisions.",
    "PROFIT = Gross − software − fees − test prints − storage − ads − other.",
    "",
    "Mini 5–10 recipes: about $35–$75",
    "Small 10–20 recipes: about $75–$150",
    "Medium 20–40 recipes: about $150–$300+",
    "Larger / custom: quote",
    "Add-ons: transcription, photo cleanup, rush, extra revisions, print-ready / other size",
  ].join("\n"),
  raiseTip: "Raise after you know minutes per recipe. Do not guarantee printer results. Examples only.",
  items: [
    { id: "mini", label: "Mini cookbook (5–10 recipes)", price: "$35–$75", notes: "Examples only" },
    { id: "small", label: "Small family cookbook (10–20)", price: "$75–$150", notes: "Examples only" },
    { id: "med", label: "Medium (20–40 recipes)", price: "$150–$300+", notes: "Examples only" },
    { id: "transcribe", label: "Handwritten transcription add-on", price: "Quoted", notes: "Optional" },
    { id: "photo", label: "Photo cleanup add-on", price: "Quoted", notes: "Optional" },
    { id: "print", label: "Print-ready / other size", price: "Quoted", notes: "Optional" },
  ],
};

export const DIGITAL_COOKBOOK_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Define the Cookbook Package", desc: "Write recipe count, expected pages, photos, sections, delivery format (PDF vs print-ready), and revision limit." },
  { title: "Create Client Intake and a Recipe-Submission System", desc: "Open Google Forms from the Tools tab. Fields: title, ingredients, instructions, servings, notes, contributor, photo." },
  { title: "Collect and Organize Recipes, Photos, and Stories", desc: "Named folders before you design. Backup while the project is active." },
  { title: "Review for Gaps — Ask Instead of Guessing", desc: "Missing amounts, unclear steps, duplicates, spelling, photo quality. Do not invent cooking data." },
  { title: "Set Pricing and Confirm Scope in Writing", desc: "Base, add-ons, deadline, revision rounds, deliverables. Open Google Sheets from the Tools tab." },
  { title: "Choose Your Marketing Channels", desc: "Pick only 2 or 3: referrals · family/community groups · reunion planners · genealogy groups · social · event/wedding/memorial contacts (handled respectfully)." },
  { title: "Make Your Marketing Materials", desc: "Open Canva at https://www.canva.com/ — Free plan available. Sample cover/interior using owned or permitted content. Show PDF result and package options." },
  { title: "Carry Out Your Marketing Plan", desc: "Share with warm contacts, post where allowed, quote by recipe/photo count and complexity." },
  { title: "Build the Cookbook", desc: "Cover, title page, sections, recipe pages, photos, notes, page numbers, optional TOC/index." },
  { title: "Proof, Send a Client Proof, Apply Included Revisions, Export Final", desc: "Full pass, client proof, included revisions only, then approved PDF/print-ready. Print specs must match the printer if offered." },
  { title: "Deliver, Archive per Agreement, Track Profit, and Save Templates", desc: "Deliver files, retain only as agreed, record revenue/profit/hours, ask for testimonial/referral. Save non-client templates only." },
];

export function digitalCookbookToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Canva + Google Docs + Forms + Drive + Sheets + PDF export + Payment.",
    "",
    "Do not upload private family recipes to AI without permission. Computers/scanners live on Supplies if physical.",
  ].join("\n");
}

export function computeDigitalCookbookProfit(input: {
  cookbookMiniProjects?: number;
  miniPrice?: number;
  smallProjects?: number;
  smallPrice?: number;
  mediumProjects?: number;
  mediumPrice?: number;
  transcriptionAddOns?: number;
  photoCleanupAddOns?: number;
  printReadyAddOn?: number;
  rushFees?: number;
  extraRevisionFees?: number;
  softwareAssets?: number;
  paymentFees?: number;
  testPrinting?: number;
  storageDelivery?: number;
  advertising?: number;
  otherExpenses?: number;
  laborHours?: number;
  projectsCompleted?: number;
}): {
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerProject: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossServiceRevenue =
    Math.max(0, Number(input.cookbookMiniProjects) || 0) * Math.max(0, Number(input.miniPrice) || 0) +
    Math.max(0, Number(input.smallProjects) || 0) * Math.max(0, Number(input.smallPrice) || 0) +
    Math.max(0, Number(input.mediumProjects) || 0) * Math.max(0, Number(input.mediumPrice) || 0) +
    Math.max(0, Number(input.transcriptionAddOns) || 0) +
    Math.max(0, Number(input.photoCleanupAddOns) || 0) +
    Math.max(0, Number(input.printReadyAddOn) || 0) +
    Math.max(0, Number(input.rushFees) || 0) +
    Math.max(0, Number(input.extraRevisionFees) || 0);
  const totalExpenses =
    Math.max(0, Number(input.softwareAssets) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.testPrinting) || 0) +
    Math.max(0, Number(input.storageDelivery) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const projects = Math.max(0, Number(input.projectsCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerProject: projects > 0 ? estimatedProfit / projects : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
