import { TEMPLATES } from '@/lib/email-templates/registry'
import {
  DEFAULT_EMAIL_SITE_URL,
  EMAIL_FOOTER_LOGO_PATH,
  EMAIL_LOGO_PATH,
} from '@/lib/email-templates/email-header'

export const AUTH_SAMPLE_PROPS: Record<string, unknown> = {
  siteName: 'The Medicare Optimizer',
  siteUrl: 'https://mypartb.pages.dev',
  recipient: 'jane@example.com',
  confirmationUrl: 'https://example.com/confirm?token=sample',
  token: '123456',
  email: 'jane@example.com',
  oldEmail: 'jane.old@example.com',
  newEmail: 'jane.new@example.com',
}

export const AUTH_TEMPLATE_NAMES = new Set([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'reauthentication',
])

/** Legacy Lovable / Go preview literals still found in saved auth overrides. */
export const AUTH_LEGACY_PLACEHOLDERS: Array<{ sample: string; key: string }> = [
  { sample: 'user@example.test', key: 'email' },
  { sample: 'https://themedicareoptimizer.lovable.app', key: 'confirmationUrl' },
  { sample: 'themedicareoptimizer', key: 'siteName' },
]

/** Merge fields available per auth template (admin editor + send pipeline). */
export const AUTH_MERGE_FIELDS_BY_TEMPLATE: Record<string, string[]> = {
  signup: ['siteName', 'siteUrl', 'recipient', 'email', 'confirmationUrl'],
  invite: ['siteName', 'siteUrl', 'confirmationUrl'],
  magiclink: ['siteName', 'siteUrl', 'confirmationUrl'],
  recovery: ['siteName', 'siteUrl', 'confirmationUrl'],
  email_change: ['siteName', 'siteUrl', 'oldEmail', 'newEmail', 'email', 'confirmationUrl'],
  reauthentication: ['token', 'siteUrl', 'siteName'],
}

/** Live auth webhook payload shape for admin test sends. */
export function getAuthTemplateTestData(
  templateName: string,
  recipient: string,
): Record<string, unknown> {
  const baseUrl = 'https://getpartb.com'
  return {
    siteName: 'themedicareoptimizer',
    siteUrl: baseUrl,
    recipient,
    email: recipient,
    confirmationUrl: `${baseUrl}/auth/confirm?token=test-token`,
    token: '123456',
    oldEmail: 'old@example.com',
    newEmail: recipient,
  }
}

/** Shared branding literals replaced in rendered HTML when upgrading to merge fields. */
export const SHARED_MERGE_LITERALS: Array<{ sample: string; key: string }> = [
  { sample: `${DEFAULT_EMAIL_SITE_URL}${EMAIL_LOGO_PATH}`, key: 'emailLogoUrl' },
  { sample: `${DEFAULT_EMAIL_SITE_URL}${EMAIL_FOOTER_LOGO_PATH}`, key: 'emailFooterLogoUrl' },
  { sample: `https://mypartb.com${EMAIL_LOGO_PATH}`, key: 'emailLogoUrl' },
  { sample: `https://mypartb.com${EMAIL_FOOTER_LOGO_PATH}`, key: 'emailFooterLogoUrl' },
  { sample: 'The Medicare Optimizer', key: 'siteName' },
  { sample: 'https://mypartb.pages.dev', key: 'siteUrl' },
  { sample: 'https://mypartb.com', key: 'siteUrl' },
]

/** Subject lines that use dynamic merge tokens instead of preview literals. */
export const TEMPLATE_SUBJECT_MERGE_PATTERNS: Record<string, string> = {
  'new-registration-admin': 'New beta registration — {{fullName}}',
  'account-enabled-admin': 'Account enabled — {{fullName}}',
}

export function getTemplateSampleProps(templateName: string): Record<string, unknown> {
  const registry = TEMPLATES[templateName]
  if (registry?.previewData) return registry.previewData
  if (AUTH_TEMPLATE_NAMES.has(templateName)) return AUTH_SAMPLE_PROPS
  return {}
}

export function isKnownEmailTemplate(templateName: string): boolean {
  return Boolean(TEMPLATES[templateName]) || AUTH_TEMPLATE_NAMES.has(templateName)
}
