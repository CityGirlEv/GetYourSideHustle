/**
 * Learn AI using ChatGPT (`ai-prompt-helper`, Guide #025).
 * Skill-building first — optional paid projects only after human review.
 * Plain data only (no imports from guide-tools) to avoid circular modules.
 */

export const AI_PROMPT_HELPER_REALITY_CHECK = {
  title: "CHATGPT IS A HELPER, NOT AN AUTOMATIC SOURCE OF TRUTH",
  body: [
    "ChatGPT can help you brainstorm, draft, rewrite, summarize, plan, organize, explain, compare, create checklists, practice ideas, and work with information you provide.",
    "",
    "AI can make mistakes or produce outdated or incomplete information. For important medical, legal, financial, tax, safety, employment, or other high-stakes decisions, VERIFY important facts using reliable/current sources and qualified professionals where appropriate.",
    "",
    "Do not paste passwords, Social Security numbers, full financial account details, private client information, confidential employer data, or other sensitive information into prompts unless you understand and are authorized to use the applicable privacy controls.",
    "",
    "Tagline: Ask Better. Refine Smarter. Get More Done.",
  ].join("\n"),
};

export const AI_PROMPT_HELPER_NOTES_WORKSHEET = `MY AI LEARNING GOAL:
__________

EVERYDAY TASKS I WANT CHATGPT TO HELP WITH:
1. ________
2. ________
3. ________
4. ________
5. ________

MY STRONG PROMPT FORMULA:
Task: ________
Context: ________
Details: ________
Output Format: ________
Constraints: ________

MY FAVORITE FOLLOW-UP PROMPTS:
1. ________
2. ________
3. ________
4. ________
5. ________

MY PROMPT LIBRARY:
Email: ________
Planning: ________
Writing: ________
Learning: ________
Side Hustle/Business: ________

MY WORKFLOWS:
Workflow 1: ________
Workflow 2: ________
Workflow 3: ________

BEFORE I TRUST AN ANSWER:
☐ Check names
☐ Check dates
☐ Check numbers
☐ Check links/sources when applicable
☐ Check current information
☐ Check high-stakes information
☐ Remove/private sensitive information
☐ Apply my own judgment

30-DAY GOAL:
__________

OPTIONAL PAID PROJECT TRACKING:
Project: ________
Fee: $____
Expenses: $____
Profit: $____
Hours: ____
Effective Profit/Hour: $____

GYSH PRO TIP
THE MAGIC IS NOT ONE “PERFECT PROMPT.”
The real skill is learning how to have a productive back-and-forth:
TELL CHATGPT WHAT YOU NEED → LOOK AT THE ANSWER → TELL IT WHAT’S WRONG OR MISSING → REFINE → VERIFY → SAVE THE VERSION THAT WORKS
People who learn to REFINE usually get much more useful results than people who keep starting over.

ELITE CHALLENGE
BUILD YOUR PERSONAL 10-PROMPT AI TOOLKIT.
Create one reusable prompt for each:
1. Email
2. Social post
3. Weekly planning
4. Shopping/meal planning
5. Learning/explaining
6. Brainstorming
7. Comparing options
8. Checklist creation
9. Rewriting/editing
10. One task specific to your life/work
Then create 3 workflows: Personal · Work/Business · Side Hustle or Creative
Test every prompt at least twice. Improve weak prompts. Save the final versions.`;

