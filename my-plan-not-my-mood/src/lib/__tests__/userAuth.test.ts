import { describe, it, expect, beforeEach } from 'vitest';
import {
  ACCOUNT_EXISTS_SIGN_IN_ERROR,
  ACCOUNT_PENDING_ACTIVATION_BETA_MESSAGE,
  ACCOUNT_PENDING_ACTIVATION_MESSAGE,
  activatePendingKnownSeeds,
  canonicalizeEmail,
  GYSH_USER_DATABASE_NAME,
  NMP_D1_DATABASE_NAME,
  NMP_USER_DIRECTORY_LABEL,
  NMP_USER_DIRECTORY_NOTE,
  STORAGE_USERS_KEY,
  getAppUsers,
  getCurrentUserSession,
  loginUser,
  mergeMissingSeedUsers,
  registerUser,
  updateUserProfile,
  logoutUser,
  canAccessAdminPortal,
  getRolePermissions,
  isPortalTester,
  listPortalTesters,
  USER_STATUS_LABELS,
} from '../userAuth';
import { ANGELA_HARRIS_SEED_EMAIL, EVELYN_SEED_EMAIL, STAFF_SEED_PASSWORD } from '../seedAccounts';
import { PHONE_REQUIRED_ERROR } from '../phoneNumber';

const SIGNUP_PHONE = '6195550100';

