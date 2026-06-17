import { useEffect, useState, useCallback, useId } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Notif = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export function AdminNotificationsBell({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const instanceId = useId().replace(/:/g, "");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setItems(data as Notif[]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void load();

    const channel = supabase
      .channel(`admin_notifications:${instanceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_notifications" }, () => {
        if (!cancelled) void load();
      })
      .subscribe();

    const t = setInterval(() => {
      if (!cancelled) void load();
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(t);
      void supabase.removeChannel(channel);
    };
  }, [instanceId, load]);

  const unread = items.filter((n) => !n.read_at).length;

  const markRead = async (id: string) => {
    const { error } = await supabase
      .from("admin_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const markAllRead = async () => {
    const ids = items.filter((n) => !n.read_at).map((n) => n.id);
    if (ids.length === 0) return;
    const { error } = await supabase
      .from("admin_notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("admin_notifications").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const onDark = tone === "dark";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant={onDark ? "ghost" : "outline"}
          className={
            onDark
              ? "relative h-7 gap-1 px-1.5 text-white/90 hover:text-white hover:bg-white/10"
              : "relative gap-1"
          }
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[70vh] overflow-y-auto p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="text-sm font-semibold">Admin notifications</div>
          <Button
            size="sm"
            variant="ghost"
            onClick={markAllRead}
            disabled={unread === 0}
            className="h-7 text-xs"
          >
            Mark all read
          </Button>
        </div>
        {items.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet.</div>
        )}
        <ul className="divide-y">
          {items.map((n) => (
            <li key={n.id} className={`px-3 py-2 text-sm ${!n.read_at ? "bg-primary/5" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{n.title}</div>
                  {n.body && (
                    <div className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">
                      {n.body}
                    </div>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.read_at && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => markRead(n.id)}
                      title="Mark read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => remove(n.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