export const AI_PROMPT_HELPER_PREREQUISITE_EXTRAS: {
  id: string;
  label: string;
  detail: string;
}[] = [
  {
    id: "overview",
    label: "What this side-hustle is",
    detail:
      "Learn how to use ChatGPT for writing, planning, brainstorming, organizing information, and everyday tasks. Practice reusable prompts, improve weak answers, verify important information, and build simple AI workflows. Tagline: Ask Better. Refine Smarter. Get More Done. Category: AI Skills / Digital Skills. Best for Teens where appropriate, Adults, Seniors / Retirees. Beginner · Very low startup · Flexible · Online / home / workshop · Skill building / optional tutoring or project support · 3 - 10 hrs/week · Elite Membership. You do NOT need to be a programmer.",
  },
  {
    id: "need",
    label: "What you need",
    detail:
      "Computer, tablet, or smartphone · Internet · ChatGPT access · Basic typing · Curiosity · Practice tasks.",
  },
  {
    id: "helpful",
    label: "Helpful",
    detail: "Google Docs or Word · Notes · Google Drive · Spreadsheet · A folder for saved prompts.",
  },
  {
    id: "terms",
    label: "Before beginning, understand",
    detail:
      "PROMPT = the instruction/request you give ChatGPT. OUTPUT = ChatGPT’s response. CONTEXT = information that helps ChatGPT understand your situation. CONSTRAINT = a rule such as length, audience, tone, format, budget, or deadline. ITERATION = improving the result through follow-up prompts.",
  },
];

export const AI_PROMPT_HELPER_EXTERNAL_LINKS: {
  label: string;
  url: string;
  note?: string;
}[] = [
  { label: "ChatGPT", url: "https://chatgpt.com/", note: "Core learning tool — plans and interface can change" },
  { label: "Google Docs", url: "https://docs.google.com/", note: "Save prompts and drafts" },
  { label: "Google Drive", url: "https://drive.google.com/", note: "Prompt library folder" },
  { label: "Google Sheets", url: "https://sheets.google.com/", note: "Planning tables" },
  { label: "Google Calendar", url: "https://calendar.google.com/", note: "Weekly planning practice" },
];

export const AI_PROMPT_HELPER_SUPPLIES = {
  starterKitTotal: "About $0–15 — no expensive AI software is required to learn the basics",
  items: [
    { id: "device", name: "Phone / tablet / computer", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "internet", name: "Internet access", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "chatgpt", name: "ChatGPT access", qty: "1", estCost: "$0", notes: "Essential — start on the current free/available plan" },
    { id: "notes", name: "Notes or document app", qty: "1", estCost: "$0", notes: "Essential" },
    { id: "docs", name: "Google Docs", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "word", name: "Microsoft Word", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "sheets", name: "Google Sheets / Excel", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "drive", name: "Google Drive", qty: "1", estCost: "$0", notes: "Helpful — prompt templates folder", optional: true },
    { id: "calendar", name: "Calendar", qty: "1", estCost: "$0", notes: "Helpful", optional: true },
    { id: "samples", name: "Sample documents with no sensitive information", qty: "1 set", estCost: "$0", notes: "Helpful practice files", optional: true },
  ],
};

export const AI_PROMPT_HELPER_TOOLS: {
  id: string;
  name: string;
  freePlanAvailable: boolean;
  planLabelApplicable?: boolean;
  costNote: string;
  url?: string;
  optional?: boolean;
}[] = [
  {
    id: "ai_chatgpt",
    name: "ChatGPT",
    freePlanAvailable: true,
    costNote: "Core tool. Features, plans, limits, and interface options can change — verify current options.",
    url: "https://chatgpt.com/",
  },
  {
    id: "ai_docs",
    name: "Google Docs",
    freePlanAvailable: true,
    costNote: "Save prompts, drafts, and your prompt library",
    url: "https://docs.google.com/",
  },
  {
    id: "ai_word",
    name: "Microsoft Word",
    freePlanAvailable: true,
    costNote: "Alternate writing app",
    optional: true,
  },
  {
    id: "ai_notes",
    name: "Notes",
    freePlanAvailable: true,
    costNote: "Phone or computer notes for practice prompts",
  },
  {
    id: "ai_calendar",
    name: "Google Calendar",
    freePlanAvailable: true,
    costNote: "Weekly planning practice",
    url: "https://calendar.google.com/",
    optional: true,
  },
  {
    id: "ai_sheets",
    name: "Google Sheets / Excel",
    freePlanAvailable: true,
    costNote: "Tables and checklists",
    url: "https://sheets.google.com/",
    optional: true,
  },
  {
    id: "ai_drive",
    name: "Google Drive",
    freePlanAvailable: true,
    costNote: "Prompt library and sample files",
    url: "https://drive.google.com/",
  },
  {
    id: "ai_onedrive",
    name: "OneDrive",
    freePlanAvailable: true,
    costNote: "Alternate file storage",
    url: "https://onedrive.live.com/",
    optional: true,
  },
  {
    id: "ai_library",
    name: "Saved prompt library",
    freePlanAvailable: true,
    costNote: "A folder of templates you reuse",
  },
  {
    id: "ai_stack",
    name: "Beginner Tool Stack",
    freePlanAvailable: false,
    planLabelApplicable: false,
    costNote: "ChatGPT + Docs/Notes + One Real-Life Practice Task",
  },
];

