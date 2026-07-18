import { describe, expect, it } from "vitest";
import { buildFacebookPostSeedCopy, FB_POST_DISCLAIMER } from "@/lib/content-factory/facebook-post-seed-copy";
import { buildWorkbookFacebookPostTemplates } from "@/lib/content-factory/workbook-facebook-post-templates";
import { BLOCKED_MEDICARE_LEAD_GEN_HOSTS } from "@/lib/safe-external-links";

describe("facebook-post-seed-copy", () => {
  it("every static post links to mypartb.com and includes disclaimer", () => {
    const posts = buildFacebookPostSeedCopy().filter((p) => p.body.trim());
    expect(posts.length).toBeGreaterThanOrEqual(5);
    for (const post of posts) {
      expect(post.body).toContain("mypartb.com");
      expect(post.body).toContain(FB_POST_DISCLAIMER);
      for (const blocked of BLOCKED_MEDICARE_LEAD_GEN_HOSTS) {
        expect(post.body.toLowerCase()).not.toContain(blocked);
      }
    }
  });

  it("includes Medicare.gov plan compare where comparison fits", () => {
    const posts = buildFacebookPostSeedCopy();
    const zeroPremium = posts[2]!.body;
    const tvAds = posts[4]!.body;
    const doctor = posts[5]!.body;
    const partD = posts[6]!.body;
    expect(zeroPremium).toContain("medicare.gov/plan-compare");
    expect(tvAds).toContain("medicare.gov/plan-compare");
    expect(doctor).toContain("medicare.gov/plan-compare");
    expect(partD).toContain("medicare.gov/plan-compare");
  });

  it("mentions Part B Optimizer Benchmark Tool or mypartb on workbook templates", () => {
    for (const template of buildWorkbookFacebookPostTemplates()) {
      expect(template.body).toMatch(/Part B Optimizer Benchmark Tool|mypartb\.com/i);
      expect(template.body).toContain(FB_POST_DISCLAIMER);
    }
  });
});
