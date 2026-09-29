import { describe, expect, it } from "vitest";
import {
  softLaunchMirrorIdForTaskAtt,
  sourceSoftLaunchAttIdFromTaskMirror,
  sourceTaskAttIdFromSoftLaunchMirror,
  taskMirrorIdForSoftLaunchAtt,
} from "../attachment-cross-ref";
import { softLaunchItemIdFromTaskId, softLaunchTaskId } from "../soft-launch-link";

describe("soft-launch-link", () => {
  it("maps calendar item ids to Task List ids", () => {
    expect(softLaunchTaskId("sl-s3-personal-amplify-wrap-tina")).toBe(
      "T-SL-S3-PERSONAL-AMPLIFY-WRAP-TINA",
    );
    expect(softLaunchTaskId("sl-s5-multi-channel-repost")).toBe("T-SL-S5-MULTI-CHANNEL-REPOST");
  });

  it("reverse-maps soft-launch task ids only", () => {
    expect(softLaunchItemIdFromTaskId("T-SL-S3-PERSONAL-AMPLIFY-WRAP-TINA")).toBe(
      "sl-s3-personal-amplify-wrap-tina",
    );
    expect(softLaunchItemIdFromTaskId("T-030")).toBeNull();
    expect(softLaunchItemIdFromTaskId("")).toBeNull();
  });
});

describe("attachment cross-ref ids", () => {
  it("builds deterministic peer ids", () => {
    expect(taskMirrorIdForSoftLaunchAtt("sla-abc")).toBe("xref-sla-sla-abc");
    expect(softLaunchMirrorIdForTaskAtt("f-123")).toBe("xref-task-f-123");
  });

  it("recovers source ids from mirrors", () => {
    expect(sourceSoftLaunchAttIdFromTaskMirror("xref-sla-sla-abc")).toBe("sla-abc");
    expect(sourceTaskAttIdFromSoftLaunchMirror("xref-task-f-123")).toBe("f-123");
    expect(sourceSoftLaunchAttIdFromTaskMirror("plain-id")).toBeNull();
  });
});
