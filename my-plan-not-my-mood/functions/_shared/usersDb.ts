/**
 * D1 user directory for My Plan, Not My Mood.
 * Seed passwords match src/lib/seedAccounts.ts (hashed on ensureSeeds).
 */

import {
  ANGELA_HARRIS_SEED_EMAIL,
  BRAND_ADMIN_EMAIL,
  BRAND_ADMIN_PASSWORD,
  EVELYN_SEED_EMAIL,
  LEGACY_STAFF_PASSWORDS,
  STAFF_SEED_PASSWORD,
} from '../../src/lib/seedAccounts';
import { storePhoneNumber, phoneSignupError } from '../../src/lib/phoneNumber';
import {
  createSalt,
  createToken,
  hashPassword,
  SESSION_DAYS,
  verifyPassword,
} from './passwords';

function canonicalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (normalized === 'candicejackson1@icloud.com') return 'candacejackson1@icloud.com';
  if (normalized === 'angela@angelaharris.com') return ANGELA_HARRIS_SEED_EMAIL;
  return normalized;
}

export type UserRole = 'super_admin' | 'admin' | 'dev' | 'qa' | 'member';
export type UserStatus = 'active' | 'pending' | 'inactive';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  status: UserStatus;
  wantsBeta: boolean;
  phone: string;
  createdAt: string;
};

export type DbUser = PublicUser & {
  passwordHash: string;
  passwordSalt: string;
};

export type D1Like = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      first: <T>() => Promise<T | null>;
      run: () => Promise<unknown>;
      all: <T>() => Promise<{ results?: T[] }>;
    };
    first: <T>() => Promise<T | null>;
    run: () => Promise<unknown>;
    all: <T>() => Promise<{ results?: T[] }>;
  };
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  password_salt: string;
  role: string;
  roles_json: string;
  status: string;
  wants_beta: number;
  phone: string;
  created_at: string;
  updated_at: string;
};

const ALL_ROLES: UserRole[] = ['super_admin', 'admin', 'dev', 'qa', 'member'];

const SEED_USERS: Array<{
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roles: UserRole[];
  password: string;
  wantsBeta: boolean;
}> = [
  {
    id: 'user-001',
    name: 'Evelyn (Muntie Ev)',
    email: EVELYN_SEED_EMAIL,
    role: 'super_admin',
    roles: ['super_admin', 'dev'],
    password: STAFF_SEED_PASSWORD,
    wantsBeta: false,
  },
  {
    id: 'user-002',
    name: 'Angela Harris',
    email: 'angela@myplannotmymood.com',
    role: 'admin',
    roles: ['admin'],
    password: STAFF_SEED_PASSWORD,
    wantsBeta: false,
  },
  {
    id: 'user-003',
    name: 'Dev Lead (Muntie AI)',
    email: 'dev@muntiesaiagents.com',
    role: 'dev',
    roles: ['dev', 'qa'],
    password: 'devpass123',
    wantsBeta: false,
  },
  {
    id: 'user-004',
    name: 'QA Tester Tina',
    email: 'qa.tina@myplannotmymood.com',
    role: 'qa',
    roles: ['qa', 'member'],
    password: 'qapass123',
    wantsBeta: true,
  },
  {
    id: 'user-005',
    name: 'Community Member Sarah',
    email: 'sarah@example.com',
    role: 'member',
    roles: ['member'],
    password: 'member123',
    wantsBeta: false,
  },
  {
    id: 'user-006',
    name: 'Evelyn (Nonnegotiation)',
    email: BRAND_ADMIN_EMAIL,
    role: 'super_admin',
    roles: ['super_admin', 'dev'],
    password: BRAND_ADMIN_PASSWORD,
    wantsBeta: false,
  },
  {
    id: 'user-007',
    name: 'Candace Jackson',
    email: 'candacejackson1@icloud.com',
    role: 'qa',
    roles: ['qa'],
    password: 'Candace123',
    wantsBeta: true,
  },
  {
    id: 'user-008',
    name: 'Angela Harris',
    email: ANGELA_HARRIS_SEED_EMAIL,
    role: 'admin',
    roles: ['admin'],
    password: STAFF_SEED_PASSWORD,
    wantsBeta: false,
  },
  {
    id: 'user-009',
    name: 'Narissa Briana',
    email: 'narissabriana@yahoo.com',
    role: 'member',
    roles: ['member'],
    password: 'Member123',
    wantsBeta: false,
  },
];

