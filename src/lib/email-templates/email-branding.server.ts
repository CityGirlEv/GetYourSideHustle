import * as React from 'react'
import { render } from '@react-email/components'
import {
  EmailHeader,
  resolveEmailSiteUrl,
  resolveEmailAssetUrl,
  DEFAULT_EMAIL_SITE_URL,
} from './email-header'
import { EmailFooter } from './email-footer'

/** True when HTML already includes the branded email header logo image. */
export function hasCurrentEmailHeader(html: string): boolean {
  return /<img[^>]*email-brand-logo[^>]*>/i.test(html)
}

export function countEmailHeaderLogos(html: string): number {
  const matches = html.match(/<img[^>]*email-brand-logo[^>]*>/gi)
  return matches?.length ?? 0
}

/** Remove extra header blocks when branding ran more than once (editor + send pipeline). */
export function stripDuplicateEmailHeaders(html: string): string {
  const blockPattern =
    /<table[^>]*role="presentation"[^>]*>[\s\S]*?email-brand-logo[\s\S]*?<\/table>/gi
  let seen = false
  let result = html.replace(blockPattern, (block) => {
    if (!seen) {
      seen = true
      return block
    }
    return ''
  })

  if (countEmailHeaderLogos(result) <= 1) return result

  let firstLogo = true
  result = result.replace(/<img[^>]*email-brand-logo[^>]*>/gi, (tag) => {
    if (firstLogo) {
      firstLogo = false
      return tag
    }
    return ''
  })

  let firstCopyright = true
  result = result.replace(
    /<[^>]*email-header-copyright[^>]*>[\s\S]*?<\/[^>]+>/gi,
    (block) => {
      if (firstCopyright) {
        firstCopyright = false
        return block
      }
      return ''
    },
  )

  return result
}

export function hasEmailFooter(html: string): boolean {
  return html.includes('De-identification:')
}

function stripLegacyEmailBranding(html: string): string {
  const assetHost = resolveEmailAssetUrl()
  let result = html
  result = result.replace(/<img[^>]+email-logo\.png[^>]*>/gi, (tag) => {
    if (tag.includes('email-brand-logo')) return tag
    return ''
  })
  result = result.replace(/<img[^>]+email-header-logo\.png[^>]*>/gi, '')
  result = result.replace(/<img[^>]+email-footer-logo\.png[^>]*>/gi, (tag) =>
    tag.includes('email-footer-brand-logo') ? tag : tag.includes(assetHost) ? tag : '',
  )
  result = result.replace(
    /<[^>]+class="[^"]*email-header-(?:the|medicare|optimizer)[^"]*"[^>]*>[\s\S]*?<\/(?:p|td|div|span|a|tr|table)>/gi,
    '',
  )
  return result
}

/** Resolve header/footer logo src to the deployed app asset host (never siteUrl). */
export function fixBrandedLogoSources(html: string): string {
  const headerLogoUrl = `${resolveOutboundEmailAssetUrl()}/email-logo.png`
  const footerLogoUrl = `${resolveOutboundEmailAssetUrl()}/email-footer-logo.png`

  let result = html.replace(/<img([^>]*class="[^"]*email-brand-logo[^"]*"[^>]*)>/gi, (tag) => {
    if (tag.includes(`src="${headerLogoUrl}"`)) return tag
    return tag.replace(/src="[^"]*"/i, `src="${headerLogoUrl}"`)
  })

  result = result.replace(/<img([^>]*class="[^"]*email-footer-brand-logo[^"]*"[^>]*)>/gi, (tag) => {
    if (tag.includes(`src="${footerLogoUrl}"`)) return tag
    return tag.replace(/src="[^"]*"/i, `src="${footerLogoUrl}"`)
  })

  return result
}

function injectAfterBodyOpen(html: string, fragment: string): string {
  const match = html.match(/<body[^>]*>/i)
  if (!match || match.index == null) return fragment + html
  const insertAt = match.index + match[0].length
  return html.slice(0, insertAt) + fragment + html.slice(insertAt)
}

/** Match scenario-claimed layout: header inside the main content container. */
function injectEmailHeader(html: string, headerHtml: string): string {
  const containerOpen =
    /<table[^>]*role="presentation"[^>]*style="[^"]*max-width:37\.5em[^"]*"[^>]*>\s*<tbody>\s*<tr[^>]*>\s*<td[^>]*>/i
  const match = html.match(containerOpen)
  if (match && match.index != null) {
    const insertAt = match.index + match[0].length
    return html.slice(0, insertAt) + headerHtml + html.slice(insertAt)
  }
  return injectAfterBodyOpen(html, headerHtml)
}

function injectBeforeBodyClose(html: string, fragment: string): string {
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${fragment}</body>`)
  }
  return html + fragment
}

/** Production-facing site URL for outbound email (never localhost). */
export function resolveOutboundEmailSiteUrl(siteUrl?: string): string {
  const raw = (siteUrl ?? resolveEmailSiteUrl()).replace(/\/$/, '')
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw)) {
    return 'https://mypartb.com'
  }
  return raw
}

/** Production asset host for email images (never localhost). */
export function resolveOutboundEmailAssetUrl(): string {
  const raw = resolveEmailAssetUrl()
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw)) {
    return 'https://mypartb.com'
  }
  return raw
}

/** Remove iframe editor scripts/styles accidentally saved from the admin template editor. */
export function stripEmailEditorArtifacts(html: string): string {
  let result = html
  result = result.replace(/<script[\s\S]*?<\/script>/gi, (block) =>
    /tpl-edit|tpl-cmd|designMode/i.test(block) ? '' : block,
  )
  result = result.replace(/<style[\s\S]*?<\/style>/gi, (block) =>
    /cursor:\s*text|::selection/i.test(block) ? '' : block,
  )
  const assetHost = resolveOutboundEmailAssetUrl()
  result = result.replace(/https?:\/\/(?:localhost|127\.0\.0\.1):\d+/gi, assetHost)
  return result
}

/** Ensure outbound HTML includes the shared header/footer shell. */
export async function ensureEmailBranding(
  html: string,
  opts?: { siteUrl?: string; unsubscribeToken?: string },
): Promise<string> {
  const siteUrl = resolveOutboundEmailSiteUrl(opts?.siteUrl)
  let result = stripEmailEditorArtifacts(stripLegacyEmailBranding(html))
  result = stripDuplicateEmailHeaders(result)

  if (!hasCurrentEmailHeader(result)) {
    const headerHtml = await render(React.createElement(EmailHeader, { siteUrl }))
    result = injectEmailHeader(result, headerHtml)
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

  result = fixBrandedLogoSources(result)
  return stripDuplicateEmailHeaders(result)
}
