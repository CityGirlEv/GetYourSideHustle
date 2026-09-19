/**
 * AI Asset Studio (`ai-assets`, Guide #023).
 * Elite. 8 - 15 hrs/week. Displayed $500 - $5,000/mo (examples).
 * Plain data only — no imports from guide-tools.
 */

export const AI_ASSETS_REALITY_CHECK = {
  title: "“AI-GENERATED” DOES NOT AUTOMATICALLY MEAN EXCLUSIVE, COPYRIGHTABLE, OR CLEARED",
  body: [
    "Tool terms, source rights, human authorship, trademarks, publicity/privacy rights, and client-use requirements are separate questions. Do not promise copyright ownership, trademark clearance, exclusivity, or legal safety that you are not qualified to establish.",
    "",
    "Before accepting a project, define:",
    "- Brand, audience, offer, and required message",
    "- Asset types, dimensions, quantity, and file formats",
    "- Client-supplied logos, fonts, photos, copy, and permissions",
    "- AI tools/models and current commercial-use terms",
    "- Human editing and original contribution",
    "- Prohibited names, marks, characters, people, styles, claims, and content",
    "- Draft, review, and revision rounds",
    "- Source/editable-file delivery",
    "- Client ownership or license language",
    "- Portfolio rights and confidentiality",
    "- Deadline, payment, cancellation, and archival period",
    "",
    "For a logo project, describe early output as concepts—not trademark clearance. Recommend that the client conduct an appropriate clearance search and obtain legal advice when the mark matters commercially.",
    "",
    "Tagline: Human-Directed. Rights-Aware. Ready to Use.",
  ].join("\n"),
};

export const AI_ASSETS_NOTES_WORKSHEET = `AI ASSET STUDIO NOTES

CLIENT BRIEF
Client/Brand: _________________________________
Audience/Offer/CTA: ___________________________
Asset Pack: __________________________________
Quantity/Sizes/Formats: _______________________
Deadline: ____________________________________
Approval Owner: _______________________________

RIGHTS AND INPUTS
Client-Supplied Assets: _______________________
Source/Permission Confirmed: __________________
AI Tool/Plan/Date Checked: ____________________
Licensed Fonts/Stock/Mockups: _________________
Prohibited Elements: __________________________
Client AI Policy: _____________________________
License/Ownership Language: ___________________
Portfolio Permission: Yes / No / Limited

PRODUCTION
Approved Direction: ___________________________
Human Edits Made: _____________________________
Claims Verified By Client: ____________________
Revision Round: ____ of ____
Final Quality Check: Pass / Needs Work

ASSET MANIFEST
Filename: ____________________________________
Dimensions/Format: ____________________________
Source/Tool: __________________________________
Human Contribution: ___________________________
Approval Date: ________________________________
Delivery Link: ________________________________

BUSINESS TRACKER
Prospects Contacted: ____
Briefs Received: ____
Projects Booked: ____
Final Assets Delivered: ____
Invoices Sent: $____
Payments Collected: $____
Expenses: $____
Total Hours: ____
Monthly Profit: $____
Effective Hourly Profit: $____

RED FLAGS — PAUSE OR DECLINE
- Client cannot confirm rights to supplied material
- Request imitates a living artist, protected character, celebrity, or competitor brand
- Client demands guaranteed copyright, trademark clearance, or exclusivity
- Asset makes unsupported health, financial, safety, environmental, or performance claims
- Client wants a fake endorsement, document, product result, or person
- Tool terms do not fit the intended commercial use
- Client refuses an approval checkpoint or provenance record
- Production requires licensed professional review that has not been arranged

GYSH PRO TIP
The defensible product is not “500 images.” It is a small set of client-approved, human-finished assets with known inputs, consistent dimensions, clear usage terms, and a manifest someone else can understand six months later.

STARTER CHALLENGE
Create one fictional five-asset social pack today. Save the brief, tool/date, source list, human edits, filenames, dimensions, and final contact sheet. That organized case study is more valuable than a folder of unexplained generations.`;

