import * as React from 'react'
import { render } from '@react-email/components'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getEnvVariable } from '@/lib/env'
import { getAdminNotificationEmails } from '@/lib/admin-notification-emails'
import { TEMPLATES } from '@/lib/email-templates/registry'
import { getEmailTemplateOverride } from '@/lib/email-templates/overrides.server'
import { ensureEmailBranding } from '@/lib/email-templates/email-branding.server'
import { resolveTemplateContent, buildMergeContext } from '@/lib/email-templates/template-merge.server'
import { getTransactionalFromAddress } from '@/lib/send-transactional-email'

export const TRANSACTIONAL_SENDER_DOMAIN = 'notify.mypartb.com'

export type DispatchTransactionalTemplateInput = {
  templateName: string
  recipientEmail?: string
  idempotencyKey?: string
  templateData?: Record<string, unknown>
  messageId?: string
}

export type DispatchTransactionalTemplateResult =
  | { ok: true; queued: true; messageId: string }
  | { ok: false; success: false; reason: 'email_suppressed' }
  | { ok: false; error: string; status: number }

function redactEmail(email: string | null | undefined): string {
  if (!email) return '***'
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return '***'
  return `${localPart[0]}***@${domain}`
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function resolveUnsubscribeToken(
  supabase: SupabaseClient<any, any>,
  normalizedEmail: string,
  messageId: string,
  templateName: string,
  effectiveRecipient: string,
): Promise<
  | { ok: true; token: string }
  | { ok: false; error: string; status: number }
  | { ok: false; success: false; reason: 'email_suppressed' }
> {
  const { data: existingToken, error: tokenLookupError } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (tokenLookupError) {
    console.error('Token lookup failed', {
      error: tokenLookupError,
      email_redacted: redactEmail(normalizedEmail),
    })
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: 'Failed to look up unsubscribe token',
    })
    return { ok: false, error: 'Failed to prepare email', status: 500 }
  }

  if (existingToken && !existingToken.used_at) {
    return { ok: true, token: existingToken.token }
  }

  if (!existingToken) {
    const unsubscribeToken = generateToken()
    const { error: tokenError } = await supabase
      .from('email_unsubscribe_tokens')
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: 'email', ignoreDuplicates: true },
      )

    if (tokenError) {
      console.error('Failed to create unsubscribe token', { error: tokenError })
      await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: templateName,
        recipient_email: effectiveRecipient,
        status: 'failed',
        error_message: 'Failed to create unsubscribe token',
      })
      return { ok: false, error: 'Failed to prepare email', status: 500 }
    }

    const { data: storedToken, error: reReadError } = await supabase
      .from('email_unsubscribe_tokens')
      .select('token')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (reReadError || !storedToken) {
      console.error('Failed to read back unsubscribe token after upsert', {
        error: reReadError,
        email_redacted: redactEmail(normalizedEmail),
      })
      await supabase.from('email_send_log').insert({
        message_id: messageId,
        template_name: templateName,
        recipient_email: effectiveRecipient,
        status: 'failed',
        error_message: 'Failed to confirm unsubscribe token storage',
      })
      return { ok: false, error: 'Failed to prepare email', status: 500 }
    }

    return { ok: true, token: storedToken.token }
  }

  console.warn('Unsubscribe token already used but email not suppressed', {
    email_redacted: redactEmail(normalizedEmail),
  })
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: 'suppressed',
    error_message: 'Unsubscribe token used but email missing from suppressed list',
  })
  return { ok: false, success: false, reason: 'email_suppressed' }
}

async function enqueueAdminBccCopies(
  supabase: SupabaseClient<any, any>,
  opts: {
    templateName: string
    idempotencyKey: string
    normalizedPrimaryEmail: string
    resolvedSubject: string
    html: string
    plainText: string
  },
): Promise<void> {
  const isAdminTemplate = opts.templateName.endsWith('-admin')
  if (isAdminTemplate) return

  try {
    const admins = getAdminNotificationEmails()
    for (const adminEmail of admins) {
      if (!adminEmail || adminEmail === opts.normalizedPrimaryEmail) continue

      const { data: existingAdminToken } = await supabase
        .from('email_unsubscribe_tokens')
        .select('token, used_at')
        .eq('email', adminEmail)
        .maybeSingle()

      let adminToken: string
      if (existingAdminToken?.token && !existingAdminToken.used_at) {
        adminToken = existingAdminToken.token
      } else if (!existingAdminToken) {
        const newToken = generateToken()
        await supabase
          .from('email_unsubscribe_tokens')
          .upsert({ token: newToken, email: adminEmail }, { onConflict: 'email', ignoreDuplicates: true })
        const { data: stored } = await supabase
          .from('email_unsubscribe_tokens')
          .select('token')
          .eq('email', adminEmail)
          .maybeSingle()
        if (!stored?.token) continue
        adminToken = stored.token
      } else {
        continue
      }

      const { data: adminSuppressed } = await supabase
        .from('suppressed_emails')
        .select('id')
        .eq('email', adminEmail)
        .maybeSingle()
      if (adminSuppressed) continue

      const bccMessageId = crypto.randomUUID()
      await supabase.from('email_send_log').insert({
        message_id: bccMessageId,
        template_name: `${opts.templateName} (bcc)`,
        recipient_email: adminEmail,
        status: 'pending',
      })

      const { error: bccEnqueueError } = await supabase.rpc('enqueue_email', {
        queue_name: 'transactional_emails',
        payload: {
          message_id: bccMessageId,
          to: adminEmail,
          from: getTransactionalFromAddress(),
          sender_domain: TRANSACTIONAL_SENDER_DOMAIN,
          subject: `[BCC] ${opts.resolvedSubject}`,
          html: opts.html,
          text: opts.plainText,
          purpose: 'transactional',
          label: `${opts.templateName}-bcc`,
          idempotency_key: `${opts.idempotencyKey}-bcc-${adminEmail}`,
          unsubscribe_token: adminToken,
          queued_at: new Date().toISOString(),
        },
      })

      if (bccEnqueueError) {
        console.error('Failed to enqueue admin BCC copy', {
          error: bccEnqueueError,
          admin_redacted: redactEmail(adminEmail),
          templateName: opts.templateName,
        })
      }
    }
  } catch (bccErr) {
    console.error('Admin BCC enqueue threw', bccErr)
  }
}

