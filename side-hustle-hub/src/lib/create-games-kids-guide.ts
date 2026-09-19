/**
 * Create Games with AI (Kids) (`create-games-kids`, Guide #054).
 * Elite Membership. 2 - 8 hrs/week. School fair / family tips · or just for fun.
 * Plain data only — no imports from guide-tools.
 */

export const CREATE_GAMES_KIDS_REALITY_CHECK = {
  title: "AI IS A HELPER, NOT THE GAME MAKER",
  body: [
    "The child should make the important creative choices. AI can suggest names, rules, clues, dialogue, or level ideas, but the child and parent must review, rewrite, test, and decide what belongs in the game.",
    "",
    "Parent/guardian responsibilities:",
    "- Choose age-appropriate tools and review their current terms",
    "- Create or supervise accounts where required",
    "- Keep the child's real name, school, location, voice, face, and contact information private",
    "- Review every prompt and output",
    "- Approve every person who playtests",
    "- Control all public sharing, sales, messages, and payments",
    "",
    "OpenAI's current terms require users to be at least 13, or the local minimum age, and users under 18 need parent/guardian permission. A younger child should not open or operate an account independently.",
    "",
    "Never ask AI to copy a favorite game, character, logo, song, or living artist's style. Create an original theme and use original or properly licensed assets.",
    "",
    "Tagline: Imagine It. Build It. Let Someone Play It.",
  ].join("\n"),
};

export const CREATE_GAMES_KIDS_NOTES_WORKSHEET = `MY GAME PLAN

Game Name: ________
Player: ________
Goal: ________
Main Action: ________
Win/Finish Rule: ________
Tool: ________
Parent/Guardian: ________
Sharing Method: ________

ORIGINALITY & PRIVACY

My Original Ideas: ________
AI Ideas I Changed: ________
Assets and Permissions: ________
No Private Information Included: ☐ Confirmed
Parent Reviewed Prompts/Outputs: ☐ Yes

PLAYTEST

Tester: ________
Could Start Without Help: ☐ Yes ☐ No
Could Finish: ☐ Yes ☐ No
Biggest Confusion: ________
Favorite Part: ________

Top Three Fixes:
1. ________
2. ________
3. ________

RESULTS

Players: ____
Revenue/Tips: $____
Expenses: $____
Estimated Profit: $____

What I Learned: ________

GYSH PRO TIP

ONE FINISHED LEVEL BEATS TEN GIANT IDEAS.

The goal is to learn the full creative loop: choose, build, test, fix, and share safely. A tiny game that another person can understand and finish is a real accomplishment.

SMALL SCOPE + ORIGINAL CHOICES + FAMILY PLAYTESTING + PARENT-SAFE SHARING = A FINISHED GAME

BEGINNER CHALLENGE

Build a five-minute game in one week.

1. Write the one-sentence goal
2. Draw the paper version
3. Ask AI for five parent-approved idea options
4. Choose and rewrite one option
5. Build one playable level
6. Use original art and words
7. Test with two family members
8. Fix the three biggest problems
9. Save the final version privately

Public posting and selling are not required.`;

export const CREATE_GAMES_KIDS_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Invent simple game ideas with a parent nearby — use kid-friendly, parent-approved AI tools for stories, characters, rules, and level ideas, then build and test a small original game. Tagline: Imagine It. Build It. Let Someone Play It. Category: AI / Creative. Best for Kids creating with a parent or guardian nearby. Beginner · $0 startup · Flexible · Online / Home / School-Friendly · Creative Project / Optional Parent-Managed Fair Sales or Tips · 2 - 8 hrs/week · Elite Membership. Displayed pricing: School fair / family tips · or just for fun.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Parent/guardian permission and active supervision · One simple game idea · Computer, tablet, or paper prototype supplies · Parent-approved game-building tool · Safe place to save files · Patience to test and revise.",
  },
  {
    id: "before",
    label: "Before beginning, decide",
    detail:
      "Is the game just for fun, school, a family event, or a parent-managed sale? · Who is the player? · Will it be a paper game, slide game, Scratch-style project, quiz, maze, or simple click game? · Which adult manages the account and sharing? · Who may playtest? · Which assets are original or licensed for use?",
  },
  {
    id: "safety",
    label: "Safety rules",
    detail:
      "No real names, school names, live locations, private photos, passwords, or contact details in AI prompts or the game · No public chat or stranger direct messages · No downloads, plug-ins, or purchases without the parent · No copying commercial games or characters · No public posting or selling without parent approval.",
  },
];

