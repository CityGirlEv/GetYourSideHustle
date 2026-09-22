/**
 * Grow Your Hustle: Put Some Earnings Back (`kids-reinvest-jar`, Guide #074).
 * Kids reinvestment guide — Fun / Save / Grow. Plain data only (no guide-tools imports).
 * No competitor research, business name, or GYSH marketing stages.
 */

export const KIDS_REINVEST_JAR_REALITY_CHECK = {
  title: "GIVE EVERY COIN A JOB",
  body: [
    "When you earn money, don't spend it all at once.",
    "",
    "Three jars:",
    "FUN — money you can enjoy now",
    "SAVE — money for a future goal",
    "GROW — money you put back into your side hustle",
    "",
    "Putting some earnings back helps you earn again — more supplies, better tools, or the next batch of what you sell.",
    "",
    "Tagline: Earn It. Split It. Grow Your Hustle.",
  ].join("\n"),
};

/** Money-split planner shown above freeform Notes for this guide. */
export const KIDS_REINVEST_JAR_NOTES_WORKSHEET = `MY GROW-YOUR-HUSTLE PLAN

My Hustle: __________
Date: __________

Money I Earned: $____
What It Cost: $____
Money Left to Split: $____

MY SPLIT (must add to 100%):
FUN ____%
SAVE ____%
GROW ____%
TOTAL ____%

AMOUNTS:
FUN $____
SAVE $____
GROW $____

GROW WISH LIST (parent-approved):
1. __________ $____
2. __________ $____
3. __________ $____

WHAT I PUT BACK:
____________________
Cost: $____

DID IT HELP MY HUSTLE?
☐ Yes  ☐ A Little  ☐ Not Yet  ☐ Too Soon to Know

WHAT I LEARNED:
____________________

NEXT TIME I EARN:
____________________

GYSH PRO TIP — DON'T BUY SOMETHING JUST BECAUSE THE GROW JAR HAS MONEY.
Ask: “Will this help me earn again?”
Sometimes the smartest choice is WAIT.

GROW CHALLENGE:
Next time you earn, split the coins the same day.
Don't wait until the coins mix together.`;

export const KIDS_REINVEST_JAR_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this guide is",
    detail:
      "When you earn, split what's left into Fun, Save, and Grow jars so you can enjoy some money now, save some, and put some back into your side hustle. Tagline: Earn It. Split It. Grow Your Hustle. Category: Kids / Money Skills. Best for kids. Beginner · $0 startup. No competitors or business name needed.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "A side hustle that earns money (chores, lemonade, crafts, helping) · Parent/guardian help · Three jars or envelopes labeled Fun, Save, Grow · A calculator or pencil · A simple tracker.",
  },
  {
    id: "before-split",
    label: "Before you split",
    detail:
      "Know how much you collected, what it cost to earn it, and the money left. Money collected is not automatically yours to spend.",
  },
  {
    id: "parent",
    label: "Parent / guardian help",
    detail:
      "Parent/guardian helps with the split, Grow-jar buys, and whether a purchase is a good idea. Keep amounts tiny and visual.",
  },
  {
    id: "pro-tip",
    label: "GYSH Pro Tip — Don't confuse “I want it” with “my side hustle needs it.”",
    detail:
      "Grow-jar money is for things that help you earn again — more cups, stickers, clay, or paper. If it is just a toy, that belongs in Fun, not Grow.",
  },
];

export const KIDS_REINVEST_JAR_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  {
    label: "Canva",
    url: "https://www.canva.com/",
    note: "Make Fun / Save / Grow jar labels",
  },
  {
    label: "Google Sheets",
    url: "https://sheets.google.com/",
    note: "Older kids can track the split (optional)",
  },
];

export const KIDS_REINVEST_JAR_SUPPLIES = {
  starterKitTotal: "About $0–10 for three labeled jars or envelopes (parent helps)",
  items: [
    {
      id: "fun",
      name: "Fun jar / envelope",
      qty: "1",
      estCost: "$0–3",
      notes: "Essential — money you can enjoy now",
    },
    {
      id: "save",
      name: "Save jar / envelope (Piggy Bank goal)",
      qty: "1",
      estCost: "$0–3",
      notes: "Essential",
    },
    {
      id: "grow",
      name: "Grow jar / envelope (next hustle supplies)",
      qty: "1",
      estCost: "$0–3",
      notes: "Essential — money you put back",
    },
    {
      id: "labels",
      name: "Printed Fun / Save / Grow labels",
      qty: "1 set",
      estCost: "$0–2",
      notes: "Essential",
    },
    {
      id: "tracker",
      name: "Simple split tracker (paper or notebook)",
      qty: "1",
      estCost: "$0–2",
      notes: "Essential",
    },
    {
      id: "wish",
      name: "Grow wish-list of next hustle supplies",
      qty: "1",
      estCost: "$0–2",
      notes: "Essential",
    },
    {
      id: "stickers",
      name: "Decorate stickers (optional)",
      qty: "1 pack",
      estCost: "$1–5",
      notes: "Optional",
      optional: true,
    },
  ],
};

