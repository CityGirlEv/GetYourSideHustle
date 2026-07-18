import { describe, expect, it } from "vitest";
import {
  facebookPostHeading,
  facebookPostRoleLabel,
  isWorkbookPromoFacebookPost,
} from "@/lib/content-factory/facebook-post-display";

describe("facebook-post-display", () => {
  it("labels posts 1-based with total", () => {
    expect(facebookPostHeading(0, 8)).toBe("Facebook Post 1 of 8");
    expect(facebookPostHeading(3, 8)).toBe("Facebook Post 4 of 8");
    expect(facebookPostHeading(7, 8)).toBe("Facebook Post 8 of 8");
  });

  it("describes post 4 as the workbook page post", () => {
    expect(facebookPostRoleLabel(3)).toMatch(/Facebook Page/i);
    expect(facebookPostRoleLabel(7)).toMatch(/personal profile/i);
  });

  it("detects workbook promo by slot or title", () => {
    expect(
      isWorkbookPromoFacebookPost({
        slotIndex: 3,
        title: "Free Medicare at 65 Planning Workbook (PDF)",
        body: "",
      }),
    ).toBe(true);
    expect(
      isWorkbookPromoFacebookPost({
        slotIndex: 7,
        title: "Share the Medicare at 65 workbook on your personal profile",
        body: "",
      }),
    ).toBe(true);
    expect(
      isWorkbookPromoFacebookPost({
        slotIndex: 0,
        title: "Welcome",
        body: "hello",
      }),
    ).toBe(false);
  });
});
