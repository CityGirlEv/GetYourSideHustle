import {
  ANGELA_HARRIS_SEED_EMAIL,
  applyKnownSeedPasswords,
  BRAND_ADMIN_EMAIL,
  BRAND_ADMIN_PASSWORD,
  EVELYN_SEED_EMAIL,
  isAcceptedSeedPassword,
  STAFF_SEED_PASSWORD,
} from './seedAccounts';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'qa_tester';
  createdAt: string;
}

const STORAGE_USERS_KEY = 'myplan_admin_users_db';
const STORAGE_SESSION_KEY = 'myplan_admin_active_session';

const DEFAULT_ADMINS: (AdminUser & { passwordHash: string })[] = [
  {
    id: 'admin-001',
    name: 'Evelyn (Muntie Ev)',
    email: EVELYN_SEED_EMAIL,
    role: 'super_admin',
    createdAt: new Date().toISOString(),
    passwordHash: STAFF_SEED_PASSWORD,
  },
  {
    id: 'admin-002',
    name: 'Angela Harris',
    email: 'angela@myplannotmymood.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    passwordHash: STAFF_SEED_PASSWORD,
  },
  {
    id: 'admin-003',
    name: 'Evelyn (Nonnegotiation)',
    email: BRAND_ADMIN_EMAIL,
    role: 'super_admin',
    createdAt: new Date().toISOString(),
    passwordHash: BRAND_ADMIN_PASSWORD,
  },
  {
    id: 'admin-004',
    name: 'Angela Harris',
    email: ANGELA_HARRIS_SEED_EMAIL,
    role: 'admin',
    createdAt: new Date().toISOString(),
    passwordHash: STAFF_SEED_PASSWORD,
  },
];

export function mergeMissingSeedAdmins(
  existing: Array<AdminUser & { passwordHash: string }>,
  seeds: Array<AdminUser & { passwordHash: string }> = DEFAULT_ADMINS,
): Array<AdminUser & { passwordHash: string }> {
  const emails = new Set(existing.map((user) => user.email.toLowerCase()));
  const missing = seeds.filter((seed) => !emails.has(seed.email.toLowerCase()));
  return missing.length > 0 ? [...existing, ...missing] : existing;
}

export const getAdminUsers = (): (AdminUser & { passwordHash: string })[] => {
  if (typeof window === 'undefined') return DEFAULT_ADMINS;
  const data = localStorage.getItem(STORAGE_USERS_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ADMINS));
    return DEFAULT_ADMINS;
  }
  try {
    const parsed = JSON.parse(data);
    const list = Array.isArray(parsed) ? parsed : [];
    const merged = applyKnownSeedPasswords(mergeMissingSeedAdmins(list), DEFAULT_ADMINS);
    if (merged !== list) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ADMINS));
    return DEFAULT_ADMINS;
  }
};

export const getCurrentAdminSession = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const ADMIN_SELF_REGISTER_CLOSED = true;
export const ADMIN_SELF_REGISTER_ERROR =
  'Admin self-registration is closed. Testers should register from the storefront Sign In / Register. Staff already have accounts.';

export function updateAdminPasswordByEmail(email: string, newPassword: string): boolean {
  const users = getAdminUsers();
  const normalizedEmail =
    email.trim().toLowerCase() === 'angela@angelaharris.com' ? ANGELA_HARRIS_SEED_EMAIL : email.trim().toLowerCase();
  const index = users.findIndex((user) => user.email.toLowerCase() === normalizedEmail);
  if (index < 0 || !newPassword.trim()) return false;
  users[index] = { ...users[index], passwordHash: newPassword.trim() };
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  return true;
}

export const loginAdminUser = (email: string, passRaw: string): { success: boolean; user?: AdminUser; error?: string } => {
  const users = getAdminUsers();
  const normalizedEmail =
    email.trim().toLowerCase() === 'angela@angelaharris.com' ? ANGELA_HARRIS_SEED_EMAIL : email.trim().toLowerCase();
  const pass = passRaw.trim();

  const found = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!found) {
    return { success: false, error: 'No admin account found with this email address.' };
  }

  if (!isAcceptedSeedPassword(found.email, pass, found.passwordHash)) {
    return { success: false, error: 'Invalid password. Please check your credentials.' };
  }

  localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(found));
  return { success: true, user: found };
};

export const registerAdminUser = (name: string, email: string, pass: string): { success: boolean; user?: AdminUser; error?: string } => {
  if (ADMIN_SELF_REGISTER_CLOSED) {
    return { success: false, error: ADMIN_SELF_REGISTER_ERROR };
  }

  const users = getAdminUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'An admin account already exists with this email address.' };
  }

  const newUser = {
    id: `admin-${Date.now()}`,
    name: name.trim() || 'Admin User',
    email: normalizedEmail,
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
    passwordHash: pass,
  };

  const updatedUsers = [...users, newUser];
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedUsers));

  return { success: true, user: newUser };
};

export const logoutAdminUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
};
