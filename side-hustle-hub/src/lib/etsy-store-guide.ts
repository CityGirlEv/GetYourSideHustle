/**
 * Build an Etsy Store (`etsy-store`, Guide #042).
 * Etsy is not a general resale marketplace — verify current Creativity Standards.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const ETSY_STORE_REALITY_CHECK = {
  title: "ETSY IS NOT A GENERAL RESALE MARKETPLACE",
  body: [
    "Before building inventory, verify products qualify under Etsy’s CURRENT Creativity Standards and Seller Policy.",
    "",
    "Do not assume any “curated” or wholesale product can be resold on Etsy. Depending on current rules, eligible products may include qualifying items made by the seller, designed by the seller, handpicked by the seller (including qualifying vintage/curated categories), or sourced by the seller in qualifying categories such as certain craft/party supplies.",
    "",
    "If using a production partner, disclose it where Etsy requires it. Use accurate descriptions and required original/appropriate listing imagery. Do not copy other sellers’ photos, descriptions, trademarks, characters, logos, or copyrighted designs. Never guarantee sales or income.",
    "",
    "The seller controls the Etsy account, payment account, bank information, and identity verification.",
    "",
    "Tagline: Build the Shop. List the Products. Learn What Sells.",
  ].join("\n"),
};

export const ETSY_STORE_NOTES_WORKSHEET = `MY ETSY SHOP

Shop Name: ________
Product Lane: ________
Ideal Customer: ________
Etsy Eligibility Category: ________
Hero Product: ________
Physical / Digital: ________
Made-to-Order / Ready-to-Ship: ________
Production Partner: ________

PRODUCT COST
Materials/Product: $____
Labor: $____
Packaging: $____
Estimated Current Fees: $____
Shipping Absorbed: $____
Other: $____
Selling Price: $____
Estimated Profit/Sale: $____

SHOP CHECKLIST
☐ Current Etsy Policy Checked
☐ Seller Eligibility Checked
☐ Product Eligibility Checked
☐ Branding
☐ About
☐ Policies
☐ Production Partner Disclosed if required
☐ Shipping/Delivery
☐ Payment/Bank Setup

LISTING CHECKLIST
☐ Original/Allowed Photos
☐ Title
☐ Description
☐ Materials/Details
☐ Size
☐ Variations
☐ Processing Time
☐ Shipping
☐ Tags/Categories
☐ Price
☐ Profit Checked

MARKETING CHANNELS
1. ________
2. ________
3. ________

WEEKLY
New Listings Goal: ____
Listings Improved: ____
Photos Needed: ________
Products to Make: ________
Marketing Posts: ________

MONTHLY
Visits: ________
Orders: ________
Revenue: $____
Product Costs: $____
Etsy/Payment Fees: $____
Shipping: $____
Advertising: $____
Other Expenses: $____
Estimated Profit: $____
Hours: ____
Effective Profit/Hour: $____
Best Seller: ________
Most Profitable: ________
Needs Improvement: ________
Stop/Rework: ________
Next Product Test: ________

GYSH PRO TIP
DON'T BUILD 50 PRODUCTS BEFORE YOU KNOW WHETHER PEOPLE WANT THE FIRST 5.
CREATE A SMALL COLLECTION → LIST IT WELL → GET TRAFFIC → WATCH WHAT PEOPLE CLICK → TRACK WHAT SELLS → CHECK PROFIT → MAKE MORE OF THE WINNERS.
The goal is not the biggest Etsy shop. The goal is products people BUY profitably.

ELITE CHALLENGE
BUILD A 5-LISTING ETSY LAUNCH PACK:
1. Verify every product is Etsy-eligible
2. Calculate true cost
3. Set profitable pricing
4. Create strong photos/previews
5. Write 5 accurate listings
6. Set processing/shipping/delivery
7. Select 2–3 marketing channels
8. Build one week of marketing content
9. Build weekly listing habit
10. Create profit tracker
Review the first 30 days and improve from actual customer behavior.`;

export const ETSY_STORE_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Launch an Etsy shop for eligible handmade, designed, vintage/handpicked, or qualifying sourced goods. Build the shop foundation, photograph products, create accurate listings, set pricing and shipping, and develop a simple weekly listing-and-improvement habit. Tagline: Build the Shop. List the Products. Learn What Sells. Category: E-Commerce / Online Selling. Best for Teens where Etsy eligibility rules are satisfied, Adults, Seniors / Retirees. Beginner to intermediate · Low startup · Flexible · Online / home · Product sales · 5 - 12 hrs/week · Elite Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Etsy-eligible product · Etsy account/shop eligibility · Email and required bank/payment/identity/tax information · Smartphone/camera and internet · Inventory or production plan · Packaging/shipping plan for physical goods · Cost tracker and customer-service plan.",
  },
  {
    id: "before-launch",
    label: "Before launch, confirm",
    detail:
      "Product · Etsy eligibility category · Physical/digital · Made-to-order/ready-to-ship · Production partner · Product cost · Packaging · Shipping · Processing time · Return/exchange policy · Seller eligibility/age requirements · Shop name · Starting listing count.",
  },
  {
    id: "policy",
    label: "Current Etsy rules",
    detail:
      "Review Etsy’s CURRENT Seller Policy, Creativity Standards, prohibited-item rules, fee schedule, and listing requirements before launch. Fees and policies change — verify on Etsy’s official help pages rather than hard-coding amounts.",
  },
];

export const ETSY_STORE_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Etsy Seller Handbook", url: "https://www.etsy.com/seller-handbook", note: "Current shop and listing guidance" },
  { label: "Check Current Etsy Seller Fees", url: "https://www.etsy.com/legal/fees", note: "Official current fee schedule — amounts change" },
  { label: "Etsy Seller Policy", url: "https://www.etsy.com/legal/sellers", note: "Current seller rules" },
  { label: "Etsy Creativity Standards", url: "https://www.etsy.com/legal/policy/creativity-standards/239960351230", note: "What may be sold — verify before inventory" },
  { label: "Etsy Help Center", url: "https://help.etsy.com/", note: "Account, shipping, and listing help" },
  { label: "Canva", url: "https://www.canva.com/", note: "Simple listing graphics and pins" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Cost, listing, and profit tracker" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Photos and digital files" },
];

export const ETSY_STORE_SUPPLIES = {
  starterKitTotal:
    "About $15–60 to start lean — do not buy large inventory before learning what sells",
  items: [
    { id: "product", name: "Product / materials", qty: "starter batch", estCost: "varies", notes: "Essential — only Etsy-eligible goods" },
    { id: "packaging", name: "Packaging / mailers / boxes", qty: "1 pack", estCost: "$8–20", notes: "Essential for physical goods" },
    { id: "labels", name: "Labels", qty: "1 pack", estCost: "$4–10", notes: "Essential for physical goods" },
    { id: "scale", name: "Shipping scale if needed", qty: "1", estCost: "$10–25", notes: "Essential if you ship by weight" },
    { id: "tape", name: "Measuring tape", qty: "1", estCost: "$3–8", notes: "Essential for size listings" },
    { id: "printer", name: "Printer / label solution if needed", qty: "1", estCost: "$0–30", notes: "Essential if you print labels at home" },
    { id: "background", name: "Photo background", qty: "1", estCost: "$0–12", notes: "Essential" },
    { id: "phone", name: "Smartphone / camera", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "computer", name: "Computer (digital sellers)", qty: "1", estCost: "$0", notes: "Essential for digital products", optional: true },
    { id: "files", name: "Organized digital files / export formats", qty: "1 set", estCost: "$0", notes: "Essential for digital products", optional: true },
    { id: "tripod", name: "Tripod", qty: "1", estCost: "$10–25", notes: "Helpful", optional: true },
    { id: "light", name: "Lighting / light box", qty: "1", estCost: "$15–40", notes: "Helpful", optional: true },
    { id: "canva", name: "Canva", qty: "1", estCost: "$0", notes: "Helpful — free plan first", optional: true },
    { id: "sheets", name: "Sheets / Excel tracker", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "bins", name: "Storage bins", qty: "1–2", estCost: "$8–20", notes: "Helpful", optional: true },
    { id: "sku", name: "SKU labels", qty: "1 pack", estCost: "$4–10", notes: "Helpful", optional: true },
    { id: "inserts", name: "Appropriate inserts", qty: "1 pack", estCost: "$3–10", notes: "Helpful", optional: true },
  ],
};

export const ETSY_STORE_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "es_etsy",
    name: "Etsy Shop Manager",
    freePlanAvailable: true,
    costNote: "Current Etsy seller tools — verify fees, listing fields, and policies",
    url: "https://www.etsy.com/your/shops",
  },
  {
    id: "es_fees",
    name: "Check Current Etsy Seller Fees",
    freePlanAvailable: true,
    costNote: "Official fee page — do not hard-code amounts",
    url: "https://www.etsy.com/legal/fees",
  },
  {
    id: "es_camera",
    name: "Phone camera",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Photograph the actual product for physical goods",
  },
  {
    id: "es_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Simple listing graphics, banner, and pins",
    url: "https://www.canva.com/",
  },
  {
    id: "es_editor",
    name: "Basic photo editor",
    freePlanAvailable: true,
    costNote: "Crop and brighten — do not hide defects or misrepresent the product",
  },
  {
    id: "es_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Cost, listing, and profit tracker",
    url: "https://sheets.google.com/",
  },
  {
    id: "es_excel",
    name: "Excel",
    freePlanAvailable: true,
    costNote: "Alternate cost tracker",
    optional: true,
  },
  {
    id: "es_calc",
    name: "Calculator",
    freePlanAvailable: true,
    costNote: "Price formula before you list",
  },
  {
    id: "es_drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Photos and digital-product files",
    url: "https://drive.google.com/",
  },
  {
    id: "es_dropbox",
    name: "Dropbox",
    freePlanAvailable: true,
    costNote: "Alternate file storage",
    url: "https://www.dropbox.com/",
    optional: true,
  },
  {
    id: "es_ship",
    name: "Etsy shipping tools / carrier tools",
    freePlanAvailable: true,
    costNote: "Labels, tracking, and current carrier rates where available",
  },
  {
    id: "es_search",
    name: "Etsy search / marketplace research",
    freePlanAvailable: true,
    costNote: "Study similar listings without copying",
    url: "https://www.etsy.com/",
  },
  {
    id: "es_trends",
    name: "Google Trends",
    freePlanAvailable: true,
    costNote: "Optional demand research",
    url: "https://trends.google.com/",
    optional: true,
  },
  {
    id: "es_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Etsy + Phone Camera + Canva + Sheets + Shipping Tool",
  },
];

export const ETSY_STORE_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "The displayed $50 – $800 / month is an EARNINGS EXAMPLE, not a product price or guarantee.",
    "",
    "PRICE FORMULA:",
    "Materials/Product Cost + Labor + Packaging + Etsy Fees + Shipping Cost You Absorb + Advertising Allocation + Other Direct Cost + Desired Profit = Target Selling Price",
    "",
    "Example: Materials $6 + Labor $5 + Packaging $1.50 + estimated fees $2.50 + other $1 + desired profit $10 = $26 target price.",
    "",
    "Always calculate using the seller’s actual CURRENT Etsy fees and country-specific payment-processing costs. Etsy may charge listing, transaction, payment-processing, advertising, currency-conversion, shipping-label, subscription, regulatory, or other applicable fees. Do not permanently hard-code all Etsy fees because they can change.",
    "See Tools — Check Current Etsy Seller Fees.",
  ].join("\n"),
  raiseTip:
    "Would I still want this sale after ALL costs? Do not price from competitor listings alone. Examples only — not income guarantees.",
  items: [
    {
      id: "formula",
      label: "Target selling price",
      price: "Cost + labor + packaging + current fees + shipping you absorb + ads + profit",
      notes: "Use current Etsy fees for your country",
    },
    {
      id: "example",
      label: "Worked example",
      price: "$26 target",
      notes: "$6 materials + $5 labor + $1.50 packaging + $2.50 fees + $1 other + $10 profit",
    },
    {
      id: "earnings",
      label: "Displayed earnings example",
      price: "$50 – $800 / month",
      notes: "Example range only — not a product price or guarantee",
    },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 8–9. Use ☐ or - only — never ✓. */
