/**
 * Kids / Teens Match Wizard scoring + relative match % (top score = 100%).
 * Shared by the wizard UI and D1 backfill scripts.
 */

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

/** Tag catalog only — display copy lives in KidsCorner. */
export const KIDS_SCORE_HUSTLES: KidsScoreHustle[] = [
  {
    id: "dog-walk",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["animals", "outdoors"],
      place: ["outdoor"],
      time: ["short", "medium"],
    },
  },
  {
    id: "yard-help",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["outdoors", "helping"],
      place: ["outdoor"],
      time: ["medium", "long"],
    },
  },
  {
    id: "crafts",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["young", "mid", "older"],
      interests: ["creative"],
      place: ["indoor", "either"],
      time: ["short", "medium", "long"],
    },
  },
  {
    id: "tech-helper",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["tech", "helping"],
      place: ["indoor", "either"],
      time: ["short", "medium"],
    },
  },
  {
    id: "homework",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["older"],
      interests: ["helping"],
      place: ["indoor", "either"],
      time: ["short", "medium"],
    },
  },
  {
    id: "book-publishing-kids",
    audiences: ["kids", "junior"],
    tags: {
      ages: ["young", "mid", "older"],
      interests: ["creative"],
      place: ["indoor", "either"],
      time: ["medium", "long"],
    },
  },
  {
    id: "create-games-kids",
    audiences: ["kids"],
    tags: {
      ages: ["young", "mid"],
      interests: ["creative", "tech", "ai"],
      place: ["indoor"],
      time: ["short", "medium", "long"],
    },
  },
  {
    id: "create-games-junior",
    audiences: ["junior"],
    tags: {
      ages: ["mid", "older"],
      interests: ["creative", "tech", "ai"],
      place: ["indoor"],
      time: ["medium", "long"],
    },
  },
];

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
    const maxScore = Math.max(...scores.map((s) => s.score), 1);
    return Object.fromEntries(
      scores.map((s) => [s.id, Math.round((s.score / maxScore) * 100)]),
    );
  }

  // Rank fallback when answers are missing — preserves saved order.
  const n = ids.length;
  return Object.fromEntries(
    ids.map((id, i) => [id, Math.max(40, Math.round(100 - (i * 60) / Math.max(n - 1, 1)))]),
  );
}
