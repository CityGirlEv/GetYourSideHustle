/**
 * Amazon FBA Seller (`amazon`, Guide #033).
 * Elite. 15 - 30 hrs/week. Displayed $1,000 - $50,000/mo gross sales (examples).
 * Plain data only — no imports from guide-tools.
 */

export const AMAZON_FBA_SELLER_REALITY_CHECK = {
  title: "FBA FULFILLS ORDERS; IT DOES NOT REMOVE SELLER RESPONSIBILITY OR INVENTORY RISK",
  body: [
    "Amazon may store, pick, pack, ship, handle customer service, and process returns for FBA inventory. The seller still owns sourcing, legality, safety, labeling, authenticity, listing accuracy, taxes, cash flow, compliance documents, recalls, fees, and unsold inventory decisions.",
    "",
    "Before ordering inventory, confirm:",
    "- Seller-account eligibility and identity/business documents",
    "- Marketplace and selling plan",
    "- Product/category approval and restricted-product status",
    "- Product safety, testing, labeling, packaging, warning, and traceability requirements",
    "- Supplier identity, invoices, quality control, and authenticity",
    "- Patent, trademark, copyright, design, and brand-name risk",
    "- Exact dimensions and shipping weight",
    "- Landed cost through Amazon check-in",
    "- Referral, FBA, storage, placement, return, removal/disposal, advertising, and other fees",
    "- Realistic sale price, returns, ad cost, and inventory velocity",
    "- Tax/import/customs obligations",
    "- Capital-at-risk and exit plan",
    "",
    "Never place a large order from a spreadsheet estimate alone. Validate the product, supplier, compliance documents, samples, and current Amazon fee estimate first.",
    "",
    "Tagline: Know the Product. Know Every Cost. Protect the Account.",
  ].join("\n"),
};

export const AMAZON_FBA_SELLER_NOTES_WORKSHEET = `AMAZON FBA SELLER NOTES

PRODUCT SCREEN
Product/Variation: _____________________________
Marketplace/Category: __________________________
Customer Problem: ______________________________
Differentiation: _______________________________
Target Price: $____
Packaged Dimensions/Weight: ___________________

COMPLIANCE AND RIGHTS
Restricted/Approval Check Date: _______________
Applicable Laws/Standards: ____________________
Testing/Certificates: _________________________
Label/Warning Requirements: ___________________
Trademark/Patent/Copyright Review: ____________
Insurance Requirement: ________________________
Open Questions/Qualified Adviser: ______________

SUPPLIER AND ORDER
Supplier/Contact: ______________________________
Sample Approved: Yes / No
Written Specification: ________________________
MOQ/Unit Cost: ________________________________
Lead Time: ____________________________________
Inspection Plan: ______________________________
Freight/Customs Terms: _________________________

UNIT ECONOMICS
Selling Price: $____
Landed Cost: $____
Referral/FBA/Storage/Placement: $____
Advertising per Order: $____
Return Allowance: $____
Contribution Profit per Unit: $____

BUSINESS TRACKER
Units Ordered/Received/Checked In: ____________
Units Sold/Returned: __________________________
Gross Sales: $____
Net Sales Collected: $____
Total Expenses: $____
Monthly Profit: $____
Inventory Cash Tied Up: $____
Reorder/Exit Decision: ________________________

RED FLAGS — STOP OR INVESTIGATE
- Product/category restriction or compliance requirement is unresolved
- Supplier will not provide identity, invoices, samples, specifications, or verifiable documents
- Margin works only by ignoring ads, returns, storage, duties, or fees
- Product copies another brand, design, listing, photo, or protected feature
- Safety, label, warning, testing, or authenticity concern remains open
- Large MOQ would consume the full cash reserve
- Seller proposes review manipulation, duplicate accounts, or altered documents
- Reorder is based on gross sales while cash/profit reports disagree

GYSH PRO TIP
The best first FBA product is not the one with the biggest revenue screenshot. It is the one whose compliance, supplier, packaged dimensions, landed cost, current fees, small-order test, and exit plan you can explain line by line.

STARTER CHALLENGE
Build a one-product go/no-go sheet today. Include customer problem, restrictions, compliance documents, IP risk, three supplier quotes, packaged dimensions, landed cost, every Amazon fee, ad/return allowance, contribution profit, startup cash, and exit plan. Do not order inventory yet.`;

