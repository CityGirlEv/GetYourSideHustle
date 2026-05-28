export type TestResultSaver = { role?: string | null } | null | undefined;

export function canSaveTestResults(user: TestResultSaver): boolean {
  return user?.role === "admin" || user?.role === "qa";
}

export function getTestResultSaveBlockReason(user: TestResultSaver): string | null {
  if (canSaveTestResults(user)) return null;
  if (!user) return "Sign in with a QA or admin account to save test results to the database.";
  return "Only QA or admin accounts can save test results to the database.";
}