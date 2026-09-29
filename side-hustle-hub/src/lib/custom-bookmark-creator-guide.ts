/**
 * Custom Bookmark Creator (`custom-bookmark-creator`, Guide #056).
 * Starter Membership. 3 - 10 hrs/week. Displayed $15 – $50 / project (examples).
 * Plain data only — no imports from guide-tools.
 */

export const CUSTOM_BOOKMARK_CREATOR_REALITY_CHECK = {
  title: "CUSTOM DOES NOT MEAN “COPY ANYTHING”",
  body: [
    "Design and make original cardstock or laminated bookmarks with art, patterns, names, or short original messages; sell them individually, in themed sets, at parent-approved fairs, or through a parent-managed online account.",
    "",
    "Customers may request copyrighted characters, logos, book-cover art, sports marks, celebrity images, or song lyrics. Do not copy or sell protected material without permission or a valid license.",
    "",
    "Offer safe customization instead: name; initials; favorite colors; original short message; school colors without protected logos; original floral, abstract, animal, reading, or seasonal art.",
    "",
    "For anyone under 18, a parent/guardian should approve supplies, tools, fairs, accounts, listings, messages, payments, shipping, pickup, refunds, and public posts.",
    "",
    "Adult should manage laminators, heat tools, paper cutters, craft knives, hole punches, or other tools based on the maker’s age and ability. Round sharp corners. Trim loose laminate. Secure tassels/ribbons. Keep beads and small parts away from young children. Do not market bookmarks as toys for young children.",
    "",
    "Etsy currently requires account owners to be at least 18. Minors ages 13–17 may use a parent/guardian-owned account only with permission and direct supervision; children under 13 may not use Etsy. Verify current policy: https://www.etsy.com/legal/minors/",
    "",
    "Tagline: Original Designs. Neat Finishes. Book-Loving Gifts.",
  ].join("\n"),
};

export const CUSTOM_BOOKMARK_CREATOR_NOTES_WORKSHEET = `CUSTOM BOOKMARK CREATOR NOTES

PARENT APPROVAL
Parent/Guardian: ________
Safe Tools: ________
Adult-Only Tools: ________
Approved Sales Channels: ________
Payment Account Owner: ________

PRODUCT
Customer Type: ________
Theme: ________
Standard Size: ________
Finish: ________
Materials: ________
Safety/Care Note: ________

PRICING
Batch Cost: $____
Sellable Quantity: ____
Cost per Bookmark: $____
Single Price: $____
Set Price: $____
Personalization: $____
Bulk Price: $____

CUSTOM ORDER
Customer: ________
Design: ________
Exact Name/Message: ________
Colors: ________
Quantity: ____
Deadline: ________
Proof Approved: ☐
Price Paid: $____

INVENTORY/SALES
Made: ____
Rejected: ____
Sold: ____
Unsold: ____
Revenue: $____
Expenses: $____
Profit: $____

GYSH PRO TIP
Small personalized products succeed when the spelling, finish, and deadline are right every time.

ORIGINAL IDEA → THREE SAMPLES → COST → SMALL BATCH → CLEAR ORDER → QUALITY CHECK → RESTOCK WINNERS.

STARTER MEMBERSHIP CHALLENGE
Launch your first bookmark collection:
1. Choose one customer/theme.
2. Set safety and copyright rules.
3. Make three original samples.
4. Test them in real books.
5. Calculate cost per bookmark.
6. Set single, set, and custom prices.
7. Create an order form.
8. Make 10–20 sellable bookmarks.
9. Use 2–3 approved marketing channels.
10. Track sales, defects, inventory, and profit.`;

export const CUSTOM_BOOKMARK_CREATOR_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Design and make original cardstock or laminated bookmarks with art, patterns, names, or short original messages. Category: Creative Products / Paper Crafts. Best for Kids and Teens who enjoy art, lettering, design, and small-batch making with parent/guardian supervision. Beginner · Low startup · Flexible / Batch-Friendly / Fair and Gift Seasons · Home Craft Space / School or Community Fairs / Parent-Managed Online Shop · Per Bookmark / Sets / Personalization / Bulk Orders · 3 - 10 hrs/week. Displayed $15 – $50 / project is examples only. Tagline: Original Designs. Neat Finishes. Book-Loving Gifts.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Parent/guardian involvement if under 18 · Safe craft workspace · One bookmark size/template · Original design theme · Three finished samples · Cost and price worksheet · Parent-approved sales channel · Packaging · Order form · Payment method managed by adult where required · Income/expense tracking.",
  },
  {
    id: "before-selling",
    label: "Before selling check",
    detail:
      "School/fair/vendor rules · Local business-license and sales-tax requirements · Platform age/account requirements · Copyright and trademark use · Product materials and care instructions · Shipping/pickup/refund terms.",
  },
  {
    id: "parent",
    label: "Parent / guardian for minors",
    detail:
      "Adult should manage laminators, heat tools, paper cutters, craft knives, hole punches, or other tools based on the maker’s age and ability. Round sharp corners. Trim loose laminate. Secure tassels/ribbons. Keep beads and small parts away from young children.",
  },
];

