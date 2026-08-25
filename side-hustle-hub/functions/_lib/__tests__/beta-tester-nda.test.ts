import { describe, expect, it } from "vitest";
import {
  BETA_NDA_VERSION,
  betaNdaAcceptanceError,
  betaNdaRegisterError,
} from "../beta-tester-nda";
import { buildBetaNdaRecord, clientIpFromRequest } from "../beta-nda-store";

const valid = {
  agreed: true,
  legalName: "Jordan Avery",
  email: "jordan@example.com",
  signature: "Jordan Avery",
  ndaVersion: BETA_NDA_VERSION,
};

describe("server beta NDA acceptance", () => {
  it("stamps GYSH-BETA-NDA-v1.0 with user id, timestamp, and IP", () => {
    expect(BETA_NDA_VERSION).toBe("GYSH-BETA-NDA-v1.0");
    const row = buildBetaNdaRecord({
      userId: "u-tester-1",
      legalName: "Jordan Avery",
      email: "jordan@example.com",
      signature: "Jordan Avery",
      acceptedAt: "2026-08-23T18:00:00.000Z",
      ipAddress: "203.0.113.10",
      userAgent: "Playwright",
    });
    expect(row.ndaVersion).toBe("GYSH-BETA-NDA-v1.0");
    expect(row.userId).toBe("u-tester-1");
    expect(row.acceptedAt).toBe("2026-08-23T18:00:00.000Z");
    expect(row.ipAddress).toBe("203.0.113.10");
    expect(row.id).toContain("GYSH-BETA-NDA-v1.0");
  });

  it("reads Cloudflare connecting IP", () => {
    const req = new Request("https://getyoursidehustle.com/api/auth/register", {
      headers: { "CF-Connecting-IP": "198.51.100.20", "x-forwarded-for": "10.0.0.2" },
    });
    expect(clientIpFromRequest(req)).toBe("198.51.100.20");
  });

  it("rejects apply-as-beta without a valid NDA", () => {
    expect(betaNdaRegisterError(true, { ...valid, agreed: false }, "jordan@example.com")).toBe(
      "Accept the Beta Tester NDA to apply.",
    );
    expect(betaNdaAcceptanceError({ ...valid, ndaVersion: "old" })).toMatch(/out of date/);
  });
});
