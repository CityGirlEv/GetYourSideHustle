export type LoginReportUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  roles: string[];
  disabled?: boolean;
  email_confirmed?: boolean;
  last_sign_in_at?: string | null;
};

export type LoginFilter = "all" | "logged_in" | "never" | "last_1d" | "last_7d" | "last_30d";

const MS_DAY = 86_400_000;

export function parseLoginTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function daysSinceLogin(value: string | null | undefined): number | null {
  const d = parseLoginTime(value);
  if (!d) return null;
  return (Date.now() - d.getTime()) / MS_DAY;
}

export function matchesLoginFilter(user: LoginReportUser, filter: LoginFilter): boolean {
  const last = parseLoginTime(user.last_sign_in_at);
  switch (filter) {
    case "logged_in":
      return !!last;
    case "never":
      return !last;
    case "last_1d": {
      const days = daysSinceLogin(user.last_sign_in_at);
      return days !== null && days <= 1;
    }
    case "last_7d": {
      const days = daysSinceLogin(user.last_sign_in_at);
      return days !== null && days <= 7;
    }
    case "last_30d": {
      const days = daysSinceLogin(user.last_sign_in_at);
      return days !== null && days <= 30;
    }
    default:
      return true;
  }
}

export function compareUsersByLastLogin(a: LoginReportUser, b: LoginReportUser): number {
  const at = parseLoginTime(a.last_sign_in_at)?.getTime() ?? 0;
  const bt = parseLoginTime(b.last_sign_in_at)?.getTime() ?? 0;
  if (at !== bt) return bt - at;
  return (a.full_name || a.email).localeCompare(b.full_name || b.email, undefined, {
    sensitivity: "base",
  });
}

export function loginReportStats(users: LoginReportUser[]) {
  let loggedIn = 0;
  let never = 0;
  let last1 = 0;
  let last7 = 0;
  let last30 = 0;
  for (const u of users) {
    const days = daysSinceLogin(u.last_sign_in_at);
    if (days === null) {
      never += 1;
    } else {
      loggedIn += 1;
      if (days <= 1) last1 += 1;
      if (days <= 7) last7 += 1;
      if (days <= 30) last30 += 1;
    }
  }
  return { total: users.length, loggedIn, never, last1, last7, last30 };
}

export const LOGIN_FILTER_LABELS: Record<LoginFilter, string> = {
  all: "All users",
  logged_in: "Has logged in",
  never: "Never logged in",
  last_1d: "Last 1 day",
  last_7d: "Last 7 days",
  last_30d: "Last 30 days",
};
