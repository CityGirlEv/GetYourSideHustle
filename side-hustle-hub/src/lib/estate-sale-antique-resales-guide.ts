/**
 * Estate Sale & Antique Resales (`estate-sale-listing-helper`, Guide #066).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const ESTATE_SALE_REALITY_CHECK = {
  title: "OLD DOESN'T ALWAYS MEAN VALUABLE",
  body: "The money in resale is not simply finding old things. It is finding desirable items at the right purchase price. Research before buying, check condition, account for selling expenses, and use actual sales data whenever possible.",
};

/** Reseller Field Notebook shown above freeform Notes for this guide. */
export const ESTATE_SALE_NOTES_WORKSHEET = `Reseller Field Notebook

Starting Budget: $________
Target Profit Per Item: $________
Minimum ROI Goal: ________%

Categories I'm Learning:
1. ________________________________
2. ________________________________
3. ________________________________

Brands / Makers to Watch For:
________________________________
________________________________

Upcoming Estate Sales:
Sale: ________________  Date: ________  Location: ________________
Items Seen in Preview Photos:
________________________________

Sale: ________________  Date: ________  Location: ________________
Items Seen in Preview Photos:
________________________________

BOLO List (Be On the Lookout):
________________________________
________________________________

Items I Should Avoid:
________________________________
________________________________

Best Finds:
Item: ______________  Paid: $______  Sold: $______  Net Profit: $______
Item: ______________  Paid: $______  Sold: $______  Net Profit: $______
Item: ______________  Paid: $______  Sold: $______  Net Profit: $______

Lessons Learned:
- What sold quickly?
________________________________
- What did not sell?
________________________________
- What will I buy again?
________________________________
- What will I NOT buy again?
________________________________

OPTIONAL BEGINNER CHALLENGE — SHOP YOUR OWN HOUSE
Before spending money, find 5 unwanted items at home.
For each: Identify it → Research comparable sales → Photograph it → Price it → List it → Track offers → Sell if possible → Calculate profit.`;

export const ESTATE_SALE_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Estate sale reselling is a buy-low, sell-higher side hustle. Find vintage, antique, collectible, and desirable secondhand items at estate sales and other sources, buy them below likely resale value, then resell them online or locally for profit. Tagline: Buy Smart. Research First. Resell for Profit.",
  },
  {
    id: "requirements",
    label: "Requirements",
    detail:
      "Smartphone with internet · Transportation · Small inventory budget · Storage space · Basic photography skills · Research ability · Online selling account(s) · Expense/profit tracking method · Shipping supplies if selling online.",
  },
  {
    id: "helpful-skills",
    label: "Helpful skills",
    detail:
      "Research, negotiation, photography, listing descriptions, customer service, packing/shipping, and patience.",
  },
  {
    id: "sources",
    label: "Inventory sources",
    detail:
      "Estate sales, garage sales, thrift stores, flea markets, auctions, antique malls, Facebook Marketplace, moving sales, and items already in your home.",
  },
  {
    id: "before-buying",
    label: "Before buying, ask",
    detail:
      "What exactly is the item? Are there maker marks, labels, signatures, model numbers, or pattern names? Has it actually sold before? What did comparable items sell for? What will fees/shipping cost? Is it difficult to ship? What profit remains after expenses?",
  },
  {
    id: "warning",
    label: "Warning",
    detail:
      "Old does NOT automatically mean valuable. Listed price does NOT equal sold value. Use sold/completed sales whenever possible.",
  },
  {
    id: "beginner-challenge",
    label: "Optional beginner challenge — Shop Your Own House",
    detail:
      "Before spending money, find 5 unwanted items at home. For each: identify it, research comparable sales, photograph it, price it, list it, track offers, sell if possible, and calculate profit.",
  },
];

export const ESTATE_SALE_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "EstateSales.NET",
    url: "https://www.estatesales.net/",
    note: "Find local estate sales",
  },
  {
    label: "EstateSales.org",
    url: "https://www.estatesales.org/",
    note: "Estate sale listings",
  },
  {
    label: "eBay Sold / Completed",
    url: "https://www.ebay.com/",
    note: "Filter Sold/Completed for comps",
  },
  {
    label: "WorthPoint",
    url: "https://www.worthpoint.com/",
    note: "Historical pricing research — paid features may apply",
  },
  {
    label: "Replacements, Ltd.",
    url: "https://www.replacements.com/",
    note: "China, crystal, silverware, discontinued patterns",
  },
];

