/**
 * Side Hustle Checklist — practical launch steps for GYSH members.
 * Content is code-seeded (not Content Factory CMS) so it stays versioned with the app.
 */

export type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  phase: "prep" | "build" | "launch" | "grow";
};

/** How many items guests see before the membership lock. */
export const CHECKLIST_PREVIEW_COUNT = 2;

export const LAUNCH_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "pick-pilot",
    title: "Pick one pilot hustle (not five)",
    description:
      "Choose a single offer you can test in 30 days. Write one sentence: who it helps, what you deliver, and what they pay.",
    phase: "prep",
  },
  {
    id: "time-budget",
    title: "Block a weekly time budget",
    description:
      "Decide how many hours you can protect each week (even 4–6). Put them on your calendar so the pilot doesn’t compete with hope alone.",
    phase: "prep",
  },
  {
    id: "money-lane",
    title: "Open a separate money lane",
    description:
      "Use a dedicated checking account or wallet for hustle income and expenses. Mixing personal and business cash makes tax season painful.",
    phase: "prep",
  },
  {
    id: "cost-floor",
    title: "Know your cost floor before you price",
    description:
      "List materials, tools, ads, fees, and your time. Price so you still profit after platform cuts and the first refund or redo.",
    phase: "build",
  },
  {
    id: "simple-offer",
    title: "Write a one-page offer",
    description:
      "Draft a short landing page, listing, or flyer: problem, deliverable, price, turnaround, and how to book or buy. Clarity beats fancy branding.",
    phase: "build",
  },
  {
    id: "legal-basics",
    title: "Cover the boring legal basics",
    description:
      "Check local permits, HOA or city rules, and whether you need an EIN or sales-tax registration. When unsure, ask a licensed pro before you scale.",
    phase: "build",
  },
  {
    id: "warm-outreach",
    title: "Ask 10 warm contacts for your first leads",
    description:
      "Text friends, coworkers, neighbors, and past clients with a clear ask. Soft launches beat cold ads until you know what converts.",
    phase: "launch",
  },
  {
    id: "first-three",
    title: "Deliver three paid (or strongly paid-adjacent) jobs",
    description:
      "Complete at least three real deliveries. Capture testimonials, before/after proof, and what you’d change next time.",
    phase: "launch",
  },
  {
    id: "track-30",
    title: "Track hours and expenses for 30 days",
    description:
      "Log time, spend, and revenue weekly. Use the numbers to decide: raise prices, cut a step, or pause the pilot.",
    phase: "grow",
  },
  {
    id: "reinvest",
    title: "Set your first reinvestment rule",
    description:
      "Pick a simple rule (e.g. 20% of profit back into tools/ads/skills). Growth stays intentional instead of accidental spending.",
    phase: "grow",
  },
];

export const CHECKLIST_PHASE_LABELS: Record<ChecklistItem["phase"], string> = {
  prep: "Prep",
  build: "Build",
  launch: "Launch",
  grow: "Grow",
};

export function getChecklistPreview(items: ChecklistItem[] = LAUNCH_CHECKLIST_ITEMS) {
  return {
    visible: items.slice(0, CHECKLIST_PREVIEW_COUNT),
    locked: items.slice(CHECKLIST_PREVIEW_COUNT),
  };
}
