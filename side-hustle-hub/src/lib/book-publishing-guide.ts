/**
 * Book Publishing (`book-publishing`, Guide #037).
 * Publishing is a business, not just an upload.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const BOOK_PUBLISHING_REALITY_CHECK = {
  title: "PUBLISHING IS A BUSINESS, NOT JUST AN UPLOAD",
  body: [
    "WRITE → EDIT → PACKAGE → PUBLISH → DISTRIBUTE → MARKET → MEASURE → IMPROVE.",
    "",
    "Use only content and assets you own or have permission/license to publish.",
    "The publisher remains responsible for accuracy, originality, rights, required AI disclosures, and platform rules.",
    "",
    "Never guarantee bestseller status, bookstore placement, reviews, rankings, or income.",
    "“Available to bookstores” does not mean bookstores will stock the book.",
    "",
    "Verify current KDP, IngramSpark, retailer, and audiobook rules when you use this guide. Do not hard-code changing fees or royalty rates.",
    "",
    "Tagline: Write It. Publish It. Put It in Readers’ Hands.",
  ].join("\n"),
};

export const BOOK_PUBLISHING_NOTES_WORKSHEET = `MY BOOK PUBLISHING DASHBOARD

BOOK
Title / working title: __________
Subtitle: __________
Author / pen name: __________
Genre / topic: __________
Ideal reader: __________
Launch date: __________

FORMATS
☐ Ebook  ☐ Paperback  ☐ Hardcover  ☐ Audiobook

MANUSCRIPT CHECKLIST
☐ Draft  ☐ Self-edit  ☐ Outside review  ☐ Proof  ☐ Final

RIGHTS
Text: __________
Images / fonts / quotes: __________
Audio: __________
Contributors: __________
AI disclosures if required: __________

FORMAT TRACKER
Format | Platform | ISBN/Identifier | Price | File | Status
__________
__________
__________

KDP
Metadata: __________
Files: __________
Preview: __________
Pricing: __________
Published: ☐ Yes ☐ Not yet

INGRAMSPARK
Distribution goal: __________
ISBN: __________
Metadata: __________
Files: __________
Wholesale / discount: __________
Returns status / risk: __________
Proof: __________
Distribution: __________

AUDIOBOOK
Narrator / method: __________
Rights: __________
QC: __________
Distributor: __________

MARKETING CHANNELS (2–3)
1. ________
2. ________
3. ________

LAUNCH KIT
☐ Cover image  ☐ One-line hook  ☐ Short/long descriptions
☐ Author bio/photo  ☐ 5 graphics  ☐ 3 short-video ideas
☐ 5 captions  ☐ Email announcement  ☐ Retailer links
☐ Permitted excerpt  ☐ Media sheet if useful

MONTHLY REVIEW
Ebook units: ____  Paperback: ____  Hardcover: ____  Audio: ____
Revenue: $____
Expenses: $____
Profit: $____
Best channel / format: __________
Next action: __________

GYSH PRO TIP
The publish button takes minutes. The business is:
QUALITY MANUSCRIPT → PROFESSIONAL PACKAGE → ACCURATE METADATA → SMART DISTRIBUTION → CONSISTENT MARKETING → READER RELATIONSHIPS → NEXT BOOK.
A catalog of good books can become more powerful than depending on one title forever.

PRO CHALLENGE
Build a complete publishing dashboard for one title: positioning, reader profile, manuscript checklist, rights tracker, format/ISBN plan, KDP checklist, IngramSpark checklist, audiobook decision, launch kit, 30-day marketing calendar, profit tracker, next-book/catalog plan.

FINAL QUALITY GATE
☐ Manuscript final  ☐ Proofread  ☐ Rights confirmed
☐ Cover / interior / metadata / pricing correct
☐ Preview / proof checked  ☐ Links checked
☐ Distribution understood  ☐ Marketing ready`;

export const BOOK_PUBLISHING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Take a book from manuscript through editing, formatting, cover, metadata, print/ebook publishing, distribution, optional audiobook, marketing, and sales review using KDP/IngramSpark as appropriate. Tagline: Write It. Publish It. Put It in Readers’ Hands. Category: Digital / Publishing. Best for Adults, Seniors / Retirees; experienced Teens only with guardian-approved accounts/business arrangements. Beginner–Intermediate · Low–Moderate startup · Online/Home · Royalties / Direct Sales / Author Business · Pro Membership · 4 - 12 weeks · Displayed earnings: $200 - $8,000 / month (examples).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Manuscript or idea · Computer / internet · Word processor · Editing / proof process · Cover and formatting plan · Author / publisher information · Required tax / payment info · Rights records · Marketing plan.",
  },
  {
    id: "decide",
    label: "Decide before you publish",
    detail:
      "Book type · Audience · Formats (ebook / paperback / hardcover / audiobook) · Author / pen name · Imprint if applicable · Primary platform · Distribution plan · Launch date.",
  },
  {
    id: "terms",
    label: "Terms to know",
    detail:
      "ISBN: a unique identifier for a specific book format. Print formats such as paperback and hardcover generally need separate ISBNs when ISBNs are used; a platform-provided ISBN may have restrictions. Metadata: title, subtitle, author, description, categories, keywords, and other listing data. POD: print-on-demand — copies print as ordered. Proof: a check copy before you go live. Royalty / publisher compensation: money actually received after current platform/printing/distribution terms — not list price. Different formats can require different files, identifiers, pricing, and rules. Verify current platform requirements when you use this guide.",
  },
  {
    id: "teens",
    label: "For experienced teens",
    detail:
      "Guardian-approved accounts, tax/payment setup, and business arrangements only. Do not create publishing or tax accounts without a parent/guardian.",
  },
];

export const BOOK_PUBLISHING_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Amazon KDP", url: "https://kdp.amazon.com/", note: "Ebook, paperback, and hardcover subject to current rules" },
  { label: "Kindle Create", url: "https://kdp.amazon.com/en_US/help/topic/G202187680", note: "Formatting where suitable" },
  { label: "IngramSpark", url: "https://www.ingramspark.com/", note: "Wider print distribution when appropriate" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Manuscript and checklists" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Sales, expenses, and profit tracker" },
  { label: "Canva", url: "https://www.canva.com/", note: "Covers and marketing graphics where suitable" },
];

export const BOOK_PUBLISHING_SUPPLIES = {
  starterKitTotal: "About $15–80 for proofs and records (software and services are Tools)",
  items: [
    { id: "computer", name: "Computer", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "manuscript", name: "Manuscript files", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Internet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "docs", name: "Word / Docs files", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "edit", name: "Editing checklist", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "files", name: "Cover / interior files", qty: "1 set", estCost: "$0", notes: "Essential — licensed or original" },
    { id: "bio", name: "Author bio / photo if desired", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "desc", name: "Description + metadata worksheet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "accounts", name: "Publishing accounts + tax/payment info", qty: "1", estCost: "$0", notes: "Essential — verify current requirements" },
    { id: "rights", name: "Rights / license records", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "proof", name: "Proof copies", qty: "1–2", estCost: "$8–25", notes: "Helpful", optional: true },
    { id: "isbn", name: "ISBN records if used", qty: "1+", estCost: "Varies", notes: "Helpful — do not hard-code current fees", optional: true },
    { id: "editor", name: "Editor / proofreader", qty: "1", estCost: "Varies", notes: "Helpful", optional: true },
    { id: "cover-pro", name: "Cover designer", qty: "1", estCost: "Varies", notes: "Helpful", optional: true },
    { id: "formatter", name: "Formatter", qty: "1", estCost: "Varies", notes: "Helpful", optional: true },
    { id: "arc", name: "ARC plan", qty: "1", estCost: "$0", notes: "Helpful — honest readers only", optional: true },
    { id: "site", name: "Author website / email list", qty: "1", estCost: "$0+", notes: "Helpful", optional: true },
    { id: "audio", name: "Audiobook production materials (optional)", qty: "1", estCost: "Varies", notes: "Final manuscript, audio rights, narration plan, QC checklist", optional: true },
  ],
};

export const BOOK_PUBLISHING_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "bp_docs",
    name: "Google Docs / Microsoft Word",
    freePlanAvailable: true,
    costNote: "Writing, self-edit, and manuscript versions",
    url: "https://docs.google.com/",
  },
  {
    id: "bp_proof",
    name: "Proofing tools",
    freePlanAvailable: true,
    costNote: "Spellcheck plus a human proof pass — do not publish the rough first draft",
  },
  {
    id: "bp_kindle_create",
    name: "Kindle Create",
    freePlanAvailable: true,
    costNote: "Formatting where suitable — verify current KDP file rules",
    url: "https://kdp.amazon.com/en_US/help/topic/G202187680",
    optional: true,
  },
  {
    id: "bp_formatter",
    name: "Professional formatting software / service",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "EPUB validation where appropriate; print interiors need format-specific files",
    optional: true,
  },
  {
    id: "bp_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Covers and marketing graphics where suitable — licensed/original assets only",
    url: "https://www.canva.com/",
  },
  {
    id: "bp_kdp",
    name: "Amazon KDP",
    freePlanAvailable: true,
    costNote: "Ebook, paperback, and hardcover subject to current rules/territories — use current calculators",
    url: "https://kdp.amazon.com/",
  },
  {
    id: "bp_ingram",
    name: "IngramSpark",
    freePlanAvailable: true,
    costNote: "Wider print distribution when appropriate — review current ISBN, wholesale, and return terms",
    url: "https://www.ingramspark.com/",
    optional: true,
  },
  {
    id: "bp_sheets",
    name: "Sheets / Excel",
    freePlanAvailable: true,
    costNote: "Units, actual compensation, expenses, profit — not list price alone",
    url: "https://sheets.google.com/",
  },
  {
    id: "bp_audio",
    name: "Audiobook production / distribution",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Use a reputable service compatible with rights, territory, and current AI/synthetic-voice rules",
    optional: true,
  },
  {
    id: "bp_stack",
    name: "Pro Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote:
      "Manuscript + Editing/Proof + Professional Cover + Format-Specific Files + KDP/IngramSpark as appropriate + Metadata + Proof + Marketing Tracker",
  },
];

export const BOOK_PUBLISHING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $200 – $8,000+ / month (examples — not guaranteed).",
    "",
    "BOOK PRICING STARTER FRAMEWORK — choose the final price only after checking current retailer rules, comparable books, length/value, genre expectations, and current royalty/compensation terms.",
    "",
    "PRICE FOR PROFIT, NOT JUST SALES.",
    "For every format calculate: actual revenue/compensation received per sale − print/production − distribution/platform costs − advertising allocation − fulfillment/shipping − returns/refunds where applicable = contribution toward profit.",
    "Then account for editing, cover, formatting, audiobook production, software, ISBN/administrative costs where applicable, and other business expenses.",
    "",
    "Do NOT simply copy another author's price.",
    "Do NOT calculate profit from list price alone.",
    "Do NOT hard-code KDP, IngramSpark, audiobook, retailer, printing, or royalty rates that can change.",
    "Use current platform calculators and terms when this guide is used.",
    "",
    "MONTHLY EARNING SCENARIOS — EXAMPLES ONLY (not typical-income claims or promises):",
    "Starter Author: $200 – $500/month",
    "Growing Catalog: $500 – $2,000/month",
    "Established Niche/Catalog: $2,000 – $5,000/month",
    "Strong Catalog + Multiple Formats/Channels: $5,000 – $8,000+/month",
  ].join("\n"),
  raiseTip:
    "Price for profit, not just sales. Displayed $200 – $8,000+ / month is example only. Use current platform calculators. Examples only — not income guarantees.",
  items: [
    { id: "ebook", label: "Ebook list-price planning range", price: "$2.99 – $9.99+", notes: "Check current retailer rules, comps, length/value, genre, and compensation terms" },
    { id: "paper", label: "Paperback planning range", price: "$9.99 – $24.99+", notes: "Must cover current printing/distribution costs and leave an acceptable contribution per sale" },
    { id: "hard", label: "Hardcover planning range", price: "$19.99 – $39.99+", notes: "Check manufacturing cost, page count, trim, color, distribution, and market expectations" },
    { id: "specialty", label: "Specialty / workbook / premium book", price: "$14.99 – $49.99+", notes: "Depends on format, page count, production cost, niche, and value" },
    { id: "audio", label: "Audiobook", price: "Do not use one fixed price", notes: "Retail pricing/compensation can depend on distributor, length, sales model, territory, and current terms" },
    { id: "direct", label: "Direct sales", price: "Often higher per copy after costs", notes: "Include printing, shipping, payment processing, fulfillment, taxes, returns, and event costs" },
  ],
};

/** Exactly 11 authored core steps. Marketing stages = steps 8–10. Use ☐ only. */
export const BOOK_PUBLISHING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define the Book, Reader & Goal",
    desc: [
      "Record:",
      "Title / working title: __________",
      "Genre / topic: __________",
      "Ideal reader: __________",
      "Reader benefit / experience: __________",
      "Formats: ☐ Ebook ☐ Paperback ☐ Hardcover ☐ Audiobook",
      "Launch goal: __________",
      "",
      "Create one-sentence positioning: __________",
      "",
      "Research comparable books for positioning, pricing, covers, reader language, and gaps — never copy protected material.",
    ].join("\n"),
  },
  {
    title: "Finish, Edit & Proof",
    desc: [
      "DRAFT → SELF-EDIT → STRUCTURAL/CONTENT REVIEW → COPY/LINE EDIT AS NEEDED → PROOFREAD → FINAL.",
      "",
      "Check:",
      "☐ Organization / story",
      "☐ Repetition",
      "☐ Grammar",
      "☐ Facts",
      "☐ Permissions",
      "☐ Names / dates",
      "☐ Front / back matter",
      "☐ Links",
      "☐ Bio / CTA",
      "",
      "Verify high-stakes nonfiction claims appropriately.",
      "Do not publish the rough first draft merely because you can.",
    ].join("\n"),
  },
  {
    title: "Create Format, ISBN & Rights Plan",
    desc: [
      "Choose: ebook / paperback / hardcover / audiobook.",
      "",
      "Track: Format | Platform | ISBN/Identifier | Price | File | Launch Date",
      "",
      "Print formats such as paperback and hardcover generally need separate ISBNs when ISBNs are used. A platform-provided ISBN may have restrictions.",
      "",
      "Track: copyright owner · imprint · territory rights · images/fonts · contributor agreements · audio rights · required AI disclosures.",
      "",
      "Different formats can require different files, identifiers, pricing, and rules. Verify current platform requirements.",
    ].join("\n"),
  },
  {
    title: "Format Interior & Cover",
    desc: [
      "Print: trim, margins, bleed if applicable, typography, chapter styles, page elements, front/back matter.",
      "",
      "Ebook: create a supported clean digital file appropriate to the content. Text-heavy books commonly use reflowable formatting.",
      "",
      "Cover: professional, genre-appropriate, thumbnail-readable, licensed/original assets, exact format dimensions.",
      "Print cover may require front / spine / back.",
      "",
      "Do not blindly reuse one file across formats.",
    ].join("\n"),
  },
  {
    title: "Set Up KDP & Amazon Formats",
    desc: [
      "Follow CURRENT KDP requirements (https://kdp.amazon.com/):",
      "account/tax/payment setup → title/details → metadata → rights/territories → manuscript → cover → preview → corrections → pricing → final review → publish.",
      "",
      "KDP supports ebook, paperback, and hardcover subject to current rules/territories.",
      "Keep title/author metadata consistent across formats where appropriate.",
      "Never skip preview.",
      "",
      "Do not hard-code royalty or printing rates — use the current KDP calculators.",
    ].join("\n"),
  },
  {
    title: "Set Up IngramSpark / Wider Distribution",
    desc: [
      "Choose the purpose: wider print distribution, bookstore/library availability, additional retailers, and/or POD.",
      "",
      "Review CURRENT IngramSpark (https://www.ingramspark.com/) file/ISBN requirements, metadata, wholesale pricing/discount, return status/risk, market pricing, dates, and territories. Order proofs.",
      "",
      "“Available to bookstores” does NOT guarantee stocking.",
      "Flag return and wholesale settings before you enable them — returns can erase profit.",
      "",
      "If using KDP + IngramSpark, coordinate ISBN, metadata, files, pricing, and distribution settings carefully so the same format is not competing with itself.",
    ].join("\n"),
  },
  {
    title: "Build Optional Audiobook",
    desc: [
      "After the text is final, choose author narration, a hired narrator, or another approved production method.",
      "",
      "Prepare: narration manuscript · pronunciation/voice notes · file plan · audio rights · agreements · cover · QC.",
      "",
      "Check CURRENT technical and AI/synthetic-voice rules before you record or generate audio.",
      "",
      "Listen to the complete final audio for omissions, repeats, pronunciation, noise, volume, order, naming, and credits.",
      "",
      "Do not delay a ready print/ebook solely because audio is unfinished.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way readers hear about the book.",
      "",
      "Pick only 2 or 3 this launch.",
      "",
      "Possible channels:",
      "☐ Email list",
      "☐ Author Facebook",
      "☐ Instagram",
      "☐ TikTok / BookTok if the audience fits",
      "☐ YouTube",
      "☐ Appropriate reader communities",
      "☐ Local events / book clubs",
      "☐ Libraries / community organizations",
      "☐ Podcasts / media",
      "☐ Author site / blog",
      "☐ Tested paid ads",
      "☐ Niche communities",
      "",
      "Write ONE measurable goal for each channel.",
      "",
      "No spam, fake reviews, or fake followers.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a launch kit:",
      "☐ Cover image",
      "☐ One-line hook",
      "☐ Short and long descriptions",
      "☐ Author bio / photo",
      "☐ 5 graphics",
      "☐ 3 short-video ideas",
      "☐ 5 captions",
      "☐ Email announcement",
      "☐ Retailer links",
      "☐ Permitted excerpt / sample",
      "☐ Media sheet if useful",
      "",
      "Messaging: WHO IT’S FOR → WHY THEY CARE → WHAT THEY GET/EXPERIENCE → WHERE TO BUY.",
      "",
      "Never fabricate testimonials or reviews.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY the 2 or 3 channels selected.",
      "",
      "Prelaunch: build interest, prepare content, arrange legitimate advance readers, verify links/files/pricing.",
      "Launch: email/post/share approved excerpts, respond, promote events.",
      "After: continue useful content, invite honest reviews without controlling them, refresh winners, test one change at a time.",
      "",
      "Track: Date | Channel | Content | Spend | Interest/Clicks | Attributable Sales | Notes",
      "",
      "No fake reviews, fake followers, or paid “guaranteed ranking” schemes.",
    ].join("\n"),
  },
  {
    title: "Review Sales, Profit & Build the Catalog",
    desc: [
      "Monthly review:",
      "Units by format · revenue/compensation actually received · print costs · ads · returns/refunds · production costs · profit · best channel/format · reader feedback · available traffic/conversion data.",
      "",
      "KEEP → IMPROVE → TEST → STOP.",
      "",
      "Next moves: metadata/cover/description improvements · audiobook · additional format · companion product · next book/series · email list · direct sales · speaking/workshops.",
      "",
      "ONE BOOK → READER DATA → BETTER MARKETING → NEXT BOOK → CATALOG → REPEAT READERS.",
    ].join("\n"),
  },
];

