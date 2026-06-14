import { describe, it, expect } from 'vitest'
import { renderDefaultHtmlWithMergeFields } from '../all-templates.server'

describe('greeting merge fields', () => {
  it('scenario-claimed replaces Hi Jane with recipientName merge field', async () => {
    const html = await renderDefaultHtmlWithMergeFields('scenario-claimed')
    expect(html).not.toContain('Hi Jane')
    expect(html).toMatch(/Hi \{\{recipientName\}\}/)
  })

  it('welcome replaces Jane with recipientName merge field', async () => {
    const html = await renderDefaultHtmlWithMergeFields('welcome')
    expect(html).not.toContain('Welcome, Jane')
    expect(html).toContain('{{recipientName}}')
  })

  it('beta-test-assignment replaces Hi Jane with testerName merge field', async () => {
    const html = await renderDefaultHtmlWithMergeFields('beta-test-assignment')
    expect(html).not.toContain('Hi Jane')
    expect(html).toMatch(/Hi \{\{testerName\}\}/)
  })
})
