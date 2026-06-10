import * as React from 'react'
import { render } from '@react-email/components'
import type { ComponentType } from 'react'

// Transactional (registry-style)
import { template as newRegistrationAdmin } from './new-registration-admin'
import { template as welcome } from './welcome'
import { template as agentAssignment } from './agent-assignment'
import { template as contactRequest } from './contact-request'
import { template as scenarioClaimed } from './scenario-claimed'

// Auth (component default exports)
import { SignupEmail } from './signup'
import { InviteEmail } from './invite'
import { MagicLinkEmail } from './magic-link'
import { RecoveryEmail } from './recovery'
import { EmailChangeEmail } from './email-change'
import { ReauthenticationEmail } from './reauthentication'

export type TemplateKind = 'transactional' | 'auth'

export interface TemplateDescriptor {
  name: string
  kind: TemplateKind
  displayName: string
  description: string
  trigger: string
  defaultSubject: string
  component: ComponentType<any>
  sampleProps: Record<string, any>
}

const SITE_NAME = 'The Medicare Optimizer'
const SITE_URL = 'https://mypartb.pages.dev'

const authSampleProps = {
  siteName: SITE_NAME,
  siteUrl: SITE_URL,
  recipient: 'jane@example.com',
  confirmationUrl: 'https://example.com/confirm?token=sample',
  token: '123456',
  email: 'jane@example.com',
  oldEmail: 'jane.old@example.com',
  newEmail: 'jane.new@example.com',
}

function subjectOf(entry: { subject: string | ((d: any) => string) }, sample: Record<string, any>) {
  return typeof entry.subject === 'function' ? entry.subject(sample) : entry.subject
}

export const ALL_TEMPLATES: TemplateDescriptor[] = [
  {
    name: 'new-registration-admin',
    kind: 'transactional',
    displayName: newRegistrationAdmin.displayName ?? 'New registration (admin)',
    description: 'Internal alert to admins when a user signs up and is pending approval.',
    trigger: 'New user completes registration.',
    defaultSubject: subjectOf(newRegistrationAdmin, newRegistrationAdmin.previewData ?? {}),
    component: newRegistrationAdmin.component,
    sampleProps: newRegistrationAdmin.previewData ?? {},
  },
  {
    name: 'welcome',
    kind: 'transactional',
    displayName: welcome.displayName ?? 'Welcome',
    description: 'Greets a new user after their account is approved.',
    trigger: 'Admin enables a previously disabled account.',
    defaultSubject: subjectOf(welcome, welcome.previewData ?? {}),
    component: welcome.component,
    sampleProps: welcome.previewData ?? { recipientName: 'Jane' },
  },
  {
    name: 'agent-assignment',
    kind: 'transactional',
    displayName: agentAssignment.displayName ?? 'Agent assignment',
    description: 'Notifies an agent that a scenario has been assigned to them.',
    trigger: 'Admin assigns an agent to a scenario.',
    defaultSubject: subjectOf(agentAssignment, agentAssignment.previewData ?? {}),
    component: agentAssignment.component,
    sampleProps: agentAssignment.previewData ?? {},
  },
  {
    name: 'contact-request',
    kind: 'transactional',
    displayName: contactRequest.displayName ?? 'Contact request',
    description: 'Acknowledges a visitor who asked an expert to contact them.',
    trigger: 'Visitor submits the "talk to an expert" form.',
    defaultSubject: subjectOf(contactRequest, contactRequest.previewData ?? {}),
    component: contactRequest.component,
    sampleProps: contactRequest.previewData ?? {},
  },
  {
    name: 'scenario-claimed',
    kind: 'transactional',
    displayName: scenarioClaimed.displayName ?? 'Scenario claimed',
    description: 'Tells the scenario creator that an advisor picked up their scenario.',
    trigger: 'Advisor claims a scenario via lookup code.',
    defaultSubject: subjectOf(scenarioClaimed, scenarioClaimed.previewData ?? {}),
    component: scenarioClaimed.component,
    sampleProps: scenarioClaimed.previewData ?? {},
  },
  {
    name: 'signup',
    kind: 'auth',
    displayName: 'Signup confirmation',
    description: 'Email confirmation link sent right after sign-up.',
    trigger: 'User signs up with email and password.',
    defaultSubject: 'Confirm your email',
    component: SignupEmail,
    sampleProps: authSampleProps,
  },
  {
    name: 'invite',
    kind: 'auth',
    displayName: 'Invitation',
    description: 'Invitation link for a new user added by an admin.',
    trigger: 'Admin invites a user from the auth dashboard.',
    defaultSubject: "You've been invited",
    component: InviteEmail,
    sampleProps: authSampleProps,
  },
  {
    name: 'magiclink',
    kind: 'auth',
    displayName: 'Magic link',
    description: 'Passwordless sign-in link.',
    trigger: 'User requests a magic-link login.',
    defaultSubject: 'Your login link',
    component: MagicLinkEmail,
    sampleProps: authSampleProps,
  },
  {
    name: 'recovery',
    kind: 'auth',
    displayName: 'Password reset',
    description: 'Password reset link.',
    trigger: 'User requests "forgot password".',
    defaultSubject: 'Reset your password',
    component: RecoveryEmail,
    sampleProps: authSampleProps,
  },
  {
    name: 'email_change',
    kind: 'auth',
    displayName: 'Email change confirmation',
    description: 'Confirms a change of email address on an existing account.',
    trigger: 'User updates their email address.',
    defaultSubject: 'Confirm your new email',
    component: EmailChangeEmail,
    sampleProps: authSampleProps,
  },
  {
    name: 'reauthentication',
    kind: 'auth',
    displayName: 'Reauthentication code',
    description: 'Verification code for sensitive actions.',
    trigger: 'User performs an action that requires re-authentication.',
    defaultSubject: 'Your verification code',
    component: ReauthenticationEmail,
    sampleProps: authSampleProps,
  },
]

export function findTemplate(name: string): TemplateDescriptor | undefined {
  return ALL_TEMPLATES.find((t) => t.name === name)
}

/** Render a template's default HTML using its sample props. Server-only. */
export async function renderDefaultHtml(name: string): Promise<string> {
  const tpl = findTemplate(name)
  if (!tpl) throw new Error(`Unknown template: ${name}`)
  const element = React.createElement(tpl.component, tpl.sampleProps)
  return await render(element)
}
