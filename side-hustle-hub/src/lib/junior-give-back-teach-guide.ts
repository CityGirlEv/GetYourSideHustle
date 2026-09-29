/**
 * Give Back: Teach What You Know (`junior-give-back-teach`, Guide #009).
 * Free community / skill-sharing guide — plain data only (no guide-tools imports).
 */

export const JUNIOR_GIVE_BACK_TEACH_REALITY_CHECK = {
  title: "YOU ALREADY KNOW SOMETHING WORTH SHARING",
  body: "You don't have to be an expert. Pick something you can comfortably show a beginner how to do — basic computer skills, drawing, crafts, sports basics, homework organization, reading practice, beginner coding, Canva, smartphone help, baking, music, gaming tips, and more.",
};

/** Teaching plan shown above freeform Notes for this guide. */
export const JUNIOR_GIVE_BACK_TEACH_NOTES_WORKSHEET = `MY GIVE-BACK TEACHING PLAN

Skill I'm Teaching: __________
Learner(s): __________
Date: __________
Location: __________

MY LESSON GOAL:
By the end, they will know how to:
____________________________

SUPPLIES:
☐ __________
☐ __________
☐ __________

LESSON:
Welcome: __________
Show: __________
Practice Together: __________
Learner Tries: __________
Wrap-Up: __________

RESULTS:
People Helped: ______
What Went Well: __________
What Was Hard: __________
Feedback: __________
What I'll Change: __________

Did I Enjoy Teaching?
☐ Yes ☐ Maybe ☐ No

Could This Become a Future Hustle?
____________________________

GYSH PRO TIP — TEACH ONE THING WELL
Your first lesson doesn't need to impress 100 people.
Help ONE person understand something they couldn't do before.
That's a successful first teaching experience.`;

export const JUNIOR_GIVE_BACK_TEACH_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this guide is",
    detail:
      "Turn something you already know into one simple FREE teaching session for someone else. Build confidence, communication skills, reputation, and the experience of helping others. Tagline: Know Something? Teach Something. Give Something Back. Category: Junior / Community / Skill Sharing. Best for juniors / teens. Beginner · Free–very low startup · About 2 weeks · Free community service / skill building. Guide level: Free.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "One skill you can teach safely · Parent/guardian approval · Patience · A simple lesson idea · A safe teaching location or approved online setup · Supplies needed for the activity.",
  },
  {
    id: "ask",
    label: "Before you start, answer",
    detail:
      "What can I teach? __________ · Who could benefit? __________ · What should they know when we're finished? __________",
  },
  {
    id: "safety",
    label: "SAFETY — parent / guardian approval",
    detail:
      "Parent/guardian should approve the student, location, transportation, communications, and online arrangements. Avoid teaching activities that require professional credentials, dangerous equipment, or unsafe supervision.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — Teach one thing well",
    detail:
      "Your first lesson doesn't need to impress 100 people. Help ONE person understand something they couldn't do before. That's a successful first teaching experience.",
  },
];

export const JUNIOR_GIVE_BACK_TEACH_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Google Docs",
    url: "https://docs.google.com/",
    note: "Lesson plan and checklist",
  },
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Simple handout or invitation flyer",
  },
  {
    label: "Google Slides",
    url: "https://slides.google.com/",
    note: "Optional visual lesson",
  },
  {
    label: "Google Calendar",
    url: "https://calendar.google.com/",
    note: "Schedule the session",
  },
  {
    label: "Google Forms",
    url: "https://forms.google.com/",
    note: "Simple feedback with adult approval",
  },
];

export const JUNIOR_GIVE_BACK_TEACH_SUPPLIES = {
  starterKitTotal:
    "About $0–20 — keep the first lesson simple and inexpensive; use supplies you already have when possible",
  items: [
    {
      id: "outline",
      name: "Lesson outline (printed or in Docs)",
      qty: "1",
      estCost: "$0–3",
      notes: "Essential",
    },
    {
      id: "materials",
      name: "Supplies / materials for the skill you teach",
      qty: "1 small kit",
      estCost: "$0–15",
      notes: "Essential — depends on the skill",
    },
    {
      id: "phone",
      name: "Phone / timer",
      qty: "1",
      estCost: "$0",
      notes: "Essential — manage lesson time",
    },
    {
      id: "notebook",
      name: "Notebook + pen/pencil",
      qty: "1",
      estCost: "$0–5",
      notes: "Essential",
    },
    {
      id: "water",
      name: "Water",
      qty: "1",
      estCost: "$0–2",
      notes: "Essential for you (and learners if appropriate)",
    },
    {
      id: "location",
      name: "Parent/guardian-approved location or online setup",
      qty: "1",
      estCost: "$0",
      notes: "Essential — safety first",
    },
    {
      id: "handout",
      name: "Printed handout / Canva worksheet",
      qty: "1 set",
      estCost: "$0–5",
      notes: "Optional",
      optional: true,
    },
    {
      id: "demo",
      name: "Demonstration materials / laptop or tablet",
      qty: "as needed",
      estCost: "$0",
      notes: "Optional — use what you already have",
      optional: true,
    },
  ],
};

