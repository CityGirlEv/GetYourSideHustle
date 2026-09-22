/** Starter guides for Kids Corner (4–12) and Teens Side Hustle (13–17). */

import type { KidsAudience } from "./kids-team";
import { PARENT_THUMBS_UP_STEP } from "./guide-detailed-steps";

export type KidsGuideStep = {
  title: string;
  body: string;
};

export type KidsGuide = {
  id: string;
  audience: KidsAudience;
  title: string;
  theme: "games-ai" | "savings" | "give-back" | "reinvest";
  /** Free-plan guides (still require membership to open steps). */
  free: boolean;
  summary: string;
  /** Kept for content/tests; guests do not see step previews. */
  previewCount: number;
  steps: KidsGuideStep[];
  parentTip: string;
};

export const KIDS_GUIDES_RAW: KidsGuide[] = [
  // —— Kids (4–12) free ——
  {
    id: "kids-piggy-first-goal",
    free: true,
    audience: "kids",
    title: "Piggy Bank: Set Your First Savings Goal",
    theme: "savings",
    previewCount: 2,
    summary:
      "Pick something you want, find out about how much it costs, and use simple math to see how many little jobs or sales it could take to reach your goal — with help from a parent/guardian.",
    parentTip: "Keep goals small and celebrate progress, not perfection. Help with prices and safe earning ideas.",
    steps: [
      {
        title: "Pick Your Goal",
        body: "Write or draw what you want to save for — a toy, game, book, gift, or something for your side hustle.",
      },
      {
        title: "Find the Price",
        body: "With a parent/guardian, write an approximate price. Prices can change — close is okay.",
      },
      {
        title: "Count What You Already Have",
        body: "Subtract money already saved from the goal price to find Still Needed.",
      },
      {
        title: "Make Your Savings Spot",
        body: "Label a piggy bank, jar, envelope, or tracker: “I'm saving for ______!”",
      },
      {
        title: "Count How Many Jobs/Sales",
        body: "Still Needed ÷ amount saved per job — always round UP. Celebrate each deposit!",
      },
    ],
  },
  {
    id: "kids-kindness-share",
    free: true,
    audience: "kids",
    title: "Give Back: Share a Skill for Free",
    theme: "give-back",
    previewCount: 2,
    summary:
      "Practice kindness with one small free help session — share a skill you already know. No selling, no pricing — just Give-Back Day with a parent nearby.",
    parentTip: "Approve who they help and stay nearby. Keep the first activity small and with people you know.",
    steps: [
      {
        title: "What Are You Good At?",
        body: "List 3 things you know how to do — drawing, reading, games, crafts, or helping with a phone. Small skills count.",
      },
      {
        title: "Pick One Way to Help",
        body: "Choose one skill and finish: “I can use this skill to help someone by __________.” Keep it tiny.",
      },
      {
        title: "Pick Someone to Help",
        body: "Choose a parent-approved person you already know — family, friend, or known neighbor. Never strangers alone.",
      },
      {
        title: "Do Your Give-Back Activity!",
        body: "Show up, be kind, finish what you promised, and clean up. Track it in My Kindness Counter.",
      },
      {
        title: "Plan Your Next Kindness",
        body: "Write one next idea and try a monthly Give-Back Day. Kindness practice — not a paid hustle.",
      },
    ],
  },
  // —— Kids (4–12) member ——
  {
    id: "kids-games-ai",
    free: false,
    audience: "kids",
    title: "Make a Tiny Game with AI (Parent Nearby)",
    theme: "games-ai",
    previewCount: 2,
    summary:
      "Invent and build a tiny maze, quiz, choice-based story, or other simple game with kid-friendly AI help. A parent or guardian stays involved with account setup, privacy, publishing, purchases, messages, and any money-related activity.",
    parentTip:
      "Stay nearby. Parent handles accounts, privacy, publishing, messages, and money. Never enter a child’s full name, home address, school, phone, private photos, passwords, or exact location into an AI tool.",
    steps: [
      {
        title: "Pick one tiny game idea",
        body: "Finish: “My game is a ________.” Keep it small — one goal, simple rules, playable in about 1–5 minutes.",
      },
      {
        title: "Draw it on paper first",
        body: "START → PLAYER DOES SOMETHING → GAME RESPONDS → WIN/TRY AGAIN → END. Maze, quiz, story, or catch game.",
      },
      {
        title: "Ask AI to help with the plan",
        body: "Parent nearby. Safe topic only. No private information. The child chooses what goes into the game.",
      },
      {
        title: "Build a playable version",
        body: "Start screen, one action, a win/end screen. Make it playable before making it fancy.",
      },
      {
        title: "Test, playtest, and share safely",
        body: "Play 3 times yourself, then 1–3 trusted testers. Parent decides if it stays private or is shared.",
      },
    ],
  },
  {
    id: "kids-reinvest-jar",
    free: false,
    audience: "kids",
    title: "Grow Your Hustle: Put Some Earnings Back",
    theme: "reinvest",
    previewCount: 2,
    summary:
      "When you earn, split what's left into Fun, Save, and Grow jars — enjoy some now, save some, and put some back into hustle supplies. No competitors or business name needed.",
    parentTip: "Use three jars or envelopes: Fun, Save, Grow. Keep amounts tiny and visual. Split the same day they earn.",
    steps: [
      {
        title: "Track What You Earn",
        body: "Write down every amount. Date, what you did, money earned. Don't guess.",
      },
      {
        title: "Track What It Cost",
        body: "Did you buy anything to do the job? Money collected is not automatically money you can split.",
      },
      {
        title: "Find Money Left to Split",
        body: "Money earned minus costs. That leftover is what goes into Fun, Save, and Grow.",
      },
      {
        title: "Make Three Jars: Fun, Save, Grow",
        body: "Fun = enjoy now. Save = Piggy Bank goal. Grow = hustle supplies. Decorate them — crafts count!",
      },
      {
        title: "Pick Your Split",
        body: "With a parent, choose percentages that add to 100%. Starter: 40% Save / 30% Fun / 30% Grow.",
      },
      {
        title: "Split Your Money",
        body: "Divide the leftover into the three jars the same day. Don't wait until the coins mix together.",
      },
      {
        title: "Make a Grow Wish List",
        body: "Grow money is only for things that help you earn again — cups, stickers, clay, paper (parent-approved).",
      },
      {
        title: "Think Before You Buy",
        body: "Ask: Do I need it? Will I use it? Could it help me earn again? If it's just for fun, that's the Fun jar.",
      },
      {
        title: "Put Some Earnings Back",
        body: "When the Grow jar has enough, buy one wish-list item with a parent. Write why it helps.",
      },
      {
        title: "Check If It Helped",
        body: "Did the buy help you make more or make the next job easier? Celebrate the habit.",
      },
      {
        title: "Do It Again Next Time You Earn",
        body: "Next payday or sale, split again. Change the percentages only if a parent agrees they still add to 100%.",
      },
    ],
  },
  {
    id: "kids-craft-hustle",
    free: false,
    audience: "kids",
    title: "Craft Hustle Starter + Kevina Kindness Extra",
    theme: "give-back",
    previewCount: 2,
    summary:
      "Make a tiny set of original stickers, charms, kindness cards, or another simple craft; price it with a parent; sell only through parent-approved channels; and include a Kevina-inspired kindness extra. Tagline: Make Something Bright. Sell It Safely. Share a Little Kindness.",
    parentTip: "Supervise oven clay or shipping. Sell only to family, school fairs, or people you know.",
    steps: [
      {
        title: "Make a sample of 3",
        body: "Create three stickers or charms. Quality over lots of items.",
      },
      {
        title: "Price with a parent",
        body: "Add up supplies + a little for your time. Keep it fair and simple ($1–$5 is common).",
      },
      {
        title: "Set a fair table or family stall",
        body: "School fair, family night, or a parent’s approved community table — never alone with strangers.",
      },
      {
        title: "Kevina Glow Getter extra",
        body: "Give one free “kindness card” or mini craft to someone who needs a smile.",
      },
      {
        title: "Split earnings",
        body: "Spend / Save / Hustle jars again — put some back into new supplies.",
      },
    ],
  },

  // —— Teens (13–17) free ——
  {
    id: "junior-savings-ceo",
    free: true,
    audience: "junior",
    title: "Savings Goals for Future CEOs",
    theme: "savings",
    previewCount: 2,
    summary:
      "Name what you’re saving for, the cost, how you’ll earn, and your weekly savings goal — tracked in the Piggy Bank. No competitors or business name needed.",
    parentTip: "Agree on realistic rates and school-first schedules together.",
    steps: [
      {
        title: "Pick What You’re Saving For",
        body: "Choose something meaningful. Write why you want it. You do not need a business name.",
      },
      {
        title: "Find or Estimate the Total Cost",
        body: "Look up a real price or a close estimate with a parent/guardian. Do not use credit or borrow money.",
      },
      {
        title: "Pick a Target Date or Number of Weeks",
        body: "How many weeks until you hope to reach it? School and rest come first. Goals may take longer than expected.",
      },
      {
        title: "Calculate Your Weekly Savings Goal",
        body: "Savings Goal Cost ÷ Number of Weeks = Weekly Savings Goal. Put it in the Piggy Bank tracker.",
      },
      {
        title: "List Safe Ways You Could Earn Money",
        body: "With parent/guardian approval only. Families decide which chores are paid.",
      },
      {
        title: "Pick One or Two Earning Ideas to Try",
        body: "Start small. Weekly savings goal ÷ expected earnings per task ≈ tasks needed per week.",
      },
      {
        title: "Decide How Much of Each Earning You Will Save",
        body: "You do not have to save every dollar. Optional habit: save some, spend some, share/give some.",
      },
      {
        title: "Add Every Savings Amount to the Piggy Bank",
        body: "Update goal cost, total saved, remaining, weeks, percent complete, and next weekly goal.",
      },
      {
        title: "Check Your Progress at the End of Each Week",
        body: "ON TRACK if you met (or almost met) the weekly goal. NEEDS ADJUSTMENT if you are far behind — without shaming yourself.",
      },
      {
        title: "Adjust the Goal or Timeline if Needed",
        body: "Extend the timeline, pick another safe earning idea, or change the goal with a parent/guardian. Never overwork.",
      },
      {
        title: "Celebrate the Milestone and Choose Your Next Goal",
        body: "At 100%, celebrate. Then decide whether to buy the planned item, keep saving, or choose a new goal.",
      },
    ],
  },
  {
    id: "junior-give-back-teach",
    free: true,
    audience: "junior",
    title: "Give Back: Teach What You Know",
    theme: "give-back",
    previewCount: 2,
    summary:
      "Turn something you already know into one simple FREE teaching session for someone else. Build confidence, communication skills, reputation, and the experience of helping others.",
    parentTip:
      "Approve the student, location, transportation, communications, and online arrangements. Host in public or supervised spaces; no private home visits with strangers.",
    steps: [
      {
        title: "Pick Something You Know",
        body: "Write 3 things you're good at, then choose ONE that is easy and safe to teach a beginner.",
      },
      {
        title: "Pick One Simple Lesson",
        body: "Finish: “By the end, the person will know how to _____.” Keep it 30–60 minutes.",
      },
      {
        title: "Choose Who You Want to Help",
        body: "Family, friend, neighbor, senior, or parent-approved group — get guardian approval first.",
      },
      {
        title: "Make Your Lesson Plan",
        body: "Welcome → Show → Do it together → They try → Wrap-up. Use Google Docs.",
      },
      {
        title: "Teach and ask for feedback",
        body: "Let the learner TRY. Ask what was easy/confusing. Never post names/photos without permission.",
      },
    ],
  },
  // —— Teens (13–17) member ——
  {
    id: "junior-games-ai",
    free: false,
    audience: "junior",
    title: "Build a Game with AI — From Idea to Prototype",
    theme: "games-ai",
    previewCount: 2,
    summary:
      "Use AI to help brainstorm a game concept, characters, art direction, dialogue, rules, levels, and testing ideas, then use guardian-approved tools to build a small playable web or mobile prototype.",
    parentTip:
      "Approve accounts, tools, and any publishing. No personal info, payment cards, passwords, or API keys in AI chats. Original/allowed assets only.",
    steps: [
      {
        title: "Create the One-Sentence Game Idea",
        body: "PLAYER + ACTION + GOAL + OBSTACLE. Pick one tiny idea — not Fortnite or Roblox.",
      },
      {
        title: "Write the Mini Game Design Document",
        body: "One page: controls, win/lose, score, target device, and art/sound style.",
      },
      {
        title: "Build the Core Gameplay Loop",
        body: "With guardian-approved tools, make the main action work, then add score and feedback.",
      },
      {
        title: "Test on the Target Device",
        body: "Watch 2–3 trusted testers. Fix bugs before adding more features.",
      },
      {
        title: "Package the Prototype & Create a Demo",
        body: "Save a playable demo and a short “how I built it” note — guardian approval before sharing.",
      },
    ],
  },
  {
    id: "junior-reinvest-ceo",
    free: false,
    audience: "junior",
    title: "Reinvest Like a CEO (Age-Appropriate)",
    theme: "reinvest",
    previewCount: 2,
    summary:
      "Don’t spend every dollar you earn. Split income into Save, Enjoy, and Grow buckets — teen-friendly reinvesting. No competitors or business name needed.",
    parentTip: "Agree on percentages together (example 50/30/20) and review monthly.",
    steps: [
      {
        title: "Open three buckets",
        body: "Save (goal), Enjoy (fun), Grow (supplies / skills that earn again). Bank account sub-pots, envelopes, or a simple spreadsheet work. No business name needed; this is your money-habit system.",
      },
      {
        title: "Pick a split rule",
        body: "Start simple: 50% Save / 30% Enjoy / 20% Grow — adjust with a guardian. Write the rule where you’ll see it every payout.",
      },
      {
        title: "List Grow spends that earn again",
        body: "Supplies, printing, a domain for a school project, ads for a fair booth, or a skill workshop. Only Grow money buys these — and only after Save is funded.",
      },
      {
        title: "Cap Enjoy so Save stays sacred",
        body: "Enjoy is allowed — guilt-free — because Save and Grow are already funded first. Don’t raid Save for impulse buys.",
      },
      {
        title: "Track ROI in plain words",
        body: "“I spent $12 on stickers and earned $40” is great CEO journaling. Review with a guardian monthly and tweak the split if school comes first.",
      },
    ],
  },
  {
    id: "junior-content-create",
    free: false,
    audience: "junior",
    title: "Content Creation Starter (Parent-Friendly)",
    theme: "games-ai",
    previewCount: 2,
    summary:
      "Practice wholesome content for school, a portfolio, or a family brand — privacy-first, parent-approved, and without stranger direct messages. Tagline: Create Something Helpful. Share It Safely.",
    parentTip: "Private accounts preferred; approve every public post.",
    steps: [
      {
        title: "Pick a niche you already like",
        body: "Crafts, study tips, game design notes, or neighborhood kindness projects.",
      },
      {
        title: "Make 3 sample posts offline first",
        body: "Draft captions and images before anything goes public. Guardian review.",
      },
      {
        title: "Privacy checklist",
        body: "No school name on shirts in frame, no location tags, no personal contact info.",
      },
      {
        title: "Publish only with approval",
        body: "School LMS, family newsletter, or guardian-approved channel — not random platforms alone.",
      },
      {
        title: "Tie to hustle + give-back",
        body: "One post can promote a fair booth; one can teach a free tip to help others.",
      },
    ],
  },
];

