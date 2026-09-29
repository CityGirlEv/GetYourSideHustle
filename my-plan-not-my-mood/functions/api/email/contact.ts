import { corsPreflight, jsonResponse, sendViaResend } from '../../_shared/resend';
import { persistEmailSendLog, type EmailLogEnv } from '../../_shared/emailSendLog';
import {
  CONTACT_INBOX_EMAIL,
  CONTACT_TEMPLATE_ID,
  CONTACT_TEMPLATE_NAME,
  buildContactNoteHtml,
  buildContactNoteSubject,
  contactInboxRecipients,
  validateContactForm,
} from '../../../src/lib/contactForm';

type ContactEnv = EmailLogEnv & {
  CONTACT_INBOX_EMAIL?: string;
};

export const onRequestOptions = async () => corsPreflight();

export const onRequest = async (context: { request: Request; env: ContactEnv }) => {
  const method = context.request.method.toUpperCase();
  if (method === 'OPTIONS') return corsPreflight();
  if (method === 'POST') return onRequestPost(context);
  return jsonResponse({ error: 'Method not allowed' }, 405);
};

export const onRequestPost = async (context: { request: Request; env: ContactEnv }) => {
  const { request, env } = context;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const parsed = validateContactForm({
    name: typeof body.name === 'string' ? body.name : '',
    email: typeof body.email === 'string' ? body.email : '',
    subject: typeof body.subject === 'string' ? body.subject : '',
    message: typeof body.message === 'string' ? body.message : '',
  });
  if (!parsed.ok) {
    return jsonResponse({ error: parsed.error, field: parsed.field }, 400);
  }

  const subject = buildContactNoteSubject(parsed.values.subject);
  const html = buildContactNoteHtml(parsed.values);
  const to = contactInboxRecipients(env.ADMIN_NOTIFY_EMAIL, env.CONTACT_INBOX_EMAIL || CONTACT_INBOX_EMAIL);

  if (!env.RESEND_API_KEY) {
    await persistEmailSendLog(env, {
      templateId: CONTACT_TEMPLATE_ID,
      templateName: CONTACT_TEMPLATE_NAME,
      to: to.join(', '),
      subject,
      html,
      skipped: true,
      ok: true,
      error: 'Email service not configured',
    });
    return jsonResponse({ skipped: true, error: 'Email service not configured' }, 503);
  }

  const result = await sendViaResend(env, {
    to,
    subject,
    html,
    replyTo: parsed.values.email,
  });

  await persistEmailSendLog(env, {
    id: result.id,
    templateId: CONTACT_TEMPLATE_ID,
    templateName: CONTACT_TEMPLATE_NAME,
    to: to.join(', '),
    subject,
    html: result.html || html,
    ok: result.ok,
    skipped: result.skipped,
    error: result.error,
  });

  if (!result.ok && !result.skipped) {
    return jsonResponse({ error: result.error || 'Failed to send email' }, 502);
  }

  return jsonResponse({ ok: true });
};
