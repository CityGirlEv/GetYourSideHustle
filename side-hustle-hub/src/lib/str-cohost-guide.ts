/**
 * Airbnb Arbitrage Hosting (`str-cohost`, Guide #029).
 * Lease/master-lease + host only with written permission and legal numbers.
 * Plain data only (no imports from guide-tools).
 */

export const STR_COHOST_REALITY_CHECK = {
  title: "DO NOT SIGN A LEASE UNTIL THE BUSINESS IS LEGAL AND THE NUMBERS WORK",
  body: [
    "Rental arbitrage is NOT simply: Rent apartment → put it on Airbnb → collect profit.",
    "",
    "Before committing money, verify:",
    "- Landlord/property-owner written permission",
    "- Lease/master-lease terms",
    "- Local short-term-rental laws",
    "- Permit/license requirements",
    "- Zoning/use restrictions",
    "- HOA/condo/building rules",
    "- Occupancy limits",
    "- Tax requirements",
    "- Insurance",
    "- Platform eligibility",
    "- Safety requirements",
    "",
    "Rules vary dramatically by location and can change.",
    "Never hide short-term-rental activity from a landlord, building, insurer, government agency, or platform.",
    "",
    "The most exciting number is not the nightly rate. It is: WHAT IS LEFT AFTER EVERYTHING IS PAID?",
    "",
    "LEGAL PERMISSION → CONSERVATIVE NUMBERS → GOOD UNIT → GREAT GUEST EXPERIENCE → TIGHT OPERATIONS → REAL PROFIT → THEN CONSIDER SCALING.",
    "",
    "Tagline: Get Permission. Run the Numbers. Build the Stay. Host Professionally.",
  ].join("\n"),
};

export const STR_COHOST_NOTES_WORKSHEET = `PROPERTY
Address: ________
Owner/Manager: ________
Monthly Rent: $____
Lease Term: ________

PERMISSION
Written STR Permission: Yes / No
Subletting Allowed: Yes / No
Building/HOA Approval: ________
Platforms Allowed: ________

COMPLIANCE
Local STR Legal: ________
Permit Required: ________
Permit #: ________
Tax Registration: ________
Insurance: ________
Occupancy Limit: ________
Parking Rules: ________

MARKET
Expected ADR: $____
Expected Occupancy: ____%
Low Season: ________
High Season: ________
Break-Even Occupancy: ____%

STARTUP
Deposit: $____
Furniture: $____
Housewares: $____
Safety/Tech: $____
Permits: $____
Photography: $____
Other: $____
Total Setup: $____

MONTHLY
Gross Revenue: $____
Total Expenses: $____
Operating Profit: $____
Occupancy: ____%
ADR: $____

OPERATIONS
Cleaner: ________
Laundry: ________
Maintenance: ________
Emergency Contact: ________
Restocking Day: ________

REVIEW
Keep: ________
Improve: ________
Renegotiate: ________
Exit Trigger: ________

GYSH PRO TIP
The most exciting number is NOT the nightly rate.
It is: WHAT IS LEFT AFTER EVERYTHING IS PAID?

ELITE CHALLENGE — evaluate one unit WITHOUT signing a lease:
1. Research local STR legality
2. Check building restrictions
3. Estimate conservative ADR
4. Estimate conservative occupancy
5. Build full expense model
6. Calculate break-even occupancy
7. Run low-demand stress test
8. Estimate startup capital
9. Draft landlord pitch
10. List written permissions needed
11. Research insurance
12. Research permits/taxes
13. Build furnishing budget
14. Build operations checklist
15. Make GO / VERIFY / NO-GO decision
`;

