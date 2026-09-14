/**
 * Proofreader (`proofreader`, Guide #096).
 * Proofreading / light clarity — not rewriting or doing schoolwork. Plain data only.
 */

export const PROOFREADER_REALITY_CHECK = {
  title: "PRESERVE THE WRITER’S VOICE — DO NOT DO THE ASSIGNMENT",
  body: [
    "Clients pay you to catch errors and, if contracted, make limited clarity edits without changing meaning.",
    "PROOFREADING = spelling, grammar, punctuation, capitalization, obvious consistency/typos.",
    "LIGHT CLARITY EDITING = limited wording improvements without replacing the author’s ideas.",
    "Do not quietly turn a proofread into a rewrite.",
    "",
    "GROSS = project/hourly fees + rush + extra revisions. PROFIT = Gross − software − fees − ads − printing − subcontracting − other.",
    "",
    "School papers: only within allowed assistance rules. Do not write arguments, complete tests, fabricate citations, or produce graded work.",
    "Never guarantee a grade, publication, or error-free outcome.",
    "Keep documents confidential. Do not upload sensitive files to AI without permission. Human review required if you use checkers.",
    "You are not a legal/medical/financial advisor unless qualified.",
    "",
    "Tagline: Catch the Typos. Keep Their Voice.",
  ].join("\n"),
};

export const PROOFREADER_NOTES_WORKSHEET = `MY PROOFREADER PLAN

CLIENT
Name: ________  Contact: ________  Org/class: ________  Confidentiality: ________

PROJECT
Type: ________  Word count: ____  Pages: ____  Audience: ________
Format: ________  Deadline: ________
Service: Proofreading | Light clarity  Style notes: ________

QUOTE
Base: $____  Rush: $____  Extra revision: $____  Total: $____  Paid: $____

PROOFING CHECK
Spelling / grammar / punctuation / caps / consistency / formatting: ☐
Names / dates / numbers / links: ☐  Clarity flags: ________
Second pass / read-aloud: ☐

DELIVERY
Track Changes / Suggesting: ☐  Clean copy: ☐  Questions flagged: ☐
Revision included: ☐  Delivered: ☐  Approved: ☐

RESULTS
Revenue: $____  Expenses: $____  Profit: $____  Time: ____  Profit/hour: $____
Repeat: ☐  Testimonial: ☐
`;

export const PROOFREADER_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this hustle is", detail: "Catch typos and clarity issues in flyers, blogs, school papers, and small-business copy. 3 - 10 hrs/week. $15 – $50 / project is examples only." },
  { id: "integrity", label: "Academic integrity and confidentiality", detail: "Support learning; do not complete graded work. Keep files private. Define retention." },
];

export const PROOFREADER_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Google Docs", url: "https://docs.google.com/", note: "Suggesting mode" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Secure file exchange" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Intake" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Projects and payments" },
];

export const PROOFREADER_SUPPLIES = {
  starterKitTotal: "About $0–20 — digital service",
  items: [
    { id: "computer", name: "Computer / tablet + internet", qty: "1", estCost: "$0 if owned", notes: "Essential" },
    { id: "checklist", name: "Notebook or digital proofreading checklist", qty: "1", estCost: "$3–8", notes: "Essential" },
    { id: "backup", name: "Secure file storage / backup", qty: "1", estCost: "$0–12", notes: "Essential" },
    { id: "headphones", name: "Optional headphones for read-aloud", qty: "1", estCost: "$0–15", notes: "Optional", optional: true },
    { id: "print", name: "Optional printer / paper for paper proofing", qty: "as needed", estCost: "$5–10", notes: "Optional", optional: true },
  ],
};

export const PROOFREADER_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "docs", name: "Google Docs Suggesting (or Word Track Changes)", freePlanAvailable: true, costNote: "Show edits; preserve voice", url: "https://docs.google.com/" },
  { id: "checker", name: "Spelling / grammar checker (second pass only)", freePlanAvailable: true, planLabelApplicable: false, costNote: "Human review required" },
  { id: "readaloud", name: "Read-aloud / text-to-speech", freePlanAvailable: true, planLabelApplicable: false, costNote: "Catch missed errors" },
  { id: "drive", name: "Google Drive", freePlanAvailable: true, costNote: "Secure exchange", url: "https://drive.google.com/" },
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Deadlines", url: "https://calendar.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Word count, service, deadline, confidentiality", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Quotes and profit", url: "https://sheets.google.com/" },
  { id: "dict", name: "Dictionary / style reference", freePlanAvailable: true, planLabelApplicable: false, costNote: "Consistency" },
  { id: "ai", name: "Optional AI assistant", freePlanAvailable: true, costNote: "Only with permission, privacy review, and human check", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Docs Suggesting + Drive + Forms + Sheets + Calendar + Checker + Read-aloud + Payment" },
];

