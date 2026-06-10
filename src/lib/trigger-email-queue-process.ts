import { processEmailQueue } from '@/lib/process-email-queue'
import { getEnvVariable, getRuntimeSecret } from '@/lib/env'

/** Process the email queue inline in the current worker (preferred). */
export async function triggerEmailQueueProcess(requestUrl?: string): Promise<void> {
  try {
    await processEmailQueue()
  } catch (err) {
    console.error('[email-queue] inline process failed', err)
    await triggerEmailQueueProcessHttp(requestUrl)
  }
}

/** Fallback for pg_cron or recovery when inline processing fails. */
async function triggerEmailQueueProcessHttp(requestUrl?: string): Promise<void> {
  const serviceKey = getRuntimeSecret('SUPABASE_SERVICE_ROLE_KEY')
  if (!serviceKey) return

  const origin =
    getEnvVariable('SITE_ORIGIN') ??
    getEnvVariable('PUBLIC_SITE_URL') ??
    (requestUrl ? new URL(requestUrl).origin : undefined) ??
    'https://mypartb.pages.dev'

  const res = await fetch(`${origin.replace(/\/$/, '')}/lovable/email/queue/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${serviceKey}` },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error('[email-queue] HTTP trigger failed', res.status, body.slice(0, 300))
  }
}