export const STR_COHOST_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Operate a short-term rental without owning the property by leasing or master-leasing a unit, furnishing it, and hosting guests only when the property owner, lease, building/HOA rules, insurance requirements, platform rules, and applicable local laws allow it. Tagline: Get Permission. Run the Numbers. Build the Stay. Host Professionally. Category: Short-Term Rentals / Hospitality / Real Estate Business. Best for Adults, Seniors/Retirees. Intermediate–Advanced · Moderate–High startup · 10 - 25 hrs/week · Property-based / local + online · Elite Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Legal adult able to enter contracts · Startup capital · Strong credit/income qualifications where required · Written landlord/property-owner permission · Legal/regulatory research · Lease/master-lease review · Insurance research · Business budget · Market research · Furnishing plan · Cleaning/turnover plan · Guest communication system · Emergency/maintenance plan · Reserve fund.",
  },
  {
    id: "before-signing",
    label: "Before signing, write down",
    detail:
      "Property Address · Monthly Rent · Security Deposit · Utilities · Internet · Parking · Insurance · Furniture/Setup · Permit/License · Cleaning Cost · Platform/Payment Fees · Estimated Occupancy · Estimated Average Nightly Rate · Break-Even Occupancy. Have an appropriate local attorney, tax professional, insurance professional, or licensing authority review questions when needed.",
  },
];

export const STR_COHOST_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Airbnb Host", url: "https://www.airbnb.com/host/homes", note: "Booking platform — verify current host rules" },
  { label: "AirDNA", url: "https://www.airdna.co/", note: "Market occupancy and rate research" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Neighborhood, parking, comps" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Unit economics and monthly review" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Availability and turnovers" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "House manual and permission records" },
];

export const STR_COHOST_SUPPLIES = {
  starterKitTotal:
    "Furniture/setup often $2,000–$8,000+ plus linens $500–$2,000+, safety/tech $200–$800+, photography $150–$500+, and a reserve of multiple months of fixed costs. Do not buy furniture until written permission and numbers work.",
  items: [
    { id: "lease", name: "Lease / master-lease agreement", qty: "1", estCost: "$0", notes: "Essential — signed copy" },
    { id: "permission", name: "Written STR / subletting permission", qty: "1", estCost: "$0", notes: "Essential — never rely on a verbal OK" },
    { id: "permit", name: "Local permit / license documents", qty: "1 set", estCost: "Location-dependent", notes: "Essential where required" },
    { id: "insurance", name: "Insurance appropriate for the activity", qty: "1", estCost: "Market-dependent", notes: "Essential — platform coverage is not automatically a substitute" },
    { id: "records", name: "Business records binder / folder", qty: "1", estCost: "$5–15", notes: "Essential" },
    { id: "furniture", name: "Furniture (durable, easy to clean)", qty: "1 set", estCost: "$2,000–$8,000+", notes: "Essential after permission" },
    { id: "bed", name: "Mattress / bed frame", qty: "1+", estCost: "$300–$1,200+", notes: "Essential" },
    { id: "linens", name: "Linens", qty: "2–3 sets", estCost: "$150–$600", notes: "Essential" },
    { id: "towels", name: "Towels", qty: "2–3 sets", estCost: "$40–$150", notes: "Essential" },
    { id: "kitchen", name: "Kitchen basics", qty: "1 set", estCost: "$100–$400", notes: "Essential" },
    { id: "cleaning", name: "Cleaning supplies", qty: "1 kit", estCost: "$40–$120", notes: "Essential" },
    { id: "consumables", name: "Guest consumables", qty: "1 kit", estCost: "$30–$80", notes: "Essential" },
    { id: "alarms", name: "Smoke / CO alarms as required", qty: "as required", estCost: "$20–$80", notes: "Essential — follow local/platform rules" },
    { id: "safety", name: "Fire / safety equipment as required", qty: "1 kit", estCost: "$25–$80", notes: "Essential" },
    { id: "firstaid", name: "First-aid supplies", qty: "1", estCost: "$10–$25", notes: "Essential" },
    { id: "lock", name: "Smart lock / secure access", qty: "1", estCost: "$80–$250", notes: "Essential" },
    { id: "wifi", name: "Wi-Fi", qty: "1", estCost: "Monthly", notes: "Essential" },
    { id: "manual", name: "House manual", qty: "1", estCost: "$0–8", notes: "Essential" },
    { id: "emergency", name: "Emergency contacts list", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "maint", name: "Maintenance contacts list", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "cleaner", name: "Cleaning team / turnover plan", qty: "1", estCost: "Per turn", notes: "Essential" },
    { id: "laundry", name: "Laundry solution", qty: "1", estCost: "Market-dependent", notes: "Essential" },
    { id: "inventory", name: "Inventory checklist", qty: "1", estCost: "$0–4", notes: "Essential" },
    { id: "photo-inv", name: "Photo / video inventory documentation", qty: "1 set", estCost: "$0", notes: "Essential" },
    { id: "noise", name: "Noise-monitoring device", qty: "1", estCost: "$50–$200", notes: "Optional — only where lawful, disclosed, privacy-respecting, and platform-compliant", optional: true },
    { id: "pms", name: "Property-management software", qty: "1", estCost: "$0–$50+/mo", notes: "Optional", optional: true },
    { id: "dynamic", name: "Dynamic pricing tool", qty: "1", estCost: "Varies", notes: "Optional — review recommendations; do not follow blindly", optional: true },
    { id: "auto-msg", name: "Automated messaging", qty: "1", estCost: "$0+", notes: "Optional", optional: true },
    { id: "photos", name: "Professional photography", qty: "1", estCost: "$150–$500+", notes: "Optional", optional: true },
  ],
};