export const ETSY_STORE_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose an Etsy-Eligible Product Lane",
    desc: [
      "Choose one:",
      "☐ Handmade physical goods",
      "☐ Seller-designed physical goods",
      "☐ Seller-designed digital products",
      "☐ Qualifying vintage/handpicked goods",
      "☐ Qualifying craft/party supplies",
      "☐ Other category currently permitted by Etsy",
      "",
      "Record:",
      "Product: ________",
      "Customer: ________",
      "Why They Buy It: ________",
      "Etsy Eligibility Category: ________",
      "",
      "VERIFY CURRENT ETSY ELIGIBILITY before investing.",
      "Do not build around mass-produced resale products that do not qualify.",
    ].join("\n"),
  },
  {
    title: "Research the Customer & Competition",
    desc: [
      "Study similar Etsy products for price range, photo styles, variations, customer language, reviews, complaints, shipping expectations, personalization, and gaps.",
      "",
      "Research sheet:",
      "Competitor/Product | Price | Reviews | What Buyers Like | Opportunity",
      "",
      "Do not copy photos, descriptions, artwork, designs, branding, trademarks, or titles word-for-word.",
    ].join("\n"),
  },
  {
    title: "Price for Profit Before You List",
    desc: [
      "Calculate:",
      "Product Cost: $____",
      "Labor: $____",
      "Packaging: $____",
      "Estimated Current Fees: $____",
      "Shipping You Pay: $____",
      "Other Costs: $____",
      "Desired Profit: $____",
      "Selling Price: $____",
      "",
      "Ask: Would I still want this sale after ALL costs?",
      "Do not price from competitor listings alone.",
      "See Suggested Pricing for the formula and the Tools tab for current Etsy seller fees.",
    ].join("\n"),
  },
  {
    title: "Build the Shop Foundation",
    desc: [
      "Using Etsy’s current onboarding, prepare:",
      "- Shop name",
      "- Icon/logo",
      "- Banner if desired",
      "- About information",
      "- Required seller/shop-member information",
      "- Required production-partner disclosures",
      "- Shop policies",
      "- Processing expectations",
      "- Returns/exchanges",
      "- Customer-service process",
      "",
      "The seller controls the Etsy account, payment account, bank information, and identity verification.",
    ].join("\n"),
  },
  {
    title: "Create Strong Product Photos",
    desc: [
      "For physical goods, photograph the actual product as required for the seller/product category.",
      "",
      "Useful shots:",
      "- Hero",
      "- Alternate angle",
      "- Detail",
      "- Scale/size",
      "- Packaging",
      "- Variation",
      "- Lifestyle/use where appropriate",
      "- Texture",
      "- Natural variation",
      "- Additional informative image",
      "",
      "For digital products, use accurate previews/mockups of what the buyer receives.",
      "Use good lighting, a clean background, sharp focus, and a consistent style.",
      "Never materially misrepresent the product.",
    ].join("\n"),
  },
  {
    title: "Write the Listing for Humans & Search",
    desc: [
      "Include what it is, intended customer/use, materials/features, size, color/variation, personalization, what is included, processing time, shipping/delivery, care/use where relevant, and disclosures.",
      "",
      "Use relevant current Etsy listing fields/tags/categories.",
      "",
      "Avoid keyword stuffing, false claims, trademark misuse, misleading materials, fake scarcity, and copying.",
      "",
      "Ask: What must the buyer know BEFORE clicking Buy?",
    ].join("\n"),
  },
  {
    title: "Set Shipping, Processing & Fulfillment",
    desc: [
      "Physical: know weight, dimensions, packaging cost, destination, processing time, carrier/service, tracking approach, and who pays shipping. Test-pack one item.",
      "",
      "Made-to-order: set a realistic processing time.",
      "Digital: confirm the correct file type/delivery/listing setup.",
      "Production partner: confirm workflow and disclose where required.",
      "",
      "Never promise speeds you cannot meet.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way people hear about your shop. Pick only 2 or 3 external channels this month.",
      "",
      "☐ Pinterest",
      "☐ Instagram",
      "☐ Facebook Page",
      "☐ TikTok",
      "☐ Email list",
      "☐ Friends/referrals",
      "☐ Local market customers",
      "☐ Existing business audience",
      "",
      "Record:",
      "Shop: ________",
      "Hero Product: ________",
      "Starting Price: $____",
      "Selected channels: ________",
      "",
      "Set ONE measurable goal per selected channel.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials and Carry Out Your Marketing Plan",
    desc: [
      "MAKE:",
      "Create 3–5 product photos, 1 short video, 1 shop announcement, 2–3 social captions, 1 simple Canva graphic/pin, and a direct shop/listing link.",
      "",
      "Sample:",
      "“New in the shop: [PRODUCT]. Made/designed for [CUSTOMER/USE]. Available in [KEY OPTIONS]. See the details here: [LINK].”",
      "",
      "CARRY OUT:",
      "Use only the selected channels this week. Publish planned content, respond to legitimate questions, track clicks/orders where possible, do not spam, and follow each platform’s rules.",
      "",
      "Track: Date | Channel | Product | Content | Visits/Clicks | Orders | Notes",
    ].join("\n"),
  },
  {
    title: "Launch & Build a Weekly Listing Habit",
    desc: [
      "Launch a manageable number of strong listings.",
      "",
      "Example weekly routine:",
      "MON — Research/customer feedback",
      "TUE — Make/source eligible product",
      "WED — Photograph",
      "THU — Write/edit listing",
      "FRI — Publish/update listing",
      "WEEKEND — Promote, fulfill, review results",
      "",
      "Track: New Listings | Listings Improved | Orders Fulfilled | Customer Messages Answered",
    ].join("\n"),
  },
  {
    title: "Review the Numbers & Grow What Sells",
    desc: [
      "Review visits, orders, revenue, available conversion data, best listings, favorites, questions, reviews, refunds/returns, product cost, Etsy/platform fees, shipping, advertising, and profit.",
      "",
      "Ask:",
      "- Which gets attention?",
      "- Which converts?",
      "- Which is profitable?",
      "- Which takes too long?",
      "- Which listing/photos need improvement?",
      "",
      "Then: KEEP → IMPROVE → TEST → STOP",
      "",
      "PRODUCT → LISTING → TRAFFIC → SALE → PROFIT CHECK → IMPROVE → REPEAT",
    ].join("\n"),
  },
];

