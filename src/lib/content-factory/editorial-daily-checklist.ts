import {
  editorialActionTime,
  editorialWeekStart,
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
      const time = event.actionTime ?? editorialActionTime(event.type, event.milestone);
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

export function weekIsoDates(weekStart: Date): string[] {
  const start = editorialWeekStart(weekStart);
  start.setHours(12, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return formatIsoDate(day);
  });
}

export function isoDateInWeek(isoDate: string, weekStart: Date): boolean {
  return weekIsoDates(weekStart).includes(isoDate);
}

export function calendarMonthStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(1);
  return d;
}

export function shiftCalendarMonth(monthStart: Date, months: number): Date {
  const d = new Date(monthStart);
  d.setMonth(d.getMonth() + months);
  return calendarMonthStart(d);
}

export function formatCalendarMonthLabel(monthStart: Date): string {
  return monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function isoDateInMonth(isoDate: string, monthStart: Date): boolean {
  const d = parseIsoDate(isoDate);
  return d.getMonth() === monthStart.getMonth() && d.getFullYear() === monthStart.getFullYear();
}

/** Six-week Sun–Sat grid covering a calendar month (includes leading/trailing days). */
export function monthGridCells(monthStart: Date): Array<{ isoDate: string; inMonth: boolean }> {
  const month = monthStart.getMonth();
  const year = monthStart.getFullYear();
  const first = new Date(year, month, 1, 12, 0, 0, 0);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return {
      isoDate: formatIsoDate(day),
      inMonth: day.getMonth() === month && day.getFullYear() === year,
    };
  });
}

export function checklistItemsForDate(
  events: EditorialCalendarEvent[],
  isoDate: string,
): DailyChecklistItem[] {
  return buildDailyChecklistItems(events).filter((item) => item.date === isoDate);
}