export const STR_COHOST_PRICING = {
  tabLabel: "Earnings & Unit Economics",
  intro: [
    "MARKET-DEPENDENT — EXAMPLES ONLY, NOT GUARANTEES.",
    "",
    "Do not invent a fixed monthly income range. Hosts generally set nightly rates rather than charging clients a project fee.",
    "",
    "START WITH UNIT ECONOMICS",
    "",
    "Monthly Gross Booking Revenue = Booked Nights × Average Nightly Revenue + Eligible Additional Guest/Other Host Revenue.",
    "Do NOT count refundable guest deposits as revenue.",
    "",
    "Monthly Operating Profit = Gross Booking Revenue − Rent − Utilities − Internet − Insurance − Cleaning Cost Paid by Host − Platform/Payment Fees − Supplies − Laundry − Maintenance Reserve − Permit/License Allocation − Software − Parking − Other Operating Costs.",
    "",
    "BREAK-EVEN OCCUPANCY",
    "Monthly Fixed Costs ÷ Estimated Net Revenue per Occupied Night = Approximate Break-Even Booked Nights.",
    "Then: Break-Even Nights ÷ Available Nights = Approximate Break-Even Occupancy %.",
    "",
    "SAMPLE ONLY (illustration, not a promise):",
    "Rent $1,800 + Utilities/Internet $300 + Insurance/Software/Other Fixed $150 = $2,250 fixed.",
    "Assume $150 average nightly booking revenue and $35 variable cost per occupied night → $115 contribution per booked night.",
    "$2,250 ÷ $115 ≈ 20 booked nights. 20 ÷ 30 ≈ 67% approximate break-even occupancy.",
    "",
    "STARTUP BUDGET EXAMPLES",
    "Deposit/move-in: market-dependent",
    "Furniture: $2,000–$8,000+",
    "Linens/kitchen/housewares: $500–$2,000+",
    "Smart lock/safety/tech: $200–$800+",
    "Photography: $150–$500+",
    "Permits/licenses: location-dependent",
    "Initial supplies: $150–$500+",
    "Reserve fund: ideally multiple months of fixed expenses",
    "",
    "Do not use credit/debt simply because projected revenue looks attractive. Stress-test the unit at lower occupancy and lower nightly rates.",
  ].join("\n"),
  raiseTip:
    "Do not add a second unit because the first month was strong. Require several months of evidence, adequate reserves, compliant operations, and a repeatable cleaning/guest system before scaling. Examples only — not income guarantees.",
  items: [
    { id: "market", label: "Displayed earning potential", price: "Market-dependent", notes: "Examples only — not guarantees. No fixed monthly income range." },
    { id: "nightly", label: "Nightly rate", price: "Set from legal comps", notes: "Not a client project fee" },
    { id: "be", label: "Break-even occupancy (sample only)", price: "~67% in the $2,250 / $115 illustration", notes: "Illustration only" },
    { id: "furniture", label: "Furniture / setup (startup)", price: "$2,000–$8,000+", notes: "After written permission" },
    { id: "housewares", label: "Linens / kitchen / housewares", price: "$500–$2,000+" },
    { id: "tech", label: "Smart lock / safety / tech", price: "$200–$800+" },
    { id: "photos", label: "Photography", price: "$150–$500+" },
  ],
};

