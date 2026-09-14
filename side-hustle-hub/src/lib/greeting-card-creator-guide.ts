/**
 * Greeting Card Creator (`greeting-card-creator`, Guide #073).
 * Handmade physical cards and Canva digital/printable cards. Plain data only.
 */

export const GREETING_CARD_REALITY_CHECK = {
  title: "PHYSICAL AND DIGITAL ARE DIFFERENT BUSINESSES — REVENUE IS NOT PROFIT",
  body: [
    "Sell handmade physical cards, Canva printable/digital cards, personalized cards, bundles, seasonal collections, and custom cards for people, groups, or small businesses.",
    "Track physical and digital economics separately so ink and postage do not hide digital profit.",
    "",
    "PHYSICAL GROSS = quantity × selling price. PHYSICAL PROFIT = gross − paper − ink − envelopes − embellishments − packaging − fees − shipping − ads.",
    "DIGITAL GROSS = ready-made + personalized + custom Canva + business packages. DIGITAL PROFIT = gross − software/assets − fees − ads.",
    "",
    "No unauthorized characters, celebrity images, logos, trademarks, art, or copied seller designs. Verify commercial-use terms.",
    "AI drafts need human review, originality/accuracy check, personalization, then delivery.",
    "Quality-check names, spelling, dates, message, image/print quality, folds/cuts, envelope, and dimensions.",
    "",
    "Tagline: Design It. Spell-Check It. Deliver It.",
  ].join("\n"),
};

export const GREETING_CARD_NOTES_WORKSHEET = `MY GREETING CARD CREATOR PLAN

CUSTOMER
Customer: ________  Occasion: ________
Physical / Digital / Both: ________
Design: ________  Quantity: ____
Personalization: ________  Message: ________  Photo: ________
Deadline: ________  Quote: $____

COSTS
Materials: $____  Printing: $____  Packaging: $____
Shipping: $____  Fees: $____

RESULTS
Revenue: $____  Expenses: $____  Profit: $____
Hours: ____  Profit/hour: $____
Approval: ☐  Delivery: ________
Best seller: ________  Repeat: ☐
Notes: ________
`;

export const GREETING_CARD_PREREQUISITE_EXTRAS: { id: string; label: string; detail: string }[] = [
  { id: "overview", label: "What this hustle is", detail: "Make handmade or Canva greeting cards for birthdays, thanks, and holidays. 3 - 10 hrs/week. Displayed $15 – $50 / project is examples only. Tagline: Design It. Spell-Check It. Deliver It." },
  { id: "craft", label: "Crafting and design basics", detail: "Attention to spelling, folds, and readable type. Device and internet for digital/printable work." },
  { id: "license", label: "Permission and licensing", detail: "Do not use copyrighted characters, celebrity images, logos, or another seller’s design. Verify Canva commercial-use terms." },
  { id: "youth", label: "Parent / guardian for minors", detail: "Adult help for scissors, payments, shipping, and public posts." },
];

export const GREETING_CARD_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Digital / printable design — verify commercial-use terms" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Delivery of digital files" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Orders" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Inventory, orders, profit" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Deadlines" },
];

export const GREETING_CARD_SUPPLIES = {
  starterKitTotal: "About $10–30 to start small — do not buy a full craft store",
  items: [
    { id: "cardstock", name: "Cardstock", qty: "1 pack", estCost: "$6–12", notes: "Physical path" },
    { id: "envelopes", name: "Envelopes that match card size", qty: "1 pack", estCost: "$4–10", notes: "Physical path" },
    { id: "scissors", name: "Scissors and ruler", qty: "1 set", estCost: "$0–8", notes: "Essential if making physical cards" },
    { id: "adhesive", name: "Adhesive (glue stick / tape)", qty: "1", estCost: "$2–6", notes: "Physical path" },
    { id: "pens", name: "Pens / markers", qty: "1 set", estCost: "$4–10", notes: "Physical path" },
    { id: "computer", name: "Computer or tablet for Canva", qty: "1 (usually owned)", estCost: "$0", notes: "Digital path" },
    { id: "internet", name: "Internet", qty: "1", estCost: "$0", notes: "Digital path" },
    { id: "phone", name: "Phone for orders and photos", qty: "1 (usually owned)", estCost: "$0", notes: "Essential" },
    { id: "printer", name: "Optional test printer / paper / ink", qty: "1", estCost: "$0–15", notes: "Optional", optional: true },
    { id: "packaging", name: "Optional sleeves / mailers / gift packaging", qty: "small pack", estCost: "$5–12", notes: "Optional", optional: true },
    { id: "cutter", name: "Optional cutter / stamps / specialty paper", qty: "as needed", estCost: "$0–25", notes: "Optional — start small", optional: true },
  ],
};

