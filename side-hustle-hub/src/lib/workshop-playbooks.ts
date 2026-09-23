/**
 * Extra course copy for selected GYSH workshops (from the workshop guide).
 * Kept off the D1 row so Admin title/date edits cannot wipe the playbook.
 */

import type { GuideMinTier } from "./guide-access";

export const AI_SCENE_PACKS_WORKSHOP_ID = "ai-scene-production-packs";

export type WorkshopClockRow = {
  section: string;
  minutes: string;
};

export type WorkshopChecklistItem = {
  code: string;
  text: string;
};

export type WorkshopCreditPlan = {
  tool: string;
  pricing: string;
  notes: string;
};

export type WorkshopSneakPeek = {
  kicker: string;
  title: string;
  tools: string;
  coverLead: string;
  coverItems: string[];
  copyrightHeading: string;
  copyrightLines: string[];
  toc: string[];
  rulesHeading: string;
  rules: WorkshopChecklistItem[];
  beforeClassHeading: string;
  beforeClass: WorkshopChecklistItem[];
  creditsHeading: string;
  creditsIntro: string;
  creditPlans: WorkshopCreditPlan[];
  creditsImportantHeading: string;
  creditsImportantLead: string;
  creditsPlanFor: string[];
  creditsTip: string;
  creditsDisclaimer: string;
};

export type WorkshopPlaybook = {
  subtitle: string;
  description: string;
  learnItems: string[];
  agenda: string[];
  beforeClass: string[];
  workshopRules: WorkshopChecklistItem[];
  sneakPeek: WorkshopSneakPeek;
  productionClock: WorkshopClockRow[];
  minTier: GuideMinTier;
};

const MAKE_IT_POP_LEARN = [
  "Turn an idea into a 3-scene marketing video",
  "Use ChatGPT to create your story, prompts, and visuals",
  "Generate and troubleshoot scenes in Hedra",
  "Polish your video with hooks, transitions, and audio in CapCut",
  "Follow a repeatable workflow you can use again and again",
];

const MAKE_IT_POP_COPYRIGHT = [
  "© 2026 Get Your Side Hustle. All Rights Reserved.",
  "This workshop guide and its contents are proprietary educational materials of Get Your Side Hustle.",
  "Reproduction, copying, distribution, sharing, resale, republication, or modification of this material, in whole or in part, is prohibited without prior written consent from Get Your Side Hustle.",
];

const MAKE_IT_POP_AGENDA = [
  "Before Class — Ready Check",
  "The 90-Minute Production Clock",
  "Story Idea Starters",
  "Create Your 3-Scene Story in ChatGPT",
  "Review & Approve Your Story",
  "Build Scene 1 — ChatGPT",
  "Generate Scene 1 — Hedra",
  "Troubleshoot & Correct Hedra",
  "Build + Produce Scene 2",
  "Build + Produce Scene 3 — CTA",
  "Create the Hook Overlay — ChatGPT",
  "CapCut — Make It Pop",
  "Export + Test",
  "ChatGPT Final Review (optional)",
  "Scene Production Pack (optional)",
  "Credits & Plans*",
];

const MAKE_IT_POP_RULES: WorkshopChecklistItem[] = [
  { code: "0.1", text: "Arrive ready. Accounts, software, idea and assets are prepared before class." },
  { code: "0.2", text: "Keep it simple. This is a short marketing story, not a feature film." },
  { code: "0.3", text: "Acceptable beats endless perfection. Correct major errors; polish tiny issues later." },
  { code: "0.4", text: "Protect your credits (*See Credits & Plans at the end of this guide before beginning). Change the prompt before regenerating." },
  { code: "0.5", text: "Use wait time. Organize files or prepare the next production step while AI generates." },
  { code: "0.6", text: "Finish. The goal is to leave with a complete marketing video." },
];

const MAKE_IT_POP_BEFORE_CLASS: WorkshopChecklistItem[] = [
  {
    code: "1.1",
    text: "ChatGPT: Account created/logged in; comfortable prompting and uploading/downloading images. *See Credits & Plans at the end of this guide before beginning.",
  },
  { code: "1.2", text: "Hedra: Account created/logged in. No previous Hedra experience required." },
  {
    code: "1.3",
    text: "CapCut: Installed/logged in; basic familiarity with clips, timeline, audio and export.",
  },
  { code: "1.4", text: "Idea: Bring one simple marketing-video idea." },
  {
    code: "1.5",
    text: "Assets: Logo, product, packaging, clothing, faces or other needed visuals saved on your computer.",
  },
];

const MAKE_IT_POP_CREDIT_PLANS: WorkshopCreditPlan[] = [
  {
    tool: "ChatGPT",
    pricing: "Free available; Go $8/mo, Plus $20/mo, Pro $200/mo in the U.S.",
    notes: "Paid plans provide higher limits and additional capabilities. Usage limits can still apply.",
  },
  {
    tool: "Hedra",
    pricing: "Basic $15/mo - 1,500 credits; Creator $30/mo - 5,400 credits; Professional $75/mo - 14,400 credits",
    notes: "Video generation consumes credits, and usage varies by model. Paid plans include commercial use.",
  },
  {
    tool: "CapCut",
    pricing: "Free version available; paid pricing varies by region, device and promotions",
    notes: "Some AI features use separate credits/AI points. Check the price shown in your account before upgrading.",
  },
];

