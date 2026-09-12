/**
 * Property Management (`property-mgmt`, Guide #097).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const PROPERTY_MGMT_REALITY_CHECK = {
  title: "KNOW WHAT YOU ARE LEGALLY ALLOWED TO DO",
  body: [
    "Property-management rules vary by state and locality.",
    "",
    "Before offering services, verify whether your location requires a real-estate/property-management license, business license, trust/escrow procedures, insurance, written agreements, or other requirements.",
    "",
    "Short-term rentals may also have permits, taxes, zoning, registration, occupancy, safety, or platform requirements.",
    "",
    "Do not collect rent, security deposits, owner funds, sign leases, negotiate regulated transactions, or perform other regulated activities unless you are legally permitted and properly set up to do so.",
    "",
    "Tagline: Their Property. Your Systems. Smoother Operations.",
  ].join("\n"),
};

/** Property Management Planner shown above freeform Notes for this guide. */
export const PROPERTY_MGMT_NOTES_WORKSHEET = `MY PROPERTY MANAGEMENT PLAN

Property Types:
__________
Long-Term / Short-Term / Both:
__________
Services:
__________
Services I Will NOT Provide:
__________
Service Area:
__________
Pricing:
__________

Marketing Channels:
1. __________
2. __________
3. __________

LEGAL / BUSINESS CHECK
License Required?
__________
Business License?
__________
Insurance?
__________
Fund/Trust Rules?
__________
STR Rules?
__________
Other:
__________

PROPERTY / OWNER
Owner:
__________
Property:
__________
Units:
__________
Primary Contact:
__________
Services Requested:
__________
Monthly Fee:
$____
Expense Approval Limit:
$____
Reporting Schedule:
__________
Emergency Process:
__________

VENDORS
Cleaner:
__________
Handyman:
__________
Plumber:
__________
Electrician:
__________
HVAC:
__________
Other:
__________

MONTHLY RESULTS
Earned Management Fees:
$____
Other Earned Revenue:
$____
Business Expenses:
$____
Estimated Profit:
$____
Open Maintenance:
__________
Owner Decisions Needed:
__________
What Worked:
__________
What Needs Improvement:
__________
Owner Happy?
☐ Yes
☐ Needs Attention
Referral/Testimonial Requested?
☐ Yes
☐ No

GYSH PRO TIP
THE OWNER IS PAYING FOR LESS CHAOS.
Your value is not just answering messages.
Your value is creating a system where:
PROBLEMS GET LOGGED
→ THE RIGHT PERSON GETS CONTACTED
→ WORK GETS TRACKED
→ THE OWNER GETS UPDATED
→ NOTHING IMPORTANT DISAPPEARS
Good property management is organized follow-through.

BEGINNER CHALLENGE
Build a SAMPLE PROPERTY OPERATIONS SYSTEM before taking your first client.
Create:
1. Property Information Sheet
2. Vendor List
3. Maintenance Tracker
4. Turnover/Inspection Checklist
5. Owner Report Template
Use a sample property or your own practice data.
If you can organize one property clearly on paper, you are much closer to being ready to manage a real one.`;

export const PROPERTY_MGMT_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Manage rentals or short-term stays for owners who want hands-off operations — leasing coordination, guest turns, vendors, maintenance communication, calendars, and owner reporting. Tagline: Their Property. Your Systems. Smoother Operations. Category: Real Estate / Property Services. Best for adults, seniors / retirees. Beginner to Intermediate · Low to moderate startup · Timeline: 3–6 weeks · Recurring / per property · Free Guide · $1,000–$8,000 / month (example business revenue, not guaranteed beginner income).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable phone and computer · Internet access · Strong organization · Clear communication · Calendar/task system · Basic spreadsheet skills · Reliable transportation if providing local/on-site service · Written scope of services · Secure method for handling owner/property information.",
  },
  {
    id: "before",
    label: "Before taking a client",
    detail:
      "Check applicable state/local licensing requirements · Check business-license requirements · Determine what activities you may legally perform · Check insurance needs · Understand fair-housing and anti-discrimination obligations where applicable · Understand landlord-tenant rules relevant to the work you perform · For short-term rentals, check local STR rules and platform requirements · Never mix owner/client money with your personal money · Use written agreements and clear authorization boundaries.",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail:
      "Property-management software · Vendor list · Cleaning/turnover checklist · Inspection checklist · Owner-report template · Maintenance tracking system · Emergency contact process.",
  },
];

