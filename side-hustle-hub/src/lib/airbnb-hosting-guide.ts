/**
 * Airbnb Hosting (`airbnb`, Guide #031).
 * Own/lawful-authority STR only. Non-owners → Arbitrage / Co-Host.
 * Plain data only.
 */

export const AIRBNB_HOSTING_REALITY_CHECK = {
  title: "LEGAL FIRST — GROSS IS NOT CASH FLOW OR PROFIT",
  body: [
    "This guide is for operating a short-term rental you own or otherwise have lawful authority to operate.",
    "If you do not own the property, use the GYSH Airbnb Arbitrage Hosting or Airbnb Co-Host path instead. Do not mix those models into this guide.",
    "",
    "If the property cannot legally or contractually be used as a short-term rental, do not proceed.",
    "",
    "GROSS BOOKING REVENUE = Booked Nights × Average Nightly Revenue (ADR) + other legitimate host revenue.",
    "OPERATING PROFIT = Gross − operating expenses (including a mortgage/rent allocation if you use one).",
    "CASH FLOW is different: track the full monthly housing cash payment separately. Do not treat principal the same as a simple operating expense.",
    "",
    "$1,500–$8,000/month displayed figures are examples only, not guarantees. Results depend on market, property, seasonality, occupancy, rate, expenses, local rules, and operations.",
    "",
    "Verify city/county/state STR rules, zoning, permits, HOA/condo rules, mortgage/lease restrictions, occupancy limits, lodging tax, insurance, and current Airbnb host policies.",
    "Use required smoke/CO/fire safety. No undisclosed surveillance. Protect guest privacy. Do not discriminate against protected guests.",
    "Do not invent laws. Rules and platform terms change — check current official sources.",
    "",
    "Tagline: Legal Stay. Honest Listing. Real Numbers.",
  ].join("\n"),
};

export const AIRBNB_HOSTING_NOTES_WORKSHEET = `MY AIRBNB HOSTING PLAN

PROPERTY
Property: ________
City / Market: ________
Property Type: ________
Bedrooms: ____  Bathrooms: ____
Guest Capacity: ____
Ownership / Authority Confirmed: ☐

COMPLIANCE
STR Allowed: Y / N
Permit / Registration: ________
HOA / Building Checked: ☐
Insurance Checked: ☐
Tax Requirements Checked: ☐
Occupancy Limit: ________
Renewal Dates: ________

MARKET
Comparable Listings: ________
Typical Nightly Range: $____
Seasonality: ________
Peak Dates: ________
Weak Dates: ________
Target Guest: ________

LISTING
Listing Title: ________
Photo Date: ________
Amenities: ________
House Rules: ________
Check-In: ________
Check-Out: ________
Parking: ________
Access Method: ________

PRICING
Base Nightly Rate: $____
Weekend Rate: $____
Peak / Event Rate: $____
Minimum Stay: ____
Discounts: ________
Cleaning Setup: ________
Pricing Review Date: ________

OPERATIONS
Cleaner: ________
Backup Cleaner: ________
Laundry: ________
Restocking: ________
Maintenance Contact: ________
Emergency Contact: ________
Turnover Checklist: ☐
Inspection Checklist: ☐

MONTHLY RESULTS
Available Nights: ____
Booked Nights: ____
Occupancy: ____%
ADR: $____
Gross Booking Revenue: $____
Operating Expenses: $____
Estimated Operating Profit: $____
Housing Cash Payment: $____
Cash Flow: $____
Guest Rating: ________
Issues / Repairs: ________

NEXT ACTION
Pricing Change: ________
Listing Change: ________
Amenity Change: ________
Maintenance: ________
Guest Feedback to Address: ________
Next Review Date: ________
`;

export const AIRBNB_HOSTING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Host guests on Airbnb — own the space, or pair with Arbitrage Hosting / Co-Host if you want to host without owning. 2 - 4 weeks to launch. $1,500 - $8,000 / month is examples only, not a guarantee.",
  },
  {
    id: "authority",
    label: "Lawful authority to host",
    detail:
      "Own the unit or have documented legal authority. If you do not own it, stop this guide and use Airbnb Arbitrage Hosting or Airbnb Co-Host.",
  },
  {
    id: "rules",
    label: "STR rules, HOA, insurance, and tax",
    detail:
      "Verify current local STR rules, permits/registration, HOA/building rules, occupancy limits, lodging tax, and appropriate insurance before listing. Do not invent a universal rule.",
  },
];

