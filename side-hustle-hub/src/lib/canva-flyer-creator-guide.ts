/**
 * Canva Flyer Creator (`canva-flyer-creator`, Guide #043).
 * Beginner Canva design for flyers, signs, and simple graphics — not branding/web/prepress.
 * Plain data only (no imports from guide-tools).
 */

export const CANVA_FLYER_REALITY_CHECK = {
  title: "PROOF THE TEXT — REVENUE IS NOT PROFIT",
  body: [
    "This is a beginner-friendly Canva design service: event and community flyers, yard-sale signs, social graphics, menus/price lists, announcements, fundraisers, printable signs, and simple business promotions.",
    "It is not advanced branding, websites, or professional prepress unless you are qualified.",
    "",
    "GROSS REVENUE = simple + standard + detailed projects + extra sizes / social versions + recurring packages + add-ons + rush + extra revisions.",
    "ESTIMATED PROFIT = Gross − software/assets − ads − payment fees − printing/proofs − contractors − other.",
    "",
    "Customer approves factual details (names, dates, times, locations, phone, URLs, QR codes) before you call a file final.",
    "Include 1–2 revision rounds in the quote; charge extra if your policy says so.",
    "Use permitted assets only. Do not copy another designer. Do not use unauthorized logos, characters, or artwork.",
    "AI can draft headlines or CTAs — you still review, fact-check, personalize, get customer approval, then deliver.",
    "Do not invent licensing rules or promise print results from every outside printer.",
    "",
    "Tagline: Design It. Proof It. Deliver the Files.",
  ].join("\n"),
};

export const CANVA_FLYER_NOTES_WORKSHEET = `MY CANVA FLYER CREATOR PLAN

CLIENT / ORGANIZATION
Client: ________
Organization: ________
Project: ________
Type: flyer / sign / social / menu / other: ________
Deadline: ________

PROJECT DETAILS
Exact text: ________
Date / time / location: ________
Phone / email / website / social: ________
QR / URL (tested): ________
Colors: ________
Logo: ________
Photos: ________
Style: ________
Size: ________
Print / digital: ________
Instructions: ________

QUOTE / PAYMENT
Quote: $____
Included revisions: ____
Actual revisions: ____
Payment: $____
Format: ________
Delivery: ________

RESULTS
Revenue: $____
Expenses: $____
Hours (design / revision / admin): ____
Profit: $____
Profit per hour: $____
Review: ☐
Repeat opportunity: ________
Notes: ________
`;

export const CANVA_FLYER_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Design simple flyers, yard-sale signs, and event graphics in Canva for neighbors and small groups. 3 - 10 hrs/week. Displayed $15 – $50 / project is examples only, not a guarantee. Tagline: Design It. Proof It. Deliver the Files.",
  },
  {
    id: "skills",
    label: "Basic Canva and readable design",
    detail:
      "You can place text, change fonts/colors, export PDF/PNG, and keep copy readable from a few feet away. Proofread every name, date, time, location, and URL.",
  },
  {
    id: "device",
    label: "Device, internet, and file organization",
    detail:
      "Computer or tablet, reliable internet, phone for customer messages, and a folder system for drafts, proofs, and finals.",
  },
  {
    id: "permissions",
    label: "Asset permissions",
    detail:
      "Only use fonts, photos, logos, and graphics you have rights to use. Customer supplies their logo/photos. Verify current Canva commercial-use terms — they can change.",
  },
  {
    id: "youth",
    label: "Parent / guardian for minors",
    detail:
      "Younger designers need adult help for accounts, payments, public posts, and customer contact.",
  },
];

export const CANVA_FLYER_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Design — verify current commercial-use terms" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Drafts and delivery" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Client intake" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Exact copy before design" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Projects, payments, profit" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Deadlines" },
];

