import { describe, expect, it } from "vitest";
import {
  buildCatchUpEditorialCalendar,
  buildEditorialCalendar,
  buildWeeklyEditorialCalendar,
  editorialActionTime,
  formatEditorialTimeLabel,
  isCatchUpWeek,
  LEAD_MAGNET_PURPOSE,
  startOfWeekMonday,
  wednesdayOfWeek,
} from "@/lib/content-factory/weekly-editorial-schedule";
import { weeklyBatchAssetTotal } from "@/lib/content-factory/types";

describe("weekly-editorial-schedule", () => {
  const weekStart = new Date(2026, 5, 15); // Mon Jun 15, 2026

  it("documents lead magnet purpose", () => {
    expect(LEAD_MAGNET_PURPOSE).toMatch(/PDF workbook/i);
    expect(LEAD_MAGNET_PURPOSE).toMatch(/email/i);
  });

  it("creates produce and launch events for every weekly asset", () => {
    const events = buildWeeklyEditorialCalendar({ weekStart });
    const produce = events.filter((e) => e.milestone === "produce");
    const launch = events.filter((e) => e.milestone === "launch");
    expect(produce).toHaveLength(weeklyBatchAssetTotal());
    expect(launch.length).toBeGreaterThan(0);
    expect(events.some((e) => e.type === "lead_magnet" && e.milestone === "launch")).toBe(true);
    expect(events.some((e) => e.type === "faq")).toBe(true);
    expect(events.some((e) => e.type === "image_prompt")).toBe(true);
  });

  it("schedules lead magnet produce before launch in the same week", () => {
    const events = buildWeeklyEditorialCalendar({ weekStart });
    const produce = events.find((e) => e.type === "lead_magnet" && e.milestone === "produce")!;
    const launch = events.find((e) => e.type === "lead_magnet" && e.milestone === "launch")!;
    expect(produce.date).toBe("2026-06-16");
    expect(launch.date).toBe("2026-06-18");
    expect(produce.date < launch.date).toBe(true);
  });

  it("uses custom draft titles when provided", () => {
    const events = buildWeeklyEditorialCalendar({
      weekStart,
      titles: { "lead_magnet:0": "Medicare at 65 Planning Workbook" },
    });
    expect(events.find((e) => e.type === "lead_magnet")?.title).toBe(
      "Medicare at 65 Planning Workbook",
    );
  });

  it("builds catch-up schedule from Wednesday with article 1 on day one", () => {
    const wed = wednesdayOfWeek(weekStart);
    const events = buildCatchUpEditorialCalendar({ catchUpStart: wed });
    const article1Launch = events.find(
      (e) => e.type === "article" && e.slotIndex === 0 && e.milestone === "launch",
    );
    expect(article1Launch?.date).toBe("2026-06-17");
    expect(events.some((e) => e.type === "facebook_post" && e.slotIndex === 0)).toBe(true);
    expect(events.filter((e) => e.type === "facebook_post")).toHaveLength(13);
  });

  it("uses catch-up for current week when today is Wednesday", () => {
    const today = new Date(2026, 5, 17);
    expect(isCatchUpWeek(weekStart, today)).toBe(true);
    const events = buildEditorialCalendar({ weekStart, today });
    expect(events.some((e) => e.id.includes("catchup"))).toBe(true);
  });

  it("uses standard schedule for next week", () => {
    const nextWeek = new Date(2026, 5, 23);
    const today = new Date(2026, 5, 18);
    expect(isCatchUpWeek(nextWeek, today)).toBe(false);
  });

  it("formats editorial action times for display", () => {
    expect(formatEditorialTimeLabel(editorialActionTime("facebook_post", "launch"))).toBe(
      "10:30 AM",
    );
    expect(formatEditorialTimeLabel(editorialActionTime("article", "produce"))).toBe("9:00 AM");
  });
});
