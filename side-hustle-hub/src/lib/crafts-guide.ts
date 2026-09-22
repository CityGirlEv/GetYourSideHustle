/**
 * Handmade Craft Sales (`crafts`, Guide #010).
 * Make one simple product, price from cost, sell in small batches.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const CRAFTS_REALITY_CHECK = {
  title: "START WITH ONE PRODUCT",
  body: [
    "Start with ONE simple product you can make consistently.",
    "",
    "Make a few, see what people like, then make more of what actually sells.",
    "",
    "Examples: stickers, friendship bracelets, clay charms, earrings, keychains, greeting cards, bookmarks, beaded items, small art prints, simple personalized crafts.",
    "",
    "For minors, a parent/guardian should supervise selling accounts, payments, meetups, shipping, market participation, and platform use requiring an adult account holder.",
    "",
    "Tagline: Make It. Price It. Show It. Sell It.",
  ].join("\n"),
};

/** Handmade craft planner shown above freeform Notes for this guide. */
export const CRAFTS_NOTES_WORKSHEET = `MY HANDMADE CRAFT PLAN

My Product:
____________________

Selling Price:
$____

Cost Per Item:
$____

Estimated Profit Per Item:
$____

Marketing Channels:

1. __________
2. __________
3. __________

First Batch:
Quantity: _____
Materials: ____________________
Batch Cost: $____
Where I’ll Sell: ____________________
Market/Event Date: ____________________
Online Shop: ____________________

SALES TRACKER:
Date | Product | Qty Sold | Revenue | Expenses | Profit
________________________________________________________
________________________________________________________
________________________________________________________

What Sold Best:
____________________

Best Color/Style:
____________________

Best Channel:
____________________

Customer Requests:
____________________

What Did Not Sell:
____________________

What I’ll Make More Of:
____________________

Money I’ll Save: $____
Money I’ll Reinvest: $____
What I’ll Buy for the Business:
____________________

GYSH PRO TIP — DON’T FALL IN LOVE WITH INVENTORY. FALL IN LOVE WITH WHAT SELLS.
MAKE A FEW → SHOW THEM → SELL THEM → TRACK THEM → MAKE MORE OF THE WINNERS.

BEGINNER CHALLENGE — FIRST 5-ITEM MINI COLLECTION:
1. Make 5 of ONE product.
2. Calculate cost/item.
3. Set price.
4. Take clear photos.
5. Show/list them through chosen channels.
6. Track every sale.
Goal: CAN I MAKE IT? CAN I PRICE IT? CAN I SELL IT? DID I MAKE A PROFIT?`;

export const CRAFTS_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Make and sell simple handmade products such as stickers, clay charms, jewelry, cards, keychains, bookmarks, or other crafts to friends and family, at approved school/community fairs and local markets, or through age-appropriate online shops such as Etsy. Tagline: Make It. Price It. Show It. Sell It. Category: Crafts / Product Sales. Beginner · Low startup · Flexible / market weekends · Home / local markets / online · Per item · 4 - 12 hrs/week · Free Guide.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "One craft/product idea · Basic ability to make it safely and consistently · Parent/guardian approval for minors · Small supply budget and safe workspace · Simple cost tracker · Safe payment method · Appropriate packaging.",
  },
  {
    id: "before-selling",
    label: "Before selling",
    detail:
      "Calculate cost per item · Check school/fair/market rules · Verify marketplace age/account rules (including Etsy eligibility) · Use only artwork/designs/assets you own or are licensed to use · Follow applicable product-safety requirements.",
  },
  {
    id: "safety-products",
    label: "Simple low-risk crafts first",
    detail:
      "Beginners should favor simple low-risk crafts. Products for small children, skin/body use, food contact, candles, cosmetics, etc. may require extra safety/regulatory attention.",
  },
  {
    id: "minors",
    label: "Parent/guardian for minors",
    detail:
      "A parent/guardian should supervise selling accounts, payments, meetups, shipping, market participation, and any platform that requires an adult account holder.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — sell what sells",
    detail:
      "Don't fall in love with inventory. Fall in love with what sells. Make a few → show them → sell them → track them → make more of the winners.",
  },
];

