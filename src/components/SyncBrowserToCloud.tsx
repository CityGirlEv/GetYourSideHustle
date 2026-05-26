import { useState } from "react";
import { Cloud, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { syncLocalToCloud, lastSyncedAt } from "@/lib/cloud-sync";

export function SyncBrowserToCloud() {
  const [busy, setBusy] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(() => lastSyncedAt());

  const onClick = async () => {
    setBusy(true);
    try {
      const r = await syncLocalToCloud();
      setSyncedAt(new Date().toISOString());
      toast.success(`Synced to cloud — ${r.tests} tests, ${r.notes} notes, ${r.tasks} tasks.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {syncedAt && (
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Synced {new Date(syncedAt).toLocaleString()}
        </span>
      )}
      <Button size="sm" variant={syncedAt ? "outline" : "default"} onClick={onClick} disabled={busy}>
        {busy ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> :
          syncedAt ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Cloud className="h-3.5 w-3.5 mr-1.5" />}
        {busy ? "Syncing…" : syncedAt ? "Re-sync this browser" : "Sync this browser to cloud"}
      </Button>
    </div>
  );
}