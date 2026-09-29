/**
 * Purchase Foreclosure Properties (`foreclosure-properties`, Guide #098).
 * Investment-acquisition: source → evaluate → bid/offer → exit.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const FORECLOSURE_PROPERTIES_REALITY_CHECK = {
  title: "A LOW PRICE DOES NOT AUTOMATICALLY MEAN A GOOD DEAL",
  body: [
    "Foreclosure investing can involve title problems, liens, occupants, redemption rights, unpaid taxes, property damage, limited inspections, auction deposits, financing restrictions, and properties sold as-is.",
    "",
    "Rules vary by state, county, auction, lender, and property.",
    "",
    "Before committing money:",
    "VERIFY PROPERTY → VERIFY TITLE → VERIFY OCCUPANCY → VERIFY CONDITION → VERIFY RULES → VERIFY NUMBERS → SET MAX PRICE → WALK AWAY IF IT FAILS.",
    "",
    "Use qualified local real-estate attorneys, title professionals, inspectors, contractors, lenders, tax professionals, agents/brokers, and other specialists when appropriate.",
    "",
    "This guide is educational and is not individualized legal, tax, lending, title, or investment advice.",
    "",
    "Tagline: Find the Deal. Verify the Numbers. Protect the Downside.",
  ].join("\n"),
};

export const FORECLOSURE_PROPERTIES_NOTES_WORKSHEET = `BUY BOX
Strategy: ________
Area: ________
Property Type: ________
Max Price: $____
Max Rehab: $____
Minimum Profit/Cash Flow: ________
Reserve: $____
Deal Breakers: ________

PROPERTY
Address: ________
Stage: Pre-Foreclosure / Auction / REO
Owner: ________
Sale/Offer Date: ________
Source: ________
Occupancy: ________
Inspection Allowed: ________

AUCTION/OFFER
Deposit: $____
Buyer Premium/Fees: $____
Payment Deadline: ________
Financing Allowed: ________
Cancellation/Postponement: ________

TITLE/LEGAL
Title Search: ☐
Taxes: ________
Liens: ________
HOA: ________
Code Issues: ________
Redemption Issue: ________
Occupancy/Tenant Issue: ________
Attorney/Title Notes: ________

CONDITION
Inspection: ________
Roof: ________
Foundation: ________
HVAC: ________
Electrical: ________
Plumbing: ________
Water/Mold: ________
Other: ________
Repair Estimate: $____
Contingency: $____

VALUE
Conservative ARV: $____
Expected ARV: $____
Conservative Rent: $____

MY MAXIMUM PRICE: $________
DO NOT EXCEED: ☐

RESULT
Bought / Lost Bid / Rejected / Walked Away
Final Price: $____
Why: ________
Lesson: ________

GYSH PRO TIP
Your profit is usually protected when you BUY, not when you sell.
The goal is NOT: WIN THE AUCTION.
The goal is: BUY ONLY WHEN VERIFIED NUMBERS + VERIFIED RISK + VERIFIED RULES FIT YOUR PLAN.
If the price passes your walk-away number, losing the property can be a successful decision.

ELITE CHALLENGE
Analyze three properties WITHOUT buying one.
For each: identify foreclosure stage, verify official source, research title/tax/occupancy, estimate repairs, find conservative comps, calculate ARV/rent, calculate all costs, set contingency, set desired profit/cash flow, write maximum offer, list five deal breakers, decide BUY / INVESTIGATE MORE / WALK AWAY.
The challenge is successful if you can explain exactly WHY each number exists.`;

export const FORECLOSURE_PROPERTIES_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Source and evaluate foreclosure, auction, and bank-owned (REO) opportunities using disciplined due diligence, repair estimates, title/legal review, financing preparation, offer strategy, and clear walk-away rules. Tagline: Find the Deal. Verify the Numbers. Protect the Downside. Category: Real Estate / Investing. Best for Adults / Experienced Investors / Seniors-Retirees with appropriate professional support. Intermediate–Advanced · High / Deal-dependent startup · 10 - 25 hrs/week during active deal cycles · Local / Regional · Investment profit / rental cash flow / equity · Elite Membership. This is educational, not individualized legal, tax, lending, title, or investment advice.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Investment goal · Target market · Capital/financing plan · Cash reserve · Credit/financing readiness if borrowing · Property-analysis worksheet · Repair-estimate process · Comparable-sales/rent research · Title/legal due-diligence process · Professional contacts · Clear maximum-offer formula · Walk-away rules.",
  },
  {
    id: "stages",
    label: "Understand the three stages",
    detail:
      "Pre-Foreclosure — owner may still own/control sale. Foreclosure/Auction — sale process governed by local law and auction terms. REO/Bank-Owned — lender/bank has taken ownership and markets the property. Do not assume the same purchase process, inspection rights, financing, title protection, occupancy status, or timelines apply to all three.",
  },
  {
    id: "professionals",
    label: "Professionals first",
    detail:
      "Use qualified local real-estate attorneys, title professionals, inspectors, contractors, lenders, tax professionals, agents/brokers, and other specialists when appropriate. Never trespass or enter a property without lawful authorization.",
  },
];

export const FORECLOSURE_PROPERTIES_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Deal sheet and cash-flow tracker" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Buy box, walk-away notes, rehab log" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Sale dates and bid deadlines" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Location, comps, and neighborhood context" },
];

export const FORECLOSURE_PROPERTIES_SUPPLIES = {
  starterKitTotal:
    "About $10–40 for worksheets, a flashlight, and a measuring tool. Capital, deposits, and closing funds are deal-dependent — not a supply-kit cost.",
  items: [
    { id: "computer", name: "Computer / laptop", qty: "1", estCost: "$0", notes: "Essential — use what you own" },
    { id: "phone", name: "Phone", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "worksheet", name: "Property-analysis worksheet", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "calc", name: "Calculator / spreadsheet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "camera", name: "Camera where lawful / appropriate", qty: "1", estCost: "$0", notes: "Phone is fine" },
    { id: "flashlight", name: "Flashlight for permitted inspections", qty: "1", estCost: "$5–12", notes: "Essential" },
    { id: "measure", name: "Measuring tool", qty: "1", estCost: "$8–15", notes: "Essential" },
    { id: "notebook", name: "Notebook", qty: "1", estCost: "$3–8", notes: "Essential" },
    { id: "comps", name: "Comparable-sales / rent data", qty: "as needed", estCost: "$0–15", notes: "From lawful sources" },
    { id: "repair-check", name: "Repair-estimate checklist", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "auction-docs", name: "Auction / REO documents", qty: "as needed", estCost: "$0", notes: "Official sources only" },
    { id: "pof", name: "Proof of funds / preapproval as required", qty: "1", estCost: "$0", notes: "Deal-dependent" },
    { id: "title", name: "Title report / search documents", qty: "as needed", estCost: "Deal-dependent", notes: "Use a title professional" },
    { id: "insurance", name: "Insurance quote", qty: "1", estCost: "Quote", notes: "Before closing" },
    { id: "tax-hoa", name: "Tax / HOA information", qty: "as needed", estCost: "$0", notes: "Official records" },
    { id: "contractor", name: "Contractor estimates", qty: "as needed", estCost: "$0–quote", notes: "Major work" },
    { id: "inspect", name: "Inspection reports", qty: "as permitted", estCost: "Deal-dependent", notes: "When access is lawful" },
    { id: "closing", name: "Closing-cost estimates", qty: "1", estCost: "Deal-dependent", notes: "Before bidding" },
  ],
};

export const FORECLOSURE_PROPERTIES_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "fp_mls",
    name: "Property search / MLS (appropriate sources)",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Access through a licensed agent/broker or other lawful listing source",
  },
  {
    id: "fp_recorder",
    name: "County recorder / clerk / assessor websites",
    freePlanAvailable: true,
    costNote: "Official ownership, tax, and sale records",
  },
  {
    id: "fp_tax",
    name: "Tax authority records",
    freePlanAvailable: true,
    costNote: "Taxes, liens, and amounts due",
  },
  {
    id: "fp_auction",
    name: "Auction platform / official sale information",
    freePlanAvailable: true,
    costNote: "Verify against authoritative county/sheriff/trustee sources",
  },
  {
    id: "fp_maps",
    name: "Maps",
    freePlanAvailable: true,
    costNote: "Location, access, and neighborhood context",
    url: "https://maps.google.com/",
  },
  {
    id: "fp_sheets",
    name: "Spreadsheet",
    freePlanAvailable: true,
    costNote: "Deal sheet, max offer, and cash-flow tracker",
    url: "https://sheets.google.com/",
  },
  {
    id: "fp_mortgage",
    name: "Mortgage / payment calculator",
    freePlanAvailable: true,
    costNote: "Financing and holding-cost estimates only",
  },
  {
    id: "fp_comps",
    name: "Comparable-sales tools",
    freePlanAvailable: true,
    costNote: "Recent sold comps — not optimistic active listings alone",
  },
  {
    id: "fp_rent",
    name: "Rental-comparison tools",
    freePlanAvailable: true,
    costNote: "Realistic market rent and vacancy",
    optional: true,
  },
  {
    id: "fp_calendar",
    name: "Calendar / deadline tracker",
    freePlanAvailable: true,
    costNote: "Sale dates, deposits, and payment deadlines",
    url: "https://calendar.google.com/",
  },
  {
    id: "fp_docs",
    name: "Document storage",
    freePlanAvailable: true,
    costNote: "Title, auction terms, estimates, and walk-away notes",
    url: "https://docs.google.com/",
  },
  {
    id: "fp_contractor",
    name: "Contractor estimate sheet",
    freePlanAvailable: true,
    costNote: "Major rehab line items",
  },
  {
    id: "fp_title",
    name: "Title / closing professional",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Required before committing funds",
  },
  {
    id: "fp_inspector",
    name: "Inspector",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "When lawful access is available",
    optional: true,
  },
  {
    id: "fp_attorney",
    name: "Real-estate attorney",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Local legal guidance when needed",
  },
  {
    id: "fp_lender",
    name: "Lender",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Confirm actual requirements — auctions often do not allow ordinary mortgages",
    optional: true,
  },
  {
    id: "fp_agent",
    name: "Licensed agent / broker",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Useful for REO listings and comps",
    optional: true,
  },
  {
    id: "fp_stack",
    name: "Beginner Safety Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote:
      "Deal Sheet + Official Property Records + Title Professional + Inspector/Contractor + Financing Confirmation + Attorney When Needed + Written Walk-Away Number",
  },
];

export const FORECLOSURE_PROPERTIES_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "This is NOT a service where you charge an hourly price. Income is DEAL-DEPENDENT — EXAMPLES ONLY, NOT GUARANTEES.",
    "",
    "The key number is MAXIMUM SAFE PURCHASE PRICE.",
    "",
    "FIX-AND-FLIP STARTER FORMULA",
    "Conservative After-Repair Value (ARV)",
    "− Purchase/Closing Costs",
    "− Repairs/Rehab",
    "− Financing/Holding Costs",
    "− Selling Costs",
    "− Contingency Reserve",
    "− Desired Profit",
    "= Maximum Purchase Price",
    "",
    "BUY-AND-HOLD STARTER FORMULA",
    "Conservative Property Value AND Expected Monthly Rent",
    "− Vacancy Allowance",
    "− Taxes",
    "− Insurance",
    "− Repairs/Maintenance",
    "− Capital Expenditure Reserve",
    "− Property Management",
    "− HOA/Utilities paid by owner",
    "− Financing",
    "− Other Operating Costs",
    "= Estimated Monthly Cash Flow",
    "",
    "WHOLESALE / ASSIGNMENT",
    "Do not assume assignment/wholesaling is permitted or unregulated. State laws, licensing, disclosure, contract, marketing, and transaction rules vary. Obtain local legal guidance before using this strategy.",
    "",
    "EXAMPLE FLIP — EDUCATIONAL ONLY",
    "Conservative ARV: $250,000",
    "Repairs: $45,000",
    "Purchase/Closing: $8,000",
    "Holding/Financing: $12,000",
    "Selling Costs: $20,000",
    "Contingency: $10,000",
    "Desired Profit: $35,000",
    "Maximum Purchase Price = $120,000",
    "",
    "If bidding exceeds $120,000 under those assumptions: WALK AWAY OR RE-RUN THE DEAL WITH NEW VERIFIED FACTS. Do not erase the contingency or desired profit just to “win.”",
    "",
    "EXAMPLE RENTAL — EDUCATIONAL ONLY",
    "Rent: $2,000/month",
    "Operating/ownership costs excluding financing: $700",
    "Financing: $900",
    "Estimated Cash Flow: $400/month before taxes and unexpected expenses.",
    "",
    "These examples are NOT promises of return, appreciation, rent increases, resale price, or tax outcomes.",
  ].join("\n"),
  raiseTip:
    "Deal-dependent. Walk away when numbers fail. Examples only — not income, return, or appreciation guarantees. This is not legal, tax, lending, title, or investment advice.",
  items: [
    {
      id: "deal-dependent",
      label: "Deal-dependent — examples only, not guarantees",
      price: "N/A",
      notes: "Key number is maximum safe purchase price",
    },
    {
      id: "flip-example",
      label: "Example flip max purchase (educational)",
      price: "$120,000",
      notes: "From $250,000 conservative ARV after costs, contingency, and $35,000 desired profit",
    },
    {
      id: "rental-example",
      label: "Example rental cash flow (educational)",
      price: "$400 / month",
      notes: "$2,000 rent − $700 operating − $900 financing; before taxes and surprises",
    },
  ],
};

/** Exactly 11 authored core steps. No GYSH client-marketing sequence. */
export const FORECLOSURE_PROPERTIES_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your Investment Strategy & Buy Box",
    desc: [
      "Choose:",
      "☐ Fix and Flip",
      "☐ Buy and Hold",
      "☐ Owner Occupancy",
      "☐ REO Purchase",
      "☐ Auction Purchase only if experienced/prepared",
      "",
      "Define:",
      "Target Area · Property Type · Beds/Baths · Price Range · Maximum Rehab · Minimum Desired Profit/Cash Flow · Financing Type · Minimum Reserve · Deal Breakers.",
      "",
      "Do not chase every foreclosure.",
    ].join("\n"),
  },
  {
    title: "Build Your Funding & Professional Team",
    desc: [
      "Before bidding/offering, know how the purchase and rehab will be funded.",
      "",
      "Possible resources:",
      "- Cash",
      "- Conventional/investor financing",
      "- Renovation financing",
      "- Private/hard-money financing where appropriate",
      "- Other lawful financing",
      "",
      "Confirm actual lender requirements.",
      "",
      "Build contacts: real-estate attorney · title/closing professional · agent/broker · inspector · general contractor/trades · insurance agent · lender · CPA/tax professional.",
      "",
      "Never assume an auction will allow ordinary mortgage financing or extra time to obtain funds.",
    ].join("\n"),
  },
  {
    title: "Source Foreclosure & REO Leads",
    desc: [
      "Use legitimate sources:",
      "- MLS/agent-listed REOs",
      "- Bank/lender listings",
      "- Official county/sheriff/trustee auction information",
      "- Government-owned-property programs where applicable",
      "- Court/public records",
      "- Reputable auction platforms",
      "",
      "Create a tracker:",
      "Address | Stage | Source | Sale/Offer Date | Opening/Asking Price | Occupancy | Inspection Allowed? | Financing Rules | Status.",
      "",
      "Verify listings against authoritative records when possible. Beware of fake foreclosure lists, wire scams, and “guaranteed deal” sellers.",
    ].join("\n"),
  },
  {
    title: "Verify the Foreclosure Stage, Rules & Timeline",
    desc: [
      "For every property determine:",
      "- Who currently owns it?",
      "- Is it pre-foreclosure, auction, or REO?",
      "- What type of foreclosure process applies?",
      "- Sale date? Deposit? Payment deadline? Accepted payment method?",
      "- Buyer premium/fees? Inspection/access? Cancellation/postponement rules?",
      "- Redemption rights? Possession/occupancy issues? Title/closing process?",
      "",
      "Read official sale terms yourself and obtain local legal guidance where needed.",
    ].join("\n"),
  },
  {
    title: "Research Title, Liens, Taxes & Occupancy",
    desc: [
      "Before committing funds, investigate: ownership · mortgages/deeds of trust · tax liens · judgment liens · HOA/condo claims · municipal/code issues · utility issues where relevant · easements/restrictions · pending litigation where relevant · occupancy · tenants · former owner · other claims.",
      "",
      "A foreclosure sale does NOT automatically mean every lien/problem disappears.",
      "",
      "Use a qualified title professional/attorney. Determine what title protection is available and whether title insurance can be obtained.",
      "",
      "Never attempt self-help eviction, lockout, utility shutoff, harassment, or removal of occupants/property. Follow applicable law.",
    ].join("\n"),
  },
  {
    title: "Inspect Condition & Build a Real Repair Budget",
    desc: [
      "If lawful access/inspection is available, evaluate: roof · foundation/structure · HVAC · electrical · plumbing · water damage/mold indicators · windows/doors · kitchen/baths · flooring/walls · appliances · exterior · drainage · sewer/septic · pests · permits/unpermitted work · safety/code issues.",
      "",
      "Get contractor estimates for major work.",
      "",
      "If inspection is NOT permitted, increase uncertainty/contingency and decide whether the risk fits your strategy.",
      "",
      "Never trespass.",
    ].join("\n"),
  },
  {
    title: "Estimate Conservative ARV or Rent",
    desc: [
      "For flip: use recent relevant sold comparables — not optimistic active listings alone. Adjust for location, size, condition, beds/baths, lot, features, and market changes.",
      "",
      "For rental: research realistic market rent and vacancy. Estimate all recurring expenses.",
      "",
      "Create: Low Case · Expected Case · High Case.",
      "",
      "Make the deal survive the LOW/CONSERVATIVE case before getting excited about upside.",
    ].join("\n"),
  },
  {
    title: "Calculate Your Maximum Offer & Walk-Away Number",
    desc: [
      "Enter verified assumptions into the Foreclosure Deal Analyzer.",
      "",
      "For flip: Conservative ARV − all costs − contingency − desired profit = max purchase price.",
      "",
      "For rental: require acceptable cash flow/reserves/return under conservative assumptions.",
      "",
      "Write: MY MAXIMUM PRICE = $________",
      "",
      "Add auction buyer premiums/fees and required costs BEFORE bidding.",
      "",
      "Do not raise the maximum because:",
      "- “I already spent time researching it.”",
      "- “Someone else keeps bidding.”",
      "- “I really want this property.”",
      "- “It has to be worth more.”",
      "",
      "The spreadsheet does not care about bidding emotion.",
    ].join("\n"),
  },
  {
    title: "Make the Offer or Bid with Discipline",
    desc: [
      "REO:",
      "Follow listing/offer instructions. Use appropriate contingencies when available. Provide required financing/proof documents. Understand as-is provisions. Negotiate based on evidence.",
      "",
      "Auction:",
      "Register correctly. Verify deposit/payment rules. Confirm exact property. Know whether bids are final/subject to confirmation. Stop at written maximum.",
      "",
      "Never wire funds using instructions received only through an unexpected email/text. Independently verify wiring instructions through a trusted known contact/number.",
    ].join("\n"),
  },
  {
    title: "Complete Closing, Possession & Rehab Safely",
    desc: [
      "Before closing/final funding: confirm final settlement numbers · review title/closing documents · verify insurance · confirm funding · re-check property/status if permitted · verify wire instructions independently.",
      "",
      "After lawful ownership/possession: follow legal occupant/tenant procedures · secure property lawfully · document condition · activate utilities appropriately · pull required permits · use qualified contractors · track rehab budget/change orders.",
      "",
      "Do not begin demolition or remove belongings before you have the legal right to possession.",
    ].join("\n"),
  },
  {
    title: "Exit, Review & Improve Your Buy Box",
    desc: [
      "FLIP: Finish rehab → inspect → price from current market → list/sell → calculate actual net profit.",
      "",
      "RENTAL: Finish make-ready → comply with rental laws → screen/manage appropriately → track actual cash flow.",
      "",
      "After every deal OR rejected deal record: projected vs actual costs · unexpected title/legal issues · repair misses · timeline · financing/holding cost · final profit/cash flow · why you bought/walked away · what changes next time.",
      "",
      "A good foreclosure investor should be proud of deals they WALK AWAY FROM.",
    ].join("\n"),
  },
];

