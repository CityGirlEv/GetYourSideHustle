import { describe, expect, it } from "vitest";
import { formatGuideNumber } from "../guide-numbers";
import { getLaunchGuidePeekSections } from "../launch-guide-peeks";
import { uniqueGuideLibraryEntries } from "../guide-library-pool";
import { kidsGuideById } from "../kids-guides";
import { hustleById } from "../side-hustle-catalog";

describe("Open Guide routing", () => {
  it("keeps #008 / #009 / #018 as openable library guides (not hub-only)", () => {
    expect(formatGuideNumber("kids-kindness-share")).toBe("008");
    expect(formatGuideNumber("junior-give-back-teach")).toBe("009");
    expect(formatGuideNumber("rideshare")).toBe("018");

    expect(kidsGuideById("kids-kindness-share")?.id).toBe("kids-kindness-share");
    expect(kidsGuideById("junior-give-back-teach")?.id).toBe("junior-give-back-teach");
    expect(hustleById("rideshare")?.id).toBe("rideshare");

    const libraryIds = new Set(uniqueGuideLibraryEntries().map((e) => e.id));
    expect(libraryIds.has("kids-kindness-share")).toBe(true);
    expect(libraryIds.has("junior-give-back-teach")).toBe(true);
    expect(libraryIds.has("rideshare")).toBe(true);
  });

  it("checklist peeks for #008 / #009 / #018 open guide detail, not age hubs", () => {
    const sections = getLaunchGuidePeekSections();
    const byId = (id: string) =>
      sections.flatMap((s) => s.guides).find((g) => g.id === id || g.nav.view === "guides" && g.nav.hustleId === id);

    const kindness = byId("kids-kindness-share");
    expect(kindness?.nav).toEqual({ view: "guides", hustleId: "kids-kindness-share" });

    const giveBack = byId("junior-give-back-teach");
    expect(giveBack?.nav).toEqual({ view: "guides", hustleId: "junior-give-back-teach" });

    const ridesharePeek =
      sections.flatMap((s) => s.guides).find((g) => g.id === "rideshare") ||
      sections.flatMap((s) => s.guides).find(
        (g) => g.nav.view === "guides" && g.nav.hustleId === "rideshare",
      );
    expect(ridesharePeek?.nav).toEqual({ view: "guides", hustleId: "rideshare" });
  });
});