export const ESTATE_SALE_SUPPLIES = {
  starterKitTotal:
    "About $40–120 for packing, labeling, and a basic scale if you don’t already have them — start lean; skip pro photo gear and warehouse space",
  items: [
    {
      id: "phone",
      name: "Smartphone",
      qty: "1",
      estCost: "$0",
      notes: "Essential — use what you own",
    },
    {
      id: "tape-measure",
      name: "Measuring tape",
      qty: "1",
      estCost: "$3–8",
      notes: "Essential",
    },
    {
      id: "flashlight",
      name: "Flashlight",
      qty: "1",
      estCost: "$5–12",
      notes: "Essential for dim sale rooms / marks",
    },
    {
      id: "totes",
      name: "Reusable bags / totes",
      qty: "2–4",
      estCost: "$8–20",
      notes: "Essential",
    },
    {
      id: "boxes",
      name: "Boxes",
      qty: "Assorted",
      estCost: "$5–15",
      notes: "Essential for hauling + shipping",
    },
    {
      id: "bubble",
      name: "Bubble wrap / packing material",
      qty: "1 roll / pack",
      estCost: "$8–20",
      notes: "Essential",
    },
    {
      id: "tape",
      name: "Shipping tape",
      qty: "1–2 rolls",
      estCost: "$4–10",
      notes: "Essential",
    },
    {
      id: "cutter",
      name: "Scissors / box cutter",
      qty: "1",
      estCost: "$3–8",
      notes: "Essential",
    },
    {
      id: "marker",
      name: "Marker",
      qty: "1–2",
      estCost: "$2–5",
      notes: "Essential",
    },
    {
      id: "scale",
      name: "Digital shipping scale",
      qty: "1",
      estCost: "$15–35",
      notes: "Essential if selling online",
    },
    {
      id: "labels",
      name: "Inventory labels",
      qty: "1 pack",
      estCost: "$4–10",
      notes: "Essential",
    },
    {
      id: "cloths",
      name: "Cleaning cloths",
      qty: "1 pack",
      estCost: "$3–8",
      notes: "Essential — clean carefully; don’t over-restore",
    },
    {
      id: "bins",
      name: "Storage bins / shelves",
      qty: "As needed",
      estCost: "$15–40",
      notes: "Essential for inventory space",
    },
    {
      id: "magnifier",
      name: "Magnifying glass (go bag)",
      qty: "1",
      estCost: "$5–12",
      optional: true,
      notes: "Optional Reseller Go Bag",
    },
    {
      id: "powerbank",
      name: "Portable phone battery (go bag)",
      qty: "1",
      estCost: "$15–30",
      optional: true,
      notes: "Optional Reseller Go Bag",
    },
    {
      id: "gloves",
      name: "Gloves (go bag)",
      qty: "1 pair",
      estCost: "$3–8",
      optional: true,
      notes: "Optional Reseller Go Bag",
    },
    {
      id: "notebook",
      name: "Notebook (go bag)",
      qty: "1",
      estCost: "$2–6",
      optional: true,
      notes: "Optional Reseller Go Bag",
    },
  ],
};