export const JUNIOR_GIVE_BACK_TEACH_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "jgbt_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Lesson plan and checklist",
    url: "https://docs.google.com/",
  },
  {
    id: "jgbt_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Simple handout or invitation flyer",
    url: "https://www.canva.com/",
    optional: true,
  },
  {
    id: "jgbt_slides",
    name: "Google Slides",
    freePlanAvailable: true,
    costNote: "Optional visual lesson",
    url: "https://slides.google.com/",
    optional: true,
  },
  {
    id: "jgbt_timer",
    name: "Phone Timer",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Manage lesson time · $0 on your phone",
  },
  {
    id: "jgbt_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Schedule the session",
    url: "https://calendar.google.com/",
    optional: true,
  },
  {
    id: "jgbt_forms",
    name: "Google Forms",
    freePlanAvailable: true,
    costNote: "Simple feedback with adult approval",
    url: "https://forms.google.com/",
    optional: true,
  },
  {
    id: "jgbt_parent",
    name: "Parent / Guardian",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Approve learners, location, communications, and online arrangements",
  },
  {
    id: "jgbt_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Google Docs + Timer + Simple Supplies + Parent/Guardian",
  },
];

export const JUNIOR_GIVE_BACK_TEACH_PRICING = {
  tabLabel: "Your Free Give-Back Session",
  intro: [
    "Price: FREE",
    "",
    "This guide is about giving back and gaining experience, not charging.",
    "",
    "IMPORTANT: Free does not mean unplanned. Treat your session professionally.",
  ].join("\n"),
  raiseTip:
    "After you enjoy teaching, you may later explore tutoring or workshops — still with parent/guardian approval. Examples only — not income guarantees.",
  items: [
    {
      id: "price",
      label: "SESSION PRICE",
      price: "FREE",
      notes: "Give-back / community service — not a paid hustle yet",
    },
    {
      id: "length",
      label: "SUGGESTED FIRST SESSION",
      price: "30–60 minutes",
      notes: "Keep the first lesson short and focused",
    },
    {
      id: "goal",
      label: "POSSIBLE GOAL",
      price: "Help 1–5 people",
      notes: "Learn one specific beginner skill",
    },
    {
      id: "gain",
      label: "WHAT YOU GAIN",
      price: "Experience + confidence",
      notes:
        "Teaching experience · Communication skills · Community involvement · Feedback · Possible testimonial with permission · Experience that could help build a future paid hustle",
    },
  ],
};

/**
 * Core playbook steps (exactly 11). Free give-back guide —
 * simple outreach only; no standard 3-step GYSH marketing block.
 * Parent thumbs-up foundation is applied by finalize.
 */
