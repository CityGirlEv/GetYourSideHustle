/**
 * Savings Goals for Future CEOs (`junior-savings-ceo`, Guide #019).
 * Junior financial-literacy / savings-goal activity — not a service hustle.
 * Plain data only (no imports from guide-tools).
 */

export const JUNIOR_SAVINGS_CEO_REALITY_CHECK = {
  title: "THIS IS A SAVINGS GOAL — NOT A BUSINESS",
  body: [
    "Name what you’re saving for, the cost, how you’ll earn, and your weekly savings goal — tracked in the Piggy Bank. No competitors or business name needed.",
    "",
    "EARNING is money from an approved task, allowance, gift, or other permitted source.",
    "SPENDING is money used to buy something.",
    "SAVING is money you intentionally keep for later.",
    "A GOAL is something specific you are working toward.",
    "A NEED is something important or necessary. A WANT is something you would like but may not need right away.",
    "",
    "SAVE SOME · SPEND SOME · SHARE/GIVE SOME is a helpful habit. No required percentage.",
    "Optional split example only: earned $20 → save $12 · spend $5 · give/share $3.",
    "",
    "A parent/guardian should approve earning activities, help verify prices, handle digital payments and accounts, and decide whether a task is safe.",
    "Do not share your home address, school, or bank/card information publicly. Do not meet strangers alone, borrow money, or use credit to reach the goal.",
    "",
    "Examples are for learning only. Earnings vary. Do not rush or overwork to hit a date. Saving a small amount consistently still counts.",
  ].join("\n"),
};

export const JUNIOR_SAVINGS_CEO_NOTES_WORKSHEET = `MY SAVINGS GOAL PLAN

My Savings Goal: ________
Why I Want It: ________
Goal Cost: $____
Amount Already Saved: $____
Target Date: ________
Target Number of Weeks: ____
Weekly Savings Goal: $____

Ways I Can Earn: ________
Chosen Earning Idea: ________
Expected Earnings Per Task: $____
Amount I Plan to Save: $____  OR  ____%

PIGGY BANK
Starting Amount: $____
Amount Added This Week: $____
Total Saved: $____
Amount Remaining: $____
Weeks Completed: ____
Target Weeks: ____
Percent Complete: ____%
Next Weekly Goal: $____

Optional this week:
Money Earned: $____
Money Saved: $____
Money Spent: $____
Money Given/Shared: $____

Milestones: ☐ 25%  ☐ 50%  ☐ 75%  ☐ 100%

What Worked: ________
What Was Hard: ________
What I’ll Try Next Week: ________
Parent/Guardian Notes: ________
My Next Milestone: ________
Notes: ________

GYSH PRO TIP
Turn a big number into a weekly plan.
$120 in 12 weeks is $10 a week.
If an approved task earns $5, about 2 tasks a week can reach that target — examples only.
`;

export const JUNIOR_SAVINGS_CEO_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this guide is",
    detail:
      "A junior savings-goal activity: choose a goal, estimate the cost, pick safe ways to earn, set a weekly savings target, and track progress in the Piggy Bank. Time: 2 weeks. Free Guide. No business name, competitors, or marketing. Beginner — no prior business experience required.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Something meaningful to save for · a target cost (parent/guardian can help verify) · safe, age-appropriate ways to earn · willingness to save part of what you earn · the GYSH Piggy Bank or another simple tracker · parent/guardian approval for paid work or money-handling when appropriate.",
  },
  {
    id: "parent",
    label: "Parent / guardian help",
    detail:
      "Approve earning activities, verify costs, handle digital payments and accounts, transport, online marketplace use, and whether a task is safe. Protect personal information. Families decide which household chores are paid.",
  },
  {
    id: "safety",
    label: "Do not",
    detail:
      "Meet strangers alone, enter unfamiliar homes alone, use unsafe tools or hazardous chemicals, drive, do online financial transactions without an adult, take jobs that break age rules or local law, borrow money, or use credit to buy the goal item.",
  },
  {
    id: "pace",
    label: "Pace yourself",
    detail:
      "Goals may take longer than expected. Do not pressure yourself to reach a goal unrealistically fast. Saving even a small amount consistently is progress.",
  },
];

export const JUNIOR_SAVINGS_CEO_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Optional digital savings tracker" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Optional weekly reminder" },
  { label: "Canva", url: "https://www.canva.com/", note: "Optional goal card / vision board" },
  { label: "ChatGPT", url: "https://chatgpt.com/", note: "Brainstorm earning ideas — parent/guardian reviews every idea" },
];

