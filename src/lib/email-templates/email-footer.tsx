import * as React from "react";
import { Hr, Img, Link, Section, Text } from "@react-email/components";
import { emailFooterLogoHeight, emailFooterLogoUrl, resolveEmailSiteUrl } from "./email-header";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { TPMO_PLATFORM_DISCLAIMER } from "@/lib/medicare-disclaimers";

/** Full wordmark — smaller than header but wide enough to read. */
export const EMAIL_FOOTER_LOGO_WIDTH_MOBILE = 200;
export const EMAIL_FOOTER_LOGO_WIDTH_DESKTOP = 280;
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
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media only screen and (min-width: 480px) {
                .email-footer-brand-logo {
                  width: ${EMAIL_FOOTER_LOGO_WIDTH_DESKTOP}px !important;
                  height: ${emailFooterLogoHeight(EMAIL_FOOTER_LOGO_WIDTH_DESKTOP)}px !important;
                  max-width: 100% !important;
                }
              }
            `,
          }}
        />
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
      </Section>
      <Text style={contactLine}>
        Contact:{" "}
        <Link href={`mailto:${contactEmail}`} style={link}>
          {contactEmail}
        </Link>
      </Text>
      <Text style={disclaimer}>
        <strong>TPMO:</strong> {TPMO_PLATFORM_DISCLAIMER}
      </Text>
      <Text style={disclaimer}>
        <strong>De-identification:</strong> {SITE_BRAND_NAME} uses de-identified Medicare plan
        scenarios for educational comparison. Our scenario tools do not collect or store Social
        Security numbers, Medicare Beneficiary Identifiers (MBI), full dates of birth, or other
        protected health information.
      </Text>
      <Text style={disclaimer}>
        <strong>Medicare notice:</strong> This tool compares sample Medicare plan scenarios for
        educational purposes only. It is not a complete listing of plans available in your area. For
        a complete listing, contact{" "}
        <Link href="https://www.medicare.gov" style={link}>
          Medicare.gov
        </Link>{" "}
        or 1-800-MEDICARE (1-800-633-4227).
      </Text>
      <Text style={disclaimer}>
        <strong>Disclaimer:</strong> {SITE_BRAND_NAME} is an educational and comparison tool
        only. We do not sell insurance, act as a licensed agent, or provide personalized legal, tax,
        or medical advice. Plan names, premiums, and benefits shown are estimated based on publicly
        available CMS data and may differ from actual carrier offerings in your area. Always verify
        details with a licensed insurance agent or by visiting{" "}
        <Link href="https://www.medicare.gov" style={link}>
          Medicare.gov
        </Link>{" "}
        before enrolling. We are not affiliated with the U.S. government or the Medicare program.
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

const brandLink = {
  display: "inline-block",
  textDecoration: "none",
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
