import { createServerFn } from '@tanstack/react-start'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { z } from 'zod'
import {
  publicSiteUrl,
  sendTransactionalTemplates,
} from '@/lib/send-transactional-template.server'

export const submitExpertContactRequest = createServerFn({ method: 'POST' })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        phone: z.string().trim().min(7).max(40),
        scenario_code: z.string().trim().max(64).optional().nullable(),
        scenario_snapshot: z.record(z.string(), z.unknown()).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from('expert_contact_requests')
      .insert({
        email: data.email,
        phone: data.phone,
        scenario_code: data.scenario_code ?? null,
        scenario_snapshot: data.scenario_snapshot ? (data.scenario_snapshot as never) : null,
      })
      .select('id')
      .single()

    if (error || !row) {
      throw new Error(error?.message ?? 'Could not save contact request')
    }

    await sendTransactionalTemplates({
      templateName: 'contact-request',
      recipientEmail: data.email,
      templateData: {
        email: data.email,
        scenarioCode: data.scenario_code ?? undefined,
      },
      idempotencyKey: `contact-request-${row.id}`,
    })

    return { ok: true as const }
  })

export const notifyScenarioClaimed = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ scenario_code: z.string().trim().min(4).max(64) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const code = data.scenario_code.trim().toUpperCase()
    const { data: scenario, error } = await supabaseAdmin
      .from('scenarios')
      .select('id, scenario_code, claimed_by, claimed_at, created_by, wants_contact')
      .eq('scenario_code', code)
      .maybeSingle()

    if (error || !scenario) return { ok: false as const, reason: 'not_found' as const }
    if (scenario.claimed_by !== context.userId) {
      return { ok: false as const, reason: 'not_claimer' as const }
    }
    if (!scenario.claimed_at) {
      return { ok: false as const, reason: 'not_claimed' as const }
    }

    const claimedMs = Date.now() - new Date(scenario.claimed_at).getTime()
    if (claimedMs > 2 * 60 * 1000) {
      return { ok: false as const, reason: 'stale_claim' as const }
    }

    let recipientEmail: string | null = null
    const { data: contactReq } = await supabaseAdmin
      .from('expert_contact_requests')
      .select('email')
      .eq('scenario_code', code)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    recipientEmail = contactReq?.email ?? null

    if (!recipientEmail && scenario.created_by) {
      const { data: creator } = await supabaseAdmin.auth.admin.getUserById(scenario.created_by)
      recipientEmail = creator?.user?.email ?? null
    }

    if (!recipientEmail) {
      return { ok: false as const, reason: 'no_recipient' as const }
    }

    const { data: advisorProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', context.userId)
      .maybeSingle()
    const { data: advisorAuth } = await supabaseAdmin.auth.admin.getUserById(context.userId)

    const siteUrl = publicSiteUrl().replace(/\/$/, '')
    await sendTransactionalTemplates({
      templateName: 'scenario-claimed',
      recipientEmail,
      templateData: {
        advisorName: advisorProfile?.full_name || advisorAuth?.user?.email || 'A licensed advisor',
        scenarioCode: code,
        scenarioUrl: `${siteUrl}/scenario/${encodeURIComponent(code)}`,
      },
      idempotencyKey: `scenario-claimed-${scenario.id}-${context.userId}`,
    })

    return { ok: true as const }
  })
