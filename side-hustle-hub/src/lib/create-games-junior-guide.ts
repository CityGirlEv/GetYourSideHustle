/**
 * Create Games with AI (Teens) (`create-games-junior`, Guide #055).
 * Elite Membership. 5 - 15 hrs/week. Tips · school credit · itch.io / commissions ($0 – $200+).
 * Plain data only — no imports from guide-tools.
 */

export const CREATE_GAMES_JUNIOR_REALITY_CHECK = {
  title: "PUBLISHING CREATES REAL RESPONSIBILITIES",
  body: [
    "A playable school project and a commercially published game are not the same thing.",
    "",
    "Before public distribution or paid work, a teen and guardian must check:",
    "- The platform's minimum-age and publisher rules",
    "- Who can legally accept the platform agreement",
    "- Who owns and controls the account",
    "- Rights to every sprite, font, sound, code library, logo, and AI-assisted asset",
    "- Privacy, chat, comments, and direct messages",
    "- Price, refunds, payment processing, tax information, and recordkeeping",
    "- Client scope, revision limits, and payment terms for commissions",
    "",
    "itch.io's current terms state that users must be 13 or older and publishers must be over 18 or have legal parent/guardian consent and be able to enter the agreement. Its payout system also requires a tax interview before earnings can be collected. Rules can change — recheck current terms before publishing or selling.",
    "",
    "AI output is not automatically accurate, original, bug-free, secure, or ready for commercial use. The teen must make the game's creative and technical decisions, test the output, and keep a clear asset/license record.",
    "",
    "Tagline: Scope the Game. Build the Loop. Ship a Playable Demo.",
  ].join("\n"),
};

export const CREATE_GAMES_JUNIOR_NOTES_WORKSHEET = `MY GAME BRIEF

Title: ________
Player: ________
Core Loop: ________
Platform: ________
Engine: ________
Must-Have Features: ________
Out of Scope: ________
Guardian: ________
Publishing Path: ________

BUILD CHECKLIST

Prototype Works: ☐ Yes
Start-to-Finish Build: ☐ Yes
Assets Logged/Licensed: ☐ Yes
AI Change Log Complete: ☐ Yes
3–5 Playtests Complete: ☐ Yes
Blockers Fixed: ☐ Yes
Export Tested: ☐ Yes
Guardian Approved Release: ☐ Yes

PROJECT RESULTS

Build Version: ________
Players/Downloads: ____
Gross Revenue: $____
Fees/Refunds: $____
Other Expenses: $____
Estimated Profit: $____
Hours: ____
Effective Profit Per Hour: $____
Known Issues: ________
Best Feedback: ________
Next Decision: ________

GYSH PRO TIP

SHIP A SMALL GAME YOU UNDERSTAND.

A short, stable, original demo with a clear asset log is a stronger portfolio piece than a huge unfinished project assembled from code and art the teen cannot explain.

SMALL SCOPE + TESTED CODE + LICENSED ASSETS + HONEST RELEASE NOTES = A CREDIBLE GAME PROJECT

BEGINNER CHALLENGE

Ship one free, guardian-approved prototype in 14 days.

1. Write the one-page brief
2. Pick one engine
3. Build the core loop with placeholders
4. Use AI for one bounded task and log the changes
5. Replace placeholders with original/licensed assets
6. Run three playtests
7. Fix every blocker
8. Test the exported build
9. Create screenshots and a short description
10. Share privately or publish free with guardian approval`;

export const CREATE_GAMES_JUNIOR_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this hustle is",
    detail:
      "Use AI for game concepts, sprite and dialogue ideas, testing prompts, and simple web or mobile prototypes — then publish school projects or itch.io demos only with guardian approval. Tagline: Scope the Game. Build the Loop. Ship a Playable Demo. Category: AI / Creative. Best for Teens / Juniors building a first original digital game with guardian approval. Beginner to Intermediate · $0 – $50 startup · Flexible / Project-Based · Online / Home · Tips / School Credit / Digital Sales / Commissions · 5 - 15 hrs/week · Elite Membership. Displayed pricing: Tips · school credit · itch.io / commissions ($0 – $200+).",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Guardian approval and involvement · Computer capable of running the selected tool · One small game concept · Basic logic, writing, art, or coding interest · Secure file storage and backups · Time for repeated testing · Original or properly licensed assets.",
  },
  {
    id: "before",
    label: "Before starting, decide",
    detail:
      "School project, free portfolio demo, tip-supported release, or commission? · Browser, desktop, or simple mobile prototype? · No-code, visual scripting, or beginner code? · Who owns/manages the publishing and payment accounts? · Which platform and license rules apply? · What content rating and audience fit the game?",
  },
  {
    id: "safety",
    label: "For minors",
    detail:
      "Guardian reviews platform terms, contracts, commissions, public pages, payments, and tax steps · No private client calls or stranger meetups alone · No personal address, school, schedule, legal name, or private contact details in the game or public profile · No copied commercial characters, code, music, art, or trademarks · No AI-generated impersonations or unapproved use of a real person's image or voice.",
  },
];

