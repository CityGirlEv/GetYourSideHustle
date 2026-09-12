/**
 * Babysitting Service (`babysitting`, Guide #002).
 * Trusted solo care — distinct from parent-present Mother's Helper (#001).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const BABYSITTING_REALITY_CHECK = {
  title: "PARENTS SET THE RULES",
  body: [
    "Your job is to keep children safe and follow the family's instructions, not make up your own household rules.",
    "",
    "Tagline: Trusted Care. Clear Rules. Happy Parents.",
  ].join("\n"),
};

export const BABYSITTING_NOTES_WORKSHEET = `MY BABYSITTING PLANNER

My Rate: $____/hour
Ages: __________
Availability: __________
Service Area: __________

MY MARKETING CHANNELS:
1. __________
2. __________
3. __________

Family: __________
Parent Contact: __________
Children/Ages: __________
Date: __________
Time: __________
Rate: __________

Allergies/Medical: __________
Food Rules: __________
Bedtime: __________
Activities: __________
Emergency Contact: __________
House Rules: __________

After Job:
Hours Worked: ______
Amount Earned: $____
Notes: __________
Rebooked? ☐ Yes ☐ No

GYSH PRO TIP — TRUST BUILDS REPEAT BUSINESS.
Parents remember the sitter who shows up on time, follows instructions, communicates, keeps their children safe, and leaves things reasonably tidy.
One happy family can lead to several trusted referrals.

BEGINNER CHALLENGE:
Start with ONE parent-approved family you already know.
Do a great job, then ask for your first referral.`;

export const BABYSITTING_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Offer trusted babysitting for families you know or receive through trusted referrals. Provide dependable care while following the parent's house rules, routines, and emergency instructions. Tagline: Trusted Care. Clear Rules. Happy Parents. Category: Kids / Family Services. Best for juniors / teens and adults. Beginner · Very low startup · After school / evenings / weekends · Client home · Hourly / per job · 4–12 hrs/week.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Responsible and dependable · Comfortable caring for children · Good communication · Working phone · Reliable transportation/ride · Parent instructions + emergency contacts.",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail:
      "Babysitting course · CPR/First Aid training · Experience with younger siblings/relatives.",
  },
  {
    id: "beginners",
    label: "Junior/teen beginners should start with",
    detail:
      "Relatives · Family friends · Neighbors the family knows · Parent-approved referrals.",
  },
  {
    id: "parent-know",
    label: "Parent/guardian should know",
    detail: "Client · Address · Start/End Time · Transportation · Contact Info.",
  },
  {
    id: "before-accepting",
    label: "Before accepting, ask",
    detail:
      "Children's ages · Allergies/medical concerns · Food rules · Bedtime · Screen rules · Activities · Emergency contacts · House rules · Authorized pickup · Pets or other household concerns. Never accept responsibilities you aren't trained or comfortable to handle. Follow parent instructions for medications/medical needs and contact emergency services when appropriate.",
  },
];

export const BABYSITTING_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Schedule jobs" },
  { label: "Google Maps", url: "https://maps.google.com/", note: "Directions to the job" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Track jobs and earnings" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Save parent instructions" },
  { label: "Canva", url: "https://www.canva.com/", note: "Simple babysitting flyer" },
];

export const BABYSITTING_SUPPLIES = {
  starterKitTotal: "About $0–20 — start with what you own; optional activity bag is extra",
  items: [
    { id: "phone", name: "Phone", qty: "1", estCost: "$0", notes: "Essential — parent/emergency communication" },
    { id: "charger", name: "Charger", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "contacts", name: "Emergency contacts (written)", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "instructions", name: "Parent instructions", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "transport", name: "Transportation plan", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "coloring", name: "Coloring pages", qty: "1 pack", estCost: "$2–6", notes: "Optional babysitting bag", optional: true },
    { id: "crayons", name: "Crayons", qty: "1 pack", estCost: "$2–5", notes: "Optional", optional: true },
    { id: "cards", name: "Cards", qty: "1", estCost: "$1–4", notes: "Optional", optional: true },
    { id: "books", name: "Books", qty: "1–2", estCost: "$0–8", notes: "Optional", optional: true },
    { id: "crafts", name: "Simple crafts", qty: "1 kit", estCost: "$3–8", notes: "Optional", optional: true },
    { id: "games", name: "Age-appropriate games", qty: "1–2", estCost: "$0–10", notes: "Optional", optional: true },
    { id: "notebook", name: "Notebook", qty: "1", estCost: "$2–5", notes: "Optional", optional: true },
    { id: "flashlight", name: "Flashlight", qty: "1", estCost: "$3–8", notes: "Optional", optional: true },
  ],
};

export const BABYSITTING_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "bs_phone",
    name: "Phone",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Parent and emergency communication",
  },
  {
    id: "bs_calendar",
    name: "Calendar",
    freePlanAvailable: true,
    costNote: "Schedule jobs",
    url: "https://calendar.google.com/",
  },
  {
    id: "bs_timer",
    name: "Timer",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Meals, bedtime, and activity reminders · $0 on your phone",
  },
  {
    id: "bs_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Approved instructions",
    url: "https://docs.google.com/",
  },
  {
    id: "bs_maps",
    name: "Maps",
    freePlanAvailable: true,
    costNote: "Directions",
    url: "https://maps.google.com/",
  },
  {
    id: "bs_pay",
    name: "Payment app / cash",
    freePlanAvailable: true,
    costNote: "When appropriate and permitted",
    url: "https://venmo.com/",
    optional: true,
  },
  {
    id: "bs_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Track jobs and earnings",
    url: "https://sheets.google.com/",
  },
  {
    id: "bs_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Simple babysitting flyer",
    url: "https://www.canva.com/",
    optional: true,
  },
  {
    id: "bs_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Phone + Calendar + Parent Instructions + Emergency Contacts",
  },
];

export const BABYSITTING_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "EXAMPLE STARTER RANGES (examples only — not income guarantees). Displayed range: $12–$25/hour.",
    "",
    "Formula: Hourly Rate × Hours + Approved Add-Ons = Job Total.",
    "Example: $15/hour × 4 hours = $60.",
    "",
    "Rates vary by location, experience, number/ages of children, responsibilities, and time of day. Always agree on rate BEFORE the job.",
  ].join("\n"),
  raiseTip:
    "After a few happy families, raise for extra children, late nights, or extra tasks. Displayed range: $12–$25/hour (examples). Examples only — not income guarantees.",
  items: [
    { id: "one", label: "1 child", price: "$12–$18/hour", notes: "Starter example" },
    { id: "two", label: "2 children", price: "$15–$22/hour", notes: "Starter example" },
    { id: "three", label: "3+ children", price: "$18–$25+/hour", notes: "Starter example" },
    { id: "extra-child", label: "Add-on: Additional children", price: "Agree in advance" },
    { id: "late", label: "Add-on: Late-night care", price: "Agree in advance" },
    { id: "homework", label: "Add-on: Homework help", price: "Agree in advance" },
    { id: "meal", label: "Add-on: Simple meal preparation", price: "Agree in advance" },
    { id: "house", label: "Add-on: Additional agreed household tasks", price: "Agree in advance" },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only. */