export const CANVA_FLYER_SUPPLIES = {
  starterKitTotal: "About $0–25 if you already have a computer — start with equipment you own",
  items: [
    { id: "computer", name: "Computer or tablet that can run Canva", qty: "1 (usually already owned)", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Reliable internet", qty: "1 connection", estCost: "$0", notes: "Essential" },
    { id: "phone", name: "Phone for approvals and delivery messages", qty: "1 (usually already owned)", estCost: "$0", notes: "Essential" },
    { id: "notes", name: "Notebook or digital intake notes", qty: "1", estCost: "$0–5", notes: "Essential — exact text, sizes, deadline" },
    { id: "mouse", name: "Optional mouse or stylus", qty: "1", estCost: "$0 if owned", notes: "Optional", optional: true },
    { id: "monitor", name: "Optional second monitor", qty: "1", estCost: "$0 if owned", notes: "Optional", optional: true },
    { id: "printer", name: "Optional test printer / paper / ink", qty: "1", estCost: "$0–15", notes: "Optional proofs — library or print shop avoids ink cost", optional: true },
    { id: "backup", name: "Optional backup copies (Drive / USB)", qty: "1", estCost: "$0–8", notes: "Optional", optional: true },
  ],
};

export const CANVA_FLYER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Flyer, sign, and social-graphic design — verify commercial-use rights for assets",
    url: "https://www.canva.com/",
  },
  {
    id: "drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Store editable sources and deliver finals",
    url: "https://drive.google.com/",
  },
  {
    id: "forms",
    name: "Google Forms",
    freePlanAvailable: true,
    costNote: "Intake: purpose, exact text, sizes, deadline",
    url: "https://forms.google.com/",
  },
  {
    id: "google_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Lock exact copy before you design — sign in with Google, or use an account you already have",
    url: "https://accounts.google.com/ServiceLogin?continue=https://docs.google.com/",
  },
  {
    id: "sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Projects, payments, hours, and profit",
    url: "https://sheets.google.com/",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Proof and delivery deadlines",
    url: "https://calendar.google.com/",
  },
  {
    id: "qr",
    name: "QR code tool (Canva Elements or generator)",
    freePlanAvailable: true,
    costNote: "Test every QR before delivery",
    url: "https://www.qr-code-generator.com/",
    optional: true,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    freePlanAvailable: true,
    costNote: "Headline / CTA / copy drafts only — human review, fact-check, customer approval",
    url: "https://chatgpt.com/",
    optional: true,
  },
  {
    id: "email",
    name: "Email / messaging",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Proofs, approvals, and delivery",
  },
  {
    id: "payments",
    name: "Payment provider",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Collect the design fee — not the client’s event budget",
  },
  {
    id: "beginner-stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Canva + Drive + Forms + Docs + Sheets + Calendar + Payment",
  },
];

