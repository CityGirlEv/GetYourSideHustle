/**
 * Cleaning Service (`cleaning-service`, Guide #004).
 * Residential cleaning + STR turnovers — not biohazard/mold/pest remediation.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const CLEANING_SERVICE_REALITY_CHECK = {
  title: "DEFINE WHAT “CLEAN” INCLUDES BEFORE YOU QUOTE",
  body: [
    "Cleaning becomes unprofitable when the customer expects unlimited work for one flat price.",
    "",
    "Before every first job confirm:",
    "- Home size",
    "- Bedrooms/bathrooms",
    "- Current condition",
    "- Pets",
    "- Requested service",
    "- Included tasks",
    "- Excluded tasks",
    "- Add-ons",
    "- Estimated time",
    "- Supplies",
    "- Parking/access",
    "- Price",
    "- Payment",
    "- Cancellation/rescheduling expectations",
    "",
    "Use photos/video walkthroughs only with client permission.",
    "",
    "Never mix cleaning chemicals. Follow product labels and ventilation instructions.",
    "Do not accept hazardous-material, mold, pest, crime-scene, or biohazard work unless properly trained, equipped, and authorized.",
    "",
    "Tagline: Clean Homes. Clear Packages. Repeat Clients.",
  ].join("\n"),
};

export const CLEANING_SERVICE_NOTES_WORKSHEET = `BUSINESS SETUP
Service Area: ________
Standard Clean Starting Price: $____
Deep Clean Starting Price: $____
Move-Out Starting Price: $____
STR Turnover Starting Price: $____
Target Labor Rate: $____

CLIENT
Name: ________
Private Address: ________
Contact: ________
Beds/Baths: ________
Pets: ________
Parking: ________
Access: ________
Product Restrictions: ________
Fragile/Special Surfaces: ________

JOB
Service: ________
Included: ________
Excluded: ________
Add-Ons: ________
Quoted Price: $____
Estimated Hours: ____
Actual Hours: ____
Actual Expenses: $____
Profit: $____

STR
Checkout: ________
Next Check-In: ________
Linens: ________
Restock: ________
Damage/Maintenance Reported: ________
Completion Sent: ☐

MARKETING
Channel 1: ________
Channel 2: ________
Channel 3: ________
Contacts: ____
Quotes: ____
Bookings: ____
Recurring Clients: ____

FOLLOW-UP
Next Clean: ________
Weekly/Biweekly: ________
Referral Requested: ☐
Review Requested: ☐
Pricing Adjustment Needed: ________

GYSH PRO TIP
The goal is not to clean the most houses.
The goal is to build a ROUTE of profitable repeat clients.
CLEAR SCOPE → ACCURATE QUOTE → CONSISTENT CHECKLIST → GREAT CLEAN → REBOOK → REFERRAL → DENSER ROUTE.

FREE GUIDE CHALLENGE
Book your first 3 cleaning opportunities:
1. Define 3 service packages.
2. Set starter prices.
3. Build one intake form.
4. Build one room checklist.
5. Choose 2–3 marketing channels.
6. Contact 10 potential clients/referral sources.
7. Quote using estimated hours + costs.
8. Track actual job time.
9. Calculate actual profit.
10. Ask successful clients about recurring service.`;

export const CLEANING_SERVICE_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Start a local residential cleaning side hustle offering clearly scoped standard cleans, deep-clean add-ons, move-out/move-in cleaning, recurring weekly or biweekly slots, and short-term rental turnovers. Tagline: Clean Homes. Clear Packages. Repeat Clients. Category: Home & Local Services / Cleaning. Best for Adults and Seniors/Retirees who can safely do the physical work. Beginner · Low startup · Flexible / Recurring · Client homes / STRs · Per clean / add-ons / recurring clients · Free Guide · 8 - 25 hrs/week · Displayed earnings: $600 – $4,000+ / month (examples, not guarantees).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable transportation/service area plan · Phone · Basic cleaning supplies · Gloves/PPE as appropriate · Comfortable closed-toe/non-slip footwear · Cleaning checklist · Pricing/quote system · Client intake form · Payment method · Calendar · Basic expense tracking.",
  },
  {
    id: "before-job",
    label: "Before accepting a job, ask about",
    detail:
      "Pets · Allergies/sensitivities · Preferred/prohibited products · Fragile/high-value areas · Mold, pests, bodily fluids, needles/sharps, hoarding, biohazards, heavy lifting, unsafe ladders/heights, or other hazardous conditions · Alarm/access instructions · Parking · Who will be present · Short-term rental turnover deadline if applicable.",
  },
  {
    id: "boundaries",
    label: "Do not accept",
    detail:
      "Hazardous-material remediation, pest treatment, mold remediation, crime-scene/biohazard cleanup, unsafe climbing, or professional specialty work unless properly trained, equipped, and authorized. Never mix cleaning chemicals. Follow product labels and ventilation. Do not promise security-deposit outcomes.",
  },
];

export const CLEANING_SERVICE_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Forms", url: "https://forms.google.com/", note: "Client intake / quote request" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Clients, jobs, revenue, expenses" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Checklists / service agreement" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Recurring jobs" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Route planning" },
  { label: "Canva", url: "https://www.canva.com/", note: "Flyer / social graphics" },
  { label: "Weather", url: "https://weather.gov/", note: "Route timing" },
];

export const CLEANING_SERVICE_SUPPLIES = {
  starterKitTotal: "About $40–150 for a portable residential kit (less if you already own a vacuum)",
  items: [
    { id: "microfiber", name: "Microfiber cloths", qty: "1 pack (12)", estCost: "$8–15", notes: "Core" },
    { id: "color-cloths", name: "Color-coded cloth system", qty: "1 set", estCost: "$6–12", notes: "Core — kitchen vs bathroom separation" },
    { id: "gloves", name: "Gloves", qty: "1 box / pair", estCost: "$4–12", notes: "Core" },
    { id: "spray", name: "All-purpose cleaner", qty: "1 bottle", estCost: "$4–10", notes: "Core" },
    { id: "bath", name: "Bathroom cleaner", qty: "1 bottle", estCost: "$4–10", notes: "Core" },
    { id: "glass", name: "Glass cleaner", qty: "1 bottle", estCost: "$3–8", notes: "Core" },
    { id: "disinfectant", name: "Disinfectant (label directions)", qty: "1 bottle", estCost: "$5–12", notes: "Core — follow label dwell time" },
    { id: "degreaser", name: "Degreaser where appropriate", qty: "1 bottle", estCost: "$5–12", notes: "Core" },
    { id: "sponges", name: "Sponges / non-scratch scrubbers", qty: "1 pack", estCost: "$4–8", notes: "Core" },
    { id: "toilet-brush", name: "Toilet brush", qty: "1", estCost: "$4–10", notes: "Core" },
    { id: "duster", name: "Duster", qty: "1", estCost: "$4–10", notes: "Core" },
    { id: "broom", name: "Broom / dustpan", qty: "1 set", estCost: "$8–15", notes: "Core" },
    { id: "mop", name: "Mop / bucket or floor system", qty: "1", estCost: "$15–40", notes: "Core" },
    { id: "vacuum", name: "Vacuum", qty: "1", estCost: "$40–200", notes: "Core" },
    { id: "bags", name: "Trash bags", qty: "1 box", estCost: "$5–10", notes: "Core" },
    { id: "towels", name: "Paper towels / reusable alternatives", qty: "1 pack", estCost: "$4–10", notes: "Core" },
    { id: "caddy", name: "Cleaning caddy", qty: "1", estCost: "$8–18", notes: "Core" },
    { id: "shoe-covers", name: "Shoe covers", qty: "1 pack", estCost: "$5–10", notes: "Optional", optional: true },
    { id: "sanitizer", name: "Hand sanitizer", qty: "1", estCost: "$3–8", notes: "Core" },
    { id: "ext-duster", name: "Extension duster (floor-level use)", qty: "1", estCost: "$8–18", notes: "Helpful", optional: true },
    { id: "grout", name: "Grout brush", qty: "1", estCost: "$4–10", notes: "Helpful", optional: true },
    { id: "scraper", name: "Scraper safe for intended surfaces", qty: "1", estCost: "$5–12", notes: "Helpful", optional: true },
    { id: "magic", name: "Magic-eraser-type sponge (surface-safe)", qty: "1 pack", estCost: "$4–10", notes: "Helpful", optional: true },
    { id: "laundry-bags", name: "Laundry bags", qty: "2+", estCost: "$6–15", notes: "Helpful — STR linens", optional: true },
    { id: "linen-list", name: "Linen checklist", qty: "1", estCost: "$0–5", notes: "Helpful — STR", optional: true },
    { id: "restock", name: "Restock bin for STRs", qty: "1", estCost: "$8–15", notes: "Helpful", optional: true },
    { id: "stool", name: "Small step stool (only when safe)", qty: "1", estCost: "$15–30", notes: "Helpful — no unsafe climbing", optional: true },
  ],
};

export const CLEANING_SERVICE_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "cs_forms",
    name: "Google Forms",
    freePlanAvailable: true,
    costNote: "Client intake and quote request",
    url: "https://forms.google.com/",
  },
  {
    id: "cs_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Clients, jobs, revenue, expenses",
    url: "https://sheets.google.com/",
  },
  {
    id: "cs_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Checklists and service agreement",
    url: "https://docs.google.com/",
  },
  {
    id: "cs_calendar",
    name: "Calendar",
    freePlanAvailable: true,
    costNote: "Recurring jobs",
    url: "https://calendar.google.com/",
  },
  {
    id: "cs_maps",
    name: "Maps",
    freePlanAvailable: true,
    costNote: "Route planning",
    url: "https://maps.google.com/",
  },
  {
    id: "cs_camera",
    name: "Phone Camera",
    freePlanAvailable: true,
    costNote: "Before/after only with permission",
  },
  {
    id: "cs_calc",
    name: "Calculator",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Quotes and profit",
  },
  {
    id: "cs_pay",
    name: "Payment App / Processor",
    freePlanAvailable: true,
    costNote: "Approved business payments",
  },
  {
    id: "cs_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Flyer / social graphics",
    url: "https://www.canva.com/",
  },
  {
    id: "cs_weather",
    name: "Weather / Traffic",
    freePlanAvailable: true,
    costNote: "Route timing",
    url: "https://weather.gov/",
  },
  {
    id: "cs_stack",
    name: "Beginner tool stack",
    freePlanAvailable: true,
    costNote: "Client Intake + Cleaning Checklist + Calendar + Route Map + Job/Profit Tracker",
  },
];

export const CLEANING_SERVICE_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $600 – $4,000+ / month (examples, not guarantees).",
    "Use local market research and actual job time to adjust prices.",
    "",
    "STANDARD CLEAN",
    "Small Home/Apartment: $80 – $130",
    "Medium Home: $120 – $200",
    "Larger Home: $180 – $300+",
    "Typical scope can include kitchen surfaces, bathroom surfaces, dusting accessible surfaces, vacuuming, mopping, trash, basic exterior appliance wipe, and general straighten-up as agreed.",
    "",
    "DEEP CLEAN / FIRST-TIME RESET: approximately $180 – $450+ depending on size/condition/scope.",
    "MOVE-IN / MOVE-OUT: approximately $200 – $600+ depending on size, condition, empty/occupied status, appliances/cabinets, and required detail.",
    "",
    "SHORT-TERM RENTAL TURNOVER",
    "Small Unit: $60 – $100 · Medium Unit: $90 – $160 · Larger Unit: $140 – $250+",
    "Laundry/linen handling, restocking, excessive mess, same-day rushes, or supply shopping may be separate charges.",
    "",
    "RECURRING CLEANING",
    "Weekly: consider approximately 10–20% below comparable one-time standard-clean pricing when repeat condition/scope makes the job faster.",
    "Biweekly: consider approximately 5–15% below comparable one-time pricing.",
    "Do not discount until you know the true recurring workload.",
    "",
    "PRICING FORMULA",
    "Estimated Labor Hours × Target Labor Rate + Supplies + Travel/Parking + Laundry/Restocking + Add-Ons + Business Overhead Allocation = Quote.",
    "Then compare with local market pricing and complexity.",
    "",
    "MONTHLY EXAMPLES (gross revenue is NOT profit)",
    "5 cleans/week × $100 average × 4.33 = $2,165 gross/month",
    "8 cleans/week × $115 average × 4.33 = $3,984 gross/month",
    "Do not guarantee the $600–$4,000+ range. Actual earnings depend on local demand, pricing, job size, hours, cancellations, travel, supplies, taxes, and expenses.",
  ].join("\n"),
  raiseTip:
    "Gross revenue is not profit. Do not guarantee $600–$4,000+/month. After you know true job time, compare quotes to local market and raise or add-on instead of unlimited work for one flat price. Examples only — not income guarantees.",
  items: [
    { id: "std-small", label: "Standard clean — small home/apartment", price: "$80 – $130" },
    { id: "std-med", label: "Standard clean — medium home", price: "$120 – $200" },
    { id: "std-large", label: "Standard clean — larger home", price: "$180 – $300+" },
    { id: "deep", label: "Deep clean / first-time reset", price: "$180 – $450+" },
    { id: "move", label: "Move-in / move-out", price: "$200 – $600+" },
    { id: "str-small", label: "STR turnover — small unit", price: "$60 – $100" },
    { id: "str-med", label: "STR turnover — medium unit", price: "$90 – $160" },
    { id: "str-large", label: "STR turnover — larger unit", price: "$140 – $250+" },
    { id: "weekly", label: "Recurring weekly", price: "About 10–20% below one-time (after you know the workload)" },
    { id: "biweekly", label: "Recurring biweekly", price: "About 5–15% below one-time (after you know the workload)" },
    { id: "fridge", label: "Add-on: inside refrigerator", price: "$25 – $50+" },
    { id: "oven", label: "Add-on: inside oven", price: "$25 – $60+" },
    { id: "cabinets", label: "Add-on: inside cabinets", price: "$30 – $100+" },
    { id: "windows", label: "Add-on: interior windows", price: "$5 – $10+ each or package quote" },
    { id: "baseboards", label: "Add-on: baseboard detail", price: "$25 – $75+" },
    { id: "laundry", label: "Add-on: laundry / linens", price: "$15 – $40+ per load/service" },
    { id: "beds", label: "Add-on: bed / linen reset", price: "$10 – $25+ per bed" },
    { id: "pet", label: "Add-on: heavy pet hair / excessive soil", price: "Quote after assessment" },
    { id: "rush", label: "Add-on: rush / same-day turnover", price: "Optional premium" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only — never ✓. */