export const PROPERTY_MGMT_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Drive", url: "https://drive.google.com/", note: "Property documents" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Checklists / reports" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Property / vendor tracking" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Inspections / repairs / turnovers" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Properties / vendors" },
  { label: "Buildium", url: "https://www.buildium.com/", note: "Verify current features, fees, and eligibility" },
  { label: "AppFolio", url: "https://www.appfolio.com/", note: "Verify current features, fees, and eligibility" },
  { label: "DoorLoop", url: "https://www.doorloop.com/", note: "Verify current features, fees, and eligibility" },
  { label: "TenantCloud", url: "https://www.tenantcloud.com/", note: "Verify current features, fees, and eligibility" },
  { label: "Avail", url: "https://www.avail.co/", note: "Verify current features, fees, and eligibility" },
  { label: "Airbnb", url: "https://www.airbnb.com/", note: "STR operations where authorized — verify platform rules" },
  { label: "Vrbo", url: "https://www.vrbo.com/", note: "STR operations where authorized — verify platform rules" },
];

export const PROPERTY_MGMT_SUPPLIES = {
  starterKitTotal:
    "About $0–50 to start — phone, computer, and free Google tools first. Do not buy expensive software before you have enough clients to justify it.",
  items: [
    { id: "computer", name: "Computer", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "phone", name: "Smartphone", qty: "1", estCost: "$0", notes: "Essential — already owned" },
    { id: "internet", name: "Reliable internet", qty: "1", estCost: "$0+", notes: "Essential" },
    { id: "calendar", name: "Calendar", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "email", name: "Email", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "cloud", name: "Cloud storage", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "sheets", name: "Spreadsheet / tracking system", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "agreement", name: "Written service agreement", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "records", name: "Property / client information system", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "transport", name: "Reliable transportation", qty: "1", estCost: "$0+", notes: "For local management", optional: true },
    { id: "inspection", name: "Inspection checklist", qty: "1", estCost: "$0–8", notes: "For local management", optional: true },
    { id: "flashlight", name: "Flashlight", qty: "1", estCost: "$5–15", notes: "For local management", optional: true },
    { id: "camera", name: "Phone camera", qty: "1", estCost: "$0", notes: "For local management", optional: true },
    { id: "tape", name: "Measuring tape", qty: "1", estCost: "$3–10", notes: "For local management", optional: true },
    { id: "safety", name: "Basic safety supplies", qty: "1", estCost: "$5–20", notes: "For local management", optional: true },
    { id: "turnover", name: "Turnover checklist", qty: "1", estCost: "$0–8", notes: "For short-term rentals", optional: true },
    { id: "cleaner-contacts", name: "Cleaner / vendor contacts", qty: "1", estCost: "$0", notes: "For short-term rentals", optional: true },
    { id: "restock", name: "Restock checklist", qty: "1", estCost: "$0–8", notes: "For short-term rentals", optional: true },
    { id: "guest-templates", name: "Guest-message templates", qty: "1", estCost: "$0", notes: "For short-term rentals", optional: true },
    { id: "guide", name: "Property guide / instructions", qty: "1", estCost: "$0", notes: "For short-term rentals", optional: true },
    { id: "emergency", name: "Emergency contact sheet", qty: "1", estCost: "$0–5", notes: "For short-term rentals", optional: true },
    { id: "pm-software", name: "Property-management software", qty: "1", estCost: "varies", notes: "Optional — after you have clients", optional: true },
    { id: "lockbox", name: "Lockbox / smart-lock tools where authorized", qty: "1", estCost: "$0+", notes: "Optional", optional: true },
    { id: "biz-phone", name: "Dedicated business phone", qty: "1", estCost: "$0–15/mo", notes: "Optional", optional: true },
    { id: "accounting", name: "Accounting / bookkeeping software", qty: "1", estCost: "$0+", notes: "Optional", optional: true },
  ],
};

