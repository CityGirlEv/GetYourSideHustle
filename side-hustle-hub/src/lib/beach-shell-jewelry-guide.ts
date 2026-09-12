/**
 * Beach Shell Jewelry (`beach-shell-jewelry`, Guide #003).
 * Collect (where allowed) or buy craft shells; make simple jewelry; sell locally or online.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const BEACH_SHELL_JEWELRY_REALITY_CHECK = {
  title: "COLLECT RESPONSIBLY",
  body: [
    "Never assume shells may be collected everywhere.",
    "Check the rules for the specific beach, park, preserve, protected area, or shoreline before collecting.",
    "Do not take live shells or living animals. Avoid protected species and restricted natural resources. When unsure, leave it.",
    "A great alternative is to use legally purchased craft shells.",
    "",
    "For minors, a parent/guardian should supervise beach collecting, tools, online selling accounts, payments, shipping, and meetups.",
    "",
    "Tagline: Find It. Clean It. Create It. Sell It.",
  ].join("\n"),
};

/** Beach shell jewelry planner shown above freeform Notes for this guide. */
export const BEACH_SHELL_JEWELRY_NOTES_WORKSHEET = `MY BEACH SHELL JEWELRY PLAN

First Product: ________
Shell Source: ________
Collection Allowed/Verified: ☐ Yes ☐ Purchased Shells
Selling Price: $____
Cost Per Piece: $____
Estimated Profit Per Piece: $____

Marketing Channels:
1. ________
2. ________
3. ________

FIRST BATCH
Quantity: ____
Materials: ________
Batch Cost: $____
Where I’ll Sell: ________
Market/Event Date: ________
Online Shop: ________

SALES TRACKER
Date | Product | Qty | Revenue | Expenses | Profit
________________________________________________________
________________________________________________________
________________________________________________________

BESTSELLERS
Best Design: ________
Best Shell Style/Color: ________
Best Channel: ________
Customer Requests: ________
What Did Not Sell: ________
What I’ll Make More Of: ________

Money I’ll Save: $____
Money I’ll Reinvest: $____
Next Supply Purchase: ________

GYSH PRO TIP
THE SHELL IS ALREADY INTERESTING — DON'T OVERDESIGN IT.
A clean, simple piece can show off the shell's natural shape and color.
SOURCE RESPONSIBLY → MAKE IT WELL → PRICE FOR PROFIT → TELL THE STORY → TRACK WHAT SELLS.

BEGINNER CHALLENGE
Create your FIRST 5-PIECE MINI COLLECTION.
1. Legally source/purchase suitable shells.
2. Make 5 pieces of ONE jewelry type.
3. Calculate cost per piece.
4. Set your price.
5. Take clear photos.
6. Show/list through your selected channels.
7. Track every sale.
Goal: prove you can SOURCE IT → MAKE IT → PRICE IT → SELL IT → PROFIT.`;

export const BEACH_SHELL_JEWELRY_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Collect shells at the beach where collection is allowed and turn suitable shells into earrings, bracelets, necklaces, charms, and other simple jewelry to sell locally or online. Tagline: Find It. Clean It. Create It. Sell It. Category: Crafts / Jewelry / Product Sales. Best for juniors / teens, adults, seniors / retirees. Beginner · Low startup · Flexible / market weekends · Home / local markets / online · Per piece / product sales · 3 - 10 hrs/week · Free Guide.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Legal/approved shell source · Parent/guardian approval for minors · Safe workspace · Basic jewelry-making supplies · Small startup budget · Simple cost tracker · Packaging · Safe selling/payment method.",
  },
  {
    id: "before-making",
    label: "Before making",
    detail:
      "Check local collection rules · Use empty, legally collected or legally purchased shells · Clean and dry shells appropriately · Discard sharp, cracked, contaminated, or unsafe pieces · Learn safe use of pliers, drills, adhesives, cutters, and other tools · Use eye protection for drilling/cutting where appropriate · Follow product/material safety guidance · Clearly describe materials to buyers where relevant.",
  },
  {
    id: "collect-responsibly",
    label: "Collect responsibly",
    detail:
      "Never assume shells may be collected everywhere. Check the rules for the specific beach, park, preserve, protected area, or shoreline before collecting. Do not take live shells or living animals. Avoid protected species and restricted natural resources. When unsure, leave it. A great alternative is to use legally purchased craft shells.",
  },
  {
    id: "minors",
    label: "Parent/guardian for minors",
    detail:
      "A parent/guardian should supervise beach collecting, tools, online selling accounts, payments, shipping, and meetups.",
  },
  {
    id: "hypoallergenic",
    label: "Do not overclaim materials",
    detail:
      "Do not market natural shell jewelry as hypoallergenic unless the actual jewelry components support that claim.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — don't overdesign the shell",
    detail:
      "The shell is already interesting — don't overdesign it. A clean, simple piece can show off the shell's natural shape and color. Source responsibly → make it well → price for profit → tell the story → track what sells.",
  },
];