export const AMAZON_FBA_SELLER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Build and sell a physical-product brand through Amazon, using Fulfillment by Amazon when its economics and requirements fit. The seller selects and sources the product, owns the inventory risk, confirms product and intellectual-property compliance, creates truthful listings, sends prepared stock to Amazon, manages advertising and account health, and tracks profit after every fee and return—not just top-line sales. Tagline: Know the Product. Know Every Cost. Protect the Account. Category: E-Commerce / Physical Products. Best for adults prepared to research products, fund inventory, manage compliance, analyze unit economics, and accept inventory risk. Advanced Beginner–Advanced · Over $1,000 startup · Ongoing Inventory / Listing / Advertising / Compliance · Online + Suppliers · Product Sales · Elite · 15 - 30 hrs/week · Displayed $1,000 - $50,000/mo gross sales examples — not profit and not guarantees.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Adult-controlled seller/business, bank, payment-card, identity, and tax information · Startup capital you can afford to have tied up or lose · Product research and unit-economics spreadsheet · Verified supplier and physical samples · Product compliance and document file · Quality-control and inspection plan · Trademark/IP screening appropriate to the product · Packaging, label, prep, freight, and customs plan · Seller Central/FBA training and account-security process · Bookkeeping, cash-flow, inventory, and profit tracker.",
  },
  {
    id: "compliance",
    label: "Compliance and prohibited conduct",
    detail:
      "Confirm all requirements for the exact product and destination. Children's products, food, cosmetics, supplements, medical products, electronics, batteries, pesticides, textiles, hazardous goods, and products making health/safety claims may trigger specialized laws, tests, registrations, labels, or Amazon documentation. Do not use another brand's product, packaging, photos, listing copy, trademark, UPC, certificates, invoices, or reviews without authorization. Do not buy or manipulate reviews, create duplicate accounts to avoid enforcement, misclassify products, or submit altered compliance documents. Get qualified legal, tax, customs, testing, insurance, or regulatory advice when needed.",
  },
];

export const AMAZON_FBA_SELLER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Amazon Sell Homepage and Seller University", url: "https://sell.amazon.com/" },
  { label: "Amazon Pricing and Revenue Calculator", url: "https://sell.amazon.com/pricing" },
  { label: "Amazon Estimate Fees and Costs", url: "https://sell.amazon.com/pricing/estimate" },
  { label: "Amazon Fulfillment by Amazon", url: "https://sell.amazon.com/fulfillment-by-amazon" },
  { label: "Amazon FBA Beginner Workflow", url: "https://sell.amazon.com/blog/amazon-fba-for-beginners" },
  { label: "U.S. Consumer Product Safety Commission Business Guidance", url: "https://www.cpsc.gov/Business--Manufacturing/Business-Education" },
  { label: "USPTO Trademark Search", url: "https://www.uspto.gov/trademarks/search" },
  { label: "U.S. Copyright Office", url: "https://www.copyright.gov/what-is-copyright/" },
  { label: "SBA Licenses and Permits", url: "https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits" },
  { label: "IRS Self-Employed Individuals Tax Center", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
];

export const AMAZON_FBA_SELLER_SUPPLIES = {
  starterKitTotal:
    "Over $1,000 typical — inventory, samples, compliance testing, and prep/shipment costs dominate; verify current Amazon fee estimates before ordering",
  items: [
    { id: "account", name: "Seller account and secured business email", qty: "1", estCost: "Varies", notes: "Essential" },
    { id: "bank-tax", name: "Bank, payment, identity, and tax records", qty: "1 set", estCost: "$0", notes: "Essential" },
    { id: "workbook", name: "Product research/unit-economics workbook", qty: "1", estCost: "$0", notes: "Core" },
    { id: "supplier-dd", name: "Supplier due-diligence and quote comparison", qty: "1", estCost: "$0", notes: "Core" },
    { id: "samples", name: "Physical product samples", qty: "Multiple", estCost: "$50–500+", notes: "Core — before bulk order" },
    { id: "specs", name: "Product specifications and bill of materials", qty: "1", estCost: "$0", notes: "Core where applicable" },
    { id: "compliance", name: "Compliance tests/certificates/labels required for the product", qty: "1 file", estCost: "Varies", notes: "Core" },
    { id: "inspection", name: "Inspection checklist", qty: "1", estCost: "$0", notes: "Core" },
    { id: "packaging", name: "Packaging, barcode/label, carton, prep, and shipment plan", qty: "1", estCost: "Varies", notes: "Core" },
    { id: "listing-assets", name: "Product photos/copy/keywords created lawfully", qty: "1 set", estCost: "$0–500+", notes: "Core" },
    { id: "tracker", name: "Inventory, cash-flow, advertising, return, and profit tracker", qty: "1", estCost: "$0", notes: "Core" },
    { id: "ip-review", name: "Trademark attorney or IP review", qty: "1", estCost: "Varies", notes: "Helpful", optional: true },
    { id: "testing-lab", name: "Testing laboratory/compliance specialist", qty: "1", estCost: "Varies", notes: "Helpful when required", optional: true },
    { id: "freight", name: "Freight forwarder/customs broker", qty: "1", estCost: "Varies", notes: "Helpful for imports", optional: true },
    { id: "tpi", name: "Third-party inspection", qty: "1", estCost: "Varies", notes: "Helpful", optional: true },
    { id: "insurance", name: "Product-liability insurance", qty: "1 policy", estCost: "Varies", notes: "Helpful", optional: true },
    { id: "bookkeeper", name: "Bookkeeper/tax adviser", qty: "1", estCost: "Varies", notes: "Helpful", optional: true },
    { id: "brand-registry", name: "Brand Registry when eligible under current requirements", qty: "1", estCost: "$0", notes: "Helpful when eligible", optional: true },
  ],
};