const STAFF_EMAILS = new Set(
  [
    EVELYN_SEED_EMAIL,
    ANGELA_HARRIS_SEED_EMAIL,
    'angela@angelaharris.com',
    'angela@myplannotmymood.com',
    BRAND_ADMIN_EMAIL,
  ].map((e) => e.toLowerCase()),
);

function parseRoles(raw: string, fallback: string): UserRole[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const roles = parsed.filter((r): r is UserRole => ALL_ROLES.includes(r));
      if (roles.length) return roles;
    }
  } catch {
    /* fall through */
  }
  return ALL_ROLES.includes(fallback as UserRole) ? [fallback as UserRole] : ['member'];
}

export function mapUserRow(row: UserRow): DbUser {
  const roles = parseRoles(row.roles_json, row.role);
  return {
    id: row.id,
    name: row.name,
    email: canonicalizeEmail(row.email),
    role: (ALL_ROLES.includes(row.role as UserRole) ? row.role : roles[0]) as UserRole,
    roles,
    status: (['active', 'pending', 'inactive'].includes(row.status)
      ? row.status
      : 'pending') as UserStatus,
    wantsBeta: Boolean(row.wants_beta),
    phone: row.phone || '',
    createdAt: row.created_at,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
  };
}

export function toPublicUser(user: DbUser): PublicUser {
  const { passwordHash: _h, passwordSalt: _s, ...rest } = user;
  return rest;
}

export async function ensureUserTables(db: D1Like): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        roles_json TEXT NOT NULL DEFAULT '["member"]',
        status TEXT NOT NULL DEFAULT 'pending',
        wants_beta INTEGER NOT NULL DEFAULT 0,
        phone TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
}

let seedsEnsured = false;

export async function ensureSeedUsers(db: D1Like): Promise<void> {
  if (seedsEnsured) return;
  await ensureUserTables(db);
  const now = new Date().toISOString();
  for (const seed of SEED_USERS) {
    const email = canonicalizeEmail(seed.email);
    const existing = await db
      .prepare(`SELECT id FROM users WHERE email = ?`)
      .bind(email)
      .first<{ id: string }>();
    if (existing) continue;
    const salt = await createSalt();
    const hash = await hashPassword(seed.password, salt);
    await db
      .prepare(
        `INSERT INTO users (
          id, name, email, password_hash, password_salt, role, roles_json,
          status, wants_beta, phone, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, '', ?, ?)`,
      )
      .bind(
        seed.id,
        seed.name,
        email,
        hash,
        salt,
        seed.role,
        JSON.stringify(seed.roles),
        seed.wantsBeta ? 1 : 0,
        now,
        now,
      )
      .run();
  }
  seedsEnsured = true;
}

export async function listUsers(db: D1Like): Promise<PublicUser[]> {
  await ensureSeedUsers(db);
  const { results } = await db
    .prepare(`SELECT * FROM users ORDER BY created_at ASC`)
    .all<UserRow>();
  return (results ?? []).map((row) => toPublicUser(mapUserRow(row)));
}

export async function getUserByEmail(db: D1Like, email: string): Promise<DbUser | null> {
  await ensureSeedUsers(db);
  const row = await db
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .bind(canonicalizeEmail(email))
    .first<UserRow>();
  return row ? mapUserRow(row) : null;
}

export async function getUserById(db: D1Like, id: string): Promise<DbUser | null> {
  await ensureSeedUsers(db);
  const row = await db.prepare(`SELECT * FROM users WHERE id = ?`).bind(id).first<UserRow>();
  return row ? mapUserRow(row) : null;
}

export async function passwordMatches(user: DbUser, password: string): Promise<boolean> {
  const pass = password.trim();
  if (await verifyPassword(pass, user.passwordSalt, user.passwordHash)) return true;
  if (STAFF_EMAILS.has(canonicalizeEmail(user.email))) {
    if (pass === STAFF_SEED_PASSWORD || LEGACY_STAFF_PASSWORDS.some((p) => p === pass)) {
      return true;
    }
  }
  return false;
}

