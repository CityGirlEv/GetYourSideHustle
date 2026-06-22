import { describe, expect, it } from "vitest";
import {
  buildEditorialCalendar,
  buildPreLaunchEditorialCalendar,
  buildWeeklyEditorialCalendar,
  editorialActionTime,
  EDITORIAL_ENTITY_READY_DATE,
  EDITORIAL_ROUND_START_DATE,
  editorialLaunchWeekStart,
  editorialWeekStart,
  formatLaunchWeekLabel,
  hasExistingArticleLibrary,
  formatEditorialTimeLabel,
  isLaunchWeek,
  isPreLaunchWeek,
  LEAD_MAGNET_PURPOSE,
  parseIsoDate,
  publishedLearningCenterArticleCount,
  startOfWeekSaturday,
  weeksBeforeLaunch,
} from "@/lib/content-factory/weekly-editorial-schedule";
import { weeklyBatchAssetTotal } from "@/lib/content-factory/types";

describe("weekly-editorial-schedule", () => {
  const sprintWeekStart = new Date(2026, 5, 13); // Sat Jun 13 — one week before kickoff
  const launchWeekStart = editorialLaunchWeekStart();

  it("documents lead magnet purpose", () => {
    expect(LEAD_MAGNET_PURPOSE).toMatch(/PDF workbook/i);
    expect(LEAD_MAGNET_PURPOSE).toMatch(/email/i);
  });

  it("targets Week 1 starting Friday June 19", () => {
    expect(EDITORIAL_ENTITY_READY_DATE).toBe("2026-06-19");
    expect(EDITORIAL_ROUND_START_DATE).toBe("2026-06-19");
    expect(formatIsoDate(launchWeekStart)).toBe("2026-06-19");
    expect(formatLaunchWeekLabel()).toBe("Jun 19, 2026 – Jun 25, 2026");
  });

  it("anchors editorial weeks on Friday kickoff then Saturday", () => {
    expect(formatIsoDate(editorialWeekStart(new Date(2026, 5, 19)))).toBe("2026-06-19");
    expect(formatIsoDate(editorialWeekStart(new Date(2026, 5, 25)))).toBe("2026-06-19");
    expect(formatIsoDate(editorialWeekStart(new Date(2026, 5, 26)))).toBe("2026-06-26");
    expect(formatIsoDate(startOfWeekSaturday(new Date(2026, 5, 17)))).toBe("2026-06-13");
  });

  it("creates produce and launch events for every weekly asset", () => {
    const events = buildWeeklyEditorialCalendar({ weekStart: launchWeekStart });
    const produce = events.filter((e) => e.milestone === "produce");
    const launch = events.filter((e) => e.milestone === "launch");
    expect(produce).toHaveLength(weeklyBatchAssetTotal());
    expect(launch.length).toBeGreaterThan(0);
  });

  it("schedules Facebook page invites on Wednesday of Week 1", () => {
    const events = buildWeeklyEditorialCalendar({ weekStart: launchWeekStart });
    const invite = events.find((e) => e.id === "facebook_invite:launch");
    expect(invite?.date).toBe("2026-06-24");
    expect(invite?.title).toMatch(/Invite network/i);
  });

  it("detects existing Learning Center library (10+ published)", () => {
    const count = publishedLearningCenterArticleCount();
    expect(count).toBeGreaterThanOrEqual(10);
    expect(hasExistingArticleLibrary(count)).toBe(true);
  });

  it("publishes first new article on Tuesday when library already live", () => {
    const events = buildWeeklyEditorialCalendar({
      weekStart: launchWeekStart,
      publishedArticleCount: 12,
    });
    const article1Launch = events.find(
      (e) => e.type === "article" && e.slotIndex === 0 && e.milestone === "launch",
    );
    expect(article1Launch?.date).toBe("2026-06-23");
    expect(article1Launch?.title).toMatch(/Article 13/);
    expect(events.some((e) => e.id === "library:promote")).toBe(true);
  });

  it("publishes article 1 on kickoff day when starting from zero", () => {
    const events = buildWeeklyEditorialCalendar({
      weekStart: launchWeekStart,
      publishedArticleCount: 0,
    });
    const article1Launch = events.find(
      (e) => e.type === "article" && e.slotIndex === 0 && e.milestone === "launch",
    );
    expect(article1Launch?.date).toBe("2026-06-19");
  });

  it("schedules lead magnet produce before launch in kickoff week", () => {
    const events = buildWeeklyEditorialCalendar({
      weekStart: launchWeekStart,
      publishedArticleCount: 12,
    });
    const produce = events.find((e) => e.type === "lead_magnet" && e.milestone === "produce")!;
    const launch = events.find((e) => e.type === "lead_magnet" && e.milestone === "launch")!;
    expect(produce.date).toBe("2026-06-20");
    expect(launch.date).toBe("2026-06-23");
    expect(produce.date < launch.date).toBe(true);
  });

  it("builds go-live sprint before kickoff", () => {
    const events = buildPreLaunchEditorialCalendar(sprintWeekStart);
    expect(events).toHaveLength(5);
    expect(events.every((e) => e.category === "prelaunch")).toBe(true);
    expect(events[0]?.title).toMatch(/Delaware LLC/i);
    expect(events.at(-1)?.title).toMatch(/Go live/i);
    expect(events.at(-1)?.date).toBe("2026-06-19");
  });

  it("uses pre-launch sprint during the week before kickoff", () => {
    const events = buildEditorialCalendar({ weekStart: sprintWeekStart, today: new Date(2026, 5, 10) });
    expect(events.every((e) => e.category === "prelaunch")).toBe(true);
    expect(isPreLaunchWeek(sprintWeekStart)).toBe(true);
    expect(isLaunchWeek(sprintWeekStart)).toBe(false);
  });

  it("uses kickoff content schedule on Week 1", () => {
    expect(isPreLaunchWeek(launchWeekStart)).toBe(false);
    expect(isLaunchWeek(launchWeekStart)).toBe(true);
    const events = buildEditorialCalendar({ weekStart: launchWeekStart });
    expect(events.some((e) => e.type === "article" && e.milestone === "launch")).toBe(true);
  });

  it("counts weeks before kickoff from Saturday anchors", () => {
    expect(weeksBeforeLaunch(parseIsoDate("2026-05-30"))).toBe(3);
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
