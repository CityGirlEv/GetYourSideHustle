/**
 * Errand Runner (`errand-runner`, Guide #005).
 * Short local errands — pickups, returns, shopping, permitted pharmacy runs.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const ERRAND_RUNNER_REALITY_CHECK = {
  title: "KNOW WHAT YOU ARE PICKING UP",
  body: [
    "Not every errand is appropriate for every runner.",
    "",
    "Before accepting an errand, know:",
    "- What you are picking up or returning",
    "- Whether identification or authorization is required",
    "- Who is paying for the merchandise",
    "- Whether the store/pharmacy allows third-party pickup",
    "- Whether the item is age-restricted, controlled, hazardous, or otherwise restricted",
    "- Whether you can transport it safely",
    "",
    "Never misrepresent your identity, use someone else’s ID, sign documents without authorization, or accept restricted errands you are not legally permitted to perform.",
    "",
    "For pharmacy errands, the client should confirm the pharmacy’s current third-party pickup requirements before the trip. Do not provide medical advice or handle medications beyond the authorized pickup/delivery task.",
    "",
    "Tagline: Save Them the Trip. Get Paid for the Run.",
  ].join("\n"),
};

export const ERRAND_RUNNER_NOTES_WORKSHEET = `MY ERRAND RUNNER PLAN

Service Area: __________

Errands I Offer: __________

Errands I Do NOT Offer: __________

Quick Errand Price: $____

Standard Price: $____

Extra Stop: $____

Marketing Channels:
1. ________
2. ________
3. ________

CLIENT JOB

Client: __________
Date: __________
Task: __________
Stops: __________
Budget: $____
Service Fee: $____
Deadline: __________
Substitutions: __________
Special Instructions: __________

JOB RESULTS

Merchandise Total: $____
Service Revenue: $____
Tips: $____
Expenses: $____
Estimated Profit: $____
Hours: ____
Effective Profit Per Hour: $____

Receipt Returned: ☐ Yes
Client Happy: ☐ Yes ☐ Needs Attention
Rebooked: ☐ Yes ☐ Maybe ☐ No

What Worked: __________
What I Will Improve: __________

GYSH PRO TIP
DON’T DRIVE ALL OVER TOWN FOR $10.
The goal is not just MORE errands. The goal is SMARTER errands.
Try to build small routes where clients and stores are near each other.
LESS EMPTY DRIVING + FEWER LONG WAITS + CLEAR FEES + REPEAT CLIENTS = BETTER PROFIT

BEGINNER CHALLENGE
Run ONE practice errand from start to finish.
Use a family member or trusted person.
1. Get the exact request
2. Set a pretend/real service fee
3. Plan the route
4. Complete the errand
5. Keep the receipt
6. Deliver the item
7. Calculate travel cost and profit
8. Record what you learned
Then improve your checklist before taking a paying client.`;

export const ERRAND_RUNNER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Run short local errands for busy neighbors and clients — store pickups, returns, basic shopping, package drop-offs, and permitted pharmacy pickups — then provide clear receipts and completion updates. Tagline: Save Them the Trip. Get Paid for the Run. Category: Local Services / Errands. Best for Adults, Seniors / Retirees; responsible Teens only for age-appropriate errands with parent/guardian approval. Beginner · Very low startup · Flexible · Local / On-Site · Per job / recurring · 2 - 8 hrs/week · Free Guide.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable transportation appropriate to the errands offered · Valid license/insurance if driving · Smartphone · Reliable communication · Maps/navigation · Ability to keep receipts organized · Safe payment/reimbursement process · Basic expense/mileage tracker.",
  },
  {
    id: "before-accepting",
    label: "Before accepting a job, confirm",
    detail:
      "Client name/contact · Store/location · Exact task · Items/order number · Pickup/return authorization · Purchase budget · Who pays for merchandise · Runner fee · Deadline · Delivery location · Receipt requirements · Substitution rules.",
  },
  {
    id: "minors",
    label: "For minors",
    detail:
      "Parent/guardian approval · Age-appropriate errands only · No restricted purchases · No unsafe private meetups · Parent/guardian involvement in transportation/payment where appropriate.",
  },
];

export const ERRAND_RUNNER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Maps", url: "https://maps.google.com/", note: "Plan the route" },
  { label: "Apple Maps", url: "https://maps.apple.com/", note: "Navigation" },
  { label: "Waze", url: "https://www.waze.com/", note: "Traffic and parking" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Job schedule" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Mileage, fees, profit" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Offer and job checklist" },
  { label: "Facebook", url: "https://www.facebook.com/", note: "Local page / groups where permitted" },
  { label: "Nextdoor", url: "https://nextdoor.com/", note: "Neighborhood posts where permitted" },
];

export const ERRAND_RUNNER_SUPPLIES = {
  starterKitTotal: "About $5–25 to start — do not buy expensive equipment before recurring demand",
  items: [
    { id: "phone", name: "Smartphone", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "charger", name: "Charger", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "transport", name: "Transportation", qty: "1", estCost: "$0", notes: "Essential — appropriate to the errands offered" },
    { id: "bags", name: "Reusable bags", qty: "2–4", estCost: "$0–8", notes: "Essential" },
    { id: "receipts", name: "Receipt envelope / folder", qty: "1", estCost: "$1–3", notes: "Essential" },
    { id: "notes", name: "Notes / checklist", qty: "1", estCost: "$0–4", notes: "Essential" },
    { id: "pay", name: "Payment / reimbursement method", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "nav", name: "Navigation app", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "battery", name: "Portable battery", qty: "1", estCost: "$10–25", notes: "Useful", optional: true },
    { id: "insulated", name: "Small insulated bag (appropriate groceries)", qty: "1", estCost: "$8–20", notes: "Useful", optional: true },
    { id: "organizer", name: "Trunk organizer", qty: "1", estCost: "$10–25", notes: "Useful", optional: true },
    { id: "pen", name: "Pen", qty: "1", estCost: "$0–2", notes: "Useful", optional: true },
    { id: "sanitizer", name: "Hand sanitizer", qty: "1", estCost: "$2–5", notes: "Useful", optional: true },
    { id: "umbrella", name: "Umbrella", qty: "1", estCost: "$5–12", notes: "Useful", optional: true },
    { id: "cart", name: "Small cart for suitable errands", qty: "1", estCost: "$15–40", notes: "Useful", optional: true },
    { id: "mileage", name: "Mileage log", qty: "1", estCost: "$0", notes: "Useful — phone/Sheet", optional: true },
  ],
};

export const ERRAND_RUNNER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "er_maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Navigation and multi-stop routes",
    url: "https://maps.google.com/",
  },
  {
    id: "er_apple_maps",
    name: "Apple Maps",
    freePlanAvailable: true,
    costNote: "Navigation",
    url: "https://maps.apple.com/",
    optional: true,
  },
  {
    id: "er_waze",
    name: "Waze",
    freePlanAvailable: true,
    costNote: "Traffic and parking",
    url: "https://www.waze.com/",
    optional: true,
  },
  {
    id: "er_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Job schedule",
    url: "https://calendar.google.com/",
  },
  {
    id: "er_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Mileage, fees, and profit tracker",
    url: "https://sheets.google.com/",
  },
  {
    id: "er_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Offer, flyer copy, and job checklist",
    url: "https://docs.google.com/",
  },
  {
    id: "er_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Job details on your phone",
  },
  {
    id: "er_phone",
    name: "Phone / text / email",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Client communication",
  },
  {
    id: "er_pay",
    name: "Cash / approved payment app / invoice",
    freePlanAvailable: true,
    costNote: "Service fee and reimbursement — merchandise money is not your revenue",
    optional: true,
  },
  {
    id: "er_facebook",
    name: "Facebook",
    freePlanAvailable: true,
    costNote: "Page or community groups where permitted",
    url: "https://www.facebook.com/",
    optional: true,
  },
  {
    id: "er_nextdoor",
    name: "Nextdoor",
    freePlanAvailable: true,
    costNote: "Neighborhood posts where permitted",
    url: "https://nextdoor.com/",
    optional: true,
  },
  {
    id: "er_community",
    name: "Local community groups",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Facebook/community groups where permitted — follow group rules",
    optional: true,
  },
  {
    id: "er_referrals",
    name: "Referrals",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Ask happy clients and trusted neighbors to send the next run",
  },
  {
    id: "er_flyers",
    name: "Flyers / bulletin boards",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Printed flyers where permitted — do not post your home address",
    optional: true,
  },
  {
    id: "er_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Phone + Maps + Notes + Google Sheets + Calendar",
  },
];

export const ERRAND_RUNNER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "ERRAND RUNNER PRICING EXAMPLES",
    "",
    "Displayed range: $10 – $40 / job (examples).",
    "",
    "Quick Local Errand: $10 – $15",
    "One nearby stop, simple pickup/drop-off.",
    "",
    "Standard Errand: $15 – $25",
    "One or two local stops or a more time-consuming task.",
    "",
    "Multi-Stop / Longer Errand: $25 – $40+",
    "Multiple stops, longer distance, heavier time commitment, or more complex approved task.",
    "",
    "Possible add-ons: extra stop · longer distance · parking/tolls · waiting time beyond agreed allowance · rush request.",
    "",
    "IMPORTANT: The cost of the client’s merchandise is NOT your service revenue.",
    "Example: Client gives/reimburses $60 for merchandise. Your errand fee = $20. Your business revenue = $20, not $80.",
    "",
    "Agree before leaving: Service Fee + Stops + Distance/Area + Purchase Budget + Reimbursement Method + Deadline.",
  ].join("\n"),
  raiseTip:
    "After a few repeat clients, raise for extra stops, longer distance, parking/tolls, waiting time, or rush requests. Displayed range: $10 – $40 / job (examples). Examples only — not income guarantees.",
  items: [
    { id: "quick", label: "Quick local errand", price: "$10–$15", notes: "One nearby stop, simple pickup/drop-off" },
    { id: "standard", label: "Standard errand", price: "$15–$25", notes: "One or two local stops or a more time-consuming task" },
    { id: "multi", label: "Multi-stop / longer errand", price: "$25–$40+", notes: "Multiple stops, longer distance, or more complex approved task" },
    { id: "extra-stop", label: "Add-on: Extra stop", price: "Agree in advance" },
    { id: "distance", label: "Add-on: Longer distance", price: "Agree in advance" },
    { id: "parking", label: "Add-on: Parking / tolls", price: "Pass through or add as agreed" },
    { id: "wait", label: "Add-on: Waiting time beyond allowance", price: "Agree in advance" },
    { id: "rush", label: "Add-on: Rush request", price: "Agree in advance" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only. */
