import { describe, expect, it } from "vitest";
import {
  buildEditorialCalendar,
  buildPreLaunchEditorialCalendar,
  buildWeeklyEditorialCalendar,
  editorialActionTime,
  EDITORIAL_ENTITY_READY_DATE,
  EDITORIAL_ROUND_START_DATE,
  editorialLaunchWeekStart,
  DOCTOR_NETWORK_CONTENT_DATE,
  editorialWeekStart,
  isDoctorNetworkContentWeek,
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

  it("creates produce and launch events for weekly assets (FB + image prompts folded into parent tasks)", () => {
    const events = buildWeeklyEditorialCalendar({ weekStart: launchWeekStart });
    const produce = events.filter((e) => e.milestone === "produce");
    const launch = events.filter((e) => e.milestone === "launch");
    expect(produce).toHaveLength(6);
    expect(launch.length).toBeGreaterThan(0);
    expect(events.some((e) => e.type === "image_prompt")).toBe(false);
    expect(events.some((e) => e.type === "facebook_post" && e.milestone === "produce")).toBe(
      false,
    );
    const fbPosts = events.filter((e) => e.type === "facebook_post" && e.slotIndex >= 0);
    expect(fbPosts.every((e) => e.milestone === "launch")).toBe(true);
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
    expect(article1Launch?.title).toMatch(/Prior Authorization/i);
    expect(events.some((e) => e.id === "library:promote")).toBe(true);
  });

  it("aligns Facebook article promos with article launch days when library exists", () => {
    const events = buildWeeklyEditorialCalendar({
      weekStart: launchWeekStart,
      publishedArticleCount: 12,
    });
    const fbPriorAuth = events.find(
      (e) => e.type === "facebook_post" && e.slotIndex === 0 && e.milestone === "launch",
    );
    const fbMedigap = events.find(
      (e) => e.type === "facebook_post" && e.slotIndex === 1 && e.milestone === "launch",
    );
    const fbZeroPremium = events.find(
      (e) => e.type === "facebook_post" && e.slotIndex === 2 && e.milestone === "launch",
    );
    expect(fbPriorAuth?.date).toBe("2026-06-23");
    expect(fbMedigap?.date).toBe("2026-06-21");
    expect(fbZeroPremium?.date).toBe("2026-06-25");
  });

  it("keeps June 24 and June 25 distinct from earlier week days", () => {
    const events = buildWeeklyEditorialCalendar({
      weekStart: launchWeekStart,
      publishedArticleCount: 12,
      leadMagnetPdfSavedBySlot: { "lead_magnet:0": true },
    });
    const june24 = events.filter((e) => e.date === "2026-06-24");
    const june25 = events.filter((e) => e.date === "2026-06-25");
    const june21 = events.filter((e) => e.date === "2026-06-21");

    expect(june24.some((e) => e.type === "facebook_post" && e.slotIndex === 1)).toBe(false);
    expect(june24.some((e) => e.type === "article" && e.slotIndex === 1 && e.milestone === "launch")).toBe(
      false,
    );
    expect(june24.some((e) => e.id === "facebook_invite:launch")).toBe(true);
    expect(june24.some((e) => e.type === "faq" && e.milestone === "launch")).toBe(true);

    expect(june25.some((e) => e.type === "article" && e.slotIndex === 2 && e.milestone === "launch")).toBe(
      true,
    );
    expect(june25.some((e) => e.type === "facebook_post" && e.slotIndex === 2)).toBe(true);
    expect(june25.some((e) => e.type === "facebook_post" && e.slotIndex === 1)).toBe(false);
    expect(june21.some((e) => e.type === "facebook_post" && e.slotIndex === 1)).toBe(true);
  });

  it("still shows a Facebook post launch when that slot is checked off elsewhere in the week", () => {
    const events = buildWeeklyEditorialCalendar({
      weekStart: launchWeekStart,
      publishedArticleCount: 12,
      completedFacebookPostSlots: new Set([1]),
    });
    const fb = events.find(
      (e) => e.type === "facebook_post" && e.slotIndex === 1 && e.milestone === "launch",
    );
    expect(fb).toBeDefined();
    expect(fb?.alreadyComplete).toBe(true);
  });

  it("keeps June 21 and June 23 calendar tasks distinct when library exists", () => {
    const events = buildWeeklyEditorialCalendar({
      weekStart: launchWeekStart,
      publishedArticleCount: 12,
    });
    const june21 = events.filter((e) => e.date === "2026-06-21");
    const june23 = events.filter((e) => e.date === "2026-06-23");
    expect(june21.some((e) => e.type === "facebook_post" && e.slotIndex === 4)).toBe(true);
    expect(june21.some((e) => e.type === "facebook_post" && e.slotIndex === 1)).toBe(true);
    expect(june23.some((e) => e.type === "article" && e.slotIndex === 0 && e.milestone === "launch")).toBe(
      true,
    );
    expect(june23.some((e) => e.type === "facebook_post" && e.slotIndex === 0)).toBe(true);
    expect(june23.some((e) => e.type === "facebook_post" && e.slotIndex === 1)).toBe(false);
    expect(june23.some((e) => e.type === "lead_magnet" && e.milestone === "launch")).toBe(false);
    expect(june21.some((e) => e.type === "lead_magnet" && e.milestone === "launch")).toBe(true);
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
    expect(launch.date).toBe("2026-06-21");
    expect(produce.date < launch.date).toBe(true);
  });

  it("still shows lead magnet launch when workbook PDF is already saved", () => {
    const events = buildWeeklyEditorialCalendar({
      weekStart: launchWeekStart,
      publishedArticleCount: 12,
      leadMagnetPdfSavedBySlot: { "lead_magnet:0": true },
    });
    const launch = events.find((e) => e.type === "lead_magnet" && e.milestone === "launch");
    expect(launch).toBeDefined();
    expect(launch?.alreadyComplete).toBe(true);
    const produce = events.find((e) => e.type === "lead_magnet" && e.milestone === "produce");
    expect(produce?.alreadyComplete).toBe(true);
  });

  it("builds go-live sprint before kickoff", () => {
    const events = buildPreLaunchEditorialCalendar(sprintWeekStart);
    expect(events).toHaveLength(5);
    expect(events.every((e) => e.category === "prelaunch")).toBe(true);
    expect(events[0]?.title).toMatch(/Delaware LLC/i);
    expect(events.at(-1)?.title).toMatch(/Go live/i);
    expect(events.at(-1)?.date).toBe("2026-06-19");
  });

  it("schedules doctor network article and Facebook post on June 9", () => {
    const june9 = parseIsoDate("2026-06-09");
    expect(isDoctorNetworkContentWeek(june9)).toBe(true);
    const events = buildEditorialCalendar({ weekStart: june9, today: june9 });
    const doctorFb = events.find(
      (e) => e.type === "facebook_post" && e.slotIndex === 5 && e.milestone === "launch",
    );
    expect(doctorFb?.date).toBe(DOCTOR_NETWORK_CONTENT_DATE);
    expect(events.some((e) => e.id === "early:doctor-network:article:launch")).toBe(true);
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