export const CANVA_FLYER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "CANVA FLYER CREATOR — PRICING EXAMPLES",
    "",
    "Displayed earning potential: $15 – $50 / project (examples only).",
    "",
    "GROSS = simple + standard + detailed + extra sizes / social versions + recurring packages + add-ons + rush + extra revisions.",
    "PROFIT = Gross − software/assets − ads − fees − printing/proofs − contractors − other.",
    "REVENUE is not PROFIT.",
    "",
    "Include 1–2 revision rounds. Extra rounds are extra if your policy says so.",
    "Not advanced branding, websites, or prepress unless you are qualified.",
    "",
    "Simple design: about $15–$30",
    "Standard flyer: about $30–$50",
    "Detailed design: about $50–$75+",
    "Flyer + social version: about $40–$75+",
    "1 flyer + 2–3 resized graphics: about $60–$100+",
    "Recurring 4 simple graphics / month: about $100–$250+",
    "",
    "Add-ons: extra sizes, extra revisions, rush, social formats, QR placement, additional page.",
  ].join("\n"),
  raiseTip:
    "Charge more for extra sizes, rush, extra pages, or recurring packages. Displayed $15 – $50 / project is examples only — not income guarantees.",
  items: [
    { id: "simple", label: "Simple design", price: "$15–$30", notes: "Examples only" },
    { id: "standard", label: "Standard flyer", price: "$30–$50", notes: "Examples only" },
    { id: "detailed", label: "Detailed design", price: "$50–$75+", notes: "Examples only" },
    { id: "social", label: "Flyer + social version", price: "$40–$75+", notes: "Examples only" },
    { id: "pack", label: "1 flyer + 2–3 resized graphics", price: "$60–$100+", notes: "Examples only" },
    { id: "recurring", label: "4 simple graphics / month", price: "$100–$250+", notes: "Examples only" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ only. */
export const CANVA_FLYER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose the Graphics You Will Offer",
    desc: [
      "Write a short menu so neighbors and small groups know what you design.",
      "",
      "Typical work:",
      "☐ Event / community flyers",
      "☐ Yard-sale or lost-item signs",
      "☐ Social graphics",
      "☐ Menus / price lists",
      "☐ Announcements / fundraisers",
      "☐ Printable signs / simple promotions",
      "",
      "Write what you will NOT do (advanced branding, websites, copying a Disney character, or last-minute same-hour delivery unless you charge rush).",
    ].join("\n"),
  },
  {
    title: "Practice Canva Until You Can Export Clean Files",
    desc: [
      "Open Canva from the Tools tab (https://www.canva.com/). Practice placing a headline, body text, a simple icon, and a footer with contact info.",
      "Learn PDF Print vs PNG. Keep fonts readable from about 6 feet away on a flyer.",
      "Younger designers: a parent/guardian creates the account.",
    ].join("\n"),
  },
  {
    title: "Create Sample Designs (No Real Client Details)",
    desc: [
      "Make 2–4 samples with fictional names, fake phone numbers, and a made-up venue.",
      "Show 2–3 styles so buyers can point at a direction.",
      "Save editable copies in Google Drive (Tools tab).",
      "Do not use copyrighted characters, team logos, or another designer’s layout.",
    ].join("\n"),
  },
  {
    title: "Set Packages, Revision Policy, and Turnaround",
    desc: [
      "Open Google Sheets from the Tools tab. Write simple / standard / detailed prices and what is included: size, print vs digital, number of versions, included revision rounds, and turnaround.",
      "State extra-revision and rush fees before you start.",
      "REVENUE is not PROFIT — track software, ads, fees, and proofs.",
    ].join("\n"),
  },
  {
    title: "Create Intake and Get Approval of Factual Details",
    desc: [
      "Open Google Forms or Google Docs from the Tools tab.",
      "",
      "Collect:",
      "☐ Customer / organization",
      "☐ Project and purpose",
      "☐ Exact text",
      "☐ Date / time / location",
      "☐ Phone / email / website / social",
      "☐ QR / URL (you will test it)",
      "☐ Colors, logo, photos, style, size",
      "☐ Print vs digital and deadline",
      "",
      "Customer approves factual details before you treat a proof as final. Workflow: REQUEST → SCOPE → CONTENT → QUOTE → DESIGN → PROOF → REVIEW → REVISE → FINAL APPROVAL → PAYMENT → DELIVER.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "You need neighbors, clubs, and small groups that need a flyer. Pick only 2 or 3 channels at first.",
      "",
      "Beginner options:",
      "☐ Friends / family referrals",
      "☐ Parent-approved local / community groups",
      "☐ Schools, churches, and clubs (with permission)",
      "☐ Party vendors / printers for referrals",
      "☐ Portfolio posts (no private client details)",
      "",
      "Write ONE measurable goal per channel.",
      "Examples:",
      "- Tell 10 trusted people this week.",
      "- Share one sample (fake phone) in one approved group.",
      "- Ask 2 local organizers if they need a flyer designer.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "Sign in at the link or use an account you already have.",
      "Search Templates for a Flyer (US Letter) or A4 flyer you can customize as a SAMPLE (fake names — no real client details).",
      "",
      "Create:",
      "☐ A one-page service menu and prices",
      "☐ 2–3 sample flyers (fictional details)",
      "☐ What is included / not included (revisions, file types)",
      "☐ How clients send copy and pay you",
      "",
      "Sample:",
      "“I design flyers and simple graphics in Canva. Simple design $____ · standard flyer $____. Extra sizes and rush available.”",
      "",
      "Do not post a real client’s home address or private phone on your public sample.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Do the 2–3 channels you chose.",
      "",
      "This week:",
      "☐ Share the menu with your referral list",
      "☐ Post one sample (no private details) where allowed",
      "☐ Ask one happy client or organizer for a referral",
      "",
      "Track yes / maybe / no. Younger helpers: a parent/guardian manages public posts.",
    ].join("\n"),
  },
  {
    title: "Design, Proof, and Handle Revisions",
    desc: [
      "Duplicate a licensed template or your sample. Place the customer’s exact wording. Keep contrast high.",
      "If they need a QR, add it and test the URL on your phone before you send the proof.",
      "Stay inside included revision rounds. Extra rounds are an extra fee you quoted.",
      "ChatGPT drafts are optional — you still review, fact-check, and get customer approval.",
    ].join("\n"),
  },
  {
    title: "Get Final Approval, Payment, and Delivery",
    desc: [
      "Require written approval of the final proof.",
      "Export the formats they asked for (often PDF Print + PNG). Keep an editable source in Drive.",
      "Collect the quoted fee. Give a simple receipt.",
      "Do not publicly post logos, addresses, or phone numbers without permission.",
    ].join("\n"),
  },
  {
    title: "Track Profit, Reviews, and Repeat Clients",
    desc: [
      "Open Google Sheets. Log revenue, expenses, design / revision / admin hours, and profit per total hour.",
      "Ask for a short review and whether they need monthly graphics.",
      "Examples only — not income guarantees.",
    ].join("\n"),
  },
];

