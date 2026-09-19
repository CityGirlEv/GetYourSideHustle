/**
 * Flipping Properties (`flipping-properties`, Guide #070).
 * Elite Membership. 15 - 30 hrs/week (project-based). Deal-dependent (examples only).
 * Plain data only — no imports from guide-tools.
 */

export const FLIPPING_PROPERTIES_REALITY_CHECK = {
  title: "PROFIT IS MADE OR LOST BEFORE THE PURCHASE",
  body: [
    "Find, renovate, and resell residential properties using disciplined deal sourcing, conservative after-repair value, a complete rehab budget, legal compliance, contractor coordination, and a written exit strategy instead of treating the project like gambling.",
    "",
    "A low purchase price does not make a good flip.",
    "",
    "The real all-in cost may include: purchase price and closing costs; financing points, interest, appraisal, and lender fees; title, survey, inspection, insurance, and legal expenses; permits, design, labor, materials, dumpsters, utilities, security, and lawn/snow care; lead, asbestos, mold, radon, underground tank, septic, structural, flood, or other specialist work; taxes, HOA/condo charges, code fines, and holding costs; agent commissions, buyer concessions, staging, transfer taxes, and resale closing costs; contingency for unknown conditions and schedule delays.",
    "",
    "Do not buy from a spreadsheet alone. Confirm title, lawful access, condition, financing, insurance, permits, contractor availability, local resale demand, and at least one backup exit.",
    "",
    "Licensing, wholesaling/assignment, disclosure, permit, contractor, landlord, and tax rules vary by state and locality. This guide is education, not legal, tax, construction, brokerage, lending, or investment advice. Verify the exact project with qualified local professionals before signing or advertising an interest in a property.",
    "",
    "Never use money needed for housing, food, healthcare, taxes, or emergencies. Never represent yourself as a licensed broker, contractor, appraiser, inspector, or attorney unless properly qualified.",
    "",
    "Tagline: Buy With Margin. Renovate With Control. Exit With Evidence.",
  ].join("\n"),
};

export const FLIPPING_PROPERTIES_NOTES_WORKSHEET = `FLIPPING PROPERTIES NOTES

MY BUY BOX
Area: __________
Property Type: __________
Price Range: __________
Maximum Repair Level: __________
Primary Exit: __________
Backup Exit: __________
Available Cash: $____
Required Reserve: $____

DEAL SCREEN
Property: __________
Source: __________
Owner/Parcel Verified: ☐ Yes
Lawful Access: ☐ Yes
Title Reviewed: ☐ Yes
Inspection Complete: ☐ Yes
Environmental/Lead Review: ☐ Yes
Permits/Licenses Checked: ☐ Yes
Insurance Confirmed: ☐ Yes
Supported ARV: $____
Maximum Purchase Price: $____
Walk-Away Trigger: __________

PROJECT CONTROL
Contractor: __________
Scope Locked: ☐
Permit Status: __________
Budget-to-Actual: __________
Change Orders: __________

EXIT / RESULTS
Gross Sale / Assignment: $____
Total Project Cost: $____
Estimated Pre-Tax Profit: $____
Project Months: ____
Lessons: __________

GYSH PRO TIP
Buy with margin. Renovate with control. Exit with evidence.
BUY BOX → DUE DILIGENCE → MAXIMUM PRICE → CONTROLLED REHAB → DOCUMENTED EXIT.`;

