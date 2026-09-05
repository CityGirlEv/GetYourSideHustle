import {
  ANGELA_HARRIS_SEED_EMAIL,
  applyKnownSeedPasswords,
  BRAND_ADMIN_EMAIL,
  BRAND_ADMIN_PASSWORD,
  EVELYN_SEED_EMAIL,
  isAcceptedSeedPassword,
  STAFF_SEED_PASSWORD,
} from './seedAccounts';
import { auditActorFromUser, recordUserAudit } from './userAuditLog';
import { phoneSignupError, storePhoneNumber } from './phoneNumber';

export type UserRole = 'super_admin' | 'admin' | 'dev' | 'qa' | 'member';
export type UserStatus = 'active' | 'pending' | 'inactive';

/** Canonical role list — Super Admin and Admin are separate privileged roles. */
export const ALL_USER_ROLES: UserRole[] = ['super_admin', 'admin', 'dev', 'qa', 'member'];

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  dev: 'Developer',
  qa: 'QA Tester',
  member: 'Member',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full executive access including Proposal & Pricing and Super Admin assignment',
  admin: 'Implementation Plan, Financials, interactive budget, PDF downloads, Testing Portal, and Task List',
  dev: 'Task & IP portal access',
  qa: 'Testing matrix access',
  member: 'Storefront customer',
};

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole; // primary role
  roles: UserRole[]; // multi-role list
  status: UserStatus; // active | pending | inactive
  wantsBeta: boolean; // applied as a Beta Tester from Free Member signup
  phone: string; // required on signup so staff can call
  createdAt: string;
}

export const STORAGE_USERS_KEY = 'myplan_app_users_db_v2';
const STORAGE_SESSION_KEY = 'myplan_app_active_session_v2';
const STORAGE_SEED_REV_KEY = 'myplan_app_users_seed_rev';
const USER_SEED_REVISION = 8;

/** True in Vitest — keep in-memory/localStorage store for unit tests. */
export function useLocalUserStore(): boolean {
  try {
    // Vitest sets MODE=test; production Vite builds never hit this path as test.
    const meta = import.meta as ImportMeta & { env?: { MODE?: string; VITEST?: boolean } };
    return Boolean(meta.env?.MODE === 'test' || meta.env?.VITEST);
  } catch {
    return false;
  }
}

let remoteSession: AppUser | null = null;
let remoteUsersCache: AppUser[] = [];

export function setRemoteSession(user: AppUser | null): void {
  remoteSession = user;
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_SESSION_KEY);
}

export function setRemoteUsersCache(users: AppUser[]): void {
  remoteUsersCache = users;
}

function isAdminActor(user: AppUser | null | undefined): boolean {
  if (!user) return false;
  return (
    user.role === 'admin' ||
    user.role === 'super_admin' ||
    Boolean(user.roles?.includes('admin') || user.roles?.includes('super_admin'))
  );
}

function readLocalUsersDump(): unknown[] {
  if (typeof window === 'undefined') return [];
  const keys = [STORAGE_USERS_KEY, 'myplan_app_users_db', 'myplan_app_users_db_v1'];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      /* try next */
    }
  }
  return [];
}

function clearLocalUsersDump(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_USERS_KEY);
  localStorage.removeItem('myplan_app_users_db');
  localStorage.removeItem('myplan_app_users_db_v1');
}

/** True when this browser still has a leftover local user directory to push into D1. */
export function hasLocalUsersToImport(): boolean {
  return readLocalUsersDump().length > 0;
}

/**
 * Push leftover browser localStorage users into shared D1 (admin session required).
 * New signups must use registerUserAsync — this only migrates old local rows.
 */
export async function importBrowserUsersToD1(): Promise<{
  imported: number;
  skipped: number;
  error?: string;
}> {
  if (useLocalUserStore()) return { imported: 0, skipped: 0 };
  const dump = readLocalUsersDump();
  if (dump.length === 0) return { imported: 0, skipped: 0 };
  const { apiImportLocalUsers } = await import('./usersApi');
  const res = await apiImportLocalUsers(dump);
  if (res.error) return { imported: 0, skipped: 0, error: res.error };
  clearLocalUsersDump();
  try {
    await refreshRemoteUsers();
  } catch {
    /* list may still succeed later */
  }
  return { imported: res.imported, skipped: res.skipped };
}

