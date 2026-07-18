import { describe, expect, it } from "vitest";
import {
  CHECKLIST_PREVIEW_COUNT,
  LAUNCH_CHECKLIST_ITEMS,
  getChecklistPreview,
} from "../launch-checklist";

describe("launch checklist gating data", () => {
  it("has practical multi-phase launch steps", () => {
    expect(LAUNCH_CHECKLIST_ITEMS.length).toBeGreaterThanOrEqual(8);
    const phases = new Set(LAUNCH_CHECKLIST_ITEMS.map((i) => i.phase));
    expect(phases.has("prep")).toBe(true);
    expect(phases.has("build")).toBe(true);
    expect(phases.has("launch")).toBe(true);
    expect(phases.has("grow")).toBe(true);
    for (const item of LAUNCH_CHECKLIST_ITEMS) {
      expect(item.title.length).toBeGreaterThan(8);
      expect(item.description.length).toBeGreaterThan(40);
    }
  });

  it("exposes a short guest preview and locks the rest", () => {
    const { visible, locked } = getChecklistPreview();
    expect(visible).toHaveLength(CHECKLIST_PREVIEW_COUNT);
    expect(locked.length).toBe(LAUNCH_CHECKLIST_ITEMS.length - CHECKLIST_PREVIEW_COUNT);
    expect(locked.length).toBeGreaterThan(0);
  });
});
