/** Per-field mic buttons on the manual IntakeWizard (/scenario/new). */
export const VOICE_INPUT_ENABLED = true;

/** Full voice-driven scenario wizard on /scenario/new (toggle + VoiceIntakeWizard). */
export const VOICE_WIZARD_ENABLED = true;

/** While true, only admins see the voice wizard entry points and toggle. */
export const VOICE_WIZARD_ADMIN_ONLY = true;

export function isVoiceWizardAvailable(role?: string | null): boolean {
  if (!VOICE_WIZARD_ENABLED) return false;
  if (VOICE_WIZARD_ADMIN_ONLY) return role === "admin";
  return true;
}
