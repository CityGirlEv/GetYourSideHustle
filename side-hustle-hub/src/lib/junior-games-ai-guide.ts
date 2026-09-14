/**
 * Build a Game with AI — From Idea to Prototype (`junior-games-ai`, Guide #040).
 * Teen/Junior skill-building: idea → design → build → test → prototype → improve.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const JUNIOR_GAMES_AI_REALITY_CHECK = {
  title: "BUILD SMALL FIRST",
  body: [
    "The goal is NOT to build Fortnite, Roblox, or a giant multiplayer game on the first try.",
    "",
    "Your first prototype should prove ONE fun idea.",
    "",
    "Good first prototypes:",
    "- Click/tap game",
    "- Simple maze",
    "- Quiz/trivia game",
    "- Memory match",
    "- Catch/avoid game",
    "- Basic platformer",
    "- Choice-based story",
    "- Puzzle",
    "- Simple card game",
    "- One-level adventure",
    "",
    "Use AI as a creative/building assistant, but understand what you are publishing.",
    "",
    "For teen builders:",
    "- Use guardian-approved accounts/tools",
    "- Follow platform age requirements",
    "- Do not share private information",
    "- Do not publish payment information",
    "- Do not add public chat, location sharing, stranger messaging, gambling, or risky monetization without appropriate adult oversight",
    "- Do not copy copyrighted characters, games, logos, music, art, or code you do not have rights to use",
    "",
    "Tagline: Dream It. Prompt It. Build It. Play It.",
  ].join("\n"),
};

export const JUNIOR_GAMES_AI_NOTES_WORKSHEET = `MY GAME

Game Name: ________
One-Sentence Idea: ________
Player: ________
Goal: ________
Main Action: ________
Obstacle: ________
Win Condition: ________
Lose Condition: ________
Target Device: ________
Build Tool: ________
Guardian Approved: ☐

CORE LOOP:
__________

AI PROMPTS THAT WORKED:
1. ________
2. ________
3. ________

ASSETS:
Asset | Source | Permission/License | Complete

__________
__________

BUILD CHECKLIST:
☐ Project created
☐ Player works
☐ Core action works
☐ Score/state works
☐ Win/lose works
☐ Restart works
☐ Art added
☐ Dialogue added
☐ Sound added
☐ Desktop tested
☐ Mobile tested if applicable

BUGS:
Bug: ________
Cause/Notes: ________
Fix: ________
Retested: ☐

TESTER FEEDBACK:
Fun: ________
Confusing: ________
Broken: ________
Requested: ________

VERSION 2:
Must Fix: ________
Nice to Have: ________
Not Yet: ________

OPTIONAL PROJECT RESULTS:
Revenue: $____
Expenses: $____
Profit: $____
Hours: ____
Effective Profit/Hour: $____

GYSH PRO TIP
AI CAN HELP YOU BUILD FASTER — BUT “ADD MORE FEATURES” IS NOT ALWAYS THE RIGHT ANSWER.
A tiny game that WORKS and is FUN is a better prototype than a giant game full of unfinished screens.
Build:
ONE PLAYER
+ ONE MAIN ACTION
+ ONE GOAL
+ ONE OBSTACLE
+ ONE WIN/LOSE LOOP
Then test it.

ELITE CHALLENGE
BUILD A ONE-LEVEL PLAYABLE GAME PROTOTYPE.
Your prototype must have:
1. Original game concept
2. One-page mini design
3. Main character/player
4. Core gameplay loop
5. Win condition
6. Lose condition or challenge
7. Score/timer/progress feedback
8. Original/allowed visual assets
9. Test checklist
10. Bug tracker
11. Feedback from 2–3 trusted testers
12. Version 2 improvement list
13. Short demo package
BONUS: Create a simple “How I Built It With AI” project page showing the prompts/workflow without exposing private data, keys, or restricted material.`;

export const JUNIOR_GAMES_AI_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Use AI to help brainstorm a game concept, characters, art direction, dialogue, rules, levels, and testing ideas, then use guardian-approved tools to build a small playable web or mobile prototype. Tagline: Dream It. Prompt It. Build It. Play It. Category: Junior / AI / Game Development. Best for Teens / Junior Side Hustle Team Members. Beginner to intermediate · Very low to low startup · Project-based · Online / home · Skill building / prototype projects · Elite Membership. Displayed timing: 1 - 2 weeks. Displayed earnings: Member guide.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Computer/tablet appropriate to chosen tool · Internet · Guardian-approved AI/build tools · Basic typing · Willingness to test and revise · Simple game idea · Folder for project files.",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail:
      "ChatGPT · Canva or approved art tool · Browser-based coding/game tool · Notes/Docs · Basic understanding of variables, score, rules, and win/lose conditions.",
  },
  {
    id: "before",
    label: "Before building, define",
    detail:
      "Game Name · Player Goal · Main Action · Win Condition · Lose Condition · Target Player · Platform (Web / Mobile Prototype) · Guardian-Approved Tools. No advanced coding experience is required for a beginner prototype.",
  },
  {
    id: "safety",
    label: "Guardian, privacy & IP",
    detail:
      "Use guardian-approved accounts/tools. Follow platform age requirements. Do not share private information or publish payment information. Do not add public chat, location sharing, stranger messaging, gambling, or risky monetization without adult oversight. Do not copy copyrighted characters, games, logos, music, art, or code you do not have rights to use.",
  },
];

export const JUNIOR_GAMES_AI_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "ChatGPT", url: "https://chatgpt.com/", note: "Ideas, design review, dialogue, debug help" },
  { label: "Scratch", url: "https://scratch.mit.edu/", note: "Beginner no-code / block build" },
  { label: "GDevelop", url: "https://gdevelop.io/", note: "No-code / low-code game builder" },
  { label: "Construct", url: "https://www.construct.net/", note: "No-code / low-code game builder" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "One-page mini design + bug tracker" },
  { label: "Canva", url: "https://www.canva.com/", note: "Original UI / button / mockup art" },
];

export const JUNIOR_GAMES_AI_SUPPLIES = {
  starterKitTotal: "About $0–25 using a computer you already have plus notes and backups",
  items: [
    { id: "computer", name: "Computer / tablet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Internet", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "ai", name: "Guardian-approved AI account/tool", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "builder", name: "Game-building / coding tool", qty: "1", estCost: "$0", notes: "Essential — pick ONE" },
    { id: "notes", name: "Notes / project brief", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "folder", name: "Folder / cloud storage", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "canva", name: "Canva", qty: "1", estCost: "$0", notes: "Optional art", optional: true },
    { id: "editor", name: "Simple image editor", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "headphones", name: "Headphones", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "mic", name: "Microphone for approved original audio", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "tablet", name: "Drawing tablet", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "phone", name: "Phone / tablet for testing", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "mouse", name: "External mouse", qty: "1", estCost: "$0–15", notes: "Optional", optional: true },
    { id: "art", name: "Original or properly licensed art", qty: "as needed", estCost: "$0", notes: "Document source and license" },
    { id: "audio", name: "Original or properly licensed music/audio", qty: "as needed", estCost: "$0", notes: "Document source and license" },
    { id: "fonts", name: "Fonts/assets permitted for intended use", qty: "as needed", estCost: "$0", notes: "Document source and license" },
  ],
};

export const JUNIOR_GAMES_AI_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "jga_chatgpt",
    name: "ChatGPT",
    freePlanAvailable: true,
    costNote: "Brainstorm, design review, dialogue, and debug prompts",
    url: "https://chatgpt.com/",
  },
  {
    id: "jga_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "One-page mini design, asset list, and bug tracker",
    url: "https://docs.google.com/",
  },
  {
    id: "jga_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Prompts that worked and tester notes",
  },
  {
    id: "jga_scratch",
    name: "Scratch",
    freePlanAvailable: true,
    costNote: "Beginner no-code / block build — pick ONE builder",
    url: "https://scratch.mit.edu/",
    optional: true,
  },
  {
    id: "jga_gdevelop",
    name: "GDevelop",
    freePlanAvailable: true,
    costNote: "No-code / low-code option — pick ONE builder",
    url: "https://gdevelop.io/",
    optional: true,
  },
  {
    id: "jga_construct",
    name: "Construct",
    freePlanAvailable: true,
    costNote: "No-code / low-code option — pick ONE builder",
    url: "https://www.construct.net/",
    optional: true,
  },
  {
    id: "jga_html",
    name: "Browser HTML/CSS/JavaScript",
    freePlanAvailable: true,
    costNote: "Basic-code option — pick ONE builder",
    optional: true,
  },
  {
    id: "jga_canva",
    name: "Canva",
    freePlanAvailable: true,
    costNote: "Original UI, buttons, and mockups",
    url: "https://www.canva.com/",
    optional: true,
  },
  {
    id: "jga_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "ChatGPT + One Game Builder + Original/Allowed Assets + Browser Testing",
  },
];

export const JUNIOR_GAMES_AI_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "This guide is primarily a BUILDING/LEARNING guide. Displayed earnings: Member guide.",
    "",
    "If a teen later creates simple prototype work for an approved client/project, possible examples may include a simple game concept document, character/dialogue package, one-screen interactive prototype, basic quiz/trivia game, or small web-game prototype.",
    "",
    "Any paid work for minors should use guardian-approved payment, platform, contract, communication, and client arrangements.",
    "",
    "Never promise a production-ready commercial game when delivering a prototype. Examples only — not income guarantees.",
  ].join("\n"),
  raiseTip:
    "A prototype is an early playable demonstration, not automatically a finished commercial game. Guardian-approved paid work only. Examples only — not income guarantees.",
  items: [
    { id: "concept", label: "Simple game concept document", price: "Guardian-approved quote", notes: "Optional paid project" },
    { id: "dialogue", label: "Character / dialogue package", price: "Guardian-approved quote", notes: "Optional paid project" },
    { id: "onescreen", label: "One-screen interactive prototype", price: "Guardian-approved quote", notes: "Optional paid project" },
    { id: "quiz", label: "Basic quiz / trivia game", price: "Guardian-approved quote", notes: "Optional paid project" },
    { id: "web", label: "Small web-game prototype", price: "Guardian-approved quote", notes: "Optional paid project" },
  ],
};

/** Exactly 11 authored core steps. No GYSH marketing stages. Never ✓. */
export const JUNIOR_GAMES_AI_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Create the One-Sentence Game Idea",
    desc: [
      "Use: PLAYER + ACTION + GOAL + OBSTACLE",
      "",
      "Example:",
      "“The player moves a little robot through a maze, collecting batteries while avoiding puddles before time runs out.”",
      "",
      "Write:",
      "Player: ________",
      "Main Action: ________",
      "Goal: ________",
      "Obstacle: ________",
      "",
      "Then ask AI:",
      "“Give me 5 small game variations based on this concept. Each must be possible as a beginner one-level prototype.”",
      "",
      "Choose ONE.",
    ].join("\n"),
  },
  {
    title: "Write the Mini Game Design Document",
    desc: [
      "Keep it to one page.",
      "",
      "GAME NAME: ________",
      "PLAYER: ________",
      "GOAL: ________",
      "MAIN ACTION: ________",
      "CONTROLS: ________",
      "WIN CONDITION: ________",
      "LOSE CONDITION: ________",
      "SCORE: ________",
      "LEVELS IN PROTOTYPE: ________",
      "ART STYLE: ________",
      "SOUND STYLE: ________",
      "TARGET DEVICE: ________",
      "",
      "Ask AI:",
      "“Review this beginner game design. Identify anything too complicated for a first prototype and suggest a simpler version.”",
    ].join("\n"),
  },
  {
    title: "Use AI to Plan Characters, Art & Dialogue",
    desc: [
      "Ask AI for IDEAS before generating lots of assets.",
      "",
      "Create:",
      "- Main character description",
      "- 1–3 supporting characters/enemies",
      "- Background idea",
      "- UI/button style",
      "- Color/mood direction",
      "- Short dialogue if needed",
      "",
      "Dialogue prompt example:",
      "“Write 5 short lines for a friendly robot guide in a teen-friendly puzzle game. Each line must be under 12 words.”",
      "",
      "ART RULE:",
      "Create original characters/worlds.",
      "Do not ask AI to copy a living artist's work or duplicate protected game/movie characters.",
      "",
      "Create an ASSET LIST:",
      "Asset | Purpose | Source | License/Permission | Final File",
    ].join("\n"),
  },
  {
    title: "Choose the Build Tool & Create the Project",
    desc: [
      "With guardian approval, choose ONE tool that matches the game.",
      "",
      "Decide:",
      "NO-CODE/LOW-CODE",
      "or",
      "BASIC CODE",
      "",
      "Create:",
      "- Project",
      "- Main screen/scene",
      "- Player object",
      "- Basic background",
      "- Start button if needed",
      "",
      "Save immediately.",
      "",
      "Use simple file/version names:",
      "game-v01",
      "game-v02",
      "game-v03",
      "",
      "Do not make major changes without saving a working version.",
    ].join("\n"),
  },
  {
    title: "Build the Core Gameplay Loop",
    desc: [
      "The CORE LOOP is what the player repeats.",
      "",
      "Example:",
      "MOVE → COLLECT → AVOID → SCORE → WIN/LOSE → RESTART",
      "",
      "Build ONLY enough to make this loop work.",
      "",
      "Test:",
      "☐ Player can act",
      "☐ Game responds",
      "☐ Score/state changes",
      "☐ Player can win or lose",
      "☐ Game can restart",
      "",
      "If AI generates code:",
      "- Add small pieces at a time",
      "- Ask what the code does",
      "- Test after each change",
      "- Keep a working backup",
      "- Do not paste unknown code that requests passwords, tokens, downloads, system commands, or unnecessary access",
    ].join("\n"),
  },
  {
    title: "Add Rules, Score & Feedback",
    desc: [
      "Add simple game rules.",
      "",
      "Possible:",
      "- Score",
      "- Lives",
      "- Timer",
      "- Collectibles",
      "- Correct/incorrect answer",
      "- Level complete",
      "- Game over",
      "",
      "Player feedback:",
      "- Score changes",
      "- Sound",
      "- Animation",
      "- Message",
      "- Visual effect",
      "",
      "Ask AI:",
      "“Give me 5 simple ways to make it obvious when the player succeeds or makes a mistake.”",
      "",
      "Keep feedback clear, not overwhelming.",
    ].join("\n"),
  },
  {
    title: "Add Art, Dialogue & Sound Without Breaking the Game",
    desc: [
      "Replace placeholders gradually.",
      "",
      "Add:",
      "- Character art",
      "- Background",
      "- Buttons/UI",
      "- Dialogue",
      "- Approved sound/music",
      "",
      "After EACH asset group: TEST AGAIN.",
      "",
      "Check:",
      "- Text readable?",
      "- Buttons visible?",
      "- Game still loads?",
      "- Files too large?",
      "- Art consistent?",
      "- Dialogue short enough?",
      "- Audio volume reasonable?",
      "",
      "Keep proof of permission/license for third-party assets.",
    ].join("\n"),
  },
  {
    title: "Test on the Target Device",
    desc: [
      "Create a TEST CHECKLIST.",
      "",
      "Test:",
      "☐ Start",
      "☐ Controls",
      "☐ Score",
      "☐ Win",
      "☐ Lose",
      "☐ Restart",
      "☐ Sound",
      "☐ Text",
      "☐ Buttons",
      "☐ Screen size",
      "☐ Loading",
      "☐ Mobile touch if applicable",
      "",
      "Bug tracker:",
      "Bug | How to Reproduce | Expected | Actual | Fixed?",
      "",
      "Ask 2–3 trusted testers:",
      "“What confused you?”",
      "“What was fun?”",
      "“Where did you get stuck?”",
      "“Would you play again?”",
      "",
      "Do not explain how to play while they test unless necessary. Watch where the game itself is unclear.",
    ].join("\n"),
  },
  {
    title: "Use AI to Debug & Improve",
    desc: [
      "When something breaks, give AI SPECIFIC information.",
      "",
      "Weak:",
      "“My game doesn't work.”",
      "",
      "Better:",
      "“I am building a browser game. When I click Start, the score resets correctly but the player does not move. Here is the relevant code/error message: [SAFE RELEVANT CONTENT]. Explain the likely problem, then give the smallest change to test first.”",
      "",
      "Debug loop:",
      "REPRODUCE → DESCRIBE → ISOLATE → ASK → CHANGE ONE THING → TEST → SAVE WORKING VERSION",
      "",
      "Never expose passwords, API keys, private tokens, or sensitive data in debugging prompts.",
    ].join("\n"),
  },
  {
    title: "Package the Prototype & Create a Demo",
    desc: [
      "A prototype should clearly show the idea.",
      "",
      "Prepare:",
      "- Game title",
      "- One-sentence description",
      "- How to play",
      "- Controls",
      "- Prototype link/file",
      "- 3–5 screenshots",
      "- 15–30 second demo video if desired",
      "- Known limitations",
      "- Version number",
      "",
      "Label it clearly: PROTOTYPE / DEMO",
      "",
      "If publishing online:",
      "- Get guardian approval",
      "- Review platform age/publishing rules",
      "- Remove private information",
      "- Check asset rights",
      "- Disable unnecessary public/social features",
      "- Review monetization/payment settings",
    ].join("\n"),
  },
  {
    title: "Review, Improve & Plan Version 2",
    desc: [
      "Ask:",
      "What was fun?",
      "What was confusing?",
      "What broke?",
      "What did testers request?",
      "What took too long?",
      "What should NOT be added?",
      "",
      "Sort ideas:",
      "",
      "MUST FIX",
      "__________",
      "",
      "NICE TO HAVE",
      "__________",
      "",
      "NOT YET",
      "__________",
      "",
      "Choose only 1–3 improvements for Version 2.",
      "",
      "GAME IDEA → MINI DESIGN → CORE LOOP → TEST → DEBUG → DEMO → FEEDBACK → IMPROVE",
      "",
      "Do not keep adding features before the core game is fun and stable.",
    ].join("\n"),
  },
];

