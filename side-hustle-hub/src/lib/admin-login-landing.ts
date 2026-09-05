/**
 * Where staff land after login for Admin Studio / Testing Portal.
 */

import type { AdminTab } from "./admin-nav";
import { mustPickAgendaTimes } from "./gysh-partner-agenda";
import {
  canAccessAdminPortal,
  canAccessTestingPortal,
  isQaOnlyPortalUser,
} from "./gysh-roles";

/**
 * Where Admin Studio opens after a successful admin login.
 * Tina / Lyriq still land on Agenda first (meeting-date gate); everyone else → Testing Portal.
 */
export function adminLandingTabAfterLogin(
  user:
    | { name?: string; email?: string; role?: string; roles?: string[] }
    | null
    | undefined,
): AdminTab {
  if (mustPickAgendaTimes(user)) return "agenda";
  return "testing";
}

/**
 * Post-login destination for Admin / QA accounts.
 * - Admin: Agenda gate when required, else Testing Portal (via Admin Studio)
 * - QA-only: always Testing Portal
 * - Members / others: null (caller keeps member flow)
 */
export function postLoginStaffDestination(
  user:
    | { name?: string; email?: string; role?: string; roles?: string[] }
    | null
    | undefined,
): { view: "admin"; tab: AdminTab } | null {
  if (!user) return null;
  if (canAccessAdminPortal(user)) {
    return { view: "admin", tab: adminLandingTabAfterLogin(user) };
  }
  if (canAccessTestingPortal(user) || isQaOnlyPortalUser(user)) {
    return { view: "admin", tab: "testing" };
  }
  return null;
}
