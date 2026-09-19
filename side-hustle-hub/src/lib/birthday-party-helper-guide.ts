/**
 * Birthday Party Helper (`birthday-party-helper`, Guide #036).
 * Starter Membership. 2 - 8 hrs/week. Displayed $10 – $40 / job (examples).
 * Plain data only — no imports from guide-tools.
 */

export const BIRTHDAY_PARTY_HELPER_REALITY_CHECK = {
  title: "PARTY HELP IS NOT AUTOMATIC CHILDCARE",
  body: [
    "Assist a parent or event host with setup, guest arrival, simple games, food-table support, present organization, cleanup, and other clearly assigned party tasks while the responsible adult remains in charge of the children and event.",
    "",
    "A Birthday Party Helper supports the host. The host or another designated responsible adult remains responsible for supervision, emergencies, discipline, allergies, bathroom help, medications, transportation, and child pickup unless a separate lawful childcare arrangement is made.",
    "",
    "Before quoting confirm: date and venue; guest count and ages; adult supervisors; party theme; setup tasks; game/activity tasks; food/cake tasks; cleanup tasks; allergies and safety concerns; supplies; start/end time; price and overtime.",
    "",
    "For anyone under 18, a parent/guardian should approve the client, location, duties, transportation, schedule, communication, and payment.",
    "",
    "Do not act as the sole child supervisor unless the job is separately arranged as legal childcare. Do not administer medication. Do not transport children without explicit lawful arrangements. Do not operate inflatables, pools, grills, or professional entertainment equipment unless properly trained/authorized. Do not use photographs of children without written parent/guardian permission.",
    "",
    "Business licenses, sales tax, food-service rules, venue vendor requirements, background checks, insurance, and youth-work rules vary by location and assignment. Verify locally before offering add-ons.",
    "",
    "Tagline: Calmer Hosts. Smoother Parties. Happier Cleanup.",
  ].join("\n"),
};

export const BIRTHDAY_PARTY_HELPER_NOTES_WORKSHEET = `BIRTHDAY PARTY HELPER NOTES

BUSINESS SETUP
Service Area: ________
Minimum Booking: $____
Overtime Rate: $____
Travel Rule: ________
Cancellation Rule: ________
Parent/Guardian Contact if applicable: ________

PARTY
Host: ________
Private Venue: ________
Date/Time: ________
Guest Count/Ages: ________
Responsible Adults: ________
Theme: ________
Venue Rules: ________
Hazards/Allergies Relevant to Tasks: ________

SCOPE
Package: ________
Included: ________
Excluded: ________
Supplies Provided By: ________
Quoted Price: $____
Deposit: $____
Balance: $____

RUN-OF-SHOW
Arrival: ________
Setup Complete: ________
Guests: ________
Activity: ________
Food/Cake: ________
Departure: ________
Cleanup Complete: ________

RESULTS
Actual Hours: ____
Expenses: $____
Profit: $____
Review Requested: ☐
Referral Requested: ☐

GYSH PRO TIP
The best helper makes the host feel more in control—not less.

CLEAR ROLE → WRITTEN TIMELINE → SAFE SETUP → CALM SUPPORT → CLEAN FINISH → REFERRAL.

STARTER MEMBERSHIP CHALLENGE
Book your first 3 party-help opportunities:
1. Define your role and boundaries.
2. Create 3 packages.
3. Set prices and overtime.
4. Build one intake form.
5. Build one run-of-show template.
6. Choose 2–3 marketing channels.
7. Contact 10 trusted families/referral partners.
8. Confirm every event in writing.
9. Track actual hours and profit.
10. Ask successful hosts for referrals.`;

export const BIRTHDAY_PARTY_HELPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Assist a parent or event host with setup, guest arrival, simple games, food-table support, present organization, cleanup, and other clearly assigned party tasks while the responsible adult remains in charge of the children and event. Tagline: Calmer Hosts. Smoother Parties. Happier Cleanup. Category: Events & Family Services. Best for teens and adults who are organized, upbeat, and comfortable assisting a host around children. Beginner · Low startup · Weekends / Evenings / Event-Based · Client Homes / Community Rooms / Approved Venues · Per Party / Hourly Add-Ons / Repeat Referrals · 2 - 8 hrs/week · Starter Membership. Displayed $10 – $40 / job is examples only.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable phone/contact method · Parent/guardian involvement if under 18 · Reliable transportation · Party-helper service checklist · Comfortable closed-toe shoes · Simple pricing and overtime policy · Calendar · Payment method · Emergency contact · Income/expense tracking.",
  },
  {
    id: "before",
    label: "Before accepting",
    detail:
      "Ask: how many children and adults; what ages; who is the responsible host; will the host remain onsite; any allergies, accessibility needs, behavioral concerns, or venue rules relevant to assigned tasks; will there be a pool, bounce house, animals, open flame, grilling, traffic, or other elevated hazard; will you handle food, knives, hot trays, balloons, small craft parts, or cleaning chemicals; who supplies materials. Do not accept duties beyond your training or authority.",
  },
  {
    id: "parent",
    label: "Parent/guardian approval",
    detail:
      "For anyone under 18, a parent/guardian should approve the client, location, duties, transportation, schedule, communication, and payment. Do not publish child photos, guest lists, addresses, or a minor helper's private information.",
  },
];