export const CLEANING_SERVICE_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Cleaning Services",
    desc: [
      "Start with 2–4 offers:",
      "- Standard Clean",
      "- Deep Clean",
      "- Move-In/Move-Out",
      "- Short-Term Rental Turnover",
      "",
      "Write an INCLUDED and NOT INCLUDED list for each.",
      "",
      "INCLUDED: __________",
      "NOT INCLUDED: __________",
      "",
      "Avoid “I clean everything.”",
    ].join("\n"),
  },
  {
    title: "Build Your Pricing & Quote System",
    desc: [
      "Choose starting prices using the upgraded Suggested Pricing section.",
      "",
      "For every quote capture:",
      "- Home size",
      "- Beds/baths",
      "- Condition",
      "- Service",
      "- Add-ons",
      "- Estimated hours",
      "- Travel",
      "- Supplies",
      "- Special requests",
      "",
      "Create:",
      "Quoted Price: $____",
      "Estimated Hours: ____",
      "Expected Gross per Labor Hour = Quote ÷ Labor Hours.",
      "",
      "After each job compare estimated vs actual time and adjust future quotes.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way people hear about you. Pick only 2 or 3 this month.",
      "",
      "Good cleaning channels:",
      "☐ Friends/family/referrals",
      "☐ Neighborhood Facebook groups",
      "☐ Nextdoor",
      "☐ Facebook business page",
      "☐ Local community boards where permitted",
      "☐ Apartment/condo communities where permitted",
      "☐ Realtors/property managers",
      "☐ Short-term rental hosts",
      "☐ Local networking/community groups",
      "",
      "Write one measurable goal for each.",
      "Examples:",
      "- Ask 10 people for referrals.",
      "- Contact 5 local STR hosts/property managers.",
      "- Post in 2 approved neighborhood groups.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple flyer/post:",
      "",
      "NEED HELP KEEPING YOUR HOME CLEAN?",
      "Standard Cleans · Recurring Slots · Move-Outs · Turnovers",
      "Serving: ________",
      "Starting at: $____",
      "Message for a quote: ________",
      "",
      "Create:",
      "- Short service list",
      "- Starting-price language",
      "- Service area",
      "- Contact method",
      "- 3 reasons to hire you",
      "- Referral message",
      "- Before/after template only for client-approved photos",
      "",
      "Never post a client's address, private home details, access information, or photos without permission.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week use only the 2–3 channels selected.",
      "",
      "Warm outreach: contact 8–12 people/referral sources.",
      "",
      "Sample:",
      "“Hi! I’m opening a few local cleaning slots for standard cleans, recurring service, move-outs, and turnovers. If you or someone you know needs reliable cleaning help, message me for my service list and quote.”",
      "",
      "For STR/property contacts:",
      "“Hi! I provide local turnover cleaning with a room-by-room checklist, linen/restock options, and completion updates. I’m opening a few recurring slots. May I send you my turnover service details?”",
      "",
      "Track:",
      "Date | Prospect | Channel | Service | Response | Follow-Up | Booked.",
    ].join("\n"),
  },
  {
    title: "Complete Client Intake & Confirm the Job",
    desc: [
      "Before arrival confirm:",
      "- Name/contact",
      "- Address privately",
      "- Date/time",
      "- Service",
      "- Home size",
      "- Beds/baths",
      "- Pets",
      "- Parking",
      "- Entry/access",
      "- Alarm",
      "- Products/preferences",
      "- Special surfaces",
      "- Add-ons",
      "- Price",
      "- Payment",
      "- Cancellation/reschedule expectations",
      "",
      "For first/deep/move-out jobs, use walkthrough/photos/video only with permission.",
      "",
      "If the condition is materially different from what was described, pause and discuss revised scope/price before doing substantial extra work.",
    ].join("\n"),
  },
  {
    title: "Prep Supplies & Clean in a System",
    desc: [
      "Prepare supplies before leaving.",
      "",
      "Use a repeatable workflow such as:",
      "1. Walkthrough",
      "2. Declutter only as agreed",
      "3. High-to-low dusting",
      "4. Kitchen",
      "5. Bathrooms",
      "6. Bedrooms/living areas",
      "7. Vacuum",
      "8. Mop",
      "9. Trash",
      "10. Final check",
      "",
      "Prevent cross-contamination with clean cloths/tools and sensible bathroom/kitchen separation.",
      "Follow product labels. Never mix chemicals.",
    ].join("\n"),
  },
  {
    title: "Use a Room-by-Room Quality Checklist",
    desc: [
      "KITCHEN:",
      "- Counters",
      "- Sink/faucet",
      "- Exterior appliances",
      "- Stovetop as included",
      "- Cabinet fronts as included",
      "- Floor",
      "- Trash",
      "",
      "BATHROOM:",
      "- Toilet",
      "- Sink/faucet",
      "- Tub/shower as included",
      "- Mirror",
      "- Accessible surfaces",
      "- Floor",
      "- Trash",
      "",
      "BEDROOM/LIVING:",
      "- Dust",
      "- Accessible surfaces",
      "- Vacuum/floor",
      "- Trash",
      "- Basic straighten-up if included",
      "",
      "Check missed corners, streaks, hair, crumbs, and supplies/tools before leaving.",
    ].join("\n"),
  },
  {
    title: "Handle Move-Outs & STR Turnovers Correctly",
    desc: [
      "MOVE-OUT:",
      "- Confirm whether home is empty.",
      "- Define inside cabinets/appliances/windows/baseboards separately.",
      "- Document pre-existing damage where appropriate.",
      "- Do not promise security-deposit outcomes.",
      "",
      "STR TURNOVER:",
      "- Use a property-specific checklist.",
      "- Confirm checkout/check-in deadline.",
      "- Clean and reset rooms.",
      "- Handle linens only as agreed.",
      "- Restock only approved items/quantities.",
      "- Report damage/missing items — do not accuse guests.",
      "- Send completion notice.",
      "- Never share door/alarm codes.",
      "",
      "Cleaning is not the same as property inspection/maintenance. Report problems rather than making unauthorized repairs.",
    ].join("\n"),
  },
  {
    title: "Get Paid & Track Real Profit",
    desc: [
      "Record:",
      "- Job Revenue",
      "- Tips if applicable",
      "- Supplies",
      "- Fuel/travel",
      "- Parking",
      "- Laundry",
      "- Payment fees",
      "- Advertising",
      "- Other expenses",
      "- Total work time",
      "- Travel/admin time",
      "",
      "Job Profit = Revenue − Job/Allocated Expenses",
      "Effective Profit per Hour = Profit ÷ Total Hours.",
      "",
      "Send receipt/invoice where appropriate.",
      "Do not count client reimbursement for separately purchased supplies as cleaning-service profit without accounting for the corresponding cost.",
    ].join("\n"),
  },
  {
    title: "Turn Good Jobs into Recurring Routes",
    desc: [
      "At the end of a successful job ask:",
      "“Would you like me to reserve a weekly or biweekly cleaning slot?”",
      "",
      "Then:",
      "- Schedule next date",
      "- Save property checklist",
      "- Record product preferences",
      "- Ask for review/referral appropriately",
      "- Group nearby clients",
      "- Track cancellations",
      "- Review pricing every few months",
      "",
      "Best growth pattern:",
      "ONE-TIME CLEAN → GREAT EXPERIENCE → RECURRING SLOT → REFERRAL → DENSER ROUTE.",
    ].join("\n"),
  },
];

