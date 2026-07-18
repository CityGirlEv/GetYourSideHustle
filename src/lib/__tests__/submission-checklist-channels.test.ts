import { describe, expect, it } from "vitest";
import {
  CHECKLIST_CHANNEL_TABS,
  ITEM_CHANNEL_MAP,
  channelForItem,
  itemMatchesChannelFilter,
} from "@/lib/submission-checklist-channels";
import { allSubmissionChecklistItems } from "@/lib/submission-checklist-data";

describe("submission-checklist-channels", () => {
  it("lists All as the first channel tab", () => {
    expect(CHECKLIST_CHANNEL_TABS[0]?.id).toBe("all");
    expect(CHECKLIST_CHANNEL_TABS[0]?.label).toBe("All");
  });

  it("does not include an all-channels tab", () => {
    expect(CHECKLIST_CHANNEL_TABS.some((tab) => tab.id === "all-channels")).toBe(false);
  });

  it("uses List suffix on channel tabs and Meta Ads for conformance", () => {
    expect(CHECKLIST_CHANNEL_TABS.find((tab) => tab.id === "facebook-page")?.label).toBe(
      "Facebook List",
    );
    expect(CHECKLIST_CHANNEL_TABS.find((tab) => tab.id === "meta-ads")?.label).toBe("Meta List");
    expect(CHECKLIST_CHANNEL_TABS.find((tab) => tab.id === "website")?.label).toBe("Website List");
    expect(CHECKLIST_CHANNEL_TABS.find((tab) => tab.id === "gaps")?.label).toBe("Meta Ads");
  });

  it("All filter includes every non-gap checklist item", () => {
    expect(
      itemMatchesChannelFilter({ id: "fb-business-manager", channel: "meta-ads" }, "all"),
    ).toBe(true);
    expect(
      itemMatchesChannelFilter({ id: "gap-meta-pixel-live", channel: "meta-ads" }, "all"),
    ).toBe(false);
  });

  it("assigns each item to exactly one channel", () => {
    const all = allSubmissionChecklistItems();
    for (const item of all) {
      expect(item.channel).toBe(channelForItem(item.id));
      expect(Object.values(ITEM_CHANNEL_MAP).filter((c) => c === item.channel).length).toBeGreaterThan(0);
    }
  });

  it("Facebook + Meta + Website counts sum to All (non-gap)", () => {
    const nonGap = allSubmissionChecklistItems().filter((i) => !i.id.startsWith("gap-"));
    const fb = nonGap.filter((i) => itemMatchesChannelFilter(i, "facebook-page")).length;
    const meta = nonGap.filter((i) => itemMatchesChannelFilter(i, "meta-ads")).length;
    const web = nonGap.filter((i) => itemMatchesChannelFilter(i, "website")).length;
    const allCount = nonGap.filter((i) => itemMatchesChannelFilter(i, "all")).length;
    expect(fb + meta + web).toBe(allCount);
  });
});
