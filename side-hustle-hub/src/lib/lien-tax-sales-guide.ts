/**
 * Court Lien & Tax Sale Properties (`lien-tax-sales`, Guide #052).
 * Elite Membership. 8 - 20 hrs/week (seasonal). Deal-dependent pricing (examples).
 * Plain data only — no imports from guide-tools.
 */

export const LIEN_TAX_SALES_REALITY_CHECK = {
  title: "FIRST IDENTIFY WHAT THE SALE ACTUALLY SELLS",
  body: [
    "Learn how to research and bid on properties sold through court lien and tax sales — using official calendars, title and tax research, occupancy review, redemption rules, and hard pass/fail gates before ever raising a paddle.",
    "",
    "“Tax sale” does not mean the same thing everywhere.",
    "",
    "A sale may involve: a tax lien certificate, which may provide a claim and possible interest but not immediate ownership; a tax deed or other deed interest; a sheriff, judicial, or court-ordered foreclosure sale; only the debtor's interest, subject to surviving rights, liens, redemption, confirmation, or possession issues.",
    "",
    "Do not assume that winning a bid gives immediate possession, clear title, insurable title, a rentable property, or a guaranteed return. Government auction property may be sold as-is, where-is, without warranties. Redemption periods, notice duties, bidder deposits, payment deadlines, deed timing, and surviving interests vary by jurisdiction and sale type.",
    "",
    "This guide is education, not legal, tax, title, investment, or real-estate advice. Use the current official sale notice and rules for the exact parcel and sale date. Before bidding, have a qualified local real-estate attorney or title professional explain what is being sold and what may survive.",
    "",
    "Never bid using borrowed money you cannot safely repay. Never enter, inspect, contact occupants, remove property, or represent yourself as the owner without legal authority.",
    "",
    "Tagline: Research the Rights. Price the Risk. Bid Only With a Plan.",
  ].join("\n"),
};

export const LIEN_TAX_SALES_NOTES_WORKSHEET = `COURT LIEN & TAX SALE PROPERTIES NOTES

MY JURISDICTION
County/State: __________
Official Sale Authority: __________
Sale Type: __________
Official Rules URL: __________
Registration Deadline: __________
Deposit: $____
Payment Deadline: __________
Redemption/Confirmation Rule: __________

PARCEL SCREEN
Parcel ID: __________
Legal Description Matched: ☐ Yes
Access Verified: ☐ Yes
Title Reviewed: ☐ Yes
Surviving Interests: __________
Occupancy: __________
Condition Range: __________
Code/Zoning/Flood/Environmental Notes: __________
Insurance Checked: ☐ Yes
Attorney/Title Questions: __________

BID SHEET
Conservative Exit Value: $____
Non-Bid Costs: $____
Required Profit/Risk Margin: $____
Maximum Bid: $____
Actual Winning Bid: $____

PASS GATES
Parcel Identity Clear: ☐ Yes ☐ No
Title Risk Acceptable: ☐ Yes ☐ No
Occupancy/Possession Plan Acceptable: ☐ Yes ☐ No
Condition/Environmental Risk Acceptable: ☐ Yes ☐ No
Cash and Deadlines Acceptable: ☐ Yes ☐ No
Exit Supported: ☐ Yes ☐ No

FINAL DECISION: ☐ BID ☐ PASS

GYSH PRO TIP
THE BEST BID MAY BE NO BID.

A parcel can be cheap and still be a terrible deal. A disciplined pass protects capital for a property whose identity, rights, condition, deadlines, and exit can actually be supported.

OFFICIAL RULES + PROFESSIONAL REVIEW + CONSERVATIVE MATH + A HARD STOP = CONTROLLED RISK

BEGINNER CHALLENGE
Complete one paper-only practice deal. Do not register or bid.
1. Choose one official local sale
2. Download the current bidder rules
3. Identify the sale type
4. Pick one parcel
5. Match its legal description and map
6. List unresolved title, occupancy, and condition questions
7. Write the redemption/confirmation timeline
8. Calculate a conservative maximum bid
9. Apply the pass/fail gates
10. Review the worksheet with a local attorney or title professional before considering real money`;

