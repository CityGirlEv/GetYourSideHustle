/**
 * Friendship Bracelet Maker (`friendship-bracelet-maker`, Guide #006).
 * Handmade bracelets for parent-approved events; gifted kindness items are $0 revenue.
 * Plain data only (no imports from guide-tools).
 */

export const FRIENDSHIP_BRACELET_REALITY_CHECK = {
  title: "SALES ARE NOT GIFTS — GIFTS ARE NOT SALES",
  body: [
    "This is a beginner handmade craft. Make bracelets you can repeat, price from true cost (materials + time + fees), and sell only where you have permission.",
    "",
    "GROSS SALES = simple + pattern + personalized + set/bundle + custom-order revenue.",
    "FREE KINDNESS / GIFT bracelets generate $0 sales revenue. Track them separately so they do not inflate totals.",
    "ESTIMATED PROFIT = Gross Sales − thread/cord − beads − packaging − display/event − payment fees − advertising − shipping you pay − other expenses.",
    "",
    "Younger makers need adult supervision for scissors, beads, payments, transportation, meetups, shipping, and online accounts.",
    "Follow school/event/vendor rules. Never assume selling is permitted.",
    "Do not share a child's home address, school schedule, or phone number publicly.",
    "Be careful with small beads around young children (choking risk).",
    "Do not claim materials are hypoallergenic, non-toxic, or waterproof unless that is verified.",
    "Confirm personalized spelling before you make custom items.",
    "Do not use copyrighted/trademarked logos, characters, or team marks unless permitted.",
    "Do not invent laws. Verify marketplace/payment age rules before use.",
    "",
    "Tagline: Knot It. Price It. Sell With Permission.",
  ].join("\n"),
};

export const FRIENDSHIP_BRACELET_NOTES_WORKSHEET = `MY FRIENDSHIP BRACELET PLAN

PRODUCT
Style: ________
Pattern: ________
Colors: ________
Size: ________
Personalization: ________
Materials: ________
Time to Make: ____

COST / PRICE
Material Cost: $____
Packaging: $____
Fees: $____
Labor Value: $____
Selling Price: $____
Estimated Profit: $____

CUSTOM ORDER
Customer: ________
Bracelet Type: ________
Colors: ________
Name / Letters: ________
Size: ________
Quantity: ____
Deadline: ________
Price: $____
Paid: $____
Delivered: ☐

INVENTORY
Made: ____
Sold: ____
Gifted / Kindness Bonus: ____
Remaining: ____
Materials to Restock: ________

EVENT / CHANNEL
Where Sold: ________
Permission Confirmed: ☐
Date: ________
Products Taken: ____
Units Sold: ____
Gross Sales: $____
Expenses: $____
Estimated Profit: $____

RESULTS
Best Seller: ________
Most Requested Color: ________
Most Requested Style: ________
Average Selling Price: $____
Hours Worked: ____
Profit Per Hour: $____

NEXT ACTION
Make More: ________
Stop / Change: ________
New Pattern to Test: ________
Next Event / Order: ________
Referral / Repeat Customer: ________
`;

export const FRIENDSHIP_BRACELET_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Weave friendship bracelets to sell at school events or gift as kindness bonuses. Free Guide. 3 - 10 hrs/week. $15 – $50 / project figures are examples only, not guarantees. Tagline: Knot It. Price It. Sell With Permission.",
  },
  {
    id: "skills",
    label: "Patterns, measuring, and pricing math",
    detail:
      "Willingness to learn simple knots, patience, safe scissors use, measuring wrist length, and simple cost/price math.",
  },
  {
    id: "adult",
    label: "Parent / guardian support",
    detail:
      "Younger sellers need adult help for payments, transportation, meetups, shipping, and online accounts.",
  },
  {
    id: "permission",
    label: "Permission to sell",
    detail:
      "Get permission before selling at schools, events, clubs, markets, or online. Adult-managed public contact info where appropriate.",
  },
];

export const FRIENDSHIP_BRACELET_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Price signs, product cards, posts — Free plan available" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Costs, inventory, orders, sales, profit" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Custom color / name orders" },
];

export const FRIENDSHIP_BRACELET_SUPPLIES = {
  starterKitTotal: "About $12–30 for a small color set, scissors, and bags — do not buy huge inventory first",
  items: [
    { id: "floss", name: "Embroidery floss / bracelet cord", qty: "1 small assortment", estCost: "$6–12", notes: "Essential — start with a few colors" },
    { id: "beads", name: "Optional beads / letter beads", qty: "1 small pack", estCost: "$5–12", notes: "Optional — choking hazard around young children", optional: true },
    { id: "scissors", name: "Scissors", qty: "1", estCost: "$3–8", notes: "Essential — adult supervision for younger makers" },
    { id: "measure", name: "Measuring tape / ruler", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "hold", name: "Tape, clipboard, safety pin, or bracelet board", qty: "1", estCost: "$2–15", notes: "Essential — hold work while you knot" },
    { id: "box", name: "Storage box / bags for thread and beads", qty: "1", estCost: "$3–8", notes: "Essential" },
    { id: "bags", name: "Small finished-product bags / cards", qty: "1 pack", estCost: "$3–6", notes: "Essential" },
    { id: "display", name: "Optional display board / tray", qty: "1", estCost: "$8–15", notes: "Optional for events", optional: true },
    { id: "tags", name: "Optional labels / price tags", qty: "1 pack", estCost: "$2–5", notes: "Optional", optional: true },
    { id: "orders", name: "Order sheet for custom colors / names", qty: "1", estCost: "$0–3", notes: "Essential for custom work" },
  ],
};

