/**
 * Lemonade / Drink Stand (`lemonade-stand`, Guide #013).
 * Parent-supervised beverage stand. Price per drink. Plain data only.
 */

export const LEMONADE_STAND_REALITY_CHECK = {
  title: "PARENT SUPERVISED — PRICE PER DRINK — CHECK THE RULES",
  body: [
    "This is a beginner youth beverage stand. A parent/guardian handles location permission, food/beverage rules, purchasing, hygiene coaching, money, transportation, and supervision.",
    "",
    "GROSS SALES = Servings Sold × Average Selling Price.",
    "TOTAL COSTS = ingredients + ice + cups/lids/straws + sign/consumables + fees + other.",
    "Do not treat parent-supplied ingredients as free when teaching true profit.",
    "",
    "Verify current city/county/state/event rules for temporary beverage/food sales. Never assume a sidewalk, park, school, or private property permits vending.",
    "Use clean potable water. Wash hands. Keep drinks covered. Maintain cold holding when required.",
    "Do not sell spoiled drinks. Do not make unsupported allergy-free claims.",
    "Keep the seller away from traffic. Do not block sidewalks or access.",
    "Protect the child's address, phone, and school schedule.",
    "Do not invent permits or laws.",
    "",
    "Tagline: One Simple Drink. Clean Hands. Count Every Cup.",
  ].join("\n"),
};

export const LEMONADE_STAND_NOTES_WORKSHEET = `MY LEMONADE / DRINK STAND PLAN

STAND
Date: ________
Location / Event: ________
Adult Supervisor: ________
Permission Confirmed: ☐
Rules Checked: ☐
Weather: ________

MENU
Drink: ________
Serving Size: ________
Ingredients: ________
Potential Allergens: ________
Price: $____
Servings Prepared: ____

COST
Ingredients: $____
Ice: $____
Cups / Lids / Straws: $____
Other Supplies: $____
Total Batch Cost: $____
Cost Per Serving: $____
Break-Even Servings: ____

SALES
Servings Sold: ____
Average Price: $____
Gross Sales: $____
Leftover / Waste: ____
Total Costs: $____
Estimated Profit: $____
Hours: ____
Profit Per Hour: $____

SAFETY CHECK
Clean Water: ☐
Handwashing: ☐
Clean Equipment: ☐
Cold Holding: ☐
Covered Drink: ☐
Trash Setup: ☐
Traffic / Location Safe: ☐

RESULTS
Best Seller: ________
Busy Time: ________
Customer Feedback: ________
What Ran Out: ________
What Was Left: ________

NEXT STAND
Make More / Less: ________
Price Change: ________
Menu Change: ________
Next Location / Event: ________
Adult Approval: ☐
`;

export const LEMONADE_STAND_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Classic sidewalk drink stand with parent help on pricing, hygiene, and location. Free Guide. 2 - 8 hrs/week. Price per drink (about $1–$3 examples). Displayed job ranges are examples only, not guarantees.",
  },
  {
    id: "adult",
    label: "Parent / guardian participation",
    detail:
      "Required for location permission, food/beverage rules, buying, hygiene, money handling, transportation, and supervision.",
  },
  {
    id: "rules",
    label: "Permission and food-sale rules",
    detail:
      "Check applicable local/event food-and-beverage rules before selling. Never assume vending is allowed. Do not invent permits.",
  },
  {
    id: "hygiene",
    label: "Hygiene and allergies",
    detail:
      "Handwashing, covered drinks, safe water/ice, temperature control, and ingredient/allergen awareness. Gloves do not replace handwashing.",
  },
];

export const LEMONADE_STAND_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Menu / price sign — Free plan available" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Batch cost, sales, profit" },
];