export const LIEN_TAX_SALES_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Learn how to research and bid on properties sold through court lien and tax sales — using official calendars, title and tax research, occupancy review, redemption rules, and hard pass/fail gates before ever raising a paddle. Tagline: Research the Rights. Price the Risk. Bid Only With a Plan. Category: Real Estate. Best for adults and seniors/retirees with available risk capital and patience for legal research. Advanced · Over $1,000 startup · Seasonal / Sale-Date Driven · Local / County or State Specific · Deal-Dependent / Interest or Property Exit · 8 - 20 hrs/week (seasonal around sale dates) · Elite Membership. Displayed pricing is deal-dependent (examples only — not guarantees).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Adult legal capacity to register and bid · Risk capital that is not needed for living expenses or emergencies · Official county/state/court sale rules and calendar · Government-issued identification · Required bidder registration, forms, deposits, and payment method · Parcel research and spreadsheet skills · Access to assessor, recorder, court, tax, zoning, flood, and code-enforcement records · Qualified local attorney and title professional when needed · A written maximum-bid and no-bid system.",
  },
  {
    id: "before",
    label: "Before researching a parcel",
    detail:
      "Confirm: sale authority and official office; sale type and interest being offered; registration deadline; deposit or proof-of-funds requirement; accepted payment form; full-payment deadline; redemption period or court-confirmation process; notice requirements after purchase; deed/certificate timing; rules for assignment, resale, access, and possession.",
  },
  {
    id: "not-advice",
    label: "Education only",
    detail:
      "This guide is education, not legal, tax, title, investment, or real-estate advice. Never bid using borrowed money you cannot safely repay. Never enter, inspect, contact occupants, remove property, or represent yourself as the owner without legal authority.",
  },
];

export const LIEN_TAX_SALES_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "IRS auction due-diligence warning", url: "https://www.treasury.gov/auctions/irs/faq.shtml" },
  { label: "IRS federal tax liens and redemption", url: "https://www.irs.gov/irm/part5/irm_05-012-004" },
];

