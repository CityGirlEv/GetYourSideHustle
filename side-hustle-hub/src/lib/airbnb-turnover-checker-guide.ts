/**
 * Airbnb Turnover Checker (`airbnb-turnover-checker`, Guide #032).
 * Final check after cleaning — not the cleaning crew or property manager.
 * Plain data only (no guide-tools imports).
 */

export const AIRBNB_TURNOVER_CHECKER_REALITY_CHECK = {
  title: "YOU ARE THE FINAL CHECK, NOT THE CLEANING CREW",
  body: [
    "The Turnover Checker's job is to VERIFY and REPORT.",
    "",
    "Typical responsibilities: follow the host's checklist, check visible cleanliness, count towels/linens where requested, check trash, check basic restock levels, confirm rooms look guest-ready, take approved photos, and report damage, missing items, maintenance issues, or cleaning misses.",
    "",
    "Do NOT claim something was repaired, sanitized, inspected for code compliance, or professionally cleaned unless that is actually part of your authorized role.",
    "",
    "Tagline: Check It. Document It. Help Make It Guest-Ready.",
  ].join("\n"),
};

export const AIRBNB_TURNOVER_CHECKER_NOTES_WORKSHEET = `MY AIRBNB TURNOVER CHECKER PLAN

Service Area: __________
Starting Price: $____
Standard Check Includes: __________

MARKETING CHANNELS:
1. __________
2. __________
3. __________

PROPERTY
Host: __________
Property: __________
Host Contact: __________
Backup Contact: __________
Cleaner: __________
Guest Check-In Time: __________
Access Instructions: __________
(Never place sensitive access codes in insecure/public notes.)

PROPERTY CHECKLIST
Required Towels: __________
Required Linens: __________
Bathroom Supplies: __________
Kitchen Supplies: __________
Coffee/Tea: __________
Trash Instructions: __________
Thermostat: __________
Lights: __________
Required Photos: __________
Other: __________

JOB RESULTS
Date: __________
Arrival: __________
Finished: __________
Price: $____
Expenses: $____
Estimated Profit: $____
Checklist Complete: ☐ Yes  ☐ No
Issues Found: __________
Issues Reported: ☐ Yes  ☐ None
Restock Needed: __________
Property Secured: ☐ Yes
Host Rebooked: ☐ Yes  ☐ Maybe  ☐ No
What Went Well: __________
What I Need to Improve: __________

GYSH PRO TIP — BECOME THE HOST'S "SECOND SET OF EYES."
Use the SAME checklist, in the SAME order, EVERY time.
That makes it easier to catch missing towels, empty supplies, trash, cleaning misses, damage, and setup problems.
Consistency is what makes this service valuable.

STARTER CHALLENGE:
Build a SAMPLE TURNOVER CHECKLIST before your first client:
1. Entry/Living Room  2. Kitchen  3. Bedrooms  4. Bathrooms
5. Supplies  6. Damage/Maintenance  7. Required Photos  8. Final Lock-Up
Then practice walking through a home from start to finish.`;

export const AIRBNB_TURNOVER_CHECKER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Walk through short-term rental turnover checklists after cleaning and before the next guest arrives. Check towels, trash, basic supplies, visible cleanliness, property setup, and obvious issues, then report problems to the host. Tagline: Check It. Document It. Help Make It Guest-Ready. Category: Short-Term Rental / Property Support. Best for teens where appropriate, adults, seniors / retirees. Beginner · Very low startup · 2–8 hrs/week · $10–$40 / job (examples) · Starter Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliable transportation · Smartphone · Reliable communication · Ability to follow detailed checklists · Attention to detail · Basic photo-taking skills · Ability to arrive during narrow turnover windows · Host/property access authorization.",
  },
  {
    id: "before",
    label: "Before the first job, confirm",
    detail:
      "Property address · Access instructions · Check-in deadline · Host's turnover checklist · What supplies should be stocked · Expected towel/linen counts · What photos are required · What problems require immediate contact · Whether you may move/restock items · Whether you are checking after a cleaner or doing any light reset yourself · How to secure the property when leaving.",
  },
  {
    id: "safety",
    label: "Safety & privacy",
    detail:
      "Never enter without authorization. Do not share door/access codes. Do not bring unauthorized people. Do not photograph guest/private information. Do not handle hazardous materials beyond your training. Report unsafe conditions instead of trying to repair them yourself.",
  },
];

