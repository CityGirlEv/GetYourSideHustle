/**
 * Digital Product Formatter (`digital-product-formatter`, Guide #061).
 * Starter Membership. 3 - 10 hrs/week. Displayed $15 – $50 / project (examples).
 * Plain data only — no imports from guide-tools.
 */

export const DIGITAL_PRODUCT_FORMATTER_REALITY_CHECK = {
  title: "FORMATTING IS NOT UNLIMITED WRITING OR REDESIGN",
  body: [
    "Turn a client’s completed rough draft into a clean, consistent PDF, worksheet, workbook, checklist, lead magnet, or slide deck using an agreed visual style, clear file specifications, licensed assets, version control, and export quality checks.",
    "",
    "Define whether the client is purchasing formatting, light copy cleanup, proofreading, accessibility preparation, editable source files, or full creative direction. Those are different scopes.",
    "",
    "Before quoting confirm: final source text; product type; page/slide count; page size/orientation; brand colors/fonts; images/graphics; links/forms; accessibility expectations; editable source-file delivery; revision rounds; deadline; final formats; rights to all supplied content; price.",
    "",
    "Never promise “fully accessible,” “legally compliant,” “print-ready,” or “platform-approved” unless you have the expertise, specifications, and testing required to support that promise.",
    "",
    "Confirm the client owns or has permission to use all text, images, fonts, templates, logos, and other assets. Do not format plagiarized, pirated, defamatory, fraudulent, or prohibited material. Do not request account passwords. Do not upload confidential content to AI or other third-party tools without written client approval.",
    "",
    "W3C PDF accessibility: https://www.w3.org/WAI/GL/2013/WD-WCAG20-TECHS-20130117/pdf.html",
    "Copyright guidance: https://www.copyright.gov/",
    "",
    "Tagline: Rough Draft In. Polished, Usable File Out.",
  ].join("\n"),
};

export const DIGITAL_PRODUCT_FORMATTER_NOTES_WORKSHEET = `DIGITAL PRODUCT FORMATTER NOTES

BUSINESS SETUP
Project Minimum: $____
Target Hourly Value: $____
Included Revisions: ____
Rush Premium: ____%
Source File Policy: ________
Retention/Deletion Period: ________

CLIENT/PROJECT
Client: ________
Product Type: ________
Audience/Use: ________
Pages/Slides: ____
Size/Orientation: ________
Final Source Received: ☐
Rights Confirmed: ☐
Brand Kit Received: ☐
Accessibility Scope: ________
Deadline: ________

DELIVERABLES
PDF: ☐
Editable Source: ☐
Print File: ☐
Slide Deck: ☐
Other: ________

QA
Text Complete: ☐
Styles Consistent: ☐
Links Tested: ☐
Export Opened: ☐
Accessibility Checks Completed as Scoped: ☐
Final Filename: ________

FINANCIAL
Quoted Price: $____
Asset Costs: $____
Actual Hours: ____
Profit: $____
Review Requested: ☐

GYSH PRO TIP
Approve a small style sample before formatting the whole file. Ten minutes of approval can prevent ten hours of rework.
FINAL TEXT → CLEAR SCOPE → STYLE SAMPLE → FULL FORMAT → EXPORT QA → DELIVERY → REPEAT SERIES.`;

export const DIGITAL_PRODUCT_FORMATTER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Turn a client’s completed rough draft into a clean, consistent PDF, worksheet, workbook, checklist, lead magnet, or slide deck. Tagline: Rough Draft In. Polished, Usable File Out. Category: Digital Services / Document Design. Best for Teens and Adults who are detail-oriented and comfortable with document, design, and presentation software. Beginner to Intermediate · Very Low startup · Flexible / Deadline-Based · Remote / Home Office · Per Page / Per Project / Template Packages / Rush Fees · 3 - 10 hrs/week · Starter Membership. Displayed $15 – $50 / project is examples only.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Computer with reliable internet · Document/design software · PDF viewer · Cloud/file-transfer method · Client intake form · Scope and revision policy · Version-control naming system · Backup plan · Invoice/payment method · Income/expense tracking.",
  },
  {
    id: "skills",
    label: "Skills",
    detail:
      "Consistent typography · Spacing and alignment · Styles/headings · Tables and lists · Page/slide layout · Image placement · Hyperlink checking · Export settings · File organization · Clear client communication.",
  },
  {
    id: "rights",
    label: "Rights, privacy, accessibility",
    detail:
      "Confirm the client owns or has permission to use all text, images, fonts, templates, logos, and other assets. Collect only files needed for the job. Use a client-approved transfer method. Do not request account passwords. Use MFA where available. Delete working files on the agreed schedule. Ask whether tagged PDFs, heading structure, reading order, alt text, document language, contrast, descriptive links, or form labels are in scope. W3C: https://www.w3.org/WAI/GL/2013/WD-WCAG20-TECHS-20130117/pdf.html Copyright: https://www.copyright.gov/",
  },
];