export const PROOFREADER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "PROOFREADER — PROJECT / WORD / HOUR PRICING",
    "",
    "Displayed $15 – $50 / project is examples only.",
    "GROSS = fees + rush + extra revisions. PROFIT = Gross − software − fees − ads − printing − subcontracting − other.",
    "",
    "Short flyer/post/email/menu: about $10–$25",
    "Short document/blog: about $20–$50",
    "Longer project: about $40–$100+",
    "Hourly: about $20–$50+/hour",
  ].join("\n"),
  raiseTip: "Price error density and turnaround. Proofreading is not rewriting. Examples only.",
  items: [
    { id: "short", label: "Short flyer / post / email / menu", price: "$10–$25", notes: "Examples only" },
    { id: "std", label: "Short document / blog", price: "$20–$50", notes: "Examples only" },
    { id: "long", label: "Longer document", price: "$40–$100+", notes: "Examples only" },
    { id: "hour", label: "Hourly proofreading / light edit", price: "$20–$50+ / hour", notes: "Examples only" },
    { id: "rush", label: "Rush / extra revision", price: "Quoted", notes: "Optional" },
  ],
};

export const PROOFREADER_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Define Services, Document Types, Turnaround, and Exclusions", desc: "Proofreading vs light clarity. What you will not do (rewrites, academic cheating, guaranteed grades)." },
  { title: "Practice on Sample Content and Write a Checklist", desc: "Spelling, grammar, punctuation, consistency, formatting, names/numbers, second pass." },
  { title: "Set Pricing and Rush / Revision Rules", desc: "Project, word, page, or hourly. Open Google Sheets. Examples only on Suggested Pricing." },
  { title: "Create Client Intake", desc: "Type, word/page count, audience, service, style, deadline, format, confidentiality. Open Google Forms." },
  { title: "Choose Your Marketing Channels", desc: "Pick only 2 or 3: referrals · local small businesses · community groups · writers · LinkedIn · parent-approved networks." },
  { title: "Make Your Marketing Materials", desc: "Service description and a before/after using owned or permitted content only. No client text without permission." },
  { title: "Carry Out Your Marketing Plan", desc: "Warm leads, permitted posts, quote with scope, deadline, and price." },
  { title: "First Pass for Meaning, Then Systematic Proof", desc: "Context first, then spelling/grammar/punctuation/consistency. Flag questions; do not invent facts." },
  { title: "Mark Changes in Suggesting / Track Changes", desc: "Preserve voice. Open Google Docs from the Tools tab." },
  { title: "Second Pass / Read-Aloud, Deliver, Included Revisions, Collect Payment", desc: "Deliver agreed files, explain queries, included revisions only." },
  { title: "Record Time, Profit, Repeat Clients, and Improve the Checklist", desc: "Revenue, expenses, profit per hour. Testimonial/referral. Improve pricing from actual time." },
];

export function proofreaderToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Docs Suggesting + Drive + Forms + Sheets + Calendar + Checker + Read-aloud + Payment.",
    "",
    "Checkers and AI miss errors and can change meaning. Human review is required. Do not complete students’ graded work.",
  ].join("\n");
}

export function computeProofreaderProfit(input: {
  proofreadingShortProjects?: number;
  shortPrice?: number;
  standardProjects?: number;
  standardPrice?: number;
  longProjects?: number;
  longPrice?: number;
  hourlyHours?: number;
  hourlyRate?: number;
  rushFees?: number;
  extraRevisionFees?: number;
  softwareTools?: number;
  paymentFees?: number;
  advertising?: number;
  printing?: number;
  subcontracting?: number;
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
    Math.max(0, Number(input.proofreadingShortProjects) || 0) * Math.max(0, Number(input.shortPrice) || 0) +
    Math.max(0, Number(input.standardProjects) || 0) * Math.max(0, Number(input.standardPrice) || 0) +
    Math.max(0, Number(input.longProjects) || 0) * Math.max(0, Number(input.longPrice) || 0) +
    Math.max(0, Number(input.hourlyHours) || 0) * Math.max(0, Number(input.hourlyRate) || 0) +
    Math.max(0, Number(input.rushFees) || 0) +
    Math.max(0, Number(input.extraRevisionFees) || 0);
  const totalExpenses =
    Math.max(0, Number(input.softwareTools) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.printing) || 0) +
    Math.max(0, Number(input.subcontracting) || 0) +
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
