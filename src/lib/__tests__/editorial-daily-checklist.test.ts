import { describe, expect, it } from "vitest";
import {
  checklistItemsForDate,
  shiftIsoDate,
  weekIsoDates,
} from "@/lib/content-factory/editorial-daily-checklist";
import {
  buildWeeklyEditorialCalendar,
  editorialLaunchWeekStart,
} from "@/lib/content-factory/weekly-editorial-schedule";

describe("editorial-daily-checklist", () => {
  const weekStart = editorialLaunchWeekStart(); // Fri Jun 19, 2026

  it("returns seven ISO dates for a Week 1 Friday kickoff", () => {
    expect(weekIsoDates(weekStart)).toEqual([
      "2026-06-19",
      "2026-06-20",
      "2026-06-21",
      "2026-06-22",
      "2026-06-23",
      "2026-06-24",
      "2026-06-25",
    ]);
  });

  it("shifts ISO dates by day offset", () => {
    expect(shiftIsoDate("2026-06-17", 1)).toBe("2026-06-18");
    expect(shiftIsoDate("2026-06-17", -1)).toBe("2026-06-16");
  });

  it("filters checklist items to a single day sorted by time", () => {
    const events = buildWeeklyEditorialCalendar({ weekStart });
    const kickoff = checklistItemsForDate(events, "2026-06-19");
    expect(kickoff.length).toBeGreaterThan(0);
    expect(kickoff.every((item) => item.date === "2026-06-19")).toBe(true);
  });
});
