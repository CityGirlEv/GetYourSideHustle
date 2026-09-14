/**
 * Beach Shell Jewelry (`beach-shell-jewelry`, Guide #003).
 * Collect (where allowed) or buy craft shells; make simple jewelry; sell locally or online.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const BEACH_SHELL_JEWELRY_REALITY_CHECK = {
  title: "COLLECT RESPONSIBLY — THE SHELL IS NOT FREE PROFIT",
  body: [
    "Collect shells only where collection is allowed. Respect beach, park, protected-area, wildlife, and local rules.",
    "Do not collect live animals or occupied shells. Avoid protected species and restricted materials.",
    "Verify current local rules — collection restrictions vary. When unsure, leave it or buy legally sold craft shells.",
    "",
    "Do not price a piece only because the shell was free. Time, findings, collection effort, jewelry components, packaging, selling costs, and labor still matter.",
    "Revenue is not profit. Track both.",
    "",
    "Wash and sanitize materials appropriately. Use eye protection and adult supervision when drilling or cutting.",
    "Use adhesives and tools according to the instructions.",
    "Younger sellers need adult supervision for sharp tools, drilling, adhesives, online selling, payments, meetups, and shipping.",
    "Protect personal information. Use safe meetup and delivery practices.",
    "Follow current marketplace and platform age and selling rules. Do not invent laws.",
    "",
    "Tagline: Find It. Clean It. Create It. Sell It.",
  ].join("\n"),
};

/** Beach shell jewelry planner shown above freeform Notes for this guide. */
export const BEACH_SHELL_JEWELRY_NOTES_WORKSHEET = `MY BEACH SHELL JEWELRY PLAN

DESIGN
Piece Name: ________
Type: ________
Shell Type: ________
Materials: ________
Time to Make: ________

COST
Shell/Material Cost: $____
Jewelry Findings: $____
Packaging: $____
Selling Fees: $____
Other Cost: $____
Total Cost: $____

PRICING
Selling Price: $____
Estimated Profit: $____
Profit Margin: ____%

INVENTORY
Quantity Made: ____
Quantity Sold: ____
Quantity Remaining: ____

SALE
Date: ________
Channel: ________
Customer/Order: ________
Selling Price: $____
Delivery/Shipping: ________

RESULTS
Gross Revenue: $____
Expenses: $____
Profit: $____
Hours Worked: ____
Profit Per Hour: $____
Best Seller: ________

NEXT BATCH
What Sold Best: ________
What to Make Again: ________
What to Change: ________

Collection Allowed/Verified: ☐ Yes ☐ Purchased Shells
Marketing Channel 1: ________
Marketing Channel 2: ________
Marketing Channel 3: ________

GYSH PRO TIP
THE SHELL IS ALREADY INTERESTING — DON'T OVERDESIGN IT.
A clean, simple piece can show off the shell's natural shape and color.
Do not price a piece based only on a free shell.
SOURCE RESPONSIBLY → MAKE IT WELL → PRICE FOR PROFIT → TELL THE STORY → TRACK WHAT SELLS.

BEGINNER CHALLENGE
Create your FIRST 5-PIECE MINI COLLECTION.
1. Legally source or purchase suitable shells.
2. Make 5 pieces of ONE jewelry type.
3. Calculate cost per piece, including labor value.
4. Set your price.
5. Take clear photos.
6. Show or list through 2–3 selected channels.
7. Track every sale, expense, and profit.
Goal: prove you can SOURCE IT → MAKE IT → PRICE IT → SELL IT → PROFIT.
`;

export const BEACH_SHELL_JEWELRY_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Collect shells at the beach (where allowed) and turn them into earrings, bracelets, and necklaces to sell. Tagline: Find It. Clean It. Create It. Sell It. Category: Crafts / Jewelry / Product Sales. Beginner handmade product / craft sales · Low startup · 3 - 10 hrs/week · $8 – $35 / piece (examples only). For younger makers, a parent/guardian supervises collecting, tools, online selling, payments, meetups, and shipping.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Legal or purchased shell source · Parent/guardian approval for minors · Safe workspace · Basic jewelry-making supplies · Small startup budget · Cost tracker · Packaging · Age-appropriate selling and payment method.",
  },
  {
    id: "before-making",
    label: "Before making",
    detail:
      "Check local collection rules · Use empty, legally collected or legally purchased shells · Clean and dry shells · Discard sharp, cracked, contaminated, or unsafe pieces · Learn safe use of pliers, drills, adhesives, and cutters · Use eye protection for drilling/cutting · Follow product safety guidance · Clearly describe materials to buyers.",
  },
  {
    id: "collect-responsibly",
    label: "Collect responsibly",
    detail:
      "Collect only where allowed. Respect beach, park, protected-area, wildlife, and local rules. Do not take live animals or occupied shells. Avoid protected species. Verify current local rules because restrictions vary. A great alternative is legally purchased craft shells.",
  },
  {
    id: "minors",
    label: "Parent/guardian for younger makers",
    detail:
      "Adult supervision for sharp tools, drilling, adhesives, online selling, payments, meetups, and shipping. Protect personal information. Follow current marketplace age and selling rules.",
  },
  {
    id: "revenue-vs-profit",
    label: "Revenue is not profit",
    detail:
      "Do not price a piece based only on a free shell. Material cost + packaging + selling/platform fees + labor value + desired profit = suggested selling price.",
  },
];