export const AIRBNB_TURNOVER_CHECKER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Docs", url: "https://docs.google.com/", note: "Checklists and marketing plan" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Jobs / income tracker" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Photo delivery" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Turnover windows" },
];

export const AIRBNB_TURNOVER_CHECKER_SUPPLIES = {
  starterKitTotal: "About $0–25 — phone + checklist; do not stock host supplies unless the agreement requires it",
  items: [
    { id: "phone", name: "Smartphone", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "charger", name: "Charger", qty: "1", estCost: "$0–10", notes: "Essential" },
    { id: "checklist", name: "Turnover checklist", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "notes", name: "Notes app / clipboard + pen", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "transport", name: "Reliable transportation", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "access", name: "Property access instructions (host-provided)", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "battery", name: "Portable battery pack", qty: "1", estCost: "$10–25", notes: "Useful", optional: true },
    { id: "light", name: "Small flashlight", qty: "1", estCost: "$5–12", notes: "Useful", optional: true },
    { id: "gloves", name: "Disposable gloves for appropriate light checks", qty: "1 box", estCost: "$5–10", notes: "Useful", optional: true },
    { id: "cloth", name: "Microfiber cloth", qty: "1", estCost: "$2–6", notes: "Useful", optional: true },
    { id: "covers", name: "Shoe covers if requested", qty: "1 pack", estCost: "$3–8", notes: "Useful", optional: true },
  ],
};

export const AIRBNB_TURNOVER_CHECKER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "atc_docs", name: "Google Docs", freePlanAvailable: true, costNote: "Checklists and marketing plan", url: "https://docs.google.com/" },
  { id: "atc_sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Jobs / income", url: "https://sheets.google.com/" },
  { id: "atc_notes", name: "Notes app", freePlanAvailable: false, planLabelApplicable: false, costNote: "On-property notes · $0 on phone" },
  { id: "atc_camera", name: "Smartphone Camera", freePlanAvailable: false, planLabelApplicable: false, costNote: "Host-requested photos only" },
  { id: "atc_drive", name: "Google Drive / Dropbox", freePlanAvailable: true, costNote: "Photo delivery", url: "https://drive.google.com/" },
  { id: "atc_cal", name: "Google Calendar", freePlanAvailable: true, costNote: "Turnover windows", url: "https://calendar.google.com/" },
  { id: "atc_text", name: "Text / Email / host-approved messaging", freePlanAvailable: false, planLabelApplicable: false, costNote: "Issue reports — never share access codes" },
  {
    id: "atc_str",
    name: "Turno / Hospitable / Guesty (optional)",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Only if the host gives authorized access — verify features, permissions, pricing, and rules",
    optional: true,
  },
  {
    id: "atc_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Phone + Host Checklist + Camera + Google Drive + Calendar",
  },
];

export const AIRBNB_TURNOVER_CHECKER_PRICING = {
  tabLabel: "Turnover Check Pricing Examples",
  intro: [
    "Keep displayed range: $10 – $40 / job (examples).",
    "",
    "Agree BEFORE the job on: Property + Arrival Window + Checklist + Photos + Approved Tasks + Price.",
    "",
    "Do not pay for host supplies out of pocket unless reimbursement is clearly approved in advance.",
  ].join("\n"),
  raiseTip:
    "Price can vary by property size, travel, rooms, checklist length, photos, restock duties, same-day urgency, parking/tolls, and multiple units. Examples only — not income guarantees.",
  items: [
    { id: "quick", label: "QUICK CHECK", price: "$10 – $15 / job", notes: "Small property / short checklist / minimal travel" },
    { id: "standard", label: "STANDARD TURNOVER CHECK", price: "$15 – $25 / job", notes: "Full room-by-room checklist, basic restock check, and photo report" },
    { id: "detailed", label: "DETAILED / LARGER PROPERTY", price: "$25 – $40+ / job", notes: "Larger property, longer checklist, more documentation, or additional approved tasks" },
  ],
};

