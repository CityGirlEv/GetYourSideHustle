import { describe, it, expect } from 'vitest'
import { buildQaDailySummaryFromRows } from '../qa-daily-summary.server'

describe('qa daily summary', () => {
  it('groups completed tests for the report day', () => {
    const summary = buildQaDailySummaryFromRows(
      [
        {
          test_id: 'AUTH-001',
          status: 'pass',
          severity: null,
          assignee: 'Catria',
          qa_notes: [{ text: 'Looks good on iOS.', author_name: 'Catria', at: '2026-06-09T20:12:00Z' }],
          updated_at: '2026-06-09T20:12:00Z',
        },
        {
          test_id: 'INTAKE-002',
          status: 'fail',
          severity: 'high',
          assignee: 'Evelyn',
          qa_notes: [{ text: 'County dropdown empty.', author_name: 'Evelyn', at: '2026-06-09T22:45:00Z' }],
          updated_at: '2026-06-09T22:45:00Z',
        },
        {
          test_id: 'INTAKE-003',
          status: 'in_progress',
          severity: null,
          assignee: 'Evelyn',
          qa_notes: [],
          updated_at: '2026-06-09T22:50:00Z',
        },
        {
          test_id: 'AUTH-002',
          status: 'pass',
          severity: null,
          assignee: 'Catria',
          qa_notes: [],
          updated_at: '2026-06-08T20:00:00Z',
        },
      ],
      { reportDateKey: '2026-06-09', timeZone: 'UTC' },
    )

    expect(summary.totals?.total).toBe(2)
    expect(summary.totals?.pass).toBe(1)
    expect(summary.totals?.fail).toBe(1)
    expect(summary.completedTests?.map((t) => t.id)).toEqual(['AUTH-001', 'INTAKE-002'])
    expect(summary.testerSummaries).toHaveLength(2)
    expect(summary.completedTests?.[1]?.noteSnippet).toContain('County dropdown')
  })
})