export function foreclosurePropertiesToolsDisclaimer(): string {
  return "Beginner safety stack: Deal Sheet + Official Property Records + Title Professional + Inspector/Contractor + Financing Confirmation + Attorney When Needed + Written Walk-Away Number. This guide is educational and is not individualized legal, tax, lending, title, or investment advice. Never trespass. Independently verify wire instructions.";
}

export function computeForeclosureFlip(input: {
  conservativeArv?: number;
  purchasePrice?: number;
  buyerPremium?: number;
  closingTitleLegal?: number;
  repairs?: number;
  repairContingency?: number;
  financingCosts?: number;
  monthlyHoldingCosts?: number;
  expectedHoldingMonths?: number;
  sellingCosts?: number;
  taxesInsuranceHoa?: number;
  otherCosts?: number;
  desiredProfit?: number;
}): {
  holdingTotal: number;
  totalProjectCost: number;
  estimatedProfit: number;
  profitMarginPercent: number;
  maxPurchasePrice: number;
} {
  const arv = Math.max(0, Number(input.conservativeArv) || 0);
  const purchase = Math.max(0, Number(input.purchasePrice) || 0);
  const premium = Math.max(0, Number(input.buyerPremium) || 0);
  const closing = Math.max(0, Number(input.closingTitleLegal) || 0);
  const repairs = Math.max(0, Number(input.repairs) || 0);
  const contingency = Math.max(0, Number(input.repairContingency) || 0);
  const financing = Math.max(0, Number(input.financingCosts) || 0);
  const monthlyHolding = Math.max(0, Number(input.monthlyHoldingCosts) || 0);
  const months = Math.max(0, Number(input.expectedHoldingMonths) || 0);
  const selling = Math.max(0, Number(input.sellingCosts) || 0);
  const taxesHoa = Math.max(0, Number(input.taxesInsuranceHoa) || 0);
  const other = Math.max(0, Number(input.otherCosts) || 0);
  const desired = Math.max(0, Number(input.desiredProfit) || 0);
  const holdingTotal = monthlyHolding * months;
  const nonPurchaseCosts =
    premium + closing + repairs + contingency + financing + holdingTotal + selling + taxesHoa + other;
  const totalProjectCost = purchase + nonPurchaseCosts;
  const estimatedProfit = arv - totalProjectCost;
  const profitMarginPercent = arv > 0 ? (estimatedProfit / arv) * 100 : 0;
  const maxPurchasePrice = arv - nonPurchaseCosts - desired;
  return {
    holdingTotal,
    totalProjectCost,
    estimatedProfit,
    profitMarginPercent,
    maxPurchasePrice,
  };
}