export const JUNIOR_SAVINGS_CEO_SUPPLIES = {
  starterKitTotal: "About $0–15 — use a tracker you already have; do not buy expensive supplies",
  items: [
    { id: "piggy", name: "GYSH Piggy Bank tracker", qty: "1 (in this guide)", estCost: "$0", notes: "Essential — primary savings tracker" },
    { id: "notebook", name: "Notebook or printable savings sheet", qty: "1", estCost: "$0–5", notes: "Essential if you want a paper copy" },
    { id: "pen", name: "Pencil / pen", qty: "1", estCost: "$0–2", notes: "Essential" },
    { id: "calc", name: "Calculator", qty: "1 (phone is fine)", estCost: "$0", notes: "Essential for weekly-goal math" },
    { id: "parent", name: "Parent / guardian help when needed", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "ideas", name: "List of safe earning ideas", qty: "1", estCost: "$0", notes: "Essential — parent-approved" },
    { id: "envelope", name: "Savings envelope", qty: "1", estCost: "$0–2", notes: "Optional", optional: true },
    { id: "jar", name: "Labeled jar", qty: "1", estCost: "$0–5", notes: "Optional", optional: true },
    { id: "box", name: "Small cash box controlled by parent/guardian", qty: "1", estCost: "$0–10", notes: "Optional", optional: true },
    { id: "picture", name: "Goal picture or vision card", qty: "1", estCost: "$0–3", notes: "Optional", optional: true },
    { id: "calendar", name: "Calendar", qty: "1", estCost: "$0–5", notes: "Optional", optional: true },
    { id: "stickers", name: "Stickers / check marks for progress", qty: "1 sheet", estCost: "$0–5", notes: "Optional", optional: true },
    { id: "sheet", name: "Simple spreadsheet (older junior)", qty: "1", estCost: "$0", notes: "Optional digital tracking", optional: true },
  ],
};

export const JUNIOR_SAVINGS_CEO_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "piggy", name: "GYSH Piggy Bank", freePlanAvailable: false, planLabelApplicable: false, costNote: "Primary savings tracker in this guide — $0" },
  { id: "calc", name: "Calculator", freePlanAvailable: false, planLabelApplicable: false, costNote: "Weekly goal and remaining balance · $0 on a phone" },
  { id: "notes", name: "Notes App", freePlanAvailable: false, planLabelApplicable: false, costNote: "Track ideas and progress · $0" },
  { id: "sheets", name: "Google Sheets", freePlanAvailable: true, costNote: "Optional digital savings tracker — sign in with Google, or use an account you already have", url: "https://accounts.google.com/ServiceLogin?continue=https://sheets.google.com/", optional: true },
  { id: "calendar", name: "Google Calendar", freePlanAvailable: true, costNote: "Optional weekly reminder", url: "https://calendar.google.com/", optional: true },
  { id: "canva", name: "Canva", freePlanAvailable: true, costNote: "Optional goal card / vision board", url: "https://www.canva.com/", optional: true },
  { id: "chatgpt", name: "ChatGPT", freePlanAvailable: true, costNote: "Brainstorm age-appropriate earning ideas — parent/guardian reviews every idea", url: "https://chatgpt.com/", optional: true },
  { id: "beginner-stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Piggy Bank + Calculator + Notes + Parent/Guardian" },
];

export const JUNIOR_SAVINGS_CEO_PRICING = {
  tabLabel: "Suggested Earning & Savings Plan",
  intro: [
    "SUGGESTED EARNING & SAVINGS PLAN",
    "",
    "This is not customer-service pricing. There are no packages, hourly rates, or ads.",
    "",
    "Savings Goal Cost ÷ Number of Weeks = Weekly Savings Goal",
    "Weekly Savings Goal ÷ Expected Earnings Per Task = Approximate Tasks Needed Per Week",
    "",
    "LEARNING EXAMPLE (not a promise):",
    "Savings Goal: $120",
    "Time Goal: 12 weeks",
    "Weekly Savings Goal: $10",
    "If a safe approved task earns $5, about 2 tasks per week could reach the weekly savings target.",
    "",
    "Examples are for learning only. Earnings vary. Do not pressure yourself to reach a goal unrealistically fast. Saving even a small amount consistently counts as progress.",
    "",
    "Optional SAVE / SPEND / SHARE example (not required): earned $20 → save $12 · spend $5 · give/share $3.",
  ].join("\n"),
  raiseTip:
    "If you are behind, extend the timeline, pick another safe earning idea, add approved tasks, spend less, or change the goal with a parent/guardian. Never overwork. Examples only.",
  items: [
    { id: "goal", label: "Savings goal cost", price: "$________", notes: "Approximate is okay" },
    { id: "weeks", label: "Number of weeks", price: "____ weeks", notes: "Learning example used 12" },
    { id: "weekly", label: "Weekly savings goal", price: "Cost ÷ Weeks", notes: "Example: $120 ÷ 12 = $10" },
    { id: "task", label: "Expected earnings per approved task", price: "$________", notes: "Example: $5" },
    { id: "count", label: "Approximate tasks per week", price: "Weekly goal ÷ Per task", notes: "Example: $10 ÷ $5 = 2" },
  ],
};

