import type { UserRoleCheck } from "./user-roles";

/** Per-field mic buttons on the manual IntakeWizard (/scenario/old). */
export const VOICE_INPUT_ENABLED = true;

/** Full voice-driven scenario wizard on /scenario/old (toggle + VoiceIntakeWizard). */
export const VOICE_WIZARD_ENABLED = true;

/** While true, only logged-in admin or QA users see voice wizard entry points. */
export const VOICE_WIZARD_ADMIN_ONLY = true;

function hasVoiceWizardStaffRole(user: UserRoleCheck): boolean {
  if (user.role === "admin" || user.role === "qa") return true;
  return user.roles?.some((role) => role === "admin" || role === "qa") ?? false;
}

export function isVoiceWizardAvailable(user?: UserRoleCheck | null): boolean {
  if (!VOICE_WIZARD_ENABLED) return false;
  if (!VOICE_WIZARD_ADMIN_ONLY) return true;
  if (!user) return false;
  return hasVoiceWizardStaffRole(user);
}
