import { describe, expect, it } from "vitest";
import {
  CERT_LOGO_SIZE,
  GLOW_GETTER_CERT_LINE,
  buildCertificatePdfBase64,
  buildCertificateSvg,
  isGlowGetterAudience,
  resolveCertificateBody,
} from "./certificates";

const baseSvgInput = {
  title: "Welcome to the GYSH Family",
  subtitle: "Certificate of Membership",
  memberName: "Jordan Glow",
  bodyText: "Sample body text for the certificate.",
  signoff: "T + E · Get Your Side Hustle",
  footerLine: "Four wizards. One family adventure.",
  tierLabel: "Free",
  audienceLabel: "Kids",
  issuedAt: "2026-07-19T12:00:00.000Z",
};

describe("certificate logo + site URL", () => {
  it("uses the larger logo size in SVG", () => {
    expect(CERT_LOGO_SIZE).toBe(180);
    const svg = buildCertificateSvg(baseSvgInput);
    expect(svg).toContain(`width="${CERT_LOGO_SIZE}" height="${CERT_LOGO_SIZE}"`);
    expect(svg).not.toContain('width="140" height="140"');
  });

  it("always shows https://getyoursidehustle.com on SVG and PDF", () => {
    const svg = buildCertificateSvg(baseSvgInput);
    const pdf = atob(buildCertificatePdfBase64(baseSvgInput));
    expect(svg).toContain("https://getyoursidehustle.com");
    expect(pdf).toContain("https://getyoursidehustle.com");
  });
});

describe("Glow Getter body copy", () => {
  const template =
    "This certifies that {{name}} is a valued member, welcomed on {{date}} as a {{tier}} member in the {{audience}} lane.";

  it("marks kids and teens audiences as Glow Getters", () => {
    expect(isGlowGetterAudience("kids")).toBe(true);
    expect(isGlowGetterAudience("kid")).toBe(true);
    expect(isGlowGetterAudience("junior")).toBe(true);
    expect(isGlowGetterAudience("teen")).toBe(true);
    expect(isGlowGetterAudience("teens")).toBe(true);
    expect(isGlowGetterAudience("adult")).toBe(false);
    expect(isGlowGetterAudience("senior")).toBe(false);
  });

  it("appends Glow Getter line for kids/teens only", () => {
    const kids = resolveCertificateBody(
      template,
      { name: "Sam", date: "July 19, 2026", tier: "Free", audience: "Kids" },
      "kids",
    );
    const teens = resolveCertificateBody(
      template,
      { name: "Alex", date: "July 19, 2026", tier: "Starter", audience: "Teens" },
      "junior",
    );
    const adult = resolveCertificateBody(
      template,
      { name: "Pat", date: "July 19, 2026", tier: "Pro", audience: "Adults" },
      "adult",
    );
    expect(kids).toContain(GLOW_GETTER_CERT_LINE);
    expect(teens).toContain(GLOW_GETTER_CERT_LINE);
    expect(adult).not.toContain("Glow Getter");
    expect(GLOW_GETTER_CERT_LINE).toMatch(/Glow Getter/i);
  });
});