export const AIRBNB_HOSTING_EXTERNAL_LINKS: { label: string; url: string; note?: string }[] = [
  { label: "Airbnb Host", url: "https://www.airbnb.com/host/homes", note: "Host dashboard / listing" },
  { label: "AirDNA", url: "https://www.airdna.co/", note: "Market occupancy and comparable rates — verify current terms" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Revenue, expenses, occupancy, profit vs cash flow" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Turnovers and blocks" },
];

export const AIRBNB_HOSTING_SUPPLIES = {
  starterKitTotal:
    "Guest essentials and safety gear vary widely — furnish from comps. Do not buy expensive amenities before unit economics work.",
  items: [
    { id: "linens", name: "Quality bedding / linens + pillows", qty: "1 set + spare", estCost: "Market-dependent", notes: "Guest essentials" },
    { id: "towels", name: "Towels + spare set", qty: "1 + spare", estCost: "Market-dependent", notes: "Guest essentials" },
    { id: "tp", name: "Toilet paper, soap, basic toiletries, trash bags", qty: "starter stock", estCost: "$20–40", notes: "Guest essentials" },
    { id: "kitchen", name: "Kitchen basics where applicable", qty: "1 set", estCost: "Market-dependent", notes: "Match the listing" },
    { id: "clean", name: "Cleaning supplies + laundry supplies", qty: "starter", estCost: "$15–30", notes: "Operations" },
    { id: "access", name: "Secure guest-access method + backup plan", qty: "1", estCost: "Quoted", notes: "Operations" },
    { id: "maint", name: "Basic maintenance + replacement bulbs / batteries", qty: "starter", estCost: "$10–25", notes: "Operations" },
    { id: "smoke", name: "Smoke alarms + CO alarms where applicable", qty: "as required", estCost: "$20–50", notes: "Safety — follow current local/platform rules" },
    { id: "ext", name: "Fire extinguisher where appropriate / required", qty: "1", estCost: "$15–30", notes: "Safety" },
    { id: "firstaid", name: "First-aid kit + emergency information", qty: "1", estCost: "$10–20", notes: "Safety" },
    { id: "xp", name: "Optional coffee/tea, luggage rack, local guide, charging", qty: "as comps justify", estCost: "Optional", notes: "Do not buy before demand/numbers work", optional: true },
  ],
};

export const AIRBNB_HOSTING_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "airbnb_host", name: "Airbnb host dashboard / app", freePlanAvailable: true, costNote: "Listings, calendar, messaging — follow current host terms", url: "https://www.airbnb.com/host/homes" },
  { id: "airdna", name: "AirDNA", freePlanAvailable: false, costNote: "Comps, occupancy, seasonality — verify current pricing on the vendor site", url: "https://www.airdna.co/" },
  { id: "calendar", name: "Calendar", freePlanAvailable: true, costNote: "Availability, min stays, turnover blocks", url: "https://calendar.google.com/" },
  { id: "messages", name: "Messaging templates", freePlanAvailable: true, planLabelApplicable: false, costNote: "Inquiry, check-in, checkout, house rules" },
  { id: "turnover", name: "Cleaning / turnover checklist", freePlanAvailable: true, planLabelApplicable: false, costNote: "Inspect, restock, photo proof" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "ADR, occupancy, gross, operating profit, cash flow", url: "https://sheets.google.com/" },
  { id: "lock", name: "Optional smart-lock / access management", freePlanAvailable: true, costNote: "Where appropriate and disclosed per platform rules", optional: true },
  { id: "photos", name: "Photography / editing for listing photos", freePlanAvailable: true, planLabelApplicable: false, costNote: "Accurate, well-lit, no misleading crops" },
  { id: "books", name: "Optional bookkeeping tool", freePlanAvailable: true, costNote: "When volume justifies it", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Airbnb Host + AirDNA comps + Calendar + Sheets + Turnover checklist + Payment records" },
];

