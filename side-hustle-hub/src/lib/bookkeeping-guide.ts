/**
 * Bookkeeping & Admin Support (`bookkeeping`, Guide #039).
 * Basic bookkeeping and admin for solopreneurs — not CPA/tax/legal/investment advice.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const BOOKKEEPING_REALITY_CHECK = {
  title: "KNOW THE LINE BETWEEN BOOKKEEPING AND PROFESSIONAL ACCOUNTING",
  body: [
    "This guide focuses on basic bookkeeping and administrative support.",
    "",
    "You may help with authorized tasks such as:",
    "- Recording/categorizing transactions",
    "- Organizing receipts",
    "- Tracking invoices",
    "- Recording payments",
    "- Basic account reconciliation support",
    "- QuickBooks data entry/setup basics",
    "- Calendar management",
    "- Document/file organization",
    "- Basic recurring reports",
    "",
    "Do NOT present yourself as a CPA, tax professional, attorney, payroll specialist, or financial adviser unless you actually hold the required qualifications.",
    "",
    "Do not give tax/legal/investment advice. Do not make unsupported accounting adjustments. Escalate tax filings, complex accounting questions, unusual transactions, and professional-accounting decisions to the client’s qualified professional.",
    "",
    "Protect financial and customer information carefully.",
    "",
    "Tagline: Clean Books. Clear Calendar. Less Back-Office Chaos.",
  ].join("\n"),
};

export const BOOKKEEPING_NOTES_WORKSHEET = `MY BOOKKEEPING & ADMIN SERVICE

Services Offered: __________
Services I Do NOT Offer: __________
Hourly Rate: $____
Monthly Package: $____
Included Hours: ____

Marketing Channels:
1. ________
2. ________
3. ________

CLIENT INTAKE

Client/Business: ________
Software: ________
Bookkeeping Tasks: ________
Admin Tasks: ________
Invoice Workflow: ________
Calendar Workflow: ________
Reporting Schedule: ________
Approver: ________
Accountant/CPA: ________
Access Reviewed: ☐
MFA Used Where Available: ☐

MONTHLY CHECKLIST

Transactions Entered: ☐
Expenses Organized: ☐
Receipts Matched/Flagged: ☐
Invoices Updated: ☐
Payments Updated: ☐
Reconciliation/Review Completed as Authorized: ☐
Unresolved Items Listed: ☐
Calendar Updated: ☐
Admin Tasks Updated: ☐
Client Summary Sent: ☐

MONTHLY RESULTS

Billable Hours: ____
Revenue: $____
Business Expenses: $____
Estimated Profit: $____
Non-Billable Hours: ____
Effective Profit/Hour: $____

Client Questions: __________
Items for CPA/Professional Review: __________
Process Improvements: __________
Next Month Priorities: __________
Rebooked/Retainer: ☐ Yes ☐ Maybe ☐ No

GYSH PRO TIP
YOUR VALUE IS NOT JUST “ENTERING NUMBERS.”
Your value is creating a back office where the client can quickly answer:
WHO OWES ME? WHAT DID I SPEND? WHAT IS MISSING? WHAT NEEDS MY ATTENTION? WHAT IS ON MY CALENDAR?
ACCURACY + ORGANIZATION + CONFIDENTIALITY + CONSISTENCY = A SERVICE CLIENTS KEEP.

ELITE CHALLENGE
Build a FICTIONAL SMALL-BUSINESS BACK-OFFICE DEMO.
Create:
1. Invoice tracker
2. Expense tracker
3. Receipt folder structure
4. Exceptions/questions list
5. Weekly calendar
6. Monthly client summary
7. Recurring task checklist
Use fictional data only.
Practice explaining:
- What you handle
- What the client approves
- What gets escalated to a CPA/accountant
- How you protect access and financial information`;

export const BOOKKEEPING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Help solopreneurs and small businesses stay organized with invoice tracking, basic bookkeeping data entry, QuickBooks basics, expense organization, calendar operations, document organization, and recurring administrative support. Tagline: Clean Books. Clear Calendar. Less Back-Office Chaos. Category: Business Services / Bookkeeping / Administration. Best for Adults and Seniors / Retirees. Beginner to intermediate · Very low to low startup · Flexible / recurring · Remote / local · Hourly / monthly retainer / project · 5 - 15 hrs/week · Elite Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Strong organization and attention to detail · Spreadsheet basics · Basic bookkeeping concepts · Basic QuickBooks familiarity if offering QuickBooks work · Email/calendar skills · Secure computer/internet · Client authorization · Confidentiality/privacy habits · Clear service agreement/scope.",
  },
  {
    id: "terms",
    label: "Basic terms to know",
    detail:
      "Income/Revenue · Expense · Invoice · Bill · Accounts Receivable · Accounts Payable · Bank Reconciliation · Profit & Loss · Balance Sheet · Receipt/Source Document.",
  },
  {
    id: "before-starting",
    label: "Before starting",
    detail:
      "Confirm business/entity name · Scope · Software · Accounts you may access · Reporting period · Client’s chart/categories · Invoice workflow · Calendar/admin tasks · Deadlines · Communication process · Who approves changes/payments · Who the accountant/CPA is when applicable. Never request more system access than the job requires.",
  },
];

export const BOOKKEEPING_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "QuickBooks Online", url: "https://quickbooks.intuit.com/", note: "Client-approved bookkeeping platform" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Trackers and simple books" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Calendar operations" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Service sheet and summaries" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Secure client file storage" },
];

export const BOOKKEEPING_SUPPLIES = {
  starterKitTotal:
    "About $0–40 to start — use the client’s approved software; do not store financial records on unsecured devices or public/shared folders",
  items: [
    { id: "computer", name: "Computer", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Reliable internet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "email", name: "Secure email", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "calculator", name: "Calculator", qty: "1", estCost: "$0–8", notes: "Essential" },
    { id: "sheets", name: "Spreadsheet software", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "calendar", name: "Calendar", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "storage", name: "Secure file storage", qty: "1", estCost: "$0", notes: "Essential — client-approved" },
    { id: "platform", name: "Client-approved bookkeeping / admin platform", qty: "1", estCost: "$0+", notes: "Essential — client provides access" },
    { id: "qbo", name: "QuickBooks Online", qty: "1", estCost: "$0+", notes: "Helpful if the client uses it", optional: true },
    { id: "workspace", name: "Google Workspace / Microsoft 365", qty: "1", estCost: "$0+", notes: "Helpful", optional: true },
    { id: "scanner", name: "Scanner / scanning app", qty: "1", estCost: "$0–15", notes: "Helpful", optional: true },
    { id: "pwm", name: "Password manager", qty: "1", estCost: "$0–4/mo", notes: "Helpful — security", optional: true },
    { id: "mfa", name: "Two-factor authentication", qty: "1", estCost: "$0", notes: "Helpful — required where available", optional: true },
    { id: "headset", name: "Headset for client calls", qty: "1", estCost: "$15–40", notes: "Helpful", optional: true },
    { id: "timer", name: "Time tracker", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
  ],
};

export const BOOKKEEPING_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "bk_qbo",
    name: "QuickBooks Online",
    freePlanAvailable: false,
    costNote: "Use only where the client already uses it — verify current features and pricing",
    url: "https://quickbooks.intuit.com/",
  },
  {
    id: "bk_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Invoice / expense trackers and simple books",
    url: "https://sheets.google.com/",
  },
  {
    id: "bk_excel",
    name: "Microsoft Excel",
    freePlanAvailable: false,
    costNote: "Client spreadsheet work",
    optional: true,
  },
  {
    id: "bk_gcal",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Calendar operations",
    url: "https://calendar.google.com/",
  },
  {
    id: "bk_outlook_cal",
    name: "Outlook Calendar",
    freePlanAvailable: false,
    costNote: "Client calendar if they use Microsoft 365",
    optional: true,
  },
  {
    id: "bk_gmail",
    name: "Gmail",
    freePlanAvailable: true,
    costNote: "Inbox organization with client permission",
  },
  {
    id: "bk_outlook",
    name: "Outlook",
    freePlanAvailable: false,
    costNote: "Email / calendar when the client uses Microsoft",
    optional: true,
  },
  {
    id: "bk_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Service sheet, monthly summaries, intake notes",
    url: "https://docs.google.com/",
  },
  {
    id: "bk_word",
    name: "Microsoft Word",
    freePlanAvailable: false,
    costNote: "Document preparation",
    optional: true,
  },
  {
    id: "bk_drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Secure folders — never public/shared folders for financial records",
    url: "https://drive.google.com/",
  },
  {
    id: "bk_onedrive",
    name: "OneDrive",
    freePlanAvailable: false,
    costNote: "Client-approved file storage",
    optional: true,
  },
  {
    id: "bk_dropbox",
    name: "Dropbox",
    freePlanAvailable: false,
    costNote: "Only where the client approves",
    optional: true,
  },
  {
    id: "bk_tasks",
    name: "Trello / Asana / ClickUp",
    freePlanAvailable: true,
    costNote: "Where the client already uses them",
    optional: true,
  },
  {
    id: "bk_timer",
    name: "Time tracker",
    freePlanAvailable: true,
    costNote: "Billable vs non-billable hours",
    optional: true,
  },
  {
    id: "bk_pwm",
    name: "Password manager",
    freePlanAvailable: true,
    costNote: "Never casually exchange passwords by text/email",
    optional: true,
  },
  {
    id: "bk_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "QuickBooks or client system + Sheets/Excel + Calendar + secure file storage",
  },
];

export const BOOKKEEPING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "Keep displayed pricing: $25 – $60 / hour (examples).",
    "",
    "Possible recurring model: Estimated Monthly Hours × Hourly Rate = Starter Retainer.",
    "Example: 8 hours/month × $35 = $280/month.",
    "Define what the retainer includes and how extra hours are approved.",
    "Never quote work you do not understand just to win the client.",
  ].join("\n"),
  raiseTip:
    "Possible projects: receipt/expense cleanup, invoice tracker setup, QuickBooks basic setup/organization, calendar/admin cleanup, monthly bookkeeping support. Displayed range: $25 – $60 / hour (examples). Examples only — not income guarantees.",
  items: [
    {
      id: "admin",
      label: "Basic admin / organization",
      price: "$25–$35/hour",
      notes: "Calendar, files, inbox organization, routine follow-up",
    },
    {
      id: "entry",
      label: "Bookkeeping data entry / invoice tracking",
      price: "$30–$45/hour",
      notes: "Transactions, receipts, invoice/payment status",
    },
    {
      id: "qbo",
      label: "More experienced bookkeeping / QuickBooks support",
      price: "$40–$60+/hour",
      notes: "Authorized reconciliation support and basic setup/organization",
    },
    { id: "cleanup", label: "Project: Receipt / expense cleanup", price: "Quote hours × rate" },
    { id: "tracker", label: "Project: Invoice tracker setup", price: "Quote hours × rate" },
    { id: "setup", label: "Project: QuickBooks basic setup / organization", price: "Quote hours × rate" },
    { id: "calendar", label: "Project: Calendar / admin cleanup", price: "Quote hours × rate" },
    { id: "monthly", label: "Recurring: Monthly bookkeeping support", price: "Hours × rate (retainer)" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only — never ✓. */