export const STR_COHOST_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "str_airbnb",
    name: "Airbnb and/or other permitted booking platforms",
    freePlanAvailable: true,
    costNote: "Platform fees, host rules, cancellation options, safety rules, surveillance/device policies, and taxes change — verify CURRENT requirements before launch and periodically afterward",
    url: "https://www.airbnb.com/host/homes",
  },
  {
    id: "str_gov",
    name: "Local government STR / licensing resources",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "City/county STR, permit, tax, occupancy, and inspection pages for YOUR address — not a generic blog post",
  },
  {
    id: "str_maps",
    name: "Maps",
    freePlanAvailable: true,
    costNote: "Neighborhood, parking, hospitals, airports, attractions",
    url: "https://maps.google.com/",
  },
  {
    id: "str_sheets",
    name: "Spreadsheet",
    freePlanAvailable: true,
    costNote: "Unit economics, occupancy, break-even, monthly KEEP / IMPROVE / RENEGOTIATE / EXIT review",
    url: "https://sheets.google.com/",
  },
  {
    id: "str_cal",
    name: "Calendar",
    freePlanAvailable: true,
    costNote: "Availability, turns, restocking",
    url: "https://calendar.google.com/",
  },
  {
    id: "str_airdna",
    name: "Market research tools",
    freePlanAvailable: true,
    costNote: "Comps, seasonality, weekday/weekend patterns — do not treat competitor calendar gaps as confirmed bookings",
    url: "https://www.airdna.co/",
  },
  {
    id: "str_pricing",
    name: "Pricing / revenue research tools",
    freePlanAvailable: true,
    costNote: "Review recommendations. Do not automatically follow a dynamic-pricing tool.",
    optional: true,
  },
  {
    id: "str_pms",
    name: "Property-management software",
    freePlanAvailable: true,
    costNote: "Optional calendar/messaging/ops",
    optional: true,
  },
  {
    id: "str_lock",
    name: "Smart lock",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Secure access — follow platform and local device rules",
  },
  {
    id: "str_clean",
    name: "Cleaning checklist",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Turnover quality and restocking levels",
  },
  {
    id: "str_inv",
    name: "Inventory tracker",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Photo/video inventory plus restock list",
  },
  {
    id: "str_books",
    name: "Accounting / bookkeeping tool",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Gross booking revenue vs operating profit — deposits are not revenue",
  },
  {
    id: "str_msg",
    name: "Messaging templates",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Check-in, house rules, emergencies — never retaliate against a guest for a legitimate safety or maintenance concern",
  },
  {
    id: "str_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote:
      "Written Permission + Local STR Rules + Unit-Economics Spreadsheet + Booking Platform + Cleaning/Turnover Checklist + House Manual",
  },
];

export function strCohostToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Written Permission + Local STR Rules + Unit-Economics Spreadsheet + Booking Platform + Cleaning/Turnover Checklist + House Manual.",
    "",
    "Platform fees, host rules, cancellation options, safety rules, surveillance/device policies, taxes, and local STR laws change. Verify CURRENT requirements before launch and periodically afterward.",
    "",
    "Never place prohibited surveillance devices in guest areas. Follow current platform rules and applicable law.",
    "",
    "This business is marketed primarily through booking-platform listing optimization — not generic service-business flyers.",
  ].join("\n");
}