export const DIGITAL_PRODUCT_FORMATTER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Docs", url: "https://docs.google.com/", note: "Structured source text" },
  { label: "Canva", url: "https://www.canva.com/", note: "Layout / design — verify commercial-use terms" },
  { label: "Google Slides", url: "https://slides.google.com/", note: "Slide-deck formatting" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Intake" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Quotes, projects, revenue, expenses" },
  { label: "W3C PDF accessibility", url: "https://www.w3.org/WAI/GL/2013/WD-WCAG20-TECHS-20130117/pdf.html", note: "Only when accessibility is in scope" },
  { label: "U.S. Copyright Office", url: "https://www.copyright.gov/", note: "Rights in supplied content" },
];

export const DIGITAL_PRODUCT_FORMATTER_SUPPLIES = {
  starterKitTotal: "About $0–25 — primarily a digital service; do not buy fonts or stock without client approval",
  items: [
    { id: "computer", name: "Computer", qty: "1 (usually owned)", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Reliable internet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "backup", name: "External drive or approved backup location", qty: "1", estCost: "$0–40", notes: "Core" },
    { id: "checklist", name: "Notebook or digital project checklist", qty: "1", estCost: "$0–5", notes: "Core" },
    { id: "headphones", name: "Headphones for client calls", qty: "1", estCost: "$0–20", notes: "Optional", optional: true },
    { id: "fonts", name: "Licensed fonts (client-approved)", qty: "as needed", estCost: "$0–30", notes: "Do not buy without approval if billed to the project", optional: true },
    { id: "stock", name: "Licensed stock images / icons (client-approved)", qty: "as needed", estCost: "$0–25", notes: "Optional", optional: true },
  ],
};