describe('MyPlan App User Auth & RBAC Permissions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps My Plan users off the Get Your Side Hustle database', () => {
    expect(STORAGE_USERS_KEY).toBe('myplan_app_users_db_v2');
    expect(STORAGE_USERS_KEY.startsWith('myplan_')).toBe(true);
    expect(STORAGE_USERS_KEY).not.toMatch(/gysh/i);
    expect(NMP_D1_DATABASE_NAME).toBe('my-plan-agenda');
    expect(GYSH_USER_DATABASE_NAME).toBe('gysh-db');
    expect(NMP_D1_DATABASE_NAME).not.toBe(GYSH_USER_DATABASE_NAME);
    expect(NMP_USER_DIRECTORY_LABEL).toMatch(/Shared D1|my-plan-agenda/i);
    expect(NMP_USER_DIRECTORY_NOTE).toMatch(/shared My Plan database/i);
  });

  it('initializes default seed users with active status and assigned roles', () => {
    const users = getAppUsers();
    expect(users.length).toBeGreaterThanOrEqual(5);

    const evelyn = users.find(u => u.email === EVELYN_SEED_EMAIL);
    expect(evelyn).toBeDefined();
    expect(evelyn?.role).toBe('super_admin');
    expect(evelyn?.status).toBe('active');

    const angela = users.find(u => u.email === 'angela@myplannotmymood.com');
    expect(angela).toBeDefined();
    expect(angela?.status).toBe('active');

    const angelaHarris = users.find(u => u.email === ANGELA_HARRIS_SEED_EMAIL);
    expect(angelaHarris).toBeDefined();
    expect(angelaHarris?.role).toBe('admin');
    expect(angelaHarris?.status).toBe('active');

    const brand = users.find(u => u.email === 'nonnegotiation@gmail.com');
    expect(brand).toBeDefined();
    expect(brand?.role).toBe('super_admin');
    expect(brand?.status).toBe('active');

    const candace = users.find(u => u.email === 'candacejackson1@icloud.com');
    expect(candace).toBeDefined();
    expect(candace?.name).toBe('Candace Jackson');
    expect(candace?.role).toBe('qa');
    expect(candace?.status).toBe('active');

    const narissa = users.find((u) => u.email === 'narissabriana@yahoo.com');
    expect(narissa).toBeDefined();
    expect(narissa?.name).toBe('Narissa Briana');
    expect(narissa?.role).toBe('member');
    expect(narissa?.status).toBe('active');
    expect(loginUser('narissabriana@yahoo.com', 'Member123').success).toBe(true);
  });

  it('lets Candace Jackson sign in and merges her into an older saved user list', () => {
    const result = loginUser('candacejackson1@icloud.com', 'Candace123');
    expect(result.success).toBe(true);
    expect(result.user?.name).toBe('Candace Jackson');
    expect(result.user?.role).toBe('qa');
    const olderList = getAppUsers().filter((user) => user.email !== 'candacejackson1@icloud.com');
    const merged = mergeMissingSeedUsers(olderList);
    expect(merged.some((user) => user.email === 'candacejackson1@icloud.com')).toBe(true);
    expect(canonicalizeEmail('CandiceJackson1@icloud.com')).toBe('candacejackson1@icloud.com');
    expect(loginUser('candicejackson1@icloud.com', 'Candace123').success).toBe(true);
    expect(registerUser('Candace Jackson', 'candacejackson1@icloud.com', 'otherpass', 'qa').error).toBe(
      ACCOUNT_EXISTS_SIGN_IN_ERROR,
    );
  });

  it('activates a pending Candace signup so she can sign in after an admin set her Active', () => {
    const pending = getAppUsers().map((user) =>
      user.email === 'candacejackson1@icloud.com' ? { ...user, status: 'pending' as const } : user,
    );
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(pending));
    expect(activatePendingKnownSeeds(pending).find((user) => user.email === 'candacejackson1@icloud.com')?.status).toBe(
      'active',
    );
    const login = loginUser('candicejackson1@icloud.com', 'Candace123');
    expect(login.success).toBe(true);
    expect(login.user?.status).toBe('active');
    expect(getAppUsers().find((user) => user.email === 'candacejackson1@icloud.com')?.status).toBe('active');
  });

  it('lets the production brand email sign in and merges it into an older saved user list', () => {
    const result = loginUser('nonnegotiation@gmail.com', 'Kiva#3232');
    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('nonnegotiation@gmail.com');
    expect(result.user?.role).toBe('super_admin');
    const olderList = getAppUsers().filter((user) => user.email !== 'nonnegotiation@gmail.com');
    const merged = mergeMissingSeedUsers(olderList);
    expect(merged.some((user) => user.email === 'nonnegotiation@gmail.com')).toBe(true);
  });

  it('allows logging in as Active Super Admin evelyn3@cox.net / Admin123', () => {
    const result = loginUser(EVELYN_SEED_EMAIL, STAFF_SEED_PASSWORD);
    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('super_admin');

    const session = getCurrentUserSession();
    expect(session?.email).toBe(EVELYN_SEED_EMAIL);
  });

  it('allows logging in as Admin angela@angelasharris.com / Admin123', () => {
    const result = loginUser(ANGELA_HARRIS_SEED_EMAIL, STAFF_SEED_PASSWORD);
    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('admin');
    expect(result.user?.name).toBe('Angela Harris');
    expect(loginUser('angela@angelaharris.com', STAFF_SEED_PASSWORD).success).toBe(true);
    expect(loginUser(EVELYN_SEED_EMAIL, 'Temp#123').success).toBe(true);
    const olderList = getAppUsers().filter((user) => user.email !== ANGELA_HARRIS_SEED_EMAIL);
    const merged = mergeMissingSeedUsers(olderList);
    expect(merged.some((user) => user.email === ANGELA_HARRIS_SEED_EMAIL)).toBe(true);
  });

  it('gates newly registered users with status pending until admin activation', () => {
    const missingPhone = registerUser('No Phone', 'nophone@example.com', 'bobpass123', 'member');
    expect(missingPhone.success).toBe(false);
    expect(missingPhone.error).toBe(PHONE_REQUIRED_ERROR);

    const regResult = registerUser('New Member Bob', 'bob@example.com', 'bobpass123', 'member', false, {
      phone: SIGNUP_PHONE,
    });
    expect(regResult.success).toBe(true);
    expect(regResult.user?.status).toBe('pending');
    expect(regResult.message).toBe(ACCOUNT_PENDING_ACTIVATION_MESSAGE);

    // Attempt login while pending
    const loginRes = loginUser('bob@example.com', 'bobpass123');
    expect(loginRes.success).toBe(false);
    expect(loginRes.error).toContain('Pending Activation');

    // Admin activates user
    updateUserProfile(regResult.user!.id, { status: 'active' });

    // Login after activation
    const activeLoginRes = loginUser('bob@example.com', 'bobpass123');
    expect(activeLoginRes.success).toBe(true);
    expect(activeLoginRes.user?.email).toBe('bob@example.com');
    expect(getAppUsers().find((user) => user.email === 'bob@example.com')?.phone).toBe('(619) 555-0100');
  });

  it('blocks inactive / deactivated users from logging in', () => {
    const regResult = registerUser('Blocked User', 'blocked@example.com', 'pass123', 'member', true, {
      phone: SIGNUP_PHONE,
    });
    expect(regResult.user?.status).toBe('active');

    // Deactivate user
    updateUserProfile(regResult.user!.id, { status: 'inactive' });

    const loginRes = loginUser('blocked@example.com', 'pass123');
    expect(loginRes.success).toBe(false);
    expect(loginRes.error).toContain('Inactive');
  });

  it('drops a leftover session when the account is no longer active', () => {
    const created = registerUser('Active Then Pending', 'session-drop@example.com', 'pass123', 'member', true, {
      phone: SIGNUP_PHONE,
    });
    expect(created.success).toBe(true);
    expect(loginUser('session-drop@example.com', 'pass123').success).toBe(true);
    expect(getCurrentUserSession()?.email).toBe('session-drop@example.com');

    updateUserProfile(created.user!.id, { status: 'pending' });
    expect(getCurrentUserSession()).toBeNull();
  });

  it('allows updating user profile info and multi-roles in User Portal & Admin Suite', () => {
    const loginRes = loginUser(EVELYN_SEED_EMAIL, STAFF_SEED_PASSWORD);
    const user = loginRes.user!;

    const updateRes = updateUserProfile(user.id, {
      name: 'Evelyn Irving (Updated)',
      roles: ['super_admin', 'dev'],
    });

    expect(updateRes.success).toBe(true);
    expect(updateRes.user?.name).toBe('Evelyn Irving (Updated)');
    expect(updateRes.user?.roles).toContain('dev');
  });

  it('correctly evaluates RBAC permissions per role', () => {
    // Super Admin (Evelyn) — separate from Admin
    expect(canAccessAdminPortal('super_admin')).toBe(true);
    expect(getRolePermissions('super_admin').canEditProposals).toBe(true);
    expect(getRolePermissions('super_admin').canViewBudget).toBe(true);
    expect(getRolePermissions('super_admin').canViewProposal).toBe(true);
    expect(getRolePermissions('super_admin').canManageUsers).toBe(true);
    expect(getRolePermissions('super_admin').canAssignSuperAdmin).toBe(true);
    expect(getRolePermissions('super_admin').canManageEmailTemplates).toBe(true);
    expect(getRolePermissions('super_admin').canViewAgenda).toBe(true);
    expect(getRolePermissions('super_admin').canManageContentFactory).toBe(true);
    expect(getRolePermissions('super_admin').canViewContentFactory).toBe(true);
    expect(getRolePermissions('super_admin').canConfigureAssetLibrary).toBe(true);
    expect(getRolePermissions('super_admin').canRenameGearHeadings).toBe(true);
    expect(getRolePermissions('super_admin').canDeleteGearCards).toBe(true);
    expect(getRolePermissions('super_admin').canEditWorkChecklistSteps).toBe(true);
    expect(getRolePermissions('super_admin').isSuperAdmin).toBe(true);
    expect(getRolePermissions('super_admin').hasAdminRole).toBe(false);

    // Admin (Angela Harris) — distinct from Super Admin
    expect(canAccessAdminPortal('admin')).toBe(true);
    expect(getRolePermissions('admin').canEditProposals).toBe(false); // Proposal & Pricing Gated
    expect(getRolePermissions('admin').canViewBudget).toBe(true);
    expect(getRolePermissions('admin').canViewProposal).toBe(true);
    expect(getRolePermissions('admin').canManageUsers).toBe(true);
    expect(getRolePermissions('admin').canAssignSuperAdmin).toBe(false);
    expect(getRolePermissions('admin').canViewIP).toBe(true);
    expect(getRolePermissions('admin').canViewTesting).toBe(true);
    expect(getRolePermissions('admin').canManageTasks).toBe(true);
    expect(getRolePermissions('admin').canManageEmailTemplates).toBe(true);
    expect(getRolePermissions('admin').canViewAgenda).toBe(true);
    expect(getRolePermissions('admin').canManageContentFactory).toBe(true);
    expect(getRolePermissions('admin').canViewContentFactory).toBe(true);
    expect(getRolePermissions('admin').canConfigureAssetLibrary).toBe(false);
    expect(getRolePermissions('admin').canRenameGearHeadings).toBe(false);
    expect(getRolePermissions('admin').canDeleteGearCards).toBe(false);
    expect(getRolePermissions('admin').isSuperAdmin).toBe(false);
    expect(getRolePermissions('admin').hasAdminRole).toBe(true);

    // Dev
    expect(canAccessAdminPortal('dev')).toBe(true);
    expect(getRolePermissions('dev').canViewIP).toBe(true);
    expect(getRolePermissions('dev').canManageUsers).toBe(false);
    expect(getRolePermissions('dev').canManageEmailTemplates).toBe(false);
    expect(getRolePermissions('dev').canViewAgenda).toBe(false);
    expect(getRolePermissions('dev').canManageContentFactory).toBe(false);

    // QA
    expect(canAccessAdminPortal('qa')).toBe(true);
    expect(getRolePermissions('qa').canViewTesting).toBe(true);
    expect(getRolePermissions('qa').canEditProposals).toBe(false);
    expect(getRolePermissions('qa').canViewBudget).toBe(false);
    expect(getRolePermissions('qa').canViewProposal).toBe(false);
    expect(getRolePermissions('qa').canManageEmailTemplates).toBe(false);
    expect(getRolePermissions('qa').canManageContentFactory).toBe(false);

    // Member (Customer)
    expect(canAccessAdminPortal('member')).toBe(false);
    expect(getRolePermissions('member').isAdmin).toBe(false);
    expect(getRolePermissions('member').canManageEmailTemplates).toBe(false);
  });

  it('records Beta Test interest on Free Member registration without granting admin access', () => {
    const res = registerUser('Beta Pat', 'pat@example.com', 'patpass123', 'member', false, {
      wantsBeta: true,
      phone: SIGNUP_PHONE,
    });
    expect(res.user?.phone).toBe('(619) 555-0100');
    expect(res.success).toBe(true);
    expect(res.user?.role).toBe('member');
    expect(res.user?.wantsBeta).toBe(true);
    expect(res.user?.status).toBe('pending');
    expect(res.message).toBe(ACCOUNT_PENDING_ACTIVATION_BETA_MESSAGE);
    expect(res.message).not.toMatch(/confirmation/i);
    expect(canAccessAdminPortal(res.user)).toBe(false);
  });

  it('registers Free Members without Beta Test interest by default', () => {
    const res = registerUser('Sam Member', 'sam@example.com', 'sampass123', 'member', false, { phone: SIGNUP_PHONE });
    expect(res.success).toBe(true);
    expect(res.user?.wantsBeta).toBe(false);
    expect(res.message).toBe(ACCOUNT_PENDING_ACTIVATION_MESSAGE);
    expect(res.message).not.toMatch(/confirmation of (your )?sign-?up/i);
  });

  it('lets an active Free Member apply as a Beta Tester from their profile', () => {
    const res = registerUser('Lee Member', 'lee@example.com', 'leepass123', 'member', true, { phone: SIGNUP_PHONE });
    expect(res.user?.wantsBeta).toBe(false);

    const updateRes = updateUserProfile(res.user!.id, { wantsBeta: true });
    expect(updateRes.success).toBe(true);
    expect(updateRes.user?.wantsBeta).toBe(true);
    expect(updateRes.user?.role).toBe('member');
  });

  it('allows Angela Harris to log in with Admin role and grants portal access while gating proposal access', () => {
    const loginRes = loginUser('angela@myplannotmymood.com', 'myplan2026');
    expect(loginRes.success).toBe(true);
    expect(loginRes.user?.role).toBe('admin');
    expect(loginRes.user?.roles).toEqual(['admin']);

    const perms = getRolePermissions(loginRes.user);
    expect(perms.isAdmin).toBe(true);
    expect(perms.hasAdminRole).toBe(true);
    expect(perms.isSuperAdmin).toBe(false);
    expect(perms.canEditProposals).toBe(false);
    expect(perms.canViewBudget).toBe(true);
    expect(perms.canViewProposal).toBe(true);
    expect(perms.canManageUsers).toBe(true);
    expect(perms.canAssignSuperAdmin).toBe(false);
    expect(perms.canViewIP).toBe(true);
    expect(perms.canViewTesting).toBe(true);
    expect(perms.canViewAgenda).toBe(true);
    expect(perms.canManageTasks).toBe(true);
  });

  it('lists every Beta Tester and QA Tester on the Testing Portal roster', () => {
    const testers = listPortalTesters(getAppUsers());
    expect(testers.map((user) => user.name)).toEqual(['Candace Jackson', 'QA Tester Tina']);
    expect(testers.every((user) => user.wantsBeta || user.role === 'qa')).toBe(true);
    expect(testers.some((user) => /evelyn|angela|sarah|narissa|dev lead/i.test(user.name))).toBe(false);

    const pending = registerUser('Beta Pat', 'pat-tester@example.com', 'patpass123', 'member', false, {
      wantsBeta: true,
      phone: SIGNUP_PHONE,
    });
    expect(pending.user?.wantsBeta).toBe(true);
    const withPending = listPortalTesters(getAppUsers());
    expect(withPending.map((user) => user.name)).toContain('Beta Pat');
    expect(withPending.find((user) => user.name === 'Beta Pat')?.status).toBe('pending');
    expect(isPortalTester({ role: 'dev', roles: ['dev', 'qa'], wantsBeta: false })).toBe(false);
    expect(isPortalTester({ role: 'qa', roles: ['qa'], wantsBeta: false })).toBe(true);
    expect(USER_STATUS_LABELS.pending).toBe('Pending');
  });
});
