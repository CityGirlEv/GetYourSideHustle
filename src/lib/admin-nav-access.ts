import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-store";
import { hasStaffNavHint } from "@/lib/staff-nav-session";
import { userCanSeeAdminMenu, userHasAdminRole } from "@/lib/user-roles";

/** Nav items that require a signed-in staff user (admin menu vs pricing link). */
export function useAdminNavAccess() {
  const { user, session, authLoading } = useApp();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sessionUserId = session?.user?.id;
  const isLoggedIn = Boolean(user);
  const isAdmin = isLoggedIn && userHasAdminRole(user);
  const staffFromProfile = isLoggedIn && userCanSeeAdminMenu(user);
  /** Keep Admin visible while profile hydrates after a prior staff sign-in on this device. */
  const staffFromHint =
    mounted &&
    Boolean(sessionUserId) &&
    (authLoading || !user) &&
    hasStaffNavHint(sessionUserId);

  return {
    user,
    session,
    authLoading,
    isLoggedIn: isLoggedIn || Boolean(sessionUserId),
    isAdmin,
    /** Main-nav Admin menu for signed-in admin users only. */
    showAdminNav: staffFromProfile || staffFromHint,
  };
}