export const LEMONADE_STAND_SUPPLIES = {
  starterKitTotal: "About $15–35 for a small first batch — do not overbuy",
  items: [
    { id: "drink", name: "Parent-approved beverage ingredients", qty: "1 small batch", estCost: "$5–12", notes: "Essential — record cost even if a parent buys them" },
    { id: "water", name: "Clean drinking water", qty: "as needed", estCost: "$0–3", notes: "Essential — potable only" },
    { id: "ice", name: "Ice + insulated cooler", qty: "1", estCost: "$5–12", notes: "Essential" },
    { id: "pitcher", name: "Clean pitcher / dispenser with lid", qty: "1", estCost: "$5–12", notes: "Essential" },
    { id: "cups", name: "Cups + optional lids / straws", qty: "1 pack", estCost: "$4–10", notes: "Essential" },
    { id: "measure", name: "Measuring cup / spoon + clean serving utensil", qty: "1 set", estCost: "$3–8", notes: "Essential" },
    { id: "table", name: "Table + washable covering + napkins", qty: "1 setup", estCost: "$0–15", notes: "Essential — borrow if you can" },
    { id: "sign", name: "Price / menu sign supplies", qty: "1", estCost: "$3–8", notes: "Essential — or print from Canva" },
    { id: "cash", name: "Cash box / change OR parent-managed digital pay", qty: "1", estCost: "$0–10", notes: "Essential" },
    { id: "hygiene", name: "Handwashing / sanitizing + paper towels + trash bag", qty: "1 kit", estCost: "$5–12", notes: "Essential" },
    { id: "sun", name: "Sunscreen / hat / seller water", qty: "1", estCost: "$0–8", notes: "Essential for the seller" },
    { id: "canopy", name: "Optional umbrella / canopy", qty: "1", estCost: "$0–25", notes: "Only if safely secured and permitted", optional: true },
  ],
};

export const LEMONADE_STAND_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "calc", name: "Calculator", freePlanAvailable: true, planLabelApplicable: false, costNote: "Cost per serving, price, and break-even" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Batch cost, sales, leftover, profit", url: "https://sheets.google.com/" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Readable menu / price sign — Free plan available", url: "https://www.canva.com/" },
  { id: "weather", name: "Weather forecast", freePlanAvailable: true, planLabelApplicable: false, costNote: "Stop for unsafe weather" },
  { id: "tally", name: "Simple sales tally sheet", freePlanAvailable: true, planLabelApplicable: false, costNote: "Tally every cup sold" },
  { id: "pay", name: "Parent-managed payment option", freePlanAvailable: true, planLabelApplicable: false, costNote: "Cash or adult-managed digital" },
  { id: "timer", name: "Optional timer / cold-holding check", freePlanAvailable: true, costNote: "When the beverage needs temperature control", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Calculator + Google Sheets + Canva + Weather + Tally + Parent-Managed Payment" },
];

export const LEMONADE_STAND_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "LEMONADE / DRINK STAND — PRICE PER DRINK",
    "",
    "A $10–$40 “job” price does not fit this side-hustle. Price primarily PER DRINK.",
    "Displayed figures are examples only, not guarantees.",
    "",
    "Total Batch Cost = ingredients + ice + cups/lids/straws + garnishes + sign/consumables + other direct costs.",
    "Cost Per Serving = Total Batch Cost / Expected Sellable Servings.",
    "Gross Sales = Servings Sold × Average Selling Price.",
    "Estimated Profit = Gross Sales − Actual Business Costs.",
    "Record parent-supplied ingredient cost. It is not free.",
    "",
    "STARTER RANGES — EXAMPLES ONLY",
    "Basic lemonade / drink: about $1–$3 per cup",
    "Premium / flavored: about $2–$5",
    "Bottled / canned resale: based on unit cost, rules, and margin",
    "Optional 2-drink / family bundle",
  ].join("\n"),
  raiseTip: "Change price after you know cost per serving and leftover waste. Examples only — not income guarantees.",
  items: [
    { id: "basic", label: "Basic lemonade / drink (per cup)", price: "$1–$3", notes: "Examples only" },
    { id: "premium", label: "Premium / flavored drink", price: "$2–$5", notes: "Examples only" },
    { id: "resale", label: "Bottled / canned resale", price: "Cost + margin", notes: "Follow local rules" },
    { id: "bundle", label: "Optional 2-drink / family bundle", price: "Quoted", notes: "Examples only" },
  ],
};

