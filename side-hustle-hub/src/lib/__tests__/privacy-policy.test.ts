import { describe, expect, it } from "vitest";
import {
  PRIVACY_POLICY_EFFECTIVE_DATE,
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_TITLE,
  privacyPolicyPlainText,
} from "../privacy-policy";
import { parseAppRoute, pathForView, titleForView } from "../app-routes";

describe("privacy policy content", () => {
  it("uses the published title and effective date", () => {
    expect(PRIVACY_POLICY_TITLE).toBe("Get Your Side Hustle Privacy Policy");
    expect(PRIVACY_POLICY_EFFECTIVE_DATE).toBe("August 23, 2026");
  });

  it("includes COPPA, teen, payment, and California sections", () => {
    const text = privacyPolicyPlainText();
    expect(text).toContain("Children’s Online Privacy Protection Act");
    expect(text).toContain("COPPA");
    expect(text).toContain("Users between the ages of 13 and 17");
    expect(text).toContain("Stripe");
    expect(text).toContain("California residents");
    expect(text).toContain("does not intend to sell personal information");
    expect(PRIVACY_POLICY_SECTIONS).toHaveLength(15);
  });
});

describe("privacy policy route", () => {
  it("maps /privacy and /privacy-policy to the privacy view", () => {
    expect(parseAppRoute("/privacy")).toEqual({ view: "privacy", guidesManualId: null });
    expect(parseAppRoute("/privacy-policy")).toEqual({ view: "privacy", guidesManualId: null });
    expect(pathForView("privacy")).toBe("/privacy");
    expect(titleForView("privacy")).toBe("Privacy Policy | Get Your Side Hustle");
  });
});