export async function hydrateAuthFromServer(): Promise<AppUser | null> {
  if (useLocalUserStore()) return getCurrentUserSession();
  const { apiMe, apiListUsers, getStoredSessionToken } = await import('./usersApi');
  const me = await apiMe();
  if (!me) {
    // Do not keep a stale “signed in” UI when the shared session is gone.
    if (!getStoredSessionToken()) setRemoteSession(null);
    else setRemoteSession(null);
    remoteUsersCache = [];
    return null;
  }
  setRemoteSession(me);
  if (isAdminActor(me)) {
    const importResult = await importBrowserUsersToD1();
    try {
      remoteUsersCache = await apiListUsers();
    } catch (err) {
      remoteUsersCache = [me];
      console.warn('[nmp-auth] Failed to load shared users list', err, importResult);
    }
  } else {
    remoteUsersCache = [me];
  }
  return me;
}

export async function refreshRemoteUsers(): Promise<AppUser[]> {
  if (useLocalUserStore()) return getAppUsers().map(({ passwordHash: _, ...u }) => u);
  const { apiListUsers } = await import('./usersApi');
  remoteUsersCache = await apiListUsers();
  return remoteUsersCache;
}

/** NMP user directory is this site only — never GYSH D1 (`gysh-db`). */
export const NMP_USER_DIRECTORY_LABEL = 'Shared D1 (my-plan-agenda)';
export const NMP_USER_DIRECTORY_NOTE =
  'Signups and password changes save to the shared My Plan database (my-plan-agenda), not this browser. Get Your Side Hustle keeps accounts in a separate database (gysh-db).';
export const GYSH_USER_DATABASE_NAME = 'gysh-db';
export const NMP_D1_DATABASE_NAME = 'my-plan-agenda';

const INITIAL_SEED_USERS: (AppUser & { passwordHash: string })[] = [
  {
    id: 'user-001',
    name: 'Evelyn (Muntie Ev)',
    email: EVELYN_SEED_EMAIL,
    role: 'super_admin',
    roles: ['super_admin', 'dev'],
    status: 'active',
    wantsBeta: false,
    phone: '',
    createdAt: new Date().toISOString(),
    passwordHash: STAFF_SEED_PASSWORD,
  },
  {
    id: 'user-002',
    name: 'Angela Harris',
    email: 'angela@myplannotmymood.com',
    role: 'admin',
    roles: ['admin'],
    status: 'active',
    wantsBeta: false,
    phone: '',
    createdAt: new Date().toISOString(),
    passwordHash: STAFF_SEED_PASSWORD,
  },
  {
    id: 'user-003',
    name: 'Dev Lead (Muntie AI)',
    email: 'dev@muntiesaiagents.com',
    role: 'dev',
    roles: ['dev', 'qa'],
    status: 'active',
    wantsBeta: false,
    phone: '',
    createdAt: new Date().toISOString(),
    passwordHash: 'devpass123',
  },
  {
    id: 'user-004',
    name: 'QA Tester Tina',
    email: 'qa.tina@myplannotmymood.com',
    role: 'qa',
    roles: ['qa', 'member'],
    status: 'active',
    wantsBeta: true,
    phone: '',
    createdAt: new Date().toISOString(),
    passwordHash: 'qapass123',
  },
  {
    id: 'user-005',
    name: 'Community Member Sarah',
    email: 'sarah@example.com',
    role: 'member',
    roles: ['member'],
    status: 'active',
    wantsBeta: false,
    phone: '',
    createdAt: new Date().toISOString(),
    passwordHash: 'member123',
  },
  {
    id: 'user-006',
    name: 'Evelyn (Nonnegotiation)',
    email: BRAND_ADMIN_EMAIL,
    role: 'super_admin',
    roles: ['super_admin', 'dev'],
    status: 'active',
    wantsBeta: false,
    phone: '',
    createdAt: new Date().toISOString(),
    passwordHash: BRAND_ADMIN_PASSWORD,
  },
  {
    id: 'user-007',
    name: 'Candace Jackson',
    email: 'candacejackson1@icloud.com',
    role: 'qa',
    roles: ['qa'],
    status: 'active',
    wantsBeta: true,
    phone: '',
    createdAt: new Date().toISOString(),
    passwordHash: 'Candace123',
  },
  {
    id: 'user-008',
    name: 'Angela Harris',
    email: ANGELA_HARRIS_SEED_EMAIL,
    role: 'admin',
    roles: ['admin'],
    status: 'active',
    wantsBeta: false,
    phone: '',
    createdAt: new Date().toISOString(),
    passwordHash: STAFF_SEED_PASSWORD,
  },
  {
    id: 'user-009',
    name: 'Narissa Briana',
    email: 'narissabriana@yahoo.com',
    role: 'member',
    roles: ['member'],
    status: 'active',
    wantsBeta: false,
    phone: '',
    createdAt: new Date().toISOString(),
    passwordHash: 'Member123',
  },
];

