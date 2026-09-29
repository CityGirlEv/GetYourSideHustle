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
      { label: "Test · VIDEO-003-EVELYN", opts: { tab: "testing", testId: "VIDEO-003-EVELYN" } },
      { label: "Test · VIDEO-003-TINA", opts: { tab: "testing", testId: "VIDEO-003-TINA" } },
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

  it("links GUIDE-REV tests to their Side Hustle Library guide", () => {
    const links = crossLinksForTestId("GUIDE-REV-launch-handyman");
    const guide = links.find((l) => l.href?.startsWith("/guides?hustle="));
    expect(guide?.href).toBe("/guides?hustle=handyman");
    expect(guide?.label).toMatch(/^Guide · #\d{3} /);
    expect(links.some((l) => l.opts?.taskId?.startsWith("T-LG-"))).toBe(false);
  });

  it("does not attach T-LG task backlog rows to GUIDE-REV tests", () => {
    const links = crossLinksForTestId("GUIDE-REV-launch-handyman", ["T-LG-handyman"]);
    expect(links.some((l) => l.opts?.taskId === "T-LG-handyman")).toBe(false);
    expect(links.some((l) => l.href?.startsWith("/guides?hustle="))).toBe(true);
  });

  it("links T-LG tasks to the associated GUIDE-REV test (not the guide page)", () => {
    const links = crossLinksForTaskId("T-LG-handyman");
    const testLink = links.find((l) => l.opts?.testId === "GUIDE-REV-launch-handyman");
    expect(testLink?.label).toMatch(/^Test · #\d{3} GUIDE-REV-launch-handyman$/);
    expect(links.some((l) => l.href?.startsWith("/guides"))).toBe(false);
  });
});
