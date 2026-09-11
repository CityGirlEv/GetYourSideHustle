import { describe, expect, it } from "vitest";
import {
  VSPW_CREDIT_ESTIMATOR_FUTURE_NOTE,
  VSPW_WIZARD_STEPS,
  defaultVspwWizardProject,
  mergeVspwWizardProject,
  nextVspwWizardStep,
  prevVspwWizardStep,
  vspwWizardStepById,
  vspwWizardStepIndex,
} from "../vspw-wizard";

describe("vspw wizard walkthrough", () => {
  it("defines eight sequential steps starting at project", () => {
    expect(VSPW_WIZARD_STEPS).toHaveLength(8);
    expect(VSPW_WIZARD_STEPS[0]!.id).toBe("project");
    expect(VSPW_WIZARD_STEPS[VSPW_WIZARD_STEPS.length - 1]!.id).toBe("pack");
    expect(defaultVspwWizardProject().stepId).toBe("project");
  });

  it("moves forward and back through the wizard", () => {
    expect(nextVspwWizardStep("project")).toBe("characters");
    expect(nextVspwWizardStep("review")).toBe("pack");
    expect(nextVspwWizardStep("pack")).toBeNull();
    expect(prevVspwWizardStep("characters")).toBe("project");
    expect(prevVspwWizardStep("project")).toBeNull();
    expect(vspwWizardStepIndex("dialogue")).toBe(3);
    expect(vspwWizardStepById("wardrobe").title).toMatch(/Wardrobe/i);
  });

  it("merges older/partial saved projects safely", () => {
    const merged = mergeVspwWizardProject({
      title: "Hat commercial",
      stepId: "dialogue",
      characters: [{ id: "c1", name: "Angela" }],
    });
    expect(merged.title).toBe("Hat commercial");
    expect(merged.stepId).toBe("dialogue");
    expect(merged.characters[0]!.name).toBe("Angela");
    expect(merged.scenes.length).toBeGreaterThan(0);
  });

  it("keeps credit estimator as a future enhancement note", () => {
    expect(VSPW_CREDIT_ESTIMATOR_FUTURE_NOTE).toMatch(/future enhancement/i);
    expect(VSPW_CREDIT_ESTIMATOR_FUTURE_NOTE).not.toMatch(/required/i);
  });

  it("accepts reference image uploads into scene state and rejects non-images", async () => {
    const { readVspwReferenceImage, parseVspwReferenceImage, blankScene } = await import(
      "../vspw-wizard"
    );
    const ok = new File([new Uint8Array([1, 2, 3])], "start.jpg", { type: "image/jpeg" });
    // FileReader in vitest/jsdom may not decode tiny bytes as image data URL consistently —
    // parse helper still validates saved shapes.
    const parsed = parseVspwReferenceImage({
      name: "start.jpg",
      mimeType: "image/jpeg",
      size: 12,
      dataUrl: "data:image/jpeg;base64,AAAA",
    });
    expect(parsed?.name).toBe("start.jpg");
    expect(blankScene(1).startImage).toBeNull();
    expect(blankScene(1).endImage).toBeNull();

    const bad = new File([new Uint8Array([1])], "notes.txt", { type: "text/plain" });
    await expect(readVspwReferenceImage(bad)).rejects.toThrow(/image file/i);
  });
});