export const CUSTOM_BOOKMARK_CREATOR_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Original layouts using properly licensed elements" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Custom-order form" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Costs, inventory, orders, income, expenses" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Product descriptions, policies, fair checklist" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Order and event deadlines" },
  { label: "USPTO Trademark Search", url: "https://www.uspto.gov/trademarks/search", note: "Name/mark research" },
  { label: "Etsy minors policy", url: "https://www.etsy.com/legal/minors/", note: "Verify current age and account rules" },
];

export const CUSTOM_BOOKMARK_CREATOR_SUPPLIES = {
  starterKitTotal:
    "Start with materials for 10–20 bookmarks — test durability before making a large batch",
  items: [
    { id: "cardstock", name: "Cardstock or bookmark blanks", qty: "1 pack", estCost: "$6–12", notes: "Core" },
    { id: "test-paper", name: "Printer paper for test prints", qty: "1 pack", estCost: "$3–6", notes: "Core" },
    { id: "pencils", name: "Pencils/eraser", qty: "1 set", estCost: "$2–5", notes: "Core" },
    { id: "art-medium", name: "Markers, colored pencils, watercolor, or other chosen art medium", qty: "1 set", estCost: "$8–20", notes: "Core" },
    { id: "ruler", name: "Ruler", qty: "1", estCost: "$2–5", notes: "Core" },
    { id: "scissors", name: "Scissors", qty: "1 pair", estCost: "$3–8", notes: "Core" },
    { id: "sleeves", name: "Clear sleeves or envelopes", qty: "1 pack", estCost: "$4–10", notes: "Core" },
    { id: "labels", name: "Price labels", qty: "1 pack", estCost: "$3–6", notes: "Core" },
    { id: "corner", name: "Corner rounder", qty: "1", estCost: "$5–10", notes: "Optional", optional: true },
    { id: "punch", name: "Hole punch", qty: "1", estCost: "$4–8", notes: "Optional", optional: true },
    { id: "ribbon", name: "Ribbon or tassel cord", qty: "1 pack", estCost: "$4–10", notes: "Optional", optional: true },
    { id: "laminator", name: "Laminator (adult supervision)", qty: "1", estCost: "$25–40", notes: "Laminated option", optional: true },
    { id: "pouches", name: "Laminating pouches/sheets", qty: "1 pack", estCost: "$8–15", notes: "Laminated option", optional: true },
    { id: "trimmer", name: "Paper trimmer (used safely)", qty: "1", estCost: "$15–30", notes: "Laminated option", optional: true },
    { id: "printer", name: "Printer and ink", qty: "1", estCost: "$0 if owned", notes: "Digital-print option", optional: true },
  ],
};

export const CUSTOM_BOOKMARK_CREATOR_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "paper", name: "Paper/Pencil", freePlanAvailable: true, planLabelApplicable: false, costNote: "Sketch ideas" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Original layouts using properly licensed elements", url: "https://www.canva.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Custom-order form", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Costs, inventory, orders, income, expenses", url: "https://sheets.google.com/" },
  { id: "docs", name: "Google Docs", freePlanAvailable: true, costNote: "Product descriptions, policies, fair checklist", url: "https://docs.google.com/" },
  { id: "calc", name: "Calculator", freePlanAvailable: true, planLabelApplicable: false, costNote: "Cost and profit math" },
  { id: "camera", name: "Phone Camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Parent-managed product photos" },
  { id: "calendar", name: "Calendar", freePlanAvailable: true, costNote: "Order and event deadlines", url: "https://calendar.google.com/" },
  { id: "pay", name: "Payment App/Processor", freePlanAvailable: true, costNote: "Parent/guardian-managed where required", optional: true },
  { id: "etsy", name: "Etsy/Online Marketplace", freePlanAvailable: true, costNote: "Optional — follow current age and account rules", url: "https://www.etsy.com/", optional: true },
  { id: "uspto", name: "USPTO Trademark Search", freePlanAvailable: true, costNote: "Name/mark research", url: "https://www.uspto.gov/trademarks/search" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Three Samples + Cost Sheet + Order Form + Parent-Approved Sales Channel + Inventory/Profit Tracker" },
];

