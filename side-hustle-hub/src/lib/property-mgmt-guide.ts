/**
 * Property Management (`property-mgmt`, Guide #097).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const PROPERTY_MGMT_REALITY_CHECK = {
  title: "YOU'RE MANAGING SOMEONE ELSE'S ASSET",
  body: [
    "Property management is more than answering messages.",
    "",
    "Owners are trusting you with their property, tenants/guests, vendors, money/information, and reputation.",
    "",
    "Organization, communication, documentation, and knowing your legal boundaries matter.",
    "",
    "Tagline: Their Property. Your Systems. Smoother Operations.",
  ].join("\n"),
};

/** Property Management Planner shown above freeform Notes for this guide. */
export const PROPERTY_MGMT_NOTES_WORKSHEET = `MY PROPERTY MANAGEMENT PLAN

Property Type: __________
Area: __________
Services: __________
Fee Structure: __________

LEGAL CHECK:
License Requirement: __________
Business Requirement: __________
Other Requirements: __________
Source: __________
Date Checked: __________

MY MARKETING CHANNELS:

1. __________
2. __________
3. __________

OWNER/PROPERTY:

Owner: __________
Property: __________
Units: ______
Management Fee: $____

Owner Contact: __________
Emergency Contact: __________

VENDORS:

Plumbing: __________
Electrical: __________
HVAC: __________
Cleaning: __________
Handyman: __________
Other: __________

OPEN ITEMS:
____________________

OWNER APPROVAL NEEDED:
____________________

NEXT REPORT DATE:
____________________

MONTHLY:

Management Revenue: $____
Additional Revenue: $____
Expenses: $____
Estimated Profit: $____
Hours: ______

GYSH PRO TIP — DON'T TRY TO MANAGE 20 PROPERTIES BEFORE YOU CAN MANAGE ONE WELL.
Your first property is where you build the SYSTEM:
Communication + Documentation + Vendor Tracking + Maintenance Follow-Up + Owner Reporting.
Then repeat the system.

BEGINNER CHALLENGE:
Build a SAMPLE PROPERTY MANAGEMENT DASHBOARD before getting your first client:
1 Property Profile · 1 Vendor List · 1 Maintenance Tracker · 1 Turnover Checklist · 1 Sample Owner Report.
Now you can SHOW an owner how you'll manage — not just say you can.`;

export const PROPERTY_MGMT_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Help rental-property or short-term-rental owners handle day-to-day operations such as tenant/guest communication, leasing coordination, turnovers, vendor scheduling, maintenance follow-up, and owner reporting. Category: Real Estate / Property Services. Best for adults, seniors / retirees. Beginner–Intermediate · Low–moderate startup · Startup timeline: 3–6 weeks · Recurring monthly / per property · Free Guide.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Strong organization · Professional communication · Reliable phone/internet · Calendar/scheduling ability · Recordkeeping skills · Vendor coordination ability · Basic rental-property knowledge.",
  },
  {
    id: "legal",
    label: "IMPORTANT LEGAL CHECK",
    detail:
      "Property-management licensing and permitted activities vary by state/local jurisdiction. Before offering services, determine whether your location requires a real-estate/property-management license, broker supervision, business license, specific contracts/disclosures, trust-account procedures, insurance, and/or short-term-rental permits/rules. Do not perform activities requiring a license unless legally authorized. A beginner may need to limit services to administrative or coordination work until requirements are confirmed.",
  },
  {
    id: "funds",
    label: "Owner / client funds",
    detail:
      "Rent collected on behalf of an owner is NOT automatically your revenue. Security deposits, owner funds, rent, vendor funds, and other client money must not be treated as personal income.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — one property first",
    detail:
      "Don't try to manage 20 properties before you can manage one well. Build communication, documentation, vendor tracking, maintenance follow-up, and owner reporting — then repeat the system.",
  },
];

