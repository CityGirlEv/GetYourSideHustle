/**
 * Babysitter's Helper / Mother's Helper (`mothers-helper`, Guide #001).
 * Parent-present helper work — NOT solo babysitting (#002).
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const MOTHERS_HELPER_REALITY_CHECK = {
  title: "THE PARENT STAYS HOME",
  body: [
    "A Mother's Helper works WITH a parent or responsible adult who remains present.",
    "",
    "You are NOT taking over full childcare responsibility.",
    "",
    "Examples:",
    "Parent works from home while you play with the child.",
    "Parent makes dinner while you help with toys.",
    "Parent handles the baby while you entertain an older child.",
    "Parent organizes the house while you supervise a parent-approved activity nearby.",
    "",
    "Tagline: An Extra Set of Hands for Busy Parents.",
  ].join("\n"),
};

/** Mother's Helper planner shown above freeform Notes for this guide. */
export const MOTHERS_HELPER_NOTES_WORKSHEET = `MY MOTHER'S HELPER PLAN

Services I Offer:

____________________

My Price:
$____

My Marketing Channels:

1. __________

2. __________

3. __________

FAMILY/JOB:

Parent:
____________________

Children/Ages:
____________________

Date:
____________________

Start Time:
____________________

End Time:
____________________

Agreed Price:
$____

Parent Will Remain Present:
☐ Yes

Tasks:
____________________

Allowed Activities:
____________________

Food/Allergy Instructions:
____________________

Important Rules:
____________________

JOB RESULTS:

Hours:
_____

Revenue:
$____

Expenses:
$____

Profit:
$____

What Went Well:
____________________

Would They Like Me Back?
☐ Yes
☐ Maybe
☐ No

Next Job:
____________________

GYSH PRO TIP — DON'T TRY TO BE THE PARENT.
Be the parent's EXTRA SET OF HANDS.
Notice the little things: tidy toys, start an approved activity, keep the child happily occupied nearby.
When parents realize “WOW — I ACTUALLY GOT SOMETHING DONE!” you've shown the value of your service.

BEGINNER CHALLENGE:
Start with ONE trusted family. Complete one 60–90 minute parent-present helper session.
SHOW UP → LISTEN → HELP → CLEAN UP → REPORT BACK → GET REBOOKED — then ask for a referral.

This guide is NOT solo babysitting. See Guide #002 Babysitting Service if a parent will be away.`;

export const MOTHERS_HELPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Help a parent or guardian while THEY ARE STILL HOME by playing with children, organizing toys, preparing simple parent-approved snacks, reading, doing crafts, or helping with kid-related cleanup. This is NOT solo babysitting. Tagline: An Extra Set of Hands for Busy Parents. Category: Kids / Family Services. Best for juniors / teens. Beginner · $0–very low · Flexible / after school / weekends · Client's home · Per job · 2–8 hrs/week · Free Membership.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Parent/guardian approval · Responsible attitude · Patience with children · Ability to follow directions · Reliable transportation / parent transportation when needed · Phone/contact method where age-appropriate.",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail:
      "Experience with younger siblings · Basic child-safety awareness · CPR/First Aid training where appropriate · Simple activity ideas.",
  },
  {
    id: "before-job",
    label: "Before every job, know",
    detail:
      "Children's names/ages · Parent's instructions · Allowed activities · Snack/food rules · Allergy information · Areas of home that are off-limits · Emergency instructions · Start/end time.",
  },
  {
    id: "parent-present",
    label: "IMPORTANT — parent stays present",
    detail:
      "The parent/responsible adult remains present. Do NOT accept responsibilities you are not trained or authorized to perform. Do NOT advertise this guide as solo babysitting — that is Guide #002.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — extra set of hands",
    detail:
      "Don't try to be the parent. Be the parent's extra set of hands. Notice little things: tidy toys, start an approved activity, keep the child happily occupied nearby.",
  },
];

export const MOTHERS_HELPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Schedule jobs",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Track jobs and earnings",
  },
  {
    label: "Google Docs / Notes",
    url: "https://docs.google.com/",
    note: "Save parent instructions",
  },
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Parent-approved flyer",
  },
  {
    label: "Google Maps",
    url: "https://maps.google.com/",
    note: "Parent/guardian can verify location",
  },
];