export const BEACH_SHELL_JEWELRY_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Product cards, tags, and social graphics" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Inventory, costs, sales, and profit" },
  {
    label: "Etsy seller handbook",
    url: "https://www.etsy.com/sell",
    note: "Verify fees, seller eligibility, age requirements, and prohibited-item policies",
  },
];

export const BEACH_SHELL_JEWELRY_SUPPLIES = {
  starterKitTotal:
    "About $15–40 for a first jewelry kit — start small; do not buy expensive equipment before you know what sells",
  items: [
    {
      id: "shells",
      name: "Legally collected or purchased shells",
      qty: "1 small batch",
      estCost: "$0–15",
      notes: "Essential — empty shells where collection is allowed, or craft shells from a legitimate supplier",
    },
    {
      id: "cord",
      name: "Jewelry cord / wire",
      qty: "1–2 spools",
      estCost: "$5–12",
      notes: "Essential",
    },
    {
      id: "hooks",
      name: "Earring hooks",
      qty: "1 pack",
      estCost: "$4–8",
      notes: "Essential for earrings",
    },
    {
      id: "jumps",
      name: "Jump rings",
      qty: "1 pack (50+)",
      estCost: "$3–6",
      notes: "Essential",
    },
    {
      id: "clasps",
      name: "Clasps",
      qty: "1 pack",
      estCost: "$4–8",
      notes: "Essential",
    },
    {
      id: "findings",
      name: "Bracelet / necklace findings",
      qty: "1 pack",
      estCost: "$4–10",
      notes: "Essential — ends, extenders, and connectors",
    },
    {
      id: "pliers",
      name: "Jewelry pliers",
      qty: "1 pair",
      estCost: "$8–15",
      notes: "Essential — adult supervision for younger makers",
    },
    {
      id: "adhesive",
      name: "Craft adhesive suitable for jewelry",
      qty: "1",
      estCost: "$3–8",
      notes: "Essential when a design needs glue — follow the label; adult supervision for minors",
    },
    {
      id: "measuring",
      name: "Measuring tool (ruler or tape)",
      qty: "1",
      estCost: "$0–5",
      notes: "Essential — necklace and bracelet lengths",
    },
    {
      id: "containers",
      name: "Small storage containers",
      qty: "2–4",
      estCost: "$2–8",
      notes: "Essential — keep findings sorted",
    },
    {
      id: "cleaning",
      name: "Cleaning supplies for shells",
      qty: "1 set",
      estCost: "$2–8",
      notes: "Essential — brush, fresh water, and a drying tray",
    },
    {
      id: "cards",
      name: "Display cards",
      qty: "1 pack",
      estCost: "$4–10",
      notes: "Essential — earring and necklace cards",
    },
    {
      id: "bags",
      name: "Small bags / boxes",
      qty: "1 pack",
      estCost: "$4–12",
      notes: "Essential — protect finished pieces",
    },
    {
      id: "drill",
      name: "Small hand drill or shell-drilling tool",
      qty: "1",
      estCost: "$10–25",
      notes: "Optional — only when the design needs a hole; eye protection and adult supervision",
      optional: true,
    },
    {
      id: "eye-protection",
      name: "Eye protection",
      qty: "1",
      estCost: "$3–10",
      notes: "Optional — required if you drill or cut",
      optional: true,
    },
    {
      id: "mailers",
      name: "Shipping materials",
      qty: "1 pack",
      estCost: "$4–12",
      notes: "Optional — only if you sell online and ship",
      optional: true,
    },
    {
      id: "beads",
      name: "Beads / extra accents",
      qty: "1 pack",
      estCost: "$3–10",
      notes: "Nice to have",
      optional: true,
    },
    {
      id: "stands",
      name: "Small display stands",
      qty: "1–2",
      estCost: "$5–15",
      notes: "Nice to have for markets",
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
    id: "camera",
    name: "Smartphone camera",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Daylight product photos — show size, color, and findings clearly",
  },
  {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Simple product cards, price tags, and social graphics",
    url: "https://www.canva.com/",
  },
  {
    id: "sheets",
    name: "Google Sheets / Excel",
    freePlanAvailable: true,
    costNote: "Inventory, material cost, sales, fees, and real profit",
    url: "https://sheets.google.com/",
  },
  {
    id: "calculator",
    name: "Calculator",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Pricing formula: materials + packaging + fees + labor + desired profit",
  },
  {
    id: "photo-edit",
    name: "Simple photo-editing tool",
    freePlanAvailable: true,
    costNote: "Crop and brighten — do not hide defects or misrepresent the shell",
    url: "https://www.canva.com/",
  },
  {
    id: "facebook",
    name: "Facebook / Instagram",
    freePlanAvailable: true,
    costNote: "Local posts and product photos — age-appropriate or adult-managed accounts only",
    url: "https://www.facebook.com/",
    optional: true,
  },
  {
    id: "payments",
    name: "Payment tools",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Cash, parent-managed apps, or marketplace checkout — never put a child’s personal payment handle on a public listing",
    optional: true,
  },
  {
    id: "etsy",
    name: "Online marketplace tools where permitted",
    freePlanAvailable: false,
    costNote: "Etsy or similar — verify current fees, age rules, and prohibited materials before listing",
    url: "https://www.etsy.com/sell",
    optional: true,
  },
  {
    id: "beginner-stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Smartphone Camera + Calculator + Google Sheets + Canva + One Selling Channel",
  },
];

export const BEACH_SHELL_JEWELRY_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "BEACH SHELL JEWELRY PRICING EXAMPLES",
    "",
    "Displayed earning potential: $8 – $35 / piece (examples only).",
    "",
    "These are examples only, not guarantees. Revenue is not profit.",
    "",
    "Do not price a piece based only on the fact that the shell itself was free.",
    "Time, findings, collection effort, jewelry components, packaging, selling costs, and labor still matter.",
    "",
    "PRICING FORMULA",
    "Material Cost",
    "+ Packaging Cost",
    "+ Selling / Platform Fees",
    "+ Labor Value",
    "+ Desired Profit",
    "= Suggested Selling Price",
    "",
    "STARTER RANGES — EXAMPLES ONLY",
    "Simple shell earrings: approximately $8–$18",
    "Simple bracelets: approximately $10–$22",
    "Necklaces: approximately $15–$35+",
    "Coordinated sets: approximately $20–$50+",
    "Customized / premium pieces: price from materials, labor, complexity, packaging, and selling costs",
    "",
    "EXAMPLE",
    "Findings / materials $3.00",
    "Packaging $1.00",
    "Selling fees $1.00",
    "Labor value $6.00",
    "Desired profit $5.00",
    "Suggested selling price $16.00",
    "",
    "If the market will only support a price below your real costs, change the design or do not sell that piece yet.",
  ].join("\n"),
  raiseTip:
    "Charge more for designs that take more materials, time, or customization. Know YOUR costs first. Displayed $8 – $35 / piece is examples only — not income guarantees.",
  items: [
    { id: "earrings", label: "Simple shell earrings", price: "$8–$18", notes: "Examples only — calculate materials, fees, labor, and profit" },
    { id: "bracelet", label: "Simple bracelets", price: "$10–$22", notes: "Examples only" },
    { id: "necklace", label: "Necklaces", price: "$15–$35+", notes: "Examples only" },
    { id: "set", label: "Coordinated sets", price: "$20–$50+", notes: "Examples only" },
    { id: "custom", label: "Customized / premium pieces", price: "Cost + labor + profit", notes: "Price from materials, labor, complexity, packaging, and selling costs" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ only. */
export const BEACH_SHELL_JEWELRY_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your Jewelry Styles",
    desc: [
      "Pick 1–2 styles you can make safely and consistently for a first batch.",
      "",
      "Options:",
      "☐ Simple shell earrings",
      "☐ Simple bracelets",
      "☐ Necklaces",
      "☐ Coordinated set (later)",
      "",
      "Write:",
      "First product: ________",
      "Who it is for: ________",
      "Price range I will test: $____",
      "",
      "Do not start with 20 different designs.",
    ].join("\n"),
  },
  {
    title: "Collect or Purchase Shells Legally",
    desc: [
      "Collect shells only where collection is allowed.",
      "Respect beach, park, protected-area, wildlife, and local rules.",
      "Do not collect live animals or occupied shells.",
      "Avoid protected species and restricted materials.",
      "Verify current local rules because restrictions vary. Do not invent laws.",
      "",
      "For younger makers, collect with a parent/guardian.",
      "A great alternative is legally purchased craft shells.",
      "Record the source of every shell batch.",
    ].join("\n"),
  },
  {
    title: "Clean and Prepare the Shells",
    desc: [
      "Wash and sanitize materials appropriately for the shell type.",
      "Dry completely so findings do not rust and pieces do not smell.",
      "Sort by size, shape, color, and possible use (earrings vs bracelets vs necklaces).",
      "Discard sharp, cracked, contaminated, or unsafe pieces.",
      "If a design needs a hole, use a small drill only with eye protection and adult supervision.",
    ].join("\n"),
  },
  {
    title: "Practice Safe Assembly and Make a Starter Collection",
    desc: [
      "Practice with pliers, jump rings, hooks, cord/wire, and clasps before you sell.",
      "Use adhesives and tools according to the instructions.",
      "Younger makers: adult supervision for sharp tools, drilling, and glue.",
      "",
      "Make a small starter collection — about 5 pieces of one style, or a tiny mix of earrings, a bracelet, and a necklace.",
      "Check durability, comfort, closures, sharp edges, and finish before anyone buys.",
    ].join("\n"),
  },
  {
    title: "Calculate Costs and Set Your Prices",
    desc: [
      "Do not price a piece based only on a free shell.",
      "",
      "Suggested selling price =",
      "Material Cost + Packaging Cost + Selling/Platform Fees + Labor Value + Desired Profit.",
      "",
      "Write for each design:",
      "Total cost: $____",
      "Labor value: $____",
      "Desired profit: $____",
      "Selling price: $____",
      "Estimated profit: $____",
      "",
      "Revenue is money collected. Profit is what remains after expenses.",
      "If the market will not cover real costs, change the design.",
      "",
      "Open Google Sheets from the Tools tab (sign in with Google, or use an account you already have) and record the numbers.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way people hear about your jewelry. Pick only 2 or 3 at first.",
      "",
      "Beginner options:",
      "☐ Family / friends",
      "☐ Local craft fairs",
      "☐ Community events",
      "☐ Social media with adult supervision",
      "☐ Local boutiques / consignment where appropriate",
      "☐ Online marketplaces where age and platform rules permit",
      "",
      "Write ONE measurable goal per channel.",
      "Examples:",
      "- Show 10 trusted people this week.",
      "- Apply to 1 craft fair or community table.",
      "- Post 3 product photos with a parent-managed account.",
      "",
      "Protect personal information. Follow current marketplace age rules.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Photograph every piece in daylight on a plain background.",
      "Show size, color, findings, and any natural variation.",
      "",
      "Create:",
      "☐ 3–6 clear jewelry photos",
      "☐ Product name and price",
      "☐ Materials description",
      "☐ Short story / description",
      "☐ Order / contact method (parent contact for minors)",
      "☐ Display card or market sign",
      "",
      "Sample:",
      "“Handmade beach shell jewelry. [Product] $____. Shells are unique, so color and shape may vary. Collected or purchased only where allowed.”",
      "",
      "Open Canva from the Tools tab (sign in with Google, or use an account you already have) for cards and graphics.",
      "Do not hide defects. Do not claim hypoallergenic or protected-species status unless you know it is accurate.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY the 2–3 channels selected.",
      "",
      "This week:",
      "☐ Show pieces to trusted people",
      "☐ Post approved photos if using social",
      "☐ Prepare a small display for a fair or community table",
      "☐ List pieces only where age and platform rules allow",
      "",
      "Sample:",
      "“I make handmade beach shell earrings, bracelets, and necklaces. Pieces start at $____. Here are a few designs ready now.”",
      "",
      "Track Date | Channel | Product | People reached | Orders / sales.",
      "Never put a child’s personal cell or payment handle on a public listing.",
    ].join("\n"),
  },
  {
    title: "Sell and Handle Orders",
    desc: [
      "For every order confirm:",
      "☐ Item and quantity",
      "☐ Size / length if needed",
      "☐ Total price",
      "☐ Payment received",
      "☐ Pickup, meetup, or ship",
      "",
      "Use safe meetup and delivery practices. Public places. Parent present for younger sellers.",
      "Accurately describe natural shell variation and materials.",
      "Follow current marketplace and platform rules. Do not invent laws.",
    ].join("\n"),
  },
  {
    title: "Package and Deliver Pieces",
    desc: [
      "Package to protect delicate shells: card, small bag or box, and a simple care note.",
      "Include the price paid and your shop or first-name brand if you use one.",
      "",
      "If you ship:",
      "☐ Adult-managed shipping account",
      "☐ Padding so shells do not crack",
      "☐ Correct address",
      "☐ Tracking when the platform requires it",
      "",
      "Do not share extra personal information in the package.",
    ].join("\n"),
  },
  {
    title: "Track Revenue, Profit, and Best Sellers",
    desc: [
      "Record:",
      "☐ Gross revenue (money collected)",
      "☐ Jewelry findings / materials",
      "☐ Packaging",
      "☐ Selling / platform fees",
      "☐ Shipping paid by seller",
      "☐ Advertising",
      "☐ Booth / event fees",
      "☐ Other expenses",
      "☐ Estimated profit",
      "☐ Pieces sold",
      "☐ Hours worked",
      "☐ Profit per piece and profit per hour",
      "",
      "Ask:",
      "What sold best?",
      "What should I make again?",
      "What should I change?",
      "",
      "Revenue is not profit. Grow from actual demand.",
    ].join("\n"),
  },
];

