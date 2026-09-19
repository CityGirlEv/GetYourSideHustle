/**
 * Closet Organizer (`closet-organizer`, Guide #048).
 * Starter Membership. 2 - 8 hrs/week. Displayed $10 – $40 / job (examples).
 * Plain data only — no imports from guide-tools.
 */

export const CLOSET_ORGANIZER_REALITY_CHECK = {
  title: "THE CLIENT DECIDES WHAT LEAVES",
  body: [
    "Help clients sort clothing and closet contents into keep, donate, sell, relocate, recycle, and discard categories; then create a simple layout the client can maintain—without making decisions, appraisals, or disposal choices for them.",
    "",
    "A Closet Organizer guides the process but does not pressure, discard, donate, sell, photograph, or remove belongings without the client's clear permission.",
    "",
    "Before quoting confirm: closet type and approximate size; current condition; volume of items; client goals; mobility/access needs; sorting only or full organizing; donation/sale/disposal expectations; containers and supplies; travel/parking; who will be present; session length; price.",
    "",
    "Treat every item, label, photograph, document, medication, and personal detail as private.",
    "",
    "Do not make disposal decisions for the client. Do not promise resale value or tax deductions. Do not provide appraisals unless qualified. Do not take valuables offsite without written authorization. Do not handle weapons, medications, financial papers, identity documents, biohazards, or unsafe materials beyond your role. Do not move heavy furniture or install shelving beyond your training/equipment. Do not photograph or post a client's space without explicit permission.",
    "",
    "Business licenses, insurance, waste rules, donation-receipt practices, resale-platform rules, and youth-work requirements vary by location. Verify locally.",
    "",
    "Tagline: Less Clutter. Clear Decisions. A Closet That Works.",
  ].join("\n"),
};

export const CLOSET_ORGANIZER_NOTES_WORKSHEET = `CLOSET ORGANIZER NOTES

BUSINESS SETUP
Service Area: ________
Minimum Session: ________
Hourly/Package Rate: $____
Travel Rule: ________
Photo Policy: ________
Donation Removal Policy: ________

CLIENT
Name: ________
Private Address: ________
Contact: ________
Who Will Be Present: ________
Goal: ________
Accessibility Needs: ________
Hazards/Sensitive Items: ________

PROJECT
Closet Type/Size: ________
Estimated Volume: ________
Sorting Categories: ________
Included: ________
Excluded: ________
Supplies: ________
Quoted Price: $____
Estimated Hours: ____
Actual Hours: ____
Expenses: $____
Profit: $____

ITEM REMOVAL
Donation Authorized: ☐
Disposal Authorized: ☐
Resale Work Separately Agreed: ☐
Items/Count: ________
Receipt/Confirmation Delivered: ☐

FOLLOW-UP
Maintenance Check Date: ________
Review Requested: ☐
Referral Requested: ☐
Next Area: ________

GYSH PRO TIP
An organized closet is successful only if the client can keep using the system after you leave.

CLIENT GOAL → CLEAR CATEGORIES → CLIENT DECISIONS → SIMPLE ZONES → FOLLOW-UP → NEXT PROJECT.

STARTER MEMBERSHIP CHALLENGE
Complete your first 3 organizing opportunities:
1. Define 3 packages.
2. Write privacy and decision rules.
3. Set session prices.
4. Build one intake form.
5. Create sorting signs.
6. Organize a demonstration closet with permission.
7. Choose 2–3 marketing channels.
8. Contact 10 trusted prospects/referral sources.
9. Track actual hours and profit.
10. Ask successful clients for a review/referral.`;

export const CLOSET_ORGANIZER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Help clients sort clothing and closet contents into keep, donate, sell, relocate, recycle, and discard categories; then create a simple layout the client can maintain. Tagline: Less Clutter. Clear Decisions. A Closet That Works. Category: Home Organization & Local Services. Best for teens, adults, and seniors who are patient, nonjudgmental, organized, and respectful of privacy. Beginner · Very Low startup · Flexible / Appointment-Based · Client Homes / Bedrooms / Entry Closets / Storage Areas · Per Session / Hourly / Project Packages / Add-Ons · 2 - 8 hrs/week · Starter Membership. Displayed $10 – $40 / job is examples only.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable phone · Transportation/service area plan · Parent/guardian involvement if under 18 · Comfortable closed-toe shoes · Client intake and scope checklist · Sorting-category system · Pricing/quote system · Calendar · Payment method · Income/expense tracking.",
  },
  {
    id: "before",
    label: "Before accepting",
    detail:
      "Ask about: closet dimensions or photos with permission; stairs; pets; smoke, pests, mold, water damage, strong odors, bodily fluids, needles/sharps, or other hazards; heavy shelves/furniture; whether items include valuables, documents, medication, weapons, adult/private content, or sentimental belongings; whether donation transport, resale listing, cleaning, or installation is requested.",
  },
  {
    id: "parent",
    label: "Privacy and decision rules",
    detail:
      "The client makes all keep/donate/sell/discard decisions. No photos without permission. No sharing personal information. No handling weapons/medications/identity documents. Minors should work only with parent/guardian approval and an appropriate adult present.",
  },
];