export function mergeMissingSeedUsers(
  existing: Array<AppUser & { passwordHash: string }>,
  seeds: Array<AppUser & { passwordHash: string }> = INITIAL_SEED_USERS,
): Array<AppUser & { passwordHash: string }> {
  const emails = new Set(existing.map((user) => canonicalizeEmail(user.email)));
  const missing = seeds.filter((seed) => !emails.has(canonicalizeEmail(seed.email)));
  return missing.length > 0 ? [...existing, ...missing] : existing;
}

const STATUS_RANK: Record<string, number> = { pending: 0, inactive: 1, active: 2 };

/** Keep one row per email (Candice/Candace) and prefer the active copy. */
export function dedupeUsersByCanonicalEmail<T extends { email: string; status?: string }>(users: T[]): T[] {
  const byEmail = new Map<string, T>();
  for (const user of users) {
    const key = canonicalizeEmail(user.email);
    const current = byEmail.get(key);
    if (!current || (STATUS_RANK[user.status ?? ''] ?? 0) > (STATUS_RANK[current.status ?? ''] ?? 0)) {
      byEmail.set(key, { ...user, email: key });
    }
  }
  return [...byEmail.values()];
}

/** Seeded staff who signed up as pending still get in once the seed is active. */
export function activatePendingKnownSeeds<T extends { email: string; status: UserStatus }>(
  users: T[],
  seeds: Array<{ email: string; status: UserStatus }> = INITIAL_SEED_USERS,
): T[] {
  const activeSeeds = new Set(
    seeds.filter((seed) => seed.status === 'active').map((seed) => canonicalizeEmail(seed.email)),
  );
  let dirty = false;
  const next = users.map((user) => {
    if (user.status !== 'pending' || !activeSeeds.has(canonicalizeEmail(user.email))) return user;
    dirty = true;
    return { ...user, status: 'active' as UserStatus };
  });
  return dirty ? next : users;
}

export type UserOrRoleInput = { role?: UserRole | string; roles?: UserRole[]; status?: UserStatus | string } | UserRole | string | null | undefined;

/** Resolve the full role list for a user or role string. */
export function resolveRoles(userOrRole?: UserOrRoleInput): UserRole[] {
  if (!userOrRole) return [];
  if (typeof userOrRole === 'string') {
    return ALL_USER_ROLES.includes(userOrRole as UserRole) ? [userOrRole as UserRole] : [];
  }
  if (userOrRole.roles && userOrRole.roles.length > 0) return userOrRole.roles as UserRole[];
  return userOrRole.role && ALL_USER_ROLES.includes(userOrRole.role as UserRole) ? [userOrRole.role as UserRole] : [];
}

export function hasRole(
  userOrRole: UserOrRoleInput,
  role: UserRole,
): boolean {
  return resolveRoles(userOrRole).includes(role);
}

/** Super Admin only — distinct from Admin. */
export function isSuperAdmin(userOrRole?: UserOrRoleInput): boolean {
  return hasRole(userOrRole, 'super_admin');
}

/** Admin role only — does NOT include Super Admin. */
export function isAdminRole(userOrRole?: UserOrRoleInput): boolean {
  return hasRole(userOrRole, 'admin');
}

export const ACCOUNT_EXISTS_SIGN_IN_ERROR =
  'An account already exists for this email. Sign in instead of creating a new one.';

export const ACCOUNT_PENDING_ACTIVATION_MESSAGE =
  'Your account is registered. When your account is activated, you will get an email. You can sign in after that.';

export const ACCOUNT_PENDING_ACTIVATION_BETA_MESSAGE =
  'Your Free Member account is registered and Beta Test interest was noted. When your account is activated, you will get an email. You can sign in after that.';

export const ACCOUNT_PENDING_LOGIN_ERROR =
  'Account Pending Activation: You will get an email when your account is activated. You can sign in after that.';

export function canonicalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (normalized === 'candicejackson1@icloud.com') return 'candacejackson1@icloud.com';
  if (normalized === 'angela@angelaharris.com') return ANGELA_HARRIS_SEED_EMAIL;
  return normalized;
}

export const SUPER_ADMIN_ASSIGN_ERROR = 'Only Super Admin can grant Super Admin permissions.';
export const SUPER_ADMIN_PROFILE_ERROR = 'Super Admin profiles can only be changed by a Super Admin.';
export const SUPER_ADMIN_DELETE_ERROR = 'Super Admin accounts can only be deleted by a Super Admin.';