export const BOOKKEEPING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Choose Your Service Lane",
    desc: [
      "Start with services you can perform accurately.",
      "",
      "BOOKKEEPING:",
      "☐ Transaction data entry",
      "☐ Expense categorization",
      "☐ Receipt organization",
      "☐ Invoice tracking",
      "☐ Payment status tracking",
      "☐ Basic reconciliation support",
      "☐ Basic recurring reports",
      "",
      "ADMIN:",
      "☐ Calendar management",
      "☐ Appointment scheduling",
      "☐ Inbox organization",
      "☐ File organization",
      "☐ Spreadsheet tracking",
      "☐ Routine follow-up",
      "☐ Document preparation",
      "",
      "Write:",
      "I OFFER: ________",
      "I DO NOT OFFER: ________",
      "",
      "Do not claim professional credentials you do not hold.",
    ].join("\n"),
  },
  {
    title: "Create Your Starter Package",
    desc: [
      "Example:",
      "",
      "BOOKKEEPING & ADMIN STARTER",
      "- Up to ____ hours/month",
      "- Invoice tracker",
      "- Expense/receipt organization",
      "- Basic bookkeeping entry",
      "- Calendar/admin support",
      "- Monthly task summary",
      "",
      "Rate: $____/hour or Monthly Package: $____",
      "",
      "Define: Included hours · Tasks · Turnaround · Meeting frequency · Extra-hour approval · Revision/correction process.",
      "See Suggested Pricing — $25 – $60 / hour (examples).",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way potential clients hear about your service. Pick only 2 or 3 this month.",
      "",
      "Strong channels:",
      "☐ Referrals",
      "☐ LinkedIn",
      "☐ Email outreach",
      "☐ Local small-business networking",
      "☐ Facebook business groups",
      "☐ Chamber/business groups",
      "☐ Existing professional contacts",
      "☐ Direct outreach to appropriate solopreneurs",
      "",
      "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have).",
      "",
      "Write:",
      "What I Offer: Bookkeeping & Admin Support",
      "Starting Rate: $____",
      "Ideal Client: ________",
      "",
      "Set ONE measurable goal per channel. Examples:",
      "- Contact 10 solopreneurs",
      "- Ask 5 contacts for referrals",
      "- Connect with 10 local businesses",
      "- Publish 2 useful bookkeeping/admin tips",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create:",
      "- Short service description",
      "- Service list",
      "- Starting rate/package",
      "- Professional contact information",
      "- Simple one-page flyer/service sheet",
      "- Optional sample invoice tracker/dashboard using fictional data",
      "",
      "Sample:",
      "",
      "BACK OFFICE GETTING MESSY?",
      "",
      "I help solopreneurs stay organized with:",
      "- Invoice Tracking",
      "- Expense & Receipt Organization",
      "- Basic Bookkeeping Support",
      "- QuickBooks Basics",
      "- Calendar & Admin Operations",
      "",
      "Rates start at $____/hour.",
      "",
      "Organized support — without pretending to be your CPA.",
      "",
      "Never use real client financial information in portfolio samples.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the selected 2–3 channels.",
      "",
      "This week:",
      "- Contact 8–12 qualified prospects",
      "- Ask for referrals",
      "- Share your service sheet",
      "- Follow up professionally",
      "- Track responses",
      "",
      "Sample:",
      "“Hi! I provide bookkeeping and administrative support for solopreneurs who have outgrown spreadsheets or need help keeping invoices, expenses, QuickBooks basics, calendars, and recurring admin organized. My rates start at $____/hour.”",
      "",
      "Track: Date | Prospect | Channel | Need | Response | Follow-Up",
      "",
      "Do not spam or make promises about tax savings or financial outcomes.",
    ].join("\n"),
  },
  {
    title: "Complete Client Intake & Define Access",
    desc: [
      "Collect:",
      "Client/Business: ________",
      "Contact: ________",
      "Software: ________",
      "Bookkeeping Tasks: ________",
      "Admin Tasks: ________",
      "Reporting Period: ________",
      "Invoice Process: ________",
      "Calendar Process: ________",
      "Deadlines: ________",
      "Approver: ________",
      "Accountant/CPA Contact if applicable: ________",
      "Meeting Schedule: ________",
      "",
      "ACCESS: Only request the permissions required. Use separate user access/roles when the platform supports them. Use multi-factor authentication where available. Do not casually exchange passwords through text/email.",
    ].join("\n"),
  },
  {
    title: "Organize the Workflow",
    desc: [
      "Create a repeatable workflow.",
      "",
      "BOOKKEEPING EXAMPLE: Source Documents → Record → Categorize → Match/Review → Reconcile/Flag → Report",
      "",
      "ADMIN EXAMPLE: Request → Schedule/Record → Confirm → Complete → Update Client",
      "",
      "Set up folders:",
      "01 Incoming",
      "02 Receipts",
      "03 Invoices",
      "04 Statements",
      "05 Reports",
      "06 Admin",
      "07 Needs Client Review",
      "",
      "Never delete original records just because you created a cleaner copy.",
    ].join("\n"),
  },
  {
    title: "Process Invoices, Expenses & Basic Bookkeeping",
    desc: [
      "For authorized bookkeeping tasks:",
      "- Record transactions accurately",
      "- Use the client’s approved categories/chart",
      "- Attach/organize receipts where applicable",
      "- Track customer invoices",
      "- Record payment status",
      "- Identify missing documentation",
      "- Flag unclear transactions",
      "- Avoid guessing",
      "",
      "Create an exceptions list: Date | Transaction | Amount | Question | Client Answer | Resolved",
      "",
      "If you are unsure how something should be treated, flag it for the client/accountant rather than inventing an answer.",
    ].join("\n"),
  },
  {
    title: "Handle Calendar & Admin Operations",
    desc: [
      "For approved admin tasks:",
      "- Add appointments",
      "- Confirm dates/times/time zones",
      "- Avoid double-booking",
      "- Add meeting links/locations",
      "- Send approved reminders",
      "- Maintain task lists",
      "- Organize files",
      "- Track routine follow-ups",
      "",
      "Before canceling, moving, or committing the client to an appointment, follow their authorization rules.",
      "",
      "For sensitive emails/documents, confirm what you are permitted to send or access.",
    ].join("\n"),
  },
  {
    title: "Review, Reconcile & Report",
    desc: [
      "At the agreed interval:",
      "- Check work for duplicates/errors",
      "- Compare records to available source documents",
      "- Complete authorized basic reconciliation workflow",
      "- Identify missing receipts/invoices",
      "- List unresolved questions",
      "- Review outstanding invoices",
      "- Review upcoming admin deadlines",
      "- Prepare a simple client summary",
      "",
      "MONTHLY SUMMARY:",
      "Work Completed: ________",
      "Invoices Outstanding: ________",
      "Missing Documents: ________",
      "Items Needing Client/CPA Review: ________",
      "Upcoming Deadlines: ________",
      "Hours Used: ________",
      "",
      "Do not silently “fix” unusual discrepancies without documentation/approval.",
    ].join("\n"),
  },
  {
    title: "Close the Month & Build a Recurring System",
    desc: [
      "Review with the client:",
      "- What was completed?",
      "- What remains unresolved?",
      "- What should change next month?",
      "- Which tasks repeat?",
      "- How many hours are actually needed?",
      "",
      "Create next month’s recurring checklist.",
      "",
      "Ask: “Would you like me to reserve ____ hours each month to keep this workflow current?”",
      "",
      "GOOD RECORDS → FEWER MISSING ITEMS → FASTER FOLLOW-UP → CLEARER BUSINESS OPERATIONS → RECURRING SUPPORT",
    ].join("\n"),
  },
];

