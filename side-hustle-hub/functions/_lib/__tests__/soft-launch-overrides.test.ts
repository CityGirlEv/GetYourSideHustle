import { describe, expect, it } from "vitest";
import {
  parsePatchJson,
  sanitizeSoftLaunchPatch,
} from "../soft-launch-overrides";

describe("soft-launch override sanitizer", () => {
  it("accepts a valid owner patch", () => {
    const patch = sanitizeSoftLaunchPatch({ owner: "Evelyn" });
    expect(patch).toEqual({ owner: "Evelyn" });
  });

  it("rejects an invalid owner on write", () => {
    const patch = sanitizeSoftLaunchPatch({ owner: "Lyriq" });
    expect(patch).toEqual({ error: "owner must be Tina, Evelyn, or Both." });
  });

  it("keeps a stored owner when another field in the row is invalid", () => {
    const stored = parsePatchJson(
      JSON.stringify({
        owner: "Evelyn",
        title: "FB — Free Guides library",
        sprint: 99,
      }),
    );
    expect(stored.owner).toBe("Evelyn");
    expect(stored.title).toBe("FB — Free Guides library");
    expect(stored.sprint).toBeUndefined();
  });
});