export function resolveUserAdminActor(actingUser?: UserOrRoleInput): UserOrRoleInput {
  return actingUser ?? getCurrentUserSession();
}

/** Super Admin accounts are locked to Super Admin actors. */
export function canEditUserAsActor(actor: UserOrRoleInput, target: UserOrRoleInput): boolean {
  if (isSuperAdmin(target)) return isSuperAdmin(actor);
  return true;
}

export function userCreateGateError(actor: UserOrRoleInput, role: UserRole): string | null {
  if (role === 'super_admin' && !isSuperAdmin(actor)) {
    return SUPER_ADMIN_ASSIGN_ERROR;
  }
  return null;
}

export function userUpdateGateError(
  actor: UserOrRoleInput,
  target: UserOrRoleInput,
  updates: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    roles?: UserRole[];
    status?: UserStatus;
    wantsBeta?: boolean;
  },
): string | null {
  if (isSuperAdmin(target) && !isSuperAdmin(actor)) {
    return SUPER_ADMIN_PROFILE_ERROR;
  }
  if (updates.role === 'super_admin' && !isSuperAdmin(actor)) {
    return SUPER_ADMIN_ASSIGN_ERROR;
  }
  if (updates.roles?.includes('super_admin') && !isSuperAdmin(actor)) {
    return SUPER_ADMIN_ASSIGN_ERROR;
  }
  return null;
}

export function userDeleteGateError(actor: UserOrRoleInput, target: UserOrRoleInput): string | null {
  if (isSuperAdmin(target) && !isSuperAdmin(actor)) {
    return SUPER_ADMIN_DELETE_ERROR;
  }
  return null;
}

export function getRoleLabel(role: UserRole | string): string {
  return ROLE_LABELS[role as UserRole] ?? role;
}

export const getAppUsers = (): (AppUser & { passwordHash: string })[] => {
  if (!useLocalUserStore()) {
    return remoteUsersCache.map((u) => ({ ...u, passwordHash: '' }));
  }
  if (typeof window === 'undefined') return INITIAL_SEED_USERS;
  const data = localStorage.getItem(STORAGE_USERS_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_SEED_USERS));
    localStorage.setItem(STORAGE_SEED_REV_KEY, String(USER_SEED_REVISION));
    return INITIAL_SEED_USERS;
  }
  try {
    const parsed = JSON.parse(data);
    const list = Array.isArray(parsed) ? parsed : [];
    const normalized = list.map((u: any) => ({
      ...u,
      email: canonicalizeEmail(String(u.email ?? '')),
      status: u.status || 'active',
      roles: Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role || 'member'],
      wantsBeta: Boolean(u.wantsBeta),
      phone: typeof u.phone === 'string' ? u.phone : '',
    }));
    const merged = activatePendingKnownSeeds(
      applyKnownSeedPasswords(
        mergeMissingSeedUsers(dedupeUsersByCanonicalEmail(normalized)),
        INITIAL_SEED_USERS,
      ),
    );
    const seedRev = Number(localStorage.getItem(STORAGE_SEED_REV_KEY) || '0');
    if (merged !== normalized || seedRev < USER_SEED_REVISION) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));
      localStorage.setItem(STORAGE_SEED_REV_KEY, String(USER_SEED_REVISION));
    }
    return merged;
  } catch {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_SEED_USERS));
    localStorage.setItem(STORAGE_SEED_REV_KEY, String(USER_SEED_REVISION));
    return INITIAL_SEED_USERS;
  }
};

function readRawUserSession(): AppUser | null {
  if (!useLocalUserStore()) {
    return remoteSession;
  }
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_SESSION_KEY);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      status: parsed.status || 'active',
      roles: Array.isArray(parsed.roles) && parsed.roles.length > 0 ? parsed.roles : [parsed.role || 'member'],
      wantsBeta: Boolean(parsed.wantsBeta),
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
    };
  } catch {
    return null;
  }
}

export const getCurrentUserSession = (): AppUser | null => {
  if (!useLocalUserStore()) {
    if (remoteSession && remoteSession.status === 'active') return remoteSession;
    // Soft fallback only while hydrate is in flight — and only if a D1 session token exists.
    if (typeof window === 'undefined') return null;
    let hasToken = false;
    try {
      hasToken = Boolean(
        sessionStorage.getItem('nmp_session_token') || localStorage.getItem('nmp_session_token'),
      );
    } catch {
      hasToken = false;
    }
    if (!hasToken) return null;
    const data = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!data) return null;
    try {
      const parsed = JSON.parse(data) as AppUser;
      return parsed?.status === 'active' ? parsed : null;
    } catch {
      return null;
    }
  }
  const parsed = readRawUserSession();
  if (!parsed) return null;
  const live = getAppUsers().find(
    (user) =>
      user.id === parsed.id ||
      canonicalizeEmail(user.email) === canonicalizeEmail(String(parsed.email ?? '')),
  );
  if (!live || live.status !== 'active') {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    return null;
  }
  const { passwordHash: _, ...user } = live;
  return user;
};

