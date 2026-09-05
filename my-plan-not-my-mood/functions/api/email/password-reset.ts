import { buildPasswordResetHtml, corsPreflight, jsonResponse, sendViaResend } from '../../_shared/resend';
import { persistEmailSendLog, type EmailLogEnv } from '../../_shared/emailSendLog';

interface PasswordResetBody {
  name?: string;
  email?: string;
  resetUrl?: string;
}

export const onRequestOptions = async () => corsPreflight();

export const onRequestPost = async (context: { request: Request; env: EmailLogEnv }) => {
  const { request, env } = context;

  let body: PasswordResetBody;
  try {
    body = (await request.json()) as PasswordResetBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const resetUrl = body.resetUrl?.trim();

  if (!name || !email || !resetUrl) {
    return jsonResponse({ error: 'name, email, and resetUrl are required' }, 400);
  }

  const subject = 'Reset your My Plan, Not My Mood password';
  const html = buildPasswordResetHtml(name, resetUrl, email);

  if (!env.RESEND_API_KEY) {
    await persistEmailSendLog(env, {
      templateId: 'password-reset',
      templateName: 'Password reset',
      to: email,
      subject,
      html,
      skipped: true,
      ok: true,
      error: 'Email service not configured',
    });
    return jsonResponse({ skipped: true, error: 'Email service not configured' }, 503);
  }

  const result = await sendViaResend(env, {
    to: email,
    subject,
    html,
  });

  await persistEmailSendLog(env, {
    id: result.id,
    templateId: 'password-reset',
    templateName: 'Password reset',
    to: email,
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