export const CREATE_GAMES_KIDS_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Scratch", url: "https://scratch.mit.edu/", note: "Parent-approved visual builder when terms allow" },
  { label: "Google Slides", url: "https://slides.google.com/", note: "Choose-your-path games" },
  { label: "Canva", url: "https://www.canva.com/", note: "Original drawings and layouts" },
  { label: "OpenAI Terms of Use", url: "https://openai.com/policies/terms-of-use/", note: "Age and account rules" },
  { label: "FTC children's privacy", url: "https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy", note: "Privacy basics" },
  { label: "U.S. Copyright Office AI", url: "https://www.copyright.gov/ai/", note: "AI and copyright information" },
];

export const CREATE_GAMES_KIDS_SUPPLIES = {
  starterKitTotal:
    "$0 using household supplies and free parent-approved tools. Do not buy software, subscriptions, asset packs, or equipment before finishing one small game.",
  items: [
    { id: "computer", name: "Computer or tablet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "charger", name: "Charger", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "paper", name: "Paper and pencil", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "cards", name: "Index cards or sticky notes", qty: "1 pack", estCost: "$0–3", notes: "Essential" },
    { id: "folder", name: "Parent-approved file folder", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "checklist", name: "Playtest checklist", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "dice", name: "Dice", qty: "1", estCost: "$0–2", notes: "Paper prototype optional", optional: true },
    { id: "tokens", name: "Tokens or coins", qty: "as needed", estCost: "$0", notes: "Paper prototype optional", optional: true },
    { id: "markers", name: "Markers/crayons", qty: "1 set", estCost: "$0", notes: "Paper prototype optional", optional: true },
    { id: "headphones", name: "Headphones", qty: "1", estCost: "$0", notes: "Digital optional", optional: true },
  ],
};

export const CREATE_GAMES_KIDS_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "cgk_scratch", name: "Scratch or ScratchJr", freePlanAvailable: true, costNote: "If appropriate under current terms and parent supervision", url: "https://scratch.mit.edu/" },
  { id: "cgk_slides", name: "Google Slides or PowerPoint", freePlanAvailable: true, costNote: "Choose-your-path games", url: "https://slides.google.com/" },
  { id: "cgk_twine", name: "Twine", freePlanAvailable: true, costNote: "Simple text adventures — if age-appropriate and parent-approved", url: "https://twinery.org/", optional: true },
  { id: "cgk_canva", name: "Canva or parent-approved design tool", freePlanAvailable: true, costNote: "Original drawings and layouts", url: "https://www.canva.com/" },
  { id: "cgk_ai", name: "Parent-operated or parent-approved AI", freePlanAvailable: true, costNote: "Brainstorming rules, questions, character traits — parent account", url: "https://chatgpt.com/" },
  { id: "cgk_paper", name: "Paper cards and hand-drawn board", freePlanAvailable: true, planLabelApplicable: false, costNote: "Prototype before coding" },
  { id: "cgk_stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Paper Storyboard + Scratch/ScratchJr or Slides + Original Drawings + Parent Review" },
];

