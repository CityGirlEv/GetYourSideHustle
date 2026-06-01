import { describe, it, expect } from 'vitest'
import { listEmailTemplateChanges } from '@/lib/email-template-admin.functions'

describe('listEmailTemplateChanges', () => {
  it('is exported as a server function', () => {
    expect(typeof listEmailTemplateChanges).toBe('function')
  })
})