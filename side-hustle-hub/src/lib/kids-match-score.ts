/**
 * Kids / Teens Match Wizard scoring + relative match % (top score = 100%).
 * Tag catalog derived from shared side-hustle catalog (M2M audiences).
 */

import { kidsScoreEntries } from "./side-hustle-catalog";

export type KidsAudienceMode = "kids" | "junior";

export type KidsHustleTags = {
  ages: Array<"young" | "mid" | "older">;
  interests: Array<"animals" | "creative" | "outdoors" | "helping" | "tech" | "ai">;
  place: Array<"outdoor" | "indoor" | "either">;
  time: Array<"short" | "medium" | "long">;
};

export type KidsScoreHustle = {
  id: string;
  audiences: KidsAudienceMode[];
  tags: KidsHustleTags;
};

const kidsEntries = kidsScoreEntries("kids");
const juniorOnly = kidsScoreEntries("junior").filter(
  (h) => !kidsEntries.some((k) => k.id === h.id),
);

/** Tag catalog — display copy lives in KidsCorner / shared catalog. */
export const KIDS_SCORE_HUSTLES: KidsScoreHustle[] = [...kidsEntries, ...juniorOnly].map((h) => ({
  id: h.id,
  audiences: h.audiences,
  tags: h.tags as KidsHustleTags,
}));

export function scoreKidsHustle(
  h: KidsScoreHustle,
  answers: Record<string, unknown>,
): number {
  let score = 0;
  const age = String(answers.age || "") as KidsHustleTags["ages"][number];
  const interest = String(answers.interest || "") as KidsHustleTags["interests"][number];
  const place = String(answers.place || "") as KidsHustleTags["place"][number];
  const time = String(answers.time || "") as KidsHustleTags["time"][number];

  if (age && h.tags.ages.includes(age)) score += 3;
  if (interest && h.tags.interests.includes(interest)) score += 4;
  if (
    place === "either" ||
    (place && h.tags.place.includes(place)) ||
    h.tags.place.includes("either")
  ) {
    score += 2;
  }
  if (time && h.tags.time.includes(time)) score += 2;
  return score;
}

/**
 * Relative match percents for a kids/junior result set.
 * Prefer recomputing from answers; if answers are incomplete, assign rank-based
 * percents that keep the saved order (100, then stepped down).
 */
export function kidsResultPcts(input: {
  ageGroup: "kids" | "junior" | string;
  answers?: Record<string, unknown> | null;
  resultIds: string[];
}): Record<string, number> {
  const mode: KidsAudienceMode = input.ageGroup === "junior" ? "junior" : "kids";
  const ids = input.resultIds.filter(Boolean);
  if (!ids.length) return {};

  const answers = input.answers && typeof input.answers === "object" ? input.answers : {};
  const hasAnswers = Boolean(answers.age && answers.interest);

  if (hasAnswers) {
    const pool = KIDS_SCORE_HUSTLES.filter((h) => h.audiences.includes(mode));
    const byId = new Map(pool.map((h) => [h.id, h]));
    const scores = ids.map((id) => {
      const h = byId.get(id);
      return { id, score: h ? scoreKidsHustle(h, answers) : 0 };
    });
    const max = Math.max(...scores.map((s) => s.score), 1);
    return Object.fromEntries(scores.map((s) => [s.id, Math.round((s.score / max) * 100)]));
  }

  const out: Record<string, number> = {};
  ids.forEach((id, i) => {
    out[id] = Math.max(40, 100 - i * 8);
  });
  return out;
}
