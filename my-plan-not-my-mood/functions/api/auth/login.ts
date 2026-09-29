import { jsonResponse } from '../../_shared/resend';
import {
  clearSessionCookieHeader,
  readSessionToken,
  requestWantsSecureCookie,
  SESSION_COOKIE,
  sessionCookieHeader,
} from '../../_shared/passwords';
import {
  createSession,
  deleteSession,
  ensureSeedUsers,
  getUserByEmail,
  passwordMatches,
  toPublicUser,
  type D1Like,
} from '../../_shared/usersDb';

type Env = { DB?: D1Like };

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

  let body: { email?: string; password?: string };
  try {
    body = (await context.request.json()) as { email?: string; password?: string };
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  await ensureSeedUsers(db);
  const email = String(body.email || '');
  const password = String(body.password || '');
  const found = await getUserByEmail(db, email);
  if (!found) {
    return jsonResponse({ error: 'No account found with this email address.' }, 401);
  }
  if (!(await passwordMatches(found, password))) {
    return jsonResponse({ error: 'Invalid password. Please check your credentials.' }, 401);
  }
  if (found.status === 'pending') {
    return jsonResponse(
      {
        error:
          'Account Pending Activation: You will get an email when your account is activated. You can sign in after that.',
      },
      403,
    );
  }
  if (found.status === 'inactive') {
    return jsonResponse(
      { error: 'Account Inactive: Your account has been deactivated by an administrator.' },
      403,
    );
  }

  const token = await createSession(db, found.id);
  const secure = requestWantsSecureCookie(context.request);
  return jsonWithCookie(
    { ok: true, user: toPublicUser(found), sessionToken: token },
    200,
    sessionCookieHeader(token, secure),
  );
};
