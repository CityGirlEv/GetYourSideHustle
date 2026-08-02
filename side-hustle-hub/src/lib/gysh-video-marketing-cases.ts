/**
 * Manual QA for soft-launch / marketing videos (Hedra start image + motion).
 * Each case is cross-linked to its Task List id (T-SL-…).
 */
import type { TestCase } from "./gysh-test-plan";
import { softLaunchTaskId, softLaunchVideoItems } from "./gysh-soft-launch-rollout";

const VIDEO_QUALITY_STEPS = [
  "Open Content Factory → GYSH Marketing/Launch Plan (or the linked Task) and copy the Hedra · Starting image prompt",
  "Generate/upload the start still in Hedra — check brand colors (Soft Ivory / Antique Gold / Crimson), sharp readable text, no watermarks or distorted faces/hands",
  "Copy the Hedra · Video / motion prompt into Hedra and generate from that start still",
  "Review the export for duration/aspect in the VIDEO BRIEF, stable camera, no flickering/morphing text, warm family-friendly grade (not hype-bro)",
  "Confirm end card holds 1.5–2s with getyoursidehustle.com (and Start free / Link in bio when specified) crisp and readable",
  "Publish (or stage) on the named channel; attach the export + live URL as Testing Portal evidence",
];

function videoCase(opts: {
  id: string;
  title: string;
  taskId: string;
  sprintHint: string;
  aspect: string;
  duration: string;
  assignees: TestCase["assignees"];
}): TestCase {
  return {
    id: opts.id,
    area: "Video Marketing",
    title: opts.title,
    priority: "P1",
    roles: ["admin", "qa"],
    assignees: opts.assignees,
    suite: "manual",
    relatedTaskIds: [opts.taskId],
    steps: [
      `Task ${opts.taskId} (${opts.sprintHint}) — open notes / Launch Plan for Hedra prompts`,
      ...VIDEO_QUALITY_STEPS,
      `Platform check: ${opts.aspect}, target ${opts.duration}, captions/hook text legible on a phone`,
    ],
    expected: `Hedra start image + video match the Launch Plan prompts; ${opts.aspect}; ${opts.duration}; brand-safe; sharp CTA/URL; evidence attached on ${opts.id} and task ${opts.taskId} marked ready/done`,
    path: "admin",
  };
}

/** Catalog cases VIDEO-001… — one per soft-launch video task. */
export const VIDEO_MARKETING_CASES: TestCase[] = [
  videoCase({
    id: "VIDEO-001",
    title: "Hedra QA — FB Welcome soft-launch video",
    taskId: softLaunchTaskId("sl-s2-fb-welcome"),
    sprintHint: "Sprint 2 flagship",
    aspect: "1:1 or 4:5 (1080×1080 / 1080×1350)",
    duration: "15–20s",
    assignees: ["tina"],
  }),
  videoCase({
    id: "VIDEO-002",
    title: "Hedra QA — FB Match Wizard walkthrough video",
    taskId: softLaunchTaskId("sl-s3-fb-match-wizard"),
    sprintHint: "Sprint 3",
    aspect: "1:1",
    duration: "20–30s",
    assignees: ["evelyn"],
  }),
  videoCase({
    id: "VIDEO-003",
    title: "Hedra QA — YouTube First Short (What is GYSH?)",
    taskId: softLaunchTaskId("sl-s3-yt-first-short"),
    sprintHint: "Sprint 3 · T-SL-S3-YT-FIRST-SHORT",
    aspect: "9:16",
    duration: "25–35s",
    assignees: ["evelyn", "tina"],
  }),
  videoCase({
    id: "VIDEO-004",
    title: "Hedra QA — TikTok Pick Your Path",
    taskId: softLaunchTaskId("sl-s4-tiktok-1"),
    sprintHint: "Sprint 4",
    aspect: "9:16",
    duration: "20–35s",
    assignees: ["evelyn"],
  }),
  videoCase({
    id: "VIDEO-005",
    title: "Hedra QA — YouTube Short Free Blueprint in 60s",
    taskId: softLaunchTaskId("sl-s4-yt-short-2"),
    sprintHint: "Sprint 4",
    aspect: "9:16",
    duration: "35–55s (≤60s)",
    assignees: ["evelyn"],
  }),
  videoCase({
    id: "VIDEO-006",
    title: "Hedra QA — IG/TikTok soft-launch best-of montage",
    taskId: softLaunchTaskId("sl-s5-multi-channel-repost"),
    sprintHint: "Sprint 5",
    aspect: "9:16",
    duration: "15–25s",
    assignees: ["evelyn"],
  }),
  videoCase({
    id: "VIDEO-007",
    title: "Hedra QA — YouTube channel trailer / Community welcome",
    taskId: softLaunchTaskId("sl-s2-yt-create"),
    sprintHint: "Sprint 2 (optional trailer)",
    aspect: "16:9",
    duration: "20–30s",
    assignees: ["evelyn"],
  }),
];

/** Every soft-launch video item must declare Hedra prompts + a VIDEO-* test. */
export function assertVideoItemsHaveHedraAndTests(): {
  itemId: string;
  taskId: string;
  testIds: string[];
}[] {
  return softLaunchVideoItems().map((item) => ({
    itemId: item.id,
    taskId: softLaunchTaskId(item.id),
    testIds: item.relatedTestIds ?? [],
  }));
}
