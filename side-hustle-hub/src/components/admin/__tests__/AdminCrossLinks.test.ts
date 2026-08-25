import { describe, expect, it } from "vitest";
import {
  crossLinksForSoftLaunchItem,
  crossLinksForTaskId,
  crossLinksForTestId,
} from "../AdminCrossLinks";
import { softLaunchItemById } from "../../../lib/gysh-soft-launch-rollout";

describe("AdminCrossLinks helpers", () => {
  const item = softLaunchItemById("sl-s3-yt-first-short")!;

  it("links Content Factory items to their task and tests", () => {
    const links = crossLinksForSoftLaunchItem(item);
    expect(links).toEqual([
      { label: "Task T-SL-S3-YT-FIRST-SHORT", opts: { tab: "tasks", taskId: "T-SL-S3-YT-FIRST-SHORT" } },
      { label: "Test VIDEO-003-EVELYN", opts: { tab: "testing", testId: "VIDEO-003-EVELYN" } },
      { label: "Test VIDEO-003-TINA", opts: { tab: "testing", testId: "VIDEO-003-TINA" } },
    ]);
  });

  it("links tasks back to Content Factory and tests", () => {
    const links = crossLinksForTaskId("T-SL-S3-YT-FIRST-SHORT");
    expect(links.some((l) => l.opts.itemId === "sl-s3-yt-first-short")).toBe(true);
    expect(links.some((l) => /^CF-\d{3}/.test(l.label))).toBe(true);
    expect(links.some((l) => l.opts.testId === "VIDEO-003-EVELYN")).toBe(true);
    expect(links.some((l) => l.opts.testId === "VIDEO-003-TINA")).toBe(true);
  });

  it("links tests back to Content Factory and related tasks", () => {
    const links = crossLinksForTestId("VIDEO-003-EVELYN", ["T-SL-S3-YT-FIRST-SHORT"]);
    expect(links.some((l) => l.opts.itemId === "sl-s3-yt-first-short")).toBe(true);
    expect(links.some((l) => l.opts.taskId === "T-SL-S3-YT-FIRST-SHORT")).toBe(true);
  });
});
