/**
 * Personal Shopper (`personal-shopper`, Guide #092).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const PERSONAL_SHOPPER_REALITY_CHECK = {
  title: "THE LIST IS THE JOB",
  body: "A great personal shopper doesn't just grab similar items. Follow the client's list carefully, confirm substitutions, stay within budget, keep the receipt, and communicate when something changes.",
};

/** Client planner shown above freeform Notes for this guide. */
export const PERSONAL_SHOPPER_NOTES_WORKSHEET = `Personal Shopper Client Planner

Client Name: ________________
Phone: ________________
Delivery Area: ________________
Preferred Store: ________________
Typical Shopping Day: ________________
Budget: $________

Favorite Brands:
________________________________

Approved Substitutions:
________________________________

DO NOT Substitute:
________________________________

Dietary / Product Preferences:
________________________________

Typical Shopping List:
________________________________
________________________________
________________________________

Delivery Instructions:
________________________________

Shopping Fee: $________
Additional Store Fee: $________

Special Requests:
________________________________

Receipt Sent: Yes / No
Payment Received: Yes / No

Recurring Schedule: Weekly / Biweekly / As Needed

Notes:
________________________________
________________________________

GYSH PRO TIP — RECURRING CLIENTS MAKE THIS HUSTLE BETTER
One $25 shopping job is $25.
A client who wants shopping every Wednesday can become predictable recurring income.
Once you learn their favorite store, brands, substitutions, and routine, the job can also become easier and faster.`;

export const PERSONAL_SHOPPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Shop for groceries, household supplies, gifts, or other requested items using a client's written list, communicate about substitutions, provide receipt photos, and deliver the purchases. Tagline: Their List. Your Shopping Trip. One Less Errand for Them. Category: Errands / Personal Services. Best for adults and seniors / retirees. Beginner · Very low startup · Flexible · Local · Per job / recurring clients.",
  },
  {
    id: "clients",
    label: "Potential clients",
    detail:
      "Busy professionals · Parents · Seniors · Caregivers · People without transportation · Small offices · Vacation rental hosts · Anyone needing occasional shopping help.",
  },
  {
    id: "requirements",
    label: "Basic requirements",
    detail:
      "Reliable transportation · Smartphone · Valid driver's license/insurance if driving · Dependability · Good communication · Attention to detail · Ability to follow a shopping list · Comfortable handling receipts/payments · Ability to carry typical shopping bags.",
  },
  {
    id: "jobs",
    label: "Typical jobs",
    detail:
      "Grocery shopping · Household supplies · Party supplies · Gift shopping · Store pickup · Multiple-store errands · Office snacks/supplies · Last-minute forgotten items.",
  },
  {
    id: "confirm-before",
    label: "Before shopping, confirm",
    detail:
      "Exact list · Preferred brands/sizes · Substitution rules · Store · Budget · Delivery location · Deadline · Shopper fee · How purchases will be funded/reimbursed.",
  },
  {
    id: "money-rules",
    label: "IMPORTANT — money & restricted items",
    detail:
      "Do not use your own money unless reimbursement terms are clearly agreed upon. Keep client purchases and your service fee clearly documented. Do not purchase age-restricted, controlled, or prohibited items unless legally permitted and appropriate for the service. Do NOT count the client's grocery/merchandise reimbursement as shopper income.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — Recurring clients",
    detail:
      "One $25 shopping job is $25. A client who wants shopping every Wednesday can become predictable recurring income — and easier once you know their store, brands, and substitution rules.",
  },
];

export const PERSONAL_SHOPPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Google Maps",
    url: "https://maps.google.com/",
    note: "Plan stores, routes, and deliveries",
  },
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Recurring clients and shopping trips",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Track jobs, fees, mileage, and income",
  },
];

export const PERSONAL_SHOPPER_SUPPLIES = {
  starterKitTotal:
    "About $10–30 for bags and a receipt folder if you already have a phone and ride — do not buy expensive equipment to start",
  items: [
    {
      id: "phone",
      name: "Smartphone",
      qty: "1",
      estCost: "$0",
      notes: "Essential — use what you own",
    },
    {
      id: "charger",
      name: "Car charger",
      qty: "1",
      estCost: "$8–20",
      notes: "Essential",
    },
    {
      id: "bags",
      name: "Reusable shopping bags",
      qty: "2–4",
      estCost: "$5–15",
      notes: "Essential",
    },
    {
      id: "insulated",
      name: "Insulated bag for cold/frozen groceries",
      qty: "1",
      estCost: "$10–25",
      notes: "Essential for grocery jobs",
    },
    {
      id: "receipts",
      name: "Receipt envelope / folder",
      qty: "1",
      estCost: "$2–8",
      notes: "Essential",
    },
    {
      id: "pen",
      name: "Pen",
      qty: "1–2",
      estCost: "$1–3",
      notes: "Essential",
    },
    {
      id: "sanitizer",
      name: "Hand sanitizer",
      qty: "1",
      estCost: "$2–5",
      notes: "Essential",
    },
    {
      id: "battery",
      name: "Portable battery",
      qty: "1",
      estCost: "$15–30",
      optional: true,
      notes: "Helpful",
    },
    {
      id: "cooler",
      name: "Small cooler",
      qty: "1",
      estCost: "$15–35",
      optional: true,
      notes: "Helpful for longer grocery runs",
    },
    {
      id: "cart",
      name: "Folding cart",
      qty: "1",
      estCost: "$25–50",
      optional: true,
      notes: "Helpful for heavy loads",
    },
    {
      id: "trunk",
      name: "Trunk organizer",
      qty: "1",
      estCost: "$15–35",
      optional: true,
      notes: "Helpful",
    },
    {
      id: "mount",
      name: "Phone mount",
      qty: "1",
      estCost: "$10–20",
      optional: true,
      notes: "Helpful for navigation",
    },
  ],
};