export function beachShellJewelryToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Smartphone Camera + Calculator + Google Sheets + Canva + One Selling Channel.",
    "",
    "Apps belong here. Physical jewelry findings, pliers, shells, and packaging live on the Supply List.",
    "",
    "For younger makers, a parent/guardian manages accounts, payments, shipping, and meetups. Verify current marketplace fees, age rules, and prohibited-item policies.",
  ].join("\n");
}

/** Handmade jewelry profit math. Revenue is not profit. */
export function computeBeachShellJewelryProfit(input: {
  earringPairs?: number;
  earringPrice?: number;
  braceletsSold?: number;
  braceletPrice?: number;
  necklacesSold?: number;
  necklacePrice?: number;
  setsSold?: number;
  setPrice?: number;
  findingsMaterials?: number;
  packaging?: number;
  sellingFees?: number;
  shippingPaidBySeller?: number;
  advertising?: number;
  boothFees?: number;
  otherExpenses?: number;
  laborHours?: number;
}): {
  earringRevenue: number;
  braceletRevenue: number;
  necklaceRevenue: number;
  setRevenue: number;
  grossRevenue: number;
  totalPieces: number;
  totalExpenses: number;
  estimatedProfit: number;
  estimatedProfitPerPiece: number | null;
  profitMarginPercent: number;
  averageSellingPrice: number | null;
  profitPerHour: number | null;
} {
  const earringPairs = Math.max(0, Number(input.earringPairs) || 0);
  const braceletsSold = Math.max(0, Number(input.braceletsSold) || 0);
  const necklacesSold = Math.max(0, Number(input.necklacesSold) || 0);
  const setsSold = Math.max(0, Number(input.setsSold) || 0);
  const earringRevenue = earringPairs * Math.max(0, Number(input.earringPrice) || 0);
  const braceletRevenue = braceletsSold * Math.max(0, Number(input.braceletPrice) || 0);
  const necklaceRevenue = necklacesSold * Math.max(0, Number(input.necklacePrice) || 0);
  const setRevenue = setsSold * Math.max(0, Number(input.setPrice) || 0);
  const grossRevenue = earringRevenue + braceletRevenue + necklaceRevenue + setRevenue;
  const totalPieces = earringPairs + braceletsSold + necklacesSold + setsSold;
  const totalExpenses =
    Math.max(0, Number(input.findingsMaterials) || 0) +
    Math.max(0, Number(input.packaging) || 0) +
    Math.max(0, Number(input.sellingFees) || 0) +
    Math.max(0, Number(input.shippingPaidBySeller) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.boothFees) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossRevenue - totalExpenses;
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    earringRevenue,
    braceletRevenue,
    necklaceRevenue,
    setRevenue,
    grossRevenue,
    totalPieces,
    totalExpenses,
    estimatedProfit,
    estimatedProfitPerPiece: totalPieces > 0 ? estimatedProfit / totalPieces : null,
    profitMarginPercent: grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0,
    averageSellingPrice: totalPieces > 0 ? grossRevenue / totalPieces : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
  };
}