export const LIEN_TAX_SALES_SUPPLIES = {
  starterKitTotal: "Over $1,000 when including risk capital, professional review, and required deposits — do not buy investor subscriptions or renovation supplies before lawful acquisition",
  items: [
    { id: "computer", name: "Computer with secure internet", qty: "1 (usually owned)", estCost: "$0", notes: "Essential" },
    { id: "phone", name: "Phone and charger", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "spreadsheet", name: "Spreadsheet or deal worksheet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "notice", name: "Official sale notice and rules", qty: "Per sale", estCost: "$0", notes: "Essential" },
    { id: "maps", name: "Parcel maps and record links", qty: "Per parcel", estCost: "$0", notes: "Essential" },
    { id: "calendar", name: "Calendar with every deadline", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "id", name: "Government-issued ID", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "funds", name: "Required certified funds or approved payment method", qty: "Per sale rules", estCost: "Varies", notes: "Essential" },
    { id: "folder", name: "Secure document folder", qty: "1", estCost: "$0–15", notes: "Essential" },
    { id: "attorney", name: "Local real-estate attorney", qty: "As needed", estCost: "Varies", notes: "Professional support", optional: true },
    { id: "title", name: "Title company or title abstractor", qty: "As needed", estCost: "Varies", notes: "Professional support", optional: true },
    { id: "inspector", name: "Licensed inspector, surveyor, appraiser, contractor, environmental professional, or insurance agent", qty: "As needed", estCost: "Varies", notes: "Professional support", optional: true },
    { id: "tax-pro", name: "Tax professional", qty: "As needed", estCost: "Varies", notes: "Professional support", optional: true },
  ],
};

export const LIEN_TAX_SALES_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "treasurer", name: "County treasurer or tax collector", freePlanAvailable: true, planLabelApplicable: false, costNote: "Official sale lists and tax records" },
  { id: "sheriff", name: "Sheriff, clerk of court, master-in-equity, or other named sale authority", freePlanAvailable: true, planLabelApplicable: false, costNote: "Official sale authority" },
  { id: "assessor", name: "County assessor and parcel/GIS map", freePlanAvailable: true, planLabelApplicable: false, costNote: "Parcel identity and boundaries" },
  { id: "recorder", name: "Recorder/register of deeds", freePlanAvailable: true, planLabelApplicable: false, costNote: "Recorded interests and chain" },
  { id: "docket", name: "Court docket", freePlanAvailable: true, planLabelApplicable: false, costNote: "Judicial sale files" },
  { id: "zoning", name: "Planning, zoning, building, code, and environmental offices", freePlanAvailable: true, planLabelApplicable: false, costNote: "Use and violation research" },
  { id: "fema", name: "FEMA flood maps where applicable", freePlanAvailable: true, planLabelApplicable: false, costNote: "Flood risk screening", url: "https://www.fema.gov/flood-maps" },
  { id: "sheets", name: "Google Sheets or Excel", freePlanAvailable: true, costNote: "Deal analysis and maximum-bid worksheet", url: "https://sheets.google.com/" },
  { id: "calendar", name: "Calendar with deadline reminders", freePlanAvailable: true, costNote: "Registration, sale, payment, redemption deadlines", url: "https://calendar.google.com/" },
  { id: "comps", name: "Conservative comparable-sales worksheet", freePlanAvailable: true, costNote: "Exit value support" },
  { id: "holding", name: "Repair and holding-cost worksheet", freePlanAvailable: true, costNote: "Non-bid cost ranges" },
  { id: "irs-auction", name: "IRS auction due-diligence warning", freePlanAvailable: true, planLabelApplicable: false, costNote: "Official auction caution", url: "https://www.treasury.gov/auctions/irs/faq.shtml" },
  { id: "irs-lien", name: "IRS federal tax liens and redemption", freePlanAvailable: true, planLabelApplicable: false, costNote: "Federal lien/redemption check", url: "https://www.irs.gov/irm/part5/irm_05-012-004" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Official Sale Site + Recorder/Assessor Records + Spreadsheet + Calendar + Local Attorney/Title Review" },
];

export const LIEN_TAX_SALES_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "THIS IS A MAXIMUM-BID SYSTEM — NOT A PROMISED PROFIT RANGE",
    "",
    "Displayed Pricing: Deal-dependent (examples only — not guarantees)",
    "",
    "Create three separate limits:",
    "",
    "Research Budget: $____",
    "Records, title work, attorney review, inspections where lawfully available, travel, and auction-platform fees.",
    "",
    "Bid Deposit / Earnest Money: $____",
    "Use only the form and amount required by the official sale rules.",
    "",
    "Maximum All-In Exposure: $____",
    "Winning bid + buyer premium + delinquent or surviving obligations + legal/title work + notice/redemption costs + insurance + security + repairs + utilities + holding + financing + resale/closing costs + contingency.",
    "",
    "MAXIMUM BID FORMULA:",
    "Conservative Exit Value − All Non-Bid Costs − Required Profit / Risk Margin = Maximum Bid",
    "",
    "If any required input is unknown, the maximum bid is not ready. PASS.",
    "",
    "Do not use the advertised tax balance, opening bid, assessed value, automated valuation, or a wholesaler's estimate as the property's true value.",
  ].join("\n"),
  raiseTip:
    "Deal-dependent examples only — not guarantees. If any required input is unknown, the maximum bid is not ready. PASS.",
  items: [
    { id: "research", label: "Research budget", price: "Set your limit", notes: "Records, title, attorney, travel, platform fees" },
    { id: "deposit", label: "Bid deposit / earnest money", price: "Per official sale rules", notes: "Required form and amount only" },
    { id: "exposure", label: "Maximum all-in exposure", price: "Set your limit", notes: "Bid + premiums + surviving costs + holding + exit" },
    { id: "formula", label: "Maximum bid formula", price: "Conservative exit − non-bid costs − margin", notes: "Unknown input = PASS" },
  ],
};

