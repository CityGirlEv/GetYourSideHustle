import { describe, expect, it, beforeEach } from 'vitest';
import {
  SUPER_ADMIN_ASSIGN_ERROR,
  SUPER_ADMIN_DELETE_ERROR,
  SUPER_ADMIN_PROFILE_ERROR,
  deleteUser,
  getAppUsers,
  getRolePermissions,
  loginUser,
  registerUser,
  updateUserProfile,
  userCreateGateError,
  userDeleteGateError,
  userUpdateGateError,
} from '../userAuth';

describe('Super Admin user-admin gates', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('lets Super Admin grant Super Admin and lets Admin add or edit non-Super-Admin users', () => {
    expect(userCreateGateError('super_admin', 'super_admin')).toBeNull();
    expect(userCreateGateError('admin', 'admin')).toBeNull();
    expect(userCreateGateError('admin', 'member')).toBeNull();
    expect(userUpdateGateError('admin', { role: 'member' }, {})).toBeNull();
    expect(userUpdateGateError('super_admin', { role: 'super_admin', roles: ['super_admin'] }, {})).toBeNull();
    expect(userDeleteGateError('admin', { role: 'member' })).toBeNull();
    expect(userDeleteGateError('super_admin', { role: 'super_admin' })).toBeNull();

    const admin = loginUser('angela@myplannotmymood.com', 'myplan2026').user!;
    const created = registerUser('New QA', 'new.qa@example.com', 'qa-pass-1', 'qa', true, {
      actor: admin,
      phone: '6195550100',
    });
    expect(created.success).toBe(true);
    expect(created.user?.role).toBe('qa');

    const renamed = updateUserProfile(created.user!.id, { name: 'QA Updated' }, admin);
    expect(renamed.success).toBe(true);
    expect(renamed.user?.name).toBe('QA Updated');

    const superAdmin = loginUser('evelyn3@cox.net', 'Admin123').user!;
    const promoted = updateUserProfile(created.user!.id, { role: 'super_admin' }, superAdmin);
    expect(promoted.success).toBe(true);
    expect(promoted.user?.role).toBe('super_admin');
  });

  it('rejects Admin creating a Super Admin account', () => {
    expect(userCreateGateError('admin', 'super_admin')).toBe(SUPER_ADMIN_ASSIGN_ERROR);
    const admin = loginUser('angela@myplannotmymood.com', 'myplan2026').user!;
    const result = registerUser('Nope', 'nope-sa@example.com', 'pass1234', 'super_admin', true, { actor: admin });
    expect(result.success).toBe(false);
    expect(result.error).toBe(SUPER_ADMIN_ASSIGN_ERROR);
    expect(getAppUsers().some((u) => u.email === 'nope-sa@example.com')).toBe(false);
  });

  it('rejects granting Super Admin without a Super Admin actor', () => {
    const admin = loginUser('angela@myplannotmymood.com', 'myplan2026').user!;
    const member = registerUser('Lee', 'lee-gate@example.com', 'leepass1', 'member', true, {
      actor: admin,
      phone: '6195550100',
    }).user!;

    expect(userUpdateGateError(admin, member, { role: 'super_admin' })).toBe(SUPER_ADMIN_ASSIGN_ERROR);
    const byRole = updateUserProfile(member.id, { role: 'super_admin' }, admin);
    expect(byRole.success).toBe(false);
    expect(byRole.error).toBe(SUPER_ADMIN_ASSIGN_ERROR);

    const byRoles = updateUserProfile(member.id, { roles: ['super_admin', 'member'] }, admin);
    expect(byRoles.success).toBe(false);
    expect(byRoles.error).toBe(SUPER_ADMIN_ASSIGN_ERROR);
  });

  it('rejects Admin changing a Super Admin profile, roles, status, or password', () => {
    const admin = loginUser('angela@myplannotmymood.com', 'myplan2026').user!;
    const target = getAppUsers().find((u) => u.email === 'evelyn3@cox.net')!;
    expect(userUpdateGateError(admin, target, { name: 'Hacked' })).toBe(SUPER_ADMIN_PROFILE_ERROR);

    const nameRes = updateUserProfile(target.id, { name: 'Hacked Evelyn' }, admin);
    expect(nameRes.success).toBe(false);
    expect(nameRes.error).toBe(SUPER_ADMIN_PROFILE_ERROR);

    const roleRes = updateUserProfile(target.id, { roles: ['admin'] }, admin);
    expect(roleRes.success).toBe(false);
    expect(roleRes.error).toBe(SUPER_ADMIN_PROFILE_ERROR);

    const statusRes = updateUserProfile(target.id, { status: 'inactive' }, admin);
    expect(statusRes.success).toBe(false);
    expect(statusRes.error).toBe(SUPER_ADMIN_PROFILE_ERROR);

    const passRes = updateUserProfile(target.id, { password: 'stolen' }, admin);
    expect(passRes.success).toBe(false);
    expect(passRes.error).toBe(SUPER_ADMIN_PROFILE_ERROR);

    const after = getAppUsers().find((u) => u.id === target.id)!;
    expect(after.name).toBe(target.name);
    expect(after.roles).toContain('super_admin');
    expect(after.status).toBe('active');
    expect(after.passwordHash).toBe('Admin123');
  });

  it('rejects Admin deleting a Super Admin account', () => {
    const admin = loginUser('angela@myplannotmymood.com', 'myplan2026').user!;
    const target = getAppUsers().find((u) => u.email === 'evelyn3@cox.net')!;
    expect(userDeleteGateError(admin, target)).toBe(SUPER_ADMIN_DELETE_ERROR);
    const result = deleteUser(target.id, admin);
    expect(result.success).toBe(false);
    expect(result.error).toBe(SUPER_ADMIN_DELETE_ERROR);
    expect(getAppUsers().some((u) => u.id === target.id)).toBe(true);
  });

  it('gives Admin user-matrix access without Super Admin assignment', () => {
    expect(getRolePermissions('admin').canManageUsers).toBe(true);
    expect(getRolePermissions('admin').canAssignSuperAdmin).toBe(false);
    expect(getRolePermissions('super_admin').canManageUsers).toBe(true);
    expect(getRolePermissions('super_admin').canAssignSuperAdmin).toBe(true);
  });
});
