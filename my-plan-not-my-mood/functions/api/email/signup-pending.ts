import {
  buildAdminNewSignupHtml,
  corsPreflight,
  jsonResponse,
  sendViaResend,
} from '../../_shared/resend';
import { persistEmailSendLog, type EmailLogEnv } from '../../_shared/emailSendLog';

interface SignupPendingBody {
  name?: string;
  email?: string;
  phone?: string;
  wantsBeta?: boolean;
  appUrl?: string;
}

export const onRequestOptions = async () => corsPreflight();

export const onRequestPost = async (context: { request: Request; env: EmailLogEnv }) => {
  const { request, env } = context;

  let body: SignupPendingBody;
  try {
    body = (await request.json()) as SignupPendingBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const phone = body.phone?.trim() || '';
  const wantsBeta = Boolean(body.wantsBeta);
  const appUrl = (body.appUrl || env.APP_URL || 'https://nonnegotiation.com').replace(/\/$/, '');

  if (!name || !email) {
    return jsonResponse({ error: 'name and email are required' }, 400);
  }

  const adminEmail = env.ADMIN_NOTIFY_EMAIL;
  const subject = `New signup pending approval: ${name}`;
  const html = buildAdminNewSignupHtml(name, email, wantsBeta, `${appUrl}/admin?tab=users`, phone);

  if (!env.RESEND_API_KEY) {
    await persistEmailSendLog(env, {
      templateId: 'admin-new-signup',
      templateName: 'Admin alert — new signup',
      to: adminEmail || email,
      subject,
      html,
      skipped: true,
      ok: true,
      error: 'Email service not configured',
    });
    return jsonResponse({ skipped: true, error: 'Email service not configured' }, 503);
  }

  if (adminEmail) {
    const result = await sendViaResend(env, {
      to: adminEmail,
      subject,
      html,
    });
    await persistEmailSendLog(env, {
      id: result.id,
      templateId: 'admin-new-signup',
      templateName: 'Admin alert — new signup',
      to: adminEmail,
      subject,
      html: result.html || html,
      ok: result.ok,
      skipped: result.skipped,
      error: result.error,
    });
  }

  return jsonResponse({ ok: true });
};
