import { describe, expect, it } from "vitest";
import {
  BLUEPRINT_MAX_DAYS,
  blueprintWindowStats,
  emptyPnLLedger,
  summarizePnLLines,
  upsertPnLLine,
  weeklyOutcomesForBlueprint,
} from "../hustle-schedule-pnl";

describe("hustle schedule P&L", () => {
  it("summarizes sales, expenses, and net profit", () => {
    let ledger = emptyPnLLedger();
    ledger = upsertPnLLine(ledger, {
      id: "s1",
      kind: "sale",
      date: "2026-08-17",
      label: "Job",
      amountUsd: 200,
      category: null,
    });
    ledger = upsertPnLLine(ledger, {
      id: "e1",
      kind: "expense",
      date: "2026-08-18",
      label: "Ads",
      amountUsd: 50,
      category: "advertising",
    });
    const s = summarizePnLLines(ledger.lines);
    expect(s.salesUsd).toBe(200);
    expect(s.expensesUsd).toBe(50);
    expect(s.profitUsd).toBe(150);
    expect(s.byCategory.advertising).toBe(50);
  });

  it("keeps blueprint window ≤ 10 days when due is within a week", () => {
    const w = blueprintWindowStats("2026-08-17", "2026-08-23");
    expect(w.days).toBe(7);
    expect(w.weeks).toBe(1);
    expect(w.withinTenDays).toBe(true);
    expect(BLUEPRINT_MAX_DAYS).toBe(10);
  });

  it("flags windows longer than 10 days", () => {
    const w = blueprintWindowStats("2026-08-01", "2026-08-20");
    expect(w.days).toBeGreaterThan(10);
    expect(w.withinTenDays).toBe(false);
  });

  it("builds weekly outcomes for the blueprint span", () => {
    let ledger = emptyPnLLedger();
    ledger = upsertPnLLine(ledger, {
      id: "s1",
      kind: "sale",
      date: "2026-08-18",
      label: "Sale",
      amountUsd: 100,
      category: null,
    });
    const weeks = weeklyOutcomesForBlueprint(ledger.lines, "2026-08-17", "2026-08-23");
    expect(weeks.length).toBe(1);
    expect(weeks[0]!.salesUsd).toBe(100);
    expect(weeks[0]!.profitUsd).toBe(100);
  });
});
