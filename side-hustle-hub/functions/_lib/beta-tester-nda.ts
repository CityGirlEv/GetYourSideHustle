/** Server-side Beta Tester NDA acceptance checks (keep in sync with src/lib/beta-tester-nda.ts). */

export const BETA_NDA_VERSION = "GYSH-BETA-NDA-v1.0";

export type BetaNdaAcceptanceInput = {
  agreed?: unknown;
  legalName?: unknown;
  email?: unknown;
  signature?: unknown;
  acceptedAt?: unknown;
  ndaVersion?: unknown;
};

function normalizePersonName(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

export function betaNdaTodayDate(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function betaNdaAcceptanceError(input: BetaNdaAcceptanceInput): string | null {
  const version = String(input.ndaVersion ?? BETA_NDA_VERSION).trim();
  if (version !== BETA_NDA_VERSION) {
    return "This NDA version is out of date. Refresh and accept the current agreement.";
  }
  if (input.agreed !== true) {
    return "Accept the Beta Tester NDA to apply.";
  }
  const legalName = normalizePersonName(input.legalName);
  if (legalName.length < 2) {
    return "Enter your full legal name on the NDA.";
  }
  const email = String(input.email ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@")) {
    return "Enter the email on the NDA.";
  }
  const signature = normalizePersonName(input.signature);
  if (!signature) {
    return "Type your name as your electronic signature.";
  }
  if (signature.toLowerCase() !== legalName.toLowerCase()) {
    return "Electronic signature must match your full legal name.";
  }
  return null;
}

export function formatBetaNdaAcceptanceNote(input: {
  legalName: string;
  email: string;
  acceptedAt: string;
}): string {
  const name = normalizePersonName(input.legalName);
  const email = String(input.email).trim().toLowerCase();
  const day = String(input.acceptedAt || "").slice(0, 10) || betaNdaTodayDate();
  return `NDA accepted ${day} by ${name} <${email}>`;
}

export function betaNdaRegisterError(
  applyBetaTester: boolean,
  nda: BetaNdaAcceptanceInput | null | undefined,
  accountEmail: string,
): string | null {
  if (!applyBetaTester) return null;
  const err = betaNdaAcceptanceError(nda ?? {});
  if (err) return err;
  const ndaEmail = String(nda?.email ?? "")
    .trim()
    .toLowerCase();
  const account = String(accountEmail ?? "")
    .trim()
    .toLowerCase();
  if (ndaEmail !== account) {
    return "NDA email must match your account email.";
  }
  return null;
}
