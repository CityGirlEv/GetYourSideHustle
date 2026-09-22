/**
 * Dropshipping Business (`dropshipping`, Guide #065).
 * The supplier may ship the order, but YOU still own the customer experience. Elite.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const DROPSHIPPING_REALITY_CHECK = {
  title: "DROPSHIPPING IS NOT “EASY MONEY”",
  body: [
    "The supplier may ship the order, but YOU still own the customer experience.",
    "",
    "You are responsible for:",
    "- Accurate product descriptions",
    "- Supplier reliability",
    "- Shipping expectations",
    "- Customer communication",
    "- Refunds/returns",
    "- Payment disputes",
    "- Product quality",
    "- Advertising claims",
    "- Platform compliance",
    "- Taxes/business obligations where applicable",
    "",
    "Never build a store around a supplier or product you have not researched.",
    "Do not sell prohibited, counterfeit, unsafe, restricted, trademark-infringing, or unverified products.",
    "",
    "Tagline: Pick Smart. Price for Profit. Test Before You Scale.",
  ].join("\n"),
};

export const DROPSHIPPING_NOTES_WORKSHEET = `STORE
Store Name: ________
Niche: ________
Target Customer: ________
Main Product: ________
Store Platform: ________

SUPPLIER
Supplier: ________
Product Cost: $____
Shipping: $____
Processing Time: ________
Estimated Delivery: ________
Backup Supplier: ________
Sample Ordered: ☐
Sample Quality: ________

PRODUCT
Selling Price: $____
Total Variable Cost: $____
Expected Profit/Order: $____
Margin: ____%
Return Risk: Low / Medium / High
Compliance/IP Check: ________

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Budget: $____
Goal: ________

WEEKLY RESULTS
Traffic: ________
Orders: ________
Revenue: $____
Ad Spend: $____
Refunds: $____
Chargebacks: $____
Profit: $____
Best Product: ________
Worst Product: ________

DECISION
☐ Scale
☐ Improve
☐ Pause
☐ Remove

GYSH PRO TIP
Do not fall in love with a product.

Fall in love with the NUMBERS.

GOOD SUPPLIER
+ REAL DEMAND
+ HEALTHY MARGIN
+ HONEST MARKETING
+ LOW REFUNDS
= PRODUCT WORTH SCALING.

ELITE CHALLENGE
Launch one small product test:
1. Pick one niche
2. Research 5–10 products
3. Vet 2–3 suppliers
4. Choose one test product
5. Order sample if practical
6. Build profit sheet
7. Create one product page
8. Create 3 marketing assets
9. Choose 2 marketing channels
10. Set a small test budget
11. Track first 20–50 visits/orders where applicable
12. Review real profit
13. Decide SCALE / IMPROVE / STOP
`;

export const DROPSHIPPING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Build an online storefront and sell products that are fulfilled directly by approved suppliers. Learn product selection, supplier vetting, pricing, store setup, customer service, marketing, refunds, and real profit tracking before scaling. Tagline: Pick Smart. Price for Profit. Test Before You Scale. Category: Ecommerce / Online Business. Best for Adults, Seniors/Retirees; experienced Teens only with parent/guardian-managed accounts and business activity. Beginner–Intermediate · Low–Moderate startup · Online · Product Margin / Store Profit · 2 - 3 weeks to launch a basic test store · Elite Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Computer · Reliable internet · Parent/guardian involvement if under 18 · Store platform · Payment-processing setup · Business email · Product research process · Supplier vetting checklist · Basic startup budget · Refund/return policy · Shipping policy · Customer-service plan · Spreadsheet for product costs/profit.",
  },
  {
    id: "before-launch",
    label: "Before launch, decide",
    detail:
      "Store Niche · Target Customer · Primary Product Category · Store Platform · Supplier(s) · Startup Budget · Ad/Test Budget · Customer-Service Email. Never build a store around a supplier or product you have not researched.",
  },
  {
    id: "prohibited",
    label: "Do not sell",
    detail:
      "Do not sell prohibited, counterfeit, unsafe, restricted, trademark-infringing, or unverified products. Order at least one sample before scaling a product. Do not rely only on supplier photos/reviews.",
  },
];

export const DROPSHIPPING_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Shopify", url: "https://www.shopify.com/", note: "Store platform option" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Product cost and profit tracker" },
  { label: "Canva", url: "https://www.canva.com/", note: "Product images and marketing graphics" },
  { label: "Gmail", url: "https://mail.google.com/", note: "Business email" },
  { label: "Google Analytics", url: "https://analytics.google.com/", note: "Store analytics" },
  { label: "Stripe", url: "https://stripe.com/", note: "Payment processing option" },
  { label: "Meta Ads Manager", url: "https://www.facebook.com/business/tools/ads-manager", note: "Paid Meta ads if used" },
  { label: "TikTok Ads", url: "https://ads.tiktok.com/", note: "Paid TikTok ads if used" },
  { label: "CapCut", url: "https://www.capcut.com/", note: "Short product videos" },
];

export const DROPSHIPPING_SUPPLIES = {
  starterKitTotal:
    "About $10–80 for samples, branding, and a small test budget — do not buy warehouse inventory. Software accounts live on the Tools tab.",
  items: [
    { id: "computer", name: "Computer / laptop", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "phone", name: "Phone", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "email", name: "Business email", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "store", name: "Store account", qty: "1", estCost: "$0+", notes: "Essential — see Tools" },
    { id: "photos", name: "Product photos / assets with rights to use", qty: "1 set", estCost: "$0", notes: "Essential — do not steal supplier-only or competitor images" },
    { id: "supplier-info", name: "Supplier product information", qty: "1 set", estCost: "$0", notes: "Essential" },
    { id: "pricing-sheet", name: "Pricing spreadsheet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "cs-templates", name: "Customer-service templates", qty: "1 set", estCost: "$0", notes: "Essential" },
    { id: "refund-policy", name: "Refund / return policy", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "shipping-policy", name: "Shipping policy", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "faq", name: "FAQ", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "order-tracker", name: "Order tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "expense-tracker", name: "Expense tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "branding", name: "Basic branding / logo", qty: "1", estCost: "$0–15", notes: "Essential" },
    { id: "test-budget", name: "Testing budget", qty: "1", estCost: "varies", notes: "Essential — small ad/test budget after samples" },
    { id: "sample", name: "Sample products", qty: "1+", estCost: "$10–40", notes: "Highly recommended — order at least one sample before scaling", optional: true },
    { id: "domain", name: "Domain", qty: "1", estCost: "$0–20", notes: "Optional", optional: true },
  ],
};

export const DROPSHIPPING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DROPSHIPPING PRICING EXAMPLES",
    "",
    "Displayed earning potential: $500 – $10,000+ / month gross revenue or profit potential varies widely — examples only, NOT guarantees.",
    "",
    "IMPORTANT: Do not treat sales revenue as profit.",
    "",
    "PRODUCT PRICING FORMULA",
    "Product Cost",
    "+ Supplier Shipping",
    "+ Payment Fees",
    "+ Store/Platform Costs Allocation",
    "+ Advertising Cost Allocation",
    "+ Refund/Chargeback Reserve",
    "+ Desired Profit",
    "= Minimum Sustainable Selling Price",
    "",
    "STARTER MARKUP GUIDANCE — EXAMPLES ONLY",
    "Low-cost impulse items: often target 2.5×–4× landed product cost before ads/fees.",
    "Mid-range items: often target 1.8×–3× landed cost.",
    "Higher-ticket items: may use lower percentage margins but require stronger absolute profit per order.",
    "",
    "Do NOT use a markup rule without calculating all real costs.",
    "",
    "EXAMPLE PRODUCT",
    "Supplier Product Cost: $12",
    "Supplier Shipping: $3",
    "Payment/Platform Allocation: $2",
    "Advertising Allocation: $8",
    "Refund/Issue Reserve: $2",
    "Desired Profit: $10",
    "Minimum Target Selling Price = $37",
    "",
    "If the market will only support $24.99, this may be a bad product unless costs can be legitimately reduced.",
    "",
    "MONTHLY EXAMPLES — NOT GUARANTEES",
    "Starter Test Store: 50 orders × $8 net profit = $400/month",
    "Growing Store: 150 orders × $12 net profit = $1,800/month",
    "Strong Product/Store: 400 orders × $15 net profit = $6,000/month",
    "Higher-Volume Example: 700 orders × $15 net profit = $10,500/month",
    "",
    "Actual results depend on conversion rate, ad costs, returns, product margin, traffic, supplier reliability, fees, taxes, and customer service.",
  ].join("\n"),
  raiseTip:
    "Do not treat sales revenue as profit. If the market will not support a price that covers landed cost, ads, fees, refunds, and desired profit, drop the product. Displayed $500 – $10,000+ / month is examples only — not income guarantees.",
  items: [
    {
      id: "impulse",
      label: "Low-cost impulse items",
      price: "2.5×–4× landed cost",
      notes: "Target before ads/fees — examples only; calculate all real costs",
    },
    {
      id: "mid",
      label: "Mid-range items",
      price: "1.8×–3× landed cost",
      notes: "Examples only — do not skip ads, fees, and refund reserve",
    },
    {
      id: "higher",
      label: "Higher-ticket items",
      price: "Lower % / stronger $ per order",
      notes: "May use lower percentage margins but need healthy absolute profit",
    },
    {
      id: "example",
      label: "Worked example",
      price: "$37 minimum target",
      notes: "$12 product + $3 shipping + $2 fees + $8 ads + $2 refund reserve + $10 profit",
    },
    {
      id: "earnings",
      label: "Displayed earnings example",
      price: "$500 – $10,000+ / month",
      notes: "Gross revenue or profit potential varies widely — examples only, NOT guarantees",
    },
  ],
};

export const DROPSHIPPING_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "ds_store",
    name: "Store platform",
    freePlanAvailable: true,
    costNote: "Shopify or similar — plans and fees change; verify current options before you launch",
    url: "https://www.shopify.com/",
  },
  {
    id: "ds_supplier",
    name: "Supplier marketplace / direct supplier portal",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Vet 1–2 suppliers. Order samples. Have a backup for top products when possible.",
  },
  {
    id: "ds_sheets",
    name: "Google Sheets / Excel",
    freePlanAvailable: true,
    costNote: "Product costs, ads, fees, refunds, and real profit",
    url: "https://sheets.google.com/",
  },
  {
    id: "ds_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Product images, hooks, and benefit graphics",
    url: "https://www.canva.com/",
  },
  {
    id: "ds_email",
    name: "Business email",
    freePlanAvailable: true,
    costNote: "Customer-service inbox — not a personal-only address",
    url: "https://mail.google.com/",
  },
  {
    id: "ds_analytics",
    name: "Analytics dashboard",
    freePlanAvailable: true,
    costNote: "Traffic, conversion, and product-page visits",
    url: "https://analytics.google.com/",
  },
  {
    id: "ds_payments",
    name: "Payment processor",
    freePlanAvailable: true,
    costNote: "Stripe, Shopify Payments, or the processor your store supports — verify current fees",
    url: "https://stripe.com/",
  },
  {
    id: "ds_support",
    name: "Customer-support inbox",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Same business email or a shared inbox so questions are not ignored",
  },
  {
    id: "ds_ads",
    name: "Ad platform(s) if used",
    freePlanAvailable: true,
    costNote: "Meta, TikTok, or Google — start with a small testing budget. Do not scale on views alone.",
    url: "https://www.facebook.com/business/tools/ads-manager",
    optional: true,
  },
  {
    id: "ds_seo",
    name: "SEO / product-keyword tools",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Optional research for titles and product-page copy",
    optional: true,
  },
  {
    id: "ds_images",
    name: "Image editing tool",
    freePlanAvailable: true,
    costNote: "Crop and brighten — do not hide defects or misrepresent the product",
    url: "https://www.canva.com/",
  },
  {
    id: "ds_tracking",
    name: "Order-tracking app",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Confirm the supplier actually shipped and send tracking to the customer",
  },
  {
    id: "ds_reviews",
    name: "Review app where compliant",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Never fake reviews, stolen videos, false before/after claims, fake timers, or misleading discounts",
    optional: true,
  },
  {
    id: "ds_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote:
      "Store Platform + 1–2 Vetted Suppliers + Spreadsheet + Business Email + Analytics + Simple Marketing Channel",
  },
];

export function dropshippingToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Store Platform + 1–2 Vetted Suppliers + Spreadsheet + Business Email + Analytics + Simple Marketing Channel.",
    "",
    "Order at least one sample before scaling a product. Do not rely only on supplier photos/reviews.",
    "",
    "The supplier may ship the order, but YOU still own the customer experience. Do not treat sales revenue as profit.",
  ].join("\n");
}

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ only. */
export const DROPSHIPPING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose a Clear Niche & Customer",
    desc: [
      "Avoid a “general store with random stuff” unless you are intentionally testing.",
      "",
      "Pick:",
      "- Who buys?",
      "- What problem/interest do they have?",
      "- What product categories fit?",
      "- What price range is realistic?",
      "",
      "Examples:",
      "☐ Pet accessories",
      "☐ Home organization",
      "☐ Travel accessories",
      "☐ Fitness accessories",
      "☐ Beauty tools where safe/compliant",
      "☐ Desk / work-from-home accessories",
      "☐ Hobby items",
      "",
      "Avoid restricted/high-risk categories unless fully qualified and compliant.",
      "Do not sell prohibited, counterfeit, unsafe, restricted, trademark-infringing, or unverified products.",
    ].join("\n"),
  },
  {
    title: "Research Products Before Adding Them",
    desc: [
      "For each product evaluate:",
      "- Demand",
      "- Competition",
      "- Selling price",
      "- Supplier cost",
      "- Shipping time",
      "- Return risk",
      "- Fragility",
      "- Sizing complexity",
      "- Defect risk",
      "- Seasonality",
      "- Copyright/trademark risk",
      "- Customer pain point",
      "- Potential profit after ads/fees",
      "",
      "Create a shortlist of 5–10 products.",
      "Do not add 100 random items.",
      "",
      "Open Google Sheets from the Tools tab and record the shortlist there.",
    ].join("\n"),
  },
  {
    title: "Vet Suppliers",
    desc: [
      "Check:",
      "- Supplier history/reputation",
      "- Communication",
      "- Order-processing time",
      "- Shipping options",
      "- Tracking quality",
      "- Product consistency",
      "- Packaging",
      "- Return/refund process",
      "- Inventory stability",
      "- Branding/invoice issues",
      "- Minimum orders if any",
      "- Country of fulfillment",
      "- Estimated delivery windows",
      "",
      "Order samples where practical. Do not rely only on supplier photos/reviews.",
      "",
      "Have a backup supplier for top products when possible.",
    ].join("\n"),
  },
  {
    title: "Build Your Pricing & Profit Sheet",
    desc: [
      "For every product record:",
      "- Selling Price",
      "- Product Cost",
      "- Shipping Cost",
      "- Payment Fees",
      "- Ad Cost Estimate",
      "- Refund Reserve",
      "- Other Cost",
      "- Expected Profit per Order",
      "- Expected Margin %",
      "",
      "Minimum sustainable selling price = Product Cost + Supplier Shipping + Payment Fees + Store/Platform Costs Allocation + Advertising Cost Allocation + Refund/Chargeback Reserve + Desired Profit.",
      "",
      "Example: $12 + $3 + $2 + $8 ads + $2 refund reserve + $10 profit = $37 target. If the market will only support $24.99, this may be a bad product unless costs can be legitimately reduced.",
      "",
      "Remove products that cannot support healthy margin.",
      "Do not treat sales revenue as profit.",
    ].join("\n"),
  },
  {
    title: "Build Your Storefront",
    desc: [
      "Create:",
      "☐ Home page",
      "☐ Product pages",
      "☐ About page",
      "☐ Contact page",
      "☐ Shipping policy",
      "☐ Return/refund policy",
      "☐ Privacy policy",
      "☐ Terms where appropriate",
      "☐ FAQ",
      "",
      "Each product page should clearly show:",
      "- What it is",
      "- Who it is for",
      "- Benefits",
      "- Key features",
      "- Size/material/specs",
      "- Shipping expectations",
      "- Return information",
      "- Accurate images",
      "",
      "No fake scarcity or misleading claims.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way people hear about you.",
      "",
      "Pick only 2–3 initially.",
      "",
      "Good options:",
      "☐ TikTok organic content",
      "☐ Instagram Reels",
      "☐ Facebook Page/Groups where allowed",
      "☐ Pinterest",
      "☐ YouTube Shorts",
      "☐ SEO/blog content",
      "☐ Email",
      "☐ Paid Meta ads",
      "☐ Paid TikTok ads",
      "☐ Influencer/creator outreach",
      "☐ Google Shopping/ads if appropriate",
      "",
      "Set one measurable goal per channel.",
      "",
      "Examples:",
      "- Post 3 short videos/week.",
      "- Test $10/day ad budget for 5 days.",
      "- Contact 10 micro-creators.",
      "- Collect first 25 email subscribers.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "- 3–5 product videos",
      "- 5 product images",
      "- 3 hooks",
      "- 3 captions",
      "- 1 product-benefit graphic",
      "- 1 comparison/FAQ graphic",
      "- 1 email",
      "- 1 retargeting message if used",
      "",
      "Example hook:",
      "“Still dealing with [problem]? Here’s a simpler way.”",
      "",
      "Focus on product value, not exaggerated promises.",
      "",
      "Do not use fake reviews, stolen videos, false before/after claims, fake timers, or misleading discounts.",
      "",
      "Open Canva from the Tools tab (sign in with Google, or use an account you already have) and save the assets there.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use selected channels only. Test small before you scale.",
      "",
      "For paid ads:",
      "Start with a small testing budget.",
      "Track:",
      "- Spend",
      "- Clicks",
      "- Add-to-Carts",
      "- Purchases",
      "- Revenue",
      "- Cost per Purchase",
      "- Refunds",
      "- Profit",
      "",
      "Do not scale an ad just because it gets views.",
      "",
      "For organic:",
      "Track:",
      "- Views",
      "- Clicks",
      "- Saves",
      "- Comments",
      "- Product-page visits",
      "- Orders",
      "",
      "TEST → MEASURE → KEEP / IMPROVE / STOP.",
    ].join("\n"),
  },
  {
    title: "Process Orders & Manage Customer Experience",
    desc: [
      "For every order:",
      "☐ Confirm payment",
      "☐ Send order to supplier automatically or manually",
      "☐ Verify shipping address",
      "☐ Track fulfillment",
      "☐ Send tracking",
      "☐ Monitor delays",
      "☐ Respond quickly to customer questions",
      "☐ Document issues",
      "",
      "Never ignore delayed shipments.",
      "",
      "If supplier problems repeat, pause the product.",
      "The supplier may ship the order, but YOU still own the customer experience.",
    ].join("\n"),
  },
  {
    title: "Handle Returns, Refunds & Chargebacks Professionally",
    desc: [
      "Follow your published policy and applicable consumer laws/platform rules.",
      "",
      "Track reason:",
      "☐ Late delivery",
      "☐ Damaged",
      "☐ Not as described",
      "☐ Wrong item",
      "☐ Sizing",
      "☐ Changed mind",
      "☐ Fraud",
      "☐ Other",
      "",
      "Do not fight every refund blindly.",
      "",
      "Calculate refund/chargeback rate by product.",
      "",
      "A product with high sales but high complaints may be a bad business.",
    ].join("\n"),
  },
  {
    title: "Review Profit & Scale Only Winners",
    desc: [
      "Weekly review:",
      "- Revenue",
      "- Orders",
      "- Average Order Value",
      "- Product Cost",
      "- Shipping",
      "- Ad Spend",
      "- Fees",
      "- Refunds",
      "- Chargebacks",
      "- Net Profit",
      "- Conversion Rate",
      "- Best Product",
      "- Worst Product",
      "- Best Channel",
      "",
      "Scale only after:",
      "- Supplier is reliable",
      "- Margins are healthy",
      "- Customers are satisfied",
      "- Refund rate is controlled",
      "- Tracking is accurate",
      "- Marketing is converting",
      "",
      "DROPSHIPPING CYCLE:",
      "RESEARCH → TEST → MEASURE → FIX → SCALE WINNERS → DROP LOSERS.",
    ].join("\n"),
  },
];

