/**
 * Piggy Bank: Set Your First Savings Goal (`kids-piggy-first-goal`, Guide #016).
 * Free kids money-skills guide — plain data only (no guide-tools imports).
 */

export const KIDS_PIGGY_FIRST_GOAL_REALITY_CHECK = {
  title: "GIVE YOUR MONEY A GOAL",
  body: "Saving is easier when you know WHAT you're saving for. Example: Goal = $30. You earn/save $5 from each little job. $30 ÷ $5 = about 6 jobs to reach your goal.",
};

/** First savings goal planner shown above freeform Notes for this guide. */
export const KIDS_PIGGY_FIRST_GOAL_NOTES_WORKSHEET = `MY FIRST SAVINGS GOAL

I'm Saving For: __________
Goal Price: $____
Already Saved: $____
Still Needed: $____

My Earning Idea:
____________________

I Will Save Per Job/Sale:
$____ OR ____%

Estimated Jobs/Sales Needed:
______

MY PROGRESS:

Date | Earned | Added to Goal | Savings Total

________ | $____ | $____ | $____
________ | $____ | $____ | $____
________ | $____ | $____ | $____
________ | $____ | $____ | $____

When I Reach My Goal:
____________________

My Next Goal:
____________________

GYSH PRO TIP — DON'T SAY “I CAN'T AFFORD IT YET.”
Ask: “HOW CAN I SAVE FOR IT?”
A big number can feel smaller when you turn it into little goals.
$40 may sound like a lot. But $5 saved eight times? Now you have a plan.`;

export const KIDS_PIGGY_FIRST_GOAL_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this guide is",
    detail:
      "Pick something you want, find out about how much it costs, and use simple math to see how many little jobs or sales it could take to reach your goal — with help from a parent/guardian. Tagline: Pick It. Price It. Earn It. Save for It. Category: Kids / Money Skills. Best for kids. Beginner · $0 startup · A few days · Savings goal / money skills. Guide level: Free.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Parent/guardian help · Something you'd like to save for · Approximate price · Piggy bank/jar/envelope or tracker · Pencil · Calculator if needed.",
  },
  {
    id: "goals",
    label: "Your goal can be",
    detail:
      "Toy · Game · Book · Sports item · Craft supplies · Gift · Special activity · Something for your hustle · Other (write it down).",
  },
  {
    id: "parent",
    label: "Parent / guardian help",
    detail:
      "Parent/guardian helps decide whether the goal and earning activities are appropriate, and helps with prices, money, and purchases.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — Don't say “I can't afford it yet.”",
    detail:
      "Ask: “How can I save for it?” A big number can feel smaller when you turn it into little goals. $40 may sound like a lot — but $5 saved eight times means you have a plan.",
  },
];

export const KIDS_PIGGY_FIRST_GOAL_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Make a goal chart or jar label",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Older kids can track savings (optional)",
  },
];

export const KIDS_PIGGY_FIRST_GOAL_SUPPLIES = {
  starterKitTotal: "About $0–10 — use a jar or envelope you already have plus a label or picture",
  items: [
    {
      id: "spot",
      name: "Choose one: piggy bank OR savings jar OR envelope OR savings tracker",
      qty: "1",
      estCost: "$0–8",
      notes: "Essential",
    },
    {
      id: "label",
      name: "Label / marker — “I'M SAVING FOR __________!”",
      qty: "1",
      estCost: "$0–2",
      notes: "Essential",
    },
    {
      id: "picture",
      name: "Goal picture (print or draw)",
      qty: "1",
      estCost: "$0–2",
      notes: "Fun idea — put it on your jar",
      optional: true,
    },
    {
      id: "stickers",
      name: "Stickers for your tracker",
      qty: "1 sheet",
      estCost: "$0–5",
      notes: "Helpful",
      optional: true,
    },
    {
      id: "calc",
      name: "Calculator (phone or basic)",
      qty: "1",
      estCost: "$0",
      notes: "Helpful for goal math",
      optional: true,
    },
    {
      id: "notebook",
      name: "Notebook / progress tracker",
      qty: "1",
      estCost: "$0–5",
      notes: "Essential — track earnings and savings",
    },
  ],
};

