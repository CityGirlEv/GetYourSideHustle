import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { countFreeGuideLibrary } from "../guide-library-pool";
import {
  AFFILIATE_DETAILED_STEPS,
  AFFILIATE_EXTERNAL_LINKS,
  AFFILIATE_NOTES_WORKSHEET,
  AFFILIATE_PREREQUISITE_EXTRAS,
  AFFILIATE_PRICING,
  AFFILIATE_REALITY_CHECK,
  AFFILIATE_SUPPLIES,
  AFFILIATE_TOOLS,
  affiliateToolsDisclaimer,
  computeAffiliateProfit,
} from "../affiliate-guide";

const GUIDE_ID = "affiliate";

describe("Guide #021 Affiliate Marketing", () => {
  it("keeps a single #021 id, exact title, Elite via hustleById minTier, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("021");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("021");
    const idsFor021 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "021")
      .map(([id]) => id);
    expect(idsFor021).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Affiliate Marketing");
    expect(h.name).not.toMatch(
      /guide upgrade|affiliate guide|affiliate marketing guide|online income guide|elite guide|member guide/i,
    );
    expect(h.timeReq).toMatch(/3\s*-\s*6 weeks/i);
    expect(h.category).toMatch(/Digital Marketing\s*\/\s*Content\s*\/\s*Online Business/i);
    expect(h.potentialIncome).toMatch(/\$15,000/);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.suggestedPricing?.intro).toMatch(/\$100/);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect((detailedStepsForGuide(GUIDE_ID) ?? []).some((s) => /choose your niche/i.test(s.title))).toBe(true);
  });

  it("ships COMPLETE kit data: reality check, notes, prereqs, supplies, tools, pricing", () => {
    expect(AFFILIATE_REALITY_CHECK.title).toMatch(/not .*drop a link and get paid/i);
    expect(AFFILIATE_NOTES_WORKSHEET).toMatch(/MY AFFILIATE MARKETING PLAN/i);
    expect(AFFILIATE_NOTES_WORKSHEET).toMatch(/GYSH PRO TIP/i);
    expect(AFFILIATE_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
    expect(AFFILIATE_PREREQUISITE_EXTRAS.some((p) => /need|overview|niche|minor/i.test(p.label))).toBe(
      true,
    );
    expect(AFFILIATE_PRICING.tabLabel).toBe("Suggested Pricing");
    expect(AFFILIATE_PRICING.intro).toMatch(/\$100/);
    expect(AFFILIATE_PRICING.intro).toMatch(/\$15,000/);
    expect(AFFILIATE_PRICING.intro).toMatch(/not guarantees|NOT guarantees/i);
    expect(AFFILIATE_PRICING.intro).toMatch(/\$0 while learning/i);
    expect(AFFILIATE_SUPPLIES.starterKitTotal).toMatch(/\$0–25/i);
    expect(AFFILIATE_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(AFFILIATE_TOOLS.some((t) => /amazon associates/i.test(t.name))).toBe(true);
    expect(AFFILIATE_TOOLS.some((t) => /tiktok shop/i.test(t.name))).toBe(true);
    expect(affiliateToolsDisclaimer()).toMatch(/verify current official terms/i);
    expect(AFFILIATE_EXTERNAL_LINKS.some((l) => /amazon associates/i.test(l.label))).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = AFFILIATE_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toBe("Choose Your Niche & Audience");
    expect(core[1]?.title).toBe("Choose Your Content Platform");
    expect(core[2]?.title).toBe("Find & Vet Affiliate Programs");
    expect(core[3]?.title).toBe("Set Up Links, Disclosures & Tracking");
    expect(core[4]?.title).toBe("Create a Content Plan That Helps Before It Sells");
    expect(core[5]?.title).toBe("Choose Your Marketing Channels");
    expect(core[6]?.title).toBe("Make Your Marketing Materials");
    expect(core[7]?.title).toBe("Carry Out Your Marketing Plan");
    expect(core[8]?.title).toBe("Improve Clicks Without Becoming Clickbait");
    expect(core[9]?.title).toBe("Build a Content Library & Recurring Traffic");
    expect(core[10]?.title).toBe("Review Earnings & Scale Winners");

    expect(core[5]?.desc).toMatch(/content channels are your marketing channels/i);
    expect(core[6]?.desc).toMatch(/fake reviews/i);
    expect(core[7]?.desc).toMatch(/do not spam/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
  });

  it("uses Affiliate Earnings Calculator funnel math from the COMPLETE spec", () => {
    const example = computeAffiliateProfit({
      monthlyViews: 10000,
      clickRatePercent: 5,
      conversionRatePercent: 4,
      averageCommission: 15,
      websiteHosting: 25,
      software: 20,
      contentProduction: 15,
      advertising: 10,
      contractors: 0,
      otherExpenses: 5,
    });
    expect(example.clicks).toBe(500);
    expect(example.conversions).toBe(20);
    expect(example.grossCommissions).toBe(300);
    expect(example.expenses).toBe(75);
    expect(example.netProfit).toBe(225);
    expect(example.earningsPerClick).toBe(0.6);
    expect(example.earningsPerThousandViews).toBe(30);

    const beginner = computeAffiliateProfit({
      monthlyViews: 2000,
      clickRatePercent: 5,
      conversionRatePercent: 4,
      averageCommission: 12,
    });
    expect(beginner.clicks).toBe(100);
    expect(beginner.conversions).toBe(4);
    expect(beginner.grossCommissions).toBe(48);
    expect(beginner.netProfit).toBe(48);

    const growing = computeAffiliateProfit({
      monthlyViews: 20000,
      clickRatePercent: 6,
      conversionRatePercent: 4,
      averageCommission: 20,
    });
    expect(growing.clicks).toBe(1200);
    expect(growing.conversions).toBe(48);
    expect(growing.grossCommissions).toBe(960);

    const strong = computeAffiliateProfit({
      monthlyViews: 100000,
      clickRatePercent: 7,
      conversionRatePercent: 5,
      averageCommission: 30,
    });
    expect(strong.clicks).toBeCloseTo(7000, 6);
    expect(strong.conversions).toBeCloseTo(350, 6);
    expect(strong.grossCommissions).toBeCloseTo(10500, 4);

    const empty = computeAffiliateProfit({});
    expect(empty.clicks).toBe(0);
    expect(empty.earningsPerClick).toBeNull();
    expect(empty.earningsPerThousandViews).toBeNull();
  });
});