export const AMAZON_FBA_SELLER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "sell", name: "Amazon Sell Homepage and Seller University", freePlanAvailable: true, costNote: "Account setup and training", url: "https://sell.amazon.com/" },
  { id: "pricing", name: "Amazon Pricing and Revenue Calculator", freePlanAvailable: true, costNote: "Current fee research", url: "https://sell.amazon.com/pricing" },
  { id: "estimate", name: "Amazon Estimate Fees and Costs", freePlanAvailable: true, costNote: "Exact category/dimension/weight estimate", url: "https://sell.amazon.com/pricing/estimate" },
  { id: "fba", name: "Amazon Fulfillment by Amazon", freePlanAvailable: true, costNote: "FBA requirements and costs", url: "https://sell.amazon.com/fulfillment-by-amazon" },
  { id: "fba-workflow", name: "Amazon FBA Beginner Workflow", freePlanAvailable: true, costNote: "Send to Amazon workflow", url: "https://sell.amazon.com/blog/amazon-fba-for-beginners" },
  { id: "cpsc", name: "U.S. Consumer Product Safety Commission Business Guidance", freePlanAvailable: true, costNote: "Product safety rules", url: "https://www.cpsc.gov/Business--Manufacturing/Business-Education" },
  { id: "uspto", name: "USPTO Trademark Search", freePlanAvailable: true, costNote: "IP screening — not legal clearance alone", url: "https://www.uspto.gov/trademarks/search" },
  { id: "copyright", name: "U.S. Copyright Office", freePlanAvailable: true, costNote: "Copyright basics", url: "https://www.copyright.gov/what-is-copyright/" },
  { id: "sba", name: "SBA Licenses and Permits", freePlanAvailable: true, costNote: "Business registration", url: "https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits" },
  { id: "irs", name: "IRS Self-Employed Individuals Tax Center", freePlanAvailable: true, costNote: "Tax and recordkeeping", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "One Product Hypothesis + Small Sample Order + Compliance File + Conservative Unit Economics + Current Fee Estimate + Small Test Inventory + Reorder/Exit Rules" },
];