export const AI_ASSETS_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Create polished AI-assisted brand graphics, ad concepts, social kits, packaging mockups, and campaign variations for clients. Begin with a written brief, use tools and source materials under terms that permit the intended use, add meaningful human selection and editing, screen for obvious intellectual-property and likeness risks, and deliver a documented package with an asset manifest instead of a mystery folder of generated files. Tagline: Human-Directed. Rights-Aware. Ready to Use. Category: AI / Creative. Best for visual creators who can combine AI-assisted ideation with human art direction, editing, quality control, and organized client delivery. Intermediate · Less than $100 startup · Project-Based / Campaign Deadlines / Recurring Content Packs · Online · Asset Pack / Campaign Kit / Monthly Creative Retainer / Licensed Add-On · Elite · 8 - 15 hrs/week · Displayed $500 - $5,000/mo (examples, not guarantees).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Design/layout fundamentals and close visual review · Reliable computer and internet · AI image/text tool whose current terms fit the project · Image editor or layout tool · Written creative brief and brand-asset intake · Provenance/asset manifest · Scope, revision, license, approval, and delivery templates · Secure storage and backup · Invoice/payment and profit tracker.",
  },
  {
    id: "rights",
    label: "Rights and inputs",
    detail:
      "Confirm rights to every client-supplied logo, photo, font, illustration, product image, testimonial, claim, voice, likeness, and dataset used. Keep a record of the source and permission; “found online” is not a license. Do not prompt for a living artist’s exact style, recognizable copyrighted character, celebrity, competitor logo, deceptive endorsement, real person without authorization, or prohibited/sensitive content. Reject outputs with imitation marks, unreadable text, distorted products, unsafe instructions, biased stereotypes, false before/after results, or fabricated proof. If the client may seek U.S. copyright registration, flag AI-generated material and the human-authored contributions for the client.",
  },
  {
    id: "do-not-promise",
    label: "Do not promise",
    detail:
      "Do not promise automatic copyright, trademark clearance, exclusivity, or legal safety. AI product terms, model availability, training/data controls, commercial-use provisions, indemnity, and output restrictions change — capture the tool, plan, and date checked for each commercial project. A USPTO database search is one part of trademark clearance, not a legal opinion or guarantee.",
  },
];

export const AI_ASSETS_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "U.S. Copyright Office AI Initiative", url: "https://www.copyright.gov/ai/", note: "Human vs AI-generated material guidance" },
  { label: "Copyright Registration Guidance for AI-Generated Material", url: "https://www.copyright.gov/ai/ai_policy_guidance.pdf" },
  { label: "USPTO Trademark Search", url: "https://www.uspto.gov/trademarks/search" },
  { label: "USPTO Why Search for Similar Trademarks", url: "https://www.uspto.gov/trademarks/basics/why-search-similar-trademarks" },
  { label: "FTC Advertising and Marketing Basics", url: "https://www.ftc.gov/business-guidance/advertising-marketing" },
  { label: "IRS Self-Employed Individuals Tax Center", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
];

export const AI_ASSETS_SUPPLIES = {
  starterKitTotal:
    "About $0–100 if you already own a computer — budget for AI/design subscriptions and licensed inputs per project, not bulk gear upfront",
  items: [
    { id: "computer", name: "Computer and calibrated-enough display", qty: "1", estCost: "$0 (usually owned)", notes: "Essential" },
    { id: "ai-tool", name: "AI generation tool under reviewed current terms", qty: "1 subscription", estCost: "Varies", notes: "Core — verify commercial-use terms per project" },
    { id: "editor", name: "Image/vector/layout editor", qty: "1", estCost: "$0–55/mo", notes: "Core" },
    { id: "brief", name: "Brand brief and client asset folder", qty: "1 system", estCost: "$0", notes: "Core" },
    { id: "license-records", name: "Licensed font, stock, and mockup records", qty: "1 log", estCost: "Per project", notes: "Core" },
    { id: "manifest", name: "Asset manifest and approval sheet", qty: "1 template", estCost: "$0", notes: "Core" },
    { id: "export", name: "Export, naming, delivery, and archive system", qty: "1", estCost: "$0", notes: "Core" },
    { id: "contracts", name: "Contract, invoice, and profit tracker", qty: "1", estCost: "$0", notes: "Core" },
    { id: "prompt-log", name: "Prompt/concept log", qty: "1", estCost: "$0", notes: "Helpful where useful", optional: true },
    { id: "tablet", name: "Drawing tablet", qty: "1", estCost: "$40–200+", notes: "Helpful", optional: true },
    { id: "contrast", name: "Color/contrast accessibility checker", qty: "1", estCost: "$0–20", notes: "Helpful", optional: true },
    { id: "bg-remove", name: "Background-removal and upscaling tools", qty: "1", estCost: "$0–20/mo", notes: "Helpful", optional: true },
    { id: "review-platform", name: "Cloud review platform", qty: "1", estCost: "$0–30/mo", notes: "Helpful", optional: true },
    { id: "backup", name: "External backup drive", qty: "1", estCost: "$25–80", notes: "Helpful", optional: true },
    { id: "print-specs", name: "Professional printer/vendor specifications for print work", qty: "1", estCost: "$0", notes: "Helpful for print projects", optional: true },
  ],
};