export const FLIPPING_PROPERTIES_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Find, renovate, and resell residential properties using disciplined deal sourcing, conservative ARV, a complete rehab budget, legal compliance, contractor coordination, and a written exit strategy. Tagline: Buy With Margin. Renovate With Control. Exit With Evidence. Category: Real Estate. Best for Adults, Seniors / Retirees with project-management skill, risk capital, and a qualified local team. Advanced · Over $1,000 startup · Project-Based / Deadline-Driven · Local / On-Site · Deal-Dependent / Resale or Lawful Assignment · 15 - 30 hrs/week (project-based) · Elite Membership. Displayed pricing is deal-dependent (examples only — not guarantees).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Adult legal capacity to contract · Documented risk capital and reserves · Financing preapproval or verified cash plan · Local real-estate attorney or title/escrow professional · Licensed real-estate professional where appropriate · Qualified inspector and contractors · Insurance agent familiar with vacant/renovation property · Bookkeeping and job-cost system · Conservative deal-analysis skill · Time to manage bids, permits, inspections, draws, changes, and resale.",
  },
  {
    id: "before-offer",
    label: "Before making an offer",
    detail:
      "Verify ownership and title path; zoning and permitted use; inspection/access rights; contractor and permit requirements; lead-safe and environmental obligations; insurance availability; financing terms and carrying-cost exposure; seller and buyer disclosure duties; rules governing wholesaling, assignments, marketing equitable interests, or acting for others; tax treatment with a qualified tax professional.",
  },
  {
    id: "not-advice",
    label: "Education, not professional advice",
    detail:
      "This guide is not legal, tax, construction, brokerage, lending, or investment advice. Never use money needed for housing, food, healthcare, taxes, or emergencies. Never represent yourself as a licensed broker, contractor, appraiser, inspector, or attorney unless properly qualified.",
  },
];

export const FLIPPING_PROPERTIES_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "EPA Lead RRP program", url: "https://www.epa.gov/lead/lead-renovation-repair-and-painting-program", note: "Lead-safe renovation obligations" },
  { label: "EPA lead disclosure for real estate", url: "https://www.epa.gov/lead/renovation-repair-and-painting-program-real-estate-agents", note: "Disclosure duties" },
  { label: "HUD Fair Housing", url: "https://www.hud.gov/fairhousing", note: "Advertising and occupancy rules" },
  { label: "IRS small business", url: "https://www.irs.gov/businesses/small-businesses-self-employed", note: "Tax treatment with a qualified professional" },
  { label: "FEMA Flood Map Service Center", url: "https://msc.fema.gov/portal/home", note: "Flood-zone research" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Deal analysis and job-cost tracker" },
];

export const FLIPPING_PROPERTIES_SUPPLIES = {
  starterKitTotal:
    "About $15–40 for due-diligence tools — do not buy renovation materials or staging before closing and confirming lawful scope",
  items: [
    { id: "laptop", name: "Laptop / phone", qty: "1 (usually owned)", estCost: "$0", notes: "Due diligence" },
    { id: "sheet", name: "Deal-analysis spreadsheet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "tape", name: "Measuring tape or laser measure", qty: "1", estCost: "$8–15", notes: "Due diligence" },
    { id: "flashlight", name: "Flashlight", qty: "1", estCost: "$5–12", notes: "Due diligence" },
    { id: "camera", name: "Camera / phone for permitted documentation", qty: "1", estCost: "$0", notes: "Due diligence" },
    { id: "checklist", name: "Notebook and inspection checklist", qty: "1", estCost: "$3–8", notes: "Due diligence" },
    { id: "ppe", name: "Work boots and basic PPE for lawful site visits", qty: "1 set", estCost: "$0–40", notes: "Due diligence" },
    { id: "scope", name: "Written scope of work / bid-comparison / change-order forms", qty: "1 set", estCost: "$0–5", notes: "Project control" },
    { id: "calendar", name: "Permit and inspection calendar", qty: "1", estCost: "$0", notes: "Project control" },
  ],
};

export const FLIPPING_PROPERTIES_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "sheets", name: "Google Sheets or Excel", freePlanAvailable: true, costNote: "Deal analysis and job-cost tracker", url: "https://sheets.google.com/" },
  { id: "calendar", name: "Calendar / task board", freePlanAvailable: true, costNote: "Permits, inspections, draws", url: "https://calendar.google.com/" },
  { id: "photos", name: "Cloud photo folder", freePlanAvailable: true, costNote: "Jobsite photo log", url: "https://drive.google.com/" },
  { id: "fema", name: "FEMA flood maps", freePlanAvailable: true, planLabelApplicable: false, costNote: "Flood-zone research", url: "https://msc.fema.gov/portal/home" },
  { id: "epa", name: "EPA Lead RRP information", freePlanAvailable: true, planLabelApplicable: false, costNote: "Lead-safe renovation", url: "https://www.epa.gov/lead/lead-renovation-repair-and-painting-program" },
  { id: "hud", name: "HUD Fair Housing", freePlanAvailable: true, planLabelApplicable: false, costNote: "Advertising and occupancy", url: "https://www.hud.gov/fairhousing" },
  { id: "irs", name: "IRS small-business information", freePlanAvailable: true, planLabelApplicable: false, costNote: "Ask a qualified tax professional", url: "https://www.irs.gov/businesses/small-businesses-self-employed" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Local Professional Team + Deal Spreadsheet + Official Records + Written Scope + Job-Cost Tracker" },
];

