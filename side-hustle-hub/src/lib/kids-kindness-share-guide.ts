/**
 * Give Back: Share a Skill for Free (`kids-kindness-share`, Guide #008).
 * Free kids kindness / skill-sharing guide — plain data only (no guide-tools imports).
 * Distinct from #009 junior-give-back-teach (structured teaching session).
 */

export const KIDS_KINDNESS_SHARE_REALITY_CHECK = {
  title: "KINDNESS COUNTS TOO!",
  body: [
    "Not everything you do has to make money.",
    "",
    "Sometimes you can use something you're good at simply to help someone else.",
    "",
    "Your payment for this activity is:",
    "Helping Someone · Practice · Confidence · A Good Feeling",
    "",
    "Tagline: Use What You Know to Make Someone's Day Better.",
  ].join("\n"),
};

/** Give-back plan shown above freeform Notes for this guide. */
export const KIDS_KINDNESS_SHARE_NOTES_WORKSHEET = `MY GIVE-BACK PLAN

My Skill:
____________________

Person I'm Helping:
____________________

Parent/Guardian Approved:
☐ Yes

Date:
____________________

I'm Helping With:
____________________

Supplies:
____________________

Time I Helped:
_____ minutes

People Helped:
_____

WAS MY HELP USEFUL?

☐ Yes
☐ A Little
☐ I Need More Practice

WHAT WENT WELL?

____________________

WHAT DID I LEARN?

____________________

HOW DID HELPING MAKE ME FEEL?

____________________

WHAT WOULD I DO DIFFERENTLY?

____________________

MY NEXT KINDNESS IDEA:

____________________

GYSH PRO TIP — SMALL HELP STILL COUNTS.
You don't need to help 100 people, start a charity, organize a giant event, or spend money.
Helping ONE person with ONE thing can make a difference.
Sometimes the smallest act of kindness is the one somebody remembers.`;

export const KIDS_KINDNESS_SHARE_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this guide is",
    detail:
      "Earning money is great, but GYSH is about helping too. Use something you already know how to do to give one small, free gift of help to a family member, friend, neighbor, or other parent-approved person. Tagline: Use What You Know to Make Someone's Day Better. Category: Kids / Kindness / Skill Sharing. Best for kids. Beginner · Free · Timeline: a few days · Free give-back activity. Guide level: Free. This is simpler than #009 Give Back: Teach What You Know — here you HELP with a skill; #009 is a planned free lesson.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "One simple skill you can share · Parent/guardian approval · A safe person to help · Basic supplies you already have · A kind and helpful attitude.",
  },
  {
    id: "ideas",
    label: "Skill ideas",
    detail:
      "Read to a younger child · Help someone learn a game · Make a card · Organize toys or books · Help an older relative use a phone/tablet · Show someone a simple computer skill · Help with a craft · Practice a sports skill with someone · Make a simple flyer · Help decorate for an event · Help someone practice something · Other parent-approved ideas.",
  },
  {
    id: "safety",
    label: "SAFETY — parent / guardian approval",
    detail:
      "Your give-back activity should always be safe, age-appropriate, and parent-approved. A parent/guardian should know who you're helping, where you'll be, what you're doing, and when you're doing it. Never help strangers alone.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — Small help still counts",
    detail:
      "You don't need to help 100 people, start a charity, organize a giant event, or spend money. Helping ONE person with ONE thing can make a difference.",
  },
];

export const KIDS_KINDNESS_SHARE_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Google Docs",
    url: "https://docs.google.com/",
    note: "Make a tiny plan",
  },
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Create a card, handout, or simple design",
  },
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Choose your Give-Back Day",
  },
];

export const KIDS_KINDNESS_SHARE_SUPPLIES = {
  starterKitTotal:
    "About $0 — use supplies you already have whenever possible. You do NOT need to spend a lot of money to help someone.",
  items: [
    {
      id: "paper",
      name: "Paper",
      qty: "as needed",
      estCost: "$0–3",
      notes: "Depending on your skill",
      optional: true,
    },
    {
      id: "pencils",
      name: "Pencils",
      qty: "as needed",
      estCost: "$0",
      notes: "Depending on your skill",
      optional: true,
    },
    {
      id: "markers",
      name: "Crayons / markers",
      qty: "as needed",
      estCost: "$0",
      notes: "Depending on your skill",
      optional: true,
    },
    {
      id: "craft",
      name: "Craft supplies you already have",
      qty: "as needed",
      estCost: "$0",
      notes: "Ask: What do I already have that I can use?",
      optional: true,
    },
    {
      id: "book",
      name: "Book",
      qty: "1",
      estCost: "$0",
      notes: "Depending on your skill",
      optional: true,
    },
    {
      id: "sports",
      name: "Sports equipment you already have",
      qty: "as needed",
      estCost: "$0",
      notes: "Depending on your skill",
      optional: true,
    },
    {
      id: "device",
      name: "Computer / tablet / phone (parent-approved)",
      qty: "1",
      estCost: "$0",
      notes: "Depending on your skill",
      optional: true,
    },
    {
      id: "game",
      name: "Game / practice materials you already have",
      qty: "as needed",
      estCost: "$0",
      notes: "Depending on your skill",
      optional: true,
    },
  ],
};