export const ERRAND_RUNNER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose the Errands You Will Offer",
    desc: [
      "Start with simple, repeatable errands.",
      "",
      "Examples:",
      "☐ Store pickup",
      "☐ Grocery / basic shopping",
      "☐ Return / exchange drop-off where authorized",
      "☐ Package drop-off",
      "☐ Dry-cleaning pickup / drop-off",
      "☐ Permitted pharmacy pickup",
      "☐ Small local delivery",
      "☐ Basic multi-stop errands",
      "",
      "Write:",
      "I WILL DO: __________",
      "I WILL NOT DO: __________",
      "",
      "Avoid restricted, unsafe, illegal, hazardous, or unusually high-value tasks outside your service boundaries.",
    ].join("\n"),
  },
  {
    title: "Set Your Service Area & Starter Price",
    desc: [
      "Choose a small service area first.",
      "",
      "My Area: __________",
      "Quick Errand Price: $____",
      "Standard Errand Price: $____",
      "Extra Stop: $____",
      "Waiting-Time Rule: __________",
      "Parking/Tolls: __________",
      "",
      "Decide how far you can travel while still making a profit. See Suggested Pricing — $10 – $40 / job (examples).",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way people hear about you.",
      "",
      "Pick only 2 or 3 this month.",
      "",
      "Possible channels:",
      "☐ Friends / family",
      "☐ Referrals",
      "☐ Trusted neighbors",
      "☐ Facebook Page",
      "☐ Nextdoor",
      "☐ Local Facebook / community groups",
      "☐ Senior / community centers where permitted",
      "☐ Apartment / community bulletin boards",
      "☐ Local small-business relationships",
      "☐ Printed flyer",
      "",
      "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have).",
      "",
      "Write:",
      "What I Offer: Local Errand Running",
      "Starting Price: $____",
      "Service Area: ________",
      "",
      "Choose exactly 2 or 3 channels.",
      "Write ONE measurable goal for each.",
      "",
      "Examples:",
      "- Tell 10 trusted neighbors",
      "- Post in 2 approved community groups",
      "- Place 5 approved flyers",
      "- Ask 5 contacts for referrals",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple flyer/message.",
      "",
      "Sample:",
      "",
      "NEED AN ERRAND RUN?",
      "",
      "I help busy local clients with simple errands such as:",
      "- Store pickups",
      "- Returns / drop-offs",
      "- Basic shopping",
      "- Package drop-offs",
      "- Permitted pharmacy pickups",
      "",
      "Starting at $____ per errand.",
      "Service Area: __________",
      "Contact: __________",
      "",
      "Client purchases / reimbursements are separate from the service fee.",
      "",
      "Do not publicly post your home address or unnecessary private information.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, use ONLY the 2 or 3 channels selected.",
      "",
      "Actions:",
      "- Contact 8–12 appropriate warm leads",
      "- Ask for referrals",
      "- Post your approved service message",
      "- Introduce yourself to relevant neighborhood / community contacts",
      "- Follow up promptly",
      "",
      "Sample:",
      "“Hi! I’m offering local errand-running help for busy neighbors. I can handle simple store pickups, returns, shopping, package drop-offs, and other approved local errands. My service starts at $____. Let me know if you’d like help with a run.”",
      "",
      "Track: Date | Person | Channel | Request | Response | Follow-Up",
      "",
      "Do not spam.",
    ].join("\n"),
  },
  {
    title: "Get the Exact Errand Details",
    desc: [
      "Before leaving, confirm:",
      "",
      "Client: __________",
      "Task: __________",
      "Store / Location: __________",
      "Items: __________",
      "Order / Reference Number: __________",
      "Purchase Budget: $____",
      "Who Pays: __________",
      "Substitutions Allowed: ☐ Yes ☐ No",
      "Deadline: __________",
      "Delivery Location: __________",
      "Service Fee: $____",
      "Special Instructions: __________",
      "",
      "For returns / pickups, confirm the client has supplied whatever receipt, barcode, authorization, ID-related information, or order details the business requires.",
    ].join("\n"),
  },
  {
    title: "Plan the Route Before You Go",
    desc: [
      "Use Maps.",
      "",
      "For multiple stops:",
      "- Put stops in a sensible order",
      "- Check opening hours",
      "- Check traffic",
      "- Check parking",
      "- Estimate travel time",
      "- Confirm the final delivery deadline",
      "",
      "Ask: Will this job still be profitable after travel, parking, tolls, and waiting?",
      "",
      "Do not rush or drive unsafely to meet a deadline.",
    ].join("\n"),
  },
  {
    title: "Complete the Errand & Communicate",
    desc: [
      "At the location:",
      "- Follow the client’s written instructions",
      "- Confirm the correct item / order",
      "- Stay within the approved budget",
      "- Ask before making unapproved substitutions",
      "- Keep every receipt",
      "- Protect client information",
      "- Send an update if there is a meaningful delay / problem",
      "",
      "If an item is unavailable: Do not guess. Contact the client.",
      "",
      "For pharmacy pickup: Follow the pharmacy’s current authorization / identification process and the client’s instructions. Do not open medication packages or give medical advice.",
    ].join("\n"),
  },
  {
    title: "Deliver, Return Receipts & Close Out",
    desc: [
      "At delivery:",
      "- Confirm correct client / location",
      "- Deliver items safely",
      "- Provide receipts",
      "- Report substitutions / issues",
      "- Confirm merchandise reimbursement",
      "- Confirm service fee / payment",
      "- Mark job complete",
      "",
      "Sample:",
      "“Your errand is complete. Merchandise total was $____. Receipt is included/sent. My agreed errand fee is $____. Thank you!”",
      "",
      "Never leave sensitive purchases unattended unless the client specifically authorized an appropriate delivery method.",
    ].join("\n"),
  },
  {
    title: "Track Your Real Profit",
    desc: [
      "For every job record:",
      "",
      "Date · Client · Stops · Service Fee · Tips · Miles · Fuel/Travel Cost · Parking/Tolls · Other Business Expenses · Time · Estimated Profit",
      "",
      "Ask:",
      "- Which errands pay best?",
      "- Which areas create too much driving?",
      "- Which stores cause long waits?",
      "- Which clients rebook?",
      "- What time of day works best?",
      "",
      "Do not confuse reimbursement for client purchases with your revenue.",
    ].join("\n"),
  },
  {
    title: "Turn Good Clients Into Recurring Routes",
    desc: [
      "After a successful job, ask:",
      "“Would you like me to help with errands on a regular day each week?”",
      "",
      "Possible recurring clients:",
      "- Busy professionals",
      "- Seniors",
      "- Caregivers",
      "- Parents",
      "- People without convenient transportation",
      "- Small local businesses",
      "",
      "Possible schedule:",
      "Tuesday — 2 neighborhood clients",
      "Thursday — returns / store pickups",
      "Saturday — shopping runs",
      "",
      "GOOD SERVICE → TRUST → REBOOKING → REFERRALS → SMARTER ROUTES → BETTER PROFIT",
    ].join("\n"),
  },
];

