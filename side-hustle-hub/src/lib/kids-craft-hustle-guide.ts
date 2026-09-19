/**
 * Craft Hustle Starter + Kevina Kindness Extra (`kids-craft-hustle`, Guide #053).
 * Starter Membership. Time/earnings top-card: NEEDS EVELYN CONFIRMATION in kids-guide metadata.
 * Plain data only — no imports from guide-tools.
 */

export const KIDS_CRAFT_HUSTLE_REALITY_CHECK = {
  title: "THE PARENT/GUARDIAN RUNS THE BUSINESS SIDE",
  body: [
    "The child can create, learn, count, package, and practice a friendly pitch. The parent/guardian approves materials, supervises tools, owns/manages online accounts, communicates with strangers, handles payments, controls public posts, checks local selling rules, and stays present at sales.",
    "",
    "Never post a child's: full name · home address · school · exact routine · private phone/email · live location · unapproved photo/video.",
    "",
    "Use original art and words. Do not sell crafts using copied characters, logos, team marks, celebrity images, song lyrics, or artwork found online unless the seller has clear permission or a valid license.",
    "",
    "Etsy currently requires account owners to be 18; minors ages 13–17 may use a parent/guardian-owned account only with permission and direct supervision, while children under 13 may not use Etsy. Verify current policy before use: https://www.etsy.com/legal/minors/",
    "",
    "Tagline: Make Something Bright. Sell It Safely. Share a Little Kindness.",
  ].join("\n"),
};

export const KIDS_CRAFT_HUSTLE_NOTES_WORKSHEET = `CRAFT HUSTLE + KEVINA KINDNESS EXTRA

PARENT APPROVAL
Parent/Guardian: ________
Safe Tools: ________
Adult-Only Tools: ________
Approved Sales Channels: ________
Payment Account Owner: ________
Privacy Rules: ________

PRODUCT
Craft: ________
Design 1: ________
Design 2: ________
Design 3: ________
Winning Design: ________
Materials: ________
Safety/Care Note: ________

PRICING
Batch Cost: $____
Sellable Items: ____
Cost per Item: $____
Price per Item: $____
Set Price: $____

KINDNESS EXTRA
Extra: ________
Cost per Order: $____
Give-Back Goal: ________

SALES
Channel/Event: ________
Date: ________
Items Made: ____
Items Sold: ____
Revenue: $____
Expenses: $____
Profit: $____

REVIEW
Best Seller: ________
Customer Feedback: ________
Quality Fix: ________
Restock Quantity: ________

GYSH PRO TIP
The first goal is not a huge store. It is one safe, original, well-made product that somebody is happy to buy.

IDEA → THREE SAMPLES → SAFE TEST → FAIR PRICE → SMALL BATCH → KINDNESS EXTRA → LEARN.

STARTER MEMBERSHIP CHALLENGE
Complete one parent-supervised mini launch:
1. Pick one craft.
2. Set safety/privacy rules.
3. Make three original samples.
4. Ask 3–5 trusted people for feedback.
5. Calculate cost per item.
6. Set a fair price.
7. Add one kindness extra.
8. Make a 10–20 item batch.
9. Sell through one approved channel.
10. Count profit and choose what to improve.`;

export const KIDS_CRAFT_HUSTLE_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Make a tiny set of original stickers, charms, kindness cards, or another simple craft; price it with a parent; sell only through parent-approved channels; and include a Kevina-inspired kindness extra that helps someone feel seen and encouraged. Tagline: Make Something Bright. Sell It Safely. Share a Little Kindness. Category: Kids / Creative Crafts / Give-Back. Best for Kids who enjoy making small crafts with a parent/guardian managing safety, sales, accounts, money, and customer communication. Beginner · Low startup · Short Parent-Supervised Sessions / School Fairs / Family Events · Home Craft Space / Parent-Approved Fairs / Parent-Managed Online Shop · Per Item / Small Sets / Parent-Managed Sales · Starter Membership. Top-card time and earnings: NEEDS EVELYN CONFIRMATION.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Parent/guardian approval and active supervision · One simple craft idea · Safe workspace · Age-appropriate supplies/tools · Three-item sample set · Parent-approved selling location/channel · Simple cost and price worksheet · Packaging plan · Payment plan managed by parent/guardian · Income/expense log · Kindness-extra idea.",
  },
  {
    id: "parent-checks",
    label: "Parent/guardian should check",
    detail:
      "Age and account rules for any platform · School, fair, market, venue, or neighborhood selling rules · Sales-tax/business-license requirements · Product-safety and labeling requirements that may apply · Shipping and refund expectations · Use of licensed/copyrighted/trademarked material.",
  },
  {
    id: "safety",
    label: "Safety boundaries",
    detail:
      "Adult handles hot glue, ovens, resin, blades, drills, heat presses, laminators, or other hazardous tools as appropriate · Avoid unsafe chemicals or poorly ventilated processes · Keep small parts away from young children · Do not market a craft as a toy, teether, food item, cosmetic, or child-safety product unless applicable safety rules are understood and met · Stop selling any item that breaks dangerously or creates a hazard.",
  },
];

