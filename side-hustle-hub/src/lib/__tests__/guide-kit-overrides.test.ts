import { describe, expect, it } from "vitest";
import {
  applyGuideKitPatch,
  moveGuideKitItem,
  newGuideKitItemId,
  resolveGuideKit,
  sanitizeGuidePrerequisites,
  sanitizeGuideSteps,
  sanitizeGuideTools,
} from "../guide-kit-overrides";
import { sanitizeGuideCatalogPatch } from "../guide-catalog-state";
import { formatGuideChangeLogSummary } from "../guide-change-log";

describe("guide kit reorder helpers", () => {
  it("moves items up and down without mutating out of bounds", () => {
    const rows = ["a", "b", "c"];
    expect(moveGuideKitItem(rows, 1, -1)).toEqual(["b", "a", "c"]);
    expect(moveGuideKitItem(rows, 0, -1)).toEqual(["a", "b", "c"]);
    expect(moveGuideKitItem(rows, 2, 1)).toEqual(["a", "b", "c"]);
    expect(moveGuideKitItem(rows, 0, 1)).toEqual(["b", "a", "c"]);
  });

  it("creates unique kit item ids", () => {
    expect(newGuideKitItemId("step")).toMatch(/^step-/);
    expect(newGuideKitItemId("tool")).not.toBe(newGuideKitItemId("tool"));
  });
});

describe("sanitize guide kit content", () => {
  it("keeps name + steps + tools + prerequisites in catalog patches", () => {
    const patch = sanitizeGuideCatalogPatch({
      name: "  Mobile Handyman Pro  ",
      steps: [{ title: "Quote", desc: "Ask for photos" }, { title: "", desc: "" }],
      prerequisites: [{ id: "tools", label: "Basic tools", detail: "Hammer + tape" }],
      tools: [
        {
          id: "canva",
          name: "Canva",
          freePlanAvailable: true,
          costNote: "Free plan ok",
          url: "https://www.canva.com",
        },
      ],
    });
    expect(patch?.name).toBe("Mobile Handyman Pro");
    expect(patch?.steps).toEqual([{ title: "Quote", desc: "Ask for photos" }]);
    expect(patch?.prerequisites?.[0]?.label).toBe("Basic tools");
    expect(patch?.tools?.[0]?.name).toBe("Canva");
    expect(patch?.tools?.[0]?.url).toBe("https://www.canva.com");
  });

  it("sanitizes empty / junk rows out of kit arrays", () => {
    expect(sanitizeGuideSteps([{ title: " ", desc: " " }])).toEqual([]);
    expect(sanitizeGuidePrerequisites([{ label: "", detail: "" }])).toEqual([]);
    expect(sanitizeGuideTools([{ name: "" }])).toEqual([]);
  });
});

describe("applyGuideKitPatch / resolveGuideKit", () => {
  it("replaces steps when an admin patch is present", () => {
    const base = resolveGuideKit("handyman");
    const patched = applyGuideKitPatch(base, {
      name: "Handyman Plus",
      steps: [{ title: "Custom step", desc: "Admin wrote this" }],
    });
    expect(patched.steps).toEqual([{ title: "Custom step", desc: "Admin wrote this" }]);
  });

  it("keeps deleted steps deleted when resolving an admin steps patch", () => {
    const patched = resolveGuideKit("handyman", {
      steps: [{ title: "Only this step", desc: "Admin deleted the rest." }],
    });
    expect(patched.steps).toEqual([{ title: "Only this step", desc: "Admin deleted the rest." }]);
    expect(patched.steps?.some((s) => /pick a name|research competitors|marketing/i.test(s.title))).toBe(
      false,
    );
  });

  it("keeps an empty admin steps patch empty (no code-default fallback)", () => {
    const patched = resolveGuideKit("handyman", { steps: [] });
    expect(patched.steps).toEqual([]);
  });
});

describe("guide change log content action", () => {
  it("summarizes content field updates", () => {
    expect(
      formatGuideChangeLogSummary({
        id: 1,
        guideId: "handyman",
        changedAt: new Date().toISOString(),
        changedBy: "Evelyn",
        action: "content",
        detail: { fields: ["name", "steps"] },
      }),
    ).toBe("Content updated (name, steps)");
  });
});
