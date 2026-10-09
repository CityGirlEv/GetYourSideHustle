import { describe, expect, it } from "vitest";
import { SOFT_LAUNCH_ROLLOUT } from "../gysh-soft-launch-rollout";
import { scenePackageForItem } from "../gysh-scene-packet";

describe("scene packets", () => {
  const teens = SOFT_LAUNCH_ROLLOUT.find((item) => item.id === "sl-s3-fb-teens");
  const short = SOFT_LAUNCH_ROLLOUT.find((item) => item.id === "sl-s3-yt-first-short");
  const still = SOFT_LAUNCH_ROLLOUT.find((item) => item.id === "sl-s11-fb-fall");

  it("gives the Teens Wizard post six standalone scenes with start and end frames", () => {
    expect(teens).toBeTruthy();
    const packet = scenePackageForItem(teens!);
    expect(packet.kind).toBe("video");
    expect(packet.scenes).toHaveLength(6);
    expect(packet.scenes[1]?.title).toMatch(/How old are you/);
    expect(packet.scenes[1]?.screenReference).toBe("Scene2HowHold.png");
    const scene5 = packet.scenes[4]!;
    expect(scene5.hedraPrompt).toContain("GLOBAL HEDRA SETTINGS");
    expect(scene5.hedraPrompt).toContain("DUKE CHARACTER CONTINUITY");
    expect(scene5.hedraPrompt).toContain("STARTING IMAGE INSTRUCTIONS");
    expect(scene5.hedraPrompt).toContain("ENDING IMAGE INSTRUCTIONS");
    expect(scene5.hedraPrompt.toLowerCase()).not.toContain("same as previous");
    expect(scene5.chatgptStartPrompt).toMatch(/ChatGPT image prompt/);
    expect(scene5.chatgptEndPrompt).toMatch(/See my matches/);
  });

  it("gives every other video post a start frame and an end frame on each scene", () => {
    expect(short).toBeTruthy();
    const packet = scenePackageForItem(short!);
    expect(packet.scenes.length).toBeGreaterThan(1);
    for (const scene of packet.scenes) {
      expect(scene.chatgptStartPrompt.length).toBeGreaterThan(40);
      expect(scene.chatgptEndPrompt.length).toBeGreaterThan(40);
      expect(scene.hedraPrompt).toContain("STARTING IMAGE INSTRUCTIONS");
      expect(scene.hedraPrompt).toContain("ENDING IMAGE INSTRUCTIONS");
      expect(scene.hedraPrompt).toContain("GLOBAL HEDRA SETTINGS");
      expect(scene.hedraPrompt.toLowerCase()).not.toContain("same as previous");
    }
  });

  it("gives still posts a ChatGPT prompt plus Hedra start and end frames", () => {
    expect(still).toBeTruthy();
    const packet = scenePackageForItem(still!);
    expect(packet.kind).toBe("still");
    expect(packet.scenes).toHaveLength(1);
    expect(packet.scenes[0]?.chatgptStartPrompt).toMatch(/ChatGPT image prompt/);
    expect(packet.scenes[0]?.chatgptEndPrompt).toMatch(/getyoursidehustle.com/);
    expect(packet.scenes[0]?.hedraPrompt).toContain("ENDING IMAGE INSTRUCTIONS");
  });
});