export const CUSTOM_BOOKMARK_CREATOR_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $15 – $50 / project (examples, not guarantees).",
    "",
    "STARTER PRICE EXAMPLES",
    "Single Basic Bookmark: $3 – $6",
    "Single Laminated Bookmark: $4 – $8",
    "Set of 3: $9 – $18",
    "Set of 5: $12 – $25",
    "Name/Short-Message Personalization: +$1 – $4 each",
    "Tassel/Ribbon Add-On: +$1 – $3",
    "Gift Sleeve/Packaging: +$1 – $3",
    "Small 10-Bookmark Bulk Order: $30 – $70 depending on design and finish",
    "",
    "For custom projects, include revision limits and an approval deadline before production.",
    "",
    "PRICE FORMULA",
    "Materials per Bookmark + Packaging + Platform/Payment Fees + Design/Production Time Value + Profit = Price",
    "",
    "COST PER BOOKMARK",
    "Total Batch Material Cost ÷ Number of Sellable Bookmarks",
    "",
    "BULK QUOTE",
    "Design Fee + Quantity × Per-Bookmark Production Price + Personalization + Packaging + Shipping/Delivery = Quote",
    "",
    "MONTHLY EXAMPLES",
    "20 bookmarks × $5 = $100 gross/month",
    "8 five-bookmark sets × $18 = $144 gross/month",
    "2 custom 10-bookmark projects × $45 = $90 gross/month",
    "",
    "Gross revenue is NOT profit.",
    "Do not guarantee $15–$50 per project or any monthly result. Earnings depend on demand, quality, price, quantity, revisions, fees, materials, taxes, and unsold inventory.",
  ].join("\n"),
  raiseTip:
    "Raise prices after you know real batch cost and production time. Displayed $15 – $50 / project is examples only — not income guarantees.",
  items: [
    { id: "single-basic", label: "Single basic bookmark", price: "$3 – $6", notes: "Examples only" },
    { id: "single-lam", label: "Single laminated bookmark", price: "$4 – $8", notes: "Examples only" },
    { id: "set-3", label: "Set of 3", price: "$9 – $18", notes: "Examples only" },
    { id: "set-5", label: "Set of 5", price: "$12 – $25", notes: "Examples only" },
    { id: "personalize", label: "Name/short-message personalization", price: "+$1 – $4 each", notes: "Add-on example" },
    { id: "tassel", label: "Tassel/ribbon add-on", price: "+$1 – $3", notes: "Add-on example" },
    { id: "bulk-10", label: "Small 10-bookmark bulk order", price: "$30 – $70", notes: "Examples only" },
  ],
};