/** Research / selling / find-sales tools — Tools tab (not Supply List purchases). */
export const ESTATE_SALE_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  alternatives?: string;
  optional?: boolean;
}[] = [
  {
    id: "es_google_lens",
    name: "Google Lens",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Identify unfamiliar items from photos",
    url: "https://lens.google.com/",
  },
  {
    id: "es_ebay_sold",
    name: "eBay Sold / Completed Listings",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Research what comparable items actually sold for — not list prices",
    url: "https://www.ebay.com/",
  },
  {
    id: "es_worthpoint",
    name: "WorthPoint",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Historical antique/collectible pricing research · paid features may apply",
    url: "https://www.worthpoint.com/",
    optional: true,
  },
  {
    id: "es_replacements",
    name: "Replacements, Ltd.",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Useful for china, crystal, silverware, and discontinued patterns",
    url: "https://www.replacements.com/",
    optional: true,
  },
  {
    id: "es_google",
    name: "Google Search",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Research maker marks, signatures, labels, model numbers, patterns, and brands",
    url: "https://www.google.com/",
  },
  {
    id: "es_ebay",
    name: "eBay",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Research and selling platform",
    url: "https://www.ebay.com/",
  },
  {
    id: "es_etsy",
    name: "Etsy",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Selling platform for vintage / antiques / collectibles",
    url: "https://www.etsy.com/",
  },
  {
    id: "es_fb_marketplace",
    name: "Facebook Marketplace",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Local selling + find moving sales and inventory",
    url: "https://www.facebook.com/marketplace",
  },
  {
    id: "es_chairish",
    name: "Chairish",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Furniture / décor resale marketplace",
    url: "https://www.chairish.com/",
    optional: true,
  },
  {
    id: "es_ruby_lane",
    name: "Ruby Lane",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Antiques and collectibles marketplace",
    url: "https://www.rubylane.com/",
    optional: true,
  },
  {
    id: "es_estatesales_net",
    name: "EstateSales.NET",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Find estate sales near you",
    url: "https://www.estatesales.net/",
  },
  {
    id: "es_estatesales_org",
    name: "EstateSales.org",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Find estate sales · also check local Facebook groups",
    url: "https://www.estatesales.org/",
  },
  {
    id: "es_camera",
    name: "Smartphone camera",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "List photos — all sides, marks, measurements, flaws",
  },
  {
    id: "es_bg_remove",
    name: "Background removal tools",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Clean listing photos · use phone editor or web tools",
    optional: true,
  },
  {
    id: "es_usps",
    name: "USPS postage calculator",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Estimate shipping before you buy fragile / heavy items",
    url: "https://postcalc.usps.com/",
  },
  {
    id: "es_ups",
    name: "UPS shipping calculator",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Compare shipping options",
    url: "https://www.ups.com/us/en/shipping/calculate-time-cost.page",
    optional: true,
  },
  {
    id: "es_fedex",
    name: "FedEx shipping calculator",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Compare shipping options",
    url: "https://www.fedex.com/en-us/shipping/rate-quote.html",
    optional: true,
  },
  {
    id: "es_tracking",
    name: "Profit & inventory tracker",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote:
      "Use GYSH Revenue Calculator, a spreadsheet, bookkeeping software, or inventory app · track purchase price, selling price, fees, shipping, packaging, repair/cleaning, other expenses, net profit, purchase date, source, inventory number, date listed, marketplace, date sold",
  },
];

export const ESTATE_SALE_PRICING = {
  tabLabel: "Pricing for Profit",
  intro: [
    "Formula: Expected Sale Price − Purchase Price − Selling Fees − Shipping/Packaging − Cleaning/Repair − Other Expenses = Estimated Profit.",
    "",
    "Maximum Buy Price: Expected Sale Price − Estimated Fees/Expenses − Desired Profit = Maximum Buy Price.",
    "",
    "Example: Expected Sale Price $100 · Fees/Expenses $25 · Desired Profit $40 → Maximum Buy Price $35.",
    "",
    "Suggested beginner test budget: $50–$150.",
    "",
    "Negotiation examples: “Is there any flexibility on this price?” · “If I buy these three pieces, what could you do for the group?”",
    "",
    "Key rule: Do not confuse LISTED FOR with SOLD FOR.",
  ].join("\n"),
  raiseTip:
    "Raise your personal profit floor after 10–20 logged sales — not by guessing from asking prices. Examples only — not income guarantees.",
  items: [
    {
      id: "max-buy",
      label: "Maximum buy price",
      price: "Expected sale − fees/expenses − desired profit",
      notes: "Never pay more than this after research",
    },
    {
      id: "beginner-budget",
      label: "Beginner test budget",
      price: "$50–$150",
      notes: "Learn categories before scaling inventory",
    },
    {
      id: "example",
      label: "Worked example (planning only)",
      price: "$100 expected · $25 fees · $40 desired profit → $35 max buy",
      notes: "Use sold comps, not list prices",
    },
  ],
};