export const KIDS_KINDNESS_SHARE_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "kks_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Make a tiny plan",
    url: "https://docs.google.com/",
    optional: true,
  },
  {
    id: "kks_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Create a card, handout, or simple design",
    url: "https://www.canva.com/",
    optional: true,
  },
  {
    id: "kks_timer",
    name: "Timer",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Keep track of your helping time · $0 on a phone",
  },
  {
    id: "kks_notes",
    name: "Notes",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Remember what you did · $0 on phone or paper",
  },
  {
    id: "kks_calendar",
    name: "Calendar",
    freePlanAvailable: true,
    costNote: "Choose your Give-Back Day",
    url: "https://calendar.google.com/",
    optional: true,
  },
  {
    id: "kks_parent",
    name: "Parent / Guardian",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Help with safety and arrangements",
  },
  {
    id: "kks_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Your Skill + Supplies You Already Have + Parent/Guardian",
  },
];

export const KIDS_KINDNESS_SHARE_PRICING = {
  tabLabel: "The Price of Kindness",
  intro: [
    "PRICE: $0 — FREE",
    "",
    "This activity is intentionally free.",
    "",
    "You are giving: Your Time + Your Skill + Your Effort + Your Kindness",
    "",
    "But you're still gaining something valuable:",
    "Practice · Confidence · Experience · Communication Skills · Gratitude · The Good Feeling of Helping",
    "",
    "IMPORTANT: If you tell someone you're helping for free, do not ask them for payment afterward.",
    "",
    "This Guide is about practicing GIVING BACK.",
  ].join("\n"),
  raiseTip:
    "Keep it free. Other GYSH guides teach paid hustles — #008 is kindness practice only.",
  items: [
    {
      id: "price",
      label: "ACTIVITY PRICE",
      price: "$0 — FREE",
      notes: "Do not ask for payment afterward",
    },
    {
      id: "give",
      label: "YOU ARE GIVING",
      price: "Time + skill + effort + kindness",
      notes: "Your gift of help",
    },
    {
      id: "gain",
      label: "WHAT YOU GAIN",
      price: "Practice + confidence",
      notes:
        "Experience · Communication skills · Gratitude · The good feeling of helping",
    },
  ],
};

/**
 * Core playbook steps (exactly 11). Free kids give-back guide —
 * NO standard GYSH marketing sequence.
 * Parent thumbs-up foundation is applied by finalize.
 */
