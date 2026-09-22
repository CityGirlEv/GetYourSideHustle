/**
 * Garage Sale Helper (`garage-sale-helper`, Guide #071).
 * Pro Membership. 2 - 8 hrs/week. Displayed $10 – $40 / job (examples).
 * Plain data only — no imports from guide-tools.
 */

export const GARAGE_SALE_HELPER_REALITY_CHECK = {
  title: "THE OWNER CONTROLS THE GOODS, PRICES, AND MONEY",
  body: [
    "Help an owner sort, group, price, display, promote, and sell approved household items at a garage sale — or manage the sales table while the owner restocks — using clear authority limits and accurate cash/payment reconciliation.",
    "",
    "The helper must not assume an item is available, lower a price, accept a bundle, give merchandise away, take payment offsite, or remove unsold goods without the owner’s authorization.",
    "",
    "Before quoting confirm: sale date/hours; location and permit/sign rules; approximate item volume; setup and cleanup duties; pricing authority; negotiation limits; cash/payment method; who controls valuables; rain/cancellation plan; unsold-item plan; helper payment.",
    "",
    "Anyone under 18 should have parent/guardian approval and an appropriate responsible adult present throughout customer-facing work.",
    "",
    "Do not sell recalled or unsafe products, stolen or unauthorized property, counterfeit goods, prescription medication, personal information/documents, or weapons, ammunition, alcohol, tobacco, regulated products, or hazardous materials without full legal compliance — beginners should exclude them.",
    "",
    "Check products against the CPSC recall database: https://www.cpsc.gov/Recalls",
    "IRS Form 1099-K information: https://www.irs.gov/newsroom/form-1099-k-faqs-what-to-do-if-you-receive-a-form-1099-k",
    "",
    "Tagline: Price It. Display It. Track It. Clear It Out.",
  ].join("\n"),
};

export const GARAGE_SALE_HELPER_NOTES_WORKSHEET = `GARAGE SALE HELPER NOTES

BUSINESS SETUP
Hourly Rate: $____
Package Rate: $____
Commission: ____%
Minimum Pay: $____
Overtime: $____
Rain/Cancellation Rule: ________

OWNER/SALE
Owner: ________
Private Address: ________
Sale Date/Hours: ________
Permit/HOA Checked: ☐
Sign Rules Checked: ☐
Responsible Adult: ________
Payment Methods: ________

INVENTORY
Owner-Approved Items: ____
Recall/Safety Checks: ________
High-Value Items: ________
Excluded Items: ________
Negotiation Floor: ________

RECONCILIATION
Starting Cash: $____
Cash Sales: $____
Digital Sales: $____
Refunds: $____
Expected Cash: $____
Actual Cash: $____
Difference: $____

RESULTS
Gross Sales: $____
Helper Pay: $____
Helper Expenses: $____
Helper Profit: $____
Unsold Plan Completed: ☐
Review Requested: ☐

GYSH PRO TIP
One checkout point and one written tally prevent a surprising amount of end-of-day confusion.
OWNER APPROVAL → SCREEN ITEMS → PRICE → DISPLAY → TRACK EVERY SALE → RECONCILE → CLEAN UP.`;

export const GARAGE_SALE_HELPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Help an owner sort, group, price, display, promote, and sell approved household items at a garage sale — or manage the sales table while the owner restocks. Tagline: Price It. Display It. Track It. Clear It Out. Category: Local Sales & Event Support. Best for Kids, Teens, Adults, and Seniors who are organized, friendly, accurate with money, and comfortable working with a responsible owner. Beginner · Very Low startup · Weekends / Seasonal / Event-Based · Owner’s Driveway, Garage, Yard, or Approved Sale Location · Hourly / Setup Package / Sale-Day Package / Agreed Commission · 2 - 8 hrs/week · Pro Membership. Displayed $10 – $40 / job is examples only.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Owner authorization · Parent/guardian approval if under 18 · Responsible adult onsite · Safe sale location and weather plan · Local permit/sign-rule check · Inventory/category plan · Price labels and owner-approved negotiation rules · Cash/payment procedure · Sale tally and reconciliation sheet · Calendar and helper payment agreement.",
  },
  {
    id: "before",
    label: "Before accepting",
    detail:
      "Who owns the items? Are any items consigned from other households? Will there be jewelry, collectibles, electronics, tools, baby items, children’s products, medical devices, weapons, alcohol, tobacco, medications, food, recalled goods, counterfeit goods, or personal documents? Who decides prices? Who handles disputes/refunds? Where will cash and high-value items be secured?",
  },
  {
    id: "safety",
    label: "Item, permit, and tax boundaries",
    detail:
      "Do not sell recalled/unsafe, stolen, counterfeit, prescription, personal-document, or beginner-excluded regulated goods. CPSC recalls: https://www.cpsc.gov/Recalls Garage-sale permits, frequency limits, signs, hours, parking, HOA rules, sales tax, business licensing, and food sales vary locally. Do not give tax advice. IRS Form 1099-K: https://www.irs.gov/newsroom/form-1099-k-faqs-what-to-do-if-you-receive-a-form-1099-k",
  },
];