export const GREETING_CARD_TOOLS: {
  id: string; name: string; freePlanAvailable: boolean; planLabelApplicable?: boolean; costNote: string; url?: string; optional?: boolean;
}[] = [
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Digital and printable cards — verify commercial-use rights", url: "https://www.canva.com/" },
  { id: "drive", name: "Google Drive", freePlanAvailable: true, costNote: "Deliver printable files", url: "https://drive.google.com/" },
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Orders: occasion, message, quantity, deadline", url: "https://forms.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Inventory, orders, cost per card, profit", url: "https://sheets.google.com/" },
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Deadlines", url: "https://calendar.google.com/" },
  { id: "chatgpt", name: "ChatGPT", freePlanAvailable: true, costNote: "Original concept/message brainstorming with human review", url: "https://chatgpt.com/", optional: true },
  { id: "pay", name: "Payment app", freePlanAvailable: true, planLabelApplicable: false, costNote: "Collect card fees" },
  { id: "shop", name: "Optional marketplace / ecommerce", freePlanAvailable: true, costNote: "Only if you already have permission and age-appropriate accounts", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Canva + Drive + Forms + Sheets + Calendar + Payment" },
];

export const GREETING_CARD_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "GREETING CARD CREATOR — PHYSICAL AND DIGITAL EXAMPLES",
    "",
    "Displayed $15 – $50 / project is examples only, not a guarantee.",
    "Keep physical and digital math separate.",
    "REVENUE is not PROFIT.",
    "",
    "Handmade basic: about $5–$12",
    "Personalized handmade: about $10–$25+",
    "Premium custom: about $20–$50+",
    "4–6 card set: about $20–$60+",
    "Ready-made digital: about $3–$10",
    "Personalized digital: about $10–$30+",
    "Custom Canva: about $15–$50+",
    "Business packages: by quantity, customization, and use",
    "",
    "Add-ons: message/name/photo, rush, envelope, premium paper, embellishments, size, printing, shipping, gift packaging.",
  ].join("\n"),
  raiseTip: "Charge more for custom art, photos, rush, and shipping you pay. Examples only.",
  items: [
    { id: "hand", label: "Handmade basic", price: "$5–$12", notes: "Examples only" },
    { id: "pers", label: "Personalized handmade", price: "$10–$25+", notes: "Examples only" },
    { id: "premium", label: "Premium custom", price: "$20–$50+", notes: "Examples only" },
    { id: "set", label: "4–6 card set", price: "$20–$60+", notes: "Examples only" },
    { id: "digital", label: "Ready-made digital", price: "$3–$10", notes: "Examples only" },
    { id: "canva", label: "Custom Canva card", price: "$15–$50+", notes: "Examples only" },
  ],
};

