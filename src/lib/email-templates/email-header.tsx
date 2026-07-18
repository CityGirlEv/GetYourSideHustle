import * as React from "react";
import { Img, Link, Section } from "@react-email/components";
import { getEnvVariable } from "../env";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { EMAIL_LOGO_CACHE_VERSION } from "@/lib/email-logo-version";

export { SITE_BRAND_NAME as EMAIL_BRAND_NAME };

export const EMAIL_LOGO_PATH = "/email-logo.png";
export const EMAIL_FOOTER_LOGO_PATH = "/email-footer-logo.png";
export const DEFAULT_EMAIL_SITE_URL = "https://www.mypartb.com";
/** Source asset is 1024×308 after transparent trim (tight bottom). */
export const EMAIL_LOGO_ASPECT = 308 / 1024;
/** Footer uses the site mini monogram (footer-mini-logo.png), roughly square. */
export const EMAIL_FOOTER_LOGO_ASPECT = 1;
export const EMAIL_HEADER_LOGO_WIDTH_MOBILE = 300;
export const EMAIL_HEADER_LOGO_WIDTH_DESKTOP = 520;
export const EMAIL_FOOTER_LOGO_WIDTH_MOBILE = 32;
export const EMAIL_FOOTER_LOGO_WIDTH_DESKTOP = 32;

export function emailLogoHeight(width: number): number {
  return Math.round(width * EMAIL_LOGO_ASPECT);
}

export function emailFooterLogoHeight(width: number): number {
  return Math.round(width * EMAIL_FOOTER_LOGO_ASPECT);
}

/** App/site links in copy may use the recipient-facing domain. */
export function resolveEmailSiteUrl(siteUrl?: string): string {
  return (siteUrl || getEnvVariable("PUBLIC_SITE_URL") || DEFAULT_EMAIL_SITE_URL).replace(
    /\/$/,
    "",
  );
}

/** Static email assets always load from the deployed app origin. */
export function resolveEmailAssetUrl(): string {
  return (getEnvVariable("PUBLIC_SITE_URL") || DEFAULT_EMAIL_SITE_URL).replace(/\/$/, "");
}

function versionedAssetPath(pathname: string): string {
  const v = EMAIL_LOGO_CACHE_VERSION;
  return v && v !== "placeholder" ? `${pathname}?v=${encodeURIComponent(v)}` : pathname;
}

export function emailLogoUrl(): string {
  return `${resolveEmailAssetUrl()}${versionedAssetPath(EMAIL_LOGO_PATH)}`;
}

export function emailFooterLogoUrl(): string {
  return `${resolveEmailAssetUrl()}${versionedAssetPath(EMAIL_FOOTER_LOGO_PATH)}`;
}

interface EmailHeaderProps {
  siteUrl?: string;
  href?: string;
}

export function EmailHeader({ siteUrl, href }: EmailHeaderProps) {
  const logoUrl = emailLogoUrl();
  const linkHref = href ?? resolveEmailSiteUrl(siteUrl);
  const mobileWidth = EMAIL_HEADER_LOGO_WIDTH_MOBILE;
  const mobileHeight = emailLogoHeight(mobileWidth);

  return (
    <Section style={headerSection}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media only screen and (min-width: 480px) {
              .email-brand-logo {
                width: ${EMAIL_HEADER_LOGO_WIDTH_DESKTOP}px !important;
                height: ${emailLogoHeight(EMAIL_HEADER_LOGO_WIDTH_DESKTOP)}px !important;
                max-width: 100% !important;
              }
            }
          `,
        }}
      />
      <Link href={linkHref} style={logoLink}>
        <Img
          src={logoUrl}
          alt={SITE_BRAND_NAME}
          width={mobileWidth}
          height={mobileHeight}
          className="email-brand-logo"
          style={logoImg}
        />
      </Link>
    </Section>
  );
}

const headerSection = {
  margin: "0 0 20px",
  padding: "4px 16px 0",
  textAlign: "left" as const,
  backgroundColor: "transparent",
};

const logoLink = {
  display: "block",
  textDecoration: "none",
};

const logoImg = {
  display: "block",
  margin: "0",
  border: "0",
  outline: "none",
  textDecoration: "none",
  width: "100%",
  maxWidth: `${EMAIL_HEADER_LOGO_WIDTH_DESKTOP}px`,
  height: "auto",
};
