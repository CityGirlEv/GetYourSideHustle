/**
 * Make a Tiny Game with AI (Parent Nearby) (`kids-games-ai`, Guide #087).
 * Kids Corner learning/building: the kid creates; the adult handles grown-up stuff.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const KIDS_GAMES_AI_REALITY_CHECK = {
  title: "THE KID CREATES; THE ADULT HANDLES THE GROWN-UP STUFF",
  body: [
    "Kids can create the idea, characters, questions, choices, rules, artwork concepts, testing, and improvements.",
    "",
    "Parent/guardian handles:",
    "- Account creation when required",
    "- Age/eligibility checks",
    "- Privacy settings",
    "- Personal information",
    "- Purchases/subscriptions",
    "- Public publishing",
    "- Messages from strangers",
    "- Downloads/uploads requiring review",
    "- Payments or sales",
    "- Platform terms",
    "",
    "Never enter a child’s full name, home address, school, phone number, private photos, passwords, exact location, or other sensitive personal information into an AI tool.",
    "",
    "Tagline: Imagine It. Build It. Play It. Improve It.",
  ].join("\n"),
};

export const KIDS_GAMES_AI_NOTES_WORKSHEET = `MY TINY GAME
Game Name: ________
Game Type: ________
Goal: ________
Player: ________
Win Condition: ________

MY 3 RULES
1. ________
2. ________
3. ________

AI HELP I USED
Prompt: ________
What AI Suggested: ________
What I Chose: ________
What I Changed Myself: ________

BUILD CHECKLIST
☐ Start
☐ Instructions
☐ Main Game
☐ Win/End
☐ Restart if needed

BUG LIST
Problem | Where | Fix | Retested
__________
__________

PLAYTEST
Tester: Family/Friend
Fun: ________
Confusing: ________
Broken: ________
Best Suggestion: ________

FINAL
Version: ________
What I Learned: ________
What I Am Proud Of: ________
My Next Game Idea: ________

PARENT CHECK
☐ Tool approved
☐ Age/account rules checked
☐ No private information
☐ Assets/content approved
☐ Sharing setting approved
☐ Public publishing handled by adult
☐ Money/payment handled by adult

GYSH KIDS CORNER PRO TIP
DON'T TRY TO MAKE THE BIGGEST GAME.
Make the SMALLEST game you can actually FINISH.
IDEA → PLAN → BUILD → PLAY → FIX → SHARE SAFELY.
Every tiny finished game teaches you something you can use in the next one.

KIDS CORNER CHALLENGE
THE 3-DAY TINY GAME CHALLENGE
DAY 1: Pick game · Draw it · Write goal + 3 rules
DAY 2: Build first playable version · Test 3 times · Make bug list
DAY 3: Have family/friend test · Fix best problems · Parent completes safety check · Save Tiny Game v1.0
BONUS: Make Game #2 using one thing you learned from Game #1.`;

export const KIDS_GAMES_AI_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Invent and build a tiny maze, quiz, choice-based story, or other simple game with kid-friendly AI help. A parent or guardian stays involved with account setup, privacy, publishing, purchases, messages, and any money-related activity. Tagline: Imagine It. Build It. Play It. Improve It. Category: Kids Corner / AI / Games / Creative Technology. Best for Kids with a parent/guardian nearby. Beginner · $0–Low startup · A few days · Home / Online with adult supervision · Learning first / optional parent-managed earnings · Elite Membership · Member Guide.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Parent/guardian nearby · Simple game idea · Computer/tablet · Parent-approved AI/game-building tools · Internet if required · Paper/notes for planning · 1–3 people to test the game.",
  },
  {
    id: "choose",
    label: "Choose ONE tiny game",
    detail:
      "Maze · Quiz · Choose-Your-Path Story · Matching Game · Catch/Collect Game · Simple Puzzle · Other Parent-Approved Mini Game. Finish line: “My game has one goal, simple rules, and can be played in about 1–5 minutes.”",
  },
  {
    id: "parent",
    label: "Parent nearby throughout",
    detail:
      "Parent/guardian checks CURRENT platform age and AI rules before creating accounts or publishing. Kid never creates seller accounts, negotiates with strangers, or shares payment handles.",
  },
];

export const KIDS_GAMES_AI_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Scratch", url: "https://scratch.mit.edu/", note: "Parent-approved visual builder when terms allow" },
  { label: "ChatGPT", url: "https://chatgpt.com/", note: "Parent account only — brainstorming with oversight" },
  { label: "Google Gemini", url: "https://gemini.google.com/", note: "Parent account only — alternative AI help" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Planning notes" },
  { label: "Google Slides", url: "https://slides.google.com/", note: "Simple clickable story games" },
  { label: "Canva", url: "https://www.canva.com/", note: "Original visual assets where appropriate" },
];

export const KIDS_GAMES_AI_SUPPLIES = {
  starterKitTotal:
    "About $0–15 for paper, pencil, and a planning sheet. Avoid unnecessary paid tools for the first game.",
  items: [
    { id: "computer", name: "Computer / tablet", qty: "1", estCost: "$0", notes: "Essential — use a family device" },
    { id: "internet", name: "Internet if needed", qty: "1", estCost: "$0", notes: "If the chosen tool needs it" },
    { id: "paper", name: "Paper / notebook", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "pencil", name: "Pencil", qty: "1", estCost: "$0–2", notes: "Essential" },
    { id: "ai", name: "Parent-approved AI tool", qty: "1", estCost: "$0", notes: "Parent account" },
    { id: "builder", name: "Parent-approved game-building tool", qty: "1", estCost: "$0", notes: "Check current terms" },
    { id: "plan", name: "Simple game-planning sheet", qty: "1", estCost: "$0–3", notes: "Essential" },
    { id: "assets", name: "Original / approved images and sounds", qty: "as needed", estCost: "$0", notes: "No unlicensed copies" },
    { id: "headphones", name: "Headphones", qty: "1", estCost: "$0–10", notes: "Optional", optional: true },
    { id: "tester", name: "Tester checklist", qty: "1", estCost: "$0", notes: "Print or copy from Notes" },
  ],
};

export const KIDS_GAMES_AI_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "kga_ai",
    name: "Parent-approved AI assistant",
    freePlanAvailable: true,
    costNote: "Brainstorming and instructions with adult oversight — parent account",
    url: "https://chatgpt.com/",
  },
  {
    id: "kga_gemini",
    name: "Google Gemini (parent account)",
    freePlanAvailable: true,
    costNote: "Alternative AI help — parent checks current age rules",
    url: "https://gemini.google.com/",
    optional: true,
  },
  {
    id: "kga_scratch",
    name: "Scratch or beginner visual coding",
    freePlanAvailable: true,
    costNote: "Parent-approved when current terms permit the intended use",
    url: "https://scratch.mit.edu/",
  },
  {
    id: "kga_slides",
    name: "Slides / presentation software",
    freePlanAvailable: true,
    costNote: "Simple clickable story games",
    url: "https://slides.google.com/",
    optional: true,
  },
  {
    id: "kga_canva",
    name: "Canva or drawing tools",
    freePlanAvailable: true,
    costNote: "Original visual assets where appropriate",
    url: "https://www.canva.com/",
    optional: true,
  },
  {
    id: "kga_browser",
    name: "Parent-approved browser-based game creator",
    freePlanAvailable: true,
    costNote: "Parent checks CURRENT age and publishing rules",
    optional: true,
  },
  {
    id: "kga_docs",
    name: "Google Docs / Notes",
    freePlanAvailable: true,
    costNote: "Planning, bug list, and playtest notes",
    url: "https://docs.google.com/",
  },
  {
    id: "kga_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "Paper Plan + Parent-Approved AI Help + Simple Visual Game Builder + Family Tester",
  },
];

export const KIDS_GAMES_AI_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "PRIMARY GOAL: LEARN + CREATE",
    "A first tiny game can be completely FREE to make and FREE to share privately with family/friends.",
    "",
    "FREE PROJECT",
    "$0 — Build a game for practice, family fun, school-approved learning, or Kids Corner creative experience.",
    "",
    "OPTIONAL PARENT-MANAGED EARNING IDEAS",
    "Only where the platform permits it and the parent/guardian owns/manages the account, permissions, communication, and payments.",
    "",
    "Custom Family Quiz Game: $5 – $15",
    "Simple Birthday/Party Quiz: $10 – $25",
    "Personalized Tiny Story Game: $10 – $25",
    "Simple Educational Quiz: $10 – $30",
    "Tiny Game Bundle: $15 – $40+",
    "",
    "These are starter examples, NOT guarantees.",
    "",
    "Parents must check applicable platform age rules, payment rules, taxes/business requirements, intellectual-property rights, and local rules before selling anything.",
    "",
    "Kid's job: CREATE + LEARN.",
    "Adult's job: APPROVE + PUBLISH + COMMUNICATE + HANDLE MONEY.",
  ].join("\n"),
  raiseTip:
    "Learning first. Any sale/payment is parent-managed. Examples only — not income guarantees. Do not encourage children to privately negotiate with strangers or create seller accounts.",
  items: [
    { id: "free", label: "Free project", price: "$0", notes: "Practice, family fun, or school-approved learning" },
    { id: "family-quiz", label: "Custom family quiz game", price: "$5 – $15", notes: "Parent-managed if offered" },
    { id: "party-quiz", label: "Simple birthday / party quiz", price: "$10 – $25" },
    { id: "story", label: "Personalized tiny story game", price: "$10 – $25" },
    { id: "edu-quiz", label: "Simple educational quiz", price: "$10 – $30" },
    { id: "bundle", label: "Tiny game bundle", price: "$15 – $40+" },
  ],
};

/** Exactly 11 authored core steps. No GYSH marketing sequence. */
export const KIDS_GAMES_AI_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Pick One Tiny Game Idea",
    desc: [
      "Finish:",
      "“My game is a ________.”",
      "“The player tries to ________.”",
      "“The player wins when ________.”",
      "",
      "Keep the first game SMALL. Do not start with an open-world game, giant multiplayer game, or 50-level adventure.",
    ].join("\n"),
  },
  {
    title: "Draw the Game on Paper First",
    desc: [
      "Create: START → PLAYER DOES SOMETHING → GAME RESPONDS → WIN/TRY AGAIN → END",
      "",
      "For a maze: draw start, path, obstacles, finish.",
      "For a quiz: write 3–5 questions.",
      "For a story: create 2–3 choices.",
      "For a catch game: choose player, object, score goal.",
    ].join("\n"),
  },
  {
    title: "Ask AI to Help with the Plan",
    desc: [
      "With parent nearby, use a safe prompt such as:",
      "",
      "“I am making a tiny beginner game. It is a [TYPE] game about [SAFE TOPIC]. Help me create a simple goal, 3 rules, and a short list of things I need to build. Keep it kid-friendly and easy.”",
      "",
      "AI can help brainstorm, but the child chooses what goes into the game.",
      "",
      "Do not provide private information.",
    ].join("\n"),
  },
  {
    title: "Create Your Characters, Questions or Story",
    desc: [
      "Depending on game:",
      "Maze: player + obstacles + finish",
      "Quiz: 3–10 original questions/answers",
      "Story: character + problem + choices + endings",
      "Catch Game: player + object + score",
      "",
      "Use original ideas or content the family has permission to use.",
      "Do not copy copyrighted characters, logos, music, artwork, or game assets just because AI can describe them.",
    ].join("\n"),
  },
  {
    title: "Build the First Playable Version",
    desc: [
      "Use the chosen parent-approved builder.",
      "",
      "Only build the core:",
      "- Start Screen",
      "- Game/Question/Scene",
      "- Player Action",
      "- Game Response",
      "- Win/End Screen",
      "",
      "Goal: MAKE IT PLAYABLE BEFORE MAKING IT FANCY.",
    ].join("\n"),
  },
  {
    title: "Add Simple Game Rules",
    desc: [
      "Examples:",
      "- Reach the finish.",
      "- Get 4 of 5 questions right.",
      "- Choose a path and reach an ending.",
      "- Collect 10 objects.",
      "- Avoid 3 obstacles.",
      "",
      "Add instructions players can understand without the creator standing beside them.",
    ].join("\n"),
  },
  {
    title: "Use AI to Help Solve One Problem at a Time",
    desc: [
      "When stuck, tell AI:",
      "- What tool you are using",
      "- What you wanted to happen",
      "- What actually happened",
      "- Any error message, without private information",
      "",
      "Example: “My character should move when I press the right arrow, but it stays still. Give me three beginner things to check.”",
      "",
      "Do NOT ask AI to rebuild the entire game every time something breaks. Learn from each fix.",
    ].join("\n"),
  },
  {
    title: "Test the Game Yourself",
    desc: [
      "Play from beginning to end at least 3 times.",
      "",
      "Check:",
      "☐ Start works",
      "☐ Instructions make sense",
      "☐ Buttons/controls work",
      "☐ Questions have correct answers",
      "☐ Choices go to correct place",
      "☐ Player can win/finish",
      "☐ Restart works if included",
      "☐ No private information appears",
      "☐ No unapproved copyrighted material",
      "",
      "Create a BUG LIST: Problem | Where | What Happened | Fixed?",
    ].join("\n"),
  },
  {
    title: "Ask Family/Friends to Playtest",
    desc: [
      "With parent approval, ask 1–3 trusted people to test.",
      "",
      "Do NOT explain how to play first unless necessary.",
      "",
      "Ask: What was fun? What was confusing? Did you know what to do? Was anything broken? Was it too easy/hard? What ONE thing would you improve?",
      "",
      "Do not collect unnecessary personal information from testers.",
    ].join("\n"),
  },
  {
    title: "Improve & Create Your Final Version",
    desc: [
      "Choose only the best improvements.",
      "",
      "Possible upgrades: clearer instructions · better button placement · one extra level/question · sound with permission · original artwork · score · timer · better ending · restart button.",
      "",
      "Then play the complete game again.",
      "",
      "VERSION: Tiny Game v1.0",
      "",
      "A finished tiny game is better than an unfinished giant game.",
    ].join("\n"),
  },
  {
    title: "Share Safely & Plan Game #2",
    desc: [
      "Parent/guardian decides whether the game stays: Private · Family-only · School/classroom-approved · Kids Corner demonstration · Publicly shared where platform and age rules permit.",
      "",
      "Parent handles public account, publishing settings, messages, links, and money.",
      "",
      "Celebrate what was learned: idea · planning · AI prompting · building · testing · debugging · feedback · finishing.",
      "",
      "Then write: “My next tiny game will improve ________.”",
    ].join("\n"),
  },
];