export const AI_ASSETS_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "adobe", name: "Adobe / Canva / Affinity / Figma", freePlanAvailable: true, costNote: "Human editing and layout under current license terms" },
  { id: "ai-client", name: "Client-Approved AI Image/Text Tool", freePlanAvailable: true, costNote: "Ideation and generation under current model and plan terms — capture tool, plan, and date checked" },
  { id: "copyright-ai", name: "U.S. Copyright Office AI Initiative", freePlanAvailable: true, costNote: "Human-authored vs AI-generated material guidance", url: "https://www.copyright.gov/ai/" },
  { id: "copyright-pdf", name: "Copyright Registration Guidance for AI-Generated Material", freePlanAvailable: true, costNote: "Registration guidance PDF", url: "https://www.copyright.gov/ai/ai_policy_guidance.pdf" },
  { id: "uspto-search", name: "USPTO Trademark Search", freePlanAvailable: true, costNote: "One part of clearance — not a legal opinion", url: "https://www.uspto.gov/trademarks/search" },
  { id: "uspto-why", name: "USPTO Why Search for Similar Trademarks", freePlanAvailable: true, costNote: "Likelihood-of-confusion basics", url: "https://www.uspto.gov/trademarks/basics/why-search-similar-trademarks" },
  { id: "ftc", name: "FTC Advertising and Marketing Basics", freePlanAvailable: true, costNote: "Truthful claims and disclosures", url: "https://www.ftc.gov/business-guidance/advertising-marketing" },
  { id: "irs", name: "IRS Self-Employed Individuals Tax Center", freePlanAvailable: true, costNote: "Income and expense recordkeeping", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "One Client Niche + One Five-Asset Pack + Written Brief + Approved Source Materials + Human Edit + Asset Manifest + One Revision + Organized Delivery" },
];

export const AI_ASSETS_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $500 - $5,000/mo (examples, not guarantees).",
    "The displayed range describes possible monthly gross revenue—not a starter-project price. Quote by deliverables, rounds, source files, usage, risk, and production time.",
    "",
    "STARTER ASSET PACK",
    "$75 – $250+",
    "Three to five coordinated social or promotional assets from one approved direction, standard sizes, one revision round, and a simple manifest.",
    "",
    "CAMPAIGN CREATIVE KIT",
    "$300 – $1,000+",
    "Multiple concepts and formats for one campaign, including human editing, copy variants, organized exports, approval sheet, and defined usage.",
    "",
    "BRAND OR PACKAGING CONCEPT KIT",
    "$500 – $2,000+",
    "Moodboard, several concept directions, selected refinements, and mockups. This is concept/design work, not trademark clearance, print engineering, regulatory approval, or a guarantee of registrable rights.",
    "",
    "MONTHLY CREATIVE RETAINER",
    "$500 – $5,000+ per month",
    "A fixed volume of recurring assets, planning time, revision limits, turnaround, file types, and meeting cadence. Capacity and expertise determine the realistic level.",
    "",
    "POSSIBLE ADD-ONS",
    "- Additional size, platform, or concept direction",
    "- Copywriting",
    "- Licensed stock, font, or mockup purchase",
    "- Editable/source files",
    "- Rush delivery",
    "- Extra revision round",
    "- Print-vendor coordination",
    "- Localization by a qualified reviewer",
    "- Human illustrator/designer subcontractor",
    "",
    "PRICING FORMULA: Brief/Research + Concept Development + Human Editing + Production/Exports + Revisions + Licensed Inputs + Rights/Risk Review + Add-Ons = Quote.",
    "Never sell “unlimited assets” without a strict request, complexity, and capacity definition.",
    "",
    "MONTHLY EXAMPLES — NOT GUARANTEES",
    "4 starter packs × $125 = $500 gross/month",
    "2 campaign kits × $750 = $1,500 gross/month",
    "Two $1,000 retainers + one $750 kit = $2,750 gross/month",
    "",
    "Gross revenue is NOT profit. Subtract AI/design subscriptions, stock/fonts, hardware, storage, payment fees, contractors, refunds, insurance, professional review, and taxes.",
  ].join("\n"),
  raiseTip:
    "Raise prices after a few smooth deliveries with documented manifests. Displayed $500 - $5,000/mo is examples only — not income guarantees.",
  items: [
    { id: "starter", label: "Starter asset pack", price: "$75 – $250+", notes: "3–5 coordinated assets, one revision, simple manifest" },
    { id: "campaign", label: "Campaign creative kit", price: "$300 – $1,000+", notes: "Multiple concepts and formats for one campaign" },
    { id: "brand", label: "Brand or packaging concept kit", price: "$500 – $2,000+", notes: "Concept work — not trademark clearance" },
    { id: "retainer", label: "Monthly creative retainer", price: "$500 – $5,000+/mo", notes: "Fixed volume with defined revision limits" },
  ],
};

