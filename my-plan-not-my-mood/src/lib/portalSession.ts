import type { AdminUser } from './adminAuth';
import { getCurrentAdminSession } from './adminAuth';
import type { AppUser } from './userAuth';
import { canAccessAdminPortal, getCurrentUserSession } from './userAuth';

/** Storefront AppUser session is enough to enter Admin — no second admin login. */
export function appUserAsAdminSession(user: AppUser | null): AdminUser | null {
  if (!user || !canAccessAdminPortal(user)) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === 'super_admin' ? 'super_admin' : 'admin',
    createdAt: user.createdAt,
  };
}

export function resolvePortalAdminSession(
  adminSession = getCurrentAdminSession(),
  appSession = getCurrentUserSession(),
): AdminUser | null {
  return appUserAsAdminSession(appSession) ?? adminSession;
}
