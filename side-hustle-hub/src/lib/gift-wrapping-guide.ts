/**
 * Gift Wrapping Service (`gift-wrapping`, Guide #007).
 * Local wrapping for holidays and birthdays — per gift, packages, and optional pickup/delivery.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const GIFT_WRAPPING_REALITY_CHECK = {
  title: "LABEL EVERY GIFT — REVENUE IS NOT PROFIT",
  body: [
    "Keep each customer's gifts clearly labeled and separated.",
    "Protect items from damage, moisture, pets, smoke, food, and other hazards.",
    "Document existing damage on valuable or fragile items when appropriate.",
    "Do not open sealed customer merchandise unless the customer asked you to.",
    "",
    "Protect customer names, addresses, gift details, and personal information.",
    "Do not publicly post customer addresses. Use safe pickup and delivery practices.",
    "",
    "Set holiday deadlines you can actually meet. Do not promise turnaround you cannot finish.",
    "Tell the customer extra charges for oversized or awkward items BEFORE you wrap.",
    "Use scissors and cutting tools safely. Younger helpers need adult supervision for tools, payments, transportation, and customer meetups.",
    "",
    "Revenue is money collected. Profit is what remains after wrapping materials, travel, payment fees, advertising, and other expenses.",
    "",
    "Tagline: Wrap It. Label It. Hand It Off.",
  ].join("\n"),
};

/** Gift wrapping planner shown above freeform Notes for this guide. */
export const GIFT_WRAPPING_NOTES_WORKSHEET = `MY GIFT WRAPPING PLAN

CUSTOMER
Name: ________
Phone: ________
Preferred Contact: ________
Deadline: ________

ORDER
Number of Gifts: ____
Small: ____
Medium: ____
Large/Oversized: ____
Special Instructions: ________
Color/Theme: ________
Customer Supplies Materials: YES / NO

ADD-ONS
Premium Ribbon/Bow: ________
Gift Tags: ________
Gift Bag/Box: ________
Pickup: ________
Delivery: ________
Other: ________

PRICING
Service Charge: $____
Materials: $____
Add-Ons: $____
Total Quoted: $____
Deposit/Paid: $____
Balance: $____

JOB TRACKING
Drop-Off/Pickup Date: ________
Completion Date: ________
Gift Count Verified: ☐ Yes
Quality Check: ☐ Yes
Customer Pickup/Delivery: ________

RESULTS
Gross Revenue: $____
Material Cost: $____
Travel: $____
Other Expenses: $____
Estimated Profit: $____
Hours Worked: ____
Profit Per Hour: $____

FOLLOW-UP
Referral Requested: ☐ Yes
Repeat Customer: ☐ Yes
Holiday/Event Reminder: ________

Marketing Channel 1: ________
Marketing Channel 2: ________
Marketing Channel 3: ________

GYSH PRO TIP
START WITH A SMALL COORDINATED PAPER + RIBBON SET.
Do not buy a huge seasonal inventory before you know what customers want.
Quote extra for oversized, awkward, or basket jobs before you wrap.
REVENUE IS NOT PROFIT — subtract paper, ribbon, boxes, travel, and fees.

BEGINNER CHALLENGE
Complete your FIRST 5-GIFT PRACTICE, then take one real paid job.
1. Practice wrapping 5 gifts neatly (boxes of different sizes).
2. Write a 3-tier price menu (small / medium / large).
3. Calculate material cost per gift.
4. Take 3 photos of your wrapping.
5. Tell 2–3 channels you chose.
6. Finish one labeled, quality-checked job.
7. Track revenue, expenses, and profit.
Goal: prove you can WRAP IT → PRICE IT → HAND IT OFF → PROFIT.
`;

