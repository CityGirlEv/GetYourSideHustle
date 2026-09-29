/**
 * Digital Products (`digital-products`, Guide #062).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const DIGITAL_PRODUCTS_REALITY_CHECK = {
  title: "START WITH ONE USEFUL PRODUCT",
  body: [
    "Don't start by trying to build a giant online store. Solve ONE problem for ONE type of customer with ONE useful product.",
    "",
    "Examples: budget planner, resume template, kids activity pack, business checklist, meal planner, social-media template, short ebook, workbook, wedding planner, side-hustle tracker, mini-course.",
    "",
    "Tagline: Create It Once. Sell It Again and Again.",
  ].join("\n"),
};

export const DIGITAL_PRODUCTS_NOTES_WORKSHEET = `MY DIGITAL PRODUCT PLAN

Product: __________
Customer: __________
Problem It Solves: __________
Product Type: __________
Price: $____
Selling Platform: __________

3 MARKETING CHANNELS:
1. __________
2. __________
3. __________

Launch checklist:
☐ Product complete
☐ Proofread
☐ Tested
☐ Price set
☐ Images created
☐ Description written
☐ Sales page complete
☐ Delivery tested
☐ Marketing materials ready

Results:
Sales: ______
Gross Revenue: $____
Expenses: $____
Estimated Profit: $____
Best Marketing Channel: __________
Customer Questions: __________
Improvements: __________
Next Product: __________

GYSH PRO TIP — DON'T BUILD THE STORE BEFORE YOU PROVE THE PRODUCT.
One useful $10 product that people actually buy is more valuable than a beautiful store containing 50 products nobody wants.
Start with ONE CUSTOMER + ONE PROBLEM + ONE PRODUCT + ONE SALES PAGE + 2–3 MARKETING CHANNELS.

ELITE CHALLENGE:
Create and launch ONE Minimum Sellable Product:
IDEA → CREATE → TEST → LIST → MARKET → SELL → LEARN → IMPROVE`;

export const DIGITAL_PRODUCTS_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Create and sell digital products people can download or access online, including ebooks, printables, planners, templates, guides, workbooks, digital art, and mini-courses. Book publishing is another classic digital-product path. Tagline: Create It Once. Sell It Again and Again. Category: Digital / Online Business. Best for teens, adults, seniors / retirees. Beginner · Very low startup · 2–6 weeks · Product sales / scalable · Elite Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Computer/tablet · Internet · Basic writing/design skills · Product idea · Customer/problem to solve · File creation tool · Selling/delivery platform.",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail:
      "Canva · Google Docs · Microsoft Word · Google Sheets · Cloud storage · Basic editing skills.",
  },
  {
    id: "before-selling",
    label: "Before selling",
    detail:
      "Use content you created or have rights to use. Check licenses for fonts/images/templates/assets. Do not copy another creator's product. Understand platform fees/rules. Proofread. Test every file.",
  },
];

export const DIGITAL_PRODUCTS_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Creation" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Writing" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Planners / trackers" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Storage" },
  { label: "Etsy", url: "https://www.etsy.com/sell", note: "Selling option" },
  { label: "Gumroad", url: "https://gumroad.com/", note: "Selling option" },
  { label: "Payhip", url: "https://payhip.com/", note: "Selling option" },
  { label: "Amazon KDP", url: "https://kdp.amazon.com/", note: "Book publishing path" },
];

export const DIGITAL_PRODUCTS_SUPPLIES = {
  starterKitTotal:
    "About $0–25 — start with tools you already have; do not buy expensive equipment before validating the product",
  items: [
    { id: "computer", name: "Computer / tablet", qty: "1", estCost: "$0", notes: "Essential — already owned" },
    { id: "internet", name: "Internet", qty: "1", estCost: "$0+", notes: "Essential" },
    { id: "creation", name: "Creation software", qty: "1", estCost: "$0+", notes: "Essential — Canva / Docs / Word" },
    { id: "storage", name: "File storage", qty: "1", estCost: "$0+", notes: "Essential — Drive / Dropbox" },
    { id: "selling", name: "Selling / delivery method", qty: "1", estCost: "$0+", notes: "Essential — pick ONE platform first" },
    { id: "pdf", name: "PDF export", qty: "1", estCost: "$0", notes: "Depending on product", optional: true },
    { id: "camera", name: "Phone / camera", qty: "1", estCost: "$0", notes: "Depending on product", optional: true },
    { id: "mic", name: "Microphone", qty: "1", estCost: "$0–40", notes: "Optional", optional: true },
    { id: "lighting", name: "Lighting", qty: "1", estCost: "$10–40", notes: "Optional", optional: true },
    { id: "tablet", name: "Drawing tablet", qty: "1", estCost: "$40+", notes: "Optional", optional: true },
    { id: "assets", name: "Paid design assets", qty: "as needed", estCost: "$0–30", notes: "Optional — check licenses", optional: true },
    { id: "domain", name: "Website / domain", qty: "1", estCost: "$0–20", notes: "Optional — not required to start", optional: true },
  ],
};

export const DIGITAL_PRODUCTS_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "dp_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Creation — printables, planners, covers, mockups",
    url: "https://www.canva.com/",
  },
  {
    id: "dp_docs",
    name: "Google Docs / Microsoft Word",
    freePlanAvailable: true,
    costNote: "Writing ebooks, guides, workbooks",
    url: "https://docs.google.com/",
  },
  {
    id: "dp_sheets",
    name: "Google Sheets / Excel",
    freePlanAvailable: true,
    costNote: "Planners, trackers, templates",
    url: "https://sheets.google.com/",
  },
  {
    id: "dp_slides",
    name: "Google Slides / PowerPoint",
    freePlanAvailable: true,
    costNote: "Mini-course / presentation products",
    url: "https://slides.google.com/",
    optional: true,
  },
  {
    id: "dp_capcut",
    name: "CapCut",
    freePlanAvailable: true,
    costNote: "Video / audio for mini-courses or demos",
    url: "https://www.capcut.com/",
    optional: true,
  },
  {
    id: "dp_drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Storage and master-file backup",
    url: "https://drive.google.com/",
  },
  {
    id: "dp_dropbox",
    name: "Dropbox",
    freePlanAvailable: true,
    costNote: "Storage alternative",
    url: "https://www.dropbox.com/",
    optional: true,
  },
  {
    id: "dp_etsy",
    name: "Etsy",
    freePlanAvailable: true,
    costNote: "Selling option — verify current fees and policies",
    url: "https://www.etsy.com/sell",
  },
  {
    id: "dp_gumroad",
    name: "Gumroad",
    freePlanAvailable: true,
    costNote: "Selling / delivery option",
    url: "https://gumroad.com/",
  },
  {
    id: "dp_payhip",
    name: "Payhip",
    freePlanAvailable: true,
    costNote: "Selling / delivery option",
    url: "https://payhip.com/",
    optional: true,
  },
  {
    id: "dp_shopify",
    name: "Shopify",
    freePlanAvailable: true,
    costNote: "Selling option — own store later, not day one",
    url: "https://www.shopify.com/",
    optional: true,
  },
  {
    id: "dp_kdp",
    name: "Amazon KDP",
    freePlanAvailable: true,
    costNote: "Book publishing path — print + ebook",
    url: "https://kdp.amazon.com/",
    optional: true,
  },
  {
    id: "dp_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Canva + Google Docs + Google Drive + ONE Selling Platform. Verify current platform features, eligibility, fees, and policies before choosing.",
  },
];

export const DIGITAL_PRODUCTS_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DIGITAL PRODUCT PRICING EXAMPLES (examples only — not income guarantees).",
    "",
    "Keep displayed range: $200–$10,000/month (examples). This represents possible BUSINESS REVENUE examples, not guaranteed beginner earnings.",
    "",
    "Product Price × Number of Sales = Gross Revenue.",
    "Examples: $10 × 20 = $200; $25 × 100 = $2,500; $50 × 200 = $10,000.",
    "",
    "Revenue is NOT profit. Fees, ads, software, refunds, and other expenses reduce profit.",
  ].join("\n"),
  raiseTip:
    "After you prove one product sells, raise price, bundle, or add a related product. Examples only — not income guarantees.",
  items: [
    { id: "printable", label: "Simple Printable / Checklist", price: "$2–$8" },
    { id: "worksheet", label: "Worksheet / Template", price: "$5–$15" },
    { id: "planner", label: "Planner / Workbook", price: "$7–$25" },
    { id: "bundle", label: "Template Bundle", price: "$10–$40+" },
    { id: "ebook", label: "Short Ebook", price: "$5–$25+" },
    { id: "guide", label: "Specialized Digital Guide", price: "$15–$50+" },
    { id: "course", label: "Mini-Course", price: "$20–$100+" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 5, 6, 8. Use ☐ only. */