export const GREETING_CARD_DETAILED_STEPS: { title: string; desc: string }[] = [
  { title: "Choose Physical, Digital, or Both", desc: "Write which path you will sell first. Physical needs cardstock and envelopes. Digital needs Canva exports. Do not mix their costs in one pile." },
  { title: "Pick Niches and Occasions", desc: "Birthdays, thanks, holidays, sympathy, small-business thank-you. Start with 2–3 occasions you can repeat." },
  { title: "Make Samples (No Private Client Details)", desc: "2–4 handmade and/or Canva samples with fictional names. No copyrighted characters or copied seller designs." },
  { title: "Calculate True Cost Per Card", desc: "Open Google Sheets. Physical: paper + ink + envelope + embellishments + packaging + your time. Digital: software/assets allocation. Cost is not the selling price." },
  { title: "Set Pricing and Customization Rules", desc: "Write basic vs personalized vs custom vs sets. State rush, extra message, photo, envelope, and shipping add-ons before you take money." },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3:",
      "☐ Friends / family",
      "☐ Parent-approved local groups",
      "☐ Craft fairs / tables with permission",
      "☐ Repeat holiday customers",
      "",
      "Examples:",
      "- Tell 10 trusted people this week.",
      "- Share one sample (no private names) where allowed.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Open Canva at https://www.canva.com/",
      "Free plan available — start here; upgrade only if you need it.",
      "Sign in at the link or use an account you already have.",
      "Search Templates for a Greeting card or folded 5×7 you can customize as a SAMPLE (bold front cover; leave room for inside text later).",
      "",
      "Create:",
      "☐ A one-page menu (handmade vs digital prices)",
      "☐ 2–3 sample covers (fictional names)",
      "☐ What is included (message, envelope, file type)",
      "",
      "Sample:",
      "“Handmade and Canva greeting cards. Basic handmade $____ · custom Canva $____.”",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week:",
      "☐ Share the menu with warm contacts",
      "☐ Post one sample where allowed",
      "☐ Take one paid order",
      "",
      "Younger makers: a parent/guardian manages public posts, shipping, and payments.",
    ].join("\n"),
  },
  { title: "Take the Order and Get Approval", desc: "Open Google Forms. Occasion, quantity, physical vs digital, exact message, names, photo, deadline, quote. Confirm spelling before you make or export." },
  { title: "Produce, Quality-Check, Package, and Deliver", desc: "Check names, spelling, dates, message, print/image quality, folds/cuts, envelope fit, and dimensions. Deliver files via Drive or hand off physical cards. Collect payment." },
  { title: "Track Profit, Best Sellers, and Repeat Customers", desc: "Log cost/card, selling price/card, profit/card, hours, and profit per hour. Note best sellers for the next holiday." },
];

export function greetingCardToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Canva + Drive + Forms + Sheets + Calendar + Payment.",
    "",
    "Cardstock and envelopes are Supplies. Digital and physical costs are different. Verify Canva commercial-use terms.",
  ].join("\n");
}

export function computeGreetingCardProfit(input: {
  greetingCardHandmadeSold?: number;
  handmadePrice?: number;
  personalizedHandmade?: number;
  personalizedPrice?: number;
  digitalSold?: number;
  digitalPrice?: number;
  customCanvaOrders?: number;
  customCanvaPrice?: number;
  paperInkEnvelopes?: number;
  embellishmentsPackaging?: number;
  shipping?: number;
  softwareAssets?: number;
  paymentFees?: number;
  advertising?: number;
  otherExpenses?: number;
  laborHours?: number;
  cardsCompleted?: number;
}): {
  grossRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  profitPerCard: number | null;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const grossRevenue =
    Math.max(0, Number(input.greetingCardHandmadeSold) || 0) * Math.max(0, Number(input.handmadePrice) || 0) +
    Math.max(0, Number(input.personalizedHandmade) || 0) * Math.max(0, Number(input.personalizedPrice) || 0) +
    Math.max(0, Number(input.digitalSold) || 0) * Math.max(0, Number(input.digitalPrice) || 0) +
    Math.max(0, Number(input.customCanvaOrders) || 0) * Math.max(0, Number(input.customCanvaPrice) || 0);
  const totalExpenses =
    Math.max(0, Number(input.paperInkEnvelopes) || 0) +
    Math.max(0, Number(input.embellishmentsPackaging) || 0) +
    Math.max(0, Number(input.shipping) || 0) +
    Math.max(0, Number(input.softwareAssets) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProfit = grossRevenue - totalExpenses;
  const cards = Math.max(0, Number(input.cardsCompleted) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  return {
    grossRevenue,
    totalExpenses,
    estimatedProfit,
    profitPerCard: cards > 0 ? estimatedProfit / cards : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    profitMarginPercent: grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0,
  };
}