export const AI_PROMPT_HELPER_PRICING = {
  tabLabel: "Suggested Pricing",
  intro: [
    "Displayed pricing: $15 – $50 / project (examples).",
    "",
    "This guide teaches a SKILL. The displayed project pricing applies if the learner later chooses to offer simple AI-assisted help to others — not merely for practicing ChatGPT personally.",
    "",
    "Possible beginner paid projects after developing competency:",
    "- Rewrite/format a short document: $15–$20",
    "- Create a simple planning/checklist package: $20–$30",
    "- Basic prompt/workflow setup: $25–$40",
    "- Small AI-assisted content/organization project: $35–$50+",
    "",
    "Always review AI output before delivery. Be transparent where AI disclosure is required or appropriate. Never sell unverified AI output as professional expert advice. Follow client/employer rules about AI use. Do not upload confidential client information without authorization.",
    "",
    "Pricing varies by scope, skill, revisions, and market. Examples only — not income guarantees.",
  ].join("\n"),
  raiseTip:
    "AI output is not the finished product until YOU review, correct, customize, and verify it. Examples only — not income guarantees.",
  items: [
    { id: "rewrite", label: "Rewrite / format a short document", price: "$15–$20", notes: "Optional paid project after skill practice" },
    { id: "checklist", label: "Simple planning / checklist package", price: "$20–$30", notes: "Optional paid project" },
    { id: "workflow", label: "Basic prompt / workflow setup", price: "$25–$40", notes: "Optional paid project" },
    { id: "content", label: "Small AI-assisted content / organization project", price: "$35–$50+", notes: "Optional paid project" },
  ],
};