export const CRAFTS_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Design product photos, price signs, and listings",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Track costs, inventory, and sales",
  },
  {
    label: "Etsy seller handbook",
    url: "https://www.etsy.com/sell",
    note: "Verify age, fees, prohibited items, and seller policies before listing",
  },
];

export const CRAFTS_SUPPLIES = {
  starterKitTotal:
    "About $10–40 — start with one product lane and supplies you already have",
  items: [
    {
      id: "paper",
      name: "Paper / cardstock / sticker paper",
      qty: "1 pack",
      estCost: "$4–12",
      notes: "If your product uses paper",
      optional: true,
    },
    {
      id: "beads",
      name: "Beads / cord / clay",
      qty: "1 kit",
      estCost: "$5–15",
      notes: "Pick the materials for YOUR one product",
      optional: true,
    },
    {
      id: "markers",
      name: "Paint / markers / glue",
      qty: "1 set",
      estCost: "$3–10",
      optional: true,
    },
    {
      id: "scissors",
      name: "Scissors / craft tools",
      qty: "1",
      estCost: "$0–8",
      notes: "Use what you already have",
    },
    {
      id: "hardware",
      name: "Keychain hardware / jewelry findings",
      qty: "1 pack",
      estCost: "$3–10",
      optional: true,
    },
    {
      id: "bags",
      name: "Bags / envelopes / labels",
      qty: "1 pack",
      estCost: "$3–10",
      notes: "Selling / packaging",
    },
    {
      id: "signs",
      name: "Price signs / display tray or bin",
      qty: "1",
      estCost: "$0–8",
      notes: "In-person markets",
      optional: true,
    },
    {
      id: "tablecloth",
      name: "Tablecloth",
      qty: "1",
      estCost: "$0–10",
      notes: "Use one you already have when possible",
      optional: true,
    },
    {
      id: "cashbox",
      name: "Supervised cash box",
      qty: "1",
      estCost: "$0–8",
      notes: "Parent/guardian for minors",
      optional: true,
    },
    {
      id: "notebook",
      name: "Order notebook",
      qty: "1",
      estCost: "$2–6",
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

export const CRAFTS_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
}[] = [
  {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Design photos, price signs, and listings",
    url: "https://www.canva.com/",
  },
  {
    id: "calculator",
    name: "Calculator",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Cost per item and profit per item",
  },
  {
    id: "sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Track costs, inventory, and sales",
    url: "https://sheets.google.com/",
  },
  {
    id: "notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Orders, ideas, and customer requests",
    url: "https://docs.google.com/",
  },
  {
    id: "etsy",
    name: "Etsy (or another approved shop)",
    freePlanAvailable: false,
    costNote: "Online listings where eligibility rules are met — verify fees and age rules",
    url: "https://www.etsy.com/sell",
  },
  {
    id: "facebook",
    name: "Facebook",
    freePlanAvailable: true,
    costNote: "Approved local/community groups — parent/guardian for minors",
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
    costNote: "Calculator + Google Sheets + Canva + One Selling Channel",
  },
];

export const CRAFTS_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "HANDMADE CRAFT STARTER EXAMPLES",
    "",
    "Keep displayed pricing: $1 – $5 / item · market weekends.",
    "",
    "Starter examples for simple low-cost crafts; some handmade items may cost more.",
    "",
    "Cost Per Item = Materials + Packaging + Per-item Fees + Other Direct Costs",
    "Estimated Profit Per Item = Selling Price − Cost Per Item",
    "",
    "Example: Materials $1.00 + Packaging $0.25 + Fees/Other $0.25 = $1.50 cost. Sell $4.00 → estimated profit $2.50.",
  ].join("\n"),
  raiseTip:
    "Know YOUR costs before setting price. Price customization separately when it adds material or time. Examples only — not income guarantees.",
  items: [
    {
      id: "sticker",
      label: "Sticker",
      price: "$1–$3",
      notes: "simple low-cost craft example",
    },
    {
      id: "bookmark",
      label: "Bookmark",
      price: "$2–$5",
    },
    {
      id: "bracelet",
      label: "Simple bracelet",
      price: "$3–$5+",
    },
    {
      id: "card",
      label: "Greeting card",
      price: "$3–$5+",
    },
    {
      id: "charm",
      label: "Small charm / keychain",
      price: "$3–$5+",
    },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only. */
export const CRAFTS_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Pick One Craft to Sell",
    desc: [
      "Choose one product you can make safely, consistently, affordably, and package easily.",
      "",
      "Examples: stickers, clay charms, jewelry, cards, keychains, bookmarks, or other crafts.",
      "",
      "My First Product: ________",
      "",
      "Do not start with a giant catalog.",
    ].join("\n"),
  },
  {
    title: "Make 3–5 Test Items & Find Your Cost",
    desc: [
      "Make a test batch. Track actual supplies used.",
      "",
      "Materials + Packaging + Direct Fees/Other = Cost Per Item.",
      "",
      "Record:",
      "☐ Materials / item: $____",
      "☐ Packaging / item: $____",
      "☐ Other direct cost: $____",
      "☐ Total cost / item: $____",
      "",
      "Check quality, durability, consistency, and time to make. Fix problems before a large batch.",
    ].join("\n"),
  },
  {
    title: "Set Your Starter Price",
    desc: [
      "Selling Price − Cost Per Item = Estimated Profit Per Item.",
      "",
      "Example: $4 sale − $1.50 cost = $2.50 estimated profit.",
      "",
      "My selling price: $____",
      "Estimated profit / item: $____",
      "",
      "Price customization separately when it adds material or time.",
      "See Suggested Pricing for $1–$5 / item starter examples.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way people hear about your crafts.",
      "",
      "Do not try every way at once. Pick ONLY 2 or 3 this month.",
      "",
      "☐ Friends / family",
      "☐ Referrals",
      "☐ Approved school fair",
      "☐ Church / community event",
      "☐ Local craft / vendor market",
      "☐ Facebook / Instagram / TikTok with appropriate supervision",
      "☐ Etsy where eligible (verify age, fees, and seller policies)",
      "☐ Approved local groups",
      "",
      "My Product: ________",
      "My Price: $____",
      "",
      "Write ONE measurable goal per selected channel.",
      "Examples: show 10 trusted people; apply to 1 market; post 3 approved product photos; list 5 items in an approved shop.",
      "",
      "For minors, a parent/guardian should help with accounts and new contacts.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "☐ 3–5 clear product photos (actual product, clean background, natural light)",
      "☐ Product name",
      "☐ Price",
      "☐ Short description",
      "☐ Order / contact method",
      "☐ Market price sign if needed",
      "",
      "SAMPLE:",
      "HANDMADE [PRODUCT]. Available in [colors/styles]. $____ each. To order: ____.",
      "",
      "For minors use parent-approved contact/payment information.",
      "",
      "Never misrepresent someone else’s work as yours. Use only artwork you own or are licensed to use.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY the 2–3 channels you selected.",
      "",
      "This week:",
      "☐ Show products to 8–12 appropriate people",
      "☐ Post approved photos",
      "☐ Ask for referrals",
      "☐ Prepare for an approved fair/market",
      "☐ List products in an approved shop (Etsy only if eligibility rules are met)",
      "",
      "Sample:",
      "“Hi! I’ve started making handmade [product]. They are $____ each and available in [styles/colors]. If you’d like one, message me at ____.”",
      "",
      "Track: Date | Channel | Product | People Reached | Orders/Sales",
      "",
      "Never publicly post a minor’s home address, school schedule, or unnecessary private information.",
    ].join("\n"),
  },
  {
    title: "Make a Small Selling Batch",
    desc: [
      "Use early interest to decide quantity — for example 5–10 instead of 50.",
      "",
      "Track: Product | Quantity | Materials Needed | Total Batch Cost.",
      "",
      "Quality-check every item:",
      "☐ Cleanliness",
      "☐ Construction",
      "☐ Correct parts / personalization",
      "☐ Packaging ready",
      "",
      "Do not sell defective items.",
    ].join("\n"),
  },
  {
    title: "Set Up Your Sales Method",
    desc: [
      "In person:",
      "☐ Display prices",
      "☐ Organize products",
      "☐ Prepare approved payments",
      "☐ Secure cash (adult supervision where appropriate)",
      "☐ Follow venue rules",
      "",
      "Online:",
      "☐ Clear photos / descriptions",
      "☐ Size / material details",
      "☐ Realistic processing time",
      "☐ Shipping / pickup method",
      "☐ Platform fees / rules (including Etsy)",
      "☐ Parent-managed adult accounts when required",
      "",
      "Never arrange unsafe private meetups.",
    ].join("\n"),
  },
  {
    title: "Sell, Package & Deliver",
    desc: [
      "Confirm:",
      "☐ Product",
      "☐ Quantity",
      "☐ Customization (confirm spelling/details BEFORE making custom work)",
      "☐ Total price",
      "☐ Payment",
      "☐ Packaging",
      "☐ Safe delivery / shipping",
      "",
      "Track: Customer/Order | Item | Qty | Revenue | Delivery | Complete.",
      "",
      "Protect customer addresses and private information.",
    ].join("\n"),
  },
  {
    title: "Track What Actually Sells",
    desc: [
      "Record:",
      "☐ Units made",
      "☐ Units sold",
      "☐ Revenue (money received)",
      "☐ Product costs",
      "☐ Selling fees",
      "☐ Other expenses",
      "☐ Estimated profit (what remains after expenses)",
      "",
      "Ask:",
      "Which product / color / style / channel sold best?",
      "What did not sell?",
      "What took too long?",
      "Which produced the best profit?",
    ].join("\n"),
  },
  {
    title: "Reinvest & Grow the Winners",
    desc: [
      "Decide how much profit to Save, Enjoy, and Reinvest.",
      "",
      "MAKE SMALL BATCH → SELL → TRACK → FIND WINNERS → REINVEST → MAKE MORE WINNERS.",
      "",
      "Possible next moves:",
      "☐ New color",
      "☐ Related product",
      "☐ Bundle",
      "☐ Another approved market",
      "☐ Better packaging",
      "☐ Bestseller restock",
    ].join("\n"),
  },
];