export const CLOSET_ORGANIZER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Forms", url: "https://forms.google.com/", note: "Client intake and photo permission" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Scope, session plan, donation authorization" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Measurements, supply list, clients, income, expenses" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Sessions and follow-up" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Travel planning" },
  { label: "Canva", url: "https://www.canva.com/", note: "Simple service/package graphic" },
];

export const CLOSET_ORGANIZER_SUPPLIES = {
  starterKitTotal: "About $20–45 for labels, bags, tape, and basic sorting supplies — measure before buying client-specific bins",
  items: [
    { id: "phone", name: "Phone", qty: "1 (usually owned)", estCost: "$0", notes: "Essential" },
    { id: "shoes", name: "Closed-toe/non-slip shoes", qty: "1 pair", estCost: "$0", notes: "Essential" },
    { id: "gloves", name: "Work gloves for dusty items where appropriate", qty: "1 pair", estCost: "$4–8", notes: "Essential" },
    { id: "sanitizer", name: "Hand sanitizer", qty: "1 bottle", estCost: "$2–5", notes: "Essential" },
    { id: "tape", name: "Painter's tape", qty: "1 roll", estCost: "$3–8", notes: "Essential" },
    { id: "labels", name: "Removable labels or sticky notes", qty: "1 pack", estCost: "$3–8", notes: "Essential" },
    { id: "markers", name: "Markers", qty: "1 set", estCost: "$3–8", notes: "Essential" },
    { id: "tape-measure", name: "Measuring tape", qty: "1", estCost: "$4–10", notes: "Essential" },
    { id: "trash", name: "Trash bags", qty: "1 pack", estCost: "$3–8", notes: "Essential" },
    { id: "donation", name: "Donation bags/boxes", qty: "1 pack", estCost: "$4–10", notes: "Essential" },
    { id: "signs", name: "Reusable sorting signs", qty: "1 set", estCost: "$0–10", notes: "Essential" },
    { id: "notebook", name: "Small notebook/checklist", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "label-maker", name: "Portable label maker", qty: "1", estCost: "$15–35", notes: "Helpful", optional: true },
    { id: "zip-bags", name: "Clear zipper bags", qty: "1 pack", estCost: "$4–10", notes: "Helpful", optional: true },
    { id: "garment", name: "Garment bags", qty: "2–4", estCost: "$5–15", notes: "Helpful", optional: true },
    { id: "dividers", name: "Shelf dividers", qty: "Assorted", estCost: "$8–20", notes: "Helpful", optional: true },
    { id: "drawer", name: "Drawer organizers", qty: "Assorted", estCost: "$10–25", notes: "Helpful — after client approval", optional: true },
    { id: "hangers", name: "Matching hangers only after client approval", qty: "Assorted", estCost: "$10–30", notes: "Helpful", optional: true },
    { id: "stool", name: "Foldable step stool only when safe and appropriate", qty: "1", estCost: "$15–35", notes: "Helpful", optional: true },
    { id: "cloths", name: "Basic dusting cloths if light cleaning is included", qty: "2–4", estCost: "$3–8", notes: "Helpful", optional: true },
  ],
};

export const CLOSET_ORGANIZER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Client intake and photo permission", url: "https://forms.google.com/" },
  { id: "docs", name: "Google Docs", freePlanAvailable: true, costNote: "Scope, session plan, donation authorization", url: "https://docs.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Measurements, supply list, clients, income, expenses", url: "https://sheets.google.com/" },
  { id: "calendar", name: "Calendar", freePlanAvailable: true, costNote: "Sessions and follow-up", url: "https://calendar.google.com/" },
  { id: "maps", name: "Maps", freePlanAvailable: true, planLabelApplicable: false, costNote: "Travel planning", url: "https://maps.google.com/" },
  { id: "camera", name: "Phone Camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Assessment/before-after only with permission" },
  { id: "notes", name: "Notes App", freePlanAvailable: true, planLabelApplicable: false, costNote: "Measurements and category counts" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Simple service/package graphic", url: "https://www.canva.com/" },
  { id: "pay", name: "Payment App/Processor", freePlanAvailable: true, costNote: "Approved payments", optional: true },
  { id: "resale", name: "Resale Platform", freePlanAvailable: true, costNote: "Only when separately agreed and account rules are followed", optional: true },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Intake Form + Sorting Signs + Measurement Sheet + Session Checklist + Job/Profit Tracker" },
];