export const loginUser = (
  email: string,
  passRaw: string,
): { success: boolean; user?: AppUser; error?: string } => {
  if (!useLocalUserStore()) {
    return { success: false, error: 'Use loginUserAsync — accounts live on the shared database.' };
  }
  const users = getAppUsers();
  const normalizedEmail = canonicalizeEmail(email);
  const pass = passRaw.trim();

  const matches = users.filter((u) => canonicalizeEmail(u.email) === normalizedEmail);
  const found =
    matches.find((u) => u.status === 'active') ??
    matches.find((u) => u.status === 'inactive') ??
    matches[0];
  if (!found) {
    recordUserAudit({
      action: 'login_failed',
      userId: '',
      userName: 'Unknown',
      userEmail: normalizedEmail,
      summary: `Failed sign-in for ${normalizedEmail}`,
      detail: 'No account found',
    });
    return { success: false, error: 'No account found with this email address.' };
  }

  if (!isAcceptedSeedPassword(found.email, pass, found.passwordHash)) {
    recordUserAudit({
      action: 'login_failed',
      userId: found.id,
      userName: found.name,
      userEmail: found.email,
      summary: `Failed sign-in for ${found.name}`,
      detail: 'Invalid password',
    });
    return { success: false, error: 'Invalid password. Please check your credentials.' };
  }

  if (found.status === 'pending') {
    recordUserAudit({
      action: 'login_failed',
      userId: found.id,
      userName: found.name,
      userEmail: found.email,
      summary: `Failed sign-in for ${found.name}`,
      detail: 'Account pending activation',
    });
    return {
      success: false,
      error: ACCOUNT_PENDING_LOGIN_ERROR,
    };
  }

  if (found.status === 'inactive') {
    recordUserAudit({
      action: 'login_failed',
      userId: found.id,
      userName: found.name,
      userEmail: found.email,
      summary: `Failed sign-in for ${found.name}`,
      detail: 'Account inactive',
    });
    return {
      success: false,
      error: 'Account Inactive: Your account has been deactivated by an administrator.',
    };
  }

  const { passwordHash: _, ...userWithoutPass } = found;
  localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userWithoutPass));
  recordUserAudit({
    action: 'login',
    userId: found.id,
    userName: found.name,
    userEmail: found.email,
    ...auditActorFromUser(userWithoutPass),
    summary: `${found.name} signed in`,
  });
  return { success: true, user: userWithoutPass };
};

export async function loginUserAsync(
  email: string,
  passRaw: string,
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  if (useLocalUserStore()) return loginUser(email, passRaw);
  const { apiLogin } = await import('./usersApi');
  const res = await apiLogin(email, passRaw);
  if (res.success && res.user) {
    setRemoteSession(res.user);
    // Admins: pull shared directory + migrate any leftover browser users into D1.
    if (isAdminActor(res.user)) {
      await importBrowserUsersToD1();
      try {
        await refreshRemoteUsers();
      } catch {
        remoteUsersCache = [res.user];
      }
    } else {
      remoteUsersCache = [res.user];
    }
  }
  return res;
}