export const MOTHERS_HELPER_SUPPLIES = {
  starterKitTotal:
    "About $0–15. Most supplies should come from the family. Do not spend a lot of money buying supplies. Ask the parent what is already available.",
  items: [
    {
      id: "family-first",
      name: "Ask the parent what is already available",
      qty: "before buying",
      estCost: "$0",
      notes: "Most supplies should come from the family. Do not spend a lot of money buying supplies.",
    },
    {
      id: "books",
      name: "Books (from family)",
      qty: "as needed",
      estCost: "$0",
      notes: "Possible supply — family provides when possible",
      optional: true,
    },
    {
      id: "toys",
      name: "Toys (from family)",
      qty: "as needed",
      estCost: "$0",
      notes: "Possible supply — family provides",
      optional: true,
    },
    {
      id: "games",
      name: "Games (from family)",
      qty: "as needed",
      estCost: "$0",
      notes: "Possible supply — family provides",
      optional: true,
    },
    {
      id: "coloring",
      name: "Coloring supplies (from family)",
      qty: "as needed",
      estCost: "$0",
      notes: "Ask parent first",
      optional: true,
    },
    {
      id: "crafts",
      name: "Craft supplies (from family)",
      qty: "as needed",
      estCost: "$0",
      notes: "Ask parent first",
      optional: true,
    },
    {
      id: "snacks",
      name: "Parent-approved snacks",
      qty: "as needed",
      estCost: "$0",
      notes: "Family provides — ask about allergies",
      optional: true,
    },
    {
      id: "cleanup",
      name: "Cleanup supplies (from family)",
      qty: "as needed",
      estCost: "$0",
      notes: "Family provides",
      optional: true,
    },
    {
      id: "activity-materials",
      name: "Activity materials (from family)",
      qty: "as needed",
      estCost: "$0",
      notes: "Parent-approved only",
      optional: true,
    },
    {
      id: "phone",
      name: "Phone (if appropriate)",
      qty: "1",
      estCost: "$0",
      notes: "Personal item — age-appropriate",
      optional: true,
    },
    {
      id: "water",
      name: "Water",
      qty: "1",
      estCost: "$0",
      notes: "Personal item",
      optional: true,
    },
    {
      id: "ideas",
      name: "Simple activity ideas",
      qty: "1",
      estCost: "$0",
      notes: "Personal item — write in notes",
    },
    {
      id: "notebook",
      name: "Small notebook",
      qty: "1",
      estCost: "$0–5",
      notes: "Personal item — optional",
      optional: true,
    },
  ],
};

export const MOTHERS_HELPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
}[] = [
  {
    id: "calendar",
    name: "Calendar",
    freePlanAvailable: true,
    costNote: "Schedule jobs",
    url: "https://calendar.google.com/",
  },
  {
    id: "timer",
    name: "Timer",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Track job time — phone timer is fine",
  },
  {
    id: "notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Save parent instructions",
    url: "https://docs.google.com/",
  },
  {
    id: "sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Track jobs and earnings",
    url: "https://sheets.google.com/",
  },
  {
    id: "canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Parent-approved flyer",
    url: "https://www.canva.com/",
  },
  {
    id: "maps",
    name: "Maps",
    freePlanAvailable: true,
    costNote: "Parent/guardian can verify location",
    url: "https://maps.google.com/",
  },
  {
    id: "phone",
    name: "Phone / Text",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Parent-approved communication only",
  },
  {
    id: "parent",
    name: "Parent / Guardian",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Safety, transportation, and job approval",
  },
  {
    id: "beginner-stack",
    name: "Beginner tool stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Parent/Guardian + Calendar + Notes + Simple Job Tracker",
  },
];

export const MOTHERS_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "MOTHER'S HELPER STARTER EXAMPLES",
    "",
    "Quick Help: $10–$15/job — 30–60 minutes of simple parent-present help.",
    "",
    "Standard Help: $15–$25/job — 1–2 hours of play, toys, activities, or simple kid-related help.",
    "",
    "Longer Helper Session: $25–$40/job — longer parent-present session with multiple approved tasks.",
    "",
    "Keep displayed range: $10–$40/job (examples)",
    "",
    "Rates can vary by time, number of children, tasks, experience, location, and local rates.",
    "Always agree on Job + Time + Tasks + Price BEFORE starting.",
  ].join("\n"),
  raiseTip:
    "Rates can vary by time, number of children, tasks, experience, location, and local rates. Always agree on Job + Time + Tasks + Price BEFORE starting.",
  items: [
    {
      id: "quick",
      label: "Quick Help",
      price: "$10–$15/job",
      notes: "30–60 minutes of simple parent-present help",
    },
    {
      id: "standard",
      label: "Standard Help",
      price: "$15–$25/job",
      notes: "1–2 hours of play, toys, activities, or simple kid-related help",
    },
    {
      id: "longer",
      label: "Longer Helper Session",
      price: "$25–$40/job",
      notes: "longer parent-present session with multiple approved tasks",
    },
  ],
};

