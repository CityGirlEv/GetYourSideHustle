import { describe, expect, it } from "vitest";
import {
  extractHashtags,
  facebookPostBodyWithoutHashtags,
  formatFacebookPasteText,
} from "@/lib/content-factory/facebook-post-copy";

describe("facebook-post-copy", () => {
  const sampleBody = `Turning 65 while you still have employer health coverage?

Before you defer Part B, confirm whether your employer has 20 or more employees.

Educational only.

#MedicareEducation #Turning65`;

  it("extracts unique hashtags", () => {
    expect(extractHashtags(sampleBody)).toEqual(["#MedicareEducation", "#Turning65"]);
  });

  it("separates body from hashtag line", () => {
    expect(facebookPostBodyWithoutHashtags(sampleBody)).not.toContain("#Turning65");
    expect(facebookPostBodyWithoutHashtags(sampleBody)).toContain("Turning 65");
  });

  it("formats full paste text from draft body", () => {
    expect(formatFacebookPasteText({ title: "Test", body: sampleBody })).toBe(sampleBody.trim());
  });
});