export const BEACH_SHELL_JEWELRY_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Cards, signage, and listing photos",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Track cost per piece, sales, and bestsellers",
  },
  {
    label: "Etsy seller handbook",
    url: "https://www.etsy.com/sell",
    note: "Verify fees, seller eligibility, age requirements, and prohibited-item/material policies",
  },
];

export const BEACH_SHELL_JEWELRY_SUPPLIES = {
  starterKitTotal:
    "About $15–40 — start with a small collection and basic tools; do not buy expensive jewelry equipment before proving demand",
  items: [
    {
      id: "shells",
      name: "Legally collected or purchased shells",
      qty: "1 small batch",
      estCost: "$0–15",
      notes: "Empty shells where collection is allowed, or craft shells from a legitimate supplier",
    },
    {
      id: "pliers",
      name: "Jewelry pliers",
      qty: "1 pair",
      estCost: "$8–15",
    },
    {
      id: "jumps",
      name: "Jump rings",
      qty: "1 pack (50+)",
      estCost: "$3–6",
    },
    {
      id: "hooks",
      name: "Earring hooks/posts",
      qty: "1 pack",
      estCost: "$4–8",
      notes: "As needed for earrings",
    },
    {
      id: "cord",
      name: "Cord, chain, or bracelet material",
      qty: "1–2 spools",
      estCost: "$5–12",
    },
    {
      id: "clasps",
      name: "Clasps",
      qty: "1 pack",
      estCost: "$4–8",
    },
    {
      id: "adhesive",
      name: "Jewelry-safe adhesive",
      qty: "1",
      estCost: "$3–8",
      notes: "Where appropriate",
    },
    {
      id: "containers",
      name: "Small containers for findings",
      qty: "2–4",
      estCost: "$2–8",
    },
    {
      id: "cleaning",
      name: "Cleaning supplies appropriate to the shells",
      qty: "1 set",
      estCost: "$2–8",
    },
    {
      id: "packaging",
      name: "Packaging",
      qty: "1 pack",
      estCost: "$4–10",
    },
    {
      id: "labels",
      name: "Price labels",
      qty: "1 pack",
      estCost: "$2–6",
    },
    {
      id: "drill",
      name: "Appropriate small drill/tool",
      qty: "1",
      estCost: "$10–25",
      notes: "For drilled designs — eye protection and adult supervision for minors",
      optional: true,
    },
    {
      id: "eye-protection",
      name: "Eye protection",
      qty: "1",
      estCost: "$3–10",
      notes: "For drilling/cutting",
      optional: true,
    },
    {
      id: "beads",
      name: "Beads",
      qty: "1 pack",
      estCost: "$3–10",
      optional: true,
    },
    {
      id: "charms",
      name: "Charms",
      qty: "1 pack",
      estCost: "$3–10",
      optional: true,
    },
    {
      id: "wire",
      name: "Wire",
      qty: "1 spool",
      estCost: "$3–10",
      optional: true,
    },
    {
      id: "cards",
      name: "Display cards",
      qty: "1 pack",
      estCost: "$4–10",
      optional: true,
    },
    {
      id: "boxes",
      name: "Jewelry boxes/pouches",
      qty: "1 pack",
      estCost: "$4–12",
      optional: true,
    },
    {
      id: "stands",
      name: "Small display stands",
      qty: "1–2",
      estCost: "$5–15",
      optional: true,
    },
    {
      id: "mailers",
      name: "Shipping mailers",
      qty: "1 pack",
      estCost: "$4–12",
      notes: "Only if you ship",
      optional: true,
    },
  ],
};

