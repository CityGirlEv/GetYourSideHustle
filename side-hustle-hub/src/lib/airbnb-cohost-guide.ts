/**
 * Airbnb Co-Host (`airbnb-cohost`, Guide #030).
 * Elite. 6 - 20 hrs/week. Displayed % of booking revenue (examples).
 * Plain data only — no imports from guide-tools.
 */

export const AIRBNB_COHOST_REALITY_CHECK = {
  title: "PLATFORM ACCESS IS NOT A SUBSTITUTE FOR A CO-HOST AGREEMENT OR LOCAL COMPLIANCE",
  body: [
    "Airbnb permission levels control what a co-host can do inside Airbnb. A separate written agreement should define work, money, approvals, property access, emergencies, liability, expenses, records, and termination. Local laws, leases, HOA/condo rules, permits, taxes, insurance, and property-management rules may also apply.",
    "",
    "Before accepting a property, confirm:",
    "- Owner identity and authority to host",
    "- Address and listing ownership",
    "- Local short-term-rental legality, registration, permit, and tax responsibilities",
    "- Lease, mortgage, HOA/condo, and insurance restrictions",
    "- Exact co-host permissions",
    "- Guest-message, pricing, reservation, cancellation, and refund authority",
    "- Cleaner/vendor responsibilities and spending limit",
    "- Check-in, lock, safety, maintenance, and emergency procedures",
    "- Damage/Resolution Center authority",
    "- Co-host compensation and expenses",
    "- Data retention, owner reports, and offboarding",
    "",
    "Do not list, relist, or operate a property when the owner cannot document the right to host. Do not hold guest funds, damage deposits, or owner payouts outside the approved platform/agreement unless qualified and lawful.",
    "",
    "Tagline: Their Property. Defined Authority. Reliable Guest Operations.",
  ].join("\n"),
};

export const AIRBNB_COHOST_NOTES_WORKSHEET = `AIRBNB CO-HOST NOTES

OWNER AND PROPERTY
Owner/Entity: __________________________________
Property/Listing: ______________________________
Proof of Right to Host: ________________________
Local Permit/Registration: _____________________
Insurance Confirmed: ___________________________
Unresolved Compliance Questions: ______________

AGREEMENT AND ACCESS
Services Included: _____________________________
Services Excluded: _____________________________
Co-Host Permission Level: ______________________
Revenue Base/Percentage: _______________________
Minimum Fee/Add-Ons: ___________________________
Spending Limit: ________________________________
Owner Approval Required For: ___________________
Response Hours: ________________________________

OPERATIONS
Primary Cleaner/Backup: ________________________
Maintenance/Emergency Contacts: _______________
Check-In Method: _______________________________
Safety Issues Open: ____________________________
Next Reservation/Turnover: _____________________
Owner Report Date: _____________________________

INCIDENT LOG
Date/Reservation: ______________________________
Issue: ________________________________________
Immediate Action: ______________________________
Owner Notified: ________________________________
Platform/Vendor Reference: _____________________
Resolution/Follow-Up: __________________________

BUSINESS TRACKER
Owners Contacted: ____
Properties Qualified: ____
Active Listings: ____
Reservations Supported: ____
Invoices/Payouts Expected: $____
Payments Collected: $____
Expenses: $____
Total Hours: ____
Monthly Profit: $____

RED FLAGS — PAUSE OR DECLINE
- Owner cannot prove the right to host or required registration
- Lease, HOA/condo, zoning, insurance, or local rule is unresolved
- Property has uncorrected fire, lock, pool, electrical, structural, or other safety issue
- Owner wants off-platform guest payments or undocumented cash handling
- Agreement does not define refunds, cancellations, damage claims, spending, or emergencies
- Expected response coverage exceeds your actual capacity
- Owner asks you to conceal facts from guests, neighbors, Airbnb, insurer, or government
- Work may require a license that has not been verified

GYSH PRO TIP
Do not win a property by promising “I’ll handle everything.” Win it with an authority matrix: what you may do, what requires owner approval, what triggers immediate escalation, and who pays each expense.

STARTER CHALLENGE
Create a one-page property-readiness checklist today covering legal right to host, permits, insurance, safety, access, cleaner/backup, emergency contacts, guest templates, spending authority, and the co-host percentage base.`;