export const FLIPPING_PROPERTIES_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "THIS IS A DEAL-UNDERWRITING SYSTEM — NOT A PROMISED PROFIT RANGE.",
    "Displayed Pricing: Deal-dependent (examples only — not guarantees).",
    "",
    "CONSERVATIVE MAXIMUM PURCHASE PRICE:",
    "Supported After-Repair Value (ARV)",
    "- Purchase Closing Costs",
    "- Financing Costs",
    "- Repair Budget",
    "- Permit/Design/Professional Costs",
    "- Holding Costs",
    "- Selling/Closing Costs",
    "- Contingency",
    "- Required Profit/Risk Margin",
    "= Maximum Purchase Price",
    "",
    "Do not use a fixed “70% rule” as a substitute for actual local costs. Percent rules can hide financing, commissions, taxes, long timelines, buyer concessions, and expensive repairs.",
    "",
    "Set these limits before negotiating: Maximum Purchase Price · Maximum Repair Budget · Contingency · Maximum Holding Period · Required Profit/Risk Margin · Walk-Away Trigger.",
    "If one major cost or legal fact is unknown, the deal is not ready.",
  ].join("\n"),
  raiseTip:
    "Walk away when the math fails. Examples only — not income guarantees. This is not investment advice.",
  items: [
    { id: "arv", label: "Supported after-repair value (ARV)", price: "Local comps — not a promise" },
    { id: "max-buy", label: "Maximum purchase price", price: "ARV minus all-in costs minus required margin" },
    { id: "contingency", label: "Contingency", price: "Set in $ or % before you bid" },
    { id: "holding", label: "Maximum holding period", price: "Set in months before you bid" },
  ],
};

