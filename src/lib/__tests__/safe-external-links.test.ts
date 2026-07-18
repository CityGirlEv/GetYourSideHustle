import { describe, expect, it } from "vitest";
import {
  isAllowedEducationalEmailLink,
  isBlockedMedicareLeadGenHost,
  sanitizeEmailHtmlLinks,
  sanitizeMarkdownOutboundLinks,
} from "@/lib/safe-external-links";

describe("safe-external-links", () => {
  it("flags known Medicare lead-gen hosts", () => {
    expect(isBlockedMedicareLeadGenHost("medicaresolutions.com")).toBe(true);
    expect(isBlockedMedicareLeadGenHost("www.medicare.com")).toBe(true);
    expect(isBlockedMedicareLeadGenHost("www.medicare.gov")).toBe(false);
  });

  it("allows official government and mypartb links", () => {
    expect(isAllowedEducationalEmailLink("https://www.medicare.gov/plan-compare")).toBe(true);
    expect(isAllowedEducationalEmailLink("https://www.mypartb.com/learning-center/foo")).toBe(true);
    expect(isAllowedEducationalEmailLink("https://www.shiphelp.org")).toBe(true);
  });

  it("blocks lead-gen links in markdown", () => {
    const sanitized = sanitizeMarkdownOutboundLinks(
      "Compare plans at https://www.medicaresolutions.com/find-plans today.",
    );
    expect(sanitized).toContain("https://www.medicare.gov/plan-compare");
    expect(sanitized).not.toContain("medicaresolutions.com");
  });

  it("rewrites blocked hrefs in email HTML", () => {
    const html = sanitizeEmailHtmlLinks(
      '<p>Bad <a href="https://medicaresolutions.com/enroll">link</a> here.</p>',
    );
    expect(html).toContain('href="https://www.medicare.gov/plan-compare"');
    expect(html).not.toContain("medicaresolutions.com");
  });
});
