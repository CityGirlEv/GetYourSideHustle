/** Shared beta registration steps for Auth test-plan cases (QA + agent). */

export type RegistrationPlatform = "Computer" | "Phone" | "iPad";

const DEVICE_HINT: Record<RegistrationPlatform, string> = {
  Computer:
    "Under Computer, select the machine you will test on (e.g. MacBook, Windows laptop, or Windows desktop)",
  Phone: "Under Mobile device, select the phone you will test on (e.g. iPhone or Android phone)",
  iPad: "Under Mobile device, select the tablet you will test on (e.g. iPad or Android tablet)",
};

function registrationPreamble(platform: RegistrationPlatform): string[] {
  return [
    `Open an incognito/private window on a ${platform.toLowerCase()} browser`,
    "Navigate to /auth and open the Register tab (or go directly to /register)",
    "Enter a unique first name and last name",
    "Enter a valid email address not already registered in the system",
    "Enter a phone number with at least 7 digits",
    "Enter a password of at least 12 characters",
    "Re-enter the same password in Confirm password",
  ];
}

function ndaAndSubmitSteps(): string[] {
  return [
    "Click Continue to NDA",
    "Scroll through the NDA modal and confirm the agreement version is shown",
    "Type your full legal name in the signature field (must match first + last name)",
    "Check the box to agree to the NDA terms",
    'Click "Sign & submit"',
  ];
}

function postSubmitSteps(roleLabel: "QA tester" | "agent"): string[] {
  return [
    'Confirm the "Registration submitted — next steps" dialog appears',
    "Verify the dialog states your account is under review and disabled until an administrator approves it",
    `Confirm the dialog mentions the ${roleLabel} role where applicable`,
    'Click "Go to sign-in" and attempt to sign in with the email and password you just registered',
    "Verify sign-in is blocked or shows that the account is not yet enabled (admin approval required)",
  ];
}

/** QA beta registration — full NDA flow including device selection for the test platform. */
export function buildQaRegistrationSteps(platform: RegistrationPlatform): string[] {
  return [
    ...registrationPreamble(platform),
    'Click "I\'m registering as" → QA Tester',
    DEVICE_HINT[platform],
    "Select any additional hardware you can also test on (optional)",
    ...ndaAndSubmitSteps(),
    ...postSubmitSteps("QA tester"),
    "Confirm a qa-registration-confirmation email is queued to the address you entered (check Resend logs if needed)",
  ];
}

/** Licensed agent beta registration — same NDA flow without QA device selection. */
export function buildAgentRegistrationSteps(platform: RegistrationPlatform): string[] {
  return [
    ...registrationPreamble(platform),
    'Click "I\'m registering as" → Agent',
    ...ndaAndSubmitSteps(),
    ...postSubmitSteps("agent"),
    "Confirm an agent-registration-confirmation email is queued to the address you entered (check Resend logs if needed)",
  ];
}