function enrichTemplateDataForSend(
  data: Record<string, unknown>,
  recipientEmail: string,
): Record<string, unknown> {
  const merged = {
    ...data,
    email: data.email ?? recipientEmail,
    recipient: data.recipient ?? recipientEmail,
  }
  const ctx = buildMergeContext(merged)
  return {
    ...merged,
    recipientName: merged.recipientName ?? ctx.recipientName,
    firstName: merged.firstName ?? ctx.firstName,
    fullName: merged.fullName ?? ctx.fullName,
  }
}

/** Render a template, enqueue it, and optionally enqueue admin BCC copies. */
export async function dispatchTransactionalTemplate(
  supabase: SupabaseClient<any, any>,
  input: DispatchTransactionalTemplateInput,
): Promise<DispatchTransactionalTemplateResult> {
  const templateName = input.templateName
  const messageId = input.messageId ?? crypto.randomUUID()
  const idempotencyKey = input.idempotencyKey ?? messageId

  const template = TEMPLATES[templateName]
  if (!template) {
    console.error('Template not found in registry', { templateName })
    return {
      ok: false,
      error: `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`,
      status: 404,
    }
  }

  const effectiveRecipient = template.to || input.recipientEmail
  if (!effectiveRecipient) {
    return {
      ok: false,
      error: 'recipientEmail is required (unless the template defines a fixed recipient)',
      status: 400,
    }
  }

  const templateData = enrichTemplateDataForSend(input.templateData ?? {}, effectiveRecipient)

  const { data: suppressed, error: suppressionError } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', effectiveRecipient.toLowerCase())
    .maybeSingle()

  if (suppressionError) {
    console.error('Suppression check failed — refusing to send', {
      error: suppressionError,
      recipient_redacted: redactEmail(effectiveRecipient),
    })
    return { ok: false, error: 'Failed to verify suppression status', status: 500 }
  }

  if (suppressed) {
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'suppressed',
    })
    console.log('Email suppressed', {
      templateName,
      recipient_redacted: redactEmail(effectiveRecipient),
    })
    return { ok: false, success: false, reason: 'email_suppressed' }
  }

  const normalizedEmail = effectiveRecipient.toLowerCase()
  const tokenResult = await resolveUnsubscribeToken(
    supabase,
    normalizedEmail,
    messageId,
    templateName,
    effectiveRecipient,
  )
  if (!tokenResult.ok) {
    if ('reason' in tokenResult) {
      return { ok: false, success: false, reason: tokenResult.reason }
    }
    return { ok: false, error: tokenResult.error, status: tokenResult.status }
  }

  const element = React.createElement(template.component, templateData)
  const renderedHtml = await render(element)
  const renderedText = await render(element, { plainText: true })

  const renderedSubject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  const override = await getEmailTemplateOverride(templateName)
  const resolved = resolveTemplateContent({
    templateName,
    templateData,
    renderedHtml,
    renderedText,
    renderedSubject,
    override,
  })
  let html = resolved.html
  let plainText = resolved.text
  let resolvedSubject = resolved.subject

  html = await ensureEmailBranding(html, {
    siteUrl: getEnvVariable('PUBLIC_SITE_URL') ?? 'https://mypartb.pages.dev',
    unsubscribeToken: tokenResult.token,
  })

  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: getTransactionalFromAddress(),
      sender_domain: TRANSACTIONAL_SENDER_DOMAIN,
      subject: resolvedSubject,
      html,
      text: plainText,
      purpose: 'transactional',
      label: templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: tokenResult.token,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue email', {
      error: enqueueError,
      templateName,
      recipient_redacted: redactEmail(effectiveRecipient),
    })
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return { ok: false, error: 'Failed to enqueue email', status: 500 }
  }

  console.log('Transactional email enqueued', {
    templateName,
    recipient_redacted: redactEmail(effectiveRecipient),
  })

  await enqueueAdminBccCopies(supabase, {
    templateName,
    idempotencyKey,
    normalizedPrimaryEmail: normalizedEmail,
    resolvedSubject,
    html,
    plainText,
  })

  return { ok: true, queued: true, messageId }
}
