import { describe, expect, it } from "vitest";
import { blueprintLoadRetryDelayMs, friendlyBlueprintsLoadError } from "../blueprints-api";

describe("blueprint load failures", () => {
  it("retries a failed Blueprint list twice, then stops", () => {
    expect(blueprintLoadRetryDelayMs(0)).toBe(800);
    expect(blueprintLoadRetryDelayMs(1)).toBe(1600);
    expect(blueprintLoadRetryDelayMs(2)).toBeNull();
  });

  it("does not tell a member to retake the Match Wizard when the load fails", () => {
    expect(friendlyBlueprintsLoadError(new Error("GYSH API timed out."))).toBeNull();
    expect(friendlyBlueprintsLoadError(new Error("Not authenticated."))).toBeNull();
    expect(friendlyBlueprintsLoadError(new Error("D1_ERROR: storage operation exceeded timeout"))).toBeNull();
  });
});
