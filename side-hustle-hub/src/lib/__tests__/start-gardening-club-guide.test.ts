import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { seniorLibraryMinTier } from "../age-library-tiers";
import { countFreeGuideLibrary, uniqueGuideLibraryEntries } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  START_GARDENING_CLUB_DETAILED_STEPS,
  START_GARDENING_CLUB_NOTES_WORKSHEET,
  START_GARDENING_CLUB_REALITY_CHECK,
  computeStartGardeningClubNet,
} from "../start-gardening-club-guide";

const GUIDE_ID = "start-gardening-club";

describe("Guide #105 Start a Gardening Club", () => {
  it("keeps a single #105 id, exact title, Elite membership, 3–8 hrs, and $0–$750/month", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("105");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("105");
    const idsFor105 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "105")
      .map(([id]) => id);
    expect(idsFor105).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Start a Gardening Club");
    expect(h.name).not.toMatch(
      /guide upgrade|gardening club guide|garden club guide|senior gardening guide|elite guide|member guide/i,
    );
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior"]));
    expect(h.audiences).not.toContain("kids");
    expect(h.timeReq).toMatch(/3\s*-\s*8 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$0/);
    expect(h.potentialIncome).toMatch(/\$750/);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(h.category).toMatch(/Community\s*\/\s*Gardening\s*\/\s*Clubs/i);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("elite");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing with free model plus dues, workshops, kits, and $0–$750+ scenarios", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(kit.prerequisites.some((p) => /need|overview|permission|decide/i.test(p.label))).toBe(
      true,
    );
    expect(kit.suggestedPricing?.intro).toMatch(/FREE CLUB MODEL/i);
    expect(kit.suggestedPricing?.intro).toMatch(/\$3–\$10/);
    expect(kit.suggestedPricing?.intro).toMatch(/\$200–\$750\+/);
    expect(kit.suggestedPricing?.intro).toMatch(/not automatically treat money collected as personal profit/i);
    expect(kit.suggestedPricing?.items.some((i) => /\$0/.test(i.price))).toBe(true);
    expect(kit.supplies?.items.some((i) => /notebook|sign-in|flyer/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack|form \+ member sheet/i.test(t.name))).toBe(true);
    expect(START_GARDENING_CLUB_REALITY_CHECK.title).toMatch(/community first, income optional/i);
    expect(START_GARDENING_CLUB_NOTES_WORKSHEET).toMatch(/MY GARDENING CLUB PLAN/i);
    expect(START_GARDENING_CLUB_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = START_GARDENING_CLUB_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[0]?.title).toMatch(/define the club purpose/i);
    expect(core[5]?.title).toMatch(/choose your marketing channels/i);
    expect(core[6]?.title).toMatch(/make your marketing materials/i);
    expect(core[7]?.title).toMatch(/carry out your marketing plan/i);
    expect(core[7]?.desc).toMatch(/first meetup/i);
    expect(core[8]?.desc).toMatch(/healthy plants only/i);
    expect(core[9]?.desc).toMatch(/do not buy large inventory/i);

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

  it("uses Club Money Tracker: $230 revenue, $110 expenses, $120 net", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Start a Gardening Club");
    expect(profile.title).toMatch(/club money tracker/i);

    const result = computeGuideCalc(
      "service",
      {
        payingMembers: 10,
        monthlyDues: 5,
        workshopAttendees: 8,
        workshopPrice: 15,
        kitsSold: 5,
        kitPrice: 12,
        otherRevenue: 0,
      },
      [
        { id: "venue", label: "Venue", amount: 40 },
        { id: "workshopMaterials", label: "Workshop materials", amount: 30 },
        { id: "kitMaterials", label: "Kit materials", amount: 20 },
        { id: "printing", label: "Printing", amount: 10 },
        { id: "speaker", label: "Speaker", amount: 0 },
        { id: "paymentFees", label: "Payment fees", amount: 5 },
        { id: "insurance", label: "Insurance", amount: 0 },
        { id: "other", label: "Other", amount: 5 },
      ],
    );
    expect(result.revenue).toBe(230);
    expect(result.expenses).toBe(110);
    expect(result.net).toBe(120);
    expect(result.notes.join(" ")).toMatch(/not automatically personal profit/i);

    const helper = computeStartGardeningClubNet({
      payingMembers: 10,
      monthlyDues: 5,
      workshopAttendees: 8,
      workshopPrice: 15,
      kitsSold: 5,
      kitPrice: 12,
      venue: 40,
      workshopMaterials: 30,
      kitMaterials: 20,
      printingMarketing: 10,
      paymentFees: 5,
      otherExpenses: 5,
    });
    expect(helper.monthlyRevenue).toBe(230);
    expect(helper.monthlyExpenses).toBe(110);
    expect(helper.monthlyNet).toBe(120);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Start a Gardening Club");
    expect(pdf.pricing?.some((p) => /\$0|\$3|\$750/i.test(p))).toBe(true);
    expect(pdf.steps.some((s) => /define the club purpose/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /plant swaps/i.test(s.title))).toBe(true);
  });
});