export const CREATE_GAMES_JUNIOR_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "Scratch", url: "https://scratch.mit.edu/", note: "Learning and school projects" },
  { label: "GDevelop", url: "https://gdevelop.io/", note: "No-code / low-code builder" },
  { label: "Godot", url: "https://godotengine.org/", note: "Beginner engine option" },
  { label: "Construct", url: "https://www.construct.net/", note: "Browser-based builder" },
  { label: "Twine", url: "https://twinery.org/", note: "Interactive fiction" },
  { label: "ChatGPT", url: "https://chatgpt.com/", note: "Guardian-approved AI help" },
  { label: "OpenAI Terms of Use", url: "https://openai.com/policies/terms-of-use/", note: "Age and account rules" },
  { label: "itch.io Terms", url: "https://itch.io/docs/legal/terms", note: "Publisher age rules" },
  { label: "itch.io payments", url: "https://itch.io/docs/creators/payments", note: "Payout and tax interview" },
  { label: "U.S. Copyright Office AI", url: "https://www.copyright.gov/ai/", note: "AI and copyright information" },
];

export const CREATE_GAMES_JUNIOR_SUPPLIES = {
  starterKitTotal:
    "About $0–25 using a computer you already have plus notes and backups. Do not buy a game engine, large asset pack, expensive course, or developer account before completing and testing one small free prototype.",
  items: [
    { id: "computer", name: "Computer", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "charger", name: "Charger", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "headphones", name: "Headphones", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "notes", name: "Notes/storyboard", qty: "1", estCost: "$0–5", notes: "Essential" },
    { id: "folder", name: "Secure project folder", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "backup", name: "Backup drive or approved cloud storage", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "bug-tracker", name: "Bug tracker", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "asset-log", name: "Asset/license log", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "mouse", name: "Mouse or game controller", qty: "1", estCost: "$0–15", notes: "Optional", optional: true },
    { id: "tablet", name: "Drawing tablet already owned", qty: "1", estCost: "$0", notes: "Optional", optional: true },
    { id: "mic", name: "Basic microphone for original audio", qty: "1", estCost: "$0", notes: "Optional", optional: true },
  ],
};

export const CREATE_GAMES_JUNIOR_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  { id: "cgj_godot", name: "Godot", freePlanAvailable: true, costNote: "Pick ONE beginner engine", url: "https://godotengine.org/", optional: true },
  { id: "cgj_gdevelop", name: "GDevelop", freePlanAvailable: true, costNote: "Pick ONE beginner engine", url: "https://gdevelop.io/", optional: true },
  { id: "cgj_construct", name: "Construct", freePlanAvailable: true, costNote: "Pick ONE beginner engine", url: "https://www.construct.net/", optional: true },
  { id: "cgj_scratch", name: "Scratch", freePlanAvailable: true, costNote: "Learning and school projects", url: "https://scratch.mit.edu/", optional: true },
  { id: "cgj_twine", name: "Twine", freePlanAvailable: true, costNote: "Interactive fiction", url: "https://twinery.org/", optional: true },
  { id: "cgj_docs", name: "Google Docs", freePlanAvailable: true, costNote: "One-page brief and bug tracker", url: "https://docs.google.com/" },
  { id: "cgj_ai", name: "Guardian-approved AI", freePlanAvailable: true, costNote: "Bounded help — log every change", url: "https://chatgpt.com/" },
  { id: "cgj_canva", name: "Canva or image editor", freePlanAvailable: true, costNote: "Original UI and thumbnails", url: "https://www.canva.com/", optional: true },
  { id: "cgj_stack", name: "Beginner Tool Stack", freePlanAvailable: false, planLabelApplicable: false, costNote: "Godot/GDevelop/Twine + Original Assets + Bug Sheet + Local Backup + Guardian-Managed Publishing" },
];

