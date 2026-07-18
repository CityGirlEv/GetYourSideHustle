import { describe, expect, it } from "vitest";
import { allSubmissionChecklistItems } from "@/lib/submission-checklist-data";
import {
  checklistItemMatchesAssigneeFilter,
  countChecklistProgress,
  isChecklistItemComplete,
} from "@/lib/submission-checklist-data";
import {
  CHECKLIST_CHANNEL_TABS,
  itemMatchesChannelFilter,
} from "@/lib/submission-checklist-channels";
import {
  clearedSubmissionChecklistState,
  coalesceSubmissionChecklistStatesOnLoad,
} from "@/lib/submission-checklist-storage";

function checklistPoolForFilters(
  channel: (typeof CHECKLIST_CHANNEL_TABS)[number]["id"],
  owner: "all" | "prep" | "review",
  nonGapItems: ReturnType<typeof allSubmissionChecklistItems>,
  itemAssignees: Record<string, "prep" | "review"> = {},
) {
  const pool =
    channel === "gaps"
      ? allSubmissionChecklistItems().filter((i) => i.id.startsWith("gap-"))
      : nonGapItems.filter((i) => itemMatchesChannelFilter(i, channel));
  return pool.filter((i) => checklistItemMatchesAssigneeFilter(i, owner, itemAssignees));
}

describe("checklist count diagnostics", () => {
  it("reports channel and owner breakdown", () => {
    const all = allSubmissionChecklistItems();
    const nonGap = all.filter((i) => !i.id.startsWith("gap-"));
    const prepOwner = nonGap.filter((i) => i.owner === "prep");
    const reviewOwner = nonGap.filter((i) => i.owner === "review");
    const prepFilter = nonGap.filter((i) => checklistItemMatchesAssigneeFilter(i, "prep"));
    const reviewFilter = nonGap.filter((i) => checklistItemMatchesAssigneeFilter(i, "review"));
    const fb = nonGap.filter((i) => itemMatchesChannelFilter(i, "facebook-page"));
    const meta = nonGap.filter((i) => itemMatchesChannelFilter(i, "meta-ads"));
    const web = nonGap.filter((i) => itemMatchesChannelFilter(i, "website"));
    const channelAll = nonGap.filter((i) => itemMatchesChannelFilter(i, "all"));

    expect({
      nonGap: nonGap.length,
      prepOwner: prepOwner.length,
      reviewOwner: reviewOwner.length,
      prepFilter: prepFilter.length,
      reviewFilter: reviewFilter.length,
      prepPlusReviewOwner: prepOwner.length + reviewOwner.length,
      fb: fb.length,
      meta: meta.length,
      web: web.length,
      sumChannels: fb.length + meta.length + web.length,
      channelAll: channelAll.length,
    }).toMatchInlineSnapshot(`
      {
        "channelAll": 35,
        "fb": 1,
        "meta": 16,
        "nonGap": 35,
        "prepFilter": 35,
        "prepOwner": 27,
        "prepPlusReviewOwner": 35,
        "reviewFilter": 35,
        "reviewOwner": 8,
        "sumChannels": 35,
        "web": 18,
      }
    `);
  });

  it("owner tab counts sum to channel pool for every channel filter", () => {
    const nonGap = allSubmissionChecklistItems().filter((i) => !i.id.startsWith("gap-"));
    for (const tab of CHECKLIST_CHANNEL_TABS) {
      const pool =
        tab.id === "gaps"
          ? allSubmissionChecklistItems().filter((i) => i.id.startsWith("gap-"))
          : nonGap.filter((i) => itemMatchesChannelFilter(i, tab.id));
      const prep = pool.filter((i) => checklistItemMatchesAssigneeFilter(i, "prep")).length;
      const review = pool.filter((i) => checklistItemMatchesAssigneeFilter(i, "review")).length;
      const byOwner =
        pool.filter((i) => i.owner === "prep").length +
        pool.filter((i) => i.owner === "review").length;
      expect(byOwner, tab.id).toBe(pool.length);
      expect(prep + review, `${tab.id} prep+review`).toBeGreaterThanOrEqual(pool.length);
    }
  });

  it("done plus remaining equals pool size (complete/total)", () => {
    const nonGap = allSubmissionChecklistItems().filter((i) => !i.id.startsWith("gap-"));
    const { done, total } = countChecklistProgress(nonGap, {}, {});
    expect(done).toBe(0);
    expect(total).toBe(nonGap.length);
  });

  it("counts fully complete items via isChecklistItemComplete", () => {
    const nonGap = allSubmissionChecklistItems().filter((i) => !i.id.startsWith("gap-"));
    const target = nonGap[0];
    expect(target).toBeDefined();

    const completed = { [target!.id]: true };
    const catriaReviewed = { [target!.id]: true };
    const catriaApproved = { [target!.id]: true };
    const { done, total } = countChecklistProgress(
      nonGap,
      completed,
      catriaApproved,
      catriaReviewed,
    );
    const expectedDone = nonGap.filter((i) =>
      isChecklistItemComplete(i, completed, catriaApproved, catriaReviewed),
    ).length;

    expect(done).toBe(expectedDone);
    expect(total).toBe(nonGap.length);
    expect(done).toBe(1);
  });

  it("channel and owner filter tab totals match cross-filter pools", () => {
    const nonGap = allSubmissionChecklistItems().filter((i) => !i.id.startsWith("gap-"));
    const completed = Object.fromEntries(nonGap.slice(0, 3).map((i) => [i.id, true]));

    for (const channelTab of CHECKLIST_CHANNEL_TABS) {
      for (const owner of ["all", "prep", "review"] as const) {
        const pool = checklistPoolForFilters(channelTab.id, owner, nonGap);
        const { done, total } = countChecklistProgress(pool, completed, {});
        expect(total).toBe(pool.length);
        expect(done).toBe(
          pool.filter((i) => isChecklistItemComplete(i, completed, {})).length,
        );
      }
    }
  });

  it("cleared local state counts zero done after coalesce with stale server", () => {
    const nonGap = allSubmissionChecklistItems().filter((i) => !i.id.startsWith("gap-"));
    const local = clearedSubmissionChecklistState();
    const server = {
      ...local,
      completed: { "fb-copy-review": true },
      catriaApproved: { "fb-creative-review": true },
      updatedAt: "2026-07-01T00:00:00.000Z",
    };
    const merged = coalesceSubmissionChecklistStatesOnLoad(server, local);
    const { done, total } = countChecklistProgress(
      nonGap,
      merged.completed,
      merged.catriaApproved,
    );
    expect(total).toBe(nonGap.length);
    expect(done).toBe(0);
  });

  it("owner review tab shows items for both-assignee defaults", () => {
    const nonGap = allSubmissionChecklistItems().filter((i) => !i.id.startsWith("gap-"));
    const pool = checklistPoolForFilters("facebook-page", "review", nonGap);
    expect(pool.length).toBe(1);
    const { done, total } = countChecklistProgress(pool, {}, {}, {});
    expect(done).toBe(0);
    expect(total).toBe(1);
  });
});
