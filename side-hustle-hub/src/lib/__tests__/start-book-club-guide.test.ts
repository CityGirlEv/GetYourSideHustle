import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { seniorLibraryMinTier } from "../age-library-tiers";
import { countFreeGuideLibrary, uniqueGuideLibraryEntries } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import {
  START_BOOK_CLUB_DETAILED_STEPS,
  START_BOOK_CLUB_NOTES_WORKSHEET,
  START_BOOK_CLUB_REALITY_CHECK,
  computeStartBookClubProfit,
} from "../start-book-club-guide";

const GUIDE_ID = "start-book-club";

describe("Guide #104 Start a Book Club", () => {
  it("keeps a single #104 id, exact title, Elite membership, 2–6 hrs, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("104");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("104");
    const idsFor104 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "104")
      .map(([id]) => id);
    expect(idsFor104).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Start a Book Club");
    expect(h.name).not.toMatch(
      /guide upgrade|book club guide|senior book club|reading club guide|elite guide|member guide/i,
    );
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior"]));
    expect(h.audiences).not.toContain("kids");
    expect(h.timeReq).toMatch(/2\s*-\s*6 hrs\/week/i);
    expect(h.category).toMatch(/Community\s*\/\s*Books\s*\/\s*Clubs/i);
    expect(h.potentialIncome).toMatch(/\$0/);
    expect(h.potentialIncome).toMatch(/\$500/);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(seniorLibraryMinTier(GUIDE_ID)).toBe("elite");
    expect(uniqueGuideLibraryEntries().find((e) => e.id === GUIDE_ID)?.minTier).toBe("elite");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships COMPLETE kit: free model, dues, events, kits, workshops, and club-money distinction", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(START_BOOK_CLUB_REALITY_CHECK.title).toMatch(
      /the book is the start; the community is the value/i,
    );
    expect(START_BOOK_CLUB_REALITY_CHECK.body).toMatch(/not automatically treat club money as personal profit/i);
    expect(START_BOOK_CLUB_REALITY_CHECK.body).not.toMatch(/GUIDE UPGRADE/i);

    expect(START_BOOK_CLUB_NOTES_WORKSHEET).toMatch(/MY BOOK CLUB PLAN/i);
    expect(START_BOOK_CLUB_NOTES_WORKSHEET).toMatch(/CLUB MONEY/i);
    expect(START_BOOK_CLUB_NOTES_WORKSHEET).toMatch(/Organizer compensation/i);
    expect(START_BOOK_CLUB_NOTES_WORKSHEET).toMatch(/ELITE CHALLENGE/i);
    expect(START_BOOK_CLUB_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);

    const intro = Array.isArray(kit.suggestedPricing?.intro)
      ? kit.suggestedPricing.intro.join("\n")
      : String(kit.suggestedPricing?.intro ?? "");
    expect(intro).toMatch(/FREE CLUB MODEL/i);
    expect(intro).toMatch(/\$3 – \$10/);
    expect(intro).toMatch(/\$25 – \$75/);
    expect(intro).toMatch(/\$5 – \$20/);
    expect(intro).toMatch(/\$5 – \$12/);
    expect(intro).toMatch(/\$10 – \$30/);
    expect(intro).toMatch(/\$150 – \$500\+/);
    expect(intro).toMatch(/not automatically treat club money as personal profit/i);
    expect(kit.suggestedPricing?.items.some((i) => /\$0/.test(i.price))).toBe(true);
    expect(kit.supplies?.items.some((i) => /notebook|sign-in|flyer/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = START_BOOK_CLUB_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define Your Book Club",
      "Find Your First 5–10 Members",
      "Choose Location, Frequency & Access",
      "Create Club Rules & Book-Selection System",
      "Plan the First 3 Months",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Create Better Discussions & Member Experiences",
      "Add Optional Author Talks, Kits or Paid Events",
      "Review, Retain Members & Build the Next 90 Days",
    ]);

    expect(core[7]?.desc).toMatch(/first meeting/i);
    expect(core[9]?.desc).toMatch(/do not imply an author is attending until confirmed/i);
    expect(core[10]?.desc).toMatch(/CHOOSE → READ → MEET → DISCUSS → CONNECT → VOTE → REPEAT/i);

    for (const step of core) {
      expect(step.desc, step.title).not.toMatch(/✓/);
      expect(step.title).not.toMatch(/GUIDE UPGRADE/i);
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

  it("uses Club Money Tracker: $246 revenue, $120 expenses, $126 net", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Start a Book Club");
    expect(profile.title).toMatch(/club money tracker/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "eventAttendees")).toBe(true);

    const helper = computeStartBookClubProfit({
      payingMembers: 10,
      monthlyDues: 5,
      eventAttendees: 10,
      eventPrice: 10,
      kitsSold: 8,
      kitPrice: 12,
      workshopRevenue: 0,
      otherRevenue: 0,
      venue: 40,
      refreshments: 30,
      kitMaterials: 20,
      authorSpeaker: 0,
      printing: 10,
      marketing: 10,
      paymentFees: 5,
      otherExpenses: 5,
    });
    expect(helper.duesRevenue).toBe(50);
    expect(helper.kitRevenue).toBe(96);
    expect(helper.eventRevenue).toBe(100);
    expect(helper.workshopRevenue).toBe(0);
    expect(helper.monthlyRevenue).toBe(246);
    expect(helper.monthlyExpenses).toBe(120);
    expect(helper.monthlyNet).toBe(126);

    const result = computeGuideCalc(
      profile.mode,
      {
        payingMembers: 10,
        monthlyDues: 5,
        eventAttendees: 10,
        eventPrice: 10,
        kitsSold: 8,
        kitPrice: 12,
        workshopRevenue: 0,
        otherRevenue: 0,
        venue: 40,
        refreshments: 30,
        kitMaterials: 20,
        authorSpeaker: 0,
        printing: 10,
        marketing: 10,
        paymentFees: 5,
        otherExpenses: 5,
      },
      [],
    );
    expect(result.revenue).toBe(246);
    expect(result.expenses).toBe(120);
    expect(result.net).toBe(126);
    expect(result.notes.join(" ")).toMatch(/not automatically personal profit/i);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Start a Book Club");
    expect(pdf.steps.some((s) => /define your book club/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /review, retain members/i.test(s.title))).toBe(true);
  });
});