export const KIDS_PIGGY_FIRST_GOAL_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "kpf_calc",
    name: "Calculator",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Goal math · $0 on phone or basic calculator",
  },
  {
    id: "kpf_notebook",
    name: "Notebook",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Track earnings and savings totals · $0–5",
  },
  {
    id: "kpf_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Make a goal chart or jar label",
    url: "https://www.canva.com/",
    optional: true,
  },
  {
    id: "kpf_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Older kids can track savings",
    url: "https://sheets.google.com/",
    optional: true,
  },
  {
    id: "kpf_parent",
    name: "Parent / Guardian",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Help with prices, money, and purchases",
  },
  {
    id: "kpf_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Savings Jar + Goal Picture + Tracker + Parent/Guardian",
  },
];

export const KIDS_PIGGY_FIRST_GOAL_PRICING = {
  tabLabel: "My Savings Goal",
  intro: [
    "Fill in your goal math with a parent/guardian. Approximate prices are okay — prices can change.",
    "",
    "Still Needed = Goal Price − Money Already Saved",
    "Jobs/Sales Needed = Still Needed ÷ Amount Saved Per Job (always round UP).",
  ].join("\n"),
  raiseTip:
    "Celebrate progress, not perfection. Adjust your goal or earn plan with a parent/guardian anytime. Examples only.",
  items: [
    {
      id: "want",
      label: "I WANT",
      price: "__________",
      notes: "Write your goal name",
    },
    {
      id: "cost",
      label: "IT COSTS ABOUT",
      price: "$________",
      notes: "Approximate price is okay",
    },
    {
      id: "have",
      label: "I ALREADY HAVE SAVED",
      price: "$________",
      notes: "Count your piggy / jar first",
    },
    {
      id: "still",
      label: "STILL NEEDED",
      price: "Goal − Already Saved",
      notes: "Example: $40 − $10 = $30",
    },
    {
      id: "per",
      label: "MONEY SAVED PER JOB / SALE",
      price: "$____",
      notes: "Only the part that goes into the goal",
    },
    {
      id: "jobs",
      label: "JOBS / SALES NEEDED",
      price: "Still Needed ÷ Per Job (round UP)",
      notes: "Example: $30 ÷ $4 = 7.5 → about 8 jobs",
    },
  ],
};

/**
 * Core playbook steps (exactly 11). Educational money-skills guide —
 * no marketing / sale closing (savings foundation).
 * Parent thumbs-up foundation is applied by finalize.
 */
