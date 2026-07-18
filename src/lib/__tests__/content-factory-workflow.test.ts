import { describe, expect, it } from "vitest";
import {
  actionToStatus,
  assertDraftStatusTransition,
  canTransitionDraftStatus,
} from "@/lib/content-factory/workflow";

describe("content-factory workflow", () => {
  it("allows draft to move into review and approval", () => {
    expect(canTransitionDraftStatus("draft", "pending_review")).toBe(true);
    expect(canTransitionDraftStatus("pending_review", "approved")).toBe(true);
    expect(actionToStatus("approve")).toBe("approved");
  });

  it("blocks publishing directly from draft", () => {
    expect(canTransitionDraftStatus("draft", "published")).toBe(false);
    expect(() => assertDraftStatusTransition("draft", "published")).toThrow();
  });

  it("allows approved drafts to publish", () => {
    expect(canTransitionDraftStatus("approved", "published")).toBe(true);
  });

  it("allows reversing approval and publication", () => {
    expect(canTransitionDraftStatus("approved", "pending_review")).toBe(true);
    expect(canTransitionDraftStatus("scheduled", "approved")).toBe(true);
    expect(canTransitionDraftStatus("published", "approved")).toBe(true);
    expect(() => assertDraftStatusTransition("published", "approved")).not.toThrow();
  });
});