export const PROPERTY_MGMT_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "pm_drive", name: "Google Drive", freePlanAvailable: true, costNote: "Property documents", url: "https://drive.google.com/" },
  { id: "pm_docs", name: "Google Docs", freePlanAvailable: true, costNote: "Checklists / reports", url: "https://docs.google.com/" },
  { id: "pm_sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Property / vendor tracking", url: "https://sheets.google.com/" },
  { id: "pm_email", name: "Gmail / Outlook", freePlanAvailable: true, planLabelApplicable: false, costNote: "Owner / vendor communication" },
  { id: "pm_calendar", name: "Calendar", freePlanAvailable: true, costNote: "Inspections / repairs / turnovers", url: "https://calendar.google.com/" },
  { id: "pm_canva", name: "Canva", freePlanAvailable: true, costNote: "Owner-facing one-pagers", url: "https://www.canva.com/", optional: true },
  { id: "pm_meet", name: "Zoom / Google Meet", freePlanAvailable: true, costNote: "Owner calls", optional: true },
  { id: "pm_maps", name: "Maps", freePlanAvailable: true, costNote: "Properties / vendors", url: "https://maps.google.com/" },
  { id: "pm_esign", name: "E-signature tool where appropriate", freePlanAvailable: true, costNote: "Written authorization", optional: true },
  { id: "pm_buildium", name: "Buildium", freePlanAvailable: false, costNote: "Verify current features, fees, integrations, and eligibility", url: "https://www.buildium.com/", optional: true },
  { id: "pm_appfolio", name: "AppFolio", freePlanAvailable: false, costNote: "Verify current features, fees, integrations, and eligibility", url: "https://www.appfolio.com/", optional: true },
  { id: "pm_doorloop", name: "DoorLoop", freePlanAvailable: false, costNote: "Verify current features, fees, integrations, and eligibility", url: "https://www.doorloop.com/", optional: true },
  { id: "pm_tenantcloud", name: "TenantCloud", freePlanAvailable: true, costNote: "Verify current features, fees, integrations, and eligibility", url: "https://www.tenantcloud.com/", optional: true },
  { id: "pm_avail", name: "Avail", freePlanAvailable: true, costNote: "Verify current features, fees, integrations, and eligibility", url: "https://www.avail.co/", optional: true },
  { id: "pm_airbnb", name: "Airbnb", freePlanAvailable: true, costNote: "STR operations where authorized — verify platform rules", url: "https://www.airbnb.com/", optional: true },
  { id: "pm_vrbo", name: "Vrbo", freePlanAvailable: true, costNote: "STR operations where authorized — verify platform rules", url: "https://www.vrbo.com/", optional: true },
  { id: "pm_hospitable", name: "Hospitable", freePlanAvailable: false, costNote: "Possible STR tool — verify pricing and eligibility", optional: true },
  { id: "pm_guesty", name: "Guesty", freePlanAvailable: false, costNote: "Possible STR tool — verify pricing and eligibility", optional: true },
  { id: "pm_turno", name: "Turno", freePlanAvailable: true, costNote: "Possible STR tool — verify pricing and eligibility", optional: true },
  { id: "pm_stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Google Drive + Google Sheets + Calendar + Email + Written Checklists" },
];

export const PROPERTY_MGMT_PRICING = {
  tabLabel: "Property Management Pricing Examples",
  intro: [
    "PROPERTY MANAGEMENT PRICING EXAMPLES",
    "",
    "Pricing varies heavily by location, property type, duties, licensing requirements, and whether the service is long-term rental management, short-term rental operations, or administrative coordination.",
    "",
    "Keep displayed income example: $1,000–$8,000 / month.",
    "Clearly label this as an example business revenue range, NOT guaranteed beginner income.",
    "",
    "IMPORTANT: Rent collected for an owner, security deposits, taxes, cleaning funds, or other owner/client funds are NOT automatically your business revenue. Your revenue is the management/service fee you actually earn.",
  ].join("\n"),
  raiseTip:
    "After operating one property well, add doors only if systems can handle them. Examples only — not income guarantees.",
  items: [
    {
      id: "flat",
      label: "MONTHLY FLAT FEE — per property/month depending on scope",
      price: "$100–$500+",
      notes: "Example structure — not a universal rate",
    },
    {
      id: "pct",
      label: "PERCENTAGE OF RENT — where legally permitted",
      price: "Market varies",
      notes: "Do not hard-code a universal percentage",
    },
    {
      id: "str",
      label: "SHORT-TERM RENTAL OPERATIONS — flat monthly, per-turn, per-stay, or percentage where permitted",
      price: "Custom package",
    },
    {
      id: "onetime",
      label: "ONE-TIME SERVICES — setup/onboarding, listing coordination, vendor coordination, inspection/reporting, turnover setup, documentation",
      price: "Project fee",
    },
    {
      id: "range",
      label: "DISPLAYED EXAMPLE BUSINESS REVENUE",
      price: "$1,000–$8,000 / month",
      notes: "Example business revenue range — not guaranteed beginner income",
    },
  ],
};

