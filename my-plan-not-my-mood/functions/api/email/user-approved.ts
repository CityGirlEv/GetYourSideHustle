import { buildUserApprovedHtml, corsPreflight, jsonResponse, sendViaResend } from '../../_shared/resend';
import { persistEmailSendLog, type EmailLogEnv } from '../../_shared/emailSendLog';

interface UserApprovedBody {
  name?: string;
  email?: string;
  loginUrl?: string;
}

export const onRequestOptions = async () => corsPreflight();

export const onRequestPost = async (context: { request: Request; env: EmailLogEnv }) => {
  const { request, env } = context;

  let body: UserApprovedBody;
  try {
    body = (await request.json()) as UserApprovedBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const loginUrl = body.loginUrl?.trim();

  if (!name || !email || !loginUrl) {
    return jsonResponse({ error: 'name, email, and loginUrl are required' }, 400);
  }

  const subject = 'You are approved — sign in to My Plan, Not My Mood';
  const html = buildUserApprovedHtml(name, loginUrl);

  if (!env.RESEND_API_KEY) {
    await persistEmailSendLog(env, {
      templateId: 'user-approved',
      templateName: 'User approved — sign in',
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
    templateId: 'user-approved',
    templateName: 'User approved — sign in',
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
