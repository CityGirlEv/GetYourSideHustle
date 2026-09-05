import { jsonResponse } from '../../_shared/resend';
import { getEmailSendLogEntry, listEmailSendLog, type EmailLogEnv } from '../../_shared/emailSendLog';

function logCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export const onRequestOptions = async () => logCors();

export const onRequestGet = async (context: { request: Request; env: EmailLogEnv }) => {
  const id = new URL(context.request.url).searchParams.get('id')?.trim() || '';
  if (id) {
    const entry = await getEmailSendLogEntry(context.env, id);
    if (!entry) return jsonResponse({ error: 'Send log entry not found' }, 404);
    return jsonResponse({ ok: true, entry });
  }

  const entries = await listEmailSendLog(context.env);
  return jsonResponse({ ok: true, entries });
};

export const onRequest = async (context: { request: Request; env: EmailLogEnv }) => {
  const method = context.request.method.toUpperCase();
  if (method === 'OPTIONS') return logCors();
  if (method === 'GET') return onRequestGet(context);
  return jsonResponse({ error: 'Method not allowed' }, 405);
};