export const AIRBNB_COHOST_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Operate agreed parts of another person’s Airbnb listing—such as guest messaging, calendar coordination, pricing changes, turnover checks, cleaner/vendor coordination, issue escalation, and owner reporting. The listing owner keeps ownership and grants only the Airbnb permissions and contractual authority needed for the work. Tagline: Their Property. Defined Authority. Reliable Guest Operations. Category: Real Estate / Hospitality Operations. Best for organized adults who can manage guest communication, calendars, cleaners, turnovers, vendors, and urgent issues without owning or leasing the property. Intermediate–Advanced · Less than $100 startup · Reservation-Driven / On-Call Windows · Local + Online · Percentage of Booking Revenue / Monthly Retainer / Setup Fee · Elite · 6 - 20 hrs/week · Displayed % of booking revenue (examples only — not guarantees).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Adult eligibility and verified Airbnb account · Hospitality communication and conflict de-escalation · Reliable internet/phone and realistic response coverage · Local cleaner/vendor contacts and backup coverage · Property walkthrough and photo inventory · Owner/co-host agreement and authority matrix · House manual, guest templates, turnover checklist, and emergency plan · Secure access, key/code, and incident-log process · Invoice/payment, expense, and profit tracker.",
  },
  {
    id: "verify",
    label: "Verify before launch",
    detail:
      "City/county/state/province/country requirements · Zoning and short-term-rental rules · Business registration and licensing · Occupancy, fire, pool, parking, noise, accessibility, and safety requirements · Lodging/occupancy/sales/income tax responsibilities · Insurance coverage for the owner and co-host services · Whether property management, leasing, negotiating, or money handling requires a license in that jurisdiction. These rules vary widely. Flag unanswered items for the owner and a qualified local adviser; do not infer legality from the fact that Airbnb allows a listing to be created.",
  },
];

export const AIRBNB_COHOST_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Airbnb Co-Host Introduction", url: "https://www.airbnb.com/help/article/1243" },
  { label: "Airbnb What Co-Hosts Can Do", url: "https://www.airbnb.com/help/article/1534" },
  { label: "Airbnb Add Co-Hosts and Choose Permissions", url: "https://www.airbnb.com/help/article/1244" },
  { label: "Airbnb Co-Host Additional Terms", url: "https://www.airbnb.com/help/article/3264" },
  { label: "Airbnb Co-Host Network Requirements", url: "https://www.airbnb.com/help/article/3727" },
  { label: "SBA Licenses and Permits", url: "https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits" },
  { label: "IRS Self-Employed Individuals Tax Center", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
];

export const AIRBNB_COHOST_SUPPLIES = {
  starterKitTotal:
    "About $0–100 if you already own a smartphone — optional inspection kit and insurance review may add cost",
  items: [
    { id: "phone", name: "Smartphone and charger", qty: "1", estCost: "$0 (usually owned)", notes: "Essential" },
    { id: "transport", name: "Reliable transportation if local duties are included", qty: "1", estCost: "Varies", notes: "Core when local" },
    { id: "account", name: "Airbnb co-host account with minimum required permissions", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "agreement", name: "Owner/co-host agreement and authority matrix", qty: "1", estCost: "$0", notes: "Core" },
    { id: "walkthrough", name: "Property walkthrough and condition inventory", qty: "1", estCost: "$0", notes: "Core" },
    { id: "templates", name: "Guest-message library and house manual", qty: "1 set", estCost: "$0", notes: "Core" },
    { id: "checklists", name: "Turnover/inspection/restock checklists", qty: "1 set", estCost: "$0", notes: "Core" },
    { id: "vendors", name: "Cleaner/vendor directory and backup plan", qty: "1", estCost: "$0", notes: "Core" },
    { id: "emergency", name: "Emergency contacts and incident report", qty: "1", estCost: "$0", notes: "Core" },
    { id: "access", name: "Secure key/code process", qty: "1", estCost: "$0", notes: "Core" },
    { id: "tracker", name: "Owner report and financial tracker", qty: "1", estCost: "$0", notes: "Core" },
    { id: "battery", name: "Portable battery", qty: "1", estCost: "$15–40", notes: "Helpful", optional: true },
    { id: "inspection-kit", name: "Basic inspection kit: flashlight, tape measure, disposable gloves", qty: "1", estCost: "$10–25", notes: "Helpful", optional: true },
    { id: "label-maker", name: "Label maker", qty: "1", estCost: "$15–35", notes: "Helpful", optional: true },
    { id: "cloud", name: "Secure cloud folder", qty: "1", estCost: "$0–10/mo", notes: "Helpful", optional: true },
    { id: "scheduling", name: "Scheduling/task software", qty: "1", estCost: "$0–20/mo", notes: "Helpful", optional: true },
    { id: "insurance", name: "Appropriate business/liability insurance", qty: "1 policy", estCost: "Varies", notes: "Helpful — review with qualified adviser", optional: true },
  ],
};