export const KIDS_KINDNESS_SHARE_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "What Are You Good At?",
    desc: [
      "Write 3 things you know how to do.",
      "",
      "1. ____________________",
      "2. ____________________",
      "3. ____________________",
      "",
      "They do NOT have to be big skills.",
      "",
      "Maybe you're good at: Drawing · Reading · Games · Computers · Crafts · Sports · Organizing · Phones/Tablets · Decorating",
      "",
      "Everybody knows SOMETHING.",
    ].join("\n"),
  },
  {
    title: "Pick One Way to Help",
    desc: [
      "Choose ONE skill from your list.",
      "",
      "My Skill:",
      "____________________",
      "",
      "Now finish this sentence:",
      "“I can use this skill to help someone by __________.”",
      "",
      "Example:",
      "“I know how to use a smartphone, so I can help Grandma organize her apps.”",
      "",
      "Keep your first Give-Back activity SMALL.",
    ].join("\n"),
  },
  {
    title: "Pick Someone to Help",
    desc: [
      "Choose someone safe and parent-approved.",
      "",
      "Examples:",
      "☐ Family member",
      "☐ Friend",
      "☐ Younger child",
      "☐ Older relative",
      "☐ Known neighbor",
      "☐ Parent-approved community member",
      "",
      "Person I Want to Help:",
      "____________________",
      "",
      "How I Can Help:",
      "____________________",
      "",
      "Ask your parent/guardian before making arrangements.",
    ].join("\n"),
  },
  {
    title: "Ask First",
    desc: [
      "Don't surprise someone with a project they don't want.",
      "",
      "Ask:",
      "“I'm doing a GYSH Give Back activity. Could I help you with __________ for free?”",
      "",
      "Let your parent/guardian help make arrangements when needed.",
      "",
      "If they say no: That's okay! Pick someone else or another activity.",
    ].join("\n"),
  },
  {
    title: "Make a Tiny Plan",
    desc: [
      "Write:",
      "",
      "WHO:",
      "____________________",
      "",
      "WHAT I'M HELPING WITH:",
      "____________________",
      "",
      "WHEN:",
      "____________________",
      "",
      "WHERE:",
      "____________________",
      "",
      "HOW LONG:",
      "____________________",
      "",
      "WHAT I NEED:",
      "____________________",
      "",
      "Keep it simple. This does NOT need to become a giant project.",
    ].join("\n"),
  },
  {
    title: "Get Ready",
    desc: [
      "Before your Give-Back activity:",
      "☐ Gather supplies",
      "☐ Practice if needed",
      "☐ Ask questions",
      "☐ Confirm the time",
      "☐ Confirm the place",
      "☐ Tell parent/guardian",
      "☐ Make sure activity is safe",
      "",
      "Ask yourself:",
      "“Do I know what I'm supposed to do?”",
      "",
      "If not, ASK.",
    ].join("\n"),
  },
  {
    title: "Give Your Help",
    desc: [
      "It's Give-Back Time!",
      "",
      "While helping:",
      "☐ Be kind",
      "☐ Listen",
      "☐ Be patient",
      "☐ Do your best",
      "☐ Ask questions if unsure",
      "☐ Stay focused",
      "☐ Clean up after yourself",
      "",
      "Remember:",
      "You don't have to be perfect.",
      "You're practicing using your skills to help somebody else.",
    ].join("\n"),
  },
  {
    title: "Finish the Job",
    desc: [
      "Before leaving:",
      "☐ Finish what you promised",
      "☐ Put things away",
      "☐ Clean your work area",
      "☐ Make sure the person is happy with the help",
      "",
      "Then say:",
      "“Thanks for letting me help!”",
      "",
      "Yes — YOU can thank THEM too.",
      "They gave you a chance to practice your skill.",
    ].join("\n"),
  },
  {
    title: "Ask How You Did",
    desc: [
      "Ask:",
      "“Was my help useful?”",
      "“What did you like?”",
      "“Is there anything I could do better next time?”",
      "",
      "Write:",
      "",
      "What Went Well:",
      "____________________",
      "",
      "What I Could Improve:",
      "____________________",
      "",
      "Learning how to receive kind feedback is a skill too.",
    ].join("\n"),
  },
  {
    title: "Count Your Kindness",
    desc: [
      "Instead of counting dollars, count your IMPACT.",
      "",
      "People Helped:",
      "_____",
      "",
      "Minutes I Helped:",
      "_____",
      "",
      "What I Did:",
      "____________________",
      "",
      "Something I Learned:",
      "____________________",
      "",
      "Something I'm Proud Of:",
      "____________________",
      "",
      "How Did Helping Make Me Feel?",
      "____________________",
    ].join("\n"),
  },
  {
    title: "Pass It On",
    desc: [
      "You completed your Give-Back activity!",
      "",
      "Now choose what happens next.",
      "☐ Help another person",
      "☐ Share another skill",
      "☐ Do a family volunteer activity",
      "☐ Help with a community project",
      "☐ Try another GYSH hustle",
      "☐ Make Give-Back Day a monthly activity",
      "",
      "MY NEXT KINDNESS IDEA:",
      "____________________",
      "",
      "GYSH KINDNESS CHALLENGE:",
      "Can you use one of your skills to help ONE person every month?",
    ].join("\n"),
  },
];

export function kidsKindnessShareToolsDisclaimer(): string {
  return [
    "Beginner stack: Your Skill + Supplies You Already Have + Parent/Guardian.",
    "",
    "That's enough to start. This guide is free kindness practice — not a paid hustle.",
  ].join("\n");
}

/** Kindness Counter math (no dollars — intentionally free). */
export function computeKidsKindnessCounter(input: {
  activitiesCompleted: number;
  peopleHelped: number;
  minutesHelping: number;
  monthlyGoal?: number;
}): {
  totalActivities: number;
  totalPeopleHelped: number;
  totalHelpingMinutes: number;
  totalHelpingHours: number;
  monthlyGoal: number;
  completed: number;
  stillToGo: number;
} {
  const activities = Math.max(0, Number(input.activitiesCompleted) || 0);
  const people = Math.max(0, Number(input.peopleHelped) || 0);
  const minutes = Math.max(0, Number(input.minutesHelping) || 0);
  const monthlyGoal = Math.max(0, Number(input.monthlyGoal) || 0);
  return {
    totalActivities: activities,
    totalPeopleHelped: people,
    totalHelpingMinutes: minutes,
    totalHelpingHours: minutes / 60,
    monthlyGoal,
    completed: activities,
    stillToGo: Math.max(0, monthlyGoal - activities),
  };
}
