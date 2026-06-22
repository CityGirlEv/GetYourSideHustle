import { describe, expect, it } from "vitest";
import {
  calendarMonthStart,
  formatCalendarMonthLabel,
  monthGridCells,
  shiftCalendarMonth,
} from "@/lib/content-factory/editorial-daily-checklist";
import { buildEditorialCalendarForMonth } from "@/lib/content-factory/weekly-editorial-schedule";

describe("editorial month calendar", () => {
  it("builds a six-week Sun–Sat grid for the month", () => {
    const monthStart = calendarMonthStart(new Date(2026, 5, 15));
    const cells = monthGridCells(monthStart);
    expect(cells).toHaveLength(42);
    expect(cells.filter((c) => c.inMonth)).toHaveLength(30);
    expect(cells.some((c) => c.isoDate === "2026-06-01" && c.inMonth)).toBe(true);
  });

  it("shifts calendar months", () => {
    const june = calendarMonthStart(new Date(2026, 5, 19));
    const july = shiftCalendarMonth(june, 1);
    expect(formatCalendarMonthLabel(july)).toMatch(/July 2026/);
  });

  it("merges editorial events across weeks in a month", () => {
    const monthStart = calendarMonthStart(new Date(2026, 5, 1));
    const events = buildEditorialCalendarForMonth(monthStart, { publishedArticleCount: 0 });
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.date.startsWith("2026-06"))).toBe(true);
  });
});
