import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { getRuntimeSecret } from '@/lib/env'
import { markEmailSendLog } from '@/lib/email-send-log'
import {
  sendTransactionalEmail,
  isResendSandboxRestriction,
} from '@/lib/send-transactional-email'

const MAX_RETRIES = 5
const DEFAULT_BATCH_SIZE = 10
const DEFAULT_SEND_DELAY_MS = 200
const DEFAULT_AUTH_TTL_MINUTES = 15
const DEFAULT_TRANSACTIONAL_TTL_MINUTES = 60

export type ProcessEmailQueueResult = {
  processed: number
  skipped?: boolean
  reason?: string
  stopped?: string
}

function isRateLimited(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: number }).status === 429
  }
  return error instanceof Error && error.message.includes('429')
}

function isForbidden(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: number }).status === 403
  }
  return error instanceof Error && error.message.includes('403')
}

function getRetryAfterSeconds(error: unknown): number {
  if (error && typeof error === 'object' && 'retryAfterSeconds' in error) {
    return (error as { retryAfterSeconds: number | null }).retryAfterSeconds ?? 60
  }
  return 60
}

async function moveToDlq(
  supabase: SupabaseClient<any, any>,
  queue: string,
  msg: { msg_id: number; message: Record<string, unknown> },
  reason: string,
): Promise<void> {
  const payload = msg.message
  await markEmailSendLog(
    supabase,
    typeof payload.message_id === 'string' ? payload.message_id : undefined,
    'dlq',
    reason,
    {
      template_name: (payload.label || queue) as string,
      recipient_email: String(payload.to ?? ''),
    },
  )
  const { error } = await supabase.rpc('move_to_dlq', {
    source_queue: queue,
    dlq_name: `${queue}_dlq`,
    message_id: msg.msg_id,
    payload,
  })
  if (error) {
    console.error('Failed to move message to DLQ', { queue, msg_id: msg.msg_id, reason, error })
  }
}

export function assertEmailProviderConfigured(): void {
  const resendKey = getRuntimeSecret('RESEND_API_KEY')
  const lovableKey = getRuntimeSecret('LOVABLE_API_KEY')
  if (!resendKey && !lovableKey) {
    throw new Error(
      'Missing RESEND_API_KEY. Add it in Cloudflare Pages → mypartb → Settings → Environment variables (production secret).',
    )
  }
}