export const LIEN_TAX_SALES_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose One Jurisdiction & Sale Type",
    desc: [
      "Do not begin with a random national auction list.",
      "Choose one county or jurisdiction and write: Jurisdiction · Official Sale Authority · Sale Type (Tax Lien Certificate / Tax Deed / Sheriff/Judicial Sale / Other) · Official Rules URL · Current Statute/Procedure Checked · Attorney/Title Contact.",
      "Learn one process deeply before comparing multiple jurisdictions.",
    ].join("\n"),
  },
  {
    title: "Build the Official Sale Calendar",
    desc: [
      "Use only the office named in the official notice to record: List Published · Research Cutoff · Registration Deadline · Deposit Deadline · Sale Date/Time/Time Zone · Full-Payment Deadline · Confirmation/Objection Date · Redemption Deadline or Rule · Notice/Deed Application Deadlines.",
      "One missed deadline can forfeit rights or money. Create calendar reminders and recheck the official page before the sale.",
    ].join("\n"),
  },
  {
    title: "Register & Verify the Money Rules",
    desc: [
      "Read every bidder instruction before sending funds.",
      "Confirm: who may register; identification or entity documents; tax-clearance or eligibility rules; deposit amount; accepted funds; buyer premium or platform fee; whether bids are irrevocable; default penalties; balance-due deadline; refund timing for unsuccessful bidders.",
      "Test the account and login before an online sale. Do not wire money from emailed instructions without independently confirming the recipient through the official office.",
    ].join("\n"),
  },
  {
    title: "Create Hard Pass/Fail Gates",
    desc: [
      "Before seeing a “cheap” price, choose rules that automatically stop a bid.",
      "Example PASS conditions: parcel identity is uncertain; no lawful access or useful exterior review; title/surviving-interest risk is unresolved; occupancy or possession plan is unacceptable; environmental, code, zoning, or flood risk is unacceptable; insurance is unavailable or unaffordable; total cash requirement exceeds the capital limit; exit value or repair range cannot be supported; redemption/confirmation timing does not fit the plan.",
      "My Automatic PASS Rules: __________",
      "No excitement, countdown clock, or competing bidder overrides a pass gate.",
    ].join("\n"),
  },
  {
    title: "Verify the Exact Parcel",
    desc: [
      "Match the parcel across official records.",
      "Record: parcel identification number; legal description; street address, if any; map boundaries and access; owner/debtor name; land and improvement status; assessed data and tax history; zoning/use; utility availability; flood/wetland indicators; code violations or demolition orders.",
      "Never rely on the street address alone. Vacant lots, landlocked parcels, demolished structures, partial interests, and mislabeled photos can look like bargains.",
    ].join("\n"),
  },
  {
    title: "Research Title, Liens & Court Records",
    desc: [
      "Have the title and legal chain reviewed for the exact sale type.",
      "Questions: what interest is being sold; which liens, taxes, assessments, easements, judgments, leases, HOA/condo claims, or governmental interests may survive; is there a federal tax lien or federal redemption issue; is bankruptcy involved; are required parties and notices reflected in the court file; will the resulting certificate/deed be marketable or insurable; is a quiet-title or other court action likely.",
      "Do not treat a self-run online search as a legal opinion or title insurance.",
    ].join("\n"),
  },
  {
    title: "Investigate Condition, Occupancy & Possession",
    desc: [
      "Use only lawful methods.",
      "Check: lawful inspection opportunity, if any; exterior condition from public areas; occupancy indicators; tenants, owners, heirs, or unknown occupants; local eviction/possession requirements; fire, building, health, and code records; open permits and unpermitted work; environmental concerns; security, winterization, and insurance needs after lawful acquisition.",
      "Do not trespass, peer into windows, disturb occupants, post notices, change locks, or remove belongings without authority and professional guidance.",
    ].join("\n"),
  },
  {
    title: "Map Redemption, Confirmation & Notice Duties",
    desc: [
      "Write the exact process from official sources and attorney review: Redemption Begins · Redemption Ends · Interest/Penalty Method · Who May Redeem · Purchaser Notice Duties · Court Confirmation Required · When Deed/Certificate May Issue · When Possession May Lawfully Begin.",
      "Do not spend as though title is final while redemption, objections, confirmation, or deed procedures remain open.",
    ].join("\n"),
  },
  {
    title: "Calculate the Conservative Maximum Bid",
    desc: [
      "Use documented ranges, not a best-case story.",
      "Conservative Exit Value · Title/Legal/Notice Costs · Surviving Taxes/Liens/Assessments · Repair/Demolition/Environmental Range · Insurance/Security/Utilities · Financing/Holding Costs · Selling/Closing Costs · Contingency · Required Profit/Risk Margin · Maximum Bid.",
      "If the current bid exceeds the maximum by even one increment, stop.",
    ].join("\n"),
  },
  {
    title: "Bid With a Written Stop & Save the Record",
    desc: [
      "Before the sale: recheck cancellations, redemptions, opening bids, and rule changes; confirm parcel number and sale order; confirm funds and payment deadline; put the maximum bid where you can see it; decide who has final authority to stop.",
      "During the sale: bid only on the researched parcel; do not chase another bidder; save confirmations, receipts, timestamps, and terms.",
      "After the sale: if unsuccessful, record the result and protect refunded funds; if successful, pay only through the official process and start the deadline checklist immediately.",
    ].join("\n"),
  },
  {
    title: "Complete the Legal Process & Execute the Exit",
    desc: [
      "Follow attorney/title guidance for every post-sale duty.",
      "Possible work: required notices; redemption tracking; court confirmation; certificate/deed application and recording; title cure or quiet-title process; insurance and property security after lawful authority; lawful possession or tenant process; repair, hold, resale, or other approved exit.",
      "Compare actual results with the original underwriting.",
      "",
      "RESEARCH → PASS/FAIL GATES → MAXIMUM BID → LEGAL PROCESS → CONTROLLED EXIT",
    ].join("\n"),
  },
];