export const CUSTOM_BOOKMARK_CREATOR_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Pick Your Bookmark Style & Customer",
    desc: [
      "Choose one first offer: kids reading rewards; teacher gifts; book club sets; floral gifts; school-color designs; original motivational messages; personalized names.",
      "Choose one standard size and one finish.",
    ].join("\n"),
  },
  {
    title: "Set Safety, Copyright & Parent Rules",
    desc: [
      "Write: tools the maker may use; adult-only tools; approved materials; designs you will not copy; sales channels; account/payment owner; pickup/shipping rules; privacy/photo rules.",
      "Search brand names and marks before using them. A platform search is not a complete legal clearance.",
    ].join("\n"),
  },
  {
    title: "Create Three Original Samples",
    desc: [
      "Make three designs in one theme.",
      "Check: correct size; readable text; original art/message; straight trim; rounded/safe edges; smooth laminate; secure ribbon/tassel; no spelling errors.",
    ].join("\n"),
  },
  {
    title: "Test Quality & Get Feedback",
    desc: [
      "Place each bookmark in different books. Open and close the book.",
      "Check thickness, color transfer, bending, sharp edges, peeling laminate, and loose parts.",
      "Ask 3–5 trusted readers which design they prefer and why.",
    ].join("\n"),
  },
  {
    title: "Calculate Cost & Set Prices",
    desc: [
      "Record: cardstock; ink/art supplies; laminate; ribbon/tassel; packaging; fees; shipping; time.",
      "Calculate cost per bookmark, then set single, set, personalization, and bulk prices.",
    ].join("\n"),
  },
  {
    title: "Build Your Custom-Order System",
    desc: [
      "Create an order form with: customer/parent contact; design choice; name/message; colors; quantity; finish; ribbon/tassel; packaging; deadline; pickup/shipping; price/payment.",
      "State one proof/revision round before production.",
    ].join("\n"),
  },
  {
    title: "Make a Small Inventory Batch",
    desc: [
      "Create 10–20 ready-to-sell bookmarks.",
      "Track: SKU/design name; quantity made; quantity rejected; cost; price; location.",
      "Batch similar tasks — print, trim, laminate, punch, ribbon, package.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3: family/friend referrals; school fair with permission; library/book-club event with permission; community or faith event; parent-managed social account; parent-managed online marketplace.",
      "Set measurable goals:",
      "☐ Show samples to 10 trusted people.",
      "☐ Apply to 2 approved fairs/events.",
      "☐ Ask 3 teachers/readers for feedback or referral introductions.",
    ].join("\n"),
  },
  {
    title: "Create the Display or Listing",
    desc: [
      "Include: clear product name; original photos; size/material/finish; what the buyer receives; single/set price; personalization options; processing time; pickup/shipping; care/safety note; refund/custom-order policy.",
      "Do not include copied art, private child information, or false claims.",
    ].join("\n"),
  },
  {
    title: "Fulfill Orders & Track Real Profit",
    desc: [
      "Confirm spelling exactly as submitted. Send one proof when appropriate. Get approval. Make the item. Quality-check. Package. Deliver/ship through the parent-managed plan.",
      "Record revenue, materials, packaging, fees, shipping, refunds, damaged items, and time.",
      "Profit = Revenue − Expenses.",
    ].join("\n"),
  },
  {
    title: "Review Winners & Grow Carefully",
    desc: [
      "After 20 sales or one event review: best-selling theme; best price point; personalization demand; production time; defect rate; unsold designs; profit.",
      "Restock winners. Retire weak designs. Test one new set or one bulk customer type.",
      "Ask satisfied buyers for a short review with parent approval.",
    ].join("\n"),
  },
];

export function customBookmarkCreatorToolsDisclaimer(): string {
  return "Beginner stack: Three Samples + Cost Sheet + Order Form + Parent-Approved Sales Channel + Inventory/Profit Tracker. Custom does not mean copy anything — use original art only. Parent/guardian approval for anyone under 18.";
}

export function computeCustomBookmarkCreatorProfit(input: {
  cbcSinglesSold?: number;
  cbcAvgSinglePrice?: number;
  cbcSetsSold?: number;
  cbcAvgSetPrice?: number;
  cbcProjects?: number;
  cbcAvgProjectPrice?: number;
  cbcOtherRevenue?: number;
  cbcCardstockBlanks?: number;
  cbcInkArtSupplies?: number;
  cbcLaminate?: number;
  cbcRibbonTassels?: number;
  cbcPackaging?: number;
  cbcPlatformPaymentFees?: number;
  cbcEventFees?: number;
  cbcShipping?: number;
  cbcRefundsReplacements?: number;
  cbcOtherExpenses?: number;
}): {
  singleRevenue: number;
  setRevenue: number;
  projectRevenue: number;
  totalRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitMarginPercent: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const singleRevenue = n(input.cbcSinglesSold) * n(input.cbcAvgSinglePrice);
  const setRevenue = n(input.cbcSetsSold) * n(input.cbcAvgSetPrice);
  const projectRevenue = n(input.cbcProjects) * n(input.cbcAvgProjectPrice);
  const totalRevenue = singleRevenue + setRevenue + projectRevenue + n(input.cbcOtherRevenue);
  const totalExpenses =
    n(input.cbcCardstockBlanks) +
    n(input.cbcInkArtSupplies) +
    n(input.cbcLaminate) +
    n(input.cbcRibbonTassels) +
    n(input.cbcPackaging) +
    n(input.cbcPlatformPaymentFees) +
    n(input.cbcEventFees) +
    n(input.cbcShipping) +
    n(input.cbcRefundsReplacements) +
    n(input.cbcOtherExpenses);
  const estimatedProfit = totalRevenue - totalExpenses;
  return {
    singleRevenue,
    setRevenue,
    projectRevenue,
    totalRevenue,
    totalExpenses,
    estimatedProfit,
    profitMarginPercent: totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0,
  };
}
