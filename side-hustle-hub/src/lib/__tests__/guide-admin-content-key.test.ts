import { describe, expect, it } from "vitest";
import { guideAdminKitContentKey } from "../guide-admin-content-key";
import type { GuideKit } from "../guide-tools";

const emptyKit = (): GuideKit => ({
  prerequisites: [],
  tools: [],
  steps: [{ title: "A", desc: "1" }],
});

describe("guideAdminKitContentKey", () => {
  it("is stable across new kit object identities with the same content", () => {
    const a = guideAdminKitContentKey("handyman", "Handyman", emptyKit());
    const b = guideAdminKitContentKey("handyman", "Handyman", emptyKit());
    expect(a).toBe(b);
  });

  it("changes when a step is removed", () => {
    const full = guideAdminKitContentKey("handyman", "Handyman", emptyKit());
    const deleted = guideAdminKitContentKey("handyman", "Handyman", {
      ...emptyKit(),
      steps: [],
    });
    expect(full).not.toBe(deleted);
  });
});
