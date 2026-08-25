import type { AdminTab } from "./admin-nav";
import { mustPickAgendaTimes } from "./gysh-partner-agenda";

/**
 * Where Admin Studio opens after a successful admin/QA/dev login.
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