export function bookkeepingToolsDisclaimer(): string {
  return "Beginner stack: QuickBooks or the client’s system + Sheets/Excel + Calendar + secure file storage. Use the client’s approved software and permissions. Verify current QuickBooks/platform features and pricing. Never store client financial records on unsecured devices or public/shared folders. You are not their CPA unless you actually are one.";
}

/** Weekly bookkeeping/admin profit math. Monthly retainers convert with ÷ 4.33. */
export function computeBookkeepingProfit(input: {
  hourlyRate: number;
  billableHoursPerWeek: number;
  monthlyRetainerRevenue?: number;
  softwareCost?: number;
  insuranceBusinessCost?: number;
  advertising?: number;
  travel?: number;
  otherExpenses?: number;
  nonBillableAdminHoursPerWeek?: number;
}): {
  weeklyHourlyRevenue: number;
  weeklyRetainerEquivalent: number;
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  totalWorkingHours: number;
  effectiveProfitPerWorkingHour: number | null;
} {
  const rate = Math.max(0, Number(input.hourlyRate) || 0);
  const billable = Math.max(0, Number(input.billableHoursPerWeek) || 0);
  const weeklyHourlyRevenue = rate * billable;
  const weeklyRetainerEquivalent = Math.max(0, Number(input.monthlyRetainerRevenue) || 0) / 4.33;
  const weeklyRevenue = weeklyHourlyRevenue + weeklyRetainerEquivalent;
  const weeklyExpenses =
    Math.max(0, Number(input.softwareCost) || 0) +
    Math.max(0, Number(input.insuranceBusinessCost) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.travel) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const nonBillable = Math.max(0, Number(input.nonBillableAdminHoursPerWeek) || 0);
  const totalWorkingHours = billable + nonBillable;
  return {
    weeklyHourlyRevenue,
    weeklyRetainerEquivalent,
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    totalWorkingHours,
    effectiveProfitPerWorkingHour: totalWorkingHours > 0 ? weeklyProfit / totalWorkingHours : null,
  };
}