export const KIDS_REINVEST_JAR_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "krj_calc",
    name: "Calculator",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Split math · $0 on phone or basic calculator",
  },
  {
    id: "krj_notebook",
    name: "Notebook",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Track earnings, costs, and splits · $0–5",
  },
  {
    id: "krj_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Make Fun / Save / Grow jar labels",
    url: "https://www.canva.com/",
    optional: true,
  },
  {
    id: "krj_sheets",
    name: "Google Sheets",
    freePlanAvailable: true,
    costNote: "Older kids can track the split",
    url: "https://sheets.google.com/",
    optional: true,
  },
  {
    id: "krj_parent",
    name: "Parent / Guardian",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Help with the split, jars, and Grow-jar buys",
  },
  {
    id: "krj_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Calculator + 3 Jars (Fun / Save / Grow) + Parent/Guardian",
  },
];

export const KIDS_REINVEST_JAR_PRICING = {
  tabLabel: "Build Your Money Split",
  intro: [
    "FIRST:",
    "Money I Earned − What It Cost = Money Left to Split",
    "",
    "Then choose percentages. Your percentages MUST total 100%. There is no perfect split.",
    "",
    "Example splits:",
    "40% Save / 30% Fun / 30% Grow",
    "50% Save / 20% Fun / 30% Grow",
    "Even split: about 33% each (adjust with a parent so it adds to 100%)",
    "",
    "Worked example:",
    "$9 earned − $0 costs = $9 left",
    "Even split ≈ $3 Fun · $3 Save · $3 Grow",
    "",
    "Do not call all the money you collected “profit.” Split only the money left after costs.",
  ].join("\n"),
  raiseTip:
    "Parent-approved. Change the split when your goal changes. Examples only — not income guarantees.",
  items: [
    {
      id: "formula",
      label: "MONEY LEFT TO SPLIT",
      price: "Earned − Costs",
      notes: "Only this amount goes into Fun / Save / Grow",
    },
    {
      id: "split-a",
      label: "EXAMPLE SPLIT A",
      price: "40% / 30% / 30%",
      notes: "Save / Fun / Grow",
    },
    {
      id: "split-b",
      label: "EXAMPLE SPLIT B",
      price: "Even three ways",
      notes: "About $3 / $3 / $3 when you earn $9",
    },
    {
      id: "split-c",
      label: "EXAMPLE SPLIT C",
      price: "50% / 20% / 30%",
      notes: "Save-first · Fun / Grow",
    },
    {
      id: "check",
      label: "TOTAL CHECK",
      price: "Must = 100%",
      notes: "If the three % don't add to 100, fix the split before dividing coins",
    },
  ],
};

/**
 * Core playbook steps (exactly 11). Kids money-habit guide —
 * no standard GYSH marketing block, competitors, or business name.
 * Parent thumbs-up foundation is applied by finalize.
 */
