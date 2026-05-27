import { describe, it, expect } from "vitest";
import {
  BUDGET_LINES,
  computeBudgetTotals,
  totalsByCategory,
  fmtUSD,
  type BudgetLine,
} from "../budget";

const sample: BudgetLine[] = [
  { id: "X1", function: "a", category: "Build · One-time", amount: 1000, unit: "one-time", basis: "" },
  { id: "X2", function: "b", category: "Infra · Recurring", amount: 100, unit: "monthly", basis: "" },
  { id: "X3", function: "c", category: "Compliance & Legal", amount: 1200, unit: "annual", basis: "" },
];

describe("computeBudgetTotals", () => {
  it("sums one-time, monthly, and annual lines", () => {
    const t = computeBudgetTotals(sample);
    expect(t.oneTime).toBe(1000);
    expect(t.monthly).toBe(100);
    expect(t.annual).toBe(100 * 12 + 1200);
    expect(t.year1).toBe(1000 + t.annual);
  });
  it("defaults to BUDGET_LINES when no arg passed", () => {
    const t = computeBudgetTotals();
    expect(t.oneTime).toBeGreaterThan(0);
    expect(t.year1).toBe(t.oneTime + t.annual);
  });
});

describe("totalsByCategory", () => {
  it("groups by category with correct year1 math", () => {
    const m = totalsByCategory(sample);
    expect(m.get("Build · One-time")?.oneTime).toBe(1000);
    expect(m.get("Infra · Recurring")?.monthly).toBe(100);
    expect(m.get("Compliance & Legal")?.annual).toBe(1200);
    expect(m.get("Infra · Recurring")?.year1).toBe(100 * 12);
  });
});

describe("fmtUSD", () => {
  it("formats as whole-dollar USD", () => {
    expect(fmtUSD(1234)).toBe("$1,234");
    expect(fmtUSD(0)).toBe("$0");
  });
});

describe("BUDGET_LINES", () => {
  it("uses unique ids", () => {
    const ids = BUDGET_LINES.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});