export const FLIPPING_PROPERTIES_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define the Buy Box, Capital Limit & Exit",
    desc: [
      "Write a narrow target: Area: __________ · Property Type: __________ · Price Range: $____ to $____ · Maximum Repair Level: Cosmetic / Moderate / Major · Available Cash: $____ · Required Reserve After Closing: $____ · Primary Exit: Renovate/Resell / Lawful Assignment/Wholesale / Other · Backup Exit: __________.",
      "Avoid a project whose legal, construction, financing, or occupancy complexity exceeds the team’s experience.",
    ].join("\n"),
  },
  {
    title: "Verify Local Rules & Build the Team",
    desc: [
      "Before marketing or contracting, confirm: entity and business-license needs; real-estate licensing rules; wholesaling, assignment, and equitable-interest advertising rules; required contract language and disclosures; contractor/trade licensing; permit and inspection process; lead-safe renovation obligations; fair-housing and advertising requirements; tax and bookkeeping plan.",
      "Team: Attorney/Title · Agent · Inspector · General Contractor · Insurance Agent · Lender · Tax Professional.",
      "Because these rules vary, unresolved answers are issues to flag — not blanks to guess through.",
    ].join("\n"),
  },
  {
    title: "Choose Deal-Sourcing Channels",
    desc: [
      "Choose exactly 2 or 3 lawful channels: licensed agent/MLS; trusted investor or professional referrals; official public records/notices; local bank/REO contacts; parent-owned or existing network; direct-to-owner outreach reviewed for legal compliance.",
      "Write one measurable goal for each. Examples: review 20 listings each week; ask 10 trusted professionals for suitable referrals; analyze 5 official public-record leads.",
      "Do not market a property, purchase contract, or ownership interest that you do not have the legal right to market.",
    ].join("\n"),
  },
  {
    title: "Make & Carry Out the Acquisition Plan",
    desc: [
      "Prepare accurate materials: buy-box summary; proof-of-funds or financing letter handled securely; due-diligence checklist; agent/owner outreach script; lead tracker.",
      "Sample: “I’m looking for a residential property in ________ requiring ________ level repairs, with a purchase budget up to $____ subject to inspection, title, financing, and attorney-approved terms.”",
      "Track: Address | Source | Asking Price | Condition | Seller/Agent | Next Step | Status.",
      "Do not use deceptive “cash buyer” claims, fake urgency, mass harassment, or promises you cannot perform.",
    ].join("\n"),
  },
  {
    title: "Screen the Property Before a Full Offer",
    desc: [
      "Confirm: exact parcel and legal owner; property type and zoning; occupancy and lawful access; taxes, HOA/condo, utilities, and code status; rough repair category; recent local sold comparables; insurance and financing red flags; seller timeline and known disclosures.",
      "Quick decision: Reject · Needs more records · Schedule lawful walkthrough/inspection.",
      "Do not enter without permission or disturb occupants.",
    ].join("\n"),
  },
  {
    title: "Complete Title, Condition & Environmental Due Diligence",
    desc: [
      "Use qualified professionals to investigate: title, liens, judgments, easements, and ownership authority; full property inspection and specialty inspections; roof, foundation, structure, electrical, plumbing, HVAC, drainage, sewer/septic, and pest concerns; flood, wetland, zoning, code, and permit history; lead, asbestos, mold, radon, tanks, contaminated soil, or other environmental risks; insurance requirements and exclusions.",
      "For pre-1978 housing, check the EPA/state lead rules before disturbing paint. EPA notes that the RRP rule can apply when a person buys, renovates, and sells homes for profit: https://www.epa.gov/lead/lead-renovation-repair-and-painting-program",
      "Uninspected or inaccessible areas require a larger contingency — or a pass.",
    ].join("\n"),
  },
  {
    title: "Build the Scope, Bids & Schedule",
    desc: [
      "Write a room-by-room scope before choosing a contractor. For each item record: Work | Material/Finish | Quantity | Labor | Permit | Responsible Party | Start | Finish | Cost.",
      "Compare at least two qualified bids when practical using the same scope.",
      "Verify: license where required; insurance; references; payment schedule tied to completed work; change-order process; cleanup/disposal; warranty; permit responsibility; lead-safe certification where required.",
      "Do not choose a contractor from price alone.",
    ].join("\n"),
  },
  {
    title: "Underwrite, Offer & Close with Protections",
    desc: [
      "Update the model with written bids, not rough guesses. Supported ARV: $____ · Total Non-Purchase Costs: $____ · Required Profit/Risk Margin: $____ · Maximum Purchase Price: $____.",
      "Have counsel/qualified professionals review: purchase contract; inspection, title, financing, appraisal, access, and cancellation rights; assignment/wholesale language if relevant and lawful; closing statement; insurance effective date; entity/signature authority.",
      "Do not waive protections or exceed the maximum merely to “win” the deal.",
    ].join("\n"),
  },
  {
    title: "Control the Renovation",
    desc: [
      "At kickoff: confirm permits; document existing condition; lock scope, schedule, site rules, and payment milestones; protect neighbors and occupants; establish change-order approval.",
      "During work: conduct documented check-ins; pay against verified progress and required documentation; update budget-to-actual weekly; track permit inspections; stop unsafe or unauthorized work; photograph concealed work before walls close.",
      "Never perform licensed or hazardous work without the required qualifications.",
    ].join("\n"),
  },
  {
    title: "Prepare & Market the Exit Honestly",
    desc: [
      "Before listing or assigning: obtain required final inspections/approvals; complete safety and function checks; resolve title and lien documentation; prepare required property and lead disclosures; confirm staging, photography, price, and showing plan; follow fair-housing and advertising rules; disclose known material defects as required.",
      "Use accurate photos and descriptions. Do not hide defects, falsify permits, invent upgrades, or advertise an ownership interest you cannot legally sell.",
      "If the backup exit is rental, re-underwrite landlord, occupancy, habitability, licensing, fair-housing, financing, and insurance requirements before changing plans.",
    ].join("\n"),
  },
  {
    title: "Close, Reconcile & Review the Deal",
    desc: [
      "At sale/exit: review the settlement statement; confirm loan, lien, contractor, tax, and closing payoffs; save contracts, invoices, permits, warranties, disclosures, and tax records; update gross proceeds, total cost, profit, timeline, and effective return; ask the tax professional how to report the activity.",
      "Post-project review: which estimate missed; which delay cost the most; which contractor performed well; was the ARV supported; did contingency cover surprises; what becomes a new pass/fail rule.",
    ].join("\n"),
  },
];