export function errandRunnerToolsDisclaimer(): string {
  return "Beginner stack: Phone + Maps + Notes + Google Sheets + Calendar. Client merchandise money is not your earned revenue. For pharmacy pickups, the client confirms third-party pickup rules before you go. Minors: parent/guardian approval, age-appropriate errands only.";
}

/** Weekly errand-runner profit math. Merchandise reimbursements are not revenue. */
export function computeErrandRunnerProfit(input: {
  averageServiceFee: number;
  jobsPerWeek: number;
  tipsExtraPay?: number;
  fuelTravel?: number;
  parkingTolls?: number;
  businessSupplies?: number;
  otherExpenses?: number;
  hoursPerJobIncludingTravel?: number;
}): {
  weeklyServiceRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  weeklyHours: number;
  effectiveProfitPerHour: number | null;
} {
  const fee = Math.max(0, Number(input.averageServiceFee) || 0);
  const jobs = Math.max(0, Number(input.jobsPerWeek) || 0);
  const tips = Math.max(0, Number(input.tipsExtraPay) || 0);
  const weeklyServiceRevenue = fee * jobs + tips;
  const weeklyExpenses =
    Math.max(0, Number(input.fuelTravel) || 0) +
    Math.max(0, Number(input.parkingTolls) || 0) +
    Math.max(0, Number(input.businessSupplies) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const weeklyProfit = weeklyServiceRevenue - weeklyExpenses;
  const hoursPerJob = Math.max(0, Number(input.hoursPerJobIncludingTravel) || 0);
  const weeklyHours = hoursPerJob * jobs;
  return {
    weeklyServiceRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    weeklyHours,
    effectiveProfitPerHour: weeklyHours > 0 ? weeklyProfit / weeklyHours : null,
  };
}
