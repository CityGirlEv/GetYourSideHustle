import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Clock, Loader2, LogIn, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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

type LoginFilter = "all" | "logged_in" | "never" | "last_7d" | "last_30d";

const MS_DAY = 86_400_000;

function parseLoginTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatAbsoluteLogin(value: string | null | undefined): string {
  const d = parseLoginTime(value);
  if (!d) return "Never";
  return d.toLocaleString();
}

function formatRelativeLogin(value: string | null | undefined): string {
  const d = parseLoginTime(value);
  if (!d) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
}

function daysSinceLogin(value: string | null | undefined): number | null {
  const d = parseLoginTime(value);
  if (!d) return null;
  return (Date.now() - d.getTime()) / MS_DAY;
}

function matchesLoginFilter(user: LoginReportUser, filter: LoginFilter): boolean {
  const last = parseLoginTime(user.last_sign_in_at);
  switch (filter) {
    case "logged_in":
      return !!last;
    case "never":
      return !last;
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

function compareByLastLogin(a: LoginReportUser, b: LoginReportUser): number {
  const at = parseLoginTime(a.last_sign_in_at)?.getTime() ?? 0;
  const bt = parseLoginTime(b.last_sign_in_at)?.getTime() ?? 0;
  if (at !== bt) return bt - at;
  return (a.full_name || a.email).localeCompare(b.full_name || b.email, undefined, {
    sensitivity: "base",
  });
}

type UserLoginReportProps = {
  users: LoginReportUser[];
  loading?: boolean;
};

export function UserLoginReport({ users, loading }: UserLoginReportProps) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LoginFilter>("all");

  const stats = useMemo(() => {
    let loggedIn = 0;
    let never = 0;
    let last7 = 0;
    let last30 = 0;
    for (const u of users) {
      const days = daysSinceLogin(u.last_sign_in_at);
      if (days === null) {
        never += 1;
      } else {
        loggedIn += 1;
        if (days <= 7) last7 += 1;
        if (days <= 30) last30 += 1;
      }
    }
    return { total: users.length, loggedIn, never, last7, last30 };
  }, [users]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => matchesLoginFilter(u, filter))
      .filter((u) => {
        if (!q) return true;
        const roles = (u.roles ?? [u.role]).join(" ");
        return [u.full_name, u.email, u.role, roles].join(" ").toLowerCase().includes(q);
      })
      .sort(compareByLastLogin);
  }, [users, filter, query]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="glass overflow-hidden mb-6">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <LogIn className="h-4 w-4 text-primary shrink-0" />
              <span className="font-display font-bold">Login activity</span>
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {stats.loggedIn} signed in · {stats.never} never
              </Badge>
            </div>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground pt-3">
              Who has actually signed in, sorted by most recent login. Timestamps come from Supabase
              Auth when a user completes sign-in.
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" className="gap-1 font-normal">
                <Users className="h-3 w-3" />
                {stats.total} accounts
              </Badge>
              <Badge variant="outline" className="gap-1 font-normal text-emerald-700 border-emerald-500/40">
                <LogIn className="h-3 w-3" />
                {stats.loggedIn} logged in at least once
              </Badge>
              <Badge variant="outline" className="gap-1 font-normal">
                <Clock className="h-3 w-3" />
                {stats.last7} in last 7 days
              </Badge>
              <Badge variant="outline" className="gap-1 font-normal">
                <Clock className="h-3 w-3" />
                {stats.last30} in last 30 days
              </Badge>
              <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
                {stats.never} never logged in
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, role…"
                className="h-9 w-full sm:w-56 text-sm"
              />
              <Select value={filter} onValueChange={(v) => setFilter(v as LoginFilter)}>
                <SelectTrigger className="h-9 w-[180px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="logged_in">Has logged in</SelectItem>
                  <SelectItem value="never">Never logged in</SelectItem>
                  <SelectItem value="last_7d">Last 7 days</SelectItem>
                  <SelectItem value="last_30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            <div className="overflow-x-auto rounded-md border border-border/60">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">User</th>
                    <th className="px-3 py-2 font-medium">Roles</th>
                    <th className="px-3 py-2 font-medium">Last login</th>
                    <th className="px-3 py-2 font-medium">When</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Loading login data…
                      </td>
                    </tr>
                  )}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                        No users match this filter.
                      </td>
                    </tr>
                  )}
                  {rows.map((u) => {
                    const roles = u.roles ?? [u.role];
                    const never = !parseLoginTime(u.last_sign_in_at);
                    return (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-3 py-2 align-top">
                          <div className="font-medium">{u.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex flex-wrap gap-1">
                            {roles.map((r) => (
                              <Badge key={r} variant="outline" className="text-[10px] capitalize">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top tabular-nums whitespace-nowrap">
                          {never ? (
                            <span className="text-muted-foreground">Never</span>
                          ) : (
                            formatAbsoluteLogin(u.last_sign_in_at)
                          )}
                        </td>
                        <td className="px-3 py-2 align-top text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeLogin(u.last_sign_in_at)}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex flex-wrap gap-1">
                            {u.disabled && (
                              <Badge variant="destructive" className="text-[10px]">
                                Disabled
                              </Badge>
                            )}
                            {u.email_confirmed === false && (
                              <Badge variant="outline" className="text-[10px]">
                                Email unconfirmed
                              </Badge>
                            )}
                            {!u.disabled && !never && (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-emerald-700 border-emerald-500/40"
                              >
                                Active login
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
