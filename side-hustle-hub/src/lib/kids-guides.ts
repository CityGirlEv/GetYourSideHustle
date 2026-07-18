/** Starter guides for Kids Corner (4–12) and Junior Side Hustle (13–17). */

import type { KidsAudience } from "./kids-team";

export type KidsGuideStep = {
  title: string;
  body: string;
};

export type KidsGuide = {
  id: string;
  audience: KidsAudience;
  title: string;
  theme: "games-ai" | "savings" | "give-back" | "reinvest";
  /** Free guides show every step; member guides show a teaser then lock. */
  free: boolean;
  summary: string;
  /** How many steps guests can preview on gated guides (default 2). */
  previewCount: number;
  steps: KidsGuideStep[];
  parentTip: string;
};

export const KIDS_GUIDES: KidsGuide[] = [
  // —— Kids (4–12) free ——
  {
    id: "kids-piggy-first-goal",
    audience: "kids",
    title: "Piggy Bank: Set Your First Savings Goal",
    theme: "savings",
    free: true,
    previewCount: 2,
    summary:
      "Name something you want, pick a simple price, and count how many little jobs it might take — with a parent helping.",
    parentTip: "Keep goals small and celebrate progress, not perfection.",
    steps: [
      {
        title: "Pick one goal",
        body: "Choose something fun and reachable — a game, book, craft kit, or outing. Write the name on a sticky note.",
      },
      {
        title: "Write the price",
        body: "Ask a parent for a real price (or a close estimate). Put that number next to your goal.",
      },
      {
        title: "Choose your hustle rate",
        body: "Decide what one job might earn (example: $5 for a craft, $10 for a walk with a parent nearby).",
      },
      {
        title: "Count the jobs",
        body: "Use the Piggy Bank tab to see how many tasks you need. Mark a star each time you finish one!",
      },
      {
        title: "Celebrate kindly",
        body: "When you hit halfway, do a kindness win too — share a craft or help someone for free.",
      },
    ],
  },
  {
    id: "kids-kindness-share",
    audience: "kids",
    title: "Give Back: Share a Skill for Free",
    theme: "give-back",
    free: true,
    previewCount: 2,
    summary:
      "Earning is great — kindness is part of the GYSH team too. Practice giving back with a tiny free gift of help.",
    parentTip: "Supervise introductions; keep it with people you already know.",
    steps: [
      {
        title: "Name your kindness skill",
        body: "What can you share? Reading together, drawing a card, watering a plant, or teaching a simple game.",
      },
      {
        title: "Pick one person to help",
        body: "Choose a sibling, neighbor your parents know, or a grandparent — never strangers alone.",
      },
      {
        title: "Offer a free mini-session",
        body: "Say: “Can I help for 15 minutes for free?” Keep it short and cheerful.",
      },
      {
        title: "Notice how it feels",
        body: "Talk with a parent about how helping made you feel. That’s Glow Getter energy!",
      },
      {
        title: "Balance earn + give",
        body: "Try one paid task and one kindness task in the same week when you can.",
      },
    ],
  },
  // —— Kids (4–12) member ——
  {
    id: "kids-games-ai",
    audience: "kids",
    title: "Make a Tiny Game with AI (Parent Nearby)",
    theme: "games-ai",
    free: false,
    previewCount: 2,
    summary:
      "Invent a mini maze, quiz, or story-game using kid-friendly AI tools — always with a parent. Preview the first steps free; join the Kids Corner GYSH Team for the full guide.",
    parentTip: "Stay in the room. Never share real names, school, address, or photos with tools or strangers.",
    steps: [
      {
        title: "Brainstorm one tiny idea",
        body: "Pick something small: a 3-question quiz, a maze on paper, or a choose-your-adventure with 3 choices.",
      },
      {
        title: "Ask a parent to open a safe tool",
        body: "Only use parent-approved apps. Parent types prompts; you dream up characters and rules.",
      },
      {
        title: "Create a character and a goal",
        body: "Name a hero (made-up!), decide what they want, and draw or print one picture together.",
      },
      {
        title: "Build 3 levels or questions",
        body: "Keep it short. Easy → medium → fun surprise. Write them on paper or in a shared doc.",
      },
      {
        title: "Playtest with family",
        body: "Try it at family game night or a school fair project. Track any tips in the Piggy Bank.",
      },
      {
        title: "Give back with your game",
        body: "Offer one free play session for a friend or sibling — kindness counts as a team win.",
      },
    ],
  },
  {
    id: "kids-reinvest-jar",
    audience: "kids",
    title: "Grow Your Hustle: Put Some Earnings Back",
    theme: "reinvest",
    free: false,
    previewCount: 2,
    summary:
      "When you earn coins, spend a little on fun, save a little, and put a little back into your hustle supplies — kid-friendly “investing.”",
    parentTip: "Use three jars or envelopes: Spend, Save, Hustle. Keep amounts tiny and visual.",
    steps: [
      {
        title: "Make three jars",
        body: "Label them Spend, Save, and Hustle. Decorate them — crafts count!",
      },
      {
        title: "Split your next earnings",
        body: "Example: of $9, put $3 in each jar (or whatever split your parent likes).",
      },
      {
        title: "Plan one Hustle jar buy",
        body: "Use Hustle jar money for stickers, clay, lemonade cups, or printer paper — things that help you earn again.",
      },
      {
        title: "Keep Save jar for your big goal",
        body: "Don’t dip into Save for toys. That’s your Piggy Bank mission.",
      },
      {
        title: "Tell your story",
        body: "Share with family how putting money back helped your next craft or walk day.",
      },
    ],
  },
  {
    id: "kids-craft-hustle",
    audience: "kids",
    title: "Craft Hustle Starter + Kevina Kindness Extra",
    theme: "give-back",
    free: false,
    previewCount: 2,
    summary:
      "Make a tiny sticker or charm set, price it with a parent, and add a Glow Getter kindness extra inspired by Kevina Starr.",
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

  // —— Junior (13–17) free ——
  {
    id: "junior-savings-ceo",
    audience: "junior",
    title: "Savings Goals for Future CEOs",
    theme: "savings",
    free: true,
    previewCount: 2,
    summary:
      "Treat savings like a mini business plan: clear target, timeline, and weekly job count — tracked in the Piggy Bank.",
    parentTip: "Agree on realistic rates and school-first schedules together.",
    steps: [
      {
        title: "Define the goal + deadline",
        body: "Example: $150 tablet fund in 3 months. Write it where you’ll see it.",
      },
      {
        title: "Break into weekly targets",
        body: "Divide total by weeks. That’s your minimum earn-per-week (adjust for exams).",
      },
      {
        title: "Pick 1–2 junior jobs",
        body: "Choose from Junior Jobs that fit your time — don’t overcommit.",
      },
      {
        title: "Log every payout",
        body: "Use the Piggy Bank math after each job. Screenshot or note progress weekly.",
      },
      {
        title: "Review with a guardian",
        body: "Monthly check-in: what’s working, what to pause, what to reinvest.",
      },
    ],
  },
  {
    id: "junior-give-back-teach",
    audience: "junior",
    title: "Give Back: Teach What You Know",
    theme: "give-back",
    free: true,
    previewCount: 2,
    summary:
      "Turn a skill into community value — one free teaching session builds reputation and kindness muscle.",
    parentTip: "Host in public or supervised spaces; no private home visits with strangers.",
    steps: [
      {
        title: "Choose a teachable skill",
        body: "Reading help, basic tech, study flashcards, or a simple creative workshop.",
      },
      {
        title: "Offer one free 20-minute session",
        body: "Family, trusted neighbor, or school club — parent helps with intros.",
      },
      {
        title: "Prepare a tiny outline",
        body: "3 bullets: warm-up, practice, win. Keep it structured like a CEO workshop.",
      },
      {
        title: "Ask for feedback",
        body: "What helped? What was confusing? Use notes to improve paid sessions later.",
      },
      {
        title: "Schedule a balance week",
        body: "Aim for at least one paid job and one give-back action per month when you can.",
      },
    ],
  },
  // —— Junior (13–17) member ——
  {
    id: "junior-games-ai",
    audience: "junior",
    title: "Build a Game with AI — From Idea to Prototype",
    theme: "games-ai",
    free: false,
    previewCount: 2,
    summary:
      "Use AI for concepts, art ideas, and dialogue, then build a small web/mobile prototype with guardian-approved tools. Full guide for Junior Team members.",
    parentTip: "Approve accounts and publishing. No personal info or payment cards in AI chats.",
    steps: [
      {
        title: "Scope one tiny game",
        body: "One-level platformer, quiz, or visual novel scene. Write a one-paragraph pitch.",
      },
      {
        title: "Generate concepts safely",
        body: "With guardian OK, use AI for mood boards, sprite ideas, and dialogue drafts — then edit heavily.",
      },
      {
        title: "Prototype with a coding helper",
        body: "Tools like Cursor or Antigravity can help — keep the build tiny and document what you changed.",
      },
      {
        title: "Playtest + iterate",
        body: "Friends or classmates try it. Fix one bug and one fun upgrade.",
      },
      {
        title: "Share with approval",
        body: "School project, portfolio piece, or free itch.io demo only after a guardian says yes.",
      },
      {
        title: "Reinvest learning time",
        body: "Put a slice of any tips toward a course, asset pack, or better tools — CEO reinvestment.",
      },
    ],
  },
  {
    id: "junior-reinvest-ceo",
    audience: "junior",
    title: "Reinvest Like a CEO (Age-Appropriate)",
    theme: "reinvest",
    free: false,
    previewCount: 2,
    summary:
      "Don’t spend every dollar you earn. Split income into save, enjoy, and grow-the-business buckets.",
    parentTip: "Agree on percentages together (example 50/30/20) and review monthly.",
    steps: [
      {
        title: "Open three buckets",
        body: "Save (goal), Enjoy (fun), Grow (business). Bank account sub-pots or a simple spreadsheet work.",
      },
      {
        title: "Pick a split rule",
        body: "Start simple: 50% Save / 30% Enjoy / 20% Grow — adjust with a guardian.",
      },
      {
        title: "List Grow spends that earn again",
        body: "Supplies, printing, a domain for a school project, ads for a fair booth, or a skill workshop.",
      },
      {
        title: "Cap Enjoy so Save stays sacred",
        body: "Enjoy is allowed — guilt-free — because Save and Grow are already funded.",
      },
      {
        title: "Track ROI in plain words",
        body: "“I spent $12 on stickers and earned $40” is great CEO journaling.",
      },
    ],
  },
  {
    id: "junior-content-create",
    audience: "junior",
    title: "Content Creation Starter (Parent-Friendly)",
    theme: "games-ai",
    free: false,
    previewCount: 2,
    summary:
      "Practice wholesome content for school, portfolio, or family brand — privacy-first, no stranger DMs.",
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