/** Exactly 11 authored core steps. Marketing = steps 3–5. Use ☐ only. */
export const MOTHERS_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Decide How You Can Help",
    desc: [
      "Choose tasks you are comfortable doing.",
      "",
      "☐ Play with children",
      "☐ Read books",
      "☐ Coloring/crafts",
      "☐ Simple games",
      "☐ Organize toys",
      "☐ Pick up play areas",
      "☐ Help children put toys away",
      "☐ Prepare simple parent-approved snacks",
      "☐ Help with homework/reading",
      "☐ Entertain child while parent works nearby",
      "",
      "My Helper Services:",
      "____________________",
      "",
      "Do NOT advertise yourself as providing solo babysitting through this guide.",
    ].join("\n"),
  },
  {
    title: "Set Your Starter Price",
    desc: [
      "Choose a simple price.",
      "",
      "Example:",
      "",
      "60-Minute Helper Session: $____",
      "",
      "90-Minute Helper Session: $____",
      "",
      "2-Hour Helper Session: $____",
      "",
      "Or:",
      "",
      "Per Job: $____",
      "",
      "See Suggested Pricing.",
      "",
      "Decide what tasks are included.",
    ].join("\n"),
  },
  {
    title: "Choose Your Marketing Channels",
    desc: [
      "A “channel” is one way people hear about you.",
      "",
      "Do not try every way at once.",
      "",
      "Pick ONLY 2 or 3 this month.",
      "",
      "For a young Mother's Helper, focus on TRUSTED connections:",
      "☐ Family",
      "☐ Family friends",
      "☐ Parent referrals",
      "☐ Trusted neighbors",
      "☐ Parent-approved community groups",
      "☐ Church/community contacts",
      "☐ Parent-approved local groups",
      "☐ Parent-approved flyer",
      "",
      "My Service:",
      "Mother's Helper / Parent-Present Child Helper",
      "",
      "My Price:",
      "$____",
      "",
      "My 2–3 Channels:",
      "",
      "1. __________",
      "",
      "2. __________",
      "",
      "3. __________",
      "",
      "SAFETY:",
      "Do NOT publicly post your:",
      "- Home address",
      "- School",
      "- Daily schedule",
      "- Private phone number without parent approval",
      "",
      "A parent/guardian should help with marketing and new contacts.",
    ].join("\n"),
  },
  {
    title: "Make Your Marketing Materials",
    desc: [
      "Create a simple parent-approved flyer/message.",
      "",
      "SAMPLE:",
      "",
      "NEED AN EXTRA SET OF HANDS?",
      "",
      "Mother's Helper Available",
      "",
      "I can help while you are home with:",
      "☐ Playing with children",
      "☐ Reading",
      "☐ Crafts",
      "☐ Toys",
      "☐ Simple activities",
      "☐ Kid-related cleanup",
      "",
      "Parent/Responsible Adult Must Remain Present",
      "",
      "Available:",
      "__________",
      "",
      "Starting at:",
      "$____",
      "",
      "Contact:",
      "Parent-approved contact information",
      "",
      "Keep the message simple and clear.",
      "",
      "Do NOT call yourself a solo babysitter in this offer.",
    ].join("\n"),
  },
  {
    title: "Carry Out Your Marketing Plan",
    desc: [
      "Use ONLY the 2–3 channels you selected.",
      "",
      "Start with people your family already knows.",
      "",
      "This week:",
      "☐ Tell 8–12 appropriate trusted contacts",
      "☐ Ask family for referrals",
      "☐ Send your parent-approved message",
      "☐ Share your flyer where appropriate",
      "☐ Follow up with interested families",
      "",
      "Simple message:",
      "",
      "“Hi! I'm offering Mother's Helper services for families who could use an extra set of hands while a parent is still at home. I can help with playtime, toys, reading, crafts, and other parent-approved activities.”",
      "",
      "Track:",
      "",
      "Date | Family | How They Heard | Response | Follow-Up",
      "",
      "For Juniors/Teens, a parent/guardian should be involved with new-client contact and safety decisions.",
    ].join("\n"),
  },
  {
    title: "Talk to the Parent Before the Job",
    desc: [
      "Ask:",
      "",
      "How many children?",
      "Ages?",
      "What would you like help with?",
      "Will you be home the entire time?",
      "Any allergies?",
      "Any food restrictions?",
      "Any special rules?",
      "What activities are allowed?",
      "What areas are off-limits?",
      "Start time?",
      "End time?",
      "Price agreed?",
      "",
      "Write down important instructions.",
      "",
      "If the parent will NOT remain present, this is no longer the Mother's Helper service described by this guide.",
    ].join("\n"),
  },
  {
    title: "Make a Simple Activity Plan",
    desc: [
      "You don't need an elaborate schedule.",
      "",
      "Choose 2–4 possible activities.",
      "",
      "Example:",
      "1. Coloring",
      "2. Read a book",
      "3. Building blocks",
      "4. Toy cleanup",
      "",
      "Ask the parent which activities are okay.",
      "",
      "For younger children, keep activities simple and age-appropriate.",
    ].join("\n"),
  },
  {
    title: "Arrive Ready to Help",
    desc: [
      "Arrive on time.",
      "",
      "Before starting:",
      "☐ Greet parent",
      "☐ Confirm end time",
      "☐ Confirm tasks",
      "☐ Confirm child rules",
      "☐ Ask where supplies are",
      "☐ Ask about snacks",
      "☐ Ask what requires the parent's help",
      "",
      "Know where the parent will be.",
      "",
      "Remember:",
      "You are there to make the parent's day EASIER.",
    ].join("\n"),
  },
  {
    title: "Be a Great Helper",
    desc: [
      "During the job:",
      "☐ Follow parent instructions",
      "☐ Stay engaged",
      "☐ Play safely",
      "☐ Be patient",
      "☐ Keep activities age-appropriate",
      "☐ Keep areas reasonably tidy",
      "☐ Ask before giving food",
      "☐ Get the parent when needed",
      "",
      "Do NOT:",
      "- Leave the property with the child",
      "- Give medication",
      "- Drive children",
      "- Invite anyone over",
      "- Ignore parent instructions",
      "- Handle emergencies beyond your training",
      "",
      "Get the parent immediately when something requires adult help.",
    ].join("\n"),
  },
  {
    title: "Finish the Job Well",
    desc: [
      "Before you're done:",
      "☐ Put toys away",
      "☐ Clean activity area",
      "☐ Return supplies",
      "☐ Tell parent what you did",
      "☐ Mention any problem",
      "☐ Confirm your hours/job",
      "☐ Receive agreed payment",
      "",
      "Ask:",
      "",
      "“Is there anything else you'd like me to straighten up before I'm finished?”",
      "",
      "A clean ending makes a BIG impression.",
    ].join("\n"),
  },
  {
    title: "Get Rebooked",
    desc: [
      "If the family is happy, ask:",
      "",
      "“Would you like me to help again next week?”",
      "",
      "Mother's Helper work can become recurring:",
      "",
      "Tuesday:",
      "4:00–5:30",
      "",
      "Thursday:",
      "4:00–5:30",
      "",
      "or",
      "",
      "Saturday:",
      "10:00–12:00",
      "",
      "Track repeat families.",
      "",
      "After a successful job, you or your parent can also ask:",
      "",
      "“If you know another family who could use a Mother's Helper, I'd appreciate a referral.”",
      "",
      "Repeat trusted families can be better than constantly finding new ones.",
    ].join("\n"),
  },
];

