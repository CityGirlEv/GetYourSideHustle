import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_META_PIXEL_ID,
  buildMetaPixelInitScript,
  metaPixelNoscriptSrc,
  trackMetaLead,
  trackMetaPageView,
} from "@/lib/meta-pixel";

describe("meta-pixel", () => {
  it("builds the standard Meta Pixel init snippet", () => {
    const script = buildMetaPixelInitScript(DEFAULT_META_PIXEL_ID);
    expect(script).toContain("fbevents.js");
    expect(script).toContain(`fbq('init', '${DEFAULT_META_PIXEL_ID}')`);
    expect(script).toContain("fbq('track', 'PageView')");
  });

  it("builds the noscript image URL", () => {
    expect(metaPixelNoscriptSrc(DEFAULT_META_PIXEL_ID)).toBe(
      `https://www.facebook.com/tr?id=${DEFAULT_META_PIXEL_ID}&ev=PageView&noscript=1`,
    );
  });

  it("rejects non-numeric pixel ids", () => {
    expect(() => buildMetaPixelInitScript("bad-id")).toThrow(/numeric/i);
  });

  it("fires standard Lead event when fbq is available", () => {
    const fbq = vi.fn();
    vi.stubGlobal("window", { fbq });
    trackMetaLead({ scenarioCode: "ABC123", source: "expert_opt_in_dialog" });
    expect(fbq).toHaveBeenCalledWith("track", "Lead", {
      content_name: "expert_contact_opt_in",
      content_category: "Medicare expert opt-in",
      content_ids: "ABC123",
      source: "expert_opt_in_dialog",
    });
    vi.unstubAllGlobals();
  });

  it("no-ops Lead tracking when fbq is missing", () => {
    vi.stubGlobal("window", {});
    expect(() => trackMetaLead()).not.toThrow();
    vi.unstubAllGlobals();
  });
});
