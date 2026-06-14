import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { z } from 'zod'
import {
  ALL_TEMPLATES,
  findTemplate,
  renderDefaultHtml,
  renderDefaultHtmlWithMergeFields,
  getTemplateDefaultSubjectForEditor,
} from '@/lib/email-templates/all-templates.server'
import { htmlToPlainText } from '@/lib/email-templates/overrides.server'
import { ensureEmailBranding, stripEmailEditorArtifacts } from '@/lib/email-templates/email-branding.server'
import {
  resolveTemplateContent,
  listTemplateMergeFields,
  normalizeTemplateOverrideContent,
} from '@/lib/email-templates/template-merge.server'
import {
  AUTH_TEMPLATE_NAMES,
  getAuthTemplateTestData,
  getTemplateSampleProps,
} from '@/lib/email-templates/template-sample-props.server'
import { TEMPLATES } from '@/lib/email-templates/registry'
import * as React from 'react'
import { render } from '@react-email/components'
import { emailLogMatchesTemplate, dedupeEmailLogRows } from '@/lib/email-log-sort'
import { getTransactionalFromAddress, getTransactionalSenderDomain } from '@/lib/send-transactional-email'
import { getEnvVariable, getRuntimeSecret } from '@/lib/env'
import { triggerEmailQueueProcess } from '@/lib/trigger-email-queue-process'
import { publicSiteUrl } from '@/lib/send-transactional-template.server'

async function brandedHtmlForEditor(html: string): Promise<string> {
  return ensureEmailBranding(html, { siteUrl: publicSiteUrl() })
}

async function verifyAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
  const isAdmin = (data ?? []).some((r) => r.role === 'admin')
  if (!isAdmin) throw new Error('Admin access required')
}

function generateUnsubscribeToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function getOrCreateUnsubscribeToken(email: string): Promise<string> {
  const normalized = email.toLowerCase()
  const { data: existing } = await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalized)
    .maybeSingle()
  if (existing?.token && !existing.used_at) return existing.token
  const token = generateUnsubscribeToken()
  await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .upsert(
      { token, email: normalized },
      { onConflict: 'email', ignoreDuplicates: true },
    )
  const { data: stored } = await supabaseAdmin
    .from('email_unsubscribe_tokens')
    .select('token')
    .eq('email', normalized)
    .maybeSingle()
  if (!stored?.token) throw new Error('Failed to create unsubscribe token')
  return stored.token
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
    })).sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'transactional' ? -1 : 1
      return a.displayName.localeCompare(b.displayName)
    })
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
    const defaultHtml = await brandedHtmlForEditor(
      await renderDefaultHtmlWithMergeFields(tpl.name),
    )
    const defaultSubject = getTemplateDefaultSubjectForEditor(tpl.name)
    const { data: override } = await supabaseAdmin
      .from('email_template_overrides')
      .select('subject, html, updated_at, updated_by')
      .eq('template_name', tpl.name)
      .maybeSingle()
    const normalizedOverride = override
      ? normalizeTemplateOverrideContent(tpl.name, {
          subject: override.subject,
          html: stripEmailEditorArtifacts(override.html),
        })
      : null
    const overrideHtml = normalizedOverride
      ? await brandedHtmlForEditor(normalizedOverride.html)
      : null
    return {
      name: tpl.name,
      kind: tpl.kind,
      displayName: tpl.displayName,
      description: tpl.description,
      trigger: tpl.trigger,
      defaultSubject,
      defaultHtml,
      override: normalizedOverride
        ? {
            subject: normalizedOverride.subject,
            html: overrideHtml!,
            updatedAt: override!.updated_at,
            updatedBy: override!.updated_by,
          }
        : null,
      mergeFields: listTemplateMergeFields(tpl.name),
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
    const cleanHtml = stripEmailEditorArtifacts(data.html)
    const normalized = normalizeTemplateOverrideContent(data.name, {
      subject: data.subject,
      html: cleanHtml,
    })
    const brandedHtml = await brandedHtmlForEditor(normalized.html)
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
      const defaultHtml = await renderDefaultHtmlWithMergeFields(tpl.name)
      await supabaseAdmin.from('email_template_versions').insert({
        template_name: data.name,
        subject: getTemplateDefaultSubjectForEditor(tpl.name),
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
          subject: normalized.subject,
          html: brandedHtml,
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
    const unsubscribeToken = await getOrCreateUnsubscribeToken(data.recipient)
    const registry = TEMPLATES[data.name]
    const tpl = findTemplate(data.name)!
    const templateData = (AUTH_TEMPLATE_NAMES.has(data.name)
      ? getAuthTemplateTestData(data.name, data.recipient)
      : ((registry?.previewData ?? tpl.sampleProps ?? getTemplateSampleProps(data.name)) as Record<
          string,
          unknown
        >)) as Record<string, unknown>
    const cleanHtml = stripEmailEditorArtifacts(data.html)
    const renderedHtml = registry
      ? await render(React.createElement(registry.component, templateData))
      : await render(React.createElement(tpl.component, templateData))
    const renderedText = registry
      ? await render(React.createElement(registry.component, templateData), { plainText: true })
      : await render(React.createElement(tpl.component, templateData), { plainText: true })
    const renderedSubject =
      registry && typeof registry.subject === 'function'
        ? registry.subject(templateData)
        : data.subject
    const merged = resolveTemplateContent({
      templateName: data.name,
      templateData,
      renderedHtml,
      renderedText,
      renderedSubject,
      override: {
        subject: data.subject,
        html: cleanHtml,
        text: htmlToPlainText(cleanHtml),
      },
    })
    const brandedHtml = await ensureEmailBranding(merged.html, { unsubscribeToken })
    const text = merged.text

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
        from: getTransactionalFromAddress(),
        sender_domain: getTransactionalSenderDomain(),
        subject: `[TEST] ${merged.subject}`,
        html: brandedHtml,
        text,
        purpose: 'transactional',
        label: `${data.name}-test`,
        idempotency_key: messageId,
        unsubscribe_token: unsubscribeToken,
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

    await triggerEmailQueueProcess(getRequest()?.url)

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
        templateName: z.string().min(1).max(120).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId)
    const limit = data.limit ?? 50
    const templateName = data.templateName
    // Pull extra rows when filtering so dedupe still yields enough matches.
    const fetchLimit = templateName ? limit * 20 : limit * 4
    const { data: rows, error } = await supabaseAdmin
      .from('email_send_log')
      .select('id, message_id, template_name, recipient_email, status, error_message, created_at')
      .order('created_at', { ascending: false })
      .limit(fetchLimit)
    if (error) throw new Error(error.message)

    const filtered = templateName
      ? (rows ?? []).filter((r) => emailLogMatchesTemplate(r.template_name, templateName))
      : (rows ?? [])

    return dedupeEmailLogRows(filtered).slice(0, limit)
  })