export const BEACH_SHELL_JEWELRY_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "pliers",
    name: "Jewelry pliers",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Design/making — basic jewelry tools",
  },
  {
    id: "ruler",
    name: "Measuring tape/ruler",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Lengths for necklaces, bracelets, and anklets",
  },
  {
    id: "drill",
    name: "Appropriate shell drilling tool",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Where needed — eye protection and adult supervision for minors",
    optional: true,
  },
  {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Cards, signage, and listing photos",
    url: "https://www.canva.com/",
  },
  {
    id: "calculator",
    name: "Calculator",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Cost per piece and estimated profit per piece",
  },
  {
    id: "sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Track costs, sales, and bestsellers",
    url: "https://sheets.google.com/",
  },
  {
    id: "notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Orders, shell source, and customer requests",
    url: "https://docs.google.com/",
  },
  {
    id: "markets",
    name: "Approved craft/vendor markets & community events",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "In-person selling where permitted — follow venue rules",
  },
  {
    id: "etsy",
    name: "Etsy (or another approved marketplace)",
    freePlanAvailable: false,
    costNote:
      "Online listings where eligibility requirements are met — verify fees, age rules, and prohibited-item/material policies",
    url: "https://www.etsy.com/sell",
  },
  {
    id: "facebook",
    name: "Facebook",
    freePlanAvailable: true,
    costNote: "Local/community groups where appropriate — parent/guardian for minors",
    url: "https://www.facebook.com/",
  },
  {
    id: "instagram",
    name: "Instagram",
    freePlanAvailable: true,
    costNote: "Product photos — appropriate supervision",
    url: "https://www.instagram.com/",
  },
  {
    id: "tiktok",
    name: "TikTok",
    freePlanAvailable: true,
    costNote: "Short product videos where appropriate",
    url: "https://www.tiktok.com/",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    freePlanAvailable: true,
    costNote: "Product photos and ideas",
    url: "https://www.pinterest.com/",
  },
  {
    id: "beginner-stack",
    name: "Beginner tool stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Basic Jewelry Tools + Calculator + Google Sheets + Canva + One Selling Channel",
  },
];