export const CREATE_GAMES_KIDS_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: School fair / family tips · or just for fun (examples, not guarantees).",
    "",
    "Family / School Practice Game: $0",
    "Make a small game to learn, share privately, or use in class with teacher/parent approval.",
    "",
    "School or Community Fair Play Card: $1 – $3",
    "Optional low-cost ticket or printed access card handled by the parent and event organizer.",
    "",
    "Family Tip Jar: Optional",
    "Tips are never guaranteed and should be handled by the parent.",
    "",
    "Custom Family Quiz or Party Game: $5 – $20",
    "Only for a trusted family connection, with the parent managing the request, scope, delivery, and payment.",
    "",
    "Agree first: Game Type + Number of Questions/Levels + Deadline + One Revision + Parent Contact + Price/Tip Method",
    "",
    "Do not promise app-store publishing, royalties, downloads, followers, or income. A fun finished game and new skills are successful outcomes.",
    "",
    "OPTIONAL SCHOOL FAIR EXAMPLE: 15 play cards × $2 = $30 · Family tips = $5 · Total revenue = $35 · Printing and supplies = $12 · Estimated profit = $23.",
  ].join("\n"),
  raiseTip:
    "Learning and finishing first. Any sale or tip is parent-managed. Examples only — not income guarantees.",
  items: [
    { id: "free", label: "Family / school practice game", price: "$0", notes: "Learning first" },
    { id: "fair-card", label: "School or community fair play card", price: "$1 – $3", notes: "Parent-managed" },
    { id: "tips", label: "Family tip jar", price: "Optional", notes: "Never guaranteed" },
    { id: "custom", label: "Custom family quiz or party game", price: "$5 – $20", notes: "Trusted family only" },
  ],
};

/** Exactly 11 authored core steps. Step 10 includes parent-managed marketing channels. */
export const CREATE_GAMES_KIDS_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Pick One Tiny Game Idea",
    desc: [
      "Finish this sentence:",
      "",
      "“The player tries to __________ by __________.”",
      "",
      "Examples:",
      "- Guide a bee to flowers without touching obstacles",
      "- Answer five space questions to repair a rocket",
      "- Choose the right path through a kindness story",
      "- Match animals to their habitats",
      "",
      "Choose one action, one goal, and one short play session. Do not start with an open-world game, multiplayer game, or giant story.",
    ].join("\n"),
  },
  {
    title: "Set the Parent Safety & Tool Rules",
    desc: [
      "Complete together:",
      "",
      "Parent/Guardian: ________",
      "Approved Tool: ________",
      "Account Owner: ________",
      "Saving Location: ________",
      "Approved Playtesters: ________",
      "Sharing: ☐ Offline ☐ Private Link ☐ School/Event ☐ Parent-Managed Public",
      "Purchases Allowed: ☐ No ☐ Parent Only",
      "Messages/Comments: ☐ Off ☐ Parent-Managed",
      "",
      "The parent checks the tool's current age and account rules before use.",
    ].join("\n"),
  },
  {
    title: "Write the Rules Before Building",
    desc: [
      "Use one page.",
      "",
      "Game Name: ________",
      "Player Goal: ________",
      "How the Player Moves/Chooses: ________",
      "How the Player Wins: ________",
      "How the Player Tries Again: ________",
      "Number of Levels/Questions: ________",
      "One Rule the Player Must Remember: ________",
      "",
      "Ask someone to read the rules. If they cannot explain the game back, simplify them.",
    ].join("\n"),
  },
  {
    title: "Make a Paper Prototype",
    desc: [
      "Before coding, draw the screens, cards, path, or choices.",
      "",
      "Include: start screen · player instruction · main challenge · win/finish screen · try-again option.",
      "",
      "Move a token or finger through the game. Fix confusing rules now, when changes cost nothing.",
    ].join("\n"),
  },
  {
    title: "Use AI for a Short Idea List",
    desc: [
      "The parent enters a privacy-safe prompt.",
      "",
      "Example:",
      "“Give us five original obstacle ideas for a simple children's bee-and-flower maze. Do not use existing game characters or brands. Keep each idea to one sentence.”",
      "",
      "The child chooses, combines, rewrites, or rejects the suggestions.",
      "",
      "Record: what the child invented · what AI suggested · what the child changed.",
      "",
      "Do not paste AI output straight into the finished game without review.",
    ].join("\n"),
  },
  {
    title: "Build One Playable Level",
    desc: [
      "Create only the smallest complete version.",
      "",
      "It needs: a start · clear instructions · one player action · a response or score · a finish · a restart.",
      "",
      "Save versions as: GameName_v1 · GameName_v2 · GameName_FINAL",
      "",
      "Test after every small change.",
    ].join("\n"),
  },
  {
    title: "Add Original Art, Words & Sound",
    desc: [
      "Make the game feel like the child's work.",
      "",
      "Use: original drawings · shapes and colors · child-written dialogue · original character names · approved public-domain or licensed assets.",
      "",
      "Keep an Asset List: Asset | Creator/Source | License/Permission | Where Used",
      "",
      "Do not use a favorite cartoon, game logo, celebrity voice, copyrighted song, or other person's art without permission.",
    ].join("\n"),
  },
  {
    title: "Run a Family Playtest",
    desc: [
      "Give the player the game without explaining it first.",
      "",
      "Watch for: where they stop · which instruction they miss · whether controls work · whether the game is too easy or too hard · whether the finish is clear.",
      "",
      "Ask only after they play:",
      "1. What did you think the goal was?",
      "2. Where were you confused?",
      "3. What was fun?",
      "4. What should change?",
      "",
      "The parent approves every playtester and sharing method.",
    ].join("\n"),
  },
  {
    title: "Fix the Three Biggest Problems",
    desc: [
      "Create a short bug list: Problem | How to Reproduce It | Fix | Retest Result",
      "",
      "Fix in this order:",
      "1. Game cannot start or finish",
      "2. Instructions are unclear",
      "3. Controls, score, or choices do not work",
      "4. Spelling, art, and polish",
      "",
      "Do not keep adding new features while important problems remain.",
    ].join("\n"),
  },
  {
    title: "Choose Safe Sharing & Marketing Channels",
    desc: [
      "Choose exactly 2 or 3 parent-approved channels:",
      "☐ Family game night",
      "☐ School class or club with permission",
      "☐ Community or school fair",
      "☐ Private link sent by the parent",
      "☐ Family newsletter",
      "☐ Parent-managed portfolio",
      "",
      "Make one simple game card:",
      "",
      "GAME: __________",
      "PLAYER GOAL: __________",
      "PLAY TIME: __________",
      "AGES: __________",
      "HOW TO PLAY: __________",
      "PARENT CONTACT (if needed): __________",
      "",
      "Never put the child's private contact or location on the card.",
    ].join("\n"),
  },
  {
    title: "Share, Record Results & Plan Version Two",
    desc: [
      "Use only the approved channels from Step 10.",
      "",
      "Track: Date | Players | Finished? | Biggest Confusion | Favorite Part | Tips/Sales | Parent Notes",
      "",
      "If money is allowed at an approved event, the parent handles the cash, digital payment, refunds, and records.",
      "",
      "After ten play sessions, decide:",
      "☐ Keep the game as finished",
      "☐ Fix one more bug",
      "☐ Add one new level",
      "☐ Start a different tiny game",
      "",
      "IDEA → PAPER TEST → SMALL BUILD → PLAYTEST → FIX → SAFE SHARE",
    ].join("\n"),
  },
];

