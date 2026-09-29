import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAdminUsers,
  getCurrentAdminSession,
  loginAdminUser,
  registerAdminUser,
  logoutAdminUser,
  ADMIN_SELF_REGISTER_ERROR,
} from '../adminAuth';

describe('MyPlan App Admin Auth & User Database', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes default admin users on first call including Super Admin Evelyn and Admin Angela', () => {
    const users = getAdminUsers();
    expect(users.length).toBeGreaterThanOrEqual(3);

    const evelyn = users.find(u => u.email === 'evelyn3@cox.net');
    expect(evelyn?.role).toBe('super_admin');

    const angela = users.find(u => u.email === 'angela@myplannotmymood.com');
    expect(angela?.role).toBe('admin');

    const angelaHarris = users.find(u => u.email === 'angela@angelasharris.com');
    expect(angelaHarris?.role).toBe('admin');

    const brand = users.find(u => u.email === 'nonnegotiation@gmail.com');
    expect(brand?.role).toBe('super_admin');
  });

  it('lets the production brand email sign in on an older saved admin list', () => {
    const result = loginAdminUser('nonnegotiation@gmail.com', 'Kiva#3232');
    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('nonnegotiation@gmail.com');
  });

  it('allows logging in with evelyn3@cox.net and Admin123', () => {
    const result = loginAdminUser('evelyn3@cox.net', 'Admin123');
    expect(result.success).toBe(true);
    expect(result.user?.name).toBe('Evelyn (Muntie Ev)');

    const session = getCurrentAdminSession();
    expect(session?.email).toBe('evelyn3@cox.net');
  });

  it('lets angela@angelasharris.com sign in with Admin123', () => {
    const result = loginAdminUser('angela@angelasharris.com', 'Admin123');
    expect(result.success).toBe(true);
    expect(result.user?.name).toBe('Angela Harris');
    expect(result.user?.role).toBe('admin');
  });

  it('rejects invalid password', () => {
    const result = loginAdminUser('evelyn3@cox.net', 'wrongpass');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid password. Please check your credentials.');
  });

  it('rejects public admin self-registration so testers cannot gate-crash the portal', () => {
    const regResult = registerAdminUser('New Admin', 'newadmin@example.com', 'newadminpass123');
    expect(regResult.success).toBe(false);
    expect(regResult.error).toBe(ADMIN_SELF_REGISTER_ERROR);
    expect(loginAdminUser('newadmin@example.com', 'newadminpass123').success).toBe(false);
  });

  it('clears session on logout', () => {
    loginAdminUser('evelyn3@cox.net', 'Admin123');
    expect(getCurrentAdminSession()).not.toBeNull();

    logoutAdminUser();
    expect(getCurrentAdminSession()).toBeNull();
  });
});
