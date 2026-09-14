/**
 * Print-on-Demand (POD) (`pod`, Guide #095).
 * Design merch sold via Etsy or Shopify — no warehousing finished inventory, not a zero-cost business.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const POD_REALITY_CHECK = {
  title: "POD IS NOT A ZERO-COST BUSINESS",
  body: [
    "Print-on-demand avoids purchasing and warehousing finished inventory upfront. Products print when a customer orders.",
    "It is NOT literally a zero-cost business. You may still pay for samples, design tools, marketplace/store fees, advertising, refunds/replacements, domains/apps, taxes, and other operating expenses.",
    "",
    "GROSS SALES = units sold × selling price.",
    "NET REVENUE / PROFIT is what remains after POD production, shipping you pay, marketplace/store/payment fees, advertising, discounts, refunds/replacements, software, sample costs, and other expenses.",
    "GROSS SALES ≠ PROFIT.",
    "",
    "Do not copy protected artwork. Do not use copyrighted characters, logos, celebrity images, song lyrics, team logos, brand names, or trademarked phrases without appropriate rights.",
    "Verify commercial-use rights for fonts, graphics, templates, stock assets, and AI-generated assets where applicable.",
    "Research potential trademark conflicts before building a product around a phrase or name.",
    "Follow current Etsy, Shopify, and POD-provider policies. Accurately disclose production/fulfillment information where required.",
    "Do not promise shipping times the fulfillment provider cannot support.",
    "Have a clear customer-service / refund / replacement process. Protect customer information.",
    "Do not hard-code volatile platform fees or POD supplier costs as permanent facts — check current official pricing, fee calculators, and terms.",
    "Do not invent laws or platform policies. Terms and fees change.",
    "",
    "Tagline: Design Original. Price for Profit. Test Before You Scale.",
  ].join("\n"),
};

export const POD_NOTES_WORKSHEET = `MY PRINT-ON-DEMAND PLAN

NICHE
Target Customer: ________
Theme: ________
Problem/Interest: ________
Competitors Reviewed: ________

PRODUCT
Product: ________
POD Provider: ________
Base Cost: $____
Shipping: $____
Design: ________
SKU/Variant: ________
Sample Ordered: ☐
Quality Notes: ________

PRICING
Selling Price: $____
Production Cost: $____
Estimated Fees: $____
Advertising Cost: $____
Other Cost: $____
Estimated Profit Per Sale: $____
Estimated Margin: ____%

LISTING
Platform: ________
Title: ________
Keywords: ________
Mockups: ________
Description: ________
Published Date: ________
Listing URL: ________

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Content/Promotion: ________
Traffic: ________
Clicks: ________
Orders: ________

RESULTS
Units Sold: ____
Gross Sales: $____
Total Costs: $____
Estimated Profit: $____
Best Seller: ________
Weakest Product: ________
Refunds/Replacements: ________

NEXT ACTION
Keep: ________
Improve: ________
Pause: ________
New Design/Product to Test: ________

GYSH PRO TIP
Fall in love with the NUMBERS, not the mockup.

SELLING PRICE
− POD BASE / PRODUCTION
− SHIPPING YOU PAY
− FEES
− ADS
− DISCOUNTS / REFUNDS
− OTHER COSTS
= PROFIT PER SALE.

ELITE CHALLENGE
Launch one small POD test:
1. Pick one niche and customer.
2. Research demand and competition.
3. Choose one product and provider.
4. Create an original or licensed design.
5. Check IP / trademark risk.
6. Order a sample if practical.
7. Build a true cost sheet.
8. Connect fulfillment to Etsy or Shopify.
9. Publish one strong listing.
10. Choose 2 marketing channels.
11. Review real profit before adding 10 more SKUs.
`;

export const POD_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Design custom shirts, mugs, and merchandise, and sell them via Etsy or Shopify without warehousing finished inventory. POD is not a zero-cost business. Tagline: Design Original. Price for Profit. Test Before You Scale. Category: Ecommerce / Print-on-Demand. Beginner–Intermediate · 1 - 2 weeks to first listings · Elite Membership · $200 – $3,000 / month displayed figures are examples only, not guarantees.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Computer or capable tablet · Smartphone · Reliable internet · POD fulfillment account (such as Printify or Printful) · Selling channel (Etsy or Shopify) · Design tool · Cost/profit tracker. Parent/guardian-managed accounts for minors.",
  },
  {
    id: "costs",
    label: "Costs still exist",
    detail:
      "You may still have samples, design tools, marketplace/store fees, advertising, refunds/replacements, domains/apps, taxes, and other operating expenses. Check current official pricing and fee calculators — do not treat old fee screenshots as facts.",
  },
  {
    id: "ip",
    label: "Intellectual property",
    detail:
      "Do not copy protected artwork or use copyrighted characters, logos, celebrity images, song lyrics, team logos, brand names, or trademarked phrases without rights. Verify commercial-use rights. Research trademark conflicts before building a phrase into a product.",
  },
  {
    id: "platforms",
    label: "Platforms and fulfillment",
    detail:
      "Follow current Etsy, Shopify, and POD-provider policies. Disclose production/fulfillment information where required. Do not promise shipping times the provider cannot support. Protect customer information.",
  },
];

export const POD_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Printify", url: "https://www.printify.com/", note: "POD fulfillment — verify current product costs and policies" },
  { label: "Printful", url: "https://www.printful.com/", note: "POD fulfillment — verify current product costs and policies" },
  { label: "Etsy", url: "https://www.etsy.com/", note: "Marketplace selling — verify current fees and listing rules" },
  { label: "Shopify", url: "https://www.shopify.com/", note: "Store selling — verify current plan and app costs" },
  { label: "Canva", url: "https://www.canva.com/", note: "Design and mockups — verify commercial-use rights" },
  { label: "ChatGPT", url: "https://chatgpt.com/", note: "Brainstorm / product copy — human-review every claim" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Cost, pricing, sales, and profit tracker" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Design file storage" },
];

export const POD_SUPPLIES = {
  starterKitTotal: "About $0–40 if you already have a computer — samples are optional, not warehouse inventory",
  items: [
    {
      id: "computer",
      name: "Computer or capable tablet",
      qty: "1 (usually already owned)",
      estCost: "$0",
      notes: "Essential — design, listings, and provider dashboards",
    },
    {
      id: "phone",
      name: "Smartphone",
      qty: "1 (usually already owned)",
      estCost: "$0",
      notes: "Essential — photos of samples and customer messages",
    },
    {
      id: "internet",
      name: "Reliable internet",
      qty: "1 connection",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "sample",
      name: "Optional product sample for quality / content",
      qty: "1",
      estCost: "$12–35",
      notes: "Optional — check print quality; this is not warehouse stock",
      optional: true,
    },
    {
      id: "photo",
      name: "Optional simple photo / video setup for sample photography",
      qty: "1 small kit",
      estCost: "$0–25",
      notes: "Optional — daylight + a clean wall is enough at first",
      optional: true,
    },
    {
      id: "ship",
      name: "Basic shipping supplies only if YOU handle returns, samples, or special situations",
      qty: "as needed",
      estCost: "$0–15",
      notes: "Optional — normal orders ship from the POD provider",
      optional: true,
    },
  ],
};

export const POD_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "printify",
    name: "Printify or Printful (POD fulfillment)",
    freePlanAvailable: true,
    costNote: "Products print when ordered — check current base costs, shipping, and policies",
    url: "https://www.printify.com/",
  },
  {
    id: "etsy",
    name: "Etsy or Shopify",
    freePlanAvailable: true,
    costNote: "Selling channel — verify current marketplace/store/payment fees; do not treat old fee screenshots as facts",
    url: "https://www.etsy.com/",
  },
  {
    id: "canva",
    name: "Canva or another design tool",
    freePlanAvailable: true,
    costNote: "Original or licensed designs and mockups — verify commercial-use rights",
    url: "https://www.canva.com/",
  },
  {
    id: "chatgpt",
    name: "ChatGPT (draft only)",
    freePlanAvailable: true,
    costNote: "Brainstorm niches and product copy — human-review every claim and IP-sensitive phrase",
    url: "https://chatgpt.com/",
    optional: true,
  },
  {
    id: "sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Product cost, pricing, sales, refunds, ads, and profit",
    url: "https://sheets.google.com/",
  },
  {
    id: "drive",
    name: "Google Drive / cloud storage",
    freePlanAvailable: true,
    costNote: "Master design files and print-ready exports",
    url: "https://drive.google.com/",
  },
  {
    id: "mockups",
    name: "Mockup tools",
    freePlanAvailable: true,
    costNote: "Listing images — do not hide print quality issues you saw on a sample",
    optional: true,
  },
  {
    id: "research",
    name: "Keyword / product research tools",
    freePlanAvailable: true,
    costNote: "Optional — marketplace search and competitor listings also work at first",
    optional: true,
  },
  {
    id: "analytics",
    name: "Selling-platform analytics",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Traffic, views, and orders from Etsy or Shopify — check current dashboards",
  },
  {
    id: "books",
    name: "Optional accounting / bookkeeping tool",
    freePlanAvailable: true,
    costNote: "Track sales vs expenses for taxes where applicable",
    optional: true,
  },
  {
    id: "beginner-stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Canva + 1 POD provider (Printify or Printful) + Etsy or Shopify + Google Sheets",
  },
];

export const POD_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "PRINT-ON-DEMAND — PRICING EXAMPLES",
    "",
    "Displayed earning potential: $200 – $3,000 / month — examples only, not guarantees.",
    "",
    "POD is not a zero-cost business.",
    "",
    "SELLING PRICE",
    "− POD base product / production cost",
    "− Shipping paid by seller",
    "− Marketplace / store / payment fees",
    "− Advertising cost allocated to the sale",
    "− Discounts / refund allowance",
    "− Other variable costs",
    "= Estimated profit per sale",
    "",
    "GROSS SALES ≠ NET REVENUE ≠ PROFIT.",
    "",
    "Price for product type, POD supplier base cost, print area/options, shipping, marketplace/store fees, payment processing, discounts, advertising, target margin, and competitor positioning.",
    "",
    "Do NOT hard-code volatile platform fees or POD supplier costs as permanent facts. Check current official pricing, fee calculators, and terms.",
    "",
    "PRODUCT EXAMPLES (RETAIL RANGES ARE EXAMPLES ONLY)",
    "T-shirts, sweatshirts/hoodies, mugs, tote bags, hats, and other appropriate POD merchandise.",
    "Example starting retail ranges (not guarantees): T-shirt about $22–$32 · mug about $14–$22 · hoodie about $35–$55 — then subtract YOUR current costs.",
  ].join("\n"),
  raiseTip:
    "Raise prices only after you know true cost per sale (production + fees + ads + refunds). Displayed $200 – $3,000 / month is examples only — not income guarantees.",
  items: [
    { id: "tee", label: "T-shirt retail (examples only)", price: "$22–$32", notes: "Subtract current POD + fees + ads" },
    { id: "mug", label: "Mug retail (examples only)", price: "$14–$22", notes: "Check current supplier cost" },
    { id: "hoodie", label: "Sweatshirt / hoodie retail (examples only)", price: "$35–$55", notes: "Higher base cost" },
    { id: "tote", label: "Tote / hat / other POD merch", price: "Market + margin", notes: "Examples only — verify current costs" },
    { id: "margin", label: "Target profit per sale", price: "After ALL costs", notes: "Not selling price" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ only. */