export function createGamesKidsToolsDisclaimer(): string {
  return "Beginner stack: Paper Storyboard + Scratch/ScratchJr or Slides + Original Drawings + Parent Review. AI is a helper, not the game maker. Parent checks current tool age terms before account creation or sharing. Never enter private information in prompts.";
}

export function computeCreateGamesKidsProfit(input: {
  fairPlayCardsSold?: number;
  pricePerPlayCard?: number;
  parentApprovedFamilyTips?: number;
  customFamilyGames?: number;
  avgPricePerCustomGame?: number;
  printingEventFees?: number;
  supplies?: number;
  toolAssetCosts?: number;
  otherExpenses?: number;
}): {
  playCardRevenue: number;
  customGameRevenue: number;
  totalRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const playCardRevenue = n(input.fairPlayCardsSold) * n(input.pricePerPlayCard);
  const customGameRevenue = n(input.customFamilyGames) * n(input.avgPricePerCustomGame);
  const totalRevenue =
    playCardRevenue + customGameRevenue + n(input.parentApprovedFamilyTips);
  const totalExpenses =
    n(input.printingEventFees) +
    n(input.supplies) +
    n(input.toolAssetCosts) +
    n(input.otherExpenses);
  return {
    playCardRevenue,
    customGameRevenue,
    totalRevenue,
    totalExpenses,
    estimatedProfit: totalRevenue - totalExpenses,
  };
}
