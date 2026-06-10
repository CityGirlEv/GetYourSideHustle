import * as React from 'react'
import { render } from '@react-email/components'
import { createClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { getEnvVariable } from '@/lib/env'
import { TEMPLATES } from '@/lib/email-templates/registry'
import { getEmailTemplateOverride } from '@/lib/email-templates/overrides.server'
import { ensureEmailBranding } from '@/lib/email-templates/email-branding.server'
import { getTransactionalFromAddress } from '@/lib/send-transactional-email'
import { triggerEmailQueueProcess } from '@/lib/trigger-email-queue-process'
import { DEFAULT_ADMIN_NOTIFICATION_EMAILS } from '@/lib/registration.functions'

// Configuration baked in at scaffold time
const SITE_NAME = "mypartb"
// SENDER_DOMAIN is the verified sender subdomain FQDN (e.g., "notify.example.com").
// It MUST match the subdomain delegated to Lovable's nameservers. NEVER use the root domain.
const SENDER_DOMAIN = "notify.mypartb.com"
// FROM_DOMAIN is the domain shown in the From: header (e.g., "example.com").
// Can be the root domain when display_from_root is enabled — this is cosmetic only.
const FROM_DOMAIN = "mypartb.com"

// Admin BCC list — every outgoing transactional email also enqueues a blind
// copy to these addresses so admins have a paper trail. Override via the
// ADMIN_NOTIFICATION_EMAILS env var (comma-separated).
function adminBccRecipients(): string[] {
  const raw = getEnvVariable('ADMIN_NOTIFICATION_EMAILS')
  const configured = raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ADMIN_NOTIFICATION_EMAILS
  return Array.from(new Set(configured.map((e) => e.toLowerCase())))
}

function redactEmail(email: string | null | undefined): string {
  if (!email) return '***'
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return '***'
  return `${localPart[0]}***@${domain}`
}

// Generate a cryptographically random 32-byte hex token
function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const Route = createFileRoute("/lovable/email/transactional/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = getEnvVariable('SUPABASE_URL')
        const supabaseServiceKey = getEnvVariable('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseServiceKey) {
          console.error('Missing required environment variables')
          return Response.json(
            { error: 'Server configuration error' },
            { status: 500 }
          )
        }

        // Verify the caller has a valid Supabase auth token.
        // In TanStack, there is no Supabase gateway — we validate the JWT ourselves.
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.slice('Bearer '.length).trim()
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        // Allow server-to-server calls (e.g. from server functions) to use the
        // service-role key directly instead of a user JWT.
        if (token !== supabaseServiceKey) {
          const { data: { user }, error: authError } = await supabase.auth.getUser(token)
          if (authError || !user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }
          // Role gate: only privileged staff may dispatch templates. This
          // prevents lower-privileged users (advisor/viewer) from
          // weaponizing the verified sending domain to email arbitrary
          // recipients. Service-role callers (server-to-server) skip this.
          const { data: roles, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
          if (roleError) {
            console.error('Role lookup failed for transactional send', { error: roleError })
            return Response.json({ error: 'Authorization check failed' }, { status: 500 })
          }
          const allowed = new Set(['admin', 'qa', 'agent'])
          const hasRole = (roles ?? []).some((r) => allowed.has(r.role as string))
          if (!hasRole) {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
          }
        }

        // Parse request body
        let templateName: string
        let recipientEmail: string
        let idempotencyKey: string
        let messageId: string
        let templateData: Record<string, any> = {}
        try {
          const body = await request.json()
          templateName = body.templateName || body.template_name
          recipientEmail = body.recipientEmail || body.recipient_email
          messageId = crypto.randomUUID()
          idempotencyKey = body.idempotencyKey || body.idempotency_key || messageId
          if (body.templateData && typeof body.templateData === 'object') {
            templateData = body.templateData
          }
        } catch {
          return Response.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          )
        }

        if (!templateName) {
          return Response.json(
            { error: 'templateName is required' },
            { status: 400 }
          )
        }

        // 1. Look up template from registry (early — needed to resolve recipient)
        const template = TEMPLATES[templateName]

        if (!template) {
          console.error('Template not found in registry', { templateName })
          return Response.json(
            {
              error: `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`,
            },
            { status: 404 }
          )
        }

        // Resolve effective recipient: template-level `to` takes precedence over
        // the caller-provided recipientEmail. This allows notification templates
        // to always send to a fixed address (e.g., site owner from env var).
        const effectiveRecipient = template.to || recipientEmail

        if (!effectiveRecipient) {
          return Response.json(
            {
              error: 'recipientEmail is required (unless the template defines a fixed recipient)',
            },
            { status: 400 }
          )
        }

        // 2. Check suppression list (fail-closed: if we can't verify, don't send)
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
          return Response.json(
            { error: 'Failed to verify suppression status' },
            { status: 500 }
          )
        }

        if (suppressed) {
          // Log the suppressed attempt
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
          return Response.json({ success: false, reason: 'email_suppressed' })
        }

        // 3. Get or create unsubscribe token (one token per email address)
        const normalizedEmail = effectiveRecipient.toLowerCase()
        let unsubscribeToken: string

        // Check for existing token for this email
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
          return Response.json(
            { error: 'Failed to prepare email' },
            { status: 500 }
          )
        }

        if (existingToken && !existingToken.used_at) {
          // Reuse existing unused token
          unsubscribeToken = existingToken.token
        } else if (!existingToken) {
          // Create new token — upsert handles concurrent inserts gracefully
          unsubscribeToken = generateToken()
          const { error: tokenError } = await supabase
            .from('email_unsubscribe_tokens')
            .upsert(
              { token: unsubscribeToken, email: normalizedEmail },
              { onConflict: 'email', ignoreDuplicates: true }
            )

          if (tokenError) {
            console.error('Failed to create unsubscribe token', {
              error: tokenError,
            })
            await supabase.from('email_send_log').insert({
              message_id: messageId,
              template_name: templateName,
              recipient_email: effectiveRecipient,
              status: 'failed',
              error_message: 'Failed to create unsubscribe token',
            })
            return Response.json(
              { error: 'Failed to prepare email' },
              { status: 500 }
            )
          }

          // If another request raced us, our upsert was silently ignored.
          // Re-read to get the actual stored token.
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
            return Response.json(
              { error: 'Failed to prepare email' },
              { status: 500 }
            )
          }
          unsubscribeToken = storedToken.token
        } else {
          // Token exists but is already used — email should have been caught by suppression check above.
          // This is a safety fallback; log and skip sending.
          console.warn('Unsubscribe token already used but email not suppressed', {
            email_redacted: redactEmail(normalizedEmail),
          })
          await supabase.from('email_send_log').insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: 'suppressed',
            error_message:
              'Unsubscribe token used but email missing from suppressed list',
          })
          return Response.json({ success: false, reason: 'email_suppressed' })
        }

        // 4. Render React Email template to HTML and plain text
        const element = React.createElement(template.component, templateData)
        let html = await render(element)
        let plainText = await render(element, { plainText: true })

        // Resolve subject — supports static string or dynamic function
        let resolvedSubject =
          typeof template.subject === 'function'
            ? template.subject(templateData)
            : template.subject

        // Admin override (if any) takes precedence over the built-in template.
        const override = await getEmailTemplateOverride(templateName)
        if (override) {
          html = override.html
          plainText = override.text
          resolvedSubject = override.subject
        }

        html = await ensureEmailBranding(html, {
          siteUrl: getEnvVariable('PUBLIC_SITE_URL') ?? 'https://mypartb.pages.dev',
          unsubscribeToken,
        })

        // 5. Enqueue the pre-rendered email for async processing by the dispatcher.
        // The dispatcher (process-email-queue) handles sending, retries, and rate-limit backoff.

        // Log pending BEFORE enqueue so we have a record even if enqueue crashes
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
            sender_domain: SENDER_DOMAIN,
            subject: resolvedSubject,
            html,
            text: plainText,
            purpose: 'transactional',
            label: templateName,
            idempotency_key: idempotencyKey,
            unsubscribe_token: unsubscribeToken,
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

          return Response.json(
            { error: 'Failed to enqueue email' },
            { status: 500 }
          )
        }

        console.log('Transactional email enqueued', {
          templateName,
          recipient_redacted: redactEmail(effectiveRecipient),
        })

        // Fire-and-forget: enqueue a blind copy to each admin BCC recipient.
        // Skipped if the primary recipient is already an admin (no self-BCC)
        // and if this send is itself an admin notification (already addressed
        // to an admin via the regular flow).
        try {
          const admins = adminBccRecipients()
          const isAdminTemplate = templateName.endsWith('-admin')
          for (const adminEmail of admins) {
            if (!adminEmail) continue
            if (adminEmail === normalizedEmail) continue
            if (isAdminTemplate) continue

            // Resolve / create an unsubscribe token for the admin address so
            // the dispatcher payload validates the same way as a normal send.
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
                .upsert(
                  { token: newToken, email: adminEmail },
                  { onConflict: 'email', ignoreDuplicates: true }
                )
              const { data: stored } = await supabase
                .from('email_unsubscribe_tokens')
                .select('token')
                .eq('email', adminEmail)
                .maybeSingle()
              if (!stored?.token) continue
              adminToken = stored.token
            } else {
              // Admin previously unsubscribed — honor it, don't BCC them.
              continue
            }

            // Suppression check — admins who unsubscribed shouldn't get copies.
            const { data: adminSuppressed } = await supabase
              .from('suppressed_emails')
              .select('id')
              .eq('email', adminEmail)
              .maybeSingle()
            if (adminSuppressed) continue

            const bccMessageId = crypto.randomUUID()
            await supabase.from('email_send_log').insert({
              message_id: bccMessageId,
              template_name: `${templateName} (bcc)`,
              recipient_email: adminEmail,
              status: 'pending',
            })
            const { error: bccEnqueueError } = await supabase.rpc('enqueue_email', {
              queue_name: 'transactional_emails',
              payload: {
                message_id: bccMessageId,
                to: adminEmail,
                from: getTransactionalFromAddress(),
                sender_domain: SENDER_DOMAIN,
                subject: `[BCC] ${resolvedSubject}`,
                html,
                text: plainText,
                purpose: 'transactional',
                label: `${templateName}-bcc`,
                idempotency_key: `${idempotencyKey}-bcc-${adminEmail}`,
                unsubscribe_token: adminToken,
                queued_at: new Date().toISOString(),
              },
            })
            if (bccEnqueueError) {
              console.error('Failed to enqueue admin BCC copy', {
                error: bccEnqueueError,
                admin_redacted: redactEmail(adminEmail),
                templateName,
              })
            }
          }
        } catch (bccErr) {
          console.error('Admin BCC enqueue threw', bccErr)
        }

        await triggerEmailQueueProcess(request.url)

        return Response.json({ success: true, queued: true })
      },
    },
  },
})