export const AIRBNB_COHOST_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "intro", name: "Airbnb Co-Host Introduction", freePlanAvailable: true, costNote: "Co-host role overview", url: "https://www.airbnb.com/help/article/1243" },
  { id: "can-do", name: "Airbnb What Co-Hosts Can Do", freePlanAvailable: true, costNote: "Permission capabilities — verify current", url: "https://www.airbnb.com/help/article/1534" },
  { id: "permissions", name: "Airbnb Add Co-Hosts and Choose Permissions", freePlanAvailable: true, costNote: "Minimum permissions needed", url: "https://www.airbnb.com/help/article/1244" },
  { id: "terms", name: "Airbnb Co-Host Additional Terms", freePlanAvailable: true, costNote: "Platform co-host terms", url: "https://www.airbnb.com/help/article/3264" },
  { id: "network", name: "Airbnb Co-Host Network Requirements", freePlanAvailable: true, costNote: "Not automatic beginner eligibility — verify current", url: "https://www.airbnb.com/help/article/3727" },
  { id: "sba", name: "SBA Licenses and Permits", freePlanAvailable: true, costNote: "Local business rules", url: "https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits" },
  { id: "irs", name: "IRS Self-Employed Individuals Tax Center", freePlanAvailable: true, costNote: "Income and expense records", url: "https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "One Legal Listing + Written Agreement + Minimum Permissions + House Manual + Cleaner + Backup + Guest Templates + Emergency Plan + Weekly Owner Report" },
];

