import { describe, expect, it } from "vitest";
import { getMarketingGuide, MARKETING_GUIDES, marketingGuideToc } from "../marketing-guides";

const MOJIBAKE = /â€|Â·|Â\s/;

function walkCopy(value: unknown, visit: (text: string) => void) {
  if (typeof value === "string") {
    visit(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkCopy(item, visit);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) walkCopy(item, visit);
  }
}

describe("marketing guide library copy", () => {
  it("uses readable en-dashes and dots on audience badges", () => {
    const badges = MARKETING_GUIDES.map((g) => g.audienceBadge);
    expect(badges).toEqual([
      "Ages 18–54 · Side Hustlers & families",
      "Ages 4–12 · Parents as GYSH Coaches",
      "Ages 13–17 · Parent / guardian aware",
      "Ages 55+ · Retirees & flexible schedules",
      "All ages · Partners · Families · Coaches",
    ]);
    for (const g of MARKETING_GUIDES) {
      expect(g.audienceBadge).not.toMatch(MOJIBAKE);
      expect(g.lead).not.toMatch(MOJIBAKE);
      expect(g.tagline).not.toMatch(MOJIBAKE);
    }
  });

  it("keeps Complete Guide contents titles readable", () => {
    const toc = marketingGuideToc(getMarketingGuide("master"));
    expect(toc.map((entry) => entry.label)).toEqual([
      "The complete GYSH story",
      "Site map at a glance",
      "Universal five arrows",
      "Adults — GYSH promise for adults",
      "Adults — Adult toolkit on the site",
      "Adults — Membership perks — Adults",
      "Adults — Adult Side Hustle movement",
      "Kids — What kids (and parents) get",
      "Kids — Kids Guides library",
      "Kids — Membership perks — Kids",
      "Kids — Start a family hustle night",
      "Teens — What teens get on GYSH",
      "Teens — Teens Guides library",
      "Teens — Membership perks — Teens",
      "Teens — Invite a teen founder this week",
      "Seniors — What seniors get",
      "Seniors — Opportunity showcase",
      "Seniors — Membership perks — Seniors",
      "Seniors — Begin your second chapter",
      "Share GYSH with your people",
    ]);
  });

  it("has no mojibake in any marketing guide copy", () => {
    walkCopy(MARKETING_GUIDES, (text) => {
      expect(text).not.toMatch(MOJIBAKE);
    });
  });
});
