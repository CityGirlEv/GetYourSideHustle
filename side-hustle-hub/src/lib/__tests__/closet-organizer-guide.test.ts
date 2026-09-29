import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { juniorLibraryMinTier, seniorLibraryMinTier } from "../age-library-tiers";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  CLOSET_ORGANIZER_DETAILED_STEPS,
  CLOSET_ORGANIZER_NOTES_WORKSHEET,
  CLOSET_ORGANIZER_PRICING,
  CLOSET_ORGANIZER_REALITY_CHECK,
  CLOSET_ORGANIZER_SUPPLIES,
  CLOSET_ORGANIZER_TOOLS,
  computeClosetOrganizerProfit,
  closetOrganizerToolsDisclaimer,
} from "../closet-organizer-guide";

const GUIDE_ID = "closet-organizer";

describe("Guide #048 Closet Organizer", () => {
  it("keeps a single #048 id, exact title, 2 - 8 hrs/week, and Starter junior lane tier", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("048");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("048");
    const idsFor048 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "048")
      .map(([id]) => id);
    expect(idsFor048).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Closet Organizer");
    expect(h.name).not.toMatch(
      /guide upgrade|professional organizer guide|closet cleaning guide|home organizer guide|starter guide|member guide/i,
    );
    expect(h.timeReq).toMatch(/2\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$10/);
    expect(h.potentialIncome).toMatch(/\$40/);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.minTier).toBe("free");
    expect(h.freeWizardEligible).toBe(false);
    expect(juniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("starter");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and keeps client-decides / privacy copy", () => {
    const intro = CLOSET_ORGANIZER_PRICING.intro;
    expect(intro).toMatch(/\$10 – \$40 \/ job/i);
    expect(intro).toMatch(/two-hour standard closet session/i);
    expect(intro).toMatch(/donation bagging/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(CLOSET_ORGANIZER_SUPPLIES.items.some((i) => /donation|sorting signs/i.test(i.name))).toBe(true);
    expect(CLOSET_ORGANIZER_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(closetOrganizerToolsDisclaimer()).toMatch(/client decides what leaves/i);
    expect(CLOSET_ORGANIZER_REALITY_CHECK.title).toMatch(/client decides what leaves/i);
    expect(CLOSET_ORGANIZER_NOTES_WORKSHEET).toMatch(/ITEM REMOVAL/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–5", () => {
    const core = CLOSET_ORGANIZER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define Your Organizing Services",
      "Set Privacy, Safety & Decision Rules",
      "Build Your Pricing & Quote System",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Complete Client Intake & Assessment",
      "Prep the Space & Sorting Zones",
      "Sort With the Client",
      "Create a Maintainable Closet System",
      "Close the Session, Get Paid & Track Profit",
      "Follow Up & Build Repeat Projects",
    ]);
    expect(core[1]?.desc).toMatch(/keep\/donate\/sell\/discard/i);
    expect(core[3]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[6]?.desc).toMatch(/UNDECIDED/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓|☑|✔/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
  });

  it("uses monthly calculator: $550 revenue, $110 expenses, $440 profit, ~$19.13/hour", () => {
    const example = {
      coShortSessions: 4,
      coAvgShortPrice: 30,
      coStandardProjects: 4,
      coAvgProjectPrice: 85,
      coAddOnRevenue: 90,
      coTipsOther: 0,
      coLabelsBagsSupplies: 35,
      coTravelParking: 25,
      coDonationDisposal: 10,
      coPaymentFees: 10,
      coAdvertising: 15,
      coInsuranceLicensing: 0,
      coOtherExpenses: 15,
      coOrganizingHours: 18,
      coShoppingDropOffHours: 2,
      coTravelAdminHours: 3,
    };
    const helper = computeClosetOrganizerProfit(example);
    expect(helper.shortSessionRevenue).toBe(120);
    expect(helper.projectRevenue).toBe(340);
    expect(helper.totalMonthlyRevenue).toBe(550);
    expect(helper.totalExpenses).toBe(110);
    expect(helper.estimatedProfit).toBe(440);
    expect(helper.totalHours).toBe(23);
    expect(helper.profitPerHour).toBeCloseTo(19.13, 2);
  });
});
