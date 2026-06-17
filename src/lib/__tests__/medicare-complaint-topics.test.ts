import { describe, expect, it } from "vitest";
import {
  getArticleTopicDraft,
  getMedicareComplaintResearch,
  listTopicIds,
} from "@/lib/medicare-complaint-topics";

describe("medicare-complaint-topics", () => {
  it("returns 10 complaint clusters with cascading topics", () => {
    const research = getMedicareComplaintResearch();
    expect(research.complaints).toHaveLength(10);
    expect(research.complaints.every((c) => c.topics.length >= 1)).toBe(true);
    expect(research.complaints[0].rank).toBe(1);
  });

  it("loads a full article draft for a known topic id", () => {
    const topicId = listTopicIds()[0];
    const draft = getArticleTopicDraft(topicId);
    expect(draft).not.toBeNull();
    expect(draft!.title.length).toBeGreaterThan(8);
    expect(draft!.slug.length).toBeGreaterThan(3);
    expect(draft!.metaDescription.length).toBeGreaterThanOrEqual(40);
    expect(draft!.bodyMd.length).toBeGreaterThanOrEqual(80);
  });

  it("returns null for unknown topic ids", () => {
    expect(getArticleTopicDraft("not-a-real-topic")).toBeNull();
  });
});
