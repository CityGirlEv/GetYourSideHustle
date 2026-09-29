/**
 * Reinvest Like a CEO (Age-Appropriate) (`junior-reinvest-ceo`, Guide #099).
 * Money-management / reinvestment guide — plain data only (no guide-tools imports).
 * No competitor research, business name, or GYSH marketing stages.
 */

export const JUNIOR_REINVEST_CEO_REALITY_CHECK = {
  title: "GIVE EVERY DOLLAR A JOB",
  body: [
    "A smart hustler doesn't automatically spend everything earned.",
    "",
    "Three buckets:",
    "SAVE — money for future goals",
    "ENJOY — money you can spend",
    "GROW — money put back into your side hustle",
    "",
    "Reinvesting = using some side hustle earnings to help the side hustle operate better, replace supplies, or grow.",
    "",
    "Tagline: Earn It. Split It. Grow It Like a CEO.",
  ].join("\n"),
};

/** CEO money plan shown above freeform Notes for this guide. */
export const JUNIOR_REINVEST_CEO_NOTES_WORKSHEET = `MY CEO MONEY PLAN

Hustle: __________
Week/Date: __________

Money Collected: $____
Expenses: $____
Money Available: $____

MY SPLIT:
Save ____%
Enjoy ____%
Grow ____%

AMOUNTS:
Save $____
Enjoy $____
Grow $____

GROW WISH LIST:
1. __________ $____
2. __________ $____
3. __________ $____

WHAT I REINVESTED IN:
____________________
Cost: $____

DID IT HELP?
____________________

WHAT I LEARNED:
____________________

NEXT MONEY GOAL:
____________________

GYSH PRO TIP — DON'T CONFUSE “I WANT IT” WITH “MY HUSTLE NEEDS IT.”
A CEO asks: “What will this purchase DO for my side hustle?”
Sometimes the smartest CEO decision is buying something useful.
Sometimes it's keeping the money in the GROW bucket until there's a better reason to spend it.

CEO CHALLENGE:
Track every side hustle dollar for one full week.
At the end, account for where every dollar went.`;

export const JUNIOR_REINVEST_CEO_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this guide is",
    detail:
      "Don't spend every dollar you earn. Learn to divide side hustle earnings into Save, Enjoy, and Grow buckets and make smart decisions about putting money back into your side hustle. Tagline: Earn It. Split It. Grow It Like a CEO. Category: Junior / Money Skills. Best for juniors / teens. Beginner · $0 startup · Timeline: 1–2 weeks · Income type: Money Management / Reinvestment.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "A side hustle earning some money · Parent/guardian guidance where appropriate · Calculator · Simple earnings/expense tracker · 3 money categories (Save / Enjoy / Grow).",
  },
  {
    id: "not-need",
    label: "You do NOT need",
    detail:
      "A formal business name · Competitor research · A business plan. This is a money-habit system, not a side-hustle-launch guide.",
  },
  {
    id: "numbers",
    label: "Know these 3 numbers",
    detail:
      "Money Collected · Hustle Expenses · Money Left After Expenses (Money Available to Split).",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — Want vs need",
    detail:
      "Don't confuse “I want it” with “my side hustle needs it.” A CEO asks what the purchase will DO for the side hustle. Sometimes the smart move is keeping Grow money until there's a better reason to spend.",
  },
];

export const JUNIOR_REINVEST_CEO_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Income and expense tracking",
  },
  {
    label: "Google Docs",
    url: "https://docs.google.com/",
    note: "Goals / reinvestment plan",
  },
  {
    label: "Google Drive",
    url: "https://drive.google.com/",
    note: "Receipts and files",
  },
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Savings / goal tracker (optional)",
  },
];

export const JUNIOR_REINVEST_CEO_SUPPLIES = {
  starterKitTotal:
    "About $0–15 — calculator + notebook/spreadsheet + three labeled buckets (envelopes, jars, or digital categories)",
  items: [
    {
      id: "calc",
      name: "Calculator",
      qty: "1",
      estCost: "$0",
      notes: "Essential — phone calculator is fine",
    },
    {
      id: "notebook",
      name: "Notebook or spreadsheet",
      qty: "1",
      estCost: "$0–5",
      notes: "Essential — track earnings and expenses",
    },
    {
      id: "earnings",
      name: "Earnings records",
      qty: "1 log",
      estCost: "$0",
      notes: "Essential — don't guess",
    },
    {
      id: "expenses",
      name: "Expense records",
      qty: "1 log",
      estCost: "$0",
      notes: "Essential — hustle costs only",
    },
    {
      id: "buckets",
      name: "Tracking system: 3 envelopes OR 3 jars OR spreadsheet OR digital tracker",
      qty: "1 system",
      estCost: "$0–10",
      notes: "Essential — labels: SAVE · ENJOY · GROW",
    },
    {
      id: "receipts",
      name: "Receipt envelope",
      qty: "1",
      estCost: "$0–2",
      notes: "Optional",
      optional: true,
    },
    {
      id: "folder",
      name: "Folder",
      qty: "1",
      estCost: "$0–3",
      notes: "Optional",
      optional: true,
    },
    {
      id: "chart",
      name: "Goal chart",
      qty: "1",
      estCost: "$0–5",
      notes: "Optional",
      optional: true,
    },
  ],
};