export const AI_ASSETS_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose One Client Niche and Asset Pack",
    desc: [
      "Select a specific use such as restaurant social promos, realtor listing graphics, service-business ad concepts, ecommerce launch visuals, or event kits.",
      "Avoid highly regulated claims or technical packaging until qualified.",
      "Write one sentence: I create human-edited [PACK] for [CLIENT TYPE].",
    ].join("\n"),
  },
  {
    title: "Define the Deliverable, Rights, and Price",
    desc: [
      "List concepts, final assets, dimensions, formats, copy, source files, revisions, turnaround, intended channels, license/ownership language, portfolio permission, and exclusions.",
      "State what is concept work vs final production. Do not promise trademark clearance or automatic copyright.",
    ].join("\n"),
  },
  {
    title: "Build the Brief and Provenance System",
    desc: [
      "Create fields for brand voice, audience, offer, CTA, visual references, forbidden elements, client-supplied materials, source/permission, AI tool/plan/date, human edits, approvals, and final filenames.",
      "Every asset should trace back to approved inputs and a checked tool date.",
    ].join("\n"),
  },
  {
    title: "Create Three Honest Portfolio Samples",
    desc: [
      "Use your own fictional brands or fully authorized materials. Label concept work as concept work.",
      "Show the brief, coordinated assets, detail quality, dimensions, and delivery organization—not just one attractive generated image.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3: warm referrals; local businesses; creative partners; professional networks; portfolio platforms; direct outreach.",
      "Set measurable goals such as: show samples to 5 prospects; send 10 personalized introductions; request 3 referral introductions.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Write a niche promise, exact pack contents, process, turnaround, starting price, and CTA.",
      "Sample line: “I create human-edited [ASSET PACK] for [CLIENT TYPE]. The $____ package includes [DELIVERABLES], one revision, an asset manifest, and organized exports.”",
      "Do not market “copyright guaranteed,” “trademark-safe,” “100% unique,” or “unlimited” unless a qualified process truly supports the statement.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2 or 3 channels you chose.",
      "☐ Warm contacts — share portfolio samples with suitable businesses.",
      "☐ Send personalized outreach with a clear pack offer.",
      "☐ Request referral introductions from creative partners.",
      "Track: Date | Prospect | Channel | Response | Brief Sent | Follow-Up.",
      "Honor opt-outs. Do not scrape contact lists or add people without permission.",
    ].join("\n"),
  },
  {
    title: "Qualify the Client and Inputs",
    desc: [
      "Verify the business/contact, intended use, audience, claims, required formats, deadline, source materials, permissions, brand restrictions, AI policy, confidentiality, and approval owner.",
      "Refuse impersonation, counterfeit, deceptive, exploitative, or infringing requests.",
    ].join("\n"),
  },
  {
    title: "Develop Directions and Get Approval",
    desc: [
      "Research the client’s market without copying competitors. Create a moodboard or written direction, generate/select rough concepts, remove obvious failures, and present a small number of distinct routes with limitations clearly labeled.",
    ].join("\n"),
  },
  {
    title: "Human-Edit and Production-Check",
    desc: [
      "Correct composition, anatomy, products, hands, text, logos, lighting, color, contrast, crop safety, and factual copy.",
      "Rebuild key text and brand elements with normal design tools. Check every required size at actual viewing scale.",
    ].join("\n"),
  },
  {
    title: "Deliver with Manifest, Close & Rebook",
    desc: [
      "Provide approved finals, clear filenames, formats, dimensions, color notes, licensed-input references, AI/tool disclosure where agreed or required, usage terms, editable files if purchased, and a preview/contact sheet. Keep client approval in writing.",
      "Confirm acceptance, invoice and collect payment, archive/delete by agreement, record total hours and direct costs, and note which assets required rework.",
      "Offer the next specific pack or retainer—never automatic “unlimited” production.",
      "Pattern: BRIEF → RIGHTS CHECK → CONCEPTS → APPROVAL → HUMAN EDIT → MANIFEST → DELIVERY.",
    ].join("\n"),
  },
];