export function canvaFlyerToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Canva + Drive + Forms + Docs + Sheets + Calendar + Payment.",
    "",
    "Printers, paper, and ink are Supplies if you test-print. Canva terms and asset licenses can change — check current commercial-use rules. AI drafts still need human review and customer approval.",
  ].join("\n");
}

export function computeCanvaFlyerProfit(input: {
  canvaFlyerSimpleProjects?: number;
  simplePrice?: number;
  standardProjects?: number;
  standardPrice?: number;
  detailedProjects?: number;
  detailedPrice?: number;
  socialPackRevenue?: number;
  recurringRevenue?: number;
  addOnRevenue?: number;
  softwareAssets?: number;
  advertising?: number;
  paymentFees?: number;
  printingProofs?: number;
  contractors?: number;
  otherExpenses?: number;
  laborHours?: number;
  projectsCompleted?: number;
}): {
  grossRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerProject: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossRevenue =
    Math.max(0, Number(input.canvaFlyerSimpleProjects) || 0) * Math.max(0, Number(input.simplePrice) || 0) +
    Math.max(0, Number(input.standardProjects) || 0) * Math.max(0, Number(input.standardPrice) || 0) +
    Math.max(0, Number(input.detailedProjects) || 0) * Math.max(0, Number(input.detailedPrice) || 0) +
    Math.max(0, Number(input.socialPackRevenue) || 0) +
    Math.max(0, Number(input.recurringRevenue) || 0) +
    Math.max(0, Number(input.addOnRevenue) || 0);
  const totalExpenses =
    Math.max(0, Number(input.softwareAssets) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.printingProofs) || 0) +
    Math.max(0, Number(input.contractors) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossRevenue - totalExpenses;
  const projects = Math.max(0, Number(input.projectsCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerProject: projects > 0 ? estimatedProfit / projects : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0,
  };
}
