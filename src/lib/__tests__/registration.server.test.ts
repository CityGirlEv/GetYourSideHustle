import { describe, it, expect } from 'vitest'
import {
  mergeQaDevices,
  registrationRoleLabel,
  roleAlreadyRegistered,
} from '../registration.server'

describe('registration.server', () => {
  it('detects when a role is already on the account', () => {
    expect(roleAlreadyRegistered(['qa'], 'qa')).toBe(true)
    expect(roleAlreadyRegistered(['qa'], 'agent')).toBe(false)
    expect(roleAlreadyRegistered(['agent', 'viewer'], 'agent')).toBe(true)
  })

  it('merges QA devices without duplicates', () => {
    expect(mergeQaDevices(['iPhone'], ['MacBook', 'iPhone'])).toEqual(['iPhone', 'MacBook'])
    expect(mergeQaDevices([], ['iPad'])).toEqual(['iPad'])
    expect(mergeQaDevices(null, null)).toBeNull()
    expect(mergeQaDevices(['MacBook'], [])).toEqual(['MacBook'])
  })

  it('formats registration role labels', () => {
    expect(registrationRoleLabel('qa')).toBe('QA tester')
    expect(registrationRoleLabel('agent')).toBe('agent')
  })
})
