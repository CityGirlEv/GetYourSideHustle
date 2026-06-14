import { describe, it, expect } from 'vitest'
import {
  applyTemplateMergeFields,
  resolveTemplateContent,
  upgradeOverrideLiteralsToMergeFields,
  listTemplateMergeFields,
  normalizeAuthBracePlaceholders,
  stripAuthTransactionalGreetings,
} from '../template-merge.server'

describe('template merge fields', () => {
  it('replaces {{tokens}} with template data', () => {
    const html = '<p>Hello {{firstName}} {{lastName}} — {{email}}</p>'
    const out = applyTemplateMergeFields(html, {
      firstName: 'Evelyn',
      lastName: 'Smith',
      email: 'evelyn3@cox.net',
    })
    expect(out).toContain('Evelyn Smith')
    expect(out).toContain('evelyn3@cox.net')
  })

  it('upgrades Jane Doe preview literals to merge tokens', () => {
    const upgraded = upgradeOverrideLiteralsToMergeFields(
      'New beta registration — Jane Doe · jane@example.com',
      'new-registration-admin',
    )
    expect(upgraded).toContain('{{fullName}}')
    expect(upgraded).toContain('{{email}}')
  })

  it('merges saved override html with live registration data', () => {
    const result = resolveTemplateContent({
      templateName: 'new-registration-admin',
      templateData: {
        firstName: 'Real',
        lastName: 'User',
        email: 'real.user@example.com',
        phone: '480-555-0100',
        requestedRole: 'agent',
        qaDevices: [],
      },
      renderedHtml: '<p>fallback</p>',
      renderedText: 'fallback',
      renderedSubject: 'New beta registration — Real User',
      override: {
        subject: 'New beta registration — Jane Doe',
        html: '<p>Registered: Jane Doe · jane@example.com · (555) 555-1234</p>',
        text: 'Registered: Jane Doe',
      },
    })

    expect(result.html).toContain('Real User')
    expect(result.html).toContain('real.user@example.com')
    expect(result.html).toContain('480-555-0100')
    expect(result.subject).toContain('Real User')
    expect(result.html).not.toContain('Jane Doe')
  })

  it('upgrades Jane Doe in body even when subject already has merge tokens', () => {
    const result = resolveTemplateContent({
      templateName: 'new-registration-admin',
      templateData: {
        firstName: 'Real',
        lastName: 'User',
        email: 'real.user@example.com',
      },
      renderedHtml: '<p>fallback Real User</p>',
      renderedText: 'fallback',
      renderedSubject: 'New beta registration — Real User',
      override: {
        subject: 'New beta registration — {{firstName}} {{lastName}}',
        html: '<p>New beta registration — Jane Doe</p>',
        text: 'Jane Doe',
      },
    })

    expect(result.subject).toBe('New beta registration — Real User')
    expect(result.html).toContain('Real User')
    expect(result.html).not.toContain('Jane Doe')
  })

  it('lists merge fields for auth templates', () => {
    const fields = listTemplateMergeFields('signup')
    expect(fields).toContain('confirmationUrl')
    expect(fields).toContain('siteName')
    expect(fields).toContain('email')
  })

  it('upgrades legacy Lovable auth preview literals to merge tokens', () => {
    const upgraded = upgradeOverrideLiteralsToMergeFields(
      '<p>Confirm for user@example.test at https://themedicareoptimizer.lovable.app</p>',
      'signup',
    )
    expect(upgraded).toContain('{{email}}')
    expect(upgraded).toContain('{{confirmationUrl}}')
    expect(upgraded).not.toContain('user@example.test')
  })

  it('normalizes single-brace auth placeholders', () => {
    const upgraded = normalizeAuthBracePlaceholders(
      '<a href="{confirmationUrl}">Go</a> code {token}',
      'recovery',
    )
    expect(upgraded).toContain('{{confirmationUrl}}')
    expect(upgraded).toContain('{{token}}')
  })

  it('strips Hi Jane from auth overrides that also contain merge tokens', () => {
    const result = resolveTemplateContent({
      templateName: 'signup',
      templateData: {
        siteName: 'themedicareoptimizer',
        siteUrl: 'https://getpartb.com',
        email: 'real.user@example.com',
        confirmationUrl: 'https://getpartb.com/auth/confirm?token=abc',
      },
      renderedHtml: '<h1>Confirm your email</h1>',
      renderedText: 'Confirm your email',
      renderedSubject: 'Confirm your email',
      override: {
        subject: 'Confirm your email',
        html: '<h1>Hi Jane,</h1><h1>Confirm your email</h1><p>{{email}}</p>',
        text: 'Hi Jane, Confirm your email',
      },
    })

    expect(result.html).not.toContain('Hi Jane')
    expect(result.html).toContain('Confirm your email')
    expect(result.html).toContain('real.user@example.com')
    expect(stripAuthTransactionalGreetings('Hi Jane, rest')).toBe('rest')
  })

  it('lists per-template auth merge fields without unrelated keys', () => {
    expect(listTemplateMergeFields('reauthentication')).toEqual([
      'token',
      'siteUrl',
      'siteName',
      'emailLogoUrl',
      'emailFooterLogoUrl',
    ])
    expect(listTemplateMergeFields('email_change')).toContain('oldEmail')
    expect(listTemplateMergeFields('email_change')).toContain('newEmail')
  })
})