const PARENT_THUMBS_UP_TITLE_RE =
  /get parent thumbs up on the side hustle|set safety rules with a parent|consult parent about (your )?idea/i;

/** Every kids/teen guide starts with parent thumbs-up. */
export function ensureKidsGuideParentThumbsUp(guide: KidsGuide): KidsGuide {
  const rest = guide.steps.filter((s) => !PARENT_THUMBS_UP_TITLE_RE.test(s.title));
  return {
    ...guide,
    steps: [
      { title: PARENT_THUMBS_UP_STEP.title, body: PARENT_THUMBS_UP_STEP.desc },
      ...rest,
    ],
  };
}

export const KIDS_GUIDES: KidsGuide[] = KIDS_GUIDES_RAW.map(ensureKidsGuideParentThumbsUp);

export function kidsGuideById(guideId: string): KidsGuide | undefined {
  const id = String(guideId || "").trim();
  if (!id) return undefined;
  return KIDS_GUIDES.find((g) => g.id === id);
}

/** Map a Kids/Teens library guide into the Launch Guides detail shape. */
export function kidsGuideToLaunchGuideData(guide: KidsGuide): {
  id: string;
  name: string;
  timeframe: string;
  estEarnings: string;
  bestFor: string;
  steps: { title: string; desc: string }[];
  proTip: string;
  pitfall: string;
} {
  return {
    id: guide.id,
    name: guide.title,
    timeframe:
      guide.id === "junior-savings-ceo"
        ? "2 weeks"
        : guide.audience === "junior"
          ? "1 - 2 weeks"
          : "A few days",
    estEarnings: guide.free ? "Free guide" : "Member guide",
    bestFor: guide.summary,
    steps: guide.steps.map((s) => ({ title: s.title, desc: s.body })),
    proTip: guide.parentTip,
    pitfall: "Skip parent thumbs-up or rush into strangers / public posts without approval.",
  };
}

export function guidesForAudience(audience: KidsAudience): KidsGuide[] {
  return KIDS_GUIDES.filter((g) => g.audience === audience);
}

export function themeLabel(theme: KidsGuide["theme"]): string {
  switch (theme) {
    case "games-ai":
      return "Games & AI";
    case "savings":
      return "Savings";
    case "give-back":
      return "Giving back";
    case "reinvest":
      return "Reinvest";
  }
}

