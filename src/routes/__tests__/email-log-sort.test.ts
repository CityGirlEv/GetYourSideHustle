import { describe, it, expect } from 'vitest'
import { sortEmailLog, type EmailLogRow } from '../admin_.email-templates'

function row(p: Partial<EmailLogRow>): EmailLogRow {
  return {
    id: 'id',
    message_id: 'msg',
    template_name: 'welcome',
    recipient_email: 'a@b.com',
    status: 'sent',
    error_message: null,
    created_at: '2024-01-01T00:00:00.000Z',
    ...p,
  }
}

describe('sortEmailLog', () => {
  it('sorts by template_name ascending', () => {
    const rows = [
      row({ template_name: 'zeta' }),
      row({ template_name: 'alpha' }),
      row({ template_name: 'beta' }),
    ]
    const sorted = sortEmailLog(rows, 'template_name', 'asc')
    expect(sorted.map((r) => r.template_name)).toEqual(['alpha', 'beta', 'zeta'])
  })

  it('sorts by template_name descending', () => {
    const rows = [
      row({ template_name: 'alpha' }),
      row({ template_name: 'zeta' }),
      row({ template_name: 'beta' }),
    ]
    const sorted = sortEmailLog(rows, 'template_name', 'desc')
    expect(sorted.map((r) => r.template_name)).toEqual(['zeta', 'beta', 'alpha'])
  })

  it('sorts by recipient_email case-insensitively', () => {
    const rows = [
      row({ recipient_email: 'Zoe@example.com' }),
      row({ recipient_email: 'alice@example.com' }),
      row({ recipient_email: 'bob@example.com' }),
    ]
    const sorted = sortEmailLog(rows, 'recipient_email', 'asc')
    expect(sorted.map((r) => r.recipient_email)).toEqual([
      'alice@example.com',
      'bob@example.com',
      'Zoe@example.com',
    ])
  })

  it('sorts by status', () => {
    const rows = [
      row({ status: 'sent' }),
      row({ status: 'failed' }),
      row({ status: 'pending' }),
    ]
    const sorted = sortEmailLog(rows, 'status', 'asc')
    expect(sorted.map((r) => r.status)).toEqual(['failed', 'pending', 'sent'])
  })

  it('sorts by created_at ascending (oldest first)', () => {
    const rows = [
      row({ created_at: '2024-03-01T00:00:00.000Z' }),
      row({ created_at: '2024-01-01T00:00:00.000Z' }),
      row({ created_at: '2024-02-01T00:00:00.000Z' }),
    ]
    const sorted = sortEmailLog(rows, 'created_at', 'asc')
    expect(sorted.map((r) => r.created_at)).toEqual([
      '2024-01-01T00:00:00.000Z',
      '2024-02-01T00:00:00.000Z',
      '2024-03-01T00:00:00.000Z',
    ])
  })

  it('sorts by created_at descending (newest first)', () => {
    const rows = [
      row({ created_at: '2024-01-01T00:00:00.000Z' }),
      row({ created_at: '2024-03-01T00:00:00.000Z' }),
      row({ created_at: '2024-02-01T00:00:00.000Z' }),
    ]
    const sorted = sortEmailLog(rows, 'created_at', 'desc')
    expect(sorted.map((r) => r.created_at)).toEqual([
      '2024-03-01T00:00:00.000Z',
      '2024-02-01T00:00:00.000Z',
      '2024-01-01T00:00:00.000Z',
    ])
  })

  it('places null error_message before non-null when ascending', () => {
    const rows = [
      row({ error_message: 'B error' }),
      row({ error_message: null }),
      row({ error_message: 'A error' }),
    ]
    const sorted = sortEmailLog(rows, 'error_message', 'asc')
    expect(sorted.map((r) => r.error_message)).toEqual([null, 'A error', 'B error'])
  })

  it('does not mutate the original array', () => {
    const rows = [row({ template_name: 'z' }), row({ template_name: 'a' })]
    const copy = [...rows]
    sortEmailLog(rows, 'template_name', 'asc')
    expect(rows).toEqual(copy)
  })
})
