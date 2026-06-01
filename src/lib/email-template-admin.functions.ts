import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { z } from 'zod'
import {
  ALL_TEMPLATES,
  findTemplate,
  renderDefaultHtml,
} from '@/lib/email-templates/all-templates.server'
import { htmlToPlainText } from '@/lib/email-templates/overrides.server'

async function verifyAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
  const isAdmin = (data ?? []).some((r) => r.role === 'admin')
  if (!isAdmin) throw new Error('Admin access required')
}

export const listEmailTemplates = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.userId)
    const { data: overrides } = await supabaseAdmin
      .from('email_template_overrides')
      .select('template_name, updated_at, updated_by')
    const overrideMap = new Map(
      (overrides ?? []).map((o) => [o.template_name, o]),
    )
    return ALL_TEMPLATES.map((t) => ({
      name: t.name,
      kind: t.kind,
      displayName: t.displayName,
      description: t.description,
      trigger: t.trigger,
      defaultSubject: t.defaultSubject,
      overridden: overrideMap.has(t.name),
      overrideUpdatedAt: overrideMap.get(t.name)?.updated_at ?? null,
    }))
  })

export const getEmailTemplate = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ name: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId)
    const tpl = findTemplate(data.name)
    if (!tpl) throw new Error(`Unknown template: ${data.name}`)
    const defaultHtml = await renderDefaultHtml(tpl.name)
    const { data: override } = await supabaseAdmin
      .from('email_template_overrides')
      .select('subject, html, updated_at, updated_by')
      .eq('template_name', tpl.name)
      .maybeSingle()
    return {
      name: tpl.name,
      kind: tpl.kind,
      displayName: tpl.displayName,
      description: tpl.description,
      trigger: tpl.trigger,
      defaultSubject: tpl.defaultSubject,
      defaultHtml,
      override: override
        ? {
            subject: override.subject,
            html: override.html,
            updatedAt: override.updated_at,
            updatedBy: override.updated_by,
          }
        : null,
    }
  })

export const saveEmailTemplateOverride = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        name: z.string().min(1).max(120),
        subject: z.string().min(1).max(500),
        html: z.string().min(1).max(200_000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId)
    if (!findTemplate(data.name)) throw new Error(`Unknown template: ${data.name}`)
    // Snapshot the currently-active version (override if any, else built-in default)
    // into version history BEFORE writing the new override.
    const { data: prev } = await supabaseAdmin
      .from('email_template_overrides')
      .select('subject, html, updated_by')
      .eq('template_name', data.name)
      .maybeSingle()
    if (prev) {
      await supabaseAdmin.from('email_template_versions').insert({
        template_name: data.name,
        subject: prev.subject,
        html: prev.html,
        source: 'override',
        created_by: prev.updated_by ?? context.userId,
      })
    } else {
      const tpl = findTemplate(data.name)!
      const defaultHtml = await renderDefaultHtml(tpl.name)
      await supabaseAdmin.from('email_template_versions').insert({
        template_name: data.name,
        subject: tpl.defaultSubject,
        html: defaultHtml,
        source: 'builtin',
        created_by: context.userId,
      })
    }
    const { error } = await supabaseAdmin
      .from('email_template_overrides')
      .upsert(
        {
          template_name: data.name,
          subject: data.subject,
          html: data.html,
          updated_by: context.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'template_name' },
      )
    if (error) throw new Error(error.message)
    await supabaseAdmin.from('audit_logs').insert({
      user_id: context.userId,
      action: 'SAVE_EMAIL_TEMPLATE_OVERRIDE',
      entity_type: 'email_template',
      entity_id: data.name,
      metadata: { subject_length: data.subject.length, html_length: data.html.length } as never,
    })
    return { ok: true }
  })

export const deleteEmailTemplateOverride = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ name: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId)
    // Snapshot current override into history before deleting it.
    const { data: prev } = await supabaseAdmin
      .from('email_template_overrides')
      .select('subject, html, updated_by')
      .eq('template_name', data.name)
      .maybeSingle()
    if (prev) {
      await supabaseAdmin.from('email_template_versions').insert({
        template_name: data.name,
        subject: prev.subject,
        html: prev.html,
        source: 'override',
        created_by: prev.updated_by ?? context.userId,
      })
    }
    const { error } = await supabaseAdmin
      .from('email_template_overrides')
      .delete()
      .eq('template_name', data.name)
    if (error) throw new Error(error.message)
    await supabaseAdmin.from('audit_logs').insert({
      user_id: context.userId,
      action: 'DELETE_EMAIL_TEMPLATE_OVERRIDE',
      entity_type: 'email_template',
      entity_id: data.name,
      metadata: {} as never,
    })
    return { ok: true }
  })

export const listEmailTemplateVersions = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ name: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId)
    const { data: rows, error } = await supabaseAdmin
      .from('email_template_versions')
      .select('id, subject, source, created_at, created_by')
      .eq('template_name', data.name)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw new Error(error.message)
    return rows ?? []
  })

export const getEmailTemplateVersion = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId)
    const { data: row, error } = await supabaseAdmin
      .from('email_template_versions')
      .select('id, template_name, subject, html, source, created_at, created_by')
      .eq('id', data.id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!row) throw new Error('Version not found')
    return row
  })

export const sendEmailTemplateTest = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        name: z.string().min(1).max(120),
        recipient: z.string().email().max(320),
        subject: z.string().min(1).max(500),
        html: z.string().min(1).max(200_000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId)
    if (!findTemplate(data.name)) throw new Error(`Unknown template: ${data.name}`)

    const messageId = crypto.randomUUID()
    const subject = `[TEST] ${data.subject}`
    const text = htmlToPlainText(data.html)

    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: `${data.name} (test)`,
      recipient_email: data.recipient,
      status: 'pending',
    })

    const { error } = await supabaseAdmin.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: data.recipient,
        from: `The Medicare Optimizer <noreply@notify.getpartb.com>`,
        sender_domain: 'notify.getpartb.com',
        subject,
        html: data.html,
        text,
        purpose: 'transactional',
        label: `${data.name}-test`,
        idempotency_key: messageId,
        queued_at: new Date().toISOString(),
      },
    })
    if (error) {
      await supabaseAdmin.from('email_send_log').insert({
        message_id: messageId,
        template_name: `${data.name} (test)`,
        recipient_email: data.recipient,
        status: 'failed',
        error_message: `Enqueue failed: ${error.message}`,
      })
      throw new Error(`Failed to enqueue test email: ${error.message}`)
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: context.userId,
      action: 'SEND_EMAIL_TEMPLATE_TEST',
      entity_type: 'email_template',
      entity_id: data.name,
      metadata: { recipient: data.recipient } as never,
    })

    return { ok: true, messageId }
  })

export const listEmailSendLog = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        limit: z.number().int().min(1).max(200).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId)
    const limit = data.limit ?? 50
    // Pull more rows than the limit so we can deduplicate by message_id
    // (each email has pending + sent/failed/dlq rows that share a message_id).
    const { data: rows, error } = await supabaseAdmin
      .from('email_send_log')
      .select('id, message_id, template_name, recipient_email, status, error_message, created_at')
      .order('created_at', { ascending: false })
      .limit(limit * 4)
    if (error) throw new Error(error.message)
    const seen = new Set<string>()
    const deduped: typeof rows = [] as never
    for (const r of rows ?? []) {
      const key = r.message_id ?? `__no_id__${r.id}`
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(r)
      if (deduped.length >= limit) break
    }
    return deduped
  })
