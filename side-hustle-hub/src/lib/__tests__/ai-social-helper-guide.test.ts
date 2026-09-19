import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  AI_SOCIAL_HELPER_DETAILED_STEPS,
  AI_SOCIAL_HELPER_NOTES_WORKSHEET,
  AI_SOCIAL_HELPER_PRICING,
  AI_SOCIAL_HELPER_REALITY_CHECK,
  AI_SOCIAL_HELPER_SUPPLIES,
  AI_SOCIAL_HELPER_TOOLS,
  computeAiSocialHelperProfit,
  aiSocialHelperToolsDisclaimer,
} from "../ai-social-helper-guide";

const GUIDE_ID = "ai-social-helper";

describe("Guide #026 AI Social Media Helper", () => {
  it("keeps a single #026 id, exact title, 3 - 10 hrs/week, and Elite AI policy tier", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("026");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("026");
    const idsFor026 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "026")
      .map(([id]) => id);
    expect(idsFor026).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("AI Social Media Helper");
    expect(h.name).not.toMatch(
      /guide upgrade|social media manager|ai content creator|content calendar helper|marketing assistant|starter guide|member guide/i,
    );
    expect(h.category).toBe("AI / Marketing");
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(["adult"]);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps AI-draft / client-approval copy", () => {
    const intro = AI_SOCIAL_HELPER_PRICING.intro;
    expect(intro).toMatch(/\$15 – \$50 \/ project/i);
    expect(intro).toMatch(/starter caption pack/i);
    expect(intro).toMatch(/monthly drafting package/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(intro).toMatch(/do not promise a specific reach/i);
    expect(AI_SOCIAL_HELPER_SUPPLIES.items.some((i) => /brief|calendar|checklist/i.test(i.name))).toBe(true);
    expect(AI_SOCIAL_HELPER_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(AI_SOCIAL_HELPER_TOOLS.some((t) => /ftc disclosures/i.test(t.name))).toBe(true);
    expect(AI_SOCIAL_HELPER_TOOLS.some((t) => /tiktok commercial music/i.test(t.name))).toBe(true);
    expect(aiSocialHelperToolsDisclaimer()).toMatch(/client publishes/i);
    expect(AI_SOCIAL_HELPER_REALITY_CHECK.title).toMatch(/ai creates drafts/i);
    expect(AI_SOCIAL_HELPER_NOTES_WORKSHEET).toMatch(/CLIENT BRIEF/i);
    expect(AI_SOCIAL_HELPER_NOTES_WORKSHEET).toMatch(/RED FLAGS/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 5–6", () => {
    const core = AI_SOCIAL_HELPER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose One Client Type and One Platform",
      "Build One Clear Package and Price",
      "Create the Brief and Source Sheet",
      "Create an Honest Sample Calendar",
      "Create Your Marketing Materials",
      "Contact Suitable Clients",
      "Qualify the Client and Content Risk",
      "Brainstorm and Draft with AI",
      "Human-Edit and Verify Every Post",
      "Obtain Approval and Hand Off or Schedule",
      "Report, Invoice, and Improve",
    ]);
    expect(core[4]?.desc).toMatch(/human editing/i);
    expect(core[5]?.desc).toMatch(/2–3 channels/i);
    expect(core[7]?.desc).toMatch(/sanitized prompt/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓|☑|✔/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
  });

  it("uses monthly calculator: $400 revenue, $40 expenses, $360 profit, $20/hour", () => {
    const example = {
      ashCaptionPacks: 4,
      ashAvgPackFee: 35,
      ashCalendarCaptionRevenue: 260,
      ashMonthlyPackageRevenue: 0,
      ashAddOnRevenue: 0,
      ashOtherRevenue: 0,
      ashAiDesignTools: 25,
      ashLicensedMedia: 0,
      ashEquipmentInternet: 0,
      ashPaymentFees: 5,
      ashContractors: 0,
      ashOtherExpenses: 10,
      ashBriefResearchHours: 4,
      ashDraftEditHours: 10,
      ashApprovalRevisionHours: 2,
      ashMarketingAdminHours: 2,
      ashApprovedPosts: 20,
      ashDraftsSubmitted: 22,
      ashPostsRequiringRevision: 4,
    };
    const helper = computeAiSocialHelperProfit(example);
    expect(helper.starterRevenue).toBe(140);
    expect(helper.totalCollectedRevenue).toBe(400);
    expect(helper.totalExpenses).toBe(40);
    expect(helper.estimatedProfit).toBe(360);
    expect(helper.totalHours).toBe(18);
    expect(helper.profitPerHour).toBe(20);
    expect(helper.avgRevenuePerApprovedPost).toBe(20);
    expect(helper.revisionRatePercent).toBeCloseTo(18.18, 1);
  });
});
