import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { render } from '@react-email/components'
import { SignupEmail } from '../signup'
import { InviteEmail } from '../invite'
import { MagicLinkEmail } from '../magic-link'
import { RecoveryEmail } from '../recovery'
import { EmailChangeEmail } from '../email-change'
import { ReauthenticationEmail } from '../reauthentication'
import { DEFAULT_EMAIL_SITE_URL } from '../email-header'

const GETPARTB = 'https://getpartb.com'
const ASSET_LOGO = `${DEFAULT_EMAIL_SITE_URL}/email-logo.png`

const authTemplates = [
  {
    name: 'signup',
    component: SignupEmail,
    props: {
      siteName: 'The Medicare Optimizer',
      siteUrl: GETPARTB,
      recipient: 'user@example.com',
      confirmationUrl: `${GETPARTB}/confirm`,
    },
  },
  {
    name: 'invite',
    component: InviteEmail,
    props: {
      siteName: 'The Medicare Optimizer',
      siteUrl: GETPARTB,
      confirmationUrl: `${GETPARTB}/invite`,
    },
  },
  {
    name: 'magic-link',
    component: MagicLinkEmail,
    props: {
      siteName: 'The Medicare Optimizer',
      siteUrl: GETPARTB,
      recipient: 'user@example.com',
      confirmationUrl: `${GETPARTB}/magic`,
    },
  },
  {
    name: 'recovery',
    component: RecoveryEmail,
    props: {
      siteName: 'The Medicare Optimizer',
      siteUrl: GETPARTB,
      recipient: 'user@example.com',
      confirmationUrl: `${GETPARTB}/reset`,
    },
  },
  {
    name: 'email-change',
    component: EmailChangeEmail,
    props: {
      siteName: 'The Medicare Optimizer',
      siteUrl: GETPARTB,
      email: 'new@example.com',
      oldEmail: 'old@example.com',
      newEmail: 'new@example.com',
      confirmationUrl: `${GETPARTB}/email-change`,
    },
  },
  {
    name: 'reauthentication',
    component: ReauthenticationEmail,
    props: {
      siteUrl: GETPARTB,
      token: '123456',
    },
  },
] as const

describe('auth email headers', () => {
  it.each(authTemplates)(
    '$name loads the logo from the app asset host when siteUrl is getpartb.com',
    async ({ component: Component, props }) => {
      const html = await render(React.createElement(Component, props))
      expect(html).toContain(ASSET_LOGO)
      expect(html).not.toContain(`${GETPARTB}/email-logo.png`)
      expect(html).toContain('email-brand-logo')
      expect(html).toContain('alt="The Medicare Optimizer"')
    },
  )
})