const MAKE_IT_POP_CREDITS_PLAN_FOR = [
  "Multiple generations or retries",
  "Corrections to characters, dialogue or movement",
  "Different models consuming different amounts of credits",
  "Usage limits that can change by tool or plan",
];

export const WORKSHOP_PLAYBOOKS: Record<string, WorkshopPlaybook> = {
  [AI_SCENE_PACKS_WORKSHOP_ID]: {
    subtitle: "MAKE IT POP · 90-Minute AI Marketing Video Hands-On · ChatGPT + Hedra + CapCut",
    description:
      "This workshop teaches you how to turn an idea into a finished 3-scene marketing video using ChatGPT, Hedra, and CapCut — a repeatable Scene Production Pack workflow you can use again and again.",
    learnItems: MAKE_IT_POP_LEARN,
    agenda: MAKE_IT_POP_AGENDA,
    beforeClass: MAKE_IT_POP_BEFORE_CLASS.map((item) => item.text),
    workshopRules: MAKE_IT_POP_RULES,
    sneakPeek: {
      kicker: "MAKE IT POP",
      title: "90-Minute AI Marketing Video Hands-On Workshop Guide",
      tools: "ChatGPT + Hedra + CapCut",
      coverLead: "This guide teaches you how to:",
      coverItems: MAKE_IT_POP_LEARN,
      copyrightHeading: "Copyright & Use Notice",
      copyrightLines: MAKE_IT_POP_COPYRIGHT,
      toc: MAKE_IT_POP_AGENDA,
      rulesHeading: "0. GYSH MAKE IT POP 90-MINUTE WORKSHOP RULES",
      rules: MAKE_IT_POP_RULES,
      beforeClassHeading: "1. BEFORE CLASS — READY CHECK",
      beforeClass: MAKE_IT_POP_BEFORE_CLASS,
      creditsHeading: "16. Credits & Plans*",
      creditsIntro:
        "AI tools may offer free access, paid subscriptions, usage limits, or credit-based generation. Check your plan and available credits before beginning the hands-on portion of the workshop.",
      creditPlans: MAKE_IT_POP_CREDIT_PLANS,
      creditsImportantHeading: "Important - AI Credits",
      creditsImportantLead:
        "Video generation can use credits quickly, particularly when scenes require multiple attempts. You may run out of credits before your video is finished.",
      creditsPlanFor: MAKE_IT_POP_CREDITS_PLAN_FOR,
      creditsTip:
        "GYSH TIP: Finalize your story, SceneBeg, SceneEnd and prompt BEFORE generating your video. Better preparation = fewer wasted generations and credits.",
      creditsDisclaimer:
        "*Pricing & Credit Disclaimer: Prices, plans, features, credit requirements and usage limits are controlled by the individual platforms and may change at any time. GYSH workshop registration does not include third-party subscriptions or AI generation credits. Participants are responsible for their own accounts and any associated costs. Running out of credits may prevent completion of a video during the workshop.",
    },
    productionClock: [
      { section: "Kickoff + Finished Video Demo", minutes: "5 min" },
      { section: "Idea + 3-Scene Story in ChatGPT", minutes: "10 min" },
      { section: "Scene 1: ChatGPT → Hedra → Review", minutes: "15 min" },
      { section: "Scene 2: ChatGPT → Hedra → Review", minutes: "12 min" },
      { section: "Scene 3: Simple CTA", minutes: "8 min" },
      { section: "ChatGPT Hook Overlay", minutes: "3 min" },
      { section: "CapCut: Assemble + Polish", minutes: "22 min" },
      { section: "Export + Test", minutes: "5 min" },
      { section: "Troubleshooting / Generation Buffer / Q&A", minutes: "10 min" },
      { section: "Total", minutes: "90 minutes" },
    ],
    minTier: "free",
  },
};

export function workshopPlaybook(workshopId: string): WorkshopPlaybook | null {
  const raw = String(workshopId || "").trim();
  const id = raw === "ai-marketing-video" ? AI_SCENE_PACKS_WORKSHOP_ID : raw;
  return WORKSHOP_PLAYBOOKS[id] ?? WORKSHOP_PLAYBOOKS[raw] ?? null;
}

export function workshopSneakPeek(workshopId: string): WorkshopSneakPeek | null {
  return workshopPlaybook(workshopId)?.sneakPeek ?? null;
}

/** Card chips: drop Content / Scene Production Packs when a sneak-peek link replaces them. */
export function workshopPublicTags(workshopId: string, tags: string[]): string[] {
  if (!workshopSneakPeek(workshopId)) return [...tags];
  return tags.filter((t) => !/^content$/i.test(t) && !/scene production packs/i.test(t));
}

/** True when pre-registration / seats require a Free (or higher) GYSH membership. */
export function workshopRequiresMember(workshopId: string): boolean {
  return workshopPlaybook(workshopId) != null;
}

export function workshopMemberAccessLabel(workshopId: string): string | null {
  const book = workshopPlaybook(workshopId);
  if (!book) return null;
  if (book.minTier === "free") return "Free membership & above";
  return `${book.minTier[0]!.toUpperCase()}${book.minTier.slice(1)} membership & above`;
}
