import { jsonResponse } from '../../_shared/resend';
import { readSessionToken } from '../../_shared/passwords';
import {
  ensureSeedUsers,
  toPublicUser,
  userFromSessionToken,
  type D1Like,
} from '../../_shared/usersDb';

type Env = { DB?: D1Like };

function authCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export const onRequestOptions = async () => authCors();

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const db = context.env.DB;
  if (!db) return jsonResponse({ error: 'Database is not configured' }, 503);
  await ensureSeedUsers(db);
  const token = readSessionToken(context.request);
  const user = await userFromSessionToken(db, token);
  if (!user || user.status !== 'active') {
    return jsonResponse({ user: null });
  }
  return jsonResponse({ user: toPublicUser(user) });
};