/** Exactly 11 authored core steps. Listing optimization instead of generic 3-stage marketing. No ✓. */
export const STR_COHOST_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose a Market & Research Legality",
    desc: [
      "Before looking for units, research:",
      "☐ STR legality",
      "☐ Minimum stays",
      "☐ Permit caps",
      "☐ Owner-occupancy rules",
      "☐ Zoning",
      "☐ Rental restrictions",
      "☐ Building restrictions",
      "☐ Occupancy",
      "☐ Parking",
      "☐ Taxes",
      "☐ Inspection / safety requirements",
      "",
      "Classify the market:",
      "- ALLOWED",
      "- ALLOWED WITH CONDITIONS",
      "- UNCLEAR — VERIFY",
      "- NOT SUITABLE",
      "",
      "Do not build a business around violating a local restriction.",
    ].join("\n"),
  },
  {
    title: "Research Demand & Seasonality",
    desc: [
      "Study:",
      "- Hotels",
      "- Tourism",
      "- Business travel",
      "- Hospitals",
      "- Universities",
      "- Events",
      "- Convention centers",
      "- Airports",
      "- Beaches / attractions",
      "- Seasonality",
      "- Weekday / weekend patterns",
      "- Comparable legal STR listings",
      "",
      "Estimate conservatively: Average Nightly Rate · Occupancy · Low Season · High Season · Cleaning frequency · Length of stay.",
      "",
      "Do not treat competitor calendar gaps as confirmed bookings.",
    ].join("\n"),
  },
  {
    title: "Build the Unit-Economics Model",
    desc: [
      "Enter: Rent · Utilities · Internet · Insurance · Parking · Permits · Software · Cleaning · Laundry · Supplies · Maintenance · Platform fees · Expected nightly rate · Expected occupancy.",
      "",
      "Run: Conservative · Expected · Strong.",
      "",
      "Stress test:",
      "- Nightly rate −15%",
      "- Occupancy −20%",
      "- Unexpected repair",
      "- One month of weak bookings",
      "",
      "If the deal only works in the strongest scenario, reconsider it.",
      "",
      `Use the Revenue Calculator tab and a Google Sheet from the Tools tab.`,
    ].join("\n"),
  },
  {
    title: "Find STR-Friendly Property Owners",
    desc: [
      "Potential approaches:",
      "- STR-friendly apartment operators",
      "- Independent landlords",
      "- Property managers",
      "- Owners with furnished-rental experience",
      "- Corporate-housing-friendly properties",
      "",
      "Be transparent.",
      "",
      "Sample:",
      "“I’m interested in leasing the unit for a professionally managed furnished short-term/mid-term rental business. I would need the activity expressly permitted in writing, and I would comply with applicable licensing, insurance, occupancy, guest, and building requirements.”",
      "",
      "Never secretly list a property.",
    ].join("\n"),
  },
  {
    title: "Get Written Permission & Review the Agreement",
    desc: [
      "The written agreement should clearly address, as appropriate:",
      "- Short-term rental / subletting permission",
      "- Permitted platforms / use",
      "- Guest stays",
      "- Occupancy",
      "- Term",
      "- Rent",
      "- Deposits",
      "- Insurance",
      "- Utilities",
      "- Damage",
      "- Maintenance",
      "- Access",
      "- Building rules",
      "- Termination",
      "- Default",
      "- Renewal",
      "",
      "Do not rely on “the landlord said it was okay” if the written lease prohibits it.",
      "Seek legal review when appropriate.",
    ].join("\n"),
  },
  {
    title: "Complete Licenses, Insurance & Business Setup",
    desc: [
      "Before accepting guests:",
      "☐ Required STR permit / license",
      "☐ Business registration if required",
      "☐ Tax registration if required",
      "☐ Insurance appropriate for the activity",
      "☐ Building / HOA approval if required",
      "☐ Safety inspection if required",
      "☐ Emergency contacts",
      "☐ Bookkeeping system",
      "",
      "Platform protections are not automatically a substitute for your own appropriate insurance.",
    ].join("\n"),
  },
  {
    title: "Furnish & Create the Guest Experience",
    desc: [
      "Prioritize: Comfortable bed · Clean linens · Functional kitchen · Reliable Wi-Fi · Lighting · Workspace if the market needs it · Storage · Safety · Simple decor · Durable furniture · Easy cleaning.",
      "",
      "Create:",
      "- Inventory",
      "- Cleaning checklist",
      "- Turnover checklist",
      "- House manual",
      "- Emergency instructions",
      "- Restocking levels",
      "",
      "Avoid overspending on decor that does not improve guest experience or revenue.",
    ].join("\n"),
  },
  {
    title: "Create the Listing & Launch Materials",
    desc: [
      "This business is primarily marketed through booking platforms. Use listing optimization rather than the standard 3-stage service-business marketing sequence.",
      "",
      "Create:",
      "- Accurate title",
      "- Accurate description",
      "- High-quality photos",
      "- Amenity list",
      "- House rules",
      "- Check-in instructions",
      "- Neighborhood information",
      "- Parking information",
      "- Accurate sleeping arrangements",
      "",
      "Never:",
      "- Use misleading photos",
      "- Hide major limitations",
      "- Claim amenities that do not exist",
      "- Copy another host’s listing / photos",
      "- Use discriminatory language",
    ].join("\n"),
  },
  {
    title: "Set Nightly Pricing & Availability",
    desc: [
      "Set: Base rate · Weekend strategy · Seasonal strategy · Event strategy · Minimum stay · Cleaning charge where permitted · Discounts where appropriate · Availability.",
      "",
      "Review actual booking pace.",
      "Do not automatically follow a dynamic-pricing tool without reviewing its recommendations.",
      "",
      "Track: Available Nights · Booked Nights · Average Nightly Revenue · Occupancy · Revenue per Available Night · Cancellation patterns.",
    ].join("\n"),
  },
  {
    title: "Operate Guests, Cleaning & Maintenance",
    desc: [
      "Build systems for:",
      "- Guest screening within lawful / platform rules",
      "- Check-in",
      "- Messages",
      "- Cleaning",
      "- Laundry",
      "- Restocking",
      "- Maintenance",
      "- Lockouts",
      "- Noise complaints",
      "- Emergencies",
      "- Damage documentation",
      "- Checkout",
      "",
      "Respond promptly.",
      "Follow fair-housing / anti-discrimination laws and platform nondiscrimination requirements.",
      "Never retaliate against a guest for raising a legitimate safety or maintenance concern.",
    ].join("\n"),
  },
  {
    title: "Review Profit & Decide Whether to Scale",
    desc: [
      "Every month calculate: Gross Booking Revenue · Booked Nights · Occupancy · Average Nightly Revenue · Rent · Cleaning · Utilities · Platform Fees · Supplies · Maintenance · Insurance · Other Expenses · Operating Profit · Cash Reserve.",
      "",
      "Then classify: KEEP · IMPROVE · RENEGOTIATE · EXIT.",
      "",
      "Do NOT add a second unit simply because the first month was strong.",
      "Require several months of evidence, adequate reserves, compliant operations, and a repeatable cleaning/guest system before scaling.",
    ].join("\n"),
  },
];

