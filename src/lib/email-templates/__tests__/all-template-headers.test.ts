import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { render } from '@react-email/components'
import { ALL_TEMPLATES, renderDefaultHtmlWithMergeFields } from '../all-templates.server'
import { ensureEmailBranding, countEmailHeaderLogos } from '../email-branding.server'
import { DEFAULT_EMAIL_SITE_URL } from '../email-header'

const EXPECTED_LOGO = `${DEFAULT_EMAIL_SITE_URL}/email-logo.png`

describe('email template headers', () => {
  it.each(ALL_TEMPLATES.map((t) => [t.name, t.kind] as const))(
    '%s (%s) includes the branded header like scenario-claimed',
    async (name) => {
      const html = await renderDefaultHtmlWithMergeFields(name)
      expect(html).toContain('email-brand-logo')
      expect(html).toContain('email-header-copyright')

      const branded = await ensureEmailBranding(html, { siteUrl: 'https://getpartb.com' })
      expect(countEmailHeaderLogos(branded)).toBe(1)
      expect(branded).toContain('email-brand-logo')
      expect(branded).toContain('email-header-copyright')
      expect(branded).toMatch(/email-logo\.png/)
      expect(branded).not.toMatch(/src="\{\{siteUrl\}\}\/email-logo\.png"/)
    },
  )

  it('scenario-claimed reference header uses the app asset host for the logo', async () => {
    const tpl = ALL_TEMPLATES.find((t) => t.name === 'scenario-claimed')!
    const html = await render(React.createElement(tpl.component, tpl.sampleProps))
    expect(html).toContain(EXPECTED_LOGO)
    expect(html).toContain('email-brand-logo')
  })
})