export const BIRTHDAY_PARTY_HELPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Forms", url: "https://forms.google.com/", note: "Party intake" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Run-of-show and task checklist" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Leads, bookings, income, expenses" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Event dates and deadlines" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Venue/travel planning" },
  { label: "Canva", url: "https://www.canva.com/", note: "Flyer and package sheet" },
];

export const BIRTHDAY_PARTY_HELPER_SUPPLIES = {
  starterKitTotal: "About $15–35 for basics — client/host should provide decorations, food, and most party materials",
  items: [
    { id: "phone", name: "Phone", qty: "1 (usually owned)", estCost: "$0", notes: "Essential" },
    { id: "shoes", name: "Closed-toe/non-slip shoes", qty: "1 pair", estCost: "$0", notes: "Essential" },
    { id: "clothes", name: "Comfortable event clothing", qty: "1 set", estCost: "$0", notes: "Essential" },
    { id: "notebook", name: "Small notebook/checklist", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "pens", name: "Pens and markers", qty: "1 set", estCost: "$2–6", notes: "Essential" },
    { id: "tape", name: "Painter's tape", qty: "1 roll", estCost: "$3–8", notes: "Essential" },
    { id: "scissors", name: "Scissors used with care", qty: "1", estCost: "$2–6", notes: "Essential" },
    { id: "trash", name: "Trash bags", qty: "1 pack", estCost: "$3–8", notes: "Essential" },
    { id: "towels", name: "Paper towels", qty: "1 roll", estCost: "$2–5", notes: "Essential" },
    { id: "gloves", name: "Disposable gloves for cleanup/food-table tasks where appropriate", qty: "1 box", estCost: "$4–8", notes: "Essential" },
    { id: "sanitizer", name: "Hand sanitizer", qty: "1 bottle", estCost: "$2–5", notes: "Essential" },
    { id: "timer", name: "Timer", qty: "1", estCost: "$0", notes: "Helpful — phone timer works", optional: true },
    { id: "nametags", name: "Name tags", qty: "1 pack", estCost: "$3–8", notes: "Helpful", optional: true },
    { id: "cards", name: "Index cards", qty: "1 pack", estCost: "$2–5", notes: "Helpful", optional: true },
    { id: "games", name: "Simple age-appropriate game cards", qty: "1 set", estCost: "$0–10", notes: "Helpful", optional: true },
    { id: "coloring", name: "Coloring sheets/crayons", qty: "1 set", estCost: "$3–8", notes: "Helpful", optional: true },
    { id: "clips", name: "Reusable tablecloth clips", qty: "2–4", estCost: "$4–10", notes: "Helpful", optional: true },
    { id: "first-aid", name: "Small first-aid kit for the responsible adult to manage", qty: "1", estCost: "$8–15", notes: "Helpful backup", optional: true },
  ],
};

export const BIRTHDAY_PARTY_HELPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "forms", name: "Google Forms", freePlanAvailable: true, costNote: "Party intake", url: "https://forms.google.com/" },
  { id: "docs", name: "Google Docs", freePlanAvailable: true, costNote: "Run-of-show and task checklist", url: "https://docs.google.com/" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Leads, bookings, income, expenses", url: "https://sheets.google.com/" },
  { id: "calendar", name: "Calendar", freePlanAvailable: true, costNote: "Event dates and deadlines", url: "https://calendar.google.com/" },
  { id: "maps", name: "Maps", freePlanAvailable: true, planLabelApplicable: false, costNote: "Venue/travel planning", url: "https://maps.google.com/" },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Flyer and package sheet", url: "https://www.canva.com/" },
  { id: "timer", name: "Timer App", freePlanAvailable: true, planLabelApplicable: false, costNote: "Games and schedule cues" },
  { id: "camera", name: "Phone Camera", freePlanAvailable: true, planLabelApplicable: false, costNote: "Venue/setup photos only with permission; never photograph children without permission" },
  { id: "pay", name: "Payment App/Processor", freePlanAvailable: true, costNote: "Approved business payments", optional: true },
  { id: "weather", name: "Weather App", freePlanAvailable: true, planLabelApplicable: false, costNote: "Outdoor backup planning" },
  { id: "stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Party Intake + Written Package + Run-of-Show + Calendar + Booking/Profit Tracker" },
];