export function mothersHelperToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: Parent/Guardian + Calendar + Notes + Simple Job Tracker.",
    "",
    "Calendar — schedule jobs. Timer — track job time. Notes — save instructions. Google Sheets — track jobs and earnings. Canva — make a simple parent-approved flyer. Maps — parent/guardian can verify location. Phone/Text — parent-approved communication. Parent/Guardian — safety, transportation, and job approval.",
    "",
    "A parent/guardian should help with marketing, new contacts, transportation, and safety.",
    "",
    "This guide is parent-present helper work — not solo babysitting (see Guide #002).",
  ].join("\n");
}

/** Weekly Mother's Helper earnings math. */
export function computeMothersHelperProfit(input: {
  averageJobPrice: number;
  jobsPerWeek: number;
  tipsExtraPay?: number;
  weeklyExpenses?: number;
  hoursWorkedPerWeek?: number;
}): {
  weeklyRevenue: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  effectiveHourlyRate: number;
} {
  const price = Math.max(0, Number(input.averageJobPrice) || 0);
  const jobs = Math.max(0, Number(input.jobsPerWeek) || 0);
  const tips = Math.max(0, Number(input.tipsExtraPay) || 0);
  const expenses = Math.max(0, Number(input.weeklyExpenses) || 0);
  const hours = Math.max(0, Number(input.hoursWorkedPerWeek) || 0);
  const weeklyRevenue = price * jobs + tips;
  const weeklyProfit = weeklyRevenue - expenses;
  return {
    weeklyRevenue,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    effectiveHourlyRate: hours > 0 ? weeklyProfit / hours : 0,
  };
}