/** Monthly operating-profit math. Refundable guest deposits are not revenue. */
export function computeStrCohostProfit(input: {
  availableNights?: number;
  bookedNights?: number;
  avgNightlyRevenue?: number;
  otherHostRevenue?: number;
  rent?: number;
  utilities?: number;
  internet?: number;
  insurance?: number;
  cleaningPaidByHost?: number;
  laundry?: number;
  platformFees?: number;
  supplies?: number;
  maintenance?: number;
  permitAllocation?: number;
  software?: number;
  parking?: number;
  otherExpenses?: number;
  initialSetupInvestment?: number;
}): {
  grossBookingRevenue: number;
  occupancyPercent: number | null;
  monthlyExpenses: number;
  operatingProfit: number;
  operatingMarginPercent: number | null;
  monthsToRecoverSetup: number | null;
} {
  const available = Math.max(0, Number(input.availableNights) || 0);
  const booked = Math.max(0, Number(input.bookedNights) || 0);
  const adr = Math.max(0, Number(input.avgNightlyRevenue) || 0);
  const other = Math.max(0, Number(input.otherHostRevenue) || 0);
  const grossBookingRevenue = booked * adr + other;
  const monthlyExpenses =
    Math.max(0, Number(input.rent) || 0) +
    Math.max(0, Number(input.utilities) || 0) +
    Math.max(0, Number(input.internet) || 0) +
    Math.max(0, Number(input.insurance) || 0) +
    Math.max(0, Number(input.cleaningPaidByHost) || 0) +
    Math.max(0, Number(input.laundry) || 0) +
    Math.max(0, Number(input.platformFees) || 0) +
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.maintenance) || 0) +
    Math.max(0, Number(input.permitAllocation) || 0) +
    Math.max(0, Number(input.software) || 0) +
    Math.max(0, Number(input.parking) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const operatingProfit = grossBookingRevenue - monthlyExpenses;
  const setup = Math.max(0, Number(input.initialSetupInvestment) || 0);
  return {
    grossBookingRevenue,
    occupancyPercent: available > 0 ? (booked / available) * 100 : null,
    monthlyExpenses,
    operatingProfit,
    operatingMarginPercent: grossBookingRevenue > 0 ? (operatingProfit / grossBookingRevenue) * 100 : null,
    monthsToRecoverSetup: operatingProfit > 0 && setup > 0 ? setup / operatingProfit : null,
  };
}
