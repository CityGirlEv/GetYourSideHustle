import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { History, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  listContentDispatchLogAdmin,
  listContentDraftVersionsAdmin,
} from "@/lib/content-factory.functions";
import type { ContentDispatchChannel } from "@/lib/content-factory/dispatch-log";

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "sent" || status === "queued") return "default";
  if (status === "failed") return "destructive";
  if (status === "pending") return "secondary";
  return "outline";
}

export function ContentDispatchLogPanel({
  channel,
  draftId,
  batchId,
  title = "Outbound dispatch log",
  description = "Newsletters, scheduled posts, and publishes. Body hash changes when template text changes.",
}: {
  channel?: ContentDispatchChannel;
  draftId?: string;
  batchId?: string;
  title?: string;
  description?: string;
}) {
  const listLog = useServerFn(listContentDispatchLogAdmin);
  const listVersions = useServerFn(listContentDraftVersionsAdmin);

  const logQuery = useQuery({
    queryKey: ["content-dispatch-log", channel, draftId, batchId],
    queryFn: () =>
      listLog({
        data: {
          limit: 50,
          channel,
          draftId,
          batchId,
        },
      }),
    refetchInterval: 15_000,
  });

  const versionsQuery = useQuery({
    queryKey: ["content-draft-versions", draftId],
    queryFn: () => listVersions({ data: { draftId: draftId! } }),
    enabled: Boolean(draftId),
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-4">
      <Card className="glass p-4 space-y-3 border-border/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4" />
            {title}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => logQuery.refetch()}
            disabled={logQuery.isFetching}
          >
            {logQuery.isFetching ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>

        {logQuery.isLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading…
          </div>
        ) : !logQuery.data?.length ? (
          <div className="text-xs text-muted-foreground">No dispatches recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3 font-medium">When</th>
                  <th className="py-2 pr-3 font-medium">Kind</th>
                  <th className="py-2 pr-3 font-medium">Subject</th>
                  <th className="py-2 pr-3 font-medium">Recipient</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Body hash</th>
                  <th className="py-2 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {logQuery.data.map((row) => (
                  <tr key={row.id} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 text-xs capitalize">{row.dispatchKind}</td>
                    <td className="py-2 pr-3 text-xs">{row.subject}</td>
                    <td className="py-2 pr-3 text-xs break-all">{row.recipient ?? "—"}</td>
                    <td className="py-2 pr-3">
                      <Badge variant={statusBadgeVariant(row.status)} className="capitalize text-[10px]">
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 font-mono text-[10px] text-muted-foreground">
                      {row.bodyHash ?? "—"}
                    </td>
                    <td className="py-2 text-xs text-destructive break-all">
                      {row.errorMessage ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {draftId ? (
        <Card className="glass p-4 space-y-3 border-border/80">
          <div className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4" />
            Template change history
          </div>
          <p className="text-xs text-muted-foreground">
            Saved edits to this draft. Compare body hash in the dispatch log above to see which version was sent.
          </p>
          {versionsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading…
            </div>
          ) : !versionsQuery.data?.length ? (
            <div className="text-xs text-muted-foreground">No edits saved yet.</div>
          ) : (
            <div className="space-y-2">
              {versionsQuery.data.map((version) => (
                <div key={version.id} className="rounded-md border border-border/70 p-2.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{version.snapshot.title ?? "Untitled draft"}</span>
                    <span className="text-muted-foreground">
                      {new Date(version.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 line-clamp-2">
                    {version.snapshot.excerpt ?? version.snapshot.body?.slice(0, 120)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
