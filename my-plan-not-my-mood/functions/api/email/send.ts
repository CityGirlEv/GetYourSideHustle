import { corsPreflight, jsonResponse, sendViaResend } from '../../_shared/resend';
import { persistEmailSendLog, type EmailLogEnv } from '../../_shared/emailSendLog';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_HTML = 150_000;
const MAX_SUBJECT = 200;

interface SendBody {
  to?: string;
  subject?: string;
  html?: string;
  test?: boolean;
  templateId?: string;
  templateName?: string;
}

export const onRequestOptions = async () => corsPreflight();

export const onRequestPost = async (context: { request: Request; env: EmailLogEnv }) => {
  const { request, env } = context;

  let body: SendBody;
  try {
    body = (await request.json()) as SendBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const to = body.to?.trim().toLowerCase() || '';
  const subjectIn = body.subject?.trim() || '';
  const html = body.html?.trim() || '';
  const test = Boolean(body.test);
  const templateId = body.templateId?.trim() || '';
  const templateName = body.templateName?.trim() || '';

  if (!EMAIL_PATTERN.test(to)) {
    return jsonResponse({ error: 'A valid recipient email is required.' }, 400);
  }
  if (!subjectIn) {
    return jsonResponse({ error: 'Subject is required.' }, 400);
  }
  if (!html) {
    return jsonResponse({ error: 'HTML body is required.' }, 400);
  }
  if (html.length > MAX_HTML) {
    return jsonResponse({ error: 'HTML body is too large to send.' }, 400);
  }

  let subject = subjectIn.slice(0, MAX_SUBJECT);
  if (test && !subject.toUpperCase().startsWith('[TEST]')) {
    subject = `[TEST] ${subject}`.slice(0, MAX_SUBJECT);
  }

  if (!env.RESEND_API_KEY) {
    await persistEmailSendLog(env, {
      templateId,
      templateName,
      to,
      subject,
      html,
      test,
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
  });

  await persistEmailSendLog(env, {
    id: result.id,
    templateId,
    templateName,
    to,
    subject,
    html: result.html || html,
    test,
    ok: result.ok,
    skipped: result.skipped,
    error: result.error,
  });

  if (!result.ok && !result.skipped) {
    return jsonResponse({ error: result.error || 'Failed to send email' }, 502);
  }

  return jsonResponse({ ok: true, skipped: result.skipped, test, id: result.id });
};
