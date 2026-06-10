import * as React from 'react'
import { Img, Link, Section } from '@react-email/components'
import { getEnvVariable } from '../env'

export const EMAIL_LOGO_PATH = '/email-logo.png'
export const EMAIL_FOOTER_LOGO_PATH = '/email-footer-logo.png'
export const DEFAULT_EMAIL_SITE_URL = 'https://mypartb.pages.dev'

/** Source asset is 914×253 (full horizontal logo). */
export const EMAIL_LOGO_ASPECT = 253 / 914
/** Source asset is 375×260 (icon mark). */
export const EMAIL_FOOTER_LOGO_ASPECT = 260 / 375
export const EMAIL_HEADER_LOGO_WIDTH_MOBILE = 280
export const EMAIL_HEADER_LOGO_WIDTH_DESKTOP = 480

export function emailLogoHeight(width: number): number {
  return Math.round(width * EMAIL_LOGO_ASPECT)
}

export function emailFooterLogoHeight(width: number): number {
  return Math.round(width * EMAIL_FOOTER_LOGO_ASPECT)
}

/** App/site links in copy may use the recipient-facing domain. */
export function resolveEmailSiteUrl(siteUrl?: string): string {
  return (siteUrl || getEnvVariable('PUBLIC_SITE_URL') || DEFAULT_EMAIL_SITE_URL).replace(
    /\/$/,
    '',
  )
}

/** Static email assets always load from the deployed app origin. */
export function resolveEmailAssetUrl(): string {
  return (getEnvVariable('PUBLIC_SITE_URL') || DEFAULT_EMAIL_SITE_URL).replace(/\/$/, '')
}

export function emailLogoUrl(): string {
  return `${resolveEmailAssetUrl()}${EMAIL_LOGO_PATH}`
}

export function emailFooterLogoUrl(): string {
  return `${resolveEmailAssetUrl()}${EMAIL_FOOTER_LOGO_PATH}`
}

interface EmailHeaderProps {
  siteUrl?: string
  href?: string
}

export function EmailHeader({ siteUrl, href }: EmailHeaderProps) {
  const logoUrl = emailLogoUrl()
  const linkHref = href ?? resolveEmailSiteUrl(siteUrl)
  const mobileWidth = EMAIL_HEADER_LOGO_WIDTH_MOBILE
  const mobileHeight = emailLogoHeight(mobileWidth)

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
          alt="The Medicare Optimizer"
          width={mobileWidth}
          height={mobileHeight}
          className="email-brand-logo"
          style={logoImg}
        />
      </Link>
    </Section>
  )
}

const headerSection = {
  margin: '0 0 24px',
  padding: '8px 16px 0',
  textAlign: 'center' as const,
  backgroundColor: 'transparent',
}

const logoLink = {
  display: 'block',
  textDecoration: 'none',
  margin: '0 auto',
}

const logoImg = {
  display: 'block',
  margin: '0 auto',
  border: '0',
  outline: 'none',
  textDecoration: 'none',
  width: '100%',
  maxWidth: `${EMAIL_HEADER_LOGO_WIDTH_DESKTOP}px`,
  height: 'auto',
}
