/**
 * House Sitter (`house-sitter`, Guide #077).
 * Basic house check-ins while a trusted client travels — mail, plants, lights, updates.
 * Not overnight stays, pet care, cleaning, or repairs unless separately agreed.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const HOUSE_SITTER_REALITY_CHECK = {
  title: "YOU ARE BEING TRUSTED WITH SOMEONE’S HOME",
  body: [
    "House sitting is a TRUST service.",
    "",
    "Before the client leaves, get written instructions covering:",
    "- Dates and check-in schedule",
    "- Entry/access method",
    "- Emergency contacts",
    "- Mail/packages",
    "- Plants",
    "- Lights/blinds",
    "- Alarm instructions",
    "- Approved rooms/areas",
    "- What to do if something looks wrong",
    "",
    "Never invite guests into the home, share keys/codes, post that the owners are away, use the client’s belongings without permission, or enter areas outside the agreed service.",
    "",
    "This guide focuses on basic house check-ins. Pet care, overnight stays, extensive cleaning, repairs, or other services should be separately agreed and priced.",
    "",
    "Tagline: Check the House. Follow the List. Give Them Peace of Mind.",
  ].join("\n"),
};

export const HOUSE_SITTER_NOTES_WORKSHEET = `MY HOUSE-SITTING SERVICE

Starter Package: ________
Starting Price: $____
Service Area: ________
Extra Visit Price: $____

Marketing Channels:
1. ________
2. ________
3. ________

CLIENT PLAN

Client: ________
Travel Dates: ________
Visit Schedule: ________
Emergency Contact: ________
Entry Method: ________
Alarm Instructions Stored Securely: ☐
Mail: ________
Packages: ________
Plants: ________
Lights/Blinds: ________
Trash/Recycling: ________
Other Approved Tasks: ________
Pets Present: ________
Anyone Else Expected at Home: ________

VISIT CHECKLIST

Date/Time: ________
Mail: ☐
Packages: ☐
Plants: ☐
Lights: ☐
Trash: ☐
Doors/Windows: ☐
Basic Visual Check: ☐
Client Update Sent: ☐
Home Secured: ☐

Issues: __________

FINAL HANDOFF

Final Visit Complete: ☐
Home Secured: ☐
Final Update Sent: ☐
Key/Access Returned: ☐
Temporary Access Removed: ☐
Payment Complete: ☐

Revenue: $____
Expenses: $____
Estimated Profit: $____
Hours: ____
Effective Profit/Hour: $____

Client Happy: ☐ Yes ☐ Needs Attention
Testimonial/Referral Requested: ☐
Rebooked: ☐ Yes ☐ Maybe ☐ No

GYSH PRO TIP
THE PRODUCT YOU ARE REALLY SELLING IS PEACE OF MIND.
A homeowner wants to know: DID YOU SHOW UP? DID YOU FOLLOW THE LIST? IS EVERYTHING OKAY? IS MY HOME SECURE?
Use the same checklist every time and send a short completion update.
RELIABILITY + PRIVACY + COMMUNICATION = TRUST.

STARTER CHALLENGE
Practice a MOCK HOUSE CHECK with a trusted family member.
Have them create a checklist with:
1. Mail
2. One plant
3. One light
4. One package
5. One door/window check
Complete the visit, send a sample completion update, and practice returning the key securely.
Then ask: Did I miss anything? Was my update clear? Did I leave the home exactly as instructed?`;

export const HOUSE_SITTER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Watch a trusted family’s or client’s home while they travel by completing agreed check-ins such as collecting mail, rotating lights, watering plants, checking doors/windows, bringing packages inside, and reporting anything unusual. Tagline: Check the House. Follow the List. Give Them Peace of Mind. Category: Home Services / Property Check-In. Best for responsible Teens with parent/guardian approval, Adults, Seniors / Retirees. Beginner · Very low startup · Flexible / travel dates · Client home · Per job / per visit / recurring · 2 - 8 hrs/week · Starter Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Reliability and punctuality · Trustworthy references when possible · Smartphone · Transportation or a safe way to reach the home · Written client checklist · Safe key/access process · Emergency contact · Parent/guardian approval for minors.",
  },
  {
    id: "before-accepting",
    label: "Before accepting",
    detail:
      "Confirm exact dates · Number/frequency of visits · Expected visit length · Tasks · Alarm/access process · Emergency procedures · Plants/mail/packages · Whether anyone else may enter the property · Whether pets are present · Service fee · Payment timing · Client communication preference. Do not accept a home if you feel unsafe or if the requested work is outside your abilities.",
  },
  {
    id: "minors",
    label: "For minors",
    detail:
      "Parent/guardian approval · Parent/guardian-approved contact information on marketing · Age-appropriate homes only · No unsafe private meetups · Parent/guardian involvement in access, transportation, and payment where appropriate.",
  },
];

export const HOUSE_SITTER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Visit schedule" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Client checklist" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Visit log" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Route to the home" },
  { label: "Apple Maps", url: "https://maps.apple.com/", note: "Navigation" },
];

export const HOUSE_SITTER_SUPPLIES = {
  starterKitTotal:
    "About $0–20 to start — the homeowner should provide plant/alarm/mail supplies; do not buy extras without client approval",
  items: [
    { id: "phone", name: "Smartphone", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "charger", name: "Charger", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "checklist", name: "Written / digital checklist", qty: "1", estCost: "$0–4", notes: "Essential" },
    { id: "pen", name: "Pen / Notes", qty: "1", estCost: "$0–3", notes: "Essential" },
    { id: "transport", name: "Transportation", qty: "1", estCost: "$0", notes: "Essential — safe way to reach the home" },
    { id: "access", name: "Secure key / access method", qty: "1", estCost: "$0", notes: "Essential — client provides" },
    { id: "emergency", name: "Client emergency contacts", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "flashlight", name: "Small flashlight", qty: "1", estCost: "$5–10", notes: "Helpful", optional: true },
    { id: "battery", name: "Portable battery", qty: "1", estCost: "$10–25", notes: "Helpful", optional: true },
    { id: "gloves", name: "Gloves for appropriate household tasks", qty: "1 pair", estCost: "$3–8", notes: "Helpful", optional: true },
    { id: "umbrella", name: "Umbrella", qty: "1", estCost: "$5–12", notes: "Helpful", optional: true },
    { id: "calendar", name: "Calendar / reminders", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
  ],
};

export const HOUSE_SITTER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "hs_gcal",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Visit dates and reminders",
    url: "https://calendar.google.com/",
  },
  {
    id: "hs_apple_cal",
    name: "Apple Calendar",
    freePlanAvailable: true,
    costNote: "Visit reminders",
    optional: true,
  },
  {
    id: "hs_phone_reminders",
    name: "Phone reminders",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Visit alerts",
  },
  {
    id: "hs_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Written client checklist",
    url: "https://docs.google.com/",
  },
  {
    id: "hs_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Visit checklist on your phone",
  },
  {
    id: "hs_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Visit log and inquiries",
    url: "https://sheets.google.com/",
  },
  {
    id: "hs_phone",
    name: "Phone / text / email",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Client updates — parent-approved contact for minors",
  },
  {
    id: "hs_maps",
    name: "Google Maps",
    freePlanAvailable: true,
    costNote: "Route to the home",
    url: "https://maps.google.com/",
  },
  {
    id: "hs_apple_maps",
    name: "Apple Maps",
    freePlanAvailable: true,
    costNote: "Navigation",
    url: "https://maps.apple.com/",
    optional: true,
  },
  {
    id: "hs_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Phone + Calendar + Checklist + Maps",
  },
];

export const HOUSE_SITTER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "Keep displayed pricing: $10 – $40 / job (examples).",
    "",
    "If the client wants overnight house sitting, pet care, or extended on-site time, create a separate price instead of squeezing it into a basic $10–$40 check-in.",
    "Agree on scope and price before the trip begins.",
  ].join("\n"),
  raiseTip:
    "Possible add-ons: extra visit, longer distance, large number of plants, trash/recycling day, additional approved household task, holiday/rush scheduling. Displayed range: $10 – $40 / job (examples). Examples only — not income guarantees.",
  items: [
    {
      id: "quick",
      label: "Quick check-in",
      price: "$10–$15",
      notes: "Short nearby visit for a few simple tasks",
    },
    {
      id: "standard",
      label: "Standard house check",
      price: "$15–$25",
      notes: "Mail/packages + plants + lights + basic visual check",
    },
    {
      id: "longer",
      label: "Longer / multi-task visit",
      price: "$25–$40+",
      notes: "Longer visit, more plants/tasks, larger home, or additional agreed responsibilities",
    },
    { id: "extra-visit", label: "Add-on: Extra visit", price: "Agree in advance" },
    { id: "distance", label: "Add-on: Longer distance", price: "Agree in advance" },
    { id: "plants", label: "Add-on: Large number of plants", price: "Agree in advance" },
    { id: "trash", label: "Add-on: Trash / recycling day", price: "Agree in advance" },
    { id: "task", label: "Add-on: Additional approved household task", price: "Agree in advance" },
    { id: "rush", label: "Add-on: Holiday / rush scheduling", price: "Agree in advance" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only — never ✓. */