export const DIGITAL_PRODUCT_FORMATTER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "docs", name: "Google Docs or Microsoft Word", freePlanAvailable: true, costNote: "Structured source text", url: "https://docs.google.com/" },
  { id: "canva", name: "Canva, Adobe InDesign, Affinity Publisher, or similar", freePlanAvailable: true, costNote: "Layout / design — verify commercial-use terms", url: "https://www.canva.com/" },
  { id: "slides", name: "PowerPoint or Google Slides", freePlanAvailable: true, costNote: "Slide-deck formatting", url: "https://slides.google.com/" },
  { id: "pdf", name: "Adobe Acrobat or another PDF tool", freePlanAvailable: true, costNote: "Export review, links, tags, forms where supported", optional: true },
  { id: "drive", name: "Google Drive, Dropbox, OneDrive, or approved transfer", freePlanAvailable: true, costNote: "Client files", url: "https://drive.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Intake", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Quotes, projects, revenue, expenses", url: "https://sheets.google.com/" },
  { id: "contrast", name: "Contrast checker", freePlanAvailable: true, costNote: "Accessibility review when in scope", optional: true },
  { id: "a11y", name: "PDF accessibility checker / screen reader", freePlanAvailable: true, costNote: "Only when accessibility is in scope and you understand the test", optional: true },
  { id: "pwm", name: "Password manager + MFA", freePlanAvailable: true, costNote: "Account protection" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Intake Form + Source-File Folder + Style Sample + Formatting Checklist + Export/Profit Tracker" },
];

export const DIGITAL_PRODUCT_FORMATTER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $15 – $50 / project (examples, not guarantees).",
    "That range fits a small, clean, limited-scope job. Longer products, messy source files, custom design, accessibility work, interactive elements, or rush deadlines should be quoted separately.",
    "",
    "STARTER PACKAGE EXAMPLES",
    "1-Page Checklist/Lead Magnet: $15 – $40",
    "2–5 Page PDF: $30 – $85",
    "6–15 Page Workbook: $75 – $225",
    "10–20 Slide Deck: $75 – $250",
    "Existing File Cleanup: $5 – $15 per page/slide with a project minimum",
    "Template Setup: $50 – $175",
    "",
    "COMMON ADD-ONS — EXAMPLES",
    "Light Proofreading: +$3 – $10 per page",
    "Clickable Table of Contents: +$20 – $60",
    "Fillable Fields: +$5 – $15 per field group/page",
    "Custom Charts/Diagrams: quote separately",
    "Source File: include or price clearly before work",
    "Extra Revision Round: $20 – $75 or hourly",
    "Rush Delivery: +25–50%",
    "Accessibility Preparation/Testing: quote separately based on requirements",
    "",
    "PRICING FORMULA: Estimated Production Hours × Target Hourly Value + Asset/Font Costs + Complexity + Accessibility/Interactive Add-Ons + Rush Premium = Quote.",
    "",
    "MONTHLY EXAMPLES: 4 small projects × $40 = $160 gross/month · 4 workbooks × $125 = $500 gross/month · 2 decks × $175 + 4 small PDFs × $50 = $550 gross/month.",
    "Gross revenue is NOT profit. Do not guarantee earnings.",
  ].join("\n"),
  raiseTip:
    "Quote from source quality, length, and testing — not a one-size project fee. Examples only — not income guarantees.",
  items: [
    { id: "checklist", label: "1-page checklist / lead magnet", price: "$15 – $40" },
    { id: "pdf", label: "2–5 page PDF", price: "$30 – $85" },
    { id: "workbook", label: "6–15 page workbook", price: "$75 – $225" },
    { id: "deck", label: "10–20 slide deck", price: "$75 – $250" },
    { id: "cleanup", label: "Existing file cleanup", price: "$5 – $15 / page or slide", notes: "With a project minimum" },
    { id: "template", label: "Template setup", price: "$50 – $175" },
  ],
};