export const DIGITAL_PRODUCTS_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Pick One Product",
    desc: [
      "Ask: What problem can I help someone solve?",
      "",
      "Choose one:",
      "☐ Printable",
      "☐ Planner",
      "☐ Template",
      "☐ Checklist",
      "☐ Workbook",
      "☐ Ebook",
      "☐ Digital art",
      "☐ Mini-course",
      "☐ Other",
    ].join("\n"),
  },
  {
    title: "Research the Customer",
    desc: [
      "Define customer, problem, and desired result.",
      "",
      "Look at similar products to understand what customers buy, common features, typical pricing, reviews, complaints, and gaps.",
      "",
      "Research for ideas and positioning.",
      "",
      "DO NOT copy another creator's product. Use content you created or have rights to use. Check licenses for fonts, images, templates, and assets.",
    ].join("\n"),
  },
  {
    title: "Create the Product",
    desc: [
      "Build the simplest useful version.",
      "",
      "Make it:",
      "☐ Useful",
      "☐ Easy to understand",
      "☐ Organized",
      "☐ Original",
      "☐ Proofread",
      "☐ Correct format",
      "☐ Tested",
      "☐ Attractive",
      "",
      "Save a master copy in Google Drive (Tools tab).",
    ].join("\n"),
  },
  {
    title: "Test & Price It",
    desc: [
      "Test file, links, spelling, formatting, printability, and phone/computer use as appropriate.",
      "",
      "Ask 1–3 trusted people for feedback if possible.",
      "",
      "Set price using Suggested Pricing.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way customers discover your product.",
      "",
      "Pick ONLY 2 or 3 this month.",
      "",
      "Options:",
      "☐ Facebook",
      "☐ Instagram",
      "☐ TikTok",
      "☐ Pinterest",
      "☐ YouTube",
      "☐ Email",
      "☐ LinkedIn (for professional/business products)",
      "☐ Relevant communities where promotion is allowed",
      "☐ Selling-platform search/discovery",
      "☐ Blog/website",
      "☐ Referrals",
      "",
      "Write product, customer, price, and one measurable goal per channel.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a small launch kit:",
      "☐ Product cover/mockup",
      "☐ 3–5 product images",
      "☐ Short description",
      "☐ Benefits",
      "☐ Price",
      "☐ CTA",
      "☐ Product link when ready",
      "",
      "Write WHAT IT IS, WHO IT'S FOR, WHAT IT HELPS THEM DO, WHY IT'S USEFUL, PRICE, CTA.",
      "",
      "Show customers what they are actually receiving.",
    ].join("\n"),
  },
  {
    title: "Set Up Your Sales Page",
    desc: [
      "Choose ONE selling platform first.",
      "",
      "Create:",
      "☐ Product Title",
      "☐ Product Images",
      "☐ Description",
      "☐ Price",
      "☐ What's Included",
      "☐ File Type",
      "☐ Instructions",
      "☐ Delivery Method",
      "☐ Policies where appropriate",
      "",
      "Test purchase/download, delivery, links, price, images, and description.",
      "",
      "Do not promise results the product cannot guarantee.",
      "Understand platform fees and rules before you list.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY the 2–3 selected channels.",
      "",
      "Create helpful content around the problem your product solves: tips, mistakes, what's inside, before/after, product demonstrations.",
      "",
      "Warm outreach when appropriate.",
      "",
      "Track: Date | Channel | Content | Views/Clicks | Sales.",
      "",
      "Reply promptly. Do not spam.",
    ].join("\n"),
  },
  {
    title: "Make Sales & Learn",
    desc: [
      "Track sales, revenue, traffic/views, questions, refunds/issues.",
      "",
      "Ask:",
      "- Where buyers come from",
      "- Which posts get clicks",
      "- What questions repeat",
      "- What images/products get attention",
      "- Where customers stop",
      "",
      "Learn from Product #1 before creating many more.",
    ].join("\n"),
  },
  {
    title: "Improve the Product",
    desc: [
      "Use customer behavior and feedback.",
      "",
      "Improve instructions, cover, useful pages, examples, sales description, mockups, bundle, or price.",
      "",
      "Keep master files organized.",
    ].join("\n"),
  },
  {
    title: "Grow",
    desc: [
      "Product #1 → Related Product → Bundle → Upsell → Larger Product → Repeat Customers.",
      "",
      "Build from what customers actually want.",
    ].join("\n"),
  },
];

