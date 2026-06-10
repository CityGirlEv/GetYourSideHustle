import { sendLovableEmail, EmailAPIError } from '@lovable.dev/email-js'
import { getEnvVariable, getRuntimeSecret } from '@/lib/env'

export const DEFAULT_EMAIL_DOMAIN = 'mypartb.com'
export const DEFAULT_TRANSACTIONAL_FROM = `The Medicare Optimizer <noreply@${DEFAULT_EMAIL_DOMAIN}>`
export const RESEND_SANDBOX_FROM = 'The Medicare Optimizer <onboarding@resend.dev>'

export function getTransactionalSenderDomain(): string {
  return getEnvVariable('EMAIL_SENDER_DOMAIN') ?? DEFAULT_EMAIL_DOMAIN
}

export function getTransactionalFromAddress(): string {
  return getEnvVariable('EMAIL_FROM') ?? DEFAULT_TRANSACTIONAL_FROM
}

/** True when Resend rejects delivery because the account/domain is still sandboxed. */
export function isResendSandboxRestriction(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('testing emails') ||
    lower.includes('verify a domain') ||
    lower.includes('domain is not verified') ||
    lower.includes('resend sandbox') ||
    (lower.includes('not verified') && lower.includes('domain'))
  )
}

export function formatResendDeliveryError(status: number, body: string): string {
  if (status === 403 && isResendSandboxRestriction(body)) {
    return (
      'Resend sandbox: verify mypartb.com in Resend and add DNS records (run node scripts/show-resend-dns-setup.mjs). ' +
      'Until then, only the Resend account owner email can receive test sends.'
    )
  }
  return `Resend error: ${status} ${body}`
}

export interface QueueEmailPayload {
  to: string
  from?: string
  subject: string
  html: string
  text?: string
  purpose?: string
  label?: string
  idempotency_key?: string
  unsubscribe_token?: string
  message_id?: string
  run_id?: string
  sender_domain?: string
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null
  const parsed = Number(header)
  if (!Number.isNaN(parsed)) return parsed
  const date = new Date(header)
  if (!Number.isNaN(date.getTime())) {
    return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000))
  }
  return null
}

async function sendViaResendRequest(
  payload: QueueEmailPayload,
  apiKey: string,
  from: string,
): Promise<void> {
  const trimmedKey = apiKey.trim()
  const headers: Record<string, string> = {
    Authorization: `Bearer ${trimmedKey}`,
    'Content-Type': 'application/json',
  }
  if (payload.idempotency_key) {
    headers['Idempotency-Key'] = payload.idempotency_key
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    const safeErrorText =
      errorText.length > 500 ? `${errorText.slice(0, 500)}...` : errorText
    throw new EmailAPIError(
      response.status,
      formatResendDeliveryError(response.status, safeErrorText),
      parseRetryAfter(response.headers.get('Retry-After')),
    )
  }
}

async function sendViaResend(payload: QueueEmailPayload, apiKey: string): Promise<void> {
  const preferredFrom = payload.from ?? getTransactionalFromAddress()
  try {
    await sendViaResendRequest(payload, apiKey, preferredFrom)
  } catch (error) {
    const canUseSandboxFrom =
      error instanceof EmailAPIError &&
      error.status === 403 &&
      isResendSandboxRestriction(error.message) &&
      preferredFrom !== RESEND_SANDBOX_FROM

    if (canUseSandboxFrom) {
      await sendViaResendRequest(payload, apiKey, RESEND_SANDBOX_FROM)
      return
    }
    throw error
  }
}

function isHtmlJsonParseError(error: unknown): boolean {
  if (error instanceof SyntaxError) return true
  return (
    error instanceof Error &&
    /Unexpected token '<'|not valid JSON/i.test(error.message)
  )
}

async function sendViaLovable(payload: QueueEmailPayload, apiKey: string): Promise<void> {
  const sendUrl = getEnvVariable('LOVABLE_SEND_URL')
  if (sendUrl && /lovable\.app/i.test(sendUrl)) {
    throw new Error(
      'LOVABLE_SEND_URL points to lovable.app (returns HTML). Configure RESEND_API_KEY in Cloudflare Pages secrets.',
    )
  }

  try {
    await sendLovableEmail(
      {
        run_id: payload.run_id,
        to: payload.to,
        from: payload.from ?? getTransactionalFromAddress(),
        sender_domain: payload.sender_domain,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        purpose: payload.purpose,
        label: payload.label,
        idempotency_key: payload.idempotency_key,
        unsubscribe_token: payload.unsubscribe_token,
        message_id: payload.message_id,
      },
      { apiKey, sendUrl: sendUrl || undefined },
    )
  } catch (error) {
    if (isHtmlJsonParseError(error)) {
      throw new Error(
        'Email API returned HTML instead of JSON. Configure RESEND_API_KEY in Cloudflare Pages secrets.',
      )
    }
    throw error
  }
}

/** Send a queued transactional email via Resend (preferred) or Lovable relay. */
export async function sendTransactionalEmail(payload: QueueEmailPayload): Promise<void> {
  const resendKey = getRuntimeSecret('RESEND_API_KEY')
  if (resendKey) {
    await sendViaResend(payload, resendKey)
    return
  }

  const lovableKey = getRuntimeSecret('LOVABLE_API_KEY')
  if (!lovableKey) {
    throw new Error(
      'Missing RESEND_API_KEY. Add it in Cloudflare Pages → mypartb → Settings → Environment variables (production secret).',
    )
  }

  await sendViaLovable(payload, lovableKey)
}
