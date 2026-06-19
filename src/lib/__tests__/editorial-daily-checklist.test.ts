import { describe, expect, it } from "vitest";
import {
  checklistItemsForDate,
  shiftIsoDate,
  weekIsoDates,
} from "@/lib/content-factory/editorial-daily-checklist";
import { buildWeeklyEditorialCalendar } from "@/lib/content-factory/weekly-editorial-schedule";

describe("editorial-daily-checklist", () => {
  const weekStart = new Date(2026, 5, 13); // Sat Jun 13, 2026

  it("returns seven ISO dates for a Saturday-start week", () => {
    expect(weekIsoDates(weekStart)).toEqual([
      "2026-06-13",
      "2026-06-14",
      "2026-06-15",
      "2026-06-16",
      "2026-06-17",
      "2026-06-18",
      "2026-06-19",
    ]);
  });

  it("shifts ISO dates by day offset", () => {
    expect(shiftIsoDate("2026-06-17", 1)).toBe("2026-06-18");
    expect(shiftIsoDate("2026-06-17", -1)).toBe("2026-06-16");
  });

  it("filters checklist items to a single day sorted by time", () => {
    const events = buildWeeklyEditorialCalendar({ weekStart });
    const wed = checklistItemsForDate(events, "2026-06-17");
    expect(wed.length).toBeGreaterThan(0);
    expect(wed.every((item) => item.date === "2026-06-17")).toBe(true);
  });
});
