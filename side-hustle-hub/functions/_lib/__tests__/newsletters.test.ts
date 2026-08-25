import { describe, expect, it } from "vitest";
import { canReadNewsletter, memberNewsletterBody, stripSprintPrefix } from "../newsletters";

describe("member newsletter API helpers", () => {
  it("opens the archive for paid tiers and Admin Studio roles", () => {
    expect(canReadNewsletter({ role: "adult", roles: '["adult"]', membership_tier: "free" })).toBe(false);
    expect(canReadNewsletter({ role: "adult", roles: '["adult"]', membership_tier: "starter" })).toBe(true);
    expect(canReadNewsletter({ role: "adult", roles: '["adult"]', membership_tier: "pro" })).toBe(true);
    expect(canReadNewsletter({ role: "qa", roles: '["qa"]', membership_tier: "free" })).toBe(true);
    expect(canReadNewsletter({ role: "admin", roles: '["admin"]', membership_tier: "free" })).toBe(true);
  });

  it("cleans titles and published bodies for members", () => {
    expect(stripSprintPrefix("[S5] Newsletter #3 — Workshops teaser + guides")).toBe(
      "Newsletter #3 — Workshops teaser + guides",
    );
    expect(memberNewsletterBody("Issue body\n--- IMAGE PROMPT ---\nprompt")).toBe("Issue body");
  });
});