export const GARAGE_SALE_HELPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "CPSC Recalls", url: "https://www.cpsc.gov/Recalls", note: "Screen children’s products, appliances, tools, and safety equipment" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Owner intake" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Inventory, prices, sales tally, reconciliation" },
  { label: "Canva", url: "https://www.canva.com/", note: "Permitted signs and online graphics" },
  { label: "IRS Form 1099-K FAQs", url: "https://www.irs.gov/newsroom/form-1099-k-faqs-what-to-do-if-you-receive-a-form-1099-k", note: "Do not give tax advice" },
];

export const GARAGE_SALE_HELPER_SUPPLIES = {
  starterKitTotal: "About $10–25 for tags, markers, and tally sheets — tables and cash are owner-supplied",
  items: [
    { id: "tags", name: "Price stickers / tags", qty: "1 pack", estCost: "$3–8", notes: "Core" },
    { id: "markers", name: "Permanent markers", qty: "1 set", estCost: "$2–6", notes: "Core" },
    { id: "tape", name: "Removable tape", qty: "1 roll", estCost: "$2–5", notes: "Core" },
    { id: "signs", name: "Poster board / signs where permitted", qty: "as needed", estCost: "$3–10", notes: "Core" },
    { id: "tally", name: "Inventory / tally sheets and pens", qty: "1 set", estCost: "$0–5", notes: "Core" },
    { id: "bags", name: "Shopping bags / packing paper / trash bags", qty: "1 pack", estCost: "$4–10", notes: "Core" },
    { id: "sanitizer", name: "Hand sanitizer / weather protection", qty: "1", estCost: "$3–8", notes: "Core" },
    { id: "tables", name: "Tables / racks supplied or approved by owner", qty: "as needed", estCost: "$0", notes: "Owner-provided" },
    { id: "cashbox", name: "Cash apron / box controlled by responsible adult", qty: "1", estCost: "$0", notes: "Owner-controlled" },
    { id: "charger", name: "Portable phone charger", qty: "1", estCost: "$0–15", notes: "Optional", optional: true },
    { id: "rack", name: "Clothing rack / hangers / mirror", qty: "as needed", estCost: "$0–20", notes: "Optional", optional: true },
  ],
};