export function etsyStoreToolsDisclaimer(): string {
  return "Beginner stack: Etsy + Phone Camera + Canva + Sheets + Shipping Tool. Use official Etsy documentation for current policy, fee, and platform-specific instructions. Verify Creativity Standards and seller eligibility before you buy inventory. The seller controls the Etsy account, payment account, bank information, and identity verification.";
}

/** Monthly Etsy shop profit math. Gross customer revenue includes shipping charged. */
export function computeEtsyStoreProfit(input: {
  averageProductPrice: number;
  unitsSoldPerMonth: number;
  shippingCharged?: number;
  productMaterialCostPerUnit?: number;
  packagingCostPerUnit?: number;
  listingFees?: number;
  transactionFees?: number;
  paymentProcessingFees?: number;
  sellerPaidShipping?: number;
  advertising?: number;
  otherEtsyFees?: number;
  refundsDiscounts?: number;
  otherBusinessExpenses?: number;
  hoursWorkedPerMonth?: number;
  monthlyProfitGoal?: number;
}): {
  productRevenue: number;
  grossCustomerRevenue: number;
  productCosts: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerUnit: number;
  profitMargin: number;
  effectiveProfitPerHour: number | null;
  salesNeeded: number;
} {
  const price = Math.max(0, Number(input.averageProductPrice) || 0);
  const units = Math.max(0, Number(input.unitsSoldPerMonth) || 0);
  const shippingCharged = Math.max(0, Number(input.shippingCharged) || 0);
  const productRevenue = price * units;
  const grossCustomerRevenue = productRevenue + shippingCharged;
  const productCosts =
    (Math.max(0, Number(input.productMaterialCostPerUnit) || 0) +
      Math.max(0, Number(input.packagingCostPerUnit) || 0)) *
    units;
  const totalExpenses =
    productCosts +
    Math.max(0, Number(input.listingFees) || 0) +
    Math.max(0, Number(input.transactionFees) || 0) +
    Math.max(0, Number(input.paymentProcessingFees) || 0) +
    Math.max(0, Number(input.sellerPaidShipping) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherEtsyFees) || 0) +
    Math.max(0, Number(input.refundsDiscounts) || 0) +
    Math.max(0, Number(input.otherBusinessExpenses) || 0);
  const estimatedProfit = grossCustomerRevenue - totalExpenses;
  const profitPerUnit = units > 0 ? estimatedProfit / units : 0;
  const hours = Math.max(0, Number(input.hoursWorkedPerMonth) || 0);
  const goal = Math.max(0, Number(input.monthlyProfitGoal) || 0);
  return {
    productRevenue,
    grossCustomerRevenue,
    productCosts,
    totalExpenses,
    estimatedProfit,
    profitPerUnit,
    profitMargin: grossCustomerRevenue > 0 ? (estimatedProfit / grossCustomerRevenue) * 100 : 0,
    effectiveProfitPerHour: hours > 0 ? estimatedProfit / hours : null,
    salesNeeded: profitPerUnit > 0 ? Math.ceil(goal / profitPerUnit) : 0,
  };
}