export const HOUSE_SITTER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Define Your House-Sitting Service",
    desc: [
      "Choose what you will offer:",
      "☐ Mail collection",
      "☐ Package bring-in",
      "☐ Plant watering",
      "☐ Light rotation",
      "☐ Blinds/curtains as instructed",
      "☐ Trash/recycling",
      "☐ Basic visual home check",
      "☐ Client update after visit",
      "",
      "Write:",
      "I WILL DO: ________",
      "I WILL NOT DO: ________",
      "",
      "Clearly separate basic house sitting from pet care, overnight stays, repairs, cleaning, or other services.",
    ].join("\n"),
  },
  {
    title: "Create Your Starter Package",
    desc: [
      "Example:",
      "",
      "BASIC HOUSE CHECK",
      "- One agreed visit",
      "- Mail/packages brought inside",
      "- Plants watered per instructions",
      "- Lights/blinds adjusted per checklist",
      "- Basic visual check",
      "- Completion text",
      "",
      "Starting Price: $____",
      "Service Area: ________",
      "Typical Visit Length: ________",
      "",
      "Define extra-visit and distance charges if needed.",
      "See Suggested Pricing — $10 – $40 / job (examples).",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way people hear about your service. Pick only 2 or 3 this month.",
      "",
      "Best channels for a trust-based service:",
      "☐ Friends/family",
      "☐ Referrals",
      "☐ Trusted neighbors",
      "☐ Parent/family network",
      "☐ Church/community network",
      "☐ Neighborhood group",
      "☐ Local bulletin board where permitted",
      "",
      "Open Google Docs from the Tools tab (sign in with Google, or use an account you already have).",
      "",
      "Write:",
      "What I Offer: Basic House Sitting / Home Check-Ins",
      "Starting Price: $____",
      "Service Area: ________",
      "",
      "Set ONE measurable goal per channel. Examples:",
      "- Tell 10 trusted contacts",
      "- Ask 5 people for referrals",
      "- Share one approved neighborhood post",
      "",
      "Do not publicly advertise exact client travel dates or addresses.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple service message/flyer.",
      "",
      "Sample:",
      "",
      "TRAVELING?",
      "",
      "I provide basic home check-ins while you’re away:",
      "- Mail & Packages",
      "- Plants",
      "- Lights",
      "- Basic Home Check",
      "- Completion Updates",
      "",
      "Starting at $____ per agreed job/visit.",
      "",
      "Trusted local service. Contact: ________",
      "",
      "For minors, use parent/guardian-approved contact information.",
      "",
      "Do not post photos of client homes or identify vacationing clients without permission.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use only the 2–3 channels selected.",
      "",
      "This week:",
      "- Contact 8–12 trusted/appropriate people",
      "- Ask for referrals",
      "- Share approved service information",
      "- Respond promptly",
      "- Track inquiries",
      "",
      "Sample:",
      "“Hi! I’m offering basic house-sitting check-ins for people who travel. I can collect mail/packages, water plants, rotate lights, complete a basic visual check, and send an update after each visit. My service starts at $____.”",
      "",
      "Track: Date | Person | Channel | Response | Follow-Up",
      "",
      "Trust matters more than reaching hundreds of strangers.",
    ].join("\n"),
  },
  {
    title: "Complete the Pre-Trip Walkthrough",
    desc: [
      "Whenever possible, walk through the home with the client before they leave.",
      "",
      "Record:",
      "Client: ________",
      "Travel Dates: ________",
      "Address: ________",
      "Visit Dates/Times: ________",
      "Entry Method: ________",
      "Alarm Instructions: ________",
      "Emergency Contact: ________",
      "Mail Location: ________",
      "Plant Instructions: ________",
      "Light Instructions: ________",
      "Trash/Recycling: ________",
      "Approved Rooms/Areas: ________",
      "Special Concerns: ________",
      "",
      "Ask whether anyone else is expected to enter the property.",
      "",
      "Never write an access code somewhere publicly visible.",
    ].join("\n"),
  },
  {
    title: "Secure the Access Plan",
    desc: [
      "Confirm how you will enter and secure the home.",
      "",
      "Options may include:",
      "- Physical key",
      "- Lockbox",
      "- Smart lock / client-issued temporary code",
      "- Other client-approved method",
      "",
      "Rules:",
      "- Never label a key with the full address",
      "- Never copy a key without permission",
      "- Never share a key/code",
      "- Never leave access information unsecured",
      "- Lock up exactly as instructed",
      "",
      "If access fails, contact the client/designated emergency contact. Do not force entry.",
    ].join("\n"),
  },
  {
    title: "Complete Each House Check",
    desc: [
      "Use the SAME checklist every visit.",
      "",
      "Possible sequence:",
      "☐ Enter/disable alarm as instructed",
      "☐ Check for obvious urgent problems",
      "☐ Collect mail",
      "☐ Bring approved packages inside",
      "☐ Water plants exactly as instructed",
      "☐ Adjust lights/blinds",
      "☐ Handle trash/recycling if included",
      "☐ Check agreed doors/windows",
      "☐ Look for leaks/water where instructed",
      "☐ Complete any other approved task",
      "☐ Restore/arm alarm and lock up",
      "",
      "Do not explore private areas or open drawers/cabinets without a task-related reason and permission.",
    ].join("\n"),
  },
  {
    title: "Report the Visit & Handle Problems",
    desc: [
      "After each visit, send a short update.",
      "",
      "Sample:",
      "“House check complete at 4:15 PM. Mail brought in, plants watered, package inside, lights adjusted, and home secured. Everything looked normal.”",
      "",
      "If something is wrong:",
      "- Stay safe",
      "- Do not attempt dangerous repairs",
      "- Take an appropriate photo if useful and permitted",
      "- Contact the homeowner/emergency contact",
      "- For immediate threats such as fire, break-in, or other emergencies, contact appropriate emergency services",
      "",
      "Do not post house updates publicly.",
    ].join("\n"),
  },
  {
    title: "Complete the Final Visit & Handoff",
    desc: [
      "On the last visit:",
      "- Complete full checklist",
      "- Bring in final mail/packages",
      "- Complete plant/light tasks",
      "- Handle agreed trash/recycling",
      "- Confirm home is secured",
      "- Send final update",
      "- Return key/access item as agreed",
      "- Remove temporary access information you no longer need",
      "",
      "Sample:",
      "“Final house check is complete and the home is secured. Key was returned as agreed. Thank you for trusting me with your home.”",
    ].join("\n"),
  },
  {
    title: "Get Rebooked & Build Trust",
    desc: [
      "After successful completion, ask:",
      "“Would you like me to help again the next time you travel?”",
      "",
      "With permission, ask for a short testimonial/referral.",
      "",
      "Track repeat-client preferences:",
      "- Plant routine",
      "- Light routine",
      "- Trash day",
      "- Preferred update style",
      "- Usual visit schedule",
      "",
      "Do NOT retain access codes or sensitive security information longer than necessary.",
      "",
      "TRUST → CONSISTENT CHECKLIST → GOOD UPDATES → SAFE HOME → REBOOKING → REFERRALS",
    ].join("\n"),
  },
];

