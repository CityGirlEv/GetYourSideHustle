import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { kidsGuideMinTier } from "../guide-access";
import { kidsLibraryMinTier, juniorLibraryMinTier } from "../age-library-tiers";
import { uniqueGuideLibraryEntries, countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  BOOK_PUBLISHING_KIDS_DETAILED_STEPS,
  BOOK_PUBLISHING_KIDS_NOTES_WORKSHEET,
  BOOK_PUBLISHING_KIDS_PRICING,
  BOOK_PUBLISHING_KIDS_REALITY_CHECK,
  BOOK_PUBLISHING_KIDS_SUPPLIES,
  BOOK_PUBLISHING_KIDS_TOOLS,
  computeBookPublishingKidsProfit,
  bookPublishingKidsToolsDisclaimer,
} from "../book-publishing-kids-guide";

const GUIDE_ID = "book-publishing-kids";

describe("Guide #038 Book Publishing (Storybooks)", () => {
  it("keeps a single #038 id, exact title, Elite, 12 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("038");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("038");
    const idsFor038 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "038")
      .map(([id]) => id);
    expect(idsFor038).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Book Publishing (Storybooks)");
    expect(h.name).not.toMatch(
      /guide upgrade|book publishing guide|children.?s book|kids storybook|storybook side hustle|elite guide|member guide/i,
    );
    expect(h.category).toBe("Digital / Creative / Publishing");
    expect(h.timeReq).toMatch(/12 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/gifts/i);
    expect(h.potentialIncome).toMatch(/fair sales/i);
    expect(h.potentialIncome).toMatch(/ebook royalties/i);
    expect(h.potentialIncome).toMatch(/parent-managed/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["kids", "junior"]));
    expect(h.audiences).not.toContain("adult");
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.description).toMatch(/parent-and-child publishing project/i);
    expect(kidsGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(kidsLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("elite");
    expect(FREE_WIZARD_HUSTLE_IDS).not.toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing with parent-managed gift, fair, eBook, and print examples", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? BOOK_PUBLISHING_KIDS_PRICING.intro);
    expect(intro).toMatch(/\$2\.99 – \$6\.99/);
    expect(intro).toMatch(/\$2\.99 – \$5\.99/);
    expect(intro).toMatch(/\$9\.99 – \$16\.99/);
    expect(intro).toMatch(/\$8 – \$15/);
    expect(intro).toMatch(/do not call the list price/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.suggestedPricing?.items.some((i) => /digital gift/i.test(i.label))).toBe(true);
    expect(kit.supplies?.items.some((i) => /notebook|story-planning/i.test(i.name))).toBe(true);
    expect(BOOK_PUBLISHING_KIDS_SUPPLIES.starterKitTotal).toMatch(/\$0–25/);
    expect(BOOK_PUBLISHING_KIDS_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(bookPublishingKidsToolsDisclaimer()).toMatch(/parent\/guardian manages accounts/i);
    expect(BOOK_PUBLISHING_KIDS_REALITY_CHECK.title).toMatch(/child creates/i);
    expect(BOOK_PUBLISHING_KIDS_REALITY_CHECK.body).toMatch(/Imagine It\. Create It\. Share Your Story\./i);
    expect(BOOK_PUBLISHING_KIDS_NOTES_WORKSHEET).toMatch(/BOOK PLAN/i);
    expect(BOOK_PUBLISHING_KIDS_NOTES_WORKSHEET).toMatch(/ELITE CHALLENGE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 8–10", () => {
    const core = BOOK_PUBLISHING_KIDS_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Set the Parent/Child Roles & Publishing Path",
      "Choose the Reader, Idea & Story Promise",
      "Outline & Storyboard the Book",
      "Write, Read Aloud & Revise the Story",
      "Create an Original Illustration System",
      "Design, Format & Proof the Book",
      "Have the Parent Publish or Prepare Sales Copies",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Track Results, Collect Feedback & Plan the Next Book",
    ]);
    expect(core[4]?.desc).toMatch(/AI-generated/i);
    expect(core[4]?.desc).toMatch(/AI-assisted/i);
    expect(core[5]?.desc).toMatch(/one proof copy/i);
    expect(core[6]?.desc).toMatch(/publication is not guaranteed/i);
    expect(core[8]?.desc).toMatch(/do not use fake bestseller/i);
    expect(core[10]?.desc).toMatch(/dishonest reviews/i);

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

  it("uses Parent-Managed Storybook Profit Calculator: $162 revenue, $82 expenses, $80 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Book Publishing (Storybooks)");
    expect(profile.title).toMatch(/parent-managed storybook profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "storybookDirectPrintedCopiesSold")).toBe(true);

    const result = computeGuideCalc(
      "service",
      {
        storybookDirectPrintedCopiesSold: 15,
        averageDirectSalePrice: 10,
        ebookSales: 8,
        averageActualEbookRoyaltyPerSale: 1.5,
        printOnDemandSales: 0,
        averageActualPrintRoyaltyPerSale: 0,
        otherEarnedBookIncome: 0,
        proofCopies: 0,
        directSaleInventoryPrinting: 0,
        artSupplies: 0,
        softwareLicensedAssets: 0,
        eventBoothFees: 0,
        packagingShipping: 0,
        paymentFees: 0,
        advertisingPrinting: 0,
        otherExpenses: 82,
        writingRevisionHours: 24,
        illustrationHours: 0,
        layoutProofingHours: 0,
        publishingMarketingSalesAdminHours: 0,
      },
      [],
    );
    expect(result.revenue).toBe(162);
    expect(result.expenses).toBe(82);
    expect(result.net).toBe(80);
    expect(result.metrics?.netPerHour).toBeCloseTo(3.33, 2);
    expect(result.notes.join(" ")).toMatch(/parent-managed/i);

    const helper = computeBookPublishingKidsProfit({
      storybookDirectPrintedCopiesSold: 15,
      averageDirectSalePrice: 10,
      ebookSales: 8,
      averageActualEbookRoyaltyPerSale: 1.5,
      otherExpenses: 82,
      writingRevisionHours: 24,
    });
    expect(helper.directSaleRevenue).toBe(150);
    expect(helper.ebookRoyalties).toBe(12);
    expect(helper.totalEarnedRevenue).toBe(162);
    expect(helper.totalExpenses).toBe(82);
    expect(helper.estimatedProfit).toBe(80);
    expect(helper.profitPerHour).toBeCloseTo(3.33, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Book Publishing (Storybooks)");
    expect(pdf.pricing?.some((p) => /\$2\.99|\$9\.99|gift/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /set the parent\/child roles/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /choose your marketing channels/i.test(s.title))).toBe(true);
  });
});
