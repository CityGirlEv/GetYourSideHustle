import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  listStaffEmailHistory,
  sendStaffAssignmentEmails,
  type StaffEmailTemplateGroup,
} from "@/lib/staff-email.functions";
import { ChevronDown, Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";

function formatSentAt(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

type StaffEmailMenuProps = {
  email: string;
  assigneeLabel: string;
  isQa: boolean;
  disabled?: boolean;
  variant?: "icon" | "button";
};

export function StaffEmailMenu({
  email,
  assigneeLabel,
  isQa,
  disabled,
  variant = "icon",
}: StaffEmailMenuProps) {
  const fetchHistory = useServerFn(listStaffEmailHistory);
  const sendEmails = useServerFn(sendStaffAssignmentEmails);
  const [open, setOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [groups, setGroups] = useState<StaffEmailTemplateGroup[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!email) return;
    setLoadingHistory(true);
    try {
      const rows = await fetchHistory({ data: { recipientEmail: email, limit: 50 } });
      setGroups(rows);
      setLoadedFor(email);
    } catch (e) {
      toast.error((e as Error)?.message ?? "Could not load email history");
    } finally {
      setLoadingHistory(false);
    }
  }, [email, fetchHistory]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && loadedFor !== email) void loadHistory();
  };

  const sendAssignmentEmail = async () => {
    if (!isQa) {
      toast.error("Assignment emails are only sent to QA testers");
      return;
    }
    setSending(true);
    try {
      const result = await sendEmails({ data: { assignees: [assigneeLabel] } });
      if (result.sent > 0) {
        toast.success(`Assignment email queued for ${assigneeLabel}`);
        await loadHistory();
      } else {
        toast.error("Email was not queued — check the address or suppression list");
      }
    } catch (e) {
      toast.error((e as Error)?.message ?? "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  if (!email) return null;

  const totalSent = groups.reduce((n, g) => n + g.entries.length, 0);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9"
            disabled={disabled}
            title="Emails sent & send assignment"
          >
            <Mail className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" disabled={disabled}>
            <Mail className="h-3.5 w-3.5" />
            Emails
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs font-normal truncate">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loadingHistory ? (
          <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading history…
          </div>
        ) : groups.length === 0 ? (
          <div className="px-2 py-2 text-xs text-muted-foreground">No emails logged yet.</div>
        ) : (
          groups.map((group) => (
            <DropdownMenuSub key={group.templateName}>
              <DropdownMenuSubTrigger className="text-xs">
                {group.displayName}
                <span className="ml-auto text-muted-foreground">({group.entries.length})</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64 max-h-64 overflow-y-auto">
                {group.entries.map((entry) => (
                  <DropdownMenuItem
                    key={entry.id}
                    className="text-xs flex flex-col items-start gap-0.5 h-auto py-2"
                  >
                    <span className="font-medium capitalize">{entry.status}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatSentAt(entry.created_at)}
                    </span>
                    {entry.error_message && (
                      <span className="text-destructive text-[10px]">{entry.error_message}</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ))
        )}
        {totalSent > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-[10px] text-muted-foreground">
              {totalSent} total logged send(s)
            </div>
          </>
        )}
        {isQa && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs font-semibold text-primary"
              disabled={sending}
              onClick={(e) => {
                e.preventDefault();
                void sendAssignmentEmail();
              }}
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-2" />
              )}
              Send assignment email now
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