export const BABYSITTING_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Decide What You Can Handle",
    desc: [
      "Choose:",
      "",
      "Ages I'm comfortable with: __________",
      "Maximum Children: ______",
      "Available Days/Times: __________",
      "Service Area: __________",
      "",
      "Services:",
      "☐ Babysitting",
      "☐ Date-night sitting",
      "☐ After-school care",
      "☐ Homework help",
      "☐ Simple meals",
      "☐ Other approved: __________",
      "",
      "Juniors/Teens: review this with your parent/guardian.",
    ].join("\n"),
  },
  {
    title: "Set Your Rate",
    desc: [
      "My Rate: $____/hour",
      "",
      "Extra Child: $____",
      "Other Agreed Add-On: $____",
      "",
      "See Suggested Pricing.",
      "",
      "Decide whether you have a minimum booking time if appropriate.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A channel is one way families hear about you.",
      "",
      "Pick ONLY 2 or 3 this month.",
      "",
      "Best babysitting channels:",
      "☐ Family/friends",
      "☐ Parent referrals",
      "☐ Neighbor referrals",
      "☐ Text to trusted contacts",
      "☐ Parent-approved community groups",
      "☐ Parent-approved neighborhood groups",
      "☐ Community/church contacts where appropriate",
      "☐ Simple flyer in approved locations",
      "",
      "Write:",
      "“I offer babysitting for __________.”",
      "“My starting rate is $____/hour.”",
      "“My availability is __________.”",
      "",
      "Set goals:",
      "☐ Ask _____ trusted families for referrals",
      "☐ Contact _____ potential families",
      "☐ Share _____ approved flyer/post",
      "",
      "SAFETY:",
      "Junior/Teen sitters should have parent/guardian approval before contacting new families or posting publicly.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple flyer/message:",
      "",
      "BABYSITTING AVAILABLE",
      "",
      "Dependable care for:",
      "- Date Nights",
      "- Evenings",
      "- After-School",
      "- Weekends",
      "",
      "Ages I Care For: __________",
      "Starting Rate: $____/hour",
      "General Service Area: __________",
      "Availability: __________",
      "Contact: __________",
      "",
      "Optional:",
      "CPR/First Aid trained: __________",
      "Experience: __________",
      "",
      "Never put your home address, school schedule, or unnecessary personal information on public materials.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY your selected 2–3 channels.",
      "",
      "Start with trusted connections.",
      "",
      "Contact 8–12 appropriate people/families when available.",
      "",
      "Sample:",
      "",
      "“Hi! I'm offering babysitting for local families and currently have availability __________. My starting rate is $____/hour. If you or someone you trust needs a sitter, please let me know.”",
      "",
      "Ask satisfied families:",
      "“Would you feel comfortable referring me to another family you know?”",
      "",
      "Track:",
      "Date | Family/Referral | Channel | Response | Follow-Up",
      "",
      "Junior/Teen: Parent/guardian stays involved with new contacts and referrals.",
    ].join("\n"),
  },
  {
    title: "Screen & Confirm the Job",
    desc: [
      "Before saying YES, confirm:",
      "",
      "☐ Parent/guardian name",
      "☐ Address",
      "☐ Children's ages",
      "☐ Number of children",
      "☐ Date",
      "☐ Start/end time",
      "☐ Rate",
      "☐ Transportation",
      "☐ Pets",
      "☐ Special needs/concerns",
      "",
      "Junior/Teen: Parent/guardian approves new family/job.",
    ].join("\n"),
  },
  {
    title: "Get Safety & House Instructions",
    desc: [
      "Before parent leaves, confirm:",
      "",
      "☐ Emergency contacts",
      "☐ Allergies",
      "☐ Medications/medical instructions",
      "☐ Food",
      "☐ Bedtime",
      "☐ Screen time",
      "☐ Allowed activities",
      "☐ House rules",
      "☐ Authorized pickup",
      "☐ Parent contact",
      "☐ Emergency plan",
      "",
      "Ask questions BEFORE the parent leaves.",
    ].join("\n"),
  },
  {
    title: "Arrive Ready",
    desc: [
      "☐ Arrive on time",
      "☐ Phone charged",
      "☐ Review instructions",
      "☐ Know exits",
      "☐ Know where emergency supplies are",
      "☐ Put parent contact where easy to reach",
      "",
      "Give the children your attention.",
    ].join("\n"),
  },
  {
    title: "Provide Safe Care",
    desc: [
      "Follow the parent's routine.",
      "",
      "☐ Supervise children",
      "☐ Follow food rules",
      "☐ Help with approved activities",
      "☐ Follow bedtime",
      "☐ Keep appropriate areas tidy",
      "☐ Contact parent when necessary",
      "",
      "Do not invite people over, leave children unattended, or take children somewhere without permission.",
    ].join("\n"),
  },
  {
    title: "Finish the Job Well",
    desc: [
      "Before parent returns:",
      "",
      "☐ Children settled/safe",
      "☐ Toys/activity area reasonably tidy",
      "☐ Dishes from approved meals handled",
      "☐ Belongings gathered",
      "☐ Important information ready",
      "",
      "Tell parent:",
      "- What children ate",
      "- Bedtime",
      "- Activities",
      "- Problems/incidents",
      "- Anything important they should know",
      "",
      "Collect agreed payment.",
    ].join("\n"),
  },
  {
    title: "Get Rebooked",
    desc: [
      "Send a short thank-you:",
      "",
      "“Thanks for having me babysit tonight! I enjoyed spending time with the kids. Please keep me in mind whenever you need a sitter.”",
      "",
      "If appropriate ask:",
      "“Would you like me to check my availability for your next date night?”",
      "",
      "Track repeat families.",
      "",
      "Reliable babysitters can build recurring clients through trust and referrals.",
    ].join("\n"),
  },
];

export function babysittingToolsDisclaimer(): string {
  return "Beginner stack: Phone + Calendar + Parent Instructions + Emergency Contacts. Ask before bringing food or treats because of allergies/house rules. Junior/teen sitters: a parent/guardian should help with new families, transportation, and public posts.";
}

/** Weekly babysitting earnings math. Round monthly as weekly × 4.33. */
export function computeBabysittingProfit(input: {
  hourlyRate: number;
  hoursPerJob: number;
  jobsPerWeek: number;
  addOnIncome?: number;
  weeklyExpenses?: number;
}): {
  jobPay: number;
  weeklyRevenue: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
} {
  const rate = Math.max(0, Number(input.hourlyRate) || 0);
  const hours = Math.max(0, Number(input.hoursPerJob) || 0);
  const jobs = Math.max(0, Number(input.jobsPerWeek) || 0);
  const addOns = Math.max(0, Number(input.addOnIncome) || 0);
  const expenses = Math.max(0, Number(input.weeklyExpenses) || 0);
  const jobPay = rate * hours;
  const weeklyRevenue = jobPay * jobs + addOns;
  const weeklyProfit = weeklyRevenue - expenses;
  return {
    jobPay,
    weeklyRevenue,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
  };
}
