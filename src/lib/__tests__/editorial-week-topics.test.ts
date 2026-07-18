import { describe, expect, it } from "vitest";
import {
  editorialArticleTopicIdForSlot,
  editorialDefaultTitlesForWeek,
} from "@/lib/content-factory/editorial-week-topics";
import { editorialWeekStart, parseIsoDate } from "@/lib/content-factory/weekly-editorial-schedule";
import { buildWeeklyEditorialCalendar } from "@/lib/content-factory/weekly-editorial-schedule";

describe("editorial-week-topics", () => {
  const launchWeek = editorialWeekStart();
  const week2 = parseIsoDate("2026-06-26");

  it("rotates article topics after Week 1 kickoff", () => {
    expect(editorialArticleTopicIdForSlot(launchWeek, 0)).toBe("prior-auth-overview");
    expect(editorialArticleTopicIdForSlot(week2, 0)).toBe("network-changes");
    expect(editorialArticleTopicIdForSlot(week2, 1)).toBe("working-past-65");
    expect(editorialArticleTopicIdForSlot(week2, 2)).toBe("part-d-formulary");
  });

  it("shows different calendar titles for Week 2 vs Week 1", () => {
    const week1Titles = editorialDefaultTitlesForWeek(launchWeek);
    const week2Titles = editorialDefaultTitlesForWeek(week2);
    expect(week1Titles["article:0"]).toMatch(/Prior Authorization/i);
    expect(week2Titles["article:0"]).toMatch(/network/i);
    expect(week2Titles["article:0"]).not.toBe(week1Titles["article:0"]);
  });

  it("buildWeeklyEditorialCalendar uses rotated titles without batch overrides", () => {
    const events = buildWeeklyEditorialCalendar({
      weekStart: week2,
      publishedArticleCount: 15,
    });
    const articleLaunch = events.find(
      (e) => e.type === "article" && e.slotIndex === 0 && e.milestone === "launch",
    );
    expect(articleLaunch?.title).toMatch(/network/i);
    expect(articleLaunch?.title).not.toMatch(/Prior Authorization/i);
  });
});