export const POD_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose a Niche and Customer",
    desc: [
      "Pick one customer and one theme you can design honestly for (hobby, job, local pride, or a problem a slogan/art solves).",
      "Write who they are, what they buy, and where they already shop (Etsy search, Instagram, etc.).",
      "Do not build a store around a trademarked phrase, celebrity, or team you do not have rights to.",
    ].join("\n"),
  },
  {
    title: "Research Demand, Competition, and Products",
    desc: [
      "Search Etsy and similar listings. Note prices, reviews, shipping promises, and overused designs.",
      "Choose product types that fit the niche: T-shirts, hoodies, mugs, totes, hats, or other appropriate POD merch.",
      "Look at demand AND competition. A crowded trademark-heavy niche is a trap.",
    ].join("\n"),
  },
  {
    title: "Choose POD Products and a Provider",
    desc: [
      "Pick one beginner provider such as Printify (https://www.printify.com/) or Printful (https://www.printful.com/).",
      "Check CURRENT official product costs, print areas, shipping regions, and policies — they change.",
      "Start with 1–3 products, not 50. You do not buy warehouse inventory.",
    ].join("\n"),
  },
  {
    title: "Create Original or Licensed Designs",
    desc: [
      "Open Canva (https://www.canva.com/) or another design tool. Create original art or use assets with commercial-use rights.",
      "",
      "IP check:",
      "☐ Not copying protected artwork",
      "☐ No copyrighted characters, logos, celebrity images, song lyrics, team logos, or brand names without rights",
      "☐ Fonts / graphics / templates / AI assets reviewed for commercial use",
      "☐ Trademark search on the main phrase before you build the product around it",
      "",
      "ChatGPT may brainstorm. You must human-review every claim and IP-sensitive phrase.",
    ].join("\n"),
  },
  {
    title: "Order Samples and Build Your Pricing Sheet",
    desc: [
      "Order a sample where useful so you know print quality before you scale ads.",
      "",
      "For each SKU write:",
      "Selling price",
      "− POD base / production",
      "− Shipping you pay",
      "− Marketplace / store / payment fees (check CURRENT calculators)",
      "− Ad cost you plan to allocate",
      "− Discount / refund allowance",
      "− Other variable costs",
      "= Estimated profit per sale and margin",
      "",
      "Open Google Sheets from the Tools tab. Do not treat sales as profit.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "You need people who want this merch. Pick only 2 or 3 channels at first.",
      "",
      "Beginner options:",
      "☐ Etsy search optimization / listing keywords",
      "☐ Pinterest",
      "☐ Instagram",
      "☐ TikTok",
      "☐ Facebook",
      "☐ Email / audience if you already have one",
      "",
      "Write ONE measurable goal per channel.",
      "Examples:",
      "- Publish 1 listing with researched title/tags this week.",
      "- Pin 3 mockups on Pinterest.",
      "- Post 2 short process videos.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "☐ Honest mockups (and a sample photo if you ordered one)",
      "☐ Listing title, tags/keywords, and description",
      "☐ Production / fulfillment disclosure where required",
      "☐ Shipping-time language that matches the provider — do not promise faster",
      "☐ Refund / replacement policy you can actually keep",
      "",
      "Open Canva from the Tools tab. Do not use fake “sold 10,000” claims.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Do the 2–3 channels you chose.",
      "",
      "This week:",
      "☐ Publish or improve the listing (SEO where you sell)",
      "☐ Post or pin the mockups",
      "☐ Track views, clicks, and orders — not just likes",
      "",
      "Marketplace SEO is part of acquisition. Do not buy ads until you know profit per sale.",
    ].join("\n"),
  },
  {
    title: "Connect Fulfillment and Publish Listings",
    desc: [
      "Connect the POD provider to Etsy or Shopify. Test that the variant, print file, and shipping profile match.",
      "Accurately disclose production/fulfillment information where required.",
      "Follow current Etsy / Shopify / provider policies. Verify current fees — they change.",
      "Protect customer information. Do not invent platform rules.",
    ].join("\n"),
  },
  {
    title: "Process Orders and Customer Service",
    desc: [
      "When an order arrives, confirm the provider received it. Answer questions honestly about production time.",
      "Have a written refund / replacement process for print errors vs customer change-of-mind (follow current platform rules).",
      "If you handle a rare return or sample shipment, use basic shipping supplies — you still do not warehouse inventory.",
    ].join("\n"),
  },
  {
    title: "Review Profit and Scale Only Winners",
    desc: [
      "Each week record:",
      "☐ Units sold and gross sales",
      "☐ Production, shipping you paid, fees, ads, discounts, refunds/replacements",
      "☐ Software / apps and sample costs allocated",
      "☐ Estimated profit, profit per product, profit per order, margin",
      "☐ Best seller vs weakest product",
      "",
      "Keep / improve / pause / test a new design. Scale only SKUs with real profit after ALL costs.",
      "Displayed $200 – $3,000 / month is examples only — not a guarantee.",
    ].join("\n"),
  },
];