export const GARAGE_SALE_HELPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Owner intake", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Inventory, prices, sales tally, reconciliation", url: "https://sheets.google.com/" },
  { id: "docs", name: "Google Docs", freePlanAvailable: true, costNote: "Service agreement and sale-day checklist", url: "https://docs.google.com/" },
  { id: "calendar", name: "Calendar", freePlanAvailable: true, costNote: "Prep / sale dates", url: "https://calendar.google.com/" },
  { id: "weather", name: "Weather app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Rain / heat / wind plan" },
  { id: "maps", name: "Maps", freePlanAvailable: true, planLabelApplicable: false, costNote: "Directions / parking notes" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Permitted signs and online graphics", url: "https://www.canva.com/" },
  { id: "camera", name: "Phone camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Item photos with owner permission" },
  { id: "pay", name: "Payment app / processor", freePlanAvailable: true, costNote: "Owner-controlled account only", optional: true },
  { id: "cpsc", name: "CPSC Recall Search", freePlanAvailable: true, planLabelApplicable: false, costNote: "Product screening", url: "https://www.cpsc.gov/Recalls" },
  { id: "calc", name: "Calculator", freePlanAvailable: true, planLabelApplicable: false, costNote: "Totals, bundles, helper pay" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Owner Intake + Approved Price List + Sale Layout + Cash/Payment Procedure + Reconciliation Sheet" },
];

export const GARAGE_SALE_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $10 – $40 / job (examples, not guarantees).",
    "That range fits a short sorting, sign, or setup task. Full-sale support should be priced from actual hours, responsibility, setup, and cleanup.",
    "",
    "STARTER SERVICE EXAMPLES",
    "One-Hour Sorting/Pricing Assist: $15 – $35",
    "Two-Hour Setup Block: $30 – $70",
    "Four-Hour Sale-Day Table Assist: $60 – $140",
    "Setup + Four-Hour Sale Support: $100 – $225",
    "Full-Day Support: $150 – $350 depending on hours/scope",
    "Cleanup/Donation Prep: $30 – $100",
    "",
    "COMMISSION OPTION: If using a percentage of sales, put it in writing before setup. Example structures: 10–20% of gross sales for extensive pricing/display/sale management; flat minimum + smaller percentage; flat hourly rate only.",
    "Define: gross sales; owner discounts; returns/refunds; payment fees; items removed from sale; unsold items; when the helper is paid.",
    "",
    "COMMON ADD-ONS — EXAMPLES",
    "Sign Design/Printing: $15 – $40 plus printing",
    "Online Ad/Photo Set: $25 – $75",
    "Additional Hour: $15 – $35",
    "Donation Drop-Off: $20 – $60 plus mileage/fees",
    "Second Helper: separate rate",
    "",
    "MONTHLY EXAMPLES: 4 short jobs × $30 = $120 gross/month · 2 half-day sale packages × $125 = $250 gross/month · 2 full sale packages × $225 = $450 gross/month.",
    "Gross revenue is NOT profit. Do not guarantee earnings.",
  ].join("\n"),
  raiseTip:
    "Price from hours and responsibility, not a hoped-for commission. Examples only — not income guarantees.",
  items: [
    { id: "hour", label: "One-hour sorting / pricing assist", price: "$15 – $35" },
    { id: "setup", label: "Two-hour setup block", price: "$30 – $70" },
    { id: "table", label: "Four-hour sale-day table assist", price: "$60 – $140" },
    { id: "combo", label: "Setup + four-hour sale support", price: "$100 – $225" },
    { id: "full", label: "Full-day support", price: "$150 – $350", notes: "Depends on hours/scope" },
    { id: "cleanup", label: "Cleanup / donation prep", price: "$30 – $100" },
  ],
};

