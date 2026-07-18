import { useMemo, useState, type ReactNode } from "react";
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
import {
  compareUsersByLastLogin,
  LOGIN_FILTER_LABELS,
  loginReportStats,
  matchesLoginFilter,
  parseLoginTime,
  type LoginFilter,
  type LoginReportUser,
} from "@/lib/user-login-report-filters";

export type { LoginReportUser };

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

function FilterBubble({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-normal transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary font-semibold ring-1 ring-primary/25"
          : "border-border bg-background hover:bg-muted/60",
        className,
      )}
    >
      {children}
    </button>
  );
}

type UserLoginReportProps = {
  users: LoginReportUser[];
  loading?: boolean;
};

export function UserLoginReport({ users, loading }: UserLoginReportProps) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LoginFilter>("all");

  const setFilterOrClear = (next: LoginFilter) => {
    setFilter((current) => (current === next ? "all" : next));
  };

  const stats = useMemo(() => loginReportStats(users), [users]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => matchesLoginFilter(u, filter))
      .filter((u) => {
        if (!q) return true;
        const roles = (u.roles ?? [u.role]).join(" ");
        return [u.full_name, u.email, u.role, roles].join(" ").toLowerCase().includes(q);
      })
      .sort(compareUsersByLastLogin);
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
              Who has actually signed in, sorted by most recent login. Click a bubble to filter the
              table — click again to clear. Timestamps come from Supabase Auth when a user completes
              sign-in.
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <FilterBubble active={filter === "all"} onClick={() => setFilterOrClear("all")}>
                <Users className="h-3 w-3" />
                {stats.total} accounts
              </FilterBubble>
              <FilterBubble
                active={filter === "logged_in"}
                onClick={() => setFilterOrClear("logged_in")}
                className="text-emerald-700 border-emerald-500/40 data-[active]:text-emerald-800"
              >
                <LogIn className="h-3 w-3" />
                {stats.loggedIn} logged in at least once
              </FilterBubble>
              <FilterBubble
                active={filter === "last_1d"}
                onClick={() => setFilterOrClear("last_1d")}
              >
                <Clock className="h-3 w-3" />
                {stats.last1} in last 1 day
              </FilterBubble>
              <FilterBubble
                active={filter === "last_7d"}
                onClick={() => setFilterOrClear("last_7d")}
              >
                <Clock className="h-3 w-3" />
                {stats.last7} in last 7 days
              </FilterBubble>
              <FilterBubble
                active={filter === "last_30d"}
                onClick={() => setFilterOrClear("last_30d")}
              >
                <Clock className="h-3 w-3" />
                {stats.last30} in last 30 days
              </FilterBubble>
              <FilterBubble
                active={filter === "never"}
                onClick={() => setFilterOrClear("never")}
                className="text-muted-foreground"
              >
                {stats.never} never logged in
              </FilterBubble>
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
                  {(Object.keys(LOGIN_FILTER_LABELS) as LoginFilter[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {LOGIN_FILTER_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filter !== "all" && (
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="text-xs text-primary hover:text-primary/80 underline-offset-2 hover:underline"
                >
                  Clear filter
                </button>
              )}
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