export const registerUser = (
  name: string,
  email: string,
  pass: string,
  role: UserRole = 'member',
  createdByAdmin: boolean = false,
  options?: { wantsBeta?: boolean; actor?: UserOrRoleInput; phone?: string },
): { success: boolean; user?: AppUser; error?: string; message?: string } => {
  if (!useLocalUserStore()) {
    return { success: false, error: 'Use registerUserAsync — accounts live on the shared database.' };
  }
  const createError = userCreateGateError(resolveUserAdminActor(options?.actor), role);
  if (createError) {
    return { success: false, error: createError };
  }

  const users = getAppUsers();
  const normalizedEmail = canonicalizeEmail(email);

  if (users.some((u) => canonicalizeEmail(u.email) === normalizedEmail)) {
    return { success: false, error: ACCOUNT_EXISTS_SIGN_IN_ERROR };
  }

  const phoneError = phoneSignupError(options?.phone);
  if (phoneError) {
    return { success: false, error: phoneError };
  }

  const status: UserStatus = createdByAdmin ? 'active' : 'pending';
  const wantsBeta = Boolean(options?.wantsBeta);

  const newUser: AppUser & { passwordHash: string } = {
    id: `user-${Date.now()}`,
    name: name.trim() || 'Community Member',
    email: normalizedEmail,
    role,
    roles: [role],
    status,
    wantsBeta,
    phone: storePhoneNumber(options?.phone ?? ''),
    createdAt: new Date().toISOString(),
    passwordHash: pass,
  };

  const updatedUsers = [...users, newUser];
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedUsers));

  const { passwordHash: _, ...userWithoutPass } = newUser;
  const actor = options?.actor && typeof options.actor === 'object' ? options.actor : undefined;
  recordUserAudit({
    action: 'register',
    userId: newUser.id,
    userName: newUser.name,
    userEmail: newUser.email,
    ...auditActorFromUser(actor as { id?: string; name?: string; email?: string } | undefined),
    summary: createdByAdmin
      ? `Account created as ${getRoleLabel(role)} (${status})`
      : `Signed up as ${getRoleLabel(role)} (${status})`,
  });

  if (status === 'active') {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userWithoutPass));
    return { success: true, user: userWithoutPass };
  }

  return {
    success: true,
    user: userWithoutPass,
    message: wantsBeta ? ACCOUNT_PENDING_ACTIVATION_BETA_MESSAGE : ACCOUNT_PENDING_ACTIVATION_MESSAGE,
  };
};

export async function registerUserAsync(
  name: string,
  email: string,
  pass: string,
  role: UserRole = 'member',
  createdByAdmin: boolean = false,
  options?: { wantsBeta?: boolean; phone?: string },
): Promise<{ success: boolean; user?: AppUser; error?: string; message?: string }> {
  if (useLocalUserStore()) return registerUser(name, email, pass, role, createdByAdmin, options);
  const { apiRegister, apiCreateUser } = await import('./usersApi');
  if (createdByAdmin) {
    const res = await apiCreateUser({
      name,
      email,
      password: pass,
      role,
      phone: options?.phone || '',
      wantsBeta: options?.wantsBeta,
    });
    if (res.success && res.user) {
      remoteUsersCache = [...remoteUsersCache.filter((u) => u.id !== res.user!.id), res.user];
    }
    return res;
  }
  const res = await apiRegister({
    name,
    email,
    password: pass,
    role,
    wantsBeta: options?.wantsBeta,
    phone: options?.phone,
  });
  if (res.success && res.user?.status === 'active') setRemoteSession(res.user);
  return res;
}

