import { supabaseAdmin } from '@/integrations/supabase/client.server'

export interface EmailTemplateOverride {
  subject: string
  html: string
  text: string
}

/**
 * Convert an HTML string to a reasonable plain-text fallback for email
 * recipients that prefer text/plain. Keeps line breaks at block boundaries.
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/(p|div|h[1-6]|li|tr|br)>/gi, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Look up an admin-saved override for the given template name. Returns null
 * if no override exists. Failures are logged and treated as "no override"
 * so a transient DB error never blocks an outgoing email.
 */
export async function getEmailTemplateOverride(
  templateName: string,
): Promise<EmailTemplateOverride | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_template_overrides')
      .select('subject, html')
      .eq('template_name', templateName)
      .maybeSingle()
    if (error) {
      console.error('[email-overrides] lookup failed', {
        templateName,
        error: error.message,
      })
      return null
    }
    if (!data) return null
    return {
      subject: data.subject,
      html: data.html,
      text: htmlToPlainText(data.html),
    }
  } catch (err) {
    console.error('[email-overrides] unexpected error', { templateName, err })
    return null
  }
}