export const AIRBNB_HOSTING_PRICING = {
  tabLabel: "Nightly Pricing & Unit Economics",
  intro: [
    "AIRBNB HOSTING — NIGHTLY PRICING & UNIT ECONOMICS",
    "",
    "Displayed $1,500 - $8,000 / month is examples only, not a guarantee.",
    "Do not use one universal nightly rate. Price from comps, capacity, amenities, weekday vs weekend, seasonality, events, min stay, cleaning, fees, occupancy, and expenses.",
    "",
    "Accommodation Revenue = ADR × Booked Nights.",
    "Gross Booking Revenue = Accommodation Revenue + other legitimate host revenue.",
    "Estimated Operating Profit = Gross − operating expenses.",
    "Cash flow ≠ operating profit. Track the full housing cash payment separately from a mortgage/rent allocation.",
    "",
    "Review current Airbnb host tools and fee terms — they change.",
    "Start comps at AirDNA (https://www.airdna.co/).",
  ].join("\n"),
  raiseTip:
    "Raise after reviews and true occupancy/expense data. Displayed $1,500 – $8,000 / month is examples only — not a guarantee.",
  items: [
    { id: "adr", label: "Average nightly revenue (ADR)", price: "From comps", notes: "Not a universal rate" },
    { id: "weekend", label: "Weekend / peak / event", price: "Above base", notes: "Examples only" },
    { id: "min", label: "Minimum stay", price: "Strategy", notes: "Weekday vs weekend" },
    { id: "clean", label: "Cleaning (guest vs host-paid)", price: "Quoted", notes: "Track who pays" },
    { id: "fees", label: "Platform / payment fees", price: "Current terms", notes: "Check Airbnb — terms change" },
  ],
};

export const AIRBNB_HOSTING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Confirm the Property Can Legally and Contractually Operate as a Short-Term Rental",
    desc: "Verify STR rules, zoning, permit/registration, HOA/building, mortgage/lease, occupancy, tax, and insurance. If it is not legal or allowed, stop. Non-owners: use Arbitrage Hosting or Co-Host instead.",
  },
  {
    title: "Research Local Demand, Competition, Seasonality, and Comps",
    desc: "Open AirDNA at https://www.airdna.co/ and comparable nearby listings. Note weekday vs weekend, peak dates, and weak dates. Do not invent occupancy.",
  },
  {
    title: "Build Realistic Unit Economics and a Break-Even Target",
    desc: "Open Google Sheets from the Tools tab. Model available nights, booked nights, ADR, other host revenue, operating expenses, operating profit, housing cash payment, and cash flow. Set a break-even occupancy. Displayed $1,500–$8,000/month is examples only.",
  },
  {
    title: "Prepare Licensing, Registration, Taxes, Insurance, and Business Requirements",
    desc: "Complete current local/platform requirements. Keep renewal dates. Do not invent thresholds.",
  },
  {
    title: "Prepare and Furnish the Property for Guest Use and Safety",
    desc: "Sleep quality, linens, safety devices, access, restock. Buy amenities only if comps and numbers justify them.",
  },
  {
    title: "Create a Professional Listing with Accurate Photos, Amenities, Rules, and Expectations",
    desc: "Open https://www.airbnb.com/host/homes. Accurate title, photos, sleeping arrangements, amenities, house rules, fees, check-in/out, parking/access. Do not exaggerate or hide material limitations. Accessibility claims only when accurate.",
  },
  {
    title: "Set Nightly Pricing, Minimum Stays, Availability, Discounts, and Calendar Strategy",
    desc: "Base, weekend, peak, min stay, and calendar blocks. Revisit after real occupancy data. Platform pricing tools are optional — verify current terms.",
  },
  {
    title: "Build Guest Communication, Check-In, Checkout, House Rules, and Access Procedures",
    desc: "Templates for inquiry, stay, and issues. Secure access + backup. No undisclosed surveillance. Follow current platform rules for permitted security devices.",
  },
  {
    title: "Build Cleaning, Laundry, Inspection, Restocking, and Maintenance Systems",
    desc: "Primary + backup cleaner, turnover checklist, restock list, maintenance contact. Same-day quality control.",
  },
  {
    title: "Launch and Manage Bookings, Guest Service, Reviews, Problems, and Quality Control",
    desc: "Reply promptly, protect guest privacy, fix issues fast, ask for honest reviews. Do not discriminate against protected guests.",
  },
  {
    title: "Review Revenue, Expenses, Occupancy, ADR, Profit, Feedback, and Optimize",
    desc: "Record available nights, booked nights, occupancy, ADR, gross, operating expenses, operating profit, cash flow, rating, and repairs. Change price, listing, or ops from data — not guesses.",
  },
];

