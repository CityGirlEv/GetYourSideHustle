import { deleteSession, type D1Like } from '../../_shared/usersDb';
import {
  clearSessionCookieHeader,
  readSessionToken,
  requestWantsSecureCookie,
} from '../../_shared/passwords';

type Env = { DB?: D1Like };

function authCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export const onRequestOptions = async () => authCors();

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const db = context.env.DB;
  const token = readSessionToken(context.request);
  if (db && token) await deleteSession(db, token);
  const secure = requestWantsSecureCookie(context.request);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Set-Cookie': clearSessionCookieHeader(secure),
    },
  });
};
