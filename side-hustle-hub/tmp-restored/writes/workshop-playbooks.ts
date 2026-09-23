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

export type WorkshopPlaybook = {
  subtitle: string;
  description: string;
  learnItems: string[];
  agenda: string[];
  beforeClass: string[];
  productionClock: WorkshopClockRow[];
  minTier: GuideMinTier;
};

export const WORKSHOP_PLAYBOOKS: Record<string, WorkshopPlaybook> = {
  [AI_SCENE_PACKS_WORKSHOP_ID]: {
    subtitle: "MAKE IT POP · 90-Minute AI Marketing Video Hands-On · ChatGPT + Hedra + CapCut",
    description:
      "This workshop teaches you how to turn an idea into a finished 3-scene marketing video using ChatGPT, Hedra, and CapCut — a repeatable Scene Production Pack workflow you can use again and again.",
    learnItems: [
      "Turn an idea into a 3-scene marketing video",
      "Use ChatGPT to create your story, prompts, and visuals",
      "Generate and troubleshoot scenes in Hedra",
      "Polish your video with hooks, transitions, and audio in CapCut",
      "Follow a repeatable workflow you can use again and again",
    ],
    agenda: [
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
    ],
    beforeClass: [
      "ChatGPT: account created/logged in; comfortable prompting and uploading/downloading images.",
      "Hedra: account created/logged in. No previous Hedra experience required.",
      "CapCut: installed/logged in; basic familiarity with clips, timeline, audio, and export.",
      "Idea: bring one simple marketing-video idea.",
      "Assets: logo, product, packaging, clothing, faces, or other needed visuals saved on your computer.",
    ],
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
  const id = String(workshopId || "").trim();
  return WORKSHOP_PLAYBOOKS[id] ?? null;
}

/** True when pre-registration / seats require a Free (or higher) GYSH membership. */
export function workshopRequiresMember(workshopId: string): boolean {
  return workshopPlaybook(workshopId)?.minTier === "free" || Boolean(workshopPlaybook(workshopId)?.minTier);
}

export function workshopMemberAccessLabel(workshopId: string): string | null {
  const book = workshopPlaybook(workshopId);
  if (!book) return null;
  if (book.minTier === "free") return "Free membership & above";
  return `${book.minTier[0]!.toUpperCase()}${book.minTier.slice(1)} membership & above`;
}