export const updateUserProfile = (
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
  actingUser?: UserOrRoleInput,
): { success: boolean; user?: AppUser; error?: string } => {
  if (!useLocalUserStore()) {
    return { success: false, error: 'Use updateUserProfileAsync — accounts live on the shared database.' };
  }
  const users = getAppUsers();
  const targetIndex = users.findIndex((u) => u.id === userId);

  if (targetIndex === -1) {
    return { success: false, error: 'User account not found' };
  }

  const existingUser = users[targetIndex];
  const actor = resolveUserAdminActor(actingUser);
  const before = {
    name: existingUser.name,
    email: existingUser.email,
    roles: [...(existingUser.roles || [existingUser.role])],
    status: existingUser.status,
    wantsBeta: existingUser.wantsBeta,
    phone: existingUser.phone ?? '',
  };
  const gateError = userUpdateGateError(actor, existingUser, updates);
  if (gateError) {
    return { success: false, error: gateError };
  }
  const actorPermissions = getRolePermissions(actor);

  if (updates.email && updates.email.trim().toLowerCase() !== existingUser.email.toLowerCase()) {
    const newEmail = updates.email.trim().toLowerCase();
    if (users.some((u) => u.id !== userId && u.email.toLowerCase() === newEmail)) {
      return { success: false, error: 'Email address is already in use by another user' };
    }
    existingUser.email = newEmail;
  }

  if (updates.name && updates.name.trim()) {
    existingUser.name = updates.name.trim();
  }

  if (updates.password && updates.password.trim()) {
    existingUser.passwordHash = updates.password;
  }

  if (updates.role) {
    if (updates.role === 'super_admin' && !actorPermissions.canAssignSuperAdmin) {
      return { success: false, error: 'Only Super Admin can assign the Super Admin role.' };
    }
    existingUser.role = updates.role;
    if (!existingUser.roles.includes(updates.role)) {
      existingUser.roles = [...existingUser.roles, updates.role];
    }
  }

  if (updates.roles && Array.isArray(updates.roles)) {
    let roles = updates.roles.filter((r) => ALL_USER_ROLES.includes(r)) as UserRole[];
    if (!actorPermissions.canAssignSuperAdmin) {
      roles = roles.filter((r) => r !== 'super_admin');
    }
    if (roles.length === 0) {
      return { success: false, error: 'Only Super Admin can assign the Super Admin role.' };
    }
    existingUser.roles = roles;
    if (!roles.includes(existingUser.role)) {
      existingUser.role = roles[0];
    }
  }

  if (updates.status) {
    existingUser.status = updates.status;
  }

  if (typeof updates.wantsBeta === 'boolean') {
    existingUser.wantsBeta = updates.wantsBeta;
  }

  if (typeof updates.phone === 'string') {
    const phoneError = phoneSignupError(updates.phone);
    if (phoneError) {
      return { success: false, error: phoneError };
    }
    existingUser.phone = storePhoneNumber(updates.phone);
  }

  users[targetIndex] = existingUser;
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

  const { passwordHash: _, ...userWithoutPass } = existingUser;
  const currentSession = readRawUserSession();
  if (currentSession?.id === userId) {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userWithoutPass));
  }

  const actorSnap = auditActorFromUser(
    actingUser && typeof actingUser === 'object'
      ? (actingUser as { id?: string; name?: string; email?: string })
      : currentSession,
  );
  const subject = {
    userId: existingUser.id,
    userName: existingUser.name,
    userEmail: existingUser.email,
    ...actorSnap,
  };
  if (
    before.name !== existingUser.name
    || before.email !== existingUser.email
    || before.wantsBeta !== existingUser.wantsBeta
    || before.phone !== existingUser.phone
  ) {
    const bits: string[] = [];
    if (before.name !== existingUser.name) bits.push(`name to ${existingUser.name}`);
    if (before.email !== existingUser.email) bits.push(`email to ${existingUser.email}`);
    if (before.wantsBeta !== existingUser.wantsBeta) {
      bits.push(existingUser.wantsBeta ? 'Beta Test on' : 'Beta Test off');
    }
    if (before.phone !== existingUser.phone) bits.push(`phone to ${existingUser.phone}`);
    recordUserAudit({
      ...subject,
      action: 'profile_update',
      summary: `Updated ${bits.join(', ')}`,
    });
  }
  if (updates.password && updates.password.trim()) {
    recordUserAudit({
      ...subject,
      action: 'password_changed',
      summary: 'Password was changed',
    });
  }
  const nextRoles = [...(existingUser.roles || [existingUser.role])].sort().join(',');
  const prevRoles = [...before.roles].sort().join(',');
  if (nextRoles !== prevRoles) {
    recordUserAudit({
      ...subject,
      action: 'roles_changed',
      summary: `Roles changed to ${existingUser.roles.map((role) => getRoleLabel(role)).join(', ')}`,
    });
  }
  if (updates.status && before.status !== existingUser.status) {
    recordUserAudit({
      ...subject,
      action: 'status_changed',
      summary: `Status changed from ${before.status} to ${existingUser.status}`,
    });
  }

  return { success: true, user: userWithoutPass };
};

export async function updateUserProfileAsync(
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
  _actingUser?: UserOrRoleInput,
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  if (useLocalUserStore()) return updateUserProfile(userId, updates, _actingUser);
  const { apiUpdateUser } = await import('./usersApi');
  const res = await apiUpdateUser(userId, updates);
  if (res.success && res.user) {
    remoteUsersCache = remoteUsersCache.map((u) => (u.id === userId ? res.user! : u));
    if (remoteSession?.id === userId) setRemoteSession(res.user);
  }
  return res;
}

export const deleteUser = (
  userId: string,
  actingUser?: UserOrRoleInput,
): { success: boolean; error?: string } => {
  if (!useLocalUserStore()) {
    return { success: false, error: 'Use deleteUserAsync — accounts live on the shared database.' };
  }
  const users = getAppUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) {
    return { success: false, error: 'User not found' };
  }
  const deleteError = userDeleteGateError(resolveUserAdminActor(actingUser), target);
  if (deleteError) {
    return { success: false, error: deleteError };
  }
  const filtered = users.filter((u) => u.id !== userId);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(filtered));
  recordUserAudit({
    action: 'deleted',
    userId: target.id,
    userName: target.name,
    userEmail: target.email,
    ...auditActorFromUser(
      actingUser && typeof actingUser === 'object'
        ? (actingUser as { id?: string; name?: string; email?: string })
        : readRawUserSession(),
    ),
    summary: `${target.name} was deleted`,
  });
  return { success: true };
};