export const GIFT_WRAPPING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Wrap gifts neatly for holidays and birthdays with bows and simple tags. Local gift-wrapping service: per gift, by size and complexity, with optional add-ons and pickup/delivery. Tagline: Wrap It. Label It. Hand It Off. Category: Local Services / Gift Wrapping. Beginner · 2 - 8 hrs/week · $10 – $40 / job (examples only). For younger helpers, a parent/guardian supervises tools, payments, transportation, and customer meetups.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Parent/guardian approval for minors · A clean wrapping surface · A small coordinated supply kit (paper, tape, scissors, ribbon, tags) · A way to label and separate each customer's gifts · A simple price menu · Age-appropriate payment method.",
  },
  {
    id: "before-jobs",
    label: "Before you take paid jobs",
    detail:
      "Practice neat wrapping on different box sizes · Know which materials you provide vs the customer provides · Write deadlines and turnaround times you can keep · Decide how you will intake, label, and return gifts · Tell customers extra charges for oversized or awkward items before wrapping.",
  },
  {
    id: "care-of-gifts",
    label: "Protect the customer's items",
    detail:
      "Keep each customer's gifts clearly labeled and separated. Protect from damage, moisture, pets, smoke, food, and other hazards. Document existing damage on valuable or fragile items when appropriate. Do not open sealed merchandise unless asked.",
  },
  {
    id: "minors",
    label: "Parent/guardian for younger helpers",
    detail:
      "Adult supervision for scissors/cutting tools, payments, transportation, and customer meetups. Protect personal information. Do not publicly post customer addresses.",
  },
  {
    id: "revenue-vs-profit",
    label: "Revenue is not profit",
    detail:
      "Service charge + materials charged to the customer + add-ons = gross revenue. Then subtract wrapping materials used, travel/delivery, payment fees, advertising, and other expenses to get estimated profit.",
  },
];

export const GIFT_WRAPPING_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Canva", url: "https://www.canva.com/", note: "Flyers, price menus, and social graphics" },
  { label: "Google Forms", url: "https://forms.google.com/", note: "Customer and order intake" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Appointments and holiday deadlines" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Jobs, supply costs, revenue, and profit" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Pickup and delivery planning" },
];

export const GIFT_WRAPPING_SUPPLIES = {
  starterKitTotal:
    "About $15–35 for a small coordinated starter kit — do not buy excessive seasonal inventory before you know what sells",
  items: [
    {
      id: "paper",
      name: "Wrapping paper",
      qty: "2–3 coordinated rolls",
      estCost: "$8–18",
      notes: "Essential — start with one color story, not every holiday print",
    },
    {
      id: "bags",
      name: "Gift bags",
      qty: "1 small pack (mixed sizes)",
      estCost: "$5–12",
      notes: "Essential — faster option for odd shapes",
    },
    {
      id: "tissue",
      name: "Tissue paper",
      qty: "1 pack",
      estCost: "$4–8",
      notes: "Essential",
    },
    {
      id: "ribbon",
      name: "Ribbon",
      qty: "1–2 rolls",
      estCost: "$4–10",
      notes: "Essential",
    },
    {
      id: "bows",
      name: "Bows",
      qty: "1 pack",
      estCost: "$4–8",
      notes: "Essential — or make simple ribbon bows",
    },
    {
      id: "tags",
      name: "Gift tags",
      qty: "1 pack",
      estCost: "$3–6",
      notes: "Essential",
    },
    {
      id: "tape",
      name: "Clear tape + double-sided tape",
      qty: "1–2 rolls each",
      estCost: "$4–8",
      notes: "Essential",
    },
    {
      id: "scissors",
      name: "Scissors",
      qty: "1",
      estCost: "$5–12",
      notes: "Essential — adult supervision for younger helpers",
    },
    {
      id: "measure",
      name: "Measuring tape / ruler",
      qty: "1",
      estCost: "$0–5",
      notes: "Essential — cut paper to size instead of wasting rolls",
    },
    {
      id: "pens",
      name: "Markers / pens",
      qty: "1 set",
      estCost: "$2–6",
      notes: "Essential — tags and customer labels",
    },
    {
      id: "surface",
      name: "Protective work surface",
      qty: "1",
      estCost: "$0–10",
      notes: "Essential — cutting mat, tablecloth, or cardboard so you do not damage furniture or gifts",
    },
    {
      id: "bins",
      name: "Storage bins / totes",
      qty: "1–2",
      estCost: "$6–15",
      notes: "Essential — keep paper, ribbon, and each customer's gifts organized and separated",
    },
    {
      id: "boxes",
      name: "Boxes in common sizes",
      qty: "small starter set",
      estCost: "$6–15",
      notes: "Optional — buy a few common sizes only; do not stockpile",
      optional: true,
    },
    {
      id: "accents",
      name: "Optional decorative accents",
      qty: "1 small pack",
      estCost: "$3–10",
      notes: "Optional — twine, sprigs, or stickers that match your paper",
      optional: true,
    },
    {
      id: "tote",
      name: "Portable supply tote for mobile jobs",
      qty: "1",
      estCost: "$8–18",
      notes: "Optional — for wrapping at a customer's home or a pop-up table",
      optional: true,
    },
    {
      id: "seasonal",
      name: "Extra seasonal paper / cellophane",
      qty: "as needed after first jobs",
      estCost: "$5–15",
      notes: "Nice to have — add only after you see demand",
      optional: true,
    },
  ],
};

