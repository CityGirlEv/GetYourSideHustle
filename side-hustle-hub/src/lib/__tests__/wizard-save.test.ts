import { describe, expect, it } from "vitest";
import {
  wizardSaveButtonLabel,
  wizardSaveDashboardLabel,
  wizardSaveHint,
  wizardResultGuideButtonLabel,
  wizardResultGuideDestination,
  wizardResultGuideHref,
  guestLockedFreeGuide,
  guestLockedFreeGuideNote,
} from "../wizard-save";

describe("wizard save copy", () => {
  it("asks guests to save results by creating an account", () => {
    expect(wizardSaveButtonLabel({ isLoggedIn: false })).toBe("Save my results");
    expect(wizardSaveHint({ isLoggedIn: false })).toMatch(/free account/i);
    expect(wizardSaveHint({ isLoggedIn: false })).toMatch(/My Dashboard/i);
  });

  it("lets signed-in members save to My Dashboard", () => {
    expect(wizardSaveButtonLabel({ isLoggedIn: true })).toBe("Save to My Dashboard");
    expect(wizardSaveHint({ isLoggedIn: true })).toMatch(/My Dashboard/i);
  });

  it("shows saving, saved, and retry states", () => {
    expect(wizardSaveButtonLabel({ isLoggedIn: true, status: "saving" })).toBe("Saving…");
    expect(wizardSaveButtonLabel({ isLoggedIn: true, status: "saved" })).toBe("Saved to My Dashboard");
    expect(wizardSaveButtonLabel({ isLoggedIn: false, status: "error" })).toBe("Retry save");
    expect(wizardSaveHint({ isLoggedIn: true, status: "saved" })).toMatch(/saved/i);
    expect(wizardSaveHint({ isLoggedIn: true, status: "error" })).toMatch(/Try again/i);
  });

  it("labels the dashboard follow-up", () => {
    expect(wizardSaveDashboardLabel()).toMatch(/My Dashboard/i);
  });

  it("labels the per-match guide button", () => {
    expect(wizardResultGuideButtonLabel()).toMatch(/take me to this guide/i);
  });

  it("builds a guide deep link for each match id", () => {
    expect(wizardResultGuideHref("dog-walk")).toBe("/guides?hustle=dog-walk");
  });

  it("sends locked paid matches to Blueprint when a complimentary pick is still available", () => {
    expect(
      wizardResultGuideDestination({
        guideUnlocked: false,
        minTier: "pro",
        offerComplimentaryPick: true,
      }),
    ).toBe("blueprint");
    expect(wizardResultGuideHref("airbnb", "blueprint")).toBe("/my-dashboard#blueprint");
  });

  it("sends guests on locked paid matches to Blueprint so they can pick after Free signup", () => {
    expect(
      wizardResultGuideDestination({
        guideUnlocked: false,
        minTier: "starter",
        needsJoin: true,
      }),
    ).toBe("blueprint");
  });

  it("keeps guests off the free guide until they have an account", () => {
    expect(
      wizardResultGuideDestination({
        guideUnlocked: false,
        minTier: "free",
        offerComplimentaryPick: true,
        needsJoin: true,
      }),
    ).toBe("blueprint");
    const preview = guestLockedFreeGuide([
      { id: "airbnb", title: "Airbnb Host", minTier: "starter" },
      { id: "dog-walk", title: "Neighborhood Dog Walker", minTier: "free" },
    ]);
    expect(preview?.id).toBe("dog-walk");
    expect(guestLockedFreeGuideNote(preview?.title ?? "")).toMatch(/Neighborhood Dog Walker/);
    expect(guestLockedFreeGuideNote(preview?.title ?? "")).toMatch(/free account/i);
    expect(guestLockedFreeGuideNote(preview?.title ?? "")).toMatch(/unlocks/i);
    expect(guestLockedFreeGuide([])).toBeNull();
  });

  it("keeps Unique Unique Free and already-unlocked matches on the guide", () => {
    expect(
      wizardResultGuideDestination({
        guideUnlocked: true,
        minTier: "free",
        needsJoin: false,
      }),
    ).toBe("guide");
    expect(
      wizardResultGuideDestination({
        guideUnlocked: true,
        minTier: "elite",
        offerComplimentaryPick: true,
      }),
    ).toBe("guide");
    expect(
      wizardResultGuideDestination({
        guideUnlocked: false,
        minTier: "elite",
        offerComplimentaryPick: false,
        needsJoin: false,
      }),
    ).toBe("guide");
  });
});