/** Exactly 11 authored core steps. Education first — no GYSH marketing stages. Never ✓. */
export const AI_PROMPT_HELPER_DETAILED_STEPS: { title: string; desc: string }[] = [
  {
    title: "Learn the 5 Parts of a Strong Prompt",
    desc: [
      "Use: TASK + CONTEXT + DETAILS + OUTPUT FORMAT + CONSTRAINTS",
      "",
      "Example:",
      "TASK: Create a weekly dinner plan.",
      "CONTEXT: I need simple meals for two people.",
      "DETAILS: Use chicken, ground beef, pasta, and tacos.",
      "OUTPUT FORMAT: Make a 5-day table with dinner and grocery items.",
      "CONSTRAINTS: Meals should take about 30 minutes or less.",
      "",
      "You do not need all 5 parts every time, but adding missing information often improves the answer.",
    ].join("\n"),
  },
  {
    title: "Start with One Real Everyday Task",
    desc: [
      "Choose something useful:",
      "☐ Write an email",
      "☐ Plan meals",
      "☐ Make a shopping list",
      "☐ Plan a trip",
      "☐ Create a schedule",
      "☐ Brainstorm a side hustle",
      "☐ Rewrite a paragraph",
      "☐ Explain a confusing topic",
      "☐ Make a checklist",
      "☐ Organize notes",
      "☐ Prepare interview questions",
      "",
      "Write your first prompt.",
      "Then ask: Did ChatGPT understand what I wanted? What information was missing?",
    ].join("\n"),
  },
  {
    title: "Give ChatGPT Useful Context",
    desc: [
      "Compare:",
      "",
      "WEAK: “Write me a post.”",
      "",
      "BETTER: “Write a friendly Facebook post announcing a Saturday community yard sale. Audience is local families. Keep it under 100 words. Include date, time, location placeholder, and a call to share the post.”",
      "",
      "Context can include goal, audience, background, budget, deadline, preferences, things to avoid, and information already decided.",
      "Do not include unnecessary sensitive information.",
    ].join("\n"),
  },
  {
    title: "Control the Output",
    desc: [
      "Tell ChatGPT exactly how you want the answer.",
      "",
      "Examples: “Give me 5 options.” “Use bullets.” “Put it in a table.” “Make it beginner-friendly.” “Keep it under 150 words.” “Give me step-by-step instructions.” “Make it suitable for a 12-year-old.” “Give me a checklist I can print.” “Ask me one question at a time.”",
      "",
      "Practice changing the SAME answer into 3 different formats.",
    ].join("\n"),
  },
  {
    title: "Refine Instead of Starting Over",
    desc: [
      "Your first answer does not have to be perfect.",
      "",
      "Useful follow-ups: “Make it shorter.” “Make it warmer.” “Give me 3 alternatives.” “Explain step 4 more simply.” “Remove the jargon.” “Keep the idea but change the opening.” “Add a budget column.” “Turn this into a checklist.” “What information are you missing?”",
      "",
      "Think: PROMPT → RESPONSE → REVIEW → REFINE",
      "This is one of the most important AI skills.",
    ].join("\n"),
  },
  {
    title: "Use ChatGPT for Writing Without Losing Your Voice",
    desc: [
      "Practice: email drafts, social posts, invitations, letters, bios, product descriptions, thank-you messages, meeting notes.",
      "",
      "Workflow:",
      "1. Tell ChatGPT the purpose",
      "2. Give key facts",
      "3. Describe desired tone",
      "4. Ask for draft",
      "5. Edit anything that does not sound like you",
      "6. Verify names/dates/facts",
      "7. Finalize",
      "",
      "Do not blindly copy/paste. Your final output should still reflect YOUR intent and judgment.",
    ].join("\n"),
  },
  {
    title: "Use ChatGPT for Planning & Organization",
    desc: [
      "Try: weekly schedule, to-do list, event plan, packing list, project steps, meal plan, study plan, side-hustle launch checklist, budget categories without sharing sensitive account information.",
      "",
      "Example: “I have 6 tasks to finish by Friday. Here they are: [TASKS]. Organize them by priority and create a Monday–Friday plan. I have 2 hours each day.”",
      "",
      "Then refine based on real-life constraints.",
    ].join("\n"),
  },
  {
    title: "Verify Facts & Recognize AI Limits",
    desc: [
      "Before relying on an answer ask: Is this current? Factual? High stakes? Something that could have changed? Something I should verify?",
      "",
      "Useful prompts: “Which parts of this answer should I verify?” “What assumptions are you making?” “Separate facts from suggestions.” “What information might be outdated?”",
      "",
      "When current information matters, use reliable/current sources and available search/browsing tools where appropriate.",
      "Never invent citations or assume a confident-sounding answer is automatically correct.",
    ].join("\n"),
  },
  {
    title: "Build Reusable Prompt Templates",
    desc: [
      "Create templates with placeholders.",
      "",
      "EMAIL TEMPLATE: “Write a [TONE] email to [PERSON/AUDIENCE] about [TOPIC]. Include [KEY POINTS]. Keep it under [LENGTH]. End with [CTA].”",
      "",
      "PLANNING TEMPLATE: “Create a [NUMBER]-day plan for [GOAL]. I have [TIME] available and a budget of [BUDGET]. My constraints are [CONSTRAINTS]. Put it in a table.”",
      "",
      "LEARNING TEMPLATE: “Explain [TOPIC] to a beginner. First give a plain-English explanation, then an example, then ask me 3 questions to check my understanding.”",
      "",
      "Save your best templates in a PROMPT LIBRARY.",
    ].join("\n"),
  },
  {
    title: "Build a Simple Repeatable AI Workflow",
    desc: [
      "A workflow is several prompts/actions used together.",
      "",
      "Example — EVENT PLANNING: 1. Brainstorm event checklist 2. Turn checklist into timeline 3. Draft invitation 4. Create social post 5. Create shopping/supply list 6. Create day-of schedule 7. Review everything for missing details",
      "",
      "Example — JOB SEARCH PREP: 1. Analyze job description 2. Identify required skills 3. Compare against your experience 4. Draft interview questions 5. Practice answers 6. Draft thank-you note",
      "",
      "Never automate away your final review.",
    ].join("\n"),
  },
  {
    title: "Turn Your AI Skill into Something Useful",
    desc: [
      "Choose ONE 30-day skill goal.",
      "",
      "Examples: use ChatGPT to plan every week · build 10 reusable prompts · improve professional emails · create a family planning workflow · learn AI-assisted content creation · build a small prompt/workflow service · teach someone else the basics",
      "",
      "Create your personal AI toolkit:",
      "☐ 10 saved prompts",
      "☐ 3 reusable workflows",
      "☐ Fact-check checklist",
      "☐ Privacy checklist",
      "☐ Favorite output formats",
      "☐ “Improve this answer” follow-up list",
      "",
      "Then repeat: ASK → REVIEW → REFINE → VERIFY → SAVE WHAT WORKS → REUSE",
    ].join("\n"),
  },
];