export function flippingPropertiesToolsDisclaimer(): string {
  return "Beginner stack: Local Professional Team + Deal Spreadsheet + Official Records + Written Scope + Job-Cost Tracker. This is education, not legal, tax, construction, brokerage, lending, or investment advice. Do not purchase renovation materials before closing and confirming lawful scope, storage, insurance, and the contractor plan.";
}

export function computeFlippingPropertiesProfit(input: {
  flipGrossSalePrice?: number;
  flipPurchasePrice?: number;
  flipPurchaseClosing?: number;
  flipFinancingCosts?: number;
  flipInspectionTitleLegalDesign?: number;
  flipPermits?: number;
  flipLaborMaterials?: number;
  flipUtilitiesInsuranceTaxesHoaSecurity?: number;
  flipContingencyUsed?: number;
  flipSellingCommissionsConcessionsClosing?: number;
  flipOtherCosts?: number;
  flipCashInvested?: number;
  flipProjectMonths?: number;
}): {
  totalProjectCost: number;
  estimatedPretaxProfit: number;
  profitMarginOnSale: number | null;
  returnOnCashInvested: number | null;
  averageProfitPerProjectMonth: number | null;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const gross = n(input.flipGrossSalePrice);
  const totalProjectCost =
    n(input.flipPurchasePrice) +
    n(input.flipPurchaseClosing) +
    n(input.flipFinancingCosts) +
    n(input.flipInspectionTitleLegalDesign) +
    n(input.flipPermits) +
    n(input.flipLaborMaterials) +
    n(input.flipUtilitiesInsuranceTaxesHoaSecurity) +
    n(input.flipContingencyUsed) +
    n(input.flipSellingCommissionsConcessionsClosing) +
    n(input.flipOtherCosts);
  const estimatedPretaxProfit = gross - totalProjectCost;
  const cash = n(input.flipCashInvested);
  const months = n(input.flipProjectMonths);
  return {
    totalProjectCost,
    estimatedPretaxProfit,
    profitMarginOnSale: gross > 0 ? (estimatedPretaxProfit / gross) * 100 : null,
    returnOnCashInvested: cash > 0 ? (estimatedPretaxProfit / cash) * 100 : null,
    averageProfitPerProjectMonth: months > 0 ? estimatedPretaxProfit / months : null,
  };
}