export const FRIENDSHIP_BRACELET_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "camera", name: "Smartphone camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Product photos — no home addresses, school names, or kids' faces without permission" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Price signs, product cards, or social posts — Free plan available", url: "https://www.canva.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Material costs, inventory, orders, sales, gifted count, and profit", url: "https://sheets.google.com/" },
  { id: "calc", name: "Calculator", freePlanAvailable: true, planLabelApplicable: false, costNote: "Cost per bracelet and selling price" },
  { id: "forms", name: "Simple order form (Google Forms)", freePlanAvailable: true, costNote: "Custom colors, names, size, and deadline", url: "https://forms.google.com/" },
  { id: "pay", name: "Parent-approved payment method", freePlanAvailable: true, planLabelApplicable: false, costNote: "Age-appropriate; adult-managed for younger sellers" },
  { id: "social", name: "Optional supervised social / marketplace tools", freePlanAvailable: true, costNote: "Only when permitted and age-appropriate", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Smartphone Camera + Canva + Google Sheets + Calculator + Order Form + Parent-Approved Payment" },
];

export const FRIENDSHIP_BRACELET_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "FRIENDSHIP BRACELET MAKER — PRICING EXAMPLES",
    "",
    "Displayed $15 – $50 / project is examples only, not a guarantee.",
    "",
    "Material Cost + Packaging + Selling/Payment Fees + Labor Value + Desired Profit = Suggested Selling Price.",
    "Do not price only from the cost of string. Time and selling expenses matter.",
    "FREE KINDNESS / GIFT bracelets = $0 sales revenue. Track them separately.",
    "",
    "STARTER RANGES — EXAMPLES ONLY",
    "Simple bracelet: about $3–$6",
    "Multi-color / pattern: about $5–$10",
    "Personalized / name / bead: about $6–$15+",
    "Friendship pair / set: about $8–$20+",
    "Small bundle: package price by quantity and complexity",
  ].join("\n"),
  raiseTip:
    "Raise after you know true minutes-per-bracelet and fees. Gifted bracelets are not sales. Examples only — not income guarantees.",
  items: [
    { id: "simple", label: "Simple bracelet", price: "$3–$6", notes: "Examples only" },
    { id: "pattern", label: "Multi-color / pattern bracelet", price: "$5–$10", notes: "Examples only" },
    { id: "name", label: "Personalized / name / bead", price: "$6–$15+", notes: "Confirm spelling first" },
    { id: "pair", label: "Friendship pair / set", price: "$8–$20+", notes: "Examples only" },
    { id: "bundle", label: "Small bundle", price: "Package by quantity", notes: "Examples only" },
    { id: "gift", label: "Kindness / gift bracelet", price: "$0 sales revenue", notes: "Track separately" },
  ],
};