export function lienTaxSalesToolsDisclaimer(): string {
  return "Beginner stack: Official Sale Site + Recorder/Assessor Records + Spreadsheet + Calendar + Local Attorney/Title Review. This guide is education, not legal, tax, title, investment, or real-estate advice. The best bid may be no bid.";
}

export function computeLienTaxSaleDealProfit(input: {
  ltsWinningBid?: number;
  ltsBuyerPremium?: number;
  ltsTitleLegalNotice?: number;
  ltsSurvivingTaxesLiens?: number;
  ltsRepairsEnvironmental?: number;
  ltsInsuranceSecurityUtilities?: number;
  ltsFinancingHolding?: number;
  ltsSellingClosing?: number;
  ltsOtherCosts?: number;
  ltsActualProceeds?: number;
}): {
  totalCashInvested: number;
  estimatedDealProfit: number;
  returnOnCashPercent: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const totalCashInvested =
    n(input.ltsWinningBid) +
    n(input.ltsBuyerPremium) +
    n(input.ltsTitleLegalNotice) +
    n(input.ltsSurvivingTaxesLiens) +
    n(input.ltsRepairsEnvironmental) +
    n(input.ltsInsuranceSecurityUtilities) +
    n(input.ltsFinancingHolding) +
    n(input.ltsSellingClosing) +
    n(input.ltsOtherCosts);
  const estimatedDealProfit = n(input.ltsActualProceeds) - totalCashInvested;
  return {
    totalCashInvested,
    estimatedDealProfit,
    returnOnCashPercent: totalCashInvested > 0 ? (estimatedDealProfit / totalCashInvested) * 100 : 0,
  };
}