export const GIFT_WRAPPING_TOOLS: {
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
    costNote: "Photos of wrapping examples and a simple portfolio — no customer addresses in public posts",
  },
  {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Simple flyers, price menus, and social graphics",
    url: "https://www.canva.com/",
  },
  {
    id: "forms",
    name: "Google Forms",
    freePlanAvailable: true,
    costNote: "Customer and order intake: gift count, deadline, theme, pickup vs drop-off",
    url: "https://forms.google.com/",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Appointments, drop-off windows, and holiday deadlines you can actually meet",
    url: "https://calendar.google.com/",
  },
  {
    id: "sheets",
    name: "Google Sheets / Excel",
    freePlanAvailable: true,
    costNote: "Jobs, supply costs, revenue, expenses, and real profit",
    url: "https://sheets.google.com/",
  },
  {
    id: "maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Pickup and delivery planning — do not post addresses publicly",
    url: "https://maps.google.com/",
  },
  {
    id: "payments",
    name: "Payment / invoicing tool",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Cash, parent-managed apps, or a simple invoice — never put a child's personal payment handle on a public flyer",
  },
  {
    id: "social",
    name: "Social / local community platforms",
    freePlanAvailable: true,
    costNote: "Neighborhood groups, Nextdoor, or bulletin boards — age-appropriate or adult-managed accounts only",
    optional: true,
  },
  {
    id: "beginner-stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Smartphone Camera + Canva + Google Forms + Google Calendar + Google Sheets",
  },
];

