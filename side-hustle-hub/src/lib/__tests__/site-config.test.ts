import { describe, expect, it } from "vitest";
import { SITE_PURPOSE, homeLibrarySpotlight } from "../site-config";
import {
  countFreeGuideLibrary,
  uniqueGuideLibraryCount,
} from "../guide-library-pool";

describe("SITE_PURPOSE", () => {
  it("explains GYSH validates profit before investing time or money", () => {
    expect(SITE_PURPOSE).toMatch(/^What is GYSH\?/);
    expect(SITE_PURPOSE).toContain("Match Wizards");
    expect(SITE_PURPOSE).toContain("estimate profit");
    expect(SITE_PURPOSE).toContain("before you invest your time and/or money");
    expect(SITE_PURPOSE).not.toMatch(/before you spend\.?$/);
  });
});

describe("homeLibrarySpotlight", () => {
  it("uses the live Free inventory count by default", () => {
    const freeN = countFreeGuideLibrary();
    expect(freeN).toBeGreaterThan(0);
    const copy = homeLibrarySpotlight(117);
    expect(copy.inlineLabel).toBe(`117 Side Hustle Guides · ${freeN} free to test-drive`);
    expect(copy.menuTotal).toBe("117 Side Hustle Guides");
    expect(copy.menuFree).toBe(`${freeN} free to test-drive`);
    expect(copy.inlineLabel.length).toBeLessThan(60);
    expect(copy.headline).toBe(copy.inlineLabel);
    expect(copy.body).toContain("117");
    expect(copy.body).toContain(String(freeN));
    expect(copy.cta).toBe("Browse Library");
    expect(copy.wizardCta).toBe("Take Match Wizard");
  });

  it("accepts an explicit Active Free count for the home bubble", () => {
    expect(homeLibrarySpotlight(42, 18).inlineLabel).toBe(
      "42 Side Hustle Guides · 18 free to test-drive",
    );
  });

  it("uses the live library inventory for the Active count slot", () => {
    const n = uniqueGuideLibraryCount();
    const freeN = countFreeGuideLibrary();
    expect(n).toBeGreaterThan(100);
    expect(homeLibrarySpotlight(n).inlineLabel).toBe(
      `${n} Side Hustle Guides · ${freeN} free to test-drive`,
    );
  });
});
