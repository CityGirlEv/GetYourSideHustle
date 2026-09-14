import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { countFreeGuideLibrary, uniqueGuideLibraryEntries } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  BOOK_PUBLISHING_DETAILED_STEPS,
  BOOK_PUBLISHING_NOTES_WORKSHEET,
  BOOK_PUBLISHING_REALITY_CHECK,
  computeBookPublishingProfit,
} from "../book-publishing-guide";

const GUIDE_ID = "book-publishing";

describe("Guide #037 Book Publishing", () => {
  it("keeps a single #037 id, exact title, Pro membership, 4–12 weeks, and $200–$8,000/month", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("037");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("037");
    const idsFor037 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "037")
      .map(([id]) => id);
    expect(idsFor037).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Book Publishing");
    expect(h.name).not.toMatch(
      /guide upgrade|book publishing guide|self-publishing guide|kdp guide|author guide|pro guide|member guide/i,
    );
    expect(h.minTier).toBe("pro");
    expect(adultGuideMinTier(GUIDE_ID)).toBe("pro");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("pro");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.timeReq).toMatch(/4\s*-\s*12 weeks/i);
    expect(h.potentialIncome).toMatch(/\$200/);
    expect(h.potentialIncome).toMatch(/\$8,000/);
    expect(h.category).toMatch(/Digital\s*\/\s*Publishing/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior"]));
    expect(h.audiences).not.toContain("kids");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|terms|teens/i.test(p.label))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$200/);
    expect(kit.suggestedPricing?.intro).toMatch(/\$8,000/);
    expect(kit.suggestedPricing?.items.some((i) => /ebook|paperback|hardcover|audiobook/i.test(i.label))).toBe(
      true,
    );
    expect(kit.supplies?.items.some((i) => /manuscript|proof|rights/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /kdp|ingram|pro tool stack/i.test(t.name))).toBe(true);
    expect(BOOK_PUBLISHING_REALITY_CHECK.title).toMatch(/publishing is a business/i);
    expect(BOOK_PUBLISHING_NOTES_WORKSHEET).toMatch(/MY BOOK PUBLISHING DASHBOARD/i);
    expect(BOOK_PUBLISHING_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 8–10", () => {
    const core = BOOK_PUBLISHING_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/define the book/i);
    expect(core[4]?.title).toMatch(/kdp/i);
    expect(core[5]?.title).toMatch(/ingramspark/i);
    expect(core[5]?.desc).toMatch(/does NOT guarantee stocking/i);
    expect(core[6]?.title).toMatch(/audiobook/i);
    expect(core[7]?.title).toMatch(/choose your marketing channels/i);
    expect(core[8]?.title).toMatch(/make your marketing materials/i);
    expect(core[9]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[9]?.desc).toMatch(/fake reviews/i);
    expect(core[10]?.title).toMatch(/catalog/i);

    for (const step of core) {
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
  });

  it("uses Book Publishing Profit Calculator with actual compensation, not list price", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Book Publishing");
    expect(profile.title).toMatch(/book publishing profit calculator/i);

    const result = computeGuideCalc(
      "product",
      {
        ebookUnits: 100,
        ebookRevPerUnit: 8,
        paperbackUnits: 20,
        paperbackRevPerUnit: 15,
        hardcoverUnits: 0,
        hardcoverRevPerUnit: 0,
        audiobookUnits: 0,
        audiobookRevPerUnit: 0,
        directOtherRevenue: 100,
        unrecoveredProductionCost: 350,
        avgProfitContributionPerSale: 7,
      },
      [
        { id: "ads", label: "Ads", amount: 200 },
        { id: "editing", label: "Editing", amount: 100 },
        { id: "cover", label: "Cover", amount: 80 },
        { id: "formatting", label: "Formatting", amount: 50 },
        { id: "audio", label: "Audio", amount: 0 },
        { id: "proofs", label: "Proofs", amount: 20 },
        { id: "shipping", label: "Shipping", amount: 20 },
        { id: "returns", label: "Returns", amount: 10 },
        { id: "software", label: "Software", amount: 20 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(1200);
    expect(result.expenses).toBe(500);
    expect(result.net).toBe(700);
    expect(result.marginPercent).toBeCloseTo(58.333, 1);
    expect(result.metrics?.breakEvenUnits).toBe(50);

    const helper = computeBookPublishingProfit({
      ebookUnits: 100,
      ebookRevPerUnit: 8,
      paperbackUnits: 20,
      paperbackRevPerUnit: 15,
      directOtherRevenue: 100,
      ads: 200,
      editing: 100,
      cover: 80,
      formatting: 50,
      proofs: 20,
      shipping: 20,
      returnsRefunds: 10,
      software: 20,
      unrecoveredProductionCost: 350,
      avgProfitContributionPerSale: 7,
    });
    expect(helper.monthlyRevenue).toBe(1200);
    expect(helper.monthlyProfit).toBe(700);
    expect(helper.marginPercent).toBeCloseTo(58.3, 1);
    expect(helper.breakEvenUnits).toBe(50);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Book Publishing");
    expect(pdf.pricing?.some((p) => /\$2\.99|\$9\.99|\$8,000/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /define the book/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /ingramspark/i.test(s.title))).toBe(true);
  });
});