export const BIRTHDAY_PARTY_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: $10 – $40 / job (examples, not guarantees).",
    "The existing display range can fit a very short known-family task. A full two-hour party-help package should be priced from actual labor, travel, and scope rather than forced into that range.",
    "",
    "STARTER PACKAGE EXAMPLES",
    "30-Minute Setup Assist: $15 – $30",
    "60-Minute Setup or Cleanup Block: $25 – $45",
    "Two-Hour Party Helper: $40 – $80",
    "Three-Hour Setup + Party + Cleanup: $65 – $120",
    "Second Helper for Large Party: quote separately",
    "",
    "COMMON ADD-ONS — EXAMPLES",
    "Extra Hour: $15 – $30",
    "Simple Game Leadership: $10 – $25",
    "Craft Station Support: $10 – $30 plus materials",
    "Favor-Bag Assembly Before Event: $15 – $40",
    "Same-Week/Rush Booking: optional $10 – $25",
    "Supply Pickup: agreed fee plus reimbursement/receipt",
    "Travel/Parking: quote when significant",
    "",
    "QUOTE FORMULA",
    "Setup Hours + Party Hours + Cleanup Hours × Target Hourly Value + Travel/Parking + Supplies + Specialty Add-Ons + Rush Premium if applicable = Quote",
    "",
    "Require a written confirmation. Consider a booking deposit where appropriate and lawful. State overtime and cancellation/reschedule terms before the event.",
    "",
    "MONTHLY EXAMPLES",
    "3 short jobs/month × $30 = $90 gross/month",
    "4 two-hour parties/month × $65 = $260 gross/month",
    "8 mixed jobs/month × $75 = $600 gross/month",
    "",
    "Gross revenue is NOT profit.",
    "Do not guarantee earnings. Results depend on season, local demand, scope, hours, travel, supplies, cancellations, taxes, and expenses.",
  ].join("\n"),
  raiseTip:
    "Displayed $10 – $40 / job fits a very short task. Full-party packages should be priced from actual labor, travel, and scope.",
  items: [
    { id: "setup-30", label: "30-minute setup assist", price: "$15 – $30", notes: "Examples only" },
    { id: "setup-60", label: "60-minute setup or cleanup block", price: "$25 – $45", notes: "Examples only" },
    { id: "two-hour", label: "Two-hour party helper", price: "$40 – $80", notes: "Examples only" },
    { id: "three-hour", label: "Three-hour setup + party + cleanup", price: "$65 – $120", notes: "Examples only" },
    { id: "extra-hour", label: "Extra hour add-on", price: "$15 – $30", notes: "Examples only" },
  ],
};