export const GIFT_WRAPPING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "GIFT WRAPPING PRICING EXAMPLES",
    "",
    "Displayed earning potential: $10 – $40 / job (examples only).",
    "",
    "These are examples only, not guarantees. Revenue is not profit.",
    "",
    "Price from gift size, wrapping complexity, who provides materials, premium add-ons, baskets or awkward shapes, multi-gift packages, holiday/event packages, and optional pickup/delivery.",
    "",
    "GROSS REVENUE",
    "Service Charge",
    "+ Materials Charged to Customer",
    "+ Add-Ons",
    "= Gross Revenue",
    "",
    "ESTIMATED PROFIT",
    "Gross Revenue",
    "- Wrapping Materials Used",
    "- Travel / Delivery",
    "- Payment Fees",
    "- Advertising",
    "- Other Expenses",
    "= Estimated Profit",
    "",
    "STARTER RANGES — EXAMPLES ONLY",
    "Small / simple gift: approximately $5–$8",
    "Medium gift: approximately $8–$12",
    "Large or awkward gift: approximately $12–$20+",
    "Premium wrapping / add-ons: additional charge",
    "Multi-gift package: bundled pricing based on quantity and complexity",
    "Holiday / event package: custom quote",
    "",
    "If the customer provides paper and ribbon, charge the service fee. If you provide materials, add them (with a small markup) so you do not wrap at a loss.",
    "",
    "EXAMPLE (one medium gift you supply materials for)",
    "Service charge $8.00",
    "Materials charged $2.00",
    "Premium bow add-on $2.00",
    "Gross $12.00",
    "Materials you used $1.50",
    "Estimated profit $10.50 before travel and fees",
  ].join("\n"),
  raiseTip:
    "Charge more for large, awkward, premium, or rush jobs. Know YOUR material cost first. Displayed $10 – $40 / job is examples only — not income guarantees.",
  items: [
    { id: "small", label: "Small / simple gift", price: "$5–$8", notes: "Examples only — service + any materials you provide" },
    { id: "medium", label: "Medium gift", price: "$8–$12", notes: "Examples only" },
    { id: "large", label: "Large or awkward gift", price: "$12–$20+", notes: "Examples only — quote extra before wrapping" },
    { id: "premium", label: "Premium wrapping / add-ons", price: "Additional charge", notes: "Bows, layered wrap, tags, bags, boxes" },
    { id: "bundle", label: "Multi-gift package", price: "Bundle by quantity", notes: "Examples only — quantity and complexity" },
    { id: "holiday", label: "Holiday / event package", price: "Custom quote", notes: "Examples only" },
    { id: "delivery", label: "Pickup / delivery (optional)", price: "Add-on", notes: "Where appropriate — include travel time" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 6–8. Use ☐ only. */
export const GIFT_WRAPPING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Practice Neat Wrapping Techniques",
    desc: [
      "Practice before you take paid jobs. Neat folds, hidden seams, and a finished bow are the product.",
      "",
      "Practice on:",
      "☐ A small box",
      "☐ A medium box",
      "☐ A larger or awkward shape (or use a gift bag)",
      "",
      "Use scissors safely. Younger helpers: adult supervision for cutting tools.",
      "Measure paper so you waste less. Crisp corners beat extra tape.",
      "Do not open sealed customer merchandise while you practice on your own boxes.",
    ].join("\n"),
  },
  {
    title: "Define Your Services and Choose Materials",
    desc: [
      "Write a short menu you can actually deliver.",
      "",
      "Services:",
      "☐ Small / simple wrap",
      "☐ Medium wrap",
      "☐ Large or awkward wrap",
      "☐ Gift bag option",
      "☐ Premium bow / ribbon / tags",
      "☐ Multi-gift package",
      "☐ Holiday / event package (custom quote)",
      "☐ Optional pickup or delivery",
      "",
      "Choose one coordinated paper + ribbon set for your first season. Do not buy excessive seasonal inventory.",
      "Write: customer provides materials: YES / NO. If you provide them, you will charge for them.",
    ].join("\n"),
  },
  {
    title: "Calculate Material Costs and Create a Price Menu",
    desc: [
      "Gross revenue = Service Charge + Materials Charged to Customer + Add-Ons.",
      "Profit = Gross Revenue − wrapping materials used − travel/delivery − payment fees − advertising − other expenses.",
      "",
      "Write for one typical gift:",
      "Paper / bag / tissue: $____",
      "Ribbon / bow / tag: $____",
      "Service charge: $____",
      "Suggested price: $____",
      "Estimated profit: $____",
      "",
      "Starter examples only (not guarantees): small $5–$8 · medium $8–$12 · large/awkward $12–$20+.",
      "Quote extra for oversized items BEFORE you wrap.",
      "Revenue is not profit.",
      "",
      "Open Google Sheets from the Tools tab (sign in with Google, or use an account you already have) and record the numbers.",
    ].join("\n"),
  },
  {
    title: "Set Order Deadlines and Customer Intake",
    desc: [
      "Holiday rush will overflow if you say yes to everything.",
      "Write a last-order deadline and a realistic turnaround (for example: 24–48 hours for a small batch).",
      "Do not promise a turnaround you cannot meet.",
      "",
      "Intake each order:",
      "☐ Customer name and preferred contact",
      "☐ Number of gifts by size",
      "☐ Deadline",
      "☐ Color / theme",
      "☐ Customer supplies materials? YES / NO",
      "☐ Pickup, drop-off, or delivery",
      "☐ Special instructions",
      "☐ Quoted total and how they will pay",
      "",
      "Open Google Forms and Google Calendar from the Tools tab for intake and appointments.",
    ].join("\n"),
  },
  {
    title: "Label, Wrap, and Quality-Check Gifts",
    desc: [
      "Keep each customer's gifts clearly labeled and separated from other jobs.",
      "Protect items from damage, moisture, pets, smoke, food, and other hazards.",
      "Document existing damage on valuable or fragile items when appropriate.",
      "Do not open sealed merchandise unless the customer asked you to.",
      "",
      "While wrapping:",
      "☐ Count gifts in and out",
      "☐ Match the agreed paper / theme",
      "☐ Add tags without putting full names or addresses on public displays",
      "☐ Quality-check folds, tape, bows, and tags",
      "",
      "Use scissors safely. Younger helpers need adult supervision.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way people hear about your wrapping service. Pick only 2 or 3 at first.",
      "",
      "Beginner options:",
      "☐ Friends / family referrals",
      "☐ Neighborhood Facebook groups (age-appropriate or adult-managed)",
      "☐ Nextdoor",
      "☐ Community bulletin boards",
      "☐ Local offices / businesses",
      "☐ Holiday / community events",
      "☐ Partnerships with boutiques or gift shops where appropriate",
      "",
      "Write ONE measurable goal per channel.",
      "Examples:",
      "- Tell 10 trusted people this week.",
      "- Post one price-menu photo in one parent-approved group.",
      "- Put a flyer on 2 community boards.",
      "",
      "Protect personal information. Do not post customer addresses.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Photograph 3–6 wrapping examples in daylight on a plain surface. Do not show customer names or addresses.",
      "",
      "Create:",
      "☐ 3–6 example photos",
      "☐ A simple price menu (small / medium / large + add-ons)",
      "☐ Deadline / turnaround note",
      "☐ How to order (parent contact for minors)",
      "☐ Flyer or social graphic",
      "",
      "Sample:",
      "“Gift wrapping for holidays and birthdays. Small $____ · Medium $____ · Large $____. Drop-off by [deadline]. Extra for oversized or awkward items — asked before wrapping.”",
      "",
      "Open Canva from the Tools tab (sign in with Google, or use an account you already have).",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Do the 2–3 channels you chose. Do not wait for a perfect website.",
      "",
      "This week:",
      "☐ Share the price menu with the people on your list",
      "☐ Post or hang the flyer where you said you would",
      "☐ Ask two happy practice customers if they know someone who needs wrapping",
      "",
      "Track each yes, maybe, and no. If nobody replies, change the photo, the deadline, or the channel — not your safety rules.",
      "Younger helpers: a parent/guardian manages accounts and public posts.",
    ].join("\n"),
  },
  {
    title: "Hand Off Gifts and Collect Payment",
    desc: [
      "Verify the gift count with the customer at pickup, delivery, or hand-off.",
      "Use safe meetup practices. Do not publicly post addresses. Younger helpers: adult supervision for transportation and customer meetups.",
      "",
      "Collect the quoted total:",
      "☐ Service charge",
      "☐ Materials charged",
      "☐ Add-ons",
      "☐ Pickup / delivery add-on if used",
      "",
      "Give a simple receipt or text confirmation. Note deposit vs balance.",
      "Protect payment details. Parent-managed payment tools for minors.",
    ].join("\n"),
  },
  {
    title: "Ask for Repeat and Referral Business",
    desc: [
      "After a successful hand-off, ask once:",
      "☐ Would you like me for the next holiday or birthday?",
      "☐ May I remind you before [next holiday]?",
      "☐ Do you know someone else who needs wrapping?",
      "",
      "Save the reminder date in Google Calendar.",
      "Do not pressure. A neat wrap and an on-time deadline earn the next job.",
    ].join("\n"),
  },
  {
    title: "Track Revenue, Profit, and Best-Selling Options",
    desc: [
      "Record:",
      "☐ Gross revenue (service + materials charged + add-ons)",
      "☐ Wrapping paper, ribbon/bows, boxes/bags/tissue, tags/decorations",
      "☐ Travel",
      "☐ Payment fees",
      "☐ Advertising",
      "☐ Other expenses",
      "☐ Estimated profit",
      "☐ Gifts wrapped and jobs completed",
      "☐ Hours worked",
      "☐ Profit per gift, per job, and per hour",
      "",
      "Ask:",
      "What size sold best?",
      "Did premium add-ons pay for themselves?",
      "What should I stock again vs skip?",
      "",
      "Revenue is not profit. Grow from actual demand, not leftover holiday paper.",
    ].join("\n"),
  },
];

