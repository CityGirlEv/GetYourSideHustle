import { describe, it, expect } from 'vitest'
import {
  hasCurrentEmailHeader,
  hasEmailFooter,
  ensureEmailBranding,
} from '../email-branding.server'

describe('email branding helpers', () => {
  it('detects the current header markers', () => {
    expect(hasCurrentEmailHeader('<img class="email-brand-logo" src="/email-logo.png">')).toBe(
      true,
    )
    expect(hasCurrentEmailHeader('<img src="/email-header-logo.png">')).toBe(false)
  })

  it('injects header and footer when missing', async () => {
    const html = '<!doctype html><html><body><p>Hello</p></body></html>'
    const branded = await ensureEmailBranding(html, { unsubscribeToken: 'abc123' })
    expect(hasCurrentEmailHeader(branded)).toBe(true)
    expect(hasEmailFooter(branded)).toBe(true)
    expect(branded).toContain('Hello')
    expect(branded).toContain('email-logo.png')
  })

  it('replaces a broken logo hosted on the marketing domain', async () => {
    const html =
      '<body><img class="email-brand-logo" src="https://getpartb.com/email-logo.png"><p>Hi</p></body>'
    const branded = await ensureEmailBranding(html, { siteUrl: 'https://getpartb.com' })
    expect(branded).not.toContain('getpartb.com/email-logo.png')
    expect(branded).toContain('https://mypartb.pages.dev/email-logo.png')
    expect(branded).toContain('Hi')
  })

  it('leaves already-branded html unchanged', async () => {
    const html =
      '<body><img class="email-brand-logo" src="https://mypartb.pages.dev/email-logo.png"><p>Hi</p>De-identification: text</body>'
    const branded = await ensureEmailBranding(html)
    expect(branded).toBe(html)
  })
})
