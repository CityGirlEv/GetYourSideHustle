import { describe, expect, it } from "vitest";
import {
  extractHashtags,
  facebookPostBodyWithoutHashtags,
  formatFacebookPasteText,
  toFacebookBold,
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

  it("converts text to Facebook bold unicode", () => {
    expect(toFacebookBold("Test 123")).toBe("𝗧𝗲𝘀𝘁 𝟭𝟮𝟯");
  });

  it("formats full paste text with bold title then body and hashtags", () => {
    const result = formatFacebookPasteText({ title: "Test Title", body: sampleBody });
    expect(result.startsWith("𝗧𝗲𝘀𝘁 𝗧𝗶𝘁𝗹𝗲\n\n")).toBe(true);
    expect(result).toContain("#MedicareEducation");
    expect(result).toContain("Turning 65");
  });

  it("does not duplicate title when body already includes it", () => {
    const body = `Test Title\n\n${sampleBody}`;
    expect(formatFacebookPasteText({ title: "Test Title", body })).toBe(body.trim());
  });
});