/**
 * Core launch steps (exactly 11). Steps 3–5 are the required marketing block.
 * Legal check is step 2 — BEFORE marketing.
 */
export const PROPERTY_MGMT_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose What You Will Manage",
    desc: [
      "Do not advertise “everything.” Choose a clear service model.",
      "",
      "LONG-TERM examples:",
      "☐ Maintenance coordination",
      "☐ Tenant communication support",
      "☐ Inspection coordination",
      "☐ Vendor scheduling",
      "☐ Owner reporting",
      "☐ Administrative support",
      "",
      "SHORT-TERM examples:",
      "☐ Guest communication",
      "☐ Calendar coordination",
      "☐ Cleaner/turnover coordination",
      "☐ Restocking",
      "☐ Maintenance coordination",
      "☐ Owner reporting",
      "",
      "Write:",
      "Property Types I Serve: __________",
      "Services I Provide: __________",
      "Services I Do NOT Provide: __________",
    ].join("\n"),
  },
  {
    title: "Check Legal & Business Requirements",
    desc: [
      "Before marketing the service, verify:",
      "",
      "☐ Property-management licensing rules",
      "☐ Real-estate licensing rules",
      "☐ Business registration/license requirements",
      "☐ Insurance needs",
      "☐ Fair-housing requirements",
      "☐ Landlord-tenant rules",
      "☐ Trust/escrow requirements if handling funds",
      "☐ Contract requirements",
      "☐ Short-term-rental permits/taxes/rules if applicable",
      "",
      "Create a list:",
      "I MAY DO: __________",
      "I MAY NOT DO: __________",
      "I NEED A LICENSE/AUTHORIZATION FOR: __________",
      "",
      "Do not guess.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way property owners hear about you.",
      "Pick only 2 or 3 this month.",
      "",
      "Possible channels:",
      "☐ Referrals",
      "☐ Local real-estate investors",
      "☐ Landlord groups",
      "☐ Real-estate agents/brokers where appropriate",
      "☐ Facebook business/local investor groups",
      "☐ LinkedIn",
      "☐ Email outreach",
      "☐ Local networking",
      "☐ Short-term rental host communities",
      "☐ Local business relationships",
      "",
      "Open Google Docs from Tools.",
      "Write:",
      "What I Manage: __________",
      "Starting Fee/Package: __________",
      "Ideal Owner: __________",
      "",
      "Choose exactly 2 or 3 channels. Create ONE measurable goal for each.",
      "",
      "Example:",
      "Contact 10 local landlords",
      "Attend 1 investor meetup",
      "Send 10 personalized owner introductions",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple owner-facing service kit.",
      "",
      "Include:",
      "1. One-page service overview",
      "2. Services included",
      "3. Property types served",
      "4. Service area",
      "5. How communication works",
      "6. Reporting frequency",
      "7. Starting pricing or consultation CTA",
      "8. Contact information",
      "",
      "Sample:",
      "",
      "WANT MORE HANDS-OFF RENTAL OPERATIONS?",
      "",
      "I help rental-property owners stay organized with property communication, vendor coordination, maintenance tracking, turnovers, and owner reporting.",
      "",
      "Services are customized to the property and local legal requirements.",
      "Contact me to discuss your property and what support you need.",
      "",
      "Do not claim to be a licensed property manager, broker, Realtor, or other regulated professional unless you actually hold the required credential.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, use ONLY the 2 or 3 channels selected.",
      "",
      "Actions:",
      "☐ Contact 8–12 relevant property owners/investors",
      "☐ Ask trusted contacts for landlord referrals",
      "☐ Join appropriate local investor/host communities",
      "☐ Send personalized outreach",
      "☐ Follow up once when appropriate",
      "",
      "Sample:",
      "“Hi! I help rental-property owners organize day-to-day operations such as vendor coordination, maintenance tracking, turnovers, communication, and owner reporting. I’m currently taking on a limited number of local properties. If you’d like more hands-off operations, I’d be happy to discuss what support you need.”",
      "",
      "Track:",
      "Date | Owner | Property Type | Channel | Response | Follow-Up",
      "",
      "Do not spam. Do not promise services you cannot legally provide.",
    ].join("\n"),
  },
  {
    title: "Screen the Property & Owner",
    desc: [
      "Before agreeing to manage/support a property, learn:",
      "",
      "Property address/general location · Property type · Long-term or short-term · Number of units · Current occupancy · Current problems · Owner expectations · Existing vendors · Maintenance history · Emergency issues · Current software/platforms · Required communication frequency · Services requested · Who controls funds · Who approves expenses · Who has authority to sign/approve decisions",
      "",
      "Watch for red flags:",
      "Owner asks you to break laws · Unsafe property · Unclear ownership/authority · Unreasonable availability expectations · Owner wants you to handle regulated funds/tasks without proper setup · Owner refuses written terms",
    ].join("\n"),
  },
  {
    title: "Define Responsibilities in Writing",
    desc: [
      "Create a clear written scope.",
      "",
      "Define:",
      "YOU HANDLE: __________",
      "OWNER HANDLES: __________",
      "VENDORS HANDLE: __________",
      "EMERGENCIES: __________",
      "EXPENSE APPROVAL LIMIT: $____",
      "REPORTING: Weekly / Biweekly / Monthly",
      "COMMUNICATION: Email / Phone / Portal / Other",
      "",
      "Include: Fee · Payment schedule · Start date · Termination process · Response expectations · Emergency process · Access/key rules · Vendor authorization · Data/privacy expectations",
      "",
      "Use appropriate legal/professional review for contracts when needed.",
    ].join("\n"),
  },
  {
    title: "Build the Property Operating System",
    desc: [
      "Create one organized system per property.",
      "",
      "PROPERTY FILE:",
      "☐ Owner contacts",
      "☐ Property information",
      "☐ Access instructions",
      "☐ Vendor list",
      "☐ Maintenance history",
      "☐ Lease/guest information where authorized",
      "☐ Emergency contacts",
      "☐ Inspection records",
      "☐ Photos",
      "☐ Receipts/invoices",
      "☐ Owner reports",
      "",
      "TASK SYSTEM:",
      "☐ Maintenance",
      "☐ Inspections",
      "☐ Turnovers",
      "☐ Restocking",
      "☐ Vendor appointments",
      "☐ Owner follow-ups",
      "",
      "Do not keep sensitive property information in unsecured random notes.",
    ].join("\n"),
  },
  {
    title: "Run Day-to-Day Operations",
    desc: [
      "LONG-TERM examples:",
      "☐ Track maintenance requests",
      "☐ Contact approved vendors",
      "☐ Schedule authorized repairs",
      "☐ Coordinate access",
      "☐ Document completion",
      "☐ Communicate updates",
      "☐ Maintain records",
      "",
      "SHORT-TERM examples:",
      "☐ Monitor reservation/calendar information",
      "☐ Send approved guest messages",
      "☐ Coordinate cleaners",
      "☐ Check turnovers",
      "☐ Track restocking",
      "☐ Escalate maintenance",
      "☐ Prepare property for next stay",
      "",
      "Do not authorize spending beyond the owner's agreed limit without approval unless a written emergency procedure specifically allows it.",
    ].join("\n"),
  },
  {
    title: "Report to the Owner",
    desc: [
      "Send a clear owner report on the agreed schedule.",
      "",
      "OWNER REPORT",
      "Property: __________",
      "Period: __________",
      "Occupancy/Stay Activity: __________",
      "Open Maintenance: __________",
      "Completed Maintenance: __________",
      "Vendor Work: __________",
      "Upcoming Tasks: __________",
      "Guest/Tenant Issues: __________",
      "Expenses Requiring Attention: __________",
      "Owner Decisions Needed: __________",
      "",
      "Keep reports factual and organized.",
      "The goal is for the owner to know what is happening without chasing you for information.",
    ].join("\n"),
  },
  {
    title: "Grow the Portfolio Carefully",
    desc: [
      "Do not add properties faster than your systems can handle.",
      "",
      "Before adding another property, ask:",
      "☐ Are current owners receiving reports on time?",
      "☐ Are maintenance items tracked?",
      "☐ Are messages answered promptly?",
      "☐ Are vendors reliable?",
      "☐ Are turnovers running correctly?",
      "☐ Can I handle another property without lowering quality?",
      "",
      "Growth path:",
      "1 PROPERTY → SYSTEMIZE → HAPPY OWNER → TESTIMONIAL/REFERRAL → 2–3 PROPERTIES → IMPROVE SYSTEMS → ADD HELP/SOFTWARE WHEN JUSTIFIED",
      "",
      "One well-managed property is better than five chaotic ones.",
    ].join("\n"),
  },
];