export function cleaningServiceToolsDisclaimer(): string {
  return "Beginner stack: Client Intake + Cleaning Checklist + Calendar + Route Map + Job/Profit Tracker. Ask about natural stone, specialty floors, stainless steel, delicate surfaces, allergies, and prohibited products before use. Never mix cleaning chemicals. Photos only with permission. Never share STR door/alarm codes. Cleaning is not biohazard, mold, pest, or crime-scene work.";
}

/** Monthly cleaning-service profit math. Hours are monthly totals. */
export function computeCleaningServiceProfit(input: {
  standardCleansPerWeek: number;
  averageStandardPrice: number;
  specialtyJobsPerMonth?: number;
  averageSpecialtyPrice?: number;
  monthlyAddOnRevenue?: number;
  tipsOtherRevenue?: number;
  supplies?: number;
  fuelTravel?: number;
  parking?: number;
  laundry?: number;
  paymentFees?: number;
  advertising?: number;
  insuranceLicensing?: number;
  otherExpenses?: number;
  cleaningHours?: number;
  travelAdminHours?: number;
}): {
  weeklyStandardRevenue: number;
  monthlyStandardRevenue: number;
  specialtyRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  totalHours: number;
  effectiveProfitPerHour: number | null;
} {
  const cleans = Math.max(0, Number(input.standardCleansPerWeek) || 0);
  const stdPrice = Math.max(0, Number(input.averageStandardPrice) || 0);
  const weeklyStandardRevenue = cleans * stdPrice;
  const monthlyStandardRevenue = weeklyStandardRevenue * 4.33;
  const specialtyRevenue =
    Math.max(0, Number(input.specialtyJobsPerMonth) || 0) *
    Math.max(0, Number(input.averageSpecialtyPrice) || 0);
  const addOns = Math.max(0, Number(input.monthlyAddOnRevenue) || 0);
  const tips = Math.max(0, Number(input.tipsOtherRevenue) || 0);
  const monthlyRevenue = monthlyStandardRevenue + specialtyRevenue + addOns + tips;
  const monthlyExpenses =
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.fuelTravel) || 0) +
    Math.max(0, Number(input.parking) || 0) +
    Math.max(0, Number(input.laundry) || 0) +
    Math.max(0, Number(input.paymentFees) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.insuranceLicensing) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const totalHours =
    Math.max(0, Number(input.cleaningHours) || 0) + Math.max(0, Number(input.travelAdminHours) || 0);
  return {
    weeklyStandardRevenue,
    monthlyStandardRevenue,
    specialtyRevenue,
    monthlyRevenue,
    monthlyExpenses,
    monthlyProfit,
    totalHours,
    effectiveProfitPerHour: totalHours > 0 ? monthlyProfit / totalHours : null,
  };
}