export const AIRBNB_COHOST_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: % of booking revenue (examples only — not guarantees).",
    "Define the percentage base precisely: nightly rate only, accommodation subtotal, or another agreed amount. State whether cleaning fees, taxes, platform fees, refunds, discounts, damage payments, and canceled reservations are included or excluded.",
    "",
    "LIMITED MESSAGING/CALENDAR SUPPORT",
    "5% – 10% of defined booking revenue or fixed retainer",
    "Guest messaging and calendar coordination during agreed hours, with limited listing authority.",
    "",
    "STANDARD CO-HOST OPERATIONS",
    "10% – 20%+",
    "Messaging, calendar, cleaner coordination, turnover oversight, listing updates, issue escalation, and owner reporting within written authority.",
    "",
    "FULL-SERVICE LOCAL CO-HOSTING",
    "15% – 30%+ or custom retainer",
    "Broader reservation, pricing, vendor, inspection, supply, and incident responsibilities. Local compliance and licensing questions must be resolved first.",
    "",
    "ONE-TIME SETUP",
    "$200 – $1,000+",
    "Property walkthrough, listing/house-manual setup, photo/amenity checklist, message templates, turnover SOP, emergency contacts, and launch readiness. Photography, permits, repairs, and supplies are separate.",
    "",
    "POSSIBLE ADD-ONS",
    "- In-person turnover inspection",
    "- Restocking run",
    "- Vendor wait/coordination",
    "- Professional photography",
    "- Listing copy or guidebook",
    "- After-hours emergency response",
    "- Permit/document coordination that does not constitute legal advice",
    "- Additional property",
    "",
    "PRICING FORMULA: Defined Revenue Base × Co-Host Percentage + Setup/Add-Ons + Approved Reimbursements = Invoice/Expected Payout.",
    "Never quote only a percentage. Define minimum fee, service scope, response hours, owner approvals, direct costs, refunds/cancellations, and offboarding.",
    "",
    "MONTHLY EXAMPLES — NOT GUARANTEES",
    "$3,000 defined booking revenue × 10% = $300 gross co-host fee",
    "$5,000 × 15% = $750 gross co-host fee",
    "$8,000 × 20% = $1,600 gross co-host fee",
    "",
    "Gross revenue is NOT profit. Subtract travel, phone/software, supplies not reimbursed, inspections, contractors, insurance, payment fees, professional services, and taxes.",
  ].join("\n"),
  raiseTip:
    "Raise your percentage or minimum fee after a successful pilot with documented owner reports. Displayed % examples are not income guarantees.",
  items: [
    { id: "limited", label: "Limited messaging/calendar support", price: "5% – 10%", notes: "Or fixed retainer" },
    { id: "standard", label: "Standard co-host operations", price: "10% – 20%+", notes: "Messaging, calendar, cleaner, reporting" },
    { id: "full", label: "Full-service local co-hosting", price: "15% – 30%+", notes: "Compliance must be resolved first" },
    { id: "setup", label: "One-time setup", price: "$200 – $1,000+", notes: "Walkthrough, SOPs, launch readiness" },
  ],
};

export const AIRBNB_COHOST_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Co-Host Services & Research Local Requirements",
    desc: [
      "Select guest messaging, calendar, pricing support, cleaner coordination, turnover checks, restocking, listing updates, guidebook, or reporting.",
      "Define response hours, local radius, emergency coverage, and tasks you will not perform.",
      "Check government sources for short-term-rental legality, registration, permits, taxes, occupancy, safety, and business rules. Save links and dates; flag legal/tax questions for qualified advice.",
    ].join("\n"),
  },
  {
    title: "Build the Package, Percentage Base, and Agreement",
    desc: [
      "Define services, percentage base, minimum fee, setup, reimbursements, spending authority, owner approvals, reservation/cancellation/refund authority, property access, response hours, insurance, data, records, and termination.",
      "Never quote only a percentage without scope and minimum fee.",
    ].join("\n"),
  },
  {
    title: "Create the Operations System",
    desc: [
      "Build property intake, walkthrough, photo inventory, house manual, message templates, calendar rules, turnover checklist, vendor directory, restock levels, incident log, emergency tree, and owner report.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3: warm referrals; local host groups; real-estate/hospitality contacts; current host relationships; Airbnb Co-Host Network only if eligible.",
      "Set measurable goals such as: contact 5 owners; attend 1 host meetup; send 10 scoped introductions.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "State the property type/area you serve, exact services, availability, experience, starting pricing approach, and CTA.",
      "Sample: “I provide [SERVICES] for compliant short-term-rental owners in [AREA]. My agreement defines permissions, response hours, owner approvals, and a fee of [PERCENT/RETAINER].”",
      "Do not claim Co-Host Network status, licenses, 24/7 coverage, revenue increases, or perfect ratings unless accurate and current.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2 or 3 channels you chose.",
      "☐ Warm referrals — ask trusted contacts for owner introductions.",
      "☐ Local host groups — share your scope and readiness checklist offer.",
      "☐ Direct outreach — send personalized messages to suitable owners.",
      "Track: Date | Owner | Channel | Response | Checklist Sent | Follow-Up.",
      "Honor opt-outs. Do not promise to handle everything without a written authority matrix.",
    ].join("\n"),
  },
  {
    title: "Qualify the Owner and Property",
    desc: [
      "Verify identity, ownership/right to host, listing, local compliance, insurance, property condition, safety equipment, access, cleaner/vendor capacity, booking history, complaints, urgent issues, and financial expectations.",
      "Decline unresolved illegal or unsafe operations.",
    ].join("\n"),
  },
  {
    title: "Walk Through, Document, and Test",
    desc: [
      "Inspect the guest journey from booking to checkout. Photograph condition with permission; test locks, Wi-Fi, directions, messages, cleaner handoff, emergency contacts, and escalation.",
      "Owner corrects safety or compliance gaps before launch.",
    ].join("\n"),
  },
  {
    title: "Accept Access and Launch a Limited Pilot",
    desc: [
      "The owner invites you through Airbnb and selects permissions. Confirm templates, price/cancellation boundaries, spending cap, and pilot dates.",
      "Manage a small number of reservations before expanding.",
    ].join("\n"),
  },
  {
    title: "Operate, Escalate, and Report",
    desc: [
      "Respond within the agreed window, keep platform communications documented, coordinate turnovers, log expenses/incidents, protect guest data, and escalate safety, damage, refunds, rule violations, or exceptions.",
      "Send the owner a recurring operating report.",
    ].join("\n"),
  },
  {
    title: "Reconcile, Invoice, and Improve",
    desc: [
      "Reconcile the defined revenue base, cancellations, refunds, payouts, reimbursable expenses, and fee.",
      "Measure response, turnovers, issues, reviews, total hours, and profit. Update the agreement before adding duties or another property.",
      "Pattern: LEGAL RIGHT → AGREEMENT → PERMISSIONS → SOPs → PILOT → OPERATE → REPORT.",
    ].join("\n"),
  },
];