export function airbnbHostingToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Airbnb Host + AirDNA comps + Calendar + Google Sheets + Turnover checklist.",
    "",
    "Do not require every pricing SaaS on day one. Guest linens and safety gear live on the Supply List.",
    "",
    "Non-owners: use Arbitrage Hosting or Co-Host. Gross booking revenue is not cash flow or operating profit.",
  ].join("\n");
}

export function computeAirbnbHostingProfit(input: {
  airbnbHostBookedNights?: number;
  availableNights?: number;
  avgNightlyRevenue?: number;
  otherHostRevenue?: number;
  mortgageRentAllocation?: number;
  propertyTaxAllocation?: number;
  insurance?: number;
  utilities?: number;
  internet?: number;
  cleaningPaidByHost?: number;
  laundry?: number;
  platformFees?: number;
  guestSupplies?: number;
  restocking?: number;
  maintenanceReserve?: number;
  permitsAllocation?: number;
  software?: number;
  advertising?: number;
  parkingHoa?: number;
  otherExpenses?: number;
  housingCashPayment?: number;
}): {
  accommodationRevenue: number;
  otherHostRevenue: number;
  grossBookingRevenue: number;
  occupancyPercent: number | null;
  operatingExpenses: number;
  estimatedOperatingProfit: number;
  housingCashPayment: number;
  cashFlow: number;
  profitPerBookedNight: number | null;
  breakEvenBookedNights: number | null;
  profitMarginPercent: number;
} {
  const booked = Math.max(0, Number(input.airbnbHostBookedNights) || 0);
  const available = Math.max(0, Number(input.availableNights) || 0);
  const adr = Math.max(0, Number(input.avgNightlyRevenue) || 0);
  const otherHostRevenue = Math.max(0, Number(input.otherHostRevenue) || 0);
  const accommodationRevenue = booked * adr;
  const grossBookingRevenue = accommodationRevenue + otherHostRevenue;
  const mortgageRentAllocation = Math.max(0, Number(input.mortgageRentAllocation) || 0);
  const operatingExpenses =
    mortgageRentAllocation +
    Math.max(0, Number(input.propertyTaxAllocation) || 0) +
    Math.max(0, Number(input.insurance) || 0) +
    Math.max(0, Number(input.utilities) || 0) +
    Math.max(0, Number(input.internet) || 0) +
    Math.max(0, Number(input.cleaningPaidByHost) || 0) +
    Math.max(0, Number(input.laundry) || 0) +
    Math.max(0, Number(input.platformFees) || 0) +
    Math.max(0, Number(input.guestSupplies) || 0) +
    Math.max(0, Number(input.restocking) || 0) +
    Math.max(0, Number(input.maintenanceReserve) || 0) +
    Math.max(0, Number(input.permitsAllocation) || 0) +
    Math.max(0, Number(input.software) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.parkingHoa) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedOperatingProfit = grossBookingRevenue - operatingExpenses;
  const housingCashPayment = Math.max(0, Number(input.housingCashPayment) || 0);
  const cashFlow = grossBookingRevenue - (operatingExpenses - mortgageRentAllocation + housingCashPayment);
  const contributionPerNight = adr;
  return {
    accommodationRevenue,
    otherHostRevenue,
    grossBookingRevenue,
    occupancyPercent: available > 0 ? (booked / available) * 100 : null,
    operatingExpenses,
    estimatedOperatingProfit,
    housingCashPayment,
    cashFlow,
    profitPerBookedNight: booked > 0 ? estimatedOperatingProfit / booked : null,
    breakEvenBookedNights:
      contributionPerNight > 0 ? Math.ceil(operatingExpenses / contributionPerNight) : null,
    profitMarginPercent: grossBookingRevenue > 0 ? (estimatedOperatingProfit / grossBookingRevenue) * 100 : 0,
  };
}