export function computeForeclosureRental(input: {
  purchase?: number;
  rehabClosingInitial?: number;
  monthlyRent?: number;
  vacancyAllowance?: number;
  taxes?: number;
  insurance?: number;
  maintenance?: number;
  capexReserve?: number;
  management?: number;
  hoaOwnerUtilities?: number;
  debtService?: number;
  otherOperating?: number;
}): {
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashInvested: number;
  cashOnCashPercent: number;
} {
  const rent = Math.max(0, Number(input.monthlyRent) || 0);
  const vacancy = Math.max(0, Number(input.vacancyAllowance) || 0);
  const taxes = Math.max(0, Number(input.taxes) || 0);
  const insurance = Math.max(0, Number(input.insurance) || 0);
  const maintenance = Math.max(0, Number(input.maintenance) || 0);
  const capex = Math.max(0, Number(input.capexReserve) || 0);
  const management = Math.max(0, Number(input.management) || 0);
  const hoa = Math.max(0, Number(input.hoaOwnerUtilities) || 0);
  const debt = Math.max(0, Number(input.debtService) || 0);
  const other = Math.max(0, Number(input.otherOperating) || 0);
  const operating = vacancy + taxes + insurance + maintenance + capex + management + hoa + other;
  const monthlyCashFlow = rent - operating - debt;
  const annualCashFlow = monthlyCashFlow * 12;
  const cashInvested =
    Math.max(0, Number(input.purchase) || 0) + Math.max(0, Number(input.rehabClosingInitial) || 0);
  const cashOnCashPercent = cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : 0;
  return { monthlyCashFlow, annualCashFlow, cashInvested, cashOnCashPercent };
}