export const CREATE_GAMES_JUNIOR_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "DISPLAYED EARNING POTENTIAL: Tips · school credit · itch.io / commissions ($0 – $200+) — examples, not guarantees.",
    "",
    "School / Portfolio Demo: $0",
    "A small finished game used for learning, school credit, or a private portfolio.",
    "",
    "Pay-What-You-Want or Tip-Supported Demo: $0+",
    "Guardian-managed platform release; earnings are uncertain and fees/tax requirements may apply.",
    "",
    "Simple Custom Quiz / Interactive Story: $25 – $75",
    "One short experience using client-supplied facts, a defined number of screens/questions, and one revision round.",
    "",
    "Small Custom Web Game Prototype: $75 – $200+",
    "One limited game loop, basic original/licensed assets, defined platform/export, testing, and one revision round.",
    "",
    "POSSIBLE ADD-ONS: Extra level or question set · Original sprite set · Additional revision · Alternate export or screen size · Rush deadline when school and family priorities allow",
    "",
    "Agree before starting: Game Brief + Platform + Deliverables + Asset Responsibilities + Revision Limit + Testing Standard + Deadline + Price + Guardian Contact + Payment Method",
    "",
    "Do not promise downloads, ratings, app-store acceptance, revenue, or a completely bug-free game.",
    "",
    "EXAMPLE: 20 tips/downloads × $3 = $60 · 1 small commission × $75 = $75 · Total gross revenue = $135 · Total fees and expenses = $35 · Estimated profit = $100 · 20 hours = $5.00/hour effective profit.",
  ].join("\n"),
  raiseTip:
    "Ship a small game you understand. Guardian-managed publishing and payments only. Examples only — not income guarantees.",
  items: [
    { id: "demo", label: "School / portfolio demo", price: "$0", notes: "Learning first" },
    { id: "pwyw", label: "Pay-what-you-want or tip-supported demo", price: "$0+", notes: "Guardian-managed" },
    { id: "quiz", label: "Simple custom quiz / interactive story", price: "$25 – $75", notes: "One revision round" },
    { id: "prototype", label: "Small custom web game prototype", price: "$75 – $200+", notes: "Defined scope" },
    { id: "level", label: "Extra level or question set", price: "Guardian-approved quote", notes: "Add-on example" },
  ],
};

/** Exactly 11 authored core steps. Step 9 combines marketing channels and materials. */
export const CREATE_GAMES_JUNIOR_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Write a One-Page Game Brief",
    desc: [
      "Define:",
      "",
      "Working Title: ________",
      "Player: ________",
      "Core Goal: ________",
      "Main Action: ________",
      "Win/Finish Condition: ________",
      "Lose/Try-Again Condition: ________",
      "Target Platform: ________",
      "Expected Play Time: ________",
      "Out of Scope: ________",
      "",
      "One playable loop is enough for version one.",
    ].join("\n"),
  },
  {
    title: "Choose the Engine & Publishing Path",
    desc: [
      "Compare two tools using: runs on the available computer · appropriate difficulty · export target · current age/account terms · license and commercial-use terms · offline/private project option · cost.",
      "",
      "Chosen Tool: ________",
      "Why: ________",
      "Publishing Path: ☐ School ☐ Private Portfolio ☐ Free Demo ☐ Paid/Tip Release ☐ Commission",
      "Guardian Approval: ☐ Yes",
      "",
      "Do not pay for publishing until a working build exists.",
    ].join("\n"),
  },
  {
    title: "Design the Core Loop & Milestones",
    desc: [
      "Write the repeatable loop:",
      "",
      "PLAYER ACTION → GAME RESPONSE → PROGRESS/FEEDBACK → NEXT CHOICE",
      "",
      "Create four milestones:",
      "1. Grey-box prototype",
      "2. Playable start-to-finish build",
      "3. Art/audio pass",
      "4. Tested release candidate",
      "",
      "Put each task in a small checklist. Separate “must-have” from “nice-to-have.”",
    ].join("\n"),
  },
  {
    title: "Prototype with Placeholders",
    desc: [
      "Build the main interaction using boxes, labels, and temporary sounds.",
      "",
      "The prototype needs: start screen · instructions · core control/action · score, progress, or consequence · finish/failure state · restart.",
      "",
      "Save and run the project after each small change. Do not polish art before proving the loop works.",
    ].join("\n"),
  },
  {
    title: "Use AI with a Change Log",
    desc: [
      "Use AI for bounded help.",
      "",
      "Good requests: three original level variations · five dialogue alternatives · explanation of one error message · test cases for a score function · pseudocode before code.",
      "",
      "For every AI-assisted addition, record:",
      "Prompt Purpose | Output Used | Teen's Changes | Test Result | Asset/License Concern",
      "",
      "Never run unfamiliar code blindly. Understand, test, and back up before changing the project.",
    ].join("\n"),
  },
  {
    title: "Create & License the Asset Set",
    desc: [
      "Make a consistent set: main character/object · background or playfield · buttons/UI · sound effects/music · font · thumbnail/cover.",
      "",
      "Maintain: Asset | Creator | Source URL | License | Commercial Use Allowed? | Attribution Required? | File Location",
      "",
      "Avoid copied franchises, logos, celebrity likenesses, cloned voices, and “in the style of” prompts aimed at living artists.",
    ].join("\n"),
  },
  {
    title: "Playtest & Write Reproducible Bugs",
    desc: [
      "Recruit 3–5 guardian-approved testers.",
      "",
      "Do not explain the controls unless asked. Observe where players hesitate.",
      "",
      "Bug format:",
      "Title: ________",
      "Build Version: ________",
      "Steps to Reproduce: ________",
      "Expected Result: ________",
      "Actual Result: ________",
      "Screenshot/Video: ________",
      "Severity: ☐ Blocker ☐ Major ☐ Minor",
      "",
      "Fix blockers before adding features.",
    ].join("\n"),
  },
  {
    title: "Make the Release Candidate",
    desc: [
      "Before export:",
      "- Remove unused files and secrets",
      "- Check links and controls",
      "- Test start, finish, restart, pause, and sound",
      "- Test the actual exported build, not only the editor",
      "- Scan files/dependencies as appropriate",
      "- Confirm asset licenses and attribution",
      "- Proofread store/page text",
      "- Create a version number and backup",
      "",
      "Release Candidate: ________",
      "Known Limitations: ________",
      "",
      "Do not claim “bug-free.” List material known issues honestly.",
    ].join("\n"),
  },
  {
    title: "Choose Marketing Channels & Make Materials",
    desc: [
      "Choose exactly 2 or 3 guardian-approved channels:",
      "☐ School/class showcase",
      "☐ Private portfolio",
      "☐ Guardian-managed itch.io page",
      "☐ Game-jam page under approved terms",
      "☐ Family/friend network",
      "☐ Parent-managed social post",
      "",
      "Create: one-sentence hook · 3–5 accurate screenshots · 15–30 second gameplay clip · controls/instructions · platform requirements · credit/attribution list · guardian-managed contact method.",
      "",
      "No misleading screenshots, fake reviews, or promised earnings.",
    ].join("\n"),
  },
  {
    title: "Publish or Deliver with Guardian Approval",
    desc: [
      "For a public release, the guardian verifies: publisher eligibility and account ownership · game page accuracy · content warnings/age suitability · price or pay-what-you-want setting · platform fees, refunds, payouts, and tax interview · privacy and message settings · file scan and final download test.",
      "",
      "For a commission, deliver: agreed build · readme/controls · source files only if included in the agreement · asset/attribution list · known limitations · invoice/payment request handled by the guardian.",
      "",
      "Save the final confirmation and agreement.",
    ].join("\n"),
  },
  {
    title: "Track Results & Decide the Next Version",
    desc: [
      "Record: Date | Build | Players/Downloads | Revenue | Fees | Refunds | Expenses | Hours | Bugs | Feedback",
      "",
      "After two weeks or an agreed client review:",
      "☐ Patch blockers",
      "☐ Make one small improvement",
      "☐ Archive the project",
      "☐ Create a portfolio case study",
      "☐ Scope a new game",
      "",
      "Do not chase download counts by exposing private information or responding alone to strangers.",
      "",
      "BRIEF → PROTOTYPE → TEST → LICENSE CHECK → RELEASE → LEARN",
    ].join("\n"),
  },
];

