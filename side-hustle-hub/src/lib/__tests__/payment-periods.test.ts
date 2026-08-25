import { describe, expect, it } from "vitest";
import {
  addDaysYmd,
  chicagoYmd,
  resolvePaymentPeriodRange,
  startOfQuarterYmd,
  startOfWeekYmd,
  ymdRangeToUnixInclusive,
} from "../payment-periods";

describe("payment-periods", () => {
  it("resolves day / week / month / quarter / year presets", () => {
    const now = new Date("2026-08-22T18:00:00.000Z");
    const day = resolvePaymentPeriodRange("day", { now });
    expect(day.from).toBe(day.to);
    expect(day.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const week = resolvePaymentPeriodRange("week", { now });
    expect(week.from).toBe(startOfWeekYmd(chicagoYmd(now)));
    expect(week.to).toBe(addDaysYmd(week.from, 6));

    const month = resolvePaymentPeriodRange("month", { now });
    expect(month.from.endsWith("-01")).toBe(true);

    const quarter = resolvePaymentPeriodRange("quarter", { now });
    expect(quarter.from).toBe(startOfQuarterYmd(chicagoYmd(now)));

    const year = resolvePaymentPeriodRange("year", { now });
    expect(year.from.endsWith("-01-01")).toBe(true);
    expect(year.to.endsWith("-12-31")).toBe(true);
  });

  it("supports custom ranges and swaps inverted dates", () => {
    const range = resolvePaymentPeriodRange("custom", {
      from: "2026-08-20",
      to: "2026-08-10",
    });
    expect(range.from).toBe("2026-08-10");
    expect(range.to).toBe("2026-08-20");
  });

  it("builds inclusive unix bounds for Stripe filters", () => {
    const { gte, lte } = ymdRangeToUnixInclusive("2026-08-22", "2026-08-22");
    expect(gte).toBeLessThan(lte);
    expect(lte - gte).toBeGreaterThan(20 * 3600);
    expect(lte - gte).toBeLessThan(26 * 3600);
  });
});