export const JUNIOR_REINVEST_CEO_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "jrc_calc",
    name: "Calculator",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Percentages and Money Available · $0 on your phone",
  },
  {
    id: "jrc_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Income and expense tracking",
    url: "https://sheets.google.com/",
  },
  {
    id: "jrc_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Goals / reinvestment plan",
    url: "https://docs.google.com/",
  },
  {
    id: "jrc_drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Receipts and files",
    url: "https://drive.google.com/",
    optional: true,
  },
  {
    id: "jrc_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Savings / goal tracker",
    url: "https://www.canva.com/",
    optional: true,
  },
  {
    id: "jrc_parent",
    name: "Parent / Guardian",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Financial / account help when appropriate",
  },
  {
    id: "jrc_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Calculator + Google Sheets + 3 Buckets (Save / Enjoy / Grow)",
  },
];

export const JUNIOR_REINVEST_CEO_PRICING = {
  tabLabel: "Build Your CEO Money Split",
  intro: [
    "FIRST:",
    "Money Collected − Hustle Expenses = Money Available to Split",
    "",
    "Then choose percentages. Your percentages MUST total 100%. There is no perfect split.",
    "",
    "Example splits:",
    "40% Save / 30% Enjoy / 30% Grow",
    "50% Save / 20% Enjoy / 30% Grow",
    "30% Save / 30% Enjoy / 40% Grow",
    "",
    "Worked example:",
    "$100 collected − $20 hustle expenses = $80 available",
    "40% Save = $32 · 30% Enjoy = $24 · 30% Grow = $24",
    "",
    "Do not call gross money collected “profit.” Split only Money Available after expenses.",
  ].join("\n"),
  raiseTip:
    "Guardian-approved. Adjust your split for exams or busy months. Examples only — not income guarantees.",
  items: [
    {
      id: "formula",
      label: "MONEY AVAILABLE",
      price: "Collected − Expenses",
      notes: "Only this amount goes into Save / Enjoy / Grow",
    },
    {
      id: "split-a",
      label: "EXAMPLE SPLIT A",
      price: "40% / 30% / 30%",
      notes: "Save / Enjoy / Grow",
    },
    {
      id: "split-b",
      label: "EXAMPLE SPLIT B",
      price: "50% / 20% / 30%",
      notes: "Save / Enjoy / Grow",
    },
    {
      id: "split-c",
      label: "EXAMPLE SPLIT C",
      price: "30% / 30% / 40%",
      notes: "Save / Enjoy / Grow",
    },
    {
      id: "check",
      label: "TOTAL CHECK",
      price: "Must = 100%",
      notes: "If the three % don't add to 100, fix the split before dividing dollars",
    },
  ],
};

/**
 * Core playbook steps (exactly 11). Money-management guide —
 * no standard GYSH marketing block, competitors, or business name.
 * Parent thumbs-up foundation is applied by finalize.
 */
