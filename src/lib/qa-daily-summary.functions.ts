import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { sendQaDailySummaryToAdmins } from '@/lib/qa-daily-summary.server'

async function verifyAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
  const isAdmin = (data ?? []).some((r) => r.role === 'admin')
  if (!isAdmin) throw new Error('Admin access required')
}

/** Manual trigger from admin tools — sends today's QA daily summary email. */
export const sendQaDailySummaryNow = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.userId)
    return sendQaDailySummaryToAdmins()
  })
