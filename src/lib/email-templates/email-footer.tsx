import * as React from "react";
import { Column, Hr, Img, Link, Row, Section, Text } from "@react-email/components";
import {
  EMAIL_FOOTER_LOGO_WIDTH_DESKTOP,
  EMAIL_FOOTER_LOGO_WIDTH_MOBILE,
  emailFooterLogoHeight,
  emailFooterLogoUrl,
  resolveEmailSiteUrl,
} from "./email-header";
import { SITE_BRAND_NAME, SITE_BRAND_THE, formatSiteCopyright } from "@/lib/site-brand";
import { PRODUCTION_SITE_ORIGIN, PUBLIC_WEBSITE_HOST } from "@/lib/site-url";
import {
  TPMO_PLATFORM_DISCLAIMER,
  GOVERNMENT_MEDICARE_AFFILIATION_DISCLAIMER,
  MEDICARE_BENCHMARK_NOTICE,
  BENCHMARK_TOOL_DISCLAIMER,
} from "@/lib/medicare-disclaimers";

function medicareGovLinkedText(body: string) {
  const parts = body.split("Medicare.gov");
  if (parts.length === 1) return body;
  return parts.flatMap((part, index) =>
    index < parts.length - 1
      ? [
          part,
          <Link key={`mg-${index}`} href="https://www.medicare.gov" style={link}>
            Medicare.gov
          </Link>,
        ]
      : [part],
  );
}

/** Site footer mini monogram — matches BrandLogo size="footer". */
export { EMAIL_FOOTER_LOGO_WIDTH_MOBILE, EMAIL_FOOTER_LOGO_WIDTH_DESKTOP };
export const DEFAULT_CONTACT_EMAIL = "info@MyPartB.com";

interface EmailFooterProps {
  siteUrl?: string;
  contactEmail?: string;
  unsubscribeToken?: string;
}

export function EmailFooter({
  siteUrl,
  contactEmail = DEFAULT_CONTACT_EMAIL,
  unsubscribeToken,
}: EmailFooterProps) {
  const baseUrl = resolveEmailSiteUrl(siteUrl);
  const logoUrl = emailFooterLogoUrl();
  const mobileWidth = EMAIL_FOOTER_LOGO_WIDTH_MOBILE;
  const mobileHeight = emailFooterLogoHeight(mobileWidth);
  const unsubscribeHref = unsubscribeToken
    ? `${baseUrl}/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
    : undefined;

  return (
    <Section style={footerSection}>
      <Hr style={hr} />
      <Section style={brandSection}>
        <Row style={brandRow}>
          <Column style={brandLogoCol}>
            <Link href={baseUrl} style={brandLink}>
              <Img
                src={logoUrl}
                alt={SITE_BRAND_NAME}
                width={mobileWidth}
                height={mobileHeight}
                className="email-footer-brand-logo"
                style={footerLogoImg}
              />
            </Link>
          </Column>
          <Column style={brandTextCol}>
            <Text style={brandLine}>
              <Link href={PRODUCTION_SITE_ORIGIN} style={link}>
                {PUBLIC_WEBSITE_HOST}
              </Link>
              <span style={brandDivider}> · </span>
              {formatSiteCopyright()}
            </Text>
          </Column>
        </Row>
      </Section>
      <Text style={contactLine}>
        Contact:{" "}
        <Link href={`mailto:${contactEmail}`} style={link}>
          {contactEmail}
        </Link>
      </Text>
      <Text style={disclaimer}>
        <strong>Government affiliation:</strong> {GOVERNMENT_MEDICARE_AFFILIATION_DISCLAIMER}
      </Text>
      <Text style={disclaimer}>
        <strong>TPMO:</strong> {TPMO_PLATFORM_DISCLAIMER}
      </Text>
      <Text style={disclaimer}>
        <strong>De-identification:</strong> {SITE_BRAND_THE} uses de-identified Medicare plan
        scenarios for educational comparison. Our scenario tools do not collect or store Social
        Security numbers, Medicare Beneficiary Identifiers (MBI), full dates of birth, or other
        protected health information.
      </Text>
      <Text style={disclaimer}>
        <strong>Medicare notice:</strong> {medicareGovLinkedText(MEDICARE_BENCHMARK_NOTICE)}
      </Text>
      <Text style={disclaimer}>
        <strong>Disclaimer:</strong> {medicareGovLinkedText(BENCHMARK_TOOL_DISCLAIMER)}
      </Text>
      {unsubscribeHref ? (
        <Text style={unsubscribeLine}>
          <Link href={unsubscribeHref} style={link}>
            Unsubscribe
          </Link>{" "}
          from non-essential emails.
        </Text>
      ) : null}
    </Section>
  );
}

const footerSection = {
  margin: "32px 0 0",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "24px 0 20px",
};

const brandSection = {
  margin: "0 0 16px",
  textAlign: "left" as const,
};

const brandRow = {
  margin: "0",
};

const brandLogoCol = {
  width: `${EMAIL_FOOTER_LOGO_WIDTH_MOBILE + 8}px`,
  verticalAlign: "middle" as const,
  paddingRight: "8px",
};

const brandTextCol = {
  verticalAlign: "middle" as const,
};

const brandLink = {
  display: "inline-block",
  textDecoration: "none",
  verticalAlign: "middle" as const,
};

const footerLogoImg = {
  display: "block",
  margin: "0",
  border: "0",
  outline: "none",
  textDecoration: "none",
  width: `${EMAIL_FOOTER_LOGO_WIDTH_MOBILE}px`,
  maxWidth: `${EMAIL_FOOTER_LOGO_WIDTH_DESKTOP}px`,
  height: "auto",
};

const brandLine = {
  fontSize: "11px",
  color: "#94a3b8",
  margin: "0",
  lineHeight: "1.4",
  textAlign: "left" as const,
};

const brandDivider = {
  color: "#94a3b8",
};

const contactLine = {
  fontSize: "12px",
  color: "#64748b",
  margin: "0 0 16px",
  lineHeight: "1.5",
  textAlign: "left" as const,
};

const disclaimer = {
  fontSize: "11px",
  color: "#64748b",
  margin: "0 0 12px",
  lineHeight: "1.55",
  textAlign: "left" as const,
};

const unsubscribeLine = {
  fontSize: "11px",
  color: "#94a3b8",
  margin: "8px 0 0",
  lineHeight: "1.5",
  textAlign: "left" as const,
};

const link = {
  color: "#003888",
  textDecoration: "underline",
};