export function aiAssetsToolsDisclaimer(): string {
  return "Beginner stack: One Client Niche + One Five-Asset Pack + Written Brief + Approved Source Materials + Human Edit + Asset Manifest + One Revision + Organized Delivery. Capture AI tool, plan, and date checked for each commercial project. Do not promise automatic copyright, trademark clearance, exclusivity, or legal safety.";
}

/** Example: 4 × $150 + $900 other = $1,500 revenue; $250 expenses; $1,250 profit; 55 hours → $22.73/hr */
export function computeAiAssetsProfit(input: {
  aaStarterPacks?: number;
  aaAvgStarterFee?: number;
  aaCampaignKitRevenue?: number;
  aaRetainerRevenue?: number;
  aaAddOnRevenue?: number;
  aaOtherRevenue?: number;
  aaAiDesignSubscriptions?: number;
  aaLicensedInputs?: number;
  aaStorageHardware?: number;
  aaContractorsReview?: number;
  aaPaymentFeesRefunds?: number;
  aaInsuranceOther?: number;
  aaBriefResearchHours?: number;
  aaGenerationConceptHours?: number;
  aaHumanEditExportHours?: number;
  aaRevisionAdminMarketingHours?: number;
  aaFinalAssetsDelivered?: number;
}): {
  starterPackRevenue: number;
  totalCollectedRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
  revenuePerAsset: number | null;
  revisionRatePercent: number | null;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const starterPackRevenue = n(input.aaStarterPacks) * n(input.aaAvgStarterFee);
  const totalCollectedRevenue =
    starterPackRevenue +
    n(input.aaCampaignKitRevenue) +
    n(input.aaRetainerRevenue) +
    n(input.aaAddOnRevenue) +
    n(input.aaOtherRevenue);
  const totalExpenses =
    n(input.aaAiDesignSubscriptions) +
    n(input.aaLicensedInputs) +
    n(input.aaStorageHardware) +
    n(input.aaContractorsReview) +
    n(input.aaPaymentFeesRefunds) +
    n(input.aaInsuranceOther);
  const estimatedProfit = totalCollectedRevenue - totalExpenses;
  const totalHours =
    n(input.aaBriefResearchHours) +
    n(input.aaGenerationConceptHours) +
    n(input.aaHumanEditExportHours) +
    n(input.aaRevisionAdminMarketingHours);
  const finalAssets = n(input.aaFinalAssetsDelivered);
  const revisionHours = n(input.aaRevisionAdminMarketingHours);
  return {
    starterPackRevenue,
    totalCollectedRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: totalCollectedRevenue > 0 ? (estimatedProfit / totalCollectedRevenue) * 100 : 0,
    revenuePerAsset: finalAssets > 0 ? totalCollectedRevenue / finalAssets : null,
    revisionRatePercent: totalHours > 0 ? (revisionHours / totalHours) * 100 : null,
  };
}
