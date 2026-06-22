import { describe, expect, it } from "vitest";
import { generateWeeklyBatchAssets } from "@/lib/content-factory/batch-seed";
import { WEEKLY_CONTENT_BATCH_PLAN, weeklyBatchAssetTotal } from "@/lib/content-factory/types";

describe("content-factory batch-seed", () => {
  it("generates the full weekly asset plan without placeholder language", () => {
    const assets = generateWeeklyBatchAssets("Medicare enrollment education", "batch-test-id");
    expect(assets).toHaveLength(weeklyBatchAssetTotal());
    expect(assets.some((asset) => asset.type === "article")).toBe(true);
    expect(assets.some((asset) => asset.type === "facebook_post")).toBe(true);

    const combined = assets.map((asset) => `${asset.title}\n${asset.excerpt}\n${asset.body}`).join("\n");
    expect(combined.toLowerCase()).not.toContain("placeholder");
    expect(combined.toLowerCase()).not.toContain("replace with ai");
    expect(combined.toLowerCase()).not.toContain("mock learning center");
  });

  it("matches configured counts per asset type", () => {
    const assets = generateWeeklyBatchAssets("Topic", "batch-count-test");
    for (const slot of WEEKLY_CONTENT_BATCH_PLAN) {
      expect(assets.filter((asset) => asset.type === slot.type)).toHaveLength(slot.count);
    }
  });

  it("seeds article drafts from Learning Center topic templates", () => {
    const assets = generateWeeklyBatchAssets("Topic", "batch-article-test");
    const articles = assets.filter((asset) => asset.type === "article");
    expect(articles.every((article) => article.body.includes("##"))).toBe(true);
    expect(articles.every((article) => article.payload?.provider === "seed")).toBe(true);
  });
});