export function aiPromptHelperToolsDisclaimer(): string {
  return "Beginner stack: ChatGPT + Docs/Notes + One Real-Life Practice Task. ChatGPT features, plans, limits, and interface options can change — verify current options rather than assuming a specific paid plan. Do not paste passwords, Social Security numbers, full financial details, or confidential client/employer data into prompts unless you understand and are authorized to use the applicable privacy controls.";
}

/** Optional paid-project math only. AI output is not finished until reviewed. */
export function computeAiPromptHelperProfit(input: {
  averageProjectFee: number;
  projectsPerWeek: number;
  addOnRevenue?: number;
  aiSoftwareCost?: number;
  advertising?: number;
  otherBusinessExpenses?: number;
  averageHoursPerProjectIncludingReview?: number;
}): {
  weeklyRevenue: number;
  weeklyExpenses: number;
  weeklyProfit: number;
  monthlyProfitEstimate: number;
  weeklyHours: number;
  effectiveProfitPerHour: number | null;
} {
  const fee = Math.max(0, Number(input.averageProjectFee) || 0);
  const projects = Math.max(0, Number(input.projectsPerWeek) || 0);
  const addOns = Math.max(0, Number(input.addOnRevenue) || 0);
  const weeklyRevenue = fee * projects + addOns;
  const weeklyExpenses =
    Math.max(0, Number(input.aiSoftwareCost) || 0) +
    Math.max(0, Number(input.advertising) || 0) +
    Math.max(0, Number(input.otherBusinessExpenses) || 0);
  const weeklyProfit = weeklyRevenue - weeklyExpenses;
  const hoursPer = Math.max(0, Number(input.averageHoursPerProjectIncludingReview) || 0);
  const weeklyHours = hoursPer * projects;
  return {
    weeklyRevenue,
    weeklyExpenses,
    weeklyProfit,
    monthlyProfitEstimate: weeklyProfit * 4.33,
    weeklyHours,
    effectiveProfitPerHour: weeklyHours > 0 ? weeklyProfit / weeklyHours : null,
  };
}