export const CLOSET_ORGANIZER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $10 – $40 / job (examples, not guarantees).",
    "That displayed range is appropriate for a very small reset or known-family task. Larger closets should be priced by session, scope, travel, and add-ons.",
    "",
    "STARTER PACKAGE EXAMPLES",
    "30-Minute Closet Reset: $15 – $35",
    "One-Hour Sort Session: $25 – $50",
    "Two-Hour Standard Closet Session: $50 – $100",
    "Three-Hour Closet Reset: $75 – $150",
    "Two-Visit Wardrobe/Closet Project: $140 – $300 depending on scope",
    "",
    "COMMON ADD-ONS — EXAMPLES",
    "Donation Bagging/Labeling: $10 – $30",
    "Donation Drop-Off: $15 – $40 plus mileage/parking where appropriate",
    "Resale Item Photo/Measurement Prep: $5 – $12 per item or package quote",
    "Container Shopping Plan: $20 – $50",
    "Supply Pickup: agreed fee plus reimbursement with receipts",
    "Shelf/Drawer Labels: $10 – $30 plus materials",
    "",
    "Do not combine resale selling, consignment, or item removal into the base service unless ownership, fees, account control, payment flow, unsold items, and deadlines are documented separately.",
    "",
    "PRICING FORMULA",
    "Estimated Session Hours × Target Hourly Value + Travel/Parking + Supplies + Donation/Resale Add-Ons + Disposal Fees if authorized = Quote",
    "",
    "MONTHLY EXAMPLES",
    "4 one-hour jobs/month × $35 = $140 gross/month",
    "4 two-hour jobs/month × $75 = $300 gross/month",
    "8 mixed sessions/month × $90 = $720 gross/month",
    "",
    "Gross revenue is NOT profit.",
    "Do not guarantee earnings. Actual results depend on local demand, project condition, hours, client decisions, travel, supplies, taxes, and expenses.",
  ].join("\n"),
  raiseTip:
    "Displayed $10 – $40 / job fits a very small reset. Larger closets should be priced by session, scope, travel, and add-ons.",
  items: [
    { id: "reset-30", label: "30-minute closet reset", price: "$15 – $35", notes: "Examples only" },
    { id: "sort-1h", label: "One-hour sort session", price: "$25 – $50", notes: "Examples only" },
    { id: "standard-2h", label: "Two-hour standard closet session", price: "$50 – $100", notes: "Examples only" },
    { id: "reset-3h", label: "Three-hour closet reset", price: "$75 – $150", notes: "Examples only" },
    { id: "two-visit", label: "Two-visit wardrobe/closet project", price: "$140 – $300", notes: "Examples only" },
  ],
};

