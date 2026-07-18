import { getArticleTopicDraft } from "@/lib/medicare-complaint-topics";
import { editorialWeekIndex } from "@/lib/content-factory/weekly-editorial-schedule";

/** Three Learning Center articles per editorial week (after Week 1 kickoff). Cycles when exhausted. */
export const EDITORIAL_WEEKLY_ARTICLE_TOPICS: readonly (readonly string[])[] = [
  ["prior-auth-overview", "medigap-window", "zero-premium-explained"],
  ["network-changes", "working-past-65", "part-d-formulary"],
  ["prior-auth-appeals", "irmaa-shock", "annual-review-checklist"],
  ["out-of-network-surprises", "part-b-late-penalty", "plan-booklet-overload"],
  ["advantage-to-medigap", "switch-to-original", "tv-ad-perks"],
];

export function editorialArticleTopicIdForSlot(weekStart: Date, slotIndex: number): string {
  const weekIdx = Math.max(0, editorialWeekIndex(weekStart));
  const plan =
    EDITORIAL_WEEKLY_ARTICLE_TOPICS[weekIdx % EDITORIAL_WEEKLY_ARTICLE_TOPICS.length] ??
    EDITORIAL_WEEKLY_ARTICLE_TOPICS[0]!;
  return plan[slotIndex % plan.length] ?? plan[0]!;
}

function facebookPromoTitle(articleTitle: string): string {
  if (/^\?/.test(articleTitle.trim())) return articleTitle;
  if (/^what is /i.test(articleTitle)) return `New guide: ${articleTitle}`;
  if (/^the /i.test(articleTitle)) return articleTitle;
  return `Share: ${articleTitle}`;
}

/** Default calendar titles for the editorial week — rotates so Week 2+ is not Week 1 repeats. */
export function editorialDefaultTitlesForWeek(weekStart: Date): Record<string, string> {
  const titles: Record<string, string> = {};
  for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
    const topicId = editorialArticleTopicIdForSlot(weekStart, slotIndex);
    const draft = getArticleTopicDraft(topicId);
    if (!draft) continue;
    titles[`article:${slotIndex}`] = draft.title;
    titles[`facebook_post:${slotIndex}`] = facebookPromoTitle(draft.title);
  }
  return titles;
}

export function draftMatchesEditorialWeekTopic(
  draft: { payload?: unknown } | undefined,
  weekStart: Date,
  slotIndex: number,
): boolean {
  if (!draft?.payload || typeof draft.payload !== "object") return false;
  const topicId = (draft.payload as { topicId?: string }).topicId;
  return topicId === editorialArticleTopicIdForSlot(weekStart, slotIndex);
}