export const BIRTHDAY_PARTY_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Party-Helper Role",
    desc: [
      "Choose tasks you will offer: setup; decor placement; guest welcome/check-in support; simple game leadership; craft-table support; food-table restocking; present table organization; trash pickup; basic cleanup.",
      "Write what you do NOT provide, especially sole childcare and hazardous/specialty services.",
    ].join("\n"),
  },
  {
    title: "Create 2–3 Clear Packages",
    desc: [
      "Example packages: Setup Assist · Party Support · Setup + Party + Cleanup.",
      "For each list: duration; included tasks; guest limit; host responsibilities; supplies; starting price; overtime rate; travel area.",
    ].join("\n"),
  },
  {
    title: "Build Your Pricing & Booking Rules",
    desc: [
      "Set: minimum booking; hourly value; overtime rate; deposit if used; cancellation/reschedule rule; travel/parking rule; supply reimbursement rule.",
      "Never quote from the word “party” alone. Scope drives price.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "Pick only 2 or 3: family/friend referrals; parent networks; neighborhood groups where permitted; community or faith groups; local venue/vendor referrals; school/community boards with permission.",
      "Goals: contact 10 known families; introduce yourself to 3 approved venues/vendors; share one package graphic.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple offer:",
      "",
      "“ENJOY THE PARTY—GET HELP WITH THE BUSY PARTS.”",
      "Setup • Games • Party Support • Cleanup",
      "Packages from: $____",
      "Serving: ________",
      "Book: ________",
      "",
      "Include: what is included; what is not included; age groups you are comfortable around; service area; booking lead time.",
      "Do not publish child photos, guest lists, addresses, or a minor helper's private information.",
    ].join("\n"),
  },
  {
    title: "Complete Party Intake",
    desc: [
      "Capture: host/contact; private venue address; date/time; guest count and ages; adult supervisors; theme; schedule; assigned tasks; food/allergy information relevant to your tasks; indoor/outdoor plan; hazards; venue rules; supplies; price/payment.",
      "If the host asks you to become the sole supervisor, pause and redefine the arrangement.",
    ].join("\n"),
  },
  {
    title: "Build the Run-of-Show",
    desc: [
      "Write a simple timeline: arrival; setup deadline; guest arrival; activity/game; food/cake; presents if planned; final activity; guest departure; cleanup.",
      "Assign every major task to the host, helper, another adult, or vendor. “Someone will do it” is how party chaos clocks in early.",
    ].join("\n"),
  },
  {
    title: "Prep & Set Up Safely",
    desc: [
      "Confirm final guest count and timing. Pack your kit. Arrive early. Walk through the venue with the host.",
      "Locate exits, restrooms, trash, supplies, and adult supervisors. Keep walkways clear. Secure décor without damaging surfaces. Keep small/sharp/hot items controlled.",
    ].join("\n"),
  },
  {
    title: "Support the Event Without Taking Over",
    desc: [
      "Follow the host's plan. Welcome guests as assigned. Lead only agreed activities. Keep games inclusive and age-appropriate.",
      "Tell the responsible adult about injuries, conflicts, missing children, allergy concerns, or unsafe behavior immediately.",
      "Do not post from the event.",
    ].join("\n"),
  },
  {
    title: "Clean Up, Get Paid & Record Profit",
    desc: [
      "Complete agreed cleanup: trash; table reset; decoration removal; supply return; lost-item collection; final walkthrough with host.",
      "Record: revenue; tip; supplies; travel/parking; payment fees; total event, travel, shopping, and admin time.",
      "Profit = Revenue − Expenses. Effective Profit/Hour = Profit ÷ Total Hours.",
    ].join("\n"),
  },
  {
    title: "Follow Up & Build Referrals",
    desc: [
      "Send a thank-you within 24 hours.",
      "",
      "Sample:",
      "“Thank you for having me help with the party. I hope the setup and cleanup made the day easier. If you were happy with my help, may I use a short review with no private event details?”",
      "",
      "Ask about: sibling birthdays; school/team celebrations; family referrals; venue/vendor referrals.",
      "Save only non-sensitive service notes.",
    ].join("\n"),
  },
];

export function birthdayPartyHelperToolsDisclaimer(): string {
  return "Beginner stack: Party Intake + Written Package + Run-of-Show + Calendar + Booking/Profit Tracker. Party help is not automatic childcare. The host remains responsible for children and the event. Parent/guardian approval for anyone under 18.";
}

export function computeBirthdayPartyHelperProfit(input: {
  bphShortJobs?: number;
  bphAvgShortPrice?: number;
  bphFullParties?: number;
  bphAvgFullPartyPrice?: number;
  bphAddOnRevenue?: number;
  bphTipsOther?: number;
  bphSupplies?: number;
  bphTravelParking?: number;
  bphPaymentFees?: number;
  bphAdvertising?: number;
  bphInsuranceLicensing?: number;
  bphOtherExpenses?: number;
  bphEventHours?: number;
  bphPrepShoppingHours?: number;
  bphTravelAdminHours?: number;
}): {
  shortJobRevenue: number;
  fullPartyRevenue: number;
  totalMonthlyRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  profitPerHour: number | null;
  profitMarginPercent: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const shortJobRevenue = n(input.bphShortJobs) * n(input.bphAvgShortPrice);
  const fullPartyRevenue = n(input.bphFullParties) * n(input.bphAvgFullPartyPrice);
  const totalMonthlyRevenue =
    shortJobRevenue + fullPartyRevenue + n(input.bphAddOnRevenue) + n(input.bphTipsOther);
  const totalExpenses =
    n(input.bphSupplies) +
    n(input.bphTravelParking) +
    n(input.bphPaymentFees) +
    n(input.bphAdvertising) +
    n(input.bphInsuranceLicensing) +
    n(input.bphOtherExpenses);
  const estimatedProfit = totalMonthlyRevenue - totalExpenses;
  const totalHours = n(input.bphEventHours) + n(input.bphPrepShoppingHours) + n(input.bphTravelAdminHours);
  return {
    shortJobRevenue,
    fullPartyRevenue,
    totalMonthlyRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    profitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
    profitMarginPercent: totalMonthlyRevenue > 0 ? (estimatedProfit / totalMonthlyRevenue) * 100 : 0,
  };
}