export function bookPublishingToolsDisclaimer(): string {
  return "Pro stack: Manuscript + Editing/Proof + Professional Cover + Format-Specific Files + KDP/IngramSpark as appropriate + Metadata + Proof + Marketing Tracker. Verify current platform rules, file specs, and compensation terms when you use this guide. Do not hard-code changing fees or royalties. Experienced teens: guardian-approved accounts only.";
}

/** Monthly book-publishing profit math. Use actual compensation per unit, not list price. */
export function computeBookPublishingProfit(input: {
  ebookUnits?: number;
  ebookRevPerUnit?: number;
  paperbackUnits?: number;
  paperbackRevPerUnit?: number;
  hardcoverUnits?: number;
  hardcoverRevPerUnit?: number;
  audiobookUnits?: number;
  audiobookRevPerUnit?: number;
  directOtherRevenue?: number;
  ads?: number;
  editing?: number;
  cover?: number;
  formatting?: number;
  audio?: number;
  proofs?: number;
  shipping?: number;
  returnsRefunds?: number;
  software?: number;
  otherExpenses?: number;
  unrecoveredProductionCost?: number;
  avgProfitContributionPerSale?: number;
}): {
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  marginPercent: number;
  breakEvenUnits: number | null;
} {
  const monthlyRevenue =
    Math.max(0, Number(input.ebookUnits) || 0) * Math.max(0, Number(input.ebookRevPerUnit) || 0) +
    Math.max(0, Number(input.paperbackUnits) || 0) * Math.max(0, Number(input.paperbackRevPerUnit) || 0) +
    Math.max(0, Number(input.hardcoverUnits) || 0) * Math.max(0, Number(input.hardcoverRevPerUnit) || 0) +
    Math.max(0, Number(input.audiobookUnits) || 0) * Math.max(0, Number(input.audiobookRevPerUnit) || 0) +
    Math.max(0, Number(input.directOtherRevenue) || 0);
  const monthlyExpenses =
    Math.max(0, Number(input.ads) || 0) +
    Math.max(0, Number(input.editing) || 0) +
    Math.max(0, Number(input.cover) || 0) +
    Math.max(0, Number(input.formatting) || 0) +
    Math.max(0, Number(input.audio) || 0) +
    Math.max(0, Number(input.proofs) || 0) +
    Math.max(0, Number(input.shipping) || 0) +
    Math.max(0, Number(input.returnsRefunds) || 0) +
    Math.max(0, Number(input.software) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const contribution = Math.max(0, Number(input.avgProfitContributionPerSale) || 0);
  const unrecovered = Math.max(0, Number(input.unrecoveredProductionCost) || 0);
  return {
    monthlyRevenue,
    monthlyExpenses,
    monthlyProfit,
    marginPercent: monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0,
    breakEvenUnits: contribution > 0 ? unrecovered / contribution : null,
  };
}