export const PERSONAL_SHOPPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "ps_maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Plan stores, routes, and deliveries",
    url: "https://maps.google.com/",
  },
  {
    id: "ps_store",
    name: "Store Apps",
    freePlanAvailable: true,
    costNote:
      "Check item availability, aisle locations, prices, coupons, and pickup information when available (client's preferred store apps)",
  },
  {
    id: "ps_calc",
    name: "Calculator",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Track spending against the client's budget · $0 on your phone",
  },
  {
    id: "ps_notes",
    name: "Notes App",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Keep shopping lists and client instructions · $0 on your phone",
  },
  {
    id: "ps_text",
    name: "Text Messaging",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Ask about substitutions and unavailable items",
  },
  {
    id: "ps_camera",
    name: "Phone Camera",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Send product choices when needed and photograph receipts",
  },
  {
    id: "ps_pay",
    name: "Venmo / Cash App / PayPal",
    freePlanAvailable: true,
    costNote: "Possible payment/reimbursement methods when appropriate and permitted",
    url: "https://venmo.com/",
  },
  {
    id: "ps_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Schedule recurring clients and shopping trips",
    url: "https://calendar.google.com/",
  },
  {
    id: "ps_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Track jobs, fees, mileage/vehicle expenses, and income",
    url: "https://sheets.google.com/",
  },
  {
    id: "ps_stack",
    name: "Beginner Tool Stack + GYSH Rule",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote:
      "1) Written Shopping List · 2) Google Maps · 3) Store App · 4) Text Messaging · 5) Receipt Photo. GYSH RULE: Never guess on an expensive substitution — follow the client's instructions or contact them.",
  },
];

export const PERSONAL_SHOPPER_PRICING = {
  tabLabel: "Simple Shopping Fees",
  intro: [
    "Entry-level examples often start around $10–$40 per job. Larger lists, multiple stores, rush jobs, and longer travel cost more. The client also pays for merchandise separately — do NOT count grocery reimbursement as your income.",
    "",
    "Simple formula: Shopping Fee + Extra Store/Travel Fees + Add-Ons = Client Service Charge. Merchandise cost is separate.",
    "",
    "GYSH tip: Do not charge the same amount for grabbing 5 items at one nearby store as shopping a 40-item list across multiple stores.",
  ].join("\n"),
  raiseTip:
    "After a few happy clients, raise fees for large lists or offer a weekly/biweekly retainer. Examples only — not income guarantees.",
  items: [
    {
      id: "quick",
      label: "QUICK ERRAND — 1 store / small list",
      price: "$10–$20 service fee",
      notes: "Entry-level example",
    },
    {
      id: "standard",
      label: "STANDARD SHOP — 1 store / regular grocery or household list",
      price: "$20–$35 service fee",
      notes: "Common $10–$40/job range",
    },
    {
      id: "larger",
      label: "LARGER SHOP — Large list or longer trip",
      price: "$30–$50+",
      notes: "Price for time and complexity",
    },
    {
      id: "extra-store",
      label: "Add-on: Additional store",
      price: "$10–$20",
    },
    {
      id: "distance",
      label: "Add-on: Long-distance delivery",
      price: "Additional fee",
    },
    {
      id: "rush",
      label: "Add-on: Rush / same-day request",
      price: "Additional fee",
    },
    {
      id: "heavy",
      label: "Add-on: Heavy / bulky items",
      price: "Additional fee",
    },
    {
      id: "gift",
      label: "Add-on: Gift selection / wrapping",
      price: "Additional fee",
    },
  ],
};

/**
 * Core launch steps (exactly 11 playbook steps).
 * Steps 3–4 are the marketing campaign (Create + Execute), tailored to personal shopping.
 * Foundation + closing are applied by finalize.
 */
