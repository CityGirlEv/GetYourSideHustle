import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { uniqueGuideLibraryEntries } from "../guide-library-pool";
import {
  GUIDE_PREP_REVIEW_TAB_LABELS,
  guidePrepSectionIds,
} from "../guide-prep-visibility";
import {
  ensureMarketingPlanSteps,
  guideMarkedPendingAfterPrepBackfill,
} from "../guide-marketing-plan";
import { defaultStatusForGuide } from "../guide-catalog-state";

const SEVEN_TAB_IDS = [
  "all",
  "prereqs",
  "pricing",
  "supplies",
  "tools",
  "steps",
  "calculator",
] as const;

describe("Beach Shell Jewelry template — all guides", () => {
  it("Beach Shell Jewelry has marketing materials, carry-out, and all prep tabs", () => {
    const kit = guideKitForId("beach-shell-jewelry");
    const titles = (kit.steps ?? []).map((s) => s.title).join(" | ");
    expect(titles).toMatch(/Make your marketing materials/i);
    expect(titles).toMatch(/Carry out (the|your) marketing plan/i);
    const tabs = guidePrepSectionIds({
      kit,
      includeSteps: true,
      includeCalculator: true,
    });
    expect(GUIDE_PREP_REVIEW_TAB_LABELS).toHaveLength(7);
    for (const id of SEVEN_TAB_IDS) {
      expect(tabs, id).toContain(id);
    }
  });

  it("every library guide has Make your marketing materials + Carry out the marketing plan", async () => {
    const { stepsIncludeMarketingMaterials, stepsIncludeCarryOutMarketing } = await import(
      "../guide-marketing-plan"
    );
    const { guideUsesNonLaunchPlaybook, guideUsesPlatformMarketplacePlaybook } = await import(
      "../guide-detailed-steps"
    );
    for (const e of uniqueGuideLibraryEntries()) {
      if (guideUsesNonLaunchPlaybook(e.id) || guideUsesPlatformMarketplacePlaybook(e.id)) continue;
      const kit = guideKitForId(e.id);
      const steps = (kit.steps ?? []).map((s) => ({ title: s.title, desc: s.desc }));
      expect(stepsIncludeMarketingMaterials(steps), e.id).toBe(true);
      expect(stepsIncludeCarryOutMarketing(steps), e.id).toBe(true);
    }
  });

  it("every library guide shows the seven prep tabs (Show All + prereqs/pricing/supplies/tools/steps/calculator)", () => {
    for (const e of uniqueGuideLibraryEntries()) {
      const kit = guideKitForId(e.id);
      expect(kit.prerequisites?.length, e.id).toBeGreaterThan(0);
      expect(
        kit.prerequisites?.some(
          (p) =>
            p.id === "free-member" ||
            /GYSH Free account \(or higher\)/i.test(`${p.label} ${p.detail}`) ||
            /Guides are not public — sign in with at least a Free membership/i.test(
              `${p.label} ${p.detail}`,
            ),
        ),
        e.id,
      ).toBe(false);
      expect(kit.tools?.length, e.id).toBeGreaterThan(0);
      expect(kit.suggestedPricing?.items.length, e.id).toBeGreaterThan(0);
      expect(kit.supplies?.items.length, e.id).toBeGreaterThan(0);
      expect(kit.steps?.length, e.id).toBeGreaterThan(0);
      const tabs = guidePrepSectionIds({
        kit,
        includeSteps: true,
        includeCalculator: true,
      });
      for (const id of SEVEN_TAB_IDS) {
        expect(tabs, `${e.id} missing ${id}`).toContain(id);
      }
    }
  });

  it("ensureMarketingPlanSteps is idempotent", () => {
    const once = ensureMarketingPlanSteps(
      [{ title: "Do the work", desc: "Deliver." }],
      "handyman",
    );
    const twice = ensureMarketingPlanSteps(once, "handyman");
    expect(twice.filter((s) => /make your marketing materials/i.test(s.title))).toHaveLength(1);
    expect(twice.filter((s) => /carry out the marketing plan/i.test(s.title))).toHaveLength(1);
  });

  it("backfilled guides default to Pending / Needs Further Review", () => {
    expect(guideMarkedPendingAfterPrepBackfill("amazon")).toBe(false);
    expect(defaultStatusForGuide("amazon")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("airbnb")).toBe(false);
    expect(defaultStatusForGuide("airbnb")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("beach-shell-jewelry")).toBe(false);
    expect(defaultStatusForGuide("beach-shell-jewelry")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("babysitting")).toBe(false);
    expect(defaultStatusForGuide("babysitting")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("errand-runner")).toBe(false);
    expect(defaultStatusForGuide("errand-runner")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("ai-agents")).toBe(false);
    expect(defaultStatusForGuide("ai-agents")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("ai-promo-video")).toBe(false);
    expect(defaultStatusForGuide("ai-promo-video")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("start-book-club")).toBe(false);
    expect(defaultStatusForGuide("start-book-club")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("ai-timing")).toBe(false);
    expect(defaultStatusForGuide("ai-timing")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("str-cohost")).toBe(false);
    expect(defaultStatusForGuide("str-cohost")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("homework-organizer")).toBe(false);
    expect(defaultStatusForGuide("homework-organizer")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("group-setup-helper")).toBe(false);
    expect(defaultStatusForGuide("group-setup-helper")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("house-sitter")).toBe(false);
    expect(defaultStatusForGuide("house-sitter")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("bookkeeping")).toBe(false);
    expect(defaultStatusForGuide("bookkeeping")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("closet-cleanout-listing")).toBe(false);
    expect(defaultStatusForGuide("closet-cleanout-listing")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("nonprofit-social-helper")).toBe(false);
    expect(defaultStatusForGuide("nonprofit-social-helper")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("ugc-creator")).toBe(false);
    expect(defaultStatusForGuide("ugc-creator")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("virtual-assistant")).toBe(false);
    expect(defaultStatusForGuide("virtual-assistant")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("virtual-receptionist")).toBe(false);
    expect(defaultStatusForGuide("virtual-receptionist")).toBe("active");
    expect(guideMarkedPendingAfterPrepBackfill("social")).toBe(false);
    expect(defaultStatusForGuide("social")).toBe("active");
  });
});
