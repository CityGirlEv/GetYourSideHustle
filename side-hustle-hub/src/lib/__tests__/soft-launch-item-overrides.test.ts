import { afterEach, describe, expect, it } from "vitest";
import {
  softLaunchItemById,
  registerSoftLaunchItemOverlay,
  softLaunchItemRef,
} from "../gysh-soft-launch-rollout";
import {
  activateSoftLaunchOverrides,
  applySoftLaunchItemPatch,
  listToLines,
  linesToList,
} from "../soft-launch-item-overrides";

describe("soft-launch item overrides", () => {
  afterEach(() => {
    registerSoftLaunchItemOverlay(null);
  });

  it("applies title and related test patches", () => {
    const base = softLaunchItemById("sl-s3-yt-first-short");
    expect(base).toBeTruthy();
    const next = applySoftLaunchItemPatch(base!, {
      title: "Updated Short Title",
      relatedTestIds: ["VIDEO-999"],
    });
    expect(next.title).toBe("Updated Short Title");
    expect(next.relatedTestIds).toEqual(["VIDEO-999"]);
    expect(next.id).toBe(base!.id);
  });

  it("keeps catalog Copy when an override saves an empty string", () => {
    const base = softLaunchItemById("sl-s4-yt-short-2")!;
    expect(base.copy?.trim()).toBeTruthy();
    const next = applySoftLaunchItemPatch(base, { copy: "" });
    expect(next.copy).toBe(base.copy);
    expect(applySoftLaunchItemPatch(base, { copy: null }).copy).toBeUndefined();
  });

  it("applies Task List–style status values", () => {
    const base = softLaunchItemById("sl-s3-yt-first-short")!;
    expect(applySoftLaunchItemPatch(base, { status: "in_progress" }).status).toBe(
      "in_progress",
    );
    expect(applySoftLaunchItemPatch(base, { status: "done" }).status).toBe("done");
    expect(applySoftLaunchItemPatch(base, { status: "blocked" }).status).toBe("blocked");
    expect(
      applySoftLaunchItemPatch(applySoftLaunchItemPatch(base, { status: "done" }), {
        status: null,
      }).status,
    ).toBeUndefined();
  });

  it("applies a saved owner so CF-013 and other calendar items keep the new assignee", () => {
    const base = softLaunchItemById("sl-s3-fb-free-guides");
    expect(base?.owner).toBe("Tina");
    expect(applySoftLaunchItemPatch(base!, { owner: "Evelyn" }).owner).toBe("Evelyn");
    expect(applySoftLaunchItemPatch(base!, { owner: "Both" }).owner).toBe("Both");
    activateSoftLaunchOverrides({
      "sl-s3-fb-free-guides": { patch: { owner: "Evelyn" } },
    });
    expect(softLaunchItemById("sl-s3-fb-free-guides")?.owner).toBe("Evelyn");
    expect(softLaunchItemById(softLaunchItemRef("sl-s3-fb-free-guides"))?.owner).toBe(
      "Evelyn",
    );
    expect(softLaunchItemById("CF-13")?.owner).toBe("Evelyn");
  });

  it("activates live overlay used by softLaunchItemById", () => {
    activateSoftLaunchOverrides({
      "sl-s3-yt-first-short": { patch: { title: "Live Overlay Title" } },
    });
    expect(softLaunchItemById("sl-s3-yt-first-short")?.title).toBe("Live Overlay Title");
  });

  it("round-trips artifact lines", () => {
    expect(linesToList("a\n\nb\n")).toEqual(["a", "b"]);
    expect(listToLines(["a", "b"])).toBe("a\nb");
  });
});