export const CLOSET_ORGANIZER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Organizing Services",
    desc: [
      "Start with 2–4 offers: Small Closet Reset · Sorting Session · Full Closet Organization · Donation Prep.",
      "List what is included and excluded.",
      "Separate optional resale-photo/listing support, hauling, deep cleaning, and shelf installation from basic organizing.",
    ].join("\n"),
  },
  {
    title: "Set Privacy, Safety & Decision Rules",
    desc: [
      "Write policies for: client makes all keep/donate/sell/discard decisions; no photos without permission; no sharing personal information; no handling weapons/medications/identity documents; no hazardous or pest/mold conditions; no unsafe lifting/climbing; no offsite removal without authorization.",
      "Minors should work only with parent/guardian approval and an appropriate adult present.",
    ].join("\n"),
  },
  {
    title: "Build Your Pricing & Quote System",
    desc: [
      "Use session-based pricing.",
      "For every quote capture: closet size; estimated item volume; condition; client pace/decision support; session hours; travel; supplies; add-ons.",
      "State that extra rooms, storage areas, shopping, hauling, cleaning, installation, and resale work require approval and may cost extra.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3: friends/family referrals; neighborhood groups where permitted; senior/community groups; realtor or move-manager referrals; consignment/donation-center referrals where permitted; local community boards.",
      "Set goals: ask 10 trusted contacts; contact 3 referral partners; share one before/after-style graphic using only your own demonstration space.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple offer:",
      "",
      "“READY FOR A CLOSET YOU CAN ACTUALLY USE?”",
      "Sort • Organize • Label • Donation Prep",
      "Sessions from: $____",
      "Serving: ________",
      "Message for intake: ________",
      "",
      "State: client stays in control; no-pressure decisions; private and respectful service; clear session limit.",
      "Never use client photos or stories without permission.",
    ].join("\n"),
  },
  {
    title: "Complete Client Intake & Assessment",
    desc: [
      "Ask for a walkthrough or photos only with permission.",
      "Confirm: goal; closet size; item volume; accessibility; hazards; sensitive/private items; sorting categories; supplies on hand; session length; budget; donation/resale expectations; who will be present.",
      "If conditions are materially different on arrival, pause and revise scope/price.",
    ].join("\n"),
  },
  {
    title: "Prep the Space & Sorting Zones",
    desc: [
      "Protect a clear walking path. Identify a staging area.",
      "Set up labeled zones: KEEP · DONATE · SELL · RELOCATE · RECYCLE · DISCARD · UNDECIDED.",
      "Use an UNDECIDED limit so the session does not stall.",
    ].join("\n"),
  },
  {
    title: "Sort With the Client",
    desc: [
      "Work one section at a time.",
      "Ask neutral questions: Do you wear/use this? Does it fit the current goal? Would you buy it again today? Where should it live?",
      "Do not shame, rush, diagnose, or pressure. The client makes every final choice.",
    ].join("\n"),
  },
  {
    title: "Create a Maintainable Closet System",
    desc: [
      "Group by how the client lives, not by a social-media-perfect display.",
      "Possible zones: daily wear; work/school; seasonal; shoes; accessories; special occasions; laundry/repair.",
      "Put frequent items at easiest reach. Measure before recommending products. Label only with client approval.",
    ].join("\n"),
  },
  {
    title: "Close the Session, Get Paid & Track Profit",
    desc: [
      "Before leaving: review each exit pile; confirm what stays onsite; get authorization for anything leaving; take after photos only with permission; schedule donation/drop-off or follow-up; collect payment.",
      "Record revenue, supplies, travel, fees, disposal/drop-off costs, and all work/travel/admin time.",
      "Profit = Revenue − Expenses. Effective Profit/Hour = Profit ÷ Total Hours.",
    ].join("\n"),
  },
  {
    title: "Follow Up & Build Repeat Projects",
    desc: [
      "Send a short follow-up after 3–7 days:",
      "“Is the closet layout working for you? Is anything difficult to put away?”",
      "Offer: seasonal swap; entry closet; linen closet; pantry only if within your service scope; maintenance visit; move-in unpacking support.",
      "Ask for a review/referral without sharing private details.",
    ].join("\n"),
  },
];

export function closetOrganizerToolsDisclaimer(): string {
  return "Beginner stack: Intake Form + Sorting Signs + Measurement Sheet + Session Checklist + Job/Profit Tracker. The client decides what leaves. Do not pressure, discard, donate, sell, photograph, or remove belongings without the client's clear permission.";
}

export function computeClosetOrganizerProfit(input: {
  coShortSessions?: number;
  coAvgShortPrice?: number;
  coStandardProjects?: number;
  coAvgProjectPrice?: number;
  coAddOnRevenue?: number;
  coTipsOther?: number;
  coLabelsBagsSupplies?: number;
  coTravelParking?: number;
  coDonationDisposal?: number;
  coPaymentFees?: number;
  coAdvertising?: number;
  coInsuranceLicensing?: number;
  coOtherExpenses?: number;
  coOrganizingHours?: number;
  coShoppingDropOffHours?: number;
  coTravelAdminHours?: number;
}): {
  shortSessionRevenue: number;
  projectRevenue: number;
  totalMonthlyRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const shortSessionRevenue = n(input.coShortSessions) * n(input.coAvgShortPrice);
  const projectRevenue = n(input.coStandardProjects) * n(input.coAvgProjectPrice);
  const totalMonthlyRevenue =
    shortSessionRevenue + projectRevenue + n(input.coAddOnRevenue) + n(input.coTipsOther);
  const totalExpenses =
    n(input.coLabelsBagsSupplies) +
    n(input.coTravelParking) +
    n(input.coDonationDisposal) +
    n(input.coPaymentFees) +
    n(input.coAdvertising) +
    n(input.coInsuranceLicensing) +
    n(input.coOtherExpenses);
  const estimatedProfit = totalMonthlyRevenue - totalExpenses;
  const totalHours =
    n(input.coOrganizingHours) + n(input.coShoppingDropOffHours) + n(input.coTravelAdminHours);
  return {
    shortSessionRevenue,
    projectRevenue,
    totalMonthlyRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: totalMonthlyRevenue > 0 ? (estimatedProfit / totalMonthlyRevenue) * 100 : 0,
  };
}