export function houseSitterToolsDisclaimer(): string {
  return "Beginner stack: Phone + Calendar + Checklist + Maps. House sitting is a trust service. Never post that owners are away, share keys/codes, or keep access information longer than necessary. Parent/guardian approval for minors.";
}

/** Weekly house-sitter profit math. */
export function computeHouseSitterProfit(input: {
  averageFeePerVisit: number;
  paidVisitsPerWeek: number;
  addOnRevenue?: number;
  travelFuel?: number;
  parkingTolls?: number;
  supplies?: number;
  advertising?: number;
  otherExpenses?: number;
  averageHoursPerVisitIncludingTravel?: number;
}): {
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  weeklyHours: number;
  effectiveProfitPerHour: number | null;
} {
  const fee = Math.max(0, Number(input.averageFeePerVisit) || 0);
  const visits = Math.max(0, Number(input.paidVisitsPerWeek) || 0);
  const addOns = Math.max(0, Number(input.addOnRevenue) || 0);
  const weeklyRevenue = fee * visits + addOns;
  const weeklyExpenses =
    Math.max(0, Number(input.travelFuel) || 0) +
    Math.max(0, Number(input.parkingTolls) || 0) +
    Math.max(0, Number(input.supplies) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const hoursPer = Math.max(0, Number(input.averageHoursPerVisitIncludingTravel) || 0);
  const weeklyHours = hoursPer * visits;
  return {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    weeklyHours,
    effectiveProfitPerHour: weeklyHours > 0 ? weeklyProfit / weeklyHours : null,
  };
}
