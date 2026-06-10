import { describe, it, expect } from 'vitest'
import {
  formatResendDeliveryError,
  isResendSandboxRestriction,
} from '../send-transactional-email'

describe('isResendSandboxRestriction', () => {
  it('detects raw Resend domain errors', () => {
    expect(
      isResendSandboxRestriction(
        'The mypartb.com domain is not verified. Please, add and verify your domain',
      ),
    ).toBe(true)
  })

  it('detects our formatted sandbox delivery error', () => {
    const formatted = formatResendDeliveryError(
      403,
      'The mypartb.com domain is not verified. Please, add and verify your domain',
    )
    expect(isResendSandboxRestriction(formatted)).toBe(true)
  })
})
