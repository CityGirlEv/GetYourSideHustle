import { describe, expect, it } from "vitest";
import {
  emptyTally,
  formatTesterResultMeta,
  testerPassedCount,
  testerStatusCountItems,
  testerStatusCountsTitle,
  testerStatusLegendItems,
  testStatusAbbrev,
  testStatusTooltip,
} from "../../components/admin/QaProgressBars";

describe("testerPassedCount / formatTesterResultMeta", () => {
  it("includes Tot + every status abbrev (P…RO·IP·NS) with counts", () => {
    const tally = {
      ...emptyTally(),
      pass: 2,
      conditional_approval: 3,
      fail: 15,
      blocked: 1,
      fixed_retest: 4,
      fixed_cursor: 5,
      failed_retest: 1,
      rolled_over: 4,
      in_progress: 2,
      not_run: 54,
      total: 91,
    };
    expect(testerPassedCount(tally)).toBe(5);
    const items = testerStatusCountItems(tally);
    expect(items.map((i) => i.abbrev)).toEqual([
      "P",
      "CP",
      "F",
      "B",
      "FXR",
      "FC",
      "FD/R",
      "RO",
      "IP",
      "NS",
    ]);
    expect(formatTesterResultMeta(tally)).toBe(
      "Tot=91 · P=2 · CP=3 · F=15 · B=1 · FXR=4 · FC=5 · FD/R=1 · RO=4 · IP=2 · NS=54",
    );
    expect(formatTesterResultMeta(tally)).toContain("NS=54");
    expect(testerStatusCountsTitle()).toContain("NS=Not Started");
    expect(testerStatusCountsTitle()).toContain("Tot=total assigned");
  });

  it("still lists zeros so all tester numbers stay visible", () => {
    const tally = {
      ...emptyTally(),
      pass: 2,
      total: 2,
    };
    expect(testerStatusCountItems(tally).find((i) => i.key === "fail")?.count).toBe(0);
    expect(formatTesterResultMeta(tally)).toContain("F=0");
    expect(formatTesterResultMeta(tally)).toContain("P=2");
    expect(formatTesterResultMeta(tally)).toContain("Tot=2");
    expect(formatTesterResultMeta(tally)).toContain("NS=0");
  });

  it("maps status ids to short labels and tooltips", () => {
    expect(testStatusAbbrev("conditional_approval")).toBe("CP");
    expect(testStatusAbbrev("fixed_retest")).toBe("FXR");
    expect(testStatusAbbrev("failed_retest")).toBe("FD/R");
    expect(testStatusAbbrev("fixed_cursor")).toBe("FC");
    expect(testStatusAbbrev("not_run")).toBe("NS");
    expect(testStatusTooltip("pass", 6)).toContain("P = Pass");
    expect(testStatusTooltip("pass", 6)).toContain("(6)");
    expect(testStatusTooltip("failed_retest")).toContain("FD/R = Failed/Re-Test");
  });

  it("exposes a legend grid matching chip abbreviations", () => {
    const legend = testerStatusLegendItems();
    expect(legend.map((i) => i.abbrev)).toEqual([
      "P",
      "CP",
      "F",
      "B",
      "FXR",
      "FC",
      "FD/R",
      "RO",
      "IP",
      "NS",
    ]);
    expect(legend.find((i) => i.abbrev === "CP")?.label).toBe("Conditional Pass");
    expect(legend.find((i) => i.abbrev === "FC")?.tip).toMatch(/Cursor/i);
    expect(legend.find((i) => i.abbrev === "NS")?.label).toBe("Not Started");
  });
});
