import { describe, expect, it } from "vitest";
import {
  monthlyEquivalent,
  PROJECT_BUDGET_CATALOG,
  PROJECT_DEV_SUMMARY,
} from "@/lib/project-budget-data";
import {
  approveBudgetLine,
  approveDevLabor,
  createDefaultBudgetSnapshot,
  devLaborTotal,
} from "@/lib/project-budget-storage";

describe("project-budget-data", () => {
  it("normalizes annual costs to monthly equivalent", () => {
    expect(monthlyEquivalent(120, "annual")).toBe(10);
    expect(monthlyEquivalent(50, "monthly")).toBe(50);
    expect(monthlyEquivalent(1000, "one_time")).toBe(0);
  });

  it("includes catalog items for major integrations", () => {
    const ids = PROJECT_BUDGET_CATALOG.map((item) => item.id);
    expect(ids).toContain("supabase");
    expect(ids).toContain("resend");
    expect(ids).toContain("trustedform");
    expect(ids).toContain("cloudflare-pages");
    expect(ids).toContain("stripe");
  });
});

describe("project-budget-storage", () => {
  it("creates default snapshot with estimate amounts", () => {
    const snapshot = createDefaultBudgetSnapshot();
    expect(snapshot.lines.supabase?.amount).toBe(25);
    expect(snapshot.lines.supabase?.approved).toBe(false);
    expect(snapshot.devLabor.hours).toBe(PROJECT_DEV_SUMMARY.defaultHours);
  });

  it("approves a line and records amount", () => {
    let snapshot = createDefaultBudgetSnapshot();
    snapshot = approveBudgetLine(snapshot, "resend", 35);
    expect(snapshot.lines.resend?.amount).toBe(35);
    expect(snapshot.lines.resend?.approved).toBe(true);
    expect(snapshot.lines.resend?.approvedAt).toBeTruthy();
  });

  it("computes development labor total", () => {
    const snapshot = approveDevLabor(createDefaultBudgetSnapshot(), 100, 90);
    expect(devLaborTotal(snapshot.devLabor)).toBe(9000);
    expect(snapshot.devLabor.approved).toBe(true);
  });
});