export const AIRBNB_TURNOVER_CHECKER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your Turnover Check Service",
    desc: [
      "Choose what you will check.",
      "",
      "☐ Room-by-room visual check",
      "☐ Towels/linen count",
      "☐ Trash check",
      "☐ Basic supply/restock check",
      "☐ Bed/setup appearance check",
      "☐ Kitchen/bathroom basics",
      "☐ Visible damage check",
      "☐ Photo documentation",
      "☐ Thermostat/light check if authorized",
      "☐ Door/window final check if authorized",
      "",
      "My Turnover Check Includes: __________",
      "My Service Does NOT Include: __________",
      "",
      "Keep your role clear. You are the final check — not the cleaning crew and not full property management.",
    ].join("\n"),
  },
  {
    title: "Set Your Starter Price",
    desc: [
      "Choose a simple starting package.",
      "",
      "STANDARD TURNOVER CHECK",
      "Up to 45 minutes · Room-by-room checklist · Basic restock check · 8–12 photos · Issue report",
      "Starting Price: $____",
      "",
      "See Suggested Pricing for $10–$40 / job examples.",
      "If travel or a larger property costs more, define that before booking.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way hosts/property owners hear about you. Pick only 2 or 3 this month.",
      "",
      "☐ Referrals",
      "☐ Local Airbnb/STR host communities",
      "☐ Property managers",
      "☐ Vacation-rental cleaners",
      "☐ Local real-estate investors",
      "☐ Facebook host/investor groups",
      "☐ Nextdoor where appropriate",
      "☐ Local networking",
      "☐ Direct outreach to STR operators where appropriate",
      "",
      "Open Google Docs from the Tools tab.",
      "What I Offer: Airbnb/STR Turnover Checking",
      "Starting Price: $____",
      "Service Area: __________",
      "",
      "Write ONE measurable goal per channel (example: introduce myself to 5 local cleaners; contact 10 hosts/property managers).",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create one simple flyer/message.",
      "",
      "NEED A SECOND SET OF EYES BEFORE GUEST CHECK-IN?",
      "I provide local short-term rental turnover checks after cleaning.",
      "I can check: towels & linens · trash · basic guest supplies · room setup · visible cleaning misses · obvious damage/issues · photo documentation.",
      "Starting at $____ per turnover check.",
      "Service Area: __________   Contact: __________",
      "",
      "Do not claim to be affiliated with Airbnb. Do not use Airbnb trademarks/logos in a way that suggests endorsement.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "This week, use ONLY the 2 or 3 channels selected.",
      "",
      "Contact 8–12 relevant hosts/property professionals. Introduce yourself to local STR cleaners. Ask for referrals. Send your service message. Follow up once where appropriate.",
      "",
      "Sample: “Hi! I provide short-term rental turnover checks after the cleaning is finished and before the next guest arrives. I follow the host's checklist, check basics like towels, trash, supplies and room setup, take requested photos, and report anything that needs attention. My checks start at $____.”",
      "",
      "Track: Date | Host/Company | Channel | Response | Follow-Up",
      "Do not spam. Do not ask for guest information you do not need.",
    ].join("\n"),
  },
  {
    title: "Get the Host's Exact Checklist",
    desc: [
      "Never assume every property is the same. Before the first turnover, get the host's checklist.",
      "",
      "Confirm: required towel count · linen setup · toilet paper quantity · paper towels · soap/toiletries · coffee/tea · kitchen basics · trash procedure · thermostat setting · lights · blinds/curtains · furniture placement · welcome items · required photos · locked/off-limit areas · final lock-up procedure.",
      "",
      "Save the checklist where you can access it quickly.",
    ].join("\n"),
  },
  {
    title: "Confirm the Turnover Window & Access",
    desc: [
      "For every job, confirm:",
      "",
      "Property: __________",
      "Cleaner Expected Done: __________",
      "My Check Window: __________",
      "Guest Check-In: __________",
      "Access Method: __________",
      "Host Contact: __________",
      "Backup Contact: __________",
      "",
      "Never share access codes.",
      "If the cleaner is running late, contact the host instead of rushing through an incomplete check.",
    ].join("\n"),
  },
  {
    title: "Walk the Property Room by Room",
    desc: [
      "Use the checklist in the SAME order every time.",
      "",
      "ENTRY / LIVING: no obvious trash · furniture arranged · floors/surfaces guest-ready · required items present · no obvious damage",
      "KITCHEN: trash removed · sink/counters visibly clean · required basics stocked · appliances left as host requires · no leftover food if prohibited",
      "BEDROOMS: beds appear properly made · required linens/towels present · no obvious trash/damage · setup matches checklist",
      "BATHROOMS: towels present · toilet paper stocked · soap/toiletries as required · trash removed · fixtures/surfaces guest-ready",
      "OTHER AREAS: follow the host's checklist.",
      "",
      "You are checking visible condition, not certifying sanitation.",
    ].join("\n"),
  },
  {
    title: "Take Photos & Report Issues",
    desc: [
      "Take only the photos the host requests or authorizes.",
      "",
      "Useful photos: finished rooms · bed setup · towel setup · supply levels · damage · cleaning misses · maintenance issues.",
      "",
      "For a problem, report WHAT / WHERE / PHOTO attached / URGENCY:",
      "☐ Before Check-In  ☐ Soon  ☐ FYI",
      "",
      "Sample: “Turnover check complete. One issue: the upstairs bathroom has only one bath towel; checklist requires two. Photo attached. Guest check-in is 4:00 PM.”",
      "Report facts, not guesses.",
    ].join("\n"),
  },
  {
    title: "Complete Approved Restock / Final Reset",
    desc: [
      "Only perform tasks the host authorized.",
      "",
      "Possible approved tasks: add toilet paper · replace trash bag · set out towels · add coffee pods · straighten approved items · adjust thermostat · turn specified lights on/off.",
      "",
      "If supplies are missing: contact the host.",
      "If damage or maintenance is found: document and report it.",
      "Do not perform electrical, plumbing, structural, appliance, hazardous-material, or other repair work beyond your qualifications.",
    ].join("\n"),
  },
  {
    title: "Close Out the Job & Get Rebooked",
    desc: [
      "Before leaving:",
      "☐ Checklist complete",
      "☐ Required photos sent/uploaded",
      "☐ Issues reported",
      "☐ Approved restock completed",
      "☐ Lights/thermostat set as instructed",
      "☐ Doors/windows checked as authorized",
      "☐ Property secured",
      "☐ Access/key handled correctly",
      "",
      "Send: “Turnover check complete at [time]. Checklist finished, required photos uploaded, and all issues reported.”",
      "Then ask: “Would you like me to cover your upcoming turnovers on a recurring basis?”",
      "Recurring work can turn occasional $10–$40 checks into dependable weekly/monthly income.",
    ].join("\n"),
  },
];

export function airbnbTurnoverCheckerToolsDisclaimer(): string {
  return [
    "Beginner stack: Phone + Host Checklist + Camera + Google Drive + Calendar.",
    "",
    "Optional STR tools (Turno, Hospitable, Guesty) only if the host gives authorized access. Verify current features, permissions, pricing, and platform rules.",
    "",
    "Never store door codes in public notes. You are verifying and reporting — not claiming professional cleaning, repairs, or code inspections.",
  ].join("\n");
}
