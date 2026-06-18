/** TPMO-safe photorealistic image prompt for Learning Center inline article photos. */
export const LEARNING_CENTER_IMAGE_STYLE = [
  "Professional photorealistic editorial photograph for a Medicare education article.",
  "Natural window light, shallow depth of field, warm trustworthy mood.",
  "Multicultural representation is required: reflect America's Medicare-age population with varied skin tones, ethnicities, and family structures.",
  "Older adults (60s–80s) in a realistic home or calm office setting reviewing paperwork, calendars, or a laptop — candid not posed like a stock ad.",
  "Polished magazine-quality composition, soft neutral palette with subtle blue accents.",
  "NO text, NO logos, NO watermark, NO cartoon, NO illustration, NO clip art, NO infographic style.",
  "CMS-compliant educational tone — informative, calm, never salesy.",
].join(" ");

/** Rotate cast/scene cues so article images show different multicultural households. */
export const MULTICULTURAL_SCENE_HINTS = [
  "Cast: Black or African American couple in their late 60s at a bright kitchen table.",
  "Cast: East Asian American senior with an adult daughter reviewing documents together.",
  "Cast: Latino/Hispanic couple in their 70s with coffee mugs and Medicare paperwork.",
  "Cast: South Asian American woman in her 60s with reading glasses and a checklist.",
  "Cast: Interracial Black and white couple comparing plan summaries side by side.",
  "Cast: Middle Eastern American man in his 60s in a calm home office with natural light.",
  "Cast: Indigenous American elders at a dining table with a wall calendar visible.",
  "Cast: Southeast Asian American grandparents with an adult child pointing at a laptop screen.",
  "Cast: Caribbean American senior reviewing mail at a tidy desk near a window.",
  "Cast: Filipino American couple in their 60s seated together with printed guides.",
  "Cast: White Jewish senior with a neighbor or friend of a different ethnicity reviewing forms together.",
  "Cast: Multigenerational household — grandmother of color with adult granddaughter at the table.",
] as const;

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function multiculturalSceneHint(seed: string): string {
  if (!seed.trim()) return MULTICULTURAL_SCENE_HINTS[0];
  const index = hashSeed(seed.trim().toLowerCase()) % MULTICULTURAL_SCENE_HINTS.length;
  return MULTICULTURAL_SCENE_HINTS[index];
}

export function buildFeaturedImagePrompt(input: {
  title: string;
  excerpt: string;
  category: string;
  slug?: string;
}): string {
  return [
    LEARNING_CENTER_IMAGE_STYLE,
    multiculturalSceneHint(input.slug ?? input.title),
    `Topic: ${input.title}.`,
    `Category: ${input.category.replace(/-/g, " ")}.`,
    `Context: ${input.excerpt}`,
  ].join(" ");
}

/** Public path for a Learning Center featured image. */
export function featuredImagePathForSlug(slug: string): string {
  return `/learning-center/${slug}.jpg`;
}