export const LEMONADE_STAND_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose 1–2 Parent-Approved Drinks and Serving Size",
    desc: "Keep the first menu tiny. Write ingredients and possible allergens. Do not claim allergy-free unless verified.",
  },
  {
    title: "Pick a Safe Location and Verify Permission and Rules",
    desc: "With an adult, choose a permitted location/event. Check beverage/food-sale rules. Never assume a sidewalk or park allows vending. Stay off traffic and do not block access.",
  },
  {
    title: "Calculate Batch Cost, Cost Per Serving, Price, and Break-Even",
    desc: "Open Google Sheets from the Tools tab. Record ingredients, ice, cups, other costs. Cost per serving = batch cost / expected sellable servings. Set a price using Suggested Pricing as examples only.",
  },
  {
    title: "Buy Supplies and Set Up a Clean, Priced Stand",
    desc: "Buy a small first batch only. Table covering, covered pitcher, trash, handwashing, and a readable price sign.",
  },
  {
    title: "Prepare and Store Drinks Safely",
    desc: "Wash hands. Use potable water, clean equipment, covered containers, and cold holding when needed. Do not sell questionable drinks.",
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3 age-appropriate channels:",
      "☐ Family / neighbors",
      "☐ Parent-approved community / social sharing",
      "☐ Permitted event signage",
      "",
      "Write one measurable goal per channel. A parent manages public posts.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a readable menu/price sign, stand name if desired, and a parent-approved announcement.",
      "Open Canva at https://www.canva.com/ — Free plan available — sign in at the link, or continue with an account you already have.",
      "",
      "Sample:",
      "“Lemonade $____ a cup. [Date / time]. Parent on site.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: "Tell approved contacts when/where the stand will operate. Set up only where permitted. Do not block sidewalks or driveways.",
  },
  {
    title: "Run the Stand: Serve Safely and Tally Every Sale",
    desc: "Greet customers, keep serving hands/equipment clean, tally each cup, and let an adult handle money and unsafe interactions.",
  },
  {
    title: "Close Safely, Clean Up, and Count Leftovers",
    desc: "Stop at the planned time or weather trigger. Store/dispose leftovers correctly. Clean the area. Count sales and remaining inventory.",
  },
  {
    title: "Calculate Profit and Plan the Next Permitted Stand",
    desc: "Record gross sales, costs, leftover/waste, profit, hours, and profit per drink/hour. Decide what to make more/less of. Get adult approval for the next date.",
  },
];

export function lemonadeStandToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Calculator + Google Sheets + Canva + Weather + Tally Sheet + Parent-Managed Payment.",
    "",
    "Apps belong here. Lemons, cups, ice, and the table live on the Supply List.",
    "",
    "A parent/guardian supervises location, rules, money, and public posts. Price per drink — not a generic job fee.",
  ].join("\n");
}

export function computeLemonadeStandProfit(input: {
  lemonadeServingsSold?: number;
  averageSellingPrice?: number;
  servingsPrepared?: number;
  ingredientCost?: number;
  iceCost?: number;
  cupLidStrawCost?: number;
  otherDirectCosts?: number;
  paymentFees?: number;
  otherExpenses?: number;
  laborHours?: number;
}): {
  grossSales: number;
  servingsPrepared: number;
  servingsSold: number;
  unsoldServings: number;
  totalCosts: number;
  costPerServing: number | null;
  estimatedProfit: number;
  profitPerDrink: number | null;
  profitPerHour: number | null;
  breakEvenServings: number | null;
  profitMarginPercent: number;
} {
  const servingsSold = Math.max(0, Number(input.lemonadeServingsSold) || 0);
  const servingsPrepared = Math.max(0, Number(input.servingsPrepared) || 0);
  const price = Math.max(0, Number(input.averageSellingPrice) || 0);
  const grossSales = servingsSold * price;
  const totalCosts =
    Math.max(0, Number(input.ingredientCost) || 0) +
    Math.max(0, Number(input.iceCost) || 0) +
    Math.max(0, Number(input.cupLidStrawCost) || 0) +
    Math.max(0, Number(input.otherDirectCosts) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossSales - totalCosts;
  const hours = Math.max(0, Number(input.laborHours) || 0);
  const costPerServing = servingsPrepared > 0 ? totalCosts / servingsPrepared : null;
  return {
    grossSales,
    servingsPrepared,
    servingsSold,
    unsoldServings: Math.max(0, servingsPrepared - servingsSold),
    totalCosts,
    costPerServing,
    estimatedProfit,
    profitPerDrink: servingsSold > 0 ? estimatedProfit / servingsSold : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    breakEvenServings: price > 0 ? Math.ceil(totalCosts / price) : null,
    profitMarginPercent: grossSales > 0 ? (estimatedProfit / grossSales) * 100 : 0,
  };
}