export const AMAZON_FBA_SELLER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $1,000 - $50,000/mo (monthly gross-sales examples, not profit and not guarantees).",
    "Amazon sellers set product prices, not service-project fees. A viable price must cover landed product cost, Amazon fees, advertising, returns, overhead, discounts, and taxes while leaving enough profit and cash to reorder.",
    "",
    "UNIT ECONOMICS",
    "Selling Price",
    "− Referral Fee",
    "− FBA Fulfillment Fee",
    "− Storage/Placement/Other Per-Unit Fees",
    "− Landed Product Cost",
    "− Advertising Cost per Order",
    "− Returns/Refunds Allowance",
    "− Other Variable Costs",
    "= Estimated Contribution Profit per Unit",
    "",
    "LANDED PRODUCT COST INCLUDES",
    "- Factory/wholesale unit price",
    "- Packaging and labeling",
    "- Inspection/testing allocation",
    "- Freight and insurance",
    "- Duties/tariffs/customs/brokerage",
    "- Prep center or inbound handling",
    "- Shipping/placement to Amazon",
    "",
    "PRICE TESTING RULES",
    "- Calculate with Amazon's current fee estimate for exact category, dimensions, and weight",
    "- Model conservative, expected, and strong scenarios",
    "- Include discounts/coupons and tax treatment correctly",
    "- Recalculate after final packaged measurements",
    "- Protect a minimum contribution margin",
    "- Do not chase a competitor below your break-even price",
    "",
    "MONTHLY SALES EXAMPLES — NOT GUARANTEES",
    "100 units × $20 = $2,000 gross sales/month",
    "300 units × $25 = $7,500 gross sales/month",
    "1,000 units × $30 = $30,000 gross sales/month",
    "",
    "Example only: 300 units × $6 contribution profit = $1,800 contribution profit before fixed overhead and personal/business taxes—even though gross sales are $7,500.",
    "",
    "The displayed $1,000–$50,000/month is not a startup promise. New products may sell little or nothing, lose money, be returned, become restricted, or leave inventory that costs money to store/remove.",
  ].join("\n"),
  raiseTip:
    "Raise price only when contribution profit, demand, and account health support it — never below break-even to chase a competitor. Displayed gross sales examples are not profit guarantees.",
  items: [
    { id: "low", label: "Monthly gross sales example (starter volume)", price: "$2,000/mo", notes: "100 units × $20 — not profit" },
    { id: "mid", label: "Monthly gross sales example (mid volume)", price: "$7,500/mo", notes: "300 units × $25 — not profit" },
    { id: "high", label: "Monthly gross sales example (strong volume)", price: "$30,000/mo", notes: "1,000 units × $30 — not profit" },
    { id: "contribution", label: "Contribution profit example", price: "$6/unit", notes: "300 × $6 = $1,800 before fixed overhead" },
  ],
};

export const AMAZON_FBA_SELLER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Set the Capital Limit and Business Rules",
    desc: [
      "Choose the maximum cash you can risk, target marketplace, legal/business setup, bookkeeping method, insurance review, and categories you will not enter.",
      "Keep an operating reserve outside inventory.",
    ].join("\n"),
  },
  {
    title: "Research a Product Problem, Not a Trend Screenshot",
    desc: [
      "Study customer needs, competing offers, price bands, review patterns, seasonality, search demand, size/weight, returns, restrictions, and differentiation.",
      "Record sources and dates.",
    ].join("\n"),
  },
  {
    title: "Screen Compliance and Intellectual Property",
    desc: [
      "Identify product laws, tests, labels, warnings, category approval, dangerous-goods questions, patents, trademarks, copyrights, design rights, and brand restrictions.",
      "Stop if required proof or lawful differentiation is missing.",
    ].join("\n"),
  },
  {
    title: "Find and Verify Suppliers",
    desc: [
      "Compare multiple suppliers, business identity, experience, sample quality, specifications, minimum order, lead time, payment terms, packaging, compliance documents, and references.",
      "Treat certificates as items to verify, not decorations.",
    ].join("\n"),
  },
  {
    title: "Build Conservative Unit Economics",
    desc: [
      "Use exact packaged dimensions/weight and Amazon's current calculator. Include landed cost, referral/FBA/storage/placement fees, advertising, returns, discounts, overhead, and taxes.",
      "Model slow sales and price pressure.",
    ].join("\n"),
  },
  {
    title: "Order Samples and Test the Complete Product",
    desc: [
      "Inspect function, materials, durability, packaging, label, instructions, warnings, barcode, customer experience, and shipping condition.",
      "Arrange qualified testing and professional review where required.",
    ].join("\n"),
  },
  {
    title: "Build the Brand and Truthful Listing",
    desc: [
      "Choose a lawful name, create original photos/copy, describe only verified features, and avoid prohibited claims, keyword manipulation, competitor marks, or deceptive comparisons.",
      "Explain exactly what the customer receives.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3 launch channels for this product: Amazon Sponsored Products/Brands; social proof content; influencer or affiliate partnerships; email/list building where compliant; retail/wholesale outreach if applicable.",
      "Set measurable goals such as: test 3 ad keywords; publish 5 listing images; reach 10 warm contacts in the niche.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Prepare lawful listing photos, A+ or brand content, keywords, and launch creative that match verified product facts.",
      "Do not copy competitor photos, claims, or trademarks. Do not promise results the product cannot support.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2 or 3 channels you chose for launch.",
      "☐ Set a controlled ad budget with current fee-aware targets.",
      "☐ Publish the truthful listing and monitor early conversion.",
      "☐ Track launch spend against contribution profit — not gross sales alone.",
      "Track: Date | Channel | Spend | Clicks/Views | Orders | Return Signals | KEEP / IMPROVE / STOP.",
    ].join("\n"),
  },
  {
    title: "Launch Inventory, Monitor Account Health & Reorder or Exit",
    desc: [
      "Place a small controlled inventory order with written specifications, approved golden sample, inspection standard, and contingency.",
      "Prep, label, and ship to FBA per current Send to Amazon requirements. Track factory count, freight count, delivered count, checked-in count, discrepancies, and total landed cost.",
      "Set a controlled price and ad budget. Monitor listing status, inventory, returns, feedback, compliance requests, advertising cost, conversion, and account notifications.",
      "Reconcile profit and cash, inspect return reasons, forecast lead time, and set a reorder point. Reorder only when contribution profit and demand support it.",
      "Pattern: RESEARCH → COMPLIANCE → SAMPLES → UNIT ECONOMICS → SMALL ORDER → LAUNCH → RECONCILE.",
    ].join("\n"),
  },
];