export async function createSession(db: D1Like, userId: string): Promise<string> {
  const token = createToken();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db
    .prepare(
      `INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
    )
    .bind(token, userId, expires.toISOString(), now.toISOString())
    .run();
  return token;
}

export async function deleteSession(db: D1Like, token: string): Promise<void> {
  if (!token) return;
  await db.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run();
}

export async function userFromSessionToken(db: D1Like, token: string): Promise<DbUser | null> {
  if (!token) return null;
  await ensureSeedUsers(db);
  const row = await db
    .prepare(
      `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .bind(token, new Date().toISOString())
    .first<UserRow>();
  return row ? mapUserRow(row) : null;
}

export async function registerUserRow(
  db: D1Like,
  input: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    status?: UserStatus;
    wantsBeta?: boolean;
    phone?: string;
  },
): Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }> {
  await ensureSeedUsers(db);
  const phoneError = phoneSignupError(input.phone);
  if (phoneError) return { ok: false, error: phoneError };

  const email = canonicalizeEmail(input.email);
  if (!email.includes('@')) return { ok: false, error: 'A valid email is required.' };
  if (!String(input.password || '').trim()) {
    return { ok: false, error: 'Password is required.' };
  }

  const existing = await getUserByEmail(db, email);
  if (existing) {
    return {
      ok: false,
      error: 'An account already exists for this email. Sign in instead of creating a new one.',
    };
  }

  const role: UserRole = input.role && ALL_ROLES.includes(input.role) ? input.role : 'member';
  const status: UserStatus = input.status ?? 'pending';
  const salt = await createSalt();
  const hash = await hashPassword(input.password.trim(), salt);
  const now = new Date().toISOString();
  const id = `user-${crypto.randomUUID()}`;
  const phone = storePhoneNumber(input.phone ?? '');

  await db
    .prepare(
      `INSERT INTO users (
        id, name, email, password_hash, password_salt, role, roles_json,
        status, wants_beta, phone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      String(input.name || '').trim() || 'Community Member',
      email,
      hash,
      salt,
      role,
      JSON.stringify([role]),
      status,
      input.wantsBeta ? 1 : 0,
      phone,
      now,
      now,
    )
    .run();

  const user = await getUserById(db, id);
  if (!user) return { ok: false, error: 'Failed to create account.' };
  return { ok: true, user: toPublicUser(user) };
}

export async function updateUserRow(
  db: D1Like,
  userId: string,
  updates: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    roles?: UserRole[];
    status?: UserStatus;
    wantsBeta?: boolean;
    phone?: string;
  },
): Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }> {
  const existing = await getUserById(db, userId);
  if (!existing) return { ok: false, error: 'User account not found' };

  let name = existing.name;
  let email = existing.email;
  let role = existing.role;
  let roles = [...existing.roles];
  let status = existing.status;
  let wantsBeta = existing.wantsBeta;
  let phone = existing.phone;
  let passwordHash = existing.passwordHash;
  let passwordSalt = existing.passwordSalt;

  if (updates.name?.trim()) name = updates.name.trim();
  if (updates.email) {
    const nextEmail = canonicalizeEmail(updates.email);
    if (nextEmail !== existing.email) {
      const clash = await getUserByEmail(db, nextEmail);
      if (clash && clash.id !== userId) {
        return { ok: false, error: 'Email address is already in use by another user' };
      }
      email = nextEmail;
    }
  }
  if (updates.password?.trim()) {
    passwordSalt = await createSalt();
    passwordHash = await hashPassword(updates.password.trim(), passwordSalt);
  }
  if (updates.role && ALL_ROLES.includes(updates.role)) {
    role = updates.role;
    if (!roles.includes(role)) roles = [...roles, role];
  }
  if (updates.roles && Array.isArray(updates.roles)) {
    roles = updates.roles.filter((r) => ALL_ROLES.includes(r));
    if (roles.length === 0) return { ok: false, error: 'At least one role is required.' };
    if (!roles.includes(role)) role = roles[0]!;
  }
  if (updates.status) status = updates.status;
  if (typeof updates.wantsBeta === 'boolean') wantsBeta = updates.wantsBeta;
  if (typeof updates.phone === 'string') {
    const phoneError = phoneSignupError(updates.phone);
    if (phoneError) return { ok: false, error: phoneError };
    phone = storePhoneNumber(updates.phone);
  }

  const now = new Date().toISOString();
  await db
    .prepare(
      `UPDATE users SET
        name = ?, email = ?, password_hash = ?, password_salt = ?,
        role = ?, roles_json = ?, status = ?, wants_beta = ?, phone = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      name,
      email,
      passwordHash,
      passwordSalt,
      role,
      JSON.stringify(roles),
      status,
      wantsBeta ? 1 : 0,
      phone,
      now,
      userId,
    )
    .run();

  const user = await getUserById(db, userId);
  if (!user) return { ok: false, error: 'User account not found' };
  return { ok: true, user: toPublicUser(user) };
}