export const DIGITAL_PRODUCT_FORMATTER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Formatting Offers",
    desc: [
      "Choose 2–4 services: Checklist/Lead Magnet · Workbook/Worksheet · Ebook/PDF Layout · Presentation Deck · Existing-File Cleanup.",
      "For each, list page limits, included formats, revision rounds, source-file policy, and exclusions.",
    ].join("\n"),
  },
  {
    title: "Build Your Intake & File Specification",
    desc: [
      "Collect: client/contact; product type; audience/use; final text status; page/slide count; size/orientation; brand kit; assets and rights confirmation; links/forms; accessibility needs; output formats; deadline.",
      "Formatting cannot rescue an unfinished manuscript without changing the scope.",
    ].join("\n"),
  },
  {
    title: "Create Your Pricing & Revision Rules",
    desc: [
      "Set a project minimum. Estimate hours from source quality, length, design complexity, links, tables, images, forms, and testing.",
      "State: deposit/payment schedule; number of concepts; revision rounds; what counts as a revision; fees for new text/pages or direction changes; rush policy; cancellation policy.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3: freelancer referrals; authors/coaches/course creators; virtual assistants; small-business groups; portfolio website; LinkedIn; approved freelance marketplaces.",
      "Goals: send 10 targeted introductions. Create 3 before/after samples using your own content. Ask 3 service providers for referral partnerships.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create one sample each: checklist · workbook spread · slide deck.",
      "Show: before/after; page count; deliverables; turnaround example; starting price.",
      "Never use client work publicly without written permission. Use dummy or self-created content for early samples.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2 or 3 channels you chose. Send the 10 targeted introductions and ask 3 service providers for referral partnerships.",
      "Track: Date | Prospect | Channel | Product Type | Response | Follow-Up.",
      "Personalize outreach. Honor opt-outs and marketplace rules. Do not mass-spam unfinished-manuscript clients as if formatting will rewrite their book.",
    ].join("\n"),
  },
  {
    title: "Confirm Scope & Organize Source Files",
    desc: [
      "Create a project folder: 00_ADMIN · 01_SOURCE · 02_ASSETS · 03_WORKING · 04_REVIEW · 05_FINAL.",
      "Save the approved source separately. Use filenames such as Client_Project_v01_YYYY-MM-DD.",
      "Confirm that text changes after layout may affect price and deadline.",
    ].join("\n"),
  },
  {
    title: "Build & Approve a Style Sample",
    desc: [
      "Format 1–3 representative pages/slides first.",
      "Confirm: fonts; colors; heading hierarchy; body text; margins; image style; headers/footers; callouts; page numbers.",
      "Get written approval before formatting the full product.",
    ].join("\n"),
  },
  {
    title: "Format the Full Product Consistently",
    desc: [
      "Use paragraph/text styles where possible. Keep spacing consistent. Control widows/orphans where supported. Align repeated elements. Resize/crop images carefully. Build tables and lists for readability. Add links and navigation as scoped.",
      "Do not make unapproved copy changes.",
    ].join("\n"),
  },
  {
    title: "Run Content, Visual & Accessibility QA",
    desc: [
      "Check: all text present; spelling supplied/approved; page/slide order; margins and bleed if applicable; consistent styles; image quality; link function; table of contents; headers/footers; page numbers; reading order/tags/alt text if scoped; file size.",
      "Review the exported file — not only the editor view.",
    ].join("\n"),
  },
  {
    title: "Deliver Files, Get Paid, Archive & Build Repeat Business",
    desc: [
      "Deliver the agreed formats and a short file list. State which file is final. Include source files only if agreed. Confirm successful download/opening. Collect balance.",
      "Record revenue, asset costs, software allocation, payment fees, revisions, and all production/admin time. Profit = Revenue − Expenses. Effective profit/hour = Profit ÷ Total Hours.",
      "Ask for acceptance and a short review. Offer monthly worksheet formatting, slide updates, companion workbooks, template maintenance, or product-series formatting.",
      "Archive or delete files according to the agreement. Keep no unnecessary confidential content. Save reusable non-client-specific process templates.",
    ].join("\n"),
  },
];

export function digitalProductFormatterToolsDisclaimer(): string {
  return "Beginner stack: Intake Form + Source-File Folder + Style Sample + Formatting Checklist + Export/Profit Tracker. Do not purchase fonts, templates, stock assets, or subscriptions without client approval if they will be billed to the project. Vendor prices are estimates — check current terms.";
}

export function computeDigitalProductFormatterProfit(input: {
  dpfSmallProjects?: number;
  dpfAvgSmallPrice?: number;
  dpfLargeProjects?: number;
  dpfAvgLargePrice?: number;
  dpfAddOnRushRevenue?: number;
  dpfOtherRevenue?: number;
  dpfSoftware?: number;
  dpfFontsStock?: number;
  dpfCloudStorage?: number;
  dpfPaymentFees?: number;
  dpfAdvertising?: number;
  dpfContractorHelp?: number;
  dpfOtherExpenses?: number;
  dpfProductionHours?: number;
  dpfRevisionHours?: number;
  dpfAdminMarketingHours?: number;
}): {
  smallRevenue: number;
  largeRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const smallRevenue = n(input.dpfSmallProjects) * n(input.dpfAvgSmallPrice);
  const largeRevenue = n(input.dpfLargeProjects) * n(input.dpfAvgLargePrice);
  const grossServiceRevenue =
    smallRevenue + largeRevenue + n(input.dpfAddOnRushRevenue) + n(input.dpfOtherRevenue);
  const totalExpenses =
    n(input.dpfSoftware) +
    n(input.dpfFontsStock) +
    n(input.dpfCloudStorage) +
    n(input.dpfPaymentFees) +
    n(input.dpfAdvertising) +
    n(input.dpfContractorHelp) +
    n(input.dpfOtherExpenses);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    n(input.dpfProductionHours) + n(input.dpfRevisionHours) + n(input.dpfAdminMarketingHours);
  return {
    smallRevenue,
    largeRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