export const PERSONAL_SHOPPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Decide what shopping/errand services you will offer",
    desc: "Pick your lanes: groceries, household supplies, party supplies, gift shopping, store pickup, multi-store errands, office snacks, or last-minute forgotten items. Stay within what you can carry and legally purchase.",
  },
  {
    title: "Choose your normal service area",
    desc: "Define a clear radius (neighborhoods/ZIP codes) so travel time stays predictable. Note stores you know well inside that area.",
  },
  {
    title: "Create Your Marketing Campaign",
    desc: [
      "Build a simple Personal Shopper campaign before you start cold outreach. Keep the same offer, fee range, and contact on every piece.",
      "",
      "Checklist:",
      "☐ Write your offer in one sentence: “I shop your written list, confirm substitutions, send a receipt photo, and deliver — merchandise is separate.”",
      "☐ Set Quick Errand ($10–$20), Standard Shop ($20–$35), and Larger Shop ($30–$50+) plus add-ons (extra store, rush, distance, heavy items).",
      "☐ Pick only 2–3 channels for this month (do not try every channel at once):",
      "   ☐ Warm contacts (friends, neighbors, seniors, busy families, caregivers, vacation rental hosts, small offices)",
      "   ☐ Local Facebook Page / groups or Nextdoor (neighborhood only — not your street address)",
      "   ☐ A one-page Canva flyer or fee sheet",
      "   ☐ Text / email pitch to people you already know",
      "☐ Open Canva at https://www.canva.com/ — Free plan available — and create a simple flyer/fee sheet with offer, sample fees, service area, and how to book.",
      "☐ Write a 2–4 line phone/text script with offer, fee example, and “reply YES to book.”",
      "☐ Optional: short Facebook About blurb with the same words as your script.",
      "☐ Export PDF + PNG; print a small batch only if it looks good.",
      "☐ Save your campaign notes in Google Docs or your Notes app so you can check them off as you go.",
    ].join("\n"),
  },
  {
    title: "Execute your marketing campaign",
    desc: [
      "This week, only use the 2–3 channels you already picked. Check each box as you go.",
      "",
      "Warm contacts:",
      "☐ Contact 8–12 warm leads — neighbors, friends, seniors, busy parents, caregivers, vacation rental hosts, or small offices.",
      "☐ Send a short message like: “I help with grocery and household shopping from your written list — about $20–$35 for a standard shop (merchandise separate). Reply YES and I’ll book you.”",
      "☐ Keep your full street address off public posts.",
      "",
      "Social / flyers (if you chose them):",
      "☐ Post or hand out your Canva flyer/fee sheet in parent-approved local groups or to warm contacts.",
      "☐ Optional: Facebook Page at https://www.facebook.com/pages/create or Nextdoor at https://nextdoor.com/ — same pitch, clear “Message to book.”",
      "",
      "Track and follow up:",
      "☐ Log each contact in Google Sheets (date, channel, result).",
      "☐ Reply the same day when someone answers.",
      "☐ After the first paid shop, ask for a short review/referral and invite weekly/biweekly recurring shopping.",
      "☐ Refresh your post or message list once a week.",
    ].join("\n"),
  },
  {
    title: "Get the client's written shopping list",
    desc: "Require a written list (text, Notes, or shared doc). The list is the job — do not shop from a vague verbal request alone.",
  },
  {
    title: "Confirm store, brands, substitutions, budget, and payment",
    desc: "Before you leave: store, brands/sizes, quantities, substitution rules, budget, delivery address, deadline, shopper fee, and how purchases will be funded/reimbursed. Do not use your own money unless reimbursement is clearly agreed.",
  },
  {
    title: "Plan the most efficient route",
    desc: "Use Google Maps (and store apps when helpful) to order stores and avoid backtracking. Check hours and parking notes before you go.",
  },
  {
    title: "Shop carefully and check items off the list",
    desc: "Match brands and sizes. Track running spend against the budget with your calculator. Keep cold/frozen items in an insulated bag.",
  },
  {
    title: "Handle unavailable items with substitutions or a quick text",
    desc: "Never guess on an expensive substitution. Follow the client's substitution instructions, or text options with phone-camera photos and wait for a reply before buying.",
  },
  {
    title: "Check the receipt, photograph it, organize purchases, and deliver",
    desc: "Verify the receipt, photograph it for the client, organize bags, and deliver to the agreed address/deadline. Keep receipts in your envelope/folder.",
  },
  {
    title: "Confirm delivery, settle payment, and offer recurring shopping",
    desc: "Confirm delivery, collect/confirm your service fee (and reimbursement if used), record profit in Notes and the Revenue Calculator (service fee only — not merchandise), and ask whether they want weekly or biweekly shopping.",
  },
];

export function personalShopperToolsDisclaimer(): string {
  return [
    "Personal Shopper Tools — list, route, store check, text, receipt photo.",
    "",
    "BEGINNER TOOL STACK",
    "1. Written Shopping List",
    "2. Google Maps",
    "3. Store App",
    "4. Text Messaging",
    "5. Receipt Photo",
    "",
    "GYSH RULE: Never guess on an expensive substitution. If the requested item is unavailable, follow the client's substitution instructions or contact them.",
  ].join("\n");
}