export const PROPERTY_MGMT_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Inspections / repairs / turnovers",
  },
  {
    label: "Google Drive",
    url: "https://drive.google.com/",
    note: "Property documents",
  },
  {
    label: "Google Docs",
    url: "https://docs.google.com/",
    note: "Checklists / reports",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Property / vendor tracking",
  },
  {
    label: "Google Maps",
    url: "https://maps.google.com/",
    note: "Properties / vendors",
  },
  {
    label: "Buildium",
    url: "https://www.buildium.com/",
    note: "Possible PM platform — verify pricing before subscribing",
  },
  {
    label: "AppFolio",
    url: "https://www.appfolio.com/",
    note: "Possible PM platform — verify pricing before subscribing",
  },
  {
    label: "DoorLoop",
    url: "https://www.doorloop.com/",
    note: "Possible PM platform — verify pricing before subscribing",
  },
  {
    label: "TenantCloud",
    url: "https://www.tenantcloud.com/",
    note: "Possible PM platform — verify pricing before subscribing",
  },
  {
    label: "Avail",
    url: "https://www.avail.co/",
    note: "Possible PM platform — verify pricing before subscribing",
  },
];

export const PROPERTY_MGMT_SUPPLIES = {
  starterKitTotal:
    "About $0–50 to start — phone, computer, and free Google tools first. Do not buy expensive software before you have clients.",
  items: [
    {
      id: "phone",
      name: "Smartphone",
      qty: "1",
      estCost: "$0",
      notes: "Essential — already owned",
    },
    {
      id: "computer",
      name: "Computer",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "internet",
      name: "Reliable internet",
      qty: "1",
      estCost: "$0+",
      notes: "Essential",
    },
    {
      id: "email",
      name: "Professional email",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "calendar",
      name: "Calendar",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "storage",
      name: "Document storage",
      qty: "1",
      estCost: "$0",
      notes: "Essential — Drive / Dropbox",
    },
    {
      id: "records",
      name: "Property / client records system",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "vendors",
      name: "Vendor / contact list",
      qty: "1",
      estCost: "$0",
      notes: "Essential",
    },
    {
      id: "pm-software",
      name: "Property-management software",
      qty: "1",
      estCost: "varies",
      notes: "Helpful — after you have clients",
      optional: true,
    },
    {
      id: "esign",
      name: "Electronic signature tool",
      qty: "1",
      estCost: "$0+",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "accounting",
      name: "Accounting / bookkeeping system",
      qty: "1",
      estCost: "$0+",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "inspection",
      name: "Inspection checklist",
      qty: "1",
      estCost: "$0–8",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "keys",
      name: "Key-management system",
      qty: "1",
      estCost: "$5–25",
      notes: "Helpful where appropriate",
      optional: true,
    },
    {
      id: "biz-phone",
      name: "Separate business phone number",
      qty: "1",
      estCost: "$0–15/mo",
      notes: "Helpful",
      optional: true,
    },
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
  {
    id: "pm_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Inspections / repairs / turnovers",
    url: "https://calendar.google.com/",
  },
  {
    id: "pm_drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Property documents",
    url: "https://drive.google.com/",
  },
  {
    id: "pm_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Checklists / reports",
    url: "https://docs.google.com/",
  },
  {
    id: "pm_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Property / vendor tracking",
    url: "https://sheets.google.com/",
  },
  {
    id: "pm_email",
    name: "Email",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Owner / vendor communication",
  },
  {
    id: "pm_maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Properties / vendors",
    url: "https://maps.google.com/",
  },
  {
    id: "pm_buildium",
    name: "Buildium (optional PM platform)",
    freePlanAvailable: false,
    costNote: "Verify current pricing/features before subscribing",
    url: "https://www.buildium.com/",
    optional: true,
  },
  {
    id: "pm_appfolio",
    name: "AppFolio (optional PM platform)",
    freePlanAvailable: false,
    costNote: "Verify current pricing/features before subscribing",
    url: "https://www.appfolio.com/",
    optional: true,
  },
  {
    id: "pm_doorloop",
    name: "DoorLoop (optional PM platform)",
    freePlanAvailable: false,
    costNote: "Verify current pricing/features before subscribing",
    url: "https://www.doorloop.com/",
    optional: true,
  },
  {
    id: "pm_tenantcloud",
    name: "TenantCloud (optional PM platform)",
    freePlanAvailable: true,
    costNote: "Verify current pricing/features before subscribing",
    url: "https://www.tenantcloud.com/",
    optional: true,
  },
  {
    id: "pm_avail",
    name: "Avail (optional PM platform)",
    freePlanAvailable: true,
    costNote: "Verify current pricing/features before subscribing",
    url: "https://www.avail.co/",
    optional: true,
  },
  {
    id: "pm_str",
    name: "Airbnb / VRBO / Hospitable / Guesty / Turno",
    freePlanAvailable: true,
    planLabelApplicable: false,
    costNote: "Possible STR tools — use what fits the client's properties; verify pricing",
    optional: true,
  },
  {
    id: "pm_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Phone + Calendar + Drive + Docs + Sheets",
  },
];

export const PROPERTY_MGMT_PRICING = {
  tabLabel: "Property Management Fee Examples",
  intro: [
    "Displayed range: $1,000–$8,000/month (examples).",
    "",
    "IMPORTANT: This represents possible BUSINESS REVENUE across a portfolio or management operation — NOT guaranteed pay for one property.",
    "",
    "Example:",
    "5 properties × $200 monthly management fee = $1,000/month gross management revenue",
    "20 properties × $250 = $5,000/month gross management revenue",
    "",
    "Additional approved services could increase revenue.",
    "",
    "Actual pricing depends on location, rent/property value, property type, number of units, services included, STR vs long-term, workload, and licensing/legal requirements.",
    "",
    "Always define fees and responsibilities in writing.",
    "",
    "Revenue is NOT the same as profit. Owner rent, deposits, and client funds are NOT your income.",
  ].join("\n"),
  raiseTip:
    "After operating one property well, add doors carefully and raise fees when services expand. Examples only — not income guarantees.",
  items: [
    {
      id: "ltr-flat",
      label: "LONG-TERM — Flat monthly fee per property/unit",
      price: "Example portfolio: $1,000–$8,000/mo",
      notes: "Business revenue examples across multiple doors — not one-property pay",
    },
    {
      id: "ltr-pct",
      label: "LONG-TERM — Percentage of collected rent",
      price: "Common structure",
      notes: "Plus optional leasing / turnover / maintenance coordination fees where permitted",
    },
    {
      id: "ltr-lease",
      label: "LONG-TERM — Leasing / tenant-placement fee",
      price: "Additional fee",
      notes: "Where legally permitted",
    },
    {
      id: "ltr-turn",
      label: "LONG-TERM — Turnover / coordination fee",
      price: "Additional fee",
    },
    {
      id: "str-flat",
      label: "SHORT-TERM — Flat monthly management fee",
      price: "Example portfolio range above",
      notes: "Or percentage of booking revenue / per-turn packages",
    },
    {
      id: "str-guest",
      label: "SHORT-TERM — Guest communication package",
      price: "Package pricing",
    },
    {
      id: "str-full",
      label: "SHORT-TERM — Full-service management package",
      price: "Custom",
      notes: "Define deliverables in writing",
    },
    {
      id: "range",
      label: "DISPLAYED EXAMPLE BUSINESS REVENUE",
      price: "$1,000–$8,000 / month",
      notes: "Portfolio / operation examples only — not guaranteed earnings",
    },
  ],
};

/**
 * Core launch steps (exactly 11). Steps 3–5 are the required marketing block.
 * Legal check is step 2 — BEFORE marketing. Foundation + closing applied by finalize.
 */
export const PROPERTY_MGMT_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose What You Will Manage",
    desc: [
      "Choose:",
      "☐ Long-term rentals",
      "☐ Short-term rentals",
      "☐ Small multifamily",
      "☐ Single-family rentals",
      "☐ Administrative support only",
      "",
      "Services I May Offer:",
      "☐ Tenant/guest communication",
      "☐ Leasing coordination",
      "☐ Showing coordination",
      "☐ Maintenance coordination",
      "☐ Vendor scheduling",
      "☐ Turnovers",
      "☐ Inspection coordination",
      "☐ Owner reports",
      "☐ Calendar management",
      "☐ Listing coordination",
      "☐ Payment/rent tracking where legally permitted",
      "",
      "Do not promise “everything.” Define exactly what you handle.",
    ].join("\n"),
  },
  {
    title: "Check Your Legal Requirements",
    desc: [
      "Before marketing management services:",
      "",
      "Research your state/local requirements.",
      "",
      "Determine:",
      "☐ License required?",
      "☐ Broker affiliation required?",
      "☐ Business registration required?",
      "☐ Insurance needed?",
      "☐ Trust-account rules?",
      "☐ Leasing restrictions?",
      "☐ Security-deposit rules?",
      "☐ Short-term-rental regulations?",
      "☐ Local permits?",
      "",
      "Record:",
      "Rules Checked: __________",
      "Source: __________",
      "Date Checked: __________",
      "",
      "If uncertain, consult the appropriate state/local licensing agency or qualified professional.",
      "",
      "Do not skip this step.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick ONLY 2 or 3 this month.",
      "",
      "Good channels:",
      "☐ Real-estate investor contacts",
      "☐ Landlord referrals",
      "☐ Real-estate agents/brokers",
      "☐ Local investor groups",
      "☐ LinkedIn",
      "☐ Email outreach",
      "☐ Facebook landlord/investor groups",
      "☐ STR host communities",
      "☐ Networking events",
      "☐ Local real-estate associations",
      "",
      "Write:",
      "Properties I Help With: __________",
      "Services: __________",
      "Area: __________",
      "Starting Fee/Structure: __________",
      "",
      "Set measurable goals:",
      "☐ Contact _____ property owners",
      "☐ Contact _____ real-estate professionals",
      "☐ Attend _____ networking event",
      "☐ Ask _____ people for referrals",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "1. One-page service sheet",
      "2. Short introduction",
      "3. Service/package list",
      "4. Sample owner report",
      "5. Contact information",
      "",
      "SAMPLE:",
      "",
      "PROPERTY MANAGEMENT SUPPORT",
      "",
      "Own rental property but don't want to handle every daily task?",
      "",
      "Services may include:",
      "☐ Tenant/Guest Communication",
      "☐ Vendor Coordination",
      "☐ Maintenance Follow-Up",
      "☐ Turnover Coordination",
      "☐ Property Checklists",
      "☐ Owner Reporting",
      "",
      "Serving: __________",
      "Contact: __________",
      "",
      "Only advertise services you are legally permitted and qualified to provide.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY your chosen 2–3 channels.",
      "",
      "This week:",
      "☐ Contact 8–12 appropriate owners/professionals",
      "☐ Send your introduction",
      "☐ Share service sheet",
      "☐ Ask trusted contacts for referrals",
      "☐ Follow up with interested leads",
      "",
      "Sample:",
      "“Hi! I help rental-property owners reduce the day-to-day workload by coordinating communication, vendors, turnovers, maintenance follow-up, and owner reporting. If you or an owner you know needs property-management support, I'd be happy to discuss the property and services needed.”",
      "",
      "Track:",
      "Date | Owner/Contact | Properties | Channel | Response | Follow-Up",
      "",
      "Do not promise services until you confirm they fall within your legal scope.",
    ].join("\n"),
  },
  {
    title: "Screen the Property & Owner",
    desc: [
      "Before accepting:",
      "",
      "Property Type: __________",
      "Units: ______",
      "Location: __________",
      "Occupied/Vacant: __________",
      "Long-Term/STR: __________",
      "",
      "Ask:",
      "What does owner want handled? · Current tenant/guest situation? · Current vendors? · Maintenance issues? · Current software? · Emergency procedures? · Communication expectations? · Reporting expectations? · Who approves expenses? · Who handles funds?",
      "",
      "Watch for unrealistic expectations or unclear authority.",
    ].join("\n"),
  },
  {
    title: "Define Responsibilities in Writing",
    desc: [
      "Create a clear agreement appropriate to local requirements.",
      "",
      "Define:",
      "☐ Properties covered",
      "☐ Services included",
      "☐ Services excluded",
      "☐ Management fee",
      "☐ Additional fees",
      "☐ Owner responsibilities",
      "☐ Manager responsibilities",
      "☐ Spending authorization",
      "☐ Vendor procedures",
      "☐ Emergency procedures",
      "☐ Communication schedule",
      "☐ Reporting schedule",
      "☐ Start/end terms",
      "",
      "Never rely only on: “Don't worry — I'll handle it.”",
    ].join("\n"),
  },
  {
    title: "Build Your Property System",
    desc: [
      "Create a file/dashboard for EACH property.",
      "",
      "PROPERTY:",
      "Address/Identifier: __________",
      "Owner: __________",
      "Tenant/Guest Contact: __________",
      "",
      "Track:",
      "☐ Lease/booking information",
      "☐ Important dates",
      "☐ Vendors",
      "☐ Maintenance",
      "☐ Inspections",
      "☐ Turnovers",
      "☐ Keys/access",
      "☐ Communications",
      "☐ Expenses where appropriate",
      "☐ Owner approvals",
      "",
      "Keep sensitive information secure.",
    ].join("\n"),
  },
  {
    title: "Run Day-to-Day Operations",
    desc: [
      "Create repeatable routines.",
      "",
      "DAILY/AS NEEDED:",
      "☐ Check communications",
      "☐ Handle requests",
      "☐ Contact vendors",
      "☐ Update owner when needed",
      "☐ Document important issues",
      "",
      "WEEKLY:",
      "☐ Review open maintenance",
      "☐ Review upcoming dates",
      "☐ Follow up with vendors",
      "☐ Check unresolved issues",
      "☐ Update property records",
      "",
      "STR may also require:",
      "☐ Guest communication",
      "☐ Cleaner coordination",
      "☐ Turnover verification",
      "☐ Supply monitoring",
      "☐ Calendar checks",
    ].join("\n"),
  },
  {
    title: "Report to the Owner",
    desc: [
      "Send an organized owner update.",
      "",
      "PROPERTY: __________",
      "PERIOD: __________",
      "",
      "Include:",
      "Occupancy/Status: __________",
      "Maintenance: ____________________",
      "Vendor Work: ____________________",
      "Tenant/Guest Issues: ____________________",
      "Upcoming Items: ____________________",
      "Owner Decisions Needed: ____________________",
      "Financial information where authorized: ____________________",
      "",
      "A good owner should not have to ask: “What's happening with my property?”",
    ].join("\n"),
  },
  {
    title: "Grow Your Portfolio",
    desc: [
      "After operating successfully:",
      "",
      "Ask satisfied owners for:",
      "☐ Testimonial",
      "☐ Referral",
      "☐ Additional properties",
      "",
      "Track capacity.",
      "Current Properties: _____",
      "Maximum I Can Handle Well: _____",
      "",
      "Do NOT add properties faster than your systems can support.",
      "",
      "Growth options: 1 property → several properties → small portfolio → recurring management operation",
      "",
      "Before expanding, consider:",
      "☐ Better software",
      "☐ Vendor network",
      "☐ Standard checklists",
      "☐ Bookkeeping support",
      "☐ Assistant/admin support",
      "☐ Additional licensing/compliance needs",
    ].join("\n"),
  },
];

