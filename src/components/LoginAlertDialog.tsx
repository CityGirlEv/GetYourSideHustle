import { useEffect, useMemo, useState } from "react";
import { parse, isValid, startOfDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, ExternalLink } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { loadTaskRows, type TaskRow } from "@/lib/tasks-sheet";

const SESSION_KEY = "login-alert:shown:v1";

function parseDue(d: string): Date | null {
  if (!d) return null;
  const p = parse(d, "MM/dd/yy", new Date());
  return isValid(p) ? startOfDay(p) : null;
}

function matchesUser(row: TaskRow, fullName: string, role: string): boolean {
  if (role === "admin") {
    // Admin sees all unfinished critical items.
    return true;
  }
  if (!fullName) return false;
  const first = fullName.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  const assignee = row.assignedTo.trim().toLowerCase();
  return !!first && (assignee === first || assignee === fullName.trim().toLowerCase());
}

export function LoginAlertDialog() {
  const { user, authLoading } = useApp();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<TaskRow[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (typeof window === "undefined") return;
    const key = `${SESSION_KEY}:${user.id}`;
    if (sessionStorage.getItem(key) === "1") return;
    setRows(loadTaskRows());
    sessionStorage.setItem(key, "1");
    // Defer open so it doesn't fight initial route paint.
    const t = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(t);
  }, [user, authLoading]);

  const items = useMemo(() => {
    if (!user) return [];
    const today = startOfDay(new Date());
    return rows
      .filter((r) => r.status !== "done")
      .filter((r) => matchesUser(r, user.full_name, user.role))
      .map((r) => {
        const due = parseDue(r.dueDate);
        const pastDue = due ? due.getTime() < today.getTime() : false;
        const highPriority = r.priority === "P0" || r.priority === "P1";
        return { row: r, due, pastDue, highPriority };
      })
      .filter((x) => x.pastDue || x.highPriority)
      .sort((a, b) => {
        // Past due first, then by priority, then by due date.
        if (a.pastDue !== b.pastDue) return a.pastDue ? -1 : 1;
        if (a.row.priority !== b.row.priority) return a.row.priority.localeCompare(b.row.priority);
        const at = a.due?.getTime() ?? Infinity;
        const bt = b.due?.getTime() ?? Infinity;
        return at - bt;
      })
      .slice(0, 25);
  }, [rows, user]);

  if (!user || items.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Items that need your attention
          </DialogTitle>
          <DialogDescription>
            {items.length} open {items.length === 1 ? "item" : "items"} assigned to{" "}
            {user.role === "admin" ? "the team" : user.full_name.split(/\s+/)[0]} that are past due
            or marked high priority.
          </DialogDescription>
        </DialogHeader>

        <ul className="divide-y rounded-md border max-h-[55vh] overflow-y-auto">
          {items.map(({ row, pastDue }) => {
            const to = row.path && row.path.length > 0 ? row.path : "/tasks";
            const isExternal = /^https?:\/\//.test(to);
            const content = (
              <div className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col gap-1 shrink-0">
                  <Badge
                    variant="outline"
                    className={
                      row.priority === "P0"
                        ? "border-destructive/60 text-destructive"
                        : row.priority === "P1"
                          ? "border-amber-500/60 text-amber-600"
                          : "border-muted-foreground/40 text-muted-foreground"
                    }
                  >
                    {row.priority}
                  </Badge>
                  {pastDue && (
                    <Badge
                      variant="outline"
                      className="border-destructive/60 text-destructive gap-1"
                    >
                      <Clock className="h-3 w-3" /> Past due
                    </Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {row.id} · {row.description || "(untitled task)"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Assigned to {row.assignedTo || "—"}
                    {row.dueDate ? ` · due ${row.dueDate}` : ""}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            );
            return (
              <li key={row.id}>
                <a
                  href={to}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {content}
                </a>
              </li>
            );
          })}
        </ul>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button asChild variant="outline">
            <a href="/tasks" onClick={() => setOpen(false)}>
              Open task sheet
            </a>
          </Button>
          <Button onClick={() => setOpen(false)}>Dismiss</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