export function giftWrappingToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Smartphone Camera + Canva + Google Forms + Google Calendar + Google Sheets.",
    "",
    "Apps belong here. Wrapping paper, ribbon, tape, scissors, bags, and boxes live on the Supply List.",
    "",
    "For younger helpers, a parent/guardian manages accounts, payments, transportation, and meetups. Do not post customer addresses publicly.",
  ].join("\n");
}

/** Gift wrapping profit math. Revenue is not profit. */
export function computeGiftWrappingProfit(input: {
  smallGifts?: number;
  smallGiftPrice?: number;
  mediumGifts?: number;
  mediumGiftPrice?: number;
  largeGifts?: number;
  largeGiftPrice?: number;
  packagesSold?: number;
  packagePrice?: number;
  addOnRevenue?: number;
  pickupDeliveryRevenue?: number;
  wrappingPaper?: number;
  ribbonBows?: number;
  boxesBagsTissue?: number;
  tagsDecorations?: number;
  travel?: number;
  paymentFees?: number;
  advertising?: number;
  otherExpenses?: number;
  laborHours?: number;
  jobsCompleted?: number;
}): {
  smallGiftRevenue: number;
  mediumGiftRevenue: number;
  largeGiftRevenue: number;
  packageRevenue: number;
  addOnRevenue: number;
  pickupDeliveryRevenue: number;
  grossRevenue: number;
  materialCost: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalGifts: number;
  estimatedProfitPerGift: number | null;
  estimatedProfitPerJob: number | null;
  profitPerHour: number | null;
  averageRevenuePerCustomer: number | null;
  materialCostPerGift: number | null;
  holidayEventProfit: number | null;
  profitMarginPercent: number;
} {
  const smallGifts = Math.max(0, Number(input.smallGifts) || 0);
  const mediumGifts = Math.max(0, Number(input.mediumGifts) || 0);
  const largeGifts = Math.max(0, Number(input.largeGifts) || 0);
  const packagesSold = Math.max(0, Number(input.packagesSold) || 0);
  const smallGiftRevenue = smallGifts * Math.max(0, Number(input.smallGiftPrice) || 0);
  const mediumGiftRevenue = mediumGifts * Math.max(0, Number(input.mediumGiftPrice) || 0);
  const largeGiftRevenue = largeGifts * Math.max(0, Number(input.largeGiftPrice) || 0);
  const packageRevenue = packagesSold * Math.max(0, Number(input.packagePrice) || 0);
  const addOnRevenue = Math.max(0, Number(input.addOnRevenue) || 0);
  const pickupDeliveryRevenue = Math.max(0, Number(input.pickupDeliveryRevenue) || 0);
  const wrappingPaper = Math.max(0, Number(input.wrappingPaper) || 0);
  const ribbonBows = Math.max(0, Number(input.ribbonBows) || 0);
  const boxesBagsTissue = Math.max(0, Number(input.boxesBagsTissue) || 0);
  const tagsDecorations = Math.max(0, Number(input.tagsDecorations) || 0);
  const travel = Math.max(0, Number(input.travel) || 0);
  const paymentFees = Math.max(0, Number(input.paymentFees) || 0);
  const advertising = Math.max(0, Number(input.advertising) || 0);
  const otherExpenses = Math.max(0, Number(input.otherExpenses) || 0);
  const hours = Math.max(0, Number(input.laborHours) || 0);
  const jobsCompleted = Math.max(0, Number(input.jobsCompleted) || 0);
  const grossRevenue =
    smallGiftRevenue +
    mediumGiftRevenue +
    largeGiftRevenue +
    packageRevenue +
    addOnRevenue +
    pickupDeliveryRevenue;
  const materialCost = wrappingPaper + ribbonBows + boxesBagsTissue + tagsDecorations;
  const totalExpenses = materialCost + travel + paymentFees + advertising + otherExpenses;
  const estimatedProfit = grossRevenue - totalExpenses;
  const totalGifts = smallGifts + mediumGifts + largeGifts;
  return {
    smallGiftRevenue,
    mediumGiftRevenue,
    largeGiftRevenue,
    packageRevenue,
    addOnRevenue,
    pickupDeliveryRevenue,
    grossRevenue,
    materialCost,
    totalExpenses,
    estimatedProfit,
    totalGifts,
    estimatedProfitPerGift: totalGifts > 0 ? estimatedProfit / totalGifts : null,
    estimatedProfitPerJob: jobsCompleted > 0 ? estimatedProfit / jobsCompleted : null,
    profitPerHour: hours > 0 ? estimatedProfit / hours : null,
    averageRevenuePerCustomer: jobsCompleted > 0 ? grossRevenue / jobsCompleted : null,
    materialCostPerGift: totalGifts > 0 ? materialCost / totalGifts : null,
    holidayEventProfit: packageRevenue > 0 ? packageRevenue : null,
    profitMarginPercent: grossRevenue > 0 ? (estimatedProfit / grossRevenue) * 100 : 0,
  };
}