/** Exactly 11 authored core steps. No marketing / business-name / sale closing. */
export const JUNIOR_SAVINGS_CEO_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Pick What You’re Saving For",
    desc: [
      "Choose something meaningful. Write why you want it.",
      "",
      "My Savings Goal: __________",
      "Why I Want It: __________",
      "",
      "Need or want? Both can be okay. A parent/guardian helps if the goal is too big or unsafe.",
      "You do not need a business name.",
    ].join("\n"),
  },
  {
    title: "Find or Estimate the Total Cost",
    desc: [
      "Look up a real price or a close estimate with a parent/guardian.",
      "",
      "Goal Cost: $________",
      "Amount Already Saved: $________",
      "",
      "Prices can change. An approximate cost is okay. Do not use credit or borrow money to skip this step.",
    ].join("\n"),
  },
  {
    title: "Pick a Target Date or Number of Weeks",
    desc: [
      "How many weeks until you hope to reach it? School and rest come first.",
      "",
      "Target Date: __________",
      "Target Number of Weeks: ____",
      "",
      "Goals may take longer than expected. That is normal — not a failure.",
    ].join("\n"),
  },
  {
    title: "Calculate Your Weekly Savings Goal",
    desc: [
      "Savings Goal Cost ÷ Number of Weeks = Weekly Savings Goal.",
      "",
      "If you already saved some: Amount Still Needed = Goal Cost − Amount Already Saved.",
      "Then: Amount Still Needed ÷ Weeks Remaining = Weekly Savings Goal.",
      "",
      "Learning example: $120 ÷ 12 weeks = $10 per week.",
      "Write your weekly savings goal: $________",
      "Put it in the Piggy Bank tracker.",
    ].join("\n"),
  },
  {
    title: "List Safe Ways You Could Earn Money",
    desc: [
      "With parent/guardian approval only. Families decide which chores are paid. Not every household job should be paid.",
      "",
      "Ideas (only if approved and safe):",
      "☐ Extra household chores the family agrees to pay",
      "☐ Helping trusted relatives",
      "☐ Washing a family car",
      "☐ Watering plants",
      "☐ Organizing toys/books",
      "☐ Helping with a family garage sale",
      "☐ Pet-related help with adult supervision",
      "☐ Creating simple crafts",
      "☐ Helping a trusted neighbor with safe tasks",
      "☐ Allowance, if your family uses one",
      "",
      "Do not: meet strangers alone, enter unfamiliar homes alone, use unsafe tools or chemicals, drive, or do online money tasks without an adult.",
      "Optional: Ask ChatGPT at https://chatgpt.com/ for more ideas — a parent/guardian reviews every idea before you try it.",
    ].join("\n"),
  },
  {
    title: "Pick One or Two Earning Ideas to Try",
    desc: [
      "Start small. One or two approved ideas is enough.",
      "",
      "Chosen Earning Idea: __________",
      "Expected Earnings Per Task: $________",
      "",
      "Weekly Savings Goal ÷ Expected Earnings Per Task ≈ tasks needed per week.",
      "Learning example: $10 ÷ $5 = about 2 tasks per week.",
      "Never take unsafe extra work to hit a date.",
    ].join("\n"),
  },
  {
    title: "Decide How Much of Each Earning You Will Save",
    desc: [
      "You do not have to save every dollar.",
      "",
      "From each earning I will save: $________  OR  ______%",
      "",
      "Optional habit (no required split): SAVE SOME · SPEND SOME · SHARE/GIVE SOME.",
      "Example only: earned $20 → save $12 · spend $5 · give/share $3.",
    ].join("\n"),
  },
  {
    title: "Add Every Savings Amount to the Piggy Bank",
    desc: [
      "Each time you save, update the Piggy Bank:",
      "",
      "Goal Name · Goal Cost · Starting Amount · Current Saved Amount",
      "Weekly Savings Goal · Amount Added This Week · Total Saved · Amount Remaining",
      "Weeks Completed · Target Weeks · Percent Complete · Next Weekly Goal",
      "",
      "Optional: Money Earned This Week · Money Saved · Money Spent · Money Given/Shared.",
      "Mark milestones: 25% · 50% · 75% · 100%.",
    ].join("\n"),
  },
  {
    title: "Check Your Progress at the End of Each Week",
    desc: [
      "Compare Estimated Weekly Savings with your Weekly Savings Goal.",
      "",
      "Amount I Saved This Week: $________",
      "Total Saved: $________",
      "Amount Remaining: $________",
      "",
      "☐ 25%  ☐ 50%  ☐ 75%  ☐ 100%",
      "",
      "ON TRACK if you met (or almost met) the weekly goal. NEEDS ADJUSTMENT if you are far behind — without shaming yourself.",
      "What worked: __________",
      "What was hard: __________",
    ].join("\n"),
  },
  {
    title: "Adjust the Goal or Timeline if Needed",
    desc: [
      "If you are behind, choose a safe change with a parent/guardian:",
      "",
      "☐ Extend the timeline",
      "☐ Choose another safe earning idea",
      "☐ Increase the number of approved tasks (without overwork)",
      "☐ Reduce unnecessary spending",
      "☐ Lower or change the goal if appropriate",
      "",
      "Never borrow money, use credit, skip school, or take unsafe work to catch up.",
    ].join("\n"),
  },
  {
    title: "Celebrate the Milestone and Choose Your Next Goal",
    desc: [
      "At 100%, celebrate reaching the goal.",
      "",
      "With a parent/guardian, decide:",
      "☐ Buy the planned item",
      "☐ Keep saving",
      "☐ Choose a new goal",
      "",
      "My Next Milestone / Next Goal: __________",
      "Write a parent/guardian note about what you learned about earning, spending, and saving.",
    ].join("\n"),
  },
];