export function createGamesJuniorToolsDisclaimer(): string {
  return "Beginner stack: Godot/GDevelop/Twine + Original Assets + Bug Sheet + Local Backup + Guardian-Managed Publishing. Pick ONE primary engine with guardian approval. Verify current itch.io publisher-age, payout, and tax rules before public release. Never paste passwords, API keys, or private information into prompts.";
}

export function computeCreateGamesJuniorProfit(input: {
  paidDownloadsTips?: number;
  avgGrossAmount?: number;
  commissionProjects?: number;
  avgCommissionPrice?: number;
  platformRevenueShareFees?: number;
  paymentProcessingFees?: number;
  refundsChargebacks?: number;
  toolAssetCosts?: number;
  otherBusinessExpenses?: number;
  totalHours?: number;
}): {
  digitalGrossRevenue: number;
  commissionRevenue: number;
  totalGrossRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalHours: number;
  effectiveProfitPerHour: number | null;
} {
  const n = (v?: number) => Math.max(0, Number(v) || 0);
  const digitalGrossRevenue = n(input.paidDownloadsTips) * n(input.avgGrossAmount);
  const commissionRevenue = n(input.commissionProjects) * n(input.avgCommissionPrice);
  const totalGrossRevenue = digitalGrossRevenue + commissionRevenue;
  const totalExpenses =
    n(input.platformRevenueShareFees) +
    n(input.paymentProcessingFees) +
    n(input.refundsChargebacks) +
    n(input.toolAssetCosts) +
    n(input.otherBusinessExpenses);
  const estimatedProfit = totalGrossRevenue - totalExpenses;
  const totalHours = n(input.totalHours);
  return {
    digitalGrossRevenue,
    commissionRevenue,
    totalGrossRevenue,
    totalExpenses,
    estimatedProfit,
    totalHours,
    effectiveProfitPerHour: totalHours > 0 ? estimatedProfit / totalHours : null,
  };
}
