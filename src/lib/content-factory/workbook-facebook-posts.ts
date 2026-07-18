import type { ContentDraft } from "@/lib/content-factory/types";
import type { CalendarDraftRef } from "@/lib/content-factory/editorial-calendar-links";
import { getDraftFromMap } from "@/lib/content-factory/editorial-calendar-links";
import type { EditorialCalendarEvent } from "@/lib/content-factory/weekly-editorial-schedule";

/** Facebook Post 4 — publish on the Part B Optimizer Benchmark Tool Facebook Page. */
export const WORKBOOK_PAGE_FB_SLOT = 3;

/** Facebook Post 8 — share to your personal profile and tag friends (after the page post). */
export const WORKBOOK_PERSONAL_FB_SLOT = 7;

export function isWorkbookFacebookSlot(slotIndex: number): boolean {
  return slotIndex === WORKBOOK_PAGE_FB_SLOT || slotIndex === WORKBOOK_PERSONAL_FB_SLOT;
}

/** Hide the personal-share slot as its own calendar row — it lives in the workbook posts panel. */
export function hideStandaloneWorkbookPersonalPost(event: EditorialCalendarEvent): boolean {
  return event.type === "facebook_post" && event.slotIndex === WORKBOOK_PERSONAL_FB_SLOT;
}

export function shouldShowWorkbookFacebookPostsPanel(event: EditorialCalendarEvent): boolean {
  if (hideStandaloneWorkbookPersonalPost(event)) return false;
  return event.type === "lead_magnet" && event.milestone === "produce";
}

export function workbookFacebookDrafts(
  draftBySlot: Map<string, CalendarDraftRef>,
): { page?: CalendarDraftRef; personal?: CalendarDraftRef } {
  return {
    page: getDraftFromMap(draftBySlot, "facebook_post", WORKBOOK_PAGE_FB_SLOT),
    personal: getDraftFromMap(draftBySlot, "facebook_post", WORKBOOK_PERSONAL_FB_SLOT),
  };
}

export function isWorkbookPromoFacebookPost(
  draft: Pick<ContentDraft, "slotIndex" | "title" | "body">,
): boolean {
  return isWorkbookFacebookSlot(draft.slotIndex) || /planning workbook/i.test(draft.title);
}

export const WORKBOOK_FB_POST_LABELS: Record<number, string> = {
  [WORKBOOK_PAGE_FB_SLOT]: "Step 1 — Facebook Page post (10:30 AM)",
  [WORKBOOK_PERSONAL_FB_SLOT]: "Step 2 — Personal profile share (tag friends)",
};