export function podToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Canva + 1 POD provider (Printify or Printful) + Etsy or Shopify + Google Sheets.",
    "",
    "Apps belong here. Optional samples and photo setup live on the Supply List. You do not buy warehouse inventory.",
    "",
    "Check current official product costs, marketplace fees, and policies. Parent/guardian-managed accounts for minors.",
  ].join("\n");
}

/** POD ecommerce profit. Gross sales are not profit. */
export function computePodProfit(input: {
  podUnitsSold?: number;
  averageSellingPrice?: number;
  productionCostPerUnit?: number;
  shippingPaidBySellerPerUnit?: number;
  feesPerUnit?: number;
  advertisingPerUnit?: number;
  discounts?: number;
  refundsReplacements?: number;
  softwareApps?: number;
  sampleCosts?: number;
  otherOperatingExpenses?: number;
  secondProductUnits?: number;
  secondProductPrice?: number;
  secondProductCostPerUnit?: number;
}): {
  productASales: number;
  productBSales: number;
  grossSales: number;
  variableCosts: number;
  monthlyOperatingCosts: number;
  totalCosts: number;
  estimatedProfit: number;
  profitPerUnit: number | null;
  profitPerOrder: number | null;
  profitMarginPercent: number;
  averageOrderValue: number | null;
  breakEvenUnits: number | null;
} {
  const unitsA = Math.max(0, Number(input.podUnitsSold) || 0);
  const priceA = Math.max(0, Number(input.averageSellingPrice) || 0);
  const unitsB = Math.max(0, Number(input.secondProductUnits) || 0);
  const priceB = Math.max(0, Number(input.secondProductPrice) || 0);
  const productASales = unitsA * priceA;
  const productBSales = unitsB * priceB;
  const grossSales = productASales + productBSales;
  const variableA =
    unitsA *
    (Math.max(0, Number(input.productionCostPerUnit) || 0) +
      Math.max(0, Number(input.shippingPaidBySellerPerUnit) || 0) +
      Math.max(0, Number(input.feesPerUnit) || 0) +
      Math.max(0, Number(input.advertisingPerUnit) || 0));
  const variableB = unitsB * Math.max(0, Number(input.secondProductCostPerUnit) || 0);
  const variableCosts =
    variableA +
    variableB +
    Math.max(0, Number(input.discounts) || 0) +
    Math.max(0, Number(input.refundsReplacements) || 0);
  const monthlyOperatingCosts =
    Math.max(0, Number(input.softwareApps) || 0) +
    Math.max(0, Number(input.sampleCosts) || 0) +
    Math.max(0, Number(input.otherOperatingExpenses) || 0);
  const totalCosts = variableCosts + monthlyOperatingCosts;
  const estimatedProfit = grossSales - totalCosts;
  const totalUnits = unitsA + unitsB;
  const variablePerA =
    Math.max(0, Number(input.productionCostPerUnit) || 0) +
    Math.max(0, Number(input.shippingPaidBySellerPerUnit) || 0) +
    Math.max(0, Number(input.feesPerUnit) || 0) +
    Math.max(0, Number(input.advertisingPerUnit) || 0);
  const contribution = priceA - variablePerA;
  return {
    productASales,
    productBSales,
    grossSales,
    variableCosts,
    monthlyOperatingCosts,
    totalCosts,
    estimatedProfit,
    profitPerUnit: totalUnits > 0 ? estimatedProfit / totalUnits : null,
    profitPerOrder: totalUnits > 0 ? estimatedProfit / totalUnits : null,
    profitMarginPercent: grossSales > 0 ? (estimatedProfit / grossSales) * 100 : 0,
    averageOrderValue: totalUnits > 0 ? grossSales / totalUnits : null,
    breakEvenUnits: contribution > 0 ? Math.ceil(monthlyOperatingCosts / contribution) : null,
  };
}
