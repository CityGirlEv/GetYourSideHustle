import { describe, expect, it } from "vitest";
import {
  GUIDES_PUBLIC_ONLINE,
  canAccessLiveGuides,
  showGuidesUpdatingScreen,
  showHomeGuidesLibraryTag,
} from "../guides-online";

describe("guides-online", () => {
  it("keeps public Guides online when the flag is on", () => {
    expect(GUIDES_PUBLIC_ONLINE).toBe(true);
  });

  it("shows the Home library Guide tag while Guides are online", () => {
    expect(showHomeGuidesLibraryTag()).toBe(GUIDES_PUBLIC_ONLINE);
    expect(showHomeGuidesLibraryTag()).toBe(true);
  });

  it("hides the updating screen for guests and members", () => {
    expect(showGuidesUpdatingScreen({})).toBe(false);
    expect(showGuidesUpdatingScreen({ isAdmin: false, isQa: false })).toBe(false);
    expect(canAccessLiveGuides({})).toBe(true);
  });

  it("lets Admin and QA open live Guides", () => {
    expect(canAccessLiveGuides({ isAdmin: true })).toBe(true);
    expect(canAccessLiveGuides({ isQa: true })).toBe(true);
    expect(showGuidesUpdatingScreen({ isAdmin: true })).toBe(false);
    expect(showGuidesUpdatingScreen({ isQa: true })).toBe(false);
  });

  it("blocks Admin/QA when previewing as a member if Guides are offline", () => {
    // When public Guides are online, preview-as-member still sees the live library.
    expect(
      canAccessLiveGuides({ isAdmin: true, previewingAsMember: true }),
    ).toBe(true);
    expect(
      showGuidesUpdatingScreen({ isQa: true, previewingAsMember: true }),
    ).toBe(false);
  });
});