export const FRIENDSHIP_BRACELET_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose the Bracelet Styles You Can Make Consistently",
    desc: [
      "Pick 2–3 patterns you can finish the same way every time (for example candy stripe, chevron, or a simple braid).",
      "Write what you will NOT make yet (complex patterns, huge beadwork, trademarked characters).",
    ].join("\n"),
  },
  {
    title: "Practice Patterns and Create a Small Sample Collection",
    desc: [
      "Make 4–8 samples in different colors. Photograph them in daylight.",
      "Keep one sample set for display. Do not promise styles you have not finished once.",
    ].join("\n"),
  },
  {
    title: "Calculate Material Cost, Time, Fees, and Set Prices",
    desc: [
      "Open Google Sheets from the Tools tab.",
      "For one bracelet write: thread $____ + beads $____ + packaging $____ + fees $____ + your time.",
      "Use Suggested Pricing as examples only. Gifted bracelets are $0 sales.",
    ].join("\n"),
  },
  {
    title: "Choose Colors, Sizes, Personalization, Packaging, and Orders",
    desc: [
      "Write sizes (child / youth / adult), color options, and whether you offer names/beads.",
      "Open Google Forms from the Tools tab for custom orders: colors, spelling, size, deadline.",
      "Confirm spelling before you knot a name.",
    ].join("\n"),
  },
  {
    title: "Make a Small Starter Inventory and Track Each Bracelet",
    desc: [
      "Make a small batch only. Track made | sold | gifted | remaining.",
      "Do not buy a huge floss wall before you know which colors sell.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3 parent-approved / permitted channels.",
      "",
      "☐ Family / friend referrals",
      "☐ School / community events where selling is allowed",
      "☐ Clubs / teams with permission",
      "☐ Local markets with a vendor rule check",
      "☐ Supervised social sharing",
      "",
      "Write one measurable goal per channel.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "☐ Clear product photos",
      "☐ Price sign / menu",
      "☐ Custom-order choices",
      "☐ Parent-approved contact / order method",
      "☐ Simple display plan",
      "",
      "Open Canva at https://www.canva.com/ — Free plan available — sign in at the link, or continue with an account you already have.",
      "",
      "Sample:",
      "“Handmade friendship bracelets. Simple $____ · Pattern $____ · Name $____. Custom colors welcome. Kindness gifts are free — sales are tracked separately.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week:",
      "☐ Tell warm contacts",
      "☐ Attend an approved event or take orders",
      "☐ Track which styles get attention",
      "",
      "Younger makers: a parent/guardian manages public posts and payments.",
    ].join("\n"),
  },
  {
    title: "Make and Fulfill Paid and Custom Orders Accurately",
    desc: [
      "Confirm spelling, colors, size, price, deadline, and delivery method before you start.",
      "Do not promise dates you cannot meet. Write custom-order / refund expectations.",
    ].join("\n"),
  },
  {
    title: "Deliver or Sell Safely, Collect Payment, and Record Gifts",
    desc: [
      "Collect payment with adult-managed tools when needed. Safe meetups only.",
      "Record sold vs gifted. Kindness bonuses do not count as sales revenue.",
    ].join("\n"),
  },
  {
    title: "Calculate Profit, Restock Useful Materials, and Plan the Next Batch",
    desc: [
      "Record gross sales, expenses, estimated profit, bracelets sold, bracelets gifted, hours, and profit per bracelet / hour.",
      "Identify best sellers. Restock only useful colors. Ask for a referral where appropriate.",
      "$15 – $50 / project is examples only — not a guarantee.",
    ].join("\n"),
  },
];

export function friendshipBraceletToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Smartphone Camera + Canva + Google Sheets + Calculator + Order Form + Parent-Approved Payment.",
    "",
    "Apps belong here. Floss, beads, scissors, and bags live on the Supply List.",
    "",
    "Gifted bracelets are $0 sales. Adult-managed payments and public contact for younger makers.",
  ].join("\n");
}

export function computeFriendshipBraceletProfit(input: {
  friendshipBraceletsSimple?: number;
  simplePrice?: number;
  patternCount?: number;
  patternPrice?: number;
  personalizedCount?: number;
  personalizedPrice?: number;
  setCount?: number;
  setPrice?: number;
  customOrderRevenue?: number;
  braceletsGifted?: number;
  threadCord?: number;
  beadsFindings?: number;
  packaging?: number;
  displayEvent?: number;
  paymentFees?: number;
  advertising?: number;
  shippingPostage?: number;
  otherExpenses?: number;
  laborHours?: number;
  braceletsSold?: number;
}): {
  simpleRevenue: number;
  patternRevenue: number;
  personalizedRevenue: number;
  setRevenue: number;
  customOrderRevenue: number;
  braceletsGifted: number;
  grossSales: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerBracelet: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const simpleRevenue =
    Math.max(0, Number(input.friendshipBraceletsSimple) || 0) * Math.max(0, Number(input.simplePrice) || 0);
  const patternRevenue =
    Math.max(0, Number(input.patternCount) || 0) * Math.max(0, Number(input.patternPrice) || 0);
  const personalizedRevenue =
    Math.max(0, Number(input.personalizedCount) || 0) * Math.max(0, Number(input.personalizedPrice) || 0);
  const setRevenue = Math.max(0, Number(input.setCount) || 0) * Math.max(0, Number(input.setPrice) || 0);
  const customOrderRevenue = Math.max(0, Number(input.customOrderRevenue) || 0);
  const braceletsGifted = Math.max(0, Number(input.braceletsGifted) || 0);
  const grossSales = simpleRevenue + patternRevenue + personalizedRevenue + setRevenue + customOrderRevenue;
  const totalExpenses =
    Math.max(0, Number(input.threadCord) || 0) +
    Math.max(0, Number(input.beadsFindings) || 0) +
    Math.max(0, Number(input.packaging) || 0) +
    Math.max(0, Number(input.displayEvent) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.shippingPostage) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossSales - totalExpenses;
  const sold = Math.max(0, Number(input.braceletsSold) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    simpleRevenue,
    patternRevenue,
    personalizedRevenue,
    setRevenue,
    customOrderRevenue,
    braceletsGifted,
    grossSales,
    totalExpenses,
    estimatedProfit,
    profitPerBracelet: sold > 0 ? estimatedProfit / sold : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossSales > 0 ? (estimatedProfit / grossSales) * 100 : 0,
  };
}
