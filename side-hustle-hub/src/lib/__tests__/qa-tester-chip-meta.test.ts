import { describe, expect, it } from "vitest";
import {
  emptyTally,
  formatTesterResultMeta,
  testerPassedCount,
  testerStatusCountItems,
  testerStatusLegendItems,
  testStatusAbbrev,
  testStatusTooltip,
} from "../../components/admin/QaProgressBars";

describe("testerPassedCount / formatTesterResultMeta", () => {
  it("uses P/CP/F/B/FXR/FC/FD/R abbreviations with counts", () => {
    const tally = {
      ...emptyTally(),
      pass: 2,
      conditional_approval: 3,
      fail: 15,
      blocked: 1,
      fixed_retest: 4,
      fixed_cursor: 5,
      failed_retest: 1,
      not_run: 4,
      total: 35,
    };
    expect(testerPassedCount(tally)).toBe(5);
    const items = testerStatusCountItems(tally);
    expect(items.map((i) => i.abbrev)).toEqual(["P", "CP", "F", "B", "FXR", "FC", "FD/R"]);
    expect(formatTesterResultMeta(tally)).toBe("P=2 · CP=3 · F=15 · B=1 · FXR=4 · FC=5 · FD/R=1");
    expect(formatTesterResultMeta(tally)).not.toContain("NS");
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
    expect(legend.map((i) => i.abbrev)).toEqual(["P", "CP", "F", "B", "FXR", "FC", "FD/R"]);
    expect(legend.find((i) => i.abbrev === "CP")?.label).toBe("Conditional Pass");
    expect(legend.find((i) => i.abbrev === "FC")?.tip).toMatch(/Cursor/i);
  });
});