export async function deleteUserAsync(
  userId: string,
  actingUser?: UserOrRoleInput,
): Promise<{ success: boolean; error?: string }> {
  if (useLocalUserStore()) return deleteUser(userId, actingUser);
  const { apiDeleteUser } = await import('./usersApi');
  const res = await apiDeleteUser(userId);
  if (res.success) {
    remoteUsersCache = remoteUsersCache.filter((u) => u.id !== userId);
    if (remoteSession?.id === userId) setRemoteSession(null);
  }
  return res;
}

export const logoutUser = (): void => {
  if (!useLocalUserStore()) {
    setRemoteSession(null);
    void import('./usersApi').then(({ apiLogout }) => apiLogout());
    return;
  }
  if (typeof window === 'undefined') return;
  const session = readRawUserSession();
  localStorage.removeItem(STORAGE_SESSION_KEY);
  if (!session) return;
  recordUserAudit({
    action: 'logout',
    userId: session.id,
    userName: session.name,
    userEmail: session.email,
    ...auditActorFromUser(session),
    summary: `${session.name} signed out`,
  });
};

export async function logoutUserAsync(): Promise<void> {
  if (useLocalUserStore()) {
    logoutUser();
    return;
  }
  const { apiLogout } = await import('./usersApi');
  await apiLogout();
  setRemoteSession(null);
}

/** Portal staff roles — Admin and Super Admin are both included, but remain separate roles. */
const PORTAL_ROLES: UserRole[] = ['super_admin', 'admin', 'dev', 'qa'];

/**
 * RBAC Helper: Checks if the active user can access the Admin Portal
 * (Super Admin, Admin, Dev, or QA — Members cannot).
 */
export const canAccessAdminPortal = (userOrRole?: UserOrRoleInput): boolean => {
  if (!userOrRole) return false;
  if (typeof userOrRole !== 'string' && userOrRole.status && userOrRole.status !== 'active') {
    return false;
  }
  return resolveRoles(userOrRole).some((r) => PORTAL_ROLES.includes(r));
};

/**
 * RBAC Helper: Checks specific permissions per section.
 * Super Admin and Admin are separate — Admin never inherits Super Admin–only gates.
 */
export const getRolePermissions = (userOrRole?: UserOrRoleInput) => {
  const rolesArr = resolveRoles(userOrRole);
  const superAdmin = rolesArr.includes('super_admin');
  const admin = rolesArr.includes('admin');

  return {
    /** Super Admin ONLY — Proposal & Pricing */
    canEditProposals: superAdmin,
    /** Admin and Super Admin — Financials, interactive budget, Internal PDFs */
    canViewBudget: superAdmin || admin,
    /** Super Admin and Admin — Implementation Plan tab (Admin is scope-only) */
    canViewProposal: superAdmin || admin,
    /** Admin and Super Admin — add / modify users. Super Admin profiles stay Super-Admin-gated. */
    canManageUsers: superAdmin || admin,
    /** Only Super Admin may grant or create Super Admin accounts */
    canAssignSuperAdmin: superAdmin,
    /** Admin and Super Admin — transactional email template manager */
    canManageEmailTemplates: superAdmin || admin,
    /** Admin and Super Admin — Interactive Agenda / Admin Studio meetings */
    canViewAgenda: superAdmin || admin,
    /** Admin and Super Admin — view Content Factory, Gear Selections, Asset Library */
    canViewContentFactory: superAdmin || admin,
    canManageContentFactory: superAdmin || admin,
    /** Super Admin only — upload, move, rename, and delete style cards */
    canConfigureAssetLibrary: superAdmin,
    /** Super Admin only — rename Gear style heading names */
    canRenameGearHeadings: superAdmin,
    /** Super Admin only — delete Gear collection cards */
    canDeleteGearCards: superAdmin,
    /** Super Admin only — edit and delete task/test steps */
    canEditWorkChecklistSteps: superAdmin,
    canViewIP: rolesArr.some((r) => ['super_admin', 'admin', 'dev'].includes(r)),
    canViewTesting: rolesArr.some((r) => ['super_admin', 'admin', 'dev', 'qa'].includes(r)),
    canManageTasks: rolesArr.some((r) => ['super_admin', 'admin', 'dev', 'qa'].includes(r)),
    isSuperAdmin: superAdmin,
    /** True when the Admin role is present (not Super Admin alone). */
    hasAdminRole: admin,
    /** Portal access for any staff role */
    isAdmin: canAccessAdminPortal(userOrRole),
  };
};
