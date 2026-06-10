import * as React from 'react'
import { render } from '@react-email/components'
import {
  EmailHeader,
  resolveEmailSiteUrl,
  resolveEmailAssetUrl,
  DEFAULT_EMAIL_SITE_URL,
} from './email-header'
import { EmailFooter } from './email-footer'

/** True when HTML includes the current full email logo from the asset host. */
export function hasCurrentEmailHeader(html: string): boolean {
  const assetHost = resolveEmailAssetUrl()
  return (
    html.includes(`${assetHost}/email-logo.png`) &&
    html.includes('email-brand-logo')
  ) || (html.includes('src="/email-logo.png"') && html.includes('email-brand-logo'))
}

export function hasEmailFooter(html: string): boolean {
  return html.includes('De-identification:')
}

function stripLegacyEmailBranding(html: string): string {
  const assetHost = resolveEmailAssetUrl()
  let result = html
  result = result.replace(/<img[^>]+email-logo\.png[^>]*>/gi, (tag) => {
    if (!tag.includes('email-brand-logo')) return tag
    return tag.includes(assetHost) || tag.includes('src="/email-logo.png"') ? tag : ''
  })
  result = result.replace(/<img[^>]+email-header-logo\.png[^>]*>/gi, '')
  result = result.replace(/<img[^>]+email-footer-logo\.png[^>]*>/gi, (tag) =>
    tag.includes(assetHost) ? tag : '',
  )
  result = result.replace(
    /<[^>]+class="[^"]*email-header-(?:the|medicare|optimizer)[^"]*"[^>]*>[\s\S]*?<\/(?:p|td|div|span|a|tr|table)>/gi,
    '',
  )
  return result
}

function injectAfterBodyOpen(html: string, fragment: string): string {
  const match = html.match(/<body[^>]*>/i)
  if (!match || match.index == null) return fragment + html
  const insertAt = match.index + match[0].length
  return html.slice(0, insertAt) + fragment + html.slice(insertAt)
}

function injectBeforeBodyClose(html: string, fragment: string): string {
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${fragment}</body>`)
  }
  return html + fragment
}

/** Ensure outbound HTML includes the shared header/footer shell. */
export async function ensureEmailBranding(
  html: string,
  opts?: { siteUrl?: string; unsubscribeToken?: string },
): Promise<string> {
  const siteUrl = opts?.siteUrl ?? resolveEmailSiteUrl() ?? DEFAULT_EMAIL_SITE_URL
  let result = stripLegacyEmailBranding(html)

  if (!hasCurrentEmailHeader(result)) {
    const headerHtml = await render(React.createElement(EmailHeader, { siteUrl }))
    result = injectAfterBodyOpen(result, headerHtml)
  }

  if (!hasEmailFooter(result)) {
    const footerHtml = await render(
      React.createElement(EmailFooter, {
        siteUrl,
        unsubscribeToken: opts?.unsubscribeToken,
      }),
    )
    result = injectBeforeBodyClose(result, footerHtml)
  }

  return result
}
