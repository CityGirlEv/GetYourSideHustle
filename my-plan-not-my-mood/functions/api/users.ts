import { jsonResponse } from '../_shared/resend';
import { readSessionToken } from '../_shared/passwords';
import {
  canManageUsers,
  deleteUserRow,
  importLocalUsers,
  isSuperAdminUser,
  listUsers,
  registerUserRow,
  updateUserRow,
  userFromSessionToken,
  type D1Like,
  type UserRole,
  type UserStatus,
} from '../_shared/usersDb';

type Env = { DB?: D1Like };

function cors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

async function requireManager(request: Request, db: D1Like) {
  const token = readSessionToken(request);
  const actor = await userFromSessionToken(db, token);
  if (!canManageUsers(actor)) return null;
  return actor;
}

export const onRequestOptions = async () => cors();

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const db = context.env.DB;
  if (!db) return jsonResponse({ error: 'Database is not configured' }, 503);
  const actor = await requireManager(context.request, db);
  if (!actor) return jsonResponse({ error: 'Admin access required.' }, 403);
  const users = await listUsers(db);
  return jsonResponse({ users });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const db = context.env.DB;
  if (!db) return jsonResponse({ error: 'Database is not configured' }, 503);
  const actor = await requireManager(context.request, db);
  if (!actor) return jsonResponse({ error: 'Admin access required.' }, 403);

  let body: Record<string, unknown>;
  try {
    body = (await context.request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (body.action === 'import' && Array.isArray(body.users)) {
    const result = await importLocalUsers(db, body.users as never[]);
    return jsonResponse({ ok: true, ...result });
  }

  const role = String(body.role || 'member') as UserRole;
  if (role === 'super_admin' && !isSuperAdminUser(actor)) {
    return jsonResponse({ error: 'Only Super Admin can grant Super Admin permissions.' }, 403);
  }

  const result = await registerUserRow(db, {
    name: String(body.name || ''),
    email: String(body.email || ''),
    password: String(body.password || ''),
    role,
    status: 'active',
    wantsBeta: Boolean(body.wantsBeta),
    phone: String(body.phone || ''),
  });
  if (!result.ok) return jsonResponse({ error: result.error }, 400);
  return jsonResponse({ ok: true, user: result.user });
};

export const onRequestPut = async (context: { request: Request; env: Env }) => {
  const db = context.env.DB;
  if (!db) return jsonResponse({ error: 'Database is not configured' }, 503);
  const actor = await requireManager(context.request, db);
  if (!actor) return jsonResponse({ error: 'Admin access required.' }, 403);

  let body: {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    roles?: UserRole[];
    status?: UserStatus;
    wantsBeta?: boolean;
    phone?: string;
  };
  try {
    body = (await context.request.json()) as typeof body;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const id = String(body.id || '').trim();
  if (!id) return jsonResponse({ error: 'User id is required.' }, 400);

  const users = await listUsers(db);
  const target = users.find((u) => u.id === id);
  if (!target) return jsonResponse({ error: 'User account not found' }, 404);

  if (isSuperAdminUser(target) && !isSuperAdminUser(actor)) {
    return jsonResponse({ error: 'Super Admin profiles can only be changed by a Super Admin.' }, 403);
  }
  if (
    (body.role === 'super_admin' || body.roles?.includes('super_admin')) &&
    !isSuperAdminUser(actor)
  ) {
    return jsonResponse({ error: 'Only Super Admin can grant Super Admin permissions.' }, 403);
  }

  const result = await updateUserRow(db, id, {
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role,
    roles: body.roles,
    status: body.status,
    wantsBeta: body.wantsBeta,
    phone: body.phone,
  });
  if (!result.ok) return jsonResponse({ error: result.error }, 400);
  return jsonResponse({ ok: true, user: result.user });
};

export const onRequestDelete = async (context: { request: Request; env: Env }) => {
  const db = context.env.DB;
  if (!db) return jsonResponse({ error: 'Database is not configured' }, 503);
  const actor = await requireManager(context.request, db);
  if (!actor) return jsonResponse({ error: 'Admin access required.' }, 403);

  let body: { id?: string };
  try {
    body = (await context.request.json()) as { id?: string };
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }
  const id = String(body.id || '').trim();
  if (!id) return jsonResponse({ error: 'User id is required.' }, 400);

  const users = await listUsers(db);
  const target = users.find((u) => u.id === id);
  if (!target) return jsonResponse({ error: 'User not found' }, 404);
  if (isSuperAdminUser(target) && !isSuperAdminUser(actor)) {
    return jsonResponse({ error: 'Super Admin accounts can only be deleted by a Super Admin.' }, 403);
  }

  await deleteUserRow(db, id);
  return jsonResponse({ ok: true });
};