export function juniorGamesAiToolsDisclaimer(): string {
  return "Beginner stack: ChatGPT + One Game Builder + Original/Allowed Assets + Browser Testing. Do not require every tool — pick ONE primary build environment with guardian approval. Features, age requirements, pricing, AI policies, and publishing rules change. Verify current rules before account creation or publication. Never paste passwords, API keys, or private information into prompts.";
}

/** Optional guardian-approved paid prototype math (one project). */
export function computeJuniorGamesAiProfit(input: {
  projectFee: number;
  addOnRevenue?: number;
  softwareToolCost?: number;
  assetCost?: number;
  advertisingPortfolioCost?: number;
  otherExpenses?: number;
  planningHours?: number;
  buildHours?: number;
  testingRevisionHours?: number;
}): {
  totalRevenue: number;
  totalExpenses: number;
  estimatedProjectProfit: number;
  totalHours: number;
  effectiveProfitPerHour: number | null;
} {
  const fee = Math.max(0, Number(input.projectFee) || 0);
  const addOns = Math.max(0, Number(input.addOnRevenue) || 0);
  const totalRevenue = fee + addOns;
  const totalExpenses =
    Math.max(0, Number(input.softwareToolCost) || 0) +
    Math.max(0, Number(input.assetCost) || 0) +
    Math.max(0, Number(input.advertisingPortfolioCost) || 0) +
    Math.max(0, Number(input.otherExpenses) || 0);
  const estimatedProjectProfit = totalRevenue - totalExpenses;
  const totalHours =
    Math.max(0, Number(input.planningHours) || 0) +
    Math.max(0, Number(input.buildHours) || 0) +
    Math.max(0, Number(input.testingRevisionHours) || 0);
  return {
    totalRevenue,
    totalExpenses,
    estimatedProjectProfit,
    totalHours,
    effectiveProfitPerHour: totalHours > 0 ? estimatedProjectProfit / totalHours : null,
  };
}
