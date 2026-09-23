import { afterEach, describe, expect, it } from "vitest";
import { clearMemoryStore } from "../browser-storage";
import { AI_SCENE_PACKS_WORKSHOP_ID } from "../workshop-playbooks";
import {
  clearPendingJoinReturn,
  consumeWorkshopJoinReturn,
  readPendingJoinReturn,
} from "../pending-join-return";
import { saveWorkshopRegistrationJoinReturn } from "../workshop-member-gate";

afterEach(() => {
  clearPendingJoinReturn();
  clearMemoryStore();
});

describe("pending workshop join return", () => {
  it("sends Sign in / Join back to the AI workshop registration", () => {
    saveWorkshopRegistrationJoinReturn("ai-marketing-video");
    const pending = readPendingJoinReturn();
    expect(pending?.view).toBe("workshops");
    expect(pending?.workshopRegisterId).toBe(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(consumeWorkshopJoinReturn()).toBe(AI_SCENE_PACKS_WORKSHOP_ID);
    expect(consumeWorkshopJoinReturn()).toBeNull();
  });
});
