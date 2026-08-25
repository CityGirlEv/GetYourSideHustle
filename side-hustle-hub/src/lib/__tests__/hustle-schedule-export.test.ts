import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSchedulePlan, patchPlanPnL } from "../hustle-schedule";
import { upsertPnLLine } from "../hustle-schedule-pnl";
import { buildWeeklyPlanHtml, downloadWeeklyPlanPdf } from "../hustle-schedule-export";
import { buildProfitAndLossHtml, downloadProfitAndLossPdf } from "../hustle-schedule-pnl-export";

vi.mock("../open-pdf", () => ({
  openPdfInBrowser: vi.fn(),
  reservePdfTab: vi.fn(() => null),
}));

vi.mock("../pdf-branding", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../pdf-branding")>();
  return {
    ...actual,
    loadPdfLogoDataUrl: vi.fn(async () => undefined),
    applyPdfPageBranding: vi.fn((doc: unknown, label: string) => {
      actual.applyPdfPageBranding(doc as never, label, undefined);
    }),
  };
});

import { openPdfInBrowser } from "../open-pdf";
import { applyPdfPageBranding } from "../pdf-branding";

describe("hustle schedule weekly plan export", () => {
  const plan = createSchedulePlan({
    ownerId: "self",
    ownerLabel: "Evelyn",
    hustleId: "airbnb",
    hustleLabel: "Airbnb Hosting",
    ageGroup: "adult",
    blueprintId: "bp",
    dueDate: "2026-08-23",
  });

  beforeEach(() => {
    vi.mocked(openPdfInBrowser).mockClear();
    vi.mocked(applyPdfPageBranding).mockClear();
  });

  it("builds weekly plan HTML with days and statuses", () => {
    const html = buildWeeklyPlanHtml(plan);
    expect(html).toContain("Weekly Plan");
    expect(html).toContain("Evelyn");
    expect(html).toContain("Airbnb Hosting");
    expect(html).toContain("Not Started");
    expect(html).toMatch(/<th>Day<\/th>/);
    expect(html).toMatch(/<th>Hours<\/th>/);
  });

  it("applies branded header + footer on weekly plan PDF", async () => {
    await downloadWeeklyPlanPdf(plan);
    expect(applyPdfPageBranding).toHaveBeenCalledWith(
      expect.anything(),
      "Weekly Plan",
      undefined,
    );
    expect(openPdfInBrowser).toHaveBeenCalledTimes(1);
  });
});

describe("hustle schedule P&L export", () => {
  beforeEach(() => {
    vi.mocked(openPdfInBrowser).mockClear();
    vi.mocked(applyPdfPageBranding).mockClear();
  });

  it("builds a formatted P&L HTML report with totals, weeks, and lines", () => {
    let plan = createSchedulePlan({
      ownerId: "self",
      ownerLabel: "Evelyn",
      hustleId: "airbnb",
      hustleLabel: "Airbnb Hosting",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    plan = patchPlanPnL(
      plan,
      upsertPnLLine(plan.pnl, {
        id: "s1",
        kind: "sale",
        date: "2026-08-18",
        label: "Weekend booking",
        amountUsd: 250,
        category: null,
      }),
    );
    plan = patchPlanPnL(
      plan,
      upsertPnLLine(plan.pnl, {
        id: "e1",
        kind: "expense",
        date: "2026-08-19",
        label: "Cleaning",
        amountUsd: 40,
        category: "overhead",
      }),
    );

    const html = buildProfitAndLossHtml(plan);
    expect(html).toContain("Profit &amp; Loss");
    expect(html).toContain("Weekend booking");
    expect(html).toContain("Cleaning");
    expect(html).toContain("Overhead");
    expect(html).toContain("Weekly outcomes");
    expect(html).toContain("Net profit");
    expect(html).toMatch(/\$250\.00/);
    expect(html).toMatch(/\$40\.00/);
    expect(html).toMatch(/\$210\.00/);
  });

  it("applies branded header + footer on P&L PDF", async () => {
    const plan = createSchedulePlan({
      ownerId: "self",
      ownerLabel: "Evelyn",
      hustleId: "airbnb",
      hustleLabel: "Airbnb Hosting",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    await downloadProfitAndLossPdf(plan);
    expect(applyPdfPageBranding).toHaveBeenCalledWith(
      expect.anything(),
      "Profit & Loss",
      undefined,
    );
    expect(openPdfInBrowser).toHaveBeenCalledTimes(1);
  });
});
