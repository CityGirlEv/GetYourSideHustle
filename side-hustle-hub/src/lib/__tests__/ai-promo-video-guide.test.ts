import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { resolveLaunchGuideData } from "../resolve-launch-guide-data";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  AI_PROMO_VIDEO_DETAILED_STEPS,
  AI_PROMO_VIDEO_EXTERNAL_LINKS,
  AI_PROMO_VIDEO_NOTES_WORKSHEET,
  AI_PROMO_VIDEO_PREREQUISITE_EXTRAS,
  AI_PROMO_VIDEO_PRICING,
  AI_PROMO_VIDEO_REALITY_CHECK,
  AI_PROMO_VIDEO_SUPPLIES,
  AI_PROMO_VIDEO_TOOLS,
  aiPromoVideoToolsDisclaimer,
  computeAiPromoVideoProfit,
} from "../ai-promo-video-guide";

const GUIDE_ID = "ai-promo-video";

describe("Guide #024 AI Promotional Video Creator", () => {
  it("keeps a single #024 id, exact title, Elite, 3–10 hrs, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("024");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("024");
    const idsFor024 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "024")
      .map(([id]) => id);
    expect(idsFor024).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("AI Promotional Video Creator");
    expect(h.name).not.toMatch(
      /guide upgrade|ai video guide|promo video guide|ai marketing video guide|elite guide|member guide/i,
    );
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toBe("AI Services / Video / Local Business Marketing");
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$35–\$75/);
    expect(h.potentialIncome).not.toMatch(/\$15\s*[–-]\s*\$50\s*\/\s*project/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior", "junior"]));
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");

    const data = resolveLaunchGuideData(GUIDE_ID, []);
    expect(data.name).toBe("AI Promotional Video Creator");
    expect(data.timeframe).toMatch(/3\s*-\s*10 hrs\/week/i);
  });

  it("ships COMPLETE kit: replaced pricing, beginner stack, supplies, notes, and no old $15–$50 primary", () => {
    expect(AI_PROMO_VIDEO_REALITY_CHECK.title).toMatch(/sell the finished promo/i);
    expect(AI_PROMO_VIDEO_REALITY_CHECK.title).toMatch(/ai button pushing/i);
    expect(AI_PROMO_VIDEO_NOTES_WORKSHEET).toMatch(/MY AI PROMO VIDEO PLAN/i);
    expect(AI_PROMO_VIDEO_NOTES_WORKSHEET).toMatch(/ELITE CHALLENGE/i);
    expect(AI_PROMO_VIDEO_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
    expect(AI_PROMO_VIDEO_PREREQUISITE_EXTRAS.some((p) => /ask every client/i.test(p.label))).toBe(
      true,
    );
    expect(AI_PROMO_VIDEO_EXTERNAL_LINKS.some((l) => /capcut/i.test(l.label))).toBe(true);
    expect(AI_PROMO_VIDEO_EXTERNAL_LINKS.every((l) => /^https:\/\//.test(l.url))).toBe(true);

    const kit = guideKitForId(GUIDE_ID);
    const intro = Array.isArray(kit.suggestedPricing?.intro)
      ? kit.suggestedPricing.intro.join("\n")
      : String(kit.suggestedPricing?.intro ?? "");
    expect(intro).toMatch(/QUICK PROMO/i);
    expect(intro).toMatch(/\$35–\$75/);
    expect(intro).toMatch(/STANDARD PROMO/i);
    expect(intro).toMatch(/\$75–\$175/);
    expect(intro).toMatch(/PREMIUM PROMO/i);
    expect(intro).toMatch(/\$175–\$350/);
    expect(intro).toMatch(/MONTHLY CONTENT PACKAGE/i);
    expect(intro).toMatch(/\$250–\$1,000/);
    expect(intro).not.toMatch(/\$15\s*[–-]\s*\$50\s*\/\s*project/i);
    expect(JSON.stringify(AI_PROMO_VIDEO_PRICING.items)).not.toMatch(
      /\$15\s*[–-]\s*\$50\s*\/\s*project/i,
    );
    expect(kit.suggestedPricing?.items.some((i) => /quick promo/i.test(i.label))).toBe(true);

    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(AI_PROMO_VIDEO_TOOLS.some((t) => /client form \+ ai script/i.test(t.costNote))).toBe(true);
    expect(aiPromoVideoToolsDisclaimer()).toMatch(/client form \+ ai script \+ scene plan/i);
    expect(kit.supplies?.starterKitTotal).toMatch(/do not purchase expensive subscriptions/i);
    expect(AI_PROMO_VIDEO_SUPPLIES.items.some((i) => /storyboard|scene planner/i.test(i.name))).toBe(
      true,
    );
    expect(AI_PROMO_VIDEO_SUPPLIES.items.some((i) => /microphone/i.test(i.name) && i.optional)).toBe(
      true,
    );
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = AI_PROMO_VIDEO_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose Your Promo Video Services",
      "Build 3 Portfolio Samples",
      "Create Client Intake & Project Scope",
      "Write the Script & Hook with AI",
      "Build a Scene Plan",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Produce, Edit & Quality-Check the Video",
      "Handle Client Review & Revisions",
      "Deliver, Track Profit & Create Recurring Work",
    ]);
    expect(core[3]?.desc).toMatch(/do not invent facts/i);
    expect(core[4]?.desc).toMatch(/independently understandable/i);
    expect(core[7]?.desc).toMatch(/do not promise .{1,3}viral/i);
    expect(core[8]?.desc).toMatch(/no accidental AI artifacts/i);
    expect(core[9]?.desc).toMatch(/scope change/i);
    expect(core[10]?.desc).toMatch(/monthly short-video package/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
    expect(titles.some((t) => /script a 30-second promo/i.test(t))).toBe(false);
  });

  it("uses Promo Video Profit Calculator: $1,000 revenue, $800 profit, ≈$26.67/hour", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "AI Promotional Video Creator");
    expect(profile.title).toMatch(/promo video profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "quickPromos")).toBe(true);

    const result = computeAiPromoVideoProfit({
      quickPromos: 4,
      averageQuickPrice: 50,
      standardPromos: 4,
      averageStandardPrice: 125,
      premiumPromos: 1,
      averagePremiumPrice: 225,
      addOnRevenue: 75,
      aiGenerationCredits: 80,
      stockAssets: 40,
      musicVoice: 20,
      software: 20,
      paymentFees: 20,
      marketing: 20,
      otherExpenses: 0,
      productionHours: 20,
      revisionHours: 4,
      clientAdminHours: 3,
      marketingHours: 3,
    });
    expect(result.quickRevenue).toBe(200);
    expect(result.standardRevenue).toBe(500);
    expect(result.premiumRevenue).toBe(225);
    expect(result.addOnRevenue).toBe(75);
    expect(result.monthlyRevenue).toBe(1000);
    expect(result.monthlyExpenses).toBe(200);
    expect(result.monthlyProfit).toBe(800);
    expect(result.totalHours).toBe(30);
    expect(result.effectiveProfitPerHour).toBeCloseTo(26.67, 2);

    const wired = computeGuideCalc(
      profile.mode,
      {
        quickPromos: 4,
        averageQuickPrice: 50,
        standardPromos: 4,
        averageStandardPrice: 125,
        premiumPromos: 1,
        averagePremiumPrice: 225,
        addOnRevenue: 75,
        aiGenerationCredits: 80,
        stockAssets: 40,
        musicVoice: 20,
        software: 20,
        paymentFees: 20,
        marketing: 20,
        otherExpenses: 0,
        productionHours: 20,
        revisionHours: 4,
        clientAdminHours: 3,
        marketingHours: 3,
      },
      [],
    );
    expect(wired.revenue).toBe(1000);
    expect(wired.expenses).toBe(200);
    expect(wired.net).toBe(800);
    expect(wired.metrics?.netPerHour).toBeCloseTo(26.67, 2);

    const zeroHours = computeAiPromoVideoProfit({
      quickPromos: 1,
      averageQuickPrice: 50,
    });
    expect(zeroHours.effectiveProfitPerHour).toBeNull();
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("AI Promotional Video Creator");
    expect(pdf.steps.some((s) => /choose your promo video services/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /deliver, track profit/i.test(s.title))).toBe(true);
  });
});
