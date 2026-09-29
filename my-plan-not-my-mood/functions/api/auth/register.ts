import { buildAdminNewSignupHtml, jsonResponse, sendViaResend } from '../../_shared/resend';
import { persistEmailSendLog } from '../../_shared/emailSendLog';
import {
  createSession,
  registerUserRow,
  type D1Like,
  type UserRole,
} from '../../_shared/usersDb';
import {
  requestWantsSecureCookie,
  sessionCookieHeader,
} from '../../_shared/passwords';

type Env = {
  DB?: D1Like;
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
  ADMIN_NOTIFY_EMAIL?: string;
};

function authCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

function jsonWithCookie(data: unknown, status: number, setCookie?: string): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };
  if (setCookie) headers['Set-Cookie'] = setCookie;
  return new Response(JSON.stringify(data), { status, headers });
}

export const onRequestOptions = async () => authCors();

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const db = context.env.DB;
  if (!db) return jsonResponse({ error: 'Database is not configured' }, 503);

  let body: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    wantsBeta?: boolean;
    phone?: string;
    createdByAdmin?: boolean;
  };
  try {
    body = (await context.request.json()) as typeof body;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const createdByAdmin = Boolean(body.createdByAdmin);
  const role = (body.role || 'member') as UserRole;
  const result = await registerUserRow(db, {
    name: String(body.name || ''),
    email: String(body.email || ''),
    password: String(body.password || ''),
    role,
    status: createdByAdmin ? 'active' : 'pending',
    wantsBeta: Boolean(body.wantsBeta),
    phone: body.phone,
  });

  if (!result.ok) {
    return jsonResponse({ error: result.error }, 400);
  }

  // Notify staff of pending public signups (best-effort).
  if (!createdByAdmin && context.env.RESEND_API_KEY) {
    const adminTo = context.env.ADMIN_NOTIFY_EMAIL || 'info@nonnegotiation.com';
    const origin = new URL(context.request.url).origin;
    const subject = `New signup pending approval: ${result.user.name}`;
    const html = buildAdminNewSignupHtml(
      result.user.name,
      result.user.email,
      result.user.wantsBeta,
      `${origin}/admin?tab=users`,
      result.user.phone,
    );
    void sendViaResend(context.env, { to: adminTo, subject, html }).then((sent) =>
      persistEmailSendLog(context.env, {
        id: sent.id,
        templateId: 'admin-new-signup',
        templateName: 'Admin alert — new signup',
        to: adminTo,
        subject,
        html: sent.html || html,
        ok: sent.ok,
        skipped: sent.skipped,
        error: sent.error,
      }),
    );
  }

  if (result.user.status === 'active') {
    const token = await createSession(db, result.user.id);
    const secure = requestWantsSecureCookie(context.request);
    return jsonWithCookie(
      {
        ok: true,
        user: result.user,
        sessionToken: token,
      },
      200,
      sessionCookieHeader(token, secure),
    );
  }

  return jsonResponse({
    ok: true,
    user: result.user,
    message: result.user.wantsBeta
      ? 'Your Free Member account is registered and Beta Test interest was noted. When your account is activated, you will get an email. You can sign in after that.'
      : 'Your account is registered. When your account is activated, you will get an email. You can sign in after that.',
  });
};