export function airbnbCohostToolsDisclaimer(): string {
  return "Beginner stack: One Legal Listing + Written Agreement + Minimum Permissions + House Manual + Cleaner + Backup + Guest Templates + Emergency Plan + Weekly Owner Report. Choose minimum Airbnb permissions needed. Only listing owners can set up co-host payout. Verify Co-Host Network eligibility before claiming it.";
}

/** Example: $5,000 × 15% = $750; +$150 add-ons = $900 revenue; $150 expenses; $750 profit; 35 hrs → $21.43/hr */
export function computeAirbnbCohostProfit(input: {
  acDefinedBookingRevenue?: number;
  acCoHostPercent?: number;
  acFixedRetainer?: number;
  acSetupAddOnRevenue?: number;
  acOtherRevenue?: number;
  acTravelMileage?: number;
  acPhoneSoftware?: number;
  acSuppliesNotReimbursed?: number;
  acContractorsBackup?: number;
  acInsuranceProfessional?: number;
  acPaymentFeesOther?: number;
  acGuestCommHours?: number;
  acTurnoverVendorHours?: number;
  acOwnerReportAdminHours?: number;
  acEmergencyAfterHours?: number;
  acReservationsSupported?: number;
  acTurnoversCompleted?: number;
}): {
  percentageFee: number;
  totalCollectedRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
  feePerReservation: number | null;
  hoursPerReservation: number | null;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const percentageFee = n(input.acDefinedBookingRevenue) * (n(input.acCoHostPercent) / 100);
  const totalCollectedRevenue =
    percentageFee + n(input.acFixedRetainer) + n(input.acSetupAddOnRevenue) + n(input.acOtherRevenue);
  const totalExpenses =
    n(input.acTravelMileage) +
    n(input.acPhoneSoftware) +
    n(input.acSuppliesNotReimbursed) +
    n(input.acContractorsBackup) +
    n(input.acInsuranceProfessional) +
    n(input.acPaymentFeesOther);
  const estimatedProfit = totalCollectedRevenue - totalExpenses;
  const totalHours =
    n(input.acGuestCommHours) +
    n(input.acTurnoverVendorHours) +
    n(input.acOwnerReportAdminHours) +
    n(input.acEmergencyAfterHours);
  const reservations = n(input.acReservationsSupported);
  return {
    percentageFee,
    totalCollectedRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: totalCollectedRevenue > 0 ? (estimatedProfit / totalCollectedRevenue) * 100 : 0,
    feePerReservation: reservations > 0 ? totalCollectedRevenue / reservations : null,
    hoursPerReservation: reservations > 0 ? totalHours / reservations : null,
  };
}
