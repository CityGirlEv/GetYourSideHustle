/** Shared password rules for GYSH signup, reset, and admin password sets. */

export const MIN_PASSWORD_LENGTH = 8;

export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

export type PasswordCheck = {
  id: string;
  label: string;
  ok: boolean;
};

export type PasswordAssessment = {
  strength: PasswordStrength;
  score: number;
  checks: PasswordCheck[];
  /** True when password meets the minimum bar to create / change an account password. */
  acceptable: boolean;
  message: string;
};

const SPECIAL_RE = /[^A-Za-z0-9]/;

export function assessPassword(password: string): PasswordAssessment {
  const value = password ?? "";
  const checks: PasswordCheck[] = [
    {
      id: "length",
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      ok: value.length >= MIN_PASSWORD_LENGTH,
    },
    {
      id: "lower",
      label: "One lowercase letter",
      ok: /[a-z]/.test(value),
    },
    {
      id: "upper",
      label: "One uppercase letter",
      ok: /[A-Z]/.test(value),
    },
    {
      id: "number",
      label: "One number",
      ok: /\d/.test(value),
    },
    {
      id: "special",
      label: "One special character (!@#$…)",
      ok: SPECIAL_RE.test(value),
    },
  ];

  if (!value) {
    return {
      strength: "empty",
      score: 0,
      checks,
      acceptable: false,
      message: `Use at least ${MIN_PASSWORD_LENGTH} characters with letters, a number, and an uppercase or special character.`,
    };
  }

  const passed = checks.filter((c) => c.ok).length;
  const hasLetter = checks.find((c) => c.id === "lower")!.ok || checks.find((c) => c.id === "upper")!.ok;
  const hasNumber = checks.find((c) => c.id === "number")!.ok;
  const hasUpperOrSpecial =
    checks.find((c) => c.id === "upper")!.ok || checks.find((c) => c.id === "special")!.ok;
  const longEnough = checks.find((c) => c.id === "length")!.ok;

  const acceptable = longEnough && hasLetter && hasNumber && hasUpperOrSpecial;

  let strength: PasswordStrength = "weak";
  if (acceptable) {
    const allClasses =
      checks.find((c) => c.id === "lower")!.ok &&
      checks.find((c) => c.id === "upper")!.ok &&
      hasNumber &&
      checks.find((c) => c.id === "special")!.ok;
    strength = value.length >= 10 && allClasses ? "strong" : "medium";
  }

  let message = "";
  if (!acceptable) {
    const missing = checks.filter((c) => !c.ok).map((c) => c.label.toLowerCase());
    message = `Password needs: ${missing.join(", ")}.`;
  } else if (strength === "medium") {
    message = "Medium — add length and mix uppercase + special for strong.";
  } else {
    message = "Strong password.";
  }

  return { strength, score: passed, checks, acceptable, message };
}

export function passwordPolicyError(password: string): string | null {
  const a = assessPassword(password);
  if (a.acceptable) return null;
  return a.message || `Password must be at least ${MIN_PASSWORD_LENGTH} characters and medium strength.`;
}

export function passwordsMatch(password: string, confirm: string): boolean {
  return password.length > 0 && password === confirm;
}