export const BEACH_SHELL_JEWELRY_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "BEACH SHELL JEWELRY STARTER EXAMPLES",
    "",
    "Keep displayed pricing: $8 – $35 / piece (examples).",
    "",
    "Possible starter examples:",
    "Simple shell charm/bracelet: $8–$15",
    "Simple earrings: $10–$20",
    "Shell necklace: $15–$25",
    "More detailed/custom piece: $20–$35+",
    "",
    "Find your cost first:",
    "Shell Cost/Collection Allocation + Jewelry Findings + Cord/Chain + Packaging + Per-item Fees + Other Direct Costs = Cost Per Piece",
    "Estimated Profit Per Piece = Selling Price - Cost Per Piece",
    "",
    "Example:",
    "Findings/chain $3.00",
    "Packaging $1.00",
    "Fees/other $1.00",
    "Total cost $5.00",
    "Selling price $18.00",
    "Estimated profit $13.00",
    "",
    "Price may vary by materials, design time, customization, packaging, selling fees, and market.",
    "Do not price only by copying another seller.",
  ].join("\n"),
  raiseTip:
    "Charge more for designs that require more materials/time or customization. Know YOUR costs first. Examples only — not income guarantees.",
  items: [
    {
      id: "charm",
      label: "Simple shell charm/bracelet",
      price: "$8–$15",
    },
    {
      id: "earrings",
      label: "Simple earrings",
      price: "$10–$20",
    },
    {
      id: "necklace",
      label: "Shell necklace",
      price: "$15–$25",
    },
    {
      id: "custom",
      label: "More detailed/custom piece",
      price: "$20–$35+",
    },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ only. */
export const BEACH_SHELL_JEWELRY_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your First Shell Jewelry Product",
    desc: [
      "Pick ONE simple product:",
      "☐ Earrings",
      "☐ Bracelet",
      "☐ Necklace",
      "☐ Shell charm",
      "☐ Anklet",
      "☐ Keychain/jewelry accessory",
      "",
      "Write:",
      "My First Product: ________",
      "",
      "Choose something you can make safely and consistently.",
    ].join("\n"),
  },
  {
    title: "Source Shells Legally & Responsibly",
    desc: [
      "Before collecting, check the exact location's rules.",
      "Collect only empty shells where allowed.",
      "Do not take live animals or protected/restricted specimens.",
      "For minors, collect with parent/guardian supervision.",
      "Alternative: buy craft shells from a legitimate supplier.",
      "Record where your shells came from.",
    ].join("\n"),
  },
  {
    title: "Clean, Sort & Prep the Shells",
    desc: [
      "Sort shells by size, shape, color, condition, and possible use.",
      "Clean using a method appropriate to the shell/material.",
      "Dry completely.",
      "Discard pieces that are sharp, cracked, foul-smelling, unstable, or otherwise unsuitable.",
      "If drilling, use proper tools, eye protection, and supervision where needed.",
    ].join("\n"),
  },
  {
    title: "Make 3–5 Test Pieces & Find Your Cost",
    desc: [
      "Create a small test batch.",
      "Track findings, chain/cord, beads, adhesive, packaging, fees, and other direct costs.",
      "Calculate Cost Per Piece.",
      "Check durability, comfort, closure, sharp edges, symmetry where intended, and overall finish.",
      "Fix problems before selling.",
    ].join("\n"),
  },
  {
    title: "Set Your Starter Price",
    desc: [
      "Use Suggested Pricing and YOUR costs.",
      "Selling Price - Cost Per Piece = Estimated Profit Per Piece.",
      "",
      "Write:",
      "Selling Price: $____",
      "Cost Per Piece: $____",
      "Estimated Profit: $____",
      "",
      "Charge more for designs that require more materials/time or customization.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way people hear about your jewelry. Pick only 2 or 3 this month.",
      "",
      "Options:",
      "☐ Friends/family",
      "☐ Referrals",
      "☐ Approved school/community fair",
      "☐ Craft/vendor market",
      "☐ Beach-town/tourist market where permitted",
      "☐ Facebook",
      "☐ Instagram",
      "☐ TikTok",
      "☐ Pinterest",
      "☐ Etsy where eligibility requirements are met",
      "",
      "Write product + price and ONE measurable goal per channel.",
      "Examples: show 10 trusted people; apply to 1 market; post 3 product photos; list 5 pieces online.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "☐ 3–6 clear jewelry photos",
      "☐ Product name",
      "☐ Price",
      "☐ Materials description",
      "☐ Short story/description",
      "☐ Order/contact method",
      "☐ Simple market sign/display card",
      "",
      "Sample:",
      "“BEACH SHELL JEWELRY — Handmade using responsibly sourced shells. [Product] $____. Each natural shell is unique, so color/shape may vary.”",
      "",
      "Use parent-approved contact/payment information for minors.",
      "Never claim a shell's source/species or material property unless you know it is accurate.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY the 2–3 channels selected.",
      "Show pieces to 8–12 appropriate people, post approved photos, ask for referrals, prepare for an approved market, or list pieces in an approved shop.",
      "",
      "Sample:",
      "“Hi! I’ve started making handmade beach shell jewelry using responsibly sourced shells. Pieces start at $____. Here are a few designs I have available.”",
      "",
      "Track Date | Channel | Product | People Reached | Orders/Sales.",
      "Protect minors' and customers' private information.",
    ].join("\n"),
  },
  {
    title: "Make, Package & Sell Your Small Batch",
    desc: [
      "Make a manageable batch based on interest.",
      "Quality-check each piece.",
      "For each order confirm item, size/length where relevant, customization, total price, payment, delivery/shipping.",
      "Package to protect delicate shells.",
      "For online sales, accurately describe natural variations and materials.",
      "Never arrange unsafe private meetups.",
    ].join("\n"),
  },
  {
    title: "Track Sales & Bestsellers",
    desc: [
      "Record:",
      "☐ Pieces Made",
      "☐ Pieces Sold",
      "☐ Gross Revenue",
      "☐ Materials",
      "☐ Packaging",
      "☐ Selling Fees",
      "☐ Market Fees",
      "☐ Shipping Paid by Seller",
      "☐ Other Expenses",
      "☐ Estimated Profit",
      "",
      "Ask:",
      "Which design sold best?",
      "Which shell style/color was popular?",
      "Which price worked?",
      "Which channel produced sales?",
      "Which piece took too long?",
      "What did customers request?",
    ].join("\n"),
  },
  {
    title: "Reinvest & Grow What Sells",
    desc: [
      "Decide how much profit to Save, Enjoy, and Reinvest.",
      "",
      "Growth cycle:",
      "MAKE A SMALL BATCH → SELL → TRACK → FIND WINNERS → REINVEST → MAKE MORE WINNERS",
      "",
      "Possible next moves:",
      "☐ New color/cord",
      "☐ Matching earrings + necklace",
      "☐ Small gift set",
      "☐ Custom length",
      "☐ Better display",
      "☐ Another approved market",
      "☐ Restock bestseller",
      "",
      "Grow from actual demand.",
    ].join("\n"),
  },
];