export function kidsGamesAiToolsDisclaimer(): string {
  return "Beginner stack: Paper Plan + Parent-Approved AI Help + Simple Visual Game Builder + Family Tester. Platform age requirements and AI policies can change — parent/guardian must check CURRENT rules before creating accounts or publishing. Kid does not create the AI or seller account.";
}

/** Kid-appropriate project math. Any sale is parent-managed. */
export function computeKidsGamesAiProject(input: {
  paidProjects?: number;
  avgProjectPrice?: number;
  supplyToolCost?: number;
  otherApprovedCost?: number;
  savePercent?: number;
  enjoyPercent?: number;
  growPercent?: number;
}): {
  grossProjectMoney: number;
  projectCosts: number;
  amountRemaining: number;
  saveAmount: number;
  enjoyAmount: number;
  growAmount: number;
  percentTotal: number;
} {
  const paid = Math.max(0, Number(input.paidProjects) || 0);
  const price = Math.max(0, Number(input.avgProjectPrice) || 0);
  const supply = Math.max(0, Number(input.supplyToolCost) || 0);
  const other = Math.max(0, Number(input.otherApprovedCost) || 0);
  const savePercent = Math.max(0, Number(input.savePercent) || 0);
  const enjoyPercent = Math.max(0, Number(input.enjoyPercent) || 0);
  const growPercent = Math.max(0, Number(input.growPercent) || 0);
  const grossProjectMoney = paid * price;
  const projectCosts = supply + other;
  const amountRemaining = grossProjectMoney - projectCosts;
  const percentTotal = savePercent + enjoyPercent + growPercent;
  const splitBase = amountRemaining > 0 && percentTotal === 100 ? amountRemaining : 0;
  return {
    grossProjectMoney,
    projectCosts,
    amountRemaining,
    saveAmount: splitBase * (savePercent / 100),
    enjoyAmount: splitBase * (enjoyPercent / 100),
    growAmount: splitBase * (growPercent / 100),
    percentTotal,
  };
}
