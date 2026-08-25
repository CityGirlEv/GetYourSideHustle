import { describe, expect, it } from "vitest";
import {
  BETA_NDA_SECTIONS,
  BETA_NDA_TITLE,
  BETA_NDA_VERSION,
  betaNdaAcceptanceError,
  betaNdaPlainText,
  betaNdaRegisterError,
  formatBetaNdaAcceptanceNote,
} from "../beta-tester-nda";
import { parseAppRoute, pathForView, titleForView } from "../app-routes";

const valid = {
  agreed: true,
  legalName: "Jordan Avery",
  email: "jordan@example.com",
  signature: "Jordan Avery",
  ndaVersion: BETA_NDA_VERSION,
};

describe("beta tester NDA content", () => {
  it("uses GYSH-BETA-NDA-v1.0 and 15 sections", () => {
    expect(BETA_NDA_VERSION).toBe("GYSH-BETA-NDA-v1.0");
    expect(BETA_NDA_TITLE).toMatch(/Confidentiality and Non-Disclosure/);
    expect(BETA_NDA_SECTIONS).toHaveLength(15);
    const text = betaNdaPlainText();
    expect(text).toContain("three (3) years following the end of participation");
    expect(text).toContain("I Agree");
    expect(text).toContain("getyoursidehustle.com");
  });
});

describe("beta tester NDA acceptance", () => {
  it("accepts a matching legal name, signature, and current version", () => {
    expect(betaNdaAcceptanceError(valid)).toBeNull();
    expect(betaNdaRegisterError(true, valid, "jordan@example.com")).toBeNull();
    expect(formatBetaNdaAcceptanceNote({
      legalName: "Jordan Avery",
      email: "jordan@example.com",
      acceptedAt: "2026-08-23T18:00:00.000Z",
    })).toBe("NDA accepted 2026-08-23 by Jordan Avery <jordan@example.com>");
  });

  it("rejects missing agree, empty name, signature mismatch, and version drift", () => {
    expect(betaNdaAcceptanceError({ ...valid, agreed: false })).toBe(
      "Accept the Beta Tester NDA to apply.",
    );
    expect(betaNdaAcceptanceError({ ...valid, legalName: " " })).toBe(
      "Enter your full legal name on the NDA.",
    );
    expect(betaNdaAcceptanceError({ ...valid, signature: "J Avery" })).toBe(
      "Electronic signature must match your full legal name.",
    );
    expect(betaNdaAcceptanceError({ ...valid, ndaVersion: "GYSH-BETA-NDA-v0.9" })).toBe(
      "This NDA version is out of date. Refresh and accept the current agreement.",
    );
  });

  it("requires NDA only when applying as a Beta Tester", () => {
    expect(betaNdaRegisterError(false, null, "jordan@example.com")).toBeNull();
    expect(betaNdaRegisterError(true, null, "jordan@example.com")).toBe(
      "Accept the Beta Tester NDA to apply.",
    );
    expect(betaNdaRegisterError(true, valid, "other@example.com")).toBe(
      "NDA email must match your account email.",
    );
  });
});

describe("beta tester routes", () => {
  it("maps /beta-nda and /beta-testing", () => {
    expect(parseAppRoute("/beta-nda")).toEqual({ view: "beta_nda", guidesManualId: null });
    expect(parseAppRoute("/beta-tester-nda")).toEqual({ view: "beta_nda", guidesManualId: null });
    expect(pathForView("beta_nda")).toBe("/beta-nda");
    expect(titleForView("beta_nda")).toBe("Beta Tester NDA | Get Your Side Hustle");
    expect(parseAppRoute("/beta-testing")).toEqual({ view: "beta_testing", guidesManualId: null });
    expect(pathForView("beta_testing")).toBe("/beta-testing");
    expect(titleForView("beta_testing")).toBe("Beta Tester Dashboard | Get Your Side Hustle");
  });
});