export const JUNIOR_REINVEST_CEO_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Track What You Earn",
    desc: [
      "Record:",
      "",
      "Money Collected: $____",
      "Date: __________",
      "What I Sold/Did: __________",
      "",
      "Don't guess. Track it.",
    ].join("\n"),
  },
  {
    title: "Track Hustle Expenses",
    desc: [
      "Record what it cost to earn that money.",
      "",
      "Examples:",
      "☐ Supplies",
      "☐ Materials",
      "☐ Packaging",
      "☐ Selling fees",
      "☐ Other approved costs",
      "",
      "Expenses: $____",
    ].join("\n"),
  },
  {
    title: "Find Money Available",
    desc: [
      "Money Collected − Hustle Expenses = Money Available",
      "",
      "Example:",
      "$75 collected − $15 expenses = $60 available.",
      "",
      "IMPORTANT:",
      "Money collected is not automatically money available to spend.",
    ].join("\n"),
  },
  {
    title: "Create Your 3 CEO Buckets",
    desc: [
      "Create:",
      "",
      "SAVE — money for future goals",
      "ENJOY — money you can spend",
      "GROW — money put back into your side hustle",
      "",
      "Use envelopes, jars, spreadsheet categories, or another parent-approved method.",
    ].join("\n"),
  },
  {
    title: "Choose Your Split",
    desc: [
      "My CEO Split:",
      "",
      "SAVE: _____%",
      "ENJOY: _____%",
      "GROW: _____%",
      "",
      "TOTAL: 100%",
      "",
      "Choose intentionally instead of deciding after the money is spent.",
    ].join("\n"),
  },
  {
    title: "Split Your Money",
    desc: [
      "Money Available: $____",
      "",
      "SAVE: $____",
      "ENJOY: $____",
      "GROW: $____",
      "",
      "Check:",
      "Do all three amounts equal the total money available?",
      "",
      "☐ Yes",
    ].join("\n"),
  },
  {
    title: "Create a Grow List",
    desc: [
      "List things that could actually help your side hustle.",
      "",
      "Item | Cost | How It Helps",
      "",
      "________ | $____ | __________",
      "________ | $____ | __________",
      "________ | $____ | __________",
      "",
      "Examples:",
      "More supplies · Better packaging · Display materials · Replacement tools · Equipment that saves time · Materials for more products",
    ].join("\n"),
  },
  {
    title: "Think Like a CEO Before Buying",
    desc: [
      "Before spending GROW money ask:",
      "",
      "☐ Does my side hustle actually need this?",
      "☐ Will I use it?",
      "☐ Could it help me make/sell more?",
      "☐ Could it save time?",
      "☐ Can my Grow bucket afford it?",
      "☐ Is there a cheaper option?",
      "",
      "If the answer doesn't make sense:",
      "DON'T BUY IT YET.",
    ].join("\n"),
  },
  {
    title: "Reinvest",
    desc: [
      "With parent/guardian approval where needed:",
      "",
      "What I Bought: __________",
      "Cost: $____",
      "Grow Money Before: $____",
      "Grow Money Left: $____",
      "",
      "Why I Bought It:",
      "____________________",
    ].join("\n"),
  },
  {
    title: "Check the Result",
    desc: [
      "After using your purchase ask:",
      "",
      "Did it:",
      "☐ Help create more products?",
      "☐ Improve quality?",
      "☐ Save time?",
      "☐ Replace something necessary?",
      "☐ Help sales?",
      "☐ Not really help?",
      "",
      "What happened?",
      "____________________",
      "",
      "This is how you learn which purchases are worth making.",
    ].join("\n"),
  },
  {
    title: "Run Your Next CEO Money Meeting",
    desc: [
      "At the end of your week or hustle cycle, review:",
      "",
      "Total Collected: $____",
      "Expenses: $____",
      "Money Available: $____",
      "Saved: $____",
      "Enjoyed: $____",
      "Reinvested: $____",
      "",
      "Ask:",
      "",
      "What worked?",
      "____________________",
      "",
      "What did I waste money on?",
      "____________________",
      "",
      "What does my side hustle need next?",
      "____________________",
      "",
      "Should I change my split?",
      "☐ Yes ☐ No",
      "",
      "Next Split:",
      "Save ____%",
      "Enjoy ____%",
      "Grow ____%",
      "",
      "TOTAL = 100%",
    ].join("\n"),
  },
];

export function juniorReinvestCeoToolsDisclaimer(): string {
  return [
    "Beginner stack: Calculator + Google Sheets + 3 Buckets (Save / Enjoy / Grow).",
    "",
    "Parent/guardian help is appropriate for accounts, banking, and bigger Grow purchases.",
    "",
    "This guide is money management — not launching a new hustle. No marketing apps required.",
  ].join("\n");
}

/** Pure CEO Money Splitter math (expenses before buckets; % must total 100). */
export function computeCeoMoneySplit(input: {
  moneyCollected: number;
  hustleExpenses: number;
  savePercent: number;
  enjoyPercent: number;
  growPercent: number;
}): {
  moneyAvailable: number;
  saveAmount: number;
  enjoyAmount: number;
  growAmount: number;
  percentTotal: number;
  percentagesValid: boolean;
} {
  const collected = Math.max(0, Number(input.moneyCollected) || 0);
  const expenses = Math.max(0, Number(input.hustleExpenses) || 0);
  const savePercent = Math.max(0, Number(input.savePercent) || 0);
  const enjoyPercent = Math.max(0, Number(input.enjoyPercent) || 0);
  const growPercent = Math.max(0, Number(input.growPercent) || 0);
  const moneyAvailable = Math.max(0, collected - expenses);
  const percentTotal = savePercent + enjoyPercent + growPercent;
  const percentagesValid = Math.abs(percentTotal - 100) < 0.01;
  const saveAmount = percentagesValid ? (moneyAvailable * savePercent) / 100 : 0;
  const enjoyAmount = percentagesValid ? (moneyAvailable * enjoyPercent) / 100 : 0;
  const growAmount = percentagesValid ? (moneyAvailable * growPercent) / 100 : 0;
  return {
    moneyAvailable,
    saveAmount,
    enjoyAmount,
    growAmount,
    percentTotal,
    percentagesValid,
  };
}
