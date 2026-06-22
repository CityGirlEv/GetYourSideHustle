/**
 * Shared Learning Center image prompts — keep in sync with src/lib/learning-center-image-prompts.ts
 */

export const CMS_IMAGE_VISUAL_PROHIBITIONS = [
  "CMS VISUAL RULES — the finished image must NOT contain any of the following:",
  "Government: Medicare card, red-white-blue Medicare logo, CMS or HHS seal, eagle emblem, Medicare.gov branding, or anything resembling a federal ID or official government document.",
  "Insurance marketing: carrier logos, plan names, star ratings, premiums, dollar amounts, savings claims, enrollment forms, sign-here boxes, phone numbers, URLs, QR codes, or compare-plans tables.",
  "Sales pressure: agents pitching, handshake deal-closing, gift cards, countdown timers, urgency cues, or before/after cost graphics.",
  "Text in image: NO readable text, headlines, watermarks, disclaimers, or fine print anywhere (props must be angled or out of focus so wording is not legible).",
  "Style bans: NO cartoon, illustration, clip art, infographic, diagram, chart, or meme format.",
  "Medical endorsement: NO white-coat doctors promoting insurance, stethoscopes as sales props, or hospital branding.",
  "Topic context below is mood-only — do NOT render article titles, quotes, numbers, or marketing phrases as visible text.",
].join(" ");

export const LEARNING_CENTER_IMAGE_STYLE = [
  "Professional photorealistic editorial photograph for a Medicare education article.",
  "Natural window light, shallow depth of field, warm trustworthy mood.",
  "Multicultural representation is required: reflect America's Medicare-age population with varied skin tones, ethnicities, and family structures.",
  "Older adults (60s–80s) in a realistic home or calm office — candid lifestyle scene, not a posed insurance advertisement.",
  "Safe props only: unbranded folders, wall calendar, reading glasses, coffee mug, laptop with blank or blurred screen.",
  "Polished magazine-quality composition, soft neutral palette with subtle blue accents.",
  "Output: 3:2 landscape hero safe for web — target about 1600px on the long edge, JPEG-friendly, not ultra-high resolution.",
  "CMS-compliant educational tone — informative, calm, never salesy; no implied Medicare or CMS endorsement.",
].join(" ");

export const MULTICULTURAL_SCENE_HINTS = [
  "Cast: Black or African American couple in their late 60s at a bright kitchen table with an unbranded folder.",
  "Cast: East Asian American senior with an adult daughter, documents angled so no text is readable.",
  "Cast: Latino/Hispanic couple in their 70s with coffee mugs and a wall calendar in the background.",
  "Cast: South Asian American woman in her 60s with reading glasses and a blank notepad.",
  "Cast: Interracial Black and white couple at a dining table with generic unbranded paperwork, no logos visible.",
  "Cast: Middle Eastern American man in his 60s in a calm home office with natural light and a closed laptop.",
  "Cast: Indigenous American elders at a dining table with a wall calendar visible, no readable dates as marketing.",
  "Cast: Southeast Asian American grandparents with an adult child, laptop screen blurred with no readable UI.",
  "Cast: Caribbean American senior sorting unmarked mail at a tidy desk near a window.",
  "Cast: Filipino American couple in their 60s seated together with spine-out books and a folder, no legible covers.",
  "Cast: White Jewish senior with a neighbor of a different ethnicity, shared folder with pages turned away from camera.",
  "Cast: Multigenerational household — grandmother of color with adult granddaughter reviewing a calendar together.",
];

function hashSeed(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function multiculturalSceneHint(seed) {
  if (!seed?.trim()) return MULTICULTURAL_SCENE_HINTS[0];
  const index = hashSeed(seed.trim().toLowerCase()) % MULTICULTURAL_SCENE_HINTS.length;
  return MULTICULTURAL_SCENE_HINTS[index];
}

export function sanitizeImagePromptContext(excerpt) {
  return String(excerpt)
    .replace(/\$[\d,]+(?:\.\d{2})?/g, "cost topics")
    .replace(/\b(best|lowest|free|save|#\d+|enroll now|call today)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function buildFeaturedImagePrompt({ title, excerpt, category, slug }) {
  const context = sanitizeImagePromptContext(excerpt);
  return [
    LEARNING_CENTER_IMAGE_STYLE,
    CMS_IMAGE_VISUAL_PROHIBITIONS,
    multiculturalSceneHint(slug ?? title),
    `Topic (mood only, not visible text): ${title}.`,
    `Category: ${String(category).replace(/-/g, " ")}.`,
    context ? `Educational context (do not render as text in image): ${context}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
