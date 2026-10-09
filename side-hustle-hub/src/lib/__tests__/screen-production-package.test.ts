import { describe, expect, it } from "vitest";
import { SOFT_LAUNCH_ROLLOUT } from "../gysh-soft-launch-rollout";
import {
  buildScreenProductionPackagePdf,
  pdfSafeProductionText,
  screenProductionPackageFilename,
} from "../screen-production-package";

function pdfLatin1(doc: { output: (type: "arraybuffer") => ArrayBuffer }): string {
  return Buffer.from(doc.output("arraybuffer")).toString("latin1");
}

describe("screen production package", () => {
  const fallPost = SOFT_LAUNCH_ROLLOUT.find((item) => item.id === "sl-s11-fb-fall");
  const videoPost = SOFT_LAUNCH_ROLLOUT.find((item) => item.id === "sl-s3-yt-first-short");

  it("turns Unicode punctuation into Helvetica-safe text", () => {
    expect(pdfSafeProductionText("Facebook · GYSH — ready")).toBe("Facebook - GYSH - ready");
  });

  it("names a PDF for every post", () => {
    expect(fallPost).toBeTruthy();
    expect(screenProductionPackageFilename(fallPost!)).toBe("GYSH-Scene-Packet-s11-fb-fall.pdf");
    for (const item of SOFT_LAUNCH_ROLLOUT) {
      expect(screenProductionPackageFilename(item)).toMatch(/^GYSH-Scene-Packet-.+\.pdf$/);
    }
  });

  it("builds a downloadable package for a copy-only post", () => {
    const doc = buildScreenProductionPackagePdf(fallPost!);
    const raw = pdfLatin1(doc);
    expect(raw).toContain("Still Packet");
    expect(raw).toContain("A fall side hustle that fits the week you have");
    expect(raw).toContain("ChatGPT starting image");
    expect(raw).toContain("ChatGPT ending image");
    expect(raw).toContain("GYSH FB post");
  });

  it("includes scene prompts prompt by prompt when the post is a video", () => {
    expect(videoPost).toBeTruthy();
    const doc = buildScreenProductionPackagePdf(videoPost!);
    const raw = pdfLatin1(doc);
    expect(raw).toContain("Scene 1 - Opening hook");
    expect(raw).toContain("Scene 3 - End card");
    expect(raw).toContain("STARTING IMAGE INSTRUCTIONS");
    expect(raw).toContain("ENDING IMAGE INSTRUCTIONS");
    expect(raw).toContain("Side hustles for every age");
  });
});