export async function deleteUserRow(db: D1Like, userId: string): Promise<boolean> {
  await db.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(userId).run();
  await db.prepare(`DELETE FROM password_reset_tokens WHERE user_id = ?`).bind(userId).run();
  await db.prepare(`DELETE FROM users WHERE id = ?`).bind(userId).run();
  return true;
}

export async function createPasswordReset(
  db: D1Like,
  user: DbUser,
): Promise<{ token: string; expiresAt: string }> {
  const token = createToken();
  const now = new Date();
  const expires = new Date(now.getTime() + 60 * 60 * 1000);
  await db
    .prepare(`DELETE FROM password_reset_tokens WHERE user_id = ?`)
    .bind(user.id)
    .run();
  await db
    .prepare(
      `INSERT INTO password_reset_tokens (token, user_id, email, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(token, user.id, user.email, expires.toISOString(), now.toISOString())
    .run();
  return { token, expiresAt: expires.toISOString() };
}

export async function consumePasswordReset(
  db: D1Like,
  token: string,
  newPassword: string,
): Promise<{ ok: true; user: PublicUser } | { ok: false; error: string }> {
  const row = await db
    .prepare(
      `SELECT token, user_id, email, expires_at FROM password_reset_tokens WHERE token = ?`,
    )
    .bind(token)
    .first<{ token: string; user_id: string; email: string; expires_at: string }>();
  if (!row || row.expires_at <= new Date().toISOString()) {
    return {
      ok: false,
      error: 'This reset link is invalid or has expired. Request a new one.',
    };
  }
  if (!newPassword.trim() || newPassword.trim().length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }
  const updated = await updateUserRow(db, row.user_id, { password: newPassword.trim() });
  await db.prepare(`DELETE FROM password_reset_tokens WHERE token = ?`).bind(token).run();
  return updated;
}

export async function importLocalUsers(
  db: D1Like,
  users: Array<{
    id?: string;
    name?: string;
    email?: string;
    passwordHash?: string;
    role?: string;
    roles?: string[];
    status?: string;
    wantsBeta?: boolean;
    phone?: string;
    createdAt?: string;
  }>,
): Promise<{ imported: number; skipped: number }> {
  await ensureSeedUsers(db);
  let imported = 0;
  let skipped = 0;
  for (const raw of users) {
    const email = canonicalizeEmail(String(raw.email || ''));
    if (!email.includes('@')) {
      skipped += 1;
      continue;
    }
    const existing = await getUserByEmail(db, email);
    if (existing) {
      skipped += 1;
      continue;
    }
    const phone = String(raw.phone || '').trim();
    // Skip phone validation for imports that lack phone; store empty and flag pending staff fix
    const role = (ALL_ROLES.includes(raw.role as UserRole) ? raw.role : 'member') as UserRole;
    const roles = Array.isArray(raw.roles)
      ? raw.roles.filter((r): r is UserRole => ALL_ROLES.includes(r as UserRole))
      : [role];
    const now = new Date().toISOString();
    const id = String(raw.id || '').trim() || `user-${crypto.randomUUID()}`;
    const plain = String(raw.passwordHash || '').trim() || createToken().slice(0, 12);
    await db
      .prepare(
        `INSERT INTO users (
          id, name, email, password_hash, password_salt, role, roles_json,
          status, wants_beta, phone, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'plain', ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        String(raw.name || '').trim() || 'Community Member',
        email,
        plain,
        role,
        JSON.stringify(roles.length ? roles : [role]),
        ['active', 'pending', 'inactive'].includes(String(raw.status))
          ? String(raw.status)
          : 'pending',
        raw.wantsBeta ? 1 : 0,
        phone ? storePhoneNumber(phone) : '',
        raw.createdAt || now,
        now,
      )
      .run();
    imported += 1;
  }
  return { imported, skipped };
}

export function isAdminActor(user: PublicUser | DbUser | null | undefined): boolean {
  if (!user || user.status !== 'active') return false;
  return user.roles.some((r) => r === 'super_admin' || r === 'admin' || r === 'dev' || r === 'qa')
    || ['super_admin', 'admin', 'dev', 'qa'].includes(user.role);
}

export function canManageUsers(user: PublicUser | DbUser | null | undefined): boolean {
  if (!user || user.status !== 'active') return false;
  return user.roles.includes('super_admin') || user.roles.includes('admin');
}

export function isSuperAdminUser(user: PublicUser | DbUser | null | undefined): boolean {
  if (!user) return false;
  return user.roles.includes('super_admin') || user.role === 'super_admin';
}