export const KIDS_CRAFT_HUSTLE_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Cost, inventory, sales, and expenses" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Product descriptions and fair checklist" },
  { label: "Canva", url: "https://www.canva.com/", note: "Original layouts with properly licensed elements" },
  { label: "Etsy minors policy", url: "https://www.etsy.com/legal/minors/", note: "Parent-owned account rules" },
  { label: "USPTO Trademark Search", url: "https://www.uspto.gov/trademarks/search", note: "Research names and marks" },
];

export const KIDS_CRAFT_HUSTLE_SUPPLIES = {
  starterKitTotal:
    "Start with enough for 10–20 items. Do not buy bulk inventory before testing what people actually want.",
  items: [
    { id: "paper", name: "Paper or sticker paper", qty: "as needed", estCost: "$3–10", notes: "Sticker/kindness card" },
    { id: "markers", name: "Markers or colored pencils", qty: "1 set", estCost: "$0–8", notes: "Essential" },
    { id: "scissors", name: "Scissors (used safely)", qty: "1", estCost: "$0–5", notes: "Adult supervision" },
    { id: "clay", name: "Approved clay/beads/material", qty: "as needed", estCost: "$5–15", notes: "Charm craft" },
    { id: "cardstock", name: "Cardstock", qty: "1 pack", estCost: "$3–8", notes: "Bookmark craft" },
    { id: "bags", name: "Small bags/envelopes", qty: "10–20", estCost: "$3–8", notes: "Core packaging" },
    { id: "labels", name: "Price labels", qty: "1 pack", estCost: "$2–5", notes: "Core packaging" },
    { id: "kindness-cards", name: "Thank-you/kindness cards", qty: "10–20", estCost: "$2–5", notes: "Kevina kindness extra" },
    { id: "sign", name: "Table sign", qty: "1", estCost: "$0–5", notes: "Fair/event display" },
    { id: "sleeves", name: "Clear sleeves or envelopes", qty: "as needed", estCost: "$2–6", notes: "Optional protection", optional: true },
    { id: "ribbon", name: "Ribbon/tassel", qty: "as needed", estCost: "$2–5", notes: "Bookmark optional", optional: true },
  ],
};

export const KIDS_CRAFT_HUSTLE_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "kch_paper", name: "Paper / Pencil", freePlanAvailable: true, planLabelApplicable: false, costNote: "Sketch original ideas" },
  { id: "kch_calc", name: "Calculator", freePlanAvailable: true, planLabelApplicable: false, costNote: "Cost and price math" },
  { id: "kch_sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Parent-managed cost, inventory, sales, expenses", url: "https://sheets.google.com/" },
  { id: "kch_docs", name: "Google Docs", freePlanAvailable: true, costNote: "Product descriptions and fair checklist", url: "https://docs.google.com/" },
  { id: "kch_canva", name: "Canva", freePlanAvailable: true, costNote: "Original layouts with properly licensed elements", url: "https://www.canva.com/" },
  { id: "kch_camera", name: "Phone Camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Parent-managed product photos — no private location details" },
  { id: "kch_calendar", name: "Calendar", freePlanAvailable: true, costNote: "Fair/order deadlines", url: "https://calendar.google.com/" },
  { id: "kch_pay", name: "Payment App/Processor", freePlanAvailable: true, costNote: "Parent/guardian account only", optional: true },
  { id: "kch_etsy", name: "Etsy or Other Marketplace", freePlanAvailable: true, costNote: "Optional — parent-owned/managed; current age rules", url: "https://www.etsy.com/", optional: true },
  { id: "kch_stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Original Sketch + Three Samples + Cost Sheet + Parent-Approved Sales Channel + Inventory/Profit Tracker" },
];