export function beachShellJewelryToolsDisclaimer(): string {
  return [
    "Beginner stack: Basic Jewelry Tools + Calculator + Google Sheets + Canva + One Selling Channel.",
    "",
    "Verify current marketplace fees, seller eligibility, age requirements, and prohibited-item/material policies.",
    "",
    "For minors, a parent/guardian should supervise beach collecting, tools, online selling accounts, payments, shipping, and meetups.",
  ].join("\n");
}

/** Beach shell jewelry profit math. */
export function computeBeachShellJewelryProfit(input: {
  sellingPricePerPiece: number;
  piecesSold: number;
  materialCostPerPiece?: number;
  packagingCostPerPiece?: number;
  sellingFees?: number;
  marketTableFee?: number;
  shippingPaidBySeller?: number;
  advertising?: number;
  otherExpenses?: number;
}): {
  grossRevenue: number;
  productCost: number;
  totalExpenses: number;
  estimatedProfit: number;
  estimatedProfitPerPiece: number;
  profitMarginPercent: number;
} {
  const price = Math.max(0, Number(input.sellingPricePerPiece) || 0);
  const units = Math.max(0, Number(input.piecesSold) || 0);
  const material = Math.max(0, Number(input.materialCostPerPiece) || 0);
  const packaging = Math.max(0, Number(input.packagingCostPerPiece) || 0);
  const sellingFees = Math.max(0, Number(input.sellingFees) || 0);
  const marketFee = Math.max(0, Number(input.marketTableFee) || 0);
  const shipping = Math.max(0, Number(input.shippingPaidBySeller) || 0);
  const advertising = Math.max(0, Number(input.advertising) || 0);
  const other = Math.max(0, Number(input.otherExpenses) || 0);

  const grossRevenue = price * units;
  const productCost = (material + packaging) * units;
  const totalExpenses =
    productCost + sellingFees + marketFee + shipping + advertising + other;
  const estimatedProfit = grossRevenue - totalExpenses;
  const estimatedProfitPerPiece = units > 0 ? estimatedProfit / units : 0;
  const profitMarginPercent = grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0;

  return {
    grossRevenue,
    productCost,
    totalExpenses,
    estimatedProfit,
    estimatedProfitPerPiece,
    profitMarginPercent,
  };
}
