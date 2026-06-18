import {
  editorialActionTime,
  formatEditorialTimeLabel,
  parseIsoDate,
  type EditorialCalendarEvent,
} from "@/lib/content-factory/weekly-editorial-schedule";

export interface DailyChecklistItem {
  date: string;
  time: string;
  timeLabel: string;
  event: EditorialCalendarEvent;
  sortKey: string;
}

export function buildDailyChecklistItems(
  events: EditorialCalendarEvent[],
): DailyChecklistItem[] {
  return events
    .map((event) => {
      const time = editorialActionTime(event.type, event.milestone);
      return {
        date: event.date,
        time,
        timeLabel: formatEditorialTimeLabel(time),
        event,
        sortKey: `${event.date}T${time}:${event.milestone}:${event.type}:${event.slotIndex}`,
      };
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export function groupDailyChecklistByDate(
  items: DailyChecklistItem[],
): { date: string; label: string; items: DailyChecklistItem[] }[] {
  const map = new Map<string, DailyChecklistItem[]>();
  for (const item of items) {
    const list = map.get(item.date) ?? [];
    list.push(item);
    map.set(item.date, list);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayItems]) => ({
      date,
      label: formatChecklistDayLabel(date),
      items: dayItems,
    }));
}

export function formatChecklistDayLabel(isoDate: string): string {
  const d = parseIsoDate(isoDate);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatShortDayLabel(isoDate: string): string {
  const d = parseIsoDate(isoDate);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shiftIsoDate(isoDate: string, days: number): string {
  const d = parseIsoDate(isoDate);
  d.setDate(d.getDate() + days);
  return formatIsoDate(d);
}

export function weekIsoDates(weekStartMonday: Date): string[] {
  const start = new Date(weekStartMonday);
  start.setHours(12, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return formatIsoDate(day);
  });
}

export function isoDateInWeek(isoDate: string, weekStartMonday: Date): boolean {
  return weekIsoDates(weekStartMonday).includes(isoDate);
}

export function checklistItemsForDate(
  events: EditorialCalendarEvent[],
  isoDate: string,
): DailyChecklistItem[] {
  return buildDailyChecklistItems(events).filter((item) => item.date === isoDate);
}
