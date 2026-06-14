import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { z } from 'zod'
import { TEST_CASES, type TestStatus } from '@/lib/test-plan'
import { publicSiteUrl, sendTransactionalTemplates } from '@/lib/send-transactional-template.server'

const SKIP_ASSIGNEES = new Set(['', 'Unassigned'])

const STATUS_LABELS: Record<TestStatus, string> = {
  not_run: 'Not run',
  in_progress: 'In progress',
  pass: 'Pass',
  fail: 'Fail',
  blocked: 'Blocked',
  fixed_retest: 'Fixed / Retest',
  failed_retest: 'Failed / Retest',
}

export type AssignedTestRow = {
  id: string
  title: string
  area?: string
  status: TestStatus
  statusLabel: string
  isNew?: boolean
}

function assigneeFirstName(value: string): string {
  const first = value.trim().split(/\s+/)[0] || ''
  if (!first) return ''
  return first.charAt(0).toUpperCase() + first.slice(1)
}

function normalizeAssigneeKey(value: string): string {
  return value.trim().toLowerCase()
}

async function resolveAssigneeRecipient(
  assigneeLabel: string,
): Promise<{ email: string; testerName: string } | null> {
  const target = normalizeAssigneeKey(assigneeLabel)
  if (SKIP_ASSIGNEES.has(assigneeLabel.trim()) || !target) return null

  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, full_name')
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? '']))
  const { data: authList, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) throw new Error(error.message)

  for (const user of authList.users ?? []) {
    const bannedUntil = (user as { banned_until?: string | null }).banned_until
    if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) continue

    const fullName =
      (profileMap.get(user.id) || (user.user_metadata?.full_name as string) || user.email || '').trim()
    const first = normalizeAssigneeKey(fullName.split(/\s+/)[0] || '')
    if (first !== target || !user.email) continue

    return {
      email: user.email,
      testerName: assigneeFirstName(fullName || assigneeLabel),
    }
  }

  return null
}

function testMeta(testId: string): { id: string; title: string; area?: string } {
  const match = TEST_CASES.find((t) => t.id === testId)
  return {
    id: testId,
    title: match?.title ?? testId,
    area: match?.area,
  }
}

function assigneeMatches(label: string | null | undefined, assigneeLabel: string): boolean {
  if (!label?.trim()) return false
  const first = label.trim().split(/\s+/)[0] || label
  return normalizeAssigneeKey(first) === normalizeAssigneeKey(assigneeLabel)
}

async function loadAssignedTestsForAssignee(
  assigneeLabel: string,
  newTestIds: string[],
): Promise<AssignedTestRow[]> {
  const { data: rows } = await supabaseAdmin
    .from('test_results')
    .select('test_id, status, assignee')

  const byId = new Map<string, TestStatus | null>()
  for (const row of rows ?? []) {
    if (assigneeMatches(row.assignee, assigneeLabel)) {
      byId.set(row.test_id, (row.status as TestStatus | null) ?? 'not_run')
    }
  }

  for (const t of TEST_CASES) {
    if (t.assignee && assigneeMatches(t.assignee, assigneeLabel) && !byId.has(t.id)) {
      byId.set(t.id, null)
    }
  }

  for (const id of newTestIds) {
    if (!byId.has(id)) byId.set(id, null)
  }

  const newSet = new Set(newTestIds)
  return [...byId.entries()]
    .map(([id, status]) => {
      const resolved = (status ?? 'not_run') as TestStatus
      return {
        ...testMeta(id),
        status: resolved,
        statusLabel: STATUS_LABELS[resolved],
        isNew: newSet.has(id),
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}

export const notifyBetaTestAssignments = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        assignments: z
          .array(
            z.object({
              testId: z.string().min(1).max(80),
              assignee: z.string().min(1).max(80),
            }),
          )
          .min(1)
          .max(50),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const siteUrl = publicSiteUrl().replace(/\/$/, '')
    const loginUrl = `${siteUrl}/auth?tab=sign-in`
    const testingUrl = `${siteUrl}/testing`

    const byAssignee = new Map<string, string[]>()
    for (const row of data.assignments) {
      const assignee = row.assignee.trim()
      if (SKIP_ASSIGNEES.has(assignee)) continue
      const list = byAssignee.get(assignee) ?? []
      if (!list.includes(row.testId)) list.push(row.testId)
      byAssignee.set(assignee, list)
    }

    let sent = 0
    let skipped = 0

    for (const [assignee, testIds] of byAssignee) {
      const recipient = await resolveAssigneeRecipient(assignee)
      if (!recipient) {
        skipped++
        continue
      }

      const newTests = testIds.map(testMeta)
      const assignedTests = await loadAssignedTestsForAssignee(assignee, testIds)
      const idempotencyKey = `beta-test-assignment-${recipient.email}-${testIds.sort().join(',')}-${Date.now()}`

      const result = await sendTransactionalTemplates({
        templateName: 'beta-test-assignment',
        recipientEmail: recipient.email,
        templateData: {
          testerName: recipient.testerName,
          loginUrl,
          testingUrl,
          newTests,
          assignedTests,
        },
        idempotencyKey,
      })

      if (result.queued > 0) sent++
      else skipped++
    }

    return { sent, skipped }
  })