export const KIDS_PIGGY_FIRST_GOAL_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Pick Your Goal",
    desc: [
      "What do you want to save for?",
      "",
      "My Goal: __________",
      "",
      "Draw it, write it, or add a picture.",
    ].join("\n"),
  },
  {
    title: "Find the Price",
    desc: [
      "With parent/guardian help:",
      "",
      "My Goal Costs About:",
      "$________",
      "",
      "Remember: Prices can change, so an approximate price is okay.",
    ].join("\n"),
  },
  {
    title: "Count What You Already Have",
    desc: [
      "Money Already Saved:",
      "$________",
      "",
      "Goal Price: $________",
      "− Already Saved: $________",
      "= Still Needed: $________",
    ].join("\n"),
  },
  {
    title: "Make Your Savings Spot",
    desc: [
      "Choose:",
      "☐ Piggy bank",
      "☐ Jar",
      "☐ Envelope",
      "☐ Tracker",
      "",
      "Label it:",
      "",
      "“I'M SAVING FOR __________!”",
    ].join("\n"),
  },
  {
    title: "Pick Safe Ways to Earn",
    desc: [
      "With parent/guardian approval, choose little jobs or a kid hustle.",
      "",
      "Examples:",
      "☐ Extra household jobs agreed upon with parent",
      "☐ Lemonade/snack stand with adult help",
      "☐ Crafts",
      "☐ Bracelets",
      "☐ Yard help",
      "☐ Pet help",
      "☐ Other GYSH Kids hustle",
      "☐ Other: __________",
      "",
      "My earning idea:",
      "____________________",
    ].join("\n"),
  },
  {
    title: "Decide How Much Goes to Your Goal",
    desc: [
      "You do NOT have to save every dollar.",
      "",
      "With parent/guardian help decide:",
      "",
      "From each job/sale, I will put:",
      "$________",
      "",
      "OR",
      "",
      "______% toward my savings goal.",
    ].join("\n"),
  },
  {
    title: "Count How Many Jobs/Sales",
    desc: [
      "Amount Still Needed: $____",
      "Amount Saved Per Job/Sale: $____",
      "",
      "Still Needed ÷ Saved Per Job =",
      "About _____ jobs/sales",
      "",
      "Round UP.",
      "",
      "Write:",
      "",
      "“I need about _____ jobs/sales to reach my goal!”",
    ].join("\n"),
  },
  {
    title: "Make a Goal Tracker",
    desc: [
      "My Goal: $____",
      "",
      "☐ $____",
      "☐ $____",
      "☐ $____",
      "☐ $____",
      "☐ $____",
      "",
      "Add enough checkpoints to reach your goal.",
      "Color/check each one as your savings grow.",
    ].join("\n"),
  },
  {
    title: "Earn & Save",
    desc: [
      "Each time you earn:",
      "",
      "Money Earned: $____",
      "Money Added to Goal: $____",
      "",
      "New Savings Total: $____",
      "",
      "☐ Update tracker",
      "☐ Put savings away",
      "☐ Celebrate your progress!",
    ].join("\n"),
  },
  {
    title: "Check Your Progress",
    desc: [
      "Saved So Far: $____",
      "Goal: $____",
      "Still Needed: $____",
      "",
      "Ask:",
      "",
      "Am I getting closer?",
      "☐ YES!",
      "",
      "Do I want to keep the same goal?",
      "☐ Yes",
      "☐ I want to change it",
      "",
      "It's okay if reaching your goal takes time.",
    ].join("\n"),
  },
  {
    title: "Reach It & Choose What's Next",
    desc: [
      "When your savings reach your goal:",
      "",
      "🎉 I DID IT!",
      "",
      "Before spending, talk with your parent/guardian.",
      "",
      "Choose:",
      "☐ Buy the item",
      "☐ Keep saving for something bigger",
      "☐ Save part and spend part",
      "☐ Put some toward my hustle",
      "☐ Pick my next savings goal",
      "",
      "Write:",
      "",
      "My Next Goal:",
      "____________________",
    ].join("\n"),
  },
];

export function kidsPiggyFirstGoalToolsDisclaimer(): string {
  return "Start with a jar or envelope you already have, a goal picture, and a simple tracker. Parent/guardian help is part of the tool stack.";
}

/** Savings goal math — jobs/sales needed always rounds UP. */
export function computeKidsPiggySavingsGoal(input: {
  goalPrice: number;
  alreadySaved: number;
  amountPerJob: number;
}): {
  stillNeeded: number;
  jobsNeeded: number;
  goalPrice: number;
  alreadySaved: number;
  amountPerJob: number;
} {
  const goalPrice = Math.max(0, Number(input.goalPrice) || 0);
  const alreadySaved = Math.max(0, Number(input.alreadySaved) || 0);
  const amountPerJob = Math.max(0, Number(input.amountPerJob) || 0);
  const stillNeeded = Math.max(0, goalPrice - alreadySaved);
  const jobsNeeded =
    stillNeeded <= 0 ? 0 : amountPerJob > 0 ? Math.ceil(stillNeeded / amountPerJob) : 0;
  return {
    stillNeeded,
    jobsNeeded,
    goalPrice,
    alreadySaved,
    amountPerJob,
  };
}