export function propertyMgmtToolsDisclaimer(): string {
  return [
    "Beginner stack: Google Drive + Google Sheets + Calendar + Email + Written Checklists.",
    "",
    "Do not buy expensive software before you have enough clients to justify it.",
    "",
    "Verify current software features, fees, platform rules, integrations, and eligibility before recommending or purchasing.",
    "",
    "Owner rent, tenant security deposits, taxes, guest payments, repair funds, or other client money should NOT be counted as your earned revenue merely because the money passes through an account or platform.",
  ].join("\n");
}

/** Manager fees only — not owner rent, deposits, or other client funds. */
export function computePropertyMgmtRevenue(input: {
  properties: number;
  averageMonthlyFee: number;
  oneTimeServiceFees?: number;
  otherEarnedServiceRevenue?: number;
  leasingFees?: number;
  turnoverFees?: number;
  otherServiceRevenue?: number;
  softwareCost: number;
  phoneInternet?: number;
  adminExpense?: number;
  insuranceExpense: number;
  travelExpense: number;
  contractorAdmin?: number;
  marketing?: number;
  otherExpenses: number;
  monthlyWorkHours?: number;
}): {
  managementRevenue: number;
  grossMonthlyRevenue: number;
  monthlyExpenses: number;
  estimatedMonthlyProfit: number;
  averageProfitPerProperty: number | null;
  effectiveHourlyRate: number | null;
} {
  const properties = Math.max(0, Number(input.properties) || 0);
  const fee = Math.max(0, Number(input.averageMonthlyFee) || 0);
  const oneTime =
    Math.max(0, Number(input.oneTimeServiceFees) || 0) +
    Math.max(0, Number(input.leasingFees) || 0) +
    Math.max(0, Number(input.turnoverFees) || 0);
  const otherRev =
    Math.max(0, Number(input.otherEarnedServiceRevenue) || 0) +
    Math.max(0, Number(input.otherServiceRevenue) || 0);
  const managementRevenue = properties * fee;
  const grossMonthlyRevenue = managementRevenue + oneTime + otherRev;
  const monthlyExpenses =
    Math.max(0, Number(input.softwareCost) || 0) +
    Math.max(0, Number(input.phoneInternet) || 0) +
    Math.max(0, Number(input.adminExpense) || 0) +
    Math.max(0, Number(input.insuranceExpense) || 0) +
    Math.max(0, Number(input.travelExpense) || 0) +
    Math.max(0, Number(input.contractorAdmin) || 0) +
    Math.max(0, Number(input.marketing) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedMonthlyProfit = grossMonthlyRevenue - monthlyExpenses;
  const hours = Math.max(0, Number(input.monthlyWorkHours) || 0);
  return {
    managementRevenue,
    grossMonthlyRevenue,
    monthlyExpenses,
    estimatedMonthlyProfit,
    averageProfitPerProperty: properties > 0 ? estimatedMonthlyProfit / properties : null,
    effectiveHourlyRate: hours > 0 ? estimatedMonthlyProfit / hours : null,
  };
}