export const GARAGE_SALE_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Garage-Sale Services",
    desc: [
      "Choose offers: Sorting/Pricing · Setup/Display · Ad/Sign Support · Sale-Day Table Help · Cleanup/Donation Prep.",
      "List inclusions, exclusions, hours, and whether the owner must be present.",
    ].join("\n"),
  },
  {
    title: "Set Safety, Item & Money Rules",
    desc: [
      "Write: owner approves all items; owner sets prices/negotiation floor; no prohibited/recalled goods; responsible adult handles valuables and disputes; cash never left unattended; no customer enters the home; no solo minor operation; weather/traffic limits.",
    ].join("\n"),
  },
  {
    title: "Build Pricing & Helper-Pay Agreement",
    desc: [
      "Choose hourly, flat package, commission, or flat-plus-commission.",
      "Document: dates/hours; scope; rate/percentage; minimum pay; overtime; reimbursable supplies; gross-sale definition; payment date; cancellation/rain plan.",
    ].join("\n"),
  },
  {
    title: "Complete Owner Intake & Rule Check",
    desc: [
      "Confirm: owner/contact; private address; permit/HOA/sign rules; sale hours; item categories; excluded items; high-value items; tables/racks; cash/payment method; negotiation rules; unsold-item plan.",
    ].join("\n"),
  },
  {
    title: "Sort, Screen & Price Inventory",
    desc: [
      "Create zones: KEEP/NOT FOR SALE · SELL · RESEARCH · RECALL/SAFETY CHECK · DONATE · DISCARD.",
      "Group sale items by category. Check condition and missing parts. Search recalls at https://www.cpsc.gov/Recalls where relevant. Owner approves final price and minimum.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3: permitted street signs; neighborhood group; garage-sale listing site/app; community board; owner’s social account.",
      "Do not publish valuables, empty-home information, private documents, or a minor’s contact details.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create: date/time; general area/address as the owner approves; top categories; payment types; rain policy.",
      "Use Canva (https://www.canva.com/) for permitted signs. Keep house numbers small or use cross streets on highway signs.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2 or 3 channels the owner approved. Post or place signs within permit/HOA rules.",
      "Build the sale layout: high-value items near the owner; clear aisles; heavy items low; children’s hazards/sharp tools controlled; labeled categories and prices; SOLD and HOLD procedures; one checkout point.",
      "Count starting cash with the owner before opening.",
    ].join("\n"),
  },
  {
    title: "Run the Table Within Your Authority",
    desc: [
      "Greet customers. Answer basic item questions honestly. Use owner-approved bundle/discount rules. Record each sale. Mark sold items. Watch cash and merchandise. Call the owner for exceptions, disputes, returns, or high-value negotiations.",
      "Do not make product-safety, condition, authenticity, or warranty claims you cannot verify.",
    ].join("\n"),
  },
  {
    title: "Close, Reconcile, Clean Up & Get Paid",
    desc: [
      "Stop transactions at the agreed time. Count cash with the owner in a private area. Compare cash, digital payments, refunds, and tally sheet.",
      "Reconciliation: Starting Cash + Cash Sales − Cash Refunds = Expected Cash. Document discrepancies; do not hide them.",
      "Remove signs promptly as required. Separate sold, owner-keep, donate, and discard items. Do not remove unsold goods without authorization. Return keys, cash, devices, and supplies. Collect helper pay.",
      "Record revenue, supplies, printing, travel, payment fees, helper labor, and total hours.",
    ].join("\n"),
  },
  {
    title: "Review Results & Book the Next Sale",
    desc: [
      "Track: gross sales; items sold; best categories; discounts; unsold inventory; weather/traffic; helper profit.",
      "Ask for a review/referral. Offer a second sale, estate/garage-sale preparation, or donation-prep session within your service scope.",
    ].join("\n"),
  },
];

export function garageSaleHelperToolsDisclaimer(): string {
  return "Beginner stack: Owner Intake + Approved Price List + Sale Layout + Cash/Payment Procedure + Reconciliation Sheet. Never leave cash, customer payment screens, valuables, sharp tools, or sensitive documents unattended. The owner controls goods, prices, and money.";
}

export function computeGarageSaleHelperProfit(input: {
  gshShortJobs?: number;
  gshAvgShortPrice?: number;
  gshSalePackages?: number;
  gshAvgPackagePrice?: number;
  gshCommissionRevenue?: number;
  gshAddOnRevenue?: number;
  gshSignsPrinting?: number;
  gshTagsBagsSupplies?: number;
  gshTravel?: number;
  gshPaymentFees?: number;
  gshUnrecoveredPermitAds?: number;
  gshOtherExpenses?: number;
  gshSortingPricingHours?: number;
  gshSetupSaleCleanupHours?: number;
  gshTravelAdminHours?: number;
}): {
  shortRevenue: number;
  packageRevenue: number;
  grossServiceRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const shortRevenue = n(input.gshShortJobs) * n(input.gshAvgShortPrice);
  const packageRevenue = n(input.gshSalePackages) * n(input.gshAvgPackagePrice);
  const grossServiceRevenue =
    shortRevenue + packageRevenue + n(input.gshCommissionRevenue) + n(input.gshAddOnRevenue);
  const totalExpenses =
    n(input.gshSignsPrinting) +
    n(input.gshTagsBagsSupplies) +
    n(input.gshTravel) +
    n(input.gshPaymentFees) +
    n(input.gshUnrecoveredPermitAds) +
    n(input.gshOtherExpenses);
  const estimatedProfit = grossServiceRevenue - totalExpenses;
  const totalHours =
    n(input.gshSortingPricingHours) + n(input.gshSetupSaleCleanupHours) + n(input.gshTravelAdminHours);
  return {
    shortRevenue,
    packageRevenue,
    grossServiceRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: grossServiceRevenue > 0 ? (estimatedProfit / grossServiceRevenue) * 100 : 0,
  };
}
