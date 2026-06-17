/**
 * Shared Learning Center hero image prompts — keep in sync with buildFeaturedImagePrompt().
 */
export const LEARNING_CENTER_IMAGE_STYLE = [
  "Educational Medicare blog header illustration, calm and trustworthy, no text overlays, no logos, no sales language.",
  "Style: clean flat vector illustration matching a cohesive Learning Center series — soft blues and white, inclusive older adults as simple non-identifiable silhouettes at a table reviewing documents, warm trustworthy tone.",
  "Composition: wide horizontal scene, layered depth, subtle rounded shapes, clipboard or calendar motifs, CMS-compliant educational tone.",
  "Avoid: enrollment CTAs, agent portraits, carrier branding, clip art medical crosses with urgency colors, words or numbers on the image.",
].join(" ");

export function buildFeaturedImagePrompt({ title, excerpt, category }) {
  return [
    LEARNING_CENTER_IMAGE_STYLE,
    `Topic: ${title}.`,
    `Category: ${String(category).replace(/-/g, " ")}.`,
    `Context: ${excerpt}`,
  ].join(" ");
}

export const SCENE_MOTIFS = {
  "original-medicare-vs-medicare-advantage": "split-path",
  "understanding-medicare-part-b-premiums": "premium-chart",
  "medicare-enrollment-periods-overview": "calendar",
  "how-to-compare-medicare-plans-educationally": "compare-grid",
  "what-is-medicare-prior-authorization": "approval-shield",
  "turning-65-medicare-guide": "milestone-65",
  "medicare-at-65-action-plan": "checklist",
  "medicare-enrollment-timeline": "timeline",
  "turning-65-and-still-working": "work-calendar",
  "medicare-initial-enrollment-period": "seven-month-window",
  "is-medicare-automatic-at-65": "question-shield",
  "medicare-special-enrollment-period": "special-door",
};

/** Unified palette — matches the DALL-E prior-auth series look */
export const PALETTE = {
  sky: "#E8F4FC",
  blueLight: "#A8D4FF",
  blue: "#5B9FED",
  blueDeep: "#2E6DB4",
  navy: "#1B3A5C",
  white: "#FFFFFF",
  warm1: "#F4C4A8",
  warm2: "#D4956A",
  warm3: "#8B5E3C",
  green: "#6BBF8A",
  amber: "#F0B429",
};
