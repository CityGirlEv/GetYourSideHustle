import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { getEnvVariable } from '@/lib/env'
import { getAdminNotificationEmails } from '@/lib/admin-notification-emails'
import { dispatchTransactionalTemplate } from '@/lib/dispatch-transactional-template.server'
import { triggerEmailQueueProcess } from '@/lib/trigger-email-queue-process'

export type SendTemplateInput = {
  templateName: string
  recipientEmail: string
  templateData?: Record<string, unknown>
  idempotencyKey: string
}

export function publicSiteUrl(): string {
  return (
    getEnvVariable('PUBLIC_SITE_URL') ??
    getEnvVariable('SITE_ORIGIN') ??
    'https://mypartb.com'
  )
}

export async function queueTransactionalTemplate(
  input: SendTemplateInput,
): Promise<boolean> {
  const result = await dispatchTransactionalTemplate(supabaseAdmin, input)
  if (result.ok) return true
  if ('reason' in result && result.reason === 'email_suppressed') {
    console.warn('[email] suppressed', input.templateName, input.recipientEmail)
    return false
  }
  console.error('[email] dispatch failed', input.templateName, result)
  return false
}

/** Queue one or more templates, then drain the send queue inline. */
export async function sendTransactionalTemplates(
  inputs: SendTemplateInput | SendTemplateInput[],
): Promise<{ queued: number; failed: number }> {
  const list = Array.isArray(inputs) ? inputs : [inputs]
  let queued = 0
  let failed = 0
  for (const input of list) {
    if (await queueTransactionalTemplate(input)) queued++
    else failed++
  }
  if (queued > 0) {
    try {
      await triggerEmailQueueProcess()
    } catch (e) {
      console.error('[email] queue process failed', e)
    }
  }
  return { queued, failed }
}

/** Send an admin-targeted template to every configured admin inbox. */
export async function notifyAdminInboxes(opts: {
  templateName: string
  templateData: Record<string, unknown>
  idempotencyPrefix: string
}): Promise<{ queued: number; failed: number }> {
  const admins = getAdminNotificationEmails()
  if (!admins.length) {
    console.warn('[email] no admin recipients configured')
    return { queued: 0, failed: 0 }
  }
  return sendTransactionalTemplates(
    admins.map((recipient) => ({
      templateName: opts.templateName,
      recipientEmail: recipient,
      templateData: opts.templateData,
      idempotencyKey: `${opts.idempotencyPrefix}-${recipient}`,
    })),
  )
}
