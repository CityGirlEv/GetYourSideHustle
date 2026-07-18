import { describe, expect, it } from "vitest";
import {
  adminSiteMapSections,
  internalSiteMapXmlEntries,
  publicSiteMapSections,
  publicSiteMapXmlEntries,
} from "@/lib/site-map";

describe("site-map", () => {
  it("includes public HTML sitemap and benchmark tool in XML entries", () => {
    const paths = publicSiteMapXmlEntries().map((e) => e.path);
    expect(paths).toContain("/sitemap");
    expect(paths).toContain("/scenario/new");
    expect(paths).toContain("/features");
    expect(paths).toContain("/legal");
  });

  it("includes admin training and full sitemap in internal XML", () => {
    const paths = internalSiteMapXmlEntries().map((e) => e.path);
    expect(paths).toContain("/admin/training");
    expect(paths).toContain("/admin/sitemap");
    expect(paths).toContain("/admin/content-factory");
    expect(paths).toContain("/admin/lead-certificates#lead-certificates");
    expect(paths).toContain("/admin/pbo-scenarios");
  });

  it("builds grouped sections for public and admin HTML sitemaps", () => {
    expect(publicSiteMapSections().length).toBeGreaterThan(0);
    expect(adminSiteMapSections().some((s) => s.title === "Admin")).toBe(true);
  });
});
