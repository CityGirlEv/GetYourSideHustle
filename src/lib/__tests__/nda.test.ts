import { describe, it, expect } from "vitest";
import { buildNdaPdf, NDA_VERSION, NDA_TITLE, NDA_BODY } from "../nda";

describe("nda", () => {
  it("exports constants", () => {
    expect(NDA_VERSION).toBe("v1");
    expect(NDA_TITLE).toMatch(/Non-Disclosure/);
    expect(NDA_BODY.length).toBeGreaterThan(5);
  });

  it("builds a jsPDF document with signer details", () => {
    const doc = buildNdaPdf({
      fullName: "Jane Doe",
      email: "jane@example.com",
      signedAt: new Date("2026-01-15T12:00:00Z"),
      agreementVersion: NDA_VERSION,
      ipAddress: "1.2.3.4",
      userAgent: "Mozilla/5.0",
    });
    expect(typeof doc.output).toBe("function");
    const blob = doc.output("blob");
    expect(blob.size).toBeGreaterThan(500);
  });

  it("builds without optional fields", () => {
    const doc = buildNdaPdf({
      fullName: "Bob",
      email: "b@e.com",
      signedAt: new Date(),
      agreementVersion: "v1",
    });
    expect(doc.output("blob").size).toBeGreaterThan(0);
  });
});