export const KIDS_CRAFT_HUSTLE_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: NEEDS EVELYN CONFIRMATION — no top-card earnings string is exposed in the current special kids-guide record.",
    "",
    "The existing guide content says $1–$5 is common for a simple item. Use that only as a starter example, not as a guarantee or required price.",
    "",
    "STARTER ITEM EXAMPLES",
    "Small Kindness Card: $1 – $3",
    "Single Sticker: $1 – $3",
    "Simple Charm: $2 – $5",
    "Mini Bookmark: $2 – $5",
    "Three-Piece Mini Set: $5 – $12",
    "Five-Piece Gift/Fair Set: $8 – $20",
    "Personalized Name/Color Add-On: +$1 – $4",
    "",
    "KINDNESS EXTRA",
    "Include one low-cost extra such as: a handwritten encouragement card · a tiny bonus sticker · a “pass kindness on” note · a free craft donated through a parent-approved activity.",
    "",
    "The kindness extra should be included in the cost calculation. Giving is wonderful; accidentally losing money on every order is not a sustainable superpower.",
    "",
    "PRICE FORMULA: Materials per Item + Packaging + Selling/Payment Fees + Parent-Approved Value for Time + Small Profit Amount = Price",
    "COST PER ITEM: Total Batch Material Cost ÷ Number of Sellable Items",
    "",
    "MONTHLY EXAMPLES: 20 items × $3 average = $60 gross · 30 items × $4 average = $120 gross · 10 mini sets × $10 average = $100 gross.",
    "Gross revenue is NOT profit. Do not guarantee earnings.",
  ].join("\n"),
  raiseTip:
    "Include the kindness extra in cost calculations. Parent/guardian owns accounts, payments, and stranger communication. Examples only — not income guarantees.",
  items: [
    { id: "card", label: "Small kindness card", price: "$1 – $3", notes: "Examples only" },
    { id: "sticker", label: "Single sticker", price: "$1 – $3", notes: "Examples only" },
    { id: "charm", label: "Simple charm", price: "$2 – $5", notes: "Examples only" },
    { id: "bookmark", label: "Mini bookmark", price: "$2 – $5", notes: "Examples only" },
    { id: "mini-set", label: "Three-piece mini set", price: "$5 – $12", notes: "Examples only" },
    { id: "gift-set", label: "Five-piece gift/fair set", price: "$8 – $20", notes: "Examples only" },
    { id: "addon", label: "Personalized name/color add-on", price: "+$1 – $4", notes: "Examples only" },
  ],
};