export const listEmailTemplateChanges = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        limit: z.number().int().min(1).max(200).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    await verifyAdmin(context.userId)
    const limit = data.limit ?? 50
    const { data: rows, error } = await supabaseAdmin
      .from('audit_logs')
      .select('id, user_id, action, entity_id, metadata, created_at')
      .in('action', ['SAVE_EMAIL_TEMPLATE_OVERRIDE', 'DELETE_EMAIL_TEMPLATE_OVERRIDE'])
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw new Error(error.message)
    return rows ?? []
  })

export const getEmailDeliveryStatus = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.userId)

    const fromAddress = getTransactionalFromAddress()
    const resendKey = getRuntimeSecret('RESEND_API_KEY')
    if (!resendKey) {
      const rawKey = getEnvVariable('RESEND_API_KEY')
      return {
        ready: false,
        fromAddress,
        domain: getTransactionalSenderDomain(),
        domainStatus: 'unknown' as const,
        keyConfigured: Boolean(rawKey),
        message: rawKey
          ? 'RESEND_API_KEY is set but invalid. Re-upload with: node scripts/upload-resend-secret.mjs'
          : 'RESEND_API_KEY is not configured in this environment. On Cloudflare Pages, add it as a production secret and redeploy.',
      }
    }

    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${resendKey.trim()}` },
    })
    if (!res.ok) {
      return {
        ready: false,
        fromAddress,
        domain: getTransactionalSenderDomain(),
        domainStatus: 'unknown' as const,
        message: `Could not check Resend domains (${res.status}).`,
      }
    }

    const body = await res.text()
    let json: { data?: Array<{ name: string; status: string }> }
    try {
      json = JSON.parse(body) as { data?: Array<{ name: string; status: string }> }
    } catch {
      return {
        ready: false,
        fromAddress,
        domain: getTransactionalSenderDomain(),
        domainStatus: 'unknown' as const,
        message: 'Could not parse Resend domains response.',
      }
    }
    const domain = getTransactionalSenderDomain()
    const match = json.data?.find((d) => d.name === domain)
    const verified = match?.status === 'verified'

    return {
      ready: verified,
      fromAddress,
      domain,
      domainStatus: (match?.status ?? 'not_added') as string,
      message: verified
        ? `Sending from ${fromAddress} — test emails can go to any address.`
        : `Domain ${domain} is "${match?.status ?? 'not added'}" in Resend. Add DNS records in Cloudflare, then verify at resend.com/domains. Until verified, Resend only delivers test mail to the account owner.`,
    }
  })
