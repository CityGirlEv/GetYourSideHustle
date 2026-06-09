import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import * as React from 'react'
import { render } from '@react-email/components'
import { TEMPLATES } from '@/lib/email-templates/registry'
import { getEmailTemplateOverride } from '@/lib/email-templates/overrides.server'

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

// Admin BCC list — mirror the transactional sender so test emails also
// produce an admin paper trail. Override via ADMIN_NOTIFICATION_EMAILS.
const DEFAULT_ADMIN_BCC = ["getpartb@gmail.com"]
function adminBccRecipients(): string[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS
  const configured = raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ADMIN_BCC
  return Array.from(new Set(configured.map((e) => e.toLowerCase())))
}

/**
 * Public endpoint for sending a test email.
 * Protected by a simple secret query param for abuse prevention.
 */
export const Route = createFileRoute('/api/public/send-test-email')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url)
        const secret = url.searchParams.get('secret')
        const expectedSecret = process.env.TEST_EMAIL_SECRET

        // Hard requirement: the endpoint is disabled unless TEST_EMAIL_SECRET
        // is configured. Without this the endpoint was an open relay for
        // anyone to send emails through the verified sending domain.
        if (!expectedSecret) {
          return Response.json(
            { error: 'Endpoint disabled: TEST_EMAIL_SECRET is not configured' },
            { status: 503 },
          )
        }
        if (secret !== expectedSecret) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let recipient: string
        let templateName: string
        try {
          const body = await request.json()
          recipient = body.recipient
          templateName = body.template || 'welcome'
        } catch {
          return Response.json({ error: 'Invalid JSON' }, { status: 400 })
        }

        if (!recipient || !recipient.includes('@')) {
          return Response.json({ error: 'Valid recipient email required' }, { status: 400 })
        }

        const template = TEMPLATES[templateName]
        if (!template) {
          return Response.json({ error: `Template '${templateName}' not found` }, { status: 404 })
        }

        const messageId = crypto.randomUUID()
        const element = React.createElement(template.component, template.previewData || {})
        let html = await render(element)
        let plainText = await render(element, { plainText: true })
        let subject = typeof template.subject === 'function'
          ? template.subject(template.previewData || {})
          : template.subject

        const override = await getEmailTemplateOverride(templateName)
        if (override) {
          html = override.html
          plainText = override.text
          subject = override.subject
        }

        const unsubscribeToken = await getOrCreateUnsubscribeToken(recipient)

        // Log pending
        await supabaseAdmin.from('email_send_log').insert({
          message_id: messageId,
          template_name: templateName,
          recipient_email: recipient,
          status: 'pending',
        })

        // Enqueue
        const { error: enqueueError } = await supabaseAdmin.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            message_id: messageId,
            to: recipient,
            from: `The Medicare Optimizer <noreply@notify.mypartb.com>`,
            sender_domain: 'notify.mypartb.com',
            subject,
            html,
            text: plainText,
            purpose: 'transactional',
            label: templateName,
            idempotency_key: messageId,
            unsubscribe_token: unsubscribeToken,
            queued_at: new Date().toISOString(),
          },
        })

        if (enqueueError) {
          await supabaseAdmin.from('email_send_log').insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: recipient,
            status: 'failed',
            error_message: `Enqueue failed: ${enqueueError.message}`,
          })
          return Response.json({ error: 'Failed to enqueue email' }, { status: 500 })
        }

        // Fire-and-forget admin BCC copies (skip for admin-targeted templates
        // and skip if the primary recipient is already an admin).
        try {
          const admins = adminBccRecipients()
          const isAdminTemplate = templateName.endsWith('-admin')
          const normalizedRecipient = recipient.toLowerCase()
          if (!isAdminTemplate) {
            for (const adminEmail of admins) {
              if (!adminEmail || adminEmail === normalizedRecipient) continue
              const adminToken = await getOrCreateUnsubscribeToken(adminEmail)
              const bccMessageId = crypto.randomUUID()
              await supabaseAdmin.from('email_send_log').insert({
                message_id: bccMessageId,
                template_name: `${templateName} (bcc)`,
                recipient_email: adminEmail,
                status: 'pending',
              })
              const { error: bccErr } = await supabaseAdmin.rpc('enqueue_email', {
                queue_name: 'transactional_emails',
                payload: {
                  message_id: bccMessageId,
                  to: adminEmail,
                  from: `The Medicare Optimizer <noreply@notify.mypartb.com>`,
                  sender_domain: 'notify.mypartb.com',
                  subject: `[BCC] ${subject}`,
                  html,
                  text: plainText,
                  purpose: 'transactional',
                  label: `${templateName}-bcc`,
                  idempotency_key: `${messageId}-bcc-${adminEmail}`,
                  unsubscribe_token: adminToken,
                  queued_at: new Date().toISOString(),
                },
              })
              if (bccErr) {
                console.error('Failed to enqueue test-email admin BCC', {
                  error: bccErr,
                  templateName,
                })
              }
            }
          }
        } catch (bccErr) {
          console.error('Test email admin BCC threw', bccErr)
        }

        return Response.json({
          success: true,
          messageId,
          template: templateName,
          recipient,
          note: 'Email queued. Delivery depends on domain verification.',
        })
      },
    },
  },
})