export function propertyMgmtToolsDisclaimer(): string {
  return [
    "Beginner stack: Phone + Calendar + Drive + Docs + Sheets.",
    "",
    "Do not buy expensive property-management software before you have clients.",
    "",
    "Use PM / STR platforms appropriate to the client's properties and verify current pricing/features before subscribing.",
    "",
    "Owner rent, deposits, and client funds are NOT your personal income.",
  ].join("\n");
}

/** Pure property-management portfolio math (manager fees only — not owner rent). */
export function computePropertyMgmtRevenue(input: {
  properties: number;
  averageMonthlyFee: number;
  leasingFees: number;
  turnoverFees: number;
  otherServiceRevenue: number;
  softwareCost: number;
  adminExpense: number;
  insuranceExpense: number;
  travelExpense: number;
  otherExpenses: number;
  monthlyWorkHours: number;
}): {
  managementRevenue: number;
  grossMonthlyRevenue: number;
  monthlyExpenses: number;
  estimatedMonthlyProfit: number;
  effectiveHourlyRate: number | null;
} {
  const properties = Math.max(0, Number(input.properties) || 0);
  const fee = Math.max(0, Number(input.averageMonthlyFee) || 0);
  const leasing = Math.max(0, Number(input.leasingFees) || 0);
  const turnover = Math.max(0, Number(input.turnoverFees) || 0);
  const otherRev = Math.max(0, Number(input.otherServiceRevenue) || 0);
  const managementRevenue = properties * fee;
  const grossMonthlyRevenue = managementRevenue + leasing + turnover + otherRev;
  const monthlyExpenses =
    Math.max(0, Number(input.softwareCost) || 0) +
    Math.max(0, Number(input.adminExpense) || 0) +
    Math.max(0, Number(input.insuranceExpense) || 0) +
    Math.max(0, Number(input.travelExpense) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedMonthlyProfit = grossMonthlyRevenue - monthlyExpenses;
  const hours = Math.max(0, Number(input.monthlyWorkHours) || 0);
  return {
    managementRevenue,
    grossMonthlyRevenue,
    monthlyExpenses,
    estimatedMonthlyProfit,
    effectiveHourlyRate: hours > 0 ? estimatedMonthlyProfit / hours : null,
  };
}