/** Exactly 11 authored core steps. No GYSH marketing sequence. */
export const KIDS_CRAFT_HUSTLE_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Pick One Tiny Craft",
    desc: [
      "Choose one:",
      "- Sticker",
      "- Charm",
      "- Kindness card",
      "- Mini bookmark",
      "- Other parent-approved simple craft",
      "",
      "Keep the first batch small enough to finish in one or two supervised sessions.",
    ].join("\n"),
  },
  {
    title: "Set Parent & Safety Rules",
    desc: [
      "Parent/guardian decides:",
      "- Tools the child may use",
      "- Tasks the adult performs",
      "- Workspace",
      "- Selling locations",
      "- Online account ownership",
      "- Photo/privacy rules",
      "- Customer communication",
      "- Payment/refund handling",
      "- Shipping",
      "",
      "Write the rules before creating inventory.",
    ].join("\n"),
  },
  {
    title: "Create Three Original Samples",
    desc: [
      "Make three versions using your own art and words.",
      "",
      "Check: neatness · durability · safe edges/parts · consistent size · correct spelling · clean packaging.",
      "",
      "Let the parent approve every sample before selling.",
    ].join("\n"),
  },
  {
    title: "Test Quality & Choose the Winner",
    desc: [
      "Ask 3–5 trusted people:",
      "- Which sample do you like?",
      "- What would you use it for?",
      "- What color/theme do you prefer?",
      "- Does anything look weak or unfinished?",
      "",
      "Do not ask strangers to contact the child directly.",
    ].join("\n"),
  },
  {
    title: "Calculate Cost & Set a Fair Price",
    desc: [
      "List: material cost · packaging cost · fees · adult-managed shipping if any · time · kindness extra.",
      "",
      "Calculate cost per item, then use the Suggested Pricing tab with a parent.",
    ].join("\n"),
  },
  {
    title: "Add the Kevina Kindness Extra",
    desc: [
      "Choose one repeatable extra:",
      "- “You make the world brighter” card",
      "- Mini bonus sticker",
      "- Thank-you note",
      "- Donation item after a parent-approved sales milestone",
      "",
      "Keep it original, encouraging, inexpensive, and easy to include.",
    ].join("\n"),
  },
  {
    title: "Make a Small Test Batch",
    desc: [
      "Create 10–20 sellable items.",
      "",
      "Track: item name · color/design · quantity made · quantity rejected · cost · price.",
      "",
      "Quality matters more than making a giant pile.",
    ].join("\n"),
  },
  {
    title: "Choose a Safe Sales Channel",
    desc: [
      "Parent-approved options:",
      "- Family event",
      "- School fair with permission",
      "- Church/community event with permission",
      "- Known neighbors with parent present",
      "- Parent-managed online shop",
      "",
      "The parent checks fees, rules, licenses/taxes, age restrictions, pickup/shipping, and refunds.",
    ].join("\n"),
  },
  {
    title: "Create the Display or Listing",
    desc: [
      "Include: clear product name · original photo · what the buyer receives · size/material · price · care/safety note if relevant · kindness-extra explanation · pickup/shipping timing managed by adult.",
      "",
      "Do not use copied characters, logos, or unsafe claims.",
    ].join("\n"),
  },
  {
    title: "Make Sales & Track Real Profit",
    desc: [
      "Parent handles payments and customer issues.",
      "",
      "Record: items sold · revenue · material cost · packaging · fees · shipping · refunds · unsold/damaged items.",
      "",
      "Profit = Revenue − Expenses.",
      "",
      "Split profit with a parent-approved plan such as: SPEND / SAVE / GROW / GIVE.",
    ].join("\n"),
  },
  {
    title: "Review, Restock & Share Kindness",
    desc: [
      "After the test batch ask:",
      "- Which design sold?",
      "- Which did not?",
      "- Was the price enough?",
      "- Did anything break?",
      "- Did buyers understand the kindness extra?",
      "",
      "Restock only winners. Improve one thing. Choose the next parent-approved kindness action.",
    ].join("\n"),
  },
];

export function kidsCraftHustleToolsDisclaimer(): string {
  return "Beginner stack: Original Sketch + Three Samples + Cost Sheet + Parent-Approved Sales Channel + Inventory/Profit Tracker. Parent/guardian runs the business side — accounts, payments, stranger communication, and public posts. Verify Etsy and platform age rules before use.";
}

export function computeKidsCraftHustleProfit(input: {
  itemsSold?: number;
  avgPricePerItem?: number;
  setsSold?: number;
  avgPricePerSet?: number;
  otherRevenue?: number;
  materials?: number;
  packaging?: number;
  platformPaymentFees?: number;
  eventTableFees?: number;
  shipping?: number;
  refundsReplacements?: number;
  kindnessExtrasGiving?: number;
  otherExpenses?: number;
  itemsMade?: number;
  itemsUnsoldDamaged?: number;
  totalUnitsSoldOverride?: number;
}): {
  itemRevenue: number;
  setRevenue: number;
  totalRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalUnitsSold: number;
  profitPerUnit: number | null;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const itemRevenue = n(input.itemsSold) * n(input.avgPricePerItem);
  const setRevenue = n(input.setsSold) * n(input.avgPricePerSet);
  const totalRevenue = itemRevenue + setRevenue + n(input.otherRevenue);
  const totalExpenses =
    n(input.materials) +
    n(input.packaging) +
    n(input.platformPaymentFees) +
    n(input.eventTableFees) +
    n(input.shipping) +
    n(input.refundsReplacements) +
    n(input.kindnessExtrasGiving) +
    n(input.otherExpenses);
  const estimatedProfit = totalRevenue - totalExpenses;
  const totalUnitsSold =
    input.totalUnitsSoldOverride != null && input.totalUnitsSoldOverride > 0
      ? n(input.totalUnitsSoldOverride)
      : n(input.itemsSold) + n(input.setsSold);
  return {
    itemRevenue,
    setRevenue,
    totalRevenue,
    totalExpenses,
    estimatedProfit,
    totalUnitsSold,
    profitPerUnit: totalUnitsSold > 0 ? estimatedProfit / totalUnitsSold : null,
  };
}