export const KIDS_REINVEST_JAR_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Track What You Earn",
    desc: [
      "Write down every amount your side hustle earns. Don't guess.",
      "",
      "Date: __________",
      "What I Did: __________",
      "Money I Earned: $____",
    ].join("\n"),
  },
  {
    title: "Track What It Cost",
    desc: [
      "Did you buy anything to do the job?",
      "",
      "☐ Supplies",
      "☐ Cups / bags / stickers",
      "☐ Other parent-approved costs",
      "☐ Nothing — I used what I already had",
      "",
      "What It Cost: $____",
      "",
      "Money collected is not automatically money you can split.",
    ].join("\n"),
  },
  {
    title: "Find Money Left to Split",
    desc: [
      "Money I Earned − What It Cost = Money Left to Split",
      "",
      "Example:",
      "$9 earned − $0 costs = $9 left.",
      "",
      "THIS is the amount you split into Fun, Save, and Grow.",
    ].join("\n"),
  },
  {
    title: "Make Three Jars: Fun, Save, Grow",
    desc: [
      "Label three jars or envelopes:",
      "",
      "FUN — money you can enjoy now",
      "SAVE — money for a Piggy Bank goal",
      "GROW — money you put back into your side hustle",
      "",
      "Decorate them — crafts count! No business name needed. This is your money-habit setup.",
    ].join("\n"),
  },
  {
    title: "Pick Your Split",
    desc: [
      "With a parent, choose percentages. They MUST add to 100%.",
      "",
      "FUN: _____%",
      "SAVE: _____%",
      "GROW: _____%",
      "",
      "TOTAL: 100%",
      "",
      "Starter idea: 40% Save / 30% Fun / 30% Grow — or an even three-way split.",
    ].join("\n"),
  },
  {
    title: "Split Your Money",
    desc: [
      "Money Left: $____",
      "",
      "FUN: $____",
      "SAVE: $____",
      "GROW: $____",
      "",
      "Do the split the same day you earn — don't wait until the coins mix together.",
      "",
      "☐ The three amounts add up to the money left",
    ].join("\n"),
  },
  {
    title: "Make a Grow Wish List",
    desc: [
      "Grow-jar money is only for things that help you earn again.",
      "",
      "Item | Cost | How It Helps My Hustle",
      "________ | $____ | __________",
      "________ | $____ | __________",
      "________ | $____ | __________",
      "",
      "Examples: more cups, stickers, clay, printer paper, lemonade supplies (parent-approved).",
    ].join("\n"),
  },
  {
    title: "Think Before You Buy",
    desc: [
      "Before spending GROW money, ask a parent and ask yourself:",
      "",
      "☐ Do I need it for my side hustle?",
      "☐ Will I use it?",
      "☐ Could it help me earn again?",
      "☐ Can my Grow jar afford it?",
      "☐ Is there a cheaper option?",
      "",
      "If it is just for fun, that belongs in the Fun jar — not Grow.",
      "If it doesn't make sense: WAIT.",
    ].join("\n"),
  },
  {
    title: "Put Some Earnings Back",
    desc: [
      "With parent/guardian approval, buy one Grow-list item when the jar has enough.",
      "",
      "What I Bought: __________",
      "Cost: $____",
      "Grow Money Before: $____",
      "Grow Money Left: $____",
      "",
      "Why it helps my side hustle:",
      "____________________",
    ].join("\n"),
  },
  {
    title: "Check If It Helped",
    desc: [
      "After you use the Grow buy, ask:",
      "",
      "☐ Helped me make more?",
      "☐ Made the next job easier?",
      "☐ Replaced something I needed?",
      "☐ Not really?",
      "☐ Too soon to know?",
      "",
      "What happened?",
      "____________________",
    ].join("\n"),
  },
  {
    title: "Do It Again Next Time You Earn",
    desc: [
      "Next payday, chore payout, or sale — split again the same day.",
      "",
      "Total Earned: $____",
      "Costs: $____",
      "Money Left: $____",
      "Fun: $____   Save: $____   Grow: $____",
      "",
      "Should I change my split?",
      "☐ Yes  ☐ No",
      "",
      "Next Split: Fun ____%  Save ____%  Grow ____%  (must = 100%)",
      "",
      "Celebrate the habit, not just the coins.",
    ].join("\n"),
  },
];

export function kidsReinvestJarToolsDisclaimer(): string {
  return [
    "Beginner stack: Calculator + 3 Jars (Fun / Save / Grow) + Parent/Guardian.",
    "",
    "Parent/guardian help is part of the tool stack for the split and Grow-jar buys.",
    "",
    "This guide is a money habit — not launching a new hustle. No marketing apps required.",
  ].join("\n");
}

/** Pure Fun / Save / Grow splitter (costs before jars; % must total 100). */
export function computeKidsMoneySplit(input: {
  moneyCollected: number;
  hustleExpenses: number;
  funPercent: number;
  savePercent: number;
  growPercent: number;
}): {
  moneyAvailable: number;
  funAmount: number;
  saveAmount: number;
  growAmount: number;
  percentTotal: number;
  percentagesValid: boolean;
} {
  const collected = Math.max(0, Number(input.moneyCollected) || 0);
  const expenses = Math.max(0, Number(input.hustleExpenses) || 0);
  const funPercent = Math.max(0, Number(input.funPercent) || 0);
  const savePercent = Math.max(0, Number(input.savePercent) || 0);
  const growPercent = Math.max(0, Number(input.growPercent) || 0);
  const moneyAvailable = Math.max(0, collected - expenses);
  const percentTotal = funPercent + savePercent + growPercent;
  const percentagesValid = Math.abs(percentTotal - 100) < 0.01;
  const funAmount = percentagesValid ? (moneyAvailable * funPercent) / 100 : 0;
  const saveAmount = percentagesValid ? (moneyAvailable * savePercent) / 100 : 0;
  const growAmount = percentagesValid ? (moneyAvailable * growPercent) / 100 : 0;
  return {
    moneyAvailable,
    funAmount,
    saveAmount,
    growAmount,
    percentTotal,
    percentagesValid,
  };
}
