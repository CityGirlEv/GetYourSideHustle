import type { SupabaseClient } from '@supabase/supabase-js'

export async function markEmailSendLog(
  supabase: SupabaseClient<any, any>,
  messageId: string | undefined,
  status: 'sent' | 'failed' | 'dlq',
  errorMessage?: string,
  meta?: { template_name?: string; recipient_email?: string },
): Promise<void> {
  if (!messageId) return

  const patch: Record<string, string | null> = { status }
  if (errorMessage !== undefined) {
    patch.error_message = errorMessage ? errorMessage.slice(0, 1000) : null
  }

  const { data: updated, error: updateError } = await supabase
    .from('email_send_log')
    .update(patch)
    .eq('message_id', messageId)
    .select('id')

  if (updateError) {
    console.error('email_send_log update failed', { messageId, updateError })
  }

  if (updated?.length) return

  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: meta?.template_name ?? 'unknown',
    recipient_email: meta?.recipient_email ?? '',
    status,
    error_message: errorMessage?.slice(0, 1000) ?? null,
  })
}
