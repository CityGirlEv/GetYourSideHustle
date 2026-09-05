export const BRAND_ADMIN_EMAIL = 'nonnegotiation@gmail.com';
export const BRAND_ADMIN_PASSWORD = 'Kiva#3232';

export const EVELYN_SEED_EMAIL = 'evelyn3@cox.net';
export const ANGELA_HARRIS_SEED_EMAIL = 'angela@angelasharris.com';
export const STAFF_SEED_PASSWORD = 'Admin123';
export const LEGACY_STAFF_PASSWORDS = ['Temp#123', 'myplan2026'] as const;

const STAFF_LOGIN_EMAILS = new Set([
  EVELYN_SEED_EMAIL,
  ANGELA_HARRIS_SEED_EMAIL,
  'angela@angelaharris.com',
  'angela@myplannotmymood.com',
]);

/** Stored hash always wins; staff emails also accept Admin123 plus the older demo passwords. */
export function isAcceptedSeedPassword(email: string, pass: string, storedHash?: string): boolean {
  const trimmed = pass.trim();
  if (storedHash !== undefined && trimmed === storedHash) return true;
  const normalized = email.trim().toLowerCase();
  if (!STAFF_LOGIN_EMAILS.has(normalized)) return false;
  return trimmed === STAFF_SEED_PASSWORD || LEGACY_STAFF_PASSWORDS.some((legacy) => legacy === trimmed);
}

export function applyKnownSeedPasswords<T extends { email: string; passwordHash: string }>(
  users: T[],
  seeds: Array<{ email: string; passwordHash: string }>,
): T[] {
  const wanted = new Map(seeds.map((seed) => [seed.email.toLowerCase(), seed.passwordHash]));
  let dirty = false;
  const next = users.map((user) => {
    const pass = wanted.get(user.email.toLowerCase());
    if (!pass || user.passwordHash === pass) return user;
    dirty = true;
    return { ...user, passwordHash: pass };
  });
  return dirty ? next : users;
}
