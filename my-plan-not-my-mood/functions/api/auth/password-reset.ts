import { buildPasswordResetHtml, jsonResponse, sendViaResend } from '../../_shared/resend';
import { persistEmailSendLog } from '../../_shared/emailSendLog';
import {
  consumePasswordReset,
  createPasswordReset,
  getUserByEmail,
  type D1Like,
} from '../../_shared/usersDb';

type Env = {
  DB?: D1Like;
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
};

function cors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const onRequestOptions = async () => cors();

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const db = context.env.DB;
  if (!db) return jsonResponse({ error: 'Database is not configured' }, 503);

  let body: { action?: string; email?: string; token?: string; password?: string; appUrl?: string };
  try {
    body = (await context.request.json()) as typeof body;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const action = String(body.action || 'request');

  if (action === 'confirm') {
    const result = await consumePasswordReset(
      db,
      String(body.token || ''),
      String(body.password || ''),
    );
    if (!result.ok) return jsonResponse({ error: result.error }, 400);
    return jsonResponse({ ok: true, user: result.user });
  }

  // Always return the same generic notice (do not leak whether email exists).
  const notice =
    'If that email belongs to an activated account, we sent a reset link. Check your inbox and spam folder.';
  const email = String(body.email || '');
  const user = await getUserByEmail(db, email);
  if (!user || user.status !== 'active') {
    return jsonResponse({ ok: true, message: notice });
  }
  if (user.status === 'pending') {
    return jsonResponse({
      ok: false,
      error:
        'This account is not active yet. You will get an email when it is activated, then you can sign in or reset your password.',
    }, 400);
  }

  const { token } = await createPasswordReset(db, user);
  const appUrl = String(body.appUrl || 'https://nonnegotiation.com').replace(/\/$/, '');
  const resetUrl = `${appUrl}/?${new URLSearchParams({ reset: token }).toString()}`;

  if (context.env.RESEND_API_KEY) {
    const subject = 'Reset your My Plan, Not My Mood password';
    const html = buildPasswordResetHtml(user.name, resetUrl, user.email);
    const sent = await sendViaResend(context.env, {
      to: user.email,
      subject,
      html,
    });
    await persistEmailSendLog(context.env, {
      id: sent.id,
      templateId: 'password-reset',
      templateName: 'Password reset',
      to: user.email,
      subject,
      html: sent.html || html,
      ok: sent.ok,
      skipped: sent.skipped,
      error: sent.error,
    });
    if (!sent.ok && !sent.skipped) {
      return jsonResponse({ error: sent.error || 'Failed to send email' }, 502);
    }
  }

  return jsonResponse({ ok: true, message: notice });
};