export const JUNIOR_GIVE_BACK_TEACH_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Pick Something You Know",
    desc: [
      "Write 3 things you're good at:",
      "",
      "1. __________",
      "2. __________",
      "3. __________",
      "",
      "Choose ONE that would be easy and safe to teach a beginner.",
      "",
      "My Skill: __________",
    ].join("\n"),
  },
  {
    title: "Pick One Simple Lesson",
    desc: [
      "Don't teach everything you know.",
      "",
      "Finish this sentence:",
      "",
      "“By the end of my lesson, the person will know how to ________________________________.”",
      "",
      "Keep the first lesson 30–60 minutes.",
    ].join("\n"),
  },
  {
    title: "Choose Who You Want to Help",
    desc: [
      "Examples:",
      "☐ Younger child",
      "☐ Friend",
      "☐ Family member",
      "☐ Senior",
      "☐ Neighbor",
      "☐ Community group",
      "☐ School/church/community program where appropriate",
      "",
      "Who I Want to Help: __________",
      "",
      "Get parent/guardian approval before arranging the session.",
    ].join("\n"),
  },
  {
    title: "Make Your Lesson Plan",
    desc: [
      "Open Google Docs (https://docs.google.com/) and write:",
      "",
      "WELCOME — 5 minutes",
      "What are we learning?",
      "",
      "SHOW — 10–15 minutes",
      "Demonstrate it.",
      "",
      "DO IT TOGETHER — 10–15 minutes",
      "Practice together.",
      "",
      "THEY TRY — 10–15 minutes",
      "Let the learner try.",
      "",
      "WRAP-UP — 5 minutes",
      "Review and answer questions.",
    ].join("\n"),
  },
  {
    title: "Gather Your Materials",
    desc: [
      "Make a checklist:",
      "",
      "☐ __________",
      "☐ __________",
      "☐ __________",
      "☐ __________",
      "",
      "Try to use supplies you already have.",
      "Practice your demonstration once before teaching.",
    ].join("\n"),
  },
  {
    title: "Make a Simple Invitation",
    desc: [
      "You do NOT need a big marketing campaign.",
      "",
      "Create a simple message or Canva flyer (https://www.canva.com/):",
      "",
      "FREE BEGINNER __________ SESSION",
      "",
      "I'm practicing my teaching skills by offering one free beginner session on __________.",
      "",
      "You'll learn:",
      "____________________________",
      "",
      "Date: __________",
      "Time: __________",
      "Location/Approved Online Setup: __________",
      "",
      "Parent/Guardian Contact if appropriate: __________",
      "",
      "Keep private information such as your home address off public posts.",
    ].join("\n"),
  },
  {
    title: "Find Your Learner(s)",
    desc: [
      "With parent/guardian approval, tell people you know.",
      "",
      "Example:",
      "“I'm doing a Give Back project and teaching a free beginner lesson on __________. I'm looking for 1–5 people who would like to learn. Interested?”",
      "",
      "Start with trusted:",
      "☐ Family",
      "☐ Friends",
      "☐ Neighbors you know",
      "☐ School/community contacts",
      "☐ Parent-approved groups",
      "",
      "You only need enough people for ONE successful session.",
    ].join("\n"),
  },
  {
    title: "Teach!",
    desc: [
      "Before:",
      "☐ Arrive/setup early",
      "☐ Organize materials",
      "☐ Review lesson",
      "",
      "During:",
      "☐ Explain",
      "☐ Demonstrate",
      "☐ Let them practice",
      "☐ Encourage questions",
      "☐ Be patient",
      "☐ Keep it fun",
      "",
      "Remember: A good teacher doesn't just TALK. A good teacher lets the learner TRY.",
    ].join("\n"),
  },
  {
    title: "Ask for Feedback",
    desc: [
      "Ask:",
      "",
      "“What was your favorite part?”",
      "“What was easy?”",
      "“What was confusing?”",
      "“What could I explain better?”",
      "",
      "With appropriate permission, ask for a short testimonial:",
      "“________ helped me learn how to __________.”",
      "",
      "Never post someone's name/photo/testimonial publicly without appropriate permission.",
    ].join("\n"),
  },
  {
    title: "Think About What You Learned",
    desc: [
      "Write:",
      "",
      "What went well? __________",
      "What was difficult? __________",
      "What did my learner enjoy? __________",
      "What would I change? __________",
      "",
      "Did I enjoy teaching?",
      "☐ Yes",
      "☐ Maybe",
      "☐ No",
    ].join("\n"),
  },
  {
    title: "Decide What's Next",
    desc: [
      "Congratulations — you gave something valuable back.",
      "",
      "Choose:",
      "☐ Teach another free session",
      "☐ Volunteer using this skill",
      "☐ Improve my lesson",
      "☐ Teach a different skill",
      "☐ Explore tutoring",
      "☐ Explore classes/workshops",
      "☐ Explore turning this skill into a paid side hustle",
      "",
      "The free session can become proof that you can organize, teach, communicate, and help someone learn.",
    ].join("\n"),
  },
];

export function juniorGiveBackTeachToolsDisclaimer(): string {
  return "Start with Google Docs, a phone timer, and supplies you already have. Parent/guardian approval is part of the tool stack for safety.";
}

/** Impact math for the free give-back calculator (planning only). */
export function computeJuniorGiveBackImpact(input: {
  sessions: number;
  peoplePerSession: number;
  minutesPerSession: number;
  prepMinutesPerSession: number;
  futureRatePerSession?: number;
  futureSessionCount?: number;
}): {
  totalPeopleHelped: number;
  teachingHours: number;
  prepHours: number;
  totalGiveBackHours: number;
  futureExampleRevenue: number | null;
} {
  const sessions = Math.max(0, Number(input.sessions) || 0);
  const people = Math.max(0, Number(input.peoplePerSession) || 0);
  const minutes = Math.max(0, Number(input.minutesPerSession) || 0);
  const prep = Math.max(0, Number(input.prepMinutesPerSession) || 0);
  const teachingHours = (sessions * minutes) / 60;
  const prepHours = (sessions * prep) / 60;
  const rate = Math.max(0, Number(input.futureRatePerSession) || 0);
  const futureSessions = Math.max(0, Number(input.futureSessionCount) || 0);
  const futureExampleRevenue =
    rate > 0 && futureSessions > 0 ? rate * futureSessions : null;
  return {
    totalPeopleHelped: sessions * people,
    teachingHours,
    prepHours,
    totalGiveBackHours: teachingHours + prepHours,
    futureExampleRevenue,
  };
}
