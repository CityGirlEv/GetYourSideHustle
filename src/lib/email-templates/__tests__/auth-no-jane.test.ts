import { describe, it, expect } from 'vitest'
import { ALL_TEMPLATES, renderDefaultHtmlWithMergeFields } from '../all-templates.server'

const AUTH = ALL_TEMPLATES.filter((t) => t.kind === 'auth').map((t) => t.name)

describe('auth emails must not contain Hi Jane', () => {
  it.each(AUTH)('%s default html has no Hi Jane literal', async (name) => {
    const html = await renderDefaultHtmlWithMergeFields(name)
    expect(html, html.slice(0, 500)).not.toContain('Hi Jane')
    expect(html).not.toMatch(/\bJane\b/)
  })
})
