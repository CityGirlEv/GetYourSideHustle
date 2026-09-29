import { describe, expect, it } from "vitest";
import {
  calendarMonthKey,
  remainingShareWinsThisMonth,
  SHARE_WIN_MONTHLY_CAP,
  shareWinsInMonth,
} from "../share-win";

describe("share a win", () => {
  it("caps shares at 2 per calendar month", () => {
    expect(SHARE_WIN_MONTHLY_CAP).toBe(2);
    expect(calendarMonthKey(new Date("2026-09-07T12:00:00.000Z"))).toBe("2026-09");
    const entries = [
      { at: "2026-09-01T10:00:00.000Z", text: "first" },
      { at: "2026-09-15T10:00:00.000Z", text: "second" },
      { at: "2026-08-30T10:00:00.000Z", text: "last month" },
    ];
    const now = new Date("2026-09-20T12:00:00.000Z");
    expect(shareWinsInMonth(entries, now)).toHaveLength(2);
    expect(remainingShareWinsThisMonth(entries, now)).toBe(0);
    expect(remainingShareWinsThisMonth(entries.slice(0, 1), now)).toBe(1);
  });
});
