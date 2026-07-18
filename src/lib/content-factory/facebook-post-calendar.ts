/**
 * Facebook post calendar helpers — one combined “post” task (image + copy + publish).
 */

import {
  buildEditorialCalendar,
  buildWeeklyEditorialCalendar,
  DOCTOR_NETWORK_CONTENT_DATE,
  editorialActionTime,
  editorialLaunchWeekStart,
  formatEditorialTimeLabel,
  parseIsoDate,
  type EditorialCalendarEvent,
} from "@/lib/content-factory/weekly-editorial-schedule";

export interface FacebookPostSchedule {
  postDate: string;
  postTime: string;
  /** e.g. "Thursday, Jun 23, 2026" */
  postDateLabel: string;
}

/** Image prompt draft slot paired with weekly articles 0–2 (hero images). */
export function articleImagePromptSlot(articleSlotIndex: number): number | null {
  if (articleSlotIndex >= 0 && articleSlotIndex <= 2) return articleSlotIndex;
  return null;
}

export function facebookPostImagePromptSlot(fbSlotIndex: number): number | null {
  if (fbSlotIndex >= 0 && fbSlotIndex <= 2) return fbSlotIndex;
  if (fbSlotIndex === 4) return 3;
  if (fbSlotIndex === 6) return 4;
  return null;
}

export function facebookPostUsesCombinedTask(): boolean {
  return true;
}

export function formatFacebookPostDateLabel(isoDate: string): string {
  return parseIsoDate(isoDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function addFacebookLaunchSchedules(
  map: Map<number, FacebookPostSchedule>,
  events: EditorialCalendarEvent[],
  postTime: string,
) {
  for (const event of events) {
    if (event.type !== "facebook_post" || event.milestone !== "launch" || event.slotIndex < 0) {
      continue;
    }
    map.set(event.slotIndex, {
      postDate: event.date,
      postTime,
      postDateLabel: formatFacebookPostDateLabel(event.date),
    });
  }
}

/** Editorial calendar post date/time for each Facebook post slot in the active batch. */
export function buildFacebookPostScheduleBySlot(options: {
  titles?: Record<string, string>;
} = {}): Map<number, FacebookPostSchedule> {
  const postTime = formatEditorialTimeLabel(editorialActionTime("facebook_post", "launch"));
  const map = new Map<number, FacebookPostSchedule>();

  addFacebookLaunchSchedules(
    map,
    buildWeeklyEditorialCalendar({
      weekStart: editorialLaunchWeekStart(),
      titles: options.titles,
    }),
    postTime,
  );

  addFacebookLaunchSchedules(
    map,
    buildEditorialCalendar({
      weekStart: parseIsoDate(DOCTOR_NETWORK_CONTENT_DATE),
      titles: options.titles,
    }),
    postTime,
  );

  return map;
}
