import { describe, expect, it } from "vitest";
import {
  buildEditorialCalendar,
  buildPreLaunchEditorialCalendar,
  buildWeeklyEditorialCalendar,
  editorialActionTime,
  EDITORIAL_EARLIEST_LAUNCH_FRIDAY,
  EDITORIAL_LAUNCH_WEEK_SATURDAY,
  editorialLaunchWeekStart,
  formatEditorialTimeLabel,
  formatLaunchWeekLabel,
  isLaunchWeek,
  isPreLaunchWeek,
  LEAD_MAGNET_PURPOSE,
  parseIsoDate,
  startOfWeekSaturday,
  weeksBeforeLaunch,
} from "@/lib/content-factory/weekly-editorial-schedule";
import { weeklyBatchAssetTotal } from "@/lib/content-factory/types";

describe("weekly-editorial-schedule", () => {
  const sprintWeekStart = new Date(2026, 5, 13); // Sat Jun 13 — one week before launch
  const launchWeekStart = editorialLaunchWeekStart();

  it("documents lead magnet purpose", () => {
    expect(LEAD_MAGNET_PURPOSE).toMatch(/PDF workbook/i);
    expect(LEAD_MAGNET_PURPOSE).toMatch(/email/i);
  });

  it("targets accelerated Friday/Saturday go-live", () => {
    expect(EDITORIAL_EARLIEST_LAUNCH_FRIDAY).toBe("2026-06-19");
    expect(EDITORIAL_LAUNCH_WEEK_SATURDAY).toBe("2026-06-20");
    expect(formatIsoDate(launchWeekStart)).toBe("2026-06-20");
    expect(formatLaunchWeekLabel()).toBe("Jun 20, 2026 – Jun 26, 2026");
  });

  it("starts editorial weeks on Saturday", () => {
    expect(formatIsoDate(startOfWeekSaturday(new Date(2026, 5, 17)))).toBe("2026-06-13");
    expect(formatIsoDate(startOfWeekSaturday(new Date(2026, 5, 13)))).toBe("2026-06-13");
  });

  it("creates produce and launch events for every weekly asset", () => {
    const events = buildWeeklyEditorialCalendar({ weekStart: launchWeekStart });
    const produce = events.filter((e) => e.milestone === "produce");
    const launch = events.filter((e) => e.milestone === "launch");
    expect(produce).toHaveLength(weeklyBatchAssetTotal());
    expect(launch.length).toBeGreaterThan(0);
  });

  it("schedules lead magnet produce before launch in launch week", () => {
    const events = buildWeeklyEditorialCalendar({ weekStart: launchWeekStart });
    const produce = events.find((e) => e.type === "lead_magnet" && e.milestone === "produce")!;
    const launch = events.find((e) => e.type === "lead_magnet" && e.milestone === "launch")!;
    expect(produce.date).toBe("2026-06-23");
    expect(launch.date).toBe("2026-06-25");
    expect(produce.date < launch.date).toBe(true);
  });

  it("publishes article 1 on Wednesday of launch week", () => {
    const events = buildWeeklyEditorialCalendar({ weekStart: launchWeekStart });
    const article1Launch = events.find(
      (e) => e.type === "article" && e.slotIndex === 0 && e.milestone === "launch",
    );
    expect(article1Launch?.date).toBe("2026-06-24");
  });

  it("builds one-week LLC sprint before launch", () => {
    const events = buildPreLaunchEditorialCalendar(sprintWeekStart);
    expect(events).toHaveLength(5);
    expect(events.every((e) => e.category === "prelaunch")).toBe(true);
    expect(events[0]?.title).toMatch(/File LLC/i);
    expect(events.at(-1)?.title).toMatch(/Go \/ no-go/i);
  });

  it("uses pre-launch sprint during the week before launch", () => {
    const events = buildEditorialCalendar({ weekStart: sprintWeekStart, today: new Date(2026, 5, 17) });
    expect(events.every((e) => e.category === "prelaunch")).toBe(true);
    expect(isPreLaunchWeek(sprintWeekStart)).toBe(true);
    expect(isLaunchWeek(sprintWeekStart)).toBe(false);
  });

  it("uses standard content schedule on launch week", () => {
    expect(isPreLaunchWeek(launchWeekStart)).toBe(false);
    expect(isLaunchWeek(launchWeekStart)).toBe(true);
    const events = buildEditorialCalendar({ weekStart: launchWeekStart });
    expect(events.some((e) => e.type === "article" && e.milestone === "launch")).toBe(true);
  });

  it("counts weeks before launch from Saturday anchors", () => {
    expect(weeksBeforeLaunch(parseIsoDate("2026-06-06"))).toBe(2);
    expect(weeksBeforeLaunch(sprintWeekStart)).toBe(1);
    expect(weeksBeforeLaunch(launchWeekStart)).toBe(0);
  });

  it("formats editorial action times for display", () => {
    expect(formatEditorialTimeLabel(editorialActionTime("facebook_post", "launch"))).toBe(
      "10:30 AM",
    );
    expect(formatEditorialTimeLabel(editorialActionTime("article", "produce"))).toBe("9:00 AM");
  });
});

function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