/** Dropshipping profit math. Revenue is not profit. Margin is after product cost, ads, fees, refunds, and monthly costs. */
export function computeDropshippingProfit(input: {
  ordersPerMonth?: number;
  averageSellingPrice?: number;
  averageProductCost?: number;
  averageSupplierShipping?: number;
  paymentPlatformFeesPerOrder?: number;
  averageAdCostPerOrder?: number;
  refundChargebackCostPerOrder?: number;
  otherVariableCostPerOrder?: number;
  monthlyStoreAppCosts?: number;
  otherMonthlyExpenses?: number;
}): {
  revenue: number;
  variableCostPerOrder: number;
  monthlyVariableCosts: number;
  monthlyFixedCosts: number;
  monthlyProfit: number;
  profitPerOrder: number | null;
  profitMargin: number;
} {
  const orders = Math.max(0, Number(input.ordersPerMonth) || 0);
  const price = Math.max(0, Number(input.averageSellingPrice) || 0);
  const revenue = orders * price;
  const variableCostPerOrder =
    Math.max(0, Number(input.averageProductCost) || 0) +
    Math.max(0, Number(input.averageSupplierShipping) || 0) +
    Math.max(0, Number(input.paymentPlatformFeesPerOrder) || 0) +
    Math.max(0, Number(input.averageAdCostPerOrder) || 0) +
    Math.max(0, Number(input.refundChargebackCostPerOrder) || 0) +
    Math.max(0, Number(input.otherVariableCostPerOrder) || 0);
  const monthlyVariableCosts = orders * variableCostPerOrder;
  const monthlyFixedCosts =
    Math.max(0, Number(input.monthlyStoreAppCosts) || 0) +
    Math.max(0, Number(input.otherMonthlyExpenses) || 0);
  const monthlyProfit = revenue - monthlyVariableCosts - monthlyFixedCosts;
  return {
    revenue,
    variableCostPerOrder,
    monthlyVariableCosts,
    monthlyFixedCosts,
    monthlyProfit,
    profitPerOrder: orders > 0 ? monthlyProfit / orders : null,
    profitMargin: revenue > 0 ? (monthlyProfit / revenue) * 100 : 0,
  };
}
