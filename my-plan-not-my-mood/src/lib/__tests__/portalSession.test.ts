import { describe, expect, it, beforeEach } from 'vitest';
import { loginUser, logoutUser } from '../userAuth';
import { logoutAdminUser } from '../adminAuth';
import { appUserAsAdminSession, resolvePortalAdminSession } from '../portalSession';

describe('portalSession', () => {
  beforeEach(() => {
    localStorage.clear();
    logoutUser();
    logoutAdminUser();
  });

  it('lets evelyn3 skip a second admin login after storefront sign-in', () => {
    const login = loginUser('evelyn3@cox.net', 'Admin123');
    expect(login.success).toBe(true);
    const bridged = appUserAsAdminSession(login.user ?? null);
    expect(bridged?.email).toBe('evelyn3@cox.net');
    expect(bridged?.role).toBe('super_admin');
    expect(resolvePortalAdminSession()).toMatchObject({
      email: 'evelyn3@cox.net',
      role: 'super_admin',
    });
  });

  it('does not open Admin from a member session', () => {
    expect(appUserAsAdminSession(null)).toBeNull();
    const member = loginUser('sarah@example.com', 'member123');
    expect(appUserAsAdminSession(member.user ?? null)).toBeNull();
  });
});