export function craftsToolsDisclaimer(): string {
  return [
    "Beginner stack: Calculator + Google Sheets + Canva + One Selling Channel.",
    "",
    "Verify current marketplace fees, age requirements, prohibited-item rules, and seller policies (including Etsy) before you list.",
    "",
    "For minors, a parent/guardian should supervise selling accounts, payments, meetups, shipping, and platforms that require an adult account holder.",
  ].join("\n");
}

/** Handmade craft profit math. Break-even units always round UP. */
export function computeHandmadeCraftProfit(input: {
  sellingPricePerItem: number;
  itemsSold: number;
  materialCostPerItem?: number;
  packagingCostPerItem?: number;
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
  estimatedProfitPerItem: number;
  profitMarginPercent: number;
  contributionPerItem: number;
  breakEvenUnits: number;
} {
  const price = Math.max(0, Number(input.sellingPricePerItem) || 0);
  const units = Math.max(0, Number(input.itemsSold) || 0);
  const material = Math.max(0, Number(input.materialCostPerItem) || 0);
  const packaging = Math.max(0, Number(input.packagingCostPerItem) || 0);
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
  const estimatedProfitPerItem = units > 0 ? estimatedProfit / units : 0;
  const profitMarginPercent = grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0;
  const perItemFees = units > 0 ? sellingFees / units : 0;
  const contributionPerItem = price - material - packaging - perItemFees;
  const fixedCosts = marketFee + advertising;
  const breakEvenUnits =
    contributionPerItem > 0 ? Math.ceil(fixedCosts / contributionPerItem) : 0;

  return {
    grossRevenue,
    productCost,
    totalExpenses,
    estimatedProfit,
    estimatedProfitPerItem,
    profitMarginPercent,
    contributionPerItem,
    breakEvenUnits,
  };
}