export function digitalProductsToolsDisclaimer(): string {
  return "Beginner stack: Canva + Google Docs + Google Drive + ONE selling platform. Verify current platform features, eligibility, fees, and policies before you choose. Start small — do not buy expensive equipment before validating the product.";
}

/** Digital Product Profit Calculator. Round required sales UP. */
export function computeDigitalProductProfit(input: {
  productPrice: number;
  salesPerMonth: number;
  platformFees?: number;
  paymentProcessingFees?: number;
  advertising?: number;
  software?: number;
  refunds?: number;
  otherExpenses?: number;
  monthlyProfitGoal?: number;
}): {
  grossRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerSale: number;
  profitMargin: number;
  salesNeeded: number;
} {
  const price = Math.max(0, Number(input.productPrice) || 0);
  const sales = Math.max(0, Number(input.salesPerMonth) || 0);
  const expenses =
    Math.max(0, Number(input.platformFees) || 0) +
    Math.max(0, Number(input.paymentProcessingFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.software) || 0) +
    Math.max(0, Number(input.refunds) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const grossRevenue = price * sales;
  const estimatedProfit = grossRevenue - expenses;
  const profitPerSale = sales > 0 ? estimatedProfit / sales : 0;
  const profitMargin = grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0;
  const goal = Math.max(0, Number(input.monthlyProfitGoal) || 0);
  const salesNeeded = profitPerSale > 0 ? Math.ceil(goal / profitPerSale) : 0;
  return {
    grossRevenue,
    totalExpenses: expenses,
    estimatedProfit,
    profitPerSale,
    profitMargin,
    salesNeeded,
  };
}
