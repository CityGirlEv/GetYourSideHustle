import { describe, it, expect } from 'vitest'
import { sendEmailTemplateTest } from '@/lib/email-template-admin.functions'

describe('sendEmailTemplateTest', () => {
  it('is exported as a server function', () => {
    expect(sendEmailTemplateTest).toBeDefined()
    expect(typeof sendEmailTemplateTest).toBe('function')
  })
})