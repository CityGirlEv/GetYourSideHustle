import { createFileRoute } from '@tanstack/react-router'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import * as React from 'react'
import { render } from '@react-email/components'
import { TEMPLATES } from '@/lib/email-templates/registry'

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
        const html = await render(element)
        const plainText = await render(element, { plainText: true })
        const subject = typeof template.subject === 'function'
          ? template.subject(template.previewData || {})
          : template.subject

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
            from: `The Medicare Optimizer <noreply@notify.getpartb.com>`,
            sender_domain: 'notify.getpartb.com',
            subject,
            html,
            text: plainText,
            purpose: 'transactional',
            label: templateName,
            idempotency_key: messageId,
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
