import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { getEnvVariable } from '@/lib/env'
import type {
  QaCompletedTestRow,
  QaDailySummaryAdminProps,
  QaTesterDaySummary,
} from '@/lib/email-templates/qa-daily-summary-admin'
import { TEST_CASES, type TestStatus } from '@/lib/test-plan'
import { notifyAdminInboxes, publicSiteUrl } from '@/lib/send-transactional-template.server'

const COMPLETED_STATUSES = new Set<TestStatus>([
  'pass',
  'fail',
  'blocked',
  'fixed_retest',
  'failed_retest',
])

const STATUS_LABELS: Record<TestStatus, string> = {
  not_run: 'Not run',
  in_progress: 'In progress',
  pass: 'Pass',
  fail: 'Fail',
  blocked: 'Blocked',
  fixed_retest: 'Fixed / Retest',
  failed_retest: 'Failed / Retest',
}

const DEFAULT_TIMEZONE = 'America/New_York'

type TestResultRow = {
  test_id: string
  status: string | null
  severity: string | null
  assignee: string | null
  qa_notes: unknown
  updated_at: string
}

type NoteEntry = { text?: string; author_name?: string; at?: string }

export function reportTimezone(): string {
  return getEnvVariable('QA_REPORT_TIMEZONE') || DEFAULT_TIMEZONE
}

/** Calendar date key (YYYY-MM-DD) for a timestamp in the report timezone. */
export function toReportDateKey(iso: string | Date, timeZone = reportTimezone()): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return d.toLocaleDateString('en-CA', { timeZone })
}

export function formatReportDateLabel(forDate = new Date(), timeZone = reportTimezone()): string {
  return forDate.toLocaleDateString('en-US', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatUpdatedAtLabel(iso: string, timeZone = reportTimezone()): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

function latestQaNote(notes: unknown): string | undefined {
  if (!Array.isArray(notes) || notes.length === 0) return undefined
  const last = notes[notes.length - 1] as NoteEntry
  const text = last?.text?.trim()
  if (!text) return undefined
  return text.length > 140 ? `${text.slice(0, 137)}…` : text
}

function testMeta(testId: string, customById: Map<string, { title: string; area: string }>) {
  const custom = customById.get(testId)
  if (custom) return { id: testId, title: custom.title, area: custom.area }
  const match = TEST_CASES.find((t) => t.id === testId)
  return {
    id: testId,
    title: match?.title ?? testId,
    area: match?.area,
  }
}

function assigneeLabel(raw: string | null | undefined, testId: string): string {
  const trimmed = raw?.trim()
  if (trimmed && trimmed !== 'Unassigned') return trimmed
  const fallback = TEST_CASES.find((t) => t.id === testId)?.assignee
  return fallback?.trim() || 'Unassigned'
}

function countBucket(status: TestStatus): keyof Pick<QaTesterDaySummary, 'pass' | 'fail' | 'blocked' | 'other'> {
  if (status === 'pass') return 'pass'
  if (status === 'fail' || status === 'failed_retest') return 'fail'
  if (status === 'blocked') return 'blocked'
  return 'other'
}

export function buildQaDailySummaryFromRows(
  rows: TestResultRow[],
  opts: {
    reportDateKey: string
    customTests?: Array<{ id: string; title: string; area: string }>
    timeZone?: string
  },
): QaDailySummaryAdminProps {
  const timeZone = opts.timeZone ?? reportTimezone()
  const customById = new Map((opts.customTests ?? []).map((t) => [t.id, t]))
  const completed: QaCompletedTestRow[] = []

  for (const row of rows) {
    const status = (row.status ?? 'not_run') as TestStatus
    if (!COMPLETED_STATUSES.has(status)) continue
    if (toReportDateKey(row.updated_at, timeZone) !== opts.reportDateKey) continue

    const meta = testMeta(row.test_id, customById)
    completed.push({
      ...meta,
      status,
      statusLabel: STATUS_LABELS[status],
      assignee: assigneeLabel(row.assignee, row.test_id),
      severity: row.severity ?? undefined,
      noteSnippet: latestQaNote(row.qa_notes),
      updatedAtLabel: formatUpdatedAtLabel(row.updated_at, timeZone),
    })
  }

  completed.sort((a, b) => a.id.localeCompare(b.id))

  const totals = { pass: 0, fail: 0, blocked: 0, other: 0, total: completed.length }
  const byTester = new Map<string, QaTesterDaySummary>()

  for (const t of completed) {
    const bucket = countBucket(t.status as TestStatus)
    totals[bucket]++
    const key = t.assignee
    const entry = byTester.get(key) ?? {
      assignee: key,
      pass: 0,
      fail: 0,
      blocked: 0,
      other: 0,
      total: 0,
    }
    entry[bucket]++
    entry.total++
    byTester.set(key, entry)
  }

  const siteUrl = publicSiteUrl().replace(/\/$/, '')
  const forDate = new Date(`${opts.reportDateKey}T12:00:00`)

  return {
    reportDateLabel: formatReportDateLabel(forDate, timeZone),
    testingUrl: `${siteUrl}/testing`,
    qaDashboardUrl: `${siteUrl}/qa`,
    completedTests: completed,
    testerSummaries: [...byTester.values()].sort((a, b) => b.total - a.total || a.assignee.localeCompare(b.assignee)),
    totals,
  }
}

export async function fetchQaDailySummary(forDate = new Date()): Promise<QaDailySummaryAdminProps> {
  const timeZone = reportTimezone()
  const reportDateKey = toReportDateKey(forDate, timeZone)
  const lookback = new Date(forDate)
  lookback.setUTCDate(lookback.getUTCDate() - 2)

  const [{ data: rows, error }, { data: customRows, error: customErr }] = await Promise.all([
    supabaseAdmin
      .from('test_results')
      .select('test_id, status, severity, assignee, qa_notes, updated_at')
      .gte('updated_at', lookback.toISOString()),
    supabaseAdmin.from('custom_tests').select('id, title, area'),
  ])

  if (error) throw new Error(error.message)
  if (customErr) throw new Error(customErr.message)

  return buildQaDailySummaryFromRows((rows ?? []) as TestResultRow[], {
    reportDateKey,
    customTests: (customRows ?? []) as Array<{ id: string; title: string; area: string }>,
    timeZone,
  })
}

export async function sendQaDailySummaryToAdmins(forDate = new Date()): Promise<{
  queued: number
  failed: number
  totalCompleted: number
  reportDateLabel: string
}> {
  const summary = await fetchQaDailySummary(forDate)
  const dateKey = toReportDateKey(forDate)
  const result = await notifyAdminInboxes({
    templateName: 'qa-daily-summary-admin',
    templateData: summary as Record<string, unknown>,
    idempotencyPrefix: `qa-daily-summary-${dateKey}`,
  })

  return {
    ...result,
    totalCompleted: summary.totals?.total ?? 0,
    reportDateLabel: summary.reportDateLabel ?? dateKey,
  }
}
