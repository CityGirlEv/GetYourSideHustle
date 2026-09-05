import { describe, expect, it } from "vitest";
import {
  CERT_LOGO_SIZE,
  GLOW_GETTER_CERT_LINE,
  buildCertificatePdfBase64,
  buildCertificateSvg,
  certificateThemeFor,
  isGlowGetterAudience,
  resolveCertificateBody,
  resolveCertificateHeadings,
} from "./certificates";

const baseSvgInput = {
  title: "You're a Glow Getter!",
  subtitle: "Kids Certificate of Belonging",
  memberName: "Jordan Glow",
  bodyText: "Sample body text for the certificate.",
  signoff: "T + E · Get Your Side Hustle",
  footerLine: "Four wizards. One family adventure.",
  tierLabel: "Free",
  audienceLabel: "Kids",
  issuedAt: "2026-07-19T12:00:00.000Z",
  audienceRaw: "kids",
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

describe("age-group specific certificates", () => {
  it("maps each audience to its own corner, honor, and colors", () => {
    expect(certificateThemeFor("kids").corner).toBe("Kids Side Hustle Corner");
    expect(certificateThemeFor("kids").honor).toBe("Glow Getter");
    expect(certificateThemeFor("junior").corner).toBe("Teens Side Hustle Corner");
    expect(certificateThemeFor("teen").honor).toBe("Young CEO");
    expect(certificateThemeFor("senior").corner).toBe("Seniors Corner");
    expect(certificateThemeFor("adult").honor).toBe("GYSH Family Member");
    expect(certificateThemeFor("kids").accent).not.toBe(certificateThemeFor("teens").accent);
    expect(certificateThemeFor("seniors").gold).not.toBe(certificateThemeFor("kids").gold);
  });

  it("uses age-group headings for kids/teens/seniors and the adult template for adults", () => {
    const adultTpl = { title: "Custom Adult Title", subtitle: "Custom Adult Subtitle" };
    expect(resolveCertificateHeadings("adult", adultTpl)).toEqual(adultTpl);
    expect(resolveCertificateHeadings("kids", adultTpl).title).toMatch(/Glow Getter/i);
    expect(resolveCertificateHeadings("teens", adultTpl).title).toMatch(/Young Hustler/i);
    expect(resolveCertificateHeadings("senior", adultTpl).title).toMatch(/Seniors Corner/i);
  });

  it("prints the member name and age-group ribbon on SVG and PDF", () => {
    const kids = buildCertificateSvg(baseSvgInput);
    expect(kids).toContain("Jordan Glow");
    expect(kids).toContain("KIDS");
    expect(kids).toContain("Glow Getter");
    expect(kids).toContain("Kids Side Hustle Corner");

    const seniors = buildCertificateSvg({
      ...baseSvgInput,
      title: "Welcome to Seniors Corner",
      subtitle: "Certificate of Membership",
      memberName: "Evelyn Irving",
      audienceLabel: "Seniors",
      audienceRaw: "senior",
      tierLabel: "Pro",
    });
    expect(seniors).toContain("Evelyn Irving");
    expect(seniors).toContain("Seniors Corner");
    expect(seniors).toContain("WISE");
    expect(seniors).not.toContain("Glow Getter");

    const pdf = atob(
      buildCertificatePdfBase64({
        ...baseSvgInput,
        memberName: "Jordan Glow",
        audienceRaw: "kids",
      }),
    );
    expect(pdf).toContain("Jordan Glow");
    expect(pdf).toContain("Kids Side Hustle Corner");
  });
});