export async function processEmailQueue(
  supabaseClient?: SupabaseClient<any, any>,
): Promise<ProcessEmailQueueResult> {
  assertEmailProviderConfigured()

  const supabase = supabaseClient ?? supabaseAdmin

  const { data: state } = await supabase
    .from('email_send_state')
    .select(
      'retry_after_until, batch_size, send_delay_ms, auth_email_ttl_minutes, transactional_email_ttl_minutes',
    )
    .single()

  if (state?.retry_after_until && new Date(state.retry_after_until) > new Date()) {
    return { processed: 0, skipped: true, reason: 'rate_limited' }
  }

  const batchSize = state?.batch_size ?? DEFAULT_BATCH_SIZE
  const sendDelayMs = state?.send_delay_ms ?? DEFAULT_SEND_DELAY_MS
  const ttlMinutes: Record<string, number> = {
    auth_emails: state?.auth_email_ttl_minutes ?? DEFAULT_AUTH_TTL_MINUTES,
    transactional_emails:
      state?.transactional_email_ttl_minutes ?? DEFAULT_TRANSACTIONAL_TTL_MINUTES,
  }

  let totalProcessed = 0

  for (const queue of ['auth_emails', 'transactional_emails']) {
    const { data: messages, error: readError } = await supabase.rpc('read_email_batch', {
      queue_name: queue,
      batch_size: batchSize,
      vt: 30,
    })

    if (readError) {
      console.error('Failed to read email batch', { queue, error: readError })
      continue
    }

    if (!messages?.length) continue

    const messageIds = Array.from(
      new Set(
        messages
          .map((msg: any) =>
            msg?.message?.message_id && typeof msg.message.message_id === 'string'
              ? msg.message.message_id
              : null,
          )
          .filter((id: string | null): id is string => Boolean(id)),
      ),
    )
    const failedAttemptsByMessageId = new Map<string, number>()
    if (messageIds.length > 0) {
      const { data: failedRows, error: failedRowsError } = await supabase
        .from('email_send_log')
        .select('message_id')
        .in('message_id', messageIds)
        .eq('status', 'failed')

      if (failedRowsError) {
        console.error('Failed to load failed-attempt counters', {
          queue,
          error: failedRowsError,
        })
      } else {
        for (const row of failedRows ?? []) {
          const messageId = row?.message_id
          if (typeof messageId !== 'string' || !messageId) continue
          failedAttemptsByMessageId.set(
            messageId,
            (failedAttemptsByMessageId.get(messageId) ?? 0) + 1,
          )
        }
      }
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      const payload = msg.message
      const failedAttempts =
        payload?.message_id && typeof payload.message_id === 'string'
          ? (failedAttemptsByMessageId.get(payload.message_id) ?? 0)
          : msg.read_ct ?? 0

      const queuedAt = payload.queued_at ?? msg.enqueued_at
      if (queuedAt) {
        const ageMs = Date.now() - new Date(queuedAt).getTime()
        const maxAgeMs = ttlMinutes[queue] * 60 * 1000
        if (ageMs > maxAgeMs) {
          await moveToDlq(
            supabase,
            queue,
            msg,
            `TTL exceeded (${ttlMinutes[queue]} minutes)`,
          )
          continue
        }
      }

      if (failedAttempts >= MAX_RETRIES) {
        await moveToDlq(
          supabase,
          queue,
          msg,
          `Max retries (${MAX_RETRIES}) exceeded (attempted ${failedAttempts} times)`,
        )
        continue
      }

      if (payload.message_id) {
        const { data: alreadySent } = await supabase
          .from('email_send_log')
          .select('id')
          .eq('message_id', payload.message_id)
          .eq('status', 'sent')
          .maybeSingle()

        if (alreadySent) {
          await supabase.rpc('delete_email', {
            queue_name: queue,
            message_id: msg.msg_id,
          })
          continue
        }
      }

      try {
        await sendTransactionalEmail({
          run_id: payload.run_id as string | undefined,
          to: String(payload.to),
          from: payload.from as string | undefined,
          sender_domain: payload.sender_domain as string | undefined,
          subject: String(payload.subject),
          html: String(payload.html),
          text: payload.text as string | undefined,
          purpose: payload.purpose as string | undefined,
          label: payload.label as string | undefined,
          idempotency_key: payload.idempotency_key as string | undefined,
          unsubscribe_token: payload.unsubscribe_token as string | undefined,
          message_id: payload.message_id as string | undefined,
        })

        await markEmailSendLog(
          supabase,
          payload.message_id as string | undefined,
          'sent',
          undefined,
          {
            template_name: String(payload.label || queue),
            recipient_email: String(payload.to),
          },
        )

        await supabase.rpc('delete_email', {
          queue_name: queue,
          message_id: msg.msg_id,
        })
        totalProcessed++
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error('Email send failed', {
          queue,
          msg_id: msg.msg_id,
          failed_attempts: failedAttempts,
          error: errorMsg,
        })

        if (isRateLimited(error)) {
          await markEmailSendLog(
            supabase,
            payload.message_id as string | undefined,
            'failed',
            errorMsg,
            {
              template_name: String(payload.label || queue),
              recipient_email: String(payload.to),
            },
          )

          const retryAfterSecs = getRetryAfterSeconds(error)
          await supabase
            .from('email_send_state')
            .update({
              retry_after_until: new Date(Date.now() + retryAfterSecs * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', 1)

          return { processed: totalProcessed, stopped: 'rate_limited' }
        }

        if (isForbidden(error) && !isResendSandboxRestriction(errorMsg)) {
          await moveToDlq(supabase, queue, msg, errorMsg.slice(0, 1000))
          return { processed: totalProcessed, stopped: 'forbidden' }
        }

        await markEmailSendLog(
          supabase,
          payload.message_id as string | undefined,
          'failed',
          errorMsg,
          {
            template_name: String(payload.label || queue),
            recipient_email: String(payload.to),
          },
        )
        if (payload?.message_id && typeof payload.message_id === 'string') {
          failedAttemptsByMessageId.set(payload.message_id, failedAttempts + 1)
        }
      }

      if (i < messages.length - 1) {
        await new Promise((r) => setTimeout(r, sendDelayMs))
      }
    }
  }

  return { processed: totalProcessed }
}