export function amazonFbaSellerToolsDisclaimer(): string {
  return "Beginner stack: One Product Hypothesis + Small Sample Order + Compliance File + Conservative Unit Economics + Current Fee Estimate + Small Test Inventory + Reorder/Exit Rules. Verify current Amazon fees and policies for the exact marketplace and product before ordering or repricing. Amazon approval does not replace government compliance.";
}

/** Example: 300 × $25 = $7,500 gross; $300 refunds → $7,200 net; COGS $2,400; fees $2,250; ads $900; fixed $350 → $1,300 profit (~18.1% margin) */
export function computeAmazonFbaSellerProfit(input: {
  amzUnitsSold?: number;
  amzAvgSellingPrice?: number;
  amzRefunds?: number;
  amzOtherCredits?: number;
  amzLandedCostPerUnit?: number;
  amzReferralFees?: number;
  amzFbaFulfillmentFees?: number;
  amzStoragePlacementOther?: number;
  amzAdvertising?: number;
  amzCouponsPromotions?: number;
  amzOtherVariableCosts?: number;
  amzSellingPlanSoftware?: number;
  amzTestingCompliance?: number;
  amzInsuranceProfessional?: number;
  amzPhotographyDesign?: number;
  amzOtherOverhead?: number;
  amzUnitsOnHand?: number;
  amzLeadTimeDays?: number;
  amzAvgUnitsSoldPerDay?: number;
}): {
  grossProductSales: number;
  netSalesCollected: number;
  costOfGoodsSold: number;
  amazonFeesTotal: number;
  advertisingPromotionsTotal: number;
  fixedCostsTotal: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerUnit: number | null;
  netMarginPercent: number;
  inventoryCashTiedUp: number;
  reorderPoint: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const units = n(input.amzUnitsSold);
  const grossProductSales = units * n(input.amzAvgSellingPrice);
  const netSalesCollected = grossProductSales - n(input.amzRefunds) + n(input.amzOtherCredits);
  const costOfGoodsSold = units * n(input.amzLandedCostPerUnit);
  const amazonFeesTotal =
    n(input.amzReferralFees) + n(input.amzFbaFulfillmentFees) + n(input.amzStoragePlacementOther);
  const advertisingPromotionsTotal = n(input.amzAdvertising) + n(input.amzCouponsPromotions);
  const variableOther = n(input.amzOtherVariableCosts);
  const fixedCostsTotal =
    n(input.amzSellingPlanSoftware) +
    n(input.amzTestingCompliance) +
    n(input.amzInsuranceProfessional) +
    n(input.amzPhotographyDesign) +
    n(input.amzOtherOverhead);
  const totalExpenses =
    costOfGoodsSold + amazonFeesTotal + advertisingPromotionsTotal + variableOther + fixedCostsTotal;
  const estimatedProfit = netSalesCollected - totalExpenses;
  const landed = n(input.amzLandedCostPerUnit);
  const leadTime = n(input.amzLeadTimeDays);
  const dailySales = n(input.amzAvgUnitsSoldPerDay);
  return {
    grossProductSales,
    netSalesCollected,
    costOfGoodsSold,
    amazonFeesTotal,
    advertisingPromotionsTotal,
    fixedCostsTotal,
    totalExpenses,
    estimatedProfit,
    profitPerUnit: units > 0 ? estimatedProfit / units : null,
    netMarginPercent: netSalesCollected > 0 ? (estimatedProfit / netSalesCollected) * 100 : 0,
    inventoryCashTiedUp: n(input.amzUnitsOnHand) * landed,
    reorderPoint: leadTime * dailySales,
  };
}
