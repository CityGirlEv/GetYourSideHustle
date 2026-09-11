import { describe, expect, it } from "vitest";
import {
  CERT_DEFAULT_BODY,
  CERT_MOTTO,
  CERT_ORG_NAME,
  GLOW_GETTER_CERT_LINE,
  buildCertificatePdfBase64,
  buildCertificateSvg,
  certificateThemeFor,
  isGlowGetterAudience,
  liveCertificateArtInput,
  resolveCertificateBody,
  resolveCertificateHeadings,
  spellOutGysh,
} from "./certificates";

const baseSvgInput = {
  title: "You're a Glow Getter!",
  subtitle: "Kids Certificate of Belonging",
  memberName: "Jordan Glow",
  bodyText: CERT_DEFAULT_BODY,
  signoff: CERT_MOTTO,
  footerLine: "Ideas. Action. Income. Freedom.",
  tierLabel: "Free",
  audienceLabel: "Kids",
  issuedAt: "2026-07-19T12:00:00.000Z",
  audienceRaw: "kids",
};

describe("family certificate art", () => {
  it("prints the official mockup with the member name overlaid", () => {
    const svg = buildCertificateSvg(baseSvgInput);
    const pdf = atob(buildCertificatePdfBase64(baseSvgInput));
    expect(CERT_ORG_NAME).toBe("Get Your Side Hustle");
    expect(svg).toContain("data:image/jpeg;base64,");
    expect(svg).toContain("Jordan Glow");
    expect(svg).toContain('aria-label="Get Your Side Hustle family certificate for Jordan Glow"');
    expect(svg).not.toMatch(/>GYSH</);
    expect(pdf).toContain("Jordan Glow");
    expect(pdf).toContain("/DCTDecode");
  });

  it("expands the GYSH acronym in stored template copy", () => {
    expect(spellOutGysh("Welcome to the GYSH Family")).toBe(
      "Welcome to the Get Your Side Hustle Family",
    );
    expect(spellOutGysh(CERT_DEFAULT_BODY)).toBe(CERT_DEFAULT_BODY);
  });

  it("rebuilds preview art from the live template instead of a stored SVG", () => {
    const art = liveCertificateArtInput(
      {
        member_name: "Jordan Glow",
        membership_tier: "free",
        audience: "kids",
        issued_at: "2026-07-19T12:00:00.000Z",
      },
      {
        id: "welcome_family",
        title: "Welcome to the GYSH Family",
        subtitle: "Certificate of Membership",
        body: CERT_DEFAULT_BODY,
        signoff: CERT_MOTTO,
        footerLine: "Ideas. Action. Income. Freedom.",
        updatedAt: "2026-07-19T12:00:00.000Z",
        updatedBy: "system",
      },
    );
    const svg = buildCertificateSvg(art);
    expect(art.memberName).toBe("Jordan Glow");
    expect(svg).toContain("data:image/jpeg;base64,");
    expect(svg).toContain("Jordan Glow");
  });

  it("keeps mockup corner copy in the official art constants", () => {
    expect(certificateThemeFor("kids").seal).toBe("GLOW");
    expect(certificateThemeFor("teen").seal).toBe("CEO");
    expect(certificateThemeFor("adult").seal).toBe("FAMILY");
    expect(certificateThemeFor("senior").seal).toBe("WISE");
    const seniors = buildCertificateSvg({
      ...baseSvgInput,
      memberName: "Evelyn Irving",
      audienceLabel: "Seniors",
      audienceRaw: "senior",
    });
    expect(seniors).toContain("Evelyn Irving");
    expect(seniors).not.toContain("SENIORS CORNER MEMBER");
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
  it("maps each audience to its own corner and honor", () => {
    expect(certificateThemeFor("kids").corner).toBe("Kids Side Hustle Corner");
    expect(certificateThemeFor("kids").honor).toBe("Glow Getter");
    expect(certificateThemeFor("junior").corner).toBe("Teens Side Hustle Corner");
    expect(certificateThemeFor("teen").honor).toBe("Young CEO");
    expect(certificateThemeFor("senior").corner).toBe("Seniors Corner");
    expect(certificateThemeFor("adult").honor).toBe("Family Member");
  });

  it("uses age-group headings for kids/teens/seniors and the adult template for adults", () => {
    const adultTpl = { title: "Custom Adult Title", subtitle: "Custom Adult Subtitle" };
    expect(resolveCertificateHeadings("adult", adultTpl)).toEqual(adultTpl);
    expect(resolveCertificateHeadings("kids", adultTpl).title).toMatch(/Glow Getter/i);
    expect(resolveCertificateHeadings("teens", adultTpl).title).toMatch(/Young Hustler/i);
    expect(resolveCertificateHeadings("senior", adultTpl).title).toMatch(/Seniors Corner/i);
  });

  it("prints the member name on SVG and PDF", () => {
    const kids = buildCertificateSvg(baseSvgInput);
    expect(kids).toContain("Jordan Glow");

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
    expect(seniors).not.toContain("Glow Getter");

    const pdf = atob(
      buildCertificatePdfBase64({
        ...baseSvgInput,
        memberName: "Jordan Glow",
        audienceRaw: "kids",
      }),
    );
    expect(pdf).toContain("Jordan Glow");
  });
});
