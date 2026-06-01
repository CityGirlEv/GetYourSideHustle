import { describe, it, expect } from 'vitest'
import { listEmailSendLog } from '@/lib/email-template-admin.functions'

describe('listEmailSendLog server function', () => {
  it('is exported and callable', () => {
    expect(typeof listEmailSendLog).toBe('function')
  })
})