/** Core launch steps (foundation + marketing titles + closing are applied by finalize). */
export const ESTATE_SALE_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose 1–3 categories to learn",
    desc: "Pick a narrow focus so research gets faster. Examples: pottery, glassware, lamps, jewelry, small furniture, art, china, collectibles, vintage clothing. Write your three categories in Notes.",
  },
  {
    title: "Set a starting inventory budget",
    desc: "Decide how much cash you can risk learning (suggested beginner test: $50–$150). Track every purchase against this budget in the Revenue Calculator and Notes.",
  },
  {
    title: "Find estate sales and other sources",
    desc: "Use estate sale sites (EstateSales.NET, EstateSales.org), Facebook Marketplace, local groups, classifieds, auctions, garage sales, and moving sales. Add promising dates to your Reseller Field Notebook.",
  },
  {
    title: "Review sale photos and create a Look For list",
    desc: "Before you go, study preview photos. Build a BOLO (Be On the Lookout) list for your categories, makers, and shapes — and note what to skip.",
  },
  {
    title: "Inspect items carefully on site",
    desc: "Check maker marks, signatures, labels, model numbers, damage, repairs, chips, stains, odors, missing pieces, and working condition. Photograph marks with your phone before you decide.",
  },
  {
    title: "Research before buying",
    desc: "Search Brand + Item + Model/Pattern + Material + Approximate Age. Use Google Lens and eBay Sold/Completed (and WorthPoint or Replacements when helpful). Confirm actual sold prices — not list prices.",
  },
  {
    title: "Calculate potential profit before purchasing",
    desc: "Run Expected Sale − Fees − Shipping − Packaging − Cleaning − Other − Desired Profit to get Maximum Buy Price. Use the Revenue Calculator (Resale Profit mode). If the ask is above your max, negotiate or walk away.",
  },
  {
    title: "Buy and record immediately",
    desc: "When you buy, log item, cost, date, source, and inventory number the same day. Stick a label on the item or box so nothing goes missing in storage.",
  },
  {
    title: "Clean carefully and photograph for listing",
    desc: "Clean gently. Photograph all sides, marks, measurements, flaws, and unique details. Do NOT automatically refinish or restore antiques — over-cleaning or refinishing can destroy value.",
  },
  {
    title: "List on the best marketplace",
    desc: "Choose eBay, Etsy, Facebook Marketplace, Chairish, Ruby Lane, or local pickup based on the item. Write a searchable title, accurate description, condition notes, dimensions, strong photos, and clear shipping/pickup terms.",
  },
  {
    title: "Log the sale and review your buy decision",
    desc: "After it sells, record sale price, fees, shipping, packaging, and actual net profit. Ask: “Would I buy this type of item again?” Update Lessons Learned in Notes.",
  },
  {
    title: "Pick how you will tell people about your side hustle",
    desc: "Your “storefront” is marketplace listings and local pickup posts — not cold-calling neighbors. Pick 2–3 channels this month (e.g. eBay + Facebook Marketplace + one specialty site) and stick to them while you learn categories.",
  },
  {
    title: "Make your marketing materials",
    desc: "Build a repeatable listing kit: phone photo setup, Canva title/description templates if helpful, packing checklist, and a BOLO list you update after each sale. No flyer required — strong photos and sold-comp pricing are the marketing.",
  },
  {
    title: "Carry out the marketing plan",
    desc: "List consistently, refresh stale listings, answer buyer questions same day, and review weekly: what sold, what sat, and which categories to keep buying. Use the Revenue Calculator after every sale so you raise your buy discipline — not your guesswork.",
  },
];

export function estateSaleToolsDisclaimer(): string {
  return [
    "Tools for Researching, Pricing & Selling — use sold/completed data, not asking prices.",
    "",
    "BEGINNER TOOL STACK",
    "1. Google Lens — What is it?",
    "2. eBay Sold Listings — What has it actually sold for?",
    "3. EstateSales.NET — Where can I find inventory?",
    "4. Smartphone Camera — How will I list it?",
    "5. GYSH Revenue Calculator — Will I actually make money?",
    "",
    "DO NOT CONFUSE “LISTED FOR” WITH “SOLD FOR.”",
    "Do not overspend on professional photography equipment, warehouse space, large inventory, or expensive appraisal gear.",
  ].join("\n");
}