export function juniorSavingsCeoToolsDisclaimer(): string {
  return [
    "BEGINNER STACK: GYSH Piggy Bank + Calculator + Notes + Parent/Guardian.",
    "Google Sheets, Calendar, Canva, and ChatGPT are optional and free to start. Paid software is not required.",
    "A parent/guardian reviews earning ideas, prices, payments, and any online tools.",
  ].join("\n");
}

export function computeJuniorSavingsGoal(input: {
  juniorSavingsGoalCost?: number;
  amountAlreadySaved?: number;
  weeksRemaining?: number;
  averageEarningsPerTask?: number;
  tasksPerWeek?: number;
  savingsPortionPercent?: number;
}): {
  stillNeeded: number;
  weeklySavingsGoal: number;
  estimatedWeeklyEarnings: number;
  estimatedWeeklySavings: number;
  percentComplete: number;
  onTrack: boolean | null;
  statusLabel: "ON TRACK" | "NEEDS ADJUSTMENT" | "";
} {
  const goal = Math.max(0, Number(input.juniorSavingsGoalCost) || 0);
  const saved = Math.max(0, Number(input.amountAlreadySaved) || 0);
  const weeks = Math.max(0, Number(input.weeksRemaining) || 0);
  const perTask = Math.max(0, Number(input.averageEarningsPerTask) || 0);
  const tasks = Math.max(0, Number(input.tasksPerWeek) || 0);
  const portion = Math.min(100, Math.max(0, Number(input.savingsPortionPercent) || 0));
  const stillNeeded = Math.max(0, goal - saved);
  const weeklySavingsGoal = weeks > 0 ? stillNeeded / weeks : 0;
  const estimatedWeeklyEarnings = perTask * tasks;
  const estimatedWeeklySavings = estimatedWeeklyEarnings * (portion / 100);
  const percentComplete = goal > 0 ? Math.min(100, (saved / goal) * 100) : 0;
  const hasPlan = weeklySavingsGoal > 0 || estimatedWeeklySavings > 0 || stillNeeded === 0;
  const onTrack =
    stillNeeded <= 0 ? true : weeklySavingsGoal > 0 ? estimatedWeeklySavings + 1e-9 >= weeklySavingsGoal : null;
  return {
    stillNeeded,
    weeklySavingsGoal,
    estimatedWeeklyEarnings,
    estimatedWeeklySavings,
    percentComplete,
    onTrack: hasPlan ? onTrack : null,
    statusLabel: onTrack === true ? "ON TRACK" : onTrack === false ? "NEEDS ADJUSTMENT" : "",
  };
}
